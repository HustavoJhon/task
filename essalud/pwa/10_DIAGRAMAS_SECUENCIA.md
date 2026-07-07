# 10. Diagramas de Secuencia — EsSalud (Laravel)

Este documento describe los flujos principales del sistema EsSalud mediante diagramas de secuencia en formato Mermaid. Cada diagrama representa la interacción entre los componentes del stack monolítico Laravel 11 + Livewire.

---

## 10.1 Registro de Usuario

```mermaid
sequenceDiagram
    actor Cliente
    participant Livewire as RegisterForm (Livewire Component)
    participant Controller as UserController
    participant Model as User Model
    participant DB as MySQL
    participant Event as Event/Dispatcher
    participant Listener as SendWelcomeEmail (Listener)
    participant Mail as Laravel Mail

    Cliente->>Livewire: Completa formulario + submit
    Livewire->>Livewire: validate() reglas
    Livewire->>Controller: create(request)
    Controller->>Controller: Hash::make(password)
    Controller->>Model: User::create(data)
    Model->>DB: INSERT INTO users
    DB-->>Model: user creado (id)
    Model-->>Controller: instancia User
    Controller->>Event: event(new UserRegistered($user))
    Event->>Listener: handle(UserRegistered $event)
    Listener->>Mail: Mail::to($user)->send(new WelcomeMail($user))
    Mail-->>Listener: enviado
    Controller-->>Livewire: redirect('/dashboard')
    Livewire-->>Cliente: Redirección a dashboard
```

**Explicación:**

1. El cliente llena el formulario de registro renderizado por el componente Livewire `RegisterForm`.
2. Livewire ejecuta validación en tiempo real (`$rules` en el componente) y en el servidor.
3. El `UserController::store()` recibe los datos validados, hashea la contraseña con `Hash::make()` y crea el registro mediante `User::create()`.
4. Se dispara el evento `UserRegistered` usando el sistema de eventos de Laravel.
5. El listener `SendWelcomeEmail` captura el evento y despacha un correo de bienvenida usando `Mail::to()` con un Mailable personalizado.
6. Finalmente se redirige al dashboard del usuario autenticado.

---

## 10.2 Login

```mermaid
sequenceDiagram
    actor Cliente
    participant Livewire as LoginForm (Livewire Component)
    participant Auth as AuthController
    participant Sanctum as Laravel Sanctum
    participant Session as Session Store
    participant DB as MySQL

    Cliente->>Livewire: Ingresa email + password + submit
    Livewire->>Livewire: validate()
    Livewire->>Auth: Auth::attempt(credentials)
    Auth->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Auth: user record
    Auth->>Auth: Hash::check(password, user.password)
    alt credenciales válidas
        Auth->>Sanctum: Generar token (si aplica SPA)
        Auth->>Session: session()->regenerate()
        Auth->>Session: auth()->login($user)
        Auth-->>Livewire: true
        Livewire-->>Cliente: redirect()->intended('/dashboard')
    else credenciales inválidas
        Auth-->>Livewire: false
        Livewire->>Livewire: addError('email', 'Credenciales inválidas')
        Livewire-->>Cliente: Mostrar error
    end
```

**Explicación:**

1. El componente Livewire `LoginForm` captura email y contraseña, los valida y llama a `Auth::attempt()`.
2. Laravel busca al usuario en MySQL, verifica el hash de la contraseña con `Hash::check()`.
3. Si las credenciales son válidas, se regenera la sesión (protección contra session fixation) y se loguea al usuario con `auth()->login()`.
4. Si es un SPA, se genera token de Sanctum. Luego se redirige al dashboard (`intended()` respeta la URL original si el usuario fue redirigido al login).
5. Si las credenciales fallan, Livewire agrega un error de validación que se muestra en tiempo real sin recargar la página.

---

## 10.3 Crear Trámite

