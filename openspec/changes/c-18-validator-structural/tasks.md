# Tasks — C-18 validator-structural

> Fase 1 (grupo 1) es SOLO auditoría, sin tocar `validator.js`. La Fase 2
> (grupos 2–5) empieza únicamente tras la revisión de Belén (gate 1.4).
> Todo código nuevo va por TDD con `node --test`, sin framework nuevo.

## 1. FASE 1 — Auditoría por ejercicio (sin código)

- [ ] 1.1 Extender `tools/audit-validator.js` (solo lectura) para emitir por ejercicio: exige-nombre-fijo, exige-texto-fijo, exige-formato; verificar corriéndolo y que el invariante 52/208 siga pasando
- [ ] 1.2 Redactar `docs/validator-strictness.md` con veredicto de los 208 ejercicios (id, lessonId, qué exige de más, qué está bien, propuesta de regla) incluyendo ids 1–8 y resolviendo la tensión id 5 (texto fijo en consigna vs. texto libre del roadmap); verificar que los 208 ids están cubiertos con `node -e` contando filas
- [ ] 1.3 Re-correr `tools/audit-validator.js` y verificar que `docs/validator-audit.md` regenerada no cambia veredictos (Fase 1 no toca reglas) y que `git status` no muestra diff en `data.js`/`validator.js`
- [ ] 1.4 GATE: Belén revisa `docs/validator-strictness.md` y firma qué textos/nombres quedan fijos; verificar con su OK explícito antes de seguir (sin este OK no empieza la Fase 2)

## 2. Normalizador/tokenizer (TDD)

- [ ] 2.1 Tests RED del normalizador (quitar `//` y `/* */`, preservar strings, colapsar formato) con ≥2 casos por comportamiento incluyendo escapes; verificar que fallan sin implementación (`node --test` en rojo)
- [ ] 2.2 Implementar el normalizador hasta GREEN y verificar suite en verde + 208 canónicas intactas (ningún veredicto cambia aún)
- [ ] 2.3 Tests de equivalencia por renombrado consistente (biyectivo) + allowlist de nombres fijos por ejercicio; verificar GREEN y que un renombrado inconsistente se rechaza

## 3. Comparador estructural + mensajes conceptuales (TDD)

- [ ] 3.1 Tests RED del comparador por tokens (texto libre/fijo según veredicto Fase 1, números y operadores estrictos) con canónica + variante válida + trampa en comentario por cada rama; verificar rojo inicial
- [ ] 3.2 Implementar el comparador hasta GREEN para los 208 ejercicios y verificar que las 208 soluciones canónicas de `data.js` son aceptadas (`node --test` verde + barrido de canónicas)
- [ ] 3.3 Migrar mensajes a plantillas conceptuales sin respuesta (código de concepto → texto fijo) y verificar con `git grep` que ningún mensaje contiene literales de `data.js` + tests de cada mensaje
- [ ] 3.4 Reutilizar las sondas de `tools/audit-validator.js` como tests de regresión (comentario-con-respuesta, codigo-muerto-con-patron, literal-con-patron rechazados) y verificar que las 3 familias de trampa se rechazan en los 208 ejercicios

## 4. Reglas ids 1–8 + indentación estructural (TDD)

- [x] 4.1 Tests RED/GREEN id 5: cualquier texto en `println` aceptado, sin impresión rechazado, mensaje conceptual exacto "falta imprimir algo con System.out.println"; verificar los 3 casos en verde
  - Lote 1 (2026-10-04): hecho en `tools/validator-structural-lot1.test.js` (canónica + 3 variantes + 10 trampas del id 5 en verde) + suite completa 228/228 + 208/208 canónicas.
  - Ajuste id5-print (2026-10-04, decisión Belén): id 5 acepta `print`/`println`/`printf` con texto libre (concepto = mostrar texto); regresión ids 6-7 intacta. Tests en `tools/validator-structural-lot1.test.js` (describe 'c-18 ajuste id5': 3 aceptaciones + 4 regresiones) + suite 264/264 + 208/208 canónicas.
- [x] 4.2 Tests RED/GREEN ids 1–4: indentación +4 por bloque aceptada, mal indentada rechazada, contenido equivalente con otro formato aceptado; verificar en verde sin igualdad con la solución
  - Lote 1 (2026-10-04): ids 1–3 con indentación estructural relativa (+4/bloque, ids 1–3 saltean la puerta cruda); id 4 por tokens con renombrado consistente + puerta cruda intacta. Todo en `tools/validator-structural-lot1.test.js` + suite 228/228 + 208/208 canónicas.
- [ ] 4.3 Tests RED/GREEN ids 6–8 según veredictos Fase 1 (textos fijos donde Belén firmó) + id 168 con líneas de continuación; verificar canónicas aceptadas e incorrectas rechazadas
  - Lote 1 (2026-10-04, parcial): ids 6–8 hechos con textos libres por diseño aprobado (dos println / print→println / printf %d+e) en `tools/validator-structural-lot1.test.js`. Falta solo el id 168.
- [x] 4.4 Nombres libres de clase (decisión Belén 2026-10-04): ids 3 (P) y 5 (Hola) aceptan cualquier nombre válido; id 1 (Ejemplo) sigue fijo porque la lección 1 lo usa; id 5 exige clase pública; mensajes sin el nombre correcto; veredicto 1–8 + auditoría 208 en la respuesta del turno (TDD RED→GREEN, suite verde + 208/208 canónicas)
  - Hecho en `tools/validator-structural-lot1.test.js` (bloque "nombre libre de clase": 8 tests) + `tools/validator-fix-rules.test.js` (WRONG[5] actualizado a clase no pública); `validator.js`: `matchClassDecl`/`isValidJavaClassName` + mensajes conceptuales.
  - Ajuste mensaje-comillas (2026-10-04, decisión Belén): nombre no declarado ni entrecomillado en println/print sugiere entre comillas dobles (pista conceptual, sin respuesta). Tests en `tools/validator-structural-lot1.test.js` (describe 'c-18 ajuste mensaje': id 5 + id 6); `validator.js`: `checkPrintableArg`.

## 5. Cierre e integración

- [ ] 5.1 Re-correr `tools/audit-validator.js`, regenerar `docs/validator-audit.md` y verificar matriz nueva + invariante 52/208 en verde + `git status` sin diff en `data.js`
- [ ] 5.2 Verificación manual en navegador (móvil + desktop): resolver un ejercicio de cada familia (texto libre, texto fijo, lección 1, pipeline 168), comprobar mensajes conceptuales y cero errores de consola; registrar checklist en el change
