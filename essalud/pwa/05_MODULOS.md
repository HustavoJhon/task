# 05 — Módulos del Sistema (Laravel 11)

## Visión General

La aplicación EsSalud es una aplicación **monolítica** construida sobre Laravel 11 con las siguientes
tecnologías en el frontend: Blade, Livewire, Alpine.js, Dropzone.js y Tailwind CSS. El backend está
organizado en módulos independientes dentro de `app/Modules/`, cada uno con sus propias rutas,
controladores, modelos, vistas, componentes Livewire, jobs, notificaciones y reglas de validación.

---

## 1. Módulo Auth

### Descripción
Maneja todo lo relacionado con autenticación, autorización y verificación de identidad del
usuario. Utiliza **Laravel Sanctum** para autenticación por tokens (SPA + API interna) y
**Spatie/laravel-permission** para roles y permisos.

### Rutas
| Método | URI | Nombre | Descripción |
|--------|-----|--------|-------------|
| GET | `/registro` | `register` | Formulario de registro |
| POST | `/registro` | `register.store` | Procesar registro nuevo |
| GET | `/login` | `login` | Formulario de inicio de sesión |
| POST | `/login` | `login.attempt` | Autenticar credenciales |
| POST | `/logout` | `logout` | Cerrar sesión |
| POST | `/api/token/refresh` | `token.refresh` | Refrescar token Sanctum |
| GET | `/recuperar-password` | `password.request` | Solicitar enlace de recuperación |
| POST | `/recuperar-password` | `password.email` | Enviar enlace por email |
| GET | `/reset-password/{token}` | `password.reset` | Formulario de nueva contraseña |
| POST | `/reset-password` | `password.update` | Actualizar contraseña |
| GET | `/email/verify` | `verification.notice` | Aviso de verificación pendiente |
| GET | `/email/verify/{id}/{hash}` | `verification.verify` | Verificar email |
| POST | `/email/verification-notification` | `verification.send` | Reenviar verificación |

### Controladores
- `App\Http\Controllers\Auth\RegisterController` — Registro con validación de DNI único.
- `App\Http\Controllers\Auth\LoginController` — Login con rate limiting (5 intentos fallidos = bloqueo 30 min).
- `App\Http\Controllers\Auth\LogoutController` — Revoca token Sanctum actual.
- `App\Http\Controllers\Auth\ForgotPasswordController` — Envía enlace de restablecimiento.
- `App\Http\Controllers\Auth\ResetPasswordController` — Procesa nueva contraseña.
- `App\Http\Controllers\Auth\VerifyEmailController` — Marca email como verificado.
- `App\Http\Controllers\Auth\TokenController` — Refresca token de acceso personal.

### Modelos
- `App\Models\User` — Implementa `HasApiTokens`, `HasRoles`, `MustVerifyEmail`.
- `App\Models\Session` — Mapeado a `personal_access_tokens` de Sanctum.

### Vistas (Blade)
- `resources/views/auth/register.blade.php`
- `resources/views/auth/login.blade.php`
- `resources/views/auth/forgot-password.blade.php`
- `resources/views/auth/reset-password.blade.php`
- `resources/views/auth/verify-email.blade.php`

### Reglas de validación personalizadas
- `App\Rules\DniValido` — Valida formato y dígito verificador de DNI peruano.
- `App\Rules\PasswordSeguro` — Mínimo 8 caracteres, mayúsculas, minúsculas, números, símbolo.

### Eventos y Listeners
- `Illuminate\Auth\Events\Registered` → `App\Listeners\SendEmailVerificationNotification`
- `Illuminate\Auth\Events\Login` → `App\Listeners\LogSuccessfulLogin`
- `Illuminate\Auth\Events\Failed` → `App\Listeners\LogFailedLogin`
- `Illuminate\Auth\Events\PasswordReset` → `App\Listeners\SendPasswordChangedNotification`

### Permisos asociados
- `auth.register`, `auth.login`, `auth.logout`, `auth.password.reset`, `auth.email.verify`

---

## 2. Módulo Trámites

### Descripción
El módulo central de la plataforma. Gestiona el ciclo de vida completo de los trámites
administrativos desde su creación como borrador hasta su resolución final. Implementa una
máquina de estados con transiciones controladas por Laravel Policies.

