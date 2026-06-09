# Rutas del Sistema

Hay **5 archivos de rutas** en `routes/`:

## 1. `routes/public.php` — Páginas Públicas

```
GET  /                        → HomeController@index
GET  /mascotas                → PetController@index
GET  /mascotas/{slug}         → PetController@show
GET  /eventos                 → EventController@index
GET  /eventos/{slug}          → EventController@show
GET  /blog                    → BlogController@index
GET  /blog/{slug}             → BlogController@show
GET  /sobre-nosotros          → AboutController@index
GET  /contacto                → ContactController@index
POST /contacto                → ContactController@send
GET  /sitemap.xml             → SitemapController@index
GET  /health                  → health check
```

Sin middleware de autenticación.

## 2. `routes/web.php` — Rutas Autenticadas

### Google Login
```
GET /auth/google              → SocialLoginController@redirectToGoogle
GET /auth/google/callback     → SocialLoginController@handleGoogleCallback
```

### Dashboard por Organización (`{current_team}`)
Middleware: `auth`, `verified`

```
GET  /{team}/dashboard              → Dashboard
GET  /{team}/mascotas               → Team\PetController (CRUD)
GET  /{team}/adopciones             → Dashboard\AdoptionController
POST /{team}/adopciones/{id}/aprobar  → approve
POST /{team}/adopciones/{id}/rechazar → reject
GET  /{team}/seguimientos           → Dashboard\FollowUpController
POST /{team}/seguimientos/{id}/completar
POST /{team}/seguimientos/{id}/no-realizado
POST /{team}/seguimientos           → schedule
GET  /{team}/blog                   → Dashboard\BlogPostController (CRUD)
GET  /{team}/eventos                → Dashboard\EventController (CRUD)
```

### Adoptante
Middleware: `auth`, `verified`

```
GET  /mi-adopcion/postulaciones     → ApplicationController@index
GET  /mi-adopcion/seguimientos      → FollowUpReportController@index
GET  /mi-adopcion/seguimientos/{id} → show
POST /mi-adopcion/seguimientos/{id}/reportar → report

POST /mascotas/{slug}/postular      → ApplicationController@store (apply to pet)
```

## 3. `routes/admin.php` — Panel de Administración

Middleware: `auth`, `verified`, `admin` (requiere `is_super_admin = true`)

```
GET    /admin                        → DashboardController@index
GET    /admin/perfil                 → ProfileController@index
PUT    /admin/perfil                 → ProfileController@update

GET    /admin/roles                  → RoleManagementController@index
GET    /admin/roles/{role}           → RoleManagementController@show

GET    /admin/usuarios               → UserController@index
GET    /admin/usuarios/{user}        → UserController@show
PUT    /admin/usuarios/{user}/role   → UserController@updateRole
DELETE /admin/usuarios/{user}        → UserController@destroy

GET    /admin/mascotas               → PetController (CRUD completo)
GET    /admin/mascotas/crear
POST   /admin/mascotas
GET    /admin/mascotas/{id}
GET    /admin/mascotas/{id}/editar
PUT    /admin/mascotas/{id}
DELETE /admin/mascotas/{id}

GET    /admin/organizaciones         → OrganizationController (CRUD)
       ... (crear, store, show, editar, update, destroy)

GET    /admin/eventos                → EventController (CRUD)
       ... (crear, store, show, editar, update, destroy)

GET    /admin/blog                   → BlogPostController (CRUD)
       ... (crear, store, show, editar, update, destroy)

GET    /admin/adopciones             → AdoptionController@index
GET    /admin/adopciones/{adoption}  → AdoptionController@show

GET    /admin/seguimiento            → FollowUpController (CRUD)
GET    /admin/seguimiento/crear
POST   /admin/seguimiento
GET    /admin/seguimiento/{followUp}
GET    /admin/seguimiento/{followUp}/editar
PUT    /admin/seguimiento/{followUp}
DELETE /admin/seguimiento/{followUp}
```

## 4. `routes/settings.php` — Configuración de Usuario

```
GET    /settings/profile               → Settings\ProfileController@edit
PATCH  /settings/profile               → Settings\ProfileController@update
DELETE /settings/profile               → Settings\ProfileController@destroy

GET    /settings/security              → Settings\SecurityController@edit
PUT    /settings/password              → Settings\SecurityController@update

GET    /settings/appearance            → Inertia render (settings/Appearance)

GET    /settings/teams                 → TeamController@index
POST   /settings/teams                 → store
GET    /settings/teams/{team}          → edit
PATCH  /settings/teams/{team}          → update
DELETE /settings/teams/{team}          → destroy
POST   /settings/teams/{team}/switch   → switch team

PATCH  /settings/teams/{team}/members/{user}   → update member role
DELETE /settings/teams/{team}/members/{user}   → remove member

POST   /settings/teams/{team}/invitations       → invite
DELETE /settings/teams/{team}/invitations/{inv} → cancel invitation
```

## 5. `routes/console.php` — Tareas Programadas

```php
Schedule::job(new CheckOverdueMilestonesJob)->daily();
```

Verifica seguimientos vencidos y los marca como `missed`.
