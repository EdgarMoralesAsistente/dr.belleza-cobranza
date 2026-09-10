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

export interface ReceiptPDFParams {
  patient: Patient;
  payment?: Payment;
  refund?: Refund;
  type?: 'payment' | 'refund' | 'statement';
  allPayments?: Payment[];
  allRefunds?: Refund[];
  generatedBy?: string;
}

export function generateReceiptPDF({
  patient,
  payment,
  refund,
  type = payment ? 'payment' : refund ? 'refund' : 'statement',
  allPayments = [],
  allRefunds = [],
  generatedBy = 'Secretaría de Cobranzas',
}: ReceiptPDFParams): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 16;

  // Primary accent colors based on type
  const isPayment = type === 'payment';
  const isRefund = type === 'refund';

  const themePrimary = isPayment
    ? [5, 150, 105] // emerald-600
    : isRefund
    ? [225, 29, 72] // rose-600
    : [30, 41, 59]; // slate-800

  // Header Banner Background
  doc.setFillColor(themePrimary[0], themePrimary[1], themePrimary[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DR. BELLEZA • MEDICINA Y CIRUGÍA PLÁSTICA', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Dr. Jorge Apelencia • Especialista en Cirugía Plástica, Estética y Reparadora', 14, 17);

  const receiptRef = payment
    ? payment.reference || payment.id.toUpperCase()
    : refund
    ? refund.reference || refund.id.toUpperCase()
    : `EDC-${patient.id.toUpperCase()}`;

  const receiptTitle = isPayment
    ? 'RECIBO OFICIAL DE ABONO'
    : isRefund
    ? 'COMPROBANTE OFICIAL DE REINTEGRO'
    : 'ESTADO DE CUENTA DETALLADO';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(receiptTitle, pageWidth - 14, 13, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`N° Ref: ${receiptRef}`, pageWidth - 14, 18, { align: 'right' });
  doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 14, 23, { align: 'right' });

  currentY = 36;

  // ==========================================
  // SECTION 1: DATOS DE LA PACIENTE
  // ==========================================
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('DATOS DE LA PACIENTE', 18, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Col 1
  doc.text('Nombre:', 18, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.fullName, 33, currentY + 12);
  doc.setFont('helvetica', 'normal');

  doc.text('DNI / RUT:', 18, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.idNumber || 'No especificado', 35, currentY + 18);
  doc.setFont('helvetica', 'normal');

  doc.text('Teléfono:', 18, currentY + 24);
  doc.text(patient.phone, 33, currentY + 24);

  // Col 2
  const col2X = 110;
  doc.text('Procedimiento:', col2X, currentY + 12);
  doc.setFont('helvetica', 'bold');
  const truncatedProc = patient.procedure.length > 38 ? patient.procedure.substring(0, 36) + '...' : patient.procedure;
  doc.text(truncatedProc, col2X + 23, currentY + 12);
  doc.setFont('helvetica', 'normal');

  doc.text('Médico Tratante:', col2X, currentY + 18);
  doc.text(patient.doctor || 'Dr. Jorge Apelencia', col2X + 26, currentY + 18);

  doc.text('Ciudad / Origen:', col2X, currentY + 24);
  doc.text(`${patient.city || 'Consultorio Central'} (${patient.campaign || 'Directo'})`, col2X + 24, currentY + 24);

  currentY += 33;

  // ==========================================
  // SECTION 2: DETALLE DEL MOVIMIENTO ACTUAL
  // ==========================================
  if (payment || refund) {
    const txBg = isPayment ? [240, 253, 244] : [254, 242, 242];
    const txBorder = isPayment ? [167, 243, 208] : [254, 202, 202];
    const txText = isPayment ? [6, 95, 70] : [159, 18, 57];

    doc.setFillColor(txBg[0], txBg[1], txBg[2]);
    doc.setDrawColor(txBorder[0], txBorder[1], txBorder[2]);
    doc.roundedRect(14, currentY, pageWidth - 28, 30, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(txText[0], txText[1], txText[2]);
    doc.text(isPayment ? 'DETALLE DEL ABONO RECIBIDO' : 'DETALLE DE LA DEVOLUCIÓN / REINTEGRO', 18, currentY + 6);

    // Left Column
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    if (isPayment && payment) {
      doc.text(`Fecha de Cobro: ${payment.date}`, 18, currentY + 13);
      doc.text(`Método de Pago: ${payment.paymentMethod}`, 18, currentY + 18);
      doc.text(`Nro. Comprobante / Ref: ${payment.reference || 'S/R'}`, 18, currentY + 23);
      if (payment.notes) {
        doc.text(`Observación: ${payment.notes.substring(0, 45)}`, 18, currentY + 27.5);
      }
    } else if (isRefund && refund) {
      doc.text(`Fecha de Reintegro: ${refund.date}`, 18, currentY + 13);
      doc.text(`Método: ${refund.refundMethod}`, 18, currentY + 18);
      doc.text(`Motivo: ${refund.reason.substring(0, 42)}`, 18, currentY + 23);
      if (refund.reference) {
        doc.text(`Nro. Comprobante: ${refund.reference}`, 18, currentY + 27.5);
      }
    }

    // Right Column - Large Amount Highlight
    const amountVal = isPayment && payment ? payment.amount : refund ? refund.amount : 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(isPayment ? 'MONTO ABONADO' : 'MONTO REINTEGRADO', pageWidth - 18, currentY + 10, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(txText[0], txText[1], txText[2]);
    doc.text(`${isPayment ? '+' : '-'}$${amountVal.toLocaleString()} USD`, pageWidth - 18, currentY + 19, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Registrado por: ${payment?.registeredBy || refund?.registeredBy || generatedBy}`, pageWidth - 18, currentY + 25, { align: 'right' });

    currentY += 35;
  }

  // ==========================================
  // SECTION 3: ESTADO DE CUENTA FINANCIERO
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('ESTADO DE CUENTA INTEGRAL A LA FECHA', 14, currentY);
  currentY += 4;

  const cardW = 43;
  const cardH = 16;
  const gap = 3.5;
  const startCardX = 14;

  const summaryCards = [
    { label: 'Costo Total Cirugía', val: `$${patient.totalCost.toLocaleString()} USD`, bg: [248, 250, 252], text: [30, 41, 59] },
    { label: 'Total Abonado', val: `$${patient.totalPaid.toLocaleString()} USD`, bg: [240, 253, 244], text: [5, 150, 105] },
    {
      label: 'Saldo Pendiente',
      val: `$${patient.balance.toLocaleString()} USD`,
      bg: patient.balance > 0 ? [255, 251, 235] : [240, 253, 244],
      text: patient.balance > 0 ? [180, 83, 9] : [5, 150, 105],
    },
    {
      label: 'Estado de Cuenta',
      val: patient.balance === 0 ? 'AL DÍA' : patient.status === 'overdue' ? 'VENCIDO' : 'EN PROCESO',
      bg: patient.balance === 0 ? [240, 253, 244] : patient.status === 'overdue' ? [254, 242, 242] : [255, 251, 235],
      text: patient.balance === 0 ? [5, 150, 105] : patient.status === 'overdue' ? [225, 29, 72] : [180, 83, 9],
    },
  ];

  summaryCards.forEach((c, idx) => {
    const x = startCardX + idx * (cardW + gap);
    doc.setFillColor(c.bg[0], c.bg[1], c.bg[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(c.label, x + 3.5, currentY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(c.text[0], c.text[1], c.text[2]);
    doc.text(c.val, x + 3.5, currentY + 12);
  });

  currentY += cardH + 8;

  // ==========================================
  // SECTION 4: DETALLE DE CUOTAS PENDIENTES & CRONOGRAMA
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('CRONOGRAMA DE CUOTAS PENDIENTES & PRÓXIMOS PAGOS', 14, currentY);
  currentY += 4.5;

  if (patient.balance <= 0) {
    // Verified full payment banner
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(14, currentY, pageWidth - 28, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105);
    doc.text('¡CUENTA TOTALMENTE SALDADA!', 20, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('La paciente no registra cuotas pendientes de pago. Todos los aranceles quirúrgicos han sido cancelados.', 20, currentY + 10.5);

    currentY += 20;
  } else {
    // Table Header for quotas
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, pageWidth - 28, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Cuota / Concepto', 18, currentY + 4.5);
    doc.text('Fecha Límite / Vencimiento', 75, currentY + 4.5);
    doc.text('Estado Cuota', 130, currentY + 4.5);
    doc.text('Monto Cuota ($)', pageWidth - 18, currentY + 4.5, { align: 'right' });

    currentY += 6.5;

    // Resolve list of quotas
    type QuotaRow = { label: string; dueDate: string; amount: number; statusText: string; isPending: boolean };
    const quotaRows: QuotaRow[] = [];

    if (patient.paymentSchedule && patient.paymentSchedule.length > 0) {
      patient.paymentSchedule.forEach((sch) => {
        const isPaid = sch.status === 'paid';
        quotaRows.push({
          label: `Cuota #${sch.installmentNumber}`,
          dueDate: sch.dueDate || 'A coordinar',
          amount: sch.amount,
          statusText: isPaid ? 'Pagada' : 'Pendiente de Pago',
          isPending: !isPaid,
        });
      });
    } else if (patient.financingInstallmentAmount && patient.financingInstallmentAmount > 0) {
      const quotaAmount = patient.financingInstallmentAmount;
      const count = Math.min(12, Math.ceil(patient.balance / quotaAmount));
      let remaining = patient.balance;

      const baseDate = patient.nextPaymentDate ? new Date(patient.nextPaymentDate) : new Date();

      for (let i = 1; i <= count; i++) {
        const thisQuota = Math.min(remaining, quotaAmount);
        const nextDate = new Date(baseDate);
        nextDate.setMonth(nextDate.getMonth() + (i - 1));
        const dateStr = nextDate.toISOString().split('T')[0];

        quotaRows.push({
          label: `Cuota #${i} (Plan ${patient.financingPlanName || 'Financiamiento'})`,
          dueDate: dateStr,
          amount: thisQuota,
          statusText: i === 1 ? 'Próxima a Vencer' : 'Pendiente',
          isPending: true,
        });
        remaining -= thisQuota;
        if (remaining <= 0) break;
      }
    } else {
      // Single pending balance row
      quotaRows.push({
        label: 'Saldo Restante de Quirófano / Tratamiento',
        dueDate: patient.nextPaymentDate || 'A convenir antes de cirugía',
        amount: patient.balance,
        statusText: patient.status === 'overdue' ? 'Vencida' : 'Pendiente de Pago',
        isPending: true,
      });
    }

    // Draw up to 6 rows cleanly
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    quotaRows.slice(0, 7).forEach((q) => {
      doc.setDrawColor(241, 245, 249);
      doc.line(14, currentY + 6, pageWidth - 14, currentY + 6);

      doc.setTextColor(30, 41, 59);
      doc.text(q.label, 18, currentY + 4.5);
      doc.text(q.dueDate, 75, currentY + 4.5);

      if (q.isPending) {
        doc.setTextColor(180, 83, 9);
        doc.text(q.statusText, 130, currentY + 4.5);
      } else {
        doc.setTextColor(5, 150, 105);
        doc.text(q.statusText, 130, currentY + 4.5);
      }

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`$${q.amount.toLocaleString()} USD`, pageWidth - 18, currentY + 4.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      currentY += 6.5;
    });

    if (quotaRows.length > 7) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`... y ${quotaRows.length - 7} cuotas adicionales programadas.`, 18, currentY + 4);
      currentY += 6;
    }

    currentY += 4;
  }

  // ==========================================
  // SECTION 5: HISTORIAL RECIENTE DE ABONOS (SI SE PROVEYÓ)
  // ==========================================
  if (allPayments.length > 0 && currentY < 235) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`HISTORIAL DE ABONOS REGISTRADOS (${allPayments.length})`, 14, currentY);
    currentY += 4;

    doc.setFillColor(248, 250, 252);
    doc.rect(14, currentY, pageWidth - 28, 5.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Fecha', 18, currentY + 4);
    doc.text('Método', 55, currentY + 4);
    doc.text('Referencia', 95, currentY + 4);
    doc.text('Monto Abonado', pageWidth - 18, currentY + 4, { align: 'right' });
    currentY += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    allPayments.slice(0, 4).forEach((p) => {
      doc.setDrawColor(241, 245, 249);
      doc.line(14, currentY + 5, pageWidth - 14, currentY + 5);

      doc.setTextColor(51, 65, 85);
      doc.text(p.date, 18, currentY + 3.8);
      doc.text(p.paymentMethod, 55, currentY + 3.8);
      doc.text(p.reference || '-', 95, currentY + 3.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(`+$${p.amount.toLocaleString()} USD`, pageWidth - 18, currentY + 3.8, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      currentY += 5.2;
    });

    currentY += 4;
  }

  // ==========================================
  // SECTION 6: FIRMAS & SELLOS DE CONFORMIDAD
  // ==========================================
  const signY = Math.max(currentY + 6, 252);

  doc.setDrawColor(203, 213, 225);
  doc.line(25, signY, 85, signY);
  doc.line(pageWidth - 85, signY, pageWidth - 25, signY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DR. JORGE APELENCIA', 55, signY + 4, { align: 'center' });
  doc.text('CONFORMIDAD DE LA PACIENTE', pageWidth - 55, signY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Firma y Sello Autorizado', 55, signY + 7.5, { align: 'center' });
  doc.text(patient.fullName, pageWidth - 55, signY + 7.5, { align: 'center' });

  // Footer Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 283, pageWidth - 14, 283);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Documento emitido electrónicamente por el Sistema Dr. Belleza - Cobranza & Finanzas.', 14, 287.5);
  doc.text(`Emitido por: ${generatedBy} • Copia oficial`, pageWidth - 14, 287.5, { align: 'right' });

  return doc;
}

export function downloadReceiptPDF(params: ReceiptPDFParams): void {
  const doc = generateReceiptPDF(params);
  const patientSafeName = params.patient.fullName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const prefix = params.type === 'refund' ? 'Reintegro' : params.type === 'statement' ? 'EstadoCuenta' : 'Recibo';
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${prefix}_${patientSafeName}_${dateStr}.pdf`;
  doc.save(filename);
}
