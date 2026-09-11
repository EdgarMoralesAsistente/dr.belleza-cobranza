import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  ChevronDown,
  ShieldCheck,
  Shield,
  KeyRound,
  LogIn,
  LogOut,
  CheckCircle2,
  Lock,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';
import { SystemUser, UserRole } from '../types';

interface UserProfileHeaderProps {
  currentUser?: SystemUser | null;
  activeUser?: SystemUser | null;
  users?: SystemUser[];
  onOpenProfileModal?: () => void;
  onOpenProfile?: () => void;
  onOpenLoginModal?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

const ROLE_BADGE_STYLES: Record<UserRole, { label: string; badge: string; dot: string; iconBg: string }> = {
  super_admin: {
    label: 'Super Admin',
    badge: 'bg-purple-100 text-purple-900 border-purple-200',
    dot: 'bg-purple-500',
    iconBg: 'bg-purple-700 text-white',
  },
  admin: {
    label: 'Admin',
    badge: 'bg-blue-100 text-blue-900 border-blue-200',
    dot: 'bg-blue-500',
    iconBg: 'bg-blue-700 text-white',
  },
  medico: {
    label: 'Médico',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    dot: 'bg-emerald-500',
    iconBg: 'bg-emerald-700 text-white',
  },
  financiero: {
    label: 'Financiero',
    badge: 'bg-amber-100 text-amber-900 border-amber-200',
    dot: 'bg-amber-500',
    iconBg: 'bg-amber-700 text-white',
  },
  asistente: {
    label: 'Asistente',
    badge: 'bg-rose-100 text-rose-900 border-rose-200',
    dot: 'bg-rose-500',
    iconBg: 'bg-rose-700 text-white',
  },
};

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  currentUser,
  activeUser,
  users = [],
  onOpenProfileModal,
  onOpenProfile,
  onOpenLoginModal,
  onOpenLogin,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // User resolution
  const resolvedUser: SystemUser | null = currentUser || activeUser || null;

  const handleOpenProfile = () => {
    setIsOpen(false);
    if (onOpenProfileModal) onOpenProfileModal();
    else if (onOpenProfile) onOpenProfile();
  };

  const handleOpenLogin = () => {
    setIsOpen(false);
    if (onOpenLoginModal) onOpenLoginModal();
    else if (onOpenLogin) onOpenLogin();
  };

  const handleLogoutAction = () => {
    setIsOpen(false);
    if (onLogout) onLogout();
    else handleOpenLogin();
  };

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!resolvedUser) {
    return (
      <button
        type="button"
        onClick={handleOpenLogin}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        title="Iniciar Sesión"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Iniciar Sesión</span>
      </button>
    );
  }

  const role = resolvedUser.role || 'super_admin';
  const isSuperAdmin = role === 'super_admin';
  const isEdgar = (resolvedUser.email || '').toLowerCase() === 'edgar@morales.com' || Boolean(resolvedUser.isImmutable);
  const roleStyle = ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES.super_admin;

  const initials = (resolvedUser.fullName || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Top-Right Profile Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        title="Perfil de Usuario y Sesión (Haga clic para ver detalles y opciones)"
      >
        {/* Avatar with status dot */}
        <div className="relative">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs transition-transform group-hover:scale-105 ${roleStyle.iconBg}`}
          >
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>

        {/* User Info labels (desktop & tablet) */}
        <div className="text-left hidden sm:block leading-tight">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-xs text-slate-800 tracking-tight group-hover:text-slate-900">
              {resolvedUser.fullName}
            </span>
            {isEdgar && (
              <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1 rounded border border-purple-200" title="Super Administrador Inmutable">
                ★
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${roleStyle.badge}`}
            >
              {roleStyle.label}
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline truncate max-w-[120px]">
              {resolvedUser.email}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Section */}
          <div className="p-4 bg-slate-900 text-white relative">
            <div className="flex items-start space-x-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-md border border-white/20 shrink-0 ${roleStyle.iconBg}`}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-bold text-sm text-white truncate">
                    {resolvedUser.fullName}
                  </h4>
                  {isEdgar && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40">
                      Inmutable
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-mono truncate">
                  {resolvedUser.email}
                </p>
                <div className="flex items-center space-x-2 mt-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSuperAdmin
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {isSuperAdmin ? 'Super Administrador' : roleStyle.label}
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span>En Línea</span>
                  </span>
                </div>
              </div>
            </div>

            {isEdgar && (
              <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-purple-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Super Administrador protegido de forma permanente.</span>
              </div>
            )}
          </div>

          {/* Quick Actions List */}
          <div className="p-2 space-y-1 bg-white">
            <button
              type="button"
              onClick={handleOpenProfile}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">Ver Perfil Completo</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Datos personales, rol y privilegios
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Ver
              </span>
            </button>

            <button
              type="button"
              onClick={handleOpenProfile}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800">Seguridad & Contraseña</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Actualizar clave de acceso
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Editar</span>
            </button>
          </div>

          {/* Footer with Logout */}
          <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Dr. Belleza • Sesión Activa
            </span>
            <button
              type="button"
              onClick={handleLogoutAction}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
