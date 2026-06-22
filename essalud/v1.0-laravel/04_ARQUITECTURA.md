# ARQUITECTURA - Monolito Modular Laravel 11 EsSalud v1.0

## 1. Visión General

La Plataforma EsSalud v1.0 Laravel se construye como un **monolito modular** sobre Laravel 11 con PHP 8.3. Esta arquitectura organiza el código en módulos independientes dentro del mismo proyecto, manteniendo separación de responsabilidades sin la complejidad operativa de los microservicios. El frontend usa Blade + Livewire 3 + Tailwind CSS, y el panel administrativo usa Filament 3.

### 1.1 Principios Arquitectónicos

| Principio | Implementación |
|-----------|---------------|
| **Modularidad** | Cada dominio en `app/Modules/` con Controllers, Livewire, Services, Views propios |
| **Separación de Responsabilidades** | Controllers → Services → Models (patrón Service Layer) |
| **DRY** | Traits reutilizables, componentes Blade, Form Requests |
| **Configurabilidad** | cada módulo con su propio `config/` y `ServiceProvider` |
| **Testabilidad** | Inyección de dependencias, interfaces para servicios externos |

### 1.2 Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                       Nginx Reverse Proxy                        │
│                    (SSL, Static Files, Gzip)                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │ PHP-FPM (FastCGI)
┌─────────────────────────────▼───────────────────────────────────┐
│                     Laravel 11 Application                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   HTTP Kernel / Middleware                │   │
│  │  CORS, CSRF, Auth (Sanctum), Rate Limit, Spatie RBAC    │   │
│  └─────────────────────────────┬────────────────────────────┘   │
│                                │                                 │
│  ┌─────────────────────────────▼────────────────────────────┐   │
│  │                    Route Service Provider                 │   │
│  │                                                           │   │
│  │  /          → Web Routes (Blade + Livewire)              │   │
│  │  /api       → API Routes (JSON + Sanctum SPA)            │   │
│  │  /admin     → Filament Panel Routes                       │   │
│  └───────┬─────────────────────┬──────────────────┬─────────┘   │
│          │                     │                  │              │
│  ┌───────▼──────┐  ┌───────────▼───────┐  ┌──────▼─────────┐   │
│  │ app/Modules/ │  │ app/Modules/      │  │ app/Modules/   │   │
│  │ Auth/        │  │ Procedures/       │  │ Chatbot/       │   │
│  │ Modules/     │  │ Modules/          │  │ Modules/       │   │
│  │ Documents/   │  │ News/             │  │ Faq/Admin/     │   │
│  └───────┬──────┘  └───────────┬───────┘  └──────┬─────────┘   │
│          │                     │                  │              │
│  ┌───────▼─────────────────────▼──────────────────▼─────────┐   │
│  │                     Shared Layer                         │   │
│  │  app/Models/ (Eloquent)   app/Services/ (Qdrant, OCR)   │   │
│  │  app/Events/              app/Listeners/                 │   │
│  │  app/Jobs/                app/Notifications/             │   │
│  │  app/Http/Middleware/     app/View/Components/           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      Servicios de Infraestructura                │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ MySQL 8  │ │ Redis 7  │ │ MinIO    │ │ Qdrant   │          │
│  │ :3306    │ │ :6379    │ │ :9000    │ │ :6333    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  ┌──────────┐ ┌──────────────────────────────┐                  │
│  │ OpenAI   │ │ APIs EsSalud Legacy / RENIEC │                  │
│  │ (HTTPS)  │ │ (HTTPS/REST)                 │                  │
│  └──────────┘ └──────────────────────────────┘                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Estructura de Directorios

