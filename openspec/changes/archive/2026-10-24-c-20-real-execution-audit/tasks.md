# Tasks: c-20-real-execution-audit (C-20 real-execution-audit)

## 1. TDD y desarrollo de tools/audit-real-execution.js

- [x] 1.1 Escribir pruebas unitarias en `tools/audit-real-execution.test.js` para detección de JDK, envoltorios de código Java (`wrapExerciseCode`), parseo de salida esperada y matriz de veredictos.
- [x] 1.2 Implementar `tools/audit-real-execution.js` con compilación `javac`, ejecución `java` aislada en sandbox temporal, inyección de `stdin`, soporte de archivos muestra, bandera `-ea` y triple ejecución de concurrencia.
- [x] 1.3 Ejecutar las pruebas de `tools/audit-real-execution.test.js` y confirmar que pasen limpiamente con y sin JDK.

## 2. Ejecución de la auditoría y generación de reportes

- [x] 2.1 Correr `node tools/audit-real-execution.js` sobre todo el alcance (9 ejercicios de `audit-validator.js`, 133 con y sin `-ea`, archivos en disco 128/162-168, concurrencia 169-188 y Supplier 148).
- [x] 2.2 Redactar `docs/real-execution-audit.md` con la matriz de resultados, salidas reales vs. esperadas, clasificación de veredictos y recomendaciones.
- [x] 2.3 Actualizar `docs/content-followups.md` con los nuevos hallazgos detectados durante la auditoría.

## 3. Verificación final y cierre

- [x] 3.1 Ejecutar `node --test-concurrency=1 --test "tools/*.test.js"`.
- [x] 3.2 Ejecutar `node tools/browser-check.js`.
- [x] 3.3 Ejecutar `node tools/audit-validator.js` y verificar invariante 52/208.
- [x] 3.4 Validar especificaciones con `npx openspec validate --specs` y validar change con `npx openspec validate c-20-real-execution-audit`.
- [x] 3.5 Archivar el change `c-20-real-execution-audit` y marcar `[x]` en `CHANGES.md`.
