# 14. Dashboard Administrativo — EsSalud (Laravel)

Dashboard administrativo de la plataforma EsSalud, construido con Filament 3, widgets de Livewire y Chart.js para visualizacion de KPIs, analitica de tramites, productividad de operadores, metricas de chatbot y reportes exportables.

---

## 14.1 Stack Tecnologico

| Capa | Tecnologia | Proposito |
|---|---|---|
| Admin Panel | Filament 3 | Framework de panel administrativo |
| Widgets | Filament Widgets + Livewire 3 | Componentes reactivos para KPI cards y graficos |
| Graficos | Chart.js (via filament-chart-plugin) | Pie, bar, line charts |
| Exportacion | Laravel Excel + Laravel DomPDF | Reportes Excel y PDF |
| Auditoria | Spatie Laravel Activitylog | Registro de actividades del sistema |
| Alertas | Filament Notifications | Alertas configurables con umbrales |
| Metricas | AdminService (PHP) | Logica de agregacion y queries |

---

## 14.2 Paginas del Dashboard

### Estructura de navegacion en Filament:

```php
<?php

namespace App\Providers\Filament;

use Filament\Panel;
use Filament\PanelProvider;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors(['primary' => '#0066cc'])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->pages([
                \App\Filament\Pages\Dashboard\Overview::class,
                \App\Filament\Pages\Dashboard\Procedures::class,
                \App\Filament\Pages\Dashboard\Operators::class,
                \App\Filament\Pages\Dashboard\Chatbot::class,
                \App\Filament\Pages\Dashboard\Documents::class,
                \App\Filament\Pages\Dashboard\Users::class,
                \App\Filament\Pages\Dashboard\Audit::class,
            ])
            ->widgets([
                \App\Filament\Widgets\KpiCard::class,
                \App\Filament\Widgets\ProcedureChart::class,
                \App\Filament\Widgets\OperatorsChart::class,
                \App\Filament\Widgets\ChatbotChart::class,
            ])
            ->middleware(['auth', 'role:admin']);
    }
}
```

---

## 14.3 AdminService (Logica de Metricas)

```php
<?php

namespace App\Services;

use App\Models\Procedure;
use App\Models\User;
use App\Models\Document;
use App\Models\ChatInteraction;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminService
{
    /**
     * KPIs principales para el dashboard de Overview.
     */
    public function getOverviewKpis(): array
    {
        return [
            'pending_procedures'      => $this->getPendingProceduresCount(),
            'approved_today'          => $this->getApprovedTodayCount(),
            'avg_resolution_hours'    => $this->getAvgResolutionHours(),
            'active_users'            => $this->getActiveUsersCount(),
            'chatbot_faq_rate'        => $this->getChatbotFaqResolutionRate(),
            'chatbot_rag_rate'        => $this->getChatbotRagResolutionRate(),
            'escalation_rate'         => $this->getEscalationRate(),
            'documents_pending_review'=> $this->getDocumentsPendingReview(),
            'openai_errors_today'     => $this->getOpenAiErrorsToday(),
            'total_users'             => User::count(),
            'total_procedures'        => Procedure::count(),
            'new_users_this_month'    => $this->getNewUsersThisMonth(),
        ];
    }

    public function getPendingProceduresCount(): int
    {
        return Procedure::where('status', 'PENDIENTE')->count();
    }

    public function getApprovedTodayCount(): int
    {
        return Procedure::where('status', 'APROBADO')
            ->whereDate('approved_at', Carbon::today())
            ->count();
    }

    public function getAvgResolutionHours(): float
    {
        return round(Procedure::where('status', 'APROBADO')
            ->whereNotNull('approved_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) as avg_hours')
            ->value('avg_hours') ?? 0, 1);
    }

    public function getActiveUsersCount(): int
    {
        return User::where('last_active_at', '>=', Carbon::now()->subHours(24))->count();
    }

    public function getChatbotFaqResolutionRate(): float
    {
        $total = ChatInteraction::count();
        if ($total === 0) return 0;

        $faqCount = ChatInteraction::where('resolved_by', 'faq')->count();
        return round($faqCount / $total * 100, 1);
    }

    public function getChatbotRagResolutionRate(): float
    {
        $total = ChatInteraction::count();
        if ($total === 0) return 0;

        $ragCount = ChatInteraction::where('resolved_by', 'rag')->count();
        return round($ragCount / $total * 100, 1);
    }

    public function getEscalationRate(): float
    {
        $total = ChatInteraction::count();
        if ($total === 0) return 0;

        $escalated = ChatInteraction::where('was_escalated', true)->count();
        return round($escalated / $total * 100, 1);
    }

    public function getDocumentsPendingReview(): int
    {
        return Document::whereIn('status', ['PENDIENTE', 'EN_REVISION'])->count();
    }

    public function getOpenAiErrorsToday(): int
    {
        return DB::table('failed_jobs')
            ->whereDate('failed_at', Carbon::today())
            ->where(function ($q) {
                $q->where('exception', 'like', '%OpenAI%')
                  ->orWhere('exception', 'like', '%OpenAIService%');
            })
            ->count();
    }

    public function getNewUsersThisMonth(): int
    {
        return User::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();
    }
}
```

