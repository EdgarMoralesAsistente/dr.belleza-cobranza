import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Calendar,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Trash2,
  Check,
  Phone,
  User,
  Sparkles,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { CRMEvent, CRMEventStatus, CRMEventType, CRMPriority, Patient } from '../../types';

interface CRMKanbanViewProps {
  events: CRMEvent[];
  patients: Patient[];
  onUpdateEventStatus: (eventId: string, newStatus: CRMEventStatus) => void;
  onEditEvent: (event: CRMEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onOpenWhatsApp: (event: CRMEvent) => void;
  onAddNewEventWithStatus?: (status: CRMEventStatus) => void;
}

interface KanbanColumn {
  id: CRMEventStatus;
  title: string;
  subtitle: string;
  dotColor: string;
  badgeBg: string;
  headerBg: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'pending',
    title: 'Por Contactar / Pendientes',
    subtitle: 'Notificaciones iniciales y vencimientos próximos',
    dotColor: 'bg-amber-500',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    headerBg: 'border-t-4 border-amber-500',
  },
  {
    id: 'in_progress',
    title: 'En Seguimiento / Notificados',
    subtitle: 'Mensaje enviado, esperando comprobante o respuesta',
    dotColor: 'bg-blue-500',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    headerBg: 'border-t-4 border-blue-500',
  },
  {
    id: 'completed',
    title: 'Cobrado / Completado',
    subtitle: 'Abono recibido, comprobante verificado o cita confirmada',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    headerBg: 'border-t-4 border-emerald-500',
  },
  {
    id: 'cancelled',
    title: 'Reprogramado / Archivados',
    subtitle: 'Fecha postergada a solicitud o evento cancelado',
    dotColor: 'bg-slate-400',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    headerBg: 'border-t-4 border-slate-400',
  },
];

const TYPE_CONFIG: Record<
  CRMEventType,
  { label: string; badgeBg: string }
