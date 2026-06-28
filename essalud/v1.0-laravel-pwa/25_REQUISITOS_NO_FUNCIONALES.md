# 25. Requisitos No Funcionales — EsSalud (Laravel)

> **Versión:** 1.0 — Laravel 11 + Livewire 3 + Blade + MySQL 8  
> **Última actualización:** 2026-06-21  

---

## 25.1 Convenciones

Cada requisito no funcional (RNF) se estructura de la siguiente manera:

- **ID:** identificador único (RNF-XX)
- **Categoría:** rendimiento, disponibilidad, escalabilidad, seguridad, usabilidad, mantenibilidad, compatibilidad, respaldo, monitoreo, legal
- **Descripción:** especificación medible del requisito
- **Métrica:** cómo se medirá su cumplimiento
- **Validación:** cómo se verificará en la fase de hardening / UAT

---

## 25.2 Listado de Requisitos No Funcionales

---

### RNF-01 — Rendimiento

| Campo           | Valor                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------|
| **ID**          | RNF-01                                                                                        |
| **Categoría**   | Rendimiento                                                                                   |
| **Descripción** | La plataforma debe responder dentro de los tiempos máximos establecidos para cada operación crítica. |
| **Métrica**     | Login: < 2 segundos. Listado de trámites (paginated, 15 ítems): < 1 segundo. Respuesta del chatbot (FAQ o RAG): < 5 segundos. Procesamiento OCR por página: < 30 segundos. Carga de página inicial: < 3 segundos (LCP). |
| **Validación**  | Pruebas de carga con **k6** o **Apache JMeter**: 100 usuarios concurrentes simulando flujos reales (login, listar trámites, subir documento, usar chatbot). Percentil p95 debe cumplir los tiempos. Perfilado con Laravel Telescope y Blackfire en staging. |

**Estrategias de optimización:**
- Cache Redis para consultas frecuentes (categorías FAQ, KPIs cacheados 5 min)
- Eager loading en todas las relaciones de modelos
- Paginación y lazy loading en Livewire
- Compresión Brotli en nginx para assets estáticos
- Vite + code splitting para JS
- Imágenes con lazy loading nativo (`loading="lazy"`)
- Índices MySQL en columnas de filtros y ordenamiento

---

### RNF-02 — Disponibilidad

| Campo           | Valor                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------|
| **ID**          | RNF-02                                                                                        |
| **Categoría**   | Disponibilidad                                                                                |
| **Descripción** | La plataforma debe estar disponible el 99.5% del tiempo mensual, lo que equivale a un máximo de 3.6 horas de downtime por mes (incluyendo mantenimientos programados). |
| **Métrica**     | Uptime medido por monitor externo (UptimeRobot o Prometheus Blackbox Exporter) con chequeos cada 1 minuto. SLA mensual = (minutos up / minutos totales) × 100. |
| **Validación**  | Reporte mensual de uptime generado desde Grafana. Mantenimientos programados en horario de menor tráfico (domingo 02:00–05:00 UTC) con aviso previo de 48h. |

**Estrategias:**
- Deploy con cero downtime: `docker compose up -d` escala nuevos contenedores antes de detener antiguos
- Health checks de Docker en todos los servicios (`healthcheck` en `docker-compose.yml`)
- Rollback rápido: `docker compose -f docker-compose.prod.yml up -d` con imagen anterior
- Base de datos con backups cada 24h y WAL archiving (si PostgreSQL, binlogs si MySQL)

---

### RNF-03 — Escalabilidad

| Campo           | Valor                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------|
| **ID**          | RNF-03                                                                                        |
| **Categoría**   | Escalabilidad                                                                                 |
| **Descripción** | El sistema debe ser capaz de soportar hasta 1,000 usuarios concurrentes y procesar 10,000 trámites por día sin degradación significativa del rendimiento (>20% de los umbrales de RNF-01). |
| **Métrica**     | Throughput: 10,000 trámites/día ≈ 0.12 trámites/segundo en promedio, con picos de 50/min en horas hábiles. Usuarios concurrentes: 1,000 sesiones activas con heartbeat cada 5 min. |
| **Validación**  | Prueba de estrés con k6 escalando de 100 a 1,000 usuarios en rampa de 10 min. Verificar que p95 de latencia no excede 1.2× el baseline de RNF-01. Queue size no supera 500 jobs pendientes. |

**Estrategias de escalabilidad:**
- Workers de Laravel Horizon escalables horizontalmente (aumentar `maxProcesses` o réplicas)
- Redis como cache y session store (rápido, en memoria)
- MySQL con optimización de índices y query cache. Índices en todas las FK.
- CDN para assets estáticos (Cloudflare, Fastly)
- Escalado vertical del VPS (CPU/RAM) antes que horizontal en fase inicial
- Arquitectura preparada para extraer módulos a microservicios si fuera necesario (app/Modules)

