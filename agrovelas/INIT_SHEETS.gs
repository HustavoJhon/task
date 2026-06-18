/**
 * AGROVELAS — Inicialización de Google Sheets
 *
 * CÓMO USAR:
 * 1. Crear un Google Sheet nuevo: https://sheets.new
 * 2. Extensiones > Apps Script
 * 3. Pegar TODO este archivo
 * 4. Guardar (Ctrl+S) y dar nombre "AGROVELAS Init"
 * 5. Seleccionar función "inicializarBaseDeDatos" y click en "Ejecutar"
 * 6. Aceptar permisos (primera vez)
 * 7. Listo — se crearán las 22 hojas con encabezados
 */

function inicializarBaseDeDatos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setName('AGROVELAS_Data');

  var estructuras = [
    {
      nombre: 'Usuarios',
      columnas: ['id_usuario', 'nombre_completo', 'correo', 'usuario_login', 'contrasena_hash', 'sal', 'rol',
        'telefono', 'foto_perfil_url', 'estado', 'fecha_creacion', 'ultimo_acceso', 'intentos_fallidos']
    },
    {
      nombre: 'Zootecnistas',
      columnas: ['id_zootecnista', 'id_usuario', 'especialidad', 'anios_experiencia', 'calificacion_promedio',
        'numero_calificaciones', 'tarifa_consulta', 'zona_cobertura', 'telefono_contacto', 'correo_contacto',
        'biografia', 'foto_url', 'horario_disponible_json', 'estado']
    },
    {
      nombre: 'Animales',
      columnas: ['id_animal', 'codigo_arete_rfid', 'nombre', 'especie', 'raza', 'sexo', 'fecha_nacimiento',
        'edad_actual', 'color_principal', 'id_padre', 'id_madre', 'linea_genetica', 'procedencia',
        'id_lote_cabana', 'estado', 'fecha_registro', 'registrado_por', 'codigo_qr_url', 'foto_principal_url',
        'observaciones_generales']
    },
    {
      nombre: 'Registro_Fenotipico',
      columnas: ['id_fenotipico', 'id_animal', 'fecha_evaluacion', 'peso_kg', 'altura_cruz_cm',
        'longitud_corporal_cm', 'perimetro_toracico_cm', 'condicion_corporal', 'tipo_fibra', 'color_fibra',
        'marcas_distintivas', 'evaluado_por', 'observaciones']
    },
    {
      nombre: 'Registro_Genotipico',
      columnas: ['id_genotipico', 'id_animal', 'categoria_registro', 'pureza_genetica_pct', 'finura_fibra_um',
        'categoria_fibra', 'densidad_vellon', 'uniformidad_vellon', 'certificado_genealogico_url',
        'antecedentes_geneticos', 'enfermedades_hereditarias_conocidas', 'fecha_registro', 'observaciones']
    },
    {
      nombre: 'Reproduccion',
      columnas: ['id_reproduccion', 'id_animal_hembra', 'tipo_evento', 'fecha_evento', 'id_macho', 'metodo',
        'resultado', 'fecha_probable_parto', 'numero_crias', 'id_cria', 'responsable', 'observaciones']
    },
    {
      nombre: 'Sanidad',
      columnas: ['id_sanidad', 'id_animal', 'fecha', 'tipo_evento', 'nombre_producto', 'dosis', 'via_aplicacion',
        'diagnostico', 'sintomas_observados', 'veterinario_responsable', 'proxima_fecha_aplicacion', 'costo',
        'estado', 'observaciones']
    },
    {
      nombre: 'Animales_Alerta',
      columnas: ['id_alerta', 'id_animal', 'fecha_reporte', 'reportado_por', 'sintomas', 'nivel_urgencia',
        'zootecnista_asignado', 'veterinario_asignado', 'estado', 'diagnostico_final',
        'id_sanidad_relacionado', 'fecha_resolucion']
    },
    {
      nombre: 'Ubicacion_Manejo',
      columnas: ['id_movimiento', 'id_animal', 'fecha', 'tipo_movimiento', 'id_lote_origen', 'id_lote_destino',
        'latitud', 'longitud', 'responsable', 'motivo', 'observaciones']
    },
    {
      nombre: 'Lotes_Cabanas',
      columnas: ['id_lote', 'nombre_lote', 'tipo_animal_predominante', 'capacidad_maxima', 'animales_actuales',
        'ubicacion_descripcion', 'latitud_centro', 'longitud_centro', 'responsable', 'estado']
    },
    {
      nombre: 'Esquila',
      columnas: ['id_esquila', 'id_animal', 'fecha_esquila', 'peso_vellon_kg', 'categoria_fibra', 'micronaje_um',
        'longitud_mecha_cm', 'color_fibra', 'destino', 'comprador', 'precio_por_kg', 'ingreso_total',
        'responsable', 'observaciones']
    },
    {
      nombre: 'Contabilidad',
      columnas: ['id_movimiento_contable', 'fecha', 'tipo', 'categoria', 'monto', 'id_animal_relacionado',
        'id_esquila_relacionada', 'descripcion', 'comprobante_url', 'registrado_por']
    },
    {
      nombre: 'Multimedia',
      columnas: ['id_multimedia', 'id_animal', 'tipo_archivo', 'url_archivo', 'descripcion', 'fecha_subida',
        'subido_por']
    },
    {
      nombre: 'Calendario_Actividades',
      columnas: ['id_actividad', 'titulo', 'tipo', 'fecha', 'hora', 'id_animal_relacionado',
        'id_lote_relacionado', 'responsable', 'estado', 'descripcion']
    },
    {
      nombre: 'Notificaciones',
      columnas: ['id_notificacion', 'id_usuario_destino', 'tipo', 'mensaje', 'fecha_generacion', 'leido',
        'prioridad', 'id_relacionado', 'tipo_relacionado']
    },
    {
      nombre: 'Citas_Zootecnista',
      columnas: ['id_cita', 'id_zootecnista', 'id_usuario_solicitante', 'id_animal_relacionado', 'fecha', 'hora',
        'motivo', 'estado', 'notas_zootecnista', 'calificacion_recibida', 'fecha_creacion']
    },
    {
      nombre: 'IoT_Dispositivos',
      columnas: ['id_dispositivo', 'id_animal', 'tipo_dispositivo', 'codigo_dispositivo', 'fecha_instalacion',
        'estado_bateria_pct', 'estado', 'ultima_latitud', 'ultima_longitud', 'fecha_ultima_lectura']
    },
    {
      nombre: 'IoT_Lecturas',
      columnas: ['id_lectura', 'id_dispositivo', 'fecha_hora', 'latitud', 'longitud', 'temperatura_corporal',
        'nivel_actividad']
    },
    {
      nombre: 'Listas',
      columnas: ['categoria', 'valor', 'orden', 'activo']
    },
    {
      nombre: 'Secuencias',
      columnas: ['prefijo', 'ultimo_numero']
    },
    {
      nombre: 'Logs_Sistema',
      columnas: ['id_log', 'fecha_hora', 'id_usuario', 'accion', 'modulo', 'detalle']
    },
    {
      nombre: 'Config_Sistema',
      columnas: ['clave', 'valor', 'descripcion']
    }
  ];

  // Crear cada hoja con sus encabezados
  estructuras.forEach(function(e) {
    var sheet = ss.getSheetByName(e.nombre);
    if (!sheet) {
      sheet = ss.insertSheet(e.nombre);
    }
    var headers = [e.columnas];
    sheet.getRange(1, 1, 1, e.columnas.length).setValues(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, e.columnas.length).setFontWeight('bold');
  });

  // Inicializar Secuencias con prefijos
  var seqSheet = ss.getSheetByName('Secuencias');
  var prefijos = ['USR', 'ZOO', 'ANI', 'FEN', 'GEN', 'REP', 'SAN', 'ALE', 'MOV', 'LOT',
    'ESQ', 'CTB', 'MUL', 'CAL', 'NOT', 'CIT', 'DIS', 'LEC', 'LOG'];
  var data = prefijos.map(function(p) { return [p, 0]; });
  seqSheet.getRange(2, 1, data.length, 2).setValues(data);

  // Poblar Listas con valores iniciales
  var listSheet = ss.getSheetByName('Listas');
  var listas = [
    ['Especie', 'Alpaca', 1, 'Sí'],
    ['Especie', 'Llama', 2, 'Sí'],
    ['Especie', 'Oveja', 3, 'Sí'],
    ['Especie', 'Bovino', 4, 'Sí'],
    ['Especie', 'Caprino', 5, 'Sí'],
    ['Raza_Alpaca', 'Huacaya', 1, 'Sí'],
    ['Raza_Alpaca', 'Suri', 2, 'Sí'],
    ['Raza_Oveja', 'Corriedale', 1, 'Sí'],
    ['Raza_Oveja', 'Criolla', 2, 'Sí'],
    ['Raza_Oveja', 'Merino', 3, 'Sí'],
    ['Raza_Bovino', 'Holstein', 1, 'Sí'],
    ['Raza_Bovino', 'Brown Swiss', 2, 'Sí'],
    ['Raza_Bovino', 'Criollo', 3, 'Sí'],
    ['Sexo', 'Macho', 1, 'Sí'],
    ['Sexo', 'Hembra', 2, 'Sí'],
    ['Rol_Usuario', 'Administrador', 1, 'Sí'],
    ['Rol_Usuario', 'Zootecnista', 2, 'Sí'],
    ['Rol_Usuario', 'Veterinario', 3, 'Sí'],
    ['Rol_Usuario', 'Ganadero', 4, 'Sí'],
    ['Rol_Usuario', 'Productor', 5, 'Sí'],
    ['Estado_Animal', 'Activo', 1, 'Sí'],
    ['Estado_Animal', 'Vendido', 2, 'Sí'],
    ['Estado_Animal', 'Muerto', 3, 'Sí'],
    ['Estado_Animal', 'Trasladado', 4, 'Sí'],
    ['Estado_Animal', 'Perdido', 5, 'Sí'],
    ['Categoria_Fibra', 'Baby (≤23µm)', 1, 'Sí'],
    ['Categoria_Fibra', 'Fleece (23.1–26.5µm)', 2, 'Sí'],
    ['Categoria_Fibra', 'Medium Fleece (26.6–29µm)', 3, 'Sí'],
    ['Categoria_Fibra', 'Huarizo (29.1–31.5µm)', 4, 'Sí'],
    ['Categoria_Fibra', 'Gruesa (>31.5µm)', 5, 'Sí'],
    ['Nivel_Urgencia', 'Baja', 1, 'Sí'],
    ['Nivel_Urgencia', 'Media', 2, 'Sí'],
    ['Nivel_Urgencia', 'Alta', 3, 'Sí'],
    ['Nivel_Urgencia', 'Crítica', 4, 'Sí'],
    ['Tipo_Evento_Sanitario', 'Vacunación', 1, 'Sí'],
    ['Tipo_Evento_Sanitario', 'Desparasitación', 2, 'Sí'],
    ['Tipo_Evento_Sanitario', 'Tratamiento', 3, 'Sí'],
    ['Tipo_Evento_Sanitario', 'Diagnóstico', 4, 'Sí'],
    ['Tipo_Evento_Sanitario', 'Cirugía', 5, 'Sí'],
    ['Tipo_Evento_Sanitario', 'Control de rutina', 6, 'Sí']
  ];
  listSheet.getRange(2, 1, listas.length, 4).setValues(listas);

  // Poblar Config_Sistema
  var cfgSheet = ss.getSheetByName('Config_Sistema');
  var config = [
    ['nombre_organizacion', 'AGROVELAS', 'Nombre del sistema'],
    ['dias_gestacion_alpaca', '345', 'Período de gestación de alpaca en días'],
    ['dias_gestacion_oveja', '150', 'Período de gestación de oveja en días'],
    ['dias_gestacion_bovino', '283', 'Período de gestación de bovino en días'],
    ['intentos_maximos_login', '5', 'Intentos fallidos antes de bloquear usuario'],
    ['version_sistema', '1.0.0', 'Versión actual del sistema']
  ];
  cfgSheet.getRange(2, 1, config.length, 3).setValues(config);

  SpreadsheetApp.getUi().alert('Base de datos AGROVELAS inicializada correctamente.\n\n22 hojas creadas con encabezados y datos iniciales.');
}
