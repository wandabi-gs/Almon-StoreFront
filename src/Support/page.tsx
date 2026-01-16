"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    LifebuoyIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    VideoCameraIcon,
    WrenchScrewdriverIcon,
    ClockIcon,
    UserGroupIcon,
    AcademicCapIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function SupportPage() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("technical");
    const [searchQuery, setSearchQuery] = useState("");

    const categories = [
        {
            id: "technical",
            title: "Technical Support",
            description: "Product specifications, installation guides, troubleshooting",
            icon: WrenchScrewdriverIcon,
            color: "blue"
        },
        {
            id: "orders",
            title: "Order Support",
            description: "Tracking, delivery, returns, and order modifications",
            icon: ClockIcon,
            color: "green"
        },
        {
            id: "account",
            title: "Account Support",
            description: "Billing, enterprise accounts, and profile management",
            icon: UserGroupIcon,
            color: "purple"
        },
        {
            id: "training",
            title: "Training & Resources",
            description: "Product training, webinars, and learning materials",
            icon: AcademicCapIcon,
            color: "orange"
        }
    ];

    const faqs = [
        {
            question: "What are your delivery timelines?",
            answer: "Standard delivery is 2-3 business days within Nairobi CBD and 3-5 days for other areas. Express delivery (24 hours) is available for urgent orders.",
            category: "orders"
        },
        {
            question: "Do you offer bulk discounts for enterprises?",
            answer: "Yes, we offer custom pricing for bulk orders. Contact our enterprise team for a tailored quote based on your volume requirements.",
            category: "account"
        },
        {
            question: "What is your return policy?",
            answer: "Unopened materials can be returned within 7 days. Defective materials are replaced immediately. Custom orders are non-returnable.",
            category: "orders"
        },
        {
            question: "How do I install the banner material?",
            answer: "We provide detailed installation guides and video tutorials. For large projects, we recommend professional installation services.",
            category: "technical"
        },
        {
            question: "Do you provide installation services?",
            answer: "Yes, we offer professional installation services through our certified partners. Contact support for scheduling.",
            category: "technical"
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept MPesa, credit/debit cards, bank transfers, and corporate credit accounts for enterprise clients.",
            category: "account"
        }
    ];

    const contactMethods = [
        {
            title: "Phone Support",
            description: "24/7 technical support hotline",
            icon: PhoneIcon,
            details: "+254 711 123 456",
            action: "Call Now"
        },
        {
            title: "Email Support",
            description: "Detailed inquiries and documentation",
            icon: EnvelopeIcon,
            details: "support@almonpro.co.ke",
            action: "Send Email"
        },
        {
            title: "Live Chat",
            description: "Instant messaging with our team",
            icon: ChatBubbleLeftRightIcon,
            details: "Available 8AM-8PM EAT",
            action: "Start Chat"
        },
        {
            title: "Emergency Support",
            description: "Critical issue hotline",
            icon: ExclamationTriangleIcon,
            details: "+254 722 789 012",
            action: "Emergency"
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        (activeCategory === "all" || faq.category === activeCategory) &&
        (searchQuery === "" ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate("/enterprise")}
                                className="hidden md:block px-6 py-3 rounded-xl border-2 border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                                Enterprise
                            </button>
                            <button
                                onClick={() => navigate("/quotation")}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Get Quote
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-20 pb-32">
                {/* Hero */}
                <section className="text-center mb-20">
                    <div className="max-w-4xl mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-8"
                        >
                            <LifebuoyIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                ENTERPRISE SUPPORT
                            </span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                        >
                            Enterprise <span className="text-blue-600 dark:text-blue-400">Support</span> Center
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12"
                        >
                            Comprehensive support solutions for businesses that demand excellence and reliability.
                        </motion.p>

                        {/* Search */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for help articles, guides, or FAQs..."
                                    className="w-full px-6 py-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                />
                                <LifebuoyIcon className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section className="mb-20">
                    <div className="max-w-8xl mx-auto px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {categories.map((category, index) => (
                                <motion.button
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setActiveCategory(category.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`p-6 rounded-2xl text-left transition-all ${activeCategory === category.id
                                        ? `bg-gradient-to-br from-${category.color}-50 to-${category.color}-100/50 dark:from-${category.color}-900/30 dark:to-${category.color}-800/30 border-2 border-${category.color}-500/50`
                                        : "bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-900/50 dark:to-gray-800/30 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl"
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-${category.color}-100 dark:bg-${category.color}-900/30 flex items-center justify-center mb-4`}>
                                        <category.icon className={`w-6 h-6 text-${category.color}-600 dark:text-${category.color}-400`} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        {category.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {category.description}
                                    </p>
                                </motion.button>
                            ))}
                        </div>

                        {/* FAQ Section */}
                        <div className="mb-20">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {filteredFaqs.map((faq, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                    {faq.question}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Methods */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Contact Our Team</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {contactMethods.map((method, index) => (
                                    <motion.div
                                        key={method.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                            <method.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            {method.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            {method.description}
                                        </p>
                                        <div className="font-semibold text-gray-900 dark:text-white mb-4">
                                            {method.details}
                                        </div>
                                        <button className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all">
                                            {method.action}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resources */}
                <section className="mb-20">
                    <div className="max-w-8xl mx-auto px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Learning Resources</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Product Manuals",
                                    description: "Detailed technical specifications and installation guides",
                                    icon: DocumentTextIcon,
                                    count: "45+ Documents"
                                },
                                {
                                    title: "Video Tutorials",
                                    description: "Step-by-step installation and maintenance videos",
                                    icon: VideoCameraIcon,
                                    count: "28 Videos"
                                },
                                {
                                    title: "Safety Guides",
                                    description: "Material handling and safety procedures",
                                    icon: ShieldCheckIcon,
                                    count: "12 Guides"
                                }
                            ].map((resource, index) => (
                                <motion.div
                                    key={resource.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4">
                                        <resource.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        {resource.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {resource.description}
                                    </p>
                                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                        {resource.count}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}