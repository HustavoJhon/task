# OPENAPI / SWAGGER - Especificación de API EsSalud v1.0 Empresarial

## 1. Convenciones de la API

### 1.1 Versioning
- **Base URL:** `https://api.essalud.gob.pe/v1`
- **Header:** `Accept: application/json`
- **Formato:** URL path versioning (`/v1/...`)
- **Deprecación:** Versiones anteriores soportadas 6 meses post lanzamiento

### 1.2 Paginación
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 156,
    "total_pages": 8,
    "has_next": true,
    "has_previous": false
  }
}
```
- **Parámetros:** `?page=1&page_size=20`
- **Page size máximo:** 100
- **Default:** 20

### 1.3 Headers Requeridos

| Header | Descripción | Requerido |
|--------|-------------|:---------:|
| `Content-Type` | `application/json` | ✅ |
| `Accept` | `application/json` | ✅ |
| `Authorization` | `Bearer {jwt_token}` | Para endpoints autenticados |
| `X-Idempotency-Key` | UUID v4 para idempotencia | POST/PUT (recomendado) |
| `X-Request-Id` | UUID v4 para correlación | Todos (recomendado) |

### 1.4 Formato de Error Estándar

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación en los datos enviados",
    "details": [
      {
        "field": "email",
        "message": "El email no tiene un formato válido",
        "code": "INVALID_FORMAT"
      }
    ],
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-06-12T10:30:00Z"
  }
}
```

| Código HTTP | Error Code | Significado |
|:-----------:|------------|-------------|
| 400 | `VALIDATION_ERROR` | Datos de entrada inválidos |
| 401 | `UNAUTHORIZED` | Token faltante o inválido |
| 403 | `FORBIDDEN` | No tienes permisos |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | Conflicto (ej: duplicado) |
| 422 | `UNPROCESSABLE_ENTITY` | Datos semánticamente inválidos |
| 429 | `RATE_LIMITED` | Demasiadas solicitudes |
| 500 | `INTERNAL_ERROR` | Error interno del servidor |
| 502 | `BAD_GATEWAY` | Error en servicio externo |
| 503 | `SERVICE_UNAVAILABLE` | Servicio temporalmente no disponible |

---

## 2. Especificación de Endpoints

### 2.1 Auth Endpoints

#### POST /v1/auth/register
```
Registro de nuevo asegurado

Request Body:
{
  "dni": "12345678",
  "email": "maria@example.com",
  "phone": "999888777",
  "password": "SecurePass123!",
  "full_name": "María Pérez López",
  "accept_terms": true
}

Response 201:
{
  "id": 42,
  "dni": "12345678",
  "email": "maria@example.com",
  "full_name": "María Pérez López",
  "role": "ASEG",
  "created_at": "2025-06-12T10:30:00Z",
  "message": "Cuenta creada. Verifica tu email."
}

Response 400:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación",
    "details": [
      {"field": "dni", "message": "El DNI debe tener 8 dígitos", "code": "INVALID_LENGTH"}
    ]
  }
}
```

#### POST /v1/auth/login
```
Inicio de sesión

Request Body:
{
  "email": "maria@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJl...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": 42,
    "dni": "12345678",
    "email": "maria@example.com",
    "full_name": "María Pérez López",
    "role": "ASEG"
  }
}

Response 401:
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Credenciales inválidas"
  }
}
```

#### POST /v1/auth/refresh
```
Renovación de token de acceso

Request Body:
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJl..."
}

Response 200:
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

#### POST /v1/auth/logout
```
Cierre de sesión (invalida token)

Headers:
  Authorization: Bearer {access_token}

Response 200:
{
  "message": "Sesión cerrada exitosamente"
}
```

#### POST /v1/auth/forgot-password
```
Solicitar recuperación de contraseña

Request Body:
{
  "email": "maria@example.com"
}

Response 200:
{
  "message": "Si el email está registrado, recibirás un link de recuperación"
}
```

### 2.2 Chatbot Endpoints

#### POST /v1/chat/message
```
Enviar mensaje al chatbot

Headers:
  Authorization: Bearer {access_token}

Request Body:
{
  "session_id": 15,
  "question": "¿Cuáles son los requisitos para afiliar a mi cónyuge?"
}