---

## 14.4 Pagina 1: Overview (KPIs Principales)

### Filament Page:

```php
<?php

namespace App\Filament\Pages\Dashboard;

use App\Filament\Widgets\KpiCard;
use App\Filament\Widgets\ProcedureStatusChart;
use App\Filament\Widgets\ProceduresPerMonthChart;
use Filament\Pages\Dashboard as BaseDashboard;

class Overview extends BaseDashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-presentation-chart-line';
    protected static ?string $navigationLabel = 'Overview';
    protected static ?string $title = 'Dashboard -- EsSalud';
    protected static string $view = 'filament.pages.dashboard.overview';

    protected function getHeaderWidgets(): array
    {
        return [
            KpiCard::make(['label' => 'Tramites Pendientes', 'value' => 'pending_procedures', 'color' => 'warning', 'icon' => 'heroicon-o-clock']),
            KpiCard::make(['label' => 'Aprobados Hoy', 'value' => 'approved_today', 'color' => 'success', 'icon' => 'heroicon-o-check-circle']),
            KpiCard::make(['label' => 'T. Promedio Resolucion', 'value' => 'avg_resolution_hours', 'color' => 'info', 'icon' => 'heroicon-o-clock', 'suffix' => ' hrs']),
            KpiCard::make(['label' => 'Usuarios Activos (24h)', 'value' => 'active_users', 'color' => 'primary', 'icon' => 'heroicon-o-user-group']),
            KpiCard::make(['label' => 'Resolucion FAQ', 'value' => 'chatbot_faq_rate', 'color' => 'success', 'icon' => 'heroicon-o-chat-bubble-left-right', 'suffix' => '%']),
            KpiCard::make(['label' => 'Docs. por Validar', 'value' => 'documents_pending_review', 'color' => 'danger', 'icon' => 'heroicon-o-document']),
        ];
    }

    protected function getFooterWidgets(): array
    {
        return [
            ProcedureStatusChart::class,
            ProceduresPerMonthChart::class,
        ];
    }
}
```

### Widget KPI Card:

```php
<?php

namespace App\Filament\Widgets;

use App\Services\AdminService;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class KpiCard extends BaseWidget
{
    public array $cards = [];

    protected function getStats(): array
    {
        $service = app(AdminService::class);
        $stats = [];

        foreach ($this->cards as $card) {
            $value = $service->getOverviewKpis()[$card['value']] ?? 0;

            $stat = Stat::make($card['label'], $value . ($card['suffix'] ?? ''))
                ->color($card['color'] ?? 'primary')
                ->icon($card['icon'] ?? 'heroicon-o-presentation-chart-line');

            if (isset($card['previous'])) {
                $previousValue = $service->getOverviewKpis()[$card['previous']] ?? 0;
                if ($previousValue > 0) {
                    $change = round(($value - $previousValue) / $previousValue * 100, 1);
                    $stat->description($change >= 0 ? "+{$change}%" : "{$change}%")
                         ->descriptionIcon($change >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down');
                }
            }

            $stats[] = $stat;
        }

        return $stats;
    }
}
```

---

## 14.5 Pagina 2: Tramites

### Widget de distribucion por estado (Pie Chart):

```php
<?php

namespace App\Filament\Widgets;

use App\Models\Procedure;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class ProcedureStatusChart extends ChartWidget
{
    protected static ?string $heading = 'Distribucion de Tramites por Estado';
    protected static ?string $maxHeight = '400px';
    protected int | string | array $columnSpan = '1/2';

    protected function getType(): string
    {
        return 'pie';
    }

    protected function getData(): array
    {
        $data = Procedure::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        return [
            'datasets' => [
                [
                    'label' => 'Tramites',
                    'data'  => $data->pluck('count')->toArray(),
                    'backgroundColor' => [
                        '#FFC107', // PENDIENTE - warning
                        '#2196F3', // EN_REVISION - info
                        '#4CAF50', // APROBADO - success
                        '#F44336', // RECHAZADO - danger
                        '#9E9E9E', // CANCELADO - gray
                    ],
                ],
            ],
            'labels' => $data->pluck('status')->map(fn($s) => $s)->toArray(),
        ];
    }
}
```

### Widget de tramites por mes (Bar Chart):

