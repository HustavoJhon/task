# SPEC DETALLADO - Especificación Funcional EsSalud v1.0 Laravel PWA

## 1. Descripción del Sistema

Plataforma web integral que permite a los asegurados de EsSalud realizar trámites documentarios, consultar información oficial mediante chatbot con IA (RAG), gestionar documentos digitales y recibir notificaciones de estado — todo desde una aplicación web responsive construida con Laravel 11, Blade y Livewire 3. El sistema incluye un panel administrativo con Filament 3 para los operadores de EsSalud con capacidades de gestión de trámites, documentos, y análisis de métricas.

---

## 2. Catálogo Completo de Funcionalidades por Módulo

### 2.1 Módulo de Autenticación (AUTH-001 a AUTH-010)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| AUTH-001 | Registro de asegurado | Registro con DNI, email, teléfono y validación RENIEC | Público |
| AUTH-002 | Inicio de sesión | Login con email + contraseña, sesión con Sanctum SPA | Todos |
| AUTH-003 | Cierre de sesión | Invalidación de sesión activa | Todos |
| AUTH-004 | Recuperación de contraseña | Email con link de restablecimiento (Laravel Password Reset) | Público |
| AUTH-005 | Cambio de contraseña | Cambio desde perfil con validación de contraseña anterior | Todos |
| AUTH-006 | Verificación de cuenta | Email de confirmación post-registro (Laravel Email Verification) | Público |
| AUTH-007 | Recordarme | Persistencia de sesión con remember_token | Todos |
| AUTH-008 | Bloqueo por intentos | Bloqueo temporal tras 5 intentos fallidos (Laravel Rate Limiter) | Sistema |
| AUTH-009 | Perfil de usuario | Edición de datos personales: nombre, teléfono, foto | Todos |
| AUTH-010 | Eliminación de cuenta | Soft delete con período de gracia de 30 días | Asegurado |

### 2.2 Módulo Chatbot (CHAT-001 a CHAT-012)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| CHAT-001 | Consulta FAQ estructurada | Respuesta inmediata desde FAQ clasificada por temas | Asegurado |
| CHAT-002 | Consulta RAG con documentos | Búsqueda semántica en documentos oficiales indexados en Qdrant | Asegurado |
| CHAT-003 | Citación de fuentes | Referencia al documento oficial usado en la respuesta (nombre, página, enlace) | Asegurado |
| CHAT-004 | Historial de conversaciones | Persistencia de sesiones de chat en base de datos | Asegurado |
| CHAT-005 | Continuar conversación | Retomar sesión anterior desde el último mensaje | Asegurado |
| CHAT-006 | Preguntas frecuentes sugeridas | Sugerencias automáticas al iniciar chat (basadas en popularidad) | Asegurado |
| CHAT-007 | Escalamiento a operador | Derivación a humano cuando IA no puede responder (RAG confidence < 0.6) | Sistema |
| CHAT-008 | Feedback en respuestas | Calificar respuesta como útil/no útil (👍/👎) | Asegurado |
| CHAT-009 | Exportar historial chat | Descarga de conversación en PDF (Laravel PDF) | Asegurado |
| CHAT-010 | Gestión de FAQ (admin) | CRUD de preguntas y respuestas FAQ desde Filament | Gestor Documental |
| CHAT-011 | Análisis de consultas frecuentes | Dashboard de temas más consultados, tasa de resolución | Supervisor |
| CHAT-012 | Detección de intención | Clasificación automática de tipo de consulta (trámite, afiliación, prestación) | Sistema |

