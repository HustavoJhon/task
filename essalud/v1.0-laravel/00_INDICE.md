# 📋 ÍNDICE MAESTRO - Plataforma Inteligente EsSalud v1.0 Laravel

## 📊 Resumen del Proyecto

| Aspecto | Detalle |
|--------|---------|
| **Proyecto** | Plataforma Inteligente de Atención al Asegurado EsSalud |
| **Versión** | 1.0 Laravel |
| **Estado** | Documentación Técnica Completa |
| **Fecha de Inicio** | Julio 2026 |
| **Fecha de Conclusión Prevista** | Diciembre 2026 |
| **Equipo Principal** | Full-Stack Laravel, QA, DevOps |
| **Presupuesto Estimado** | USD $280,000 - $380,000 |
| **Alcance Geográfico** | EsSalud Perú (Nacional) |

---

## 📑 Documentación Completa — 27 Archivos

### **SECCIÓN I: PLANIFICACIÓN Y ESTRATEGIA**

| # | Archivo | Descripción |
|---|---------|-------------|
| **00** | [[00_INDICE.md]] | Índice maestro con navegación centralizada de toda la documentación |
| **01** | [[01_PLAN_DETALLADO.md]] | Plan estratégico con roadmap de 22 semanas, objetivos SMART y KPIs para Laravel |
| **23** | [[23_MATRIZ_RIESGOS.md]] | Matriz de riesgos con estrategias de mitigación adaptadas a monolito |
| **22** | [[22_ROADMAP.md]] | Roadmap detallado con diagrama Gantt y hitos del proyecto |

### **SECCIÓN II: REQUISITOS Y ESPECIFICACIONES**

| # | Archivo | Descripción |
|---|---------|-------------|
| **02** | [[02_SPEC_DETALLADO.md]] | Especificación funcional: 50+ funcionalidades, RBAC, reglas de negocio |
| **24** | [[24_REQUISITOS_FUNCIONALES.md]] | Catálogo de 60+ requisitos funcionales por módulo |
| **25** | [[25_REQUISITOS_NO_FUNCIONALES.md]] | RNF: rendimiento, disponibilidad, escalabilidad, seguridad |
| **08** | [[08_HISTORIAS_USUARIO.md]] | 40+ historias de usuario con criterios de aceptación |

### **SECCIÓN III: DISEÑO Y ARQUITECTURA**

| # | Archivo | Descripción |
|---|---------|-------------|
| **03** | [[03_DESIGN_DETALLADO.md]] | UI/UX Blade + Livewire: Tailwind, componentes, pantallas, wireframes ASCII |
| **04** | [[04_ARQUITECTURA.md]] | Arquitectura monolito modular Laravel 11 con modelo C4 completo |
| **06** | [[06_MODELO_ER.md]] | Modelo entidad-relación con 30+ tablas y diagramas |
| **09** | [[09_CASOS_USO_UML.md]] | 15 casos de uso detallados con flujos principales y alternativos |
| **10** | [[10_DIAGRAMAS_SECUENCIA.md]] | 8 diagramas de secuencia UML para flujos críticos con Livewire |

### **SECCIÓN IV: MÓDULOS Y APIs**

| # | Archivo | Descripción |
|---|---------|-------------|
| **05** | [[05_MODULOS_LARAVEL.md]] | Módulos Laravel: estructura, providers, rutas, dependencias internas |
| **18** | [[18_API_REST.md]] | API REST con Laravel Sanctum: 25+ endpoints documentados |

### **SECCIÓN V: GESTIÓN DE DATOS E IA**

| # | Archivo | Descripción |
|---|---------|-------------|
| **07** | [[07_ROLES_PERMISOS.md]] | RBAC con Spatie Permissions: matriz de permisos, estructura de roles |
| **11** | [[11_RAG_QDRANT.md]] | Sistema RAG: embedding, recuperación, prompt engineering |
| **12** | [[12_INGESTION_PDFS.md]] | Pipeline de ingestión de documentos con Laravel Jobs |
| **13** | [[13_VALIDACION_DOCUMENTOS.md]] | Reglas de validación, estados de documento, subsanaciones |

### **SECCIÓN VI: FRONTEND Y EXPERIENCIA**

