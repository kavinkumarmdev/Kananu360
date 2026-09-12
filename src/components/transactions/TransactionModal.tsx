import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import type { Transaction, TransactionType, PaymentMode, PaymentStatus, CategoryDomain } from '../../types/finance';
import { DEFAULT_WORK_TYPES, POPULAR_CROPS } from '../../types/finance';
import { PAYMENT_MODES } from '../../utils/formatters';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Trash2,
  Plus,
  Sprout,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
}) => {
  const {
    categories,
    accounts,
    fields,
    workers,
    livestock,
    familyMembers,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    addField,
    addWorker,
    settings,
    t,
    getCategoryName,
    getPaymentModeLabel,
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);

  // Family Member attribution
  const [memberId, setMemberId] = useState<string>('');

  // Farm & Labor specific fields
  const [fieldId, setFieldId] = useState<string>('');
  const [transactionCrop, setTransactionCrop] = useState<string>('');
  const [treeId, setTreeId] = useState<string>('');
  const [workerName, setWorkerName] = useState<string>('');
  const [workType, setWorkType] = useState<string>('');
  const [workerCount, setWorkerCount] = useState<string>('');
  const [wageRate, setWageRate] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [dueDate, setDueDate] = useState<string>('');

  // Livestock & Production specific fields
  const [livestockId, setLivestockId] = useState<string>('');
  const [productionQty, setProductionQty] = useState<string>('');
  const [productionRate, setProductionRate] = useState<string>('');

  // Inline Quick Creator modals/popups
  const [showNewCategoryModal, setShowNewCategoryModal] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDomain, setNewCatDomain] = useState<CategoryDomain>('farm');

  const [showNewFieldModal, setShowNewFieldModal] = useState<boolean>(false);
  const [newFieldName, setNewFieldName] = useState<string>('');
  const [newFieldArea, setNewFieldArea] = useState<string>('0.5');
  const [newFieldCrop, setNewFieldCrop] = useState<string>('Paddy / நெல்');

  const [showNewWorkerModal, setShowNewWorkerModal] = useState<boolean>(false);
  const [newWorkerName, setNewWorkerName] = useState<string>('');
  const [newWorkerPhone, setNewWorkerPhone] = useState<string>('');

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(String(transactionToEdit.amount));
      setCategoryId(transactionToEdit.category || '');
      setAccountId(transactionToEdit.accountId);
      setToAccountId(transactionToEdit.toAccountId || '');
      setDescription(transactionToEdit.description || '');
      setDate(transactionToEdit.date);
      setPaymentMode(transactionToEdit.paymentMode || 'cash');
      setTags(transactionToEdit.tags || []);
      setMemberId(transactionToEdit.memberId || '');
      setFieldId(transactionToEdit.fieldId || '');
      setTransactionCrop(transactionToEdit.cropType || '');
      setTreeId(transactionToEdit.treeId || '');
      setWorkerName(transactionToEdit.workerName || '');
      setWorkType(transactionToEdit.workType || '');
      setWorkerCount(transactionToEdit.workerCount ? String(transactionToEdit.workerCount) : '');
      setWageRate(transactionToEdit.wageRate ? String(transactionToEdit.wageRate) : '');
      setPaymentStatus(transactionToEdit.paymentStatus || 'paid');
      setDueDate(transactionToEdit.dueDate || '');
      setLivestockId(transactionToEdit.livestockId || '');
      setProductionQty(transactionToEdit.productionQuantity ? String(transactionToEdit.productionQuantity) : '');
      setProductionRate(transactionToEdit.productionUnitRate ? String(transactionToEdit.productionUnitRate) : '');
    } else {
      setType('expense');
      setAmount('');
      const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
      setAccountId(defaultAcc ? defaultAcc.id : '');
      const expenseCats = categories.filter(c => c.type === 'expense');
      setCategoryId(expenseCats.length > 0 ? expenseCats[0].id : '');
      setToAccountId(accounts.length > 1 ? accounts[1].id : '');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('cash');
      setTags([]);
      setMemberId('');
      setFieldId('');
      setTransactionCrop('');
      setTreeId('');
      setWorkerName('');
      setWorkType('');
      setWorkerCount('');
      setWageRate('');
      setPaymentStatus('paid');
      setDueDate('');
      setLivestockId('');
      setProductionQty('');
      setProductionRate('');
    }
  }, [transactionToEdit, isOpen, accounts, categories]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      const incCats = categories.filter(c => c.type === 'income');
      if (incCats.length > 0) setCategoryId(incCats[0].id);
    } else if (newType === 'expense') {
      const expCats = categories.filter(c => c.type === 'expense');
      if (expCats.length > 0) setCategoryId(expCats[0].id);
    }
  };

  const handleWorkerSelect = (name: string) => {
    setWorkerName(name);
    if (!description && name) {
      setDescription(workType ? `${name} - ${workType}` : name);
    }
  };

  const handleWorkTypeSelect = (selectedId: string) => {
    const found = DEFAULT_WORK_TYPES.find(wt => wt.id === selectedId);
    if (found) {
      const typeLabel = settings.language === 'ta' ? found.nameTa : found.name;
      setWorkType(typeLabel);
      setWageRate(String(found.defaultWage));
      const count = parseFloat(workerCount) || 1;
      setAmount(String(found.defaultWage * count));
      if (!description && workerName) {
        setDescription(`${workerName} - ${typeLabel}`);
      } else if (!description) {
        setDescription(typeLabel);
      }
    } else {
      setWorkType(selectedId);
    }
  };

  const handleWorkerCountChange = (val: string) => {
    setWorkerCount(val);
    const count = parseFloat(val);
    const rate = parseFloat(wageRate);
    if (!isNaN(count) && !isNaN(rate) && count > 0 && rate > 0) {
      setAmount(String(count * rate));
    }
  };

  const handleWageRateChange = (val: string) => {
    setWageRate(val);
    const rate = parseFloat(val);
    const count = parseFloat(workerCount) || 1;
    if (!isNaN(rate) && rate > 0) {
      setAmount(String(rate * count));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Quick Create Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const created = await addCategory({
      name: newCatName.trim(),
      type: type === 'income' ? 'income' : 'expense',
      domain: newCatDomain,
      icon: newCatDomain === 'farm' ? 'Sprout' : newCatDomain === 'medical' ? 'HeartPulse' : 'Tag',
      color: '#10B981',
    });
    setCategoryId(created.id);
    setNewCatName('');
    setShowNewCategoryModal(false);
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    const created = await addField({
      name: newFieldName.trim(),
      areaAcre: newFieldArea,
      cropType: newFieldCrop.trim() || undefined,
      color: '#10B981',
    });
    setFieldId(created.id);
    setTransactionCrop(created.cropType || '');
    setNewFieldName('');
    setShowNewFieldModal(false);
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim()) return;
    const created = await addWorker({
      name: newWorkerName.trim(),
      phone: newWorkerPhone.trim() || undefined,
    });
    handleWorkerSelect(created.name);
    setNewWorkerName('');
    setNewWorkerPhone('');
    setShowNewWorkerModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const selectedFieldObj = fields.find(f => f.id === fieldId);
    const selectedMemberObj = familyMembers.find(m => m.id === memberId);
    const selectedTreeObj = selectedFieldObj?.trees?.find(t => t.id === treeId);
    const selectedLivestockObj = livestock.find(a => a.id === livestockId);

    const payload = {
      type,
      amount: numAmount,
      category: type === 'transfer' ? '' : categoryId,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      description,
      date,
      paymentMode,
      tags,
      memberId: memberId || undefined,
      memberName: selectedMemberObj ? selectedMemberObj.name : undefined,
      fieldId: fieldId || undefined,
      fieldName: selectedFieldObj ? selectedFieldObj.name : undefined,
      cropType: transactionCrop.trim() || undefined,
      treeId: treeId || undefined,
      treeName: selectedTreeObj ? selectedTreeObj.treeType : undefined,
      workerName: workerName || undefined,
      workType: workType || undefined,
      workerCount: workerCount ? parseFloat(workerCount) : undefined,
      wageRate: wageRate ? parseFloat(wageRate) : undefined,
      livestockId: livestockId || undefined,
      livestockName: selectedLivestockObj ? selectedLivestockObj.name : undefined,
      productionQuantity: productionQty ? parseFloat(productionQty) : undefined,
      productionUnitRate: productionRate ? parseFloat(productionRate) : undefined,
      productionType: (categoryId === 'cat_milk_sale'
        ? 'milk'
        : categoryId === 'cat_egg_sale'
        ? 'egg'
        : categoryId === 'cat_coconut_sale' || !!treeId
        ? 'tree_harvest'
        : categoryId === 'cat_salary'
        ? 'salary'
        : undefined) as any,
      paymentStatus: type === 'expense' && (categoryId === 'cat_farm_labor' || !!workerName) ? paymentStatus : 'paid',
      dueDate: paymentStatus === 'pending' ? dueDate : undefined,
    };

    if (transactionToEdit) {
      await updateTransaction(transactionToEdit.id, payload);
    } else {
      await addTransaction(payload);
    }

    onClose();
  };

  const handleDelete = async () => {
    if (transactionToEdit && confirm('Are you sure you want to delete this record?')) {
      await deleteTransaction(transactionToEdit.id);
      onClose();
    }
  };

  const isLaborCategory = categoryId === 'cat_farm_labor' || !!workerName;

  // Grouped Categories by domain
  const availableCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={transactionToEdit ? t('editTransaction') : t('recordTransaction')}
        subtitle={t('modalSubtitle')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft size={14} />
              <span>{t('expense')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight size={14} />
              <span>{t('income')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'transfer'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight size={14} />
              <span>{t('transfer')}</span>
            </button>
          </div>

          {/* Family Member Attribution */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>👨‍👩‍👧‍👦</span>
                <span>Family Member / குடும்ப உறுப்பினர்</span>
              </label>
              {memberId && (
                <button
                  type="button"
                  onClick={() => setMemberId('')}
                  className="text-[10px] text-slate-400 hover:text-rose-400 transition font-medium"
                >
                  Clear Selection
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {familyMembers.map(m => {
                const isSelected = memberId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMemberId(isSelected ? '' : m.id)}
                    className={`px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-1 ring-indigo-400'
                        : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border-slate-800'
                    }`}
                  >
                    <span>{m.avatar}</span>
                    <span className="truncate">{settings.language === 'ta' ? m.nameTa.split(' ')[0] : m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('amountHeader')} ({settings.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-lg font-bold text-white placeholder-slate-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Category Selector with "+ New Category" button */}
          {type !== 'transfer' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {t('categoryHeader')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryModal(true)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
                >
                  <Plus size={13} />
                  <span>{t('addNewCategory')}</span>
                </button>
              </div>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
              >
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                    {getCategoryName(cat.id, cat.name)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Livestock Section (If animal feed, vet, milk sale, egg sale, or live animal sale) */}
          {(categoryId.startsWith('cat_animal') || categoryId === 'cat_milk_sale' || categoryId === 'cat_egg_sale') && (
            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5 animate-fadeIn">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <span>🐄</span>
                <span>Livestock Target & Production / கால்நடை & உற்பத்தி</span>
              </label>

              <select
                value={livestockId}
                onChange={e => {
                  const lId = e.target.value;
                  setLivestockId(lId);
                  const selAni = livestock.find(a => a.id === lId);
                  if (selAni && type === 'income') {
                    if (selAni.type === 'cow' && selAni.dailyMilkLiters && selAni.milkRatePerLiter) {
                      setProductionQty(String(selAni.dailyMilkLiters));
                      setProductionRate(String(selAni.milkRatePerLiter));
                      setAmount(String(selAni.dailyMilkLiters * selAni.milkRatePerLiter));
                    } else if ((selAni.type === 'hen' || selAni.type === 'duck') && selAni.dailyEggCount && selAni.eggRatePerPiece) {
                      setProductionQty(String(selAni.dailyEggCount));
                      setProductionRate(String(selAni.eggRatePerPiece));
                      setAmount(String(selAni.dailyEggCount * selAni.eggRatePerPiece));
                    }
                  }
                }}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 focus:outline-none"
              >
                <option value="" className="bg-slate-900 text-slate-400">-- Select Livestock Batch (Sheep, Cow, Hens, Ducks) --</option>
                {livestock.map(ani => (
                  <option key={ani.id} value={ani.id} className="bg-slate-900 text-white">
                    {ani.type === 'cow' ? '🐄' : ani.type === 'sheep' ? '🐑' : ani.type === 'hen' ? '🐔' : ani.type === 'duck' ? '🦆' : '🐾'} {ani.name} ({ani.count} count)
                  </option>
                ))}
              </select>

              {/* Quantity x Unit Rate Calculator */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] text-amber-300/80 mb-1">
                    Qty (Liters / Eggs / Kg / Count)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 12 L, 8 eggs, 1 sheep"
                    value={productionQty}
                    onChange={e => {
                      const q = e.target.value;
                      setProductionQty(q);
                      const rate = parseFloat(productionRate) || 0;
                      if (parseFloat(q) > 0 && rate > 0) {
                        setAmount(String(parseFloat(q) * rate));
                      }
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-amber-300/80 mb-1">
                    Rate per Unit (₹/L or ₹/egg or ₹/animal)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 38, 6, 6000"
                    value={productionRate}
                    onChange={e => {
                      const r = e.target.value;
                      setProductionRate(r);
                      const qty = parseFloat(productionQty) || 0;
                      if (qty > 0 && parseFloat(r) > 0) {
                        setAmount(String(qty * parseFloat(r)));
                      }
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white focus:outline-none font-bold text-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Field / Plot Selector (Crucial for 1/2 Acre, Coconut Grove, etc.) */}
          {type !== 'transfer' && (
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Sprout size={14} />
                  <span>{t('linkedField')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewFieldModal(true)}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
                >
                  <Plus size={13} />
                  <span>{t('addNewField')}</span>
                </button>
              </div>

              <select
                value={fieldId}
                onChange={e => {
                  const selectedId = e.target.value;
                  setFieldId(selectedId);
                  const selectedFld = fields.find(f => f.id === selectedId);
                  if (selectedFld && (!transactionCrop || transactionCrop === '')) {
                    setTransactionCrop(selectedFld.cropType || '');
                  }
                }}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 focus:outline-none"
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  -- {t('selectField')} (e.g. 1/2 Acre North Field) --
                </option>
                {fields.map(fld => (
                  <option key={fld.id} value={fld.id} className="bg-slate-900 text-white">
                    🌱 {fld.name} ({fld.areaAcre} Ac{fld.cropType ? ` - ${fld.cropType}` : ''})
                  </option>
                ))}
              </select>

              {/* Linked Trees on this field (e.g. Border Coconut Trees) */}
              {(() => {
                const selectedFld = fields.find(f => f.id === fieldId);
                const fieldTrees = selectedFld?.trees || [];
                if (fieldTrees.length === 0) return null;
                return (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 animate-fadeIn">
                    <label className="text-[11px] font-semibold text-teal-300 flex items-center gap-1">
                      <span>🌴</span>
                      <span>Boundary / Field Tree (e.g. Coconut Tree)</span>
                    </label>
                    <select
                      value={treeId}
                      onChange={e => {
                        const tId = e.target.value;
                        setTreeId(tId);
                        const selTree = fieldTrees.find(t => t.id === tId);
                        if (selTree) {
                          if (type === 'income' && selTree.ratePerUnit && selTree.averageYieldPerHarvest) {
                            setProductionQty(String(selTree.averageYieldPerHarvest));
                            setProductionRate(String(selTree.ratePerUnit));
                            setAmount(String(selTree.averageYieldPerHarvest * selTree.ratePerUnit));
                            if (!description) setDescription(`Coconut Harvest (${selTree.averageYieldPerHarvest} nuts @ ₹${selTree.ratePerUnit})`);
                          }
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">-- None / Inner Crop Only --</option>
                      {fieldTrees.map(t => (
                        <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                          🥥 {t.treeType} ({t.count} trees on {t.location || 'boundary'})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              {fieldId && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-emerald-300">
                      {t('transactionCrop')}
                    </label>
                    {(() => {
                      const sel = fields.find(f => f.id === fieldId);
                      return sel?.cropType ? (
                        <span className="text-[10px] text-slate-400">
                          Plot Active: <span className="text-emerald-400 font-medium">{sel.cropType}</span>
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <input
                    type="text"
                    placeholder={t('cropTypePlaceholder')}
                    value={transactionCrop}
                    onChange={e => setTransactionCrop(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {POPULAR_CROPS.map(c => {
                      const label = `${c.name} / ${c.nameTa}`;
                      const isSel = transactionCrop === label;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setTransactionCrop(label)}
                          className={`px-2 py-0.5 rounded-md text-[10px] transition border ${
                            isSel
                              ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-emerald-300 border-slate-800'
                          }`}
                        >
                          {c.nameTa}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Farm Labor & Worker Wages Section (If Labor or Worker selected) */}
          {(isLaborCategory || type === 'expense') && (
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Users size={14} />
                  <span>{t('workersTitle')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewWorkerModal(true)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
                >
                  <Plus size={13} />
                  <span>{t('addNewWorker')}</span>
                </button>
              </div>

              {/* Row 1: Worker Name & Work Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{t('workerName')}</label>
                  <select
                    value={workerName}
                    onChange={e => handleWorkerSelect(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl glass-input text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">-- {t('selectWorker')} --</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.name} className="bg-slate-900 text-white">
                        👤 {w.name} {w.phone ? `(${w.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-indigo-300 font-semibold mb-1">
                    {t('workType')} (Sets Wage)
                  </label>
                  <select
                    value={
                      DEFAULT_WORK_TYPES.find(
                        wt => (settings.language === 'ta' ? wt.nameTa : wt.name) === workType
                      )?.id || ''
                    }
                    onChange={e => handleWorkTypeSelect(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl glass-input text-xs text-slate-200 focus:outline-none font-medium"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">-- {t('selectWorkType')} --</option>
                    {DEFAULT_WORK_TYPES.map(wt => (
                      <option key={wt.id} value={wt.id} className="bg-slate-900 text-white">
                        {settings.language === 'ta' ? wt.nameTa : wt.name} • ₹{wt.defaultWage}/day
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Work Type preset buttons */}
              <div>
                <p className="text-[10px] text-slate-500 mb-1 font-medium">Quick Work Type & Wage Selection:</p>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_WORK_TYPES.map(wt => {
                    const label = settings.language === 'ta' ? wt.nameTa : wt.name;
                    const isSelected = workType === label;
                    return (
                      <button
                        key={wt.id}
                        type="button"
                        onClick={() => handleWorkTypeSelect(wt.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        <span>{settings.language === 'ta' ? wt.nameTa.split(' ')[0] : wt.name.split(' ')[0]}</span>
                        <span className="text-[9px] text-emerald-400 font-mono font-bold">₹{wt.defaultWage}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Labor Count & Wage Rate Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{t('laborCount')}</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="e.g. 1, 2, 4 (people / days)"
                    value={workerCount}
                    onChange={e => handleWorkerCountChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{t('wageRate')}</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 350, 500, 700"
                    value={wageRate}
                    onChange={e => handleWageRateChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white focus:outline-none font-bold text-emerald-400"
                  />
                </div>
              </div>

              {/* Auto calculated total amount summary */}
              {workerCount && wageRate && (
                <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
                  <span className="text-slate-300 text-[11px]">
                    {workerCount} {parseFloat(workerCount) === 1 ? 'person/day' : 'people/days'} × ₹{wageRate}
                  </span>
                  <span className="font-extrabold text-emerald-400">
                    Total Wage: ₹{(parseFloat(workerCount) * parseFloat(wageRate)).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Payment Status: Paid Immediately vs Pending (Pay Later) */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{t('paymentStatus')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentStatus('paid')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                        paymentStatus === 'paid'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      <span>{t('statusPaid')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentStatus('pending')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                        paymentStatus === 'pending'
                          ? 'bg-amber-600 text-white shadow-sm animate-pulse'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      <Clock size={13} />
                      <span>{t('statusPending')}</span>
                    </button>
                  </div>
                </div>

                {paymentStatus === 'pending' && (
                  <div>
                    <label className="block text-[11px] text-amber-300 font-semibold mb-1">
                      {t('promisedDate')} (Due Date)
                    </label>
                    <input
                      type="date"
                      required={paymentStatus === 'pending'}
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-amber-200 border-amber-500/50 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {type === 'transfer' ? t('fromAccount') : t('accountHeader')}
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                    {acc.name} ({settings.currencySymbol}{acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('toAccount')}
                </label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
                >
                  {accounts
                    .filter(acc => acc.id !== accountId)
                    .map(acc => (
                      <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                        {acc.name} ({settings.currencySymbol}{acc.balance.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('paymentMode')}
                </label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value as PaymentMode)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
                >
                  {PAYMENT_MODES.map(pm => (
                    <option key={pm.id} value={pm.id} className="bg-slate-900 text-white">
                      {getPaymentModeLabel(pm.id, pm.label)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('dateHeader')}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('descriptionPayee')}
              </label>
              <input
                type="text"
                placeholder={t('descPlaceholder')}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Tags input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {t('tagsOptional')}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder={t('tagPlaceholder')}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs text-slate-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                {t('addTag')}
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {transactionToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
              >
                <Trash2 size={14} />
                <span>{t('delete')}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-glow transition"
              >
                {transactionToEdit ? t('saveChanges') : t('recordTransaction')}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* SUB-MODAL 1: ADD NEW CATEGORY ON THE FLY */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-white text-sm">{t('addNewCategory')}</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">{t('categoryName')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drip Irrigation, Goat Feed"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">{t('categoryDomain')}</label>
                <select
                  value={newCatDomain}
                  onChange={e => setNewCatDomain(e.target.value as CategoryDomain)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 focus:outline-none"
                >
                  <option value="farm" className="bg-slate-900">{t('domainFarm')}</option>
                  <option value="livestock" className="bg-slate-900">{t('domainLivestock')}</option>
                  <option value="medical" className="bg-slate-900">{t('domainMedical')}</option>
                  <option value="utility" className="bg-slate-900">{t('domainUtility')}</option>
                  <option value="household" className="bg-slate-900">{t('domainHousehold')}</option>
                  <option value="income" className="bg-slate-900">{t('domainIncome')}</option>
                  <option value="other" className="bg-slate-900">{t('domainOther')}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCategoryModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: ADD NEW FIELD PLOT ON THE FLY */}
      {showNewFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-md w-full space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 text-emerald-400">
              <Sprout size={16} />
              <span>{t('addNewField')}</span>
            </h3>

            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300 leading-relaxed">
              {t('cropRotationNote')}
            </div>

            <form onSubmit={handleCreateField} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">{t('fieldName')} *</label>
                <input
                  type="text"
                  required
                  placeholder={t('fieldNamePlaceholder')}
                  value={newFieldName}
                  onChange={e => setNewFieldName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t('fieldAreaAcre')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0.5 or 1/2"
                    value={newFieldArea}
                    onChange={e => setNewFieldArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">{t('cropType')}</label>
                  <input
                    type="text"
                    placeholder={t('cropTypePlaceholder')}
                    value={newFieldCrop}
                    onChange={e => setNewFieldCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  {t('popularCrops')} (Quick Select)
                </label>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {POPULAR_CROPS.map(c => {
                    const label = `${c.name} / ${c.nameTa}`;
                    const isSelected = newFieldCrop === label;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewFieldCrop(label)}
                        className={`px-2 py-0.5 rounded-md text-[10px] transition border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {c.nameTa} ({c.name.split('/')[0].trim()})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFieldModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Save Field Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: ADD NEW WORKER ON THE FLY */}
      {showNewWorkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 text-indigo-300">
              <Users size={16} />
              <span>{t('addNewWorker')}</span>
            </h3>
            <form onSubmit={handleCreateWorker} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('workerName')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Murugan, Lakshmi, Velusamy"
                  value={newWorkerName}
                  onChange={e => setNewWorkerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('workerPhone')}</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={newWorkerPhone}
                  onChange={e => setNewWorkerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300 leading-relaxed">
                💡 <span className="font-semibold">{t('workTypeRatesInfo')}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewWorkerModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Save Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