```mermaid
sequenceDiagram
    actor Asegurado
    participant Livewire as ProcedureCreate (Livewire)
    participant Controller as ProcedureController
    participant Model as Procedure Model
    participant DB as MySQL
    participant Event as Event/Dispatcher
    participant Listener as NotifyOperator (Listener)
    participant Notif as Notification

    Asegurado->>Livewire: Llena datos del trámite + submit
    Livewire->>Livewire: validate()
    Livewire->>Controller: ProcedureController::store(request)
    Controller->>DB: BEGIN TRANSACTION
    Controller->>Model: Procedure::create([...datos...])
    Model->>DB: INSERT INTO procedures
    DB-->>Model: id
    Controller->>DB: COMMIT
    Controller->>Event: event(new ProcedureCreated($procedure))
    Event->>Listener: handle(ProcedureCreated $event)
    Listener->>Notif: Notification::send($operators, new NewProcedureNotification($procedure))
    Notif-->>Listener: notificaciones enviadas
    Controller-->>Livewire: redirect(route('procedures.show', $procedure))
    Livewire-->>Asegurado: Redirección a detalle del trámite
```

**Explicación:**

1. El asegurado completa el formulario en el componente Livewire `ProcedureCreate` que incluye tipo de trámite, descripción, documentos adjuntos.
2. Livewire valida los campos y llama al controlador `ProcedureController::store()`.
3. El controlador usa transacciones de base de datos (`DB::transaction()`) para garantizar atomicidad.
4. Se crea el registro `Procedure` con estado inicial `PENDIENTE` y se asocia al `user_id` del usuario autenticado.
5. Se dispara el evento `ProcedureCreated`. El listener `NotifyOperator` obtiene los operadores disponibles (rol `GESDOC`) y les envía una notificación usando el sistema de notificaciones de Laravel (puede ser database, mail, o broadcast).
6. El usuario es redirigido a la vista de detalle del trámite donde podrá hacer seguimiento.

---

## 10.4 Chatbot FAQ (Keyword Matching)

```mermaid
sequenceDiagram
    actor Asegurado
    participant Livewire as ChatComponent (Livewire)
    participant ChatService as ChatService
    participant FAQ as FAQ Model
    participant DB as MySQL

    Asegurado->>Livewire: Escribe mensaje + Enter
    Livewire->>Livewire: validate(['message' => 'required|string|max:500'])
    Livewire->>ChatService: processMessage($message)
    ChatService->>ChatService: matchKeywords(normalize($message))
    ChatService->>FAQ: FAQ::where('active', true)->get()
    FAQ->>DB: SELECT * FROM faqs WHERE active = 1
    DB-->>FAQ: colección FAQs
    ChatService->>ChatService: Calcular score por FAQ (keyword matching)
    alt score supera umbral (≥70%)
        ChatService->>ChatService: Seleccionar FAQ con mejor score
        ChatService-->>Livewire: ['type' => 'faq', 'answer' => $faq->answer, 'confidence' => $score]
    else score bajo umbral (<70%)
        ChatService->>ChatService: Fallback a pipeline RAG (ver 10.5)
        ChatService-->>Livewire: ['type' => 'rag', ...]
    end
    Livewire->>Livewire: Agregar respuesta al historial de chat
    Livewire-->>Asegurado: Renderizar respuesta en tiempo real
```

**Explicación:**

1. El asegurado escribe su consulta en el componente `ChatComponent` de Livewire.
2. El componente valida el mensaje y lo envía a `ChatService::processMessage()`.
3. `ChatService` primero normaliza el texto (lowercase, remover tildes, expandir abreviaturas comunes).
4. `matchKeywords()` itera sobre todas las FAQs activas y calcula un score basado en coincidencia de palabras clave. Cada FAQ tiene un campo `keywords` (JSON) con sinónimos y variantes.
5. Si el score supera el umbral del 70%, se devuelve la respuesta de la FAQ en tiempo real. Esto evita llamadas a OpenAI y reduce latencia.
6. Si el score es bajo, se escala automáticamente al pipeline RAG (diagrama 10.5).
7. La respuesta se agrega al array `$messages` del componente y se re-renderiza con scroll automático.

