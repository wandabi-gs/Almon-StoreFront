"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { CartButton } from "@/components/CartButton";
import { SearchBar } from "@/components/SearchBar";
import TrackOrderPopup from "@/components/TrackOrderPopup";
import DeliveryModal from "@/components/DeliveryModal";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";
import { Tabs, Tab, Button } from "@heroui/react";
import { SunIcon, MoonIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { fetchProducts, pollProducts, type FrontendProduct } from "@/lib/productService";

// ---------- Types & Data (kept from original, lightly cleaned) ----------
// interface ProductVariant { name: string; price: number }
// interface Product { id: string; name: string; image: string; variants: ProductVariant[]; description?: string }

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

/* const productDetailsEntries = [
  ["frontlit-banner-1-5-m-440gsm", { price: 4200, image: "/images/products/frontlit-banner-1-5.jpg" }],
  ["frontlit-banner-2-7-m-440gsm", { price: 7200, image: "/images/products/frontlit-banner-1-5.jpg" }],
  ["frontlit-banner-1-2-m-440gsm", { price: 3500, image: "/images/products/frontlit-banner-1-5.jpg" }],
  ["clear-gloss-roll-1-35", { price: 1200, image: "/images/products/clear-gloss-roll-1-35.jpeg" }],
  ["clear-matt-roll-1-35", { price: 1200, image: "/images/products/clear-matt-roll-1-35.jpeg" }],
  ["corex-3mm", { price: 1200, image: "/images/products/corex-3mm.jpeg" }],
  ["corex-4mm", { price: 1200, image: "/images/products/corex-4mm.jpeg" }],
  ["black-back-1-06-440gsm", { price: 4900, image: "/images/products/blackback _banners_ rolls.jpg" }],
  ["black-back-1-6", { price: 6500, image: "/images/products/blackback _banners_ rolls.jpg" }],
  ["black-back-2-metre", { price: 1800, image: "/images/products/blackback _banners_ rolls.jpg" }],
  ["black-back-3-2-440gsm", { price: 8900, image: "/images/products/blackback _banners_ rolls.jpg" }],
  ["corex-5mm", { price: 1800, image: "/images/products/corex-5mm.jpeg" }],
  ["aluco-3mm-black", { price: 3100, image: "/images/products/aluco-3mm-black.jpeg" }],
  ["aluco-blue", { price: 3200, image: "/images/products/aluco-blue.jpeg" }],
  ["aluco-gold-brushed", { price: 3500, image: "/images/products/aluco-gold-brushed.jpeg" }],
  ["aluco-silver-brushed", { price: 3500, image: "/images/products/aluco-silver-brushed.jpeg" }],
  ["aluco-white-3mm", { price: 3000, image: "/images/products/aluco-white-3mm.jpeg" }],
  ["aluminium-big-cutter", { price: 950, image: "/images/products/aluminium-big-cutter.jpg" }],
  ["aluminium-small-cutter", { price: 450, image: "/images/products/aluminium-small-cutter.jpg" }],
  ["forex-2mm", { price: 2600, image: "/images/products/forex-2mm.jpeg" }],
  ["forex-3mm", { price: 2600, image: "/images/products/forex-3mm.jpeg" }],
  ["forex-4mm", { price: 2600, image: "/images/products/forex-4mm.jpeg" }],
  ["forex-5mm", { price: 3400, image: "/images/products/forex-5mm.jpeg" }],
  ["forex-celucar-10mm", { price: 3400, image: "/images/products/forex-celucar-10mm.jpeg" }],
  ["scissors", { price: 1200, image: "/images/products/scissors.jpeg" }],
  ["abs-0-9", { price: 1200, image: "/images/products/abs-0-9.jpeg" }],
  ["airbag", { price: 1200, image: "/images/products/airbag.jpeg" }],
  ["backdrop-2-25-3-65", { price: 1200, image: "/images/products/backdrop-2-25-3-65.jpeg" }],
  ["backdrop-3-3", { price: 1200, image: "/images/products/backdrop-3-3.jpeg" }],
  ["big-blade-pckt", { price: 1200, image: "/images/products/big-blade-pckt.jpeg" }],
  ["big-knife", { price: 1200, image: "/images/products/big-knife.jpeg" }],
  ["broadbase", { price: 1200, image: "/images/products/broadbase.jpeg" }],
  ["frosted-window-film-roll-1-27", { price: 7200, image: "/images/products/frosted-film-roll.jpeg" }],
  ["one-way-vision-1-35", { price: 6300, image: "/images/products/one-way-vision.jpg" }],
  ["dtf-pet-film-0-6-100m", { price: 12400, image: "/images/products/dtf-pet-film.jpeg" }],
  ["rainbow-film-1-37", { price: 6900, image: "/images/products/rainbow-film.jpg" }],
  ["satin-0-914", { price: 8900, image: "/images/products/satin-roll.jpg" }],
  ["sparkle-frost-glitters-4ft", { price: 8800, image: "/images/products/sparkle-frost-glitter.jpg" }],
  ["wrist-band-small-yellow", { price: 40, image: "/images/products/wristband-yellow.jpg" }],
  ["wrist-band-small-black", { price: 40, image: "/images/products/wristband-black.jpg" }],
  ["wrist-band-small-blue", { price: 40, image: "/images/products/wristband-blue.jpg" }],
  ["wrist-band-small-orange", { price: 40, image: "/images/products/wristband-orange.jpg" }],
  ["wrist-paper-red", { price: 30, image: "/images/products/wrist-paper-red.jpg" }],
  ["wrist-paper-green", { price: 30, image: "/images/products/wrist-paper-green.jpg" }],
  ["pen-executive", { price: 180, image: "/images/products/pen-executive.jpg" }],
  ["super-glue", { price: 120, image: "/images/products/super_glue.jpg" }],
  ["masking-tape-1-inch", { price: 350, image: "/images/products/masking-tape-1.jpeg" }],
  ["masking-tape-2-inch", { price: 550, image: "/images/products/masking-tape-2.jpeg" }],
  ["normal-roll-up", { price: 6200, image: "/images/products/normal-roll-up.jpg" }],
  ["snapper-frame-a1", { price: 1800, image: "/images/products/snapper-frame-a1.jpg" }],
  ["snapper-frame-a3", { price: 1200, image: "/images/products/snapper-frame-a3.jpg" }],
  ["broadbase", { price: 7000, image: "/images/products/Broad_base_stand.jpg" }],
  ["channellium", { price: 600, image: "/images/products/channellium.jpg" }],
  ["squeegee-yellow-green", { price: 250, image: "/images/products/squeegee-yellow-green.jpg" }],
  ["envelope-a3", { price: 1200, image: "/images/products/envelope-a3.jpg" }],
  ["eyelet-machine", { price: 1200, image: "/images/products/eyelet-machine.jpg" }],
  ["eyelets-small-pckt", { price: 1200, image: "/images/products/eyelets-small-pckt.jpg" }],
  ["f2", { price: 1200, image: "/images/products/f2_glue.jpg" }],
  ["folder-pcs", { price: 1200, image: "/images/products/folder-pcs.jpg" }],
  ["indoor-stands", { price: 1200, image: "/images/products/indoor-stands.jpg" }],
  ["key-holder", { price: 1200, image: "/images/products/key-holder.jpg" }],
  ["lanyard-big-grey", { price: 1200, image: "/images/products/lanyard-big-grey.jpg" }],
  ["lanyard-big-orange", { price: 1200, image: "/images/products/lanyard-big-orange.jpg" }],
  ["lanyard-big-white", { price: 1200, image: "/images/products/lanyard-big-white.jpg" }],
  ["lanyard-small-black", { price: 1200, image: "/images/products/lanyard-small-black.jpg" }],
  ["lanyard-small-blue", { price: 1200, image: "/images/products/lanyard-small-blue.jpg" }],
  ["lanyard-small-green", { price: 1200, image: "/images/products/lanyard-small-green.jpg" }],
  ["lanyard-small-yellow", { price: 1200, image: "/images/products/lanyard-small-yellow.jpg" }],
  ["lanyard-small-orange", { price: 1200, image: "/images/products/lanyard-small-orange.jpg" }],
  ["lanyard-small-pink", { price: 1200, image: "/images/products/lanyard-small-pink.jpg" }],
  ["masking-tape-1-inch", { price: 1200, image: "/images/products/masking-tape-1.jpeg" }],
  ["masking-tape-2-inch", { price: 1200, image: "/images/products/masking-tape-2.jpeg" }],
  ["medals", { price: 1200, image: "/images/products/medals.jpg" }],
  ["name-tag-a2", { price: 1200, image: "/images/products/name-tag-a2.jpg" }],
  ["name-tag-blue-soft-card", { price: 1200, image: "/images/products/name-tag-blue-soft-card.jpg" }],
  ["neon-light", { price: 1200, image: "/images/products/neon-light.jpg" }],
  ["normal-roll-up", { price: 1200, image: "/images/products/normal-roll-up.jpg" }],
  ["note-book-a4-gold", { price: 1200, image: "/images/products/note-book-a4-gold.jpg" }],
  ["note-book-a5-blue", { price: 1200, image: "/images/products/note-book-a5-blue.jpg" }],
  ["note-book-a4-dark-blue", { price: 1200, image: "/images/products/note-book-a4-dark-blue.jpg" }],
  ["note-book-a4-light-blue", { price: 1200, image: "/images/products/note-book-a4-light-blue.jpg" }],
  ["note-book-a4-orange", { price: 1200, image: "/images/products/note-book-a4-orange.jpg" }],
  ["note-book-a4-pink", { price: 1200, image: "/images/products/note-book-a4-pink.jpg" }],
  ["note-book-a5-brown", { price: 1200, image: "/images/products/note-book-a5-brown.jpg" }],
  ["note-book-a5-maroon", { price: 1200, image: "/images/products/note-book-a5-maroon.jpg" }],
  ["one-way-vision-1-35", { price: 1200, image: "/images/products/oneway_vision.jpg" }],
  ["packing-1-inch-50m", { price: 1200, image: "/images/products/packing-1-inch-50m.jpeg" }],
  ["pen-executive", { price: 1200, image: "/images/products/pen-executive.jpg" }],
  ["permanent-marker", { price: 1200, image: "/images/products/permanent-marker.jpg" }],
  ["persepex-clear", { price: 1200, image: "/images/products/persepex-clear.jpeg" }],
  ["persepex-white", { price: 1200, image: "/images/products/persepex-white.jpeg" }],
  ["perspex-knife", { price: 1200, image: "/images/products/perspex-knife.jpg" }],
  ["pop-up-3-by-3", { price: 1200, image: "/images/products/pop-up-3-by-3.jpg" }],
  ["pop-up-a-shape-80-180", { price: 1200, image: "/images/products/pop-up-a-shape-80-180.jpg" }],
  ["rainbow-film-1-37", { price: 1200, image: "/images/products/rainbow-film.jpeg" }],
  ["satin-0-914", { price: 1200, image: "/images/products/satin-roll.jpeg" }],
  ["silver-big-cutter", { price: 1200, image: "/images/products/silver-big-cutter.jpg" }],
  ["small-blade", { price: 1200, image: "/images/products/spare_blades.jpg" }],
  ["small-flag", { price: 1200, image: "/images/products/small-flag.jpg" }],
  ["small-knife", { price: 1200, image: "/images/products/small-knife.jpg" }],
  ["snapper-frame-a0", { price: 1200, image: "/images/products/snapper-frame-a0.jpg" }],
  ["snapper-frame-a2", { price: 1200, image: "/images/products/snapper-frame-a2.jpg" }],
  ["spacers-gold", { price: 1200, image: "/images/products/spacers-gold.jpg" }],
  ["spacers-silver", { price: 1200, image: "/images/products/spacers-silver.jpg" }],
  ["spacers-white", { price: 1200, image: "/images/products/spacers-white.jpg" }],
  ["sparkle-frost-glitters-4ft", { price: 1200, image: "/images/products/sparkle-frost-glitter.jpeg" }],
  ["squeegee-big-blue", { price: 1200, image: "/images/products/squeegee big blue.jpg" }],
  ["squeegee-handle", { price: 1200, image: "/images/products/squeegee handle.jpg" }],
  ["squeegee-small-blue", { price: 1200, image: "/images/products/squeegee big blue.jpg" }],
  ["squeegee-white-blue", { price: 1200, image: "/images/products/squeege white blue.jpg" }],
  ["squeegee-yellow-green", { price: 1200, image: "/images/products/squeegee yellow green.jpg" }],
  ["super-glue", { price: 1200, image: "/images/products/super-glue.jpg" }],
  ["tape-caution-black-yellow", { price: 1200, image: "/images/products/tape-caution-black-yellow.jpg" }],
  ["tape-caution-white-red", { price: 1200, image: "/images/products/tape-caution-white-red.jpg" }],
  ["tape-packing-clear-2inch", { price: 1200, image: "/images/products/tape-packing-clear-2inch.jpg" }],
  ["tear-drop-3-5", { price: 1200, image: "/images/products/tear-drop-3-5.jpg" }],
  ["tear-drop-4-5", { price: 1200, image: "/images/products/tear-drop-4-5.jpg" }],
  ["tear-drops-2-5", { price: 1200, image: "/images/products/tear-drops-2-5.jpg" }],
  ["telescopic-4-5", { price: 1200, image: "/images/products/telescopic-4-5.jpg" }],
  ["uhu-20ml", { price: 1200, image: "/images/products/uhu_glue.jpg" }],
  ["uhu-35ml", { price: 1200, image: "/images/products/uhu_glue.jpg" }],
  ["uhu-big-125ml", { price: 1200, image: "/images/products/uhu_glue.jpg" }],
  ["uhu-medium-60ml", { price: 1200, image: "/images/products/uhu_glue.jpg" }],
  ["wrist-band-small-yellow", { price: 1200, image: "/images/products/wristband-yellow.jpg" }],
  ["wrist-band-small-black", { price: 1200, image: "/images/products/wristband-black.jpg" }],
  ["wrist-band-small-blue", { price: 1200, image: "/images/products/wristband-blue.jpg" }],
  ["wrist-band-small-orange", { price: 1200, image: "/images/products/wristband-orange.jpg" }],
  ["wrist-paper-red", { price: 1200, image: "/images/products/wrist-paper-red.jpg" }],
  ["wrist-paper-green", { price: 1200, image: "/images/products/wrist-paper-green.jpg" }],
  ["wrist-paper-orange", { price: 1200, image: "/images/products/wrist-paper-orange.jpg" }],
  ["wrist-paper-pink", { price: 1200, image: "/images/products/wrist-paper-pink.jpg" }],
  ["wrist-paper-purple", { price: 1200, image: "/images/products/wrist-paper-purple.jpg" }],
  ["wrist-paper-white", { price: 1200, image: "/images/products/wrist-paper-white.jpg" }],
  ["wrist-paper-yellow", { price: 1200, image: "/images/products/wrist-paper-yellow.jpg" }],
  ["x-stand", { price: 1200, image: "/images/products/x-stand.jpg" }],
] as const;

const productDetails = Object.fromEntries(productDetailsEntries) as Record<string, { price: number; image: string }>; */

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
  "other": 1000, // Default for other areas
};

