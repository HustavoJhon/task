# MICROSERVICIOS - Plataforma EsSalud v1.0 Empresarial

## 1. Tabla Resumen de Servicios

| Servicio | Puerto | Tecnología | Base de Datos | Responsabilidad |
|----------|--------|-----------|---------------|-----------------|
| `auth-service` | 8001 | FastAPI + PyJWT | auth_db (PostgreSQL) + Redis | Autenticación, JWT, registro, recuperación |
| `user-service` | 8002 | FastAPI | user_db (PostgreSQL) | CRUD usuarios, roles, permisos, perfiles |
| `news-service` | 8003 | FastAPI | news_db (PostgreSQL) | CRUD noticias, categorías, tags |
| `procedure-service` | 8004 | FastAPI | procedure_db (PostgreSQL) + Redis | Workflow trámites, estados, asignación |
| `chatbot-service` | 8005 | FastAPI + LangChain | chatbot_db (PostgreSQL) + Redis + Qdrant | FAQ + RAG + LangChain + OpenAI |
| `document-service` | 8006 | FastAPI | document_db (PostgreSQL) + MinIO | Subida, versionado, validación, OCR |

---

## 2. Auth Service

### 2.1 Responsabilidad Única
Gestión completa de identidad digital: registro de asegurados, autenticación JWT, recuperación de credenciales y control de sesiones.

### 2.2 Endpoints REST

| Método | Ruta | Descripción | Auth | Roles |
|--------|------|-------------|------|-------|
| `POST` | `/auth/register` | Registro de nuevo asegurado | No | Público |
| `POST` | `/auth/login` | Inicio de sesión | No | Público |
| `POST` | `/auth/refresh` | Renovación de token | Refresh token | Todos |
| `POST` | `/auth/logout` | Cierre de sesión | Bearer JWT | Todos |
| `POST` | `/auth/forgot-password` | Solicitar recuperación de contraseña | No | Público |
| `POST` | `/auth/reset-password` | Restablecer contraseña | Token reset | Público |
| `POST` | `/auth/verify-email` | Verificar correo electrónico | Token verify | Público |
| `GET` | `/auth/me` | Obtener perfil del usuario autenticado | Bearer JWT | Todos |
| `PUT` | `/auth/me/password` | Cambiar contraseña (requiere anterior) | Bearer JWT | Todos |

### 2.3 Eventos

| Evento | Tipo | Descripción | Consumers |
|--------|------|-------------|-----------|
| `user.registered` | RabbitMQ | Nuevo usuario registrado | user-service, notification |
| `user.logged_in` | RabbitMQ | Usuario inició sesión | audit-service |
| `user.password_reset` | RabbitMQ | Contraseña restablecida | notification |

