import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  X,
  Printer,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const OrderPipeline: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'backorders'>('all');

  // Selected Order for Invoice / Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, ...updated } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Status transition denied by RBAC gate');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.retailer.shopName.toLowerCase().includes(search.toLowerCase()) ||
      o.retailer.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      o.retailer.zone.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesTab = activeTab === 'all' || (activeTab === 'backorders' && o.hasBackorder);

    return matchesSearch && matchesStatus && matchesTab;
  });

  const backorderCount = orders.filter((o) => o.hasBackorder).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Order Fulfillment Pipeline & Backorders
          </h2>
          <p className="text-xs text-slate-500">
            Stage-owned supply chain: Placed &rarr; Confirmed &rarr; Packed (Warehouse) &rarr; Dispatched &rarr; Delivered.
          </p>
        </div>

        {/* Tab switch between All Orders and Backorders */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('backorders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'backorders'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Backorders Queue ({backorderCount})</span>
          </button>
        </div>
      </div>

      {/* Stage Progression Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {[
          { label: 'Placed', count: orders.filter((o) => o.status === 'Placed').length, desc: 'Created by Retailer / Sales' },
          { label: 'Confirmed', count: orders.filter((o) => o.status === 'Confirmed').length, desc: 'Credit Approved' },
          { label: 'Packed', count: orders.filter((o) => o.status === 'Packed').length, desc: 'Warehouse Bay Ready' },
          { label: 'Dispatched', count: orders.filter((o) => o.status === 'Dispatched').length, desc: 'Fleet Transit' },
          { label: 'Delivered', count: orders.filter((o) => o.status === 'Delivered').length, desc: 'Completed & Signed' },
        ].map((stage) => (
          <button
            key={stage.label}
            onClick={() => setStatusFilter(statusFilter === stage.label ? 'all' : stage.label)}
            className={`p-3 rounded-xl border text-left transition-all ${
              statusFilter === stage.label
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{stage.label}</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">{stage.count}</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">{stage.desc}</p>
          </button>
        ))}
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, shop name, zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              Clear Filter ({statusFilter})
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-3">Retailer & Zone</th>
                <th className="py-3 px-3">Items / Backorders</th>
                <th className="py-3 px-3 text-right">Order Value</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Pipeline Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredOrders.map((o) => {
                const totalUnits = o.items.reduce((sum, it) => sum + it.qty, 0);
                const backorderedUnits = o.items.reduce((sum, it) => sum + it.backorderedQty, 0);

                return (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="font-mono font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 text-left block"
                      >
                        #{o.id}
                      </button>
                      <span className="text-[10px] text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {o.retailer.shopName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {o.retailer.zone} Zone &bull; {o.retailer.city}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-700 dark:text-slate-300">
                        {o.items.length} SKUs ({totalUnits} units)
                      </span>
                      {o.hasBackorder && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          {backorderedUnits} units backordered
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Invoice & Details"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice & Stage Progression Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col justify-between p-6">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-600 font-semibold">
                    Tax Invoice & Fulfillment Pipeline
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Order #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pipeline Stage Controller */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 mb-5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Update Pipeline Status (RBAC Controlled):
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s as OrderStatus)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedOrder.status === s
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500'
                      }`}
                    >
                      Mark as {s}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Warehouse Manager packs &bull; Delivery Person marks Dispatched & Delivered &bull; Distributor oversees all.
                  </span>
                </div>
              </div>

              {/* Retailer & Invoice Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                    Billed & Shipped To:
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.retailer.shopName}</p>
                  <p>{selectedOrder.retailer.ownerName} &bull; {selectedOrder.retailer.phone}</p>
                  <p className="text-slate-500">{selectedOrder.retailer.address}, {selectedOrder.retailer.city}</p>
                  <p className="font-mono text-[11px] text-slate-500">GSTIN: {selectedOrder.retailer.gstNo}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                    Payment & Accounting:
                  </span>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={selectedOrder.paymentStatus} type="payment" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{selectedOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Paid: ₹{selectedOrder.paidAmount.toLocaleString()}</p>
                  <p className="text-slate-500 text-[11px]">
                    Balance Due: ₹{(selectedOrder.totalAmount - selectedOrder.paidAmount).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Order Items List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3 text-center">Ordered</th>
                      <th className="py-2.5 px-3 text-center">Fulfilled</th>
                      <th className="py-2.5 px-3 text-center">Backordered</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {selectedOrder.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {it.product?.name || 'Product'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            SKU: {it.product?.sku}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                          {it.qty}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-emerald-600">
                          {it.fulfilledQty}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold">
                          {it.backorderedQty > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded font-bold">
                              {it.backorderedQty} backordered
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                          ₹{it.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          ₹{it.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation breakdown */}
              <div className="space-y-1.5 text-xs text-right pr-2">
                <div className="text-slate-500">
                  Subtotal: <span className="font-medium text-slate-900 dark:text-white">₹{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="text-slate-500">
                  Applicable GST: <span className="font-medium text-slate-900 dark:text-white">₹{selectedOrder.taxAmount.toLocaleString()}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                  Grand Total: ₹{selectedOrder.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold"
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
