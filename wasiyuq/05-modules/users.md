# Módulo Usuarios y Roles

## Modelo: `User`

| Campo | Tipo | Uso |
|---|---|---|
| `name` | string | Nombre completo |
| `email` | string | Email único (login) |
| `password` | string hashed | Contraseña (nullable para social login) |
| `current_team_id` | bigint FK | Equipo activo actual |
| `is_super_admin` | boolean | Admin global |
| `social_id` | string | ID de Google |
| `social_provider` | string | `google` |
| `avatar` | string | URL de avatar |
| `two_factor_*` | varios | 2FA |

## Roles

### Super Admin (`is_super_admin = true`)
- Acceso a `/admin/*`
- CRUD global de todo el sistema
- Gestión de usuarios y roles

### Usuario Regular (`is_super_admin = false`)
- Acceso a dashboard de organización (si es miembro)
- Postularse a mascotas
- Ver seguimientos propios

### Roles por Organización (TeamRole)
| Rol | Permisos |
|---|---|
| `owner` | Dueño — control total del equipo |
| `admin` | Admin del equipo — CRUD mascotas, blog, eventos |
| `member` | Miembro — puede ver, no gestionar |

## Endpoints Admin

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/admin/usuarios` | Lista de usuarios |
| GET | `/admin/usuarios/{user}` | Detalle del usuario |
| PUT | `/admin/usuarios/{user}/role` | Cambiar `is_super_admin` |
| DELETE | `/admin/usuarios/{user}` | Eliminar usuario |

## Admin Users Index
- Tabla responsiva con nombre, email, rol (Super Admin / Admin), membresías a equipos
- Cambio rápido de super admin (toggle)
- Eliminar usuario

## Admin Users Show
- Header con avatar, nombre, email, badge de rol
- Stats: miembros de equipos, adopciones realizadas
- Lista de equipos con roles
- Enlace a adopciones del usuario
