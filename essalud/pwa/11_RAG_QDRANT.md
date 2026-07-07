# 11. RAG con Qdrant — EsSalud (Laravel)

Este documento describe la arquitectura de Retrieval-Augmented Generation (RAG) implementada sobre Laravel 11, utilizando Qdrant como vector store y OpenAI como proveedor de embeddings y chat completion.

---

## 11.1 Arquitectura RAG

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Documento   │────▶│   OCR Job   │────▶│  Chunking    │────▶│  OpenAI     │
│  PDF/Imagen  │     │  (Tesseract)│     │  (512 tokens)│     │  Embeddings │
└──────────────┘     └─────────────┘     └──────────────┘     └──────┬──────┘
                                                                      │
                                                               ┌──────▼──────┐
                                                               │   Qdrant    │
                                                               │   Index     │
                                                               └──────┬──────┘
                                                                      │
┌──────────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────▼──────┐
│  Usuario     │────▶│  Chatbot    │────▶│  Qdrant      │────▶│  OpenAI     │
│  Query       │     │  Query      │     │  Search      │     │  Completion │
└──────────────┘     └─────────────┘     └──────────────┘     └──────┬──────┘
                                                                      │
                                                               ┌──────▼──────┐
                                                               │  Respuesta  │
                                                               │  con Citas  │
                                                               └─────────────┘
```

**Stack tecnológico:**
- **Laravel 11**: framework base, manejo de jobs, eventos, filesystem.
- **Qdrant**: vector database (puede ser cloud o self-hosted).
- **qdrant-php**: cliente PHP oficial para interactuar con Qdrant API.
- **OpenAI API**: `text-embedding-3-small` para embeddings, `gpt-4o-mini` para generación de texto.
- **Redis**: Laravel Queue driver para procesamiento asíncrono.
- **MySQL**: almacenamiento relacional de metadatos de documentos y chunks.

---

## 11.2 QdrantService (PHP)

Clase de servicio que encapsula todas las operaciones con Qdrant usando el cliente `qdrant-php`.

```php
<?php

namespace App\Services;

use Qdrant\Qdrant;
use Qdrant\Models\Request\CollectionConfig;
use Qdrant\Models\Request\VectorParams;
use Qdrant\Models\Request\Distance;
use Qdrant\Models\PointStruct;
use Qdrant\Models\Request\SearchRequest;
use Qdrant\Models\Filter\Filter;
use Qdrant\Models\VectorStruct;

class QdrantService
{
    private Qdrant $client;
    private string $collection = 'essalud_documents';

    public function __construct()
    {
        $this->client = new Qdrant(
            host: config('qdrant.host'),
            apiKey: config('qdrant.api_key'),
        );
    }

    /**
     * Crear colección con vector size 1536 (text-embedding-3-small) y distancia coseno.
     */
    public function createCollection(): void
    {
        $config = new CollectionConfig(
            vectors: new VectorParams(
                size: 1536,
                distance: Distance::COSINE,
            ),
        );

        $this->client->collections()->create(
            collectionName: $this->collection,
            config: $config,
        );
    }

    /**
     * Buscar los N chunks más similares a un vector de consulta.
     * Retorna array con [text, metadata, score].
     */
    public function search(array $embedding, int $limit = 5, ?Filter $filter = null): array
    {
        $vector = new VectorStruct($embedding);

        $request = new SearchRequest(
            vector: $vector,
            limit: $limit,
            withPayload: true,
            filter: $filter,
        );

        $response = $this->client->points()->search(
            collectionName: $this->collection,
            request: $request,
        );

        $results = [];
        foreach ($response as $point) {
            $payload = $point->getPayload();
            $results[] = [
                'id'      => $point->getId(),
                'score'   => $point->getScore(),
                'text'    => $payload['text'] ?? '',
                'source'  => $payload['source'] ?? 'Desconocido',
                'doc_id'  => $payload['doc_id'] ?? null,
                'chunk'   => $payload['chunk'] ?? 0,
            ];
        }

        return $results;
    }

