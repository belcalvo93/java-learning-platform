# Proposal: c-20-real-execution-audit (C-20 real-execution-audit)

## Why

La plataforma JavaMaster utiliza un validador estructural en el navegador basado en reglas (`validator.js`), pero un conjunto de ejercicios no puede evaluarse con total fidelidad sin ejecución real de código: ejercicios con entrada dinámica vía `Scanner`, operaciones de entrada/salida sobre archivos en disco, aserciones mediante la palabra clave `assert` (que exigen la bandera `-ea` en la JVM) y mecanismos de concurrencia y sincronización con hilos (`Thread`, `ExecutorService`, cerrojos y colecciones concurrentes). Para auditar la corrección técnica de las soluciones canónicas y la coherencia de sus consignas sin requerir pruebas manuales, se necesita una herramienta de auditoría automatizada en entorno de desarrollo local que compile (`javac`) y ejecute (`java`) los programas en un entorno controlado y seguro.

## What Changes

- **Herramienta de desarrollo `tools/audit-real-execution.js`**:
  - Diseñar un módulo ejecutor que arme programas Java compilables envolviendo las soluciones canónicas en clases con método `main`, importaciones requeridas, declaraciones auxiliares y métodos base cuando aplique.
  - Compilar con `javac` y ejecutar con `java` en directorios temporales aislados, con timeout estricto (5 segundos), terminación con `SIGKILL`, captura de `stdout`/`stderr` truncada y limpieza en bloque `finally`.
  - Soporte de entrada simulada (`stdin`) para ejercicios de `Scanner` (ids 33 a 40).
  - Creación de archivos muestra temporales para ejercicios de lectura/escritura en disco (128, 162, 163, 164, 165, 166, 167, 168).
  - Prueba con y sin bandera `-ea` para el ejercicio de aserción (id 133).
  - Ejecución triple para ejercicios de concurrencia (ids 169 a 188) para contrastar estabilidad y determinismo.
  - Detección de presencia del JDK: advertencia clara y salida limpia si el JDK no está disponible, sin romper la suite de tests.
  - Clasificación de veredictos: `OK`, `SOLUCIÓN INCORRECTA`, `CONSIGNA AMBIGUA`, `NO COMPILA`, `DEPENDE DEL ENTORNO (archivo, flag, tiempo)` y `NO DETERMINÍSTICO`.
- **Suite de pruebas TDD (`tools/audit-real-execution.test.js`)**:
  - Pruebas unitarias de la lógica pura (envoltorios de código, parseo de salida esperada de la consigna, matriz de veredictos).
  - Pruebas de integración con el JDK real que se omiten limpiamente si `javac`/`java` no están instalados.
- **Entregables de documentación**:
  - `docs/real-execution-audit.md`: reporte tabular exhaustivo con cada ejercicio analizado, método de envoltorio, resultado de compilación/ejecución, salida real vs. esperada, veredicto y recomendaciones pedagógicas/técnicas (sin aplicar cambios a `data.js`).
  - `docs/content-followups.md`: actualización con los nuevos hallazgos e inconsistencias detectadas.
  - Evaluación sobre qué ejercicios validados por reglas son seguros de conservar y cuáles ameritan mejoras futuras.
- **Roadmap**:
  - Marcar `[x]` en `CHANGES.md` para C-20 tras completar y archivar el change.

## Capabilities

### New Capabilities
<!-- Ninguna: herramienta de desarrollo y documentación de auditoría (skip_specs: true). -->

### Modified Capabilities
<!-- Ninguna: herramienta de desarrollo y documentación de auditoría (skip_specs: true). -->

## Impact

- Nuevos archivos: `tools/audit-real-execution.js`, `tools/audit-real-execution.test.js`, `docs/real-execution-audit.md`.
- Documentos actualizados: `docs/content-followups.md`, `CHANGES.md`.
- No modifica código de producción, ni `data.js`, ni `validator.js`, ni estilos, ni `backend/`.
