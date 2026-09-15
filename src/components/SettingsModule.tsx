import React, { useState } from 'react';
import {
  Settings,
  Stethoscope,
  Tag,
  ShieldCheck,
  Building2,
  Plus,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HeartPulse,
  Award,
  Upload,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  CreditCard,
  CalendarClock,
  Percent,
  Calculator,
  Layers,
} from 'lucide-react';
import {
  SurgicalProcedure,
  DiscountCoupon,
  AppBrandingConfig,
  RolePrivilege,
  UserRole,
  SystemUser,
  FinancingPlan,
  PaymentFrequency,
} from '../types';

interface SettingsModuleProps {
  procedures: SurgicalProcedure[];
  onSaveProcedures: (procedures: SurgicalProcedure[]) => void;
  coupons: DiscountCoupon[];
  onSaveCoupons: (coupons: DiscountCoupon[]) => void;
  branding: AppBrandingConfig;
  onSaveBranding: (branding: AppBrandingConfig) => void;
  rolePrivileges: RolePrivilege[];
  onSaveRolePrivileges: (privileges: RolePrivilege[]) => void;
  financingPlans: FinancingPlan[];
  onSaveFinancingPlans: (plans: FinancingPlan[]) => void;
  activeUser?: SystemUser | null;
  onNavigateToUsers?: () => void;
}

