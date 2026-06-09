# Controladores

## Admin (10 controladores)

| Controlador | Archivo | Propósito |
|---|---|---|
| `PetController` | `Admin/PetController.php` | CRUD mascotas + búsqueda/filtros + stats |
| `OrganizationController` | `Admin/OrganizationController.php` | CRUD organizaciones + stats |
| `EventController` | `Admin/EventController.php` | CRUD eventos + búsqueda |
| `BlogPostController` | `Admin/BlogPostController.php` | CRUD blog + búsqueda |
| `AdoptionController` | `Admin/AdoptionController.php` | Listar/detalle adopciones + filtros + stats + gráficos |
| `FollowUpController` | `Admin/FollowUpController.php` | CRUD seguimientos + búsqueda |
| `UserController` | `Admin/UserController.php` | CRUD usuarios + cambio de rol |
| `DashboardController` | `Admin/DashboardController.php` | Dashboard con estadísticas globales + tendencias |
| `ProfileController` | `Admin/ProfileController.php` | Perfil del admin (editar nombre) |
| `RoleManagementController` | `Admin/RoleManagementController.php` | Gestión de roles |

### Patrón común en admin controllers

```php
public function index()
{
    $query = Model::query()->with(['relations']);
    if ($search = request('search')) { /* filtrar */ }
    if ($status = request('status')) { /* filtrar */ }
    $items = $query->latest()->paginate(15)->withQueryString();
    return Inertia::render('Admin/Section/Index', [
        'items' => $items->items(),
        'meta' => [/* paginación */],
        'filters' => request()->only(['search', ...]),
        'stats' => [/* agregaciones */],
    ]);
}
```

## Público (7 controladores)

| Controlador | Propósito |
|---|---|
| `HomeController` | Landing page con stats + especies + mascotas recientes |
| `PetController` | Catálogo público con filtros (especie, tamaño, género, edad, ubicación) |
| `EventController` | Lista y detalle de eventos públicos |
| `BlogController` | Lista y detalle de artículos públicos |
| `AboutController` | Página "Sobre nosotros" con miembros del equipo |
| `ContactController` | Formulario de contacto + envío |
| `SitemapController` | Generación de sitemap.xml |

## Dashboard por Organización (4 controladores)

| Controlador | Propósito |
|---|---|
| `AdoptionController` | Listar adopciones del equipo, aprobar/rechazar |
| `FollowUpController` | Seguimientos del equipo, marcar completado/missed |
| `BlogPostController` | CRUD blog del equipo |
| `EventController` | CRUD eventos del equipo |

## Teams (4 controladores)

| Controlador | Propósito |
|---|---|
| `TeamController` | CRUD de equipos, cambiar equipo activo |
| `TeamMemberController` | Gestionar miembros (rol) |
| `TeamInvitationController` | Invitar por email, aceptar invitación |
| `PetController` | CRUD mascotas del equipo actual |

## Settings (2 controladores)

| Controlador | Propósito |
|---|---|
| `ProfileController` | Editar perfil (nombre, email, eliminar cuenta) |
| `SecurityController` | Cambiar contraseña |

## Auth (1 controlador)

| Controlador | Propósito |
|---|---|
| `SocialLoginController` | Google OAuth (redirect + callback) |

## Adopter (2 controladores)

| Controlador | Propósito |
|---|---|
| `ApplicationController` | Postularse a mascota, ver postulaciones |
| `FollowUpReportController` | Ver y reportar seguimientos como adoptante |
