# 26. Tablero Kanban y Diagrama Gantt — EsSalud (Laravel)

> **Versión:** 1.0 — Laravel 11 + Livewire 3 + Blade + MySQL 8  
> **Última actualización:** 2026-06-21  

---

## 26.1 Metodología

El proyecto se gestiona con metodología ágil Scrum. Los sprints tienen una duración de **2 semanas** cada uno. Se utiliza un tablero Kanban para el seguimiento diario y un diagrama Gantt para la planificación de alto nivel con dependencias entre tareas.

---

## 26.2 Definición de Sprints

| Sprint | Nombre                         | Semanas   | Fase asociada      |
|--------|--------------------------------|-----------|--------------------|
| S01    | Setup + CI/CD                  | 1–2       | Fase 1             |
| S02    | Auth Completo                  | 3–4       | Fase 2             |
| S03    | Trámites CRUD                 | 5–6       | Fase 3 (parcial)   |
| S04    | Trámites Avanzado + Docs      | 7–8       | Fase 3 + 4         |
| S05    | Noticias + FAQ                | 9–10      | Fase 4 (parcial)   |
| S06    | Chatbot FAQ + RAG Setup        | 11–12     | Fase 5 (parcial)   |
| S07    | RAG Pipeline + OCR             | 13–14     | Fase 5 (parcial)   |
| S08    | Dashboard Admin               | 15–16     | Fase 6             |
| S09    | Hardening + Tests             | 17–18     | Fase 7 (parcial)   |
| S10    | Seguridad + Deploy Staging     | 19–20     | Fase 7 + 8         |
| S11    | UAT + Deploy Producción        | 21–22     | Fase 8 (parcial)   |

---

## 26.3 Tablero Kanban por Sprint

Las tarjetas se mueven entre las siguientes columnas:

```
┌──────────┬──────────┬──────────────┬──────────┬──────────┐
│  BACKLOG │  TO DO   │  IN PROGRESS │  REVIEW  │   DONE   │
└──────────┴──────────┴──────────────┴──────────┴──────────┘
```

---

### Sprint 1 — Setup + CI/CD (Semana 1–2)

| ID    | Tarea                                      | Estimación | Columna       |
|-------|--------------------------------------------|------------|---------------|
| S1-01 | Crear proyecto Laravel 11                 | 2h         | DONE          |
| S1-02 | Configurar Docker (app, MySQL, Redis)     | 4h         | DONE          |
| S1-03 | Inicializar repositorio Git + .gitignore  | 1h         | DONE          |
| S1-04 | Configurar GitHub Actions (lint + test)   | 4h         | DONE          |
| S1-05 | Instalar y configurar Livewire 3         | 2h         | DONE          |
| S1-06 | Configurar Vite + Tailwind CSS            | 3h         | DONE          |
| S1-07 | Migraciones base (users, sessions)        | 2h         | DONE          |
| S1-08 | Layout base responsive (app.blade.php)    | 4h         | DONE          |
| S1-09 | Sprint Review + Retrospective             | 2h         | DONE          |

**Total estimado:** 24 horas

---

### Sprint 2 — Auth Completo (Semana 3–4)

| ID    | Tarea                                      | Estimación | Columna       |
|-------|--------------------------------------------|------------|---------------|
| S2-01 | Login component Livewire                   | 6h         | TO DO         |
| S2-02 | Register component Livewire                | 6h         | TO DO         |
| S2-03 | Email verification flow                    | 4h         | TO DO         |
| S2-04 | Password reset flow                        | 4h         | TO DO         |
| S2-05 | Instalar Spatie Permission + seeder roles  | 3h         | TO DO         |
| S2-06 | Perfil de usuario (edit, change password)  | 5h         | TO DO         |
| S2-07 | Rate limiting login (5/min, block 30m)     | 3h         | TO DO         |
| S2-08 | Middleware role + Policies base            | 4h         | TO DO         |
| S2-09 | Sprint Review + Retrospective             | 2h         | TO DO         |

**Total estimado:** 37 horas

---

### Sprint 3 — Trámites CRUD (Semana 5–6)

