# Tasks — C-18 validator-structural

> Fase 1 (grupo 1) es SOLO auditoría, sin tocar `validator.js`. La Fase 2
> (grupos 2–5) empieza únicamente tras la revisión de Belén (gate 1.4).
> Todo código nuevo va por TDD con `node --test`, sin framework nuevo.

## 1. FASE 1 — Auditoría por ejercicio (sin código)

- [x] 1.1 Extender `tools/audit-validator.js` (solo lectura) para emitir por ejercicio: exige-nombre-fijo, exige-texto-fijo, exige-formato; verificar corriéndolo y que el invariante 52/208 siga pasando
- [x] 1.2 Redactar `docs/validator-strictness.md` con veredicto de los 208 ejercicios (id, lessonId, qué exige de más, qué está bien, propuesta de regla) incluyendo ids 1–8 y resolviendo la tensión id 5 (texto fijo en consigna vs. texto libre del roadmap); verificar que los 208 ids están cubiertos con `node -e` contando filas
- [x] 1.3 Re-correr `tools/audit-validator.js` y verificar que `docs/validator-audit.md` regenerada no cambia veredictos (Fase 1 no toca reglas) y que `git status` no muestra diff en `data.js`/`validator.js`
- [x] 1.4 GATE: Belén revisa `docs/validator-strictness.md` y firma qué textos/nombres quedan fijos; verificar con su OK explícito antes de seguir (sin este OK no empieza la Fase 2)

## 2. Normalizador/tokenizer (TDD)

- [x] 2.1 Tests RED del normalizador (quitar `//` y `/* */`, preservar strings, colapsar formato) con ≥2 casos por comportamiento incluyendo escapes; verificar que fallan sin implementación (`node --test` en rojo)
- [x] 2.2 Implementar el normalizador hasta GREEN y verificar suite en verde + 208 canónicas intactas (ningún veredicto cambia aún)
- [x] 2.3 Tests de equivalencia por renombrado consistente (biyectivo) + allowlist de nombres fijos por ejercicio; verificar GREEN y que un renombrado inconsistente se rechaza

## 3. Comparador estructural + mensajes conceptuales (TDD)

- [x] 3.1 Tests RED del comparador por tokens (texto libre/fijo según veredicto Fase 1, números y operadores estrictos) con canónica + variante válida + trampa en comentario por cada rama; verificar rojo inicial
- [x] 3.2 Implementar el comparador hasta GREEN para los 208 ejercicios y verificar que las 208 soluciones canónicas de `data.js` son aceptadas (`node --test` verde + barrido de canónicas)
- [x] 3.3 Migrar mensajes a plantillas conceptuales sin respuesta (código de concepto → texto fijo) y verificar con `git grep` que ningún mensaje contiene literales de `data.js` + tests de cada mensaje
- [x] 3.4 Reutilizar las sondas de `tools/audit-validator.js` como tests de regresión (comentario-con-respuesta, codigo-muerto-con-patron, literal-con-patron rechazados) y verificar que las 3 familias de trampa se rechazan en los 208 ejercicios

## 4. Reglas ids 1–8 + indentación estructural (TDD)

- [x] 4.1 Tests RED/GREEN id 5: cualquier texto en `println` aceptado, sin impresión rechazado, mensaje conceptual exacto "falta imprimir algo con System.out.println"; verificar los 3 casos en verde
  - Lote 1 (2026-10-04): hecho en `tools/validator-structural-lot1.test.js` (canónica + 3 variantes + 10 trampas del id 5 en verde) + suite completa 228/228 + 208/208 canónicas.
  - Ajuste id5-print (2026-10-04, decisión Belén): id 5 acepta `print`/`println`/`printf` con texto libre (concepto = mostrar texto); regresión ids 6-7 intacta. Tests en `tools/validator-structural-lot1.test.js` (describe 'c-18 ajuste id5': 3 aceptaciones + 4 regresiones) + suite 264/264 + 208/208 canónicas.
- [x] 4.2 Tests RED/GREEN ids 1–4: indentación +4 por bloque aceptada, mal indentada rechazada, contenido equivalente con otro formato aceptado; verificar en verde sin igualdad con la solución
  - Lote 1 (2026-10-04): ids 1–3 con indentación estructural relativa (+4/bloque, ids 1–3 saltean la puerta cruda); id 4 por tokens con renombrado consistente + puerta cruda intacta. Todo en `tools/validator-structural-lot1.test.js` + suite 228/228 + 208/208 canónicas.
