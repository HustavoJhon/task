# HISTORIAS DE USUARIO - EsSalud v1.0 Empresarial

## 1. Módulo: Autenticación y Cuenta

### HU-001 | Autenticación
**Como** asegurado  
**Quiero** registrarme en la plataforma con mi DNI y email  
**Para** acceder a los servicios digitales de EsSalud

**Criterios de aceptación:**
- CA-1: El registro requiere DNI (8 dígitos), email, teléfono, contraseña y aceptación de términos
- CA-2: El DNI se valida contra RENIEC en tiempo real
- CA-3: Se envía email de verificación con link válido por 24h
- CA-4: La contraseña debe cumplir política de seguridad
- CA-5: En caso de error de RENIEC, se ofrece validación manual

**Estimación:** 8 puntos | **Prioridad:** Alta | **Sprint:** 2

### HU-002 | Autenticación
**Como** asegurado  
**Quiero** iniciar sesión con mi email y contraseña  
**Para** acceder a mi cuenta de forma segura

**Criterios de aceptación:**
- CA-1: Login con email + contraseña genera JWT válido por 24h
- CA-2: Tras 5 intentos fallidos, bloqueo temporal de 30 min
- CA-3: Sesión expira tras 2h de inactividad
- CA-4: Se registra fecha y IP del último acceso
- CA-5: Opción "Recordar sesión" extendida a 7 días

**Estimación:** 5 puntos | **Prioridad:** Alta | **Sprint:** 2

### HU-003 | Autenticación
**Como** asegurado  
**Quiero** recuperar mi contraseña si la olvido  
**Para** no perder acceso a mi cuenta

**Criterios de aceptación:**
- CA-1: Enviar email con link de restablecimiento (válido 1h)
- CA-2: Solicitar nueva contraseña con política de seguridad
- CA-3: Notificar al usuario que la contraseña ha sido cambiada
- CA-4: Invalidar todas las sesiones activas tras cambio

**Estimación:** 5 puntos | **Prioridad:** Media | **Sprint:** 2

### HU-004 | Autenticación
**Como** asegurado  
**Quiero** cerrar sesión  
**Para** proteger mi cuenta en dispositivos compartidos

**Criterios de aceptación:**
- CA-1: Al cerrar sesión, el token JWT se invalida
- CA-2: Se muestra confirmación antes de cerrar sesión
- CA-3: Se redirige a pantalla de login

**Estimación:** 2 puntos | **Prioridad:** Alta | **Sprint:** 2

### HU-005 | Perfil
**Como** asegurado  
**Quiero** ver y editar mi perfil  
**Para** mantener mis datos actualizados

**Criterios de aceptación:**
- CA-1: Ver datos: nombre, DNI, email, teléfono, fecha registro
- CA-2: Editar email y teléfono (requiere verificación de email)
- CA-3: Cambiar contraseña (requiere contraseña actual)
- CA-4: No se puede modificar DNI ni nombre (vinculado a RENIEC)

**Estimación:** 5 puntos | **Prioridad:** Media | **Sprint:** 4

---

## 2. Módulo: Chatbot

### HU-006 | Chatbot
**Como** asegurado  
**Quiero** hacer una pregunta al chatbot y recibir respuesta inmediata  
**Para** obtener información sin esperar atención presencial

**Criterios de aceptación:**
- CA-1: El chatbot responde en menos de 3 segundos
- CA-2: Primero busca en FAQ estructurada (match semántico > 0.85)
- CA-3: Si no hay FAQ, usa RAG sobre documentos oficiales
- CA-4: La respuesta incluye citación de la fuente oficial
- CA-5: Soporta preguntas en lenguaje natural

**Estimación:** 13 puntos | **Prioridad:** Alta | **Sprint:** 6

### HU-007 | Chatbot
**Como** asegurado  
**Quiero** ver las preguntas frecuentes sugeridas al iniciar el chat  
**Para** encontrar respuestas rápidas sin escribir

**Criterios de aceptación:**
- CA-1: Mostrar 3-5 preguntas frecuentes sugeridas al iniciar
- CA-2: Las sugerencias se basan en categorías de FAQ
- CA-3: Al tocar una sugerencia, se envía automáticamente

**Estimación:** 3 puntos | **Prioridad:** Media | **Sprint:** 6

### HU-008 | Chatbot
**Como** asegurado  
**Quiero** ver el historial de mis conversaciones anteriores  
**Para** retomar consultas previas sin repetir información