### 2.4 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `AUTH_DB_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` |
| `JWT_SECRET_KEY` | Clave secreta para firmar JWT | - |
| `JWT_ALGORITHM` | Algoritmo de firma | `RS256` |
| `JWT_ACCESS_EXPIRE_MINUTES` | Expiración token acceso (min) | `1440` (24h) |
| `JWT_REFRESH_EXPIRE_DAYS` | Expiración refresh token (días) | `30` |
| `RENIEC_API_URL` | URL API RENIEC para validación DNI | - |
| `RENIEC_API_KEY` | API Key para RENIEC | - |
| `SMTP_HOST` | Servidor SMTP | - |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_USER` | Usuario SMTP | - |
| `SMTP_PASSWORD` | Contraseña SMTP | - |
| `RATE_LIMIT_WINDOW` | Ventana de rate limiting (seg) | `60` |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo requests por ventana | `30` |

### 2.5 Resiliencia
- **Retry**: 3 intentos, backoff exponencial (1s, 2s, 4s) para RENIEC API
- **Circuit Breaker**: Apertura tras 5 fallos consecutivos a RENIEC, medio ciclo 30s
- **Timeout**: 5 segundos para RENIEC, 2 segundos para Redis

---

## 3. User Service

### 3.1 Responsabilidad Única
Administración de usuarios del sistema, asignación de roles, gestión de permisos y control de acceso basado en RBAC.

### 3.2 Endpoints REST

| Método | Ruta | Descripción | Auth | Roles |
|--------|------|-------------|------|-------|
| `GET` | `/users` | Listar usuarios (paginado con filtros) | Bearer JWT | SUPV, SADM |
| `GET` | `/users/{id}` | Obtener detalle de usuario | Bearer JWT | SADM |
| `PUT` | `/users/{id}` | Actualizar datos de usuario | Bearer JWT | SADM |
| `DELETE` | `/users/{id}` | Desactivar usuario (soft delete) | Bearer JWT | SADM |
| `GET` | `/users/{id}/roles` | Obtener roles de usuario | Bearer JWT | SADM |
| `PUT` | `/users/{id}/roles` | Asignar roles a usuario | Bearer JWT | SADM |
| `GET` | `/roles` | Listar roles del sistema | Bearer JWT | SADM |
| `POST` | `/roles` | Crear nuevo rol | Bearer JWT | SADM |
| `GET` | `/permissions` | Listar permisos disponibles | Bearer JWT | SADM |
| `POST` | `/users/bulk` | Carga masiva de usuarios (CSV) | Bearer JWT | SADM |

### 3.3 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `USER_DB_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/1` |

### 3.4 Resiliencia
- **Retry**: 2 intentos para PostgreSQL
- **Cache**: Usuarios cacheados 30 min en Redis

---

## 4. News Service

### 4.1 Responsabilidad Única
Publicación y gestión de noticias, avisos y comunicados de EsSalud con categorización y búsqueda.

### 4.2 Endpoints REST

| Método | Ruta | Descripción | Auth | Roles |
|--------|------|-------------|------|-------|
| `GET` | `/news` | Listar noticias públicas (paginado) | No | Público |
| `GET` | `/news/{id}` | Detalle de noticia | No | Público |
| `GET` | `/news/search` | Buscar noticias por texto | No | Público |
| `GET` | `/news/categories` | Listar categorías | No | Público |
| `POST` | `/news` | Crear noticia | Bearer JWT | SADM |
| `PUT` | `/news/{id}` | Actualizar noticia | Bearer JWT | SADM |
| `DELETE` | `/news/{id}` | Eliminar noticia (soft) | Bearer JWT | SADM |
| `POST` | `/news/categories` | Crear categoría | Bearer JWT | SADM |
| `PUT` | `/news/categories/{id}` | Actualizar categoría | Bearer JWT | SADM |
| `DELETE` | `/news/categories/{id}` | Eliminar categoría | Bearer JWT | SADM |

### 4.3 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NEWS_DB_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/2` |

### 4.4 Resiliencia
- **Cache**: Feed de noticias cacheado 5 min en Redis
- **Pagination**: Offset-based con tamaño máximo 50 por página

---

## 5. Procedure Service

### 5.1 Responsabilidad Única
Gestión del ciclo de vida completo de trámites: creación, workflow de estados, asignación a operadores, subsanaciones.

### 5.2 Endpoints REST

| Método | Ruta | Descripción | Auth | Roles |
|--------|------|-------------|------|-------|
| `GET` | `/procedures/types` | Listar tipos de trámite | No | Público |
| `GET` | `/procedures/statuses` | Listar estados posibles | Bearer JWT | OPER, SUPV, SADM |
| `GET` | `/procedures` | Listar trámites (paginado + filtros) | Bearer JWT | OPER, SUPV, SADM |
| `GET` | `/procedures/my` | Listar trámites del asegurado | Bearer JWT | ASEG |
| `POST` | `/procedures` | Crear nuevo trámite | Bearer JWT | ASEG |
| `GET` | `/procedures/{id}` | Detalle de trámite | Bearer JWT | Propietario/OPER/SUPV/SADM |
| `PUT` | `/procedures/{id}` | Actualizar datos del trámite | Bearer JWT | Propietario (si BORRADOR) |
| `POST` | `/procedures/{id}/submit` | Enviar trámite para revisión | Bearer JWT | ASEG (propietario) |
| `POST` | `/procedures/{id}/approve` | Aprobar trámite | Bearer JWT | OPER, SADM |
| `POST` | `/procedures/{id}/reject` | Rechazar trámite | Bearer JWT | OPER, SADM |
| `POST` | `/procedures/{id}/request-subsanacion` | Solicitar subsanación | Bearer JWT | OPER, SADM |
| `POST` | `/procedures/{id}/subsanar` | Enviar subsanación | Bearer JWT | ASEG |
| `POST` | `/procedures/{id}/assign` | Asignar a operador | Bearer JWT | SUPV, SADM |
| `GET` | `/procedures/{id}/history` | Historial de cambios | Bearer JWT | Propietario/OPER/SUPV/SADM |
| `GET` | `/procedures/{id}/documents` | Documentos del trámite | Bearer JWT | Propietario/OPER/SUPV/SADM |

