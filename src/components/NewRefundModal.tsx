import React, { useState, useEffect } from 'react';
import { X, Undo2, Calendar, MessageCircle, AlertTriangle } from 'lucide-react';
import { Patient, Refund } from '../types';

interface NewRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  preselectedPatientId?: string;
  onSaveRefund: (refund: Omit<Refund, 'id' | 'createdAt'>, openWhatsApp: boolean) => void;
}

export const NewRefundModal: React.FC<NewRefundModalProps> = ({
  isOpen,
  onClose,
  patients,
  preselectedPatientId,
  onSaveRefund,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState<Refund['refundMethod']>('Transferencia');
  const [reference, setReference] = useState('');
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
      alert('Ingrese un monto válido a reintegrar');
      return;
    }
    if (!reason.trim()) {
      alert('Especifique el motivo del reintegro');
      return;
    }

    onSaveRefund(
      {
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        amount: Number(amount),
        date,
        reason: reason.trim(),
        refundMethod,
        reference: reference.trim(),
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-rose-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <Undo2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registrar Reintegro a Paciente
              </h2>
              <p className="text-xs text-slate-500">
                Dr. Jorge Apelencia • Devolución o ajuste de saldo a favor
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
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-medium"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} — {p.procedure} (Abonado: ${p.totalPaid.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {selectedPatient && (
            <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-800">{selectedPatient.procedure}</p>
                <p className="text-slate-500">Tel: {selectedPatient.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Total Abonado:</p>
                <p className="font-bold text-sm text-emerald-700">
                  ${selectedPatient.totalPaid.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Monto y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monto del Reintegro ($) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-base font-bold text-rose-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Devolución *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo del Reintegro *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Bonificación de anestesia / Cancelación de turno acordada..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Método y Referencia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Método de Devolución
              </label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              >
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Otro">Otro medio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Comprobante / Nro. Transferencia
              </label>
              <input
                type="text"
                placeholder="Ej. DEV-BCO-88190"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* WhatsApp Notify */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="notifyRefundWhatsApp"
              checked={notifyWhatsApp}
              onChange={(e) => setNotifyWhatsApp(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
            />
            <label
              htmlFor="notifyRefundWhatsApp"
              className="text-xs font-medium text-slate-700 cursor-pointer flex items-center"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Notificar inmediatamente a la paciente vía WhatsApp Web
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
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Undo2 className="w-4 h-4" />
              <span>Registrar Reintegro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
