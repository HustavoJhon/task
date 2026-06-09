# Estilos y Theming

## CSS

**Archivo principal:** `resources/css/app.css`

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
    --color-background: oklch(1 0 0);
    --color-foreground: oklch(0.145 0 0);
    --color-primary: oklch(0.205 0.042 265.755);
    /* ... más variables CSS shadcn ... */
    --radius: 0.625rem;
}
```

## Tailwind CSS v4

Usado via `@tailwindcss/vite` plugin (sin `tailwind.config.js`).

Configuración inline via `@theme` directive.

## shadcn-vue (New York v4)

- Componentes UI accesibles basados en Reka UI
- Estilo: "new-york-v4"
- CSS variables para theming dinámico
- Componentes en `resources/js/components/ui/`

## Modo Oscuro

- Toggle via `AppearanceTabs` (Claro / Oscuro / Sistema)
- Clase `dark` en `<html>` cuando está en modo oscuro
- Variables CSS cambian automáticamente: `dark:` variant en Tailwind
- Persistencia en localStorage
- Escucha `prefers-color-scheme` para modo "Sistema"

## Estilo de Cards Admin

Todas las páginas admin usan el mismo patrón visual:

```html
<div class="rounded-2xl border border-[#2D6A4F]/15 
            bg-gradient-to-b from-white to-[#2D6A4F]/4 p-6 
            dark:border-[#2D6A4F]/30 dark:from-[#2D6A4F]/15 dark:to-black/40">
```

## Iconos

Librería: **lucide-vue-next** para todos los iconos.
