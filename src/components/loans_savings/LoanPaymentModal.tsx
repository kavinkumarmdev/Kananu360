import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { Loan } from '../../types/finance';
import { Receipt, X, Calendar, Wallet } from 'lucide-react';

interface LoanPaymentModalProps {
  loan: Loan;
  onClose: () => void;
}

export const LoanPaymentModal: React.FC<LoanPaymentModalProps> = ({
  loan,
  onClose,
}) => {
  const { recordLoanPayment, accounts, settings, t } = useFinance();

  const totalPrincipalPaidSoFar = (loan.payments || []).reduce(
    (sum, p) => sum + Number(p.principalPaid || 0),
    0
  );
  const remainingPrincipal = Math.max(0, loan.principalAmount - totalPrincipalPaidSoFar);

  const defaultEmi = loan.emiAmount || Math.round(remainingPrincipal * 0.1) || 5000;

  const [principalPaid, setPrincipalPaid] = useState<string>(String(defaultEmi));
  const [interestPaid, setInterestPaid] = useState<string>('0');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState<string>(
    accounts.find(a => a.isDefault)?.id || accounts[0]?.id || ''
  );
  const [notes, setNotes] = useState<string>('');

  const numPrincipal = parseFloat(principalPaid) || 0;
  const numInterest = parseFloat(interestPaid) || 0;
  const totalPaid = numPrincipal + numInterest;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPaid <= 0) return;

    await recordLoanPayment(
      loan.id,
      {
        date,
        principalPaid: numPrincipal,
        interestPaid: numInterest,
        totalPaid,
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
          <div className="flex items-center gap-2 text-indigo-400">
            <Receipt size={20} />
            <h3 className="font-bold text-white text-base">
              {t('recordLoanPayment')}
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
            <span className="font-bold text-white">{loan.name}</span>
            <span className="text-rose-400 font-bold">
              Remaining: {settings.currencySymbol}{remainingPrincipal.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {loan.lenderBorrower} • {loan.interestRate}{loan.interestType === 'yearly_pct' ? '% p.a.' : ' ₹/100 vatti'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('principalPaid')} (₹) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={principalPaid}
                onChange={e => setPrincipalPaid(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none font-bold text-indigo-300"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('interestPaid')} (₹)
              </label>
              <input
                type="number"
                step="any"
                value={interestPaid}
                onChange={e => setInterestPaid(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none font-bold text-amber-400"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">{t('totalPaidAmount')}:</span>
            <span className="text-sm font-black text-white">
              {settings.currencySymbol}{totalPaid.toLocaleString()}
            </span>
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
                <span>Account Used</span>
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              >
                <option value="" className="bg-slate-900 text-slate-400">None</option>
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
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Month 5 EMI settlement"
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
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow transition"
            >
              Save Repayment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
