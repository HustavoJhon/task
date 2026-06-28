# 12. Ingesta de PDFs/Documentos — EsSalud (Laravel)

Pipeline completo de ingesta de documentos en la plataforma EsSalud, desde la subida por parte del asegurado hasta la indexación en Qdrant para búsqueda semántica vía RAG.

---

## 12.1 Flujo General de Ingesta

```
┌──────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐    ┌───────────┐
│  Upload  │───▶│Validate  │───▶│  Store    │───▶│ProcessOcr│───▶│Generate  │───▶│ Qdrant    │
│ Livewire │    │ MIME/size│    │  MinIO    │    │  (Redis) │    │Embeddings│    │ Upsert    │
└──────────┘    └──────────┘    └───────────┘    └──────────┘    └──────────┘    └───────────┘
     │                                                   │                │
     ▼                                                   ▼                ▼
Estado: PENDING_OCR                                 Estado: OCR_DONE    Estado: INDEXED
```

---

## 12.2 Componente Livewire de Upload

```php
<?php

namespace App\Livewire;

use App\Jobs\ProcessOcr;
use App\Models\Document;
use Livewire\Component;
use Livewire\WithFileUploads;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentUpload extends Component
{
    use WithFileUploads;

    public $file;
    public $procedureId;
    public $description = '';
    public $uploadedDocument = null;
    public $isUploading = false;
    public $progress = 0;

    protected array $rules = [
        'file'         => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        'description'  => 'nullable|string|max:500',
        'procedureId'  => 'required|exists:procedures,id',
    ];

    public function updatedFile()
    {
        $this->validateOnly('file');
    }

    public function upload()
    {
        $this->validate();
        $this->isUploading = true;
        $this->progress = 20;

        $file = $this->file;
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();

        // Generar nombre único
        $storedName = sprintf(
            '%s_%s.%s',
            Str::uuid()->toString(),
            Str::slug(pathinfo($originalName, PATHINFO_FILENAME)),
            $extension
        );

        $this->progress = 40;

        // Almacenar en MinIO (disk: s3 configurado para MinIO)
        $path = Storage::disk('s3')->putFileAs(
            'documents/' . date('Y/m/d'),
            $file,
            $storedName,
            ['visibility' => 'private']
        );

        $this->progress = 60;

        // Crear registro en BD
        $document = Document::create([
            'user_id'        => auth()->id(),
            'procedure_id'   => $this->procedureId,
            'original_name'  => $originalName,
            'stored_name'    => $storedName,
            'storage_path'   => $path,
            'mime_type'      => $mimeType,
            'size_bytes'     => $size,
            'extension'      => $extension,
            'description'    => $this->description,
            'status'         => 'PENDING_OCR',
            'version'        => $this->getNextVersion(),
        ]);

        $this->progress = 80;

        // Despachar job de OCR a la cola
        ProcessOcr::dispatch($document)->onQueue('ocr');

        $this->progress = 100;
        $this->uploadedDocument = $document;
        $this->isUploading = false;
        $this->reset('file', 'description');

        $this->dispatch('document-uploaded', documentId: $document->id);
        session()->flash('message', 'Documento subido correctamente. Se está procesando.');
    }

    private function getNextVersion(): int
    {
        $lastVersion = Document::where('procedure_id', $this->procedureId)
            ->where('original_name', $this->file->getClientOriginalName())
            ->max('version');

        return ($lastVersion ?? 0) + 1;
    }

    public function render()
    {
        return view('livewire.document-upload', [
            'existingDocuments' => Document::where('procedure_id', $this->procedureId)
                ->where('user_id', auth()->id())
                ->latest()
                ->get(),
        ]);
    }
}
```

**Vista Blade (`livewire/document-upload.blade.php`):**

