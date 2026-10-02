# Visión y Objetivos

## Propósito del sistema
JavaMaster permite que personas hispanohablantes aprendan Java gratis, con práctica real en el navegador, sin pagar bootcamps ni instalar herramientas.

El sistema existe porque no hay suficiente material interactivo en español que cubra Java de cero a avanzado con ejecución y validación inmediata.

## Objetivos por actor

| Actor | Objetivo principal | Objetivos secundarios |
|-------|--------------------|-----------------------|
| Estudiante | Aprender Java practicando en el navegador | Avanzar por niveles, certificar completion, repasar con guías |
| Administradora (Belén) | Publicar contenido que funcione sin backend | Gestionar lecciones/ejercicios, ver métricas (futuro), mantener costo cero |

## Alcance v1.0 (MVP lanzable)
- 52 lecciones y 208 ejercicios funcionando en sitio publicado (GitHub Pages).
- Validación por reglas en frontend cuando no hay backend (sin secretos expuestos).
- Ejecución Java segura O validación por reglas — una de las dos, nunca ejecución insegura.
- Cero secretos en código (Gemini/Firebase ejemplo removidos o movidos a env no commiteado).
- Progreso guardado solo en navegador (localStorage) — documentado como limitación, no como bug.

## Fuera de alcance
- Login y base de datos (va después del MVP).
- Panel admin / métricas servidor (futuro).
- Reactivar backend Render tal cual está (prohibido hasta rediseño seguro).
- Certificado con validez externa / anti-fraude.
- Apps móviles, multi-tenant institucional.

## Métricas de éxito
- MVP: sitio publicado con 52/52 lecciones y 208/208 ejercicios validables sin errores JS, sin secretos en repo.
- Producto: estudiantes completan niveles y retienen (medición futura con login/DB).
- Costo: hosting mensual = 0 (free-tier) en MVP.
