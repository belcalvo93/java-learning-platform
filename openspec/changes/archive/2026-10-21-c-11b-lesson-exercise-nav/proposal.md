# Proposal

## Why

Hoy "Siguiente Ejercicio" y "Ejercicio Anterior" navegan por id global, así que
al terminar un ejercicio el estudiante puede caer en otra lección. Las tarjetas de
lección no muestran qué ejercicios tienen, y "Ver Todos los Ejercicios" es una
lista plana de 208 ítems en la que no se encuentra uno concreto. Además, la
pantalla de ejercicio no se usa bien en celular (a 424 px los botones se cortan y
las cajas de error y pista quedan angostas). Belén decidió implementar C-11b (que
en `CHANGES.md` figuraba solo como diseño) junto con el arreglo responsive.

## What Changes

- "Siguiente Ejercicio" / "Ejercicio Anterior" siguen el orden de los ejercicios
  dentro de la lección actual. En el último ejercicio de la lección se ofrece
  volver a las lecciones o pasar a la lección siguiente.
- Las tarjetas de lección (vista en grilla y vista por módulos) muestran la
  cantidad de ejercicios y sus nombres antes de abrir la lección. Las lecciones
  sin ejercicios (22, 25, 40, 42) se indican como lección de lectura.
- "Ver Todos los Ejercicios" se agrupa por lección.
- Una única función de disponibilidad (hoy siempre responde que sí) que consultan
  "Siguiente" y las tarjetas, para activar el bloqueo por nivel (C-19) en un solo
  lugar más adelante.
- Pantalla de ejercicio responsive a 480 px o menos (solo CSS y la mínima
  estructura necesaria): botones de acción y de navegación dentro del ancho, alto
  táctil de 44 px, márgenes reducidos para que el texto use casi todo el ancho.
  Nada cambia en escritorio (más de 768 px).
- Sin cambios en consignas, ids, 52/208, `data.js`, `script.js` ni la lógica de
  validación. Sin librerías nuevas.

## Capabilities

### New Capabilities
- `lesson-exercise-nav`: navegación de ejercicios por lección, tarjetas de lección
  con sus ejercicios, listado agrupado y función única de disponibilidad.
- `exercise-mobile-layout`: disposición de la pantalla de ejercicio en pantallas
  angostas (360–480 px) y verificación de que no hay desborde horizontal.

### Modified Capabilities

(ninguna: no cambian los requisitos de las specs existentes)

## Impact

- Código: `index.html` (un `<script>`), nuevo `lesson-nav.js` (lógica pura),
  `script-enhanced.js` (render del visor de ejercicio, listado agrupado y
  decoración de tarjetas), `styles.css` (reglas ≤ 768/480 px acotadas al visor de
  ejercicio).
- Pruebas: `tools/lesson-nav.test.js` (nuevo) y casos nuevos en
  `tools/browser-check.js`.
- Dependencias: ninguna nueva. `data.js` y `script.js` intactos.
- Documentación: `CHANGES.md` (C-11b pasa de "solo diseño" a implementación).
