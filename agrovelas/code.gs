const SHEET_STRUCTURE = {
  Usuarios: ['id_usuario','nombre_completo','correo','usuario_login','contrasena_hash','sal','rol','telefono','foto_perfil_url','estado','fecha_creacion','ultimo_acceso','intentos_fallidos'],
  Zootecnistas: ['id_zootecnista','id_usuario','especialidad','anios_experiencia','calificacion_promedio','numero_calificaciones','tarifa_consulta','zona_cobertura','telefono_contacto','correo_contacto','biografia','foto_url','horario_disponible_json','estado'],
  Animales: ['id_animal','codigo_arete_rfid','nombre','especie','raza','sexo','fecha_nacimiento','edad_actual','color_principal','id_padre','id_madre','linea_genetica','procedencia','id_lote_cabana','estado','fecha_registro','registrado_por','codigo_qr_url','foto_principal_url','observaciones_generales'],
  Registro_Fenotipico: ['id_fenotipico','id_animal','fecha_evaluacion','peso_kg','altura_cruz_cm','longitud_corporal_cm','perimetro_toracico_cm','condicion_corporal','tipo_fibra','color_fibra','marcas_distintivas','evaluado_por','observaciones'],
  Registro_Genotipico: ['id_genotipico','id_animal','categoria_registro','pureza_genetica_pct','finura_fibra_um','categoria_fibra','densidad_vellon','uniformidad_vellon','certificado_genealogico_url','antecedentes_geneticos','enfermedades_hereditarias_conocidas','fecha_registro','observaciones'],
  Reproduccion: ['id_reproduccion','id_animal_hembra','tipo_evento','fecha_evento','id_macho','metodo','resultado','fecha_probable_parto','numero_crias','id_cria','responsable','observaciones'],
  Sanidad: ['id_sanidad','id_animal','fecha','tipo_evento','nombre_producto','dosis','via_aplicacion','diagnostico','sintomas_observados','veterinario_responsable','proxima_fecha_aplicacion','costo','estado','observaciones'],
  Animales_Alerta: ['id_alerta','id_animal','fecha_reporte','reportado_por','sintomas','nivel_urgencia','zootecnista_asignado','veterinario_asignado','estado','diagnostico_final','id_sanidad_relacionado','fecha_resolucion'],
  Ubicacion_Manejo: ['id_movimiento','id_animal','fecha','tipo_movimiento','id_lote_origen','id_lote_destino','latitud','longitud','responsable','motivo','observaciones'],
  Lotes_Cabanas: ['id_lote','nombre_lote','tipo_animal_predominante','capacidad_maxima','animales_actuales','ubicacion_descripcion','latitud_centro','longitud_centro','responsable','estado'],
  Esquila: ['id_esquila','id_animal','fecha_esquila','peso_vellon_kg','categoria_fibra','micronaje_um','longitud_mecha_cm','color_fibra','destino','comprador','precio_por_kg','ingreso_total','responsable','observaciones'],
  Contabilidad: ['id_movimiento_contable','fecha','tipo','categoria','monto','id_animal_relacionado','id_esquila_relacionada','descripcion','comprobante_url','registrado_por'],
  Multimedia: ['id_multimedia','id_animal','tipo_archivo','url_archivo','descripcion','fecha_subida','subido_por'],
  Calendario_Actividades: ['id_actividad','titulo','tipo','fecha','hora','id_animal_relacionado','id_lote_relacionado','responsable','estado','descripcion'],
  Notificaciones: ['id_notificacion','id_usuario_destino','tipo','mensaje','fecha_generacion','leido','prioridad','id_relacionado','tipo_relacionado'],
  Citas_Zootecnista: ['id_cita','id_zootecnista','id_usuario_solicitante','id_animal_relacionado','fecha','hora','motivo','estado','notas_zootecnista','calificacion_recibida','fecha_creacion'],
  IoT_Dispositivos: ['id_dispositivo','id_animal','tipo_dispositivo','codigo_dispositivo','fecha_instalacion','estado_bateria_pct','estado','ultima_latitud','ultima_longitud','fecha_ultima_lectura'],
  IoT_Lecturas: ['id_lectura','id_dispositivo','fecha_hora','latitud','longitud','temperatura_corporal','nivel_actividad'],
  Listas: ['categoria','valor','orden','activo'],
  Secuencias: ['prefijo','ultimo_numero'],
  Logs_Sistema: ['id_log','fecha_hora','id_usuario','accion','modulo','detalle'],
  Config_Sistema: ['clave','valor','descripcion']
};

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('AGROVELAS')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function inicializarBaseDeDatos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const [name, cols] of Object.entries(SHEET_STRUCTURE)) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.getRange(1, 1, 1, cols.length).setValues([cols]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, cols.length).setFontWeight('bold');
    }
  }
  const lists = ss.getSheetByName('Secuencias');
  if (lists.getLastRow() < 2) {
    const prefixes = ['USR','ZOO','ANI','FEN','GEN','REP','SAN','ALE','MOV','LOT','ESQ','CTB','MUL','CAL','NOT','CIT','DIS','LEC','LOG'];
    const data = prefixes.map(p => [p, 0]);
    lists.getRange(2, 1, data.length, 2).setValues(data);
  }
  return 'Base de datos inicializada correctamente';
}

function generarId(prefijo) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Secuencias');
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === prefijo) {
        const nuevo = parseInt(data[i][1]) + 1;
        sheet.getRange(i + 1, 2).setValue(nuevo);
        return prefijo + '-' + String(nuevo).padStart(5, '0');
      }
    }
  } finally {
    lock.releaseLock();
  }
  return prefijo + '-00001';
}

