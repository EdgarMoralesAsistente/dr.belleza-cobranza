import React from 'react';
import {
  DollarSign,
  AlertTriangle,
  Users,
  Undo2,
  Calendar,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Patient, Payment, Refund } from '../types';

interface DashboardStatsProps {
  patients: Patient[];
  payments: Payment[];
  refunds: Refund[];
  onOpenWhatsApp: (patient: Patient) => void;
  onOpenNewPayment: (patientId?: string) => void;
  onViewPatientsTab: () => void;
  onViewPaymentsTab: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  patients,
  payments,
  refunds,
  onOpenWhatsApp,
  onOpenNewPayment,
  onViewPatientsTab,
  onViewPaymentsTab,
}) => {
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalRefunded = refunds.reduce((acc, r) => acc + r.amount, 0);
  const totalPendingBalance = patients.reduce((acc, p) => acc + p.balance, 0);
  const netCollected = totalCollected - totalRefunded;

  const pendingPatients = patients.filter((p) => p.balance > 0);
  const paidPatients = patients.filter((p) => p.balance <= 0);
  const overduePatients = patients.filter((p) => p.status === 'overdue' || (p.balance > 0 && p.nextPaymentDate && new Date(p.nextPaymentDate) < new Date()));

  // Recent 5 payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recaudado Total */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Cobrado
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              ${totalCollected.toLocaleString()}
            </span>
            <div className="mt-1 flex items-center text-xs text-emerald-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>{payments.length} abonos registrados</span>
            </div>
          </div>
        </div>

        {/* Saldo Pendiente por Cobrar */}
        <div className="bg-white rounded-xl p-5 border border-amber-200/80 shadow-xs bg-gradient-to-b from-white to-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Saldo por Cobrar
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-amber-900">
              ${totalPendingBalance.toLocaleString()}
            </span>
            <div className="mt-1 flex items-center text-xs text-amber-700 font-medium">
              <span>{pendingPatients.length} pacientes con cuotas o saldo</span>
            </div>
          </div>
        </div>

        {/* Total Reintegros */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reintegros
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Undo2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-rose-700">
              ${totalRefunded.toLocaleString()}
            </span>
            <div className="mt-1 text-xs text-slate-500 font-medium">
              Neto clínica: <strong className="text-slate-700">${netCollected.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Pacientes Registradas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pacientes Activas
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {patients.length}
            </span>
            <div className="mt-1 text-xs text-slate-500">
              <span className="text-emerald-700 font-semibold">{paidPatients.length} al día</span> •{' '}
              <span className="text-amber-700 font-semibold">{pendingPatients.length} pendientes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Overdue/Pending Actions & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pacientes que requieren gestión de cobranza */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cobranza Inmediata & Recordatorios WhatsApp
              </h2>
              <p className="text-xs text-slate-500">
                Pacientes con saldos o fechas de pago próximas a vencer para el Dr. Jorge Apelencia
              </p>
            </div>
            <button
              onClick={onViewPatientsTab}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              Ver todas ({pendingPatients.length}) <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          {pendingPatients.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                ¡Excelente! No hay cobros pendientes en este momento.
              </p>
              <p className="text-xs text-slate-500">
                Todas las pacientes registradas se encuentran al día con sus pagos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingPatients.slice(0, 5).map((patient) => {
                const isOverdue =
                  patient.status === 'overdue' ||
                  (patient.nextPaymentDate && new Date(patient.nextPaymentDate) < new Date());

                return (
                  <div
                    key={patient.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors px-2 rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {patient.fullName}
                        </span>
                        {isOverdue ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Vencido
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-100 text-amber-800">
                            Pendiente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {patient.procedure} • {patient.phone}
                      </p>
                      {patient.nextPaymentDate && (
                        <p className="text-[11px] text-slate-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Fecha prevista: {patient.nextPaymentDate}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <div className="text-right mr-2">
                        <div className="text-sm font-bold text-slate-900">
                          ${patient.balance.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          de ${patient.totalCost.toLocaleString()}
                        </div>
                      </div>

                      {/* WhatsApp Button */}
                      <button
                        onClick={() => onOpenWhatsApp(patient)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs transition-colors cursor-pointer"
                        title="Enviar recordatorio por WhatsApp Web"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      {/* Registrar Pago Rápido */}
                      <button
                        onClick={() => onOpenNewPayment(patient.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                        title="Registrar abono para esta paciente"
                      >
                        Abonar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Últimos Pagos Registrados */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Últimos Abonos
            </h2>
            <button
              onClick={onViewPaymentsTab}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              Ver todos <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Aún no hay abonos registrados.
              </p>
            ) : (
              recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">
                      {p.patientName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {p.paymentMethod} • {p.date}
                    </p>
                    {p.reference && (
                      <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        Ref: {p.reference}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-700">
                      +${p.amount.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400">Ingreso</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
