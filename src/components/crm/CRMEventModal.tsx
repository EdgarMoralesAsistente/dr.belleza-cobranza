import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  DollarSign,
  AlertCircle,
  FileText,
  Tag,
  Phone,
  Sparkles,
} from 'lucide-react';
import { CRMEvent, CRMEventStatus, CRMEventType, CRMPriority, CRMChannel, Patient, SystemUser } from '../../types';

interface CRMEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: CRMEvent) => void;
  editingEvent?: CRMEvent | null;
  patients: Patient[];
  users: SystemUser[];
  defaultDate?: string;
  defaultStatus?: CRMEventStatus;
}

export const CRMEventModal: React.FC<CRMEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEvent,
  patients,
  users,
  defaultDate,
  defaultStatus = 'pending',
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [procedure, setProcedure] = useState('');

  const [type, setType] = useState<CRMEventType>('notificacion_cobro');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate || todayStr);
  const [dueTime, setDueTime] = useState('10:00');
  const [priority, setPriority] = useState<CRMPriority>('media');
  const [status, setStatus] = useState<CRMEventStatus>(defaultStatus);
  const [amount, setAmount] = useState<number | ''>('');
  const [assignedTo, setAssignedTo] = useState('');
  const [channel, setChannel] = useState<CRMChannel>('whatsapp');

  useEffect(() => {
    if (editingEvent) {
      setPatientId(editingEvent.patientId);
      setPatientName(editingEvent.patientName);
      setPatientPhone(editingEvent.patientPhone);
      setProcedure(editingEvent.procedure || '');
      setType(editingEvent.type);
      setTitle(editingEvent.title);
      setDescription(editingEvent.description);
      setDueDate(editingEvent.dueDate);
      setDueTime(editingEvent.dueTime || '10:00');
      setPriority(editingEvent.priority);
      setStatus(editingEvent.status);
      setAmount(editingEvent.amount !== undefined ? editingEvent.amount : '');
      setAssignedTo(editingEvent.assignedTo || '');
      setChannel(editingEvent.channel || 'whatsapp');
    } else {
      // Default new
      setPatientId(patients[0]?.id || '');
      setPatientName(patients[0]?.fullName || '');
      setPatientPhone(patients[0]?.phone || '');
      setProcedure(patients[0]?.procedure || '');
      setType('notificacion_cobro');
      setTitle('Recordatorio de Cobro');
      setDescription('Avisar a la paciente sobre su próximo abono programado.');
      setDueDate(defaultDate || todayStr);
      setDueTime('10:00');
      setPriority('media');
      setStatus(defaultStatus);
      setAmount(patients[0]?.balance || '');
      setAssignedTo(users[0]?.fullName ? `${users[0].fullName} (${users[0].role})` : '');
      setChannel('whatsapp');
    }
  }, [editingEvent, isOpen, defaultDate, defaultStatus, patients, users]);

  if (!isOpen) return null;

  const handlePatientSelect = (selectedId: string) => {
    setPatientId(selectedId);
    const p = patients.find((pat) => pat.id === selectedId);
    if (p) {
      setPatientName(p.fullName);
      setPatientPhone(p.phone);
      setProcedure(p.procedure);
      if (!editingEvent && p.balance > 0) {
        setAmount(p.balance);
      }
    }
  };

  const handleTypeChange = (newType: CRMEventType) => {
    setType(newType);
    if (!editingEvent) {
      if (newType === 'bienvenida') {
        setTitle(`Bienvenida y Ficha Médica a ${patientName}`);
        setDescription(`Enviar mensaje de bienvenida y verificar datos para ${procedure}.`);
        setPriority('alta');
      } else if (newType === 'notificacion_cobro') {
        setTitle(`Aviso Previo de Cobro - ${patientName}`);
        setDescription(`Recordar fecha próxima de pago y enviar datos bancarios.`);
        setPriority('media');
      } else if (newType === 'vencimiento_cuota') {
        setTitle(`Vencimiento Oficial de Cobro - ${patientName}`);
        setDescription(`Cobro pactado para el día de hoy. Solicitar comprobante.`);
        setPriority('alta');
      } else if (newType === 'seguimiento_medico') {
        setTitle(`Seguimiento Pre-Quirúrgico / Analíticas`);
        setDescription(`Consultar estado de analíticas preoperatorias y electrocardiograma.`);
        setPriority('media');
      } else if (newType === 'confirmacion_abono') {
        setTitle(`Confirmación de Pago / Emisión de Recibo`);
        setDescription(`Recibo emitido y fecha de quirófano ratificada.`);
        setPriority('baja');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !title.trim() || !dueDate) {
      alert('Por favor complete los campos obligatorios (Paciente, Título y Fecha).');
      return;
    }

    const eventPayload: CRMEvent = {
      id: editingEvent ? editingEvent.id : `CRM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      patientId: patientId || `PAC-${Date.now()}`,
      patientName,
      patientPhone,
      procedure,
      type,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      status,
      amount: amount !== '' ? Number(amount) : undefined,
      assignedTo: assignedTo || undefined,
      channel,
      createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString(),
      completedAt: status === 'completed' ? (editingEvent?.completedAt || new Date().toISOString()) : undefined,
    };

    onSave(eventPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editingEvent ? 'Editar Evento de CRM' : 'Nuevo Evento de CRM & Cobranza'}
              </h2>
              <p className="text-xs text-slate-500">
                Automatice o agende notificaciones, cobros y seguimientos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Patient Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Paciente Asignada <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={patientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="">Seleccionar paciente existente...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} - {p.procedure}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Nombre de la paciente"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Procedure and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Procedimiento / Cirugía
              </label>
              <input
                type="text"
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                placeholder="Ej. Rinoplastia Ultrasónica"
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">
                WhatsApp / Teléfono
              </label>
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="Ej. +5491145678901"
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Event Type & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tipo de Evento
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as CRMEventType)}
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="notificacion_cobro">Aviso Previo de Cobro</option>
                <option value="vencimiento_cuota">Vencimiento Oficial de Cuota</option>
                <option value="bienvenida">Bienvenida y Ficha Médica</option>
                <option value="seguimiento_medico">Seguimiento Médico / Quirófano</option>
                <option value="confirmacion_abono">Abono / Seña Recibida</option>
                <option value="otro">Otro Evento</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CRMPriority)}
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="alta">🔴 Alta (Urgente / Vencimiento hoy)</option>
                <option value="media">🟡 Media (Preventivo / Notificación)</option>
                <option value="baja">⚪ Baja (Informativo / Rutina)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Título del Evento <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ej. Cobro Cuota #1 ($200 USD)"
              className="w-full py-2 px-2.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-slate-600 mb-1">
              Descripción / Notas de la Gestión
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle o instrucción para secretaría / finanzas..."
              className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Date, Time and Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Fecha Vencimiento <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Hora Estimada
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Monto USD (si aplica)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Status & Assigned User */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Estado de la Tarea
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CRMEventStatus)}
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="pending">⏳ Pendiente</option>
                <option value="in_progress">🔄 En Seguimiento</option>
                <option value="completed">✅ Cobrado / Completado</option>
                <option value="cancelled">🚫 Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Canal de Contacto
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as CRMChannel)}
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="llamada">Llamada Telefónica</option>
                <option value="email">Correo Electrónico</option>
                <option value="presencial">Presencial en Clínica</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Responsable Asignado
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Ej. Luciana (Secretaría)"
                className="w-full py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold transition-colors shadow-2xs cursor-pointer"
            >
              {editingEvent ? 'Guardar Cambios' : 'Crear Evento en CRM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
