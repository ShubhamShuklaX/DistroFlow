import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, X, Sparkles } from 'lucide-react';

interface OnboardingChecklistProps {
  onNavigateTab: (tab: string) => void;
  onOpenWizard: () => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  onNavigateTab,
  onOpenWizard,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [completedItems, setCompletedItems] = useState<number[]>([1, 2]);

  if (isDismissed) return null;

  const tasks = [
    {
      id: 1,
      title: 'Configure distribution profile & regional supply hubs',
      description: 'Business legal entity, GSTIN, and North/South/West fulfillment corridors.',
      actionTab: 'wizard',
    },
    {
      id: 2,
      title: 'Inspect 6 staff accounts across 4 core departments',
      description: 'Verify Sales Execs (commission), Warehouse (pack), Accounts, and Fleet.',
      actionTab: 'staff',
    },
    {
      id: 3,
      title: 'Review 15 Retailers & verify Credit Limit enforcement',
      description: 'Inspect credit utilization percentages and aging risk tags (High Risk / Premium).',
      actionTab: 'retailers',
    },
    {
      id: 4,
      title: 'Test automated Backordering for stock-out items',
      description: 'Observe Red Bull 250ml and Colin Glass auto-split into pending pre-orders.',
      actionTab: 'orders',
    },
    {
      id: 5,
      title: 'Check AI Demand Forecast for next month procurement',
      description: 'Review machine-suggested reorder quantities based on 30-day velocity.',
      actionTab: 'forecast',
    },
    {
      id: 6,
      title: 'Inspect Route Optimization & Delivery fleet waypoints',
      description: 'View drop-off sequence and estimated transit times for North Zone route.',
      actionTab: 'route',
    },
  ];

  const toggleTask = (id: number) => {
    setCompletedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const progressPercent = Math.round((completedItems.length / tasks.length) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm mb-6 relative overflow-hidden">
      {/* Decorative subtle accent */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-brand-50/40 dark:bg-brand-950/20 rounded-bl-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Onboarding Checklist
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs font-medium text-slate-500">
              {completedItems.length} of {tasks.length} steps verified ({progressPercent}%)
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            Get Started with DistroFlow Distribution Hub
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWizard}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 transition-colors"
          >
            Launch Wizard
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Dismiss checklist"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full my-4 overflow-hidden">
        <div
          className="bg-brand-600 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tasks.map((task) => {
          const isDone = completedItems.includes(task.id);
          return (
            <div
              key={task.id}
              className={`p-3 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800/80 text-slate-500'
                  : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 text-brand-600 shrink-0 hover:scale-105 transition-transform"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </button>
                <div>
                  <span
                    className={`font-semibold block ${
                      isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    if (task.actionTab === 'wizard') onOpenWizard();
                    else onNavigateTab(task.actionTab);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <span>Explore</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
