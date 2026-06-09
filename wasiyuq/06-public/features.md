# Características Públicas

## SEO
- Meta tags dinámicos vía Inertia `Head` component
- Sitemap XML en `/sitemap.xml`
- URLs amigables con slugs (mascotas, eventos, blog)
- Tiempo de carga optimizado con Vite + build production

## PWA (Progressive Web App)

Configurado en `vite.config.ts` con `vite-plugin-pwa`:

```ts
VitePWA({
    registerType: 'autoUpdate',
    manifest: {
        name: 'Wasiyuq — Adopción responsable en Cusco',
        short_name: 'Wasiyuq',
        description: 'Plataforma de adopción responsable de mascotas en Cusco',
        theme_color: '#2D6A4F',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
    },
})
```

**Características:**
- Service worker generado automáticamente
- Precaching de assets
- App installable (add to home screen)
- Auto-update del service worker

## Capacitor

Configuración para apps móviles nativas:
- `@capacitor/android` — build Android
- `@capacitor/camera` — acceso a cámara
- `@capacitor/local-notifications` — notificaciones locales

## Health Check
`GET /health` → `{ status: 'ok' }`

## Diseño Responsivo
- Mobile-first con Tailwind CSS
- Navegación adaptativa (sidebar en desktop, menú hamburguesa en mobile)
- Grids responsivos (1 columna mobile, 2-4 columnas desktop)
- Cards adaptables