Response 200 (FAQ):
{
  "session_id": 15,
  "response": "Los requisitos para afiliar a tu cónyuge son: 1) DNI de ambos cónyuges...",
  "type": "faq",
  "confidence": 0.92,
  "sources": [],
  "suggest_escalation": false
}

Response 200 (RAG):
{
  "session_id": 15,
  "response": "Para afiliar a tu cónyuge debes presentar...",
  "type": "rag",
  "confidence": 0.85,
  "sources": [
    {
      "document_name": "Guía de Afiliaciones EsSalud 2024",
      "page_number": 5,
      "snippet": "Documentos requeridos para afiliación del cónyuge: DNI original..."
    }
  ],
  "suggest_escalation": false
}

Response 200 (Escalamiento):
{
  "session_id": 15,
  "response": "No encontré información específica...",
  "type": "no_result",
  "confidence": 0.0,
  "sources": [],
  "suggest_escalation": true
}
```

#### GET /v1/chat/history/{session_id}
```
Obtener historial de una sesión de chat

Headers:
  Authorization: Bearer {access_token}

Response 200:
{
  "session_id": 15,
  "title": "Requisitos afiliación cónyuge",
  "created_at": "2025-06-12T10:00:00Z",
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "¿Cuáles son los requisitos para afiliar a mi cónyuge?",
      "created_at": "2025-06-12T10:00:00Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Los requisitos son...",
      "type": "faq",
      "confidence": 0.92,
      "sources": [],
      "created_at": "2025-06-12T10:00:02Z"
    }
  ]
}
```

#### DELETE /v1/chat/session/{session_id}
```
Eliminar una sesión de chat

Response 200:
{
  "message": "Sesión eliminada"
}
```

### 2.3 Procedures Endpoints

#### GET /v1/procedures
```
Listar trámites (operador/supervisor)

Headers:
  Authorization: Bearer {access_token}

Query Parameters:
  page: int (default 1)
  page_size: int (default 20)
  status: string (opcional)
  type: string (opcional)
  search: string (opcional, búsqueda por DNI)

