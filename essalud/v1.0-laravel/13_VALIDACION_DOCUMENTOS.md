# 13. Validación de Documentos — EsSalud (Laravel)

Este documento describe el proceso completo de validación de documentos en la plataforma EsSalud, cubriendo la validación automática del sistema, la validación de contenido, la validación semántica por operadores GESDOC, los estados del flujo de validación, la interfaz de validación y las medidas de seguridad.

---

## 13.1 Capas de Validación

El sistema implementa tres capas de validación progresiva:

```
┌──────────────────────────────────────────────────────────┐
│               CAPAS DE VALIDACIÓN                        │
├─────────────────┬──────────────────┬─────────────────────┤
│ 1. Automática   │ 2. De Contenido  │ 3. Semántica        │
│    (Sistema)    │    (Sistema)     │  (Operador GESDOC)  │
├─────────────────┼──────────────────┼─────────────────────┤
│ • MIME type     │ • Legibilidad    │ • Correspondencia   │
│ • Tamaño        │   OCR (>60%)     │   con trámite       │
│ • Extensiones   │ • DPI mínimo     │ • Datos correctos   │
│ • Virus scan    │ • Orientación    │ • Vigencia          │
│ • PDF páginas   │ • Núm. páginas   │ • Autenticidad      │
└─────────────────┴──────────────────┴─────────────────────┘
```

---

## 13.2 Validación Automática (Sistema)

Esta validación ocurre en el momento de la subida del archivo, antes de almacenarlo.

