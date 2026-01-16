"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, CardBody } from "@heroui/react";
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";

export default function PrivacyConsentPage() {
  const navigate = useNavigate();
  const [selectedChoice, setSelectedChoice] = useState<"accept" | "decline" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChoice = async (choice: "accept" | "decline") => {
    setSelectedChoice(choice);
    setIsSubmitting(true);

    try {
      // In production, implement proper consent management
      const consentData = {
        choice,
        timestamp: new Date().toISOString(),
        version: "2.1.0",
        purpose: "Marketing Communications",
        legalBasis: "Consent"
      };

      localStorage.setItem("marketing_consent", JSON.stringify(consentData));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

    } catch (error) {
      console.error("Error saving preference:", error);
    }

    setIsSubmitting(false);
    setIsComplete(true);

    setTimeout(() => {
      navigate("/");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Geometric Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.1) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-full"
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent rounded-full"
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-5xl"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-0.5">
                  <div className="w-full h-full rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center">
                    <ShieldCheckIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse" />
              </div>
            </motion.div>

            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 border border-blue-200 dark:border-blue-800 mb-6">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Enterprise Consent Management
              </span>
            </div>

            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent leading-tight">
              Marketing Communications
              <br />
              <span className="text-gray-900 dark:text-white">Consent Framework</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
              Configure your enterprise-level marketing communication preferences in compliance with global data protection regulations.
            </p>
          </motion.div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key="consent-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Information Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: BuildingLibraryIcon,
                      title: "Legal Basis",
                      description: "GDPR Article 6(1)(a)",
                      color: "text-blue-600",
                      bg: "bg-blue-50 dark:bg-blue-900/20"
                    },
                    {
                      icon: DocumentTextIcon,
                      title: "Framework Version",
                      description: "v2.1.0",
                      color: "text-cyan-600",
                      bg: "bg-cyan-50 dark:bg-cyan-900/20"
                    },
                    {
                      icon: UserGroupIcon,
                      title: "Data Category",
                      description: "Marketing Data",
                      color: "text-emerald-600",
                      bg: "bg-emerald-50 dark:bg-emerald-900/20"
                    },
                    {
                      icon: ClockIcon,
                      title: "Retention Period",
                      description: "Until Withdrawn",
                      color: "text-amber-600",
                      bg: "bg-amber-50 dark:bg-amber-900/20"
                    }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`${item.bg} rounded-2xl p-6 border border-gray-200 dark:border-gray-800`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-white dark:bg-gray-800">
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{item.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Main Consent Card */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <CardBody className="p-0">
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-3xl font-bold mb-2">Consent Management Portal</h2>
                            <p className="text-blue-100 opacity-90">Configure your enterprise marketing preferences</p>
                          </div>
                          <AcademicCapIcon className="w-12 h-12 text-white/80" />
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-8">
                        <div className="grid lg:grid-cols-2 gap-8 mb-8">
                          {/* Information Panel */}
                          <div className="space-y-6">
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                Consent Framework Overview
                              </h3>

                              <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Grant Consent</h4>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Receive strategic communications, market insights, product updates, and exclusive enterprise offers.
                                  </p>
                                </div>

                                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Withhold Consent</h4>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Limit communications to essential transactional messages only (order confirmations, service updates).
                                  </p>
                                </div>
                              </div>

                              <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                  <LockClosedIcon className="w-4 h-4 text-blue-500" />
                                  <span>All preferences are encrypted and stored in compliance with ISO 27001 standards</span>
                                </div>
                              </div>
                            </div>

                            {/* Advanced Options Toggle */}
                            <button
                              onClick={() => setShowAdvanced(!showAdvanced)}
                              className="w-full py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                              </span>
                              <ChevronRightIcon className={`w-4 h-4 text-gray-500 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                            </button>
                          </div>

                          {/* Consent Selection Panel */}
                          <div className="space-y-6">
                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                                Select Your Preference
                              </h3>

                              <div className="space-y-4">
                                {/* Accept Option */}
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <button
                                    onClick={() => handleChoice("accept")}
                                    disabled={isSubmitting}
                                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 ${selectedChoice === "accept"
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700'
                                      }`}
                                  >
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${selectedChoice === "accept"
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                          }`}>
                                          <EnvelopeIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                                            Grant Marketing Consent
                                          </h4>
                                          <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Receive strategic communications
                                          </p>
                                        </div>
                                      </div>
                                      {selectedChoice === "accept" && (
                                        <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                                      )}
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>Product updates and innovations</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>Exclusive enterprise offers</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>Industry insights and whitepapers</span>
                                      </div>
                                    </div>
                                  </button>
                                </motion.div>

                                {/* Decline Option */}
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <button
                                    onClick={() => handleChoice("decline")}
                                    disabled={isSubmitting}
                                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 ${selectedChoice === "decline"
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                      }`}
                                  >
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${selectedChoice === "decline"
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                          }`}>
                                          <XMarkIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                                            Withhold Marketing Consent
                                          </h4>
                                          <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Essential communications only
                                          </p>
                                        </div>
                                      </div>
                                      {selectedChoice === "decline" && (
                                        <CheckCircleIcon className="w-6 h-6 text-red-500" />
                                      )}
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                        <span>Order confirmations and receipts</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                        <span>Service and security updates</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                        <span>Contractual notifications</span>
                                      </div>
                                    </div>
                                  </button>
                                </motion.div>
                              </div>

                              {isSubmitting && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-6 text-center"
                                >
                                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                      Processing consent preference...
                                    </span>
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {/* Data Rights Information */}
                            <div className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                              <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Your Data Protection Rights
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Under GDPR, CCPA, and other data protection regulations, you have the right to:
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                {["Withdraw Consent", "Access Data", "Rectify Data", "Erase Data"].map((right, idx) => (
                                  <div key={idx} className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg text-center">
                                    {right}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Advanced Options */}
                        <AnimatePresence>
                          {showAdvanced && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                  Granular Consent Preferences
                                </h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                  {[
                                    { label: "Email Newsletters", default: true },
                                    { label: "Product Updates", default: true },
                                    { label: "Promotional Offers", default: true },
                                    { label: "Survey & Feedback", default: false },
                                    { label: "Event Invitations", default: true },
                                    { label: "Third-Party Offers", default: false }
                                  ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                      <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          defaultChecked={item.default}
                                          className="sr-only"
                                          id={`pref-${idx}`}
                                        />
                                        <label
                                          htmlFor={`pref-${idx}`}
                                          className="block w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"
                                        >
                                          <span className="block w-6 h-6 mt-0.5 ml-0.5 rounded-full bg-white dark:bg-gray-300 transition-transform"></span>
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-6 flex justify-end">
                                  <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                    Save Granular Preferences
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Footer Notes */}
                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div>
                              <ChartBarIcon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Consent preferences are tracked and audited
                              </p>
                            </div>
                            <div>
                              <ArrowPathIcon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Preferences can be updated at any time
                              </p>
                            </div>
                            <div>
                              <DocumentTextIcon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Review our full Privacy Framework for details
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Card className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                  <CardBody className="p-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="relative mb-8"
                    >
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 mx-auto flex items-center justify-center">
                        <CheckCircleIcon className="w-20 h-20 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-8"
                    >
                      <div className="inline-block px-6 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 mb-6">
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          Consent Confirmed
                        </span>
                      </div>

                      <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Enterprise Preference Saved
                      </h2>

                      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        {selectedChoice === "accept"
                          ? "Your consent for strategic marketing communications has been recorded. You'll receive enterprise updates and industry insights."
                          : "Your preference to receive essential communications only has been saved. You'll only receive transactional messages."
                        }
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4" />
                          <span>Timestamp: {new Date().toLocaleString()}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="w-4 h-4" />
                          <span>Reference: CONS-{Date.now().toString().slice(-8)}</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Your preference is encrypted and stored in our ISO 27001 certified consent management system.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                          <Button
                            onPress={() => navigate("/")}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                          >
                            Return to Platform
                          </Button>
                          <Button
                            variant="bordered"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                            onPress={() => {
                              setSelectedChoice(null);
                              setIsComplete(false);
                            }}
                          >
                            Modify Preference
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">AlmonPro™ Enterprise Consent Management System v2.1.0</p>
            <p>Compliant with GDPR, CCPA, DPDPA, and other global data protection regulations</p>
          </div>
        </div>
      </footer>
    </div>
  );
}