// ============================================================
//  HOTEL MANAGEMENT SYSTEM — Code.gs
//  Backend Google Apps Script
// ============================================================

const SS_ID = PropertiesService.getScriptProperties().getProperty('SS_ID');

function getSheet(name) {
  return SpreadsheetApp.openById(SS_ID).getSheetByName(name);
}

// ── Routing ──────────────────────────────────────────────────
function doGet(e) {
  const page = e.parameter.page || 'Login';
  const html = HtmlService.createTemplateFromFile(page).evaluate()
    .setTitle('Hotel Luxe — Sistema de Gestión')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ── Inicializar Sheets ────────────────────────────────────────
function initSheets() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheets = {
    'Huespedes':        ['HuespedID','Nombre','Apellido','FechaNacimiento','Nacionalidad','TipoDocumento','NumeroDocumento','Email','Telefono','Direccion'],
    'Habitaciones':     ['HabitacionID','NumeroHabitacion','TipoHabitacion','Capacidad','PrecioPorNoche','Estado','Descripcion'],
    'Reservas':         ['ReservaID','HuespedID','FechaLlegada','FechaSalida','FechaReserva','EstadoReserva','NumeroAdultos','NumeroNinos','Notas','MontoTotal'],
    'DetallesReserva':  ['DetalleReservaID','ReservaID','HabitacionID','PrecioAplicado','FechaAsignacion'],
    'Pagos':            ['PagoID','ReservaID','FechaPago','Monto','MetodoPago','Estado'],
    'Usuarios':         ['UsuarioID','Nombre','Correo','Password','Rol','Estado'],
    'Servicios':        ['ServicioID','NombreServicio','Precio','Descripcion'],
    'ConsumoServicios': ['ConsumoID','ReservaID','ServicioID','Cantidad','Subtotal']
  };
  for (const [name, headers] of Object.entries(sheets)) {
    if (!ss.getSheetByName(name)) {
      const sh = ss.insertSheet(name);
      sh.appendRow(headers);
    }
  }
  // Seed admin user if Usuarios empty
  const u = ss.getSheetByName('Usuarios');
  if (u.getLastRow() < 2) {
    u.appendRow([1,'Administrador','admin@hotel.com','admin123','Administrador','Activo']);
    u.appendRow([2,'Recepcionista','recep@hotel.com','recep123','Recepcionista','Activo']);
  }
  return 'OK';
}

// ── Auth ──────────────────────────────────────────────────────
function login(correo, password) {
  const sh = getSheet('Usuarios');
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === correo && data[i][3] === password && data[i][5] === 'Activo') {
      return { ok: true, id: data[i][0], nombre: data[i][1], rol: data[i][4] };
    }
  }
  return { ok: false };
}

// ── Helpers ───────────────────────────────────────────────────
function sheetToJson(sheetName) {
  const sh = getSheet(sheetName);
  if (!sh) return [];
  const [headers, ...rows] = sh.getDataRange().getValues();
  return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}

function generateId(sheetName, idCol) {
  const sh = getSheet(sheetName);
  const last = sh.getLastRow();
  if (last < 2) return 1;
  return sh.getRange(last, 1).getValue() + 1;
}

// ── Huéspedes ─────────────────────────────────────────────────
function obtenerHuespedes() { return sheetToJson('Huespedes'); }

function guardarHuesped(data) {
  const sh = getSheet('Huespedes');
  const id = generateId('Huespedes');
  sh.appendRow([id, data.Nombre, data.Apellido, data.FechaNacimiento,
    data.Nacionalidad, data.TipoDocumento, data.NumeroDocumento,
    data.Email, data.Telefono, data.Direccion]);
  return { ok: true, id };
}

function editarHuesped(data) {
  const sh = getSheet('Huespedes');
  const vals = sh.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] == data.HuespedID) {
      sh.getRange(i + 1, 1, 1, 10).setValues([[data.HuespedID, data.Nombre, data.Apellido,
        data.FechaNacimiento, data.Nacionalidad, data.TipoDocumento,
        data.NumeroDocumento, data.Email, data.Telefono, data.Direccion]]);
      return { ok: true };
    }
  }
  return { ok: false };
}

