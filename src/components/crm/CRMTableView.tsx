import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  Calendar,
  DollarSign,
  User,
  Trash2,
  Edit3,
  Check,
  ChevronDown,
  Phone,
  Sparkles,
  ArrowUpDown,
  XCircle,
} from 'lucide-react';
import { CRMEvent, CRMEventStatus, CRMEventType, CRMPriority, Patient } from '../../types';

interface CRMTableViewProps {
  events: CRMEvent[];
  patients: Patient[];
  onUpdateEventStatus: (eventId: string, newStatus: CRMEventStatus) => void;
  onEditEvent: (event: CRMEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onOpenWhatsApp: (event: CRMEvent) => void;
}

const TYPE_CONFIG: Record<
  CRMEventType,
  { label: string; color: string; badgeBg: string; textBg: string }
> = {
  bienvenida: {
    label: 'Bienvenida',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    textBg: 'bg-emerald-500',
  },
  notificacion_cobro: {
    label: 'Aviso de Cobro',
    color: 'amber',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-900',
    textBg: 'bg-amber-500',
  },
  vencimiento_cuota: {
    label: 'Vencimiento Cuota',
    color: 'rose',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
    textBg: 'bg-rose-500',
  },
  seguimiento_medico: {
    label: 'Seguimiento Médico',
    color: 'blue',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
    textBg: 'bg-blue-500',
  },
  confirmacion_abono: {
    label: 'Abono / Seña',
    color: 'teal',
    badgeBg: 'bg-teal-50 border-teal-200 text-teal-800',
    textBg: 'bg-teal-500',
  },
  otro: {
    label: 'Otro',
    color: 'slate',
    badgeBg: 'bg-slate-50 border-slate-200 text-slate-700',
    textBg: 'bg-slate-500',
  },
};

const PRIORITY_BADGES: Record<CRMPriority, { label: string; bg: string }> = {
  alta: { label: 'Alta', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
  media: { label: 'Media', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  baja: { label: 'Baja', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const CRMTableView: React.FC<CRMTableViewProps> = ({
  events,
  patients,
  onUpdateEventStatus,
  onEditEvent,
  onDeleteEvent,
  onOpenWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [quickDateFilter, setQuickDateFilter] = useState<'all' | 'today' | 'overdue' | 'week'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Search
      const searchMatch =
        searchTerm === '' ||
        ev.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.procedure && ev.procedure.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ev.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Status
      if (statusFilter !== 'all' && ev.status !== statusFilter) return false;

      // Type
      if (typeFilter !== 'all' && ev.type !== typeFilter) return false;

      // Quick date
      if (quickDateFilter === 'today') {
        return ev.dueDate === todayStr;
      }
      if (quickDateFilter === 'overdue') {
        return ev.dueDate < todayStr && ev.status !== 'completed' && ev.status !== 'cancelled';
      }
      if (quickDateFilter === 'week') {
        const todayObj = new Date(todayStr);
        const nextWeekObj = new Date(todayObj);
        nextWeekObj.setDate(nextWeekObj.getDate() + 7);
        const nextWeekStr = nextWeekObj.toISOString().split('T')[0];
        return ev.dueDate >= todayStr && ev.dueDate <= nextWeekStr;
      }

      return true;
    });
  }, [events, searchTerm, statusFilter, typeFilter, quickDateFilter, todayStr]);

  const getRelativeDateLabel = (dateStr: string, status: CRMEventStatus) => {
    if (dateStr === todayStr) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          HOY
        </span>
      );
    }
    if (dateStr < todayStr && status !== 'completed' && status !== 'cancelled') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          VENCIDO
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por paciente, procedimiento, título o cobro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Pills */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setQuickDateFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                quickDateFilter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setQuickDateFilter('today')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                quickDateFilter === 'today'
                  ? 'bg-amber-500 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setQuickDateFilter('week')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                quickDateFilter === 'week'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Próx. 7 Días
            </button>
            <button
              onClick={() => setQuickDateFilter('overdue')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                quickDateFilter === 'overdue'
                  ? 'bg-rose-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vencidos
            </button>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Estado: Todos</option>
            <option value="pending">Pendientes</option>
            <option value="in_progress">En Seguimiento</option>
            <option value="completed">Completados</option>
            <option value="cancelled">Cancelados</option>
          </select>

          {/* Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Tipo: Todos</option>
            <option value="notificacion_cobro">Avisos de Cobro</option>
            <option value="vencimiento_cuota">Vencimientos de Cuota</option>
            <option value="bienvenida">Bienvenida</option>
            <option value="seguimiento_medico">Seguimiento Médico</option>
            <option value="confirmacion_abono">Abono / Seña</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Tipo & Prioridad</th>
                <th className="py-3 px-4">Paciente & Procedimiento</th>
                <th className="py-3 px-4">Evento / Asunto</th>
                <th className="py-3 px-4">Vencimiento</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Clock className="w-8 h-8 text-slate-300" />
                      <p className="font-medium text-slate-500">No se encontraron eventos con los filtros seleccionados.</p>
                      <p className="text-xs text-slate-400">Intente modificar la búsqueda o limpiar los filtros.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const typeInfo = TYPE_CONFIG[ev.type] || TYPE_CONFIG.otro;
                  const priorityInfo = PRIORITY_BADGES[ev.priority] || PRIORITY_BADGES.media;
                  const isCompleted = ev.status === 'completed';
                  const relativeBadge = getRelativeDateLabel(ev.dueDate, ev.status);

                  return (
                    <tr
                      key={ev.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCompleted ? 'bg-slate-50/40 text-slate-400' : ''
                      }`}
                    >
                      {/* Tipo & Prioridad */}
                      <td className="py-3 px-4 align-middle whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeInfo.badgeBg}`}
                          >
                            {typeInfo.label}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${priorityInfo.bg}`}
                          >
                            {priorityInfo.label}
                          </span>
                        </div>
                      </td>

                      {/* Paciente */}
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-slate-900 truncate max-w-[180px]">
                          {ev.patientName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {ev.procedure || 'Procedimiento'}
                        </div>
                      </td>

                      {/* Título y Detalle */}
                      <td className="py-3 px-4 align-middle max-w-xs">
                        <div className={`font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {ev.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 truncate">
                          {ev.description}
                        </div>
                      </td>

                      {/* Fecha de Vencimiento */}
                      <td className="py-3 px-4 align-middle whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-700">{ev.dueDate}</span>
                          {ev.dueTime && (
                            <span className="text-slate-400 text-[10px]">({ev.dueTime})</span>
                          )}
                        </div>
                        {relativeBadge && <div className="mt-1">{relativeBadge}</div>}
                      </td>

                      {/* Monto */}
                      <td className="py-3 px-4 align-middle text-right whitespace-nowrap">
                        {ev.amount ? (
                          <div className="font-bold text-slate-900">
                            ${ev.amount.toLocaleString()} USD
                            {ev.installmentNumber && (
                              <div className="text-[10px] text-slate-500 font-normal">
                                Cuota #{ev.installmentNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4 align-middle text-center whitespace-nowrap">
                        <select
                          value={ev.status}
                          onChange={(e) => onUpdateEventStatus(ev.id, e.target.value as CRMEventStatus)}
                          className={`text-xs font-semibold py-1 px-2 rounded-lg border cursor-pointer focus:outline-hidden ${
                            ev.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : ev.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : ev.status === 'cancelled'
                              ? 'bg-slate-100 text-slate-500 border-slate-300'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                          }`}
                        >
                          <option value="pending">⏳ Pendiente</option>
                          <option value="in_progress">🔄 En Seguimiento</option>
                          <option value="completed">✅ Cobrado / Hecho</option>
                          <option value="cancelled">🚫 Cancelado</option>
                        </select>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {/* WhatsApp Action */}
                          <button
                            onClick={() => onOpenWhatsApp(ev)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-[#25D366] hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                            title="Enviar WhatsApp con recordatorio"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Toggle Done */}
                          <button
                            onClick={() =>
                              onUpdateEventStatus(
                                ev.id,
                                ev.status === 'completed' ? 'pending' : 'completed'
                              )
                            }
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              ev.status === 'completed'
                                ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title={ev.status === 'completed' ? 'Reabrir tarea' : 'Marcar como completado'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditEvent(ev)}
                            className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                            title="Editar evento"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteEvent(ev.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            title="Eliminar evento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
};
