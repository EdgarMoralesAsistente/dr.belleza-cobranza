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
  FinancingPlan,
  CRMEvent,
  PatientProcedureItem,
  ScheduledPayment,
} from '../types';

export const EDGAR_SUPER_ADMIN_ID = 'USR-SUPER-EDGAR';

export const EDGAR_SUPER_ADMIN_USER: SystemUser = {
  id: EDGAR_SUPER_ADMIN_ID,
  fullName: 'Edgar Morales',
  email: 'edgar@morales.com',
  password: '12697670',
  role: 'super_admin',
  phone: '+5491145678900',
  isActive: true,
  isImmutable: true,
  createdAt: '2026-01-01',
  lastLogin: 'En línea',
  notes: 'Super Administrador Titular del Sistema. Usuario permanente con acceso irrestricto e inmutable.',
};

export const INITIAL_USERS: SystemUser[] = [
  EDGAR_SUPER_ADMIN_USER,
  {
    id: 'USR-101',
    fullName: 'Dr. Jorge Apelencia',
    email: 'jorge.apelencia@drbelleza.com',
    password: 'jorge2026',
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
    password: 'marcela2026',
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
    password: 'carlos2026',
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
    password: 'esteban2026',
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
    password: 'luciana2026',
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
    email: 'mariana.silva@gmail.com',
    city: 'Buenos Aires (CABA)',
    campaign: 'Instagram Ads - Rinoplastia',
    procedure: 'Rinoplastia Ultrasónica Estructural',
    doctor: 'Dr. Jorge Apelencia',
    totalCost: 3200,
    totalPaid: 2000,
    balance: 1200,
    registrationDate: '2026-08-10',
    nextPaymentDate: '2026-09-15',
    status: 'pending',
    notes: 'Presupuesto congelado. Saldo restante contra fecha quirúrgica de Octubre.',
    financingPlanId: 'PLAN-001',
    financingPlanName: 'Plan 6 Meses - Mensual (Sin Interés)',
    financingMonths: 6,
    financingFrequency: 'Mensual',
    financingInstallmentsCount: 6,
    financingInstallmentAmount: 200,
  },
  {
    id: 'PAC-1002',
    fullName: 'Valeria Lucía Benítez',
    phone: '+5491167891234',
    idNumber: '40.112.543',
    email: 'valeria.benitez@hotmail.com',
    city: 'Córdoba',
    campaign: 'Google Ads Search',
    procedure: 'Lipoescultura HD con Marcación',
    doctor: 'Dr. Jorge Apelencia',
    totalCost: 4500,
    totalPaid: 4500,
    balance: 0,
    registrationDate: '2026-08-01',
    status: 'paid',
    notes: 'Cancelación total completada. Quirófano asignado para el 20 de Septiembre.',
    financingPlanId: 'PLAN-006',
    financingPlanName: 'Pago Contado / En Una Sola Cuota',
    financingMonths: 1,
    financingFrequency: 'Mensual',
    financingInstallmentsCount: 1,
    financingInstallmentAmount: 4500,
  },
  {
    id: 'PAC-1003',
    fullName: 'Carolina Mendoza Paz',
    phone: '+5491189012345',
    idNumber: '35.981.442',
    email: 'carolina.mendoza@yahoo.com',
    city: 'Rosario',
    campaign: 'TikTok Ads - Cirugías',
    procedure: 'Mamoplastia de Aumento (Mentor 350cc)',
    doctor: 'Dr. Jorge Apelencia',
    totalCost: 3800,
    totalPaid: 1500,
    balance: 2300,
    registrationDate: '2026-08-20',
    nextPaymentDate: '2026-09-10',
    status: 'pending',
    notes: 'Abonó reserva de prótesis y reserva de quirófano. Cuota 2 pendiente.',
    financingPlanId: 'PLAN-003',
    financingPlanName: 'Plan 12 Meses - Quincenal',
    financingMonths: 12,
    financingFrequency: 'Quincenal',
    financingInstallmentsCount: 24,
    financingInstallmentAmount: 95.83,
  },
  {
    id: 'PAC-1004',
    fullName: 'Florencia Antonella Ruiz',
    phone: '+5491123456789',
    idNumber: '42.330.129',
    email: 'flor.ruiz@gmail.com',
    city: 'Buenos Aires (La Plata)',
    campaign: 'Referido de Paciente',
    procedure: 'Armonización Facial (Bótox + Ácido Hialurónico)',
    doctor: 'Dr. Jorge Apelencia',
    totalCost: 950,
    totalPaid: 950,
    balance: 0,
    registrationDate: '2026-09-02',
    status: 'paid',
    notes: 'Tratamiento ambulatorio en consultorio realizado.',
    financingPlanId: 'PLAN-006',
    financingPlanName: 'Pago Contado / En Una Sola Cuota',
    financingMonths: 1,
    financingFrequency: 'Mensual',
    financingInstallmentsCount: 1,
    financingInstallmentAmount: 950,
  },
  {
    id: 'PAC-1005',
    fullName: 'Sofía Agustina Romero',
    phone: '+5491134567890',
    idNumber: '39.022.901',
    email: 'sofia.romero@outlook.com',
    city: 'Mendoza',
    campaign: 'Campaña Blefaro Verano',
    procedure: 'Blefaroplastia Superior e Inferior',
    doctor: 'Dr. Jorge Apelencia',
    totalCost: 2100,
    totalPaid: 600,
    balance: 1500,
    registrationDate: '2026-08-15',
    nextPaymentDate: '2026-09-05',
    status: 'overdue',
    notes: 'Fecha de pago de saldo vencida hace 3 días. Enviar recordatorio WhatsApp.',
    financingPlanId: 'PLAN-001',
    financingPlanName: 'Plan 6 Meses - Mensual (Sin Interés)',
    financingMonths: 6,
    financingFrequency: 'Mensual',
    financingInstallmentsCount: 6,
    financingInstallmentAmount: 250,
  },
  {
    id: 'PAC-1006',
    fullName: 'María Camila Silva',
    phone: '+5491155443322',
    idNumber: '37.892.401',
    email: 'mariacamila.silva@gmail.com',
    city: 'Buenos Aires (CABA)',
    campaign: 'Instagram Ads - Rinoplastia',
    procedure: 'Rinoplastia Ultrasónica Estructural',
    doctor: 'Dr. Jorge Apelencia',
    originalSubtotal: 3200,
    discountPercent: 15,
    discountAmount: 480,
    couponCode: 'VERANO2026',
    couponDiscount: 100,
    totalDiscount: 580,
    totalCost: 2620,
    totalPaid: 1500,
    balance: 1120,
    registrationDate: '2026-08-12',
    nextPaymentDate: '2026-09-20',
    status: 'pending',
    notes: 'Descuento del 15% ($480 USD) y cupón VERANO2026 ($100 USD) aplicados simultáneamente sobre el total de la cirugía ($3,200).',
    financingPlanId: 'PLAN-001',
    financingPlanName: 'Plan 6 Meses - Mensual (Sin Interés)',
    financingMonths: 6,
    financingFrequency: 'Mensual',
    financingInstallmentsCount: 6,
    financingInstallmentAmount: 186.67,
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
    notes: 'Abono inicial de reserva de fecha',
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
  {
    id: 'PAG-5008',
    patientId: 'PAC-1006',
    patientName: 'María Camila Silva',
    amount: 1500,
    date: '2026-08-12',
    paymentMethod: 'Transferencia',
    reference: 'TRANS-BCO-771822',
    registeredBy: 'Secretaría Cobranzas',
    notes: 'Abono inicial de seña de quirófano con descuento aplicado',
    createdAt: '2026-08-12T15:30:00.000Z',
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
  FINANCING_PLANS: 'dr_belleza_financing_plans_v1',
  CRM_EVENTS: 'dr_belleza_crm_events_v1',
};

export function loadLocalUsers(): SystemUser[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    let userList: SystemUser[] = saved ? JSON.parse(saved) : INITIAL_USERS;

    // Asegurar que Edgar Morales siempre exista, con su contraseña y marcado como inmutable
    const hasEdgar = userList.some(
      (u) => u.id === EDGAR_SUPER_ADMIN_ID || u.email.toLowerCase() === 'edgar@morales.com'
    );
    if (!hasEdgar) {
      userList = [EDGAR_SUPER_ADMIN_USER, ...userList];
    } else {
      userList = userList.map((u) => {
        if (u.id === EDGAR_SUPER_ADMIN_ID || u.email.toLowerCase() === 'edgar@morales.com') {
          return {
            ...u,
            id: EDGAR_SUPER_ADMIN_ID,
            fullName: 'Edgar Morales',
            email: 'edgar@morales.com',
            password: u.password || '12697670',
            role: 'super_admin' as const,
            isActive: true,
            isImmutable: true,
          };
        }
        return u;
      });
    }

    return userList;
  } catch (e) {
    console.error('Error loading users from localStorage', e);
  }
  return INITIAL_USERS;
}

export function saveLocalUsers(users: SystemUser[]): void {
  try {
    // Blindaje de seguridad: Edgar Morales NUNCA puede ser omitido ni borrado
    let safeUsers = [...users];
    const hasEdgar = safeUsers.some(
      (u) => u.id === EDGAR_SUPER_ADMIN_ID || u.email.toLowerCase() === 'edgar@morales.com'
    );
    if (!hasEdgar) {
      safeUsers = [EDGAR_SUPER_ADMIN_USER, ...safeUsers];
    } else {
      safeUsers = safeUsers.map((u) => {
        if (u.id === EDGAR_SUPER_ADMIN_ID || u.email.toLowerCase() === 'edgar@morales.com') {
          return {
            ...u,
            id: EDGAR_SUPER_ADMIN_ID,
            fullName: 'Edgar Morales',
            email: 'edgar@morales.com',
            role: 'super_admin' as const,
            isActive: true,
            isImmutable: true,
          };
        }
        return u;
      });
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(safeUsers));
  } catch (e) {
    console.error('Error saving users to localStorage', e);
  }
}

export function loadActiveUserId(): string | null {
  try {
    // Check sessionStorage first so that every fresh URL visit requests login
    const sessionUser = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (sessionUser) return sessionUser;
    
    // Also remove legacy hardcoded localStorage key to avoid auto-login
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
  } catch (e) {
    console.error('Error loading active user id', e);
  }
  return null; // Require login upon accessing the application
}

export function saveActiveUserId(userId: string | null): void {
  try {
    if (userId) {
      sessionStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    }
  } catch (e) {
    console.error('Error saving active user id', e);
  }
}

export function loadLocalPatients(): Patient[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (saved) {
      const list: Patient[] = JSON.parse(saved);
      // Garantizar que el caso de referencia María Camila Silva tenga su descuento aplicado correctamente
      const mariaIdx = list.findIndex(
        (p) => p.fullName.toLowerCase().includes('camila silva') || p.id === 'PAC-1006'
      );
      if (mariaIdx >= 0) {
        const maria = list[mariaIdx];
        if (!maria.discountPercent || maria.totalCost === 3200) {
          maria.originalSubtotal = 3200;
          maria.discountPercent = 15;
          maria.discountAmount = 480;
          maria.couponCode = 'VERANO2026';
          maria.couponDiscount = 100;
          maria.totalDiscount = 580;
          maria.totalCost = 2620;
          maria.balance = Math.max(0, 2620 - (maria.totalPaid || 0));
          list[mariaIdx] = maria;
        }
      } else {
        const mariaInitial = INITIAL_PATIENTS.find((p) => p.id === 'PAC-1006');
        if (mariaInitial) {
          list.push(mariaInitial);
        }
      }
      return list;
    }
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
    if (saved) {
      const list: Payment[] = JSON.parse(saved);
      if (!list.some((p) => p.id === 'PAG-5008' || p.patientName.toLowerCase().includes('camila silva'))) {
        const pagInitial = INITIAL_PAYMENTS.find((p) => p.id === 'PAG-5008');
        if (pagInitial) list.push(pagInitial);
      }
      return list;
    }
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

export const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbxwr5X__7RdF8M1ytVUs4RWEuiLyIIHMWHOsh3tFgoPe3xveKgJ6ydTw61H_owOkilGzg/exec';

// URLs de versiones anteriores de Apps Script que deben migrarse automáticamente a la versión actual
export const LEGACY_GAS_URLS = [
  'https://script.google.com/macros/s/AKfycbx6ca4jfxraaRb0GnfwKSTpMshf56XuQ8WLsvVYj5kKKPiTBSZIuO4laddN_BUVf6dabg/exec',
];

export function getEffectiveGasUrl(): string | null {
  const envUrl =
    (import.meta as any).env?.GOOGLE_APPS_SCRIPT_URL ||
    (import.meta as any).env?.VITE_GOOGLE_APPS_SCRIPT_URL ||
    (import.meta as any).env?.GAS_URL ||
    (import.meta as any).env?.GOOGLE_SHEETS_URL ||
    (import.meta as any).env?.SHEETS_URL ||
    (typeof process !== 'undefined' && (process.env?.GOOGLE_APPS_SCRIPT_URL || process.env?.VITE_GOOGLE_APPS_SCRIPT_URL || process.env?.GAS_URL || process.env?.GOOGLE_SHEETS_URL));
  if (typeof envUrl === 'string' && envUrl.trim().startsWith('https://script.google.com/')) {
    return envUrl.trim();
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed?.gasDeploymentUrl === 'string' && parsed.gasDeploymentUrl.trim().startsWith('https://script.google.com/')) {
        const url = parsed.gasDeploymentUrl.trim();
        // Si el usuario tenía en caché una versión obsoleta anterior, migrarla a la versión actual
        if (LEGACY_GAS_URLS.includes(url) || url.includes('AKfycbx6ca4jfxraa')) {
          parsed.gasDeploymentUrl = DEFAULT_GAS_URL;
          localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(parsed));
          return DEFAULT_GAS_URL;
        }
        return url;
      }
    }
  } catch {}
  return DEFAULT_GAS_URL;
}

