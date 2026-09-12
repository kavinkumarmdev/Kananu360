/**
 * =====================================================================
 * KANAKKU360 - COMPLETE GOOGLE APPS SCRIPT BACKEND DATABASE
 * =====================================================================
 * This script turns your Google Sheet into a full REST API for Kanakku360,
 * supporting:
 *  - 4 Family Members & Multi-Venture Attribution
 *  - 2-Acre Land Partitioning & Fractional Plots
 *  - Boundary Coconut Trees & Recurring 3-Month Harvest Logs
 *  - Seasonal Rotational Crop Cycles & Archived P&L Notes
 *  - Livestock Husbandry (Sheep, Cows, Hens, Ducks, Milk & Eggs)
 *  - Coolie Workers & Pending Labor Wage Ledgers
 *  - Standard Accounts, Categories, Budgets, Goals, Loans & Savings
 * 
 * Instructions:
 * 1. Open your Google Sheet (create a blank one or use existing).
 * 2. Click 'Extensions' > 'Apps Script'.
 * 3. Delete any existing code and paste this ENTIRE file into Code.gs.
 * 4. Click 'Deploy' > 'New deployment'.
 * 5. Select type: 'Web app'.
 * 6. Set 'Execute as': 'Me' (your email).
 * 7. Set 'Who has access': 'Anyone' (Required for the web app to connect).
 * 8. Click 'Deploy', authorize the Google permissions, and copy the Web App URL!
 * 9. Paste the URL in Kanakku360 'Settings' > 'Google Sheet Database'.
 * =====================================================================
 */

const SHEET_NAMES = {
  TRANSACTIONS: 'Transactions',
  FAMILY_MEMBERS: 'FamilyMembers',
  FIELDS: 'FarmFields',
  TREE_HARVESTS: 'TreeHarvests',
  LIVESTOCK: 'Livestock',
  WORKERS: 'Workers',
  CATEGORIES: 'Categories',
  ACCOUNTS: 'Accounts',
  BUDGETS: 'Budgets',
  GOALS: 'SavingsGoals',
  LOANS: 'Loans',
  SAVINGS: 'Savings',
  SETTINGS: 'Settings'
};

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheetsIfMissing(ss);

    let result = {};

    switch (action) {
      case 'ping':
        result = { 
          status: 'success', 
          message: 'Kanakku360 Google Sheet Cloud Database is online & ready!', 
          timestamp: new Date().toISOString() 
        };
        break;

      case 'getAll':
      default:
        result = {
          status: 'success',
          data: {
            transactions: getSheetData(ss.getSheetByName(SHEET_NAMES.TRANSACTIONS)),
            familyMembers: getSheetData(ss.getSheetByName(SHEET_NAMES.FAMILY_MEMBERS)),
            fields: getSheetData(ss.getSheetByName(SHEET_NAMES.FIELDS)),
            treeHarvests: getSheetData(ss.getSheetByName(SHEET_NAMES.TREE_HARVESTS)),
            livestock: getSheetData(ss.getSheetByName(SHEET_NAMES.LIVESTOCK)),
            workers: getSheetData(ss.getSheetByName(SHEET_NAMES.WORKERS)),
            categories: getSheetData(ss.getSheetByName(SHEET_NAMES.CATEGORIES)),
            accounts: getSheetData(ss.getSheetByName(SHEET_NAMES.ACCOUNTS)),
            budgets: getSheetData(ss.getSheetByName(SHEET_NAMES.BUDGETS)),
            goals: getSheetData(ss.getSheetByName(SHEET_NAMES.GOALS)),
            loans: getSheetData(ss.getSheetByName(SHEET_NAMES.LOANS)),
            savings: getSheetData(ss.getSheetByName(SHEET_NAMES.SAVINGS)),
            settings: getSheetData(ss.getSheetByName(SHEET_NAMES.SETTINGS))
          },
          timestamp: new Date().toISOString()
        };
        break;
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() }, 500);
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheetsIfMissing(ss);

    let requestData = {};
    if (e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    }

    const action = requestData.action || 'syncAll';
    const payload = requestData.payload || {};
    let response = { status: 'success' };

    switch (action) {
      case 'syncAll':
        // Full synchronize / overwrite of all tables
        if (payload.transactions) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.TRANSACTIONS), payload.transactions, getTransactionHeaders());
        if (payload.familyMembers) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.FAMILY_MEMBERS), payload.familyMembers, getFamilyMemberHeaders());
        if (payload.fields) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.FIELDS), payload.fields, getFieldHeaders());
        if (payload.treeHarvests) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.TREE_HARVESTS), payload.treeHarvests, getTreeHarvestHeaders());
        if (payload.livestock) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.LIVESTOCK), payload.livestock, getLivestockHeaders());
        if (payload.workers) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.WORKERS), payload.workers, getWorkerHeaders());
        if (payload.categories) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.CATEGORIES), payload.categories, getCategoryHeaders());
        if (payload.accounts) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.ACCOUNTS), payload.accounts, getAccountHeaders());
        if (payload.budgets) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.BUDGETS), payload.budgets, getBudgetHeaders());
        if (payload.goals) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.GOALS), payload.goals, getGoalHeaders());
        if (payload.loans) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.LOANS), payload.loans, getLoanHeaders());
        if (payload.savings) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.SAVINGS), payload.savings, getSavingHeaders());
        if (payload.settings) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.SETTINGS), payload.settings, getSettingsHeaders());
        response.message = 'All 13 Kanakku360 tables synchronized successfully!';
        break;

      case 'addTransaction':
        appendRow(ss.getSheetByName(SHEET_NAMES.TRANSACTIONS), payload, getTransactionHeaders());
        response.message = 'Transaction added to Google Sheet.';
        break;

      case 'updateTransaction':
        updateRowById(ss.getSheetByName(SHEET_NAMES.TRANSACTIONS), payload.id, payload, getTransactionHeaders());
        response.message = 'Transaction updated in Google Sheet.';
        break;

      case 'deleteTransaction':
        deleteRowById(ss.getSheetByName(SHEET_NAMES.TRANSACTIONS), payload.id);
        response.message = 'Transaction deleted from Google Sheet.';
        break;

      case 'updateAccountBalance':
        updateAccountBalance(ss.getSheetByName(SHEET_NAMES.ACCOUNTS), payload.id, payload.balance);
        response.message = 'Account balance updated.';
        break;

      default:
        response = { status: 'error', message: 'Unknown action: ' + action };
        break;
    }

    return createJsonResponse(response);
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() }, 500);
  }
}

