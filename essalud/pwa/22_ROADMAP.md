# 22. Roadmap del Proyecto — EsSalud (Laravel)

> **Versión:** 1.0 — Laravel 11 + Livewire 3 + Blade + MySQL 8  
> **Última actualización:** 2026-06-21  

---

## 22.1 Alcance General

Construcción de una plataforma web monolítica para la gestión de trámites de asegurados de EsSalud, incluyendo chatbot con IA (RAG), procesamiento OCR de documentos, panel administrativo y observabilidad completa. Proyecto ejecutado por **1 desarrollador principal** con apoyo de QA en fases finales.

---

## 22.2 Fases del Proyecto

---

### Fase 1 — Setup Inicial (Semana 1–2)

**Objetivo:** Entorno de desarrollo y CI/CD funcional.

| #   | Tarea                                      | Entregable                                      |
|-----|--------------------------------------------|-------------------------------------------------|
| 1.1 | Instalación de Laravel 11                  | Proyecto base con composer                      |
| 1.2 | Configuración de Docker (app + MySQL + Redis) | `docker-compose.yml` funcional               |
| 1.3 | Configuración de repositorio Git + branching | `.gitignore`, `.editorconfig`, `README.md`    |
| 1.4 | CI/CD con GitHub Actions: lint, tests       | Pipeline ejecutando `pint`, `phpstan`, `pest`  |
| 1.5 | Configuración de Laravel Livewire 3        | Componente Hello World funcional                |
| 1.6 | Configuración de Vite + Tailwind CSS       | Layout base con diseño responsive               |
| 1.7 | Base de datos MySQL 8 + migraciones base   | Tablas `users`, `migrations`, `sessions`        |

---

### Fase 2 — Autenticación y Usuarios (Semana 3–4)

**Objetivo:** Sistema de autenticación completo con roles y permisos.

| #   | Tarea                                      | Entregable                                        |
|-----|--------------------------------------------|---------------------------------------------------|
| 2.1 | Login, registro, logout (Blade + Livewire) | Formularios funcionales con validación             |
| 2.2 | Verificación de email                     | Envío de email de verificación (Mailpit en dev)    |
| 2.3 | Recuperación de contraseña                | Flujo de reset con token en email                  |
| 2.4 | Roles y permisos (Spatie)                 | Seeder con roles: asegurado, operador, supervisor, sadm |
| 2.5 | Perfil de usuario                         | Edición de datos personales, cambio de contraseña  |
| 2.6 | Rate limiting en login                    | Bloqueo tras 5 intentos, 30 min                    |
| 2.7 | Protección de rutas por rol              | Middleware `role` y Policies en controladores       |

---

### Fase 3 — Trámites CRUD (Semana 5–7)

**Objetivo:** CRUD completo del módulo central de trámites.

| #   | Tarea                                      | Entregable                                      |
|-----|--------------------------------------------|-------------------------------------------------|
| 3.1 | Migración y modelo `Procedure`             | Tablas: `procedures`, `procedure_statuses`      |
| 3.2 | Máquina de estados: Borrador → Pendiente → En Revisión → Aprobado / Rechazado / Subsanación | Enum + transiciones con validaciones      |
| 3.3 | CRUD de trámites (Blade + Livewire)       | Componentes: `ProcedureList`, `ProcedureForm`   |
| 3.4 | Timeline visual de estados               | Componente `ProcedureTimeline` con historial     |
| 3.5 | Motor de subsanaciones (máx 3, 15 días)   | Lógica de reenvío con contador                  |
| 3.6 | Asignación de trámites a operadores       | Panel de asignación para supervisor              |
| 3.7 | Notificaciones por cambio de estado       | Email + notificación in-app (Laravel Notifications)|

---

### Fase 4 — Contenido y Documentos (Semana 8–9)

**Objetivo:** Módulos de contenido informativo y gestión documental.

