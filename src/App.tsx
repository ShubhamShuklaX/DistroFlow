import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { RoleSwitcherBanner } from './components/common/RoleSwitcherBanner';
import { TopNav } from './components/common/TopNav';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { OnboardingChecklist } from './components/onboarding/OnboardingChecklist';
import { WebsiteUpdateModal } from './components/common/WebsiteUpdateModal';

// Distributor Views
import { OverviewAnalytics } from './components/distributor/OverviewAnalytics';
import { StaffManager } from './components/distributor/StaffManager';
import { RetailerManager } from './components/distributor/RetailerManager';
import { InventoryManager } from './components/distributor/InventoryManager';
import { OrderPipeline } from './components/distributor/OrderPipeline';
import { PaymentsLedger } from './components/distributor/PaymentsLedger';
import { DemandForecast } from './components/distributor/DemandForecast';
import { RouteOptimization } from './components/distributor/RouteOptimization';
import { AuditLogViewer } from './components/distributor/AuditLogViewer';

// Role Specific Portals
import { SalesPortal } from './components/sales/SalesPortal';
import { WarehousePortal } from './components/warehouse/WarehousePortal';
import { AccountantPortal } from './components/accountant/AccountantPortal';
import { DeliveryMobilePortal } from './components/delivery/DeliveryMobilePortal';
import { RetailerPortal } from './components/retailer/RetailerPortal';

import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  CreditCard,
  Sparkles,
  Navigation,
  Activity,
} from 'lucide-react';

export const App: React.FC = () => {
  const { role, isLoading } = useAuth();

  // Distributor Tab Navigation
  const [distributorTab, setDistributorTab] = useState('overview');

  // Modals
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAnnounce, setShowAnnounce] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs">
        Initializing DistroFlow supply chain engine...
      </div>
    );
  }

  const navTabs = [
    { id: 'overview', label: 'Overview & Analytics', icon: LayoutDashboard },
    { id: 'staff', label: 'Staff & RBAC', icon: Users },
    { id: 'retailers', label: 'Retailers CRM', icon: Store },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package },
    { id: 'orders', label: 'Orders & Backorders', icon: ShoppingCart },
    { id: 'payments', label: 'Payments & Ledger', icon: CreditCard },
    { id: 'forecast', label: 'AI Demand Forecast', icon: Sparkles },
    { id: 'route', label: 'Route Optimization', icon: Navigation },
    { id: 'audit', label: 'Audit Trail', icon: Activity },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* 1. Evaluator Role Switcher Top Bar */}
      <RoleSwitcherBanner />

      {/* 2. Top Header with Notifications, Theme, User Avatar */}
      <TopNav
        onOpenOnboarding={() => setShowOnboarding(true)}
        onOpenAnnounce={() => setShowAnnounce(true)}
      />

      {/* 3. Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If Distributor role: Show Distributor Navigation tabs */}
        {role === 'distributor' && (
          <div className="space-y-6">
            {/* Horizontal Navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = distributorTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDistributorTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Beehiiv-Inspired Onboarding Checklist on Dashboard */}
            {distributorTab === 'overview' && (
              <OnboardingChecklist
                onNavigateTab={(tab) => setDistributorTab(tab)}
                onOpenWizard={() => setShowOnboarding(true)}
              />
            )}

            {/* Render Active Distributor Tab */}
            {distributorTab === 'overview' && <OverviewAnalytics />}
            {distributorTab === 'staff' && <StaffManager />}
            {distributorTab === 'retailers' && <RetailerManager />}
            {distributorTab === 'inventory' && <InventoryManager />}
            {distributorTab === 'orders' && <OrderPipeline />}
            {distributorTab === 'payments' && <PaymentsLedger />}
            {distributorTab === 'forecast' && <DemandForecast />}
            {distributorTab === 'route' && <RouteOptimization />}
            {distributorTab === 'audit' && <AuditLogViewer />}
          </div>
        )}

        {/* If Staff — Sales Executive */}
        {role === 'sales_exec' && <SalesPortal />}

        {/* If Staff — Warehouse Manager */}
        {role === 'warehouse_manager' && <WarehousePortal />}

        {/* If Staff — Accountant */}
        {role === 'accountant' && <AccountantPortal />}

        {/* If Staff — Delivery Person */}
        {role === 'delivery_person' && <DeliveryMobilePortal />}

        {/* If Retailer Portal */}
        {role === 'retailer' && <RetailerPortal />}
      </main>

      {/* 4. Beehiiv-Inspired Multi-Step Onboarding Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => setDistributorTab('overview')}
      />

      {/* 5. Website / Platform Update Announcement Modal */}
      <WebsiteUpdateModal
        isOpen={showAnnounce}
        onClose={() => setShowAnnounce(false)}
      />
    </div>
  );
};

export default App;
