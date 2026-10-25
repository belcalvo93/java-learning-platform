# Propuesta de Corrección de Contenido (Fase 1 y Fase 2) — C-22 (`content-fixes-from-audit`)

> **Estado:** Fase 1 aprobada por la usuaria. Documento actualizado con los textos literales exactos (Paso 0) antes de la aplicación efectiva en Fase 2.  
> **Fuente de verdad:** Todos los identificadores, títulos, niveles y nombres de lección provienen directamente de `data.js` (`exercisesData`) y `script.js` (`lessonsData`).

---

## 1. Resumen Ejecutivo y Decisiones Aprobadas

A partir de los hallazgos de la auditoría con ejecución real en JDK 21 ([docs/real-execution-audit.md](real-execution-audit.md)) y el seguimiento ([docs/content-followups.md](content-followups.md)):

1. **Ajuste en Ejercicio 178 vs 179 (Aclaración de estado):**
   - En **Ejercicio 178 (`ExecutorService`)**, la solución canónica en `data.js` y la consigna **ya incluían** `executor.shutdown();`. Por esa razón, en [docs/real-execution-audit.md](real-execution-audit.md) obtuvo veredicto **`OK`**. El problema detectado en la auditoría era que `validation.requiredKeywords` en `data.js` solo exigía `["ExecutorService", "submit"]`, permitiendo omitir `shutdown`. Se agrega `"shutdown"` a las palabras requeridas.
   - En **Ejercicio 179 (`Callable Future`)**, la solución canónica en `data.js` **no incluía** `executor.shutdown();` y la consigna no lo pedía. Se actualizan solución, consigna y validador para incluirlo y exigirlo.
2. **Prompts de Scanner (Ejercicios 33 a 40):**
   - Se reemplaza la etiqueta `Salida esperada:` por `Salida esperada (pantalla):` con redacción que distingue nítidamente el prompt impreso de lo ingresado por el usuario, sin modificar las soluciones canónicas existentes.
3. **Ejercicio 40 (`Scanner Leer Double`):**
   - Starter y solución incorporan `import java.util.Locale;` y `.useLocale(Locale.US)` para garantizar consistencia decimal en cualquier configuración regional.
4. **Ejercicio 38 (`Scanner Cerrar`):**
   - Incorpora `import java.util.Scanner;` en starter y solución. La regla 38 se flexibiliza para tolerar tanto el bloque completo como `sc.close();` solo, condicionado a tests TDD que garanticen mantener `cheat=1` y `enganable=0.5%`.
5. **Ejercicio 148 (`Supplier Get`):**
   - Reemplaza `Math.random()` por `Random r = new Random(42);` con `Supplier<Integer> random = () -> r.nextInt(100);` produciendo determinísticamente el entero `30` (verificado en JDK 21).
6. **Ejercicio 133 (`Assert`):**
   - Se incorpora nota pedagógica sobre el flag `-ea` en la consigna. Solución y validador permanecen intactos.
7. **Ejercicios 128, 162 a 168 y 181 (Dependencias de Entorno / Archivos):**
   - Sin cambios de código en `data.js`. Quedan documentados como limitación aceptada de la validación puramente estática en cliente sin backend.
8. **Ejercicios 170, 174, 176, 182 y 186:**
   - Estandarización de la etiqueta `Resultado esperado:` por `Comportamiento:`.

---

## 2. Textos Literales Exactos: ANTES y DESPUÉS

### Ejercicios 33 a 40 — "Salida esperada (pantalla)"

#### ID 33: Scanner Leer Int (Principiante — Lección 5: Entrada y Salida con Scanner)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> El <code>import</code> ya está en el editor. Crea un <code>Scanner</code> llamado <code>sc</code> con <code>System.in</code>, muestra con <code>System.out.print</code> el texto <code>Edad: </code> y lee un entero con <code>nextInt()</code> guardándolo en la variable <code>edad</code>.<br><strong>Salida esperada:</strong> <code>Edad: </code> y el programa queda esperando que escribas un número (si escribes 30, <code>edad</code> vale 30).`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> El <code>import</code> ya está en el editor. Crea un <code>Scanner</code> llamado <code>sc</code> con <code>System.in</code>, muestra con <code>System.out.print</code> el texto <code>Edad: </code> y lee un entero con <code>nextInt()</code> guardándolo en la variable <code>edad</code>.<br><strong>Salida esperada (pantalla):</strong> <code>Edad: </code> (al ingresar <code>30</code> y presionar Enter, la variable <code>edad</code> almacena <code>30</code>).`
- **Starter:** *Sin cambios* (`import java.util.Scanner;`).
- **Solución:** *Sin cambios*.