### Estados del trámite
| Código | Nombre | Terminal | Descripción |
|--------|--------|----------|-------------|
| `BORRADOR` | Borrador | No | Trámite en creación, no ha sido enviado |
| `PENDIENTE` | Pendiente | No | Trámite enviado, esperando asignación/revisión |
| `EN_REVISION` | En Revisión | No | Un operador está revisando activamente el trámite |
| `SUBSANACION` | Subsanación | No | Se requieren correcciones del asegurado |
| `APROBADO` | Aprobado | Sí | Trámite resuelto favorablemente |
| `RECHAZADO` | Rechazado | Sí | Trámite denegado |
| `CANCELADO` | Cancelado | Sí | Trámite cancelado por el asegurado o el sistema |

### Transiciones de estado
```
BORRADOR ──► PENDIENTE      (Asegurado envía el trámite)
BORRADOR ──► CANCELADO      (Asegurado cancela su borrador)
PENDIENTE ─► EN_REVISION    (Operador toma el trámite)
PENDIENTE ─► CANCELADO      (Asegurado cancela antes de revisión)
EN_REVISION ─► APROBADO     (Operador aprueba)
EN_REVISION ─► RECHAZADO    (Operador rechaza)
EN_REVISION ─► SUBSANACION  (Operador solicita correcciones)
SUBSANACION ─► PENDIENTE    (Asegurado responde subsanación)
SUBSANACION ─► RECHAZADO    (Se agotaron intentos o venció deadline)
SUBSANACION ─► CANCELADO    (Asegurado desiste)
```

### Subsanaciones
- Máximo **3 intentos** por trámite.
- Deadline de **15 días calendario** desde la solicitud.
- Si se vence el plazo o se agotan intentos: trámite pasa a `RECHAZADO` automáticamente
  mediante un `Laravel Scheduler` que corre cada hora (`php artisan procedure:check-deadlines`).
- Cada subsanación registra: número de intento, comentario del operador, fecha límite,
  respuesta del asegurado, indicador de cumplimiento.

### Rutas
| Método | URI | Nombre | Middleware |
|--------|-----|--------|------------|
| GET | `/tramites` | `procedures.index` | `auth` |
| GET | `/tramites/crear` | `procedures.create` | `auth`, `can:crear tramite` |
| POST | `/tramites` | `procedures.store` | `auth`, `can:crear tramite` |
| GET | `/tramites/{id}` | `procedures.show` | `auth`, `can:ver tramite` |
| GET | `/tramites/{id}/editar` | `procedures.edit` | `auth`, `can:editar tramite` |
| PUT | `/tramites/{id}` | `procedures.update` | `auth`, `can:editar tramite` |
| POST | `/tramites/{id}/enviar` | `procedures.submit` | `auth`, `can:enviar tramite` |
| POST | `/tramites/{id}/cancelar` | `procedures.cancel` | `auth`, `can:cancelar tramite` |
| POST | `/tramites/{id}/aprobar` | `procedures.approve` | `auth`, `can:aprobar tramite` |
| POST | `/tramites/{id}/rechazar` | `procedures.reject` | `auth`, `can:rechazar tramite` |
| POST | `/tramites/{id}/solicitar-subsanacion` | `procedures.request-correction` | `auth`, `can:solicitar subsanacion` |
| POST | `/tramites/{id}/responder-subsanacion` | `procedures.respond-correction` | `auth`, `can:subsanar tramite` |
| GET | `/tramites/{id}/historial` | `procedures.history` | `auth` |
| GET | `/tramites/{id}/comentarios` | `procedures.comments` | `auth` |
| POST | `/tramites/{id}/comentarios` | `procedures.comments.store` | `auth`, `can:comentar tramite` |

### Controladores
- `App\Http\Controllers\Procedures\ProcedureController` — CRUD y envío.
- `App\Http\Controllers\Procedures\ProcedureStateController` — Transiciones de estado.
- `App\Http\Controllers\Procedures\ProcedureHistoryController` — Historial de estados.
- `App\Http\Controllers\Procedures\ProcedureCommentController` — Comentarios.
- `App\Http\Controllers\Procedures\SubsanacionController` — Gestión de subsanaciones.

