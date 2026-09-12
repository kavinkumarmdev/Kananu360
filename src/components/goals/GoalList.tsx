import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculatePercentage, formatDate } from '../../utils/formatters';
import { IconRenderer } from '../common/IconRenderer';
import { GoalModal } from './GoalModal';
import { DepositModal } from './DepositModal';
import { Plus, PlusCircle, Edit3, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import type { SavingsGoal } from '../../types/finance';

export const GoalList: React.FC = () => {
  const { goals, settings, t } = useFinance();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
  const overallProgress = calculatePercentage(totalSaved, totalTarget);

  const handleOpenAdd = () => {
    setSelectedGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenDeposit = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsDepositModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">{t('goalsTitle')}</h2>
          <p className="text-xs text-slate-400">
            {formatCurrency(totalTarget, settings.currency)} ({goals.length} {t('goalsSubtitle')})
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
        >
          <Plus size={15} />
          <span>{t('newSavingsGoal')}</span>
        </button>
      </div>

      {/* Overview Progress Card */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-glow-emerald">
              <Sparkles size={24} />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {t('totalSavedInGoals')}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-white">
                  {formatCurrency(totalSaved, settings.currency)}
                </span>
                <span className="text-sm text-slate-400">
                  / {formatCurrency(totalTarget, settings.currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400">{t('milestoneProgress')}</span>
              <div className="text-xl font-black text-emerald-400">{overallProgress}%</div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-900 h-2.5 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-800">
          <div
            className="bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(goal => {
          const progress = calculatePercentage(Number(goal.currentAmount), Number(goal.targetAmount));
          const isCompleted = Number(goal.currentAmount) >= Number(goal.targetAmount);
          const remaining = Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount));

          return (
            <div
              key={goal.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/5"
                      style={{ backgroundColor: `${goal.color || '#10b981'}20` }}
                    >
                      <IconRenderer
                        name={goal.icon || 'Target'}
                        color={goal.color || '#10b981'}
                        size={22}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition">
                        {goal.name}
                      </h3>
                      {goal.targetDate && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> {t('targetDate')}: {formatDate(goal.targetDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(goal)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Edit3 size={15} />
                  </button>
                </div>

                {goal.notes && (
                  <p className="text-xs text-slate-400 italic mt-3 line-clamp-2">
                    "{goal.notes}"
                  </p>
                )}

                {/* Amounts and Progress */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-white text-sm">
                      {formatCurrency(goal.currentAmount, settings.currency)}
                    </span>
                    <span className="text-slate-400">
                      / {formatCurrency(goal.targetAmount, settings.currency)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        backgroundColor: goal.color || '#10b981',
                        width: `${Math.min(100, progress)}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                    <span className="font-semibold text-emerald-400">{progress}%</span>
                    {isCompleted ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> {t('goalAchieved')}
                      </span>
                    ) : (
                      <span>{formatCurrency(remaining, settings.currency)} {t('left')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenDeposit(goal)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <PlusCircle size={14} className="text-emerald-400" />
                  <span>{t('depositFunds')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={selectedGoal}
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        goal={selectedGoal}
      />
    </div>
  );
};
