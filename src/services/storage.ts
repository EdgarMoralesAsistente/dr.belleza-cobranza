import {
  Patient,
  Payment,
  Refund,
  GoogleSheetConfig,
  SystemUser,
  SurgicalProcedure,
  DiscountCoupon,
  AppBrandingConfig,
  RolePrivilege,
} from '../types';

export const INITIAL_USERS: SystemUser[] = [
  {
    id: 'USR-101',
    fullName: 'Dr. Jorge Apelencia',
    email: 'jorge.apelencia@drbelleza.com',
    role: 'super_admin',
    phone: '+5491145678900',
    isActive: true,
    createdAt: '2026-01-15',
    lastLogin: 'Hoy, 08:30',
    notes: 'Director Médico Titular. Único facultado para vincular y configurar la conexión directa con Google Sheets.',
  },
  {
    id: 'USR-102',
    fullName: 'Lic. Marcela Vega',
    email: 'marcela.vega@drbelleza.com',
    role: 'admin',
    phone: '+5491145678901',
    isActive: true,
    createdAt: '2026-02-01',
    lastLogin: 'Hoy, 09:12',
    notes: 'Administradora General. Supervisión integral del consultorio, auditoría de cobros y gestión de usuarios.',
  },
  {
    id: 'USR-103',
    fullName: 'Dr. Carlos Santillán',
    email: 'carlos.santillan@drbelleza.com',
    role: 'medico',
    phone: '+5491145678902',
    isActive: true,
    createdAt: '2026-03-10',
    lastLogin: 'Ayer, 18:45',
    notes: 'Médico Cirujano Adjunto. Consulta de presupuestos, pacientes asignados y fechas de quirófano.',
  },
  {
    id: 'USR-104',
    fullName: 'Cdr. Esteban Morales',
    email: 'esteban.morales@drbelleza.com',
    role: 'financiero',
    phone: '+5491145678903',
    isActive: true,
    createdAt: '2026-02-15',
    lastLogin: 'Hoy, 08:15',
    notes: 'Responsable de Cobranzas y Finanzas. Conciliación bancaria, reportes contables PDF y balances.',
  },
  {
    id: 'USR-105',
    fullName: 'Luciana Gómez',
    email: 'luciana.gomez@drbelleza.com',
    role: 'asistente',
    phone: '+5491145678904',
    isActive: true,
    createdAt: '2026-04-01',
    lastLogin: 'En línea',
    notes: 'Secretaría de Consultorio. Recepción, alta de pacientes, registro de abonos y avisos por WhatsApp.',
  },
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PAC-1001',
    fullName: 'Mariana Silva Gómez',
    phone: '+5491145678901',
    idNumber: '38.452.190',
    procedure: 'Rinoplastia Ultrasónica Estructural',
    doctor: 'Dr. Jorge Apelencia',
    totalCost: 3200,
    totalPaid: 2000,
    balance: 1200,
    registrationDate: '2026-08-10',
    nextPaymentDate: '2026-09-15',
    status: 'pending',
    notes: 'Presupuesto congelado. Saldo restante contra fecha quirúrgica de Octubre.',
  },
  {
    id: 'PAC-1002',
    fullName: 'Valeria Lucía Benítez',
    phone: '+5491167891234',
    idNumber: '40.112.543',
    procedure: 'Lipoescultura HD con Marcación',
    doctor: 'Dr. Jorge Apelencia',
    totalCost: 4500,
    totalPaid: 4500,
    balance: 0,
    registrationDate: '2026-08-01',
    status: 'paid',
    notes: 'Cancelación total completada. Quirófano asignado para el 20 de Septiembre.',
  },
  {
    id: 'PAC-1003',
    fullName: 'Carolina Mendoza Paz',
    phone: '+5491189012345',
    idNumber: '35.981.442',
    procedure: 'Mamoplastia de Aumento (Mentor 350cc)',
    doctor: 'Dr. Jorge Apelencia',
    totalCost: 3800,
    totalPaid: 1500,
    balance: 2300,
    registrationDate: '2026-08-20',
    nextPaymentDate: '2026-09-10',
    status: 'pending',
    notes: 'Abonó reserva de prótesis y reserva de quirófano. Cuota 2 pendiente.',
  },
  {
    id: 'PAC-1004',
    fullName: 'Florencia Antonella Ruiz',
    phone: '+5491123456789',
    idNumber: '42.330.129',
    procedure: 'Armonización Facial (Bótox + Ácido Hialurónico)',
    doctor: 'Dr. Jorge Apelencia',
    totalCost: 950,
    totalPaid: 950,
    balance: 0,
    registrationDate: '2026-09-02',
    status: 'paid',
    notes: 'Tratamiento ambulatorio en consultorio realizado.',
  },
  {
    id: 'PAC-1005',
    fullName: 'Sofía Agustina Romero',
    phone: '+5491134567890',
    idNumber: '39.022.901',
    procedure: 'Blefaroplastia Superior e Inferior',
    doctor: 'Dr. Jorge Apelencia',
    totalCost: 2100,
    totalPaid: 600,
    balance: 1500,
    registrationDate: '2026-08-15',
    nextPaymentDate: '2026-09-05',
    status: 'overdue',
    notes: 'Fecha de pago de saldo vencida hace 3 días. Enviar recordatorio WhatsApp.',
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'PAG-5001',
    patientId: 'PAC-1001',
    patientName: 'Mariana Silva Gómez',
    amount: 1000,
    date: '2026-08-10',
    paymentMethod: 'Transferencia',
    reference: 'TRANS-BCO-882190',
    registeredBy: 'Secretaría Cobranzas',
    notes: 'Seña inicial de reserva de fecha',
    createdAt: '2026-08-10T14:30:00.000Z',
  },
  {
    id: 'PAG-5002',
    patientId: 'PAC-1001',
    patientName: 'Mariana Silva Gómez',
    amount: 1000,
    date: '2026-08-25',
    paymentMethod: 'Transferencia',
    reference: 'TRANS-BCO-902144',
    registeredBy: 'Secretaría Cobranzas',
    notes: 'Segundo abono según plan acordado',
    createdAt: '2026-08-25T11:15:00.000Z',
  },
  {
    id: 'PAG-5003',
    patientId: 'PAC-1002',
    patientName: 'Valeria Lucía Benítez',
    amount: 2500,
    date: '2026-08-01',
    paymentMethod: 'Transferencia',
    reference: 'TRANS-GAL-128790',
    registeredBy: 'Secretaría Cobranzas',
    notes: 'Pago inicial 50% honorarios y clínica',
    createdAt: '2026-08-01T09:20:00.000Z',
  },
  {
    id: 'PAG-5004',
    patientId: 'PAC-1002',
    patientName: 'Valeria Lucía Benítez',
    amount: 2000,
    date: '2026-08-28',
    paymentMethod: 'Efectivo',
    reference: 'REC-EF-4412',
    registeredBy: 'Secretaría Cobranzas',
    notes: 'Cancelación final entregada en consultorio',
    createdAt: '2026-08-28T16:45:00.000Z',
  },
  {
    id: 'PAG-5005',
    patientId: 'PAC-1003',
    patientName: 'Carolina Mendoza Paz',
    amount: 1500,
    date: '2026-08-20',
    paymentMethod: 'Tarjeta de Crédito',
    reference: 'POS-VISA-7788',
    registeredBy: 'Secretaría Cobranzas',
    notes: 'Pago de implantes y reserva quirúrgica',
    createdAt: '2026-08-20T17:00:00.000Z',
  },
  {
    id: 'PAG-5006',
    patientId: 'PAC-1004',
    patientName: 'Florencia Antonella Ruiz',
    amount: 950,
    date: '2026-09-02',
    paymentMethod: 'Transferencia',
    reference: 'TRANS-MP-551240',
    registeredBy: 'Secretaría Cobranzas',
    notes: 'Abono total procedimiento en consultorio',
    createdAt: '2026-09-02T18:10:00.000Z',
  },
  {
    id: 'PAG-5007',
    patientId: 'PAC-1005',
    patientName: 'Sofía Agustina Romero',
    amount: 600,
    date: '2026-08-15',
    paymentMethod: 'Efectivo',
    reference: 'REC-EF-4399',
    registeredBy: 'Secretaría Cobranzas',
    notes: 'Anticipo inicial reserva quirófano',
    createdAt: '2026-08-15T12:00:00.000Z',
  },
];

