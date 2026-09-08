import React, { useState } from 'react';
import { X, FileText, Download, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { Patient, Payment, Refund } from '../types';
import { generateMonthlyPDFReport } from '../services/pdfReport';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  payments: Payment[];
  refunds: Refund[];
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  patients,
  payments,
  refunds,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const monthStr = String(selectedMonth).padStart(2, '0');
  const filterPrefix = `${selectedYear}-${monthStr}`;

  const monthlyPayments = payments.filter((p) => p.date.startsWith(filterPrefix));
  const monthlyRefunds = refunds.filter((r) => r.date.startsWith(filterPrefix));

  const totalCollected = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = monthlyRefunds.reduce((sum, r) => sum + r.amount, 0);
  const netIncome = totalCollected - totalRefunded;

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      const doc = generateMonthlyPDFReport({
        year: selectedYear,
        month: selectedMonth,
        patients,
        payments,
        refunds,
        generatedBy: 'Secretaría de Cobranzas',
      });

      const fileName = `Reporte_Cobranzas_Dr_Belleza_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Hubo un error al generar el archivo PDF. Intente nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Exportar Reporte Mensual PDF
              </h2>
              <p className="text-xs text-slate-300">
                Dr. Jorge Apelencia • Resumen ejecutivo formal para imprimir o archivar
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

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Month & Year Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mes a Reportar
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Año
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          {/* Financial Preview Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Vista Previa Financiera ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500">Abonos Recaudados:</span>
                <p className="text-base font-bold text-emerald-700 mt-0.5">
                  ${totalCollected.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400">
                  {monthlyPayments.length} transacciones
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500">Reintegros Efectuados:</span>
                <p className="text-base font-bold text-rose-700 mt-0.5">
                  -${totalRefunded.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400">
                  {monthlyRefunds.length} reintegros
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-600 font-medium">Ingreso Neto del Período:</span>
                <p className="text-lg font-bold text-blue-900">
                  ${netIncome.toLocaleString()}
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <div>Pacientes con deuda activa:</div>
                <div className="font-bold text-amber-800">
                  {patients.filter((p) => p.balance > 0).length} pacientes
                </div>
              </div>
            </div>
          </div>

          {/* PDF Contents Description */}
          <div className="text-xs text-slate-500 space-y-1 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
            <p className="font-semibold text-slate-700">El PDF incluirá:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Encabezado oficial con membrete del Dr. Jorge Apelencia.</li>
              <li>Tarjetas con el resumen contable global.</li>
              <li>Tabla pormenorizada de todos los abonos del mes.</li>
              <li>Tabla de reintegros y motivos de devolución.</li>
              <li>Listado de pacientes con saldo pendiente y teléfonos de contacto.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generando PDF...' : 'Descargar Reporte PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
