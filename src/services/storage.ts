import type {
  Transaction,
  Category,
  Account,
  Budget,
  SavingsGoal,
  AppSettings,
  FarmField,
  FarmWorker,
  FarmLivestock,
  FamilyMember,
  TreeHarvestEntry,
  Loan,
  SavingScheme,
} from '../types/finance';
import { DEFAULT_FAMILY_MEMBERS } from '../types/finance';
import type { User } from '../types/auth';

const STORAGE_KEYS = {
  TRANSACTIONS: 'kanakku360_transactions',
  CATEGORIES: 'kanakku360_categories',
  ACCOUNTS: 'kanakku360_accounts',
  BUDGETS: 'kanakku360_budgets',
  GOALS: 'kanakku360_goals',
  SETTINGS: 'kanakku360_settings',
  FIELDS: 'kanakku360_farm_fields',
  WORKERS: 'kanakku360_farm_workers',
  LIVESTOCK: 'kanakku360_farm_livestock',
  FAMILY_MEMBERS: 'kanakku360_family_members',
  TREE_HARVESTS: 'kanakku360_tree_harvests',
  LOANS: 'kanakku360_loans',
  SAVINGS: 'kanakku360_savings',
  AUTH_CURRENT_USER: 'kanakku360_current_user',
  AUTH_USERS: 'kanakku360_users',
};

