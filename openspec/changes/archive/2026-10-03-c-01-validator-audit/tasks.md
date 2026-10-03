# Tasks — c-01-validator-audit

> TDD estricto (módulo global): RED → GREEN → TRIANGULATE → REFACTOR por
> tarea lógica. Sin aserciones triviales. Runner: `node --test
> tools/*.test.js` (sin dependencias nuevas). Contenido de
> lecciones/ejercicios: solo lectura.

## 1. Arnés de carga + invariante 52/208 (RED primero)

- [x] 1.1 Escribir el test del invariante (falla primero): carga
  `data.js` (208 ejercicios, ids 1–208 únicos) y `lessonsData` de
  `script.js` (52 lecciones 15/15/12/10); verificar que
  `node --test tools/*.test.js` falla por módulo ausente.
- [x] 1.2 Implementar el cargador mínimo (`vm.runInNewContext` sobre
  `data.js` + extracción de `lessonsData` de `script.js` sin ejecutar DOM)
  y verificar que el test del invariante pasa en verde.
- [x] 1.3 Triangular el invariante con casos borde (ids duplicados,
  hueco de ids, `lessonId` huérfano 51–52 reportado como hallazgo) y
  verificar que todos los casos pasan sin tocar contenido real.

## 2. Clasificador rules-only-ok / needs-real-execution / rules-cheatable

- [x] 2.1 Escribir tests del clasificador con 2+ casos por categoría
  (solución canónica aceptada, variante semánticamente rota rechazada) y
  verificar que fallan antes de implementar.
- [x] 2.2 Implementar el clasificador mínimo sobre `JavaValidator`
  (incluye rama `default` por `includes`) y verificar que los tests pasan.
- [x] 2.3 Triangular con un segundo juego de entradas por categoría
  (al menos 3 escenarios representativos de ids 1–8 y de la rama
  `default` 9–208) y verificar suite verde.

## 3. Sondas de engaño (≥2 por familia, ≥3 deben fallar hoy)

- [x] 3.1 Escribir las plantillas de sondas (literal/comentario con la
  respuesta, código muerto con el patrón presente pero semántica rota)
  con ≥2 variantes por familia de reglas y verificar que el test de
  cobertura de sondas existe y falla sin el audit.
- [x] 3.2 Ejecutar las sondas contra el `validator.js` actual y verificar
  que al menos 3 sondas son aceptadas falsamente (evidencia de
  `rules-cheatable`, en especial rama `default` por `includes`).
- [x] 3.3 Clasificar cada ejercicio según el resultado de sus sondas y
  verificar que todo id 1–208 tiene veredicto (ningún ejercicio sin
  categoría).

## 4. Auditoría completa + matriz docs/validator-audit.md

- [x] 4.1 Implementar `tools/audit-validator.js` que corre clasificación
  + sondas sobre los 208 ejercicios y emite `docs/validator-audit.md`
  (tabla id/lección/categoría/veredicto + resumen con conteos, %
  engañable y lista `needs-real-execution`) y verificar que el archivo se
  genera con 208 filas.
- [x] 4.2 Agregar el test de consistencia matriz-vs-clasificador (el
  resumen cuadra con la tabla, las 208 filas presentes, hallazgos de
  contenido listados sin correcciones) y verificar suite verde.
- [x] 4.3 Revisar manualmente la matriz generada (muestra de ids 1–8 y de
  la rama `default`, más el hallazgo `lessonId` 51–52) y verificar que los
  veredictos son coherentes con lo observado en exploración.

## 5. Cierre e integración

- [x] 5.1 Correr la suite completa `node --test tools/*.test.js` y la
  auditoría de punta a punta, y verificar que todo está verde y la matriz
  final está versionada en `docs/validator-audit.md`.
- [x] 5.2 Verificar alcance intacto: `git status` muestra solo
  `tools/`, `docs/validator-audit.md` y `openspec/changes/c-01-validator-audit/`;
  ningún contenido de lecciones/ejercicios modificado, ningún secreto
  agregado, backend sin tocar.
