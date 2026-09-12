import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { SavingScheme } from '../../types/finance';
import { Trophy, X, Calendar, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BulkClaimModalProps {
  scheme: SavingScheme;
  onClose: () => void;
}

export const BulkClaimModal: React.FC<BulkClaimModalProps> = ({
  scheme,
  onClose,
}) => {
  const { recordSavingBulkClaim, accounts, settings, t } = useFinance();

  const currentMonthNo = (scheme.installments?.length || 0);

  const [claimedAmount, setClaimedAmount] = useState<string>(
    scheme.bulkClaim?.claimedAmount ? String(scheme.bulkClaim.claimedAmount) : String(scheme.totalValue * 0.9)
  );
  const [claimedDate, setClaimedDate] = useState<string>(
    scheme.bulkClaim?.claimedDate || new Date().toISOString().split('T')[0]
  );
  const [claimedInstallmentNo, setClaimedInstallmentNo] = useState<number>(
    scheme.bulkClaim?.claimedInstallmentNo || currentMonthNo || 1
  );
  const [accountId, setAccountId] = useState<string>(
    scheme.bulkClaim?.accountId || accounts.find(a => a.isDefault)?.id || accounts[0]?.id || ''
  );
  const [notes, setNotes] = useState<string>(scheme.bulkClaim?.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(claimedAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    await recordSavingBulkClaim(
      scheme.id,
      {
        claimedAmount: numAmount,
        claimedDate,
        claimedInstallmentNo: Number(claimedInstallmentNo),
        accountId: accountId || undefined,
        notes: notes.trim() || undefined,
      },
      true
    );

    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel rounded-2xl p-6 border border-amber-500/30 max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy size={22} className="animate-bounce" />
            <h3 className="font-bold text-white text-base">
              {t('claimBulkPayout')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs space-y-1.5 text-amber-200">
          <p className="font-bold text-sm text-white">{scheme.name}</p>
          <p className="text-[11px] text-amber-300">
            Chit Target Value: <span className="font-bold">{settings.currencySymbol}{scheme.totalValue.toLocaleString()}</span> • Total {scheme.totalInstallments} Months
          </p>
          <p className="text-[11px] text-slate-300">
            Record the lump-sum cash/cheque amount you took from this chit fund auction.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('bulkPayoutAmount')} *
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 458746"
              value={claimedAmount}
              onChange={e => setClaimedAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white focus:outline-none font-black text-amber-400"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('claimedInstallmentNo')}
              </label>
              <input
                type="number"
                min="1"
                max={scheme.totalInstallments}
                required
                value={claimedInstallmentNo}
                onChange={e => setClaimedInstallmentNo(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" />
                <span>{t('claimedDate')}</span>
              </label>
              <input
                type="date"
                required
                value={claimedDate}
                onChange={e => setClaimedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Wallet size={12} className="text-slate-400" />
              <span>{t('depositAccount')}</span>
            </label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
            >
              <option value="" className="bg-slate-900 text-slate-400">None (Do not auto-credit)</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                  {acc.name} ({settings.currencySymbol}{acc.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Bidded at 4th month, Cheque #88123"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-glow transition flex items-center gap-1.5"
            >
              <Trophy size={14} />
              <span>Save Bulk Prize Payout</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