export function loadGoogleSheetConfig(): GoogleSheetConfig {
  const envGasUrl = getEffectiveGasUrl() || DEFAULT_GAS_URL;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        !parsed.gasDeploymentUrl ||
        !parsed.gasDeploymentUrl.trim().startsWith('https://script.google.com/') ||
        LEGACY_GAS_URLS.includes(parsed.gasDeploymentUrl.trim()) ||
        parsed.gasDeploymentUrl.includes('AKfycbx6ca4jfxraa')
      ) {
        parsed.gasDeploymentUrl = envGasUrl;
        localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(parsed));
      }
      if (!parsed.syncMode) {
        parsed.syncMode = parsed.gasDeploymentUrl ? 'apps_script' : 'direct_oauth';
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading sheet config from localStorage', e);
  }
  return {
    spreadsheetId: '1KSOBEjOSYxH7qluhMB9fmcbLaol0_QpOd9lBv9Ks8M4',
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1KSOBEjOSYxH7qluhMB9fmcbLaol0_QpOd9lBv9Ks8M4/edit',
    spreadsheetName: 'Dr. Belleza - Cobranza & Gestión',
    gasDeploymentUrl: envGasUrl,
    syncMode: 'apps_script',
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
    category: 'Extra',
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
    category: 'Extra',
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
    category: 'Extra',
    basePrice: 320,
    durationMinutes: 30,
    requiresOR: false,
    doctorCommissionPercent: 50,
    isActive: true,
    notes: 'Frente, entrecejo y patas de gallo con Botox Allergan 50UI.',
  },
  {
    id: 'PRC-011',
    code: 'QX-LIPO-GLU',
    name: 'Lipoinyección Glútea',
    category: 'Corporal',
    basePrice: 1000,
    durationMinutes: 90,
    requiresOR: true,
    doctorCommissionPercent: 65,
    isActive: true,
    notes: 'Transferencia grasa autóloga a glúteos.',
  },
  {
    id: 'PRC-012',
    code: 'EX-PROTESIS',
    name: 'Prótesis Mamaria',
    category: 'Extra',
    basePrice: 500,
    durationMinutes: 30,
    requiresOR: false,
    doctorCommissionPercent: 0,
    isActive: true,
    notes: 'Insumo especial categoría Extra (Exento de descuentos y cupones).',
  },
];

