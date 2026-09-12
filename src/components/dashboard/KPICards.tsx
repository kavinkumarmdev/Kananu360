import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const KPICards: React.FC = () => {
  const {
    totalNetWorth,
    totalIncomeThisMonth,
    totalExpenseThisMonth,
    netSavingsThisMonth,
    savingsRateThisMonth,
    settings,
    t,
  } = useFinance();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Net Worth */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('kpiTotalNetWorth')}
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Wallet size={18} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(totalNetWorth, settings.currency)}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            {t('kpiAcrossAccounts')}
          </p>
        </div>
      </div>

      {/* Income This Month */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('kpiIncome')}
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
            +{formatCurrency(totalIncomeThisMonth, settings.currency)}
          </h3>
          <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
            <ArrowUpRight size={14} /> {t('kpiInflowRecorded')}
          </p>
        </div>
      </div>

      {/* Expense This Month */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('kpiExpenses')}
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <TrendingDown size={18} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-rose-400 tracking-tight">
            -{formatCurrency(totalExpenseThisMonth, settings.currency)}
          </h3>
          <p className="text-xs text-rose-400/80 mt-1 flex items-center gap-1">
            <ArrowDownRight size={14} /> {t('kpiTotalExpenditures')}
          </p>
        </div>
      </div>

      {/* Net Savings & Savings Rate */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t('kpiNetSavings')} ({savingsRateThisMonth}%)
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <PiggyBank size={18} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className={`text-2xl font-black tracking-tight ${netSavingsThisMonth >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
            {formatCurrency(netSavingsThisMonth, settings.currency)}
          </h3>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, savingsRateThisMonth))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