```php
<?php

namespace App\Services\Validation;

use App\Exceptions\DocumentValidationException;
use Illuminate\Http\UploadedFile;

class AutomaticDocumentValidator
{
    private const ALLOWED_MIMES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
    ];

    private const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private const MIN_FILE_SIZE = 1024;              // 1 KB (rechazar vacíos/corruptos)
    private const MAX_PDF_PAGES = 20;

    /**
     * Ejecuta todas las validaciones automáticas. Lanza excepción si falla.
     */
    public function validate(UploadedFile $file): void
    {
        $this->validateExtension($file);
        $this->validateMimeType($file);
        $this->validateFileSize($file);
        $this->validateNotCorrupted($file);

        if ($file->getMimeType() === 'application/pdf') {
            $this->validatePdfPages($file);
        }

        if (str_starts_with($file->getMimeType(), 'image/')) {
            $this->validateImageDimensions($file);
        }
    }

    private function validateExtension(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, self::ALLOWED_EXTENSIONS)) {
            throw new DocumentValidationException(
                "Extensión no permitida: .{$extension}. Extensiones válidas: " .
                implode(', ', self::ALLOWED_EXTENSIONS),
                'invalid_extension'
            );
        }
    }

    private function validateMimeType(UploadedFile $file): void
    {
        $mime = $file->getMimeType();

        if (!in_array($mime, self::ALLOWED_MIMES)) {
            throw new DocumentValidationException(
                "Tipo de archivo no permitido: {$mime}",
                'invalid_mime'
            );
        }
    }

    private function validateFileSize(UploadedFile $file): void
    {
        $size = $file->getSize();

        if ($size < self::MIN_FILE_SIZE) {
            throw new DocumentValidationException(
                "El archivo es demasiado pequeño (posiblemente corrupto o vacío)",
                'file_too_small'
            );
        }

        if ($size > self::MAX_FILE_SIZE) {
            $sizeMb = round($size / 1024 / 1024, 1);
            throw new DocumentValidationException(
                "El archivo excede el tamaño máximo de 10 MB ({$sizeMb} MB)",
                'file_too_large'
            );
        }
    }

    private function validateNotCorrupted(UploadedFile $file): void
    {
        $mime = $file->getMimeType();

        if ($mime === 'application/pdf') {
            $content = file_get_contents($file->getPathname());
            // Un PDF válido debe comenzar con %PDF-
            if (!str_starts_with($content, '%PDF-')) {
                throw new DocumentValidationException(
                    "El archivo PDF parece estar corrupto o no es un PDF válido",
                    'corrupted_pdf'
                );
            }
        }

        if (str_starts_with($mime, 'image/')) {
            $imageInfo = @getimagesize($file->getPathname());
            if ($imageInfo === false) {
                throw new DocumentValidationException(
                    "La imagen está corrupta o no se puede leer",
                    'corrupted_image'
                );
            }
        }
    }

    private function validatePdfPages(UploadedFile $file): void
    {
        $pageCount = $this->getPdfPageCount($file->getPathname());

        if ($pageCount === 0) {
            throw new DocumentValidationException(
                "El PDF no contiene páginas",
                'empty_pdf'
            );
        }

        if ($pageCount > self::MAX_PDF_PAGES) {
            throw new DocumentValidationException(
                "El PDF tiene {$pageCount} páginas. Máximo permitido: " . self::MAX_PDF_PAGES,
                'too_many_pages'
            );
        }
    }

    private function validateImageDimensions(UploadedFile $file): void
    {
        $imageInfo = getimagesize($file->getPathname());
        $width = $imageInfo[0];
        $height = $imageInfo[1];

        // Mínimo 150 DPI aproximado (asumiendo escaneo A4 a 150dpi ≈ 1240x1754)
        // Para fotos de documentos, mínimo 800x600
        if ($width < 800 || $height < 600) {
            throw new DocumentValidationException(
                "Resolución de imagen insuficiente ({$width}x{$height}). " .
                "Mínimo requerido: 800x600 píxeles (aproximadamente 150 DPI para documento A6)",
                'low_resolution'
            );
        }

        // Tamaño máximo razonable
        if ($width > 10000 || $height > 10000) {
            throw new DocumentValidationException(
                "Dimensiones de imagen excesivas ({$width}x{$height})",
                'oversized_image'
            );
        }
    }

    private function getPdfPageCount(string $filePath): int
    {
        $command = sprintf(
            'pdfinfo %s 2>/dev/null | grep "Pages" | awk \'{print $2}\'',
            escapeshellarg($filePath)
        );

        $output = shell_exec($command);
        return $output ? intval(trim($output)) : 0;
    }

    /**
     * Escaneo opcional de virus con ClamAV.
     * Requiere clamav y clamav-daemon instalados.
     */
    public function virusScan(string $filePath): bool
    {
        if (!$this->isClamAvAvailable()) {
            return true; // Si no está disponible, asumir limpio (con advertencia)
        }

        $output = shell_exec(
            'clamdscan --no-summary --stdout ' . escapeshellarg($filePath) . ' 2>&1'
        );

        if ($output === null) {
            return true;
        }

        // "stream: OK" significa limpio
        // "stream: VirusName FOUND" significa infectado
        if (str_contains($output, 'FOUND')) {
            \Log::warning("Virus detectado: {$output}", ['file' => $filePath]);
            return false;
        }

        return true;
    }

    private function isClamAvAvailable(): bool
    {
        $output = shell_exec('which clamdscan 2>/dev/null');
        return !empty(trim($output ?? ''));
    }
}
```

### Excepción personalizada:

```php
<?php

namespace App\Exceptions;

class DocumentValidationException extends \Exception
{
    public function __construct(
        string $message,
        private string $errorCode,
        int $httpCode = 422,
    ) {
        parent::__construct($message, $httpCode);
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function render(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'error'   => true,
            'code'    => $this->errorCode,
            'message' => $this->getMessage(),
        ], $this->getCode());
    }
}
```

---

## 13.3 Validación de Contenido (Post-OCR)

Después del OCR, el sistema valida la calidad del texto extraído.

