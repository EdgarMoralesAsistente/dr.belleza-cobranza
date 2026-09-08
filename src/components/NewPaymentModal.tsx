import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Check, MessageCircle, AlertCircle } from 'lucide-react';
import { Patient, Payment } from '../types';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  preselectedPatientId?: string;
  onSavePayment: (payment: Omit<Payment, 'id' | 'createdAt'>, openWhatsAppReceipt: boolean) => void;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  isOpen,
  onClose,
  patients,
  preselectedPatientId,
  onSavePayment,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('Transferencia');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);

  useEffect(() => {
    if (preselectedPatientId) {
      setSelectedPatientId(preselectedPatientId);
    } else if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [preselectedPatientId, patients]);

  if (!isOpen) return null;

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Seleccione una paciente');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Ingrese un monto válido mayor a 0');
      return;
    }

    onSavePayment(
      {
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        amount: Number(amount),
        date,
        paymentMethod,
        reference: reference.trim(),
        notes: notes.trim(),
        registeredBy: 'Secretaría Cobranzas',
      },
      notifyWhatsApp
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-emerald-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registrar Nuevo Abono / Pago
              </h2>
              <p className="text-xs text-slate-500">
                Dr. Jorge Apelencia • Ingreso de fondos a cuenta de paciente
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Seleccionar Paciente */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Seleccionar Paciente *
            </label>
            <select
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} — {p.procedure} (Saldo: ${p.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Current Patient Status Card */}
          {selectedPatient && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-800">{selectedPatient.procedure}</p>
                <p className="text-slate-500">Tel: {selectedPatient.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Saldo Actual:</p>
                <p className={`font-bold text-sm ${selectedPatient.balance > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                  ${selectedPatient.balance.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Monto y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monto del Abono ($) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-base font-bold text-emerald-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Cobro *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Método de Pago *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Transferencia">Transferencia Bancaria</option>
              <option value="Efectivo">Efectivo en Consultorio</option>
              <option value="Tarjeta de Débito">Tarjeta de Débito</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Zelle">Zelle / Dólares</option>
              <option value="Mercado Pago">Mercado Pago / Billetera Virtual</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nro. de Comprobante / Referencia Bancaria
            </label>
            <input
              type="text"
              placeholder="Ej. TRANS-009823 o Recibo N° 4412"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detalle o Notas del Pago
            </label>
            <input
              type="text"
              placeholder="Ej. Pago de segunda cuota para materiales de quirófano..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* WhatsApp Toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="notifyWhatsApp"
              checked={notifyWhatsApp}
              onChange={(e) => setNotifyWhatsApp(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
            />
            <label
              htmlFor="notifyWhatsApp"
              className="text-xs font-medium text-slate-700 cursor-pointer flex items-center"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Abrir WhatsApp Web con recibo de confirmación tras registrar
            </label>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Abono</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