---

### RNF-04 — Seguridad

| Campo           | Valor                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------|
| **ID**          | RNF-04                                                                                        |
| **Categoría**   | Seguridad                                                                                     |
| **Descripción** | La plataforma debe cumplir con estándares de seguridad web (OWASP Top 10) y protección de datos personales según la legislación peruana. |
| **Métrica**     | 0 vulnerabilidades críticas o altas en auditoría OWASP ZAP / Burp Suite. HTTPS score A+ en SSL Labs. Headers de seguridad presentes en 100% de las respuestas. |
| **Validación**  | Penetration test automatizado con OWASP ZAP en CI/CD (GitHub Actions). Auditoría manual en fase 7. Checklist de seguridad del documento `21_SEGURIDAD_AUDITORIA.md`. |

**Controles específicos:**
- **HTTPS forzado:** `URL::forceScheme('https')` en producción, HSTS con `max-age=31536000; includeSubDomains; preload`
- **Datos en reposo:** MySQL con encriptación de disco (LUKS) o `innodb_encrypt_tables`. Backups encriptados con AES-256
- **CSRF:** `VerifyCsrfToken` middleware activo en todas las rutas web
- **XSS:** Blade escapa por defecto. CSP con `'unsafe-inline'` solo para Livewire (requerido)
- **SQLi:** Eloquent + PDO prepared statements. Revisión de queries raw en code review
- **Rate limiting:** login (5/min), API (60/min), registro (3/hora)
- **Secrets:** variables de entorno en `.env`, nunca en VCS. `.env.example` sin valores reales

---

### RNF-05 — Usabilidad

| Campo           | Valor                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------|
| **ID**          | RNF-05                                                                                        |
| **Categoría**   | Usabilidad                                                                                    |
| **Descripción** | La interfaz de usuario debe ser intuitiva para el ciudadano peruano promedio, con diseño responsive mobile-first y cumplimiento de estándares de accesibilidad. |
| **Métrica**     | Tiempo de entrenamiento para asegurados: < 30 minutos para completar un trámite sin asistencia. Accesibilidad: nivel WCAG 2.1 AA en componentes principales. Tasa de error en formularios: < 5% de abandonment. |
| **Validación**  | Pruebas de usabilidad con 5 usuarios representativos (thinking aloud). Auditoría de accesibilidad con axe DevTools o Lighthouse. Heatmaps y grabaciones de sesión (post-lanzamiento). |

**Lineamientos de diseño:**
- **Mobile-first:** Tailwind CSS con breakpoints `sm`, `md`, `lg`. Layouts probados en 320px de ancho mínimo
- **Navegación clara:** breadcrumbs, menú lateral colapsable, botón "Volver" contextual
- **Formularios:** etiquetas claras, placeholders descriptivos, validación en tiempo real (Livewire `wire:model.live`), mensajes de error en español junto al campo
- **Contraste y tipografía:** ratio de contraste ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande. Tamaño mínimo de fuente 16px en inputs (previene zoom en iOS)
- **Estados visuales:** loading skeletons, estados vacíos con call-to-action, mensajes de éxito/error con toast
- **Idioma:** 100% en español. Términos consistentes con el dominio de salud peruano

---

### RNF-06 — Mantenibilidad

| Campo           | Valor                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------|
| **ID**          | RNF-06                                                                                        |
| **Categoría**   | Mantenibilidad                                                                                 |
| **Descripción** | El código fuente debe ser modular, bien documentado, con cobertura de tests ≥ 80% y documentación de API actualizada. |
| **Métrica**     | Cobertura de código con Pest: ≥ 80% (líneas). PHPStan nivel 8: 0 errores. Complejidad ciclomática promedio ≤ 10 por método. Documentación Swagger/OpenAPI de endpoints API. |
| **Validación**  | `php artisan test --coverage` en CI/CD. `vendor/bin/phpstan analyse` en pre-commit hook. Revisión de arquitectura con Deptrac o Laravel Architecture Rules. |

**Estrategias:**
- **Organización modular:** `app/Modules/{Procedures,Documents,Chatbot,Content,Admin}` con estructura interna consistente (Controllers, Models, Services, Requests, Livewire, Tests)
- **PHPDoc en todas las clases y métodos públicos** (tipos, descripciones, excepciones)
- **ADR (Architecture Decision Records)** en `docs/adr/` para decisiones significativas (elección de Qdrant, uso de Livewire, etc.)
- **Laravel Pint** con reglas PSR-12 estrictas, ejecutado en pre-commit y CI
- **Documentación Swagger** de API con `darkaonline/l5-swagger`, anotaciones en controladores API
- **README.md** con instrucciones de setup, estructura del proyecto y guía de contribución
- **Semantic versioning:** tags de git `v1.0.0`, `v1.1.0`, etc.