```php
<?php

namespace App\Services\Validation;

use App\Models\Document;

class ContentDocumentValidator
{
    private const MIN_OCR_CONFIDENCE = 60; // porcentaje
    private const MIN_TEXT_LENGTH = 10;     // caracteres

    /**
     * Valida el contenido extraído por OCR.
     */
    public function validate(Document $document): array
    {
        $issues = [];
        $warnings = [];

        $text = $document->ocr_text ?? '';

        // 1. Verificar que se extrajo texto
        if (empty(trim($text))) {
            $issues[] = [
                'type'    => 'empty_text',
                'message' => 'No se pudo extraer texto del documento. ' .
                             'Asegúrese de que el documento no sea una imagen escaneada de baja calidad.',
                'severity'=> 'error',
            ];
            return ['passes' => false, 'issues' => $issues, 'warnings' => $warnings];
        }

        // 2. Verificar longitud mínima
        if (mb_strlen(trim($text)) < self::MIN_TEXT_LENGTH) {
            $issues[] = [
                'type'    => 'insufficient_text',
                'message' => 'El texto extraído es demasiado corto (' .
                             mb_strlen(trim($text)) . ' caracteres). ' .
                             'El documento podría no ser legible.',
                'severity'=> 'error',
            ];
        }

        // 3. Verificar confianza del OCR
        if ($document->ocr_confidence !== null &&
            $document->ocr_confidence < self::MIN_OCR_CONFIDENCE) {
            $issues[] = [
                'type'    => 'low_confidence',
                'message' => "Confianza de OCR baja: {$document->ocr_confidence}%. " .
                             'Mínimo requerido: ' . self::MIN_OCR_CONFIDENCE . '%. ' .
                             'Considere re-escanear el documento con mejor calidad.',
                'severity'=> 'error',
            ];
        }

        // 4. Verificar orientación (detección básica de texto invertido)
        if ($this->detectUpsideDownText($text)) {
            $warnings[] = [
                'type'    => 'orientation',
                'message' => 'Se detectó texto que podría estar mal orientado. ' .
                             'Verifique que el documento fue escaneado correctamente.',
                'severity'=> 'warning',
            ];
        }

        // 5. Verificar presencia de caracteres extraños (corrupción)
        $garbledRatio = $this->calculateGarbledRatio($text);
        if ($garbledRatio > 0.3) {
            $issues[] = [
                'type'    => 'garbled_text',
                'message' => "Alto porcentaje de caracteres no reconocidos ({$garbledRatio}%). " .
                             'El OCR puede haber fallado. Intente con un documento de mayor calidad.',
                'severity'=> 'error',
            ];
        }

        // 6. Detectar si es un documento en blanco o plantilla vacía
        if ($this->isBlankDocument($text)) {
            $issues[] = [
                'type'    => 'blank_document',
                'message' => 'El documento parece estar en blanco o ser solo una plantilla sin datos.',
                'severity'=> 'error',
            ];
        }

        return [
            'passes'   => empty($issues),
            'issues'   => $issues,
            'warnings' => $warnings,
        ];
    }

    private function detectUpsideDownText(string $text): bool
    {
        // Detección heurística: buscar caracteres específicos que Tesseract
        // produce cuando el texto está invertido
        $upsideDownPatterns = [
            '/\b[\x{0250}-\x{02AF}]{10,}/u', // IPA extensions (común en texto invertido)
        ];

        foreach ($upsideDownPatterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return true;
            }
        }

        return false;
    }

    private function calculateGarbledRatio(string $text): float
    {
        $total = mb_strlen($text);
        if ($total === 0) return 0;

        // Contar caracteres no-alfanuméricos y caracteres de control
        $garbled = preg_match_all('/[^\p{L}\p{N}\p{P}\p{Z}\n\r]/u', $text);

        return $garbled / $total;
    }

    private function isBlankDocument(string $text): bool
    {
        // Remover espacios, saltos de línea y caracteres comunes de plantillas
        $cleaned = preg_replace('/[\s\-\_\=\*\.\,\:\;\(\)\[\]\{\}\|\/\\\\]+/', '', $text);

        // Si después de limpiar quedan menos de 20 caracteres, es probablemente blanco
        return mb_strlen($cleaned) < 20;
    }
}
```

---

## 13.4 Validación Semántica (Operador GESDOC)

La validación manual por parte del operador utiliza una interfaz Filament/Livewire.

