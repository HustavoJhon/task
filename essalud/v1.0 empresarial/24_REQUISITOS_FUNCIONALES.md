# REQUISITOS FUNCIONALES - EsSalud v1.0 Empresarial

## 1. Catálogo de Requisitos Funcionales

### Módulo: Autenticación (RF-001 a RF-009)

| ID | Nombre | Prioridad | Estado | Descripción | Criterio de Verificación |
|:--:|--------|:---------:|:------:|-------------|--------------------------|
| RF-001 | Registro de asegurado | Alta | ✅ Aprobado | El sistema permite registrar un nuevo asegurado con DNI, email, teléfono y contraseña | Se crea cuenta exitosamente con DNI válido verificado contra RENIEC |
| RF-002 | Inicio de sesión | Alta | ✅ Aprobado | El sistema permite iniciar sesión con email y contraseña, generando JWT | Se obtiene access_token y refresh_token válidos |
| RF-003 | Refresh token | Alta | ✅ Aprobado | El sistema permite renovar el token de acceso usando el refresh token | Se obtiene nuevo access_token sin reingresar credenciales |
| RF-004 | Cierre de sesión | Alta | ✅ Aprobado | El sistema permite cerrar sesión invalidando el token activo | El token no puede ser usado después del logout |
| RF-005 | Recuperación de contraseña | Alta | ✅ Aprobado | El sistema envía email con link para restablecer contraseña | Se puede cambiar la contraseña usando el link recibido |
| RF-006 | Cambio de contraseña | Media | 📝 En revisión | El sistema permite cambiar la contraseña desde el perfil, requiriendo la contraseña actual | La contraseña se actualiza y las sesiones existentes se invalidan |
| RF-007 | Verificación de email | Alta | ✅ Aprobado | El sistema envía email de verificación post-registro | La cuenta solo está activa después de verificar el email |
| RF-008 | Bloqueo por intentos fallidos | Alta | ✅ Aprobado | El sistema bloquea la cuenta temporalmente tras 5 intentos fallidos de login | La cuenta no permite login por 30 minutos tras el bloqueo |
| RF-009 | Verificar identidad con RENIEC | Alta | ✅ Aprobado | El sistema valida el DNI contra la API de RENIEC durante el registro | Se confirma que el DNI existe y corresponde a la persona |

### Módulo: Gestión de Usuarios (RF-010 a RF-014)

| ID | Nombre | Prioridad | Estado | Descripción | Criterio de Verificación |
|:--:|--------|:---------:|:------:|-------------|--------------------------|
| RF-010 | CRUD de usuarios | Alta | ✅ Aprobado | El SUPER_ADMIN puede crear, leer, actualizar y desactivar usuarios del sistema | Se puede gestionar usuarios desde el panel admin |
| RF-011 | Asignación de roles | Alta | ✅ Aprobado | El SUPER_ADMIN puede asignar uno o más roles a un usuario | Los permisos del usuario reflejan los roles asignados |
| RF-012 | Gestión de roles | Alta | ✅ Aprobado | El SUPER_ADMIN puede crear, editar y desactivar roles | Los roles creados están disponibles para asignación |
| RF-013 | Gestión de permisos | Alta | ✅ Aprobado | El SUPER_ADMIN puede asignar permisos a cada rol | Los permisos se reflejan en el middleware de autorización |
| RF-014 | Carga masiva de usuarios | Media | 📝 En revisión | El sistema permite cargar usuarios desde archivo CSV | Se crean múltiples usuarios en una sola operación |

### Módulo: Chatbot (RF-015 a RF-024)