```
essalud-laravel/
├── app/
│   ├── Console/
│   │   └── Commands/              # Comandos Artisan personalizados
│   │       ├── IngestDocuments.php
│   │       ├── RegenerateEmbeddings.php
│   │       └── CleanExpiredDrafts.php
│   │
│   ├── Events/
│   │   ├── ProcedureCreated.php
│   │   ├── ProcedureStatusChanged.php
│   │   ├── DocumentUploaded.php
│   │   ├── DocumentVersioned.php
│   │   └── ChatMessageReceived.php
│   │
│   ├── Exceptions/
│   │   ├── ProcedureWorkflowException.php
│   │   └── DocumentValidationException.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/               # Controladores para API REST
│   │   │       ├── AuthController.php
│   │   │       ├── ProcedureController.php
│   │   │       └── ...
│   │   ├── Middleware/
│   │   │   ├── RoleMiddleware.php
│   │   │   ├── EnsureEmailIsVerified.php
│   │   │   └── RateLimitApi.php
│   │   ├── Requests/              # Form Requests (validación)
│   │   │   ├── Auth/
│   │   │   ├── Procedures/
│   │   │   └── Documents/
│   │   └── Resources/             # API Resources (transformación)
│   │       ├── UserResource.php
│   │       ├── ProcedureResource.php
│   │       └── DocumentResource.php
│   │
│   ├── Jobs/
│   │   ├── ProcessOcr.php
│   │   ├── GenerateEmbeddings.php
│   │   ├── IndexDocument.php
│   │   ├── NotifyUser.php
│   │   ├── SendEmailNotification.php
│   │   └── CleanupExpiredProcedures.php
│   │
│   ├── Listeners/
│   │   ├── NotifyUserOnStatusChange.php
│   │   ├── IndexDocumentOnUpload.php
│   │   ├── LogProcedureEvent.php
│   │   └── UpdateDashboardMetrics.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Role.php
│   │   ├── Procedure.php
│   │   ├── ProcedureType.php
│   │   ├── ProcedureHistory.php
│   │   ├── ProcedureComment.php
│   │   ├── Document.php
│   │   ├── DocumentVersion.php
│   │   ├── DocumentCategory.php
│   │   ├── ChatSession.php
│   │   ├── ChatMessage.php
│   │   ├── ChatFeedback.php
│   │   ├── Faq.php
│   │   ├── FaqCategory.php
│   │   ├── FaqFeedback.php
│   │   ├── News.php
│   │   ├── NewsCategory.php
│   │   ├── Notification.php
│   │   ├── AuditLog.php
│   │   └── SystemConfig.php
│   │
│   ├── Modules/
│   │   ├── Auth/
│   │   │   ├── Controllers/
│   │   │   │   ├── LoginController.php
│   │   │   │   ├── RegisterController.php
│   │   │   │   ├── ForgotPasswordController.php
│   │   │   │   └── ProfileController.php
│   │   │   ├── Livewire/
│   │   │   │   ├── LoginForm.php
│   │   │   │   ├── RegisterForm.php
│   │   │   │   └── ProfileEditor.php
│   │   │   ├── Services/
│   │   │   │   ├── AuthService.php
│   │   │   │   └── ReniecService.php
│   │   │   ├── Views/
│   │   │   │   ├── login.blade.php
│   │   │   │   ├── register.blade.php
│   │   │   │   ├── forgot-password.blade.php
│   │   │   │   ├── reset-password.blade.php
│   │   │   │   └── profile/
│   │   │   │       ├── index.blade.php
│   │   │   │       └── edit.blade.php
│   │   │   └── routes.php
│   │   │
│   │   ├── Procedures/
│   │   │   ├── Controllers/
│   │   │   │   ├── ProcedureController.php
│   │   │   │   └── ProcedureTypeController.php
│   │   │   ├── Livewire/
│   │   │   │   ├── ProcedureList.php
│   │   │   │   ├── ProcedureCreate.php
│   │   │   │   ├── ProcedureDetail.php
│   │   │   │   ├── ProcedureWizard.php
│   │   │   │   └── ProcedureReview.php
│   │   │   ├── Services/
│   │   │   │   ├── ProcedureService.php
│   │   │   │   ├── WorkflowEngine.php
│   │   │   │   └── ProcedureValidator.php
│   │   │   ├── Views/
│   │   │   │   ├── index.blade.php
│   │   │   │   ├── create.blade.php
│   │   │   │   ├── show.blade.php
│   │   │   │   └── wizard/
│   │   │   │       ├── step-type.blade.php
│   │   │   │       ├── step-data.blade.php
│   │   │   │       ├── step-documents.blade.php
│   │   │   │       └── step-summary.blade.php
│   │   │   └── routes.php
│   │   │
│   │   ├── Chatbot/
│   │   │   ├── Livewire/
│   │   │   │   ├── ChatWindow.php
│   │   │   │   ├── ChatBubble.php
│   │   │   │   ├── ChatInput.php
│   │   │   │   └── ChatSuggestions.php
│   │   │   ├── Services/
│   │   │   │   ├── ChatService.php
│   │   │   │   ├── RagEngine.php
│   │   │   │   ├── FaqEngine.php
│   │   │   │   └── EscalationService.php
│   │   │   ├── Views/
│   │   │   │   ├── index.blade.php
│   │   │   │   └── partials/
│   │   │   │       ├── message-bubble.blade.php
│   │   │   │       └── source-citation.blade.php
│   │   │   └── routes.php
│   │   │
│   │   ├── Documents/
│   │   │   ├── Livewire/
│   │   │   │   ├── DocumentUpload.php
│   │   │   │   ├── DocumentList.php
│   │   │   │   └── DocumentPreview.php
│   │   │   ├── Services/
│   │   │   │   ├── DocumentService.php
│   │   │   │   ├── DocumentValidator.php
│   │   │   │   └── OcrService.php
│   │   │   ├── Views/
│   │   │   │   ├── index.blade.php
│   │   │   │   ├── upload.blade.php
│   │   │   │   └── preview.blade.php
│   │   │   └── routes.php
│   │   │
│   │   ├── News/
│   │   │   ├── Livewire/
│   │   │   │   ├── NewsList.php
│   │   │   │   ├── NewsDetail.php
│   │   │   │   └── NewsSearch.php
│   │   │   ├── Views/
│   │   │   │   ├── index.blade.php
│   │   │   │   └── show.blade.php
│   │   │   └── routes.php
│   │   │
│   │   ├── Faq/
│   │   │   ├── Livewire/
│   │   │   │   ├── FaqList.php
│   │   │   │   ├── FaqAccordion.php
│   │   │   │   └── FaqSearch.php
│   │   │   ├── Views/
│   │   │   │   ├── index.blade.php
│   │   │   │   └── partials/
│   │   │   │       └── faq-item.blade.php
│   │   │   └── routes.php
│   │   │
│   │   └── Admin/
│   │       ├── Filament/
│   │       │   ├── Resources/
│   │       │   │   ├── UserResource.php
│   │       │   │   ├── ProcedureResource.php
│   │       │   │   ├── DocumentResource.php
│   │       │   │   ├── NewsResource.php
│   │       │   │   ├── FaqResource.php
│   │       │   │   └── RoleResource.php
│   │       │   ├── Pages/
│   │       │   │   └── Dashboard.php
│   │       │   └── Widgets/
│   │       │       ├── StatsOverview.php
│   │       │       ├── ProceduresChart.php
│   │       │       ├── ChatbotMetrics.php
│   │       │       └── LatestProcedures.php
│   │       └── routes.php
│   │
│   ├── Notifications/
│   │   ├── ProcedureStatusChanged.php
│   │   ├── SubsanacionRequired.php
│   │   └── WelcomeNotification.php
│   │
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   ├── AuthServiceProvider.php
│   │   ├── EventServiceProvider.php
│   │   ├── HorizonServiceProvider.php
│   │   ├── FilamentServiceProvider.php
│   │   ├── ModuleServiceProvider.php    # Registra todos los módulos
│   │   └── TelescopeServiceProvider.php
│   │
│   └── Services/
│       ├── QdrantService.php
│       ├── OpenAIService.php
│       ├── OcrService.php
│       ├── MinioService.php
│       ├── ReniecService.php
│       └── AuditService.php
│
├── bootstrap/
│   └── app.php
│
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   ├── queue.php
│   ├── sanctum.php
│   ├── permission.php
│   ├── filament.php
│   ├── livewire.php
│   ├── horizon.php
│   ├── services.php              # API keys externas
│   └── modules/
│       ├── auth.php
│       ├── procedures.php
│       ├── chatbot.php
│       ├── documents.php
│       └── admin.php
│
├── database/
│   ├── factories/
│   ├── migrations/
│   │   ├── 0001_create_users_table.php
│   │   ├── 0002_create_roles_permissions_tables.php
│   │   ├── 0003_create_procedures_tables.php
│   │   ├── 0004_create_documents_tables.php
│   │   ├── 0005_create_chat_tables.php
│   │   ├── 0006_create_news_tables.php
│   │   ├── 0007_create_faq_tables.php
│   │   └── 0008_create_audit_logs_table.php
│   └── seeders/
│       ├── RoleAndPermissionSeeder.php
│       ├── ProcedureTypeSeeder.php
│       ├── FaqCategorySeeder.php
│       └── NewsCategorySeeder.php
│
├── public/
│   ├── index.php
│   ├── css/                      # Tailwind compilado
│   └── js/                       # Alpine + Vite bundles
│
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── app.blade.php         # Layout principal con sidebar
│   │   │   ├── auth.blade.php        # Layout sin sidebar (login)
│   │   │   ├── admin.blade.php       # Layout para Filament
│   │   │   └── partials/
│   │   │       ├── sidebar.blade.php
│   │   │       ├── topbar.blade.php
│   │   │       ├── footer.blade.php
│   │   │       └── scripts.blade.php
│   │   └── components/               # Componentes Blade anónimos
│   │       ├── button.blade.php
│   │       ├── input.blade.php
│   │       ├── modal.blade.php
│   │       ├── card.blade.php
│   │       ├── table.blade.php
│   │       ├── badge.blade.php
│   │       ├── alert.blade.php
│   │       ├── timeline.blade.php
│   │       ├── dropzone.blade.php
│   │       └── skeleton.blade.php
│   ├── css/
│   │   └── app.css                   # Tailwind directives
│   └── js/
│       └── app.js                    # Alpine + Livewire bootstrap
│
├── routes/
│   ├── web.php                   # Rutas Blade + Livewire (principal)
│   ├── api.php                   # Rutas API REST (Sanctum SPA)
│   ├── admin.php                 # Rutas Filament
│   ├── console.php               # Comandos Artisan programados
│   └── channels.php              # Broadcasting (opcional)
│
├── tests/
│   ├── Unit/
│   │   ├── Services/
│   │   │   ├── WorkflowEngineTest.php
│   │   │   ├── RagEngineTest.php
│   │   │   └── DocumentValidatorTest.php
│   │   └── Models/
│   │       ├── ProcedureTest.php
│   │       └── UserTest.php
│   ├── Feature/
│   │   ├── Auth/
│   │   │   ├── LoginTest.php
│   │   │   └── RegistrationTest.php
│   │   ├── Procedures/
│   │   │   ├── CreateProcedureTest.php
│   │   │   └── ProcedureWorkflowTest.php
│   │   ├── Chatbot/
│   │   │   └── ChatMessageTest.php
│   │   └── Documents/
│   │       └── DocumentUploadTest.php
│   └── Pest.php
│
├── composer.json
├── package.json
├── vite.config.js
├── tailwind.config.js
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## 3. Stack Tecnológico Completo

| Componente | Tecnología | Versión | Propósito |
|------------|-----------|---------|-----------|
| **Lenguaje** | PHP | 8.3 | Runtime principal |
| **Framework** | Laravel | 11.x | Núcleo de la aplicación |
| **Base de Datos** | MySQL | 8.0 | Datos relacionales, transacciones ACID |
| **Caché y Sesiones** | Redis | 7.x | Caché de FAQ, sesiones, rate limiting |
| **Queue Driver** | Redis (Laravel Queue) | - | Jobs asíncronos (OCR, embeddings, notificaciones) |
| **Queue Monitor** | Laravel Horizon | 5.x | Dashboard y gestión de colas |
| **Debug** | Laravel Telescope | 5.x | Debugging y profiling en desarrollo |
| **Frontend CSS** | Tailwind CSS | 3.x | Utilidades CSS |
| **Componentes Dinámicos** | Livewire | 3.x | UI reactiva sin JavaScript |
| **Interactividad JS** | Alpine.js | 3.x | Interacciones ligeras (dropdowns, modals) |
| **Bundle** | Vite | 5.x | Compilación de assets |
| **Panel Admin** | Filament | 3.x | Panel administrativo full-featured |
| **Auth SPA** | Laravel Sanctum | 4.x | Autenticación SPA (cookie-based) |
| **RBAC** | Spatie Laravel-Permission | 6.x | Roles y permisos |
| **Almacenamiento** | MinIO (S3-compatible) | latest | Objetos: documentos, imágenes |
| **Vector DB** | Qdrant | 1.7 | Búsqueda semántica RAG |
| **IA/LLM** | OpenAI API | - | Embeddings + Chat Completion |
| **OCR** | Tesseract OCR | 5.x | Reconocimiento de texto en imágenes/PDFs |
| **PDF** | PDF.js (frontend) | - | Vista previa de PDFs en navegador |
| **Testing** | Pest PHP | 3.x | Tests unitarios y de feature |
| **Static Analysis** | Larastan (PHPStan) | 2.x | Análisis estático nivel 8 |
| **Code Style** | Laravel Pint | 1.x | Formateo de código |
| **Export** | Laravel Excel | 3.x | Reportes CSV/Excel/PDF |
| **Auditoría** | Laravel Auditable | - | Logs de cambios en modelos |
| **Contenedores** | Docker + Laravel Sail | - | Entorno de desarrollo y producción |

---

## 4. Comunicación Interna: Eventos + Listeners

En lugar de RabbitMQ (microservicios), usamos el sistema nativo de **Eventos + Listeners** de Laravel para comunicación entre módulos.

### 4.1 Eventos Definidos

| Evento | Disparado por | Escuchado por |
|--------|--------------|---------------|
| `ProcedureCreated` | ProcedureService al crear trámite | `LogProcedureEvent`, `NotifyUser`, `UpdateDashboardMetrics` |
| `ProcedureStatusChanged` | WorkflowEngine al cambiar estado | `NotifyUserOnStatusChange`, `LogProcedureEvent`, `UpdateDashboardMetrics` |
| `DocumentUploaded` | DocumentService al subir documento | `IndexDocumentOnUpload`, `LogProcedureEvent` |
| `DocumentVersioned` | DocumentService al versionar | `LogProcedureEvent` |
| `ChatMessageReceived` | ChatService al recibir mensaje | `UpdateDashboardMetrics` |
| `FaqCreated` | Faq CRUD al crear FAQ | Invalida caché de FAQ en Redis |
| `NewsPublished` | News CRUD al publicar | Invalida caché de feed |

### 4.2 Registro en EventServiceProvider

```php
protected $listen = [
    ProcedureCreated::class => [
        LogProcedureEvent::class,
        NotifyUser::class,
        UpdateDashboardMetrics::class,
    ],
    ProcedureStatusChanged::class => [
        NotifyUserOnStatusChange::class,
        LogProcedureEvent::class,
        UpdateDashboardMetrics::class,
    ],
    DocumentUploaded::class => [
        IndexDocumentOnUpload::class,
    ],
];
```

---

## 5. Queue: Laravel Queue + Redis + Horizon

Reemplaza a Celery + RabbitMQ. Toda tarea asíncrona es un **Laravel Job** procesado por Redis Queue y monitoreado con Horizon.

### 5.1 Jobs Definidos

| Job | Disparador | Timeout | Retries | Cola |
|-----|-----------|---------|---------|------|
| `ProcessOcr` | DocumentUploaded event | 120s | 3 | `ocr` |
| `GenerateEmbeddings` | DocumentUploaded event | 60s | 3 | `embeddings` |
| `IndexDocument` | DocumentUploaded event | 30s | 3 | `indexing` |
| `NotifyUser` | Procedure events | 30s | 5 | `notifications` |
| `SendEmailNotification` | Diversos eventos | 30s | 5 | `notifications` |
| `CleanupExpiredProcedures` | Scheduler (diario 3am) | 300s | 1 | `maintenance` |
| `EscalateChatToOperator` | ChatService (baja confianza) | 30s | 3 | `chat` |

### 5.2 Configuración de Colas (config/queue.php)

```php
'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => 90,
        'block_for' => null,
    ],
],
```

### 5.3 Horizon Dashboard

Disponible en `/horizon` (solo SADM) para monitorear:
- Jobs procesados / fallidos
- Tiempo de procesamiento
- Throughput por cola
- Reintentos y balance de workers

---

## 6. Modelo C4 — Niveles

### 6.1 Nivel 1: Contexto del Sistema

```
┌──────────────────────────────────────────────────────────────┐
│                     PERSONAS                                  │
│                                                               │
│  👤 Asegurado    👤 Operador    👤 Gestor Doc    👤 Supervisor│
│     (Web)          (Web+Fil.)     (Filament)       (Filament) │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼─────────────────────────────────┐
│            Plataforma EsSalud v1.0 (Laravel Monolith)        │
│                                                               │
│  Frontend Web (Blade+Livewire)    Panel Admin (Filament 3)   │
│                   │                        │                  │
│            ┌──────▼────────────────────────▼──────┐          │
│            │       Laravel 11 Application          │          │
│            │  (Auth, Trámites, Chatbot, Docs,      │          │
│            │   Noticias, FAQ, Admin)                │          │
│            └──────┬────────────────────────┬──────┘          │
│                   │                        │                  │
└───────────────────┼────────────────────────┼──────────────────┘
                    │                        │
     ┌──────────────▼──────┐    ┌────────────▼──────────┐
     │  RENIEC (DNI)       │    │  OpenAI (Embed+Chat)  │
     │  APIs Legacy EsSal. │    │  SMTP (Email)         │
     └─────────────────────┘    └───────────────────────┘