```php
<?php

namespace App\Filament\Widgets;

use App\Models\Procedure;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class ProceduresPerMonthChart extends ChartWidget
{
    protected static ?string $heading = 'Tramites por Mes';
    protected static ?string $maxHeight = '400px';
    protected int | string | array $columnSpan = '1/2';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $proceduresByMonth = Procedure::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return [
            'datasets' => [
                [
                    'label' => 'Tramites creados',
                    'data'  => $proceduresByMonth->pluck('count')->toArray(),
                    'backgroundColor' => '#2196F3',
                    'borderColor' => '#1976D2',
                ],
            ],
            'labels' => $proceduresByMonth->pluck('month')->toArray(),
        ];
    }
}
```

### Tabla filtrable de tramites (Filament Page):

```php
<?php

namespace App\Filament\Pages\Dashboard;

use App\Models\Procedure;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class Procedures extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationLabel = 'Tramites';
    protected static string $view = 'filament.pages.dashboard.procedures';

    public function table(Table $table): Table
    {
        return $table
            ->query(Procedure::query()->with(['user', 'operator']))
            ->columns([
                Tables\Columns\TextColumn::make('id')->label('ID')->sortable(),
                Tables\Columns\TextColumn::make('user.full_name')->label('Asegurado')->searchable(),
                Tables\Columns\TextColumn::make('type')->label('Tipo')->badge(),
                Tables\Columns\TextColumn::make('status')->label('Estado')->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'PENDIENTE' => 'warning',
                        'EN_REVISION' => 'info',
                        'APROBADO' => 'success',
                        'RECHAZADO' => 'danger',
                        default => 'secondary',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Fecha')->dateTime('d/m/Y H:i')->sortable(),
                Tables\Columns\TextColumn::make('approved_at')
                    ->label('Resuelto')->dateTime('d/m/Y H:i')->placeholder('---'),
                Tables\Columns\TextColumn::make('operator.name')
                    ->label('Operador')->placeholder('Sin asignar'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'PENDIENTE'    => 'Pendiente',
                        'EN_REVISION'  => 'En Revision',
                        'APROBADO'     => 'Aprobado',
                        'RECHAZADO'    => 'Rechazado',
                    ]),
                Tables\Filters\SelectFilter::make('type')
                    ->options(Procedure::types()),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        \Filament\Forms\Components\DatePicker::make('from'),
                        \Filament\Forms\Components\DatePicker::make('until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['from'], fn($q, $d) => $q->whereDate('created_at', '>=', $d))
                            ->when($data['until'], fn($q, $d) => $q->whereDate('created_at', '<=', $d));
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('view')
                    ->url(fn(Procedure $record) => route('filament.admin.resources.procedures.view', $record))
                    ->icon('heroicon-o-eye'),
            ])
            ->defaultSort('created_at', 'desc')
            ->paginated([10, 25, 50, 100]);
    }
}
```

---

## 14.6 Pagina 3: Operadores (Productividad)

### Widget de productividad:

```php
<?php

namespace App\Filament\Widgets;

use App\Models\Procedure;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class OperatorsProductivityChart extends ChartWidget
{
    protected static ?string $heading = 'Tramites Procesados por Operador (Ultimos 30 dias)';
    protected static ?string $maxHeight = '400px';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $data = Procedure::where('status', 'APROBADO')
            ->where('approved_at', '>=', now()->subDays(30))
            ->join('users', 'procedures.approved_by', '=', 'users.id')
            ->select('users.name', DB::raw('COUNT(*) as count'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('count')
            ->limit(15)
            ->get();

        return [
            'datasets' => [
                [
                    'label' => 'Tramites procesados',
                    'data'  => $data->pluck('count')->toArray(),
                    'backgroundColor' => '#4CAF50',
                ],
            ],
            'labels' => $data->pluck('name')->toArray(),
        ];
    }
}
```

### Widget de tiempo promedio:

```php
<?php

namespace App\Filament\Widgets;

use App\Models\Procedure;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class OperatorsAvgTimeChart extends ChartWidget
{
    protected static ?string $heading = 'Tiempo Promedio por Operador (Horas)';
    protected static ?string $maxHeight = '400px';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $data = Procedure::where('status', 'APROBADO')
            ->whereNotNull('approved_by')
            ->join('users', 'procedures.approved_by', '=', 'users.id')
            ->select(
                'users.name',
                DB::raw('AVG(TIMESTAMPDIFF(HOUR, procedures.created_at, procedures.approved_at)) as avg_hours')
            )
            ->groupBy('users.id', 'users.name')
            ->orderBy('avg_hours')
            ->limit(15)
            ->get();

        return [
            'datasets' => [
                [
                    'label' => 'Horas promedio',
                    'data'  => $data->pluck('avg_hours')->map(fn($h) => round($h, 1))->toArray(),
                    'backgroundColor' => '#FF9800',
                ],
            ],
            'labels' => $data->pluck('name')->toArray(),
        ];
    }
}
```