    /**
     * Insertar o actualizar puntos (chunks) en la colección.
     */
    public function upsertPoints(array $points): void
    {
        $structs = [];
        foreach ($points as $point) {
            $structs[] = new PointStruct(
                id: $point['id'],
                vector: $point['embedding'],
                payload: [
                    'text'   => $point['text'],
                    'source' => $point['source'],
                    'doc_id' => $point['doc_id'],
                    'chunk'  => $point['chunk'],
                ],
            );
        }

        $this->client->points()->upsert(
            collectionName: $this->collection,
            points: $structs,
        );
    }

    /**
     * Eliminar puntos de un documento específico por doc_id.
     */
    public function deletePoints(int $docId): void
    {
        $filter = (new Filter())->addMust(
            key: 'doc_id',
            match: ['value' => $docId],
        );

        $this->client->points()->delete(
            collectionName: $this->collection,
            filter: $filter,
        );
    }

    /**
     * Verificar si la colección existe.
     */
    public function collectionExists(): bool
    {
        try {
            $this->client->collections()->info($this->collection);
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Contar puntos en la colección.
     */
    public function count(): int
    {
        $info = $this->client->collections()->info($this->collection);
        return $info->getPointsCount();
    }
}
```

**Configuración (`config/qdrant.php`):**

```php
<?php

return [
    'host'    => env('QDRANT_HOST', 'http://localhost:6333'),
    'api_key' => env('QDRANT_API_KEY', null),
    'collection' => env('QDRANT_COLLECTION', 'essalud_documents'),
];
```

---

## 11.3 Colección Qdrant: `essalud_documents`

| Parámetro | Valor |
|---|---|
| Nombre | `essalud_documents` |
| Vector size | 1536 (text-embedding-3-small) |
| Distancia | COSINE |
| Payload | `text`, `source`, `doc_id`, `chunk` |

**Payload de cada punto:**

```json
{
  "text": "El Seguro Social de Salud (EsSalud) cubre atenciones médicas...",
  "source": "Reglamento_EsSalud_2024.pdf",
  "doc_id": 42,
  "chunk": 3
}
```

- `text`: contenido textual del chunk.
- `source`: nombre legible del documento original.
- `doc_id`: ID en la tabla `documents` de MySQL.
- `chunk`: número de chunk dentro del documento (para ordenamiento).

---

## 11.4 Chunking de Documentos

Estrategia de división de texto en Laravel/PHP.

```php
<?php

namespace App\Services;

class TextChunker
{
    /**
     * Divide texto en chunks con tamaño aproximado en tokens y overlap.
     */
    public function chunk(string $text, int $maxTokens = 512, int $overlapTokens = 64): array
    {
        // Estimación: ~4 caracteres por token para español
        $maxChars = $maxTokens * 4;
        $overlapChars = $overlapTokens * 4;

        // Dividir por párrafos primero
        $paragraphs = preg_split('/\n\s*\n/', trim($text));
        $chunks = [];
        $currentChunk = '';

        foreach ($paragraphs as $paragraph) {
            $paragraph = trim($paragraph);

            // Si el párrafo es muy largo, dividir por oraciones
            if (mb_strlen($paragraph) > $maxChars) {
                $sentences = preg_split('/(?<=[.!?])\s+/', $paragraph);

                foreach ($sentences as $sentence) {
                    if (mb_strlen($currentChunk . ' ' . $sentence) > $maxChars) {
                        if (!empty(trim($currentChunk))) {
                            $chunks[] = trim($currentChunk);
                            // Crear overlap: mantener últimas palabras
                            $words = explode(' ', $currentChunk);
                            $overlapWords = array_slice($words, -intval($overlapChars / 5));
                            $currentChunk = implode(' ', $overlapWords) . ' ';
                        }
                    }
                    $currentChunk .= $sentence . ' ';
                }
            } else {
                if (mb_strlen($currentChunk . ' ' . $paragraph) > $maxChars) {
                    $chunks[] = trim($currentChunk);
                    $words = explode(' ', $currentChunk);
                    $overlapWords = array_slice($words, -intval($overlapChars / 5));
                    $currentChunk = implode(' ', $overlapWords) . ' ';
                }
                $currentChunk .= $paragraph . ' ';
            }
        }

        if (!empty(trim($currentChunk))) {
            $chunks[] = trim($currentChunk);
        }

        return $chunks;
    }
}
```

---

## 11.5 OpenAIService (PHP)

```php
<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;

class OpenAIService
{
    /**
     * Genera embedding vector 1536-dim para texto.
     */
    public function generateEmbedding(string $text): array
    {
        $response = OpenAI::embeddings()->create([
            'model' => 'text-embedding-3-small',
            'input' => $text,
        ]);

        return $response->embeddings[0]->embedding;
    }

    /**
     * Genera embeddings en batch (hasta 2048 inputs por llamada).
     */
    public function generateEmbeddings(array $texts): array
    {
        $response = OpenAI::embeddings()->create([
            'model' => 'text-embedding-3-small',
            'input' => $texts,
        ]);

        return array_map(
            fn($e) => $e->embedding,
            $response->embeddings,
        );
    }

    /**
     * Chat completion usando contexto RAG.
     */
    public function chatCompletion(string $systemPrompt, string $userMessage, float $temperature = 0.3): string
    {
        $response = OpenAI::chat()->create([
            'model'       => 'gpt-4o-mini',
            'temperature' => $temperature,
            'messages'    => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userMessage],
            ],
        ]);

        return $response->choices[0]->message->content;
    }
}
```

---

## 11.6 RAG Pipeline Job

```php
<?php

