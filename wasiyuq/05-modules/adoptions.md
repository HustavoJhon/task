# Módulo Adopciones

## Modelo: `Adoption`

| Relación | Tipo |
|---|---|
| `pet()` | BelongsTo Pet |
| `adopter()` | BelongsTo User (user_id) |
| `team()` | BelongsTo Team |
| `reviewer()` | BelongsTo User (reviewed_by) |
| `followUps()` | HasMany FollowUp |

## Enums

| Enum | Valores |
|---|---|
| `AdoptionStatus` | `pending`, `approved`, `rejected`, `completed`, `cancelled` |

## Flujo de Estado

```
                    ┌─────────┐
                    │ Pending │
                    └────┬────┘
                    ┌────┴────┐
                    ▼         ▼
              ┌─────────┐ ┌──────────┐
              │Approved │ │ Rejected │
              └────┬────┘ └──────────┘
                   ▼
             ┌───────────┐
             │ Completed │
             └───────────┘
                   
Cualquier estado puede ir a "cancelled" excepto completed.
```

## Solicitud de Adopción (Postulación)

### Proceso
1. Usuario ve una mascota en `/mascotas/{slug}`
2. Hace clic en "Postularme"
3. Completa formulario: motivación, experiencia, patio, vivienda, familia
4. Se crea `Adoption` con status `pending`
5. Admin/Organización revisa y aprueba o rechaza

### Formulario de Postulación (público → autenticado)
```
Motivación (textarea)
¿Tienes experiencia con mascotas? (sí/no)
¿Tienes patio? (sí/no)
Tipo de vivienda (select: casa/departamento/otro)
Composición familiar (texto)
```

## Admin: Index (`/admin/adopciones`)
- Búsqueda textual (mascota, adoptante, email, organización)
- Filtros: estado, especie
- Stats: total, pendientes, completadas, últimos 30 días
- Gráficos: barras por estado y por especie
- Cards con emoji de especie, nombre, adoptante, email, org, fecha
- Acción hover: ver detalle

## Admin: Show (`/admin/adopciones/{id}`)
- Header con emoji + nombre + badge de estado
- Columna principal: motivación, respuestas a preguntas, notas
- Seguimientos relacionados
- Sidebar: datos del adoptante, email, org, raza, revisor, fechas

## Dashboard por Org
- Listado de adopciones de la organización
- Acciones: aprobar, rechazar
