# 08 — Historias de Usuario

## Convenciones

- **Rol:** Actor que ejecuta la historia.
- **Prioridad:** Alta / Media / Baja.
- **Estimación:** Puntos de historia (escala Fibonacci: 1, 2, 3, 5, 8, 13).
- **Criterios de aceptación:** Condiciones que deben cumplirse para considerar la historia como completada.
- **Formato:** "Como [rol], quiero [acción] para [beneficio/objetivo]".

---

## 1. Registro de Asegurado

**ID:** HU-01  
**Rol:** ASEG  
**Prioridad:** Alta  
**Estimación:** 5 pts  

**Descripción:**  
Como asegurado, quiero registrarme en la plataforma con mi DNI y correo electrónico para poder
iniciar trámites en línea.

**Criterios de aceptación:**
- El formulario debe solicitar: DNI, email, teléfono, nombre completo, contraseña y confirmación.
- El DNI debe validarse con el algoritmo de dígito verificador peruano.
- El email debe ser único en el sistema.
- La contraseña debe tener mínimo 8 caracteres con mayúsculas, minúsculas, números y un símbolo.
- Al registrarse exitosamente, se envía un email de verificación.
- El usuario no puede iniciar sesión hasta verificar su email.
- Se asigna automáticamente el rol ASEG.

---

## 2. Inicio de Sesión

**ID:** HU-02  
**Rol:** ASEG  
**Prioridad:** Alta  
**Estimación:** 3 pts  

**Descripción:**  
Como asegurado, quiero iniciar sesión con mi email y contraseña para acceder a mi cuenta personal.

**Criterios de aceptación:**
- Login con email y contraseña.
- Después de 5 intentos fallidos consecutivos, la cuenta se bloquea por 30 minutos.
- El campo `failed_login_attempts` se incrementa en cada intento fallido.
- Al iniciar sesión exitosamente, `failed_login_attempts` se reinicia a 0 y `locked_until` se limpia.
- Se registra `last_login_at` y `last_login_ip`.
- Si el email no está verificado, se redirige a la pantalla de verificación.
- Opción "Recordarme" con token persistente.

---

## 3. Recuperación de Contraseña

**ID:** HU-03  
**Rol:** ASEG  
**Prioridad:** Alta  
**Estimación:** 2 pts  

**Descripción:**  
Como asegurado, quiero recuperar mi contraseña si la olvido para no perder el acceso a mi cuenta.

**Criterios de aceptación:**
- Formulario solicita el email registrado.
- Se envía un enlace de restablecimiento con expiración de 60 minutos.
- El enlace contiene un token único y seguro.
- Formulario de nueva contraseña con confirmación.
- La nueva contraseña no puede ser igual a las últimas 3 contraseñas utilizadas.
- Se registra `password_changed_at` al actualizar.
- Se notifica al usuario por email que su contraseña fue cambiada.

---

## 4. Crear Trámite de Afiliación

**ID:** HU-04  
**Rol:** ASEG  
**Prioridad:** Alta  
**Estimación:** 8 pts  

**Descripción:**  
Como asegurado, quiero crear un trámite de afiliación para solicitar mi inscripción al seguro.

**Criterios de aceptación:**
- Formulario multi-step (wizard) con 3 pasos: datos personales, tipo de trámite, adjuntar documentos.
- Selección de tipo de trámite desde el catálogo `procedure_types`.
- Los requisitos documentarios se muestran dinámicamente según el tipo seleccionado.
- El trámite se crea en estado BORRADOR.
- Se asigna un `idempotency_key` (UUID v4) para prevenir duplicados.
- El asegurado puede guardar el borrador y continuar después.
- Validación de campos requeridos según el tipo de trámite.
- Al enviar, el estado cambia a PENDIENTE y se registra `submitted_at`.
- Se envía notificación por email confirmando la recepción.

---

## 5. Ver Estado de Mis Trámites

**ID:** HU-05  
**Rol:** ASEG  
**Prioridad:** Alta  
**Estimación:** 3 pts  

**Descripción:**  
Como asegurado, quiero ver el estado actual de todos mis trámites para hacer seguimiento.

