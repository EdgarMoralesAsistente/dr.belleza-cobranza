import React from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  DollarSign,
  Undo2,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle,
  Mail,
  MapPin,
  Target,
  CreditCard,
  CalendarClock,
  Edit3,
  FileDown,
} from 'lucide-react';
import { Patient, Payment, Refund } from '../types';
import { downloadReceiptPDF } from '../services/pdfReport';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  payments: Payment[];
  refunds: Refund[];
  onOpenWhatsApp: (patient: Patient) => void;
  onOpenNewPayment: (patientId: string) => void;
  onOpenNewRefund: (patientId: string) => void;
  onEditPatient?: (patient: Patient) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  patient,
  payments,
  refunds,
  onOpenWhatsApp,
  onOpenNewPayment,
  onOpenNewRefund,
  onEditPatient,
}) => {
  if (!isOpen || !patient) return null;

  const patientPayments = payments.filter((p) => p.patientId === patient.id);
  const patientRefunds = refunds.filter((r) => r.patientId === patient.id);

  const isPaid = patient.balance <= 0;

  const handleDownloadFullStatement = () => {
    downloadReceiptPDF({
      patient,
      allPayments: patientPayments,
      allRefunds: patientRefunds,
      type: 'statement',
    });
  };

  const handleDownloadPaymentReceipt = (payment: Payment) => {
    downloadReceiptPDF({
      patient,
      payment,
      allPayments: patientPayments,
      allRefunds: patientRefunds,
      type: 'payment',
    });
  };

  const handleDownloadRefundReceipt = (refund: Refund) => {
    downloadReceiptPDF({
      patient,
      refund,
      allPayments: patientPayments,
      allRefunds: patientRefunds,
      type: 'refund',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold">{patient.fullName}</h2>
                <span className="text-xs text-slate-400 font-mono">({patient.id})</span>
              </div>
              <p className="text-xs text-slate-300">
                {patient.procedure} • Dr. Jorge Apelencia
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadFullStatement}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              title="Descargar Estado de Cuenta Completo en PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar .PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Quick Info & Financial Status Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Presupuesto Total
              </span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                ${patient.totalCost.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400">Pactado en consulta</span>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                Total Abonado
              </span>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">
                ${patient.totalPaid.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-600">
                {patientPayments.length} abonos registrados
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${isPaid ? 'bg-emerald-50/30 border-emerald-200' : 'bg-amber-50/60 border-amber-200'}`}>
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isPaid ? 'text-emerald-700' : 'text-amber-800'}`}>
                Saldo Pendiente
              </span>
              <p className={`text-xl font-bold mt-0.5 ${isPaid ? 'text-emerald-700' : 'text-amber-900'}`}>
                ${patient.balance.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500">
                {isPaid ? 'Al día / Cancelado' : 'Pendiente de cobro'}
              </span>
            </div>
          </div>

          {/* Contact Details & Origin */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px]">WhatsApp / Teléfono:</span>
                <strong className="font-mono text-slate-900">{patient.phone}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">DNI / Identificación:</span>
                <strong className="text-slate-900">{patient.idNumber || 'No especificado'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email:</span>
                <strong className="text-slate-900">{patient.email || 'No registrado'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Ciudad / Localidad:</span>
                <strong className="text-slate-900">{patient.city || 'No especificada'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Campaña de Origen:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Target className="w-3 h-3 mr-1 text-emerald-600" />
                  {patient.campaign || 'Orgánico / Directo'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Fecha de Alta:</span>
                <strong className="text-slate-900">{patient.registrationDate}</strong>
              </div>
              {patient.nextPaymentDate && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Próximo Vencimiento Estimado:</span>
                  <strong className="text-amber-800">{patient.nextPaymentDate}</strong>
                </div>
              )}
            </div>

            {/* Plan de Financiamiento Asignado */}
            {patient.financingPlanName && (
              <div className="pt-2.5 border-t border-slate-200/80">
                <div className="flex items-center space-x-1.5 text-slate-700 font-bold text-[11px] mb-1.5 uppercase tracking-wide">
                  <CreditCard className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Plan de Financiamiento Asignado</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      {patient.financingPlanName}
                    </span>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      {patient.financingMonths && <span>{patient.financingMonths} meses</span>}
                      {patient.financingFrequency && <span>• {patient.financingFrequency}</span>}
                      {patient.financingInstallmentsCount && (
                        <span>• {patient.financingInstallmentsCount} cuotas pactadas</span>
                      )}
                    </div>
                  </div>
                  {patient.financingInstallmentAmount && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Cuota acordada:</span>
                      <span className="text-sm font-extrabold text-[#25D366]">
                        ${patient.financingInstallmentAmount.toLocaleString()} USD
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cronograma de Cuotas Pactadas */}
            {patient.paymentSchedule && patient.paymentSchedule.length > 0 && (
              <div className="pt-2.5 border-t border-slate-200/80">
                <div className="flex items-center justify-between text-slate-700 font-bold text-[11px] mb-1.5 uppercase tracking-wide">
                  <div className="flex items-center space-x-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cronograma de Cuotas Pactadas ({patient.paymentSchedule.length})</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold sticky top-0">
                        <tr>
                          <th className="py-1.5 px-3">Cuota</th>
                          <th className="py-1.5 px-3">Vencimiento</th>
                          <th className="py-1.5 px-3 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {patient.paymentSchedule.map((p) => (
                          <tr key={p.installmentNumber} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-semibold text-slate-700 text-[11px]">
                              Cuota #{p.installmentNumber}
                            </td>
                            <td className="py-1.5 px-3 text-slate-600 text-[11px]">
                              {p.dueDate}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-slate-900 text-[11px]">
                              ${p.amount.toLocaleString()} USD
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {patient.notes && (
              <div className="pt-2 border-t border-slate-200/60 text-slate-600">
                <span className="font-semibold text-slate-700">Observaciones:</span>{' '}
                {patient.notes}
              </div>
            )}
          </div>

          {/* Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenWhatsApp(patient)}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar WhatsApp</span>
            </button>
            <button
              onClick={() => onOpenNewPayment(patient.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Registrar Abono</span>
            </button>
            <button
              onClick={() => onOpenNewRefund(patient.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <Undo2 className="w-4 h-4" />
              <span>Registrar Reintegro</span>
            </button>
            <button
              onClick={handleDownloadFullStatement}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
              title="Descargar Estado de Cuenta en PDF con detalle de cuotas y saldos"
            >
              <FileDown className="w-4 h-4 text-emerald-700" />
              <span>Descargar Estado de Cuenta (.PDF)</span>
            </button>
          </div>

          {/* Payments History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Historial de Abonos ({patientPayments.length})
              </h3>
              {patientPayments.length > 0 && (
                <span className="text-[11px] text-slate-500">
                  Haga clic en <FileDown className="w-3 h-3 inline text-emerald-700 mx-0.5" /> para descargar el recibo de cada abono
                </span>
              )}
            </div>
            {patientPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-lg">
                No hay pagos registrados para esta paciente.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Método</th>
                      <th className="py-2.5 px-3">Referencia</th>
                      <th className="py-2.5 px-3 text-right">Monto</th>
                      <th className="py-2.5 px-3 text-center w-24">Recibo PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patientPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-slate-600 font-mono">{p.date}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{p.paymentMethod}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{p.reference || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          +${p.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDownloadPaymentReceipt(p)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                            title="Descargar recibo oficial en PDF"
                          >
                            <FileDown className="w-3 h-3" />
                            <span>Recibo</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Refunds History */}
          {patientRefunds.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Reintegros / Devoluciones ({patientRefunds.length})
                </h3>
                <span className="text-[11px] text-slate-500">
                  Haga clic en <FileDown className="w-3 h-3 inline text-rose-700 mx-0.5" /> para descargar el comprobante
                </span>
              </div>
              <div className="border border-rose-100 rounded-xl overflow-hidden bg-rose-50/20 shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-50/60 border-b border-rose-100 text-rose-700 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Motivo</th>
                      <th className="py-2.5 px-3">Referencia</th>
                      <th className="py-2.5 px-3 text-right">Monto</th>
                      <th className="py-2.5 px-3 text-center w-24">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/60">
                    {patientRefunds.map((r) => (
                      <tr key={r.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-600 font-mono">{r.date}</td>
                        <td className="py-2.5 px-3 text-slate-800">{r.reason}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{r.reference || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-700">
                          -${r.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDownloadRefundReceipt(r)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            title="Descargar comprobante oficial de reintegro en PDF"
                          >
                            <FileDown className="w-3 h-3" />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            {onEditPatient && (
              <button
                type="button"
                onClick={() => {
                  onEditPatient(patient);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Datos de Paciente</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadFullStatement}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Descargar estado de cuenta completo en PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-700" />
              <span>Descargar .PDF Estado de Cuenta</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
