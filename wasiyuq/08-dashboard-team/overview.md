# Dashboard por Organización

## Descripción

Cada organización (Team) tiene su propio dashboard con rutas scoped bajo `/{team_slug}/`. Para acceder, el usuario debe ser miembro del equipo.

## Rutas

Todas bajo `/{current_team}` con middleware `auth`, `verified`, `EnsureTeamMembership`.

### Dashboard Principal
```
GET /{team}/dashboard  — stats del equipo + actividades recientes
```

### Mascotas
```
GET    /{team}/mascotas        → Teams\PetController (CRUD completo)
GET    /{team}/mascotas/crear
POST   /{team}/mascotas
GET    /{team}/mascotas/{id}
GET    /{team}/mascotas/{id}/editar
PUT    /{team}/mascotas/{id}
DELETE /{team}/mascotas/{id}
```

### Adopciones
```
GET  /{team}/adopciones                             → listado
GET  /{team}/adopciones/{adoption}                  → detalle
POST /{team}/adopciones/{adoption}/aprobar          → aprobar
POST /{team}/adopciones/{adoption}/rechazar         → rechazar
```

### Seguimientos
```
GET  /{team}/seguimientos                           → listado
GET  /{team}/seguimientos/{followUp}                → detalle
POST /{team}/seguimientos/{followUp}/completar      → marcar completado
POST /{team}/seguimientos/{followUp}/no-realizado   → marcar no realizado
POST /{team}/seguimientos                           → programar nuevo
```

### Blog
```
GET    /{team}/blog           → Dashboard\BlogPostController (CRUD)
GET    /{team}/blog/crear
POST   /{team}/blog
GET    /{team}/blog/{id}
GET    /{team}/blog/{id}/editar
PUT    /{team}/blog/{id}
DELETE /{team}/blog/{id}
```

### Eventos
```
GET    /{team}/eventos        → Dashboard\EventController (CRUD)
GET    /{team}/eventos/crear
POST   /{team}/eventos
GET    /{team}/eventos/{id}
GET    /{team}/eventos/{id}/editar
PUT    /{team}/eventos/{id}
DELETE /{team}/eventos/{id}
```

## Team Switcher

En el header del DashboardLayout hay un componente `TeamSwitcher` que permite cambiar entre los equipos a los que pertenece el usuario. Al cambiar, se actualiza el `current_team_id` del usuario y redirige al dashboard del equipo seleccionado.