### 2.3 Módulo Trámites (TRAM-001 a TRAM-015)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| TRAM-001 | Listar tipos de trámite | Catálogo de trámites disponibles con requisitos | Público |
| TRAM-002 | Crear nuevo trámite | Wizard paso a paso con selección de tipo, datos y documentos | Asegurado |
| TRAM-003 | Guardar borrador | Guardar trámite incompleto para continuar después | Asegurado |
| TRAM-004 | Adjuntar documentos | Subir documentos requeridos por trámite (drag & drop) | Asegurado |
| TRAM-005 | Enviar trámite | Cambiar estado a PENDIENTE y notificar a operadores | Asegurado |
| TRAM-006 | Ver estado de trámite | Timeline con historial completo de cambios de estado | Asegurado |
| TRAM-007 | Seguimiento en tiempo real | Actualización Livewire polling en timeline | Asegurado |
| TRAM-008 | Recibir notificaciones | Email cuando el trámite cambia de estado | Asegurado |
| TRAM-009 | Subsanar trámite | Re-subir documentos corregidos tras solicitud de subsanación | Asegurado |
| TRAM-010 | Aprobar trámite | Cambiar estado a APROBADO con comentario opcional | Operador |
| TRAM-011 | Rechazar trámite | Cambiar estado a RECHAZADO con observaciones obligatorias | Operador |
| TRAM-012 | Solicitar subsanación | Notificar al asegurado que debe corregir documentos | Operador |
| TRAM-013 | Asignar trámite | Asignar trámite a operador específico manualmente | Supervisor |
| TRAM-014 | Buscar y filtrar trámites | Búsqueda por DNI, fecha, estado, tipo, operador asignado | Operador/Supervisor |
| TRAM-015 | Métricas de trámites | Estadísticas: tiempos promedio, volumen por estado, backlog | Supervisor |

### 2.4 Módulo Documentos (DOC-001 a DOC-010)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| DOC-001 | Subir documento | Upload de PDF/JPG/PNG con barra de progreso Livewire | Asegurado |
| DOC-002 | Validación automática | Verificación de formato, tamaño (máx 10 MB), páginas, DPI | Sistema |
| DOC-003 | Versionado de documento | Control automático de versiones al re-subir el mismo documento | Sistema |
| DOC-004 | Previsualizar documento | Vista previa en el navegador sin descargar (PDF.js integrado) | Asegurado |
| DOC-005 | Descargar documento | Descarga con URL firmada temporal de MinIO | Asegurado/Operador |
| DOC-006 | OCR en documentos | Reconocimiento de texto en PDFs escaneados con Tesseract (Job asíncrono) | Sistema |
| DOC-007 | Búsqueda semántica | Búsqueda por contenido en documentos indexados en Qdrant | Gestor Doc. |
| DOC-008 | Gestión de categorías documentales | CRUD de categorías de documentos | Gestor Doc. |
| DOC-009 | Eliminación de documento | Soft delete con confirmación | Asegurado |
| DOC-010 | Metadatos de documento | Hash SHA-256, tamaño, tipo MIME, fecha de subida, usuario | Sistema |

### 2.5 Módulo Noticias (NEWS-001 a NEWS-007)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| NEWS-001 | Listar noticias | Feed paginado con imágenes, categorías y fecha | Público |
| NEWS-002 | Ver detalle noticia | Contenido completo con imágenes, autor y fecha | Público |
| NEWS-003 | Buscar noticias | Búsqueda por título y contenido (MySQL FULLTEXT o Laravel Scout) | Público |
| NEWS-004 | Filtrar por categoría | Navegación por categorías de noticias | Público |
| NEWS-005 | Crear noticia | Publicación con título, contenido (WYSIWYG), imagen destacada | Administrador |
| NEWS-006 | Editar noticia | Modificar noticia existente con historial de cambios | Administrador |
| NEWS-007 | Eliminar noticia | Soft delete con confirmación | Administrador |

