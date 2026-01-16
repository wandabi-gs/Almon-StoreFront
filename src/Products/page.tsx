"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    TruckIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    TagIcon,
    ChartBarIcon,
    InformationCircleIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";
import { CartDrawer } from "@/components/CartDrawer";
import { CartButton } from "@/components/CartButton";

interface ProductDetail {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    image: string;
    price: number;
    originalPrice?: number;
    saleType: "roll" | "metre" | "board" | "unit";
    specifications: {
        material: string;
        thickness?: string;
        width?: string;
        weight?: string;
        durability: string;
        uvResistance: boolean;
        waterResistance: boolean;
        applications: string[];
    };
    variants: Array<{
        name: string;
        price: number;
        sku: string;
        stock: number;
    }>;
    features: string[];
    includedItems: string[];
    deliveryInfo: {
        leadTime: string;
        minimumOrder: string;
        bulkDiscount: string;
    };
}

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [cart, setCart] = useState<any[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "specs" | "delivery">("details");

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setProduct({
                id: id || "1",
                name: "Premium Frontlit Banner 440GSM",
                description: "High-quality frontlit banner material for professional printing",
                longDescription: "Our premium 440GSM frontlit banner material is engineered for exceptional print quality and durability. Perfect for outdoor advertising, trade shows, and retail displays. Features advanced UV resistance and weatherproof properties.",
                image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80",
                price: 4500,
                originalPrice: 5200,
                saleType: "roll",
                specifications: {
                    material: "PVC Composite",
                    thickness: "440 GSM",
                    width: "1.5m",
                    weight: "25kg/roll",
                    durability: "12+ months outdoor",
                    uvResistance: true,
                    waterResistance: true,
                    applications: ["Outdoor Advertising", "Trade Shows", "Retail Displays", "Event Branding"]
                },
                variants: [
                    { name: "1.5m x 50m Roll", price: 4500, sku: "FB-1.5-440", stock: 15 },
                    { name: "2.7m x 50m Roll", price: 8200, sku: "FB-2.7-440", stock: 8 },
                    { name: "1.2m x 50m Roll", price: 3800, sku: "FB-1.2-440", stock: 22 }
                ],
                features: [
                    "Premium 440 GSM weight for maximum durability",
                    "Brilliant white background for vibrant colors",
                    "Excellent dimensional stability",
                    "Quick drying for faster turnaround",
                    "Smooth surface for superior print quality"
                ],
                includedItems: [
                    "Roll of banner material",
                    "Quality certification",
                    "Handling guidelines",
                    "Technical specifications sheet"
                ],
                deliveryInfo: {
                    leadTime: "24-48 hours",
                    minimumOrder: "1 roll",
                    bulkDiscount: "15% discount on 10+ rolls"
                }
            });
            setLoading(false);
        }, 800);
    }, [id]);

    const addToCart = () => {
        const variant = product!.variants[selectedVariant];
        setCart([...cart, {
            id: `${product!.id}-${variant.sku}`,
            name: product!.name,
            variant: variant.name,
            price: variant.price,
            quantity,
            image: product!.image
        }]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product not found</h2>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all"
                    >
                        Return to Store
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,82,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,82,212,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/5 via-pink-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-8xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span className="font-semibold">Back to Store</span>
                        </button>
                        <div className="flex items-center space-x-4">
                            <CartButton count={cart.reduce((s, i) => s + i.quantity, 0)} onOpen={() => setDrawerOpen(true)} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-12 pb-32">
                <div className="max-w-8xl mx-auto px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <button onClick={() => navigate("/")} className="hover:text-blue-600 dark:hover:text-blue-400">Home</button>
                            <ChevronRightIcon className="w-4 h-4" />
                            <button onClick={() => navigate("/#products-section")} className="hover:text-blue-600 dark:hover:text-blue-400">Products</button>
                            <ChevronRightIcon className="w-4 h-4" />
                            <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
                        </nav>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 mb-16">
                        {/* Product Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative"
                        >
                            <div className="rounded-3xl overflow-hidden shadow-4xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                            {product.originalPrice && (
                                <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold shadow-2xl">
                                    SAVE {Math.round((1 - product.price / product.originalPrice) * 100)}%
                                </div>
                            )}
                        </motion.div>

                        {/* Product Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div>
                                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-4">
                                    <TagIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        {product.saleType.toUpperCase()} MATERIAL
                                    </span>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                    {product.name}
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                                    {product.description}
                                </p>
                            </div>

                            {/* Pricing */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                            KSh {product.variants[selectedVariant].price.toLocaleString()}
                                        </span>
                                        {product.originalPrice && (
                                            <span className="ml-4 text-lg text-gray-500 dark:text-gray-400 line-through">
                                                KSh {product.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold">
                                        In Stock: {product.variants[selectedVariant].stock}
                                    </div>
                                </div>

                                {/* Variants */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Select Size / Variant
                                    </label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {product.variants.map((variant, index) => (
                                            <button
                                                key={variant.sku}
                                                onClick={() => setSelectedVariant(index)}
                                                className={`p-4 rounded-xl border-2 transition-all ${selectedVariant === index
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {variant.name}
                                                    </span>
                                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                        KSh {variant.price.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    SKU: {variant.sku} • Stock: {variant.stock}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantity & Add to Cart */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="px-6 py-3 font-bold text-gray-900 dark:text-white">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={addToCart}
                                            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            Add to Cart • KSh {(product.variants[selectedVariant].price * quantity).toLocaleString()}
                                        </button>
                                    </div>
                                    <button className="w-full py-4 rounded-xl border-2 border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                                        Request Enterprise Quote
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-12">
                        <div className="flex space-x-1 p-1 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 max-w-2xl">
                            {[
                                { key: "details", label: "Product Details", icon: InformationCircleIcon },
                                { key: "specs", label: "Specifications", icon: ChartBarIcon },
                                { key: "delivery", label: "Delivery & Support", icon: TruckIcon }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`flex-1 py-4 rounded-xl font-semibold transition-all ${activeTab === tab.key
                                        ? "bg-white dark:bg-gray-800 shadow-2xl text-blue-600 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <tab.icon className="w-5 h-5" />
                                        <span>{tab.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="max-w-4xl">
                        {activeTab === "details" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Overview</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                        {product.longDescription}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {product.features.map((feature, index) => (
                                            <div key={index} className="flex items-start space-x-3">
                                                <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What's Included</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {product.includedItems.map((item, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "specs" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="grid md:grid-cols-2 gap-8">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {Array.isArray(value) ? (
                                                    <div className="space-y-2">
                                                        {value.map((item, i) => (
                                                            <div key={i} className="flex items-center space-x-2">
                                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                                <span>{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : typeof value === 'boolean' ? (
                                                    <div className={`inline-flex items-center px-3 py-1 rounded-full ${value ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {value ? 'Yes' : 'No'}
                                                    </div>
                                                ) : (
                                                    value
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "delivery" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50">
                                        <TruckIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Lead Time</h4>
                                        <p className="text-gray-600 dark:text-gray-300">{product.deliveryInfo.leadTime}</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50">
                                        <CurrencyDollarIcon className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bulk Discount</h4>
                                        <p className="text-gray-600 dark:text-gray-300">{product.deliveryInfo.bulkDiscount}</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/50">
                                        <CalendarIcon className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Minimum Order</h4>
                                        <p className="text-gray-600 dark:text-gray-300">{product.deliveryInfo.minimumOrder}</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quality Assurance</h4>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="flex items-start space-x-3">
                                            <ShieldCheckIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">Certified Materials</div>
                                                <div className="text-gray-600 dark:text-gray-300">All materials meet international quality standards</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <ShieldCheckIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">Warranty Support</div>
                                                <div className="text-gray-600 dark:text-gray-30">12-month warranty on all premium materials</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>

            <CartDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                cartItems={cart}
                onRemove={(id: string) => setCart((prev) => prev.filter((i) => i.id !== id))}
                onCheckout={() => {
                    setDrawerOpen(false);
                    // Navigate to checkout
                }}
                subtotal={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                deliveryFee={0}
                total={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
            />
        </div>
    );
}