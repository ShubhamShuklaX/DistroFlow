import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Activity,
} from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [roleFilter]);

  const fetchLogs = async () => {
    try {
      const data = await api.getAuditLogs({
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    return (
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('PACKED')) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    if (action.includes('DELIVERED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    if (action.includes('PAYMENT')) return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300';
    if (action.includes('ORDER_PLACED')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    if (action.includes('STOCK')) return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300';
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Enterprise Audit Trail & Security Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log recording every order creation, stock adjustment, dispatch update, and payment entry with author attribution.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by user, order ID, or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'distributor', 'sales_exec', 'warehouse_manager', 'accountant', 'delivery_person'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 transition-colors ${
                roleFilter === r
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {r === 'all' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Authorized Actor</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Action Type</th>
                  <th className="py-3 px-3">Target Entity</th>
                  <th className="py-3 px-4">Action Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {log.userName}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium capitalize">
                        {log.userRole.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {log.entity}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