| #   | Tarea                                      | Entregable                                      |
|-----|--------------------------------------------|-------------------------------------------------|
| 4.1 | CRUD de Noticias con categorías            | `News` model + componentes Livewire              |
| 4.2 | CRUD de FAQ con categorías                 | `Faq` model + buscador con full-text MySQL       |
| 4.3 | Búsqueda full-text en FAQ y Noticias       | Índices FULLTEXT en MySQL + input de búsqueda    |
| 4.4 | Subida de documentos en trámites           | `Document` model + validación MIME, tamaño       |
| 4.5 | Vista previa de PDF/JPG en navegador       | Renderizado inline de documentos                 |
| 4.6 | Indexación de contenido FAQ en Qdrant      | Preparación de colección para RAG (fase 5)       |

---

### Fase 5 — IA y RAG (Semana 10–13)

**Objetivo:** Chatbot inteligente con FAQ keyword matching y RAG.

| #   | Tarea                                      | Entregable                                      |
|-----|--------------------------------------------|-------------------------------------------------|
| 5.1 | Instalación y configuración Qdrant         | Contenedor Docker + colección `essalud_kb`       |
| 5.2 | Pipeline de indexación de documentos oficiales en Qdrant | Comando artisan `documents:index`      |
| 5.3 | Servicio de embedding (OpenAI `text-embedding-3-small`) | `EmbeddingService` con cache en Redis |
| 5.4 | Servicio de FAQ keyword matching           | `FaqService::search($query)` con score > 0.5    |
| 5.5 | Servicio RAG con Qdrant + OpenAI           | `RagService::query($question)` devuelve respuesta|
| 5.6 | Componente Livewire `Chatbot`              | Interfaz de chat con streaming de respuesta      |
| 5.7 | Orquestador de chat: FAQ → RAG → no_result | `ChatOrchestrator` con fallback encadenado       |
| 5.8 | Feedback útil/no útil en respuestas       | Botones thumbs up/down que registran métrica     |
| 5.9 | Escalación de chat a operador humano       | Botón "Hablar con un operador"                   |
| 5.10| Implementación de OCR con Tesseract        | `OcrService` que procesa docs subidos            |
| 5.11| Integración OCR → validación GESDOC        | Pre-llenado de campos desde OCR                  |

---

### Fase 6 — Dashboard Admin (Semana 14–16)

**Objetivo:** Panel administrativo con Filament para gestión y reportes.

| #   | Tarea                                      | Entregable                                      |
|-----|--------------------------------------------|-------------------------------------------------|
| 6.1 | Instalación de Filament 3                  | Panel admin en `/admin` con autenticación        |
| 6.2 | Recurso Filament para `User`              | Listado, edición, asignación de roles            |
| 6.3 | Recurso Filament para `Procedure`         | CRUD + filtros por estado, tipo, fecha           |
| 6.4 | Recurso Filament para `Faq` y `News`      | CRUD con editor WYSIWYG                          |
| 6.5 | Dashboard de KPIs                         | Widgets: trámites del día, tasa de aprobación, etc.|
| 6.6 | Tablero de auditoría                      | Recurso `Audit` solo para sadm                   |
| 6.7 | Exportación de reportes (PDF, Excel)      | Generación con `laravel-excel` y `barryvdh/laravel-dompdf`|

---

### Fase 7 — Hardening (Semana 17–19)

**Objetivo:** Calidad de código, seguridad y rendimiento.

| #   | Tarea                                      | Entregable                                      |
|-----|--------------------------------------------|-------------------------------------------------|
| 7.1 | Tests unitarios (Pest) >80% cobertura      | `tests/Unit/` con cobertura de servicios        |
| 7.2 | Tests de feature (Pest)                   | `tests/Feature/` flujo completo de trámites     |
| 7.3 | Tests de integración Livewire             | Simulación de interacciones de usuario          |
| 7.4 | Análisis estático (PHPStan nivel 8)       | Sin errores en `phpstan analyse`                |
| 7.5 | CS-Fixer / Laravel Pint                   | Código formateado estrictamente                  |
| 7.6 | Auditoría de seguridad (Laravel Security) | Revisión de paquetes con `composer audit`       |
| 7.7 | Optimización de queries (N+1)             | Eager loading, índices añadidos                 |
| 7.8 | Cache: Redis para sesiones, colas, datos   | Hit rate > 80% en consultas frecuentes          |
| 7.9 | Configuración completa de observabilidad   | Loki + Prometheus + Grafana + Alertmanager       |