function sha256(texto, sal) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto + sal);
  return raw.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function registrarUsuario(datos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Usuarios');
  const existing = sheet.getDataRange().getValues();
  for (let i = 1; i < existing.length; i++) {
    if (existing[i][3] === datos.usuario_login) return { error: 'El nombre de usuario ya existe' };
    if (existing[i][2] === datos.correo) return { error: 'El correo ya está registrado' };
  }
  const sal = Math.random().toString(36).substring(2, 10);
  const hash = sha256(datos.contrasena, sal);
  const id = generarId('USR');
  const fecha = new Date();
  sheet.appendRow([id, datos.nombre_completo, datos.correo, datos.usuario_login, hash, sal, datos.rol || 'Ganadero', datos.telefono || '', '', 'Activo', Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd'), '', 0]);
  return { success: true, id_usuario: id };
}

function iniciarSesion(login, contrasena) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Usuarios');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if ((data[i][2] === login || data[i][3] === login) && data[i][9] === 'Activo') {
      const hash = sha256(contrasena, data[i][5]);
      if (hash === data[i][4]) {
        sheet.getRange(i + 1, 12).setValue(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'));
        sheet.getRange(i + 1, 13).setValue(0);
        return {
          success: true,
          usuario: { id_usuario: data[i][0], nombre: data[i][1], correo: data[i][2], login: data[i][3], rol: data[i][6], telefono: data[i][7], foto: data[i][8] }
        };
      } else {
        const intentos = parseInt(data[i][12]) + 1;
        sheet.getRange(i + 1, 13).setValue(intentos);
        if (intentos >= 5) sheet.getRange(i + 1, 10).setValue('Bloqueado');
        return { error: 'Contraseña incorrecta. Intento ' + intentos + '/5' };
      }
    }
  }
  return { error: 'Usuario no encontrado' };
}

function leerListas(categoria) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Listas');
  const data = sheet.getDataRange().getValues();
  const result = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === categoria && data[i][3] === 'Sí') result.push({ valor: data[i][1], orden: data[i][2] });
  }
  result.sort((a, b) => a.orden - b.orden);
  return result;
}

function obtenerConfig(clave) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Config_Sistema');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === clave) return data[i][1];
  }
  return null;
}

function guardarRegistro(hoja, datos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(hoja);
  const headers = SHEET_STRUCTURE[hoja];
  const row = headers.map(h => datos[h] || '');
  sheet.appendRow(row);
  return { success: true };
}

function actualizarRegistro(hoja, idColumna, idValor, datos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(hoja);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === idValor) {
      const row = [];
      for (let j = 0; j < headers.length; j++) {
        row.push(datos[headers[j]] !== undefined ? datos[headers[j]] : data[i][j]);
      }
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([row]);
      return { success: true };
    }
  }
  return { error: 'Registro no encontrado' };
}

function obtenerRegistros(hoja, filtro) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(hoja);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];
  for (let i = 1; i < data.length; i++) {
    let match = true;
    if (filtro) {
      for (const [k, v] of Object.entries(filtro)) {
        const idx = headers.indexOf(k);
        if (idx >= 0 && String(data[i][idx]) !== String(v)) { match = false; break; }
      }
    }
    if (match) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) obj[headers[j]] = data[i][j];
      result.push(obj);
    }
  }
  return result;
}

function registrarAnimalCompleto(datos) {
  const id = generarId('ANI');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const animalRow = {
    id_animal: id, codigo_arete_rfid: datos.codigo_arete_rfid || '', nombre: datos.nombre || '',
    especie: datos.especie, raza: datos.raza, sexo: datos.sexo,
    fecha_nacimiento: datos.fecha_nacimiento, edad_actual: '',
    color_principal: datos.color_principal || '', id_padre: datos.id_padre || '',
    id_madre: datos.id_madre || '', linea_genetica: datos.linea_genetica || '',
    procedencia: datos.procedencia || 'Nacido en predio',
    id_lote_cabana: datos.id_lote_cabana || '',
    estado: 'Activo', fecha_registro: fecha,
    registrado_por: datos.registrado_por, codigo_qr_url: '',
    foto_principal_url: datos.foto_principal_url || '',
    observaciones_generales: datos.observaciones_generales || ''
  };
  ss.getSheetByName('Animales').appendRow(Object.values(animalRow));
  if (datos.fenotipico) {
    const fenId = generarId('FEN');
    datos.fenotipico.id_fenotipico = fenId;
    datos.fenotipico.id_animal = id;
    datos.fenotipico.fecha_evaluacion = fecha;
    datos.fenotipico.evaluado_por = datos.registrado_por;
    ss.getSheetByName('Registro_Fenotipico').appendRow(Object.values(datos.fenotipico));
  }
  if (datos.genotipico) {
    const genId = generarId('GEN');
    datos.genotipico.id_genotipico = genId;
    datos.genotipico.id_animal = id;
    datos.genotipico.fecha_registro = fecha;
    ss.getSheetByName('Registro_Genotipico').appendRow(Object.values(datos.genotipico));
  }
  if (datos.qrContent) {
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(datos.qrContent);
    const sheetA = ss.getSheetByName('Animales');
    const aData = sheetA.getDataRange().getValues();
    for (let i = 1; i < aData.length; i++) {
      if (aData[i][0] === id) { sheetA.getRange(i + 1, 18).setValue(qrUrl); break; }
    }
  }
  return { success: true, id_animal: id };
}

