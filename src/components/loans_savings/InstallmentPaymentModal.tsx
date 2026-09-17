import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { SavingScheme } from '../../types/finance';
import { Coins, X, Calendar, Wallet } from 'lucide-react';

interface InstallmentPaymentModalProps {
  scheme: SavingScheme;
  onClose: () => void;
}

export const InstallmentPaymentModal: React.FC<InstallmentPaymentModalProps> = ({
  scheme,
  onClose,
}) => {
  const { recordSavingInstallment, accounts, settings, t } = useFinance();

  const nextInstallmentNo = (scheme.installments?.length || 0) + 1;
  const defaultMonthlyDue = Math.round(scheme.totalValue / (scheme.totalInstallments || 1));

  const [installmentNo, setInstallmentNo] = useState<number>(nextInstallmentNo);
  const [amountPaid, setAmountPaid] = useState<string>(String(defaultMonthlyDue));
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState<string>(
    accounts.find(a => a.isDefault)?.id || accounts[0]?.id || ''
  );
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amountPaid);
    if (isNaN(numAmount) || numAmount <= 0) return;

    await recordSavingInstallment(
      scheme.id,
      {
        installmentNo: Number(installmentNo),
        date,
        amountPaid: numAmount,
        accountId: accountId || undefined,
        notes: notes.trim() || undefined,
      },
      true
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 max-w-md w-full space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Coins size={20} />
            <h3 className="font-bold text-white text-base">
              {t('recordInstallment')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-bold text-white">{scheme.name}</span>
            <span className="text-emerald-400 font-bold">
              {settings.currencySymbol}{scheme.totalValue.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {scheme.institution} • {scheme.installments?.length || 0} of {scheme.totalInstallments} installments completed
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('installmentNo')}
              </label>
              <input
                type="number"
                min="1"
                max={scheme.totalInstallments}
                required
                value={installmentNo}
                onChange={e => setInstallmentNo(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('amountPaidThisMonth')} *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 25000, 28000, 30000"
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none font-bold text-emerald-400"
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" />
                <span>Payment Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Wallet size={12} className="text-slate-400" />
                <span>Paid From Account</span>
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              >
                <option value="" className="bg-slate-900 text-slate-400">None (Do not deduct)</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                    {acc.name} ({settings.currencySymbol}{acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dividend / Auction Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. ₹5,000 auction dividend deducted"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow transition"
            >
              Save Installment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
