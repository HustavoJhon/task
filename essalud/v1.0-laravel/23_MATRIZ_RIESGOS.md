# 23. Matriz de Riesgos — EsSalud (Laravel)

> **Versión:** 1.0 — Laravel 11 + Livewire 3 + Blade + MySQL 8  
> **Última actualización:** 2026-06-21  

---

## 23.1 Metodología

Cada riesgo se evalúa en dos dimensiones:

- **Probabilidad:** Baja (1), Media (2), Alta (3)  
- **Impacto:** Bajo (1), Medio (2), Alto (3), Crítico (4)

La **severidad** se calcula como: `Severidad = Probabilidad × Impacto`

| Severidad | Rango  | Clasificación     | Color  |
|-----------|--------|-------------------|--------|
| Baja      | 1–3    | Aceptable         | Verde  |
| Media     | 4–6    | Requiere monitoreo| Amarillo|
| Alta      | 7–9    | Mitigación activa | Naranja|
| Crítica   | 10–12  | Plan de contingencia urgente | Rojo |

---

## 23.2 Riesgos Técnicos

### RT-01 — OpenAI API No Disponible o Excede Cuota

| Dimensión    | Valor |
|--------------|-------|
| Probabilidad | Media (2)  |
| Impacto      | Alto (3)   |
| **Severidad**| **6 — Media** |

**Descripción:** La API de OpenAI (GPT-4o, embeddings) puede experimentar caídas, latencia elevada o el consumo puede superar la cuota mensual contratada, afectando el chatbot RAG y la generación de embeddings.

**Mitigación:**
1. **Fallback a FAQ keyword matching:** El `ChatOrchestrator` intenta primero RAG; si falla tras 2 retries (timeout 5s), responde con FAQ tradicional.
2. **Cache de embeddings y respuestas:** TTL de 24h en Redis para preguntas frecuentes. Embeddings pre-calculados de documentos oficiales no cambian frecuentemente.
3. **Rate limiting interno:** Máximo 20 requests/min al chatbot. Cola separada `rag` con control de concurrencia.
4. **Monitoreo de cuota:** Alerta Prometheus `essalud_openai_api_errors_total > 10 en 5min` → Alertmanager notifica a Slack.

**Plan de contingencia:** Si la API está caída > 30 min, activar modo "solo FAQ" mediante feature flag en `.env`: `CHATBOT_MODE=faq_only`.

---

### RT-02 — Qdrant Caído o Rendimiento Degradado

| Dimensión    | Valor |
|--------------|-------|
| Probabilidad | Baja (1) |
| Impacto      | Alto (3)  |
| **Severidad**| **3 — Baja** |

**Descripción:** Qdrant (base de datos vectorial) puede fallar por falta de memoria, corrupción de datos o saturación del CPU, degradando las búsquedas semánticas del RAG.

**Mitigación:**
1. **Health checks cada 10s:** Se monitorea `GET /health` de Qdrant con prometheus. Si `down > 1min`, alerta.
2. **Fallback a MySQL FULLTEXT:** El `RagService` cambia automáticamente a `MATCH ... AGAINST` sobre la tabla `knowledge_base_articles` si Qdrant no responde.
3. **Configuración de recursos en Docker:** `mem_limit: 2g`, `cpus: 2` en `docker-compose.yml`.

**Plan de contingencia:** Reiniciar contenedor Qdrant. Si no se recupera, mantener fallback MySQL indefinidamente mientras se escala soporte.

---

### RT-03 — Tesseract OCR Baja Precisión

| Dimensión    | Valor |
|--------------|-------|
| Probabilidad | Media (2) |
| Impacto      | Medio (2) |
| **Severidad**| **4 — Media** |

**Descripción:** Tesseract OCR puede producir texto de baja calidad si los documentos escaneados tienen baja resolución, ruido o tipografía inusual, afectando el pre-llenado de formularios.

**Mitigación:**
1. **Pre-procesamiento de imágenes:** Aplicar `OpenCV` o `Intervention Image` para: binarización, redimensionado a 300 DPI, eliminación de ruido, enderezamiento.
2. **Validación humana GESDOC:** El OCR es sugerencia, no fuente de verdad. Un operador humano valida los campos extraídos.
3. **Métrica de confianza OCR:** `essalud_ocr_duration_seconds` + score de confianza por campo. Si confianza < 70%, se marca con advertencia.
4. **Límite de tamaño:** No procesar imágenes < 500x700px (se pide re-upload).

