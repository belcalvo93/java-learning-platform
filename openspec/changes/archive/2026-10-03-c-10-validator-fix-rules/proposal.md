# Proposal — c-10-validator-fix-rules (C-10 validator-fix-rules)

> Nota de nombre: el roadmap la llama `C-10-validator-fix-rules`; el CLI exige
> kebab-case en minúsculas, por eso el change vive como
> `c-10-validator-fix-rules`. Son el mismo change (precedente C-01..C-04).

## Why

La auditoría C-01 (matriz en `docs/validator-audit.md`) demostró que 7 reglas
específicas de `validator.js` rechazan la solución canónica de `data.js`
(ids 3–8 y 168): el estudiante que escribe la respuesta correcta recibe un
error. Eso rompe US-003 (validación offline inmediata) para esos ejercicios
y bloquea C-07 (MVP publicable). Hay que alinear cada regla con su solución
canónica antes de publicar.

## What Changes

- Corregir las 7 reglas de `validator.js` que hoy rechazan la solución
  canónica (ids 3, 4, 5, 6, 7, 8 y 168); no tocar reglas de ningún otro id.
- Por cada id: 1 test que PASA con la solución correcta de `data.js` + 1 test
  que FALLA con una solución incorrecta (TDD, `node --test`, sin dependencias
  nuevas). 7 ids → 14+ tests.
- Si el error está en `data.js` y no en la regla → NO tocarlo: reportarlo
  como hallazgo y consultar a Belén antes de seguir (rama de triage).
- Al cerrar: re-correr `tools/audit-validator.js` y actualizar
  `docs/validator-audit.md` con la matriz nueva.
- No cambiar IDs ni conteos (RN-CON-01, RN-CON-03); no tocar contenido de
  lecciones/ejercicios fuera de estas reglas; sin backend, sin publish.

## Capabilities

### New Capabilities

- `validator-rules`: la validación offline por reglas acepta la solución
  canónica de `data.js` para cada ejercicio con regla específica y rechaza
  soluciones incorrectas con mensaje en español (US-003, RN-CON-02).

### Modified Capabilities

<!-- Sin capacidades modificadas: `openspec/specs/` solo contiene
     `frontend-no-backend` (C-04, degradación sin backend), que no describe
     requisitos de reglas por ejercicio. El comportamiento nuevo vive en la
     capacidad nueva `validator-rules`. -->

## Impact

- Toca: `validator.js` (solo los 7 `case` + chequeos generales si un triage
  lo exige), `tools/validator-fix-rules.test.js` (nuevo), `docs/validator-audit.md`
  (matriz regenerada).
- Lee (solo lectura): `data.js` (soluciones canónicas ids 3–8, 168),
  `tools/audit-validator.js` + `tools/audit-validator.test.js` (patrón de
  rerun y de tests `node:test`).
- No toca: reglas de ningún otro id, contenido de lecciones/ejercicios, IDs,
  conteos 52/208, backend, despliegue, secretos.
- Sin commit/push en este change (solo artefactos + código del apply con
  pedido explícito).
