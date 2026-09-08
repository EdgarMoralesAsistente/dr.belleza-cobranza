import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Link2,
  DownloadCloud,
  UploadCloud,
  ShieldCheck,
} from 'lucide-react';
import { GoogleSheetConfig } from '../types';
import { User } from 'firebase/auth';

interface GoogleSheetsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  sheetConfig: GoogleSheetConfig;
  isSuperAdmin?: boolean;
  activeUserName?: string;
  onSignInGoogle: () => void;
  onCreateNewSheet: () => Promise<void>;
  onConnectExistingSheet: (idOrUrl: string) => Promise<void>;
  onSyncAllToSheet: () => Promise<void>;
  onImportFromSheet: () => Promise<void>;
}

export const GoogleSheetsSettingsModal: React.FC<GoogleSheetsSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  sheetConfig,
  isSuperAdmin = true,
  activeUserName,
  onSignInGoogle,
  onCreateNewSheet,
  onConnectExistingSheet,
  onSyncAllToSheet,
  onImportFromSheet,
}) => {
  const [existingIdInput, setExistingIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  if (!isSuperAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden p-6 text-center animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Acceso Exclusivo Super Administrador
          </h2>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Por política de seguridad y roles del sistema Dr. Belleza, únicamente el perfil de{' '}
            <strong className="text-purple-700 font-semibold">Super Administrador (Dr. Jorge Apelencia)</strong>{' '}
            posee permisos para vincular, sincronizar o alterar la integración con Google Sheets.
          </p>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-800 text-left mb-5">
            <p className="font-semibold mb-0.5">Perfil actual:</p>
            <p>{activeUserName || 'Usuario sin privilegios de Super Administrador'}</p>
            <p className="text-[10px] text-purple-600 mt-1">
              Para probar o administrar la conexión, seleccione el perfil de <strong>Dr. Jorge Apelencia (Super Administrador)</strong> en el menú lateral.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Entendido, Volver al Sistema
          </button>
        </div>
      </div>
    );
  }

  const handleCreateSheet = async () => {
    setIsLoading(true);
    setActionSuccessMessage(null);
    try {
      await onCreateNewSheet();
      setActionSuccessMessage('¡Hoja de cálculo creada y vinculada exitosamente!');
    } catch (e: any) {
      alert(e.message || 'Error al crear la hoja en Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingIdInput.trim()) return;

    setIsLoading(true);
    setActionSuccessMessage(null);
    try {
      await onConnectExistingSheet(existingIdInput.trim());
      setActionSuccessMessage('¡Hoja vinculada y sincronizada correctamente!');
      setExistingIdInput('');
    } catch (e: any) {
      alert(e.message || 'Error al conectar con la hoja indicada');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setIsLoading(true);
    setActionSuccessMessage(null);
    try {
      await onSyncAllToSheet();
      setActionSuccessMessage('¡Todos los datos locales fueron volcados a Google Sheets!');
    } catch (e: any) {
      alert(e.message || 'Error al sincronizar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportNow = async () => {
    if (!window.confirm('¿Desea importar los datos desde Google Sheets a la aplicación? Esto actualizará la lista de pacientes, abonos y reintegros.')) {
      return;
    }
    setIsLoading(true);
    setActionSuccessMessage(null);
    try {
      await onImportFromSheet();
      setActionSuccessMessage('¡Datos importados y actualizados con éxito desde Google Sheets!');
    } catch (e: any) {
      alert(e.message || 'Error al importar datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-emerald-700 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Integración con Google Sheets
              </h2>
              <p className="text-xs text-emerald-100">
                Dr. Belleza - Base de Datos en la Nube del Dr. Jorge Apelencia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status Message */}
          {actionSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
          )}

          {/* User Auth Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cuenta de Google
              </span>
              {currentUser ? (
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-900">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <span className="text-[11px] text-slate-500">({currentUser.email})</span>
                </div>
              ) : (
                <p className="text-xs text-amber-800 font-medium mt-1">
                  No has iniciado sesión con Google. Conecta tu cuenta para sincronizar con Google Sheets.
                </p>
              )}
            </div>

            {!currentUser && (
              <button
                type="button"
                onClick={onSignInGoogle}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 shadow-xs flex items-center space-x-2 shrink-0 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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

          {/* Current Sheet Connection Status */}
          {sheetConfig.spreadsheetId ? (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-emerald-950">
                    Hoja Conectada y Activa
                  </span>
                </div>
                {sheetConfig.spreadsheetUrl && (
                  <a
                    href={sheetConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1"
                  >
                    <span>Abrir Hoja</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <p>
                  <strong>ID:</strong> {sheetConfig.spreadsheetId}
                </p>
                {sheetConfig.lastSyncTime && (
                  <p className="text-slate-500 font-sans">
                    Última sincronización: {sheetConfig.lastSyncTime}
                  </p>
                )}
              </div>

              {/* Sync Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-200/60">
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Subir / Sincronizar Todo</span>
                </button>

                <button
                  type="button"
                  onClick={handleImportNow}
                  disabled={isLoading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors disabled:opacity-50"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Traer Datos de Google Sheets</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Option 1: Create New Sheet */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Crear Nueva Hoja Automática
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Crea una hoja nueva en tu Google Drive con las 3 pestañas estructuradas: Pacientes, Historial de Pagos y Reintegros.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateSheet}
                  disabled={!currentUser || isLoading}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Hoja "Dr. Belleza - Cobranza" en Google Drive</span>
                </button>
              </div>

              {/* Option 2: Connect Existing Sheet */}
              <form
                onSubmit={handleConnectExisting}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      O Vincular Hoja Existente
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Ingresa el ID o enlace completo de una hoja de cálculo existente.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Pega la URL de Google Sheets o el Spreadsheet ID..."
                    value={existingIdInput}
                    onChange={(e) => setExistingIdInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!currentUser || isLoading || !existingIdInput.trim()}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50"
                  >
                    Vincular
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Real-time sync guarantee description */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sincronización en Tiempo Real:</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Cada nuevo abono, paciente o reintegro que registre la secretaría se guarda inmediatamente en la base de datos de Google Sheets para garantizar la integridad y respaldo contable del Dr. Jorge Apelencia.
            </p>
          </div>

          {/* Close Action */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
