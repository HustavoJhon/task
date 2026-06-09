# Módulo Blog

## Modelo: `BlogPost`

| Campo | Tipo |
|---|---|
| `team_id` | bigint FK |
| `user_id` | bigint FK (autor) |
| `title` | string |
| `slug` | string (route key) |
| `excerpt` | text (resumen) |
| `content` | text (markdown) |
| `cover_image` | text (URL) |
| `category` | string |
| `tags` | json (array) |
| `is_published` | boolean |
| `published_at` | datetime |
| `deleted_at` | soft delete |

## Endpoints

### Admin (`/admin/blog`)
CRUD completo.

### Dashboard por Org (`/{team}/blog`)
CRUD del equipo.

### Público (`/blog`)
Lista y detalle públicos.

## Admin Index
- Búsqueda (título, categoría, organización, autor)
- Cards con categoría coloreada, badge de publicado/borrador, excerpt, organización, autor, fecha

## Admin Create/Edit
- Organización, título, slug (auto), extracto, contenido (textarea con preview markdown), imagen de portada, categoría, tags, publicado

## Admin Show
- Hero con cover image
- Contenido renderizado como markdown (usando librería `marked`)
- Sidebar: organización, autor, categoría, tags, fechas
- Excerpt como descripción

## Público
- Grid de artículos con categorías emoji
- Detalle con markdown renderizado
- Social sharing
- Artículos relacionados por tipo de evento