**Criterios de aceptación:**
- Lista paginada de trámites del usuario autenticado.
- Columnas: tipo de trámite, estado (con badge de color), fecha de envío, fecha de resolución.
- Filtros: por tipo de trámite, por estado, por rango de fechas.
- Búsqueda por texto libre.
- Cada fila enlaza al detalle del trámite.
- Indicador visual del tiempo transcurrido desde el envío.
- Ordenamiento por fecha de creación (más reciente primero).

---

## 6. Subsanar Trámite con Observaciones

**ID:** HU-06  
**Rol:** ASEG  
**Prioridad:** Alta  
**Estimación:** 5 pts  

**Descripción:**  
Como asegurado, quiero subsanar un trámite que tiene observaciones para cumplir con los requisitos
y que continúe su proceso.

**Criterios de aceptación:**
- El asegurado recibe notificación por email cuando se solicita subsanación.
- En el detalle del trámite se muestra un timeline de subsanaciones.
- Se visualiza: número de intento (1-3), comentario del operador, deadline (15 días), estado.
- Formulario de respuesta con campo de texto y posibilidad de adjuntar nuevos documentos.
- Si el deadline expira, el sistema rechaza el trámite automáticamente.
- Si se agotan los 3 intentos, el trámite se rechaza.
- Contador regresivo visible del tiempo restante.
- Confirmación antes de enviar la respuesta.

---

## 7. Subir Documentos a un Trámite

**ID:** HU-07  
**Rol:** ASEG  
**Prioridad:** Alta  
**Estimación:** 5 pts  

**Descripción:**  
Como asegurado, quiero subir documentos requeridos a mi trámite para cumplir con los requisitos.

**Criterios de aceptación:**
- Zona de arrastre (drag & drop) con Dropzone.js.
- Subida múltiple simultánea con barra de progreso por archivo.
- Tipos permitidos: PDF, JPG, PNG (máximo 10 MB).
- Validación en cliente (tipo y tamaño) antes de subir.
- Validación en servidor (tipo MIME real, tamaño, integridad).
- El documento se asocia automáticamente a la categoría correspondiente.
- Vista previa en miniatura después de subir.
- Posibilidad de eliminar documentos antes de enviar el trámite.
- El OCR se ejecuta en background vía Job y el texto extraído se asocia al documento.

---

## 8. Chatear con el Asistente Virtual

**ID:** HU-08  
**Rol:** ASEG  
**Prioridad:** Media  
**Estimación:** 13 pts  

**Descripción:**  
Como asegurado, quiero chatear con un asistente virtual para resolver mis dudas sobre trámites
y servicios de EsSalud sin esperar atención humana.

**Criterios de aceptación:**
- Interfaz de chat tipo burbujas con diseño responsive.
- El asistente responde en tiempo real (streaming opcional).
- Historial de conversaciones por sesión, accesible desde la barra lateral.
- Si la respuesta tiene baja confianza, se ofrece opción de escalar a operador.
- El usuario puede calificar cada respuesta (útil / no útil) con comentario opcional.
- Se registra latencia de respuesta y confianza para métricas.
- Las sesiones inactivas por más de 30 minutos se cierran automáticamente.
- Soporte para markdown básico en respuestas (negrita, listas, enlaces).
- Título automático de sesión basado en el primer mensaje.

---

## 9. Buscar en Preguntas Frecuentes

**ID:** HU-09  
**Rol:** ASEG  
**Prioridad:** Media  
**Estimación:** 3 pts  

**Descripción:**  
Como asegurado, quiero buscar en las preguntas frecuentes para encontrar respuestas rápidas a
mis dudas comunes.

**Criterios de aceptación:**
- Lista de FAQs organizadas por categorías en acordeón.
- Barra de búsqueda con resultados en tiempo real (debounce 300ms).
- Búsqueda por keywords con fuzzy matching.
- Contadores de vistas, votos útiles y no útiles.
- Botones de feedback (útil / no útil) en cada FAQ.
- Las FAQs más vistas aparecen destacadas al inicio.
- Enlace desde el chatbot a FAQs relacionadas.

