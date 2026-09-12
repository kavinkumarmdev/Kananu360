import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Copy, Check, ExternalLink, CheckCircle2, ChevronRight, FileSpreadsheet } from 'lucide-react';

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUrl: (url: string) => void;
}

const APPS_SCRIPT_CODE = `/**
 * =====================================================================
 * KANAKKU360 - GOOGLE APPS SCRIPT BACKEND DATABASE
 * =====================================================================
 */
const SHEET_NAMES = {
  TRANSACTIONS: 'Transactions',
  CATEGORIES: 'Categories',
  ACCOUNTS: 'Accounts',
  BUDGETS: 'Budgets',
  GOALS: 'SavingsGoals',
  SETTINGS: 'Settings'
};

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initializeSheetsIfMissing(ss);

    let result = {};
    if (action === 'ping') {
      result = { status: 'success', message: 'Kanakku360 Google Sheet API is online!', timestamp: new Date().toISOString() };
    } else {
      result = {
        status: 'success',
        data: {
          transactions: getSheetData(ss.getSheetByName(SHEET_NAMES.TRANSACTIONS)),
          categories: getSheetData(ss.getSheetByName(SHEET_NAMES.CATEGORIES)),
          accounts: getSheetData(ss.getSheetByName(SHEET_NAMES.ACCOUNTS)),
          budgets: getSheetData(ss.getSheetByName(SHEET_NAMES.BUDGETS)),
          goals: getSheetData(ss.getSheetByName(SHEET_NAMES.GOALS)),
          settings: getSheetData(ss.getSheetByName(SHEET_NAMES.SETTINGS))
        },
        timestamp: new Date().toISOString()
      };
    }
    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() }, 500);
  }
}

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

    if (action === 'syncAll') {
      if (payload.transactions) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.TRANSACTIONS), payload.transactions, ['id', 'date', 'type', 'amount', 'category', 'accountId', 'toAccountId', 'description', 'paymentMode', 'tags', 'createdAt']);
      if (payload.categories) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.CATEGORIES), payload.categories, ['id', 'name', 'type', 'icon', 'color', 'budgetLimit']);
      if (payload.accounts) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.ACCOUNTS), payload.accounts, ['id', 'name', 'type', 'balance', 'accountNumber', 'icon', 'color', 'isDefault']);
      if (payload.budgets) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.BUDGETS), payload.budgets, ['id', 'categoryId', 'categoryName', 'monthlyLimit', 'month', 'year']);
      if (payload.goals) overwriteSheetData(ss.getSheetByName(SHEET_NAMES.GOALS), payload.goals, ['id', 'name', 'targetAmount', 'currentAmount', 'targetDate', 'category', 'icon', 'color', 'notes']);
      response.message = 'All synchronized successfully.';
    } else if (action === 'addTransaction') {
      appendRow(ss.getSheetByName(SHEET_NAMES.TRANSACTIONS), payload, ['id', 'date', 'type', 'amount', 'category', 'accountId', 'toAccountId', 'description', 'paymentMode', 'tags', 'createdAt']);
    } else if (action === 'deleteTransaction') {
      deleteRowById(ss.getSheetByName(SHEET_NAMES.TRANSACTIONS), payload.id);
    }
    return createJsonResponse(response);
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() }, 500);
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function initializeSheetsIfMissing(ss) {
  ensureSheet(ss, SHEET_NAMES.TRANSACTIONS, ['id', 'date', 'type', 'amount', 'category', 'accountId', 'toAccountId', 'description', 'paymentMode', 'tags', 'createdAt'], '#4F46E5');
  ensureSheet(ss, SHEET_NAMES.CATEGORIES, ['id', 'name', 'type', 'icon', 'color', 'budgetLimit'], '#059669');
  ensureSheet(ss, SHEET_NAMES.ACCOUNTS, ['id', 'name', 'type', 'balance', 'accountNumber', 'icon', 'color', 'isDefault'], '#D97706');
  ensureSheet(ss, SHEET_NAMES.BUDGETS, ['id', 'categoryId', 'categoryName', 'monthlyLimit', 'month', 'year'], '#DC2626');
  ensureSheet(ss, SHEET_NAMES.GOALS, ['id', 'name', 'targetAmount', 'currentAmount', 'targetDate', 'category', 'icon', 'color', 'notes'], '#7C3AED');
  ensureSheet(ss, SHEET_NAMES.SETTINGS, ['key', 'value', 'updatedAt'], '#475569');
}

function ensureSheet(ss, name, headers, color) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    const range = sheet.getRange(1, 1, 1, headers.length);
    range.setFontWeight('bold');
    range.setBackground(color);
    range.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
}

function getSheetData(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const headers = rows[0];
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.every(c => c === '' || c === null)) continue;
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      let val = row[j];
      if (val instanceof Date) val = val.toISOString().split('T')[0];
      item[headers[j]] = val;
    }
    data.push(item);
  }
  return data;
}

function overwriteSheetData(sheet, items, headers) {
  if (!sheet) return;
  sheet.clearContents();
  sheet.appendRow(headers);
  const range = sheet.getRange(1, 1, 1, headers.length);
  range.setFontWeight('bold');
  range.setFontColor('#FFFFFF');
  range.setBackground('#1E293B');
  sheet.setFrozenRows(1);
  if (!items || items.length === 0) return;
  const rows = items.map(item => headers.map(h => (item[h] !== undefined && item[h] !== null ? item[h] : '')));
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function appendRow(sheet, item, headers) {
  if (!sheet) return;
  const row = headers.map(h => (item[h] !== undefined && item[h] !== null ? item[h] : ''));
  sheet.appendRow(row);
}

function deleteRowById(sheet, id) {
  if (!sheet || !id) return;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}`;

