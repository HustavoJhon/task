# 24. Requisitos Funcionales — EsSalud (Laravel)

> **Versión:** 1.0 — Laravel 11 + Livewire 3 + Blade + MySQL 8  
> **Última actualización:** 2026-06-21  

---

## 24.1 Convenciones

Cada requisito funcional (RF) se estructura de la siguiente manera:

- **ID:** identificador único del requisito
- **Descripción:** qué debe hacer el sistema
- **Prioridad:** Alta / Media / Baja
- **Módulo:** módulo o submódulo del sistema al que pertenece
- **Criterios de aceptación:** condiciones que deben cumplirse para considerar el requisito como completado

---

## 24.2 Listado de Requisitos Funcionales

---

### RF-01 — Registro de Asegurado

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-01                                                                   |
| **Descripción**      | Permitir a un ciudadano peruano registrarse como asegurado proporcionando: DNI (8 dígitos), nombres, apellidos, email, teléfono celular (9 dígitos), contraseña segura y aceptación de términos y condiciones. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Autenticación                                                           |
| **Criterios de aceptación** | 1. El formulario valida DNI con formato 00000000 (8 dígitos numéricos). 2. Email válido y único en el sistema. 3. Teléfono con formato 9XXXXXXXX. 4. Contraseña mínimo 8 caracteres, 1 mayúscula, 1 número, 1 símbolo. 5. Rate limiting: máximo 3 registros por hora por IP. 6. El usuario recibe email de verificación de cuenta. 7. Los términos y condiciones son aceptados explícitamente (checkbox). |

---

### RF-02 — Inicio de Sesión

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-02                                                                   |
| **Descripción**      | Permitir a un usuario registrado iniciar sesión con email y contraseña. Tras 5 intentos fallidos, bloquear la cuenta por 30 minutos. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Autenticación                                                           |
| **Criterios de aceptación** | 1. Login exitoso redirige al dashboard del asegurado. 2. Sesión expira tras 120 minutos de inactividad. 3. Mensaje de error genérico: "Credenciales inválidas" (no revela si email existe). 4. 5to intento fallido → bloqueo 30 min con mensaje informativo. 5. Cookie de sesión httpOnly, Secure en producción, SameSite=Lax. |

---

### RF-03 — Recuperación de Contraseña

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-03                                                                   |
| **Descripción**      | Permitir al usuario recuperar su contraseña mediante un enlace enviado a su correo electrónico registrado. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Autenticación                                                           |
| **Criterios de aceptación** | 1. Usuario ingresa email → recibe enlace de recuperación. 2. Enlace válido por 60 minutos. 3. Token único por solicitud; solicitudes previas se invalidan. 4. Nueva contraseña debe cumplir reglas de RF-01. 5. No se revela si el email existe en el sistema. |

---

### RF-04 — Verificación de Email

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-04                                                                   |
| **Descripción**      | Verificar la dirección de email del usuario mediante un enlace enviado durante el registro. El acceso a funcionalidades está limitado hasta que el email sea verificado. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Autenticación                                                           |
| **Criterios de aceptación** | 1. Email de verificación enviado automáticamente tras registro. 2. Enlace válido por 24 horas. 3. Al verificar, se marca `email_verified_at` en BD. 4. Middleware `verified` protege rutas que requieren email verificado. 5. Usuario puede reenviar email de verificación (máx 3 veces por hora). |

---

### RF-05 — CRUD de Trámites con Máquina de Estados

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-05                                                                   |
| **Descripción**      | Sistema completo de gestión de trámites con los siguientes estados y transiciones: **Borrador** → **Pendiente** → **En Revisión** → **Aprobado** / **Rechazado** / **Subsanación**. Un trámite en Subsanación puede volver a Pendiente tras corrección (máx 3 intentos, 15 días). |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Trámites                                                                |
| **Criterios de aceptación** | 1. El asegurado puede crear un trámite en estado Borrador. 2. Desde Borrador, puede enviar a Pendiente (cambio irreversible). 3. Un operador puede tomar un trámite Pendiente → En Revisión. 4. En Revisión, el operador puede: Aprobar, Rechazar (con motivo), Solicitar Subsanación (con observaciones). 5. El asegurado puede subsanar y reenviar (máx 3 subsanaciones). 6. Timeline visual muestra todas las transiciones con fechas y responsables. 7. Trámites en Borrador > 30 días se auto-cancelan (tarea programada). 8. Validación de permisos: un asegurado solo ve sus trámites; operador/supervisor ven todos. |

