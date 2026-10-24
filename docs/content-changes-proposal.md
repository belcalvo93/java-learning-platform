# Propuesta detallada de cambios de contenido — C-16 Fase 1

> Documento generado en la Fase 1 del change `c-16-content-and-mapping`.
> **Estado:** Propuesta para revisión y aprobación del usuario. **No se modificó `data.js` ni ningún archivo de producción.**
> **Alcance:** Correcciones puntuales sobre consignas, soluciones canónicas y starters de ejercicios identificados con inconsistencias en `docs/content-review-notes.md`, `docs/validator-audit.md` y `CHANGES.md`.

---

## 1. Resumen de la propuesta

- **Total de ítems relevados para corrección:** 14 ejercicios (8 soluciones/consignas + 6 starters que validaban anticipadamente).
- **Lecciones de lectura (sin ejercicios):** 4 lecciones verificadas (22, 25, 40, 42).
- **Invariantes preservados:** 52 lecciones (15 principiante, 15 intermedio, 12 avanzado, 10 experto), 208 ejercicios, todos los `id` intactos, sin renumerar ni reordenar.
- **Impacto en `validator.js`:** 
  - El ejercicio **205** requiere actualizar su solución canónica en `data.js` Y su regla estructural en `validator.js` (o agregar `testSuma` como variante válida) para que la solución corregida pase el validador estructural.
  - Los ejercicios **84, 85, 107, 110, 115, 117** tienen reglas en `validator.js` que exigen la inicialización / declaración; ajustar sus starters para que no contengan la solución ya fue resuelto a nivel de reglas por C-18 (los starters no pasan vacíos). Se propone además limpiar los starters para que sean scaffolding limpio (`// Tu código acá`).
  - Los ejercicios **19, 124, 129, 168, 181, 192, 207** no requieren cambios de lógica en `validator.js`; sus reglas estructurales aceptan las soluciones propuestas.

---

## 2. Catálogo detallado de ítems (14 ejercicios)

### Ítem 1: Ejercicio 205 — TDD Red-Green-Refactor
- **Nivel:** Experto
- **Lección:** 51 (Clean Code y Refactor)
- **Problema / Evidencia:**
  - La consigna pide: `En Red, un método @Test void testSuma() que use assertEquals(4, suma(2, 2))`.
  - La solución en `data.js` tiene: `@Test void testFalla() { assertEquals(5, suma(2,2)); }`.
  - En un runner real o JUnit, esa prueba espera 5 para `suma(2,2)` y fallaría aun cuando `suma` esté correctamente implementada. Además, el nombre del método en la consigna es `testSuma()` y la solución usa `testFalla()`.
- **Texto actual vs Texto propuesto:**
  - **Starter actual:**
    ```java
    // Escribe tu código aquí
    ```
  - **Starter propuesto:**
    ```java
    // Escribe tu código aquí
    ```
    *(Sin cambios)*
  - **Consigna actual:**
    ```html
    <strong>Qué hacer:</strong> Escribe las tres fases con comentarios <code>// 1. Red</code>, <code>// 2. Green</code> y <code>// 3. Refactor</code>. En Red, un método <code>@Test void testSuma()</code> que use <code>assertEquals(4, suma(2, 2))</code>; en Green, el método mínimo <code>int suma(int a, int b) { return a + b; }</code>; en Refactor, un comentario sobre cómo mejorarías el código.<br><strong>Resultado esperado:</strong> la prueba de la fase Red falla mientras <code>suma</code> no exista, y pasa tras la fase Green (no imprime nada).
    ```
  - **Consigna propuesta:** *(Alineada con la solución canónica limpia)*
    ```html
    <strong>Qué hacer:</strong> Escribe las tres fases con comentarios <code>// 1. Red</code>, <code>// 2. Green</code> y <code>// 3. Refactor</code>. En Red, un método <code>@Test void testSuma()</code> que use <code>assertEquals(4, suma(2, 2))</code>; en Green, el método mínimo <code>int suma(int a, int b) { return a + b; }</code>; en Refactor, un comentario sobre cómo mejorarías el código.<br><strong>Resultado esperado:</strong> la prueba de la fase Red falla mientras <code>suma</code> no exista o devuelva otro valor, y pasa tras la fase Green (no imprime nada).
    ```
  - **Solución actual:**
    ```java
    // 1. Red: escribe test que falla
    @Test void testFalla() { assertEquals(5, suma(2,2)); }
    // 2. Green: implementa mínimo para pasar
    int suma(int a, int b) { return a + b; }
    // 3. Refactor: mejora el código
    ```
  - **Solución propuesta:**
    ```java
    // 1. Red: escribe test que falla
    @Test void testSuma() { assertEquals(4, suma(2, 2)); }
    // 2. Green: implementa mínimo para pasar
    int suma(int a, int b) { return a + b; }
    // 3. Refactor: mejora el código
    ```
