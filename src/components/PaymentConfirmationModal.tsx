"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Badge,
    Spinner,
    Card,
    CardBody,
    Divider,
    Chip
} from "@heroui/react";
import axios from "axios";
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Smartphone,
    CreditCard,
    Shield,
    RefreshCw,
    ExternalLink
} from "lucide-react";

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
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed' | 'cancelled'>('pending');
    const [pollingCount, setPollingCount] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");
    const [showRetry, setShowRetry] = useState(false);
    const [progressValue, setProgressValue] = useState(0);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const maxRetries = 30;
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Animated progress bar
    useEffect(() => {
        if (paymentStatus === 'processing') {
            progressIntervalRef.current = setInterval(() => {
                setProgressValue(prev => {
                    if (prev >= 95) return 95;
                    return prev + (100 / maxRetries);
                });
            }, 6000);
        } else {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            if (paymentStatus === 'success') {
                setProgressValue(100);
            } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
                setProgressValue(0);
            }
        }

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [paymentStatus]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []);

    // Start polling when modal opens
    useEffect(() => {
        if (isOpen && checkoutRequestId && paymentStatus === 'pending') {
            setPaymentStatus('processing');
            setStatusMessage("Awaiting PIN confirmation on your device");
            startPaymentPolling();
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [isOpen, checkoutRequestId, paymentStatus]);

    const queryPaymentStatus = async (checkoutReqId: string): Promise<{
        status: 'pending' | 'success' | 'failed';
        message: string;
        data?: any;
    }> => {
        try {
            console.log(`🔍 Querying payment status for checkoutRequestID: ${checkoutReqId}`);

            try {
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
        setProgressValue(0);

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
                    clearInterval(pollingRef.current as NodeJS.Timeout);
                    pollingRef.current = null;

                    setPaymentStatus('success');
                    setStatusMessage(statusResult.message);

                    setTimeout(() => {
                        onPaymentSuccess();
                    }, 2000);

                } else if (statusResult.status === 'failed') {
                    clearInterval(pollingRef.current as NodeJS.Timeout);
                    pollingRef.current = null;

                    console.log("❌ Payment failed:", statusResult.message);

                    setPaymentStatus('failed');
                    setStatusMessage(statusResult.message);
                    setShowRetry(true);
                }
            } catch (error) {
                console.error("⚠️ Polling error:", error);
            }
        }, 6000);
    };

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

        setTimeout(() => {
            startPaymentPolling();
        }, 1000);
    };

    const handleCancel = () => {
        console.log("❌ Payment verification cancelled by user");

        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }

        setPaymentStatus('cancelled');
        setStatusMessage("Payment verification cancelled.");
        onClose();
    };

    const getStatusIcon = () => {
        const iconClass = "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6";

        switch (paymentStatus) {
            case 'success':
                return (
                    <div className={`${iconClass} bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700/50`}>
                        <div className="relative">
                            <CheckCircle className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                            <div className="absolute -inset-4 bg-emerald-400/10 blur-xl rounded-full"></div>
                        </div>
                    </div>
                );
            case 'failed':
                return (
                    <div className={`${iconClass} bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-2 border-rose-200 dark:border-rose-700/50`}>
                        <div className="relative">
                            <XCircle className="w-16 h-16 text-rose-600 dark:text-rose-400" />
                            <div className="absolute -inset-4 bg-rose-400/10 blur-xl rounded-full"></div>
                        </div>
                    </div>
                );
            case 'cancelled':
                return (
                    <div className={`${iconClass} bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700/50`}>
                        <div className="relative">
                            <AlertCircle className="w-16 h-16 text-amber-600 dark:text-amber-400" />
                            <div className="absolute -inset-4 bg-amber-400/10 blur-xl rounded-full"></div>
                        </div>
                    </div>
                );
            case 'processing':
                return (
                    <div className={`${iconClass} bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700/50`}>
                        <div className="relative">
                            <Clock className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-pulse" />
                            <div className="absolute -inset-4 bg-blue-400/10 blur-xl rounded-full animate-pulse"></div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className={`${iconClass} bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-2 border-gray-200 dark:border-gray-700/50`}>
                        <div className="relative">
                            <CreditCard className="w-16 h-16 text-gray-600 dark:text-gray-400" />
                            <div className="absolute -inset-4 bg-gray-400/10 blur-xl rounded-full"></div>
                        </div>
                    </div>
                );
        }
    };

    const getStatusTitle = () => {
        switch (paymentStatus) {
            case 'success': return "Payment Confirmed";
            case 'failed': return "Transaction Failed";
            case 'cancelled': return "Payment Cancelled";
            case 'processing': return "Awaiting Authorization";
            default: return "Confirm Payment";
        }
    };

    const getStatusDescription = () => {
        switch (paymentStatus) {
            case 'success':
                return "Your payment has been successfully processed and confirmed.";
            case 'failed':
                return "We were unable to process your payment. Please try again.";
            case 'cancelled':
                return "Payment process was cancelled by the user.";
            case 'processing':
                return "Please authorize the payment on your mobile device to proceed.";
            default:
                return "Please complete the payment process to continue.";
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            size="lg"
            hideCloseButton={paymentStatus === 'processing'}
            isDismissable={paymentStatus !== 'processing'}
            backdrop="blur"
            className="backdrop-blur-xl"
        >
            <ModalContent className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-2 border-gray-200/50 dark:border-gray-700/30 shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/10 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                <ModalHeader className="flex flex-col items-center gap-4 pt-8 pb-2">
                    {getStatusIcon()}
                    <div className="flex flex-col items-center text-center space-y-2">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {getStatusTitle()}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm">
                            {getStatusDescription()}
                        </p>
                    </div>
                </ModalHeader>

                <Divider className="my-2" />

                <ModalBody className="space-y-6 py-6">
                    {/* Transaction Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/30">
                            <CardBody className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                                        <p className="font-bold text-lg">KES {totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-800/30">
                            <CardBody className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg">
                                        <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                                        <p className="font-bold text-lg">{phoneNumber}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/10 dark:to-violet-900/10 border border-purple-100 dark:border-purple-800/30">
                            <CardBody className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                                        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                                        <p className="font-mono font-bold text-sm truncate">{saleId || "N/A"}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Status Progress & Message */}
                    <Card className="border border-gray-200 dark:border-gray-700/50">
                        <CardBody className="p-6">
                            {paymentStatus === 'processing' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Verification Progress</span>
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">{Math.round(progressValue)}%</span>
                                        </div>
                                        <div className="relative">
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${progressValue}%` }}
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                                            </div>
                                            <span className="text-gray-600 dark:text-gray-400">Polling Status</span>
                                        </div>
                                        <Badge
                                            variant="flat"
                                            color="primary"
                                            className="font-mono"
                                        >
                                            {pollingCount} / {maxRetries}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4">
                                <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
                                    {statusMessage || "Waiting for payment authorization..."}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Transaction Details */}
                    {checkoutRequestId && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700/50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <ExternalLink className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction Reference</span>
                                </div>
                                <Chip size="sm" variant="flat" color="primary">Active</Chip>
                            </div>
                            <div className="font-mono text-sm bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                                {checkoutRequestId}
                            </div>
                        </div>
                    )}

                    {/* Instructions for Processing */}
                    {paymentStatus === 'processing' && (
                        <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-5 border border-blue-200 dark:border-blue-800/50">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg mr-3">
                                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Complete Payment on Your Phone</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Follow these steps to authorize payment</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">1</div>
                                        <span className="text-sm">Check for M-Pesa prompt</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">2</div>
                                        <span className="text-sm">Enter your secure PIN</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">3</div>
                                        <span className="text-sm">Confirm payment amount</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">4</div>
                                        <span className="text-sm">Wait for confirmation</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </ModalBody>

                <Divider className="my-2" />

                <ModalFooter className="flex flex-col sm:flex-row gap-3 pt-4 pb-8">
                    {paymentStatus === 'processing' && (
                        <>
                            <Button
                                variant="flat"
                                color="danger"
                                onPress={handleCancel}
                                className="flex-1 min-w-[140px] h-12 font-semibold border border-red-200 dark:border-red-800/50"
                                startContent={<XCircle className="w-4 h-4" />}
                            >
                                Cancel Payment
                            </Button>
                            <Button
                                color="primary"
                                variant="solid"
                                isDisabled
                                className="flex-1 min-w-[140px] h-12 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                            >
                                <Spinner size="sm" className="mr-2" />
                                Verifying Payment...
                            </Button>
                        </>
                    )}

                    {paymentStatus === 'failed' && showRetry && (
                        <>
                            <Button
                                variant="flat"
                                color="default"
                                onPress={onPaymentFailure}
                                className="flex-1 min-w-[140px] h-12 font-semibold"
                            >
                                Return to Checkout
                            </Button>
                            <Button
                                color="primary"
                                variant="solid"
                                onPress={handleRetry}
                                className="flex-1 min-w-[140px] h-12 font-semibold bg-gradient-to-r from-blue-600 to-purple-600"
                                startContent={<RefreshCw className="w-4 h-4" />}
                            >
                                Retry Verification
                            </Button>
                        </>
                    )}

                    {paymentStatus === 'success' && (
                        <Button
                            color="success"
                            variant="solid"
                            onPress={onPaymentSuccess}
                            className="w-full h-12 font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                            startContent={<CheckCircle className="w-4 h-4" />}
                        >
                            Continue Shopping
                        </Button>
                    )}

                    {paymentStatus === 'cancelled' && (
                        <Button
                            variant="flat"
                            color="warning"
                            onPress={onPaymentCancel}
                            className="w-full h-12 font-semibold"
                        >
                            Close & Return
                        </Button>
                    )}
                </ModalFooter>

                {/* Security Footer */}
                <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Shield className="w-3 h-3" />
                        <span>Secured by M-Pesa • Encrypted Connection • PCI Compliant</span>
                    </div>
                </div>
            </ModalContent>
        </Modal>
    );
};