### Livewire Components
- `App\Livewire\Procedures\ProcedureList` — Tabla paginada con filtros (estado, tipo, fecha).
- `App\Livewire\Procedures\ProcedureForm` — Formulario wizard multi-step para crear/editar.
- `App\Livewire\Procedures\ProcedureTimeline` — Timeline visual del historial de estados.
- `App\Livewire\Procedures\ProcedureReview` — Panel de revisión para operadores.
- `App\Livewire\Procedures\SubsanacionForm` — Formulario para responder subsanación.
- `App\Livewire\Procedures\ProcedureDetail` — Vista de detalle con tabs (info, docs, comentarios).

### Modelos
- `App\Models\Procedure` — Trámite principal.
- `App\Models\ProcedureType` — Tipos de trámite (afiliación, prestación, subsidio, etc.).
- `App\Models\ProcedureStatus` — Catálogo de estados.
- `App\Models\ProcedureHistory` — Registro histórico de cambios de estado.
- `App\Models\ProcedureComment` — Comentarios (públicos e internos).
- `App\Models\Subsanacion` — Solicitudes y respuestas de subsanación.

### Jobs
- `App\Jobs\CheckSubsanacionDeadlines` — Programa diario que verifica plazos vencidos.
- `App\Jobs\NotifyProcedureStatusChange` — Notifica al asegurado por email cuando cambia el estado.
- `App\Jobs\AutoRejectExpiredProcedures` — Rechazo automático de trámites con plazo vencido.

### Policies
- `App\Policies\ProcedurePolicy` — `view`, `create`, `update`, `delete`, `submit`, `cancel`,
  `approve`, `reject`, `requestCorrection`, `respondCorrection`, `comment`.

### Vistas (Blade)
- `resources/views/procedures/index.blade.php`
- `resources/views/procedures/create.blade.php`
- `resources/views/procedures/edit.blade.php`
- `resources/views/procedures/show.blade.php`
- `resources/views/procedures/partials/timeline.blade.php`
- `resources/views/procedures/partials/comments.blade.php`
- `resources/views/procedures/partials/subsanacion.blade.php`

### Permisos asociados
- `tramites.ver`, `tramites.crear`, `tramites.editar`, `tramites.enviar`, `tramites.cancelar`,
  `tramites.aprobar`, `tramites.rechazar`, `tramites.solicitar-subsanacion`,
  `tramites.subsanar`, `tramites.comentar`, `tramites.ver-asignados`, `tramites.ver-todos`,
  `tramites.asignar`

---

## 3. Módulo Chatbot

### Descripción
Asistente virtual inteligente que responde consultas de los asegurados utilizando tres niveles
de respuesta: FAQ local (keywords + fuzzy matching), RAG con Qdrant (búsqueda semántica en
documentos oficiales), y OpenAI GPT-4 (generación contextual). Incluye escalación a operador
humano cuando la confianza es baja.

### Arquitectura de respuesta
1. **Nivel 1 — FAQ Local:** Búsqueda por keywords en la tabla `faqs`. Si el score de matching
   es ≥ 80%, responde inmediatamente con la respuesta predefinida.
2. **Nivel 2 — RAG (Qdrant):** Si el score de FAQ es < 80%, consulta Qdrant con embeddings
   del mensaje del usuario. Recupera los top-5 chunks más relevantes y los pasa como contexto
   a OpenAI para generar una respuesta fundamentada.
3. **Nivel 3 — OpenAI Direct:** Si RAG tampoco encuentra contenido relevante (score < 60%),
   genera respuesta usando solo el modelo GPT-4 con un system prompt contextual de EsSalud.
4. **Escalación:** Si la confianza final < 50%, se ofrece al usuario la opción de ser
   transferido a un operador humano. Se crea un ticket de atención.

### Rutas
| Método | URI | Nombre | Descripción |
|--------|-----|--------|-------------|
| GET | `/chat` | `chat.index` | Interfaz del chatbot (Livewire) |
| POST | `/api/chat/message` | `chat.message` | Enviar mensaje (API) |
| POST | `/api/chat/session` | `chat.session.create` | Crear nueva sesión |
| GET | `/api/chat/sessions` | `chat.sessions` | Listar sesiones del usuario |
| GET | `/api/chat/session/{id}` | `chat.session.show` | Ver historial de sesión |
| DELETE | `/api/chat/session/{id}` | `chat.session.delete` | Eliminar sesión |
| POST | `/api/chat/feedback` | `chat.feedback` | Enviar feedback (útil/no útil) |