### Carga actual por operador:

```php
public function getOperatorsCurrentLoad(): array
{
    return Procedure::where('status', 'EN_REVISION')
        ->whereNotNull('assigned_to')
        ->join('users', 'procedures.assigned_to', '=', 'users.id')
        ->select('users.name', DB::raw('COUNT(*) as load'))
        ->groupBy('users.id', 'users.name')
        ->orderByDesc('load')
        ->get()
        ->map(fn($r) => [
            'name' => $r->name,
            'load' => $r->load,
            'status' => match(true) {
                $r->load > 20 => 'danger',
                $r->load > 10 => 'warning',
                default => 'success',
            },
        ])
        ->toArray();
}
```

---

## 14.7 Pagina 4: Chatbot (Analitica)

### Widget de mensajes por dia (Line Chart):

```php
<?php

namespace App\Filament\Widgets;

use App\Models\ChatInteraction;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class ChatbotMessagesChart extends ChartWidget
{
    protected static ?string $heading = 'Mensajes del Chatbot por Dia';
    protected static ?string $maxHeight = '350px';

    protected function getType(): string
    {
        return 'line';
    }

    protected function getData(): array
    {
        $messages = ChatInteraction::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN resolved_by = 'faq' THEN 1 ELSE 0 END) as faq_count"),
                DB::raw("SUM(CASE WHEN resolved_by = 'rag' THEN 1 ELSE 0 END) as rag_count"),
                DB::raw("SUM(CASE WHEN was_escalated = 1 THEN 1 ELSE 0 END) as escalated_count")
            )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'datasets' => [
                [
                    'label' => 'Total',
                    'data'  => $messages->pluck('total')->toArray(),
                    'borderColor' => '#2196F3',
                    'backgroundColor' => 'rgba(33,150,243,0.1)',
                    'fill' => false,
                    'tension' => 0.3,
                ],
                [
                    'label' => 'FAQ',
                    'data'  => $messages->pluck('faq_count')->toArray(),
                    'borderColor' => '#4CAF50',
                    'backgroundColor' => 'rgba(76,175,80,0.1)',
                    'fill' => false,
                    'tension' => 0.3,
                ],
                [
                    'label' => 'RAG',
                    'data'  => $messages->pluck('rag_count')->toArray(),
                    'borderColor' => '#FF9800',
                    'backgroundColor' => 'rgba(255,152,0,0.1)',
                    'fill' => false,
                    'tension' => 0.3,
                ],
            ],
            'labels' => $messages->pluck('date')->toArray(),
        ];
    }
}
```

### Widget de feedback (Doughnut Chart):

```php
<?php

namespace App\Filament\Widgets;

use App\Models\ChatInteraction;
use Filament\Widgets\ChartWidget;

class ChatbotFeedbackChart extends ChartWidget
{
    protected static ?string $heading = 'Feedback de Usuarios (Ultimos 7 dias)';
    protected static ?string $maxHeight = '350px';

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getData(): array
    {
        $positive = ChatInteraction::where('feedback', 'positive')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $negative = ChatInteraction::where('feedback', 'negative')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $noFeedback = ChatInteraction::whereNull('feedback')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return [
            'datasets' => [
                [
                    'data'  => [$positive, $negative, $noFeedback],
                    'backgroundColor' => ['#4CAF50', '#F44336', '#9E9E9E'],
                ],
            ],
            'labels' => ['Positivo', 'Negativo', 'Sin feedback'],
        ];
    }
}
```

### Stats del chatbot:

```php
<?php

namespace App\Filament\Widgets;

use App\Models\ChatSession;
use App\Services\AdminService;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ChatbotStats extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $adminService = app(AdminService::class);

        return [
            Stat::make(
                'Sesiones Activas',
                ChatSession::where('last_activity', '>=', now()->subMinutes(15))->count()
            )->color('success')->icon('heroicon-o-chat-bubble-left-right'),

            Stat::make(
                'Tasa Escalacion',
                number_format($adminService->getEscalationRate(), 1) . '%'
            )->color('warning')->icon('heroicon-o-arrow-up-circle'),

            Stat::make(
                'Errores OpenAI hoy',
                $adminService->getOpenAiErrorsToday()
            )->color('danger')->icon('heroicon-o-exclamation-circle'),
        ];
    }
}
```

---

## 14.8 Pagina 5: Documentos

