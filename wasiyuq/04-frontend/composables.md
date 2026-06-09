# Composables

Archivos en `resources/js/composables/`:

## `useAppearance.ts`

Gestión del tema (claro/oscuro/sistema).

```ts
export function useAppearance() {
    const appearance = ref<'light' | 'dark' | 'system'>('system');
    const resolvedAppearance = ref<'light' | 'dark'>('light');

    function updateAppearance(value: 'light' | 'dark' | 'system') { ... }
    function getResolvedAppearance(): 'light' | 'dark' { ... }

    // Persiste en localStorage
    // Escucha prefers-color-scheme si es 'system'
    // Aplica clase 'dark' al <html>
}
```

Usado por: `AppearanceTabs.vue`, `DashboardLayout.vue`.

## `useCurrentUrl.ts`

Utilidades para determinar la URL actual y hacer matching.

```ts
export function useCurrentUrl() {
    function currentUrl(path?: string) { ... }
    function urlIs(url: string) { ... }
    // etc.
}
```

## `useInitials.ts`

Obtener iniciales de un nombre para avatares.

```ts
export function useInitials() {
    function getInitials(name: string): string { ... }
}
```

## `useMediaQuery.ts`

Media query reactiva.

```ts
export function useMediaQuery(query: string): Ref<boolean>
```

## `useTwoFactorAuth.ts`

Manejo de autenticación de dos factores: QR codes, setup keys, recovery codes.
