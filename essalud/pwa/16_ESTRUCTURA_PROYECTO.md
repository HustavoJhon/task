# 16 - Estructura del Proyecto Laravel

## Visión General

El proyecto EsSalud Laravel sigue la estructura estándar de Laravel 11 con organización modular basada en el dominio de negocio. Se utiliza una arquitectura monolítica con separación clara de responsabilidades: Controllers para HTTP, Livewire para UI interactiva, Models para datos, Services para lógica de negocio, y Jobs para procesamiento asíncrono.

## Árbol de Directorios Completo

```
essalud-laravel/
│
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       ├── ProceduresAutoCancel.php         # Cancela trámites expirados (schedule diario)
│   │       ├── RagReindex.php                   # Reindexa documentos en Qdrant
│   │       ├── SendNotificationDigest.php       # Envía resumen diario de notificaciones
│   │       ├── GenerateSitemap.php              # Genera sitemap.xml para SEO
│   │       ├── CleanTempFiles.php               # Limpia archivos temporales > 24h
│   │       ├── ImportLegacyData.php             # Migración de datos desde sistema anterior
│   │       ├── SyncUserPermissions.php          # Sincroniza permisos con roles
│   │       └── HealthCheck.php                  # Verifica estado de todos los servicios
│   │
│   ├── Events/
│   │   ├── ProcedureCreated.php                 # Se dispara al crear un trámite
│   │   ├── ProcedureStatusChanged.php           # Al cambiar el estado de un trámite
│   │   ├── DocumentUploaded.php                 # Al subir un documento a un trámite
│   │   ├── DocumentValidated.php                # Al validar un documento (OCR)
│   │   ├── ChatMessageSent.php                  # Al enviar mensaje en el chat
│   │   ├── UserRegistered.php                   # Al registrarse un nuevo usuario
│   │   ├── CommentAdded.php                     # Al agregar comentario en trámite
│   │   └── NotificationCreated.php              # Al generarse una notificación
│   │
│   ├── Exceptions/
│   │   ├── ProcedureException.php               # Excepción base para trámites
│   │   ├── DocumentValidationException.php      # Error en validación de documento
│   │   ├── OcrProcessingException.php           # Error en procesamiento OCR
│   │   ├── RagQueryException.php                # Error en consulta RAG
│   │   ├── ApiRateLimitException.php            # Rate limit excedido en API
│   │   └── Handler.php                          # Exception handler global con renderizado JSON/HTML
│   │
│   ├── Exports/
│   │   ├── ProceduresExport.php                 # Exporta trámites a Excel (Laravel Excel)
│   │   ├── UsersExport.php                      # Exporta usuarios a Excel
│   │   ├── ReportsExport.php                    # Exporta reportes administrativos
│   │   └── DocumentsExport.php                  # Exporta índice de documentos
│   │
│   ├── Filament/
│   │   ├── Pages/
│   │   │   └── Dashboard.php                    # Página principal del panel admin
│   │   │
│   │   ├── Resources/
│   │   │   ├── UserResource.php                 # CRUD de usuarios
│   │   │   ├── ProcedureResource.php            # Gestión de trámites
│   │   │   ├── ProcedureTypeResource.php        # Tipos de trámite
│   │   │   ├── DocumentResource.php             # Documentos
│   │   │   ├── FaqResource.php                  # Preguntas frecuentes
│   │   │   ├── NewsResource.php                 # Noticias
│   │   │   ├── NotificationResource.php         # Notificaciones
│   │   │   └── ChatSessionResource.php          # Sesiones de chat
│   │   │
│   │   ├── Widgets/
│   │   │   ├── StatsOverview.php                # Widget de KPIs en dashboard
│   │   │   ├── ProcedureChart.php               # Gráfico de trámites
│   │   │   └── LatestProcedures.php             # Últimos trámites en tabla
│   │   │
│   │   └── Providers/
│   │       └── FilamentServiceProvider.php      # Configuración de Filament
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginController.php          # POST login, logout
│   │   │   │   ├── RegisterController.php       # POST register
│   │   │   │   ├── ForgotPasswordController.php # POST forgot-password, reset-password
│   │   │   │   ├── EmailVerificationController.php # Verify email
│   │   │   │   └── ProfileController.php        # GET/PUT profile
│   │   │   │
│   │   │   ├── Api/
│   │   │   │   ├── V1/
│   │   │   │   │   ├── AuthController.php       # API auth (login, register, refresh, logout, me)
│   │   │   │   │   ├── ProcedureController.php  # CRUD de trámites vía API
│   │   │   │   │   ├── ChatController.php       # Chat API
│   │   │   │   │   ├── FaqController.php        # FAQ API
│   │   │   │   │   ├── DocumentController.php   # Upload/download documentos
│   │   │   │   │   ├── NewsController.php       # Noticias API
│   │   │   │   │   ├── NotificationController.php # Notificaciones API
│   │   │   │   │   └── SearchController.php     # Búsqueda RAG API
│   │   │   │   └── Controller.php               # Base API controller con helpers
│   │   │   │
│   │   │   └── Web/
│   │   │       ├── HomeController.php           # Landing page pública
│   │   │       ├── ProcedureController.php      # Páginas de trámites (web)
│   │   │       ├── DocumentController.php       # Descarga de documentos
│   │   │       ├── NewsController.php           # Páginas de noticias
│   │   │       └── FaqController.php            # Páginas de FAQ
│   │   │
│   │   ├── Middleware/
│   │   │   ├── Authenticate.php                 # Middleware de autenticación (modificado)
│   │   │   ├── RoleMiddleware.php               # Verifica rol del usuario (asegurado|funcionario|admin)
│   │   │   ├── PermissionMiddleware.php         # Verifica permisos específicos
│   │   │   ├── VerifiedUserMiddleware.php        # Solo usuarios con email verificado
│   │   │   ├── ThrottleRequests.php             # Rate limiting personalizado
│   │   │   ├── ForceJsonResponse.php            # Fuerza JSON en rutas API
│   │   │   ├── Cors.php                         # Configuración CORS
│   │   │   ├── SetLocale.php                    # Detecta y establece el idioma (es)
│   │   │   ├── LogHttpRequests.php              # Log de requests (solo en debug)
│   │   │   └── EncryptCookies.php               # Cookies encriptadas
│   │   │
│   │   └── Requests/
│   │       ├── Auth/
│   │       │   ├── LoginRequest.php             # Validación de login
│   │       │   ├── RegisterRequest.php          # Validación de registro
│   │       │   ├── ForgotPasswordRequest.php    # Validación de forgot password
│   │       │   └── ResetPasswordRequest.php     # Validación de reset password
│   │       │
│   │       ├── Procedure/
│   │       │   ├── StoreProcedureRequest.php    # Validación de creación de trámite
│   │       │   ├── UpdateProcedureRequest.php   # Validación de actualización
│   │       │   ├── ApproveProcedureRequest.php  # Validación de aprobación (motivo opcional)
│   │       │   ├── RejectProcedureRequest.php   # Validación de rechazo (motivo requerido)
│   │       │   └── SubmitProcedureRequest.php   # Validación de envío a revisión
│   │       │
│   │       ├── Document/
│   │       │   ├── UploadDocumentRequest.php    # Validación de subida (tipo, tamaño, cantidad)
│   │       │   └── UpdateDocumentRequest.php    # Validación de actualización de metadata
│   │       │
│   │       ├── Chat/
│   │       │   ├── SendMessageRequest.php       # Validación de mensaje de chat
│   │       │   └── FeedbackRequest.php          # Validación de feedback (thumbs up/down)
│   │       │
│   │       └── User/
│   │           ├── UpdateProfileRequest.php     # Validación de perfil
│   │           └── ChangePasswordRequest.php    # Validación de cambio de contraseña
│   │
│   ├── Jobs/
│   │   ├── ProcessDocumentOcr.php               # Procesa OCR de un documento subido
│   │   ├── GenerateDocumentEmbeddings.php       # Genera embeddings para búsqueda RAG
│   │   ├── SendEmailNotification.php            # Envía email de notificación
│   │   ├── SendPushNotification.php             # Envía push notification (Firebase)
│   │   ├── CreateThumbnail.php                  # Genera thumbnail de documento/imagen
│   │   ├── IndexDocument.php                    # Indexa documento en Qdrant
│   │   ├── CompressDocument.php                 # Comprime documento para almacenamiento
│   │   ├── NotifyUserOnStatusChange.php         # Notifica cambio de estado de trámite
│   │   ├── GenerateProcedureReport.php          # Genera reporte en background
│   │   └── CleanupSoftDeleted.php               # Limpia registros soft-deleted antiguos
│   │
│   ├── Listeners/
│   │   ├── NotifyUserOnStatusChange.php         # Escucha ProcedureStatusChanged
│   │   ├── IndexDocumentOnUpload.php            # Escucha DocumentUploaded
│   │   ├── SendWelcomeEmail.php                 # Escucha UserRegistered
│   │   ├── LogProcedureAudit.php                # Escucha todos los eventos de trámite
│   │   ├── SendChatNotification.php             # Escucha ChatMessageSent
│   │   └── UpdateProcedureMetrics.php           # Actualiza métricas en cache
│   │
│   ├── Livewire/
│   │   ├── Auth/
│   │   │   ├── LoginForm.php                    # Componente de login
│   │   │   ├── RegisterForm.php                 # Componente de registro
│   │   │   ├── ForgotPasswordForm.php           # Componente de recuperación
│   │   │   └── ResetPasswordForm.php            # Componente de reseteo
│   │   │
│   │   ├── Procedures/
│   │   │   ├── ProcedureList.php                # Lista de trámites con filtros
│   │   │   ├── ProcedureCreate.php              # Wizard de creación
│   │   │   ├── ProcedureDetail.php              # Vista detallada
│   │   │   ├── ProcedureCard.php                # Tarjeta resumen de trámite
│   │   │   └── ProcedureTimeline.php            # Timeline de historial
│   │   │
│   │   ├── Chat/
│   │   │   ├── ChatWidget.php                   # Widget flotante de chat
│   │   │   ├── ChatMessage.php                  # Componente de mensaje individual
│   │   │   └── ChatSessionList.php              # Lista de sesiones de chat
│   │   │
│   │   ├── Documents/
│   │   │   ├── DocumentUploader.php             # Upload con drag & drop
│   │   │   ├── DocumentList.php                 # Lista de documentos
│   │   │   └── DocumentPreview.php              # Preview de documento en modal
│   │   │
│   │   ├── Faq/
│   │   │   ├── FaqAccordion.php                 # Acordeón de FAQ
│   │   │   └── FaqSearch.php                    # Búsqueda de FAQ
│   │   │
│   │   ├── News/
│   │   │   ├── NewsGrid.php                     # Grid de tarjetas de noticias
│   │   │   └── NewsCard.php                     # Tarjeta individual de noticia
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── DashboardStats.php               # KPIs y gráficos
│   │   │   ├── RecentProcedures.php             # Últimos trámites
│   │   │   ├── PendingReviews.php               # Revisiones pendientes (funcionario)
│   │   │   └── UserNotifications.php            # Notificaciones del usuario
│   │   │
│   │   ├── Notifications/
│   │   │   ├── NotificationBell.php             # Campana con badge
│   │   │   └── NotificationList.php             # Lista de notificaciones
│   │   │
│   │   └── Layout/
│   │       ├── Sidebar.php                      # Sidebar de navegación
│   │       ├── Topbar.php                       # Barra superior
│   │       └── Breadcrumbs.php                  # Migas de pan
│   │
│   ├── Models/
│   │   ├── User.php                             # Modelo de usuario (modificado)
│   │   ├── Procedure.php                        # Modelo de trámite
│   │   ├── ProcedureType.php                    # Tipo de trámite
│   │   ├── ProcedureField.php                   # Campo dinámico de tipo de trámite
│   │   ├── ProcedureFieldValue.php              # Valor de campo en trámite específico
│   │   ├── ProcedureStatus.php                  # Historial de estados del trámite
│   │   ├── Document.php                         # Documento subido
│   │   ├── DocumentType.php                     # Tipo de documento requerido
│   │   ├── Comment.php                          # Comentario en trámite
│   │   ├── Notification.php                     # Notificación de usuario
│   │   ├── ChatSession.php                      # Sesión de chat
│   │   ├── ChatMessage.php                      # Mensaje de chat
│   │   ├── ChatFeedback.php                     # Feedback de respuesta del bot
│   │   ├── Faq.php                              # Pregunta frecuente
│   │   ├── FaqCategory.php                      # Categoría de FAQ
│   │   ├── FaqFeedback.php                      # Feedback de FAQ
│   │   ├── News.php                             # Noticia/Blog
│   │   ├── NewsCategory.php                     # Categoría de noticias
│   │   ├── AuditLog.php                         # Registro de auditoría
│   │   ├── Setting.php                          # Configuraciones del sistema
│   │   └── Role.php                             # Rol de usuario (spatie/laravel-permission)
│   │
│   ├── Policies/
│   │   ├── ProcedurePolicy.php                  # Autorización para trámites
│   │   ├── DocumentPolicy.php                   # Autorización para documentos
│   │   ├── UserPolicy.php                       # Autorización para usuarios
│   │   ├── NewsPolicy.php                       # Autorización para noticias
│   │   ├── FaqPolicy.php                        # Autorización para FAQ
│   │   ├── CommentPolicy.php                    # Autorización para comentarios
│   │   └── ChatPolicy.php                       # Autorización para chat
│   │
│   ├── Providers/
│   │   ├── AppServiceProvider.php               # Registro de servicios generales
│   │   ├── AuthServiceProvider.php              # Configuración de autenticación (Sanctum, Policies)
│   │   ├── EventServiceProvider.php             # Registro de eventos y listeners
│   │   ├── RouteServiceProvider.php             # Configuración de rutas
│   │   ├── FilamentServiceProvider.php          # Configuración del panel admin Filament
│   │   ├── HorizonServiceProvider.php           # Configuración de Laravel Horizon
│   │   └── TelescopeServiceProvider.php         # Configuración de Laravel Telescope (dev)
│   │
│   ├── Services/
│   │   ├── ProcedureService.php                 # Lógica de negocio de trámites
│   │   ├── DocumentService.php                  # Gestión de documentos
│   │   ├── OcrService.php                       # Servicio de OCR (Tesseract/Google Vision)
│   │   ├── OpenAIService.php                    # Cliente OpenAI (GPT-4, embeddings)
│   │   ├── QdrantService.php                    # Cliente Qdrant (vector DB)
│   │   ├── RagService.php                       # Servicio RAG (Retrieval-Augmented Generation)
│   │   ├── ChatbotService.php                   # Lógica del asistente virtual
│   │   ├── NotificationService.php              # Envío de notificaciones (email, push)
│   │   ├── AuditService.php                     # Registro de auditoría
│   │   ├── FileStorageService.php               # Abstracción de almacenamiento (MinIO/S3)
│   │   ├── ReportService.php                    # Generación de reportes
│   │   ├── SearchService.php                    # Búsqueda textual y vectorial
│   │   ├── MetricsService.php                   # Cálculo de métricas y KPIs
│   │   ├── CacheService.php                     # Gestión de cache (Redis)
│   │   └── EncryptionService.php                # Encriptación de datos sensibles
│   │
│   └── Traits/
│       ├── HasAuditLog.php                      # Trait para modelos auditables
│       ├── HasUuid.php                          # Trait para UUID en modelos
│       ├── Searchable.php                       # Trait para modelos indexados en Qdrant
│       └── HasStatusHistory.php                 # Trait para historial de estados
│
├── bootstrap/
│   ├── app.php                                  # Bootstrapping de la aplicación
│   └── providers.php                            # Registro de service providers (cacheado)
│
├── config/
│   ├── app.php                                  # Configuración general (nombre, env, debug, url, timezone, locale)
│   ├── auth.php                                 # Guards, providers, passwords, password_timeout
│   ├── broadcasting.php                         # Configuración de broadcasting (Redis)
│   ├── cache.php                                # Stores (redis, file, array)
│   ├── cors.php                                 # CORS (allowed origins, methods, headers)
│   ├── database.php                             # Conexiones (mysql primaria, sqlite testing)
│   ├── filesystems.php                          # Discos (local, public, s3-minio, backups)
│   ├── filament.php                             # Panel path, branding, middleware, recursos
│   ├── horizon.php                              # Laravel Horizon (queues, balancing, alerts)
│   ├── logging.php                              # Canales (stack, single, daily, slack, papertrail)
│   ├── mail.php                                 # Mailer (smtp, ses, mailgun, log)
│   ├── openai.php                               # API key, model, max_tokens, temperature
│   ├── qdrant.php                               # Host, port, collection name, vector size
│   ├── queue.php                                # Conexión redis, default queue, retry settings
│   ├── sanctum.php                              # Expiration, token abilities, stateful domains
│   ├── scribe.php                               # Config de documentación API
│   ├── services.php                             # Claves de servicios externos
│   ├── session.php                              # Driver redis, lifetime, encrypt
│   ├── telescope.php                            # Monitoreo en desarrollo
│   └── view.php                                 # Compiled path
│
├── database/
│   ├── factories/
│   │   ├── UserFactory.php                      # Factory con estados (asegurado, funcionario, admin)
│   │   ├── ProcedureFactory.php                 # Factory con estados y relaciones
│   │   ├── ProcedureTypeFactory.php             # Factory de tipos de trámite
│   │   ├── DocumentFactory.php                  # Factory de documentos
│   │   ├── CommentFactory.php                   # Factory de comentarios
│   │   ├── NotificationFactory.php              # Factory de notificaciones
│   │   ├── ChatSessionFactory.php               # Factory de sesiones de chat
│   │   ├── ChatMessageFactory.php               # Factory de mensajes
│   │   ├── FaqFactory.php                       # Factory de FAQ
│   │   ├── NewsFactory.php                      # Factory de noticias
│   │   └── AuditLogFactory.php                  # Factory de auditoría
│   │
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   ├── 0001_01_01_000002_create_jobs_table.php
│   │   ├── 2024_01_01_000001_create_roles_tables.php              # spatie/laravel-permission
│   │   ├── 2024_01_01_000002_create_procedure_types_table.php
│   │   ├── 2024_01_01_000003_create_procedure_fields_table.php
│   │   ├── 2024_01_01_000004_create_procedures_table.php
│   │   ├── 2024_01_01_000005_create_procedure_field_values_table.php
│   │   ├── 2024_01_01_000006_create_procedure_statuses_table.php
│   │   ├── 2024_01_01_000007_create_documents_table.php
│   │   ├── 2024_01_01_000008_create_document_types_table.php
│   │   ├── 2024_01_01_000009_create_comments_table.php
│   │   ├── 2024_01_01_000010_create_notifications_table.php
│   │   ├── 2024_01_01_000011_create_chat_sessions_table.php
│   │   ├── 2024_01_01_000012_create_chat_messages_table.php
│   │   ├── 2024_01_01_000013_create_chat_feedback_table.php
│   │   ├── 2024_01_01_000014_create_faq_categories_table.php
│   │   ├── 2024_01_01_000015_create_faqs_table.php
│   │   ├── 2024_01_01_000016_create_faq_feedback_table.php
│   │   ├── 2024_01_01_000017_create_news_categories_table.php
│   │   ├── 2024_01_01_000018_create_news_table.php
│   │   ├── 2024_01_01_000019_create_audit_logs_table.php
│   │   ├── 2024_01_01_000020_create_settings_table.php
│   │   └── 2024_01_01_000021_create_personal_access_tokens_table.php
│   │
│   └── seeders/
│       ├── DatabaseSeeder.php                   # Seeder principal (llama a los demás)
│       ├── RoleAndPermissionSeeder.php          # Roles base y permisos
│       ├── UserSeeder.php                       # Usuarios de prueba (admin, funcionario, asegurados)
│       ├── ProcedureTypeSeeder.php              # Tipos de trámite de EsSalud
│       ├── ProcedureSeeder.php                  # Trámites de prueba en varios estados
│       ├── DocumentTypeSeeder.php               # Tipos de documento requeridos
│       ├── FaqCategorySeeder.php                # Categorías de FAQ
│       ├── FaqSeeder.php                        # Preguntas frecuentes base
│       ├── NewsCategorySeeder.php               # Categorías de noticias
│       ├── NewsSeeder.php                       # Noticias de prueba
│       ├── SettingSeeder.php                    # Configuraciones iniciales del sistema
│       └── TestDataSeeder.php                   # Datos para entorno de testing
│
├── lang/
│   └── es/
│       ├── auth.php                             # Traducciones de autenticación
│       ├── pagination.php                       # Traducciones de paginación
│       ├── passwords.php                        # Traducciones de contraseñas
│       ├── validation.php                       # Traducciones de validación
│       ├── procedures.php                       # Traducciones de trámites
│       ├── documents.php                        # Traducciones de documentos
│       ├── chat.php                             # Traducciones de chat
│       ├── notifications.php                    # Traducciones de notificaciones
│       ├── faq.php                              # Traducciones de FAQ
│       ├── news.php                             # Traducciones de noticias
│       ├── ui.php                               # Traducciones de UI común
│       └── emails.php                           # Traducciones de emails
│
├── public/
│   ├── index.php                                # Punto de entrada HTTP
│   ├── .htaccess                                # Reglas de Apache
│   ├── favicon.ico                              # Favicon de EsSalud
│   ├── robots.txt                               # Reglas de SEO
│   ├── build/                                   # Assets compilados por Vite (manifiesto, JS, CSS)
│   │   └── assets/
│   └── storage/                                 # Symlink a storage/app/public
│
├── resources/
│   ├── css/
│   │   └── app.css                              # Tailwind CSS con @tailwind directives
│   │
│   ├── js/
│   │   ├── app.js                               # Bootstrap Alpine.js + Livewire
│   │   └── bootstrap.js                         # Configuración de Livewire
│   │
│   └── views/
│       ├── layouts/
│       │   ├── app.blade.php                    # Layout principal (sidebar + topbar + contenido)
│       │   ├── guest.blade.php                  # Layout para páginas públicas
│       │   └── print.blade.php                  # Layout para impresión de comprobantes
│       │
│       ├── components/
│       │   ├── input.blade.php                  # <x-input>
│       │   ├── button.blade.php                 # <x-button>
│       │   ├── modal.blade.php                  # <x-modal>
│       │   ├── confirmation-modal.blade.php     # <x-confirmation-modal>
│       │   ├── table.blade.php                  # <x-table>
│       │   ├── pagination.blade.php             # <x-pagination>
│       │   ├── card.blade.php                   # <x-card>
│       │   ├── alert.blade.php                  # <x-alert>
│       │   ├── badge.blade.php                  # <x-badge>
│       │   ├── dropdown.blade.php               # <x-dropdown>
│       │   ├── timeline.blade.php               # <x-timeline>
│       │   ├── stat-card.blade.php              # <x-stat-card>
│       │   ├── toast.blade.php                  # <x-toast>
│       │   ├── skeleton.blade.php               # <x-skeleton>
│       │   ├── empty-state.blade.php            # <x-empty-state>
│       │   ├── error-state.blade.php            # <x-error-state>
│       │   ├── search-input.blade.php           # <x-search-input>
│       │   └── breadcrumb.blade.php             # <x-breadcrumb>
│       │
│       ├── livewire/
│       │   ├── auth/
│       │   │   ├── login-form.blade.php
│       │   │   ├── register-form.blade.php
│       │   │   ├── forgot-password-form.blade.php
│       │   │   └── reset-password-form.blade.php
│       │   │
│       │   ├── procedures/
│       │   │   ├── procedure-list.blade.php
│       │   │   ├── procedure-create.blade.php
│       │   │   ├── procedure-detail.blade.php
│       │   │   ├── procedure-card.blade.php
│       │   │   └── procedure-timeline.blade.php
│       │   │
│       │   ├── chat/
│       │   │   ├── chat-widget.blade.php
│       │   │   ├── chat-message.blade.php
│       │   │   └── chat-session-list.blade.php
│       │   │
│       │   ├── documents/
│       │   │   ├── document-uploader.blade.php
│       │   │   ├── document-list.blade.php
│       │   │   └── document-preview.blade.php
│       │   │
│       │   ├── faq/
│       │   │   ├── faq-accordion.blade.php
│       │   │   └── faq-search.blade.php
│       │   │
│       │   ├── news/
│       │   │   ├── news-grid.blade.php
│       │   │   └── news-card.blade.php
│       │   │
│       │   ├── dashboard/
│       │   │   ├── dashboard-stats.blade.php
│       │   │   ├── recent-procedures.blade.php
│       │   │   ├── pending-reviews.blade.php
│       │   │   └── user-notifications.blade.php
│       │   │
│       │   ├── notifications/
│       │   │   ├── notification-bell.blade.php
│       │   │   └── notification-list.blade.php
│       │   │
│       │   └── layout/
│       │       ├── sidebar.blade.php
│       │       ├── topbar.blade.php
│       │       └── breadcrumbs.blade.php
│       │
│       ├── errors/
│       │   ├── 401.blade.php                    # No autorizado
│       │   ├── 403.blade.php                    # Prohibido
│       │   ├── 404.blade.php                    # No encontrado
│       │   ├── 419.blade.php                    # Sesión expirada
│       │   ├── 429.blade.php                    # Demasiadas solicitudes
│       │   ├── 500.blade.php                    # Error del servidor
│       │   └── 503.blade.php                    # Mantenimiento
│       │
│       ├── emails/
│       │   ├── welcome.blade.php                # Email de bienvenida
│       │   ├── verify-email.blade.php           # Verificación de email
│       │   ├── reset-password.blade.php         # Reseteo de contraseña
│       │   ├── procedure-created.blade.php      # Confirmación de trámite creado
│       │   ├── procedure-status-changed.blade.php # Notificación de cambio de estado
│       │   └── notification-digest.blade.php    # Resumen diario
│       │
│       └── vendor/
│           └── filament/                        # Vistas publicadas de Filament
│
├── routes/
│   ├── web.php                                  # Rutas web (Blade + Livewire)
│   ├── api.php                                  # Rutas API REST (Sanctum)
│   ├── channels.php                             # Broadcasting channels (WebSocket)
│   └── console.php                              # Comandos de consola schedule
│
├── storage/
│   ├── app/
│   │   ├── private/
│   │   │   ├── documents/                       # Documentos subidos (acceso restringido)
│   │   │   ├── exports/                         # Reportes Excel generados
│   │   │   └── backups/                         # Backups de base de datos
│   │   └── public/
│   │       ├── avatars/                         # Fotos de perfil de usuarios
│   │       ├── news/                            # Imágenes de noticias
│   │       └── thumbnails/                      # Thumbnails generados
│   │
│   ├── framework/
│   │   ├── cache/                               # Cache de la aplicación
│   │   ├── sessions/                            # Sesiones (si driver=file, en producción Redis)
│   │   ├── testing/                             # Archivos temporales de tests
│   │   └── views/                               # Vistas compiladas
│   │
│   └── logs/
│       ├── laravel.log                          # Log principal
│       ├── queue.log                            # Log de queue worker
│       └── scheduler.log                        # Log de scheduler
│
├── tests/
│   ├── Unit/
│   │   ├── Models/
│   │   │   ├── UserTest.php
│   │   │   ├── ProcedureTest.php
│   │   │   ├── DocumentTest.php
│   │   │   ├── ChatSessionTest.php
│   │   │   └── NotificationTest.php
│   │   │
│   │   ├── Services/
│   │   │   ├── ProcedureServiceTest.php
│   │   │   ├── DocumentServiceTest.php
│   │   │   ├── OcrServiceTest.php
│   │   │   ├── OpenAIServiceTest.php
│   │   │   ├── QdrantServiceTest.php
│   │   │   ├── RagServiceTest.php
│   │   │   ├── ChatbotServiceTest.php
│   │   │   └── NotificationServiceTest.php
│   │   │
│   │   ├── Policies/
│   │   │   ├── ProcedurePolicyTest.php
│   │   │   ├── DocumentPolicyTest.php
│   │   │   └── UserPolicyTest.php
│   │   │
│   │   └── Middleware/
│   │       ├── RoleMiddlewareTest.php
│   │       └── ThrottleRequestsTest.php
│   │
│   ├── Feature/
│   │   ├── Auth/
│   │   │   ├── LoginTest.php
│   │   │   ├── RegisterTest.php
│   │   │   ├── ForgotPasswordTest.php
│   │   │   ├── EmailVerificationTest.php
│   │   │   └── ProfileTest.php
│   │   │
│   │   ├── Procedures/
│   │   │   ├── CreateProcedureTest.php
│   │   │   ├── ListProceduresTest.php
│   │   │   ├── ViewProcedureTest.php
│   │   │   ├── ApproveProcedureTest.php
│   │   │   ├── RejectProcedureTest.php
│   │   │   └── CancelProcedureTest.php
│   │   │
│   │   ├── Chat/
│   │   │   ├── SendMessageTest.php
│   │   │   ├── ChatHistoryTest.php
│   │   │   └── ChatFeedbackTest.php
│   │   │
│   │   ├── Documents/
│   │   │   ├── UploadDocumentTest.php
│   │   │   ├── ListDocumentsTest.php
│   │   │   └── DownloadDocumentTest.php
│   │   │
│   │   ├── Faq/
│   │   │   ├── ListFaqTest.php
│   │   │   └── SearchFaqTest.php
│   │   │
│   │   ├── News/
│   │   │   ├── ListNewsTest.php
│   │   │   └── ViewNewsTest.php
│   │   │
│   │   ├── Api/
│   │   │   ├── AuthApiTest.php
│   │   │   ├── ProcedureApiTest.php
│   │   │   ├── ChatApiTest.php
│   │   │   ├── FaqApiTest.php
│   │   │   └── DocumentApiTest.php
│   │   │
│   │   └── Admin/
│   │       ├── DashboardTest.php
│   │       ├── UserManagementTest.php
│   │       └── ReportsTest.php
│   │
│   ├── Livewire/
│   │   ├── LoginFormTest.php
│   │   ├── RegisterFormTest.php
│   │   ├── ProcedureListTest.php
│   │   ├── ProcedureCreateTest.php
│   │   ├── ProcedureDetailTest.php
│   │   ├── ChatWidgetTest.php
│   │   ├── DocumentUploaderTest.php
│   │   ├── FaqAccordionTest.php
│   │   └── DashboardStatsTest.php
│   │
│   ├── CreatesApplication.php                   # Trait para crear la aplicación en tests
│   ├── TestCase.php                             # TestCase base con refresh database
│   └── Pest.php                                 # Config de Pest (si se usa en lugar de PHPUnit)
│
├── .env.example                                 # Plantilla de variables de entorno
├── .editorconfig                                # Configuración de editor
├── .gitattributes                               # Atributos de Git (merge strategy, eol)
├── .gitignore                                   # Archivos ignorados por Git
├── .phpunit.xml                                 # Configuración de PHPUnit
├── artisan                                      # CLI de Laravel (executable)
├── composer.json                                # Dependencias de PHP
├── composer.lock                                # Versiones exactas de dependencias
├── docker-compose.yml                           # Orquestación de servicios
├── Dockerfile                                   # Imagen Docker de la aplicación
├── package.json                                 # Dependencias de Node.js (Vite, Tailwind)
├── package-lock.json                            # Versiones exactas de dependencias Node
├── phpstan.neon                                 # Configuración de PHPStan (level 5)
├── pint.json                                    # Configuración de Laravel Pint
├── postcss.config.js                            # Configuración de PostCSS (Tailwind)
├── tailwind.config.js                           # Configuración de Tailwind CSS
├── vite.config.js                               # Configuración de Vite
└── README.md                                    # Documentación principal del proyecto
```