```php
<?php

namespace App\Filament\Pages\Dashboard;

use App\Models\Document;
use App\Services\QdrantService;
use App\Services\AdminService;
use Filament\Pages\Page;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;

class Documents extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-document-arrow-up';
    protected static ?string $navigationLabel = 'Documentos';
    protected static string $view = 'filament.pages.dashboard.documents';

    protected function getHeaderWidgets(): array
    {
        $qdrant = app(QdrantService::class);

        return [
            \Filament\Widgets\StatsOverviewWidget::make([
                Stat::make('Documentos Indexados', Document::where('status', 'INDEXED')->count())
                    ->icon('heroicon-o-document-check'),
                Stat::make('Chunks en Qdrant', $qdrant->collectionExists() ? $qdrant->count() : 0)
                    ->icon('heroicon-o-cube'),
                Stat::make('Ultima Indexacion', Document::whereNotNull('indexed_at')->max('indexed_at')?->diffForHumans() ?? 'N/A')
                    ->icon('heroicon-o-clock'),
                Stat::make('Docs. por Validar', app(AdminService::class)->getDocumentsPendingReview())
                    ->color('warning')->icon('heroicon-o-exclamation-circle'),
            ]),
        ];
    }

    public function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->query(Document::query()->with('user')->latest())
            ->columns([
                Tables\Columns\TextColumn::make('id')->label('ID')->sortable(),
                Tables\Columns\TextColumn::make('original_name')->label('Nombre')->searchable()->limit(40),
                Tables\Columns\TextColumn::make('user.full_name')->label('Subido por'),
                Tables\Columns\TextColumn::make('mime_type')->label('Tipo')->badge(),
                Tables\Columns\TextColumn::make('size_bytes')
                    ->label('Tamano')
                    ->formatStateUsing(fn($state) => number_format($state / 1024, 1) . ' KB'),
                Tables\Columns\TextColumn::make('status')->label('Estado')->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'INDEXED' => 'success',
                        'PENDING_OCR' => 'warning',
                        'OCR_DONE' => 'info',
                        'OCR_FAILED' => 'danger',
                        default => 'secondary',
                    }),
                Tables\Columns\TextColumn::make('chunks_count')->label('Chunks')->placeholder('---'),
                Tables\Columns\TextColumn::make('created_at')->label('Fecha')->dateTime('d/m/Y')->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'INDEXED'    => 'Indexado',
                        'PENDING_OCR'=> 'Pendiente OCR',
                        'OCR_DONE'   => 'OCR Completado',
                        'OCR_FAILED' => 'OCR Fallido',
                    ]),
                Tables\Filters\SelectFilter::make('mime_type')
                    ->options([
                        'application/pdf' => 'PDF',
                        'image/jpeg' => 'JPEG',
                        'image/png'  => 'PNG',
                    ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->paginated([10, 25, 50]);
    }
}
```

---

## 14.9 Pagina 6: Usuarios

```php
<?php

namespace App\Filament\Pages\Dashboard;

use App\Models\User;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;

class Users extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationLabel = 'Usuarios';
    protected static string $view = 'filament.pages.dashboard.users';

    protected function getHeaderWidgets(): array
    {
        return [
            \Filament\Widgets\StatsOverviewWidget::make([
                \Filament\Widgets\StatsOverviewWidget\Stat::make('Total Usuarios', User::count())
                    ->icon('heroicon-o-user-group'),
                \Filament\Widgets\StatsOverviewWidget\Stat::make('Nuevos este mes', User::whereMonth('created_at', now()->month)->count())
                    ->icon('heroicon-o-user-plus')->color('success'),
                \Filament\Widgets\StatsOverviewWidget\Stat::make('Activos (24h)', User::where('last_active_at', '>=', now()->subDay())->count())
                    ->icon('heroicon-o-bolt')->color('info'),
                \Filament\Widgets\StatsOverviewWidget\Stat::make('Asegurados', User::whereHas('roles', fn($q) => $q->where('name', 'asegurado'))->count())
                    ->icon('heroicon-o-identification'),
                \Filament\Widgets\StatsOverviewWidget\Stat::make('Operadores GESDOC', User::whereHas('roles', fn($q) => $q->where('name', 'GESDOC'))->count())
                    ->icon('heroicon-o-shield-check'),
            ]),
        ];
    }

    public function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->query(User::with('roles')->latest())
            ->columns([
                Tables\Columns\TextColumn::make('id')->label('ID')->sortable(),
                Tables\Columns\TextColumn::make('full_name')->label('Nombre')->searchable(),
                Tables\Columns\TextColumn::make('email')->label('Email')->searchable(),
                Tables\Columns\TextColumn::make('dni')->label('DNI')->searchable(),
                Tables\Columns\TextColumn::make('roles.name')
                    ->label('Rol')
                    ->badge()
                    ->formatStateUsing(fn($state) => is_array($state) ? implode(', ', $state) : $state),
                Tables\Columns\TextColumn::make('created_at')->label('Registro')->dateTime('d/m/Y')->sortable(),
                Tables\Columns\TextColumn::make('last_active_at')->label('Ult. Actividad')->dateTime('d/m/Y H:i')->placeholder('---'),
                Tables\Columns\IconColumn::make('is_active')->label('Activo')->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->relationship('roles', 'name')
                    ->options([
                        'admin'    => 'Administrador',
                        'GESDOC'   => 'Operador GESDOC',
                        'asegurado'=> 'Asegurado',
                    ]),
                Tables\Filters\Filter::make('is_active')
                    ->query(fn($q) => $q->where('is_active', true))
                    ->label('Solo activos'),
            ])
            ->defaultSort('created_at', 'desc')
            ->paginated([10, 25, 50]);
    }
}
```

