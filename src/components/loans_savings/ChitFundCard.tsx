import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import type { SavingScheme } from '../../types/finance';
import {
  Coins,
  Trophy,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { InstallmentPaymentModal } from './InstallmentPaymentModal';
import { BulkClaimModal } from './BulkClaimModal';

interface ChitFundCardProps {
  scheme: SavingScheme;
  onEdit: (scheme: SavingScheme) => void;
}

export const ChitFundCard: React.FC<ChitFundCardProps> = ({ scheme, onEdit }) => {
  const { deleteSavingScheme, settings, t } = useFinance();

  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(false);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);

  const installments = scheme.installments || [];
  const completedCount = installments.length;
  const totalMonths = scheme.totalInstallments || 1;
  const progressPercent = Math.min(100, Math.round((completedCount / totalMonths) * 100));

  const totalPaid = installments.reduce((sum, inst) => sum + Number(inst.amountPaid || 0), 0);
  const isClaimed = !!scheme.bulkClaim?.isClaimed;
  const claimedAmount = Number(scheme.bulkClaim?.claimedAmount || 0);

  // Net Gain or Cost calculation:
  // If bulk amount claimed: Net = claimedAmount - totalPaid
  const netGain = isClaimed ? claimedAmount - totalPaid : null;

  return (
    <div className="glass-panel rounded-3xl p-5 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-4 relative overflow-hidden group">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

      <div className="space-y-4">
        {/* Header: Title, Institution, Status badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Coins size={16} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{scheme.name}</h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  {scheme.institution}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                scheme.status === 'completed'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                  : 'bg-indigo-950 text-indigo-300 border-indigo-500/30'
              }`}
            >
              {scheme.status === 'completed' ? 'Completed' : 'Active Scheme'}
            </span>
          </div>
        </div>

        {/* Target Value & Progress Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                {t('totalChitValue')}
              </span>
              <span className="text-lg font-black text-white">
                {formatCurrency(scheme.totalValue, settings.currency)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                {t('totalInvested')}
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {formatCurrency(totalPaid, settings.currency)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>{completedCount} of {totalMonths} Installments Paid</span>
              <span>{progressPercent}% Complete</span>
            </div>
          </div>
        </div>

        {/* BULK PRIZE MONEY / CLAIM BANNER */}
        {isClaimed ? (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-emerald-950/40 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <Trophy size={14} className="text-amber-400 shrink-0" />
                <span>Bulk Payout Claimed:</span>
              </div>
              <span className="text-sm font-black text-amber-300">
                +{formatCurrency(claimedAmount, settings.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Claimed at Month #{scheme.bulkClaim?.claimedInstallmentNo}</span>
              {netGain !== null && (
                <span className={`font-bold ${netGain >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Net: {netGain >= 0 ? '+' : ''}{formatCurrency(netGain, settings.currency)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-dashed border-amber-600/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy size={14} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  {t('bulkClaimTitle')}
                </span>
                <span className="text-[10px] text-slate-400">Not yet claimed / bidded</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowClaimModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shadow-sm transition flex items-center gap-1"
            >
              <Sparkles size={12} />
              <span>Claim</span>
            </button>
          </div>
        )}

        {/* Installments History Expandable Table */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 font-semibold py-1 transition"
          >
            <span>{t('installmentHistory')} ({completedCount})</span>
            {isHistoryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isHistoryExpanded && (
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 max-h-48 overflow-y-auto animate-fadeIn">
              {installments.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-2">
                  No installments recorded yet.
                </p>
              ) : (
                installments.map(inst => (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-slate-900/40 border border-slate-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                        #{inst.installmentNo}
                      </span>
                      <span className="text-slate-300 font-medium">{inst.date}</span>
                      {inst.notes && (
                        <span className="text-slate-500 text-[10px] truncate max-w-[100px]">{inst.notes}</span>
                      )}
                    </div>
                    <span className="font-bold text-white">
                      {formatCurrency(inst.amountPaid, settings.currency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(scheme)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={t('editSavingScheme')}
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Remove scheme "${scheme.name}"?`)) deleteSavingScheme(scheme.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Delete Scheme"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowPayModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow transition"
        >
          <Plus size={13} />
          <span>{t('recordNextInstallment')}</span>
        </button>
      </div>

      {/* Sub-modals */}
      {showPayModal && (
        <InstallmentPaymentModal scheme={scheme} onClose={() => setShowPayModal(false)} />
      )}

      {showClaimModal && (
        <BulkClaimModal scheme={scheme} onClose={() => setShowClaimModal(false)} />
      )}
    </div>
  );
};
