# DIAGRAMAS DE SECUENCIA - EsSalud v1.0 Empresarial

## DS-01: Login Completo

```mermaid
sequenceDiagram
    participant FA as Flutter App
    participant NG as Nginx
    participant GW as API Gateway
    participant AS as Auth Service
    participant PG as PostgreSQL
    participant RE as Redis
    participant SM as SMTP

    FA->>NG: POST /auth/login {email, password}
    NG->>GW: Forward request
    GW->>GW: Rate limit check (IP)
    GW->>AS: POST /auth/login
    
    AS->>PG: SELECT * FROM users WHERE email=$1
    PG-->>AS: User data (or null)
    
    alt User not found
        AS-->>FA: 401 Invalid credentials
    else User found
        AS->>AS: Verify password (bcrypt)
        
        alt Wrong password
            AS->>PG: UPDATE failed_login_attempts +1
            PG-->>AS: Attempt count
            
            alt Locked after 5 attempts
                AS->>PG: UPDATE locked_until = NOW() + 30min
                AS-->>FA: 423 Account locked
            else
                AS-->>FA: 401 Invalid credentials
            end
        else Password correct
            AS->>AS: Reset failed_login_attempts = 0
            AS->>AS: Generate JWT (RS256) + Refresh Token
            AS->>RE: SET session:{user_id} {session_data} TTL 7200
            AS->>PG: INSERT INTO sessions {user_id, jti, ...}
            AS->>SM: Send email notification (optional)
            AS-->>GW: 200 {access_token, refresh_token, user}
            GW-->>FA: 200 {access_token, refresh_token, user}
            FA->>FA: Store tokens securely
        end
    end
```

---

## DS-02: Consulta Chatbot vía FAQ

```mermaid
sequenceDiagram
    participant FA as Flutter App
    participant GW as API Gateway
    participant CS as Chatbot Service
    participant RE as Redis
    participant PG as PostgreSQL

    FA->>GW: POST /chat/message {question, session_id?}
    GW->>GW: Auth + Rate limit checks
    GW->>CS: Forward to chatbot service
    
    CS->>CS: Generate embedding (pregunta)
    Note over CS: OpenAI text-embedding-3-small
    
    CS->>RE: Vector search FAQ cache (threshold 0.85)
    
    alt FAQ match found (confidence > 0.85)
        RE-->>CS: FAQ match {question, answer, category}
        CS->>CS: Build response from FAQ
        CS->>PG: INSERT chat_message {role: user, content: question}
        CS->>PG: INSERT chat_message {role: assistant, content: faq.answer, type: faq}
        CS-->>GW: 200 {response: faq.answer, type: "faq", confidence: 0.92}
        GW-->>FA: Response with FAQ answer
        FA->>FA: Show answer in chat bubble
    else No FAQ match
        Note over CS: Fallback to RAG Engine
        CS-->>GW: 200 {response: ..., type: "rag"}
        GW-->>FA: RAG response (see DS-03)
    end
```

---

## DS-03: Consulta Chatbot vía RAG

```mermaid
sequenceDiagram
    participant FA as Flutter App
    participant GW as API Gateway
    participant CS as Chatbot Service
    participant QD as Qdrant
    participant OP as OpenAI
    participant PG as PostgreSQL

    FA->>GW: POST /chat/message {question}
    GW->>CS: Forward request
    
    CS->>OP: POST /v1/embeddings {model, input: question}
    OP-->>CS: embedding vector (1536 dimensions)
    
    CS->>QD: Search collection essalud_documents
    Note over CS: top_k=5, threshold=0.75, with_payload=true
    QD-->>CS: Top-5 chunks {text, doc_name, page, score}
    
    alt similarity > 0.75
        CS->>CS: Build prompt with context (5 chunks)
        Note over CS: System: Eres un asistente de EsSalud...
        Note over CS: User: Contexto: [chunks]... Pregunta: [question]
        
        CS->>OP: POST /v1/chat/completions
        Note over CS: model=gpt-4o-mini, temp=0.3
        OP-->>CS: Response with citations
        
        CS->>CS: Extract citations from response
        CS->>CS: Calculate confidence score
        
        alt confidence > 0.6
            CS-->>GW: 200 {response, sources, confidence}
        else low confidence
            CS-->>GW: 200 {response, sources, confidence, suggest_escalation: true}
        end
        
        CS->>PG: INSERT chat_messages (user + assistant)
        CS->>PG: UPDATE chat_sessions message_count
        
        GW-->>FA: Final response with citations
    else No relevant chunks
        CS-->>FA: 200 {response: "No encontré información...", type: "no_result"}
    end
```

---

## DS-04: Creación de Trámite + Subida de Documento a MinIO

