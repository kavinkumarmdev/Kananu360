import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { SavingScheme, SavingSchemeType, SavingFrequency } from '../../types/finance';
import { Landmark, Coins, X } from 'lucide-react';

interface SavingModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemeToEdit?: SavingScheme | null;
}

export const SavingModal: React.FC<SavingModalProps> = ({
  isOpen,
  onClose,
  schemeToEdit,
}) => {
  const { addSavingScheme, updateSavingScheme, t } = useFinance();

  const [schemeType, setSchemeType] = useState<SavingSchemeType>('chit_fund');
  const [name, setName] = useState<string>('');
  const [institution, setInstitution] = useState<string>('');
  const [totalValue, setTotalValue] = useState<string>('500000');
  const [totalInstallments, setTotalInstallments] = useState<string>('20');
  const [frequency, setFrequency] = useState<SavingFrequency>('monthly');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (schemeToEdit) {
      setSchemeType(schemeToEdit.schemeType);
      setName(schemeToEdit.name);
      setInstitution(schemeToEdit.institution);
      setTotalValue(String(schemeToEdit.totalValue));
      setTotalInstallments(String(schemeToEdit.totalInstallments));
      setFrequency(schemeToEdit.frequency);
      setStartDate(schemeToEdit.startDate);
      setNotes(schemeToEdit.notes || '');
    } else {
      setSchemeType('chit_fund');
      setName('');
      setInstitution('');
      setTotalValue('500000');
      setTotalInstallments('20');
      setFrequency('monthly');
      setStartDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [schemeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numValue = parseFloat(totalValue) || 0;
    const numInstallments = parseInt(totalInstallments) || 1;

    if (schemeToEdit) {
      await updateSavingScheme(schemeToEdit.id, {
        schemeType,
        name: name.trim(),
        institution: institution.trim() || 'Direct',
        totalValue: numValue,
        totalInstallments: numInstallments,
        frequency,
        startDate,
        notes: notes.trim() || undefined,
      });
    } else {
      await addSavingScheme({
        schemeType,
        name: name.trim(),
        institution: institution.trim() || 'Direct',
        totalValue: numValue,
        totalInstallments: numInstallments,
        frequency,
        startDate,
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
          <div className="flex items-center gap-2 text-emerald-400">
            <Coins size={22} />
            <h3 className="font-bold text-white text-base">
              {schemeToEdit ? t('editSavingScheme') : t('addSavingScheme')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scheme Type Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setSchemeType('chit_fund')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              schemeType === 'chit_fund'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins size={14} />
            <span>Type 2: Chit Fund (ஏலச் சீட்டு)</span>
          </button>

          <button
            type="button"
            onClick={() => setSchemeType('fixed')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              schemeType === 'fixed'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Landmark size={14} />
            <span>Type 1: Fixed / RD / FD</span>
          </button>
        </div>

        {/* Informative Hint Banner */}
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 leading-relaxed">
          {schemeType === 'chit_fund' ? (
            <span>
              💡 <strong>Chit Fund / Rotational Scheme:</strong> You contribute monthly dues (varying with auction dividend) and can claim the bulk prize cash at any installment.
            </span>
          ) : (
            <span>
              💡 <strong>Fixed / RD Scheme:</strong> Standard recurring deposits or bank investments with a fixed maturity target.
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('schemeName')} *
            </label>
            <input
              type="text"
              required
              placeholder={t('schemeNamePlaceholder')}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('institutionCompany')}
            </label>
            <input
              type="text"
              placeholder={t('institutionCompanyPlaceholder')}
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('totalChitValue')} (Target ₹) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 500000"
                value={totalValue}
                onChange={e => setTotalValue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('totalInstallments')} (Months) *
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 20"
                value={totalInstallments}
                onChange={e => setTotalInstallments(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('installmentFrequency')}
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as SavingFrequency)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              >
                <option value="monthly" className="bg-slate-900">{t('freqMonthly')}</option>
                <option value="weekly" className="bg-slate-900">{t('freqWeekly')}</option>
                <option value="quarterly" className="bg-slate-900">{t('freqQuarterly')}</option>
                <option value="yearly" className="bg-slate-900">{t('freqYearly')}</option>
              </select>
            </div>

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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Foreman commission 5%, Auction on 10th of every month"
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
              Save Scheme
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
