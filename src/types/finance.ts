export type TransactionType = 'expense' | 'income' | 'transfer';

export type PaymentMode = 'cash' | 'bank' | 'upi' | 'credit_card' | 'debit_card' | 'other';

export type PaymentStatus = 'paid' | 'pending';

export type CategoryDomain =
  | 'farm'
  | 'livestock'
  | 'medical'
  | 'utility'
  | 'household'
  | 'income'
  | 'other';

// ----------------------------------------------------
// FAMILY MEMBERS & OCCUPATION
// ----------------------------------------------------
export type FamilyRelation = 'self' | 'brother' | 'father' | 'mother' | 'spouse' | 'other';
export type MemberOccupation = 'company_job' | 'agriculture' | 'livestock' | 'business' | 'other';

export interface FamilyMember {
  id: string;
  name: string;
  nameTa: string;
  relation: FamilyRelation;
  occupation: MemberOccupation;
  occupationTitle: string;
  occupationTitleTa: string;
  avatar: string; // Emoji or icon
  color: string;
  phone?: string;
  monthlySalary?: number;
  notes?: string;
}

export const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'mem_kavin',
    name: 'Kavin',
    nameTa: 'கவின் (Self)',
    relation: 'self',
    occupation: 'company_job',
    occupationTitle: 'Software / Company Employee',
    occupationTitleTa: 'கார்ப்பரேட் / சாப்ட்வேர் வேலை',
    avatar: '👨‍💻',
    color: '#3B82F6',
  },
  {
    id: 'mem_brother',
    name: 'Brother',
    nameTa: 'தம்பி / அண்ணன் (Brother)',
    relation: 'brother',
    occupation: 'company_job',
    occupationTitle: 'Corporate / Company Job',
    occupationTitleTa: 'கம்பெனி / தொழில் வேலை',
    avatar: '👨‍💼',
    color: '#8B5CF6',
  },
  {
    id: 'mem_father',
    name: 'Appa / Father',
    nameTa: 'அப்பா (Farm Master)',
    relation: 'father',
    occupation: 'agriculture',
    occupationTitle: 'Farm Land & Crop Master',
    occupationTitleTa: 'முழுநேர விவசாயம் & பயிர் நிர்வாகம்',
    avatar: '👨‍🌾',
    color: '#10B981',
  },
  {
    id: 'mem_mother',
    name: 'Amma / Mother',
    nameTa: 'அம்மா (Dairy & Livestock)',
    relation: 'mother',
    occupation: 'livestock',
    occupationTitle: 'Dairy & Livestock Care',
    occupationTitleTa: 'கால்நடை & பால் பண்ணை பராமரிப்பு',
    avatar: '👩‍🌾',
    color: '#F59E0B',
  },
];

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  category: string;
  accountId: string;
  toAccountId?: string; // For transfers
  description: string;
  paymentMode: PaymentMode;
  tags?: string[];
  createdAt: string;

  // Family Member attribution
  memberId?: string; // Linked family member who earned / spent
  memberName?: string;

  // Farm, Crop, Tree & Labor specific fields
  fieldId?: string; // Linked field/plot (e.g. 1/2 Acre South Plot)
  fieldName?: string;
  cropId?: string;
  cropType?: string; // Specific crop for this transaction/season (e.g. Red Banana, Turmeric, Onion)
  treeId?: string; // Linked perennial tree (e.g. Coconut Tree)
  treeName?: string;
  workerName?: string; // Farm Laborer / Worker name
  workType?: string; // e.g. "Weeding / களை எடுத்தல்", "Harvesting / அறுவடை"
  workerCount?: number; // Number of workers or days (e.g., 4 workers)
  wageRate?: number; // Rate per worker for this specific work type
  paymentStatus?: PaymentStatus; // 'paid' | 'pending' (payable later)
  dueDate?: string; // Date promised/scheduled to give wage
  paidDate?: string; // Actual date payment was settled

  // Livestock specific fields
  livestockId?: string;
  livestockName?: string;
  productionType?: 'milk' | 'egg' | 'live_animal' | 'manure' | 'meat' | 'tree_harvest' | 'crop_yield' | 'salary' | 'general';
  productionQuantity?: number; // Liters of milk, count of eggs, or kg of meat
  productionUnitRate?: number; // Rate per L or per egg

  targetType?:
    | 'farm_labor'
    | 'farm_fertilizer'
    | 'farm_seeds'
    | 'farm_pesticide'
    | 'farm_tractor'
    | 'farm_irrigation'
    | 'tree_maintenance'
    | 'tree_harvest'
    | 'animal_medical'
    | 'animal_feed'
    | 'animal_purchase'
    | 'animal_sale'
    | 'human_medical'
    | 'mobile_recharge'
    | 'crop_sale'
    | 'milk_sale'
    | 'egg_sale'
    | 'general';
}

