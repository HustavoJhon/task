# 07 — Roles, Permisos y Políticas de Acceso

## Sistema de Autorización

La autorización se implementa con **Spatie/laravel-permission** para la gestión de roles y
permisos a nivel de base de datos, complementado con **Laravel Policies** para autorización
granular a nivel de modelo.

### Configuración en Modelo User

```php
// app/Models/User.php
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasRoles;

    protected $guard_name = 'web';

    // Relación opcional con el rol principal para queries rápidos
    public function getRoleAttribute(): string
    {
        return $this->getRoleNames()->first() ?? 'ASEG';
    }
}
```

---

## Roles del Sistema

### 1. ASEG — Asegurado

| Rol | Guard | Descripción |
|-----|-------|-------------|
| `ASEG` | `web` | Ciudadano asegurado de EsSalud. Rol por defecto al registrarse. |

**Acceso general:** Solo lectura de contenido público, gestión de sus propios trámites,
uso del chatbot, visualización de FAQ y noticias.

### 2. OPER — Operador

| Rol | Guard | Descripción |
|-----|-------|-------------|
| `OPER` | `web` | Funcionario encargado de revisar, aprobar o rechazar trámites. |

**Acceso general:** Todo lo de ASEG + gestión de trámites asignados, revisión de documentos,
emisión de subsanaciones.

### 3. SUPV — Supervisor

| Rol | Guard | Descripción |
|-----|-------|-------------|
| `SUPV` | `web` | Jefe de área con acceso a KPIs, reportes y asignación de carga de trabajo. |

**Acceso general:** Todo lo de OPER + dashboard completo, reportes, auditoría, reasignación.

### 4. GESDOC — Gestor Documental

| Rol | Guard | Descripción |
|-----|-------|-------------|
| `GESDOC` | `web` | Responsable del contenido informativo: FAQs, noticias, documentos oficiales, fuentes RAG. |

**Acceso general:** Solo lectura de trámites + gestión de contenido editorial y documental.

### 5. SADM — Super Administrador

| Rol | Guard | Descripción |
|-----|-------|-------------|
| `SADM` | `web` | Administrador del sistema con acceso irrestricto. |

**Acceso general:** Acceso total a todas las funcionalidades, gestión de usuarios, roles,
permisos y configuración del sistema.

---

## Matriz de Permisos

