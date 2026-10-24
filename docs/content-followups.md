# Seguimiento de contenido pendiente (Follow-ups) — C-16 / C-20

> Este documento registra hallazgos e inconsistencias en ejercicios que **NO** son meramente de formato (p. ej. consignas contradictorias, comportamientos dependientes de entorno o discrepancias pedagógicas) y que quedan fuera del alcance de las correcciones de contenido hasta su aprobación explícita.
> Todos los títulos, niveles y lecciones aquí listados provienen directamente de `data.js` y `lessonsData` (script.js).

---

## 1. Ejercicio 133: Assert (`assert edad >= 18 : "Menor de edad";`)
- **Nivel:** Avanzado (Lección 32: Excepciones Personalizadas)
- **Problema:** En Java, la palabra clave `assert` está deshabilitada en la JVM por defecto a menos que se invoque con el flag `-ea` (`-enableassertions`). En un entorno de ejecución estándar, el código ejecuta sin efecto aun cuando la condición sea falsa (verificado en C-20: sin `-ea` termina con exitCode 0).
- **Propuesta futura:** Mantener validación por reglas en cliente. Cuando se habilite el ejecutor remoto (C-06), asegurar que el comando de ejecución incluya automáticamente la bandera `-ea` para ejercicios de aserciones o documentar en la teoría la necesidad del flag.

---

## 2. Ejercicios con archivos en disco (128, 162, 163, 164, 165, 166, 167, 168)
- **Nivel y lecciones:**
  - ID 128 (`Try-With-Resources`): Avanzado (Lección 33: Try-with-Resources)
  - ID 162 (`File Write`): Avanzado (Lección 41: File I/O y NIO.2)
  - ID 163 (`File Read`): Avanzado (Lección 41: File I/O y NIO.2)
  - ID 164 (`File Exists`): Avanzado (Lección 41: File I/O y NIO.2)
  - ID 165 (`File Delete`): Avanzado (Lección 41: File I/O y NIO.2)
  - ID 166 (`BufferedReader`): Avanzado (Lección 41: File I/O y NIO.2)
  - ID 167 (`BufferedWriter`): Avanzado (Lección 41: File I/O y NIO.2)
  - ID 168 (`Files Lines Stream`): Avanzado (Lección 41: File I/O y NIO.2)
- **Problema:** Ejercicios como 128 (`new FileReader("file.txt")`), 163 (`Files.readString(Path.of("archivo.txt"))`) o 168 (`Files.lines(Path.of("file.txt"))`) asumen la existencia de archivos físicos en el sistema de archivos del proceso. En ejecución local fallan con `FileNotFoundException` o `NoSuchFileException` si el archivo no existe.
- **Hallazgo C-20:** En C-20 se verificó que los ejercicios 128, 162, 163, 164, 165, 166, 167 y 168 pertenecen a esta categoría de dependencia de archivos locales. Todos compilaron y ejecutaron exitosamente al proveer un sandbox con `archivo.txt` y `file.txt`.
- **Propuesta futura:** Es seguro mantenerlos validados por reglas en el navegador. En caso de reactivar runners reales, montar un scratchpad temporal con archivos muestra pre-cargados (`archivo.txt`, `file.txt`) para permitir que la ejecución real complete con éxito.

---

## 3. Ejercicios con concurrencia y temporización (169 a 188)
- **Nivel y lecciones:**
  - Nivel Experto (Lecciones 43: Threads y Runnable, 44: Sincronización y Locks, 45: Executor Service, 46: CompletableFuture)
