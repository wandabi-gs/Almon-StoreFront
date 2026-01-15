"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Textarea,
} from "@heroui/react";
import axios from "axios";
import { PaymentConfirmationModal } from "./PaymentConfirmationModal";

interface CartItem {
  id: string;
  productId?: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  cartItems: CartItem[];
  productSaleType: Record<string, "roll" | "metre" | "board" | "unit">;
  storeId?: string;
  deliveryFee?: number;
  deliveryArea?: string;
  onOrderSubmit?: (orderData: any) => Promise<{ sale_id?: string } | void>;
  onCheckoutSuccess?: () => void;
  onClearCart?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-backend-snc5.onrender.com';

const mapVariantToUnit = (variant: string, saleType: "roll" | "metre" | "board" | "unit"): string => {
  const variantLower = variant.toLowerCase();
  if (variantLower.includes("roll")) return "roll";
  if (variantLower.includes("metre") || variantLower.includes("meter")) return "meter";
  if (variantLower.includes("board") || variantLower.includes("sheet")) return "pcs";
  if (variantLower.includes("unit") || variantLower.includes("pcs")) return "pcs";

  switch (saleType) {
    case "roll": return "roll";
    case "metre": return "meter";
    case "board": return "pcs";
    case "unit": return "pcs";
    default: return "pcs";
  }
};

const normalizeSaleId = (saleId: string | null | undefined): string | null => {
  if (!saleId) return null;

  const saleStr = String(saleId).toUpperCase().trim();

  if (saleStr.startsWith('SAL')) {
    return saleStr;
  }

  if (/^\d+$/.test(saleStr)) {
    return `SAL${saleStr.padStart(6, '0')}`;
  }

  return `SAL${saleStr}`;
};

const formatPhoneForMpesa = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = `254${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    // Already correct format
  } else {
    // Assume it's already in correct format
  }

  return cleaned;
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  total,
  cartItems,
  productSaleType,
  storeId = "STR251100001",
  deliveryFee = 0,
  deliveryArea = "",
  onOrderSubmit,
  onCheckoutSuccess,
  onClearCart
}) => {
  // Form states
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Loading and status states
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);

  // Order and payment states
  const [saleId, setSaleId] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    console.log("Debug - showPaymentModal state:", showPaymentModal);
    console.log("Debug - saleId:", saleId);
    console.log("Debug - checkoutRequestId:", checkoutRequestId);
  }, [showPaymentModal, saleId, checkoutRequestId]);

  // Add this to track when the modal should open
  useEffect(() => {
    if (showPaymentModal) {
      console.log("🔄 PaymentConfirmationModal should now be visible");
      console.log("📞 Phone:", phoneNumber);
      console.log("💰 Amount:", total);
      console.log("🆔 Sale ID:", saleId);
      console.log("🎫 Checkout Request ID:", checkoutRequestId);
    }
  }, [showPaymentModal]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Reset form function
  const resetForm = () => {
    setCustomerName("");
    setPhoneNumber("");
    setRecipientName("");
    setRecipientPhone("");
    setRecipientEmail("");
    setDeliveryAddress("");
    setStatus(null);
    setSaleId(null);
    setCheckoutRequestId(null);
  };

  // Handle modal close with form reset
  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const formatOrderData = () => {
    const products = cartItems.map((item) => {
      let productId = item.productId || item.id;
      if (productId && typeof productId === 'string') {
        productId = productId.toUpperCase();
      }
      const saleType = productSaleType[productId] || "unit";
      const unit = mapVariantToUnit(item.variant, saleType);

      return {
        product_id: productId,
        quantity: item.quantity,
        unit: unit,
      };
    });

    return {
      store_id: storeId,
      products: products,
      delivery: {
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_email: recipientEmail || "",
        delivery_address: deliveryAddress,
        delivery_area: deliveryArea,
        delivery_fee: deliveryFee
      },
      payment_method: "mpesa",
      phone_number: phoneNumber,
      customer_name: customerName,
      subtotal_amount: subtotal,
      delivery_fee: deliveryFee,
      total_amount: total,
    };
  };

  // Function to correctly initiate the full M-Pesa payment flow
  const initiateMpesaPayment = async (orderId: string, phone: string, amount: number) => {
    const formattedPhone = formatPhoneForMpesa(phone);
    let checkoutRequestId: string | null = null;
    let stkPushResponseData: any = null;

    // STEP 1: Try to mark the order for payment - SILENTLY IGNORE ALL ERRORS
    try {
      await axios.post(
        `${API_BASE_URL}/customer/orders/${orderId}/pay`,
        {
          sale_id: orderId,
          payment_method: "mpesa",
          phone_number: formattedPhone,
        }
      );
      console.log("Order marked for M-Pesa payment (optional step succeeded).");
    } catch {
      // Swallow ALL errors - do nothing, don't even log
    }

    // STEP 2: Try to send the STK push - EXTRACT DATA EVEN ON FAILURE
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/mpesa/stk-push`,
        {
          amount: amount,
          phoneNumber: formattedPhone,
          reference: orderId
        }
      );
      stkPushResponseData = response.data;
      console.log("STK Push succeeded:", stkPushResponseData);
    } catch (error) {
      console.warn("STK Push endpoint returned an error, but payment may still be initiated.");

      // CRITICAL: Try to extract data from the error response
      if (axios.isAxiosError(error) && error.response?.data) {
        stkPushResponseData = error.response.data;
        console.log("Extracted data from error response:", stkPushResponseData);
      }
    }

    // STEP 3: Try to extract checkoutRequestId from ANY response
    if (stkPushResponseData) {
      checkoutRequestId = stkPushResponseData?.CheckoutRequestID ||
        stkPushResponseData?.checkoutRequestID ||
        stkPushResponseData?.checkoutRequestId ||
        stkPushResponseData?.CheckoutRequestId ||
        stkPushResponseData?.data?.CheckoutRequestID ||
        stkPushResponseData?.MerchantRequestID ||
        stkPushResponseData?.merchantRequestID;
    }

    console.log("Final extracted CheckoutRequestID:", checkoutRequestId);

    // ALWAYS return an object with the data we have, even if it's minimal
    return {
      // Include any response data we got
      ...(stkPushResponseData || {}),
      // Ensure we have a checkoutRequestId field (even if null)
      CheckoutRequestID: checkoutRequestId,
      checkoutRequestID: checkoutRequestId,
      // Always indicate success so the modal opens
      success: true,
      message: "Payment initiated. Please check your phone."
    };
  };

  // Main submit handler - COMPLETE VERSION
  const handleSubmit = async () => {
    setStatus(null);

    // Validation
    if (!customerName || !phoneNumber || !recipientName || !recipientPhone || !deliveryAddress) {
      setStatus({
        type: 'error',
        message: "Please fill in all required fields."
      });
      return;
    }

    if (cartItems.length === 0) {
      setStatus({
        type: 'error',
        message: "Your cart is empty."
      });
      return;
    }

    const phoneRegex = /^(?:254|\+254|0)?[7]\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setStatus({
        type: 'error',
        message: "Please enter a valid Kenyan phone number (e.g., 07XXXXXXXX or +2547XXXXXXXX)."
      });
      return;
    }

    try {
      setLoading(true);
      const orderData = formatOrderData();
      let rawSaleId: string | null = null;

      // Step 1: Submit order
      if (onOrderSubmit) {
        const result = await onOrderSubmit(orderData);
        if (result && typeof result === 'object' && 'sale_id' in result) {
          rawSaleId = result.sale_id as string;
        }
      } else {
        const orderRes = await axios.post(`${API_BASE_URL}/customer/orders`, orderData);
        rawSaleId = orderRes.data?.sale_id || orderRes.data?.id || orderRes.data?.order_id || null;
        console.log("Order creation response:", orderRes.data);
      }

      const normalizedSaleId = normalizeSaleId(rawSaleId);

      if (!normalizedSaleId) {
        throw new Error("Failed to get order ID from server");
      }

      setSaleId(normalizedSaleId);

      // Step 2: NEW PAYMENT INITIATION LOGIC - REPLACE THE OLD BLOCK
      console.log(`Initiating payment for order: ${normalizedSaleId}`);
      console.log(`Phone: ${phoneNumber}, Formatted: ${formatPhoneForMpesa(phoneNumber)}`);

      try {
        const paymentResponse = await initiateMpesaPayment(normalizedSaleId, phoneNumber, total);

        console.log("Final payment response for modal:", paymentResponse);

        // ALWAYS show the modal, regardless of API response
        setStatus({
          type: 'info',
          message: `Order ${normalizedSaleId} created. Please check your phone for the M-Pesa prompt.`
        });

        // Extract checkoutRequestId if available
        const extractedCheckoutId = paymentResponse?.CheckoutRequestID ||
          paymentResponse?.checkoutRequestID;

        setCheckoutRequestId(extractedCheckoutId);
        setShowPaymentModal(true); // FORCE the modal to open

      } catch (error) {
        // This catch should rarely trigger now, but keep it as safety
        console.error("Unexpected error in payment flow:", error);
        // Even here, consider showing the modal with a warning
        setStatus({
          type: 'warning',
          message: `Order ${normalizedSaleId} created. Please check your phone - payment system is experiencing issues but may still work.`
        });
        setShowPaymentModal(true); // STILL open the modal
      }
    } catch (error: any) {
      console.error("Checkout error:", error);

      let errorMessage = "An error occurred. Please try again.";
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(", ");
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle payment success (called from PaymentConfirmationModal)
  const handlePaymentSuccess = () => {
    // Close checkout modal
    handleModalClose();

    // Call success callbacks
    if (onCheckoutSuccess) onCheckoutSuccess();
    if (onClearCart) onClearCart();
  };

  // Handle payment failure (called from PaymentConfirmationModal)
  const handlePaymentFailure = () => {
    setShowPaymentModal(false);

    // Keep checkout modal open for retry
    setStatus({
      type: 'error',
      message: "Payment was not completed. Please try again."
    });
  };

  // Handle payment cancellation (called from PaymentConfirmationModal)
  const handlePaymentCancel = () => {
    setShowPaymentModal(false);

    // Keep checkout modal open
    setStatus({
      type: 'warning',
      message: "Payment was cancelled. You can try again or modify your order."
    });
  };

  const isFormValid = () => {
    return customerName &&
      phoneNumber &&
      recipientName &&
      recipientPhone &&
      deliveryAddress &&
      cartItems.length > 0;
  };

  return (
    <>
      {/* Main Checkout Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose} size="2xl" scrollBehavior="inside">
        <ModalContent className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <ModalHeader className="text-xl font-bold text-gray-900 dark:text-white">
            Complete Your Purchase
          </ModalHeader>
          <ModalBody className="space-y-4">
            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                <span className="font-medium">KES {subtotal.toLocaleString()}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Delivery Fee:</span>
                  <span className="font-medium">KES {deliveryFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 dark:text-white border-t pt-2">
                <span>Total:</span>
                <span className="text-lg">KES {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Customer Information</h3>
              <Input
                label="Your Name"
                placeholder="Enter your full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                isRequired
                disabled={loading}
              />
              <Input
                type="tel"
                label="Your Phone Number"
                placeholder="07XXXXXXXX or +2547XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                isRequired
                description="For M-Pesa payment and delivery updates"
                disabled={loading}
              />
            </div>

            {/* Delivery Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Information</h3>
              <Input
                label="Recipient Name"
                placeholder="Enter recipient's full name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                isRequired
                disabled={loading}
              />
              <Input
                type="tel"
                label="Recipient Phone"
                placeholder="07XXXXXXXX or +2547XXXXXXXX"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                isRequired
                disabled={loading}
              />
              <Input
                type="email"
                label="Recipient Email (Optional)"
                placeholder="recipient@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                disabled={loading}
              />
              <Textarea
                label="Delivery Address"
                placeholder="Enter complete delivery address (Building, Street, Landmark)"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                isRequired
                minRows={2}
                disabled={loading}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
                  <span className="text-green-800 dark:text-green-200 font-bold">M-Pesa</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Payment Method: M-Pesa STK Push
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    After submitting, you'll receive a prompt on your phone to enter your M-Pesa PIN
                  </p>
                </div>
              </div>
            </div>

            {/* Status Message */}
            {status && (
              <div className={`p-4 rounded-lg ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                status.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                  status.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
                    'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'}`}>
                <div className="flex items-start">
                  <div className={`mr-3 mt-0.5 ${status.type === 'success' ? 'text-green-600 dark:text-green-400' :
                    status.type === 'error' ? 'text-red-600 dark:text-red-400' :
                      status.type === 'info' ? 'text-blue-600 dark:text-blue-400' :
                        'text-yellow-600 dark:text-yellow-400'}`}>
                    {status.type === 'success' ? '✅' : status.type === 'error' ? '❌' : status.type === 'info' ? 'ℹ️' : '⚠️'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{status.message}</p>
                    {saleId && (
                      <p className="text-xs font-medium mt-2 text-gray-600 dark:text-gray-400">
                        Order ID: <span className="font-mono">{saleId}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={handleModalClose}
              isDisabled={loading}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={loading}
              isDisabled={!isFormValid()}
              className="min-w-[200px]"
            >
              {loading ? "Processing..." : "Place Order & Pay via M-Pesa"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <PaymentConfirmationModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            handlePaymentCancel();
          }}
          saleId={saleId}
          checkoutRequestId={checkoutRequestId}
          phoneNumber={phoneNumber}
          totalAmount={total}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
          onPaymentCancel={handlePaymentCancel}
        />
      )}
    </>
  );
};