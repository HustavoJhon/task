# AGROVELAS — Especificación de Base de Datos (Google Sheets)

**Versión:** 1.0
**Tipo de documento:** Spec funcional para Spec-Driven Development (SDD)
**Consumidor de este documento:** OpenCode / agente de IA que generará `Código.gs` e `index.html`
**Fuente de contexto de negocio:** Informe 1° AGROVELAS (Cusco, camélidos sudamericanos, ovinos, bovinos)

---

## 0. Propósito de este documento

Este documento define la estructura completa de la base de datos del sistema AGROVELAS, implementada como un **Google Sheet** (un solo archivo de cálculo con múltiples hojas/pestañas). No contiene código; es la fuente de verdad que `Código.gs` debe leer, escribir y validar. El propio `Código.gs` debe incluir una función de inicialización (`inicializarBaseDeDatos()`) que cree esta estructura automáticamente la primera vez que se ejecuta el sistema, para evitar errores de tipeo al crear las hojas a mano.

## 1. Convenciones generales

Estas reglas aplican a todas las hojas:

| Convención | Regla |
| --- | --- |
| Fila de encabezado | Fila 1 de cada hoja, congelada (`frozen rows = 1`), en negrita |
| Nombres de columna | `snake_case`, sin tildes, sin espacios (ej. `fecha_nacimiento`) |
| Formato de fechas | `yyyy-mm-dd` (ej. `2026-06-18`) |
| Formato de fecha+hora | `yyyy-mm-dd hh:mm` (24 horas) |
| Booleanos | Texto `"Sí"` / `"No"` (más legible para usuarios finales que `TRUE/FALSE`, pero el backend los trata como booleano) |
| Moneda | Numérico, sin símbolo de moneda en la celda; el símbolo (S/) se aplica solo en la vista de `index.html` |
| Columna `id_*` | Siempre la primera columna de cada hoja, formato `PREFIJO-00001` (5 dígitos con ceros a la izquierda) |
| Claves foráneas | Siempre se guarda el `id_*` de la hoja referenciada, nunca el nombre/texto |
| Hoja vacía nueva | Toda hoja se crea con su fila de encabezado aunque no tenga datos aún |
| Auditoría mínima | Toda hoja transaccional (no maestra) lleva `registrado_por` y/o `fecha_registro` |

### 1.1 Prefijos de ID por entidad

| Prefijo | Hoja |
| --- | --- |
| `USR` | Usuarios |
| `ZOO` | Zootecnistas |
| `ANI` | Animales |
| `FEN` | Registro_Fenotipico |
| `GEN` | Registro_Genotipico |
| `REP` | Reproduccion |
| `SAN` | Sanidad |
| `ALE` | Animales_Alerta |
| `MOV` | Ubicacion_Manejo |
| `LOT` | Lotes_Cabanas |
| `ESQ` | Esquila |
| `CTB` | Contabilidad |
| `MUL` | Multimedia |
| `CAL` | Calendario_Actividades |
| `NOT` | Notificaciones |
| `CIT` | Citas_Zootecnista |
| `DIS` | IoT_Dispositivos |
| `LEC` | IoT_Lecturas |
| `LOG` | Logs_Sistema |

El siguiente número de cada secuencia se guarda en la hoja `Secuencias` (ver sección 2.20) para que `Código.gs` no tenga que recorrer toda la hoja para saber cuál es el próximo ID.

---

## 2. Hojas del Spreadsheet (22 hojas)

### 2.1 `Usuarios`
Autenticación propia (usuario/contraseña), no depende de cuenta Google — necesario porque muchos ganaderos no tienen Gmail.

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_usuario | Texto | `USR-00001` | USR-00007 |
| nombre_completo | Texto | — | María Quispe Huamán |
| correo | Texto | Único, usado como login alterno | maria@agrovelas.pe |
| usuario_login | Texto | Único, usado para iniciar sesión | mquispe |
| contrasena_hash | Texto | SHA-256 + sal, nunca texto plano | (hash) |
| sal | Texto | Sal aleatoria por usuario | (random) |
| rol | Lista | `Administrador, Zootecnista, Veterinario, Ganadero, Productor` | Ganadero |
| telefono | Texto | — | 984123456 |
| foto_perfil_url | Texto (URL) | Drive | https://drive.google.com/... |
| estado | Lista | `Activo, Inactivo, Bloqueado` | Activo |
| fecha_creacion | Fecha | — | 2026-03-01 |
| ultimo_acceso | Fecha+hora | Se actualiza en cada login exitoso | 2026-06-18 09:14 |
| intentos_fallidos | Número | Para bloqueo tras N intentos | 0 |