```blade
<div>
    <form wire:submit="upload" class="space-y-4">
        <div x-data="{ dragging: false }"
             x-on:dragover.prevent="dragging = true"
             x-on:dragleave.prevent="dragging = false"
             x-on:drop.prevent="dragging = false; $wire.file = $event.dataTransfer.files[0]"
             :class="{ 'border-blue-500 bg-blue-50': dragging }"
             class="border-2 border-dashed rounded-lg p-8 text-center transition">

            <input type="file" wire:model="file" id="file-upload" class="hidden">

            <label for="file-upload" class="cursor-pointer">
                @if($file)
                    <p class="text-green-600">{{ $file->getClientOriginalName() }}</p>
                @else
                    <p>Arrastra tu documento aquí o haz clic para seleccionar</p>
                    <p class="text-sm text-gray-500">PDF, JPG, PNG (máx 10MB)</p>
                @endif
            </label>
        </div>

        @error('file') <p class="text-red-500 text-sm">{{ $message }}</p> @enderror

        <div>
            <textarea wire:model="description" placeholder="Descripción del documento (opcional)"
                      class="w-full border rounded p-2" rows="2"></textarea>
        </div>

        @if($isUploading)
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all"
                     style="width: {{ $progress }}%"></div>
            </div>
        @endif

        <button type="submit" :disabled="$isUploading"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            Subir Documento
        </button>
    </form>

    @if($uploadedDocument)
        <div class="mt-4 p-4 bg-green-100 rounded">
            <p class="font-medium text-green-800">{{ session('message') }}</p>
            <p class="text-sm">ID: {{ $uploadedDocument->id }}</p>
            <p class="text-sm">Estado: {{ $uploadedDocument->status }}</p>
        </div>
    @endif
</div>
```

---

## 12.3 Validación de Archivos

La validación se realiza en múltiples capas:

### 12.3.1 Validación en Livewire (Cliente/Servidor)

```php
// En DocumentUpload.php
protected array $rules = [
    'file' => [
        'required',
        'file',
        'mimes:pdf,jpg,jpeg,png',         // Extensiones permitidas
        'max:10240',                        // 10 MB máximo
    ],
    'description' => 'nullable|string|max:500',
    'procedureId'  => 'required|exists:procedures,id',
];
```

### 12.3.2 Validación en el Controller (Servidor)

```php
<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Http\UploadedFile;

class DocumentValidationService
{
    private const ALLOWED_MIMES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
    ];

    private const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    private const MIN_DPI = 150;
    private const MAX_PDF_PAGES = 20;
    private const MIN_OCR_CONFIDENCE = 60;

    /**
     * Validación completa del documento.
     */
    public function validate(UploadedFile $file): array
    {
        $errors = [];
        $warnings = [];

        if (!in_array($file->getMimeType(), self::ALLOWED_MIMES)) {
            $errors[] = "Tipo de archivo no permitido: {$file->getMimeType()}";
        }

        if ($file->getSize() > self::MAX_SIZE) {
            $errors[] = "El archivo excede los 10 MB permitidos";
        }

        if ($file->getMimeType() === 'application/pdf') {
            $pdfValidation = $this->validatePdf($file);
            $errors = array_merge($errors, $pdfValidation['errors']);
            $warnings = array_merge($warnings, $pdfValidation['warnings']);
        }

        if (str_starts_with($file->getMimeType(), 'image/')) {
            $imageValidation = $this->validateImage($file);
            $errors = array_merge($errors, $imageValidation['errors']);
            $warnings = array_merge($warnings, $imageValidation['warnings']);
        }

        return [
            'valid'    => empty($errors),
            'errors'   => $errors,
            'warnings' => $warnings,
        ];
    }

    private function validatePdf(UploadedFile $file): array
    {
        $errors = [];
        $warnings = [];

        // Contar páginas con pdftotext (poppler-utils)
        $pageCount = $this->countPdfPages($file->getPathname());
        if ($pageCount > self::MAX_PDF_PAGES) {
            $errors[] = "El PDF tiene {$pageCount} páginas. Máximo permitido: " . self::MAX_PDF_PAGES;
        }

        if ($pageCount === 0) {
            $errors[] = "El PDF no contiene páginas legibles";
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    private function countPdfPages(string $path): int
    {
        $output = shell_exec("pdfinfo " . escapeshellarg($path) . " 2>/dev/null | grep 'Pages'");
        if ($output && preg_match('/Pages:\s+(\d+)/', $output, $matches)) {
            return (int)$matches[1];
        }
        return 0;
    }

    private function validateImage(UploadedFile $file): array
    {
        $errors = [];
        $warnings = [];

        $imageInfo = getimagesize($file->getPathname());
        if (!$imageInfo) {
            $errors[] = "La imagen no es válida o está corrupta";
            return ['errors' => $errors, 'warnings' => $warnings];
        }

        $width = $imageInfo[0];
        $height = $imageInfo[1];

        // Verificar DPI (aproximado, asumiendo 96 DPI estándar para pantalla)
        // En producción se usaría exiftool o similar
        if ($width < 800 || $height < 600) {
            $warnings[] = "Resolución baja ({$width}x{$height}). Se recomienda mínimo 150 DPI";
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }
}
```

