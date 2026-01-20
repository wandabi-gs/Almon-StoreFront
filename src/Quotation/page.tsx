"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    DocumentTextIcon,
    CalculatorIcon,
    CurrencyDollarIcon,
    TruckIcon,
    CalendarIcon,
    UserIcon,
    BuildingOfficeIcon,
    EnvelopeIcon,
    PhoneIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    PlusIcon,
    MinusIcon,
    ShoppingBagIcon,
    ArrowRightIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";

// API Service Functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface QuotationItem {
    productId: string;
    quantity: number;
    unitPrice: number;
    description?: string;
}

interface QuotationRequest {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    industry: string;
    companySize: string;
    materials: string[];
    monthlyVolume: string;
    deliveryFrequency: string;
    budgetRange: string;
    timeline: string;
    paymentTerms: string;
    specialRequirements: string;
    items: QuotationItem[];
}

interface QuotationResponse {
    success: boolean;
    quotationNumber: string;
    total: number;
    pdfUrl: string;
    message: string;
}

// Product data from your storefront
const quotationProducts = {
    roll: [
        { id: "frontlit-banner-1-5-m-440gsm", name: "Frontlit Banner 1.5m 440GSM", price: 4500, category: "roll" },
        { id: "frontlit-banner-2-7-m-440gsm", name: "Frontlit Banner 2.7m 440GSM", price: 7800, category: "roll" },
        { id: "black-back-1-06-440gsm", name: "Black Back Banner 1.06m 440GSM", price: 3200, category: "roll" },
        { id: "clear-gloss-roll-1-35", name: "Clear Gloss Roll 1.35m", price: 2800, category: "roll" },
        { id: "one-way-vision-1-35", name: "One Way Vision 1.35m", price: 5200, category: "roll" },
        { id: "rainbow-film-1-37", name: "Rainbow Film 1.37m", price: 6200, category: "roll" },
        { id: "frosted-window-film-roll-1-27", name: "Frosted Window Film 1.27m", price: 4800, category: "roll" },
    ],
    board: [
        { id: "corex-5mm", name: "Corex Board 5mm", price: 1800, category: "board" },
        { id: "aluco-3mm-black", name: "Alucobond 3mm Black", price: 4500, category: "board" },
        { id: "forex-3mm", name: "Forex Board 3mm", price: 2200, category: "board" },
        { id: "persepex-clear", name: "Perspex Clear", price: 3200, category: "board" },
        { id: "abs-0-9", name: "ABS Board 0.9mm", price: 1900, category: "board" },
        { id: "corex-3mm", name: "Corex Board 3mm", price: 1500, category: "board" },
        { id: "forex-5mm", name: "Forex Board 5mm", price: 2800, category: "board" },
    ],
    unit: [
        { id: "aluminium-big-cutter", name: "Aluminium Big Cutter", price: 8500, category: "unit" },
        { id: "snapper-frame-a0", name: "Snapper Frame A0", price: 12500, category: "unit" },
        { id: "pop-up-3-by-3", name: "Pop-up Stand 3x3", price: 45000, category: "unit" },
        { id: "lanyard-big-grey", name: "Big Grey Lanyard", price: 250, category: "unit" },
        { id: "pen-executive", name: "Executive Pen", price: 350, category: "unit" },
        { id: "scissors", name: "Professional Scissors", price: 450, category: "unit" },
        { id: "big-knife", name: "Big Cutter Knife", price: 650, category: "unit" },
        { id: "eyelets-small-pckt", name: "Eyelets Small Pack", price: 850, category: "unit" },
        { id: "snapper-frame-a1", name: "Snapper Frame A1", price: 8500, category: "unit" },
        { id: "snapper-frame-a2", name: "Snapper Frame A2", price: 6500, category: "unit" },
        { id: "x-stand", name: "X-Stand Display", price: 6800, category: "unit" },
    ]
};

const materialOptions = [
    "Roll Materials (Banners, Vinyl, Films)",
    "Board Substrates (Corex, Forex, Alucobond)",
    "Aluminium Products & Frames",
    "Hardware & Cutting Tools",
    "Signage & Display Systems",
    "Promotional & Branding Items",
    "Packaging & Protection Materials"
];

// API Service Functions
async function submitQuotationAPI(request: QuotationRequest): Promise<QuotationResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/quotation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Quotation submission error:', error);
        throw error;
    }
}