### 2.2 `Zootecnistas`
Perfil extendido para usuarios con rol `Zootecnista` o `Veterinario`. Aquí vive todo lo que el ganadero ve al buscar a quién contactar.

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_zootecnista | Texto | `ZOO-00001` | ZOO-00003 |
| id_usuario | Texto (FK) | → Usuarios.id_usuario | USR-00007 |
| especialidad | Lista | `Camélidos sudamericanos, Ovinos, Bovinos, Reproducción, Nutrición, Medicina general` | Camélidos sudamericanos |
| anios_experiencia | Número | — | 6 |
| calificacion_promedio | Decimal | 0.0–5.0, calculado desde `Citas_Zootecnista` | 4.7 |
| numero_calificaciones | Número | Conteo para el promedio | 23 |
| tarifa_consulta | Decimal | Soles | 50.00 |
| zona_cobertura | Texto | — | Chinchero, Anta |
| telefono_contacto | Texto | — | 984555222 |
| correo_contacto | Texto | — | zoo@agrovelas.pe |
| biografia | Texto largo | — | "Especialista en sanidad de camélidos..." |
| foto_url | Texto (URL) | — | https://drive.google.com/... |
| horario_disponible_json | Texto (JSON) | Días/horas libres, ej. `{"lun":["09:00-12:00"],"mar":[]}` | (JSON) |
| estado | Lista | `Disponible, Ocupado, Inactivo` | Disponible |

### 2.3 `Animales` (hoja maestra — registro general)
Información de identificación, genealogía y estado actual. Es el centro de todas las relaciones.

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_animal | Texto | `ANI-00001`, también es el dato codificado en el QR | ANI-00045 |
| codigo_arete_rfid | Texto | Código físico del arete o chip, si existe | ARQ-1182 |
| nombre | Texto | Apodo del animal (opcional) | "Luna" |
| especie | Lista | `Alpaca, Llama, Oveja, Bovino, Caprino` | Alpaca |
| raza | Lista dependiente | Si especie=Alpaca → `Huacaya, Suri`; si Oveja → `Corriedale, Criolla, Merino`; si Bovino → `Holstein, Brown Swiss, Criollo` | Huacaya |
| sexo | Lista | `Macho, Hembra` | Hembra |
| fecha_nacimiento | Fecha | — | 2024-11-02 |
| edad_actual | Fórmula | Calculada desde `fecha_nacimiento` | (fórmula) |
| color_principal | Texto | — | Blanco |
| id_padre | Texto (FK) | → Animales.id_animal, vacío si desconocido/comprado | ANI-00012 |
| id_madre | Texto (FK) | → Animales.id_animal | ANI-00031 |
| linea_genetica | Texto | Nombre de plantel/línea de mejoramiento | "Línea Pacomarca 3" |
| procedencia | Lista | `Nacido en predio, Comprado, Donado` | Nacido en predio |
| id_lote_cabana | Texto (FK) | → Lotes_Cabanas.id_lote | LOT-00002 |
| estado | Lista | `Activo, Vendido, Muerto, Trasladado, Perdido` | Activo |
| fecha_registro | Fecha | — | 2024-11-05 |
| registrado_por | Texto (FK) | → Usuarios.id_usuario | USR-00007 |
| codigo_qr_url | Texto (URL) | Imagen QR generada (contiene `id_animal`) | https://api.qrserver.com/... |
| foto_principal_url | Texto (URL) | — | https://drive.google.com/... |
| observaciones_generales | Texto largo | — | — |

