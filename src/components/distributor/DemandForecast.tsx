import React, { useState, useEffect } from 'react';
import { DemandForecastItem } from '../../types';
import { api } from '../../services/api';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Package,
  Layers,
  Search,
  ShoppingCart,
  CheckCircle2,
} from 'lucide-react';

export const DemandForecast: React.FC = () => {
  const [forecast, setForecast] = useState<DemandForecastItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderedNotice, setOrderedNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      const res = await api.getDemandForecast();
      setForecast(res.forecast || []);
      setSummary(res.summary || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProcurementPO = (item: DemandForecastItem) => {
    setOrderedNotice(`Inbound Purchase Order draft created for ${item.recommendedReorderQty} units of ${item.name} (${item.sku}).`);
    setTimeout(() => setOrderedNotice(null), 3500);
  };

  const filtered = forecast.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.sku.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Running AI demand forecasting model...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              AI Demand Forecast & Procurement Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predictive inventory planning based on 30-day order item velocity, safety stock buffers, and projected monthly run-rates.
          </p>
        </div>
      </div>

      {orderedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{orderedNotice}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Products Analyzed
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {summary.productsAnalyzed} SKUs
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">Full active catalog</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
              Critical Reorder Alerts
            </span>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {summary.criticalStockCount} SKUs
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">Stock depleted / 0 units</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider block mb-1">
              Recommended Units
            </span>
            <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
              {summary.totalReorderUnitsRecommended} Units
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">To maintain 45-day runway</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Est. Working Capital
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              ₹{(summary.estimatedCapitalRequired / 100000).toFixed(2)}L
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">Wholesale purchase capital</span>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search forecast by SKU, name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Forecast Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Product SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">Current Stock</th>
                <th className="py-3 px-3 text-center">Past 30d Velocity</th>
                <th className="py-3 px-3 text-center">Forecast Next Month</th>
                <th className="py-3 px-3 text-center">Recommended PO</th>
                <th className="py-3 px-3 text-right">Est. Cost</th>
                <th className="py-3 px-3 text-center">Urgency</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">{item.sku}</span>
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{item.category}</td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-bold ${
                        item.currentStock === 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : item.currentStock <= item.reorderThreshold
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.currentStock}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center font-medium text-slate-600 dark:text-slate-300">
                    {item.historicalSales30d} units
                  </td>

                  <td className="py-3 px-3 text-center font-semibold text-brand-600 dark:text-brand-400">
                    ~{item.forecastedDemandNextMonth} units
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">
                    {item.recommendedReorderQty > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        +{item.recommendedReorderQty} units
                      </span>
                    ) : (
                      <span className="text-slate-400">Sufficient</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    ₹{item.estimatedCost.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        item.urgency.startsWith('Critical')
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                          : item.urgency.startsWith('High')
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {item.recommendedReorderQty > 0 && (
                      <button
                        onClick={() => handleCreateProcurementPO(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-[11px] transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Create PO</span>
                      </button>
                    )}
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
