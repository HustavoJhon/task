# Módulo Seguimientos (Follow-ups)

## Modelo: `FollowUp`

| Campo | Tipo | Descripción |
|---|---|---|
| `adoption_id` | bigint FK | Adopción relacionada |
| `scheduled_date` | date | Fecha programada para la visita |
| `completed_date` | date | Fecha en que se realizó |
| `status` | enum | `pending`, `completed`, `missed` |
| `notes` | text | Notas de la visita |
| `photos` | json | Fotos de la visita |
| `created_by` | bigint FK | Usuario que lo creó |

## Enums

| Enum | Valores |
|---|---|
| `FollowUpStatus` | `pending`, `completed`, `missed` |

## Propósito

Los seguimientos permiten a las organizaciones hacer un **acompañamiento post-adopción** para asegurar el bienestar de la mascota. Se programan visitas (fechas) y se registra el resultado.

## Endpoints

### Admin (`/admin/seguimiento`)
| Método | Ruta |
|---|---|
| GET | `/admin/seguimiento` — listado |
| GET | `/admin/seguimiento/crear` — formulario |
| POST | `/admin/seguimiento` — crear |
| GET | `/admin/seguimiento/{followUp}` — detalle |
| GET | `/admin/seguimiento/{followUp}/editar` — editar |
| PUT | `/admin/seguimiento/{followUp}` — actualizar |
| DELETE | `/admin/seguimiento/{followUp}` — eliminar |

### Dashboard por Org (`/{team}/seguimientos`)
- Listar, ver detalle, marcar completado/missed, programar nuevo

### Adoptante (`/mi-adopcion/seguimientos`)
- Ver seguimientos propios
- Reportar (subir fotos, notas)

## Admin Index
- Búsqueda (mascota, adoptante, creador, estado)
- Cards con icono de checklist, badge de estado, mascota, adoptante, fecha, creador
- Acciones hover: ver, editar, eliminar
- Botón "Nuevo Seguimiento"

## Admin Create/Edit
- Selector de adopción (mascota — adoptante)
- Fecha programada
- Estado (Pendiente/Completado/No Realizado)
- Notas (textarea)

## Admin Show
- Header con badge de estado + botón editar
- Notas en tarjeta
- Fotos en grid (si tiene)
- Sidebar: mascota, adoptante, email, fechas, creador

## Tarea Programada

`CheckOverdueMilestonesJob` se ejecuta **diariamente** y verifica seguimientos cuya `scheduled_date` ya pasó y aún están `pending`. Los marca como `missed`.
