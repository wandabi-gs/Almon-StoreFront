"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import {
  DocumentTextIcon,
  ScaleIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";

export default function TermsOfServicePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("acceptance");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: CheckCircleIcon,
      gradient: "from-emerald-500 to-cyan-500",
      color: "emerald",
      content: `Welcome to Almon Products Ltd. By accessing or using our website, services, or making a purchase, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.`,
      details: [
        "Agreement to legally binding terms upon accessing our platform",
        "Automatic acceptance through continued use of services",
        "Right to modify terms with notice to users",
        "Responsibility to review terms periodically"
      ]
    },
    {
      id: "services",
      title: "2. Description of Services",
      icon: ShoppingBagIcon,
      gradient: "from-blue-500 to-purple-500",
      color: "blue",
      content: `Almon Products Ltd provides an enterprise-grade e-commerce platform for premium industrial materials, signage products, and printing solutions. Our services include:`,
      details: [
        "Online product catalog and ordering system",
        "Bulk order management for enterprises",
        "Custom quotation and procurement services",
        "Delivery and logistics coordination",
        "Enterprise account management"
      ]
    },
    {
      id: "account",
      title: "3. User Accounts & Registration",
      icon: UserIcon,
      gradient: "from-indigo-500 to-violet-500",
      color: "indigo",
      content: `To access certain features, you may need to register for an account. You are responsible for maintaining the confidentiality of your account and password.`,
      details: [
        "Provide accurate and complete registration information",
        "Immediately notify us of unauthorized account use",
        "Maintain security of your credentials",
        "Accept responsibility for all activities under your account",
        "Minimum age requirement: 18 years"
      ]
    },
    {
      id: "orders",
      title: "4. Orders & Payment Terms",
      icon: CreditCardIcon,
      gradient: "from-amber-500 to-orange-500",
      color: "amber",
      content: `All orders placed through our platform constitute an offer to purchase products subject to these terms. We reserve the right to refuse or cancel any order.`,
      details: [
        "Order confirmation via email constitutes acceptance",
        "All prices in Kenyan Shillings (KES)",
        "Payment required before order processing",
        "Accepted payment methods: MPesa, Credit Cards, Bank Transfer",
        "Custom pricing available for enterprise clients"
      ]
    },
    {
      id: "shipping",
      title: "5. Shipping & Delivery",
      icon: TruckIcon,
      gradient: "from-teal-500 to-emerald-500",
      color: "teal",
      content: `Delivery services are available within specified regions in Kenya. Delivery timelines vary based on location and product availability.`,
      details: [
        "Delivery areas as specified on our website",
        "Estimated delivery times provided at checkout",
        "Risk transfer upon delivery to carrier",
        "Delivery fees calculated based on location",
        "Signature may be required for delivery"
      ]
    },
    {
      id: "returns",
      title: "6. Returns & Refunds",
      icon: XCircleIcon,
      gradient: "from-rose-500 to-pink-500",
      color: "rose",
      content: `Our return policy is designed to ensure customer satisfaction while maintaining business efficiency.`,
      details: [
        "7-day return window for standard products",
        "Products must be in original condition and packaging",
        "Custom orders are non-returnable",
        "Refunds processed within 14 business days",
        "Return shipping at customer's expense"
      ]
    },
    {
      id: "intellectual-property",
      title: "7. Intellectual Property",
      icon: ShieldCheckIcon,
      gradient: "from-violet-500 to-purple-500",
      color: "violet",
      content: `All content, trademarks, and proprietary information on our platform are protected by intellectual property laws.`,
      details: [
        "Content ownership retained by Almon Products Ltd",
        "Limited license for personal, non-commercial use",
        "No unauthorized reproduction or distribution",
        "Trademark protection for our branding",
        "Reporting mechanism for infringement claims"
      ]
    },
    {
      id: "user-conduct",
      title: "8. Acceptable Use Policy",
      icon: ExclamationTriangleIcon,
      gradient: "from-orange-500 to-red-500",
      color: "orange",
      content: `Users must adhere to acceptable use standards when interacting with our platform and services.`,
      details: [
        "No fraudulent or deceptive activities",
        "Compliance with all applicable laws",
        "Respect for other users and our team",
        "No unauthorized access or interference",
        "Professional conduct expected at all times"
      ]
    },
    {
      id: "liability",
      title: "9. Limitations of Liability",
      icon: ScaleIcon,
      gradient: "from-slate-600 to-gray-600",
      color: "slate",
      content: `To the maximum extent permitted by law, our liability is limited as described in these terms.`,
      details: [
        "Services provided 'as is' without warranties",
        "No liability for indirect or consequential damages",
        "Maximum liability limited to purchase price",
        "Force majeure clause for unforeseen events",
        "Jurisdiction-specific limitations apply"
      ]
    },
    {
      id: "governing-law",
      title: "10. Governing Law & Disputes",
      icon: GlobeAltIcon,
      gradient: "from-cyan-500 to-blue-500",
      color: "cyan",
      content: `These terms are governed by Kenyan law. Disputes will be resolved through the following mechanisms:`,
      details: [
        "Governing law: Laws of Kenya",
        "Primary dispute resolution: Negotiation",
        "Secondary mechanism: Mediation",
        "Tertiary option: Court proceedings in Nairobi",
        "Arbitration clauses for enterprise contracts"
      ]
    }
  ];

  const contactInfo = {
    company: "Almon Products Ltd",
    email: "almonltd80@gmail.com",
    phone: "+254 711 791 981",
    address: "Kilome Road, Nairobi CBD, Kenya",
    businessHours: "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM"
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 overflow-hidden relative">
      {/* Ultra HD Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 -left-20 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Geometric Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,82,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,82,212,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22256%22 height=%22256%22 filter=%22url(%23noise)%22 opacity=%220.02%22/%3E%3C/svg%3E')] opacity-5" />
      </div>

      <div className="relative z-10">
        {/* Ultra HD Sticky Header */}
        <motion.header
          style={{ opacity, scale }}
          className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-2xl"
        >
          <div className="max-w-8xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/" className="group">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/30">
                      <div className="w-full h-full rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center">
                        <BuildingLibraryIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                        Almon<span className="text-blue-600 dark:text-blue-400">Pro</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        ENTERPRISE SOLUTIONS
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button
                    variant="light"
                    className="text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 px-6 py-3 rounded-xl"
                    startContent={<ArrowLeftIcon className="w-4 h-4" />}
                  >
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="pt-16 pb-32">
          <div className="max-w-8xl mx-auto px-6 lg:px-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-20"
            >
              <div className="relative rounded-3xl overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500" />

                {/* Grid Overlay */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px'
                  }}
                />

                <div className="relative p-12 lg:p-16">
                  <div className="max-w-4xl">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
                      <LockClosedIcon className="w-4 h-4 text-white mr-2" />
                      <span className="text-sm font-semibold text-white">
                        LEGAL DOCUMENT
                      </span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                      Terms of <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-white">Service</span>
                    </h1>

                    <p className="text-xl text-blue-100 mb-8 max-w-3xl leading-relaxed">
                      Comprehensive legal agreement governing your use of Almon Products Ltd's enterprise platform, services, and products.
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-blue-200">
                      <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-blue-300" />
                      <div className="flex items-center space-x-2">
                        <ScaleIcon className="w-4 h-4" />
                        <span>Legally Binding Agreement</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-12">
              {/* Sidebar - Table of Contents */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="sticky top-32">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                      </div>
                      <span>Table of Contents</span>
                    </h3>

                    <div className="space-y-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${activeSection === section.id
                            ? `bg-gradient-to-r from-${section.color}-50 to-${section.color}-100/50 dark:from-${section.color}-900/30 dark:to-${section.color}-800/30 border-2 border-${section.color}-500/50 shadow-lg`
                            : "hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${section.gradient} flex items-center justify-center`}>
                                <section.icon className="w-4 h-4 text-white" />
                              </div>
                              <span className={`font-medium ${activeSection === section.id ? `text-${section.color}-600 dark:text-${section.color}-400` : "text-gray-700 dark:text-gray-300"}`}>
                                {section.title.split(" ")[0]}
                              </span>
                            </div>
                            <ChevronRightIcon className={`w-4 h-4 ${activeSection === section.id ? `text-${section.color}-500` : "text-gray-400"}`} />
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="space-y-3">
                        <Link
                          to="/privacy-policy"
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            Privacy Policy
                          </span>
                          <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        </Link>
                        <Link
                          to="/cookie-policy"
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            Cookie Policy
                          </span>
                          <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Main Content - Terms Sections */}
              <div className="lg:col-span-3">
                <div className="space-y-8">
                  {sections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                      <motion.div
                        key={section.id}
                        id={section.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="scroll-mt-32"
                      >
                        <div className="group relative">
                          {/* Decorative Background Effect */}
                          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                            style={{
                              background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                              '--tw-gradient-from': section.gradient.split(' ')[1],
                              '--tw-gradient-to': section.gradient.split(' ')[3],
                            } as React.CSSProperties}
                          />

                          <div className="relative bg-gradient-to-br from-white to-white/80 dark:from-gray-900 dark:to-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-4xl transition-all duration-500">
                            {/* Section Header */}
                            <div className="flex items-start justify-between mb-8">
                              <div className="flex items-center space-x-4">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.gradient} p-0.5 shadow-lg`}>
                                  <div className="w-full h-full rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center">
                                    <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                  </div>
                                </div>
                                <div>
                                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 mb-2">
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                      SECTION {index + 1}
                                    </span>
                                  </div>
                                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                                    {section.title}
                                  </h3>
                                </div>
                              </div>
                              <div className="hidden lg:block">
                                <div className="text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50">
                                  <span className={`bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>
                                    Legal Requirement
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-6">
                              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                {section.content}
                              </p>

                              <div className="grid md:grid-cols-2 gap-4">
                                {section.details.map((detail, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`p-4 rounded-xl border bg-gradient-to-br from-${section.color}-50/50 to-${section.color}-100/30 dark:from-${section.color}-900/20 dark:to-${section.color}-800/20 border-${section.color}-200/50 dark:border-${section.color}-700/30`}
                                  >
                                    <div className="flex items-start space-x-3">
                                      <CheckCircleIcon className={`w-5 h-5 text-${section.color}-500 dark:text-${section.color}-400 flex-shrink-0 mt-0.5`} />
                                      <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Section Footer */}
                            <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  This section is legally binding and forms part of your agreement with Almon Products Ltd.
                                </div>
                                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900/50">
                                  <span className="text-gray-600 dark:text-gray-400">Section {index + 1} of {sections.length}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Contact Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-12"
                  >
                    <div className="relative rounded-3xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900" />
                      <div className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)`
                        }}
                      />

                      <div className="relative p-12">
                        <div className="max-w-4xl mx-auto">
                          <div className="text-center mb-10">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
                              <EnvelopeIcon className="w-4 h-4 text-white mr-2" />
                              <span className="text-sm font-semibold text-white">
                                LEGAL CONTACT
                              </span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                              Legal & Compliance Department
                            </h2>
                            <p className="text-xl text-blue-200">
                              For questions regarding these terms or legal matters
                            </p>
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                              <PhoneIcon className="w-8 h-8 text-cyan-300 mb-4" />
                              <div className="text-sm text-blue-200 mb-2">Phone</div>
                              <div className="text-lg font-bold text-white">{contactInfo.phone}</div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                              <EnvelopeIcon className="w-8 h-8 text-cyan-300 mb-4" />
                              <div className="text-sm text-blue-200 mb-2">Email</div>
                              <div className="text-lg font-bold text-white">{contactInfo.email}</div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                              <MapPinIcon className="w-8 h-8 text-cyan-300 mb-4" />
                              <div className="text-sm text-blue-200 mb-2">Address</div>
                              <div className="text-lg font-bold text-white">{contactInfo.company}</div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                              <ClockIcon className="w-8 h-8 text-cyan-300 mb-4" />
                              <div className="text-sm text-blue-200 mb-2">Hours</div>
                              <div className="text-lg font-bold text-white">Mon-Fri: 8AM-6PM</div>
                            </div>
                          </div>

                          <div className="mt-10 text-center">
                            <p className="text-blue-200 mb-6">
                              For urgent legal matters, please contact our compliance team directly
                            </p>
                            <Link to="/contact">
                              <Button
                                className="bg-white text-blue-900 font-bold hover:shadow-xl hover:scale-[1.02] transition-all px-8 py-4 rounded-xl"
                              >
                                Contact Legal Team
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Ultra HD Footer */}
        <footer className="bg-gradient-to-br from-gray-900 to-gray-950 text-white py-16 border-t border-gray-800">
          <div className="max-w-8xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <BuildingLibraryIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Almon Products Ltd</h3>
                    <p className="text-sm text-gray-400">Enterprise Legal</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-6">
                  Providing legally compliant enterprise solutions since 2015. All rights reserved.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                <div className="space-y-3">
                  {['Privacy Policy', 'Cookie Policy', 'Return Policy', 'Shipping Policy'].map((item) => (
                    <Link
                      key={item}
                      to={`/${item.toLowerCase().replace(' ', '-')}`}
                      className="block text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold mb-6">Legal Information</h4>
                <div className="space-y-2 text-gray-400">
                  <p>Company Registration: CPR/2015/12345</p>
                  <p>VAT Number: P051234567X</p>
                  <p>© {new Date().getFullYear()} Almon Products Ltd</p>
                  <p>All Rights Reserved</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
              <p>These Terms of Service constitute a legally binding agreement between you and Almon Products Ltd.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Missing ClockIcon component
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}