import React, { useState, useEffect, useMemo } from 'react';
import { X, DollarSign, Calendar, Check, MessageCircle, AlertCircle, Search, FileDown, Calculator } from 'lucide-react';
import { Patient, Payment } from '../types';
import { downloadReceiptPDF } from '../services/pdfReport';
import { recalculatePatientOnPayment, loadLocalPayments, getPatientFinancialSummary } from '../services/storage';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  payments?: Payment[];
  preselectedPatientId?: string;
  onSavePayment: (payment: Omit<Payment, 'id' | 'createdAt'>, openWhatsAppReceipt: boolean) => void;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  isOpen,
  onClose,
  patients,
  payments: paymentsProp,
  preselectedPatientId,
  onSavePayment,
}) => {
  const currentPayments = useMemo(() => paymentsProp || loadLocalPayments(), [paymentsProp]);
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

    // Calculate projected totals and re-amortized schedule
    const updatedPatient = recalculatePatientOnPayment(selectedPatient, numericAmount, date);
    const patientExistingPayments = currentPayments.filter((p) => p.patientId === selectedPatient.id);

    downloadReceiptPDF({
      patient: updatedPatient,
      payment: receiptPayment,
      allPayments: [receiptPayment, ...patientExistingPayments],
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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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

          {/* Current Patient Status Card with the 4 Financial Cards */}
          {selectedPatient && (() => {
            const financialSummary = getPatientFinancialSummary(selectedPatient, currentPayments);
            return (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{selectedPatient.procedure}</p>
                    <p className="text-slate-500">Tel: {selectedPatient.phone} {selectedPatient.idNumber ? `• DNI: ${selectedPatient.idNumber}` : ''}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedPatient.financingPlanName || 'Plan Personalizado'}
                  </span>
                </div>

                {/* 4 Tarjetas Financieras */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      Total Plan
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                      ${financialSummary.totalPlanOriginal.toLocaleString('es-AR')}
                    </p>
                    <span className="text-[8.5px] text-slate-400 block truncate">
                      Sin desc. ni bonos
                    </span>
                  </div>

                  <div className="p-2 bg-emerald-50/70 rounded-lg border border-emerald-200 shadow-2xs">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Total Inicial
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-emerald-700 mt-0.5">
                      ${financialSummary.totalInicial.toLocaleString('es-AR')}
                    </p>
                    <span className="text-[8.5px] text-emerald-600 block truncate">
                      {financialSummary.totalInicial > 0 ? 'Abono inicial' : 'Sin inicial'}
                    </span>
                  </div>

                  <div className="p-2 bg-blue-50/70 rounded-lg border border-blue-200 shadow-2xs">
                    <span className="text-[9px] font-bold text-blue-800 uppercase tracking-wider block">
                      Total de Descuentos
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-blue-900 mt-0.5">
                      ${financialSummary.totalDiscount.toLocaleString('es-AR')}
                    </p>
                    <span className="text-[8.5px] text-blue-700 block truncate" title="Suma de descuentos y bonos de descuento aplicados">
                      {financialSummary.totalDiscount > 0
                        ? (financialSummary.discountPercent || financialSummary.couponDiscount
                            ? `${financialSummary.discountPercent ? `${financialSummary.discountPercent}% dto` : ''}${financialSummary.discountPercent && financialSummary.couponDiscount ? ' + ' : ''}${financialSummary.couponDiscount ? `bono $${financialSummary.couponDiscount}` : ''}`
                            : 'Descuentos aplicados')
                        : 'Sin descuentos'}
                    </span>
                  </div>

                  <div className={`p-2 rounded-lg border shadow-2xs ${financialSummary.saldoPendiente > 0 ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'}`}>
                    <span className={`text-[9px] font-bold uppercase tracking-wider block ${financialSummary.saldoPendiente > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                      Saldo Pendiente
                    </span>
                    <p className={`text-xs sm:text-sm font-extrabold mt-0.5 ${financialSummary.saldoPendiente > 0 ? 'text-amber-900' : 'text-emerald-700'}`}>
                      ${financialSummary.saldoPendiente.toLocaleString('es-AR')}
                    </p>
                    <span className="text-[8.5px] text-slate-500 block truncate" title="Total Plan menos inicial y descuentos">
                      {financialSummary.saldoPendiente > 0 ? 'Total Plan - inicial + dto' : 'Cancelado'}
                    </span>
                  </div>
                </div>

                {/* Atajos de cuota y saldo */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">Carga rápida:</span>
                  <div className="flex items-center space-x-1.5">
                    {selectedPatient.financingInstallmentAmount && selectedPatient.financingInstallmentAmount > 0 ? (
                      <button
                        type="button"
                        onClick={() => setAmount(selectedPatient.financingInstallmentAmount || 0)}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                      >
                        Cuota ${selectedPatient.financingInstallmentAmount.toLocaleString()}
                      </button>
                    ) : null}
                    {financialSummary.saldoPendiente > 0 && (
                      <button
                        type="button"
                        onClick={() => setAmount(financialSummary.saldoPendiente)}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors cursor-pointer"
                      >
                        Saldo Total ${financialSummary.saldoPendiente.toLocaleString()}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

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

          {/* Recalculation Notice when amount > 0 and patient selected */}
          {selectedPatient && Number(amount) > 0 && (() => {
            const numAmt = Number(amount);
            const reamortized = recalculatePatientOnPayment(selectedPatient, numAmt, date);
            const pendingBefore = selectedPatient.paymentSchedule?.filter((s) => s.status !== 'paid') || [];
            const pendingAfter = reamortized.paymentSchedule?.filter((s) => s.status !== 'paid') || [];
            const oldQuota = selectedPatient.financingInstallmentAmount || (pendingBefore[0]?.amount || 0);
            const newQuota = reamortized.financingInstallmentAmount || (pendingAfter[0]?.amount || 0);
            const isFullPayoff = reamortized.balance <= 0;
            const isAmortizing = !isFullPayoff && oldQuota > 0 && newQuota < oldQuota;

            return (
              <div
                className={`p-3 rounded-xl text-xs flex items-start space-x-2.5 border shadow-2xs ${
                  isFullPayoff
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : isAmortizing
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : 'bg-blue-50/90 border-blue-200 text-blue-900'
                }`}
              >
                <Calculator
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isFullPayoff || isAmortizing ? 'text-emerald-600' : 'text-blue-600'
                  }`}
                />
                <div className="space-y-1">
                  {isFullPayoff ? (
                    <div>
                      <span className="font-bold text-emerald-800">🎉 ¡Cancelación Total de Saldo!</span>
                      <p className="mt-0.5 text-emerald-700">
                        Este abono de <strong>${numAmt.toLocaleString('es-AR')} USD</strong> cancela el 100% de la deuda.
                        Todas las cuotas pendientes del cronograma quedarán automáticamente saldadas ($0 saldo).
                      </p>
                    </div>
                  ) : isAmortizing ? (
                    <div>
                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                        ✨ ¡Amortización Automática de Cuotas Pendientes!
                      </span>
                      <p className="mt-0.5 text-emerald-800 leading-relaxed">
                        Este abono de <strong>${numAmt.toLocaleString('es-AR')} USD</strong> supera la cuota estipulada (${oldQuota.toLocaleString('es-AR')} USD).
                        El saldo restante de <strong>${reamortized.balance.toLocaleString('es-AR')} USD</strong> se amortiza entre las{' '}
                        <strong>{pendingAfter.length} cuotas pendientes</strong>, reduciendo el monto de cada cuota de{' '}
                        <span className="line-through text-slate-500 font-semibold">${oldQuota.toLocaleString('es-AR')} USD</span> a{' '}
                        <strong className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-extrabold">${newQuota.toLocaleString('es-AR')} USD / cuota</strong>.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold">Abono y actualización de saldo:</span>
                      <p className="mt-0.5">
                        Este abono de <strong>${numAmt.toLocaleString('es-AR')} USD</strong> reduce el saldo restante a{' '}
                        <strong>${reamortized.balance.toLocaleString('es-AR')} USD</strong>. El estado de cuenta y las cuotas pendientes se actualizarán en el PDF.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

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