### 2.6 Módulo FAQ (FAQ-001 a FAQ-007)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| FAQ-001 | Listar FAQ por categoría | Acordeón de preguntas agrupadas por categoría | Público |
| FAQ-002 | Buscar FAQ | Búsqueda full-text en preguntas y respuestas | Público |
| FAQ-003 | Ver respuesta detallada | Respuesta con formato (Markdown a HTML) | Público |
| FAQ-004 | Votar utilidad | Calificar FAQ como útil / no útil | Asegurado |
| FAQ-005 | Crear FAQ | Registrar pregunta y respuesta con categoría | Gestor Doc. |
| FAQ-006 | Editar FAQ | Modificar pregunta o respuesta existente | Gestor Doc. |
| FAQ-007 | Gestionar categorías FAQ | CRUD de categorías de FAQ | Gestor Doc. |

### 2.7 Módulo Administración (ADMIN-001 a ADMIN-010)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| ADMIN-001 | Dashboard de métricas | KPIs en tiempo real con gráficos (Filament Widgets + Chart.js) | Supervisor |
| ADMIN-002 | Gestión de usuarios | CRUD de usuarios del sistema con filtros avanzados | Super Admin |
| ADMIN-003 | Gestión de roles | Asignación de roles (Spatie) a usuarios | Super Admin |
| ADMIN-004 | Gestión de permisos | Configuración de permisos por rol | Super Admin |
| ADMIN-005 | Logs de auditoría | Historial de acciones del sistema (Laravel Auditable) | Supervisor |
| ADMIN-006 | Configuración del sistema | Parámetros globales: rate limits, tamaños de archivo, etc. | Super Admin |
| ADMIN-007 | Reportes exportables | Reportes en PDF/CSV/Excel (Laravel Excel) | Supervisor |
| ADMIN-008 | Alertas configurables | Umbrales de métricas con notificaciones por email | Supervisor |
| ADMIN-009 | Gestión de colas | Monitoreo de Jobs fallidos y reintentos (Laravel Horizon) | Super Admin |
| ADMIN-010 | Mantenimiento | Modo mantenimiento programable con mensaje personalizado | Super Admin |

### 2.8 Módulo Notificaciones (NOTIF-001 a NOTIF-006)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| NOTIF-001 | Notificación cambio de estado | Email cuando un trámite cambia de estado (Laravel Notification) | Sistema |
| NOTIF-002 | Notificación de subsanación | Email con detalles de la subsanación requerida | Sistema |
| NOTIF-003 | Notificación de noticias | Email para noticias destacadas marcadas como "importante" | Sistema |
| NOTIF-004 | Notificación de bienvenida | Email de bienvenida post-registro con guía de uso | Sistema |
| NOTIF-005 | Notificación de trámite próximo a vencer | Recordatorio 3 días antes de expiración de borrador | Sistema |
| NOTIF-006 | Preferencias de notificación | Configuración de canales (email, web) por tipo de notificación | Asegurado |

---

## 3. Roles del Sistema

| Rol | Código | Descripción | Permisos Clave | Acceso |
|-----|--------|-------------|-----------------|--------|
| **Asegurado** | ASEG | Usuario final de EsSalud que realiza trámites y consultas | Consultar chatbot, crear/ver trámites, subir documentos, ver noticias | Plataforma Web |
| **Operador** | OPER | Personal administrativo que revisa y aprueba trámites | Aprobar/rechazar trámites, ver documentos, contactar asegurado | Filament + Web |
| **Gestor Documental** | GESDOC | Administrador de contenidos documentales del sistema | Gestionar FAQ, categorizar documentos, gestionar fuentes RAG | Filament |
| **Supervisor** | SUPV | Supervisa operaciones y métricas del sistema | Dashboard KPIs, reportes, auditoría, asignar trámites | Filament |
| **Super Admin** | SADM | Administrador técnico del sistema con control total | Gestión de usuarios/roles, config del sistema, logs completos | Filament |

---

## 4. Matriz de Funcionalidades vs Roles

