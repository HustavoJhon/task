# Páginas Públicas

## Home (`/`)

Controlador: `Public\HomeController`

**Props pasadas a la vista:**
- `stats` — mascotas adoptadas, organizaciones, mascotas disponibles
- `species` — conteo por especie (perros, gatos, conejos, aves, otros)
- `recentPets` — últimas 4 mascotas disponibles con foto, nombre, org, ubicación

**Secciones:**
1. Hero con blur backgrounds + CTA "Adopta"
2. Stats: adoptados, organizaciones, disponibles
3. Especies con emojis y conteos
4. Mascotas destacadas (grid 2x2)
5. Timeline del proceso de adopción
6. Developer card y CTA final

## Mascotas Público (`/mascotas`)

Controlador: `Public\PetController` (usa `PetService`)

**Filtros disponibles:**
- Especie (dog, cat, rabbit, bird, other)
- Tamaño (small, medium, large)
- Género (male, female)
- Edad (baby, young, adult, senior)
- Ubicación (por ciudad de la organización)

**Vista:** Grid responsivo de cards con foto, nombre, edad, ubicación.

## Mascota Detalle (`/mascotas/{slug}`)

- Galería de fotos (si tiene)
- Nombre, especie, raza, edad, género, tamaño, color
- Descripción
- Notas médicas
- Botón "Postularme" (requiere autenticación)

## Eventos Público (`/eventos`)

Controlador: `Public\EventController`

- Grid de eventos con tipo coloreado, fecha, ubicación
- Cuenta regresiva (días hasta el evento)
- Tips por tipo de evento
- Artículos de blog relacionados

## Blog Público (`/blog`)

Controlador: `Public\BlogController`

- Grid de artículos con categoría emoji, excerpt, imagen
- Artículo detalle con markdown renderizado
- Social sharing buttons
- Back to events / blog CTA

## Sobre Nosotros (`/sobre-nosotros`)

Controlador: `Public\AboutController`

- Hero con título y descripción
- Sección de origen/misión
- Timeline del proyecto
- Developer card
- CTA section

## Contacto (`/contacto`)

Controlador: `Public\ContactController`

- Formulario: nombre, email, asunto, mensaje
- Sidebar: dirección, email, teléfono, horarios, redes sociales
- Validación y toast de éxito

## Sitemap (`/sitemap.xml`)

Controlador: `Public\SitemapController`

Genera XML con todas las URLs públicas del sitio para SEO.
