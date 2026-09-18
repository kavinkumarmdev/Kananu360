import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sparkles,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Database,
  TrendingUp,
  Landmark,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandLogo } from '../common/BrandLogo';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { settings, updateSettings, t } = useFinance();

  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'],
      });
    } catch {
      // Ignore if canvas-confetti fails
    }
  };

  const handleToggleLanguage = () => {
    const nextLang = settings.language === 'ta' ? 'en' : 'ta';
    updateSettings({ language: nextLang });
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: nextTheme });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usernameOrEmail.trim()) {
      setErrorMessage(
        settings.language === 'ta'
          ? 'பயனர் பெயர் அல்லது மின்னஞ்சலை உள்ளிடவும்.'
          : 'Please enter your username or email.'
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        settings.language === 'ta'
          ? 'கடவுச்சொல்லை உள்ளிடவும்.'
          : 'Please enter your password.'
      );
      return;
    }

    const res = await login({
      emailOrUsername: usernameOrEmail.trim(),
      password,
    });

    if (res.success) {
      triggerConfetti();
    } else {
      setErrorMessage(
        res.error ||
          (settings.language === 'ta'
            ? 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்.'
            : 'Invalid username or password.')
      );
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-x-hidden overflow-y-auto lg:overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Meshes (contained to prevent overflow) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      {/* Header bar: Logo + Theme + Language */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between shrink-0">
        <BrandLogo size="lg" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleTheme}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition shadow-sm hover:border-indigo-500/50 cursor-pointer"
            title={settings.theme === 'light' ? 'Switch to Dark Mode (🌙)' : 'Switch to Light Mode (☀️)'}
          >
            {settings.theme === 'light' ? (
              <Moon size={15} className="text-indigo-500" />
            ) : (
              <Sun size={15} className="text-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition shadow-sm hover:border-indigo-500/50 cursor-pointer"
            title="Switch English / தமிழ்"
          >
            <Globe size={15} className="text-indigo-400" />
            <span>{settings.language === 'ta' ? 'தமிழ் (TA)' : 'English (EN)'}</span>
            <span className="text-xs">{settings.language === 'ta' ? '🇮🇳' : '🇬🇧'}</span>
          </button>
        </div>
      </header>

      {/* Main Content: Split Layout */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-0 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center my-auto">
          {/* Left Column: System Highlights & Features */}
          <div className="lg:col-span-6 space-y-4 lg:space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold shadow-inner">
              <Sparkles size={13} className="text-indigo-400" />
              <span>
                {settings.language === 'ta'
                  ? 'நவீன குடும்ப & பண்ணை நிதி கணக்கு தளம்'
                  : 'Smart Personal & Farm Accounting System'}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {settings.language === 'ta' ? (
                  <>
                    வரவு, செலவு & <br />
                    <span className="text-gradient">பண்ணை நேரலைக் கணக்குகள்</span>
                  </>
                ) : (
                  <>
                    Effortless Personal, <br />
                    <span className="text-gradient">Family & Farm Accounts</span>
                  </>
                )}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg">
                {settings.language === 'ta'
                  ? 'உங்கள் வருமானம், செலவுகள், பண்ணை பயிர்கள், கால்நடைகள், கடன்கள் மற்றும் சேமிப்புகளை ஒரே இடத்தில் நிர்வகிக்கவும்.'
                  : 'Track transactions, manage farm harvests & coolie wages, monitor loans and chit funds with real-time Google Sheets sync.'}
              </p>
            </div>

            {/* Feature Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {settings.language === 'ta' ? 'முழுமையான வரவு செலவு' : 'Comprehensive Ledger'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    {settings.language === 'ta' ? 'வருமானம், செலவு & வரம்புகள்' : 'Income, expenses & category budgets'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Database size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {settings.language === 'ta' ? 'கூகிள் தாள் நேரலை' : 'Google Sheets DB'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    {settings.language === 'ta' ? 'தடையில்லா கிளவுட் ஒத்திசைவு' : 'Real-time two-way cloud sync'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                  <Landmark size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {settings.language === 'ta' ? 'கடன்கள் & சேமிப்புகள்' : 'Loans & Chit Funds'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    {settings.language === 'ta' ? 'வட்டி, EMI & சீட்டு கணக்குகள்' : 'Vatti interest, EMIs & payouts'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {settings.language === 'ta' ? 'பாதுகாப்பான தரவு' : 'Private & Secure'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    {settings.language === 'ta' ? 'உலாவியில் பாதுகாப்பான சேமிப்பு' : 'Encrypted client-side storage'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Username & Password Login Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-indigo-500/20 bg-slate-900/80 shadow-2xl backdrop-blur-xl relative">
              <div className="text-center space-y-1 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-glow mb-2.5">
                  <Lock size={20} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {settings.language === 'ta' ? 'உள்நுழையவும்' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-400">
                  {settings.language === 'ta'
                    ? 'உங்கள் பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.'
                    : 'Enter your username and password to access your account.'}
                </p>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-600/60 text-rose-200 text-xs flex items-center gap-2 animate-shake">
                  <span className="font-bold text-sm">⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {t('authEmailOrUsername')}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={usernameOrEmail}
                      onChange={e => {
                        setUsernameOrEmail(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder={settings.language === 'ta' ? 'பயனர் பெயர் அல்லது மின்னஞ்சல்' : 'Username or email'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      {t('authPassword')}
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder={settings.language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>{t('authRememberMe')}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t('authSignInButton')}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 text-center border-t border-slate-900 text-[11px] text-slate-500 shrink-0">
        <p>© 2026 Kanakku360 • Smart Personal & Farm Finance Management System</p>
      </footer>
    </div>
  );
};