export interface WorkTypeOption {
  id: string;
  name: string;
  nameTa: string;
  defaultWage: number;
}

export const DEFAULT_WORK_TYPES: WorkTypeOption[] = [
  { id: 'weeding', name: 'Weeding & Ridge Work', nameTa: 'களை & வரப்பு வேலை', defaultWage: 350 },
  { id: 'harvesting', name: 'Harvesting & Transplanting', nameTa: 'நாற்று நடுதல் & அறுவடை', defaultWage: 500 },
  { id: 'spraying', name: 'Spraying & Bio-Pesticides', nameTa: 'மருந்து தெளிப்பு', defaultWage: 700 },
  { id: 'tractor', name: 'Tractor / Ploughing Operator', nameTa: 'டிராக்டர் / உழவு வேலை', defaultWage: 800 },
  { id: 'coconut', name: 'Coconut Plucking & Tree Pruning', nameTa: 'தேங்காய் வெட்டு & கவாத்து', defaultWage: 700 },
  { id: 'irrigation', name: 'Irrigation & Canal Maintenance', nameTa: 'பாசனம் & வாய்க்கால் வேலை', defaultWage: 450 },
  { id: 'cattle', name: 'Cattle & Dairy Care', nameTa: 'மாட்டுப் பராமரிப்பு / புல் அறுப்பு', defaultWage: 400 },
  { id: 'general', name: 'General Farm Coolie', nameTa: 'பொது பண்ணை கூலி வேலை', defaultWage: 500 },
];

export interface CropOption {
  id: string;
  name: string;
  nameTa: string;
}

export const POPULAR_CROPS: CropOption[] = [
  { id: 'red_banana', name: 'Red Banana (Sevvaazhai)', nameTa: 'செவ்வாழை' },
  { id: 'banana', name: 'Banana / G9 Plantain', nameTa: 'வாழை' },
  { id: 'turmeric', name: 'Turmeric (Erode Local / BSR)', nameTa: 'மஞ்சள்' },
  { id: 'onion', name: 'Small Onion / Shallots', nameTa: 'சின்ன வெங்காயம்' },
  { id: 'paddy', name: 'Paddy / Rice (Ponni / CO51)', nameTa: 'நெல்' },
  { id: 'coconut', name: 'Coconut Grove', nameTa: 'தென்னை' },
  { id: 'sugarcane', name: 'Sugarcane', nameTa: 'கரும்பு' },
  { id: 'maize', name: 'Maize / Corn', nameTa: 'மக்காச்சோளம்' },
  { id: 'tapioca', name: 'Tapioca / Cassava', nameTa: 'மரவள்ளிக்கிழங்கு' },
  { id: 'cotton', name: 'Cotton', nameTa: 'பருத்தி' },
  { id: 'groundnut', name: 'Groundnut / Peanut', nameTa: 'நிலக்கடலை' },
  { id: 'pulses', name: 'Black Gram / Ulundu', nameTa: 'உளுந்து / பயறு' },
  { id: 'greengram', name: 'Green Gram / Moong', nameTa: 'பாசிப்பயறு' },
  { id: 'redgram', name: 'Red Gram / Toor Dal', nameTa: 'துவரை' },
  { id: 'vegetables', name: 'Vegetables & Chillies', nameTa: 'காய்கறி / மிளகாய்' },
  { id: 'tomato', name: 'Tomato', nameTa: 'தக்காளி' },
  { id: 'brinjal', name: 'Brinjal / Eggplant', nameTa: 'கத்தரிக்காய்' },
  { id: 'bhendi', name: 'Ladies Finger / Okra', nameTa: 'வெண்டைக்காய்' },
  { id: 'flowers', name: 'Flowers (Jasmine / Marigold)', nameTa: 'மல்லிகை / பூக்கள்' },
  { id: 'sesame', name: 'Sesame / Gingelly', nameTa: 'எள்ளு' },
  { id: 'millets', name: 'Millets (Ragi / Kambu / Thinai)', nameTa: 'கேழ்வரகு / கம்பு' },
  { id: 'mango', name: 'Mango / Guava Orchard', nameTa: 'மாந்தோப்பு / கொய்யா' },
  { id: 'guava', name: 'Guava Fruit Orchard', nameTa: 'கொய்யா தோப்பு' },
  { id: 'papaya', name: 'Papaya', nameTa: 'பப்பாளி' },
  { id: 'moringa', name: 'Moringa / Drumstick', nameTa: 'முருங்கை' },
  { id: 'curryleaves', name: 'Curry Leaves', nameTa: 'கறிவேப்பிலை' },
  { id: 'betel', name: 'Betel Leaves', nameTa: 'வெற்றிலைக்கொடி' },
  { id: 'fodder', name: 'Green Fodder / Grass (CO4/CO5)', nameTa: 'தீவனப்புல்' },
  { id: 'ginger', name: 'Ginger / Garlic', nameTa: 'இஞ்சி / பூண்டு' },
  { id: 'fallow', name: 'Fallow / Resting Land', nameTa: 'தரிசு / ஓய்வு நிலம்' },
];

