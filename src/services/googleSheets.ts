import { Patient, Payment, Refund, SystemUser } from '../types';

export const SHEET_NAMES = {
  PATIENTS: 'Pacientes',
  PAYMENTS: 'Historial de Pagos',
  REFUNDS: 'Historial de Reintegros',
  USERS: 'Usuarios',
};

const PATIENT_HEADERS = [
  'ID Paciente',
  'Nombre Completo',
  'Teléfono / WhatsApp',
  'DNI / Identificación',
  'Procedimiento',
  'Doctor',
  'Costo Total ($)',
  'Total Abonado ($)',
  'Saldo Pendiente ($)',
  'Fecha Registro',
  'Próximo Vencimiento',
  'Estado',
  'Notas',
];

const PAYMENT_HEADERS = [
  'ID Pago',
  'ID Paciente',
  'Nombre Paciente',
  'Fecha',
  'Monto Abonado ($)',
  'Método de Pago',
  'Nro Referencia',
  'Registrado Por',
  'Notas',
  'Creado En',
];

const REFUND_HEADERS = [
  'ID Reintegro',
  'ID Paciente',
  'Nombre Paciente',
  'Fecha',
  'Monto Reintegrado ($)',
  'Motivo',
  'Método Devolución',
  'Nro Referencia',
  'Registrado Por',
  'Creado En',
];

const USER_HEADERS = [
  'ID Usuario',
  'Nombre Completo',
  'Email',
  'Rol',
  'Teléfono',
  'Contraseña',
  'Activo',
  'Es Inmutable',
  'Fecha Creación',
  'Notas',
];

/**
 * Creates a brand new Google Sheet formatted for Dr. Belleza Cobranza
 */
export async function createDrBellezaSpreadsheet(accessToken: string): Promise<{ id: string; url: string; name: string }> {
  const title = `Dr. Belleza - Cobranza (Dr. Jorge Apelencia)`;
  
  const payload = {
    properties: {
      title,
      locale: 'es_ES',
    },
    sheets: [
      {
        properties: {
          title: SHEET_NAMES.PATIENTS,
          gridProperties: { rowCount: 100, columnCount: 15, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: SHEET_NAMES.PAYMENTS,
          gridProperties: { rowCount: 150, columnCount: 12, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: SHEET_NAMES.REFUNDS,
          gridProperties: { rowCount: 50, columnCount: 12, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: SHEET_NAMES.USERS,
          gridProperties: { rowCount: 50, columnCount: 12, frozenRowCount: 1 },
        },
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Error al crear la hoja en Google Sheets');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // Insert initial headers for each tab
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `'${SHEET_NAMES.PATIENTS}'!A1:M1`,
            values: [PATIENT_HEADERS],
          },
          {
            range: `'${SHEET_NAMES.PAYMENTS}'!A1:J1`,
            values: [PAYMENT_HEADERS],
          },
          {
            range: `'${SHEET_NAMES.REFUNDS}'!A1:J1`,
            values: [REFUND_HEADERS],
          },
          {
            range: `'${SHEET_NAMES.USERS}'!A1:J1`,
            values: [USER_HEADERS],
          },
        ],
      }),
    }
  );

  return {
    id: spreadsheetId,
    url: spreadsheetUrl,
    name: title,
  };
}

/**
 * Format a Patient into a Google Sheets row
 */
function patientToRow(p: Patient): (string | number)[] {
  return [
    p.id,
    p.fullName,
    p.phone,
    p.idNumber,
    p.procedure,
    p.doctor || 'Dr. Jorge Apelencia',
    p.totalCost,
    p.totalPaid,
    p.balance,
    p.registrationDate,
    p.nextPaymentDate || '',
    p.status,
    p.notes || '',
  ];
}

/**
 * Format a Payment into a Google Sheets row
 */
function paymentToRow(pay: Payment): (string | number)[] {
  return [
    pay.id,
    pay.patientId,
    pay.patientName,
    pay.date,
    pay.amount,
    pay.paymentMethod,
    pay.reference || '',
    pay.registeredBy || 'Secretaría',
    pay.notes || '',
    pay.createdAt || new Date().toISOString(),
  ];
}

/**
 * Format a Refund into a Google Sheets row
 */
function refundToRow(ref: Refund): (string | number)[] {
  return [
    ref.id,
    ref.patientId,
    ref.patientName,
    ref.date,
    ref.amount,
    ref.reason,
    ref.refundMethod,
    ref.reference || '',
    ref.registeredBy || 'Secretaría',
    ref.createdAt || new Date().toISOString(),
  ];
}

/**
 * Format a User into a Google Sheets row
 */