## Descripción de Directorios Principales

### `app/Console/Commands/`

Comandos de Artisan para tareas de mantenimiento, procesamiento batch y utilidades. Se ejecutan manualmente o vía cron (schedule en `routes/console.php`).

### `app/Events/`

Eventos del sistema que representan acciones significativas en el dominio. Se disparan con `event(new ProcedureCreated($procedure))` y son escuchados por Listeners para desacoplar efectos secundarios (notificaciones, auditoría, indexación).

### `app/Exceptions/`

Excepciones personalizadas del dominio que permiten manejo específico de errores. `Handler.php` extiende el handler de Laravel para renderizar respuestas JSON en API y vistas de error en web.

### `app/Exports/`

Clases de exportación usando el paquete `maatwebsite/laravel-excel`. Cada clase define columnas, formato, estilos y datos para exportar a Excel/CSV.

### `app/Filament/`

Configuración del panel administrativo Filament 3. Los Resources definen formularios, tablas, filtros y acciones para cada modelo gestionable. Widgets para el dashboard.

### `app/Http/Controllers/`

Controladores organizados en tres subdirectorios:
- **Auth:** autenticación web (login, registro, recuperación de contraseña).
- **Api/V1:** API REST versionada. Controladores stateless que devuelven JSON.
- **Web:** páginas públicas (landing page, vistas de noticias, FAQ).