```

### 6.2 Nivel 2: Contenedores

```
┌──────────────────────────────────────────────────────────────┐
│                 Sistema EsSalud — Contenedores                │
│                                                               │
│  ┌─────────────────────────┐  ┌────────────────────────────┐ │
│  │   Nginx Container       │  │   PHP-FPM Container        │ │
│  │                         │  │                            │ │
│  │  - Reverse Proxy        │  │  - Laravel 11 App          │ │
│  │  - Static Files (/css,  │  │  - All Modules             │ │
│  │    /js, /images)        │  │  - Horizon (queue worker)  │ │
│  │  - SSL Termination      │  │  - Scheduler (cron)        │ │
│  │  - Gzip/Brotli          │  │                            │ │
│  └───────────┬─────────────┘  └────────────┬───────────────┘ │
│              │                              │                  │
└──────────────┼──────────────────────────────┼──────────────────┘
               │                              │
    ┌──────────▼──────┐  ┌──────────┐  ┌──────▼──────┐
    │  MySQL 8        │  │  Redis 7 │  │  MinIO      │
    │  (datos)        │  │  (cache) │  │  (archivos) │
    └─────────────────┘  └──────────┘  └─────────────┘
               │
    ┌──────────▼──────┐
    │  Qdrant         │
    │  (vectores)     │
    └─────────────────┘
