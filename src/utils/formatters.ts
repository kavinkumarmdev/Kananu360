export const CURRENCIES: { [key: string]: { symbol: string; name: string; locale: string } } = {
  INR: { symbol: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN' },
  USD: { symbol: '$', name: 'US Dollar (USD)', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro (EUR)', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound (GBP)', locale: 'en-GB' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham (AED)', locale: 'ar-AE' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar (SGD)', locale: 'en-SG' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar (CAD)', locale: 'en-CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar (AUD)', locale: 'en-AU' },
};

export const formatCurrency = (amount: number, currencyCode: string = 'INR'): string => {
  const currencyInfo = CURRENCIES[currencyCode] || CURRENCIES.INR;
  try {
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyInfo.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatRelativeDate = (dateString: string): string => {
  if (!dateString) return '';
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dateString === today) return 'Today';
  if (dateString === yesterday) return 'Yesterday';
  return formatDate(dateString);
};

export const getMonthName = (monthNumber: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNumber - 1] || '';
};

export const generateId = (prefix: string = 'k360'): string => {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
};

export const CATEGORY_PALETTE = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#3B82F6', // Blue
  '#84CC16', // Lime
  '#64748B', // Slate
];

export const PAYMENT_MODES: { id: string; label: string; icon: string }[] = [
  { id: 'upi', label: 'UPI / GPay / PhonePe', icon: 'QrCode' },
  { id: 'bank', label: 'Net Banking / NEFT', icon: 'Building2' },
  { id: 'credit_card', label: 'Credit Card', icon: 'CreditCard' },
  { id: 'debit_card', label: 'Debit Card', icon: 'CreditCard' },
  { id: 'cash', label: 'Cash in Hand', icon: 'Coins' },
  { id: 'other', label: 'Other', icon: 'Wallet' },
];

/**
 * Merge local and remote array of items by unique id, preserving newer updates
 */
export const mergeCollectionsById = <T extends { id?: string; updatedAt?: string; createdAt?: string; date?: string }>(
  localList: T[] = [],
  remoteList: T[] = []
): T[] => {
  const map = new Map<string, T>();

  // 1. First add all remote items
  (remoteList || []).forEach(item => {
    if (item && item.id) {
      map.set(item.id, item);
    }
  });

  // 2. Add or update with local items
  (localList || []).forEach(item => {
    if (item && item.id) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      } else {
        const remoteItem = map.get(item.id)!;
        const localTime = new Date((item as any).updatedAt || (item as any).createdAt || (item as any).date || 0).getTime();
        const remoteTime = new Date((remoteItem as any).updatedAt || (remoteItem as any).createdAt || (remoteItem as any).date || 0).getTime();
        if (localTime >= remoteTime) {
          map.set(item.id, item);
        }
      }
    }
  });

  return Array.from(map.values());
};
