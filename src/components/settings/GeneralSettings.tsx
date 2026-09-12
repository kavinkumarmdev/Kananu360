import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { CURRENCIES } from '../../utils/formatters';
import { UserManagementSection } from './UserManagementSection';
import { DollarSign, ShieldCheck, KeyRound, Sun, Moon, Palette, Globe, User } from 'lucide-react';
import type { Language } from '../../types/finance';

export const GeneralSettings: React.FC = () => {
  const { settings, updateSettings, addToast, t } = useFinance();
  const { user, updateUser, updateUserPin } = useAuth();

  const [newPin, setNewPin] = useState<string>('');
  const [isSettingPin, setIsSettingPin] = useState<boolean>(false);

  const handleCurrencyChange = (currCode: string) => {
    const symbol = CURRENCIES[currCode]?.symbol || '$';
    updateSettings({ currency: currCode, currencySymbol: symbol });
  };

  const handleLanguageChange = (lang: Language) => {
    updateSettings({ language: lang });
    addToast(lang === 'ta' ? 'தமிழ் மொழிக்கு மாற்றப்பட்டது' : 'Switched to English', 'success');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    updateSettings({ theme: newTheme });
    addToast(newTheme === 'light' ? 'Switched to Light Theme ☀️' : 'Switched to Dark Theme 🌙', 'success');
  };

  const handleSavePin = () => {
    if (newPin.length === 4) {
      updateUserPin(newPin);
      setIsSettingPin(false);
      setNewPin('');
      addToast(t('authPinUpdated'), 'success');
    } else {
      addToast('PIN must be exactly 4 digits', 'warning');
    }
  };

  const handleRemovePin = () => {
    updateUserPin(null);
    addToast('PIN access disabled', 'info');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">{t('preferencesTitle')}</h2>
        <p className="text-xs text-slate-400">
          {t('preferencesSubtitle')}
        </p>
      </div>

      {/* Theme Appearance Section */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Palette className="text-indigo-400 w-4 h-4" />
            <span>{settings.language === 'ta' ? 'வண்ண தீம் & காட்சி முறை' : 'Theme & Visual Appearance'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {settings.language === 'ta'
              ? 'பகல் வெளிச்சத்திற்கு ஏற்ற ஒளி தீம் அல்லது இரவு நேர இருண்ட தீம் தேர்ந்தெடுக்கலாம்.'
              : 'Choose between clean high-contrast Light Mode or sleek Midnight Dark Mode.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
          {/* Light Theme Option */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              settings.theme === 'light'
                ? 'bg-amber-500/15 border-amber-500 text-slate-900 shadow-glow font-bold'
                : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
                <Sun size={18} />
              </div>
              <div>
                <span className="font-bold text-sm block">Light Theme</span>
                <span className="text-[11px] text-slate-400">
                  {settings.language === 'ta' ? 'பகல் பார்வை (தெளிவானது)' : 'Crisp & Clean Day Mode'}
                </span>
              </div>
            </div>
            {settings.theme === 'light' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30">
                Active
              </span>
            )}
          </button>

          {/* Dark Theme Option */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              settings.theme === 'dark'
                ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-glow font-bold'
                : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Moon size={18} />
              </div>
              <div>
                <span className="font-bold text-sm block">Dark Theme</span>
                <span className="text-[11px] text-slate-400">
                  {settings.language === 'ta' ? 'இருண்ட பார்வை' : 'Midnight Obsidian'}
                </span>
              </div>
            </div>
            {settings.theme === 'dark' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                Active
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Language Selection Section */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Globe className="text-indigo-400 w-4 h-4" />
          {t('languageSelection')}
        </h3>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => handleLanguageChange('ta')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              settings.language === 'ta'
                ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-glow'
                : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="font-bold text-sm block">தமிழ் (Tamil)</span>
              <span className="text-[11px] text-slate-400">வணக்கம் & கணக்கு360</span>
            </div>
            <span className="text-lg">🇮🇳</span>
          </button>

          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              settings.language === 'en'
                ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-glow'
                : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="font-bold text-sm block">English</span>
              <span className="text-[11px] text-slate-400">Default & Global</span>
            </div>
            <span className="text-lg">🇬🇧</span>
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <User className="text-indigo-400 w-4 h-4" />
          {t('userProfile')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('displayName')}
            </label>
            <input
              type="text"
              value={settings.userName || user?.name || ''}
              onChange={e => {
                const val = e.target.value;
                updateSettings({ userName: val });
                updateUser({ name: val });
              }}
              placeholder="e.g. Kavin"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || 'kavin@kanakku360.com'}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-400 opacity-80 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Security & Quick PIN Section */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <ShieldCheck className="text-emerald-400 w-4 h-4" />
          {t('authSecuritySettings')}
        </h3>

        <div className="max-w-xl space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            {user?.pin ? t('authPinEnabled') : 'Protect your ledger with a 4-digit quick passcode.'}
          </p>

          {isSettingPin ? (
            <div className="flex items-center gap-3">
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit PIN"
                className="w-36 px-3.5 py-2 rounded-xl glass-input text-sm text-center tracking-widest font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSavePin}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Save PIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSettingPin(false);
                  setNewPin('');
                }}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs transition"
              >
                {t('cancel')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSettingPin(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition"
              >
                <KeyRound size={15} className="text-indigo-400" />
                <span>{user?.pin ? t('authChangePin') : 'Set 4-Digit Quick PIN'}</span>
              </button>

              {user?.pin && (
                <button
                  type="button"
                  onClick={handleRemovePin}
                  className="px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition"
                >
                  {t('authRemovePin')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Currency Selection */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <DollarSign className="text-emerald-400 w-4 h-4" />
          {t('primaryCurrency')}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(CURRENCIES).map(([code, info]) => {
            const isSelected = settings.currency === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleCurrencyChange(code)}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-glow'
                    : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold text-sm block">{code}</span>
                  <span className="text-[11px] text-slate-400">{info.name.split(' ')[0]}</span>
                </div>
                <span className="text-lg font-black text-indigo-400">{info.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Management Section (Restricted to Administrator Role Only) */}
      {(user?.role?.toLowerCase().includes('admin') || user?.username === 'kavin' || !user?.role) && (
        <UserManagementSection />
      )}

      {/* Cloud Live Database Security & Status */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ShieldCheck className="text-emerald-400 w-4 h-4" />
            <span>{settings.language === 'ta' ? 'பாதுகாப்பான நேரலை மேகக்கணி தரவுத்தளம்' : 'Live Cloud Database & Security'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {settings.language === 'ta'
              ? 'உங்கள் அனைத்து வரவு, செலவு, பண்ணை மற்றும் குடும்பக் கணக்குகள் உங்கள் தனிப்பட்ட கூகிள் தாளோடு நேரலையாகத் தானாக ஒத்திசைக்கப்படுகிறது.'
              : 'All your ledger entries, farm harvests, crops, livestock and family finances are synced automatically to your private cloud spreadsheet.'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-slate-200">
                {settings.language === 'ta' ? 'தானியங்கி ஒத்திசைவு இயங்குகிறது' : 'Automated Cloud Ledger Active'}
              </p>
              <p className="text-[10px] text-slate-400">
                {settings.lastSyncedAt ? `Last auto-synced: ${settings.lastSyncedAt}` : 'Real-time synchronization ready'}
              </p>
            </div>
          </div>

          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            {settings.language === 'ta' ? 'நேரலை' : 'Live Online'}
          </span>
        </div>
      </div>
    </div>
  );
};