| # | Archivo | Descripción |
|---|---------|-------------|
| **15** | [[15_BLADE_UIUX.md]] | Design tokens, paleta EsSalud, componentes Blade+Livewire |
| **16** | [[16_LIVEWIRE_ESTRUCTURA.md]] | Estructura de componentes Livewire con arquitectura limpia |

### **SECCIÓN VII: INFRAESTRUCTURA Y OPERACIONES**

| # | Archivo | Descripción |
|---|---------|-------------|
| **14** | [[14_DASHBOARD_ADMIN.md]] | Dashboard administrativo con Filament: KPIs, alertas, exportación |
| **17** | [[17_DOCKER_COMPOSE.md]] | Docker Compose para dev, staging y producción (Laravel Sail) |
| **19** | [[19_CICD.md]] | Pipeline CI/CD con GitHub Actions, PHPStan, Pest, Laravel Pint |
| **20** | [[20_OBSERVABILIDAD.md]] | Stack Prometheus+Grafana+Loki, Laravel Telescope, Horizon |

### **SECCIÓN VIII: SEGURIDAD Y CALIDAD**

| # | Archivo | Descripción |
|---|---------|-------------|
| **21** | [[21_SEGURIDAD_AUDITORIA.md]] | Seguridad integral: OWASP, Sanctum, CSRF, Spatie, rate limiting, auditoría |

### **SECCIÓN IX: GESTIÓN DEL PROYECTO**

| # | Archivo | Descripción |
|---|---------|-------------|
| **26** | [[26_KANBAN_GANTT.md]] | Kanban central + Gantt interactivo para gestión de tareas |

---

## 🗂️ Cómo Usar Esta Documentación

### **Para Arquitectos y Leads Técnicos**
1. Comienza con [[01_PLAN_DETALLADO.md]] para contexto estratégico
2. Revisa [[04_ARQUITECTURA.md]] para el diseño del monolito modular
3. Consulta [[03_DESIGN_DETALLADO.md]] para UI/UX con Blade + Livewire

### **Para Desarrolladores Backend (Laravel)**
1. Lee [[02_SPEC_DETALLADO.md]] para requisitos funcionales
2. Estudia [[05_MODULOS_LARAVEL.md]] y [[18_API_REST.md]]
3. Implementa según [[09_CASOS_USO_UML.md]] y [[10_DIAGRAMAS_SECUENCIA.md]]
4. Consulta [[07_ROLES_PERMISOS.md]] para autorización con Spatie

### **Para Desarrolladores Frontend (Blade + Livewire)**
1. Revisa [[15_BLADE_UIUX.md]] para diseño y componentes
2. Estudia [[16_LIVEWIRE_ESTRUCTURA.md]] para arquitectura de componentes
3. Consulta [[03_DESIGN_DETALLADO.md]] para wireframes y flujos de pantalla

### **Para DevOps e Infraestructura**
1. Implementa según [[17_DOCKER_COMPOSE.md]]
2. Configura CI/CD con [[19_CICD.md]]
3. Monitorea usando [[20_OBSERVABILIDAD.md]]

### **Para QA y Testing**
1. Revisa [[08_HISTORIAS_USUARIO.md]] para casos de prueba
2. Estudia [[09_CASOS_USO_UML.md]] y [[10_DIAGRAMAS_SECUENCIA.md]]
3. Implementa según [[19_CICD.md]] (quality gates con Pest + PHPStan)

### **Para Gestión del Proyecto**
1. Sigue el roadmap en [[22_ROADMAP.md]]
2. Monitorea riesgos en [[23_MATRIZ_RIESGOS.md]]
3. Actualiza tareas en [[26_KANBAN_GANTT.md]]

---

## 🎯 Objetivos Estratégicos

- ✅ Digitalizar 100% de trámites de EsSalud en plataforma web
- ✅ Reducir tiempo de respuesta en consultas (60% mejora con IA + RAG)
- ✅ Alcanzar 99.5% de disponibilidad del sistema
- ✅ Atender +500K usuarios registrados
- ✅ Cumplir estándares de seguridad OWASP Top 10
- ✅ Móvil-responsive con Blade + Tailwind CSS
- ✅ Dashboard administrativo con Filament

---

## 🔄 Interdependencias de Documentos

