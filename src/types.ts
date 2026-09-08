export interface Patient {
  id: string;
  fullName: string;
  phone: string; // WhatsApp number
  idNumber: string; // DNI / Cédula / RUT
  procedure: string; // Procedimiento estético / Tratamiento
  doctor: string; // default: Dr. Jorge Apelencia
  totalCost: number; // Monto total acordado
  totalPaid: number; // Total abonado
  balance: number; // Saldo pendiente (totalCost - totalPaid)
  registrationDate: string; // YYYY-MM-DD
  status: 'pending' | 'paid' | 'overdue'; // pendiente, al día/pagado, vencido
  notes?: string;
  nextPaymentDate?: string; // Próxima fecha estimada de pago
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
  lastSyncTime: string | null;
  isSyncing: boolean;
  error: string | null;
}

export type UserRole = 'super_admin' | 'admin' | 'medico' | 'financiero' | 'asistente';

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  notes?: string;
}

export type ActiveTab = 'dashboard' | 'patients' | 'payments' | 'refunds' | 'users' | 'settings';

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