const INITIAL_REFUNDS: Refund[] = [
  {
    id: 'REI-3001',
    patientId: 'PAC-1003',
    patientName: 'Carolina Mendoza Paz',
    amount: 200,
    date: '2026-08-22',
    reason: 'Ajuste de presupuesto por bonificación especial de anestesia',
    refundMethod: 'Transferencia',
    reference: 'DEV-BCO-119283',
    registeredBy: 'Secretaría Cobranzas',
    createdAt: '2026-08-22T10:15:00.000Z',
  },
];

const STORAGE_KEYS = {
  PATIENTS: 'dr_belleza_patients_v1',
  PAYMENTS: 'dr_belleza_payments_v1',
  REFUNDS: 'dr_belleza_refunds_v1',
  SHEET_CONFIG: 'dr_belleza_sheet_config_v1',
  USERS: 'dr_belleza_users_v1',
  ACTIVE_USER_ID: 'dr_belleza_active_user_id_v1',
  PROCEDURES: 'dr_belleza_procedures_v1',
  COUPONS: 'dr_belleza_coupons_v1',
  BRANDING: 'dr_belleza_branding_v1',
  ROLE_PRIVILEGES: 'dr_belleza_role_privileges_v1',
};

export function loadLocalUsers(): SystemUser[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading users from localStorage', e);
  }
  return INITIAL_USERS;
}