namespace App\Jobs;

use App\Models\Document;
use App\Services\TextChunker;
use App\Services\OpenAIService;
use App\Services\QdrantService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessDocument implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60; // 60, 120, 240 segundos

    public function __construct(
        private Document $document,
    ) {}

    public function handle(
        TextChunker $chunker,
        OpenAIService $openai,
        QdrantService $qdrant,
    ): void {
        $text = $this->document->ocr_text;

        if (empty($text)) {
            Log::warning("Documento {$this->document->id} sin texto OCR");
            $this->document->update(['status' => 'OCR_FAILED']);
            return;
        }

        // 1. Chunking
        $chunks = $chunker->chunk($text, maxTokens: 512, overlapTokens: 64);
        Log::info("Documento {$this->document->id}: {$this->document->count()} chunks generados");

        // 2. Generar embeddings en batch (más eficiente)
        $chunkTexts = array_map(fn($c) => $c, $chunks);
        $embeddings = $openai->generateEmbeddings($chunkTexts);

        // 3. Preparar puntos para Qdrant y guardar en MySQL
        $points = [];
        $embeddingRecords = [];

        foreach ($chunks as $i => $chunkText) {
            $pointId = $this->document->id * 10000 + $i;

            $points[] = [
                'id'        => $pointId,
                'embedding' => $embeddings[$i],
                'text'      => $chunkText,
                'source'    => $this->document->original_name,
                'doc_id'    => $this->document->id,
                'chunk'     => $i,
            ];

            $embeddingRecords[] = [
                'document_id' => $this->document->id,
                'chunk_index' => $i,
                'text'        => $chunkText,
                'embedding'   => json_encode($embeddings[$i]),
                'created_at'  => now(),
                'updated_at'  => now(),
            ];
        }

        // 4. Upsert a Qdrant
        $qdrant->upsertPoints($points);

        // 5. Guardar en MySQL (tabla document_embeddings)
        $this->document->embeddings()->insert($embeddingRecords);

        // 6. Actualizar estado
        $this->document->update([
            'status'      => 'INDEXED',
            'chunks_count'=> count($chunks),
            'indexed_at'  => now(),
        ]);

        Log::info("Documento {$this->document->id} indexado exitosamente");
    }
}
```

---

## 11.7 FAQ como Cache Rápido

Antes de invocar Qdrant + OpenAI, el `ChatService` verifica si la consulta coincide con alguna FAQ mediante búsqueda por palabras clave. Esto reduce latencia y costos de API.

```php
<?php

namespace App\Services;

use App\Models\Faq;

class ChatService
{
    private OpenAIService $openai;
    private QdrantService $qdrant;

    public function __construct(OpenAIService $openai, QdrantService $qdrant)
    {
        $this->openai = $openai;
        $this->qdrant = $qdrant;
    }

