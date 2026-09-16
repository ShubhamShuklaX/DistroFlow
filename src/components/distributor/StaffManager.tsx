import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  UserCheck,
  UserPlus,
  Shield,
  Percent,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  X,
  Search,
} from 'lucide-react';

export const StaffManager: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('sales_exec');
  const [newZone, setNewZone] = useState('North');
  const [newSalary, setNewSalary] = useState(40000);
  const [newCommission, setNewCommission] = useState(2.5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await api.getStaff();
      setStaff(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      await api.createStaff({
        name: newName,
        email: newEmail,
        phone: newPhone,
        role: newRole,
        zone: newZone,
        salary: Number(newSalary),
        commissionPercent: newRole === 'sales_exec' ? Number(newCommission) : 0,
      });
      setShowAddModal(false);
      resetForm();
      fetchStaff();
    } catch (err: any) {
      setFormError(err.message || 'Failed to onboard staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('sales_exec');
    setNewZone('North');
    setNewSalary(40000);
    setNewCommission(2.5);
    setFormError('');
  };

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.updateStaffStatus(userId, nextStatus);
      setStaff((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, status: nextStatus } : s))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.zone.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'all' || s.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Staff Roster & Organizational RBAC
          </h2>
          <p className="text-xs text-slate-500">
            Real enterprise hierarchy: commission tracking, department boundaries, and audit logging.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard New Staff</span>
        </button>
      </div>

      {/* Permission Matrix Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-brand-600" />
          Enforced Role-Based Access Matrix
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Sales Executive
            </span>
            <ul className="text-slate-500 space-y-0.5 list-disc list-inside">
              <li>Assigned zone retailers only</li>
              <li>Can take orders on call/field</li>
              <li>Cannot edit base prices</li>
              <li>Earns commission on closed orders</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Warehouse Manager
            </span>
            <ul className="text-slate-500 space-y-0.5 list-disc list-inside">
              <li>Live stock counts & reorders</li>
              <li>Picks & packs orders ("Packed")</li>
              <li>Cannot view profit margins</li>
              <li>Cannot touch financial ledgers</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Accountant
            </span>
            <ul className="text-slate-500 space-y-0.5 list-disc list-inside">
              <li>Payment entries (cash/UPI/NEFT)</li>
              <li>Aging reports (30, 60, 90+ days)</li>
              <li>Credit limit enforcement</li>
              <li>Cannot alter physical inventory</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Delivery Person
            </span>
            <ul className="text-slate-500 space-y-0.5 list-disc list-inside">
              <li>Mobile-friendly route manifest</li>
              <li>Drop-off verification ("Delivered")</li>
              <li>Only sees retailer address & counts</li>
              <li>No pricing or accounting access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, email, or zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'sales_exec', 'warehouse_manager', 'accountant', 'delivery_person'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 transition-colors ${
                selectedRole === r
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {r === 'all' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((s) => (
          <div
            key={s.id}
            className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
              s.status === 'active'
                ? 'border-slate-200 dark:border-slate-800'
                : 'border-slate-200/60 dark:border-slate-800/60 opacity-60 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm border border-brand-200 dark:border-brand-800">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {s.name}
                    </h4>
                    <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400 capitalize">
                      {s.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleStatus(s.id, s.status)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                    s.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 hover:bg-rose-50 hover:text-rose-700'
                      : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                  title={s.status === 'active' ? 'Click to Deactivate' : 'Click to Activate'}
                >
                  {s.status === 'active' ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Meta details */}
              <div className="space-y-1.5 text-xs text-slate-500 mb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{s.email}</span>
                </div>
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assigned Zone: <strong className="text-slate-700 dark:text-slate-300">{s.zone}</strong></span>
                </div>
              </div>

              {/* Role specific performance metrics */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Compensation:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₹{Number(s.salary).toLocaleString()}/mo
                  </span>
                </div>

                {s.role === 'sales_exec' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Commission Rate:</span>
                      <span className="font-semibold text-brand-600">{s.commissionPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Orders Closed:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{s.metrics.ordersClosed} orders</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="text-slate-400 font-medium">Incentive Earned:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Math.round(s.commissionEarned).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}

                {s.role === 'warehouse_manager' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Orders Packed:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{s.metrics.packsDone} orders</span>
                  </div>
                )}

                {s.role === 'delivery_person' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deliveries Completed:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{s.metrics.deliveriesDone} drop-offs</span>
                  </div>
                )}

                {s.role === 'accountant' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recovered Collections:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ₹{Math.round(s.metrics.collectionsTotal).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-600" />
                Onboard Department Staff
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 text-xs border border-rose-200 dark:border-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@distroflow.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
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
                    Role / Department
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="sales_exec">Sales Executive</option>
                    <option value="warehouse_manager">Warehouse Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="delivery_person">Delivery Person</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Zone
                  </label>
                  <select
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="North">North Zone</option>
                    <option value="South">South Zone</option>
                    <option value="East">East Zone</option>
                    <option value="West">West Zone</option>
                    <option value="Central">Central Hub</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Base (₹)
                  </label>
                  <input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {newRole === 'sales_exec' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Commission %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCommission}
                      onChange={(e) => setNewCommission(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-slate-400 pt-5 text-[11px]">
                    No sales commission for non-sales roles.
                  </div>
                )}
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
                  {isSubmitting ? 'Creating Account...' : 'Confirm & Generate Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
