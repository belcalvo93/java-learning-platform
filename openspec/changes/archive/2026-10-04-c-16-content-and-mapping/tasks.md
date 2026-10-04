# Tasks â€” c-16-content-and-mapping

> Nota: este change aplica un paquete ya verificado (pack + script con
> invariantes + tests de calidad pre-existentes); no se escribe lÃ³gica nueva,
> por eso las tasks son de verificaciÃ³n-primero en vez de TDD clÃ¡sico: cada
> grupo trae sus propios tests/documentaciÃ³n, sin grupo final de "testing".

## 1. Aplicar el paquete (dry-run primero)

- [x] 1.1 Correr `node tools/apply-content-pack.js --check` y verificar que
  informa "Invariantes OK" + `Lecciones: 51 Ejercicios: 208 (solo
  verificaciÃ³n)" sin modificar ningÃºn archivo (`git status --short` limpio
  en `script.js`/`data.js`).
- [x] 1.2 Correr `node tools/apply-content-pack.js` (escritura) y verificar que
  informa "Invariantes OK" + conteos 51/208 escritos, con `git diff --stat`
  mostrando solo `script.js` y `data.js` mutados.

## 2. Ediciones manuales acotadas (test 1.3 + tarjetas)

- [x] 2.1 Actualizar test 1.3 en `tools/audit-validator.test.js` (lecciones sin
  ejercicios: 51/52 â†’ [22, 25, 40, 42]) y verificar con
  `node --test tools/audit-validator.test.js` en verde.
- [x] 2.2 Actualizar tarjetas de nivel en `index.html` (60/60/48/40 â†’
  62/58/48/40) y verificar abriendo `index.html` + 4 guÃ­as sin errores de
  consola y conteos visibles correctos (principiante 62, intermedio 58).

## 3. Suite completa, matriz regenerada y diff para revisiÃ³n

- [x] 3.1 Correr la suite completa incluyendo `node --test
  tools/content-quality.test.js` (4 tests de guarda: 52/208 + lesson-existe,
  contenido real, consigna clara, starter-comentario no valida) y verificar
  todo verde; ante un rojo, triage: si el fallo es contenido del pack,
  reportar a BelÃ©n sin tocar soluciones/validaciones.
- [x] 3.2 Regenerar `docs/validator-audit.md` con `tools/audit-validator.js` y
  verificar que la matriz refleja los `lessonId` nuevos manteniendo el
  invariante 52/208.
- [ ] 3.3 Comparar contra `docs/content-audit.md` (lÃ­nea base) y preparar el
  diff de los 5 archivos tocados (`script.js`, `data.js`,
  `tools/audit-validator.test.js`, `index.html`, `docs/validator-audit.md`)
  para revisiÃ³n de BelÃ©n; verificar que el diff NO contiene cambios en
  `solution`/`hint`/`validation`/`title`/`difficulty`/ids/conteos â€” cierre
  bloqueado hasta su OK, sin commit/push.