**Criterios de aceptación:**
- CA-1: Lista de sesiones ordenadas por fecha (más reciente primero)
- CA-2: Cada sesión muestra título, fecha y último mensaje
- CA-3: Al seleccionar una sesión, se carga el historial completo
- CA-4: Persistencia de sesiones por 90 días

**Estimación:** 5 puntos | **Prioridad:** Media | **Sprint:** 7

### HU-009 | Chatbot
**Como** asegurado  
**Quiero** calificar la utilidad de las respuestas del chatbot  
**Para** ayudar a mejorar la calidad del sistema

**Criterios de aceptación:**
- CA-1: Mostrar botones "Útil" / "No útil" después de cada respuesta
- CA-2: Opcional: campo de comentario para feedback
- CA-3: El feedback se almacena para análisis de calidad

**Estimación:** 3 puntos | **Prioridad:** Baja | **Sprint:** 7

### HU-010 | Chatbot
**Como** gestor documental  
**Quiero** gestionar las preguntas frecuentes (FAQ)  
**Para** mantener actualizada la base de conocimiento

**Criterios de aceptación:**
- CA-1: CRUD completo de preguntas y respuestas
- CA-2: Asignar categoría y keywords para matching
- CA-3: Vista previa de cómo se ve en el chatbot
- CA-4: Historial de cambios de cada FAQ

**Estimación:** 8 puntos | **Prioridad:** Alta | **Sprint:** 5

---

## 3. Módulo: Trámites

### HU-011 | Trámites
**Como** asegurado  
**Quiero** ver la lista de trámites disponibles  
**Para** conocer qué gestiones puedo realizar digitalmente

**Criterios de aceptación:**
- CA-1: Lista de tipos de trámites con nombre y descripción
- CA-2: Cada trámite muestra requisitos documentales
- CA-3: Indicador de plazo estimado de resolución

**Estimación:** 3 puntos | **Prioridad:** Alta | **Sprint:** 5

### HU-012 | Trámites
**Como** asegurado  
**Quiero** crear un nuevo trámite  
**Para** iniciar una gestión sin ir a una oficina

**Criterios de aceptación:**
- CA-1: Seleccionar tipo de trámite del catálogo
- CA-2: Completar formulario dinámico según tipo
- CA-3: Adjuntar documentos requeridos
- CA-4: Guardar como borrador o enviar a revisión
- CA-5: Confirmación de creación con número de trámite

**Estimación:** 13 puntos | **Prioridad:** Alta | **Sprint:** 5

### HU-013 | Trámites
**Como** asegurado  
**Quiero** ver el estado actual de mis trámites  
**Para** dar seguimiento a mis gestiones

**Criterios de aceptación:**
- CA-1: Lista de mis trámites con estado y fecha
- CA-2: Cada trámite muestra timeline de cambios
- CA-3: Fecha estimada de resolución
- CA-4: Indicador visual del estado (colores)

**Estimación:** 5 puntos | **Prioridad:** Alta | **Sprint:** 5

### HU-014 | Trámites
**Como** asegurado  
**Quiero** subsanar un trámite rechazado  
**Para** corregir los documentos observados y continuar el proceso

**Criterios de aceptación:**
- CA-1: Ver el motivo del rechazo y documentos observados
- CA-2: Re-subir documentos corregidos
- CA-3: Plazo de 15 días calendario para subsanar
- CA-4: Notificación de que la subsanación fue recibida

**Estimación:** 8 puntos | **Prioridad:** Alta | **Sprint:** 6

### HU-015 | Trámites
**Como** operador  
**Quiero** ver la lista de trámites pendientes asignados a mí  
**Para** priorizar mi carga de trabajo

**Criterios de aceptación:**
- CA-1: Lista filtrable por estado, tipo, fecha
- CA-2: Búsqueda por DNI del asegurado
- CA-3: Indicador de tiempo transcurrido desde creación

**Estimación:** 5 puntos | **Prioridad:** Alta | **Sprint:** 5

### HU-016 | Trámites
**Como** operador  
**Quiero** aprobar un trámite cuando cumple todos los requisitos  
**Para** procesar la solicitud del asegurado

**Criterios de aceptación:**
- CA-1: Ver documentos adjuntos antes de aprobar
- CA-2: Validar que todos los documentos requeridos están presentes
- CA-3: Confirmación antes de aprobar
- CA-4: Se notifica al asegurado automáticamente

**Estimación:** 8 puntos | **Prioridad:** Alta | **Sprint:** 6

