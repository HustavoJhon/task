# 20. Observabilidad y Monitoreo — EsSalud (Laravel)

> **Versión:** 1.0 — Laravel 11 + Livewire 3 + Blade + MySQL 8  
> **Última actualización:** 2026-06-21  

---

## 20.1 Objetivo

Dotar a la plataforma EsSalud de un ecosistema completo de observabilidad que permita detectar, diagnosticar y resolver incidentes en tiempo real, así como tomar decisiones operativas y de negocio basadas en datos.

---

## 20.2 Stack de Observabilidad

| Componente      | Herramienta               | Propósito                          |
|-----------------|---------------------------|------------------------------------|
| Logging         | Laravel + Monolog + Loki  | Logs estructurados centralizados   |
| Métricas        | Prometheus                | Recolección de métricas            |
| Visualización   | Grafana                   | Dashboards operativos y de negocio |
| Alertas         | Alertmanager              | Notificación de incidentes         |
| Debugging       | Laravel Telescope         | Inspección en desarrollo           |
| Monitoreo Queue | Laravel Horizon           | Estado de colas y jobs             |

---

## 20.3 Logging Estructurado

### 20.3.1 Configuración de Canales

```php
// config/logging.php
'channels' => [
    'single' => [
        'driver'  => 'single',
        'path'    => storage_path('logs/laravel.log'),
        'level'   => env('LOG_LEVEL', 'debug'),
    ],
    'daily' => [
        'driver'     => 'daily',
        'path'       => storage_path('logs/laravel.log'),
        'level'      => env('LOG_LEVEL', 'debug'),
        'days'       => 14,
        'permission' => 0644,
    ],
    'slack' => [
        'driver'   => 'slack',
        'url'      => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => 'EsSalud Bot',
        'emoji'    => ':hospital:',
        'level'    => 'critical',
    ],
],
```

En desarrollo se usa el canal `single`. En producción se activa `daily` para rotación automática y `slack` para errores críticos.

### 20.3.2 Formato JSON para Loki

Se configura un formateador JSON personalizado para que los logs sean ingeridos directamente por Loki:

```php
// config/logging.php — formateador personalizado
'formatter' => \App\Logging\JsonLogFormatter::class,
```

### 20.3.3 Campos del Log

| Campo        | Tipo     | Descripción                                |
|--------------|----------|--------------------------------------------|
| `timestamp`  | ISO 8601 | Momento exacto del evento                  |
| `level`      | string   | DEBUG, INFO, WARNING, ERROR, CRITICAL      |
| `service`    | string   | Nombre del microservicio (`essalud-web`)   |
| `user_id`    | int|null | ID del usuario autenticado, si aplica      |
| `request_id` | UUID     | Identificador único de la petición HTTP    |
| `duration_ms`| float    | Duración de la petición en milisegundos    |
| `message`    | string   | Descripción textual del evento             |
| `context`    | object   | Datos adicionales (IP, user_agent, route)  |

El `request_id` se genera en un middleware global y se inyecta en cada log mediante `Log::withContext()`.

```php
// app/Http/Middleware/RequestIdMiddleware.php
public function handle($request, Closure $next): Response
{
    $requestId = (string) Str::uuid();
    Log::withContext(['request_id' => $requestId]);
    return $next($request)->withHeaders(['X-Request-ID' => $requestId]);
}
```

---

## 20.4 Métricas con Prometheus

Se utiliza el paquete `spiral/laravel-prometheus` como integración base, complementado con métricas custom de negocio.

### 20.4.1 Instalación

```bash
composer require spiral/laravel-prometheus
php artisan vendor:publish --tag=prometheus-config
```

### 20.4.2 Métricas Custom

