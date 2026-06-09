# Roles y Permisos (Admin)

## Controlador

**Archivo:** `app/Http/Controllers/Admin/RoleManagementController.php`

### Endpoints

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/admin/roles` | Listar roles con usuarios asignados |
| GET | `/admin/roles/{role}` | Detalle del rol con permisos |

### Vista Index (`Admin/Roles/Index.vue`)

- Cards de roles (Super Admin, Admin, Miembro)
- Cada card muestra: nombre, descripción, usuarios asignados con avatar
- Icono y color distintivo por rol

### Vista Show (`Admin/Roles/Show.vue`)

- Stats: total de usuarios, permisos activos
- Módulos con permisos detallados:
  - Mascotas (view, create, edit, delete)
  - Organizaciones (view, create, edit, delete)
  - Adopciones (view, approve, reject)
  - Seguimientos (view, create, edit, delete)
  - Eventos (view, create, edit, delete)
  - Blog (view, create, edit, delete)
  - Usuarios (view, edit, delete)
  - Roles (view, edit)

## Modelo de Permisos

Actualmente los permisos se manejan de forma **implícita**:
- `is_super_admin = true` → acceso total a `/admin/*`
- Roles por equipo (`owner`, `admin`, `member`) controlan acceso al dashboard de organización
- No hay un sistema de policies/abilities por módulo más allá de lo anterior