### Widget de registros por mes:

```php
<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class UserRegistrationsChart extends ChartWidget
{
    protected static ?string $heading = 'Usuarios Registrados por Mes';
    protected static ?string $maxHeight = '350px';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $data = User::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return [
            'datasets' => [
                [
                    'label' => 'Nuevos usuarios',
                    'data'  => $data->pluck('count')->toArray(),
                    'backgroundColor' => '#9C27B0',
                    'borderColor' => '#7B1FA2',
                ],
            ],
            'labels' => $data->pluck('month')->toArray(),
        ];
    }
}
```

---

## 14.10 Alertas Configurables

Sistema de alertas basado en umbrales configurables desde la base de datos.

### Configuracion en BD (tabla `alert_thresholds`):

```php
Schema::create('alert_thresholds', function (Blueprint $table) {
    $table->id();
    $table->string('metric_key')->unique();
    $table->string('metric_label');
    $table->string('condition'); // 'greater_than', 'less_than'
    $table->float('threshold');
    $table->string('severity')->default('warning'); // info, warning, danger
    $table->boolean('enabled')->default(true);
    $table->timestamps();
});

// Seed de umbrales por defecto
AlertThreshold::insert([
    ['metric_key' => 'pending_procedures',   'metric_label' => 'Tramites pendientes',        'condition' => 'greater_than', 'threshold' => 100,  'severity' => 'warning'],
    ['metric_key' => 'chatbot_resolution',    'metric_label' => 'Tasa resolucion chatbot',    'condition' => 'less_than',    'threshold' => 60,   'severity' => 'danger'],
    ['metric_key' => 'openai_errors',         'metric_label' => 'Errores OpenAI',             'condition' => 'greater_than', 'threshold' => 10,   'severity' => 'danger'],
    ['metric_key' => 'documents_pending',     'metric_label' => 'Documentos sin validar',     'condition' => 'greater_than', 'threshold' => 50,   'severity' => 'warning'],
    ['metric_key' => 'avg_resolution_hours',  'metric_label' => 'Tiempo promedio resolucion', 'condition' => 'greater_than', 'threshold' => 72,   'severity' => 'warning'],
    ['metric_key' => 'escalation_rate',       'metric_label' => 'Tasa de escalacion',         'condition' => 'greater_than', 'threshold' => 30,   'severity' => 'danger'],
]);
```

### Servicio de alertas:

```php
<?php

namespace App\Services;

use App\Models\AlertThreshold;
use Filament\Notifications\Notification;

class AlertService
{
    public function checkThresholds(AdminService $adminService): array
    {
        $alerts = [];
        $thresholds = AlertThreshold::where('enabled', true)->get();
        $kpis = $adminService->getOverviewKpis();

        foreach ($thresholds as $threshold) {
            $currentValue = $kpis[$threshold->metric_key] ?? null;
            if ($currentValue === null) continue;

            $triggered = match ($threshold->condition) {
                'greater_than' => $currentValue > $threshold->threshold,
                'less_than'    => $currentValue < $threshold->threshold,
                default => false,
            };

            if ($triggered) {
                $alerts[] = [
                    'metric'    => $threshold->metric_label,
                    'key'       => $threshold->metric_key,
                    'value'     => $currentValue,
                    'threshold' => $threshold->threshold,
                    'condition' => $threshold->condition,
                    'severity'  => $threshold->severity,
                    'message'   => $this->buildAlertMessage($threshold, $currentValue),
                ];
            }
        }

        return $alerts;
    }

    private function buildAlertMessage(AlertThreshold $threshold, float $value): string
    {
        $comparison = $threshold->condition === 'greater_than' ? 'supera' : 'esta por debajo de';
        return "{$threshold->metric_label}: {$value} {$comparison} el umbral de {$threshold->threshold}";
    }

    /**
     * Envia notificaciones Filament a usuarios admin logueados.
     */
    public function notifyAdmins(array $alerts): void
    {
        foreach ($alerts as $alert) {
            $color = match ($alert['severity']) {
                'danger'  => 'danger',
                'warning' => 'warning',
                default   => 'info',
            };

            Notification::make()
                ->title('Alerta de Sistema')
                ->body($alert['message'])
                ->color($color)
                ->icon('heroicon-o-exclamation-triangle')
                ->sendToDatabase(auth()->user());
        }
    }
}
```

