import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import type { SavingsGoal } from '../../types/finance';
import { CATEGORY_PALETTE } from '../../utils/formatters';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

const GOAL_ICONS = ['Target', 'ShieldCheck', 'Plane', 'Laptop', 'Car', 'Home', 'GraduationCap', 'Heart', 'Gem', 'Sparkles'];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addGoal, updateGoal, deleteGoal, settings, t } = useFinance();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('Target');
  const [color, setColor] = useState('#10B981');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmount(String(goalToEdit.targetAmount));
      setCurrentAmount(String(goalToEdit.currentAmount || 0));
      setTargetDate(goalToEdit.targetDate || '');
      setIcon(goalToEdit.icon || 'Target');
      setColor(goalToEdit.color || '#10B981');
      setNotes(goalToEdit.notes || '');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      setTargetDate(future.toISOString().split('T')[0]);
      setIcon('Target');
      setColor(CATEGORY_PALETTE[Math.floor(Math.random() * CATEGORY_PALETTE.length)]);
      setNotes('');
    }
  }, [goalToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseFloat(targetAmount);
    const numCurrent = parseFloat(currentAmount) || 0;
    if (!name.trim() || isNaN(numTarget) || numTarget <= 0) return;

    if (goalToEdit) {
      await updateGoal(goalToEdit.id, {
        name: name.trim(),
        targetAmount: numTarget,
        currentAmount: numCurrent,
        targetDate,
        icon,
        color,
        notes: notes.trim() || undefined,
      });
    } else {
      await addGoal({
        name: name.trim(),
        targetAmount: numTarget,
        currentAmount: numCurrent,
        targetDate,
        icon,
        color,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const handleDelete = async () => {
    if (goalToEdit && confirm(`Are you sure you want to delete goal "${goalToEdit.name}"?`)) {
      await deleteGoal(goalToEdit.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? t('editSavingsGoal') : t('establishSavingsGoal')}
      subtitle="Define a target fund with deadlines and milestone tracking"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('goalName')}
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Emergency Fund, Japan Trip, New Car"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('targetAmount')} ({settings.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              min="1"
              required
              placeholder="e.g. 100000"
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('currentlySaved')} ({settings.currencySymbol})
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={currentAmount}
              onChange={e => setCurrentAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('targetCompletionDate')}
          </label>
          <input
            type="date"
            required
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('goalNotes')}
          </label>
          <input
            type="text"
            placeholder="e.g. Save ₹15,000 monthly from salary"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-100 focus:outline-none"
          />
        </div>

        {/* Icon picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('goalIcon')}
          </label>
          <div className="flex flex-wrap gap-2">
            {GOAL_ICONS.map(ic => (
              <button
                type="button"
                key={ic}
                onClick={() => setIcon(ic)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  icon === ic
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {t('progressColor')}
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

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {goalToEdit ? (
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
            >
              {goalToEdit ? t('saveChanges') : t('establishSavingsGoal')}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
