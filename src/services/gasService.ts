import {
  Patient,
  Payment,
  Refund,
  SystemUser,
  CRMEvent,
  SurgicalProcedure,
  FinancingPlan,
} from '../types';

/**
 * Cliente de comunicación con Google Apps Script (Web App)
 * 
 * CRÍTICO PARA EVITAR PROBLEMAS DE CORS EN VERCEL / GITHUB / LOCALHOST:
 * Google Apps Script no soporta solicitudes preflight de tipo OPTIONS.
 * Si se envía 'Content-Type: application/json', el navegador enviará un OPTIONS
 * y Google Apps Script responderá con error de CORS o 405.
 * 
 * Por ello, enviamos 'Content-Type: text/plain;charset=utf-8' con JSON serializado.
 * Google Apps Script lee `e.postData.contents`, lo parsea con `JSON.parse`
 * y responde con `ContentService.MimeType.JSON`.
 */

async function postToGas(url: string, payload: Record<string, any>, timeoutMs = 25000): Promise<any> {
  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith('https://script.google.com/')) {
    throw new Error('La URL proporcionada no es una URL válida de Google Apps Script (debe comenzar con https://script.google.com/)');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        throw new Error(
          'Google Apps Script respondió con HTTP 403 (Acceso Denegado). En la configuración de la implementación en Apps Script, asegúrate de que "Quién tiene acceso" (Who has access) esté configurado como "Cualquiera" (Anyone).'
        );
      }
      throw new Error(`Error de comunicación con Google Apps Script (HTTP ${response.status})`);
    }

    const rawText = await response.text();
    let result: any;
    try {
      result = JSON.parse(rawText);
    } catch {
      if (rawText.includes('<html') || rawText.includes('<!DOCTYPE') || rawText.includes('Page not found')) {
        throw new Error(
          'Google Apps Script devolvió una página HTML en lugar de JSON. Verifica en Apps Script que la implementación esté publicada como Aplicación Web con "Quién tiene acceso: Cualquier usuario" (Anyone).'
        );
      }
      throw new Error(`Respuesta no válida de Google Apps Script: ${rawText.slice(0, 120)}`);
    }

    if (result.status === 'error') {
      throw new Error(result.message || 'Error devuelto por Google Apps Script');
    }
    return result;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado (25s) esperando respuesta de Google Apps Script.');
    }
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error(
        'No se pudo contactar con Google Apps Script. Verifica que el despliegue esté configurado como "Cualquiera" (Anyone) y no sólo "Yo".'
      );
    }
    throw err;
  }
}

/**
 * Prueba la conectividad con el Web App de Google Apps Script
 */
export async function testGasConnection(gasUrl: string): Promise<{
  success: boolean;
  message: string;
  spreadsheetName?: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  sheetsFound?: string[];
}> {
  const res = await postToGas(gasUrl, { action: 'PING' });
  return {
    success: true,
    message: res.message || 'Conexión exitosa con Google Apps Script',
    spreadsheetName: res.spreadsheetName,
    spreadsheetId: res.spreadsheetId,
    spreadsheetUrl: res.spreadsheetUrl,
    sheetsFound: res.sheetsFound,
  };
}

/**
 * Trae todos los datos actuales desde Google Sheets
 */
export async function fetchAllFromGas(gasUrl: string): Promise<{
  patients: Patient[];
  payments: Payment[];
  refunds: Refund[];
  users?: SystemUser[];
  crmEvents?: CRMEvent[];
  procedures?: SurgicalProcedure[];
  financingPlans?: FinancingPlan[];
  spreadsheetName?: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
}> {
  const res = await postToGas(gasUrl, { action: 'GET_ALL' });
  return {
    patients: Array.isArray(res.patients) ? res.patients : [],
    payments: Array.isArray(res.payments) ? res.payments : [],
    refunds: Array.isArray(res.refunds) ? res.refunds : [],
    users: Array.isArray(res.users) ? res.users : undefined,
    crmEvents: Array.isArray(res.crmEvents) ? res.crmEvents : undefined,
    procedures: Array.isArray(res.procedures) ? res.procedures : undefined,
    financingPlans: Array.isArray(res.financingPlans) ? res.financingPlans : undefined,
    spreadsheetName: res.spreadsheetName,
    spreadsheetId: res.spreadsheetId,
    spreadsheetUrl: res.spreadsheetUrl,
  };
}

/**
 * Guarda o actualiza un paciente en Google Sheets
 */
export async function savePatientToGas(gasUrl: string, patient: Patient): Promise<void> {
  await postToGas(gasUrl, {
    action: 'SAVE_PATIENT',
    patient,
  });
}

/**
 * Elimina una paciente en Google Sheets con BORRADO EN CASCADA
 * (Elimina la paciente y automáticamente todos sus pagos, reintegros y recordatorios asociados)
 */