---

### RNF-07 — Compatibilidad

| Campo           | Valor                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------|
| **ID**          | RNF-07                                                                                        |
| **Categoría**   | Compatibilidad                                                                                |
| **Descripción** | La plataforma debe funcionar correctamente en los navegadores y dispositivos más utilizados en Perú. |
| **Métrica**     | Navegadores desktop: Chrome, Firefox, Edge, Safari (últimas 2 versiones principales). Navegadores mobile: Chrome Android, Safari iOS (últimas 2 versiones). Resoluciones: 320px a 1920px de ancho. |
| **Validación**  | Pruebas manuales en BrowserStack o LambdaTest con matriz de navegadores. Lighthouse Mobile report con score ≥ 80 en Performance y Best Practices. |

**Navegadores soportados:**

| Navegador           | Versión mínima | Plataforma |
|---------------------|----------------|------------|
| Google Chrome       | 120+           | Desktop    |
| Mozilla Firefox     | 120+           | Desktop    |
| Microsoft Edge      | 120+           | Desktop    |
| Apple Safari        | 17+            | Desktop    |
| Chrome Android      | 120+           | Mobile     |
| Safari iOS          | 17+            | Mobile     |

**Características no soportadas:** Internet Explorer 11 (no soportado). JavaScript requerido (no hay fallback server-side rendering para interactividad de Livewire).

---

### RNF-08 — Respaldo y Recuperación

| Campo           | Valor                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------|
| **ID**          | RNF-08                                                                                        |
| **Categoría**   | Respaldo                                                                                      |
| **Descripción** | El sistema debe contar con respaldos automáticos diarios de la base de datos y archivos, con retención de 30 días y capacidad de restauración completa en menos de 4 horas. |
| **Métrica**     | Backup diario sin errores (verificado con monitoreo). RPO (Recovery Point Objective): 24 horas (pérdida máxima de datos). RTO (Recovery Time Objective): < 4 horas. Retención: 30 días para backups diarios, 12 meses para mensuales. |
| **Validación**  | Simulacro de restauración cada 3 meses: restaurar backup en entorno staging, verificar integridad de datos. Monitoreo de backup con alerta si falla 2 días consecutivos. |

**Configuración de backups:**
- **Base de datos:** `mysqldump` diario a las 02:00 UTC con `spatie/laravel-backup`
- **Archivos (documentos):** sincronizados a S3/MinIO con `rclone` o almacenados directamente en S3
- **Destino:** bucket S3-compatible (MinIO en staging, AWS S3 en producción)
- **Verificación de integridad:** checksum SHA-256 en cada archivo de backup
- **Procedimiento de restauración documentado** en `docs/operations/restore.md`

---

### RNF-09 — Monitoreo y Observabilidad

| Campo           | Valor                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------|
| **ID**          | RNF-09                                                                                        |
| **Categoría**   | Monitoreo                                                                                     |
| **Descripción** | El sistema debe contar con monitoreo integral: logs centralizados, métricas de rendimiento y negocio, dashboards en tiempo real y alertas automáticas ante condiciones anómalas. |
| **Métrica**     | Logs ingeridos en < 10 segundos desde su generación. Métricas de Prometheus scrapeadas cada 15 segundos. Dashboards de Grafana con refresh de 30 segundos. Alertas disparadas en < 1 minuto desde la condición. |
| **Validación**  | Verificar en Grafana que todos los dashboards tienen datos en tiempo real. Disparar alerta de prueba (CPU simulada > 80%) y verificar notificación en Slack en < 2 min. |

**Componentes (detallados en `20_OBSERVABILIDAD.md`):**
- **Loki:** logs estructurados en JSON con campos: timestamp, level, service, user_id, request_id, duration_ms, message, context
- **Prometheus:** métricas de aplicación (`laravel_requests_total`) y de negocio (`essalud_procedures_created_total`)
- **Grafana:** 3 dashboards provisionados como código (Operacional, Negocio, Infraestructura)
- **Alertmanager:** 6 reglas de alerta con canales Slack (warning) y Email+Telegram (critical)
- **Laravel Telescope:** debugging en desarrollo (nunca en producción)
- **Laravel Horizon:** monitoreo de colas Redis en `/horizon`

---

### RNF-10 — Cumplimiento Legal