### Controladores
- `App\Http\Controllers\Chatbot\ChatController` — Página principal del chat.
- `App\Http\Controllers\Api\Chatbot\MessageController` — API de mensajes.
- `App\Http\Controllers\Api\Chatbot\SessionController` — API de sesiones.
- `App\Http\Controllers\Api\Chatbot\FeedbackController` — API de feedback.

### Livewire Components
- `App\Livewire\Chat\ChatWindow` — Ventana completa del chat con scroll infinito.
- `App\Livewire\Chat\MessageBubble` — Componente individual de mensaje.
- `App\Livewire\Chat\SessionList` — Sidebar con lista de sesiones.
- `App\Livewire\Chat\FeedbackForm` — Formulario de feedback post-respuesta.

### Modelos
- `App\Models\ChatSession` — Sesión de chat.
- `App\Models\ChatMessage` — Mensaje individual (user/assistant/system).

### Servicios
- `App\Services\Chatbot\FaqMatcher` — Búsqueda por keywords en FAQs locales.
- `App\Services\Chatbot\RagService` — Consulta a Qdrant + generación contextual.
- `App\Services\Chatbot\OpenAiService` — Cliente wrapper para OpenAI API.
- `App\Services\Chatbot\EscalationService` — Crea ticket de atención para operador.
- `App\Services\Embedding\EmbeddingService` — Genera embeddings con `text-embedding-3-small`.

### Jobs
- `App\Jobs\SyncDocumentsToQdrant` — Sincroniza nuevos documentos con Qdrant.
- `App\Jobs\IndexDocumentEmbeddings` — Genera embeddings y los almacena en Qdrant.

### Permisos asociados
- `chatbot.usar`, `chatbot.escalar`, `chatbot.feedback`, `chatbot.ver-sesiones`

### Vistas
- `resources/views/chat/index.blade.php`
- `resources/views/chat/partials/chat-window.blade.php`
- `resources/views/chat/partials/session-sidebar.blade.php`

---

## 4. Módulo Documentos

### Descripción
Gestión de documentos asociados a trámites con subida múltiple, validación, OCR, versionado
y previsualización. Los documentos se almacenan en disco local con respaldo en MinIO (S3).

### Funcionalidades
- **Subida múltiple:** Dropzone.js con drag & drop. Subida asíncrona con barra de progreso.
- **Validación:** Tipos permitidos: PDF, JPG, PNG (convertidos a PDF internamente). Tamaño máximo: 10 MB.
  Validación de integridad del archivo y detección de malware básico (ClamAV opcional).
- **OCR:** Procesamiento de texto mediante Tesseract OCR ejecutado vía Laravel Job asíncrono.
  El texto extraído se almacena en `ocr_text` y se indexa para búsqueda.
- **Versionado:** Cada modificación genera una nueva versión. Las versiones anteriores se preservan.
- **Previsualización:** PDF inline en el navegador usando PDF.js.
- **Categorías:** Documentos organizados por tipo (DNI, recibo, certificado, formulario, etc.).
- **Almacenamiento dual:** Disco local (`storage/app/documents/`) + MinIO (`minio_path`).

### Rutas
| Método | URI | Nombre | Descripción |
|--------|-----|--------|-------------|
| GET | `/tramites/{id}/documentos` | `documents.index` | Listar documentos del trámite |
| POST | `/tramites/{id}/documentos` | `documents.store` | Subir documento(s) |
| GET | `/documentos/{id}` | `documents.show` | Ver documento |
| GET | `/documentos/{id}/descargar` | `documents.download` | Descargar documento |
| GET | `/documentos/{id}/previsualizar` | `documents.preview` | Previsualizar PDF |
| DELETE | `/documentos/{id}` | `documents.destroy` | Eliminar documento |
| POST | `/documentos/{id}/validar` | `documents.validate` | Validar documento (GESDOC) |
| POST | `/documentos/rechazar/{id}` | `documents.reject` | Rechazar documento |

