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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Total Net Worth */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/15 rounded-full blur-2xl group-hover:bg-indigo-500/25 transition-all duration-500" />
        
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('kpiTotalNetWorth')}
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner group-hover:scale-105 transition-transform">
            <Wallet size={19} />
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formatCurrency(totalNetWorth, settings.currency)}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 inline-block" />
            {t('kpiAcrossAccounts')}
          </p>
        </div>
      </div>

      {/* Income This Month */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all duration-500" />
        
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('kpiIncome')}
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner group-hover:scale-105 transition-transform">
            <TrendingUp size={19} />
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            +{formatCurrency(totalIncomeThisMonth, settings.currency)}
          </h3>
          <p className="text-xs text-emerald-400/90 mt-1.5 flex items-center gap-1 font-semibold">
            <ArrowUpRight size={14} className="shrink-0" /> {t('kpiInflowRecorded')}
          </p>
        </div>
      </div>

      {/* Expense This Month */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-80" />
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/15 rounded-full blur-2xl group-hover:bg-rose-500/25 transition-all duration-500" />
        
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('kpiExpenses')}
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-inner group-hover:scale-105 transition-transform">
            <TrendingDown size={19} />
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <h3 className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
            -{formatCurrency(totalExpenseThisMonth, settings.currency)}
          </h3>
          <p className="text-xs text-rose-400/90 mt-1.5 flex items-center gap-1 font-semibold">
            <ArrowDownRight size={14} className="shrink-0" /> {t('kpiTotalExpenditures')}
          </p>
        </div>
      </div>

      {/* Net Savings & Savings Rate */}
      <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all duration-500" />
        
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t('kpiNetSavings')} ({savingsRateThisMonth}%)
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner group-hover:scale-105 transition-transform">
            <PiggyBank size={19} />
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${netSavingsThisMonth >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
            {formatCurrency(netSavingsThisMonth, settings.currency)}
          </h3>
          <div className="w-full bg-slate-800/80 h-2 rounded-full mt-2.5 overflow-hidden p-0.5 border border-slate-700/40">
            <div
              className="bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.min(100, Math.max(0, savingsRateThisMonth))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