export const SetupWizardModal: React.FC<SetupWizardModalProps> = ({
  isOpen,
  onClose,
  onSaveUrl,
}) => {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFinish = () => {
    if (urlInput.trim()) {
      onSaveUrl(urlInput.trim());
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Sheets Database Setup Wizard"
      subtitle="Connect any Google Sheet as your personal cloud backend in 3 simple steps"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2">
          {[
            { num: 1, label: 'Create Sheet' },
            { num: 2, label: 'Paste Script' },
            { num: 3, label: 'Deploy & Connect' },
          ].map(s => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  step === s.num
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  step === s.num ? 'text-white' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Create Sheet */}
        {step === 1 && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-400 w-4 h-4" />
              Step 1: Open a new Google Sheet
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Create a fresh Google Spreadsheet to act as your secure private database. Kanakku360 will automatically configure all sheets and tables for you.
            </p>
            <div className="pt-2">
              <a
                href="https://sheets.new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
              >
                <span>Open Google Sheets (sheets.new)</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        {/* Step 2: Paste Script */}
        {step === 2 && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="text-indigo-400 w-4 h-4" />
              Step 2: Paste Backend Script in Apps Script Editor
            </h4>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>In your Google Sheet menu, click <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Delete all existing boilerplate code in the editor.</li>
              <li>Click the button below to copy the complete Kanakku360 backend script and paste it into the editor.</li>
              <li>Press <kbd className="bg-slate-800 px-1 rounded">Ctrl+S</kbd> / <kbd className="bg-slate-800 px-1 rounded">Cmd+S</kbd> to save.</li>
            </ol>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Apps Script Backend Code'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Deploy as Web App */}
        {step === 3 && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ExternalLink className="text-amber-400 w-4 h-4" />
              Step 3: Deploy as Web App & Paste URL
            </h4>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>Click <strong>Deploy</strong> &gt; <strong>New deployment</strong> (top right).</li>
              <li>Click ⚙️ (Select type) and choose <strong>Web app</strong>.</li>
              <li>Set <em>Execute as</em>: <strong>Me</strong>.</li>
              <li>Set <em>Who has access</em>: <strong>Anyone</strong> (needed for your browser to sync data).</li>
              <li>Click <strong>Deploy</strong>, grant authorization permissions, and copy the <strong>Web app URL</strong>.</li>
            </ol>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Paste Web App URL
              </label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
              >
                <span>Next Step</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={!urlInput.trim()}
                onClick={handleFinish}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-glow-emerald transition"
              >
                Connect & Initialize Sheet
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
