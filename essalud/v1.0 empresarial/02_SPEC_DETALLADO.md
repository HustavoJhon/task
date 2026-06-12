# SPEC DETALLADO - Especificación Funcional EsSalud v1.0 Empresarial

## 1. Descripción del Sistema

Plataforma inteligente omnicanal que permite a los asegurados de EsSalud realizar trámites documentarios, consultar información oficial mediante chatbot con IA, gestionar documentos digitales y recibir notificaciones de estado — todo desde una aplicación móvil Flutter con backend de microservicios Python/FastAPI. El sistema incluye un panel administrativo para operadores de EsSalud con capacidades de gestión de trámites, documentos, y análisis de métricas.

---

## 2. Catálogo Completo de Funcionalidades por Módulo

### 2.1 Módulo de Autenticación (AUTH-001 a AUTH-010)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| AUTH-001 | Registro de asegurado | Registro con DNI, email, teléfono y validación RENIEC | Público |
| AUTH-002 | Inicio de sesión | Login con email + contraseña, genera JWT | Todos |
| AUTH-003 | Refresh token | Renovación automática de token JWT | Todos |
| AUTH-004 | Cierre de sesión | Invalidación de token activo | Todos |
| AUTH-005 | Recuperación de contraseña | Email con link de restablecimiento | Público |
| AUTH-006 | Cambio de contraseña | Cambio desde perfil con validación de anterior | Todos |
| AUTH-007 | Verificación de cuenta | Email de confirmación post-registro | Público |
| AUTH-008 | Biometría (v2.0) | Login con huella dactilar o reconocimiento facial | Todos |
| AUTH-009 | Sesión múltiple | Control de sesiones activas por usuario | Todos |
| AUTH-010 | Bloqueo por intentos | Bloqueo temporal tras 5 intentos fallidos | Sistema |

### 2.2 Módulo Chatbot (CHAT-001 a CHAT-012)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| CHAT-001 | Consulta FAQ estructurada | Respuesta inmediata desde FAQ clasificada por temas | Asegurado |
| CHAT-002 | Consulta RAG con documentos | Búsqueda semántica en documentos oficiales | Asegurado |
| CHAT-003 | Citación de fuentes | Referencia al documento oficial usado en la respuesta | Asegurado |
| CHAT-004 | Historial de conversaciones | Persistencia de sesiones de chat | Asegurado |
| CHAT-005 | Continuar conversación | Retomar sesión anterior desde el último mensaje | Asegurado |
| CHAT-006 | Preguntas frecuentes sugeridas | Sugerencias automáticas al iniciar chat | Asegurado |
| CHAT-007 | Escalamiento a operador | Derivación a humano cuando IA no puede responder | Sistema |
| CHAT-008 | Feedback en respuestas | Calificar respuesta como útil/no útil | Asegurado |
| CHAT-009 | Exportar historial chat | Descarga de conversación en PDF | Asegurado |
| CHAT-010 | Gestión de FAQ (admin) | CRUD de preguntas y respuestas FAQ | Gestor Documental |
| CHAT-011 | Análisis de consultas frecuentes | Reporte de temas más consultados | Supervisor |
| CHAT-012 | Detección de intención | Clasificación automática de tipo de consulta | Sistema |

### 2.3 Módulo Trámites (TRAM-001 a TRAM-012)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| TRAM-001 | Listar trámites disponibles | Catálogo de trámites con requisitos | Público |
| TRAM-002 | Crear nuevo trámite | Iniciar trámite con selección de tipo | Asegurado |
| TRAM-003 | Adjuntar documentos | Subir documentos requeridos por trámite | Asegurado |
| TRAM-004 | Ver estado de trámite | Consultar estado actual del trámite | Asegurado |
| TRAM-005 | Seguimiento línea de tiempo | Historial de cambios de estado con fechas | Asegurado |
| TRAM-006 | Subsanar trámite | Re-subir documentos corregidos tras rechazo | Asegurado |
| TRAM-007 | Aprobar trámite | Cambiar estado a aprobado | Operador |
| TRAM-008 | Rechazar trámite | Cambiar estado a rechazado con observaciones | Operador |
| TRAM-009 | Solicitar subsanación | Notificar al asegurado que debe corregir | Operador |
| TRAM-010 | Asignar trámite | Asignar trámite a operador específico | Supervisor |
| TRAM-011 | Buscar y filtrar trámites | Búsqueda por DNI, fecha, estado, tipo | Operador/Supervisor |
| TRAM-012 | Métricas de trámites | Estadísticas de tiempos de aprobación | Supervisor |

