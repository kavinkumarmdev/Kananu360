import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import type { Budget } from '../../types/finance';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgetToEdit,
}) => {
  const { categories, setBudget, deleteBudget, settings, t, getCategoryName } = useFinance();
  const [categoryId, setCategoryId] = useState<string>('');
  const [limit, setLimit] = useState<string>('');

  const expenseCategories = categories.filter(c => c.type === 'expense');

  useEffect(() => {
    if (budgetToEdit) {
      setCategoryId(budgetToEdit.categoryId);
      setLimit(String(budgetToEdit.monthlyLimit));
    } else {
      setCategoryId(expenseCategories.length > 0 ? expenseCategories[0].id : '');
      setLimit('');
    }
  }, [budgetToEdit, isOpen, expenseCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0 || !categoryId) return;

    await setBudget(categoryId, numLimit);
    onClose();
  };

  const handleDelete = async () => {
    if (budgetToEdit && confirm('Remove this monthly budget target?')) {
      await deleteBudget(budgetToEdit.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? t('adjustMonthlyBudget') : t('setCategoryBudget')}
      subtitle={t('budgetSubtitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('expenseCategory')}
          </label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            disabled={!!budgetToEdit}
            required
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none disabled:opacity-60"
          >
            {expenseCategories.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                {getCategoryName(cat.id, cat.name)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('monthlySpendLimit')} ({settings.currencySymbol})
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
              placeholder="e.g. 10000"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-lg font-bold text-white placeholder-slate-500 focus:outline-none"
              autoFocus
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {t('budgetWarningNote')}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {budgetToEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
            >
              {t('removeTarget')}
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
              {t('saveBudget')}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