#### ID 34: Scanner Leer String (Principiante — Lección 5: Entrada y Salida con Scanner)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> El <code>import</code> ya está en el editor. Crea un <code>Scanner</code> llamado <code>sc</code>, muestra con <code>System.out.print</code> el texto <code>Nombre: </code> y lee una línea completa con <code>nextLine()</code> en la variable <code>nombre</code> (así se aceptan espacios, como en <code>Ana Pérez</code>).<br><strong>Salida esperada:</strong> <code>Nombre: </code> y el programa queda esperando que escribas tu nombre.`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> El <code>import</code> ya está en el editor. Crea un <code>Scanner</code> llamado <code>sc</code>, muestra con <code>System.out.print</code> el texto <code>Nombre: </code> y lee una línea completa con <code>nextLine()</code> en la variable <code>nombre</code> (así se aceptan espacios, como en <code>Ana Pérez</code>).<br><strong>Salida esperada (pantalla):</strong> <code>Nombre: </code> (al ingresar <code>Ana Pérez</code> y presionar Enter, <code>nombre</code> almacena dicho texto).`
- **Starter:** *Sin cambios* (`import java.util.Scanner;`).
- **Solución:** *Sin cambios*.

#### ID 35: Scanner Múltiples Datos (Principiante — Lección 5: Entrada y Salida con Scanner)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Crea un <code>Scanner</code> llamado <code>sc</code>. Pide primero el nombre (<code>print</code> de <code>Nombre: </code>, lectura con <code>nextLine()</code> en <code>nombre</code>) y después la edad (<code>print</code> de <code>Edad: </code>, lectura con <code>nextInt()</code> en <code>edad</code>).<br><strong>Salida esperada:</strong> <code>Nombre: </code> y, tras escribir <code>Ana Pérez</code> y Enter, <code>Edad: </code> (si escribes 30, <code>edad</code> vale 30).`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Crea un <code>Scanner</code> llamado <code>sc</code>. Pide primero el nombre (<code>print</code> de <code>Nombre: </code>, lectura con <code>nextLine()</code> en <code>nombre</code>) y después la edad (<code>print</code> de <code>Edad: </code>, lectura con <code>nextInt()</code> en <code>edad</code>).<br><strong>Salida esperada (pantalla):</strong> <code>Nombre: </code> y luego <code>Edad: </code> (al ingresar <code>Ana Pérez</code> y <code>30</code>, las variables quedan con sus respectivos valores).`
- **Starter:** *Sin cambios* (`// Escribe tu código aquí`).
- **Solución:** *Sin cambios*.

#### ID 36: Scanner Validar Entrada (Principiante — Lección 5: Entrada y Salida con Scanner)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Crea un <code>Scanner</code> llamado <code>sc</code>. Con un <code>if</code> que use <code>sc.hasNextInt()</code>: si lo siguiente es un entero, léelo con <code>nextInt()</code> en <code>num</code> e imprime <code>Número: </code> seguido del valor; si no, en el <code>else</code> imprime <code>No es número</code>.<br><strong>Salida esperada:</strong> si escribes <code>42</code>: <code>Número: 42</code>; si escribes <code>hola</code>: <code>No es número</code>.`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Crea un <code>Scanner</code> llamado <code>sc</code>. Con un <code>if</code> que use <code>sc.hasNextInt()</code>: si lo siguiente es un entero, léelo con <code>nextInt()</code> en <code>num</code> e imprime <code>Número: </code> seguido del valor; si no, en el <code>else</code> imprime <code>No es número</code>.<br><strong>Salida esperada (pantalla):</strong> con entrada <code>42</code> muestra <code>Número: 42</code>; con entrada <code>hola</code> muestra <code>No es número</code>.`
- **Starter:** *Sin cambios* (`import java.util.Scanner;`).
- **Solución:** *Sin cambios*.