### 2.4 Módulo Documentos (DOC-001 a DOC-008)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| DOC-001 | Subir documento | Upload de PDF/imagen con validación automática | Asegurado/Cualquier |
| DOC-002 | Versionado de documento | Control de versiones al re-subuir | Sistema |
| DOC-003 | Previsualizar documento | Vista previa en app sin descargar | Asegurado |
| DOC-004 | Descargar documento | Descarga con presigned URL de MinIO | Asegurado/Operador |
| DOC-005 | Validación automática | Verificación de formato, tamaño, páginas | Sistema |
| DOC-006 | Búsqueda semántica | Búsqueda por contenido en documentos indexados | Gestor doc. |
| DOC-007 | Gestión de categorías | CRUD de categorías documentales | Gestor doc. |
| DOC-008 | OCR en documentos | Reconocimiento de texto en PDFs escaneados | Sistema |

### 2.5 Módulo Noticias (NEWS-001 a NEWS-006)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| NEWS-001 | Listar noticias | Feed paginado con categorías | Público |
| NEWS-002 | Ver detalle noticia | Contenido completo con imágenes | Público |
| NEWS-003 | Buscar noticias | Búsqueda por título y contenido | Público |
| NEWS-004 | Crear noticia | Publicación con título, contenido, imagen | Administrador |
| NEWS-005 | Editar noticia | Modificar noticia existente | Administrador |
| NEWS-006 | Eliminar noticia | Borrado lógico con confirmación | Administrador |

### 2.6 Módulo Administración (ADMIN-001 a ADMIN-007)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| ADMIN-001 | Dashboard de métricas | KPIs en tiempo real | Supervisor |
| ADMIN-002 | Gestión de usuarios | CRUD de usuarios del sistema | Super Admin |
| ADMIN-003 | Gestión de roles | Asignación de roles a usuarios | Super Admin |
| ADMIN-004 | Logs de auditoría | Historial de acciones del sistema | Supervisor |
| ADMIN-005 | Configuración del sistema | Parámetros globales de la plataforma | Super Admin |
| ADMIN-006 | Reportes exportables | Reportes en PDF/CSV/Excel | Supervisor |
| ADMIN-007 | Alertas configurables | Umbrales de métricas con notificaciones | Supervisor |

### 2.7 Módulo Notificaciones (NOTIF-001 a NOTIF-005)

| ID | Funcionalidad | Descripción | Rol |
|----|--------------|-------------|-----|
| NOTIF-001 | Notificación cambio de estado | Email cuando un trámite cambia de estado | Sistema |
| NOTIF-002 | Notificación de subsanación | Alerta cuando se requiere corrección de documento | Sistema |
| NOTIF-003 | Notificación de noticias | Push notification para noticias importantes | Sistema |
| NOTIF-004 | Notificación de bienvenida | Email de bienvenida post-registro | Sistema |
| NOTIF-005 | Preferencias de notificación | Configuración de canales por usuario | Asegurado |

---

## 3. Roles del Sistema

| Rol | Código | Descripción | Permisos Clave | Acceso |
|-----|--------|-------------|-----------------|--------|
| **Asegurado** | ASEG | Usuario final de EsSalud que realiza trámites y consultas | Consultar chatbot, crear/ver trámites, subir documentos, ver noticias | App Móvil |
| **Operador** | OPER | Personal administrativo que revisa y aprueba trámites | Aprobar/rechazar trámites, ver documentos, contactar asegurado | Dashboard Web |
| **Gestor Documental** | GESDOC | Administrador de contenidos documentales del sistema | Gestionar FAQ, categorizar documentos, gestionar RAG sources | Dashboard Web |
| **Supervisor** | SUPV | Supervisa operaciones y métricas del sistema | Dashboard KPIs, reportes, auditoría, asignar tareas | Dashboard Web |
| **Super Admin** | SADM | Administrador técnico del sistema con control total | Gestión de usuarios/roles, config sistema, logs completos | Dashboard Web |

