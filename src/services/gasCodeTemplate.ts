/**
 * Plantilla de código para Google Apps Script (Code.gs)
 * Versión 3.5.0 - Catálogo Quirúrgico & Cobranza Unificada
 * Lista para copiar y pegar directamente en Extensiones > Apps Script
 */
export const CODE_GS_SOURCE = `/**
 * =========================================================================
 * DR. BELLEZA - SISTEMA DE COBRANZA & GESTIÓN MÉDICA
 * SCRIPT DE BASE DE DATOS PARA GOOGLE APPS SCRIPT (Code.gs)
 * VERSIÓN: 3.5.0 - CATÁLOGO QUIRÚRGICO UNIFICADO
 * =========================================================================
 */

var SCHEMA = {
  PACIENTES: {
    name: 'Pacientes',
    aliases: ['pacientes', 'paciente', 'patients', 'patient'],
    headers: [
      'ID Paciente', 'Nombre Completo', 'Teléfono / WhatsApp', 'DNI / Cédula',
      'Email', 'Ciudad', 'Campaña', 'Procedimiento', 'Doctor',
      'Costo Total ($)', 'Total Abonado ($)', 'Saldo Pendiente ($)',
      'Fecha Registro', 'Estado', 'Plan Financiamiento', 'Próximo Vencimiento',
      'Notas', 'Última Actualización'
    ]
  },
  ABONOS: {
    name: 'Abonos',
    aliases: ['abonos', 'abono', 'pagos', 'pago', 'payments', 'payment'],
    headers: [
      'ID Pago', 'ID Paciente', 'Nombre Paciente', 'Monto ($)', 'Fecha',
      'Método de Pago', 'Nro Referencia', 'Registrado Por', 'Notas', 'Creado En'
    ]
  },
  REINTEGROS: {
    name: 'Reintegros',
    aliases: ['reintegros', 'reintegro', 'devoluciones', 'devolucion', 'refunds', 'refund'],
    headers: [
      'ID Reintegro', 'ID Paciente', 'Nombre Paciente', 'Monto ($)', 'Fecha',
      'Motivo', 'Método Devolución', 'Nro Referencia', 'Registrado Por', 'Creado En'
    ]
  },
  USUARIOS: {
    name: 'Usuarios',
    aliases: ['usuarios', 'usuario', 'users', 'user'],
    headers: [
      'ID Usuario', 'Nombre Completo', 'Email', 'Rol', 'Teléfono',
      'Contraseña', 'Activo', 'Es Inmutable', 'Fecha Creación', 'Notas'
    ]
  },
  CRM: {
    name: 'Recordatorios_CRM',
    aliases: ['recordatorios_crm', 'recordatorios crm', 'recordatorioscrm', 'recordatorios', 'recordatorio', 'crm'],
    headers: [
      'ID Evento', 'ID Paciente', 'Nombre Paciente', 'Teléfono', 'Tipo',
      'Título', 'Descripción', 'Fecha Límite', 'Hora', 'Estado', 'Prioridad',
      'Monto ($)', 'Cuota', 'Procedimiento', 'Canal', 'Creado En'
    ]
  },
  PROCEDIMIENTOS: {
    name: 'Procedimientos',
    aliases: [
      'procedimientos', 'procedimiento', 'cirugias', 'cirugia',
      'catalogo', 'catalogo_quirurgico', 'catalogo quirurgico', 'procedures', 'procedure'
    ],
    headers: [
      'ID Procedimiento', 'Código', 'Nombre del Procedimiento', 'Categoría',
      'Precio Base ($)', 'Duración (min)', 'Requiere Quirófano',
      '% Comisión Médico', 'Estado', 'Observaciones'
    ]
  },
  PLANES: {
    name: 'Planes_Financiamiento',
    aliases: ['planes_financiamiento', 'planes financiamiento', 'planesdefinanciamiento', 'planes de financiamiento', 'planes', 'plan', 'financiamiento'],
    headers: [
      'ID Plan', 'Nombre', 'Meses', 'Frecuencia', 'Cuotas', 'Recargo (%)',
      'Anticipo (%)', 'Activo'
    ]
  }
};

function normalizarTexto(txt) {
  return String(txt || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[\\s_-]+/g, '');
}

/**
 * Busca una hoja por su definición o alias.
 * Si encuentra 'Procedimiento' (singular) y no existe 'Procedimientos', la renombra automáticamente.
 */
function buscarHoja(ss, tableDef) {
  if (!tableDef) return null;
  var exactSheet = ss.getSheetByName(tableDef.name);
  if (exactSheet) return exactSheet;

  var sheets = ss.getSheets();
  var targetNorm = normalizarTexto(tableDef.name);
  var aliasesNorm = (tableDef.aliases || []).map(normalizarTexto);

  for (var i = 0; i < sheets.length; i++) {
    var sheetNorm = normalizarTexto(sheets[i].getName());
    if (sheetNorm === targetNorm) return sheets[i];
    for (var j = 0; j < aliasesNorm.length; j++) {
      if (sheetNorm === aliasesNorm[j]) {
        // Auto-renombrar si es la hoja de procedimientos en singular
        if (tableDef.name === 'Procedimientos' && !ss.getSheetByName('Procedimientos')) {
          try {
            sheets[i].setName('Procedimientos');
          } catch (e) {}
        }
        return sheets[i];
      }
    }
  }
  return null;
}

function obtenerOCrearHoja(ss, tableDef) {
  var sheet = buscarHoja(ss, tableDef);
  if (!sheet) {
    sheet = ss.insertSheet(tableDef.name);
    sheet.appendRow(tableDef.headers);
    formatearEncabezado(sheet, tableDef.headers.length);
  }
  return sheet;
}

function formatearEncabezado(sheet, columnCount) {
  var headerRange = sheet.getRange(1, 1, 1, columnCount);
  headerRange.setBackground('#065f46');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontFamily('Arial');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);
}

function inicializarBaseDeDatos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  for (var key in SCHEMA) {
    obtenerOCrearHoja(ss, SCHEMA[key]);
  }
  sembrarDatosIniciales(ss);
  return { status: 'ok', message: 'Base de datos inicializada correctamente (v3.5.0)' };
}

function sembrarDatosIniciales(ss) {
  var userSheet = obtenerOCrearHoja(ss, SCHEMA.USUARIOS);
  if (userSheet && userSheet.getLastRow() <= 1) {
    userSheet.appendRow(['USR-SUPER-EDGAR', 'Edgar Morales', 'edgar@morales.com', 'super_admin', '+5491145678900', '12697670', 'true', 'true', '2026-01-01', 'Super Administrador Permanente']);
    userSheet.appendRow(['USR-101', 'Dr. Jorge Apelencia', 'jorge.apelencia@drbelleza.com', 'super_admin', '+5491145678900', 'jorge2026', 'true', 'false', '2026-01-15', 'Director Médico Titular']);
    userSheet.appendRow(['USR-102', 'Lic. Marcela Vega', 'marcela.vega@drbelleza.com', 'admin', '+5491145678901', 'marcela2026', 'true', 'false', '2026-02-01', 'Administración General']);
    userSheet.appendRow(['USR-105', 'Luciana Gómez', 'luciana.gomez@drbelleza.com', 'asistente', '+5491145678904', 'luciana2026', 'true', 'false', '2026-04-01', 'Secretaría de Consultorio']);
  }

  var procSheet = obtenerOCrearHoja(ss, SCHEMA.PROCEDIMIENTOS);
  if (procSheet && procSheet.getLastRow() <= 1) {
    var defaultProcs = [
      ['PRC-001', 'QX-RINO', 'Rinoplastia Ultrasónica Estructural', 'Facial', 3200, 180, 'SI', 65, 'Activo', 'Incluye tomografía postoperatoria y yeso'],
      ['PRC-002', 'QX-LIPO', 'Lipoescultura HD con Marcación', 'Corporal', 4500, 210, 'SI', 60, 'Activo', 'Incluye faja y drenajes linfáticos'],
      ['PRC-003', 'QX-MAMA', 'Mamoplastia de Aumento Dual-Plane', 'Corporal', 3800, 150, 'SI', 60, 'Activo', 'Implantes Mentor / Motiva microtexturados'],
      ['PRC-004', 'EST-BOTOX', 'Toxina Botulínica Full Face (Botox)', 'Medicina Estética', 350, 45, 'NO', 50, 'Activo', 'Frente, entrecejo y patas de gallo'],
      ['PRC-5348', 'ABD-481', 'Abdominoplastia', 'Corporal', 3800, 90, 'SI', 65, 'Activo', 'Plicatura y remodelación'],
      ['PRC-9615', 'ML-422', 'MELA', 'Corporal', 2400, 90, 'SI', 65, 'Activo', 'Miniextracción lipídica ambulatoria'],
      ['PRC-1028', 'LG-258', 'Lipoinyección Glútea', 'Corporal', 500, 90, 'SI', 65, 'Activo', 'Lipotransferencia glútea']
    ];
    procSheet.getRange(2, 1, defaultProcs.length, defaultProcs[0].length).setValues(defaultProcs);
  }

  var planSheet = obtenerOCrearHoja(ss, SCHEMA.PLANES);
  if (planSheet && planSheet.getLastRow() <= 1) {
    var defaultPlans = [
      ['PLAN-001', 'Plan 6 Meses - Mensual (Sin Interés)', 6, 'Mensual', 6, 0, 20, 'TRUE'],
      ['PLAN-002', 'Plan 12 Meses - Mensual (10% Interés)', 12, 'Mensual', 12, 10, 15, 'TRUE'],
      ['PLAN-003', 'Plan Quincenal 3 Meses (6 Cuotas)', 3, 'Quincenal', 6, 0, 25, 'TRUE'],
      ['PLAN-004', 'Plan Semanal 2 Meses (8 Cuotas)', 2, 'Semanal', 8, 0, 30, 'TRUE'],
      ['PLAN-005', 'Plan Flexible Personalizado', 6, 'Mensual', 6, 5, 20, 'TRUE']
    ];
    planSheet.getRange(2, 1, defaultPlans.length, defaultPlans[0].length).setValues(defaultPlans);
  }
}

/**
 * Endpoint GET: Trae datos o responde diagnósticos
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = (e && e.parameter && e.parameter.action) || 'PING';

  if (action === 'GET_ALL') {
    return responderJSON(obtenerTodosLosDatos(ss));
  }

  if (action === 'TEST_PROCEDURE') {
    var procSheet = buscarHoja(ss, SCHEMA.PROCEDIMIENTOS);
    var count = procSheet ? Math.max(0, procSheet.getLastRow() - 1) : 0;
    return responderJSON({
      status: 'ok',
      version: '3.5.0-UNIFIED',
      message: 'Hoja "Procedimientos" verificada y lista para recibir datos.',
      procedureSheetFound: !!procSheet,
      procedureCount: count,
      spreadsheetName: ss.getName()
    });
  }

  return responderJSON({
    status: 'ok',
    version: '3.5.0-UNIFIED',
    message: 'Servicio Web App Dr. Belleza activo (Hoja oficial: Procedimientos)',
    spreadsheetName: ss.getName(),
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    procedureSheetName: 'Procedimientos',
    sheetsFound: ss.getSheets().map(function(s) { return s.getName(); }),
    capabilities: [
      'procedures',
      'financing_plans',
      'crm_events',
      'batch_sync',
      'SAVE_PROCEDURE',
      'SAVE_ALL_PROCEDURES',
      'DELETE_PROCEDURE'
    ]
  });
}

/**
 * Endpoint POST: Procesa todas las operaciones de escritura con ScriptLock
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = false;
  try {
    try {
      hasLock = lock.tryLock(10000);
    } catch (eLock) {}

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    for (var key in SCHEMA) {
      if (!buscarHoja(ss, SCHEMA[key])) {
        inicializarBaseDeDatos();
        break;
      }
    }

    if (!e || !e.postData || !e.postData.contents) {
      return responderJSON({ status: 'error', message: 'Sin datos en la solicitud' });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    switch (action) {
      case 'PING':
        return responderJSON({
          status: 'ok',
          version: '3.5.0-UNIFIED',
          message: 'Conexión exitosa con Google Apps Script',
          spreadsheetName: ss.getName(),
          spreadsheetId: ss.getId(),
          spreadsheetUrl: ss.getUrl(),
          sheetsFound: ss.getSheets().map(function(s) { return s.getName(); }),
          capabilities: [
            'procedures',
            'financing_plans',
            'crm_events',
            'batch_sync',
            'SAVE_PROCEDURE',
            'SAVE_ALL_PROCEDURES',
            'DELETE_PROCEDURE'
          ]
        });

      case 'GET_ALL':
        return responderJSON(obtenerTodosLosDatos(ss));

      case 'SAVE_PATIENT':
        return responderJSON(guardarPaciente(ss, payload.patient));

      case 'DELETE_PATIENT':
        return responderJSON(borrarPacienteEnCascada(ss, payload.patientId));

      case 'SAVE_PAYMENT':
        return responderJSON(guardarPagoYActualizarSaldo(ss, payload.payment));

      case 'DELETE_PAYMENT':
        return responderJSON(borrarPagoYRecalcular(ss, payload.paymentId));

      case 'SAVE_REFUND':
        return responderJSON(guardarReintegro(ss, payload.refund));

      case 'DELETE_REFUND':
        return responderJSON(borrarReintegro(ss, payload.refundId));

      case 'SAVE_USER':
        return responderJSON(guardarUsuario(ss, payload.user));

      case 'DELETE_USER':
        return responderJSON(borrarUsuario(ss, payload.userId));

      case 'SAVE_CRM_EVENT':
        return responderJSON(guardarEventoCRM(ss, payload.event));

      case 'SAVE_PROCEDURE':
      case 'SAVE_SURGICAL_PROCEDURE':
      case 'SAVE_PROCEDURES':
        return responderJSON(guardarProcedimiento(ss, payload.procedure));

      case 'DELETE_PROCEDURE':
        return responderJSON(borrarProcedimiento(ss, payload.procedureId));

      case 'SAVE_ALL_PROCEDURES':
      case 'SYNC_PROCEDURES':
        return responderJSON(guardarTodosProcedimientos(ss, payload.procedures));

      case 'SAVE_FINANCING_PLAN':
        return responderJSON(guardarPlanFinanciamiento(ss, payload.plan));

      case 'SAVE_ALL_FINANCING_PLANS':
        return responderJSON(guardarTodosPlanes(ss, payload.plans));

      case 'DELETE_FINANCING_PLAN':
        return responderJSON(borrarPlanFinanciamiento(ss, payload.planId));

      case 'BATCH_SYNC':
      case 'SYNC_BATCH':
        return responderJSON(sincronizarMasivo(ss, payload));

      default:
        return responderJSON({ status: 'error', message: 'Acción no reconocida: ' + action });
    }
  } catch (error) {
    return responderJSON({ status: 'error', message: error.toString() });
  } finally {
    if (hasLock) {
      try {
        lock.releaseLock();
      } catch (eRelease) {}
    }
  }
}

function responderJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function obtenerTodosLosDatos(ss) {
  return {
    status: 'ok',
    version: '3.5.0-UNIFIED',
    patients: leerHojaComoObjetos(obtenerOCrearHoja(ss, SCHEMA.PACIENTES), mapearPacienteDesdeFila),
    payments: leerHojaComoObjetos(obtenerOCrearHoja(ss, SCHEMA.ABONOS), mapearPagoDesdeFila),
    refunds: leerHojaComoObjetos(obtenerOCrearHoja(ss, SCHEMA.REINTEGROS), mapearReintegroDesdeFila),
    users: leerHojaComoObjetos(obtenerOCrearHoja(ss, SCHEMA.USUARIOS), mapearUsuarioDesdeFila),
    crmEvents: leerHojaComoObjetos(obtenerOCrearHoja(ss, SCHEMA.CRM), mapearEventoCRMDesdeFila),
    procedures: leerHojaComoObjetos(obtenerOCrearHoja(ss, SCHEMA.PROCEDIMIENTOS), mapearProcedimientoDesdeFila),
    financingPlans: leerHojaComoObjetos(obtenerOCrearHoja(ss, SCHEMA.PLANES), mapearPlanDesdeFila),
    spreadsheetName: ss.getName(),
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl()
  };
}

function leerHojaComoObjetos(sheet, mapperFn) {
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var values = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (row[0] !== '' && row[0] !== null && row[0] !== undefined) {
      var item = mapperFn(row);
      if (item) list.push(item);
    }
  }
  return list;
}

function mapearPacienteDesdeFila(r) {
  return {
    id: String(r[0]),
    fullName: String(r[1] || ''),
    phone: String(r[2] || ''),
    idNumber: String(r[3] || ''),
    email: String(r[4] || ''),
    city: String(r[5] || ''),
    campaign: String(r[6] || ''),
    procedure: String(r[7] || ''),
    doctor: String(r[8] || 'Dr. Jorge Apelencia'),
    totalCost: parseFloat(String(r[9]).replace(/[^0-9.-]/g, '')) || 0,
    totalPaid: parseFloat(String(r[10]).replace(/[^0-9.-]/g, '')) || 0,
    balance: parseFloat(String(r[11]).replace(/[^0-9.-]/g, '')) || 0,
    registrationDate: formatearFecha(r[12]),
    status: String(r[13] || 'pending'),
    financingPlanName: String(r[14] || ''),
    nextPaymentDate: r[15] ? formatearFecha(r[15]) : undefined,
    notes: String(r[16] || '')
  };
}

function mapearPagoDesdeFila(r) {
  return {
    id: String(r[0]),
    patientId: String(r[1] || ''),
    patientName: String(r[2] || ''),
    amount: parseFloat(String(r[3]).replace(/[^0-9.-]/g, '')) || 0,
    date: formatearFecha(r[4]),
    paymentMethod: String(r[5] || 'Transferencia'),
    reference: String(r[6] || ''),
    registeredBy: String(r[7] || ''),
    notes: String(r[8] || ''),
    createdAt: String(r[9] || new Date().toISOString())
  };
}

function mapearReintegroDesdeFila(r) {
  return {
    id: String(r[0]),
    patientId: String(r[1] || ''),
    patientName: String(r[2] || ''),
    amount: parseFloat(String(r[3]).replace(/[^0-9.-]/g, '')) || 0,
    date: formatearFecha(r[4]),
    reason: String(r[5] || ''),
    refundMethod: String(r[6] || 'Transferencia'),
    reference: String(r[7] || ''),
    registeredBy: String(r[8] || ''),
    createdAt: String(r[9] || new Date().toISOString())
  };
}

function mapearUsuarioDesdeFila(r) {
  return {
    id: String(r[0]),
    fullName: String(r[1] || ''),
    email: String(r[2] || ''),
    role: String(r[3] || 'asistente'),
    phone: String(r[4] || ''),
    password: String(r[5] || ''),
    isActive: String(r[6]).toLowerCase() === 'true',
    isImmutable: String(r[7]).toLowerCase() === 'true',
    createdAt: formatearFecha(r[8]),
    notes: String(r[9] || '')
  };
}

function mapearEventoCRMDesdeFila(r) {
  return {
    id: String(r[0]),
    patientId: String(r[1] || ''),
    patientName: String(r[2] || ''),
    patientPhone: String(r[3] || ''),
    type: String(r[4] || 'notificacion_cobro'),
    title: String(r[5] || ''),
    description: String(r[6] || ''),
    dueDate: formatearFecha(r[7]),
    dueTime: String(r[8] || '09:00'),
    status: String(r[9] || 'pending'),
    priority: String(r[10] || 'media'),
    amount: r[11] ? parseFloat(String(r[11]).replace(/[^0-9.-]/g, '')) : undefined,
    installmentNumber: r[12] ? parseInt(r[12]) : undefined,
    procedure: String(r[13] || ''),
    channel: String(r[14] || 'whatsapp'),
    createdAt: String(r[15] || new Date().toISOString())
  };
}

/**
 * Mapea procedimientos quirúrgicos soportando tanto el formato canónico de 10 columnas
 * como el formato legado de 5 columnas sin corromper ni mezclar los campos.
 */
function mapearProcedimientoDesdeFila(r) {
  if (!r || !r[0]) return null;

  // Formato canónico (10 columnas): ID, Código, Nombre, Categoría, Precio, Duración, Quirófano, Comisión, Estado, Observaciones
  if (r.length >= 6) {
    var rawActive = String(r[8] || '').toLowerCase().trim();
    var isActive = rawActive !== 'false' && rawActive !== 'inactivo' && rawActive !== 'no' && rawActive !== '0';
    var rawOR = String(r[6] || '').toLowerCase().trim();
    var requiresOR = rawOR === 'si' || rawOR === 'true' || rawOR === 'sí' || rawOR === '1';

    return {
      id: String(r[0]).trim(),
      code: String(r[1] || r[0]).trim(),
      name: String(r[2] || '').trim(),
      category: String(r[3] || 'Facial').trim(),
      basePrice: parseFloat(String(r[4]).replace(/[^0-9.-]/g, '')) || 0,
      durationMinutes: parseInt(r[5]) || 60,
      requiresOR: requiresOR,
      doctorCommissionPercent: parseFloat(String(r[7]).replace(/[^0-9.-]/g, '')) || 65,
      isActive: isActive,
      notes: String(r[9] || '').trim()
    };
  }

  // Formato legado (5 columnas): Código, Categoría, Nombre, Precio, Observaciones
  var code = String(r[0] || '').trim();
  return {
    id: code,
    code: code,
    category: String(r[1] || 'Facial').trim(),
    name: String(r[2] || '').trim(),
    basePrice: parseFloat(String(r[3]).replace(/[^0-9.-]/g, '')) || 0,
    durationMinutes: 60,
    requiresOR: false,
    doctorCommissionPercent: 65,
    isActive: true,
    notes: String(r[4] || '').trim()
  };
}

function mapearPlanDesdeFila(r) {
  return {
    id: String(r[0]),
    name: String(r[1] || ''),
    months: Number(r[2]) || 6,
    frequency: String(r[3] || 'Mensual'),
    installmentsCount: Number(r[4]) || 6,
    interestRatePercent: Number(r[5]) || 0,
    downPaymentPercent: Number(r[6]) || 20,
    isActive: String(r[7]).toLowerCase() === 'true'
  };
}

function formatearFecha(valor) {
  if (!valor) return '';
  if (valor instanceof Date) {
    var y = valor.getFullYear();
    var m = ('0' + (valor.getMonth() + 1)).slice(-2);
    var d = ('0' + valor.getDate()).slice(-2);
    return y + '-' + m + '-' + d;
  }
  return String(valor).split('T')[0];
}

function guardarPaciente(ss, p) {
  if (!p || !p.id) return { status: 'error', message: 'Datos de paciente inválidos' };
  var sheet = obtenerOCrearHoja(ss, SCHEMA.PACIENTES);
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(p.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowData = [
    p.id, p.fullName, p.phone, p.idNumber, p.email, p.city, p.campaign,
    p.procedure, p.doctor || 'Dr. Jorge Apelencia', p.totalCost, p.totalPaid,
    p.balance, p.registrationDate || new Date().toISOString(), p.status || 'pending',
    p.financingPlanName || '', p.nextPaymentDate || '', p.notes || '',
    new Date().toISOString()
  ];

  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { status: 'ok', message: 'Paciente guardado' };
}

function borrarPacienteEnCascada(ss, patientId) {
  var patSheet = obtenerOCrearHoja(ss, SCHEMA.PACIENTES);
  var patValues = patSheet.getDataRange().getValues();
  for (var i = 1; i < patValues.length; i++) {
    if (String(patValues[i][0]) === String(patientId)) {
      patSheet.deleteRow(i + 1);
      break;
    }
  }

  var paySheet = obtenerOCrearHoja(ss, SCHEMA.ABONOS);
  var payValues = paySheet.getDataRange().getValues();
  for (var j = payValues.length - 1; j >= 1; j--) {
    if (String(payValues[j][1]) === String(patientId)) {
      paySheet.deleteRow(j + 1);
    }
  }

  var refSheet = obtenerOCrearHoja(ss, SCHEMA.REINTEGROS);
  var refValues = refSheet.getDataRange().getValues();
  for (var k = refValues.length - 1; k >= 1; k--) {
    if (String(refValues[k][1]) === String(patientId)) {
      refSheet.deleteRow(k + 1);
    }
  }

  var crmSheet = obtenerOCrearHoja(ss, SCHEMA.CRM);
  var crmValues = crmSheet.getDataRange().getValues();
  for (var m = crmValues.length - 1; m >= 1; m--) {
    if (String(crmValues[m][1]) === String(patientId)) {
      crmSheet.deleteRow(m + 1);
    }
  }

  return { status: 'ok', message: 'Paciente y registros asociados eliminados en cascada' };
}

function guardarPagoYActualizarSaldo(ss, p) {
  var paySheet = obtenerOCrearHoja(ss, SCHEMA.ABONOS);
  paySheet.appendRow([
    p.id, p.patientId, p.patientName, p.amount, p.date,
    p.paymentMethod, p.reference || '', p.registeredBy || '',
    p.notes || '', p.createdAt || new Date().toISOString()
  ]);

  var patSheet = obtenerOCrearHoja(ss, SCHEMA.PACIENTES);
  var patValues = patSheet.getDataRange().getValues();
  for (var i = 1; i < patValues.length; i++) {
    if (String(patValues[i][0]) === String(p.patientId)) {
      var totalCost = Number(patValues[i][9]) || 0;
      var totalPaid = (Number(patValues[i][10]) || 0) + Number(p.amount);
      var balance = totalCost - totalPaid;
      var status = balance <= 0 ? 'paid' : 'pending';
      patSheet.getRange(i + 1, 11).setValue(totalPaid);
      patSheet.getRange(i + 1, 12).setValue(balance);
      patSheet.getRange(i + 1, 14).setValue(status);
      patSheet.getRange(i + 1, 18).setValue(new Date().toISOString());
      break;
    }
  }
  return { status: 'ok', message: 'Pago registrado y saldo actualizado' };
}

function borrarPagoYRecalcular(ss, paymentId) {
  var paySheet = obtenerOCrearHoja(ss, SCHEMA.ABONOS);
  var payValues = paySheet.getDataRange().getValues();
  var deletedPatientId = null;
  var deletedAmount = 0;

  for (var i = 1; i < payValues.length; i++) {
    if (String(payValues[i][0]) === String(paymentId)) {
      deletedPatientId = payValues[i][1];
      deletedAmount = Number(payValues[i][3]) || 0;
      paySheet.deleteRow(i + 1);
      break;
    }
  }

  if (deletedPatientId) {
    var patSheet = obtenerOCrearHoja(ss, SCHEMA.PACIENTES);
    var patValues = patSheet.getDataRange().getValues();
    for (var j = 1; j < patValues.length; j++) {
      if (String(patValues[j][0]) === String(deletedPatientId)) {
        var totalCost = Number(patValues[j][9]) || 0;
        var totalPaid = Math.max(0, (Number(patValues[j][10]) || 0) - deletedAmount);
        var balance = totalCost - totalPaid;
        var status = balance <= 0 ? 'paid' : 'pending';
        patSheet.getRange(j + 1, 11).setValue(totalPaid);
        patSheet.getRange(j + 1, 12).setValue(balance);
        patSheet.getRange(j + 1, 14).setValue(status);
        patSheet.getRange(j + 1, 18).setValue(new Date().toISOString());
        break;
      }
    }
  }
  return { status: 'ok', message: 'Pago eliminado y saldo recalculado' };
}

function guardarReintegro(ss, r) {
  var refSheet = obtenerOCrearHoja(ss, SCHEMA.REINTEGROS);
  refSheet.appendRow([
    r.id, r.patientId, r.patientName, r.amount, r.date,
    r.reason, r.refundMethod, r.reference || '', r.registeredBy || '',
    r.createdAt || new Date().toISOString()
  ]);

  var patSheet = obtenerOCrearHoja(ss, SCHEMA.PACIENTES);
  var patValues = patSheet.getDataRange().getValues();
  for (var i = 1; i < patValues.length; i++) {
    if (String(patValues[i][0]) === String(r.patientId)) {
      var totalCost = Number(patValues[i][9]) || 0;
      var totalPaid = Math.max(0, (Number(patValues[i][10]) || 0) - Number(r.amount));
      var balance = totalCost - totalPaid;
      var status = balance <= 0 ? 'paid' : 'pending';
      patSheet.getRange(i + 1, 11).setValue(totalPaid);
      patSheet.getRange(i + 1, 12).setValue(balance);
      patSheet.getRange(i + 1, 14).setValue(status);
      patSheet.getRange(i + 1, 18).setValue(new Date().toISOString());
      break;
    }
  }
  return { status: 'ok', message: 'Reintegro registrado' };
}

function borrarReintegro(ss, refundId) {
  var refSheet = obtenerOCrearHoja(ss, SCHEMA.REINTEGROS);
  var refValues = refSheet.getDataRange().getValues();
  for (var i = 1; i < refValues.length; i++) {
    if (String(refValues[i][0]) === String(refundId)) {
      refSheet.deleteRow(i + 1);
      return { status: 'ok', message: 'Reintegro eliminado' };
    }
  }
  return { status: 'ok', message: 'Reintegro no encontrado' };
}

function guardarUsuario(ss, u) {
  var sheet = obtenerOCrearHoja(ss, SCHEMA.USUARIOS);
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(u.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowData = [
    u.id, u.fullName, u.email, u.role, u.phone || '',
    u.password || '', u.isActive !== false ? 'true' : 'false',
    u.isImmutable ? 'true' : 'false', u.createdAt || new Date().toISOString(),
    u.notes || ''
  ];

  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { status: 'ok', message: 'Usuario guardado' };
}

function borrarUsuario(ss, userId) {
  var sheet = obtenerOCrearHoja(ss, SCHEMA.USUARIOS);
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(userId)) {
      sheet.deleteRow(i + 1);
      return { status: 'ok', message: 'Usuario eliminado' };
    }
  }
  return { status: 'ok', message: 'Usuario no encontrado' };
}

function guardarEventoCRM(ss, ev) {
  var sheet = obtenerOCrearHoja(ss, SCHEMA.CRM);
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(ev.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowData = [
    ev.id, ev.patientId, ev.patientName, ev.patientPhone, ev.type,
    ev.title, ev.description, ev.dueDate,
    ev.dueTime || '09:00', ev.status, ev.priority, ev.amount || '',
    ev.installmentNumber || '', ev.procedure || '', ev.channel || 'whatsapp',
    ev.createdAt || new Date().toISOString()
  ];

  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { status: 'ok', message: 'Evento CRM guardado' };
}

/**
 * Guarda o actualiza un procedimiento individualmente en la hoja 'Procedimientos'.
 * Localiza la fila por ID, por Código o por Nombre.
 */
function guardarProcedimiento(ss, proc) {
  if (!proc) return { status: 'error', message: 'Procedimiento no proporcionado' };
  var sheet = obtenerOCrearHoja(ss, SCHEMA.PROCEDIMIENTOS);

  // Asegurar encabezados
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SCHEMA.PROCEDIMIENTOS.headers);
    formatearEncabezado(sheet, SCHEMA.PROCEDIMIENTOS.headers.length);
  }

  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;

  var targetId = String(proc.id || '').trim().toUpperCase();
  var targetCode = String(proc.code || '').trim().toUpperCase();
  var targetName = normalizarTexto(proc.name);

  for (var i = 1; i < values.length; i++) {
    var rowId = String(values[i][0] || '').trim().toUpperCase();
    var rowCode = String(values[i][1] || values[i][0] || '').trim().toUpperCase();
    var rowName = normalizarTexto(values[i][2]);

    if (
      (targetId && rowId === targetId) ||
      (targetCode && (rowCode === targetCode || rowId === targetCode)) ||
      (targetName && rowName === targetName)
    ) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowData = [
    proc.id || ('PRC-' + (proc.code || Math.floor(1000 + Math.random() * 9000))),
    proc.code || proc.id || '',
    proc.name || '',
    proc.category || 'Facial',
    Number(proc.basePrice) || 0,
    Number(proc.durationMinutes) || 60,
    proc.requiresOR !== false ? 'SI' : 'NO',
    Number(proc.doctorCommissionPercent) || 65,
    proc.isActive !== false ? 'Activo' : 'Inactivo',
    proc.notes || ''
  ];

  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { status: 'ok', message: 'Procedimiento guardado en hoja ' + sheet.getName(), sheetName: sheet.getName() };
}

/**
 * Elimina un procedimiento buscando por ID o por Código
 */
function borrarProcedimiento(ss, procId) {
  var sheet = obtenerOCrearHoja(ss, SCHEMA.PROCEDIMIENTOS);
  var values = sheet.getDataRange().getValues();
  var target = String(procId || '').trim().toUpperCase();

  for (var i = 1; i < values.length; i++) {
    var rowId = String(values[i][0] || '').trim().toUpperCase();
    var rowCode = String(values[i][1] || '').trim().toUpperCase();
    if (rowId === target || rowCode === target) {
      sheet.deleteRow(i + 1);
      return { status: 'ok', message: 'Procedimiento eliminado de la hoja' };
    }
  }
  return { status: 'ok', message: 'Procedimiento no encontrado en la hoja' };
}

/**
 * Guarda o actualiza todo el catálogo de procedimientos en una sola operación atómica.
 * No utiliza clearContents() seguido de appendRow() para evitar filas vacías desfasadas.
 */
function guardarTodosProcedimientos(ss, proceduresList) {
  var procSheet = obtenerOCrearHoja(ss, SCHEMA.PROCEDIMIENTOS);
  var headers = SCHEMA.PROCEDIMIENTOS.headers;

  // Escribir encabezado en Fila 1
  procSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatearEncabezado(procSheet, headers.length);

  var totalProcs = Array.isArray(proceduresList) ? proceduresList.length : 0;
  if (totalProcs > 0) {
    var rows = proceduresList.map(function(pr) {
      return [
        pr.id || ('PRC-' + (pr.code || Math.floor(1000 + Math.random() * 9000))),
        pr.code || pr.id || '',
        pr.name || '',
        pr.category || 'Facial',
        Number(pr.basePrice) || 0,
        Number(pr.durationMinutes) || 60,
        pr.requiresOR !== false ? 'SI' : 'NO',
        Number(pr.doctorCommissionPercent) || 65,
        pr.isActive !== false ? 'Activo' : 'Inactivo',
        pr.notes || ''
      ];
    });
    procSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  // Limpiar cualquier fila residual que haya quedado abajo
  var lastRow = procSheet.getLastRow();
  if (lastRow > 1 + totalProcs) {
    procSheet.getRange(2 + totalProcs, 1, lastRow - (1 + totalProcs), headers.length).clearContent();
  }

  return {
    status: 'ok',
    message: 'Catálogo de procedimientos sincronizado (' + totalProcs + ' procedimientos)',
    sheetName: procSheet.getName()
  };
}

function guardarPlanFinanciamiento(ss, plan) {
  var sheet = obtenerOCrearHoja(ss, SCHEMA.PLANES);
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(plan.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowData = [
    plan.id,
    plan.name || '',
    Number(plan.months) || 6,
    plan.frequency || 'Mensual',
    Number(plan.installmentsCount) || 6,
    Number(plan.interestRatePercent) || 0,
    Number(plan.downPaymentPercent) || 20,
    plan.isActive !== false ? 'TRUE' : 'FALSE'
  ];

  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { status: 'ok', message: 'Plan de financiamiento guardado' };
}

function borrarPlanFinanciamiento(ss, planId) {
  var sheet = obtenerOCrearHoja(ss, SCHEMA.PLANES);
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(planId)) {
      sheet.deleteRow(i + 1);
      return { status: 'ok', message: 'Plan eliminado' };
    }
  }
  return { status: 'ok', message: 'Plan no encontrado' };
}

function guardarTodosPlanes(ss, planesList) {
  var planSheet = obtenerOCrearHoja(ss, SCHEMA.PLANES);
  var headers = SCHEMA.PLANES.headers;
  planSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatearEncabezado(planSheet, headers.length);

  var total = Array.isArray(planesList) ? planesList.length : 0;
  if (total > 0) {
    var rows = planesList.map(function(pl) {
      return [
        pl.id,
        pl.name || '',
        Number(pl.months) || 6,
        pl.frequency || 'Mensual',
        Number(pl.installmentsCount) || 6,
        Number(pl.interestRatePercent) || 0,
        Number(pl.downPaymentPercent) || 20,
        pl.isActive !== false ? 'TRUE' : 'FALSE'
      ];
    });
    planSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  var lastRow = planSheet.getLastRow();
  if (lastRow > 1 + total) {
    planSheet.getRange(2 + total, 1, lastRow - (1 + total), headers.length).clearContent();
  }

  return { status: 'ok', message: 'Planes de financiamiento actualizados (' + total + ')' };
}

/**
 * Sincronización masiva de todas las colecciones del sistema
 */
function sincronizarMasivo(ss, data) {
  if (data.patients && Array.isArray(data.patients)) {
    var patSheet = obtenerOCrearHoja(ss, SCHEMA.PACIENTES);
    var patHeaders = SCHEMA.PACIENTES.headers;
    patSheet.getRange(1, 1, 1, patHeaders.length).setValues([patHeaders]);
    formatearEncabezado(patSheet, patHeaders.length);
    data.patients.forEach(function(p) { guardarPaciente(ss, p); });
  }

  if (data.payments && Array.isArray(data.payments)) {
    var paySheet = obtenerOCrearHoja(ss, SCHEMA.ABONOS);
    var payHeaders = SCHEMA.ABONOS.headers;
    paySheet.getRange(1, 1, 1, payHeaders.length).setValues([payHeaders]);
    formatearEncabezado(paySheet, payHeaders.length);
    data.payments.forEach(function(p) {
      paySheet.appendRow([
        p.id, p.patientId, p.patientName, p.amount, p.date,
        p.paymentMethod, p.reference || '', p.registeredBy || '',
        p.notes || '', p.createdAt || new Date().toISOString()
      ]);
    });
  }

  if (data.refunds && Array.isArray(data.refunds)) {
    var refSheet = obtenerOCrearHoja(ss, SCHEMA.REINTEGROS);
    var refHeaders = SCHEMA.REINTEGROS.headers;
    refSheet.getRange(1, 1, 1, refHeaders.length).setValues([refHeaders]);
    formatearEncabezado(refSheet, refHeaders.length);
    data.refunds.forEach(function(r) {
      refSheet.appendRow([
        r.id, r.patientId, r.patientName, r.amount, r.date,
        r.reason, r.refundMethod, r.reference || '', r.registeredBy || '',
        r.createdAt || new Date().toISOString()
      ]);
    });
  }

  if (data.users && Array.isArray(data.users)) {
    var usrSheet = obtenerOCrearHoja(ss, SCHEMA.USUARIOS);
    var usrHeaders = SCHEMA.USUARIOS.headers;
    usrSheet.getRange(1, 1, 1, usrHeaders.length).setValues([usrHeaders]);
    formatearEncabezado(usrSheet, usrHeaders.length);
    data.users.forEach(function(u) { guardarUsuario(ss, u); });
  }

  if (data.crmEvents && Array.isArray(data.crmEvents)) {
    var crmSheet = obtenerOCrearHoja(ss, SCHEMA.CRM);
    var crmHeaders = SCHEMA.CRM.headers;
    crmSheet.getRange(1, 1, 1, crmHeaders.length).setValues([crmHeaders]);
    formatearEncabezado(crmSheet, crmHeaders.length);
    data.crmEvents.forEach(function(ev) { guardarEventoCRM(ss, ev); });
  }

  // Sincronización oficial del Catálogo Quirúrgico (Procedimientos)
  var procsList = data.procedures || data.procedimientos || data.surgicalProcedures;
  if (procsList && Array.isArray(procsList)) {
    guardarTodosProcedimientos(ss, procsList);
  }

  if (data.financingPlans && Array.isArray(data.financingPlans)) {
    guardarTodosPlanes(ss, data.financingPlans);
  }

  return { status: 'ok', message: 'Sincronización masiva completada exitosamente' };
}
`;