#### ID 37: Scanner en Bucle (Principiante — Lección 5: Entrada y Salida con Scanner)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Crea un <code>Scanner</code> llamado <code>sc</code>, declara <code>int num</code> y escribe un bucle <code>do-while</code>: en cada vuelta imprime con <code>print</code> el texto <code>Número (0 para salir): </code> y lee un entero con <code>nextInt()</code> en <code>num</code>. El bucle se repite mientras <code>num != 0</code>.<br><strong>Salida esperada:</strong> <code>Número (0 para salir): </code> se repite hasta que escribas 0 (si escribes 5, 3 y 0, el texto aparece tres veces).`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Crea un <code>Scanner</code> llamado <code>sc</code>, declara <code>int num</code> y escribe un bucle <code>do-while</code>: en cada vuelta imprime con <code>print</code> el texto <code>Número (0 para salir): </code> y lee un entero con <code>nextInt()</code> en <code>num</code>. El bucle se repite mientras <code>num != 0</code>.<br><strong>Salida esperada (pantalla):</strong> <code>Número (0 para salir): </code> se repite en cada iteración hasta que se ingrese <code>0</code>.`
- **Starter:** *Sin cambios* (`// Escribe tu código aquí`).
- **Solución:** *Sin cambios*.

#### ID 38: Scanner Cerrar (Principiante — Lección 5: Entrada y Salida con Scanner)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> El editor ya crea el <code>Scanner</code> <code>sc</code> y lee un entero en <code>num</code>. Agrega al final la instrucción que cierra el <code>Scanner</code> con <code>close()</code>.<br><strong>Resultado esperado:</strong> el código termina con <code>sc.close();</code>. No imprime nada.`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> El <code>import</code> y la lectura previa ya están en el editor. Agrega al final la instrucción que cierra el <code>Scanner</code> con <code>close()</code> sobre la variable <code>sc</code>.<br><strong>Salida esperada (pantalla):</strong> no imprime nada (el programa finaliza llamando a <code>sc.close();</code>).`
- **Starter ACTUAL:**
  ```java
  Scanner sc = new Scanner(System.in);
  int num = sc.nextInt();
  ```
- **Starter PROPUESTO:**
  ```java
  import java.util.Scanner;

  Scanner sc = new Scanner(System.in);
  int num = sc.nextInt();
  ```
- **Solución ACTUAL:**
  ```java
  Scanner sc = new Scanner(System.in);
  int num = sc.nextInt();
  sc.close();
  ```
- **Solución PROPUESTA:**
  ```java
  import java.util.Scanner;

  Scanner sc = new Scanner(System.in);
  int num = sc.nextInt();
  sc.close();
  ```

#### ID 39: Scanner Try-With-Resources (Principiante — Lección 5: Entrada y Salida con Scanner)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Usa <code>try-with-resources</code>: abre un <code>try (Scanner sc = new Scanner(System.in)) { ... }</code>. Dentro, imprime <code>Número: </code> con <code>print</code>, lee un entero con <code>nextInt()</code> en <code>num</code> e imprime <code>Leído: </code> seguido del valor.<br><strong>Salida esperada:</strong> si escribes <code>42</code>: <code>Número: </code> y luego <code>Leído: 42</code>.`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Usa <code>try-with-resources</code>: abre un <code>try (Scanner sc = new Scanner(System.in)) { ... }</code>. Dentro, imprime <code>Número: </code> con <code>print</code>, lee un entero con <code>nextInt()</code> en <code>num</code> e imprime <code>Leído: </code> seguido del valor.<br><strong>Salida esperada (pantalla):</strong> con entrada <code>42</code> muestra <code>Número: </code> y luego <code>Leído: 42</code>.`
- **Starter:** *Sin cambios* (`import java.util.Scanner;`).
- **Solución:** *Sin cambios*.

