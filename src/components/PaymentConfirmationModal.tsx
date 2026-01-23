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
    Progress,
    Input,
    Textarea
} from "@heroui/react";
import axios from "axios";
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Smartphone,
    CreditCard,
    RefreshCw,
    ArrowRight,
    ShieldCheck,
    AlertTriangle,
    Info,
    Receipt,
    Copy
} from "lucide-react";
import { motion } from "framer-motion";

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

// Define payment interface for type safety
interface Payment {
    status: string;
    mpesa_receipt_number?: string;
    mpesaReceiptNumber?: string;
    receipt_number?: string;
    mpesa_receipt?: string;
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
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'manual' | 'callback_failed'>('pending');
    const [pollingCount, setPollingCount] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");
    const [timer, setTimer] = useState(180);
    const [mpesaReceipt, setMpesaReceipt] = useState<string | null>(null);
    const [manualReceipt, setManualReceipt] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [notes, setNotes] = useState("");
    const [countdown, setCountdown] = useState<number | null>(null);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const maxRetries = 24; // 2 minutes at 5 second intervals
    const pollingInterval = 5000;

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPaymentStatus('pending');
            setPollingCount(0);
            setStatusMessage("");
            setTimer(180);
            setMpesaReceipt(null);
            setManualReceipt("");
            setCountdown(null);
            retryCountRef.current = 0;

