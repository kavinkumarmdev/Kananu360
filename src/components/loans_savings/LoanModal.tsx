import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { Loan, LoanType, InterestType } from '../../types/finance';
import { Landmark, X } from 'lucide-react';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanToEdit?: Loan | null;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  loanToEdit,
}) => {
  const { addLoan, updateLoan, t } = useFinance();

  const [type, setType] = useState<LoanType>('borrowed');
  const [name, setName] = useState<string>('');
  const [lenderBorrower, setLenderBorrower] = useState<string>('');
  const [principalAmount, setPrincipalAmount] = useState<string>('300000');
  const [interestRate, setInterestRate] = useState<string>('7');
  const [interestType, setInterestType] = useState<InterestType>('yearly_pct');
  const [emiAmount, setEmiAmount] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [tenureMonths, setTenureMonths] = useState<string>('12');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (loanToEdit) {
      setType(loanToEdit.type);
      setName(loanToEdit.name);
      setLenderBorrower(loanToEdit.lenderBorrower);
      setPrincipalAmount(String(loanToEdit.principalAmount));
      setInterestRate(String(loanToEdit.interestRate));
      setInterestType(loanToEdit.interestType);
      setEmiAmount(loanToEdit.emiAmount ? String(loanToEdit.emiAmount) : '');
      setStartDate(loanToEdit.startDate);
      setDueDate(loanToEdit.dueDate || '');
      setTenureMonths(loanToEdit.tenureMonths ? String(loanToEdit.tenureMonths) : '12');
      setNotes(loanToEdit.notes || '');
    } else {
      setType('borrowed');
      setName('');
      setLenderBorrower('');
      setPrincipalAmount('300000');
      setInterestRate('7');
      setInterestType('yearly_pct');
      setEmiAmount('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setTenureMonths('12');
      setNotes('');
    }
  }, [loanToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numPrincipal = parseFloat(principalAmount) || 0;
    const numRate = parseFloat(interestRate) || 0;
    const numEmi = emiAmount ? parseFloat(emiAmount) : undefined;
    const numTenure = tenureMonths ? parseInt(tenureMonths) : undefined;

    if (loanToEdit) {
      await updateLoan(loanToEdit.id, {
        type,
        name: name.trim(),
        lenderBorrower: lenderBorrower.trim() || 'Bank',
        principalAmount: numPrincipal,
        interestRate: numRate,
        interestType,
        emiAmount: numEmi,
        startDate,
        dueDate: dueDate || undefined,
        tenureMonths: numTenure,
        notes: notes.trim() || undefined,
      });
    } else {
      await addLoan({
        type,
        name: name.trim(),
        lenderBorrower: lenderBorrower.trim() || 'Bank',
        principalAmount: numPrincipal,
        interestRate: numRate,
        interestType,
        emiAmount: numEmi,
        startDate,
        dueDate: dueDate || undefined,
        tenureMonths: numTenure,
        status: 'active',
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 max-w-lg w-full space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Landmark size={22} />
            <h3 className="font-bold text-white text-base">
              {loanToEdit ? t('editLoan') : t('addLoan')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Loan Type Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setType('borrowed')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
              type === 'borrowed'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('loanTypeBorrowed')}
          </button>
          <button
            type="button"
            onClick={() => setType('lent')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
              type === 'lent'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('loanTypeLent')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('loanName')} *
            </label>
            <input
              type="text"
              required
              placeholder={t('loanNamePlaceholder')}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('lenderBorrower')}
            </label>
            <input
              type="text"
              placeholder={t('lenderBorrowerPlaceholder')}
              value={lenderBorrower}
              onChange={e => setLenderBorrower(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('principalAmount')} (₹) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 300000"
                value={principalAmount}
                onChange={e => setPrincipalAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none font-bold text-rose-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('monthlyEmi')} (₹)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 15000"
                value={emiAmount}
                onChange={e => setEmiAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('interestRate')}
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 7 or 1.5"
                value={interestRate}
                onChange={e => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('interestType')}
              </label>
              <select
                value={interestType}
                onChange={e => setInterestType(e.target.value as InterestType)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              >
                <option value="yearly_pct" className="bg-slate-900">{t('interestTypeYearly')}</option>
                <option value="monthly_vatti" className="bg-slate-900">{t('interestTypeMonthlyVatti')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('loanDueDate')} (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Land documents pledged at bank, Loan A/c #389201"
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
              Save Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