function userToRow(u: SystemUser): (string | number)[] {
  return [
    u.id,
    u.fullName,
    u.email,
    u.role,
    u.phone || '',
    u.password || '',
    u.isActive ? 'true' : 'false',
    u.isImmutable ? 'true' : 'false',
    u.createdAt || new Date().toISOString().split('T')[0],
    u.notes || '',
  ];
}

/**
 * Sync entire current dataset into Google Sheets cleanly
 */
export async function syncAllToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  patients: Patient[],
  payments: Payment[],
  refunds: Refund[],
  users?: SystemUser[]
): Promise<void> {
  const patientRows = [PATIENT_HEADERS, ...patients.map(patientToRow)];
  const paymentRows = [PAYMENT_HEADERS, ...payments.map(paymentToRow)];
  const refundRows = [REFUND_HEADERS, ...refunds.map(refundToRow)];
  const userRows = users ? [USER_HEADERS, ...users.map(userToRow)] : [];

  const rangesToClear = [
    `'${SHEET_NAMES.PATIENTS}'!A1:Z`,
    `'${SHEET_NAMES.PAYMENTS}'!A1:Z`,
    `'${SHEET_NAMES.REFUNDS}'!A1:Z`,
  ];
  if (users && users.length > 0) {
    rangesToClear.push(`'${SHEET_NAMES.USERS}'!A1:Z`);
  }

  // Clear existing ranges to avoid orphaned leftover rows
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: rangesToClear,
    }),
  });

  const updateData: any[] = [
    {
      range: `'${SHEET_NAMES.PATIENTS}'!A1`,
      values: patientRows,
    },
    {
      range: `'${SHEET_NAMES.PAYMENTS}'!A1`,
      values: paymentRows,
    },
    {
      range: `'${SHEET_NAMES.REFUNDS}'!A1`,
      values: refundRows,
    },
  ];
  if (users && users.length > 0) {
    updateData.push({
      range: `'${SHEET_NAMES.USERS}'!A1`,
      values: userRows,
    });
  }

  // Batch update with current clean records
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: updateData,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.error?.message || 'Error al sincronizar datos con Google Sheets');
  }
}

/**
 * Read all data from the Google Sheet
 */
export async function fetchAllFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<{ patients: Patient[]; payments: Payment[]; refunds: Refund[]; users?: SystemUser[] } | null> {
  try {
    const ranges = [
      `'${SHEET_NAMES.PATIENTS}'!A2:M`,
      `'${SHEET_NAMES.PAYMENTS}'!A2:J`,
      `'${SHEET_NAMES.REFUNDS}'!A2:J`,
      `'${SHEET_NAMES.USERS}'!A2:J`,
    ];
    const encodedRanges = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&');

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${encodedRanges}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('La hoja de cálculo no fue encontrada en Google Drive.');
      }
      if (res.status === 403) {
        throw new Error('No tienes permisos suficientes para acceder a esta hoja de cálculo.');
      }
      const err = await res.json();
      throw new Error(err.error?.message || 'Error al leer datos de Google Sheets');
    }

    const data = await res.json();
    const valueRanges = data.valueRanges || [];

    const rawPatients = valueRanges[0]?.values || [];
    const rawPayments = valueRanges[1]?.values || [];
    const rawRefunds = valueRanges[2]?.values || [];
    const rawUsers = valueRanges[3]?.values || [];

    const patients: Patient[] = rawPatients
      .filter((row: any[]) => row && row[0])
      .map((row: any[]) => {
        const totalCost = Number(row[6]) || 0;
        const totalPaid = Number(row[7]) || 0;
        const balance = Number(row[8]) || (totalCost - totalPaid);
        const status = (row[11] as any) || (balance <= 0 ? 'paid' : 'pending');

        return {
          id: String(row[0]),
          fullName: String(row[1] || ''),
          phone: String(row[2] || ''),
          idNumber: String(row[3] || ''),
          procedure: String(row[4] || ''),
          doctor: String(row[5] || 'Dr. Jorge Apelencia'),
          totalCost,
          totalPaid,
          balance,
          registrationDate: String(row[9] || new Date().toISOString().split('T')[0]),
          nextPaymentDate: row[10] ? String(row[10]) : undefined,
          status: status === 'paid' ? 'paid' : (status === 'overdue' ? 'overdue' : 'pending'),
          notes: row[12] ? String(row[12]) : '',
        };
      });

    const payments: Payment[] = rawPayments
      .filter((row: any[]) => row && row[0])
      .map((row: any[]) => ({
        id: String(row[0]),
        patientId: String(row[1] || ''),
        patientName: String(row[2] || ''),
        date: String(row[3] || ''),
        amount: Number(row[4]) || 0,
        paymentMethod: (row[5] as any) || 'Transferencia',
        reference: String(row[6] || ''),
        registeredBy: String(row[7] || 'Secretaría'),
        notes: row[8] ? String(row[8]) : '',
        createdAt: String(row[9] || new Date().toISOString()),
      }));

    const refunds: Refund[] = rawRefunds
      .filter((row: any[]) => row && row[0])
      .map((row: any[]) => ({
        id: String(row[0]),
        patientId: String(row[1] || ''),
        patientName: String(row[2] || ''),
        date: String(row[3] || ''),
        amount: Number(row[4]) || 0,
        reason: String(row[5] || ''),
        refundMethod: (row[6] as any) || 'Transferencia',
        reference: String(row[7] || ''),
        registeredBy: String(row[8] || 'Secretaría'),
        createdAt: String(row[9] || new Date().toISOString()),
      }));

    const users: SystemUser[] = rawUsers
      .filter((row: any[]) => row && row[0])
      .map((row: any[]) => ({
        id: String(row[0]),
        fullName: String(row[1] || ''),
        email: String(row[2] || ''),
        role: (row[3] as any) || 'asistente',
        phone: String(row[4] || ''),
        password: String(row[5] || ''),
        isActive: String(row[6]).toLowerCase() === 'true',
        isImmutable: String(row[7]).toLowerCase() === 'true',
        createdAt: String(row[8] || new Date().toISOString().split('T')[0]),
        notes: row[9] ? String(row[9]) : '',
      }));

    return { patients, payments, refunds, users };
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

