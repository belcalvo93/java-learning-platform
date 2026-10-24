# Design: c-20-real-execution-audit (C-20 real-execution-audit)

## Context

JavaMaster evalúa el código de los estudiantes exclusivamente mediante el motor estático de expresiones regulares y análisis sintáctico de `validator.js`. Sin embargo, un conjunto específico de ejercicios involucra operaciones que dependen del entorno de ejecución de la máquina virtual Java (JVM) y del sistema operativo:
- **Entrada estándar interactiva (`Scanner`)**: lección 8 (ejercicios 33 a 40), donde la lectura interactiva no puede ocurrir en un validador de texto offline.
- **Aserciones en Java (`assert`)**: ejercicio 133, cuya instrucción `assert` es ignorada silenciosamente por la JVM salvo que se ejecute con el parámetro `-ea` (`-enableassertions`).
- **Sistema de archivos (`java.io` y `java.nio.file`)**: ejercicios 128 (FileInputStream) y lección 41 (162 a 168), que asumen la presencia de archivos como `archivo.txt` o `file.txt` en el directorio de trabajo del proceso.
- **Concurrencia, hilos y sincronización**: lecciones 43 a 46 (ejercicios 169 a 188), donde la temporización, el entrelazado de hilos y el orden de salida pueden presentar no-determinismo o bloqueos.
- **Generación aleatoria (`Supplier`)**: ejercicio 148 (`Math.random()`), cuya salida es intrínsecamente no determinista.

Para auditar estas soluciones con rigor sin intervención manual, se requiere una herramienta de desarrollo local (`tools/audit-real-execution.js`) que compile con `javac` y ejecute con `java` en un sandbox temporal aislado.

## Goals / Non-Goals

**Goals:**
- Crear `tools/audit-real-execution.js`, un script ejecutable de desarrollo que verifique de forma automatizada las soluciones canónicas de todos los ejercicios del alcance.
- Detectar la presencia del JDK en el entorno y degradar con gracia (mensaje informativo sin fallar suites de test) si no estuviese instalado.
- Desarrollar un sistema flexible de envoltorios de código Java (`wrapExerciseCode`) para convertir fragmentos en clases completas compilables.
- Soportar inyección de `stdin` simulado en ejercicios interactivos.
- Soportar provisión de archivos de muestra temporales en el directorio de trabajo para ejercicios de I/O.
- Ejecutar 3 repeticiones en ejercicios de concurrencia para reportar estabilidad.
- Emitir la matriz exhaustiva `docs/real-execution-audit.md` y actualizar `docs/content-followups.md` con los hallazgos.
- Crear tests TDD en `tools/audit-real-execution.test.js` para la lógica desacoplada (envoltorios, parsing de salida esperada, clasificación de veredictos).

**Non-Goals:**
- No modificar `data.js`, `validator.js`, `backend/server.js` ni el frontend.
- No activar ni desplegar el backend en producción ni en Render (RN-SEG-02).
- No instalar dependencias externas ni librerías en `package.json`.

## Decisions

- **D-01: Ejecución directa de subprocesos**: En lugar de depender de un servidor HTTP local, la herramienta de auditoría invoca directamente `javac` y `java` usando `child_process.spawn` y `child_process.execFile` con `shell: false`. Esto permite inyectar `stdin` mediante streams, configurar banderas como `-ea` y crear archivos locales en el directorio de trabajo temporal del subproceso.
- **D-02: Envoltorios de código adaptativos**: Cada ejercicio presenta su solución como fragmento (declaración de variables, bloque try-catch o método suelto). La función `wrapExerciseCode(exercise)` detecta la estructura y la envuelve dentro de una clase pública `Solution` con `main` y las importaciones estándar (`java.io.*`, `java.nio.file.*`, `java.util.*`, `java.util.concurrent.*`, etc.). Si el fragmento ya define una clase completa, se respeta la clase y se añade un `main` si no lo tiene.
- **D-03: Simulación determinística de entrada**: Para los ejercicios con `Scanner`, se define un mapa de entradas de prueba coherentes con las consignas (números, cadenas, datos mixtos) para alimentar el stream `stdin`.
- **D-04: Criterios de veredicto**:
  - `OK`: compila, ejecuta exitosamente y su comportamiento coincide con la consigna.
  - `SOLUCIÓN INCORRECTA`: compila pero produce una excepción no esperada o un resultado incorrecto frente a la consigna.
  - `CONSIGNA AMBIGUA`: la consigna y la solución tienen discrepancias conceptuales o salidas no verificables de forma unívoca.
  - `NO COMPILA`: error del compilador `javac` que no puede resolverse con envoltorios estándar.
  - `DEPENDE DEL ENTORNO`: requiere banderas de JVM (`-ea`), archivos externos o depende de la configuración regional (p. ej. punto vs coma en `Scanner.nextDouble()`).
  - `NO DETERMINÍSTICO`: produce salidas distintas en las 3 ejecuciones sucesivas (concurrencia / aleatoriedad).
- **D-05: Sandbox temporal aislado con limpieza estricta**: Cada compilación y ejecución se efectúa en `fs.mkdtemp` dentro del directorio temporal del sistema operativo, con un timeout de 5.000 ms y `killSignal: 'SIGKILL'` para prevenir procesos colgados, asegurando la eliminación del directorio en un bloque `finally`.

## Risks / Trade-offs

- *[Riesgo de bloqueo por timeout en hilos o sockets]*: Ejercicios con `Thread.sleep` o `CountDownLatch` podrían colgarse si las condiciones de sincronización no se cumplen.
  → *Mitigación*: Timeout estricto de 5 segundos con `SIGKILL` forzado en el subproceso.
- *[Riesgo de sensibilidad a Locale en Scanner]*: `Scanner.nextDouble()` en Java lee con coma decimal `,` en sistemas con idioma español (como Windows en Argentina), mientras que la consigna y el código pueden usar `.` decimal.
  → *Mitigación*: Documentar explícitamente este hallazgo como `DEPENDE DEL ENTORNO` y recomendar configurar `scanner.useLocale(Locale.US)` o aclarar en la consigna.