### 5.3 Workflow de Estados

```mermaid
stateDiagram-v2
    [*] --> BORRADOR: Crear trámite
    BORRADOR --> PENDIENTE: Enviar
    PENDIENTE --> EN_REVISION: Operador asigna
    EN_REVISION --> APROBADO: Operador aprueba
    EN_REVISION --> RECHAZADO: Operador rechaza
    EN_REVISION --> SUBSANACION: Solicitar corrección
    RECHAZADO --> SUBSANACION: Asegurado puede subsanar
    SUBSANACION --> EN_REVISION: Asegurado subsana
    SUBSANACION --> CANCELADO: 3 subsanaciones fallidas
    SUBSANACION --> CANCELADO: 15 días sin respuesta
    BORRADOR --> CANCELADO: 30 días sin enviar
    APROBADO --> [*]
    CANCELADO --> [*]
```

### 5.4 Eventos

| Evento | Tipo | Descripción | Consumers |
|--------|------|-------------|-----------|
| `procedure.created` | RabbitMQ | Nuevo trámite creado | notification |
| `procedure.submitted` | RabbitMQ | Trámite enviado a revisión | notification |
| `procedure.approved` | RabbitMQ | Trámite aprobado | notification |
| `procedure.rejected` | RabbitMQ | Trámite rechazado | notification |
| `procedure.subsanacion_requested` | RabbitMQ | Se solicita subsanación | notification |
| `procedure.subsanated` | RabbitMQ | Asegurado envió subsanación | notification |
| `procedure.cancelled` | RabbitMQ | Trámite cancelado | notification |

### 5.5 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PROCEDURE_DB_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/3` |
| `RABBITMQ_URL` | RabbitMQ connection string | `amqp://guest:guest@rabbitmq:5672/` |

### 5.6 Resiliencia
- **Idempotencia**: Creación de trámite con idempotency-key
- **Saga Pattern**: Transacciones distribuidas vía eventos RabbitMQ
- **Retry**: Publicación de eventos con retry 3 veces
- **Timeout**: 30 segundos para completar workflow transaccional

---

## 6. Chatbot Service

### 6.1 Responsabilidad Única
Motor de inteligencia artificial para responder consultas de asegurados usando FAQ estructurada y RAG sobre documentos oficiales de EsSalud.

### 6.2 Endpoints REST

| Método | Ruta | Descripción | Auth | Roles |
|--------|------|-------------|------|-------|
| `POST` | `/chat/message` | Enviar mensaje y obtener respuesta | Bearer JWT | ASEG |
| `GET` | `/chat/history/{session_id}` | Historial de sesión | Bearer JWT | Propietario |
| `DELETE` | `/chat/session/{session_id}` | Eliminar sesión de chat | Bearer JWT | Propietario |
| `POST` | `/chat/feedback` | Enviar feedback sobre respuesta | Bearer JWT | ASEG |
| `GET` | `/chat/sessions` | Listar sesiones del usuario | Bearer JWT | ASEG |
| `GET` | `/faq` | Listar FAQ pública | No | Público |
| `GET` | `/faq/search` | Buscar en FAQ | No | Público |
| `POST` | `/faq` | Crear pregunta FAQ | Bearer JWT | GESDOC |
| `PUT` | `/faq/{id}` | Actualizar FAQ | Bearer JWT | GESDOC |
| `DELETE` | `/faq/{id}` | Eliminar FAQ | Bearer JWT | GESDOC |
| `POST` | `/rag/reindex` | Reindexar documentos en Qdrant | Bearer JWT | GESDOC |
| `GET` | `/admin/chat/metrics` | Métricas del chatbot | Bearer JWT | SUPV, SADM |

### 6.3 Flujo de Respuesta

```mermaid
flowchart TD
    A[Pregunta del usuario] --> B{FAQ Engine}
    B -->|Match > 0.85| C[Respuesta FAQ directa]
    B -->|Sin match| D[RAG Engine]
    D --> E[Generar embedding]
    E --> F[Buscar en Qdrant]
    F --> G{Similitud > 0.75?}
    G -->|Sí| H[Construir prompt con contexto]
    G -->|No| I[Fallback: Lo siento, no encontré info]
    H --> J[OpenAI Chat Completion]
    J --> K[Extraer citas de fuentes]
    K --> L[Respuesta con citación]
    L --> M{Confianza > 0.6?}
    M -->|Sí| N[Devolver respuesta al usuario]
    M -->|No| O[Sugerir escalar a operador]
    C --> N
    I --> N
    O --> N
```