### 12.3.3 Escaneo de Virus (Opcional con ClamAV)

```php
/**
 * Escanea archivo con ClamAV (requiere clamav instalado en el servidor).
 */
public function virusScan(string $filePath): bool
{
    $output = shell_exec("clamscan --no-summary " . escapeshellarg($filePath));

    if (str_contains($output, 'FOUND')) {
        Log::warning("Virus detectado en archivo: {$filePath}");
        return false;
    }

    return true;
}
```

---

## 12.4 MinIO / S3 con Laravel Filesystem

### Configuración (`config/filesystems.php`):

```php
'disks' => [
    's3' => [
        'driver'   => 's3',
        'key'      => env('MINIO_ACCESS_KEY', 'minioadmin'),
        'secret'   => env('MINIO_SECRET_KEY', 'minioadmin'),
        'region'   => env('MINIO_REGION', 'us-east-1'),
        'bucket'   => env('MINIO_BUCKET', 'essalud-documents'),
        'url'      => env('MINIO_URL', 'http://localhost:9000'),
        'endpoint' => env('MINIO_ENDPOINT', 'http://localhost:9000'),
        'use_path_style_endpoint' => true,
        'throw'    => true,
    ],
    // ... otros discos
],
```

### Variables de entorno (`.env`):

```env
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_REGION=us-east-1
MINIO_BUCKET=essalud-documents
MINIO_URL=http://localhost:9000
MINIO_ENDPOINT=http://localhost:9000
FILESYSTEM_DISK=s3
```

---

## 12.5 OCR Job: ProcessOcr

```php
<?php

namespace App\Jobs;

use App\Events\DocumentProcessed;
use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use thiagoalessio\TesseractOCR\TesseractOCR;

class ProcessOcr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;     // 30, 90, 270 segundos
    public int $timeout = 300;    // 5 minutos máximo

    public function __construct(
        private Document $document,
    ) {}

    public function handle(): void
    {
        $this->document->update(['status' => 'PROCESSING_OCR']);

        // 1. Descargar archivo de MinIO a almacenamiento temporal
        $tempPath = storage_path('app/temp/' . $this->document->stored_name);

        try {
            $fileContent = Storage::disk('s3')->get($this->document->storage_path);
            file_put_contents($tempPath, $fileContent);
        } catch (\Throwable $e) {
            Log::error("Error descargando documento {$this->document->id}: " . $e->getMessage());
            $this->document->update(['status' => 'OCR_FAILED']);
            throw $e;
        }

        // 2. Ejecutar OCR según el tipo de archivo
        try {
            $text = $this->extractText($tempPath, $this->document->mime_type);

            if (empty(trim($text))) {
                Log::warning("OCR sin resultado para documento {$this->document->id}");
                $this->document->update(['status' => 'OCR_EMPTY']);
                return;
            }

            // Guardar texto extraído
            $this->document->update([
                'ocr_text'      => $text,
                'ocr_confidence' => $this->lastConfidence ?? 0,
                'status'        => 'OCR_DONE',
            ]);

            // 3. Despachar job de embeddings
            \App\Jobs\GenerateEmbeddings::dispatch($this->document)->onQueue('embeddings');

            // 4. Disparar evento de documento procesado
            event(new DocumentProcessed($this->document));

        } catch (\Throwable $e) {
            Log::error("Error OCR documento {$this->document->id}: " . $e->getMessage());
            $this->document->update(['status' => 'OCR_FAILED']);
            throw $e;
        } finally {
            // Limpiar archivo temporal
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }
        }
    }

    private function extractText(string $filePath, string $mimeType): string
    {
        return match (true) {
            $mimeType === 'application/pdf' => $this->extractFromPdf($filePath),
            str_starts_with($mimeType, 'image/') => $this->extractFromImage($filePath),
            default => throw new \Exception("MIME type no soportado: {$mimeType}"),
        };
    }

    /**
     * Extrae texto de PDF usando pdftotext (poppler-utils).
     */
    private function extractFromPdf(string $filePath): string
    {
        $outputFile = $filePath . '.txt';

        $command = sprintf(
            'pdftotext -layout -enc UTF-8 %s %s 2>&1',
            escapeshellarg($filePath),
            escapeshellarg($outputFile)
        );

        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception("pdftotext falló con código {$returnCode}");
        }

        $text = file_get_contents($outputFile);
        unlink($outputFile);

        return $text ?: '';
    }

    /**
     * Extrae texto de imagen usando Tesseract OCR en español.
     */
    private function extractFromImage(string $filePath): string
    {
        $ocr = new TesseractOCR($filePath);
        $ocr->lang('spa');
        $ocr->psm(3);               // Page Segmentation Mode: Fully automatic
        $ocr->config('oem', 3);     // OCR Engine Mode: Default (LSTM + Legacy)

        $text = $ocr->run();

        // Guardar confianza (disponible en modo verbose)
        $this->lastConfidence = method_exists($ocr, 'confidence')
            ? $ocr->confidence()
            : null;

        return $text;
    }
}
```