#### ID 40: Scanner Leer Double (Principiante — Lección 5: Entrada y Salida con Scanner)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> El <code>import</code> ya está en el editor. Crea un <code>Scanner</code> llamado <code>sc</code>, muestra con <code>print</code> el texto <code>Precio: </code> y lee un decimal con <code>nextDouble()</code> guardándolo en la variable <code>precio</code> (de tipo <code>double</code>).<br><strong>Salida esperada:</strong> <code>Precio: </code> y el programa queda esperando un número decimal (si escribes 3.5, <code>precio</code> vale 3.5).`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Los <code>import</code> ya están en el editor. Crea un <code>Scanner</code> llamado <code>sc</code> configurado con <code>Locale.US</code> (usando <code>new Scanner(System.in).useLocale(Locale.US)</code> o <code>sc.useLocale(Locale.US)</code> para aceptar punto decimal independientemente del idioma del sistema), muestra con <code>print</code> el texto <code>Precio: </code> y lee un decimal con <code>nextDouble()</code> guardándolo en <code>precio</code> (de tipo <code>double</code>).<br><strong>Salida esperada (pantalla):</strong> <code>Precio: </code> (al ingresar <code>3.5</code> y presionar Enter, la variable <code>precio</code> almacena <code>3.5</code>).`
- **Starter ACTUAL:**
  ```java
  import java.util.Scanner;
  ```
- **Starter PROPUESTO:**
  ```java
  import java.util.Scanner;
  import java.util.Locale;
  ```
- **Solución ACTUAL:**
  ```java
  Scanner sc = new Scanner(System.in);
  System.out.print("Precio: ");
  double precio = sc.nextDouble();
  ```
- **Solución PROPUESTA:**
  ```java
  Scanner sc = new Scanner(System.in).useLocale(Locale.US);
  System.out.print("Precio: ");
  double precio = sc.nextDouble();
  ```

---

### Ejercicios 178 y 179 — Concurrencia y `shutdown()`