export interface TreeOption {
  id: string;
  name: string;
  nameTa: string;
  icon?: string;
  defaultHarvestIntervalMonths?: number;
}

export const POPULAR_TREES: TreeOption[] = [
  { id: 'coconut', name: 'Coconut Tree', nameTa: 'தென்னை மரம்', icon: '🥥', defaultHarvestIntervalMonths: 3 },
  { id: 'teak', name: 'Teak Wood', nameTa: 'தேக்கு மரம்', icon: '🪵' },
  { id: 'mango', name: 'Mango Tree', nameTa: 'மா மரம்', icon: '🥭', defaultHarvestIntervalMonths: 12 },
  { id: 'neem', name: 'Neem Tree', nameTa: 'வேப்ப மரம்', icon: '🌿' },
  { id: 'guava', name: 'Guava Tree', nameTa: 'கொய்யா மரம்', icon: '🍈', defaultHarvestIntervalMonths: 6 },
  { id: 'lemon', name: 'Lemon / Lime', nameTa: 'எலுமிச்சை', icon: '🍋', defaultHarvestIntervalMonths: 4 },
  { id: 'moringa', name: 'Moringa Tree', nameTa: 'முருங்கை மரம்', icon: '🌱', defaultHarvestIntervalMonths: 4 },
  { id: 'banana', name: 'Banana Tree', nameTa: 'வாழை மரம்', icon: '🍌' },
  { id: 'jackfruit', name: 'Jackfruit Tree', nameTa: 'பலா மரம்', icon: '🍈', defaultHarvestIntervalMonths: 12 },
  { id: 'sapota', name: 'Sapota / Chikoo', nameTa: 'சப்போட்டா', icon: '🥔', defaultHarvestIntervalMonths: 6 },
  { id: 'silveroak', name: 'Silver Oak', nameTa: 'சில்வர் ஓக்', icon: '🌲' },
  { id: 'mahogany', name: 'Mahogany', nameTa: 'மஹோகனி', icon: '🌳' },
  { id: 'redsandal', name: 'Red Sandalwood', nameTa: 'செம்மரம்', icon: '🪵' },
  { id: 'bamboo', name: 'Bamboo Cluster', nameTa: 'மூங்கில்', icon: '🎋' },
  { id: 'other', name: 'Other Tree / Border Tree', nameTa: 'மற்ற மரங்கள்', icon: '🌳' },
];

export interface TreeHarvestEntry {
  id: string;
  fieldId: string;
  treeId: string;
  treeType: string;
  date: string; // YYYY-MM-DD
  quantityHarvested: number; // e.g. 100 coconuts
  unit: string; // e.g. 'coconuts / காய்கள்', 'kg', 'boxes'
  ratePerUnit: number; // e.g. ₹20 per coconut
  totalIncome: number; // e.g. ₹2,000 (100 * 20)
  laborExpense?: number; // e.g. ₹300 paid to tree climber
  netIncome?: number; // totalIncome - laborExpense
  accountId?: string;
  notes?: string;
}

export interface FieldTreeItem {
  id: string;
  treeType: string; // e.g. "Coconut / தென்னை"
  count: number; // e.g. 20
  plantedDate?: string; // YYYY-MM-DD
  plantedYear?: string | number; // e.g. 2022
  variety?: string; // e.g. "Tall x Dwarf", "Alphonso"
  location?: 'boundary' | 'main_field' | 'scattered';
  harvestFrequencyMonths?: number; // e.g. 3 months for coconut
  averageYieldPerHarvest?: number; // e.g. 100 nuts
  ratePerUnit?: number; // e.g. ₹20 per nut
  lastHarvestDate?: string;
  notes?: string;
}