| # | Permiso | ASEG | OPER | SUPV | GESDOC | SADM |
|---|---------|:----:|:----:|:----:|:------:|:----:|
| **Auth** |
| 1 | `auth.register` | ✓ | — | — | — | ✓ |
| 2 | `auth.login` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 3 | `auth.logout` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 4 | `auth.password.reset` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 5 | `auth.email.verify` | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Trámites** |
| 6 | `tramites.ver` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 7 | `tramites.crear` | ✓ | ✓ | ✓ | — | ✓ |
| 8 | `tramites.editar` | ✓ | ✓ | ✓ | — | ✓ |
| 9 | `tramites.enviar` | ✓ | ✓ | ✓ | — | ✓ |
| 10 | `tramites.cancelar` | ✓ | ✓ | ✓ | — | ✓ |
| 11 | `tramites.aprobar` | — | ✓ | ✓ | — | ✓ |
| 12 | `tramites.rechazar` | — | ✓ | ✓ | — | ✓ |
| 13 | `tramites.solicitar-subsanacion` | — | ✓ | ✓ | — | ✓ |
| 14 | `tramites.subsanar` | ✓ | ✓ | ✓ | — | ✓ |
| 15 | `tramites.comentar` | ✓ | ✓ | ✓ | — | ✓ |
| 16 | `tramites.ver-asignados` | — | ✓ | ✓ | — | ✓ |
| 17 | `tramites.ver-todos` | — | — | ✓ | — | ✓ |
| 18 | `tramites.asignar` | — | — | ✓ | — | ✓ |
| **Documentos** |
| 19 | `documentos.ver` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 20 | `documentos.subir` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 21 | `documentos.descargar` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 22 | `documentos.eliminar` | ✓ | ✓ | ✓ | — | ✓ |
| 23 | `documentos.validar` | — | — | — | ✓ | ✓ |
| 24 | `documentos.gestionar-categorias` | — | — | — | ✓ | ✓ |
| 25 | `documentos.ver-todos` | — | — | ✓ | — | ✓ |
| **Noticias** |
| 26 | `noticias.ver` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 27 | `noticias.gestionar` | — | — | — | ✓ | ✓ |
| **FAQ** |
| 28 | `faq.ver` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 29 | `faq.buscar` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 30 | `faq.feedback` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 31 | `faq.gestionar` | — | — | — | ✓ | ✓ |
| **Chatbot** |
| 32 | `chatbot.usar` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 33 | `chatbot.escalar` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 34 | `chatbot.feedback` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 35 | `chatbot.ver-sesiones` | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Admin** |
| 36 | `admin.ver-dashboard` | — | — | ✓ | — | ✓ |
| 37 | `admin.exportar-reportes` | — | — | ✓ | — | ✓ |
| 38 | `admin.ver-auditoria` | — | — | ✓ | — | ✓ |
| 39 | `admin.gestionar-usuarios` | — | — | — | — | ✓ |
| 40 | `admin.gestionar-roles` | — | — | — | — | ✓ |
| **RAG** |
| 41 | `rag.gestionar-fuentes` | — | — | — | ✓ | ✓ |
| 42 | `rag.indexar-documentos` | — | — | — | ✓ | ✓ |
| **Perfil** |
| 43 | `profile.ver` | ✓ | ✓ | ✓ | ✓ | ✓ |
| 44 | `profile.editar` | ✓ | ✓ | ✓ | ✓ | ✓ |

**Totales:** ASEG: 26 | OPER: 31 | SUPV: 34 | GESDOC: 23 | SADM: 44

---

## Seeder de Roles y Permisos