/**
 * Append a single patient row to the Google Sheet
 */
export async function appendPatientToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  patient: Patient
): Promise<void> {
  const row = patientToRow(patient);
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.PATIENTS}'!A:M:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );
}

/**
 * Update an existing patient in Google Sheets
 */
export async function updatePatientInGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  patient: Patient
): Promise<void> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.PATIENTS}'!A:A`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) {
      await appendPatientToGoogleSheet(accessToken, spreadsheetId, patient);
      return;
    }
    const data = await res.json();
    const rows = data.values || [];
    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && String(rows[i][0]) === String(patient.id)) {
        targetRowIndex = i + 1;
        break;
      }
    }
    if (targetRowIndex > 1) {
      const row = patientToRow(patient);
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.PATIENTS}'!A${targetRowIndex}:M${targetRowIndex}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [row],
          }),
        }
      );
    } else {
      await appendPatientToGoogleSheet(accessToken, spreadsheetId, patient);
    }
  } catch (e) {
    console.error('Error updating patient in Google Sheet:', e);
  }
}

/**
 * Delete a patient row from Google Sheets by clearing it
 */
export async function deletePatientFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  patientId: string
): Promise<void> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.PATIENTS}'!A:A`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return;
    const data = await res.json();
    const rows = data.values || [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && String(rows[i][0]) === String(patientId)) {
        const rowIdx = i + 1;
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.PATIENTS}'!A${rowIdx}:M${rowIdx}:clear`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        break;
      }
    }
  } catch (e) {
    console.error('Error deleting patient from Google Sheet:', e);
  }
}

/**
 * Append a single payment row to the Google Sheet
 */
export async function appendPaymentToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  payment: Payment
): Promise<void> {
  const row = paymentToRow(payment);
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.PAYMENTS}'!A:J:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );
}

/**
 * Append a single refund row to the Google Sheet
 */
export async function appendRefundToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  refund: Refund
): Promise<void> {
  const row = refundToRow(refund);
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.REFUNDS}'!A:J:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );
}

/**
 * Append a single user row to the Google Sheet
 */
export async function appendUserToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  user: SystemUser
): Promise<void> {
  const row = userToRow(user);
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.USERS}'!A:J:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );
}

/**
 * Update an existing user in Google Sheets
 */
export async function updateUserInGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  user: SystemUser
): Promise<void> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.USERS}'!A:A`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) {
      await appendUserToGoogleSheet(accessToken, spreadsheetId, user);
      return;
    }
    const data = await res.json();
    const rows = data.values || [];
    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && String(rows[i][0]) === String(user.id)) {
        targetRowIndex = i + 1;
        break;
      }
    }
    if (targetRowIndex > 1) {
      const row = userToRow(user);
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.USERS}'!A${targetRowIndex}:J${targetRowIndex}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [row],
          }),
        }
      );
    } else {
      await appendUserToGoogleSheet(accessToken, spreadsheetId, user);
    }
  } catch (e) {
    console.error('Error updating user in Google Sheet:', e);
  }
}

/**
 * Delete a user row from Google Sheets by clearing it
 */
export async function deleteUserInGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  userId: string
): Promise<void> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.USERS}'!A:A`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return;
    const data = await res.json();
    const rows = data.values || [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && String(rows[i][0]) === String(userId)) {
        const rowIdx = i + 1;
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.USERS}'!A${rowIdx}:J${rowIdx}:clear`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        break;
      }
    }
  } catch (e) {
    console.error('Error deleting user in Google Sheet:', e);
  }
}