    public function processMessage(string $message): array
    {
        // 1. Intentar FAQ (keyword match)
        $faqResult = $this->matchFaq($message);

        if ($faqResult && $faqResult['score'] >= 0.70) {
            return [
                'type'       => 'faq',
                'answer'     => $faqResult['answer'],
                'confidence' => $faqResult['score'],
                'source'     => 'FAQ',
            ];
        }

        // 2. Si no hay match, pipeline RAG
        return $this->ragPipeline($message);
    }

    private function matchFaq(string $message): ?array
    {
        $normalized = $this->normalize($message);
        $faqs = Faq::where('active', true)->get();

        $bestScore = 0;
        $bestFaq = null;

        foreach ($faqs as $faq) {
            $keywords = json_decode($faq->keywords, true) ?? [];
            $score = $this->calculateKeywordScore($normalized, $keywords);

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestFaq = $faq;
            }
        }

        if ($bestFaq) {
            return [
                'answer' => $bestFaq->answer,
                'score'  => $bestScore,
            ];
        }

        return null;
    }

    private function normalize(string $text): string
    {
        $text = mb_strtolower(trim($text));
        // Remover tildes
        $text = strtr($text, 'áéíóúñ', 'aeioun');
        // Remover signos de puntuación
        $text = preg_replace('/[^a-z0-9\s]/', '', $text);
        return $text;
    }

    private function calculateKeywordScore(string $text, array $keywords): float
    {
        if (empty($keywords)) {
            return 0;
        }

        $matches = 0;
        foreach ($keywords as $keyword) {
            $normalizedKeyword = $this->normalize($keyword);
            if (str_contains($text, $normalizedKeyword)) {
                $matches++;
            }
        }

        return $matches / count($keywords);
    }

    private function ragPipeline(string $message): array
    {
        $embedding = $this->openai->generateEmbedding($message);
        $results = $this->qdrant->search($embedding, limit: 5);
        $prompt = $this->buildPrompt($message, $results);
        $response = $this->openai->chatCompletion($prompt['system'], $prompt['user']);
        $sources = $this->extractSources($results);

        return [
            'type'       => 'rag',
            'answer'     => $response,
            'sources'    => $sources,
            'confidence' => $results[0]['score'] ?? 0,
        ];
    }
}
```

---

## 11.8 Prompt Template (Español)

```php
private function buildPrompt(string $query, array $contextChunks): array
{
    $contextText = '';
    foreach ($contextChunks as $i => $chunk) {
        $contextText .= "[Documento: {$chunk['source']}]\n{$chunk['text']}\n\n";
    }

    $systemPrompt = <<<PROMPT
Eres un asistente virtual de EsSalud, el Seguro Social de Salud del Perú.
Tu función es ayudar a los asegurados con información sobre trámites, coberturas,
requisitos y procedimientos administrativos.

REGLAS:
1. Responde ÚNICAMENTE con información contenida en el contexto proporcionado.
2. Si la información no está en el contexto, responde: "No tengo información suficiente para responder esta consulta. Le recomiendo comunicarse con EsSalud a la línea 411-8000."
3. Cita SIEMPRE la fuente usando el formato [Fuente: NombreDocumento] al final de cada dato.
4. Responde en español, con tono formal pero amigable.
5. Sé conciso pero completo. No inventes información.
6. Si la pregunta no está relacionada con EsSalud, indica amablemente que solo puedes ayudar con temas de EsSalud.

CONTEXTO DISPONIBLE:
{$contextText}
PROMPT;

    return [
        'system' => $systemPrompt,
        'user'   => $query,
    ];
}
```

---

## 11.9 Citaciones y Fuentes

El modelo responde con formato `[Fuente: Reglamento_EsSalud_2024.pdf]`. El frontend (Livewire) parsea estas citas y las convierte en enlaces o tooltips.

```php
/**
 * Extrae citas del response para mostrarlas como fuentes.
 */
