import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Plus,
  Check,
  Edit3,
  Trash2,
  DollarSign,
  User,
  Sparkles,
} from 'lucide-react';
import { CRMEvent, CRMEventStatus, CRMEventType, CRMPriority, Patient } from '../../types';

interface CRMCalendarViewProps {
  events: CRMEvent[];
  patients: Patient[];
  onUpdateEventStatus: (eventId: string, newStatus: CRMEventStatus) => void;
  onEditEvent: (event: CRMEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onOpenWhatsApp: (event: CRMEvent) => void;
  onAddNewEventForDate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const TYPE_DOTS: Record<CRMEventType, { bg: string; text: string }> = {
  bienvenida: { bg: 'bg-emerald-500', text: 'text-emerald-700' },
  notificacion_cobro: { bg: 'bg-amber-500', text: 'text-amber-800' },
  vencimiento_cuota: { bg: 'bg-rose-500', text: 'text-rose-800' },
  seguimiento_medico: { bg: 'bg-blue-500', text: 'text-blue-800' },
  confirmacion_abono: { bg: 'bg-teal-500', text: 'text-teal-800' },
  otro: { bg: 'bg-slate-500', text: 'text-slate-700' },
};

export const CRMCalendarView: React.FC<CRMCalendarViewProps> = ({
  events,
  patients,
  onUpdateEventStatus,
  onEditEvent,
  onDeleteEvent,
  onOpenWhatsApp,
  onAddNewEventForDate,
}) => {
  // Current view date
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  // Build calendar matrix for currentMonth
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Monday-based day of week (0 = Lun, ..., 6 = Dom)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const monthPadded = String(prevMonth + 1).padStart(2, '0');
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${prevYear}-${monthPadded}-${dayPadded}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const monthPadded = String(currentMonth + 1).padStart(2, '0');
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthPadded}-${dayPadded}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to complete 35 or 42 cells (7 columns)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const monthPadded = String(nextMonth + 1).padStart(2, '0');
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${nextYear}-${monthPadded}-${dayPadded}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [currentYear, currentMonth, todayStr]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CRMEvent[]>();
    events.forEach((ev) => {
      const list = map.get(ev.dueDate) || [];
      list.push(ev);
      map.set(ev.dueDate, list);
    });
    return map;
  }, [events]);

  const selectedDateEvents = eventsByDate.get(selectedDate) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      {/* Calendar Grid (2 Cols on lg) */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Calendar Header Navigation */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <CalendarIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <p className="text-xs text-slate-500">
                Agenda de cobros, vencimientos y citas quirúrgicas
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs cursor-pointer"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-500 py-2">
          {WEEKDAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Month grid cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-50/30">
          {calendarDays.map((cell) => {
            const dayEvents = eventsByDate.get(cell.dateStr) || [];
            const isSelected = cell.dateStr === selectedDate;
            const hasOverdue = dayEvents.some(
              (e) => e.dueDate < todayStr && e.status !== 'completed' && e.status !== 'cancelled'
            );

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDate(cell.dateStr)}
                className={`min-h-[92px] sm:min-h-[105px] p-1.5 transition-all cursor-pointer flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-50/70 text-slate-300'
                    : isSelected
                    ? 'bg-emerald-50/60 ring-2 ring-emerald-500 ring-inset z-10'
                    : 'bg-white hover:bg-slate-50/80 text-slate-800'
                }`}
              >
                {/* Day Number and Badges */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                      cell.isToday
                        ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                        : isSelected
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
                        : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {dayEvents.length > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${
                        hasOverdue
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Day Events Chips (up to 2-3 visible) */}
                <div className="space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const dotInfo = TYPE_DOTS[ev.type] || TYPE_DOTS.otro;
                    const isDone = ev.status === 'completed';

                    return (
                      <div
                        key={ev.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium flex items-center space-x-1 border ${
                          isDone
                            ? 'bg-slate-100 text-slate-400 line-through border-slate-200'
                            : ev.type === 'vencimiento_cuota'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : ev.type === 'notificacion_cobro'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                        title={`${ev.patientName}: ${ev.title}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotInfo.bg}`} />
                        <span className="truncate">{ev.patientName.split(' ')[0]}: {ev.amount ? `$${ev.amount}` : ev.title}</span>
                      </div>
                    );
                  })}

                  {dayEvents.length > 2 && (
                    <div className="text-[9px] text-slate-500 font-bold px-1 text-right">
                      +{dayEvents.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">
            Convención:
          </span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Aviso de Cobro</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Vencimiento Cuota</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Seguimiento Médico</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Bienvenida / Seña</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col space-y-4">
        {/* Header of selected day */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Agenda del Día
            </div>
            <h3 className="font-bold text-base text-slate-900 capitalize">
              {selectedDate === todayStr ? 'Hoy, ' : ''}
              {selectedDate}
            </h3>
          </div>
          <button
            onClick={() => onAddNewEventForDate(selectedDate)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agendar</span>
          </button>
        </div>

        {/* Events list for selected day */}
        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Sin eventos programados para esta fecha</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Utilice el botón "Agendar" para programar una notificación de cobro o seguimiento.
              </p>
            </div>
          ) : (
            selectedDateEvents.map((ev) => {
              const isDone = ev.status === 'completed';

              return (
                <div
                  key={ev.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : 'bg-white border-slate-200/90 shadow-2xs hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        ev.type === 'vencimiento_cuota'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : ev.type === 'notificacion_cobro'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {ev.type === 'vencimiento_cuota'
                        ? 'Vencimiento'
                        : ev.type === 'notificacion_cobro'
                        ? 'Aviso de Cobro'
                        : ev.type === 'bienvenida'
                        ? 'Bienvenida'
                        : 'Seguimiento'}
                    </span>

                    {ev.dueTime && (
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{ev.dueTime} hs</span>
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs text-slate-900">
                    {ev.patientName}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                    {ev.title}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {ev.description}
                  </p>

                  {ev.amount && (
                    <div className="mt-2 text-xs font-bold text-slate-900 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 inline-block">
                      Monto: ${ev.amount.toLocaleString()} USD
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {ev.assignedTo || 'Consultorio'}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onOpenWhatsApp(ev)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-[#25D366] hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() =>
                          onUpdateEventStatus(
                            ev.id,
                            ev.status === 'completed' ? 'pending' : 'completed'
                          )
                        }
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          ev.status === 'completed'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                        title={ev.status === 'completed' ? 'Reabrir' : 'Completar'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditEvent(ev)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteEvent(ev.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