| ID    | Tarea                                      | Estimación | Columna       |
|-------|--------------------------------------------|------------|---------------|
| S3-01 | Migración procedures + procedure_statuses  | 3h         | BACKLOG       |
| S3-02 | Model Procedure + relaciones Eloquent      | 4h         | BACKLOG       |
| S3-03 | Enum de estados + máquina de estados      | 6h         | BACKLOG       |
| S3-04 | Componente Livewire ProcedureList          | 6h         | BACKLOG       |
| S3-05 | Componente Livewire ProcedureForm          | 8h         | BACKLOG       |
| S3-06 | Componente Livewire ProcedureTimeline      | 6h         | BACKLOG       |
| S3-07 | Validaciones Form Request                  | 4h         | BACKLOG       |
| S3-08 | Policies Procedure + Document              | 3h         | BACKLOG       |
| S3-09 | Notificaciones cambio de estado            | 5h         | BACKLOG       |
| S3-10 | Sprint Review + Retrospective             | 2h         | BACKLOG       |

**Total estimado:** 47 horas

---

### Sprint 4 — Trámites Avanzado + Documentos (Semana 7–8)

| ID    | Tarea                                      | Estimación | Columna       |
|-------|--------------------------------------------|------------|---------------|
| S4-01 | Motor de subsanaciones (máx 3, 15 días)   | 8h         | BACKLOG       |
| S4-02 | Asignación operadores (panel supervisor)  | 6h         | BACKLOG       |
| S4-03 | Subida de documentos (Livewire upload)     | 8h         | BACKLOG       |
| S4-04 | Validación MIME real + storage fuera public| 4h         | BACKLOG       |
| S4-05 | Vista previa documentos inline             | 4h         | BACKLOG       |
| S4-06 | Auto-cancelación trámites borrador >30d    | 3h         | BACKLOG       |
| S4-07 | Command procedures:cancel-stale-drafts     | 2h         | BACKLOG       |
| S4-08 | Bandeja de trámites por operador           | 5h         | BACKLOG       |
| S4-09 | Sprint Review + Retrospective             | 2h         | BACKLOG       |

**Total estimado:** 42 horas

---

### Sprint 5 — Noticias + FAQ (Semana 9–10)

| ID    | Tarea                                      | Estimación | Columna       |
|-------|--------------------------------------------|------------|---------------|
| S5-01 | Migraciones Faq + News + categorías       | 2h         | BACKLOG       |
| S5-02 | CRUD Faq (Filament resource)               | 6h         | BACKLOG       |
| S5-03 | CRUD News (Filament resource)              | 6h         | BACKLOG       |
| S5-04 | Portal público FAQ (Livewire listado)      | 6h         | BACKLOG       |
| S5-05 | Portal público News (Livewire listado)     | 5h         | BACKLOG       |
| S5-06 | Búsqueda Full-Text MySQL FAQ + News        | 6h         | BACKLOG       |
| S5-07 | Gestión de categorías FAQ y News           | 3h         | BACKLOG       |
| S5-08 | Imágenes destacadas + thumbnails           | 4h         | BACKLOG       |
| S5-09 | Sprint Review + Retrospective             | 2h         | BACKLOG       |

**Total estimado:** 40 horas

---

### Sprint 6 — Chatbot FAQ + RAG Setup (Semana 11–12)

| ID    | Tarea                                      | Estimación | Columna       |
|-------|--------------------------------------------|------------|---------------|
| S6-01 | Instalar/configurar Qdrant (Docker)       | 3h         | BACKLOG       |
| S6-02 | FAQ Keyword matching service              | 6h         | BACKLOG       |
| S6-03 | Componente Livewire Chatbot UI            | 8h         | BACKLOG       |
| S6-04 | ChatOrchestrator (FAQ → no_result)        | 4h         | BACKLOG       |
| S6-05 | Feedback útil/no útil en respuestas       | 3h         | BACKLOG       |
| S6-06 | Instalar OpenAI PHP client               | 1h         | BACKLOG       |
| S6-07 | EmbeddingService (text-embedding-3-small) | 5h         | BACKLOG       |
| S6-08 | Comando documents:index (indexar en Qdrant)| 6h         | BACKLOG       |
| S6-09 | Colección Qdrant essalud_kb             | 2h         | BACKLOG       |
| S6-10 | Sprint Review + Retrospective             | 2h         | BACKLOG       |