type SettingsTab = 'procedures' | 'financing' | 'coupons' | 'roles' | 'branding';

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  procedures,
  onSaveProcedures,
  coupons,
  onSaveCoupons,
  branding,
  onSaveBranding,
  rolePrivileges,
  onSaveRolePrivileges,
  financingPlans,
  onSaveFinancingPlans,
  activeUser,
  onNavigateToUsers,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('procedures');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3200);
  };

  // --- PROCEDURES STATE ---
  const [procedureSearch, setProcedureSearch] = useState('');
  const [procedureCategoryFilter, setProcedureCategoryFilter] = useState<string>('all');
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<SurgicalProcedure | null>(null);

  // Form for procedure modal
  const [procCode, setProcCode] = useState('');
  const [procName, setProcName] = useState('');
  const [procCategory, setProcCategory] = useState<SurgicalProcedure['category']>('Facial');
  const [procPrice, setProcPrice] = useState<number | ''>('');
  const [procDuration, setProcDuration] = useState<number | ''>(60);
  const [procRequiresOR, setProcRequiresOR] = useState(true);
  const [procCommission, setProcCommission] = useState<number | ''>(65);
  const [procNotes, setProcNotes] = useState('');

  const openNewProcedureModal = () => {
    setEditingProcedure(null);
    setProcCode(`QX-${Math.floor(100 + Math.random() * 900)}`);
    setProcName('');
    setProcCategory('Facial');
    setProcPrice('');
    setProcDuration(90);
    setProcRequiresOR(true);
    setProcCommission(65);
    setProcNotes('');
    setIsProcedureModalOpen(true);
  };

  const openEditProcedureModal = (proc: SurgicalProcedure) => {
    setEditingProcedure(proc);
    setProcCode(proc.code);
    setProcName(proc.name);
    setProcCategory(proc.category);
    setProcPrice(proc.basePrice);
    setProcDuration(proc.durationMinutes);
    setProcRequiresOR(proc.requiresOR);
    setProcCommission(proc.doctorCommissionPercent);
    setProcNotes(proc.notes || '');
    setIsProcedureModalOpen(true);
  };

  const handleSaveProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procName.trim() || !procPrice || Number(procPrice) <= 0) {
      alert('Por favor ingrese el nombre y un precio base válido.');
      return;
    }

    if (editingProcedure) {
      const updated = procedures.map((p) =>
        p.id === editingProcedure.id
          ? {
              ...p,
              code: procCode.trim().toUpperCase(),
              name: procName.trim(),
              category: procCategory,
              basePrice: Number(procPrice),
              durationMinutes: editingProcedure.durationMinutes || 60,
              requiresOR: editingProcedure.requiresOR ?? false,
              doctorCommissionPercent: editingProcedure.doctorCommissionPercent || 60,
              notes: procNotes.trim(),
            }
          : p
      );
      onSaveProcedures(updated);
      showToast('Procedimiento quirúrgico actualizado con éxito');
    } else {
      const newProc: SurgicalProcedure = {
        id: `PRC-${Date.now().toString().slice(-4)}`,
        code: procCode.trim().toUpperCase() || 'QX-CUSTOM',
        name: procName.trim(),
        category: procCategory,
        basePrice: Number(procPrice),
        durationMinutes: 60,
        requiresOR: false,
        doctorCommissionPercent: 60,
        isActive: true,
        notes: procNotes.trim(),
      };
      onSaveProcedures([newProc, ...procedures]);
      showToast('Nuevo procedimiento agregado al catálogo quirúrgico');
    }
    setIsProcedureModalOpen(false);
  };

  const handleToggleProcedureActive = (id: string) => {
    const updated = procedures.map((p) =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    onSaveProcedures(updated);
    showToast('Estado del procedimiento actualizado');
  };

  const handleDeleteProcedure = (id: string, name: string) => {
    if (confirm(`¿Desea eliminar el procedimiento "${name}" del catálogo?`)) {
      onSaveProcedures(procedures.filter((p) => p.id !== id));
      showToast('Procedimiento eliminado');
    }
  };

  const filteredProcedures = procedures.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(procedureSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(procedureSearch.toLowerCase());
    const matchesCategory =
      procedureCategoryFilter === 'all' || p.category === procedureCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // --- COUPONS STATE ---
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState<number | ''>('');
  const [couponValidUntil, setCouponValidUntil] = useState('2026-12-31');
  const [couponMaxUses, setCouponMaxUses] = useState<number | ''>(25);
  const [couponMinAmount, setCouponMinAmount] = useState<number | ''>(500);

  const openNewCouponModal = () => {
    setEditingCoupon(null);
    setCouponCode('PROMO' + Math.floor(10 + Math.random() * 90));
    setCouponDesc('');
    setCouponType('percentage');
    setCouponValue(10);
    setCouponValidUntil('2026-12-31');
    setCouponMaxUses(30);
    setCouponMinAmount(1000);
    setIsCouponModalOpen(true);
  };

  const openEditCouponModal = (c: DiscountCoupon) => {
    setEditingCoupon(c);
    setCouponCode(c.code);
    setCouponDesc(c.description);
    setCouponType(c.discountType);
    setCouponValue(c.discountValue);
    setCouponValidUntil(c.validUntil);
    setCouponMaxUses(c.maxUses);
    setCouponMinAmount(c.minAmount || '');
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponValue || Number(couponValue) <= 0) {
      alert('Por favor ingrese el código y el valor del descuento.');
      return;
    }

    if (editingCoupon) {
      const updated = coupons.map((c) =>
        c.id === editingCoupon.id
          ? {
              ...c,
              code: couponCode.trim().toUpperCase(),
              description: couponDesc.trim(),
              discountType: couponType,
              discountValue: Number(couponValue),
              validUntil: couponValidUntil,
              maxUses: Number(couponMaxUses) || 50,
              minAmount: couponMinAmount ? Number(couponMinAmount) : undefined,
            }
          : c
      );
      onSaveCoupons(updated);
      showToast('Cupón de descuento actualizado con éxito');
    } else {
      const newCoupon: DiscountCoupon = {
        id: `CPN-${Date.now().toString().slice(-4)}`,
        code: couponCode.trim().toUpperCase(),
        description: couponDesc.trim(),
        discountType: couponType,
        discountValue: Number(couponValue),
        validUntil: couponValidUntil,
        maxUses: Number(couponMaxUses) || 50,
        currentUses: 0,
        isActive: true,
        minAmount: couponMinAmount ? Number(couponMinAmount) : undefined,
      };
      onSaveCoupons([newCoupon, ...coupons]);
      showToast('Nuevo cupón de descuento creado');
    }
    setIsCouponModalOpen(false);
  };

  const handleToggleCouponActive = (id: string) => {
    const updated = coupons.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    onSaveCoupons(updated);
    showToast('Estado del cupón actualizado');
  };

  const handleDeleteCoupon = (id: string, code: string) => {
    if (confirm(`¿Desea eliminar el cupón "${code}"?`)) {
      onSaveCoupons(coupons.filter((c) => c.id !== id));
      showToast('Cupón de descuento eliminado');
    }
  };

  // --- FINANCING PLANS STATE ---
  const [financingSearch, setFinancingSearch] = useState('');
  const [financingFrequencyFilter, setFinancingFrequencyFilter] = useState<string>('all');
  const [isFinancingModalOpen, setIsFinancingModalOpen] = useState(false);
  const [editingFinancingPlan, setEditingFinancingPlan] = useState<FinancingPlan | null>(null);
  const [fpError, setFpError] = useState<string | null>(null);

  // Form state for financing plan
  const [fpName, setFpName] = useState('');
  const [fpMonths, setFpMonths] = useState<number>(12);
  const [fpFrequency, setFpFrequency] = useState<PaymentFrequency>('Mensual');
  const [fpInstallmentsCount, setFpInstallmentsCount] = useState<number>(12);
  const [fpInterestRate, setFpInterestRate] = useState<number | ''>(0);
  const [fpDownPaymentPercent, setFpDownPaymentPercent] = useState<number | ''>(20);
  const [fpDescription, setFpDescription] = useState('');
  const [fpIsActive, setFpIsActive] = useState(true);

  // Helper to calculate default installments based on months and frequency
  const calculateDefaultInstallments = (months: number, freq: PaymentFrequency) => {
    if (freq === 'Semanal') return Math.round(months * 4.33);
    if (freq === 'Quincenal') return months * 2;
    return months; // Mensual
  };

  const handleMonthsChange = (newMonths: number) => {
    setFpMonths(newMonths);
    setFpInstallmentsCount(calculateDefaultInstallments(newMonths, fpFrequency));
  };

  const handleFrequencyChange = (newFreq: PaymentFrequency) => {
    setFpFrequency(newFreq);
    setFpInstallmentsCount(calculateDefaultInstallments(fpMonths, newFreq));
  };

  const openNewFinancingPlanModal = () => {
    setEditingFinancingPlan(null);
    setFpName('');
    setFpMonths(12);
    setFpFrequency('Mensual');
    setFpInstallmentsCount(12);
    setFpInterestRate(0);
    setFpDownPaymentPercent(20);
    setFpDescription('');
    setFpIsActive(true);
    setFpError(null);
    setIsFinancingModalOpen(true);
  };

  const openEditFinancingPlanModal = (plan: FinancingPlan) => {
    setEditingFinancingPlan(plan);
    setFpName(plan.name);
    setFpMonths(plan.months);
    setFpFrequency(plan.frequency);
    setFpInstallmentsCount(plan.installmentsCount);
    setFpInterestRate(plan.interestRatePercent);
    setFpDownPaymentPercent(plan.downPaymentPercent);
    setFpDescription(plan.description || '');
    setFpIsActive(plan.isActive);
    setFpError(null);
    setIsFinancingModalOpen(true);
  };

  const handleDuplicateFinancingPlan = (plan: FinancingPlan) => {
    const newPlan: FinancingPlan = {
      ...plan,
      id: `PLAN-${Date.now()}`,
      name: `${plan.name} (Copia)`,
      isActive: true,
    };
    onSaveFinancingPlans([newPlan, ...financingPlans]);
    setFinancingFrequencyFilter('all');
    setFinancingSearch('');
    showToast(`Plan "${newPlan.name}" duplicado con éxito`);
  };

  const handleSaveFinancingPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setFpError(null);

    const trimmedName = fpName.trim();
    if (!trimmedName) {
      setFpError('Por favor ingrese un nombre descriptivo para el plan de financiamiento.');
      return;
    }
    const months = Number(fpMonths);
    if (!months || months <= 0) {
      setFpError('Por favor especifique una duración en meses válida (mayor a 0).');
      return;
    }
    const installments = Number(fpInstallmentsCount);
    if (!installments || installments <= 0) {
      setFpError('Por favor especifique una cantidad de cuotas válida (mínimo 1).');
      return;
    }

    const interest = Number(fpInterestRate) || 0;
    const downPayment = fpDownPaymentPercent === '' ? 20 : Math.max(0, Math.min(100, Number(fpDownPaymentPercent) || 0));

    if (editingFinancingPlan) {
      const updated = financingPlans.map((p) =>
        p.id === editingFinancingPlan.id
          ? {
              ...p,
              name: trimmedName,
              months,
              frequency: fpFrequency,
              installmentsCount: installments,
              interestRatePercent: interest,
              downPaymentPercent: downPayment,
              description: fpDescription.trim(),
              isActive: fpIsActive,
            }
          : p
      );
      onSaveFinancingPlans(updated);
      showToast('Plan de financiamiento actualizado correctamente');
    } else {
      const newPlan: FinancingPlan = {
        id: `PLAN-${Date.now()}`,
        name: trimmedName,
        months,
        frequency: fpFrequency,
        installmentsCount: installments,
        interestRatePercent: interest,
        downPaymentPercent: downPayment,
        description: fpDescription.trim(),
        isActive: fpIsActive,
      };
      // Prepend so the new plan is instantly visible at the very top of the list
      onSaveFinancingPlans([newPlan, ...financingPlans]);
      // Reset filter and search so the new plan is guaranteed to be shown
      setFinancingFrequencyFilter('all');
      setFinancingSearch('');
      showToast('Nuevo plan de financiamiento creado exitosamente');
    }
    setIsFinancingModalOpen(false);
  };

  const handleToggleFinancingPlanActive = (id: string) => {
    const updated = financingPlans.map((p) =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    onSaveFinancingPlans(updated);
    showToast('Estado del plan de financiamiento modificado');
  };

  const handleDeleteFinancingPlan = (id: string, name: string) => {
    if (confirm(`¿Desea eliminar el plan de financiamiento "${name}"?`)) {
      onSaveFinancingPlans(financingPlans.filter((p) => p.id !== id));
      showToast('Plan de financiamiento eliminado');
    }
  };

  // --- ROLES & PRIVILEGES STATE ---
  const handleTogglePrivilege = (
    role: UserRole,
    field: keyof Omit<RolePrivilege, 'role' | 'roleLabel'>
  ) => {
    if (role === 'super_admin' && (field === 'canManageSettings' || field === 'canAccessGoogleSheets')) {
      alert('Los privilegios críticos de Super Administrador no pueden ser desactivados por seguridad.');
      return;
    }

    const updated = rolePrivileges.map((p) => {
      if (p.role === role) {
        return {
          ...p,
          [field]: !p[field],
        };
      }
      return p;
    });

    onSaveRolePrivileges(updated);
    showToast('Matriz de privilegios actualizada y guardada');
  };

  // --- BRANDING STATE ---
  const [tempBranding, setTempBranding] = useState<AppBrandingConfig>(branding);
  const [logoInputUrl, setLogoInputUrl] = useState(branding.logoUrl || '');

  const handleSaveBrandingForm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBranding: AppBrandingConfig = {
      ...tempBranding,
      logoUrl: logoInputUrl.trim() || undefined,
    };
    onSaveBranding(finalBranding);
    showToast('Identidad y Branding de la clínica actualizados');
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert('La imagen no debe superar 1.5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoInputUrl(reader.result);
        setTempBranding((prev) => ({ ...prev, logoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#25D366] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 border border-emerald-400 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Module Header */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Configuración del Sistema
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Catálogo quirúrgico, cupones promocionales, privilegios de usuarios e identidad de la clínica.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Modo Super Admin:
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeUser?.fullName || 'Super Admin'}</span>
          </span>
        </div>
      </div>

      {/* Subtabs Selector */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('procedures')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'procedures'
              ? 'bg-[#25D366] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Catálogo Quirúrgico</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'procedures' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {procedures.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('financing')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'financing'
              ? 'bg-[#25D366] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Planes Financieros</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'financing' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {financingPlans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-[#25D366] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Cupones de Descuento</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'coupons' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {coupons.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-[#25D366] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Perfiles & Privilegios</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'roles' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            5 Roles
          </span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-[#25D366] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Identidad & Logo</span>
        </button>
      </div>

      {/* TAB 1: PROCEDURES CATALOG */}
      {activeTab === 'procedures' && (
        <div className="space-y-4">
          {/* Top Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar procedimiento o código..."
                  value={procedureSearch}
                  onChange={(e) => setProcedureSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                />
              </div>

              <select
                value={procedureCategoryFilter}
                onChange={(e) => setProcedureCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                <option value="Facial">Facial</option>
                <option value="Corporal">Corporal</option>
                <option value="Medicina Estética">Medicina Estética</option>
                <option value="Capilar">Capilar</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <button
              onClick={openNewProcedureModal}
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Procedimiento</span>
            </button>
          </div>

          {/* Procedures Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Procedimiento</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Precio Base (USD)</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProcedures.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No se encontraron procedimientos con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    filteredProcedures.map((proc) => (
                      <tr
                        key={proc.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !proc.isActive ? 'opacity-50 bg-slate-50/40' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {proc.code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{proc.name}</div>
                          {proc.notes && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {proc.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              proc.category === 'Facial'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : proc.category === 'Corporal'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {proc.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          ${proc.basePrice.toLocaleString()} USD
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleProcedureActive(proc.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                              proc.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {proc.isActive ? 'Activo' : 'Pausado'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditProcedureModal(proc)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Editar procedimiento"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProcedure(proc.id, proc.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Eliminar procedimiento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FINANCING PLANS */}
      {activeTab === 'financing' && (
        <div className="space-y-4">
          {/* Top Banner */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-[#25D366]" />
                <h2 className="text-sm font-bold text-slate-900">
                  Planes de Financiamiento & Modalidades de Pago
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Conectado con Registro
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configura los planes de financiamiento para las pacientes (6, 12, 24 meses, etc.) y su periodicidad (Semanal, Quincenal o Mensual).
              </p>
            </div>
            <button
              onClick={openNewFinancingPlanModal}
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Plan Financiero</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Planes
              </span>
              <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                {financingPlans.length}
              </span>
              <span className="text-[10px] text-slate-500">
                {financingPlans.filter((p) => p.isActive).length} activos para selección
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Periodicidades
              </span>
              <span className="text-xl font-bold text-emerald-700 mt-0.5 block">
                3 Tipos
              </span>
              <span className="text-[10px] text-slate-500">
                Semanal • Quincenal • Mensual
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                Plazos Máximos
              </span>
              <span className="text-xl font-bold text-blue-700 mt-0.5 block">
                Hasta 24m
              </span>
              <span className="text-[10px] text-slate-500">
                Planes flexibles de 1 a 24 meses
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
                Tasa 0% Sin Interés
              </span>
              <span className="text-xl font-bold text-purple-700 mt-0.5 block">
                {financingPlans.filter((p) => p.interestRatePercent === 0).length} Planes
              </span>
              <span className="text-[10px] text-slate-500">
                Sin costo financiero extra
              </span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar plan financiero o condiciones..."
                value={financingSearch}
                onChange={(e) => setFinancingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs text-slate-400 font-semibold mr-1">Frecuencia:</span>
              {(['all', 'Semanal', 'Quincenal', 'Mensual'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFinancingFrequencyFilter(freq)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    financingFrequencyFilter === freq
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {freq === 'all' ? 'Todas' : freq}
                </button>
              ))}
            </div>
          </div>

          {/* Financing Plans Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {financingPlans
              .filter((plan) => {
                const matchQuery =
                  plan.name.toLowerCase().includes(financingSearch.toLowerCase()) ||
                  (plan.description &&
                    plan.description.toLowerCase().includes(financingSearch.toLowerCase()));
                if (!matchQuery) return false;
                if (
                  financingFrequencyFilter !== 'all' &&
                  plan.frequency !== financingFrequencyFilter
                )
                  return false;
                return true;
              })
              .map((plan) => {
                // Simulation with $3000 USD
                const sampleCost = 3000;
                const sampleDown = (sampleCost * plan.downPaymentPercent) / 100;
                const sampleFinanced = (sampleCost - sampleDown) * (1 + plan.interestRatePercent / 100);
                const sampleInstallment = plan.installmentsCount > 0 ? sampleFinanced / plan.installmentsCount : sampleFinanced;

                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                      plan.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                            {plan.id}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleToggleFinancingPlanActive(plan.id)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                              plan.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {plan.isActive ? 'Activo' : 'Pausado'}
                          </button>
                          <button
                            onClick={() => openEditFinancingPlanModal(plan)}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 cursor-pointer"
                            title="Editar plan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateFinancingPlan(plan)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 cursor-pointer"
                            title="Duplicar plan"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFinancingPlan(plan.id, plan.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                            title="Eliminar plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Badges Matrix */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-900 text-white flex items-center space-x-1">
                          <CalendarClock className="w-3 h-3 text-[#25D366]" />
                          <span>{plan.months} Meses</span>
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                            plan.frequency === 'Semanal'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : plan.frequency === 'Quincenal'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {plan.frequency} ({plan.installmentsCount} cuotas)
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                            plan.interestRatePercent === 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {plan.interestRatePercent === 0 ? '0% Sin Interés' : `+${plan.interestRatePercent}% Recargo`}
                        </span>

                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Abono Inicial: {plan.downPaymentPercent}%
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 font-medium mb-3 min-h-[36px] line-clamp-2">
                        {plan.description || 'Plan de pago financiado según condiciones acordadas en consulta.'}
                      </p>
                    </div>

                    {/* Simulation Box */}
                    <div className="pt-3 border-t border-slate-100 bg-slate-50/80 -mx-4 -mb-4 p-3.5 rounded-b-2xl">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-slate-600">Simulación $3,000 USD:</span>
                        <span>Abono Inicial: <strong>${sampleDown.toLocaleString()}</strong></span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Cuota estimada:</span>
                        <span className="text-sm font-extrabold text-[#25D366]">
                          ${Math.round(sampleInstallment).toLocaleString()} / {plan.frequency.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {financingPlans.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-600 font-medium">
                No hay planes de financiamiento configurados aún.
              </p>
              <button
                onClick={openNewFinancingPlanModal}
                className="px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primer Plan</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Cupones de Descuento y Promociones
              </h2>
              <p className="text-xs text-slate-500">
                Configura bonificaciones y descuentos por porcentaje o monto fijo aplicables a los presupuestos.
              </p>
            </div>
            <button
              onClick={openNewCouponModal}
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Cupón</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => {
              const usagePercent = Math.min(
                100,
                Math.round((coupon.currentUses / (coupon.maxUses || 1)) * 100)
              );
              return (
                <div
                  key={coupon.id}
                  className={`bg-white rounded-2xl border p-4.5 shadow-xs transition-all relative overflow-hidden ${
                    coupon.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        <span>{coupon.code}</span>
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(coupon.code);
                          showToast(`Código ${coupon.code} copiado`);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copiar código"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          coupon.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {coupon.isActive ? 'Activo' : 'Pausado'}
                      </span>
                      <button
                        onClick={() => openEditCouponModal(coupon)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium mb-3 min-h-[32px]">
                    {coupon.description || 'Sin descripción detallada.'}
                  </p>

                  <div className="flex items-center justify-between text-xs py-2 border-t border-b border-slate-100 mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Beneficio
                      </span>
                      <span className="text-base font-extrabold text-[#25D366]">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% OFF`
                          : `$${coupon.discountValue} USD OFF`}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Válido Hasta
                      </span>
                      <span className="font-semibold text-slate-700">
                        {coupon.validUntil || 'Sin límite'}
                      </span>
                    </div>
                  </div>

                  {/* Usage bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>
                        Usos: <strong>{coupon.currentUses}</strong> / {coupon.maxUses}
                      </span>
                      <span>{usagePercent}% consumido</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#25D366] h-1.5 rounded-full transition-all"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleCouponActive(coupon.id)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {coupon.isActive ? 'Pausar cupón temporalmente' : 'Activar cupón'}
                    </button>
                    {coupon.minAmount && (
                      <span className="text-[10px] text-slate-400">
                        Mínimo: ${coupon.minAmount} USD
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & PRIVILEGES */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Matriz de Perfiles y Privilegios de Acceso (RBAC)
              </h2>
              <p className="text-xs text-slate-500">
                Define las facultades de cada rol sobre cobranzas, presupuestos, auditorías y conexión de base de datos.
              </p>
            </div>
            {onNavigateToUsers && (
              <button
                onClick={onNavigateToUsers}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 self-start md:self-auto"
              >
                <span>Ver Lista de Usuarios</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 min-w-[200px]">Rol del Sistema</th>
                    <th className="px-3 py-3 text-center">Dashboard</th>
                    <th className="px-3 py-3 text-center">Pacientes</th>
                    <th className="px-3 py-3 text-center">Cobros / Abonos</th>
                    <th className="px-3 py-3 text-center">Reintegros</th>
                    <th className="px-3 py-3 text-center">Usuarios</th>
                    <th className="px-3 py-3 text-center">Configuración</th>
                    <th className="px-3 py-3 text-center">Google Sheets</th>
                    <th className="px-3 py-3 text-center">Reportes PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rolePrivileges.map((item) => (
                    <tr key={item.role} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{item.roleLabel}</div>
                        <span className="font-mono text-[10px] text-slate-400 uppercase">
                          {item.role}
                        </span>
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.canViewDashboard}
                          onChange={() => handleTogglePrivilege(item.role, 'canViewDashboard')}
                          className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366] border-slate-300 cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.canManagePatients}
                          onChange={() => handleTogglePrivilege(item.role, 'canManagePatients')}
                          className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366] border-slate-300 cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.canRegisterPayments}
                          onChange={() => handleTogglePrivilege(item.role, 'canRegisterPayments')}
                          className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366] border-slate-300 cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.canRegisterRefunds}
                          onChange={() => handleTogglePrivilege(item.role, 'canRegisterRefunds')}
                          className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366] border-slate-300 cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.canManageUsers}
                          onChange={() => handleTogglePrivilege(item.role, 'canManageUsers')}
                          className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366] border-slate-300 cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.canManageSettings}
                          onChange={() => handleTogglePrivilege(item.role, 'canManageSettings')}
                          disabled={item.role === 'super_admin'}
                          className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366] border-slate-300 cursor-pointer disabled:opacity-50"
                        />
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.canAccessGoogleSheets}
                          onChange={() => handleTogglePrivilege(item.role, 'canAccessGoogleSheets')}
                          disabled={item.role === 'super_admin'}
                          className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366] border-slate-300 cursor-pointer disabled:opacity-50"
                        />
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.canExportReports}
                          onChange={() => handleTogglePrivilege(item.role, 'canExportReports')}
                          className="w-4 h-4 rounded text-[#25D366] focus:ring-[#25D366] border-slate-300 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span className="flex items-center">
                <AlertCircle className="w-4 h-4 text-emerald-600 mr-1.5" />
                Los cambios en los privilegios se aplican automáticamente a todas las sesiones de usuarios.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BRANDING & IDENTITY */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Identidad de la Clínica & Marca de la Web App
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Personaliza el nombre, los datos del médico titular, el isotipo y el logotipo institucional.
            </p>

            <form onSubmit={handleSaveBrandingForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombre Principal de la Clínica
                  </label>
                  <input
                    type="text"
                    value={tempBranding.clinicName}
                    onChange={(e) =>
                      setTempBranding({ ...tempBranding, clinicName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Módulo / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={tempBranding.tagline}
                    onChange={(e) =>
                      setTempBranding({ ...tempBranding, tagline: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Director Médico Titular
                  </label>
                  <input
                    type="text"
                    value={tempBranding.doctorName}
                    onChange={(e) =>
                      setTempBranding({ ...tempBranding, doctorName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Especialidad Médica
                  </label>
                  <input
                    type="text"
                    value={tempBranding.specialty}
                    onChange={(e) =>
                      setTempBranding({ ...tempBranding, specialty: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Teléfono / WhatsApp Oficial
                  </label>
                  <input
                    type="text"
                    value={tempBranding.phone}
                    onChange={(e) =>
                      setTempBranding({ ...tempBranding, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dirección del Consultorio
                  </label>
                  <input
                    type="text"
                    value={tempBranding.address}
                    onChange={(e) =>
                      setTempBranding({ ...tempBranding, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                  />
                </div>
              </div>

              {/* Isotype Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Ícono o Símbolo del Logotipo
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { key: 'Sparkles', label: 'Destellos', Icon: Sparkles },
                    { key: 'HeartPulse', label: 'Salud', Icon: HeartPulse },
                    { key: 'Stethoscope', label: 'Médico', Icon: Stethoscope },
                    { key: 'ShieldCheck', label: 'Garantía', Icon: ShieldCheck },
                    { key: 'Award', label: 'Excelencia', Icon: Award },
                  ].map(({ key, label, Icon }) => {
                    const isSelected = tempBranding.logoIcon === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setTempBranding({
                            ...tempBranding,
                            logoIcon: key as AppBrandingConfig['logoIcon'],
                          })
                        }
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-[#25D366] text-[#25D366] ring-1 ring-[#25D366]'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-semibold">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image Logo */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Logo Personalizado (Imagen URL o archivo)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="https://ejemplo.com/logo-clinica.png"
                    value={logoInputUrl}
                    onChange={(e) => {
                      setLogoInputUrl(e.target.value);
                      setTempBranding({
                        ...tempBranding,
                        logoUrl: e.target.value.trim() || undefined,
                      });
                    }}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                  />
                  <label className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer flex items-center space-x-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                  {logoInputUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoInputUrl('');
                        setTempBranding({ ...tempBranding, logoUrl: undefined });
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Quitar imagen personalizada"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold shadow-xs flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Identidad y Branding</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Vista Previa en Vivo (Menú Lateral & Encabezados)
              </span>

              {/* Sidebar Header Mockup */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="flex items-center space-x-3">
                  {tempBranding.logoUrl ? (
                    <img
                      src={tempBranding.logoUrl}
                      alt="Logo"
                      className="w-10 h-10 rounded-xl object-contain border border-slate-200 bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-xs shrink-0">
                      {tempBranding.logoIcon === 'Stethoscope' ? (
                        <Stethoscope className="w-5 h-5" />
                      ) : tempBranding.logoIcon === 'HeartPulse' ? (
                        <HeartPulse className="w-5 h-5" />
                      ) : tempBranding.logoIcon === 'ShieldCheck' ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : tempBranding.logoIcon === 'Award' ? (
                        <Award className="w-5 h-5" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-base text-slate-900 tracking-tight">
                        {tempBranding.clinicName || 'Dr. Belleza'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                        {tempBranding.tagline || 'Cobranza'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {tempBranding.doctorName || 'Dr. Jorge Apelencia'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div>
                    <strong className="text-slate-700">Especialidad:</strong> {tempBranding.specialty}
                  </div>
                  <div>
                    <strong className="text-slate-700">Contacto:</strong> {tempBranding.phone}
                  </div>
                  <div>
                    <strong className="text-slate-700">Ubicación:</strong> {tempBranding.address}
                  </div>
                </div>
              </div>

              {/* WhatsApp Button Preview */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Botón Activo WhatsApp Verde
                </span>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Activo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PROCEDURE */}
      {isProcedureModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingProcedure ? 'Editar Procedimiento' : 'Nuevo Procedimiento Quirúrgico'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Catálogo oficial Dr. Belleza</p>
                </div>
              </div>
              <button
                onClick={() => setIsProcedureModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProcedure} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código Único</label>
                  <input
                    type="text"
                    required
                    value={procCode}
                    onChange={(e) => setProcCode(e.target.value)}
                    placeholder="Ej. QX-RINO"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={procCategory}
                    onChange={(e) =>
                      setProcCategory(e.target.value as SurgicalProcedure['category'])
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Facial">Facial</option>
                    <option value="Corporal">Corporal</option>
                    <option value="Medicina Estética">Medicina Estética</option>
                    <option value="Capilar">Capilar</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombre del Procedimiento
                  </label>
                  <input
                    type="text"
                    required
                    value={procName}
                    onChange={(e) => setProcName(e.target.value)}
                    placeholder="Ej. Rinoplastia Ultrasónica Estructural"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Precio Base (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={procPrice}
                      onChange={(e) =>
                        setProcPrice(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="3200"
                      className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Observaciones / Inclusiones
                </label>
                <textarea
                  rows={3}
                  value={procNotes}
                  onChange={(e) => setProcNotes(e.target.value)}
                  placeholder="Ej. Incluye faja postquirúrgica, prótesis microtexturadas, citas de revisión..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProcedureModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingProcedure ? 'Guardar Cambios' : 'Crear Procedimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COUPON */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingCoupon ? 'Editar Cupón de Descuento' : 'Crear Cupón de Descuento'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Promociones para presupuestos</p>
                </div>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código Promocional</label>
                  <input
                    type="text"
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Ej. BELLEZA10"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Descuento</label>
                  <select
                    value={couponType}
                    onChange={(e) =>
                      setCouponType(e.target.value as 'percentage' | 'fixed')
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium cursor-pointer"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($ USD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Descripción del Beneficio
                </label>
                <input
                  type="text"
                  required
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                  placeholder="Ej. 10% de descuento en cirugías faciales"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Valor ({couponType === 'percentage' ? '%' : 'USD'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={couponValue}
                    onChange={(e) =>
                      setCouponValue(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder={couponType === 'percentage' ? '15' : '300'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Válido Hasta</label>
                  <input
                    type="date"
                    required
                    value={couponValidUntil}
                    onChange={(e) => setCouponValidUntil(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Límite de Usos</label>
                  <input
                    type="number"
                    min="1"
                    value={couponMaxUses}
                    onChange={(e) =>
                      setCouponMaxUses(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="30"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Monto Mínimo Presupuestado (Opcional en USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={couponMinAmount}
                  onChange={(e) =>
                    setCouponMinAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="Ej. 1500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT FINANCING PLAN */}
      {isFinancingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-2xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingFinancingPlan ? 'Editar Plan Financiero' : 'Nuevo Plan de Financiamiento'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configuración de plazos, periodicidad y cálculo de cuotas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFinancingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFinancingPlan} className="p-6 space-y-4 text-xs">
              {fpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{fpError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre del Plan Financiero *
                </label>
                <input
                  type="text"
                  required
                  value={fpName}
                  onChange={(e) => {
                    setFpName(e.target.value);
                    if (fpError) setFpError(null);
                  }}
                  placeholder="Ej. Plan 12 Meses - Quincenal (Sin Recargo)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Plazo en Meses *
                  </label>
                  <select
                    value={fpMonths}
                    onChange={(e) => handleMonthsChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30"
                  >
                    <option value={1}>1 Mes (Contado / Inmediato)</option>
                    <option value={3}>3 Meses</option>
                    <option value={6}>6 Meses</option>
                    <option value={9}>9 Meses</option>
                    <option value={12}>12 Meses</option>
                    <option value={18}>18 Meses</option>
                    <option value={24}>24 Meses</option>
                    <option value={36}>36 Meses</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Periodicidad de Pago *
                  </label>
                  <select
                    value={fpFrequency}
                    onChange={(e) => handleFrequencyChange(e.target.value as PaymentFrequency)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30"
                  >
                    <option value="Semanal">Semanal (cada 7 días)</option>
                    <option value="Quincenal">Quincenal (cada 15 días)</option>
                    <option value="Mensual">Mensual (cada 30 días)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cantidad Cuotas
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="1"
                    value={fpInstallmentsCount}
                    onChange={(e) => setFpInstallmentsCount(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Auto: {fpFrequency}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Recargo / Interés (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={fpInterestRate}
                    onChange={(e) =>
                      setFpInterestRate(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    0% = Sin interés
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Abono Inicial
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={fpDownPaymentPercent}
                      onChange={(e) =>
                        setFpDownPaymentPercent(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="20"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold pr-7 focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                      %
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Primer abono entregado por la paciente
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Descripción / Condiciones para la Paciente
                </label>
                <textarea
                  rows={2}
                  value={fpDescription}
                  onChange={(e) => setFpDescription(e.target.value)}
                  placeholder="Ej. Plan en cuotas fijas quincenales acordadas con la paciente. Se congela el valor con el 20% de anticipo."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                />
              </div>

              {/* Dynamic Simulation Preview Card */}
              {(() => {
                const sampleCost = 3000;
                const downPercent = Number(fpDownPaymentPercent) || 0;
                const interestPercent = Number(fpInterestRate) || 0;
                const sampleDown = (sampleCost * downPercent) / 100;
                const sampleFinanced = (sampleCost - sampleDown) * (1 + interestPercent / 100);
                const count = Number(fpInstallmentsCount) || 1;
                const sampleInstallment = count > 0 ? sampleFinanced / count : sampleFinanced;

                return (
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="flex items-center">
                        <Calculator className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Simulador de Cuota (Ejemplo Presupuesto $3,000 USD)
                      </span>
                      <span>{fpFrequency}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                      <div>
                        <span className="text-slate-400 block">Abono Inicial ({downPercent}%):</span>
                        <strong className="text-slate-800">${sampleDown.toLocaleString()} USD</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Saldo Financiar:</span>
                        <strong className="text-slate-800">${Math.round(sampleFinanced).toLocaleString()} USD</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Valor por Cuota:</span>
                        <strong className="text-emerald-700 text-xs">
                          ${Math.round(sampleInstallment).toLocaleString()} / {fpFrequency.toLowerCase()}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="fpIsActive"
                  checked={fpIsActive}
                  onChange={(e) => setFpIsActive(e.target.checked)}
                  className="rounded text-[#25D366] focus:ring-[#25D366] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="fpIsActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Habilitar este plan financiero para seleccionarlo en el registro de pacientes
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFinancingModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-submit-financing-plan"
                  className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold shadow-xs cursor-pointer transition-colors"
                >
                  {editingFinancingPlan ? 'Guardar Cambios' : 'Crear Plan de Financiamiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