| Funcionalidad | ASEG | OPER | GESDOC | SUPV | SADM |
|--------------|:----:|:----:|:------:|:----:|:----:|
| Registro de asegurado | — | ❌ | ❌ | ❌ | ❌ |
| Inicio de sesión | ✅ | ✅ | ✅ | ✅ | ✅ |
| Recuperación de contraseña | ✅ | ✅ | ✅ | ✅ | ✅ |
| Consultar chatbot FAQ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Consultar chatbot RAG | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver historial chat | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crear trámite | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver estado trámite | ✅ | ✅ | ❌ | ✅ | ✅ |
| Adjuntar documentos | ✅ | ❌ | ❌ | ❌ | ❌ |
| Subsanar trámite | ✅ | ❌ | ❌ | ❌ | ❌ |
| Aprobar trámite | ❌ | ✅ | ❌ | ❌ | ✅ |
| Rechazar trámite | ❌ | ✅ | ❌ | ❌ | ✅ |
| Solicitar subsanación | ❌ | ✅ | ❌ | ❌ | ✅ |
| Asignar trámite | ❌ | ❌ | ❌ | ✅ | ✅ |
| Listar todos los trámites | ❌ | ✅ | ❌ | ✅ | ✅ |
| Ver dashboard KPIs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Exportar reportes | ❌ | ❌ | ❌ | ✅ | ✅ |
| Gestión de usuarios | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gestión de roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gestionar FAQ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Gestionar noticias | ❌ | ❌ | ✅ | ❌ | ✅ |
| Ver logs auditoría | ❌ | ❌ | ❌ | ✅ | ✅ |
| Configurar sistema | ❌ | ❌ | ❌ | ❌ | ✅ |
| Preferencias de notificación | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 5. Reglas de Negocio

### BR-001 a BR-010: Reglas de Autenticación

| ID | Regla | Acción | Excepción |
|----|-------|--------|-----------|
| BR-001 | Un asegurado debe tener un DNI válido (8 dígitos) verificado contra RENIEC | Crear cuenta | Fallback a validación manual |
| BR-002 | La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo | Registrar/actualizar | - |
| BR-003 | Tras 5 intentos de login fallidos, bloquear cuenta por 30 minutos | Login | Desbloqueo vía email |
| BR-004 | La sesión expira tras 2 horas de inactividad (configurable en session.php) | Sesión | - |
| BR-005 | El link de recuperación de contraseña expira en 60 minutos | Recuperación | Re-solicitar |
| BR-006 | Solo el SUPER_ADMIN puede crear otros usuarios con rol administrativo | Gestión de usuarios | - |
| BR-007 | Cada usuario debe tener al menos un rol asignado | Registro | Rol ASEG por defecto |
| BR-008 | Un correo electrónico no puede repetirse entre usuarios | Registro/actualización | - |
| BR-009 | La verificación de email es obligatoria para acceder a funcionalidades | Post-registro | Período de gracia 7 días |
| BR-010 | Un usuario solo puede tener una sesión activa a la vez (opcional configurable) | Login | - |

### BR-011 a BR-020: Reglas de Trámites

| ID | Regla | Acción | Excepción |
|----|-------|--------|-----------|
| BR-011 | Un asegurado no puede tener dos trámites del mismo tipo en estado PENDIENTE o EN_REVISION | Crear trámite | - |
| BR-012 | Todo trámite debe tener al menos un documento adjunto para ser enviado a revisión | Enviar trámite | - |
| BR-013 | El operador debe registrar una observación obligatoria al rechazar un trámite | Rechazar | - |
| BR-014 | Un trámite en SUBSANACION tiene 15 días calendario para corrección | Subsanación | Se cancela automáticamente (Scheduled Task) |
| BR-015 | Después de 3 subsanaciones fallidas, el trámite se cancela automáticamente | Subsanación | Notificación previa 48h |
| BR-016 | El tiempo máximo de revisión de un trámite es 7 días hábiles desde que entra en EN_REVISION | Revisión | Escalar a supervisor (notificación) |
| BR-017 | Un supervisor puede reasignar un trámite a otro operador en cualquier momento | Asignación | - |
| BR-018 | Los trámites APROBADOS no pueden ser modificados ni eliminados | Post-aprobación | Solo SUPER_ADMIN con justificación |
| BR-019 | El estado inicial de todo trámite es BORRADOR | Creación | - |
| BR-020 | Si un trámite está en BORRADOR por más de 30 días, se elimina automáticamente (soft delete) | Limpieza | Notificación 7 y 3 días antes |

