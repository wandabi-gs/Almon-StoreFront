"use client";

import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Progress,
  Spinner,
  Badge,
  Chip,
  Divider
} from "@heroui/react";
import {
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  StarIcon as StarIconSolid,
  ChartBarIcon,
  ReceiptRefundIcon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";

// ------------------------------------------------------

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  category: string;
  description: string;
  vat: number;
  weight: string;
  dimensions: string;
  material: string;
  specifications: string[];
  deliveryType: "Standard" | "Express";
}

interface Order {
  id: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
  shippingAddress: {
    street: string;
    building: string;
    floor: string;
    city: string;
    postalCode: string;
    country: string;
    coordinates: [number, number];
    landmark: string;
  };
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  estimatedDelivery: string;
  actualDelivery: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    taxId: string;
    customerType: "Retail" | "Corporate" | "Enterprise";
    accountManager: string;
  };
  deliveryDriver: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    totalDeliveries: number;
    currentLocation: [number, number];
    photo: string;
    licenseNumber: string;
  };
  payment: {
    status: "Paid" | "Pending" | "Refunded" | "Partially Paid";
    method: "M-Pesa" | "Credit Card" | "Bank Transfer" | "Invoice";
    transactionId: string;
    amount: number;
    vatAmount: number;
    discount: number;
    totalAmount: number;
    invoiceNumber: string;
    paymentDate: string;
  };
  orderDate: string;
  priority: "Standard" | "Express" | "Priority";
  trackingNumber: string;
  carrier: string;
  carrierTracking: string;
  deliveryNotes: string[];
  specialInstructions: string[];
  packaging: {
    type: string;
    weight: string;
    dimensions: string;
    fragile: boolean;
    handling: string;
  };
  logistics: {
    warehouse: string;
    dispatchTime: string;
    routeId: string;
    distance: string;
    estimatedTransitTime: string;
    transitStops: number;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    ipAddress: string;
    device: string;
    browser: string;
  };
}