### Controladores
- `App\Http\Controllers\Documents\DocumentController` — CRUD, subida, descarga.
- `App\Http\Controllers\Documents\DocumentValidationController` — Flujo de validación.
- `App\Http\Controllers\Documents\DocumentPreviewController` — Previsualización segura.

### Livewire Components
- `App\Livewire\Documents\DocumentUploader` — Componente Dropzone con subida asíncrona.
- `App\Livewire\Documents\DocumentList` — Tabla de documentos con filtros.
- `App\Livewire\Documents\DocumentPreview` — Visor de PDF embebido.

### Modelos
- `App\Models\Document` — Metadatos del documento.
- `App\Models\DocumentCategory` — Catálogo de categorías.
- `App\Models\DocumentEmbedding` — Chunks de embedding para RAG.
- `App\Models\Tag` — Etiquetas para clasificación.
- `App\Models\DocumentTag` — Relación muchos a muchos.
- `App\Models\RagSource` — Fuente indexada en Qdrant para RAG.

### Jobs
- `App\Jobs\ProcessOcr` — Ejecuta Tesseract sobre documento subido.
- `App\Jobs\ValidateDocument` — Validación de integridad y malware check.
- `App\Jobs\GenerateDocumentEmbeddings` — Genera embeddings para RAG.
- `App\Jobs\SyncDocumentToQdrant` — Sincroniza con Qdrant.

### Storage
- Configuración en `config/filesystems.php`: disco `documents` (local) y `minio` (S3-compatible).
- `App\Services\Storage\DocumentStorageService` — Abstracción de almacenamiento dual.

### Permisos asociados
- `documentos.ver`, `documentos.subir`, `documentos.descargar`, `documentos.eliminar`,
  `documentos.validar`, `documentos.gestionar-categorias`, `documentos.ver-todos`

### Vistas
- `resources/views/documents/index.blade.php`
- `resources/views/documents/preview.blade.php`
- `resources/views/documents/partials/uploader.blade.php`

---

## 5. Módulo Noticias

### Descripción
Sistema de publicación de noticias y comunicados oficiales. Los gestores documentales (GESDOC)
crean y administran contenido mientras que los asegurados (ASEG) solo tienen acceso de lectura.

### Funcionalidades
- CRUD completo con categorías.
- Búsqueda full-text usando MySQL `MATCH ... AGAINST` sobre `title` y `content`.
- Imagen destacada con redimensionamiento automático (Intervention Image).
- Fecha de publicación programable (permite crear noticias para publicar en el futuro).
- Estado activo/inactivo para ocultar sin eliminar.
- Slug automático desde el título.

### Rutas
| Método | URI | Nombre | Middleware |
|--------|-----|--------|------------|
| GET | `/noticias` | `news.index` | `auth` |
| GET | `/noticias/{slug}` | `news.show` | `auth` |
| GET | `/admin/noticias` | `admin.news.index` | `auth`, `can:gestionar noticias` |
| GET | `/admin/noticias/crear` | `admin.news.create` | `auth`, `can:gestionar noticias` |
| POST | `/admin/noticias` | `admin.news.store` | `auth`, `can:gestionar noticias` |
| GET | `/admin/noticias/{id}/editar` | `admin.news.edit` | `auth`, `can:gestionar noticias` |
| PUT | `/admin/noticias/{id}` | `admin.news.update` | `auth`, `can:gestionar noticias` |
| DELETE | `/admin/noticias/{id}` | `admin.news.destroy` | `auth`, `can:gestionar noticias` |
| PATCH | `/admin/noticias/{id}/toggle` | `admin.news.toggle` | `auth`, `can:gestionar noticias` |

### Controladores
- `App\Http\Controllers\News\NewsController` — Vista pública (ASEG).
- `App\Http\Controllers\Admin\News\NewsController` — Panel de administración (GESDOC).

### Livewire Components
- `App\Livewire\News\NewsList` — Listado público con búsqueda y paginación.
- `App\Livewire\News\NewsCard` — Tarjeta individual de noticia.
- `App\Livewire\Admin\News\NewsTable` — Tabla de administración con acciones.
- `App\Livewire\Admin\News\NewsForm` — Formulario de creación/edición con editor enriquecido (Trix).

### Modelos
- `App\Models\News` — Noticia.
- `App\Models\NewsCategory` — Categoría de noticias.

