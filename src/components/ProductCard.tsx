"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Select,
  SelectItem,
} from "@heroui/react";
import { motion } from "framer-motion";
import {
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  ChevronUp,
  Star,
  TrendingUp,
  Shield,
  Clock,
  Truck,
  Layers,
  Package,
  Zap,
  Sparkles
} from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number; // Discounted price
  variants: string[];
  selectedVariant: string;
  onVariantChange: (variant: string) => void;
  onAddToCart: (quantity: number) => void;
  quantity?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
  saleType?: "roll" | "metre" | "board" | "unit" | "kg";
  originalPrice?: number; // Original price before discount
  hasDiscount?: boolean; // Whether product has active discount
  vatPercentage?: number; // VAT percentage (default 16%)
  sku?: string;
  rating?: number;
  stock?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  image,
  description,
  price,
  variants,
  selectedVariant,
  onVariantChange,
  onAddToCart,
  quantity: controlledQuantity,
  onIncrease,
  onDecrease,
  saleType = "unit",
  originalPrice,
  hasDiscount = false,
  vatPercentage = 16,
  sku,
  rating = 4.8,
  stock = 100,
}) => {
  const [uncontrolledQuantity, setUncontrolledQuantity] = useState(1);
  const isControlled = typeof controlledQuantity === "number";
  const quantity = isControlled ? controlledQuantity ?? 0 : uncontrolledQuantity;
  const [isHovered, setIsHovered] = useState(false);

  const handleIncrease = () => {
    if (isControlled) {
      onIncrease?.();
      return;
    }
    setUncontrolledQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (isControlled) {
      if (quantity <= 0) return;
      onDecrease?.();
      return;
    }
    setUncontrolledQuantity((prev) => Math.max(1, prev - 1));
  };

  const metreOptions = [0.25, 0.5, 1];
  const stockPercentage = Math.min(100, (stock / 100) * 100);
  const isLowStock = stockPercentage < 30;
  const isOutOfStock = stock === 0;

  // Function to scroll to top of page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Get sale type icon and color
  const getSaleTypeInfo = () => {
    switch (saleType) {
      case "roll":
        return { icon: Layers, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" };
      case "metre":
        return { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" };
      case "board":
        return { icon: Package, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" };
      case "unit":
        return { icon: Package, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" };
      case "kg":
        return { icon: TrendingUp, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" };
      default:
        return { icon: Package, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-800" };
    }
  };

  const saleTypeInfo = getSaleTypeInfo();
  const SaleTypeIcon = saleTypeInfo.icon;

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.02,
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full h-full"
    >
      <Card className="h-full shadow-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-800 hover:shadow-3xl transition-all duration-500 flex flex-col group relative overflow-hidden">
        {/* Premium Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 opacity-50 pointer-events-none" />

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        />

        {/* Top Badge - Premium Indicator */}
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-full ${saleTypeInfo.bg} border border-gray-200 dark:border-gray-700 backdrop-blur-sm`}>
              <div className="flex items-center gap-1.5">
                <SaleTypeIcon className={`w-4 h-4 ${saleTypeInfo.color}`} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  {saleType}
                </span>
              </div>
            </div>

            {hasDiscount && originalPrice && (
              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 backdrop-blur-sm">
                <span className="text-xs font-bold text-white">
                  -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SKU Badge */}
        {sku && (
          <div className="absolute top-4 right-4 z-20">
            <div className="px-3 py-1.5 rounded-full bg-gray-900/80 dark:bg-gray-100/80 backdrop-blur-sm">
              <span className="text-xs font-mono text-white dark:text-gray-900">
                {sku}
              </span>
            </div>
          </div>
        )}

        <CardBody className="overflow-hidden p-6 md:p-8 flex-1 flex flex-col relative z-10">
          {/* Product Image Container */}
          <motion.div
            className="relative w-full aspect-[4/3] mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
            animate={isHovered ? { scale: 1.03 } : { scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Image Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <Image
              shadow="none"
              radius="none"
              width="100%"
              height="100%"
              alt={name}
              className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-110"
              src={image}
            />

            {/* Stock Indicator */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-white drop-shadow-lg">
                    {stock} in stock
                  </span>
                </div>

                {/* Stock Progress Bar */}
                <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stockPercentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <div className="flex-1">
            {/* Product Name */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {name}
            </h3>

            {/* Product Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">
              {description}
            </p>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700'}`}
                  />
                ))}
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">
                  {rating}
                </span>
              </div>

              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Enterprise Grade</span>
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter className="flex flex-col items-start gap-6 pt-0 px-6 md:px-8 pb-8 relative z-10">
          {/* Variant Selection */}
          {variants.length > 1 && (
            <div className="w-full">
              {saleType === "metre" ? (
                <div className="flex gap-2 flex-wrap">
                  {metreOptions.map((m) => {
                    const variantLabel = `${m} Metre`;
                    const selected = selectedVariant === variantLabel;
                    return (
                      <motion.button
                        key={variantLabel}
                        onClick={() => onVariantChange(variantLabel)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${selected
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                          }`}
                      >
                        {variantLabel}
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <Select
                  aria-label="Select variant"
                  selectedKeys={[selectedVariant]}
                  onChange={(e) => onVariantChange(e.target.value)}
                  size="md"
                  className="w-full"
                  classNames={{
                    trigger: "h-12 min-h-12 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600",
                    value: "text-gray-900 dark:text-white",
                    popoverContent: "bg-white dark:bg-gray-800", // FIXED: Changed from 'popover' to 'popoverContent'
                  }}
                >
                  {variants.map((v) => (
                    <SelectItem
                      key={v}
                      textValue={v}
                      className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {v}
                    </SelectItem>
                  ))}
                </Select>
              )}
            </div>
          )}

          {/* Quantity and Price Section */}
          <div className="w-full space-y-6">
            {/* Quantity Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity
                </span>

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1">
                  <Button
                    isIconOnly
                    radius="md"
                    size="sm"
                    variant="light"
                    onPress={handleDecrease}
                    isDisabled={isControlled ? quantity <= 0 : quantity <= 1}
                    className="min-w-9 h-9 w-9 hover:bg-white dark:hover:bg-gray-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>

                  <span className="text-lg font-bold text-gray-900 dark:text-white min-w-8 text-center">
                    {quantity}
                  </span>

                  <Button
                    isIconOnly
                    radius="md"
                    size="sm"
                    variant="light"
                    onPress={handleIncrease}
                    isDisabled={isOutOfStock}
                    className="min-w-9 h-9 w-9 hover:bg-white dark:hover:bg-gray-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stock Status */}
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Out of Stock</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-semibold">Low Stock</span>
                </div>
              ) : null}
            </div>

            {/* Price Display */}
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  {hasDiscount && originalPrice ? (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          KES {(price * quantity).toLocaleString()}
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold">
                          SAVE {((originalPrice - price) * quantity).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg line-through text-gray-400 dark:text-gray-500">
                          KES {(originalPrice * quantity).toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white">
                          {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      KES {(price * quantity).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* VAT Info */}
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    VAT incl.
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {vatPercentage}% VAT
                  </div>
                </div>
              </div>

              {/* Price Per Unit */}
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span>Price per {saleType}:</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  KES {price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            color="default"
            onPress={() => onAddToCart(quantity)}
            radius="lg"
            size="lg"
            isDisabled={isOutOfStock}
            className={`w-full font-bold text-base md:text-lg py-7 transition-all duration-300 shadow-xl hover:shadow-2xl ${isOutOfStock
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-700 text-white"
              }`}
            startContent={
              isOutOfStock ? (
                <Clock className="w-5 h-5" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )
            }
            endContent={
              !isOutOfStock && (
                <Sparkles className="w-5 h-5 opacity-80" />
              )
            }
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>

          {/* Quick Delivery Info */}
          {!isOutOfStock && (
            <div className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Truck className="w-4 h-4" />
              <span>Next-day delivery available</span>
            </div>
          )}
        </CardFooter>

        {/* Floating Cart Indicator */}
        {quantity > 0 && !isOutOfStock && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-4 right-4 z-30"
          >
            <button
              type="button"
              onClick={scrollToTop}
              className="relative cursor-pointer focus:outline-none group/indicator"
            >
              {/* Main Indicator */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative flex items-center gap-2 px-4 py-3 rounded-full backdrop-blur-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl border border-white/20"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  <CheckCircle2 className="absolute -bottom-1 -right-1 w-4 h-4 text-emerald-300" />
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  In Cart
                </span>

                {/* Quantity Badge */}
                <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold flex items-center justify-center shadow-lg border border-white/50">
                  {quantity}
                </span>
              </motion.div>

              {/* Hover Tooltip */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-0 group-hover/indicator:opacity-100 transition-all duration-300">
                <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs py-2 px-3 rounded-lg shadow-xl whitespace-nowrap mb-2">
                  Scroll to top
                </div>
                <ChevronUp className="w-5 h-5 text-gray-900 dark:text-gray-800" />
              </div>
            </button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};