export interface FieldTreeHistoryEntry {
  id: string;
  treeType: string;
  action: 'planted' | 'removed' | 'harvested' | 'died';
  count: number; // e.g. 5 trees cut down
  date: string; // YYYY-MM-DD
  reason?: string; // e.g. "Cut for timber / wood sale", "Old age / unproductive", "Disease / storm"
  incomeEarned?: number; // Income received from selling wood/trees
  notes?: string;
}

export interface FieldCropItem {
  id: string;
  cropType: string; // e.g. "Red Banana / செவ்வாழை", "Turmeric / மஞ்சள்"
  isPrimary: boolean; // True for primary crop, false for secondary / intercrops
  intercropType?: string; // Secondary / intercrop name (e.g. Small Onion / சின்ன வெங்காயம்)
  plantCount?: number; // e.g. 300 Red Banana saplings
  plantCountUnit?: string; // e.g. 'saplings / கன்றுகள்', 'kg', 'packets'
  startDate?: string; // Sowing / planting date (YYYY-MM-DD)
  expectedHarvestDate?: string;
  estimatedExpense?: number;
  variety?: string; // e.g. "Sevvaazhai / Red Banana", "BSR Turmeric"
  notes?: string;
  status?: 'active' | 'harvested';
}

export interface CropHistoryEntry {
  id: string;
  cropType: string;
  isPrimary?: boolean;
  secondaryCrops?: string[];
  plantCount?: number;
  plantCountUnit?: string;
  startDate?: string;
  endDate?: string;
  duration?: string; // e.g. "11 Months (01/01/2024 to 01/12/2024)"
  
  // Financial P&L breakdown
  totalInvestment?: number; // Sum of fertilizers, labor, seeds, tractor, pesticides
  fertilizerExpense?: number;
  laborExpense?: number;
  seedExpense?: number;
  otherExpense?: number;
  
  harvestYield?: string; // e.g. "300 Bunches / வாழைத்தார்", "40 Bags"
  harvestIncome?: number; // Total revenue from crop sale e.g. ₹95,000
  netProfitLoss?: number; // harvestIncome - totalInvestment e.g. +₹56,500
  profitMarginPct?: number; // (netProfitLoss / totalInvestment) * 100
  
  reason?: string; // e.g. "Harvest completed / அறுவடை முடிந்தது", "Crop rotation", "Season end"
  hasBoundaryCoconut?: boolean;
  boundaryTreeCount?: number;
  notes?: string;
}

export interface FarmField {
  id: string;
  name: string; // e.g. "1/2 Acre South Plot", "1.5 Acre North Plot"
  areaAcre: number | string; // e.g. 0.5, 0.25, 0.75, 1.5, 2
  sizeUnit?: 'acres' | 'cents' | 'hectares' | 'sqft';
  color: string;
  notes?: string;

  // Active Trees (Fixed for years on boundary/main field)
  trees?: FieldTreeItem[];

  // Active Crops (0 or more, primary and intercrops)
  crops?: FieldCropItem[];

  // Complete persistent history
  treeHistory?: FieldTreeHistoryEntry[];
  cropHistory?: CropHistoryEntry[];
  treeHarvests?: TreeHarvestEntry[];

  // Backward compatibility fields
  cropType?: string; // Primary active crop name
  secondaryCrops?: string[]; // Intercropping / Parallel crops
  hasBoundaryCoconut?: boolean;
  boundaryTreeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type LivestockType = 'cow' | 'sheep' | 'goat' | 'hen' | 'duck' | 'buffalo' | 'poultry' | 'other';

export interface FarmLivestock {
  id: string;
  name: string; // e.g. "Country Sheep Batch (4)", "HF Dairy Cow", "Country Hens (12)", "Ducks (4)"
  type: LivestockType;
  count: number; // Head count / animal count (e.g. 4 sheep, 2 cows, 12 hens, 4 ducks)
  tagNumber?: string; // Ear tag / ID
  dailyMilkLiters?: number; // Daily milk yield in Liters (for dairy cows)
  milkRatePerLiter?: number; // Average milk rate e.g. ₹38/L
  dailyEggCount?: number; // Daily egg yield (for hens/ducks)
  eggRatePerPiece?: number; // e.g. ₹6 per egg
  purchaseCost?: number; // Initial investment / purchase amount
  purchaseDate?: string;
  notes?: string; // Breed, age, feed details
  status?: 'active' | 'sold';
}

export interface FarmWorker {
  id: string;
  name: string;
  phone?: string;
  defaultDailyWage?: number;
  role?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  domain?: CategoryDomain;
  budgetLimit?: number;
}

export type AccountType = 'bank' | 'cash' | 'upi' | 'credit_card' | 'wallet' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  accountNumber?: string;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  monthlyLimit: number;
  month?: number; // 1-12 or undefined for recurring
  year?: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  icon: string;
  color: string;
  notes?: string;
}

