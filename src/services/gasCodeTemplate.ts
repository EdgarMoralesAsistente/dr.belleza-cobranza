/**
 * Plantilla de código para Google Apps Script (Code.gs)
 * Lista para copiar y pegar directamente desde la interfaz de la Web App
 */
export const CODE_GS_SOURCE = `/**
 * =========================================================================
 * DR. BELLEZA - SISTEMA DE COBRANZA & GESTIÓN MÉDICA
 * SCRIPT DE BASE DE DATOS PARA GOOGLE APPS SCRIPT (Code.gs)
 * =========================================================================
 */

var SCHEMA = {
  PACIENTES: {
    name: 'Pacientes',
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
    headers: [
      'ID Pago', 'ID Paciente', 'Nombre Paciente', 'Monto ($)', 'Fecha',
      'Método de Pago', 'Nro Referencia', 'Registrado Por', 'Notas', 'Creado En'
    ]
  },
  REINTEGROS: {
    name: 'Reintegros',
    headers: [
      'ID Reintegro', 'ID Paciente', 'Nombre Paciente', 'Monto ($)', 'Fecha',
      'Motivo', 'Método Devolución', 'Nro Referencia', 'Registrado Por', 'Creado En'
    ]
  },
  USUARIOS: {
    name: 'Usuarios',
    headers: [
      'ID Usuario', 'Nombre Completo', 'Email', 'Rol', 'Teléfono',
      'Contraseña', 'Activo', 'Es Inmutable', 'Fecha Creación', 'Notas'
    ]
  },
  CRM: {
    name: 'Recordatorios_CRM',
    headers: [
      'ID Evento', 'ID Paciente', 'Nombre Paciente', 'Teléfono', 'Tipo',
      'Título', 'Descripción', 'Fecha Límite', 'Hora', 'Estado', 'Prioridad',
      'Monto ($)', 'Cuota', 'Procedimiento', 'Canal', 'Creado En'
    ]
  },
  PROCEDIMIENTOS: {
    name: 'Procedimientos',
    headers: [
      'ID Procedimiento', 'Código', 'Nombre', 'Categoría', 'Precio Base ($)',
      'Duración (min)', 'Requiere Quirófano', 'Comisión Doctor (%)', 'Activo'
    ]
  },
  PLANES: {
    name: 'Planes_Financiamiento',
    headers: [
      'ID Plan', 'Nombre', 'Meses', 'Frecuencia', 'Cuotas', 'Recargo (%)',
      'Anticipo (%)', 'Activo'
    ]
  }
};

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏥 Dr. Belleza')
    .addItem('🚀 Inicializar / Crear Tablas Automáticamente', 'inicializarBaseDeDatos')
    .addItem('🔄 Reparar Encabezados y Formato', 'repararEncabezados')
    .addToUi();
}

function inicializarBaseDeDatos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  for (var key in SCHEMA) {
    var table = SCHEMA[key];
    var sheet = ss.getSheetByName(table.name);
    if (!sheet) {
      sheet = ss.insertSheet(table.name);
    }
    var lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.appendRow(table.headers);
    }
    formatearEncabezado(sheet, table.headers.length);
  }

  try {
    var defaultSheet1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
    if (defaultSheet1 && ss.getSheets().length > 1) {
      ss.deleteSheet(defaultSheet1);
    }
  } catch (e) {}

  sembrarDatosIniciales(ss);
  return { status: 'ok', message: 'Tablas inicializadas correctamente' };
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

function repararEncabezados() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  for (var key in SCHEMA) {
    var table = SCHEMA[key];
    var sheet = ss.getSheetByName(table.name);
    if (sheet) {
      sheet.getRange(1, 1, 1, table.headers.length).setValues([table.headers]);
      formatearEncabezado(sheet, table.headers.length);
    }
  }
}

function sembrarDatosIniciales(ss) {
  var userSheet = ss.getSheetByName(SCHEMA.USUARIOS.name);
  if (userSheet && userSheet.getLastRow() <= 1) {
    userSheet.appendRow(['USR-SUPER-EDGAR', 'Edgar Morales', 'edgar@morales.com', 'super_admin', '+5491145678900', '12697670', 'true', 'true', '2026-01-01', 'Super Administrador Permanente']);
    userSheet.appendRow(['USR-101', 'Dr. Jorge Apelencia', 'jorge.apelencia@drbelleza.com', 'super_admin', '+5491145678900', 'jorge2026', 'true', 'false', '2026-01-15', 'Director Médico Titular']);
    userSheet.appendRow(['USR-102', 'Lic. Marcela Vega', 'marcela.vega@drbelleza.com', 'admin', '+5491145678901', 'marcela2026', 'true', 'false', '2026-02-01', 'Administración General']);
    userSheet.appendRow(['USR-105', 'Luciana Gómez', 'luciana.gomez@drbelleza.com', 'asistente', '+5491145678904', 'luciana2026', 'true', 'false', '2026-04-01', 'Secretaría de Consultorio']);
  }

  var procSheet = ss.getSheetByName(SCHEMA.PROCEDIMIENTOS.name);
  if (procSheet && procSheet.getLastRow() <= 1) {
    procSheet.appendRow(['PRC-001', 'QX-RINO', 'Rinoplastia Ultrasónica Estructural', 'Facial', 3200, 180, 'true', 65, 'true']);
    procSheet.appendRow(['PRC-002', 'QX-LIPO', 'Lipoescultura HD con Marcación', 'Corporal', 4500, 210, 'true', 60, 'true']);
  }

  var planSheet = ss.getSheetByName(SCHEMA.PLANES.name);
  if (planSheet && planSheet.getLastRow() <= 1) {
    planSheet.appendRow(['PLAN-001', 'Plan 6 Meses - Mensual (Sin Interés)', 6, 'Mensual', 6, 0, 20, 'true']);
    planSheet.appendRow(['PLAN-006', 'Pago Contado / En Una Sola Cuota', 1, 'Mensual', 1, 0, 100, 'true']);
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = (e && e.parameter && e.parameter.action) || 'PING';
  if (action === 'GET_ALL') {
    return responderJSON(obtenerTodosLosDatos(ss));
  }
  return responderJSON({
    status: 'ok',
    message: 'Servicio Web App Dr. Belleza activo',
    spreadsheetName: ss.getName(),
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl()
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    for (var key in SCHEMA) {
      if (!ss.getSheetByName(SCHEMA[key].name)) {
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
          message: 'Conexión exitosa con Google Apps Script',
          spreadsheetName: ss.getName(),
          spreadsheetId: ss.getId(),
          spreadsheetUrl: ss.getUrl(),
          sheetsFound: ss.getSheets().map(function(s) { return s.getName(); })
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

      case 'BATCH_SYNC':
        return responderJSON(sincronizarMasivo(ss, payload));

      default:
        return responderJSON({ status: 'error', message: 'Acción no reconocida: ' + action });
    }
  } catch (error) {
    return responderJSON({ status: 'error', message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function responderJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function obtenerTodosLosDatos(ss) {
  return {
    status: 'ok',
    patients: leerHojaComoObjetos(ss.getSheetByName(SCHEMA.PACIENTES.name), mapearPacienteDesdeFila),
    payments: leerHojaComoObjetos(ss.getSheetByName(SCHEMA.ABONOS.name), mapearPagoDesdeFila),
    refunds: leerHojaComoObjetos(ss.getSheetByName(SCHEMA.REINTEGROS.name), mapearReintegroDesdeFila),
    users: leerHojaComoObjetos(ss.getSheetByName(SCHEMA.USUARIOS.name), mapearUsuarioDesdeFila),
    crmEvents: leerHojaComoObjetos(ss.getSheetByName(SCHEMA.CRM.name), mapearEventoCRMDesdeFila),
    procedures: leerHojaComoObjetos(ss.getSheetByName(SCHEMA.PROCEDIMIENTOS.name), mapearProcedimientoDesdeFila),
    financingPlans: leerHojaComoObjetos(ss.getSheetByName(SCHEMA.PLANES.name), mapearPlanDesdeFila),
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
    totalCost: Number(r[9]) || 0,
    totalPaid: Number(r[10]) || 0,
    balance: Number(r[11]) || 0,
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
    amount: Number(r[3]) || 0,
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
    amount: Number(r[3]) || 0,
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
    amount: r[11] ? Number(r[11]) : undefined,
    installmentNumber: r[12] ? Number(r[12]) : undefined,
    procedure: String(r[13] || ''),
    channel: String(r[14] || 'whatsapp'),
    createdAt: String(r[15] || new Date().toISOString())
  };
}

function mapearProcedimientoDesdeFila(r) {
  return {
    id: String(r[0]),
    code: String(r[1] || ''),
    name: String(r[2] || ''),
    category: String(r[3] || 'Facial'),
    basePrice: Number(r[4]) || 0,
    durationMinutes: Number(r[5]) || 60,
    requiresOR: String(r[6]).toLowerCase() === 'true',
    doctorCommissionPercent: Number(r[7]) || 50,
    isActive: String(r[8]).toLowerCase() === 'true'
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

function guardarPaciente(ss, patient) {
  var sheet = ss.getSheetByName(SCHEMA.PACIENTES.name);
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(patient.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowData = [
    patient.id,
    patient.fullName,
    patient.phone || '',
    patient.idNumber || '',
    patient.email || '',
    patient.city || '',
    patient.campaign || '',
    patient.procedure || '',
    patient.doctor || 'Dr. Jorge Apelencia',
    patient.totalCost || 0,
    patient.totalPaid || 0,
    patient.balance !== undefined ? patient.balance : Math.max(0, (patient.totalCost || 0) - (patient.totalPaid || 0)),
    patient.registrationDate || formatearFecha(new Date()),
    patient.status || (patient.balance <= 0 ? 'paid' : 'pending'),
    patient.financingPlanName || '',
    patient.nextPaymentDate || '',
    patient.notes || '',
    new Date().toISOString()
  ];

  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { status: 'ok', message: 'Paciente guardado exitosamente', id: patient.id };
}

function borrarPacienteEnCascada(ss, patientId) {
  var idStr = String(patientId);
  borrarFilasDondeColumnaSea(ss.getSheetByName(SCHEMA.PACIENTES.name), 0, idStr);
  var deletedPayments = borrarFilasDondeColumnaSea(ss.getSheetByName(SCHEMA.ABONOS.name), 1, idStr);
  var deletedRefunds = borrarFilasDondeColumnaSea(ss.getSheetByName(SCHEMA.REINTEGROS.name), 1, idStr);
  var deletedEvents = borrarFilasDondeColumnaSea(ss.getSheetByName(SCHEMA.CRM.name), 1, idStr);

  return {
    status: 'ok',
    message: 'Paciente y todos sus registros eliminados en cascada',
    deletedPayments: deletedPayments,
    deletedRefunds: deletedRefunds,
    deletedEvents: deletedEvents
  };
}

function borrarFilasDondeColumnaSea(sheet, colIndex, targetValue) {
  if (!sheet || sheet.getLastRow() <= 1) return 0;
  var values = sheet.getDataRange().getValues();
  var count = 0;
  for (var i = values.length - 1; i >= 1; i--) {
    if (String(values[i][colIndex]) === targetValue) {
      sheet.deleteRow(i + 1);
      count++;
    }
  }
  return count;
}

function guardarPagoYActualizarSaldo(ss, payment) {
  var paySheet = ss.getSheetByName(SCHEMA.ABONOS.name);
  paySheet.appendRow([
    payment.id,
    payment.patientId,
    payment.patientName,
    payment.amount,
    payment.date || formatearFecha(new Date()),
    payment.paymentMethod || 'Transferencia',
    payment.reference || '',
    payment.registeredBy || '',
    payment.notes || '',
    payment.createdAt || new Date().toISOString()
  ]);

  recalcularTotalesPaciente(ss, payment.patientId);
  return { status: 'ok', message: 'Pago guardado', id: payment.id };
}

function borrarPagoYRecalcular(ss, paymentId) {
  var paySheet = ss.getSheetByName(SCHEMA.ABONOS.name);
  if (!paySheet || paySheet.getLastRow() <= 1) return { status: 'ok' };
  var values = paySheet.getDataRange().getValues();
  var patientId = null;

  for (var i = values.length - 1; i >= 1; i--) {
    if (String(values[i][0]) === String(paymentId)) {
      patientId = String(values[i][1]);
      paySheet.deleteRow(i + 1);
      break;
    }
  }

  if (patientId) recalcularTotalesPaciente(ss, patientId);
  return { status: 'ok', message: 'Pago eliminado' };
}

function guardarReintegro(ss, refund) {
  var refSheet = ss.getSheetByName(SCHEMA.REINTEGROS.name);
  refSheet.appendRow([
    refund.id,
    refund.patientId,
    refund.patientName,
    refund.amount,
    refund.date || formatearFecha(new Date()),
    refund.reason || '',
    refund.refundMethod || 'Transferencia',
    refund.reference || '',
    refund.registeredBy || '',
    refund.createdAt || new Date().toISOString()
  ]);
  return { status: 'ok', message: 'Reintegro guardado' };
}

function borrarReintegro(ss, refundId) {
  borrarFilasDondeColumnaSea(ss.getSheetByName(SCHEMA.REINTEGROS.name), 0, String(refundId));
  return { status: 'ok', message: 'Reintegro eliminado' };
}

function recalcularTotalesPaciente(ss, patientId) {
  var idStr = String(patientId);
  var paySheet = ss.getSheetByName(SCHEMA.ABONOS.name);
  var patSheet = ss.getSheetByName(SCHEMA.PACIENTES.name);

  var totalPaid = 0;
  if (paySheet && paySheet.getLastRow() > 1) {
    var payValues = paySheet.getDataRange().getValues();
    for (var i = 1; i < payValues.length; i++) {
      if (String(payValues[i][1]) === idStr) {
        totalPaid += Number(payValues[i][3]) || 0;
      }
    }
  }

  if (patSheet && patSheet.getLastRow() > 1) {
    var patValues = patSheet.getDataRange().getValues();
    for (var j = 1; j < patValues.length; j++) {
      if (String(patValues[j][0]) === idStr) {
        var totalCost = Number(patValues[j][9]) || 0;
        var newBalance = Math.max(0, totalCost - totalPaid);
        var newStatus = newBalance <= 0 ? 'paid' : 'pending';

        patSheet.getRange(j + 1, 11).setValue(totalPaid);
        patSheet.getRange(j + 1, 12).setValue(newBalance);
        patSheet.getRange(j + 1, 14).setValue(newStatus);
        patSheet.getRange(j + 1, 18).setValue(new Date().toISOString());
        break;
      }
    }
  }
}

function guardarUsuario(ss, user) {
  var sheet = ss.getSheetByName(SCHEMA.USUARIOS.name);
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(user.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowData = [
    user.id,
    user.fullName,
    user.email,
    user.role,
    user.phone || '',
    user.password || '',
    String(user.isActive !== false),
    String(user.isImmutable === true),
    user.createdAt || formatearFecha(new Date()),
    user.notes || ''
  ];

  if (rowIndex > 1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { status: 'ok', message: 'Usuario guardado' };
}

function borrarUsuario(ss, userId) {
  var sheet = ss.getSheetByName(SCHEMA.USUARIOS.name);
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(userId)) {
      if (String(values[i][7]).toLowerCase() === 'true') {
        throw new Error('Usuario protegido contra eliminación');
      }
      sheet.deleteRow(i + 1);
      return { status: 'ok', message: 'Usuario eliminado' };
    }
  }
  return { status: 'ok', message: 'Usuario no encontrado' };
}

function guardarEventoCRM(ss, ev) {
  var sheet = ss.getSheetByName(SCHEMA.CRM.name);
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(ev.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowData = [
    ev.id, ev.patientId, ev.patientName, ev.patientPhone || '',
    ev.type, ev.title, ev.description || '', ev.dueDate,
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

function sincronizarMasivo(ss, data) {
  if (data.patients && Array.isArray(data.patients)) {
    var patSheet = ss.getSheetByName(SCHEMA.PACIENTES.name);
    patSheet.clearContents();
    patSheet.appendRow(SCHEMA.PACIENTES.headers);
    formatearEncabezado(patSheet, SCHEMA.PACIENTES.headers.length);
    data.patients.forEach(function(p) { guardarPaciente(ss, p); });
  }
  if (data.payments && Array.isArray(data.payments)) {
    var paySheet = ss.getSheetByName(SCHEMA.ABONOS.name);
    paySheet.clearContents();
    paySheet.appendRow(SCHEMA.ABONOS.headers);
    formatearEncabezado(paySheet, SCHEMA.ABONOS.headers.length);
    data.payments.forEach(function(p) {
      paySheet.appendRow([
        p.id, p.patientId, p.patientName, p.amount, p.date,
        p.paymentMethod, p.reference || '', p.registeredBy || '',
        p.notes || '', p.createdAt || new Date().toISOString()
      ]);
    });
  }
  if (data.refunds && Array.isArray(data.refunds)) {
    var refSheet = ss.getSheetByName(SCHEMA.REINTEGROS.name);
    refSheet.clearContents();
    refSheet.appendRow(SCHEMA.REINTEGROS.headers);
    formatearEncabezado(refSheet, SCHEMA.REINTEGROS.headers.length);
    data.refunds.forEach(function(r) {
      refSheet.appendRow([
        r.id, r.patientId, r.patientName, r.amount, r.date,
        r.reason, r.refundMethod, r.reference || '', r.registeredBy || '',
        r.createdAt || new Date().toISOString()
      ]);
    });
  }
  return { status: 'ok', message: 'Sincronización masiva completada' };
}
`;
