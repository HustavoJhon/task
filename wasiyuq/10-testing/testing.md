# Testing

## Framework

**Pest PHP** (v4.7) con plugins:
- `pest-plugin-laravel` — helpers para Laravel
- `pest-plugin-drift` — migración desde PHPUnit

## Configuración

Archivo: `phpunit.xml` (Pest usa la configuración de PHPUnit)

PHPUnit config:
```xml
<php>
    <env name="APP_MAINTENANCE_DRIVER" value="file"/>
    <env name="BCRYPT_ROUNDS" value="4"/>
    <env name="CACHE_DRIVER" value="array"/>
    <env name="DB_CONNECTION" value="sqlite"/>
    <env name="DB_DATABASE" value=":memory:"/>
    <env name="MAIL_MAILER" value="array"/>
    <env name="QUEUE_CONNECTION" value="sync"/>
    <env name="SESSION_DRIVER" value="array"/>
</php>
```

## Estructura

```
tests/
├── Pest.php                          — Configuración global
├── TestCase.php                      — Base TestCase
├── Unit/
│   └── ExampleTest.php               — Test unitario ejemplo
└── Feature/
    ├── DashboardTest.php             — Dashboard
    ├── ExampleTest.php               — Test feature ejemplo
    ├── Auth/
    │   ├── AuthenticationTest.php
    │   ├── EmailVerificationTest.php
    │   ├── PasswordConfirmationTest.php
    │   ├── PasswordResetTest.php
    │   ├── RegistrationTest.php
    │   ├── TwoFactorChallengeTest.php
    │   └── VerificationNotificationTest.php
    ├── Settings/
    │   ├── ProfileUpdateTest.php
    │   └── SecurityTest.php
    └── Teams/
        ├── TeamInvitationTest.php
        ├── TeamMemberTest.php
        └── TeamTest.php
```

Total: **17 archivos de test**

## Cómo ejecutar tests

```bash
# Tests completos (lint + test)
composer test

# Solo tests
php artisan test

# Tests con cobertura
php artisan test --coverage

# Archivo específico
php artisan test tests/Feature/Auth/AuthenticationTest.php
```

## Tests incluidos

### Auth (7 tests)
- Authentication — login, logout, throttle
- Registration — registro, validación
- Email Verification — verificación de email
- Password Confirmation — confirmación de password
- Password Reset — reset de contraseña
- Two-Factor Challenge — autenticación 2FA
- Verification Notification — notificación de verificación

### Settings (2 tests)
- Profile Update — actualizar nombre, email
- Security — cambio de contraseña

### Teams (3 tests)
- Team — creación, edición, eliminación
- Team Members — agregar, remover miembros, roles
- Team Invitations — enviar, aceptar, expirar invitaciones

### Dashboard (1 test)
- DashboardTest — test básico de dashboard