```mermaid
sequenceDiagram
    participant FA as Flutter App
    participant GW as API Gateway
    participant PS as Procedure Service
    participant DS as Document Service
    participant MI as MinIO
    participant PG as PostgreSQL

    FA->>GW: POST /procedures {type, data}
    Note over FA: Incluye JWT en Authorization header
    GW->>GW: Validate JWT
    GW->>PS: Create procedure
    
    PS->>PG: INSERT INTO procedures (user_id, type, data, status='BORRADOR')
    PG-->>PS: Procedure created {id: 123}
    PS-->>GW: 201 {id: 123, status: 'BORRADOR'}
    GW-->>FA: 201 {id: 123}
    
    FA->>FA: User selects documents to upload
    
    FA->>GW: GET /documents/upload-url {procedure_id, file_name, file_type}
    GW->>DS: Request presigned upload URL
    
    DS->>MI: PUT /essalud-temp-uploads/{uuid}.pdf
    Note over DS: Presigned URL with 15min expiry
    MI-->>DS: presigned_url
    
    DS-->>GW: 200 {presigned_url, document_id}
    GW-->>FA: presigned_url
    
    FA->>MI: PUT file directly using presigned URL
    Note over FA,MI: Direct upload to MinIO (no gateway)
    MI-->>FA: 200 Upload success
    
    FA->>GW: POST /procedures/123/submit
    GW->>PS: Submit procedure
    
    PS->>PS: Validate all required documents present
    PS->>PG: UPDATE procedures SET status='PENDIENTE'
    PS->>PG: INSERT procedure_history (from=BORRADOR, to=PENDIENTE)
    PS-->>GW: 200 {status: 'PENDIENTE'}
    GW-->>FA: Trámite enviado a revisión
```

---

## DS-05: Aprobación de Trámite por Operador + Notificación

```mermaid
sequenceDiagram
    participant DW as Dashboard Web
    participant GW as API Gateway
    participant PS as Procedure Service
    participant PG as PostgreSQL
    participant NS as Notification Service
    participant EM as Email (SMTP)

    DW->>GW: GET /procedures?status=PENDIENTE
    GW->>PS: List pending procedures
    
    PS->>PG: SELECT * FROM procedures WHERE status_id=PENDIENTE
    PG-->>PS: List of pending procedures
    PS-->>DW: 200 [{id, type, user, created_at}]
    
    DW->>GW: GET /procedures/123 (detalle)
    GW->>PS: Get procedure detail
    PS->>PG: SELECT procedure + documents + history
    PG-->>PS: Full procedure data
    PS-->>DW: 200 {procedure, documents, history}
    
    DW->>DW: Operator reviews documents
    
    DW->>GW: POST /procedures/123/approve {comment: "Documentos OK"}
    GW->>PS: Approve procedure
    
    PS->>PG: UPDATE procedures SET status='APROBADO', completed_at=NOW()
    PS->>PG: INSERT procedure_history (from=EN_REVISION, to=APROBADO)
    PS->>PS: Publish event procedure.approved
    
    PS-->>GW: 200 {status: 'APROBADO'}
    GW-->>DW: 200 Success
    
    Note over PS,EM: Async notification via RabbitMQ
    PS->>NS: Event: procedure.approved {procedure_id, user_id}
    NS->>PG: INSERT notification {user_id, type, title, body}
    NS->>EM: Send email to user
    NS->>DW: Realtime update (WebSocket if available)
    EM-->>User: Email: "Tu trámite #123 ha sido aprobado"
```

---

## DS-06: Ingestión de PDF (Upload → Chunk → Embed → Qdrant)

```mermaid
sequenceDiagram
    participant DW as Dashboard Web
    participant GW as API Gateway
    participant DS as Document Service
    participant MI as MinIO
    participant CE as Celery Worker
    participant TC as Tesseract OCR
    participant OP as OpenAI
    participant QD as Qdrant

    DW->>GW: POST /documents/upload {file, title, category, source}
    GW->>DS: Upload document
    
    DS->>MI: PUT /essalud-pdfs-source/{category}/{doc_id}.pdf
    MI-->>DS: 201 Stored
    
    DS->>PG: INSERT INTO documents {id, file_name, status='SUBIENDO'}
    DS->>PG: INSERT INTO document_versions {doc_id, version=1}
    DS-->>GW: 202 Accepted {document_id}
    GW-->>DW: 202 Documento recibido, procesando...
    
    Note over DS,QD: Async processing via Celery
    DS->>CE: Task: process_document(document_id)
    CE->>DS: GET /documents/{id}/download (presigned URL)
    DS->>MI: GET presigned URL for download
    MI-->>DS: Document file
    
    CE->>CE: Extract text with PyMuPDF
    
    alt PDF is scanned (no text layer)
        CE->>TC: OCR with Tesseract (Spanish)
        TC-->>CE: OCR text
    end
    
    CE->>CE: Clean text (remove headers, footers, artifacts)
    
    CE->>CE: Chunk text
    Note over CE: chunk_size=512 tokens, overlap=64
    
    CE->>OP: POST /v1/embeddings for each chunk
    OP-->>CE: Embedding vectors
    
    CE->>QD: UPSERT points to collection essalud_documents
    Note over CE: point_id = {doc_id}_{chunk_index}
    Note over CE: vector = embedding
    Note over CE: payload = {doc_id, chunk_index, text, page, source_url}
    QD-->>CE: 201 Indexed
    
    CE->>PG: UPDATE documents SET status='APROBADO', ocr_text=...
    CE->>PG: INSERT document_embeddings for each chunk
    
    CE->>DS: Webhook: processing complete
    DS-->>DW: Notification: Documento indexado exitosamente
```

