# Proposal — c-16-content-and-mapping (C-16 content-and-mapping)

> Nota de nombre: el roadmap la llama `C-16-content-and-mapping`; el CLI exige
> kebab-case en minúsculas, por eso el change vive como
> `c-16-content-and-mapping`. Son el mismo change (precedente C-01..C-04, C-07, C-10).

> Advertencia de orden: la dependencia C-07 (`c-07-publish-frontend`) está
> actualmente ACTIVE (in-progress, pre-push) mientras C-10 está archivada ✓.
> Posicionalmente C-16 va tras C-07, pero técnicamente C-16 solo necesita las
> reglas ya corregidas de C-10 + el paquete verificado (`content-pack/` +
> `tools/` + `docs/content-review-notes.md`). Este proposal lo registra
> honestamente: el apply puede prepararse sobre la base de C-10, y el cierre
> espera el diff revisado por Belén (el orden posicional se regulariza al
> archivar C-07).

## Why

Las lecciones tienen contenido pobre y 208 ejercicios cuelgan en parte de
lecciones equivocadas (p. ej. "Clase Abstracta" estaba en "POO: Clases y
Objetos"), lo que rompe US-001/US-002 (navegar y aprender por guías
coherentes). El paquete verificado `content-pack/content-pack.json` (51
lecciones con contenido nuevo, 208 consignas reescritas con salida esperada,
reasignación a su lección, starters vacíos con comentario neutro) ya existe
junto a su script aplicador con invariantes y sus tests de calidad. Hay que
aplicarlo al código de forma atómica y segura, sin romper RN-CON-01/RN-CON-03.

## What Changes

- Ejecutar `node tools/apply-content-pack.js` (primero `--check` dry-run,
  después escritura real): reescribe `content` de 51 lecciones en `script.js`
  (la 1 intacta) y `lessonId`/consigna/starter vacío de los 208 ejercicios en
  `data.js`.
- El script verifica invariantes ANTES de escribir y ABORTA sin escribir nada
  ante cualquier violación: conteos 208/52, ids/orden, `title`/`difficulty`/
  `solution`/`hint`/`validation` intactos, solo starters vacíos rellenados.
  NUNCA se tocan soluciones, pistas, validaciones, títulos, dificultades,
  ids ni conteos.
- Reasignación de ejercicios a su lección según el mapa nuevo de
  `docs/content-review-notes.md`; lecciones sin ejercicios (solo lectura)
  pasan a ser [22, 25, 40, 42].
- Actualizar test 1.3 de `tools/audit-validator.test.js` (expectativa de
  lecciones sin ejercicios: 51/52 → 22/25/40/42) y tarjetas de nivel en
  `index.html` (60/60/48/40 → 62/58/48/40 por nivel).
- Correr la suite completa (incl. `tools/content-quality.test.js`, 4 tests de
  guarda de calidad) hasta verde y regenerar `docs/validator-audit.md` con
  `tools/audit-validator.js`.
- Cierre con diff revisado por Belén antes de archivar (regla "Contenido
  intacto" de AGENTS.md: contenido solo dentro de C-16 con su revisión).
- NON-goals: cambios de reglas del validador, backend/executor, publish,
  rediseño, login. Hallazgos de `content-review-notes.md` §3 (soluciones con
  problema real, starters que ya validan, validaciones laxas) quedan FUERA:
  se reportan, no se corrigen aquí.

## Capabilities

### New Capabilities

- `course-content`: el contenido de cada lección es real y completo (título,
  explicación ≥500 caracteres con `info-box` "En el mundo real" y `code-block`,
  sin `script`/`style`/`img`/`a`), cada ejercicio cuelga de la lección que le
  corresponde con consigna clara (≥80 caracteres con "Salida/Resultado
  esperado", sin HTML de bloque), los starters que son solo comentario nunca
  aprueban la validación, y los conteos por nivel son 62/58/48/40 (total 208)
  con las lecciones 22, 25, 40 y 42 como solo-lectura (RN-CON-01, RN-CON-03,
  US-001, US-002).

### Modified Capabilities

<!-- Sin capacidades modificadas: `openspec/specs/` contiene
     `frontend-no-backend` (C-04, degradación sin backend) y
     `validator-rules` (C-10, reglas aceptan la canónica). Ninguna describe
     requisitos de contenido de lecciones ni de mapeo lección→ejercicios:
     las reglas NO cambian en este change y la matriz regenerada es un
     artefacto derivado, no un requisito nuevo. El comportamiento nuevo vive
     en la capacidad nueva `course-content`. -->

## Impact

- Toca (vía script + 2 ediciones manuales): `script.js` (solo `content` de 51
  lecciones), `data.js` (solo `lessonId`/consigna/starter-vacío),
  `tools/audit-validator.test.js` (solo test 1.3: [22,25,40,42]),
  `index.html` (solo tarjetas 62/58/48/40), `docs/validator-audit.md`
  (matriz regenerada).
- Lee (solo lectura): `content-pack/content-pack.json` (51 lecciones, 208
  ejercicios, 67 con starterCode), `tools/apply-content-pack.js` (99 líneas,
  invariantes + `--check`), `tools/content-quality.test.js` (58 líneas,
  4 tests de guarda), `docs/content-review-notes.md` (mapa nuevo),
  `docs/content-audit.md` (línea base a comparar después),
  `knowledge-base/05_reglas_de_negocio.md` §RN-CON-01, RN-CON-03.
- No toca: `solution`, `hint`, `validation`, `title`, `difficulty`, ids,
  conteos 52/208, reglas del validador, backend, publish, secretos.
- Scope atómico y pequeño, en español, solo artefactos en propose (sin
  commit/push; el apply tampoco commitea sin pedido explícito).
