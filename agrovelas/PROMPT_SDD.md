# Prompt maestro para OpenCode — SDD AGROVELAS

Copia y pega esto en OpenCode para construir el SDD completo del sistema AGROVELAS desde cero:

---

```
Eres un arquitecto de software experto en Spec-Driven Development (SDD) para Google Apps Script.

## Contexto del proyecto

**AGROVELAS** es un sistema de gestión ganadera para pequeños y medianos productores altoandinos de la región Cusco, Perú. Trabaja con alpacas, llamas, ovejas, bovinos y caprinos. Los usuarios son ganaderos, veterinarios y zootecnistas con conectividad limitada.

## Archivos de referencia existentes

Lee los siguientes archivos en el directorio `agrovelas/`:
1. `AGROVELAS_Sheet_Schema.md` — esquema completo de 22 hojas de Google Sheets
2. `code.gs` — backend funcional con autenticación, CRUD, IoT, contabilidad
3. `index.html` — frontend completo con Tailwind CSS, dashboard, formularios, mapa Leaflet
4. `Informe 1er agrovelas mk4.md` — contexto de negocio, misión, visión, stakeholders, FODA, PESTEL

## Tu tarea

Genera un documento SDD completo (Spec-Driven Development) en español que contenga:

### 1. Visión general del sistema
- Propósito, misión, visión (del informe)
- Alcance (beta: registro digital; expansión: IoT; futuro: IA/predictivo)
- Stakeholders y usuarios target

### 2. Arquitectura
- Stack tecnológico: Google Apps Script (backend), Google Sheets (base de datos), Tailwind CSS + Leaflet.js (frontend), desplegado como Web App de Google Apps Script
- Diagrama de capas (Sheet → Code.gs → HTML/CSS/JS)
- Modo offline: el sheet debe funcionar como fuente de verdad, sincronización diferida

### 3. Especificación de la base de datos (22 hojas)
- Listar cada hoja con: nombre, propósito, columnas (nombre, tipo, validación, FK, ejemplo)
- Prefijos de ID (USR, ANI, FEN, GEN, REP, SAN, ALE, MOV, LOT, ESQ, CTB, MUL, CAL, NOT, CIT, DIS, LEC, LOG)
- Relaciones entre hojas (diagrama ER simplificado)
- Hoja `Secuencias` para IDs atómicos con LockService
- Hoja `Listas` para dropdowns configurables

### 4. Especificación funcional

#### Módulo de Autenticación
- Registro con usuario/contraseña propio (no Google)
- SHA-256 + sal, bloqueo tras 5 intentos fallidos
- Sesión manejada desde el frontend

#### Módulo de Animales
- Registro completo con pestañas: General, Fenotípico, Genotípico, Multimedia
- Datos: especie, raza, sexo, fecha nacimiento, color, padre, madre, línea genética, procedencia, lote
- Fenotípico: peso, altura, longitud, perímetro torácico, condición corporal, tipo/color de fibra
- Genotípico: categoría de registro, pureza genética, finura de fibra (µm), categoría de fibra (Baby/Fleece/Medium/Huarizo/Gruesa), densidad/uniformidad del vellón
- Multimedia: foto principal, código QR generado dinámicamente
- Listado con tabla responsive

#### Módulo de Sanidad
- Registro de vacunaciones, desparasitaciones, tratamientos, diagnósticos, cirugías
- Campos: fecha, tipo evento, producto, dosis, vía de aplicación, diagnóstico, síntomas, veterinario, próxima fecha, costo, estado (Aplicado/Programado/Vencido)

#### Módulo de Reproducción
- Eventos: empadre/monta, inseminación artificial, diagnóstico de gestación, parto, aborto, destete
- Fecha probable de parto calculada por especie (alpaca ≈345d, oveja ≈150d, bovino ≈283d)
- Resultado: Positivo/Negativo/Pendiente

#### Módulo de Esquila (alpacas, llamas, ovejas)
- Peso del vellón, micronaje, longitud de mecha, categoría de fibra
- Destino (venta directa/acopio comunal/centro de clasificación)
- Cálculo automático de ingreso total (peso × precio/kg)

#### Módulo de Ubicación y Manejo
- Movimientos: ingreso, egreso/venta, traslado interno, muerte, pérdida
- Latitud/longitud para mapeo
- Lotes de origen y destino

#### Módulo de Alertas Sanitarias
- Animales en seguimiento con nivel de urgencia (Baja/Media/Alta/Crítica)
- Asignación a zootecnista y veterinario
- Sintomas, diagnóstico final, resolución

#### Módulo IoT
- Dispositivos (collares GPS, sensores LoRa, caravanas RFID) asignados a animales
- Lecturas históricas con latitud, longitud, temperatura corporal, nivel de actividad
- Mapa Leaflet con marcadores de ubicación actual de cada dispositivo activo

#### Módulo de Zootecnistas y Citas
- Perfil de zootecnista: especialidad, años experiencia, calificación, tarifa, zona cobertura, horario (JSON)
- Citas: solicitante, fecha, hora, motivo, estado, calificación post-servicio
- Directorio con tarjetas visuales

#### Módulo de Contabilidad Ganadera
- Ingresos y egresos con categorías (venta animal, venta fibra, compra insumos, honorarios, alimentación, medicamentos, mantenimiento)
- Relación opcional con animal o esquila
- Balance general

#### Dashboard
- Tarjetas de resumen (total animales, alertas activas, zootecnistas, actividades)
- Mini calendario del mes con actividades marcadas
- Lista de notificaciones recientes

### 5. Especificación de UI/UX
- Landing page informativa sobre AGROVELAS (hero, features, cómo funciona)
- Diseño responsive con Tailwind CSS
- Paleta de colores: verde esmeralda (emerald-600 como primary)
- Sidebar de navegación colapsable en mobile
- Modales para formularios (no redireccionar a otra página)
- Tablas para listados
- Toast notifications para feedback

### 6. Reglas de implementación para Code.gs
- `inicializarBaseDeDatos()` crea las 22 hojas con encabezados congelados
- Generación de IDs con LockService para atomicidad
- Funciones públicas: CRUD por hoja, login, registro, carga de archivos, consultas agregadas
- Las listas desplegables se leen desde la hoja `Listas`, nunca hardcodeadas

### 7. Plan de implementación (por orden)
1. Sheet + inicialización
2. Autenticación
3. Módulo Animales (completo)
4. Sanidad
5. Reproducción
6. Esquila
7. Alertas
8. Ubicación y Lotes
9. Zootecnistas + Citas
10. Contabilidad
11. IoT + Mapa
12. Dashboard + Calendario + Notificaciones
13. Landing page

### 8. Prompt para generar el SDD en OpenCode

Usa este mismo prompt como entrada para OpenCode. Copia todo el contenido desde "Eres un arquitecto..." hasta aquí y pégalo en OpenCode. El agente generará el documento SDD completo en markdown basado en todos los archivos de referencia.

## Output esperado

Genera un archivo `SDD_AGROVELAS_COMPLETO.md` en el directorio `agrovelas/` con toda la especificación detallada lista para ser implementada por cualquier agente de IA.
```
