import {
  LayoutDashboard,
  Sprout,
  Receipt,
  PieChart,
  Wallet,
  Target,
  Settings,
  X,
  LogOut,
  Coins,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import type { TranslationKey } from '../../utils/i18n';

import { BrandLogo } from '../common/BrandLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { transactions, accounts, budgets, goals, loans, savings, pendingWageTransactions, settings, updateSettings, t } = useFinance();
  const { user, logout } = useAuth();

  const toggleLanguage = () => {
    const nextLang = settings.language === 'ta' ? 'en' : 'ta';
    updateSettings({ language: nextLang });
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: nextTheme });
  };

  const navItems: { id: string; labelKey: TranslationKey; icon: any; badge: number | null; highlight?: boolean }[] = [
    { id: 'dashboard', labelKey: 'navDashboard', icon: LayoutDashboard, badge: null },
    { id: 'farm', labelKey: 'navFarm', icon: Sprout, badge: pendingWageTransactions.length > 0 ? pendingWageTransactions.length : null },
    { id: 'transactions', labelKey: 'navTransactions', icon: Receipt, badge: transactions.length },
    { id: 'loans_savings', labelKey: 'navLoansSavings', icon: Coins, badge: (loans.length + savings.length) > 0 ? (loans.length + savings.length) : null },
    { id: 'budgets', labelKey: 'navBudgets', icon: PieChart, badge: budgets.length },
    { id: 'accounts', labelKey: 'navAccounts', icon: Wallet, badge: accounts.length },
    { id: 'goals', labelKey: 'navGoals', icon: Target, badge: goals.length },
    { id: 'settings', labelKey: 'navSettings', icon: Settings, badge: null },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-700/80 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="whitespace-nowrap">{t(item.labelKey)}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ml-1.5 ${
                      isActive
                        ? 'bg-indigo-900/80 text-indigo-100'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.highlight && (
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold animate-pulse shrink-0 ml-1.5">
                    {t('setupPrompt')}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & User Profile */}
      <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
        {/* Live System Indicator */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-200 block truncate">
              {settings.language === 'ta' ? 'நேரலை மேகக்கணி இணைப்பு' : 'Live Cloud Database'}
            </span>
            <span className="text-[10px] text-emerald-400/90 block truncate">
              {settings.lastSyncedAt ? `Auto-Synced ${settings.lastSyncedAt}` : 'Active & Synced'}
            </span>
          </div>
        </div>

        {/* User profile capsule */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0 pr-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-base shrink-0">
              {user?.avatar || '👤'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Kavin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role?.split('(')[0] || 'Member'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition shrink-0"
            title={t('authLogout')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Pinned Sidebar with widened width */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 glass-panel border-r border-slate-800/80 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        {navContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col z-10">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <BrandLogo size="sm" onClick={() => handleNavClick('dashboard')} />
              <div className="flex items-center gap-1.5">
                {/* Mobile Drawer Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 hover:bg-slate-800 transition"
                  title={settings.theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                >
                  {settings.theme === 'light' ? (
                    <Moon size={15} className="text-indigo-400" />
                  ) : (
                    <Sun size={15} className="text-amber-400" />
                  )}
                </button>
                {/* Mobile Drawer Language Toggle */}
                <button
                  onClick={toggleLanguage}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-200 hover:bg-slate-800 transition flex items-center gap-1"
                  title="Switch Language"
                >
                  <Globe size={13} className="text-indigo-400" />
                  <span>{settings.language === 'ta' ? 'EN' : 'த'}</span>
                </button>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">{navContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
