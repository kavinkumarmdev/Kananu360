import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Transaction,
  Category,
  Account,
  Budget,
  SavingsGoal,
  AppSettings,
  SyncState,
  FarmField,
  FieldTreeItem,
  FieldTreeHistoryEntry,
  FieldCropItem,
  CropHistoryEntry,
  TreeHarvestEntry,
  FarmWorker,
  FarmLivestock,
  FamilyMember,
  Loan,
  SavingScheme,
  LoanPayment,
  SavingInstallment,
  SavingBulkClaim,
} from '../types/finance';
import type { TranslationKey } from '../utils/i18n';
import { useTranslation } from '../utils/i18n';
import { StorageService } from '../services/storage';
import { GoogleSheetApiService, type SheetFullPayload } from '../services/googleSheetApi';
import { generateId } from '../utils/formatters';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface FinanceContextType {
  t: (key: TranslationKey) => string;
  getCategoryName: (categoryId: string, defaultName: string) => string;
  getPaymentModeLabel: (modeId: string, defaultLabel: string) => string;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  goals: SavingsGoal[];
  fields: FarmField[];
  workers: FarmWorker[];
  livestock: FarmLivestock[];
  familyMembers: FamilyMember[];
  treeHarvests: TreeHarvestEntry[];
  loans: Loan[];
  savings: SavingScheme[];
  settings: AppSettings;
  syncState: SyncState;
  toasts: ToastMessage[];

  // Computed Financial Metrics
  totalNetWorth: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  netSavingsThisMonth: number;
  savingsRateThisMonth: number;

  // Farm, Crop & Tree Metrics
  totalFarmExpense: number;
  totalPendingWages: number;
  totalPaidWages: number;
  totalCropIncome: number;
  totalTreeHarvestIncome: number;
  totalSalaryIncome: number;
  pendingWageTransactions: Transaction[];

  // Livestock Metrics
  totalAnimalCount: number;
  totalDailyMilkLiters: number;
  totalMilkSalesIncome: number;
  totalAnimalSalesIncome: number;

  // Loan & Saving Metrics
  totalLoanLiability: number;
  totalLoanReceivable: number;
  totalSavingsInvested: number;
  totalChitFundsValue: number;
  totalChitBulkReceived: number;

  // Transaction Operations
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  settleLaborWage: (transactionId: string, paidDate?: string) => Promise<void>;

  // Family Member Operations
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => Promise<FamilyMember>;
  updateFamilyMember: (id: string, member: Partial<FamilyMember>) => Promise<void>;
  deleteFamilyMember: (id: string) => Promise<void>;

  // Account Operations
  addAccount: (acc: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, acc: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, note?: string) => Promise<void>;

  // Category Operations
  addCategory: (cat: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Farm Field Operations
  addField: (field: Omit<FarmField, 'id'>) => Promise<FarmField>;
  updateField: (id: string, field: Partial<FarmField>) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
  addTreeToField: (fieldId: string, tree: Omit<FieldTreeItem, 'id'>) => Promise<void>;
  removeTreeFromField: (fieldId: string, treeId: string, countToRemove: number, reason: string, date: string, incomeEarned?: number, notes?: string) => Promise<void>;
  recordTreeHarvest: (fieldId: string, treeId: string, harvestData: Omit<TreeHarvestEntry, 'id' | 'fieldId' | 'treeId'>) => Promise<void>;
  addCropToField: (fieldId: string, crop: Omit<FieldCropItem, 'id'>) => Promise<void>;
  startNewCropCycle: (fieldId: string, cropData: Omit<FieldCropItem, 'id'>) => Promise<void>;
  harvestCropFromField: (fieldId: string, cropId: string, endDate: string, harvestYield?: string, harvestIncome?: number, reason?: string, notes?: string) => Promise<void>;
  completeCropCycle: (fieldId: string, cropId: string, harvestData: { endDate: string; harvestYield?: string; harvestIncome?: number; totalInvestment?: number; reason?: string; notes?: string }) => Promise<void>;
  setPrimaryCrop: (fieldId: string, cropId: string) => Promise<void>;

  // Farm Worker Operations
  addWorker: (worker: Omit<FarmWorker, 'id'>) => Promise<FarmWorker>;
  updateWorker: (id: string, worker: Partial<FarmWorker>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;

  // Farm Livestock Operations (Cows, Buffaloes, Goats, Sheep, Poultry, Ducks)
  addLivestock: (animal: Omit<FarmLivestock, 'id'>) => Promise<FarmLivestock>;
  updateLivestock: (id: string, animal: Partial<FarmLivestock>) => Promise<void>;
  deleteLivestock: (id: string) => Promise<void>;

  // Budget Operations
  setBudget: (categoryId: string, monthlyLimit: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Goal Operations
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  depositToGoal: (goalId: string, amount: number, fromAccountId?: string) => Promise<void>;

  // Loan Operations
  addLoan: (loan: Omit<Loan, 'id' | 'payments'>) => Promise<Loan>;
  updateLoan: (id: string, loan: Partial<Loan>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  recordLoanPayment: (loanId: string, payment: Omit<LoanPayment, 'id'>, autoCreateTransaction?: boolean) => Promise<void>;

  // Saving & Chit Fund Operations
  addSavingScheme: (scheme: Omit<SavingScheme, 'id' | 'installments' | 'bulkClaim'>) => Promise<SavingScheme>;
  updateSavingScheme: (id: string, scheme: Partial<SavingScheme>) => Promise<void>;
  deleteSavingScheme: (id: string) => Promise<void>;
  recordSavingInstallment: (schemeId: string, installment: Omit<SavingInstallment, 'id'>, autoCreateTransaction?: boolean) => Promise<void>;
  recordSavingBulkClaim: (schemeId: string, claim: Omit<SavingBulkClaim, 'isClaimed'>, autoCreateTransaction?: boolean) => Promise<void>;

  // Settings & Google Sheet Sync
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  syncWithGoogleSheet: (mode?: 'push' | 'pull' | 'smart') => Promise<boolean>;
  testConnection: (url: string) => Promise<{ success: boolean; message: string }>;
  resetToSampleData: () => void;

  // Toast System
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.getTransactions());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [accounts, setAccounts] = useState<Account[]>(() => StorageService.getAccounts());
  const [budgets, setBudgets] = useState<Budget[]>(() => StorageService.getBudgets());
  const [goals, setGoals] = useState<SavingsGoal[]>(() => StorageService.getGoals());
  const [fields, setFields] = useState<FarmField[]>(() => StorageService.getFields());
  const [workers, setWorkers] = useState<FarmWorker[]>(() => StorageService.getWorkers());
  const [livestock, setLivestock] = useState<FarmLivestock[]>(() => StorageService.getLivestock());
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => StorageService.getFamilyMembers());
  const [treeHarvests, setTreeHarvests] = useState<TreeHarvestEntry[]>(() => StorageService.getTreeHarvests());
  const [loans, setLoans] = useState<Loan[]>(() => StorageService.getLoans());
  const [savings, setSavings] = useState<SavingScheme[]>(() => StorageService.getSavings());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { t, getCategoryName, getPaymentModeLabel } = useTranslation(settings.language || 'ta');

  const [syncState, setSyncState] = useState<SyncState>({
    status: settings.sheetUrl ? 'idle' : 'disconnected',
    lastSynced: settings.lastSyncedAt,
    pendingChangesCount: 0,
  });

  // Persist state updates to LocalStorage
  useEffect(() => {
    StorageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    StorageService.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    StorageService.saveAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    StorageService.saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    StorageService.saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    StorageService.saveFields(fields);
  }, [fields]);

  useEffect(() => {
    StorageService.saveWorkers(workers);
  }, [workers]);

  useEffect(() => {
    StorageService.saveLivestock(livestock);
  }, [livestock]);

  useEffect(() => {
    StorageService.saveFamilyMembers(familyMembers);
  }, [familyMembers]);

  useEffect(() => {
    StorageService.saveTreeHarvests(treeHarvests);
  }, [treeHarvests]);

  useEffect(() => {
    StorageService.saveLoans(loans);
  }, [loans]);

  useEffect(() => {
    StorageService.saveSavings(savings);
  }, [savings]);

  useEffect(() => {
    StorageService.saveSettings(settings);
    if (!settings.sheetUrl) {
      setSyncState(prev => ({ ...prev, status: 'disconnected' }));
    }

    // Apply theme to document root
    const root = document.documentElement;
    const isLight = settings.theme === 'light';
    if (isLight) {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isLight ? '#f8fafc' : '#020617');
    }
  }, [settings]);

  // Toast handlers
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = generateId('toast');
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Compute key totals
  const totalNetWorth = useMemo(() => {
    return accounts.reduce((sum, acc) => {
      return sum + Number(acc.balance || 0);
    }, 0);
  }, [accounts]);

  const currentYearMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(tx => tx.date && tx.date.startsWith(currentYearMonth));
  }, [transactions, currentYearMonth]);

  const totalIncomeThisMonth = useMemo(() => {
    return currentMonthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [currentMonthTransactions]);

  const totalExpenseThisMonth = useMemo(() => {
    return currentMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [currentMonthTransactions]);

  const netSavingsThisMonth = totalIncomeThisMonth - totalExpenseThisMonth;
  const savingsRateThisMonth =
    totalIncomeThisMonth > 0
      ? Math.max(0, Math.round((netSavingsThisMonth / totalIncomeThisMonth) * 100))
      : 0;

  // Farm & Labor specific metrics
  const totalFarmExpense = useMemo(() => {
    const farmCategoryIds = new Set(
      categories
        .filter(c => c.domain === 'farm' || c.domain === 'livestock' || c.id.startsWith('cat_farm') || c.id.startsWith('cat_animal'))
        .map(c => c.id)
    );
    return transactions
      .filter(tx => tx.type === 'expense' && (farmCategoryIds.has(tx.category) || !!tx.fieldId || !!tx.workerName))
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [transactions, categories]);

  const pendingWageTransactions = useMemo(() => {
    return transactions.filter(
      tx => tx.type === 'expense' && tx.paymentStatus === 'pending'
    );
  }, [transactions]);

  const totalPendingWages = useMemo(() => {
    return pendingWageTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [pendingWageTransactions]);

  const totalPaidWages = useMemo(() => {
    return transactions
      .filter(
        tx =>
          tx.type === 'expense' &&
          (tx.category === 'cat_farm_labor' || !!tx.workerName) &&
          tx.paymentStatus !== 'pending'
      )
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [transactions]);

  const totalCropIncome = useMemo(() => {
    const agriIncomeIds = new Set(['cat_crop_sale', 'cat_coconut_sale', 'cat_milk_sale', 'cat_vegetable_sale', 'cat_farm_subsidy', 'cat_egg_sale', 'cat_animal_sale']);
    return transactions
      .filter(tx => tx.type === 'income' && (agriIncomeIds.has(tx.category) || !!tx.fieldId))
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [transactions]);

  const totalTreeHarvestIncome = useMemo(() => {
    return transactions
      .filter(
        tx =>
          tx.type === 'income' &&
          (tx.category === 'cat_coconut_sale' ||
            tx.productionType === 'tree_harvest' ||
            tx.tags?.includes('coconut') ||
            tx.tags?.includes('tree_harvest'))
      )
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [transactions]);

  const totalSalaryIncome = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'income' && (tx.category === 'cat_salary' || tx.productionType === 'salary'))
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [transactions]);

  // Livestock & Dairy metrics
  const totalAnimalCount = useMemo(() => {
    return livestock.reduce((sum, a) => sum + (Number(a.count) || 1), 0);
  }, [livestock]);

  const totalDailyMilkLiters = useMemo(() => {
    return livestock.reduce((sum, a) => sum + (Number(a.dailyMilkLiters) || 0), 0);
  }, [livestock]);

  const totalMilkSalesIncome = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'income' && tx.category === 'cat_milk_sale')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [transactions]);

  const totalAnimalSalesIncome = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'income' && (tx.category === 'cat_crop_sale' || tx.description?.toLowerCase().includes('goat') || tx.description?.toLowerCase().includes('sheep') || tx.description?.toLowerCase().includes('cow') || tx.description?.toLowerCase().includes('ஆடு') || tx.description?.toLowerCase().includes('மாடு')))
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [transactions]);

  // Loan & Saving metrics
  const totalLoanLiability = useMemo(() => {
    return loans
      .filter(l => l.type === 'borrowed' && l.status === 'active')
      .reduce((sum, l) => {
        const principalPaid = (l.payments || []).reduce((p, pay) => p + Number(pay.principalPaid || 0), 0);
        return sum + Math.max(0, Number(l.principalAmount || 0) - principalPaid);
      }, 0);
  }, [loans]);

  const totalLoanReceivable = useMemo(() => {
    return loans
      .filter(l => l.type === 'lent' && l.status === 'active')
      .reduce((sum, l) => {
        const principalPaid = (l.payments || []).reduce((p, pay) => p + Number(pay.principalPaid || 0), 0);
        return sum + Math.max(0, Number(l.principalAmount || 0) - principalPaid);
      }, 0);
  }, [loans]);

  const totalSavingsInvested = useMemo(() => {
    return savings
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const instTotal = (s.installments || []).reduce((iSum, inst) => iSum + Number(inst.amountPaid || 0), 0);
        return sum + instTotal;
      }, 0);
  }, [savings]);

  const totalChitFundsValue = useMemo(() => {
    return savings
      .filter(s => s.status === 'active' && s.schemeType === 'chit_fund')
      .reduce((sum, s) => sum + Number(s.totalValue || 0), 0);
  }, [savings]);

  const totalChitBulkReceived = useMemo(() => {
    return savings
      .reduce((sum, s) => {
        return sum + (s.bulkClaim?.isClaimed ? Number(s.bulkClaim.claimedAmount || 0) : 0);
      }, 0);
  }, [savings]);

  // TRANSACTION OPERATIONS
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: generateId('tx'),
      createdAt: new Date().toISOString(),
    };

    // If paymentStatus is 'pending', don't immediately deduct cash until settled (or mark as liability)
    const shouldDeductBalance = newTx.paymentStatus !== 'pending';

    if (shouldDeductBalance) {
      setAccounts(prevAccounts => {
        return prevAccounts.map(acc => {
          if (newTx.type === 'expense' && acc.id === newTx.accountId) {
            return { ...acc, balance: Number(acc.balance) - Number(newTx.amount) };
          }
          if (newTx.type === 'income' && acc.id === newTx.accountId) {
            return { ...acc, balance: Number(acc.balance) + Number(newTx.amount) };
          }
          if (newTx.type === 'transfer') {
            if (acc.id === newTx.accountId) {
              return { ...acc, balance: Number(acc.balance) - Number(newTx.amount) };
            }
            if (acc.id === newTx.toAccountId) {
              return { ...acc, balance: Number(acc.balance) + Number(newTx.amount) };
            }
          }
          return acc;
        });
      });
    }

    setTransactions(prev => [newTx, ...prev]);
    addToast('Entry recorded successfully!', 'success');

    if (settings.sheetUrl && settings.autoSync) {
      GoogleSheetApiService.addTransaction(settings.sheetUrl, newTx).catch(console.error);
    }
  };

  const updateTransaction = async (id: string, updatedTx: Partial<Transaction>) => {
    const oldTx = transactions.find(t => t.id === id);
    if (!oldTx) return;

    // Adjust balances if was paid or now paid
    setAccounts(prev => {
      let next = [...prev];
      const oldDeducted = oldTx.paymentStatus !== 'pending';
      const newDeducted = (updatedTx.paymentStatus ?? oldTx.paymentStatus) !== 'pending';

      if (oldDeducted) {
        // Reverse old
        next = next.map(acc => {
          if (oldTx.type === 'expense' && acc.id === oldTx.accountId) {
            return { ...acc, balance: Number(acc.balance) + Number(oldTx.amount) };
          }
          if (oldTx.type === 'income' && acc.id === oldTx.accountId) {
            return { ...acc, balance: Number(acc.balance) - Number(oldTx.amount) };
          }
          if (oldTx.type === 'transfer') {
            if (acc.id === oldTx.accountId) return { ...acc, balance: Number(acc.balance) + Number(oldTx.amount) };
            if (acc.id === oldTx.toAccountId) return { ...acc, balance: Number(acc.balance) - Number(oldTx.amount) };
          }
          return acc;
        });
      }

      const mergedTx = { ...oldTx, ...updatedTx };

      if (newDeducted) {
        // Apply new
        next = next.map(acc => {
          if (mergedTx.type === 'expense' && acc.id === mergedTx.accountId) {
            return { ...acc, balance: Number(acc.balance) - Number(mergedTx.amount) };
          }
          if (mergedTx.type === 'income' && acc.id === mergedTx.accountId) {
            return { ...acc, balance: Number(acc.balance) + Number(mergedTx.amount) };
          }
          if (mergedTx.type === 'transfer') {
            if (acc.id === mergedTx.accountId) return { ...acc, balance: Number(acc.balance) - Number(mergedTx.amount) };
            if (acc.id === mergedTx.toAccountId) return { ...acc, balance: Number(acc.balance) + Number(mergedTx.amount) };
          }
          return acc;
        });
      }

      return next;
    });

    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updatedTx } : t)));
    addToast('Entry updated', 'info');
  };

  const deleteTransaction = async (id: string) => {
    const oldTx = transactions.find(t => t.id === id);
    if (!oldTx) return;

    if (oldTx.paymentStatus !== 'pending') {
      setAccounts(prev => {
        return prev.map(acc => {
          if (oldTx.type === 'expense' && acc.id === oldTx.accountId) {
            return { ...acc, balance: Number(acc.balance) + Number(oldTx.amount) };
          }
          if (oldTx.type === 'income' && acc.id === oldTx.accountId) {
            return { ...acc, balance: Number(acc.balance) - Number(oldTx.amount) };
          }
          if (oldTx.type === 'transfer') {
            if (acc.id === oldTx.accountId) return { ...acc, balance: Number(acc.balance) + Number(oldTx.amount) };
            if (acc.id === oldTx.toAccountId) return { ...acc, balance: Number(acc.balance) - Number(oldTx.amount) };
          }
          return acc;
        });
      });
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    addToast('Entry deleted', 'info');

    if (settings.sheetUrl && settings.autoSync) {
      GoogleSheetApiService.deleteTransaction(settings.sheetUrl, id).catch(console.error);
    }
  };

  // Settle / Mark a pending labor wage or bill as paid
  const settleLaborWage = async (transactionId: string, paidDate: string = new Date().toISOString().split('T')[0]) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;

    // Deduct from account balance upon settlement
    setAccounts(prev => {
      return prev.map(acc => {
        if (acc.id === tx.accountId) {
          return { ...acc, balance: Number(acc.balance) - Number(tx.amount) };
        }
        return acc;
      });
    });

    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId
          ? { ...t, paymentStatus: 'paid', paidDate }
          : t
      )
    );

    addToast(t('wageSettledSuccess'), 'success');
  };

  // ACCOUNT OPERATIONS
  const addAccount = async (accData: Omit<Account, 'id'>) => {
    const newAcc: Account = { ...accData, id: generateId('acc') };
    setAccounts(prev => [...prev, newAcc]);
    addToast(`Account "${newAcc.name}" created`, 'success');
  };

  const updateAccount = async (id: string, accData: Partial<Account>) => {
    setAccounts(prev => prev.map(a => (a.id === id ? { ...a, ...accData } : a)));
    addToast('Account updated', 'info');
  };

  const deleteAccount = async (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    addToast('Account removed', 'info');
  };

  const transferFunds = async (fromAccountId: string, toAccountId: string, amount: number, note: string = 'Account Transfer') => {
    await addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'transfer',
      amount: Number(amount),
      category: '',
      accountId: fromAccountId,
      toAccountId: toAccountId,
      description: note,
      paymentMode: 'bank',
      tags: ['transfer'],
    });
  };

  // CATEGORY OPERATIONS (Dynamic on-the-fly adding)
  const addCategory = async (catData: Omit<Category, 'id'>): Promise<Category> => {
    const newCat: Category = { ...catData, id: generateId('cat') };
    setCategories(prev => [...prev, newCat]);
    addToast(`Category "${newCat.name}" added`, 'success');
    return newCat;
  };

  const updateCategory = async (id: string, catData: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...catData } : c)));
    addToast('Category updated', 'info');
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    addToast('Category deleted', 'info');
  };

  // FARM FIELD PLOT OPERATIONS
  const addField = async (fieldData: Omit<FarmField, 'id'>): Promise<FarmField> => {
    // Determine primary crop name
    const primaryCropObj = fieldData.crops?.find(c => c.isPrimary);
    const primaryCropName = primaryCropObj?.cropType || fieldData.cropType || undefined;
    const secondaryList = fieldData.crops ? fieldData.crops.filter(c => !c.isPrimary).map(c => c.cropType) : fieldData.secondaryCrops;
    
    // Check boundary coconut from trees
    const coconutTree = fieldData.trees?.find(t => t.treeType.toLowerCase().includes('coconut') || t.treeType.includes('தென்னை'));
    const hasCoconut = coconutTree !== undefined ? true : fieldData.hasBoundaryCoconut;
    const coconutCount = coconutTree ? coconutTree.count : fieldData.boundaryTreeCount;

    const newField: FarmField = {
      ...fieldData,
      id: generateId('fld'),
      cropType: primaryCropName,
      secondaryCrops: secondaryList,
      hasBoundaryCoconut: hasCoconut,
      boundaryTreeCount: coconutCount,
      trees: fieldData.trees || [],
      crops: fieldData.crops || [],
      treeHistory: fieldData.treeHistory || [],
      cropHistory: fieldData.cropHistory || [],
    };

    // If trees were added on creation, log initial 'planted' history if desired
    if (newField.trees && newField.trees.length > 0 && (!newField.treeHistory || newField.treeHistory.length === 0)) {
      newField.treeHistory = newField.trees.map(t => ({
        id: generateId('treehist'),
        treeType: t.treeType,
        action: 'planted' as const,
        count: t.count,
        date: t.plantedDate || new Date().toISOString().split('T')[0],
        notes: t.variety ? `Initial planting (${t.variety})` : 'Initial planting',
      }));
    }

    setFields(prev => [...prev, newField]);
    addToast(`Field Plot "${newField.name}" added! 🌱`, 'success');
    return newField;
  };

  const updateField = async (id: string, fieldData: Partial<FarmField>) => {
    setFields(prev => prev.map(f => {
      if (f.id !== id) return f;

      const merged = { ...f, ...fieldData };

      // Sync backward compatibility cropType & secondaryCrops
      if (fieldData.crops !== undefined) {
        const prim = fieldData.crops.find(c => c.isPrimary);
        merged.cropType = prim?.cropType || undefined;
        merged.secondaryCrops = fieldData.crops.filter(c => !c.isPrimary).map(c => c.cropType);
      } else if (fieldData.cropType !== undefined && (!merged.crops || merged.crops.length === 0)) {
        merged.crops = fieldData.cropType ? [{
          id: generateId('crp'),
          cropType: fieldData.cropType,
          isPrimary: true,
          startDate: new Date().toISOString().split('T')[0],
        }] : [];
      }

      // Sync boundary coconut
      if (fieldData.trees !== undefined) {
        const coconutTree = fieldData.trees.find(t => t.treeType.toLowerCase().includes('coconut') || t.treeType.includes('தென்னை'));
        if (coconutTree) {
          merged.hasBoundaryCoconut = true;
          merged.boundaryTreeCount = coconutTree.count;
        }
      }

      return merged;
    }));
    addToast('Field Plot updated! 🌾', 'info');
  };

  const deleteField = async (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    addToast('Field Plot removed', 'info');
  };

  // Add Tree to Field
  const addTreeToField = async (fieldId: string, treeData: Omit<FieldTreeItem, 'id'>) => {
    const newTree: FieldTreeItem = { ...treeData, id: generateId('tree') };
    const historyEntry: FieldTreeHistoryEntry = {
      id: generateId('treehist'),
      treeType: treeData.treeType,
      action: 'planted',
      count: treeData.count,
      date: treeData.plantedDate || new Date().toISOString().split('T')[0],
      notes: treeData.notes || (treeData.variety ? `Planted ${treeData.variety}` : undefined),
    };

    setFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      const updatedTrees = [...(f.trees || []), newTree];
      const updatedHistory = [historyEntry, ...(f.treeHistory || [])];
      
      const coconutTree = updatedTrees.find(t => t.treeType.toLowerCase().includes('coconut') || t.treeType.includes('தென்னை'));
      return {
        ...f,
        trees: updatedTrees,
        treeHistory: updatedHistory,
        hasBoundaryCoconut: coconutTree ? true : f.hasBoundaryCoconut,
        boundaryTreeCount: coconutTree ? coconutTree.count : f.boundaryTreeCount,
      };
    }));
    addToast(`Added ${treeData.count} ${treeData.treeType} trees to field! 🌳`, 'success');
  };

  // Remove / Cut Tree from Field (Years Later Workflow)
  const removeTreeFromField = async (
    fieldId: string,
    treeId: string,
    countToRemove: number,
    reason: string,
    date: string,
    incomeEarned?: number,
    notes?: string
  ) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const tree = (field.trees || []).find(t => t.id === treeId);
    if (!tree) return;

    const actualRemoveCount = Math.min(countToRemove, tree.count);
    const remainingCount = tree.count - actualRemoveCount;

    const historyEntry: FieldTreeHistoryEntry = {
      id: generateId('treehist'),
      treeType: tree.treeType,
      action: 'removed',
      count: actualRemoveCount,
      date: date || new Date().toISOString().split('T')[0],
      reason: reason.trim() || 'Cut / Removed',
      incomeEarned: incomeEarned && incomeEarned > 0 ? incomeEarned : undefined,
      notes: notes?.trim() || undefined,
    };

    // If income earned, automatically offer/record an income transaction if desired
    if (incomeEarned && incomeEarned > 0) {
      const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
      if (defaultAcc) {
        addTransaction({
          date: date || new Date().toISOString().split('T')[0],
          type: 'income',
          amount: Number(incomeEarned),
          category: 'cat_crop_sale',
          accountId: defaultAcc.id,
          description: `Timber / Tree Sale (${actualRemoveCount}x ${tree.treeType}) from ${field.name}`,
          paymentMode: 'cash',
          fieldId: field.id,
          fieldName: field.name,
          tags: ['tree_sale', 'timber'],
        });
      }
    }

    setFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      let updatedTrees: FieldTreeItem[];
      if (remainingCount <= 0) {
        updatedTrees = (f.trees || []).filter(t => t.id !== treeId);
      } else {
        updatedTrees = (f.trees || []).map(t => (t.id === treeId ? { ...t, count: remainingCount } : t));
      }

      const updatedHistory = [historyEntry, ...(f.treeHistory || [])];
      const coconutTree = updatedTrees.find(t => t.treeType.toLowerCase().includes('coconut') || t.treeType.includes('தென்னை'));

      return {
        ...f,
        trees: updatedTrees,
        treeHistory: updatedHistory,
        hasBoundaryCoconut: coconutTree ? true : false,
        boundaryTreeCount: coconutTree ? coconutTree.count : undefined,
      };
    }));

    addToast(`Removed ${actualRemoveCount} ${tree.treeType} trees & saved to history! 🪓`, 'info');
  };

  // Add Crop to Field
  const addCropToField = async (fieldId: string, cropData: Omit<FieldCropItem, 'id'>) => {
    const newCrop: FieldCropItem = { ...cropData, id: generateId('crp') };

    setFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      let currentCrops = f.crops ? [...f.crops] : [];
      
      // If new crop is primary, demote existing primary crops
      if (newCrop.isPrimary) {
        currentCrops = currentCrops.map(c => ({ ...c, isPrimary: false }));
      } else if (currentCrops.length === 0) {
        // If this is the only crop, make it primary automatically
        newCrop.isPrimary = true;
      }

      const updatedCrops = [...currentCrops, newCrop];
      const primaryCrop = updatedCrops.find(c => c.isPrimary);
      const secondaryList = updatedCrops.filter(c => !c.isPrimary).map(c => c.cropType);

      return {
        ...f,
        crops: updatedCrops,
        cropType: primaryCrop?.cropType || undefined,
        secondaryCrops: secondaryList,
      };
    }));

    addToast(`Added crop "${cropData.cropType}" to field! 🌾`, 'success');
  };

  // Harvest / Remove Crop from Field (Months or Years Later Workflow)
  const harvestCropFromField = async (
    fieldId: string,
    cropId: string,
    endDate: string,
    harvestYield?: string,
    harvestIncome?: number,
    reason?: string,
    notes?: string
  ) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const crop = (field.crops || []).find(c => c.id === cropId);
    if (!crop) return;

    // Calculate duration in months/days
    let durationStr: string | undefined;
    if (crop.startDate && endDate) {
      const start = new Date(crop.startDate).getTime();
      const end = new Date(endDate).getTime();
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
      if (days >= 30) {
        const months = (days / 30).toFixed(1);
        durationStr = `${months} Months (${days} days)`;
      } else if (days > 0) {
        durationStr = `${days} Days`;
      }
    }

    const historyEntry: CropHistoryEntry = {
      id: generateId('crphist'),
      cropType: crop.cropType,
      isPrimary: crop.isPrimary,
      startDate: crop.startDate,
      endDate: endDate || new Date().toISOString().split('T')[0],
      duration: durationStr,
      harvestYield: harvestYield?.trim() || undefined,
      harvestIncome: harvestIncome && harvestIncome > 0 ? harvestIncome : undefined,
      reason: reason?.trim() || 'Harvest completed / அறுவடை முடிந்தது',
      notes: notes?.trim() || (crop.variety ? `Variety: ${crop.variety}` : undefined),
    };

    // Auto-record harvest sales income if entered
    if (harvestIncome && harvestIncome > 0) {
      const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
      if (defaultAcc) {
        addTransaction({
          date: endDate || new Date().toISOString().split('T')[0],
          type: 'income',
          amount: Number(harvestIncome),
          category: 'cat_crop_sale',
          accountId: defaultAcc.id,
          description: `Harvest Sales: ${crop.cropType} (${harvestYield || 'Harvest Yield'}) from ${field.name}`,
          paymentMode: 'cash',
          fieldId: field.id,
          fieldName: field.name,
          cropType: crop.cropType,
          tags: ['harvest', 'crop_sale'],
        });
      }
    }

    setFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      const updatedCrops = (f.crops || []).filter(c => c.id !== cropId);

      // If removed crop was primary and other crops exist, designate the first remaining crop as primary
      if (crop.isPrimary && updatedCrops.length > 0) {
        updatedCrops[0].isPrimary = true;
      }

      const primaryCrop = updatedCrops.find(c => c.isPrimary);
      const secondaryList = updatedCrops.filter(c => !c.isPrimary).map(c => c.cropType);
      const updatedHistory = [historyEntry, ...(f.cropHistory || [])];

      return {
        ...f,
        crops: updatedCrops,
        cropType: primaryCrop?.cropType || undefined,
        secondaryCrops: secondaryList,
        cropHistory: updatedHistory,
      };
    }));

    addToast(`Harvested ${crop.cropType} & saved to crop rotation history! 🌾✨`, 'success');
  };

  // Record Recurring Tree Yield / Harvest (e.g. 100 Coconuts @ ₹20 = ₹2,000 every 3 months)
  const recordTreeHarvest = async (
    fieldId: string,
    treeId: string,
    harvestData: Omit<TreeHarvestEntry, 'id' | 'fieldId' | 'treeId'>
  ) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    const tree = (field.trees || []).find(t => t.id === treeId);
    const treeType = tree?.treeType || harvestData.treeType || 'Coconut Tree';

    const newHarvest: TreeHarvestEntry = {
      ...harvestData,
      id: generateId('harv'),
      fieldId,
      treeId,
      treeType,
      netIncome: Number(harvestData.totalIncome || 0) - Number(harvestData.laborExpense || 0),
    };

    // Auto-record tree harvest income transaction
    if (harvestData.totalIncome > 0) {
      const targetAcc = accounts.find(a => a.id === harvestData.accountId) || accounts.find(a => a.isDefault) || accounts[0];
      const isCoconut = treeType.toLowerCase().includes('coconut') || treeType.includes('தென்னை');
      await addTransaction({
        date: harvestData.date || new Date().toISOString().split('T')[0],
        type: 'income',
        amount: Number(harvestData.totalIncome),
        category: isCoconut ? 'cat_coconut_sale' : 'cat_crop_sale',
        accountId: targetAcc ? targetAcc.id : accounts[0]?.id,
        description: `Tree Harvest: ${harvestData.quantityHarvested} ${harvestData.unit} (${treeType}) @ ₹${harvestData.ratePerUnit}/unit from ${field.name}`,
        paymentMode: 'cash',
        fieldId: field.id,
        fieldName: field.name,
        treeId: tree?.id,
        treeName: treeType,
        productionType: 'tree_harvest',
        productionQuantity: harvestData.quantityHarvested,
        productionUnitRate: harvestData.ratePerUnit,
        tags: ['tree_harvest', isCoconut ? 'coconut' : 'orchard'],
      });
    }

    // Auto-record labor expense if climber coolie paid
    if (harvestData.laborExpense && harvestData.laborExpense > 0) {
      const targetAcc = accounts.find(a => a.id === harvestData.accountId) || accounts.find(a => a.isDefault) || accounts[0];
      await addTransaction({
        date: harvestData.date || new Date().toISOString().split('T')[0],
        type: 'expense',
        amount: Number(harvestData.laborExpense),
        category: 'cat_tree_maintenance',
        accountId: targetAcc ? targetAcc.id : accounts[0]?.id,
        description: `Tree Climber / Harvest Coolie for ${treeType} from ${field.name}`,
        paymentMode: 'cash',
        fieldId: field.id,
        fieldName: field.name,
        workType: 'Coconut Plucking & Tree Pruning / தேங்காய் வெட்டு & கவாத்து',
        targetType: 'tree_harvest',
        tags: ['tree_labor', 'coolie'],
      });
    }

    setTreeHarvests(prev => [newHarvest, ...prev]);

    setFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      const updatedTrees = (f.trees || []).map(t => {
        if (t.id === treeId) {
          return {
            ...t,
            lastHarvestDate: harvestData.date,
          };
        }
        return t;
      });
      return {
        ...f,
        trees: updatedTrees,
        treeHarvests: [newHarvest, ...(f.treeHarvests || [])],
      };
    }));

    addToast(`Harvest of ${harvestData.quantityHarvested} ${harvestData.unit} recorded! (₹${harvestData.totalIncome}) 🥥`, 'success');
  };

  // Start New Seasonal Crop Cycle (supports Intercropping & Sapling Count)
  const startNewCropCycle = async (fieldId: string, cropData: Omit<FieldCropItem, 'id'>) => {
    await addCropToField(fieldId, cropData);
  };

  // Complete Crop Cycle with Comprehensive Profit & Loss Calculation
  const completeCropCycle = async (
    fieldId: string,
    cropId: string,
    data: {
      endDate: string;
      harvestYield?: string;
      harvestIncome?: number;
      totalInvestment?: number;
      reason?: string;
      notes?: string;
    }
  ) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const crop = (field.crops || []).find(c => c.id === cropId);
    if (!crop) return;

    // Calculate duration in months/days
    let durationStr: string | undefined;
    if (crop.startDate && data.endDate) {
      const start = new Date(crop.startDate).getTime();
      const end = new Date(data.endDate).getTime();
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
      if (days >= 30) {
        const months = (days / 30).toFixed(1);
        durationStr = `${months} Months (${days} days)`;
      } else if (days > 0) {
        durationStr = `${days} Days`;
      }
    }

    // Calculate all linked expenses for this field & crop cycle if not manually passed
    let totalInv = data.totalInvestment;
    let fertExp = 0;
    let laborExp = 0;
    let seedExp = 0;
    let otherExp = 0;

    const startDate = crop.startDate || '1970-01-01';
    const endDate = data.endDate || new Date().toISOString().split('T')[0];
    const linkedExpenses = transactions.filter(
      tx =>
        tx.type === 'expense' &&
        tx.fieldId === fieldId &&
        tx.date >= startDate &&
        tx.date <= endDate
    );

    linkedExpenses.forEach(tx => {
      const amt = Number(tx.amount || 0);
      if (tx.category === 'cat_farm_fertilizer') fertExp += amt;
      else if (tx.category === 'cat_farm_labor' || !!tx.workerName) laborExp += amt;
      else if (tx.category === 'cat_farm_seeds') seedExp += amt;
      else otherExp += amt;
    });

    if (totalInv === undefined) {
      totalInv = linkedExpenses.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    }

    const harvestInc = Number(data.harvestIncome || 0);
    const netPL = harvestInc - totalInv;
    const profitMargin = totalInv > 0 ? (netPL / totalInv) * 100 : 0;

    const historyEntry: CropHistoryEntry = {
      id: generateId('crphist'),
      cropType: crop.cropType,
      isPrimary: crop.isPrimary,
      secondaryCrops: crop.intercropType ? [crop.intercropType] : undefined,
      plantCount: crop.plantCount,
      plantCountUnit: crop.plantCountUnit,
      startDate: crop.startDate,
      endDate: data.endDate || new Date().toISOString().split('T')[0],
      duration: durationStr,
      totalInvestment: totalInv,
      fertilizerExpense: fertExp > 0 ? fertExp : undefined,
      laborExpense: laborExp > 0 ? laborExp : undefined,
      seedExpense: seedExp > 0 ? seedExp : undefined,
      otherExpense: otherExp > 0 ? otherExp : undefined,
      harvestYield: data.harvestYield?.trim() || undefined,
      harvestIncome: harvestInc > 0 ? harvestInc : undefined,
      netProfitLoss: netPL,
      profitMarginPct: Math.round(profitMargin * 10) / 10,
      reason: data.reason?.trim() || 'Harvest completed & P&L closed / அறுவடை முடிந்தது',
      notes: data.notes?.trim() || (crop.variety ? `Variety: ${crop.variety}` : undefined),
    };

    // Auto-record harvest sales income transaction if entered
    if (harvestInc > 0) {
      const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
      if (defaultAcc) {
        await addTransaction({
          date: data.endDate || new Date().toISOString().split('T')[0],
          type: 'income',
          amount: harvestInc,
          category: 'cat_crop_sale',
          accountId: defaultAcc.id,
          description: `Crop Harvest Sales: ${crop.cropType} (${data.harvestYield || 'Yield'}) from ${field.name}`,
          paymentMode: 'cash',
          fieldId: field.id,
          fieldName: field.name,
          cropType: crop.cropType,
          productionType: 'crop_yield',
          tags: ['harvest', 'crop_sale', 'cycle_pl'],
        });
      }
    }

    setFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      const updatedCrops = (f.crops || []).filter(c => c.id !== cropId);

      // If removed crop was primary and other crops exist, designate the first remaining crop as primary
      if (crop.isPrimary && updatedCrops.length > 0) {
        updatedCrops[0].isPrimary = true;
      }

      const primaryCrop = updatedCrops.find(c => c.isPrimary);
      const secondaryList = updatedCrops.filter(c => !c.isPrimary).map(c => c.cropType);
      const updatedHistory = [historyEntry, ...(f.cropHistory || [])];

      return {
        ...f,
        crops: updatedCrops,
        cropType: primaryCrop?.cropType || undefined,
        secondaryCrops: secondaryList,
        cropHistory: updatedHistory,
      };
    }));

    const statusEmoji = netPL >= 0 ? '💰' : '📉';
    const statusText = netPL >= 0 ? `Net Profit: +₹${netPL.toLocaleString('en-IN')}` : `Net Loss: -₹${Math.abs(netPL).toLocaleString('en-IN')}`;
    addToast(`Crop Cycle "${crop.cropType}" closed! ${statusEmoji} (${statusText})`, netPL >= 0 ? 'success' : 'info');
  };

  // Set Primary Crop
  const setPrimaryCrop = async (fieldId: string, cropId: string) => {
    setFields(prev => prev.map(f => {
      if (f.id !== fieldId) return f;
      const updatedCrops = (f.crops || []).map(c => ({
        ...c,
        isPrimary: c.id === cropId,
      }));
      const primaryCrop = updatedCrops.find(c => c.isPrimary);
      const secondaryList = updatedCrops.filter(c => !c.isPrimary).map(c => c.cropType);

      return {
        ...f,
        crops: updatedCrops,
        cropType: primaryCrop?.cropType || undefined,
        secondaryCrops: secondaryList,
      };
    }));
    addToast('Primary crop updated! ⭐', 'info');
  };

  // FAMILY MEMBER OPERATIONS
  const addFamilyMember = async (memberData: Omit<FamilyMember, 'id'>): Promise<FamilyMember> => {
    const newMember: FamilyMember = { ...memberData, id: generateId('mem') };
    setFamilyMembers(prev => [...prev, newMember]);
    addToast(`Family Member "${newMember.name}" added! 👨‍👩‍👧‍👦`, 'success');
    return newMember;
  };

  const updateFamilyMember = async (id: string, memberData: Partial<FamilyMember>) => {
    setFamilyMembers(prev => prev.map(m => (m.id === id ? { ...m, ...memberData } : m)));
    addToast('Family Member details updated', 'info');
  };

  const deleteFamilyMember = async (id: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
    addToast('Family Member removed', 'info');
  };

  // FARM WORKER / LABOR OPERATIONS
  const addWorker = async (workerData: Omit<FarmWorker, 'id'>): Promise<FarmWorker> => {
    const newWorker: FarmWorker = { ...workerData, id: generateId('wrk') };
    setWorkers(prev => [...prev, newWorker]);
    addToast(`Worker "${newWorker.name}" registered! 👥`, 'success');
    return newWorker;
  };

  const updateWorker = async (id: string, workerData: Partial<FarmWorker>) => {
    setWorkers(prev => prev.map(w => (w.id === id ? { ...w, ...workerData } : w)));
    addToast('Worker details updated', 'info');
  };

  const deleteWorker = async (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    addToast('Worker removed', 'info');
  };

  // FARM LIVESTOCK & DAIRY OPERATIONS
  const addLivestock = async (animalData: Omit<FarmLivestock, 'id'>): Promise<FarmLivestock> => {
    const newAnimal: FarmLivestock = { ...animalData, id: generateId('ani') };
    setLivestock(prev => [...prev, newAnimal]);
    addToast(`Livestock "${newAnimal.name}" recorded! 🐄🐐`, 'success');
    return newAnimal;
  };

  const updateLivestock = async (id: string, animalData: Partial<FarmLivestock>) => {
    setLivestock(prev => prev.map(a => (a.id === id ? { ...a, ...animalData } : a)));
    addToast('Livestock details updated', 'info');
  };

  const deleteLivestock = async (id: string) => {
    setLivestock(prev => prev.filter(a => a.id !== id));
    addToast('Livestock record removed', 'info');
  };

  // BUDGET OPERATIONS
  const setBudget = async (categoryId: string, monthlyLimit: number) => {
    const category = categories.find(c => c.id === categoryId);
    const categoryName = category ? category.name : 'Unknown';

    setBudgets(prev => {
      const existing = prev.find(b => b.categoryId === categoryId);
      if (existing) {
        return prev.map(b => (b.categoryId === categoryId ? { ...b, monthlyLimit } : b));
      }
      return [...prev, { id: generateId('budget'), categoryId, categoryName, monthlyLimit }];
    });

    setCategories(prev => prev.map(c => (c.id === categoryId ? { ...c, budgetLimit: monthlyLimit } : c)));
    addToast(`Budget set for ${categoryName}`, 'success');
  };

  const deleteBudget = async (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    addToast('Budget removed', 'info');
  };

  // GOAL OPERATIONS
  const addGoal = async (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = { ...goalData, id: generateId('goal') };
    setGoals(prev => [...prev, newGoal]);
    addToast(`Goal "${newGoal.name}" established!`, 'success');
  };

  const updateGoal = async (id: string, goalData: Partial<SavingsGoal>) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...goalData } : g)));
    addToast('Goal updated', 'info');
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    addToast('Goal deleted', 'info');
  };

  const depositToGoal = async (goalId: string, amount: number, fromAccountId?: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = Number(goal.currentAmount) + Number(amount);
    setGoals(prev => prev.map(g => (g.id === goalId ? { ...g, currentAmount: newAmount } : g)));

    if (fromAccountId) {
      await addTransaction({
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        amount: Number(amount),
        category: 'cat_investments',
        accountId: fromAccountId,
        description: `Savings Goal Contribution: ${goal.name}`,
        paymentMode: 'bank',
        tags: ['goal', 'savings', goal.name.toLowerCase().replace(/\s+/g, '-')],
      });
    }

    addToast(`Added ${amount} to ${goal.name}! 🎯`, 'success');
  };

  // LOAN OPERATIONS
  const addLoan = async (loanData: Omit<Loan, 'id' | 'payments'>): Promise<Loan> => {
    const newLoan: Loan = { ...loanData, id: generateId('loan'), payments: [] };
    setLoans(prev => [...prev, newLoan]);
    addToast(`Loan "${newLoan.name}" recorded! 📜`, 'success');
    return newLoan;
  };

  const updateLoan = async (id: string, loanData: Partial<Loan>) => {
    setLoans(prev => prev.map(l => (l.id === id ? { ...l, ...loanData } : l)));
    addToast('Loan details updated', 'info');
  };

  const deleteLoan = async (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
    addToast('Loan deleted', 'info');
  };

  const recordLoanPayment = async (
    loanId: string,
    payment: Omit<LoanPayment, 'id'>,
    autoCreateTransaction = true
  ) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    const newPayment: LoanPayment = {
      ...payment,
      id: generateId('pay'),
    };

    const updatedPayments = [...(targetLoan.payments || []), newPayment];
    const totalPrincipalPaid = updatedPayments.reduce((s, p) => s + Number(p.principalPaid || 0), 0);
    const isFullyPaid = totalPrincipalPaid >= Number(targetLoan.principalAmount || 0);

    setLoans(prev =>
      prev.map(l =>
        l.id === loanId
          ? {
              ...l,
              payments: updatedPayments,
              status: isFullyPaid ? 'closed' : l.status,
            }
          : l
      )
    );

    if (autoCreateTransaction && payment.accountId) {
      const isBorrow = targetLoan.type === 'borrowed';
      await addTransaction({
        date: payment.date,
        type: isBorrow ? 'expense' : 'income',
        amount: Number(payment.totalPaid),
        category: isBorrow ? 'cat_loans' : 'cat_other_income',
        accountId: payment.accountId,
        description: `Loan Repayment: ${targetLoan.name} (P: ₹${payment.principalPaid}, Int: ₹${payment.interestPaid})`,
        paymentMode: 'bank',
        tags: ['loan', 'repayment', targetLoan.name.toLowerCase().replace(/\s+/g, '-')],
      });
    }

    addToast(`Repayment of ₹${payment.totalPaid} recorded for ${targetLoan.name}! ✅`, 'success');
  };

  // SAVING & CHIT FUND OPERATIONS
  const addSavingScheme = async (
    schemeData: Omit<SavingScheme, 'id' | 'installments' | 'bulkClaim'>
  ): Promise<SavingScheme> => {
    const newScheme: SavingScheme = {
      ...schemeData,
      id: generateId('sav'),
      installments: [],
      bulkClaim: { isClaimed: false },
    };
    setSavings(prev => [...prev, newScheme]);
    addToast(`Savings Scheme "${newScheme.name}" added! 🪙`, 'success');
    return newScheme;
  };

  const updateSavingScheme = async (id: string, schemeData: Partial<SavingScheme>) => {
    setSavings(prev => prev.map(s => (s.id === id ? { ...s, ...schemeData } : s)));
    addToast('Savings Scheme updated', 'info');
  };

  const deleteSavingScheme = async (id: string) => {
    setSavings(prev => prev.filter(s => s.id !== id));
    addToast('Savings Scheme removed', 'info');
  };

  const recordSavingInstallment = async (
    schemeId: string,
    installment: Omit<SavingInstallment, 'id'>,
    autoCreateTransaction = true
  ) => {
    const targetScheme = savings.find(s => s.id === schemeId);
    if (!targetScheme) return;

    const newInstallment: SavingInstallment = {
      ...installment,
      id: generateId('inst'),
    };

    const updatedInstallments = [...(targetScheme.installments || []), newInstallment];
    const isCompleted = updatedInstallments.length >= Number(targetScheme.totalInstallments || 0);

    setSavings(prev =>
      prev.map(s =>
        s.id === schemeId
          ? {
              ...s,
              installments: updatedInstallments,
              status: isCompleted ? 'completed' : s.status,
            }
          : s
      )
    );

    if (autoCreateTransaction && installment.accountId) {
      await addTransaction({
        date: installment.date,
        type: 'expense',
        amount: Number(installment.amountPaid),
        category: 'cat_investments',
        accountId: installment.accountId,
        description: `Chit/Savings #${installment.installmentNo} Payment: ${targetScheme.name}`,
        paymentMode: 'bank',
        tags: ['savings', 'chit_installment', targetScheme.name.toLowerCase().replace(/\s+/g, '-')],
      });
    }

    addToast(`Installment #${installment.installmentNo} (₹${installment.amountPaid}) recorded for ${targetScheme.name}! 💰`, 'success');
  };

  const recordSavingBulkClaim = async (
    schemeId: string,
    claim: Omit<SavingBulkClaim, 'isClaimed'>,
    autoCreateTransaction = true
  ) => {
    const targetScheme = savings.find(s => s.id === schemeId);
    if (!targetScheme) return;

    const bulkClaimData: SavingBulkClaim = {
      isClaimed: true,
      ...claim,
    };

    setSavings(prev =>
      prev.map(s =>
        s.id === schemeId
          ? {
              ...s,
              bulkClaim: bulkClaimData,
            }
          : s
      )
    );

    if (autoCreateTransaction && claim.accountId && claim.claimedAmount) {
      await addTransaction({
        date: claim.claimedDate || new Date().toISOString().split('T')[0],
        type: 'income',
        amount: Number(claim.claimedAmount),
        category: 'cat_investments',
        accountId: claim.accountId,
        description: `Bulk Prize Money Received: ${targetScheme.name} (Month ${claim.claimedInstallmentNo || ''})`,
        paymentMode: 'bank',
        tags: ['chit_bulk_payout', 'prize_money', targetScheme.name.toLowerCase().replace(/\s+/g, '-')],
      });
    }

    addToast(`🎉 Bulk payout of ₹${claim.claimedAmount} claimed for ${targetScheme.name}!`, 'success');
  };

  // SETTINGS & SYNC
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addToast('Settings updated', 'info');
  };

  const testConnection = async (url: string) => {
    return await GoogleSheetApiService.testConnection(url);
  };

  const syncWithGoogleSheet = async (mode: 'push' | 'pull' | 'smart' = 'push'): Promise<boolean> => {
    if (!settings.sheetUrl) {
      addToast('Please enter your Google Apps Script URL in Settings', 'warning');
      return false;
    }

    setSyncState(prev => ({ ...prev, status: 'syncing' }));

    try {
      if (mode === 'pull') {
        const res = await GoogleSheetApiService.fetchAllData(settings.sheetUrl);
        if (res.status === 'success' && res.data) {
          if (res.data.transactions && res.data.transactions.length > 0) setTransactions(res.data.transactions);
          if (res.data.familyMembers && res.data.familyMembers.length > 0) setFamilyMembers(res.data.familyMembers);
          if (res.data.categories && res.data.categories.length > 0) setCategories(res.data.categories);
          if (res.data.accounts && res.data.accounts.length > 0) setAccounts(res.data.accounts);
          if (res.data.budgets && res.data.budgets.length > 0) setBudgets(res.data.budgets);
          if (res.data.goals && res.data.goals.length > 0) setGoals(res.data.goals);
          if (res.data.loans && res.data.loans.length > 0) setLoans(res.data.loans);
          if (res.data.savings && res.data.savings.length > 0) setSavings(res.data.savings);
          if (res.data.fields && res.data.fields.length > 0) setFields(res.data.fields);
          if (res.data.treeHarvests && res.data.treeHarvests.length > 0) setTreeHarvests(res.data.treeHarvests);
          if (res.data.livestock && res.data.livestock.length > 0) setLivestock(res.data.livestock);
          if (res.data.workers && res.data.workers.length > 0) setWorkers(res.data.workers);

          const syncedAt = new Date().toLocaleString();
          setSyncState({ status: 'success', lastSynced: syncedAt, pendingChangesCount: 0 });
          setSettings(prev => ({ ...prev, lastSyncedAt: syncedAt }));
          addToast(settings.language === 'ta' ? 'கூகிள் தாளிலிருந்து தரவு புதுப்பிக்கப்பட்டது!' : 'Synchronized data from Google Sheet', 'success');
          return true;
        }
      } else {
        const payload: SheetFullPayload = {
          transactions,
          familyMembers,
          fields,
          treeHarvests,
          livestock,
          workers,
          categories,
          accounts,
          budgets,
          goals,
          loans,
          savings,
          settings: {
            currency: settings.currency,
            currencySymbol: settings.currencySymbol,
            userName: settings.userName,
          },
        };

        const res = await GoogleSheetApiService.syncAllToSheet(settings.sheetUrl, payload);
        if (res.status === 'success') {
          const syncedAt = new Date().toLocaleString();
          setSyncState({ status: 'success', lastSynced: syncedAt, pendingChangesCount: 0 });
          setSettings(prev => ({ ...prev, lastSyncedAt: syncedAt }));
          addToast(settings.language === 'ta' ? 'கூகிள் தாள் வெற்றிகரமாக இணைக்கப்பட்டது!' : 'Google Sheet synchronized successfully!', 'success');
          return true;
        } else {
          throw new Error(res.message || 'Sync failed');
        }
      }
      return false;
    } catch (error: any) {
      setSyncState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error.message || 'Sync failed. Ensure Web App is accessible.',
      }));
      addToast(`Sync Error: ${error.message || 'Failed to sync with Google Sheet'}`, 'error');
      return false;
    }
  };

  const resetToSampleData = () => {
    StorageService.resetAllData();
    setTransactions(StorageService.getTransactions());
    setCategories(StorageService.getCategories());
    setAccounts(StorageService.getAccounts());
    setBudgets(StorageService.getBudgets());
    setGoals(StorageService.getGoals());
    setFields(StorageService.getFields());
    setWorkers(StorageService.getWorkers());
    setLivestock(StorageService.getLivestock());
    setFamilyMembers(StorageService.getFamilyMembers());
    setTreeHarvests(StorageService.getTreeHarvests());
    setLoans(StorageService.getLoans());
    setSavings(StorageService.getSavings());
    addToast('Reset to demo sample data', 'info');
  };

  return (
    <FinanceContext.Provider
      value={{
        t,
        getCategoryName,
        getPaymentModeLabel,
        transactions,
        categories,
        accounts,
        budgets,
        goals,
        fields,
        workers,
        livestock,
        familyMembers,
        treeHarvests,
        loans,
        savings,
        settings,
        syncState,
        toasts,
        totalNetWorth,
        totalIncomeThisMonth,
        totalExpenseThisMonth,
        netSavingsThisMonth,
        savingsRateThisMonth,
        totalFarmExpense,
        totalPendingWages,
        totalPaidWages,
        totalCropIncome,
        totalTreeHarvestIncome,
        totalSalaryIncome,
        pendingWageTransactions,
        totalAnimalCount,
        totalDailyMilkLiters,
        totalMilkSalesIncome,
        totalAnimalSalesIncome,
        totalLoanLiability,
        totalLoanReceivable,
        totalSavingsInvested,
        totalChitFundsValue,
        totalChitBulkReceived,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        settleLaborWage,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        addAccount,
        updateAccount,
        deleteAccount,
        transferFunds,
        addCategory,
        updateCategory,
        deleteCategory,
        addField,
        updateField,
        deleteField,
        addTreeToField,
        removeTreeFromField,
        recordTreeHarvest,
        addCropToField,
        startNewCropCycle,
        harvestCropFromField,
        completeCropCycle,
        setPrimaryCrop,
        addWorker,
        updateWorker,
        deleteWorker,
        addLivestock,
        updateLivestock,
        deleteLivestock,
        addLoan,
        updateLoan,
        deleteLoan,
        recordLoanPayment,
        addSavingScheme,
        updateSavingScheme,
        deleteSavingScheme,
        recordSavingInstallment,
        recordSavingBulkClaim,
        setBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        updateSettings,
        syncWithGoogleSheet,
        testConnection,
        resetToSampleData,
        addToast,
        removeToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