function eliminarHuesped(id) {
  const sh = getSheet('Huespedes');
  const vals = sh.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] == id) { sh.deleteRow(i + 1); return { ok: true }; }
  }
  return { ok: false };
}

// ── Habitaciones ──────────────────────────────────────────────
function obtenerHabitaciones() { return sheetToJson('Habitaciones'); }

function guardarHabitacion(data) {
  const sh = getSheet('Habitaciones');
  const id = generateId('Habitaciones');
  sh.appendRow([id, data.NumeroHabitacion, data.TipoHabitacion, data.Capacidad,
    data.PrecioPorNoche, data.Estado || 'Disponible', data.Descripcion]);
  return { ok: true, id };
}

function editarHabitacion(data) {
  const sh = getSheet('Habitaciones');
  const vals = sh.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] == data.HabitacionID) {
      sh.getRange(i + 1, 1, 1, 7).setValues([[data.HabitacionID, data.NumeroHabitacion,
        data.TipoHabitacion, data.Capacidad, data.PrecioPorNoche,
        data.Estado, data.Descripcion]]);
      return { ok: true };
    }
  }
  return { ok: false };
}

function eliminarHabitacion(id) {
  const sh = getSheet('Habitaciones');
  const vals = sh.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] == id) { sh.deleteRow(i + 1); return { ok: true }; }
  }
  return { ok: false };
}

function cambiarEstadoHabitacion(id, estado) {
  const sh = getSheet('Habitaciones');
  const vals = sh.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] == id) { sh.getRange(i + 1, 6).setValue(estado); return { ok: true }; }
  }
  return { ok: false };
}

// ── Reservas ──────────────────────────────────────────────────
function obtenerReservas() { return sheetToJson('Reservas'); }

function guardarReserva(data) {
  const sh = getSheet('Reservas');
  const id = generateId('Reservas');
  const today = new Date().toISOString().split('T')[0];
  sh.appendRow([id, data.HuespedID, data.FechaLlegada, data.FechaSalida, today,
    data.EstadoReserva || 'Confirmada', data.NumeroAdultos, data.NumeroNinos,
    data.Notas, data.MontoTotal]);
  // Asignar habitación
  if (data.HabitacionID) {
    const det = getSheet('DetallesReserva');
    const dId = generateId('DetallesReserva');
    det.appendRow([dId, id, data.HabitacionID, data.PrecioAplicado, today]);
    cambiarEstadoHabitacion(data.HabitacionID, 'Ocupada');
  }
  return { ok: true, id };
}

function cancelarReserva(id) {
  const sh = getSheet('Reservas');
  const vals = sh.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][0] == id) {
      sh.getRange(i + 1, 6).setValue('Cancelada');
      // liberar habitación
      const det = getSheet('DetallesReserva').getDataRange().getValues();
      for (let d = 1; d < det.length; d++) {
        if (det[d][1] == id) cambiarEstadoHabitacion(det[d][2], 'Disponible');
      }
      return { ok: true };
    }
  }
  return { ok: false };
}

// ── Pagos ─────────────────────────────────────────────────────
function obtenerPagos() { return sheetToJson('Pagos'); }

function guardarPago(data) {
  const sh = getSheet('Pagos');
  const id = generateId('Pagos');
  sh.appendRow([id, data.ReservaID, new Date().toISOString().split('T')[0],
    data.Monto, data.MetodoPago, data.Estado || 'Completado']);
  return { ok: true, id };
}

// ── Servicios ─────────────────────────────────────────────────
function obtenerServicios() { return sheetToJson('Servicios'); }

function guardarServicio(data) {
  const sh = getSheet('Servicios');
  const id = generateId('Servicios');
  sh.appendRow([id, data.NombreServicio, data.Precio, data.Descripcion]);
  return { ok: true, id };
}