### Permisos asociados
- `noticias.ver`, `noticias.gestionar`

### Vistas
- `resources/views/news/index.blade.php`
- `resources/views/news/show.blade.php`
- `resources/views/admin/news/index.blade.php`
- `resources/views/admin/news/create.blade.php`
- `resources/views/admin/news/edit.blade.php`

---

## 6. Módulo FAQ

### Descripción
Base de conocimiento de preguntas frecuentes organizadas por categorías. Vinculada al chatbot
para respuestas rápidas (Nivel 1). Los gestores documentales mantienen el contenido.

### Funcionalidades
- CRUD con categorías.
- Búsqueda por keywords con fuzzy matching (PHP `similar_text` y `levenshtein`).
- Cada FAQ tiene keywords en formato JSON para mejorar el matching.
- Contadores de vistas, útil y no útil para medir calidad.
- Vinculación opcional a documento fuente (`source_document`).
- Ordenamiento personalizado por categoría (`sort_order`).

### Rutas
| Método | URI | Nombre | Middleware |
|--------|-----|--------|------------|
| GET | `/faq` | `faq.index` | `auth` |
| GET | `/faq/buscar` | `faq.search` | `auth` |
| GET | `/admin/faq` | `admin.faq.index` | `auth`, `can:gestionar faq` |
| GET | `/admin/faq/crear` | `admin.faq.create` | `auth`, `can:gestionar faq` |
| POST | `/admin/faq` | `admin.faq.store` | `auth`, `can:gestionar faq` |
| GET | `/admin/faq/{id}/editar` | `admin.faq.edit` | `auth`, `can:gestionar faq` |
| PUT | `/admin/faq/{id}` | `admin.faq.update` | `auth`, `can:gestionar faq` |
| DELETE | `/admin/faq/{id}` | `admin.faq.destroy` | `auth`, `can:gestionar faq` |
| POST | `/faq/{id}/feedback` | `faq.feedback` | `auth` |

### Controladores
- `App\Http\Controllers\Faq\FaqController` — Vista pública y búsqueda.
- `App\Http\Controllers\Admin\Faq\FaqController` — Panel de administración.
- `App\Http\Controllers\Api\Faq\FaqFeedbackController` — API de feedback.

### Livewire Components
- `App\Livewire\Faq\FaqList` — Acordeón de preguntas por categoría.
- `App\Livewire\Faq\FaqSearch` — Búsqueda en tiempo real.
- `App\Livewire\Admin\Faq\FaqTable` — Tabla de administración.
- `App\Livewire\Admin\Faq\FaqForm` — Formulario de creación/edición.

### Modelos
- `App\Models\Faq`
- `App\Models\FaqCategory`

### Permisos asociados
- `faq.ver`, `faq.buscar`, `faq.feedback`, `faq.gestionar`

### Vistas
- `resources/views/faq/index.blade.php`
- `resources/views/admin/faq/index.blade.php`
- `resources/views/admin/faq/create.blade.php`
- `resources/views/admin/faq/edit.blade.php`

---

## 7. Módulo Admin

### Descripción
Panel de administración con KPIs, reportes exportables, auditoría completa y gestión de
usuarios. Acceso controlado por roles (SUPV, SADM).

### Funcionalidades

#### Dashboard KPIs
- Trámites pendientes (total, por tipo, por operador).
- Tiempo promedio de resolución (desde envío hasta resolución).
- Tasa de aprobación (% aprobados vs rechazados).
- Usuarios activos (últimos 7, 30, 90 días).
- Trámites por estado (gráfico de barras).
- Tiempo promedio de respuesta del chatbot.
- FAQs más consultadas.

#### Reportes exportables
- PDF: Reporte de trámites (filtros por fecha, tipo, estado, operador).
- Excel: Exportación de datos tabulares con PhpSpreadsheet.
- Gráficos: Charts generados con Chart.js y embebidos en PDF.

#### Auditoría
- Registro de todas las acciones del sistema (modelo `AuditLog`).
- Filtro por usuario, acción, modelo, fecha.
- Vista de detalle con valores anteriores y nuevos (formato diff).
- Exportación de logs de auditoría.

#### Gestión de usuarios y roles
- CRUD de usuarios con asignación de roles.
- Activación/desactivación de cuentas.
- Desbloqueo manual de cuentas bloqueadas.
- Registro de actividad por usuario.

