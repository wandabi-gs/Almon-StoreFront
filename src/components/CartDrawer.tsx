"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Badge,
  Divider,
} from "@heroui/react";
import {
  TrashIcon,
  XMarkIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  CreditCardIcon,
  ChartBarIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onClearAll?: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemove,
  onCheckout,
  onClearAll,
  subtotal,
  deliveryFee,
  total,
}) => {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = cartItems.length > 0;

  const getItemSubtotal = (item: CartItem) => {
    return item.price * item.quantity;
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"
      classNames={{
        base: "z-[9999]",
        wrapper: "backdrop-blur-sm",
        backdrop: "bg-black/60 backdrop-blur-sm",
      }}
    >
      <DrawerContent className="bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl">
        {/* Premium Header */}
        <DrawerHeader className="pt-8 pb-6 px-8 bg-gradient-to-r from-blue-600/5 via-cyan-600/5 to-blue-600/5 dark:from-blue-600/10 dark:via-cyan-600/10 dark:to-blue-600/10 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="relative"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-0.5">
                  <div className="w-full h-full rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center">
                    <ShoppingBagIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Enterprise Cart
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    color={hasItems ? "success" : "default"}
                    variant="flat"
                    size="sm"
                  >
                    {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Ready for Procurement
                  </span>
                </div>
              </div>
            </div>

            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              className="rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </Button>
          </div>
        </DrawerHeader>

        <DrawerBody className="px-0 overflow-y-auto">
          <AnimatePresence>
            {!hasItems ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center p-8"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                    <ShoppingBagIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 animate-pulse" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Procurement Cart Empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-xs">
                  Add enterprise-grade materials to initiate procurement process
                </p>

                <Button
                  onPress={onClose}
                  className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                  endContent={<ChevronRightIcon className="w-5 h-5" />}
                >
                  Continue Browsing
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4 p-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative flex-shrink-0">
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PackageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="absolute -top-2 -right-2">
                            <Badge
                              color="primary"
                              size="sm"
                              className="font-bold"
                            >
                              {item.quantity}
                            </Badge>
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-sm md:text-base">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {item.variant}
                                </span>
                                {item.sku && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    {item.sku}
                                  </span>
                                )}
                              </div>
                            </div>

                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              onPress={() => onRemove(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Pricing and Quantity */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1">
                                <button
                                  onClick={() => {
                                    // Handle decrease - you'd need to pass onDecrease for each item
                                    // For now, just remove if quantity becomes 0
                                    if (item.quantity === 1) {
                                      onRemove(item.id);
                                    }
                                  }}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-gray-600 rounded"
                                >
                                  -
                                </button>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => {
                                    // Handle increase
                                  }}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-gray-600 rounded"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                KES {getItemSubtotal(item).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Unit: KES {item.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Enterprise Features */}
                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Quality Assured</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <TruckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Next-Day Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <LockClosedIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <CreditCardIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Corporate Billing</span>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </DrawerBody>

        {hasItems && (
          <DrawerFooter className="px-6 pb-8 pt-0 border-t border-gray-200 dark:border-gray-800">
            {/* Summary */}
            <div className="w-full space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    KES {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Delivery</span>
                  </div>
                  <span className={`text-sm font-medium ${deliveryFee > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {deliveryFee > 0 ? `KES ${deliveryFee.toLocaleString()}` : 'Configure at checkout'}
                  </span>
                </div>

                {/* Tax/VAT */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">VAT (16%)</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    KES {(subtotal * 0.16).toLocaleString()}
                  </span>
                </div>

                <Divider className="my-2" />

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Procurement Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      KES {total.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      All prices inclusive of VAT
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onPress={onCheckout}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 py-7 text-lg"
                  endContent={<ChevronRightIcon className="w-5 h-5" />}
                  startContent={<CreditCardIcon className="w-6 h-6" />}
                >
                  Initiate Procurement
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="bordered"
                    onPress={onClose}
                    className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="light"
                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onPress={() => {
                      if (onClearAll) {
                        onClearAll();
                      } else {
                        // Fallback for backward compatibility
                        cartItems.forEach(item => onRemove(item.id));
                      }
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Security & Compliance */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <LockClosedIcon className="w-3 h-3" />
                    <span>256-bit Encryption</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <div className="flex items-center gap-1">
                    <ShieldCheckIcon className="w-3 h-3" />
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <div className="flex items-center gap-1">
                    <ChartBarIcon className="w-3 h-3" />
                    <span>Order Tracking</span>
                  </div>
                </div>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                  By proceeding, you agree to our procurement terms and data processing agreement.
                </p>
              </div>
            </div>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

// Helper component for package icon
function PackageIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  );
}