import React, { useState, useMemo } from 'react';
import {
  X,
  UserPlus,
  DollarSign,
  Calendar,
  Phone,
  Sparkles,
  Check,
  Search,
  Tag,
  Stethoscope,
  Info,
  Clock,
  Scissors,
  Mail,
  MapPin,
  Target,
  CreditCard,
  CalendarClock,
  Calculator,
  Percent,
  ChevronDown,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { Patient, Payment, SurgicalProcedure, DiscountCoupon, FinancingPlan, ScheduledPayment } from '../types';
import { INITIAL_PROCEDURES, INITIAL_FINANCING_PLANS } from '../services/storage';

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const dateObj = new Date(y, m - 1, d);
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];
  const dayName = dayNames[dateObj.getDay()];
  const monthName = monthNames[dateObj.getMonth()];
  return `${dayName} ${d} ${monthName} ${y}`;
};

const getDefaultFirstDate = (freq: 'Semanal' | 'Quincenal' | 'Mensual' = 'Quincenal') => {
  const now = new Date();
  if (freq === 'Semanal') {
    now.setDate(now.getDate() + 7);
  } else if (freq === 'Quincenal') {
    now.setDate(now.getDate() + 15);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString().split('T')[0];
};

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePatient: (
    patient: Patient,
    initialPayment?: Omit<Payment, 'id' | 'patientId' | 'patientName' | 'createdAt'>
  ) => void;
  availableProcedures?: SurgicalProcedure[];
  availableCoupons?: DiscountCoupon[];
  availableFinancingPlans?: FinancingPlan[];
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onSavePatient,
  availableProcedures,
  availableCoupons,
  availableFinancingPlans,
}) => {
  const procedureCatalog = useMemo(() => {
    if (availableProcedures && availableProcedures.length > 0) {
      return availableProcedures.filter((p) => p.isActive);
    }
    return INITIAL_PROCEDURES.filter((p) => p.isActive);
  }, [availableProcedures]);

  const financingCatalog = useMemo(() => {
    if (availableFinancingPlans && availableFinancingPlans.length > 0) {
      return availableFinancingPlans.filter((p) => p.isActive);
    }
    return INITIAL_FINANCING_PLANS.filter((p) => p.isActive);
  }, [availableFinancingPlans]);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+54 9 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [campaign, setCampaign] = useState('Instagram Ads');
  const [customCampaign, setCustomCampaign] = useState('');
  const [idNumber, setIdNumber] = useState('');

  // Financing plan state
  const [selectedFrequencyFilter, setSelectedFrequencyFilter] = useState<'all' | 'Semanal' | 'Quincenal' | 'Mensual'>('all');
  const [selectedFinancingPlanId, setSelectedFinancingPlanId] = useState<string>(() => {
    return financingCatalog[0]?.id || 'PLAN-12M-QNC';
  });

  const filteredFinancingCatalog = useMemo(() => {
    if (selectedFrequencyFilter === 'all') return financingCatalog;
    const filtered = financingCatalog.filter((p) => p.frequency === selectedFrequencyFilter);
    return filtered.length > 0 ? filtered : financingCatalog;
  }, [financingCatalog, selectedFrequencyFilter]);

  // Selected financing plan
  const selectedFinancingPlan = useMemo(() => {
    return (
      financingCatalog.find((p) => p.id === selectedFinancingPlanId) ||
      financingCatalog[0] ||
      null
    );
  }, [financingCatalog, selectedFinancingPlanId]);

  // Multi-selection procedures state
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>([
    procedureCatalog[0]?.id || 'PRC-001',
  ]);
  const [includeCustomProcedure, setIncludeCustomProcedure] = useState(false);
  const [customProcedureName, setCustomProcedureName] = useState('');
  const [customProcedurePrice, setCustomProcedurePrice] = useState<number | ''>('');

  // Filter / Search state for procedures
  const [procSearch, setProcSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Coupon state
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('');

  // Financial fields
  const [totalCost, setTotalCost] = useState<number | ''>(() => {
    const firstProc = procedureCatalog[0];
    return firstProc ? firstProc.basePrice : 3200;
  });
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number | ''>('');
  const [initialPaymentMethod, setInitialPaymentMethod] = useState<
    'Transferencia' | 'Efectivo' | 'Tarjeta de Débito' | 'Tarjeta de Crédito'
  >('Transferencia');
  const [initialPaymentRef, setInitialPaymentRef] = useState('');
  const [firstPaymentDate, setFirstPaymentDate] = useState<string>(() => {
    return getDefaultFirstDate('Quincenal');
  });
  const [customInstallmentDates, setCustomInstallmentDates] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter procedures by category and search
  const filteredProcedures = useMemo(() => {
    return procedureCatalog.filter((proc) => {
      const matchesCat =
        selectedCategory === 'all' || proc.category === selectedCategory;
      const matchesSearch =
        proc.name.toLowerCase().includes(procSearch.toLowerCase()) ||
        proc.code.toLowerCase().includes(procSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [procedureCatalog, selectedCategory, procSearch]);

  // Selected procedures objects
  const selectedProcedures = useMemo(() => {
    return procedureCatalog.filter((p) => selectedProcedureIds.includes(p.id));
  }, [procedureCatalog, selectedProcedureIds]);

  // Recalculate base sum
  const calculatedSum = useMemo(() => {
    let sum = selectedProcedures.reduce((acc, p) => acc + p.basePrice, 0);
    if (includeCustomProcedure && Number(customProcedurePrice) > 0) {
      sum += Number(customProcedurePrice);
    }
    return sum;
  }, [selectedProcedures, includeCustomProcedure, customProcedurePrice]);

  // Apply discount if coupon selected
  const activeCoupon = useMemo(() => {
    if (!availableCoupons || !selectedCouponCode) return null;
    return availableCoupons.find((c) => c.code === selectedCouponCode && c.isActive) || null;
  }, [availableCoupons, selectedCouponCode]);

  const discountAmount = useMemo(() => {
    if (!activeCoupon) return 0;
    if (activeCoupon.discountType === 'percentage') {
      return Math.round((calculatedSum * activeCoupon.discountValue) / 100);
    } else {
      return Math.min(calculatedSum, activeCoupon.discountValue);
    }
  }, [activeCoupon, calculatedSum]);

  // Helper to toggle procedure checkbox and auto-update totalCost
  const handleToggleProcedure = (procId: string) => {
    const isCurrentlySelected = selectedProcedureIds.includes(procId);
    let newSelected: string[];
    if (isCurrentlySelected) {
      newSelected = selectedProcedureIds.filter((id) => id !== procId);
    } else {
      newSelected = [...selectedProcedureIds, procId];
    }
    setSelectedProcedureIds(newSelected);

    // Compute updated sum
    const updatedProcs = procedureCatalog.filter((p) => newSelected.includes(p.id));
    let newSum = updatedProcs.reduce((acc, p) => acc + p.basePrice, 0);
    if (includeCustomProcedure && Number(customProcedurePrice) > 0) {
      newSum += Number(customProcedurePrice);
    }

    // Apply coupon if exists
    let disc = 0;
    if (activeCoupon) {
      if (activeCoupon.discountType === 'percentage') {
        disc = Math.round((newSum * activeCoupon.discountValue) / 100);
      } else {
        disc = Math.min(newSum, activeCoupon.discountValue);
      }
    }
    setTotalCost(Math.max(0, newSum - disc));
  };

  // When custom procedure or price changes, update totalCost
  const handleCustomPriceChange = (val: string) => {
    const num = val === '' ? '' : Number(val);
    setCustomProcedurePrice(num);

    let sum = selectedProcedures.reduce((acc, p) => acc + p.basePrice, 0);
    if (includeCustomProcedure && Number(num) > 0) {
      sum += Number(num);
    }
    let disc = 0;
    if (activeCoupon) {
      if (activeCoupon.discountType === 'percentage') {
        disc = Math.round((sum * activeCoupon.discountValue) / 100);
      } else {
        disc = Math.min(sum, activeCoupon.discountValue);
      }
    }
    setTotalCost(Math.max(0, sum - disc));
  };

  // Toggle custom procedure checkbox
  const handleToggleCustom = (checked: boolean) => {
    setIncludeCustomProcedure(checked);
    let sum = selectedProcedures.reduce((acc, p) => acc + p.basePrice, 0);
    if (checked && Number(customProcedurePrice) > 0) {
      sum += Number(customProcedurePrice);
    }
    let disc = 0;
    if (activeCoupon) {
      if (activeCoupon.discountType === 'percentage') {
        disc = Math.round((sum * activeCoupon.discountValue) / 100);
      } else {
        disc = Math.min(sum, activeCoupon.discountValue);
      }
    }
    setTotalCost(Math.max(0, sum - disc));
  };

  // Handle coupon change
  const handleCouponChange = (couponCode: string) => {
    setSelectedCouponCode(couponCode);
    const foundCoupon = availableCoupons?.find((c) => c.code === couponCode && c.isActive);
    let disc = 0;
    if (foundCoupon) {
      if (foundCoupon.discountType === 'percentage') {
        disc = Math.round((calculatedSum * foundCoupon.discountValue) / 100);
      } else {
        disc = Math.min(calculatedSum, foundCoupon.discountValue);
      }
    }
    setTotalCost(Math.max(0, calculatedSum - disc));
  };

  // Dynamic financing calculations
  const financingCalculations = useMemo(() => {
    if (!selectedFinancingPlan) return null;
    const cost = Number(totalCost) || 0;
    const initialPaid = Number(initialPaymentAmount) || 0;
    const interestPercent = selectedFinancingPlan.interestRatePercent || 0;
    const suggestedDown = Math.round((cost * selectedFinancingPlan.downPaymentPercent) / 100);
    const balanceToFinance = Math.max(0, cost - initialPaid);
    const totalFinancedWithInterest = Math.round(balanceToFinance * (1 + interestPercent / 100));
    const count = selectedFinancingPlan.installmentsCount || 1;
    const installmentAmount = count > 0 ? Math.round(totalFinancedWithInterest / count) : totalFinancedWithInterest;

    return {
      suggestedDown,
      balanceToFinance,
      totalFinancedWithInterest,
      installmentsCount: count,
      installmentAmount,
      interestAmount: totalFinancedWithInterest - balanceToFinance,
    };
  }, [selectedFinancingPlan, totalCost, initialPaymentAmount]);

  // Quick preset button for starting date of schedule
  const handleQuickStartDate = (
    type: '7days' | '15days' | '30days' | 'nextMonth1st' | 'nextMonth15th'
  ) => {
    const d = new Date();
    if (type === '7days') {
      d.setDate(d.getDate() + 7);
    } else if (type === '15days') {
      d.setDate(d.getDate() + 15);
    } else if (type === '30days') {
      d.setDate(d.getDate() + 30);
    } else if (type === 'nextMonth1st') {
      d.setMonth(d.getMonth() + 1);
      d.setDate(1);
    } else if (type === 'nextMonth15th') {
      d.setMonth(d.getMonth() + 1);
      d.setDate(15);
    }
    setFirstPaymentDate(d.toISOString().split('T')[0]);
    setCustomInstallmentDates({});
  };

  // Full calculation of all upcoming payments based on chosen procedures, coupon, initial payment & financing plan
  const fullPaymentSchedule = useMemo(() => {
    if (!selectedFinancingPlan) return [];
    const cost = Number(totalCost) || 0;
    const initialPaid = Number(initialPaymentAmount) || 0;
    const balanceToFinance = Math.max(0, cost - initialPaid);

    if (balanceToFinance <= 0) {
      return [];
    }

    const count = selectedFinancingPlan.installmentsCount || 1;
    const interestPercent = selectedFinancingPlan.interestRatePercent || 0;
    const totalWithInterest = Math.round(balanceToFinance * (1 + interestPercent / 100));
    const baseInstallment = count > 0 ? Math.floor(totalWithInterest / count) : totalWithInterest;
    const remainder = totalWithInterest - baseInstallment * count;

    const startDateStr = firstPaymentDate || getDefaultFirstDate(selectedFinancingPlan.frequency);
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);

    let accumulatedPaid = 0;
    const list: Array<{
      installmentNumber: number;
      dueDate: string;
      formattedDate: string;
      amount: number;
      balanceAfter: number;
      isCustomDate: boolean;
    }> = [];

    for (let i = 0; i < count; i++) {
      const installmentNum = i + 1;
      let autoDateStr = '';

      if (selectedFinancingPlan.frequency === 'Semanal') {
        const d = new Date(startYear, startMonth - 1, startDay + i * 7);
        autoDateStr = d.toISOString().split('T')[0];
      } else if (selectedFinancingPlan.frequency === 'Quincenal') {
        const d = new Date(startYear, startMonth - 1, startDay + i * 15);
        autoDateStr = d.toISOString().split('T')[0];
      } else {
        // Mensual: advance month by i, clamp to max days of target month
        const targetMonthIndex = startMonth - 1 + i;
        const targetYear = startYear + Math.floor(targetMonthIndex / 12);
        const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
        const maxDaysInMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
        const clampedDay = Math.min(startDay, maxDaysInMonth);
        const mDate = new Date(targetYear, normalizedMonth, clampedDay);
        autoDateStr = mDate.toISOString().split('T')[0];
      }

      const hasCustom = Boolean(customInstallmentDates[installmentNum]);
      const finalDateStr = customInstallmentDates[installmentNum] || autoDateStr;

      const installmentAmount = baseInstallment + (i < remainder ? 1 : 0);
      accumulatedPaid += installmentAmount;
      const balanceAfter = Math.max(0, totalWithInterest - accumulatedPaid);

      list.push({
        installmentNumber: installmentNum,
        dueDate: finalDateStr,
        formattedDate: formatDisplayDate(finalDateStr),
        amount: installmentAmount,
        balanceAfter,
        isCustomDate: hasCustom,
      });
    }

    return list;
  }, [
    selectedFinancingPlan,
    totalCost,
    initialPaymentAmount,
    firstPaymentDate,
    customInstallmentDates,
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert('Por favor complete el nombre de la paciente.');
      return;
    }

    // Build procedure string
    const procedureNames = selectedProcedures.map((p) => p.name);
    if (includeCustomProcedure && customProcedureName.trim()) {
      procedureNames.push(customProcedureName.trim());
    }

    if (procedureNames.length === 0) {
      alert('Por favor seleccione al menos un procedimiento o cirugía mediante las casillas.');
      return;
    }

    if (!totalCost || Number(totalCost) <= 0) {
      alert('Por favor verifique que el monto total presupuestado sea mayor a $0.');
      return;
    }

    setIsSubmitting(true);

    const chosenProcedure = procedureNames.join(' + ');
    const cost = Number(totalCost);
    const initialPaid = Number(initialPaymentAmount) || 0;
    const balance = Math.max(0, cost - initialPaid);
    const chosenCampaign = campaign === 'Otro' ? (customCampaign.trim() || 'Otro') : campaign;

    const newId = `PAC-${Math.floor(1000 + Math.random() * 9000)}`;
    const calculatedFirstDueDate = fullPaymentSchedule.length > 0 ? fullPaymentSchedule[0].dueDate : undefined;

    const newPatient: Patient = {
      id: newId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      idNumber: idNumber.trim(),
      email: email.trim() || undefined,
      city: city.trim() || undefined,
      campaign: chosenCampaign || undefined,
      procedure: chosenProcedure,
      doctor: 'Dr. Jorge Apelencia',
      totalCost: cost,
      totalPaid: initialPaid,
      balance: balance,
      registrationDate: new Date().toISOString().split('T')[0],
      nextPaymentDate: calculatedFirstDueDate,
      status: balance <= 0 ? 'paid' : 'pending',
      notes: notes.trim(),
      financingPlanId: selectedFinancingPlan?.id,
      financingPlanName: selectedFinancingPlan?.name,
      financingMonths: selectedFinancingPlan?.months,
      financingFrequency: selectedFinancingPlan?.frequency,
      financingInstallmentsCount: selectedFinancingPlan?.installmentsCount,
      financingInstallmentAmount: financingCalculations?.installmentAmount,
      paymentSchedule: fullPaymentSchedule.map((p) => ({
        installmentNumber: p.installmentNumber,
        dueDate: p.dueDate,
        amount: p.amount,
        status: 'pending' as const,
      })),
    };

    let initialPaymentObj;
    if (initialPaid > 0) {
      initialPaymentObj = {
        amount: initialPaid,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: initialPaymentMethod,
        reference: initialPaymentRef.trim() || 'Seña / Pago inicial al registrar',
        registeredBy: 'Secretaría Cobranzas',
        notes: `Pago inicial registrado al dar de alta la paciente. Plan: ${chosenProcedure}`,
      };
    }

    onSavePatient(newPatient, initialPaymentObj);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-2xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registrar Nueva Paciente
              </h2>
              <p className="text-xs text-slate-500">
                Dr. Jorge Apelencia • Presupuesto Quirúrgico & Plan de Cobro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Nombre Completo & DNI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre y Apellido *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Valeria Benítez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                DNI / Identificación
              </label>
              <input
                type="text"
                placeholder="Ej. 38.452.190"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366]"
              />
            </div>
          </div>

          {/* Fila 2: Teléfono WhatsApp & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono / WhatsApp (con código de país) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej. +5491145678901"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Para envío directo de avisos y comprobantes por WhatsApp.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email de la Paciente
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="ej. valeria.b@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Para envío de recibos y presupuestos oficiales.
              </p>
            </div>
          </div>

          {/* Fila 3: Ciudad y Campaña de Captación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ciudad / Localidad
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ej. Buenos Aires, Rosario, Córdoba..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaña / Origen de Captación
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] cursor-pointer"
                >
                  <option value="Instagram Ads">Instagram Ads</option>
                  <option value="TikTok Ads">TikTok Ads</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Google Ads / Search">Google Ads / Search</option>
                  <option value="Referido / Boca a Boca">Referido / Boca a Boca</option>
                  <option value="Campaña Rinoplastia">Campaña Rinoplastia</option>
                  <option value="Campaña Mamoplastia">Campaña Mamoplastia</option>
                  <option value="Campaña Verano 2026">Campaña Verano 2026</option>
                  <option value="Directo en Consultorio">Directo en Consultorio</option>
                  <option value="Otro">Otro (Personalizado)</option>
                </select>
              </div>
              {campaign === 'Otro' && (
                <input
                  type="text"
                  placeholder="Especifique el nombre de la campaña o fuente..."
                  value={customCampaign}
                  onChange={(e) => setCustomCampaign(e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20"
                />
              )}
            </div>
          </div>

          {/* SELECCIÓN MÚLTIPLE DE CIRUGÍAS / PROCEDIMIENTOS */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center">
                    <Stethoscope className="w-3.5 h-3.5 mr-1 text-[#25D366]" />
                    Procedimiento o Cirugía *
                  </label>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Casillas de Selección Múltiple
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Seleccione una o varias cirugías; el financiamiento total se irá sumando automáticamente.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-700">
                  {selectedProcedureIds.length + (includeCustomProcedure ? 1 : 0)} seleccionada(s)
                </span>
              </div>
            </div>

            {/* Filter and Search Bar for Procedures */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar cirugía (ej. Rino, Lipo, Párpados, Mamas)..."
                  value={procSearch}
                  onChange={(e) => setProcSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#25D366]"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'Facial', 'Corporal', 'Medicina Estética'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'all' ? 'Todas' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox List */}
            <div className="bg-white border border-slate-200 rounded-lg p-2 max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-100">
              {filteredProcedures.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No se encontraron cirugías con ese criterio de búsqueda.
                </div>
              ) : (
                filteredProcedures.map((proc) => {
                  const isChecked = selectedProcedureIds.includes(proc.id);
                  return (
                    <label
                      key={proc.id}
                      className={`pt-1.5 pb-1.5 px-2.5 flex items-center justify-between rounded-lg transition-colors cursor-pointer select-none ${
                        isChecked
                          ? 'bg-emerald-50/70 border border-emerald-300/80'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleProcedure(proc.id)}
                          className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366] border-slate-300 cursor-pointer accent-[#25D366]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                            <span className="text-xs font-semibold text-slate-800">
                              {proc.name}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-medium ${
                                proc.category === 'Facial'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : proc.category === 'Corporal'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {proc.category}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{proc.code}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Clock className="w-2.5 h-2.5 mr-0.5" />
                              {proc.durationMinutes} min
                            </span>
                            {proc.requiresOR && (
                              <>
                                <span>•</span>
                                <span className="text-amber-700 font-medium">Quirófano</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/80">
                          ${proc.basePrice.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </label>
                  );
                })
              )}

              {/* Casilla para Otro Procedimiento Personalizado */}
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 px-2.5 py-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeCustomProcedure}
                    onChange={(e) => handleToggleCustom(e.target.checked)}
                    className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366] border-slate-300 cursor-pointer accent-[#25D366]"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    + Agregar otra cirugía o tratamiento adicional personalizado
                  </span>
                </label>

                {includeCustomProcedure && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 px-2 pb-1">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Nombre de la cirugía adicional..."
                        value={customProcedureName}
                        onChange={(e) => setCustomProcedureName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#25D366]"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Monto ($)"
                        value={customProcedurePrice}
                        onChange={(e) => handleCustomPriceChange(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#25D366]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Sum & Selection Breakdown */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-emerald-950">
                    Suma Total Calculada:
                  </span>
                  <span className="text-sm font-extrabold text-emerald-800">
                    ${calculatedSum.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProcedures.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-white border border-emerald-300 text-emerald-900 font-medium"
                    >
                      {p.name}
                    </span>
                  ))}
                  {includeCustomProcedure && customProcedureName && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-white border border-emerald-300 text-emerald-900 font-medium">
                      {customProcedureName}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  let disc = 0;
                  if (activeCoupon) {
                    if (activeCoupon.discountType === 'percentage') {
                      disc = Math.round((calculatedSum * activeCoupon.discountValue) / 100);
                    } else {
                      disc = Math.min(calculatedSum, activeCoupon.discountValue);
                    }
                  }
                  setTotalCost(Math.max(0, calculatedSum - disc));
                }}
                className="shrink-0 text-[11px] font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="Sincronizar el presupuesto con la suma de las cirugías marcadas"
              >
                Sincronizar al Presupuesto
              </button>
            </div>
          </div>

          {/* Cupón de Descuento (Opcional) */}
          {availableCoupons && availableCoupons.filter((c) => c.isActive).length > 0 && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">
                  Bono o Cupón de Descuento (Opcional):
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedCouponCode}
                  onChange={(e) => handleCouponChange(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#25D366] cursor-pointer"
                >
                  <option value="">Sin cupón aplicado</option>
                  {availableCoupons
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} - {c.discountType === 'percentage' ? `${c.discountValue}% off` : `$${c.discountValue} off`} ({c.description})
                      </option>
                    ))}
                </select>
                {discountAmount > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                    -${discountAmount.toLocaleString('es-AR')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Presupuesto Total y Financiamiento */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1 text-[#25D366]" />
              Plan Económico & Presupuesto Final
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Presupuesto Total Acordado ($) *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    (Auto-sumado o ajustable)
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={totalCost}
                  onChange={(e) =>
                    setTotalCost(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seña o Abono Inicial ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00 (Opcional si abona ahora)"
                  value={initialPaymentAmount}
                  onChange={(e) =>
                    setInitialPaymentAmount(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20"
                />
              </div>
            </div>

            {/* If initial payment entered, show method and ref */}
            {Number(initialPaymentAmount) > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Método de Abono Inicial
                  </label>
                  <select
                    value={initialPaymentMethod}
                    onChange={(e) => setInitialPaymentMethod(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo en Consultorio</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nro. Comprobante / Referencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. TRANS-123456"
                    value={initialPaymentRef}
                    onChange={(e) => setInitialPaymentRef(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Calculated balance preview */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 font-medium">Saldo Pendiente Calculado:</span>
              <span className="font-bold text-slate-900 text-sm">
                $
                {Math.max(
                  0,
                  (Number(totalCost) || 0) - (Number(initialPaymentAmount) || 0)
                ).toLocaleString('es-AR')}
              </span>
            </div>

            {/* PLAN DE FINANCIAMIENTO CONECTADO */}
            <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center">
                  <CreditCard className="w-3.5 h-3.5 mr-1 text-[#25D366]" />
                  Tipo de Financiamiento Elegido *
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Conectado con Ajustes
                </span>
              </div>

              {/* Filtro rápido por periodicidad de pago */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
                {(['all', 'Semanal', 'Quincenal', 'Mensual'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => {
                      setSelectedFrequencyFilter(freq);
                      const match =
                        freq === 'all'
                          ? financingCatalog[0]
                          : financingCatalog.find((p) => p.frequency === freq);
                      if (match) setSelectedFinancingPlanId(match.id);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer shrink-0 ${
                      selectedFrequencyFilter === freq
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {freq === 'all' ? 'Todos los plazos' : `Planes ${freq}es`}
                  </button>
                ))}
              </div>

              {/* Selector estilizado con iconos y sin desbordes ni texto cortado */}
              <div className="relative">
                <CreditCard className="w-4 h-4 text-[#25D366] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedFinancingPlanId}
                  onChange={(e) => setSelectedFinancingPlanId(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] cursor-pointer appearance-none"
                >
                  {filteredFinancingCatalog.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {plan.months} meses • {plan.frequency} ({plan.installmentsCount} cuotas{plan.interestRatePercent === 0 ? ' • 0% interés' : ` • +${plan.interestRatePercent}%`})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {selectedFinancingPlan && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-white flex items-center space-x-1">
                      <CalendarClock className="w-3 h-3 text-[#25D366]" />
                      <span>{selectedFinancingPlan.months} Meses</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      Frecuencia: {selectedFinancingPlan.frequency}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      {selectedFinancingPlan.installmentsCount} cuotas pactadas
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        selectedFinancingPlan.interestRatePercent === 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {selectedFinancingPlan.interestRatePercent === 0
                        ? '0% Sin Recargo'
                        : `+${selectedFinancingPlan.interestRatePercent}% Recargo`}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Seña sugerida: {selectedFinancingPlan.downPaymentPercent}%
                    </span>
                  </div>

                  {selectedFinancingPlan.description && (
                    <p className="text-[11px] text-slate-500 italic">
                      {selectedFinancingPlan.description}
                    </p>
                  )}

                  {financingCalculations && (
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">
                          Valor Estimado de Cuota:
                        </span>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-base font-extrabold text-[#25D366]">
                            ${financingCalculations.installmentAmount.toLocaleString('es-AR')} USD
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600">
                            / {selectedFinancingPlan.frequency.toLowerCase()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({financingCalculations.installmentsCount} pagos)
                          </span>
                        </div>
                      </div>

                      {selectedFinancingPlan.downPaymentPercent > 0 && (
                        <button
                          type="button"
                          onClick={() => setInitialPaymentAmount(financingCalculations.suggestedDown)}
                          className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Copiar seña sugerida del plan al campo de abono inicial"
                        >
                          Aplicar seña del plan ({selectedFinancingPlan.downPaymentPercent}% = ${financingCalculations.suggestedDown.toLocaleString()})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CRONOGRAMA COMPLETO DE PRÓXIMOS PAGOS Y VENCIMIENTOS */}
          <div className="pt-3 border-t border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                  <CalendarClock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Cronograma de Próximos Pagos y Vencimientos
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Calculado automáticamente con cirugías, descuento y plan de financiamiento
                  </span>
                </div>
              </div>

              {fullPaymentSchedule.length > 0 && selectedFinancingPlan && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-300 shrink-0">
                  {fullPaymentSchedule.length} pagos {selectedFinancingPlan.frequency.toLowerCase()}es
                </span>
              )}
            </div>

            {/* Resumen de cálculo paso a paso */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">1. Cirugías elegidas:</span>
                <span className="font-bold text-slate-800">${calculatedSum.toLocaleString('es-AR')} USD</span>
                <span className="text-[10px] text-slate-400 block truncate">({selectedProcedures.length} proc.)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">2. Descuento cupón:</span>
                <span className={`font-bold ${activeCoupon ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {activeCoupon ? `-$${discountAmount.toLocaleString('es-AR')} USD` : '$0 USD'}
                </span>
                {activeCoupon && (
                  <span className="text-[10px] text-emerald-600 block truncate">({activeCoupon.code})</span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">3. Abono inicial / Seña:</span>
                <span className={`font-bold ${Number(initialPaymentAmount) > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                  {Number(initialPaymentAmount) > 0 ? `-$${Number(initialPaymentAmount).toLocaleString('es-AR')} USD` : '$0 USD'}
                </span>
                <span className="text-[10px] text-slate-400 block">Deducido del saldo</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">4. Saldo a financiar:</span>
                <span className="font-extrabold text-[#25D366]">
                  ${(financingCalculations?.totalFinancedWithInterest || 0).toLocaleString('es-AR')} USD
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {selectedFinancingPlan?.interestRatePercent === 0
                    ? '0% sin recargo'
                    : `+${selectedFinancingPlan?.interestRatePercent}% recargo`}
                </span>
              </div>
            </div>

            {/* Si el saldo está totalmente saldado con el pago inicial */}
            {fullPaymentSchedule.length === 0 ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-emerald-900">
                  ¡Cirugías 100% abonadas en el pago inicial!
                </p>
                <p className="text-[11px] text-emerald-700 max-w-md mx-auto">
                  El monto inicial registrado (${Number(initialPaymentAmount).toLocaleString('es-AR')} USD) cubre la totalidad del presupuesto. No existen cuotas ni vencimientos futuros por programar.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Selector de fecha de inicio del cronograma y atajos rápidos */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-[#25D366]" />
                        Fecha del 1er Vencimiento / Pago:
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={firstPaymentDate}
                        onChange={(e) => {
                          setFirstPaymentDate(e.target.value);
                          setCustomInstallmentDates({});
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366]"
                      />
                      {Object.keys(customInstallmentDates).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCustomInstallmentDates({})}
                          className="text-[10px] text-slate-500 hover:text-slate-800 underline flex items-center space-x-0.5 cursor-pointer"
                          title="Restablecer fechas automáticas"
                        >
                          <RotateCcw className="w-3 h-3 mr-0.5" />
                          Restablecer
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Botones de sugerencia rápida de fecha */}
                  <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 text-[10px]">
                    <span className="text-slate-400 font-medium shrink-0">Atajos 1ª cuota:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickStartDate('7days')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold shrink-0 cursor-pointer transition-colors"
                    >
                      En 7 días
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickStartDate('15days')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold shrink-0 cursor-pointer transition-colors"
                    >
                      En 15 días
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickStartDate('30days')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold shrink-0 cursor-pointer transition-colors"
                    >
                      En 30 días
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickStartDate('nextMonth1st')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold shrink-0 cursor-pointer transition-colors"
                    >
                      1º próx. mes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickStartDate('nextMonth15th')}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold shrink-0 cursor-pointer transition-colors"
                    >
                      15 próx. mes
                    </button>
                  </div>
                </div>

                {/* Tabla de todos los próximos pagos */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100/90 text-slate-600 uppercase text-[10px] font-bold sticky top-0 z-10 backdrop-blur-xs">
                        <tr>
                          <th className="py-2 px-3">Cuota</th>
                          <th className="py-2 px-3">Fecha de Pago</th>
                          <th className="py-2 px-3 text-right">Monto a Pagar</th>
                          <th className="py-2 px-3 text-right">Saldo Restante</th>
                          <th className="py-2 px-3 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {fullPaymentSchedule.map((item) => {
                          const isFirst = item.installmentNumber === 1;
                          return (
                            <tr
                              key={item.installmentNumber}
                              className={`transition-colors ${
                                isFirst
                                  ? 'bg-emerald-50/50 hover:bg-emerald-50 font-medium'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-2 px-3 whitespace-nowrap">
                                <div className="flex items-center space-x-1.5">
                                  <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                                      isFirst
                                        ? 'bg-[#25D366] text-white'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {item.installmentNumber}
                                  </span>
                                  <span className="text-slate-700 font-semibold text-[11px]">
                                    Cuota {item.installmentNumber}/{fullPaymentSchedule.length}
                                  </span>
                                  {isFirst && (
                                    <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-300">
                                      Próximo
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                <div className="flex items-center space-x-1.5">
                                  <input
                                    type="date"
                                    value={item.dueDate}
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        setCustomInstallmentDates((prev) => ({
                                          ...prev,
                                          [item.installmentNumber]: e.target.value,
                                        }));
                                      }
                                    }}
                                    className={`text-xs px-1.5 py-0.5 rounded border focus:outline-hidden focus:ring-1 focus:ring-[#25D366] ${
                                      item.isCustomDate
                                        ? 'border-amber-400 bg-amber-50 text-amber-900 font-semibold'
                                        : 'border-slate-200 bg-white text-slate-800'
                                    }`}
                                  />
                                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                                    ({item.formattedDate})
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap">
                                <span className="font-extrabold text-slate-900">
                                  ${item.amount.toLocaleString('es-AR')} USD
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right whitespace-nowrap text-slate-500 text-[11px]">
                                ${item.balanceAfter.toLocaleString('es-AR')} USD
                              </td>
                              <td className="py-2 px-3 text-center whitespace-nowrap">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  Programado
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pie de tabla con datos de control */}
                  <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-600 gap-1">
                    <div>
                      <span className="font-bold text-slate-800">
                        Total {fullPaymentSchedule.length} pagos acordados:
                      </span>{' '}
                      <span className="font-extrabold text-[#25D366]">
                        ${(financingCalculations?.totalFinancedWithInterest || 0).toLocaleString('es-AR')} USD
                      </span>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      * El 1er vencimiento ({fullPaymentSchedule[0]?.dueDate || 'N/A'}) alertará a secretaría en el dashboard.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones o Condiciones Especiales
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Presupuesto congelado con seña, saldo restante contra fecha quirúrgica..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/20"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Guardar Paciente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