---

### RF-06 — Subsanación de Trámites

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-06                                                                   |
| **Descripción**      | Cuando un trámite es observado, el asegurado puede corregir la información o documentos solicitados y reenviarlo dentro de un plazo de 15 días calendario. Máximo 3 intentos de subsanación por trámite. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Trámites                                                                |
| **Criterios de aceptación** | 1. El asegurado recibe notificación con las observaciones del operador. 2. Puede editar campos observados y/o subir nuevos documentos. 3. El contador de subsanaciones se incrementa con cada reenvío. 4. Al llegar al 3er intento y ser rechazado nuevamente, el trámite pasa a estado Rechazado definitivo. 5. Si pasan 15 días sin subsanar, el trámite se cancela automáticamente. 6. El operador ve el historial completo de subsanaciones. |

---

### RF-07 — Asignación de Trámites a Operadores

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-07                                                                   |
| **Descripción**      | Un usuario con rol supervisor puede asignar trámites en estado Pendiente a operadores específicos para su revisión. Los operadores ven en su bandeja los trámites asignados a ellos. |
| **Prioridad**        | Media                                                                   |
| **Módulo**           | Trámites                                                                |
| **Criterios de aceptación** | 1. Panel de supervisor muestra trámites pendientes sin asignar. 2. Dropdown para seleccionar operador (solo usuarios con rol `operador`). 3. Asignación registrada en auditoría. 4. Operador ve solo sus trámites asignados + los no asignados que puede tomar. 5. Sistema balancea carga: muestra conteo de trámites por operador. |

---

### RF-08 — Subida de Documentos

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-08                                                                   |
| **Descripción**      | El asegurado puede adjuntar documentos a sus trámites. Formatos permitidos: PDF, JPG, PNG. Tamaño máximo: 10 MB por archivo. Múltiples archivos por trámite. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Documentos                                                              |
| **Criterios de aceptación** | 1. Validación MIME real (no extensión) con `finfo`. 2. Archivos almacenados fuera de `public/`, servidos vía controlador con autorización. 3. Nombres de archivo aleatorios (UUID) para evitar colisiones y enumeration. 4. Vista previa inline de PDF e imágenes en el navegador. 5. Máximo 5 archivos simultáneos por carga. 6. Barra de progreso de subida (Livewire + JavaScript). |

---

### RF-09 — OCR de Documentos

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-09                                                                   |
| **Descripción**      | El sistema procesa automáticamente documentos escaneados (PDF, JPG, PNG) mediante Tesseract OCR para extraer texto en español que facilite el pre-llenado de formularios de trámite. |
| **Prioridad**        | Media                                                                   |
| **Módulo**           | OCR                                                                     |
| **Criterios de aceptación** | 1. OCR se ejecuta asíncronamente vía job en cola `ocr`. 2. Texto extraído se asocia al documento en BD. 3. Campos reconocidos (DNI, nombres, fechas) se pre-llenan en el formulario como sugerencia. 4. Si la confianza del OCR es < 70%, los campos se marcan con advertencia "Verificar manualmente". 5. Documentos < 500x700px se rechazan para OCR (se pide re-upload con mejor calidad). 6. Tiempo de procesamiento < 30 segundos por página. |

---

### RF-10 — Validación de Documentos por GESDOC

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-10                                                                   |
| **Descripción**      | Los operadores revisan y validan manualmente los documentos subidos según los criterios de GESDOC (gestión documentaria). Pueden marcar documentos como Válido, Inválido o Requiere Reemplazo. |
| **Prioridad**        | Media                                                                   |
| **Módulo**           | Documentos                                                              |
| **Criterios de aceptación** | 1. Operador ve lista de documentos del trámite con vista previa. 2. Puede marcar estado de validación: Válido / Inválido / Requiere Reemplazo. 3. Si Requiere Reemplazo, se notifica al asegurado con el motivo. 4. El estado de cada documento se refleja en el timeline del trámite. 5. Un trámite no puede ser aprobado si tiene documentos Inválidos o Requiere Reemplazo. |

