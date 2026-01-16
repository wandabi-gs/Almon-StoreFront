"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    BuildingOfficeIcon,
    RocketLaunchIcon,
    UsersIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
    CogIcon,
    DocumentChartBarIcon,
    CloudArrowUpIcon
} from "@heroicons/react/24/outline";

export default function EnterprisePage() {
    const navigate = useNavigate();
    const [activeSolution, setActiveSolution] = useState("supply");

    const solutions = [
        {
            id: "supply",
            title: "Enterprise Supply",
            description: "Bulk material procurement with custom pricing and dedicated logistics",
            icon: BuildingOfficeIcon,
            gradient: "from-blue-600 to-cyan-500",
            features: [
                "Custom bulk pricing agreements",
                "Dedicated account management",
                "Priority inventory allocation",
                "Scheduled deliveries",
                "Quality assurance audits"
            ]
        },
        {
            id: "integration",
            title: "System Integration",
            description: "Seamless integration with your procurement and inventory systems",
            icon: CogIcon,
            gradient: "from-purple-600 to-pink-500",
            features: [
                "API access for real-time inventory",
                "ERP system integration",
                "Automated reordering",
                "Digital order tracking",
                "Custom reporting dashboards"
            ]
        },
        {
            id: "managed",
            title: "Managed Services",
            description: "Complete outsourcing of your material procurement and management",
            icon: UsersIcon,
            gradient: "from-emerald-600 to-teal-500",
            features: [
                "End-to-end procurement management",
                "Inventory optimization",
                "Vendor management",
                "Cost analysis & reporting",
                "Sustainability tracking"
            ]
        }
    ];

    const caseStudies = [
        {
            company: "Global Advertising Corp",
            challenge: "Inconsistent material quality across 15 locations",
            solution: "Centralized procurement with quality guarantees",
            result: "40% cost reduction, 99% quality consistency",
            logo: "GAC"
        },
        {
            company: "Retail Chain Kenya",
            challenge: "Frequent stockouts during peak seasons",
            solution: "Predictive inventory with buffer stock",
            result: "Zero stockouts, 25% inventory optimization",
            logo: "RCK"
        },
        {
            company: "Event Solutions Ltd",
            challenge: "Last-minute material requirements",
            solution: "Priority access with 24-hour delivery guarantee",
            result: "98% on-time delivery, 30% faster project completion",
            logo: "ESL"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,82,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,82,212,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <motion.div
                    className="absolute top-1/4 -left-40 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-40 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-500/5 via-cyan-500/5 to-transparent rounded-full blur-3xl"
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
                            onClick={() => navigate("/quotation")}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Request Quote
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-20 pb-32">
                {/* Hero */}
                <section className="text-center mb-32">
                    <div className="max-w-4xl mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-8"
                        >
                            <RocketLaunchIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                ENTERPRISE SOLUTIONS
                            </span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                        >
                            Enterprise <span className="text-blue-600 dark:text-blue-400">Solutions</span> for Scale
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12"
                        >
                            Comprehensive procurement solutions for businesses that demand reliability, scale, and efficiency in their material supply chain.
                        </motion.p>
                    </div>
                </section>

                {/* Solutions */}
                <section className="mb-32">
                    <div className="max-w-8xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Our Solutions
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Tailored solutions designed to optimize your procurement process
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8 mb-12">
                            {solutions.map((solution) => (
                                <motion.button
                                    key={solution.id}
                                    onClick={() => setActiveSolution(solution.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`p-6 rounded-2xl text-left transition-all ${activeSolution === solution.id
                                        ? "bg-gradient-to-br from-white to-white/80 dark:from-gray-900 dark:to-gray-800 shadow-4xl border-2 border-blue-500/50"
                                        : "bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-900/50 dark:to-gray-800/30 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl"
                                        }`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${solution.gradient} p-0.5 mb-6`}>
                                        <div className="w-full h-full rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center">
                                            <solution.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {solution.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        {solution.description}
                                    </p>
                                    <div className="space-y-2">
                                        {solution.features.map((feature, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Solution Details */}
                        <motion.div
                            key={activeSolution}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50"
                        >
                            <div className="grid lg:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        {solutions.find(s => s.id === activeSolution)?.title} Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <ShieldCheckIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">Enterprise Security</div>
                                                <div className="text-gray-600 dark:text-gray-300">Bank-grade security for all transactions and data</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <ArrowPathIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">24/7 Support</div>
                                                <div className="text-gray-600 dark:text-gray-300">Dedicated support team available round the clock</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <DocumentChartBarIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">Detailed Reporting</div>
                                                <div className="text-gray-600 dark:text-gray-300">Comprehensive analytics and reporting dashboard</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900/50">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Get Started</h4>
                                        <button
                                            onClick={() => navigate("/quotation")}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-xl mb-4"
                                        >
                                            Request Custom Proposal
                                        </button>
                                        <button className="w-full py-4 rounded-xl border-2 border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            Schedule Demo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Case Studies */}
                <section className="mb-32">
                    <div className="max-w-8xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Success Stories
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                See how we've helped enterprises transform their procurement
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {caseStudies.map((study, index) => (
                                <motion.div
                                    key={study.company}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="p-8 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl mb-6">
                                        {study.logo}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        {study.company}
                                    </h3>
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Challenge</div>
                                            <div className="text-gray-700 dark:text-gray-300">{study.challenge}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Solution</div>
                                            <div className="text-gray-700 dark:text-gray-300">{study.solution}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Result</div>
                                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{study.result}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section>
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="p-12 rounded-2xl bg-gradient-to-br from-blue-900 to-cyan-900 text-center">
                            <CloudArrowUpIcon className="w-16 h-16 text-white mx-auto mb-6" />
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                                Ready to Transform Your Procurement?
                            </h2>
                            <p className="text-blue-200 mb-8 text-lg max-w-2xl mx-auto">
                                Join leading enterprises who trust us with their material supply chain
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => navigate("/quotation")}
                                    className="px-8 py-4 rounded-xl bg-white text-blue-900 font-bold hover:shadow-2xl hover:scale-[1.02] transition-all"
                                >
                                    Get Enterprise Quote
                                </button>
                                <button className="px-8 py-4 rounded-xl border-2 border-white text-white font-bold hover:bg-white/10 transition-all">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}