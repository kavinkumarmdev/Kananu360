import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { PinLockScreen } from './components/auth/PinLockScreen';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { KPICards } from './components/dashboard/KPICards';
import { CashFlowChart } from './components/dashboard/CashFlowChart';
import { CategoryBreakdown } from './components/dashboard/CategoryBreakdown';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { AccountQuickView } from './components/dashboard/AccountQuickView';
import { UpcomingDueAlerts } from './components/loans_savings/UpcomingDueAlerts';
import { FarmDashboard } from './components/farm/FarmDashboard';
import { LoansSavingsHub } from './components/loans_savings/LoansSavingsHub';
import { TransactionList } from './components/transactions/TransactionList';
import { TransactionModal } from './components/transactions/TransactionModal';
import { BudgetList } from './components/budgets/BudgetList';
import { AccountList } from './components/accounts/AccountList';
import { AccountModal } from './components/accounts/AccountModal';
import { TransferModal } from './components/accounts/TransferModal';
import { GoalList } from './components/goals/GoalList';
import { GoogleSheetSync } from './components/settings/GoogleSheetSync';
import { GeneralSettings } from './components/settings/GeneralSettings';
import { ToastContainer } from './components/common/ToastContainer';
import type { Transaction } from './types/finance';

const MainApp: React.FC = () => {
  const { isAuthenticated, isPinLocked, user } = useAuth();
  const { settings, updateSettings, t } = useFinance();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);

  // Sync user profile name to finance settings if user exists
  useEffect(() => {
    if (user && user.name && settings.userName !== user.name) {
      updateSettings({ userName: user.name });
    }
  }, [user, settings.userName, updateSettings]);

  // If user is not authenticated, render the high-end Login Page
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const handleOpenAddTransaction = () => {
    setTransactionToEdit(null);
    setIsTransactionModalOpen(true);
  };

  const handleOpenEditTransaction = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={handleOpenAddTransaction}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome & Overview Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl glass-panel border border-indigo-500/20 shadow-md relative overflow-hidden bg-gradient-to-r from-indigo-950/30 via-slate-900/40 to-slate-900/30">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                    {user?.avatar || '👤'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        {t('greeting')}, <span className="text-indigo-400 dark:text-indigo-300 font-black">{user?.name || settings.userName || 'Kavin'}</span>!
                      </h1>
                      {user?.role && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 shrink-0">
                          {user.role.split('(')[0].trim()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {settings.language === 'ta'
                        ? 'வரவு, செலவு, பண்ணை மற்றும் குடும்ப நிதி கணக்கு நேரலை மேலாண்மை.'
                        : 'Personal, farm harvests, coolie wages & household accounts overview.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  {(user?.username === 'appa' || user?.name?.toLowerCase().includes('appa') || user?.username === 'amma' || user?.name?.toLowerCase().includes('amma')) ? (
                    <button
                      onClick={() => setActiveTab('farm')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:shadow-lg"
                    >
                      <span>🌾 {settings.language === 'ta' ? 'பண்ணை & கால்நடை' : 'Farm & Livestock'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenAddTransaction}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:shadow-lg"
                    >
                      <span>➕ {t('record')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 15-Day Due Alert Reminder Banner on Dashboard */}
              <UpcomingDueAlerts
                onPayLoan={() => setActiveTab('loans_savings')}
                onPayScheme={() => setActiveTab('loans_savings')}
              />

              {/* KPI Cards */}
              <KPICards />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CashFlowChart />
                </div>
                <div className="lg:col-span-1">
                  <CategoryBreakdown />
                </div>
              </div>

              {/* Accounts and Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <AccountQuickView
                    onOpenTransfer={() => setIsTransferModalOpen(true)}
                    onOpenAddAccount={() => setIsAccountModalOpen(true)}
                  />
                </div>
                <div className="lg:col-span-2">
                  <RecentTransactions
                    onViewAll={() => setActiveTab('transactions')}
                    onEditTransaction={handleOpenEditTransaction}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'farm' && <FarmDashboard />}

          {activeTab === 'transactions' && (
            <TransactionList
              onAddTransaction={handleOpenAddTransaction}
              onEditTransaction={handleOpenEditTransaction}
            />
          )}

          {activeTab === 'loans_savings' && <LoansSavingsHub />}

          {activeTab === 'budgets' && <BudgetList />}

          {activeTab === 'accounts' && <AccountList />}

          {activeTab === 'goals' && <GoalList />}

          {activeTab === 'sync' && <GoogleSheetSync />}

          {activeTab === 'settings' && <GeneralSettings />}
        </main>
      </div>

      {/* Global Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactionToEdit={transactionToEdit}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* PIN Lock Screen Overlay if active */}
      {isPinLocked && <PinLockScreen />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainApp />
      </FinanceProvider>
    </AuthProvider>
  );
};

export default App;