export function saveLocalUsers(users: SystemUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage', e);
  }
}

export function loadActiveUserId(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (saved) return saved;
  } catch (e) {
    console.error('Error loading active user id', e);
  }
  return 'USR-101'; // Default: Dr. Jorge Apelencia (Super Admin)
}

export function saveActiveUserId(userId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  } catch (e) {
    console.error('Error saving active user id', e);
  }
}

export function loadLocalPatients(): Patient[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading patients from localStorage', e);
  }
  return INITIAL_PATIENTS;
}

export function saveLocalPatients(patients: Patient[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  } catch (e) {
    console.error('Error saving patients to localStorage', e);
  }
}

export function loadLocalPayments(): Payment[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading payments from localStorage', e);
  }
  return INITIAL_PAYMENTS;
}

export function saveLocalPayments(payments: Payment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error('Error saving payments to localStorage', e);
  }
}

export function loadLocalRefunds(): Refund[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.REFUNDS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading refunds from localStorage', e);
  }
  return INITIAL_REFUNDS;
}

export function saveLocalRefunds(refunds: Refund[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(refunds));
  } catch (e) {
    console.error('Error saving refunds to localStorage', e);
  }
}

export function loadGoogleSheetConfig(): GoogleSheetConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading sheet config from localStorage', e);
  }
  return {
    spreadsheetId: null,
    spreadsheetUrl: null,
    spreadsheetName: 'Dr. Belleza - Cobranza (Dr. Jorge Apelencia)',
    lastSyncTime: null,
    isSyncing: false,
    error: null,
  };
}

export function saveGoogleSheetConfig(config: GoogleSheetConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving sheet config to localStorage', e);
  }
}

