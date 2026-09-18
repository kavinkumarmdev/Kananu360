import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatRelativeDate } from '../../utils/formatters';
import { IconRenderer } from '../common/IconRenderer';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronRight } from 'lucide-react';

interface RecentTransactionsProps {
  onViewAll: () => void;
  onEditTransaction: (tx: any) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  onViewAll,
  onEditTransaction,
}) => {
  const { transactions, categories, accounts, settings, t } = useFinance();

  const recent = transactions.slice(0, 6);

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800/80 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="font-bold text-white text-base tracking-tight">{t('recentActivity')}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{t('recentActivitySubtitle')}</p>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition px-2.5 py-1 rounded-lg hover:bg-indigo-500/10 cursor-pointer"
        >
          <span>{t('viewAll')}</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-2">
        {recent.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            {t('noTransactionsYet')}
          </div>
        ) : (
          recent.map(tx => {
            const cat = categories.find(c => c.id === tx.category);
            const account = accounts.find(a => a.id === tx.accountId);
            const toAccount = tx.toAccountId ? accounts.find(a => a.id === tx.toAccountId) : null;

            let icon = 'Receipt';
            let iconColor = '#818cf8';
            if (cat) {
              icon = cat.icon || 'Receipt';
              iconColor = cat.color || '#818cf8';
            } else if (tx.type === 'transfer') {
              icon = 'ArrowLeftRight';
              iconColor = '#38bdf8';
            }

            return (
              <div
                key={tx.id}
                onClick={() => onEditTransaction(tx)}
                className="p-3 flex items-center justify-between bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/60 hover:border-indigo-500/30 rounded-xl cursor-pointer transition group shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${iconColor}18` }}
                  >
                    <IconRenderer name={icon} color={iconColor} size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition truncate">
                      {tx.description || (cat ? cat.name : 'Transaction')}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatRelativeDate(tx.date)}</span>
                      <span>•</span>
                      <span className="truncate">
                        {tx.type === 'transfer'
                          ? `${account?.name || 'A/c'} → ${toAccount?.name || 'A/c'}`
                          : account?.name || 'Cash'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs sm:text-sm font-black flex items-center justify-end gap-1 ${
                      tx.type === 'income'
                        ? 'text-emerald-400'
                        : tx.type === 'expense'
                        ? 'text-slate-100'
                        : 'text-sky-400'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowUpRight size={14} className="text-emerald-400 shrink-0" />
                    ) : tx.type === 'expense' ? (
                      <ArrowDownLeft size={14} className="text-rose-400 shrink-0" />
                    ) : (
                      <ArrowLeftRight size={14} className="text-sky-400 shrink-0" />
                    )}
                    <span>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                      {formatCurrency(tx.amount, settings.currency)}
                    </span>
                  </div>
                  {cat && (
                    <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[120px] sm:max-w-[150px]">
                      {cat.name}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
