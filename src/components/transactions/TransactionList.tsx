import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { Transaction, FilterOptions } from '../../types/finance';
import { formatCurrency, formatDate, formatRelativeDate } from '../../utils/formatters';
import { IconRenderer } from '../common/IconRenderer';
import { TransactionFilters } from './TransactionFilters';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Download,
  Plus,
  ArrowUpDown,
  Tag,
  CreditCard,
  Sprout,
  Users,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface TransactionListProps {
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onAddTransaction,
  onEditTransaction,
}) => {
  const { transactions, categories, accounts, settleLaborWage, settings, t, getCategoryName } = useFinance();

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    type: 'all',
    category: '',
    accountId: '',
    startDate: '',
    endDate: '',
    paymentMode: '',
    fieldId: '',
    workerName: '',
    paymentStatus: 'all',
  });

  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(query);
        const tagMatch = (tx.tags || []).some(t => t.toLowerCase().includes(query));
        const workerMatch = (tx.workerName || '').toLowerCase().includes(query);
        const fieldMatch = (tx.fieldName || '').toLowerCase().includes(query);
        if (!descMatch && !tagMatch && !workerMatch && !fieldMatch) return false;
      }

      // Type
      if (filters.type !== 'all' && tx.type !== filters.type) return false;

      // Category
      if (filters.category && tx.category !== filters.category) return false;

      // Account
      if (filters.accountId && tx.accountId !== filters.accountId && tx.toAccountId !== filters.accountId) {
        return false;
      }

      // Field plot
      if (filters.fieldId && tx.fieldId !== filters.fieldId) return false;

      // Worker
      if (filters.workerName && tx.workerName !== filters.workerName) return false;

      // Payment Status (Paid vs Pending)
      if (filters.paymentStatus && filters.paymentStatus !== 'all') {
        const currentStatus = tx.paymentStatus || 'paid';
        if (currentStatus !== filters.paymentStatus) return false;
      }

      // Date Range
      if (filters.startDate && tx.date < filters.startDate) return false;
      if (filters.endDate && tx.date > filters.endDate) return false;

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.date.localeCompare(a.date);
      }
      return a.date.localeCompare(b.date);
    });
  }, [transactions, filters, sortOrder]);

  // Aggregate stats for filtered data
  const filteredIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [filteredTransactions]);

  const filteredExpense = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [filteredTransactions]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      type: 'all',
      category: '',
      accountId: '',
      startDate: '',
      endDate: '',
      paymentMode: '',
      fieldId: '',
      workerName: '',
      paymentStatus: 'all',
    });
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Category', 'Account', 'Field', 'Worker', 'WorkerCount', 'PaymentStatus', 'DueDate', 'Description', 'PaymentMode', 'Tags'];
    const rows = filteredTransactions.map(tx => {
      const cat = categories.find(c => c.id === tx.category)?.name || '';
      const acc = accounts.find(a => a.id === tx.accountId)?.name || '';
      return [
        tx.id,
        tx.date,
        tx.type,
        tx.amount,
        settings.currency,
        `"${cat}"`,
        `"${acc}"`,
        `"${tx.fieldName || ''}"`,
        `"${tx.workerName || ''}"`,
        tx.workerCount || '',
        tx.paymentStatus || 'paid',
        tx.dueDate || '',
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        tx.paymentMode,
        `"${(tx.tags || []).join(';')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kanakku360_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">{t('ledgerTitle')}</h2>
          <p className="text-xs text-slate-400">
            {filteredTransactions.length} {t('ledgerSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition"
            title="Download CSV for Google Sheets or Excel"
          >
            <Download size={14} />
            <span>{t('exportCSV')}</span>
          </button>

          <button
            onClick={onAddTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition"
          >
            <Plus size={15} />
            <span>{t('recordTransaction')}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">{t('inflowFiltered')}</span>
          <span className="text-xs font-bold text-emerald-400">
            +{formatCurrency(filteredIncome, settings.currency)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">{t('outflowFiltered')}</span>
          <span className="text-xs font-bold text-rose-400">
            -{formatCurrency(filteredExpense, settings.currency)}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">{t('netFiltered')}</span>
          <span
            className={`text-xs font-bold ${
              filteredIncome - filteredExpense >= 0 ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(filteredIncome - filteredExpense, settings.currency)}
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <TransactionFilters
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      {/* Ledger Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white transition flex items-center gap-1"
                  onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                >
                  <span>{t('dateHeader')}</span>
                  <ArrowUpDown size={12} />
                </th>
                <th className="py-3 px-4">{t('transactionHeader')}</th>
                <th className="py-3 px-4">{t('categoryHeader')}</th>
                <th className="py-3 px-4">{t('accountHeader')}</th>
                <th className="py-3 px-4 text-right">{t('amountHeader')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    {t('noMatchingTransactions')}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const cat = categories.find(c => c.id === tx.category);
                  const account = accounts.find(a => a.id === tx.accountId);
                  const toAccount = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId) : null;

                  let iconName = cat?.icon || 'Receipt';
                  let iconColor = cat?.color || '#818cf8';
                  if (tx.type === 'transfer') {
                    iconName = 'ArrowLeftRight';
                    iconColor = '#38bdf8';
                  }

                  const isPendingWage = tx.paymentStatus === 'pending';

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onEditTransaction(tx)}
                      className="hover:bg-slate-900/50 cursor-pointer transition group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{formatRelativeDate(tx.date)}</div>
                        <div className="text-[10px] text-slate-500">{formatDate(tx.date)}</div>
                      </td>

                      {/* Description & badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5"
                            style={{ backgroundColor: `${iconColor}20` }}
                          >
                            <IconRenderer name={iconName} color={iconColor} size={15} />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="font-medium text-slate-100 group-hover:text-indigo-300 transition truncate">
                              {tx.description || (cat ? cat.name : 'Transaction')}
                            </div>

                            {/* Badges: Family Member, Field, Worker, Livestock, Pending Status */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {tx.memberName && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/70 text-blue-300 border border-blue-600/40 text-[10px] font-semibold">
                                  <span>👤 {tx.memberName}</span>
                                </span>
                              )}

                              {tx.fieldName && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-600/30 text-[10px] font-semibold">
                                  <Sprout size={10} />
                                  <span>{tx.fieldName}</span>
                                </span>
                              )}

                              {tx.livestockName && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-950/60 text-teal-300 border border-teal-600/30 text-[10px] font-semibold">
                                  <span>🐾 {tx.livestockName}</span>
                                </span>
                              )}

                              {tx.workerName && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-600/30 text-[10px] font-semibold">
                                  <Users size={10} />
                                  <span>
                                    {tx.workerName} {tx.workerCount ? `(${tx.workerCount} people)` : ''}
                                  </span>
                                </span>
                              )}

                              {isPendingWage && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-600/50 text-[10px] font-bold animate-pulse">
                                  <Clock size={10} />
                                  <span>Due: {tx.dueDate || 'Unscheduled'}</span>
                                </span>
                              )}

                              {tx.tags && tx.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Tag size={10} className="text-slate-500" />
                                  <span className="text-[10px] text-slate-400">
                                    {tx.tags.map(t => `#${t}`).join(' ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {cat ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border"
                            style={{
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                              borderColor: `${cat.color}30`,
                            }}
                          >
                            {getCategoryName(cat.id, cat.name)}
                          </span>
                        ) : tx.type === 'transfer' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            {t('transfer')}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Account */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <CreditCard size={13} className="text-slate-500" />
                          <span>
                            {tx.type === 'transfer'
                              ? `${account?.name || 'A/c'} → ${toAccount?.name || 'A/c'}`
                              : account?.name || 'Cash'}
                          </span>
                        </div>
                      </td>

                      {/* Amount & Settle Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`font-bold inline-flex items-center gap-1 ${
                              tx.type === 'income'
                                ? 'text-emerald-400'
                                : tx.type === 'expense'
                                ? isPendingWage
                                  ? 'text-amber-400'
                                  : 'text-slate-100'
                                : 'text-sky-400'
                            }`}
                          >
                            {tx.type === 'income' ? (
                              <ArrowUpRight size={13} className="text-emerald-400" />
                            ) : tx.type === 'expense' ? (
                              <ArrowDownLeft size={13} className={isPendingWage ? 'text-amber-400' : 'text-rose-400'} />
                            ) : (
                              <ArrowLeftRight size={13} className="text-sky-400" />
                            )}
                            <span>
                              {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                              {formatCurrency(tx.amount, settings.currency)}
                            </span>
                          </span>

                          {/* Quick Settle Wage Button if pending */}
                          {isPendingWage && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                settleLaborWage(tx.id);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold shadow-sm transition flex items-center gap-1"
                              title={t('settleWage')}
                            >
                              <CheckCircle2 size={11} />
                              <span>{t('settleWage')}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
