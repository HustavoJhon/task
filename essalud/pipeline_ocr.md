# Pipeline de Documentos — OCR, Embeddings y Búsqueda Semántica

---

## Flujo completo al subir un documento

```
Usuario sube archivo
       │
       ▼
DocumentController@store
       │
       ▼
Se guarda en storage/local/documents/YYYY/MM/
Se crea registro en tabla `documents`
       │
       ▼
ProcessOcr Job (queue: default)
       │
       ├── PDF  → pdftotext -layout (sin OCR de imágenes)
       ├── Image → tesseract (OCR con Tesseract)
       └── Text  → file_get_contents (lectura directa)
       │
       ▼
Se guarda texto extraído en `documents.ocr_text`
       │
       ▼
GenerateEmbeddings Job
       │
       ├── Divide texto en chunks de ~1000 caracteres
       ├── Genera embedding vectorial con OpenAI API (`text-embedding-ada-002`)
       ├── Guarda cada chunk en `document_embeddings` (local)
       └── Inserta puntos en Qdrant (búsqueda vectorial)
       │
       ▼
El chatbot puede buscar el documento por similitud semántica
```

---

## Componentes

### 1. ProcessOcr (`app/Jobs/ProcessOcr.php`)

| Tipo MIME | Herramienta | Comportamiento |
|-----------|------------|----------------|
| `application/pdf` | `pdftotext -layout` | Extrae texto plano manteniendo layout. **No hace OCR de imágenes dentro del PDF**. |
| `image/*` | `tesseract` | OCR completo sobre la imagen. Requiere Tesseract instalado en el contenedor. |
| `text/*` | `file_get_contents` | Lectura directa del archivo. |

- Si el archivo no existe → `Log::warning` y aborta
- Si el MIME no está soportado → `Log::warning` y aborta
- Si el OCR produce texto vacío → `Log::info`, no se generan embeddings
- Si hay excepción → `Log::error` y aborta (no reintenta)

**Dependencias del sistema (Debian/Ubuntu):**
```bash
apt-get install poppler-utils tesseract-ocr tesseract-ocr-spa
```

### 2. GenerateEmbeddings (`app/Jobs/GenerateEmbeddings.php`)

| Paso | Descripción |
|------|-------------|
| Validación | Si `ocr_text` está vacío → skip con `Log::info` |
| Colección | `$qdrant->ensureCollection()` → crea colección si no existe |
| Chunking | Divide por oraciones (`.` `!` `?`) con máximo ~1000 caracteres |
| Embedding | `OpenAIService::embedding($chunk)` → vector numérico |
| Almacenamiento local | `DocumentEmbedding::create()` guarda chunk + vector en MySQL/SQLite |
| Almacenamiento vectorial | `QdrantService::upsertPoints()` inserta en Qdrant con payload (document_id, title, content, url) |
| Source tracking | `RagSource::updateOrCreate()` rastrea origen del documento indexado |

- Si embedding falla → `Log::error`, `continue` al siguiente chunk
- Si Qdrant falla → `Log::error`, `$this->release(30)` reintenta en 30s
- Si guardar en DB falla → `Log::error`, `continue`

### 3. Búsqueda en el chatbot (`ChatService.php`)

Cuando el usuario hace una pregunta:

1. Se genera embedding de la pregunta con OpenAI
2. `QdrantService::search()` busca los 5 chunks más similares
3. Los resultados se inyectan como contexto en el prompt del chatbot
4. El chatbot responde basado en el contenido de los documentos

---

## Modelos

### `documents` (tabla)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | bigint | PK |
| `user_id` | bigint | FK → users |
| `procedure_id` | bigint nullable | FK → procedures |
| `category_id` | bigint nullable | FK → document_categories |
| `original_name` | string | Nombre original del archivo |
| `stored_path` | string | Ruta en storage local |
| `mime_type` | string | Ej: `application/pdf` |
| `file_size` | integer | Tamaño en bytes |
| `version` | integer | Versión del documento |
| `ocr_text` | text nullable | Texto extraído por OCR |
| `is_validated` | boolean | Validado por operador/admin |
| `validated_by` | bigint nullable | FK → users |
| `validated_at` | datetime nullable | Fecha de validación |
| `minio_path` | string nullable | Ruta en MinIO (S3) |

### `document_embeddings` (tabla)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | bigint | PK |
| `document_id` | bigint | FK → documents |
| `chunk_index` | integer | Índice del chunk (0, 1, 2...) |
| `content` | text | Texto del chunk |
| `embedding` | json | Vector de embeddings (1536 dims) |
| `qdrant_point_id` | string | UUID del punto en Qdrant |

---

## Pendiente / Limitaciones

| Issue | Impacto |
|-------|---------|
| `pdftotext` no hace OCR en imágenes PDF | Documentos escaneados → `ocr_text` vacío, sin embeddings |
| Tesseract solo en español si se instala `tesseract-ocr-spa` | Documentos en otros idiomas pueden tener baja precisión |
| No hay cola de jobs configurada (queue=default) | Procesamiento sincrónico, no hay worker separado |
| Sin fallback si OpenAI no responde | El embedding falla, el chunk se salta |
| Documentos no se re-indexan automáticamente al actualizarse | Solo se indexan al crearse |