function subirArchivo(base64, nombre, carpetaId) {
  try {
    const blob = Utilities.newBlob(Utilities.base64Decode(base64.split(',')[1] || base64), '', nombre);
    let folder;
    if (carpetaId) { folder = DriveApp.getFolderById(carpetaId); }
    else {
      const folders = DriveApp.getFoldersByName('AGROVELAS_Multimedia');
      folder = folders.hasNext() ? folders.next() : DriveApp.createFolder('AGROVELAS_Multimedia');
    }
    const file = folder.createFile(blob);
    return { success: true, url: file.getUrl(), id: file.getId() };
  } catch (e) {
    return { error: e.toString() };
  }
}

function obtenerDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const totalAnimales = ss.getSheetByName('Animales').getLastRow() - 1;
  const alertas = obtenerRegistros('Animales_Alerta', { estado: 'En seguimiento' });
  const actividades = obtenerRegistros('Calendario_Actividades', {});
  const notifs = obtenerRegistros('Notificaciones', {});
  const zootecnistas = obtenerRegistros('Zootecnistas', { estado: 'Disponible' });
  return { totalAnimales, alertas: alertas.length, actividades, notificaciones: notifs, zootecnistas };
}

function obtenerActividadesMes(anio, mes) {
  const todas = obtenerRegistros('Calendario_Actividades', {});
  return todas.filter(a => {
    if (!a.fecha) return false;
    const d = new Date(a.fecha);
    return d.getFullYear() === anio && d.getMonth() === mes;
  }).map(a => ({ ...a, dia: new Date(a.fecha).getDate() }));
}

function agendarCita(datos) {
  const id = generarId('CIT');
  const cita = {
    id_cita: id, id_zootecnista: datos.id_zootecnista,
    id_usuario_solicitante: datos.id_usuario_solicitante,
    id_animal_relacionado: datos.id_animal_relacionado || '',
    fecha: datos.fecha, hora: datos.hora,
    motivo: datos.motivo, estado: 'Pendiente',
    notas_zootecnista: '', calificacion_recibida: 0,
    fecha_creacion: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm')
  };
  guardarRegistro('Citas_Zootecnista', cita);
  return { success: true, id_cita: id };
}

function crearNotificacion(usuarioDestino, tipo, mensaje, prioridad, idRelacionado, tipoRelacionado) {
  const id = generarId('NOT');
  guardarRegistro('Notificaciones', {
    id_notificacion: id, id_usuario_destino: usuarioDestino, tipo, mensaje,
    fecha_generacion: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'),
    leido: 'No', prioridad: prioridad || 'Media',
    id_relacionado: idRelacionado || '', tipo_relacionado: tipoRelacionado || ''
  });
  return id;
}

function marcarNotificacionLeida(idNotificacion) {
  return actualizarRegistro('Notificaciones', 'id_notificacion', idNotificacion, { leido: 'Sí' });
}

function registrarLecturaIoT(datos) {
  const id = generarId('LEC');
  datos.id_lectura = id;
  guardarRegistro('IoT_Lecturas', datos);
  const disp = obtenerRegistros('IoT_Dispositivos', { id_dispositivo: datos.id_dispositivo });
  if (disp.length > 0) {
    actualizarRegistro('IoT_Dispositivos', 'id_dispositivo', datos.id_dispositivo, {
      ultima_latitud: datos.latitud, ultima_longitud: datos.longitud,
      fecha_ultima_lectura: datos.fecha_hora
    });
  }
  return { success: true };
}

function obtenerMapaIoT() {
  const dispositivos = obtenerRegistros('IoT_Dispositivos', { estado: 'Activo' });
  return dispositivos.map(d => {
    const animal = obtenerRegistros('Animales', { id_animal: d.id_animal });
    return { ...d, animal_nombre: animal.length > 0 ? animal[0].nombre || animal[0].id_animal : d.id_animal };
  }).filter(d => d.ultima_latitud && d.ultima_longitud);
}

