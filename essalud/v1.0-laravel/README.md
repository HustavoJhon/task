# EsSalud - Plataforma de Atención al Asegurado v1.0 (Laravel)

## ¿Qué es?

Una plataforma web para que los asegurados de EsSalud puedan hacer sus trámites en línea, consultar un chatbot inteligente, ver noticias y acceder a preguntas frecuentes. Todo desde el navegador, sin instalar nada.

Construido con **Laravel 11** (PHP), base de datos **MySQL**, y **Docker** para que funcione igual en cualquier computadora.

---

## ¿Cómo funciona?

### Vista del asegurado (usuario normal)

```
1. Entra a la web → ve la landing page
2. Se registra con su DNI, nombre, email y contraseña
3. Inicia sesión → ve su dashboard personal
4. Puede:
   - Crear un trámite (afiliación, maternidad, lactancia, etc.)
   - Subir documentos (PDF, JPG, PNG)
   - Ver el estado de sus trámites (aprobado, rechazado, en revisión...)
   - Chatear con el asistente virtual (responde con FAQ o IA)
   - Ver noticias de EsSalud
   - Consultar preguntas frecuentes (204 cargadas)
```

### Vista del operador (empleado EsSalud)

```
1. Inicia sesión con su cuenta de operador
2. Ve los trámites asignados a él
3. Puede:
   - Aprobar o rechazar trámites
   - Solicitar subsanación (pedir correcciones)
   - Agregar comentarios
```

### Vista del admin (supervisor)

```
1. Ve todos los trámites del sistema
2. Dashboard con estadísticas (KPIs)
3. Asigna trámites a operadores
4. Gestiona usuarios y roles
5. Exporta reportes
```

---

## Stack tecnológico (lo que usa por dentro)

| Componente | Tecnología | ¿Para qué? |
|---|---|---|
| **Lenguaje** | PHP 8.3 | Todo el backend |
| **Framework** | Laravel 11 | Estructura del proyecto, rutas, base de datos |
| **Frontend** | Blade + Tailwind CSS | Las páginas que ve el usuario |
| **Interactividad** | Alpine.js + Livewire | Formularios dinámicos, chat en tiempo real |
| **Base de datos** | MySQL 8 | Guarda usuarios, trámites, documentos, FAQs |
| **Cache** | Redis | Acelera consultas frecuentes |
| **Tareas en background** | Laravel Queue + Redis | OCR de documentos, generar embeddings |
| **Búsqueda vectorial** | Qdrant | Para el chatbot RAG (buscar en documentos) |
| **IA** | OpenAI API | Chatbot: embeddings + respuestas inteligentes |
| **OCR** | Tesseract | Extraer texto de documentos escaneados |
| **Archivos** | MinIO (S3) | Almacenar documentos subidos |
| **Contenedores** | Docker Compose | Todo corre en 8 contenedores |

---

## Cómo se ejecuta en desarrollo

```bash
# 1. Clonar el proyecto
git clone git@github.com:HustavoJhon/EsSalud-Laravel.git
cd EsSalud-Laravel

# 2. Configurar
cp .env.example .env

# 3. Levantar todo con Docker
docker compose up -d --build

# 4. Crear las tablas y datos de prueba
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --force

# 5. Abrir en el navegador
# http://localhost:8082
```

**Credenciales de prueba:**

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@essalud.pe | Admin123! |
| Asegurado | aseg@essalud.pe | Aseg123! |
| Operador | oper@essalud.pe | Oper123! |

---

## ¿Cómo funcionaría en producción?

Cuando el proyecto esté listo para usarse de verdad, esto es lo que se necesita:

### 1. Un servidor (VPS o cloud)

Un servidor Linux con:
- 4 GB de RAM mínimo
- 2 CPUs
- 50 GB de disco
- Ubuntu 22.04 o 24.04

Ejemplos: DigitalOcean, AWS EC2, Hetzner, Hostinger VPS.

### 2. Dominio y SSL

- Comprar un dominio: `essalud.gob.pe` o `tramites.essalud.gob.pe`
- Configurar SSL (HTTPS) con Let's Encrypt (gratis, automático)

### 3. Docker en el servidor

Mismos contenedores que en desarrollo, pero con configuración de producción:
- `APP_ENV=production`
- `APP_DEBUG=false`
- Contraseñas seguras (no las de prueba)
- Base de datos con backups automáticos

