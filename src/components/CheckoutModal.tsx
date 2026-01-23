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
  Divider,
  Badge,
  Card,
  CardBody,
} from "@heroui/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentConfirmationModal } from "./PaymentConfirmationModal";
import {
  CreditCardIcon,
  UserCircleIcon,
  PhoneIcon,
  MapPinIcon,
  TruckIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface CartItem {
  id: string;
  productId?: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
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
  cartItems,
  productSaleType,
  storeId = "STR251100001",
  deliveryFee = 0,
  deliveryArea = "",
  onOrderSubmit,
  onCheckoutSuccess,
  onClearCart
}) => {
  // Form states (only required fields)
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Loading and status states
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Order and payment states
  const [saleId, setSaleId] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeStep, setActiveStep] = useState<'details' | 'review' | 'payment'>('details');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vat = subtotal * 0.16;
  const grandTotal = subtotal + vat + deliveryFee;

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev && prev <= 1) {
            clearInterval(interval);
            handleModalClose();
            if (onCheckoutSuccess) onCheckoutSuccess();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, onCheckoutSuccess]);

  // Reset form function
  const resetForm = () => {
    setCustomerName("");
    setPhoneNumber("");
    setRecipientName("");
    setRecipientPhone("");
    setDeliveryAddress("");
    setStatus(null);
    setSaleId(null);
    setCheckoutRequestId(null);
    setActiveStep('details');
    setCountdown(null);
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
        recipient_email: "",
        delivery_address: deliveryAddress,
        delivery_area: deliveryArea,
        delivery_fee: deliveryFee
      },
      enterprise_info: {
        company_name: "",
        po_number: "",
        special_notes: ""
      },
      payment_method: "mpesa",
      phone_number: phoneNumber,
      customer_name: customerName,
      subtotal_amount: subtotal,
      vat_amount: vat,
      delivery_fee: deliveryFee,
      total_amount: grandTotal,
    };
  };

  // Check if order already exists with completed payment
  const checkExistingOrder = async (orderId: string): Promise<{ exists: boolean; data?: any; hasCompletedPayment?: boolean }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/orders/${orderId}`);
      const orderData = response.data;
      console.log("Existing order check response:", orderData);

      // Check if order has completed payments
      const hasCompletedPayment = orderData.payments?.some((payment: any) =>
        payment.status === 'completed' || payment.status === 'paid'
      );

      return {
        exists: true,
        data: orderData,
        hasCompletedPayment
      };
    } catch (error: any) {
      console.log("Order check error:", error.response?.status, error.response?.data || error.message);
      if (error.response?.status === 404) {
        return { exists: false };
      }
      return { exists: false };
    }
  };

  const initiateMpesaPayment = async (orderId: string, phone: string, amount: number) => {
    const formattedPhone = formatPhoneForMpesa(phone);
    let checkoutRequestId: string | null = null;
    let stkPushResponseData: any = null;

    // First, check if order already has completed payment
    const existingOrder = await checkExistingOrder(orderId);

    if (existingOrder.exists && existingOrder.hasCompletedPayment) {
      const completedPayment = existingOrder.data.payments?.find((p: any) =>
        p.status === 'completed' || p.status === 'paid'
      );

      if (completedPayment) {
        // Order already has completed payment - don't initiate new one
        return {
          alreadyPaid: true,
          checkoutRequestID: completedPayment.mpesa_checkout_request_id,
          mpesaReceiptNumber: completedPayment.mpesa_receipt_number,
          message: "Payment already completed"
        };
      }
    }

    // Use the correct endpoint for STK push
    try {
      console.log("Initiating STK push via:", `${API_BASE_URL}/customer/orders/${orderId}/pay`);

      const requestData = {
        sale_id: orderId,
        payment_method: "mpesa",
        phone_number: formattedPhone,
        amount: amount
      };

      console.log("Request data:", requestData);

      const response = await axios.post(
        `${API_BASE_URL}/customer/orders/${orderId}/pay`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000
        }
      );

      stkPushResponseData = response.data;
      console.log("STK Push Response:", stkPushResponseData);

      // Extract checkoutRequestId from the response
      checkoutRequestId =
        stkPushResponseData?.CheckoutRequestID ||
        stkPushResponseData?.checkoutRequestID ||
        stkPushResponseData?.checkoutRequestId ||
        stkPushResponseData?.data?.CheckoutRequestID ||
        stkPushResponseData?.MerchantRequestID ||
        stkPushResponseData?.merchantRequestID ||
        stkPushResponseData?.request_id ||
        stkPushResponseData?.checkout_request_id ||
        stkPushResponseData?.mpesa_checkout_request_id;

      // If we can't find checkoutRequestId, check if maybe the payment is already completed
      if (!checkoutRequestId) {
        console.warn("No checkoutRequestId found in response. Checking if payment is already complete...");

        // Check if the response indicates payment is already done
        if (stkPushResponseData?.mpesa_receipt_number || stkPushResponseData?.receipt_number) {
          return {
            alreadyPaid: true,
            checkoutRequestID: stkPushResponseData?.mpesa_checkout_request_id,
            mpesaReceiptNumber: stkPushResponseData?.mpesa_receipt_number || stkPushResponseData?.receipt_number,
            message: "Payment already completed"
          };
        }

        // Check for success message without checkout ID
        if (stkPushResponseData?.message?.toLowerCase().includes("success") ||
          stkPushResponseData?.status === "success") {
          console.log("Payment initiated but no checkout ID returned");
          return {
            success: true,
            message: "Payment initiated. Please check your phone."
          };
        }
      }

      // Check if response indicates already paid
      if (stkPushResponseData?.message?.toLowerCase().includes("already paid") ||
        stkPushResponseData?.message?.toLowerCase().includes("duplicate") ||
        stkPushResponseData?.status === "already_paid") {
        return {
          alreadyPaid: true,
          checkoutRequestID: checkoutRequestId,
          message: "Payment already completed"
        };
      }

      // Check for error messages
      if (stkPushResponseData?.error || stkPushResponseData?.ResponseCode !== "0") {
        const errorMsg = stkPushResponseData?.message || stkPushResponseData?.error || "STK push failed";
        console.error("STK push error:", errorMsg);
        throw new Error(errorMsg);
      }

    } catch (error: any) {
      console.error("Error initiating M-Pesa payment:", error.response?.data || error.message);

      // Provide more specific error message
      let errorMessage = "Failed to initiate payment. ";

      if (error.response?.status === 404) {
        errorMessage += "Endpoint not found. Please check the order ID.";
      } else if (error.response?.status === 400) {
        errorMessage += "Bad request. Please check the payment details.";

        if (error.response?.data?.message && Array.isArray(error.response.data.message)) {
          errorMessage += " Validation errors: " + error.response.data.message.join(", ");
        }
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      }

      throw new Error(errorMessage);
    }

    if (!checkoutRequestId && !stkPushResponseData?.alreadyPaid) {
      throw new Error("Payment initiation failed: No transaction ID received from server.");
    }

    return {
      ...(stkPushResponseData || {}),
      CheckoutRequestID: checkoutRequestId,
      checkoutRequestID: checkoutRequestId,
      success: true,
      message: "Payment initiated. Please check your phone for the M-Pesa prompt."
    };
  };

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
        try {
          console.log("Creating order with data:", orderData);
          const orderRes = await axios.post(`${API_BASE_URL}/customer/orders`, orderData);
          console.log("Order creation response:", orderRes.data);
          rawSaleId = orderRes.data?.sale_id || orderRes.data?.id || orderRes.data?.order_id || null;
        } catch (error: any) {
          console.error("Order creation error:", error.response?.data || error.message);

          if (error.response?.status === 400 || error.response?.status === 409) {
            const errorMsg = error.response.data?.message || "";
            const match = errorMsg.match(/SAL\d+/i);
            if (match) {
              rawSaleId = match[0];
              console.log("Extracted order ID from error:", rawSaleId);
            }
          }

          if (!rawSaleId) {
            throw error;
          }
        }
      }

      const normalizedSaleId = normalizeSaleId(rawSaleId);

      if (!normalizedSaleId) {
        throw new Error("Failed to get order ID from server");
      }

      setSaleId(normalizedSaleId);

      // Step 2: Check order status before initiating payment
      const orderCheck = await checkExistingOrder(normalizedSaleId);

      if (orderCheck.exists && orderCheck.hasCompletedPayment) {
        // Order already has completed payment - clear cart immediately
        if (onClearCart) onClearCart();

        setStatus({
          type: 'success',
          message: `Payment already completed for order ${normalizedSaleId}. Your cart has been cleared. Closing in 5 seconds...`
        });

        setCountdown(5);
        setCheckoutRequestId(orderCheck.data.payments?.find((p: any) =>
          p.status === 'completed' || p.status === 'paid'
        )?.mpesa_checkout_request_id || null);

        return;
      }

      // Step 3: Initiate payment if no completed payment exists
      try {
        console.log("Initiating payment for order:", normalizedSaleId);
        const paymentResponse = await initiateMpesaPayment(normalizedSaleId, phoneNumber, grandTotal);

        console.log("Payment initiation response:", paymentResponse);

        if (paymentResponse.alreadyPaid) {
          // Payment already completed - clear cart immediately
          if (onClearCart) onClearCart();

          setStatus({
            type: 'success',
            message: `Payment already completed for order ${normalizedSaleId}. Your cart has been cleared. Closing in 5 seconds...`
          });

          setCountdown(5);
          await checkExistingOrder(normalizedSaleId);
          setCheckoutRequestId(paymentResponse.checkoutRequestID || null);
        } else {
          // New payment initiated
          const extractedCheckoutId = paymentResponse?.CheckoutRequestID || paymentResponse?.checkoutRequestID;

          setStatus({
            type: 'info',
            message: `Order ${normalizedSaleId} created. Please check your phone for the M-Pesa prompt.`
          });

          setCheckoutRequestId(extractedCheckoutId);
          setShowPaymentModal(true);
          setActiveStep('payment');
        }

      } catch (error: any) {
        console.error("Payment initiation error:", error);
        setStatus({
          type: 'warning',
          message: `Order ${normalizedSaleId} created. Payment initiation failed: ${error.message}. Please contact support.`
        });
        // Still show payment modal for manual confirmation
        setShowPaymentModal(true);
      }
    } catch (error: any) {
      let errorMessage = "An error occurred. Please try again.";

      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(", ");
        } else {
          errorMessage = error.response.data.message;

          if (errorMessage.includes("already exists") || errorMessage.includes("duplicate")) {
            const match = errorMessage.match(/SAL\d+/i);
            if (match) {
              const existingOrderId = match[0];
              setSaleId(existingOrderId);

              const orderCheck = await checkExistingOrder(existingOrderId);
              if (orderCheck.exists && orderCheck.hasCompletedPayment) {
                // Clear cart immediately for existing paid order
                if (onClearCart) onClearCart();

                setStatus({
                  type: 'success',
                  message: `Order ${existingOrderId} already exists with completed payment. Your cart has been cleared. Closing in 5 seconds...`
                });

                setCountdown(5);
                return;
              } else {
                errorMessage = `Order ${existingOrderId} already exists. Please try a different order or contact support.`;
              }
            }
          }
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

  const handlePaymentSuccess = () => {
    // Clear cart when payment is successful
    if (onClearCart) onClearCart();

    // Show success message before closing
    setStatus({
      type: 'success',
      message: "Payment completed successfully! Your cart has been cleared. Closing in 5 seconds..."
    });

    setCountdown(5);
  };

  const handlePaymentFailure = () => {
    setShowPaymentModal(false);
    setStatus({
      type: 'error',
      message: "Payment was not completed. Please try again."
    });
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
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

  const renderStepIndicator = () => {
    const steps = [
      { key: 'details', label: 'Details', icon: UserCircleIcon },
      { key: 'review', label: 'Review', icon: DocumentTextIcon },
      { key: 'payment', label: 'Payment', icon: CreditCardIcon },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        <div className="relative flex items-center justify-between w-full max-w-lg">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.key;
            const isCompleted =
              (step.key === 'details' && activeStep !== 'details') ||
              (step.key === 'review' && activeStep === 'payment');

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-600 text-white'
                  : isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  }`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-sm font-medium mt-2 ${isActive || isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
          {/* Progress line */}
          <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
              initial={{ width: '0%' }}
              animate={{
                width: activeStep === 'details' ? '0%' :
                  activeStep === 'review' ? '50%' : '100%'
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main Checkout Modal */}
      <Modal
        isOpen={isOpen && !showPaymentModal}  // Only show when not showing payment modal
        onClose={handleModalClose}
        size="5xl"
        scrollBehavior="outside"
        classNames={{
          base: "z-[9999]",
          backdrop: "bg-black/60 backdrop-blur-xl",
        }}
      >
        <ModalContent className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-3xl">
          <ModalHeader className="pt-8 pb-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-0.5">
                  <div className="w-full h-full rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center">
                    <CreditCardIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Enterprise Procurement
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete your corporate order with secure payment
                  </p>
                </div>
              </div>

              <Badge
                color="primary"
                variant="flat"
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              >
                {cartItems.length} Items
              </Badge>
            </div>
          </ModalHeader>

          <ModalBody className="pb-0">
            {renderStepIndicator()}

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Order Details */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatePresence mode="wait">
                  {activeStep === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      {/* Customer Information */}
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                            <UserCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Primary Contact</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            placeholder="John Doe"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            isRequired
                            disabled={loading}
                            classNames={{
                              input: "text-base py-6",
                              label: "text-gray-700 dark:text-gray-300"
                            }}
                          />
                          <Input
                            type="tel"
                            label="Phone Number"
                            placeholder="07XXXXXXXX or +2547XXXXXXXX"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            isRequired
                            disabled={loading}
                            description="For M-Pesa payment confirmation"
                            startContent={<PhoneIcon className="w-5 h-5 text-gray-400" />}
                          />
                        </div>
                      </div>

                      {/* Delivery Information */}
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                            <TruckIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Details</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            label="Recipient Name"
                            placeholder="Jane Smith"
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
                            startContent={<PhoneIcon className="w-5 h-5 text-gray-400" />}
                          />
                        </div>

                        <div className="mt-4">
                          <Input
                            label="Delivery Address"
                            placeholder="Building name, Street, Floor/Unit, Landmarks"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            isRequired
                            disabled={loading}
                            classNames={{
                              input: "text-base",
                              label: "text-gray-700 dark:text-gray-300"
                            }}
                            startContent={<MapPinIcon className="w-5 h-5 text-gray-400" />}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 'review' && (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      {/* Order Summary Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30">
                            <DocumentTextIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Summary</h3>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Information</h4>
                              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <p>{customerName}</p>
                                <p>{phoneNumber}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Delivery Information</h4>
                              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <p>{recipientName}</p>
                                <p>{recipientPhone}</p>
                                <p>{deliveryAddress}</p>
                              </div>
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Items</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                              {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.variant} × {item.quantity}</p>
                                  </div>
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    KES {(item.price * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column - Order Summary & Payment */}
              <div className="space-y-6">
                {/* Order Summary Card */}
                <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardBody className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Procurement Summary</h3>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          KES {subtotal.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">VAT (16%)</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          KES {vat.toLocaleString()}
                        </span>
                      </div>

                      {deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            KES {deliveryFee.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <Divider />

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            KES {grandTotal.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Inclusive of all taxes</div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Payment Method Card */}
                <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <BanknotesIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Payment Method</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">M-Pesa STK Push</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Secure mobile payment</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>256-bit encrypted transaction</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Security Features */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <LockClosedIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">PCI DSS Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <ChartBarIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Real-time Tracking</span>
                  </div>
                </div>

                {/* Status Message */}
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
                      status.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                        status.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                          'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${status.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                        status.type === 'error' ? 'text-red-600 dark:text-red-400' :
                          status.type === 'info' ? 'text-blue-600 dark:text-blue-400' :
                            'text-amber-600 dark:text-amber-400'}`}>
                        {status.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> :
                          status.type === 'error' ? '❌' :
                            status.type === 'info' ? <ClockIcon className="w-5 h-5" /> :
                              '⚠️'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {status.message}
                          {countdown !== null && countdown > 0 && status.type === 'success' && (
                            <span className="font-bold ml-1">({countdown})</span>
                          )}
                        </p>
                        {saleId && (
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-2">
                            REF: {saleId}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="pt-6 pb-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-3">
                <Button
                  variant="bordered"
                  onPress={handleModalClose}
                  isDisabled={loading}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </Button>

                {activeStep === 'review' && (
                  <Button
                    variant="light"
                    onPress={() => setActiveStep('details')}
                    isDisabled={loading}
                    className="text-gray-700 dark:text-gray-300"
                    startContent={<ArrowPathIcon className="w-4 h-4" />}
                  >
                    Edit Details
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                {activeStep === 'details' && (
                  <Button
                    color="primary"
                    variant="bordered"
                    onPress={() => setActiveStep('review')}
                    isDisabled={!isFormValid()}
                    className="border-blue-600 text-blue-600 dark:text-blue-400"
                  >
                    Review Order
                  </Button>
                )}

                {activeStep === 'review' && (
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={loading}
                    isDisabled={!isFormValid()}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold min-w-[240px] py-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    startContent={<CreditCardIcon className="w-5 h-5" />}
                  >
                    {loading ? "Processing..." : "Initiate M-Pesa Payment"}
                  </Button>
                )}
              </div>
            </div>
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
          totalAmount={grandTotal}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
          onPaymentCancel={handlePaymentCancel}
        />
      )}
    </>
  );
};