### HU-017 | Trámites
**Como** operador  
**Quiero** rechazar un trámite con observaciones  
**Para** que el asegurado pueda corregir los errores

**Criterios de aceptación:**
- CA-1: Campo obligatorio de motivo de rechazo
- CA-2: Identificar qué documentos o datos están incorrectos
- CA-3: Seleccionar si es rechazo definitivo o subsanable
- CA-4: Se notifica al asegurado automáticamente

**Estimación:** 5 puntos | **Prioridad:** Alta | **Sprint:** 6

### HU-018 | Trámites
**Como** supervisor  
**Quiero** asignar trámites a operadores específicos  
**Para** balancear la carga de trabajo del equipo

**Criterios de aceptación:**
- CA-1: Ver carga actual de cada operador
- CA-2: Asignar trámites no asignados a un operador
- CA-3: Re-asignar trámites entre operadores

**Estimación:** 5 puntos | **Prioridad:** Media | **Sprint:** 7

---

## 4. Módulo: Documentos

### HU-019 | Documentos
**Como** asegurado  
**Quiero** subir documentos desde mi dispositivo móvil  
**Para** adjuntarlos a mis trámites

**Criterios de aceptación:**
- CA-1: Seleccionar archivo desde galería o archivos
- CA-2: Formatos aceptados: PDF, JPG, PNG (máx 10 MB)
- CA-3: Validación automática de formato y tamaño
- CA-4: Indicador de progreso de subida
- CA-5: Preview del documento después de subir

**Estimación:** 8 puntos | **Prioridad:** Alta | **Sprint:** 5

### HU-020 | Documentos
**Como** asegurado  
**Quiero** ver una vista previa de mis documentos subidos  
**Para** confirmar que se leen correctamente

**Criterios de aceptación:**
- CA-1: Vista previa en baja resolución para rapidez
- CA-2: PDFs se renderizan como imágenes por página
- CA-3: Navegación entre páginas del documento

**Estimación:** 5 puntos | **Prioridad:** Media | **Sprint:** 7

### HU-021 | Documentos
**Como** gestor documental  
**Quiero** buscar documentos por su contenido (búsqueda semántica)  
**Para** encontrar documentos relevantes rápidamente

**Criterios de aceptación:**
- CA-1: Campo de búsqueda con lenguaje natural
- CA-2: Resultados ordenados por relevancia semántica
- CA-3: Fragmento del texto que coincide con la búsqueda

**Estimación:** 8 puntos | **Prioridad:** Alta | **Sprint:** 7

### HU-022 | Documentos
**Como** gestor documental  
**Quiero** subir documentos oficiales y categorizarlos  
**Para** que sean indexados en el sistema RAG

**Criterios de aceptación:**
- CA-1: Subida de PDFs con metadatos (título, categoría, fuente)
- CA-2: El documento pasa por pipeline: validación → chunking → embedding
- CA-3: Ver estado de indexación de cada documento
- CA-4: Reprocesar documento si se actualiza

**Estimación:** 13 puntos | **Prioridad:** Alta | **Sprint:** 5

---

## 5. Módulo: Noticias

### HU-023 | Noticias
**Como** asegurado  
**Quiero** ver un feed de noticias de EsSalud  
**Para** estar informado de novedades y comunicados

**Criterios de aceptación:**
- CA-1: Feed paginado ordenado por fecha
- CA-2: Cada noticia muestra título, resumen, fecha e imagen
- CA-3: Al seleccionar, ver contenido completo

**Estimación:** 5 puntos | **Prioridad:** Media | **Sprint:** 4

### HU-024 | Noticias
**Como** asegurado  
**Quiero** buscar noticias por palabras clave  
**Para** encontrar información específica

**Criterios de aceptación:**
- CA-1: Búsqueda por título y contenido
- CA-2: Filtro por categoría de noticia
- CA-3: Resultados ordenados por relevancia

**Estimación:** 3 puntos | **Prioridad:** Baja | **Sprint:** 4

### HU-025 | Noticias
**Como** administrador  
**Quiero** crear, editar y eliminar noticias  
**Para** mantener informados a los asegurados

**Criterios de aceptación:**
- CA-1: Crear con título, contenido, imagen destacada
- CA-2: Publicar inmediatamente o programar fecha
- CA-3: Editar contenido existente
- CA-4: Eliminación lógica

**Estimación:** 8 puntos | **Prioridad:** Media | **Sprint:** 4

---

## 6. Módulo: Dashboard y Administración