```php
<?php

namespace App\Livewire;

use App\Models\Document;
use App\Models\Procedure;
use App\Notifications\DocumentValidatedNotification;
use App\Notifications\DocumentRejectedNotification;
use Livewire\Component;

class DocumentValidationPanel extends Component
{
    public Document $document;
    public Procedure $procedure;
    public string $rejectionReason = '';
    public string $operatorNotes = '';
    public bool $showRejectionForm = false;

    protected array $rules = [
        'rejectionReason' => 'required_if:action,reject|string|min:10|max:1000',
        'operatorNotes'   => 'nullable|string|max:2000',
    ];

    public function mount(Document $document)
    {
        $this->document = $document;
        $this->procedure = $document->procedure;

        // Verificar autorización
        if (!auth()->user()->hasRole('GESDOC')) {
            abort(403, 'No autorizado para validar documentos');
        }
    }

    public function approve()
    {
        $this->authorize('validate', $this->document);

        $this->document->update([
            'status'         => 'VALIDADO',
            'validated_by'   => auth()->id(),
            'validated_at'   => now(),
            'operator_notes' => $this->operatorNotes,
        ]);

        // Registrar en log de auditoría
        activity()
            ->performedOn($this->document)
            ->causedBy(auth()->user())
            ->withProperties(['action' => 'document_validated'])
            ->log('Documento validado');

        // Notificar al asegurado
        $this->document->user->notify(
            new DocumentValidatedNotification($this->document)
        );

        session()->flash('message', 'Documento validado exitosamente.');
        $this->dispatch('document-validated');
    }

    public function showRejectForm()
    {
        $this->showRejectionForm = true;
    }

    public function reject()
    {
        $this->validate([
            'rejectionReason' => 'required|string|min:10|max:1000',
        ]);

        $this->authorize('validate', $this->document);

        $this->document->update([
            'status'            => 'RECHAZADO',
            'validated_by'      => auth()->id(),
            'validated_at'      => now(),
            'rejection_reason'  => $this->rejectionReason,
            'operator_notes'    => $this->operatorNotes,
        ]);

        // Registrar en log de auditoría
        activity()
            ->performedOn($this->document)
            ->causedBy(auth()->user())
            ->withProperties([
                'action'           => 'document_rejected',
                'rejection_reason' => $this->rejectionReason,
            ])
            ->log('Documento rechazado');

        // Notificar al asegurado con el motivo
        $this->document->user->notify(
            new DocumentRejectedNotification($this->document, $this->rejectionReason)
        );

        $this->showRejectionForm = false;
        $this->rejectionReason = '';
        session()->flash('message', 'Documento rechazado. Se notificó al asegurado.');
        $this->dispatch('document-rejected');
    }

    public function render()
    {
        return view('livewire.document-validation-panel', [
            'documentVersions' => Document::where('procedure_id', $this->procedure->id)
                ->where('original_name', $this->document->original_name)
                ->orderBy('version', 'desc')
                ->get(),
            'validationHistory' => $this->document->validations()->latest()->get(),
        ]);
    }
}
```

---

## 13.5 Estados de Validación y Transiciones

### Diagrama de estados:

```
                    ┌──────────────┐
                    │ PENDIENTE     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ EN_REVISION   │
                    └──┬────────┬──┘
                       │        │
              ┌────────▼──┐  ┌──▼──────────┐
              │ VALIDADO   │  │ RECHAZADO    │
              └────────────┘  └──┬───────────┘
                                 │
                          ┌──────▼───────┐
                          │ REENVIADO     │ (nueva versión)
                          └──────────────┘
```

### Definición en el modelo:

```php
<?php

namespace App\Models;

use App\Enums\DocumentStatus;

class Document extends Model
{
    // ...
    protected $casts = [
        'status' => DocumentStatus::class,
    ];

    /**
     * Transiciones de estado permitidas.
     */
    public static array $allowedTransitions = [
        'PENDIENTE'                 => ['EN_REVISION'],
        'EN_REVISION'               => ['VALIDADO', 'RECHAZADO'],
        'RECHAZADO'                 => ['PENDIENTE'], // Al re-subir nueva versión
        'VALIDADO'                  => [],            // Estado final
    ];

    /**
     * Cambia el estado verificando transición válida.
     */
    public function transitionTo(string $newStatus): void
    {
        $current = $this->status instanceof DocumentStatus
            ? $this->status->value
            : $this->status;

        $allowed = self::$allowedTransitions[$current] ?? [];

        if (!in_array($newStatus, $allowed)) {
            throw new \InvalidArgumentException(
                "Transición inválida: {$current} → {$newStatus}"
            );
        }

        $this->status = $newStatus;
        $this->save();
    }
}
```

### Enum de estados:

