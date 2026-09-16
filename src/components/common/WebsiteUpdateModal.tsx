import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Truck, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

interface WebsiteUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebsiteUpdateModal: React.FC<WebsiteUpdateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header image / preview badge */}
          <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg bg-black/20 hover:bg-black/30 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Platform Update v2.4</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Intelligent Backorder Engine & Route Dispatcher
            </h2>
            <p className="text-white/80 text-xs mt-1.5 leading-relaxed">
              We upgraded DistroFlow's supply chain core to eliminate lost sales from stock-outs and streamline multi-stop deliveries.
            </p>
          </div>

          {/* Feature List */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Zero-Stock Automatic Backordering
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  When a retailer orders out-of-stock SKUs, the engine automatically fulfills what is in the bay, creates a linked backorder for the remainder, and alerts procurement.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Delivery Fleet Manifest & Waypoints
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Delivery drivers now have a dedicated mobile UI showing today's assigned drop-offs, direct contact buttons, and a 1-click status update.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Credit Risk & Aging Ledger Protection
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Order checkout automatically verifies outstanding debt against retailer credit limits, preventing non-performing debt before dispatch.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex justify-end">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-sm"
            >
              <span>Explore Updates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