private function extractSources(array $results): array
{
    $sources = [];
    $seen = [];

    foreach ($results as $result) {
        $source = $result['source'];
        if (!in_array($source, $seen)) {
            $sources[] = [
                'name'  => $source,
                'score' => round($result['score'], 2),
                'doc_id'=> $result['doc_id'],
            ];
            $seen[] = $source;
        }
    }

    return $sources;
}
```

En el componente Livewire, las citas se renderizan así:

```blade
@if($response['type'] === 'rag')
    <div class="chat-answer">
        {!! preg_replace('/\[Fuente:\s*(.+?)\]/',
            '<a href="#" wire:click="showSource(\'$1\')" class="source-link">[$1]</a>',
            $response['answer']) !!}
    </div>
    <div class="sources-list">
        @foreach($response['sources'] as $source)
            <span class="source-badge" title="Score: {{ $source['score'] }}">
                {{ $source['name'] }}
            </span>
        @endforeach
    </div>
@endif
```

---

## 11.10 Métricas RAG

```php
<?php

namespace App\Services;

use App\Models\ChatInteraction;
use App\Models\Document;
use Illuminate\Support\Facades\DB;

class RagMetricsService
{
    public function getMetrics(): array
    {
        $totalChats = ChatInteraction::count();
        $faqChats = ChatInteraction::where('resolved_by', 'faq')->count();
        $ragChats = ChatInteraction::where('resolved_by', 'rag')->count();

        return [
            'total_chunks'        => Document::sum('chunks_count'),
            'avg_rag_confidence'  => round(ChatInteraction::where('resolved_by', 'rag')->avg('confidence') ?? 0, 2),
            'top_sources'         => $this->getTopSources(),
            'faq_hit_rate'        => $totalChats > 0 ? round($faqChats / $totalChats, 2) : 0,
            'rag_hit_rate'        => $totalChats > 0 ? round($ragChats / $totalChats, 2) : 0,
            'total_documents'     => Document::where('status', 'INDEXED')->count(),
            'avg_chunks_per_doc'  => round(Document::where('status', 'INDEXED')->avg('chunks_count') ?? 0, 0),
        ];
    }

    private function getTopSources(int $limit = 5): array
    {
        return ChatInteraction::where('resolved_by', 'rag')
            ->select('source', DB::raw('COUNT(*) as count'))
            ->groupBy('source')
            ->orderByDesc('count')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}
```

---

## 11.11 Comando Artisan: `rag:reindex`

```php
<?php

namespace App\Console\Commands;

use App\Jobs\ProcessDocument;
use App\Models\Document;
use Illuminate\Console\Command;

class RagReindex extends Command
{
    protected $signature = 'rag:reindex {--doc-id= : ID de documento específico}';
    protected $description = 'Reindexa documentos en Qdrant';

    public function handle(): int
    {
        $query = Document::whereNotNull('ocr_text');

        if ($docId = $this->option('doc-id')) {
            $query->where('id', $docId);
        }

        $documents = $query->get();

        $this->info("Reindexando {$documents->count()} documentos...");

        $bar = $this->output->createProgressBar($documents->count());
        $bar->start();

        foreach ($documents as $document) {
            ProcessDocument::dispatch($document);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Jobs de reindexación despachados a la cola.');

        return Command::SUCCESS;
    }
}
```

Registro en `routes/console.php` o en el `$commands` de Kernel.

---

## 11.12 Dependencias (composer.json)

```json
{
  "require": {
    "php": "^8.2",
    "laravel/framework": "^11.0",
    "livewire/livewire": "^3.0",
    "openai-php/laravel": "^0.8",
    "qdrant-php/qdrant-php": "^1.0",
    "thiagoalessio/tesseract_ocr": "^2.0",
    "laravel/horizon": "^5.0"
  }
}
```

---

## 11.13 Resumen del Flujo RAG

| Etapa | Descripción | Tecnología |
|---|---|---|
| Ingesta | Subida de PDF → cola | Livewire + Dropzone.js |
| OCR | Extracción de texto | Tesseract (PHP wrapper) |
| Chunking | División en fragmentos de 512 tokens | PHP (TextChunker) |
| Embedding | Vectorización de chunks | OpenAI text-embedding-3-small |
| Indexación | Almacenamiento vectorial | Qdrant (qdrant-php) |
| Query | Búsqueda semántica | Qdrant search (COSINE) |
| FAQ Cache | Keyword matching previo | MySQL (faqs table) |
| Generación | Respuesta contextual | OpenAI gpt-4o-mini |
| Citación | Fuentes documentales | Parseo en Livewire |