```php
<?php

namespace App\Enums;

enum DocumentStatus: string
{
    case PENDIENTE    = 'PENDIENTE';
    case EN_REVISION  = 'EN_REVISION';
    case VALIDADO     = 'VALIDADO';
    case RECHAZADO    = 'RECHAZADO';
    case REENVIADO    = 'REENVIADO';

    public function label(): string
    {
        return match ($this) {
            self::PENDIENTE   => 'Pendiente de revisión',
            self::EN_REVISION => 'En revisión',
            self::VALIDADO    => 'Validado',
            self::RECHAZADO   => 'Rechazado',
            self::REENVIADO   => 'Reenviado (nueva versión)',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDIENTE   => 'warning',
            self::EN_REVISION => 'info',
            self::VALIDADO    => 'success',
            self::RECHAZADO   => 'danger',
            self::REENVIADO   => 'secondary',
        };
    }
}
```

---

## 13.6 Interfaz de Validación (Vista Blade)

```blade
<div class="grid grid-cols-12 gap-4">
    <!-- Vista previa del documento (columna izquierda) -->
    <div class="col-span-7">
        <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold mb-3">
                Documento: {{ $document->original_name }}
                <span class="text-sm text-gray-500">v{{ $document->version }}</span>
            </h3>

            @if(str_starts_with($document->mime_type, 'image/'))
                <img src="{{ Storage::disk('s3')->temporaryUrl($document->storage_path, now()->addMinutes(10)) }}"
                     class="w-full object-contain border rounded" alt="Vista previa">
            @elseif($document->mime_type === 'application/pdf')
                <iframe src="{{ Storage::disk('s3')->temporaryUrl($document->storage_path, now()->addMinutes(10)) }}"
                        class="w-full h-[600px] border rounded"></iframe>
            @endif

            @if($document->ocr_text)
                <details class="mt-4">
                    <summary class="cursor-pointer font-medium text-blue-600">
                        Texto extraído (OCR)
                    </summary>
                    <pre class="mt-2 p-3 bg-gray-100 rounded text-sm max-h-64 overflow-y-auto">{{ $document->ocr_text }}</pre>
                    @if($document->ocr_confidence)
                        <p class="text-xs text-gray-500 mt-1">
                            Confianza OCR: {{ number_format($document->ocr_confidence, 1) }}%
                        </p>
                    @endif
                </details>
            @endif
        </div>
    </div>

    <!-- Datos del trámite y validación (columna derecha) -->
    <div class="col-span-5 space-y-4">
        <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold mb-2">Datos del Trámite</h3>
            <table class="w-full text-sm">
                <tr><td class="font-medium py-1">Tipo:</td><td>{{ $procedure->type->label() }}</td></tr>
                <tr><td class="font-medium py-1">Asegurado:</td><td>{{ $procedure->user->full_name }}</td></tr>
                <tr><td class="font-medium py-1">DNI:</td><td>{{ $procedure->user->dni }}</td></tr>
                <tr><td class="font-medium py-1">Fecha creación:</td><td>{{ $procedure->created_at->format('d/m/Y H:i') }}</td></tr>
                <tr><td class="font-medium py-1">Estado:</td>
                    <td>
                        <span class="px-2 py-1 rounded text-xs bg-{{ $procedure->status->color() }}-100 text-{{ $procedure->status->color() }}-800">
                            {{ $procedure->status->label() }}
                        </span>
                    </td>
                </tr>
                <tr><td class="font-medium py-1">Descripción:</td><td>{{ $procedure->description }}</td></tr>
            </table>
        </div>

        <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold mb-2">Validación</h3>

            @if($document->status->value === 'PENDIENTE' || $document->status->value === 'EN_REVISION')
                <div class="space-y-3">
                    <div>
                        <label for="operatorNotes" class="block text-sm font-medium mb-1">Notas del operador:</label>
                        <textarea id="operatorNotes" wire:model="operatorNotes"
                                  class="w-full border rounded p-2 text-sm" rows="3"
                                  placeholder="Observaciones sobre el documento..."></textarea>
                    </div>

                    <div class="flex gap-2">
                        <button wire:click="approve" wire:loading.attr="disabled"
                                class="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50">
                            Validar Documento
                        </button>
                        <button wire:click="showRejectForm" wire:loading.attr="disabled"
                                class="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50">
                            Rechazar Documento
                        </button>
                    </div>
                </div>

                @if($showRejectionForm)
                    <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <label for="rejectionReason" class="block text-sm font-medium text-red-800 mb-1">
                            Motivo de rechazo:
                        </label>
                        <textarea id="rejectionReason" wire:model="rejectionReason"
                                  class="w-full border border-red-300 rounded p-2 text-sm" rows="3"
                                  placeholder="Explique detalladamente el motivo del rechazo..."></textarea>
                        @error('rejectionReason')
                            <p class="text-red-600 text-xs mt-1">{{ $message }}</p>
                        @enderror
                        <div class="flex gap-2 mt-2">
                            <button wire:click="reject" class="flex-1 bg-red-600 text-white py-1.5 px-3 rounded text-sm hover:bg-red-700">
                                Confirmar Rechazo
                            </button>
                            <button wire:click="$set('showRejectionForm', false)"
                                    class="flex-1 bg-gray-300 text-gray-700 py-1.5 px-3 rounded text-sm hover:bg-gray-400">
                                Cancelar
                            </button>
                        </div>
                    </div>
                @endif
            @else
                <div class="p-3 rounded text-sm bg-{{ $document->status->color() }}-100 text-{{ $document->status->color() }}-800">
                    Estado: <strong>{{ $document->status->label() }}</strong>
                    @if($document->validated_at)
                        <br>Fecha: {{ $document->validated_at->format('d/m/Y H:i') }}
                    @endif
                    @if($document->rejection_reason)
                        <br>Motivo: {{ $document->rejection_reason }}
                    @endif
                    @if($document->operator_notes)
                        <br>Notas: {{ $document->operator_notes }}
                    @endif
                </div>
            @endif
        </div>

        @if($documentVersions->count() > 1)
            <div class="bg-white rounded-lg shadow p-4">
                <h3 class="text-lg font-semibold mb-2">Historial de Versiones</h3>
                <div class="space-y-2">
                    @foreach($documentVersions as $version)
                        <div class="flex items-center justify-between p-2 rounded text-sm
                                   {{ $version->id === $document->id ? 'bg-blue-100' : 'bg-gray-50' }}">
                            <span>v{{ $version->version }}</span>
                            <span class="px-2 py-0.5 rounded text-xs bg-{{ $version->status->color() }}-100 text-{{ $version->status->color() }}-800">
                                {{ $version->status->label() }}
                            </span>
                            <span class="text-gray-500 text-xs">{{ $version->created_at->format('d/m/Y') }}</span>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
    </div>
</div>
```