export function loadLocalProcedures(): SurgicalProcedure[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
    if (saved) {
      const parsed: SurgicalProcedure[] = JSON.parse(saved);
      // Ensure all INITIAL_PROCEDURES exist so newly added ones (like Lipoinyección or Prótesis Mamaria) are available
      const existingCodes = new Set(parsed.map((p) => p.code));
      const missing = INITIAL_PROCEDURES.filter((p) => !existingCodes.has(p.code));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
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

/**
 * Obtiene el desglose discriminado de procedimientos entre sujetos a descuento y exentos (categoría 'Extra').
 */
export function getPatientProcedureBreakdown(
  patient: Patient,
  proceduresCatalog: SurgicalProcedure[] = []
): {
  items: PatientProcedureItem[];
  discountableSubtotal: number;
  exemptSubtotal: number;
  grossSubtotal: number;
} {
  // 1. Si la paciente ya posee procedureItems guardados, usarlos
  if (patient.procedureItems && patient.procedureItems.length > 0) {
    const items = patient.procedureItems.map((item) => ({
      ...item,
      isExtra: item.isExtra ?? item.category === 'Extra',
    }));
    const discountableSubtotal = items
      .filter((i) => !i.isExtra && i.category !== 'Extra')
      .reduce((acc, i) => acc + i.basePrice, 0);
    const exemptSubtotal = items
      .filter((i) => i.isExtra || i.category === 'Extra')
      .reduce((acc, i) => acc + i.basePrice, 0);
    return {
      items,
      discountableSubtotal,
      exemptSubtotal,
      grossSubtotal: discountableSubtotal + exemptSubtotal,
    };
  }

  // 2. Si no, reconstruir a partir del texto del procedimiento (ej: "Lipoinyección Glútea + Prótesis Mamaria")
  const catalog = proceduresCatalog.length > 0 ? proceduresCatalog : INITIAL_PROCEDURES;
  const parts = patient.procedure ? patient.procedure.split(' + ').map((s) => s.trim()).filter(Boolean) : [];

  const items: PatientProcedureItem[] = [];
  let foundExemptSum = 0;
  let foundRegularSum = 0;

  parts.forEach((name) => {
    const matched = catalog.find(
      (p) =>
        p.name.toLowerCase() === name.toLowerCase() ||
        p.code.toLowerCase() === name.toLowerCase()
    );
    if (matched) {
      const isExtra = matched.category === 'Extra';
      items.push({
        id: matched.id,
        code: matched.code,
        name: matched.name,
        category: matched.category,
        basePrice: matched.basePrice,
        isExtra,
      });
      if (isExtra) foundExemptSum += matched.basePrice;
      else foundRegularSum += matched.basePrice;
    } else {
      const isLikelyExtra =
        name.toLowerCase().includes('extra') ||
        name.toLowerCase().includes('prótesis') ||
        name.toLowerCase().includes('protesis');
      const estPrice = Math.round(
        (patient.originalSubtotal || patient.totalCost) / Math.max(1, parts.length)
      );
      items.push({
        name,
        category: isLikelyExtra ? 'Extra' : 'Corporal',
        basePrice: estPrice,
        isExtra: isLikelyExtra,
      });
      if (isLikelyExtra) foundExemptSum += estPrice;
      else foundRegularSum += estPrice;
    }
  });

  const exemptSubtotal =
    patient.exemptSubtotal !== undefined ? patient.exemptSubtotal : foundExemptSum;
  const discountableSubtotal =
    patient.discountableSubtotal !== undefined
      ? patient.discountableSubtotal
      : (patient.originalSubtotal || patient.totalCost) - exemptSubtotal;

  return {
    items,
    discountableSubtotal: Math.max(0, discountableSubtotal),
    exemptSubtotal: Math.max(0, exemptSubtotal),
    grossSubtotal: patient.originalSubtotal || patient.totalCost,
  };
}

/**
 * Construye o reconstruye el cronograma completo de cuotas de una paciente según su plan de financiamiento.
 */
export function buildInitialPaymentSchedule(patient: Patient): ScheduledPayment[] {
  if (patient.paymentSchedule && patient.paymentSchedule.length > 0) {
    return patient.paymentSchedule.map((s) => ({ ...s }));
  }

  const frequency = patient.financingFrequency || 'Mensual';
  let totalCount = patient.financingInstallmentsCount || 0;
  if (!totalCount && patient.financingMonths) {
    totalCount = frequency === 'Quincenal' ? patient.financingMonths * 2 : frequency === 'Semanal' ? patient.financingMonths * 4 : patient.financingMonths;
  }
  if (!totalCount && patient.financingPlanName) {
    const match = patient.financingPlanName.match(/(\d+)\s*(?:mes|meses|cuota|cuotas)/i);
    if (match) {
      const parsed = parseInt(match[1], 10);
      totalCount = frequency === 'Quincenal' ? parsed * 2 : frequency === 'Semanal' ? parsed * 4 : parsed;
    }
  }
  if (!totalCount && patient.financingPlanId) {
    const planMatch = INITIAL_FINANCING_PLANS.find((p) => p.id === patient.financingPlanId);
    if (planMatch) totalCount = planMatch.installmentsCount;
  }
  if (!totalCount && patient.financingInstallmentAmount && patient.financingInstallmentAmount > 0) {
    totalCount = Math.max(1, Math.round(patient.totalCost / patient.financingInstallmentAmount));
  }
  if (!totalCount) {
    totalCount = patient.totalCost > 1500 ? 6 : patient.totalCost > 500 ? 3 : 1;
  }

  const baseDate = patient.nextPaymentDate ? new Date(patient.nextPaymentDate) : new Date();
  const schedule: ScheduledPayment[] = [];
  const baseCost = patient.totalCost;
  const baseAmount = Math.floor(baseCost / totalCount);
  const remainder = baseCost - baseAmount * totalCount;

  for (let i = 0; i < totalCount; i++) {
    const nextDate = new Date(baseDate);
    if (frequency === 'Semanal') {
      nextDate.setDate(nextDate.getDate() + i * 7);
    } else if (frequency === 'Quincenal') {
      nextDate.setDate(nextDate.getDate() + i * 15);
    } else {
      nextDate.setMonth(nextDate.getMonth() + i);
    }

    schedule.push({
      installmentNumber: i + 1,
      dueDate: nextDate.toISOString().split('T')[0],
      amount: i === totalCount - 1 ? baseAmount + remainder : baseAmount,
      status: 'pending',
    });
  }

  // Si la paciente ya tenía algún totalPaid previo, marcar las cuotas correspondientes como pagadas
  if (patient.totalPaid > 0) {
    let paidCover = patient.totalPaid;
    for (let i = 0; i < schedule.length; i++) {
      if (paidCover >= schedule[i].amount) {
        schedule[i].status = 'paid';
        paidCover -= schedule[i].amount;
      } else if (paidCover > 0) {
        schedule[i].amount = Math.max(0, schedule[i].amount - paidCover);
        paidCover = 0;
      }
    }
  }

  return schedule;
}

/**
 * Recalcula el saldo total y el monto de las futuras cuotas pendientes cuando una paciente
 * realiza un pago. Si el pago supera el valor establecido de la cuota (o amortiza deuda),
 * el saldo remanente se distribuye equitativamente reduciendo el monto de TODAS las cuotas
 * pendientes futuras en el cronograma.
 */
export function recalculatePatientOnPayment(
  patient: Patient,
  paymentAmount: number,
  paymentDate: string
): Patient {
  const newPaid = patient.totalPaid + paymentAmount;
  const newBalance = Math.max(0, patient.totalCost - newPaid);
  const newStatus: Patient['status'] =
    newBalance <= 0 ? 'paid' : patient.status === 'overdue' ? 'pending' : patient.status;

  // Obtener o construir el cronograma completo de la paciente
  let schedule = buildInitialPaymentSchedule(patient);

  if (schedule.length > 0) {
    // Buscar la primera cuota pendiente
    const firstPendingIdx = schedule.findIndex((s) => s.status !== 'paid');

    if (firstPendingIdx !== -1) {
      // Marcar esta cuota actual como pagada con el abono registrado
      schedule[firstPendingIdx].status = 'paid';
      schedule[firstPendingIdx].notes = `Abono de $${paymentAmount.toLocaleString('es-AR')} USD registrado el ${paymentDate}`;

      // Cuotas pendientes posteriores a la que se acaba de abonar
      const futureInstallments = schedule
        .slice(firstPendingIdx + 1)
        .filter((s) => s.status !== 'paid');

      if (newBalance <= 0) {
        // Cuenta totalmente saldada: todas las futuras cuotas se cancelan a $0
        futureInstallments.forEach((inst) => {
          inst.status = 'paid';
          inst.amount = 0;
          inst.notes = 'Cancelada por saldo total anticipado';
        });
      } else if (futureInstallments.length > 0) {
        // AMORTIZACIÓN AUTOMÁTICA:
        // Distribuir el nuevo saldo remanente equitativamente entre TODAS las cuotas futuras pendientes
        const count = futureInstallments.length;
        const baseAmt = Math.floor(newBalance / count);
        const remainder = newBalance - baseAmt * count;

        futureInstallments.forEach((inst, idx) => {
          inst.amount = baseAmt + (idx === count - 1 ? remainder : 0);
          inst.status = 'pending';
          inst.notes = 'Cuota reducida por amortización de abono extraordinario';
        });
      } else {
        // No quedaban cuotas pero aún resta saldo pendiente
        schedule.push({
          installmentNumber: schedule.length + 1,
          dueDate: patient.nextPaymentDate || paymentDate,
          amount: newBalance,
          status: 'pending',
          notes: 'Saldo remanente pendiente',
        });
      }
    } else {
      // Todas estaban marcadas pagadas previamente pero hubo saldo
      if (newBalance > 0) {
        schedule.push({
          installmentNumber: schedule.length + 1,
          dueDate: patient.nextPaymentDate || paymentDate,
          amount: newBalance,
          status: 'pending',
          notes: 'Saldo remanente ajustado',
        });
      }
    }
  }

  // Buscar la siguiente cuota pendiente y su nuevo monto reducido
  const remainingPendingInstallments = schedule.filter((s) => s.status !== 'paid');
  const nextPending = remainingPendingInstallments[0];
  const newInstallmentAmount =
    newBalance <= 0
      ? 0
      : nextPending
      ? nextPending.amount
      : remainingPendingInstallments.length > 0
      ? Math.round(newBalance / remainingPendingInstallments.length)
      : patient.financingInstallmentAmount || 0;

  const nextPaymentDate =
    newBalance <= 0 ? undefined : (nextPending?.dueDate || patient.nextPaymentDate);

  return {
    ...patient,
    totalPaid: newPaid,
    balance: newBalance,
    status: newStatus,
    financingInstallmentAmount: newInstallmentAmount,
    nextPaymentDate,
    paymentSchedule: schedule,
  };
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

export const INITIAL_FINANCING_PLANS: FinancingPlan[] = [
  {
    id: 'PLAN-001',
    name: 'Plan 6 Meses - Mensual (Sin Interés)',
    months: 6,
    frequency: 'Mensual',
    installmentsCount: 6,
    interestRatePercent: 0,
    downPaymentPercent: 20,
    isActive: true,
    description: 'Financiamiento directo en 6 cuotas mensuales fijas sin recargo, con 20% de abono inicial para congelar valor.',
  },
  {
    id: 'PLAN-002',
    name: 'Plan 12 Meses - Mensual',
    months: 12,
    frequency: 'Mensual',
    installmentsCount: 12,
    interestRatePercent: 8,
    downPaymentPercent: 15,
    isActive: true,
    description: '12 cuotas mensuales accesibles con tasa reducida de consultorio para cirugías estéticas.',
  },
  {
    id: 'PLAN-003',
    name: 'Plan 12 Meses - Quincenal',
    months: 12,
    frequency: 'Quincenal',
    installmentsCount: 24,
    interestRatePercent: 5,
    downPaymentPercent: 10,
    isActive: true,
    description: '24 pagos quincenales coincidentes con fechas de cobro salarial de la paciente.',
  },
  {
    id: 'PLAN-004',
    name: 'Plan 24 Meses - Mensual (Extendido)',
    months: 24,
    frequency: 'Mensual',
    installmentsCount: 24,
    interestRatePercent: 12,
    downPaymentPercent: 20,
    isActive: true,
    description: 'Plan a largo plazo con cuota mínima súper reducida para cirugías corporales o combinadas.',
  },
  {
    id: 'PLAN-005',
    name: 'Plan 3 Meses - Semanal (Pre-quirófano)',
    months: 3,
    frequency: 'Semanal',
    installmentsCount: 12,
    interestRatePercent: 0,
    downPaymentPercent: 25,
    isActive: true,
    description: '12 abonos semanales rápidos con 0% de recargo hasta completar la fecha quirúrgica.',
  },
  {
    id: 'PLAN-006',
    name: 'Plan 6 Meses - Quincenal',
    months: 6,
    frequency: 'Quincenal',
    installmentsCount: 12,
    interestRatePercent: 0,
    downPaymentPercent: 20,
    isActive: true,
    description: '12 pagos quincenales sin interés previo al ingreso a quirófano.',
  },
  {
    id: 'PLAN-007',
    name: 'Pago Contado / En Una Sola Cuota',
    months: 1,
    frequency: 'Mensual',
    installmentsCount: 1,
    interestRatePercent: 0,
    downPaymentPercent: 100,
    isActive: true,
    description: 'Cancelación total en un solo abono de contado (Transferencia o Efectivo).',
  },
];

export function loadLocalFinancingPlans(): FinancingPlan[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.FINANCING_PLANS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading financing plans from localStorage', e);
  }
  return INITIAL_FINANCING_PLANS;
}

export function saveLocalFinancingPlans(plans: FinancingPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FINANCING_PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error('Error saving financing plans to localStorage', e);
  }
}

export const INITIAL_CRM_EVENTS: CRMEvent[] = [
  {
    id: 'CRM-INIT-1',
    patientId: 'PAC-1001',
    patientName: 'Mariana Silva Gómez',
    patientPhone: '+5491145678901',
    type: 'notificacion_cobro',
    title: 'Aviso Previo: Cuota #1/6 ($200 USD)',
    description: 'Enviar recordatorio por WhatsApp 48h antes del vencimiento. Plan 6 Meses Sin Interés.',
    dueDate: '2026-09-13',
    dueTime: '09:30',
    status: 'pending',
    priority: 'media',
    amount: 200,
    installmentNumber: 1,
    totalInstallments: 6,
    procedure: 'Rinoplastia Ultrasónica Estructural',
    createdAt: '2026-08-10T10:00:00.000Z',
    channel: 'whatsapp',
    assignedTo: 'Luciana Gómez (Secretaría)',
  },
  {
    id: 'CRM-INIT-2',
    patientId: 'PAC-1001',
    patientName: 'Mariana Silva Gómez',
    patientPhone: '+5491145678901',
    type: 'vencimiento_cuota',
    title: 'Vencimiento Cuota #1/6 ($200 USD)',
    description: 'Cobro de la primera cuota pactada. Solicitar comprobante de transferencia bancaria.',
    dueDate: '2026-09-15',
    dueTime: '11:00',
    status: 'pending',
    priority: 'alta',
    amount: 200,
    installmentNumber: 1,
    totalInstallments: 6,
    procedure: 'Rinoplastia Ultrasónica Estructural',
    createdAt: '2026-08-10T10:00:00.000Z',
    channel: 'whatsapp',
    assignedTo: 'Cdr. Esteban Morales (Finanzas)',
  },
  {
    id: 'CRM-INIT-3',
    patientId: 'PAC-1003',
    patientName: 'Camila Andrea Roldán',
    patientPhone: '+5491134567890',
    type: 'vencimiento_cuota',
    title: 'Vencimiento Cobro Cuota #2 ($250 USD)',
    description: 'Vence hoy la 2da cuota quincenal de aumento mamario. Confirmar acreditación en cuenta bancaria.',
    dueDate: '2026-09-09',
    dueTime: '10:00',
    status: 'in_progress',
    priority: 'alta',
    amount: 250,
    installmentNumber: 2,
    totalInstallments: 6,
    procedure: 'Mastopexia con Implantes Mentor',
    createdAt: '2026-08-15T14:30:00.000Z',
    channel: 'whatsapp',
    assignedTo: 'Luciana Gómez (Secretaría)',
  },
  {
    id: 'CRM-INIT-4',
    patientId: 'PAC-1002',
    patientName: 'Valeria Lucía Benítez',
    patientPhone: '+5491167891234',
    type: 'seguimiento_medico',
    title: 'Chequeo de Analíticas y Turno Quirófano',
    description: 'Revisar analíticas de coagulación y electrocardiograma. Quirófano programado para 20-Sept.',
    dueDate: '2026-09-10',
    dueTime: '16:00',
    status: 'pending',
    priority: 'media',
    procedure: 'Lipoescultura HD con Marcación',
    createdAt: '2026-08-01T12:00:00.000Z',
    channel: 'llamada',
    assignedTo: 'Lic. Marcela Vega (Admin)',
  },
  {
    id: 'CRM-INIT-5',
    patientId: 'PAC-1001',
    patientName: 'Mariana Silva Gómez',
    patientPhone: '+5491145678901',
    type: 'bienvenida',
    title: 'Bienvenida y Apertura de Ficha Digital',
    description: 'Envío de protocolo prequirúrgico y bienvenida al consultorio por WhatsApp.',
    dueDate: '2026-08-10',
    dueTime: '10:15',
    status: 'completed',
    priority: 'alta',
    procedure: 'Rinoplastia Ultrasónica Estructural',
    createdAt: '2026-08-10T09:00:00.000Z',
    completedAt: '2026-08-10T11:00:00.000Z',
    channel: 'whatsapp',
    assignedTo: 'Luciana Gómez (Secretaría)',
  },
  {
    id: 'CRM-INIT-6',
    patientId: 'PAC-1002',
    patientName: 'Valeria Lucía Benítez',
    patientPhone: '+5491167891234',
    type: 'confirmacion_abono',
    title: 'Cancelación Total Registrada ($4,500 USD)',
    description: 'Emisión de recibo final cancelatorio y reserva de quirófano en Sanatorio.',
    dueDate: '2026-08-01',
    dueTime: '13:00',
    status: 'completed',
    priority: 'media',
    amount: 4500,
    procedure: 'Lipoescultura HD con Marcación',
    createdAt: '2026-08-01T11:00:00.000Z',
    completedAt: '2026-08-01T13:30:00.000Z',
    channel: 'whatsapp',
    assignedTo: 'Cdr. Esteban Morales (Finanzas)',
  },
];

export function loadLocalCRMEvents(): CRMEvent[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CRM_EVENTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading CRM events from localStorage', e);
  }
  return INITIAL_CRM_EVENTS;
}

