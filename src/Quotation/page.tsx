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
    ArrowDownTrayIcon
} from "@heroicons/react/24/outline";

export default function QuotationPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Company Information
        companyName: "",
        industry: "",
        companySize: "",
        contactPerson: "",
        email: "",
        phone: "",

        // Requirements
        materialTypes: [] as string[],
        monthlyVolume: "",
        deliveryFrequency: "",
        specialRequirements: "",

        // Budget & Timeline
        budgetRange: "",
        timeline: "",
        paymentTerms: ""
    });

    const materialOptions = [
        "Roll Materials (Banners, Vinyl)",
        "Board Substrates (Corex, Forex)",
        "Aluminium Products",
        "Hardware & Tools",
        "Signage Accessories",
        "Packaging Materials",
        "Promotional Items"
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMaterialToggle = (material: string) => {
        setFormData(prev => ({
            ...prev,
            materialTypes: prev.materialTypes.includes(material)
                ? prev.materialTypes.filter(m => m !== material)
                : [...prev.materialTypes, material]
        }));
    };

    const submitQuotation = () => {
        // In production, this would send to backend
        console.log("Quotation submitted:", formData);
        setStep(4);
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
                            Almon<span className="text-blue-600 dark:text-blue-400">Pro</span>
                        </button>
                        <button
                            onClick={() => navigate("/enterprise")}
                            className="px-6 py-3 rounded-xl border-2 border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            Enterprise Solutions
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-20 pb-32">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    {/* Progress Steps */}
                    <div className="mb-16">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 -z-10" />
                            {[1, 2, 3, 4].map((stepNumber) => (
                                <div key={stepNumber} className="flex flex-col items-center relative">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${step >= stepNumber
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-500 text-white"
                                        : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400"
                                        }`}>
                                        {stepNumber}
                                    </div>
                                    <span className={`mt-3 text-sm font-semibold ${step >= stepNumber
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-500 dark:text-gray-400"
                                        }`}>
                                        {["Company Info", "Requirements", "Budget", "Submit"][stepNumber - 1]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-4xl overflow-hidden">
                        {/* Header */}
                        <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                                    <DocumentTextIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                                        Enterprise Quotation Request
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Get a custom quote tailored to your business needs
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-8">
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                            Company Information
                                        </h2>
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
                                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter company name"
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
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Full name"
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
                                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="business@company.com"
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
                                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="+254 XXX XXX XXX"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                            Material Requirements
                                        </h2>

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
                                                        className={`p-4 rounded-xl border-2 transition-all text-left ${formData.materialTypes.includes(material)
                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {material}
                                                            </span>
                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.materialTypes.includes(material)
                                                                ? "bg-blue-500 border-blue-500"
                                                                : "border-gray-300 dark:border-gray-600"
                                                                }`}>
                                                                {formData.materialTypes.includes(material) && (
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
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Any special requirements, certifications, or specific needs..."
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                            Budget & Timeline
                                        </h2>
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
                                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                            {step === 4 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center mx-auto mb-8">
                                        <CheckCircleIcon className="w-12 h-12 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                        Quotation Request Submitted!
                                    </h2>
                                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                                        Thank you for your request. Our enterprise team will review your requirements and contact you within 24 hours with a custom quotation.
                                    </p>
                                    <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                                            <PhoneIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                                            <div className="font-semibold text-gray-900 dark:text-white">Phone Follow-up</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Within 4 business hours</div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                            <EnvelopeIcon className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                                            <div className="font-semibold text-gray-900 dark:text-white">Email Quote</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Within 24 hours</div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                                            <ClipboardDocumentListIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                                            <div className="font-semibold text-gray-900 dark:text-white">Detailed Proposal</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Within 48 hours</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={() => navigate("/")}
                                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-xl hover:scale-[1.02] transition-all"
                                        >
                                            Return to Store
                                        </button>
                                        <button className="px-8 py-4 rounded-xl border-2 border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all flex items-center justify-center space-x-2">
                                            <ArrowDownTrayIcon className="w-5 h-5" />
                                            <span>Download Summary</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Navigation */}
                            {step < 4 && (
                                <div className="flex justify-between pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        disabled={step === 1}
                                        className={`px-8 py-3 rounded-xl font-semibold transition-all ${step === 1
                                            ? "opacity-50 cursor-not-allowed text-gray-400"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => step < 3 ? setStep(step + 1) : submitQuotation()}
                                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-xl hover:scale-[1.02] transition-all"
                                    >
                                        {step < 3 ? "Continue" : "Submit Quotation Request"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Benefits Sidebar */}
                    <div className="mt-8 grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: CalculatorIcon,
                                title: "Custom Pricing",
                                description: "Tailored quotes based on your volume and requirements"
                            },
                            {
                                icon: TruckIcon,
                                title: "Priority Delivery",
                                description: "Dedicated logistics for enterprise clients"
                            },
                            {
                                icon: CurrencyDollarIcon,
                                title: "Bulk Discounts",
                                description: "Volume-based pricing with significant savings"
                            }
                        ].map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
                            >
                                <benefit.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}