---

## 4. Matriz de Funcionalidades vs Roles

| Funcionalidad | ASEG | OPER | GESDOC | SUPV | SADM |
|--------------|:----:|:----:|:------:|:----:|:----:|
| Registro de asegurado | ✅ | ❌ | ❌ | ❌ | ❌ |
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
| Asignar trámite | ❌ | ❌ | ❌ | ✅ | ✅ |
| Listar todos los trámites | ❌ | ✅ | ❌ | ✅ | ✅ |
| Gestionar FAQ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Ver dashboard KPIs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Exportar reportes | ❌ | ❌ | ❌ | ✅ | ✅ |
| Gestión de usuarios | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gestión de roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| Ver logs auditoría | ❌ | ❌ | ❌ | ✅ | ✅ |
| Configurar sistema | ❌ | ❌ | ❌ | ❌ | ✅ |
| CRUD noticias | ❌ | ❌ | ❌ | ❌ | ✅ |
| Búsqueda semántica documentos | ❌ | ❌ | ✅ | ❌ | ✅ |
| Notificaciones push | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 5. Reglas de Negocio

### BR-001 a BR-010: Reglas de Autenticación

| ID | Regla | Acción | Excepción |
|----|-------|--------|-----------|
| BR-001 | Un asegurado debe tener un DNI válido (8 dígitos) verificado contra RENIEC | Crear cuenta | Fallback a validación manual |
| BR-002 | La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo | Registrar/actualizar contraseña | - |
| BR-003 | Tras 5 intentos de login fallidos, bloquear cuenta por 30 minutos | Login | Desbloqueo via email |
| BR-004 | El token JWT expira a las 24 horas | Autenticación | Renew con refresh token |
| BR-005 | El refresh token expira a los 30 días | Renovación | Re-login requerido |
| BR-006 | Solo el SUPER_ADMIN puede crear otros usuarios admin | Gestión de usuarios | - |
| BR-007 | Cada usuario debe tener al menos un rol asignado | Registro | Rol ASEG por defecto |
| BR-008 | Un correo electrónico no puede repetirse entre usuarios | Registro/actualización | - |
| BR-009 | Las sesiones inactivas por más de 2 horas se cierran automáticamente | Sesión | - |
| BR-010 | El cambio de contraseña requiere verificación del correo electrónico | Recuperación | - |

### BR-011 a BR-020: Reglas de Trámites

| ID | Regla | Acción | Excepción |
|----|-------|--------|-----------|
| BR-011 | Un asegurado no puede tener dos trámites del mismo tipo en estado PENDIENTE | Crear trámite | - |
| BR-012 | Todo trámite debe tener al menos un documento adjunto para ser revisado | Enviar trámite | Trámites sin documentos requeridos |
| BR-013 | El operador debe registrar una observación al rechazar un trámite | Rechazar | - |
| BR-014 | Un trámite rechazado por subsanación tiene 15 días calendario para corrección | Subsanación | Se cierra automáticamente |
| BR-015 | Después de 3 subsanaciones fallidas, el trámite se cancela automáticamente | Subsanación | - |
| BR-016 | El tiempo máximo de revisión de un trámite es 7 días hábiles | Revisión | Escalar a supervisor |
| BR-017 | Un supervisor puede reasignar un trámite a otro operador | Asignación | - |
| BR-018 | Los trámites aprobados no pueden ser modificados ni eliminados | Post-aprobación | Solo SUPER_ADMIN |
| BR-019 | El estado inicial de todo trámite es BORRADOR | Creación | - |
| BR-020 | Si un trámite está en BORRADOR por más de 30 días, se elimina automáticamente | Limpieza | Notificación previa |

### BR-021 a BR-030: Reglas de Documentos e IA