- **Impacto en `validator.js`:**
  - **REQUIERE MODIFICAR `validator.js` (o regla 205):** La regla 205 en `validator.js` hoy usa `tokensMatch` contra `exercise.solution` (que hoy tiene `testFalla` y `5`). Si se actualiza la solución canónica en `data.js`, la regla automática toma la nueva solución, pero si se quiere aceptar tanto `testFalla` como `testSuma` o si `validator.js` tiene variantes pre-compiladas, debe sincronizarse.

---

### Ítem 2: Ejercicio 181 — CountDownLatch
- **Nivel:** Experto
- **Lección:** 45 (Executor Service)
- **Problema / Evidencia:**
  - La solución llama `latch.await()` sin que ningún hilo invoque `countDown()`. En un entorno con ejecución real (o si el estudiante copia la solución a un `main`), el hilo principal se bloquea indefinidamente (deadlock por espera eterna).
  - La consigna advierte: `agrega un comentario que diga que cada hilo debe llamar a countDown()`.
- **Texto actual vs Texto propuesto:**
  - **Consigna actual:**
    ```html
    <strong>Qué hacer:</strong> Crea un <code>CountDownLatch</code> llamado <code>latch</code> con cuenta inicial 3, agrega un comentario que diga que cada hilo debe llamar a <code>countDown()</code> y llama al método <code>await()</code> del latch. Ojo: en un programa real <code>await()</code> espera para siempre si ningún hilo llama a <code>countDown()</code> tres veces, y lanza <code>InterruptedException</code>.<br><strong>Resultado esperado:</strong> <code>latch</code> con cuenta inicial 3; la espera termina cuando los hilos hayan llamado a <code>countDown()</code> tres veces.
    ```
  - **Solución actual:**
    ```java
    CountDownLatch latch = new CountDownLatch(3);
    // En cada thread: latch.countDown();
    latch.await();
    ```
  - **Solución propuesta (Opción A - Mantener snippet conceptual con comentario preciso):**
    ```java
    CountDownLatch latch = new CountDownLatch(3);
    // En cada hilo de trabajo: latch.countDown();
    latch.await();
    ```
  - *(Ver Pregunta Abierta 1 sobre si expandir a simulación ejecutable o mantenerlo como snippet conceptual).*
- **Impacto en `validator.js`:** Ninguno. La regla 181 valida `CountDownLatch`, `3` y `await()`.

---

### Ítem 3: Ejercicio 129 — Multi-Catch
- **Nivel:** Avanzado
- **Lección:** 31 (Manejo de Excepciones)
- **Problema / Evidencia:**
  - La solución actual tiene: `try { // código } catch (IOException | SQLException e) { ... }`.
  - En Java estándar, si el bloque `try` no invoca métodos que declaren checked exceptions (`IOException` o `SQLException`), el compilador javac da error: `unreachable catch block: exception ... is never thrown in body of corresponding try statement`.
- **Texto actual vs Texto propuesto:**
  - **Consigna actual:**
    ```html
    <strong>Qué hacer:</strong> Escribe un <code>try</code> con un único <code>catch</code> que atrape <code>IOException</code> y <code>SQLException</code> a la vez usando el símbolo <code>|</code>, y que imprima el mensaje indicado.<br><strong>Salida esperada:</strong> <code>Error de I/O o BD</code> (solo se imprime si el <code>try</code> lanza una de esas dos excepciones).
    ```
  - **Consigna propuesta:**
    ```html
    <strong>Qué hacer:</strong> Escribe un bloque <code>try</code> con un método hipotético que lance excepciones (o simula la llamada) y un único <code>catch</code> que atrape <code>IOException</code> y <code>SQLException</code> a la vez usando el operador <code>|</code>, imprimiendo <code>Error de I/O o BD</code>.<br><strong>Salida esperada:</strong> <code>Error de I/O o BD</code> (se imprime al atrapar cualquiera de las dos excepciones).
    ```
  - **Solución actual:**
    ```java
    try {
        // código
    } catch (IOException | SQLException e) {
        System.out.println("Error de I/O o BD");
    }
    ```
  - **Solución propuesta:**
    ```java
    try {
        // código que puede lanzar IOException o SQLException
    } catch (IOException | SQLException e) {
        System.out.println("Error de I/O o BD");
    }
    ```