---

## 10.5 Chatbot RAG (Qdrant + OpenAI)

```mermaid
sequenceDiagram
    actor Asegurado
    participant Livewire as ChatComponent (Livewire)
    participant ChatService as ChatService
    participant QdrantService as QdrantService
    participant Qdrant as Qdrant Cloud
    participant OpenAIService as OpenAIService
    participant OpenAI as OpenAI API

    Asegurado->>Livewire: Escribe consulta compleja
    Livewire->>ChatService: processMessage($message)
    ChatService->>ChatService: matchKeywords() → bajo score
    ChatService->>OpenAIService: generateEmbedding($message)
    OpenAIService->>OpenAI: POST /v1/embeddings (text-embedding-3-small)
    OpenAI-->>OpenAIService: vector[1536]
    OpenAIService-->>ChatService: embedding array
    ChatService->>QdrantService: search(collection, $embedding, limit=5)
    QdrantService->>Qdrant: POST /collections/essalud_documents/points/search
    Qdrant-->>QdrantService: top 5 chunks con score
    QdrantService-->>ChatService: results[] (text, metadata, score)
    ChatService->>ChatService: buildPrompt($message, $contextChunks)
    ChatService->>OpenAIService: chatCompletion($systemPrompt, $userPrompt)
    OpenAIService->>OpenAI: POST /v1/chat/completions (gpt-4o-mini)
    OpenAI-->>OpenAIService: respuesta con citas
    OpenAIService-->>ChatService: respuesta texto
    ChatService->>ChatService: extractCitations($response)
    ChatService-->>Livewire: ['type' => 'rag', 'answer' => ..., 'sources' => [...]]
    Livewire->>Livewire: Registrar interacción en BD
    Livewire-->>Asegurado: Renderizar respuesta + fuentes
```

**Explicación:**

1. Cuando la consulta no encuentra match en FAQs (score <70%), `ChatService` inicia el pipeline RAG.
2. Primero genera el embedding del mensaje del usuario usando `OpenAIService::generateEmbedding()` con modelo `text-embedding-3-small` (1536 dimensiones).
3. El vector se envía a `QdrantService::search()` que consulta la colección `essalud_documents` por similitud coseno, recuperando los 5 chunks más relevantes.
4. `buildPrompt()` construye el prompt del sistema con instrucciones en español y adjunta los chunks como contexto.
5. Se llama a `OpenAIService::chatCompletion()` con `gpt-4o-mini` para generar la respuesta.
6. Se extraen las citas del response (formato `[Fuente: NombreDocumento]`) y se retornan junto con la respuesta.
7. Livewire registra la interacción en la tabla `chat_interactions` para analíticas posteriores.

---

## 10.6 Subir Documento + OCR Pipeline