- [x] 4.3 Tests RED/GREEN ids 6–8 según veredictos Fase 1 (textos fijos donde Belén firmó) + id 168 con líneas de continuación; verificar canónicas aceptadas e incorrectas rechazadas
  - Lote 1 (2026-10-04, parcial): ids 6–8 hechos con textos libres por diseño aprobado (dos println / print→println / printf %d+e) en `tools/validator-structural-lot1.test.js`. Id 168 hecho en el lote 12 (6.11).
- [x] 4.4 Nombres libres de clase (decisión Belén 2026-10-04): ids 3 (P) y 5 (Hola) aceptan cualquier nombre válido; id 1 (Ejemplo) sigue fijo porque la lección 1 lo usa; id 5 exige clase pública; mensajes sin el nombre correcto; veredicto 1–8 + auditoría 208 en la respuesta del turno (TDD RED→GREEN, suite verde + 208/208 canónicas)
  - Hecho en `tools/validator-structural-lot1.test.js` (bloque "nombre libre de clase": 8 tests) + `tools/validator-fix-rules.test.js` (WRONG[5] actualizado a clase no pública); `validator.js`: `matchClassDecl`/`isValidJavaClassName` + mensajes conceptuales.
  - Ajuste mensaje-comillas (2026-10-04, decisión Belén): nombre no declarado ni entrecomillado en println/print sugiere entre comillas dobles (pista conceptual, sin respuesta). Tests en `tools/validator-structural-lot1.test.js` (describe 'c-18 ajuste mensaje': id 5 + id 6); `validator.js`: `checkPrintableArg`.

## 5. Cierre e integración

- [x] 5.1 Re-correr `tools/audit-validator.js`, regenerar `docs/validator-audit.md` y verificar matriz nueva + invariante 52/208 en verde + `git status` sin diff en `data.js`
- [x] 5.2 Verificación manual en navegador (móvil + desktop): resolver un ejercicio de cada familia (texto libre, texto fijo, lección 1, pipeline 168), comprobar mensajes conceptuales y cero errores de consola; registrar checklist en el change

## 6. Lotes 2–15 — motor estructural por tokens + reglas ids 9–208 (2026-10-05, automático)

> Motor en `validator.js`: `tokenizeJava` (textos/`"""`/escapes/Unicode),
> `normalizeStructToks` (paréntesis de ternario, llaves opcionales de
> 1 instrucción en if/else/while/for, orden de modificadores),
> `structuralMatchTokens` (subsecuencia + renombrado consistente y
> biyectivo + textos fijos/libres), vigilancias (`checkCallParens`,
> `checkEmptyParens`, `checkDiamond`, `checkNoUndeclared`,
> `checkBareMethods`, balance y textos sin cerrar). Reglas por id en
> `STRUCT_RULES` (ctx/nombres de contexto, free/renombrables,
> strings, diamond, bare, alts, custom, missing conceptual).
> Tests: `tools/validator-structural-lot{2..15}.test.js` +
> `tools/validator-structural-engine.test.js`.

