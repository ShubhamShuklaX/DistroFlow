import React, { useState, useEffect } from 'react';
import { Retailer } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import {
  Store,
  UserPlus,
  Search,
  SlidersHorizontal,
  X,
  CreditCard,
  Building2,
  FileText,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const RetailerManager: React.FC = () => {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCreditLimit, setEditCreditLimit] = useState(150000);
  const [editTag, setEditTag] = useState('Standard');
  const [editStatus, setEditStatus] = useState('active');

  // Add Form State
  const [newShopName, setNewShopName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGstNo, setNewGstNo] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Mumbai');
  const [newZone, setNewZone] = useState('North');
  const [newCreditLimit, setNewCreditLimit] = useState(200000);
  const [newTag, setNewTag] = useState('New');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchRetailers();
  }, []);

  const fetchRetailers = async () => {
    try {
      const data = await api.getRetailers();
      setRetailers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRetailer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await api.createRetailer({
        shopName: newShopName,
        ownerName: newOwnerName,
        email: newEmail,
        phone: newPhone,
        gstNo: newGstNo,
        address: newAddress,
        city: newCity,
        zone: newZone,
        creditLimit: Number(newCreditLimit),
        tag: newTag,
      });
      setShowAddModal(false);
      resetAddForm();
      fetchRetailers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add retailer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setNewShopName('');
    setNewOwnerName('');
    setNewEmail('');
    setNewPhone('');
    setNewGstNo('');
    setNewAddress('');
    setNewCity('Mumbai');
    setNewZone('North');
    setNewCreditLimit(200000);
    setNewTag('New');
    setErrorMessage('');
  };

  const handleSaveEdit = async () => {
    if (!selectedRetailer) return;
    try {
      const updated = await api.updateRetailer(selectedRetailer.id, {
        creditLimit: Number(editCreditLimit),
        tag: editTag,
        status: editStatus,
      });
      setSelectedRetailer((prev) => (prev ? { ...prev, ...updated } : null));
      setRetailers((prev) =>
        prev.map((r) => (r.id === selectedRetailer.id ? { ...r, ...updated } : r))
      );
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const openRetailerProfile = (r: Retailer) => {
    setSelectedRetailer(r);
    setEditCreditLimit(r.creditLimit);
    setEditTag(r.tag);
    setEditStatus(r.status);
    setIsEditing(false);
  };

  const filteredRetailers = retailers.filter((r) => {
    const matchesSearch =
      r.shopName.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      r.gstNo.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());
    const matchesZone = zoneFilter === 'all' || r.zone === zoneFilter;
    const matchesTag = tagFilter === 'all' || r.tag === tagFilter;
    return matchesSearch && matchesZone && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Retailer Directory & Credit Control
          </h2>
          <p className="text-xs text-slate-500">
            Accounts receivable, zone assignments, risk tags, and real-time credit limit enforcement.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard Retailer</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search store name, GSTIN, owner, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {/* Zone Filter */}
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Zones</option>
              <option value="North">North Zone</option>
              <option value="South">South Zone</option>
              <option value="East">East Zone</option>
              <option value="West">West Zone</option>
              <option value="Central">Central Zone</option>
            </select>

            {/* Tag Filter */}
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Risk Tags</option>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
              <option value="High Risk">High Risk</option>
              <option value="New">New</option>
            </select>
          </div>
        </div>
      </div>

      {/* Retailers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Store & Owner</th>
                <th className="py-3 px-3">GSTIN / City</th>
                <th className="py-3 px-3">Zone</th>
                <th className="py-3 px-3">Tag</th>
                <th className="py-3 px-4 text-right">Credit Limit</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4">Credit Utilization</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredRetailers.map((r) => {
                const utilPercent = r.creditLimit > 0
                  ? Math.min(100, Math.round((r.outstandingBalance / r.creditLimit) * 100))
                  : 0;

                const isNearLimit = utilPercent >= 80;
                const isOverLimit = utilPercent >= 95;

                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openRetailerProfile(r)}
                        className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 text-left block"
                      >
                        {r.shopName}
                      </button>
                      <span className="text-[11px] text-slate-400">
                        {r.ownerName} &bull; {r.phone}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 block">
                        {r.gstNo}
                      </span>
                      <span className="text-[10px] text-slate-400">{r.city}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {r.zone}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={r.tag} type="tag" />
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      ₹{r.creditLimit.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-bold ${
                          isOverLimit
                            ? 'text-rose-600 dark:text-rose-400'
                            : isNearLimit
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        ₹{r.outstandingBalance.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>{utilPercent}% used</span>
                          {isOverLimit && <span className="text-rose-500 font-bold">Limit Warning</span>}
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverLimit
                                ? 'bg-rose-500'
                                : isNearLimit
                                ? 'bg-amber-500'
                                : 'bg-brand-500'
                            }`}
                            style={{ width: `${utilPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${
                          r.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            : r.status === 'blocked'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => openRetailerProfile(r)}
                        className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                      >
                        <span>Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retailer Profile Drawer */}
      {selectedRetailer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-600 font-mono">
                    Retailer Profile #{selectedRetailer.id.slice(-6)}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRetailer.shopName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRetailer(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Credit Health Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Credit Exposure Status</span>
                  <StatusBadge status={selectedRetailer.tag} type="tag" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total Credit Limit</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      ₹{selectedRetailer.creditLimit.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Current Outstanding</span>
                    <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                      ₹{selectedRetailer.outstandingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Available Order Cushion</span>
                    <span className="font-semibold text-emerald-600">
                      ₹{Math.max(0, selectedRetailer.creditLimit - selectedRetailer.outstandingBalance).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((selectedRetailer.outstandingBalance / selectedRetailer.creditLimit) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Edit Controls */}
              {isEditing ? (
                <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/40 dark:bg-brand-950/20 space-y-3 mb-5 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Adjust Credit Policy & Status
                  </h4>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      Credit Limit (₹)
                    </label>
                    <input
                      type="number"
                      value={editCreditLimit}
                      onChange={(e) => setEditCreditLimit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        Tag
                      </label>
                      <select
                        value={editTag}
                        onChange={(e) => setEditTag(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                      >
                        <option value="Premium">Premium</option>
                        <option value="Standard">Standard</option>
                        <option value="High Risk">High Risk</option>
                        <option value="New">New</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        Account Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                      >
                        <option value="active">Active (Normal)</option>
                        <option value="blocked">Blocked (Order Freeze)</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Edit Credit Limit & Risk Tag
                  </button>
                </div>
              )}

              {/* Retailer Info Fields */}
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mb-6">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Proprietor:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedRetailer.ownerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">GSTIN:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{selectedRetailer.gstNo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Phone:</span>
                  <span>{selectedRetailer.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Email:</span>
                  <span>{selectedRetailer.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Shipping Address:</span>
                  <span className="text-right max-w-[240px] truncate">{selectedRetailer.address}, {selectedRetailer.city}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Assigned Sales Zone:</span>
                  <span className="font-medium text-brand-600">{selectedRetailer.zone} Zone</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedRetailer(null)}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Retailer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-brand-600" />
                Onboard Retail Store
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 mb-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 text-xs border border-rose-200 dark:border-rose-800">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddRetailer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Store / Shop Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shanti Supermarket"
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Owner / Proprietor Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sanjay Verma"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="27ABCDE1234F1Z9"
                    value={newGstNo}
                    onChange={(e) => setNewGstNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none uppercase focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98000 00000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="store@domain.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Zone
                  </label>
                  <select
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="Central">Central</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={newCreditLimit}
                    onChange={(e) => setNewCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Risk Tag
                  </label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="High Risk">High Risk</option>
                    <option value="New">New</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  placeholder="Plot / Shop No, Street, Landmark"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Onboarding...' : 'Onboard & Issue Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
