# Matriz de Auditoría con Ejecución Real — C-20 (`real-execution-audit`)

> **Fecha de generación:** 2026-10-25  
> **Entorno de ejecución:** JDK local (javac 21.0.11, java version "21.0.11" 2026-04-21 LTS)  
> **Total de ejercicios auditados:** 38

## Resumen ejecutivo de veredictos

| Categoría de Veredicto | Cantidad | Descripción |
|---|:---:|---|
| **OK** | 27 | Compila y ejecuta de forma estable, coincidiendo con la especificación. |
| **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | 10 | Exige archivos de disco en el directorio de trabajo, flags de JVM (`-ea`) o depende del Locale regional. |
| **NO DETERMINÍSTICO** | 0 | Produce salidas alternantes o entrelazadas según el scheduler de hilos o generadores pseudo-aleatorios. |
| **CONSIGNA AMBIGUA** | 1 | La salida real difiere ligeramente del texto de resultado esperado en la consigna. |
| **SOLUCIÓN INCORRECTA** | 0 | Compila pero falla en tiempo de ejecución. |
| **NO COMPILA** | 0 | El compilador `javac` rechaza el programa. |

---

## Evaluación de Seguridad: Validación por Reglas vs. Ejecución Real

1. **Ejercicios seguros de mantener SOLO por reglas en el navegador:**
   - **Concurrencia y sincronización (ids 169 a 188):** debido a la naturaleza multi-hilo, el entrelazado de `stdout` es intrínsecamente no determinista. Validar la estructura del código (`synchronized`, `Thread.sleep`, `CountDownLatch`, `ReentrantLock`) mediante el motor de reglas en el cliente es más robusto y rápido que compilar en un backend remoto, evitando bloqueos y condiciones de carrera.
   - **Lectura/Escritura de archivos (ids 128, 162 a 168):** no requieren acceso real al disco en producción; validar la sintaxis de `Files.writeString`, `Files.readString`, `try-with-resources` y `BufferedReader` evita crear/borrar archivos innecesarios en el cliente.
   - **Aserciones con assert (id 133):** validar la estructura `assert condición : mensaje` previene la confusión de que la JVM por defecto apague los asserts sin el parámetro `-ea`.
2. **Ejercicios que convendría mejorar con ejecución real asistida o ajustes:**
   - **Scanner con lectura interactiva (ids 33 a 40):** requieren entrada dinámica en tiempo de ejecución. El validador estructural hoy verifica que se llame a `nextInt()` o `nextLine()`, pero no puede simular la interacción con el usuario.
   - **Sensibilidad de Locale en `Scanner.nextDouble()` (id 40):** en C-22 se configuró `sc.useLocale(Locale.US)` en starter y solución canónica, asegurando la aceptación de punto decimal ("3.5") en cualquier entorno. La herramienta de auditoría prueba automáticamente punto ("3.5") y coma ("3,5"); al rechazar de forma estricta la coma con `InputMismatchException`, el script lo clasifica como `DEPENDE DEL ENTORNO`, pero a nivel de ejecución el comportamiento quedó estandarizado y determinista.

---

## Detalle ejercicio por ejercicio

