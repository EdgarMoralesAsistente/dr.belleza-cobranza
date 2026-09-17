import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { UsersModule } from './components/UsersModule';
import { SettingsModule } from './components/SettingsModule';
import { DashboardStats } from './components/DashboardStats';
import { PatientTable } from './components/PatientTable';
import { PaymentsTable } from './components/PaymentsTable';
import { RefundsTable } from './components/RefundsTable';
import { NewPatientModal } from './components/NewPatientModal';
import { NewPaymentModal } from './components/NewPaymentModal';
import { NewRefundModal } from './components/NewRefundModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { PatientDetailModal } from './components/PatientDetailModal';
import { GoogleSheetsSettingsModal } from './components/GoogleSheetsSettingsModal';
import { CRMModule } from './components/crm/CRMModule';
import { EditPatientModal } from './components/EditPatientModal';
import { UserProfileHeader } from './components/UserProfileHeader';
import { UserProfileModal } from './components/UserProfileModal';
import { LoginModal } from './components/LoginModal';
import {
  Patient,
  Payment,
  Refund,
  ActiveTab,
  GoogleSheetConfig,
  SystemUser,
  SurgicalProcedure,
  DiscountCoupon,
  AppBrandingConfig,
  RolePrivilege,
  FinancingPlan,
  CRMEvent,
} from './types';
import { WhatsAppTemplateType } from './services/whatsapp';
import {
  loadLocalPatients,
  saveLocalPatients,
  loadLocalPayments,
  saveLocalPayments,
  loadLocalRefunds,
  saveLocalRefunds,
  loadGoogleSheetConfig,
  saveGoogleSheetConfig,
  loadLocalUsers,
  saveLocalUsers,
  loadActiveUserId,
  saveActiveUserId,
  loadLocalProcedures,
  saveLocalProcedures,
  loadLocalCoupons,
  saveLocalCoupons,
  loadLocalBranding,
  saveLocalBranding,
  loadLocalRolePrivileges,
  saveLocalRolePrivileges,
  loadLocalFinancingPlans,
  saveLocalFinancingPlans,
  loadLocalCRMEvents,
  saveLocalCRMEvents,
  generatePatientCRMEvents,
  getEffectiveGasUrl,
} from './services/storage';
import {
  initAuth,
  googleSignIn,
  logOutGoogle,
  getAccessToken,
  setCachedAccessToken,
} from './firebase';
import {
  createDrBellezaSpreadsheet,
  syncAllToGoogleSheet,
  fetchAllFromGoogleSheet,
  appendPatientToGoogleSheet,
  updatePatientInGoogleSheet,
  deletePatientFromGoogleSheet,
  appendPaymentToGoogleSheet,
  appendRefundToGoogleSheet,
  appendUserToGoogleSheet,
  updateUserInGoogleSheet,
  deleteUserInGoogleSheet,
  syncAllProceduresToGoogleSheet,
  updateProcedureInGoogleSheet,
  deleteProcedureFromGoogleSheet,
  syncAllPlansToGoogleSheet,
  updatePlanInGoogleSheet,
  deletePlanFromGoogleSheet,
} from './services/googleSheets';
import {
  testGasConnection,
  fetchAllFromGas,
  savePatientToGas,
  deletePatientFromGas,
  savePaymentToGas,
  deletePaymentFromGas,
  saveRefundToGas,
  deleteRefundFromGas,
  saveUserToGas,
  deleteUserFromGas,
  saveProcedureToGas,
  deleteProcedureFromGas,
  saveAllProceduresToGas,
  saveFinancingPlanToGas,
  deleteFinancingPlanFromGas,
  saveAllFinancingPlansToGas,
  batchSyncToGas,
  cleanupProcedureSheetsInGas,
} from './services/gasService';
import { User } from 'firebase/auth';
import { FileSpreadsheet, Sparkles, CheckCircle2, ShieldAlert, Lock, ArrowRightLeft } from 'lucide-react';