function registrarConsumo(data) {
  const sh = getSheet('ConsumoServicios');
  const id = generateId('ConsumoServicios');
  sh.appendRow([id, data.ReservaID, data.ServicioID, data.Cantidad, data.Subtotal]);
  return { ok: true, id };
}

// ── Dashboard Stats ───────────────────────────────────────────
function obtenerDashboard() {
  try {
    const habs  = sheetToJson('Habitaciones');
    const res   = sheetToJson('Reservas');
    const pagos = sheetToJson('Pagos');
    const hues  = sheetToJson('Huespedes');

    const total     = habs.length;
    const ocupadas  = habs.filter(h => h.Estado === 'Ocupada').length;
    const dispon    = habs.filter(h => h.Estado === 'Disponible').length;
    const manten    = habs.filter(h => h.Estado === 'Mantenimiento').length;

    const hoy  = new Date();
    const mes  = hoy.getMonth();
    const anio = hoy.getFullYear();

    const resMes    = res.filter(r => { const d = new Date(r.FechaReserva); return d.getMonth()===mes && d.getFullYear()===anio; });
    const ingrMes   = pagos.filter(p => { const d = new Date(p.FechaPago); return d.getMonth()===mes && d.getFullYear()===anio && p.Estado==='Completado'; })
                           .reduce((s, p) => s + parseFloat(p.Monto || 0), 0);

    // Ingresos por mes (últimos 6)
    const ingresosMes = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(anio, mes - i, 1);
      const m = d.getMonth(); const a = d.getFullYear();
      const sum = pagos.filter(p => { const pd = new Date(p.FechaPago); return pd.getMonth()===m && pd.getFullYear()===a && p.Estado==='Completado'; })
                       .reduce((s, p) => s + parseFloat(p.Monto || 0), 0);
      ingresosMes.push({ mes: d.toLocaleDateString('es', { month: 'short' }), total: sum });
    }

    // Reservas por mes
    const reservasMes = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(anio, mes - i, 1);
      const m = d.getMonth(); const a = d.getFullYear();
      const cnt = res.filter(r => { const rd = new Date(r.FechaReserva); return rd.getMonth()===m && rd.getFullYear()===a; }).length;
      reservasMes.push({ mes: d.toLocaleDateString('es', { month: 'short' }), total: cnt });
    }

    return {
      ok: true,
      stats: { total, ocupadas, dispon, manten, resMes: resMes.length, ingrMes, totalHuespedes: hues.length },
      ingresosMes, reservasMes,
      habitaciones: { ocupadas, dispon, manten },
      ultimasReservas: res.slice(-5).reverse(),
      ultimosPagos: pagos.slice(-5).reverse()
    };
  } catch (e) { return { ok: false, error: e.message }; }
}

// ── Reportes ──────────────────────────────────────────────────
function obtenerReportes() {
  const res   = sheetToJson('Reservas');
  const pagos = sheetToJson('Pagos');
  const habs  = sheetToJson('Habitaciones');
  const hues  = sheetToJson('Huespedes');

  // Clientes frecuentes
  const freq = {};
  res.forEach(r => { freq[r.HuespedID] = (freq[r.HuespedID] || 0) + 1; });
  const topClientes = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,5)
    .map(([id, cnt]) => {
      const h = hues.find(x => x.HuespedID == id);
      return { nombre: h ? `${h.Nombre} ${h.Apellido}` : `ID ${id}`, reservas: cnt };
    });

  // Tipos de habitación
  const tipos = {};
  habs.forEach(h => { tipos[h.TipoHabitacion] = (tipos[h.TipoHabitacion] || 0) + 1; });

  // Métodos de pago
  const metodos = {};
  pagos.forEach(p => { metodos[p.MetodoPago] = (metodos[p.MetodoPago] || 0) + 1; });

  return { ok: true, topClientes, tipos, metodos };
}
