# Design — C-18 validator-structural

## Context

Ver `proposal.md` (Why) para la motivación. Estado actual: `validator.js`
compara por texto exacto o `includes()` (rama `default`, línea ~173),
tiene 8 validadores propios (ids 1–8) con reglas de presencia por regex, un
`checkIndentation` que exige múltiplos de 4 crudos y mensajes que filtran la
respuesta (ej. `validateHolaMundo`). `tools/audit-validator.js` ya clasifica
los 208 ejercicios y genera sondas tramposas
(`comentario-con-respuesta`, `codigo-muerto-con-patron`,
`literal-con-patron`); `braceNotice` (C-11) muestra cómo ignorar
strings/comentarios al contar. Restricciones: Vanilla JS sin dependencias
nuevas, offline-first (RN-CON-02), contenido intacto, 52/208 inmutables.

**La implementación va por TDD estricto, y la FASE 1 es solo auditoría**
(`docs/validator-strictness.md` con veredictos por ejercicio + propuesta de
regla; NO se toca `validator.js`) **hasta que Belén revise la auditoría.**
Solo tras su OK empieza la Fase 2 (código).

## Goals / Non-Goals

**Goals:**
- Pasar el comparador a equivalencia estructural por tokens manteniendo las
  208 canónicas aceptadas y mensajes 100 % conceptuales.
- Dejar la auditoría por ejercicio como contrato revisable antes del código.

**Non-Goals (diseño):**
- No se diseña ejecución real (C-05/C-06), ni cambios de UI, ni login, ni
  publicación. No se modifica `data.js` bajo ningún concepto.

## Decisions

1. **Tokenizer propio sin dependencias** (vs. parser Java completo o
   librería externa): un normalizador en `validator.js` que quita
   comentarios `//` y `/* */`, preserva strings literales como token opaco y
   emite tokens de código (identificadores, números, operadores, llaves).
   Alternativa descartada: librería de parsing (rompe costo-cero y
   offline sin build). El tokenizer reutiliza la técnica de `braceNotice`
   (recorrido con estados inSingle/inDouble/inLineComment) extendida a
   `/* */`.
2. **Equivalencia por renombrado consistente** (vs. lista de nombres
   permitidos): mapa canónico→estudiante construido al comparar; dos
   identificadores libres son iguales si el mapeo es biyectivo en todo el
   snippet. Los nombres fijos (clase/método de la consigna, `System`, `out`,
   `println`, tipos JDK) van en una allowlist por ejercicio derivada de la
   auditoría Fase 1. Alternativa descartada: normalizar todo a `VAR` (rompe
   detección de variables mezcladas).
3. **Textos: libres por defecto, fijos por veredicto** (vs. todo-libre o
   todo-estricto): cada literal se compara según el veredicto del ejercicio
   en `docs/validator-strictness.md`. Números y operadores siempre estrictos.
   La tensión del id 5 (consigna fija `Hola, Java!` vs. regla roadmap de
   texto libre) se resuelve en Fase 1 con Belén, no en el diseño.
4. **Rechazo de trampa por alcance real**: tras quitar comentarios, la
   comparación solo considera tokens en alcance ejecutable; los patrones de
   sonda de `tools/audit-validator.js` se reutilizan como tests de regresión
   (cada sonda tramposa actual debe pasar a rechazada). No se intenta
   análisis de flujo completo (fuera de alcance sin ejecución).
5. **Mensajes conceptuales por plantilla**: cada regla devuelve un código de
   concepto (`missing-println`, `wrong-operator`, …) mapeado a texto fijo en
   español sin interpolación de la solución. Se audita con grep: ningún
   mensaje contiene literales de `data.js`.
6. **Indentación estructural (+4 por bloque)**: reemplaza el múltiplo-de-4
   crudo de `checkIndentation` para ids 1–4 por una pila de bloques
   `{`/`}` que espera +4 por nivel; el contenido se valida por tokens, no por
   igualdad con la solución.

## Risks / Trade-offs

- [Riesgo] El renombrado consistente acepta una solución con lógica
  permutada pero misma forma (falso positivo) → Mitigación: números y
  operadores estrictos + sondas de engaño como tests; lo residual lo cubre
  ejecución real (C-05/C-06).
- [Riesgo] Tokenizer casero con edge cases (text blocks, escapes raros)
  → Mitigación: TDD con casos de escape desde el día 1; alcance limitado a
  sintaxis usada en los 208 ejercicios (inventario en Fase 1).
- [Riesgo] 208 veredictos manuales inconsistentes → Mitigación: formato
  tabular fijo en `docs/validator-strictness.md` (id, fija-?, textos,
  números, propuesta) revisado por Belén antes del código.
- [Trade-off] Sin parser real no hay equivalencia semántica profunda
  (ej. `for` vs `while` equivalente se rechaza) → aceptado: el objetivo es
  anti-trampa + tolerancia de forma, no equivalencia total.

## Migration Plan

Sin despliegue: cambio local en `validator.js` + docs. Rollback = revert del
commit único del change (un change, un commit). La matriz
`docs/validator-audit.md` se regenera al cerrar cada fase; si la Fase 2
rompe canónicas, se revierte antes de archivar (gate: 208/208 aceptadas).

## Open Questions

- Ninguna que bloquee el diseño: las decisiones por ejercicio (qué textos
  fijos, qué nombres fijos) viven en la auditoría Fase 1 y las cierra Belén
  en la revisión. Si la revisión cambia una decisión de este documento, se
  actualiza el diseño antes de la Fase 2.