export default function App() {
  // Main Data States
  const [patients, setPatients] = useState<Patient[]>(loadLocalPatients);
  const [payments, setPayments] = useState<Payment[]>(loadLocalPayments);
  const [refunds, setRefunds] = useState<Refund[]>(loadLocalRefunds);
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(loadGoogleSheetConfig);

  // Users & RBAC States
  const [users, setUsers] = useState<SystemUser[]>(loadLocalUsers);
  const [activeUserId, setActiveUserId] = useState<string | null>(loadActiveUserId);

  // Catalog, Coupons, Branding, Role Privileges & Financing Plans States
  const [procedures, setProcedures] = useState<SurgicalProcedure[]>(loadLocalProcedures);
  const [coupons, setCoupons] = useState<DiscountCoupon[]>(loadLocalCoupons);
  const [branding, setBranding] = useState<AppBrandingConfig>(loadLocalBranding);
  const [rolePrivileges, setRolePrivileges] = useState<RolePrivilege[]>(loadLocalRolePrivileges);
  const [financingPlans, setFinancingPlans] = useState<FinancingPlan[]>(loadLocalFinancingPlans);
  const [crmEvents, setCrmEvents] = useState<CRMEvent[]>(loadLocalCRMEvents);

  // Navigation & User State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const [preselectedPatientIdForPayment, setPreselectedPatientIdForPayment] = useState<string | undefined>();
  const [isNewRefundModalOpen, setIsNewRefundModalOpen] = useState(false);
  const [preselectedPatientIdForRefund, setPreselectedPatientIdForRefund] = useState<string | undefined>();

  // WhatsApp Modal
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppPatient, setWhatsAppPatient] = useState<Patient | null>(null);
  const [whatsAppPayment, setWhatsAppPayment] = useState<Payment | undefined>();
  const [whatsAppRefund, setWhatsAppRefund] = useState<Refund | undefined>();
  const [whatsAppTemplate, setWhatsAppTemplate] = useState<WhatsAppTemplateType>('reminder');

  // Other Modals
  const [isMonthlyReportModalOpen, setIsMonthlyReportModalOpen] = useState(false);
  const [isSheetSettingsModalOpen, setIsSheetSettingsModalOpen] = useState(false);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<Patient | null>(null);

  // Edit Patient Modal
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);

  // User Profile & Authentication Modals
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => !loadActiveUserId());

  // Temporary sync toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Setup Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        if (token) {
          setCachedAccessToken(token);
        }
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save to LocalStorage whenever state updates
  useEffect(() => {
    saveLocalPatients(patients);
  }, [patients]);

  useEffect(() => {
    saveLocalPayments(payments);
  }, [payments]);

  useEffect(() => {
    saveLocalRefunds(refunds);
  }, [refunds]);

  useEffect(() => {
    saveGoogleSheetConfig(sheetConfig);
  }, [sheetConfig]);

  useEffect(() => {
    saveLocalUsers(users);
  }, [users]);

  useEffect(() => {
    saveActiveUserId(activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    saveLocalProcedures(procedures);
  }, [procedures]);

  useEffect(() => {
    saveLocalCoupons(coupons);
  }, [coupons]);

  useEffect(() => {
    saveLocalBranding(branding);
  }, [branding]);

  useEffect(() => {
  saveLocalRolePrivileges(rolePrivileges);
  }, [rolePrivileges]);

  useEffect(() => {
    saveLocalFinancingPlans(financingPlans);
  }, [financingPlans]);

  useEffect(() => {
    saveLocalCRMEvents(crmEvents);
  }, [crmEvents]);

  // Current active user & RBAC determination
  const activeUser: SystemUser | null = activeUserId
    ? users.find((u) => u.id === activeUserId) || null
    : null;
  const isSuperAdmin = activeUser?.role === 'super_admin';
  const currentPrivilege = activeUser ? rolePrivileges.find((p) => p.role === activeUser.role) : null;

  const isTabAllowed = (tab: ActiveTab): boolean => {
    if (!activeUser) return false;
    if (!currentPrivilege) return true;
    switch (tab) {
      case 'dashboard':
        return currentPrivilege.canViewDashboard;
      case 'crm':
      case 'patients':
        return currentPrivilege.canManagePatients;
      case 'payments':
        return currentPrivilege.canRegisterPayments || currentPrivilege.canViewDashboard;
      case 'refunds':
        return currentPrivilege.canRegisterRefunds;
      case 'users':
        return currentPrivilege.canManageUsers;
      case 'settings':
        return currentPrivilege.canManageSettings;
      default:
        return true;
    }
  };

  const crmPendingCount = crmEvents.filter(
    (e) => e.status !== 'completed' && e.status !== 'cancelled'
  ).length;

  // Active Google Apps Script URL resolver
  const getActiveGasUrl = (): string | null => {
    return sheetConfig.gasDeploymentUrl || getEffectiveGasUrl();
  };

  // Unified cloud sync dispatchers
  const syncPatientToCloud = async (patient: Patient, isUpdate: boolean = false) => {
    const gasUrl = getActiveGasUrl();
    const token = await getAccessToken();
    let synced = false;

    if (gasUrl) {
      try {
        await savePatientToGas(gasUrl, patient);
        synced = true;
      } catch (err: any) {
        console.error('Error enviando paciente a Apps Script:', err);
        showToast(`⚠️ Error al enviar paciente a Google Sheets: ${err?.message || 'Fallo de conexión'}`);
      }
    }

    if (token && sheetConfig.spreadsheetId) {
      try {
        if (isUpdate) {
          await updatePatientInGoogleSheet(token, sheetConfig.spreadsheetId, patient);
        } else {
          await appendPatientToGoogleSheet(token, sheetConfig.spreadsheetId, patient);
        }
        synced = true;
      } catch (err: any) {
        console.error('Error enviando paciente a Google Sheets API:', err);
      }
    }

    if (synced) {
      setSheetConfig((prev) => ({ ...prev, lastSyncTime: new Date().toLocaleTimeString('es-ES') }));
    }
  };

  const deletePatientFromCloud = async (patientId: string) => {
    const gasUrl = getActiveGasUrl();
    const token = await getAccessToken();

    if (gasUrl) {
      try {
        await deletePatientFromGas(gasUrl, patientId);
        setSheetConfig((prev) => ({ ...prev, lastSyncTime: new Date().toLocaleTimeString('es-ES') }));
      } catch (err: any) {
        console.error('Error eliminando paciente en Apps Script:', err);
      }
    }

    if (token && sheetConfig.spreadsheetId) {
      try {
        await deletePatientFromGoogleSheet(token, sheetConfig.spreadsheetId, patientId);
        setSheetConfig((prev) => ({ ...prev, lastSyncTime: new Date().toLocaleTimeString('es-ES') }));
      } catch (err: any) {
        console.error('Error eliminando paciente en Google Sheets API:', err);
      }
    }
  };

  const syncPaymentToCloud = async (payment: Payment) => {
    const gasUrl = getActiveGasUrl();
    const token = await getAccessToken();
    let synced = false;

    if (gasUrl) {
      try {
        await savePaymentToGas(gasUrl, payment);
        synced = true;
      } catch (err: any) {
        console.error('Error enviando abono a Apps Script:', err);
      }
    }

    if (token && sheetConfig.spreadsheetId) {
      try {
        await appendPaymentToGoogleSheet(token, sheetConfig.spreadsheetId, payment);
        synced = true;
      } catch (err: any) {
        console.error('Error enviando abono a Google Sheets API:', err);
      }
    }

    if (synced) {
      setSheetConfig((prev) => ({ ...prev, lastSyncTime: new Date().toLocaleTimeString('es-ES') }));
    }
  };

  const syncRefundToCloud = async (refund: Refund) => {
    const gasUrl = getActiveGasUrl();
    const token = await getAccessToken();
    let synced = false;

    if (gasUrl) {
      try {
        await saveRefundToGas(gasUrl, refund);
        synced = true;
      } catch (err: any) {
        console.error('Error enviando reintegro a Apps Script:', err);
      }
    }

    if (token && sheetConfig.spreadsheetId) {
      try {
        await appendRefundToGoogleSheet(token, sheetConfig.spreadsheetId, refund);
        synced = true;
      } catch (err: any) {
        console.error('Error enviando reintegro a Google Sheets API:', err);
      }
    }

    if (synced) {
      setSheetConfig((prev) => ({ ...prev, lastSyncTime: new Date().toLocaleTimeString('es-ES') }));
    }
  };

  const syncUserToCloud = async (user: SystemUser, isUpdate: boolean = false) => {
    const gasUrl = getActiveGasUrl();
    const token = await getAccessToken();
    let synced = false;

    if (gasUrl) {
      try {
        await saveUserToGas(gasUrl, user);
        synced = true;
      } catch (err: any) {
        console.error('Error enviando usuario a Apps Script:', err);
        showToast(`⚠️ Error al enviar usuario a Google Sheets: ${err?.message || 'Fallo de conexión'}`);
      }
    }

    if (token && sheetConfig.spreadsheetId) {
      try {
        if (isUpdate) {
          await updateUserInGoogleSheet(token, sheetConfig.spreadsheetId, user);
        } else {
          await appendUserToGoogleSheet(token, sheetConfig.spreadsheetId, user);
        }
        synced = true;
      } catch (err: any) {
        console.error('Error enviando usuario a Google Sheets API:', err);
      }
    }

    if (synced) {
      setSheetConfig((prev) => ({ ...prev, lastSyncTime: new Date().toLocaleTimeString('es-ES') }));
      showToast(`✓ Usuario "${user.fullName}" sincronizado con Google Sheets.`);
    } else if (!gasUrl && (!token || !sheetConfig.spreadsheetId)) {
      showToast(`⚠️ Usuario guardado en memoria local. Conecte Google Sheets para sincronizar en tiempo real.`);
    }
  };

  const deleteUserFromCloud = async (userId: string) => {
    const gasUrl = getActiveGasUrl();
    const token = await getAccessToken();

    if (gasUrl) {
      try {
        await deleteUserFromGas(gasUrl, userId);
        setSheetConfig((prev) => ({ ...prev, lastSyncTime: new Date().toLocaleTimeString('es-ES') }));
      } catch (err: any) {
        console.error('Error eliminando usuario de Apps Script:', err);
      }
    }

    if (token && sheetConfig.spreadsheetId) {
      try {
        await deleteUserInGoogleSheet(token, sheetConfig.spreadsheetId, userId);
        setSheetConfig((prev) => ({ ...prev, lastSyncTime: new Date().toLocaleTimeString('es-ES') }));
      } catch (err: any) {
        console.error('Error eliminando usuario de Google Sheets API:', err);
      }
    }
  };

  const handleSaveUser = (userData: Omit<SystemUser, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      const existing = users.find((u) => u.id === id);
      const updatedUser: SystemUser = {
        ...(existing || { id, createdAt: new Date().toISOString().split('T')[0] }),
        ...userData,
        id,
      };
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? updatedUser : u))
      );
      showToast(`Usuario "${userData.fullName}" actualizado correctamente.`);
      syncUserToCloud(updatedUser, true).catch(console.error);
    } else {
      const newUser: SystemUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString().split('T')[0],
        ...userData,
      };
      setUsers((prev) => [...prev, newUser]);
      showToast(`Usuario "${userData.fullName}" creado con perfil ${userData.role}.`);
      syncUserToCloud(newUser, false).catch(console.error);
    }
  };

  const handleDeleteUser = (id: string) => {
    const userToDelete = users.find((u) => u.id === id);
    if (userToDelete?.isImmutable || userToDelete?.email.toLowerCase() === 'edgar@morales.com' || id === 'USR-SUPER-EDGAR') {
      showToast('Acción denegada: El Super Administrador Edgar Morales está protegido permanentemente y no puede ser borrado.');
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (activeUserId === id) {
      const remaining = users.filter((u) => u.id !== id);
      if (remaining.length > 0) {
        setActiveUserId(remaining[0].id);
      }
    }
    showToast(`Usuario "${userToDelete?.fullName || id}" eliminado del sistema.`);
    deleteUserFromCloud(id).catch(console.error);
  };

  const handleToggleUserStatus = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user?.isImmutable || user?.email.toLowerCase() === 'edgar@morales.com' || id === 'USR-SUPER-EDGAR') {
      showToast('El Super Administrador Edgar Morales debe permanecer siempre activo.');
      return;
    }

    let changedUser: SystemUser | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updatedStatus = !u.isActive;
          showToast(`Usuario "${u.fullName}" ${updatedStatus ? 'activado' : 'desactivado'}.`);
          changedUser = { ...u, isActive: updatedStatus };
          return changedUser;
        }
        return u;
      })
    );
    if (changedUser) {
      syncUserToCloud(changedUser, true).catch(console.error);
    }
  };

  const handleSelectActiveUser = (userId: string) => {
    setActiveUserId(userId);
    saveActiveUserId(userId);
    const u = users.find((item) => item.id === userId);
    if (u) {
      showToast(`Sesión activa cambiada a: ${u.fullName} (${u.role})`);
    }
  };

  const handleUpdateCurrentUser = (updatedUser: SystemUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    showToast(`Perfil de ${updatedUser.fullName} actualizado.`);
    syncUserToCloud(updatedUser, true).catch(console.error);
  };

  const handleLogout = () => {
    setActiveUserId(null);
    saveActiveUserId(null);
    setIsUserProfileModalOpen(false);
    setIsLoginModalOpen(true);
    showToast('Ha cerrado sesión exitosamente.');
  };

  const handleLoginSuccess = (user: SystemUser) => {
    setActiveUserId(user.id);
    saveActiveUserId(user.id);
    setIsLoginModalOpen(false);

    // Redirect to allowed view if current tab is restricted
    const priv = rolePrivileges.find((p) => p.role === user.role);
    if (priv) {
      const allowedForTab = (tab: ActiveTab): boolean => {
        if (tab === 'dashboard') return priv.canViewDashboard;
        if (tab === 'crm' || tab === 'patients') return priv.canManagePatients;
        if (tab === 'payments') return priv.canRegisterPayments || priv.canViewDashboard;
        if (tab === 'refunds') return priv.canRegisterRefunds;
        if (tab === 'users') return priv.canManageUsers;
        if (tab === 'settings') return priv.canManageSettings;
        return true;
      };

      if (!allowedForTab(activeTab)) {
        if (priv.canViewDashboard) setActiveTab('dashboard');
        else if (priv.canManagePatients) setActiveTab('patients');
        else if (priv.canRegisterPayments) setActiveTab('payments');
        else if (priv.canRegisterRefunds) setActiveTab('refunds');
        else if (priv.canManageUsers) setActiveTab('users');
        else if (priv.canManageSettings) setActiveTab('settings');
      }
    }

    showToast(`¡Bienvenido de vuelta, ${user.fullName}! Sesión iniciada con éxito.`);
    // Refrescar automáticamente los datos y procedimientos desde Google Sheets al iniciar sesión
    handleImportFromGas(true).catch(console.warn);
  };

  const handleDenyNonSuperAdminSheetAccess = () => {
    setIsSheetSettingsModalOpen(true);
  };

  // Google Sign In
  const handleSignInGoogle = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        showToast(`Sesión iniciada con Google (${result.user.displayName || result.user.email})`);
      }
    } catch (e: any) {
      console.error(e);
      alert('Error al autenticar con Google. Asegúrese de otorgar los permisos solicitados.');
    }
  };

  const handleSignOutGoogle = async () => {
    await logOutGoogle();
    setCurrentUser(null);
    showToast('Sesión de Google cerrada.');
  };

  // Google Sheets Management
  const handleCreateNewSheet = async () => {
    const token = await getAccessToken();
    if (!token) {
      alert('Por favor inicie sesión con Google primero.');
      return;
    }

    setSheetConfig((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      const created = await createDrBellezaSpreadsheet(token);
      // Immediately push all current patients, payments, and refunds
      await syncAllToGoogleSheet(token, created.id, patients, payments, refunds);

      const updatedConfig: GoogleSheetConfig = {
        spreadsheetId: created.id,
        spreadsheetUrl: created.url,
        spreadsheetName: created.name,
        lastSyncTime: new Date().toLocaleTimeString('es-ES'),
        isSyncing: false,
        error: null,
      };
      setSheetConfig(updatedConfig);
      showToast('Hoja "Dr. Belleza - Cobranza" creada en Google Drive y sincronizada.');
    } catch (err: any) {
      console.error(err);
      setSheetConfig((prev) => ({ ...prev, isSyncing: false, error: err.message }));
      throw err;
    }
  };

  const handleConnectExistingSheet = async (idOrUrl: string) => {
    const token = await getAccessToken();
    if (!token) {
      alert('Por favor inicie sesión con Google primero.');
      return;
    }

    // Extract ID if URL was passed
    let sheetId = idOrUrl.trim();
    const urlMatch = sheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      sheetId = urlMatch[1];
    }

    setSheetConfig((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      // Sync our data to the sheet
      await syncAllToGoogleSheet(token, sheetId, patients, payments, refunds, users);

      const updatedConfig: GoogleSheetConfig = {
        spreadsheetId: sheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
        spreadsheetName: 'Dr. Belleza - Cobranza (Vinculada)',
        lastSyncTime: new Date().toLocaleTimeString('es-ES'),
        isSyncing: false,
        error: null,
      };
      setSheetConfig(updatedConfig);
      showToast('Hoja vinculada exitosamente con Google Sheets.');
    } catch (err: any) {
      console.error(err);
      setSheetConfig((prev) => ({ ...prev, isSyncing: false, error: err.message }));
      throw err;
    }
  };

  const handleSyncAllToSheet = async () => {
    if (!sheetConfig.spreadsheetId) {
      alert('No hay una hoja de Google Sheets vinculada.');
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      alert('Por favor inicie sesión con Google para sincronizar.');
      return;
    }

    setSheetConfig((prev) => ({ ...prev, isSyncing: true }));
    try {
      await syncAllToGoogleSheet(token, sheetConfig.spreadsheetId, patients, payments, refunds, users, procedures, financingPlans);
      setSheetConfig((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date().toLocaleTimeString('es-ES'),
      }));
      showToast('Sincronización en tiempo real completada con Google Sheets.');
    } catch (err: any) {
      console.error(err);
      setSheetConfig((prev) => ({ ...prev, isSyncing: false, error: err.message }));
      throw err;
    }
  };

  const handleImportFromSheet = async () => {
    if (!sheetConfig.spreadsheetId) return;
    const token = await getAccessToken();
    if (!token) {
      alert('Por favor inicie sesión con Google.');
      return;
    }

    setSheetConfig((prev) => ({ ...prev, isSyncing: true }));
    try {
      const result = await fetchAllFromGoogleSheet(token, sheetConfig.spreadsheetId);
      if (result) {
        if (result.patients.length > 0) setPatients(result.patients);
        if (result.payments.length > 0) setPayments(result.payments);
        if (result.refunds.length > 0) setRefunds(result.refunds);
        if (result.users && result.users.length > 0) setUsers(result.users);

        setSheetConfig((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: new Date().toLocaleTimeString('es-ES'),
        }));
        showToast('Datos importados con éxito desde Google Sheets.');
      }
    } catch (err: any) {
      console.error(err);
      setSheetConfig((prev) => ({ ...prev, isSyncing: false, error: err.message }));
      throw err;
    }
  };

  // Google Apps Script Handlers
  const isFetchingGasRef = useRef(false);

  const handleImportFromGas = async (isSilent: boolean = false, overrideUrl?: string) => {
    const gasUrl = overrideUrl || sheetConfig.gasDeploymentUrl || getEffectiveGasUrl();
    if (!gasUrl) {
      if (!isSilent) showToast('No hay una URL de Google Apps Script configurada.');
      return;
    }
    if (isFetchingGasRef.current) return;
    isFetchingGasRef.current = true;

    if (!isSilent) {
      setSheetConfig((prev) => ({ ...prev, isSyncing: true, error: null }));
    }

    try {
      const data = await fetchAllFromGas(gasUrl);
      if (data.patients && Array.isArray(data.patients) && data.patients.length > 0) {
        setPatients(data.patients);
      }
      if (data.payments && Array.isArray(data.payments)) {
        if (data.payments.length > 0 || (data.patients && data.patients.length > 0)) {
          setPayments(data.payments);
        }
      }
      if (data.refunds && Array.isArray(data.refunds)) {
        if (data.refunds.length > 0 || (data.patients && data.patients.length > 0)) {
          setRefunds(data.refunds);
        }
      }
      if (data.users && Array.isArray(data.users) && data.users.length > 0) {
        setUsers(data.users);
      }
      if (data.crmEvents && Array.isArray(data.crmEvents) && data.crmEvents.length > 0) {
        setCrmEvents(data.crmEvents);
      }
      if (data.procedures && Array.isArray(data.procedures) && data.procedures.length > 0) {
        setProcedures((prev) => {
          const remoteIds = new Set(data.procedures.map((p: SurgicalProcedure) => p.id));
          const localOnly = prev.filter((p) => !remoteIds.has(p.id));
          const merged = [...localOnly, ...data.procedures];
          saveLocalProcedures(merged);
          // Auto-sync missing procedures to Google Sheets in the background
          if (localOnly.length > 0 && gasUrl) {
            saveAllProceduresToGas(gasUrl, merged).catch(() => {
              for (const p of localOnly) {
                saveProcedureToGas(gasUrl, p).catch(console.warn);
              }
            });
          }
          return merged;
        });
      } else if (gasUrl) {
        // If Google Sheets had 0 procedures, upload all local procedures
        const localProcs = loadLocalProcedures();
        if (localProcs.length > 0) {
          saveAllProceduresToGas(gasUrl, localProcs).catch(() => {
            for (const p of localProcs) {
              saveProcedureToGas(gasUrl, p).catch(console.warn);
            }
          });
        }
      }

      if (data.financingPlans && Array.isArray(data.financingPlans) && data.financingPlans.length > 0) {
        setFinancingPlans((prev) => {
          const remoteIds = new Set(data.financingPlans.map((p: FinancingPlan) => p.id));
          const localOnly = prev.filter((p) => !remoteIds.has(p.id));
          const merged = [...localOnly, ...data.financingPlans];
          saveLocalFinancingPlans(merged);
          // Auto-sync missing financing plans to Google Sheets in the background
          if (localOnly.length > 0 && gasUrl) {
            saveAllFinancingPlansToGas(gasUrl, merged).catch(() => {
              for (const pl of localOnly) {
                saveFinancingPlanToGas(gasUrl, pl).catch(console.warn);
              }
            });
          }
          return merged;
        });
      } else if (gasUrl) {
        const localPlans = loadLocalFinancingPlans();
        if (localPlans.length > 0) {
          saveAllFinancingPlansToGas(gasUrl, localPlans).catch(() => {
            for (const pl of localPlans) {
              saveFinancingPlanToGas(gasUrl, pl).catch(console.warn);
            }
          });
        }
      }

      const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      setSheetConfig((prev) => ({
        ...prev,
        gasDeploymentUrl: gasUrl,
        isSyncing: false,
        lastSyncTime: now,
        spreadsheetName: data.spreadsheetName || prev.spreadsheetName,
        spreadsheetUrl: data.spreadsheetUrl || prev.spreadsheetUrl,
        spreadsheetId: data.spreadsheetId || prev.spreadsheetId,
        error: null,
      }));
      if (!isSilent) {
        showToast('¡Datos actualizados desde Google Sheets!');
      }
    } catch (err: any) {
      console.warn('Sync error from Google Apps Script:', err);
      setSheetConfig((prev) => ({ ...prev, isSyncing: false, error: err.message }));
      if (!isSilent) {
        showToast(`Error al sincronizar: ${err.message}`);
        throw err;
      }
    } finally {
      isFetchingGasRef.current = false;
    }
  };

  const handleConnectGas = async (gasUrl: string) => {
    setSheetConfig((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      const test = await testGasConnection(gasUrl);
      const updatedConfig: GoogleSheetConfig = {
        spreadsheetId: test.spreadsheetId || 'gas-connected',
        spreadsheetUrl: test.spreadsheetUrl || 'https://script.google.com/',
        spreadsheetName: test.spreadsheetName || 'Dr. Belleza - Google Sheets (Apps Script)',
        gasDeploymentUrl: gasUrl.trim(),
        syncMode: 'apps_script',
        lastSyncTime: new Date().toLocaleTimeString('es-ES'),
        isSyncing: false,
        error: null,
      };
      setSheetConfig(updatedConfig);
      saveGoogleSheetConfig(updatedConfig);
      showToast(`Conectado exitosamente con Google Apps Script (${test.spreadsheetName || 'Sheets'}).`);
      // Immediately pull existing database from the newly connected sheet
      handleImportFromGas(true, gasUrl.trim()).catch(console.error);
    } catch (err: any) {
      console.error(err);
      setSheetConfig((prev) => ({ ...prev, isSyncing: false, error: err.message }));
      throw err;
    }
  };

  const handleDisconnectGas = () => {
    const cleared: GoogleSheetConfig = {
      spreadsheetId: null,
      spreadsheetUrl: null,
      spreadsheetName: 'Dr. Belleza - Cobranza (Desconectado)',
      gasDeploymentUrl: null,
      syncMode: 'apps_script',
      lastSyncTime: null,
      isSyncing: false,
      error: null,
    };
    setSheetConfig(cleared);
    saveGoogleSheetConfig(cleared);
    showToast('Vinculación con Google Apps Script removida.');
  };

  const handleSyncAllToGas = async () => {
    const gasUrl = sheetConfig.gasDeploymentUrl || getEffectiveGasUrl();
    if (!gasUrl) {
      showToast('No hay una URL de Google Apps Script configurada.');
      return;
    }
    setSheetConfig((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      // 1. Asegurar la eliminación de la pestaña singular "Procedimiento" y consolidar en "Procedimientos"
      await cleanupProcedureSheetsInGas(gasUrl).catch(console.warn);

      // 2. Enviar todos los datos a las hojas consolidadas
      await batchSyncToGas(gasUrl, {
        patients,
        payments,
        refunds,
        users,
        crmEvents,
        procedures,
        financingPlans,
      });
      const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      setSheetConfig((prev) => ({ ...prev, isSyncing: false, lastSyncTime: now }));
      showToast('¡Todos los datos locales fueron sincronizados a Google Sheets!');
    } catch (err: any) {
      console.error(err);
      setSheetConfig((prev) => ({ ...prev, isSyncing: false, error: err.message }));
      throw err;
    }
  };

  const handleCleanupProcedureSheets = async () => {
    const gasUrl = sheetConfig.gasDeploymentUrl || getEffectiveGasUrl();
    if (!gasUrl) {
      showToast('No hay una URL de Google Apps Script configurada.');
      return;
    }
    try {
      showToast('Ejecutando limpieza de pestañas en Google Sheets...');
      const res = await cleanupProcedureSheetsInGas(gasUrl);
      // Volver a volcar los procedimientos actuales para asegurar que la hoja "Procedimientos" esté al día
      await saveAllProceduresToGas(gasUrl, procedures).catch(console.warn);
      showToast(res.message || 'Pestaña singular "Procedimiento" eliminada. Conservada solo "Procedimientos".');
    } catch (err: any) {
      console.error(err);
      showToast(`Error al depurar hojas: ${err.message}`);
      throw err;
    }
  };

  const handleUnifiedSync = async () => {
    const gasUrl = sheetConfig.gasDeploymentUrl || getEffectiveGasUrl();
    if (gasUrl) {
      await handleImportFromGas(false);
    } else if (sheetConfig.spreadsheetId) {
      await handleImportFromSheet();
    } else {
      setIsSheetSettingsModalOpen(true);
    }
  };

  // Auto-sync from Google Sheets on startup, tab focus, and periodic interval (every 30s)
  useEffect(() => {
    const gasUrl = sheetConfig.gasDeploymentUrl || getEffectiveGasUrl();
    if (!gasUrl) return;

    // 1. Initial fetch when app opens on ANY device
    handleImportFromGas(true).catch(console.error);

    // 2. Poll every 30 seconds if page is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleImportFromGas(true).catch(console.error);
      }
    }, 30000);

    // 3. Sync on tab focus / visibility change
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleImportFromGas(true).catch(console.error);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
    };
  }, [sheetConfig.gasDeploymentUrl]);

  // Domain Actions
  const handleSavePatient = async (
    newPatient: Patient,
    initialPayment?: Omit<Payment, 'id' | 'patientId' | 'patientName' | 'createdAt'>
  ) => {
    let updatedPayments = [...payments];

    if (initialPayment && initialPayment.amount > 0) {
      const paymentRecord: Payment = {
        id: `PAG-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: newPatient.id,
        patientName: newPatient.fullName,
        amount: initialPayment.amount,
        date: initialPayment.date,
        paymentMethod: initialPayment.paymentMethod,
        reference: initialPayment.reference,
        notes: initialPayment.notes,
        registeredBy: initialPayment.registeredBy,
        createdAt: new Date().toISOString(),
      };
      updatedPayments = [paymentRecord, ...updatedPayments];
      setPayments(updatedPayments);

      // Async sync to Google Sheets if connected
      syncPaymentToCloud(paymentRecord).catch(console.error);
    }

    const updatedPatients = [newPatient, ...patients];
    setPatients(updatedPatients);

    // Automate CRM events creation
    const newCRMEvents = generatePatientCRMEvents(newPatient, initialPayment?.amount);
    if (newCRMEvents.length > 0) {
      setCrmEvents((prev) => [...newCRMEvents, ...prev]);
    }

    showToast(`Paciente ${newPatient.fullName} registrada y ${newCRMEvents.length} eventos creados en CRM.`);

    // Async sync to Google Sheets if connected (Direct OAuth or Google Apps Script)
    syncPatientToCloud(newPatient, false).catch(console.error);
  };

  const handleOpenEditPatient = (patient: Patient) => {
    setPatientToEdit(patient);
    setIsEditPatientModalOpen(true);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );

    // Sync corresponding CRM events
    setCrmEvents((prev) =>
      prev.map((ev) => {
        if (ev.patientId === updatedPatient.id) {
          return {
            ...ev,
            patientName: updatedPatient.fullName,
            patientPhone: updatedPatient.phone,
            procedure: updatedPatient.procedure,
          };
        }
        return ev;
      })
    );

    if (selectedPatientForDetails?.id === updatedPatient.id) {
      setSelectedPatientForDetails(updatedPatient);
    }

    // Async sync updated patient to Google Sheets
    syncPatientToCloud(updatedPatient, true).catch(console.error);

    showToast(`Registro de "${updatedPatient.fullName}" actualizado correctamente.`);
  };

  const handleDeletePatient = (patientId: string) => {
    const patientToDelete = patients.find((p) => p.id === patientId);
    const name = patientToDelete?.fullName || 'la paciente';

    // Borrado en cascada local (paciente + abonos + reintegros + eventos)
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    setPayments((prev) => prev.filter((pay) => pay.patientId !== patientId));
    setRefunds((prev) => prev.filter((ref) => ref.patientId !== patientId));
    setCrmEvents((prev) => prev.filter((ev) => ev.patientId !== patientId));

    if (selectedPatientForDetails?.id === patientId) {
      setSelectedPatientForDetails(null);
    }

    showToast(`Paciente "${name}" y todos sus abonos y registros asociados eliminados.`);

    // Borrado en cascada en Google Sheets
    deletePatientFromCloud(patientId).catch(console.error);
  };

  const handleSavePayment = async (
    paymentData: Omit<Payment, 'id' | 'createdAt'>,
    openWhatsAppReceipt: boolean
  ) => {
    const paymentRecord: Payment = {
      ...paymentData,
      id: `PAG-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    // Update patient totals
    const updatedPatients = patients.map((patient) => {
      if (patient.id === paymentRecord.patientId) {
        const newPaid = patient.totalPaid + paymentRecord.amount;
        const newBalance = Math.max(0, patient.totalCost - newPaid);
        return {
          ...patient,
          totalPaid: newPaid,
          balance: newBalance,
          status: (newBalance <= 0 ? 'paid' : 'pending') as 'paid' | 'pending',
        };
      }
      return patient;
    });

    setPatients(updatedPatients);
    setPayments([paymentRecord, ...payments]);

    // Auto-update CRM events upon payment
    setCrmEvents((prev) => {
      let markedOne = false;
      return prev.map((ev) => {
        if (
          ev.patientId === paymentRecord.patientId &&
          (ev.type === 'vencimiento_cuota' || ev.type === 'notificacion_cobro') &&
          ev.status !== 'completed' &&
          !markedOne
        ) {
          markedOne = true;
          return {
            ...ev,
            status: 'completed',
            completedAt: new Date().toISOString(),
          };
        }
        return ev;
      });
    });

    showToast(`Abono de $${paymentRecord.amount.toLocaleString()} registrado para ${paymentRecord.patientName}.`);

    // Async sync to Google Sheets
    syncPaymentToCloud(paymentRecord).catch(console.error);

    // Open WhatsApp receipt if requested
    if (openWhatsAppReceipt) {
      const updatedPatient = updatedPatients.find((p) => p.id === paymentRecord.patientId);
      if (updatedPatient) {
        setWhatsAppPatient(updatedPatient);
        setWhatsAppPayment(paymentRecord);
        setWhatsAppRefund(undefined);
        setWhatsAppTemplate('receipt');
        setIsWhatsAppModalOpen(true);
      }
    }
  };

  const handleSaveRefund = async (
    refundData: Omit<Refund, 'id' | 'createdAt'>,
    openWhatsApp: boolean
  ) => {
    const refundRecord: Refund = {
      ...refundData,
      id: `REI-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    setRefunds([refundRecord, ...refunds]);
    showToast(`Reintegro de $${refundRecord.amount.toLocaleString()} procesado para ${refundRecord.patientName}.`);

    // Async sync to Google Sheets
    syncRefundToCloud(refundRecord).catch(console.error);

    if (openWhatsApp) {
      const patient = patients.find((p) => p.id === refundRecord.patientId);
      if (patient) {
        setWhatsAppPatient(patient);
        setWhatsAppPayment(undefined);
        setWhatsAppRefund(refundRecord);
        setWhatsAppTemplate('refund');
        setIsWhatsAppModalOpen(true);
      }
    }
  };

  // Shortcut triggers
  const handleOpenWhatsAppReminder = (patient: Patient) => {
    setWhatsAppPatient(patient);
    setWhatsAppPayment(undefined);
    setWhatsAppRefund(undefined);
    setWhatsAppTemplate('reminder');
    setIsWhatsAppModalOpen(true);
  };

  const handleOpenWhatsAppReceipt = (patient: Patient, payment: Payment) => {
    setWhatsAppPatient(patient);
    setWhatsAppPayment(payment);
    setWhatsAppRefund(undefined);
    setWhatsAppTemplate('receipt');
    setIsWhatsAppModalOpen(true);
  };

  const handleOpenWhatsAppRefund = (patient: Patient, refund: Refund) => {
    setWhatsAppPatient(patient);
    setWhatsAppPayment(undefined);
    setWhatsAppRefund(refund);
    setWhatsAppTemplate('refund');
    setIsWhatsAppModalOpen(true);
  };

  const handleOpenNewPaymentWithPatient = (patientId?: string) => {
    setPreselectedPatientIdForPayment(patientId);
    setIsNewPaymentModalOpen(true);
  };

  const handleOpenNewRefundWithPatient = (patientId?: string) => {
    setPreselectedPatientIdForRefund(patientId);
    setIsNewRefundModalOpen(true);
  };

  const handleSaveFinancingPlans = async (
    updatedPlans: FinancingPlan[],
    singlePlan?: FinancingPlan
  ) => {
    setFinancingPlans(updatedPlans);
    saveLocalFinancingPlans(updatedPlans);

    const gasUrl = sheetConfig.gasDeploymentUrl || getEffectiveGasUrl();
    const token = await getAccessToken();
    let synced = false;

    if (gasUrl) {
      // 1. Send single plan immediately using SAVE_FINANCING_PLAN
      // This is supported across all Apps Script deployments (legacy and modern)
      if (singlePlan) {
        saveFinancingPlanToGas(gasUrl, singlePlan).catch((err) => {
          console.warn('Fallo en auto-sync saveFinancingPlanToGas:', err);
        });
        synced = true;
      }

      // 2. Also ensure entire collection is stored in Google Sheets
      try {
        await saveAllFinancingPlansToGas(gasUrl, updatedPlans);
        synced = true;
      } catch (errGas) {
        console.warn('Fallo en saveAllFinancingPlansToGas, reintentando con fallback:', errGas);
        try {
          await batchSyncToGas(gasUrl, {
            patients,
            payments,
            refunds,
            users,
            crmEvents,
            procedures,
            financingPlans: updatedPlans,
          });
          synced = true;
        } catch {
          for (const pl of updatedPlans) {
            saveFinancingPlanToGas(gasUrl, pl).catch(console.warn);
          }
          synced = true;
        }
      }
    }

    if (token && sheetConfig.spreadsheetId) {
      if (singlePlan) {
        updatePlanInGoogleSheet(token, sheetConfig.spreadsheetId, singlePlan).catch(console.warn);
      }
      try {
        await syncAllPlansToGoogleSheet(token, sheetConfig.spreadsheetId, updatedPlans);
        synced = true;
      } catch (errOAuth) {
        console.error('Error sincronizando planes con Google Sheets API:', errOAuth);
      }
    }

    if (synced) {
      const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      setSheetConfig((prev) => ({ ...prev, lastSyncTime: now }));
      showToast(`✓ Plan financiero guardado y sincronizado automáticamente en Google Sheets`);
    } else if (!gasUrl && (!token || !sheetConfig.spreadsheetId)) {
      showToast('Plan guardado localmente (conecte Google Sheets para sincronizar)');
    }
  };

  const handleDeleteFinancingPlan = async (planId: string) => {
    const updated = financingPlans.filter((p) => p.id !== planId);
    setFinancingPlans(updated);
    saveLocalFinancingPlans(updated);

    const gasUrl = sheetConfig.gasDeploymentUrl || getEffectiveGasUrl();
    const token = await getAccessToken();

    if (gasUrl) {
      deleteFinancingPlanFromGas(gasUrl, planId).catch(console.warn);
      saveAllFinancingPlansToGas(gasUrl, updated).catch(console.warn);
    }
    if (token && sheetConfig.spreadsheetId) {
      deletePlanFromGoogleSheet(token, sheetConfig.spreadsheetId, planId).catch(console.warn);
    }
    showToast('Plan de financiamiento eliminado de la app y de Google Sheets');
  };

  const handleSaveProcedures = async (
    updatedProcedures: SurgicalProcedure[],
    singleProcedure?: SurgicalProcedure
  ) => {
    setProcedures(updatedProcedures);
    saveLocalProcedures(updatedProcedures);

    const gasUrl = sheetConfig.gasDeploymentUrl || getEffectiveGasUrl();
    const token = await getAccessToken();
    let synced = false;
    let syncErrorMessage: string | null = null;

    if (gasUrl) {
      // Eliminar cualquier pestaña singular "Procedimiento" duplicada
      cleanupProcedureSheetsInGas(gasUrl).catch(console.warn);

      try {
        if (singleProcedure) {
          try {
            await saveProcedureToGas(gasUrl, singleProcedure);
            synced = true;
            // Sincronizar el catálogo completo en segundo plano
            saveAllProceduresToGas(gasUrl, updatedProcedures).catch(console.warn);
          } catch (errSingle: any) {
            console.warn('Fallo en saveProcedureToGas, intentando saveAllProceduresToGas:', errSingle);
            await saveAllProceduresToGas(gasUrl, updatedProcedures);
            synced = true;
          }
        } else {
          await saveAllProceduresToGas(gasUrl, updatedProcedures);
          synced = true;
        }
      } catch (errGas: any) {
        console.warn('Fallo guardando procedimiento en Google Apps Script:', errGas);
        syncErrorMessage = errGas.message || 'Error al comunicarse con Google Apps Script';
      }
    }

    if (token && sheetConfig.spreadsheetId) {
      try {
        if (singleProcedure) {
          await updateProcedureInGoogleSheet(token, sheetConfig.spreadsheetId, singleProcedure);
        }
        await syncAllProceduresToGoogleSheet(token, sheetConfig.spreadsheetId, updatedProcedures);
        synced = true;
      } catch (errOAuth: any) {
        console.error('Error sincronizando procedimientos con Google Sheets API:', errOAuth);
        if (!synced) {
          syncErrorMessage = errOAuth.message || 'Error con Google Sheets API';
        }
      }
    }

    if (synced) {
      const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      setSheetConfig((prev) => ({ ...prev, lastSyncTime: now }));
      showToast('✓ Procedimiento guardado y registrado en la pestaña "Procedimientos" de Google Sheets');
    } else if (syncErrorMessage) {
      if (
        syncErrorMessage.includes('SAVE_PROCEDURE') ||
        syncErrorMessage.includes('actualizarse') ||
        syncErrorMessage.includes('Acción no reconocida')
      ) {
        showToast(
          '⚠️ Procedimiento guardado en la app. En Google Sheets ve a: Extensiones > Apps Script > Implementar > Administrar implementaciones > Editar > "Nueva versión" para recibirlo en la hoja Procedimientos.'
        );
      } else {
        showToast(`Procedimiento guardado en la app. Google Sheets: ${syncErrorMessage}`);
      }
    } else if (!gasUrl && (!token || !sheetConfig.spreadsheetId)) {
      showToast('Procedimiento guardado localmente (conecta Google Sheets para sincronizar en la nube)');
    }
  };

  const handleDeleteProcedure = async (procedureId: string) => {
    const updated = procedures.filter((p) => p.id !== procedureId);
    setProcedures(updated);
    saveLocalProcedures(updated);

    const gasUrl = sheetConfig.gasDeploymentUrl || getEffectiveGasUrl();
    const token = await getAccessToken();

    if (gasUrl) {
      deleteProcedureFromGas(gasUrl, procedureId).catch(console.warn);
      saveAllProceduresToGas(gasUrl, updated).catch(console.warn);
    }
    if (token && sheetConfig.spreadsheetId) {
      deleteProcedureFromGoogleSheet(token, sheetConfig.spreadsheetId, procedureId).catch(console.warn);
    }
    showToast('Procedimiento eliminado del catálogo y de Google Sheets');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col md:flex-row selection:bg-amber-100 selection:text-amber-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar Menu */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        sheetConfig={sheetConfig}
        users={users}
        activeUserId={activeUserId}
        rolePrivileges={rolePrivileges}
        onOpenNewPayment={() => handleOpenNewPaymentWithPatient()}
        onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
        onOpenNewRefund={() => handleOpenNewRefundWithPatient()}
        onOpenMonthlyReport={() => setIsMonthlyReportModalOpen(true)}
        onOpenSheetSettings={() => setIsSheetSettingsModalOpen(true)}
        onManualSync={handleUnifiedSync}
        onSignInGoogle={handleSignInGoogle}
        onSignOutGoogle={handleSignOutGoogle}
        onDenyNonSuperAdminSheetAccess={handleDenyNonSuperAdminSheetAccess}
        onOpenProfileModal={() => setIsUserProfileModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        branding={branding}
        crmPendingCount={crmPendingCount}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 min-w-0 md:ml-72 flex flex-col min-h-screen">
        {/* Top Header / Breadcrumb Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-1.5">
              <span>Dr. Belleza - Cobranza</span>
              <span>•</span>
              <span>Dr. Jorge Apelencia</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline capitalize">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard de Cobranza & Métricas'}
              {activeTab === 'crm' && 'CRM - Gestión de Eventos & Cobranzas'}
              {activeTab === 'patients' && 'Pacientes & Planes Quirúrgicos'}
              {activeTab === 'payments' && 'Historial de Abonos & Facturación'}
              {activeTab === 'refunds' && 'Gestión de Reintegros'}
              {activeTab === 'users' && 'Gestión de Usuarios & Control de Accesos'}
              {activeTab === 'settings' && 'Configuración del Sistema & Catálogo'}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Google Sheets status button */}
            <button
              onClick={() => {
                if (isSuperAdmin) setIsSheetSettingsModalOpen(true);
                else handleDenyNonSuperAdminSheetAccess();
              }}
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isSuperAdmin
                  ? (sheetConfig.spreadsheetId || sheetConfig.gasDeploymentUrl)
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
              title={
                isSuperAdmin
                  ? 'Configuración y sincronización con Google Sheets'
                  : 'Solo Super Administrador puede configurar Google Sheets'
              }
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline">
                {(sheetConfig.spreadsheetId || sheetConfig.gasDeploymentUrl) ? 'Sheets Conectado' : 'Google Sheets'}
              </span>
              {!isSuperAdmin && <Lock className="w-3 h-3 text-purple-600 ml-0.5" />}
            </button>

            {/* Top Right User Profile Header & Session Management */}
            <UserProfileHeader
              currentUser={activeUser}
              activeUser={activeUser}
              users={users}
              onOpenProfile={() => setIsUserProfileModalOpen(true)}
              onOpenProfileModal={() => setIsUserProfileModalOpen(true)}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {!activeUser ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-md mx-auto shadow-sm my-16">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Acceso al Sistema Requerido</h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Por favor ingrese con su correo electrónico y contraseña registrados para acceder a los módulos de cobranza según su perfil y privilegios asignados.
              </p>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center space-x-2"
              >
                <span>Iniciar Sesión</span>
              </button>
            </div>
          ) : !isTabAllowed(activeTab) ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center max-w-lg mx-auto shadow-sm my-12">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Acceso No Autorizado</h2>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Su perfil de usuario actual (<strong>{activeUser?.fullName}</strong> — <span className="font-semibold capitalize">{activeUser?.role}</span>) no cuenta con privilegios configurados para acceder a esta sección.
              </p>
              <button
                onClick={() => {
                  if (currentPrivilege?.canViewDashboard) setActiveTab('dashboard');
                  else if (currentPrivilege?.canManagePatients) setActiveTab('patients');
                  else if (currentPrivilege?.canRegisterPayments) setActiveTab('payments');
                  else if (currentPrivilege?.canRegisterRefunds) setActiveTab('refunds');
                  else setActiveTab('dashboard');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Volver a su pantalla autorizada
              </button>
            </div>
          ) : (
            <>
              {/* Active Tab Views */}
              {activeTab === 'dashboard' && (
                <DashboardStats
                  patients={patients}
                  payments={payments}
                  refunds={refunds}
                  onOpenWhatsApp={handleOpenWhatsAppReminder}
                  onOpenNewPayment={handleOpenNewPaymentWithPatient}
                  onViewPatientsTab={() => setActiveTab('patients')}
                  onViewPaymentsTab={() => setActiveTab('payments')}
                />
              )}

              {activeTab === 'crm' && (
                <CRMModule
                  events={crmEvents}
                  patients={patients}
                  users={users}
                  onSaveEvents={(updated) => setCrmEvents(updated)}
                  onOpenWhatsAppModal={(patient) => handleOpenWhatsAppReminder(patient)}
                />
              )}

              {activeTab === 'patients' && (
                <PatientTable
                  patients={patients}
                  payments={payments}
                  refunds={refunds}
                  onOpenWhatsApp={handleOpenWhatsAppReminder}
                  onOpenNewPayment={handleOpenNewPaymentWithPatient}
                  onOpenNewRefund={handleOpenNewRefundWithPatient}
                  onSelectPatientDetails={(p) => setSelectedPatientForDetails(p)}
                  onEditPatient={handleOpenEditPatient}
                  onDeletePatient={handleDeletePatient}
                />
              )}

              {activeTab === 'payments' && (
                <PaymentsTable
                  payments={payments}
                  patients={patients}
                  onOpenWhatsAppReceipt={handleOpenWhatsAppReceipt}
                  onOpenNewPayment={() => handleOpenNewPaymentWithPatient()}
                />
              )}

              {activeTab === 'refunds' && (
                <RefundsTable
                  refunds={refunds}
                  patients={patients}
                  onOpenWhatsAppRefund={handleOpenWhatsAppRefund}
                  onOpenNewRefund={() => handleOpenNewRefundWithPatient()}
                />
              )}

              {activeTab === 'users' && (
                <UsersModule
                  users={users}
                  activeUserId={activeUserId}
                  onSaveUser={handleSaveUser}
                  onDeleteUser={handleDeleteUser}
                  onToggleUserStatus={handleToggleUserStatus}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsModule
                  procedures={procedures}
                  onSaveProcedures={handleSaveProcedures}
                  onDeleteProcedure={handleDeleteProcedure}
                  coupons={coupons}
                  onSaveCoupons={setCoupons}
                  branding={branding}
                  onSaveBranding={setBranding}
                  rolePrivileges={rolePrivileges}
                  onSaveRolePrivileges={setRolePrivileges}
                  financingPlans={financingPlans}
                  onSaveFinancingPlans={handleSaveFinancingPlans}
                  onDeleteFinancingPlan={handleDeleteFinancingPlan}
                  activeUser={activeUser}
                  onNavigateToUsers={() => setActiveTab('users')}
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto py-5 text-xs text-slate-500">
          <div className="px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800">Dr. Belleza - Cobranza</span>
              <span>•</span>
              <span>Dr. Jorge Apelencia • Cirugía Plástica & Medicina Estética</span>
            </div>

            <div className="flex items-center space-x-4 text-[11px]">
              <button
                onClick={() => {
                  if (isSuperAdmin) setIsSheetSettingsModalOpen(true);
                  else handleDenyNonSuperAdminSheetAccess();
                }}
                className="hover:text-emerald-700 font-medium flex items-center space-x-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {(sheetConfig.spreadsheetId || sheetConfig.gasDeploymentUrl) ? 'Google Sheets Conectado' : 'Conectar Google Sheets'}
                </span>
                {!isSuperAdmin && (
                  <span className="text-[10px] text-purple-600 font-semibold">(Super Admin)</span>
                )}
              </button>
              <button
                onClick={() => setIsMonthlyReportModalOpen(true)}
                className="hover:text-blue-700 font-medium cursor-pointer"
              >
                Reportes PDF
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSavePatient={handleSavePatient}
        availableProcedures={procedures}
        availableCoupons={coupons}
        availableFinancingPlans={financingPlans}
        branding={branding}
      />

      <EditPatientModal
        isOpen={isEditPatientModalOpen}
        onClose={() => {
          setIsEditPatientModalOpen(false);
          setPatientToEdit(null);
        }}
        patient={patientToEdit}
        onSavePatient={handleUpdatePatient}
        availableProcedures={procedures}
      />

      <NewPaymentModal
        isOpen={isNewPaymentModalOpen}
        onClose={() => setIsNewPaymentModalOpen(false)}
        patients={patients}
        preselectedPatientId={preselectedPatientIdForPayment}
        onSavePayment={handleSavePayment}
      />

      <NewRefundModal
        isOpen={isNewRefundModalOpen}
        onClose={() => setIsNewRefundModalOpen(false)}
        patients={patients}
        preselectedPatientId={preselectedPatientIdForRefund}
        onSaveRefund={handleSaveRefund}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        patient={whatsAppPatient}
        payment={whatsAppPayment}
        refund={whatsAppRefund}
        initialTemplate={whatsAppTemplate}
      />

      <MonthlyReportModal
        isOpen={isMonthlyReportModalOpen}
        onClose={() => setIsMonthlyReportModalOpen(false)}
        patients={patients}
        payments={payments}
        refunds={refunds}
      />

      <PatientDetailModal
        isOpen={!!selectedPatientForDetails}
        onClose={() => setSelectedPatientForDetails(null)}
        patient={selectedPatientForDetails}
        payments={payments}
        refunds={refunds}
        onOpenWhatsApp={handleOpenWhatsAppReminder}
        onOpenNewPayment={handleOpenNewPaymentWithPatient}
        onOpenNewRefund={handleOpenNewRefundWithPatient}
        onEditPatient={handleOpenEditPatient}
      />

      <GoogleSheetsSettingsModal
        isOpen={isSheetSettingsModalOpen}
        onClose={() => setIsSheetSettingsModalOpen(false)}
        currentUser={currentUser}
        sheetConfig={sheetConfig}
        isSuperAdmin={isSuperAdmin}
        activeUserName={activeUser ? `${activeUser.fullName} (${activeUser.role})` : 'Sin sesión'}
        onSignInGoogle={handleSignInGoogle}
        onCreateNewSheet={handleCreateNewSheet}
        onConnectExistingSheet={handleConnectExistingSheet}
        onSyncAllToSheet={handleSyncAllToSheet}
        onImportFromSheet={handleImportFromSheet}
        onSaveGasConfig={handleConnectGas}
        onDisconnectGas={handleDisconnectGas}
        onSyncAllToGas={handleSyncAllToGas}
        onImportFromGas={handleImportFromGas}
        onCleanupProcedureSheets={handleCleanupProcedureSheets}
      />

      {/* User Profile Details & Password Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        currentUser={activeUser || users[0]}
        privileges={rolePrivileges}
        onUpdateUser={handleUpdateCurrentUser}
        onLogout={handleLogout}
      />

      {/* Email & Password Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen || !activeUser}
        isMandatory={!activeUser}
        onClose={() => {
          if (activeUser) {
            setIsLoginModalOpen(false);
          }
        }}
        users={users}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
