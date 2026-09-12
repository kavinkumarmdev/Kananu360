import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import type { SavingsGoal } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import { PlusCircle } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, goal }) => {
  const { accounts, depositToGoal, settings, t } = useFinance();
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');

  if (!goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    await depositToGoal(goal.id, numAmount, fromAccountId || undefined);

    // Trigger confetti if goal is reached or exceeded!
    if (Number(goal.currentAmount) + numAmount >= Number(goal.targetAmount)) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    onClose();
  };

  const remainingNeeded = Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('contributeTo')} "${goal.name}"`}
      subtitle={`${t('targetAmount')}: ${formatCurrency(goal.targetAmount, settings.currency)} • ${t('remaining')}: ${formatCurrency(remainingNeeded, settings.currency)}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('contributionAmount')} ({settings.currencySymbol})
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="any"
              min="1"
              required
              placeholder="e.g. 5000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-lg font-bold text-white placeholder-slate-500 focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('deductFromAccount')}
          </label>
          <select
            value={fromAccountId}
            onChange={e => setFromAccountId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
          >
            <option value="" className="bg-slate-900">Do not deduct (Manual deposit update)</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                {acc.name} ({formatCurrency(acc.balance, settings.currency)})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Selecting an account automatically records a ledger transaction.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
          >
            <PlusCircle size={15} />
            <span>{t('addContribution')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
