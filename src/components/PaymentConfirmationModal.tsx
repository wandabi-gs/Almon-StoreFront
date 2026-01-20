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
    RefreshCw,
    ExternalLink,
    Lock,
    Sparkles,
    Zap,
    ShieldCheck,
    SmartphoneNfc,
    Receipt,
    BadgeCheck,
    Loader2,
    ArrowRight,
    Gem,
    Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const [timer, setTimer] = useState(180); // 3-minute timer
    const [paymentSteps, setPaymentSteps] = useState([
        { id: 1, title: "Initiated", completed: true, active: true, icon: Zap },
        { id: 2, title: "Authorization", completed: false, active: false, icon: Smartphone },
        { id: 3, title: "Processing", completed: false, active: false, icon: Loader2 },
        { id: 4, title: "Confirmed", completed: false, active: false, icon: BadgeCheck }
    ]);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const maxRetries = 30;
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Countdown timer
    useEffect(() => {
        if (paymentStatus === 'processing' && timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current as NodeJS.Timeout);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [paymentStatus, timer]);

    // Animated progress with smooth transitions
    useEffect(() => {
        if (paymentStatus === 'processing') {
            progressIntervalRef.current = setInterval(() => {
                setProgressValue(prev => {
                    const increment = (100 / maxRetries) * 0.8; // Slower progression
                    return Math.min(prev + increment, 95);
                });
            }, 5000);
        } else {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            if (paymentStatus === 'success') {
                // Animate to 100%
                setTimeout(() => setProgressValue(100), 300);
            } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
                setProgressValue(0);
            }
        }

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [paymentStatus]);

    // Update steps based on payment status
    useEffect(() => {
        const updatedSteps = [...paymentSteps];

        switch (paymentStatus) {
            case 'processing':
                updatedSteps[1].active = true;
                updatedSteps[2].active = true;
                break;
            case 'success':
                updatedSteps.forEach(step => {
                    step.completed = true;
                    step.active = false;
                });
                updatedSteps[3].active = true;
                break;
            case 'failed':
            case 'cancelled':
                updatedSteps.forEach(step => {
                    step.active = false;
                    step.completed = false;
                });
                break;
        }

        setPaymentSteps(updatedSteps);
    }, [paymentStatus]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Start polling when modal opens
    useEffect(() => {
        if (isOpen && checkoutRequestId && paymentStatus === 'pending') {
            setPaymentStatus('processing');
            setStatusMessage("Awaiting PIN authorization on your device");
            setTimer(180);
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
            const response = await axios.post(`${API_BASE_URL}/api/payments/queryStatus`, {
                checkoutRequestID: checkoutReqId
            });

            const result = response.data;
            const resultCode = result.ResultCode || result.resultCode || result.status;
            const resultDesc = result.ResultDesc || result.resultDesc || result.message;

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
        } catch (error: any) {
            console.error("Error checking payment status:", error);
            return {
                status: 'pending',
                message: error.response?.data?.message || 'Verifying payment status...'
            };
        }
    };

    const startPaymentPolling = () => {
        if (!checkoutRequestId) {
            setPaymentStatus('failed');
            setStatusMessage("No transaction ID available.");
            setShowRetry(true);
            return;
        }

        retryCountRef.current = 0;
        setProgressValue(10); // Start at 10% to show immediate progress

        pollingRef.current = setInterval(async () => {
            if (!checkoutRequestId || retryCountRef.current >= maxRetries) {
                if (pollingRef.current) clearInterval(pollingRef.current);

                if (retryCountRef.current >= maxRetries) {
                    setPaymentStatus('failed');
                    setStatusMessage("Payment verification timeout. Please check your M-Pesa statement.");
                    setShowRetry(true);
                }
                return;
            }

            retryCountRef.current += 1;
            setPollingCount(prev => prev + 1);

            try {
                const statusResult = await queryPaymentStatus(checkoutRequestId);

                if (statusResult.status === 'success') {
                    clearInterval(pollingRef.current as NodeJS.Timeout);
                    pollingRef.current = null;

                    setPaymentStatus('success');
                    setStatusMessage(statusResult.message);

                    setTimeout(() => {
                        onPaymentSuccess();
                    }, 1500);

                } else if (statusResult.status === 'failed') {
                    clearInterval(pollingRef.current as NodeJS.Timeout);
                    pollingRef.current = null;

                    setPaymentStatus('failed');
                    setStatusMessage(statusResult.message);
                    setShowRetry(true);
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 5000);
    };

    const handleRetry = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }

        setPaymentStatus('pending');
        setPollingCount(0);
        setShowRetry(false);
        setTimer(180);
        setStatusMessage("Retrying payment verification...");
        setProgressValue(0);

        setTimeout(() => {
            startPaymentPolling();
        }, 1000);
    };

    const handleCancel = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }

        setPaymentStatus('cancelled');
        setStatusMessage("Payment verification cancelled.");
        onClose();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusIcon = () => {
        const baseClass = "relative w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl";

        switch (paymentStatus) {
            case 'success':
                return (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className={`${baseClass} bg-gradient-to-br from-emerald-400 to-teal-500`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 animate-pulse rounded-full" />
                        <CheckCircle className="w-14 h-14 text-white" strokeWidth={2} />
                        <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full" />
                    </motion.div>
                );
            case 'failed':
                return (
                    <div className={`${baseClass} bg-gradient-to-br from-rose-500 to-pink-600`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-600/20 animate-pulse rounded-full" />
                        <XCircle className="w-14 h-14 text-white" strokeWidth={2} />
                        <div className="absolute -inset-4 bg-rose-500/20 blur-2xl rounded-full" />
                    </div>
                );
            case 'cancelled':
                return (
                    <div className={`${baseClass} bg-gradient-to-br from-amber-500 to-orange-500`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 animate-pulse rounded-full" />
                        <AlertCircle className="w-14 h-14 text-white" strokeWidth={2} />
                        <div className="absolute -inset-4 bg-amber-500/20 blur-2xl rounded-full" />
                    </div>
                );
            case 'processing':
                return (
                    <div className={`${baseClass} bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 animate-gradient-x`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-600/20 animate-pulse rounded-full" />
                        <Clock className="w-14 h-14 text-white animate-spin" style={{ animationDuration: '3s' }} strokeWidth={2} />
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-600/20 blur-2xl rounded-full animate-pulse" />
                    </div>
                );
            default:
                return (
                    <div className={`${baseClass} bg-gradient-to-br from-slate-600 to-gray-700`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-gray-700/20 animate-pulse rounded-full" />
                        <CreditCard className="w-14 h-14 text-white" strokeWidth={2} />
                        <div className="absolute -inset-4 bg-slate-600/20 blur-2xl rounded-full" />
                    </div>
                );
        }
    };

    const getStatusTitle = () => {
        switch (paymentStatus) {
            case 'success': return "Payment Confirmed! 🎉";
            case 'failed': return "Transaction Failed";
            case 'cancelled': return "Payment Cancelled";
            case 'processing': return "Authorizing Payment";
            default: return "Secure Payment";
        }
    };

    const getStatusColor = () => {
        switch (paymentStatus) {
            case 'success': return "text-emerald-600 dark:text-emerald-400";
            case 'failed': return "text-rose-600 dark:text-rose-400";
            case 'cancelled': return "text-amber-600 dark:text-amber-400";
            case 'processing': return "text-blue-600 dark:text-blue-400";
            default: return "text-gray-600 dark:text-gray-400";
        }
    };

    const getStatusGradient = () => {
        switch (paymentStatus) {
            case 'success': return "from-emerald-500 to-teal-500";
            case 'failed': return "from-rose-500 to-pink-500";
            case 'cancelled': return "from-amber-500 to-orange-500";
            case 'processing': return "from-blue-500 via-indigo-500 to-purple-500";
            default: return "from-slate-600 to-gray-700";
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={paymentStatus === 'processing' ? undefined : handleCancel}
            size="2xl"
            hideCloseButton={paymentStatus === 'processing'}
            isDismissable={paymentStatus !== 'processing'}
            backdrop="blur"
            className="backdrop-blur-2xl"
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
                        y: -20,
                        opacity: 0,
                        transition: {
                            duration: 0.2,
                            ease: "easeIn",
                        },
                    },
                }
            }}
        >
            <ModalContent className="relative overflow-hidden border-none shadow-2xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="relative"
                    >
                        {/* Ultra HD Background Effects */}
                        <div className="absolute inset-0 overflow-hidden">
                            {/* Animated Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient()} opacity-5`} />

                            {/* Floating Particles */}
                            <div className="absolute inset-0">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-1 h-1 bg-white/10 rounded-full"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                        }}
                                        animate={{
                                            y: [0, -30, 0],
                                            x: [0, Math.random() * 20 - 10, 0],
                                            opacity: [0.3, 0.8, 0.3],
                                        }}
                                        transition={{
                                            duration: 3 + Math.random() * 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Geometric Grid */}
                            <div className="absolute inset-0 opacity-[0.02]"
                                style={{
                                    backgroundImage: `linear-gradient(to right, #888 1px, transparent 1px),
                                                      linear-gradient(to bottom, #888 1px, transparent 1px)`,
                                    backgroundSize: '40px 40px',
                                }}
                            />
                        </div>

                        {/* Main Content */}
                        <div className="relative bg-gradient-to-b from-white/95 via-white/90 to-white/80 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/80 backdrop-blur-2xl">
                            {/* Header Gradient Bar */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${getStatusGradient()}`} />

                            <ModalHeader className="flex flex-col items-center gap-4 pt-10 pb-4 px-8">
                                {/* Premium Badge */}
                                <div className="absolute top-4 right-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold shadow-lg">
                                        <Gem className="w-3 h-3" />
                                        <span>SECURE PAYMENT</span>
                                    </div>
                                </div>

                                {getStatusIcon()}

                                <div className="flex flex-col items-center text-center space-y-3">
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`text-3xl font-bold ${getStatusColor()} bg-clip-text`}
                                    >
                                        {getStatusTitle()}
                                    </motion.h2>

                                    <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md leading-relaxed">
                                        {statusMessage || "Complete the payment on your device to proceed with your order"}
                                    </p>
                                </div>
                            </ModalHeader>

                            <Divider className="my-2 opacity-30" />

                            <ModalBody className="space-y-8 py-8 px-8">
                                {/* Payment Progress Steps */}
                                <div className="relative">
                                    <div className="flex justify-between mb-6">
                                        {paymentSteps.map((step) => (
                                            <div key={step.id} className="flex flex-col items-center relative z-10">
                                                <motion.div
                                                    initial={false}
                                                    animate={{
                                                        scale: step.active ? 1.1 : 1,
                                                        backgroundColor: step.completed ?
                                                            "var(--primary)" :
                                                            step.active ? "var(--primary-light)" : "var(--gray-200)"
                                                    }}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step.completed
                                                        ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                                        : step.active
                                                            ? "border-blue-500 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-600 dark:text-blue-400"
                                                            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                                                        } transition-all duration-300`}
                                                >
                                                    <step.icon className="w-4 h-4" />
                                                </motion.div>
                                                <span className={`mt-2 text-xs font-medium ${step.active
                                                    ? "text-blue-600 dark:text-blue-400 font-bold"
                                                    : step.completed
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-gray-500 dark:text-gray-400"
                                                    }`}>
                                                    {step.title}
                                                </span>
                                            </div>
                                        ))}

                                        {/* Progress Line */}
                                        <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                                initial={{ width: "0%" }}
                                                animate={{
                                                    width: paymentStatus === 'success' ? "100%" :
                                                        paymentStatus === 'processing' ? "66%" : "33%"
                                                }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction Overview - Premium Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="bg-gradient-to-br from-white to-white/50 dark:from-gray-800 dark:to-gray-800/50 border border-blue-200/50 dark:border-blue-700/30 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                                        <CardBody className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 group-hover:scale-110 transition-transform">
                                                            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            AMOUNT
                                                        </span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        KES {totalAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold">
                                                    M-PESA
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    <Card className="bg-gradient-to-br from-white to-white/50 dark:from-gray-800 dark:to-gray-800/50 border border-emerald-200/50 dark:border-emerald-700/30 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                                        <CardBody className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/30 group-hover:scale-110 transition-transform">
                                                            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            PHONE
                                                        </span>
                                                    </div>
                                                    <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                                                        {phoneNumber}
                                                    </p>
                                                </div>
                                                <SmartphoneNfc className="w-5 h-5 text-emerald-400/50" />
                                            </div>
                                        </CardBody>
                                    </Card>

                                    <Card className="bg-gradient-to-br from-white to-white/50 dark:from-gray-800 dark:to-gray-800/50 border border-purple-200/50 dark:border-purple-700/30 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                                        <CardBody className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 group-hover:scale-110 transition-transform">
                                                            <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            ORDER ID
                                                        </span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white font-mono truncate">
                                                        {saleId || "N/A"}
                                                    </p>
                                                </div>
                                                <BadgeCheck className="w-5 h-5 text-purple-400/50" />
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>

                                {/* Advanced Progress Section */}
                                {paymentStatus === 'processing' && (
                                    <Card className="border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden">
                                        <CardBody className="p-6">
                                            <div className="space-y-6">
                                                {/* Animated Progress Bar */}
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex space-x-1">
                                                                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                                                                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse delay-150" />
                                                                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse delay-300" />
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                Payment Authorization Progress
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge
                                                                variant="flat"
                                                                color="primary"
                                                                className="font-mono text-xs"
                                                            >
                                                                {Math.round(progressValue)}%
                                                            </Badge>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{formatTime(timer)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Glowing Progress Bar */}
                                                    <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-shimmer" />
                                                        <motion.div
                                                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                                                            initial={{ width: "10%" }}
                                                            animate={{ width: `${progressValue}%` }}
                                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                                        </motion.div>
                                                    </div>

                                                    {/* Polling Status */}
                                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                        <span>Verification attempts: {pollingCount}</span>
                                                        <span>Remaining attempts: {maxRetries - pollingCount}</span>
                                                    </div>
                                                </div>

                                                {/* Mobile Instructions */}
                                                <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-5 border border-blue-200/50 dark:border-blue-700/30">
                                                    <div className="flex items-center mb-4">
                                                        <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 mr-3">
                                                            <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 dark:text-gray-200">
                                                                Complete Payment on Your Device
                                                            </h4>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                Follow these steps to authorize the transaction
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            { step: 1, text: "Check M-Pesa prompt", icon: Zap },
                                                            { step: 2, text: "Enter secure PIN", icon: Lock },
                                                            { step: 3, text: "Confirm amount", icon: CheckCircle },
                                                            { step: 4, text: "Wait for SMS", icon: ShieldCheck }
                                                        ].map((item) => (
                                                            <div key={item.step} className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/30 border border-gray-200/30 dark:border-gray-700/30">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                    {item.step}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <item.icon className="w-3 h-3 text-blue-500" />
                                                                        <span className="text-sm font-medium">{item.text}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                )}

                                {/* Transaction Reference */}
                                {checkoutRequestId && (
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/30 dark:from-gray-800/20 dark:to-gray-900/20 rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/30">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <ExternalLink className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Transaction Reference
                                                </span>
                                            </div>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={paymentStatus === 'processing' ? "warning" : "success"}
                                                className="font-medium"
                                            >
                                                {paymentStatus === 'processing' ? 'ACTIVE' : 'COMPLETED'}
                                            </Chip>
                                        </div>
                                        <div className="font-mono text-sm bg-white/50 dark:bg-gray-800/30 p-4 rounded-lg border border-gray-200/30 dark:border-gray-700/30 overflow-x-auto backdrop-blur-sm">
                                            <div className="flex items-center justify-between">
                                                <code className="text-gray-800 dark:text-gray-200">{checkoutRequestId}</code>
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    className="text-xs"
                                                    onPress={() => navigator.clipboard.writeText(checkoutRequestId)}
                                                >
                                                    Copy
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Status Message Display */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={paymentStatus}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-center"
                                    >
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${paymentStatus === 'success'
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                            : paymentStatus === 'processing'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {paymentStatus === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                                            {paymentStatus === 'success' && <CheckCircle className="w-3 h-3" />}
                                            <span className="text-sm font-medium">{statusMessage}</span>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </ModalBody>

                            <Divider className="my-2 opacity-30" />

                            <ModalFooter className="flex flex-col sm:flex-row gap-3 pt-6 pb-10 px-8">
                                <AnimatePresence mode="wait">
                                    {paymentStatus === 'processing' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex flex-col sm:flex-row gap-3 w-full"
                                        >
                                            <Button
                                                variant="flat"
                                                color="danger"
                                                onPress={handleCancel}
                                                className="flex-1 min-w-[160px] h-12 font-semibold border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                startContent={<XCircle className="w-4 h-4" />}
                                            >
                                                Cancel Payment
                                            </Button>
                                            <Button
                                                color="primary"
                                                variant="solid"
                                                isDisabled
                                                className="flex-1 min-w-[160px] h-12 font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
                                            >
                                                <Spinner size="sm" className="mr-2" color="white" />
                                                <span className="flex items-center gap-2">
                                                    Verifying
                                                    <span className="inline-flex">
                                                        <span className="animate-pulse">.</span>
                                                        <span className="animate-pulse delay-150">.</span>
                                                        <span className="animate-pulse delay-300">.</span>
                                                    </span>
                                                </span>
                                            </Button>
                                        </motion.div>
                                    )}

                                    {paymentStatus === 'failed' && showRetry && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-col sm:flex-row gap-3 w-full"
                                        >
                                            <Button
                                                variant="flat"
                                                color="default"
                                                onPress={onPaymentFailure}
                                                className="flex-1 min-w-[160px] h-12 font-semibold border border-gray-200 dark:border-gray-700"
                                            >
                                                Return to Checkout
                                            </Button>
                                            <Button
                                                color="primary"
                                                variant="solid"
                                                onPress={handleRetry}
                                                className="flex-1 min-w-[160px] h-12 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                                                startContent={<RefreshCw className="w-4 h-4 animate-spin" />}
                                            >
                                                Retry Verification
                                            </Button>
                                        </motion.div>
                                    )}

                                    {paymentStatus === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-full"
                                        >
                                            <Button
                                                color="success"
                                                variant="solid"
                                                onPress={onPaymentSuccess}
                                                className="w-full h-12 font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                                                startContent={
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </motion.div>
                                                }
                                            >
                                                Continue Shopping
                                            </Button>
                                        </motion.div>
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
                                </AnimatePresence>
                            </ModalFooter>

                            {/* Premium Security Footer */}
                            <div className="px-8 py-5 bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 border-t border-gray-200/50 dark:border-gray-700/30">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                PCI DSS COMPLIANT
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                256-BIT ENCRYPTION
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-500" />
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                SECURE CONNECTION
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span>Powered by Safaricom M-Pesa • Enterprise Grade Security</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </ModalContent>
        </Modal>
    );
};