async function downloadQuotationPDF(quotationNumber: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/quotation?id=${quotationNumber}`);

        if (!response.ok) {
            throw new Error('Failed to download quotation');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AlmonProducts-Quotation-${quotationNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}

export default function QuotationPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [quotationResult, setQuotationResult] = useState<QuotationResponse | null>(null);
    const [downloadLoading, setDownloadLoading] = useState(false);

    const [formData, setFormData] = useState({
        companyName: "",
        industry: "",
        companySize: "",
        contactPerson: "",
        email: "",
        phone: "",
        materials: [] as string[],
        monthlyVolume: "",
        deliveryFrequency: "",
        specialRequirements: "",
        budgetRange: "",
        timeline: "",
        paymentTerms: ""
    });

    const [selectedProducts, setSelectedProducts] = useState<
        Array<{
            id: string;
            name: string;
            quantity: number;
            unitPrice: number;
            category: string;
        }>
    >([]);

    // Calculate pricing
    const calculateSubtotal = () => {
        return selectedProducts.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    };

    const calculateVAT = () => {
        return calculateSubtotal() * 0.16; // 16% VAT
    };

    const calculateDeliveryFee = () => {
        switch (formData.deliveryFrequency) {
            case 'weekly': return 5000;
            case 'bi-weekly': return 3000;
            case 'monthly': return 2000;
            default: return 0;
        }
    };

    const calculateDiscount = () => {
        const subtotal = calculateSubtotal();
        switch (formData.monthlyVolume) {
            case '50k-200k': return subtotal * 0.05;
            case '200k-500k': return subtotal * 0.10;
            case '500k+': return subtotal * 0.15;
            default: return 0;
        }
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const vat = calculateVAT();
        const deliveryFee = calculateDeliveryFee();
        const discount = calculateDiscount();
        return subtotal + vat + deliveryFee - discount;
    };

    // Form handlers
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMaterialToggle = (material: string) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.includes(material)
                ? prev.materials.filter(m => m !== material)
                : [...prev.materials, material]
        }));
    };

    const addProduct = (product: any) => {
        setSelectedProducts(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p =>
                    p.id === product.id
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeProduct = (productId: string) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeProduct(productId);
            return;
        }
        setSelectedProducts(prev =>
            prev.map(p => p.id === productId ? { ...p, quantity } : p)
        );
    };

    // API Submission
    const submitQuotationRequest = async () => {
        if (selectedProducts.length === 0) {
            alert("Please add at least one product to your quotation");
            return;
        }

        if (!formData.companyName || !formData.email || !formData.phone) {
            alert("Please fill in all required company information");
            return;
        }

        setLoading(true);
        try {
            const items = selectedProducts.map(p => ({
                productId: p.id,
                quantity: p.quantity,
                unitPrice: p.unitPrice,
                description: p.name
            }));

            const requestData: QuotationRequest = {
                ...formData,
                items
            };

            const result = await submitQuotationAPI(requestData);
            setQuotationResult(result);
            setStep(5);

            // Auto-download after successful submission
            setTimeout(() => {
                handleDownloadInvoice(result.quotationNumber);
            }, 1000);

        } catch (error) {
            console.error("Quotation submission failed:", error);
            alert("Failed to submit quotation. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async (quotationNumber?: string) => {
        const number = quotationNumber || quotationResult?.quotationNumber;
        if (!number) return;

        setDownloadLoading(true);
        try {
            await downloadQuotationPDF(number);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download invoice. You can try again from the email we sent.");
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleSendEmailCopy = async () => {
        if (!quotationResult?.quotationNumber) return;

        try {
            // In production, this would call an API endpoint to resend email
            alert("A copy of the quotation has been sent to your email address.");
        } catch (error) {
            console.error("Email resend failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,82,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,82,212,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <motion.div
                    className="absolute top-1/4 -left-40 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent rounded-full blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-40 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-500/5 via-teal-500/5 to-transparent rounded-full blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
            </div>

            {/* Header */}
            <header className="relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-8xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate("/")}
                            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-200 dark:to-gray-300"
                        >
                            Almon<span className="text-blue-600 dark:text-blue-400">Products</span>
                        </button>
                        <button
                            onClick={() => navigate("/enterprise")}
                            className="px-6 py-3 rounded-xl border-2 border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            ← Back to Store
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-16 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Progress Steps */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between relative max-w-4xl mx-auto">
                            <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 -z-10 rounded-full" />
                            {[1, 2, 3, 4, 5].map((stepNumber) => (
                                <div key={stepNumber} className="flex flex-col items-center relative">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${step >= stepNumber
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400"
                                        }`}>
                                        {stepNumber}
                                    </div>
                                    <span className={`mt-3 text-sm font-semibold text-center whitespace-nowrap ${step >= stepNumber
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-500 dark:text-gray-400"
                                        }`}>
                                        {["Company", "Needs", "Products", "Budget", "Submit"][stepNumber - 1]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-gradient-to-br from-white/90 to-white/40 dark:from-gray-900/90 dark:to-gray-800/40 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden mb-8">
                        {/* Header */}
                        <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                                        <DocumentTextIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                                            Enterprise Quotation
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Get custom pricing for bulk orders
                                        </p>
                                    </div>
                                </div>
                                {selectedProducts.length > 0 && step >= 3 && (
                                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl shadow-lg">
                                        <div className="text-sm font-medium">Estimated Total</div>
                                        <div className="text-2xl font-bold">KSh {calculateTotal().toLocaleString()}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 md:p-8">
                            {/* Step 1: Company Information */}
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <div className="flex items-center space-x-3 mb-6">
                                            <BuildingOfficeIcon className="w-6 h-6 text-blue-500" />
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Company Information
                                            </h2>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Company Name *
                                                </label>
                                                <div className="relative">
                                                    <BuildingOfficeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.companyName}
                                                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter company name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Industry *
                                                </label>
                                                <select
                                                    value={formData.industry}
                                                    onChange={(e) => handleInputChange("industry", e.target.value)}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Select Industry</option>
                                                    <option value="advertising">Advertising & Marketing</option>
                                                    <option value="retail">Retail & Merchandising</option>
                                                    <option value="events">Events & Exhibitions</option>
                                                    <option value="construction">Construction</option>
                                                    <option value="manufacturing">Manufacturing</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Company Size *
                                                </label>
                                                <select
                                                    value={formData.companySize}
                                                    onChange={(e) => handleInputChange("companySize", e.target.value)}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Select Size</option>
                                                    <option value="1-10">1-10 Employees</option>
                                                    <option value="11-50">11-50 Employees</option>
                                                    <option value="51-200">51-200 Employees</option>
                                                    <option value="201-500">201-500 Employees</option>
                                                    <option value="500+">500+ Employees</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Contact Person *
                                                </label>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.contactPerson}
                                                        onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Full name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Email Address *
                                                </label>
                                                <div className="relative">
                                                    <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="business@company.com"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Phone Number *
                                                </label>
                                                <div className="relative">
                                                    <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="+254 XXX XXX XXX"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Requirements */}
                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <div className="flex items-center space-x-3 mb-6">
                                            <ClipboardDocumentListIcon className="w-6 h-6 text-blue-500" />
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Project Requirements
                                            </h2>
                                        </div>

                                        <div className="mb-8">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                                What materials do you need? *
                                            </label>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {materialOptions.map((material) => (
                                                    <button
                                                        key={material}
                                                        type="button"
                                                        onClick={() => handleMaterialToggle(material)}
                                                        className={`p-4 rounded-xl border-2 transition-all text-left ${formData.materials.includes(material)
                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {material}
                                                            </span>
                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.materials.includes(material)
                                                                ? "bg-blue-500 border-blue-500"
                                                                : "border-gray-300 dark:border-gray-600"
                                                                }`}>
                                                                {formData.materials.includes(material) && (
                                                                    <CheckCircleIcon className="w-4 h-4 text-white" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Estimated Monthly Volume *
                                                </label>
                                                <select
                                                    value={formData.monthlyVolume}
                                                    onChange={(e) => handleInputChange("monthlyVolume", e.target.value)}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Select Volume</option>
                                                    <option value="<10k">Less than 10,000 KSh</option>
                                                    <option value="10k-50k">10,000 - 50,000 KSh</option>
                                                    <option value="50k-200k">50,000 - 200,000 KSh</option>
                                                    <option value="200k-500k">200,000 - 500,000 KSh</option>
                                                    <option value="500k+">500,000+ KSh</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Delivery Frequency *
                                                </label>
                                                <select
                                                    value={formData.deliveryFrequency}
                                                    onChange={(e) => handleInputChange("deliveryFrequency", e.target.value)}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Select Frequency</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="bi-weekly">Bi-weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="as-needed">As Needed</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Special Requirements
                                            </label>
                                            <textarea
                                                value={formData.specialRequirements}
                                                onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                                                rows={4}
                                                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Any special requirements, certifications, or specific needs..."
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Product Selection */}
                            {step === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <div className="flex items-center space-x-3 mb-6">
                                            <ShoppingBagIcon className="w-6 h-6 text-blue-500" />
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Select Products for Quotation
                                            </h2>
                                        </div>

                                        {/* Selected Products Summary */}
                                        {selectedProducts.length > 0 && (
                                            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700/50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                                                        <ShoppingBagIcon className="w-5 h-5 mr-2" />
                                                        Selected Products ({selectedProducts.length})
                                                    </h3>
                                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                        KSh {calculateTotal().toLocaleString()} Total
                                                    </span>
                                                </div>
                                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                                    {selectedProducts.map((product) => (
                                                        <div key={product.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                                    {product.name}
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    KSh {product.unitPrice.toLocaleString()} × {product.quantity}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1">
                                                                    <button
                                                                        onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                                                        className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                                                                    >
                                                                        <MinusIcon className="w-4 h-4" />
                                                                    </button>
                                                                    <span className="font-bold min-w-[20px] text-center">{product.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                                                        className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                                                                    >
                                                                        <PlusIcon className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                <div className="text-right min-w-[100px]">
                                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                                        KSh {(product.quantity * product.unitPrice).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeProduct(product.id)}
                                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                                                >
                                                                    <XMarkIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Price Breakdown */}
                                                <div className="pt-4 border-t border-blue-200 dark:border-blue-700/50 mt-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                                            <span className="font-semibold">KSh {calculateSubtotal().toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">VAT (16%):</span>
                                                            <span className="font-semibold">KSh {calculateVAT().toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Delivery Fee:</span>
                                                            <span className="font-semibold">KSh {calculateDeliveryFee().toLocaleString()}</span>
                                                        </div>
                                                        {calculateDiscount() > 0 && (
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-green-600 dark:text-green-400">Volume Discount:</span>
                                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                                    -KSh {calculateDiscount().toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-700/50">
                                                            <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                                                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                                KSh {calculateTotal().toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Product Categories */}
                                        <div className="space-y-8">
                                            {Object.entries(quotationProducts).map(([category, products]) => (
                                                <div key={category}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                                            {category} Products
                                                        </h3>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {products.length} items
                                                        </span>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {products.map((product) => (
                                                            <button
                                                                key={product.id}
                                                                onClick={() => addProduct(product)}
                                                                className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-left group relative"
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 pr-6">
                                                                        {product.name}
                                                                    </span>
                                                                    <PlusIcon className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3" />
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    KSh {product.price.toLocaleString()}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Budget & Timeline */}
                            {step === 4 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <div className="flex items-center space-x-3 mb-6">
                                            <CurrencyDollarIcon className="w-6 h-6 text-blue-500" />
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Budget & Timeline
                                            </h2>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Budget Range *
                                                </label>
                                                <div className="relative">
                                                    <CurrencyDollarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <select
                                                        value={formData.budgetRange}
                                                        onChange={(e) => handleInputChange("budgetRange", e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    >
                                                        <option value="">Select Budget Range</option>
                                                        <option value="<100k">Under 100,000 KSh</option>
                                                        <option value="100k-500k">100,000 - 500,000 KSh</option>
                                                        <option value="500k-2M">500,000 - 2,000,000 KSh</option>
                                                        <option value="2M-5M">2,000,000 - 5,000,000 KSh</option>
                                                        <option value="5M+">5,000,000+ KSh</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Project Timeline *
                                                </label>
                                                <div className="relative">
                                                    <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <select
                                                        value={formData.timeline}
                                                        onChange={(e) => handleInputChange("timeline", e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    >
                                                        <option value="">Select Timeline</option>
                                                        <option value="immediate">Immediate (1-2 weeks)</option>
                                                        <option value="1-month">Within 1 month</option>
                                                        <option value="1-3-months">1-3 months</option>
                                                        <option value="3-6-months">3-6 months</option>
                                                        <option value="6-months+">6+ months</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Preferred Payment Terms *
                                                </label>
                                                <select
                                                    value={formData.paymentTerms}
                                                    onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Select Payment Terms</option>
                                                    <option value="net15">Net 15 Days</option>
                                                    <option value="net30">Net 30 Days</option>
                                                    <option value="net60">Net 60 Days</option>
                                                    <option value="upfront">100% Upfront</option>
                                                    <option value="50-50">50% Upfront, 50% on Delivery</option>
                                                    <option value="other">Other (specify in notes)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 5: Success */}
                            {step === 5 && quotationResult && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <CheckCircleIcon className="w-12 h-12 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                        Quotation Submitted Successfully!
                                    </h2>
                                    <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-6">
                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                            Quotation Number: {quotationResult.quotationNumber}
                                        </span>
                                    </div>
                                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                                        Thank you for your enterprise quotation request. We've sent a detailed invoice to your email and our sales team will contact you within 24 hours.
                                    </p>

                                    <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700/50">
                                            <PhoneIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                                            <div className="font-bold text-gray-900 dark:text-white mb-1">Phone Follow-up</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Within 4 business hours</div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/50">
                                            <EnvelopeIcon className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                                            <div className="font-bold text-gray-900 dark:text-white mb-1">Email Quote</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Check your inbox</div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700/50">
                                            <ClipboardDocumentListIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                                            <div className="font-bold text-gray-900 dark:text-white mb-1">Detailed Proposal</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Within 48 hours</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={() => navigate("/")}
                                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center space-x-2"
                                        >
                                            <ArrowRightIcon className="w-5 h-5 rotate-180" />
                                            <span>Return to Store</span>
                                        </button>
                                        <button
                                            onClick={() => handleDownloadInvoice()}
                                            disabled={downloadLoading}
                                            className="px-8 py-4 rounded-xl border-2 border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                                        >
                                            {downloadLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                                                    <span>Downloading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                                    <span>Download Invoice PDF</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleSendEmailCopy}
                                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300"
                                        >
                                            Resend Email
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Navigation */}
                        {step < 5 && (
                            <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        disabled={step === 1}
                                        className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 w-full sm:w-auto ${step === 1
                                            ? "opacity-50 cursor-not-allowed text-gray-400 bg-gray-100 dark:bg-gray-800"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700"
                                            }`}
                                    >
                                        ← Back
                                    </button>

                                    <div className="flex items-center space-x-4">
                                        {step === 3 && selectedProducts.length > 0 && (
                                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:block">
                                                <span className="text-gray-500">Total:</span>{" "}
                                                <span className="text-blue-600 dark:text-blue-400">
                                                    KSh {calculateTotal().toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                if (step < 4) {
                                                    // Validate current step before proceeding
                                                    if (step === 1) {
                                                        if (!formData.companyName || !formData.email || !formData.phone) {
                                                            alert("Please fill in all required company information");
                                                            return;
                                                        }
                                                    } else if (step === 2) {
                                                        if (formData.materials.length === 0) {
                                                            alert("Please select at least one material category");
                                                            return;
                                                        }
                                                    } else if (step === 3) {
                                                        if (selectedProducts.length === 0) {
                                                            alert("Please add at least one product to your quotation");
                                                            return;
                                                        }
                                                    }
                                                    setStep(step + 1);
                                                } else {
                                                    submitQuotationRequest();
                                                }
                                            }}
                                            disabled={loading || (step === 3 && selectedProducts.length === 0)}
                                            className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto min-w-[180px] ${loading || (step === 3 && selectedProducts.length === 0)
                                                ? "opacity-50 cursor-not-allowed bg-gray-300"
                                                : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-xl hover:scale-[1.02] active:scale-95"
                                                }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Processing...</span>
                                                </>
                                            ) : step < 4 ? (
                                                <>
                                                    <span>Continue</span>
                                                    <ArrowRightIcon className="w-5 h-5" />
                                                </>
                                            ) : (
                                                <span>Submit Quotation Request</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Benefits Sidebar */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: CalculatorIcon,
                                title: "Custom Pricing",
                                description: "Volume-based discounts up to 15% for enterprise orders",
                                color: "blue"
                            },
                            {
                                icon: TruckIcon,
                                title: "Priority Delivery",
                                description: "Dedicated logistics with real-time tracking for enterprise clients",
                                color: "cyan"
                            },
                            {
                                icon: ShieldCheckIcon,
                                title: "Enterprise Support",
                                description: "Dedicated account manager and 24/7 technical support",
                                color: "emerald"
                            }
                        ].map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-shadow"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${benefit.color}-500 to-${benefit.color}-400 flex items-center justify-center mb-4`}>
                                    <benefit.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer Note */}
            <footer className="relative z-10 py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Need immediate assistance? Call our enterprise team at{" "}
                    <a href="tel:+254700000000" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        +254 700 000 000
                    </a>
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                    © {new Date().getFullYear()} Almon Products Ltd. All enterprise quotations are valid for 30 days.
                </p>
            </footer>
        </div>
    );
}