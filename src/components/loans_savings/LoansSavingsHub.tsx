import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import type { Loan, SavingScheme } from '../../types/finance';
import {
  Coins,
  Landmark,
  Plus,
  Trophy,
  Receipt,
  TrendingDown,
  TrendingUp,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ChitFundCard } from './ChitFundCard';
import { SavingModal } from './SavingModal';
import { LoanModal } from './LoanModal';
import { LoanPaymentModal } from './LoanPaymentModal';
import { InstallmentPaymentModal } from './InstallmentPaymentModal';
import { UpcomingDueAlerts } from './UpcomingDueAlerts';

export const LoansSavingsHub: React.FC = () => {
  const {
    loans,
    savings,
    deleteLoan,
    totalLoanLiability,
    totalLoanReceivable,
    totalSavingsInvested,
    totalChitFundsValue,
    totalChitBulkReceived,
    settings,
    t,
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'savings' | 'loans'>('savings');

  // Modal states
  const [showSavingModal, setShowSavingModal] = useState<boolean>(false);
  const [savingToEdit, setSavingToEdit] = useState<SavingScheme | null>(null);

  const [showLoanModal, setShowLoanModal] = useState<boolean>(false);
  const [loanToEdit, setLoanToEdit] = useState<Loan | null>(null);

  const [paymentTargetLoan, setPaymentTargetLoan] = useState<Loan | null>(null);
  const [paymentTargetScheme, setPaymentTargetScheme] = useState<SavingScheme | null>(null);

  const chitFundSchemes = savings.filter(s => s.schemeType === 'chit_fund');
  const fixedSavingSchemes = savings.filter(s => s.schemeType === 'fixed');
  const borrowedLoans = loans.filter(l => l.type === 'borrowed');
  const lentLoans = loans.filter(l => l.type === 'lent');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Main Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Coins className="text-emerald-400 w-6 h-6" />
            <span>{t('loansSavingsTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t('loansSavingsSubtitle')}
          </p>
        </div>

        {/* View Switcher & Add Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle pill */}
          <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center">
            <button
              onClick={() => setActiveSubTab('savings')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'savings'
                  ? 'bg-emerald-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins size={14} />
              <span>{t('tabSavings')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/60 font-medium">
                {savings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('loans')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'loans'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Landmark size={14} />
              <span>{t('tabLoans')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/60 font-medium">
                {loans.length}
              </span>
            </button>
          </div>

          {activeSubTab === 'savings' ? (
            <button
              onClick={() => {
                setSavingToEdit(null);
                setShowSavingModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow transition"
            >
              <Plus size={14} />
              <span>{t('addSavingScheme')}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setLoanToEdit(null);
                setShowLoanModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition"
            >
              <Plus size={14} />
              <span>{t('addLoan')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 15-DAY UPCOMING DUE ALERTS */}
      <UpcomingDueAlerts
        onPayLoan={loan => setPaymentTargetLoan(loan)}
        onPayScheme={scheme => setPaymentTargetScheme(scheme)}
      />

      {/* TOP KPI CARDS */}
      {activeSubTab === 'savings' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Invested */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">{t('totalInvested')}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Coins size={16} />
              </div>
            </div>
            <p className="text-xl font-black text-white">
              {formatCurrency(totalSavingsInvested, settings.currency)}
            </p>
            <p className="text-[11px] text-slate-400">Across {savings.length} active schemes</p>
          </div>

          {/* Active Chit Funds Target Value */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Active Chits Pool Value</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Layers size={16} />
              </div>
            </div>
            <p className="text-xl font-black text-indigo-300">
              {formatCurrency(totalChitFundsValue, settings.currency)}
            </p>
            <p className="text-[11px] text-slate-400">{chitFundSchemes.length} rotational chits</p>
          </div>

          {/* Total Bulk Prize Payouts Claimed */}
          <div className="glass-panel rounded-2xl p-4 border border-amber-900/40 bg-amber-950/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 font-semibold">{t('totalBulkReceivedKpi')}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Trophy size={16} />
              </div>
            </div>
            <p className="text-xl font-black text-amber-400">
              +{formatCurrency(totalChitBulkReceived, settings.currency)}
            </p>
            <p className="text-[11px] text-amber-300/80">Lump-sum auction cash received</p>
          </div>

          {/* Scheme Breakdown */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Schemes Type</span>
              <div className="w-8 h-8 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Sparkles size={16} />
              </div>
            </div>
            <p className="text-lg font-black text-white">
              {chitFundSchemes.length} Chits • {fixedSavingSchemes.length} Fixed
            </p>
            <p className="text-[11px] text-teal-400">Type 1 Fixed & Type 2 Chits</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Loan Liabilities */}
          <div className="glass-panel rounded-2xl p-4 border border-rose-900/40 bg-rose-950/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-300 font-semibold">{t('totalDebtKpi')}</span>
              <div className="w-8 h-8 rounded-xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <TrendingDown size={16} />
              </div>
            </div>
            <p className="text-xl font-black text-rose-400">
              {formatCurrency(totalLoanLiability, settings.currency)}
            </p>
            <p className="text-[11px] text-rose-300/80">{borrowedLoans.length} active borrowed debts</p>
          </div>

          {/* Money Lent (Receivables) */}
          <div className="glass-panel rounded-2xl p-4 border border-emerald-900/40 bg-emerald-950/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-semibold">{t('totalReceivableKpi')}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-xl font-black text-emerald-400">
              +{formatCurrency(totalLoanReceivable, settings.currency)}
            </p>
            <p className="text-[11px] text-emerald-300/80">{lentLoans.length} loans given to others</p>
          </div>

          {/* Active Loans Count */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Total Accounts</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Landmark size={16} />
              </div>
            </div>
            <p className="text-xl font-black text-indigo-300">{loans.length} Loans</p>
            <p className="text-[11px] text-slate-400">Bank KCC, Gold & Financiers</p>
          </div>

          {/* Closed Loans */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Completed Loans</span>
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <p className="text-xl font-black text-white">
              {loans.filter(l => l.status === 'closed').length} Closed
            </p>
            <p className="text-[11px] text-slate-400">Fully settled and cleared</p>
          </div>
        </div>
      )}

      {/* SECTION CONTENT: SAVINGS VIEW */}
      {activeSubTab === 'savings' && (
        <div className="space-y-6">
          {/* TYPE 2: CHIT FUNDS SECTION */}
          <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="text-emerald-400 w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {t('schemeTypeChitFund')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('chitAuctionHint')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSavingToEdit(null);
                  setShowSavingModal(true);
                }}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <Plus size={13} />
                <span>Add Chit</span>
              </button>
            </div>

            {chitFundSchemes.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                <Coins className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">{t('noSavingsYet')}</p>
                <p className="text-[11px] text-slate-500">
                  Example: 5 Lakhs Chit in ABC Company with monthly payments and bulk prize claim.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chitFundSchemes.map(sch => (
                  <ChitFundCard
                    key={sch.id}
                    scheme={sch}
                    onEdit={s => {
                      setSavingToEdit(s);
                      setShowSavingModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* TYPE 1: FIXED / RD SAVINGS SECTION (If any exist) */}
          {fixedSavingSchemes.length > 0 && (
            <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="text-indigo-400 w-5 h-5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {t('schemeTypeFixed')}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Post office, Bank FD/RD and fixed target deposits
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fixedSavingSchemes.map(sch => (
                  <ChitFundCard
                    key={sch.id}
                    scheme={sch}
                    onEdit={s => {
                      setSavingToEdit(s);
                      setShowSavingModal(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION CONTENT: LOANS VIEW */}
      {activeSubTab === 'loans' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="text-indigo-400 w-5 h-5" />
              <div>
                <h3 className="text-sm font-bold text-white">{t('tabLoans')}</h3>
                <p className="text-[11px] text-slate-400">
                  Track Bank KCC, Crop loans, Gold loans, EMIs and private lending
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setLoanToEdit(null);
                setShowLoanModal(true);
              }}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <Plus size={13} />
              <span>{t('addLoan')}</span>
            </button>
          </div>

          {loans.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <Landmark className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">{t('noLoansYet')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loans.map(ln => {
                const totalPrincipalPaid = (ln.payments || []).reduce(
                  (sum, p) => sum + Number(p.principalPaid || 0),
                  0
                );
                const remainingPrincipal = Math.max(0, ln.principalAmount - totalPrincipalPaid);
                const isPaidOff = remainingPrincipal === 0;

                return (
                  <div
                    key={ln.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-3.5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{ln.name}</h4>
                          <p className="text-[11px] text-slate-400">{ln.lenderBorrower}</p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            ln.type === 'borrowed'
                              ? 'bg-rose-950 text-rose-300 border-rose-500/30'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {ln.type === 'borrowed' ? 'Borrowed' : 'Lent'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Principal:</span>
                          <span className="font-bold text-white">
                            {formatCurrency(ln.principalAmount, settings.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Remaining Balance:</span>
                          <span
                            className={`font-black ${
                              isPaidOff ? 'text-emerald-400' : ln.type === 'borrowed' ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {formatCurrency(remainingPrincipal, settings.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span>Interest: {ln.interestRate}{ln.interestType === 'yearly_pct' ? '% p.a.' : ' ₹/100 vatti'}</span>
                          <span>Repaid: {formatCurrency(totalPrincipalPaid, settings.currency)}</span>
                        </div>
                      </div>

                      {ln.notes && (
                        <p className="text-[11px] text-slate-400 italic truncate">{ln.notes}</p>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setLoanToEdit(ln);
                            setShowLoanModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit Loan"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove loan "${ln.name}"?`)) deleteLoan(ln.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete Loan"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {!isPaidOff && (
                        <button
                          type="button"
                          onClick={() => setPaymentTargetLoan(ln)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow transition"
                        >
                          <Receipt size={13} />
                          <span>{t('recordLoanPayment')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <SavingModal
        isOpen={showSavingModal}
        onClose={() => setShowSavingModal(false)}
        schemeToEdit={savingToEdit}
      />

      <LoanModal
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        loanToEdit={loanToEdit}
      />

      {paymentTargetLoan && (
        <LoanPaymentModal
          loan={paymentTargetLoan}
          onClose={() => setPaymentTargetLoan(null)}
        />
      )}

      {paymentTargetScheme && (
        <InstallmentPaymentModal
          scheme={paymentTargetScheme}
          onClose={() => setPaymentTargetScheme(null)}
        />
      )}
    </div>
  );
};