export const INITIAL_PROCEDURES: SurgicalProcedure[] = [
  {
    id: 'PRC-001',
    code: 'QX-RINO',
    name: 'Rinoplastia Ultrasónica Estructural',
    category: 'Facial',
    basePrice: 3200,
    durationMinutes: 180,
    requiresOR: true,
    doctorCommissionPercent: 65,
    isActive: true,
    notes: 'Incluye tomografía postoperatoria y yeso termoplástico.',
  },
  {
    id: 'PRC-002',
    code: 'QX-LIPO-HD',
    name: 'Lipoescultura HD con Marcación',
    category: 'Corporal',
    basePrice: 4500,
    durationMinutes: 240,
    requiresOR: true,
    doctorCommissionPercent: 70,
    isActive: true,
    notes: 'Incluye faja postquirúrgica de compresión médica y drenajes linfáticos.',
  },
  {
    id: 'PRC-003',
    code: 'QX-MAMO',
    name: 'Mamoplastia de Aumento (Prótesis)',
    category: 'Corporal',
    basePrice: 3800,
    durationMinutes: 120,
    requiresOR: true,
    doctorCommissionPercent: 65,
    isActive: true,
    notes: 'Implantes Mentor / Motiva microtexturados con garantía de por vida.',
  },
  {
    id: 'PRC-004',
    code: 'QX-MASTO',
    name: 'Mastopexia con Implantes',
    category: 'Corporal',
    basePrice: 4200,
    durationMinutes: 180,
    requiresOR: true,
    doctorCommissionPercent: 65,
    isActive: true,
    notes: 'Levantamiento mamario con remodelación glandular y prótesis.',
  },
  {
    id: 'PRC-005',
    code: 'QX-BLEFARO',
    name: 'Blefaroplastia Superior e Inferior',
    category: 'Facial',
    basePrice: 1600,
    durationMinutes: 90,
    requiresOR: false,
    doctorCommissionPercent: 60,
    isActive: true,
    notes: 'Cirugía de párpados con anestesia local más sedación asistida.',
  },
  {
    id: 'PRC-006',
    code: 'QX-BICHET',
    name: 'Bichectomía Láser',
    category: 'Facial',
    basePrice: 950,
    durationMinutes: 45,
    requiresOR: false,
    doctorCommissionPercent: 60,
    isActive: true,
    notes: 'Resección de bolsas de Bichat en consultorio quirúrgico.',
  },
  {
    id: 'PRC-007',
    code: 'QX-ABDOMINO',
    name: 'Abdominoplastia con Plicatura',
    category: 'Corporal',
    basePrice: 4800,
    durationMinutes: 210,
    requiresOR: true,
    doctorCommissionPercent: 70,
    isActive: true,
    notes: 'Dermolipectomía abdominal con reparación de diástasis de rectos.',
  },
  {
    id: 'PRC-008',
    code: 'ME-ARMONIZ',
    name: 'Armonización Facial (Bótox + Rellenos)',
    category: 'Medicina Estética',
    basePrice: 850,
    durationMinutes: 60,
    requiresOR: false,
    doctorCommissionPercent: 55,
    isActive: true,
    notes: 'Protocolo integral: perfilado mandibular, pómulos y frente.',
  },
  {
    id: 'PRC-009',
    code: 'ME-LABIOS',
    name: 'Relleno de Labios con Ácido Hialurónico',
    category: 'Medicina Estética',
    basePrice: 350,
    durationMinutes: 30,
    requiresOR: false,
    doctorCommissionPercent: 50,
    isActive: true,
    notes: 'Juvéderm Ultra / Restylane Kysse 1ml.',
  },
  {
    id: 'PRC-010',
    code: 'ME-BOTOX',
    name: 'Toxina Botulínica Zona Completa',
    category: 'Medicina Estética',
    basePrice: 320,
    durationMinutes: 30,
    requiresOR: false,
    doctorCommissionPercent: 50,
    isActive: true,
    notes: 'Frente, entrecejo y patas de gallo con Botox Allergan 50UI.',
  },
];

export function loadLocalProcedures(): SurgicalProcedure[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading procedures from localStorage', e);
  }
  return INITIAL_PROCEDURES;
}

export function saveLocalProcedures(procedures: SurgicalProcedure[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(procedures));
  } catch (e) {
    console.error('Error saving procedures to localStorage', e);
  }
}