export async function deletePatientFromGas(gasUrl: string, patientId: string): Promise<{ deletedPayments: number; deletedRefunds: number }> {
  const res = await postToGas(gasUrl, {
    action: 'DELETE_PATIENT',
    patientId,
  });
  return {
    deletedPayments: res.deletedPayments || 0,
    deletedRefunds: res.deletedRefunds || 0,
  };
}

/**
 * Registra un abono/pago en Google Sheets y actualiza el saldo de la paciente
 */
export async function savePaymentToGas(gasUrl: string, payment: Payment): Promise<void> {
  await postToGas(gasUrl, {
    action: 'SAVE_PAYMENT',
    payment,
  });
}

/**
 * Elimina un pago en Google Sheets y recalcula el saldo de la paciente
 */
export async function deletePaymentFromGas(gasUrl: string, paymentId: string): Promise<void> {
  await postToGas(gasUrl, {
    action: 'DELETE_PAYMENT',
    paymentId,
  });
}

/**
 * Registra un reintegro en Google Sheets
 */
export async function saveRefundToGas(gasUrl: string, refund: Refund): Promise<void> {
  await postToGas(gasUrl, {
    action: 'SAVE_REFUND',
    refund,
  });
}

/**
 * Elimina un reintegro en Google Sheets
 */
export async function deleteRefundFromGas(gasUrl: string, refundId: string): Promise<void> {
  await postToGas(gasUrl, {
    action: 'DELETE_REFUND',
    refundId,
  });
}

/**
 * Guarda o actualiza un usuario en la hoja 'Usuarios'
 */
export async function saveUserToGas(gasUrl: string, user: SystemUser): Promise<void> {
  await postToGas(gasUrl, {
    action: 'SAVE_USER',
    user,
  });
}

/**
 * Elimina un usuario en la hoja 'Usuarios'
 */
export async function deleteUserFromGas(gasUrl: string, userId: string): Promise<void> {
  await postToGas(gasUrl, {
    action: 'DELETE_USER',
    userId,
  });
}

/**
 * Guarda o actualiza un evento o recordatorio de CRM
 */
export async function saveCrmEventToGas(gasUrl: string, event: CRMEvent): Promise<void> {
  await postToGas(gasUrl, {
    action: 'SAVE_CRM_EVENT',
    event,
  });
}

/**
 * Guarda o actualiza un procedimiento quirúrgico en Google Sheets
 */
export async function saveProcedureToGas(
  gasUrl: string,
  procedure: SurgicalProcedure,
  allProcedures?: SurgicalProcedure[]
): Promise<any> {
  try {
    return await postToGas(gasUrl, {
      action: 'SAVE_PROCEDURE',
      procedure,
    });
  } catch (err: any) {
    // Si la versión desplegada no reconoce SAVE_PROCEDURE, usar BATCH_SYNC como fallback automático
    if (err.message && (err.message.includes('Acción no reconocida') || err.message.includes('SAVE_PROCEDURE'))) {
      const procsToSync = allProcedures && allProcedures.length > 0
        ? (allProcedures.some((p) => p.id === procedure.id)
            ? allProcedures.map((p) => (p.id === procedure.id ? procedure : p))
            : [...allProcedures, procedure])
        : [procedure];
      return await postToGas(gasUrl, {
        action: 'BATCH_SYNC',
        procedures: procsToSync,
      });
    }
    throw err;
  }
}

/**
 * Elimina un procedimiento quirúrgico de Google Sheets
 */
export async function deleteProcedureFromGas(
  gasUrl: string,
  procedureId: string,
  remainingProcedures?: SurgicalProcedure[]
): Promise<void> {
  try {
    await postToGas(gasUrl, {
      action: 'DELETE_PROCEDURE',
      procedureId,
    });
  } catch (err: any) {
    if (err.message && (err.message.includes('Acción no reconocida') || err.message.includes('DELETE_PROCEDURE')) && remainingProcedures) {
      await postToGas(gasUrl, {
        action: 'BATCH_SYNC',
        procedures: remainingProcedures.filter((p) => p.id !== procedureId),
      });
      return;
    }
    throw err;
  }
}

/**
 * Guarda todos los procedimientos quirúrgicos en Google Sheets
 */
export async function saveAllProceduresToGas(gasUrl: string, procedures: SurgicalProcedure[]): Promise<any> {
  try {
    return await postToGas(gasUrl, {
      action: 'SAVE_ALL_PROCEDURES',
      procedures,
    });
  } catch (err: any) {
    // Si la versión desplegada aún no tiene SAVE_ALL_PROCEDURES, recurrir a BATCH_SYNC
    if (err.message && (err.message.includes('Acción no reconocida') || err.message.includes('SAVE_ALL_PROCEDURES'))) {
      return await postToGas(gasUrl, {
        action: 'BATCH_SYNC',
        procedures,
      });
    }
    throw err;
  }
}

/**
 * Diagnóstico: prueba si la Web App de Google Apps Script reconoce y guarda procedimientos en la hoja 'Procedimientos'.
 */