---

### RF-11 — Chatbot con FAQ (Keyword Matching)

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-11                                                                   |
| **Descripción**      | Chatbot que responde preguntas frecuentes mediante búsqueda por palabras clave en la base de datos de FAQs. Si encuentra coincidencias con score > 0.5, devuelve la mejor respuesta. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Chatbot                                                                 |
| **Criterios de aceptación** | 1. Usuario escribe pregunta en lenguaje natural. 2. Sistema tokeniza la pregunta y busca coincidencias en `faqs`. 3. Si score > 0.5, muestra la respuesta de la FAQ. 4. Si hay múltiples coincidencias, muestra top 3 como sugerencias. 5. Respuesta incluye botones "Útil" / "No útil" para feedback. 6. Tiempo de respuesta < 1 segundo. |

---

### RF-12 — Chatbot con RAG (Qdrant + OpenAI)

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-12                                                                   |
| **Descripción**      | Chatbot avanzado que utiliza Retrieval Augmented Generation (RAG): recupera documentos relevantes de Qdrant y genera una respuesta contextualizada usando GPT-4o de OpenAI. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Chatbot / IA                                                            |
| **Criterios de aceptación** | 1. Pregunta del usuario se convierte en embedding con `text-embedding-3-small`. 2. Qdrant devuelve top 5 documentos más similares (cosine similarity). 3. Contexto + pregunta se envían a GPT-4o con prompt system predefinido. 4. Respuesta generada incluye referencias a los documentos fuente (numeradas). 5. Si Qdrant u OpenAI fallan, hay fallback automático a FAQ keyword matching. 6. Tiempo de respuesta < 5 segundos. |

---

### RF-13 — Escalación de Chat a Operador

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-13                                                                   |
| **Descripción**      | Si el chatbot no puede resolver la consulta del asegurado (modo `no_result` o feedback negativo reiterado), se ofrece la opción de escalar a un operador humano. Se crea un ticket de consulta. |
| **Prioridad**        | Media                                                                   |
| **Módulo**           | Chatbot                                                                 |
| **Criterios de aceptación** | 1. Botón "Hablar con un operador" visible cuando el chatbot responde `no_result`. 2. Al escalar, se crea un `SupportTicket` con el historial del chat. 3. El ticket se asigna automáticamente a un operador disponible. 4. El operador ve la conversación previa y puede responder. 5. El asegurado recibe notificación cuando el operador responde. |

---

### RF-14 — Feedback de Respuestas del Chatbot

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-14                                                                   |
| **Descripción**      | Cada respuesta del chatbot incluye botones de "Útil" y "No útil". El feedback se registra para mejorar la calidad del chatbot y entrenar futuros modelos. |
| **Prioridad**        | Baja                                                                    |
| **Módulo**           | Chatbot                                                                 |
| **Criterios de aceptación** | 1. Botones "Útil" (👍) y "No útil" (👎) visibles tras cada respuesta. 2. Al hacer clic, se registra en BD: pregunta, respuesta, tipo, timestamp. 3. Métricas de feedback visibles en dashboard admin (tasa de utilidad). 4. Si un usuario marca "No útil", se pregunta opcionalmente el motivo (texto libre). 5. Feedback "No útil" recurrente sobre una misma FAQ genera alerta para revisión de contenido. |

---

### RF-15 — CRUD de FAQs con Categorías

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-15                                                                   |
| **Descripción**      | Administradores y operadores pueden gestionar el catálogo de preguntas frecuentes (FAQ), organizadas por categorías (afiliación, trámites, prestaciones, etc.). |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Contenido                                                               |
| **Criterios de aceptación** | 1. CRUD completo en panel Filament (/admin). 2. Cada FAQ pertenece a una categoría (categorías también gestionables). 3. Campos: pregunta, respuesta, categoría, estado (activo/inactivo), orden. 4. Respuesta soporta formato enriquecido (negrita, listas, enlaces). 5. FAQs públicas se muestran en portal del asegurado agrupadas por categoría. 6. Búsqueda con MySQL FULLTEXT por pregunta y respuesta. |

---

