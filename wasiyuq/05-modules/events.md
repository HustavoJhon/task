# Módulo Eventos (Announcements)

## Modelo: `Announcement`

| Campo | Tipo |
|---|---|
| `team_id` | bigint FK |
| `user_id` | bigint FK (autor) |
| `title` | string |
| `slug` | string (route key) |
| `description` | text |
| `event_date` | datetime |
| `location` | string |
| `type` | enum |
| `cover_image` | text (URL) |
| `is_published` | boolean |
| `published_at` | datetime |
| `deleted_at` | soft delete |

## Enums

| Enum | Valores |
|---|---|
| `AnnouncementType` | `adoption_drive`, `fundraiser`, `workshop`, `other` |

## Endpoints

### Admin (`/admin/eventos`)
CRUD completo. El tipo de evento se muestra con colores:
- 🟢 `adoption_drive` — Jornada de Adopción (verde)
- 🟡 `fundraiser` — Recaudación (ámbar)
- 🔵 `workshop` — Taller (azul)
- ⚪ `other` — Otro (gris)

### Dashboard por Org (`/{team}/eventos`)
CRUD del equipo.

### Público (`/eventos`)
Lista y detalle públicos.

## Admin Index
- Búsqueda (título, tipo, organización, autor)
- Cards con tipo coloreado, badge de publicado/no publicado, fecha, organización
- Acciones hover: ver, editar, eliminar

## Admin Create/Edit
- Organización, título, slug (auto), descripción, fecha del evento, ubicación, tipo, imagen de portada (URL), publicado

## Admin Show
- Hero con imagen de portada
- Información: fecha, ubicación, tipo, organización
- Descripción completa
- Autor y fecha de creación
