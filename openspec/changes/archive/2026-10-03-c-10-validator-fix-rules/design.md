# Design — c-10-validator-fix-rules

## Context

Ver propuesta (`proposal.md` — Why) y matriz C-01 (`docs/validator-audit.md`).
Estado relevado en exploración solo-lectura (nada modificado):

- `validator.js:110-149`: el `switch` tiene casos 1–8 escritos para una
  versión vieja de `data.js` (p. ej. `case 3` exige `int edad = 25`, pero la
  canónica actual del id 3 es «Múltiples Métodos» con dos métodos; `case 5`
  exige `int resultado = a + b`, pero la canónica del id 5 es «Hola Mundo»;
  y así con 4, 6, 7, 8). Los chequeos generales (`checkIndentation`,
  `checkBasicSyntax`, etc.) corren antes y también pueden rechazar: el id 168
  falla ahí (línea de continuación con 10 espacios, no múltiplo de 4).
- `validator.js:151-163`: rama `default` por `includes()` (ids 9–208, fuera
  de alcance: funciona y es engañable por diseño conocido, lo verá C-05/C-06).
- Casos 1–2 pasan hoy por accidente (sus chequeos genéricos coinciden con la
  canónica actual) aunque también están desalineados semánticamente: NO se
  tocan (fuera de alcance), se dejan como observación.
- `data.js`: soluciones canónicas ids 3–8, 168 extraídas y citadas en
  §Decisions (son la especificación de cada fix).
- `tools/audit-validator.js` + `tools/audit-validator.test.js`: patrón de
  carga (`vm.runInNewContext`, sin dependencias) y de tests `node:test` a
  reutilizar para el rerun de cierre.

## Goals / Non-Goals

**Goals:**

- Alinear las 7 reglas con su canónica actual, con 14+ tests TDD que lo
  demuestren (canónica aceptada + incorrecta rechazada por id).
- Dejar una rama de triage explícita regla-vs-dato que proteja `data.js`.
- Regenerar la matriz como evidencia de cierre reutilizando el audit C-01.

**Non-Goals:**

- Endurecer contra engaño (`includes`, sondas): lo decide C-05/C-06.
- Reescribir el validador o cambiar su arquitectura por casos.
- Tocar casos 1–2, rama `default`, contenido, IDs, conteos, backend, publish.

## Decisions

1. **Estrategia por id: reescribir el `case`, no parchar la regex vieja.**
   Cada `case 3–8` valida hoy un ejercicio que ya no existe en ese id; ajustar
   la regex vieja conservaría una aserción equivocada. Se reemplaza el cuerpo
   del `case` por chequeos derivados de la canónica actual:
   - id 3 (dos métodos `a`/`b` con `println`): exigir ambas declaraciones de
     método + ambas impresiones; rechaza: un solo método o ninguno.
     Alternativa descartada: exigir el texto exacto — frágil ante espacios.
   - id 4 (bucle `for i<5` + `if i%2==0` + `println(i)`): exigir `for`,
     condición con `% 2 == 0` e impresión; rechaza: bucle sin condición par.
   - id 5 (`Hola, Java!` en `main`): exigir `System.out.println` con el
     literal esperado (tolerando formato de clase/main); rechaza: impresión
     ausente o con otro texto.
   - id 6 (dos `println` «Línea 1»/«Línea 2»): exigir ≥2 `println` con ambos
     literales; rechaza: una sola línea.
   - id 7 (`print("Hola ")` + `println("Mundo")`): exigir `System.out.print`
     sin `ln` para el primer tramo + `println` para el segundo; rechaza: dos
     `println` o ausencia de `print`.
   - id 8 (`printf("Edad: %d", e)`): exigir `System.out.printf` con
     especificador `%d`; rechaza: `println` en lugar de `printf`.
   - id 168 (`Files.lines` + `filter` + `forEach`, con continuación
     indentada a 10 espacios): el fix vive en el chequeo general
     (decisión 2), más un chequeo de presencia del pipeline
     (`Files.lines`, `filter`, `forEach`); rechaza: pipeline ausente.
