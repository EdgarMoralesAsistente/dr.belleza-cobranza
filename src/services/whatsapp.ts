import { Patient, Payment, Refund } from '../types';

export type WhatsAppTemplateType = 'reminder' | 'receipt' | 'refund' | 'statement';

export interface WhatsAppTemplateOption {
  id: WhatsAppTemplateType;
  title: string;
  description: string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplateOption[] = [
  {
    id: 'reminder',
    title: 'Recordatorio de Pago Pendiente',
    description: 'Avisa a la paciente de su saldo y fecha de vencimiento',
  },
  {
    id: 'receipt',
    title: 'Confirmación de Abono Recibido',
    description: 'Agradece el pago registrado y detalla el saldo restante',
  },
  {
    id: 'refund',
    title: 'Notificación de Reintegro',
    description: 'Informa la devolución o reintegro procesado',
  },
  {
    id: 'statement',
    title: 'Estado de Cuenta Completo',
    description: 'Resumen de costo total, monto abonado y saldo actual',
  },
];

export function cleanPhoneNumber(phone: string): string {
  // Remove spaces, parentheses, dashes
  let clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+')) {
    clean = clean.substring(1);
  }
  return clean;
}

export function generateWhatsAppMessage(
  template: WhatsAppTemplateType,
  patient: Patient,
  payment?: Payment,
  refund?: Refund
): string {
  const patientFirstName = patient.fullName.split(' ')[0] || patient.fullName;
  const clinicName = 'Dr. Belleza - Dr. Jorge Apelencia';

  switch (template) {
    case 'reminder':
      return (
        `¡Hola ${patientFirstName}! 👋\n\n` +
        `Le escribimos desde el consultorio del *${clinicName}*.\n\n` +
        `Le recordamos cordialmente que tiene un saldo pendiente de *$${patient.balance.toLocaleString()}* correspondiente a su procedimiento de *${patient.procedure}*.\n\n` +
        (patient.nextPaymentDate ? `📅 Fecha estimada de vencimiento: *${patient.nextPaymentDate}*\n\n` : '') +
        `Si necesita los datos bancarios para transferencia o desea coordinar su pago en efectivo o tarjeta, por favor respóndanos a este mensaje.\n\n` +
        `¡Muchas gracias por su confianza!`
      );

    case 'receipt':
      const amountPaid = payment ? payment.amount : 0;
      return (
        `¡Hola ${patientFirstName}! 👋\n\n` +
        `Le confirmamos con éxito la recepción de su abono por *$${amountPaid.toLocaleString()}* para su procedimiento de *${patient.procedure}* con el *${clinicName}*.\n\n` +
        `📊 *Detalle actualizado:*\n` +
        `• Costo total: $${patient.totalCost.toLocaleString()}\n` +
        `• Total abonado a la fecha: $${patient.totalPaid.toLocaleString()}\n` +
        `• Saldo pendiente: *$${patient.balance.toLocaleString()}*\n\n` +
        (payment?.reference ? `🔖 Comprobante/Ref: ${payment.reference}\n\n` : '') +
        `¡Agradecemos su puntualidad y quedamos a su entera disposición!`
      );

    case 'refund':
      const refundAmount = refund ? refund.amount : 0;
      const refundReason = refund ? refund.reason : 'Reintegro pactado';
      return (
        `¡Hola ${patientFirstName}! 👋\n\n` +
        `Le informamos desde el consultorio del *${clinicName}* que se ha procesado correctamente su reintegro por un monto de *$${refundAmount.toLocaleString()}*.\n\n` +
        `📋 *Motivo:* ${refundReason}\n` +
        (refund?.reference ? `🔖 Ref. de transferencia: ${refund.reference}\n\n` : '\n') +
        `Cualquier consulta estamos a su entera disposición. ¡Saludos cordiales!`
      );

    case 'statement':
    default:
      return (
        `¡Hola ${patientFirstName}! 👋\n\n` +
        `Le compartimos su estado de cuenta actualizado en el consultorio del *${clinicName}*:\n\n` +
        `🩺 *Procedimiento:* ${patient.procedure}\n` +
        `💵 *Costo Total Presupuestado:* $${patient.totalCost.toLocaleString()}\n` +
        `✅ *Total Abonado:* $${patient.totalPaid.toLocaleString()}\n` +
        `⏳ *Saldo Pendiente:* *$${patient.balance.toLocaleString()}*\n` +
        `📌 *Estado:* ${patient.status === 'paid' ? 'Al día / Cancelado' : 'Pendiente'}\n\n` +
        `Si desea coordinar una consulta o realizar un abono, avísenos por este medio.\n` +
        `¡Muchas gracias!`
      );
  }
}

export function openWhatsAppWeb(phone: string, text: string): void {
  const cleaned = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const url = `https://web.whatsapp.com/send?phone=${cleaned}&text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openWhatsAppMobile(phone: string, text: string): void {
  const cleaned = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
