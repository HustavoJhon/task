# 21. Seguridad y Auditoría — EsSalud (Laravel)

> **Versión:** 1.0 — Laravel 11 + Livewire 3 + Blade + MySQL 8  
> **Última actualización:** 2026-06-21  

---

## 21.1 Objetivo

Establecer los mecanismos de seguridad y auditoría que garanticen la confidencialidad, integridad y disponibilidad de los datos de los asegurados peruanos, en cumplimiento de la normativa vigente.

---

## 21.2 Autenticación

### 21.2.1 Laravel Sanctum (SPA + API Tokens)

Se utiliza Laravel Sanctum para autenticación de SPA (Single Page Application) y emisión de tokens API para integraciones externas.

```bash
composer require laravel/sanctum
php artisan sanctum:install
```

- **SPA Auth:** cookies `httpOnly`, `SameSite=Lax`, `secure=true` en producción.
- **API Tokens:** scope por habilidad (`procedures:read`, `procedures:write`, etc.).
- Expiración de tokens configurable por scope.

### 21.2.2 Bcrypt para Contraseñas

Laravel utiliza bcrypt por defecto con factor de trabajo (`rounds`) configurable:

```php
// config/hashing.php
'bcrypt' => [
    'rounds' => env('BCRYPT_ROUNDS', 12),
],
```

Se habilita el re-hashing automático de contraseñas al hacer login (`config/hashing.php` → `rehash_on_login: true`).

### 21.2.3 Rate Limiting en Login

```php
// app/Http/Controllers/Auth/LoginController.php
// o en routes/web.php
RateLimiter::for('login', function (Request $request) {
    return Limit::perMinute(5)->by($request->input('email').'|'.$request->ip());
});
```

Tras 5 intentos fallidos, bloqueo por **30 minutos** para esa combinación email+IP. El mensaje de error no revela si el email existe o no ("Credenciales inválidas").

### 21.2.4 Expiración de Sesiones

```php
// config/session.php
'lifetime' => env('SESSION_LIFETIME', 120), // minutos (2 horas)
'expire_on_close' => true,
```

Configurable por entorno. Se implementa un `SessionTimeoutComponent` en Livewire que muestra un aviso de expiración inminente a los 5 minutos restantes.

---

## 21.3 Autorización

### 21.3.1 Spatie Laravel-Permission

```bash
composer require spatie/laravel-permission
php artisan permission:install
```

### Roles Definidos

| Rol            | Descripción                                      |
|----------------|--------------------------------------------------|
| `asegurado`    | Usuario final que inicia trámites                |
| `operador`     | Funcionario que revisa y asigna trámites          |
| `supervisor`   | Supervisor de área con reportes                  |
| `sadm`         | Super Administrador del sistema                  |

### Permisos Principales

| Permiso                 | Roles                               |
|-------------------------|--------------------------------------|
| `procedures.create`     | asegurado, operador, sadm            |
| `procedures.view_any`   | operador, supervisor, sadm           |
| `procedures.assign`     | supervisor, sadm                     |
| `procedures.approve`    | operador, supervisor, sadm           |
| `admin.users.manage`    | sadm                                 |
| `admin.audit.view`      | sadm                                 |
| `admin.reports.view`    | supervisor, sadm                     |
| `faq.manage`            | operador, supervisor, sadm           |
| `news.manage`           | operador, supervisor, sadm           |

### 21.3.2 Laravel Policies por Modelo

Se generan Policies con `php artisan make:policy ProcedurePolicy --model=Procedure` para todos los modelos del dominio:

- `ProcedurePolicy`: controla `view`, `create`, `update`, `delete`, `assign`, `approve`, `reject`, `requestCorrection`
- `DocumentPolicy`: controla vistas y eliminación de documentos
- `FaqPolicy`, `NewsPolicy`, `UserPolicy`: acceso CRUD según rol

### 21.3.3 Middleware de Rol en Rutas

```php
// routes/web.php
Route::middleware(['auth', 'role:operador|supervisor|sadm'])->group(function () {
    Route::resource('procedures', ProcedureController::class);
});

Route::middleware(['auth', 'role:sadm'])->group(function () {
    Route::get('/admin/audit', [AuditController::class, 'index']);
});
```

En componentes Livewire se aplica con el método `mount()`:

```php
public function mount(): void
{
    if (!auth()->user()->hasRole('operador')) {
        abort(403);
    }
}
```

---

## 21.4 Protección Web

### 21.4.1 CSRF

Laravel incluye protección CSRF por defecto mediante `VerifyCsrfToken`. Todas las formas Blade incluyen `@csrf`. Las peticiones Livewire incluyen token CSRF automáticamente.

