# AGROVELAS — Google Sheet Structure

## How to create the Sheet

1. Go to [sheets.new](https://sheets.new)
2. Rename the spreadsheet to `AGROVELAS_Data`
3. Run the `inicializarBaseDeDatos()` function from `code.gs` (first time setup)
4. Or manually create the 22 tabs with the columns below

---

## Sheet name & columns

### Usuarios
id_usuario | nombre_completo | correo | usuario_login | contrasena_hash | sal | rol | telefono | foto_perfil_url | estado | fecha_creacion | ultimo_acceso | intentos_fallidos

### Zootecnistas
id_zootecnista | id_usuario | especialidad | anios_experiencia | calificacion_promedio | numero_calificaciones | tarifa_consulta | zona_cobertura | telefono_contacto | correo_contacto | biografia | foto_url | horario_disponible_json | estado

### Animales
id_animal | codigo_arete_rfid | nombre | especie | raza | sexo | fecha_nacimiento | edad_actual | color_principal | id_padre | id_madre | linea_genetica | procedencia | id_lote_cabana | estado | fecha_registro | registrado_por | codigo_qr_url | foto_principal_url | observaciones_generales

### Registro_Fenotipico
id_fenotipico | id_animal | fecha_evaluacion | peso_kg | altura_cruz_cm | longitud_corporal_cm | perimetro_toracico_cm | condicion_corporal | tipo_fibra | color_fibra | marcas_distintivas | evaluado_por | observaciones

### Registro_Genotipico
id_genotipico | id_animal | categoria_registro | pureza_genetica_pct | finura_fibra_um | categoria_fibra | densidad_vellon | uniformidad_vellon | certificado_genealogico_url | antecedentes_geneticos | enfermedades_hereditarias_conocidas | fecha_registro | observaciones

### Reproduccion
id_reproduccion | id_animal_hembra | tipo_evento | fecha_evento | id_macho | metodo | resultado | fecha_probable_parto | numero_crias | id_cria | responsable | observaciones

### Sanidad
id_sanidad | id_animal | fecha | tipo_evento | nombre_producto | dosis | via_aplicacion | diagnostico | sintomas_observados | veterinario_responsable | proxima_fecha_aplicacion | costo | estado | observaciones

### Animales_Alerta
id_alerta | id_animal | fecha_reporte | reportado_por | sintomas | nivel_urgencia | zootecnista_asignado | veterinario_asignado | estado | diagnostico_final | id_sanidad_relacionado | fecha_resolucion

### Ubicacion_Manejo
id_movimiento | id_animal | fecha | tipo_movimiento | id_lote_origen | id_lote_destino | latitud | longitud | responsable | motivo | observaciones

### Lotes_Cabanas
id_lote | nombre_lote | tipo_animal_predominante | capacidad_maxima | animales_actuales | ubicacion_descripcion | latitud_centro | longitud_centro | responsable | estado

### Esquila
id_esquila | id_animal | fecha_esquila | peso_vellon_kg | categoria_fibra | micronaje_um | longitud_mecha_cm | color_fibra | destino | comprador | precio_por_kg | ingreso_total | responsable | observaciones

### Contabilidad
id_movimiento_contable | fecha | tipo | categoria | monto | id_animal_relacionado | id_esquila_relacionada | descripcion | comprobante_url | registrado_por

### Multimedia
id_multimedia | id_animal | tipo_archivo | url_archivo | descripcion | fecha_subida | subido_por

### Calendario_Actividades
id_actividad | titulo | tipo | fecha | hora | id_animal_relacionado | id_lote_relacionado | responsable | estado | descripcion

### Notificaciones
id_notificacion | id_usuario_destino | tipo | mensaje | fecha_generacion | leido | prioridad | id_relacionado | tipo_relacionado

### Citas_Zootecnista
id_cita | id_zootecnista | id_usuario_solicitante | id_animal_relacionado | fecha | hora | motivo | estado | notas_zootecnista | calificacion_recibida | fecha_creacion

### IoT_Dispositivos
id_dispositivo | id_animal | tipo_dispositivo | codigo_dispositivo | fecha_instalacion | estado_bateria_pct | estado | ultima_latitud | ultima_longitud | fecha_ultima_lectura

### IoT_Lecturas
id_lectura | id_dispositivo | fecha_hora | latitud | longitud | temperatura_corporal | nivel_actividad

### Listas
categoria | valor | orden | activo

### Secuencias
prefijo | ultimo_numero

### Logs_Sistema
id_log | fecha_hora | id_usuario | accion | modulo | detalle

### Config_Sistema
clave | valor | descripcion

---

## ID prefixes

| Prefix | Sheet |
|--------|-------|
| USR | Usuarios |
| ZOO | Zootecnistas |
| ANI | Animales |
| FEN | Registro_Fenotipico |
| GEN | Registro_Genotipico |
| REP | Reproduccion |
| SAN | Sanidad |
| ALE | Animales_Alerta |
| MOV | Ubicacion_Manejo |
| LOT | Lotes_Cabanas |
| ESQ | Esquila |
| CTB | Contabilidad |
| MUL | Multimedia |
| CAL | Calendario_Actividades |
| NOT | Notificaciones |
| CIT | Citas_Zootecnista |
| DIS | IoT_Dispositivos |
| LEC | IoT_Lecturas |
| LOG | Logs_Sistema |

---

## Validation dropdowns (prepare in Listas sheet)

Categorias: Especie, Raza_Alpaca, Raza_Oveja, Raza_Bovino, Raza_Caprino, Sexo, Estado_Animal, Tipo_Evento_Reproductivo, Tipo_Evento_Sanitario, Via_Aplicacion, Nivel_Urgencia, Estado_Alerta, Tipo_Movimiento, Rol_Usuario, Especialidad_Zootecnista, Categoria_Fibra, Categoria_Contable, Tipo_Notificacion, Estado_Cita, Tipo_Dispositivo_IoT, Tipo_Actividad_Calendario, Procedencia, Destino_Esquila, Estado_Actividad, Tipo_Multimedia, Estado_Dispositivo, Nivel_Actividad_IoT