- **Impacto en `validator.js`:** Ninguno. La regla 129 valida los tokens `try`, `catch`, `IOException`, `|`, `SQLException`, `println`.

---

### Ítem 4: Ejercicio 124 — Throw Exception
- **Nivel:** Avanzado
- **Lección:** 31 (Manejo de Excepciones)
- **Problema / Evidencia:**
  - El starter abre el método: `public void validar(int edad) {`.
  - La solución actual solo provee el bloque `if`:
    ```java
    if (edad < 0) {
        throw new IllegalArgumentException("Edad negativa");
    }
    ```
  - El starter no tiene la llave de cierre `}` del método. Si el alumno completa el cuerpo adentro, debe quedar claro si debe cerrar la llave del método o si el starter ya debería cerrarla.
- **Texto actual vs Texto propuesto:**
  - **Starter actual:**
    ```java
    public void validar(int edad) {
    ```
  - **Starter propuesto:**
    ```java
    public void validar(int edad) {
        // Tu código acá
    }
    ```
  - **Solución actual:**
    ```java
    if (edad < 0) {
        throw new IllegalArgumentException("Edad negativa");
    }
    ```
  - **Solución propuesta:**
    ```java
    public void validar(int edad) {
        if (edad < 0) {
            throw new IllegalArgumentException("Edad negativa");
        }
    }
    ```
- **Impacto en `validator.js`:**
  - La regla 124 tiene `ctx: ['edad']`. Acepta tanto el cuerpo suelto como el método completo si se configuran los tokens de contexto.

---

### Ítem 5: Ejercicio 19 — Else If Nota
- **Nivel:** Principiante
- **Lección:** 7 (Estructuras Condicionales if-else)
- **Problema / Evidencia:**
  - La consigna pide una cadena `if` / `else if` / `else`.
  - La solución canónica está escrita en una sola línea cruda y sin llaves: `if (n >= 90) s="A"; else if (n >= 70) s="B"; else s="F";`. Pedagógicamente es una mala práctica para un estudiante principiante no usar bloques con llaves.
- **Texto actual vs Texto propuesto:**
  - **Solución actual:**
    ```java
    if (n >= 90) s="A"; else if (n >= 70) s="B"; else s="F";
    ```
  - **Solución propuesta:**
    ```java
    if (n >= 90) {
        s = "A";
    } else if (n >= 70) {
        s = "B";
    } else {
        s = "F";
    }
    ```
- **Impacto en `validator.js`:**
  - Ninguno. La regla 19 (C-18) ya valida flexiblemente la estructura sin importar saltos de línea ni llaves opcionales.

---

### Ítem 6: Ejercicio 168 — Files Lines Stream
- **Nivel:** Avanzado
- **Lección:** 41 (File I/O y NIO.2)
- **Problema / Evidencia:**
  - La solución usa `Files`, `Path`, `Stream`.
  - El starter solo importa `java.nio.file.*`, pero falta `import java.util.stream.Stream;`. La consigna menciona `(y java.util.stream.Stream)`, pero el starter no lo incluye.
- **Texto actual vs Texto propuesto:**
  - **Starter actual:**
    ```java
    import java.nio.file.*;
    ```
  - **Starter propuesto:**
    ```java
    import java.nio.file.*;
    import java.util.stream.Stream;
    ```
  - **Solución:** Intacta.
- **Impacto en `validator.js`:** Ninguno (la regla 168 ignora imports y valida el pipeline).

---

### Ítem 7: Ejercicio 192 — Observer Pattern
- **Nivel:** Experto
- **Lección:** 49 (Patrones Comportamiento)
- **Problema / Evidencia:**
  - La solución utiliza `List` y `ArrayList`.
  - El starter actual dice `// Escribe tu programa completo aquí`. No incluye `import java.util.*;`. La consigna aclara `(agrega import java.util.*;)`, pero en Java vanilla sin imports de starter el alumno suele olvidar el import y frustrarse.
- **Texto actual vs Texto propuesto:**
  - **Starter actual:**
    ```java
    // Escribe tu programa completo aquí
    ```
  - **Starter propuesto:**
    ```java
    import java.util.*;

    // Escribe las interfaces y clases aquí
    ```
  - **Solución:** Intacta.
- **Impacto en `validator.js`:** Ninguno.

---

### Ítem 8: Ejercicio 207 — Parametrized Test
- **Nivel:** Experto
- **Lección:** 52 (Testing Unitario JUnit)
- **Problema / Evidencia:**
  - La consigna dice: `agrega import static org.junit.jupiter.api.Assertions.*;`.
  - El starter importa `@ParameterizedTest` y `@ValueSource`, pero no la aserción `assertTrue`.
