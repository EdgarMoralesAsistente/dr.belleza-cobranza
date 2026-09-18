import React, { useState } from 'react';
import { Search, Undo2, MessageCircle } from 'lucide-react';
import { Refund, Patient } from '../types';

interface RefundsTableProps {
  refunds: Refund[];
  patients: Patient[];
  onOpenWhatsAppRefund: (patient: Patient, refund: Refund) => void;
  onOpenNewRefund: () => void;
}

export const RefundsTable: React.FC<RefundsTableProps> = ({
  refunds,
  patients,
  onOpenWhatsAppRefund,
  onOpenNewRefund,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRefunds = refunds.filter((r) => {
    return (
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.reference && r.reference.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const totalSum = filteredRefunds.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Historial de Reintegros & Devoluciones
            </h2>
            <p className="text-xs text-slate-500">
              Registro de reintegros procesados a pacientes del Dr. Jorge Apelencia
            </p>
          </div>
          <button
            onClick={onOpenNewRefund}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors self-start sm:self-auto"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Registrar Nuevo Reintegro</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por paciente, motivo del reintegro o referencia bancaria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>

        {/* Total stats */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-rose-50/50 px-3 py-2 rounded-lg border border-rose-100">
          <span>
            Mostrando <strong>{filteredRefunds.length}</strong> reintegros efectuados
          </span>
          <span className="text-rose-700 font-bold">
            Total devuelto: -${totalSum.toLocaleString()}
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
              <th className="py-3 px-4">Motivo del Reintegro</th>
              <th className="py-3 px-4">Método</th>
              <th className="py-3 px-4">Referencia</th>
              <th className="py-3 px-4 text-right">Monto Devuelto</th>
              <th className="py-3 px-4 text-center">Aviso WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredRefunds.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No hay reintegros registrados con los criterios especificados.
                </td>
              </tr>
            ) : (
              filteredRefunds.map((r) => {
                const patient = patients.find((pat) => pat.id === r.patientId);

                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {r.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {r.patientName}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 max-w-xs">
                      <div>{r.reason}</div>
                      {(r.medicalExpensesAmount || r.adminFeePercent) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {r.medicalExpensesAmount ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              Exám./Consultas: -${r.medicalExpensesAmount.toLocaleString()}
                            </span>
                          ) : null}
                          {r.adminFeePercent ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
                              Gastos Adm. ({r.adminFeePercent}%): -${r.adminFeeAmount ? r.adminFeeAmount.toLocaleString() : ''}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {r.refundMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {r.reference || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-700">
                      -${r.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (patient) {
                            onOpenWhatsAppRefund(patient, r);
                          }
                        }}
                        disabled={!patient}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-40"
                        title="Enviar comprobante de reintegro por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Avisar</span>
                      </button>
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
