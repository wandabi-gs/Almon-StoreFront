"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Textarea } from "@heroui/react";
import axios from "axios";

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
  total: number;  // This should be subtotal + delivery fee
  cartItems: CartItem[];
  productSaleType: Record<string, "roll" | "metre" | "board" | "unit">;
  storeId?: string;
  deliveryFee?: number;  // Add this prop
  deliveryArea?: string; // Add this prop
  onOrderSubmit?: (orderData: any) => Promise<{ sale_id?: string } | void>;
}

// API base URL - configure this properly
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-backend-snc5.onrender.com';

// Map variant names to API unit format
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

// Helper function to ensure sale_id starts with "SAL"
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

// Format phone number for M-Pesa
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
  storeId = "STR251100001", // Changed default to match storefront
  deliveryFee = 0,
  deliveryArea = "",
  onOrderSubmit
}) => {
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod] = useState("mpesa");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);

  // Calculate subtotal from cart items
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const formatOrderData = () => {
    const products = cartItems.map((item) => {
      // Use productId if available, otherwise use the id
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
      payment_method: paymentMethod,
      phone_number: phoneNumber,
      customer_name: customerName,
      subtotal_amount: subtotal,
      delivery_fee: deliveryFee,
      total_amount: total,
    };
  };

  const handleSubmit = async () => {
    // Reset status
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

    // Phone validation
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
      let saleId: string | null = null;

      // Step 1: Submit order
      if (onOrderSubmit) {
        const result = await onOrderSubmit(orderData);
        if (result && typeof result === 'object' && 'sale_id' in result) {
          saleId = normalizeSaleId(result.sale_id as string);
        }
      } else {
        try {
          const orderRes = await axios.post(`${API_BASE_URL}/customer/orders`, orderData);
          const rawSaleId = orderRes.data?.sale_id || orderRes.data?.id || orderRes.data?.order_id || null;
          saleId = normalizeSaleId(rawSaleId);

          setStatus({
            type: 'success',
            message: "Order submitted successfully! Processing payment..."
          });
        } catch (orderError: any) {
          console.error("Order submission error:", orderError);

          let errorMessage = "Order submission failed. Please try again.";
          if (orderError.response?.data?.message) {
            if (Array.isArray(orderError.response.data.message)) {
              errorMessage = orderError.response.data.message.join(", ");
            } else {
              errorMessage = orderError.response.data.message;
            }
          }

          throw new Error(errorMessage);
        }
      }

      // Step 2: Process payment if we have a sale ID
      if (saleId) {
        try {
          const formattedPhone = formatPhoneForMpesa(phoneNumber);

          // Initiate STK push
          const stkRes = await axios.post(`${API_BASE_URL}/api/stk`, {
            phone: formattedPhone,
            amount: total,
            sale_id: saleId,
            account_reference: saleId
          });

          if (stkRes.data.success || stkRes.data.ResponseCode === '0') {
            setStatus({
              type: 'success',
              message: `Payment initiated successfully! Check your phone ${formattedPhone} to complete payment. Order ID: ${saleId}`
            });

            // Close modal after delay
            setTimeout(() => {
              onClose();
              // Reset form
              setCustomerName("");
              setPhoneNumber("");
              setRecipientName("");
              setRecipientPhone("");
              setRecipientEmail("");
              setDeliveryAddress("");
              setStatus(null);
            }, 5000);
          } else {
            throw new Error(stkRes.data.errorMessage || "STK push failed");
          }
        } catch (error: any) {
          console.error("Payment error:", error);

          setStatus({
            type: 'error',
            message: `Payment initiation failed. Please contact support with order ID: ${saleId}. Error: ${error.message}`
          });
        }
      } else {
        setStatus({
          type: 'warning',
          message: "Order created but no sale ID received. Please contact support."
        });
      }
    } catch (error: any) {
      console.error("Checkout error:", error);

      setStatus({
        type: 'error',
        message: error.message || "An unexpected error occurred. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
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
              <span>KES {total.toLocaleString()}</span>
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
            />
            <Input
              type="tel"
              label="Your Phone Number"
              placeholder="07XXXXXXXX or +2547XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              isRequired
              description="For M-Pesa payment and delivery updates"
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
            />
            <Input
              type="tel"
              label="Recipient Phone"
              placeholder="07XXXXXXXX or +2547XXXXXXXX"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              isRequired
            />
            <Input
              type="email"
              label="Recipient Email (Optional)"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <Textarea
              label="Delivery Address"
              placeholder="Enter complete delivery address (Building, Street, Landmark)"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              isRequired
              minRows={2}
            />
          </div>

          {/* Payment Method - Fixed to M-Pesa */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Payment Method: M-Pesa
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              You will receive an M-Pesa STK push notification to complete payment
            </p>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`p-3 rounded-lg ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
              status.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'}`}>
              <p className="text-sm">{status.message}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
            disabled={!customerName || !phoneNumber || !recipientName || !recipientPhone || !deliveryAddress || cartItems.length === 0}
          >
            Place Order & Pay via M-Pesa
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};