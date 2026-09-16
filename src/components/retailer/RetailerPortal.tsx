import React, { useState, useEffect } from 'react';
import { Product, Order, Retailer } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Store,
  ShoppingCart,
  Package,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  CreditCard,
  Search,
  X,
  Printer,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const RetailerPortal: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [retailerProfile, setRetailerProfile] = useState<Retailer | null>(null);
  const [loading, setLoading] = useState(true);

  // Tabs: 'catalog' | 'orders' | 'statement'
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'statement'>('catalog');

  // Slide-out Cart State
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Selected Order for Tracking & Invoice
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadRetailerData();
  }, []);

  const loadRetailerData = async () => {
    try {
      const [prods, ordersRes, retailersRes] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
        api.getRetailers(),
      ]);
      setProducts(prods);
      setMyOrders(ordersRes);

      // Find own profile
      if (retailersRes.length > 0) {
        setRetailerProfile(retailersRes[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setShowCart(true);
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, qty } : i))
      );
    }
  };

  const cartSubtotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const cartTax = Math.round(
    cart.reduce((sum, i) => sum + (i.product.price * i.qty * i.product.taxPercent) / 100, 0)
  );
  const cartTotal = cartSubtotal + cartTax;

  const currentOutstanding = retailerProfile?.outstandingBalance || 0;
  const creditLimit = retailerProfile?.creditLimit || 200000;
  const projectedOutstanding = currentOutstanding + cartTotal;
  const isCreditExceeded = projectedOutstanding > creditLimit;

  const handleCheckout = async () => {
    setCheckoutError(null);
    setIsPlacingOrder(true);

    try {
      const itemsPayload = cart.map((i) => ({
        productId: i.product.id,
        qty: i.qty,
      }));

      const newOrder = await api.createOrder({
        retailerId: retailerProfile?.id,
        items: itemsPayload,
        notes: 'Placed via B2B Retailer Web Storefront',
      });

      setOrderSuccess(newOrder);
      setCart([]);
      setShowCart(false);
      loadRetailerData();
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleReorder = (order: Order) => {
    const newItems = order.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId) || (it.product as Product);
      return {
        product: prod,
        qty: it.qty,
      };
    });
    setCart(newItems);
    setShowCart(true);
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Retailer Storefront Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-lg">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  {retailerProfile?.shopName || 'Apex Mart & Provisions'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30">
                  {retailerProfile?.tag || 'Premium'} Partner
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Proprietor: {retailerProfile?.ownerName || 'Rajesh Gupta'} &bull; GSTIN: {retailerProfile?.gstNo} &bull; {retailerProfile?.zone} Zone
              </p>
            </div>
          </div>

          {/* Credit Limit Meter */}
          <div className="bg-slate-800/80 rounded-xl p-3 px-4 border border-slate-700/80 min-w-[240px]">
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Credit Line</span>
              <span className="font-bold text-white">
                ₹{currentOutstanding.toLocaleString()} / ₹{creditLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full ${
                  isCreditExceeded ? 'bg-rose-500' : 'bg-brand-500'
                }`}
                style={{ width: `${Math.min(100, (currentOutstanding / creditLimit) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Available Cushion:</span>
              <span className="text-emerald-400 font-bold">
                ₹{Math.max(0, creditLimit - currentOutstanding).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Cart Trigger */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Browse Wholesale Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            My Orders & Tracking ({myOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('statement')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'statement'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Ledger & Payment Statement
          </button>
        </div>

        {/* View Cart Button */}
        <button
          onClick={() => setShowCart(true)}
          className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold shadow-sm transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart</span>
          {cart.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-brand-600 text-white text-[10px] font-bold">
              {cart.reduce((sum, i) => sum + i.qty, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Order Success Banner */}
      {orderSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">
                Order #{orderSuccess.id} Placed Successfully!
              </h4>
              <p className="mt-1 text-[11px] leading-relaxed">
                Total ₹{orderSuccess.totalAmount.toLocaleString()} billed to your trade account.
                {orderSuccess.hasBackorder && (
                  <strong className="block text-amber-700 dark:text-amber-400 mt-0.5">
                    Note: Your order contains items placed as Pre-orders / Backorders. They will auto-fulfill as soon as inbound shipments arrive.
                  </strong>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOrderSuccess(null)}
            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: Wholesale Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search & Category Pills */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, brands, SKUs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stockQty === 0;

              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-brand-500/60 transition-all group"
                >
                  <div>
                    {/* Badge row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {p.sku}
                      </span>
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                          <AlertTriangle className="w-3 h-3" />
                          Pre-Order Backorder
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                          {p.stockQty} in stock
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2">
                      {p.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {p.category} &bull; Unit: {p.unit}
                    </span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ₹{p.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        +{p.taxPercent}% GST
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isOutOfStock
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                          : 'bg-brand-600 hover:bg-brand-500 text-white shadow-xs'
                      }`}
                    >
                      {isOutOfStock ? 'Pre-Order' : '+ Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Orders & Tracking Timeline */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-3">Items Summary</th>
                    <th className="py-3 px-3 text-right">Total Amount</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Live Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {myOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">
                          #{o.id}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-800 dark:text-slate-200 block font-medium">
                          {o.items.length} Products
                        </span>
                        {o.hasBackorder && (
                          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Pre-Order Units Included
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        ₹{o.totalAmount.toLocaleString()}
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={o.paymentStatus} type="payment" />
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={o.status} type="order" />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReorder(o)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px]"
                            title="Re-add all items to cart"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reorder</span>
                          </button>
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            <span>Invoice</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Statement & Ledger */}
      {activeTab === 'statement' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Account Statement & Trade Credit Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Itemized log of debits (orders) and credits (payments) recorded against your store
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Printer className="w-4 h-4" />
              <span>Print Statement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-1">Total Credit Approved</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                ₹{creditLimit.toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-1">Current Outstanding Balance</span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                ₹{currentOutstanding.toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-400 block mb-1">Available Order Line</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                ₹{Math.max(0, creditLimit - currentOutstanding).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Transactions
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {myOrders.slice(0, 6).map((ord) => (
                <div key={ord.id} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      Order #{ord.id} - Goods Invoiced
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString()} &bull; Status: {ord.paymentStatus}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    Debit ₹{ord.totalAmount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Cart Drawer with Live Credit Check */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-brand-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Review Wholesale Order ({cart.reduce((sum, i) => sum + i.qty, 0)} Units)
                  </h3>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {checkoutError && (
                <div className="p-3 mb-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Credit Limit Verification Box */}
              <div
                className={`p-3.5 rounded-xl border mb-4 text-xs ${
                  isCreditExceeded
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex justify-between font-semibold mb-1">
                  <span>Credit Policy Check:</span>
                  <span>
                    {isCreditExceeded ? (
                      <strong className="text-rose-600">Credit Limit Exceeded!</strong>
                    ) : (
                      <strong className="text-emerald-600">Approved for Dispatch</strong>
                    )}
                  </span>
                </div>
                <div className="space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Current Outstanding:</span>
                    <span>₹{currentOutstanding.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Order Total:</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Projected Debt:</span>
                    <span className={isCreditExceeded ? 'text-rose-600' : ''}>
                      ₹{projectedOutstanding.toLocaleString()} / Limit ₹{creditLimit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 mb-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Your wholesale cart is empty. Add products from the catalog.
                  </div>
                ) : (
                  cart.map((item) => {
                    const isOutOfStock = item.product.stockQty === 0;

                    return (
                      <div
                        key={item.product.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {item.product.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ₹{item.product.price} each
                          </span>
                          {isOutOfStock && (
                            <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                              Will be placed as Pre-Order / Backorder
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                            <button
                              onClick={() => updateCartQty(item.product.id, item.qty - 1)}
                              className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 font-bold"
                            >
                              -
                            </button>
                            <span className="font-bold px-1.5">{item.qty}</span>
                            <button
                              onClick={() => updateCartQty(item.product.id, item.qty + 1)}
                              className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white w-14 text-right">
                            ₹{(item.product.price * item.qty).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cart Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ₹{cartSubtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Tax:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ₹{cartTax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Grand Total:</span>
                  <span className="text-brand-600">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder || cart.length === 0 || isCreditExceeded}
                className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all ${
                  isCreditExceeded
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-500 text-white active:scale-98'
                }`}
              >
                {isPlacingOrder
                  ? 'Verifying Order & Backorder Allocation...'
                  : isCreditExceeded
                  ? 'Blocked by Credit Limit (Clear Dues to Order)'
                  : `Confirm Order (₹${cartTotal.toLocaleString()})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-mono text-brand-600 uppercase font-bold">
                  Order Statement
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Invoice #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 text-[10px] block">Pipeline Status</span>
                  <StatusBadge status={selectedOrder.status} type="order" />
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Payment Status</span>
                  <StatusBadge status={selectedOrder.paymentStatus} type="payment" />
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-2.5 flex justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {it.product?.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Qty: {it.qty} (Fulfilled: {it.fulfilledQty}, Backorder: {it.backorderedQty})
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{it.totalPrice.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2">
                <span>Total Amount:</span>
                <span>₹{selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 mt-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
