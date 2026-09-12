import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { ArrowRightLeft, ArrowDown } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { accounts, transferFunds, settings, t } = useFinance();

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('Account Fund Transfer');

  useEffect(() => {
    if (accounts.length >= 2) {
      setFromAccountId(accounts[0].id);
      setToAccountId(accounts[1].id);
    } else if (accounts.length === 1) {
      setFromAccountId(accounts[0].id);
    }
    setAmount('');
    setNote(settings.language === 'ta' ? 'கணக்கு பரிமாற்றம்' : 'Account Fund Transfer');
  }, [isOpen, accounts, settings.language]);

  const fromAcc = accounts.find(a => a.id === fromAccountId);
  const toAcc = accounts.find(a => a.id === toAccountId);
  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || !fromAccountId || !toAccountId || fromAccountId === toAccountId) {
      return;
    }

    await transferFunds(fromAccountId, toAccountId, numAmount, note.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('transferMoney')}
      subtitle={t('transferSubtitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* From Account */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('transferFrom')}
          </label>
          <select
            value={fromAccountId}
            onChange={e => setFromAccountId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                {acc.name} — {t('availableBalance')}: {formatCurrency(acc.balance, settings.currency)}
              </option>
            ))}
          </select>
        </div>

        {/* Center Divider Arrow */}
        <div className="flex justify-center -my-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <ArrowDown size={16} />
          </div>
        </div>

        {/* To Account */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('transferTo')}
          </label>
          <select
            value={toAccountId}
            onChange={e => setToAccountId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
          >
            {accounts
              .filter(acc => acc.id !== fromAccountId)
              .map(acc => (
                <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                  {acc.name} — {t('availableBalance')}: {formatCurrency(acc.balance, settings.currency)}
                </option>
              ))}
          </select>
        </div>

        {/* Transfer Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('transferAmount')} ({settings.currencySymbol})
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
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-lg font-bold text-white placeholder-slate-500 focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Note / Memo */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('transferMemo')}
          </label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. ATM withdrawal, Card bill payment"
            className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-100 focus:outline-none"
          />
        </div>

        {/* Balance Preview Card */}
        {fromAcc && toAcc && numAmount > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
            <span className="font-semibold text-slate-400 block text-[11px] uppercase tracking-wider">
              {t('projectedBalances')}:
            </span>
            <div className="flex justify-between">
              <span className="text-slate-300">{fromAcc.name}:</span>
              <span className="font-bold text-slate-100">
                {formatCurrency(Number(fromAcc.balance) - numAmount, settings.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">{toAcc.name}:</span>
              <span className="font-bold text-emerald-400">
                {formatCurrency(Number(toAcc.balance) + numAmount, settings.currency)}
              </span>
            </div>
          </div>
        )}

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
            disabled={numAmount <= 0 || fromAccountId === toAccountId}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-glow transition"
          >
            <ArrowRightLeft size={14} />
            <span>{t('completeTransfer')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
