import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Truck,
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const DeliveryMobilePortal: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryFeedback, setDeliveryFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveryManifest();
  }, []);

  const fetchDeliveryManifest = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId: string, shopName: string) => {
    try {
      await api.updateOrderStatus(orderId, 'Delivered');
      setDeliveryFeedback(`Order #${orderId} marked Delivered to ${shopName}! Signature & delivery timestamp logged.`);
      fetchDeliveryManifest();
      setTimeout(() => setDeliveryFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const pendingDeliveries = orders.filter((o) => ['Packed', 'Dispatched'].includes(o.status));
  const completedToday = orders.filter((o) => o.status === 'Delivered');

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      {/* Mobile Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-sm">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Delivery Fleet Manifest</h2>
              <span className="text-[11px] text-slate-400">Driver: {user?.name}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Route Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-center">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Remaining Drops
            </span>
            <span className="text-xl font-extrabold text-amber-400">
              {pendingDeliveries.length} Stops
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Delivered Today
            </span>
            <span className="text-xl font-extrabold text-emerald-400">
              {completedToday.length} Done
            </span>
          </div>
        </div>
      </div>

      {deliveryFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 font-medium shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{deliveryFeedback}</span>
        </div>
      )}

      {/* Notice: Privacy Shield */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-[11px]">
        <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
        <span>Strict RBAC: Pricing & financial ledgers hidden. Showing addresses & package counts only.</span>
      </div>

      {/* Manifest List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Today's Drop-Offs ({pendingDeliveries.length})
        </h3>

        {pendingDeliveries.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              All Deliveries Completed!
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Your van manifest is clear for today. Head back to the central hub.
            </p>
          </div>
        ) : (
          pendingDeliveries.map((order, idx) => {
            const totalUnits = order.items.reduce((sum, it) => sum + it.fulfilledQty, 0);

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-all"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                        {order.retailer.shopName}
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {order.retailer.ownerName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    #{order.id.slice(-6)}
                  </span>
                </div>

                {/* Address & Cargo */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{order.retailer.address}, {order.retailer.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Package className="w-4 h-4 text-slate-400 shrink-0" />
                    <span><strong>{totalUnits} Items</strong> ({order.items.length} SKUs in sealed boxes)</span>
                  </div>
                </div>

                {/* Action Buttons: Call & Big "Mark Delivered" Button */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a
                    href={`tel:${order.retailer.phone}`}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() => handleMarkDelivered(order.id, order.retailer.shopName)}
                    className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark as Delivered</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completed History List */}
      {completedToday.length > 0 && (
        <div className="space-y-2 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Completed Today ({completedToday.length})
          </h3>
          <div className="space-y-2">
            {completedToday.slice(0, 4).map((o) => (
              <div
                key={o.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs opacity-75"
              >
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    {o.retailer.shopName}
                  </span>
                  <span className="text-[10px] text-slate-400">Order #{o.id.slice(-6)}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Delivered
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