| Nombre                                   | Tipo      | Etiquetas / Labels                     | Descripción                                      |
|------------------------------------------|-----------|----------------------------------------|--------------------------------------------------|
| `laravel_requests_total`                 | Counter   | method, route, status                  | Total de peticiones HTTP                         |
| `laravel_request_duration_seconds`       | Histogram | method, route                          | Duración de peticiones en segundos               |
| `essalud_procedures_created_total`       | Counter   | type                                    | Trámites creados por tipo                        |
| `essalud_procedures_status`              | Gauge     | status                                  | Trámites activos por estado                      |
| `essalud_chat_messages_total`            | Counter   | type (faq, rag, no_result)             | Mensajes del chatbot por tipo                    |
| `essalud_documents_uploaded_total`       | Counter   | —                                       | Documentos subidos                               |
| `essalud_users_registered_total`         | Counter   | —                                       | Usuarios registrados                             |
| `essalud_ocr_duration_seconds`           | Histogram | —                                       | Duración del procesamiento OCR                   |
| `essalud_openai_api_errors_total`        | Counter   | —                                       | Errores en llamadas a OpenAI                     |
| `essalud_qdrant_query_duration_seconds`  | Histogram | —                                       | Duración de consultas a Qdrant                   |

### 20.4.3 Registro de Métricas

Las métricas se registran mediante un `ServiceProvider` y se exponen en el endpoint `/metrics` protegido por IP o autenticación básica.

```php
// app/Providers/MetricsServiceProvider.php
use Spiral\Prometheus\Registry;

public function boot(Registry $registry): void
{
    $this->registerCustomMetrics($registry);
}

protected function registerCustomMetrics(Registry $registry): void
{
    $registry->counter('essalud_procedures_created_total')
        ->help('Total de trámites creados')
        ->labels(['type'])
        ->register();

    $registry->gauge('essalud_procedures_status')
        ->help('Trámites activos por estado')
        ->labels(['status'])
        ->register();

    // ... resto de métricas
}
```

Las métricas de procedimientos se actualizan vía eventos de Eloquent (`created`, `updated`). Las métricas de chatbot y OCR se registran en los servicios correspondientes.

---

## 20.5 Dashboards en Grafana

Se provisionan 3 dashboards como código (JSON en `grafana/dashboards/`):

### Dashboard 1 — Operacional
- **Request Rate:** gráfico de líneas de `laravel_requests_total` por minuto
- **Latencia:** heatmap de `laravel_request_duration_seconds`, percentiles p50, p95, p99
- **Error Rate:** porcentaje de respuestas 5xx sobre el total
- **Usuarios Activos:** sesiones activas extraídas de métricas de Redis
- **Estado de Queues:** jobs pendientes, completados y fallidos (de Horizon)

### Dashboard 2 — Negocio
- **Trámites Creados vs. Aprobados:** barras apiladas diarias
- **Tasa de Rechazo:** porcentaje semanal
- **Uso del Chatbot:** mensajes FAQ vs. RAG vs. sin resultado
- **Documentos Subidos:** conteo diario
- **Distribución de Trámites por Tipo:** gráfico de torta

### Dashboard 3 — Infraestructura
- **CPU Usage:** por núcleo, promedio del host
- **RAM Usage:** usada vs. disponible
- **MySQL:** conexiones activas, queries lentas, throughput
- **Redis:** memoria usada, hits/misses, conexiones
- **Queue Size:** jobs en cola, tiempo promedio de procesamiento
- **Storage:** espacio usado en disco

---

## 20.6 Alertas con Alertmanager

Configuración de reglas de alerta en `infrastructure/alertmanager/rules.yml`:

| Alerta                            | Condición                              | Severidad | Canal          |
|-----------------------------------|----------------------------------------|-----------|----------------|
| Trámites pendientes > 100         | `essalud_procedures_status{pending} > 100` | warning | Email, Slack   |
| Error rate > 5%                   | tasa 5xx > 5% por 5 min               | critical  | Email, Slack   |
| Queue size > 1000                 | jobs pendientes > 1000 por 5 min       | warning    | Slack          |
| CPU > 80%                         | `node_cpu_seconds_total` > 80% 5 min   | warning    | Slack          |
| OpenAI errores > 10 en 5 min      | `essalud_openai_api_errors_total` rate | critical  | Email, Slack   |
| Disco < 10% libre                 | `node_filesystem_avail_bytes`          | critical  | Email, Slack   |

