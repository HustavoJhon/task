# Middleware

## 1. Admin Middleware (`app/Http/Middleware/AdminMiddleware.php`)

Verifica que el usuario autenticado tenga `is_super_admin = true`.

```php
public function handle(Request $request, Closure $next)
{
    if (!$request->user() || !$request->user()->is_super_admin) {
        abort(403);
    }
    return $next($request);
}
```

Registrado en `bootstrap/app.php` como alias `admin`.

Se aplica a todas las rutas de `routes/admin.php`.

## 2. EnsureTeamMembership (`app/Http/Middleware/EnsureTeamMembership.php`)

Verifica que el usuario autenticado sea miembro del equipo especificado en la URL (`{current_team}`).

```php
public function handle(Request $request, Closure $next)
{
    $team = $request->route('current_team');
    if (!$request->user()?->belongsToTeam($team)) {
        abort(403);
    }
    return $next($request);
}
```

Se aplica a las rutas de dashboard por organización y gestión de equipos.

## 3. Middleware de Laravel Fortify

Laravel Fortify provee automáticamente:
- `auth` — requiere autenticación
- `verified` — requiere email verificado
- `throttle:6,1` — límite de intentos (usado en cambio de password)
- `RequirePassword` — solicita confirmación de password reciente (usado en seguridad)

## Orden de Middleware en Rutas

### Admin (`/admin`)
```
web → auth → verified → admin
```

### Dashboard por Organización (`/{team}/dashboard`)
```
web → auth → verified → EnsureTeamMembership
```

### Settings
```
web → auth
web → auth → verified → RequirePassword (security)
```

### Público
```
web (sin middleware adicional)
```