> Nota de diseño: los formularios de "Registro fenotípico/genotípico/reproductivo/sanitario/ubicación" del frontend **no son hojas separadas de un solo registro**; son pestañas de un mismo formulario de alta de animal que, al guardar, escriben en `Animales` y además crean la primera fila correspondiente en `Registro_Fenotipico`, `Registro_Genotipico`, etc. Los registros posteriores (nuevas vacunas, nuevos pesajes, nuevos movimientos) se siguen agregando como filas nuevas en esas hojas, ligadas por `id_animal`.

### 2.4 `Registro_Fenotipico`
Características físicas observables. Un animal puede tener varias filas a lo largo del tiempo (cada pesaje/evaluación es una fila nueva → permite ver evolución).

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_fenotipico | Texto | `FEN-00001` | FEN-00120 |
| id_animal | Texto (FK) | → Animales.id_animal | ANI-00045 |
| fecha_evaluacion | Fecha | — | 2026-05-10 |
| peso_kg | Decimal | — | 58.3 |
| altura_cruz_cm | Decimal | — | 82 |
| longitud_corporal_cm | Decimal | — | 110 |
| perimetro_toracico_cm | Decimal | — | 95 |
| condicion_corporal | Lista | Escala 1 (muy flaco) a 5 (obeso) | 3 |
| tipo_fibra | Lista | Solo si especie=Alpaca/Llama: `Huacaya, Suri`; si no aplica, vacío | Huacaya |
| color_fibra | Texto | — | Blanco |
| marcas_distintivas | Texto | — | "Mancha negra en oreja izq." |
| evaluado_por | Texto (FK) | → Usuarios.id_usuario o Zootecnistas.id_zootecnista | ZOO-00003 |
| observaciones | Texto largo | — | — |

### 2.5 `Registro_Genotipico`
Datos genéticos/genealógicos, alineados a la lógica del Reglamento de Registros Genealógicos de Alpacas y Llamas del Perú (RGALLP).

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_genotipico | Texto | `GEN-00001` | GEN-00045 |
| id_animal | Texto (FK) | → Animales.id_animal | ANI-00045 |
| categoria_registro | Lista | `Plantel, Núcleo, Producción, No registrado` | Núcleo |
| pureza_genetica_pct | Decimal | % estimado de raza pura | 95 |
| finura_fibra_um | Decimal | Micronaje en micras (µm) | 21.4 |
| categoria_fibra | Lista (calculada) | `Baby (≤23µm), Fleece (23.1–26.5µm), Medium Fleece (26.6–29µm), Huarizo (29.1–31.5µm), Gruesa (>31.5µm)` | Baby |
| densidad_vellon | Lista | `Baja, Media, Alta` | Alta |
| uniformidad_vellon | Lista | `Baja, Media, Alta` | Media |
| certificado_genealogico_url | Texto (URL) | — | https://drive.google.com/... |
| antecedentes_geneticos | Texto largo | — | — |
| enfermedades_hereditarias_conocidas | Texto | — | "Ninguna reportada" |
| fecha_registro | Fecha | — | 2024-11-05 |
| observaciones | Texto largo | — | — |

### 2.6 `Reproduccion`
Empadre, gestación, partos y destetes.

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_reproduccion | Texto | `REP-00001` | REP-00210 |
| id_animal_hembra | Texto (FK) | → Animales.id_animal | ANI-00031 |
| tipo_evento | Lista | `Empadre/Monta, Inseminación artificial, Diagnóstico de gestación, Parto, Aborto, Destete` | Empadre/Monta |
| fecha_evento | Fecha | — | 2026-01-15 |
| id_macho | Texto (FK) | → Animales.id_animal, solo si aplica | ANI-00012 |
| metodo | Lista | `Monta natural, Inseminación artificial, Transferencia embrionaria` | Monta natural |
| resultado | Lista | `Positivo, Negativo, Pendiente` | Positivo |
| fecha_probable_parto | Fórmula/Fecha | `fecha_evento + período de gestación según especie` (alpaca ≈345 días, oveja ≈150, bovino ≈283) | 2026-12-26 |
| numero_crias | Número | — | 1 |
| id_cria | Texto (FK) | → Animales.id_animal, se llena cuando la cría se registra | ANI-00098 |
| responsable | Texto (FK) | → Usuarios.id_usuario | USR-00007 |
| observaciones | Texto largo | — | — |