            // Start polling immediately
            setTimeout(async () => {
                if (checkoutRequestId) {
                    await startPaymentPolling();
                } else {
                    startManualPolling();
                }
            }, 1000);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [isOpen]);

    // Countdown timer effect
    useEffect(() => {
        if (paymentStatus === 'processing' && timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [paymentStatus, timer]);

    // Auto-close countdown for success
    useEffect(() => {
        if (paymentStatus === 'success') {
            setCountdown(5);

            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev === null || prev <= 1) {
                        if (countdownRef.current) clearInterval(countdownRef.current);
                        onPaymentSuccess();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [paymentStatus, onPaymentSuccess]);

    const queryPaymentStatus = async (checkoutReqId: string, currentPollingCount: number): Promise<{
        status: 'pending' | 'success' | 'failed' | 'callback_failed';
        message: string;
        data?: any;
    }> => {
        try {
            console.log("Querying payment status for:", checkoutReqId);

            const response = await axios.post(`${API_BASE_URL}/api/payments/queryStatus`, {
                checkoutRequestID: checkoutReqId
            });

            const result = response.data;
            console.log("QueryStatus response:", result);

            let resultCode, resultDesc, mpesaReceiptNumber;

            // Check various response formats
            if (result.ResultCode !== undefined) {
                resultCode = result.ResultCode;
                resultDesc = result.ResultDesc;
                mpesaReceiptNumber = result.MpesaReceiptNumber;
            }
            else if (result.resultCode !== undefined) {
                resultCode = result.resultCode;
                resultDesc = result.resultDesc;
                mpesaReceiptNumber = result.mpesaReceiptNumber;
            }
            else if (result.Body?.stkCallback?.ResultCode !== undefined) {
                resultCode = result.Body.stkCallback.ResultCode;
                resultDesc = result.Body.stkCallback.ResultDesc;
                const callbackMetadata = result.Body.stkCallback.CallbackMetadata;
                if (callbackMetadata?.Item) {
                    const receiptItem = callbackMetadata.Item.find((item: any) =>
                        item.Name === 'MpesaReceiptNumber'
                    );
                    mpesaReceiptNumber = receiptItem?.Value;
                }
            }
            else if (result.status !== undefined) {
                resultCode = result.status;
                resultDesc = result.message;
                mpesaReceiptNumber = result.mpesaReceiptNumber;
            }
            else if (result.MpesaReceiptNumber || result.mpesaReceiptNumber) {
                resultCode = 0;
                resultDesc = "Payment completed successfully";
                mpesaReceiptNumber = result.MpesaReceiptNumber || result.mpesaReceiptNumber;
            }
            else {
                // Try to check the sale status directly
                if (saleId) {
                    try {
                        const saleResponse = await axios.get(`${API_BASE_URL}/customer/orders/${saleId}`);
                        const saleData = saleResponse.data;

                        // Check if any payment in the sale is completed
                        if (saleData.payments && Array.isArray(saleData.payments)) {
                            const completedPayment = saleData.payments.find(
                                (p: Payment) => p.status === 'completed' || p.status === 'paid'
                            );

                            if (completedPayment) {
                                resultCode = 0;
                                resultDesc = "Payment verified via sale record";
                                mpesaReceiptNumber = completedPayment.mpesa_receipt_number ||
                                    completedPayment.mpesaReceiptNumber ||
                                    completedPayment.receipt_number;
                            }
                        }

                        // Also check the sale status directly
                        if (saleData.status === 'paid' || saleData.status === 'completed') {
                            resultCode = 0;
                            resultDesc = "Sale is already marked as paid";
                            if (saleData.payments && Array.isArray(saleData.payments)) {
                                const payment = saleData.payments[0];
                                mpesaReceiptNumber = payment.mpesa_receipt_number ||
                                    payment.mpesaReceiptNumber ||
                                    payment.receipt_number;
                            }
                        }
                    } catch (saleError) {
                        console.log("Could not fetch sale data:", saleError);
                    }
                }

                // If still no result code, return pending
                if (resultCode === undefined) {
                    return {
                        status: 'pending',
                        message: 'Awaiting payment confirmation from M-Pesa...',
                        data: result
                    };
                }
            }

            const codeNum = Number(resultCode);

            if (codeNum === 0) {
                // Success
                if (mpesaReceiptNumber) setMpesaReceipt(mpesaReceiptNumber);

                // Also try to update order status
                if (saleId) {
                    try {
                        await axios.post(`${API_BASE_URL}/customer/orders/${saleId}/pay`, {
                            status: 'paid',
                            mpesa_receipt: mpesaReceiptNumber,
                            payment_method: 'mpesa'
                        });
                        console.log("Successfully updated sale status to paid");
                    } catch (error) {
                        console.log("Note: Order status update failed, but payment was successful");
                    }
                }

                return {
                    status: 'success',
                    message: resultDesc || 'Payment completed successfully',
                    data: result
                };
            }
            else if (codeNum === 1 || codeNum === 1032) {
                // User cancelled
                return {
                    status: 'failed',
                    message: resultDesc || 'Payment was cancelled by user',
                    data: result
                };
            }
            else if (codeNum === 1037) {
                // Timeout - callback may come later
                return {
                    status: 'pending',
                    message: 'Timeout - still waiting for M-Pesa confirmation',
                    data: result
                };
            }
            else {
                // Other failure
                return {
                    status: 'failed',
                    message: resultDesc || `Payment failed with code: ${resultCode}`,
                    data: result
                };
            }

        } catch (error: any) {
            console.error("Error checking payment status:", error);

            // Special handling: If we get a 500 error, check the sale status directly
            if (error.response?.status === 500 && saleId) {
                try {
                    const saleResponse = await axios.get(`${API_BASE_URL}/customer/orders/${saleId}`);
                    const saleData = saleResponse.data;

                    // Check if sale is already paid
                    if (saleData.status === 'paid' || saleData.status === 'completed') {
                        if (saleData.payments && Array.isArray(saleData.payments)) {
                            const payment = saleData.payments.find(
                                (p: Payment) => p.status === 'completed' || p.status === 'paid'
                            );
                            if (payment) {
                                setMpesaReceipt(payment.mpesa_receipt_number || payment.receipt_number);
                                return {
                                    status: 'success',
                                    message: 'Payment already completed (sale status is paid)',
                                    data: saleData
                                };
                            }
                        }
                    }
                } catch (saleError) {
                    console.log("Could not fetch sale data on 500 error:", saleError);
                }
            }

            // Handle 500 errors - callback probably didn't work
            if (error.response?.status === 500) {
                // After 30 seconds of polling, switch to manual mode
                if (currentPollingCount >= 6) {
                    return {
                        status: 'callback_failed',
                        message: 'M-Pesa callback not received. Please provide receipt manually.',
                        data: null
                    };
                }

                return {
                    status: 'pending',
                    message: 'Waiting for payment confirmation...',
                    data: null
                };
            }

            return {
                status: 'pending',
                message: 'Checking payment status...',
                data: null
            };
        }
    };

    const startPaymentPolling = async () => {
        if (!checkoutRequestId) {
            setPaymentStatus('manual');
            setStatusMessage("No transaction ID. Please complete payment and enter receipt manually.");
            return;
        }

        const checkSaleStatusDirectly = async () => {
            if (!saleId) return false;

            try {
                const response = await axios.get(`${API_BASE_URL}/customer/orders/${saleId}`);
                const saleData = response.data;

                console.log("Direct sale status check:", saleData.status, saleData);

                // Check if sale is already marked as paid
                if (saleData.status === 'paid' || saleData.status === 'completed') {
                    setPaymentStatus('success');
                    setStatusMessage("Payment already confirmed!");

                    // Try to get receipt from payments array
                    if (saleData.payments && Array.isArray(saleData.payments) && saleData.payments.length > 0) {
                        const payment = saleData.payments.find((p: Payment) => p.status === 'completed' || p.status === 'paid') || saleData.payments[0];
                        if (payment) {
                            const receipt = payment.mpesa_receipt_number ||
                                payment.mpesaReceiptNumber ||
                                payment.receipt_number ||
                                payment.mpesa_receipt;
                            if (receipt) setMpesaReceipt(receipt);
                        }
                    }

                    return true;
                }

                // Also check if there's a completed payment even if sale status is pending
                if (saleData.payments && Array.isArray(saleData.payments)) {
                    const completedPayment = saleData.payments.find(
                        (p: Payment) => p.status === 'completed' || p.status === 'paid'
                    );
                    if (completedPayment) {
                        setPaymentStatus('success');
                        setStatusMessage("Payment found in sale record!");

                        const receipt = completedPayment.mpesa_receipt_number ||
                            completedPayment.mpesaReceiptNumber ||
                            completedPayment.receipt_number ||
                            completedPayment.mpesa_receipt;
                        if (receipt) setMpesaReceipt(receipt);

                        return true;
                    }
                }
            } catch (error) {
                console.log("Could not check sale status:", error);
            }
            return false;
        };

        // Check if sale is already paid before polling
        const isAlreadyPaid = await checkSaleStatusDirectly();
        if (isAlreadyPaid) {
            console.log("Sale is already paid, skipping polling");
            return;
        }

        // Only start polling if sale is not already paid
        setPaymentStatus('processing');
        setStatusMessage("Awaiting PIN authorization on your device");
        setTimer(180);

        retryCountRef.current = 0;
        pollingRef.current = setInterval(async () => {
            if (!checkoutRequestId || retryCountRef.current >= maxRetries) {
                if (pollingRef.current) clearInterval(pollingRef.current);
                if (retryCountRef.current >= maxRetries) {
                    setPaymentStatus('callback_failed');
                    setStatusMessage("M-Pesa callback timeout. Please check your statement and provide receipt.");

                    // Even at timeout, check one more time if sale is paid
                    if (saleId) {
                        try {
                            const response = await axios.get(`${API_BASE_URL}/customer/orders/${saleId}`);
                            const saleData = response.data;
                            if (saleData.status === 'paid' || saleData.status === 'completed') {
                                setPaymentStatus('success');
                                setStatusMessage("Payment was actually completed!");
                            }
                        } catch (error) {
                            // Ignore error at timeout
                        }
                    }
                }
                return;
            }

            retryCountRef.current += 1;
            setPollingCount(prev => prev + 1);

            try {
                const statusResult = await queryPaymentStatus(checkoutRequestId, pollingCount);
                console.log(`Poll ${retryCountRef.current}:`, statusResult.status);

                if (statusResult.status === 'success') {
                    clearInterval(pollingRef.current as NodeJS.Timeout);
                    pollingRef.current = null;
                    setPaymentStatus('success');
                    setStatusMessage(statusResult.message);
                }
                else if (statusResult.status === 'failed') {
                    clearInterval(pollingRef.current as NodeJS.Timeout);
                    pollingRef.current = null;
                    setPaymentStatus('failed');
                    setStatusMessage(statusResult.message);
                }
                else if (statusResult.status === 'callback_failed') {
                    clearInterval(pollingRef.current as NodeJS.Timeout);
                    pollingRef.current = null;
                    setPaymentStatus('callback_failed');
                    setStatusMessage(statusResult.message);
                }
                // If still pending, continue polling

            } catch (error) {
                console.error("Polling error:", error);
            }
        }, pollingInterval);
    };

    const startManualPolling = () => {
        if (!saleId) {
            setPaymentStatus('manual');
            setStatusMessage("Please provide your payment details manually");
            return;
        }

        setPaymentStatus('processing');
        setStatusMessage("Checking order status...");

        pollingRef.current = setInterval(async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/customer/orders/${saleId}`);
                const order = response.data;

                if (order.payment_status === 'paid') {
                    clearInterval(pollingRef.current as NodeJS.Timeout);
                    setPaymentStatus('success');
                    setStatusMessage("Payment already confirmed!");
                }
            } catch (error) {
                // Just continue polling
            }
        }, 10000);
    };

    const handleManualConfirmation = async () => {
        if (!manualReceipt.trim()) {
            setStatusMessage("Please enter the M-Pesa receipt number");
            return;
        }

        if (!saleId) {
            setStatusMessage("No order ID available");
            return;
        }

        setPaymentStatus('processing');
        setStatusMessage("Manually confirming payment...");

        try {
            // First try the specific endpoint
            const response = await axios.post(`${API_BASE_URL}/customer/orders/${saleId}/manual-pay`, {
                mpesa_receipt: manualReceipt,
                customer_name: customerName,
                notes: notes,
                amount: totalAmount,
                phone_number: phoneNumber
            });

            if (response.data.success) {
                setPaymentStatus('success');
                setStatusMessage("Payment manually confirmed!");
                setMpesaReceipt(manualReceipt);
            } else {
                // Fallback to regular pay endpoint
                await axios.post(`${API_BASE_URL}/customer/orders/${saleId}/pay`, {
                    status: 'paid',
                    mpesa_receipt: manualReceipt,
                    payment_method: 'mpesa'
                });
                setPaymentStatus('success');
                setStatusMessage("Payment recorded!");
                setMpesaReceipt(manualReceipt);
            }
        } catch (error: any) {
            console.error("Manual confirmation error:", error);

            // Try fallback endpoint
            try {
                await axios.post(`${API_BASE_URL}/customer/orders/${saleId}/pay`, {
                    status: 'paid',
                    mpesa_receipt: manualReceipt,
                    payment_method: 'mpesa'
                });
                setPaymentStatus('success');
                setStatusMessage("Payment recorded (fallback)");
                setMpesaReceipt(manualReceipt);
            } catch (fallbackError) {
                setPaymentStatus('callback_failed');
                setStatusMessage("Could not confirm payment. Please contact support with receipt: " + manualReceipt);
            }
        }
    };

    const handleRetry = async () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setPaymentStatus('pending');
        setPollingCount(0);
        setTimer(180);
        setStatusMessage("Retrying payment verification...");
        await startPaymentPolling();
    };

    const handleCancel = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setPaymentStatus('cancelled');
        setStatusMessage("Payment verification cancelled.");
        onPaymentCancel();
        onClose();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setStatusMessage("Copied to clipboard!");
        setTimeout(() => {
            if (paymentStatus === 'processing') {
                setStatusMessage("Awaiting PIN authorization on your device");
            }
        }, 2000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusIcon = () => {
        const baseClass = "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4";
        switch (paymentStatus) {
            case 'success':
                return (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`${baseClass} bg-gradient-to-br from-emerald-400 to-teal-500`}
                    >
                        <CheckCircle className="w-10 h-10 text-white" strokeWidth={2} />
                    </motion.div>
                );
            case 'failed':
                return (
                    <div className={`${baseClass} bg-gradient-to-br from-rose-500 to-pink-600`}>
                        <XCircle className="w-10 h-10 text-white" strokeWidth={2} />
                    </div>
                );
            case 'cancelled':
                return (
                    <div className={`${baseClass} bg-gradient-to-br from-amber-500 to-orange-500`}>
                        <AlertCircle className="w-10 h-10 text-white" strokeWidth={2} />
                    </div>
                );
            case 'processing':
                return (
                    <div className={`${baseClass} bg-gradient-to-br from-blue-500 to-purple-600`}>
                        <Clock className="w-10 h-10 text-white animate-pulse" />
                    </div>
                );
            case 'callback_failed':
                return (
                    <div className={`${baseClass} bg-gradient-to-br from-amber-500 to-yellow-500`}>
                        <AlertTriangle className="w-10 h-10 text-white" strokeWidth={2} />
                    </div>
                );
            case 'manual':
                return (
                    <div className={`${baseClass} bg-gradient-to-br from-blue-500 to-cyan-500`}>
                        <Receipt className="w-10 h-10 text-white" strokeWidth={2} />
                    </div>
                );
            default:
                return (
                    <div className={`${baseClass} bg-gradient-to-br from-slate-600 to-gray-700`}>
                        <CreditCard className="w-10 h-10 text-white" strokeWidth={2} />
                    </div>
                );
        }
    };

    const getStatusTitle = () => {
        switch (paymentStatus) {
            case 'success': return "Payment Confirmed! 🎉";
            case 'failed': return "Payment Failed";
            case 'cancelled': return "Payment Cancelled";
            case 'processing': return "Authorizing Payment";
            case 'callback_failed': return "Callback Issue";
            case 'manual': return "Manual Confirmation";
            default: return "Secure Payment";
        }
    };

    const getStatusColor = () => {
        switch (paymentStatus) {
            case 'success': return "text-emerald-600";
            case 'failed': return "text-rose-600";
            case 'cancelled': return "text-amber-600";
            case 'processing': return "text-blue-600";
            case 'callback_failed': return "text-amber-600";
            case 'manual': return "text-blue-600";
            default: return "text-gray-600";
        }
    };

    const renderManualConfirmationForm = () => (
        <Card className="border border-blue-200 bg-blue-50">
            <CardBody className="p-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-700">
                            Manual Payment Confirmation
                        </span>
                    </div>

                    <p className="text-sm text-blue-600">
                        If you completed the M-Pesa payment but didn't get confirmation,
                        please provide the details below:
                    </p>

                    <div className="space-y-3">
                        <Input
                            label="M-Pesa Receipt Number"
                            placeholder="e.g., RLF9JZ5Z7Q"
                            value={manualReceipt}
                            onChange={(e) => setManualReceipt(e.target.value.toUpperCase())}
                            className="w-full"
                            description="From your M-Pesa confirmation message"
                        />

                        <Input
                            label="Your Name (Optional)"
                            placeholder="For our records"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full"
                        />

                        <Textarea
                            label="Notes (Optional)"
                            placeholder="Any additional information about the payment"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full"
                            minRows={2}
                        />
                    </div>
                </div>
            </CardBody>
        </Card>
    );

    const renderProcessingInfo = () => (
        <Card className="border border-gray-200">
            <CardBody className="p-4">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">
                            Authorization Progress
                        </span>
                        <div className="flex items-center gap-2">
                            <Badge color="primary" variant="flat" className="text-xs">
                                {Math.round((pollingCount / maxRetries) * 100)}%
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(timer)}</span>
                            </div>
                        </div>
                    </div>

                    <Progress
                        value={(pollingCount / maxRetries) * 100}
                        color="primary"
                        className="h-2"
                    />

                    <div className="text-xs text-gray-500 flex justify-between">
                        <span>Attempts: {pollingCount}</span>
                        <span>Remaining: {maxRetries - pollingCount}</span>
                    </div>

                    {/* Mobile Instructions */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-center mb-2">
                            <Smartphone className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm font-semibold text-gray-800">
                                Complete on Your Device
                            </span>
                        </div>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>✓ Enter your M-Pesa PIN when prompted</li>
                            <li>✓ Confirm amount: KES {totalAmount.toLocaleString()}</li>
                            <li>✓ Wait for SMS confirmation</li>
                            <li>✓ Save the receipt number from SMS</li>
                        </ul>
                    </div>

                    {/* Callback Issue Warning */}
                    {pollingCount > 3 && (
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-semibold text-amber-700">
                                    Note about Callback Issues
                                </span>
                            </div>
                            <p className="text-xs text-amber-600">
                                Sometimes M-Pesa callbacks are delayed. If payment was successful
                                but this screen doesn't update, use the manual confirmation option below.
                            </p>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={paymentStatus === 'processing' || paymentStatus === 'callback_failed' ? undefined : handleCancel}
            size="md"
            hideCloseButton={paymentStatus === 'processing' || paymentStatus === 'callback_failed'}
            isDismissable={!(paymentStatus === 'processing' || paymentStatus === 'callback_failed')}
            backdrop="blur"
            className="max-w-sm mx-4"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col items-center gap-2 pt-6">
                    {getStatusIcon()}
                    <div className="text-center">
                        <h2 className={`text-xl font-bold ${getStatusColor()}`}>
                            {getStatusTitle()}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1 max-w-xs">
                            {statusMessage}
                            {countdown !== null && countdown > 0 && paymentStatus === 'success' && (
                                <span className="font-bold ml-1">({countdown})</span>
                            )}
                        </p>
                        {mpesaReceipt && (
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <Receipt className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-mono text-emerald-600">
                                    Receipt: {mpesaReceipt}
                                </span>
                                <Button
                                    onClick={() => copyToClipboard(mpesaReceipt)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                </ModalHeader>

                <ModalBody className="space-y-4 py-4">
                    {/* Transaction Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <Card className="border border-gray-200">
                            <CardBody className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-semibold text-gray-500">AMOUNT</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">
                                    KES {totalAmount.toLocaleString()}
                                </p>
                            </CardBody>
                        </Card>

                        <Card className="border border-gray-200">
                            <CardBody className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Smartphone className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-semibold text-gray-500">PHONE</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900 font-mono">
                                    {phoneNumber}
                                </p>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Manual Confirmation Form */}
                    {(paymentStatus === 'callback_failed' || paymentStatus === 'manual') &&
                        renderManualConfirmationForm()
                    }

                    {/* Processing Info */}
                    {paymentStatus === 'processing' && renderProcessingInfo()}

                    {/* Order & Transaction IDs */}
                    <div className="space-y-2">
                        {saleId && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Order ID:</span>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono text-gray-800 text-xs">
                                        {saleId}
                                    </code>
                                    <Button
                                        onClick={() => copyToClipboard(saleId)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        {checkoutRequestId && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Transaction ID:</span>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono text-gray-800 text-xs truncate max-w-[120px]">
                                        {checkoutRequestId}
                                    </code>
                                    <Button
                                        onClick={() => copyToClipboard(checkoutRequestId)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Troubleshooting Tips */}
                    {paymentStatus === 'callback_failed' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                    What to do if callback fails:
                                </span>
                            </div>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>1. Complete payment on your phone</li>
                                <li>2. Save the M-Pesa receipt number</li>
                                <li>3. Enter receipt above to confirm</li>
                                <li>4. Contact support if issues persist</li>
                            </ul>
                        </div>
                    )}

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Secure • Encrypted • PCI Compliant</span>
                    </div>
                </ModalBody>

                <ModalFooter className="pt-4 pb-6">
                    <div className="w-full space-y-3">
                        {paymentStatus === 'processing' && (
                            <div className="space-y-3">
                                <Button
                                    variant="flat"
                                    color="danger"
                                    onPress={handleCancel}
                                    className="w-full"
                                    startContent={<XCircle className="w-4 h-4" />}
                                >
                                    Cancel Payment
                                </Button>
                                <Button
                                    color="primary"
                                    variant="solid"
                                    isDisabled
                                    className="w-full"
                                >
                                    <Spinner size="sm" className="mr-2" color="white" />
                                    Verifying Payment
                                </Button>
                            </div>
                        )}

                        {paymentStatus === 'failed' && (
                            <div className="space-y-3">
                                <Button
                                    variant="flat"
                                    color="default"
                                    onPress={onPaymentFailure}
                                    className="w-full"
                                >
                                    Return to Checkout
                                </Button>
                                <Button
                                    color="primary"
                                    variant="solid"
                                    onPress={handleRetry}
                                    className="w-full"
                                    startContent={<RefreshCw className="w-4 h-4" />}
                                >
                                    Retry Verification
                                </Button>
                            </div>
                        )}

                        {paymentStatus === 'callback_failed' && (
                            <div className="space-y-3">
                                <Button
                                    variant="flat"
                                    color="default"
                                    onPress={handleCancel}
                                    className="w-full"
                                >
                                    Cancel Order
                                </Button>
                                <Button
                                    color="warning"
                                    variant="solid"
                                    onPress={handleManualConfirmation}
                                    disabled={!manualReceipt.trim()}
                                    className="w-full"
                                    startContent={<CheckCircle className="w-4 h-4" />}
                                >
                                    Confirm Payment Manually
                                </Button>
                            </div>
                        )}

                        {paymentStatus === 'manual' && (
                            <Button
                                color="primary"
                                variant="solid"
                                onPress={handleManualConfirmation}
                                disabled={!manualReceipt.trim()}
                                className="w-full"
                                startContent={<CheckCircle className="w-4 h-4" />}
                            >
                                Confirm Payment
                            </Button>
                        )}

                        {paymentStatus === 'success' && (
                            <Button
                                color="success"
                                variant="solid"
                                onPress={onPaymentSuccess}
                                className="w-full"
                                startContent={
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.div>
                                }
                            >
                                {countdown !== null && countdown > 0
                                    ? `Continue Shopping (Auto-closing in ${countdown})`
                                    : 'Continue Shopping'
                                }
                            </Button>
                        )}

                        {paymentStatus === 'cancelled' && (
                            <Button
                                variant="flat"
                                color="warning"
                                onPress={onPaymentCancel}
                                className="w-full"
                            >
                                Close & Return
                            </Button>
                        )}
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};