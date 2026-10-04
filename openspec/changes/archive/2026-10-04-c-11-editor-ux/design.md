# Design — c-11-editor-ux

## Context

Ver proposal.md (Why). Estado actual verificado por inspección READ-ONLY:

- Editor: `script-enhanced.js:19-33` inyecta `textarea#exercise-code` +
  botones ("Verificar Solución", "💡 Ver Pista", "Reiniciar") +
  `#exercise-result` + `#exercise-hint` (oculto inline). Tab inserta 4
  espacios (`:54-72`). Sin gutter, sin guías. Estilos: `.exercise-textarea`
  (`styles.css:795-813`, monoespaciada `Fira Code`, `line-height: 1.6`) y
  `.exercise-hint` (`:872-879`).
- Pista: `showHint` (`:409-414`) muestra; `resetExercise` (`:416-423`) oculta;
  `displayValidationResult` (`:210-326`) NUNCA toca `#exercise-hint` → tras
  un acierto la pista queda visible si se había pedido. `openExercise`
  reconstruye el HTML con la pista oculta (correcto por defecto).
- `@import` Google Fonts en `styles.css:101`, tras `:root`, reset, `body` y
  `@keyframes` → el navegador lo ignora con aviso; debe ir primero (solo
  `@charset`/`@layer` pueden precederlo).
