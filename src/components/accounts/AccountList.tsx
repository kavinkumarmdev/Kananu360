import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { IconRenderer } from '../common/IconRenderer';
import { AccountModal } from './AccountModal';
import { TransferModal } from './TransferModal';
import { Plus, ArrowRightLeft, Edit3, ShieldAlert } from 'lucide-react';
import type { Account } from '../../types/finance';

export const AccountList: React.FC = () => {
  const { accounts, totalNetWorth, settings, t } = useFinance();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleOpenAdd = () => {
    setSelectedAccount(null);
    setIsAccountModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setSelectedAccount(acc);
    setIsAccountModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header & Global Net Worth */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">{t('accountsTitle')}</h2>
          <p className="text-xs text-slate-400">
            {t('netWorth')}: <span className="font-bold text-emerald-400">{formatCurrency(totalNetWorth, settings.currency)}</span> ({accounts.length})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition"
          >
            <ArrowRightLeft size={14} />
            <span>{t('transferFunds')}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition"
          >
            <Plus size={15} />
            <span>{t('addAccount')}</span>
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => {
          const isNegative = Number(acc.balance) < 0;
          return (
            <div
              key={acc.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/5"
                      style={{ backgroundColor: `${acc.color || '#6366f1'}20` }}
                    >
                      <IconRenderer
                        name={acc.icon || 'Building2'}
                        color={acc.color || '#6366f1'}
                        size={22}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition">
                        {acc.name}
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                        {acc.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Edit3 size={15} />
                  </button>
                </div>

                {acc.accountNumber && (
                  <p className="text-xs text-slate-500 font-mono mt-3">
                    {acc.accountNumber}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">{t('availableBalance')}:</span>
                <span
                  className={`text-lg font-black tracking-tight ${
                    isNegative ? 'text-rose-400' : 'text-slate-100'
                  }`}
                >
                  {formatCurrency(acc.balance, settings.currency)}
                </span>
              </div>

              {acc.type === 'credit_card' && isNegative && (
                <div className="mt-2 text-[10px] text-rose-400/80 flex items-center gap-1">
                  <ShieldAlert size={12} />
                  <span>Outstanding credit balance</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accountToEdit={selectedAccount}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
};