| ID | Nombre | Prioridad | Estado | Descripción | Criterio de Verificación |
|:--:|--------|:---------:|:------:|-------------|--------------------------|
| RF-015 | Consulta FAQ estructurada | Alta | ✅ Aprobado | El sistema responde consultas usando FAQ predefinidas con matching semántico | La respuesta se obtiene en < 1s con match > 0.85 |
| RF-016 | Consulta RAG sobre documentos | Alta | ✅ Aprobado | El sistema busca en documentos oficiales usando búsqueda vectorial | La respuesta incluye contenido de documentos indexados |
| RF-017 | Citación de fuentes | Alta | ✅ Aprobado | El sistema muestra la fuente oficial de cada afirmación | Cada respuesta RAG incluye nombre de documento, página y snippet |
| RF-018 | Historial de conversaciones | Alta | ✅ Aprobado | El sistema guarda y permite consultar el historial de sesiones de chat | Se puede navegar entre sesiones anteriores |
| RF-019 | Preguntas frecuentes sugeridas | Media | ✅ Aprobado | El sistema sugiere preguntas frecuentes al iniciar el chat | Se muestran 3-5 sugerencias relevantes |
| RF-020 | Escalamiento a operador humano | Alta | ✅ Aprobado | El sistema sugiere escalar a operador cuando no puede resolver la consulta | Se muestra opción de contactar operador con confianza < 0.6 |
| RF-021 | Feedback en respuestas | Baja | ✅ Aprobado | El usuario puede calificar la respuesta como útil o no útil | El feedback se registra para análisis de calidad |
| RF-022 | Exportar historial de chat | Baja | 📝 En revisión | El usuario puede descargar el historial de una sesión en PDF | Se genera PDF con todos los mensajes de la sesión |
| RF-023 | Gestión de FAQ (admin) | Alta | ✅ Aprobado | El gestor documental puede crear, editar y eliminar preguntas FAQ | Los cambios se reflejan en el chatbot inmediatamente |
| RF-024 | Reindexar documentos RAG | Alta | ✅ Aprobado | El gestor puede forzar la reindexación de un documento en Qdrant | El documento se reprocesa y actualiza en el índice |

### Módulo: RAG (RF-025 a RF-030)

| ID | Nombre | Prioridad | Estado | Descripción | Criterio de Verificación |
|:--:|--------|:---------:|:------:|-------------|--------------------------|
| RF-025 | Indexación automática de documentos | Alta | ✅ Aprobado | Los documentos pasan por pipeline de chunking y embedding automáticamente | El documento está disponible para búsqueda RAG en < 5 min |
| RF-026 | Búsqueda semántica en documentos | Alta | ✅ Aprobado | El sistema permite buscar documentos por significado, no solo por palabras clave | Resultados relevantes aparecen aunque no tengan las palabras exactas |
| RF-027 | Actualización de embeddings | Alta | ✅ Aprobado | Al actualizar un documento, los embeddings se regeneran | Las búsquedas usan la versión más reciente del documento |
| RF-028 | Configuración de umbral de similitud | Media | 📝 En revisión | El gestor puede configurar el threshold de similitud para búsqueda RAG | Cambiar el threshold afecta los resultados de búsqueda |
| RF-029 | Monitoreo de calidad RAG | Media | 📝 En revisión | El sistema muestra métricas de recall, precisión y latencia del RAG | Las métricas están disponibles en el dashboard |
| RF-030 | Fallback a FAQ cuando RAG falla | Alta | ✅ Aprobado | Si RAG no encuentra resultados, el sistema intenta con FAQ | El usuario siempre recibe una respuesta, aunque sea de FAQ |

### Módulo: Trámites (RF-031 a RF-042)

| ID | Nombre | Prioridad | Estado | Descripción | Criterio de Verificación |
|:--:|--------|:---------:|:------:|-------------|--------------------------|
| RF-031 | Catálogo de tipos de trámite | Alta | ✅ Aprobado | El sistema muestra los tipos de trámite disponibles con requisitos | Se listan todos los trámites con su información |
| RF-032 | Crear nuevo trámite | Alta | ✅ Aprobado | El asegurado puede crear un trámite seleccionando tipo, completando datos | El trámite se crea y se asigna un ID único |
| RF-033 | Guardar como borrador | Alta | ✅ Aprobado | El asegurado puede guardar un trámite incompleto como borrador | El borrador se puede retomar y completar después |
| RF-034 | Enviar trámite a revisión | Alta | ✅ Aprobado | El asegurado puede enviar el trámite completo para revisión | El estado cambia a PENDIENTE y se notifica a operadores |
| RF-035 | Ver estado del trámite | Alta | ✅ Aprobado | El asegurado puede consultar el estado actual de su trámite | Se muestra el estado actual con timeline de cambios |
| RF-036 | Adjuntar documentos al trámite | Alta | ✅ Aprobado | El asegurado puede subir documentos requeridos para el trámite | Los documentos se asocian al trámite y se validan |
| RF-037 | Subsanar trámite | Alta | ✅ Aprobado | El asegurado puede re-subir documentos corregidos tras un rechazo subsanable | El trámite vuelve a EN_REVISION después de subsanar |
| RF-038 | Aprobar trámite (operador) | Alta | ✅ Aprobado | El operador puede aprobar un trámite que cumple requisitos | El estado cambia a APROBADO y se notifica al asegurado |
| RF-039 | Rechazar trámite (operador) | Alta | ✅ Aprobado | El operador puede rechazar un trámite con observaciones | El estado cambia a RECHAZADO o SUBSANACION |
| RF-040 | Asignar trámite a operador | Media | ✅ Aprobado | El supervisor puede asignar trámites a operadores específicos | El trámite aparece en la lista del operador asignado |
| RF-041 | Timeline de cambios | Alta | ✅ Aprobado | El sistema muestra el historial de cambios de estado del trámite | Se ven todas las transiciones con fecha y responsable |
| RF-042 | Cancelación automática por inactividad | Alta | ✅ Aprobado | Los trámites en BORRADOR por +30 días se cancelan automáticamente | El estado cambia a CANCELADO con notificación |