---

## 14.11 Reportes Exportables

### Reporte de tramites (Excel):

```php
<?php

namespace App\Exports;

use App\Models\Procedure;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProceduresExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function __construct(
        private ?string $dateFrom = null,
        private ?string $dateTo = null,
        private ?string $status = null,
    ) {}

    public function query()
    {
        return Procedure::query()
            ->with(['user', 'operator'])
            ->when($this->dateFrom, fn($q) => $q->whereDate('created_at', '>=', $this->dateFrom))
            ->when($this->dateTo, fn($q) => $q->whereDate('created_at', '<=', $this->dateTo))
            ->when($this->status, fn($q) => $q->where('status', $this->status));
    }

    public function headings(): array
    {
        return ['ID', 'Asegurado', 'DNI', 'Tipo', 'Estado', 'Fecha Creacion', 'Fecha Resolucion', 'Operador', 'Tiempo Resolucion (hrs)'];
    }

    public function map($procedure): array
    {
        return [
            $procedure->id,
            $procedure->user->full_name ?? 'N/A',
            $procedure->user->dni ?? 'N/A',
            $procedure->type->label(),
            $procedure->status,
            $procedure->created_at->format('d/m/Y H:i'),
            $procedure->approved_at?->format('d/m/Y H:i') ?? '---',
            $procedure->operator->name ?? '---',
            $procedure->approved_at
                ? round($procedure->created_at->diffInHours($procedure->approved_at), 1)
                : '---',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'E3F2FD']]],
        ];
    }
}
```

### Reporte PDF (DomPDF):

```php
<?php

namespace App\Services;

use App\Models\Procedure;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportService
{
    public function generateProceduresReport(string $dateFrom, string $dateTo): \Barryvdh\DomPDF\PDF
    {
        $procedures = Procedure::whereBetween('created_at', [$dateFrom, $dateTo])
            ->with(['user', 'operator'])
            ->orderBy('created_at')
            ->get();

        $stats = [
            'total'       => $procedures->count(),
            'aprobados'   => $procedures->where('status', 'APROBADO')->count(),
            'rechazados'  => $procedures->where('status', 'RECHAZADO')->count(),
            'pendientes'  => $procedures->where('status', 'PENDIENTE')->count(),
            'avg_horas'   => round($procedures->whereNotNull('approved_at')->avg(fn($p) => $p->created_at->diffInHours($p->approved_at)) ?? 0, 1),
        ];

        return Pdf::loadView('reports.procedures', [
            'procedures' => $procedures,
            'stats'      => $stats,
            'dateFrom'   => $dateFrom,
            'dateTo'     => $dateTo,
            'generatedAt'=> now()->format('d/m/Y H:i'),
        ]);
    }

    public function generateChatbotReport(string $dateFrom, string $dateTo): \Barryvdh\DomPDF\PDF
    {
        $interactions = \App\Models\ChatInteraction::whereBetween('created_at', [$dateFrom, $dateTo])->get();

        return Pdf::loadView('reports.chatbot', [
            'stats' => [
                'total'      => $interactions->count(),
                'faq'        => $interactions->where('resolved_by', 'faq')->count(),
                'rag'        => $interactions->where('resolved_by', 'rag')->count(),
                'escaladas'  => $interactions->where('was_escalated', true)->count(),
                'positivas'  => $interactions->where('feedback', 'positive')->count(),
                'negativas'  => $interactions->where('feedback', 'negative')->count(),
            ],
            'dateFrom'   => $dateFrom,
            'dateTo'     => $dateTo,
            'generatedAt'=> now()->format('d/m/Y H:i'),
        ]);
    }
}
```

### Controlador de reportes:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Exports\ProceduresExport;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function __construct(
        private ReportService $reportService,
    ) {}

    public function proceduresExcel(Request $request)
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to'   => 'required|date|after_or_equal:date_from',
            'status'    => 'nullable|string',
        ]);

        $fileName = 'tramites_' . $request->date_from . '_' . $request->date_to . '.xlsx';

        return Excel::download(
            new ProceduresExport($request->date_from, $request->date_to, $request->status),
            $fileName
        );
    }

    public function proceduresPdf(Request $request)
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to'   => 'required|date|after_or_equal:date_from',
        ]);

        return $this->reportService
            ->generateProceduresReport($request->date_from, $request->date_to)
            ->download('reporte_tramites.pdf');
    }

    public function chatbotPdf(Request $request)
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to'   => 'required|date|after_or_equal:date_from',
        ]);

        return $this->reportService
            ->generateChatbotReport($request->date_from, $request->date_to)
            ->download('reporte_chatbot.pdf');
    }
}
```

---

## 14.12 Pagina 7: Auditoria

Usando Spatie Laravel Activitylog.

```php
<?php

