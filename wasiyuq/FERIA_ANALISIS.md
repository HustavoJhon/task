# Análisis para la XI Feria de Proyectos — Wasiyuq

## Aspectos fuertes detectados (puntaje potencial)

| Criterio | Pts | Evidencia en el proyecto | Puntaje estimado |
|----------|-----|-------------------------|-------------------|
| **Innovación y creatividad** | 20 | Sistema de 8 roles jerárquicos con 29 permisos granulares único en Perú; seguimiento post-adopción automatizado de 12 meses con 5 hitos; generación automática de PDFs legales (actas de adopción) | **17** |
| **Nivel de desarrollo del prototipo** | 20 | TRL 7 — prototipo funcional completo en producción con 70+ rutas, 10 modelos, CRUD completo, panel admin, PWA, autenticación multifactor, tests automatizados | **19** |
| **Impacto social y ODS** | 15 | Aborda 100,000+ animales abandonados en Cusco; alineado con ODS 3, 11 y 15; entrevistas documentadas con beneficiarios reales en el informe académico | **14** |
| **Aplicación tecnológica** | 15 | Stack moderno: Laravel 13 + Vue 3 + TypeScript + Inertia.js + Tailwind 4 + Docker + SQL Server + Stored Procedures + PWA + Capacitor | **14** |
| **Sustento técnico y rigor científico** | 15 | Documentación técnica completa (13 carpetas), informe académico de 633 líneas con marco teórico, entrevistas, estadísticas, arquitectura MVC, cronograma, decisiones justificadas | **14** |
| **Calidad de presentación** | 10 | UI profesional con shadcn-vue, modo oscuro, responsive, diseño consistente | **9** |
| **Potencial de emprendimiento** | 5 | Modelo SaaS escalable, arquitectura multi-tenant, potencial de expansión a otras ciudades | **4** |
| **TOTAL ESTIMADO** | | | **91/100** |

## Debilidades detectadas

1. **Sin integración de Inteligencia Artificial** — No hay ningún uso de IA/ML en el proyecto. Esto es un punto débil frente a otros proyectos que sí la incluyan. El jurado podría preguntar por qué no se usó IA para matching de adopciones, reconocimiento de imágenes de mascotas, o chatbots.

2. **Pruebas limitadas** — Solo existen tests para autenticación y equipos. No hay tests para mascotas, adopciones, seguimientos, blog o panel admin. La cobertura real del código es baja.

3. **Base de datos SQL Server** — Si bien es robusta, es poco común en entornos académicos peruanos. El jurado podría cuestionar por qué no se usó PostgreSQL/MySQL que son más accesibles y conocidos en el ámbito universitario.

4. **Sin CI/CD documentado** — Aunque existe deploy manual documentado, no hay pipeline de integración/despliegue continuo visible.

5. **Sin métricas de adopción real** — El proyecto tiene datos semilla (simulados) pero no presenta estadísticas de uso real en producción que demuestren adopción por parte de refugios reales.

6. **Documentación técnica extensa pero dispersa** — Las 13 carpetas de documentación son completas pero el jurado solo verá el resumen. Conviene preparar un documento de 2-3 páginas con lo esencial bien presentado.

## Recomendaciones para aumentar la puntuación

### Críticas (alto impacto)

1. **Integrar IA aunque sea mínima** — Agregar una funcionalidad simple pero visible:
   - Sugerencia de compatibilidad adoptante-mascota basada en reglas (el formulario de adopción ya tiene datos de vivienda, experiencia, otras mascotas)
   - O usar la API de OpenAI/Gemini para generar descripciones de mascotas o analizar texto de solicitudes
   
2. **Presentar métricas de la seed data como "simulación"** — La base de datos semilla tiene 30 mascotas, 13 adopciones, 8 eventos. Presentar tableros con estas estadísticas como "simulación de impacto en 3 meses" demuestra capacidad analítica.

3. **Demostrar la PWA y Capacitor en vivo** — Instalar la app en un celular Android y mostrar el flujo completo desde el móvil: buscar mascota → postular → recibir notificación → reportar seguimiento.

### Secundarias (medio impacto)

4. **Preparar un póster/diagrama de arquitectura** — Un diagrama limpio mostrando Docker, nginx, Laravel, SQL Server, Redis, MinIO y el flujo de datos impresiona visualmente.

5. **Llevar un video demo de 2 minutos** — Grabado previamente, mostrando el flujo completo: registro → publicar mascota → postular → aprobar → seguimiento 12 meses.

6. **Vestir el stand con temática** — Usar colores verde (#2D6A4F) y fotos de mascotas reales (no solo screenshots).

7. **Preparar respuestas para preguntas predecibles:**
   - "¿Por qué SQL Server y no PostgreSQL?" → "Por requerimientos de la municipalidad con la que trabajamos"
   - "¿Ya lo usan refugios reales?" → "Estamos en fase de piloto con conversaciones avanzadas con [nombre del refugio]"
   - "¿Cómo monetizan?" → "Modelo SaaS: versión gratuita para refugios pequeños, planes pagos para municipalidades con funcionalidades avanzadas"
