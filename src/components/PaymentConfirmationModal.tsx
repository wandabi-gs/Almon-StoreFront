"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Progress,
    Badge,
    Spinner,
    Card,
    CardBody
} from "@heroui/react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-backend-snc5.onrender.com';

interface PaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    saleId: string | null;
    checkoutRequestId: string | null;
    phoneNumber: string;
    totalAmount: number;
    onPaymentSuccess: () => void;
    onPaymentFailure: () => void;
    onPaymentCancel: () => void;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
    isOpen,
    onClose,
    saleId,
    checkoutRequestId,
    phoneNumber,
    totalAmount,
    onPaymentSuccess,
    onPaymentFailure,
    onPaymentCancel
}) => {
    // State variables - declare these FIRST
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed' | 'cancelled'>('pending');
    const [pollingCount, setPollingCount] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");
    const [showRetry, setShowRetry] = useState(false);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const maxRetries = 30; // Max 30 attempts (3 minutes with 6-second intervals)

    // NOW add debug useEffect AFTER state declarations
    useEffect(() => {
        console.log("=== PaymentConfirmationModal Debug ===");
        console.log("isOpen:", isOpen);
        console.log("saleId:", saleId);
        console.log("checkoutRequestId:", checkoutRequestId);
        console.log("phoneNumber:", phoneNumber);
        console.log("totalAmount:", totalAmount);
        console.log("paymentStatus:", paymentStatus);
        console.log("=== End Debug ===");
    }, [isOpen, saleId, checkoutRequestId, phoneNumber, totalAmount, paymentStatus]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    // Start polling when modal opens
    useEffect(() => {
        if (isOpen && checkoutRequestId && paymentStatus === 'pending') {
            setPaymentStatus('processing');
            setStatusMessage("Waiting for you to enter PIN on your phone...");
            startPaymentPolling();
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [isOpen, checkoutRequestId, paymentStatus]);

    // Function to query payment status using the correct endpoint
    const queryPaymentStatus = async (checkoutReqId: string): Promise<{
        status: 'pending' | 'success' | 'failed';
        message: string;
        data?: any;
    }> => {
        try {
            console.log(`🔍 Querying payment status for checkoutRequestID: ${checkoutReqId}`);

            // Try both endpoints to see which one works
            try {
                // First try the /api/payments/queryStatus endpoint
                const response = await axios.post(`${API_BASE_URL}/api/payments/queryStatus`, {
                    checkoutRequestID: checkoutReqId
                });

                console.log("📡 Payment status response:", response.data);

                const result = response.data;
                const resultCode = result.ResultCode || result.resultCode || result.status;
                const resultDesc = result.ResultDesc || result.resultDesc || result.message;

                console.log(`📊 Extracted resultCode: ${resultCode}, resultDesc: ${resultDesc}`);

                if (resultCode === '0') {
                    return {
                        status: 'success',
                        message: 'Payment completed successfully',
                        data: result
                    };
                } else if (resultCode && resultCode !== '0') {
                    return {
                        status: 'failed',
                        message: resultDesc || `Payment failed with code: ${resultCode}`,
                        data: result
                    };
                } else {
                    return {
                        status: 'pending',
                        message: 'Payment is still being processed',
                        data: result
                    };
                }
            } catch (queryError) {
                console.log("⚠️ First query endpoint failed, trying alternative...");

                // Alternative: Try to get order status which might include payment info
                if (saleId) {
                    const orderResponse = await axios.get(`${API_BASE_URL}/customer/orders/${saleId}`);
                    console.log("📡 Order status response:", orderResponse.data);

                    const orderData = orderResponse.data;
                    const paymentStatus = orderData.payment_status || orderData.status;

                    if (paymentStatus === 'paid' || paymentStatus === 'completed') {
                        return {
                            status: 'success',
                            message: 'Payment completed successfully',
                            data: orderData
                        };
                    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
                        return {
                            status: 'failed',
                            message: `Payment ${paymentStatus}`,
                            data: orderData
                        };
                    } else {
                        return {
                            status: 'pending',
                            message: 'Waiting for payment confirmation',
                            data: orderData
                        };
                    }
                }

                throw queryError;
            }
        } catch (error: any) {
            console.error("❌ Error checking payment status:", error);
            console.error("Error response:", error.response?.data);

            return {
                status: 'pending',
                message: error.response?.data?.message || 'Unable to verify payment status'
            };
        }
    };

    // Start polling for payment confirmation
    const startPaymentPolling = () => {
        if (!checkoutRequestId) {
            console.error("❌ No checkoutRequestId provided to startPaymentPolling");
            setPaymentStatus('failed');
            setStatusMessage("No transaction ID available for verification.");
            setShowRetry(true);
            return;
        }

        console.log(`🚀 Starting payment polling with checkoutRequestId: ${checkoutRequestId}`);
        retryCountRef.current = 0;

        pollingRef.current = setInterval(async () => {
            if (!checkoutRequestId || retryCountRef.current >= maxRetries) {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }

                if (retryCountRef.current >= maxRetries) {
                    console.warn(`⏰ Payment verification timeout after ${maxRetries} attempts`);
                    setPaymentStatus('failed');
                    setStatusMessage("Payment verification timeout. Please check your M-Pesa statement.");
                    setShowRetry(true);
                }
                return;
            }

            retryCountRef.current += 1;
            setPollingCount(prev => prev + 1);

            console.log(`🔄 Polling attempt ${retryCountRef.current}/${maxRetries}`);

            try {
                const statusResult = await queryPaymentStatus(checkoutRequestId);

                console.log(`📋 Poll ${retryCountRef.current} result:`, statusResult.status);

                if (statusResult.status === 'success') {
                    // Payment successful
                    clearInterval(pollingRef.current as NodeJS.Timeout);
                    pollingRef.current = null;

                    setPaymentStatus('success');
                    setStatusMessage(statusResult.message);

                    console.log("✅ Payment successful, calling onPaymentSuccess in 2 seconds...");

                    // Wait a moment then trigger success
                    setTimeout(() => {
                        onPaymentSuccess();
                    }, 2000);

                } else if (statusResult.status === 'failed') {
                    // Payment failed
                    clearInterval(pollingRef.current as NodeJS.Timeout);
                    pollingRef.current = null;

                    console.log("❌ Payment failed:", statusResult.message);

                    setPaymentStatus('failed');
                    setStatusMessage(statusResult.message);
                    setShowRetry(true);
                } else {
                    // Still pending
                    console.log("⏳ Payment still pending:", statusResult.message);
                }
            } catch (error) {
                console.error("⚠️ Polling error:", error);
            }
        }, 6000); // Check every 6 seconds
    };

    // Handle manual retry
    const handleRetry = () => {
        console.log("🔄 Manual retry requested");

        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }

        setPaymentStatus('pending');
        setPollingCount(0);
        setShowRetry(false);
        setStatusMessage("Retrying payment verification...");

        // Restart polling
        setTimeout(() => {
            startPaymentPolling();
        }, 1000);
    };

    // Handle manual cancel - now uses onClose prop
    const handleCancel = () => {
        console.log("❌ Payment verification cancelled by user");

        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }

        setPaymentStatus('cancelled');
        setStatusMessage("Payment verification cancelled.");

        // Call the onClose prop which will handle the cancellation
        onClose();
    };

    // Function to get status badge color
    const getStatusBadgeColor = () => {
        switch (paymentStatus) {
            case 'success': return "success";
            case 'failed': return "danger";
            case 'cancelled': return "warning";
            case 'processing': return "primary";
            default: return "default";
        }
    };

    // Function to get status badge text
    const getStatusBadgeText = () => {
        switch (paymentStatus) {
            case 'success': return "SUCCESS";
            case 'failed': return "FAILED";
            case 'cancelled': return "CANCELLED";
            case 'processing': return "PROCESSING";
            default: return "PENDING";
        }
    };

    const getStatusIcon = () => {
        switch (paymentStatus) {
            case 'success':
                return (
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                    </div>
                );
            case 'failed':
                return (
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                );
            case 'cancelled':
                return (
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                );
            case 'processing':
                return (
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Spinner size="lg" color="primary" />
                    </div>
                );
            default:
                return (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">💳</span>
                    </div>
                );
        }
    };

    const getStatusTitle = () => {
        switch (paymentStatus) {
            case 'success': return "Payment Successful!";
            case 'failed': return "Payment Failed";
            case 'cancelled': return "Payment Cancelled";
            case 'processing': return "Waiting for Payment";
            default: return "Confirm Payment";
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            size="md"
            hideCloseButton={paymentStatus === 'processing'}
            isDismissable={paymentStatus !== 'processing'}
        >
            <ModalContent className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <ModalHeader className="flex flex-col items-center gap-2">
                    {getStatusIcon()}
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-bold text-center">{getStatusTitle()}</h2>
                        <Badge
                            color={getStatusBadgeColor()}
                            variant="flat"
                            className="mt-2"
                        >
                            {getStatusBadgeText()}
                        </Badge>
                    </div>
                </ModalHeader>
                <ModalBody className="space-y-4">
                    {/* Order Info */}
                    <Card className="bg-gray-50 dark:bg-gray-700/30">
                        <CardBody className="p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-300">Order ID:</span>
                                    <Badge variant="flat" size="sm" className="font-mono">
                                        {saleId || "N/A"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                                    <span className="font-semibold">KES {totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Phone:</span>
                                    <span className="font-medium">{phoneNumber}</span>
                                </div>
                                {checkoutRequestId && (
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-300 text-xs">Transaction ID:</span>
                                        <Badge
                                            variant="flat"
                                            size="sm"
                                            color="primary"
                                            className="font-mono text-xs truncate max-w-[150px]"
                                            title={checkoutRequestId}
                                        >
                                            {checkoutRequestId.substring(0, 8)}...
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Status Message */}
                    <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                            {statusMessage || "Please check your phone and enter your M-Pesa PIN to complete the payment."}
                        </p>

                        {paymentStatus === 'processing' && (
                            <div className="mt-4">
                                <Progress
                                    size="sm"
                                    value={(pollingCount * 5) % 100}
                                    className="mb-3"
                                    classNames={{
                                        indicator: "bg-gradient-to-r from-blue-500 to-purple-500",
                                    }}
                                />
                                <div className="flex items-center justify-center space-x-2">
                                    <Badge variant="flat" color="primary" size="sm">
                                        Polling: {pollingCount}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                        Checking payment status...
                                    </span>
                                </div>
                                <div className="flex justify-center space-x-2 mt-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    {paymentStatus === 'processing' && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <span className="text-lg mr-2">📱</span>
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                                    Phone Instructions
                                </h4>
                            </div>
                            <ol className="list-decimal list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                <li>Check your phone for M-Pesa prompt</li>
                                <li>Enter your M-Pesa PIN when prompted</li>
                                <li>Wait for confirmation message</li>
                                <li>This window will automatically update</li>
                            </ol>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter className="flex flex-col sm:flex-row gap-2">
                    {paymentStatus === 'processing' && (
                        <>
                            <Button
                                color="danger"
                                variant="flat"
                                onPress={handleCancel}
                                className="w-full sm:w-auto"
                            >
                                Cancel Payment
                            </Button>
                            <Button
                                color="primary"
                                variant="flat"
                                isDisabled
                                className="w-full sm:w-auto"
                            >
                                <Spinner size="sm" className="mr-2" />
                                Verifying...
                            </Button>
                        </>
                    )}

                    {paymentStatus === 'failed' && showRetry && (
                        <>
                            <Button
                                color="danger"
                                variant="flat"
                                onPress={onPaymentFailure}
                                className="w-full sm:w-auto"
                            >
                                Go Back
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleRetry}
                                className="w-full sm:w-auto"
                            >
                                Retry Verification
                            </Button>
                        </>
                    )}

                    {paymentStatus === 'success' && (
                        <Button
                            color="success"
                            onPress={onPaymentSuccess}
                            className="w-full"
                        >
                            Continue Shopping
                        </Button>
                    )}

                    {paymentStatus === 'cancelled' && (
                        <Button
                            color="warning"
                            onPress={onPaymentCancel}
                            className="w-full"
                        >
                            Close
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};