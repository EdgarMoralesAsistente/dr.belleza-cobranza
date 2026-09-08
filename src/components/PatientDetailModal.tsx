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
} from 'lucide-react';
import { Patient, Payment, Refund } from '../types';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  payments: Payment[];
  refunds: Refund[];
  onOpenWhatsApp: (patient: Patient) => void;
  onOpenNewPayment: (patientId: string) => void;
  onOpenNewRefund: (patientId: string) => void;
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
}) => {
  if (!isOpen || !patient) return null;

  const patientPayments = payments.filter((p) => p.patientId === patient.id);
  const patientRefunds = refunds.filter((r) => r.patientId === patient.id);

  const isPaid = patient.balance <= 0;

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
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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

          {/* Contact Details & Notes */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-400">WhatsApp / Teléfono:</span>{' '}
                <strong className="font-mono">{patient.phone}</strong>
              </div>
              <div>
                <span className="text-slate-400">DNI / Identificación:</span>{' '}
                <strong>{patient.idNumber || 'No especificado'}</strong>
              </div>
              <div>
                <span className="text-slate-400">Fecha de Alta:</span>{' '}
                <strong>{patient.registrationDate}</strong>
              </div>
              {patient.nextPaymentDate && (
                <div>
                  <span className="text-slate-400">Próximo Vencimiento:</span>{' '}
                  <strong className="text-amber-800">{patient.nextPaymentDate}</strong>
                </div>
              )}
            </div>

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
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar WhatsApp</span>
            </button>
            <button
              onClick={() => onOpenNewPayment(patient.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span>Registrar Abono</span>
            </button>
            <button
              onClick={() => onOpenNewRefund(patient.id)}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
              <span>Registrar Reintegro</span>
            </button>
          </div>

          {/* Payments History */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Historial de Abonos ({patientPayments.length})
            </h3>
            {patientPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-lg">
                No hay pagos registrados para esta paciente.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Método</th>
                      <th className="py-2.5 px-3">Referencia</th>
                      <th className="py-2.5 px-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patientPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">{p.date}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{p.paymentMethod}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{p.reference || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          +${p.amount.toLocaleString()}
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
              <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Reintegros / Devoluciones ({patientRefunds.length})
              </h3>
              <div className="border border-rose-100 rounded-xl overflow-hidden bg-rose-50/20">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-50/60 border-b border-rose-100 text-rose-700 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Motivo</th>
                      <th className="py-2.5 px-3">Referencia</th>
                      <th className="py-2.5 px-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/60">
                    {patientRefunds.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">{r.date}</td>
                        <td className="py-2.5 px-3 text-slate-800">{r.reason}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{r.reference || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-700">
                          -${r.amount.toLocaleString()}
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
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