export function saveLocalCRMEvents(events: CRMEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CRM_EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving CRM events to localStorage', e);
  }
}

export function generatePatientCRMEvents(
  patient: Patient,
  initialPaymentAmount?: number
): CRMEvent[] {
  const events: CRMEvent[] = [];
  const now = new Date();
  const createdIso = now.toISOString();
  const regDate = patient.registrationDate || now.toISOString().split('T')[0];

  // 1. Evento de Bienvenida y Confirmación de Registro
  events.push({
    id: `CRM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}-bienvenida`,
    patientId: patient.id,
    patientName: patient.fullName,
    patientPhone: patient.phone,
    type: 'bienvenida',
    title: `Bienvenida y Ficha Médica Digital`,
    description: `Enviar bienvenida formal por WhatsApp a ${patient.fullName}, confirmando procedimiento presupuestado: ${patient.procedure}.`,
    dueDate: regDate,
    dueTime: '10:00',
    status: 'pending',
    priority: 'alta',
    channel: 'whatsapp',
    procedure: patient.procedure,
    createdAt: createdIso,
    assignedTo: 'Luciana Gómez (Secretaría)',
  });

  // 2. Si hubo abono inicial registrado
  if (initialPaymentAmount && initialPaymentAmount > 0) {
    events.push({
      id: `CRM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}-abono`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      type: 'confirmacion_abono',
      title: `Envío de Comprobante de Abono Inicial ($${initialPaymentAmount.toLocaleString()} USD)`,
      description: `Abono inicial por $${initialPaymentAmount.toLocaleString()} USD recibido para ${patient.fullName}. Presupuesto congelado y quirófano reservado.`,
      dueDate: regDate,
      dueTime: '11:30',
      status: 'completed',
      priority: 'media',
      amount: initialPaymentAmount,
      channel: 'whatsapp',
      procedure: patient.procedure,
      createdAt: createdIso,
      completedAt: createdIso,
      assignedTo: 'Cdr. Esteban Morales (Finanzas)',
    });
  }

  // 3. Seguimiento Pre-quirúrgico y Chequeo de Analíticas (5 días después del alta)
  const preOpDate = new Date(regDate);
  preOpDate.setDate(preOpDate.getDate() + 5);
  const preOpDateStr = preOpDate.toISOString().split('T')[0];

  events.push({
    id: `CRM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}-preop`,
    patientId: patient.id,
    patientName: patient.fullName,
    patientPhone: patient.phone,
    type: 'seguimiento_medico',
    title: `Seguimiento Pre-Quirúrgico y Chequeo de Analíticas`,
    description: `Llamar o escribir a ${patient.fullName} para verificar realización de análisis pre-operatorios y valoración cardiológica para ${patient.procedure}.`,
    dueDate: preOpDateStr,
    dueTime: '11:00',
    status: 'pending',
    priority: 'media',
    channel: 'llamada',
    procedure: patient.procedure,
    createdAt: createdIso,
    assignedTo: 'Lic. Marcela Vega (Admin)',
  });

  // 4. Notificaciones de Cobro y Vencimientos de Cuotas
  if (patient.paymentSchedule && patient.paymentSchedule.length > 0) {
    const hasDeferral = Boolean(patient.financingDeferralDays && patient.financingDeferralDays > 0);

    patient.paymentSchedule.forEach((installment) => {
      // Recordatorio previo (2 días antes de dueDate)
      const dueObj = new Date(installment.dueDate);
      const reminderObj = new Date(dueObj);
      reminderObj.setDate(reminderObj.getDate() - 2);
      const reminderDateStr = reminderObj.toISOString().split('T')[0];
      const isFirstWithDeferral = installment.installmentNumber === 1 && hasDeferral;

      // A) Notificación preventiva de cobro
      events.push({
        id: `CRM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-r${installment.installmentNumber}`,
        patientId: patient.id,
        patientName: patient.fullName,
        patientPhone: patient.phone,
        type: 'notificacion_cobro',
        title: isFirstWithDeferral
          ? `Aviso Previo: Cuota #1 [Diferida ${patient.financingDeferralDays}d] (${installment.dueDate}) ($${installment.amount.toLocaleString()} USD)`
          : `Aviso Previo: Cuota #${installment.installmentNumber}/${patient.paymentSchedule!.length} ($${installment.amount.toLocaleString()} USD)`,
        description: isFirstWithDeferral
          ? `Recordatorio preventivo 48h antes del vencimiento de la 1ª cuota (aplazada ${patient.financingDeferralDays} días) a ${patient.fullName} por $${installment.amount.toLocaleString()} USD.`
          : `Enviar recordatorio preventivo 48h antes del vencimiento a ${patient.fullName} para la cuota #${installment.installmentNumber} por $${installment.amount.toLocaleString()} USD.`,
        dueDate: reminderDateStr,
        dueTime: '09:30',
        status: installment.status === 'paid' ? 'completed' : 'pending',
        priority: isFirstWithDeferral ? 'alta' : 'media',
        amount: installment.amount,
        installmentNumber: installment.installmentNumber,
        totalInstallments: patient.paymentSchedule!.length,
        channel: 'whatsapp',
        procedure: patient.procedure,
        createdAt: createdIso,
        assignedTo: 'Luciana Gómez (Secretaría)',
      });

      // B) Cobro en la fecha exacta de vencimiento
      events.push({
        id: `CRM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-v${installment.installmentNumber}`,
        patientId: patient.id,
        patientName: patient.fullName,
        patientPhone: patient.phone,
        type: 'vencimiento_cuota',
        title: isFirstWithDeferral
          ? `Vencimiento Oficial: 1ª Cuota [Diferida ${patient.financingDeferralDays}d] ($${installment.amount.toLocaleString()} USD)`
          : `Vencimiento de Cobro: Cuota #${installment.installmentNumber}/${patient.paymentSchedule!.length} ($${installment.amount.toLocaleString()} USD)`,
        description: isFirstWithDeferral
          ? `Vencimiento oficial de la 1ª cuota luego del diferimiento concedido de ${patient.financingDeferralDays} días. Solicitar comprobante de transferencia o pago en consultorio a ${patient.fullName}.`
          : `Vencimiento oficial de la cuota #${installment.installmentNumber}. Solicitar comprobante de transferencia o pago en consultorio a ${patient.fullName}.`,
        dueDate: installment.dueDate,
        dueTime: '10:00',
        status: installment.status === 'paid' ? 'completed' : 'pending',
        priority: 'alta',
        amount: installment.amount,
        installmentNumber: installment.installmentNumber,
        totalInstallments: patient.paymentSchedule!.length,
        channel: 'whatsapp',
        procedure: patient.procedure,
        createdAt: createdIso,
        assignedTo: 'Cdr. Esteban Morales (Finanzas)',
      });
    });

    // C) Alarma CRM específica por diferimiento de 1ª cuota
    if (hasDeferral && patient.paymentSchedule.length > 0) {
      const firstDue = patient.paymentSchedule[0].dueDate;
      events.push({
        id: `CRM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-alarma-dif`,
        patientId: patient.id,
        patientName: patient.fullName,
        patientPhone: patient.phone,
        type: 'notificacion_cobro',
        title: `Alarma CRM: Fin de Período de Gracia / Diferimiento (${patient.financingDeferralDays} días)`,
        description: `Finaliza el período de diferimiento acordado (${patient.financingDeferralDays} días) para la 1ª cuota de ${patient.fullName}. Cobro de $${patient.paymentSchedule[0].amount.toLocaleString()} USD activo.`,
        dueDate: firstDue,
        dueTime: '08:30',
        status: 'pending',
        priority: 'alta',
        amount: patient.paymentSchedule[0].amount,
        installmentNumber: 1,
        totalInstallments: patient.paymentSchedule.length,
        channel: 'whatsapp',
        procedure: patient.procedure,
        createdAt: createdIso,
        assignedTo: 'Cdr. Esteban Morales (Finanzas)',
        notes: `Diferimiento autorizado de ${patient.financingDeferralDays} días otorgado al registrar el plan.`,
      });
    }
  } else if (patient.balance > 0) {
    // Si no tiene cronograma pero tiene saldo pendiente
    const targetDueDate = patient.nextPaymentDate || (() => {
      const d = new Date(regDate);
      d.setDate(d.getDate() + 15);
      return d.toISOString().split('T')[0];
    })();

    const dueObj = new Date(targetDueDate);
    const reminderObj = new Date(dueObj);
    reminderObj.setDate(reminderObj.getDate() - 2);
    const reminderDateStr = reminderObj.toISOString().split('T')[0];

    // Aviso previo
    events.push({
      id: `CRM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-r1`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      type: 'notificacion_cobro',
      title: `Aviso Previo de Saldo Pendiente ($${patient.balance.toLocaleString()} USD)`,
      description: `Enviar recordatorio previo de cobranza a ${patient.fullName} sobre saldo pendiente de $${patient.balance.toLocaleString()} USD para ${patient.procedure}.`,
      dueDate: reminderDateStr,
      dueTime: '09:30',
      status: 'pending',
      priority: 'media',
      amount: patient.balance,
      channel: 'whatsapp',
      procedure: patient.procedure,
      createdAt: createdIso,
      assignedTo: 'Luciana Gómez (Secretaría)',
    });

    // Vencimiento oficial
    events.push({
      id: `CRM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-v1`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      type: 'vencimiento_cuota',
      title: `Vencimiento de Saldo Quirúrgico ($${patient.balance.toLocaleString()} USD)`,
      description: `Vencimiento pactado con ${patient.fullName}. Solicitar abono del saldo restante de $${patient.balance.toLocaleString()} USD.`,
      dueDate: targetDueDate,
      dueTime: '10:00',
      status: 'pending',
      priority: 'alta',
      amount: patient.balance,
      channel: 'whatsapp',
      procedure: patient.procedure,
      createdAt: createdIso,
      assignedTo: 'Cdr. Esteban Morales (Finanzas)',
    });
  }

  return events;
}