---

## 10. Ver Noticias de EsSalud

**ID:** HU-10  
**Rol:** ASEG  
**Prioridad:** Baja  
**Estimación:** 2 pts  

**Descripción:**  
Como asegurado, quiero ver las noticias y comunicados oficiales de EsSalud para estar informado.

**Criterios de aceptación:**
- Listado de noticias con imagen destacada, título, extracto y fecha.
- Orden cronológico inverso (más recientes primero).
- Búsqueda full-text por título y contenido.
- Filtro por categoría de noticia.
- Vista de detalle con contenido completo y fecha de publicación.
- Paginación infinita o botón "Cargar más".
- Las noticias con `published_at` futuro no se muestran.

---

## 11. Ver Trámites Asignados

**ID:** HU-11  
**Rol:** OPER  
**Prioridad:** Alta  
**Estimación:** 3 pts  

**Descripción:**  
Como operador, quiero ver la lista de trámites que tengo asignados para gestionar mi carga de trabajo.

**Criterios de aceptación:**
- Bandeja de trámites asignados al operador autenticado.
- Columnas: ID, tipo, asegurado, estado, fecha de envío, tiempo en espera.
- Filtros: por estado, tipo, fecha.
- Ordenamiento por fecha de envío y por prioridad (tiempo de espera).
- Indicador visual de trámites próximos a vencer (max_days_resolution del tipo).
- Contador de trámites pendientes en el header de navegación.

---

## 12. Aprobar o Rechazar un Trámite

**ID:** HU-12  
**Rol:** OPER  
**Prioridad:** Alta  
**Estimación:** 5 pts  

**Descripción:**  
Como operador, quiero aprobar o rechazar un trámite después de revisarlo para resolver la
solicitud del asegurado.

**Criterios de aceptación:**
- Botones de acción visibles solo si el trámite está en estado válido (PENDIENTE, EN_REVISION, SUBSANACION).
- Modal de confirmación con campo de comentario obligatorio.
- Al aprobar, el estado cambia a APROBADO y se registra `completed_at`.
- Al rechazar, el estado cambia a RECHAZADO y se requiere motivo.
- Se registra en el historial de estados (procedure_histories) con el operador y comentario.
- Se notifica al asegurado por email con el resultado.
- Validación de que el trámite está asignado al operador actual (solo rol OPER).

---

## 13. Solicitar Subsanación

**ID:** HU-13  
**Rol:** OPER  
**Prioridad:** Alta  
**Estimación:** 5 pts  

**Descripción:**  
Como operador, quiero solicitar subsanación de un trámite cuando falta información o documentos,
para que el asegurado pueda completarlo.

**Criterios de aceptación:**
- Opción disponible solo en estados PENDIENTE o EN_REVISION.
- Validar que no se hayan agotado los 3 intentos de subsanación.
- Formulario con campo de comentario (observaciones detalladas) obligatorio.
- Se crea registro en tabla `subsanaciones` con: attempt_number, requested_by, requested_comment, deadline (+15 días).
- El estado del trámite cambia a SUBSANACION.
- Se notifica al asegurado por email con el detalle y la fecha límite.
- El timeline del trámite muestra el evento de subsanación.

---

## 14. Ver Dashboard con KPIs

**ID:** HU-14  
**Rol:** SUPV  
**Prioridad:** Alta  
**Estimación:** 8 pts  

**Descripción:**  
Como supervisor, quiero ver un dashboard con indicadores clave de desempeño para monitorear la
operación y tomar decisiones.

**Criterios de aceptación:**
- Tarjetas KPI: trámites pendientes, tiempo promedio de resolución, tasa de aprobación, usuarios activos.
- Gráfico de barras: trámites por estado (Chart.js).
- Gráfico de líneas: trámites creados vs resueltos por mes (últimos 12 meses).
- Tabla de operadores con carga de trabajo (asignados, completados).
- Tiempo promedio de respuesta del chatbot por día.
- FAQs más consultadas (top 10).
- Filtro por rango de fechas aplicable a todo el dashboard.
- Datos actualizados en tiempo real vía Livewire polling (cada 60 segundos).

