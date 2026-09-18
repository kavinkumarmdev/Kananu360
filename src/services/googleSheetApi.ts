import type { Transaction, Category, Account, Budget, SavingsGoal, AppSettings, Loan, SavingScheme, FarmField, FarmWorker, FamilyMember, TreeHarvestEntry, FarmLivestock } from '../types/finance';

export interface SheetFullPayload {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  goals: SavingsGoal[];
  loans?: Loan[];
  savings?: SavingScheme[];
  fields?: FarmField[];
  treeHarvests?: TreeHarvestEntry[];
  livestock?: FarmLivestock[];
  workers?: FarmWorker[];
  familyMembers?: FamilyMember[];
  settings?: Partial<AppSettings> | Partial<AppSettings>[];
}

export interface SheetApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  timestamp?: string;
}

export const GoogleSheetApiService = {
  /**
   * Test the connection to the Google Apps Script Web App
   */
  testConnection: async (scriptUrl: string): Promise<{ success: boolean; message: string }> => {
    if (!scriptUrl || !scriptUrl.trim()) {
      return { success: false, message: 'Google Apps Script URL cannot be empty.' };
    }

    try {
      const url = new URL(scriptUrl.trim());
      url.searchParams.set('action', 'ping');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json: SheetApiResponse = await response.json();
      if (json.status === 'success') {
        return { success: true, message: json.message || 'Connected to Google Sheet successfully!' };
      } else {
        return { success: false, message: json.message || 'Error reported by Google Apps Script.' };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to connect. Please check URL and ensure Web App permissions are set to "Anyone".',
      };
    }
  },

  /**
   * Fetch all data from Google Sheet
   */
  fetchAllData: async (scriptUrl: string): Promise<SheetApiResponse<SheetFullPayload>> => {
    if (!scriptUrl || !scriptUrl.trim()) {
      throw new Error('Google Sheet URL is not configured.');
    }

    const url = new URL(scriptUrl.trim());
    url.searchParams.set('action', 'getAll');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const json: SheetApiResponse<SheetFullPayload> = await response.json();
    return json;
  },

  /**
   * Sync full local database to Google Sheet
   */
  syncAllToSheet: async (scriptUrl: string, payload: SheetFullPayload): Promise<SheetApiResponse> => {
    if (!scriptUrl || !scriptUrl.trim()) {
      throw new Error('Google Sheet URL is not configured.');
    }

    const bodyData = {
      action: 'syncAll',
      payload: {
        transactions: payload.transactions,
        familyMembers: payload.familyMembers,
        fields: payload.fields,
        treeHarvests: payload.treeHarvests,
        livestock: payload.livestock,
        workers: payload.workers,
        categories: payload.categories,
        accounts: payload.accounts,
        budgets: payload.budgets,
        goals: payload.goals,
        loans: payload.loans || [],
        savings: payload.savings || [],
        settings: Array.isArray(payload.settings)
          ? payload.settings
          : payload.settings
          ? [payload.settings]
          : [],
      },
    };

    // Use text/plain to prevent CORS preflight OPTIONS rejection on Google Apps Script
    const response = await fetch(scriptUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const json = await response.json();
    return json;
  },

  /**
   * Add a single transaction to Google Sheet
   */
  addTransaction: async (scriptUrl: string, transaction: Transaction): Promise<SheetApiResponse> => {
    if (!scriptUrl || !scriptUrl.trim()) {
      return { status: 'success', message: 'Saved locally' };
    }

    const response = await fetch(scriptUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'addTransaction', payload: transaction }),
    });

    return await response.json();
  },

  /**
   * Delete a transaction from Google Sheet
   */
  deleteTransaction: async (scriptUrl: string, transactionId: string): Promise<SheetApiResponse> => {
    if (!scriptUrl || !scriptUrl.trim()) {
      return { status: 'success', message: 'Deleted locally' };
    }

    const response = await fetch(scriptUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'deleteTransaction', payload: { id: transactionId } }),
    });

    return await response.json();
  }
};
