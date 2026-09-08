import React, { useState } from 'react';
import {
  Search,
  MessageCircle,
  DollarSign,
  Undo2,
  Phone,
  Calendar,
  Eye,
  FileText,
  UserCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Patient, Payment, Refund } from '../types';

interface PatientTableProps {
  patients: Patient[];
  payments: Payment[];
  refunds: Refund[];
  onOpenWhatsApp: (patient: Patient) => void;
  onOpenNewPayment: (patientId: string) => void;
  onOpenNewRefund: (patientId: string) => void;
  onSelectPatientDetails: (patient: Patient) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  payments,
  refunds,
  onOpenWhatsApp,
  onOpenNewPayment,
  onOpenNewRefund,
  onSelectPatientDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);

    if (!matchesSearch) return false;

    if (filterStatus === 'pending') return patient.balance > 0;
    if (filterStatus === 'paid') return patient.balance <= 0;
    if (filterStatus === 'overdue') {
      return (
        patient.status === 'overdue' ||
        (patient.balance > 0 && patient.nextPaymentDate && new Date(patient.nextPaymentDate) < new Date())
      );
    }
    return true;
  });

  const totalCostSum = filteredPatients.reduce((sum, p) => sum + p.totalCost, 0);
  const totalPaidSum = filteredPatients.reduce((sum, p) => sum + p.totalPaid, 0);
  const totalBalanceSum = filteredPatients.reduce((sum, p) => sum + p.balance, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Directorio de Pacientes & Cobranza
            </h2>
            <p className="text-xs text-slate-500">
              Gestión de presupuestos, pagos acumulados y saldos pendientes
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({patients.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-[#25D366] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Con Saldo ({patients.filter((p) => p.balance > 0).length})
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterStatus === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Al Día ({patients.filter((p) => p.balance <= 0).length})
            </button>
            <button
              onClick={() => setFilterStatus('overdue')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterStatus === 'overdue'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Vencidas
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, teléfono o procedimiento quirúrgico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Subtotal Summary Bar for the Current Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-600 bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-100">
          <span>
            Mostrando <strong>{filteredPatients.length}</strong> pacientes
          </span>
          <div className="flex items-center space-x-4">
            <span>
              Presupuesto Total: <strong>${totalCostSum.toLocaleString()}</strong>
            </span>
            <span className="text-emerald-700">
              Total Cobrado: <strong>${totalPaidSum.toLocaleString()}</strong>
            </span>
            <span className="text-amber-800 font-bold">
              Saldo Pendiente: ${totalBalanceSum.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Paciente</th>
              <th className="py-3 px-4">Procedimiento</th>
              <th className="py-3 px-4">WhatsApp / Tel</th>
              <th className="py-3 px-4 text-right">Presupuesto</th>
              <th className="py-3 px-4 text-right">Abonado</th>
              <th className="py-3 px-4 text-right">Saldo Deudor</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No se encontraron pacientes con los criterios de búsqueda.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => {
                const isOverdue =
                  patient.status === 'overdue' ||
                  (patient.balance > 0 &&
                    patient.nextPaymentDate &&
                    new Date(patient.nextPaymentDate) < new Date());
                const isPaid = patient.balance <= 0;

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Paciente */}
                    <td className="py-3 px-4">
                      <div>
                        <button
                          onClick={() => onSelectPatientDetails(patient)}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                        >
                          {patient.fullName}
                        </button>
                        <div className="text-xs text-slate-400 flex items-center space-x-1">
                          <span>DNI: {patient.idNumber || 'S/D'}</span>
                          <span>•</span>
                          <span>{patient.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Procedimiento */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">
                        {patient.procedure}
                      </span>
                      <div className="text-[11px] text-slate-400">
                        {patient.doctor || 'Dr. Jorge Apelencia'}
                      </div>
                    </td>

                    {/* Teléfono / WhatsApp */}
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{patient.phone}</span>
                      </div>
                      {patient.nextPaymentDate && (
                        <div className="text-[10px] text-slate-400 flex items-center mt-0.5">
                          <Calendar className="w-2.5 h-2.5 mr-0.5" />
                          Vence: {patient.nextPaymentDate}
                        </div>
                      )}
                    </td>

                    {/* Costo Total */}
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      ${patient.totalCost.toLocaleString()}
                    </td>

                    {/* Total Abonado */}
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      ${patient.totalPaid.toLocaleString()}
                    </td>

                    {/* Saldo Pendiente */}
                    <td className="py-3 px-4 text-right">
                      {isPaid ? (
                        <span className="font-bold text-emerald-600">$0</span>
                      ) : (
                        <span className="font-bold text-amber-900">
                          ${patient.balance.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Estado Badge */}
                    <td className="py-3 px-4 text-center">
                      {isPaid ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Cancelado
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          Vencido
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Pendiente
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* WhatsApp Web Button */}
                        <button
                          onClick={() => onOpenWhatsApp(patient)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                          title="Enviar WhatsApp Web a la paciente"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* Registrar Abono */}
                        <button
                          onClick={() => onOpenNewPayment(patient.id)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors"
                          title="Registrar Abono"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>

                        {/* Registrar Reintegro */}
                        <button
                          onClick={() => onOpenNewRefund(patient.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Registrar Reintegro / Devolución"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>

                        {/* Ver Ficha / Historial */}
                        <button
                          onClick={() => onSelectPatientDetails(patient)}
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Ver Historial Completo"
                        >
                          <Eye className="w-4 h-4" />
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