export const DEFAULT_USERS: User[] = [
  {
    id: 'user_kavin',
    name: 'Kavin',
    username: 'kavin',
    email: 'kavin@kanakku360.com',
    password: 'kavin',
    avatar: '👨‍💻',
    pin: '1234',
    currency: 'INR',
    role: 'Software Engineer / Admin (மென்பொருள் பொறியாளர்)',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_brother',
    name: 'Brother (சகோதரன்)',
    username: 'brother',
    email: 'brother@kanakku360.com',
    password: 'brother',
    avatar: '👨‍💼',
    pin: '2345',
    currency: 'INR',
    role: 'Corporate Employee (கம்பெனி பணி)',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_appa',
    name: 'Father / Appa (அப்பா)',
    username: 'appa',
    email: 'appa@kanakku360.com',
    password: 'appa',
    avatar: '👨‍🌾',
    pin: '3456',
    currency: 'INR',
    role: '2-Acre Farm Land & Crop Master (பண்ணை விவசாயம்)',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_amma',
    name: 'Mother / Amma (அம்மா)',
    username: 'amma',
    email: 'amma@kanakku360.com',
    password: 'amma',
    avatar: '👩‍🌾',
    pin: '4567',
    currency: 'INR',
    role: 'Livestock & Dairy Specialist (கால்நடை & பால் பண்ணை)',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  sheetUrl: 'https://script.google.com/macros/s/AKfycby0xwUvO4h4KM12hanisp5OhNdjR4c6ca-AianDSgQL1siiiLfAb91lS1iLEvFN8sc/exec',
  autoSync: true,
  theme: 'dark',
  userName: 'Kavin',
  language: 'ta',
};

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = DEFAULT_FAMILY_MEMBERS;

export const INITIAL_FIELDS: FarmField[] = [
  {
    id: 'fld_south_half_acre',
    name: 'South 1/2 Acre Plot (தெற்கு அரை ஏக்கர்)',
    areaAcre: 0.5,
    sizeUnit: 'acres',
    color: '#10B981',
    notes: '0.5 Acre field with 20 permanent border coconut trees. Rotational inner crops.',
    trees: [
      {
        id: 'tree_coconut_border',
        treeType: 'Coconut Tree / தென்னை மரம் (Coconut)',
        count: 20,
        plantedYear: 2018,
        location: 'boundary',
        harvestFrequencyMonths: 3,
        averageYieldPerHarvest: 100,
        ratePerUnit: 20,
        lastHarvestDate: '2024-11-15',
        notes: '20 Border coconut trees. Yields ~100 nuts every 3 months (₹20/nut = ₹2,000/harvest).',
      },
    ],
    crops: [
      {
        id: 'crop_turmeric_primary',
        cropType: 'Turmeric (Erode Local / BSR) / மஞ்சள்',
        isPrimary: true,
        intercropType: 'Small Onion / Shallots / சின்ன வெங்காயம்',
        plantCount: 150,
        plantCountUnit: 'kg seeds',
        startDate: '2024-12-20',
        expectedHarvestDate: '2025-09-20',
        variety: 'BSR 2 / Erode Local',
        notes: 'Primary crop Turmeric with Small Onion intercropping started on 20/12/2024.',
        status: 'active',
      },
      {
        id: 'crop_onion_intercrop',
        cropType: 'Small Onion / Shallots / சின்ன வெங்காயம்',
        isPrimary: false,
        plantCount: 50,
        plantCountUnit: 'kg seeds',
        startDate: '2024-12-20',
        expectedHarvestDate: '2025-03-20',
        variety: 'Coimbatore Local Shallots',
        notes: 'Secondary intercrop sown along turmeric ridges.',
        status: 'active',
      },
    ],
    cropHistory: [
      {
        id: 'hist_red_banana_2024',
        cropType: 'Red Banana (Sevvaazhai) / செவ்வாழை',
        isPrimary: true,
        plantCount: 300,
        plantCountUnit: 'saplings / கன்றுகள்',
        startDate: '2024-01-01',
        endDate: '2024-12-01',
        duration: '11 Months (01/01/2024 - 01/12/2024)',
        totalInvestment: 38500,
        fertilizerExpense: 12000,
        laborExpense: 14500,
        seedExpense: 7500,
        otherExpense: 4500,
        harvestYield: '280 Bunches / வாழைத்தார்',
        harvestIncome: 95000,
        netProfitLoss: 56500,
        profitMarginPct: 146.7,
        reason: 'Harvest completed & sold to wholesale / அறுவடை முடிந்தது',
        notes: '300 Red Banana saplings planted on 01/01/2024 and fully harvested on 01/12/2024. Net profit: ₹56,500.',
      },
    ],
    treeHarvests: [
      {
        id: 'harv_coc_1',
        fieldId: 'fld_south_half_acre',
        treeId: 'tree_coconut_border',
        treeType: 'Coconut Tree / தென்னை மரம்',
        date: '2024-11-15',
        quantityHarvested: 100,
        unit: 'coconuts / காய்கள்',
        ratePerUnit: 20,
        totalIncome: 2000,
        laborExpense: 300,
        netIncome: 1700,
        notes: '100 coconuts plucked from 20 border trees @ ₹20/nut.',
      },
    ],
  },
  {
    id: 'fld_north_one_and_half_acre',
    name: 'North 1.5 Acre Plot (வடக்கு 1.5 ஏக்கர்)',
    areaAcre: 1.5,
    sizeUnit: 'acres',
    color: '#0284C7',
    notes: '1.5 Acre main field for seasonal crop rotation & fodder.',
    trees: [
      {
        id: 'tree_teak_boundary',
        treeType: 'Teak Wood / தேக்கு மரம் (Teak)',
        count: 15,
        plantedYear: 2021,
        location: 'boundary',
        notes: '15 Teak timber trees along outer boundary.',
      },
    ],
    crops: [
      {
        id: 'crop_paddy_north',
        cropType: 'Paddy / Rice (Ponni/CO51) / நெல்',
        isPrimary: true,
        startDate: '2024-11-01',
        expectedHarvestDate: '2025-03-01',
        variety: 'Ponni / CO 51',
        notes: 'Paddy cultivation in 1.5 acre plot.',
        status: 'active',
      },
    ],
    cropHistory: [],
    treeHarvests: [],
  },
];

export const INITIAL_WORKERS: FarmWorker[] = [
  { id: 'wrk_velu', name: 'Velusamy (வேலுசாமி)', defaultDailyWage: 500, role: 'Field Coolie / உழவு & கூலி', phone: '9842100001' },
  { id: 'wrk_murugan', name: 'Murugan (முருகன்)', defaultDailyWage: 700, role: 'Coconut Tree Climber / தேங்காய் வெட்டு', phone: '9842100002' },
  { id: 'wrk_selvi', name: 'Selvi (செல்வி)', defaultDailyWage: 350, role: 'Weeding & Ridge Work / களை எடுத்தல்', phone: '9842100003' },
];

export const INITIAL_LIVESTOCK: FarmLivestock[] = [
  {
    id: 'live_sheep_batch',
    name: 'Country Sheep Batch (செம்மறி ஆடுகள்)',
    type: 'sheep',
    count: 4,
    purchaseCost: 24000,
    purchaseDate: '2024-02-15',
    notes: '4 Sheep for breeding, grazing on farm border & live sale.',
    status: 'active',
  },
  {
    id: 'live_dairy_cows',
    name: 'HF Dairy Cows (கறவை மாடுகள்)',
    type: 'cow',
    count: 2,
    dailyMilkLiters: 12,
    milkRatePerLiter: 38,
    purchaseCost: 85000,
    purchaseDate: '2023-06-10',
    notes: '2 Milking cows. Average 12 Liters/day supplied to dairy @ ₹38/L.',
    status: 'active',
  },
  {
    id: 'live_country_hens',
    name: 'Country Chicken / Hens (நாட்டுக்கோழி)',
    type: 'hen',
    count: 12,
    dailyEggCount: 8,
    eggRatePerPiece: 6,
    purchaseCost: 3600,
    notes: '12 Free-range country hens producing ~8 eggs/day @ ₹6.',
    status: 'active',
  },
  {
    id: 'live_ducks',
    name: 'Farm Ducks (பண்ணை வாத்துக்கள்)',
    type: 'duck',
    count: 4,
    dailyEggCount: 3,
    eggRatePerPiece: 7,
    purchaseCost: 1600,
    notes: '4 Ducks in farm water channel producing ~3 eggs/day.',
    status: 'active',
  },
];

export const INITIAL_LOANS: Loan[] = [];

export const INITIAL_SAVINGS: SavingScheme[] = [];

export const INITIAL_CATEGORIES: Category[] = [
  // 1. Farm & Agriculture Expenses
  { id: 'cat_farm_fertilizer', name: 'Fertilizers & Manure (உரம் & சாணம்/DAP)', type: 'expense', domain: 'farm', icon: 'Sprout', color: '#10B981', budgetLimit: 15000 },
  { id: 'cat_farm_labor', name: 'Farm Labor & Coolie (வேளாண் கூலி)', type: 'expense', domain: 'farm', icon: 'Users', color: '#059669', budgetLimit: 20000 },
  { id: 'cat_farm_seeds', name: 'Seeds & Saplings (விதை & நாற்று/கன்று)', type: 'expense', domain: 'farm', icon: 'Wheat', color: '#84CC16', budgetLimit: 8000 },
  { id: 'cat_farm_pesticide', name: 'Pesticides & Bio-sprays (பூச்சிக்கொல்லி & மருந்து)', type: 'expense', domain: 'farm', icon: 'FlaskConical', color: '#EAB308', budgetLimit: 4500 },
  { id: 'cat_farm_tractor', name: 'Tractor & Machinery Rental (டிராக்டர் / உழவு வாடகை)', type: 'expense', domain: 'farm', icon: 'Tractor', color: '#F97316', budgetLimit: 8000 },
  { id: 'cat_farm_irrigation', name: 'Irrigation, Pipes & Pump (பாசனம் & பம்பு மோட்டார்)', type: 'expense', domain: 'farm', icon: 'Droplets', color: '#06B6D4', budgetLimit: 5000 },
  { id: 'cat_tree_maintenance', name: 'Tree Pruning & Climber Coolie (மரம் கவாத்து & வெட்டு கூலி)', type: 'expense', domain: 'farm', icon: 'CircleDot', color: '#14B8A6', budgetLimit: 3000 },

  // 2. Livestock & Veterinary Expenses
  { id: 'cat_animal_medical', name: 'Animal Medical & Vet (கால்நடை மருத்துவம் & தடுப்பூசி)', type: 'expense', domain: 'livestock', icon: 'Stethoscope', color: '#EF4444', budgetLimit: 4000 },
  { id: 'cat_animal_feed', name: 'Cattle, Sheep & Poultry Feed (தீவனம் & புண்ணாக்கு)', type: 'expense', domain: 'livestock', icon: 'Milk', color: '#F59E0B', budgetLimit: 8000 },
  { id: 'cat_animal_purchase', name: 'Livestock Purchase (கால்நடை வாங்குதல்)', type: 'expense', domain: 'livestock', icon: 'Coins', color: '#D97706' },

  // 3. Human Healthcare & Medical Expenses
  { id: 'cat_human_medical', name: 'Human Healthcare & Pharmacy (மனித மருத்துவம் & மருந்துகள்)', type: 'expense', domain: 'medical', icon: 'HeartPulse', color: '#DC2626', budgetLimit: 5000 },

  // 4. Mobile, DTH & Utility Recharges
  { id: 'cat_mobile_recharge', name: 'Mobile & DTH Recharge (மொபைல் & டிடிஹெச் ரீசார்ஜ்)', type: 'expense', domain: 'utility', icon: 'Smartphone', color: '#8B5CF6', budgetLimit: 2000 },
  { id: 'cat_eb_electricity', name: 'Electricity (EB மின்கட்டணம் - பண்ணை & வீடு)', type: 'expense', domain: 'utility', icon: 'Zap', color: '#3B82F6', budgetLimit: 3500 },
  { id: 'cat_fuel', name: 'Fuel & Diesel (டீசல் & பெட்ரோல்)', type: 'expense', domain: 'utility', icon: 'Fuel', color: '#EC4899', budgetLimit: 6000 },

  // 5. Household & Personal
  { id: 'cat_groceries', name: 'Household Groceries (வீட்டு மளிகை)', type: 'expense', domain: 'household', icon: 'ShoppingCart', color: '#14B8A6', budgetLimit: 12000 },
  { id: 'cat_education', name: 'School & Education (கல்விக் கட்டணம்)', type: 'expense', domain: 'household', icon: 'GraduationCap', color: '#6366F1', budgetLimit: 15000 },
  { id: 'cat_investments', name: 'SIP & Gold Savings (முதலீடு & தங்கம்)', type: 'expense', domain: 'household', icon: 'TrendingUp', color: '#84CC16', budgetLimit: 20000 },

  // 6. Farm Harvest, Tree Yield & Livestock Sales Income
  { id: 'cat_crop_sale', name: 'Paddy & Crop Sales (நெல், கரும்பு, வாழை & மஞ்சள் விற்பனை)', type: 'income', domain: 'income', icon: 'Wheat', color: '#10B981' },
  { id: 'cat_coconut_sale', name: 'Coconut & Copra Sales (தேங்காய் & கொப்பரை விற்பனை)', type: 'income', domain: 'income', icon: 'CircleDot', color: '#059669' },
  { id: 'cat_milk_sale', name: 'Milk Supply & Dairy (பண்ணை பால் விற்பனை)', type: 'income', domain: 'income', icon: 'Milk', color: '#06B6D4' },
  { id: 'cat_egg_sale', name: 'Country Eggs Sales (நாட்டுக்கோழி & வாத்து முட்டை விற்பனை)', type: 'income', domain: 'income', icon: 'Egg', color: '#FBBF24' },
  { id: 'cat_animal_sale', name: 'Livestock Sales (செம்மறி ஆடு, கோழி & மாடு விற்பனை)', type: 'income', domain: 'income', icon: 'TrendingUp', color: '#D97706' },
  { id: 'cat_vegetable_sale', name: 'Vegetables & Onion Sales (காய்கறி & வெங்காயம் விற்பனை)', type: 'income', domain: 'income', icon: 'Apple', color: '#F59E0B' },
  { id: 'cat_farm_subsidy', name: 'Govt Agri Subsidies (விவசாய மானியம் & PM-Kisan)', type: 'income', domain: 'income', icon: 'Landmark', color: '#8B5CF6' },
  { id: 'cat_salary', name: 'Monthly Company Salary (கம்பெனி மாதச் சம்பளம் - கவின் & தம்பி)', type: 'income', domain: 'income', icon: 'Briefcase', color: '#6366F1' },
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc_bank', name: 'Primary Bank A/c (வங்கி கணக்கு)', type: 'bank', balance: 50000, accountNumber: '•••• 0001', icon: 'Building2', color: '#0284C7', isDefault: true },
  { id: 'acc_cash', name: 'Cash in Hand (கையில் ரொக்கம்)', type: 'cash', balance: 15000, icon: 'Coins', color: '#059669' },
];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_GOALS: SavingsGoal[] = [];

export const generateSampleTransactions = (): Transaction[] => {
  return [];
};

export const StorageService = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getFields: (): FarmField[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FIELDS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(INITIAL_FIELDS));
      return INITIAL_FIELDS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_FIELDS;
    }
  },

  saveFields: (fields: FarmField[]) => {
    localStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(fields));
  },

  getWorkers: (): FarmWorker[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WORKERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(INITIAL_WORKERS));
      return INITIAL_WORKERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_WORKERS;
    }
  },

  saveWorkers: (workers: FarmWorker[]) => {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
  },

  getLivestock: (): FarmLivestock[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LIVESTOCK);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LIVESTOCK, JSON.stringify(INITIAL_LIVESTOCK));
      return INITIAL_LIVESTOCK;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_LIVESTOCK;
    }
  },

  saveLivestock: (livestock: FarmLivestock[]) => {
    localStorage.setItem(STORAGE_KEYS.LIVESTOCK, JSON.stringify(livestock));
  },

  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    try {
      const parsed: Category[] = JSON.parse(data);
      // Ensure newly added farm/medical/recharge categories are present
      const existingIds = new Set(parsed.map(c => c.id));
      const missingDefaults = INITIAL_CATEGORIES.filter(c => !existingIds.has(c.id));
      if (missingDefaults.length > 0) {
        const merged = [...parsed, ...missingDefaults];
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getAccounts: (): Account[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ACCOUNTS;
    }
  },

  saveAccounts: (accounts: Account[]) => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  getBudgets: (): Budget[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
      return INITIAL_BUDGETS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_BUDGETS;
    }
  },

  saveBudgets: (budgets: Budget[]) => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  getGoals: (): SavingsGoal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
      return INITIAL_GOALS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_GOALS;
    }
  },

  saveGoals: (goals: SavingsGoal[]) => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  getLoans: (): Loan[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(INITIAL_LOANS));
      return INITIAL_LOANS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_LOANS;
    }
  },

  saveLoans: (loans: Loan[]) => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  },

  getSavings: (): SavingScheme[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SAVINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(INITIAL_SAVINGS));
      return INITIAL_SAVINGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_SAVINGS;
    }
  },

  saveSavings: (savings: SavingScheme[]) => {
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savings));
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    try {
      const parsed = JSON.parse(data);
      if (!parsed.sheetUrl) {
        parsed.sheetUrl = INITIAL_SETTINGS.sheetUrl;
        parsed.autoSync = true;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
      return { ...INITIAL_SETTINGS, ...parsed };
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_CURRENT_USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  saveCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_CURRENT_USER);
    }
  },

  removeCurrentUser: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_CURRENT_USER);
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all 4 family members are present in list
        const merged = [...parsed];
        DEFAULT_USERS.forEach(defUser => {
          if (!merged.some(u => u.id === defUser.id || u.username === defUser.username)) {
            merged.push(defUser);
          }
        });
        return merged;
      }
      return DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(users));
  },

  registerUser: (user: User) => {
    const users = StorageService.getUsers();
    const existingIndex = users.findIndex(
      u =>
        u.id === user.id ||
        (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase()) ||
        u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    StorageService.saveUsers(users);
  },

  deleteUser: (userId: string) => {
    const users = StorageService.getUsers().filter(u => u.id !== userId);
    StorageService.saveUsers(users);
  },

  getFamilyMembers: (): FamilyMember[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(INITIAL_FAMILY_MEMBERS));
      return INITIAL_FAMILY_MEMBERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_FAMILY_MEMBERS;
    }
  },

  saveFamilyMembers: (members: FamilyMember[]) => {
    localStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
  },

  getTreeHarvests: (): TreeHarvestEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TREE_HARVESTS);
    if (!data) {
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTreeHarvests: (harvests: TreeHarvestEntry[]) => {
    localStorage.setItem(STORAGE_KEYS.TREE_HARVESTS, JSON.stringify(harvests));
  },

  resetAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.FIELDS);
    localStorage.removeItem(STORAGE_KEYS.WORKERS);
    localStorage.removeItem(STORAGE_KEYS.LIVESTOCK);
    localStorage.removeItem(STORAGE_KEYS.FAMILY_MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.TREE_HARVESTS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.SAVINGS);
  },

  exportFullBackup: () => {
    return {
      transactions: StorageService.getTransactions(),
      categories: StorageService.getCategories(),
      accounts: StorageService.getAccounts(),
      budgets: StorageService.getBudgets(),
      goals: StorageService.getGoals(),
      fields: StorageService.getFields(),
      workers: StorageService.getWorkers(),
      livestock: StorageService.getLivestock(),
      familyMembers: StorageService.getFamilyMembers(),
      treeHarvests: StorageService.getTreeHarvests(),
      loans: StorageService.getLoans(),
      savings: StorageService.getSavings(),
      settings: StorageService.getSettings(),
      currentUser: StorageService.getCurrentUser(),
      users: StorageService.getUsers(),
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
    };
  },

  importBackup: (backup: any) => {
    if (backup.transactions) StorageService.saveTransactions(backup.transactions);
    if (backup.categories) StorageService.saveCategories(backup.categories);
    if (backup.accounts) StorageService.saveAccounts(backup.accounts);
    if (backup.budgets) StorageService.saveBudgets(backup.budgets);
    if (backup.goals) StorageService.saveGoals(backup.goals);
    if (backup.fields) StorageService.saveFields(backup.fields);
    if (backup.workers) StorageService.saveWorkers(backup.workers);
    if (backup.livestock) StorageService.saveLivestock(backup.livestock);
    if (backup.familyMembers) StorageService.saveFamilyMembers(backup.familyMembers);
    if (backup.treeHarvests) StorageService.saveTreeHarvests(backup.treeHarvests);
    if (backup.loans) StorageService.saveLoans(backup.loans);
    if (backup.savings) StorageService.saveSavings(backup.savings);
    if (backup.settings) StorageService.saveSettings(backup.settings);
    if (backup.currentUser) StorageService.saveCurrentUser(backup.currentUser);
    if (backup.users) StorageService.saveUsers(backup.users);
  },
};