**Total estimado:** 40 horas

---

### Sprint 7 — RAG Pipeline + OCR (Semana 13–14)

| ID    | Tarea                                      | Estimación | Columna       |
|-------|--------------------------------------------|------------|---------------|
| S7-01 | RagService (Qdrant query + OpenAI GPT-4o) | 8h         | BACKLOG       |
| S7-02 | Integrar RAG al ChatOrchestrator          | 4h         | BACKLOG       |
| S7-03 | Fallback chain: RAG → FAQ → no_result     | 4h         | BACKLOG       |
| S7-04 | Prompt system RAG (contexto + referencias)| 4h         | BACKLOG       |
| S7-05 | Escalación de chat a operador (ticket)    | 5h         | BACKLOG       |
| S7-06 | Instalar/Configurar Tesseract OCR         | 3h         | BACKLOG       |
| S7-07 | OcrService + job en cola ocr              | 6h         | BACKLOG       |
| S7-08 | Pre-procesamiento de imágenes             | 4h         | BACKLOG       |
| S7-09 | Integración OCR → formulario trámite      | 4h         | BACKLOG       |
| S7-10 | Validación humana GESDOC                  | 4h         | BACKLOG       |
| S7-11 | Sprint Review + Retrospective             | 2h         | BACKLOG       |

**Total estimado:** 48 horas

---

### Sprint 8 — Dashboard Admin (Semana 15–16)

| ID    | Tarea                                      | Estimación | Columna       |
|-------|--------------------------------------------|------------|---------------|
| S8-01 | Instalar Filament 3 + config base         | 3h         | BACKLOG       |
| S8-02 | Filament UserResource (CRUD + roles)       | 6h         | BACKLOG       |
| S8-03 | Filament ProcedureResource (CRUD + filtros)| 8h         | BACKLOG       |
| S8-04 | Filament FaqResource + NewsResource        | 5h         | BACKLOG       |
| S8-05 | Filament AuditResource (solo SADM)         | 4h         | BACKLOG       |
| S8-06 | Dashboard widgets (KPIs, gráficos)         | 8h         | BACKLOG       |
| S8-07 | Exportación reportes PDF + Excel           | 6h         | BACKLOG       |
| S8-08 | Gestión de usuarios y roles (SADM)         | 5h         | BACKLOG       |
| S8-09 | Sprint Review + Retrospective             | 2h         | BACKLOG       |

**Total estimado:** 47 horas

---

### Sprint 9 — Hardening + Tests (Semana 17–18)

| ID    | Tarea                                      | Estimación | Columna       |
|-------|--------------------------------------------|------------|---------------|
| S9-01 | Tests unitarios servicios principales      | 10h        | BACKLOG       |
| S9-02 | Tests feature flujo trámites               | 10h        | BACKLOG       |
| S9-03 | Tests integración Livewire componentes     | 8h         | BACKLOG       |
| S9-04 | PHPStan level 8 (corregir errores)         | 6h         | BACKLOG       |
| S9-05 | Laravel Pint (formatear todo)              | 2h         | BACKLOG       |
| S9-06 | Optimización queries N+1 (eager loading)   | 5h         | BACKLOG       |
| S9-07 | Cache Redis queries frecuentes             | 4h         | BACKLOG       |
| S9-08 | Composer audit + actualizar dependencias   | 3h         | BACKLOG       |
| S9-09 | Sprint Review + Retrospective             | 2h         | BACKLOG       |

**Total estimado:** 50 horas

---

### Sprint 10 — Seguridad + Deploy Staging (Semana 19–20)

| ID    | Tarea                                      | Estimación | Columna       |
|-------|--------------------------------------------|------------|---------------|
| S10-01 | Auditoría seguridad completa (OWASP ZAP)   | 6h         | BACKLOG       |
| S10-02 | Configurar headers seguridad nginx        | 4h         | BACKLOG       |
| S10-03 | CSP middleware + prueba                    | 4h         | BACKLOG       |
| S10-04 | Configurar backup automático (spatie)      | 4h         | BACKLOG       |
| S10-05 | Prueba restore backup en staging           | 3h         | BACKLOG       |
| S10-06 | Configurar observabilidad (Loki+Prom+Grafana)| 6h        | BACKLOG       |
| S10-07 | Configurar alertas Alertmanager            | 3h         | BACKLOG       |
| S10-08 | Deploy a staging (VPS + nginx + SSL)       | 6h         | BACKLOG       |
| S10-09 | Smoke test staging                        | 3h         | BACKLOG       |
| S10-10 | Sprint Review + Retrospective             | 2h         | BACKLOG       |