### 2.7 `Sanidad`
Vacunas, desparasitaciones, tratamientos, diagnósticos.

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_sanidad | Texto | `SAN-00001` | SAN-00512 |
| id_animal | Texto (FK) | → Animales.id_animal | ANI-00045 |
| fecha | Fecha | — | 2026-04-02 |
| tipo_evento | Lista | `Vacunación, Desparasitación, Tratamiento, Diagnóstico, Cirugía, Control de rutina` | Vacunación |
| nombre_producto | Texto | — | "Triple bacteriana" |
| dosis | Texto | — | "2 ml SC" |
| via_aplicacion | Lista | `Subcutánea, Intramuscular, Oral, Tópica` | Subcutánea |
| diagnostico | Texto | — | — |
| sintomas_observados | Texto largo | — | — |
| veterinario_responsable | Texto (FK) | → Usuarios.id_usuario / Zootecnistas.id_zootecnista | ZOO-00003 |
| proxima_fecha_aplicacion | Fecha | Para programar refuerzos | 2026-10-02 |
| costo | Decimal | — | 25.00 |
| estado | Lista | `Aplicado, Programado, Vencido` | Aplicado |
| observaciones | Texto largo | — | — |

### 2.8 `Animales_Alerta`
Animales bajo seguimiento por estar enfermos o con síntomas — la sección que mencionas para "animales que están mal".

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_alerta | Texto | `ALE-00001` | ALE-00033 |
| id_animal | Texto (FK) | → Animales.id_animal | ANI-00045 |
| fecha_reporte | Fecha+hora | — | 2026-06-15 07:40 |
| reportado_por | Texto (FK) | → Usuarios.id_usuario | USR-00012 |
| sintomas | Texto largo | — | "Decaimiento, no come, secreción nasal" |
| nivel_urgencia | Lista | `Baja, Media, Alta, Crítica` | Alta |
| zootecnista_asignado | Texto (FK) | → Zootecnistas.id_zootecnista | ZOO-00003 |
| veterinario_asignado | Texto (FK) | → Usuarios.id_usuario | USR-00009 |
| estado | Lista | `En seguimiento, Derivado, Resuelto, Crítico` | En seguimiento |
| diagnostico_final | Texto | — | — |
| id_sanidad_relacionado | Texto (FK) | → Sanidad.id_sanidad, una vez que se aplica tratamiento | SAN-00513 |
| fecha_resolucion | Fecha | — | — |

### 2.9 `Ubicacion_Manejo`
Movimientos de animales: ingresos, egresos, traslados internos. También alimenta el mapa del módulo IoT cuando hay coordenadas.

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_movimiento | Texto | `MOV-00001` | MOV-00301 |
| id_animal | Texto (FK) | → Animales.id_animal | ANI-00045 |
| fecha | Fecha+hora | — | 2026-06-10 14:00 |
| tipo_movimiento | Lista | `Ingreso, Egreso/Venta, Traslado interno, Muerte, Pérdida` | Traslado interno |
| id_lote_origen | Texto (FK) | → Lotes_Cabanas.id_lote | LOT-00001 |
| id_lote_destino | Texto (FK) | → Lotes_Cabanas.id_lote | LOT-00002 |
| latitud | Decimal | — | -13.5320 |
| longitud | Decimal | — | -71.9675 |
| responsable | Texto (FK) | → Usuarios.id_usuario | USR-00007 |
| motivo | Texto | — | "Rotación de pastoreo" |
| observaciones | Texto largo | — | — |

### 2.10 `Lotes_Cabanas`
Agrupaciones físicas de animales (cabañas, potreros, corrales).

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_lote | Texto | `LOT-00001` | LOT-00002 |
| nombre_lote | Texto | — | "Potrero Alto" |
| tipo_animal_predominante | Lista | igual que `Animales.especie` | Alpaca |
| capacidad_maxima | Número | — | 80 |
| animales_actuales | Fórmula | `COUNTIF(Animales.id_lote_cabana, id_lote)` filtrando estado=Activo | (fórmula) |
| ubicacion_descripcion | Texto | — | "Sector norte, 3800 m.s.n.m." |
| latitud_centro | Decimal | — | -13.5300 |
| longitud_centro | Decimal | — | -71.9700 |
| responsable | Texto (FK) | → Usuarios.id_usuario | USR-00007 |
| estado | Lista | `Activo, Inactivo` | Activo |

