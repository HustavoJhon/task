# Módulo Contacto

## Modelo: `ContactRequest`

| Campo | Tipo |
|---|---|
| `name` | string |
| `email` | string |
| `subject` | string |
| `message` | text |
| `pet_id` | bigint FK nullable (mascota referenciada) |
| `read_at` | datetime nullable |

## Endpoints

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/contacto` | Mostrar formulario |
| POST | `/contacto` | Enviar mensaje |

## Página de Contacto (`Public/Contact.vue`)

- **Header:** selector de pestaña (actualmente solo "Contacto")
- **Formulario:** nombre, email, asunto, mensaje — con validación
- **Sidebar:**
  - Dirección (Cusco, Perú)
  - Email: hola@wasiyuq.pe
  - Teléfono
  - Horarios
  - Redes sociales (Facebook, Instagram, TikTok, WhatsApp)
- **Nota:** anteriormente tenía tabs "Contacto / Iniciar sesión / Registrarse", pero se simplificó a solo contacto.