---

## 12.6 Embedding Job: GenerateEmbeddings

```php
<?php

namespace App\Jobs;

use App\Models\Document;
use App\Services\OpenAIService;
use App\Services\QdrantService;
use App\Services\TextChunker;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateEmbeddings implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60; // 60, 180, 540 segundos
    public int $timeout = 600; // 10 minutos

    public function __construct(
        private Document $document,
    ) {}

    public function handle(
        TextChunker $chunker,
        OpenAIService $openai,
        QdrantService $qdrant,
    ): void {
        $this->document->update(['status' => 'GENERATING_EMBEDDINGS']);

        $text = $this->document->ocr_text;
        if (empty($text)) {
            Log::warning("Documento {$this->document->id} sin texto OCR para embeddings");
            return;
        }

        // 1. Chunking del texto OCR
        $chunks = $chunker->chunk($text, maxTokens: 512, overlapTokens: 64);
        Log::info("Documento {$this->document->id}: " . count($chunks) . " chunks generados");

        if (empty($chunks)) {
            $this->document->update(['status' => 'EMBEDDING_FAILED']);
            return;
        }

        // 2. Generar embeddings en lotes de 20 para no saturar la API
        $batchSize = 20;
        $allPoints = [];
        $embeddingRecords = [];

        for ($i = 0; $i < count($chunks); $i += $batchSize) {
            $batch = array_slice($chunks, $i, $batchSize);
            $batchEmbeddings = $openai->generateEmbeddings($batch);

            foreach ($batch as $j => $chunkText) {
                $chunkIndex = $i + $j;
                $pointId = $this->document->id * 100000 + $chunkIndex;

                $allPoints[] = [
                    'id'        => $pointId,
                    'embedding' => $batchEmbeddings[$j],
                    'text'      => $chunkText,
                    'source'    => $this->document->original_name,
                    'doc_id'    => $this->document->id,
                    'chunk'     => $chunkIndex,
                ];

                $embeddingRecords[] = [
                    'document_id' => $this->document->id,
                    'chunk_index' => $chunkIndex,
                    'text'        => $chunkText,
                    'embedding'   => json_encode($batchEmbeddings[$j]),
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];
            }

            // Rate limiting: pausa entre batches
            if ($i + $batchSize < count($chunks)) {
                usleep(200000); // 200ms
            }
        }

        // 3. Upsert a Qdrant
        $qdrant->upsertPoints($allPoints);

        // 4. Guardar embeddings en MySQL
        \DB::table('document_embeddings')->insert($embeddingRecords);

        // 5. Actualizar estado final
        $this->document->update([
            'status'       => 'INDEXED',
            'chunks_count' => count($chunks),
            'indexed_at'   => now(),
        ]);

        Log::info("Documento {$this->document->id} indexado: " . count($chunks) . " chunks");
    }
}
```

---

## 12.7 Colas y Monitoreo con Laravel Horizon

### Configuración de colas (`config/horizon.php`):

```php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'maxProcesses' => 10,
            'balanceMaxShift' => 1,
            'balanceCooldown' => 3,
        ],
    ],
],

// Prioridades y queues:
// ocr        → baja prioridad (tiempo de proceso alto)
// embeddings → media prioridad
// default    → normal
// notifications → alta prioridad
```

### Rate limiting en OpenAI calls:

```php
// En AppServiceProvider::boot()
RateLimiter::for('openai-embeddings', function ($job) {
    return Limit::perMinute(3000)->by('openai-embeddings');
});

RateLimiter::for('openai-chat', function ($job) {
    return Limit::perMinute(500)->by('openai-chat');
});
```