### HU-026 | Dashboard
**Como** supervisor  
**Quiero** ver un dashboard con KPIs en tiempo real  
**Para** monitorear la operación del sistema

**Criterios de aceptación:**
- CA-1: Tarjetas con KPIs: trámites hoy, usuarios activos, consultas chatbot
- CA-2: Gráficos de tendencias (últimos 7/30 días)
- CA-3: Datos actualizados cada 60 segundos

**Estimación:** 13 puntos | **Prioridad:** Alta | **Sprint:** 8

### HU-027 | Dashboard
**Como** supervisor  
**Quiero** ver el detalle de métricas del chatbot  
**Para** evaluar la calidad del sistema de IA

**Criterios de aceptación:**
- CA-1: Total consultas, resueltas por FAQ, resueltas por RAG
- CA-2: Tasa de escalamiento a operador humano
- CA-3: Tiempo promedio de respuesta
- CA-4: Feedback de usuarios (útil / no útil)

**Estimación:** 8 puntos | **Prioridad:** Media | **Sprint:** 8

### HU-028 | Dashboard
**Como** supervisor  
**Quiero** exportar reportes en PDF y Excel  
**Para** compartir información con la dirección

**Criterios de aceptación:**
- CA-1: Seleccionar período y métricas a incluir
- CA-2: Exportar en PDF (formato reporte) y Excel (datos crudos)
- CA-3: Programar exportación automática semanal/mensual

**Estimación:** 5 puntos | **Prioridad:** Media | **Sprint:** 9

### HU-029 | Administración
**Como** super admin  
**Quiero** gestionar usuarios del sistema  
**Para** controlar quién tiene acceso a la plataforma

**Criterios de aceptación:**
- CA-1: Lista de usuarios con búsqueda y filtros
- CA-2: Crear, editar, desactivar usuarios
- CA-3: Asignar roles a usuarios

**Estimación:** 8 puntos | **Prioridad:** Alta | **Sprint:** 3

### HU-030 | Administración
**Como** super admin  
**Quiero** gestionar los roles y permisos del sistema  
**Para** definir qué puede hacer cada tipo de usuario

**Criterios de aceptación:**
- CA-1: CRUD de roles con nombre y descripción
- CA-2: Asignar permisos a cada rol (checkboxes)
- CA-3: Vista de matriz rol vs permisos

**Estimación:** 8 puntos | **Prioridad:** Alta | **Sprint:** 3

---

## 7. Módulo: Notificaciones

### HU-031 | Notificaciones
**Como** asegurado  
**Quiero** recibir notificaciones cuando mi trámite cambie de estado  
**Para** estar al tanto del progreso sin revisar constantemente

**Criterios de aceptación:**
- CA-1: Email automático al cambiar estado
- CA-2: Notificación push en app móvil
- CA-3: La notificación incluye estado nuevo y fecha

**Estimación:** 5 puntos | **Prioridad:** Alta | **Sprint:** 6

### HU-032 | Notificaciones
**Como** asegurado  
**Quiero** configurar mis preferencias de notificación  
**Para** decidir qué notificaciones recibir y por qué canal

**Criterios de aceptación:**
- CA-1: Activar/desactivar notificaciones por tipo
- CA-2: Seleccionar canales (email, push, ambos)
- CA-3: Cambios guardados inmediatamente

**Estimación:** 3 puntos | **Prioridad:** Baja | **Sprint:** 7

---

## 8. Módulo: RAG e IA

### HU-033 | RAG
**Como** asegurado  
**Quiero** que el chatbot me muestre la fuente de donde obtuvo la respuesta  
**Para** verificar que la información es oficial

**Criterios de aceptación:**
- CA-1: Cada respuesta RAG incluye: nombre del documento, página
- CA-2: Cita textual del fragmento usado
- CA-3: Enlace al documento original si está disponible

**Estimación:** 8 puntos | **Prioridad:** Alta | **Sprint:** 7

### HU-034 | RAG
**Como** gestor documental  
**Quiero** ver qué documentos están indexados en Qdrant  
**Para** verificar la cobertura del sistema RAG

**Criterios de aceptación:**
- CA-1: Lista de documentos indexados con fecha y estado
- CA-2: Número de chunks por documento
- CA-3: Reprocesar documento individual

**Estimación:** 5 puntos | **Prioridad:** Media | **Sprint:** 7

### HU-035 | RAG
**Como** asegurado  
**Quiero** que el chatbot me entienda aunque escriba con errores o lenguaje coloquial  
**Para** una experiencia natural y sin fricción

