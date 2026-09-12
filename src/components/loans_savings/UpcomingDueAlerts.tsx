import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import type { Loan, SavingScheme } from '../../types/finance';
import {
  Bell,
  Clock,
  Receipt,
  Coins,
} from 'lucide-react';

interface UpcomingDueAlertsProps {
  onPayLoan?: (loan: Loan) => void;
  onPayScheme?: (scheme: SavingScheme) => void;
}

export interface DueItem {
  id: string;
  type: 'loan' | 'scheme';
  title: string;
  institution: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  rawLoan?: Loan;
  rawScheme?: SavingScheme;
}

export const UpcomingDueAlerts: React.FC<UpcomingDueAlertsProps> = ({
  onPayLoan,
  onPayScheme,
}) => {
  const { loans, savings, settings } = useFinance();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueItems: DueItem[] = [];

  // 1. Process Loans
  loans
    .filter(l => l.status === 'active' && l.type === 'borrowed')
    .forEach(ln => {
      let targetDueDateStr = ln.dueDate;
      if (!targetDueDateStr && ln.startDate) {
        // Compute next month's due date based on start date
        const stDate = new Date(ln.startDate);
        const dayOfMonth = stDate.getDate();
        const nextDue = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
        if (nextDue < today) {
          nextDue.setMonth(nextDue.getMonth() + 1);
        }
        targetDueDateStr = nextDue.toISOString().split('T')[0];
      }

      if (targetDueDateStr) {
        const dueDate = new Date(targetDueDateStr);
        dueDate.setHours(0, 0, 0, 0);
        const diffMs = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // Remind if within 15 days or overdue (diffDays <= 15)
        if (diffDays <= 15) {
          const totalPrincipalPaid = (ln.payments || []).reduce(
            (sum, p) => sum + Number(p.principalPaid || 0),
            0
          );
          const remainingPrincipal = Math.max(0, ln.principalAmount - totalPrincipalPaid);
          const emiDue = ln.emiAmount || Math.min(remainingPrincipal, Math.round(ln.principalAmount / (ln.tenureMonths || 12)));

          dueItems.push({
            id: `loan_${ln.id}`,
            type: 'loan',
            title: ln.name,
            institution: ln.lenderBorrower,
            amount: emiDue,
            dueDate: targetDueDateStr,
            daysRemaining: diffDays,
            isOverdue: diffDays < 0,
            rawLoan: ln,
          });
        }
      }
    });

  // 2. Process Savings & Chit Funds
  savings
    .filter(s => s.status === 'active')
    .forEach(sch => {
      let targetDueDateStr = sch.dueDate;
      if (!targetDueDateStr) {
        const dayOfMonth = sch.dueDayOfMonth || (sch.startDate ? new Date(sch.startDate).getDate() : 10);
        const nextDue = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
        if (nextDue < today) {
          nextDue.setMonth(nextDue.getMonth() + 1);
        }
        targetDueDateStr = nextDue.toISOString().split('T')[0];
      }

      if (targetDueDateStr) {
        const dueDate = new Date(targetDueDateStr);
        dueDate.setHours(0, 0, 0, 0);
        const diffMs = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 15) {
          const monthlyDue = Math.round(sch.totalValue / (sch.totalInstallments || 1));
          dueItems.push({
            id: `scheme_${sch.id}`,
            type: 'scheme',
            title: sch.name,
            institution: sch.institution,
            amount: monthlyDue,
            dueDate: targetDueDateStr,
            daysRemaining: diffDays,
            isOverdue: diffDays < 0,
            rawScheme: sch,
          });
        }
      }
    });

  // Sort by urgency: overdue first, then closest due date
  dueItems.sort((a, b) => a.daysRemaining - b.daysRemaining);

  if (dueItems.length === 0) return null;

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-rose-950/20 space-y-3.5 animate-fadeIn relative overflow-hidden shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
        <div className="flex items-center gap-2.5 text-amber-400">
          <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-glow animate-pulse">
            <Bell size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span>Upcoming Due Reminders (15 Days)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {dueItems.length} Due Soon
              </span>
            </h3>
            <p className="text-[11px] text-amber-200/80 font-medium">
              Loan EMIs & Chit Fund installments scheduled within the next 15 days
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {dueItems.map(item => (
          <div
            key={item.id}
            className={`p-3.5 rounded-2xl border transition flex flex-col justify-between space-y-2.5 ${
              item.isOverdue
                ? 'bg-rose-950/40 border-rose-500/50 hover:border-rose-400'
                : item.daysRemaining <= 5
                ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  {item.type === 'loan' ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                      Loan EMI
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      Chit Fund
                    </span>
                  )}
                  <span className="text-xs font-bold text-white truncate max-w-[140px]">
                    {item.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.institution}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-white block">
                  {formatCurrency(item.amount, settings.currency)}
                </span>
                <span
                  className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                    item.isOverdue
                      ? 'text-rose-400'
                      : item.daysRemaining <= 5
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  <Clock size={10} />
                  {item.isOverdue
                    ? `Overdue by ${Math.abs(item.daysRemaining)}d`
                    : item.daysRemaining === 0
                    ? 'Due Today!'
                    : `Due in ${item.daysRemaining} days`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
              <span className="text-slate-400 font-medium">Due: {item.dueDate}</span>

              {item.type === 'loan' && onPayLoan && item.rawLoan && (
                <button
                  type="button"
                  onClick={() => onPayLoan(item.rawLoan!)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1"
                >
                  <Receipt size={10} />
                  <span>Pay EMI</span>
                </button>
              )}

              {item.type === 'scheme' && onPayScheme && item.rawScheme && (
                <button
                  type="button"
                  onClick={() => onPayScheme(item.rawScheme!)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1"
                >
                  <Coins size={10} />
                  <span>Pay Chit</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
