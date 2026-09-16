import React from 'react';
import { OrderStatus, PaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string;
  type?: 'order' | 'payment' | 'tag' | 'general';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'general' }) => {
  let style = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (type === 'order' || ['Placed', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'].includes(status)) {
    switch (status) {
      case 'Placed':
        style = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
        break;
      case 'Confirmed':
        style = 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800';
        break;
      case 'Packed':
        style = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        break;
      case 'Dispatched':
        style = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
        break;
      case 'Delivered':
        style = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        break;
      case 'Cancelled':
        style = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
        break;
    }
  } else if (type === 'payment' || ['Paid', 'Partial', 'Unpaid', 'Overdue'].includes(status)) {
    switch (status) {
      case 'Paid':
        style = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        break;
      case 'Partial':
        style = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        break;
      case 'Unpaid':
        style = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        break;
      case 'Overdue':
        style = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-medium';
        break;
    }
  } else if (type === 'tag') {
    switch (status) {
      case 'Premium':
        style = 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        break;
      case 'Standard':
        style = 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        break;
      case 'High Risk':
        style = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
        break;
      case 'New':
        style = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${style}`}>
      {status}
    </span>
  );
};