---

## 15. Asignar Trámites a Operadores

**ID:** HU-15  
**Rol:** SUPV  
**Prioridad:** Media  
**Estimación:** 5 pts  

**Descripción:**  
Como supervisor, quiero asignar trámites pendientes a operadores para distribuir la carga de
trabajo equitativamente.

**Criterios de aceptación:**
- Vista de trámites no asignados (current_assignee_id IS NULL) en estado PENDIENTE.
- Opción de asignación manual: seleccionar operador de una lista desplegable.
- Opción de asignación automática: round-robin entre operadores activos.
- Asignación masiva: seleccionar múltiples trámites y asignar a un operador.
- Validación de que el usuario destino tiene rol OPER y está activo.
- Notificación al operador cuando recibe nuevas asignaciones.

---

## 16. Exportar Reportes

**ID:** HU-16  
**Rol:** SUPV  
**Prioridad:** Media  
**Estimación:** 5 pts  

**Descripción:**  
Como supervisor, quiero exportar reportes en PDF y Excel para presentar informes de gestión.

**Criterios de aceptación:**
- Reporte de trámites: filtros por fecha, tipo, estado, operador.
- Exportación en PDF (DomPDF) con gráficos embebidos.
- Exportación en Excel (PhpSpreadsheet) con datos tabulares.
- Descarga directa o envío por email para reportes muy grandes (procesamiento asíncrono).
- Formato profesional con logo de EsSalud, fecha de generación, filtros aplicados.
- Barra de progreso si el reporte se genera en background.

---

## 17. Gestionar FAQs y Noticias

**ID:** HU-17  
**Rol:** GESDOC  
**Prioridad:** Alta  
**Estimación:** 5 pts  

**Descripción:**  
Como gestor documental, quiero crear, editar y eliminar FAQs y noticias para mantener el
contenido informativo actualizado.

**Criterios de aceptación:**
- CRUD completo de FAQs: crear con categoría, pregunta, respuesta (editor HTML), keywords (tags), fuente.
- CRUD completo de noticias: crear con título, contenido (editor HTML), extracto, imagen, categoría, fecha de publicación.
- Editor enriquecido Trix para contenido HTML.
- Subida de imagen destacada con redimensionamiento automático.
- Previsualización antes de publicar.
- Activar/desactivar sin eliminar.
- Búsqueda y filtros en el panel de administración.
- Las FAQs se vinculan automáticamente al sistema de matching del chatbot.

---

## 18. Subir Documentos Oficiales al RAG

**ID:** HU-18  
**Rol:** GESDOC  
**Prioridad:** Media  
**Estimación:** 8 pts  

**Descripción:**  
Como gestor documental, quiero subir documentos oficiales (normativas, manuales, guías) para que
el chatbot pueda usarlos como fuente de conocimiento (RAG).

**Criterios de aceptación:**
- Interfaz de carga de documentos con categoría y título.
- El documento se procesa: extracción de texto (OCR si es necesario), división en chunks,
  generación de embeddings, sincronización con Qdrant.
- Barra de progreso del proceso de indexación.
- Lista de fuentes RAG con estado (activo, indexando, error).
- Posibilidad de reindexar o desactivar una fuente.
- Cada fuente muestra: título, categoría, cantidad de chunks, última indexación.
- Los chunks se almacenan en `document_embeddings` con su punto Qdrant asociado.

---

## 19. Gestionar Usuarios y Roles

**ID:** HU-19  
**Rol:** SADM  
**Prioridad:** Alta  
**Estimación:** 5 pts  

**Descripción:**  
Como super administrador, quiero gestionar todos los usuarios y sus roles para mantener el
control de acceso al sistema.

**Criterios de aceptación:**
- Lista de todos los usuarios con búsqueda y filtros (rol, estado, fecha de registro).
- Ver detalle de usuario: datos personales, rol actual, permisos, actividad reciente.
- Cambiar rol a cualquier usuario (ASEG, OPER, SUPV, GESDOC, SADM).
- Activar/desactivar cuenta (is_active).
- Desbloquear manualmente cuentas bloqueadas por intentos fallidos.
- No se puede eliminar usuarios; solo desactivar.
- Registro de auditoría de cada cambio de rol o estado.

