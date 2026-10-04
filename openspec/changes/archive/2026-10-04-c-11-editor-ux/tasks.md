# Tasks â€” c-11-editor-ux

> Nota: cambio visual con verificaciÃ³n MANUAL, sin tests de lÃ³gica nueva â€”
> EXCEPTO el cÃ¡lculo del aviso de llaves, que lleva sus propios tests
> (`node --test`, sin dependencias nuevas). NUNCA tocar `data.js` ni
> contenido; NUNCA cambiar reglas de validaciÃ³n; sin commit/push.

## 1. Aviso de llaves (Ãºnica lÃ³gica nueva â€” con tests)

- [x] 1.1 Escribir el test del cÃ¡lculo de llaves en `tools/brace-notice.test.js`
  (patrÃ³n `vm` de C-10, `node --test`, cero deps) con casos: balanceadoâ†’`null`,
  falta cierre, sobra cierre, falta apertura, llaves dentro de strings
  ignoradas; verificar que FALLA en rojo contra el helper inexistente
- [x] 1.2 Implementar `braceNotice(code)` puro junto a la validaciÃ³n
  (candidato: `validator.js`, expuesto globalmente) que devuelve `null` o la
  direcciÃ³n (falta/sobra apertura/cierre) ignorando strings y comentarios
  `//`; verificar `node --test tools/brace-notice.test.js` en verde
- [x] 1.3 Triangular con â‰¥1 caso de veredicto-inmutable (mismas entradas dan
  el mismo `success` con y sin sufijo) y anexar el aviso SOLO al texto del
  mensaje de indentaciÃ³n en `validateByRules` (rama solo-indentaciÃ³n) sin
  tocar el cÃ¡lculo de `success`; verificar suite en verde y que `git diff`
  no muestra cambios en reglas ni en `data.js`

## 2. Gutter con nÃºmeros + guÃ­as (visual, sin librerÃ­as)

- [x] 2.1 Envolver el `textarea` de `openExercise` en `.editor-with-gutter`
  con columna `.line-numbers` (`aria-hidden`) y sincronizar en `input`+`scroll`
  (conteo de `\n` + `scrollTop` espejado), con mÃ©tricas de fuente idÃ©nticas al
  textarea; verificar abriendo ejercicios que los nÃºmeros coinciden lÃ­nea por
  lÃ­nea al escribir y desplazar, sin errores de consola
- [x] 2.2 Agregar guÃ­as sutiles de indentaciÃ³n por fondo CSS
  (`repeating-linear-gradient`, mÃºltiplos de 4ch, baja opacidad) sin tocar
  colores/layout del modal; verificar en mÃ³vil + desktop que las guÃ­as
  coinciden con los niveles de 4 espacios â€” **GATE: si no alinea sin librerÃ­a,
  DETENER el apply y consultar a BelÃ©n antes de agregar nada (no hay fallback)**

## 3. Pista ocultar-en-Ã©xito / mostrar-en-fallo / a-pedido (visual)

- [x] 3.1 En `displayValidationResult`, ocultar `#exercise-hint` en la rama
  Ã©xito y poblarla+mostrarla (`'ðŸ’¡ Pista: ' + exercise.hint`) en la rama
  fallo, sin tocar `noticeHtml` (contrato C-04) ni `showHint`; verificar
  manualmente: aciertoâ†’oculta, falloâ†’visible, "Ver Pista"â†’visible,
  reabrir/reiniciarâ†’oculta, cero errores de consola
- [x] 3.2 Quitar el texto fijo "Salida del programa: CÃ³digo ejecutado" que aparece tras verificar un ejercicio (no es salida real; hoy viene de `execution.output`): no renderizar el bloque de salida salvo salida genuina; dejar solo el resultado de la validaciÃ³n (correcto / necesita correcciones). Solo display en `script-enhanced.js` (`outputHtml`); el campo `output` de `validator.js` NO se toca (no es cambio de reglas). Verificar manualmente: verificar un ejercicio correcto y uno con error â†’ sin bloque "Salida del programa", solo veredicto.

## 4. `@import` al inicio de `styles.css` (texto/config)

- [x] 4.1 Mover la lÃ­nea del `@import` (actual `:101`) antes de cualquier otra
  regla, sin agregar ni cambiar fuentes; verificar abriendo pÃ¡ginas con la
  consola abierta: cero avisos de orden de `@import` y tipografÃ­as aplicadas
  igual que antes (mÃ³vil + desktop)

## 5. VerificaciÃ³n integral y gate de cierre

- [x] 5.1 Recorrer el checklist integral en mÃ³vil + desktop (gutter
  sincronizado, guÃ­as alineadas, pista oculta en correcto / visible en fallo
  o con "Ver Pista", mensaje de llaves claro ante llave de mÃ¡s/menos,
  invariantes 52/208 intactos, `git status` sin `data.js` modificado) y
  verificar `node --test tools/` en verde y cero errores de consola
- [x] 5.2 Mostrar el diff completo a BelÃ©n y verificar su OK explÃ­cito antes
  de dar el apply por hecho â€” **cierre BLOQUEADO hasta su OK, sin
  commit/push** (gate de apply: el diff se muestra y se espera el OK)

## 6. Ajustes pre-cierre de BelÃ©n (sin commit/push)

- [x] 6.1 GuÃ­as estilo VS Code (visual, sin librerÃ­as): cada lÃ­nea dibuja guÃ­as solo hasta su nivel de indentaciÃ³n (una por cada 4 espacios iniciales); nada en el Ã¡rea vacÃ­a a la derecha ni debajo de la Ãºltima lÃ­nea; lÃ­neas en blanco continÃºan la guÃ­a del bloque; sutiles, sincronizadas al escribir/scrollear; sin romper nÃºmeros, Tab=4 espacios, pista ni aviso de llaves. VerificaciÃ³n manual mÃ³vil + desktop.
- [x] 6.2 `braceNotice` en `checkBraces` para TODOS los ejercicios (texto de mensaje, veredictos idÃ©nticos): mensajes concretos ("te falta cerrar una llave }", "sobra una llave }", equivalentes de apertura); tests con un ejercicio de validador propio + uno del flujo comÃºn; sin cambiar ningÃºn vÃ¡lido/invÃ¡lido.
- [x] 6.3 Quitar outputs simulados de `validator.js` (ids 1â€“8: "Hola, Java!", "Edad: 25", `extractOutput(code)`): ningÃºn ejercicio muestra el bloque "Salida del programa" hasta ejecuciÃ³n real (C-06); tests de que ningÃºn veredicto cambia y la UI no rompe sin output.