// ----------------------------------------------------
// LOANS & BORROWING (கடன் & தவணைகள்)
// ----------------------------------------------------
export type LoanType = 'borrowed' | 'lent'; // Borrowed from bank/person (Liability) vs Lent to someone (Asset)
export type InterestType = 'yearly_pct' | 'monthly_vatti'; // % per year (e.g. 8.5%) vs ₹ per ₹100 per month (e.g. ₹1.50 vatti)
export type LoanStatus = 'active' | 'closed';

export interface LoanPayment {
  id: string;
  date: string;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  accountId?: string;
  notes?: string;
}

export interface Loan {
  id: string;
  name: string; // e.g. "SBI KCC Crop Loan", "Tractor Finance", "Gold Loan"
  lenderBorrower: string; // Bank / Person name (e.g. "SBI Bank", "Mani Financier", "Velu Worker")
  type: LoanType;
  principalAmount: number; // Original loan amount (e.g. ₹3,00,000)
  interestRate: number; // e.g. 7% or 1.5 vatti
  interestType: InterestType;
  emiAmount?: number; // Monthly EMI or interest due
  startDate: string; // YYYY-MM-DD
  tenureMonths?: number;
  dueDate?: string; // Next payment due date (YYYY-MM-DD)
  status: LoanStatus;
  notes?: string;
  payments: LoanPayment[];
}

// ----------------------------------------------------
// SAVINGS & CHIT FUNDS (சேமிப்பு & ஏலச் சீட்டு முதலீடுகள்)
// ----------------------------------------------------
export type SavingSchemeType = 'fixed' | 'chit_fund'; // Type 1: Fixed/RD/FD vs Type 2: Chit Fund / Rotational Lump-sum
export type SavingFrequency = 'monthly' | 'weekly' | 'quarterly' | 'yearly';
export type SavingStatus = 'active' | 'completed';

export interface SavingInstallment {
  id: string;
  installmentNo: number; // e.g. 1, 2, 3, 4, 5...
  date: string;
  amountPaid: number; // e.g. ₹30,000 in month 1, ₹25,000 in month 2 (dividend adjusted)
  accountId?: string;
  notes?: string;
}

export interface SavingBulkClaim {
  isClaimed: boolean;
  claimedAmount?: number; // e.g. ₹4,58,746 taken in 4th month auction
  claimedDate?: string; // YYYY-MM-DD
  claimedInstallmentNo?: number; // Month/Installment at which the lump-sum prize was taken
  accountId?: string;
  notes?: string;
}

export interface SavingScheme {
  id: string;
  name: string; // e.g. "5 Lakhs ABC Chit Fund", "Post Office RD 5000"
  institution: string; // e.g. "ABC Chit Funds", "Post Office", "Gokulam"
  schemeType: SavingSchemeType; // 'fixed' | 'chit_fund'
  totalValue: number; // Chit target value (e.g. ₹5,00,000) or Maturity Target
  totalInstallments: number; // Total number of months/times (e.g. 20)
  frequency: SavingFrequency;
  startDate: string; // YYYY-MM-DD
  dueDate?: string; // Next payment due date (YYYY-MM-DD)
  dueDayOfMonth?: number; // e.g. 10th of every month
  status: SavingStatus;
  notes?: string;
  color?: string;
  // Type 2 Chit Fund specific properties
  installments: SavingInstallment[];
  bulkClaim?: SavingBulkClaim;
  // Type 1 Fixed / Target properties
  targetMaturityDate?: string;
  expectedReturnRate?: number;
}

export type Language = 'en' | 'ta';

export interface AppSettings {
  currency: string; // 'INR' | 'USD' | 'EUR' | 'GBP' etc.
  currencySymbol: string; // '₹', '$', '€', etc.
  sheetUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  theme: 'dark' | 'light';
  userName: string;
  language: Language;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'disconnected';

export interface SyncState {
  status: SyncStatus;
  lastSynced?: string;
  errorMessage?: string;
  pendingChangesCount: number;
}

export interface FilterOptions {
  searchQuery: string;
  type: 'all' | TransactionType;
  category: string;
  accountId: string;
  startDate: string;
  endDate: string;
  paymentMode: string;
  memberId?: string;
  fieldId?: string;
  workerName?: string;
  paymentStatus?: 'all' | PaymentStatus;
  domain?: 'all' | CategoryDomain;
}