### 2.11 `Esquila`
Registro de esquila para alpacas, llamas y ovejas (no aplica a bovinos).

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_esquila | Texto | `ESQ-00001` | ESQ-00077 |
| id_animal | Texto (FK) | → Animales.id_animal | ANI-00045 |
| fecha_esquila | Fecha | — | 2026-05-20 |
| peso_vellon_kg | Decimal | — | 1.85 |
| categoria_fibra | Lista | `Baby, Fleece, Medium Fleece, Huarizo, Gruesa` (según micronaje de Registro_Genotipico) | Baby |
| micronaje_um | Decimal | — | 21.0 |
| longitud_mecha_cm | Decimal | — | 9.5 |
| color_fibra | Texto | — | Blanco |
| destino | Lista | `Venta directa, Acopio comunal, Centro de clasificación` | Acopio comunal |
| comprador | Texto | — | "Acopiadora Sur SAC" |
| precio_por_kg | Decimal | — | 18.50 |
| ingreso_total | Fórmula | `peso_vellon_kg * precio_por_kg` | 34.23 |
| responsable | Texto (FK) | → Usuarios.id_usuario | USR-00007 |
| observaciones | Texto largo | — | — |

### 2.12 `Contabilidad`
Contabilidad ganadera: ingresos y egresos del predio, no solo de esquila.

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_movimiento_contable | Texto | `CTB-00001` | CTB-00410 |
| fecha | Fecha | — | 2026-05-20 |
| tipo | Lista | `Ingreso, Egreso` | Ingreso |
| categoria | Lista | `Venta de animal, Venta de fibra, Compra de insumos, Honorarios veterinario, Alimentación, Medicamentos, Mantenimiento de infraestructura, Otro` | Venta de fibra |
| monto | Decimal | — | 34.23 |
| id_animal_relacionado | Texto (FK) | → Animales.id_animal, opcional | ANI-00045 |
| id_esquila_relacionada | Texto (FK) | → Esquila.id_esquila, opcional | ESQ-00077 |
| descripcion | Texto | — | — |
| comprobante_url | Texto (URL) | Foto/PDF de boleta | https://drive.google.com/... |
| registrado_por | Texto (FK) | → Usuarios.id_usuario | USR-00007 |

### 2.13 `Multimedia`
Fotos, documentos y certificados asociados a un animal.

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_multimedia | Texto | `MUL-00001` | MUL-00150 |
| id_animal | Texto (FK) | → Animales.id_animal | ANI-00045 |
| tipo_archivo | Lista | `Foto, Documento, Certificado, Video` | Foto |
| url_archivo | Texto (URL) | Google Drive (carpeta por animal) | https://drive.google.com/... |
| descripcion | Texto | — | "Foto de perfil lateral" |
| fecha_subida | Fecha+hora | — | 2026-06-01 10:00 |
| subido_por | Texto (FK) | → Usuarios.id_usuario | USR-00007 |

### 2.14 `Calendario_Actividades`
Eventos que alimentan el mini-calendario del dashboard y el calendario completo.

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_actividad | Texto | `CAL-00001` | CAL-00088 |
| titulo | Texto | — | "Vacunación Lote Potrero Alto" |
| tipo | Lista | `Vacunación, Esquila, Parto esperado, Cita con zootecnista, Tarea general, Control sanitario` | Vacunación |
| fecha | Fecha | — | 2026-07-01 |
| hora | Hora | — | 08:00 |
| id_animal_relacionado | Texto (FK) | opcional | ANI-00045 |
| id_lote_relacionado | Texto (FK) | opcional | LOT-00002 |
| responsable | Texto (FK) | → Usuarios.id_usuario | USR-00007 |
| estado | Lista | `Pendiente, Completada, Cancelada` | Pendiente |
| descripcion | Texto largo | — | — |