---

## 13.7 Versionado de Documentos

Cuando un documento es rechazado, el asegurado puede subir una nueva versión corregida.

```php
/**
 * Lógica de versionado en DocumentUpload Livewire component.
 */
private function getNextVersion(): int
{
    $lastVersion = Document::where('procedure_id', $this->procedureId)
        ->where('original_name', $this->originalName ?? $this->file->getClientOriginalName())
        ->max('version');

    return ($lastVersion ?? 0) + 1;
}

/**
 * Al subir una nueva versión, marcar versiones anteriores como REENVIADO.
 */
private function markPreviousVersionsAsReplaced(Document $newDocument): void
{
    Document::where('procedure_id', $newDocument->procedure_id)
        ->where('original_name', $newDocument->original_name)
        ->where('id', '!=', $newDocument->id)
        ->whereIn('status', ['RECHAZADO'])
        ->update(['status' => 'REENVIADO']);
}
```

---

## 13.8 Seguridad y Autorización

### Policy de Documento:

```php
<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    /**
     * Solo el dueño del trámite puede ver el documento.
     */
    public function view(User $user, Document $document): bool
    {
        return $user->id === $document->user_id
            || $user->hasRole(['GESDOC', 'admin']);
    }

    /**
     * Solo dueño puede subir documentos para su trámite.
     */
    public function create(User $user, int $procedureId): bool
    {
        $procedure = \App\Models\Procedure::find($procedureId);
        return $procedure && $user->id === $procedure->user_id;
    }

    /**
     * Solo operadores GESDOC pueden validar.
     */
    public function validate(User $user, Document $document): bool
    {
        return $user->hasRole('GESDOC')
            && in_array($document->status->value ?? $document->status, ['PENDIENTE', 'EN_REVISION']);
    }

    /**
     * Solo el dueño puede eliminar borradores (no validados).
     */
    public function delete(User $user, Document $document): bool
    {
        return $user->id === $document->user_id
            && in_array($document->status->value ?? $document->status, ['PENDIENTE']);
    }
}
```