**Total estimado:** 41 horas

---

### Sprint 11 — UAT + Deploy Producción (Semana 21–22)

| ID    | Tarea                                      | Estimación | Columna       |
|-------|--------------------------------------------|------------|---------------|
| S11-01 | Preparar checklist UAT                     | 3h         | BACKLOG       |
| S11-02 | Sesión UAT con stakeholders                | 8h         | BACKLOG       |
| S11-03 | Corrección bugs UAT                        | 12h        | BACKLOG       |
| S11-04 | Configurar servidor producción             | 4h         | BACKLOG       |
| S11-05 | SSL Let's Encrypt + renovación auto       | 2h         | BACKLOG       |
| S11-06 | Deploy a producción                        | 4h         | BACKLOG       |
| S11-07 | Smoke test producción                      | 3h         | BACKLOG       |
| S11-08 | Documentación final (README, .env.example) | 6h         | BACKLOG       |
| S11-09 | Capacitación usuarios operadores           | 6h         | BACKLOG       |
| S11-10 | Sprint Review + Retrospective final       | 3h         | BACKLOG       |

**Total estimado:** 51 horas

---

## 26.4 Diagrama Gantt en Texto ASCII

```
SPRINT:   S01         S02         S03         S04         S05         S06         S07         S08         S09         S10         S11
Semana:   1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22
          ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤
Setup     ██████████
Auth               ██████████
Trámites CRUD               ██████████
Trámites Adv+Doc                     ██████████
News+FAQ                                       ██████████
Chatbot+RAG Setup                                      ██████████
RAG Pipeline+OCR                                                 ██████████
Dashboard Admin                                                              ██████████
Hardening+Tests                                                                          ██████████
Seg+S.Deploy                                                                                      ██████████
UAT+Prod                                                                                                    ██████████
          ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤
Milestone:   M1          M2          M3          M4          M5          M6          M7          M8
             ▲           ▲           ▲           ▲           ▲           ▲           ▲           ▲
```

**Dependencias entre sprints ( → = "depende de"):**
```
S01 (Setup)
 └→ S02 (Auth)
     └→ S03 (Trámites CRUD)
         ├→ S04 (Trámites Avanzados + Docs)
         │   └→ S05 (News + FAQ)
         │       ├→ S06 (Chatbot FAQ + RAG Setup)
         │       │   └→ S07 (RAG Pipeline + OCR)
         │       └───→ S08 (Dashboard Admin) (también depende de S03, S04)
         ├───────────→ S08 (Dashboard Admin)
         └───────────────→ S09 (Hardening) (depende de S03-S08)
                             └→ S10 (Seguridad + Deploy Staging)
                                 └→ S11 (UAT + Deploy Prod)
```

---

## 26.5 Burndown Chart

El burndown chart es un gráfico que muestra el trabajo restante (en horas o story points) versus el tiempo del sprint. Se actualiza diariamente.

### Ejemplo para Sprint 3 (Trámites CRUD, 47 horas, 10 días hábiles)

```
Horas
 50 ┤ ●
    │   ＼
 45 ┤     ＼
    │       ＼
 40 ┤         ＼
    │           ＼
 35 ┤             ＼
    │               ＼
 30 ┤                 ＼
    │                   ＼
 25 ┤                     ＼
    │                       ＼
 20 ┤                         ＼
    │                           ＼
 15 ┤                             ＼
    │                               ＼
 10 ┤                                 ＼
    │                                   ＼
  5 ┤                                     ●
    │                                       ＼
  0 ┤─────────────────────────────────────────●━━━
    D1  D2  D3  D4  D5  D6  D7  D8  D9  D10  (días)

    ─── Línea ideal (47h / 10d = 4.7h/día)
    ●●● Progreso real
```

