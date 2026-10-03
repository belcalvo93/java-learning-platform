# Tasks — c-10-validator-fix-rules

> TDD estricto (módulo global): RED → GREEN → TRIANGULATE → REFACTOR por id.
> Sin aserciones triviales: cada test ejerce `validate()` real. Runner:
> `node --test tools/validator-fix-rules.test.js` (sin dependencias nuevas).
> `data.js`: solo lectura (rama de triage §5 si la canónica es la incorrecta).
> Safety net: suite C-01 (`node --test tools/audit-validator.test.js`) en
> verde ANTES de tocar `validator.js`; si ya falla, STOP y reportar como
> fallo preexistente (no corregir de paso).

## 1. Safety net + harness de tests (RED primero)

- [x] 1.1 Correr `node --test tools/audit-validator.test.js` y registrar el
  baseline ("N tests pasando"); verificar que la suite está verde antes de
  tocar `validator.js`.
- [x] 1.2 Escribir `tools/validator-fix-rules.test.js` con 7 tests RED (uno
  por id 3–8, 168: la canónica de `data.js` debe ser válida y hoy falla) y
  verificar que los 7 fallan contra el `validator.js` actual.
- [x] 1.3 Agregar el test del invariante 52/208 post-fix a la suite nueva y
  verificar que pasa (carga solo-lectura con `vm.runInNewContext`, patrón C-01).

## 2. Fix ids 3–4 (reescribir el case por id)

- [x] 2.1 Triage regla-vs-dato ids 3–4: comparar canónica vs
  enunciado/starter; si la canónica no responde al enunciado, NO tocar
  `data.js`, registrar el hallazgo, excluir el id y consultar a Belén; solo
  con canónica correcta seguir a 2.2. Verificar triage documentado en el
  resumen del apply.
- [x] 2.2 RED: tests canónica-aceptada + incorrecta-rechazada (con mensaje en
  español) para ids 3–4; verificar que la canónica falla antes del fix.
- [x] 2.3 GREEN: reescribir `case 3` (dos métodos `a`/`b`) y `case 4` (bucle
  + condición par) según design §Decisions-1; verificar suite nueva verde
  para ids 3–4 y suite C-01 sin regresiones.
- [x] 2.4 TRIANGULATE + REFACTOR ids 3–4: segundo caso incorrecto por id
  (p. ej. un solo método en id 3; bucle sin condición par en id 4) que debe
  seguir rechazado; verificar suite verde tras cada paso.

## 3. Fix ids 5–6 (reescribir el case por id)

- [x] 3.1 Triage regla-vs-dato ids 5–6 (igual rama que 2.1); verificar
  triage documentado o hallazgo reportado a Belén.
- [x] 3.2 RED: tests canónica-aceptada + incorrecta-rechazada para ids 5–6;
  verificar que la canónica falla antes del fix.
- [x] 3.3 GREEN: reescribir `case 5` («Hola Mundo») y `case 6` (dos
  `println`) según design §Decisions-1; verificar suite nueva verde para
  ids 5–6 y suite C-01 sin regresiones.
- [x] 3.4 TRIANGULATE + REFACTOR ids 5–6: segundo caso incorrecto por id que
  debe seguir rechazado; verificar suite verde tras cada paso.

## 4. Fix ids 7–8 (reescribir el case por id)

- [x] 4.1 Triage regla-vs-dato ids 7–8 (igual rama que 2.1); verificar
  triage documentado o hallazgo reportado a Belén.
- [x] 4.2 RED: tests canónica-aceptada + incorrecta-rechazada para ids 7–8;
  verificar que la canónica falla antes del fix.
- [x] 4.3 GREEN: reescribir `case 7` (`print` + `println`) y `case 8`
  (`printf` con `%d`) según design §Decisions-1; verificar suite nueva verde
  para ids 7–8 y suite C-01 sin regresiones.
- [x] 4.4 TRIANGULATE + REFACTOR ids 7–8: segundo caso incorrecto por id que
  debe seguir rechazado; verificar suite verde tras cada paso.

## 5. Fix id 168 (chequeo general de indentación + pipeline)

- [x] 5.1 Triage regla-vs-dato id 168: comparar canónica vs enunciado/starter;
  si la canónica no responde al enunciado, NO tocar `data.js`, registrar el
  hallazgo, excluir el id y consultar a Belén; solo con canónica correcta
  seguir a 5.2. Verificar triage documentado.
- [x] 5.2 RED: tests canónica-aceptada + pipeline-ausente-rechazado para id
  168; verificar que la canónica falla antes del fix (hoy: error de
  indentación línea 3).
- [x] 5.3 GREEN: tolerar líneas de continuación en `checkIndentation` +
  chequeo de presencia del pipeline (`Files.lines`, `filter`, `forEach`)
  según design §Decisions-2; verificar suite nueva verde para id 168 y suite
  C-01 sin regresiones.
- [x] 5.4 TRIANGULATE + REFACTOR id 168: test de indentación realmente rota
  que SIGUE rechazada + segundo pipeline incorrecto rechazado; verificar
  suite verde tras cada paso.

## 6. Cierre: matriz regenerada + alcance intacto

- [x] 6.1 Re-correr `node tools/audit-validator.js` (sin modificar el script)
  y verificar que `docs/validator-audit.md` muestra canónica aceptada en los
  7 ids y el invariante 52/208 pasando.
- [x] 6.2 Correr ambas suites (`node --test tools/*.test.js`) y verificar
  todo verde (14+ tests nuevos + suite C-01).
- [x] 6.3 Verificar alcance intacto: `git status` muestra solo `validator.js`,
  `tools/validator-fix-rules.test.js`, `docs/validator-audit.md` y
  `openspec/changes/c-10-validator-fix-rules/`; ninguna regla de otro id
  tocada, ningún contenido/ID/conteo modificado, sin secretos, backend sin
  tocar, sin commit/push.

## 7. Limpieza futura (NO este change)

- Los helpers viejos de los case 3–8 quedaron sin uso (`validateIntVariable`,
  `validateStringVariable`, `validateSum`, `validateIfElse`,
  `validateComparison`, `validateForLoop` + `simulateIfElse`,
  `simulateComparison`): su remoción queda pendiente para un futuro change de
  limpieza, NO este (diff mínimo).
- Desviación fase B (aprobada con las adiciones): la rama `default` para el
  id 168 acepta variantes de formato con el pipeline presente
  (`Files.lines` + `.filter(` + `.forEach(` y chequeos generales limpios);
  los tests de variación lo fijan.
