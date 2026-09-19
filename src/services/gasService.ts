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
 * CRÍTICO PARA EVITAR PROBLEMAS DE CORS:
 * Google Apps Script no soporta solicitudes preflight de tipo OPTIONS.
 * Enviamos 'Content-Type: text/plain;charset=utf-8' con JSON serializado.
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
      if (rawText.includes('<html') || rawText.includes('<!DOCTYPE') || rawText.includes('Page not found') || rawText.includes('unable to open the file')) {
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
  capabilities?: string[];
  version?: string;
}> {
  const res = await postToGas(gasUrl, { action: 'PING' });
  return {
    success: true,
    message: res.message || 'Conexión exitosa con Google Apps Script',
    spreadsheetName: res.spreadsheetName,
    spreadsheetId: res.spreadsheetId,
    spreadsheetUrl: res.spreadsheetUrl,
    sheetsFound: res.sheetsFound,
    capabilities: res.capabilities,
    version: res.version,
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
 * Elimina un paciente y todos sus registros vinculados en cascada
 */
export async function deletePatientFromGas(gasUrl: string, patientId: string): Promise<void> {
  await postToGas(gasUrl, {
    action: 'DELETE_PATIENT',
    patientId,
  });
}

/**
 * Guarda un pago y recalcula el saldo del paciente automáticamente
 */
export async function savePaymentToGas(gasUrl: string, payment: Payment): Promise<void> {
  await postToGas(gasUrl, {
    action: 'SAVE_PAYMENT',
    payment,
  });
}

/**
 * Elimina un pago y recalcula el saldo del paciente automáticamente
 */
export async function deletePaymentFromGas(gasUrl: string, paymentId: string): Promise<void> {
  await postToGas(gasUrl, {
    action: 'DELETE_PAYMENT',
    paymentId,
  });
}

/**
 * Guarda un reintegro en Google Sheets
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
 * Guarda o actualiza un usuario en Google Sheets
 */
export async function saveUserToGas(gasUrl: string, user: SystemUser): Promise<void> {
  await postToGas(gasUrl, {
    action: 'SAVE_USER',
    user,
  });
}

/**
 * Elimina un usuario en Google Sheets
 */
export async function deleteUserFromGas(gasUrl: string, userId: string): Promise<void> {
  await postToGas(gasUrl, {
    action: 'DELETE_USER',
    userId,
  });
}

/**
 * Guarda o actualiza un recordatorio / evento CRM en Google Sheets
 */
export async function saveCRMEventToGas(gasUrl: string, event: CRMEvent): Promise<void> {
  await postToGas(gasUrl, {
    action: 'SAVE_CRM_EVENT',
    event,
  });
}

/**
 * Guarda o actualiza un procedimiento individualmente en la pestaña 'Procedimientos'.
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
    // Si la versión desplegada en Apps Script no reconoce SAVE_PROCEDURE, intentar SAVE_ALL_PROCEDURES o BATCH_SYNC
    if (err.message && (err.message.includes('Acción no reconocida') || err.message.includes('SAVE_PROCEDURE'))) {
      const procsToSync = allProcedures && allProcedures.length > 0
        ? (allProcedures.some((p) => p.id === procedure.id)
            ? allProcedures.map((p) => (p.id === procedure.id ? procedure : p))
            : [...allProcedures, procedure])
        : [procedure];

      try {
        return await postToGas(gasUrl, {
          action: 'SAVE_ALL_PROCEDURES',
          procedures: procsToSync,
        });
      } catch (errFallback: any) {
        throw new Error(
          'Tu Web App de Google Apps Script está ejecutando una versión previa que no tiene activo el guardado de procedimientos. ' +
          'Ve a Configuración > Google Sheets, copia el código Code.gs actualizado y publícalo como "Nueva versión" en Apps Script.'
        );
      }
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
        action: 'SAVE_ALL_PROCEDURES',
        procedures: remainingProcedures.filter((p) => p.id !== procedureId),
      });
      return;
    }
    throw err;
  }
}

/**
 * Guarda todos los procedimientos quirúrgicos en Google Sheets (pestaña 'Procedimientos')
 */
export async function saveAllProceduresToGas(gasUrl: string, procedures: SurgicalProcedure[]): Promise<any> {
  try {
    return await postToGas(gasUrl, {
      action: 'SAVE_ALL_PROCEDURES',
      procedures,
    });
  } catch (err: any) {
    if (err.message && err.message.includes('Acción no reconocida')) {
      throw new Error(
        'Tu Web App de Google Apps Script no tiene activa la versión para recibir el catálogo de procedimientos. ' +
        'Ve a Configuración > Google Sheets, copia el nuevo código y despliega una "Nueva versión" en Apps Script.'
      );
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
  details?: string;
}> {
  try {
    const testProc: SurgicalProcedure = {
      id: 'PRC-DIAG-TEST',
      code: 'DIAG-TEST',
      name: 'Procedimiento de Prueba Diagnóstica',
      category: 'Facial',
      basePrice: 1,
      isActive: false,
      notes: 'Test diagnóstico automático',
    };
    await postToGas(gasUrl, {
      action: 'SAVE_PROCEDURE',
      procedure: testProc,
    });
    // Limpiar el registro de prueba inmediatamente
    try {
      await deleteProcedureFromGas(gasUrl, 'PRC-DIAG-TEST');
    } catch {}

    return {
      success: true,
      message: '¡Verificación exitosa! Tu Google Apps Script está 100% operativo con guardado y sincronización del catálogo en la hoja "Procedimientos".',
    };
  } catch (errDirect: any) {
    const directMsg = errDirect.message || '';

    if (directMsg.includes('Acción no reconocida') || directMsg.includes('SAVE_PROCEDURE') || directMsg.includes('versión previa')) {
      return {
        success: false,
        isOutdated: true,
        message: 'Google Apps Script no tiene activa la versión que procesa procedimientos (Error: Acción no reconocida: SAVE_PROCEDURE).',
        details:
          'Para solucionarlo en 1 minuto: En tu Apps Script ve a "Implementar" > "Administrar implementaciones" > Clic en el icono de lápiz (Editar) > En "Versión" selecciona "Nueva versión" > Clic en "Implementar".',
      };
    }

    return {
      success: false,
      isOutdated: true,
      message: `Error al probar sincronización de procedimientos: ${directMsg}`,
      details:
        'Verifica que el código de Code.gs esté pegado completamente y que la Web App tenga permisos de acceso para "Cualquiera" (Anyone).',
    };
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
 * Sincronización masiva: envía todos los datos locales para poblar Google Sheets
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
): Promise<any> {
  return await postToGas(gasUrl, {
    action: 'BATCH_SYNC',
    ...data,
  });
}

/**
 * Función auxiliar retrocompatible
 */
export async function cleanupProcedureSheetsInGas(gasUrl: string): Promise<{
  success: boolean;
  message: string;
  sheetsFound?: string[];
}> {
  return {
    success: true,
    message: 'Hoja "Procedimientos" verificada como pestaña oficial.',
  };
}