### 2.15 `Notificaciones`
Avisos generados por el sistema (manuales o automáticos vía trigger).

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_notificacion | Texto | `NOT-00001` | NOT-01200 |
| id_usuario_destino | Texto (FK) | → Usuarios.id_usuario | USR-00007 |
| tipo | Lista | `Alerta sanitaria, Recordatorio de vacuna, Cita confirmada, Parto próximo, Stock crítico, General` | Recordatorio de vacuna |
| mensaje | Texto | — | "La oveja ANI-00045 tiene vacuna programada para hoy" |
| fecha_generacion | Fecha+hora | — | 2026-06-18 06:00 |
| leido | Lista | `Sí, No` | No |
| prioridad | Lista | `Baja, Media, Alta` | Media |
| id_relacionado | Texto | id de la entidad que originó la notificación | SAN-00512 |
| tipo_relacionado | Texto | nombre de hoja origen, para que el frontend sepa a dónde navegar | Sanidad |

### 2.16 `Citas_Zootecnista`
Agenda de citas entre ganaderos y zootecnistas/veterinarios.

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_cita | Texto | `CIT-00001` | CIT-00045 |
| id_zootecnista | Texto (FK) | → Zootecnistas.id_zootecnista | ZOO-00003 |
| id_usuario_solicitante | Texto (FK) | → Usuarios.id_usuario | USR-00012 |
| id_animal_relacionado | Texto (FK) | opcional | ANI-00045 |
| fecha | Fecha | — | 2026-06-25 |
| hora | Hora | — | 10:00 |
| motivo | Texto | — | "Revisión de cojera" |
| estado | Lista | `Pendiente, Confirmada, Completada, Cancelada, No asistió` | Confirmada |
| notas_zootecnista | Texto largo | — | — |
| calificacion_recibida | Número | 1–5, se llena tras `Completada` | 5 |
| fecha_creacion | Fecha+hora | — | 2026-06-18 09:00 |

### 2.17 `IoT_Dispositivos`
Collares/sensores asignados a animales.

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_dispositivo | Texto | `DIS-00001` | DIS-00012 |
| id_animal | Texto (FK) | → Animales.id_animal | ANI-00045 |
| tipo_dispositivo | Lista | `Collar GPS, Sensor LoRa, Caravana RFID` | Collar GPS |
| codigo_dispositivo | Texto | Identificador físico/serial | LORA-0231 |
| fecha_instalacion | Fecha | — | 2026-04-01 |
| estado_bateria_pct | Número | — | 78 |
| estado | Lista | `Activo, Inactivo, Dañado, Retirado` | Activo |
| ultima_latitud | Decimal | — | -13.5321 |
| ultima_longitud | Decimal | — | -71.9670 |
| fecha_ultima_lectura | Fecha+hora | — | 2026-06-18 06:30 |

### 2.18 `IoT_Lecturas`
Histórico de posiciones/lecturas (tabla de alto volumen; pensada para limpieza periódica).

| Columna | Tipo | Descripción / Validación | Ejemplo |
| --- | --- | --- | --- |
| id_lectura | Texto | `LEC-00001` | LEC-08213 |
| id_dispositivo | Texto (FK) | → IoT_Dispositivos.id_dispositivo | DIS-00012 |
| fecha_hora | Fecha+hora | — | 2026-06-18 06:30 |
| latitud | Decimal | — | -13.5321 |
| longitud | Decimal | — | -71.9670 |
| temperatura_corporal | Decimal | si el sensor lo reporta | 38.4 |
| nivel_actividad | Lista | `Reposo, Pastoreo, Movimiento activo` | Pastoreo |

### 2.19 `Listas` (listas de validación / dropdowns configurables)
Centraliza todos los valores de listas desplegables para que el frontend y las validaciones de Sheets lean de un solo lugar, sin hardcodear en `Código.gs`.

| Columna | Tipo | Descripción |
| --- | --- | --- |
| categoria | Texto | Ej. `Especie`, `Raza_Alpaca`, `Rol_Usuario`, `Tipo_Evento_Sanitario` |
| valor | Texto | El valor mostrado/almacenado |
| orden | Número | Orden de aparición en el dropdown |
| activo | Lista `Sí/No` | Permite desactivar un valor sin borrarlo |