export async function testProcedureSyncInGas(gasUrl: string): Promise<{
  success: boolean;
  message: string;
  isOutdated?: boolean;
  isCompatibleMode?: boolean;
  details?: string;
}> {
  // 1. Intentar método directo SAVE_PROCEDURE
  try {
    const testProc: SurgicalProcedure = {
      id: 'PRC-DIAG-TEST',
      code: 'DIAG-TEST',
      name: 'Procedimiento de Prueba Diagnóstica',
      category: 'Facial',
      basePrice: 1,
      durationMinutes: 1,
      requiresOR: false,
      doctorCommissionPercent: 0,
      isActive: false,
    };
    await postToGas(gasUrl, {
      action: 'SAVE_PROCEDURE',
      procedure: testProc,
    });
    // Limpiar el registro de prueba inmediatamente
    try {
      await deleteProcedureFromGas(gasUrl, 'PRC-DIAG-TEST');
    } catch {
      // Ignorar
    }
    return {
      success: true,
      message: '¡Verificación exitosa! Tu Google Apps Script está 100% actualizado con guardado individual y sincronización en tiempo real en la pestaña "Procedimientos".',
    };
  } catch (errDirect: any) {
    const directMsg = errDirect.message || '';

    // 2. Si SAVE_PROCEDURE no es reconocido, verificar si BATCH_SYNC y la lectura de procedimientos están operativos
    try {
      // Consultar GET_ALL para verificar que la hoja Procedimientos existe y devuelve datos
      const getAllData = await fetchAllFromGas(gasUrl);
      const existingProcs = getAllData.procedures || [];

      // Probar que BATCH_SYNC acepta y procesa el array de procedimientos
      await postToGas(gasUrl, {
        action: 'BATCH_SYNC',
        procedures: existingProcs,
      });

      return {
        success: true,
        isCompatibleMode: true,
        message: `¡Procedimientos Operativos y Conectados! La hoja "Procedimientos" está activa en Google Sheets (${existingProcs.length} procedimientos leídos y sincronizados). Tu catálogo se guardará automáticamente a través del canal compatible BATCH_SYNC.`,
        details:
          'Nota opcional: Si deseas habilitar también el comando SAVE_PROCEDURE directo, asegúrate de que al implementar en Google Apps Script selecciones "Nueva versión" en Administrar implementaciones (o copia la nueva URL si creaste una "Nueva implementación").',
      };
    } catch (errFallback: any) {
      const fallbackMsg = errFallback.message || '';
      return {
        success: false,
        isOutdated: true,
        message: `No se pudo sincronizar procedimientos en Google Sheets: ${directMsg || fallbackMsg}`,
        details:
          'Verifica que el código copiado de Code.gs esté pegado en Apps Script y publicado con una Nueva versión.',
      };
    }
  }
}

/**
 * Guarda o actualiza un plan de financiamiento en Google Sheets
 */
export async function saveFinancingPlanToGas(gasUrl: string, plan: FinancingPlan): Promise<void> {
  await postToGas(gasUrl, {
    action: 'SAVE_FINANCING_PLAN',
    plan,
  });
}

/**
 * Guarda la lista completa de planes de financiamiento en Google Sheets
 */
export async function saveAllFinancingPlansToGas(gasUrl: string, plans: FinancingPlan[]): Promise<void> {
  await postToGas(gasUrl, {
    action: 'SAVE_ALL_FINANCING_PLANS',
    plans,
  });
}

/**
 * Elimina un plan de financiamiento de Google Sheets
 */
export async function deleteFinancingPlanFromGas(gasUrl: string, planId: string): Promise<void> {
  await postToGas(gasUrl, {
    action: 'DELETE_FINANCING_PLAN',
    planId,
  });
}

/**
 * Sincronización masiva inicial: envía todos los datos locales para poblar Google Sheets
 */
export async function batchSyncToGas(
  gasUrl: string,
  data: {
    patients: Patient[];
    payments: Payment[];
    refunds: Refund[];
    users?: SystemUser[];
    crmEvents?: CRMEvent[];
    procedures?: SurgicalProcedure[];
    financingPlans?: FinancingPlan[];
  }
): Promise<void> {
  await postToGas(gasUrl, {
    action: 'BATCH_SYNC',
    ...data,
  });
}

/**
 * Envía la orden a Google Apps Script para eliminar la hoja obsoleta "Procedimiento" (Singular)
 * y consolidar todo en la hoja oficial "Procedimientos" (Plural).
 */
export async function cleanupProcedureSheetsInGas(gasUrl: string): Promise<{
  success: boolean;
  message: string;
  sheetsFound?: string[];
}> {
  const res = await postToGas(gasUrl, { action: 'CLEANUP_PROCEDURE_SHEETS' });
  return {
    success: true,
    message: res.message || 'Limpieza de hojas completada',
    sheetsFound: res.sheetsFound,
  };
}