- **Texto actual vs Texto propuesto:**
  - **Starter actual:**
    ```java
    import org.junit.jupiter.params.ParameterizedTest;
    import org.junit.jupiter.params.provider.ValueSource;
    ```
  - **Starter propuesto:**
    ```java
    import org.junit.jupiter.params.ParameterizedTest;
    import org.junit.jupiter.params.provider.ValueSource;
    import static org.junit.jupiter.api.Assertions.*;
    ```
  - **Consigna:** Se simplifica quitando la aclaración redundante de importar la aserción.
  - **Solución:** Intacta.
- **Impacto en `validator.js`:** Ninguno.

---

### Ítems 9 a 14: Starters que proveían elementos de la solución (84, 85, 107, 110, 115, 117)
- **Problema / Evidencia:**
  - En la auditoría original de C-16, estos starters traían palabras clave que hacían que un código incompleto pasara.
  - Con C-18, las reglas estructurales ya exigen la inicialización y el cuerpo completo, pero los starters pueden ser más claros como plantillas de trabajo.
- **Detalle de propuestas:**
  - **ID 84 (Bloque Static, Lección 26):**
    - *Starter actual:*
      ```java
      public class Config {
          static String url;
      }
      ```
    - *Starter propuesto:*
      ```java
      public class Config {
          static String url;
          
          // Escribe el bloque static aquí
      }
      ```
  - **ID 85 (Clase Interna, Lección 24):**
    - *Starter actual:*
      ```java
      public class Externa {
      }
      ```
    - *Starter propuesto:*
      ```java
      public class Externa {
          // Declara la clase interna aquí
      }
      ```
  - **ID 107 (HashSet Crear, Lección 28):**
    - *Starter actual:* `import java.util.HashSet;`
    - *Starter propuesto:* `import java.util.HashSet;\n\n// Declara e inicializa el HashSet aquí`
  - **ID 110 (HashMap Crear, Lección 29):**
    - *Starter actual:* `import java.util.HashMap;`
    - *Starter propuesto:* `import java.util.HashMap;\n\n// Declara e inicializa el HashMap aquí`
  - **ID 115 (LinkedList Crear, Lección 27):**
    - *Starter actual:* `import java.util.LinkedList;`
    - *Starter propuesto:* `import java.util.LinkedList;\n\n// Declara e inicializa la LinkedList aquí`
  - **ID 117 (TreeSet Ordenado, Lección 28):**
    - *Starter actual:* `import java.util.TreeSet;`
    - *Starter propuesto:* `import java.util.TreeSet;\n\n// Declara el TreeSet y agrega los números aquí`

---

## 3. Lecciones de solo lectura (22, 25, 40, 42)

- **Verificación realizada:**
  - Lección 22: *Composición vs Herencia* (Módulo Intermedio)
  - Lección 25: *Paquetes y Organización* (Módulo Intermedio)
  - Lección 40: *Parallel Streams* (Módulo Avanzado)
  - Lección 42: *Serialización* (Módulo Avanzado)
- **Estado verificado:**
  - Todas tienen la sección `<h3>🧪 Lo que vas a practicar</h3>` indicando explícitamente: `<p>Esta lección es de lectura: no tiene ejercicios propios. Marca la lección como completada cuando la hayas entendido.</p>`.
  - El frontend y el mapa de lecciones ya ocultan el botón "Practicar" y muestran "Marcar como completada" como acción principal. No se requieren cambios en `script.js` para estas lecciones.

---

## 4. Preguntas abiertas para decisión de la usuaria

1. **Ejercicio 205 (TDD):** ¿Aceptás cambiar la solución canónica en `data.js` a `assertEquals(4, suma(2, 2))` y sincronizar `validator.js` para que acepte tanto `testSuma` como `testFalla`? (Recomendado: Sí, para evitar la confusión de que la prueba falle conceptualmente).
2. **Ejercicio 181 (CountDownLatch):** ¿Mantenemos la solución como snippet conceptual con comentario explicativo `// En cada hilo: latch.countDown();` o preferís un ejemplo con hilos completos simulados? (Recomendado: mantener snippet conciso para no complejizar el ejercicio).
3. **Ejercicio 124 (Throw Exception):** ¿Preferís que el starter cierre el método `}` y el alumno escriba adentro, o que el starter sea solo la firma y el alumno cierre la llave? (Recomendado: cerrar la llave en el starter con `// Tu código acá` adentro).
