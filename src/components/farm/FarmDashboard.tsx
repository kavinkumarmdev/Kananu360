import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Sprout,
  Users,
  Clock,
  Plus,
  TrendingUp,
  Phone,
  Trash2,
  Edit2,
  Milk,
  History,
  TreePine,
  Trees,
  Axe,
  Wheat,
  X,
  Briefcase,
  Egg,
  Calculator,
  Layers,
  ShoppingBag,
  CircleDollarSign,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  POPULAR_CROPS,
  POPULAR_TREES,
  type LivestockType,
  type FieldTreeItem,
  type FieldCropItem,
  type FarmLivestock,
  type FarmField,
} from '../../types/finance';
import { DatePicker } from '../common/DatePicker';
import { SearchableSelect } from '../common/SearchableSelect';

export const FarmDashboard: React.FC = () => {
  const {
    fields,
    workers,
    livestock,
    transactions,
    familyMembers,
    treeHarvests,
    addField,
    updateField,
    deleteField,
    addTreeToField,
    removeTreeFromField,
    startNewCropCycle,
    harvestCropFromField,
    recordTreeHarvest,
    completeCropCycle,
    addWorker,
    deleteWorker,
    addLivestock,
    deleteLivestock,
    addTransaction,
    settleLaborWage,
    totalFarmExpense,
    totalCropIncome,
    totalTreeHarvestIncome,
    totalAnimalCount,
    totalDailyMilkLiters,
    pendingWageTransactions,
    accounts,
    settings,
    t,
  } = useFinance();

  // ==========================================
  // FIELD MODAL STATE (ADD / EDIT)
  // ==========================================
  const [showFieldModal, setShowFieldModal] = useState<boolean>(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldName, setFieldName] = useState<string>('');
  const [fieldArea, setFieldArea] = useState<string>('0.5');
  const [fieldSizeUnit, setFieldSizeUnit] = useState<'acres' | 'cents' | 'hectares' | 'sqft'>('acres');
  const [fieldNotes, setFieldNotes] = useState<string>('');

  // Crop & Tree Options for SearchableSelect
  const cropSelectOptions = useMemo(() => {
    return POPULAR_CROPS.map(c => ({
      id: `${c.name} / ${c.nameTa}`,
      value: `${c.name} / ${c.nameTa}`,
      label: `${c.nameTa} (${c.name})`,
      icon: '🌾',
    }));
  }, []);

  const treeSelectOptions = useMemo(() => {
    return POPULAR_TREES.map(t => ({
      id: `${t.name} / ${t.nameTa}`,
      value: `${t.name} / ${t.nameTa}`,
      label: `${t.nameTa} (${t.name})`,
      icon: t.icon || '🌳',
    }));
  }, []);

  // Trees in Field
  interface TempTree {
    id: string;
    treeType: string;
    count: number;
    plantedDate?: string;
    variety?: string;
  }
  const [tempTrees, setTempTrees] = useState<TempTree[]>([
    {
      id: 'init_tree_coco',
      treeType: 'Coconut Tree / தென்னை மரம்',
      count: 20,
      plantedDate: '2020-01-01',
      variety: 'Boundary Border Coconut (வரப்பு தென்னை)',
    },
  ]);
  const [newTreeType, setNewTreeType] = useState<string>('Coconut Tree / தென்னை மரம்');
  const [newTreeCount, setNewTreeCount] = useState<string>('20');
  const [newTreePlantedDate, setNewTreePlantedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTreeVariety, setNewTreeVariety] = useState<string>('');

  // Crops in Field
  interface TempCrop {
    id: string;
    cropType: string;
    isPrimary: boolean;
    startDate?: string;
    variety?: string;
    plantCount?: number;
    intercropType?: string;
  }
  const [tempCrops, setTempCrops] = useState<TempCrop[]>([
    {
      id: 'init_crp_1',
      cropType: 'Turmeric (Erode Local / BSR) / மஞ்சள்',
      isPrimary: true,
      startDate: new Date().toISOString().split('T')[0],
      variety: 'Erode Local Yellow',
      plantCount: 500,
    },
  ]);
  const [newCropType, setNewCropType] = useState<string>('Small Onion / Shallots / சின்ன வெங்காயம்');
  const [newCropIsPrimary, setNewCropIsPrimary] = useState<boolean>(false);
  const [newCropStartDate, setNewCropStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newCropVariety, setNewCropVariety] = useState<string>('');
  const [newCropPlantCount, setNewCropPlantCount] = useState<string>('');

  // ==========================================
  // QUICK TREE HARVEST MODAL (e.g. 100 Coconuts @ ₹20)
  // ==========================================
  const [treeHarvestFieldId, setTreeHarvestFieldId] = useState<string | null>(null);
  const [treeHarvestTreeId, setTreeHarvestTreeId] = useState<string>('');
  const [harvestNutsCount, setHarvestNutsCount] = useState<string>('100');
  const [harvestNutsRate, setHarvestNutsRate] = useState<string>('20');
  const [harvestClimberCoolie, setHarvestClimberCoolie] = useState<string>('300');
  const [treeHarvestDate, setTreeHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [treeHarvestNotes, setTreeHarvestNotes] = useState<string>('Direct farm gate wholesale trader sale');

  // ==========================================
  // CROP CYCLE CLOSE & P&L MODAL (e.g. Red Banana / Turmeric)
  // ==========================================
  const [cropCyclePLFieldId, setCropCyclePLFieldId] = useState<string | null>(null);
  const [cropCyclePLCropId, setCropCyclePLCropId] = useState<string>('');
  const [cycleEndDate, setCycleEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [cycleHarvestYield, setCycleHarvestYield] = useState<string>('300 Bunches / தார்');
  const [cycleHarvestIncome, setCycleHarvestIncome] = useState<string>('90000');
  const [cycleNotes, setCycleNotes] = useState<string>('Cultivation cycle complete. High quality yield.');

  // ==========================================
  // START NEW CROP SEASON / ROTATION MODAL
  // ==========================================
  const [startCycleFieldId, setStartCycleFieldId] = useState<string | null>(null);
  const [newSeasonPrimaryCrop, setNewSeasonPrimaryCrop] = useState<string>('Turmeric / மஞ்சள் (Turmeric)');
  const [newSeasonPrimaryCount, setNewSeasonPrimaryCount] = useState<string>('500');
  const [newSeasonPrimaryVariety, setNewSeasonPrimaryVariety] = useState<string>('Erode Yellow');
  const [hasIntercrop, setHasIntercrop] = useState<boolean>(true);
  const [newSeasonIntercrop, setNewSeasonIntercrop] = useState<string>('Small Onion / Shallot / சின்ன வெங்காயம் (Small Onion)');
  const [newSeasonIntercropCount, setNewSeasonIntercropCount] = useState<string>('2000');
  const [newSeasonStartDate, setNewSeasonStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // ==========================================
  // REMOVE / CUT TREE MODAL STATE
  // ==========================================
  const [removingTreeFieldId, setRemovingTreeFieldId] = useState<string | null>(null);
  const [selectedTreeId, setSelectedTreeId] = useState<string>('');
  const [treeCutCount, setTreeCutCount] = useState<string>('1');
  const [treeCutDate, setTreeCutDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [treeCutReason, setTreeCutReason] = useState<string>('Cut down for timber / wood sale');
  const [treeCutIncome, setTreeCutIncome] = useState<string>('');
  const [treeCutNotes, setTreeCutNotes] = useState<string>('');

  // ==========================================
  // HARVEST / REMOVE CROP MODAL STATE (Standard)
  // ==========================================
  const [harvestingFieldId, setHarvestingFieldId] = useState<string | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [cropHarvestDate, setCropHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [cropHarvestYield, setCropHarvestYield] = useState<string>('');
  const [cropHarvestIncome, setCropHarvestIncome] = useState<string>('');
  const [cropHarvestReason, setCropHarvestReason] = useState<string>('Harvest completed / அறுவடை முடிந்தது');
  const [cropHarvestNotes, setCropHarvestNotes] = useState<string>('');

  // ==========================================
  // QUICK ADD TREE MODAL
  // ==========================================
  const [quickAddTreeFieldId, setQuickAddTreeFieldId] = useState<string | null>(null);
  const [quickTreeType, setQuickTreeType] = useState<string>('Coconut Tree / தென்னை மரம் (Coconut)');
  const [quickTreeCount, setQuickTreeCount] = useState<string>('20');
  const [quickTreePlantedDate, setQuickTreePlantedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quickTreeVariety, setQuickTreeVariety] = useState<string>('Boundary Border (வரப்பு தென்னை)');

  // ==========================================
  // FIELD HISTORY MODAL STATE
  // ==========================================
  const [historyFieldId, setHistoryFieldId] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<'crops' | 'trees' | 'tree_harvests'>('crops');

  // ==========================================
  // WORKER & LIVESTOCK MODAL STATES
  // ==========================================
  const [showWorkerModal, setShowWorkerModal] = useState<boolean>(false);
  const [workerName, setWorkerName] = useState<string>('');
  const [workerPhone, setWorkerPhone] = useState<string>('');
  const [workerRole, setWorkerRole] = useState<string>('');

  const [showLivestockModal, setShowLivestockModal] = useState<boolean>(false);
  const [animalName, setAnimalName] = useState<string>('');
  const [animalType, setAnimalType] = useState<LivestockType>('sheep');
  const [animalCount, setAnimalCount] = useState<string>('4');
  const [tagNumber, setTagNumber] = useState<string>('');
  const [dailyMilkLiters, setDailyMilkLiters] = useState<string>('');
  const [milkRatePerLiter, setMilkRatePerLiter] = useState<string>('38');
  const [dailyEggCount, setDailyEggCount] = useState<string>('');
  const [eggRatePerPiece, setEggRatePerPiece] = useState<string>('12');
  const [purchaseCost, setPurchaseCost] = useState<string>('');
  const [livestockNotes, setLivestockNotes] = useState<string>('');

  // Quick Livestock Action Modal (Milk Sale / Egg Sale / Live Sale / Feed)
  const [activeLivestockAction, setActiveLivestockAction] = useState<{
    animal: FarmLivestock;
    actionType: 'milk_sale' | 'egg_sale' | 'live_sale' | 'feed_expense';
  } | null>(null);
  const [actionQuantity, setActionQuantity] = useState<string>('10');
  const [actionRate, setActionRate] = useState<string>('38');
  const [actionNotes, setActionNotes] = useState<string>('');

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleAddTempTree = () => {
    if (!newTreeType.trim()) return;
    const count = parseInt(newTreeCount, 10) || 1;
    setTempTrees(prev => [
      ...prev,
      {
        id: `tree_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        treeType: newTreeType.trim(),
        count,
        plantedDate: newTreePlantedDate,
        variety: newTreeVariety.trim() || undefined,
      },
    ]);
    setNewTreeVariety('');
  };

  const handleRemoveTempTree = (id: string) => {
    setTempTrees(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTempCrop = () => {
    if (!newCropType.trim()) return;
    let updated = [...tempCrops];
    if (newCropIsPrimary) {
      updated = updated.map(c => ({ ...c, isPrimary: false }));
    }
    updated.push({
      id: `crp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      cropType: newCropType.trim(),
      isPrimary: newCropIsPrimary || updated.length === 0,
      startDate: newCropStartDate,
      variety: newCropVariety.trim() || undefined,
      plantCount: newCropPlantCount ? parseInt(newCropPlantCount, 10) : undefined,
    });
    setTempCrops(updated);
    setNewCropVariety('');
    setNewCropPlantCount('');
    setNewCropIsPrimary(false);
  };

  const handleRemoveTempCrop = (id: string) => {
    setTempCrops(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (remaining.length > 0 && !remaining.some(c => c.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  const handleOpenAddField = () => {
    setEditingFieldId(null);
    setFieldName('');
    setFieldArea('0.5');
    setFieldSizeUnit('acres');
    setFieldNotes('');
    setTempTrees([
      {
        id: 'init_tree_coco',
        treeType: 'Coconut Tree / தென்னை மரம்',
        count: 20,
        plantedDate: '2020-01-01',
        variety: 'Boundary Border Coconut (வரப்பு தென்னை)',
      },
    ]);
    setTempCrops([
      {
        id: 'init_crp_1',
        cropType: 'Turmeric (Erode Local / BSR) / மஞ்சள்',
        isPrimary: true,
        startDate: new Date().toISOString().split('T')[0],
        variety: 'Erode Local Yellow',
        plantCount: 500,
      },
    ]);
    setShowFieldModal(true);
  };

  const handleOpenEditField = (fld: FarmField) => {
    setEditingFieldId(fld.id);
    setFieldName(fld.name);
    setFieldArea(String(fld.areaAcre));
    setFieldSizeUnit(fld.sizeUnit || 'acres');
    setFieldNotes(fld.notes || '');
    setTempTrees(
      fld.trees && fld.trees.length > 0
        ? fld.trees.map(t => ({
            id: t.id,
            treeType: t.treeType,
            count: t.count,
            plantedDate: t.plantedDate,
            variety: t.variety,
          }))
        : []
    );
    setTempCrops(
      fld.crops && fld.crops.length > 0
        ? fld.crops.map(c => ({
            id: c.id,
            cropType: c.cropType,
            isPrimary: c.isPrimary,
            startDate: c.startDate,
            variety: c.variety,
            plantCount: c.plantCount,
            intercropType: c.intercropType,
          }))
        : fld.cropType
        ? [
            {
              id: 'crp_edit_existing',
              cropType: fld.cropType,
              isPrimary: true,
              startDate: new Date().toISOString().split('T')[0],
            },
          ]
        : []
    );
    setShowFieldModal(true);
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    const finalCrops = tempCrops.map((c, idx) => ({
      id: c.id || `crp_${Date.now()}_${idx}`,
      cropType: c.cropType,
      isPrimary: idx === 0 && !tempCrops.some(x => x.isPrimary) ? true : c.isPrimary,
      startDate: c.startDate,
      variety: c.variety,
      plantCount: c.plantCount,
    }));

    const finalTrees = tempTrees.map((t, idx) => ({
      id: t.id || `tree_${Date.now()}_${idx}`,
      treeType: t.treeType,
      count: t.count,
      plantedDate: t.plantedDate,
      variety: t.variety,
    }));

    if (editingFieldId) {
      await updateField(editingFieldId, {
        name: fieldName.trim(),
        areaAcre: fieldArea,
        sizeUnit: fieldSizeUnit,
        notes: fieldNotes.trim() || undefined,
        trees: finalTrees,
        crops: finalCrops,
      });
    } else {
      await addField({
        name: fieldName.trim(),
        areaAcre: fieldArea,
        sizeUnit: fieldSizeUnit,
        color: '#10B981',
        notes: fieldNotes.trim() || undefined,
        trees: finalTrees,
        crops: finalCrops,
      });
    }

    setEditingFieldId(null);
    setFieldName('');
    setFieldArea('0.5');
    setFieldSizeUnit('acres');
    setFieldNotes('');
    setTempTrees([]);
    setTempCrops([]);
    setShowFieldModal(false);
  };

  // Tree Harvest Submission (e.g. 100 coconuts @ ₹20)
  const handleRecordTreeHarvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treeHarvestFieldId || !treeHarvestTreeId) return;

    const qty = parseInt(harvestNutsCount, 10) || 0;
    const rate = parseFloat(harvestNutsRate) || 0;
    const coolie = parseFloat(harvestClimberCoolie) || 0;
    const totalGross = qty * rate;

    const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];

    await recordTreeHarvest(treeHarvestFieldId, treeHarvestTreeId, {
      treeType: 'Coconut Tree / தென்னை மரம் (Coconut)',
      date: treeHarvestDate,
      quantityHarvested: qty,
      unit: 'Nuts',
      ratePerUnit: rate,
      totalIncome: totalGross,
      laborExpense: coolie,
      accountId: defaultAcc?.id || 'acc_cash',
      notes: treeHarvestNotes.trim() || undefined,
    });

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {}

    setTreeHarvestFieldId(null);
    setTreeHarvestTreeId('');
    setHarvestNutsCount('100');
    setHarvestNutsRate('20');
    setHarvestClimberCoolie('300');
  };

  // Crop Cycle Close & Full P&L Submission
  const handleCompleteCropCycleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropCyclePLFieldId || !cropCyclePLCropId) return;

    const income = parseFloat(cycleHarvestIncome) || 0;

    await completeCropCycle(cropCyclePLFieldId, cropCyclePLCropId, {
      endDate: cycleEndDate,
      harvestYield: cycleHarvestYield.trim() || undefined,
      harvestIncome: income > 0 ? income : undefined,
      notes: cycleNotes.trim() || undefined,
      reason: 'Harvest completed & season closed / அறுவடை முடிந்தது',
    });

    try {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } catch {}

    setCropCyclePLFieldId(null);
    setCropCyclePLCropId('');
    setCycleHarvestYield('');
    setCycleHarvestIncome('');
    setCycleNotes('');
  };

  // Start New Crop Season / Intercrop Cycle (Properly updates active primary crop and archives previous)
  const handleStartNewSeasonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startCycleFieldId || !newSeasonPrimaryCrop.trim()) return;

    const primaryCrop = {
      cropType: newSeasonPrimaryCrop.trim(),
      isPrimary: true,
      startDate: newSeasonStartDate,
      variety: newSeasonPrimaryVariety.trim() || undefined,
      plantCount: newSeasonPrimaryCount ? parseInt(newSeasonPrimaryCount, 10) : undefined,
    };

    const intercrop = hasIntercrop && newSeasonIntercrop.trim() ? {
      cropType: newSeasonIntercrop.trim(),
      isPrimary: false,
      startDate: newSeasonStartDate,
      plantCount: newSeasonIntercropCount ? parseInt(newSeasonIntercropCount, 10) : undefined,
      intercropType: 'Parallel Intercrop (ஊடுபயிர்)',
    } : undefined;

    await startNewCropCycle(startCycleFieldId, primaryCrop, intercrop, true);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setStartCycleFieldId(null);
    setNewSeasonPrimaryVariety('');
    setNewSeasonPrimaryCount('');
    setNewSeasonIntercropCount('');
  };

  const handleConfirmRemoveTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removingTreeFieldId || !selectedTreeId) return;
    const count = parseInt(treeCutCount, 10) || 1;
    const income = treeCutIncome ? parseFloat(treeCutIncome) : undefined;

    await removeTreeFromField(
      removingTreeFieldId,
      selectedTreeId,
      count,
      treeCutReason,
      treeCutDate,
      income,
      treeCutNotes
    );

    setRemovingTreeFieldId(null);
    setSelectedTreeId('');
    setTreeCutCount('1');
    setTreeCutIncome('');
    setTreeCutNotes('');
  };

  const handleConfirmHarvestCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvestingFieldId || !selectedCropId) return;
    const income = cropHarvestIncome ? parseFloat(cropHarvestIncome) : undefined;

    await harvestCropFromField(
      harvestingFieldId,
      selectedCropId,
      cropHarvestDate,
      cropHarvestYield,
      income,
      cropHarvestReason,
      cropHarvestNotes
    );

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setHarvestingFieldId(null);
    setSelectedCropId('');
    setCropHarvestYield('');
    setCropHarvestIncome('');
    setCropHarvestNotes('');
  };

  const handleQuickAddTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTreeFieldId || !quickTreeType.trim()) return;
    const count = parseInt(quickTreeCount, 10) || 1;

    await addTreeToField(quickAddTreeFieldId, {
      treeType: quickTreeType.trim(),
      count,
      plantedDate: quickTreePlantedDate,
      variety: quickTreeVariety.trim() || undefined,
    });

    setQuickAddTreeFieldId(null);
    setQuickTreeVariety('');
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName.trim()) return;
    await addWorker({
      name: workerName.trim(),
      phone: workerPhone.trim() || undefined,
      role: workerRole.trim() || undefined,
    });
    setWorkerName('');
    setWorkerPhone('');
    setWorkerRole('');
    setShowWorkerModal(false);
  };

  const handleCreateLivestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalName.trim()) return;
    await addLivestock({
      name: animalName.trim(),
      type: animalType,
      count: parseInt(animalCount, 10) || 1,
      tagNumber: tagNumber.trim() || undefined,
      dailyMilkLiters: (animalType === 'cow' || animalType === 'buffalo') && dailyMilkLiters ? parseFloat(dailyMilkLiters) : undefined,
      milkRatePerLiter: (animalType === 'cow' || animalType === 'buffalo') && milkRatePerLiter ? parseFloat(milkRatePerLiter) : undefined,
      dailyEggCount: (animalType === 'hen' || animalType === 'duck' || animalType === 'poultry') && dailyEggCount ? parseInt(dailyEggCount, 10) : undefined,
      eggRatePerPiece: (animalType === 'hen' || animalType === 'duck' || animalType === 'poultry') && eggRatePerPiece ? parseFloat(eggRatePerPiece) : undefined,
      purchaseCost: purchaseCost ? parseFloat(purchaseCost) : undefined,
      notes: livestockNotes.trim() || undefined,
    });
    setAnimalName('');
    setAnimalCount('1');
    setTagNumber('');
    setDailyMilkLiters('');
    setDailyEggCount('');
    setPurchaseCost('');
    setLivestockNotes('');
    setShowLivestockModal(false);
  };

  const handleLivestockActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLivestockAction) return;

    const { animal, actionType } = activeLivestockAction;
    const qty = parseFloat(actionQuantity) || 0;
    const rate = parseFloat(actionRate) || 0;
    const total = qty * rate;
    const today = new Date().toISOString().split('T')[0];
    const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];

    if (actionType === 'milk_sale') {
      await addTransaction({
        date: today,
        type: 'income',
        amount: total,
        category: 'cat_milk_sale',
        accountId: defaultAcc?.id || 'acc_cash',
        description: `Dairy Milk Sale: ${qty} Liters @ ₹${rate}/L from ${animal.name}`,
        paymentMode: 'cash',
        livestockId: animal.id,
        livestockName: animal.name,
        productionType: 'milk',
        productionQuantity: qty,
        productionUnitRate: rate,
        tags: ['dairy', 'milk_sale'],
      });
    } else if (actionType === 'egg_sale') {
      await addTransaction({
        date: today,
        type: 'income',
        amount: total,
        category: 'cat_egg_sale',
        accountId: defaultAcc?.id || 'acc_cash',
        description: `Egg Sale: ${qty} Eggs @ ₹${rate}/egg from ${animal.name}`,
        paymentMode: 'cash',
        livestockId: animal.id,
        livestockName: animal.name,
        productionType: 'egg',
        productionQuantity: qty,
        productionUnitRate: rate,
        tags: ['poultry', 'eggs'],
      });
    } else if (actionType === 'live_sale') {
      await addTransaction({
        date: today,
        type: 'income',
        amount: total,
        category: 'cat_livestock_sale',
        accountId: defaultAcc?.id || 'acc_cash',
        description: `Livestock Sale: ${qty} head(s) (${animal.name}) @ ₹${rate}/head`,
        paymentMode: 'cash',
        livestockId: animal.id,
        livestockName: animal.name,
        productionType: 'live_animal',
        productionQuantity: qty,
        productionUnitRate: rate,
        tags: ['livestock_sale', animal.type],
      });
    } else if (actionType === 'feed_expense') {
      await addTransaction({
        date: today,
        type: 'expense',
        amount: total,
        category: 'cat_livestock_feed',
        accountId: defaultAcc?.id || 'acc_cash',
        description: `Animal Feed / Fodder for ${animal.name} (${actionNotes || 'Green grass, cattle feed, grains'})`,
        paymentMode: 'cash',
        livestockId: animal.id,
        livestockName: animal.name,
        targetType: 'animal_feed',
        tags: ['feed', 'animal_maintenance'],
      });
    }

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setActiveLivestockAction(null);
    setActionNotes('');
  };

  const handleSettleWageWithCelebration = (id: string) => {
    settleLaborWage(id);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
  };

  // Compute spend per field plot
  const fieldSpendMap = useMemo(() => {
    const map: Record<string, number> = {};
    fields.forEach(f => {
      map[f.id] = 0;
    });
    transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.fieldId && map[tx.fieldId] !== undefined) {
        map[tx.fieldId] += Number(tx.amount || 0);
      }
    });
    return map;
  }, [fields, transactions]);

  // Compute total wages per worker
  const workerWagesMap = useMemo(() => {
    const map: Record<string, { totalPaid: number; pending: number }> = {};
    workers.forEach(w => {
      map[w.name] = { totalPaid: 0, pending: 0 };
    });
    transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.workerName) {
        if (!map[tx.workerName]) {
          map[tx.workerName] = { totalPaid: 0, pending: 0 };
        }
        if (tx.paymentStatus === 'pending') {
          map[tx.workerName].pending += Number(tx.amount || 0);
        } else {
          map[tx.workerName].totalPaid += Number(tx.amount || 0);
        }
      }
    });
    return map;
  }, [workers, transactions]);

  // Total Land Area calculation
  const totalLandAcres = useMemo(() => {
    return fields.reduce((sum, f) => {
      const val = parseFloat(String(f.areaAcre)) || 0;
      return sum + val;
    }, 0);
  }, [fields]);

  // Active Field for History Modal
  const activeHistoryField = fields.find(f => f.id === historyFieldId);

  // Field & Crop being closed for P&L
  const activeClosingField = fields.find(f => f.id === cropCyclePLFieldId);
  const activeClosingCrop = activeClosingField?.crops?.find(c => c.id === cropCyclePLCropId);

  // Auto-computed investments for the active closing crop
  const autoCalculatedInvestments = useMemo(() => {
    if (!cropCyclePLFieldId || !activeClosingCrop) {
      return { total: 0, seeds: 0, fertilizer: 0, labor: 0, tractor: 0, count: 0 };
    }

    const startDate = activeClosingCrop.startDate || '1970-01-01';
    const endDate = cycleEndDate || new Date().toISOString().split('T')[0];

    const relatedTx = transactions.filter(t => {
      return (
        t.type === 'expense' &&
        t.fieldId === cropCyclePLFieldId &&
        t.date >= startDate &&
        t.date <= endDate
      );
    });

    let seeds = 0;
    let fertilizer = 0;
    let labor = 0;
    let tractor = 0;

    relatedTx.forEach(t => {
      const desc = (t.description + ' ' + (t.category || '')).toLowerCase();
      if (desc.includes('seed') || desc.includes('sapling') || desc.includes('விதை') || desc.includes('கன்று')) {
        seeds += t.amount;
      } else if (desc.includes('fertilizer') || desc.includes('manure') || desc.includes('உரம்') || desc.includes('சாணம்')) {
        fertilizer += t.amount;
      } else if (desc.includes('tractor') || desc.includes('plough') || desc.includes('உழவு') || desc.includes('டிராக்டர்')) {
        tractor += t.amount;
      } else {
        labor += t.amount;
      }
    });

    const total = seeds + fertilizer + labor + tractor;
    return { total, seeds, fertilizer, labor, tractor, count: relatedTx.length };
  }, [cropCyclePLFieldId, activeClosingCrop, cycleEndDate, transactions]);

  // Estimated Net Profit/Loss for active closing crop
  const cycleNetPL = useMemo(() => {
    const income = parseFloat(cycleHarvestIncome) || 0;
    const invest = autoCalculatedInvestments.total;
    const profit = income - invest;
    const roi = invest > 0 ? ((profit / invest) * 100).toFixed(1) : '100';
    return { profit, roi };
  }, [cycleHarvestIncome, autoCalculatedInvestments]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ========================================================================= */}
      {/* FAMILY MULTI-VENTURE 4-MEMBER ROSTER BANNER */}
      {/* ========================================================================= */}
      <div className="glass-panel rounded-3xl p-5 border border-indigo-900/40 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-xl shadow-glow">
              👨‍👩‍👦‍👦
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>{t('familyRosterTitle')}</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {totalLandAcres > 0 ? `${totalLandAcres.toFixed(1)} ${t('acresUnit')} • ` : ''}{t('familyBadgeCorporate')}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t('familyRosterSubtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-emerald-300">
              {t('totalFarmAreaLabel')} <span className="font-bold text-white">{totalLandAcres.toFixed(1)} {t('acresUnit')}</span>
            </div>
          </div>
        </div>

        {/* 4 Family Member Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {familyMembers.map(member => {
            const isCompany = member.occupation === 'company_job';
            const isFarm = member.occupation === 'agriculture';

            return (
              <div
                key={member.id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-2.5 shadow-md"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{member.avatar}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white leading-tight">
                          {settings.language === 'ta' && member.nameTa ? member.nameTa : member.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {settings.language === 'ta' ? member.name : member.nameTa}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isCompany
                          ? 'bg-blue-950/90 text-blue-300 border border-blue-500/30'
                          : isFarm
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-950/90 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isCompany ? t('familyBadgeCorporate') : isFarm ? t('familyBadgeFarm') : t('familyBadgeDairy')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-medium pt-1">
                    {settings.language === 'ta' && member.occupationTitleTa ? member.occupationTitleTa : member.occupationTitle}
                  </p>
                  <p className="text-[10px] text-slate-400 italic">
                    {settings.language === 'ta' ? member.occupationTitle : member.occupationTitleTa}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Briefcase size={11} className="text-slate-500" />
                    <span>{t('familyRoleLabel')}:</span>
                  </span>
                  <span className="font-semibold text-white">
                    {member.relation === 'self'
                      ? t('roleTechSalary')
                      : member.relation === 'brother'
                      ? t('roleCompanyEarnings')
                      : member.relation === 'father'
                      ? t('roleFieldTreeMaster')
                      : t('roleLivestockMilkCare')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Farm Action Buttons Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Sprout className="text-emerald-400 w-6 h-6" />
            <span>{totalLandAcres > 0 ? `${totalLandAcres.toFixed(1)} ${t('acresUnit')} ` : ''}{t('farmHubTitle')}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {t('farmHubSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenAddField}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-glow-emerald transition cursor-pointer"
          >
            <Plus size={14} />
            <span>{t('addNewField')}</span>
          </button>

          <button
            onClick={() => setShowLivestockModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Milk size={14} />
            <span>{t('addNewLivestock')}</span>
          </button>

          <button
            onClick={() => setShowWorkerModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition cursor-pointer"
          >
            <Plus size={14} />
            <span>{t('addNewWorker')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Farm Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Farm Inputs */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">{t('kpiFarmSpend')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sprout size={16} />
            </div>
          </div>
          <p className="text-xl font-black text-white">
            {formatCurrency(totalFarmExpense, settings.currency)}
          </p>
          <p className="text-[11px] text-slate-400">Fertilizers, labor coolie, tractor & saplings</p>
        </div>

        {/* Tree Harvest Recurring Income */}
        <div className="glass-panel rounded-2xl p-4 border border-amber-900/40 bg-amber-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-semibold">🥥 Tree Harvest Inflow</span>
            <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <TreePine size={16} />
            </div>
          </div>
          <p className="text-xl font-black text-amber-300">
            +{formatCurrency(totalTreeHarvestIncome, settings.currency)}
          </p>
          <p className="text-[11px] text-amber-300/80">
            {treeHarvests.length} Coconut harvest batches (every 3 mos)
          </p>
        </div>

        {/* Daily Milk & Animal Production */}
        <div className="glass-panel rounded-2xl p-4 border border-teal-900/40 bg-teal-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-teal-300 font-semibold">{t('dailyMilkKpi')}</span>
            <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Milk size={16} />
            </div>
          </div>
          <p className="text-xl font-black text-teal-300">
            {totalDailyMilkLiters} L / day
          </p>
          <p className="text-[11px] text-teal-400/90">
            {totalAnimalCount} animals (Cows, Sheep, Hens, Ducks)
          </p>
        </div>

        {/* Harvest & Crop Income */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">{t('kpiCropIncome')}</span>
            <div className="w-8 h-8 rounded-xl bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-400">
            +{formatCurrency(totalCropIncome, settings.currency)}
          </p>
          <p className="text-[11px] text-emerald-400/80">Red Banana, Turmeric & seasonal crops</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: FIELD PLOTS (FRACTIONAL ACREAGES, BORDER TREES & ROTATIONAL CROPS) */}
      {/* ========================================================================= */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sprout className="text-emerald-400 w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold text-white">2-Acre Land Partitioning & Crop Rotation</h3>
              <p className="text-[11px] text-slate-400">
                Fixed boundary trees (Coconut) + Seasonal crop cultivation & multi-cropping (Banana → Turmeric + Onion)
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAddField}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition cursor-pointer"
          >
            <Plus size={13} />
            <span>{t('addNewField')}</span>
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400">
              <Sprout size={24} />
            </div>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">{t('noFieldsYet')}</p>
            <button
              onClick={handleOpenAddField}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              + {t('addNewField')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {fields.map(fld => {
              const spentOnField = fieldSpendMap[fld.id] || 0;

              // Normalize active crops
              const activeCrops: FieldCropItem[] = fld.crops && fld.crops.length > 0
                ? fld.crops
                : fld.cropType
                ? [{ id: 'legacy_primary', cropType: fld.cropType, isPrimary: true }]
                : [];

              const primaryCropObj = activeCrops.find(c => c.isPrimary);
              const secondaryCropsList = activeCrops.filter(c => !c.isPrimary);

              // Normalize active trees
              const activeTrees: FieldTreeItem[] = fld.trees && fld.trees.length > 0
                ? fld.trees
                : fld.hasBoundaryCoconut
                ? [{ id: 'legacy_coco', treeType: 'Coconut Tree (தென்னை)', count: fld.boundaryTreeCount || 20 }]
                : [];

              const totalTreeCount = activeTrees.reduce((sum, t) => sum + (t.count || 0), 0);
              const totalHistoryCount = (fld.cropHistory?.length || 0) + (fld.treeHistory?.length || 0) + (fld.treeHarvests?.length || 0);

              return (
                <div
                  key={fld.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-3 shadow-lg"
                >
                  <div className="space-y-3">
                    {/* Header: Title & Fractional Land Area */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>{fld.name}</span>
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {fld.id}
                        </span>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/40 font-bold shrink-0">
                        {fld.areaAcre} {fld.sizeUnit || 'Acres'}
                      </span>
                    </div>

                    {/* SECTION: ACTIVE CROPS & MULTI-CROPPING */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-950/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Wheat size={12} />
                          <span>Seasonal Crop Cultivation</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setStartCycleFieldId(fld.id);
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30 font-bold transition cursor-pointer"
                            title="Start new seasonal rotation or intercrop"
                          >
                            + New Season Cycle
                          </button>
                        </div>
                      </div>

                      {activeCrops.length === 0 ? (
                        <div className="text-[11px] text-slate-400 italic py-2 text-center bg-slate-900/40 rounded-lg border border-slate-800">
                          <span>Fallow / Ready for next season crop</span>
                          <button
                            onClick={() => setStartCycleFieldId(fld.id)}
                            className="block mx-auto mt-1 text-xs text-emerald-400 font-bold hover:underline cursor-pointer"
                          >
                            🌱 Plant Turmeric / Onion / Banana
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {/* Primary Crop */}
                          {primaryCropObj && (
                            <div className="p-2 rounded-lg bg-emerald-500/15 dark:bg-emerald-950/60 border border-emerald-500/40 space-y-1.5 shadow-sm">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-amber-500 shrink-0" title="Primary Crop">⭐</span>
                                  <span className="font-black text-emerald-900 dark:text-emerald-200 truncate text-sm">
                                    {primaryCropObj.cropType}
                                  </span>
                                </div>
                                {primaryCropObj.plantCount && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-700 dark:bg-emerald-800 text-white border border-emerald-500/40">
                                    {primaryCropObj.plantCount} plants
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                                <span>Planted: {primaryCropObj.startDate || 'Active'}</span>
                                <button
                                  onClick={() => {
                                    setCropCyclePLFieldId(fld.id);
                                    setCropCyclePLCropId(primaryCropObj.id);
                                    setCycleHarvestYield('');
                                    setCycleHarvestIncome('');
                                  }}
                                  className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold transition shadow-sm cursor-pointer"
                                >
                                  🌾 Close Season & View P&L
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Secondary / Intercrops */}
                          {secondaryCropsList.length > 0 && (
                            <div className="space-y-1 pt-1">
                              <span className="text-[9px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                                Parallel Intercrops (ஊடுபயிர்):
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {secondaryCropsList.map(sec => (
                                  <div
                                    key={sec.id}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] bg-teal-500/15 dark:bg-teal-950/80 border border-teal-500/40 text-teal-900 dark:text-teal-200 font-bold shadow-sm"
                                  >
                                    <span>🌱 {sec.cropType}</span>
                                    {sec.plantCount && (
                                      <span className="font-mono text-[9px] text-teal-700 dark:text-teal-300 font-black">
                                        ({sec.plantCount} saplings)
                                      </span>
                                    )}
                                    <button
                                      onClick={() => {
                                        setHarvestingFieldId(fld.id);
                                        setSelectedCropId(sec.id);
                                        setCropHarvestReason('Intercrop season completed');
                                      }}
                                      className="text-amber-600 dark:text-amber-400 hover:underline text-[9px] font-black cursor-pointer"
                                      title="Harvest/Remove this intercrop"
                                    >
                                      [Harvest]
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* SECTION: PERMANENT BORDER TREES (Fixed on Boundary) */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-950/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <Trees size={12} />
                          <span>Permanent Boundary Trees ({totalTreeCount})</span>
                        </span>
                        <button
                          onClick={() => setQuickAddTreeFieldId(fld.id)}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus size={10} />
                          <span>{t('addTree')}</span>
                        </button>
                      </div>

                      {activeTrees.length === 0 ? (
                        <div className="text-[11px] text-slate-500 italic py-1">
                          {t('noTreesOnField')}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {activeTrees.map(tree => {
                            const isCoconut = tree.treeType.toLowerCase().includes('coconut') || tree.treeType.includes('தென்னை');

                            return (
                              <div
                                key={tree.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-amber-500/15 dark:bg-amber-950/40 border border-amber-500/40 text-xs shadow-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{isCoconut ? '🥥' : '🌳'}</span>
                                  <div>
                                    <span className="font-black text-amber-900 dark:text-amber-200 text-sm">{tree.treeType}</span>
                                    <span className="ml-1.5 px-1.5 py-0.2 bg-amber-900/60 rounded text-[10px] font-bold text-amber-300">
                                      {tree.count} trees
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  {isCoconut && (
                                    <button
                                      onClick={() => {
                                        setTreeHarvestFieldId(fld.id);
                                        setTreeHarvestTreeId(tree.id);
                                        setHarvestNutsCount(String(tree.count * 5 || 100));
                                      }}
                                      className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold shadow-sm transition flex items-center gap-1 cursor-pointer"
                                      title="Record 3-month recurring coconut harvest"
                                    >
                                      <span>🥥 Harvest Nuts</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      setRemovingTreeFieldId(fld.id);
                                      setSelectedTreeId(tree.id);
                                      setTreeCutCount('1');
                                      setTreeCutReason('Cut down for timber / wood sale');
                                    }}
                                    className="p-1 text-rose-400 hover:text-white text-[10px] font-bold cursor-pointer"
                                    title="Cut / Remove Tree"
                                  >
                                    <Axe size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Spend & Allocated Investment */}
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Cumulative Inputs Spend:</span>
                      <span className="font-black text-white font-mono">
                        {formatCurrency(spentOnField, settings.currency)}
                      </span>
                    </div>

                    {fld.notes && (
                      <p className="text-[10px] text-slate-400 italic bg-slate-950/30 p-1.5 rounded-lg">
                        {fld.notes}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryFieldId(fld.id);
                        setHistoryTab('crops');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-white bg-slate-950/80 hover:bg-slate-900 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      <History size={12} />
                      <span>{t('fieldHistory')} & P&L Logs</span>
                      {totalHistoryCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px]">
                          {totalHistoryCount}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditField(fld)}
                        className="px-2 py-1 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/30 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                        title="Edit Field Plot Details"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete field "${fld.name}"? This action cannot be undone.`)) {
                            deleteField(fld.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                        title="Delete Field"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: FARM LIVESTOCK, DAIRY & ANIMAL HUSBANDRY */}
      {/* ========================================================================= */}
      <div className="glass-panel rounded-3xl p-5 border border-teal-900/40 bg-slate-900/40 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Milk className="text-teal-400 w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold text-white">Livestock Husbandry (Sheep, Cows, Hens, Ducks)</h3>
              <p className="text-[11px] text-slate-400">
                Managed by Amma & Appa: Daily milk, egg collection, animal growth & live sales
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLivestockModal(true)}
            className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
          >
            <Plus size={13} />
            <span>{t('addNewLivestock')}</span>
          </button>
        </div>

        {livestock.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
            {t('noLivestockYet')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {livestock.map(animal => {
              const isDairy = animal.type === 'cow' || animal.type === 'buffalo';
              const isPoultry = animal.type === 'hen' || animal.type === 'duck' || animal.type === 'poultry';
              const isMeatSheep = animal.type === 'sheep' || animal.type === 'goat';

              const estDailyMilkIncome = isDairy && animal.dailyMilkLiters && animal.milkRatePerLiter
                ? animal.dailyMilkLiters * animal.milkRatePerLiter
                : 0;

              const estDailyEggIncome = isPoultry && animal.dailyEggCount && animal.eggRatePerPiece
                ? animal.dailyEggCount * animal.eggRatePerPiece
                : 0;

              return (
                <div
                  key={animal.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition space-y-2.5 flex flex-col justify-between shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">
                            {animal.type === 'cow'
                              ? '🐄'
                              : animal.type === 'sheep'
                              ? '🐑'
                              : animal.type === 'hen'
                              ? '🐓'
                              : animal.type === 'duck'
                              ? '🦆'
                              : animal.type === 'buffalo'
                              ? '🐃'
                              : animal.type === 'goat'
                              ? '🐐'
                              : '🐾'}
                          </span>
                          <h4 className="font-bold text-sm text-white">{animal.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 capitalize">
                          {animal.type} • {animal.notes || 'Healthy stock'}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
                        {animal.count} {animal.count === 1 ? 'Head' : 'Heads'}
                      </span>
                    </div>

                    {/* Dairy Yield Details */}
                    {isDairy && animal.dailyMilkLiters && (
                      <div className="p-2 rounded-xl bg-teal-950/40 border border-teal-500/20 text-[10px] space-y-1">
                        <div className="flex items-center justify-between text-teal-300 font-bold">
                          <span>🥛 Daily Milk:</span>
                          <span>{animal.dailyMilkLiters} L / day</span>
                        </div>
                        {animal.milkRatePerLiter && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Rate @ ₹{animal.milkRatePerLiter}/L:</span>
                            <span className="text-emerald-400 font-bold">~₹{estDailyMilkIncome}/day</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Poultry / Egg Details */}
                    {isPoultry && animal.dailyEggCount && (
                      <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[10px] space-y-1">
                        <div className="flex items-center justify-between text-amber-300 font-bold">
                          <span>🥚 Daily Eggs:</span>
                          <span>{animal.dailyEggCount} eggs / day</span>
                        </div>
                        {animal.eggRatePerPiece && (
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Rate @ ₹{animal.eggRatePerPiece}/egg:</span>
                            <span className="text-emerald-400 font-bold">~₹{estDailyEggIncome}/day</span>
                          </div>
                        )}
                      </div>
                    )}

                    {animal.purchaseCost && (
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                        <span>Original Investment:</span>
                        <span className="font-semibold text-white">
                          {formatCurrency(animal.purchaseCost, settings.currency)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Livestock Quick Actions */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      {isDairy ? (
                        <button
                          onClick={() => {
                            setActiveLivestockAction({ animal, actionType: 'milk_sale' });
                            setActionQuantity(String(animal.dailyMilkLiters || 10));
                            setActionRate(String(animal.milkRatePerLiter || 38));
                          }}
                          className="px-2 py-1 rounded bg-teal-600/80 hover:bg-teal-500 text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Milk size={11} />
                          <span>Milk Sale</span>
                        </button>
                      ) : isPoultry ? (
                        <button
                          onClick={() => {
                            setActiveLivestockAction({ animal, actionType: 'egg_sale' });
                            setActionQuantity(String(animal.dailyEggCount || 10));
                            setActionRate(String(animal.eggRatePerPiece || 12));
                          }}
                          className="px-2 py-1 rounded bg-amber-600/80 hover:bg-amber-500 text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Egg size={11} />
                          <span>Egg Sale</span>
                        </button>
                      ) : isMeatSheep ? (
                        <button
                          onClick={() => {
                            setActiveLivestockAction({ animal, actionType: 'live_sale' });
                            setActionQuantity('1');
                            setActionRate('8500');
                          }}
                          className="px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>🐑 Live Sale</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveLivestockAction({ animal, actionType: 'live_sale' });
                            setActionQuantity('1');
                            setActionRate('1000');
                          }}
                          className="px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Sale</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveLivestockAction({ animal, actionType: 'feed_expense' });
                          setActionQuantity('1');
                          setActionRate('500');
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag size={11} />
                        <span>Feed/Vet</span>
                      </button>
                    </div>

                    <div className="flex justify-end pt-0.5">
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${animal.name}" record?`)) deleteLivestock(animal.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 text-[10px] transition cursor-pointer"
                      >
                        Delete Record
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: PENDING LABOR WAGES & WORKERS */}
      {/* ========================================================================= */}
      <div className="glass-panel rounded-3xl p-5 border border-amber-900/30 bg-slate-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-400 w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{t('kpiPendingWages')}</span>
                {pendingWageTransactions.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    {pendingWageTransactions.length} Pending
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                Track coolie worker daily wages, climber fees, and tractor hire promises
              </p>
            </div>
          </div>
        </div>

        {pendingWageTransactions.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-emerald-400 font-medium">
            {t('noPendingWages')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingWageTransactions.map(tx => (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 transition space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Users size={14} className="text-amber-400" />
                        <span>{tx.workerName || 'Worker'}</span>
                      </h4>
                      <p className="text-[11px] text-amber-300/90 font-medium">
                        {tx.workType || tx.description}
                      </p>
                    </div>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {formatCurrency(tx.amount, settings.currency)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 border-t border-amber-900/30">
                    <div>
                      <span className="text-slate-500 block">Work Date:</span>
                      <span className="font-semibold text-slate-300">{tx.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Promised Due Date:</span>
                      <span className="font-semibold text-amber-300">
                        {tx.dueDate ? `📅 ${tx.dueDate}` : 'Immediate'}
                      </span>
                    </div>
                  </div>

                  {tx.fieldName && (
                    <div className="text-[10px] text-slate-400">
                      <span>Field: </span>
                      <span className="text-emerald-400 font-medium">{tx.fieldName}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-amber-900/30 flex items-center justify-between">
                  <span className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-wider">
                    Unpaid Wage
                  </span>
                  <button
                    onClick={() => handleSettleWageWithCelebration(tx.id)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('settleWage')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: REGISTERED FARM WORKERS & CONTACTS */}
      {/* ========================================================================= */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="text-indigo-400 w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold text-white">{t('workersTitle')}</h3>
              <p className="text-[11px] text-slate-400">
                Worker daily wage rates, contact details and cumulative payouts
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWorkerModal(true)}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            <Plus size={13} />
            <span>{t('addNewWorker')}</span>
          </button>
        </div>

        {workers.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
            {t('noWorkersYet')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {workers.map(w => {
              const wageInfo = workerWagesMap[w.name] || { totalPaid: 0, pending: 0 };
              return (
                <div
                  key={w.id}
                  className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{w.name}</h4>
                      <p className="text-[10px] text-slate-400">{w.role || 'Laborer'}</p>
                    </div>
                    {w.defaultDailyWage && (
                      <span className="text-[11px] font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-500/30">
                        ₹{w.defaultDailyWage}/day
                      </span>
                    )}
                  </div>

                  {w.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Phone size={11} className="text-slate-500" />
                      <span>{w.phone}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1 border-t border-slate-800/60">
                    <div>
                      <span className="text-slate-500 block">Paid:</span>
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(wageInfo.totalPaid, settings.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pending:</span>
                      <span className={`font-bold ${wageInfo.pending > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {formatCurrency(wageInfo.pending, settings.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        if (confirm(`Remove worker "${w.name}"?`)) deleteWorker(w.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 text-[10px] transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: QUICK TREE HARVEST (e.g. 100 Coconuts @ ₹20 = ₹2,000) */}
      {/* ========================================================================= */}
      {treeHarvestFieldId && treeHarvestTreeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-amber-500/40 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between text-amber-400">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <TreePine size={20} className="text-amber-400" />
                <span>Record Coconut / Tree Harvest</span>
              </h3>
              <button
                onClick={() => {
                  setTreeHarvestFieldId(null);
                  setTreeHarvestTreeId('');
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-xs text-amber-200">
              🥥 <strong>Recurring 3-Month Harvest:</strong> Record the harvested nuts, mandi sale price, and climber coolie. Profit will be auto-calculated and added to your ledger.
            </div>

            <form onSubmit={handleRecordTreeHarvestSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <DatePicker
                    label="Harvest Date"
                    required
                    value={treeHarvestDate}
                    onChange={setTreeHarvestDate}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Coconuts Plucked (Nuts) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 100"
                    value={harvestNutsCount}
                    onChange={e => setHarvestNutsCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-amber-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rate per Coconut (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    placeholder="e.g. 20"
                    value={harvestNutsRate}
                    onChange={e => setHarvestNutsRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-emerald-300 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Climber Coolie / Plucking Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 300"
                    value={harvestClimberCoolie}
                    onChange={e => setHarvestClimberCoolie(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-rose-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Real-time Calculation Badge */}
              {(() => {
                const nuts = parseInt(harvestNutsCount, 10) || 0;
                const rate = parseFloat(harvestNutsRate) || 0;
                const coolie = parseFloat(harvestClimberCoolie) || 0;
                const gross = nuts * rate;
                const net = gross - coolie;

                return (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Gross Harvest Value:</span>
                      <span className="font-bold text-white">₹{gross.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-rose-400">
                      <span>Climber Labor Expense:</span>
                      <span className="font-bold">-₹{coolie.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-400 font-black pt-1 border-t border-slate-800 text-sm">
                      <span>Net Harvest Profit:</span>
                      <span>+₹{net.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Buyer / Mandi Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Local merchant direct farm pickup"
                  value={treeHarvestNotes}
                  onChange={e => setTreeHarvestNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setTreeHarvestFieldId(null);
                    setTreeHarvestTreeId('');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Save Coconut Harvest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CROP CYCLE CLOSE & COMPLETE PROFIT & LOSS NOTE */}
      {/* ========================================================================= */}
      {cropCyclePLFieldId && activeClosingCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-center justify-between text-emerald-400">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Calculator size={20} className="text-emerald-400" />
                <span>Crop Season Completion & Profit Note</span>
              </h3>
              <button
                onClick={() => {
                  setCropCyclePLFieldId(null);
                  setCropCyclePLCropId('');
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
              🌾 Closing season for: <strong className="text-white">{activeClosingCrop.cropType}</strong> ({activeClosingCrop.startDate} → {cycleEndDate}). All logged field inputs & labor will be automatically summed.
            </div>

            <form onSubmit={handleCompleteCropCycleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <DatePicker
                    label="Season End Date"
                    required
                    value={cycleEndDate}
                    onChange={setCycleEndDate}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Harvest Yield Output *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 300 Bunches / தார்"
                    value={cycleHarvestYield}
                    onChange={e => setCycleHarvestYield(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-emerald-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  Harvest Sales Revenue (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 90000"
                  value={cycleHarvestIncome}
                  onChange={e => setCycleHarvestIncome(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-base text-emerald-300 font-black focus:outline-none"
                />
              </div>

              {/* Auto Investment Breakdown Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers size={14} className="text-indigo-400" />
                    <span>Cultivation Investments Breakdown:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {autoCalculatedInvestments.count} linked expenses
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">🌱 Seedlings / Saplings:</span>
                    <span className="font-bold text-white">₹{autoCalculatedInvestments.seeds.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">🧪 Fertilizer & Manure:</span>
                    <span className="font-bold text-white">₹{autoCalculatedInvestments.fertilizer.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">🚜 Tractor & Diesel:</span>
                    <span className="font-bold text-white">₹{autoCalculatedInvestments.tractor.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">👥 Labor & Coolie:</span>
                    <span className="font-bold text-white">₹{autoCalculatedInvestments.labor.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800 text-slate-300">
                  <span>Total Investment:</span>
                  <span className="font-black text-rose-400 font-mono">
                    ₹{autoCalculatedInvestments.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Final Profit / Loss Output Badge */}
              <div
                className={`p-4 rounded-2xl border text-center space-y-1 ${
                  cycleNetPL.profit >= 0
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider block">
                  {cycleNetPL.profit >= 0 ? '✨ Net Season Profit Note' : '⚠️ Net Season Loss'}
                </span>
                <p className="text-2xl font-black font-mono">
                  {cycleNetPL.profit >= 0 ? '+' : ''}₹{cycleNetPL.profit.toLocaleString()}
                </p>
                <p className="text-xs font-semibold">
                  Profit Margin / ROI: <span className="font-black">{cycleNetPL.roi}%</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Season Archive Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 300 Red banana bunches sold to wholesale mandi trader"
                  value={cycleNotes}
                  onChange={e => setCycleNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setCropCyclePLFieldId(null);
                    setCropCyclePLCropId('');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow-emerald transition cursor-pointer"
                >
                  Close Season & Archive P&L Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: START NEW CROP SEASON / ROTATION */}
      {/* ========================================================================= */}
      {startCycleFieldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between text-emerald-400">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sprout size={20} className="text-emerald-400" />
                <span>Start New Crop Season (Rotational / Intercrop)</span>
              </h3>
              <button
                onClick={() => setStartCycleFieldId(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
              🌱 Plant a new primary crop (e.g. Turmeric, Banana, Paddy) with parallel intercropping (e.g. Small Onion). Your boundary coconut trees will remain intact!
            </div>

            <form onSubmit={handleStartNewSeasonSubmit} className="space-y-4">
              <div>
                <DatePicker
                  label="Sowing / Planting Date"
                  required
                  value={newSeasonStartDate}
                  onChange={setNewSeasonStartDate}
                />
              </div>

              {/* 1) Primary Crop */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-900/50 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <Wheat size={14} />
                  <span>1) Primary Crop (⭐ Main Cultivation)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Select Crop:</label>
                    <SearchableSelect
                      value={newSeasonPrimaryCrop}
                      onChange={setNewSeasonPrimaryCrop}
                      options={cropSelectOptions}
                      placeholder="Search crop..."
                      searchPlaceholder="Search crop name (பயிர் தேடு)..."
                      allowCustom={true}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Saplings / Plant Count:</label>
                    <input
                      type="number"
                      placeholder="e.g. 500 rhizomes / saplings"
                      value={newSeasonPrimaryCount}
                      onChange={e => setNewSeasonPrimaryCount(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-white font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Variety / seed name (e.g. Erode Local Yellow)"
                    value={newSeasonPrimaryVariety}
                    onChange={e => setNewSeasonPrimaryVariety(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* 2) Optional Intercrop */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-teal-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-teal-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasIntercrop}
                      onChange={e => setHasIntercrop(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 text-teal-500"
                    />
                    <span>2) Add Parallel Intercrop (ஊடுபயிர்)</span>
                  </label>
                </div>

                {hasIntercrop && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Intercrop Type:</label>
                      <SearchableSelect
                        value={newSeasonIntercrop}
                        onChange={setNewSeasonIntercrop}
                        options={cropSelectOptions}
                        placeholder="Search intercrop..."
                        searchPlaceholder="Search intercrop name (ஊடுபயிர் தேடு)..."
                        allowCustom={true}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Intercrop Count:</label>
                      <input
                        type="number"
                        placeholder="e.g. 2000 bulbs"
                        value={newSeasonIntercropCount}
                        onChange={e => setNewSeasonIntercropCount(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-white font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStartCycleFieldId(null)}
                  className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow-emerald transition cursor-pointer"
                >
                  Start Season
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: QUICK LIVESTOCK ACTION (MILK SALE, EGG SALE, LIVE SALE, FEED) */}
      {/* ========================================================================= */}
      {activeLivestockAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-teal-500/40 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between text-teal-400">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CircleDollarSign size={18} className="text-teal-400" />
                <span>
                  {activeLivestockAction.actionType === 'milk_sale'
                    ? '🥛 Record Milk Collection & Sale'
                    : activeLivestockAction.actionType === 'egg_sale'
                    ? '🥚 Record Egg Collection & Sale'
                    : activeLivestockAction.actionType === 'live_sale'
                    ? '🐑 Record Live Animal Sale'
                    : '🌾 Record Animal Feed / Fodder'}
                </span>
              </h3>
              <button
                onClick={() => setActiveLivestockAction(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLivestockActionSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {activeLivestockAction.actionType === 'milk_sale'
                      ? 'Liters'
                      : activeLivestockAction.actionType === 'egg_sale'
                      ? 'Eggs Count'
                      : activeLivestockAction.actionType === 'live_sale'
                      ? 'Animal Head(s)'
                      : 'Quantity / Batches'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={actionQuantity}
                    onChange={e => setActionQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rate (₹ / unit)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={actionRate}
                    onChange={e => setActionRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-emerald-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Transaction Value:</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  ₹{((parseFloat(actionQuantity) || 0) * (parseFloat(actionRate) || 0)).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Notes / Buyer / Mandi:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Local dairy society / weekly market"
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveLivestockAction(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD / EDIT FIELD PLOT (ACREAGE, CROPS, TREES) */}
      {/* ========================================================================= */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 max-w-xl w-full space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2 text-emerald-400">
                <Sprout size={20} />
                <span>{editingFieldId ? 'Edit Farm Land Plot (நிலப்பகுதி திருத்துதல்)' : t('addNewField')}</span>
              </h3>
              <button
                onClick={() => {
                  setShowFieldModal(false);
                  setEditingFieldId(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
              🌾 {editingFieldId ? 'Update acreage, boundary trees, active seasonal crops, and water notes for this farm plot.' : 'Create fractional land plots (e.g. 1/2 Acre, 1/4 Acre, 1.5 Acre). Configure permanent border trees and active rotational crops.'}
            </div>

            <form onSubmit={handleSaveField} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    1) {t('fieldName')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. South Plot (தெற்கு தோட்டம்)"
                    value={fieldName}
                    onChange={e => setFieldName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white font-medium focus:outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    2) {t('fieldAreaAcre')} *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0.5"
                      value={fieldArea}
                      onChange={e => setFieldArea(e.target.value)}
                      className="w-28 sm:w-32 min-w-[90px] px-3 py-2.5 rounded-xl glass-input text-sm text-slate-900 dark:text-white font-black text-center focus:outline-none"
                    />
                    <select
                      value={fieldSizeUnit}
                      onChange={e => setFieldSizeUnit(e.target.value as any)}
                      className="flex-1 px-3 py-2.5 rounded-xl glass-input text-xs text-emerald-800 dark:text-emerald-300 font-bold focus:outline-none bg-slate-100 dark:bg-slate-900 cursor-pointer"
                    >
                      <option value="acres">{t('sizeUnitAcres')}</option>
                      <option value="cents">{t('sizeUnitCents')}</option>
                      <option value="hectares">{t('sizeUnitHectares')}</option>
                      <option value="sqft">{t('sizeUnitSqft')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Trees on Boundary */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <TreePine size={15} />
                    <span>3) Permanent Boundary Trees</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {tempTrees.length} tree batch(es) configured
                  </span>
                </div>

                {tempTrees.length > 0 && (
                  <div className="space-y-1.5">
                    {tempTrees.map(tItem => (
                      <div
                        key={tItem.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-xs shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-amber-900 dark:text-amber-200 text-sm tracking-wide">
                            {tItem.treeType}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-black text-[11px] shadow-sm">
                            {tItem.count} trees
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTempTree(tItem.id)}
                          className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-white font-black p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <SearchableSelect
                        value={newTreeType}
                        onChange={setNewTreeType}
                        options={treeSelectOptions}
                        placeholder="Select tree type..."
                        searchPlaceholder="Search tree (மரம் தேடு)..."
                        allowCustom={true}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Count e.g. 20"
                        value={newTreeCount}
                        onChange={e => setNewTreeCount(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-amber-900 dark:text-amber-200 font-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                    <div className="w-full sm:w-1/2">
                      <DatePicker
                        placeholder="Planted Date"
                        value={newTreePlantedDate}
                        onChange={setNewTreePlantedDate}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Variety / location notes"
                      value={newTreeVariety}
                      onChange={e => setNewTreeVariety(e.target.value)}
                      className="w-full sm:flex-1 px-2 py-1.5 rounded-lg glass-input text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTempTree}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Crops on Field */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Wheat size={15} />
                    <span>4) Rotational Seasonal Crops</span>
                  </div>
                </div>

                {tempCrops.length > 0 && (
                  <div className="space-y-1.5">
                    {tempCrops.map(cItem => (
                      <div
                        key={cItem.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs shadow-sm ${
                          cItem.isPrimary
                            ? 'bg-emerald-500/20 border-emerald-500/50'
                            : 'bg-teal-500/20 border-teal-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {cItem.isPrimary && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] shadow-sm">
                              ⭐ Primary
                            </span>
                          )}
                          <span className="font-black text-emerald-900 dark:text-emerald-200 text-sm tracking-wide">
                            {cItem.cropType}
                          </span>
                          {cItem.plantCount && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white font-black text-[10px]">
                              {cItem.plantCount} plants
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTempCrop(cItem.id)}
                          className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-white font-black p-0.5 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                  <SearchableSelect
                    value={newCropType}
                    onChange={setNewCropType}
                    options={cropSelectOptions}
                    placeholder="Select crop..."
                    searchPlaceholder="Search crop name (பயிர் தேடு)..."
                    allowCustom={true}
                  />

                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="w-full sm:w-44">
                      <DatePicker
                        placeholder="Start Date"
                        value={newCropStartDate}
                        onChange={setNewCropStartDate}
                      />
                    </div>
                    <input
                      type="number"
                      placeholder="Sapling count (e.g. 300)"
                      value={newCropPlantCount}
                      onChange={e => setNewCropPlantCount(e.target.value)}
                      className="w-32 px-2 py-1.5 rounded-lg glass-input text-xs text-white focus:outline-none"
                    />
                    <label className="flex items-center gap-1 text-[11px] text-amber-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCropIsPrimary}
                        onChange={e => setNewCropIsPrimary(e.target.checked)}
                        className="rounded text-amber-500"
                      />
                      <span>⭐ Primary</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddTempCrop}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer ml-auto"
                    >
                      + Add Crop
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Soil / Water Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Drip irrigation, bore well connection, red soil"
                  value={fieldNotes}
                  onChange={e => setFieldNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowFieldModal(false);
                    setEditingFieldId(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow-emerald cursor-pointer"
                >
                  {editingFieldId ? 'Update Field Plot' : 'Save Field Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: CUT / REMOVE TREES */}
      {/* ========================================================================= */}
      {removingTreeFieldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-rose-500/30 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between text-rose-400">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Axe size={18} className="text-rose-400" />
                <span>{t('removeTreeTitle')}</span>
              </h3>
              <button
                onClick={() => setRemovingTreeFieldId(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {(() => {
              const fld = fields.find(f => f.id === removingTreeFieldId);
              const tree = fld?.trees?.find(t => t.id === selectedTreeId) || fld?.trees?.[0];
              const maxCount = tree?.count || 1;

              return (
                <form onSubmit={handleConfirmRemoveTree} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {t('treeType')}:
                    </label>
                    <select
                      value={selectedTreeId || (fld?.trees?.[0]?.id ?? '')}
                      onChange={e => setSelectedTreeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-amber-300 font-bold focus:outline-none bg-slate-900"
                    >
                      {fld?.trees?.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.treeType} ({t.count} active)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {t('removeTreeCount')} (Max {maxCount}):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={maxCount}
                        required
                        value={treeCutCount}
                        onChange={e => setTreeCutCount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs text-rose-400 font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <DatePicker
                        label="Removal Date"
                        required
                        value={treeCutDate}
                        onChange={setTreeCutDate}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {t('removalReason')} *
                    </label>
                    <select
                      value={treeCutReason}
                      onChange={e => setTreeCutReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 focus:outline-none bg-slate-900 mb-1.5"
                    >
                      <option value="Cut down for timber / wood sale">Cut down for timber / wood sale (மரம் விற்பனை)</option>
                      <option value="Storm / heavy wind damage">Storm / heavy wind damage (புயல் காற்று சேதம்)</option>
                      <option value="Old age / unproductive trees">Old age / unproductive trees (முதிர்ச்சி / விளைச்சல் குறைவு)</option>
                      <option value="Replanting with fresh saplings">Replanting with fresh saplings (புதிய கன்று நடுதல்)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">
                      {t('woodSaleIncome')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 15000"
                      value={treeCutIncome}
                      onChange={e => setTreeCutIncome(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-emerald-300 font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRemovingTreeFieldId(null)}
                      className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      Confirm Tree Removal
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: HARVEST STANDARD CROP */}
      {/* ========================================================================= */}
      {harvestingFieldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between text-emerald-400">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wheat size={18} />
                <span>{t('harvestCropTitle')}</span>
              </h3>
              <button
                onClick={() => setHarvestingFieldId(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {(() => {
              const fld = fields.find(f => f.id === harvestingFieldId);
              const initialSelectedCrop = selectedCropId || fld?.crops?.[0]?.id || '';

              return (
                <form onSubmit={handleConfirmHarvestCrop} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Select Crop to Harvest:
                    </label>
                    <select
                      value={initialSelectedCrop}
                      onChange={e => setSelectedCropId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-emerald-300 font-bold focus:outline-none bg-slate-900"
                    >
                      {fld?.crops?.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.isPrimary ? '⭐ ' : ''}{c.cropType} {c.startDate ? `(Planted: ${c.startDate})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <DatePicker
                        label="Harvest Date"
                        required
                        value={cropHarvestDate}
                        onChange={setCropHarvestDate}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {t('harvestYield')}:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 50 Bags"
                        value={cropHarvestYield}
                        onChange={e => setCropHarvestYield(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs text-emerald-300 font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">
                      {t('harvestIncome')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 45000"
                      value={cropHarvestIncome}
                      onChange={e => setCropHarvestIncome(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-emerald-300 font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setHarvestingFieldId(null)}
                      className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      Save Harvest
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: QUICK ADD TREE TO FIELD */}
      {/* ========================================================================= */}
      {quickAddTreeFieldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-amber-500/30 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between text-amber-400">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <TreePine size={18} />
                <span>{t('addTree')}</span>
              </h3>
              <button
                onClick={() => setQuickAddTreeFieldId(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickAddTree} className="space-y-3">
              <div>
                <SearchableSelect
                  label="Select Tree Species"
                  value={quickTreeType}
                  onChange={setQuickTreeType}
                  options={treeSelectOptions}
                  placeholder="Select tree type..."
                  searchPlaceholder="Search tree (மரம் தேடு)..."
                  allowCustom={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tree Quantity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quickTreeCount}
                    onChange={e => setQuickTreeCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-amber-300 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <DatePicker
                    label="Planting Date"
                    value={quickTreePlantedDate}
                    onChange={setQuickTreePlantedDate}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Location / Variety Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Boundary border trees"
                  value={quickTreeVariety}
                  onChange={e => setQuickTreeVariety(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickAddTreeFieldId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
                >
                  Save Tree Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: FIELD HISTORY TIMELINE & P&L LEDGER */}
      {/* ========================================================================= */}
      {historyFieldId && activeHistoryField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-slate-700 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2 text-emerald-400">
                  <History size={20} />
                  <span>Field History & P&L Logs: {activeHistoryField.name}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Historical crop cycles, archived P&L notes, and recurring tree harvest logs
                </p>
              </div>
              <button
                onClick={() => setHistoryFieldId(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* History Tabs */}
            <div className="flex border-b border-slate-800 gap-4">
              <button
                type="button"
                onClick={() => setHistoryTab('crops')}
                className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  historyTab === 'crops'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌾 {t('tabCropHistory')} & P&L Notes</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px]">
                  {activeHistoryField.cropHistory?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab('tree_harvests')}
                className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  historyTab === 'tree_harvests'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🥥 Tree Harvests</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px]">
                  {activeHistoryField.treeHarvests?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab('trees')}
                className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  historyTab === 'trees'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌳 {t('tabTreeHistory')}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px]">
                  {activeHistoryField.treeHistory?.length || 0}
                </span>
              </button>
            </div>

            {/* TAB 1: CROP ROTATION & P&L HISTORY */}
            {historyTab === 'crops' && (
              <div className="space-y-3">
                {(!activeHistoryField.cropHistory || activeHistoryField.cropHistory.length === 0) ? (
                  <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-xl border border-slate-800">
                    {t('noCropHistoryYet')}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeHistoryField.cropHistory.map((hist, idx) => (
                      <div
                        key={hist.id || idx}
                        className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              {hist.isPrimary && (
                                <span className="text-[10px] text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/30">
                                  ⭐ Primary
                                </span>
                              )}
                              <h5 className="font-bold text-emerald-300 text-sm">
                                🌾 {hist.cropType}
                              </h5>
                            </div>
                            {hist.secondaryCrops && hist.secondaryCrops.length > 0 && (
                              <p className="text-[11px] text-teal-400">
                                + Intercrops: {hist.secondaryCrops.join(', ')}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {hist.startDate ? `${hist.startDate} → ` : ''}{hist.endDate || 'Season End'}
                            </span>
                            {hist.duration && (
                              <span className="text-[9px] text-emerald-400 font-semibold">
                                ⏳ {hist.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* P&L Snapshot */}
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-xs">
                          <div className="p-1.5 rounded-lg bg-slate-950/60">
                            <span className="text-[10px] text-slate-500 block">Total Investment:</span>
                            <span className="font-bold text-rose-300 font-mono">
                              {hist.totalInvestment ? formatCurrency(hist.totalInvestment, settings.currency) : 'N/A'}
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-950/60">
                            <span className="text-[10px] text-slate-500 block">Harvest Revenue:</span>
                            <span className="font-bold text-emerald-400 font-mono">
                              {hist.harvestIncome ? formatCurrency(hist.harvestIncome, settings.currency) : 'N/A'}
                            </span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                            <span className="text-[10px] text-emerald-300 block">Net Profit:</span>
                            <span className="font-black text-emerald-300 font-mono">
                              {hist.netProfitLoss !== undefined
                                ? `${hist.netProfitLoss >= 0 ? '+' : ''}${formatCurrency(hist.netProfitLoss, settings.currency)}`
                                : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <span>Yield: <strong className="text-white">{hist.harvestYield || 'Harvested'}</strong></span>
                          {hist.profitMarginPct !== undefined && (
                            <span className="text-emerald-400 font-bold">
                              ROI: +{hist.profitMarginPct.toFixed(1)}%
                            </span>
                          )}
                        </div>

                        {hist.notes && (
                          <div className="text-[10px] text-slate-400 italic bg-slate-950/30 p-1.5 rounded-lg">
                            {hist.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TREE HARVESTS (COCONUT RECURRING YIELDS) */}
            {historyTab === 'tree_harvests' && (
              <div className="space-y-3">
                {(!activeHistoryField.treeHarvests || activeHistoryField.treeHarvests.length === 0) ? (
                  <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-xl border border-slate-800">
                    No recurring tree harvests recorded yet for this field.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeHistoryField.treeHarvests.map((harv, idx) => (
                      <div
                        key={harv.id || idx}
                        className="p-3 rounded-xl bg-slate-900/70 border border-amber-900/30 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🥥</span>
                            <div>
                              <h5 className="font-bold text-amber-300 text-xs">
                                {harv.quantityHarvested} {harv.unit} Plucked @ ₹{harv.ratePerUnit}/unit
                              </h5>
                              <span className="text-[10px] text-slate-400 font-mono">
                                📅 {harv.date}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-400 font-mono">
                            +{formatCurrency(harv.netIncome ?? harv.totalIncome, settings.currency)} Net
                          </span>
                        </div>

                        {harv.laborExpense && harv.laborExpense > 0 && (
                          <div className="text-[10px] text-slate-400 flex items-center justify-between">
                            <span>Climber Labor Paid:</span>
                            <span className="text-rose-400 font-bold">-₹{harv.laborExpense}</span>
                          </div>
                        )}

                        {harv.notes && (
                          <p className="text-[10px] text-slate-400 italic">{harv.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TREE MANAGEMENT HISTORY (PLANTED / REMOVED) */}
            {historyTab === 'trees' && (
              <div className="space-y-3">
                {(!activeHistoryField.treeHistory || activeHistoryField.treeHistory.length === 0) ? (
                  <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-xl border border-slate-800">
                    {t('noTreeHistoryYet')}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeHistoryField.treeHistory.map((hist, idx) => {
                      const isPlanted = hist.action === 'planted';
                      return (
                        <div
                          key={hist.id || idx}
                          className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isPlanted
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {isPlanted ? `🌱 ${t('actionPlanted')}` : `🪓 ${t('actionRemoved')}`}
                              </span>
                              <h5 className="font-bold text-amber-200 text-sm">
                                {hist.treeType}
                              </h5>
                              <span className="font-bold text-xs text-white">
                                ({hist.count} trees)
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              📅 {hist.date}
                            </span>
                          </div>

                          {hist.reason && (
                            <div className="text-[11px] text-slate-300">
                              <span className="text-slate-500">Reason: </span>
                              <span className="font-semibold text-rose-300">{hist.reason}</span>
                            </div>
                          )}

                          {hist.incomeEarned && hist.incomeEarned > 0 && (
                            <div className="text-[11px] text-emerald-400 font-bold">
                              Wood/Timber Income: +{formatCurrency(hist.incomeEarned, settings.currency)}
                            </div>
                          )}

                          {hist.notes && (
                            <div className="text-[10px] text-slate-400 italic">
                              Notes: {hist.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setHistoryFieldId(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 10: CREATE WORKER */}
      {/* ========================================================================= */}
      {showWorkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 text-indigo-400">
              <Users size={18} />
              <span>{t('addNewWorker')}</span>
            </h3>
            <form onSubmit={handleCreateWorker} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('workerName')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('workerNamePlaceholder')}
                  value={workerName}
                  onChange={e => setWorkerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('workerPhone')}</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={workerPhone}
                  onChange={e => setWorkerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('workerRole')}</label>
                <input
                  type="text"
                  placeholder="e.g. Field Coolie, Coconut Climber, Tractor Driver"
                  value={workerRole}
                  onChange={e => setWorkerRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWorkerModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                >
                  Save Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 11: CREATE LIVESTOCK (COWS, SHEEP, HENS, DUCKS) */}
      {/* ========================================================================= */}
      {showLivestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-2xl p-6 border border-teal-900/50 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="font-bold text-white text-base flex items-center gap-2 text-teal-400">
              <Milk size={18} />
              <span>{t('addNewLivestock')}</span>
            </h3>
            <form onSubmit={handleCreateLivestock} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('animalName')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nellore Sheep Flock, Dairy Cows, Country Ducks"
                  value={animalName}
                  onChange={e => setAnimalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('animalType')}</label>
                  <select
                    value={animalType}
                    onChange={e => setAnimalType(e.target.value as LivestockType)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none bg-slate-900"
                  >
                    <option value="sheep">🐑 {t('typeSheep')} (செம்மறி ஆடு)</option>
                    <option value="cow">🐄 {t('typeCow')} (கறவை பசு)</option>
                    <option value="hen">🐓 Country Hen (நாட்டு கோழி)</option>
                    <option value="duck">🦆 Country Duck (வாத்து)</option>
                    <option value="goat">🐐 {t('typeGoat')} (வெள்ளாடு)</option>
                    <option value="buffalo">🐃 {t('typeBuffalo')} (எருமை)</option>
                    <option value="other">🐾 Other Animal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('animalCount')}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={animalCount}
                    onChange={e => setAnimalCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('tagNumber')}</label>
                <input
                  type="text"
                  placeholder="e.g. IN-TN-48291"
                  value={tagNumber}
                  onChange={e => setTagNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none font-mono"
                />
              </div>

              {/* Conditional Daily Milk Yield for Dairy Cows & Buffaloes */}
              {(animalType === 'cow' || animalType === 'buffalo') && (
                <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 space-y-2">
                  <div className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                    <Milk size={13} />
                    <span>Dairy Milk Production & Society Rate</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">Daily Yield (Liters)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="e.g. 14"
                        value={dailyMilkLiters}
                        onChange={e => setDailyMilkLiters(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-teal-300 font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">Rate (₹ / Liter)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="e.g. 38"
                        value={milkRatePerLiter}
                        onChange={e => setMilkRatePerLiter(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Daily Egg Yield for Hens & Ducks */}
              {(animalType === 'hen' || animalType === 'duck' || animalType === 'poultry') && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Egg size={13} />
                    <span>Egg Laying Capacity & Retail Rate</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">Daily Eggs Placed</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 8"
                        value={dailyEggCount}
                        onChange={e => setDailyEggCount(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-amber-300 font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">Rate (₹ / Egg)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="e.g. 12"
                        value={eggRatePerPiece}
                        onChange={e => setEggRatePerPiece(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('purchaseInvestment')}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 24000"
                    value={purchaseCost}
                    onChange={e => setPurchaseCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Breed</label>
                  <input
                    type="text"
                    placeholder="e.g. Mecheri Sheep / Country Duck"
                    value={livestockNotes}
                    onChange={e => setLivestockNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLivestockModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer"
                >
                  Save Livestock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
