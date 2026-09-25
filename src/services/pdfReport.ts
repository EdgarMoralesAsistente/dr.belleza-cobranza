import { jsPDF } from 'jspdf';
import { Patient, Payment, Refund } from '../types';
import { getPatientProcedureBreakdown, INITIAL_FINANCING_PLANS, getPatientFinancialSummary } from './storage';

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
  const pageHeight = doc.internal.pageSize.getHeight();
  const isStatement = type === 'statement';
  const isPayment = type === 'payment';
  const isRefund = type === 'refund';

  const themePrimary = isPayment
    ? [5, 150, 105] // emerald-600
    : isRefund
    ? [225, 29, 72] // rose-600
    : [30, 41, 59]; // slate-800

  const receiptRef = payment
    ? payment.reference || payment.id.toUpperCase()
    : refund
    ? refund.reference || refund.id.toUpperCase()
    : `EDC-${patient.id.toUpperCase()}`;

  const receiptTitle = isPayment
    ? 'RECIBO OFICIAL DE ABONO'
    : isRefund
    ? 'COMPROBANTE OFICIAL DE REINTEGRO'
    : 'ESTADO DE CUENTA INTEGRAL & PLAN FINANCIERO';

  // Helper para dibujar el encabezado en cualquier página sin superposición de textos
  const drawPageHeader = (pageNum: number, totalExpectedPages: number) => {
    doc.setFillColor(themePrimary[0], themePrimary[1], themePrimary[2]);
    doc.rect(0, 0, pageWidth, 31, 'F');

    // Branding / Clínica (Columna Izquierda: x=14 a x=105)
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DR. BELLEZA • CIRUGÍA PLÁSTICA', 14, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(241, 245, 249);
    doc.text('Dr. Jorge Apelencia • Especialista en Cirugía Plástica y Reparadora', 14, 15.5);

    // Subtítulo de página
    doc.setFontSize(7);
    doc.setTextColor(203, 213, 225);
    const subtitlePage = pageNum === 1
      ? 'Página 1: Base Quirúrgica, Plan de Financiamiento & Balance'
      : 'Página 2: Historial de Abonos, Pagos Pendientes & Conformidad';
    doc.text(subtitlePage, 14, 21);

    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Atención y Administración: Consultorio Central • WhatsApp Cobranzas Oficial', 14, 26);

    // Columna Derecha: alineada a la derecha en pageWidth - 14 (x = 196)
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);

    if (isPayment) {
      doc.text('RECIBO OFICIAL DE ABONO', pageWidth - 14, 10, { align: 'right' });
    } else if (isRefund) {
      doc.text('COMPROBANTE DE REINTEGRO', pageWidth - 14, 10, { align: 'right' });
    } else {
      doc.text('ESTADO DE CUENTA INTEGRAL', pageWidth - 14, 9.5, { align: 'right' });
      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225);
      doc.text('PLAN DE FINANCIAMIENTO', pageWidth - 14, 14, { align: 'right' });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`N° Ref: ${receiptRef}`, pageWidth - 14, 19.5, { align: 'right' });

    doc.setFontSize(7);
    doc.setTextColor(203, 213, 225);
    doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 14, 24.5, { align: 'right' });
  };

  // Helper para dibujar las firmas de conformidad y pie de página
  const drawSignaturesAndFooter = (targetY: number) => {
    const signY = Math.min(Math.max(targetY, 246), 254);

    doc.setDrawColor(203, 213, 225);
    doc.line(25, signY, 85, signY);
    doc.line(pageWidth - 85, signY, pageWidth - 25, signY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('DR. JORGE APELENCIA', 55, signY + 4, { align: 'center' });
    doc.text('CONFORMIDAD DE LA PACIENTE', pageWidth - 55, signY + 4, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Médico Tratante / Firma y Sello', 55, signY + 7.5, { align: 'center' });
    doc.text(`${patient.fullName} (Aceptación de Términos)`, pageWidth - 55, signY + 7.5, { align: 'center' });

    // Pie de página legal y de auditoría
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 282, pageWidth - 14, 282);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Documento financiero y contractual expedido por Dr. Belleza - Módulo de Gestión de Pacientes y Cobranzas.', 14, 286.5);
    doc.text(`Emitido por: ${generatedBy} • Copia fiel digital auditada`, pageWidth - 14, 286.5, { align: 'right' });
  };

  // ==========================================
  // RESOLUCIÓN EXHAUSTIVA DEL CRONOGRAMA DE CUOTAS
  // ==========================================
  type QuotaRow = {
    number: number;
    label: string;
    dueDate: string;
    amount: number;
    statusText: string;
    isPaid: boolean;
    isOverdue: boolean;
    notes?: string;
  };

  const allScheduleRows: QuotaRow[] = [];

  // 1. Determinar periodicidad del plan
  const frequency: 'Mensual' | 'Quincenal' | 'Semanal' =
    patient.financingFrequency ||
    (patient.financingPlanName?.toLowerCase().includes('quincenal')
      ? 'Quincenal'
      : patient.financingPlanName?.toLowerCase().includes('semanal')
      ? 'Semanal'
      : 'Mensual');

  // 2. Determinar total de cuotas pactadas en el plan acordado
  let plannedCount = patient.financingInstallmentsCount || 0;
  if (!plannedCount && patient.financingMonths) {
    plannedCount = frequency === 'Quincenal' ? patient.financingMonths * 2 : frequency === 'Semanal' ? patient.financingMonths * 4 : patient.financingMonths;
  }
  if (!plannedCount && patient.financingPlanName) {
    const match = patient.financingPlanName.match(/(\d+)\s*(?:mes|meses|cuota|cuotas)/i);
    if (match) {
      const parsed = parseInt(match[1], 10);
      plannedCount = frequency === 'Quincenal' ? parsed * 2 : frequency === 'Semanal' ? parsed * 4 : parsed;
    }
  }
  if (!plannedCount && patient.financingPlanId) {
    const planMatch = INITIAL_FINANCING_PLANS.find((p) => p.id === patient.financingPlanId);
    if (planMatch) {
      plannedCount = planMatch.installmentsCount;
    }
  }
  if (!plannedCount && patient.financingInstallmentAmount && patient.financingInstallmentAmount > 0 && patient.balance > 0) {
    plannedCount = Math.max(1, Math.round(patient.balance / patient.financingInstallmentAmount));
  }
  if (!plannedCount) {
    // Si la paciente tiene saldo pendiente, aplicar estándar de 6 cuotas mensuales o proporcional
    plannedCount = patient.balance > 1500 ? 6 : patient.balance > 500 ? 3 : 1;
  }

  // 3. Resolver cronograma de cuotas
  if (patient.paymentSchedule && patient.paymentSchedule.length > 0) {
    // Caso A: La paciente ya tiene un cronograma guardado con múltiples cuotas
    patient.paymentSchedule.forEach((sch) => {
      const isPaid = sch.status === 'paid';
      let isOverdue = false;
      if (!isPaid && sch.dueDate) {
        const todayStr = new Date().toISOString().split('T')[0];
        if (sch.dueDate < todayStr) {
          isOverdue = true;
        }
      }
      const isReduced = sch.notes?.includes('reducida') || sch.notes?.includes('amortización');
      allScheduleRows.push({
        number: sch.installmentNumber,
        label: isReduced
          ? `Cuota #${sch.installmentNumber} de ${patient.paymentSchedule!.length} (Amortizada)`
          : `Cuota #${sch.installmentNumber} de ${patient.paymentSchedule!.length}`,
        dueDate: sch.dueDate || 'A coordinar',
        amount: sch.amount,
        statusText: isPaid ? 'PAGADA' : isOverdue ? 'VENCIDA' : 'PENDIENTE',
        isPaid,
        isOverdue,
        notes: sch.notes,
      });
    });
  } else if (patient.balance > 0) {
    // Caso B: Proyectar y desglosar todos los pagos planificados pendientes por recibir según el plan acordado
    const paidCount = allPayments.length;
    let pendingCount = plannedCount;

    if (plannedCount > paidCount && paidCount > 0) {
      pendingCount = Math.max(1, plannedCount - paidCount);
    } else if (patient.financingInstallmentAmount && patient.financingInstallmentAmount > 0) {
      pendingCount = Math.max(1, Math.round(patient.balance / patient.financingInstallmentAmount));
    }

    const baseAmount = Math.floor(patient.balance / pendingCount);
    const remainder = patient.balance - baseAmount * pendingCount;

    const baseDate = patient.nextPaymentDate ? new Date(patient.nextPaymentDate) : new Date();
    const todayStr = new Date().toISOString().split('T')[0];
    const startingNum = (plannedCount > pendingCount) ? (plannedCount - pendingCount + 1) : 1;

    for (let i = 0; i < pendingCount; i++) {
      const quotaNum = startingNum + i;
      const nextDate = new Date(baseDate);

      if (frequency === 'Semanal') {
        nextDate.setDate(nextDate.getDate() + i * 7);
      } else if (frequency === 'Quincenal') {
        nextDate.setDate(nextDate.getDate() + i * 15);
      } else {
        nextDate.setMonth(nextDate.getMonth() + i);
      }

      const dateStr = nextDate.toISOString().split('T')[0];
      const isOverdue = dateStr < todayStr;
      const thisAmount = i === pendingCount - 1 ? (baseAmount + remainder) : baseAmount;

      allScheduleRows.push({
        number: quotaNum,
        label: `Cuota #${quotaNum} de ${plannedCount}`,
        dueDate: dateStr,
        amount: thisAmount,
        statusText: isOverdue ? 'VENCIDA' : 'PENDIENTE',
        isPaid: false,
        isOverdue,
      });
    }
  }

  const pendingQuotas = allScheduleRows.filter((q) => !q.isPaid);
  const paidQuotas = allScheduleRows.filter((q) => q.isPaid);

  // =========================================================================
  // PÁGINA 1: DATOS, CIRUGÍAS, PLAN FINANCIERO ELEGIDO Y RESUMEN CONTABLE
  // =========================================================================
  drawPageHeader(1, 2);
  let currentY = 34;

  // 1. FICHA DE DATOS DE LA PACIENTE
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DATOS DE LA PACIENTE & EXPEDIENTE CLÍNICO', 18, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // Col 1
  doc.text('Nombre:', 18, currentY + 11.5);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.fullName, 32, currentY + 11.5);
  doc.setFont('helvetica', 'normal');

  doc.text('DNI / RUT:', 18, currentY + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.idNumber || 'No especificado', 34, currentY + 17);
  doc.setFont('helvetica', 'normal');

  doc.text('WhatsApp / Tel:', 18, currentY + 22.5);
  doc.text(patient.phone, 40, currentY + 22.5);

  // Col 2
  const col2X = 108;
  doc.text('Procedimiento:', col2X, currentY + 11.5);
  doc.setFont('helvetica', 'bold');
  const truncatedProc = patient.procedure.length > 40 ? patient.procedure.substring(0, 38) + '...' : patient.procedure;
  doc.text(truncatedProc, col2X + 22, currentY + 11.5);
  doc.setFont('helvetica', 'normal');

  doc.text('Médico Tratante:', col2X, currentY + 17);
  doc.text(patient.doctor || 'Dr. Jorge Apelencia', col2X + 25, currentY + 17);

  doc.text('Ciudad / Origen:', col2X, currentY + 22.5);
  doc.text(`${patient.city || 'Consultorio Central'} (${patient.campaign || 'Directo'})`, col2X + 24, currentY + 22.5);

  currentY += 32;

  // Si es un recibo puntual de pago o reintegro, renderizamos el bloque de la transacción
  if (payment || refund) {
    const txBg = isPayment ? [240, 253, 244] : [254, 242, 242];
    const txBorder = isPayment ? [167, 243, 208] : [254, 202, 202];
    const txText = isPayment ? [6, 95, 70] : [159, 18, 57];

    doc.setFillColor(txBg[0], txBg[1], txBg[2]);
    doc.setDrawColor(txBorder[0], txBorder[1], txBorder[2]);
    doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(txText[0], txText[1], txText[2]);
    doc.text(isPayment ? 'DETALLE DEL ABONO RECIBIDO' : 'DETALLE DE LA DEVOLUCIÓN / REINTEGRO', 18, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    if (isPayment && payment) {
      doc.text(`Fecha de Cobro: ${payment.date}`, 18, currentY + 12);
      doc.text(`Método de Pago: ${payment.paymentMethod}`, 18, currentY + 17);
      doc.text(`Nro. Comprobante / Ref: ${payment.reference || 'S/R'}`, 18, currentY + 22);
      if (payment.notes) {
        doc.text(`Observación: ${payment.notes.substring(0, 48)}`, 18, currentY + 26);
      }
    } else if (isRefund && refund) {
      doc.text(`Fecha de Reintegro: ${refund.date}`, 18, currentY + 12);
      doc.text(`Método: ${refund.refundMethod}`, 18, currentY + 17);
      doc.text(`Motivo: ${refund.reason.substring(0, 42)}`, 18, currentY + 22);
      if (refund.reference) {
        doc.text(`Nro. Comprobante: ${refund.reference}`, 18, currentY + 26);
      }
    }

    const amountVal = isPayment && payment ? payment.amount : refund ? refund.amount : 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(isPayment ? 'MONTO ABONADO' : 'MONTO REINTEGRADO', pageWidth - 18, currentY + 9, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(txText[0], txText[1], txText[2]);
    doc.text(`${isPayment ? '+' : '-'}$${amountVal.toLocaleString()} USD`, pageWidth - 18, currentY + 17, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Operador: ${payment?.registeredBy || refund?.registeredBy || generatedBy}`, pageWidth - 18, currentY + 23, { align: 'right' });

    currentY += 32;
  }

  // 2. DETALLE DE CIRUGÍAS & PROCEDIMIENTOS CONTRATADOS
  const breakdown = getPatientProcedureBreakdown(patient);
  const financialSummary = getPatientFinancialSummary(patient, allPayments);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('CIRUGÍAS & PROCEDIMIENTOS CONTRATADOS', 14, currentY);
  currentY += 4;

  // Encabezado de tabla
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageWidth - 28, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Procedimiento Quirúrgico / Tratamiento', 18, currentY + 3.8);
  doc.text('Categoría', 95, currentY + 3.8);
  doc.text('Condición de Descuento', 125, currentY + 3.8);
  doc.text('Importe Base ($)', pageWidth - 18, currentY + 3.8, { align: 'right' });
  currentY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  breakdown.items.forEach((item) => {
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY + 5.2, pageWidth - 14, currentY + 5.2);

    doc.setTextColor(30, 41, 59);
    doc.text(item.name.substring(0, 42), 18, currentY + 3.8);

    doc.setTextColor(71, 85, 105);
    doc.text(item.category || 'Quirúrgico', 95, currentY + 3.8);

    const isExempt = item.isExtra || item.category === 'Extra';
    if (isExempt) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('[Exento de desc.]', 125, currentY + 3.8);
      doc.setFont('helvetica', 'normal');
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text('Sujeto a beneficio', 125, currentY + 3.8);
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`$${item.basePrice.toLocaleString('es-AR')} USD`, pageWidth - 18, currentY + 3.8, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    currentY += 5.2;
  });

  currentY += 1.5;

  // Recuadro de Totalización Discriminada
  const hasExempt = breakdown.exemptSubtotal > 0;
  const totalBoxHeight = hasExempt ? 15 : 11;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, totalBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DISCRIMINACIÓN ECONÓMICA DE LA BASE:', 18, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `• Base Sujeta a Descuento: $${breakdown.discountableSubtotal.toLocaleString('es-AR')} USD`,
    18,
    currentY + 8.5
  );

  if (hasExempt) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(
      `• Base Exenta (Categoría Extra): $${breakdown.exemptSubtotal.toLocaleString('es-AR')} USD [Exento de desc.]`,
      95,
      currentY + 8.5
    );
  }

  if (financialSummary.totalDiscount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    const discDetail = financialSummary.discountPercent
      ? `${financialSummary.discountPercent}% comercial${financialSummary.couponDiscount ? ` + bono $${financialSummary.couponDiscount}` : ''}`
      : 'comercial acordado';
    doc.text(
      `• Descuento Total Otorgado: -$${financialSummary.totalDiscount.toLocaleString('es-AR')} USD (${discDetail})`,
      18,
      currentY + 12.5
    );
  }

  currentY += totalBoxHeight + 5;

  // 3. SECCIÓN DESTACADA: EL "PLAN DE FINANCIAMIENTO" ELEGIDO POR LA PACIENTE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('PLAN DE FINANCIAMIENTO ELEGIDO POR LA PACIENTE', 14, currentY);
  currentY += 4;

  const planBoxHeight = 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, pageWidth - 28, planBoxHeight, 2, 2, 'FD');

  // Cabecera interna del plan
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, pageWidth - 28, 9, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const planTitleText = patient.financingPlanName
    ? `PLAN ACTIVO: ${patient.financingPlanName.toUpperCase()}`
    : 'MODALIDAD: FINANCIAMIENTO PERSONALIZADO DE CONSULTORIO';
  doc.text(planTitleText, 18, currentY + 6);

  // Badge derecho de modalidad
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text(`Frecuencia: ${patient.financingFrequency || 'Mensual'}`, pageWidth - 18, currentY + 6, { align: 'right' });

  // Grid de especificaciones del plan (4 columnas en 2 filas)
  doc.setFontSize(7.5);
  const specY1 = currentY + 15;
  const specY2 = currentY + 23;

  // Columna A: Cuotas pactadas
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Plazo & Cuotas:', 18, specY1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  const cuotasPactadas = patient.financingInstallmentsCount || allScheduleRows.length || 1;
  doc.text(`${cuotasPactadas} cuotas (${patient.financingMonths || 'Directo'} meses)`, 18, specY1 + 4.5);

  // Columna B: Valor de la Cuota Acordada
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Valor Cuota Acordada:', 70, specY1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  const cuotaPactadaAmt = patient.financingInstallmentAmount || (pendingQuotas[0]?.amount || 0);
  const hasAmortizedCuotas = allScheduleRows.some((q) => q.notes?.includes('reducida') || q.notes?.includes('amortización'));
  doc.text(
    hasAmortizedCuotas
      ? `$${cuotaPactadaAmt.toLocaleString('es-AR')} USD / cuota (Reamortizada)`
      : `$${cuotaPactadaAmt.toLocaleString('es-AR')} USD / cuota`,
    70,
    specY1 + 4.5
  );

  // Columna C: Cuotas Abonadas vs Pendientes
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Progreso de Cuotas:', 130, specY1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${paidQuotas.length} abonadas • ${pendingQuotas.length} pendientes`, 130, specY1 + 4.5);

  // Fila inferior de especificaciones: Diferimiento & Próximo Vencimiento
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Condición de 1ª Cuota / Diferimiento:', 18, specY2);
  doc.setFont('helvetica', 'bold');
  if (patient.financingDeferralDays && patient.financingDeferralDays > 0) {
    doc.setTextColor(180, 83, 9);
    doc.text(`Aplazamiento concedido de ${patient.financingDeferralDays} días (Período de gracia)`, 18, specY2 + 4.5);
  } else {
    doc.setTextColor(71, 85, 105);
    doc.text('Sin diferimiento (Inicio regular según periodicidad acordada)', 18, specY2 + 4.5);
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Próximo Vencimiento Oficial:', 130, specY2);
  doc.setFont('helvetica', 'bold');
  const proxVenc = pendingQuotas[0]?.dueDate || patient.nextPaymentDate || (patient.balance <= 0 ? 'Sin saldo pendiente' : 'A convenir');
  doc.setTextColor(patient.balance <= 0 ? 5 : 180, patient.balance <= 0 ? 150 : 83, patient.balance <= 0 ? 105 : 9);
  doc.text(proxVenc, 130, specY2 + 4.5);

  currentY += planBoxHeight + 6;

  // 4. RESUMEN CONTABLE: ESTADO DE CUENTA INTEGRAL A LA FECHA (4 CARDS OFICIALES)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('BALANCE ECONÓMICO A LA FECHA', 14, currentY);
  currentY += 4;

  const cardW = 42.6;
  const cardH = 19;
  const gap = 3.8;
  const startCardX = 14;

  const summaryCards = [
    {
      label: 'Total Plan Financiamiento',
      sub: 'Sin descuentos ni bonos',
      val: `$${financialSummary.totalPlanOriginal.toLocaleString('es-AR')} USD`,
      bg: [248, 250, 252],
      border: [203, 213, 225],
      text: [30, 41, 59],
    },
    {
      label: 'Total Inicial',
      sub: 'Total pagado como inicial',
      val: `$${financialSummary.totalInicial.toLocaleString('es-AR')} USD`,
      bg: [240, 253, 244],
      border: [167, 243, 208],
      text: [5, 150, 105],
    },
    {
      label: 'Total de Descuentos',
      sub:
        financialSummary.totalDiscount > 0
          ? (financialSummary.discountPercent || financialSummary.couponDiscount
              ? `${financialSummary.discountPercent ? `${financialSummary.discountPercent}% dto` : ''}${financialSummary.discountPercent && financialSummary.couponDiscount ? ' + ' : ''}${financialSummary.couponDiscount ? `bono $${financialSummary.couponDiscount}` : ''}`
              : 'Descuentos y bonos aplicados')
          : 'Sin descuentos aplicados',
      val: `$${financialSummary.totalDiscount.toLocaleString('es-AR')} USD`,
      bg: [239, 246, 255],
      border: [191, 219, 254],
      text: [37, 99, 235],
    },
    {
      label: 'Saldo Pendiente',
      sub:
        financialSummary.saldoPendiente > 0
          ? 'Total Plan - inicial + desc.'
          : 'Cuenta al día / Saldada',
      val: `$${financialSummary.saldoPendiente.toLocaleString('es-AR')} USD`,
      bg:
        financialSummary.saldoPendiente > 0
          ? [255, 251, 235]
          : [240, 253, 244],
      border:
        financialSummary.saldoPendiente > 0
          ? [254, 215, 170]
          : [167, 243, 208],
      text:
        financialSummary.saldoPendiente > 0
          ? [180, 83, 9]
          : [5, 150, 105],
    },
  ];

  summaryCards.forEach((c, idx) => {
    const x = startCardX + idx * (cardW + gap);
    doc.setFillColor(c.bg[0], c.bg[1], c.bg[2]);
    doc.setDrawColor(c.border[0], c.border[1], c.border[2]);
    doc.roundedRect(x, currentY, cardW, cardH, 2, 2, 'FD');

    // Título / Categoría
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    doc.text(c.label, x + 3, currentY + 4.8);

    // Subtítulo / Condición
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(c.sub, x + 3, currentY + 8.8);

    // Importe destacado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(c.text[0], c.text[1], c.text[2]);
    doc.text(c.val, x + 3, currentY + 15.5);
  });

  currentY += cardH + 7;

  // Mini aviso de navegación a la página 2
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('DETALLE EXTENDIDO DE PLANIFICACIÓN DE PAGOS:', 18, currentY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `En la siguiente página (Página 2) se desglosa el Cronograma Completo con todas las cuotas pendientes (${pendingQuotas.length}), fechas de vencimiento, historial de abonos y condiciones para el ingreso a quirófano.`,
    18,
    currentY + 10
  );

  // Pie de página 1
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 282, pageWidth - 14, 282);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Dr. Belleza • Especialistas en Cirugía Plástica y Estética • www.drbelleza.com', 14, 286.5);
  doc.text('Página 1 de 2  (Continúa en Página 2)', pageWidth - 14, 286.5, { align: 'right' });

  // =========================================================================
  // PÁGINA 2: HISTORIAL DE ABONOS, PAGOS PENDIENTES & CONFORMIDAD
  // =========================================================================
  doc.addPage();
  drawPageHeader(2, 2);
  currentY = 36;

  // 1. SECCIÓN: HISTORIAL DE ABONOS RECIBIDOS (Primero según solicitud)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`HISTORIAL DE ABONOS RECIBIDOS (${allPayments.length})`, 14, currentY);
  currentY += 4.5;

  if (allPayments.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, currentY, pageWidth - 28, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Sin abonos previos registrados a la fecha. El primer pago se efectuará conforme al cronograma de cuotas acordado.',
      18,
      currentY + 7.5
    );
    currentY += 16;
  } else {
    // Encabezado tabla de abonos recibidos
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, pageWidth - 28, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Fecha', 18, currentY + 4.2);
    doc.text('Método de Cobro', 52, currentY + 4.2);
    doc.text('Referencia / N° Comprobante', 92, currentY + 4.2);
    doc.text('Monto Abonado ($)', pageWidth - 18, currentY + 4.2, { align: 'right' });
    currentY += 6;

    const paymentsToShow = allPayments.slice(0, 6);
    paymentsToShow.forEach((p, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, currentY, pageWidth - 28, 5.2, 'F');
      }
      doc.setDrawColor(241, 245, 249);
      doc.line(14, currentY + 5.2, pageWidth - 14, currentY + 5.2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(p.date, 18, currentY + 3.8);
      doc.text(p.paymentMethod, 52, currentY + 3.8);
      doc.text((p.reference || '-').substring(0, 36), 92, currentY + 3.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(`+$${p.amount.toLocaleString('es-AR')} USD`, pageWidth - 18, currentY + 3.8, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      currentY += 5.2;
    });

    if (allPayments.length > 6) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`... y ${allPayments.length - 6} abonos anteriores registrados en el expediente clínico.`, 18, currentY + 3.5);
      currentY += 5;
    }

    // Subtotal strip
    doc.setFillColor(240, 253, 244);
    doc.rect(14, currentY, pageWidth - 28, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(5, 150, 105);
    doc.text(
      `Total Acumulado en Abonos Recibidos: $${patient.totalPaid.toLocaleString('es-AR')} USD (${allPayments.length} abonos registrados)`,
      18,
      currentY + 3.5
    );
    currentY += 8;
  }

  // 2. SECCIÓN: PLANIFICACIÓN DE LOS SIGUIENTES PAGOS PENDIENTES
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`PLANIFICACIÓN DE LOS SIGUIENTES PAGOS PENDIENTES (${pendingQuotas.length} CUOTAS)`, 14, currentY);
  currentY += 4.5;

  if (patient.balance <= 0) {
    // Banner de Saldo Totalmente Cancelado
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(14, currentY, pageWidth - 28, 15, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105);
    doc.text('¡CUENTA TOTALMENTE SALDADA Y EN REGLA!', 18, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('La paciente no registra cuotas pendientes de pago. Todos los aranceles quirúrgicos han sido cancelados en su totalidad.', 18, currentY + 10.5);

    currentY += 19;
  } else {
    // Encabezado de la Tabla de Cuotas Pendientes
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, pageWidth - 28, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('N°', 17, currentY + 4.2);
    doc.text('Cuota / Concepto Planificado', 25, currentY + 4.2);
    doc.text('Fecha Límite / Vencimiento', 88, currentY + 4.2);
    doc.text('Estado Cuota', 136, currentY + 4.2);
    doc.text('Monto Planificado ($)', pageWidth - 18, currentY + 4.2, { align: 'right' });

    currentY += 6;

    // Renderizar todas las cuotas pendientes por recibir
    const maxQuotasToShow = Math.min(12, pendingQuotas.length);
    const displayedPending = pendingQuotas.slice(0, maxQuotasToShow);

    displayedPending.forEach((q, idx) => {
      if (q.isOverdue) {
        doc.setFillColor(254, 242, 242);
        doc.rect(14, currentY, pageWidth - 28, 5.2, 'F');
      } else if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, currentY, pageWidth - 28, 5.2, 'F');
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(14, currentY + 5.2, pageWidth - 14, currentY + 5.2);

      // N°
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(String(q.number), 17, currentY + 3.8);

      // Concepto
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(q.label, 25, currentY + 3.8);
      doc.setFont('helvetica', 'normal');

      // Vencimiento
      doc.setTextColor(71, 85, 105);
      doc.text(q.dueDate, 88, currentY + 3.8);

      // Estado
      if (q.isOverdue) {
        doc.setTextColor(225, 29, 72);
        doc.setFont('helvetica', 'bold');
        doc.text('VENCIDA', 136, currentY + 3.8);
      } else {
        doc.setTextColor(180, 83, 9);
        doc.setFont('helvetica', 'bold');
        doc.text('PENDIENTE', 136, currentY + 3.8);
      }
      doc.setFont('helvetica', 'normal');

      // Monto
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`$${q.amount.toLocaleString('es-AR')} USD`, pageWidth - 18, currentY + 3.8, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      currentY += 5.2;
    });

    if (pendingQuotas.length > maxQuotasToShow) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`... y ${pendingQuotas.length - maxQuotasToShow} cuotas pendientes adicionales proyectadas bajo los mismos términos.`, 18, currentY + 3.5);
      currentY += 5;
    }

    // Subtotal strip de saldo pendiente
    doc.setFillColor(255, 251, 235);
    doc.rect(14, currentY, pageWidth - 28, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(180, 83, 9);
    const hasAmortizedPending = pendingQuotas.some((q) => q.notes?.includes('reducida') || q.notes?.includes('amortización'));
    doc.text(
      hasAmortizedPending
        ? `Saldo Total Pendiente por Cobrar: $${financialSummary.saldoPendiente.toLocaleString('es-AR')} USD • ${pendingQuotas.length} cuotas planificadas (amortizadas automáticamente por abonos recibidos)`
        : `Saldo Total Pendiente por Cobrar: $${financialSummary.saldoPendiente.toLocaleString('es-AR')} USD • ${pendingQuotas.length} cuotas planificadas`,
      18,
      currentY + 3.5
    );
    currentY += 8;
  }

  // 3. CLÁUSULAS & CONDICIONES CLARAS DE FINANCIAMIENTO (Con splitTextToSize para que nunca salgan del margen)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('TÉRMINOS Y CONDICIONES DEL FINANCIAMIENTO ACORDADO', 14, currentY);
  currentY += 3.5;

  const termsMaxWidth = pageWidth - 28 - 8; // 174mm de ancho seguro dentro del recuadro
  const termsText = [
    '1. Respaldo Quirúrgico: Las cuotas pactadas en este cronograma congelan el presupuesto en USD de las cirugías detalladas en la Página 1.',
    '2. Flexibilidad y Recálculo: Ante pagos anticipados o de monto mayor al planificado, el sistema reamortiza y reduce automáticamente las cuotas futuras pendientes.',
    '3. Condición de Ingreso a Quirófano: Salvo acuerdo especial por escrito, el saldo total presupuestado debe encontrarse debidamente cancelado o al día al momento del procedimiento.',
    '4. Medios de Pago Habilitados: Transferencias bancarias oficiales, depósitos y cobro presencial en administración con emisión inmediata de recibo numerado.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);

  const wrappedTerms = termsText.map((t) => doc.splitTextToSize(t, termsMaxWidth));
  const totalWrappedLines = wrappedTerms.reduce((sum, lines) => sum + lines.length, 0);
  const termsBoxHeight = totalWrappedLines * 3.7 + termsText.length * 1.5 + 4;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, termsBoxHeight, 1.5, 1.5, 'FD');

  let lineY = currentY + 4.5;
  wrappedTerms.forEach((lines) => {
    lines.forEach((l: string) => {
      doc.text(l, 18, lineY);
      lineY += 3.7;
    });
    lineY += 1.5;
  });

  currentY += termsBoxHeight + 5;

  // 4. FIRMAS & SELLOS DE CONFORMIDAD EN PÁGINA 2
  drawSignaturesAndFooter(Math.max(currentY + 2, 248));

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