Response 200:
{
  "data": [
    {
      "id": 123,
      "user": {"id": 42, "dni": "12345678", "full_name": "María Pérez"},
      "procedure_type": {"id": 1, "name": "Afiliación Cónyuge"},
      "status": "PENDIENTE",
      "created_at": "2025-06-10T09:00:00Z",
      "days_pending": 2
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 45,
    "total_pages": 3
  }
}
```

#### GET /v1/procedures/my
```
Listar trámites del asegurado autenticado

Response 200: (misma estructura que /v1/procedures)
```

#### POST /v1/procedures
```
Crear nuevo trámite

Headers:
  Authorization: Bearer {access_token}
  X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

Request Body:
{
  "procedure_type_id": 1,
  "data": {
    "conyuge_dni": "87654321",
    "conyuge_full_name": "Carlos López García",
    "fecha_matrimonio": "2020-03-15"
  }
}

Response 201:
{
  "id": 123,
  "procedure_type": {"id": 1, "name": "Afiliación Cónyuge"},
  "status": "BORRADOR",
  "created_at": "2025-06-12T10:30:00Z"
}
```

#### GET /v1/procedures/{id}
```
Obtener detalle de trámite

Response 200:
{
  "id": 123,
  "user": {"id": 42, "dni": "12345678", "full_name": "María Pérez"},
  "procedure_type": {"id": 1, "code": "AFILIACION_CONYUGE", "name": "Afiliación Cónyuge"},
  "status": "EN_REVISION",
  "data": {
    "conyuge_dni": "87654321",
    "conyuge_full_name": "Carlos López García"
  },
  "current_assignee": {"id": 10, "full_name": "Carlos Reyes"},
  "documents": [
    {"id": 50, "file_name": "DNI_asegurada.pdf", "status": "APROBADO"},
    {"id": 51, "file_name": "Acta_matrimonio.pdf", "status": "APROBADO"}
  ],
  "history": [
    {"from_status": "BORRADOR", "to_status": "PENDIENTE", "changed_at": "2025-06-10T09:30:00Z"},
    {"from_status": "PENDIENTE", "to_status": "EN_REVISION", "changed_at": "2025-06-11T08:00:00Z"}
  ],
  "created_at": "2025-06-10T09:00:00Z",
  "updated_at": "2025-06-11T08:00:00Z"
}
```

#### POST /v1/procedures/{id}/submit
```
Enviar trámite a revisión

Response 200:
{
  "id": 123,
  "status": "PENDIENTE",
  "message": "Trámite enviado a revisión"
}
```

#### POST /v1/procedures/{id}/approve
```
Aprobar trámite (operador)

Request Body:
{
  "comment": "Documentos cumplen con todos los requisitos"
}

Response 200:
{
  "id": 123,
  "status": "APROBADO",
  "completed_at": "2025-06-12T10:30:00Z"
}
```

#### POST /v1/procedures/{id}/reject
```
Rechazar trámite (operador)

Request Body:
{
  "comment": "El acta de matrimonio no es legible. Favor de subir una copia clara."
}

Response 200:
{
  "id": 123,
  "status": "RECHAZADO",
  "message": "Trámite rechazado. Se notificó al asegurado."
}
```

#### POST /v1/procedures/{id}/request-subsanacion
```
Solicitar subsanación

Request Body:
{
  "comment": "Los siguientes documentos requieren corrección: Acta de matrimonio ilegible"
}

Response 200:
{
  "id": 123,
  "status": "SUBSANACION",
  "subsanacion_deadline": "2025-06-27T10:30:00Z"
}
```

#### POST /v1/procedures/{id}/subsanar
```
Enviar subsanación (asegurado)

Request Body:
{
  "comment": "Adjunto nueva copia del acta de matrimonio legible"
}

Response 200:
{
  "id": 123,
  "status": "EN_REVISION",
  "message": "Subsanación recibida. El trámite será revisado nuevamente."
}
```

### 2.4 Documents Endpoints

#### POST /v1/documents/upload
```
Subir documento

Headers:
  Authorization: Bearer {access_token}
  Content-Type: multipart/form-data

Request Body (multipart):
  file: (archivo PDF/JPG/PNG)
  procedure_id: 123
  document_type: "ACTA_MATRIMONIO"

Response 202:
{
  "id": 52,
  "file_name": "acta_matrimonio.pdf",
  "file_size": 245760,
  "status": "VALIDANDO",
  "message": "Documento recibido. Procesando validación..."
}
```

#### GET /v1/documents/{id}
```
Obtener metadatos de documento

Response 200:
{
  "id": 52,
  "file_name": "acta_matrimonio.pdf",
  "file_type": "pdf",
  "file_size": 245760,
  "status": "APROBADO",
  "current_version": 1,
  "page_count": 2,
  "checksum_sha256": "a1b2c3d4e5f6...",
  "created_at": "2025-06-12T10:30:00Z",
  "versions": [
    {"version": 1, "created_at": "2025-06-12T10:30:00Z", "file_size": 245760}
  ]
}
```

#### GET /v1/documents/{id}/download
```
Descargar documento (presigned URL)

Response 200:
{
  "download_url": "https://minio.essalud.gob.pe/essalud-documents/...?X-Amz-Algorithm=...",
  "expires_in": 3600,
  "file_name": "acta_matrimonio.pdf"
}
```

### 2.5 News Endpoints

#### GET /v1/news
```
Listar noticias públicas

Query Parameters:
  page: int
  category_id: int (opcional)
  search: string (opcional)

Response 200:
{
  "data": [
    {
      "id": 1,
      "title": "Nuevos horarios de atención EsSalud",
      "summary": "A partir de junio, los horarios...",
      "image_url": "https://api.essalud.gob.pe/static/news/horarios.jpg",
      "category": {"id": 1, "name": "Comunicados"},
      "published_at": "2025-06-10T08:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### GET /v1/news/{id}
```
Detalle de noticia

Response 200:
{
  "id": 1,
  "title": "Nuevos horarios de atención EsSalud",
  "content": "A partir del 1 de junio de 2025...",
  "image_url": "...",
  "category": {"id": 1, "name": "Comunicados"},
  "author": "Oficina de Comunicaciones",
  "published_at": "2025-06-10T08:00:00Z"
}
```

#### POST /v1/news (Admin)
```
Crear noticia

Request Body:
{
  "title": "Nuevos horarios de atención EsSalud",
  "summary": "A partir de junio...",
  "content": "A partir del 1 de junio de 2025...",
  "category_id": 1,
  "published_at": "2025-06-10T08:00:00Z"
}
```

### 2.6 Admin Endpoints

#### GET /v1/admin/metrics
```
Obtener métricas del sistema

Headers:
  Authorization: Bearer {access_token} (SUPV, SADM)

Query Parameters:
  period: string (today, week, month)

Response 200:
{
  "procedures": {
    "created_today": 23,
    "pending": 45,
    "approved_today": 12,
    "avg_resolution_days": 2.3
  },
  "chatbot": {
    "total_queries_today": 156,
    "faq_resolved": 111,
    "rag_resolved": 45,
    "avg_response_time_ms": 1850,
    "feedback_positive_rate": 0.89
  },
  "users": {
    "total": 1234,
    "active_last_24h": 567,
    "new_today": 23
  },
  "documents": {
    "total_indexed": 450,
    "pending_validation": 5,
    "avg_processing_time_s": 12.5
  }
}
```

#### GET /v1/admin/users
```
Listar usuarios del sistema (admin)

Response 200:
{
  "data": [
    {
      "id": 1,
      "dni": "12345678",
      "email": "admin@essalud.gob.pe",
      "full_name": "Luis Admin",
      "role": "SADM",
      "is_active": true,
      "last_login": "2025-06-12T08:00:00Z",
      "created_at": "2025-01-15T00:00:00Z"
    }
  ]
}
```

#### GET /v1/admin/audit-log
```
Obtener log de auditoría

Query Parameters:
  from: datetime
  to: datetime
  user_id: int (opcional)
  action: string (opcional)
  page: int

Response 200:
{
  "data": [
    {
      "id": 1000,
      "timestamp": "2025-06-12T10:30:00Z",
      "user": {"id": 1, "full_name": "Luis Admin"},
      "action": "procedure:APPROVE",
      "resource_type": "procedure",
      "resource_id": 123,
      "details": {"from_status": "EN_REVISION", "to_status": "APROBADO"},
      "ip_address": "192.168.1.100"
    }
  ]
}
```

---

## 3. Schemas Reutilizables

### User
```json
{
  "id": 42,
  "dni": "12345678",
  "email": "maria@example.com",
  "phone": "999888777",
  "full_name": "María Pérez López",
  "role": "ASEG",
  "is_active": true,
  "email_verified": true,
  "created_at": "2025-06-12T10:30:00Z"
}
```

### Procedure
```json
{
  "id": 123,
  "procedure_type": {"id": 1, "name": "Afiliación Cónyuge"},
  "status": "PENDIENTE",
  "data": {},
  "current_assignee": null,
  "documents": [],
  "history": [],
  "created_at": "2025-06-10T09:00:00Z",
  "updated_at": "2025-06-11T08:00:00Z"
}
```

### Document
```json
{
  "id": 52,
  "file_name": "acta_matrimonio.pdf",
  "file_type": "pdf",
  "file_size": 245760,
  "status": "APROBADO",
  "current_version": 1,
  "page_count": 2,
  "checksum_sha256": "a1b2c3d4e5f6...",
  "created_at": "2025-06-12T10:30:00Z"
}
```

### Error
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": [],
    "request_id": "uuid",
    "timestamp": "2025-06-12T10:30:00Z"
  }
}
```

### Pagination
```json
{
  "page": 1,
  "page_size": 20,
  "total_items": 156,
  "total_pages": 8,
  "has_next": true,
  "has_previous": false
}
```

---

## 4. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[05_MICROSERVICIOS.md]] | Endpoints por servicio |
| [[16_FLUTTER_ESTRUCTURA.md]] | Consumo de APIs desde Flutter |
| [[17_DOCKER_COMPOSE.md]] | Exposición de servicios |
| [[21_SEGURIDAD_AUDITORIA.md]] | Seguridad de APIs |

---

#openapi #swagger #api #rest #essalud #v1.0
