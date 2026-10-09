import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  DollarSign,
  Calendar,
  FileText,
  Tag,
  Check,
  Clock,
  CreditCard,
  ShieldAlert,
  Calculator,
  Search,
} from 'lucide-react';
import {
  Patient,
  Payment,
  SurgicalProcedure,
  CampaignSource,
  FinancingPlan,
  DiscountCoupon,
  PatientProcedureItem,
} from '../types';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_PROCEDURES,
  INITIAL_FINANCING_PLANS,
  getPatientProcedureBreakdown,
} from '../services/storage';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  payments?: Payment[];
  onSavePatient: (updatedPatient: Patient, updatedInitialPayment?: number) => void;
  availableProcedures?: SurgicalProcedure[];
  availableCampaigns?: CampaignSource[];
  availableFinancingPlans?: FinancingPlan[];
  availableCoupons?: DiscountCoupon[];
  onAddCampaign?: (newCampaignName: string) => CampaignSource | void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  payments = [],
  onSavePatient,
  availableProcedures = [],
  availableCampaigns = INITIAL_CAMPAIGNS,
  availableFinancingPlans = [],
  availableCoupons = [],
  onAddCampaign,
}) => {
  const procedureCatalog = useMemo(() => {
    const list = availableProcedures.length > 0 ? availableProcedures : INITIAL_PROCEDURES;
    return list.filter((p) => p.isActive);
  }, [availableProcedures]);

  const financingCatalog = useMemo(() => {
    const list = availableFinancingPlans.length > 0 ? availableFinancingPlans : INITIAL_FINANCING_PLANS;
    return list.filter((p) => p.isActive);
  }, [availableFinancingPlans]);

  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [campaign, setCampaign] = useState('');
  const [procedure, setProcedure] = useState('');
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>([]);
  const [procSearch, setProcSearch] = useState('');
  const [doctor, setDoctor] = useState('Dr. Jorge Apelencia');

  // Budget & financial states
  const [originalSubtotal, setOriginalSubtotal] = useState<number | ''>('');
  const [discountPercent, setDiscountPercent] = useState<number | ''>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number | ''>('');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [initialPayment, setInitialPayment] = useState<number | ''>(0);
  const [subsequentPaymentsTotal, setSubsequentPaymentsTotal] = useState<number>(0);

  // Plan & schedule states
  const [selectedFinancingPlanId, setSelectedFinancingPlanId] = useState<string>('');
  const [status, setStatus] = useState<'pending' | 'paid' | 'overdue'>('pending');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [financingDeferralDays, setFinancingDeferralDays] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Identify patient's recorded payments (initial vs subsequent abonos)
  useEffect(() => {
    if (patient && isOpen) {
      setFullName(patient.fullName || '');
      setIdNumber(patient.idNumber || '');
      setPhone(patient.phone || '');
      setEmail(patient.email || '');
      setCity(patient.city || '');
      setCampaign(patient.campaign || 'Referido');
      setProcedure(patient.procedure || '');
      setDoctor(patient.doctor || 'Dr. Jorge Apelencia');

      // Match procedures in catalog by ID or name
      const breakdown = getPatientProcedureBreakdown(patient);
      const matchedIds: string[] = [];
      const currentNames = (patient.procedure || '')
        .split(/\s*\+\s*|\s*,\s*/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      procedureCatalog.forEach((proc) => {
        const matchByItem = patient.procedureItems?.some(
          (item) => item.id === proc.id || item.name.toLowerCase() === proc.name.toLowerCase()
        );
        const matchByName = currentNames.includes(proc.name.toLowerCase());
        if (matchByItem || matchByName) {
          matchedIds.push(proc.id);
        }
      });
      setSelectedProcedureIds(matchedIds);

      // Calculate Initial vs Subsequent Abonos accurately
      const patPayments = payments.filter((p) => p.patientId === patient.id);
      const initialKwPay = patPayments.find((p) => {
        const txt = `${p.notes || ''} ${p.reference || ''}`.toLowerCase();
        return (
          txt.includes('inicial') ||
          txt.includes('seña') ||
          txt.includes('sena') ||
          txt.includes('anticipo') ||
          txt.includes('primer abono')
        );
      });

      let resolvedInitial = 0;
      let resolvedSubsequent = 0;

      if (patient.initialPayment !== undefined && patient.initialPayment !== null) {
        resolvedInitial = Math.max(0, Number(patient.initialPayment) || 0);
        if (patPayments.length > 0) {
          const allSum = patPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
          if (initialKwPay) {
            resolvedSubsequent = Math.max(0, allSum - (Number(initialKwPay.amount) || 0));
          } else {
            resolvedSubsequent = Math.max(0, allSum);
          }
        } else {
          resolvedSubsequent = Math.max(0, (Number(patient.totalPaid) || 0) - resolvedInitial);
        }
      } else if (patPayments.length > 0) {
        const allSum = patPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        if (initialKwPay) {
          resolvedInitial = Number(initialKwPay.amount) || 0;
          resolvedSubsequent = Math.max(0, allSum - resolvedInitial);
        } else {
          resolvedInitial = 0;
          resolvedSubsequent = allSum;
        }
      } else {
        resolvedInitial = Number(patient.totalPaid) || 0;
        resolvedSubsequent = 0;
      }

      setInitialPayment(resolvedInitial);
      setSubsequentPaymentsTotal(resolvedSubsequent);

      const baseGross =
        patient.originalSubtotal && patient.originalSubtotal > 0
          ? patient.originalSubtotal
          : breakdown.grossSubtotal > 0
          ? breakdown.grossSubtotal
          : patient.totalCost;

      setOriginalSubtotal(baseGross);
      setTotalCost(patient.totalCost ?? '');
      setDiscountPercent(patient.discountPercent ?? '');
      setCouponCode(patient.couponCode ?? '');
      setCouponDiscount(patient.couponDiscount ?? '');

      const matchedPlan =
        financingCatalog.find((pl) => pl.id === patient.financingPlanId) ||
        financingCatalog.find((pl) => pl.name === patient.financingPlanName);
      setSelectedFinancingPlanId(matchedPlan?.id || '');

      setStatus(patient.status || 'pending');
      setNextPaymentDate(patient.nextPaymentDate || '');
      setFinancingDeferralDays(patient.financingDeferralDays || 0);
      setNotes(patient.notes || '');
      setProcSearch('');
    }
  }, [patient, isOpen, payments, procedureCatalog, financingCatalog]);

  if (!isOpen || !patient) return null;

  const numericSubtotal = originalSubtotal === '' ? (Number(totalCost) || 0) : Number(originalSubtotal);
  const numericDiscPct = Number(discountPercent) || 0;
  const numericDiscAmt = numericDiscPct > 0 ? Math.round((numericSubtotal * numericDiscPct) / 100) : 0;
  const numericCouponAmt = Number(couponDiscount) || 0;
  const totalDiscountsApplied = numericDiscAmt + numericCouponAmt;

  const numericCost = totalCost === '' ? 0 : Number(totalCost);
  const numericInitial = initialPayment === '' ? 0 : Math.max(0, Number(initialPayment) || 0);
  const effectiveTotalPaid = numericInitial + subsequentPaymentsTotal;
  const calculatedBalance = Math.max(0, numericCost - effectiveTotalPaid);

  const recalculateNetCostFromDiscounts = (
    baseSub: number,
    pctVal: number | '',
    cpnVal: number | ''
  ) => {
    const p = Number(pctVal) || 0;
    const dAmt = p > 0 ? Math.round((baseSub * p) / 100) : 0;
    const cAmt = Number(cpnVal) || 0;
    setTotalCost(Math.max(0, baseSub - (dAmt + cAmt)));
  };

  // Toggle procedure from surgical catalog and auto-recalculate budget
  const handleToggleProcedureInEdit = (proc: SurgicalProcedure) => {
    const exists = selectedProcedureIds.includes(proc.id);
    const nextIds = exists
      ? selectedProcedureIds.filter((id) => id !== proc.id)
      : [...selectedProcedureIds, proc.id];

    setSelectedProcedureIds(nextIds);
    const selectedObjs = procedureCatalog.filter((p) => nextIds.includes(p.id));
    if (selectedObjs.length > 0) {
      const combinedName = selectedObjs.map((p) => p.name).join(' + ');
      const newGross = selectedObjs.reduce((sum, p) => sum + p.basePrice, 0);
      setProcedure(combinedName);
      setOriginalSubtotal(newGross);
      recalculateNetCostFromDiscounts(newGross, discountPercent, couponDiscount);
    }
  };

  const filteredCatalogProcedures = procedureCatalog.filter(
    (p) =>
      p.name.toLowerCase().includes(procSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(procSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !procedure.trim() || totalCost === '') {
      alert('Por favor complete los campos obligatorios (Nombre, Teléfono, Procedimiento y Costo Total).');
      return;
    }

    const selectedObjs = procedureCatalog.filter((p) => selectedProcedureIds.includes(p.id));
    const updatedProcedureItems: PatientProcedureItem[] =
      selectedObjs.length > 0
        ? selectedObjs.map((p) => ({
            id: p.id,
            code: p.code,
            name: p.name,
            category: p.category,
            basePrice: p.basePrice,
            isExtra: p.category === 'Extra',
          }))
        : patient.procedureItems || [
            {
              name: procedure.trim(),
              category: 'Corporal',
              basePrice: numericSubtotal,
              isExtra: false,
            },
          ];

    const discSubtotal = updatedProcedureItems
      .filter((i) => !i.isExtra && i.category !== 'Extra')
      .reduce((acc, i) => acc + i.basePrice, 0) || numericSubtotal;
    const exmSubtotal = updatedProcedureItems
      .filter((i) => i.isExtra || i.category === 'Extra')
      .reduce((acc, i) => acc + i.basePrice, 0);

    const chosenPlan = financingCatalog.find((pl) => pl.id === selectedFinancingPlanId);
    const installmentsCount = chosenPlan?.installmentsCount || patient.financingInstallmentsCount || 6;
    const frequency = chosenPlan?.frequency || patient.financingFrequency || 'Mensual';
    const newInstallmentAmount =
      calculatedBalance > 0 && installmentsCount > 0
        ? Math.round(calculatedBalance / installmentsCount)
        : 0;

    // Rebuild or adjust payment schedule to reflect the updated budget and balance
    let updatedSchedule = patient.paymentSchedule ? [...patient.paymentSchedule] : [];
    if (updatedSchedule.length > 0) {
      const pendingIdxs = updatedSchedule
        .map((s, idx) => (s.status !== 'paid' ? idx : -1))
        .filter((idx) => idx !== -1);

      if (calculatedBalance <= 0) {
        updatedSchedule = updatedSchedule.map((s) => ({
          ...s,
          amount: s.status === 'paid' ? s.amount : 0,
          status: 'paid' as const,
        }));
      } else if (pendingIdxs.length > 0) {
        const perQuota = Math.floor(calculatedBalance / pendingIdxs.length);
        const rem = calculatedBalance - perQuota * pendingIdxs.length;
        pendingIdxs.forEach((sIdx, orderIdx) => {
          updatedSchedule[sIdx] = {
            ...updatedSchedule[sIdx],
            amount: perQuota + (orderIdx === pendingIdxs.length - 1 ? rem : 0),
            status: 'pending',
          };
        });
      }
    }

    const updatedPatient: Patient = {
      ...patient,
      fullName: fullName.trim(),
      idNumber: idNumber.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      city: city.trim() || undefined,
      campaign: campaign.trim() || 'Referido',
      procedure: procedure.trim(),
      procedureItems: updatedProcedureItems,
      doctor: doctor.trim() || 'Dr. Jorge Apelencia',
      totalCost: numericCost,
      initialPayment: numericInitial,
      totalPaid: effectiveTotalPaid,
      balance: calculatedBalance,
      status: calculatedBalance === 0 ? 'paid' : status === 'paid' ? 'pending' : status,
      nextPaymentDate: calculatedBalance === 0 ? undefined : nextPaymentDate || undefined,
      financingPlanId: chosenPlan ? chosenPlan.id : patient.financingPlanId,
      financingPlanName: chosenPlan ? chosenPlan.name : patient.financingPlanName,
      financingMonths: chosenPlan ? chosenPlan.months : patient.financingMonths,
      financingFrequency: frequency,
      financingInstallmentsCount: installmentsCount,
      financingInstallmentAmount: newInstallmentAmount,
      financingDeferralDays: financingDeferralDays > 0 ? financingDeferralDays : undefined,
      paymentSchedule: updatedSchedule.length > 0 ? updatedSchedule : patient.paymentSchedule,
      notes: notes.trim() || undefined,
      originalSubtotal: numericSubtotal,
      discountableSubtotal: discSubtotal,
      exemptSubtotal: exmSubtotal,
      discountPercent: numericDiscPct,
      discountAmount: numericDiscAmt,
      couponCode: couponCode.trim() || undefined,
      couponDiscount: numericCouponAmt,
      totalDiscount: totalDiscountsApplied,
    };

    onSavePatient(updatedPatient, numericInitial);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-2xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  Editar Paciente & Modificar Presupuesto
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Cambie procedimiento(s), costo total, abono inicial ($0 o mayor) y plan sin necesidad de eliminar el registro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[82vh] overflow-y-auto">
          {/* Sección 1: Datos Personales */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Datos Personales & Origen de Captación</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Sofía Martínez"
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  DNI / Cédula / RUT
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Ej. 38.452.119"
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  WhatsApp / Teléfono <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 9 11 4567 8901"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sofia@ejemplo.com"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Ciudad de Residencia
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. Buenos Aires, Rosario, etc."
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Campaña / Origen de Captación
                </label>
                <select
                  value={campaign}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      const custom = prompt('Ingrese la nueva opción de Campaña / Origen de Captación:');
                      if (custom && custom.trim()) {
                        if (onAddCampaign) onAddCampaign(custom.trim());
                        setCampaign(custom.trim());
                      }
                    } else {
                      setCampaign(e.target.value);
                    }
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {availableCampaigns.filter((c) => c.isActive).map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                  {!availableCampaigns.some((c) => c.name === campaign) && campaign && (
                    <option value={campaign}>{campaign}</option>
                  )}
                  <option value="__ADD_NEW__">+ Agregar nueva opción...</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección 2: Cambio Directo de Procedimiento(s) / Presupuesto Quirúrgico */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Procedimiento(s) & Cambio de Cirugía</span>
              </h3>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Seleccione del catálogo para recalcular el presupuesto automáticamente o edite el texto
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Procedimiento(s) Contratados <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  placeholder="Ej. Mastopexia con Implantes + Lipoescultura HD"
                  className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Médico Responsable
                </label>
                <input
                  type="text"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Selector interactivo del Catálogo Quirúrgico */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-700">
                  Catálogo Quirúrgico (clic para agregar/cambiar procedimiento y actualizar monto):
                </span>
                <div className="relative w-48">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={procSearch}
                    onChange={(e) => setProcSearch(e.target.value)}
                    placeholder="Filtrar cirugía..."
                    className="w-full pl-7 pr-2 py-1 text-[11px] bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
                {filteredCatalogProcedures.map((proc) => {
                  const isSelected =
                    selectedProcedureIds.includes(proc.id) ||
                    procedure.toLowerCase().includes(proc.name.toLowerCase());
                  return (
                    <button
                      type="button"
                      key={proc.id}
                      onClick={() => handleToggleProcedureInEdit(proc)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{proc.name}</span>
                      <span
                        className={`text-[10px] px-1 rounded ${
                          isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        ${proc.basePrice.toLocaleString('es-AR')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sección 3: Presupuesto, Descuentos y Manejo de Inicial vs. Abonos */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Presupuesto, Descuentos & Control de Inicial vs. Abonos</span>
            </h3>

            {/* Ajuste de Subtotal y Descuentos */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Total Plan Financiamiento ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Subtotal sin desc."
                    value={originalSubtotal}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setOriginalSubtotal(val);
                      if (val !== '') {
                        recalculateNetCostFromDiscounts(Number(val), discountPercent, couponDiscount);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Monto bruto sin descuentos
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Descuento (%)
                    </label>
                    <div className="flex space-x-1">
                      {[0, 10, 15, 20].map((p) => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => {
                            const nextPct = p === 0 ? '' : p;
                            setDiscountPercent(nextPct);
                            const base = Number(originalSubtotal) || numericCost || 0;
                            recalculateNetCostFromDiscounts(base, nextPct, couponDiscount);
                          }}
                          className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                        >
                          {p}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={discountPercent}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setDiscountPercent(val);
                        const base = Number(originalSubtotal) || numericCost || 0;
                        recalculateNetCostFromDiscounts(base, val, couponDiscount);
                      }}
                      className="w-full px-2.5 py-1.5 pr-6 rounded-lg bg-white border border-slate-300 font-bold text-slate-800"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bono / Cupón ($ USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={couponDiscount}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setCouponDiscount(val);
                      const base = Number(originalSubtotal) || numericCost || 0;
                      recalculateNetCostFromDiscounts(base, discountPercent, val);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-800"
                  />
                  {availableCoupons.length > 0 && (
                    <select
                      value={couponCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setCouponCode(code);
                        const found = availableCoupons.find((c) => c.code === code);
                        const base = Number(originalSubtotal) || numericCost || 0;
                        if (found) {
                          const cVal =
                            found.discountType === 'percentage'
                              ? Math.round((base * found.discountValue) / 100)
                              : found.discountValue;
                          setCouponDiscount(cVal);
                          recalculateNetCostFromDiscounts(base, discountPercent, cVal);
                        } else {
                          setCouponDiscount('');
                          recalculateNetCostFromDiscounts(base, discountPercent, '');
                        }
                      }}
                      className="mt-1 w-full text-[10px] py-1 px-1.5 rounded bg-white border border-slate-200 text-slate-700"
                    >
                      <option value="">Seleccionar bono...</option>
                      {availableCoupons.map((c) => (
                        <option key={c.id} value={c.code}>
                          {c.code} ({c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-800 mb-1">
                    Total de Descuentos
                  </label>
                  <div className="py-1.5 px-2.5 rounded-lg bg-blue-50 border border-blue-200 font-extrabold text-blue-900">
                    ${totalDiscountsApplied.toLocaleString('es-AR')} USD
                  </div>
                  <span className="text-[10px] text-blue-600 block mt-0.5">
                    Suma de % dto + bonos
                  </span>
                </div>
              </div>
            </div>

            {/* Desglose claro: Costo Neto vs Inicial ($0 permitido) vs Abonos de Cuotas vs Saldo Pendiente */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* 1. Costo Total Neto */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block font-bold text-slate-700 mb-1">
                  Costo Neto a Pagar ($) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-white border border-slate-300 font-extrabold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Presupuesto con descuentos
                </span>
              </div>

              {/* 2. Abono Inicial (Editable, permite $0 sin afectar abonos posteriores) */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-emerald-900">
                    Abono Inicial ($)
                  </label>
                  <button
                    type="button"
                    onClick={() => setInitialPayment(0)}
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border cursor-pointer ${
                      numericInitial === 0
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    }`}
                    title="Marcar $0 de Inicial (cuando la paciente no dejó inicial pero realiza abonos)"
                  >
                    Marcar $0
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={initialPayment}
                    onChange={(e) =>
                      setInitialPayment(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))
                    }
                    className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-white border border-emerald-300 font-extrabold text-emerald-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-emerald-700 block mt-1">
                  Permite $0 si solo hizo abonos
                </span>
              </div>

              {/* 3. Abonos Posteriores Acumulados */}
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200 flex flex-col justify-between">
                <div>
                  <label className="block font-bold text-blue-900 mb-1">
                    Abonos de Cuotas ($)
                  </label>
                  <div className="py-1.5 px-2.5 rounded-lg bg-white border border-blue-200 font-extrabold text-blue-800 text-sm">
                    ${subsequentPaymentsTotal.toLocaleString('es-AR')} USD
                  </div>
                </div>
                <span className="text-[10px] text-blue-700 block mt-1">
                  Total Abonado: <strong>${effectiveTotalPaid.toLocaleString('es-AR')} USD</strong>
                </span>
              </div>

              {/* 4. Saldo Pendiente Resultante */}
              <div
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  calculatedBalance === 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div>
                  <label className="block font-bold mb-1">
                    Saldo Pendiente Final
                  </label>
                  <div className="py-1.5 px-2.5 rounded-lg bg-white/90 border border-amber-200 font-black text-sm">
                    ${calculatedBalance.toLocaleString('es-AR')} USD
                  </div>
                </div>
                <span className="text-[10px] block mt-1">
                  {calculatedBalance === 0
                    ? '✓ Presupuesto 100% saldado'
                    : 'Costo Neto menos (Inicial + Abonos)'}
                </span>
              </div>
            </div>

            {/* Plan de Financiamiento, Estado y Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Plan de Financiamiento</span>
                </label>
                <select
                  value={selectedFinancingPlanId}
                  onChange={(e) => setSelectedFinancingPlanId(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">{patient.financingPlanName || 'Mantener plan actual'}</option>
                  {financingCatalog.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} ({pl.installmentsCount} cuotas - {pl.frequency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estado de Cuenta
                </label>
                <select
                  value={calculatedBalance === 0 ? 'paid' : status}
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'paid' | 'overdue')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="pending">🟡 Pendiente (Con saldo en proceso)</option>
                  <option value="paid">🟢 Cancelado / Al Día (Totalmente pagado)</option>
                  <option value="overdue">🔴 Vencido (Mora en cuota acordada)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Próxima Fecha de Pago
                </label>
                <input
                  type="date"
                  value={nextPaymentDate}
                  onChange={(e) => setNextPaymentDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Sección 4: Notas */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block font-medium text-slate-700 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notas Clínicas / Observaciones del Presupuesto</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotaciones sobre cambios de procedimiento, acuerdos de inicial $0 o abonos..."
              className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold transition-colors shadow-2xs cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Cambios del Presupuesto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
