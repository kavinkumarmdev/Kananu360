import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculatePercentage } from '../../utils/formatters';
import { IconRenderer } from '../common/IconRenderer';
import { BudgetModal } from './BudgetModal';
import { Plus, AlertTriangle, CheckCircle, Flame, Edit3 } from 'lucide-react';
import type { Budget } from '../../types/finance';

export const BudgetList: React.FC = () => {
  const { budgets, categories, transactions, settings, t, getCategoryName } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const currentYearMonth = new Date().toISOString().substring(0, 7);
  const currentMonthName = new Date().toLocaleString(settings.language === 'ta' ? 'ta-IN' : 'default', { month: 'long' });

  // Compute spend for each budget category
  const budgetStats = budgets.map(budget => {
    const category = categories.find(c => c.id === budget.categoryId);
    const spent = transactions
      .filter(tx => tx.type === 'expense' && tx.category === budget.categoryId && tx.date && tx.date.startsWith(currentYearMonth))
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const percentage = calculatePercentage(spent, budget.monthlyLimit);
    const remaining = Number(budget.monthlyLimit) - spent;

    return {
      ...budget,
      category,
      spent,
      percentage,
      remaining,
    };
  });

  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.monthlyLimit), 0);
  const totalBudgetSpent = budgetStats.reduce((sum, b) => sum + b.spent, 0);

  const handleOpenAdd = () => {
    setSelectedBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setSelectedBudget(b);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header & Overall Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">{t('budgetsTitle')}</h2>
          <p className="text-xs text-slate-400">
            {t('budgetsSubtitle')} ({currentMonthName})
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>{t('newBudgetLimit')}</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t('totalBudgetUtilization')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">
                {formatCurrency(totalBudgetSpent, settings.currency)}
              </span>
              <span className="text-sm text-slate-400">
                / {formatCurrency(totalBudgeted, settings.currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block">{t('remaining')}</span>
              <span className={`font-bold ${totalBudgeted - totalBudgetSpent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(totalBudgeted - totalBudgetSpent, settings.currency)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block">{t('overallBurn')}</span>
              <span className="font-bold text-indigo-400">
                {calculatePercentage(totalBudgetSpent, totalBudgeted)}%
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-900 h-2.5 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              totalBudgetSpent > totalBudgeted
                ? 'bg-rose-500'
                : totalBudgetSpent / totalBudgeted > 0.8
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, calculatePercentage(totalBudgetSpent, totalBudgeted))}%` }}
          />
        </div>
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetStats.length === 0 ? (
          <div className="col-span-full py-12 text-center glass-panel rounded-2xl border border-slate-800 text-slate-400 text-sm">
            {t('noBudgetLimits')}
          </div>
        ) : (
          budgetStats.map(item => {
            const isExceeded = item.spent > item.monthlyLimit;
            const isWarning = item.percentage >= 80 && !isExceeded;
            const cat = item.category;

            return (
              <div
                key={item.id}
                className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/5"
                      style={{ backgroundColor: `${cat?.color || '#6366f1'}20` }}
                    >
                      <IconRenderer
                        name={cat?.icon || 'PieChart'}
                        color={cat?.color || '#6366f1'}
                        size={20}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition">
                        {getCategoryName(item.categoryId, item.categoryName)}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {t('monthlyLimit')}: {formatCurrency(item.monthlyLimit, settings.currency)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Edit3 size={15} />
                  </button>
                </div>

                {/* Spend numbers */}
                <div className="mt-4 flex items-baseline justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base text-slate-100">
                      {formatCurrency(item.spent, settings.currency)}
                    </span>
                    <span className="text-slate-400">{t('spent')}</span>
                  </div>

                  <div className="flex items-center gap-1 font-semibold">
                    {isExceeded ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <Flame size={13} /> {t('overBy')} {formatCurrency(Math.abs(item.remaining), settings.currency)}
                      </span>
                    ) : isWarning ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle size={13} /> {formatCurrency(item.remaining, settings.currency)} {t('left')}
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={13} /> {formatCurrency(item.remaining, settings.currency)} {t('left')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900/90 h-2 rounded-full mt-2.5 overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>

                <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
                  <span>{item.percentage}% {t('used')}</span>
                  <span>{Math.max(0, 100 - item.percentage)}% {t('remaining')}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budgetToEdit={selectedBudget}
      />
    </div>
  );
};