```php
// database/seeders/RolePermissionSeeder.php

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Auth
            'auth.register', 'auth.login', 'auth.logout',
            'auth.password.reset', 'auth.email.verify',
            // Trámites
            'tramites.ver', 'tramites.crear', 'tramites.editar',
            'tramites.enviar', 'tramites.cancelar', 'tramites.aprobar',
            'tramites.rechazar', 'tramites.solicitar-subsanacion',
            'tramites.subsanar', 'tramites.comentar', 'tramites.ver-asignados',
            'tramites.ver-todos', 'tramites.asignar',
            // Documentos
            'documentos.ver', 'documentos.subir', 'documentos.descargar',
            'documentos.eliminar', 'documentos.validar',
            'documentos.gestionar-categorias', 'documentos.ver-todos',
            // Noticias
            'noticias.ver', 'noticias.gestionar',
            // FAQ
            'faq.ver', 'faq.buscar', 'faq.feedback', 'faq.gestionar',
            // Chatbot
            'chatbot.usar', 'chatbot.escalar', 'chatbot.feedback',
            'chatbot.ver-sesiones',
            // Admin
            'admin.ver-dashboard', 'admin.exportar-reportes',
            'admin.ver-auditoria', 'admin.gestionar-usuarios',
            'admin.gestionar-roles',
            // RAG
            'rag.gestionar-fuentes', 'rag.indexar-documentos',
            // Perfil
            'profile.ver', 'profile.editar',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'web']);
        }

        // Roles
        $aseg   = Role::create(['name' => 'ASEG',   'guard_name' => 'web']);
        $oper   = Role::create(['name' => 'OPER',   'guard_name' => 'web']);
        $supv   = Role::create(['name' => 'SUPV',   'guard_name' => 'web']);
        $gesdoc = Role::create(['name' => 'GESDOC', 'guard_name' => 'web']);
        $sadm   = Role::create(['name' => 'SADM',   'guard_name' => 'web']);

        // ASEG
        $aseg->givePermissionTo([
            'auth.register', 'auth.login', 'auth.logout',
            'auth.password.reset', 'auth.email.verify',
            'tramites.ver', 'tramites.crear', 'tramites.editar',
            'tramites.enviar', 'tramites.cancelar', 'tramites.subsanar',
            'tramites.comentar', 'documentos.ver', 'documentos.subir',
            'documentos.descargar', 'documentos.eliminar',
            'noticias.ver', 'faq.ver', 'faq.buscar', 'faq.feedback',
            'chatbot.usar', 'chatbot.escalar', 'chatbot.feedback',
            'chatbot.ver-sesiones', 'profile.ver', 'profile.editar',
        ]);

        // OPER
        $oper->givePermissionTo([
            'auth.login', 'auth.logout', 'auth.password.reset', 'auth.email.verify',
            'tramites.ver', 'tramites.crear', 'tramites.editar',
            'tramites.enviar', 'tramites.cancelar', 'tramites.aprobar',
            'tramites.rechazar', 'tramites.solicitar-subsanacion',
            'tramites.subsanar', 'tramites.comentar', 'tramites.ver-asignados',
            'documentos.ver', 'documentos.subir', 'documentos.descargar',
            'documentos.eliminar', 'noticias.ver', 'faq.ver', 'faq.buscar',
            'faq.feedback', 'chatbot.usar', 'chatbot.escalar',
            'chatbot.feedback', 'chatbot.ver-sesiones',
            'profile.ver', 'profile.editar',
        ]);

        // SUPV
        $supv->givePermissionTo([
            'auth.login', 'auth.logout', 'auth.password.reset', 'auth.email.verify',
            'tramites.ver', 'tramites.crear', 'tramites.editar',
            'tramites.enviar', 'tramites.cancelar', 'tramites.aprobar',
            'tramites.rechazar', 'tramites.solicitar-subsanacion',
            'tramites.subsanar', 'tramites.comentar', 'tramites.ver-asignados',
            'tramites.ver-todos', 'tramites.asignar',
            'documentos.ver', 'documentos.subir', 'documentos.descargar',
            'documentos.eliminar', 'documentos.ver-todos',
            'noticias.ver', 'faq.ver', 'faq.buscar', 'faq.feedback',
            'chatbot.usar', 'chatbot.escalar', 'chatbot.feedback',
            'chatbot.ver-sesiones', 'admin.ver-dashboard',
            'admin.exportar-reportes', 'admin.ver-auditoria',
            'profile.ver', 'profile.editar',
        ]);

        // GESDOC
        $gesdoc->givePermissionTo([
            'auth.login', 'auth.logout', 'auth.password.reset', 'auth.email.verify',
            'tramites.ver', 'documentos.ver', 'documentos.subir',
            'documentos.descargar', 'documentos.validar',
            'documentos.gestionar-categorias', 'noticias.ver', 'noticias.gestionar',
            'faq.ver', 'faq.buscar', 'faq.feedback', 'faq.gestionar',
            'chatbot.usar', 'chatbot.escalar', 'chatbot.feedback',
            'chatbot.ver-sesiones', 'rag.gestionar-fuentes',
            'rag.indexar-documentos', 'profile.ver', 'profile.editar',
        ]);

        // SADM (todos los permisos)
        $sadm->givePermissionTo(Permission::all());
    }
}
```

---

## Comando Artisan para seeding

```bash
php artisan db:seed --class=RolePermissionSeeder
```

---

## Políticas de Acceso (Laravel Policies)

### ProcedurePolicy

