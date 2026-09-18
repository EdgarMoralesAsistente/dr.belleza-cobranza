import { Patient, Payment, Refund, SystemUser, SurgicalProcedure, FinancingPlan } from '../types';

export const SHEET_NAMES = {
  PATIENTS: 'Pacientes',
  PAYMENTS: 'Historial de Pagos',
  REFUNDS: 'Historial de Reintegros',
  USERS: 'Usuarios',
  PROCEDURES: 'Procedimientos', // PLURAL - Garantiza una única hoja oficial
  PLANES: 'Planes_Financiamiento',
};

// Aliases para resolver nombres dinámicos de pestañas en Google Sheets
export const SHEET_ALIASES: Record<string, string[]> = {
  [SHEET_NAMES.PROCEDURES]: ['procedimientos', 'procedimiento', 'cirugias', 'cirugia', 'catalogo', 'catalogo_quirurgico', 'procedures', 'procedure'],
  [SHEET_NAMES.PLANES]: ['planes_financiamiento', 'planes financiamiento', 'planes', 'plan', 'financiamiento'],
  [SHEET_NAMES.PATIENTS]: ['pacientes', 'paciente', 'patients', 'patient'],
  [SHEET_NAMES.PAYMENTS]: ['historial de pagos', 'historial_de_pagos', 'abonos', 'abono', 'pagos', 'pago', 'payments'],
  [SHEET_NAMES.REFUNDS]: ['historial de reintegros', 'historial_de_reintegros', 'reintegros', 'reintegro', 'devoluciones', 'refunds'],
  [SHEET_NAMES.USERS]: ['usuarios', 'usuario', 'users', 'user'],
};

// Cache de pestañas encontradas por cada spreadsheetId
const tabNameCache = new Map<string, string>();

function normalizeTabName(name: string): string {
  return String(name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '');
}

/**
 * Resuelve el nombre real de la pestaña en la hoja de cálculo de Google.
 * Si la pestaña no existe (por ejemplo 'Procedimiento'), la crea automáticamente
 * con la estructura adecuada de encabezados para evitar errores 400.
 */
export async function resolveSheetTabName(
  accessToken: string,
  spreadsheetId: string,
  preferredName: string,
  aliases: string[] = [],
  headersToInit?: string[]
): Promise<string> {
  const cacheKey = `${spreadsheetId}::${preferredName}`;
  if (tabNameCache.has(cacheKey)) {
    return tabNameCache.get(cacheKey)!;
  }

  try {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (metaRes.ok) {
      const meta = await metaRes.json();
      const sheets = meta.sheets || [];
      const targetNorm = normalizeTabName(preferredName);
      const allAliasesNorm = [targetNorm, ...aliases.map(normalizeTabName)];

      // Si estamos resolviendo la hoja de Procedimientos, eliminar la hoja singular "Procedimiento" si ambas existen
      if (preferredName === SHEET_NAMES.PROCEDURES) {
        const pluralSheet = sheets.find((s: any) => s?.properties?.title?.toLowerCase() === 'procedimientos');
        const singularSheet = sheets.find((s: any) => s?.properties?.title?.toLowerCase() === 'procedimiento');

        if (pluralSheet && singularSheet) {
          const singularSheetId = singularSheet.properties?.sheetId;
          if (typeof singularSheetId === 'number') {
            try {
              await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  requests: [{ deleteSheet: { sheetId: singularSheetId } }],
                }),
              });
            } catch (err) {
              console.warn('No se pudo eliminar la hoja duplicada "Procedimiento":', err);
            }
          }
          tabNameCache.set(cacheKey, 'Procedimientos');
          return 'Procedimientos';
        } else if (!pluralSheet && singularSheet) {
          const singularSheetId = singularSheet.properties?.sheetId;
          if (typeof singularSheetId === 'number') {
            try {
              await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  requests: [
                    {
                      updateSheetProperties: {
                        properties: { sheetId: singularSheetId, title: 'Procedimientos' },
                        fields: 'title',
                      },
                    },
                  ],
                }),
              });
              tabNameCache.set(cacheKey, 'Procedimientos');
              return 'Procedimientos';
            } catch (err) {
              console.warn('No se pudo renombrar "Procedimiento" a "Procedimientos":', err);
            }
          }
        }
      }

      // 1. Coincidencia exacta
      for (const s of sheets) {
        const title = s?.properties?.title;
        if (title && title.toLowerCase() === preferredName.toLowerCase()) {
          tabNameCache.set(cacheKey, title);
          return title;
        }
      }

      // 2. Coincidencia normalizada o por alias (e.g. 'Procedimiento' vs 'Procedimientos')
      for (const s of sheets) {
        const title = s?.properties?.title;
        if (!title) continue;
        const norm = normalizeTabName(title);
        if (allAliasesNorm.includes(norm)) {
          tabNameCache.set(cacheKey, title);
          return title;
        }
      }

      // 3. No existe: crear la pestaña en la hoja de cálculo
      try {
        const addRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: preferredName,
                      gridProperties: { rowCount: 100, columnCount: 15, frozenRowCount: 1 },
                    },
                  },
                },
              ],
            }),
          }
        );

        if (addRes.ok && headersToInit && headersToInit.length > 0) {
          await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${preferredName}'!A1?valueInputOption=USER_ENTERED`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                values: [headersToInit],
              }),
            }
          );
        }
      } catch (addErr) {
        console.warn('Error al auto-crear pestaña en Google Sheets:', addErr);
      }
    }
  } catch (err) {
    console.warn('Error resolviendo pestaña de Google Sheet:', err);
  }

  tabNameCache.set(cacheKey, preferredName);
  return preferredName;
}

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

