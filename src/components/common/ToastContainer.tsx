import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 z-50 flex flex-col gap-2.5 sm:max-w-sm w-auto pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-slate-900/95 border-slate-700 text-slate-200';
        let Icon = Info;
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          bg = 'bg-emerald-950/95 border-emerald-700/60 text-emerald-100';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          bg = 'bg-rose-950/95 border-rose-700/60 text-rose-100';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-950/95 border-amber-700/60 text-amber-100';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3 sm:p-3.5 rounded-xl border backdrop-blur-xl shadow-xl transition-all duration-300 transform translate-y-0 text-xs sm:text-sm ${bg}`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 pr-2 min-w-0">
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${iconColor}`} />
              <p className="font-medium leading-snug break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition shrink-0 ml-1"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