---

## 12.8 Notificación al Completar OCR

### Evento:

```php
<?php

namespace App\Events;

use App\Models\Document;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DocumentProcessed
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Document $document,
    ) {}
}
```

### Listener:

```php
<?php

namespace App\Listeners;

use App\Events\DocumentProcessed;
use App\Models\RagSource;
use App\Notifications\DocumentReadyNotification;

class UpdateRagSource
{
    public function handle(DocumentProcessed $event): void
    {
        $doc = $event->document;

        // Actualizar o crear fuente RAG
        RagSource::updateOrCreate(
            ['document_id' => $doc->id],
            [
                'name'        => $doc->original_name,
                'chunks'      => $doc->chunks_count,
                'status'      => $doc->status === 'INDEXED' ? 'available' : 'processing',
                'indexed_at'  => $doc->indexed_at,
            ]
        );

        // Notificar al usuario que su documento fue procesado
        if ($doc->user && $doc->status === 'INDEXED') {
            $doc->user->notify(new DocumentReadyNotification($doc));
        }
    }
}
```

---

## 12.9 Modelo Document

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    protected $fillable = [
        'user_id', 'procedure_id', 'original_name', 'stored_name',
        'storage_path', 'mime_type', 'size_bytes', 'extension',
        'description', 'status', 'version', 'ocr_text',
        'ocr_confidence', 'chunks_count', 'indexed_at',
    ];

    protected $casts = [
        'size_bytes'     => 'integer',
        'ocr_confidence' => 'float',
        'chunks_count'   => 'integer',
        'indexed_at'     => 'datetime',
        'version'        => 'integer',
    ];

    // Estados posibles
    public const STATUS_PENDING_OCR   = 'PENDING_OCR';
    public const STATUS_PROCESSING_OCR = 'PROCESSING_OCR';
    public const STATUS_OCR_DONE      = 'OCR_DONE';
    public const STATUS_OCR_FAILED    = 'OCR_FAILED';
    public const STATUS_OCR_EMPTY     = 'OCR_EMPTY';
    public const STATUS_GENERATING_EMBEDDINGS = 'GENERATING_EMBEDDINGS';
    public const STATUS_INDEXED       = 'INDEXED';
    public const STATUS_EMBEDDING_FAILED = 'EMBEDDING_FAILED';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function procedure(): BelongsTo
    {
        return $this->belongsTo(Procedure::class);
    }

    public function embeddings(): HasMany
    {
        return $this->hasMany(DocumentEmbedding::class);
    }
}
```

---

## 12.10 Migración de la Tabla Documents

```php
Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('procedure_id')->constrained()->cascadeOnDelete();
    $table->string('original_name');
    $table->string('stored_name')->unique();
    $table->string('storage_path');
    $table->string('mime_type', 100);
    $table->bigInteger('size_bytes');
    $table->string('extension', 10);
    $table->text('description')->nullable();
    $table->string('status')->default('PENDING_OCR')->index();
    $table->integer('version')->default(1);
    $table->longText('ocr_text')->nullable();
    $table->float('ocr_confidence')->nullable();
    $table->integer('chunks_count')->nullable();
    $table->timestamp('indexed_at')->nullable();
    $table->timestamps();
    $table->softDeletes();
});

Schema::create('document_embeddings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('document_id')->constrained()->cascadeOnDelete();
    $table->integer('chunk_index');
    $table->text('text');
    $table->json('embedding'); // Vector 1536 almacenado como JSON
    $table->timestamps();

    $table->index(['document_id', 'chunk_index']);
});
```

---

## 12.11 Resumen del Pipeline

| Paso | Componente | Duración Estimada | Cola |
|---|---|---|---|
| Upload | Livewire + Dropzone.js | Instantáneo (usuario) | — |
| Store | MinIO S3 | < 2 seg | — |
| Registro | MySQL | < 1 seg | — |
| OCR | ProcessOcr Job | 10-120 seg (según tamaño) | `ocr` (baja) |
| Chunking | TextChunkerService | < 1 seg | `embeddings` (media) |
| Embeddings | OpenAI API | 5-30 seg | `embeddings` (media) |
| Qdrant Upsert | QdrantService | < 5 seg | `embeddings` (media) |
| Notificación | Event + Listener | < 1 seg | `default` |
| Total | — | ~30s a 3 min | — |
