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

      // Transform items
      if (orderData.items && Array.isArray(orderData.items)) {
        const transformedItems: OrderItem[] = orderData.items.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          product_id: item.id || `prod-${index}`,
          name: `Item ${index + 1}`,
          quantity: item.quantity || 1,
          price: parseFloat(item.price) || 0,
          unit: "pcs",
          confirmed: true,
        }));
        setItems(transformedItems);
      } else {
        const sampleItems: OrderItem[] = [{
          id: "sample-1",
          product_id: "sample-1",
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
      setOtpError("Please select delivered items");
      return;
    }

    const products: ProductItem[] = deliveredItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit: item.unit || "pcs",
    }));

    setOtpLoading(true);
    setOtpError("");

    try {
      const payload = { delivery_id: deliveryId, products };
      const response = await axios.post(`${API_BASE}/api/Customer/confirmOrder`, payload);

      if (response.data && (response.data.success || response.data.message)) {
        setOtpSent(true);
        setShowDeliveryNote(true);
      } else {
        throw new Error(response.data?.message || "Failed to generate OTP");
      }
    } catch (err: any) {
      console.error("Error generating OTP:", err);
      setOtpError(err.response?.data?.message || err.message || "Failed to generate OTP.");
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
      const payload = { delivery_id: deliveryId, otp };
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
        size="3xl"
        className="max-h-[85vh]"
      >
        <ModalContent>
          <ModalHeader className="border-b pb-3">
            <div className="w-full">
              <h2 className="text-xl font-bold">Confirm Delivery</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter delivery ID or order number to confirm delivery
              </p>
            </div>
          </ModalHeader>

          <ModalBody className="pt-4">
            {/* Delivery ID Input Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Input
                    label="Delivery/Order ID"
                    placeholder="Enter order number e.g SAL251100001"
                    value={deliveryId}
                    onChange={(e) => setDeliveryId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    isDisabled={loading || otpSent || deliveryCompleted}
                    variant="bordered"
                    className="w-full"
                    startContent={
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={loadDeliveryItems}
                    color="primary"
                    isDisabled={!deliveryId.trim() || loading || otpSent || deliveryCompleted}
                    isLoading={loading}
                    className="w-full"
                  >
                    {loading ? "Loading..." : "Fetch Details"}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-8">
                <Spinner label="Fetching order details..." color="primary" size="lg" />
              </div>
            )}

            {/* Order Information Section */}
            {orderInfo && !loading && (
              <div className="space-y-4">
                {/* Order Summary Card */}
                <Card className="border shadow-sm">
                  <CardBody className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Order ID</p>
                        <p className="font-semibold text-sm">{orderInfo.id || deliveryId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <Chip
                          size="sm"
                          color={
                            orderInfo.status === 'delivered' ? 'success' :
                              orderInfo.status === 'pending' ? 'warning' :
                                orderInfo.status === 'shipped' ? 'primary' : 'default'
                          }
                          variant="flat"
                        >
                          {orderInfo.status}
                        </Chip>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                        <p className="font-semibold text-sm">Kshs {parseFloat(orderInfo.payable_amount || orderInfo.total_amount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date</p>
                        <p className="font-semibold text-sm">
                          {orderInfo.created_at ? new Date(orderInfo.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Customer & Delivery Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Info */}
                  <Card className="border shadow-sm">
                    <CardBody className="p-4">
                      <h3 className="font-semibold text-sm mb-3 flex items-center justify-between">
                        <span>Customer Information</span>
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {customerInfo?.name?.charAt(0) || 'C'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{customerInfo?.name || 'Customer'}</p>
                            {customerInfo?.phone && (
                              <p className="text-xs text-gray-600">{customerInfo.phone}</p>
                            )}
                          </div>
                        </div>
                        {customerInfo?.address && (
                          <div className="text-xs text-gray-600 mt-2">
                            <span className="font-medium">Address: </span>
                            {customerInfo.address}
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Delivery Info */}
                  <Card className="border shadow-sm">
                    <CardBody className="p-4">
                      <h3 className="font-semibold text-sm mb-3">Delivery Information</h3>
                      {orderInfo.delivery ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-gray-500">Status</p>
                              <Chip
                                size="sm"
                                color={
                                  orderInfo.delivery.status === 'delivered' ? 'success' :
                                    orderInfo.delivery.status === 'pending' ? 'warning' :
                                      orderInfo.delivery.status === 'in_transit' ? 'primary' : 'default'
                                }
                                variant="flat"
                                className="mt-1"
                              >
                                {orderInfo.delivery.status}
                              </Chip>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">OTP Verified</p>
                              <Chip
                                size="sm"
                                color={orderInfo.delivery.otp_verified ? 'success' : 'warning'}
                                variant="flat"
                                className="mt-1"
                              >
                                {orderInfo.delivery.otp_verified ? 'Yes' : 'No'}
                              </Chip>
                            </div>
                          </div>
                          {orderInfo.delivery.delivery_date && (
                            <div className="text-xs">
                              <span className="text-gray-500">Delivery Date: </span>
                              <span className="font-medium">
                                {new Date(orderInfo.delivery.delivery_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No delivery information available</p>
                      )}
                    </CardBody>
                  </Card>
                </div>

                {/* Delivery Items Section */}
                {items.length > 0 && (
                  <Card className="border shadow-sm">
                    <CardBody className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-sm">
                          Delivery Items ({items.length})
                        </h3>
                        <Chip color="primary" variant="flat" size="sm">
                          {items.filter(i => i.confirmed).length} selected
                        </Chip>
                      </div>
                      <div className="space-y-2">
                        {items.map((item, index) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                isSelected={item.confirmed}
                                onValueChange={(checked) => {
                                  const updated = [...items];
                                  updated[index].confirmed = checked;
                                  setItems(updated);
                                }}
                                isDisabled={otpSent || deliveryCompleted}
                                color="success"
                                size="sm"
                              />
                              <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {item.name.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-gray-600">
                                    Qty: {item.quantity} {item.unit}
                                  </span>
                                  <span className="text-xs font-medium text-green-600">
                                    Kshs {item.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium">
                                Kshs {(item.price * item.quantity).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">Total</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Action Buttons */}
                {!otpSent && !deliveryCompleted && items.length > 0 && (
                  <div className="pt-2">
                    <Button
                      color="success"
                      onClick={generateOtpForDelivery}
                      isDisabled={otpLoading || items.filter(i => i.confirmed).length === 0}
                      isLoading={otpLoading}
                      className="w-full"
                      size="lg"
                    >
                      {otpLoading ? "Generating OTP..." : "Generate OTP & Confirm Delivery"}
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      OTP will be sent to customer's registered phone/email
                    </p>
                  </div>
                )}

                {/* Delivery Completed Message */}
                {deliveryCompleted && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Delivery Confirmed!</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Delivery ID: <span className="font-mono">{deliveryId}</span> completed successfully.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>

          <ModalFooter className="border-t pt-4">
            <Button
              color="default"
              variant="light"
              onClick={onClose}
              className="flex-1"
            >
              {deliveryCompleted ? "Close" : "Cancel"}
            </Button>
            {!deliveryCompleted && orderInfo && items.length > 0 && (
              <Button
                color="primary"
                variant="solid"
                onClick={generateOtpForDelivery}
                isDisabled={otpSent || items.filter(i => i.confirmed).length === 0}
                className="flex-1"
              >
                Confirm Delivery
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* OTP Modal */}
      <Modal
        isOpen={showDeliveryNote && !deliveryCompleted}
        onClose={() => !otpLoading && setShowDeliveryNote(false)}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Enter OTP</h3>
            <p className="text-sm text-gray-500">Enter 6-digit OTP sent to customer</p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  Please enter the 6-digit OTP sent to the customer
                </p>
                {customerInfo?.phone && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sent to: {customerInfo.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  label="6-digit OTP"
                  placeholder="000000"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setOtpError("");
                  }}
                  isDisabled={otpLoading}
                  className="text-center text-xl font-mono"
                  variant="bordered"
                  autoFocus
                  type="text"
                  inputMode="numeric"
                />

                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5, 6].map((pos) => (
                    <div
                      key={pos}
                      className={`w-2 h-2 rounded-full ${otp.length >= pos ? 'bg-blue-600' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              </div>

              {otpError && (
                <div className="p-2 bg-red-50 text-red-700 rounded text-sm">
                  {otpError}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onClick={() => setShowDeliveryNote(false)}
              isDisabled={otpLoading}
            >
              Cancel
            </Button>
            <Button
              color="success"
              onClick={verifyOtpAndCompleteDelivery}
              isDisabled={otp.length !== 6 || otpLoading}
              isLoading={otpLoading}
            >
              Complete Delivery
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}