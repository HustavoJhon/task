# Módulo Organizaciones (Teams)

## Modelos Involucrados
- `Team` — organización/equipo
- `Membership` — pivot User ↔ Team (con rol)
- `TeamInvitation` — invitaciones pendientes
- `Pet`, `Adoption`, `Announcement`, `BlogPost` — contenidos del team

## Enums

| Enum | Valores |
|---|---|
| `TeamRole` | `owner`, `admin`, `member` |

## Conceptos

- Un **Team** puede ser **personal** (`is_personal = true`, creado automáticamente al registrarse) o una **organización** (`is_personal = false`)
- Solo las organizaciones (`is_personal = false`) aparecen en `/admin/organizaciones`
- Cada usuario tiene un `current_team_id` que define su contexto activo

## Endpoints

### Admin (`/admin/organizaciones`)
CRUD completo: index, create, store, show, edit, update, destroy.

### Settings (`/settings/teams`)
CRUD de equipos del usuario, cambio de equipo activo, gestión de miembros, invitaciones.

## Admin Index
- Búsqueda (nombre, ciudad, estado, bio)
- Stats: total orgs, mascotas, adopciones, eventos
- Cards con logo, nombre, ciudad, conteos (mascotas, adopciones, eventos, blog)
- Paginación

## Admin Show
- Header con logo + nombre + badges
- Stats: mascotas, adopciones, eventos, blog posts, miembros
- Desglose por especie y por estado
- Miembros del equipo con roles
- Últimas mascotas

## Admin Create
- Formulario: nombre, bio, logo, web, teléfono, dirección, ciudad, estado, redes sociales
- Auto-asigna al creador como `owner`

## Admin Edit
- Mismos campos + lista de miembros actuales
