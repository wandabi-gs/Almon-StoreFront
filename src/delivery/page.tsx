"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Checkbox,
  Spinner,
  Chip,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://ecommerce-backend-snc5.onrender.com";

interface ProductItem {
  product_id: string;
  quantity: number;
  unit: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
  confirmed: boolean;
  image_url?: string;
}

interface ConfirmDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfirmDeliveryModal({ isOpen, onClose }: ConfirmDeliveryModalProps) {
  const [deliveryId, setDeliveryId] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [error, setError] = useState("");
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Add refs for modal content and content wrapper
  const modalContentRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);

  // Handle keyboard events for mobile - Improved version
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    let originalModalStyle = '';

    const handleVisualViewportChange = () => {
      if (window.visualViewport && modalContentRef.current) {
        // Adjust modal position when keyboard appears
        const modalContent = modalContentRef.current;
        const visualViewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;

        // Calculate keyboard height
        const keyboardHeight = windowHeight - visualViewportHeight;

        if (keyboardHeight > 100) { // Keyboard is open
          // Save original styles if not already saved
          if (!originalModalStyle) {
            originalModalStyle = modalContent.style.position;
          }

          // Set modal to fixed position at the bottom
          modalContent.style.position = 'fixed';
          modalContent.style.bottom = '0';
          modalContent.style.left = '0';
          modalContent.style.right = '0';
          modalContent.style.maxHeight = `${visualViewportHeight}px`;
          modalContent.style.transform = 'translateY(0)';

          // Ensure the active input is visible
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            setTimeout(() => {
              activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        } else { // Keyboard is closed
          // Restore original styles
          if (originalModalStyle) {
            modalContent.style.position = originalModalStyle;
            modalContent.style.bottom = '';
            modalContent.style.left = '';
            modalContent.style.right = '';
            modalContent.style.maxHeight = '';
            modalContent.style.transform = '';
          }
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      window.visualViewport.addEventListener('scroll', handleVisualViewportChange);
    }

    // Initial adjustment
    setTimeout(handleVisualViewportChange, 100);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportChange);
      }

      // Clean up styles
      if (modalContentRef.current && originalModalStyle) {
        modalContentRef.current.style.position = originalModalStyle;
        modalContentRef.current.style.bottom = '';
        modalContentRef.current.style.left = '';
        modalContentRef.current.style.right = '';
        modalContentRef.current.style.maxHeight = '';
        modalContentRef.current.style.transform = '';
      }
    };
  }, [isMobile, isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setDeliveryId("");
    setItems([]);
    setOtpSent(false);
    setDeliveryCompleted(false);
    setError("");
    setOtpError("");
    setLoading(false);
    setOtpLoading(false);
    setOrderInfo(null);
    setCustomerInfo(null);
  };

  const fetchOrderDetails = async (orderNumber: string) => {
    try {
      const response = await axios.get(`${API_BASE}/customer/orders/${orderNumber}`);
      const orderData = response.data;

      console.log("Order data received:", {
        orderId: orderData.id,
        phoneNumber: orderData.phone_number,
        customerPhone: orderData.customer_phone,
        deliveryPhone: orderData.delivery?.recipient_phone,
        customerName: orderData.customer_name,
        deliveryUuid: orderData.delivery?.id
      });

      return orderData;
    } catch (err: any) {
      console.error("Error fetching order details:", err);
      if (err.response?.data) {
        console.error("Error details:", err.response.data);
      }
      return null;
    }
  };

  const loadDeliveryItems = async () => {
    if (!deliveryId.trim()) {
      setError("Please enter a delivery ID or order number");
      return;
    }

    setLoading(true);
    setError("");
    setItems([]);
    setOrderInfo(null);
    setCustomerInfo(null);

    try {
      const orderData = await fetchOrderDetails(deliveryId);

      if (!orderData) {
        setError("Order/Delivery not found. Please check the ID.");
        return;
      }

      setOrderInfo(orderData);

      // Set customer info from delivery
      if (orderData.delivery) {
        setCustomerInfo({
          name: orderData.delivery.recipient_name || orderData.customer_name,
          phone: orderData.delivery.recipient_phone,
          email: orderData.delivery.recipient_email,
          address: orderData.delivery.delivery_address,
        });
      } else if (orderData.customer_name) {
        setCustomerInfo({
          name: orderData.customer_name,
          phone: orderData.phone_number,
        });
      }

      // Transform items - use the actual item data from the order
      if (orderData.items && Array.isArray(orderData.items)) {
        const transformedItems: OrderItem[] = orderData.items.map((item: any, index: number) => {
          // Use the actual item id (UUID) from the item
          const productId = item.id || `item-${index}`;

          return {
            id: item.id || `item-${index}`,
            product_id: productId,
            name: item.name || item.product_name || `Item ${index + 1}`,
            quantity: item.quantity || 1,
            price: parseFloat(item.price) || 0,
            unit: item.unit || "pcs",
            confirmed: true,
          };
        });
        setItems(transformedItems);
      } else {
        // Fallback if no items array
        const sampleItems: OrderItem[] = [{
          id: "sample-1",
          product_id: "default-product-id",
          name: "Order Item",
          quantity: 1,
          price: parseFloat(orderData.payable_amount) || 0,
          unit: "pcs",
          confirmed: true,
        }];
        setItems(sampleItems);
      }

    } catch (err: any) {
      console.error("Error loading delivery:", err);
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const generateOtpForDelivery = async () => {
    const deliveredItems = items.filter((i) => i.confirmed);
    if (deliveredItems.length === 0) {
      setOtpError("Please select at least one item for delivery");
      return;
    }

    // Get the customer's phone number from delivery info
    let customerPhone = "";

    if (orderInfo?.delivery?.recipient_phone) {
      customerPhone = orderInfo.delivery.recipient_phone;
    } else if (customerInfo?.phone) {
      customerPhone = customerInfo.phone;
    }

    if (!customerPhone) {
      setOtpError("Customer phone number not found. Cannot send OTP.");
      return;
    }

    // Format phone number
    const formatPhone = (phone: string) => {
      let cleaned = phone.replace(/\D/g, '');

      if (cleaned.startsWith('0')) {
        cleaned = `254${cleaned.substring(1)}`;
      } else if (cleaned.startsWith('+254')) {
        cleaned = cleaned.substring(1);
      } else if (!cleaned.startsWith('254')) {
        cleaned = `254${cleaned}`;
      }

      return cleaned;
    };

    const formattedPhone = formatPhone(customerPhone);

    // Prepare products array - use the actual item IDs from the order
    const products: ProductItem[] = deliveredItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit: item.unit || "pcs",
    }));

    console.log("Sending OTP to:", {
      delivery_id: orderInfo?.delivery?.id, // Use the delivery UUID
      customer_phone: formattedPhone,
      products: products,
      raw_customer_phone: customerPhone
    });

    setOtpLoading(true);
    setOtpError("");

    try {
      // Check if we have the delivery UUID
      if (!orderInfo?.delivery?.id) {
        throw new Error("Delivery UUID not found in order data");
      }

      const payload = {
        delivery_id: orderInfo.delivery.id, // Use the delivery UUID, not the order number
        customer_phone: formattedPhone,
        products
      };

      console.log("Calling API with payload:", payload);
      console.log("Delivery UUID:", orderInfo.delivery.id);

      // Use the correct endpoint
      const endpoint = `${API_BASE}/customer/orders/confirm`;

      console.log(`Using endpoint: ${endpoint}`);

      const response = await axios.post(endpoint, payload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("API Response:", response.data);

      if (response.data && (response.data.success || response.data.message || response.data.status === 'success')) {
        setOtpSent(true);
        setDeliveryCompleted(true);

        // Auto close after 5 seconds
        setTimeout(() => {
          onClose();
          resetState();
        }, 5000);
      } else {
        throw new Error(response.data?.message || "Failed to generate OTP");
      }
    } catch (err: any) {
      console.error("Error generating OTP:", err);
      console.error("Error response data:", err.response?.data);

      let errorMessage = "Failed to send OTP. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Check for specific error about UUID
      if (err.response?.status === 400 && err.response?.data?.message?.includes('UUID')) {
        errorMessage = `Delivery ID must be a UUID. Found: ${orderInfo?.delivery?.id || 'none'}`;
      }

      setOtpError(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && deliveryId && !otpSent && !deliveryCompleted) {
      loadDeliveryItems();
    }
  };

  // Improved helper function to scroll input into view on focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!isMobile) return;

    // Scroll the input into view
    setTimeout(() => {
      const input = e.target;
      const inputRect = input.getBoundingClientRect();
      const modalBody = contentWrapperRef.current;
      const viewportHeight = window.visualViewport?.height ?? 0;

      if (modalBody && inputRect.bottom > viewportHeight) {
        const scrollOffset = inputRect.bottom - viewportHeight + 50;
        modalBody.scrollBy({ top: scrollOffset, behavior: 'smooth' });
      }
    }, 100);
  };

  const getModalSize = () => {
    if (isMobile) return "full";
    return "4xl";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={getModalSize()}
      className="backdrop-blur-xl"
      scrollBehavior="outside"
      backdrop="blur"
      placement={isMobile ? "bottom" : "auto"}
      motionProps={isMobile ? {
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
            y: "100%",
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        }
      } : undefined}
      classNames={{
        wrapper: isMobile ? "items-end !fixed !inset-0" : "",
        backdrop: "bg-black/60 backdrop-blur-xl",
      }}
    >
      <ModalContent
        className={`
          ${isMobile
            ? 'h-[90svh] max-h-[90svh] rounded-t-3xl m-0 !fixed !bottom-0 !left-0 !right-0'
            : 'max-h-[90vh] rounded-2xl'
          }
          bg-gradient-to-b from-white via-gray-50 to-white 
          dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 
          border-2 border-gray-200/30 dark:border-gray-700/30 
          shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/10
          flex flex-col
        `}>
        <div ref={modalContentRef}>
          {/* Gradient Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600" />

          <ModalHeader className={`
          border-b border-gray-200/50 dark:border-gray-700/50 
          ${isMobile ? 'pb-4 pt-6 px-4' : 'pb-6 pt-8 px-8'}
          flex-shrink-0
        `}>
            <div className="w-full">
              <div className={`flex items-center ${isMobile ? 'gap-2' : 'space-x-3'} mb-2`}>
                <div className={`
                rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 
                dark:from-blue-900/20 dark:to-cyan-900/20 
                ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}
                flex items-center justify-center
              `}>
                  <svg className={`
                  ${isMobile ? 'w-5 h-5' : 'w-6 h-6'} 
                  text-blue-600 dark:text-blue-400
                `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className={`
                  font-bold bg-gradient-to-r from-gray-900 to-gray-700 
                  dark:from-white dark:to-gray-300 bg-clip-text text-transparent
                  ${isMobile ? 'text-lg' : 'text-2xl'}
                `}>
                    Delivery Confirmation
                  </h2>
                  <p className={`
                  text-gray-600 dark:text-gray-400 
                  ${isMobile ? 'text-xs' : 'text-sm'} 
                  mt-1 truncate
                `}>
                    Enterprise delivery verification system
                  </p>
                </div>
              </div>
            </div>
          </ModalHeader>

          <ModalBody
            className={`
            overflow-y-auto flex-grow
            ${isMobile ? 'pt-4 px-4 pb-4' : 'pt-6 px-8'}
          `}>
            <div ref={contentWrapperRef} className="space-y-4">
              {/* Delivery ID Input Section */}
              <div className="space-y-4 mb-6">
                <div className={isMobile ? 'space-y-3' : 'grid lg:grid-cols-4 gap-4'}>
                  <div className={isMobile ? '' : 'lg:col-span-3'}>
                    <div className="relative">
                      <Input
                        label="Delivery / Order ID"
                        labelPlacement="outside"
                        placeholder="Enter order number e.g SAL251100001"
                        value={deliveryId}
                        onChange={(e) => setDeliveryId(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={handleInputFocus}
                        isDisabled={loading || otpSent || deliveryCompleted}
                        variant="bordered"
                        className="w-full"
                        size={isMobile ? "md" : "lg"}
                        radius="lg"
                        classNames={{
                          input: isMobile ? "text-sm py-3 px-4" : "text-base py-4 px-6",
                          label: "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
                          inputWrapper: "border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:border-blue-500 dark:hover:border-blue-400"
                        }}
                        startContent={
                          <div className={`
                          rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 
                          dark:from-blue-900/20 dark:to-cyan-900/20 
                          ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}
                          flex items-center justify-center
                        `}>
                            <svg className={`
                            ${isMobile ? 'w-4 h-4' : 'w-5 h-5'} 
                            text-blue-600 dark:text-blue-400
                          `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                        }
                      />
                    </div>
                  </div>
                  <div className={`flex ${isMobile ? '' : 'items-end'}`}>
                    <Button
                      onClick={loadDeliveryItems}
                      color="primary"
                      isDisabled={!deliveryId.trim() || loading || otpSent || deliveryCompleted}
                      isLoading={loading}
                      className={`
                      w-full font-semibold 
                      ${isMobile ? 'h-12 text-sm' : 'h-14 text-base'}
                      rounded-xl shadow-lg shadow-blue-500/20
                    `}
                      size={isMobile ? "md" : "lg"}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Spinner size="sm" color="white" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        "Fetch Details"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border-2 border-red-200 dark:border-red-800/50">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-red-800 dark:text-red-300">Unable to Load Order</h4>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <Spinner
                      size="lg"
                      classNames={{
                        wrapper: "w-16 h-16",
                        circle1: "border-b-blue-600",
                        circle2: "border-b-cyan-500"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-xl" />
                  </div>
                  <p className={`mt-6 font-semibold text-gray-700 dark:text-gray-300 ${isMobile ? 'text-base' : 'text-lg'}`}>
                    Fetching Order Details
                  </p>
                  <p className={`text-gray-500 dark:text-gray-400 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Please wait while we retrieve the delivery information
                  </p>
                </div>
              )}

              {/* Order Information Section */}
              {orderInfo && !loading && (
                <div className="space-y-6">
                  {/* Order Summary Card */}
                  <Card className="border-2 border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm shadow-lg">
                    <CardBody className={isMobile ? 'p-4' : 'p-6'}>
                      <div className={isMobile ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-2 md:grid-cols-4 gap-6'}>
                        <div className="space-y-2">
                          <p className={`font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            Order ID
                          </p>
                          <p className={`font-bold text-gray-900 dark:text-white font-mono ${isMobile ? 'text-sm' : 'text-lg'}`}>
                            {orderInfo.id || deliveryId}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className={`font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            Status
                          </p>
                          <Chip
                            size={isMobile ? "md" : "lg"}
                            color={
                              orderInfo.status === 'delivered' ? 'success' :
                                orderInfo.status === 'pending' ? 'warning' :
                                  orderInfo.status === 'shipped' ? 'primary' : 'default'
                            }
                            variant="flat"
                            classNames={{
                              base: "px-3",
                              content: "font-semibold text-xs"
                            }}
                          >
                            {orderInfo.status?.toUpperCase()}
                          </Chip>
                        </div>
                        <div className="space-y-2">
                          <p className={`font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            Amount
                          </p>
                          <p className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                            Kshs {parseFloat(orderInfo.payable_amount || orderInfo.total_amount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className={`font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                            Date
                          </p>
                          <p className={`font-semibold text-gray-900 dark:text-white ${isMobile ? 'text-sm' : 'text-lg'}`}>
                            {orderInfo.created_at ? new Date(orderInfo.created_at).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Customer & Delivery Info Grid */}
                  <div className={isMobile ? 'space-y-6' : 'grid lg:grid-cols-2 gap-6'}>
                    {/* Customer Info */}
                    <Card className="border-2 border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 backdrop-blur-sm shadow-lg">
                      <CardBody className={isMobile ? 'p-4' : 'p-6'}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-base' : 'text-lg'}`}>
                            Customer Information
                          </h3>
                          <div className={`
                          rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 
                          dark:from-blue-900/20 dark:to-cyan-900/20 
                          ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}
                          flex items-center justify-center
                        `}>
                            <svg className={`
                            ${isMobile ? 'w-4 h-4' : 'w-5 h-5'} 
                            text-blue-600 dark:text-blue-400
                          `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className={`
                            rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 
                            flex items-center justify-center text-white font-bold shadow-lg
                            ${isMobile ? 'w-12 h-12 text-lg' : 'w-16 h-16 text-xl'}
                          `}>
                              {customerInfo?.name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-base' : 'text-xl'}`}>
                                {customerInfo?.name || 'Customer'}
                              </p>
                              {customerInfo?.phone && (
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className={`font-medium text-blue-700 dark:text-blue-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                      {customerInfo.phone}
                                    </span>
                                  </div>
                                  <span className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                                    (OTP will be sent here)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {customerInfo?.address && (
                            <div className={`${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-gray-50/50 dark:bg-gray-800/30`}>
                              <div className="flex items-start gap-3">
                                <div className={`
                                rounded-lg bg-blue-100 dark:bg-blue-900/20 
                                flex items-center justify-center flex-shrink-0
                                ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}
                              `}>
                                  <svg className={`
                                  ${isMobile ? 'w-4 h-4' : 'w-5 h-5'} 
                                  text-blue-600 dark:text-blue-400
                                `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <div className="min-w-0">
                                  <p className={`font-semibold text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'} mb-1`}>
                                    Delivery Address
                                  </p>
                                  <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                    {customerInfo.address}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>

                    {/* Delivery Info */}
                    <Card className="border-2 border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-800/50 dark:to-emerald-900/10 backdrop-blur-sm shadow-lg">
                      <CardBody className={isMobile ? 'p-4' : 'p-6'}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-base' : 'text-lg'}`}>
                            Delivery Information
                          </h3>
                          <div className={`
                          rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 
                          dark:from-emerald-900/20 dark:to-teal-900/20 
                          ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}
                          flex items-center justify-center
                        `}>
                            <svg className={`
                            ${isMobile ? 'w-4 h-4' : 'w-5 h-5'} 
                            text-emerald-600 dark:text-emerald-400
                          `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        {orderInfo.delivery ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className={`font-semibold text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                  Status
                                </p>
                                <Chip
                                  size={isMobile ? "md" : "lg"}
                                  color={
                                    orderInfo.delivery.status === 'delivered' ? 'success' :
                                      orderInfo.delivery.status === 'pending' ? 'warning' :
                                        orderInfo.delivery.status === 'in_transit' ? 'primary' : 'default'
                                  }
                                  variant="flat"
                                  classNames={{
                                    base: "px-3 w-full justify-center",
                                    content: "font-semibold text-xs"
                                  }}
                                >
                                  {orderInfo.delivery.status?.toUpperCase()}
                                </Chip>
                              </div>
                              <div className="space-y-2">
                                <p className={`font-semibold text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                  OTP Verified
                                </p>
                                <Chip
                                  size={isMobile ? "md" : "lg"}
                                  color={orderInfo.delivery.otp_verified ? 'success' : 'warning'}
                                  variant="flat"
                                  classNames={{
                                    base: "px-3 w-full justify-center",
                                    content: "font-semibold text-xs"
                                  }}
                                >
                                  {orderInfo.delivery.otp_verified ? 'YES' : 'NO'}
                                </Chip>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={`text-center ${isMobile ? 'py-4' : 'py-8'}`}>
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-3 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">No delivery information available</p>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </div>

                  {/* Delivery Items Section */}
                  {items.length > 0 && (
                    <Card className="border-2 border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm shadow-lg">
                      <CardBody className={isMobile ? 'p-4' : 'p-6'}>
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-base' : 'text-lg'}`}>
                              Delivery Items
                            </h3>
                            <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} mt-1`}>
                              Select items that have been delivered
                            </p>
                          </div>
                          <Chip
                            color="primary"
                            variant="solid"
                            size={isMobile ? "md" : "lg"}
                            classNames={{
                              base: "px-3",
                              content: "font-bold text-xs"
                            }}
                          >
                            {items.filter(i => i.confirmed).length} / {items.length}
                          </Chip>
                        </div>

                        <Divider className="mb-4" />

                        <div className={`space-y-3 max-h-[250px] overflow-y-auto pr-2 ${isMobile ? '' : ''}`}>
                          {items.map((item, index) => (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} rounded-xl transition-all duration-300 ${item.confirmed
                                ? 'bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/5 border-2 border-green-200/50 dark:border-green-800/30'
                                : 'bg-gray-50/50 dark:bg-gray-800/30 border-2 border-gray-200/30 dark:border-gray-700/30'
                                }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Checkbox
                                  isSelected={item.confirmed}
                                  onValueChange={(checked) => {
                                    const updated = [...items];
                                    updated[index].confirmed = checked;
                                    setItems(updated);
                                  }}
                                  isDisabled={otpSent || deliveryCompleted}
                                  color="success"
                                  size={isMobile ? "md" : "lg"}
                                />
                                <div className={`
                                rounded-lg flex items-center justify-center 
                                ${item.confirmed
                                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20'
                                    : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'
                                  }
                                ${isMobile ? 'w-10 h-10' : 'w-14 h-14'}
                              `}>
                                  <span className={`font-bold ${item.confirmed
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                    } ${isMobile ? 'text-base' : 'text-lg'}`}>
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-semibold text-gray-900 dark:text-white ${isMobile ? 'text-sm' : 'text-base'} truncate`}>
                                    {item.name}
                                  </p>
                                  <div className="flex flex-col gap-1 mt-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                                        Qty: {item.quantity} {item.unit}
                                      </span>
                                      <span className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                        Price: <span className="font-semibold text-gray-900 dark:text-white">Kshs {item.price.toLocaleString()}</span>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className={`px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs' : 'text-xs'} font-medium truncate max-w-[150px]`}>
                                        ID: <code className="font-mono">{item.product_id}</code>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-2">
                                <p className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-base' : 'text-xl'}`}>
                                  Kshs {(item.price * item.quantity).toLocaleString()}
                                </p>
                                <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                  Total
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Error Message for OTP */}
                        {otpError && (
                          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border-2 border-red-200 dark:border-red-800/50">
                            <div className="flex items-center gap-3">
                              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className={`font-medium text-red-700 dark:text-red-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                {otpError}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Get OTP Button */}
                        {!otpSent && !deliveryCompleted && items.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                            <Button
                              color="success"
                              onClick={generateOtpForDelivery}
                              isDisabled={otpLoading || items.filter(i => i.confirmed).length === 0 || !customerInfo?.phone}
                              isLoading={otpLoading}
                              className={`
                              w-full font-bold rounded-xl shadow-xl shadow-green-500/20 
                              bg-gradient-to-r from-green-600 to-emerald-600
                              ${isMobile ? 'h-12 text-base' : 'h-14 text-lg'}
                            `}
                              size={isMobile ? "md" : "lg"}
                            >
                              {otpLoading ? (
                                <div className="flex items-center gap-3">
                                  <Spinner size="sm" color="white" />
                                  <span>Sending OTP...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-3">
                                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span>Send OTP to Customer</span>
                                </div>
                              )}
                            </Button>

                            {!customerInfo?.phone && (
                              <p className={`text-center text-red-600 dark:text-red-400 mt-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                Cannot send OTP: Customer phone number not found.
                              </p>
                            )}

                            {customerInfo?.phone && (
                              <p className={`text-center text-gray-500 dark:text-gray-400 mt-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                OTP will be sent to: {customerInfo.phone}
                              </p>
                            )}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  )}

                  {/* Delivery Completed Message */}
                  {deliveryCompleted && (
                    <div className={`${isMobile ? 'p-6' : 'p-8'} rounded-2xl bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-teal-900/10 border-2 border-green-200 dark:border-green-800/50`}>
                      <div className="flex items-center justify-center gap-4 flex-col md:flex-row">
                        <div className="relative">
                          <div className={`rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-500/30 ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}`}>
                            <svg className={`text-white ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse" />
                        </div>
                        <div className="text-center md:text-left">
                          <h3 className={`font-bold text-gray-900 dark:text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                            Delivery Confirmed!
                          </h3>
                          <p className={`text-gray-600 dark:text-gray-300 mt-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                            Order ID: <span className="font-mono font-bold text-green-600 dark:text-green-400">{deliveryId}</span> has been successfully confirmed.
                          </p>
                          <p className={`text-gray-500 dark:text-gray-400 mt-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            OTP has been sent to the customer. This modal will close automatically...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className={`
          border-t border-gray-200/50 dark:border-gray-700/50 
          ${isMobile ? 'pt-4 pb-6 px-4' : 'pt-6 pb-8 px-8'}
          flex-shrink-0
        `}>
            <div className={`flex gap-3 w-full ${isMobile ? 'flex-col' : ''}`}>
              <Button
                color="default"
                variant="light"
                onClick={onClose}
                className={`
                ${isMobile ? 'h-11 text-sm' : 'h-12 text-base'}
                font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700
              `}
                size={isMobile ? "md" : "md"}
              >
                {deliveryCompleted ? "Close Now" : "Cancel"}
              </Button>

              {orderInfo && !deliveryCompleted && !loading && (
                <Button
                  color="primary"
                  onClick={loadDeliveryItems}
                  className={`
                  ${isMobile ? 'h-11 text-sm' : 'h-12 text-base'}
                  font-semibold rounded-xl shadow-lg shadow-blue-500/20
                  bg-gradient-to-r from-blue-600 to-cyan-600
                `}
                  size={isMobile ? "md" : "md"}
                >
                  Refresh Details
                </Button>
              )}
            </div>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  );
}