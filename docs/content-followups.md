# Seguimiento de contenido pendiente (Follow-ups) — C-16 / C-20 / C-22

> Este documento registra el estado y seguimiento de los hallazgos de contenido derivados de las auditorías de validación y ejecución real en JDK (C-16, C-20 y C-22).
> Todos los títulos, niveles y lecciones provienen directamente de `data.js` y `lessonsData` (script.js).

---

## 1. Comparativa de Veredictos de Auditoría Real (C-20 vs. C-22)

La auditoría sobre los 38 ejercicios en alcance arroja la siguiente evolución:

| Categoría de Veredicto | Cantidad en C-20 (Línea Base) | Cantidad en C-22 (Post-Correcciones) | Variación | Causa del Cambio |
|---|:---:|:---:|:---:|---|
| **OK** | 16 | **27** | +11 | Se homogeneizaron las etiquetas descriptivas a `Salida esperada (pantalla):` y `Comportamiento:`, se aplicó semilla fija en 148 y `shutdown()` en 178/179. |
| **CONSIGNA AMBIGUA** | 12 | **1** | -11 | 11 ejercicios (35, 37, 38, 39, 148, 170, 174, 176, 179, 182, 186) ya no tienen discrepancias textuales entre la salida real y la consigna. Solo permanece el ID 181. |
| **DEPENDE DEL ENTORNO** | 10 | **10** | 0 | 8 ejercicios de archivos en disco (128, 162-168), 1 de assert con flag `-ea` (133), y 1 de locale (40). |
| **NO COMPILA** | 0 | **0** | 0 | Todos los 38 ejercicios compilan limpiamente en JDK 21. |
| **SOLUCIÓN INCORRECTA** | 0 | **0** | 0 | Ningún ejercicio lanza errores en tiempo de ejecución. |
| **TOTAL** | **38** | **38** | — | Total auditado idéntico y consistente. |

---

## 2. Aclaración Técnica: Ejercicio 40 (`Scanner Leer Double`) y "Depende del Entorno"

El ejercicio 40 sigue catalogado como **`DEPENDE DEL ENTORNO`** en el reporte automático de `tools/audit-real-execution.js` por una razón técnica específica del diseño de la herramienta:
- **Lógica de la herramienta (`tools/audit-real-execution.js`, líneas 570-584):** para auditar el manejo regional, el script corre el programa dos veces: una inyectando `stdin: "3.5\n"` (formato punto) y otra con `stdin: "3,5\n"` (formato coma). El evaluador estipula que si existe divergencia entre ambas ejecuciones (`!resDot.runOk && resComma.runOk` o `resDot.runOk && !resComma.runOk`), el veredicto es `DEPENDE DEL ENTORNO`.
- **Comportamiento con `Locale.US`:** al aplicar `.useLocale(Locale.US)` en `data.js`, la JVM local acepta exitosamente `3.5` (`resDot.runOk = true`) y rechaza de forma estricta la coma `3,5` con `InputMismatchException` (`resComma.runOk = false`). Al haber disparidad de aceptación entre ambos formatos de entrada, la herramienta lo clasifica como `DEPENDE DEL ENTORNO`.
- **Efecto en Producción:** a nivel de la plataforma y del estándar Java, `Locale.US` eliminó por completo la dependencia del sistema operativo: el ejercicio ahora funciona idénticamente en cualquier computadora o servidor del mundo sin importar el idioma del sistema operativo, garantizando que el usuario siempre ingrese punto decimal.

---

## 3. Correcciones de Contenido Aplicadas en C-22 (`content-fixes-from-audit`)

Aprobadas por la usuaria y aplicadas en `data.js` y `validator.js`:

1. **Ejercicio 40: `Scanner Leer Double` (Principiante — Lección 5: Entrada y Salida con Scanner)**
   - **Solución implementada:** Se incluyó `import java.util.Locale;` y la llamada `.useLocale(Locale.US)` en el starterCode y la solución canónica. Starter incluye `// Escribe tu código aquí`. Consigna describe la configuración.
   - **Estado:** Resuelto.

