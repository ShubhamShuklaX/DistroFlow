import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Notification } from '../../types';
import { api } from '../../services/api';
import {
  Bell,
  Sun,
  Moon,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Package,
  CreditCard,
  LogOut,
  Info,
} from 'lucide-react';

interface TopNavProps {
  onOpenOnboarding: () => void;
  onOpenAnnounce: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenOnboarding, onOpenAnnounce }) => {
  const { user, role, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const isDarkStored = localStorage.getItem('theme') === 'dark';
    setIsDark(isDarkStored);
    if (isDarkStored) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    loadNotifications();
  }, [role]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'distributor':
        return 'Distributor Admin';
      case 'sales_exec':
        return 'Sales Executive';
      case 'warehouse_manager':
        return 'Warehouse Manager';
      case 'accountant':
        return 'Accountant';
      case 'delivery_person':
        return 'Delivery Staff';
      case 'retailer':
        return 'Retailer Client';
      default:
        return r;
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-600 text-white font-bold text-lg shadow-sm">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">
                DistroFlow
              </span>
              <span className="hidden sm:inline-block text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Enterprise Distributor–Retailer Supply Chain CRM
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Onboarding Wizard Trigger (Beehiiv Inspired) */}
          {role === 'distributor' && (
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              title="Launch Setup Wizard"
            >
              <Compass className="w-3.5 h-3.5 text-brand-600" />
              <span className="hidden sm:inline">Setup Wizard</span>
            </button>
          )}

          {/* Announcement Modal Trigger */}
          <button
            onClick={onOpenAnnounce}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="System Updates & Engine Release Notes"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Release Info</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-600 px-1.5 py-0.2 rounded-full font-medium">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No notifications for your role
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg text-xs transition-colors ${
                          n.read
                            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300'
                            : 'bg-brand-50/60 dark:bg-brand-950/40 text-slate-900 dark:text-slate-100 font-medium border-l-2 border-brand-500'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {n.type === 'stock' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          {n.type === 'order' && <Package className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          {n.type === 'payment' && <CreditCard className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          {n.type === 'system' && <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                          <span className="font-semibold">{n.title}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-semibold text-xs border border-brand-200 dark:border-brand-800">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {getRoleBadge(role)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
