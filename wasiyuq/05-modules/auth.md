# Autenticación

## Stack

| Componente | Propósito |
|---|---|
| **Laravel Fortify** | Backend de autenticación (login, registro, verificación, 2FA, passkeys) |
| **Laravel Socialite** | Login con Google |
| **Inertia.js** | Frontend de formularios de auth |

## Métodos de Autenticación

### 1. Email + Contraseña
- Registro, login, logout
- Verificación de email
- Recuperación de contraseña (vía email)

### 2. Google Login (Socialite)
- `GET /auth/google` → redirige a Google
- `GET /auth/google/callback` → callback, crea usuario si no existe

### 3. Passkeys (WebAuthn)
- Autenticación sin contraseña usando biometría / PIN del dispositivo
- Gestionado por `@laravel/passkeys` + Laravel Fortify
- Componentes: `PasskeyRegister`, `PasskeyVerify`

### 4. Two-Factor Authentication (2FA)
- Códigos TOTP (Google Authenticator, Authy, etc.)
- Códigos de recuperación
- Configurable desde settings

## Páginas de Auth

| Ruta | Componente |
|---|---|
| `/login` | `auth/Login.vue` |
| `/register` | `auth/Register.vue` |
| `/forgot-password` | `auth/ForgotPassword.vue` |
| `/reset-password/{token}` | `auth/ResetPassword.vue` |
| `/email/verify` | `auth/VerifyEmail.vue` |
| `/confirm-password` | `auth/ConfirmPassword.vue` |
| `/two-factor-challenge` | `auth/TwoFactorChallenge.vue` |

## Settings de Seguridad

| Ruta | Propósito |
|---|---|
| `/settings/profile` | Editar nombre, email, eliminar cuenta |
| `/settings/security` | Cambiar contraseña (requiere confirmación reciente) |
| `/settings/appearance` | Alternar tema claro/oscuro/sistema |

## Páginas de Auth — Diseño

Todas las páginas de auth usan `AuthLayout` con variantes:
- `AuthCardLayout` — formulario centrado en card
- `AuthSimpleLayout` — formulario simple
- `AuthSplitLayout` — formulario + imagen/ilustración