```

### 6.3 Nivel 3: Componentes (Dentro del Monolito)

```
┌──────────────────────────────────────────────────────────────┐
│                  Laravel Application                          │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                   HTTP Layer                           │   │
│  │  ┌─────────┐  ┌───────────┐  ┌──────────────────┐    │   │
│  │  │ Web     │  │ API       │  │ Filament Panel   │    │   │
│  │  │ Routes  │  │ Routes    │  │ Routes           │    │   │
│  │  │ (Blade) │  │ (JSON)    │  │ (/admin)         │    │   │
│  │  └────┬────┘  └─────┬─────┘  └────────┬─────────┘    │   │
│  └───────┼─────────────┼─────────────────┼──────────────┘   │
│          │             │                  │                   │
│  ┌───────▼─────────────▼─────────────────▼──────────────┐   │
│  │              Middleware Stack                         │   │
│  │  Sanctum Auth → Spatie RBAC → Rate Limit → Validate  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │                 Module Controllers                     │   │
│  │                                                       │   │
│  │  Auth Module    Procedures M.   Chatbot M.            │   │
│  │  ┌──────────┐  ┌─────────────┐  ┌────────────────┐   │   │
│  │  │Login     │  │Procedure    │  │ChatWindow      │   │   │
│  │  │Controller│  │Controller   │  │(Livewire)      │   │   │
│  │  └────┬─────┘  └──────┬──────┘  └───────┬────────┘   │   │
│  │       │               │                  │            │   │
│  │  Documents M.    News M.      Faq M.     Admin M.    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────┐  ┌────────┐  │   │
│  │  │DocUpload │  │NewsList  │  │FaqList│  │Filament│  │   │
│  │  │(Livewire)│  │(Livewire)│  │(Livew)│  │Resources│  │   │
│  │  └──────────┘  └──────────┘  └───────┘  └────────┘  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │                  Service Layer                         │   │
│  │  AuthService  ProcedureService  RagEngine             │   │
│  │  ChatService  DocumentService   FaqEngine             │   │
│  │  WorkflowEngine  QdrantService  OpenAIService         │   │
│  │  OcrService     MinioService    ReniecService         │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │                  Data Layer                            │   │
│  │  Eloquent Models  │  Events + Listeners               │   │
│  │  Database (MySQL) │  Redis (Cache/Sessions/Queue)     │   │
│  │  MinIO (Files)    │  Qdrant (Vectors)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Flujo de Request

