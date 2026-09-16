import React from 'react';
import { PaymentsLedger } from '../distributor/PaymentsLedger';
import { useAuth } from '../../context/AuthContext';
import { Calculator } from 'lucide-react';

export const AccountantPortal: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
          <Calculator className="w-4 h-4" />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Finance, Accounts & Collections Desk
          </h2>
          <p className="text-xs text-slate-500">
            Logged in as <strong className="text-slate-800 dark:text-slate-200">{user?.name}</strong> (Senior Accountant). Enforce credit caps, audit payment entries, and oversee overdue collections.
          </p>
        </div>
      </div>

      {/* Reuse full feature-packed payments ledger view */}
      <PaymentsLedger />
    </div>
  );
};
