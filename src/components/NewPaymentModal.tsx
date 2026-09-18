import React, { useState, useEffect, useMemo } from 'react';
import { X, DollarSign, Calendar, Check, MessageCircle, AlertCircle, Search, FileDown } from 'lucide-react';
import { Patient, Payment } from '../types';
import { downloadReceiptPDF } from '../services/pdfReport';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('Transferencia');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [autoDownloadPdf, setAutoDownloadPdf] = useState(true);

  // Filter patients by name, procedure, DNI, phone
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const term = searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(term) ||
        p.procedure.toLowerCase().includes(term) ||
        (p.idNumber && p.idNumber.toLowerCase().includes(term)) ||
        p.phone.includes(term)
    );
  }, [patients, searchTerm]);

  useEffect(() => {
    if (preselectedPatientId) {
      setSelectedPatientId(preselectedPatientId);
    } else if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [preselectedPatientId, patients]);

  // When searching, if current selected patient is not in filtered list, auto-select first match
  useEffect(() => {
    if (searchTerm.trim() && filteredPatients.length > 0) {
      const isSelectedInFiltered = filteredPatients.some((p) => p.id === selectedPatientId);
      if (!isSelectedInFiltered) {
        setSelectedPatientId(filteredPatients[0].id);
      }
    }
  }, [searchTerm, filteredPatients, selectedPatientId]);

  if (!isOpen) return null;

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const handleDownloadPDF = () => {
    if (!selectedPatient) {
      alert('Seleccione una paciente primero');
      return;
    }
    const numericAmount = amount === '' ? 0 : Number(amount);
    if (numericAmount <= 0) {
      alert('Ingrese un monto válido mayor a 0 para generar el recibo');
      return;
    }

    const receiptPayment: Payment = {
      id: reference.trim() || `REC-${Date.now().toString().slice(-6)}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      amount: numericAmount,
      date,
      paymentMethod,
      reference: reference.trim() || `REC-${Date.now().toString().slice(-6)}`,
      notes: notes.trim(),
      registeredBy: 'Secretaría Cobranzas',
      createdAt: new Date().toISOString(),
    };

    // Calculate projected totals
    const projectedPaid = selectedPatient.totalPaid + numericAmount;
    const projectedBalance = Math.max(0, selectedPatient.totalCost - projectedPaid);
    const updatedPatient: Patient = {
      ...selectedPatient,
      totalPaid: projectedPaid,
      balance: projectedBalance,
      status: projectedBalance === 0 ? 'paid' : selectedPatient.status,
    };

    downloadReceiptPDF({
      patient: updatedPatient,
      payment: receiptPayment,
      type: 'payment',
    });
  };

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

    const numericAmount = Number(amount);

    if (autoDownloadPdf) {
      handleDownloadPDF();
    }

    onSavePayment(
      {
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        amount: numericAmount,
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
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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
                Dr. Jorge Apelencia • Ingreso de fondos con recibo y estado de cuenta PDF
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
          {/* Barra de búsqueda por paciente o cirugía */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Buscar y Seleccionar Paciente *
              </label>
              {searchTerm && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {filteredPatients.length} {filteredPatients.length === 1 ? 'coincidencia' : 'coincidencias'}
                </span>
              )}
            </div>

            {/* Input de búsqueda */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por paciente, cirugía, DNI o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 placeholder:text-slate-400 font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selector desplegable de pacientes filtrados */}
            <select
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            >
              {filteredPatients.length === 0 ? (
                <option value="" disabled>
                  No se encontraron pacientes para "{searchTerm}"
                </option>
              ) : (
                filteredPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} — {p.procedure} (Saldo: ${p.balance.toLocaleString()})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Current Patient Status Card */}
          {selectedPatient && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-800">{selectedPatient.procedure}</p>
                <p className="text-slate-500">Tel: {selectedPatient.phone} {selectedPatient.idNumber ? `• DNI: ${selectedPatient.idNumber}` : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Saldo Actual:</p>
                <p className={`font-bold text-sm ${selectedPatient.balance > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                  ${selectedPatient.balance.toLocaleString()} USD
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
              <option value="Binance">Binance (USDT / Cripto)</option>
              <option value="Mercado Pago">Mercado Pago / Billetera Virtual</option>
              <option value="Otro">Otro medio de pago</option>
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
              placeholder="Ej. Pago de cuota pactada para gastos de quirófano..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Opciones de salida: Descarga PDF y WhatsApp */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoDownloadPdf"
                checked={autoDownloadPdf}
                onChange={(e) => setAutoDownloadPdf(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <label
                htmlFor="autoDownloadPdf"
                className="text-xs font-medium text-slate-700 cursor-pointer flex items-center"
              >
                <FileDown className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                Descargar automáticamente el Recibo Oficial (.PDF) con Estado de Cuenta
              </label>
            </div>

            <div className="flex items-center space-x-2">
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
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              title="Descarga directa inmediata del comprobante PDF"
            >
              <FileDown className="w-4 h-4 text-emerald-700" />
              <span>Descargar .PDF Ahora</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Abono</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