// Enhanced dummy order
const dummyOrder: Order = {
  id: "ALM-2025-001",
  status: "Shipped",
  items: [
    {
      id: "PROD-001",
      name: "Premium Frontlit Banner 440GSM",
      quantity: 2,
      price: 87500,
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80",
      category: "Roll Materials",
      description: "High-quality 440GSM frontlit banner material for professional outdoor advertising",
      vat: 16,
      weight: "25kg per roll",
      dimensions: "1.5m x 50m",
      material: "PVC Composite",
      specifications: ["UV Resistant", "Waterproof", "Matte Finish", "Reinforced Edges"],
      deliveryType: "Express"
    },
    {
      id: "PROD-002",
      name: "Corex 5mm Boards",
      quantity: 10,
      price: 3500,
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80",
      category: "Board Substrates",
      description: "Corrugated plastic boards for signage and displays",
      vat: 16,
      weight: "5kg per board",
      dimensions: "1220mm x 2440mm",
      material: "Polypropylene",
      specifications: ["Lightweight", "Weather Resistant", "Easy to Cut", "Recyclable"],
      deliveryType: "Standard"
    },
    {
      id: "PROD-003",
      name: "Aluminium Roll-up Stand",
      quantity: 5,
      price: 17000,
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80",
      category: "Display Systems",
      description: "Professional roll-up display system with carrying case",
      vat: 16,
      weight: "8kg per unit",
      dimensions: "850mm x 2000mm",
      material: "Aluminium/Canvas",
      specifications: ["Portable", "Quick Setup", "Professional Finish", "Includes Case"],
      deliveryType: "Express"
    }
  ],
  shippingAddress: {
    street: "Westlands Business District",
    building: "ABC Towers, Floor 12",
    floor: "12th Floor, Suite 1204",
    city: "Nairobi",
    postalCode: "00100",
    country: "Kenya",
    coordinates: [-1.265, 36.84],
    landmark: "Opposite Sarit Centre"
  },
  billingAddress: {
    street: "Mombasa Road, Industrial Area",
    city: "Nairobi",
    postalCode: "00515",
    country: "Kenya"
  },
  estimatedDelivery: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  actualDelivery: null,
  customer: {
    id: "CUST-789",
    name: "James Omondi",
    email: "james@globaladvertising.co.ke",
    phone: "+254 711 234 567",
    company: "Global Advertising Corporation Ltd",
    taxId: "P051234567X",
    customerType: "Enterprise",
    accountManager: "Sarah Chen"
  },
  deliveryDriver: {
    id: "DRV-456",
    name: "Peter Mwangi",
    phone: "+254 722 345 678",
    vehicle: "Toyota Hilux - KCA 123X",
    rating: 4.8,
    totalDeliveries: 1247,
    currentLocation: [-1.28, 36.825],
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    licenseNumber: "DL-789456-2024"
  },
  payment: {
    status: "Paid",
    method: "Credit Card",
    transactionId: "TXN-789456123",
    amount: 280500,
    vatAmount: 44880,
    discount: 15000,
    totalAmount: 310380,
    invoiceNumber: "INV-2025-001",
    paymentDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  orderDate: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  priority: "Express",
  trackingNumber: "TRK-789-456-123",
  carrier: "Almon Logistics",
  carrierTracking: "ALM-789456",
  deliveryNotes: [
    "Fragile items - Handle with care",
    "Require signature upon delivery",
    "Call 30 minutes before arrival",
    "Deliver to reception on 12th floor",
    "Business hours only (8AM-6PM)"
  ],
  specialInstructions: [
    "Elevator access required",
    "Parking available in basement",
    "Contact: John Doe - +254 733 123 456",
    "Proof of delivery required",
    "Take photos of delivered items"
  ],
  packaging: {
    type: "Professional Packaging",
    weight: "85kg",
    dimensions: "150cm x 80cm x 60cm",
    fragile: true,
    handling: "Keep upright, Do not stack, Temperature controlled"
  },
  logistics: {
    warehouse: "Nairobi Central Warehouse",
    dispatchTime: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    routeId: "RT-456",
    distance: "15.8 km",
    estimatedTransitTime: "2 hours 15 minutes",
    transitStops: 3
  },
  metadata: {
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system",
    ipAddress: "192.168.1.100",
    device: "Desktop",
    browser: "Chrome 120"
  }
};

// Status configuration
const statusSteps = ["Pending", "Processing", "Shipped", "Delivered"];
const statusIcons: Record<string, JSX.Element> = {
  Pending: <ClockIcon className="w-6 h-6 text-yellow-500" />,
  Processing: <CogIcon className="w-6 h-6 text-blue-500" />,
  Shipped: <TruckIcon className="w-6 h-6 text-purple-500" />,
  Delivered: <CheckCircleIcon className="w-6 h-6 text-emerald-500" />,
  Cancelled: <XCircleIcon className="w-6 h-6 text-red-500" />,
};

// ------------------------------------------------------

export default function TrackOrderAnimated() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(66); // Start at 66% for Shipped status

  // Handle tracking
  const handleTrack = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        if (orderId.trim() === dummyOrder.id || orderId.trim() === dummyOrder.trackingNumber) {
          setOrder(dummyOrder);
          setProgress(66); // Set to 66% for Shipped status
        } else {
          alert("Order not found. Try using: ALM-2025-001 or TRK-789-456-123");
        }
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!order) return;

    const interval = setInterval(() => {
      const delivery = new Date(order.estimatedDelivery).getTime();
      const diff = delivery - Date.now();

      if (diff <= 0) {
        setTimeLeft("Arriving now!");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Order['status'] }) => {
    const colorMap = {
      Pending: "warning",
      Processing: "primary",
      Shipped: "secondary",
      Delivered: "success",
      Cancelled: "danger"
    };

    return (
      <Badge
        color={colorMap[status] as any}
        variant="flat"
        className="font-bold px-4 py-2 rounded-full text-sm"
      >
        <div className="flex items-center space-x-2">
          {statusIcons[status]}
          <span>{status}</span>
        </div>
      </Badge>
    );
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 overflow-x-hidden">
      {/* Ultra HD Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-20 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-[800px] h-[800px] bg-gradient-to-tr from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,82,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,82,212,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-4">
                <ShieldCheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  ENTERPRISE ORDER TRACKING
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Order Tracking <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Dashboard</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Comprehensive view of your order journey from placement to delivery
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full lg:w-auto">
              <Input
                placeholder="Enter Order ID or Tracking No."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                startContent={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
                className="w-full sm:w-64"
                size="lg"
              />
              <Button
                color="primary"
                onClick={handleTrack}
                disabled={!orderId || loading}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-8"
                size="lg"
              >
                {loading ? <Spinner size="sm" /> : "Track Order"}
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
            Sample IDs: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">ALM-2025-001</span> or <span className="font-mono font-bold text-blue-600 dark:text-blue-400">TRK-789-456-123</span>
          </div>
        </motion.div>

        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Order Overview Card */}
              <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-4xl p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Order Info */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Information</h2>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{order.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tracking No:</span>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{order.trackingNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                          <Chip color={order.priority === "Express" ? "warning" : "default"}>
                            {order.priority}
                          </Chip>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Progress</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {progress}% Complete
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      size="lg"
                      color="primary"
                      className="mb-4"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {statusSteps.map((step, index) => (
                        <div key={step} className="text-center">
                          <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${index * 25 < progress
                              ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                            }`}>
                            {statusIcons[step]}
                          </div>
                          <span className={`text-xs font-medium ${index * 25 < progress
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500 dark:text-gray-400"
                            }`}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Est. Delivery:</span>
                        <span className="font-semibold">{formatDate(order.estimatedDelivery)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Time Remaining:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 animate-pulse">{timeLeft}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Carrier:</span>
                        <span className="font-semibold">{order.carrier}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Order Items */}
                  <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-4xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <ShoppingCartIcon className="w-6 h-6 text-blue-500" />
                        <span>Order Items</span>
                      </h2>
                      <Badge color="primary" variant="flat">
                        {order.items.length} Items
                      </Badge>
                    </div>

                    <div className="space-y-6">
                      {order.items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <TagIcon className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.id}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                                <span className="font-semibold">{item.quantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                  KSh {item.price.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                  KSh {(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                                <Chip size="sm" color={item.deliveryType === "Express" ? "warning" : "default"}>
                                  {item.deliveryType}
                                </Chip>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">VAT:</span>
                                <span className="font-semibold">{item.vat}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                                <span className="font-semibold">{item.weight}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {item.specifications.map((spec, i) => (
                                <Chip key={i} size="sm" variant="flat" color="primary">
                                  {spec}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping & Delivery */}
                  <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-4xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Shipping Address */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                          <MapPinIcon className="w-5 h-5 text-blue-500" />
                          <span>Shipping Address</span>
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Street</div>
                            <div className="font-semibold">{order.shippingAddress.street}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Building/Floor</div>
                            <div className="font-semibold">{order.shippingAddress.building}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">City</div>
                              <div className="font-semibold">{order.shippingAddress.city}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Postal Code</div>
                              <div className="font-semibold">{order.shippingAddress.postalCode}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Landmark</div>
                            <div className="font-semibold">{order.shippingAddress.landmark}</div>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Information */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                          <TruckIcon className="w-5 h-5 text-purple-500" />
                          <span>Delivery Details</span>
                        </h3>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Carrier</div>
                              <div className="font-semibold">{order.carrier}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Tracking No</div>
                              <div className="font-semibold text-blue-600 dark:text-blue-400">{order.carrierTracking}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Warehouse</div>
                            <div className="font-semibold">{order.logistics.warehouse}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Distance</div>
                              <div className="font-semibold">{order.logistics.distance}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Transit Time</div>
                              <div className="font-semibold">{order.logistics.estimatedTransitTime}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Notes */}
                    <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3">Delivery Notes & Instructions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {order.deliveryNotes.map((note, i) => (
                            <div key={i} className="flex items-start space-x-2">
                              <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{note}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          {order.specialInstructions.map((instruction, i) => (
                            <div key={i} className="flex items-start space-x-2">
                              <ClipboardCheckIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{instruction}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Customer Information */}
                  <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-4xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                      <UserIcon className="w-5 h-5 text-blue-500" />
                      <span>Customer Information</span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Customer ID</div>
                        <div className="font-bold text-gray-900 dark:text-white">{order.customer.id}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{order.customer.name}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Company</div>
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <BuildingOfficeIcon className="w-4 h-4" />
                          <span>{order.customer.company}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Customer Type</div>
                          <Badge color="success" variant="flat">
                            {order.customer.customerType}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tax ID</div>
                          <div className="font-mono text-sm">{order.customer.taxId}</div>
                        </div>
                      </div>

                      <Divider />

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{order.customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{order.customer.phone}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Account Manager</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{order.customer.accountManager}</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-4xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                      <CreditCardIcon className="w-5 h-5 text-emerald-500" />
                      <span>Payment Information</span>
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <Badge color={order.payment.status === "Paid" ? "success" : "warning"} variant="flat">
                          {order.payment.status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                          <span className="font-semibold">KSh {calculateSubtotal().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">VAT (16%)</span>
                          <span className="font-semibold">KSh {order.payment.vatAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Discount</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            -KSh {order.payment.discount.toLocaleString()}
                          </span>
                        </div>
                        <Divider />
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-gray-900 dark:text-white">Total Amount</span>
                          <span className="text-blue-600 dark:text-blue-400">
                            KSh {order.payment.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Divider />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                          <span className="font-semibold">{order.payment.method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
                          <span className="font-mono text-sm">{order.payment.transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Invoice Number</span>
                          <span className="font-semibold">{order.payment.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Payment Date</span>
                          <span className="font-semibold">{formatDate(order.payment.paymentDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Information */}
                  <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-4xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                      <TruckIcon className="w-5 h-5 text-purple-500" />
                      <span>Driver Information</span>
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
                          <img
                            src={order.deliveryDriver.photo}
                            alt={order.deliveryDriver.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{order.deliveryDriver.name}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIconSolid
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(order.deliveryDriver.rating)
                                  ? "text-yellow-500"
                                  : "text-gray-300 dark:text-gray-600"
                                  }`}
                              />
                            ))}
                            <span className="text-sm font-bold">{order.deliveryDriver.rating}/5.0</span>
                          </div>
                        </div>
                      </div>

                      <Divider />

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Driver ID</span>
                          <span className="font-semibold">{order.deliveryDriver.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Phone</span>
                          <span className="font-semibold">{order.deliveryDriver.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Vehicle</span>
                          <span className="font-semibold">{order.deliveryDriver.vehicle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">License No.</span>
                          <span className="font-semibold">{order.deliveryDriver.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Deliveries</span>
                          <span className="font-semibold">{order.deliveryDriver.totalDeliveries.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Packaging Information */}
                <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-4xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <PackageIcon className="w-5 h-5 text-amber-500" />
                    <span>Packaging Information</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type</span>
                      <span className="font-semibold">{order.packaging.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Weight</span>
                      <span className="font-semibold">{order.packaging.weight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Dimensions</span>
                      <span className="font-semibold">{order.packaging.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fragile</span>
                      <Badge color={order.packaging.fragile ? "warning" : "success"} variant="flat">
                        {order.packaging.fragile ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Handling Instructions</div>
                      <div className="text-sm">{order.packaging.handling}</div>
                    </div>
                  </div>
                </div>

                {/* Logistics Details */}
                <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-4xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <DatabaseIcon className="w-5 h-5 text-cyan-500" />
                    <span>Logistics Details</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Route ID</span>
                      <span className="font-semibold">{order.logistics.routeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Transit Stops</span>
                      <span className="font-semibold">{order.logistics.transitStops}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Dispatch Time</span>
                      <span className="font-semibold">{formatDate(order.logistics.dispatchTime)}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Location</div>
                      <div className="flex items-center space-x-2">
                        <LocationMarkerIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Lat: {order.deliveryDriver.currentLocation[0]}, Lng: {order.deliveryDriver.currentLocation[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Metadata */}
                <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-4xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <ChartBarIcon className="w-5 h-5 text-purple-500" />
                    <span>Order Metadata</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Order Date</span>
                      <span className="font-semibold">{formatDate(order.orderDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Created At</span>
                      <span className="font-semibold">{formatDate(order.metadata.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                      <span className="font-semibold">{formatDate(order.metadata.updatedAt)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">IP Address</div>
                        <div className="font-mono text-sm">{order.metadata.ipAddress}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Device</div>
                        <div className="text-sm">{order.metadata.device}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  color="primary"
                  variant="solid"
                  className="bg-gradient-to-r from-blue-600 to-cyan-500"
                  startContent={<ArrowDownTrayIcon className="w-5 h-5" />}
                >
                  Download Invoice
                </Button>
                <Button
                  color="secondary"
                  variant="flat"
                  startContent={<ReceiptRefundIcon className="w-5 h-5" />}
                >
                  Request Refund
                </Button>
                <Button
                  color="warning"
                  variant="flat"
                  startContent={<ExclamationTriangleIcon className="w-5 h-5" />}
                >
                  Report Issue
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  startContent={<CheckCircleIcon className="w-5 h-5" />}
                >
                  Mark as Received
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Missing icon components
function CogIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

function LocationMarkerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function ClipboardCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
    </svg>
  );
}