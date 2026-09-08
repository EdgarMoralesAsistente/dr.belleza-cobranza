import React, { useState } from 'react';
import { X, UserPlus, DollarSign, Calendar, Phone, Sparkles } from 'lucide-react';
import { Patient, Payment } from '../types';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePatient: (patient: Patient, initialPayment?: Omit<Payment, 'id' | 'patientId' | 'patientName' | 'createdAt'>) => void;
}

const COMMON_PROCEDURES = [
  'Rinoplastia Ultrasónica Estructural',
  'Lipoescultura HD con Marcación',
  'Mamoplastia de Aumento (Prótesis)',
  'Mastopexia con Implantes',
  'Blefaroplastia Superior e Inferior',
  'Bichectomía Láser',
  'Abdominoplastia con Plicatura',
  'Armonización Facial (Bótox + Rellenos)',
  'Lifting Facial Quirúrgico',
  'Otoplastia Bilateral',
  'Relleno de Labios con Ácido Hialurónico',
];

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onSavePatient,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+54 9 ');
  const [idNumber, setIdNumber] = useState('');
  const [procedure, setProcedure] = useState(COMMON_PROCEDURES[0]);
  const [customProcedure, setCustomProcedure] = useState('');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number | ''>('');
  const [initialPaymentMethod, setInitialPaymentMethod] = useState<'Transferencia' | 'Efectivo' | 'Tarjeta de Débito' | 'Tarjeta de Crédito'>('Transferencia');
  const [initialPaymentRef, setInitialPaymentRef] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !totalCost || Number(totalCost) <= 0) {
      alert('Por favor complete el nombre de la paciente y el costo total presupuestado.');
      return;
    }

    setIsSubmitting(true);

    const chosenProcedure = procedure === 'Otro' ? (customProcedure.trim() || 'Procedimiento Quirúrgico') : procedure;
    const cost = Number(totalCost);
    const initialPaid = Number(initialPaymentAmount) || 0;
    const balance = Math.max(0, cost - initialPaid);

    const newId = `PAC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPatient: Patient = {
      id: newId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      idNumber: idNumber.trim(),
      procedure: chosenProcedure,
      doctor: 'Dr. Jorge Apelencia',
      totalCost: cost,
      totalPaid: initialPaid,
      balance: balance,
      registrationDate: new Date().toISOString().split('T')[0],
      nextPaymentDate: nextPaymentDate || undefined,
      status: balance <= 0 ? 'paid' : 'pending',
      notes: notes.trim(),
    };

    let initialPaymentObj;
    if (initialPaid > 0) {
      initialPaymentObj = {
        amount: initialPaid,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: initialPaymentMethod,
        reference: initialPaymentRef.trim() || 'Seña / Pago inicial al registrar',
        registeredBy: 'Secretaría Cobranzas',
        notes: 'Pago inicial registrado al dar de alta la paciente',
      };
    }

    onSavePatient(newPatient, initialPaymentObj);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registrar Nueva Paciente
              </h2>
              <p className="text-xs text-slate-500">
                Dr. Jorge Apelencia • Ficha de Presupuesto y Plan de Cobro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Nombre Completo & DNI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre y Apellido *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Valeria Benítez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                DNI / Identificación
              </label>
              <input
                type="text"
                placeholder="Ej. 38.452.190"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Teléfono WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Teléfono / WhatsApp (con código de país) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ej. +5491145678901"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Este número se usará para el envío directo de recordatorios por WhatsApp Web.
            </p>
          </div>

          {/* Procedimiento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Procedimiento o Cirugía *
            </label>
            <select
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {COMMON_PROCEDURES.map((proc) => (
                <option key={proc} value={proc}>
                  {proc}
                </option>
              ))}
              <option value="Otro">Otro procedimiento (especificar)</option>
            </select>

            {procedure === 'Otro' && (
              <input
                type="text"
                placeholder="Describa el procedimiento quirúrgico o estético..."
                value={customProcedure}
                onChange={(e) => setCustomProcedure(e.target.value)}
                className="mt-2 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            )}
          </div>

          {/* Presupuesto Total */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Plan Económico & Presupuesto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Presupuesto Total Acordado ($) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seña o Abono Inicial ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00 (Opcional si abona ahora)"
                  value={initialPaymentAmount}
                  onChange={(e) => setInitialPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* If initial payment entered, show method and ref */}
            {Number(initialPaymentAmount) > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Método de Abono Inicial
                  </label>
                  <select
                    value={initialPaymentMethod}
                    onChange={(e) => setInitialPaymentMethod(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo en Consultorio</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nro. Comprobante / Referencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. TRANS-123456"
                    value={initialPaymentRef}
                    onChange={(e) => setInitialPaymentRef(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Calculated balance preview */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Saldo Pendiente Calculado:</span>
              <span className="font-bold text-slate-900">
                ${Math.max(0, (Number(totalCost) || 0) - (Number(initialPaymentAmount) || 0)).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Próxima Fecha de Pago */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Próxima Fecha Estimada de Pago / Vencimiento
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={nextPaymentDate}
                onChange={(e) => setNextPaymentDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Se utilizará para alertar a la secretaría sobre vencimientos en el dashboard.
            </p>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones o Condiciones Especiales
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Presupuesto congelado con seña, saldo restante contra fecha quirúrgica..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Guardar Paciente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