- **Problema:** Varios ejercicios utilizan `Thread.sleep()`, `ExecutorService` o `CompletableFuture` que dependen de sincronización temporal.
- **Hallazgo C-20:**
  - Ejercicios con pool de hilos: 178 (`ExecutorService`) y 179 (`Callable Future`) en Lección 45 (Executor Service): requieren llamar a `executor.shutdown()` para que el proceso de la JVM finalice normalmente; de lo contrario, los hilos de trabajo no-daemon mantienen el proceso vivo indefinidamente hasta agotar el timeout.
  - Ejercicio 181 (`CountDownLatch`) en Lección 45 (Executor Service): si se ejecuta `latch.await()` sin que otros hilos descuenten la cuenta con `countDown()`, el hilo principal se bloquea indefinidamente.
  - Ejercicios 174 (`Synchronized Method`) y 176 (`Volatile Variable`) en Lección 44 (Sincronización y Locks): la solución canónica contiene métodos o modificadores de campo (`synchronized`, `private volatile`) que deben pertenecer a una clase y no a un cuerpo suelto dentro de un `main`.
- **Propuesta futura:** Mantener validación estructural estática por reglas en el cliente (RN-CON-02), la cual es determinista, rápida y no presenta riesgo de bloqueos ni condiciones de carrera.

---

## 4. Ejercicio 40: Scanner Leer Double (Sensibilidad a Locale)
- **Nivel:** Principiante (Lección 5: Entrada y Salida con Scanner)
- **Problema:** En Java, `Scanner.nextDouble()` delega el formateo numérico en `Locale.getDefault()`. En sistemas operativos con configuración regional en español (p. ej. `es-AR` o `es-ES`), `Scanner` espera la coma decimal como separador (`3,5`) y lanza `InputMismatchException` si recibe un punto (`3.5`), mientras que en sistemas anglosajones es a la inversa.
- **Hallazgo C-20:** Verificado empíricamente en la máquina local: con entrada `3.5` falla con `InputMismatchException`, mientras que con entrada `3,5` ejecuta exitosamente.
- **Propuesta futura:** En un futuro change de contenido, agregar en la consigna o starter la configuración explícita `sc.useLocale(Locale.US)` o aclarar la discrepancia entre punto y coma decimal según la configuración regional.

---

## 5. Consignas con "Resultado esperado" explicativo vs. salida determinista (12 ejercicios)
- **Ejercicios afectados (metadatos reales de data.js y lessonsData):**
  - ID 35: `Scanner Múltiples Datos` — Principiante (Lección 5: Entrada y Salida con Scanner)
  - ID 37: `Scanner en Bucle` — Principiante (Lección 5: Entrada y Salida con Scanner)
  - ID 38: `Scanner Cerrar` — Principiante (Lección 5: Entrada y Salida con Scanner)
  - ID 39: `Scanner Try-With-Resources` — Principiante (Lección 5: Entrada y Salida con Scanner)
  - ID 148: `Supplier Get` — Avanzado (Lección 35: Interfaces Funcionales)
  - ID 170: `Runnable Interface` — Experto (Lección 43: Threads y Runnable)
  - ID 174: `Synchronized Method` — Experto (Lección 44: Sincronización y Locks)
  - ID 176: `Volatile Variable` — Experto (Lección 44: Sincronización y Locks)
  - ID 179: `Callable Future` — Experto (Lección 45: Executor Service)
  - ID 181: `CountDownLatch` — Experto (Lección 45: Executor Service)
  - ID 182: `CyclicBarrier` — Experto (Lección 45: Executor Service)
  - ID 186: `BlockingQueue` — Experto (Lección 44: Sincronización y Locks)
- **Problema:** Las consignas de estos 12 ejercicios utilizan la sección `<strong>Salida esperada:</strong>` o `<strong>Resultado esperado:</strong>` para dar explicaciones pedagógicas ("no imprime nada", "se repite hasta que escribas 0", "si escribes 42: ..."), lo que produce una discrepancia al comparar automáticamente contra la salida estándar cruda del proceso.
- **Hallazgo C-20:** Todos compilan y ejecutan correctamente en el JDK. La etiqueta "CONSIGNA AMBIGUA" en la auditoría refleja únicamente que el texto en la consigna es una descripción didáctica y no un literal exacto para `assert.equal()`.
- **Propuesta futura:** En una futura revisión de contenido, evaluar estandarizar las consignas para que distingan formalmente entre `Salida esperada (consola):` y `Nota didáctica / Comportamiento:`.
