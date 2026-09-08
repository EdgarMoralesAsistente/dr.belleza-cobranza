import React from 'react';
import {
  FileSpreadsheet,
  PlusCircle,
  FileText,
  UserPlus,
  RefreshCw,
  LogOut,
  Sparkles,
  DollarSign,
  Undo2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ActiveTab, GoogleSheetConfig } from '../types';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  sheetConfig: GoogleSheetConfig;
  onOpenNewPayment: () => void;
  onOpenNewPatient: () => void;
  onOpenNewRefund: () => void;
  onOpenMonthlyReport: () => void;
  onOpenSheetSettings: () => void;
  onManualSync: () => void;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  sheetConfig,
  onOpenNewPayment,
  onOpenNewPatient,
  onOpenNewRefund,
  onOpenMonthlyReport,
  onOpenSheetSettings,
  onManualSync,
  onSignInGoogle,
  onSignOutGoogle,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Bar with brand and Google Sheets status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Clinic Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-300 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  Dr. Belleza
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Cobranza
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Dr. Jorge Apelencia • Cirugía & Medicina Estética
              </p>
            </div>
          </div>

          {/* Google Sheets Sync & Auth Indicator */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Google Sheets connection badge */}
            <button
              onClick={onOpenSheetSettings}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
              title="Configuración de sincronización con Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Google Sheets:</span>
              {sheetConfig.spreadsheetId ? (
                <span className="flex items-center text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Conectado
                </span>
              ) : (
                <span className="flex items-center text-amber-700 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  Sin Vincular
                </span>
              )}
            </button>

            {/* Quick sync button if connected */}
            {sheetConfig.spreadsheetId && (
              <button
                onClick={onManualSync}
                disabled={sheetConfig.isSyncing}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
                title="Sincronizar ahora con Google Sheets"
              >
                <RefreshCw className={`w-4 h-4 ${sheetConfig.isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            )}

            {/* Google User Login / Profile */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuario'}
                    className="w-7 h-7 rounded-full border border-slate-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-700 hidden md:inline max-w-[120px] truncate">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={onSignOutGoogle}
                  className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors"
                  title="Cerrar sesión de Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignInGoogle}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-sm transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span>Acceder con Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Action Toolbar & Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 border-t border-slate-100 gap-3">
          {/* Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'patients'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Pacientes & Cobros
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'payments'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Historial de Abonos
            </button>
            <button
              onClick={() => setActiveTab('refunds')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'refunds'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Reintegros
            </button>
          </nav>

          {/* Fast Actions for the Secretary */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={onOpenNewPayment}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors whitespace-nowrap"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Registrar Abono</span>
            </button>
            <button
              onClick={onOpenNewPatient}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Nueva Paciente</span>
            </button>
            <button
              onClick={onOpenNewRefund}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-rose-700 transition-colors whitespace-nowrap"
            >
              <Undo2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Reintegro</span>
            </button>
            <button
              onClick={onOpenMonthlyReport}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors whitespace-nowrap"
              title="Exportar Reporte Mensual en PDF"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Reporte PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