### Rutas
| Método | URI | Nombre | Middleware |
|--------|-----|--------|------------|
| GET | `/admin` | `admin.dashboard` | `auth`, `can:ver dashboard` |
| GET | `/admin/reportes` | `admin.reports` | `auth`, `can:exportar reportes` |
| GET | `/admin/reportes/tramites/pdf` | `admin.reports.procedures.pdf` | `auth` |
| GET | `/admin/reportes/tramites/excel` | `admin.reports.procedures.excel` | `auth` |
| GET | `/admin/auditoria` | `admin.audit.index` | `auth`, `can:ver auditoria` |
| GET | `/admin/usuarios` | `admin.users.index` | `auth`, `can:gestionar usuarios` |
| GET | `/admin/usuarios/{id}` | `admin.users.show` | `auth`, `can:gestionar usuarios` |
| PUT | `/admin/usuarios/{id}` | `admin.users.update` | `auth` |
| PATCH | `/admin/usuarios/{id}/toggle` | `admin.users.toggle` | `auth` |
| PATCH | `/admin/usuarios/{id}/unlock` | `admin.users.unlock` | `auth` |
| GET | `/admin/roles` | `admin.roles.index` | `auth`, `can:gestionar roles` |

### Controladores
- `App\Http\Controllers\Admin\DashboardController` — KPIs y métricas.
- `App\Http\Controllers\Admin\ReportController` — Generación de reportes PDF/Excel.
- `App\Http\Controllers\Admin\AuditController` — Visor de auditoría.
- `App\Http\Controllers\Admin\UserController` — Gestión de usuarios.
- `App\Http\Controllers\Admin\RoleController` — Gestión de roles y permisos.

### Livewire Components
- `App\Livewire\Admin\Dashboard\KpiCards` — Tarjetas de KPIs principales.
- `App\Livewire\Admin\Dashboard\ProcedureChart` — Gráfico de trámites por estado.
- `App\Livewire\Admin\Dashboard\ActivityFeed` — Actividad reciente del sistema.
- `App\Livewire\Admin\Reports\ReportFilters` — Filtros para reportes.
- `App\Livewire\Admin\Audit\AuditLogTable` — Tabla de auditoría.
- `App\Livewire\Admin\Users\UserTable` — Tabla de usuarios con acciones.
- `App\Livewire\Admin\Users\UserForm` — Formulario de edición de usuario.

### Modelos
- `App\Models\AuditLog` — Registro de auditoría.

### Jobs
- `App\Jobs\GeneratePdfReport` — Generación asíncrona de PDF (reportes grandes).
- `App\Jobs\GenerateExcelReport` — Generación asíncrona de Excel.
- `App\Jobs\PruneOldAuditLogs` — Limpieza de logs antiguos (> 1 año).

### Services
- `App\Services\Reports\PdfReportService` — Genera PDF con DomPDF.
- `App\Services\Reports\ExcelReportService` — Genera Excel con PhpSpreadsheet.
- `App\Services\Stats\KpiService` — Cálculo de KPIs.
- `App\Services\Audit\AuditService` — Registro y consulta de auditoría.

### Permisos asociados
- `admin.ver-dashboard`, `admin.exportar-reportes`, `admin.ver-auditoria`,
  `admin.gestionar-usuarios`, `admin.gestionar-roles`

### Vistas
- `resources/views/admin/dashboard.blade.php`
- `resources/views/admin/reports/index.blade.php`
- `resources/views/admin/audit/index.blade.php`
- `resources/views/admin/users/index.blade.php`
- `resources/views/admin/users/show.blade.php`
- `resources/views/admin/roles/index.blade.php`

---

## Comando de registro automático de módulos

```php
// app/Providers/ModuleServiceProvider.php
$modules = [
    'Auth', 'Procedures', 'Chatbot', 'Documents',
    'News', 'Faq', 'Admin',
];

foreach ($modules as $module) {
    Route::middleware('web')
        ->group(base_path("routes/modules/{$module}.php"));
}
```

Cada módulo tiene su archivo de rutas en `routes/modules/{Module}.php` y sigue la estructura
de directorios estándar de Laravel dentro de su namespace correspondiente.
