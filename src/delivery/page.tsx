"use client";

import React, { useState, useEffect } from "react";
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
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [showDeliveryNote, setShowDeliveryNote] = useState(false);
  const [error, setError] = useState("");
  const [customerInfo, setCustomerInfo] = useState<any>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setDeliveryId("");
    setItems([]);
    setOtp("");
    setOtpSent(false);
    setDeliveryCompleted(false);
    setShowDeliveryNote(false);
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
      return response.data;
    } catch (err: any) {
      console.error("Error fetching order details:", err);
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

      // Set customer info
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
        });
      }

      // Transform items - IMPORTANT: Ensure product_id is captured correctly
      if (orderData.items && Array.isArray(orderData.items)) {
        const transformedItems: OrderItem[] = orderData.items.map((item: any, index: number) => {
          // Extract product_id from different possible field names
          const productId = item.product_id || item.id || item.productId || `prod-${index}`;

          console.log("Processing item:", {
            item,
            productId,
            availableFields: Object.keys(item)
          });

          return {
            id: item.id || `item-${index}`,
            product_id: productId, // Ensure product_id is captured
            name: item.name || item.product_name || `Item ${index + 1}`,
            quantity: item.quantity || 1,
            price: parseFloat(item.price) || 0,
            unit: item.unit || "pcs",
            confirmed: true,
          };
        });
        setItems(transformedItems);
      } else {
        const sampleItems: OrderItem[] = [{
          id: "sample-1",
          product_id: deliveryId, // Use deliveryId as fallback product_id
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

    // Prepare products array with product_id
    const products: ProductItem[] = deliveredItems.map((item) => {
      console.log("Preparing product for OTP:", {
        product_id: item.product_id,
        quantity: item.quantity,
        unit: item.unit || "pcs"
      });

      return {
        product_id: item.product_id, // This is the crucial field
        quantity: item.quantity,
        unit: item.unit || "pcs",
      };
    });

    console.log("Sending to API:", {
      delivery_id: deliveryId,
      products: products,
      productsCount: products.length,
      productIds: products.map(p => p.product_id)
    });

    setOtpLoading(true);
    setOtpError("");

    try {
      const payload = {
        delivery_id: deliveryId,
        products
      };

      const response = await axios.post(`${API_BASE}/api/Customer/confirmOrder`, payload);

      if (response.data && (response.data.success || response.data.message)) {
        setOtpSent(true);
        setShowDeliveryNote(true);
        console.log("OTP generated successfully:", response.data);
      } else {
        throw new Error(response.data?.message || "Failed to generate OTP");
      }
    } catch (err: any) {
      console.error("Error generating OTP:", err);
      console.error("Error response:", err.response?.data);
      setOtpError(err.response?.data?.message || err.message || "Failed to generate OTP. Please check the product IDs.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtpAndCompleteDelivery = async () => {
    if (otp.length !== 6) {
      setOtpError("Enter a valid 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const payload = {
        delivery_id: deliveryId,
        otp
      };
      const response = await axios.post(`${API_BASE}/api/Customer/confirmOrderOtp`, payload);

      if (response.data && (response.data.success || response.data.message)) {
        setDeliveryCompleted(true);
        setTimeout(() => {
          onClose();
          resetState();
        }, 3000);
      } else {
        throw new Error(response.data?.message || "Failed to verify OTP");
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setOtpError(err.response?.data?.message || err.message || "Failed to verify OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && deliveryId && !otpSent && !deliveryCompleted) {
      loadDeliveryItems();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        className="max-h-[95vh] backdrop-blur-xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent className="max-h-[95vh] overflow-hidden flex flex-col bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-2 border-gray-200/30 dark:border-gray-700/30 shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/10 rounded-2xl">
          {/* Gradient Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600" />

          <ModalHeader className="border-b border-gray-200/50 dark:border-gray-700/50 pb-6 pt-8 px-8 flex-shrink-0">
            <div className="w-full">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Delivery Confirmation
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Enterprise delivery verification and confirmation system
                  </p>
                </div>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="pt-6 px-8 overflow-y-auto flex-grow">
            {/* Delivery ID Input Section */}
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                  <div className="relative">
                    <Input
                      label="Delivery / Order ID"
                      labelPlacement="outside"
                      placeholder="Enter order number e.g SAL251100001"
                      value={deliveryId}
                      onChange={(e) => setDeliveryId(e.target.value)}
                      onKeyPress={handleKeyPress}
                      isDisabled={loading || otpSent || deliveryCompleted}
                      variant="bordered"
                      className="w-full"
                      size="lg"
                      radius="lg"
                      classNames={{
                        input: "text-base py-4 px-6",
                        label: "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
                        inputWrapper: "border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:border-blue-500 dark:hover:border-blue-400"
                      }}
                      startContent={
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                      }
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={loadDeliveryItems}
                    color="primary"
                    isDisabled={!deliveryId.trim() || loading || otpSent || deliveryCompleted}
                    isLoading={loading}
                    className="w-full h-14 font-semibold text-base rounded-xl shadow-lg shadow-blue-500/20"
                    size="lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" color="white" />
                        Loading...
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
                    <div>
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
                      wrapper: "w-20 h-20",
                      circle1: "border-b-blue-600",
                      circle2: "border-b-cyan-500"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-xl" />
                </div>
                <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">Fetching Order Details</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait while we retrieve the delivery information</p>
              </div>
            )}

            {/* Order Information Section */}
            {orderInfo && !loading && (
              <div className="space-y-8">
                {/* Order Summary Card */}
                <Card className="border-2 border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm shadow-xl">
                  <CardBody className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Order ID</p>
                        <p className="font-bold text-lg text-gray-900 dark:text-white font-mono">{orderInfo.id || deliveryId}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</p>
                        <Chip
                          size="lg"
                          color={
                            orderInfo.status === 'delivered' ? 'success' :
                              orderInfo.status === 'pending' ? 'warning' :
                                orderInfo.status === 'shipped' ? 'primary' : 'default'
                          }
                          variant="flat"
                          classNames={{
                            base: "px-4 py-1",
                            content: "font-semibold text-sm"
                          }}
                        >
                          {orderInfo.status?.toUpperCase()}
                        </Chip>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="font-bold text-2xl text-gray-900 dark:text-white">
                          Kshs {parseFloat(orderInfo.payable_amount || orderInfo.total_amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <Card className="border-2 border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 backdrop-blur-sm shadow-xl">
                    <CardBody className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customer Information</h3>
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {customerInfo?.name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-xl text-gray-900 dark:text-white">{customerInfo?.name || 'Customer'}</p>
                            {customerInfo?.phone && (
                              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {customerInfo.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        {customerInfo?.address && (
                          <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Delivery Address</p>
                                <p className="text-gray-600 dark:text-gray-400">{customerInfo.address}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Delivery Info */}
                  <Card className="border-2 border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-800/50 dark:to-emerald-900/10 backdrop-blur-sm shadow-xl">
                    <CardBody className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Information</h3>
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      {orderInfo.delivery ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Status</p>
                              <Chip
                                size="lg"
                                color={
                                  orderInfo.delivery.status === 'delivered' ? 'success' :
                                    orderInfo.delivery.status === 'pending' ? 'warning' :
                                      orderInfo.delivery.status === 'in_transit' ? 'primary' : 'default'
                                }
                                variant="flat"
                                classNames={{
                                  base: "px-4 py-2 w-full justify-center",
                                  content: "font-semibold"
                                }}
                              >
                                {orderInfo.delivery.status.toUpperCase()}
                              </Chip>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">OTP Verified</p>
                              <Chip
                                size="lg"
                                color={orderInfo.delivery.otp_verified ? 'success' : 'warning'}
                                variant="flat"
                                classNames={{
                                  base: "px-4 py-2 w-full justify-center",
                                  content: "font-semibold"
                                }}
                              >
                                {orderInfo.delivery.otp_verified ? 'VERIFIED' : 'PENDING'}
                              </Chip>
                            </div>
                          </div>
                          {orderInfo.delivery.delivery_date && (
                            <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Scheduled Delivery</p>
                                  <p className="text-gray-900 dark:text-white font-semibold">
                                    {new Date(orderInfo.delivery.delivery_date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">No delivery information available</p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>

                {/* Delivery Items Section */}
                {items.length > 0 && (
                  <Card className="border-2 border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm shadow-xl">
                    <CardBody className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Items</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select items that have been delivered</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Product IDs will be captured for OTP verification
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Chip
                            color="primary"
                            variant="solid"
                            size="lg"
                            classNames={{
                              base: "px-4 py-1",
                              content: "font-bold"
                            }}
                          >
                            {items.filter(i => i.confirmed).length} / {items.length}
                          </Chip>
                        </div>
                      </div>

                      <Divider className="mb-6" />

                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {items.map((item, index) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${item.confirmed
                                ? 'bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/5 border-2 border-green-200/50 dark:border-green-800/30'
                                : 'bg-gray-50/50 dark:bg-gray-800/30 border-2 border-gray-200/30 dark:border-gray-700/30'
                              }`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <Checkbox
                                isSelected={item.confirmed}
                                onValueChange={(checked) => {
                                  const updated = [...items];
                                  updated[index].confirmed = checked;
                                  setItems(updated);
                                }}
                                isDisabled={otpSent || deliveryCompleted}
                                color="success"
                                size="lg"
                                classNames={{
                                  base: "mr-2"
                                }}
                              />
                              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${item.confirmed
                                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20'
                                  : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'
                                }`}>
                                <span className={`text-lg font-bold ${item.confirmed
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                <div className="flex flex-col gap-2 mt-2">
                                  <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium">
                                      Qty: {item.quantity} {item.unit}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                                      Unit Price: <span className="font-semibold text-gray-900 dark:text-white">Kshs {item.price.toLocaleString()}</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                      Product ID: <code className="font-mono">{item.product_id}</code>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                Kshs {(item.price * item.quantity).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Get OTP Button */}
                      {!otpSent && !deliveryCompleted && items.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                          <Button
                            color="success"
                            onClick={generateOtpForDelivery}
                            isDisabled={otpLoading || items.filter(i => i.confirmed).length === 0}
                            isLoading={otpLoading}
                            className="w-full h-14 font-bold text-lg rounded-xl shadow-xl shadow-green-500/20 bg-gradient-to-r from-green-600 to-emerald-600"
                            size="lg"
                          >
                            {otpLoading ? (
                              <div className="flex items-center gap-3">
                                <Spinner size="sm" color="white" />
                                <span>Generating OTP...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Get OTP for Delivery</span>
                              </div>
                            )}
                          </Button>
                          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                            OTP will be sent to the customer's registered phone/email for verification
                          </p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                )}

                {/* Delivery Completed Message */}
                {deliveryCompleted && (
                  <div className="p-8 rounded-2xl bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-teal-900/10 border-2 border-green-200 dark:border-green-800/50">
                    <div className="flex items-center justify-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-500/30">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Confirmed!</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                          Delivery ID: <span className="font-mono font-bold text-green-600 dark:text-green-400">{deliveryId}</span> has been successfully confirmed.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                          This modal will close automatically...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>

          <ModalFooter className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6 pb-8 px-8 flex-shrink-0">
            <div className="flex gap-4 w-full">
              <Button
                color="default"
                variant="light"
                onClick={onClose}
                className="flex-1 h-12 font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700"
              >
                {deliveryCompleted ? "Close" : "Cancel"}
              </Button>
              {/* Removed Confirm Delivery button as requested */}
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* OTP Modal */}
      <Modal
        isOpen={showDeliveryNote && !deliveryCompleted}
        onClose={() => !otpLoading && setShowDeliveryNote(false)}
        size="md"
        backdrop="blur"
        className="backdrop-blur-xl"
      >
        <ModalContent className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-2 border-gray-200/30 dark:border-gray-700/30 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600" />

          <ModalHeader className="pt-8 pb-2">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700/50 flex items-center justify-center">
                <div className="relative">
                  <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="absolute -inset-4 bg-blue-400/10 blur-xl rounded-full" />
                </div>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Enter Verification Code
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Enter the 6-digit OTP sent to the customer
              </p>
            </div>
          </ModalHeader>

          <ModalBody className="py-6">
            <div className="space-y-6">
              <div className="text-center">
                {customerInfo?.phone && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{customerInfo.phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label="6-digit OTP"
                    labelPlacement="outside"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      setOtpError("");
                    }}
                    isDisabled={otpLoading}
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-center text-3xl font-mono tracking-widest py-8",
                      label: "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3",
                      inputWrapper: "border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    }}
                    autoFocus
                    type="text"
                    inputMode="numeric"
                  />

                  {/* OTP Indicator */}
                  <div className="flex justify-center gap-3 mt-6">
                    {[1, 2, 3, 4, 5, 6].map((pos) => (
                      <div
                        key={pos}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${otp.length >= pos
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 scale-110'
                            : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                      />
                    ))}
                  </div>
                </div>

                {otpError && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border-2 border-red-200 dark:border-red-800/50">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">{otpError}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="pb-8">
            <div className="flex gap-3 w-full">
              <Button
                color="default"
                variant="light"
                onClick={() => setShowDeliveryNote(false)}
                isDisabled={otpLoading}
                className="flex-1 h-12 font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                color="success"
                onClick={verifyOtpAndCompleteDelivery}
                isDisabled={otp.length !== 6 || otpLoading}
                isLoading={otpLoading}
                className="flex-1 h-12 font-semibold rounded-xl shadow-lg shadow-green-500/20 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {otpLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" color="white" />
                    Verifying...
                  </div>
                ) : (
                  "Complete Delivery"
                )}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}