```
1. Request HTTP
       │
       ▼
2. Nginx (reverse proxy)
   - SSL termination
   - Static file serving
   - Gzip compression
       │
       ▼
3. PHP-FPM → public/index.php
       │
       ▼
4. Laravel Bootstrap
   - Load .env
   - Register Service Providers
   - Boot Modules (ModuleServiceProvider)
       │
       ▼
5. HTTP Kernel
   - Apply Global Middleware
       │
       ▼
6. Router (web.php / api.php / admin.php)
   - Match route
   - Apply Route Middleware (auth, role, rate.limit)
       │
       ▼
7. Controller / Livewire Component
   - Form Request Validation
   - Call Service Layer
   - Dispatch Events
   - Dispatch Jobs (async)
       │
       ▼
8. Response
   - Blade View (HTML) con Livewire
   - o JSON Response (API)
   - o Filament Panel (HTML)
       │
       ▼
9. Nginx → Browser
```

---

## 8. Seguridad

### 8.1 Capas de Seguridad

| Capa | Implementación |
|------|---------------|
| **Autenticación** | Laravel Sanctum (SPA cookie-based session) |
| **Autorización** | Spatie Laravel-Permission (RBAC: 5 roles + permisos granulares) |
| **CSRF** | Laravel CSRF protection (automático en formularios Blade) |
| **XSS** | Escape automático con Blade `{{ }}` sintaxis |
| **SQL Injection** | Eloquent ORM binding parametrizado |
| **Rate Limiting** | Laravel Rate Limiter (Redis-backed) |
| **CORS** | Configurado en `config/cors.php` para SPA |
| **File Upload** | Validación de tipo MIME, extensión, tamaño máximo 10MB |
| **HTTPS** | SSL via Nginx con certificados Let's Encrypt |
| **Headers** | HSTS, X-Frame-Options, X-Content-Type-Options via Nginx |
| **Auditoría** | Laravel Auditable en modelos críticos |