### Módulo: Documentos (RF-043 a RF-050)

| ID | Nombre | Prioridad | Estado | Descripción | Criterio de Verificación |
|:--:|--------|:---------:|:------:|-------------|--------------------------|
| RF-043 | Subir documento | Alta | ✅ Aprobado | El usuario puede subir archivos PDF, JPG o PNG | El archivo se almacena en MinIO y se registra en BD |
| RF-044 | Validación automática de documentos | Alta | ✅ Aprobado | El sistema valida formato, tamaño y legibilidad del documento automáticamente | Documentos inválidos son rechazados con mensaje claro |
| RF-045 | Versionado de documentos | Alta | ✅ Aprobado | Al re-subir un documento existente, se crea una nueva versión | Se mantiene el historial de versiones del documento |
| RF-046 | Vista previa de documento | Alta | ✅ Aprobado | El usuario puede ver el documento sin descargarlo | Se renderiza vista previa en baja resolución |
| RF-047 | Descarga segura (presigned URL) | Alta | ✅ Aprobado | La descarga usa URLs temporales firmadas | La URL expira después de 1 hora |
| RF-048 | OCR para documentos escaneados | Alta | ✅ Aprobado | El sistema extrae texto de PDFs escaneados usando OCR | El texto extraído se usa para búsqueda e indexación |
| RF-049 | Categorización de documentos | Media | ✅ Aprobado | El gestor puede asignar categorías y tags a los documentos | Los documentos se organizan por categorías |
| RF-050 | Eliminación de documentos (soft delete) | Media | ✅ Aprobado | Los documentos se pueden eliminar lógicamente | El documento no aparece en búsquedas pero se conserva en BD |

### Módulo: Noticias (RF-051 a RF-055)

| ID | Nombre | Prioridad | Estado | Descripción | Criterio de Verificación |
|:--:|--------|:---------:|:------:|-------------|--------------------------|
| RF-051 | Feed de noticias público | Alta | ✅ Aprobado | El sistema muestra un feed paginado de noticias públicas | Las noticias se muestran ordenadas por fecha |
| RF-052 | Detalle de noticia | Alta | ✅ Aprobado | El sistema muestra el contenido completo de una noticia | Se muestra título, contenido, fecha, autor, imagen |
| RF-053 | Búsqueda de noticias | Media | ✅ Aprobado | El sistema permite buscar noticias por texto | Resultados relevantes aparecen en la búsqueda |
| RF-054 | CRUD de noticias (admin) | Alta | ✅ Aprobado | El administrador puede crear, editar y eliminar noticias | Las noticias se publican inmediatamente |
| RF-055 | Categorías de noticias | Media | ✅ Aprobado | Las noticias se organizan en categorías | Se puede filtrar por categoría |

### Módulo: Notificaciones (RF-056 a RF-059)

| ID | Nombre | Prioridad | Estado | Descripción | Criterio de Verificación |
|:--:|--------|:---------:|:------:|-------------|--------------------------|
| RF-056 | Notificación de cambio de estado | Alta | ✅ Aprobado | Se envía email cuando un trámite cambia de estado | El asegurado recibe notificación en < 5 min |
| RF-057 | Notificación push | Media | 📝 En revisión | Se envía notificación push en la app móvil | La notificación aparece en el dispositivo |
| RF-058 | Notificación de bienvenida | Media | ✅ Aprobado | Se envía email de bienvenida después del registro | El nuevo usuario recibe email de confirmación |
| RF-059 | Preferencias de notificación | Baja | 📝 En revisión | El usuario puede configurar qué notificaciones recibe | Las preferencias se guardan y respetan |