**Plan de contingencia:** Desactivar OCR temporalmente si precisión < 50%, volver a entrada manual mientras se ajusta el pipeline.

---

### RT-04 — Curva de Aprendizaje Livewire 3

| Dimensión    | Valor |
|--------------|-------|
| Probabilidad | Media (2) |
| Impacto      | Bajo (1)  |
| **Severidad**| **2 — Baja** |

**Descripción:** Siendo 1 desarrollador, la curva de aprendizaje de Livewire 3 puede ralentizar el desarrollo inicial de componentes reactivos.

**Mitigación:**
1. Documentación oficial de Livewire como referencia primaria.
2. Componentes reutilizables (`BaseTable`, `BaseForm`, `BaseModal`) documentados internamente.
3. Estándar de codificación definido en `.cursorrules` / `.windsurfrules`.
4. Comunidad activa (Discord, GitHub Discussions).

**Plan de contingencia:** Si un componente resulta demasiado complejo en Livewire, evaluar Alpine.js embebido o, en último caso, Blade tradicional con peticiones fetch.

---

## 23.3 Riesgos de Proyecto

### RP-05 — Cambio de Requisitos a Mitad de Desarrollo

| Dimensión    | Valor |
|--------------|-------|
| Probabilidad | Media (2) |
| Impacto      | Alto (3)  |
| **Severidad**| **6 — Media** |

**Descripción:** Stakeholders pueden solicitar cambios significativos en funcionalidades ya desarrolladas, impactando el cronograma.

**Mitigación:**
1. Documento de alcance firmado (`01_ALCANCE.md`) con lista taxativa de RF y RNF.
2. Proceso formal de control de cambios: solicitud → análisis de impacto (horas, dependencias) → aprobación → re-planificación.
3. Metodología ágil: sprints de 2 semanas permiten re-priorizar el backlog sin descartar trabajo hecho.
4. Comunicación semanal con stakeholders vía demo del sprint actual.

**Plan de contingencia:** Si el cambio es inevitable, negociar intercambio de features: quitar una feature del backlog por cada feature nueva añadida (mismo esfuerzo). Ajustar fecha de entrega si el delta neto es positivo.

---

### RP-06 — Solo 1 Desarrollador (Bus Factor = 1)

| Dimensión    | Valor |
|--------------|-------|
| Probabilidad | Baja (1) |
| Impacto      | Alto (3)  |
| **Severidad**| **3 — Baja** |

**Descripción:** Todo el conocimiento del código reside en una sola persona. Si el desarrollador se ausenta, el proyecto se detiene.

**Mitigación:**
1. Documentación exhaustiva del código: docblocks PHPDoc, README por módulo, ADRs (Architecture Decision Records).
2. Código sigue estándares PSR-12 + Laravel conventions. Auto-formateo con Pint.
3. Commits atómicos con mensajes descriptivos en inglés (Conventional Commits).
4. Wiki del repositorio con guías de setup, arquitectura y troubleshooting.
5. Variables de entorno documentadas en `.env.example` con comentarios.

**Plan de contingencia:** Si ocurre ausencia prolongada, el repositorio debe ser auto-contenido para que otro desarrollador Laravel senior pueda continuar en ≤ 2 semanas de ramp-up.

---

## 23.4 Riesgos de Seguridad

### RS-07 — Fuga de Datos de Asegurados

| Dimensión    | Valor |
|--------------|-------|
| Probabilidad | Baja (1) |
| Impacto      | Crítico (4) |
| **Severidad**| **4 — Media** |

**Descripción:** Datos personales (DNI, email, teléfono) y documentos de asegurados pueden ser expuestos por vulnerabilidad o error humano.

**Mitigación:**
1. Datos sensibles nunca en logs. Se configuran `app/Logging/SensitiveDataFilter.php` que redacta DNI, email, phone.
2. Encriptación de backups con `spatie/laravel-backup` (AES-256).
3. Acceso a archivos solo mediante controlador autorizado, no por URL pública.
4. Auditoría de accesos (`owen-it/laravel-auditing`) para detectar consultas anómalas.
5. CSP estricto, HSTS, CORS restrictivo. Ver documento `21_SEGURIDAD_AUDITORIA.md`.
6. Cumplimiento de la Ley de Protección de Datos Personales (Ley N° 29733, Perú).