### BR-021 a BR-030: Reglas de Documentos e IA

| ID | Regla | Acción | Excepción |
|----|-------|--------|-----------|
| BR-021 | El tamaño máximo de documento es 10 MB | Subida | Documentos más grandes se rechazan |
| BR-022 | Los formatos aceptados son PDF, JPG, PNG | Subida | - |
| BR-023 | Los PDFs escaneados deben tener resolución mínima de 200 DPI | Validación OCR | - |
| BR-024 | Un documento con contenido ilegible (OCR confidence < 60%) se marca para revisión manual | Validación automática | No bloquea el trámite |
| BR-025 | Cada versión de documento se almacena con metadatos: fecha, usuario, hash SHA-256 | Versionado | - |
| BR-026 | El chunk de texto para embedding no debe exceder 500 tokens (~1500 caracteres) | RAG | Chunks mayores se dividen con overlap |
| BR-027 | La similitud mínima (cosine similarity) para recuperar un chunk es 0.75 | Búsqueda RAG | Fallback a FAQ |
| BR-028 | Si la confianza de respuesta RAG es < 0.6, se sugiere escalar a operador humano | Chatbot | - |
| BR-029 | Las fuentes citadas deben incluir: nombre de documento, página, fecha de emisión | Citación | - |
| BR-030 | Los embeddings se regeneran (Job) al actualizar un documento fuente en el sistema | Indexación | Cache de preguntas frecuentes se invalida |

---

## 6. Workflow de Estados de Trámite

```
┌──────────┐    enviar     ┌───────────┐    asignar     ┌─────────────┐
│ BORRADOR │──────────────▶│ PENDIENTE │───────────────▶│ EN REVISION │
└──────────┘               └───────────┘                └──────┬──────┘
     │                         │                               │
     │ 30 días                 │                               │
     ▼                         ▼                               │
┌──────────┐            (asignado a                           │
│ ELIMINADO│             operador)                     ┌──────┼──────┐
└──────────┘                                           │      │      │
                                                       ▼      ▼      ▼
                                                  ┌───────┐┌──────┐┌──────────┐
                                                  │APROB. ││RECHAZ││SUBSANAR  │
                                                  └───────┘└──┬───┘└────┬─────┘
                                                               │         │
                                                               │  15 días│
                                                               │    o 3  │
                                                               │ intentos│
                                                               ▼         │
                                                          ┌─────────┐   │
                                                          │CANCELADO│◀──┘
                                                          └─────────┘
```

### Transiciones Válidas

| Desde | Hacia | Quién | Condición |
|-------|-------|-------|-----------|
| BORRADOR | PENDIENTE | Asegurado | Al menos 1 documento adjunto |
| BORRADOR | ELIMINADO | Sistema | 30 días sin cambios (Scheduler) |
| PENDIENTE | EN_REVISION | Supervisor/Operador | Operador asignado |
| EN_REVISION | APROBADO | Operador | Documentos conformes |
| EN_REVISION | RECHAZADO | Operador | Observación obligatoria |
| EN_REVISION | SUBSANACION | Operador | Documentos requieren corrección |
| RECHAZADO | SUBSANACION | Asegurado | Dentro de 15 días calendario |
| SUBSANACION | EN_REVISION | Asegurado | Nuevos documentos subidos |
| SUBSANACION | CANCELADO | Sistema | 3 intentos de subsanación o 15 días |
| SUBSANACION | CANCELADO | Asegurado | Desistimiento voluntario |

---

## 7. Integraciones Externas