### RF-16 — CRUD de Noticias con Categorías

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-16                                                                   |
| **Descripción**      | Gestión de noticias institucionales con categorías. Las noticias se publican en el portal del asegurado para mantenerlo informado. |
| **Prioridad**        | Media                                                                   |
| **Módulo**           | Contenido                                                               |
| **Criterios de aceptación** | 1. CRUD completo en panel Filament. 2. Campos: título, slug, extracto, contenido, imagen destacada, categoría, fecha de publicación, estado (borrador/publicado). 3. Imagen destacada con redimensionamiento automático (thumbnails). 4. Listado público paginado con orden cronológico inverso. 5. Búsqueda full-text por título y contenido. 6. Slug generado automáticamente desde el título (único). |

---

### RF-17 — Dashboard Admin con KPIs

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-17                                                                   |
| **Descripción**      | Dashboard administrativo con indicadores clave de rendimiento: trámites creados, aprobados, rechazados, pendientes; usuarios activos; uso del chatbot; documentos procesados. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Administración                                                          |
| **Criterios de aceptación** | 1. Dashboard visible para roles supervisor y sadm. 2. KPIs en tiempo real (o con refresh ≤ 5 min). 3. Widgets: contadores numéricos, gráficos de barras, líneas de tendencia, torta. 4. Filtro por rango de fechas. 5. KPIs mínimos: trámites totales, tasa de aprobación, tiempo promedio de resolución, usuarios nuevos, mensajes chatbot, satisfacción chatbot. |

---

### RF-18 — Reportes Exportables

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-18                                                                   |
| **Descripción**      | Generación y exportación de reportes en formatos PDF y Excel (XLSX). Reportes predefinidos: trámites por período, productividad de operadores, uso del chatbot, auditoría. |
| **Prioridad**        | Media                                                                   |
| **Módulo**           | Administración                                                          |
| **Criterios de aceptación** | 1. Botón "Exportar" en cada sección de reportes. 2. Formatos: PDF (con logo institucional) y Excel (datos tabulares). 3. Reportes generados asíncronamente para grandes volúmenes y notificados por email al completar. 4. Filtros aplicables antes de exportar: fechas, tipo de trámite, estado, operador. 5. PDF incluye gráficos resumen si aplica. |

---

### RF-19 — Auditoría de Acciones del Sistema

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-19                                                                   |
| **Descripción**      | Registro automático de todas las acciones significativas del sistema: creación, actualización y eliminación de registros, con trazabilidad de usuario, timestamp, IP y valores anteriores/nuevos. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Auditoría                                                               |
| **Criterios de aceptación** | 1. Todos los modelos principales auditados. 2. Panel de auditoría en Filament accesible solo para SADM. 3. Filtros: fecha, usuario, modelo, acción. 4. Vista detallada con diff de old_values vs new_values. 5. Exportación de registros de auditoría (CSV, Excel). 6. Registros de auditoría inmutables (no se pueden editar ni eliminar). |

---

### RF-20 — Gestión de Usuarios y Roles (SADM)

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-20                                                                   |
| **Descripción**      | El Super Administrador (SADM) puede gestionar todos los usuarios del sistema: crear, editar, desactivar, asignar roles y permisos. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Administración                                                          |
| **Criterios de aceptación** | 1. Listado de usuarios con búsqueda y filtros (rol, estado, fecha registro). 2. Creación manual de usuarios por SADM (operadores, supervisores). 3. Asignación y cambio de roles. 4. Desactivación de usuarios (soft delete o flag `active=false`). 5. Restablecimiento de contraseña forzado por admin. 6. Historial de cambios de rol registrado en auditoría. |

---

### RF-21 — Indexación de Documentos Oficiales en Qdrant

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-21                                                                   |
| **Descripción**      | Proceso batch que indexa documentos oficiales de EsSalud (PDFs de normativas, guías, resoluciones) en Qdrant como vectores de embedding para ser utilizados por el chatbot RAG. |
| **Prioridad**        | Media                                                                   |
| **Módulo**           | IA / RAG                                                                |
| **Criterios de aceptación** | 1. Comando artisan: `php artisan documents:index --type=normativa`. 2. Documentos PDF se dividen en chunks de ~500 tokens con overlap de 50 tokens. 3. Cada chunk se convierte en embedding con OpenAI y se almacena en Qdrant. 4. Progreso mostrado en consola con barra de progreso. 5. Indexación incremental: solo procesa documentos nuevos o modificados. 6. Metadatos de cada chunk: source_file, page_number, chunk_index, title. |

