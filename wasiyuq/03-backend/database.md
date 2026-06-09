# Base de Datos

## Conexión

**Driver:** `sqlsrv` (Microsoft SQL Server 2019)

**Configuración en `.env`:**

```
DB_CONNECTION=sqlsrv
DB_HOST=sqlserver
DB_PORT=1433
DB_DATABASE=wasiyuq
DB_USERNAME=sa
```

**Middleware de sesión/cache/cola:** Redis (no SQL Server).

## Migraciones (18 archivos)

| Migración | Tablas | Descripción |
|---|---|---|
| `0001_01_01_000000` | `users`, `password_reset_tokens`, `sessions` | Usuarios y autenticación base |
| `0001_01_01_000001` | `cache`, `cache_locks` | Cache de Laravel |
| `0001_01_01_000002` | `jobs`, `job_batches`, `failed_jobs` | Colas de trabajo |
| `2024_01_01_000000` | `passkeys` | WebAuthn / Passkeys |
| `2025_08_14_170933` | — | Agrega `two_factor_*` a `users` |
| `2026_01_27_000001` | `teams`, `team_members`, `team_invitations` | Equipos/organizaciones |
| `2026_01_27_000002` | — | Agrega `current_team_id` a `users` |
| `2026_01_28_000001` | — | Agrega campos de organización a `teams` |
| `2026_01_28_000002` | `pets` | Mascotas |
| `2026_01_28_000003` | `announcements` | Eventos/anuncios |
| `2026_01_28_000004` | `blog_posts` | Artículos del blog |
| `2026_01_28_000005` | `adoptions` | Solicitudes de adopción |
| `2026_01_28_000006` | `follow_ups` | Seguimientos post-adopción |
| `2026_01_29_000001` | — | Agrega `is_super_admin` a `users` |
| `2026_05_26_122303` | — | Aumenta longitud de `cover_image` |
| `2026_05_26_124025` | — | Agrega `social_id`, `social_provider`, `avatar` a `users` |
| `2026_05_26_140346` | `contact_requests` | Solicitudes de contacto |
| `2026_05_28_040020` | — | Agrega `acta_path` a `adoptions` |

## Esquema de Tablas Clave

### `users`
| Columna | Tipo |
|---|---|
| id | bigint PK |
| name | varchar(255) |
| email | varchar(255) UNIQUE |
| password | varchar(255) nullable |
| current_team_id | bigint FK nullable |
| is_super_admin | boolean default false |
| social_id | varchar(255) nullable |
| social_provider | varchar(255) nullable |
| avatar | varchar(255) nullable |
| two_factor_secret | text nullable |
| two_factor_recovery_codes | text nullable |
| two_factor_confirmed_at | datetime nullable |
| timestamps | created_at, updated_at |

### `pets`
| Columna | Tipo |
|---|---|
| id | bigint PK |
| team_id | bigint FK |
| name | varchar(255) |
| slug | varchar(255) UNIQUE |
| species | varchar(50) |
| breed | varchar(255) nullable |
| age_years | int default 0 |
| age_months | int default 0 |
| gender | varchar(20) nullable |
| size | varchar(20) nullable |
| color | varchar(100) nullable |
| description | text nullable |
| medical_notes | text nullable |
| status | varchar(50) default 'available' |
| photos | text (JSON array) nullable |
| deleted_at | datetime nullable |
| timestamps | created_at, updated_at |

### `teams`
| Columna | Tipo |
|---|---|
| id | bigint PK |
| name | varchar(255) |
| slug | varchar(255) UNIQUE |
| is_personal | boolean default false |
| bio | text nullable |
| logo | varchar(255) nullable |
| website | varchar(255) nullable |
| phone | varchar(50) nullable |
| address | varchar(255) nullable |
| city | varchar(100) nullable |
| state | varchar(100) nullable |
| social_links | text (JSON) nullable |
| deleted_at | datetime nullable |
| timestamps | created_at, updated_at |

### `adoptions`
| Columna | Tipo |
|---|---|
| id | bigint PK |
| pet_id | bigint FK |
| user_id | bigint FK |
| team_id | bigint FK |
| status | varchar(50) default 'pending' |
| motivation | text nullable |
| experience_with_pets | boolean nullable |
| has_yard | boolean nullable |
| housing_type | varchar(100) nullable |
| family_composition | varchar(255) nullable |
| notes | text nullable |
| reviewed_by | bigint FK nullable |
| reviewed_at | datetime nullable |
| acta_path | varchar(255) nullable |
| deleted_at | datetime nullable |
| timestamps | created_at, updated_at |

### `follow_ups`
| Columna | Tipo |
|---|---|
| id | bigint PK |
| adoption_id | bigint FK |
| scheduled_date | date |
| completed_date | date nullable |
| status | varchar(50) default 'pending' |
| notes | text nullable |
| photos | text (JSON) nullable |
| created_by | bigint FK |
| timestamps | created_at, updated_at |