```
01_PLAN (Estrategia)
    ├── 23_MATRIZ_RIESGOS (Riesgos del plan)
    ├── 22_ROADMAP (Implementación del plan)
    └── 26_KANBAN_GANTT (Ejecución)

02_SPEC (Requisitos)
    ├── 24_REQUISITOS_FUNCIONALES (Detalle)
    ├── 25_REQUISITOS_NO_FUNCIONALES (Restricciones)
    ├── 08_HISTORIAS_USUARIO (Validación)
    └── 07_ROLES_PERMISOS (Acceso)

03_DESIGN (UI/UX)
    ├── 15_BLADE_UIUX (Componentes visuales)
    └── 16_LIVEWIRE_ESTRUCTURA (Arquitectura frontend)

04_ARQUITECTURA (Arquitectura)
    ├── 05_MODULOS_LARAVEL (Módulos del monolito)
    ├── 06_MODELO_ER (Datos)
    ├── 09_CASOS_USO_UML (Comportamiento)
    └── 10_DIAGRAMAS_SECUENCIA (Interacciones)

11_RAG_QDRANT (IA)
    ├── 12_INGESTION_PDFS (Datos para RAG con Laravel Jobs)
    ├── 13_VALIDACION_DOCUMENTOS (Calidad)
    └── 18_API_REST (API de ingestión)

15_BLADE_UIUX (Frontend)
    ├── 16_LIVEWIRE_ESTRUCTURA (Implementación)
    └── 18_API_REST (API de consumo)

17_DOCKER_COMPOSE (Infraestructura)
    ├── 19_CICD (Deployment)
    └── 20_OBSERVABILIDAD (Monitoreo con Horizon y Telescope)

21_SEGURIDAD_AUDITORIA (Seguridad)
    ├── 07_ROLES_PERMISOS (Control de acceso)
    ├── 17_DOCKER_COMPOSE (Network security)
    └── 20_OBSERVABILIDAD (Audit logs)

14_DASHBOARD_ADMIN (Operaciones)
    ├── 20_OBSERVABILIDAD (Datos para dashboard)
    └── 06_MODELO_ER (Tablas de métricas)
```

---

## 📞 Puntos de Contacto

- **Laravel Tech Lead:** Responsable de 04_ARQUITECTURA, 05_MODULOS_LARAVEL, 03_DESIGN_DETALLADO
- **Product Manager:** Responsable de 02_SPEC_DETALLADO, 08_HISTORIAS_USUARIO, 24_REQUISITOS_FUNCIONALES
- **DevOps Lead:** Responsable de 17_DOCKER_COMPOSE, 19_CICD, 20_OBSERVABILIDAD
- **Security Officer:** Responsable de 21_SEGURIDAD_AUDITORIA, 07_ROLES_PERMISOS
- **Frontend Dev (Livewire):** Responsable de 15_BLADE_UIUX, 16_LIVEWIRE_ESTRUCTURA
- **IA Engineer:** Responsable de 11_RAG_QDRANT, 12_INGESTION_PDFS

---

## 📅 Versiones de Documentación

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | Jun 21, 2026 | Documentación inicial Laravel v1.0 completa |

---

## ✅ Checklist de Revisión Pre-Desarrollo

- [ ] Todos los documentos revisados y aprobados
- [ ] Arquitectura monolito modular validada por equipo técnico
- [ ] Requisitos priorizados por product
- [ ] Riesgos identificados y mitigados
- [ ] Infraestructura planificada (Docker + Laravel Sail)
- [ ] CI/CD pipeline diseñado
- [ ] Seguridad auditada (OWASP + Sanctum)
- [ ] Equipo capacitado en Laravel 11 + Livewire 3 + Filament
- [ ] Ambientes configurados (dev, staging, prod)
- [ ] Métricas de éxito definidas

---

## 🔗 Enlaces Rápidos

- **Roadmap Interactivo:** [[22_ROADMAP.md#Gantt]]
- **Gestión de Proyecto:** [[26_KANBAN_GANTT.md]]
- **Matriz de Riesgos:** [[23_MATRIZ_RIESGOS.md]]
- **Especificación API:** [[18_API_REST.md]]
- **Infraestructura:** [[17_DOCKER_COMPOSE.md]]
- **Seguridad:** [[21_SEGURIDAD_AUDITORIA.md]]

---

#indice #essalud #v1.0 #documentacion #laravel #livewire #monolito