### 4. Servicios externos necesarios

| Servicio | ¿Para qué? | Costo aprox. |
|---|---|---|
| **OpenAI API** | Chatbot inteligente | ~$0.01 por consulta |
| **Servidor VPS** | Donde corre la app | ~$20-40/mes |
| **Dominio** | La dirección web | ~$10-15/año |
| **Email SMTP** | Enviar correos (recuperación, notificaciones) | ~$5/mes (Mailgun, SendGrid) |

### 5. Flujo de deploy

```
Desarrollador hace cambios en Git
         ↓
GitHub Actions (CI/CD automático)
  - Corre tests
  - Si pasan → hace deploy al servidor
         ↓
Servidor de producción
  - git pull (baja los cambios)
  - composer install (instala dependencias)
  - php artisan migrate (actualiza la base de datos)
  - php artisan queue:restart (reinicia tareas)
         ↓
App actualizada en producción ✨
```

### 6. Arquitectura en producción

```
Internet
    ↓
Cloudflare (CDN + protección DDoS) → opcional pero recomendado
    ↓
Nginx (puerto 80/443, sirve la app y HTTPS)
    ↓
PHP-FPM (procesa Laravel, puerto 9000)
    ↓
MySQL 8 (base de datos, puerto 3306)
Redis 7 (cache + colas, puerto 6379)
MinIO (archivos, puerto 9000)
Qdrant (búsqueda IA, puerto 6333)
```

---

## Estructura del proyecto

```
EsSalud-Laravel/
├── app/
│   ├── Http/Controllers/    ← Lógica de cada página
│   │   ├── Auth/            ← Login, registro, perfil
│   │   ├── ChatController   ← Chatbot
│   │   ├── ProcedureController ← Trámites
│   │   ├── DocumentController  ← Documentos
│   │   ├── NewsController      ← Noticias
│   │   └── FaqController       ← FAQ
│   ├── Models/              ← Tablas de la base de datos
│   ├── Services/            ← OpenAI, Qdrant, Chat (lógica compleja)
│   ├── Jobs/                ← Tareas en background (OCR, embeddings)
│   └── Policies/            ← Quién puede hacer qué
├── database/
│   ├── migrations/          ← Estructura de las tablas
│   └── seeders/             ← Datos de prueba (usuarios, FAQs, etc.)
├── resources/views/         ← Las páginas HTML (Blade)
│   ├── layouts/             ← Plantillas base
│   ├── auth/                ← Login, registro
│   ├── procedures/          ← Páginas de trámites
│   ├── chat/                ← Página del chatbot
│   └── landing.blade.php    ← Landing page pública
├── routes/web.php           ← URLs de la aplicación
├── docker-compose.yml       ← Configuración de Docker
└── docker/                  ← Dockerfiles y config de Nginx
```

---

## Roles y permisos

| Rol | ¿Quién es? | ¿Qué puede hacer? |
|---|---|---|
| **ASEG** | Asegurado (usuario normal) | Crear trámites, chatear, ver FAQ/noticias |
| **OPER** | Operador EsSalud | Revisar, aprobar o rechazar trámites |
| **SUPV** | Supervisor | Dashboard KPIs, asignar trámites, reportes |
| **GESDOC** | Gestor documental | Subir documentos oficiales, gestionar FAQ |
| **SADM** | Administrador del sistema | Todo: usuarios, roles, configuración |

---

## Preguntas frecuentes sobre el proyecto

**¿Necesito saber PHP para usarlo?**
No. Solo necesitas Docker. Con `docker compose up -d` ya funciona.

**¿Funciona sin OpenAI?**
Sí. El chatbot usa primero las 204 FAQs precargadas (gratis). OpenAI solo se usa como respaldo si no encuentra match.

**¿Puedo cambiar los puertos?**
Sí. Edita `docker-compose.yml` y cambia el puerto de nginx (por defecto `8082:80`).

**¿Cómo agrego más FAQs?**
Ejecuta el seeder con más datos, o usa el panel de admin (próximamente).

**¿Cómo hago backup de la base de datos?**
```bash
docker exec essalud-laravel-mysql mysqldump -u essalud -p essalud > backup.sql
```
