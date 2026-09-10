import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Users,
  Search,
  Lock,
  ArrowRightLeft,
  Info,
} from 'lucide-react';
import { SystemUser, UserRole } from '../types';
import { UserModal } from './UserModal';

interface UsersModuleProps {
  users: SystemUser[];
  activeUserId: string;
  onSelectActiveUser?: (userId: string) => void;
  onSaveUser: (user: Omit<SystemUser, 'id' | 'createdAt'>, id?: string) => void;
  onDeleteUser: (id: string) => void;
  onToggleUserStatus: (id: string) => void;
}

const ROLE_META: Record<
  UserRole,
  { label: string; badgeClass: string; dotClass: string; iconBg: string; canGoogleSheet: boolean }
> = {
  super_admin: {
    label: 'Super Administrador',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-500',
    iconBg: 'bg-purple-900 text-purple-100',
    canGoogleSheet: true,
  },
  admin: {
    label: 'Administrador',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-500',
    iconBg: 'bg-blue-900 text-blue-100',
    canGoogleSheet: false,
  },
  medico: {
    label: 'Médico',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
    iconBg: 'bg-emerald-900 text-emerald-100',
    canGoogleSheet: false,
  },
  financiero: {
    label: 'Financiero',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
    iconBg: 'bg-amber-900 text-amber-100',
    canGoogleSheet: false,
  },
  asistente: {
    label: 'Asistente',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    dotClass: 'bg-rose-500',
    iconBg: 'bg-rose-900 text-rose-100',
    canGoogleSheet: false,
  },
};

