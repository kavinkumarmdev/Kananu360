import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { FilterOptions } from '../../types/finance';
import { Search, X, Sprout, Users, Clock } from 'lucide-react';

interface TransactionFiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onReset: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  setFilters,
  onReset,
}) => {
  const { categories, accounts, fields, workers, t, getCategoryName } = useFinance();

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.type !== 'all' ||
    filters.category !== '' ||
    filters.accountId !== '' ||
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    (filters.fieldId && filters.fieldId !== '') ||
    (filters.workerName && filters.workerName !== '') ||
    (filters.paymentStatus && filters.paymentStatus !== 'all') ||
    (filters.domain && filters.domain !== 'all');

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800/90 mb-4 space-y-3">
      {/* Primary Row: Search, Type, Category, Account */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={filters.type}
            onChange={e => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 focus:outline-none"
          >
            <option value="all" className="bg-slate-900">{t('allTypes')}</option>
            <option value="expense" className="bg-slate-900">{t('expensesOnly')}</option>
            <option value="income" className="bg-slate-900">{t('incomeOnly')}</option>
            <option value="transfer" className="bg-slate-900">{t('transfersOnly')}</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={filters.category}
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 focus:outline-none"
          >
            <option value="" className="bg-slate-900">{t('allCategories')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-slate-900">
                {getCategoryName(cat.id, cat.name)}
              </option>
            ))}
          </select>
        </div>

        {/* Account Filter */}
        <div>
          <select
            value={filters.accountId}
            onChange={e => setFilters(prev => ({ ...prev, accountId: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 focus:outline-none"
          >
            <option value="" className="bg-slate-900">{t('allAccounts')}</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id} className="bg-slate-900">
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Secondary Farm, Labor & Status Specific Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60">
        {/* Field / Plot Filter */}
        <div className="flex items-center gap-1.5">
          <Sprout size={14} className="text-emerald-400 shrink-0" />
          <select
            value={filters.fieldId || ''}
            onChange={e => setFilters(prev => ({ ...prev, fieldId: e.target.value }))}
            className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-slate-200 focus:outline-none"
          >
            <option value="" className="bg-slate-900">🌱 {t('allFields')}</option>
            {fields.map(f => (
              <option key={f.id} value={f.id} className="bg-slate-900">
                {f.name} ({f.areaAcre} Ac)
              </option>
            ))}
          </select>
        </div>

        {/* Worker Filter */}
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-indigo-400 shrink-0" />
          <select
            value={filters.workerName || ''}
            onChange={e => setFilters(prev => ({ ...prev, workerName: e.target.value }))}
            className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-slate-200 focus:outline-none"
          >
            <option value="" className="bg-slate-900">👥 {t('allWorkers')}</option>
            {workers.map(w => (
              <option key={w.id} value={w.name} className="bg-slate-900">
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Status (Paid vs Pending Wage/Bill) */}
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-amber-400 shrink-0" />
          <select
            value={filters.paymentStatus || 'all'}
            onChange={e => setFilters(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
            className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-slate-200 focus:outline-none"
          >
            <option value="all" className="bg-slate-900">{t('allPaymentStatuses')}</option>
            <option value="pending" className="bg-slate-900 text-amber-300 font-bold">⏳ {t('pendingOnly')}</option>
            <option value="paid" className="bg-slate-900 text-emerald-300">✅ {t('paidOnly')}</option>
          </select>
        </div>
      </div>

      {/* Date Range & Clear Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">{t('dateRange')}:</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-2 py-1 rounded-lg glass-input text-xs text-slate-300 focus:outline-none"
          />
          <span className="text-xs text-slate-500">{t('to')}</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-2 py-1 rounded-lg glass-input text-xs text-slate-300 focus:outline-none"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={13} />
            <span>{t('clearFilters')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
