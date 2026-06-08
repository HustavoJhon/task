/**
 * SISTEMA DE GESTIÓN HOTELERA - HOTEL LUXE
 * Archivo Backend: Code.gs
 * Conecta el Dashboard HTML con las tablas de Google Sheets.
 */

// Configuración global: Deja vacío si el script está vinculado directamente al contenedor del Sheet.
// Si usas un script independiente, introduce el ID del documento entre las comillas.
const SPREADSHEET_ID = ""; 

function getSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Servir la interfaz web (opcional si renderizas el dashboard directamente desde Apps Script)
 */
function doGet(e) {
  // Si envías parámetros de consulta por GET, los procesamos como API externa
  if (e && e.parameter && e.parameter.action) {
    return handleApiGetRequests(e);
  }
  // Por defecto, sirve el archivo Index.html si está dentro del proyecto
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Hotel Luxe — Sistema de Gestión Hotelera')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Punto de entrada para peticiones POST (API externa o llamadas fetch)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = handleApiPostRequests(data);
    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * =========================================================================
 * FUNCIONES DISPONIBLES VÍA google.script.run (Para llamadas directas desde el HTML)
 * =========================================================================
 */

/**
 * Sistema de Autenticación de Usuarios
 */
function loginUsuario(correo, password) {
  try {
    const data = obtenerDatosTabla("Usuarios");
    const usuario = data.find(u => u.Correo === correo && u.Password === password);
    
    if (!usuario) {
      return { success: false, message: "Credenciales incorrectas." };
    }
    if (usuario.Estado !== "Activo" && usuario.Estado !== "completado") { // Depende de tu convención
      return { success: false, message: "El usuario se encuentra inactivo." };
    }
    
    // Devolver datos excluyendo la contraseña por seguridad
    return {
      success: true,
      usuario: {
        UsuarioID: usuario.UsuarioID,
        Nombre: usuario.Nombre,
        Correo: usuario.Correo,
        Rol: usuario.Rol
      }
    };
  } catch(e) {
    return { success: false, message: "Error en login: " + e.toString() };
  }
}

/**
 * Leer de forma genérica registros de cualquier tabla mapeando las cabeceras a objetos JSON
 */
function obtenerDatosTabla(nombreTabla) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(nombreTabla);
  if (!sheet) throw new Error("La tabla " + nombreTabla + " no existe.");
  
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return []; // Solo cabecera o vacía
  
  const cabeceras = values[0];
  const resultado = [];
  
  for (let i = 1; i < values.length; i++) {
    let fila = values[i];
    let obj = {};
    cabeceras.forEach((cabecera, index) => {
      obj[cabecera] = fila[index];
    });
    resultado.push(obj);
  }
  return resultado;
}

/**
 * Insertar o actualizar de forma genérica un registro en cualquier tabla
 * Maneja automáticamente la creación de IDs únicos autoincrementables numéricos.
 */
