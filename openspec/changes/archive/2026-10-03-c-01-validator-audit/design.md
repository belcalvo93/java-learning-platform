# Design — c-01-validator-audit

## Context

Ver propuesta (`proposal.md` — Why). Estado real relevado en exploración
solo-lectura (no se modificó nada):

- `validator.js`: reglas específicas solo para ejercicios id 1–8
  (`validateHelloWorld`, `validateMultipleLines`, `validateIntVariable`,
  `validateStringVariable`, `validateSum`, `validateIfElse`,
  `validateComparison`, `validateForLoop`). Los id 9–208 caen en la rama
  `default`: `userCode === expectedCode || userCode.includes(expectedCode)`
  (`validator.js:151-163`), trivialmente engañable con el patrón incluido en
  comentario, string o código muerto.
- `data.js`: 208 ejercicios, ids 1–208 únicos y contiguos (verificado por
  conteo). Pero `lessonId` llega solo hasta 50 (50 lecciones distintas con
  ejercicios); las lecciones 51–52 de `script.js` quedarían sin ejercicios.
- `script.js`: `lessonsData` con 52 lecciones 15/15/12/10 por nivel
  (verificado). El invariante de conteo se sostiene; el mapeo
  lección→ejercicios tiene un hueco a reportar como hallazgo, no a corregir.
- Uso real: `script-enhanced.js` valida vía `AIValidator` + backend executor
  (hoy suspendido); `validator.js` (`JavaValidator`) es la vía offline de
  `US-003`. La auditoría no cambia ninguna de estas rutas.

## Goals / Non-Goals

**Goals:**

- Clasificar los 208 ejercicios con criterio reproducible y auditable.
- Medir engañabilidad con sondas concretas, no con opinión.
- Verificar el invariante 52/208 en cada corrida del script.
- Dejar la matriz en `docs/validator-audit.md` como entrada de C-05.

**Non-Goals:**

- Corregir contenido de lecciones/ejercicios (solo hallazgos).
- Endurecer `validator.js` (lo hará C-06 si gana "solo reglas").
- Tocar backend, secretos, README o despliegue (changes posteriores).
- Requerir JDK, red o servicios externos para correr la auditoría.

## Decisions

1. **Taxonomía de 3 categorías** (definiciones operativas, no etiquetas
   vagas):
   - `rules-only-ok`: la regla específica del ejercicio rechaza las sondas
     tramposas y acepta la solución canónica.
   - `rules-cheatable`: al menos una sonda tramposa es aceptada como válida
     (p. ej. patrón presente en comentario/string/código muerto, o rama
     `default` con `includes`).
   - `needs-real-execution`: el ejercicio exige semántica runtime
     (salida que depende de ejecución, no de presencia de tokens) y ninguna
     regla estática puede decidirlo con fidelidad.
   - Alternativa descartada: escala continua de "confianza" — no es
     accionable para C-05; las 3 clases mapean directo a la decisión DD-02.
2. **Estrategia de sondas (≥2 por familia de reglas)**: por cada validador
   específico (ids 1–8) y para la rama `default`, generar al menos:
   - (a) literal/comentario con la respuesta esperada sin lógica real;
   - (b) código muerto que contiene el patrón buscado por la regex pero con
     semántica incorrecta (p. ej. condición invertida con los tokens
     presentes, `includes(expectedCode)` dentro de un bloque nunca
     ejecutado).
   - Alternativa descartada: mutación aleatoria — no reproducible; las
     sondas son plantillas fijas versionadas junto al script.
3. **Carga de código browser-global en Node**: `data.js` y `validator.js`
   declaran globales (`exercisesData`, `JavaValidator`) sin `module.exports`.
   El audit los carga con `vm.runInNewContext` + `fs.readFileSync`, sin
   `eval` en el repo productivo y sin modificar los archivos fuente.
   Alternativa descartada: importar con JSDOM — dependencia nueva,
   innecesaria; `vm` estándar alcanza.
4. **Chequeo de invariante dentro del script** (falla la corrida si cambia):
   `exercisesData.length === 208` con ids únicos 1–208;
   `lessonsData.length === 52` con distribución 15/15/12/10 leída de
   `script.js` por regex de niveles (sin ejecutar el DOM); reporte de
   `lessonId` huérfanos (51–52) como hallazgo.
   Alternativa descartada: conteo manual en docs — se desactualiza; el
   script es la fuente que genera la matriz.
5. **TDD con `node:test` + `assert/strict`, cero dependencias**: el proyecto
   es Vanilla sin framework; agregar Jest/Mocha violaría costo/mantenimiento
   mínimo. `node --test tools/*.test.js` es el runner.
6. **Salida `docs/validator-audit.md` generada, no escrita a mano**: tabla
   (id, lessonId, título, categoría, veredicto, nota) + resumen (conteos, %
   engañable, lista `needs-real-execution`, hallazgos de contenido). El test
   verifica que la matriz cubre los 208 y que el resumen cuadra con la tabla.

## Risks / Trade-offs

- [Riesgo] La rama `default` (ids 9–208) puede salir casi toda
  `rules-cheatable` → el % engañable asusta. Mitigación: es el dato que
  C-05 necesita; el informe lo presenta como entrada de decisión, no como
  fracaso, con la lista exacta de qué subset exige ejecución real.
- [Riesgo] Regex de niveles sobre `script.js` frágil ante refactors.
  Mitigación: el test del invariante falla ruidosamente (no silencioso) y el
  mensaje indica qué conteo cambió.
- [Riesgo] Sondas insuficientes para reglas futuras. Mitigación: plantillas
  versionadas + mínimo ≥2 por familia exigido por test (si una familia nueva
  aparece sin sondas, el test de cobertura de sondas falla).
- [Trade-off] `vm` + lectura de fuentes acopla el audit al formato actual
  de `data.js`/`validator.js`. Aceptado: este change es de solo lectura y
  cualquier cambio de formato romperá el audit a propósito (señal, no bug).

## Migration Plan

No hay despliegue ni migración: el change agrega `tools/` + `docs/` y no
modifica runtime. Rollback = revertir el commit único del change. La matriz
queda como artefacto versionado para C-05.

## Open Questions

Ninguna que bloquee: el hueco `lessonId` 51–52 se reporta como hallazgo en
la matriz (no se decide aquí si es error de contenido o diseño de lecciones
sin ejercicio).