---

### RF-22 — Auto-cancelación de Trámites Borrador Antiguos

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-22                                                                   |
| **Descripción**      | Trámites que permanecen en estado Borrador por más de 30 días son cancelados automáticamente mediante una tarea programada diaria. |
| **Prioridad**        | Baja                                                                    |
| **Módulo**           | Trámites                                                                |
| **Criterios de aceptación** | 1. Tarea programada (`php artisan procedures:cancel-stale-drafts`) corre diariamente a las 03:00 UTC. 2. Cancela trámites en Borrador con `created_at > 30 días`. 3. El cambio de estado se registra en auditoría con `user_id = null` (acción del sistema). 4. Se envía notificación al asegurado informando la cancelación. 5. Log de la ejecución (cuántos cancelados) en `storage/logs/laravel.log`. |

---

### RF-23 — Notificaciones por Cambio de Estado de Trámite

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-23                                                                   |
| **Descripción**      | El sistema notifica al asegurado cada vez que su trámite cambia de estado. Las notificaciones se envían por email y se almacenan como notificaciones in-app visibles en el portal. |
| **Prioridad**        | Alta                                                                    |
| **Módulo**           | Notificaciones                                                          |
| **Criterios de aceptación** | 1. Eventos de Eloquent disparan notificaciones (ProcedureStatusChanged). 2. Notificación por email con resumen del cambio y enlace al trámite. 3. Notificación in-app mostrada en campanita (bell icon) con contador de no leídas. 4. Listado de notificaciones con filtro: todas / no leídas. 5. Marcar como leída individualmente o todas. 6. Respetar preferencias de notificación del usuario (no email si desactivado). |

---

### RF-24 — Búsqueda Full-Text en FAQ y Noticias

| Campo                | Valor                                                                   |
|----------------------|-------------------------------------------------------------------------|
| **ID**               | RF-24                                                                   |
| **Descripción**      | Motor de búsqueda full-text sobre el contenido de FAQs y Noticias para que los asegurados encuentren rápidamente información relevante. |
| **Prioridad**        | Media                                                                   |
| **Módulo**           | Contenido                                                               |
| **Criterios de aceptación** | 1. Campo de búsqueda unificado en el portal ("Buscar en FAQ y Noticias"). 2. Resultados agrupados por tipo (FAQ / Noticia) con snippet resaltado. 3. Búsqueda usa MySQL FULLTEXT con modo BOOLEAN para operadores (+requerido, -excluido). 4. Paginación de resultados (15 por página). 5. Búsqueda insensible a acentos (ñ → n, á → a) usando collation adecuada o normalización. |

---

## 24.3 Resumen de Prioridades

| Prioridad | Cantidad | RFs                                                             |
|-----------|----------|-----------------------------------------------------------------|
| **Alta**  | 13       | 01, 02, 03, 04, 05, 06, 08, 11, 12, 15, 17, 19, 20, 23        |
| **Media** | 8        | 07, 09, 10, 13, 16, 18, 21, 24                                 |
| **Baja**  | 2        | 14, 22                                                          |

---

## 24.4 Trazabilidad con Módulos

| Módulo           | RFs asociados                                        |
|------------------|------------------------------------------------------|
| Autenticación    | RF-01, RF-02, RF-03, RF-04                           |
| Trámites         | RF-05, RF-06, RF-07, RF-22, RF-23                    |
| Documentos       | RF-08, RF-09, RF-10                                  |
| Chatbot / IA     | RF-11, RF-12, RF-13, RF-14, RF-21                     |
| Contenido        | RF-15, RF-16, RF-24                                  |
| Administración   | RF-17, RF-18, RF-19, RF-20                            |

---

## 24.5 Referencias

- IEEE 830 — Especificación de Requisitos de Software
- [Historias de Usuario Ágiles (Mike Cohn)](https://www.mountaingoatsoftware.com/agile/user-stories)
