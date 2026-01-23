"use client";

import React, { useState, useEffect, useRef } from "react";
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
  XMarkIcon,
  ChevronLeftIcon
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

// Simple Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '📱';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-[10000] ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-[90vw] md:min-w-[300px] md:max-w-md`}
    >
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="font-medium text-sm md:text-base">{message}</p>
      </div>
      <Button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors p-1"
      >
        <XMarkIcon className="w-4 h-4 md:w-5 md:h-5" />
      </Button>
    </motion.div>
  );
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
  // Form states
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Loading and status states
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; show: boolean } | null>(null);

  // Order and payment states
  const [saleId, setSaleId] = useState<string | null>(null);

  // Modal states
  const [activeStep, setActiveStep] = useState<'details' | 'review' | 'payment'>('details');

  // Responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Ref for scrollable content wrapper (not ModalBody)
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vat = subtotal * 0.16;
  const grandTotal = subtotal + vat + deliveryFee;

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);

  // Show toast function
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, show: true });

    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Reset form function
  const resetForm = () => {
    setCustomerName("");
    setPhoneNumber("");
    setRecipientName("");
    setRecipientPhone("");
    setDeliveryAddress("");
    setStatus(null);
    setSaleId(null);
    setActiveStep('details');
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
  const checkExistingOrder = async (id: string): Promise<{ exists: boolean; data?: any; hasCompletedPayment?: boolean }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/orders/${id}`);
      const orderData = response.data;
      console.log("Existing order check response:", orderData);

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
      let orderResponse: any = null;
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
          orderResponse = orderRes.data; // Save the full response
          rawSaleId = orderRes.data?.id || orderRes.data?.sale_id || orderRes.data?.order_id || null;
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

      const id = normalizeSaleId(rawSaleId);

      if (!id) {
        throw new Error("Failed to get order ID from server");
      }

      setSaleId(id);

      // Step 2: Check order status before initiating payment
      const orderCheck = await checkExistingOrder(id);

      if (orderCheck.exists && orderCheck.hasCompletedPayment) {
        // Order already has completed payment - clear cart immediately
        if (onClearCart) onClearCart();

        // Show success toast
        showToast(
          `Order ${id} placed successfully! Your cart has been cleared.`,
          'success'
        );

        // Show success message in modal
        setStatus({
          type: 'success',
          message: `Order ${id} created successfully! Payment already completed.`
        });

        // Close modal after 5 seconds
        setTimeout(() => {
          handleModalClose();
          if (onCheckoutSuccess) onCheckoutSuccess();
        }, 5000);

        return;
      }

      // Step 3: Initiate payment
      try {
        console.log("Initiating payment via:", `${API_BASE_URL}/customer/orders/${id}/pay`);

        // Get the correct amount from the server response
        const paymentAmount = orderResponse?.payable_amount ||
          orderResponse?.total_amount ||
          orderCheck.data?.payable_amount ||
          orderCheck.data?.total_amount;

        if (!paymentAmount) {
          throw new Error("Could not determine payment amount from server");
        }

        const requestData = {
          sale_id: id,
          payment_method: "mpesa",
          phone_number: formatPhoneForMpesa(phoneNumber),
          amount: parseFloat(paymentAmount)
        };

        console.log("Payment request data:", requestData);

        const response = await axios.post(
          `${API_BASE_URL}/customer/orders/${id}/pay`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000
          }
        );

        console.log("Payment initiation response:", response.data);

        // Clear cart immediately when payment is initiated
        if (onClearCart) onClearCart();

        // Show success toast
        showToast(
          `Order ${id} created successfully! Input PIN to complete order.`,
          'info'
        );

        // Show success message in modal
        setStatus({
          type: 'success',
          message: `Order ${id} created successfully! Input PIN to complete order.`
        });

        // Close modal after 5 seconds
        setTimeout(() => {
          handleModalClose();
          if (onCheckoutSuccess) onCheckoutSuccess();
        }, 5000);

      } catch (error: any) {
        console.error("Payment initiation error:", error.response?.data || error.message);

        // Log more details about the error
        if (error.response?.data) {
          console.error("Payment error details:", error.response.data);
        }

        // Even if payment fails, we still created the order
        // Clear cart for consistency
        if (onClearCart) onClearCart();

        // Show warning toast
        showToast(
          `Order ${id} created! Payment initiation failed. Please contact support.`,
          'info'
        );

        // Show warning message in modal
        setStatus({
          type: 'warning',
          message: `Order ${id} created! Payment failed: ${error.response?.data?.message || error.message}. Please contact support.`
        });

        // Still close modal after 5 seconds
        setTimeout(() => {
          handleModalClose();
          if (onCheckoutSuccess) onCheckoutSuccess();
        }, 5000);
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

                // Show success toast
                showToast(
                  `Order ${existingOrderId} already exists with completed payment. Your cart has been cleared.`,
                  'success'
                );

                // Show success message in modal
                setStatus({
                  type: 'success',
                  message: `Order ${existingOrderId} already exists with completed payment.`
                });

                // Close modal after 5 seconds
                setTimeout(() => {
                  handleModalClose();
                  if (onCheckoutSuccess) onCheckoutSuccess();
                }, 5000);

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

      // Show error toast
      showToast(errorMessage, 'error');

      setStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
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

    // Mobile: Compact step indicator
    if (isMobile) {
      return (
        <div className="mb-4 px-2">
          <div className="flex items-center justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.key;
              const isCompleted =
                (step.key === 'details' && activeStep !== 'details') ||
                (step.key === 'review' && activeStep === 'payment');

              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-600 text-white'
                    : isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                    }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-xs font-medium mt-1 ${isActive || isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Desktop/Tablet: Full step indicator
    return (
      <div className="flex items-center justify-center mb-6 md:mb-8">
        <div className="relative flex items-center justify-between w-full max-w-lg">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.key;
            const isCompleted =
              (step.key === 'details' && activeStep !== 'details') ||
              (step.key === 'review' && activeStep === 'payment');

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-600 text-white'
                  : isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  }`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                </div>
                <span className={`text-xs md:text-sm font-medium mt-2 ${isActive || isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
          {/* Progress line */}
          <div className="absolute top-5 md:top-6 left-10 md:left-12 right-10 md:right-12 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
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

  // Determine modal size based on screen
  const getModalSize = () => {
    if (isMobile) return 'full';
    if (isTablet) return '3xl';
    return '5xl';
  };

  // Mobile header for better navigation
  const renderMobileHeader = () => (
    <div className="sticky top-0 z-10 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={activeStep === 'review' ? () => setActiveStep('details') : handleModalClose}
            className="w-8 h-8 min-w-8"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent text-lg">
              {activeStep === 'details' ? 'Checkout Details' :
                activeStep === 'review' ? 'Review Order' : 'Payment'}
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Step {activeStep === 'details' ? '1' : activeStep === 'review' ? '2' : '3'} of 3
            </p>
          </div>
        </div>
        <Badge
          color="primary"
          variant="flat"
          size="sm"
          className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        >
          {cartItems.length} Items
        </Badge>
      </div>
    </div>
  );

  return (
    <>
      {/* Custom Toast Notification */}
      {toast?.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main Checkout Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        size={getModalSize()}
        scrollBehavior="inside"
        placement={isMobile ? "bottom" : "auto"}
        classNames={{
          base: "z-[9999]",
          backdrop: "bg-black/60 backdrop-blur-xl",
          wrapper: isMobile ? "items-end" : "",
          body: isMobile ? "p-0" : "",
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: isMobile ? "100%" : 0,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          }
        }}
      >
        <ModalContent
          className={`bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-3xl ${isMobile
            ? 'max-h-[95vh] h-[90vh]'
            : 'h-auto'
            }`}
        >
          {isMobile ? (
            <>
              {renderMobileHeader()}
              <ModalBody className={`overflow-y-auto flex-1 px-4 pb-4`}>
                <div ref={contentWrapperRef} className="space-y-6">
                  {renderStepIndicator()}

                  <AnimatePresence mode="wait">
                    {activeStep === 'details' && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Customer Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                              <UserCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Primary Contact</h3>
                          </div>

                          <div className="space-y-4">
                            <Input
                              placeholder="John Doe"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              isRequired
                              disabled={loading}
                              size="sm"
                              classNames={{
                                input: "text-sm py-3",
                                label: "text-sm text-gray-700 dark:text-gray-300"
                              }}
                            />
                            <Input
                              type="tel"
                              placeholder="07XXXXXXXX"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              isRequired
                              disabled={loading}
                              startContent={<PhoneIcon className="w-4 h-4 text-gray-400" />}
                              size="sm"
                              classNames={{
                                input: "text-sm py-3",
                                label: "text-sm text-gray-700 dark:text-gray-300"
                              }}
                            />
                          </div>
                        </div>

                        {/* Delivery Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                              <TruckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Delivery Details</h3>
                          </div>

                          <div className="space-y-4">
                            <Input
                              placeholder="Recipient Name"
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              isRequired
                              disabled={loading}
                              size="sm"
                              classNames={{
                                input: "text-sm py-3",
                                label: "text-sm text-gray-700 dark:text-gray-300"
                              }}
                            />
                            <Input
                              type="tel"
                              placeholder="07XXXXXXXX"
                              value={recipientPhone}
                              onChange={(e) => setRecipientPhone(e.target.value)}
                              isRequired
                              disabled={loading}
                              startContent={<PhoneIcon className="w-4 h-4 text-gray-400" />}
                              size="sm"
                              classNames={{
                                input: "text-sm py-3",
                                label: "text-sm text-gray-700 dark:text-gray-300"
                              }}
                            />
                            <Input
                              placeholder="Building, Street, Floor, Landmarks"
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              isRequired
                              disabled={loading}
                              size="sm"
                              classNames={{
                                input: "text-sm py-3",
                                label: "text-sm text-gray-700 dark:text-gray-300"
                              }}
                              startContent={<MapPinIcon className="w-4 h-4 text-gray-400" />}
                            />
                          </div>
                        </div>

                        {/* Order Summary Preview for Mobile */}
                        <Card className="border border-gray-200 dark:border-gray-700">
                          <CardBody className="p-4">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Order Summary</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  KES {subtotal.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">VAT (16%)</span>
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  KES {vat.toLocaleString()}
                                </span>
                              </div>
                              {deliveryFee > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Delivery</span>
                                  <span className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                                    KES {deliveryFee.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              <Divider className="my-2" />
                              <div className="flex justify-between items-center pt-1">
                                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                                <div className="text-right">
                                  <div className="font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent text-lg">
                                    KES {grandTotal.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </motion.div>
                    )}

                    {activeStep === 'review' && (
                      <motion.div
                        key="review"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Order Summary Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                              <DocumentTextIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Order Summary</h3>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Contact Information</h4>
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                  <p>{customerName}</p>
                                  <p>{phoneNumber}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Delivery Information</h4>
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                  <p>{recipientName}</p>
                                  <p>{recipientPhone}</p>
                                  <p className="line-clamp-2">{deliveryAddress}</p>
                                </div>
                              </div>
                            </div>

                            <Divider />

                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Items</h4>
                              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {cartItems.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.variant} × {item.quantity}
                                      </p>
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm ml-2">
                                      KES {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <Card className="border border-gray-200 dark:border-gray-700">
                          <CardBody className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <BanknotesIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Payment Method</h3>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="rounded-lg bg-green-500 flex items-center justify-center w-8 h-8">
                                <span className="text-white font-bold text-xs">M</span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">M-Pesa STK Push</p>
                                <p className="text-gray-600 dark:text-gray-400 text-xs">Secure mobile payment</p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Status Message */}
                  {status && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-xl border ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
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
                          {status.type === 'success' ? <CheckCircleIcon className="w-4 h-4" /> :
                            status.type === 'error' ? '❌' :
                              status.type === 'info' ? <ClockIcon className="w-4 h-4" /> :
                                '⚠️'}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {status.message}
                          </p>
                          {saleId && (
                            <p className="font-mono text-gray-500 dark:text-gray-400 mt-1 text-xs">
                              Order ID: {saleId}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ModalBody>

              {/* Mobile Footer - Fixed at bottom */}
              <ModalFooter className={`sticky bottom-0 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-4`}>
                <div className="flex flex-col gap-3 w-full">
                  {activeStep === 'details' && (
                    <Button
                      color="primary"
                      onPress={() => setActiveStep('review')}
                      isDisabled={!isFormValid()}
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3"
                    >
                      Continue to Review
                    </Button>
                  )}

                  {activeStep === 'review' && (
                    <>
                      <Button
                        color="primary"
                        onPress={handleSubmit}
                        isLoading={loading}
                        isDisabled={!isFormValid()}
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3"
                      >
                        {loading ? "Processing..." : "Place Order & Pay"}
                      </Button>
                      <Button
                        variant="light"
                        onPress={() => setActiveStep('details')}
                        isDisabled={loading}
                        size="sm"
                        className="w-full text-gray-700 dark:text-gray-300"
                        startContent={<ArrowPathIcon className="w-4 h-4" />}
                      >
                        Edit Details
                      </Button>
                    </>
                  )}
                </div>
              </ModalFooter>
            </>
          ) : (
            // Desktop/Tablet Layout (Original with improvements)
            <>
              <ModalHeader className="pt-6 pb-4 md:pt-8 md:pb-6 px-4 md:px-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-0.5 ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`}>
                      <div className="w-full h-full rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center">
                        <CreditCardIcon className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-blue-600 dark:text-blue-400`} />
                      </div>
                    </div>
                    <div>
                      <h2 className={`font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
                        {isMobile ? 'Checkout' : 'Enterprise Procurement'}
                      </h2>
                      <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {isMobile ? 'Complete your order' : 'Complete your corporate order with secure payment'}
                      </p>
                    </div>
                  </div>

                  {!isMobile && (
                    <Badge
                      color="primary"
                      variant="flat"
                      className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    >
                      {cartItems.length} Items
                    </Badge>
                  )}
                </div>
              </ModalHeader>

              <ModalBody className="pb-0 px-4 md:px-6 overflow-y-auto">
                <div ref={contentWrapperRef}>
                  {renderStepIndicator()}

                  <div className={`${isMobile ? 'space-y-6' : 'grid lg:grid-cols-3 gap-6 md:gap-8'}`}>
                    {/* Left Column - Order Details */}
                    <div className={`${isMobile ? '' : 'lg:col-span-2 space-y-6'}`}>
                      <AnimatePresence mode="wait">
                        {activeStep === 'details' && (
                          <motion.div
                            key="details"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6 md:space-y-8"
                          >
                            {/* Customer Information */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                              <div className="flex items-center gap-3 mb-4 md:mb-6">
                                <div className="p-2 md:p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                                  <UserCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>Primary Contact</h3>
                              </div>

                              <div className={`${isMobile ? 'space-y-4' : 'grid md:grid-cols-2 gap-4'}`}>
                                <Input
                                  label="Full Name"
                                  placeholder="John Doe"
                                  value={customerName}
                                  onChange={(e) => setCustomerName(e.target.value)}
                                  isRequired
                                  disabled={loading}
                                  size={isMobile ? "sm" : "md"}
                                  classNames={{
                                    input: isMobile ? "text-sm py-4" : "text-base py-6",
                                    label: "text-gray-700 dark:text-gray-300"
                                  }}
                                />
                                <Input
                                  type="tel"
                                  label="Phone Number"
                                  placeholder="07XXXXXXXX"
                                  value={phoneNumber}
                                  onChange={(e) => setPhoneNumber(e.target.value)}
                                  isRequired
                                  disabled={loading}
                                  description={!isMobile && "For M-Pesa payment confirmation"}
                                  startContent={<PhoneIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />}
                                  size={isMobile ? "sm" : "md"}
                                />
                              </div>
                            </div>

                            {/* Delivery Information */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                              <div className="flex items-center gap-3 mb-4 md:mb-6">
                                <div className="p-2 md:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                                  <TruckIcon className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>Delivery Details</h3>
                              </div>

                              <div className={`${isMobile ? 'space-y-4' : 'grid md:grid-cols-2 gap-4'}`}>
                                <Input
                                  label="Recipient Name"
                                  placeholder="Jane Smith"
                                  value={recipientName}
                                  onChange={(e) => setRecipientName(e.target.value)}
                                  isRequired
                                  disabled={loading}
                                  size={isMobile ? "sm" : "md"}
                                />
                                <Input
                                  type="tel"
                                  label="Recipient Phone"
                                  placeholder="07XXXXXXXX"
                                  value={recipientPhone}
                                  onChange={(e) => setRecipientPhone(e.target.value)}
                                  isRequired
                                  disabled={loading}
                                  startContent={<PhoneIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />}
                                  size={isMobile ? "sm" : "md"}
                                />
                              </div>

                              <div className="mt-4">
                                <Input
                                  label="Delivery Address"
                                  placeholder="Building, Street, Floor, Landmarks"
                                  value={deliveryAddress}
                                  onChange={(e) => setDeliveryAddress(e.target.value)}
                                  isRequired
                                  disabled={loading}
                                  size={isMobile ? "sm" : "md"}
                                  classNames={{
                                    input: isMobile ? "text-sm" : "text-base",
                                    label: "text-gray-700 dark:text-gray-300"
                                  }}
                                  startContent={<MapPinIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />}
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
                            className="space-y-6 md:space-y-8"
                          >
                            {/* Order Summary Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                              <div className="flex items-center gap-3 mb-4 md:mb-6">
                                <div className="p-2 md:p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30">
                                  <DocumentTextIcon className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>Order Summary</h3>
                              </div>

                              <div className="space-y-4">
                                <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}`}>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm md:text-base">Contact Information</h4>
                                    <div className="space-y-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                      <p>{customerName}</p>
                                      <p>{phoneNumber}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm md:text-base">Delivery Information</h4>
                                    <div className="space-y-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                      <p>{recipientName}</p>
                                      <p>{recipientPhone}</p>
                                      <p className="line-clamp-2">{deliveryAddress}</p>
                                    </div>
                                  </div>
                                </div>

                                <Divider />

                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm md:text-base">Items</h4>
                                  <div className="space-y-3 max-h-40 md:max-h-60 overflow-y-auto pr-2">
                                    {cartItems.map((item) => (
                                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base truncate">
                                            {item.name}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.variant} × {item.quantity}
                                          </p>
                                        </div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm md:text-base ml-2">
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
                        <CardBody className="p-4 md:p-6">
                          <h3 className={`font-bold text-gray-900 dark:text-white mb-3 md:mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
                            {isMobile ? 'Order Summary' : 'Procurement Summary'}
                          </h3>

                          <div className="space-y-2 md:space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Subtotal</span>
                              <span className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                                KES {subtotal.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">VAT (16%)</span>
                              <span className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                                KES {vat.toLocaleString()}
                              </span>
                            </div>

                            {deliveryFee > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Delivery</span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400 text-sm md:text-base">
                                  KES {deliveryFee.toLocaleString()}
                                </span>
                              </div>
                            )}

                            <Divider className="my-2 md:my-3" />

                            <div className="flex justify-between items-center pt-1 md:pt-2">
                              <span className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-base' : 'text-lg'}`}>Total</span>
                              <div className="text-right">
                                <div className={`font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ${isMobile ? 'text-xl' : 'text-2xl'}`}>
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
                        <CardBody className="p-4 md:p-6">
                          <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className={`rounded-lg bg-green-100 dark:bg-green-900/30 ${isMobile ? 'p-1.5' : 'p-2'}`}>
                              <BanknotesIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-green-600 dark:text-green-400`} />
                            </div>
                            <h3 className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-sm' : 'text-base'}`}>Payment Method</h3>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className={`rounded-lg bg-green-500 flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
                                <span className="text-white font-bold text-xs md:text-sm">M</span>
                              </div>
                              <div>
                                <p className={`font-semibold text-gray-900 dark:text-white ${isMobile ? 'text-sm' : 'text-base'}`}>M-Pesa STK Push</p>
                                <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Secure mobile payment</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                              <ShieldCheckIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                              <span>256-bit encrypted transaction</span>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      {/* Security Features */}
                      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-2 md:gap-3`}>
                        <div className="flex items-center gap-2 p-2 md:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <LockClosedIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-blue-500`} />
                          <span className={`font-medium text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>PCI DSS Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 md:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <ChartBarIcon className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-emerald-500`} />
                          <span className={`font-medium text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>Real-time Tracking</span>
                        </div>
                      </div>

                      {/* Status Message */}
                      {status && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 md:p-4 rounded-xl border ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
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
                              {status.type === 'success' ? <CheckCircleIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} /> :
                                status.type === 'error' ? '❌' :
                                  status.type === 'info' ? <ClockIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} /> :
                                    '⚠️'}
                            </div>
                            <div className="flex-1">
                              <p className={`text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                {status.message}
                              </p>
                              {saleId && (
                                <p className={`font-mono text-gray-500 dark:text-gray-400 mt-1 md:mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                  Order ID: {saleId}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className={`pt-4 pb-6 md:pt-6 md:pb-8 border-t border-gray-200 dark:border-gray-700 px-4 md:px-6 ${isMobile ? 'sticky bottom-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800' : ''}`}>
                <div className={`flex items-center justify-between w-full ${isMobile ? 'flex-col gap-4' : ''}`}>
                  <div className={`flex gap-2 md:gap-3 ${isMobile ? 'w-full justify-between' : ''}`}>
                    <Button
                      variant="bordered"
                      onPress={handleModalClose}
                      isDisabled={loading}
                      size={isMobile ? "sm" : "md"}
                      className={`border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 ${isMobile ? 'flex-1 text-sm' : ''}`}
                    >
                      Cancel
                    </Button>

                    {activeStep === 'review' && !isMobile && (
                      <Button
                        variant="light"
                        onPress={() => setActiveStep('details')}
                        isDisabled={loading}
                        size={isMobile ? "sm" : "md"}
                        className="text-gray-700 dark:text-gray-300"
                        startContent={<ArrowPathIcon className="w-4 h-4" />}
                      >
                        Edit Details
                      </Button>
                    )}
                  </div>

                  <div className={`flex gap-2 md:gap-3 ${isMobile ? 'w-full mt-2' : ''}`}>
                    {activeStep === 'details' && (
                      <Button
                        color="primary"
                        variant="bordered"
                        onPress={() => setActiveStep('review')}
                        isDisabled={!isFormValid()}
                        size={isMobile ? "sm" : "md"}
                        className={`border-blue-600 text-blue-600 dark:text-blue-400 ${isMobile ? 'flex-1 w-full text-sm' : ''}`}
                      >
                        {isMobile ? 'Continue' : 'Review Order'}
                      </Button>
                    )}

                    {activeStep === 'review' && (
                      <Button
                        color="primary"
                        onPress={handleSubmit}
                        isLoading={loading}
                        isDisabled={!isFormValid()}
                        size={isMobile ? "sm" : "md"}
                        className={`bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-xl transition-all duration-300 ${isMobile
                          ? 'flex-1 w-full text-sm py-3'
                          : 'min-w-[180px] md:min-w-[240px] py-6'
                          }`}
                        startContent={!loading && <CreditCardIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />}
                      >
                        {loading ? (
                          <span>{isMobile ? "Processing..." : "Processing..."}</span>
                        ) : (
                          <span>{isMobile ? "Place Order" : "Place Order & Pay"}</span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Mobile step navigation */}
                {isMobile && activeStep === 'review' && (
                  <div className="w-full mt-4">
                    <Button
                      variant="light"
                      onPress={() => setActiveStep('details')}
                      isDisabled={loading}
                      size="sm"
                      className="w-full text-gray-700 dark:text-gray-300 text-sm"
                      startContent={<ArrowPathIcon className="w-4 h-4" />}
                    >
                      Edit Details
                    </Button>
                  </div>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};