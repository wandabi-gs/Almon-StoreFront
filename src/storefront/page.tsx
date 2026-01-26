"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { CartButton } from "@/components/CartButton";
import { SearchBar } from "@/components/SearchBar";
import TrackOrderPopup from "@/components/TrackOrderPopup";
import DeliveryModal from "@/components/DeliveryModal";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, Tab, Button, Select, SelectItem } from "@heroui/react";
import {
  SunIcon,
  MoonIcon,
  ShoppingBagIcon,
  ChevronRightIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  ChartBarIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  LifebuoyIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { fetchProducts, pollProducts, type FrontendProduct } from "@/lib/productService";

// ---------- Types & Data ----------
const productSaleType: Record<string, "roll" | "metre" | "board" | "unit"> = {
  "frontlit-banner-1-5-m-440gsm": "roll",
  "frontlit-banner-2-7-m-440gsm": "roll",
  "frontlit-banner-1-2-m-440gsm": "roll",
  "black-back-1-06-440gsm": "roll",
  "black-back-1-6": "roll",
  "black-back-2-metre": "metre",
  "black-back-3-2-440gsm": "roll",
  "corex-5mm": "board",
  "aluco-3mm-black": "board",
  "aluco-blue": "board",
  "aluco-gold-brushed": "board",
  "aluco-silver-brushed": "board",
  "aluco-white-3mm": "board",
  "aluminium-big-cutter": "unit",
  "aluminium-normal-rollup": "unit",
  "aluminium-small-cutter": "unit",
  "corex-3mm": "board",
  "forex-2mm": "board",
  "forex-3mm": "board",
  "forex-4mm": "board",
  "forex-5mm": "board",
  "forex-celucar-10mm": "board",
  "scissors": "unit",
  "abs-0-9": "board",
  "airbag": "unit",
  "backdrop-2-25-3-65": "unit",
  "backdrop-3-3": "unit",
  "big-blade-pckt": "unit",
  "big-knife": "unit",
  "broadbase": "unit",
  "broadbase-4-5kg-aluminium": "unit",
  "card-holder": "unit",
  "carrier-bag": "unit",
  "cellotape-small": "unit",
  "channellium": "unit",
  "clear-gloss-roll-1-35": "roll",
  "clear-matt-roll-1-35": "roll",
  "corex-4mm": "board",
  "door-frame-80-180": "unit",
  "dtf-pet-film-0-6-100m": "roll",
  "envelope-a3": "unit",
  "eyelet-machine": "unit",
  "eyelets-small-pckt": "unit",
  "f2": "unit",
  "folder-pcs": "unit",
  "frosted-window-film-roll-1-27": "roll",
  "indoor-stands": "unit",
  "key-holder": "unit",
  "lanyard-big-grey": "unit",
  "lanyard-big-orange": "unit",
  "lanyard-big-white": "unit",
  "lanyard-small-black": "unit",
  "lanyard-small-blue": "unit",
  "lanyard-small-green": "unit",
  "lanyard-small-yellow": "unit",
  "lanyard-small-orange": "unit",
  "lanyard-small-pink": "unit",
  "masking-tape-1-inch": "roll",
  "masking-tape-2-inch": "roll",
  "medals": "unit",
  "name-tag-a2": "unit",
  "name-tag-blue-soft-card": "unit",
  "neon-light": "unit",
  "normal-roll-up": "unit",
  "note-book-a4-gold": "unit",
  "note-book-a5-blue": "unit",
  "note-book-a4-dark-blue": "unit",
  "note-book-a4-light-blue": "unit",
  "note-book-a4-orange": "unit",
  "note-book-a4-pink": "unit",
  "note-book-a5-brown": "unit",
  "note-book-a5-maroon": "unit",
  "one-way-vision-1-35": "roll",
  "packing-1-inch-50m": "roll",
  "pen-executive": "unit",
  "permanent-marker": "unit",
  "persepex-clear": "board",
  "persepex-white": "board",
  "perspex-knife": "unit",
  "pop-up-3-by-3": "unit",
  "pop-up-a-shape-80-180": "unit",
  "rainbow-film-1-37": "roll",
  "satin-0-914": "roll",
  "silver-big-cutter": "unit",
  "small-blade": "unit",
  "small-flag": "unit",
  "small-knife": "unit",
  "snapper-frame-a0": "unit",
  "snapper-frame-a1": "unit",
  "snapper-frame-a2": "unit",
  "snapper-frame-a3": "unit",
  "snapper-frame-a4": "unit",
  "spacers-gold": "unit",
  "spacers-silver": "unit",
  "spacers-white": "unit",
  "sparkle-frost-glitters-4ft": "roll",
  "squeegee-big-blue": "unit",
  "squeegee-handle": "unit",
  "squeegee-small-blue": "unit",
  "squeegee-white-blue": "unit",
  "squeegee-yellow-green": "unit",
  "super-glue": "unit",
  "tape-caution-black-yellow": "unit",
  "tape-caution-white-red": "unit",
  "tape-packing-clear-2inch": "unit",
  "tear-drop-3-5": "unit",
  "tear-drop-4-5": "unit",
  "tear-drops-2-5": "unit",
  "telescopic-4-5": "unit",
  "uhu-20ml": "unit",
  "uhu-35ml": "unit",
  "uhu-big-125ml": "unit",
  "uhu-medium-60ml": "unit",
  "wrist-band-small-yellow": "unit",
  "wrist-band-big-green": "unit",
  "wrist-band-big-orange": "unit",
  "wrist-band-small-black": "unit",
  "wrist-band-small-blue": "unit",
  "wrist-band-small-light-blue": "unit",
  "wrist-band-small-orange": "unit",
  "wrist-band-small-pink": "unit",
  "wrist-band-small-purple": "unit",
  "wrist-band-small-red": "unit",
  "wrist-band-small-white": "unit",
  "wrist-paper-black": "unit",
  "wrist-paper-blue": "unit",
  "wrist-paper-db-green": "unit",
  "wrist-paper-green": "unit",
  "wrist-paper-orange": "unit",
  "wrist-paper-pink": "unit",
  "wrist-paper-purple": "unit",
  "wrist-paper-red": "unit",
  "wrist-paper-white": "unit",
  "wrist-paper-yellow": "unit",
  "x-stand": "unit"
};

// ---------- Delivery Fee Configuration ----------
const deliveryAreas: Record<string, number> = {
  "nairobi-cbd": 500,
  "westlands": 600,
  "kilimani": 600,
  "parklands": 600,
  "lavington": 700,
  "karen": 800,
  "runda": 800,
  "langata": 700,
  "kasarani": 700,
  "roysambu": 700,
  "ruiru": 800,
  "thika": 1000,
  "juja": 900,
  "kiambu": 800,
  "ruaka": 700,
  "rongai": 800,
  "ngong": 900,
  "kikuyu": 900,
  "westlands-area": 600,
  "other": 1000,
};

// ---------- Theme helpers ----------
const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "dark" || (!saved && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
};

// Mobile Tabs Component
const MobileTabs = ({
  activeTab,
  setActiveTab,
  productsByType
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  productsByType: Record<"roll" | "metre" | "board" | "unit", any[]>;
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { key: "roll", label: "ROLL MATERIALS", icon: Squares2X2Icon },
    { key: "metre", label: "METERED PRODUCTS", icon: ChartBarIcon },
    { key: "board", label: "BOARD SUBSTRATES", icon: Squares2X2Icon },
    { key: "unit", label: "UNIT ITEMS", icon: ShoppingBagIcon },
  ] as const;

  const activeTabData = tabs.find(tab => tab.key === activeTab);
  const productCount = productsByType[activeTab as keyof typeof productsByType]?.length || 0;

  return (
    <div className="md:hidden mb-8">
      {/* Mobile Tab Selector */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
          variant="flat"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          startContent={<Bars3Icon className="w-5 h-5" />}
        >
          Categories
        </Button>

        <div className="flex-1">
          <Select
            selectedKeys={[activeTab]}
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0] as string;
              setActiveTab(key);
            }}
            className="max-w-xs"
            variant="bordered"
            aria-label="Select product category"
            classNames={{
              trigger: "h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
              value: "text-sm font-semibold",
            }}
          >
            {tabs.map((tab) => (
              <SelectItem key={tab.key} textValue={tab.label}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTab === tab.key ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{tab.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {productsByType[tab.key as keyof typeof productsByType]?.length || 0} products
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Current Tab Info */}
      {activeTabData && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-gray-800">
                <activeTabData.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{activeTabData.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{productCount} products available</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Current</div>
              <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                {productCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tab Grid (when menu is open) */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Categories</h3>
              <Button
                isIconOnly
                variant="light"
                onPress={() => setMobileMenuOpen(false)}
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const count = productsByType[tab.key as keyof typeof productsByType]?.length || 0;

                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-4 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${isActive
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                    <span className={`font-semibold text-sm text-center ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {tab.label.split(' ')[0]}
                    </span>
                    <span className={`text-xs mt-1 ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {count} items
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ---------- Page Component ----------
export default function StorefrontPage() {
  const navigate = useNavigate();
  // state
  const [cart, setCart] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { theme, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState<any>("roll");
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryArea] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Product state from API
  const [apiProducts, setApiProducts] = useState<FrontendProduct[]>([]);
  const [useApiProducts] = useState(true);
  const [stats, setStats] = useState({ products: 0, orders: 1254, clients: 987, delivery: 99.2 });

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Stats animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        orders: prev.orders + Math.floor(Math.random() * 3),
        clients: prev.clients + Math.floor(Math.random() * 2)
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch products from API on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        if (data.products && data.products.length > 0) {
          setApiProducts(data.products);
          setStats(prev => ({ ...prev, products: data.products.length }));
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    loadProducts();
    const cleanup = pollProducts((products) => {
      setApiProducts(products);
    }, 30000);
    return cleanup;
  }, []);

  // Build product sale type map from API products
  const apiProductSaleType = useMemo(() => {
    const map: Record<string, "roll" | "metre" | "board" | "unit"> = {};
    apiProducts.forEach((product) => {
      map[product.id] = product.saleType;
    });
    return map;
  }, [apiProducts]);

  // Transform API products to display format
  const products = useMemo(() => {
    return apiProducts.map((apiProduct) => ({
      id: apiProduct.id,
      originalId: (apiProduct as any).originalId || apiProduct.id,
      name: apiProduct.name,
      image: apiProduct.image,
      variants: apiProduct.variants.map((v) => v.name),
      description: apiProduct.description || `Sold per ${apiProduct.saleType.toLowerCase()}.`,
      price: apiProduct.price,
      saleType: apiProduct.saleType,
      originalPrice: apiProduct.originalPrice,
      hasDiscount: apiProduct.hasDiscount,
      vatPercentage: apiProduct.vatPercentage,
      sku: apiProduct.sku,
    }));
  }, [apiProducts]);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const searchLower = search.toLowerCase();
    return products.filter((p) =>
      [p.name, p.description ?? "", ...p.variants]
        .join(" ")
        .toLowerCase()
        .includes(searchLower)
    );
  }, [products, search]);

  // Group products by sale type
  const productsByType = useMemo(() => {
    const grouped: Record<"roll" | "metre" | "board" | "unit", typeof products> = {
      roll: [],
      metre: [],
      board: [],
      unit: [],
    };
    filteredProducts.forEach((p) => {
      const saleType = p.saleType || "unit";
      if (saleType in grouped) {
        grouped[saleType as keyof typeof grouped].push(p);
      } else {
        grouped.unit.push(p);
      }
    });
    return grouped;
  }, [filteredProducts]);

  // Get paginated products for current tab
  const currentTabProducts = productsByType[activeTab as keyof typeof productsByType] || [];
  const totalPages = Math.ceil(currentTabProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return currentTabProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [currentTabProducts, currentPage, itemsPerPage]);

  // Selected variants state
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Helper functions
  const getSelectedVariant = (product: typeof products[0]) =>
    selectedVariants[product.id] ?? product.variants[0];

  const getVariantPrice = (product: typeof products[0], variant: string) => {
    const variantObj = apiProducts.find((p) => p.id === product.id)?.variants.find((v) => v.name === variant);
    return variantObj?.price ?? product.price;
  };

  const handleVariantChange = (productId: string, variant: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  };

  const handleAddToCart = (product: typeof products[0]) => {
    const variant = getSelectedVariant(product);
    const price = getVariantPrice(product, variant);
    const cartId = `${product.id}-${variant}`;
    const existing = cart.find((item) => item.id === cartId);
    if (existing) {
      setCart(cart.map((item) => item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, {
        id: cartId,
        productId: (product as any).originalId || product.id,
        name: product.name,
        variant,
        price,
        quantity: 1,
        image: product.image,
        sku: product.sku
      }]);
    }
  };

  // Clear all items from cart
  const handleClearCart = () => {
    console.log("Clearing cart...");
    setCart([]);
  };

  // Handle successful checkout
  const handleCheckoutSuccess = () => {
    console.log("Checkout successful, clearing cart...");
    setCart([]);
    setCheckoutOpen(false);
    setDrawerOpen(false);
  };

  const handleIncrease = (cartId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (cartId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === cartId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryArea && deliveryAreas[deliveryArea] ? deliveryAreas[deliveryArea] : 0;
  const total = subtotal + deliveryFee;

  // Corporate stats grid
  const corporateStats = [
    { icon: BuildingStorefrontIcon, label: "Premium Products", value: stats.products, suffix: "+" },
    { icon: CreditCardIcon, label: "Successful Orders", value: stats.orders, suffix: "+" },
    { icon: UserGroupIcon, label: "Enterprise Clients", value: stats.clients, suffix: "+" },
    { icon: TruckIcon, label: "Delivery Success", value: stats.delivery, suffix: "%" },
  ];

  // Enhanced Product Card Component
  const ProductCard = ({ product, index }: { product: typeof products[0], index: number }) => {
    const selectedVariant = getSelectedVariant(product);
    const variantPrice = getVariantPrice(product, selectedVariant);
    const cartItem = cart.find((item) => item.id === `${product.id}-${selectedVariant}`);

    return (
      <motion.div
        key={`${product.id}-${index}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        <div className="group bg-gradient-to-br from-white to-white/80 dark:from-gray-900 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl hover:shadow-4xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 h-full">
          {/* Product Image */}
          <Link to={`/product/${product.id}`} className="block">
            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {product.hasDiscount && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-bold shadow-lg">
                  SAVE {Math.round((1 - product.price / product.originalPrice!) * 100)}%
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </Link>

          {/* Product Info */}
          <div className="p-6">
            <Link to={`/product/${product.id}`} className="block">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-1">
                  <ChartBarIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {product.saleType}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">
                {product.description}
              </p>
            </Link>

            {/* Pricing */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    KSh {variantPrice.toLocaleString()}
                  </span>
                  {product.hasDiscount && (
                    <span className="ml-3 text-sm text-gray-500 dark:text-gray-400 line-through">
                      KSh {product.originalPrice?.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold">
                  VAT {product.vatPercentage || 16}%
                </span>
              </div>
            </div>

            {/* Variants and Actions */}
            <div className="space-y-4">
              <select
                value={selectedVariant}
                onChange={(e) => handleVariantChange(product.id, e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label={`Select variant for ${product.name}`}
              >
                {product.variants.map((variant) => (
                  <option key={variant} value={variant}>
                    {variant} - KSh {getVariantPrice(product, variant).toLocaleString()}
                  </option>
                ))}
              </select>

              <div className="flex items-center space-x-3">
                {cartItem ? (
                  <>
                    <button
                      onClick={() => handleDecrease(`${product.id}-${selectedVariant}`)}
                      className="flex-1 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-gray-900 dark:text-white text-lg">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrease(`${product.id}-${selectedVariant}`)}
                      className="flex-1 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
                    >
                      +
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    Add to Cart
                  </button>
                )}
              </div>

              <Link to={`/product/${product.id}`}>
                <button className="w-full py-3 rounded-lg border-2 border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                  View Details
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Custom pagination component for better mobile adaptation
  const CustomPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, currentTabProducts.length)} of {currentTabProducts.length} products
        </div>

        <div className="flex items-center gap-2">
          <Button
            isDisabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => prev - 1)}
            variant="light"
            size="sm"
            className="min-w-10"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  onPress={() => setCurrentPage(pageNum)}
                  variant={currentPage === pageNum ? "solid" : "light"}
                  color={currentPage === pageNum ? "primary" : "default"}
                  size="sm"
                  className={`min-w-10 ${currentPage === pageNum ? '!text-white' : ''}`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            isDisabled={currentPage === totalPages}
            onPress={() => setCurrentPage(prev => prev + 1)}
            variant="light"
            size="sm"
            className="min-w-10"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Ultra HD Background Effects */}
      <div className="fixed inset-0 z-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,82,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,82,212,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Floating Orbs */}
        <motion.div
          className="absolute top-1/4 -left-40 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-40 w-[800px] h-[800px] bg-gradient-to-tr from-cyan-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22256%22 height=%22256%22 filter=%22url(%23noise)%22 opacity=%220.02%22/%3E%3C/svg%3E')] opacity-5" />
      </div>

      {/* ------------------- CORPORATE HEADER ------------------- */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-white/90 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl py-4 border-b border-gray-200/50 dark:border-gray-800/50'
          : 'bg-gradient-to-b from-white/95 via-white/90 to-transparent dark:from-gray-950/95 dark:via-gray-900/90 dark:to-transparent py-6'
          }`}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-0.5 shadow-2xl shadow-blue-500/30">
                  <div className="w-full h-full rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-brand-orange-500 flex items-center justify-center shadow-soft">
                      <img
                        src="/images/logo.png"
                        alt="Almon Products Limited"
                        className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-200 dark:to-gray-300">
                  Almon<span className="text-blue-600 dark:text-blue-400">Products</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium tracking-wide">
                  ENTERPRISE SOLUTIONS
                </p>
              </div>
            </Link>

            {/* Navigation for Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/products" className="relative text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/enterprise" className="relative text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                Enterprise
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/resources" className="relative text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                Resources
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/support" className="relative text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                Support
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggle}
                className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 group"
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 group-hover:rotate-180 transition-transform duration-700" />
                ) : (
                  <MoonIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:rotate-180 transition-transform duration-700" />
                )}
              </button>

              {/* Track Order Button - Mobile */}
              <button
                onClick={() => setTrackModalOpen(true)}
                className="flex md:hidden items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-gray-700/50"
              >
                <ShieldCheckIcon className="w-4 h-4" />
                <span className="text-xs">Track</span>
              </button>

              {/* Delivery Button - Mobile */}
              <button
                onClick={() => setDeliveryModalOpen(true)}
                className="flex md:hidden items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-blue-500/50"
              >
                <TruckIcon className="w-4 h-4" />
                <span className="text-xs">Delivery</span>
              </button>

              {/* Track Order Button - Desktop */}
              <button
                onClick={() => setTrackModalOpen(true)}
                className="hidden md:flex items-center space-x-3 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 text-white font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-gray-700/50"
              >
                <ShieldCheckIcon className="w-5 h-5" />
                <span>Track Order</span>
              </button>

              {/* Delivery Button - Desktop */}
              <button
                onClick={() => setDeliveryModalOpen(true)}
                className="hidden md:flex items-center space-x-3 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-blue-500/50"
              >
                <TruckIcon className="w-5 h-5" />
                <span>Delivery</span>
              </button>

              <CartButton
                count={cart.reduce((s, i) => s + i.quantity, 0)}
                onOpen={() => setDrawerOpen(true)}
              />

              {/* Mobile Menu Button */}
              <Button className="lg:hidden p-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50">
                <Bars3Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/products" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Products
                </Link>
                <Link to="/enterprise" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Enterprise
                </Link>
                <Link to="/support" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Support
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <SearchBar
                  query={search}
                  onSearch={setSearch}
                  className="!py-2 !px-3 !rounded-lg !bg-white/80 dark:!bg-gray-800/80 backdrop-blur-xl !border-gray-200 dark:!border-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ------------------- EXECUTIVE HERO SECTION ------------------- */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Geometric Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 sm:mb-8">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-200 dark:to-gray-300">
                  Premium Industrial
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
                  Materials & Solutions
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 leading-relaxed max-w-2xl">
                Delivering excellence through certified materials, enterprise-grade solutions,
                and professional support for businesses that demand uncompromising quality.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-2xl transition-all duration-300 flex items-center group"
                >
                  <span className="text-sm sm:text-base">Explore Products</span>
                  <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/quotation')}
                  className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl border-2 border-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 text-sm sm:text-base"
                >
                  Request Quote
                </motion.button>
              </div>

              {/* Search Bar */}
              <div className="max-w-xl">
                <SearchBar
                  query={search}
                  onSearch={setSearch}
                  className="!py-3 sm:!py-4 !px-4 sm:!px-6 !rounded-xl !bg-white/80 dark:!bg-gray-800/80 backdrop-blur-xl !border-gray-200 dark:!border-gray-700 !shadow-2xl"
                />
              </div>
            </motion.div>

            {/* Hero Visual - Hidden on small mobile, shown on tablet+ */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden sm:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-4xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                  {/* Animated Grid */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                  }} />

                  {/* Floating Elements */}
                  <div className="absolute inset-0 p-8 sm:p-12">
                    <motion.div
                      animate={{ y: [0, -30, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-8 left-8 w-32 h-32 sm:w-48 sm:h-48 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 backdrop-blur-xl border border-white/10"
                    />
                    <motion.div
                      animate={{ y: [0, 30, 0] }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute bottom-8 right-8 w-48 h-48 sm:w-64 sm:h-64 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------- EXECUTIVE STATS SECTION ------------------- */}
      <section className="relative py-16 sm:py-24">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {corporateStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-4xl transition-all duration-500">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-baseline">
                        {stat.value}
                        <span className="text-blue-500 ml-1 sm:ml-2 text-sm sm:text-base md:text-lg">{stat.suffix}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------- PRODUCTS SECTION ------------------- */}
      <section id="products-section" className="relative py-20 sm:py-32">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block mb-4 sm:mb-6"
            >
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">
                  ENTERPRISE PORTFOLIO
                </span>
              </div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6"
            >
              Enterprise <span className="text-blue-600 dark:text-blue-400">Product</span> Catalog
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Discover our comprehensive range of industrial-grade materials, engineered for professional excellence and unmatched reliability.
            </motion.p>
          </div>

          {/* Mobile Tabs Component */}
          <MobileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            productsByType={productsByType}
          />

          {/* Desktop Tabs - Enhanced for Mobile */}
          <div className="hidden md:block mb-16">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as any)}
              variant="light"
              classNames={{
                base: "w-full",
                tabList: "gap-2 w-full relative rounded-2xl p-2 bg-gradient-to-r from-gray-100 to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 overflow-x-auto flex-nowrap",
                tab: "h-12 md:h-14 px-4 md:px-6 rounded-xl data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-blue-600 data-[selected=true]:to-cyan-500 data-[selected=true]:shadow-2xl transition-all duration-300 whitespace-nowrap",
                tabContent: "font-semibold text-xs md:text-sm uppercase tracking-wider text-gray-800 dark:text-gray-200 group-data-[selected=true]:text-white"
              }}
            >
              {(["roll", "metre", "board", "unit"] as const).map((tabKey) => {
                const tabProducts = productsByType[tabKey] || [];
                const tabLabels = {
                  roll: { label: "ROLL MATERIALS" },
                  metre: { label: "METERED PRODUCTS" },
                  board: { label: "BOARD SUBSTRATES" },
                  unit: { label: "UNIT ITEMS" },
                };

                return (
                  <Tab
                    key={tabKey}
                    title={
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <span>{tabLabels[tabKey].label}</span>
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                          {tabProducts.length}
                        </span>
                      </div>
                    }
                  >
                    <div className="mt-12">
                      {paginatedProducts.length === 0 ? (
                        <div className="text-center py-16 sm:py-32">
                          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                            <BuildingStorefrontIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                          </div>
                          <h3 className="text-lg sm:text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                            No Products Available
                          </h3>
                          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                            Check back soon for updates in this category.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {paginatedProducts.map((product, index) => (
                              <ProductCard key={product.id} product={product} index={index} />
                            ))}
                          </div>

                          {/* Custom Pagination */}
                          <CustomPagination />
                        </>
                      )}
                    </div>
                  </Tab>
                );
              })}
            </Tabs>
          </div>

          {/* Mobile Products Grid - Show when tabs are hidden */}
          <div className="md:hidden">
            <div className="mt-8">
              {paginatedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <BuildingStorefrontIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                    No Products Available
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Check back soon for updates in this category.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6">
                    {paginatedProducts.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </div>

                  {/* Mobile Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-4 mt-8">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          isDisabled={currentPage === 1}
                          onPress={() => setCurrentPage(prev => prev - 1)}
                          variant="flat"
                          size="sm"
                          className="min-w-12"
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {[currentPage - 1, currentPage, currentPage + 1]
                            .filter(page => page >= 1 && page <= totalPages)
                            .map(page => (
                              <Button
                                key={page}
                                onPress={() => setCurrentPage(page)}
                                variant={currentPage === page ? "solid" : "flat"}
                                color={currentPage === page ? "primary" : "default"}
                                size="sm"
                                className="min-w-10"
                              >
                                {page}
                              </Button>
                            ))}
                        </div>
                        <Button
                          isDisabled={currentPage === totalPages}
                          onPress={() => setCurrentPage(prev => prev + 1)}
                          variant="flat"
                          size="sm"
                          className="min-w-12"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------- ENTERPRISE FEATURES ------------------- */}
      <section className="relative py-20 sm:py-32 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block mb-4 sm:mb-6"
            >
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">
                  WHY CHOOSE US
                </span>
              </div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6"
            >
              Enterprise <span className="text-blue-600 dark:text-blue-400">Advantages</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Solutions built for scale, reliability, and professional excellence.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: ShieldCheckIcon,
                title: "Certified Quality",
                description: "All materials meet international quality standards and certifications with full traceability",
                gradient: "from-blue-600 to-cyan-500",
                link: "/resources#quality-certifications"
              },
              {
                icon: TruckIcon,
                title: "Enterprise Logistics",
                description: "Reliable delivery network with real-time tracking and monitoring for enterprise clients",
                gradient: "from-cyan-600 to-blue-500",
                link: "/enterprise#logistics"
              },
              {
                icon: CreditCardIcon,
                title: "Bulk Solutions",
                description: "Custom pricing and terms for enterprise-level procurement and large-scale projects",
                gradient: "from-purple-600 to-blue-500",
                link: "/quotation"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative group"
              >
                <Link to={feature.link}>
                  <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-800/40 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-4xl transition-all duration-500 h-full">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-4 sm:mb-6 shadow-lg`}>
                      <div className="w-full h-full rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center">
                        <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                      {feature.description}
                    </p>
                    <div className="pt-4 sm:pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                      <button className="text-blue-600 dark:text-blue-400 font-semibold text-sm flex items-center group-hover:translate-x-2 transition-transform">
                        Learn more
                        <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------- EXECUTIVE FOOTER ------------------- */}
      <footer className="relative bg-gradient-to-br from-gray-900 to-gray-950 text-white py-16 sm:py-24">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {/* Company */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-brand-orange-500 flex items-center justify-center shadow-soft">
                  <img
                    src="/images/logo.png"
                    alt="Almon Products Limited"
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                  />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Almon Products</h2>
                  <p className="text-xs sm:text-sm text-gray-400">Enterprise Solutions</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                Delivering excellence through premium materials and professional solutions for enterprise clients since 2015.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                  <button
                    key={social}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors hover:scale-110 text-xs sm:text-sm"
                  >
                    {social.charAt(0)}
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "Products",
                icon: ShoppingBagIcon,
                links: [
                  { name: "Roll Materials", to: "/products?category=roll" },
                  { name: "Board Substrates", to: "/products?category=board" },
                  { name: "Unit Items", to: "/products?category=unit" },
                  { name: "New Arrivals", to: "/products?new=true" },
                  { name: "Bulk Orders", to: "/quotation" }
                ]
              },
              {
                title: "Enterprise",
                icon: BuildingOfficeIcon,
                links: [
                  { name: "Solutions", to: "/enterprise" },
                  { name: "Industries", to: "/enterprise#industries" },
                  { name: "Case Studies", to: "/resources#case-studies" },
                  { name: "White Papers", to: "/resources#white-papers" },
                  { name: "API Access", to: "/enterprise#integration" }
                ]
              },
              {
                title: "Support",
                icon: LifebuoyIcon,
                links: [
                  { name: "Documentation", to: "/resources#documentation" },
                  { name: "Help Center", to: "/support" },
                  { name: "Order Tracking", to: "/support#tracking" },
                  { name: "Contact Sales", to: "/support#contact" },
                  { name: "Service Status", to: "/support#status" }
                ]
              }
            ].map((column, colIndex) => {
              const Icon = column.icon;
              return (
                <div key={column.title} className={colIndex > 1 ? "md:col-span-2 lg:col-span-1" : ""}>
                  <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    <h3 className="text-base sm:text-lg font-bold text-white">{column.title}</h3>
                  </div>
                  <ul className="space-y-2 sm:space-y-3">
                    {column.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.to}
                          className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors hover:translate-x-2 inline-block"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-xs sm:text-sm text-gray-400 text-center md:text-left mb-4 md:mb-0">
                © {new Date().getFullYear()} Almon Products Ltd. All rights reserved.
              </p>
              <div className="flex space-x-4 sm:space-x-6">
                <Link to="/privacy-policy" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookie-policy" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ------------------- MODALS & DRAWERS ------------------- */}
      <CartDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cartItems={cart}
        onRemove={(id: string) => setCart((prev) => prev.filter((i) => i.id !== id))}
        onCheckout={() => {
          setDrawerOpen(false);
          setCheckoutOpen(true);
        }}
        onClearAll={handleClearCart}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        total={total}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={total + (subtotal * 0.16)}
        cartItems={cart}
        productSaleType={useApiProducts ? apiProductSaleType : productSaleType}
        storeId="STR251100001"
        deliveryFee={deliveryFee}
        deliveryArea={deliveryArea}
        onClearCart={handleClearCart}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      <AnimatePresence>
        {trackModalOpen && (
          <TrackOrderPopup
            isOpen={trackModalOpen}
            onClose={() => setTrackModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deliveryModalOpen && (
          <DeliveryModal
            isOpen={deliveryModalOpen}
            onClose={() => setDeliveryModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <CookieConsentBanner />
    </div>
  );
}