```php
// app/Policies/ProcedurePolicy.php

class ProcedurePolicy
{
    use HandlesAuthorization;

    public function view(User $user, Procedure $procedure): bool
    {
        if ($user->hasRole(['SUPV', 'SADM'])) return true;
        if ($user->hasRole(['OPER', 'GESDOC'])) return true;
        return $user->id === $procedure->user_id;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('tramites.ver');
    }

    public function create(User $user): bool
    {
        if ($user->hasRole('GESDOC')) return false;
        return $user->hasPermissionTo('tramites.crear');
    }

    public function update(User $user, Procedure $procedure): bool
    {
        if ($user->hasRole('SADM')) return true;
        if ($procedure->status_code !== 'BORRADOR') return false;
        return $user->id === $procedure->user_id;
    }

    public function submit(User $user, Procedure $procedure): bool
    {
        if ($user->hasRole('GESDOC')) return false;
        if ($procedure->status_code !== 'BORRADOR') return false;
        return $user->id === $procedure->user_id;
    }

    public function cancel(User $user, Procedure $procedure): bool
    {
        if ($user->hasRole('GESDOC')) return false;
        if (in_array($procedure->status_code, ['APROBADO', 'RECHAZADO', 'CANCELADO'])) {
            return false;
        }
        return $user->id === $procedure->user_id || $user->hasRole('SADM');
    }

    public function approve(User $user, Procedure $procedure): bool
    {
        if (!$user->hasPermissionTo('tramites.aprobar')) return false;
        if ($user->hasRole('OPER') && $procedure->current_assignee_id !== $user->id) {
            return false;
        }
        if (!in_array($procedure->status_code, ['PENDIENTE', 'EN_REVISION', 'SUBSANACION'])) {
            return false;
        }
        return true;
    }

    public function reject(User $user, Procedure $procedure): bool
    {
        if (!$user->hasPermissionTo('tramites.rechazar')) return false;
        if ($user->hasRole('OPER') && $procedure->current_assignee_id !== $user->id) {
            return false;
        }
        if (!in_array($procedure->status_code, ['PENDIENTE', 'EN_REVISION', 'SUBSANACION'])) {
            return false;
        }
        return true;
    }

    public function requestCorrection(User $user, Procedure $procedure): bool
    {
        if (!$user->hasPermissionTo('tramites.solicitar-subsanacion')) return false;
        if ($user->hasRole('OPER') && $procedure->current_assignee_id !== $user->id) {
            return false;
        }
        if (!in_array($procedure->status_code, ['PENDIENTE', 'EN_REVISION'])) {
            return false;
        }
        $correctionsCount = $procedure->subsanaciones()->count();
        if ($correctionsCount >= 3) return false;
        return true;
    }

    public function respondCorrection(User $user, Procedure $procedure): bool
    {
        if ($procedure->status_code !== 'SUBSANACION') return false;
        return $user->id === $procedure->user_id;
    }

    public function comment(User $user, Procedure $procedure): bool
    {
        if ($user->hasRole('ASEG') && $user->id !== $procedure->user_id) return false;
        return $user->hasPermissionTo('tramites.comentar');
    }

    public function assign(User $user, Procedure $procedure): bool
    {
        return $user->hasPermissionTo('tramites.asignar');
    }

    public function delete(User $user, Procedure $procedure): bool
    {
        if ($procedure->status_code !== 'BORRADOR') return false;
        return $user->id === $procedure->user_id || $user->hasRole('SADM');
    }
}
```

### DocumentPolicy

```php
// app/Policies/DocumentPolicy.php

class DocumentPolicy
{
    public function view(User $user, Document $document): bool
    {
        if ($user->hasPermissionTo('documentos.ver-todos')) return true;
        if ($document->procedure_id) {
            return $user->id === $document->procedure->user_id
                || $user->hasRole(['OPER', 'SUPV', 'SADM']);
        }
        return $user->id === $document->user_id || $user->hasRole('GESDOC');
    }

    public function upload(User $user): bool
    {
        return $user->hasPermissionTo('documentos.subir');
    }

    public function download(User $user, Document $document): bool
    {
        return $this->view($user, $document);
    }

    public function delete(User $user, Document $document): bool
    {
        if ($user->hasRole('SADM')) return true;
        if ($user->hasRole('GESDOC')) return false;
        if ($document->is_validated) return false;
        return $user->id === $document->user_id;
    }

    public function validate(User $user): bool
    {
        return $user->hasPermissionTo('documentos.validar');
    }
}
```