namespace App\Filament\Pages\Dashboard;

use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Spatie\Activitylog\Models\Activity;

class Audit extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?string $navigationLabel = 'Auditoria';
    protected static string $view = 'filament.pages.dashboard.audit';

    public function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->query(Activity::query()->with('causer')->latest())
            ->columns([
                Tables\Columns\TextColumn::make('id')->label('ID')->sortable(),
                Tables\Columns\TextColumn::make('causer.name')->label('Usuario')->searchable()->placeholder('Sistema'),
                Tables\Columns\TextColumn::make('log_name')->label('Log')->badge(),
                Tables\Columns\TextColumn::make('description')->label('Accion')->searchable()->limit(60),
                Tables\Columns\TextColumn::make('subject_type')->label('Modelo')
                    ->formatStateUsing(fn($state) => class_basename($state))->badge()->color('gray'),
                Tables\Columns\TextColumn::make('subject_id')->label('ID Modelo'),
                Tables\Columns\TextColumn::make('created_at')->label('Fecha')->dateTime('d/m/Y H:i:s')->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('causer_id')
                    ->relationship('causer', 'name')
                    ->label('Usuario')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('log_name')
                    ->options([
                        'default'     => 'Default',
                        'auth'        => 'Autenticacion',
                        'procedures'  => 'Tramites',
                        'documents'   => 'Documentos',
                        'admin'       => 'Administracion',
                    ]),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        \Filament\Forms\Components\DatePicker::make('from')->label('Desde'),
                        \Filament\Forms\Components\DatePicker::make('until')->label('Hasta'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when($data['from'], fn($q, $d) => $q->whereDate('created_at', '>=', $d))
                            ->when($data['until'], fn($q, $d) => $q->whereDate('created_at', '<=', $d));
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('view_details')
                    ->label('Detalles')
                    ->icon('heroicon-o-eye')
                    ->modalHeading('Detalles de la Actividad')
                    ->modalContent(fn(Activity $record) => view('filament.modals.activity-details', ['activity' => $record]))
                    ->modalSubmitAction(false)
                    ->modalCancelAction(false),
            ])
            ->defaultSort('created_at', 'desc')
            ->paginated([15, 25, 50, 100]);
    }
}
```

### Configuracion de Spatie Activitylog:

```php
// En config/activitylog.php
return [
    'enabled' => true,
    'log_name' => 'default',
    'default_auth_driver' => null,
    'activity_model' => \Spatie\Activitylog\Models\Activity::class,
    'database_connection' => null,
    'database_table_name' => 'activity_log',
    'subject_returns_soft_deleted_models' => false,
];

// En modelo Procedure
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Procedure extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Tramite {$eventName}");
    }
}
```

---

## 14.13 Rutas de Reportes

```php
// routes/web.php
Route::middleware(['auth', 'role:admin'])->prefix('admin/reports')->group(function () {
    Route::get('/procedures/excel', [ReportController::class, 'proceduresExcel'])->name('reports.procedures.excel');
    Route::get('/procedures/pdf', [ReportController::class, 'proceduresPdf'])->name('reports.procedures.pdf');
    Route::get('/operators/excel', [ReportController::class, 'operatorsExcel'])->name('reports.operators.excel');
    Route::get('/chatbot/pdf', [ReportController::class, 'chatbotPdf'])->name('reports.chatbot.pdf');
    Route::get('/users/excel', [ReportController::class, 'usersExcel'])->name('reports.users.excel');
});
```

---

## 14.14 Resumen de Reportes Disponibles

| Reporte | Formato | Contenido |
|---|---|---|
| Tramites por periodo | Excel / PDF | Listado de tramites con filtro de fechas y estado |
| Productividad operadores | Excel | Tramites procesados, tiempo promedio, carga actual |
| Analitica chatbot | PDF | Mensajes, FAQ vs RAG, feedback, escalacion |
| Documentos indexados | Excel | Documentos, chunks, estado de indexacion |
| Usuarios registrados | Excel | Registro por mes, roles, actividad |

---

## 14.15 Dependencias (composer.json)

```json
{
  "require": {
    "filament/filament": "^3.0",
    "maatwebsite/excel": "^3.1",
    "barryvdh/laravel-dompdf": "^2.0",
    "spatie/laravel-activitylog": "^4.7",
    "filament/widgets": "^3.0",
    "laravel/livewire": "^3.0"
  }
}
```
