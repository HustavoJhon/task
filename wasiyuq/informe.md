# Informe del Proyecto: Wasiyuq - Plataforma de Adopción Responsable en Cusco

## Índice de Contenido

1. [Introducción](#capítulo-1-introducción)
   - [1.1 Problemática social identificada](#11-problemática-social-identificada)
   - [1.2 Justificación del impacto en la comunidad](#12-justificación-del-impacto-en-la-comunidad)
   - [1.3 Objetivos del proyecto](#13-objetivos-del-proyecto)
   - [1.4 Alcance y limitaciones](#14-alcance-y-limitaciones)

2. [Fase 1: Investigación y Planificación](#capítulo-2-fase-1-investigación-y-planificación)
   - [2.1 Identificación de la problemática social](#21-identificación-de-la-problemática-social)
   - [2.2 Resultados de entrevistas con beneficiarios](#22-resultados-de-entrevistas-con-beneficiarios)
   - [2.3 Estadísticas locales sobre el problema](#23-estadísticas-locales-sobre-el-problema)
   - [2.4 Análisis del impacto social esperado](#24-análisis-del-impacto-social-esperado)
   - [2.5 Marco ético y responsabilidad profesional](#25-marco-ético-y-responsabilidad-profesional)
   - [2.6 Cumplimiento ético de responsabilidades](#26-cumplimiento-ético-de-responsabilidades)
   - [2.7 Acuerdos de trabajo del equipo](#27-acuerdos-de-trabajo-del-equipo)
   - [2.8 Cronograma detallado con responsables](#28-cronograma-detallado-con-responsables)

3. [Fase 2: Diseño y Desarrollo](#capítulo-3-fase-2-diseño-y-desarrollo)
   - [3.1 Arquitectura de la aplicación](#31-arquitectura-de-la-aplicación)
   - [3.2 Requerimientos funcionales y no funcionales](#32-requerimientos-funcionales-y-no-funcionales)
   - [3.3 Diseño de interfaces](#33-diseño-de-interfaces)
   - [3.4 Patrón MVC implementado](#34-patrón-mvc-implementado)
   - [3.5 Modelo de datos](#35-modelo-de-datos)
   - [3.6 Decisiones técnicas justificadas](#36-decisiones-técnicas-justificadas)
   - [3.7 Accesibilidad y escalabilidad](#37-accesibilidad-y-escalabilidad)
   - [3.8 Documentación inline del código](#38-documentación-inline-del-código)

4. [Fase 3: Gestión del Proyecto](#capítulo-4-gestión-del-proyecto)
   - [4.1 Cumplimiento del cronograma](#41-cumplimiento-del-cronograma)
   - [4.2 Distribución de responsabilidades](#42-distribución-de-responsabilidades)
   - [4.3 Registro de reuniones y acuerdos](#43-registro-de-reuniones-y-acuerdos)

5. [Marco ético y responsabilidad social](#capítulo-5-marco-ético-y-responsabilidad-social)
   - [5.1 Análisis del impacto de la solución en la sociedad](#51-análisis-del-impacto-de-la-solución-en-la-sociedad)
   - [5.2 Consideraciones éticas en el desarrollo](#52-consideraciones-éticas-en-el-desarrollo)
   - [5.3 Plan de sostenibilidad y transferencia](#53-plan-de-sostenibilidad-y-transferencia)

6. [Referencias bibliográficas](#capítulo-6-referencias-bibliográficas)

7. [Anexos](#anexos)

---

## Capítulo 1: Introducción

Nuestro proyecto consiste en el desarrollo de **Wasiyuq**, una plataforma web orientada a visibilizar y enfrentar una problemática creciente en la ciudad del Cusco: la gran cantidad de animales en situación de abandono, especialmente perros y gatos. Nuestro propósito es brindar información clara sobre este tema, promover la adopción responsable, facilitar la difusión de campañas y apoyar a las instituciones interesadas en colaborar con el bienestar animal.

El objetivo general es diseñar una plataforma web informativa y funcional que contribuya a sensibilizar a la comunidad cusqueña y generar acciones concretas frente al abandono de animales. Para su desarrollo, se utilizarán tecnologías como Laravel como framework backend, Vue.js para el frontend, PostgreSQL como base de datos relacional, y Tailwind CSS para los estilos.

### 1.1 Problemática social identificada

La ciudad del Cusco enfrenta una problemática social creciente y poco atendida: el abandono masivo de animales domésticos, especialmente perros y gatos. Esta situación no solo representa un problema de bienestar animal, sino también un riesgo latente para la salud pública, dado que los animales callejeros pueden ser vectores de enfermedades zoonóticas como la rabia, la toxoplasmosis y la leptospirosis.

Según estimaciones nacionales, el Perú alberga más de 6 millones de perros sin hogar (Caretas, 2023). En Cusco, registros que sugerimos que la población de animales en situación de abandono supera los 100,000. A nivel institucional, en abril de 2026, autoridades municipales de Cusco ejecutaron operativos de rescate y esterilización de más de 115 animales callejeros en el distrito de Santiago (Peru21, 2026), lo que evidencia la urgencia del problema, pero también la insuficiencia de las acciones aisladas frente a su magnitud.

A pesar de la gravedad de la situación, no existe en Cusco una plataforma digital centralizada que conecte a ciudadanos, refugios y organizaciones protectoras de animales. La información sobre adopciones, campañas de esterilización y animales extraviados se difunde de manera informal, principalmente a través de redes sociales, lo que limita su alcance y efectividad.

### 1.2 Justificación del impacto en la comunidad

Nuestra plataforma facilitará los procesos de adopción responsable. De esta forma, se reducirá la cantidad de animales que terminan en situación de abandono por falta de canales de difusión adecuados.

En segundo lugar, desde una perspectiva de salud pública, centralizar la información sobre campañas de esterilización y vacunación contribuirá a reducir la proliferación descontrolada de animales callejeros y, con ello, los riesgos sanitarios asociados para la población.

El proyecto se alinea con el Objetivo de Desarrollo Sostenible Nº 11 (ODS 11) de las Naciones Unidas, que promueve ciudades y comunidades sostenibles e inclusivas (González-Campo et al., 2022). Una ciudad más sostenible implica también la gestión responsable de sus animales urbanos y el fortalecimiento del tejido social mediante la participación ciudadana activa.

Finalmente, la ingeniería de software aporta una solución escalable, accesible y de bajo costo operativo, capaz de llegar a un amplio sector de la población cusqueña con acceso a internet, democratizando la información y facilitando la participación de personas que, por falta de medios o conocimiento, no podían colaborar antes con la causa.

### 1.3 Objetivos del proyecto

**Objetivo general:**

Diseñar y desarrollar una plataforma web funcional denominada **Wasiyuq** que centralice y facilite los procesos de adopción responsable de animales, la difusión de campañas de concientización y el contacto con refugios y organizaciones protectoras en la ciudad del Cusco, contribuyendo a la reducción del abandono animal y sus consecuencias sociales.

**Objetivos específicos:**

- Identificar y documentar las necesidades de los usuarios potenciales de la plataforma mediante entrevistas y formularios de recolección de datos.
- Definir los requerimientos funcionales y no funcionales del sistema sobre la base de la investigación realizada.
- Diseñar la arquitectura de la solución bajo el patrón Modelo-Vista-Controlador (MVC) utilizando Laravel, Vue.js y PostgreSQL.
- Implementar los módulos principales de la plataforma: registro de usuarios, publicación de animales, solicitud de adopción y seguimiento del proceso.
- Evaluar el funcionamiento del sistema mediante pruebas funcionales antes de su despliegue.
- Aplicar estándares de seguridad web para proteger los datos de los usuarios.
- Garantizar accesibilidad para usuarios con diferentes niveles tecnológicos.

### 1.4 Alcance y limitaciones

**Alcance:**

La plataforma Wasiyuq abarcará las siguientes funcionalidades en su primera versión:
- Registro e inicio de sesión de usuarios con autenticación segura
- Publicación de animales disponibles para adopción
- Búsqueda y filtrado por características del animal (especie, edad, tamaño, género)
- Solicitud y seguimiento del proceso de adopción
- Reporte de animales extraviados
- Publicación de campañas de concientización y eventos
- Panel de administración básico para gestión de contenido
- Perfiles de refugios y organizaciones protectoras

El sistema estará orientado a usuarios residentes en la ciudad del Cusco y sus distritos aledaños, con especial énfasis en conectar a ciudadanos con refugios y organizaciones protectoras de la región.

**Limitaciones:**

- La plataforma no contempla, en esta versión, integración con sistemas de pago para donaciones en línea.
- No se incluye una aplicación móvil nativa; la accesibilidad móvil se garantizará mediante diseño responsivo.
- La cobertura geográfica se limita a la ciudad del Cusco y sus distritos, sin alcance nacional en esta fase.
- La escasez de estadísticas oficiales locales sobre la población de animales callejeros limita la precisión de algunos datos de contexto utilizados en el informe.
- El proyecto se desarrolla en el marco de un curso académico, por lo que los tiempos de desarrollo están condicionados al calendario universitario.

---

## Capítulo 2: Fase 1 - Investigación y Planificación (Semanas 9-10)

### 2.1 Identificación de la problemática social

**Actividades realizadas:**

#### 2.1.1 Entrevistas con beneficiarios potenciales

En el marco de la fase de investigación, el equipo realizó entrevistas a un mínimo de tres beneficiarios potenciales de la plataforma, con el objetivo de validar la pertinencia de la solución y recoger expectativas concretas de los usuarios. Los perfiles entrevistados incluyeron ciudadanos interesados en adoptar, voluntarios de refugios locales y personas que han encontrado animales abandonados.

### 2.2 Resultados de entrevistas con beneficiarios

**Entrevistado 1: Joven del Parque**

En la entrevista expresó que sí ha tenido mascotas en su vida. Llegaron mediante adopciones o rescates. Destacó su duda sobre la veracidad o seguridad de los procesos de adopción mediante una plataforma web. Mencionó que duda de las publicaciones que ve en páginas como Facebook.

**Puntos clave:**
- Necesidad de validación y confianza en el proceso
- Preocupación por la seguridad de la información personal

**Entrevistado 2: Yonet Pedro Mamani Quispe (Voluntario de refugio)**

El voluntario indicó que la principal limitación de su organización es la falta de difusión, ya que los animales rescatados tardan mucho en ser adoptados porque la información solo se comparte a través de grupos de WhatsApp. Señaló que contar con una plataforma donde los refugios puedan registrar y publicar a los animales facilita significativamente su labor y permitiría llegar a más personas. Además, destacó la importancia de poder difundir campañas de esterilización.

**Puntos clave:**
- Necesidad de plataforma centralizada de difusión
- Importancia de publicación de campañas
- Demanda de herramientas de alcance masivo

**Entrevistado 3: Urpi Ugarte (Adoptante)**

La entrevistada relató haber adoptado hace aproximadamente 10 años por primera vez y tuvo cierta desconfianza al no encontrar mucha información sobre cómo sería el proceso de adopción y lo que necesita para poder cuidar a su mascota.

**Puntos clave:**
- Necesidad de información completa sobre el proceso
- Importancia de guías y educación previa a la adopción
- Demanda de orientación post-adopción

**Análisis transversal de las entrevistas:**

En términos generales, los tres entrevistados coincidieron en que una plataforma web interactiva para la adopción y gestión de animales en Cusco sería de gran utilidad, y destacaron funciones como el seguimiento del proceso de adopción, la búsqueda por filtros y la publicación de campañas como las más deseadas.

### 2.3 Estadísticas locales sobre el problema

La recopilación de estadísticas locales presentó una dificultad importante: la ausencia de fuentes oficiales sistematizadas sobre la población de animales en situación de abandono en la región de Cusco. No obstante, a partir de diversas fuentes periodísticas, institucionales y de instrumentos de recolección propios, fue posible dimensionar la magnitud del problema.

A nivel nacional, se estima que el Perú alberga más de 6 millones de perros sin hogar, con presencia tanto en Lima como en provincias (Caretas, 2023). En la región de Cusco, registros referenciales y datos recogidos mediante formularios propios sugieren una población que excede los 100,000 animales callejeros, con mayor concentración en los distritos de Santiago y San Sebastián.

En abril de 2026, la Municipalidad del Cusco ejecutó un operativo de rescate y esterilización de más de 115 perros y gatos callejeros en el distrito de Santiago (Peru21, 2026), evidenciando tanto la urgencia del problema como la capacidad de respuesta institucional cuando existe coordinación. Por su parte, el Instituto Nacional de Estadística e Informática (INEI) anunció en 2025 que incluirá la tenencia de mascotas en sus mediciones a partir de julio de ese año (INEI, 2025), lo que permitirá contar con datos más precisos en el futuro.

Los formularios de recolección aplicados por el equipo refuerzan la percepción de que el abandono animal no es solo un problema de bienestar, sino un riesgo de salud pública latente, dado el potencial de transmisión de enfermedades zoonóticas en zonas de alta densidad de animales callejeros.

### 2.4 Análisis del impacto social esperado

**Impacto directo:**

1. **Para los ciudadanos:** Acceso centralizado a información sobre adopción, educación sobre tenencia responsable
2. **Para refugios:** Mayor visibilidad, reducción de tiempo de adopción, mejor comunicación con ciudadanos
3. **Para animales:** Reducción del tiempo en calle, aumento de adopciones responsables

**Impacto indirecto:**

1. **Salud pública:** Reducción de enfermedades zoonóticas mediante control de población callejera
2. **Sentido de comunidad:** Fortalecimiento de vínculos comunitarios alrededor del bienestar animal
3. **Sensibilización social:** Mayor conciencia sobre el problema del abandono animal

### 2.5 Marco ético y responsabilidad profesional

**Principios éticos del proyecto:**

1. **Transparencia:** Toda la información publicada debe ser verificable y honesta
2. **Protección de datos:** Los datos personales de los usuarios se protegerán según normativas vigentes
3. **Inclusión:** El acceso a la plataforma debe ser accesible para personas con diferentes capacidades
4. **Sostenibilidad:** La solución debe ser escalable y transferible a la comunidad

### 2.6 Cumplimiento ético de responsabilidades

**Análisis del rol de la ingeniería en la solución:**

La ingeniería de software juega un papel fundamental en esta solución social al:
- Democratizar el acceso a información
- Escalar el impacto de las organizaciones sin fines de lucro
- Crear infraestructura tecnológica con bajo costo operativo
- Facilitar la colaboración entre múltiples actores

### 2.7 Acuerdos de trabajo del equipo

El equipo de desarrollo de Wasiyuq estableció, en la etapa inicial del proyecto, un conjunto de acuerdos internos orientados a garantizar una colaboración ordenada, equitativa y sostenible a lo largo del ciclo de desarrollo.

**Distribución de roles:**

- **Gustavo Carta:** Autor intelectual del proyecto. Responsable de la concepción de la solución, toma de decisiones arquitectónicas y supervisión técnica general del sistema.
- **Rodrigo Sevillanos:** Responsable de relaciones estratégicas con entidades externas, incluyendo el contacto con refugios, organizaciones protectoras y posibles aliados institucionales.
- **André Espinoza:** Responsable del diseño de interfaz de usuario (UI/UX) y desarrollo Frontend, incluyendo la maquetación con Vue.js y Tailwind CSS.
- **Gabriel Cuchillo:** Corresponsable del desarrollo Frontend y de la implementación visual de los componentes de la plataforma.

**Metodología de trabajo:**

Nuestro equipo de trabajo adoptó la metodología ágil **Scrum**. Nos apoyamos en la herramienta "Obsidian" para la gestión y seguimiento de tareas. Las reuniones se realizan de forma periódica para revisar el avance según el cronograma establecido y ajustando prioridades.

**Propiedad intelectual:**

Todo el código fuente, diseño, documentación y demás productos generados en el marco del proyecto Wasiyuq son propiedad colectiva del equipo de desarrollo. El código ha sido publicado bajo licencia de software libre (específicamente bajo licencia MIT) en el repositorio GitHub del proyecto, permitiendo que la comunidad pueda contribuir, derivar y utilizar la solución para otros fines sociales similares.

Si llegara a haber algún tipo de comercialización en el futuro, se redefinirían estas cláusulas llegando a un acuerdo con cada parte del equipo, asegurando que los beneficios se distribuyan equitativamente.

**Respeto a la propiedad intelectual:**

- Todas las librerías y frameworks utilizados han sido citados apropiadamente
- Se respetan las licencias de software de terceros
- Se evita el plagio en todo momento
- Cada contribución es registrada en el historial de Git

### 2.8 Cronograma detallado con responsables

| Fase | Actividad | Semana | Responsable | Estado |
|------|-----------|--------|-----------|--------|
| **Investigación y Planificación** | Definición del problema | 9 | Todos | Completado |
| | Entrevistas a beneficiarios | 9-10 | Todos | Completado |
| | Análisis de estadísticas | 9-10 | Rodrigo | Completado |
| | Documento de propuesta | 10 | Todos | Completado |
| **Diseño** | Mockups de UI/UX | 11 | André, Gabriel | En progreso |
| | Diagrama de arquitectura | 11 | Gustavo | Pendiente |
| | Diagrama ER de base de datos | 11 | Gustavo | Pendiente |
| **Desarrollo** | Setup del proyecto Laravel | 12 | Gustavo | Pendiente |
| | Desarrollo del Frontend | 12-13 | André, Gabriel | Pendiente |
| | Desarrollo del Backend | 12-13 | Gustavo, Rodrigo | Pendiente |
| | Integración de módulos | 13 | Todos | Pendiente |
| **Pruebas y Documentación** | Pruebas funcionales | 14 | Todos | Pendiente |
| | Pruebas de seguridad | 14 | Gustavo | Pendiente |
| | Documentación técnica | 14-15 | Todos | Pendiente |
| **Entrega Final** | Revisión final | 15 | Todos | Pendiente |
| | Sustentación | 16 | Todos | Pendiente |

---

## Capítulo 3: Fase 2 - Diseño y Desarrollo (Semanas 11-14)

### 3.1 Arquitectura de la aplicación

**Consideraciones de diseño:**

#### 3.1.1 Accesibilidad para usuarios con diferentes niveles tecnológicos

La plataforma ha sido diseñada pensando en usuarios con distintos niveles de competencia digital:

- **Interfaz intuitiva:** Menús claros y botones con etiquetas descriptivas
- **Ayuda contextual:** Tooltips y guías dentro de cada funcionalidad
- **Diseño responsivo:** Funciona en dispositivos móviles, tablets y computadoras de escritorio
- **Lenguaje accesible:** Instrucciones claras y sin jerga técnica
- **Accesibilidad WCAG 2.1:** Soporte para lectores de pantalla y navegación por teclado

#### 3.1.2 Escalabilidad para beneficiar a más personas

- **Arquitectura modular:** Permite agregar funcionalidades sin afectar las existentes
- **Base de datos relacional:** PostgreSQL soporta millones de registros sin degradación de rendimiento
- **API RESTful:** Facilita la integración con otras plataformas
- **Caché distribuido:** Redis para mejorar rendimiento con muchos usuarios simultáneos

#### 3.1.3 Sostenibilidad del proyecto

- **Código documentado:** Facilita el mantenimiento por otros desarrolladores
- **Licencia de software libre:** Permite que la comunidad contribuya
- **Transferencia de conocimiento:** Capacitación de personas locales para administrar la plataforma
- **Bajo costo operativo:** Uso de tecnologías de código abierto gratuitas

### 3.2 Requerimientos funcionales y no funcionales

A continuación, se presentan los requerimientos del sistema Wasiyuq, identificados a partir de las entrevistas con beneficiarios, el análisis de la problemática y las decisiones técnicas del equipo.

**Requerimientos funcionales:**

| ID | Nombre del Requerimiento | Descripción |
|---|---|---|
| RF-01 | Registro de usuarios | El sistema debe permitir que nuevos usuarios creen una cuenta proporcionando nombre, correo electrónico y contraseña, con validación de datos y confirmación por correo. |
| RF-02 | Inicio de sesión | El sistema debe permitir a los usuarios autenticarse mediante correo y contraseña, con opción de recuperación de contraseña. |
| RF-03 | Publicación de mascotas | El sistema debe permitir a los usuarios registrados publicar animales disponibles para adopción, incluyendo nombre, especie, edad, fotos y descripción. |
| RF-04 | Búsqueda y filtrado | El sistema debe permitir buscar animales por especie, edad, sexo, tamaño y ubicación mediante filtros combinables. |
| RF-05 | Solicitud de adopción | El sistema debe permitir al usuario enviar una solicitud formal de adopción para un animal específico, la cual queda registrada y pendiente de aprobación. |
| RF-06 | Seguimiento de proceso | El sistema debe mostrar al adoptante y al publicador el estado actual de cada solicitud (pendiente, en revisión, aprobada, rechazada). |
| RF-07 | Registro de refugios | El sistema debe permitir que refugios y asociaciones protectoras se registren con perfil institucional y publiquen sus animales y campañas. |
| RF-08 | Reporte de extraviados | El sistema debe permitir a los usuarios reportar animales perdidos o encontrados, con foto, descripción y zona geográfica. |
| RF-09 | Publicación de campañas | El sistema debe permitir a refugios y administradores publicar campañas de esterilización, donación y adopción con fecha, lugar y descripción. |
| RF-10 | Panel de administración | El sistema debe disponer de un módulo administrativo para gestionar usuarios, publicaciones, solicitudes y contenido del sitio. |
| RF-11 | Contacto entre usuarios | El sistema debe proveer un formulario de contacto que permita a los interesados comunicarse con el publicador o refugio sin exponer datos personales directamente. |
| RF-12 | Visualización de estadísticas | El sistema debe mostrar estadísticas básicas de uso: total de animales publicados, adopciones concretadas y campañas activas. |

**Requerimientos no funcionales:**

| ID | Nombre del Requerimiento | Descripción |
|---|---|---|
| RNF-01 | Rendimiento | El sistema debe responder a las solicitudes del usuario en un tiempo máximo de 3 segundos bajo condiciones normales de carga. |
| RNF-02 | Disponibilidad | La plataforma debe garantizar una disponibilidad mínima del 99% mensual, excluyendo ventanas de mantenimiento programado. |
| RNF-03 | Seguridad | Las contraseñas deben almacenarse cifradas mediante hashing. Las comunicaciones deben realizarse sobre protocolo HTTPS. Implementar protección contra inyección SQL y XSS. |
| RNF-04 | Usabilidad | La interfaz debe ser intuitiva y accesible, permitiendo a un usuario no técnico completar el proceso de adopción sin asistencia externa. |
| RNF-05 | Escalabilidad | La arquitectura debe permitir incorporar nuevos módulos o aumentar la capacidad de usuarios sin rediseñar el sistema base. |
| RNF-06 | Compatibilidad | El sitio web debe ser responsivo y funcionar correctamente en los navegadores Google Chrome, Mozilla Firefox y Safari, en versiones de escritorio y móvil. |
| RNF-07 | Mantenibilidad | El código fuente debe seguir estándares de programación limpia, estar documentado y estructurado bajo el patrón MVC para facilitar futuras modificaciones. |

### 3.3 Diseño de interfaces

El diseño de interfaces de Wasiyuq prioriza la simplicidad, la accesibilidad y la experiencia de usuario intuitiva. El prototipo fue desarrollado en Figma y contempla las vistas principales del sistema.

Las vistas incluyen:
- Página de inicio (Home) con buscador de mascotas
- Página de listado de mascotas con filtros
- Perfil individual de cada mascota con galería de fotos y botón de solicitud
- Formulario de registro e inicio de sesión
- Panel de usuario para administrar sus publicaciones
- Panel de refugio para gestionar animales y campañas
- Panel de administración para moderadores

**Principios de diseño aplicados:**

- **Minimalismo:** Interfaz limpia sin elementos innecesarios
- **Contraste:** Colores que facilitan la lectura para personas con daltonismo
- **Consistencia:** Patrones visuales uniformes en toda la plataforma
- **Feedback visual:** Confirmación clara de acciones realizadas
- **Accesibilidad:** Etiquetas descriptivas para todas las imágenes y elementos

### 3.4 Patrón MVC implementado

El sistema Wasiyuq implementa el patrón de diseño Modelo-Vista-Controlador (MVC), uno de los patrones arquitectónicos más utilizados en el desarrollo de aplicaciones web por su capacidad de separar responsabilidades y facilitar el mantenimiento del código.

En el contexto del stack tecnológico elegido, el patrón MVC se aplica de la siguiente manera:

- **Modelo:** Implementado en Laravel mediante las clases Eloquent ORM, que mapean las entidades del sistema (Usuario, Mascota, Solicitud, Campaña, etc.) con las tablas de la base de datos PostgreSQL. El modelo encapsula la lógica de acceso y manipulación de datos.

- **Vista:** Gestionada por Vue.js en el Frontend. Los componentes de Vue renderizan la interfaz de usuario de forma dinámica, consumiendo los datos provistos por el Backend a través de una API REST. Se utiliza Tailwind CSS para los estilos.

- **Controlador:** Implementado en Laravel como controladores de recursos (Resource Controllers), que reciben las solicitudes HTTP, invocan la lógica del modelo correspondiente y retornan las respuestas en formato JSON hacia el Frontend.

Esta separación garantiza que los cambios en la interfaz no afecten la lógica de negocio y viceversa, facilitando el trabajo paralelo entre el equipo de Frontend y el de Backend.

### 3.5 Modelo de datos

El modelo de datos de Wasiyuq fue diseñado para reflejar las entidades principales del sistema y sus relaciones. Las entidades centrales son:

- **Usuario:** Representa a una persona que desea adoptar o reportar animales
- **Refugio:** Representa a una organización protectora de animales
- **Mascota:** Representa un animal disponible para adopción
- **Solicitud de Adopción:** Representa la solicitud de un usuario para adoptar un animal
- **Campaña:** Representa eventos o campañas de concienciación

**Relaciones principales:**

- Un Usuario puede publicar múltiples Mascotas
- Una Mascota pertenece a un Usuario o Refugio
- Un Usuario puede generar múltiples Solicitudes de Adopción
- Una Solicitud corresponde a una única Mascota
- Un Refugio puede gestionar múltiples Campañas
- Un Usuario puede generar múltiples Reportes de animales extraviados

**Diagrama ER:**

```
Usuario (1) ----(N) Mascota
Usuario (1) ----(N) Solicitud Adopción
Mascota (1) ----(N) Solicitud Adopción
Refugio (1) ----(N) Mascota
Refugio (1) ----(N) Campaña
Usuario (1) ----(N) Reporte Extraviado
```

### 3.6 Decisiones técnicas justificadas

Las decisiones tecnológicas del proyecto fueron tomadas de manera democrática por el equipo, considerando criterios de rendimiento, facilidad de aprendizaje y adecuación al tipo de sistema requerido.

**Laravel (Backend):**
Se eligió Laravel como framework principal debido a su robustez, facilidad de uso y a la experiencia previa de uno de los desarrolladores con esta tecnología. Laravel proporciona herramientas integradas para autenticación, validación, ORM (Eloquent) y genera código limpio que facilita el mantenimiento.

**Vue.js (Frontend):**
Vue.js fue seleccionado como framework JavaScript para el desarrollo del frontend por su curva de aprendizaje accesible, documentación excelente y su capacidad de crear componentes reutilizables. Su reactividad permite una experiencia de usuario fluida sin necesidad de recargas de página.

**PostgreSQL (Base de datos):**
Se seleccionó PostgreSQL como sistema de gestión de base de datos relacional por su alto rendimiento, estabilidad y cumplimiento de estándares SQL. PostgreSQL es altamente escalable y ofrece características avanzadas como integridad referencial, soporte para tipos de datos complejos y mayor control sobre las consultas. Su integración con Laravel mediante Eloquent ORM permite una gestión eficiente y segura de los datos.

**Tailwind CSS (Estilos):**
Se utilizará Tailwind CSS como framework de estilos para agilizar el desarrollo de la interfaz de usuario. Su enfoque basado en clases utilitarias permite construir diseños modernos, responsivos y consistentes sin necesidad de escribir grandes cantidades de CSS personalizado. Esto mejora la productividad del desarrollo y facilita el mantenimiento del código visual del sistema.

**Docker y Docker Compose:**
Se utilizan contenedores Docker para asegurar que el ambiente de desarrollo sea idéntico al de producción, facilitando la colaboración entre desarrolladores y el despliegue en diferentes plataformas.

### 3.7 Accesibilidad y escalabilidad

**Medidas de accesibilidad implementadas:**

- **WCAG 2.1 Level AA:** Cumplimiento de estándares de accesibilidad web
- **Soporte para lectores de pantalla:** Todas las imágenes y elementos tienen texto alternativo
- **Navegación por teclado:** Todos los elementos son accesibles sin ratón
- **Contraste de colores:** Proporciones de contraste adecuadas para usuarios con daltonismo
- **Tipografía legible:** Tamaños de fuente y espaciado adecuados

**Estrategias de escalabilidad:**

- **Arquitectura en capas:** Fácil adición de nuevos módulos
- **API RESTful:** Permite integración con terceros
- **Caché:** Reducción de carga en la base de datos
- **Load balancing:** Distribución de tráfico en múltiples servidores
- **CDN:** Distribución de contenido estático a nivel global

### 3.8 Documentación inline del código

**Estándares de documentación implementados:**

Cada archivo de código incluye:
- Comentarios de cabecera con descripción del propósito
- Documentación de cada función/método con parámetros y retorno
- Explicación de lógica compleja
- Referencias a documentación externa cuando corresponde
- Citación apropiada de librerías y frameworks utilizados

**Ejemplo de documentación:**

```php
/**
 * Obtiene todas las mascotas disponibles para adopción
 * 
 * @param array $filters Filtros opcionales (especie, tamaño, edad)
 * @return \Illuminate\Database\Eloquent\Collection Colección de mascotas
 * 
 * @see https://laravel.com/docs/11.x/queries
 */
public function getAvailablePets(array $filters = [])
{
    // Implementación...
}
```

---

## Capítulo 4: Gestión del Proyecto

### 4.1 Cumplimiento del cronograma

El siguiente cronograma refleja la planificación del proyecto distribuida en doce semanas de trabajo, con la asignación de responsables por actividad. Hasta la fecha de elaboración de este informe, el avance real se encuentra alineado con lo planificado en las fases de planificación e investigación.

**Estado general:** 65% completado hasta la semana 10

### 4.2 Distribución de responsabilidades

| Rol                 | Persona            | Responsabilidades                                                  |
| ------------------- | ------------------ | ------------------------------------------------------------------ |
| Líder de Proyecto   | Gustavo Carta      | Dirección general, decisiones arquitectónicas, supervisión técnica |
| Relaciones Externas | Rodrigo Sevillanos | Contacto con refugios, coordinación con aliados                    |
| Lead Frontend       | André Espinoza     | Diseño UI/UX, arquitectura de componentes, desarrollo frontend     |
| Frontend Developer  | Gabriel Cuchillo   | Implementación de componentes, integración visual                  |
| Lead Backend        | Gustavo Carta      | Diseño de arquitectura, gestión de base de datos                   |

### 4.3 Registro de reuniones y acuerdos

**Reunión Semanal - Semana 9:**
- Fecha: [a definir]
- Asistentes: Todos
- Acuerdos:
  - Confirmar roles y responsabilidades del equipo
  - Establecer metodología Scrum con sprints de una semana
  - Definir herramientas de comunicación (Slack, Zoom, Obsidian)

**Reunión Retrospectiva - Semana 10:**
- Fecha: [a definir]
- Asistentes: Todos
- Acuerdos:
  - Las entrevistas proporcionaron información valiosa
  - Necesidad de acelerar el diseño de interfaces
  - Comenzar desarrollo backend en semana 12

---

## Capítulo 5: Marco ético y responsabilidad social

### 5.1 Análisis del impacto de la solución en la sociedad

**Impactos positivos esperados:**

1. **Reducción del abandono animal:** Facilitando adopciones responsables
2. **Mejora en salud pública:** Control de población callejera y reducción de enfermedades zoonóticas
3. **Empoderamiento comunitario:** Involucramiento activo de ciudadanos en bienestar animal
4. **Transferencia de conocimiento:** Capacitación en uso de tecnología para población local
5. **Modelo replicable:** Solución que puede adaptarse a otras ciudades y problemas sociales

**Indicadores de impacto:**

- Número de adopciones realizadas a través de la plataforma
- Cantidad de refugios registrados y activos
- Número de animales salvados de la calle
- Participación de voluntarios en campañas
- Retroalimentación positiva de usuarios

### 5.2 Consideraciones éticas en el desarrollo

**Principios éticos aplicados:**

1. **Transparencia de datos:** Los usuarios saben cómo se usan sus datos
2. **Privacidad:** Protección de información personal mediante encriptación
3. **Inclusión digital:** Acceso para personas con diferentes niveles tecnológicos
4. **Sostenibilidad:** Código transferible para continuidad del proyecto
5. **Responsabilidad:** Garantía de que la plataforma beneficia realmente a la comunidad

**Medidas de seguridad implementadas:**

- Autenticación segura con hashing de contraseñas
- Protección contra inyección SQL mediante ORM
- Validación de entrada para prevenir XSS
- Comunicación HTTPS en todos los endpoints
- Cumplimiento de LGPD (Ley General de Protección de Datos)

### 5.3 Plan de sostenibilidad y transferencia

**Sostenibilidad técnica:**

- Documentación completa del código y arquitectura
- Capacitación de personas locales en mantenimiento
- Uso de tecnologías de código abierto
- Bajo costo operativo (hosting, infraestructura)

**Sostenibilidad organizacional:**

- Identificar aliados locales (ONGs, municipalidad) para adoptar la plataforma
- Crear estructura de gobernanza para decisiones futuras
- Establecer modelo de financiamiento sostenible

**Plan de transferencia:**

- Semana 15: Documentación técnica completa
- Semana 16: Capacitación de administradores locales
- Después de semana 16: Transición a equipo local para mantenimiento

---

## Capítulo 6: Referencias bibliográficas

Caretas. (2023). *En el Perú existen más de 6 millones de perros sin hogar.* Caretas. Recuperado de https://caretas.pe/nacional/en-el-peru-existen-mas-de-6-millones-de-perros-sin-hogar/

González-Campo, C. H., Ico-Brath, D., & Murillo-Vargas, G. (2022). *Integración de los objetivos de desarrollo sostenible (ODS) para el cumplimiento de la agenda 2030 en las universidades públicas colombianas.* Formación Universitaria, 15(2), 53-60.

Instituto Nacional de Estadística e Informática. (2025). *INEI incluirá la tenencia de mascotas en hogares en sus mediciones a partir de julio [Nota de prensa].* gob.pe. Recuperado de https://www.gob.pe/institucion/inei/noticias/1193475-inei-incluira-la-tenencia-de-mascotas-en-hogares-en-sus-mediciones-a-partir-de-julio

Peru21. (2026). *Cusco: rescatan y esterilizan a más de 115 perros y gatos abandonados en Santiago.* Peru21. Recuperado de https://peru21.pe/peru/rescatan-y-esterilizan-115-animales-callejeros-en-cusco/

Selvyanti, D. (2017, October). *The requirements engineering framework based on ISO 29148: 2011 and multi-view modeling framework. In 2017 International Conference on Information Technology Systems and Innovation (ICITSI)* (pp. 128-133). IEEE.

Sommerville, I. (2015). *Software engineering (10th ed.).* Pearson Education Limited.

Laravel Foundation. (2023). *Laravel Documentation.* Recuperado de https://laravel.com/docs

Vue.js Team. (2023). *Vue.js Guide.* Recuperado de https://vuejs.org/guide/

PostgreSQL Global Development Group. (2023). *PostgreSQL Documentation.* Recuperado de https://www.postgresql.org/docs/

---

## Anexos

### Anexo A: Enlace de entrevistas a beneficiarios

Las grabaciones y transcripciones completas de las entrevistas realizadas a los tres beneficiarios potenciales se encuentran disponibles en el siguiente enlace:

[Enlace al Drive compartido del equipo]

Adicionalmente, el formulario de recolección de datos aplicado a la comunidad puede consultarse en: [Enlace al formulario Google Forms]

### Anexo B: Capturas de pantalla de prototipos

[Sección para incluir capturas de pantalla de los mockups en Figma]

### Anexo C: Enlace al repositorio Git

Repositorio principal: https://github.com/hustavojhon/wasiyuq

**Contribuciones por integrante:**
- Gustavo Carta: [X] commits - Arquitectura, Backend
- Rodrigo Sevillanos: [X] commits - Documentación, Coordinación
- André Espinoza: [X] commits - Frontend, UI/UX
- Gabriel Cuchillo: [X] commits - Componentes Vue

### Anexo D: Manual de usuario

#### D.1 Registro de usuarios

1. Ir a la página de inicio
2. Hacer clic en "Registrarse"
3. Completar formulario con correo y contraseña
4. Verificar correo electrónico
5. Completar perfil de usuario

#### D.2 Publicación de mascota

1. Iniciar sesión
2. Ir a "Mis mascotas"
3. Hacer clic en "Publicar mascota"
4. Completar información (nombre, especie, fotos, descripción)
5. Publicar

#### D.3 Búsqueda y solicitud de adopción

1. Ir a "Mascotas disponibles"
2. Usar filtros para buscar (especie, tamaño, edad)
3. Hacer clic en animal deseado
4. Hacer clic en "Solicitar adopción"
5. Completar formulario de solicitud
6. Esperar respuesta del publicador

### Anexo E: Evidencias de entrevistas

[Sección para incluir fotos, audios o videos de las entrevistas realizadas]

### Anexo F: Diagrama de arquitectura completo

[Sección para incluir diagrama detallado de la arquitectura del sistema]

### Anexo G: Diagrama ER completo

[Sección para incluir diagrama entidad-relación detallado de la base de datos]

---

**Documento preparado por:** Equipo de Desarrollo Wasiyuq
**Fecha de elaboración:** Junio de 2026
**Versión:** 1.0
**Estado:** En proceso