> = {
  bienvenida: {
    label: 'Bienvenida',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  notificacion_cobro: {
    label: 'Aviso de Cobro',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  vencimiento_cuota: {
    label: 'Vencimiento Cuota',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  seguimiento_medico: {
    label: 'Médico / Quirófano',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  confirmacion_abono: {
    label: 'Abono / Seña',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  otro: {
    label: 'Otro',
    badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

const PRIORITY_BADGES: Record<CRMPriority, { label: string; bg: string }> = {
  alta: { label: 'Alta', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
  media: { label: 'Media', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  baja: { label: 'Baja', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const CRMKanbanView: React.FC<CRMKanbanViewProps> = ({
  events,
  patients,
  onUpdateEventStatus,
  onEditEvent,
  onDeleteEvent,
  onOpenWhatsApp,
  onAddNewEventWithStatus,
}) => {
  const [draggedOverCol, setDraggedOverCol] = useState<CRMEventStatus | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('text/plain', eventId);
  };

  const handleDragOver = (e: React.DragEvent, colId: CRMEventStatus) => {
    e.preventDefault();
    if (draggedOverCol !== colId) {
      setDraggedOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: CRMEventStatus) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const eventId = e.dataTransfer.getData('text/plain');
    if (eventId) {
      onUpdateEventStatus(eventId, targetStatus);
    }
  };

  const getPreviousStatus = (current: CRMEventStatus): CRMEventStatus | null => {
    const order: CRMEventStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  const getNextStatus = (current: CRMEventStatus): CRMEventStatus | null => {
    const order: CRMEventStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {KANBAN_COLUMNS.map((column) => {
        const columnEvents = events.filter((ev) => ev.status === column.id);
        const totalAmount = columnEvents.reduce((acc, ev) => acc + (ev.amount || 0), 0);
        const isDraggedOver = draggedOverCol === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`bg-slate-100/80 rounded-xl border transition-all duration-150 flex flex-col max-h-[80vh] ${
              column.headerBg
            } ${
              isDraggedOver
                ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200'
                : 'border-slate-200 shadow-2xs'
            }`}
          >
            {/* Column Header */}
            <div className="p-3.5 bg-white rounded-t-lg border-b border-slate-200 flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
                  <h3 className="font-bold text-xs text-slate-900 tracking-tight">
                    {column.title}
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${column.badgeBg}`}
                >
                  {columnEvents.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="truncate pr-1">{column.subtitle}</span>
                {totalAmount > 0 && (
                  <span className="font-bold text-slate-700 whitespace-nowrap">
                    ${totalAmount.toLocaleString()} USD
                  </span>
                )}
              </div>
            </div>

            {/* Cards List */}
            <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1 min-h-[160px]">
              {columnEvents.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg text-center p-3">
                  <Clock className="w-5 h-5 text-slate-300 mb-1" />
                  <p className="text-xs font-medium text-slate-500">Sin eventos en esta etapa</p>
                  <p className="text-[10px] text-slate-400">Arrastre tarjetas aquí</p>
                </div>
              ) : (
                columnEvents.map((ev) => {
                  const typeInfo = TYPE_CONFIG[ev.type] || TYPE_CONFIG.otro;
                  const priorityInfo = PRIORITY_BADGES[ev.priority] || PRIORITY_BADGES.media;
                  const prevStatus = getPreviousStatus(ev.status);
                  const nextStatus = getNextStatus(ev.status);
                  const isToday = ev.dueDate === todayStr;
                  const isOverdue =
                    ev.dueDate < todayStr && ev.status !== 'completed' && ev.status !== 'cancelled';

                  return (
                    <div
                      key={ev.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ev.id)}
                      className="bg-white rounded-lg border border-slate-200/90 p-3 shadow-2xs hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
                    >
                      {/* Card Header: Type & Priority */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold border truncate ${typeInfo.badgeBg}`}
                        >
                          {typeInfo.label}
                        </span>
                        <div className="flex items-center space-x-1 shrink-0">
                          {isToday && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              HOY
                            </span>
                          )}
                          {isOverdue && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              VENCIDO
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${priorityInfo.bg}`}
                          >
                            {priorityInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Patient & Title */}
                      <div className="mb-1.5">
                        <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {ev.patientName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">
                          {ev.procedure || 'Procedimiento'}
                        </div>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-800 mb-1 leading-snug">
                        {ev.title}
                      </div>

                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                        {ev.description}
                      </p>

                      {/* Amount and Due Date Pill */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className={isOverdue ? 'text-rose-600 font-bold' : isToday ? 'text-amber-700 font-bold' : ''}>
                            {ev.dueDate}
                          </span>
                        </div>

                        {ev.amount ? (
                          <span className="font-bold text-slate-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                            ${ev.amount.toLocaleString()} USD
                          </span>
                        ) : null}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-1">
                        {/* Move Backward */}
                        <div className="flex items-center space-x-1">
                          {prevStatus ? (
                            <button
                              onClick={() => onUpdateEventStatus(ev.id, prevStatus)}
                              className="p-1 rounded bg-slate-50 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Mover columna anterior"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          ) : (
                            <div className="w-5" />
                          )}

                          {nextStatus && (
                            <button
                              onClick={() => onUpdateEventStatus(ev.id, nextStatus)}
                              className="p-1 rounded bg-slate-50 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Mover siguiente columna"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center space-x-1">
                          {/* WhatsApp */}
                          <button
                            onClick={() => onOpenWhatsApp(ev)}
                            className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-[#25D366] border border-emerald-200 transition-colors"
                            title="Enviar WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </button>

                          {/* Toggle Done */}
                          <button
                            onClick={() =>
                              onUpdateEventStatus(
                                ev.id,
                                ev.status === 'completed' ? 'pending' : 'completed'
                              )
                            }
                            className={`p-1 rounded border transition-colors ${
                              ev.status === 'completed'
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-slate-50 hover:bg-slate-200 text-slate-600 border-slate-200'
                            }`}
                            title={ev.status === 'completed' ? 'Reabrir' : 'Completar'}
                          >
                            <Check className="w-3 h-3" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditEvent(ev)}
                            className="p-1 rounded bg-slate-50 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteEvent(ev.id)}
                            className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Add at bottom */}
            {onAddNewEventWithStatus && (
              <div className="p-2 bg-white/60 border-t border-slate-200 rounded-b-lg">
                <button
                  onClick={() => onAddNewEventWithStatus(column.id)}
                  className="w-full py-1 px-2 rounded-md text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white flex items-center justify-center space-x-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Añadir evento en esta etapa</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