Se excluyen rutas de webhook externo en `$except` del middleware solo cuando es estrictamente necesario.

### 21.4.2 XSS (Cross-Site Scripting)

Blade escapa automáticamente mediante `{{ }}`. En casos excepcionales donde se requiere HTML sin escape (`{!! !!}`), se utiliza `strip_tags()` o `HTML::clean()` con whitelist de tags.

### 21.4.3 SQL Injection

Eloquent usa PDO con prepared statements, previniendo SQL injection por defecto. Las consultas raw (`DB::raw()`) se auditan en code review y solo se permiten con bindings:

```php
// Correcto — usa bindings
DB::select('SELECT * FROM procedures WHERE status = ?', [$status]);

// Prohibido en code review — concatenación de variables
// DB::select("SELECT * FROM procedures WHERE status = '$status'");
```

### 21.4.4 CORS

```php
// config/cors.php
'paths'                    => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods'          => ['GET', 'POST', 'PUT', 'DELETE'],
'allowed_origins'          => [env('APP_URL')],
'allowed_origins_patterns' => [],
'allowed_headers'          => ['Content-Type', 'Authorization', 'X-Requested-With'],
'exposed_headers'          => [],
'max_age'                  => 0,
'supports_credentials'     => true,
```

---

## 21.5 Rate Limiting Global

| Endpoint           | Límite          | Período | Justificación                    |
|--------------------|-----------------|---------|----------------------------------|
| `/login`           | 5 intentos      | 1 min   | Prevenir fuerza bruta            |
| `/api/*`           | 60 peticiones   | 1 min   | Protección de API (por token)    |
| `/register`        | 3 registros     | 1 hora  | Prevenir registro masivo (por IP)|
| `/chat`            | 20 mensajes     | 1 min   | Moderar uso del chatbot (por IP) |

Implementado con `RateLimiter::for()` en `AppServiceProvider::boot()`.

---

## 21.6 Validación de Entrada

### 21.6.1 Form Requests

Todas las validaciones se centralizan en Form Requests (`php artisan make:request StoreProcedureRequest`):

- `StoreUserRequest`: validación de registro
- `StoreProcedureRequest`: validación de creación de trámite
- `StoreDocumentRequest`: validación de subida de archivos
- `StoreFaqRequest`, `StoreNewsRequest`: validación de contenido

### 21.6.2 Reglas de Validación

**DNI Peruano:**
```php
'dni' => ['required', 'string', 'size:8', 'regex:/^[0-9]{8}$/'],
```

**Email:**
```php
'email' => ['required', 'email:rfc,dns', 'max:255', 'unique:users'],
```

**Teléfono Peruano:**
```php
'phone' => ['required', 'regex:/^9[0-9]{8}$/'],
```

**Password:**
```php
'password' => [
    'required',
    'string',
    'min:8',
    'regex:/[A-Z]/',      // al menos 1 mayúscula
    'regex:/[0-9]/',      // al menos 1 número
    'regex:/[\W_]/',      // al menos 1 símbolo
    'confirmed',
],
```

**Documentos:**
```php
'document' => [
    'required',
    'file',
    'mimes:pdf,jpg,jpeg,png',
    'max:10240',          // 10 MB
],
```

---

## 21.7 Headers de Seguridad

Configuración en middleware global o en `nginx`:

```
# nginx security headers
add_header Strict-Transport-Security     "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options               "DENY" always;
add_header X-Content-Type-Options        "nosniff" always;
add_header Referrer-Policy               "strict-origin-when-cross-origin" always;
add_header X-XSS-Protection              "1; mode=block" always;
add_header Permissions-Policy            "camera=(), microphone=(), geolocation=()" always;
```

### Content Security Policy (CSP)

```php
// app/Http/Middleware/CspMiddleware.php
$response->headers->set('Content-Security-Policy',
    "default-src 'self'; " .
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " .
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
    "font-src 'self' https://fonts.gstatic.com; " .
    "img-src 'self' data: blob: https:; " .
    "connect-src 'self' wss: https:; " .
    "frame-ancestors 'none';"
);
```

---

## 21.8 Seguridad de Archivos

### 21.8.1 Validación MIME Real

Se utiliza `spatie/laravel-medialibrary` o validación nativa:

```php
'document' => ['file', 'mimetypes:application/pdf,image/jpeg,image/png'],
```

No se confía en la extensión del archivo; se verifica el MIME type real mediante `finfo`.

### 21.8.2 Almacenamiento Fuera del Document Root

```php
// config/filesystems.php — disco privado
'private_documents' => [
    'driver' => 'local',
    'root'   => storage_path('app/documents'),
    'throw'  => true,
],
```