function guardarRegistro(nombreTabla, datosObjeto) {
  // LockService evita que dos usuarios guarden simultáneamente y dupliquen IDs
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Esperar hasta 10 segundos disponibilidad
    
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(nombreTabla);
    if (!sheet) throw new Error("La tabla " + nombreTabla + " no existe.");
    
    const values = sheet.getDataRange().getValues();
    const cabeceras = values[0];
    const idNombre = cabeceras[0]; // Se asume que el primer campo es el ID primario (ej: HuespedID)
    
    let filaDestino;
    let esNuevo = true;
    let nuevoId = 1;
    
    // Si viene con un ID válido, buscamos si existe para actualizarlo
    if (datosObjeto[idNombre]) {
      const idBuscado = String(datosObjeto[idNombre]);
      for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]) === idBuscado) {
          filaDestino = i + 1; // Fila real en Google Sheets (1-indexed)
          esNuevo = false;
          nuevoId = datosObjeto[idNombre];
          break;
        }
      }
    }
    
    // Si es nuevo registro, calculamos el siguiente ID secuencial
    if (esNuevo) {
      filaDestino = sheet.getLastRow() + 1;
      if (values.length > 1) {
        // Encontrar el ID numérico más alto y sumarle 1
        const ids = values.slice(1).map(f => Number(f[0])).filter(id => !isNaN(id));
        if (ids.length > 0) {
          nuevoId = Math.max(...ids) + 1;
        }
      }
      datosObjeto[idNombre] = nuevoId;
    }
    
    // Mapear el objeto en orden según las columnas de la cabecera
    const nuevaFilaDatos = cabeceras.map(cabecera => {
      return datosObjeto[cabecera] !== undefined ? datosObjeto[cabecera] : "";
    });
    
    // Escribir los datos en la hoja
    sheet.getRange(filaDestino, 1, 1, nuevaFilaDatos.length).setValues([nuevaFilaDatos]);
    
    return { success: true, id: nuevoId, message: esNuevo ? "Registro creado." : "Registro actualizado." };
    
  } catch(e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Eliminar un registro basándose en su ID único (Primera columna)
 */
function eliminarRegistro(nombreTabla, idRegistro) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(nombreTabla);
    if (!sheet) throw new Error("La tabla " + nombreTabla + " no existe.");
    
    const values = sheet.getDataRange().getValues();
    const idBuscado = String(idRegistro);
    
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]) === idBuscado) {
        sheet.deleteRow(i + 1);
        return { success: true, message: "Registro eliminado correctamente." };
      }
    }
    return { success: false, message: "No se encontró el registro con el ID proporcionado." };
  } catch(e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Obtener consolidado total de métricas del hotel para los gráficos del Dashboard
 */
function obtenerMetricasDashboard() {
  try {
    const habitaciones = obtenerDatosTabla("Habitaciones");
    const reservas = obtenerDatosTabla("Reservas");
    const pagos = obtenerDatosTabla("Pagos");
    
    // 1. Ocupación actual
    const habTotales = habitaciones.length;
    const habOcupadas = habitaciones.filter(h => h.Estado.toLowerCase() === "ocupada").length;
    const porcOcupacion = habTotales > 0 ? Math.round((habOcupadas / habTotales) * 100) : 0;
    
    // 2. Ingresos Totales (Monto de pagos completados)
    const ingresosTotales = pagos.reduce((sum, p) => {
      const estado = String(p.Estado).toLowerCase();
      return (estado === "completado" || estado === "pagado") ? sum + Number(p.Monto || 0) : sum;
    }, 0);
    
    // 3. Estado de Reservas
    const pendientes = reservas.filter(r => String(r.EstadoReserva).toLowerCase() === "pendiente").length;
    const confirmadas = reservas.filter(r => ["completado", "confirmada", "activa"].includes(String(r.EstadoReserva).toLowerCase())).length;
    
    return {
      success: true,
      metricas: {
        habitacionesTotales: habTotales,
        habitacionesOcupadas: habOcupadas,
        porcentajeOcupacion: porcOcupacion,
        ingresosTotales: ingresosTotales,
        reservasPendientes: pendientes,
        reservasConfirmadas: confirmadas
      }
    };
  } catch(e) {
    return { success: false, message: e.toString() };
  }
}

/**
 * =========================================================================
 * PUENTE FRONTEND — Entry point único para todas las llamadas de Index.html
 * Mapea los nombres de acción del frontend a las funciones reales del backend
 * =========================================================================
 */
function _ok(result) {
  if (result && typeof result === 'object' && 'success' in result) {
    result.ok = result.success;
  }
  return result;
}

function frontendBridge(action, param) {
  try {
    switch (action) {
      // ─── OBTENER DATOS ───
      case 'obtenerHuespedes':    return obtenerDatosTabla('Huespedes');
      case 'obtenerHabitaciones': return obtenerDatosTabla('Habitaciones');
      case 'obtenerReservas':     return obtenerDatosTabla('Reservas');
      case 'obtenerPagos':        return obtenerDatosTabla('Pagos');
      case 'obtenerServicios':    return obtenerDatosTabla('Servicios');

      // ─── GUARDAR / ACTUALIZAR ───
      case 'guardarHuesped':      return _ok(guardarRegistro('Huespedes', param));
      case 'editarHuesped':       return _ok(guardarRegistro('Huespedes', param));
      case 'guardarHabitacion':   return _ok(guardarRegistro('Habitaciones', param));
      case 'editarHabitacion':    return _ok(guardarRegistro('Habitaciones', param));
      case 'guardarReserva':      return _ok(guardarRegistro('Reservas', param));
      case 'guardarPago':         return _ok(guardarRegistro('Pagos', param));
      case 'guardarServicio':     return _ok(guardarRegistro('Servicios', param));
      case 'guardarContacto':     return _ok(guardarRegistro('Contactos', param));

      // ─── ELIMINAR ───
      case 'eliminarHuesped':     return _ok(eliminarRegistro('Huespedes', param));

      // ─── ACCIONES ESPECIALES ───
      case 'cambiarEstadoHabitacion': {
        const habs = obtenerDatosTabla('Habitaciones');
        const hab = habs.find(h => h.HabitacionID == param.id);
        if (!hab) return _ok({ success: false, message: 'Habitación no encontrada' });
        hab.Estado = param.estado;
        return _ok(guardarRegistro('Habitaciones', hab));
      }
      case 'cancelarReserva': {
        const res = obtenerDatosTabla('Reservas');
        const r = res.find(x => x.ReservaID == param);
        if (!r) return _ok({ success: false, message: 'Reserva no encontrada' });
        r.EstadoReserva = 'Cancelada';
        return _ok(guardarRegistro('Reservas', r));
      }

      // ─── DASHBOARD ───
      case 'obtenerDashboard':   return obtenerDashboardCompleto();

      // ─── REPORTES ───
      case 'obtenerReportes': {
        const reservas = obtenerDatosTabla('Reservas');
        const huespedes = obtenerDatosTabla('Huespedes');
        const pagos = obtenerDatosTabla('Pagos');
        const counts = {};
        reservas.forEach(r => { counts[r.HuespedID] = (counts[r.HuespedID] || 0) + 1; });
        const topClientes = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, count]) => {
          const h = huespedes.find(x => x.HuespedID == id);
          return { nombre: h ? `${h.Nombre} ${h.Apellido}` : `ID ${id}`, reservas: count };
        });
        const metodos = {};
        pagos.forEach(p => {
          const m = p.MetodoPago || 'Otros';
          metodos[m] = (metodos[m] || 0) + Number(p.Monto || 0);
        });
        return { ok: true, topClientes, tipos: {}, metodos };
      }

      // ─── INICIALIZAR SHEETS ───
      case 'initSheets':          return _ok(inicializarSheets());

      // ─── LOGIN ───
      case 'login': {
        const result = loginUsuario(param.correo, param.password);
        if (result.success) {
          return {
            ok: true,
            nombre: result.usuario.Nombre,
            rol: result.usuario.Rol,
            id: result.usuario.UsuarioID
          };
        }
        return { ok: false, message: result.message };
      }

      default:
        return { ok: false, message: 'Acción no reconocida: ' + action };
    }
  } catch (e) {
    return { ok: false, message: e.toString() };
  }
}