### `app/Http/Middleware/`

Middleware personalizados para autenticación, autorización por roles, rate limiting, CORS, locale, y logging.

### `app/Http/Requests/`

Form Requests que centralizan la validación y autorización de cada endpoint. Separan la lógica de validación del controlador.

### `app/Jobs/`

Jobs que se encolan para procesamiento asíncrono: OCR, generación de embeddings, envío de emails, indexación en Qdrant, generación de thumbnails.

### `app/Listeners/`

Escuchan eventos del sistema y ejecutan efectos secundarios (notificar, indexar, auditar). Registrados en `EventServiceProvider`.

### `app/Livewire/`

Componentes Livewire organizados por módulo. Cada componente tiene su clase PHP y su vista Blade correspondiente en `resources/views/livewire/`.

### `app/Models/`

Modelos Eloquent que representan las tablas de la base de datos. Incluyen relaciones, casts, scopes, accessors/mutators y traits.

### `app/Policies/`

Laravel Policies que definen reglas de autorización por modelo. Cada Policy define métodos `viewAny`, `view`, `create`, `update`, `delete`, `restore`, `forceDelete`.

### `app/Providers/`

Service Providers que registran bindings en el contenedor de servicios, configuran eventos, rutas, y middleware.

### `app/Services/`

Capa de servicios con la lógica de negocio. Cada servicio es una clase con métodos bien definidos, inyectable vía dependency injection. Separan la lógica de negocio de los controladores.