### Módulo: Dashboard Admin (RF-060 a RF-066)

| ID | Nombre | Prioridad | Estado | Descripción | Criterio de Verificación |
|:--:|--------|:---------:|:------:|-------------|--------------------------|
| RF-060 | KPIs operacionales | Alta | ✅ Aprobado | El dashboard muestra KPIs: trámites, consultas chatbot, usuarios activos | Los KPIs se actualizan cada 60 segundos |
| RF-061 | Gestión de trámites (admin) | Alta | ✅ Aprobado | El supervisor puede ver y gestionar todos los trámites | Lista completa con filtros |
| RF-062 | Reportes exportables | Media | 📝 En revisión | El sistema permite exportar reportes en PDF, CSV y Excel | Los reportes se descargan con datos correctos |
| RF-063 | Alertas configurables | Media | 📝 En revisión | El supervisor puede configurar umbrales de alerta | Las alertas se disparan según la configuración |
| RF-064 | Gestión de FAQ (admin) | Alta | ✅ Aprobado | El gestor documental administra las FAQ del chatbot | FAQ visibles en el chatbot después de guardar |
| RF-065 | Logs de auditoría | Alta | ✅ Aprobado | El supervisor puede consultar el log de auditoría del sistema | Los eventos se muestran con filtros y detalle |
| RF-066 | Gestión de documentos (admin) | Alta | ✅ Aprobado | El gestor administra los documentos indexados para RAG | Documentos visibles en el catálogo documental |

### Módulo: Auditoría (RF-067 a RF-070)

| ID | Nombre | Prioridad | Estado | Descripción | Criterio de Verificación |
|:--:|--------|:---------:|:------:|-------------|--------------------------|
| RF-067 | Registro de eventos de auditoría | Alta | ✅ Aprobado | El sistema registra todas las acciones críticas en audit_log | Cada acción queda registrada con timestamp y usuario |
| RF-068 | Consulta de auditoría | Alta | ✅ Aprobado | El supervisor puede consultar y filtrar el log de auditoría | Filtros por fecha, usuario, acción, recurso |
| RF-069 | Exportación de auditoría | Media | 📝 En revisión | El supervisor puede exportar logs de auditoría a CSV | CSV descargable con datos filtrados |
| RF-070 | Retención de auditoría | Alta | ✅ Aprobado | Los logs de auditoría se retienen 90 días | Logs mayores a 90 días se archivan automáticamente |

---

## 2. Tabla Resumen por Módulo

| Módulo | Total RFs | Alta | Media | Baja | ✅ Aprobado | 📝 En revisión |
|--------|:---------:|:----:|:-----:|:----:|:-----------:|:--------------:|
| Autenticación | 9 | 8 | 1 | 0 | 9 | 0 |
| Gestión de Usuarios | 5 | 4 | 1 | 0 | 4 | 1 |
| Chatbot | 10 | 7 | 2 | 1 | 8 | 2 |
| RAG | 6 | 5 | 1 | 0 | 4 | 2 |
| Trámites | 12 | 11 | 1 | 0 | 12 | 0 |
| Documentos | 8 | 7 | 1 | 0 | 8 | 0 |
| Noticias | 5 | 3 | 2 | 0 | 5 | 0 |
| Notificaciones | 4 | 1 | 2 | 1 | 2 | 2 |
| Dashboard Admin | 7 | 5 | 2 | 0 | 5 | 2 |
| Auditoría | 4 | 3 | 1 | 0 | 3 | 1 |
| **Total** | **70** | **54** | **14** | **2** | **60** | **10** |

---

## 3. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[02_SPEC_DETALLADO.md]] | Catálogo de funcionalidades |
| [[08_HISTORIAS_USUARIO.md]] | Historias de usuario vinculadas |
| [[25_REQUISITOS_NO_FUNCIONALES.md]] | Restricciones no funcionales |
| [[01_PLAN_DETALLADO.md]] | Plan de implementación por fase |

---

#requisitos #funcionales #rfs #producto #essalud #v1.0
