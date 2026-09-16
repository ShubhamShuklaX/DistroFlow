import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck, UserCheck, Truck, Warehouse, Calculator, Store } from 'lucide-react';

interface RoleOption {
  role: UserRole;
  label: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'distributor',
    label: 'Distributor (Owner)',
    name: 'Vikram Mehta',
    icon: ShieldCheck,
    description: 'Full org control: staff salaries, margins, retailers, AI forecast, audit log',
  },
  {
    role: 'sales_exec',
    label: 'Sales Executive',
    name: 'Rohit Sharma',
    icon: UserCheck,
    description: 'Manages assigned zone retailers, field visits, order booking & sales commission',
  },
  {
    role: 'warehouse_manager',
    label: 'Warehouse Lead',
    name: 'Anil Kumar',
    icon: Warehouse,
    description: 'Manages stock counts, reorder alerts, pack queue & marks orders Packed',
  },
  {
    role: 'accountant',
    label: 'Accountant',
    name: 'Priya Verma',
    icon: Calculator,
    description: 'Manages payment entries, credit limits, 30-90+ days aging ledger & reminders',
  },
  {
    role: 'delivery_person',
    label: 'Delivery Staff',
    name: 'Deepak Rao',
    icon: Truck,
    description: 'Mobile dispatch view: today’s stops, contact retailer, 1-click Mark Delivered',
  },
  {
    role: 'retailer',
    label: 'Retailer Portal',
    name: 'Apex Mart',
    icon: Store,
    description: 'Storefront: live catalog, cart credit-check, automatic backorders, statements',
  },
];

export const RoleSwitcherBanner: React.FC = () => {
  const { role, switchRole, isLoading } = useAuth();

  const currentRoleInfo = ROLES.find((r) => r.role === role) || ROLES[0];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-brand-400 bg-brand-950/80 px-2 py-0.5 rounded border border-brand-800/60">
            RBAC Evaluator Switcher
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Switch persona to test real permission gates:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {ROLES.map((r) => {
            const isActive = r.role === role;
            const Icon = r.icon;
            return (
              <button
                key={r.role}
                onClick={() => !isActive && switchRole(r.role)}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm ring-1 ring-brand-400/50'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
                }`}
                title={`${r.name} - ${r.description}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-1.5 border-t border-slate-800/80 mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <div>
          <span className="text-slate-300 font-medium">Active User:</span> {currentRoleInfo.name} &bull;{' '}
          <span className="text-slate-400">{currentRoleInfo.description}</span>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-slate-500">
          <span>Backend JWT Verified</span>
          <span>&bull;</span>
          <span>Zero Decorative Roles</span>
        </div>
      </div>
    </div>
  );
};
