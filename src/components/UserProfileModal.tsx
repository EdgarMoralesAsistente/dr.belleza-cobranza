import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Users,
  CreditCard,
  Undo2,
  Settings,
  Eye,
  EyeOff,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { SystemUser, UserRole, RolePrivilege } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: SystemUser;
  privileges?: RolePrivilege[];
  onUpdateUser?: (updatedData: Partial<SystemUser>) => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  privileges = [],
  onUpdateUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'permissions'>('info');

  const resolvedUser: SystemUser = currentUser || {
    id: 'USR-SUPER-EDGAR',
    fullName: 'Edgar Morales',
    email: 'edgar@morales.com',
    role: 'super_admin',
    isActive: true,
    createdAt: '2026-01-15',
    isImmutable: true,
  };

  // Profile Edit fields
  const [fullName, setFullName] = useState(resolvedUser.fullName);
  const [phone, setPhone] = useState(resolvedUser.phone || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFullName(resolvedUser.fullName);
      setPhone(resolvedUser.phone || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage(null);
      setActiveTab('info');
    }
  }, [isOpen, resolvedUser.fullName, resolvedUser.phone]);

  if (!isOpen) return null;

  const role = resolvedUser.role || 'super_admin';
  const isSuperAdmin = role === 'super_admin';
  const isEdgar = (resolvedUser.email || '').toLowerCase() === 'edgar@morales.com' || Boolean(resolvedUser.isImmutable);

  const currentRolePrivilege = (privileges || []).find((p) => p.role === role);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setStatusMessage({ type: 'error', text: 'El nombre no puede estar vacío.' });
      return;
    }
    if (onUpdateUser) {
      onUpdateUser({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
    }
    setStatusMessage({ type: 'success', text: 'Datos de perfil actualizados con éxito.' });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const userExpectedPassword = resolvedUser.password || '123456';
    if (currentPassword !== userExpectedPassword) {
      setStatusMessage({ type: 'error', text: 'La contraseña actual ingresada es incorrecta.' });
      return;
    }
    if (newPassword.length < 4) {
      setStatusMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 4 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    if (onUpdateUser) {
      onUpdateUser({
        password: newPassword,
      });
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStatusMessage({ type: 'success', text: '¡Contraseña actualizada exitosamente!' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative overflow-hidden shrink-0">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg border-2 ${
                  isSuperAdmin
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-emerald-600 text-white border-emerald-400'
                }`}
              >
                {(resolvedUser.fullName || 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {resolvedUser.fullName}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      isSuperAdmin
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {isSuperAdmin ? 'Super Administrador' : resolvedUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  {resolvedUser.email}
                </p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                  <span>ID: {resolvedUser.id}</span>
                  <span>•</span>
                  <span>Último acceso: {resolvedUser.lastLogin || 'Hoy'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Immutable Super Admin Banner */}
          {isEdgar && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2 text-[11px] text-purple-300 bg-purple-950/40 px-3 py-2 rounded-xl border border-purple-800/50">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                <strong>Usuario Super Administrador Protegido:</strong> Esta cuenta cuenta con protección inmutable contra eliminación en todo el sistema.
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('info');
              setStatusMessage(null);
            }}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Información del Perfil
          </button>
          <button
            onClick={() => {
              setActiveTab('password');
              setStatusMessage(null);
            }}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Seguridad & Contraseña
          </button>
          <button
            onClick={() => {
              setActiveTab('permissions');
              setStatusMessage(null);
            }}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'permissions'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Permisos & Privilegios
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: General Info */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico (Identificador de acceso)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={resolvedUser.email}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  El correo electrónico está vinculado a su cuenta activa en el sistema.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono / WhatsApp de Contacto
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 9 11 ..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Rol en el Sistema
                  </span>
                  <span className="text-xs font-bold text-slate-800 capitalize">
                    {(resolvedUser.role || '').replace('_', ' ')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Estado de la Cuenta
                  </span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Activo</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2">
                <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Para modificar su contraseña, introduzca su contraseña actual seguida de la nueva contraseña deseada.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingrese su clave actual"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la nueva contraseña"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Permissions & Role Info */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">
                    Nivel de Acceso: {currentRolePrivilege?.roleLabel || resolvedUser.role}
                  </span>
                  {isSuperAdmin && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full border border-purple-200">
                      Acceso Total
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Los privilegios determinan qué operaciones y módulos puede visualizar y ejecutar este perfil en Dr. Belleza.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Matriz de Privilegios Habilitados
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <span className="text-slate-700">Ver Dashboard & Métricas</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <span className="text-slate-700">Gestión de Pacientes</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <span className="text-slate-700">Registrar Abonos</span>
                    {currentRolePrivilege?.canRegisterPayments ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <span className="text-slate-700">Registrar Reintegros</span>
                    {currentRolePrivilege?.canRegisterRefunds ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <span className="text-slate-700">Gestión de Usuarios</span>
                    {currentRolePrivilege?.canManageUsers ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <span className="text-slate-700">Vincular Google Sheets</span>
                    {currentRolePrivilege?.canAccessGoogleSheets ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                        Exclusivo Super Admin
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <span className="text-slate-700">Generar Reportes PDF</span>
                    {currentRolePrivilege?.canExportReports ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <span className="text-slate-700">Configuración & Catálogo</span>
                    {currentRolePrivilege?.canManageSettings ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