Los archivos se sirven mediante un controlador que verifica autorización, nunca por URL directa.

### 21.8.3 Nombres Aleatorios

```php
$filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
$path = $file->storeAs('documents', $filename, 'private_documents');
```

---

## 21.9 Auditoría

### 21.9.1 Paquete owen-it/laravel-auditing

```bash
composer require owen-it/laravel-auditing
php artisan vendor:publish --provider="OwenIt\Auditing\AuditingServiceProvider"
php artisan migrate
```

### 21.9.2 Modelos Auditados

Todos los modelos principales implementan `Auditable`:

```php
use OwenIt\Auditing\Contracts\Auditable;

class Procedure extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    // ...
}
```

Modelos auditados: `User`, `Procedure`, `Document`, `Faq`, `News`, `Role`, `Permission`.

### 21.9.3 Datos Registrados por Auditoría

| Campo         | Descripción                                   |
|---------------|-----------------------------------------------|
| `user_id`     | Usuario que realizó la acción (null si sistema)|
| `event`       | `created`, `updated`, `deleted`, `restored`   |
| `auditable_type` | Modelo afectado                            |
| `auditable_id`   | ID del modelo afectado                     |
| `old_values`  | Valores antes del cambio (JSON)               |
| `new_values`  | Valores después del cambio (JSON)             |
| `url`         | URL de la petición                            |
| `ip_address`  | IP del usuario                                |
| `user_agent`  | User agent del navegador                      |
| `tags`        | Tags adicionales (ej: `'api'`, `'web'`)       |

### 21.9.4 Panel de Auditoría en Filament

Filament incluye un recurso `AuditResource` accesible solo para el rol `sadm`:

```php
// app/Filament/Resources/AuditResource.php
public static function canViewAny(): bool
{
    return auth()->user()->hasRole('sadm');
}
```

Permite filtrar por: fecha, usuario, modelo, evento. Exportación a CSV/Excel de los registros.

---

## 21.10 Backups

### 21.10.1 Spatie Laravel-Backup

```bash
composer require spatie/laravel-backup
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"
```

### 21.10.2 Configuración

```php
// config/backup.php
'destination' => [
    'disks' => ['s3-backups'], // S3 o MinIO
],
'backup' => [
    'name' => 'essalud-backup',
    'source' => [
        'files' => [
            'include' => [
                storage_path('app/documents'),
            ],
        ],
        'databases' => ['mysql'],
    ],
],
'cleanup' => [
    'defaultStrategy' => [
        'keepAllBackupsForDays'     => 7,
        'keepDailyBackupsForDays'   => 30,
        'keepWeeklyBackupsForWeeks' => 8,
        'keepMonthlyBackupsForMonths' => 12,
    ],
],
```

Backup diario automático vía cron: `php artisan backup:run --only-db` a las 02:00 UTC. Backup completo de archivos los domingos.

---

## 21.11 HTTPS

En producción, HTTPS forzado mediante:

```php
// app/Http/Middleware/TrustProxies.php
protected $proxies = '*'; // Confía en el load balancer/reverse proxy

// app/ServiceProviders/AppServiceProvider.php
public function boot(): void
{
    if (config('app.env') === 'production') {
        \URL::forceScheme('https');
    }
}
```

Certificados SSL mediante Let's Encrypt con Certbot, renovación automática vía cron mensual.

---

## 21.12 Checklist de Seguridad Pre-Producción

- [ ] `APP_DEBUG=false` en `.env.production`
- [ ] `APP_KEY` rotada y fuera de VCS
- [ ] Sanctum `stateful` domains correctamente configurados
- [ ] CORS restringido a orígenes conocidos
- [ ] Rate limiting activo en todos los endpoints sensibles
- [ ] Validación DNI peruano implementada
- [ ] Validación MIME real en uploads
- [ ] Archivos almacenados fuera de `public/`
- [ ] Headers de seguridad configurados en nginx
- [ ] Políticas de Laravel implementadas para todos los modelos
- [ ] Auditoría activa en modelos principales
- [ ] Backups automáticos programados y probados
- [ ] HSTS habilitado con `max-age` >= 6 meses
- [ ] Todas las contraseñas de servicios en `.env` (fuera de VCS)

---

## 21.13 Referencias

- [Laravel Sanctum](https://laravel.com/docs/11.x/sanctum)
- [Spatie Laravel-Permission](https://spatie.be/docs/laravel-permission)
- [owen-it/laravel-auditing](https://github.com/owen-it/laravel-auditing)
- [Spatie Laravel-Backup](https://spatie.be/docs/laravel-backup)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