2. **Fix del id 168 en `checkIndentation`, no en el `case` (no hay `case`
   168: cae en `default`).** La canónica es correcta; la regla general es la
   demasiado estricta (exige múltiplo de 4 incluso en líneas de
   continuación). Se toleran líneas de continuación (la línea anterior
   termina sin `;`/`{`/`}` completos o abre paréntesis) manteniendo la
   exigencia para líneas de bloque normales. Alternativa descartada:
   eximir al id 168 en `validate()` — escondería el bug general que también
   puede morder a otros ejercicios con continuaciones.
   El test de triangulación del 168 incluye además un caso de indentación
   realmente rota que SIGUE rechazado (la tolerancia no vuelve laxo el
   chequeo).
3. **Rama de triage regla-vs-dato antes de cada fix.** Por cada id, el apply
   compara canónica vs enunciado/starter: si la canónica no responde al
   enunciado, NO se toca `data.js` (regla dura Contenido intacto): se registra
   el hallazgo, se excluye el id del fix y se consulta a Belén. Solo si la
   canónica es correcta se reescribe la regla. Alternativa descartada:
   corregir `data.js` de paso — violaría la regla dura y el scope atómico.
4. **Tests nuevos en `tools/validator-fix-rules.test.js` (`node:test` +
   `assert/strict`, cero dependencias).** Reutiliza el harness de carga de
   C-01 (`vm.runInNewContext` sobre `data.js`/`validator.js`). 14+ tests:
   por id, canónica→válido e incorrecta→inválida con mensaje en español; más
   1 test de que la indentación rota sigue rechazada (decisión 2) y 1 test del
   invariante 52/208 post-fix. Sin aserciones triviales (cada test ejerce
   `validate()` real). Alternativa descartada: extender
   `audit-validator.test.js` — mezclaría el audit de solo-lectura C-01 con
   el fix C-10; archivo propio, commit propio.
5. **Cierre regenerando la matriz con el script C-01 sin modificarlo.**
   `node tools/audit-validator.js` re-corre sobre el `validator.js`
   corregido y reescribe `docs/validator-audit.md`; el test de cierre exige
   canónica aceptada en los 7 ids + invariante pasando. Si el script C-01
   necesitara cambios para correr, es señal de regresión de formato, no un
   paso del change. Alternativa descartada: editar la matriz a mano —
   rompería la trazabilidad script→docs que C-01 estableció.

## Risks / Trade-offs

- [Riesgo] Algún `case 3–8` comparte helper con validación general que al
  corregir rompe otro id → Mitigación: safety net TDD (suite C-01 en verde
  antes de tocar nada) + test de invariante en la suite nueva; cualquier
  `case 1–2` que deje de pasar por efecto colateral se reporta, no se
  "arregla" de paso.
- [Riesgo] La tolerancia de continuación (decisión 2) acepta indentación
  realmente mala → Mitigación: test dedicado de indentación rota que debe
  seguir rechazada; regla mínima (solo líneas de continuación).
- [Riesgo] Triage encuentra error en `data.js` y el change queda parcial →
  Mitigación: es el comportamiento diseñado (rama explícita en spec +
  tasks); el apply se detiene en ese id y consulta, no improvisa.
- [Trade-off] Reglas por presencia de patrones siguen engañables
  (comentario con la respuesta pasa). Aceptado: fuera de alcance; C-05/C-06
  deciden con la matriz regenerada como entrada.
- [Trade-off] Casos 1–2 quedan semánticamente desalineados aunque pasen.
  Aceptado y documentado como observación para C-05/C-06, no para este
  change (scope atómico).

## Migration Plan

Sin despliegue ni migración: cambia `validator.js` (runtime offline local)
+ tests + docs. Rollback = revertir el commit único del change. La matriz
regenerada queda versionada como evidencia.

## Open Questions

Ninguna que bloquee: las 7 canónicas están extraídas y los 7 mensajes de
rechazo actual están caracterizados (ver Context). Si el triage regla-vs-dato
abre una duda de contenido, el apply la escala a Belén por diseño.
