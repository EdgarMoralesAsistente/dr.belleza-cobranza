import React, { useState } from 'react';
import { Search, DollarSign, MessageCircle, Calendar, CreditCard, Tag, FileDown } from 'lucide-react';
import { Payment, Patient } from '../types';
import { downloadReceiptPDF } from '../services/pdfReport';

interface PaymentsTableProps {
  payments: Payment[];
  patients: Patient[];
  onOpenWhatsAppReceipt: (patient: Patient, payment: Payment) => void;
  onOpenNewPayment: () => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  patients,
  onOpenWhatsAppReceipt,
  onOpenNewPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const totalSum = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  // Group by methods for quick stats
  const uniqueMethods = Array.from(new Set(payments.map((p) => p.paymentMethod)));

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Search & Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Historial de Abonos & Pagos
            </h2>
            <p className="text-xs text-slate-500">
              Registro contable de ingresos para el consultorio del Dr. Jorge Apelencia
            </p>
          </div>
          <button
            onClick={onOpenNewPayment}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors self-start sm:self-auto"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Registrar Nuevo Abono</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por paciente, nro de comprobante o referencia bancaria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full sm:w-48 py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
          >
            <option value="all">Todos los métodos</option>
            {uniqueMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Summary info */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <span>
            Mostrando <strong>{filteredPayments.length}</strong> abonos registrados
          </span>
          <span className="text-emerald-700 font-bold">
            Total recaudado en vista: ${totalSum.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Paciente</th>
              <th className="py-3 px-4">Método</th>
              <th className="py-3 px-4">Referencia</th>
              <th className="py-3 px-4 text-right">Monto</th>
              <th className="py-3 px-4">Registrado Por</th>
              <th className="py-3 px-4 text-center">Recibo WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No se encontraron abonos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => {
                const patient = patients.find((pat) => pat.id === p.patientId);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {p.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{p.patientName}</span>
                      {p.notes && (
                        <div className="text-xs text-slate-500 truncate max-w-xs">
                          {p.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {p.reference || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      +${p.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {p.registeredBy || 'Secretaría'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => {
                            if (patient) {
                              downloadReceiptPDF({
                                patient,
                                payment: p,
                                type: 'payment',
                              });
                            }
                          }}
                          disabled={!patient}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors disabled:opacity-40 cursor-pointer"
                          title="Descargar Recibo en PDF"
                        >
                          <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => {
                            if (patient) {
                              onOpenWhatsAppReceipt(patient, p);
                            }
                          }}
                          disabled={!patient}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                          title="Enviar comprobante a la paciente por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
