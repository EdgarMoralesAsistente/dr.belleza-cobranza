import React, { useState, useEffect } from 'react';
import { X, Shield, User, Mail, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { SystemUser, UserRole } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<SystemUser, 'id' | 'createdAt'>, id?: string) => void;
  userToEdit?: SystemUser | null;
}

const ROLE_INFO: Record<
  UserRole,
  { label: string; description: string; badgeColor: string; iconColor: string }
> = {
  super_admin: {
    label: 'Super Administrador',
    description: 'Acceso total al sistema. Único perfil autorizado para conectar y configurar Google Sheets.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    iconColor: 'text-purple-600',
  },
  admin: {
    label: 'Administrador',
    description: 'Gestión completa de pacientes, abonos, reintegros, presupuestos y supervisión del equipo.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600',
  },
  medico: {
    label: 'Médico',
    description: 'Consulta de pacientes asignados, costos de cirugías, procedimientos y estado de saldos.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  financiero: {
    label: 'Financiero',
    description: 'Control de caja, auditoría contable, balances, reintegros y generación de reportes mensuales en PDF.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    iconColor: 'text-amber-600',
  },
  asistente: {
    label: 'Asistente',
    description: 'Recepción, registro inicial de pacientes, cobros en consultorio y envíos por WhatsApp Web.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    iconColor: 'text-rose-600',
  },
};

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('asistente');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setFullName(userToEdit.fullName);
      setEmail(userToEdit.email);
      setRole(userToEdit.role);
      setPhone(userToEdit.phone || '');
      setIsActive(userToEdit.isActive);
      setNotes(userToEdit.notes || '');
    } else {
      setFullName('');
      setEmail('');
      setRole('asistente');
      setPhone('+54911');
      setIsActive(true);
      setNotes('');
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Por favor ingrese el nombre completo del usuario.');
      return;
    }
    if (!email.trim()) {
      alert('Por favor ingrese un correo electrónico válido.');
      return;
    }

    onSave(
      {
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        phone: phone.trim() || undefined,
        isActive,
        notes: notes.trim() || undefined,
      },
      userToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {userToEdit ? 'Editar Usuario del Sistema' : 'Nuevo Usuario del Sistema'}
              </h2>
              <p className="text-xs text-slate-500">
                Definir perfil, permisos y datos de acceso institucional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre Completo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Dra. Florencia Santillán"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Electrónico Institucional *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@drbelleza.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Teléfono / WhatsApp de Contacto
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+5491145678900"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Perfil / Rol de Acceso *
            </label>
            <div className="space-y-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="super_admin">Super Administrador (Acceso Google Sheets)</option>
                <option value="admin">Administrador</option>
                <option value="medico">Médico</option>
                <option value="financiero">Financiero</option>
                <option value="asistente">Asistente</option>
              </select>

              {/* Dynamic Role Description Box */}
              <div className={`p-3 rounded-lg border text-xs ${ROLE_INFO[role].badgeColor}`}>
                <div className="font-semibold mb-0.5 flex items-center justify-between">
                  <span>Permisos: {ROLE_INFO[role].label}</span>
                  {role === 'super_admin' && (
                    <span className="bg-purple-700 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Google Sheets Key
                    </span>
                  )}
                </div>
                <p className="opacity-90">{ROLE_INFO[role].description}</p>
              </div>
            </div>
          </div>

          {/* Status Checkbox */}
          <div className="pt-1">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-medium text-slate-700">
                Usuario Activo (Habilitado para acceder a las operaciones del sistema)
              </span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas / Cargo Interno
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 flex items-start pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Cirujano de guardia, responsable de facturación..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>{userToEdit ? 'Guardar Cambios' : 'Crear Usuario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