- [x] 6.1 Lote 2 (ids 9–30): RED 99 fallos → GREEN 263/263; suite 534/534; 208/208 canónicas; `git diff --quiet -- data.js script.js` limpio
- [x] 6.2 Lote 3 (ids 31–40, switch + Scanner): RED 42 → GREEN 120/120; suite 654/654; 208/208; diff limpio
- [x] 6.3 Lote 4 (ids 41–58, arrays/matrices/strings): GREEN 216/216 (RED puntual verificado con reglas retiradas); suite 870/870 con motor endurecido (call-parens + llaves vacías); 208/208; diff limpio
- [x] 6.4 Lote 5 (ids 59–70, métodos/clases): RED 57 → GREEN 144/144 (`alts` para orden de atributos/asignaciones); suite 1014/1014; 208/208; diff limpio
- [x] 6.5 Lote 6 (ids 71–84, herencia/interfaces/static): RED 66 → GREEN 167/167 (`sortModifierRuns` + alt métodos 79); suite 1181/1181; 208/208; diff limpio
- [x] 6.6 Lote 7 (ids 85–100, inner/enum/equals/genéricos/record/sealed/pattern/textblock/yield): RED 75 → GREEN 187/187 (genérico `Tipo nombre` declarado + 99 por contenido); suite 1368/1368; 208/208; diff limpio
- [x] 6.7 Lote 8 (ids 101–120, colecciones): RED 87 → GREEN 240/240 (Unicode ñ + `checkDiamond` + alt puts 111); suite 1608/1608; 208/208; diff limpio
- [x] 6.8 Lote 9 (ids 121–134, excepciones): RED 63 → GREEN 167/167; suite 1775/1775; 208/208; diff limpio
- [x] 6.9 Lote 10 (ids 135–151, Optional/lambdas/refs): RED 76 → GREEN 204/204; suite 1979/1979; 208/208; diff limpio
- [x] 6.10 Lote 11 (ids 152–161, streams): RED 49 → GREEN 120/120 (parámetros lambda declarados + free n/s); 1 regresión de lote 10 por paréntesis vacíos → `checkEmptyParens` + alineación; suite 2099/2099; 208/208; diff limpio
- [x] 6.11 Lote 12 (ids 162–168, ficheros): RED 26 → GREEN 84/84 (puerta 168 endurecida: sin comentarios + vigilancias, tests previos intactos); suite 2183/2183; 208/208; diff limpio
- [x] 6.12 Lote 13 (ids 169–188, hilos): RED 93 → GREEN 239/239; suite 2422/2422; 208/208; diff limpio
- [x] 6.13 Lote 14 (ids 189–199, patrones/SOLID): RED 54 → GREEN 130/130 (free o/c + alt 198); suite 2552/2552; 208/208; diff limpio
- [x] 6.14 Lote 15 (ids 200–208, pruebas/mocks): RED 41 → GREEN 105/105 (`bare` 201 + custom 208 por ideas); suite 2657/2657; 208/208; diff limpio
- [x] 6.15 Motor: `tools/validator-structural-engine.test.js` (26 tests: tokenizer, normalizaciones, renombrado, vigilancias, meta-mensajes); suite total 2683/2683; `git diff --quiet -- data.js script.js` limpio
- [x] 6.16 Hallazgo del browser-check (id 5 printf con formato): `printf("%s", x)` se rechazaba (solo valía un argumento); `callDefect` ahora valida formato + args y `_requirePrintableIn` unifica por `callDefect` (3 tests nuevos en lote 1); suite 2686/2686
- [x] 6.17 `tools/browser-check.js` (Playwright, dev-only, `node tools/browser-check.js`): 45/45 casos (lote 1 + 2 por lote 2–15) por el flujo real, sin errores JS propios en consola

## 7. Decisiones dudosas (una línea cada una)

- D-01 (205): la consigna pide `testSuma` pero la solución trae `testFalla`: vale el nombre de la solución (la canónica tiene que pasar).
- D-02 (208): su consigna pide "solo comentarios": se validan 4 ideas en el crudo (excepción documentada a "comentario nunca aprueba"); un pegado sin ideas se rechaza.
- D-03 (renombrado): el mismo nombre en ámbitos distintos (p. ej. param `x` + lambda `o`) con nombres mezclados se rechaza: lectura segura, falso negativo residual.
- D-04 (61/79/111/198): el orden de miembros del mismo tipo (atributos, métodos, puts de mapa, interfaces) no es concepto y se acepta en cualquier orden; el resto del orden es estricto.
- D-05 (26-printf): el formato exige salto de línea (`\n`/`%n`); sin salto la salida es otra y se rechaza.
- D-06 (45/55 y formas intermedias): `int n = nums.length; println(n)` y encadenar `append` se rechazan: equivalencia estructural, no semántica (diseño §Trade-off).
- D-07 (201): `public void setUp()` se rechaza: la consigna fija visibilidad de paquete.
- D-08 (extra `(` tras nombre usado, p. ej. `nums.length()`): se rechaza aunque el resto coincida (llamada que no existe así).
- D-09 (174) REVISADA en el cierre: `X++` = `X += 1` = `X = X + 1` (solo con 1 literal) donde la consigna no exige la forma `++`; estrictos 21, 22, 23. Parentesis de mas pero validos se aceptan (incl. id 4). Tests: `tools/validator-d09-equivalence.test.js`; trampa 174 de lote 13 actualizada a `+= 2`.

## 8. Evidencia de cierre (2026-10-21)

- Suite completa `node --test tools/*.test.js`: 2720/2720 en verde; `node tools/audit-validator.js`: 208 ejercicios, invariante 52/208 PASA (ok=198, real=9, cheat=1); `tools/browser-check.js`: 45/45 sin errores JS propios; `data.js`/`script.js` sin diff.
- 1.4 firmado por Belen (2026-10-21): aprueba `docs/validator-strictness.md`. 5.2 verificado por Belen en escritorio y ancho de telefono para el validador; los problemas de diseno en celular NO son del validador y se tratan en C-11b.