| Sistema | Propósito | Tipo | Frecuencia | Driver / Paquete |
|---------|-----------|------|------------|------------------|
| **RENIEC** | Validación de DNI y datos personales | REST API | Bajo demanda | Http Client (Guzzle) |
| **OpenAI Embeddings** | Generación de vectores semánticos | REST API | Alto (por documento) | openai-php/client |
| **OpenAI Chat** | Generación de respuestas del LLM | REST API | Alto (por consulta) | openai-php/client |
| **SMTP** | Envío de emails transaccionales | SMTP | Medio | Laravel Mail + Notifications |
| **APIs EsSalud Legacy** | Consulta de datos históricos | REST/SOAP | Bajo | Http Client (Guzzle) |
| **Tesseract OCR** | Reconocimiento de texto en PDFs | CLI | Medio | thiagoalessio/tesseract_ocr |
| **Qdrant** | Base de datos vectorial | gRPC/REST | Alto | hkulekci/qdrant |
| **MinIO** | Almacenamiento S3-compatible | S3 API | Alto | Laravel Flysystem (s3 driver) |
| **Redis** | Caché, sesiones, colas | TCP | Continuo | Laravel Redis (predis) |

---

## 8. Glosario de Términos

| Término | Definición |
|---------|-----------|
| **Asegurado** | Persona registrada en EsSalud con derecho a cobertura de salud |
| **Trámite** | Solicitud formal de servicio presentada por el asegurado |
| **Subsanación** | Corrección de documentos o datos requerida tras observación del operador |
| **Operador** | Personal administrativo de EsSalud que revisa y gestiona trámites |
| **RAG** | Retrieval-Augmented Generation — técnica de IA que combina recuperación de información con generación de texto |
| **Chunk** | Fragmento de texto extraído de un documento para procesamiento y embedding |
| **Embedding** | Vector numérico que representa el significado semántico de un texto |
| **Qdrant** | Base de datos vectorial para búsqueda semántica por similitud |
| **MinIO** | Almacenamiento de objetos compatible con API S3 de AWS |
| **RBAC** | Role-Based Access Control — control de acceso basado en roles |
| **Sanctum** | Paquete oficial de Laravel para autenticación SPA y API tokens |
| **Spatie Permissions** | Paquete de Laravel para gestión de roles y permisos |
| **Livewire** | Framework full-stack para Laravel que permite construir UI dinámicas sin JavaScript |
| **Filament** | Panel administrativo TALL stack (Tailwind, Alpine.js, Laravel, Livewire) |
| **Blade** | Motor de plantillas de Laravel para renderizar vistas HTML |
| **Eloquent** | ORM de Laravel para interacción con base de datos |
| **Horizon** | Dashboard y gestor de colas para Laravel Queue con Redis |
| **Telescope** | Debugger y profiler para aplicaciones Laravel en desarrollo |
| **Job** | Tarea asíncrona ejecutada en segundo plano a través de Laravel Queue |
| **Scheduler** | Programador de tareas de Laravel (cron) para tareas recurrentes |
| **Citación de fuente** | Referencia explícita al documento oficial usado en una respuesta de IA |

---

## 9. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[07_ROLES_PERMISOS.md]] | Matriz RBAC expandida con Spatie y detalle de permisos |
| [[24_REQUISITOS_FUNCIONALES.md]] | Catálogo de requisitos funcionales con criterios de verificación |
| [[01_PLAN_DETALLADO.md]] | Plan estratégico con roadmap de 8 fases y 22 semanas |
| [[09_CASOS_USO_UML.md]] | Casos de uso detallados del sistema |
| [[18_API_REST.md]] | Especificación de endpoints REST con Laravel Sanctum |
| [[11_RAG_QDRANT.md]] | Detalle del sistema RAG con Qdrant y OpenAI |
| [[04_ARQUITECTURA.md]] | Arquitectura del monolito modular Laravel |

---

#spec #essalud #requisitos #funcional #v1.0 #laravel #livewire