### Registro en AuthServiceProvider:

```php
protected $policies = [
    Document::class  => \App\Policies\DocumentPolicy::class,
    Procedure::class => \App\Policies\ProcedurePolicy::class,
];
```

### Verificación en rutas:

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/documents/{document}/preview', [DocumentController::class, 'preview'])
        ->middleware('can:view,document');

    Route::post('/procedures/{procedure}/documents', [DocumentController::class, 'store'])
        ->middleware('can:create,document,procedure');
});
```

### Middleware de roles:

```php
// app/Http/Middleware/EnsureUserHasRole.php
public function handle($request, Closure $next, ...$roles): mixed
{
    if (!$request->user() || !$request->user()->hasAnyRole($roles)) {
        abort(403, 'No tiene los permisos necesarios');
    }

    return $next($request);
}
```

---

## 13.9 Notificaciones

### Notificación de documento validado:

```php
<?php

namespace App\Notifications;

use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DocumentValidatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private Document $document,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Documento Validado — EsSalud')
            ->greeting('Hola ' . $notifiable->first_name)
            ->line("Su documento '{$this->document->original_name}' ha sido validado exitosamente.")
            ->line("Trámite: {$this->document->procedure->type->label()}")
            ->action('Ver Trámite', route('procedures.show', $this->document->procedure_id))
            ->line('Gracias por usar EsSalud.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title'       => 'Documento Validado',
            'message'     => "Documento '{$this->document->original_name}' validado.",
            'document_id' => $this->document->id,
            'procedure_id'=> $this->document->procedure_id,
        ];
    }
}
```

### Notificación de documento rechazado:

```php
class DocumentRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private Document $document,
        private string $reason,
    ) {}

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Documento Rechazado — EsSalud')
            ->greeting('Hola ' . $notifiable->first_name)
            ->line("Su documento '{$this->document->original_name}' ha sido rechazado.")
            ->line("Motivo: {$this->reason}")
            ->action('Subir Nueva Versión', route('procedures.show', $this->document->procedure_id))
            ->line('Por favor corrija las observaciones y suba una nueva versión.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title'       => 'Documento Rechazado',
            'message'     => "Documento '{$this->document->original_name}' rechazado: {$this->reason}",
            'document_id' => $this->document->id,
            'procedure_id'=> $this->document->procedure_id,
            'reason'      => $this->reason,
        ];
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }
}
```

---

## 13.10 Tabla de Validaciones (Migración)

```php
Schema::create('document_validations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('document_id')->constrained()->cascadeOnDelete();
    $table->foreignId('validated_by')->constrained('users')->cascadeOnDelete();
    $table->string('action'); // VALIDADO, RECHAZADO
    $table->text('notes')->nullable();
    $table->text('rejection_reason')->nullable();
    $table->timestamp('validated_at');
    $table->timestamps();
});

// Agregar columnas a documents
Schema::table('documents', function (Blueprint $table) {
    $table->string('status')->default('PENDIENTE')->change();
    $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('validated_at')->nullable();
    $table->text('rejection_reason')->nullable();
    $table->text('operator_notes')->nullable();
    $table->integer('version')->default(1);
});
```

---

## 13.11 Resumen del Flujo de Validación

| Responsable | Acción | Sistema |
|---|---|---|
| Sistema | Validar MIME, tamaño, extensión, virus | `AutomaticDocumentValidator` |
| Sistema | Ejecutar OCR y validar confianza | `ProcessOcr` job + `ContentDocumentValidator` |
| Sistema | Asignar estado `EN_REVISION` | Trigger automático post-OCR |
| Operador GESDOC | Revisar documento vs. trámite | `DocumentValidationPanel` Livewire |
| Operador GESDOC | Validar o rechazar | Botones en la interfaz |
| Sistema | Notificar al asegurado | Event + Listener + Notification |
| Asegurado | Corregir y re-subir (si rechazado) | `DocumentUpload` (nueva versión) |