---

## DS-07: Refresh Token

```mermaid
sequenceDiagram
    participant FA as Flutter App
    participant GW as API Gateway
    participant AS as Auth Service
    participant RE as Redis
    participant PG as PostgreSQL

    Note over FA: Access token about to expire
    FA->>FA: Check token expiry (automatic)
    
    FA->>GW: POST /auth/refresh {refresh_token}
    GW->>AS: Refresh token
    
    AS->>AS: Hash refresh token (SHA-256)
    AS->>PG: SELECT FROM refresh_tokens WHERE token_hash=$1
    PG-->>AS: Token record
    
    alt Token valid (not expired, not revoked)
        AS->>AS: Generate new JWT access token (24h)
        AS->>RE: UPDATE session:{user_id} with new jti
        AS-->>GW: 200 {access_token: new_jwt, expires_in: 86400}
        GW-->>FA: New access token
        FA->>FA: Replace stored token
    else Token expired or revoked
        AS-->>GW: 401 refresh_token_expired
        GW-->>FA: 401 Must re-login
        FA->>FA: Redirect to login screen
    end
```

---

## DS-08: Flujo de Auditoría (Acción → Audit Log → Loki)

```mermaid
sequenceDiagram
    participant US as User Service
    participant PG as PostgreSQL
    participant MO as Monitoring
    participant LO as Loki
    participant DW as Dashboard Web

    Note over US: User creates a role (SUPV)
    US->>US: Role created successfully
    US->>US: Build audit event
    
    US->>PG: INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, ip_address)
    Note over US: action="role:CREATE", details={role_name, permissions, ...}
    PG-->>US: Audit event stored
    
    US->>MO: Structured JSON log to stdout
    Note over US: {"severity":"INFO", "service":"user-service", "action":"role:CREATE", "user_id":1, "timestamp":"2025-06-12T10:30:00Z"}
    
    MO->>LO: Push log entry (Promtail / Fluentd)
    LO-->>MO: Log indexed
    
    Note over DW: Supervisor requests audit log
    DW->>US: GET /admin/audit-log?action=role:CREATE&from=2025-06-01
    
    US->>PG: SELECT FROM audit_log WHERE action='role:CREATE' AND created_at > '2025-06-01'
    PG-->>US: Audit records
    
    US-->>DW: 200 [{timestamp, user, action, details}]
    DW->>DW: Display in audit dashboard
    
    alt Security event (CRITICAL)
        Note over US: If action is security critical (e.g., role:CREATE by unauthorized user)
        US->>US: Send alert to monitoring
        MO->>MO: Trigger alert rule
        Note over MO: Alert: "Permiso crítico asignado"
    end
```

---

## 3. Tabla Resumen de Diagramas

| ID | Diagrama | Actores | Servicios Involucrados | Complejidad |
|:--:|----------|:-------:|:----------------------:|:-----------:|
| DS-01 | Login completo | FA, NG, GW, AS, PG, RE, SM | 6 servicios | Alta |
| DS-02 | Consulta FAQ | FA, GW, CS, RE, PG | 4 servicios | Media |
| DS-03 | Consulta RAG | FA, GW, CS, QD, OP, PG | 5 servicios | Alta |
| DS-04 | Creación trámite + upload | FA, GW, PS, DS, MI, PG | 5 servicios | Alta |
| DS-05 | Aprobación + notificación | DW, GW, PS, PG, NS, EM | 5 servicios | Alta |
| DS-06 | Ingestión PDF | DW, GW, DS, MI, CE, TC, OP, QD | 7 servicios | Muy Alta |
| DS-07 | Refresh token | FA, GW, AS, RE, PG | 4 servicios | Media |
| DS-08 | Auditoría | US, PG, MO, LO, DW | 4 servicios | Media |

---

## 4. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[09_CASOS_USO_UML.md]] | Casos de uso correspondientes |
| [[05_MICROSERVICIOS.md]] | Servicios participantes |
| [[11_RAG_QDRANT.md]] | Detalle del pipeline RAG (DS-03) |
| [[12_INGESTION_PDFS.md]] | Pipeline de ingestión (DS-06) |
| [[21_SEGURIDAD_AUDITORIA.md]] | Auditoría (DS-08) |

---

#diagramas #secuencia #uml #essalud #v1.0