// ---------- Utility helpers ----------
// const formatProductName = (id: string) =>
//   id
//     .replace(/-/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase())
//     .replace(/(\d)\s+(\d)/g, "$1.$2")
//     .replace(/\s{2,}/g, " ");

// ---------- Theme helpers ----------
const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // prefer saved theme, otherwise system
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

// ---------- Page Component ----------
export default function StorefrontPage() {
  // state
  const [cart, setCart] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { theme, toggle } = useTheme();
  // const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<any>("roll");
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryArea] = useState<string>("");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Product state from API
  const [apiProducts, setApiProducts] = useState<FrontendProduct[]>([]);
  const [_productsLoading, setProductsLoading] = useState(true);
  const [useApiProducts, setUseApiProducts] = useState(true); // Toggle to use API or fallback

  // NOTE: Keep your original product data source and mapping. For compatibility we use `products` variable here.
  // If you'd prefer, import `products` from a shared file. Below is a minimized placeholder so the page compiles
  // during local edits. Replace with the full dataset you already have in the original page.

  // type ProductSaleType = "roll" | "metre" | "sheet" | "unit";

  // const toVariantLabel = (saleType: ProductSaleType) => {
  //   switch (saleType) {
  //     case "metre": return "Metre";
  //     case "roll": return "Roll";
  //     case "sheet": return "Sheet";
  //     case "unit":
  //     default: return "Unit";
  //   }
  // };

  // const getMetreMultiplier = (variant: string) => {
  //   const match = variant.match(/([\d.]+)/);
  //   return match ? Number(match[1]) || 1 : 1;
  // };

  // Fetch products from API on mount
  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const data = await fetchProducts();
        if (data.products && data.products.length > 0) {
          setApiProducts(data.products);
          setUseApiProducts(true);
        } else {
          // Fallback to hardcoded products if API fails
          setUseApiProducts(false);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
        setUseApiProducts(false);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();

    // Set up polling for automatic price updates (every 30 seconds)
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

  // Merge API products with fallback products (currently unused but kept for potential future use)
  // const products: Product[] = useMemo(() => {
  //   if (useApiProducts && apiProducts.length > 0) {
  //     // Use API products
  //     return apiProducts.map((apiProduct) => ({
  //       id: apiProduct.id,
  //       name: apiProduct.name,
  //       image: apiProduct.image,
  //       variants: apiProduct.variants,
  //       description: apiProduct.description,
  //     }));
  //   } else {
  //     // Fallback to hardcoded products
  //     return Object.entries(productSaleType).map(([id, saleType]) => {
  //       const variantLabel = toVariantLabel(saleType);
  //       const details = productDetails[id] || { price: 0, image: "/images/product-placeholder.jpg" };
  //       return {
  //         id,
  //         name: formatProductName(id),
  //         image: details.image,
  //         variants: [{ name: variantLabel, price: details.price }],
  //         description: `Sold per ${variantLabel.toLowerCase()}.`,
  //       };
  //     });
  //   }
  // }, [useApiProducts, apiProducts]);

  // Filtered products (currently unused but kept for potential future use)
  // const filteredProducts = useMemo(() => {
  //   return products.filter((p) =>
  //     [p.name, p.description ?? "", ...p.variants.map((v) => v.name)]
  //       .join(" ")
  //       .toLowerCase()
  //       .includes(search.toLowerCase())
  //   );
  // }, [products, search]);

  // Grouped products by type (currently unused but kept for potential future use)
  // const productsByType = useMemo(() => {
  //   const grouped: Record<ProductSaleType, Product[]> = {
  //     roll: [],
  //     metre: [],
  //     sheet: [],
  //     unit: [],
  //   };
  //   filteredProducts.forEach((p) => {
  //     // Use API product sale type if available, otherwise fallback to hardcoded
  //     const saleType = (useApiProducts ? apiProductSaleType[p.id] : productSaleType[p.id]) || "unit";
  //     grouped[saleType].push(p);
  //   });
  //   return grouped;
  // }, [filteredProducts, useApiProducts, apiProductSaleType]);

  // Helper functions (currently unused but kept for potential future use)
  // const getSelectedVariant = (product: Product) =>
  //   selectedVariants[product.id] ?? product.variants[0].name;

  // const getVariantPrice = (product: Product, variant: string) => {
  //   const basePrice = product.variants.find((v) => v.name === variant)?.price ?? product.variants[0].price;
  //   const saleType = (useApiProducts ? apiProductSaleType[product.id] : productSaleType[product.id]) ?? "unit";
  //   return saleType === "metre" ? basePrice * getMetreMultiplier(variant) : basePrice;
  // };

  // Handler functions (currently unused but kept for potential future use)
  // const handleVariantChange = (productId: string, variant: string) => {
  //   setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  // };

  // const handleAddToCart = (product: Product) => {
  //   const variant = getSelectedVariant(product);
  //   const price = getVariantPrice(product, variant);
  //   const cartId = `${product.id}-${variant}`;
  //   const existing = cart.find((item) => item.id === cartId);
  //   if (existing) {
  //     setCart(cart.map((item) => item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item));
  //   } else {
  //     setCart([...cart, {
  //       id: cartId,
  //       productId: product.id, // Store product ID directly for easier order formatting
  //       name: product.name,
  //       variant,
  //       price,
  //       quantity: 1
  //     }]);
  //   }
  // };

  // const handleIncrease = (cartId: string) => {
  //   setCart((prev) =>
  //     prev.map((item) =>
  //       item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item
  //     )
  //   );
  // };

  // const handleDecrease = (cartId: string) => {
  //   setCart((prev) =>
  //     prev
  //       .map((item) =>
  //         item.id === cartId
  //           ? { ...item, quantity: item.quantity - 1 }
  //           : item
  //       )
  //       .filter((item) => item.quantity > 0)
  //   );
  // };

  // Transform API products to display format
  const products = useMemo(() => {
    return apiProducts.map((apiProduct) => ({
      id: apiProduct.id,
      originalId: (apiProduct as any).originalId || apiProduct.id, // Use originalId if available, fallback to id
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
        productId: (product as any).originalId || product.id, // Use originalId for API calls, fallback to display id
        name: product.name,
        variant,
        price,
        quantity: 1
      }]);
    }
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

  return (
    <div
      className="min-h-screen relative overflow-x-hidden
      bg-gradient-to-br from-white via-slate-50 to-sky-50
      dark:bg-gradient-to-br dark:from-black dark:via-neutral-900 dark:to-slate-900
      text-slate-900 dark:text-gray-100
      transition-colors duration-700 selection:bg-pink-500/40"
    >
      {/* Ambient Floating Gradients */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-pink-500/30 via-sky-400/20 to-indigo-500/20 blur-[140px] opacity-80"></div>
      <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/25 via-pink-500/20 to-sky-400/20 blur-[140px] opacity-70"></div>

      {/* Noise & Vignette Overlays */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[url('/noise.png')] mix-blend-overlay"></div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.25)_100%)]"></div>

      {/* ------------------- HEADER ------------------- */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-pink-600/15 via-sky-500/10 to-indigo-700/8 dark:from-black/40 dark:via-neutral-900/40 backdrop-blur-3xl border-b border-transparent shadow-lg transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Top Row: Logo + Actions */}
          <div className="flex items-center justify-between gap-3 mb-3 sm:mb-0">
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <div className="relative flex items-center gap-3">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-sky-400 p-0.5 shadow-[0_8px_30px_rgba(132,60,255,0.18)]">
                  <img
                    src="/images/logo.jpg"
                    alt="Almon Products logo"
                    className="w-full h-full rounded-xl object-cover bg-white/30"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-sky-400 to-indigo-400">
                    Almon Products
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200/90 dark:text-gray-300/90">
                    Premium Materials & Finishing
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggle}
                aria-label="Toggle theme"
                className="group rounded-full p-2 sm:p-3 bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-white/5 ring-1 ring-white/10 dark:ring-white/20 backdrop-blur transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl hover:ring-2 hover:ring-white/30 dark:hover:ring-white/40"
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className="relative"
                >
                  {theme === "dark" ? (
                    <motion.div
                      whileHover={{
                        rotate: [0, 15, -15, 15, 0],
                        scale: [1, 1.2, 1.15],
                      }}
                      transition={{
                        duration: 0.6,
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      }}
                      className="relative"
                    >
                      <SunIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 dark:text-yellow-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] filter brightness-110 contrast-125 group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,1)] transition-all duration-300" />
                      {/* Animated rays effect on hover */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{
                          background: "conic-gradient(from 0deg, transparent 0deg, rgba(251,191,36,0.3) 45deg, transparent 90deg, rgba(251,191,36,0.3) 135deg, transparent 180deg, rgba(251,191,36,0.3) 225deg, transparent 270deg, rgba(251,191,36,0.3) 315deg, transparent 360deg)",
                          opacity: 0,
                        }}
                        whileHover={{
                          opacity: 1,
                          scale: 1.5,
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="relative flex items-center justify-center"
                      whileHover={{
                        scale: [1, 1.15, 1.1],
                      }}
                      transition={{
                        duration: 0.5,
                        type: "spring",
                        stiffness: 400,
                        damping: 12,
                      }}
                    >
                      {/* Black background circle for moon icon in light mode */}
                      <motion.div
                        className="absolute -inset-2 bg-black dark:bg-transparent rounded-full w-8 h-8 sm:w-10 sm:h-10"
                        whileHover={{
                          scale: [1, 1.1, 1.05],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 0.5,
                          type: "spring",
                        }}
                      />
                      <motion.div
                        whileHover={{
                          rotate: [0, -15, 15, -15, 0],
                          y: [0, -2, 0],
                        }}
                        transition={{
                          duration: 0.6,
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        }}
                        className="relative z-10"
                      >
                        <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white dark:text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)] filter brightness-110 contrast-125 group-hover:drop-shadow-[0_0_12px_rgba(99,102,241,1)] transition-all duration-300" />
                      </motion.div>
                      {/* Stars effect on hover for moon */}
                      <motion.div
                        className="absolute inset-0 z-0"
                        initial={{ opacity: 0 }}
                        whileHover={{
                          opacity: [0, 1, 0.8],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full blur-sm" />
                        <div className="absolute top-1/4 right-0 w-0.5 h-0.5 bg-white rounded-full blur-sm" />
                        <div className="absolute bottom-1/4 left-0 w-0.5 h-0.5 bg-white rounded-full blur-sm" />
                      </motion.div>
                    </motion.div>
                  )}
                  {/* Enhanced Glow effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-full blur-md transition-opacity ${theme === "dark"
                      ? "bg-yellow-400/50 dark:bg-yellow-300/50"
                      : "bg-indigo-400/50 dark:bg-indigo-300/50"
                      }`}
                    initial={{ opacity: 0.4 }}
                    whileHover={{
                      opacity: [0.6, 1, 0.8],
                      scale: [1, 1.2, 1.1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                </motion.div>
              </button>

              {/* Track Order */}
              <button
                onClick={() => setTrackModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl shadow-xl transform-gpu hover:scale-[1.02] active:scale-98 bg-gradient-to-r from-pink-600 to-sky-500 text-white font-semibold"
              >
                <ShoppingBagIcon className="w-5 h-5 opacity-95" />
                <span className="hidden lg:inline">Track Order</span>
                <span className="lg:hidden">Track</span>
              </button>

              {/* Delivery */}
              <button
                onClick={() => setDeliveryModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium border border-white/10 bg-gradient-to-b from-white/6 to-transparent text-slate-50 hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <span>Delivery</span>
              </button>

              {/* Cart */}
              <div className="relative">
                <CartButton count={cart.reduce((s, i) => s + i.quantity, 0)} onOpen={() => setDrawerOpen(true)} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-400 blur-sm opacity-80" aria-hidden="true"></span>
              </div>

              {/* Mobile Compact Actions */}
              <div className="sm:hidden flex items-center gap-2">
                <Button onClick={() => setDeliveryModalOpen(true)} className="rounded-full p-2 bg-white/8">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </Button>
                <Button onClick={() => setTrackModalOpen(true)} className="rounded-full p-2 bg-white/8">
                  <ShoppingBagIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:max-w-xl sm:mx-auto sm:mt-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-white/70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
              </div>
              <div className="rounded-full overflow-hidden shadow-md ring-1 ring-white/10 bg-gradient-to-r from-white/5 via-white/3 to-transparent">
                <SearchBar
                  query={search}
                  onSearch={setSearch}
                  className="!px-12 !py-3 bg-transparent placeholder:text-white/60 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ------------------- HERO BANNER ------------------- */}
      <section className="relative w-full min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Video/Image Background */}
        <div className="absolute inset-0 w-full h-full">
          {/* Video Background */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            poster="/images/banner/hero-banner.png"
            onLoadedData={() => {
              setVideoLoaded(true);
              setVideoError(false);
              // Force play in case autoplay didn't work
              if (videoRef.current) {
                videoRef.current.play().catch((err) => {
                  console.log("Video autoplay prevented:", err);
                });
              }
            }}
            onError={(e) => {
              console.error("Video loading error:", e);
              setVideoError(true);
              setVideoLoaded(false);
            }}
            onCanPlay={() => {
              setVideoLoaded(true);
            }}
            onLoadedMetadata={() => {
              setVideoLoaded(true);
            }}
          >
            <source src="/videos/hero-banner.mp4" type="video/mp4" />
            <source src="/videos/hero-banner.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>

          {/* Fallback Image Background with Animation - Only show if video fails */}
          {(!videoLoaded || videoError) && (
            <motion.div
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
              style={{
                backgroundImage: "url('/images/banner/hero-banner.png')",
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                scale: [1, 1.05, 1],
              }}
              transition={{
                opacity: { duration: 0.5 },
                scale: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              }}
            />
          )}

          {/* Animated Gradient Overlays for Depth */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-pink-600/40 via-sky-500/30 to-indigo-700/40"
            animate={{
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Animated Mesh Gradient Overlay */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)
              `,
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 dark:from-black/70 dark:via-black/60 dark:to-black/80" />

          {/* Animated Light Rays */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)",
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid gap-12 grid-cols-1 lg:grid-cols-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-white to-sky-300">
                  Premium Materials for
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-white to-indigo-300">
                  Professional Results
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] font-light"
              >
                Explore high‑grade printing substrates, finishing materials, and accessories engineered
                to elevate your brand. Shop confidently with real‑time inventory, premium quality, and
                fast Nairobi delivery.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="mt-8 flex gap-4 flex-wrap"
              >
                <button
                  onClick={() => {
                    const element = document.getElementById("products-section");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 rounded-2xl shadow-2xl bg-gradient-to-r from-pink-600 to-sky-500 text-white font-semibold transform-gpu hover:scale-[1.03] active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-sm"
                >
                  Explore Products
                </button>

                <motion.button
                  onClick={() => setTrackModalOpen(true)}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 rounded-2xl overflow-hidden font-black text-white shadow-2xl transition-all duration-500 border-2 border-white/30 hover:border-white/50 backdrop-blur-sm"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #06b6d4 50%, #8b5cf6 100%)',
                    backgroundSize: '200% 200%',
                    boxShadow: '0 10px 40px rgba(236, 72, 153, 0.6), 0 0 20px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundPosition = '100% 0%';
                    e.currentTarget.style.boxShadow = '0 15px 50px rgba(236, 72, 153, 0.8), 0 0 30px rgba(139, 92, 246, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundPosition = '0% 0%';
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(236, 72, 153, 0.6), 0 0 20px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                  }}
                >
                  {/* Static Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-cyan-500 to-purple-600" />

                  {/* Shimmer Effect - Only on Hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ x: '-100%' }}
                    whileHover={{
                      x: '200%',
                      transition: {
                        duration: 0.8,
                        ease: "easeInOut",
                      }
                    }}
                  />

                  {/* Static Glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/50 via-cyan-500/50 to-purple-500/50 blur-2xl" />

                  {/* Content */}
                  <span className="relative z-10 flex items-center gap-3">
                    <motion.div
                      whileHover={{
                        rotate: [0, -15, 15, -15, 0],
                        scale: [1, 1.4, 1.3],
                        y: [0, -4, 0]
                      }}
                      transition={{
                        duration: 0.6,
                        type: "spring",
                        stiffness: 400,
                        damping: 10
                      }}
                      className="relative"
                    >
                      <ShoppingBagIcon className="w-7 h-7 drop-shadow-lg filter brightness-110" />
                      {/* Icon Glow - Only on Hover */}
                      <motion.div
                        className="absolute inset-0 bg-white/60 blur-lg rounded-full -z-10 opacity-0 group-hover:opacity-100"
                        whileHover={{
                          opacity: [0.4, 0.8, 0.4],
                          scale: [1, 1.3, 1],
                          transition: {
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        }}
                      />
                    </motion.div>
                    <span className="text-lg font-black tracking-wide drop-shadow-lg">Track Your Order</span>
                  </span>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-400/90 via-cyan-400/90 to-purple-400/90 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.button>
              </motion.div>
            </div>

            {/* Hero Image/Visual Element */}
            <div className="lg:col-span-5 relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="relative"
              >
                {/* Floating Product Showcase */}
                <div className="relative bg-white/10 dark:bg-white/5 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl overflow-hidden group transform-gpu hover:shadow-[0_25px_70px_rgba(0,0,0,0.5)] transition-all duration-500">
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Animated Border Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      boxShadow: 'inset 0 0 60px rgba(255, 255, 255, 0.1)',
                    }}
                    animate={{
                      boxShadow: [
                        'inset 0 0 60px rgba(255, 255, 255, 0.1)',
                        'inset 0 0 80px rgba(236, 72, 153, 0.2)',
                        'inset 0 0 60px rgba(255, 255, 255, 0.1)',
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                {/* Floating Accent Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-pink-500/30 to-sky-500/30 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-white/70"
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </section>

      {/* ------------------- PRODUCTS SECTION ------------------- */}
      <section id="products-section" className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-4 py-2 rounded-full">
              Our Products
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Premium Quality Materials
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Discover our comprehensive range of professional-grade materials, carefully curated for excellence and reliability
          </motion.p>
        </div>

        {/* Tabs Container */}
        <div className="relative">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-transparent to-sky-500/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-indigo-500/10 via-transparent to-pink-500/10 blur-3xl rounded-full"></div>
          </div>

          {/* Professional Tabs */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as any)}
            className="relative"
            variant="solid"
            color="default"
            radius="lg"
            classNames={{
              base: "w-full",
              tabList:
                "relative w-full flex gap-2 md:gap-3 overflow-x-auto rounded-2xl px-3 md:px-4 py-4 md:py-5 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 shadow-2xl mb-8",
              cursor:
                "hidden",
              tab:
                "px-5 md:px-8 py-4 md:py-5 text-sm md:text-base font-semibold rounded-xl transition-all duration-500 ease-out relative overflow-hidden group data-[selected=true]:shadow-xl data-[selected=true]:scale-105 min-h-[60px] md:min-h-[70px] flex items-center justify-center",
              tabContent: "relative z-10 text-sm md:text-base font-semibold transition-colors duration-300",
              panel: "pt-4 md:pt-8 min-h-[600px] md:min-h-[800px] transition-all duration-300",
            }}
          >
            {(["roll", "metre", "board", "unit"] as const).map((tabKey) => {
              const tabProducts = productsByType[tabKey] || [];
              const tabLabels: Record<typeof tabKey, { label: string; description: string; gradient: string }> = {
                roll: {
                  label: "Rolls",
                  description: "Premium roll materials for large-format printing",
                  gradient: "from-pink-500 via-rose-500 to-pink-600"
                },
                metre: {
                  label: "Metres",
                  description: "Flexible materials sold by the metre",
                  gradient: "from-sky-500 via-blue-500 to-indigo-600"
                },
                board: {
                  label: "Boards",
                  description: "Rigid substrates and display boards",
                  gradient: "from-indigo-500 via-purple-500 to-indigo-600"
                },
                unit: {
                  label: "Units",
                  description: "Individual items and accessories",
                  gradient: "from-emerald-500 via-teal-500 to-cyan-600"
                },
              };
              const tabInfo = tabLabels[tabKey];
              const isActive = activeTab === tabKey;

              return (
                <Tab
                  key={tabKey}
                  data-key={tabKey}
                  title={
                    <motion.div
                      className="flex flex-col items-center gap-1 relative z-10"
                      initial={false}
                      animate={{
                        scale: isActive ? 1.05 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className={`font-semibold transition-colors duration-300 ${isActive
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                        }`}>
                        {tabInfo.label}
                      </span>
                      <span className={`text-xs font-normal hidden md:block transition-colors duration-300 ${isActive
                        ? 'text-white/90'
                        : 'text-gray-400 dark:text-gray-500'
                        }`}>
                        {tabProducts.length} {tabProducts.length === 1 ? 'item' : 'items'}
                      </span>
                    </motion.div>
                  }
                  className="pt-6"
                >
                  {/* Category Header */}
                  <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {tabInfo.label}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                      {tabInfo.description}
                    </p>
                  </div>

                  {/* Products Grid */}
                  <div className="min-h-[500px] md:min-h-[700px]">
                    {tabProducts.length === 0 ? (
                      <div className="text-center py-16 md:py-24">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                          No products found in this category
                        </p>
                        {apiProducts.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Loading products...
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Try adjusting your search or check other categories
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10 w-full">
                        {tabProducts.map((product, index) => {
                          const selectedVariant = getSelectedVariant(product);
                          const variantPrice = getVariantPrice(product, selectedVariant);
                          const cartItem = cart.find((item) => item.id === `${product.id}-${selectedVariant}`);
                          return (
                            <motion.div
                              key={`${product.id}-${product.sku || index}`}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: index * 0.05 }}
                            >
                              <ProductCard
                                id={product.id}
                                name={product.name}
                                image={product.image}
                                description={product.description}
                                price={variantPrice}
                                variants={product.variants}
                                selectedVariant={selectedVariant}
                                onVariantChange={(variant) => handleVariantChange(product.id, variant)}
                                onAddToCart={() => handleAddToCart(product)}
                                quantity={cartItem?.quantity}
                                onIncrease={() => handleIncrease(`${product.id}-${selectedVariant}`)}
                                onDecrease={() => handleDecrease(`${product.id}-${selectedVariant}`)}
                                saleType={product.saleType}
                                originalPrice={product.originalPrice}
                                hasDiscount={product.hasDiscount}
                                vatPercentage={product.vatPercentage || 16}
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Tab>
              );
            })}
          </Tabs>
        </div>
      </section>

      {/* ------------------- FOOTER ------------------- */}
      <footer className="relative bg-gradient-to-br from-white/40 via-slate-100/40 to-white/10 dark:from-black/30 dark:via-neutral-900/30 dark:to-black/20 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 py-12 mt-20 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_30px_rgba(255,255,255,0.03)]">
        <div className="absolute -top-10 left-10 w-40 h-40 bg-pink-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-40 h-40 bg-sky-500/20 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-8 z-10">
          {/* Company Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-sky-500 to-indigo-500">
              Almon Products Ltd
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              © {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>

          {/* Divider Mobile */}
          <div className="sm:hidden w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Link
              to="/privacy-policy"
              className="hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-pink-600 hover:to-sky-400 transition-all duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-pink-600 hover:to-sky-400 transition-all duration-300"
            >
              Terms of Service
            </Link>
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <span className="inline-flex w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
              Made with care
            </span>
          </div>
        </div>
      </footer>

      {/* Drawers / Modals */}
      <CartDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cartItems={cart}
        onRemove={(id: string) => setCart((prev) => prev.filter((i) => i.id !== id))}
        onCheckout={() => {
          setDrawerOpen(false);
          setCheckoutOpen(true);
        }}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        total={total}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={total + deliveryFee}
        cartItems={cart}
        productSaleType={useApiProducts ? apiProductSaleType : productSaleType}
        storeId="STR251100001"
        deliveryFee={deliveryFee}
        deliveryArea={deliveryArea}
      />

      {trackModalOpen && <TrackOrderPopup isOpen={trackModalOpen} onClose={() => setTrackModalOpen(false)} />}
      {deliveryModalOpen && <DeliveryModal isOpen={deliveryModalOpen} onClose={() => setDeliveryModalOpen(false)} />}

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
}
