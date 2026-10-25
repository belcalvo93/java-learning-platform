# Design: c-22-content-fixes-from-audit

## Context

Ver `proposal.md` para la motivación. La auditoría C-20 (`docs/real-execution-audit.md`) auditó 38 ejercicios canónicos con compilación y ejecución real en JDK 21. Se detectaron ejercicios cuya ejecución real dependía de configuraciones regionales del sistema operativo (`Locale`), del flag `-ea`, o de recursos externos, así como textos didácticos en consignas que no distinguían claramente la salida del prompt. En esta Fase 1, se diseñan las correcciones propuestas sin tocar archivos de producción.

## Goals / Non-Goals

**Goals:**
- Proponer soluciones técnicas mínimas y no invasivas para cada ejercicio con veredicto `CONSIGNA AMBIGUA` o `DEPENDE DEL ENTORNO`.
- Probar experimentalmente con JDK local 21 cada propuesta para garantizar que compila y ejecuta determinísticamente.
- Establecer con precisión el impacto en `data.js` y `validator.js` para la Fase 2.

**Non-Goals:**
- Modificar `data.js`, `validator.js` o frontend en esta fase (prohibido por regla dura).
- Agregar librerías o dependencias externas.
- Alterar las 52 lecciones o 208 ejercicios (invariante estricto).

## Decisions

### Decisión 1: Ajustar consignas y prompts en lugar de alterar firmas de ejercicios básicos (IDs 33-40)
- **Alternativa A (descartada):** Agregar `System.out.println` al final de todas las soluciones para volcar el valor leído.
- **Alternativa B (elegida):** Ajustar la sección didáctica `Salida esperada (pantalla):` para clarificar la distinción entre el prompt y la entrada del usuario.
- **Razón:** Preserva el valor pedagógico del starter y la solución mínima sin sobrecargar a los alumnos principiantes con código repetitivo.

### Decisión 2: Fijar `Locale.US` en el ejercicio 40
- **Alternativa A (descartada):** Cambiar el ejercicio para leer cadenas o enteros.
- **Alternativa B (elegida):** Incluir `sc.useLocale(Locale.US)` en starter y solución.
- **Razón:** Es la práctica idiomática estándar en Java para procesar números flotantes con punto decimal de forma agnóstica a la configuración regional del sistema.

### Decisión 3: Semilla fija `Random(42)` en el ejercicio 148
- **Alternativa A (descartada):** Dejar `Math.random()` y relajar el comparador a regex/rango.
- **Alternativa B (elegida):** Usar `new Random(42)` con `nextInt(100)` produciendo el valor entero `30`.
- **Razón:** Permite determinismo exacto tanto en pruebas automatizadas como en verificación didáctica en consola.

### Decisión 4: Requerir `executor.shutdown()` en ejercicios 178 y 179
- **Alternativa A (descartada):** Marcar los hilos como daemon mediante `ThreadFactory`.
- **Alternativa B (elegida):** Exigir `executor.shutdown()` al final del bloque en consigna, solución y validador.
- **Razón:** Refleja la buena práctica fundamental de concurrencia en Java y evita procesos zombi o timeouts.

### Decisión 5: Documentar archivos (128, 162-168) y CountDownLatch (181) como limitación aceptada
- **Alternativa A (descartada):** Reescribir las lecciones de I/O para no usar archivos.
- **Alternativa B (elegida):** Mantener las soluciones intactas y documentar que su verificación en producción es 100% estructural en el navegador (RN-CON-02 / RN-SEG-02).
- **Razón:** Preserva la enseñanza de `java.nio.file.Files` y `BufferedReader` sin comprometer la arquitectura cliente-servidor actual.

## Risks / Trade-offs

- [Riesgo de invalidar soluciones guardadas en localStorage] → **Mitigación:** Las reglas del validador se mantendrán tolerantes, aceptando tanto la versión histórica como la nueva versión mejorada.
- [Riesgo de que el alumno omita el starter en el ejercicio 38] → **Mitigación:** Configurar la regla 38 en `STRUCT_RULES` para que acepte tanto el bloque completo como `sc.close();` solo.
