import React, { useState } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Users,
  CreditCard,
  Undo2,
  ShieldCheck,
  FileSpreadsheet,
  RefreshCw,
  PlusCircle,
  FileText,
  UserPlus,
  DollarSign,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Lock,
  ChevronDown,
  Menu,
  X,
  ArrowRightLeft,
  Settings,
  HeartPulse,
  Stethoscope,
  Award,
  Kanban,
} from 'lucide-react';
import { ActiveTab, GoogleSheetConfig, SystemUser, UserRole, AppBrandingConfig, RolePrivilege } from '../types';
import { User } from 'firebase/auth';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  sheetConfig: GoogleSheetConfig;
  users: SystemUser[];
  activeUserId?: string | null;
  onSelectActiveUser?: (userId: string) => void;
  onOpenNewPayment: () => void;
  onOpenNewPatient: () => void;
  onOpenNewRefund: () => void;
  onOpenMonthlyReport: () => void;
  onOpenSheetSettings: () => void;
  onManualSync: () => void;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
  onDenyNonSuperAdminSheetAccess: () => void;
  onOpenProfileModal?: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  branding?: AppBrandingConfig;
  crmPendingCount?: number;
  rolePrivileges?: RolePrivilege[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  sheetConfig,
  users,
  activeUserId,
  onSelectActiveUser,
  onOpenNewPayment,
  onOpenNewPatient,
  onOpenNewRefund,
  onOpenMonthlyReport,
  onOpenSheetSettings,
  onManualSync,
  onSignInGoogle,
  onSignOutGoogle,
  onDenyNonSuperAdminSheetAccess,
  onOpenProfileModal,
  onOpenLoginModal,
  onLogout,
  branding,
  crmPendingCount,
  rolePrivileges,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeUser = activeUserId ? users.find((u) => u.id === activeUserId) || null : null;
  const isSuperAdmin = activeUser?.role === 'super_admin';
  const userPrivilege = activeUser ? rolePrivileges?.find((p) => p.role === activeUser.role) : null;

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const handleSheetClick = () => {
    if (userPrivilege ? userPrivilege.canAccessGoogleSheets : isSuperAdmin) {
      onOpenSheetSettings();
    } else {
      onDenyNonSuperAdminSheetAccess();
    }
  };

  const BrandIconComponent =
    branding?.logoIcon === 'Stethoscope'
      ? Stethoscope
      : branding?.logoIcon === 'HeartPulse'
      ? HeartPulse
      : branding?.logoIcon === 'ShieldCheck'
      ? ShieldCheck
      : branding?.logoIcon === 'Award'
      ? Award
      : Sparkles;

  const allNavItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    allowed: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard General',
      icon: LayoutDashboard,
      allowed: activeUser ? (userPrivilege ? userPrivilege.canViewDashboard : true) : false,
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Kanban,
      badge: crmPendingCount && crmPendingCount > 0 ? crmPendingCount : undefined,
      allowed: activeUser ? (userPrivilege ? userPrivilege.canManagePatients : true) : false,
    },
    {
      id: 'patients',
      label: 'Pacientes & Cobranza',
      icon: Users,
      allowed: activeUser ? (userPrivilege ? userPrivilege.canManagePatients : true) : false,
    },
    {
      id: 'payments',
      label: 'Historial de Abonos',
      icon: CreditCard,
      allowed: activeUser
        ? userPrivilege
          ? userPrivilege.canRegisterPayments || userPrivilege.canViewDashboard
          : true
        : false,
    },
    {
      id: 'refunds',
      label: 'Reintegros',
      icon: Undo2,
      allowed: activeUser ? (userPrivilege ? userPrivilege.canRegisterRefunds : true) : false,
    },
    {
      id: 'users',
      label: 'Gestión de Usuarios',
      icon: ShieldCheck,
      badge: users.length,
      allowed: activeUser
        ? userPrivilege
          ? userPrivilege.canManageUsers
          : activeUser.role === 'super_admin' || activeUser.role === 'admin'
        : false,
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      allowed: activeUser
        ? userPrivilege
          ? userPrivilege.canManageSettings
          : activeUser.role === 'super_admin' || activeUser.role === 'admin'
        : false,
    },
  ];

  const navItems = allNavItems.filter((item) => item.allowed);

  return (
    <>
      {/* Mobile Top Header with Hamburger */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2.5">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="Logo"
              className="w-8 h-8 rounded-lg object-contain border border-slate-200 bg-white shadow-2xs"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center text-white shadow-2xs">
              <BrandIconComponent className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900">
                {branding?.clinicName || 'Dr. Belleza'}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                {branding?.tagline || 'Cobranza'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {branding?.doctorName || 'Dr. Jorge Apelencia'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {(sheetConfig.spreadsheetId || sheetConfig.gasDeploymentUrl) && (
            <button
              onClick={onManualSync}
              disabled={sheetConfig.isSyncing}
              className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              title="Actualizar datos con Google Sheets"
            >
              <RefreshCw
                className={`w-4 h-4 ${sheetConfig.isSyncing ? 'animate-spin text-emerald-600' : 'text-slate-600'}`}
              />
            </button>
          )}

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white text-slate-800 flex flex-col border-r border-slate-200 shadow-xs transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt="Logo"
                className="w-9 h-9 rounded-xl object-contain border border-slate-200 bg-white shadow-xs shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-xs shrink-0">
                <BrandIconComponent className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base text-slate-900 tracking-tight">
                  {branding?.clinicName || 'Dr. Belleza'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 uppercase tracking-wide">
                  {branding?.tagline || 'Cobranza'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">
                {branding?.doctorName || 'Dr. Jorge Apelencia'}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas (2 columnas x 2 filas) justo debajo del logo */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Acciones Rápidas
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {Boolean(activeUser && (!userPrivilege || userPrivilege.canRegisterPayments)) && (
              <button
                onClick={() => {
                  onOpenNewPayment();
                  setIsMobileOpen(false);
                }}
                className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer justify-start shadow-2xs"
                title="Registrar Abono"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">+ Abono</span>
              </button>
            )}

            {Boolean(activeUser && (!userPrivilege || userPrivilege.canManagePatients)) && (
              <button
                onClick={() => {
                  onOpenNewPatient();
                  setIsMobileOpen(false);
                }}
                className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer justify-start shadow-2xs"
                title="Nueva Paciente"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span className="truncate">+ Paciente</span>
              </button>
            )}

            {Boolean(activeUser && (!userPrivilege || userPrivilege.canRegisterRefunds)) && (
              <button
                onClick={() => {
                  onOpenNewRefund();
                  setIsMobileOpen(false);
                }}
                className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors cursor-pointer justify-start shadow-2xs"
                title="Registrar Reintegro"
              >
                <Undo2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">Reintegro</span>
              </button>
            )}

            {Boolean(activeUser && (!userPrivilege || userPrivilege.canExportReports)) && (
              <button
                onClick={() => {
                  onOpenMonthlyReport();
                  setIsMobileOpen(false);
                }}
                className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-colors cursor-pointer justify-start shadow-2xs"
                title="Reporte Mensual en PDF"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Reporte PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menú Principal
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Google Sheets Connection Block (RBAC Guarded) */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div
            className={`p-3 rounded-xl border transition-all ${
              isSuperAdmin
                ? 'bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                : 'bg-slate-50/60 border-slate-200/60 opacity-90'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-900">Google Sheets</span>
              </div>
              {isSuperAdmin ? (
                (sheetConfig.spreadsheetId || sheetConfig.gasDeploymentUrl) ? (
                  <span className="flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-emerald-600" />
                    Conectado
                  </span>
                ) : (
                  <span className="flex items-center text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    <AlertCircle className="w-2.5 h-2.5 mr-0.5 text-amber-600" />
                    Sin Vincular
                  </span>
                )
              ) : (
                <span className="flex items-center text-[10px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                  <Lock className="w-2.5 h-2.5 mr-0.5 text-purple-600" />
                  Solo Super Admin
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-500 leading-tight mb-2.5">
              {isSuperAdmin
                ? (sheetConfig.spreadsheetId || sheetConfig.gasDeploymentUrl)
                  ? 'Base de datos sincronizada en tiempo real.'
                  : 'Vincule una hoja para sincronización en la nube.'
                : 'Configuración exclusiva para el perfil Super Administrador.'}
            </p>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleSheetClick}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center space-x-1 shadow-2xs ${
                  isSuperAdmin
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 hover:text-slate-500'
                }`}
              >
                {!isSuperAdmin && <Lock className="w-3 h-3 mr-1 text-purple-600" />}
                <span>{isSuperAdmin ? 'Configuración Sheets' : 'Acceso Restringido'}</span>
              </button>

              {(sheetConfig.spreadsheetId || sheetConfig.gasDeploymentUrl) && (
                <button
                  onClick={onManualSync}
                  disabled={sheetConfig.isSyncing}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-300 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                  title="Actualizar datos con Google Sheets"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      sheetConfig.isSyncing ? 'animate-spin text-emerald-600' : ''
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Google Account Profile / Sign In */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2 min-w-0">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google'}
                      className="w-6 h-6 rounded-full border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#25D366] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-[11px] text-slate-700 font-medium truncate max-w-[150px]">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <button
                  onClick={onSignOutGoogle}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Cerrar sesión de Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignInGoogle}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              >
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Conectar Cuenta Google</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