/**
 * Format JSON response with proper MIME type
 */
function createJsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Initialize all required sheets and headers if not already created
 */
function initializeSheetsIfMissing(ss) {
  ensureSheetWithHeaders(ss, SHEET_NAMES.TRANSACTIONS, getTransactionHeaders(), '#3B82F6');
  ensureSheetWithHeaders(ss, SHEET_NAMES.FAMILY_MEMBERS, getFamilyMemberHeaders(), '#8B5CF6');
  ensureSheetWithHeaders(ss, SHEET_NAMES.FIELDS, getFieldHeaders(), '#10B981');
  ensureSheetWithHeaders(ss, SHEET_NAMES.TREE_HARVESTS, getTreeHarvestHeaders(), '#D97706');
  ensureSheetWithHeaders(ss, SHEET_NAMES.LIVESTOCK, getLivestockHeaders(), '#0D9488');
  ensureSheetWithHeaders(ss, SHEET_NAMES.WORKERS, getWorkerHeaders(), '#6366F1');
  ensureSheetWithHeaders(ss, SHEET_NAMES.CATEGORIES, getCategoryHeaders(), '#059669');
  ensureSheetWithHeaders(ss, SHEET_NAMES.ACCOUNTS, getAccountHeaders(), '#F59E0B');
  ensureSheetWithHeaders(ss, SHEET_NAMES.BUDGETS, getBudgetHeaders(), '#EF4444');
  ensureSheetWithHeaders(ss, SHEET_NAMES.GOALS, getGoalHeaders(), '#EC4899');
  ensureSheetWithHeaders(ss, SHEET_NAMES.LOANS, getLoanHeaders(), '#F43F5E');
  ensureSheetWithHeaders(ss, SHEET_NAMES.SAVINGS, getSavingHeaders(), '#14B8A6');
  ensureSheetWithHeaders(ss, SHEET_NAMES.SETTINGS, getSettingsHeaders(), '#475569');
}

function ensureSheetWithHeaders(ss, name, headers, headerColor) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground(headerColor || '#1E293B');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  } else {
    // Check if headers match and update if columns were added
    const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    if (existingHeaders.length < headers.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground(headerColor || '#1E293B');
      headerRange.setFontColor('#FFFFFF');
    }
  }
}

// ----------------------------------------------------
// TABLE HEADERS DEFINITIONS
// ----------------------------------------------------

function getTransactionHeaders() {
  return [
    'id', 'date', 'type', 'amount', 'category', 'accountId', 'toAccountId', 'description', 
    'paymentMode', 'tags', 'memberId', 'memberName', 'fieldId', 'fieldName', 
    'cropId', 'cropType', 'treeId', 'treeName', 'livestockId', 'livestockName', 
    'productionType', 'productionQuantity', 'productionUnitRate', 'workerName', 
    'workerCount', 'workType', 'paymentStatus', 'dueDate', 'createdAt'
  ];
}

