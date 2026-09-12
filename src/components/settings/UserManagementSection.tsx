import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  Users,
  UserPlus,
  Trash2,
  X,
  PlusCircle,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UserManagementSection: React.FC = () => {
  const { user, availableUsers, createUser, deleteUser, isLoading } = useAuth();
  const { addToast, t } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [pin, setPin] = useState<string>('1234');
  const [role, setRole] = useState<string>('Ledger User');
  const [currency, setCurrency] = useState<string>('INR');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const resetForm = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setPin('1234');
    setRole('Ledger User');
    setCurrency('INR');
    setErrorMessage('');
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Full name is required');
      return;
    }
    if (!username.trim() && !email.trim()) {
      setErrorMessage('Username or email is required');
      return;
    }

    const finalEmail = email.trim() || `${username.trim().toLowerCase()}@kanakku360.local`;
    const finalUsername = username.trim().toLowerCase() || name.trim().toLowerCase().replace(/\s+/g, '');
    const finalPassword = password.trim() || '123456';

    const res = await createUser({
      name: name.trim(),
      username: finalUsername,
      email: finalEmail,
      password: finalPassword,
      pin: pin.trim() || '1234',
      role: role.trim() || 'Family Member',
      currency: currency || 'INR',
    });

    if (res.success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      addToast(t('userCreatedSuccess'), 'success');
      handleCloseModal();
    } else {
      setErrorMessage(res.error || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (targetUserId: string, targetUserName: string) => {
    if (confirm(`${t('deleteUserConfirm')} (${targetUserName})`)) {
      const res = await deleteUser(targetUserId);
      if (res.success) {
        addToast(t('userDeletedSuccess'), 'info');
      } else {
        addToast(res.error || 'Failed to delete user', 'error');
      }
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Users className="text-indigo-400 w-5 h-5" />
            <span>{t('userManagementTitle')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('userManagementSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-glow transition active:scale-95"
        >
          <UserPlus size={15} />
          <span>{t('createNewUser')}</span>
        </button>
      </div>

      {/* List of Registered Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {availableUsers.map(u => {
          const isCurrentActive = user?.id === u.id;
          return (
            <div
              key={u.id}
              className={`p-4 rounded-xl border transition flex items-center justify-between ${
                isCurrentActive
                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-glow'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                  {u.avatar || '👤'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">{u.name}</span>
                    {isCurrentActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        <UserCheck size={11} />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    @{u.username || u.name.toLowerCase().replace(/\s+/g, '')} • {u.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                      {u.role || 'Member'}
                    </span>
                    {u.pin && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        PIN: ••••
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isCurrentActive && (
                <button
                  type="button"
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  title="Delete user profile"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition shrink-0 ml-2"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Create New User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{t('createNewUser')}</h3>
                  <p className="text-xs text-slate-400">{t('createNewUserSubtitle')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {t('authFullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      if (!username) {
                        setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                      }
                    }}
                    placeholder="e.g. Priya"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {t('usernameLabel')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="e.g. priya"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. priya@kanakku360.com"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {t('authPassword')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Quick PIN (4 Digits)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-center tracking-widest font-mono text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {t('roleLabel')}
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Partner, Accountant"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {t('authPreferredCurrency')}
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="INR" className="bg-slate-900">INR (₹) - Indian Rupee</option>
                    <option value="USD" className="bg-slate-900">USD ($) - US Dollar</option>
                    <option value="EUR" className="bg-slate-900">EUR (€) - Euro</option>
                    <option value="GBP" className="bg-slate-900">GBP (£) - British Pound</option>
                    <option value="SGD" className="bg-slate-900">SGD (S$) - Singapore Dollar</option>
                    <option value="AED" className="bg-slate-900">AED (د.إ) - UAE Dirham</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-glow flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <PlusCircle size={15} />
                      <span>{t('createNewUser')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
