function inicializarBaseDeDatos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setName('AGROVELAS_Data');
  var h = [
    ['Usuarios',['id_usuario','nombre_completo','correo','usuario_login','contrasena_hash','sal','rol','telefono','foto_perfil_url','estado','fecha_creacion','ultimo_acceso','intentos_fallidos']],
    ['Zootecnistas',['id_zootecnista','id_usuario','especialidad','anios_experiencia','calificacion_promedio','numero_calificaciones','tarifa_consulta','zona_cobertura','telefono_contacto','correo_contacto','biografia','foto_url','horario_disponible_json','estado']],
    ['Animales',['id_animal','codigo_arete_rfid','nombre','especie','raza','sexo','fecha_nacimiento','edad_actual','color_principal','id_padre','id_madre','linea_genetica','procedencia','id_lote_cabana','estado','fecha_registro','registrado_por','codigo_qr_url','foto_principal_url','observaciones_generales']],
    ['Registro_Fenotipico',['id_fenotipico','id_animal','fecha_evaluacion','peso_kg','altura_cruz_cm','longitud_corporal_cm','perimetro_toracico_cm','condicion_corporal','tipo_fibra','color_fibra','marcas_distintivas','evaluado_por','observaciones']],
    ['Registro_Genotipico',['id_genotipico','id_animal','categoria_registro','pureza_genetica_pct','finura_fibra_um','categoria_fibra','densidad_vellon','uniformidad_vellon','certificado_genealogico_url','antecedentes_geneticos','enfermedades_hereditarias_conocidas','fecha_registro','observaciones']],
    ['Reproduccion',['id_reproduccion','id_animal_hembra','tipo_evento','fecha_evento','id_macho','metodo','resultado','fecha_probable_parto','numero_crias','id_cria','responsable','observaciones']],
    ['Sanidad',['id_sanidad','id_animal','fecha','tipo_evento','nombre_producto','dosis','via_aplicacion','diagnostico','sintomas_observados','veterinario_responsable','proxima_fecha_aplicacion','costo','estado','observaciones']],
    ['Animales_Alerta',['id_alerta','id_animal','fecha_reporte','reportado_por','sintomas','nivel_urgencia','zootecnista_asignado','veterinario_asignado','estado','diagnostico_final','id_sanidad_relacionado','fecha_resolucion']],
    ['Ubicacion_Manejo',['id_movimiento','id_animal','fecha','tipo_movimiento','id_lote_origen','id_lote_destino','latitud','longitud','responsable','motivo','observaciones']],
    ['Lotes_Cabanas',['id_lote','nombre_lote','tipo_animal_predominante','capacidad_maxima','animales_actuales','ubicacion_descripcion','latitud_centro','longitud_centro','responsable','estado']],
    ['Esquila',['id_esquila','id_animal','fecha_esquila','peso_vellon_kg','categoria_fibra','micronaje_um','longitud_mecha_cm','color_fibra','destino','comprador','precio_por_kg','ingreso_total','responsable','observaciones']],
    ['Contabilidad',['id_movimiento_contable','fecha','tipo','categoria','monto','id_animal_relacionado','id_esquila_relacionada','descripcion','comprobante_url','registrado_por']],
    ['Multimedia',['id_multimedia','id_animal','tipo_archivo','url_archivo','descripcion','fecha_subida','subido_por']],
    ['Calendario_Actividades',['id_actividad','titulo','tipo','fecha','hora','id_animal_relacionado','id_lote_relacionado','responsable','estado','descripcion']],
    ['Notificaciones',['id_notificacion','id_usuario_destino','tipo','mensaje','fecha_generacion','leido','prioridad','id_relacionado','tipo_relacionado']],
    ['Citas_Zootecnista',['id_cita','id_zootecnista','id_usuario_solicitante','id_animal_relacionado','fecha','hora','motivo','estado','notas_zootecnista','calificacion_recibida','fecha_creacion']],
    ['IoT_Dispositivos',['id_dispositivo','id_animal','tipo_dispositivo','codigo_dispositivo','fecha_instalacion','estado_bateria_pct','estado','ultima_latitud','ultima_longitud','fecha_ultima_lectura']],
    ['IoT_Lecturas',['id_lectura','id_dispositivo','fecha_hora','latitud','longitud','temperatura_corporal','nivel_actividad']],
    ['Listas',['categoria','valor','orden','activo']],
    ['Secuencias',['prefijo','ultimo_numero']],
    ['Logs_Sistema',['id_log','fecha_hora','id_usuario','accion','modulo','detalle']],
    ['Config_Sistema',['clave','valor','descripcion']]
  ];
  h.forEach(function(e){
    var sheet = ss.getSheetByName(e[0]) || ss.insertSheet(e[0]);
    sheet.getRange(1,1,1,e[1].length).setValues([e[1]]);
    sheet.setFrozenRows(1);
    sheet.getRange(1,1,1,e[1].length).setFontWeight('bold');
  });
  var seq = ss.getSheetByName('Secuencias');
  seq.getRange(2,1,19,2).setValues(['USR','ZOO','ANI','FEN','GEN','REP','SAN','ALE','MOV','LOT','ESQ','CTB','MUL','CAL','NOT','CIT','DIS','LEC','LOG'].map(function(p){return[p,0]}));
  var listas = [
    ['Especie','Alpaca',1,'Sí'],['Especie','Llama',2,'Sí'],['Especie','Oveja',3,'Sí'],['Especie','Bovino',4,'Sí'],['Especie','Caprino',5,'Sí'],
    ['Raza_Alpaca','Huacaya',1,'Sí'],['Raza_Alpaca','Suri',2,'Sí'],
    ['Raza_Oveja','Corriedale',1,'Sí'],['Raza_Oveja','Criolla',2,'Sí'],['Raza_Oveja','Merino',3,'Sí'],
    ['Raza_Bovino','Holstein',1,'Sí'],['Raza_Bovino','Brown Swiss',2,'Sí'],['Raza_Bovino','Criollo',3,'Sí'],
    ['Sexo','Macho',1,'Sí'],['Sexo','Hembra',2,'Sí'],
    ['Rol_Usuario','Administrador',1,'Sí'],['Rol_Usuario','Zootecnista',2,'Sí'],['Rol_Usuario','Veterinario',3,'Sí'],['Rol_Usuario','Ganadero',4,'Sí'],['Rol_Usuario','Productor',5,'Sí'],
    ['Estado_Animal','Activo',1,'Sí'],['Estado_Animal','Vendido',2,'Sí'],['Estado_Animal','Muerto',3,'Sí'],['Estado_Animal','Trasladado',4,'Sí'],['Estado_Animal','Perdido',5,'Sí'],
    ['Categoria_Fibra','Baby (≤23µm)',1,'Sí'],['Categoria_Fibra','Fleece (23.1–26.5µm)',2,'Sí'],['Categoria_Fibra','Medium Fleece (26.6–29µm)',3,'Sí'],['Categoria_Fibra','Huarizo (29.1–31.5µm)',4,'Sí'],['Categoria_Fibra','Gruesa (>31.5µm)',5,'Sí'],
    ['Nivel_Urgencia','Baja',1,'Sí'],['Nivel_Urgencia','Media',2,'Sí'],['Nivel_Urgencia','Alta',3,'Sí'],['Nivel_Urgencia','Crítica',4,'Sí'],
    ['Tipo_Evento_Sanitario','Vacunación',1,'Sí'],['Tipo_Evento_Sanitario','Desparasitación',2,'Sí'],['Tipo_Evento_Sanitario','Tratamiento',3,'Sí'],['Tipo_Evento_Sanitario','Diagnóstico',4,'Sí'],['Tipo_Evento_Sanitario','Cirugía',5,'Sí'],['Tipo_Evento_Sanitario','Control de rutina',6,'Sí']
  ];
  ss.getSheetByName('Listas').getRange(2,1,listas.length,4).setValues(listas);
  SpreadsheetApp.getUi().alert('AGROVELAS: 22 hojas creadas correctamente.');
}
