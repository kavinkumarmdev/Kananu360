import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import type { Account, AccountType } from '../../types/finance';
import { CATEGORY_PALETTE } from '../../utils/formatters';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account | null;
}

const ACCOUNT_ICONS = ['Building2', 'Wallet', 'CreditCard', 'Coins', 'QrCode', 'PiggyBank', 'Landmark', 'BadgePercent'];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
}) => {
  const { addAccount, updateAccount, deleteAccount, settings, t } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [icon, setIcon] = useState('Building2');
  const [color, setColor] = useState('#6366F1');

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setBalance(String(accountToEdit.balance));
      setAccountNumber(accountToEdit.accountNumber || '');
      setIcon(accountToEdit.icon || 'Building2');
      setColor(accountToEdit.color || '#6366F1');
    } else {
      setName('');
      setType('bank');
      setBalance('0');
      setAccountNumber('');
      setIcon('Building2');
      setColor(CATEGORY_PALETTE[Math.floor(Math.random() * CATEGORY_PALETTE.length)]);
    }
  }, [accountToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numBalance = parseFloat(balance) || 0;
    if (!name.trim()) return;

    if (accountToEdit) {
      await updateAccount(accountToEdit.id, {
        name: name.trim(),
        type,
        balance: numBalance,
        accountNumber: accountNumber.trim() || undefined,
        icon,
        color,
      });
    } else {
      await addAccount({
        name: name.trim(),
        type,
        balance: numBalance,
        accountNumber: accountNumber.trim() || undefined,
        icon,
        color,
      });
    }

    onClose();
  };

  const handleDelete = async () => {
    if (accountToEdit && confirm(`Are you sure you want to remove account "${accountToEdit.name}"?`)) {
      await deleteAccount(accountToEdit.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? t('editAccount') : t('addAccount')}
      subtitle="Track balances across banks, credit cards, UPI, and cash"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('accountName')}
          </label>
          <input
            type="text"
            required
            placeholder="e.g. HDFC Salary, SBI Savings, Cash in Pocket"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('accountType')}
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as AccountType)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
            >
              <option value="bank" className="bg-slate-900">{t('bankAccount')}</option>
              <option value="cash" className="bg-slate-900">{t('cashInHand')}</option>
              <option value="upi" className="bg-slate-900">{t('digitalWallet')}</option>
              <option value="credit_card" className="bg-slate-900">{t('creditCard')}</option>
              <option value="investment" className="bg-slate-900">{t('investmentAccount')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('currentBalance')} ({settings.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={balance}
              onChange={e => setBalance(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('accountNumberHint')}
          </label>
          <input
            type="text"
            placeholder="e.g. •••• 4892"
            value={accountNumber}
            onChange={e => setAccountNumber(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-100 focus:outline-none"
          />
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('badgeColor')}
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_PALETTE.map(c => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('accountIcon')}
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_ICONS.map(ic => (
              <button
                type="button"
                key={ic}
                onClick={() => setIcon(ic)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  icon === ic
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {accountToEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
            >
              {t('delete')}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition"
            >
              {accountToEdit ? t('saveAccount') : t('createAccount')}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