function obtenerDashboardCompleto() {
  const safe = function(tabla) { try { return obtenerDatosTabla(tabla) || []; } catch(e) { return []; } };
  const habitaciones = safe("Habitaciones");
  const reservas = safe("Reservas");
  const pagos = safe("Pagos");
  const huespedes = safe("Huespedes");

  const total = habitaciones.length;
  const ocupadas = habitaciones.filter(h => String(h.Estado).toLowerCase() === "ocupada").length;
  const disponibles = habitaciones.filter(h => String(h.Estado).toLowerCase() === "disponible").length;
  const manten = habitaciones.filter(h => String(h.Estado).toLowerCase() === "mantenimiento").length;

  const ingrTotales = pagos.reduce((sum, p) => {
    const est = String(p.Estado).toLowerCase();
    return (est === "completado" || est === "pagado") ? sum + Number(p.Monto || 0) : sum;
  }, 0);

  const ahora = new Date();
  const mesAct = ahora.getMonth(), anioAct = ahora.getFullYear();
  const resMes = reservas.filter(r => {
    const d = new Date(r.FechaReserva || r.FechaLlegada);
    return !isNaN(d) && d.getMonth() === mesAct && d.getFullYear() === anioAct;
  }).length;

  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const ingMes = Array(12).fill(0);
  const resMesArr = Array(12).fill(0);
  const metodos = {};
  pagos.forEach(p => {
    if (p.FechaPago) { const d = new Date(p.FechaPago); if (!isNaN(d)) ingMes[d.getMonth()] += Number(p.Monto || 0); }
    const m = p.MetodoPago || 'Otros';
    metodos[m] = (metodos[m] || 0) + Number(p.Monto || 0);
  });
  reservas.forEach(r => {
    const f = r.FechaReserva || r.FechaLlegada;
    if (f) { const d = new Date(f); if (!isNaN(d)) resMesArr[d.getMonth()]++; }
  });

  return {
    ok: true,
    stats: { total, ocupadas, dispon: disponibles, manten, resMes, ingrMes: ingrTotales, totalHuespedes: huespedes.length },
    ingresosMes: meses.map((m, i) => ({ mes: m, total: ingMes[i] })),
    habitaciones: { ocupadas, dispon: disponibles, manten },
    reservasMes: meses.map((m, i) => ({ mes: m, total: resMesArr[i] })),
    metodosPago: metodos,
    ultimasReservas: reservas.slice(-5).reverse(),
    ultimosPagos: pagos.slice(-5).reverse()
  };
}