| Campo           | Valor                                                                                         |
|-----------------|-----------------------------------------------------------------------------------------------|
| **ID**          | RNF-10                                                                                        |
| **Categoría**   | Legal                                                                                         |
| **Descripción** | La plataforma debe cumplir con la Ley de Protección de Datos Personales del Perú (Ley N° 29733) y su reglamento, en lo referente al tratamiento de datos personales de los asegurados, incluyendo datos de salud. |
| **Métrica**     | 0 incumplimientos detectados en auditoría de protección de datos. Registro de tratamiento de datos documentado. Consentimiento informado recolectado en el 100% de los registros. |
| **Validación**  | Revisión legal con DPO (Data Protection Officer) de EsSalud. Documento de registro de tratamiento de datos personales (RDBD). Procedimiento de atención de derechos ARCO (Acceso, Rectificación, Cancelación, Oposición). |

**Requisitos específicos:**
1. **Consentimiento informado:** checkbox explícito al registrarse, con enlace a la política de privacidad. El consentimiento queda registrado en BD (timestamp, IP, texto aceptado).
2. **Principio de finalidad:** los datos solo se usan para los fines declarados (gestión de trámites). No se comparten con terceros sin consentimiento explícito.
3. **Principio de proporcionalidad:** solo se recolectan los datos estrictamente necesarios (DNI, nombre, email, teléfono, documentos del trámite).
4. **Datos de salud anonimizados:** en reportes y analíticas, los datos de salud se agregan o anonimizan. Los datos individuales de salud solo son visibles para el operador asignado.
5. **Derechos ARCO:** el usuario puede solicitar acceso, rectificación, cancelación u oposición al tratamiento de sus datos mediante un formulario en el portal. Tiempo de respuesta: ≤ 20 días hábiles.
6. **Seguridad de datos personales:** medidas de seguridad conforme a RNF-04.
7. **Transferencia internacional:** si se usa OpenAI (servidores en EE.UU.), se debe informar al usuario y obtener consentimiento explícito para la transferencia internacional de datos.
8. **Registro de incidentes de seguridad:** bitácora de incidentes que involucren datos personales, con notificación a la autoridad en ≤ 48 horas si hay riesgo significativo.

---

## 25.3 Resumen de RNFs

| ID       | Categoría        | Métrica Clave                                          | Prioridad |
|----------|------------------|--------------------------------------------------------|-----------|
| RNF-01   | Rendimiento      | Login < 2s, chatbot < 5s, OCR < 30s                   | Alta      |
| RNF-02   | Disponibilidad   | 99.5% uptime (≤ 3.6 h downtime/mes)                   | Alta      |
| RNF-03   | Escalabilidad    | 1,000 usuarios concurrentes, 10,000 trámites/día      | Media     |
| RNF-04   | Seguridad        | 0 vulnerabilidades críticas, HTTPS A+, OWASP compliant| Alta      |
| RNF-05   | Usabilidad       | Mobile-first, WCAG AA, < 30 min aprendizaje           | Alta      |
| RNF-06   | Mantenibilidad   | Cobertura ≥ 80%, PHPStan nivel 8, PHPDoc completo     | Media     |
| RNF-07   | Compatibilidad   | Últimas 2 versiones Chrome/Firefox/Edge/Safari        | Media     |
| RNF-08   | Respaldo         | Backup diario, retención 30d, restore < 4h            | Alta      |
| RNF-09   | Monitoreo        | Logs centralizados, métricas, dashboards, alertas     | Media     |
| RNF-10   | Legal            | Cumplimiento Ley N° 29733, consentimiento informado   | Alta      |

---

## 25.4 Verificación en CI/CD

En el pipeline de GitHub Actions se incluyen verificaciones automáticas:

```yaml
# .github/workflows/quality.yml (extracto)
jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            https://staging.essalud.pe/
            https://staging.essalud.pe/procedures
          budgetPath: .github/lighthouse/budget.json

  security:
    runs-on: ubuntu-latest
    steps:
      - name: OWASP ZAP Scan
        uses: zaproxy/action-baseline@v0.12.0
        with:
          target: 'https://staging.essalud.pe'

  static-analysis:
    runs-on: ubuntu-latest
    steps:
      - name: PHPStan
        run: vendor/bin/phpstan analyse --level=8 --no-progress
      - name: Laravel Pint
        run: vendor/bin/pint --test
      - name: Security Check
        run: composer audit
```

---

## 25.5 Referencias

- [Ley N° 29733 — Protección de Datos Personales (Perú)](https://www.gob.pe/institucion/minjus/normas-legales/272702-29733)
- [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)
- [WCAG 2.1 (W3C)](https://www.w3.org/TR/WCAG21/)
- [Laravel Testing Docs](https://laravel.com/docs/11.x/testing)
- [k6 Load Testing](https://k6.io/docs/)
