# Proposal: c-22-content-fixes-from-audit

## Why

La auditoría de ejecución real en JDK (C-20, `docs/real-execution-audit.md`) identificó inconsistencias técnicas y ambigüedades en consignas de ejercicios (dependencia de Locale en `Scanner.nextDouble()`, omisión de `executor.shutdown()` en pools de concurrencia, no determinismo en `Supplier`, omisión de imports en el starter del ejercicio 38 y necesidad de explicitar `-ea` en `assert`). Es necesario formular una propuesta técnica precisa para corregir el contenido de forma consistente y armónica antes de aplicar cambios en producción.

## What Changes

- **Fase 1 (este change):** Elaboración y revisión del documento formal de propuesta [docs/content-fixes-proposal.md](file:///C:/Users/beluu/Documents/java-learning-platform/docs/content-fixes-proposal.md) con el detalle ejercicio por ejercicio.
- **Fase 2 (posterior a aprobación):**
  - Ejercicio 40: fijar `Locale.US` en starter y solución.
  - Ejercicio 38: agregar `import java.util.Scanner;` al starter, unificar solución y permitir en el validador la respuesta mínima `sc.close();`.
  - Ejercicios 178 y 179: incorporar y exigir `executor.shutdown()`.
  - Ejercicio 148: utilizar `Random(42)` determinista con valor exacto verificado (`30`).
  - Ejercicio 133: explicitar la necesidad de la bandera `-ea` en la consigna.
  - Ejercicios 33 a 40: estandarizar didácticamente la sección de salida esperada distinguiendo el prompt de la entrada.
  - Ejercicios 128, 162-168 y 181: documentar formalmente la dependencia del entorno como limitación aceptada de la validación estática offline.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None (`skip_specs: true` declarado en `.openspec.yaml`, no se modifican comportamientos funcionales de especificaciones existentes).

## Impact

- `docs/content-fixes-proposal.md`: nuevo documento con la matriz completa de propuestas.
- `CHANGES.md`: registro del change C-22 como propuesta pendiente.
- Sin cambios en `data.js`, `validator.js`, frontend ni backend durante la Fase 1.
