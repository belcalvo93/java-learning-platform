# Proposal — c-01-validator-audit (C-01 validator-audit)

> Nota de nombre: el roadmap la llama `C-01-validator-audit`; el CLI exige
> kebab-case en minúsculas, por eso el change vive como
> `c-01-validator-audit`. Son el mismo change.

## Why

`validator.js` dice validar offline, pero nadie verificó que cubra los 208
ejercicios (SU-01 sin verificar). Sin esa matriz no se puede cerrar DD-02
ni decidir si el MVP vive solo con reglas o necesita ejecución segura
(PA-01 bloquea DD-02 final). Esta auditoría responde PA-01 con evidencia
ejecutable, antes que cualquier otro change.

## What Changes

- Script de auditoría `tools/audit-validator.js` (Node, sin dependencias
  nuevas): recorre `data.js` + reglas de `validator.js` y clasifica cada
  ejercicio en `rules-only-ok` / `needs-real-execution` / `rules-cheatable`.
- Sonda de engaño: por cada familia de reglas, ≥2 variantes tramposas
  (literal con la respuesta esperada, código muerto/comentario que contiene
  el patrón) y registro de si `validator.js` las acepta falsamente.
- Matriz `docs/validator-audit.md`: tabla por ejercicio (id, lección,
  categoría, veredicto) + resumen (conteos, % engañable, lista de ejercicios
  que exigen ejecución real).
- Verificación de invariante en el script: 52 lecciones (15/15/12/10) y 208
  ejercicios presentes; falla si el conteo cambia.
- Solo lectura sobre contenido: si detecta errores de lecciones/ejercicios,
  los lista como hallazgos, no los corrige.
- Tests TDD con `node:test` + `assert/strict` (sin framework nuevo):
  clasificador con 2+ casos por categoría, ≥3 sondas de engaño que deben
  fallar contra el validator actual, test del invariante 52/208.

## Capabilities

### New Capabilities

<!-- Sin capacidades nuevas: no cambia comportamiento del producto, solo
     agrega tooling de auditoría + documentación. -->

### Modified Capabilities

<!-- Sin capacidades modificadas: no hay specs previas (repo sin
     openspec/specs/) y la validación en runtime no cambia. -->

Este change no crea ni modifica specs de producto: es tooling + docs de
solo lectura. Por eso `.openspec.yaml` lleva `skip_specs: true`
(`openspec validate` lo exige cuando hay cero deltas).

## Impact

- Crea: `tools/audit-validator.js`, `tools/audit-validator.test.js`,
  `docs/validator-audit.md`, artefactos del change.
- Toca (solo lectura en runtime del audit): `data.js`, `validator.js`,
  `script.js` (`lessonsData`), `script-enhanced.js` (uso real del validator).
- No toca: contenido de lecciones/ejercicios, backend (`backend/server.js`
  sigue suspendido, fuera de alcance), secretos, despliegue.
- Sin cambios en runtime para el usuario; sin costo nuevo ($0).
