import React, { useState, useEffect } from 'react';
import { Payment } from '../../types';
import { api } from '../../services/api';
import {
  CreditCard,
  Plus,
  AlertTriangle,
  Clock,
  Send,
  CheckCircle2,
  X,
  Search,
  Check,
} from 'lucide-react';

export const PaymentsLedger: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [agingData, setAgingData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'aging' | 'history'>('aging');

  // Record Payment Modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedRetailerId, setSelectedRetailerId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(25000);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [refNo, setRefNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reminder feedback
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, agingRes] = await Promise.all([
        api.getPayments(),
        api.getAgingReport(),
      ]);
      setPayments(paymentsRes);
      setAgingData(agingRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRetailerId || !paymentAmount) return;
    setIsSubmitting(true);

    try {
      await api.recordPayment({
        retailerId: selectedRetailerId,
        amount: Number(paymentAmount),
        mode: paymentMode,
        referenceNo: refNo,
      });

      setShowRecordModal(false);
      setSelectedRetailerId('');
      setPaymentAmount(25000);
      setRefNo('');
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendReminder = async (retailerId: string, shopName: string) => {
    try {
      await api.sendPaymentReminder(retailerId);
      setReminderNotice(`Automated payment statement reminder dispatched to ${shopName}!`);
      setTimeout(() => setReminderNotice(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading ledger and aging engine...</div>;
  }

  const summary = agingData?.summary || {
    current: 0,
    days31to60: 0,
    days61to90: 0,
    days90Plus: 0,
    totalOutstanding: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Payments, Collections & Aging Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Accountant's control center: 0-90+ days aging buckets, UPI/bank reconciliation, and credit risk mitigation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRecordModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment Entry</span>
          </button>
        </div>
      </div>

      {reminderNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{reminderNotice}</span>
        </div>
      )}

      {/* Aging Analysis Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Receivables
          </span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            ₹{summary.totalOutstanding.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Active debt ledger</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            Current (0-30 Days)
          </span>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            ₹{summary.current.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Within credit grace</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
            31 - 60 Days
          </span>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            ₹{summary.days31to60.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">First follow-up phase</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1">
            61 - 90 Days
          </span>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            ₹{summary.days61to90.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Escalated collection</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
            90+ Days (High Risk)
          </span>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
            ₹{summary.days90Plus.toLocaleString()}
          </p>
          <span className="text-[10px] text-rose-500 mt-1 block font-medium">Order freeze trigger</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('aging')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'aging'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Accounts Aging Schedule
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'history'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Recent Transactions Ledger ({payments.length})
        </button>
      </div>

      {activeTab === 'aging' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Retailer Store</th>
                  <th className="py-3 px-3">Zone</th>
                  <th className="py-3 px-3 text-right">Total Outstanding</th>
                  <th className="py-3 px-3 text-right">0 - 30 Days</th>
                  <th className="py-3 px-3 text-right">31 - 60 Days</th>
                  <th className="py-3 px-3 text-right">61 - 90 Days</th>
                  <th className="py-3 px-3 text-right">90+ Days</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {agingData?.retailers?.map((r: any) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {r.shopName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {r.ownerName} &bull; {r.phone}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {r.zone}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      ₹{r.outstandingBalance.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-emerald-600 font-medium">
                      ₹{r.buckets.current.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-amber-600 font-medium">
                      {r.buckets.days31to60 > 0 ? `₹${r.buckets.days31to60.toLocaleString()}` : '—'}
                    </td>

                    <td className="py-3 px-3 text-right text-orange-600 font-medium">
                      {r.buckets.days61to90 > 0 ? `₹${r.buckets.days61to90.toLocaleString()}` : '—'}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-rose-600">
                      {r.buckets.days90Plus > 0 ? `₹${r.buckets.days90Plus.toLocaleString()}` : '—'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => sendReminder(r.id, r.shopName)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                        title="Simulate SMS/Email reminder"
                      >
                        <Send className="w-3 h-3 text-brand-600" />
                        <span>Send Reminder</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Txn ID & Date</th>
                  <th className="py-3 px-3">Retailer</th>
                  <th className="py-3 px-3">Mode & Ref No</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Audited / Handled By</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-slate-900 dark:text-white block">{p.id}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.date).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {p.retailer?.shopName || 'Retailer'}
                      </span>
                      <span className="text-[10px] text-slate-400">{p.retailer?.city}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block">{p.mode}</span>
                      <span className="font-mono text-[10px] text-slate-400">{p.referenceNo || 'Counter Cash'}</span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-emerald-600 text-sm">
                      +₹{p.amount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      {p.collectedBy?.name || 'Priya Verma (Accountant)'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-600" />
                Record Retailer Payment
              </h3>
              <button
                onClick={() => setShowRecordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Retailer Account
                </label>
                <select
                  required
                  value={selectedRetailerId}
                  onChange={(e) => setSelectedRetailerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Choose Retailer --</option>
                  {agingData?.retailers?.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.shopName} (Bal: ₹{r.outstandingBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cash">Cash Receipt</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ref No / UTR
                  </label>
                  <input
                    type="text"
                    placeholder="UTR-882910"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                Recording this transaction will automatically reduce the retailer's outstanding balance, clear matching invoices, and update the audit log.
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Ledger Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