const PROCEDURE_HEADERS = [
  'Código Único',
  'Categoría',
  'Nombre del Procedimiento',
  'Precio Base (USD)',
  'Observaciones',
];

const FINANCING_PLAN_HEADERS = [
  'ID Plan',
  'Nombre del Plan',
  'Meses',
  'Frecuencia',
  'Cuotas',
  'Interés (%)',
  'Anticipo Mínimo (%)',
  'Activo',
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
      {
        properties: {
          title: SHEET_NAMES.PROCEDURES,
          gridProperties: { rowCount: 50, columnCount: 12, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: SHEET_NAMES.PLANES,
          gridProperties: { rowCount: 30, columnCount: 10, frozenRowCount: 1 },
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
          {
            range: `'${SHEET_NAMES.PROCEDURES}'!A1:I1`,
            values: [PROCEDURE_HEADERS],
          },
          {
            range: `'${SHEET_NAMES.PLANES}'!A1:H1`,
            values: [FINANCING_PLAN_HEADERS],
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

export function procedureToRow(proc: SurgicalProcedure): (string | number)[] {
  return [
    proc.code || proc.id || '',
    proc.category || 'Facial',
    proc.name || '',
    proc.basePrice || 0,
    proc.notes || '',
  ];
}

export function planToRow(pl: FinancingPlan): (string | number)[] {
  return [
    pl.id,
    pl.name || '',
    pl.months || 6,
    pl.frequency || 'Mensual',
    pl.installmentsCount || 6,
    pl.interestRatePercent || 0,
    pl.downPaymentPercent || 20,
    pl.isActive !== false ? 'TRUE' : 'FALSE',
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
  users?: SystemUser[],
  procedures?: SurgicalProcedure[],
  financingPlans?: FinancingPlan[]
): Promise<void> {
  const patientTab = await resolveSheetTabName(accessToken, spreadsheetId, SHEET_NAMES.PATIENTS, SHEET_ALIASES[SHEET_NAMES.PATIENTS], PATIENT_HEADERS);
  const paymentTab = await resolveSheetTabName(accessToken, spreadsheetId, SHEET_NAMES.PAYMENTS, SHEET_ALIASES[SHEET_NAMES.PAYMENTS], PAYMENT_HEADERS);
  const refundTab = await resolveSheetTabName(accessToken, spreadsheetId, SHEET_NAMES.REFUNDS, SHEET_ALIASES[SHEET_NAMES.REFUNDS], REFUND_HEADERS);
  const userTab = users ? await resolveSheetTabName(accessToken, spreadsheetId, SHEET_NAMES.USERS, SHEET_ALIASES[SHEET_NAMES.USERS], USER_HEADERS) : SHEET_NAMES.USERS;
  const procTab = procedures ? await resolveSheetTabName(accessToken, spreadsheetId, SHEET_NAMES.PROCEDURES, SHEET_ALIASES[SHEET_NAMES.PROCEDURES], PROCEDURE_HEADERS) : SHEET_NAMES.PROCEDURES;
  const planTab = financingPlans ? await resolveSheetTabName(accessToken, spreadsheetId, SHEET_NAMES.PLANES, SHEET_ALIASES[SHEET_NAMES.PLANES], FINANCING_PLAN_HEADERS) : SHEET_NAMES.PLANES;

  const patientRows = [PATIENT_HEADERS, ...patients.map(patientToRow)];
  const paymentRows = [PAYMENT_HEADERS, ...payments.map(paymentToRow)];
  const refundRows = [REFUND_HEADERS, ...refunds.map(refundToRow)];
  const userRows = users ? [USER_HEADERS, ...users.map(userToRow)] : [];
  const procedureRows = procedures ? [PROCEDURE_HEADERS, ...procedures.map(procedureToRow)] : [];
  const planRows = financingPlans ? [FINANCING_PLAN_HEADERS, ...financingPlans.map(planToRow)] : [];

  const rangesToClear = [
    `'${patientTab}'!A1:Z`,
    `'${paymentTab}'!A1:Z`,
    `'${refundTab}'!A1:Z`,
  ];
  if (users && users.length > 0) {
    rangesToClear.push(`'${userTab}'!A1:Z`);
  }
  if (procedures && procedures.length > 0) {
    rangesToClear.push(`'${procTab}'!A1:Z`);
  }
  if (financingPlans && financingPlans.length > 0) {
    rangesToClear.push(`'${planTab}'!A1:Z`);
  }

  // Clear existing ranges to avoid orphaned leftover rows
  try {
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
  } catch (clearErr) {
    console.warn('Batch clear warning:', clearErr);
  }

  const updateData: any[] = [
    {
      range: `'${patientTab}'!A1`,
      values: patientRows,
    },
    {
      range: `'${paymentTab}'!A1`,
      values: paymentRows,
    },
    {
      range: `'${refundTab}'!A1`,
      values: refundRows,
    },
  ];
  if (users && users.length > 0) {
    updateData.push({
      range: `'${userTab}'!A1`,
      values: userRows,
    });
  }
  if (procedures && procedures.length > 0) {
    updateData.push({
      range: `'${procTab}'!A1`,
      values: procedureRows,
    });
  }
  if (financingPlans && financingPlans.length > 0) {
    updateData.push({
      range: `'${planTab}'!A1`,
      values: planRows,
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
): Promise<{
  patients: Patient[];
  payments: Payment[];
  refunds: Refund[];
  users?: SystemUser[];
  procedures?: SurgicalProcedure[];
  financingPlans?: FinancingPlan[];
} | null> {
  try {
    const procTab = await resolveSheetTabName(
      accessToken,
      spreadsheetId,
      SHEET_NAMES.PROCEDURES,
      SHEET_ALIASES[SHEET_NAMES.PROCEDURES]
    );
    const planTab = await resolveSheetTabName(
      accessToken,
      spreadsheetId,
      SHEET_NAMES.PLANES,
      SHEET_ALIASES[SHEET_NAMES.PLANES]
    );

    const ranges = [
      `'${SHEET_NAMES.PATIENTS}'!A2:M`,
      `'${SHEET_NAMES.PAYMENTS}'!A2:J`,
      `'${SHEET_NAMES.REFUNDS}'!A2:J`,
      `'${SHEET_NAMES.USERS}'!A2:J`,
      `'${procTab}'!A2:I`,
      `'${planTab}'!A2:H`,
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
    const rawProcedures = valueRanges[4]?.values || [];
    const rawPlans = valueRanges[5]?.values || [];

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

    const procedures: SurgicalProcedure[] = rawProcedures
      .filter((row: any[]) => row && row[0])
      .map((row: any[]) => {
        // Soporte retrocompatible si la hoja tenía el formato antiguo de 9 o 10 columnas
        if (row.length >= 8 && typeof row[4] === 'number') {
          return {
            id: String(row[0]),
            code: String(row[1] || row[0]),
            name: String(row[2] || ''),
            category: (row[3] as any) || 'Facial',
            basePrice: Number(row[4]) || 0,
            notes: String(row[9] || ''),
            isActive: String(row[8]).toUpperCase() !== 'FALSE',
          };
        }
        // Formato nuevo exacto de 5 columnas: Código Único, Categoría, Nombre del Procedimiento, Precio Base (USD), Observaciones
        const code = String(row[0] || '').trim();
        return {
          id: code,
          code: code,
          category: (row[1] as any) || 'Facial',
          name: String(row[2] || ''),
          basePrice: Number(row[3]) || 0,
          notes: String(row[4] || ''),
          isActive: true,
        };
      });

    const financingPlans: FinancingPlan[] = rawPlans
      .filter((row: any[]) => row && row[0])
      .map((row: any[]) => ({
        id: String(row[0]),
        name: String(row[1] || ''),
        months: Number(row[2]) || 6,
        frequency: (row[3] as any) || 'Mensual',
        installmentsCount: Number(row[4]) || 6,
        interestRatePercent: Number(row[5]) || 0,
        downPaymentPercent: Number(row[6]) || 20,
        isActive: String(row[7]).toUpperCase() !== 'FALSE',
      }));

    return {
      patients,
      payments,
      refunds,
      users: users.length > 0 ? users : undefined,
      procedures: procedures.length > 0 ? procedures : undefined,
      financingPlans: financingPlans.length > 0 ? financingPlans : undefined,
    };
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

/**
 * Sync entire surgical procedures catalog to Google Sheets
 */
export async function syncAllProceduresToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  procedures: SurgicalProcedure[]
): Promise<void> {
  const targetTab = await resolveSheetTabName(
    accessToken,
    spreadsheetId,
    SHEET_NAMES.PROCEDURES,
    SHEET_ALIASES[SHEET_NAMES.PROCEDURES],
    PROCEDURE_HEADERS
  );
  const rows = [PROCEDURE_HEADERS, ...procedures.map(procedureToRow)];

  // Clear existing catalog to prevent stale or duplicate entries
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${targetTab}'!A1:Z:clear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (clearErr) {
    console.warn('Clear procedures warning:', clearErr);
  }

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${targetTab}'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Error al guardar catálogo de procedimientos en Google Sheets');
  }
}

/**
 * Append a single procedure to Google Sheets
 */
export async function appendProcedureToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  proc: SurgicalProcedure
): Promise<void> {
  const targetTab = await resolveSheetTabName(
    accessToken,
    spreadsheetId,
    SHEET_NAMES.PROCEDURES,
    SHEET_ALIASES[SHEET_NAMES.PROCEDURES],
    PROCEDURE_HEADERS
  );
  const row = procedureToRow(proc);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${targetTab}'!A:I:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
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

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Error al agregar procedimiento a Google Sheets');
  }
}

/**
 * Update or append a procedure in Google Sheets
 */
export async function updateProcedureInGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  proc: SurgicalProcedure
): Promise<void> {
  try {
    const targetTab = await resolveSheetTabName(
      accessToken,
      spreadsheetId,
      SHEET_NAMES.PROCEDURES,
      SHEET_ALIASES[SHEET_NAMES.PROCEDURES],
      PROCEDURE_HEADERS
    );
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${targetTab}'!A:B`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) {
      await appendProcedureToGoogleSheet(accessToken, spreadsheetId, proc);
      return;
    }
    const data = await res.json();
    const rows = data.values || [];
    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (
        (rows[i] && String(rows[i][0]) === String(proc.id)) ||
        (rows[i] && proc.code && String(rows[i][1]).toUpperCase() === String(proc.code).toUpperCase())
      ) {
        targetRowIndex = i + 1;
        break;
      }
    }
    if (targetRowIndex > 1) {
      const row = procedureToRow(proc);
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${targetTab}'!A${targetRowIndex}:I${targetRowIndex}?valueInputOption=USER_ENTERED`,
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
      await appendProcedureToGoogleSheet(accessToken, spreadsheetId, proc);
    }
  } catch (e) {
    console.error('Error updating procedure in Google Sheet:', e);
  }
}

/**
 * Delete a procedure in Google Sheets
 */
export async function deleteProcedureFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  procedureId: string
): Promise<void> {
  try {
    const targetTab = await resolveSheetTabName(
      accessToken,
      spreadsheetId,
      SHEET_NAMES.PROCEDURES,
      SHEET_ALIASES[SHEET_NAMES.PROCEDURES],
      PROCEDURE_HEADERS
    );
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${targetTab}'!A:A`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return;
    const data = await res.json();
    const rows = data.values || [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && String(rows[i][0]) === String(procedureId)) {
        const rowIdx = i + 1;
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${targetTab}'!A${rowIdx}:I${rowIdx}:clear`,
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
    console.error('Error deleting procedure in Google Sheet:', e);
  }
}

/**
 * Sync entire financing plans to Google Sheets
 */
export async function syncAllPlansToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  plans: FinancingPlan[]
): Promise<void> {
  const targetTab = await resolveSheetTabName(
    accessToken,
    spreadsheetId,
    SHEET_NAMES.PLANES,
    SHEET_ALIASES[SHEET_NAMES.PLANES],
    FINANCING_PLAN_HEADERS
  );
  const rows = [FINANCING_PLAN_HEADERS, ...plans.map(planToRow)];

  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${targetTab}'!A1:Z:clear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (clearErr) {
    console.warn('Clear financing plans warning:', clearErr);
  }

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${targetTab}'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Error al guardar planes en Google Sheets');
  }
}