### 8.2 Sanctum SPA Auth Flow

```
┌──────────┐                    ┌──────────────┐
│ Browser  │                    │ Laravel      │
│ (SPA)    │                    │ Backend      │
└────┬─────┘                    └──────┬───────┘
     │                                 │
     │  POST /api/login                 │
     │  {email, password}              │
     │────────────────────────────────▶│
     │                                 │ Validar credenciales
     │                                 │ Crear sesión
     │  Set-Cookie: session            │
     │◀────────────────────────────────│
     │                                 │
     │  GET /api/procedures             │
     │  Cookie: session                │
     │────────────────────────────────▶│
     │                                 │ Validar sesión Sanctum
     │                                 │ Verificar rol (Spatie)
     │  JSON Response                   │
     │◀────────────────────────────────│
```

### 8.3 Matriz de Permisos Spatie

| Permiso | ASEG | OPER | GESDOC | SUPV | SADM |
|---------|:----:|:----:|:------:|:----:|:----:|
| `view-procedures` | ✅ | ✅ | — | ✅ | ✅ |
| `create-procedures` | ✅ | — | — | — | ✅ |
| `review-procedures` | — | ✅ | — | — | ✅ |
| `approve-procedures` | — | ✅ | — | — | ✅ |
| `assign-procedures` | — | — | — | ✅ | ✅ |
| `view-all-procedures` | — | ✅ | — | ✅ | ✅ |
| `upload-documents` | ✅ | — | ✅ | — | ✅ |
| `manage-faq` | — | — | ✅ | — | ✅ |
| `manage-news` | — | — | ✅ | — | ✅ |
| `view-dashboard` | — | — | — | ✅ | ✅ |
| `export-reports` | — | — | — | ✅ | ✅ |
| `manage-users` | — | — | — | — | ✅ |
| `manage-roles` | — | — | — | — | ✅ |
| `view-audit-logs` | — | — | — | ✅ | ✅ |
| `configure-system` | — | — | — | — | ✅ |
| `access-horizon` | — | — | — | — | ✅ |
| `access-telescope` | — | — | — | — | ✅ |

