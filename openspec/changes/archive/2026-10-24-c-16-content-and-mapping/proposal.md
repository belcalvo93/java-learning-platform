# Proposal

## Why

El contenido de las lecciones y ejercicios de JavaMaster presenta inconsistencias puntuales identificadas en auditorías previas (`docs/content-review-notes.md`, `docs/validator-audit.md` y `CHANGES.md`): soluciones canónicas con aserciones erróneas o llamadas bloqueantes (ejercicios 205, 181, 129), starters con llaves desbalanceadas o sin imports necesarios (ejercicios 124, 168, 192, 207), soluciones con estilo no idiomático (ejercicio 19) y starters que se benefician de scaffolding más claro (84, 85, 107, 110, 115, 117).
Corregir estos detalles garantiza coherencia pedagógica, calidad del material y evita frustraciones del estudiante sin alterar los invariantes de la plataforma (52 lecciones, 208 ejercicios, ids intactos).

## What Changes

- **Soluciones canónicas corregidas**:
  - `id 205`: solución corregida para usar `assertEquals(4, suma(2, 2))` y nombre de método coherente con la consigna (`testSuma`).
  - `id 181`: precisión conceptual en comentarios de `CountDownLatch`.
  - `id 129`: aclaración en consigna y try-catch sobre multi-catch.
  - `id 19`: formateo estándar con bloques y llaves en la solución de condicionales.
- **Starters completados y guiados**:
  - `id 124`: cierre de llaves del método en el starter con marcador `// Tu código acá`.
  - `id 168, 192, 207`: agregado de imports requeridos en el starter (`Stream`, `java.util.*`, `Assertions.*`).
  - `id 84, 85, 107, 110, 115, 117`: placeholders claros en los starters.
- **Validación**:
  - Ajuste puntual de regla estructural para el ejercicio 205 para validar la nueva solución canónica y sus variantes.
- **Lecciones de lectura**:
  - Confirmación de la asignación y visualización de las lecciones sin ejercicios (22, 25, 40, 42).

## Capabilities

### Modified Capabilities
- `course-content`: Corrección de soluciones canónicas, starters y consignas específicas para los ejercicios reportados, preservando invariantes 52/208.
- `validator-structural`: Sincronización de reglas estructurales para los ejercicios cuyas soluciones canónicas se ajustan (específicamente ejercicio 205).

## Impact

- `data.js`: Actualización controlada de campos `solution`, `starterCode` y `description` de los ejercicios afectados. Sin cambios en IDs, títulos, módulos ni lecciones.
- `validator.js`: Ajuste de tokens en regla de ejercicio 205 para aceptar `testSuma` / `testFalla`.
- Pruebas / herramientas: Ejecución de `tools/audit-validator.js` y tests en `tools/` para certificar que el 100% de los ejercicios pasan y los invariantes se mantienen intactos.
