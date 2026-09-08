import { jsPDF } from 'jspdf';
import { Patient, Payment, Refund } from '../types';

export interface MonthlyReportParams {
  year: number;
  month: number; // 1 - 12
  patients: Patient[];
  payments: Payment[];
  refunds: Refund[];
  generatedBy?: string;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function generateMonthlyPDFReport({
  year,
  month,
  patients,
  payments,
  refunds,
  generatedBy = 'Secretaría de Cobranzas',
}: MonthlyReportParams): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const monthStr = String(month).padStart(2, '0');
  const monthName = MONTH_NAMES[month - 1];
  const filterPrefix = `${year}-${monthStr}`;

  // Filter payments and refunds for this specific month
  const monthlyPayments = payments.filter((p) => p.date.startsWith(filterPrefix));
  const monthlyRefunds = refunds.filter((r) => r.date.startsWith(filterPrefix));

  const totalCollected = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = monthlyRefunds.reduce((sum, r) => sum + r.amount, 0);
  const netIncome = totalCollected - totalRefunded;

  // Patients with pending balance
  const patientsWithDebt = patients.filter((p) => p.balance > 0);
  const totalPendingDebt = patientsWithDebt.reduce((sum, p) => sum + p.balance, 0);

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // Header background banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('DR. BELLEZA - GESTIÓN DE COBRANZAS', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Dr. Jorge Apelencia • Cirugía Plástica & Medicina Estética', 14, 18);
  doc.text(`Período: ${monthName} ${year}  |  Emitido: ${new Date().toLocaleDateString('es-ES')}`, 14, 24);

  // Return text to dark slate
  doc.setTextColor(30, 41, 59);
  currentY = 36;

  // KPI Summary Cards
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RESUMEN FINANCIERO DEL PERÍODO', 14, currentY);
  currentY += 5;

  const cardWidth = 43;
  const cardHeight = 18;
  const cardGap = 4;
  const startX = 14;

  const kpis = [
    { label: 'Total Recaudado', val: `$${totalCollected.toLocaleString()}`, bg: [240, 253, 244], stroke: [34, 197, 94] },
    { label: 'Total Reintegros', val: `$${totalRefunded.toLocaleString()}`, bg: [254, 242, 242], stroke: [239, 68, 68] },
    { label: 'Ingreso Neto', val: `$${netIncome.toLocaleString()}`, bg: [239, 246, 255], stroke: [59, 130, 246] },
    { label: 'Saldo Pendiente Global', val: `$${totalPendingDebt.toLocaleString()}`, bg: [255, 251, 235], stroke: [245, 158, 11] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = startX + idx * (cardWidth + cardGap);
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(kpi.stroke[0], kpi.stroke[1], kpi.stroke[2]);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text(kpi.val, x + 3, currentY + 13);
  });

  currentY += cardHeight + 10;

  // Payments Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`DETALLE DE INGRESOS Y ABONOS (${monthlyPayments.length} registros)`, 14, currentY);
  currentY += 5;

  // Table header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text('Fecha', 16, currentY + 4.5);
  doc.text('Paciente', 38, currentY + 4.5);
  doc.text('Método', 95, currentY + 4.5);
  doc.text('Comprobante/Ref', 132, currentY + 4.5);
  doc.text('Monto ($)', pageWidth - 16, currentY + 4.5, { align: 'right' });
  currentY += 7;

  // Table body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (monthlyPayments.length === 0) {
    doc.setTextColor(148, 163, 184);
    doc.text('No se registraron abonos en este período.', 16, currentY + 6);
    currentY += 10;
  } else {
    monthlyPayments.forEach((p) => {
      // Check page break
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(14, currentY + 6, pageWidth - 14, currentY + 6);

      doc.setTextColor(30, 41, 59);
      doc.text(p.date, 16, currentY + 4.5);
      
      const truncatedName = p.patientName.length > 32 ? p.patientName.substring(0, 30) + '...' : p.patientName;
      doc.text(truncatedName, 38, currentY + 4.5);
      doc.text(p.paymentMethod, 95, currentY + 4.5);
      
      const refText = p.reference ? (p.reference.length > 20 ? p.reference.substring(0, 18) + '..' : p.reference) : '-';
      doc.text(refText, 132, currentY + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.text(`$${p.amount.toLocaleString()}`, pageWidth - 16, currentY + 4.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      currentY += 6.5;
    });
  }

  currentY += 6;

  // Refunds Section
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`DETALLE DE REINTEGROS / DEVOLUCIONES (${monthlyRefunds.length} registros)`, 14, currentY);
  currentY += 5;

  doc.setFillColor(254, 242, 242);
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);

  doc.text('Fecha', 16, currentY + 4.5);
  doc.text('Paciente', 38, currentY + 4.5);
  doc.text('Motivo', 95, currentY + 4.5);
  doc.text('Monto Devuelto ($)', pageWidth - 16, currentY + 4.5, { align: 'right' });
  currentY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (monthlyRefunds.length === 0) {
    doc.setTextColor(148, 163, 184);
    doc.text('Sin reintegros registrados en este período.', 16, currentY + 6);
    currentY += 10;
  } else {
    monthlyRefunds.forEach((r) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setDrawColor(254, 226, 226);
      doc.line(14, currentY + 6, pageWidth - 14, currentY + 6);

      doc.setTextColor(30, 41, 59);
      doc.text(r.date, 16, currentY + 4.5);
      doc.text(r.patientName, 38, currentY + 4.5);
      const truncatedReason = r.reason.length > 40 ? r.reason.substring(0, 38) + '...' : r.reason;
      doc.text(truncatedReason, 95, currentY + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(185, 28, 28);
      doc.text(`-$${r.amount.toLocaleString()}`, pageWidth - 16, currentY + 4.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      currentY += 6.5;
    });
  }

  currentY += 6;

  // Pending Balances Summary
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`PACIENTES CON SALDO PENDIENTE (${patientsWithDebt.length} pacientes activas)`, 14, currentY);
  currentY += 5;

  doc.setFillColor(255, 251, 235);
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);

  doc.text('Paciente', 16, currentY + 4.5);
  doc.text('WhatsApp / Teléfono', 68, currentY + 4.5);
  doc.text('Procedimiento', 105, currentY + 4.5);
  doc.text('Saldo Deudor ($)', pageWidth - 16, currentY + 4.5, { align: 'right' });
  currentY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  patientsWithDebt.slice(0, 10).forEach((p) => {
    if (currentY > 265) {
      doc.addPage();
      currentY = 20;
    }

    doc.setDrawColor(254, 243, 199);
    doc.line(14, currentY + 6, pageWidth - 14, currentY + 6);

    doc.setTextColor(30, 41, 59);
    doc.text(p.fullName, 16, currentY + 4.5);
    doc.text(p.phone, 68, currentY + 4.5);
    
    const truncatedProc = p.procedure.length > 25 ? p.procedure.substring(0, 23) + '..' : p.procedure;
    doc.text(truncatedProc, 105, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(194, 65, 12);
    doc.text(`$${p.balance.toLocaleString()}`, pageWidth - 16, currentY + 4.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    currentY += 6.5;
  });

  // Footer on all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.line(14, 284, pageWidth - 14, 284);
    doc.text(`Dr. Belleza - Cobranza | Dr. Jorge Apelencia | Generado por: ${generatedBy}`, 14, 289);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, 289, { align: 'right' });
  }

  return doc;
}