---

## 20. Ver Auditoría del Sistema

**ID:** HU-20  
**Rol:** SADM  
**Prioridad:** Media  
**Estimación:** 3 pts  

**Descripción:**  
Como super administrador, quiero ver el registro de auditoría de todas las acciones en el sistema
para garantizar la trazabilidad.

**Criterios de aceptación:**
- Tabla paginada de logs de auditoría.
- Columnas: fecha/hora, usuario, acción, modelo afectado, IP.
- Filtros: por usuario, acción, modelo, rango de fechas.
- Vista de detalle: valores anteriores vs nuevos en formato diff.
- Exportación de logs filtrados en CSV/Excel.
- Los logs de más de 1 año se purgan automáticamente (job programado).
- Solo accesible por rol SUPV o SADM.

---

## Resumen de Historias

| ID | Historia | Rol | Prioridad | Estimación |
|----|----------|-----|:---------:|:----------:|
| HU-01 | Registro de Asegurado | ASEG | Alta | 5 |
| HU-02 | Inicio de Sesión | ASEG | Alta | 3 |
| HU-03 | Recuperación de Contraseña | ASEG | Alta | 2 |
| HU-04 | Crear Trámite de Afiliación | ASEG | Alta | 8 |
| HU-05 | Ver Estado de Mis Trámites | ASEG | Alta | 3 |
| HU-06 | Subsanar Trámite con Observaciones | ASEG | Alta | 5 |
| HU-07 | Subir Documentos a un Trámite | ASEG | Alta | 5 |
| HU-08 | Chatear con el Asistente Virtual | ASEG | Media | 13 |
| HU-09 | Buscar en Preguntas Frecuentes | ASEG | Media | 3 |
| HU-10 | Ver Noticias de EsSalud | ASEG | Baja | 2 |
| HU-11 | Ver Trámites Asignados | OPER | Alta | 3 |
| HU-12 | Aprobar o Rechazar un Trámite | OPER | Alta | 5 |
| HU-13 | Solicitar Subsanación | OPER | Alta | 5 |
| HU-14 | Ver Dashboard con KPIs | SUPV | Alta | 8 |
| HU-15 | Asignar Trámites a Operadores | SUPV | Media | 5 |
| HU-16 | Exportar Reportes | SUPV | Media | 5 |
| HU-17 | Gestionar FAQs y Noticias | GESDOC | Alta | 5 |
| HU-18 | Subir Documentos Oficiales al RAG | GESDOC | Media | 8 |
| HU-19 | Gestionar Usuarios y Roles | SADM | Alta | 5 |
| HU-20 | Ver Auditoría del Sistema | SADM | Media | 3 |

**Total estimado:** 101 puntos de historia

---

## Planificación sugerida (Sprints)

### Sprint 1 — Fundamentos (HU-01, HU-02, HU-03)
- Registro, login, recuperación de contraseña.
- **Estimación:** 10 pts

### Sprint 2 — Trámites Core (HU-04, HU-05, HU-06, HU-07)
- Creación de trámites, visualización de estado, subsanación, subida de documentos.
- **Estimación:** 23 pts

### Sprint 3 — Operaciones (HU-11, HU-12, HU-13)
- Bandeja del operador, aprobación/rechazo, solicitud de subsanación.
- **Estimación:** 13 pts

### Sprint 4 — Contenido y Chatbot (HU-08, HU-09, HU-10, HU-17)
- Chatbot con RAG, FAQ, noticias, gestión de contenido.
- **Estimación:** 23 pts

### Sprint 5 — Supervisión y RAG (HU-14, HU-15, HU-16, HU-18)
- Dashboard KPIs, asignación, reportes, carga de documentos RAG.
- **Estimación:** 26 pts

### Sprint 6 — Administración (HU-19, HU-20)
- Gestión de usuarios y roles, auditoría.
- **Estimación:** 8 pts
