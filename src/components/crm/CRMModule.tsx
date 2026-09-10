import React, { useState, useMemo } from 'react';
import {
  Table as TableIcon,
  Kanban as KanbanIcon,
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  MessageCircle,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { CRMEvent, CRMEventStatus, Patient, SystemUser } from '../../types';
import { CRMTableView } from './CRMTableView';
import { CRMKanbanView } from './CRMKanbanView';
import { CRMCalendarView } from './CRMCalendarView';
import { CRMEventModal } from './CRMEventModal';
import { generatePatientCRMEvents } from '../../services/storage';

export type CRMSubView = 'table' | 'kanban' | 'calendar';

interface CRMModuleProps {
  events: CRMEvent[];
  patients: Patient[];
  users: SystemUser[];
  onSaveEvents: (updatedEvents: CRMEvent[]) => void;
  onOpenWhatsAppModal: (patient: Patient, customMessage?: string) => void;
}

export const CRMModule: React.FC<CRMModuleProps> = ({
  events,
  patients,
  users,
  onSaveEvents,
  onOpenWhatsAppModal,
}) => {
  const [currentView, setCurrentView] = useState<CRMSubView>('table');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CRMEvent | null>(null);
  const [defaultDateForModal, setDefaultDateForModal] = useState<string | undefined>();
  const [defaultStatusForModal, setDefaultStatusForModal] = useState<CRMEventStatus>('pending');

  const todayStr = new Date().toISOString().split('T')[0];

  // Top Metrics
  const metrics = useMemo(() => {
    const total = events.length;
    const pending = events.filter((e) => e.status === 'pending').length;
    const inProgress = events.filter((e) => e.status === 'in_progress').length;
    const completed = events.filter((e) => e.status === 'completed').length;
    const dueToday = events.filter((e) => e.dueDate === todayStr && e.status !== 'completed').length;
    const overdue = events.filter(
      (e) => e.dueDate < todayStr && e.status !== 'completed' && e.status !== 'cancelled'
    ).length;

    const totalCollectedFromEvents = events
      .filter((e) => e.status === 'completed' && e.amount)
      .reduce((acc, e) => acc + (e.amount || 0), 0);

    const totalPendingAmount = events
      .filter((e) => e.status !== 'completed' && e.status !== 'cancelled' && e.amount)
      .reduce((acc, e) => acc + (e.amount || 0), 0);

    return {
      total,
      pending,
      inProgress,
      completed,
      dueToday,
      overdue,
      totalCollectedFromEvents,
      totalPendingAmount,
    };
  }, [events, todayStr]);

  // Event Mutations
  const handleUpdateEventStatus = (eventId: string, newStatus: CRMEventStatus) => {
    const updated = events.map((ev) => {
      if (ev.id === eventId) {
        return {
          ...ev,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return ev;
    });
    onSaveEvents(updated);
  };

  const handleSaveEvent = (savedEvent: CRMEvent) => {
    const exists = events.some((e) => e.id === savedEvent.id);
    let updated: CRMEvent[];
    if (exists) {
      updated = events.map((e) => (e.id === savedEvent.id ? savedEvent : e));
    } else {
      updated = [savedEvent, ...events];
    }
    onSaveEvents(updated);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('¿Está seguro de eliminar este evento del CRM?')) {
      const updated = events.filter((e) => e.id !== eventId);
      onSaveEvents(updated);
    }
  };

  const handleOpenEditEvent = (event: CRMEvent) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleAddNewForDate = (dateStr: string) => {
    setEditingEvent(null);
    setDefaultDateForModal(dateStr);
    setDefaultStatusForModal('pending');
    setIsEventModalOpen(true);
  };

  const handleAddNewWithStatus = (status: CRMEventStatus) => {
    setEditingEvent(null);
    setDefaultDateForModal(todayStr);
    setDefaultStatusForModal(status);
    setIsEventModalOpen(true);
  };

  // WhatsApp Trigger from an Event
  const handleTriggerWhatsApp = (event: CRMEvent) => {
    const matchedPatient = patients.find((p) => p.id === event.patientId) || {
      id: event.patientId,
      fullName: event.patientName,
      phone: event.patientPhone,
      idNumber: '',
      procedure: event.procedure || '',
      doctor: 'Dr. Jorge Apelencia',
      totalCost: event.amount || 0,
      totalPaid: 0,
      balance: event.amount || 0,
      registrationDate: todayStr,
      status: 'pending' as const,
    };

    onOpenWhatsAppModal(matchedPatient);
  };

  // Sync / Auto-generate events for patients that don't have events yet
  const handleSyncPatientsEvents = () => {
    let newEventsAccumulated: CRMEvent[] = [];
    patients.forEach((p) => {
      const hasEvents = events.some((e) => e.patientId === p.id);
      if (!hasEvents) {
        const auto = generatePatientCRMEvents(p, p.totalPaid > 0 ? p.totalPaid : undefined);
        newEventsAccumulated = [...newEventsAccumulated, ...auto];
      }
    });

    if (newEventsAccumulated.length > 0) {
      onSaveEvents([...newEventsAccumulated, ...events]);
      alert(`Se generaron automáticamente ${newEventsAccumulated.length} eventos de CRM para pacientes pendientes.`);
    } else {
      alert('Todas las pacientes registradas ya cuentan con eventos generados en el CRM.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Subview Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                CRM de Cobranza & Pacientes
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Automatizado
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión unificada de notificaciones de cobro, vencimientos de cuotas, seguimiento pre-quirúrgico y bienvenida.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher: Tabla, Kanban, Calendario */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setCurrentView('table')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'table'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tabla (Listado)</span>
              </button>

              <button
                onClick={() => setCurrentView('kanban')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'kanban'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KanbanIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Kanban (Trello)</span>
              </button>

              <button
                onClick={() => setCurrentView('calendar')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'calendar'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>Calendario</span>
              </button>
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSyncPatientsEvents}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              title="Generar automáticamente eventos para pacientes registradas que aún no tengan eventos en CRM"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sincronizar Pacientes</span>
            </button>

            {/* New Event Button */}
            <button
              onClick={() => {
                setEditingEvent(null);
                setDefaultDateForModal(todayStr);
                setDefaultStatusForModal('pending');
                setIsEventModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Evento CRM</span>
            </button>
          </div>
        </div>

        {/* 4 Strategic Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          {/* Card 1: Due Today */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Cobros Para Hoy
              </div>
              <div className="text-xl font-bold text-amber-950 mt-0.5">
                {metrics.dueToday}
              </div>
              <div className="text-[10px] text-amber-700 font-medium">
                Notificaciones y vencimientos
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Overdue */}
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                Cuotas Vencidas
              </div>
              <div className="text-xl font-bold text-rose-950 mt-0.5">
                {metrics.overdue}
              </div>
              <div className="text-[10px] text-rose-700 font-medium">
                Requieren contacto prioritario
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: In Progress & Pending */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Por Cobrar / En Gestión
              </div>
              <div className="text-xl font-bold text-blue-950 mt-0.5">
                ${metrics.totalPendingAmount.toLocaleString()} USD
              </div>
              <div className="text-[10px] text-blue-700 font-medium">
                {metrics.pending + metrics.inProgress} tareas activas
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Completed */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Cobrado / Completado
              </div>
              <div className="text-xl font-bold text-emerald-950 mt-0.5">
                ${metrics.totalCollectedFromEvents.toLocaleString()} USD
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">
                {metrics.completed} eventos resueltos
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Subview View Body */}
      <div>
        {currentView === 'table' && (
          <CRMTableView
            events={events}
            patients={patients}
            onUpdateEventStatus={handleUpdateEventStatus}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onOpenWhatsApp={handleTriggerWhatsApp}
          />
        )}

        {currentView === 'kanban' && (
          <CRMKanbanView
            events={events}
            patients={patients}
            onUpdateEventStatus={handleUpdateEventStatus}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onOpenWhatsApp={handleTriggerWhatsApp}
            onAddNewEventWithStatus={handleAddNewWithStatus}
          />
        )}

        {currentView === 'calendar' && (
          <CRMCalendarView
            events={events}
            patients={patients}
            onUpdateEventStatus={handleUpdateEventStatus}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onOpenWhatsApp={handleTriggerWhatsApp}
            onAddNewEventForDate={handleAddNewForDate}
          />
        )}
      </div>

      {/* Modal for Creating / Editing CRM Events */}
      <CRMEventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        patients={patients}
        users={users}
        defaultDate={defaultDateForModal}
        defaultStatus={defaultStatusForModal}
      />
    </div>
  );
};