```mermaid
sequenceDiagram
    actor Asegurado
    participant Livewire as DocumentUpload (Livewire)
    participant Controller as DocumentController
    participant MinIO as MinIO (Object Storage)
    participant DB as MySQL
    participant Queue as Redis Queue
    participant Worker as Queue Worker
    participant Tesseract as Tesseract OCR
    participant Job2 as GenerateEmbeddings Job
    participant Qdrant as Qdrant

    Asegurado->>Livewire: Selecciona archivo + submit
    Livewire->>Livewire: validate() [mimes, max:10240]
    Livewire->>Controller: upload(Request $request)
    Controller->>Controller: Generar nombre único (UUID + original)
    Controller->>MinIO: Storage::disk('s3')->putFileAs('documents', $file, $filename)
    MinIO-->>Controller: path en MinIO
    Controller->>DB: INSERT INTO documents ([...], status='PENDING_OCR')
    DB-->>Controller: document_id
    Controller->>Queue: ProcessOcr::dispatch($document)
    Controller-->>Livewire: response()->json(['id' => $document->id])
    Livewire-->>Asegurado: "Documento subido. Procesando..."

    Note over Worker, Tesseract: Procesamiento asíncrono
    Queue->>Worker: Pop ProcessOcr job
    Worker->>MinIO: Descargar archivo temporal
    MinIO-->>Worker: archivo local
    Worker->>Tesseract: exec('tesseract imagen output -l spa')
    Tesseract-->>Worker: texto extraído
    Worker->>DB: UPDATE documents SET ocr_text = ?, status = 'OCR_DONE'
    Worker->>Queue: GenerateEmbeddings::dispatch($document)
    Worker->>Worker: Marcar job completado

    Queue->>Worker: Pop GenerateEmbeddings job
    Worker->>Worker: chunkText($ocrText, 512, 64)
    Worker->>Worker: OpenAI::embedding(chunk) para cada chunk
    Worker->>DB: INSERT INTO document_embeddings (chunk, embedding, ...)
    Worker->>Qdrant: upsertPoints(collection, chunks_con_embedding)
    Qdrant-->>Worker: confirmado
    Worker->>DB: UPDATE documents SET status = 'INDEXED'
```

**Explicación:**

1. El asegurado sube un documento mediante el componente Livewire `DocumentUpload` con soporte drag-and-drop (Dropzone.js).
2. Se valida tipo MIME, extensión y tamaño máximo (10MB). El archivo se almacena en MinIO usando el filesystem de Laravel con driver S3.
3. El registro se crea en MySQL con estado `PENDING_OCR` y se despacha el job `ProcessOcr` a la cola de Redis.
4. El worker descarga el archivo de MinIO y ejecuta Tesseract OCR (`thiagoalessio/tesseract_ocr`) en español para extraer texto.
5. El texto extraído se guarda en `documents.ocr_text` y se despacha un segundo job: `GenerateEmbeddings`.
6. `GenerateEmbeddings` divide el texto en chunks de 512 tokens con solapamiento de 64, genera embeddings con OpenAI y los almacena tanto en MySQL (`document_embeddings`) como en Qdrant mediante upsert.
7. El estado final es `INDEXED`, indicando que el documento ya es consultable vía RAG.

---

## 10.7 Aprobar Trámite

```mermaid
sequenceDiagram
    actor Operador
    participant Livewire as ProcedureDetail (Livewire)
    participant Controller as ProcedureController
    participant DB as MySQL
    participant Event as Event/Dispatcher
    participant Listener as NotifyInsured (Listener)
    participant Notif as Notification

    Operador->>Livewire: Revisa trámite + click "Aprobar"
    Livewire->>Controller: approve(Procedure $procedure)
    Controller->>Controller: Gate::authorize('approve', $procedure)
    Controller->>DB: BEGIN TRANSACTION
    Controller->>DB: UPDATE procedures SET status='APROBADO', approved_by=?, approved_at=NOW()
    Controller->>DB: INSERT INTO procedure_logs (action, user_id, ...)
    Controller->>DB: COMMIT
    Controller->>Event: event(new ProcedureApproved($procedure))
    Event->>Listener: handle(ProcedureApproved $event)
    Listener->>Notif: $procedure->user->notify(new ProcedureApprovedNotification($procedure))
    Notif-->>Listener: notificación enviada
    Controller-->>Livewire: redirect con flash message
    Livewire-->>Operador: "Trámite aprobado exitosamente"
```

**Explicación:**

1. El operador accede al detalle del trámite (`ProcedureDetail` Livewire), revisa documentos y datos.
2. Al hacer clic en "Aprobar", se llama a `ProcedureController::approve()` que primero verifica autorización mediante `Gate::authorize()` (Policy de Laravel). Solo usuarios con rol `GESDOC` y trámites en estado `EN_REVISION` pueden ser aprobados.
3. En una transacción, se actualiza el estado a `APROBADO`, se registra `approved_by` (ID del operador) y `approved_at` (timestamp). Se inserta un log en `procedure_logs` para auditoría.
4. Se dispara el evento `ProcedureApproved`. El listener `NotifyInsured` envía una notificación al usuario creador del trámite usando el sistema de notificaciones de Laravel.
5. El operador recibe un flash message de confirmación y la vista se actualiza.

