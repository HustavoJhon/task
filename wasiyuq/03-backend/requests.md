# Form Requests (Validación)

## Pet

### `StorePetRequest.php`

| Campo | Reglas |
|---|---|
| `name` | required, string, max:255 |
| `slug` | nullable, string, max:255, unique:pets |
| `species` | required, string, in:dog,cat,rabbit,bird,other |
| `breed` | nullable, string, max:255 |
| `age_years` | nullable, integer, min:0, max:50 |
| `age_months` | nullable, integer, min:0, max:11 |
| `gender` | nullable, string, in:male,female |
| `size` | nullable, string, in:small,medium,large |
| `color` | nullable, string, max:100 |
| `description` | nullable, string, max:5000 |
| `medical_notes` | nullable, string, max:5000 |
| `status` | nullable, string, in:available,adopted,reserved,medical,temporary |
| `team_id` | required, integer, exists:teams,id |
| `photo` | nullable, image, max:5120 |
| `photo_url` | nullable, url |

### `UpdatePetRequest.php`

| Campo | Reglas |
|---|---|
| `name` | required, string, max:255 |
| `slug` | nullable, string, max:255, unique:pets,slug,{id} |
| (mismos campos que store, excepto team_id y photo) |

## Announcement (Eventos)

### `StoreAnnouncementRequest.php`

| Campo | Reglas |
|---|---|
| `team_id` | required, exists:teams,id |
| `title` | required, string, max:255 |
| `slug` | nullable, string, max:255, unique:announcements |
| `description` | required, string |
| `event_date` | required, date |
| `location` | nullable, string, max:255 |
| `type` | required, in:adoption_drive,fundraiser,workshop,other |
| `cover_image` | nullable, url |
| `is_published` | boolean |

### `UpdateAnnouncementRequest.php`

Mismas reglas que store (excepto team_id opcional).

## Blog

### `StoreBlogPostRequest.php`

| Campo | Reglas |
|---|---|
| `team_id` | required, exists:teams,id |
| `title` | required, string, max:255 |
| `slug` | nullable, string, max:255, unique:blog_posts |
| `excerpt` | nullable, string, max:500 |
| `content` | required, string |
| `cover_image` | nullable, url |
| `category` | nullable, string, max:100 |
| `tags` | nullable, array |
| `is_published` | boolean |

### `UpdateBlogPostRequest.php`

Mismas reglas.

## FollowUp

### `StoreFollowUpRequest.php`

| Campo | Reglas |
|---|---|
| `adoption_id` | required, exists:adoptions,id |
| `scheduled_date` | required, date |
| `status` | required, in:pending,completed,missed |
| `notes` | nullable, string |

### `UpdateFollowUpRequest.php`

Mismas reglas.

## User

### `UpdateUserRoleRequest.php`

| Campo | Reglas |
|---|---|
| `is_super_admin` | boolean |