---

### Fase 8 — Producción (Semana 20–22)

**Objetivo:** Despliegue a producción y cierre del proyecto.

| #   | Tarea                                      | Entregable                                      |
|-----|--------------------------------------------|-------------------------------------------------|
| 8.1 | Pruebas de aceptación UAT                  | Checklist de UAT con stakeholders               |
| 8.2 | Corrección de bugs UAT                     | Issues cerrados en GitHub                        |
| 8.3 | Configuración de servidor de producción    | VPS con Docker + nginx reverse proxy             |
| 8.4 | SSL con Let's Encrypt + renovación auto    | Certificado SSL válido                           |
| 8.5 | Deploy a producción                        | `docker compose -f docker-compose.prod.yml up -d`|
| 8.6 | Smoke test post-deploy                    | Verificación de endpoints críticos               |
| 8.7 | Documentación final                        | README, `.env.example`, docs/ completos          |
| 8.8 | Capacitación a usuarios operadores        | Manual de uso + sesión de capacitación           |

---

## 22.3 Milestones y Entregables

| Hito                        | Fecha estimada | Entregable principal                      |
|-----------------------------|----------------|-------------------------------------------|
| M1: Setup listo             | Fin Semana 2   | Docker funcionando, CI/CD verde           |
| M2: Auth completo           | Fin Semana 4   | Login, registro, roles, permisos          |
| M3: Trámites funcionales    | Fin Semana 7   | CRUD + estados + timeline                 |
| M4: Contenido publicado     | Fin Semana 9   | FAQ, Noticias, búsqueda                   |
| M5: Chatbot IA operativo    | Fin Semana 13  | FAQ + RAG + OCR pipeline                  |
| M6: Admin completo          | Fin Semana 16  | Filament con KPIs y reportes              |
| M7: Hardening terminado     | Fin Semana 19  | Tests, seguridad, observabilidad          |
| M8: Producción              | Fin Semana 22  | Plataforma en producción, UAT aprobado    |

---

## 22.4 Diagrama Gantt (Texto)

```
Semana:    1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22
Fase 1:   ██████████
Fase 2:              ██████████
Fase 3:                         ██████████████████████
Fase 4:                                                ██████████████
Fase 5:                                                               ██████████████████████████████
Fase 6:                                                                                         ██████████████████████
Fase 7:                                                                                                                    ██████████████████████
Fase 8:                                                                                                                                            ██████████████████████

Dependencias:
  Fase 2 depende de Fase 1
  Fase 3 depende de Fase 2
  Fase 4 empieza al finalizar Fase 3
  Fase 5 arranca en paralelo con final de Fase 4 (comparten 2 semanas)
  Fase 6 depende de Fase 3 y Fase 4
  Fase 7 depende de Fase 3, 4, 5, 6 completas
  Fase 8 depende de Fase 7
```

---

## 22.5 Recursos

| Rol                  | Cantidad | Semanas activas       |
|----------------------|----------|------------------------|
| Desarrollador Full-Stack | 1    | Semana 1 a 22          |
| QA Tester            | 1        | Semana 17 a 22         |
| Stakeholders UAT     | 2        | Semana 20 a 22         |

---

## 22.6 Gestión de Riesgos del Cronograma

| Riesgo                                    | Impacto | Probabilidad | Plan de contingencia                              |
|-------------------------------------------|---------|--------------|---------------------------------------------------|
| Retraso en fase 5 (RAG/IA) por complejidad| Alto    | Media        | Reducir alcance RAG inicial, priorizar FAQ keyword |
| Bugs mayores encontrados en UAT           | Medio   | Media        | Buffer de 2 semanas en fase 8                     |
| Enfermedad o ausencia del desarrollador   | Alto    | Baja         | Documentación continua, código auto-documentado    |
| Cambio de requisitos del cliente          | Alto    | Media        | Gestión de cambios formal, re-priorización         |

---

## 22.7 Referencias

- [Laravel 11.x Documentation](https://laravel.com/docs/11.x)
- [Livewire 3.x Documentation](https://livewire.laravel.com)
- [Filament 3.x Documentation](https://filamentphp.com/docs)
