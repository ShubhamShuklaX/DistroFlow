import React, { useState, useEffect } from 'react';
import { AnalyticsData } from '../../types';
import { api } from '../../services/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Package,
  Clock,
  AlertCircle,
  CreditCard,
  Building2,
  Trophy,
  ArrowUpRight,
} from 'lucide-react';

export const OverviewAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getDashboardAnalytics();
      setData(res);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading analytics engine...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        No analytics data available.
      </div>
    );
  }

  const { kpis, revenueTrend, categoryDistribution, topProducts, topRetailers, zoneHeatmap, staffLeaderboard } = data;

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            ₹{(kpis.totalRevenue / 100000).toFixed(2)}L
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-1 font-medium">
            <ArrowUpRight className="w-3 h-3" /> +14.8% vs last month
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Orders</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{kpis.totalOrders}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Past 90 days</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Dispatch</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{kpis.pendingDispatchCount}</p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block font-medium">
            In warehouse/fleet
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Backordered</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{kpis.backorderOrdersCount}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting replenishment</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Receivables</span>
            <CreditCard className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            ₹{(kpis.totalOutstandingDebt / 100000).toFixed(2)}L
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Across 15 retailers</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Low Stock SKUs</span>
            <Building2 className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{kpis.lowStockCount}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Below threshold</span>
        </div>
      </div>

      {/* Main Charts: Revenue Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue & Order Volume Trend</h3>
              <p className="text-[11px] text-slate-500">Monthly fulfilled order volume over the last 6 months</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              INR (₹)
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Product Category Breakdown</h3>
            <p className="text-[11px] text-slate-500">Share of revenue by catalog category</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => `₹${Number(val).toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2 text-[11px] text-slate-600 dark:text-slate-400">
            {categoryDistribution.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Columns: Top Selling Products & Zone Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Velocity Products</h3>
              <p className="text-[11px] text-slate-500">Highest grossing SKUs across retailers</p>
            </div>
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div
                key={p.sku}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {i + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      SKU: {p.sku} &bull; {p.qty} units sold
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{p.revenue.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400">Stock: {p.stock} units</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Regional Supply Zone Performance</h3>
              <p className="text-[11px] text-slate-500">Revenue and order volume mapped by territory</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneHeatmap} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="zone" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Zone Revenue']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff Leaderboard Matrix */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Staff Accountability & Performance Leaderboard
              </h3>
              <p className="text-[11px] text-slate-500">
                Live performance tracking by department (tied to audit trails and commission engine)
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Staff Member</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3 text-right">Orders Handled</th>
                <th className="py-2.5 px-3 text-right">Value / Metric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {staffLeaderboard.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{s.name}</td>
                  <td className="py-3 px-3 text-slate-500 capitalize">{s.role.replace('_', ' ')}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {s.zone}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    {s.role === 'sales_exec' && `${s.ordersPlaced} Closed`}
                    {s.role === 'warehouse_manager' && `${s.ordersPacked} Packed`}
                    {s.role === 'delivery_person' && `${s.ordersDelivered} Delivered`}
                    {s.role === 'accountant' && `${s.paymentsCollected > 0 ? 'Active' : 'Audited'}`}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                    {s.role === 'sales_exec' && `₹${s.salesValue.toLocaleString()}`}
                    {s.role === 'accountant' && `₹${s.paymentsCollected.toLocaleString()} Recovered`}
                    {s.role === 'warehouse_manager' && 'Zero Picking Discrepancy'}
                    {s.role === 'delivery_person' && '100% On-Time Fulfillment'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
