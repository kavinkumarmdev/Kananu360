import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { Lock, Delete, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PinLockScreen: React.FC = () => {
  const { user, unlockWithPin, logout } = useAuth();
  const { t } = useFinance();
  const [pin, setPin] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setHasError(false);

    if (nextPin.length === 4) {
      const success = unlockWithPin(nextPin);
      if (success) {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {}
      } else {
        setHasError(true);
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setHasError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 font-sans text-slate-100">
      {/* Background glow */}
      <div className="absolute top-1/3 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full glass-panel rounded-3xl p-8 border border-slate-800 text-center space-y-6 shadow-2xl">
        {/* User avatar & name */}
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-glow flex items-center justify-center text-3xl">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              {user?.avatar || '👤'}
            </div>
          </div>
          <h2 className="text-xl font-black text-white">{user?.name || 'Kavin'}</h2>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs">
            <Lock size={12} />
            <span>{t('authLockApp')}</span>
          </div>
        </div>

        {/* PIN Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2, 3].map(i => {
              const isFilled = pin.length > i;
              return (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                    hasError
                      ? 'bg-rose-500 border-rose-400 animate-shake'
                      : isFilled
                      ? 'bg-indigo-500 border-indigo-400 scale-125 shadow-glow'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                />
              );
            })}
          </div>
          {hasError && (
            <p className="text-xs text-rose-400 font-medium animate-fadeIn">
              {t('authInvalidPin')}
            </p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[220px] mx-auto pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="keypad-btn h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-indigo-600 border border-slate-800 text-base font-bold text-slate-900 dark:text-white transition active:scale-95 flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="keypad-btn col-start-2 h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-indigo-600 border border-slate-800 text-base font-bold text-slate-900 dark:text-white transition active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="keypad-btn h-12 rounded-2xl bg-slate-900/40 hover:bg-slate-800 text-slate-500 hover:text-rose-500 border border-slate-800/60 transition active:scale-95 flex items-center justify-center"
          >
            <Delete size={18} />
          </button>
        </div>

        {/* Bottom options */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition"
          >
            <LogOut size={13} />
            <span>{t('authLogout')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPin('1234');
              unlockWithPin('1234');
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Demo Unlock (1234)
          </button>
        </div>
      </div>
    </div>
  );
};
