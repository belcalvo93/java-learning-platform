# Seguimiento de contenido pendiente (Follow-ups) — C-16

> Este documento registra hallazgos e inconsistencias en ejercicios que **NO** son meramente de formato (p. ej. consignas contradictorias, comportamientos dependientes de entorno o discrepancias pedagógicas) y que quedan fuera del alcance de las correcciones aprobadas para C-16.

---

## 1. Ejercicio 133: Aserciones con assert (`assert edad >= 18 : "Menor de edad";`)
- **Nivel:** Avanzado (Lección 32 - Excepciones Personalizadas)
- **Problema:** En Java, la palabra clave `assert` está deshabilitada en la JVM por defecto a menos que se invoque con el flag `-ea` (`-enableassertions`). En un entorno de ejecución online o estándar, el código ejecuta sin efecto aun cuando la condición sea falsa.
- **Propuesta futura:** Cuando se habilite el ejecutor remoto (C-06), asegurar que el comando de ejecución incluya la bandera `-ea` para ejercicios de aserciones o documentar en la teoría la necesidad del flag.

---

## 2. Ejercicios con lectura de archivos en disco (128, 163, 166, 167)
- **Nivel:** Avanzado (Lecciones 33 y 41 - File I/O y Try-with-resources)
- **Problema:** Ejercicios como 128 (`new FileInputStream("archivo.txt")`) o 166 (`new FileReader("file.txt")`) asumen la existencia de archivos físicos en el sistema de archivos del proceso. En ejecución local fallan con `FileNotFoundException` si el archivo no existe.
- **Propuesta futura:** En C-06 / runners reales, montar un scratchpad temporal con archivos muestra pre-cargados (`archivo.txt`, `file.txt`) para permitir que la ejecución real complete con éxito.

---

## 3. Ejercicios con concurrencia y temporización (169 a 188)
- **Nivel:** Experto (Lecciones 43, 44, 45, 46 - Threads, Locks, Executors)
- **Problema:** Varios ejercicios utilizan `Thread.sleep()`, `ExecutorService` o `CompletableFuture` que dependen de sincronización temporal no determinista.
- **Propuesta futura:** Diseñar tests de ejecución basados en análisis estático de traza o ejecución aislada con timeouts controlados para evitar cuelgues o condiciones de carrera en runners automáticos.