### `app/Traits/`

Traits reutilizables para modelos (UUIDs, auditoría, búsqueda, historial de estados).

### `config/`

Archivos de configuración de Laravel y de paquetes de terceros (Filament, Sanctum, OpenAI, Qdrant, Horizon, Telescope).

### `database/factories/`

Model Factories para generar datos de prueba usando Faker. Incluyen definiciones de atributos por defecto y estados (ej. procedimiento en estado "aprobado").

### `database/migrations/`

Migraciones que definen la estructura de la base de datos. Se ejecutan secuencialmente con `php artisan migrate`.

### `database/seeders/`

Seeders que insertan datos iniciales o de prueba. El `DatabaseSeeder` orquesta la ejecución en orden (roles y permisos primero, luego usuarios, luego datos de dominio).

### `lang/es/`

Archivos de traducción al español para todos los textos de la aplicación: validación, autenticación, paginación, correos, y textos específicos del dominio.

### `public/`

Document root del servidor web. Contiene `index.php` (punto de entrada), assets compilados por Vite, y symlink a `storage/app/public`.

### `resources/views/`

Vistas Blade organizadas en:
- **layouts:** plantillas base.
- **components:** componentes Blade reutilizables.
- **livewire:** vistas de componentes Livewire.
- **errors:** páginas de error personalizadas.
- **emails:** plantillas de correo.