#### ID 178: ExecutorService (Experto — Lección 45: Executor Service)
- **Estado en `real-execution-audit.md`:** **`OK`** (compiló y terminó correctamente).
- **Aclaración técnica:** La solución canónica en `data.js` y la consigna **ya tenían** `executor.shutdown();`. No había contradicción con la auditoría de ejecución real. El problema era que `validation.requiredKeywords` en `data.js` sólo requería `["ExecutorService", "submit"]`, omitiendo `"shutdown"`.
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Crea un <code>ExecutorService executor</code> con <code>Executors.newFixedThreadPool(5)</code>, envíale con <code>submit</code> una lambda que imprima <code>Tarea</code> y ciérralo con <code>executor.shutdown()</code>.<br><strong>Salida esperada:</strong> <code>Tarea</code>`
- **Texto PROPUESTO (`description`):** *Sin cambios* (ya es exacto).
- **Starter ACTUAL y PROPUESTO:** `import java.util.concurrent.*;`
- **Solución ACTUAL y PROPUESTA:**
  ```java
  ExecutorService executor = Executors.newFixedThreadPool(5);
  executor.submit(() -> System.out.println("Tarea"));
  executor.shutdown();
  ```
- **Cambio en `data.js`:** `validation.requiredKeywords` pasa de `["ExecutorService", "submit"]` a `["ExecutorService", "submit", "shutdown"]`.

#### ID 179: Callable Future (Experto — Lección 45: Executor Service)
- **Estado en `real-execution-audit.md`:** `CONSIGNA AMBIGUA` / colgado sin shutdown.
- **Aclaración técnica:** En este ejercicio, la solución canónica **no incluía** `executor.shutdown();` y la consigna no lo pedía. Al ser un pool de hilos no-daemon, el proceso Java queda vivo esperando nuevas tareas.
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Considera que ya existe un <code>ExecutorService executor</code>. Declara <code>Callable&lt;Integer&gt; tarea = () -&gt; 42;</code>, envíala con <code>executor.submit(tarea)</code> guardando el <code>Future&lt;Integer&gt; futuro</code>, y lee el valor con <code>int resultado = futuro.get();</code> (<code>get()</code> lanza excepciones comprobadas: en un programa real va en un método con <code>throws Exception</code>).<br><strong>Resultado esperado:</strong> <code>resultado</code> vale <code>42</code> (el fragmento no imprime nada).`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Considera que ya existe un <code>ExecutorService executor</code>. Declara <code>Callable&lt;Integer&gt; tarea = () -&gt; 42;</code>, envíala con <code>executor.submit(tarea)</code> guardando el <code>Future&lt;Integer&gt; futuro</code>, lee el valor con <code>int resultado = futuro.get();</code> y cierra el executor con <code>executor.shutdown();</code>.<br><strong>Comportamiento:</strong> <code>resultado</code> vale <code>42</code> y el servicio de ejecución queda cerrado (el fragmento no imprime nada).`
- **Starter:** *Sin cambios* (`import java.util.concurrent.*;`).
- **Solución ACTUAL:**
  ```java
  Callable<Integer> tarea = () -> 42;
  Future<Integer> futuro = executor.submit(tarea);
  int resultado = futuro.get();
  ```
- **Solución PROPUESTA:**
  ```java
  Callable<Integer> tarea = () -> 42;
  Future<Integer> futuro = executor.submit(tarea);
  int resultado = futuro.get();
  executor.shutdown();
  ```
- **Cambio en `data.js` y `validator.js`:**
  - `validation.requiredKeywords` pasa de `["Callable", "Future", "get"]` a `["Callable", "Future", "get", "shutdown"]`.
  - Regla 179 en `validator.js`: actualiza mensaje de error `missing` para incluir shutdown.

---

### Ejercicio 148 — Supplier Aleatorio con Semilla Determinista

#### ID 148: Supplier Get (Avanzado — Lección 35: Interfaces Funcionales)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Con <code>Supplier</code> ya importado, declara <code>Supplier&lt;Double&gt; random</code> con una lambda sin parámetros que devuelva <code>Math.random()</code>. Luego declara <code>double num</code> con <code>random.get()</code>.<br><strong>Resultado esperado:</strong> <code>num</code> es un número decimal aleatorio mayor o igual que 0 y menor que 1. No imprime nada.`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Con los imports ya listos, crea un generador <code>Random r = new Random(42);</code> con semilla fija 42. Declara <code>Supplier&lt;Integer&gt; random</code> con una lambda sin parámetros que devuelva <code>r.nextInt(100)</code>. Luego declara <code>int num = random.get();</code>.<br><strong>Comportamiento:</strong> <code>num</code> almacena el entero determinista <code>30</code>. No imprime nada.`
- **Starter ACTUAL:**
  ```java
  import java.util.function.Supplier;
  ```
- **Starter PROPUESTO:**
  ```java
  import java.util.Random;
  import java.util.function.Supplier;
  ```
- **Solución ACTUAL:**
  ```java
  Supplier<Double> random = () -> Math.random();
  double num = random.get();
  ```
- **Solución PROPUESTA:**
  ```java
  Random r = new Random(42);
  Supplier<Integer> random = () -> r.nextInt(100);
  int num = random.get();
  ```
- **Cambio en `data.js` y `validator.js`:**
  - `validation.requiredKeywords`: `["Random", "Supplier", "get"]`.
  - Regla 148 en `validator.js`: `missing: 'Falta crear Random, el Supplier y su lectura con get.'`.

---

### Ejercicio 133 — Assert y Flag `-ea`

#### ID 133: Assert (Avanzado — Lección 32: Excepciones Personalizadas)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Considera que <code>int edad = -5;</code> ya está declarada. Escribe una aserción con <code>assert</code> que compruebe <code>edad &gt;= 0</code> y use el mensaje <code>Edad no puede ser negativa</code> (separado de la condición con <code>:</code>).<br><strong>Resultado esperado:</strong> si el programa corre con <code>-ea</code>, se lanza <code>AssertionError: Edad no puede ser negativa</code>. Sin esa opción las aserciones están desactivadas y no pasa nada.`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Considera que <code>int edad = -5;</code> ya está declarada. Escribe una aserción con <code>assert</code> que compruebe <code>edad &gt;= 0</code> y use el mensaje <code>Edad no puede ser negativa</code> (separado de la condición con <code>:</code>). <em>Nota: en Java estándar, las aserciones solo se evalúan si se pasa el flag <code>-ea</code> (-enableassertions) a la JVM; por defecto la máquina virtual las ignora.</em><br><strong>Salida esperada (con -ea):</strong> al ejecutarse con la opción <code>-ea</code> activada, el programa lanza <code>AssertionError: Edad no puede ser negativa</code>.`
- **Starter y Solución:** *Sin cambios* (`assert edad >= 0 : "Edad no puede ser negativa";`).

---

### Ejercicios con Etiqueta Uniforme "Comportamiento:" (170, 174, 176, 182, 186)

#### ID 170: Runnable Interface (Experto — Lección 43: Threads y Runnable)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Crea la clase pública <code>MiRunnable</code> que <code>implements Runnable</code> y define el método <code>run()</code> para que imprima <code>Ejecutando</code>. No hace falta <code>main</code>.<br><strong>Resultado esperado:</strong> una clase <code>MiRunnable</code> que implementa <code>Runnable</code>; con <code>new Thread(new MiRunnable()).start()</code> se vería <code>Ejecutando</code>.`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Crea la clase pública <code>MiRunnable</code> que <code>implements Runnable</code> y define el método <code>run()</code> para que imprima <code>Ejecutando</code>. No hace falta <code>main</code>.<br><strong>Comportamiento:</strong> una clase <code>MiRunnable</code> que implementa <code>Runnable</code>; con <code>new Thread(new MiRunnable()).start()</code> se vería <code>Ejecutando</code>.`

#### ID 174: Synchronized Method (Experto — Lección 44: Sincronización y Locks)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Considera que la clase ya tiene el campo <code>private int contador = 0;</code>. Agrega el método <code>public synchronized void incrementar()</code> que haga <code>contador++</code>.<br><strong>Resultado esperado:</strong> un método <code>incrementar()</code> marcado con <code>synchronized</code>, de modo que solo un hilo a la vez pueda incrementar <code>contador</code>.`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Considera que la clase ya tiene el campo <code>private int contador = 0;</code>. Agrega el método <code>public synchronized void incrementar()</code> que haga <code>contador++</code>.<br><strong>Comportamiento:</strong> un método <code>incrementar()</code> marcado con <code>synchronized</code>, de modo que solo un hilo a la vez pueda incrementar <code>contador</code>.`

#### ID 176: Volatile Variable (Experto — Lección 44: Sincronización y Locks)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Declara un campo privado de tipo <code>boolean</code> llamado <code>activo</code>, con valor inicial <code>true</code>, que todos los hilos vean actualizado al instante (para eso se usa el modificador <code>volatile</code>).<br><strong>Resultado esperado:</strong> una declaración de <code>activo</code> con el modificador <code>volatile</code>, inicializada en <code>true</code> (no imprime nada).`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Declara un campo privado de tipo <code>boolean</code> llamado <code>activo</code>, con valor inicial <code>true</code>, que todos los hilos vean actualizado al instante (para eso se usa el modificador <code>volatile</code>).<br><strong>Comportamiento:</strong> una declaración de <code>activo</code> con el modificador <code>volatile</code>, inicializada en <code>true</code> (no imprime nada).`

#### ID 182: CyclicBarrier (Experto — Lección 45: Executor Service)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Crea una <code>CyclicBarrier</code> llamada <code>barrier</code> para 3 hilos y agrega un comentario que diga que cada hilo llamará a <code>await()</code> en la barrera.<br><strong>Resultado esperado:</strong> una barrera <code>barrier</code> para 3 hilos (no imprime nada).`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Crea una <code>CyclicBarrier</code> llamada <code>barrier</code> para 3 hilos y agrega un comentario que diga que cada hilo llamará a <code>await()</code> en la barrera.<br><strong>Comportamiento:</strong> una barrera <code>barrier</code> para 3 hilos (no imprime nada).`

#### ID 186: BlockingQueue (Experto — Lección 44: Sincronización y Locks)
- **Texto ACTUAL (`description`):**  
  `<strong>Qué hacer:</strong> Declara <code>BlockingQueue&lt;String&gt; cola = new ArrayBlockingQueue&lt;&gt;(10);</code>, inserta <code>"elemento"</code> con <code>cola.put</code> y sácalo con <code>String item = cola.take();</code> (ambos lanzan <code>InterruptedException</code>: van en un método con <code>throws</code>).<br><strong>Resultado esperado:</strong> <code>item</code> vale <code>elemento</code> y la cola queda vacía (no imprime nada).`
- **Texto PROPUESTO (`description`):**  
  `<strong>Qué hacer:</strong> Declara <code>BlockingQueue&lt;String&gt; cola = new ArrayBlockingQueue&lt;&gt;(10);</code>, inserta <code>"elemento"</code> con <code>cola.put</code> y sácalo con <code>String item = cola.take();</code> (ambos lanzan <code>InterruptedException</code>: van en un método con <code>throws</code>).<br><strong>Comportamiento:</strong> <code>item</code> vale <code>elemento</code> y la cola queda vacía (no imprime nada).`

---

## 3. Matriz de Estado Final

| ID | Título (`data.js`) | Nivel | Lección | Estado Fase 1 | Veredicto Auditoría C-20 | Ajuste Aprobado Fase 2 |
|:---:|---|---|---|:---:|:---:|---|
| **33** | `Scanner Leer Int` | Principiante | Lección 5 | Aprobado | `OK` | Consigna: "Salida esperada (pantalla)" |
| **34** | `Scanner Leer String` | Principiante | Lección 5 | Aprobado | `OK` | Consigna: "Salida esperada (pantalla)" |
| **35** | `Scanner Múltiples Datos` | Principiante | Lección 5 | Aprobado | `CONSIGNA AMBIGUA` | Consigna: "Salida esperada (pantalla)" |
| **36** | `Scanner Validar Entrada` | Principiante | Lección 5 | Aprobado | `OK` | Consigna: "Salida esperada (pantalla)" |
| **37** | `Scanner en Bucle` | Principiante | Lección 5 | Aprobado | `CONSIGNA AMBIGUA` | Consigna: "Salida esperada (pantalla)" |
| **38** | `Scanner Cerrar` | Principiante | Lección 5 | Aprobado | `CONSIGNA AMBIGUA` | Starter + Solución (`import`), Consigna, Regla 38 tolerante |
| **39** | `Scanner Try-With-Resources` | Principiante | Lección 5 | Aprobado | `CONSIGNA AMBIGUA` | Consigna: "Salida esperada (pantalla)" |
| **40** | `Scanner Leer Double` | Principiante | Lección 5 | Aprobado | `DEPENDE DEL ENTORNO` | Starter, Solución y Consigna con `Locale.US` |
| **128** | `Try-With-Resources` | Avanzado | Lección 33 | Aprobado | `DEPENDE DEL ENTORNO` | Sin cambios (limitación aceptada de archivos) |
| **133** | `Assert` | Avanzado | Lección 32 | Aprobado | `DEPENDE DEL ENTORNO` | Consigna: nota explicativa de flag `-ea` |
| **148** | `Supplier Get` | Avanzado | Lección 35 | Aprobado | `CONSIGNA AMBIGUA` | Starter, Solución (`Random(42)` / `30`), Consigna y Regla 148 |
| **162-168** | Archivos I/O (7 ej.) | Avanzado | Lección 41 | Aprobado | `DEPENDE DEL ENTORNO` | Sin cambios (limitación aceptada de archivos) |
| **170** | `Runnable Interface` | Experto | Lección 43 | Aprobado | `CONSIGNA AMBIGUA` | Consigna: "Comportamiento:" |
| **174** | `Synchronized Method` | Experto | Lección 44 | Aprobado | `CONSIGNA AMBIGUA` | Consigna: "Comportamiento:" |
| **176** | `Volatile Variable` | Experto | Lección 44 | Aprobado | `CONSIGNA AMBIGUA` | Consigna: "Comportamiento:" |
| **178** | `ExecutorService` | Experto | Lección 45 | Aprobado | `OK` | Validador: exigir `shutdown` |
| **179** | `Callable Future` | Experto | Lección 45 | Aprobado | `CONSIGNA AMBIGUA` | Solución, Consigna y Validador con `shutdown()` |
| **181** | `CountDownLatch` | Experto | Lección 45 | Aprobado | `DEPENDE DEL ENTORNO` | Sin cambios (limitación aceptada concurrencia) |
| **182** | `CyclicBarrier` | Experto | Lección 45 | Aprobado | `CONSIGNA AMBIGUA` | Consigna: "Comportamiento:" |
| **186** | `BlockingQueue` | Experto | Lección 44 | Aprobado | `CONSIGNA AMBIGUA` | Consigna: "Comportamiento:" |