**Plan de contingencia:** Si se detecta fuga, plan de respuesta: (1) bloquear acceso afectado, (2) identificar causa raíz con logs de auditoría, (3) notificar a DPO en ≤ 24h, (4) parchear y restaurar desde backup limpio.

---

## 23.5 Riesgos de Infraestructura

### RI-08 — Caída del Servidor de Producción

| Dimensión    | Valor |
|--------------|-------|
| Probabilidad | Baja (1) |
| Impacto      | Alto (3)  |
| **Severidad**| **3 — Baja** |

**Descripción:** El VPS de producción puede fallar por hardware, ataque DDoS, o error de configuración.

**Mitigación:**
1. Docker Compose con `restart: unless-stopped` en todos los servicios.
2. Backups diarios a S3/MinIO externo. Procedimiento de restore documentado y probado.
3. nginx configurado con rate limiting (`limit_req_zone`) para mitigar DDoS básicos.
4. Monitoreo con Prometheus: CPU > 80%, RAM > 90%, Disco < 10% → alertas.
5. Health check externo vía UptimeRobot o similar cada 1 min.

**Plan de contingencia:**
1. Recibir alerta → validar si el VPS responde a SSH.
2. Si no responde, contactar al proveedor de hosting.
3. Si responde pero Docker está caído: `docker compose up -d`.
4. Restaurar BD desde último backup si hay corrupción.
5. Tiempo objetivo de recuperación (RTO): < 4 horas. Punto objetivo de recuperación (RPO): < 24 horas.

---

### RI-09 — Saturación de la Base de Datos MySQL

| Dimensión    | Valor |
|--------------|-------|
| Probabilidad | Media (2) |
| Impacto      | Alto (3)  |
| **Severidad**| **6 — Media** |

**Descripción:** Consultas ineficientes o crecimiento de datos puede saturar MySQL, degradando toda la aplicación.

**Mitigación:**
1. Índices en columnas frecuentemente consultadas: `procedures.status`, `procedures.user_id`, `procedures.created_at`, `documents.procedure_id`.
2. Eager loading en relaciones Eloquent para evitar N+1. PHPStan regla de no lazy loading en producción.
3. Paginación en todos los listados (15 ítems por página por defecto).
4. Monitoreo de slow queries (> 500ms) con `slow_query_log` de MySQL.
5. Limpieza de sesiones expiradas vía `php artisan session:gc`.
6. Archivo de trámites antiguos (> 2 años) a tabla de respaldo.

**Plan de contingencia:** Identificar slow queries con Telescope/Horizon. Agregar índices faltantes. Si es insuficiente, considerar read replicas o caché Redis agresivo.

---

## 23.6 Matriz de Severidad (Resumen Visual)

```
Impacto →
         Bajo (1)     Medio (2)     Alto (3)         Crítico (4)
Prob. ↓
Alta (3)  [3]            [6]           [9]              [12]
Media(2)  [2]       RT-03[4],RT-01[6], RP-05[6],RI-09[6]
                    RT-04[2]    RP-05[6]  ---             ---
Baja (1)  [1]            [2]       RT-02[3],RP-06[3],  RS-07[4]
                                    RI-08[3]          RS-07[4]
```

---

## 23.7 Resumen de Riesgos por Nivel de Acción

| Nivel        | Riesgos                                      | Acción Requerida                         |
|--------------|----------------------------------------------|------------------------------------------|
| **Crítico**  | (ninguno por ahora)                          | Plan de contingencia inmediato           |
| **Alto**     | (ninguno por ahora)                          | Monitoreo constante, mitigación activa   |
| **Medio**    | RT-01, RT-03, RP-05, RI-09, RS-07           | Revisión quincenal, métricas asociadas   |
| **Bajo**     | RT-02, RT-04, RP-06, RI-08                  | Revisión mensual en retrospectiva        |

---

## 23.8 Plan de Revisión

- Al final de cada sprint (cada 2 semanas), se revisa esta matriz en la retrospectiva.
- Se actualizan probabilidades e impactos según nueva información.
- Se añaden nuevos riesgos si se identifican.
- Se cierran riesgos que ya no aplican (ej: fase completada).
- El documento se versiona en Git con el resto de la documentación.

---

## 23.9 Referencias

- Guía PMBOK — Gestión de Riesgos del Proyecto
- [Ley N° 29733 — Protección de Datos Personales (Perú)](https://www.gob.pe/minjus)
- [OWASP Risk Rating Methodology](https://owasp.org/www-community/OWASP_Risk_Rating_Methodology)