| ID | Regla | Acción | Excepción |
|----|-------|--------|-----------|
| BR-021 | El tamaño máximo de documento es 10 MB | Subida | Documentos de más de 10 MB no se procesan |
| BR-022 | Los formatos aceptados son PDF, JPG, PNG | Subida | - |
| BR-023 | Los PDFs escaneados deben tener resolución mínima de 200 DPI | Validación OCR | - |
| BR-024 | Un documento con contenido ilegible se rechaza automáticamente | Validación automática | Revisión manual |
| BR-025 | Cada versión de documento se almacena con metadatos de fecha, usuario y hash | Versionado | - |
| BR-026 | El chunk de texto para embedding no debe exceder 512 tokens | RAG | Chunks mayores se dividen |
| BR-027 | La similitud mínima para recuperar un chunk es 0.75 | Búsqueda RAG | Fallback a FAQ |
| BR-028 | Si la confianza de respuesta RAG es < 0.6, escalar a operador humano | Chatbot | - |
| BR-029 | Las fuentes citadas deben incluir nombre de documento, página y fecha | Citación | - |
| BR-030 | Los embeddings se regeneran al actualizar un documento | Indexación | Cache hasta nuevo chunking |

---

## 6. Integraciones Externas

| Sistema | Propósito | Tipo | Frecuencia | Protocolo |
|---------|-----------|------|------------|-----------|
| **RENIEC** | Validación de DNI y datos personales | REST API | Bajo demanda | HTTPS + API Key |
| **OpenAI Embeddings** | Generación de vectores semánticos para RAG | REST API | Alto (por documento) | HTTPS + API Key |
| **OpenAI Chat** | Generación de respuestas del LLM | REST API | Alto (por consulta) | HTTPS + API Key |
| **SMTP (SendGrid/Mailgun)** | Envío de notificaciones por email | SMTP API | Medio | SMTP + API Key |
| **APIs Legacy EsSalud** | Consulta de datos históricos de asegurados | REST SOAP | Bajo | HTTPS (bridge) |
| **Tesseract OCR** | Reconocimiento de texto en PDFs escaneados | Local CLI | Medio | Ejecución local |
| **Prometheus** | Métricas del sistema | HTTP Pull | Continuo | HTTP |
| **Loki** | Logs centralizados | HTTP Push | Continuo | HTTP |

---

## 7. Glosario de Términos

| Término | Definición |
|---------|-----------|
| **Asegurado** | Persona registrada en EsSalud con derecho a cobertura de salud |
| **Trámite** | Solicitud formal de servicio presentada por el asegurado |
| **Subsanación** | Corrección de documentos o datos requerida tras rechazo |
| **Operador** | Personal administrativo de EsSalud que revisa y gestiona trámites |
| **RAG** | Retrieval-Augmented Generation — técnica de IA que combina recuperación de información con generación de texto |
| **Chunk** | Fragmento de texto extraído de un documento para procesamiento |
| **Embedding** | Vector numérico que representa el significado semántico de un texto |
| **Qdrant** | Base de datos vectorial para búsqueda semántica |
| **MinIO** | Almacenamiento de objetos compatible con S3 |
| **Presigned URL** | URL temporal firmada para acceso seguro a un objeto |
| **RBAC** | Role-Based Access Control — control de acceso basado en roles |
| **JWT** | JSON Web Token — estándar para tokens de autenticación |
| **Citación de fuente** | Referencia explícita al documento oficial usado en una respuesta de IA |
| **Subsanación** | Proceso de corrección de documentos después de una observación |
| **FLOW** | Workflow de estados de un trámite a través del sistema |

---

## 8. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[07_ROLES_PERMISOS.md]] | Matriz RBAC expandida y detalle de permisos |
| [[24_REQUISITOS_FUNCIONALES.md]] | Catálogo de requisitos funcionales con criterios de verificación |
| [[01_PLAN_DETALLADO.md]] | Plan estratégico con roadmap y fases |
| [[09_CASOS_USO_UML.md]] | Casos de uso detallados del sistema |
| [[18_OPENAPI_SWAGGER.md]] | Especificación de endpoints REST |
| [[11_RAG_QDRANT.md]] | Detalle del sistema RAG |

---

#spec #essalud #requisitos #funcional #v1.0