function inicializarSheets() {
  const ss = getSpreadsheet();
  const tabs = {
    Huespedes: ['HuespedID','Nombre','Apellido','FechaNacimiento','Nacionalidad','TipoDocumento','NumeroDocumento','Email','Telefono','Direccion'],
    Habitaciones: ['HabitacionID','NumeroHabitacion','TipoHabitacion','Capacidad','PrecioPorNoche','Estado','Descripcion'],
    Reservas: ['ReservaID','HuespedID','HabitacionID','FechaLlegada','FechaSalida','FechaReserva','EstadoReserva','NumeroAdultos','NumeroNinos','MontoTotal','Notas'],
    Pagos: ['PagoID','ReservaID','FechaPago','Monto','MetodoPago','Estado'],
    Servicios: ['ServicioID','NombreServicio','Precio','Descripcion'],
    Usuarios: ['UsuarioID','Nombre','Correo','Password','Rol','Estado'],
    Contactos: ['ContactoID','Nombre','Correo','Telefono','Mensaje','Fecha']
  };
  Object.entries(tabs).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  });
  return { success: true, message: 'Sheets inicializadas correctamente' };
}

/**
 * =========================================================================
 * MANEJADORES PARA ACCESOS EXTERNOS VÍA WEB WEBHOOKS (fetch/axios POST y GET)
 * =========================================================================
 */
function handleApiGetRequests(e) {
  let action = e.parameter.action;
  let tabla = e.parameter.tabla;
  let data;
  
  if (action === "obtenerDatos" && tabla) {
    data = obtenerDatosTabla(tabla);
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: data }))
                         .setMimeType(ContentService.MimeType.JSON);
  } else if (action === "obtenerMetricas") {
    data = obtenerMetricasDashboard();
    return ContentService.createTextOutput(JSON.stringify(data))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Acción GET inválida." }))
                       .setMimeType(ContentService.MimeType.JSON);
}

function handleApiPostRequests(data) {
  if (data.action === "login") {
    return loginUsuario(data.correo, data.password);
  }
  if (data.action === "guardar" && data.tabla && data.registro) {
    return guardarRegistro(data.tabla, data.registro);
  }
  if (data.action === "eliminar" && data.tabla && data.id) {
    return eliminarRegistro(data.tabla, data.id);
  }
  return { success: false, message: "Acción POST inválida o parámetros incompletos." };
}