Categorías mínimas a precargar: `Especie`, `Raza_Alpaca`, `Raza_Oveja`, `Raza_Bovino`, `Sexo`, `Estado_Animal`, `Tipo_Evento_Reproductivo`, `Tipo_Evento_Sanitario`, `Via_Aplicacion`, `Nivel_Urgencia`, `Estado_Alerta`, `Tipo_Movimiento`, `Rol_Usuario`, `Especialidad_Zootecnista`, `Categoria_Fibra`, `Categoria_Contable`, `Tipo_Notificacion`, `Estado_Cita`, `Tipo_Dispositivo_IoT`, `Tipo_Actividad_Calendario`.

### 2.20 `Secuencias`
Lleva el control del próximo número correlativo por prefijo, para generar IDs sin recorrer hojas completas.

| Columna | Tipo | Descripción |
| --- | --- | --- |
| prefijo | Texto | Ej. `ANI` |
| ultimo_numero | Número | Último número usado |

### 2.21 `Logs_Sistema`
Auditoría básica de acciones sensibles (login, borrado, cambios de rol).

| Columna | Tipo | Descripción |
| --- | --- | --- |
| id_log | Texto | `LOG-00001` |
| fecha_hora | Fecha+hora | — |
| id_usuario | Texto (FK) | → Usuarios.id_usuario |
| accion | Texto | Ej. `LOGIN_OK`, `LOGIN_FALLIDO`, `ELIMINAR_ANIMAL` |
| modulo | Texto | Ej. `Animales`, `Usuarios` |
| detalle | Texto largo | — |

### 2.22 `Config_Sistema`
Parámetros generales del sistema (clave-valor).

| Columna | Tipo | Descripción |
| --- | --- | --- |
| clave | Texto | Ej. `nombre_organizacion`, `dias_gestacion_alpaca`, `dias_gestacion_oveja`, `dias_gestacion_bovino`, `url_logo` |
| valor | Texto | — |
| descripcion | Texto | — |

---

## 3. Relaciones (resumen)

```
Usuarios 1───* Zootecnistas
Usuarios 1───* Animales (registrado_por)
Animales 1───* Registro_Fenotipico
Animales 1───* Registro_Genotipico
Animales 1───* Reproduccion (hembra y/o macho)
Animales 1───* Sanidad
Animales 1───* Animales_Alerta
Animales 1───* Ubicacion_Manejo
Animales 1───* Esquila
Animales 1───* Multimedia
Animales *───1 Lotes_Cabanas
Animales *───1 Animales (id_padre, id_madre — autorreferencia)
Zootecnistas 1───* Citas_Zootecnista
Zootecnistas 1───* Animales_Alerta (zootecnista_asignado)
Animales 1───* IoT_Dispositivos
IoT_Dispositivos 1───* IoT_Lecturas
Contabilidad *───1 Animales / Esquila (opcional)
Usuarios 1───* Notificaciones
```

## 4. Notas de implementación para `Código.gs`

1. La creación de las 22 hojas, encabezados, formato de fila congelada y listas de validación debe hacerse mediante una función `inicializarBaseDeDatos()` ejecutada una sola vez (botón de "Configuración inicial" en el sistema, visible solo para rol `Administrador`).
2. Las listas desplegables del frontend (`<select>`) deben poblarse llamando a una función que lea la hoja `Listas` filtrando por `categoria` y `activo = "Sí"`, nunca hardcodeadas en `index.html`.
3. La generación de `id_*` debe ser atómica: leer `Secuencias`, incrementar, escribir, y solo entonces usar el nuevo ID — para evitar colisiones si dos personas guardan al mismo tiempo (usar `LockService`).
4. Todas las fórmulas marcadas como "Fórmula" en las tablas anteriores pueden implementarse como fórmula nativa de Sheets **o** calcularse en `Código.gs` al momento de leer; se recomienda calcularlas en `Código.gs` para mantener la hoja como datos puros y evitar romper fórmulas al editar manualmente.V