2. **Ejercicios 33 a 40: Módulo Scanner (Principiante — Lección 5: Entrada y Salida con Scanner)**
   - **Solución implementada:** Se estandarizó la sección de salida con la etiqueta `Salida esperada (pantalla):`, distinguiendo explícitamente lo que tipea el usuario de lo que imprime el programa por consola, sin modificar las soluciones canónicas. En el ejercicio 39 se preservó íntegramente la nota pedagógica de que el Scanner se cierra solo al salir del bloque try.
   - **Estado:** Resuelto.

3. **Ejercicio 38: `Scanner Cerrar` (Principiante — Lección 5: Entrada y Salida con Scanner)**
   - **Solución implementada:** Se agregó `import java.util.Scanner;` y la línea `// Escribe tu código aquí` en el starterCode. Se configuró la regla 38 del validador con `alts: ['sc.close();']` (manteniendo `ctx: ['sc']`) para aceptar tanto el bloque completo como la instrucción suelta, preservando el rechazo de código incorrecto o trampas.
   - **Estado:** Resuelto.

4. **Ejercicios 178 (`ExecutorService`) y 179 (`Callable Future`) (Experto — Lección 45: Executor Service)**
   - **Solución implementada:** Se incorporó `executor.shutdown();` explícito en la solución canónica y consigna de ambos ejercicios, y se exigió `"shutdown"` en `validation.requiredKeywords`. En el ejercicio 179 se restauró textualmente la aclaración de que `get()` lanza excepciones comprobadas y en un programa real va dentro de un método con `throws Exception`.
   - **Estado:** Resuelto.

5. **Ejercicio 148: `Supplier Get` (Avanzado — Lección 35: Interfaces Funcionales)**
   - **Solución implementada:** Se reformuló el ejercicio para usar un generador determinista con semilla fija `Random r = new Random(42);` y `Supplier<Integer> random = () -> r.nextInt(100);`, resultando invariablemente en `30`. StarterCode incluye imports y la línea `// Escribe tu código aquí`. Consigna y regla 148 del validador sincronizadas.
   - **Estado:** Resuelto.

6. **Ejercicio 133: `Assert` (Avanzado — Lección 32: Excepciones Personalizadas)**
   - **Solución implementada:** Se agregó una nota didáctica en la consigna aclarando que en Java estándar las aserciones requieren la bandera `-ea` (`-enableassertions`) en la JVM. Se mantuvo la solución y validación estructural por reglas en el cliente.
   - **Estado:** Resuelto.

7. **Ejercicios 170, 174, 176, 182 y 186 (Experto — Lecciones 43, 44 y 45)**
   - **Solución implementada:** Se unificó la etiqueta didáctica reemplazando `Resultado esperado:` por `Comportamiento:`, evitando ambigüedades con salidas textuales crudas.
   - **Estado:** Resuelto.

---

## 4. Limitaciones Aceptadas de Ejecución Real (Seguimiento Residual / Backlog)

Estos ejercicios mantienen de forma definitiva o preferente su validación estructural por reglas en el navegador (RN-CON-02):

### A. Ejercicios con Archivos en Disco (128, 162, 163, 164, 165, 166, 167, 168)
- **Nivel y lecciones:**
  - ID 128 (`Try-With-Resources`): Avanzado (Lección 33: Try-with-Resources)
  - IDs 162 a 168 (File I/O y NIO.2): Avanzado (Lección 41: File I/O y NIO.2)
- **Condición:** Requieren archivos físicos (`archivo.txt`, `file.txt`) en el directorio de trabajo del proceso.
- **Decisión de diseño:** Es seguro y óptimo mantenerlos validados por reglas en el navegador sin tocar el disco del usuario. Si a futuro se habilita el ejecutor backend (C-06), el runner deberá inyectar archivos temporales automáticamente en el sandbox.

### B. Ejercicio 181: `CountDownLatch` (Experto — Lección 45: Executor Service)
- **Condición:** La solución canónica implementa `CountDownLatch latch = new CountDownLatch(3);`, una directiva explicativa en comentarios y la invocación bloqueante `latch.await()`.
- **Decisión de diseño:** En la auditoría con JDK real se simula la ejecución concurrente imprimiendo `"Latch liberado"`, lo cual difiere de la descripción didáctica ("cuenta inicial 3; la espera termina cuando..."). Se acepta como limitación pedagógica conocida; su validación estructural estática en cliente es la estrategia preferida.
