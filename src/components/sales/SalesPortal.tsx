import React, { useState, useEffect } from 'react';
import { Retailer, Product, Order } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  UserCheck,
  ShoppingBag,
  Percent,
  Plus,
  Search,
  CheckCircle2,
  X,
  Store,
  DollarSign,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export const SalesPortal: React.FC = () => {
  const { user } = useAuth();
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myStats, setMyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Field Order Booking Modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedRetailerId, setSelectedRetailerId] = useState('');
  const [cart, setCart] = useState<{ productId: string; qty: number }[]>([]);
  const [orderNotes, setOrderNotes] = useState('Booked during field visit by Sales Executive');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      const [rRes, pRes, oRes, statsRes] = await Promise.all([
        api.getRetailers(),
        api.getProducts(),
        api.getOrders(),
        api.getMyStats(),
      ]);
      setRetailers(rRes);
      setProducts(pRes);
      setOrders(oRes);
      setMyStats(statsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { productId, qty: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCart((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty } : i)));
    }
  };

  const handleBookOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRetailerId || cart.length === 0) return;
    setOrderError(null);
    setIsSubmittingOrder(true);

    try {
      const res = await api.createOrder({
        retailerId: selectedRetailerId,
        items: cart,
        notes: orderNotes,
      });

      setOrderFeedback(`Order #${res.id} successfully created on behalf of ${res.retailer.shopName}!`);
      setCart([]);
      setSelectedRetailerId('');
      loadSalesData();

      setTimeout(() => {
        setShowOrderModal(false);
        setOrderFeedback(null);
      }, 2500);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to book order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const currentRetailer = retailers.find((r) => r.id === selectedRetailerId);
  const cartTotal = cart.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.productId);
    return sum + (prod ? prod.price * item.qty : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600">
              <UserCheck className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Sales Executive Field Portal & Commission
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800 dark:text-slate-200">{user?.name}</strong> ({user?.staffProfile?.zone || 'North'} Zone). Book orders during store visits and track performance incentives.
          </p>
        </div>

        <button
          onClick={() => {
            setShowOrderModal(true);
            setOrderError(null);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Book Field Order</span>
        </button>
      </div>

      {/* Commission & Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Commission Rate
          </span>
          <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
            {myStats?.commissionPercent || 2.5}%
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">On gross closed sales</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Orders Closed
          </span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {myStats?.ordersPlaced || 0} Orders
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">In your assigned territory</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Sales Value
          </span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            ₹{Math.round(myStats?.totalSales || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Fulfilled order volume</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            Incentive Earned
          </span>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            ₹{Math.round(myStats?.commissionEarned || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Credited this payroll cycle</span>
        </div>
      </div>

      {/* Two Columns: Assigned Retailers & Recent Orders Placed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retailers in Zone */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Assigned Retail Stores ({retailers.length})
              </h3>
              <p className="text-[11px] text-slate-500">Retailers in your assigned territory</p>
            </div>
          </div>

          <div className="space-y-3">
            {retailers.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{r.shopName}</span>
                  <span className="text-[11px] text-slate-400">
                    {r.ownerName} &bull; {r.phone}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={r.tag} type="tag" />
                    <span className="text-[10px] text-slate-500">
                      Bal: ₹{r.outstandingBalance.toLocaleString()} / Limit: ₹{r.creditLimit.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedRetailerId(r.id);
                    setShowOrderModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 font-semibold text-[11px] transition-colors shrink-0"
                >
                  Book Order
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Booked */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Orders in Pipeline</h3>
              <p className="text-[11px] text-slate-500">Tracking progress of orders placed in your zone</p>
            </div>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">#{o.id}</span>
                    <StatusBadge status={o.status} type="order" />
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {o.retailer.shopName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{o.totalAmount.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Book Field Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-600" />
                  Take Field Order (On Behalf of Retailer)
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {orderError && (
                <div className="p-3 mb-3 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 text-xs border border-rose-200 dark:border-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{orderError}</span>
                </div>
              )}

              {orderFeedback && (
                <div className="p-3 mb-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{orderFeedback}</span>
                </div>
              )}

              <form onSubmit={handleBookOrder} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Target Retailer
                  </label>
                  <select
                    required
                    value={selectedRetailerId}
                    onChange={(e) => setSelectedRetailerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">-- Choose Retailer in Your Zone --</option>
                    {retailers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.shopName} (Credit Avail: ₹{Math.max(0, r.creditLimit - r.outstandingBalance).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {currentRetailer && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Credit Limit Status:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        Outstanding: ₹{currentRetailer.outstandingBalance.toLocaleString()} / Limit: ₹{currentRetailer.creditLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Cart Subtotal:</span>
                      <span className="font-bold text-brand-600 text-sm">₹{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Catalog Quick Picker */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Catalog Items for Order:
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/60">
                    {products.slice(0, 10).map((p) => {
                      const itemInCart = cart.find((i) => i.productId === p.id);
                      return (
                        <div
                          key={p.id}
                          className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">{p.name}</span>
                            <span className="text-[10px] text-slate-400">
                              ₹{p.price} &bull; Stock: {p.stockQty} {p.stockQty === 0 && '(Backorder Item)'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {itemInCart ? (
                              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(p.id, itemInCart.qty - 1)}
                                  className="w-5 h-5 rounded bg-white dark:bg-slate-700 font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="font-bold px-1.5">{itemInCart.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(p.id, itemInCart.qty + 1)}
                                  className="w-5 h-5 rounded bg-white dark:bg-slate-700 font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddToCart(p.id)}
                                className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 font-semibold text-[11px]"
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Field Notes
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOrder || cart.length === 0 || !selectedRetailerId}
                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-xs disabled:opacity-50"
                  >
                    {isSubmittingOrder ? 'Verifying Credit & Booking...' : `Book Order (₹${cartTotal.toLocaleString()})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