Las alertas _critical_ envían notificación a Telegram y correo electrónico del equipo. Las _warning_ solo a Slack.

---

## 20.7 Laravel Telescope

Telescope se habilita exclusivamente en entorno local y staging para debugging. Nunca en producción.

```env
# .env.local / .env.staging
TELESCOPE_ENABLED=true
```

Funcionalidades aprovechadas:
- **Requests:** headers, payload, response, duración
- **Queries:** SQL con bindings y tiempo de ejecución
- **Jobs:** estado de cada job encolado
- **Events:** eventos disparados por Eloquent y la aplicación
- **Logs:** visualización en tiempo real
- **Mail:** emails enviados con vista previa
- **Cache:** hits/misses en Redis

---

## 20.8 Laravel Horizon

Horizon monitorea las colas de Redis en un dashboard propio accesible en `/horizon` (protegido por autenticación y rol admin).

```bash
composer require laravel/horizon
php artisan horizon:install
```

### Configuración de Workers

```php
// config/horizon.php
'environments' => [
    'production' => [
        'supervisor-1' => [
            'connection'   => 'redis',
            'queue'        => ['default', 'ocr', 'rag', 'notifications'],
            'balance'      => 'auto',
            'minProcesses' => 2,
            'maxProcesses' => 10,
            'tries'        => 3,
            'timeout'      => 120,
        ],
    ],
],
```

### Colas Definidas

| Cola           | Prioridad | Jobs típicos                        |
|----------------|-----------|-------------------------------------|
| `default`      | Alta      | Tareas generales, emails            |
| `ocr`          | Media     | Procesamiento OCR de documentos     |
| `rag`          | Alta      | Indexación y consultas a Qdrant     |
| `notifications`| Baja      | Envío de notificaciones push/email  |

---

## 20.9 Docker Compose — Servicios de Observabilidad

```yaml
# docker-compose.observability.yml
services:
  prometheus:
    image: prom/prometheus:v2.53.0
    volumes:
      - ./infrastructure/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana:11.1.0
    volumes:
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SERVER_ROOT_URL=https://grafana.essalud.pe

  loki:
    image: grafana/loki:3.1.0
    volumes:
      - ./infrastructure/loki:/etc/loki
      - loki_data:/loki
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/loki-config.yaml

  alertmanager:
    image: prom/alertmanager:v0.27.0
    volumes:
      - ./infrastructure/alertmanager:/etc/alertmanager
      - alertmanager_data:/alertmanager
    ports:
      - "9093:9093"
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
```

---

## 20.10 Procedimiento de Respuesta a Incidentes

1. **Detección:** Alerta en Slack/Telegram o métrica anómala en Grafana.
2. **Triaje:** Determinar severidad (P1: caída total, P2: funcionalidad degradada, P3: componente no crítico).
3. **Diagnóstico:** Revisar logs en Grafana Loki filtrando por `request_id` o `user_id`. Verificar métricas en el dashboard operacional.
4. **Mitigación:** Rollback de deploy, escalado de workers, o desactivación de feature vía feature flags.
5. **Resolución:** Fix en caliente o planificación de hotfix.
6. **Post-mortem:** Documentar causa raíz, impacto, acciones correctivas y preventivas en `docs/postmortems/`.

---

## 20.11 Referencias

- [Laravel Logging Docs](https://laravel.com/docs/11.x/logging)
- [spiral/laravel-prometheus en Packagist](https://packagist.org/packages/spiral/laravel-prometheus)
- [Laravel Telescope](https://laravel.com/docs/11.x/telescope)
- [Laravel Horizon](https://laravel.com/docs/11.x/horizon)
- [Grafana Loki](https://grafana.com/oss/loki/)