- Mensajes "no coincide": dos fuentes. (a) `validateByRules` rama
  solo-indentación (`script-enhanced.js:191-194`, lección 1): string exacto
  `'La indentación no coincide con la solución esperada'` — el que ve el
  estudiante en el camino degradado (C-04). (b) `ai-validator.js:158`: mismo
  texto, pero ese módulo está DESACTIVADO desde C-02 (ver Decisions-4).
  `validator.js` SÍ cuenta llaves (`checkBraces`, `:89-96`: "Llaves
  desbalanceadas (N aperturas, M cierres)") pero su mensaje no dice de más /
  de menos, y la rama solo-indentación ni siquiera lo invoca.
- Tests: patrón `vm` sin dependencias (`tools/validator-fix-rules.test.js:16-30`,
  `node --test`) reutilizable para el cálculo de llaves. Invariantes
  52/208 e ids: no se tocan (AGENTS.md "Contenido intacto": contenido solo
  en C-16 — este change NO toca `data.js`).

## Goals / Non-Goals

**Goals:**

- Gutter + guías sin librerías con gate de parada explícito si el enfoque
  no-lib resulta inviable.
- Pista con semántica ocultar-en-éxito / mostrar-en-fallo / a-pedido.
- `@import` primero sin cambiar tipografías.
- Mensaje de llaves solo-texto con veredicto idéntico + tests propios del
  cálculo puro.

**Non-Goals (diseño):**

- No se rediseña el editor (colores, layout del modal: C-12), no se lista ni
  navega por lección (C-11b), no se cambian reglas (C-10 cerrado), no se
  elimina la dependencia de Google Fonts (decisión de C-12; aquí solo se
  corrige el orden del `@import`).

## Decisions

1. **Gutter: columna hermana sincronizada por JS + guías por fondo CSS
   (alternativa: espejo `pre` transparente detrás del textarea — descartada:
   más fragile con IME/zoom móvil; alternativa: librería — PROHIBIDA por
   scope, dispara el gate).** En `openExercise`, envolver el textarea en
   `.editor-with-gutter` con `<div class="line-numbers" aria-hidden="true">`
   + el `textarea` existente; en `styles.css`, gutter con la MISMA
   `font-family`/`font-size`/`line-height`/`padding-block` que el textarea
   (métricas idénticas = alineación sin medición JS). Sincronizar en eventos
   `input`+`scroll`: `gutter.scrollTop = textarea.scrollTop` y regenerar
   números por conteo de `\n`. Guías: `repeating-linear-gradient` como fondo
   del contenedor con paso calibrado a múltiplos de la indentación (4ch con
   la fuente monoespaciada), tono sutil del tema. El Tab-a-4-espacios
   existente (`:58-70`) se conserva. **Gate:** si en verificación manual las
   guías no alinean en móvil+desktop con la fuente cargada y su fallback
   `monospace`, el apply SE DETIENE y consulta a Belén antes de agregar nada
   (spec lo exige: "SHALL detenerse").
2. **Pista: sincronizar en `displayValidationResult`, no en `showHint`
   (alternativa: auto-mostrar solo en fallo — insuficiente: dejaría la pista
   visible tras un acierto posterior).** Rama éxito (`:279-292`): forzar
   `#exercise-hint` a `display:none`. Rama fallo (`:311-325`): poblar con
   `'💡 Pista: ' + exercise.hint` y mostrar (reutiliza el texto exacto de
   `showHint`, que sigue como vía a-pedido). `openExercise`/`resetExercise`
   ya dejan la pista oculta: sin cambios. Verificación manual (visual, sin
   tests de lógica): acierto→oculta, fallo→visible, "Ver Pista"→visible,
   reabrir/reiniciar→oculta.
3. **`@import` a la línea 1 de `styles.css` (alternativa: eliminar la fuente
   externa — descartada: cambia tipografía = alcance C-12; alternativa:
   `@font-face` local — descartada: agrega binarios sin decisión de diseño).**
   Movimiento puro de la línea 101 al inicio; verificación manual: cero avisos
   de `@import` en consola + fuentes aplicadas igual que antes. Nota para
   C-12: la URL externa a Google Fonts sigue existiendo (privacidad/rendimiento
   a decidir en el rediseño).
4. **Mensaje de llaves: helper puro + sufijo, reglas intactas; SÍ se necesitan
   tests del cálculo (alternativa: solo reescribir el texto — descartada: no
   puede distinguir de-más/de-menos sin contar; alternativa: reutilizar
   `checkBraces` — insuficiente: empuja "desbalanceadas (N, M)" sin dirección
   y la rama solo-indentación no pasa por `validator.js`).** Nuevo
   `braceNotice(code)` puro (conteo `{` vs `}` ignorando strings/comentarios
   de línea en lo razonable; devuelve `null` si balanceado, o la dirección:
   "parece faltar una llave de cierre" / "parece sobrar una llave de cierre"
/  apertura). Vive junto a la validación (candidato: `validator.js`, expuesto
   al scope global como `JavaValidator` para que `validateByRules` lo use sin
   duplicar) y se ANEXA al mensaje existente de la rama solo-indentación; el
   `success` boolean se calcula ANTES y no se toca. `ai-validator.js:158` NO
   se toca: módulo desactivado desde C-02, sin camino alcanzable desde la UI;
   tocarlo sería cambio muerto (registrado aquí para no reabrirlo en apply).
   **Tests SÍ requeridos** (única lógica nueva del change): `tools/` nuevo
   `*.test.js` con el patrón `vm` de C-10 (`node --test`, cero deps):
   balanceado→`null`, falta cierre, sobra cierre, falta apertura, más ≥1 caso
   de veredicto-inmutable (mismas entradas dan mismo `success` con y sin
   sufijo). Todo lo demás es visual → verificación manual descrita en tasks.
5. **Sin skill de registry aplicable** (gobernado por AGENTS.md; capacidad
   faltante anotada para el orquestador — el change es Vanilla/CSS/JS plano).

## Risks / Trade-offs

- [Riesgo] Métricas gutter vs textarea divergen con fallback `monospace`
  (Fira Code lenta/bloqueada) → Mitigación: mismas variables de fuente en
  ambas clases + verificación con fuentes bloqueadas (DevTools offline-font);
  si diverge, gate a Belén (no parche con librería).
- [Riesgo] `repeating-linear-gradient` en `ch` no calza si el usuario cambia
  tamaño de fuente/zoom → Mitigación: guías sutiles (decorativas, 1px,
  baja opacidad); el requisito duro es el gutter, las guías son ayuda visual.
- [Riesgo] Conteo de llaves ingenuo cuenta `{`/`}` dentro de strings
  (`"{"`) → Mitigación: helper ignora contenidos entre comillas simples/
  dobles y comentarios `//` en el conteo; documentado como heurística de
  mensaje (el veredicto no depende de él, así que un falso aviso nunca
  aprueba ni reprueba).
- [Riesgo] Tocar `displayValidationResult` roza el mensaje de degradación de
  C-04 → Mitigación: no se toca `noticeHtml` ni el contrato
  `frontend-no-backend`; solo se agregan líneas de pista.
- [Trade-off] Tests solo para el cálculo de llaves; gutter/pista/`@import`
  van por verificación manual con checklist (cambio visual, precedente
  C-03/C-07) → aceptado por constraint del usuario.

## Migration Plan

Apply (detalle en tasks.md): helper + tests en verde PRIMERO (única lógica),
luego gutter/guías, pista, `@import`; verificación manual móvil+desktop con
checklist; **mostrar el diff a Belén y esperar su OK antes de dar por hecho
el apply** (gate registrado en tasks.md). Rollback: archivos trackeados
(`git checkout -- script-enhanced.js styles.css validator.js tools/...`);
sin commit/push sin pedido explícito. C-11b/C-12 corren después, sin
interferencia (archivos disjuntos en su mayor parte; el gutter es base para
el rediseño C-12).

## Open Questions

Ninguna que cambie specs, enfoque o tasks. Capacidad faltante a notar:
sin skill de registry aplicable (gobernado por AGENTS.md).