### 6.4 Eventos

| Evento | Tipo | Descripción | Consumers |
|--------|------|-------------|-----------|
| `chat.message_sent` | RabbitMQ | Mensaje procesado (métrica) | monitoring |
| `chat.escalation_needed` | RabbitMQ | Requiere intervención humana | notification |
| `rag.index_updated` | RabbitMQ | Índice RAG actualizado | chatbot-service (self) |

### 6.5 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `CHATBOT_DB_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/4` |
| `QDRANT_URL` | Qdrant gRPC URL | `http://qdrant:6333` |
| `QDRANT_COLLECTION` | Nombre de colección Qdrant | `essalud_documents` |
| `OPENAI_API_KEY` | API Key de OpenAI | - |
| `OPENAI_EMBEDDING_MODEL` | Modelo de embedding | `text-embedding-3-small` |
| `OPENAI_CHAT_MODEL` | Modelo de chat | `gpt-4o-mini` |
| `EMBEDDING_DIMENSIONS` | Dimensiones del embedding | `1536` |
| `CHUNK_SIZE` | Tamaño de chunk (tokens) | `512` |
| `CHUNK_OVERLAP` | Overlap entre chunks (tokens) | `64` |
| `RAG_SIMILARITY_THRESHOLD` | Umbral de similitud | `0.75` |
| `RAG_TOP_K` | Número de chunks recuperados | `5` |
| `CONFIDENCE_THRESHOLD` | Umbral de confianza mínimo | `0.6` |

### 6.6 Resiliencia
- **Circuit Breaker**: OpenAI API (5 fallos → open, 30s half-open)
- **Timeout**: Embedding 10s, Chat 30s, Qdrant 5s
- **Retry**: 3 intentos con backoff exponencial para OpenAI
- **Fallback**: OpenAI caído → FAQ Engine only → "Servicio temporalmente no disponible"

---

## 7. Document Service

### 7.1 Responsabilidad Única
Gestión del ciclo de vida de documentos: carga, validación automática, versionado, almacenamiento en MinIO y OCR para PDFs escaneados.

### 7.2 Endpoints REST

| Método | Ruta | Descripción | Auth | Roles |
|--------|------|-------------|------|-------|
| `POST` | `/documents/upload` | Subir documento (multipart) | Bearer JWT | ASEG, OPER, GESDOC |
| `GET` | `/documents/{id}` | Obtener metadatos de documento | Bearer JWT | Propietario/OPER/GESDOC |
| `GET` | `/documents/{id}/download` | Descargar documento (presigned URL) | Bearer JWT | Propietario/OPER/GESDOC |
| `GET` | `/documents/{id}/preview` | Vista previa en baja resolución | Bearer JWT | Propietario/OPER |
| `GET` | `/documents/{id}/versions` | Listar versiones del documento | Bearer JWT | Propietario/OPER |
| `DELETE` | `/documents/{id}` | Eliminar documento (soft) | Bearer JWT | Propietario/SADM |
| `GET` | `/documents/search` | Búsqueda por metadatos (nombre, tipo, fecha) | Bearer JWT | GESDOC, SADM |
| `POST` | `/documents/validate` | Validar documento sin guardar | Bearer JWT | ASEG |
| `GET` | `/documents/categories` | Listar categorías documentales | Bearer JWT | GESDOC, SADM |
| `POST` | `/documents/categories` | Crear categoría | Bearer JWT | GESDOC, SADM |

### 7.3 Estados del Documento

```mermaid
stateDiagram-v2
    [*] --> SUBIENDO: Upload iniciado
    SUBIENDO --> VALIDANDO: Archivo recibido
    VALIDANDO --> APROBADO: Validación exitosa
    VALIDANDO --> RECHAZADO: Validación falla
    VALIDANDO --> REVISION_MANUAL: Validación ambigua
    REVISION_MANUAL --> APROBADO: Gestor aprueba
    REVISION_MANUAL --> RECHAZADO: Gestor rechaza
    APROBADO --> [*]
    RECHAZADO --> [*]
```

### 7.4 Eventos

| Evento | Tipo | Descripción | Consumers |
|--------|------|-------------|-----------|
| `document.uploaded` | RabbitMQ | Documento subido exitosamente | document-service (OCR) |
| `document.validated` | RabbitMQ | Validación completada | procedure-service |
| `document.rejected` | RabbitMQ | Documento rechazado | notification |
| `document.ocr_completed` | RabbitMQ | OCR completado | chatbot-service (re-index) |

