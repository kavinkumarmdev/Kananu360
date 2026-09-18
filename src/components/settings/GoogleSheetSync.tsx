import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SetupWizardModal } from './SetupWizardModal';
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const GoogleSheetSync: React.FC = () => {
  const {
    settings,
    updateSettings,
    syncState,
    syncWithGoogleSheet,
    testConnection,
    transactions,
    accounts,
    loans,
    savings,
    fields,
    addToast,
    t,
  } = useFinance();

  const [urlInput, setUrlInput] = useState(settings.sheetUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    const result = await testConnection(urlInput.trim());
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      updateSettings({ sheetUrl: urlInput.trim() });
      addToast('Connected to Google Sheet database!', 'success');
    } else {
      addToast(`Connection error: ${result.message}`, 'error');
    }
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect Google Sheet? (Your local data will remain safe)')) {
      updateSettings({ sheetUrl: '' });
      setUrlInput('');
      setTestResult(null);
      addToast('Google Sheet disconnected. Running in local mode.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {settings.language === 'ta' ? 'கூகிள் தாள் நேரலை இணைப்பு' : 'Google Sheets Cloud Integration'}
          </h2>
          <p className="text-xs text-slate-400">
            {settings.language === 'ta'
              ? 'உங்கள் அனைத்து கணக்குகள், கடன்கள், சீட்டுகள் மற்றும் பண்ணை விவரங்கள் கூகிள் தாளில் தானாக ஒத்திசைக்கப்படும்.'
              : 'Seamless two-way cloud ledger synchronization with your private Google Spreadsheet.'}
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-glow-emerald transition self-start sm:self-auto"
        >
          <Sparkles size={15} />
          <span>{t('launchSetupWizard')}</span>
        </button>
      </div>

      {/* Connection Status Card */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                settings.sheetUrl
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-glow-emerald'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  {settings.sheetUrl ? 'Google Sheet Cloud Connected' : 'Local Storage Mode (Offline)'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                    settings.sheetUrl
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {settings.sheetUrl ? 'Live Cloud' : 'Local'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {settings.lastSyncedAt
                  ? `Last Cloud Sync: ${settings.lastSyncedAt}`
                  : settings.sheetUrl
                  ? 'Ready to sync with your connected spreadsheet'
                  : 'Connect your Google Apps Script URL below to enable cloud backup'}
              </p>
            </div>
          </div>

          {/* Sync Trigger Action buttons */}
          {settings.sheetUrl && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => syncWithGoogleSheet('smart')}
                disabled={syncState.status === 'syncing'}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm ${
                  syncState.pendingChangesCount > 0
                    ? 'bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-500 hover:from-amber-400 hover:to-indigo-400 shadow-glow pulse-glow-amber'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-glow'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncState.status === 'syncing' ? 'animate-spin' : ''}`} />
                <span>
                  {syncState.status === 'syncing'
                    ? t('syncing')
                    : syncState.pendingChangesCount > 0
                    ? `${t('syncNowWithSheet')} (${syncState.pendingChangesCount} ${t('unsyncedChanges')})`
                    : t('syncNowWithSheet')}
                </span>
              </button>

              <button
                onClick={() => syncWithGoogleSheet('pull')}
                disabled={syncState.status === 'syncing'}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold transition"
                title="Fetch latest updates from Google Sheet"
              >
                <span>{t('pullFromSheet')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Synchronized Ledger Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Transactions</span>
            <span className="font-extrabold text-white text-sm">{transactions.length} entries</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Accounts</span>
            <span className="font-extrabold text-white text-sm">{accounts.length} active</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Loans & Debts</span>
            <span className="font-extrabold text-white text-sm">{loans.length} loans</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Chit Funds & Savings</span>
            <span className="font-extrabold text-white text-sm">{savings.length} schemes</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-slate-400 block text-[11px]">Farm Fields</span>
            <span className="font-extrabold text-white text-sm">{fields.length} parcels</span>
          </div>
        </div>
      </div>

      {/* URL Configuration Form */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Link className="text-indigo-400 w-4 h-4" />
          {t('appsScriptEndpoint')}
        </h3>

        <form onSubmit={handleTestAndSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('appsScriptUrlLabel')}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                required
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isTesting || !urlInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {isTesting ? t('syncing') : t('testAndConnect')}
                </button>
                {settings.sheetUrl && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition whitespace-nowrap cursor-pointer"
                  >
                    {t('disconnect')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Test connection result banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-600/40 text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-rose-400 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </form>

        {/* Sync Mode Selector / Auto Sync Toggle */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white block">
                  {settings.autoSync ? t('backgroundAutoSync') : t('manualSyncMode')}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                  settings.autoSync
                    ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                }`}>
                  {settings.autoSync ? 'Auto-Sync Active' : 'Manual Mode (Default)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {settings.autoSync
                  ? t('backgroundAutoSyncDesc')
                  : t('manualSyncModeDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.autoSync}
                disabled={!settings.sheetUrl}
                onChange={e => updateSettings({ autoSync: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-40"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security and Privacy Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="text-indigo-400 w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-200 block mb-0.5">{t('privacyFirst')}</span>
          {t('privacyFirstDesc')}
        </div>
      </div>

      <SetupWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSaveUrl={url => {
          setUrlInput(url);
          updateSettings({ sheetUrl: url });
          addToast('Google Sheet URL saved!', 'success');
        }}
      />
    </div>
  );
};