---

## 10.8 Dashboard KPIs (Admin)

```mermaid
sequenceDiagram
    actor Admin
    participant Livewire as DashboardPage (Livewire)
    participant Service as AdminService
    participant DB as MySQL
    participant Widgets as Filament Widgets
    participant Charts as Chart.js

    Admin->>Livewire: Accede a /admin/dashboard
    Livewire->>Service: getKpis()
    Service->>DB: SELECT COUNT(*) FROM procedures WHERE status='PENDIENTE'
    DB-->>Service: 42 pendientes
    Service->>DB: SELECT COUNT(*) FROM procedures WHERE status='APROBADO' AND DATE(approved_at)=CURDATE()
    DB-->>Service: 15 aprobados hoy
    Service->>DB: SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) FROM procedures WHERE status='APROBADO'
    DB-->>Service: 48.5 horas promedio
    Service->>DB: SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL 24 HOUR
    DB-->>Service: 230 activos
    Service->>DB: SELECT COUNT(*) FROM chat_interactions WHERE resolved_by='faq' / COUNT(*)
    DB-->>Service: 0.68 (68% FAQ)
    Service-->>Livewire: array KPIs
    Livewire->>Widgets: Cargar widgets de Filament
    Widgets->>Service: getChartsData()
    Service->>DB: SELECT status, COUNT(*) FROM procedures GROUP BY status
    DB-->>Service: datos para pie chart
    Service->>DB: SELECT DATE_FORMAT(created_at,'%Y-%m') as mes, COUNT(*) FROM procedures GROUP BY mes
    DB-->>Service: datos para bar chart
    Service-->>Widgets: datasets
    Widgets->>Charts: Renderizar gráficos
    Livewire-->>Admin: Dashboard completo
```

**Explicación:**

1. El administrador accede al dashboard en `/admin/dashboard` construido con Filament 3 + Livewire widgets.
2. `AdminService::getKpis()` ejecuta queries agregadas para obtener los KPIs principales: trámites pendientes, aprobados hoy, tiempo promedio de resolución, usuarios activos (últimas 24h), tasa de resolución del chatbot.
3. Los widgets de Filament cargan datos adicionales para gráficos: distribución de trámites por estado (pie chart) y trámites por mes (bar chart) usando Chart.js.
4. Toda la lógica de agregación está encapsulada en `AdminService`, manteniendo los widgets delgados.
5. El dashboard se renderiza completamente en el servidor con Livewire, actualizando datos en cada carga de página. Puede añadirse polling (`wire:poll.60s`) para actualización en tiempo real.

---

## 10.9 Resumen de Componentes

| Componente | Tecnología | Rol |
|---|---|---|
| Frontend interactivo | Livewire 3 | Componentes reactivos sin salir de Laravel |
| Autenticación | Laravel Sanctum | SPA auth + API tokens |
| ORM | Eloquent | Modelos, relaciones, scopes |
| Base de datos | MySQL 8 | Datos transaccionales y operativos |
| Colas | Laravel Queue + Redis | Jobs asíncronos (OCR, embeddings) |
| Eventos | Laravel Events/Listeners | Desacoplamiento (notificaciones, logs) |
| Almacenamiento | MinIO (compatible S3) | Documentos y archivos |
| OCR | Tesseract via PHP wrapper | Extracción de texto |
| Búsqueda vectorial | Qdrant | RAG, búsqueda semántica |
| IA | OpenAI API | Embeddings + Chat Completion |
| Admin | Filament 3 | Panel administrativo |
| Monitoreo colas | Laravel Horizon | Dashboard de jobs |