function poblarDatosDemo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  function id(prefijo) { return generarId(prefijo); }

  function reg(hoja, datos) {
    ss.getSheetByName(hoja).appendRow(Object.values(datos));
  }

  reg('Usuarios', {
    id_usuario: id('USR'), nombre_completo: 'Juan Quispe Huaman', correo: 'juan@agrovelas.pe',
    usuario_login: 'juan', contrasena_hash: sha256('123456', 'demo'), sal: 'demo',
    rol: 'Ganadero', telefono: '984123456', estado: 'Activo',
    fecha_creacion: '2026-01-15', ultimo_acceso: hoy, intentos_fallidos: 0
  });
  reg('Usuarios', {
    id_usuario: id('USR'), nombre_completo: 'Maria Choque Mamani', correo: 'maria@agrovelas.pe',
    usuario_login: 'maria', contrasena_hash: sha256('123456', 'demo'), sal: 'demo',
    rol: 'Administrador', telefono: '984654321', estado: 'Activo',
    fecha_creacion: '2026-02-01', ultimo_acceso: hoy, intentos_fallidos: 0
  });
  reg('Usuarios', {
    id_usuario: id('USR'), nombre_completo: 'Carlos Huillca Soto', correo: 'carlos@agrovelas.pe',
    usuario_login: 'carlos', contrasena_hash: sha256('123456', 'demo'), sal: 'demo',
    rol: 'Zootecnista', telefono: '984555333', estado: 'Activo',
    fecha_creacion: '2026-02-10', ultimo_acceso: hoy, intentos_fallidos: 0
  });
  reg('Usuarios', {
    id_usuario: id('USR'), nombre_completo: 'Rosa Mamani Ccana', correo: 'rosa@agrovelas.pe',
    usuario_login: 'rosa', contrasena_hash: sha256('123456', 'demo'), sal: 'demo',
    rol: 'Veterinario', telefono: '984777888', estado: 'Activo',
    fecha_creacion: '2026-03-01', ultimo_acceso: hoy, intentos_fallidos: 0
  });
  reg('Usuarios', {
    id_usuario: id('USR'), nombre_completo: 'Pedro Sullca Quispe', correo: 'pedro@agrovelas.pe',
    usuario_login: 'pedro', contrasena_hash: sha256('123456', 'demo'), sal: 'demo',
    rol: 'Productor', telefono: '984222111', estado: 'Activo',
    fecha_creacion: '2026-03-15', ultimo_acceso: hoy, intentos_fallidos: 0
  });

  reg('Zootecnistas', {
    id_zootecnista: id('ZOO'), id_usuario: 'USR-00003', especialidad: 'Camélidos sudamericanos',
    anios_experiencia: 8, calificacion_promedio: 4.5, numero_calificaciones: 12,
    tarifa_consulta: 60, zona_cobertura: 'Chinchero, Anta, Urubamba',
    telefono_contacto: '984555333', correo_contacto: 'carlos.zoo@agrovelas.pe',
    biografia: 'Especialista en alpacas y llamas con experiencia en comunidades altoandinas.',
    horario_disponible_json: '{"lun":["09:00-12:00","14:00-17:00"],"mar":["09:00-12:00"],"mie":["14:00-17:00"],"jue":["09:00-12:00"],"vie":["09:00-12:00","14:00-17:00"],"sab":["09:00-13:00"]}',
    estado: 'Disponible'
  });
  reg('Zootecnistas', {
    id_zootecnista: id('ZOO'), id_usuario: 'USR-00004', especialidad: 'Medicina general',
    anios_experiencia: 12, calificacion_promedio: 4.8, numero_calificaciones: 25,
    tarifa_consulta: 80, zona_cobertura: 'Cusco, Anta, Calca, Urubamba',
    telefono_contacto: '984777888', correo_contacto: 'rosa.vet@agrovelas.pe',
    biografia: 'Veterinaria con amplia experiencia en sanidad de camélidos y ovinos.',
    horario_disponible_json: '{"lun":["08:00-16:00"],"mar":["08:00-12:00"],"mie":["08:00-16:00"],"jue":["10:00-16:00"],"vie":["08:00-14:00"]}',
    estado: 'Disponible'
  });
  reg('Zootecnistas', {
    id_zootecnista: id('ZOO'), id_usuario: 'USR-00002', especialidad: 'Reproducción',
    anios_experiencia: 6, calificacion_promedio: 4.2, numero_calificaciones: 8,
    tarifa_consulta: 55, zona_cobertura: 'Chinchero, Maras, Moray',
    telefono_contacto: '984654321', correo_contacto: 'maria.repro@agrovelas.pe',
    biografia: 'Especialista en inseminacion artificial y manejo reproductivo.',
    horario_disponible_json: '{"lun":["10:00-15:00"],"mar":["10:00-15:00"],"mie":["10:00-15:00"],"jue":["10:00-15:00"],"vie":["10:00-14:00"]}',
    estado: 'Disponible'
  });

  reg('Lotes_Cabanas', { id_lote: id('LOT'), nombre_lote: 'Potrero Alto', tipo_animal_predominante: 'Alpaca', capacidad_maxima: 80, ubicacion_descripcion: 'Sector norte, 3800 msnm', latitud_centro: -13.5320, longitud_centro: -71.9675, responsable: 'USR-00001', estado: 'Activo' });
  reg('Lotes_Cabanas', { id_lote: id('LOT'), nombre_lote: 'Cabana Central', tipo_animal_predominante: 'Oveja', capacidad_maxima: 120, ubicacion_descripcion: 'Sector este, 3600 msnm', latitud_centro: -13.5400, longitud_centro: -71.9600, responsable: 'USR-00001', estado: 'Activo' });
  reg('Lotes_Cabanas', { id_lote: id('LOT'), nombre_lote: 'Corral de Engorde', tipo_animal_predominante: 'Bovino', capacidad_maxima: 30, ubicacion_descripcion: 'Sector oeste, 3500 msnm', latitud_centro: -13.5280, longitud_centro: -71.9750, responsable: 'USR-00005', estado: 'Activo' });

  const animales = [
    { id: id('ANI'), arete: 'ARQ-1001', nombre: 'Luna', especie: 'Alpaca', raza: 'Huacaya', sexo: 'Hembra', nac: '2024-11-02', color: 'Blanco', padre: '', madre: '', linea: 'Linea Pacomarca 3', lote: 'LOT-00001', proc: 'Nacido en predio' },
    { id: id('ANI'), arete: 'ARQ-1002', nombre: 'Sol', especie: 'Alpaca', raza: 'Suri', sexo: 'Macho', nac: '2024-06-15', color: 'Marron claro', padre: '', madre: '', linea: 'Linea Suri Andino', lote: 'LOT-00001', proc: 'Nacido en predio' },
    { id: id('ANI'), arete: 'ARQ-1003', nombre: 'Estrella', especie: 'Oveja', raza: 'Corriedale', sexo: 'Hembra', nac: '2024-09-20', color: 'Blanco', padre: '', madre: '', linea: 'Linea Corriedale Peru', lote: 'LOT-00002', proc: 'Comprado' },
    { id: id('ANI'), arete: 'ARQ-1004', nombre: 'Tormenta', especie: 'Bovino', raza: 'Brown Swiss', sexo: 'Macho', nac: '2023-12-10', color: 'Marrón', padre: '', madre: '', linea: 'Linea Brown Swiss', lote: 'LOT-00003', proc: 'Nacido en predio' },
    { id: id('ANI'), arete: 'ARQ-1005', nombre: 'Nube', especie: 'Alpaca', raza: 'Huacaya', sexo: 'Hembra', nac: '2025-01-08', color: 'Crema', padre: 'ANI-00002', madre: 'ANI-00001', linea: 'Linea Pacomarca 3', lote: 'LOT-00001', proc: 'Nacido en predio' },
    { id: id('ANI'), arete: 'ARQ-1006', nombre: 'Rayo', especie: 'Oveja', raza: 'Merino', sexo: 'Macho', nac: '2024-03-22', color: 'Blanco', padre: '', madre: '', linea: 'Linea Merino Australiana', lote: 'LOT-00002', proc: 'Comprado' },
    { id: id('ANI'), arete: 'ARQ-1007', nombre: 'Puka', especie: 'Llama', raza: 'Ckara', sexo: 'Hembra', nac: '2024-07-14', color: 'Rojo', padre: '', madre: '', linea: 'Linea Ckara', lote: 'LOT-00001', proc: 'Nacido en predio' },
    { id: id('ANI'), arete: 'ARQ-1008', nombre: 'Wayra', especie: 'Alpaca', raza: 'Huacaya', sexo: 'Macho', nac: '2023-10-05', color: 'Blanco', padre: '', madre: '', linea: 'Linea Pacomarca 3', lote: 'LOT-00001', proc: 'Nacido en predio' },
    { id: id('ANI'), arete: 'ARQ-1009', nombre: 'Killa', especie: 'Oveja', raza: 'Criolla', sexo: 'Hembra', nac: '2025-02-18', color: 'Negro', padre: '', madre: '', linea: '', lote: 'LOT-00002', proc: 'Nacido en predio' },
    { id: id('ANI'), arete: 'ARQ-1010', nombre: 'Inti', especie: 'Bovino', raza: 'Holstein', sexo: 'Macho', nac: '2024-05-30', color: 'Blanco y negro', padre: '', madre: '', linea: 'Linea Holstein', lote: 'LOT-00003', proc: 'Donado' }
  ];

  animales.forEach(a => {
    const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://agrovelas.pe/animal/' + a.id;
    const fenId = id('FEN');
    const genId = id('GEN');
    reg('Animales', { id_animal: a.id, codigo_arete_rfid: a.arete, nombre: a.nombre, especie: a.especie, raza: a.raza, sexo: a.sexo, fecha_nacimiento: a.nac, edad_actual: '', color_principal: a.color, id_padre: a.padre, id_madre: a.madre, linea_genetica: a.linea, procedencia: a.proc, id_lote_cabana: a.lote, estado: 'Activo', fecha_registro: hoy, registrado_por: 'USR-00001', codigo_qr_url: qr, foto_principal_url: '', observaciones_generales: '' });
    reg('Registro_Fenotipico', { id_fenotipico: fenId, id_animal: a.id, fecha_evaluacion: hoy, peso_kg: Math.round(30 + Math.random()*40), altura_cruz_cm: Math.round(60 + Math.random()*40), longitud_corporal_cm: Math.round(80 + Math.random()*30), perimetro_toracico_cm: Math.round(70 + Math.random()*30), condicion_corporal: Math.floor(2 + Math.random()*3).toString(), tipo_fibra: a.especie === 'Alpaca' || a.especie === 'Llama' ? a.raza : '', color_fibra: a.color, marcas_distintivas: '', evaluado_por: 'ZOO-00003', observaciones: '' });
    reg('Registro_Genotipico', { id_genotipico: genId, id_animal: a.id, categoria_registro: 'Nucleo', pureza_genetica_pct: 85 + Math.random()*10, finura_fibra_um: a.especie === 'Alpaca' ? (18 + Math.random()*5).toFixed(1) : '', categoria_fibra: a.especie === 'Alpaca' ? 'Baby' : '', densidad_vellon: 'Media', uniformidad_vellon: 'Alta', certificado_genealogico_url: '', antecedentes_geneticos: '', enfermedades_hereditarias_conocidas: 'Ninguna reportada', fecha_registro: hoy, observaciones: '' });
    if (a.especie === 'Alpaca' || a.especie === 'Oveja') {
      reg('Esquila', { id_esquila: id('ESQ'), id_animal: a.id, fecha_esquila: '2026-05-' + String(Math.floor(1+Math.random()*30)).padStart(2,'0'), peso_vellon_kg: parseFloat((1 + Math.random()*2).toFixed(2)), categoria_fibra: 'Baby', micronaje_um: parseFloat((20 + Math.random()*4).toFixed(1)), longitud_mecha_cm: parseFloat((8 + Math.random()*3).toFixed(1)), color_fibra: a.color, destino: 'Venta directa', comprador: 'Acopiadora Sur SAC', precio_por_kg: 18.50, ingreso_total: 0, responsable: 'USR-00001', observaciones: '' });
    }
    reg('Multimedia', { id_multimedia: id('MUL'), id_animal: a.id, tipo_archivo: 'Foto', url_archivo: 'https://drive.google.com/demo/'+a.id, descripcion: 'Foto principal de '+a.nombre, fecha_subida: hoy, subido_por: 'USR-00001' });
  });

  reg('Reproduccion', { id_reproduccion: id('REP'), id_animal_hembra: 'ANI-00001', tipo_evento: 'Empadre/Monta', fecha_evento: '2025-12-10', id_macho: 'ANI-00002', metodo: 'Monta natural', resultado: 'Positivo', fecha_probable_parto: '2026-11-20', numero_crias: 1, id_cria: 'ANI-00005', responsable: 'USR-00001', observaciones: 'Empadre exitoso' });
  reg('Reproduccion', { id_reproduccion: id('REP'), id_animal_hembra: 'ANI-00001', tipo_evento: 'Parto', fecha_evento: '2026-11-15', id_macho: '', metodo: 'Monta natural', resultado: 'Positivo', fecha_probable_parto: '', numero_crias: 1, id_cria: 'ANI-00005', responsable: 'USR-00001', observaciones: 'Parto sin complicaciones' });
  reg('Reproduccion', { id_reproduccion: id('REP'), id_animal_hembra: 'ANI-00003', tipo_evento: 'Inseminación artificial', fecha_evento: '2026-03-22', id_macho: 'ANI-00006', metodo: 'Inseminación artificial', resultado: 'Pendiente', fecha_probable_parto: '2026-08-19', numero_crias: 0, id_cria: '', responsable: 'ZOO-00001', observaciones: 'Inseminacion con semen importado' });
  reg('Reproduccion', { id_reproduccion: id('REP'), id_animal_hembra: 'ANI-00007', tipo_evento: 'Diagnóstico de gestación', fecha_evento: '2026-06-10', id_macho: '', metodo: 'Ecografía', resultado: 'Positivo', fecha_probable_parto: '2026-11-15', numero_crias: 1, id_cria: '', responsable: 'USR-00004', observaciones: 'Gestacion confirmada' });

  reg('Sanidad', { id_sanidad: id('SAN'), id_animal: 'ANI-00001', fecha: '2026-04-02', tipo_evento: 'Vacunación', nombre_producto: 'Triple bacteriana', dosis: '2 ml SC', via_aplicacion: 'Subcutánea', diagnostico: '', sintomas_observados: '', veterinario_responsable: 'USR-00004', proxima_fecha_aplicacion: '2026-10-02', costo: 25, estado: 'Aplicado', observaciones: '' });
  reg('Sanidad', { id_sanidad: id('SAN'), id_animal: 'ANI-00003', fecha: '2026-05-15', tipo_evento: 'Desparasitación', nombre_producto: 'Ivermectina 1%', dosis: '1 ml SC', via_aplicacion: 'Subcutánea', diagnostico: '', sintomas_observados: '', veterinario_responsable: 'USR-00004', proxima_fecha_aplicacion: '2026-08-15', costo: 15, estado: 'Aplicado', observaciones: '' });
  reg('Sanidad', { id_sanidad: id('SAN'), id_animal: 'ANI-00005', fecha: '2026-06-01', tipo_evento: 'Vacunación', nombre_producto: 'Clostridiales', dosis: '2 ml IM', via_aplicacion: 'Intramuscular', diagnostico: '', sintomas_observados: '', veterinario_responsable: 'USR-00004', proxima_fecha_aplicacion: '2026-12-01', costo: 22, estado: 'Aplicado', observaciones: '' });
  reg('Sanidad', { id_sanidad: id('SAN'), id_animal: 'ANI-00008', fecha: hoy, tipo_evento: 'Tratamiento', nombre_producto: 'Antibiótico', dosis: '3 ml IM', via_aplicacion: 'Intramuscular', diagnostico: 'Infección respiratoria', sintomas_observados: 'Tos, secreción nasal, decaimiento', veterinario_responsable: 'USR-00004', proxima_fecha_aplicacion: '', costo: 35, estado: 'Aplicado', observaciones: '' });
  reg('Sanidad', { id_sanidad: id('SAN'), id_animal: 'ANI-00004', fecha: '2026-06-10', tipo_evento: 'Control de rutina', nombre_producto: '', dosis: '', via_aplicacion: '', diagnostico: 'Saludable', sintomas_observados: '', veterinario_responsable: 'ZOO-00001', proxima_fecha_aplicacion: '', costo: 0, estado: 'Aplicado', observaciones: 'Revision general sin novedades' });
  reg('Sanidad', { id_sanidad: id('SAN'), id_animal: 'ANI-00010', fecha: '2026-06-12', tipo_evento: 'Diagnóstico', nombre_producto: '', dosis: '', via_aplicacion: '', diagnostico: 'Cojea miembro posterior', sintomas_observados: 'Claudicación leve', veterinario_responsable: 'USR-00004', proxima_fecha_aplicacion: '', costo: 0, estado: 'Programado', observaciones: 'Evaluar en 15 días' });

  reg('Animales_Alerta', { id_alerta: id('ALE'), id_animal: 'ANI-00008', fecha_reporte: '2026-06-15 07:40', reportado_por: 'USR-00001', sintomas: 'Decaimiento, no come, secreción nasal', nivel_urgencia: 'Alta', zootecnista_asignado: 'ZOO-00003', veterinario_asignado: 'USR-00004', estado: 'En seguimiento', diagnostico_final: '', id_sanidad_relacionado: 'SAN-00004', fecha_resolucion: '' });
  reg('Animales_Alerta', { id_alerta: id('ALE'), id_animal: 'ANI-00004', fecha_reporte: '2026-06-10 09:00', reportado_por: 'USR-00005', sintomas: 'Cojea al caminar', nivel_urgencia: 'Media', zootecnista_asignado: 'ZOO-00001', veterinario_asignado: '', estado: 'Derivado', diagnostico_final: 'Lesión en casco', id_sanidad_relacionado: 'SAN-00005', fecha_resolucion: '' });
  reg('Animales_Alerta', { id_alerta: id('ALE'), id_animal: 'ANI-00010', fecha_reporte: '2026-06-12 14:30', reportado_por: 'USR-00001', sintomas: 'Claudicación del miembro posterior derecho', nivel_urgencia: 'Baja', zootecnista_asignado: '', veterinario_asignado: 'USR-00004', estado: 'En seguimiento', diagnostico_final: '', id_sanidad_relacionado: 'SAN-00006', fecha_resolucion: '' });

  reg('Ubicacion_Manejo', { id_movimiento: id('MOV'), id_animal: 'ANI-00001', fecha: '2026-05-01 08:00', tipo_movimiento: 'Ingreso', id_lote_origen: '', id_lote_destino: 'LOT-00001', latitud: -13.5320, longitud: -71.9675, responsable: 'USR-00001', motivo: 'Registro inicial', observaciones: '' });
  reg('Ubicacion_Manejo', { id_movimiento: id('MOV'), id_animal: 'ANI-00005', fecha: '2026-06-01 10:00', tipo_movimiento: 'Traslado interno', id_lote_origen: 'LOT-00001', id_lote_destino: 'LOT-00001', latitud: -13.5330, longitud: -71.9680, responsable: 'USR-00001', motivo: 'Separación para destete', observaciones: '' });

  reg('Contabilidad', { id_movimiento_contable: id('CTB'), fecha: '2026-05-20', tipo: 'Ingreso', categoria: 'Venta de fibra', monto: 342.30, id_animal_relacionado: 'ANI-00001', id_esquila_relacionada: '', descripcion: 'Venta de vellón de alpaca Huacaya', comprobante_url: '', registrado_por: 'USR-00001' });
  reg('Contabilidad', { id_movimiento_contable: id('CTB'), fecha: '2026-05-25', tipo: 'Ingreso', categoria: 'Venta de animal', monto: 1500.00, id_animal_relacionado: '', id_esquila_relacionada: '', descripcion: 'Venta de bovino', comprobante_url: '', registrado_por: 'USR-00001' });
  reg('Contabilidad', { id_movimiento_contable: id('CTB'), fecha: '2026-06-02', tipo: 'Egreso', categoria: 'Compra de insumos', monto: 180.50, id_animal_relacionado: '', id_esquila_relacionada: '', descripcion: 'Vacunas y desparasitantes', comprobante_url: '', registrado_por: 'USR-00001' });
  reg('Contabilidad', { id_movimiento_contable: id('CTB'), fecha: '2026-06-05', tipo: 'Egreso', categoria: 'Honorarios veterinario', monto: 80.00, id_animal_relacionado: 'ANI-00008', id_esquila_relacionada: '', descripcion: 'Consulta veterinaria', comprobante_url: '', registrado_por: 'USR-00001' });
  reg('Contabilidad', { id_movimiento_contable: id('CTB'), fecha: '2026-06-08', tipo: 'Ingreso', categoria: 'Venta de fibra', monto: 285.60, id_animal_relacionado: 'ANI-00003', id_esquila_relacionada: '', descripcion: 'Venta de lana de oveja Corriedale', comprobante_url: '', registrado_por: 'USR-00001' });
  reg('Contabilidad', { id_movimiento_contable: id('CTB'), fecha: '2026-06-10', tipo: 'Egreso', categoria: 'Alimentación', monto: 450.00, id_animal_relacionado: '', id_esquila_relacionada: '', descripcion: 'Compra de alfalfa y concentrado', comprobante_url: '', registrado_por: 'USR-00001' });

  reg('Calendario_Actividades', { id_actividad: id('CAL'), titulo: 'Vacunación Lote Potrero Alto', tipo: 'Vacunación', fecha: '2026-07-01', hora: '08:00', id_animal_relacionado: '', id_lote_relacionado: 'LOT-00001', responsable: 'USR-00001', estado: 'Pendiente', descripcion: 'Vacunación programada para alpacas' });
  reg('Calendario_Actividades', { id_actividad: id('CAL'), titulo: 'Esquila de ovejas', tipo: 'Esquila', fecha: '2026-07-15', hora: '09:00', id_animal_relacionado: '', id_lote_relacionado: 'LOT-00002', responsable: 'USR-00001', estado: 'Pendiente', descripcion: 'Esquila de lote de ovejas Corriedale' });
  reg('Calendario_Actividades', { id_actividad: id('CAL'), titulo: 'Cita con zootecnista', tipo: 'Cita con zootecnista', fecha: '2026-06-25', hora: '10:00', id_animal_relacionado: 'ANI-00008', id_lote_relacionado: '', responsable: 'USR-00001', estado: 'Pendiente', descripcion: 'Revisión de alpaca con síntomas respiratorios' });
  reg('Calendario_Actividades', { id_actividad: id('CAL'), titulo: 'Control sanitario', tipo: 'Control sanitario', fecha: '2026-07-05', hora: '14:00', id_animal_relacionado: '', id_lote_relacionado: 'LOT-00003', responsable: 'USR-00005', estado: 'Pendiente', descripcion: 'Control de rutina de bovinos' });

  reg('Citas_Zootecnista', { id_cita: id('CIT'), id_zootecnista: 'ZOO-00001', id_usuario_solicitante: 'USR-00001', id_animal_relacionado: 'ANI-00008', fecha: '2026-06-25', hora: '10:00', motivo: 'Revisión de alpaca con síntomas respiratorios', estado: 'Pendiente', notas_zootecnista: '', calificacion_recibida: 0, fecha_creacion: hoy + ' 09:00' });
  reg('Citas_Zootecnista', { id_cita: id('CIT'), id_zootecnista: 'ZOO-00002', id_usuario_solicitante: 'USR-00005', id_animal_relacionado: 'ANI-00004', fecha: '2026-06-20', hora: '14:00', motivo: 'Evaluación de cojera en bovino', estado: 'Confirmada', notas_zootecnista: '', calificacion_recibida: 0, fecha_creacion: '2026-06-10 11:00' });

  reg('Notificaciones', { id_notificacion: id('NOT'), id_usuario_destino: 'USR-00001', tipo: 'Recordatorio de vacuna', mensaje: 'La alpaca ANI-00001 tiene vacuna programada para el 2026-10-02', fecha_generacion: hoy + ' 06:00', leido: 'No', prioridad: 'Media', id_relacionado: 'SAN-00001', tipo_relacionado: 'Sanidad' });
  reg('Notificaciones', { id_notificacion: id('NOT'), id_usuario_destino: 'USR-00001', tipo: 'Alerta sanitaria', mensaje: 'La alpaca ANI-00008 está en seguimiento por problemas respiratorios', fecha_generacion: '2026-06-15 07:40', leido: 'No', prioridad: 'Alta', id_relacionado: 'ALE-00001', tipo_relacionado: 'Animales_Alerta' });
  reg('Notificaciones', { id_notificacion: id('NOT'), id_usuario_destino: 'USR-00001', tipo: 'Cita confirmada', mensaje: 'Tu cita con Carlos Huillca para el 25/06/2026 ha sido agendada', fecha_generacion: hoy + ' 09:15', leido: 'No', prioridad: 'Media', id_relacionado: 'CIT-00001', tipo_relacionado: 'Citas_Zootecnista' });
  reg('Notificaciones', { id_notificacion: id('NOT'), id_usuario_destino: 'USR-00005', tipo: 'General', mensaje: 'El bovino ANI-00004 tiene control sanitario programado', fecha_generacion: hoy + ' 06:00', leido: 'No', prioridad: 'Baja', id_relacionado: 'SAN-00005', tipo_relacionado: 'Sanidad' });

  reg('IoT_Dispositivos', { id_dispositivo: id('DIS'), id_animal: 'ANI-00001', tipo_dispositivo: 'Collar GPS', codigo_dispositivo: 'GPS-AL01', fecha_instalacion: '2026-04-01', estado_bateria_pct: 78, estado: 'Activo', ultima_latitud: -13.5321, ultima_longitud: -71.9670, fecha_ultima_lectura: hoy + ' 06:30' });
  reg('IoT_Dispositivos', { id_dispositivo: id('DIS'), id_animal: 'ANI-00002', tipo_dispositivo: 'Collar GPS', codigo_dispositivo: 'GPS-AL02', fecha_instalacion: '2026-04-01', estado_bateria_pct: 65, estado: 'Activo', ultima_latitud: -13.5350, ultima_longitud: -71.9690, fecha_ultima_lectura: hoy + ' 06:30' });
  reg('IoT_Dispositivos', { id_dispositivo: id('DIS'), id_animal: 'ANI-00003', tipo_dispositivo: 'Caravana RFID', codigo_dispositivo: 'RFID-OV01', fecha_instalacion: '2026-05-15', estado_bateria_pct: 92, estado: 'Activo', ultima_latitud: -13.5400, ultima_longitud: -71.9600, fecha_ultima_lectura: hoy + ' 06:30' });
  reg('IoT_Dispositivos', { id_dispositivo: id('DIS'), id_animal: 'ANI-00008', tipo_dispositivo: 'Sensor LoRa', codigo_dispositivo: 'LORA-001', fecha_instalacion: '2026-03-20', estado_bateria_pct: 45, estado: 'Activo', ultima_latitud: -13.5330, ultima_longitud: -71.9680, fecha_ultima_lectura: hoy + ' 06:00' });

  return 'Datos demo cargados correctamente: 10 animales, 3 lotes, 4 zootecnistas, 6 registros sanitarios, 3 alertas, 6 movimientos contables, 4 actividades y mas.';
}

function calcularResumenContable(fechaInicio, fechaFin) {
  const movs = obtenerRegistros('Contabilidad', {});
  let ingresos = 0, egresos = 0, detalle = [];
  movs.forEach(m => {
    if (m.fecha >= fechaInicio && m.fecha <= fechaFin) {
      if (m.tipo === 'Ingreso') ingresos += parseFloat(m.monto) || 0;
      else egresos += parseFloat(m.monto) || 0;
      detalle.push(m);
    }
  });
  return { ingresos, egresos, balance: ingresos - egresos, detalle };
}