**Criterios de aceptación:**
- CA-1: Embeddings capturan significado semántico, no palabras exactas
- CA-2: Tolerancia a errores ortográficos
- CA-3: Reconocimiento de sinónimos y variaciones

**Estimación:** 8 puntos | **Prioridad:** Alta | **Sprint:** 7

---

## 9. Módulo: Seguridad y Auditoría

### HU-036 | Auditoría
**Como** super admin  
**Quiero** ver el log de auditoría de acciones del sistema  
**Para** investigar incidentes y garantizar trazabilidad

**Criterios de aceptación:**
- CA-1: Lista paginada de eventos con filtros (fecha, usuario, acción)
- CA-2: Detalle del evento: quién, qué, cuándo, IP
- CA-3: Exportar log a CSV

**Estimación:** 5 puntos | **Prioridad:** Alta | **Sprint:** 9

### HU-037 | Seguridad
**Como** usuario  
**Quiero** que mi sesión expire automáticamente tras inactividad  
**Para** proteger mi cuenta en caso de olvidar cerrar sesión

**Criterios de aceptación:**
- CA-1: Sesión expira tras 2h de inactividad
- CA-2: Aviso 5 minutos antes de expirar
- CA-3: Al expirar, redirigir a login sin perder datos no guardados

**Estimación:** 3 puntos | **Prioridad:** Alta | **Sprint:** 3

### HU-038 | Seguridad
**Como** super admin  
**Quiero** configurar el rate limiting por endpoint  
**Para** proteger el sistema contra abusos y ataques

**Criterios de aceptación:**
- CA-1: Configurar límites por endpoint (requests/minuto)
- CA-2: Respuesta 429 cuando se excede el límite
- CA-3: Log de eventos de rate limiting excedido

**Estimación:** 5 puntos | **Prioridad:** Alta | **Sprint:** 9

---

## 10. Tabla Resumen de Backlog

| Módulo | Total HUs | Alta | Media | Baja | Estimación Total |
|--------|:---------:|:----:|:-----:|:----:|:----------------:|
| Autenticación y Cuenta | 5 | 3 | 2 | 0 | 25 pts |
| Chatbot | 5 | 2 | 2 | 1 | 32 pts |
| Trámites | 8 | 7 | 1 | 0 | 52 pts |
| Documentos | 4 | 3 | 1 | 0 | 34 pts |
| Noticias | 3 | 0 | 2 | 1 | 16 pts |
| Dashboard y Admin | 5 | 3 | 2 | 0 | 42 pts |
| Notificaciones | 2 | 1 | 0 | 1 | 8 pts |
| RAG e IA | 3 | 2 | 1 | 0 | 21 pts |
| Seguridad y Auditoría | 3 | 3 | 0 | 0 | 13 pts |
| **Total** | **38** | **24** | **11** | **3** | **243 pts** |

### Estimación de Sprints

| Sprint | Capacidad (pts) | HUs a Incluir |
|--------|:---------------:|--------------|
| Sprint 1 | 20 pts | Setup infraestructura (tareas técnicas) |
| Sprint 2 | 20 pts | HU-001, HU-002, HU-003, HU-004 |
| Sprint 3 | 20 pts | HU-029, HU-030, HU-037 |
| Sprint 4 | 20 pts | HU-005, HU-023, HU-024, HU-025 |
| Sprint 5 | 25 pts | HU-010, HU-011, HU-012, HU-013, HU-019, HU-022 |
| Sprint 6 | 25 pts | HU-014, HU-015, HU-016, HU-017, HU-031 |
| Sprint 7 | 25 pts | HU-008, HU-009, HU-018, HU-020, HU-021, HU-032, HU-033, HU-034, HU-035 |
| Sprint 8 | 25 pts | HU-026, HU-027 |
| Sprint 9 | 20 pts | HU-028, HU-036, HU-038 |
| Sprint 10 | 20 pts | QA, UAT, correcciones |

**Velocidad estimada del equipo:** 20-25 puntos/sprint

---

## 11. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[09_CASOS_USO_UML.md]] | Mapeo de HUs a casos de uso |
| [[24_REQUISITOS_FUNCIONALES.md]] | Requisitos funcionales detallados |
| [[02_SPEC_DETALLADO.md]] | Catálogo de funcionalidades |
| [[22_ROADMAP.md]] | Planificación de sprints en roadmap |
| [[26_KANBAN_GANTT.md]] | Gestión de tareas |

---

#historias #usuario #producto #essalud #v1.0
