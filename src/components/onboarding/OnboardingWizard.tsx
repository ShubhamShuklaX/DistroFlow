import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Users,
  CreditCard,
  PackageCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [businessName, setBusinessName] = useState('DistroFlow Supplies Pvt Ltd');
  const [gstin, setGstin] = useState('27AAACD1234F1Z5');
  const [tradeLicense, setTradeLicense] = useState('MH-MUM-2024-99812');
  const [selectedZones, setSelectedZones] = useState<string[]>(['North', 'South', 'West', 'Central']);
  const [defaultCreditLimit, setDefaultCreditLimit] = useState(150000);
  const [creditGraceDays, setCreditGraceDays] = useState(30);
  const [autoBackorder, setAutoBackorder] = useState(true);
  const [lowStockAlertThreshold, setLowStockAlertThreshold] = useState(20);

  if (!isOpen) return null;

  const toggleZone = (z: string) => {
    setSelectedZones((prev) =>
      prev.includes(z) ? prev.filter((item) => item !== z) : [...prev, z]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header / Step Bar */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs">
                {step}
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Setup Wizard &bull; Step {step} of {totalSteps}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Distribution Entity & Credentials
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure your registered supply company credentials for invoices and tax declarations.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Business Legal Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        GSTIN / Tax ID
                      </label>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Trade License No.
                      </label>
                      <input
                        type="text"
                        value={tradeLicense}
                        onChange={(e) => setTradeLicense(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Territory & Warehouse Zones
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select the geographic distribution zones serviced by your fleet and warehouses.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {['North', 'South', 'East', 'West', 'Central'].map((z) => {
                    const isSelected = selectedZones.includes(z);
                    return (
                      <button
                        type="button"
                        key={z}
                        onClick={() => toggleZone(z)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-900 dark:text-brand-200'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{z} Zone Supply Corridor</span>
                        {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Role-Based Org Chart (RBAC)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Review pre-configured organizational departments with strict permission separation.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {[
                    { role: 'Sales Executive', count: '2 Officers Assigned', desc: 'Can take orders on call/field, manage assigned zone accounts, track 2.5% commission.' },
                    { role: 'Warehouse Manager', count: '2 Warehouse Leads', desc: 'Inspects pack queue, adjusts physical inventory, and triggers "Packed" status.' },
                    { role: 'Accountant', count: '1 Senior Accountant', desc: 'Audits ledger, enters UPI/cheque collections, monitors overdue aging buckets.' },
                    { role: 'Delivery Person', count: 'Fleet Operator', desc: 'Mobile-friendly drop-off manifest with 1-click "Mark Delivered" action.' },
                  ].map((dept, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {dept.role}
                        </span>
                        <p className="text-slate-500 text-[11px] mt-0.5">{dept.desc}</p>
                      </div>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 shrink-0 font-medium">
                        {dept.count}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Retailer Credit Risk Policy
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enforce automated credit checks to block bad debt and overdue defaults.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Default Credit Limit (₹)
                    </label>
                    <input
                      type="number"
                      value={defaultCreditLimit}
                      onChange={(e) => setDefaultCreditLimit(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      New retailers will be blocked from ordering once outstanding balance crosses this amount.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Invoice Payment Grace Period (Days)
                    </label>
                    <input
                      type="number"
                      value={creditGraceDays}
                      onChange={(e) => setCreditGraceDays(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600">
                    <PackageCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Automated Backorder & Inventory
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure stockout handling so zero-stock orders automatically convert to backorders.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/30 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                        Intelligent Pre-Order & Backorder Engine
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                        When active, orders with insufficient stock are never rejected. Instead, available quantities are fulfilled immediately, while the rest are queued as backorders and fulfilled as soon as inventory arrives.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        Auto-Fulfill Backorders upon Restock
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Notify warehouse and allocate inbound shipments automatically
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoBackorder}
                      onChange={(e) => setAutoBackorder(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Global Low-Stock Alert Threshold (Units)
                    </label>
                    <input
                      type="number"
                      value={lowStockAlertThreshold}
                      onChange={(e) => setLowStockAlertThreshold(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className={`flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
              step === 1
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all"
          >
            <span>{step === totalSteps ? 'Launch Dashboard' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
