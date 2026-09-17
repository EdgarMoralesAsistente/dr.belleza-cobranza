import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  DownloadCloud,
  UploadCloud,
  ShieldCheck,
  Terminal,
  ChevronDown,
  ChevronUp,
  Link,
  Sparkles,
  Database,
  Trash2,
} from 'lucide-react';
import { GoogleSheetConfig } from '../types';
import { User } from 'firebase/auth';
import { CODE_GS_SOURCE } from '../services/gasCodeTemplate';
import { testGasConnection } from '../services/gasService';

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
  // Google Apps Script handlers
  onSaveGasConfig?: (gasUrl: string) => Promise<void>;
  onDisconnectGas?: () => void;
  onSyncAllToGas?: () => Promise<void>;
  onImportFromGas?: () => Promise<void>;
  onCleanupProcedureSheets?: () => Promise<void>;
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
  onSaveGasConfig,
  onDisconnectGas,
  onSyncAllToGas,
  onImportFromGas,
  onCleanupProcedureSheets,
}) => {
  const [activeTab, setActiveTab] = useState<'gas' | 'oauth'>('gas');
  const [gasUrlInput, setGasUrlInput] = useState(sheetConfig.gasDeploymentUrl || '');
  const [existingIdInput, setExistingIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [testResult, setTestResult] = useState<{
    spreadsheetName?: string;
    sheetsFound?: string[];
  } | null>(null);

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
            <strong className="text-purple-700 font-semibold">Super Administrador</strong>{' '}
            posee permisos para vincular, sincronizar o alterar la integración con Google Sheets.
          </p>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-800 text-left mb-5">
            <p className="font-semibold mb-0.5">Perfil actual en sesión:</p>
            <p>{activeUserName || 'Usuario sin privilegios de Super Administrador'}</p>
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

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(CODE_GS_SOURCE);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error('Error al copiar código', e);
    }
  };

  const handleConnectGas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gasUrlInput.trim()) return;

    setIsLoading(true);
    setActionSuccessMessage(null);
    setErrorMessage(null);

    try {
      // 1. Probar conectividad con el script
      const test = await testGasConnection(gasUrlInput.trim());
      setTestResult({
        spreadsheetName: test.spreadsheetName,
        sheetsFound: test.sheetsFound,
      });

      // 2. Guardar configuración en la app
      if (onSaveGasConfig) {
        await onSaveGasConfig(gasUrlInput.trim());
      }
      setActionSuccessMessage(
        `¡Conexión exitosa! Vinculado a "${test.spreadsheetName || 'Google Sheets'}". Tablas detectadas: ${test.sheetsFound?.length || 0}.`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el Web App de Google Apps Script');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAllGas = async () => {
    if (!onSyncAllToGas) return;
    setIsLoading(true);
    setActionSuccessMessage(null);
    setErrorMessage(null);
    try {
      await onSyncAllToGas();
      setActionSuccessMessage('¡Todos los datos locales (pacientes, abonos, reintegros, procedimientos y planes) se volcaron exitosamente a Google Sheets!');
    } catch (e: any) {
      setErrorMessage(e.message || 'Error al sincronizar datos hacia Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportGas = async () => {
    if (!onImportFromGas) return;
    if (!window.confirm('¿Desea descargar y sincronizar los datos desde Google Sheets a la Web App?')) {
      return;
    }
    setIsLoading(true);
    setActionSuccessMessage(null);
    setErrorMessage(null);
    try {
      await onImportFromGas();
      setActionSuccessMessage('¡Datos actualizados exitosamente en la Web App desde Google Sheets!');
    } catch (e: any) {
      setErrorMessage(e.message || 'Error al importar datos desde Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupTabsClick = async () => {
    if (!onCleanupProcedureSheets) return;
    setIsLoading(true);
    setActionSuccessMessage(null);
    setErrorMessage(null);
    try {
      await onCleanupProcedureSheets();
      setActionSuccessMessage('¡Pestaña "Procedimiento" eliminada exitosamente! Se conserva únicamente la pestaña "Procedimientos" con todos los datos sincronizados.');
    } catch (e: any) {
      setErrorMessage(e.message || 'Error al limpiar las pestañas duplicadas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectGas = () => {
    if (window.confirm('¿Desea desconectar la vinculación con este Web App de Google Sheets?')) {
      if (onDisconnectGas) onDisconnectGas();
      setGasUrlInput('');
      setTestResult(null);
      setActionSuccessMessage('Vinculación removida.');
    }
  };

  // Direct OAuth handlers
  const handleCreateOAuthSheet = async () => {
    setIsLoading(true);
    setActionSuccessMessage(null);
    try {
      await onCreateNewSheet();
      setActionSuccessMessage('¡Hoja de cálculo creada y vinculada exitosamente!');
    } catch (e: any) {
      setErrorMessage(e.message || 'Error al crear la hoja en Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectOAuthExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingIdInput.trim()) return;

    setIsLoading(true);
    setActionSuccessMessage(null);
    try {
      await onConnectExistingSheet(existingIdInput.trim());
      setActionSuccessMessage('¡Hoja vinculada y sincronizada correctamente!');
      setExistingIdInput('');
    } catch (e: any) {
      setErrorMessage(e.message || 'Error al conectar con la hoja indicada');
    } finally {
      setIsLoading(false);
    }
  };

  const isGasConnected = !!sheetConfig.gasDeploymentUrl;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-800 bg-emerald-700 text-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-white shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold">Base de Datos Google Sheets</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-emerald-100 uppercase tracking-wider">
                  Apps Script
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Sincronización bidireccional inmediata, borrado en cascada y compatibilidad con Vercel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('gas')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'gas'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Google Apps Script (Recomendado / Vercel)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('oauth')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'oauth'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Google OAuth Directo (Secundario)</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status Messages */}
          {actionSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{actionSuccessMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {activeTab === 'gas' ? (
            /* =================== GOOGLE APPS SCRIPT TAB =================== */
            <div className="space-y-5">
              {/* Connection Status Banner */}
              {isGasConnected ? (
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-sm text-emerald-950">
                        Google Apps Script Conectado & Operativo
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisconnectGas}
                      className="text-xs text-rose-700 hover:text-rose-900 flex items-center space-x-1 font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Desconectar</span>
                    </button>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1 bg-white/70 p-3 rounded-lg border border-emerald-200/60">
                    <p className="truncate">
                      <strong>Web App URL:</strong> <code className="text-[11px] font-mono text-emerald-900">{sheetConfig.gasDeploymentUrl}</code>
                    </p>
                    {sheetConfig.spreadsheetName && (
                      <p>
                        <strong>Hoja vinculada:</strong> {sheetConfig.spreadsheetName}
                      </p>
                    )}
                    {sheetConfig.lastSyncTime && (
                      <p className="text-slate-500">
                        <strong>Última operación exitosa:</strong> {sheetConfig.lastSyncTime}
                      </p>
                    )}
                  </div>

                  {/* Actions for connected state */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSyncAllGas}
                      disabled={isLoading}
                      className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Subir / Sincronizar Todo a Sheets</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleImportGas}
                      disabled={isLoading}
                      className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>Traer Datos desde Google Sheets</span>
                    </button>

                    {onCleanupProcedureSheets && (
                      <button
                        type="button"
                        onClick={handleCleanupTabsClick}
                        disabled={isLoading}
                        className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Elimina la pestaña duplicada 'Procedimiento' (singular) y conserva únicamente 'Procedimientos' (plural) con todos los datos"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Eliminar Pestaña "Procedimiento" Duplicada</span>
                      </button>
                    )}

                    {sheetConfig.spreadsheetUrl && (
                      <a
                        href={sheetConfig.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold rounded-lg text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-200/70 transition-colors"
                      >
                        <span>Abrir en Google Sheets</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                /* Connect Input Form */
                <form onSubmit={handleConnectGas} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900">
                      Vincular Web App de Google Apps Script
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Ingresa el enlace de implementación web generado en Apps Script (termina en <code>/exec</code>).
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={gasUrlInput}
                      onChange={(e) => setGasUrlInput(e.target.value)}
                      required
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !gasUrlInput.trim()}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
                    >
                      {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>{isLoading ? 'Conectando...' : 'Probar y Conectar'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Guía Paso a Paso para no fallar */}
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      📖
                    </div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      Instrucciones Paso a Paso (Para que funcione perfecto al primer intento)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? '¡Código Copiado!' : 'Copiar Código Code.gs'}</span>
                  </button>
                </div>

                <ol className="text-xs text-slate-700 space-y-2.5 list-decimal list-inside leading-relaxed">
                  <li className="pl-1">
                    <strong>Abre tu Google Sheets</strong> (nuevo o existente) y ve en el menú superior a:{' '}
                    <code className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-semibold text-emerald-800">
                      Extensiones &gt; Apps Script
                    </code>.
                  </li>
                  <li className="pl-1">
                    Borra cualquier código previo en el archivo <code>Code.gs</code> y haz clic en el botón{' '}
                    <strong className="text-emerald-800">"Copiar Código Code.gs"</strong> arriba para pegarlo allí.
                  </li>
                  <li className="pl-1">
                    <strong>Crear todas las tablas automáticamente:</strong> En la barra superior del editor de Apps Script,
                    selecciona la función <code className="font-bold text-emerald-900">inicializarBaseDeDatos</code> y haz clic en{' '}
                    <strong className="text-emerald-900">"Ejecutar"</strong>.
                    <span className="block text-[11px] text-slate-600 ml-4 mt-0.5">
                      (Google te pedirá autorizar permisos una sola vez. Al ejecutarse creará automáticamente las hojas: Pacientes, Abonos, Reintegros, Usuarios, Recordatorios_CRM, Procedimiento y Planes_Financiamiento).
                    </span>
                  </li>
                  <li className="pl-1">
                    <strong>Publicar la Web App:</strong> Arriba a la derecha haz clic en el botón azul{' '}
                    <strong>"Implementar"</strong> &gt; <strong>"Nueva implementación"</strong>:
                    <ul className="list-disc list-inside ml-4 mt-1 text-[11px] space-y-0.5 text-slate-600">
                      <li>Haz clic en el engranaje (⚙️) y selecciona <strong>"Aplicación web"</strong>.</li>
                      <li>Ejecutar como: <strong>"Yo"</strong> (tu cuenta de Google).</li>
                      <li>
                        Quién tiene acceso: <strong className="text-emerald-800">"Cualquiera"</strong> (CRÍTICO para que Vercel y tu Web App puedan comunicarse sin error de CORS).
                      </li>
                    </ul>
                  </li>
                  <li className="pl-1">
                    Copia la <strong>URL de la aplicación web</strong> (termina en <code>/exec</code>) y pégala en el campo de arriba.
                  </li>
                  <li className="pl-1 text-slate-600">
                    <strong>Para Vercel o Producción (Opcional pero recomendado):</strong> En tu proyecto de Vercel &gt; <em>Settings &gt; Environment Variables</em>, puedes agregar la variable con nombre <code className="font-bold text-emerald-900">GOOGLE_APPS_SCRIPT_URL</code> pegando la URL de Apps Script. Así funcionará automáticamente para cualquier usuario o ventana de incógnito.
                  </li>
                </ol>

                {/* Toggle Code Preview */}
                <div className="pt-2 border-t border-emerald-200/60">
                  <button
                    type="button"
                    onClick={() => setShowCodePreview(!showCodePreview)}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{showCodePreview ? 'Ocultar visor de código' : 'Ver código Code.gs en pantalla'}</span>
                    {showCodePreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showCodePreview && (
                    <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{CODE_GS_SOURCE}</pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time sync guarantee description */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Garantía de Sincronización Inmediata & Borrado en Cascada:</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Cada vez que des de alta o edites una paciente, abono o reintegro, se enviará de inmediato a tu Google Sheets. Si eliminas una paciente, se borrará su fila y automáticamente todos sus abonos, reintegros y recordatorios asociados tanto en la Web App como en las hojas de Google Sheets.
                </p>
              </div>
            </div>
          ) : (
            /* =================== GOOGLE DIRECT OAUTH TAB =================== */
            <div className="space-y-4">
              {/* User Auth Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Cuenta de Google Conectada
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
                      No has iniciado sesión con Google.
                    </p>
                  )}
                </div>

                {!currentUser && (
                  <button
                    type="button"
                    onClick={onSignInGoogle}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 shadow-xs flex items-center space-x-2 shrink-0 transition-colors cursor-pointer"
                  >
                    <span>Acceder con Google</span>
                  </button>
                )}
              </div>

              {/* Create New Sheet */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Crear Hoja Directa en Google Drive
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Crea la hoja "Dr. Belleza - Cobranza" directamente en tu Google Drive vía OAuth.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateOAuthSheet}
                  disabled={!currentUser || isLoading}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Hoja en Google Drive</span>
                </button>
              </div>

              {/* Connect Existing */}
              <form
                onSubmit={handleConnectOAuthExisting}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Vincular Spreadsheet ID Existente
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Ingresa el ID o enlace de la hoja de Google Sheets.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="URL de la hoja o Spreadsheet ID..."
                    value={existingIdInput}
                    onChange={(e) => setExistingIdInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!currentUser || isLoading || !existingIdInput.trim()}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Vincular
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-3.5 border-t border-slate-200 bg-slate-50 shrink-0">
          <span className="text-[11px] text-slate-500">
            {isGasConnected ? '🟢 Base de datos vinculada con Apps Script' : '⚪ Sin base de datos Apps Script activa'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
