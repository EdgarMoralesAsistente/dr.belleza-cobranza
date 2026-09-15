export type PaymentFrequency = 'Semanal' | 'Quincenal' | 'Mensual';

export interface FinancingPlan {
  id: string;
  name: string; // Ej: "Plan 6 Meses - Mensual", "Plan 12 Meses - Quincenal", etc.
  months: number; // 3, 6, 12, 18, 24, etc.
  frequency: PaymentFrequency; // 'Semanal' | 'Quincenal' | 'Mensual'
  installmentsCount: number; // Cantidad total de cuotas calculadas
  interestRatePercent: number; // Tasa de recargo/interés (ej: 0% sin interés, o 8%)
  downPaymentPercent: number; // Abono Inicial acordado/requerido en el plan (ej: 20%)
  isActive: boolean;
  description?: string;
}

export interface ScheduledPayment {
  installmentNumber: number;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  status?: 'pending' | 'paid';
  notes?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  phone: string; // WhatsApp number
  idNumber: string; // DNI / Cédula / RUT
  email?: string; // Correo electrónico de contacto
  city?: string; // Ciudad de residencia de la paciente
  campaign?: string; // Campaña de marketing / origen (ej. Instagram Ads, Google Ads, TikTok, Referido)
  procedure: string; // Procedimiento estético / Tratamiento
  doctor: string; // default: Dr. Jorge Apelencia
  totalCost: number; // Monto total acordado
  totalPaid: number; // Total abonado
  balance: number; // Saldo pendiente (totalCost - totalPaid)
  registrationDate: string; // YYYY-MM-DD
  status: 'pending' | 'paid' | 'overdue'; // pendiente, al día/pagado, vencido
  notes?: string;
  nextPaymentDate?: string; // Próxima fecha estimada de pago

  // Plan de Financiamiento Acordado
  financingPlanId?: string;
  financingPlanName?: string;
  financingMonths?: number;
  financingFrequency?: PaymentFrequency;
  financingInstallmentsCount?: number;
  financingInstallmentAmount?: number;
  paymentSchedule?: ScheduledPayment[];
}

export interface Payment {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Transferencia' | 'Efectivo' | 'Tarjeta de Débito' | 'Tarjeta de Crédito' | 'Zelle' | 'Mercado Pago' | 'Otro';
  reference: string; // Nro de comprobante / referencia
  notes?: string;
  registeredBy?: string; // Nombre de la secretaria / usuario
  createdAt: string;
}

export interface Refund {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  reason: string; // Motivo del reintegro
  refundMethod: 'Transferencia' | 'Efectivo' | 'Otro';
  reference: string;
  notes?: string;
  registeredBy?: string;
  createdAt: string;
}

export interface GoogleSheetConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetName: string;
  gasDeploymentUrl?: string | null;
  syncMode?: 'apps_script' | 'direct_oauth';
  lastSyncTime: string | null;
  isSyncing: boolean;
  error: string | null;
}

export type UserRole = 'super_admin' | 'admin' | 'medico' | 'financiero' | 'asistente';

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isImmutable?: boolean; // Protegido contra eliminación permanente
  createdAt: string;
  lastLogin?: string;
  notes?: string;
}

export type ActiveTab = 'dashboard' | 'crm' | 'patients' | 'payments' | 'refunds' | 'users' | 'settings';

export type CRMEventType =
  | 'bienvenida'
  | 'notificacion_cobro'
  | 'vencimiento_cuota'
  | 'seguimiento_medico'
  | 'confirmacion_abono'
  | 'otro';

export type CRMEventStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type CRMPriority = 'alta' | 'media' | 'baja';
export type CRMChannel = 'whatsapp' | 'llamada' | 'email' | 'presencial';

export interface CRMEvent {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  type: CRMEventType;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  status: CRMEventStatus;
  priority: CRMPriority;
  amount?: number;
  installmentNumber?: number;
  totalInstallments?: number;
  procedure?: string;
  createdAt: string; // ISO String
  completedAt?: string;
  assignedTo?: string;
  channel?: CRMChannel;
  notes?: string;
}

export interface SurgicalProcedure {
  id: string;
  code: string;
  name: string;
  category: 'Facial' | 'Corporal' | 'Medicina Estética' | 'Capilar' | 'Otro';
  basePrice: number;
  durationMinutes: number;
  requiresOR: boolean; // Requiere Quirófano
  doctorCommissionPercent: number;
  isActive: boolean;
  notes?: string;
}

export interface DiscountCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validUntil: string;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  minAmount?: number;
}

export interface AppBrandingConfig {
  clinicName: string;
  tagline: string;
  doctorName: string;
  specialty: string;
  phone: string;
  address: string;
  logoUrl?: string;
  logoIcon: 'Sparkles' | 'Stethoscope' | 'HeartPulse' | 'ShieldCheck' | 'Award';
  primaryColorHex: string;
}

export interface RolePrivilege {
  role: UserRole;
  roleLabel: string;
  canViewDashboard: boolean;
  canManagePatients: boolean;
  canRegisterPayments: boolean;
  canRegisterRefunds: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canAccessGoogleSheets: boolean;
  canExportReports: boolean;
}
