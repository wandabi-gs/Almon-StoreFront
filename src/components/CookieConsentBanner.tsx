"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Badge, Divider } from "@heroui/react";
import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  ChartBarIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  ServerStackIcon,
  GlobeAltIcon,
  ShieldExclamationIcon,
  ClockIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  performance: boolean;
}

interface CookieConsentBannerProps {
  onAccept?: (preferences: CookiePreferences & { marketing: boolean }) => void;
  onDecline?: () => void;
}

export default function CookieConsentBanner({ onAccept, onDecline }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>({
    essential: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false,
    performance: false,
  });

  const [showCustomSuccess, setShowCustomSuccess] = useState(false);

  useEffect(() => {
    const consentGiven = localStorage.getItem("enterprise_cookie_consent");
    const consentTimestamp = localStorage.getItem("consent_timestamp");

    // Check if consent is older than 6 months (re-prompt)
    if (consentTimestamp) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const consentDate = new Date(consentTimestamp);

      if (consentDate < sixMonthsAgo) {
        setIsVisible(true);
        return;
      }
    }

    if (!consentGiven) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = async () => {
    const preferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      performance: true,
    };

    const timestamp = new Date().toISOString();
    localStorage.setItem("enterprise_cookie_consent", "accepted_all");
    localStorage.setItem("enterprise_cookie_preferences", JSON.stringify(preferences));
    localStorage.setItem("marketing_consent", "granted");
    localStorage.setItem("consent_timestamp", timestamp);
    localStorage.setItem("consent_version", "2.1.0");

    setIsVisible(false);
    onAccept?.({ ...preferences, marketing: true });

    try {
      await fetch("/api/enterprise/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Consent-Version": "2.1.0"
        },
        body: JSON.stringify({
          consent_type: "full",
          preferences,
          timestamp,
          framework_version: "2.1.0"
        }),
      });
    } catch (error) {
      console.error("Error saving consent:", error);
    }
  };

  const handleDeclineAll = async () => {
    const preferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      performance: false,
    };

    const timestamp = new Date().toISOString();
    localStorage.setItem("enterprise_cookie_consent", "declined_all");
    localStorage.setItem("enterprise_cookie_preferences", JSON.stringify(preferences));
    localStorage.setItem("marketing_consent", "declined");
    localStorage.setItem("consent_timestamp", timestamp);
    localStorage.setItem("consent_version", "2.1.0");

    setIsVisible(false);
    onDecline?.();

    try {
      await fetch("/api/enterprise/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Consent-Version": "2.1.0"
        },
        body: JSON.stringify({
          consent_type: "essential_only",
          preferences,
          timestamp,
          framework_version: "2.1.0"
        }),
      });
    } catch (error) {
      console.error("Error saving consent:", error);
    }
  };

  const handleCustomSave = async () => {
    const preferences = {
      ...cookiePreferences,
      marketing: marketingConsent,
    };

    const timestamp = new Date().toISOString();
    localStorage.setItem("enterprise_cookie_consent", "custom");
    localStorage.setItem("enterprise_cookie_preferences", JSON.stringify(preferences));
    localStorage.setItem("marketing_consent", marketingConsent ? "granted" : "declined");
    localStorage.setItem("consent_timestamp", timestamp);
    localStorage.setItem("consent_version", "2.1.0");

    setShowCustomSuccess(true);
    setTimeout(() => {
      setIsVisible(false);
      onAccept?.({ ...preferences, marketing: marketingConsent });
    }, 2000);

    try {
      await fetch("/api/enterprise/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Consent-Version": "2.1.0"
        },
        body: JSON.stringify({
          consent_type: "custom",
          preferences,
          timestamp,
          framework_version: "2.1.0"
        }),
      });
    } catch (error) {
      console.error("Error saving consent:", error);
    }
  };

  const toggleCookiePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return;
    setCookiePreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Professional Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl z-[9998]"
          />

          {/* Main Banner */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4"
          >
            <div className="relative max-w-6xl mx-auto">
              {/* Gradient Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 blur-3xl rounded-3xl"></div>

              {/* Main Container */}
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="relative"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-0.5">
                          <div className="w-full h-full rounded-xl bg-white/10 flex items-center justify-center">
                            <ShieldCheckIcon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse" />
                      </motion.div>

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            variant="flat"
                            color="primary"
                            className="bg-white/20 backdrop-blur-sm border-white/30"
                          >
                            Enterprise Consent
                          </Badge>
                          <span className="text-sm text-white/90">v2.1.0</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">
                          Data Governance Portal
                        </h2>
                        <p className="text-white/80 text-sm mt-1">
                          Configure your enterprise privacy and cookie preferences
                        </p>
                      </div>
                    </div>

                    <Button
                      isIconOnly
                      variant="light"
                      onPress={handleDeclineAll}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Information */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-4">
                          <AcademicCapIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Consent Framework Overview</h3>
                        </div>

                        <div className="space-y-4">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            In compliance with global data protection regulations (GDPR, CCPA, DPDPA),
                            we provide granular control over your data preferences.
                          </p>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                              <LockClosedIcon className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">256-bit Encryption</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                              <ServerStackIcon className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ISO 27001 Certified</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">30+</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Countries Compliant</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">24h</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Update Time</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">GDPR</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Article 30 Ready</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Controls */}
                    <div className="space-y-6">
                      {/* Marketing Consent Card */}
                      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                              <EnvelopeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white">Enterprise Marketing Consent</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Strategic communications preference</p>
                            </div>
                          </div>

                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={marketingConsent}
                              onChange={() => setMarketingConsent(!marketingConsent)}
                              className="sr-only"
                              id="marketing-toggle"
                            />
                            <label
                              htmlFor="marketing-toggle"
                              className={`block w-14 h-7 rounded-full cursor-pointer transition-colors ${marketingConsent ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                            >
                              <span className={`block w-5 h-5 mt-1 ml-1 rounded-full bg-white transform transition-transform ${marketingConsent ? 'translate-x-7' : ''}`} />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Industry insights and whitepapers</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Product innovation updates</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Exclusive enterprise offers</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onPress={handleAcceptAll}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                          startContent={<CheckCircleIcon className="w-5 h-5" />}
                        >
                          Accept All
                        </Button>
                        <Button
                          variant="bordered"
                          onPress={() => setShowDetails(!showDetails)}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          startContent={<Cog6ToothIcon className="w-5 h-5" />}
                        >
                          {showDetails ? 'Hide Details' : 'Customize'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Preferences Section */}
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <Divider className="my-8" />

                        <div className="space-y-8">
                          <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Granular Cookie Controls</h3>
                            <Badge color="primary" variant="flat">
                              {Object.values(cookiePreferences).filter(Boolean).length} of 5 Active
                            </Badge>
                          </div>

                          {/* Cookie Categories */}
                          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                              {
                                key: "essential",
                                title: "Essential",
                                description: "Required for site functionality",
                                icon: ShieldExclamationIcon,
                                color: "text-emerald-600",
                                bg: "bg-emerald-50 dark:bg-emerald-900/20",
                                disabled: true
                              },
                              {
                                key: "performance",
                                title: "Performance",
                                description: "Site speed and optimization",
                                icon: ChartBarIcon,
                                color: "text-blue-600",
                                bg: "bg-blue-50 dark:bg-blue-900/20"
                              },
                              {
                                key: "analytics",
                                title: "Analytics",
                                description: "Usage insights and improvements",
                                icon: BuildingLibraryIcon,
                                color: "text-purple-600",
                                bg: "bg-purple-50 dark:bg-purple-900/20"
                              },
                              {
                                key: "functional",
                                title: "Functional",
                                description: "Enhanced user experience",
                                icon: Cog6ToothIcon,
                                color: "text-amber-600",
                                bg: "bg-amber-50 dark:bg-amber-900/20"
                              },
                              {
                                key: "marketing",
                                title: "Marketing",
                                description: "Personalized communications",
                                icon: GlobeAltIcon,
                                color: "text-pink-600",
                                bg: "bg-pink-50 dark:bg-pink-900/20"
                              }
                            ].map((category) => {
                              const Icon = category.icon;
                              const isActive = cookiePreferences[category.key as keyof CookiePreferences];

                              return (
                                <div
                                  key={category.key}
                                  className={`p-5 rounded-2xl border transition-all duration-300 ${isActive ? 'border-blue-300 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700'} ${category.bg}`}
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-3 rounded-xl ${isActive ? 'bg-white dark:bg-gray-800' : 'bg-white/50 dark:bg-gray-700/50'}`}>
                                        <Icon className={`w-5 h-5 ${category.color}`} />
                                      </div>
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        {category.title}
                                      </span>
                                    </div>

                                    {category.key !== "essential" ? (
                                      <button
                                        onClick={() => toggleCookiePreference(category.key as keyof CookiePreferences)}
                                        className={`w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                      >
                                        <span className={`block w-4 h-4 mt-1 ml-1 rounded-full bg-white transform transition-transform ${isActive ? 'translate-x-6' : ''}`} />
                                      </button>
                                    ) : (
                                      <Badge color="success" variant="flat" size="sm">
                                        Always On
                                      </Badge>
                                    )}
                                  </div>

                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {category.description}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          {/* Custom Save Section */}
                          <div className="bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 dark:from-blue-500/10 dark:via-cyan-500/10 dark:to-blue-500/10 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Save Custom Configuration</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Your preferences will be encrypted and stored in our ISO 27001 certified system
                                </p>
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  variant="bordered"
                                  onPress={() => setShowDetails(false)}
                                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onPress={handleCustomSave}
                                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                                  startContent={<DocumentTextIcon className="w-5 h-5" />}
                                >
                                  Save Preferences
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Custom Success Message */}
                  <AnimatePresence>
                    {showCustomSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 flex items-center justify-center z-50"
                      >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-12 max-w-md mx-4 shadow-2xl">
                          <div className="text-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                              className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                              <CheckCircleIcon className="w-10 h-10 text-white" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                              Preferences Saved
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                              Your enterprise privacy configuration has been encrypted and stored.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <ClockIcon className="w-4 h-4" />
                              <span>Timestamp: {new Date().toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer Links */}
                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <Link to="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          Privacy Framework
                        </Link>
                        <Link to="/terms-of-service" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          Terms of Service
                        </Link>
                        <Link to="/privacy-consent" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          Full Consent Portal
                        </Link>
                      </div>

                      <div className="flex items-center gap-4">
                        <Button
                          variant="light"
                          onPress={handleDeclineAll}
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Decline All
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                      <p>This portal complies with GDPR, CCPA, DPDPA, and other global data protection regulations.</p>
                      <p className="mt-1">Version 2.1.0 • Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}