import React, { useState, useEffect } from 'react';
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
  appendPaymentToGoogleSheet,
  appendRefundToGoogleSheet,
} from './services/googleSheets';
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
  const [activeUserId, setActiveUserId] = useState<string>(loadActiveUserId);

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

  // Current active user & RBAC determination
  const activeUser = users.find((u) => u.id === activeUserId) || users[0] || {
    id: 'USR-101',
    fullName: 'Dr. Jorge Apelencia',
    email: 'jorge.apelencia@drbelleza.com',
    role: 'super_admin' as const,
    isActive: true,
    createdAt: '2026-01-15',
  };
  const isSuperAdmin = activeUser.role === 'super_admin';

  const handleSaveUser = (userData: Omit<SystemUser, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...userData } : u))
      );
      showToast(`Usuario "${userData.fullName}" actualizado correctamente.`);
    } else {
      const newUser: SystemUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString().split('T')[0],
        ...userData,
      };
      setUsers((prev) => [...prev, newUser]);
      showToast(`Usuario "${userData.fullName}" creado con perfil ${userData.role}.`);
    }
  };

  const handleDeleteUser = (id: string) => {
    const userToDelete = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (activeUserId === id) {
      const remaining = users.filter((u) => u.id !== id);
      if (remaining.length > 0) {
        setActiveUserId(remaining[0].id);
      }
    }
    showToast(`Usuario "${userToDelete?.fullName || id}" eliminado del sistema.`);
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updatedStatus = !u.isActive;
          showToast(`Usuario "${u.fullName}" ${updatedStatus ? 'activado' : 'desactivado'}.`);
          return { ...u, isActive: updatedStatus };
        }
        return u;
      })
    );
  };

  const handleSelectActiveUser = (userId: string) => {
    setActiveUserId(userId);
    const u = users.find((item) => item.id === userId);
    if (u) {
      showToast(`Sesión activa cambiada a: ${u.fullName} (${u.role})`);
    }
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
      await syncAllToGoogleSheet(token, sheetId, patients, payments, refunds);

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
      await syncAllToGoogleSheet(token, sheetConfig.spreadsheetId, patients, payments, refunds);
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
      const token = await getAccessToken();
      if (token && sheetConfig.spreadsheetId) {
        appendPaymentToGoogleSheet(token, sheetConfig.spreadsheetId, paymentRecord).catch(console.error);
      }
    }

    const updatedPatients = [newPatient, ...patients];
    setPatients(updatedPatients);
    showToast(`Paciente ${newPatient.fullName} registrada exitosamente.`);

    // Async sync to Google Sheets if connected
    const token = await getAccessToken();
    if (token && sheetConfig.spreadsheetId) {
      appendPatientToGoogleSheet(token, sheetConfig.spreadsheetId, newPatient)
        .then(() => {
          setSheetConfig((prev) => ({ ...prev, lastSyncTime: new Date().toLocaleTimeString('es-ES') }));
        })
        .catch(console.error);
    }
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
    showToast(`Abono de $${paymentRecord.amount.toLocaleString()} registrado para ${paymentRecord.patientName}.`);

    // Async sync to Google Sheets
    const token = await getAccessToken();
    if (token && sheetConfig.spreadsheetId) {
      appendPaymentToGoogleSheet(token, sheetConfig.spreadsheetId, paymentRecord)
        .then(() => {
          setSheetConfig((prev) => ({ ...prev, lastSyncTime: new Date().toLocaleTimeString('es-ES') }));
        })
        .catch(console.error);
    }

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
    const token = await getAccessToken();
    if (token && sheetConfig.spreadsheetId) {
      appendRefundToGoogleSheet(token, sheetConfig.spreadsheetId, refundRecord)
        .then(() => {
          setSheetConfig((prev) => ({ ...prev, lastSyncTime: new Date().toLocaleTimeString('es-ES') }));
        })
        .catch(console.error);
    }

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
        onSelectActiveUser={handleSelectActiveUser}
        onOpenNewPayment={() => handleOpenNewPaymentWithPatient()}
        onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
        onOpenNewRefund={() => handleOpenNewRefundWithPatient()}
        onOpenMonthlyReport={() => setIsMonthlyReportModalOpen(true)}
        onOpenSheetSettings={() => setIsSheetSettingsModalOpen(true)}
        onManualSync={handleSyncAllToSheet}
        onSignInGoogle={handleSignInGoogle}
        onSignOutGoogle={handleSignOutGoogle}
        onDenyNonSuperAdminSheetAccess={handleDenyNonSuperAdminSheetAccess}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 min-w-0 md:ml-72 flex flex-col min-h-screen">
        {/* Top Header / Breadcrumb Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
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
              {activeTab === 'patients' && 'Pacientes & Planes Quirúrgicos'}
              {activeTab === 'payments' && 'Historial de Abonos & Facturación'}
              {activeTab === 'refunds' && 'Gestión de Reintegros'}
              {activeTab === 'users' && 'Gestión de Usuarios & Control de Accesos'}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Active User session pill */}
            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Sesión:</span>
              <span className="font-bold text-slate-800 text-xs truncate max-w-[120px] sm:max-w-none">
                {activeUser.fullName}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                {activeUser.role}
              </span>
            </div>

            {/* Quick Google Sheets status button */}
            <button
              onClick={() => {
                if (isSuperAdmin) setIsSheetSettingsModalOpen(true);
                else handleDenyNonSuperAdminSheetAccess();
              }}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isSuperAdmin
                  ? sheetConfig.spreadsheetId
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
              <span>
                {sheetConfig.spreadsheetId ? 'Sheets Conectado' : 'Google Sheets'}
              </span>
              {!isSuperAdmin && <Lock className="w-3 h-3 text-purple-600 ml-0.5" />}
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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

          {activeTab === 'patients' && (
            <PatientTable
              patients={patients}
              payments={payments}
              refunds={refunds}
              onOpenWhatsApp={handleOpenWhatsAppReminder}
              onOpenNewPayment={handleOpenNewPaymentWithPatient}
              onOpenNewRefund={handleOpenNewRefundWithPatient}
              onSelectPatientDetails={(p) => setSelectedPatientForDetails(p)}
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
              onSelectActiveUser={handleSelectActiveUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
              onToggleUserStatus={handleToggleUserStatus}
            />
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
                  {sheetConfig.spreadsheetId ? 'Google Sheets Conectado' : 'Conectar Google Sheets'}
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
      />

      <GoogleSheetsSettingsModal
        isOpen={isSheetSettingsModalOpen}
        onClose={() => setIsSheetSettingsModalOpen(false)}
        currentUser={currentUser}
        sheetConfig={sheetConfig}
        isSuperAdmin={isSuperAdmin}
        activeUserName={`${activeUser.fullName} (${activeUser.role})`}
        onSignInGoogle={handleSignInGoogle}
        onCreateNewSheet={handleCreateNewSheet}
        onConnectExistingSheet={handleConnectExistingSheet}
        onSyncAllToSheet={handleSyncAllToSheet}
        onImportFromSheet={handleImportFromSheet}
      />
    </div>
  );
}