/**
 * Append a single financing plan row to Google Sheets
 */
export async function appendPlanToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  plan: FinancingPlan
): Promise<void> {
  const targetTab = await resolveSheetTabName(
    accessToken,
    spreadsheetId,
    SHEET_NAMES.PLANES,
    SHEET_ALIASES[SHEET_NAMES.PLANES],
    FINANCING_PLAN_HEADERS
  );
  const row = planToRow(plan);
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${targetTab}'!A:H:append?valueInputOption=USER_ENTERED`,
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
 * Update an existing financing plan in Google Sheets
 */
export async function updatePlanInGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  plan: FinancingPlan
): Promise<void> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.PLANES}'!A:B`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) {
      await appendPlanToGoogleSheet(accessToken, spreadsheetId, plan);
      return;
    }
    const data = await res.json();
    const rows = data.values || [];
    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (
        (rows[i] && String(rows[i][0]) === String(plan.id)) ||
        (rows[i] && String(rows[i][1]).trim().toLowerCase() === plan.name.trim().toLowerCase())
      ) {
        targetRowIndex = i + 1;
        break;
      }
    }
    if (targetRowIndex > 1) {
      const row = planToRow(plan);
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.PLANES}'!A${targetRowIndex}:H${targetRowIndex}?valueInputOption=USER_ENTERED`,
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
      await appendPlanToGoogleSheet(accessToken, spreadsheetId, plan);
    }
  } catch (e) {
    console.error('Error updating financing plan in Google Sheet:', e);
  }
}

/**
 * Delete a financing plan from Google Sheets
 */
export async function deletePlanFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  planId: string
): Promise<void> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.PLANES}'!A:A`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return;
    const data = await res.json();
    const rows = data.values || [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && String(rows[i][0]) === String(planId)) {
        const rowIdx = i + 1;
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${SHEET_NAMES.PLANES}'!A${rowIdx}:H${rowIdx}:clear`,
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
    console.error('Error deleting financing plan in Google Sheet:', e);
  }
}