### NewsPolicy

```php
// app/Policies/NewsPolicy.php

class NewsPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('noticias.ver');
    }

    public function view(User $user, News $news): bool
    {
        return $user->hasPermissionTo('noticias.ver');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('noticias.gestionar');
    }

    public function update(User $user, News $news): bool
    {
        return $user->hasPermissionTo('noticias.gestionar');
    }

    public function delete(User $user, News $news): bool
    {
        return $user->hasPermissionTo('noticias.gestionar');
    }
}
```

### FaqPolicy

```php
// app/Policies/FaqPolicy.php

class FaqPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('faq.ver');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('faq.gestionar');
    }

    public function update(User $user, Faq $faq): bool
    {
        return $user->hasPermissionTo('faq.gestionar');
    }

    public function delete(User $user, Faq $faq): bool
    {
        return $user->hasPermissionTo('faq.gestionar');
    }
}
```

---

## Registro de Policies

```php
// app/Providers/AuthServiceProvider.php

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Procedure::class     => ProcedurePolicy::class,
        Document::class      => DocumentPolicy::class,
        News::class          => NewsPolicy::class,
        Faq::class           => FaqPolicy::class,
        ChatSession::class   => ChatSessionPolicy::class,
        AuditLog::class      => AuditLogPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Super Admin bypass all policies
        Gate::before(function (User $user) {
            if ($user->hasRole('SADM')) {
                return true;
            }
        });
    }
}
```

---

## Uso en Controladores

```php
// Ejemplo con inyección directa y Form Request autorizado
class ProcedureController extends Controller
{
    public function approve(
        Procedure $procedure,
        ApproveProcedureRequest $request
    ): RedirectResponse {
        // La autorización se ejecuta en el FormRequest vía authorize()
        $procedure->transitionTo('APROBADO', auth()->user(), $request->comment);

        return redirect()
            ->route('procedures.show', $procedure)
            ->with('success', 'Trámite aprobado correctamente.');
    }
}

// ApproveProcedureRequest
class ApproveProcedureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('approve', $this->route('procedure'));
    }
}
```

---

## Uso en Blade y Livewire

```blade
{{-- Blade directives --}}
@can('aprobar', $procedure)
    <button wire:click="approve({{ $procedure->id }})" class="btn btn-success">
        Aprobar Trámite
    </button>
@endcan

@role('GESDOC')
    <a href="{{ route('admin.news.create') }}">Crear Noticia</a>
@endrole

@hasanyrole('SUPV|SADM')
    <a href="{{ route('admin.dashboard') }}">Dashboard KPIs</a>
@endhasanyrole
```

```php
// Livewire component
class ProcedureReview extends Component
{
    public function approve(int $procedureId): void
    {
        $procedure = Procedure::findOrFail($procedureId);
        $this->authorize('approve', $procedure);
        // lógica de aprobación...
    }
}
```

---

## Middleware de Rutas

```php
// routes/modules/Procedures.php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/tramites', [ProcedureController::class, 'index'])
        ->name('procedures.index');

    Route::get('/tramites/crear', [ProcedureController::class, 'create'])
        ->name('procedures.create')
        ->middleware('can:tramites.crear');

    Route::post('/tramites/{procedure}/aprobar', [ProcedureStateController::class, 'approve'])
        ->name('procedures.approve')
        ->middleware('can:tramites.aprobar');
});

// routes/modules/Admin.php
Route::middleware(['auth', 'verified', 'role:SUPV|SADM'])->group(function () {
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])
        ->name('admin.dashboard');
});
```
