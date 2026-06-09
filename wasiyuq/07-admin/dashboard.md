# Panel de Administración

## Dashboard (`/admin`)

Controlador: `Admin\DashboardController@index`

**Estadísticas renderizadas:**
| Stat | Descripción |
|---|---|
| `total_pets` | Total mascotas registradas |
| `available_pets` | Mascotas disponibles |
| `adopted_pets` | Mascotas adoptadas |
| `total_organizations` | Organizaciones activas |
| `total_adoptions` | Solicitudes totales |
| `pending_adoptions` | Solicitudes pendientes |
| `total_events` | Eventos totales |
| `total_blog_posts` | Artículos totales |
| `pending_follow_ups` | Seguimientos pendientes |
| `total_users` | Usuarios registrados |

**Además:**
- Últimas 5 adopciones
- Últimas 5 mascotas agregadas
- Tendencia de adopciones (12 meses, chart de barras)

## Perfil (`/admin/perfil`)

Controlador: `Admin\ProfileController`

- Editar nombre
- Email (solo lectura, con link a settings)
- Fecha de registro
- Rol (Super Admin / Admin)
- Mis adopciones (lista con emoji, nombre, estado, fecha)
- Sidebar: organizaciones, accesos rápidos (configuración, seguridad), toggle de tema (claro/oscuro/sistema), zona de peligro (eliminar cuenta)

## Roles (`/admin/roles`)

Controlador: `Admin\RoleManagementController`

**Vista:** Cards de roles con:
- Nombre del rol
- Usuarios asignados
- Permisos detallados por módulo (view, create, edit, delete)

## Usuarios (`/admin/usuarios`)

- Lista con tabla responsiva
- Nombre, email, rol, equipos, acciones
- Toggle rápido para super admin
- Eliminar usuario
- Detalle con stats y equipos
