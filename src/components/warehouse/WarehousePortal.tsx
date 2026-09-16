import React, { useState, useEffect } from 'react';
import { Order, Product } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Warehouse,
  CheckCircle2,
  Package,
  AlertTriangle,
  ArrowUpDown,
  Search,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';

export const WarehousePortal: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [packedSuccess, setPackedSuccess] = useState<string | null>(null);

  // Quick Restock Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(50);
  const [isRestocking, setIsRestocking] = useState(false);

  useEffect(() => {
    loadWarehouseData();
  }, []);

  const loadWarehouseData = async () => {
    try {
      const [ordersRes, prodsRes] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
      ]);
      setOrders(ordersRes);
      setProducts(prodsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPacked = async (orderId: string) => {
    try {
      await api.updateOrderStatus(orderId, 'Packed');
      setPackedSuccess(`Order #${orderId} marked Packed & tagged to ${user?.name}. Notification sent to delivery fleet!`);
      loadWarehouseData();
      setTimeout(() => setPackedSuccess(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Permission denied');
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsRestocking(true);

    try {
      await api.adjustStock(selectedProduct.id, {
        quantity: Number(restockQty),
        mode: 'add',
        notes: 'Warehouse inbound intake',
      });
      setSelectedProduct(null);
      loadWarehouseData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRestocking(false);
    }
  };

  // Orders waiting for warehouse picking & packing
  const packQueue = orders.filter((o) => ['Placed', 'Confirmed'].includes(o.status));
  const packedReadyForFleet = orders.filter((o) => o.status === 'Packed');
  const lowStockProducts = products.filter((p) => p.stockQty <= p.reorderThreshold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Warehouse className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Warehouse Picking, Packing & Inventory Bay
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800 dark:text-slate-200">{user?.name}</strong> (Warehouse Lead). Verify pick lists, mark orders packed, and replenish stock bays.
          </p>
        </div>
      </div>

      {packedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{packedSuccess}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
            Pack Queue (Pending)
          </span>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {packQueue.length} Orders
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting picking & carton boxing</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
            Packed & Ready for Fleet
          </span>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {packedReadyForFleet.length} Orders
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Ready at dispatch loading bay</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
            Low Stock / Zero Stock SKUs
          </span>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
            {lowStockProducts.length} SKUs
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Requires inbound pallet intake</span>
        </div>
      </div>

      {/* Two Columns: Pack Queue & Low Stock Quick Restock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pack Queue (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Active Pack Queue ({packQueue.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Pick items from bays and update status to "Packed" for fleet assignment
              </p>
            </div>
          </div>

          {packQueue.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No orders waiting in pack queue. Great job!
            </div>
          ) : (
            <div className="space-y-3">
              {packQueue.map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        #{o.id}
                      </span>
                      <StatusBadge status={o.status} type="order" />
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {o.retailer.zone} Zone
                      </span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {o.retailer.shopName}
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {o.items.map((it) => (
                        <span
                          key={it.id}
                          className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300"
                        >
                          {it.product?.name} ({it.fulfilledQty} units)
                          {it.backorderedQty > 0 && (
                            <strong className="text-rose-500 ml-1">
                              +{it.backorderedQty} backordered
                            </strong>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                    <button
                      onClick={() => handleMarkPacked(o.id)}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Packed</span>
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Ties handled_by to your ID
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Stock Bay Restock Tool (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Low-Stock Alerts ({lowStockProducts.length})
              </h3>
              <p className="text-[11px] text-slate-500">Items below minimum bay buffer</p>
            </div>
          </div>

          <div className="space-y-3">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[180px]">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {p.sku} &bull; Loc: {p.warehouseLocation}
                  </span>
                  <span
                    className={`text-[11px] font-bold ${
                      p.stockQty === 0 ? 'text-rose-600' : 'text-amber-600'
                    }`}
                  >
                    Stock: {p.stockQty} / Min: {p.reorderThreshold}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedProduct(p)}
                  className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 font-semibold text-[11px] shrink-0"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Restock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Intake Stock: {selectedProduct.name}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Received Quantity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm font-bold"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Bay Location: {selectedProduct.warehouseLocation}. Updating will auto-notify pending backorders.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRestocking}
                  className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-semibold"
                >
                  {isRestocking ? 'Restocking...' : 'Confirm Intake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
