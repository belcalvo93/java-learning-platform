# Proposal — c-11-editor-ux (C-11 editor-ux)

> Nota de nombre: el roadmap la llama `C-11-editor-ux`; el CLI exige
> kebab-case en minúsculas, por eso el change vive como
> `c-11-editor-ux`. Son el mismo change (precedente C-01..C-04, C-07, C-10, C-16).

> Dependencia C-16 archivada ✓ (`openspec/changes/archive/2026-10-04-c-16-content-and-mapping/`).
> La entrada hermana `C-11b lesson-exercise-nav` es un change SEPARADO solo-diseño:
> se leyó para evitar scope bleed y NO forma parte de este change.

## Why

El editor de ejercicios es un `textarea` plano sin numeración ni guías
(`script-enhanced.js:25`, estilos `.exercise-textarea` en `styles.css:795`),
la pista queda visible tras un acierto (solo `resetExercise` la oculta;
`displayValidationResult` nunca la toca), el `@import` de `styles.css:101`
está tras reglas ordinarias (los `@import` deben ir primeros para aplicarse)
y el fallo de indentación dice "no coincide con la solución esperada"
(`script-enhanced.js:194`, `ai-validator.js:158`) sin distinguir una llave
de más o de menos. Esto frena US-003 (resolver 208 ejercicios con validación
inmediata y mensaje legible).

## What Changes

- Numeración de líneas + guías sutiles de indentación en el editor, SIN
  librerías de terceros: `textarea` con columna de números y capa de guías
  sincronizadas (scroll y tamaño). Si no alcanza sin librería, PARAR y
  consultar a Belén antes de agregar una (gate explícito, no fallback).
- Ocultar la pista cuando el ejercicio sale correcto; se muestra ante fallo
  o a pedido con "Ver Pista" (`showHint` sigue existiendo).
- Mover el `@import` de `styles.css:101` al principio del archivo.
- Mejorar el mensaje de indentación fallida para que avise cuando hay una
  llave de más o de menos, en vez de "no coincide con la solución esperada".
  Solo el mensaje; las reglas de validación NO cambian. Si se agrega cálculo
  de aviso de llaves, lleva sus propios tests (`node --test`, sin
  dependencias nuevas).
- Verificación MANUAL (visual, sin lógica de negocio nueva salvo el aviso de
  llaves): abrir ejercicios en móvil + desktop; sincronía números/scroll,
  guías alineadas, pista oculta en correcto y visible en fallo o con
  "Ver Pista", mensaje de llaves claro, cero errores de consola.
- NON-goals: lista/navegación de ejercicios por lección (C-11b), rediseño
  visual (C-12), corrección de reglas del validador (C-10 cerrado), backend,
  publish, login. NO se toca `data.js` ni contenido de lecciones/ejercicios;
  ids y conteos 52/208 inmutables. Sin commit/push (solo artefactos en
  propose; el apply tampoco commitea sin pedido explícito).

## Capabilities

### New Capabilities

- `editor-ux`: el editor de ejercicios muestra números de línea sincronizados
  con scroll/contenido y guías sutiles de indentación sin librerías; la pista
  se oculta ante éxito y se muestra ante fallo o con "Ver Pista"; el fallo de
  indentación avisa si sobra o falta una llave sin cambiar el veredicto de la
  validación; tras verificar solo se muestra el resultado de la validación
  (correcto / necesita correcciones), sin el texto fijo "Salida del programa:
  Código ejecutado" (no es salida real); la hoja de estilos aplica sus
  fuentes (US-003, stack Vanilla sin framework).

### Modified Capabilities

<!-- Sin capacidades modificadas: `openspec/specs/` contiene
     `frontend-no-backend` (C-04, degradación sin backend),
     `validator-rules` (C-10, la canónica pasa / la incorrecta se rechaza)
     y `course-content` (C-16, contenido y mapeo). Ninguna describe
     requisitos de presentación del editor: las reglas NO cambian en este
     change (solo el TEXTO del mensaje de indentación, con veredicto
     idéntico), el contenido NO se toca y la degradación sin backend NO se
     toca. Todo comportamiento nuevo vive en la capacidad nueva
     `editor-ux`. -->

## Impact

- Toca (código, en apply): `script-enhanced.js` (plantilla del editor en
  `openExercise`, `displayValidationResult`, `showHint`; posible helper puro
  de conteo de llaves), `styles.css` (mover `@import` al inicio + estilos de
  gutter/guías), `validator.js` SOLO si el helper vive ahí (texto de mensaje;
  ninguna regla), más un test nuevo del cálculo de llaves si se agrega
  (`tools/*.test.js` con el patrón `vm` de C-10, `node --test`).
- Lee (solo lectura en propose): `script-enhanced.js:19-72,174-208,210-326,409-423`,
  `styles.css:1,98-101,795-879`, `validator.js:43-96`, `ai-validator.js:152-168`
  (desactivado desde C-02; ver design §Decisions-4), `index.html` (el editor
  se inyecta por JS, sin markup estático de editor).
- No toca: `data.js` ni ningún contenido (`solution`/`hint`/`validation`/
  `title`/`difficulty`/ids/conteos 52/208), veredictos de validación
  (`success` true/false idénticos ante las mismas entradas), backend,
  secretos, dependencias (cero librerías, cero fuentes externas nuevas).