function getFamilyMemberHeaders() {
  return [
    'id', 'name', 'nameTa', 'relation', 'occupation', 'occupationTitle', 
    'occupationTitleTa', 'avatar', 'color', 'phone', 'monthlySalary', 'notes'
  ];
}

function getFieldHeaders() {
  return [
    'id', 'name', 'areaAcre', 'sizeUnit', 'color', 'hasBoundaryCoconut', 
    'boundaryTreeCount', 'cropType', 'secondaryCrops', 'trees', 'crops', 
    'treeHistory', 'cropHistory', 'notes'
  ];
}

function getTreeHarvestHeaders() {
  return [
    'id', 'fieldId', 'treeId', 'treeType', 'date', 'quantityHarvested', 
    'unit', 'ratePerUnit', 'totalIncome', 'laborExpense', 'netIncome', 
    'accountId', 'notes'
  ];
}

function getLivestockHeaders() {
  return [
    'id', 'name', 'type', 'count', 'tagNumber', 'dailyMilkLiters', 
    'milkRatePerLiter', 'dailyEggCount', 'eggRatePerPiece', 'purchaseCost', 
    'status', 'notes'
  ];
}

function getWorkerHeaders() {
  return ['id', 'name', 'phone', 'role', 'defaultDailyWage', 'notes'];
}

function getCategoryHeaders() {
  return ['id', 'name', 'type', 'icon', 'color', 'budgetLimit'];
}

function getAccountHeaders() {
  return ['id', 'name', 'type', 'balance', 'accountNumber', 'icon', 'color', 'isDefault'];
}

function getBudgetHeaders() {
  return ['id', 'categoryId', 'categoryName', 'monthlyLimit', 'month', 'year'];
}

function getGoalHeaders() {
  return ['id', 'name', 'targetAmount', 'currentAmount', 'targetDate', 'category', 'icon', 'color', 'notes'];
}

function getLoanHeaders() {
  return ['id', 'name', 'type', 'amount', 'interestRate', 'interestType', 'monthlyEmi', 'tenureMonths', 'dueDate', 'balance', 'status', 'notes'];
}

function getSavingHeaders() {
  return ['id', 'name', 'type', 'targetAmount', 'monthlyInstallment', 'tenureMonths', 'startDate', 'currentBalance', 'notes'];
}

function getSettingsHeaders() {
  return ['key', 'value', 'updatedAt'];
}

// ----------------------------------------------------
// DATABASE HELPER FUNCTIONS
// ----------------------------------------------------

/**
 * Reads sheet rows as an array of JSON objects
 */
function getSheetData(sheet) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return [];

  const rows = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = rows[0];
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.every(cell => cell === '' || cell === null)) continue;

    const item = {};
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      if (!header) continue;
      let val = row[j];
      if (val instanceof Date) {
        val = val.toISOString().split('T')[0];
      } else if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try {
          val = JSON.parse(val);
        } catch (e) {}
      }
      item[header] = val;
    }
    data.push(item);
  }
  return data;
}

/**
 * Overwrites sheet data with updated list of objects
 */
function overwriteSheetData(sheet, items, headers) {
  if (!sheet) return;
  sheet.clearContents();
  sheet.appendRow(headers);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setBackground('#1E293B');
  sheet.setFrozenRows(1);

  if (!items || items.length === 0) return;

  const rows = items.map(item => {
    return headers.map(header => {
      let val = item[header];
      if (val !== undefined && val !== null) {
        if (typeof val === 'object') {
          return JSON.stringify(val);
        }
        return val;
      }
      return '';
    });
  });

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

/**
 * Appends a single record
 */
function appendRow(sheet, item, headers) {
  if (!sheet) return;
  const row = headers.map(h => {
    let val = item[h];
    if (val !== undefined && val !== null) {
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    }
    return '';
  });
  sheet.appendRow(row);
}

/**
 * Updates a record by ID
 */
function updateRowById(sheet, id, item, headers) {
  if (!sheet || !id) return;
  const data = sheet.getDataRange().getValues();
  const idColIndex = headers.indexOf('id');
  if (idColIndex === -1) return;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(id)) {
      const newRow = headers.map(h => {
        let val = item[h] !== undefined && item[h] !== null ? item[h] : data[i][headers.indexOf(h)];
        if (val !== undefined && val !== null && typeof val === 'object') return JSON.stringify(val);
        return val;
      });
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([newRow]);
      return;
    }
  }
  appendRow(sheet, item, headers);
}

/**
 * Deletes a row by ID
 */
function deleteRowById(sheet, id) {
  if (!sheet || !id) return;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

/**
 * Updates an account balance
 */
function updateAccountBalance(sheet, id, newBalance) {
  if (!sheet || !id) return;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const balIndex = headers.indexOf('balance');
  if (balIndex === -1) return;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.getRange(i + 1, balIndex + 1).setValue(newBalance);
      return;
    }
  }
}