export const INITIAL_COUPONS: DiscountCoupon[] = [
  {
    id: 'CPN-001',
    code: 'BELLEZA10',
    description: '10% de descuento en tratamientos estéticos faciales',
    discountType: 'percentage',
    discountValue: 10,
    validUntil: '2026-12-31',
    maxUses: 50,
    currentUses: 8,
    isActive: true,
    minAmount: 300,
  },
  {
    id: 'CPN-002',
    code: 'VIP-PACIENTE',
    description: '$300 USD de bonificación especial en procedimientos quirúrgicos',
    discountType: 'fixed',
    discountValue: 300,
    validUntil: '2026-11-30',
    maxUses: 20,
    currentUses: 4,
    isActive: true,
    minAmount: 2500,
  },
  {
    id: 'CPN-003',
    code: 'AMIGA-QX',
    description: '$200 USD de descuento por referida quirúrgica comprobada',
    discountType: 'fixed',
    discountValue: 200,
    validUntil: '2026-12-31',
    maxUses: 15,
    currentUses: 2,
    isActive: true,
    minAmount: 2000,
  },
  {
    id: 'CPN-004',
    code: 'VERANO2026',
    description: '15% de descuento en procedimientos corporales combinados',
    discountType: 'percentage',
    discountValue: 15,
    validUntil: '2026-10-31',
    maxUses: 30,
    currentUses: 12,
    isActive: true,
    minAmount: 3500,
  },
];

export function loadLocalCoupons(): DiscountCoupon[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading coupons from localStorage', e);
  }
  return INITIAL_COUPONS;
}

export function saveLocalCoupons(coupons: DiscountCoupon[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  } catch (e) {
    console.error('Error saving coupons to localStorage', e);
  }
}

export const INITIAL_BRANDING: AppBrandingConfig = {
  clinicName: 'Dr. Belleza',
  tagline: 'Cobranza & Cirugía Plástica',
  doctorName: 'Dr. Jorge Apelencia',
  specialty: 'Cirugía Plástica, Estética & Reparadora',
  phone: '+54 9 11 4567-8900',
  address: 'Av. Libertador 5420, Piso 8, Consultorio A',
  logoIcon: 'Sparkles',
  primaryColorHex: '#25D366',
};

export function loadLocalBranding(): AppBrandingConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BRANDING);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading branding from localStorage', e);
  }
  return INITIAL_BRANDING;
}

export function saveLocalBranding(branding: AppBrandingConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(branding));
  } catch (e) {
    console.error('Error saving branding to localStorage', e);
  }
}

export const INITIAL_ROLE_PRIVILEGES: RolePrivilege[] = [
  {
    role: 'super_admin',
    roleLabel: 'Super Administrador (Director Titular)',
    canViewDashboard: true,
    canManagePatients: true,
    canRegisterPayments: true,
    canRegisterRefunds: true,
    canManageUsers: true,
    canManageSettings: true,
    canAccessGoogleSheets: true,
    canExportReports: true,
  },
  {
    role: 'admin',
    roleLabel: 'Administrador General',
    canViewDashboard: true,
    canManagePatients: true,
    canRegisterPayments: true,
    canRegisterRefunds: true,
    canManageUsers: true,
    canManageSettings: true,
    canAccessGoogleSheets: false,
    canExportReports: true,
  },
  {
    role: 'medico',
    roleLabel: 'Médico Cirujano Adjunto',
    canViewDashboard: true,
    canManagePatients: true,
    canRegisterPayments: false,
    canRegisterRefunds: false,
    canManageUsers: false,
    canManageSettings: false,
    canAccessGoogleSheets: false,
    canExportReports: true,
  },
  {
    role: 'financiero',
    roleLabel: 'Responsable Financiero & Cobranzas',
    canViewDashboard: true,
    canManagePatients: true,
    canRegisterPayments: true,
    canRegisterRefunds: true,
    canManageUsers: false,
    canManageSettings: false,
    canAccessGoogleSheets: false,
    canExportReports: true,
  },
  {
    role: 'asistente',
    roleLabel: 'Secretaría de Consultorio & Recepción',
    canViewDashboard: true,
    canManagePatients: true,
    canRegisterPayments: true,
    canRegisterRefunds: false,
    canManageUsers: false,
    canManageSettings: false,
    canAccessGoogleSheets: false,
    canExportReports: false,
  },
];

export function loadLocalRolePrivileges(): RolePrivilege[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE_PRIVILEGES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading role privileges from localStorage', e);
  }
  return INITIAL_ROLE_PRIVILEGES;
}

export function saveLocalRolePrivileges(privileges: RolePrivilege[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROLE_PRIVILEGES, JSON.stringify(privileges));
  } catch (e) {
    console.error('Error saving role privileges to localStorage', e);
  }
}
