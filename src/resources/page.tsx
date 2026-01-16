"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    BookOpenIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    VideoCameraIcon,
    ChartBarIcon,
    CalendarIcon,
    UserGroupIcon,
    LightBulbIcon,
    ClipboardDocumentCheckIcon,
    ArrowDownTrayIcon,
    PlayIcon,
    ChevronRightIcon,
    BuildingLibraryIcon,
    ArrowLeftIcon,
    ArrowDownTrayIcon as DownloadIcon,
    ChartBarIcon as TrendingUpIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function ResourcesPage() {
    const [activeCategory, setActiveCategory] = useState("all");

    const categories = [
        { id: "all", name: "All Resources", icon: BookOpenIcon, color: "blue", count: 48 },
        { id: "guides", name: "Technical Guides", icon: DocumentTextIcon, color: "emerald", count: 15 },
        { id: "videos", name: "Video Tutorials", icon: VideoCameraIcon, color: "purple", count: 12 },
        { id: "whitepapers", name: "White Papers", icon: AcademicCapIcon, color: "amber", count: 8 },
        { id: "templates", name: "Templates", icon: ClipboardDocumentCheckIcon, color: "rose", count: 10 },
        { id: "case-studies", name: "Case Studies", icon: ChartBarIcon, color: "cyan", count: 3 }
    ];

    const resources = [
        {
            id: 1,
            title: "Ultimate Banner Material Selection Guide",
            description: "Comprehensive guide to selecting the right banner material for different environments and applications.",
            category: "guides",
            type: "PDF",
            pages: 42,
            downloadCount: 1247,
            icon: DocumentTextIcon,
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            id: 2,
            title: "Installation Masterclass: Corex Boards",
            description: "Step-by-step video tutorial on professional installation techniques for Corex boards.",
            category: "videos",
            type: "Video",
            duration: "18:45",
            views: 892,
            icon: VideoCameraIcon,
            gradient: "from-purple-500 to-pink-500"
        },
        {
            id: 3,
            title: "Enterprise Procurement Best Practices",
            description: "Research paper on optimizing enterprise procurement processes for industrial materials.",
            category: "whitepapers",
            type: "Whitepaper",
            pages: 36,
            downloadCount: 567,
            icon: AcademicCapIcon,
            gradient: "from-amber-500 to-orange-500"
        },
        {
            id: 4,
            title: "Signage Project Planning Template",
            description: "Excel template for planning and managing large-scale signage projects with timelines and budgets.",
            category: "templates",
            type: "Template",
            format: "Excel",
            downloadCount: 321,
            icon: ClipboardDocumentCheckIcon,
            gradient: "from-rose-500 to-pink-500"
        },
        {
            id: 5,
            title: "Global Advertisers Corp Success Story",
            description: "Case study on how we helped a multinational corporation optimize their material procurement.",
            category: "case-studies",
            type: "Case Study",
            pages: 24,
            downloadCount: 789,
            icon: ChartBarIcon,
            gradient: "from-cyan-500 to-blue-500"
        },
        {
            id: 6,
            title: "UV Printing Materials Guide",
            description: "Complete guide to materials suitable for UV printing with compatibility charts and settings.",
            category: "guides",
            type: "PDF",
            pages: 28,
            downloadCount: 934,
            icon: DocumentTextIcon,
            gradient: "from-emerald-500 to-teal-500"
        },
        {
            id: 7,
            title: "Large Format Installation Techniques",
            description: "Advanced video series on professional installation techniques for large format materials.",
            category: "videos",
            type: "Video Series",
            episodes: 5,
            views: 1567,
            icon: VideoCameraIcon,
            gradient: "from-indigo-500 to-purple-500"
        },
        {
            id: 8,
            title: "Sustainability in Industrial Materials",
            description: "Research paper on sustainable practices and materials in the industrial signage sector.",
            category: "whitepapers",
            type: "Whitepaper",
            pages: 45,
            downloadCount: 432,
            icon: AcademicCapIcon,
            gradient: "from-orange-500 to-amber-500"
        }
    ];

    const upcomingWebinars = [
        {
            title: "Advanced Material Selection Workshop",
            date: "2024-03-15",
            time: "2:00 PM EAT",
            speaker: "Dr. Sarah Chen",
            role: "Chief Materials Scientist",
            seats: 45
        },
        {
            title: "Enterprise Procurement Strategies",
            date: "2024-03-22",
            time: "10:00 AM EAT",
            speaker: "James Omondi",
            role: "Enterprise Solutions Director",
            seats: 32
        },
        {
            title: "Sustainable Materials Forum",
            date: "2024-04-05",
            time: "3:30 PM EAT",
            speaker: "Maria Rodriguez",
            role: "Sustainability Officer",
            seats: 28
        }
    ];

    const filteredResources = activeCategory === "all"
        ? resources
        : resources.filter(r => r.category === activeCategory);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 overflow-hidden relative">
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
                    className="absolute bottom-1/4 -right-20 w-[800px] h-[800px] bg-gradient-to-tr from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl"
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
                <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
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
                                                Almon<span className="text-blue-600 dark:text-blue-400">Products</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                ENTERPRISE RESOURCES
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Link to="/">
                                    <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
                                        <ArrowLeftIcon className="w-4 h-4" />
                                        <span>Back to Home</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="pt-16 pb-32">
                    <div className="max-w-8xl mx-auto px-6 lg:px-8">
                        {/* Hero Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="mb-16"
                        >
                            <div className="relative rounded-3xl overflow-hidden">
                                {/* Gradient Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-500" />

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
                                            <BookOpenIcon className="w-4 h-4 text-white mr-2" />
                                            <span className="text-sm font-semibold text-white">
                                                ENTERPRISE KNOWLEDGE BASE
                                            </span>
                                        </div>

                                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                                            Enterprise <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-white">Resources</span>
                                        </h1>

                                        <p className="text-xl text-purple-100 mb-8 max-w-3xl leading-relaxed">
                                            Comprehensive collection of technical guides, industry insights, and professional tools
                                            to optimize your material procurement and project execution.
                                        </p>

                                        <div className="flex items-center space-x-6 text-sm text-blue-200">
                                            <div className="flex items-center space-x-2">
                                                <DocumentTextIcon className="w-4 h-4" />
                                                <span>{resources.length} Resources Available</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-blue-300" />
                                            <div className="flex items-center space-x-2">
                                                <DownloadIcon className="w-4 h-4" />
                                                <span>5,000+ Downloads Monthly</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-blue-300" />
                                            <div className="flex items-center space-x-2">
                                                <UserGroupIcon className="w-4 h-4" />
                                                <span>Premium Enterprise Access</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Categories Filter */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-12"
                        >
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50">
                                <div className="flex flex-wrap gap-3">
                                    {categories.map((category) => {
                                        const Icon = category.icon;
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => setActiveCategory(category.id)}
                                                className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 ${activeCategory === category.id
                                                    ? `bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 text-white shadow-lg`
                                                    : "bg-gradient-to-br from-gray-100 to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 hover:shadow-lg"
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-semibold">{category.name}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${activeCategory === category.id
                                                    ? "bg-white/20"
                                                    : `bg-${category.color}-100 text-${category.color}-700 dark:bg-${category.color}-900/30 dark:text-${category.color}-300`
                                                    }`}>
                                                    {category.count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid lg:grid-cols-3 gap-12">
                            {/* Main Resources Grid */}
                            <div className="lg:col-span-2">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                        Featured Resources
                                    </h2>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {filteredResources.map((resource, index) => {
                                            const Icon = resource.icon;
                                            return (
                                                <motion.div
                                                    key={resource.id}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                    className="group"
                                                >
                                                    <div className="relative h-full">
                                                        {/* Decorative Background Effect */}
                                                        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                                                            style={{
                                                                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                                                                '--tw-gradient-from': resource.gradient.split(' ')[1],
                                                                '--tw-gradient-to': resource.gradient.split(' ')[3],
                                                            } as React.CSSProperties}
                                                        />

                                                        <div className="relative bg-gradient-to-br from-white to-white/80 dark:from-gray-900 dark:to-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-4xl transition-all duration-500 h-full">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.gradient} p-0.5`}>
                                                                    <div className="w-full h-full rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center">
                                                                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                                    </div>
                                                                </div>
                                                                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50">
                                                                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                                        {resource.type}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                {resource.title}
                                                            </h3>

                                                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                                                                {resource.description}
                                                            </p>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                                    {'pages' in resource && (
                                                                        <div className="flex items-center space-x-1">
                                                                            <DocumentTextIcon className="w-4 h-4" />
                                                                            <span>{resource.pages} pages</span>
                                                                        </div>
                                                                    )}
                                                                    {'duration' in resource && (
                                                                        <div className="flex items-center space-x-1">
                                                                            <PlayIcon className="w-4 h-4" />
                                                                            <span>{resource.duration}</span>
                                                                        </div>
                                                                    )}
                                                                    {'downloadCount' in resource && (
                                                                        <div className="flex items-center space-x-1">
                                                                            <DownloadIcon className="w-4 h-4" />
                                                                            <span>{resource.downloadCount?.toLocaleString() || 0} downloads</span>
                                                                        </div>
                                                                    )}
                                                                    {'views' in resource && (
                                                                        <div className="flex items-center space-x-1">
                                                                            <VideoCameraIcon className="w-4 h-4" />
                                                                            <span>{resource.views?.toLocaleString() || 0} views</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <button className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold hover:space-x-3 transition-all group">
                                                                    <span>View Details</span>
                                                                    <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - Upcoming Webinars & Quick Links */}
                            <div className="space-y-8">
                                {/* Upcoming Webinars */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50"
                                >
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                                            <CalendarIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                Upcoming Webinars
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Live professional sessions
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {upcomingWebinars.map((webinar, index) => (
                                            <div
                                                key={index}
                                                className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {webinar.title}
                                                    </h4>
                                                    <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                                        {webinar.seats} seats
                                                    </span>
                                                </div>

                                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center space-x-2">
                                                        <CalendarIcon className="w-4 h-4" />
                                                        <span>{new Date(webinar.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <ClockIcon className="w-4 h-4" />
                                                        <span>{webinar.time}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <UserGroupIcon className="w-4 h-4" />
                                                        <span>{webinar.speaker} • {webinar.role}</span>
                                                    </div>
                                                </div>

                                                <button className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all">
                                                    Register Now
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Quick Access */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-xl border border-purple-200/50 dark:border-purple-700/50"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                                        Quick Access
                                    </h3>

                                    <div className="space-y-3">
                                        {[
                                            { icon: ShieldCheckIcon, label: "Technical Specifications", to: "/resources?category=guides", color: "blue" },
                                            { icon: TrendingUpIcon, label: "Industry Reports", to: "/resources?category=whitepapers", color: "emerald" },
                                            { icon: LightBulbIcon, label: "Best Practices", to: "/resources?category=guides", color: "amber" },
                                            { icon: ArrowDownTrayIcon, label: "Templates Library", to: "/resources?category=templates", color: "rose" }
                                        ].map((item, index) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={index}
                                                    to={item.to}
                                                    className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all group"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center`}>
                                                            <Icon className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                {/* Premium Access Banner */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 text-white"
                                >
                                    <div className="text-center">
                                        <AcademicCapIcon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold mb-3">Enterprise Premium</h3>
                                        <p className="text-gray-300 mb-6 text-sm">
                                            Unlock unlimited access to all resources, exclusive webinars, and priority support.
                                        </p>
                                        <Link to="/enterprise">
                                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:shadow-xl hover:scale-[1.02] transition-all">
                                                Upgrade to Premium
                                            </button>
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Resource Statistics */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-20"
                        >
                            <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-2xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                                    Resource Statistics
                                </h3>

                                <div className="grid md:grid-cols-4 gap-6">
                                    {[
                                        { icon: DocumentTextIcon, label: "Total Resources", value: "48+", color: "blue" },
                                        { icon: DownloadIcon, label: "Monthly Downloads", value: "5.2K", color: "emerald" },
                                        { icon: UserGroupIcon, label: "Active Users", value: "2.8K", color: "purple" },
                                        { icon: VideoCameraIcon, label: "Video Hours", value: "38", color: "amber" }
                                    ].map((stat, index) => {
                                        const Icon = stat.icon;
                                        return (
                                            <div key={index} className="text-center">
                                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 mx-auto mb-4 flex items-center justify-center`}>
                                                    <Icon className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                                    {stat.value}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {stat.label}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </main>
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