### 7.5 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DOCUMENT_DB_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `MINIO_ENDPOINT` | MinIO endpoint | `minio:9000` |
| `MINIO_ACCESS_KEY` | MinIO access key | - |
| `MINIO_SECRET_KEY` | MinIO secret key | - |
| `MINIO_BUCKET_DOCUMENTS` | Bucket principal de documentos | `essalud-documents` |
| `MINIO_BUCKET_TEMP` | Bucket de archivos temporales | `essalud-temp-uploads` |
| `MINIO_PRESIGNED_EXPIRY` | Expiración presigned URL (min) | `60` |
| `MAX_FILE_SIZE_MB` | Tamaño máximo de archivo | `10` |
| `ALLOWED_EXTENSIONS` | Formatos permitidos | `pdf,jpg,jpeg,png` |
| `OCR_ENABLED` | Habilitar OCR | `true` |
| `TESSERACT_LANG` | Idioma para OCR | `spa` |

---

## 8. Diagrama de Dependencias entre Servicios

```mermaid
graph TD
    subgraph "Frontend"
        FL[Flutter App]
        DW[Dashboard Web]
    end

    subgraph "API Gateway"
        GW[API Gateway]
    end

    subgraph "Microservicios Core"
        AS[auth-service]
        US[user-service]
        NS[news-service]
        PS[procedure-service]
        DS[document-service]
        CS[chatbot-service]
    end

    subgraph "Infraestructura"
        PG[(PostgreSQL)]
        RE[(Redis)]
        QD[(Qdrant)]
        MI[(MinIO)]
        RM[RabbitMQ]
    end

    subgraph "Externo"
        OA[OpenAI]
        RN[RENIEC]
        SM[SMTP]
    end

    FL --> GW
    DW --> GW
    GW --> AS
    GW --> US
    GW --> NS
    GW --> PS
    GW --> DS
    GW --> CS

    AS --> PG
    US --> PG
    NS --> PG
    PS --> PG
    DS --> PG
    CS --> PG

    AS --> RE
    PS --> RE
    CS --> RE

    CS --> QD
    DS --> MI

    AS --> RM
    PS --> RM
    DS --> RM
    CS --> RM

    AS --> RN
    AS --> SM
    CS --> OA

    PS -.-> AS
    US -.-> AS
    DS -.-> PS
    CS -.-> DS
```

### Leyenda de Dependencias
- `-->` conexión directa
- `-.->` dependencia de datos de otro servicio (vía API interna o eventos)

---

## 9. Estrategia de Resiliencia General

| Técnica | Aplicación | Configuración |
|---------|-----------|---------------|
| **Retry** | Llamadas a externos (OpenAI, RENIEC) | 3 intentos, backoff exponencial (1s, 2s, 4s) |
| **Circuit Breaker** | OpenAI API, RENIEC API | 5 fallos → open, 30s → half-open, 3 éxitos → close |
| **Timeout** | Todas las llamadas HTTP externas | Embedding: 10s, Chat: 30s, RENIEC: 5s, MinIO: 10s |
| **Bulkhead** | Worker pool para embedding/Chat | Máximo 10 requests concurrentes a OpenAI |
| **Fallback** | Chatbot cuando OpenAI falla | FAQ Engine only + mensaje de servicio limitado |
| **Cache** | Resultados frecuentes | Redis: FAQ 1h, tipos trámite 24h, noticias 5min |
| **Idempotency** | Creación de trámites, upload | Idempotency-Key header, 24h de validez |
| **Health Checks** | Todos los servicios | `/health` endpoint, readiness/liveness probes |
| **Graceful Shutdown** | Todos los servicios | Espera hasta 30s para requests en curso |
| **Rate Limiting** | API Gateway + Auth Service | 30 req/min por IP (público), 100 req/min (autenticado) |

---

## 10. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[04_ARQUITECTURA_C4.md]] | Diagrama de contenedores y componentes |
| [[03_DESIGN_DETALLADO.md]] | ADR y patrones de diseño |
| [[17_DOCKER_COMPOSE.md]] | Configuración Docker de cada servicio |
| [[18_OPENAPI_SWAGGER.md]] | Especificación OpenAPI de endpoints |
| [[11_RAG_QDRANT.md]] | Detalle del servicio chatbot y RAG |

---

#microservicios #essalud #backend #api #v1.0