export const UsersModule: React.FC<UsersModuleProps> = ({
  users,
  activeUserId,
  onSelectActiveUser,
  onSaveUser,
  onDeleteUser,
  onToggleUserStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<SystemUser | null>(null);

  const activeUser = users.find((u) => u.id === activeUserId) || users[0] || {
    id: 'USR-SUPER-EDGAR',
    fullName: 'Edgar Morales',
    email: 'edgar@morales.com',
    role: 'super_admin' as const,
    isActive: true,
    createdAt: '2026-01-15',
    isImmutable: true,
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const superAdminCount = users.filter((u) => u.role === 'super_admin').length;

  const handleOpenNew = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: SystemUser) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (user: SystemUser) => {
    const isEdgar = user.isImmutable || user.email.toLowerCase() === 'edgar@morales.com' || user.id === 'USR-SUPER-EDGAR';
    if (isEdgar) {
      alert('El Super Administrador Edgar Morales debe permanecer siempre activo para garantizar la operatividad y administración del sistema.');
      return;
    }
    onToggleUserStatus(user.id);
  };

  const handleDelete = (user: SystemUser) => {
    const isEdgar = user.isImmutable || user.email.toLowerCase() === 'edgar@morales.com' || user.id === 'USR-SUPER-EDGAR';
    if (isEdgar) {
      alert('ACCESO DENEGADO: El usuario Super Administrador Edgar Morales está protegido permanentemente por directiva del sistema y no puede ser eliminado bajo ninguna circunstancia.');
      return;
    }

    if (user.role === 'super_admin' && superAdminCount <= 1) {
      alert('No es posible eliminar al único Super Administrador del sistema.');
      return;
    }
    if (window.confirm(`¿Está seguro de eliminar al usuario "${user.fullName}"?`)) {
      onDeleteUser(user.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Active User Role Indicator */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestión de Usuarios del Sistema
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Control de Accesos (RBAC)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Administración de perfiles, permisos de auditoría médica, tesorería y credenciales institucionales.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Role Authority Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Super Administrador */}
        <div className="bg-white rounded-xl p-3.5 border border-purple-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-full -mr-4 -mt-4" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
              Nivel 1 • Exclusivo
            </span>
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Super Administrador</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            <strong className="text-purple-700">Único con acceso a Google Sheets</strong>, sincronización de base de datos y control maestro.
          </p>
          <div className="mt-2 text-[10px] font-semibold text-purple-600">
            {users.filter((u) => u.role === 'super_admin').length} Asignado(s)
          </div>
        </div>

        {/* Administrador */}
        <div className="bg-white rounded-xl p-3.5 border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Nivel 2 • Gestión
            </span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Administrador</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Supervisión clínica integral, altas/bajas, auditoría y administración de personal y pacientes.
          </p>
          <div className="mt-2 text-[10px] font-semibold text-blue-600">
            {users.filter((u) => u.role === 'admin').length} Asignado(s)
          </div>
        </div>

        {/* Médico */}
        <div className="bg-white rounded-xl p-3.5 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              Nivel 3 • Clínico
            </span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Médico</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Consulta de pacientes asignados, costos quirúrgicos acordados, fechas de quirófano y presupuestos.
          </p>
          <div className="mt-2 text-[10px] font-semibold text-emerald-600">
            {users.filter((u) => u.role === 'medico').length} Asignado(s)
          </div>
        </div>

        {/* Financiero */}
        <div className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              Nivel 4 • Tesorería
            </span>
            <span className="text-xs font-bold text-amber-600">$</span>
          </div>
          <h2 className="text-sm font-bold text-slate-900">Financiero</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Control de caja, auditoría de abonos, registro de reintegros y exportación de reportes PDF.
          </p>
          <div className="mt-2 text-[10px] font-semibold text-amber-600">
            {users.filter((u) => u.role === 'financiero').length} Asignado(s)
          </div>
        </div>

        {/* Asistente */}
        <div className="bg-white rounded-xl p-3.5 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
              Nivel 5 • Operativo
            </span>
            <Users className="w-4 h-4 text-rose-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Asistente</h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Recepción y alta de pacientes, registro de abonos diarios y envío de notificaciones automáticas vía WhatsApp.
          </p>
          <div className="mt-2 text-[10px] font-semibold text-rose-600">
            {users.filter((u) => u.role === 'asistente').length} Asignado(s)
          </div>
        </div>
      </div>

      {/* Security Status Box: Active Profile Info */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
            RBAC
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center space-x-2">
              <span>Perfil Activo en Sesión:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${ROLE_META[activeUser.role].badgeClass}`}>
                {ROLE_META[activeUser.role].label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Usuario en sesión: <strong className="text-slate-200">{activeUser.fullName}</strong> ({activeUser.email}).
              {activeUser.role === 'super_admin' ? (
                <span className="text-purple-300 ml-1 font-medium">
                  Tiene permiso habilitado para conectar y sincronizar Google Sheets.
                </span>
              ) : (
                <span className="text-amber-300 ml-1 font-medium">
                  Acceso a Google Sheets bloqueado (requiere Super Administrador).
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acceso restringido por credenciales individuales</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">Filtrar por Perfil:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">Todos los Perfiles ({totalUsers})</option>
            <option value="super_admin">Super Administrador</option>
            <option value="admin">Administrador</option>
            <option value="medico">Médico</option>
            <option value="financiero">Financiero</option>
            <option value="asistente">Asistente</option>
          </select>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Usuario / Personal</th>
                <th className="px-5 py-3.5">Perfil / Rol</th>
                <th className="px-5 py-3.5 text-center">Permiso Google Sheets</th>
                <th className="px-5 py-3.5">Contacto</th>
                <th className="px-5 py-3.5 text-center">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No se encontraron usuarios con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const meta = ROLE_META[user.role];
                  const isCurrent = user.id === activeUserId;
                  const isEdgarImmutable = user.isImmutable || user.email.toLowerCase() === 'edgar@morales.com' || user.id === 'USR-SUPER-EDGAR';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCurrent ? 'bg-emerald-50/30' : isEdgarImmutable ? 'bg-purple-50/20' : ''
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs ${meta.iconBg}`}
                          >
                            {user.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                              <span>{user.fullName}</span>
                              {isCurrent && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  En Sesión
                                </span>
                              )}
                              {isEdgarImmutable && (
                                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-200 flex items-center space-x-0.5" title="Super Administrador Inmutable. No puede ser eliminado nunca.">
                                  <Shield className="w-2.5 h-2.5 text-purple-600" />
                                  <span>Inmutable</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2">
                              <span>{user.email}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400">Clave: {user.password ? '••••••••' : '123456'}</span>
                            </div>
                            {user.notes && (
                              <div className="text-[10px] text-slate-400 mt-0.5 italic max-w-xs truncate">
                                {user.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
                          <span>{meta.label}</span>
                        </span>
                      </td>

                      {/* Google Sheets Permission */}
                      <td className="px-5 py-4 text-center">
                        {meta.canGoogleSheet ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200" title="Acceso total a sincronización y configuración de Google Sheets">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
                            <span>Autorizado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-400" title="Restringido solo a Super Administrador">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Restringido</span>
                          </span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="text-slate-700 font-medium">
                          {user.phone || '—'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Registrado: {user.createdAt}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={isEdgarImmutable}
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                            isEdgarImmutable
                              ? 'bg-purple-50 text-purple-700 cursor-not-allowed border border-purple-200'
                              : user.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer'
                          }`}
                          title={isEdgarImmutable ? 'El Super Administrador permanente debe permanecer siempre activo' : 'Haga clic para alternar estado'}
                        >
                          {user.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Inactivo</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Editar usuario"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isEdgarImmutable ? (
                            <span
                              className="p-1.5 rounded text-purple-600 bg-purple-50 border border-purple-200 cursor-not-allowed"
                              title="Este usuario Super Administrador está protegido permanentemente y no puede ser borrado jamás."
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDelete(user)}
                              disabled={user.role === 'super_admin' && superAdminCount <= 1}
                              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveUser}
        userToEdit={userToEdit}
      />
    </div>
  );
};