### `routes/`

- **web.php:** rutas accesibles vía navegador (Livewire, páginas, autenticación web).
- **api.php:** rutas API REST con prefijo `/api/v1/` y middleware `auth:sanctum`.
- **channels.php:** autorización de canales de broadcasting.
- **console.php:** definición de comandos schedule (cron).

### `storage/`

Almacenamiento persistente de la aplicación: documentos subidos, logs, cache, sesiones, backups.

### `tests/`

Pruebas automatizadas organizadas en:
- **Unit:** pruebas unitarias de modelos, servicios, políticas, middleware.
- **Feature:** pruebas de integración HTTP (requests a endpoints).
- **Livewire:** pruebas específicas de componentes Livewire.

## Dependencias Principales (composer.json)

- **laravel/framework:** ^11.0
- **livewire/livewire:** ^3.4
- **filament/filament:** ^3.2
- **laravel/sanctum:** ^4.0
- **spatie/laravel-permission:** ^6.0
- **openai-php/client:** ^0.10
- **qdrant/qdrant-php:** ^0.6
- **maatwebsite/excel:** ^3.1
- **laravel/horizon:** ^5.0
- **laravel/telescope:** ^5.0 (dev)
- **barryvdh/laravel-debugbar:** ^3.0 (dev)
- **laravel/pint:** ^1.0 (dev)
- **phpstan/phpstan:** ^1.10 (dev)

## Dependencias Node.js (package.json)

- **tailwindcss:** ^3.4
- **alpinejs:** ^3.13
- **@alpinejs/focus:** ^3.13
- **chart.js:** ^4.4
- **vite:** ^5.0
- **laravel-vite-plugin:** ^1.0
- **autoprefixer:** ^10.4
- **postcss:** ^8.4