---

## 9. Configuración de Módulos (ModuleServiceProvider)

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    protected array $modules = [
        'Auth',
        'Procedures',
        'Chatbot',
        'Documents',
        'News',
        'Faq',
        'Admin',
    ];

    public function register(): void
    {
        foreach ($this->modules as $module) {
            $this->loadModuleConfig($module);
        }
    }

    public function boot(): void
    {
        foreach ($this->modules as $module) {
            $this->loadModuleRoutes($module);
            $this->loadModuleViews($module);
        }
    }

    protected function loadModuleConfig(string $module): void
    {
        $configPath = base_path("config/modules/{$module}.php");
        if (file_exists($configPath)) {
            $this->mergeConfigFrom($configPath, strtolower($module));
        }
    }

    protected function loadModuleRoutes(string $module): void
    {
        $routeFile = app_path("Modules/{$module}/routes.php");
        if (file_exists($routeFile)) {
            require $routeFile;
        }
    }

    protected function loadModuleViews(string $module): void
    {
        $viewPath = app_path("Modules/{$module}/Views");
        if (is_dir($viewPath)) {
            $this->loadViewsFrom($viewPath, strtolower($module));
        }
    }
}
```

---

## 10. Jobs y Scheduler

### 10.1 Tareas Programadas (routes/console.php o App\Console\Kernel)

```php
// Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Limpiar trámites en BORRADOR > 30 días
    $schedule->job(new CleanupExpiredProcedures)
             ->dailyAt('03:00')
             ->onQueue('maintenance');

    // Reintentar jobs fallidos de OCR
    $schedule->command('queue:retry all')
             ->hourly();

    // Generar reporte diario de métricas
    $schedule->command('report:daily-metrics')
             ->dailyAt('23:55');

    // Limpiar archivos temporales de upload (>24h)
    $schedule->command('cleanup:temp-uploads')
             ->hourly();
}
```

### 10.2 Ejemplo de Job: GenerateEmbeddings

```php
class GenerateEmbeddings implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected Document $document,
    ) {}

    public function handle(OpenAIService $openai, QdrantService $qdrant): void
    {
        // 1. Extraer texto del documento
        $text = $this->document->extracted_text;

        // 2. Chunking
        $chunks = $this->chunkText($text, maxTokens: 500);

        // 3. Generar embeddings
        $embeddings = $openai->generateEmbeddings($chunks);

        // 4. Indexar en Qdrant
        $qdrant->upsertPoints(
            collection: 'essalud_docs',
            points: $this->buildPoints($chunks, $embeddings),
        );

        // 5. Actualizar estado del documento
        $this->document->update(['indexed_at' => now()]);
    }

    private function chunkText(string $text, int $maxTokens): array
    {
        // Implementación de chunking con overlap
        // ...
    }
}
```

---

## 11. Variables de Entorno (.env)

```bash
# Aplicación
APP_NAME="EsSalud"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://essalud.gob.pe

# Base de Datos
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=essalud
DB_USERNAME=essalud
DB_PASSWORD=secret

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# Queue
QUEUE_CONNECTION=redis

# Cache & Session
CACHE_DRIVER=redis
SESSION_DRIVER=redis

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini

# Qdrant
QDRANT_HOST=qdrant
QDRANT_PORT=6333
QDRANT_COLLECTION=essalud_docs

# MinIO / S3
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=essalud-documents
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true

# RENIEC
RENIEC_API_URL=https://api.reniec.gob.pe
RENIEC_API_KEY=xxxxx

# Filament
FILAMENT_PATH=admin

# Horizon
HORIZON_DOMAIN=admin.essalud.gob.pe
HORIZON_PATH=horizon
```

---

## 12. Comandos Artisan Personalizados

| Comando | Descripción |
|---------|-------------|
| `php artisan ingest:documents {path}` | Ingesta masiva de PDFs para RAG |
| `php artisan embeddings:regenerate` | Regenera embeddings de todos los documentos indexados |
| `php artisan procedures:cleanup-expired` | Elimina trámites en BORRADOR > 30 días |
| `php artisan documents:validate-all` | Re-valida todos los documentos del sistema |
| `php artisan report:daily-metrics` | Genera reporte diario de KPIs |
| `php artisan cleanup:temp-uploads` | Limpia archivos temporales de MinIO |
| `php artisan audit:export {--from=} {--to=}` | Exporta logs de auditoría en CSV |

---

## 13. Docker Compose (Servicios)

```yaml
services:
  # PHP + Laravel App
  app:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - .:/var/www/html
    depends_on:
      - mysql
      - redis
      - minio
      - qdrant
    networks:
      - essalud-net

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./public:/var/www/html/public
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - essalud-net

  # MySQL 8
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: essalud
      MYSQL_USER: essalud
      MYSQL_PASSWORD: secret
    volumes:
      - mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - essalud-net

  # Redis 7
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - essalud-net

  # MinIO Object Storage
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data
    networks:
      - essalud-net

  # Qdrant Vector Database
  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant-data:/qdrant/storage
    networks:
      - essalud-net

  # Laravel Horizon (queue worker)
  horizon:
    build:
      context: .
      dockerfile: Dockerfile
    command: php artisan horizon
    depends_on:
      - redis
      - mysql
    volumes:
      - .:/var/www/html
    networks:
      - essalud-net

  # Laravel Scheduler (cron)
  scheduler:
    build:
      context: .
      dockerfile: Dockerfile
    command: |
      sh -c "while true; do php artisan schedule:run && sleep 60; done"
    depends_on:
      - redis
      - mysql
    volumes:
      - .:/var/www/html
    networks:
      - essalud-net

volumes:
  mysql-data:
  redis-data:
  minio-data:
  qdrant-data:

networks:
  essalud-net:
    driver: bridge
```

---

## 14. Comparativa: Microservicios vs Monolito Laravel

| Dimensión | Microservicios (FastAPI) | Monolito Laravel |
|-----------|-------------------------|-------------------|
| **Deploy** | 6 servicios independientes | 1 comando: `php artisan deploy` |
| **Base de Datos** | 6 bases PostgreSQL | 1 base MySQL (esquemas/tablas separadas) |
| **Transacciones** | Sagas (complejo) | ACID nativo (Eloquent) |
| **Mensajería** | RabbitMQ | Eventos + Listeners nativos |
| **Colas** | Celery | Laravel Queue + Horizon |
| **Auth** | JWT manual por servicio | Sanctum SPA (cookie-based) |
| **Frontend** | Flutter app móvil | Blade + Livewire (responsive web) |
| **Admin** | Dashboard separado | Filament (integrado) |
| **Latencia** | HTTP entre servicios (~5-10ms c/u) | Llamadas en-proceso (~0ms) |
| **Escalabilidad** | Horizontal por servicio | Vertical + caching + queue |
| **Equipo mínimo** | 5-6 devs especializados | 1-2 full-stack Laravel |
| **Complejidad DevOps** | Alta (orquestación, service discovery) | Baja (Docker + supervisor) |
| **Tiempo de desarrollo** | 12 meses | 5-6 meses (22 semanas) |
| **Costo operativo** | $8,800/mes | $2,880/mes |

---

## 15. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[03_DESIGN_DETALLADO.md]] | UI/UX Blade + Livewire |
| [[02_SPEC_DETALLADO.md]] | Especificación funcional |
| [[05_MODULOS_LARAVEL.md]] | Detalle de cada módulo |
| [[06_MODELO_ER.md]] | Modelo entidad-relación completo |
| [[17_DOCKER_COMPOSE.md]] | Docker Compose detallado |
| [[21_SEGURIDAD_AUDITORIA.md]] | Seguridad integral |
| [[11_RAG_QDRANT.md]] | Sistema RAG con Qdrant |
| [[07_ROLES_PERMISOS.md]] | RBAC con Spatie |

---

#arquitectura #laravel #essalud #v1.0 #monolito #modular #c4