| ID | Título | Nivel | Lección | Origen Alcance | Compilación / Ejecución | Veredicto | Recomendación / Observación |
|:--:|---|---|---|:--:|:---:|:---:|---|
| 33 | Scanner Leer Int | Principiante | Lección 5: Entrada y Salida con Scanner | `audit-validator` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 34 | Scanner Leer String | Principiante | Lección 5: Entrada y Salida con Scanner | `audit-validator` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 35 | Scanner Múltiples Datos | Principiante | Lección 5: Entrada y Salida con Scanner | `audit-validator` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 36 | Scanner Validar Entrada | Principiante | Lección 5: Entrada y Salida con Scanner | `audit-validator` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 37 | Scanner en Bucle | Principiante | Lección 5: Entrada y Salida con Scanner | `audit-validator` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 38 | Scanner Cerrar | Principiante | Lección 5: Entrada y Salida con Scanner | `audit-validator` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 39 | Scanner Try-With-Resources | Principiante | Lección 5: Entrada y Salida con Scanner | `audit-validator` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 40 | Scanner Leer Double | Principiante | Lección 5: Entrada y Salida con Scanner | `audit-validator` | ✓ Compila / ✓ Ejecuta | **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | Solucionado en C-22 configurando "sc.useLocale(Locale.US)" en starter y solución. La herramienta lo clasifica como DEPENDE DEL ENTORNO porque rechaza la entrada con coma ("3,5"), pero el comportamiento en la JVM es ahora determinista. |
| 128 | Try-With-Resources | Avanzado | Lección 33: Try-with-Resources | `content-followups` | ✓ Compila / ✓ Ejecuta | **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | Es seguro dejarlo validado por reglas en el navegador. En caso de reactivar el ejecutor backend (C-06), inyectar un scratchpad temporal con archivos muestra precreados. |
| 162 | File Write | Avanzado | Lección 41: File I/O y NIO.2 | `encontrado` | ✓ Compila / ✓ Ejecuta | **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | Es seguro dejarlo validado por reglas en el navegador. En caso de reactivar el ejecutor backend (C-06), inyectar un scratchpad temporal con archivos muestra precreados. |
| 163 | File Read | Avanzado | Lección 41: File I/O y NIO.2 | `content-followups` | ✓ Compila / ✓ Ejecuta | **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | Es seguro dejarlo validado por reglas en el navegador. En caso de reactivar el ejecutor backend (C-06), inyectar un scratchpad temporal con archivos muestra precreados. |
| 164 | File Exists | Avanzado | Lección 41: File I/O y NIO.2 | `encontrado` | ✓ Compila / ✓ Ejecuta | **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | Es seguro dejarlo validado por reglas en el navegador. En caso de reactivar el ejecutor backend (C-06), inyectar un scratchpad temporal con archivos muestra precreados. |
| 165 | File Delete | Avanzado | Lección 41: File I/O y NIO.2 | `encontrado` | ✓ Compila / ✓ Ejecuta | **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | Es seguro dejarlo validado por reglas en el navegador. En caso de reactivar el ejecutor backend (C-06), inyectar un scratchpad temporal con archivos muestra precreados. |
| 166 | BufferedReader | Avanzado | Lección 41: File I/O y NIO.2 | `content-followups` | ✓ Compila / ✓ Ejecuta | **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | Es seguro dejarlo validado por reglas en el navegador. En caso de reactivar el ejecutor backend (C-06), inyectar un scratchpad temporal con archivos muestra precreados. |
| 167 | BufferedWriter | Avanzado | Lección 41: File I/O y NIO.2 | `content-followups` | ✓ Compila / ✓ Ejecuta | **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | Es seguro dejarlo validado por reglas en el navegador. En caso de reactivar el ejecutor backend (C-06), inyectar un scratchpad temporal con archivos muestra precreados. |
| 168 | Files Lines Stream | Avanzado | Lección 41: File I/O y NIO.2 | `encontrado` | ✓ Compila / ✓ Ejecuta | **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | Es seguro dejarlo validado por reglas en el navegador. En caso de reactivar el ejecutor backend (C-06), inyectar un scratchpad temporal con archivos muestra precreados. |
| 133 | Assert | Avanzado | Lección 32: Excepciones Personalizadas | `content-followups` | ✓ Compila / ✓ Ejecuta | **DEPENDE DEL ENTORNO (archivo, flag, tiempo)** | Mantener validación por reglas en cliente. Si en el futuro se habilita el ejecutor de C-06, agregar automáticamente la bandera "-ea" a la ejecución del JDK para ejercicios con aserciones. |
| 148 | Supplier Get | Avanzado | Lección 35: Interfaces Funcionales | `audit-validator` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 169 | Thread Extends | Experto | Lección 43: Threads y Runnable | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 170 | Runnable Interface | Experto | Lección 43: Threads y Runnable | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 171 | Thread Start | Experto | Lección 43: Threads y Runnable | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 172 | Thread Sleep | Experto | Lección 43: Threads y Runnable | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 173 | Thread Join | Experto | Lección 43: Threads y Runnable | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 174 | Synchronized Method | Experto | Lección 44: Sincronización y Locks | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 175 | Synchronized Block | Experto | Lección 44: Sincronización y Locks | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 176 | Volatile Variable | Experto | Lección 44: Sincronización y Locks | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 177 | AtomicInteger | Experto | Lección 44: Sincronización y Locks | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 178 | ExecutorService | Experto | Lección 45: Executor Service | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 179 | Callable Future | Experto | Lección 45: Executor Service | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 180 | CompletableFuture | Experto | Lección 46: CompletableFuture | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 181 | CountDownLatch | Experto | Lección 45: Executor Service | `content-followups` | ✓ Compila / ✓ Ejecuta | **CONSIGNA AMBIGUA** | La salida real "Latch liberado" no coincide exactamente con "latch con cuenta inicial 3; la espera termina cuando los hilos hayan llamado a countDown() tres veces". Evaluar homogeneizar el texto de la consigna. |
| 182 | CyclicBarrier | Experto | Lección 45: Executor Service | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 183 | Semaphore | Experto | Lección 45: Executor Service | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 184 | ConcurrentHashMap | Experto | Lección 44: Sincronización y Locks | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 185 | CopyOnWriteArrayList | Experto | Lección 44: Sincronización y Locks | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 186 | BlockingQueue | Experto | Lección 44: Sincronización y Locks | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 187 | ReentrantLock | Experto | Lección 44: Sincronización y Locks | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
| 188 | ReadWriteLock | Experto | Lección 44: Sincronización y Locks | `content-followups` | ✓ Compila / ✓ Ejecuta | **OK** | Comportamiento determinista y seguro. Se puede validar tanto por reglas en el navegador como por ejecución real en JDK. |