**Interpretación:**
- Si la línea real está por encima de la ideal: el equipo está atrasado; se deben tomar acciones correctivas (reducir scope, priorizar).
- Si la línea real está por debajo de la ideal: el equipo está adelantado; puede tomar tareas del backlog.
- Al final del sprint, las horas restantes deben ser 0 (o cercanas) para cumplir el compromiso.

---

## 26.6 Asignación de Tareas por Rol

| Rol                  | Responsabilidades                                           | Sprints activos   |
|----------------------|-------------------------------------------------------------|--------------------|
| Desarrollador Full-Stack | Desarrollo de todas las funcionalidades, tests, deploy   | S01 a S11          |
| QA Tester            | Ejecución de tests manuales, UAT, reporte de bugs          | S09 a S11          |
| Stakeholders         | Aprobación de UAT, feedback de producto                     | S11 (semana 21–22) |

**Nota:** El desarrollador principal es responsable del 100% del código en S01–S08. A partir de S09, QA se incorpora para testing y validación. Los stakeholders participan en las revisiones de sprint (demo) y en la UAT final.

---

## 26.7 Rituales Ágiles

| Ritual              | Frecuencia       | Duración | Participantes         | Descripción                                  |
|---------------------|------------------|----------|------------------------|----------------------------------------------|
| **Daily Standup**   | Diaria           | 15 min   | Desarrollador          | ¿Qué hice ayer? ¿Qué haré hoy? ¿Bloqueantes? |
| **Sprint Planning** | Inicio de sprint | 2 h      | Desarrollador          | Seleccionar backlog, estimar, comprometer    |
| **Sprint Review**   | Fin de sprint    | 1 h      | Dev + Stakeholders     | Demo de lo construido, feedback              |
| **Sprint Retro**    | Fin de sprint    | 1 h      | Desarrollador          | ¿Qué fue bien? ¿Qué mejorar? Acciones        |
| **Backlog Grooming**| Mitad de sprint  | 1 h      | Desarrollador          | Refinar, estimar, priorizar backlog futuro   |

---

## 26.8 Herramientas de Gestión Recomendadas

| Herramienta              | Uso                                              |
|--------------------------|--------------------------------------------------|
| **GitHub Projects**      | Tablero Kanban digital con automatizaciones      |
| **GitHub Issues**        | Registro de tareas, bugs, mejoras                |
| **GitHub Milestones**    | Agrupación de issues por sprint                  |
| **GitHub Actions**       | CI/CD automatizada por cada push/PR              |
| **Conventional Commits** | Commits etiquetados: `feat:`, `fix:`, `docs:`, `test:` |

---

## 26.9 Seguimiento y Métricas de Progreso

Al final de cada sprint se registran las siguientes métricas:

| Métrica                   | Definición                                          | Objetivo          |
|---------------------------|-----------------------------------------------------|-------------------|
| **Velocity**              | Horas completadas en el sprint                      | Creciente (ramp-up) luego estable |
| **Sprint Burndown**       | % de trabajo completado vs planificado              | ≥ 90% al cierre   |
| **Bugs encontrados**      | Bugs reportados en el sprint (QA o auto-detectados) | ≤ 3 por sprint    |
| **Cobertura de tests**    | % de líneas cubiertas por tests (desde S09)         | ≥ 80%             |
| **Deuda técnica**         | Issues etiquetados `tech-debt` abiertos             | ≤ 10 acumulados   |

---

## 26.10 Plan de Contingencia por Retraso

Si al final de un sprint la velocidad es menor a la esperada (>20% de desviación):

1. **Sprint siguiente:** reducir scope, mover tareas no esenciales a sprints posteriores.
2. **Re-priorización:** las funcionalidades "Media" y "Baja" se postergan; se mantienen solo las "Alta".
3. **Horas extra:** solo en caso de riesgo crítico para un milestone mayor (M5: Chatbot, M8: Producción).
4. **Comunicación:** notificar a stakeholders con al menos 1 sprint de anticipación si M8 (producción) se retrasa.

---

## 26.11 Referencias

- [Scrum Guide (Schwaber & Sutherland)](https://scrumguides.org/)
- [GitHub Projects for Agile](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
