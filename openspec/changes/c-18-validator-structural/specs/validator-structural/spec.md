# Spec Delta — validator-structural (nueva capacidad)

## Purpose

La validación estructural offline compara soluciones Java por equivalencia de
tokens en vez de por texto exacto, para aceptar variantes válidas y rechazar
trampas sin necesidad de ejecución real (US-003, RN-CON-02).

## ADDED Requirements

### Requirement: Normalización por tokens ignora comentarios y formato
El sistema SHALL normalizar el código del estudiante y la solución canónica a
una secuencia de tokens que excluya comentarios (`//`, `/* */`) y diferencias
de formato (espacios, saltos de línea, indentación cruda) antes de comparar.

#### Scenario: Misma lógica con distinto formato aceptada
- **WHEN** se valida un código estructuralmente idéntico a la solución
  canónica pero con distinto formato o comentarios propios
- **THEN** el resultado es válido y sin errores

#### Scenario: Respuesta pegada en un comentario rechazada
- **WHEN** se valida un código que solo contiene la respuesta esperada dentro
  de un comentario (sin la lógica del ejercicio)
- **THEN** el resultado es no válido con mensaje conceptual en español

### Requirement: Nombres de variable libres con renombrado consistente
El sistema SHALL aceptar nombres de variable distintos de los de la solución
canónica siempre que el renombrado sea consistente en todo el código, y SHALL
seguir exigiendo los nombres que la consigna fija (clases, métodos nombrados
en el enunciado, API del JDK).

#### Scenario: Variable renombrada consistentemente aceptada
- **WHEN** se valida un código idéntico en estructura pero con otro nombre de
  variable usado de forma consistente
- **THEN** el resultado es válido y sin errores

#### Scenario: Nombre fijado por la consigna exigido
- **WHEN** se valida un código que cambia un nombre fijado por la consigna
  (clase, método nombrado, API del JDK)
- **THEN** el resultado es no válido con mensaje conceptual en español

### Requirement: Textos libres salvo exigencia, números y operadores estrictos
El sistema SHALL tratar los textos entre comillas como libres salvo en los
ejercicios cuya consigna fija el texto exacto (veredicto por ejercicio en
`docs/validator-strictness.md`), y SHALL comparar números y operadores de
forma estricta porque son la lógica del ejercicio.

#### Scenario: Texto libre con lógica correcta aceptado
- **WHEN** se valida un ejercicio de texto libre con otra cadena entre
  comillas pero la estructura de impresión correcta
- **THEN** el resultado es válido y sin errores

#### Scenario: Número u operador distinto rechazado
- **WHEN** se valida un código con distinto número u operador que la solución
- **THEN** el resultado es no válido con mensaje conceptual en español

### Requirement: Mensajes de error conceptuales sin la respuesta
El sistema SHALL emitir mensajes de error en español que describan el
concepto faltante (ej. "falta imprimir algo con System.out.println") y SHALL
NUNCA incluir en el mensaje la respuesta esperada ni la línea de código
exacta.

#### Scenario: Fallo sin filtración de la respuesta
- **WHEN** se valida un código incorrecto de cualquier ejercicio
- **THEN** el mensaje está en español, describe el concepto faltante y no
  contiene el texto esperado ni la línea de solución

### Requirement: Indentación estructural en lección 1
El sistema SHALL validar la indentación de los ejercicios de la lección 1
(ids 1–4) midiendo estructura (cada bloque con 4 espacios más que el
anterior) en vez de igualdad con la solución canónica.

#### Scenario: Estructura bien indentada con otro contenido aceptada
- **WHEN** se valida un código de lección 1 con indentación +4 por bloque
  pero distinto contenido equivalente
- **THEN** no hay error de indentación

#### Scenario: Estructura mal indentada rechazada
- **WHEN** se valida un código de lección 1 que no respeta +4 por bloque
- **THEN** el resultado incluye error de indentación en español

### Requirement: Auditoría previa como gate
El sistema NO SHALL implementar el comparador estructural hasta que el
documento `docs/validator-strictness.md` (veredicto por ejercicio de los 208
+ propuesta de regla) exista y Belén lo haya revisado; la Fase 1 es solo
auditoría, sin cambios en `validator.js`.

#### Scenario: Implementación bloqueada sin auditoría revisada
- **WHEN** `docs/validator-strictness.md` no existe o no fue revisado por Belén
- **THEN** no se modifica `validator.js` bajo este change

### Requirement: Invariantes 52/208 y contenido intacto
El sistema SHALL mantener 52 lecciones (15/15/12/10) y 208 ejercicios con ids
estables, y SHALL NOT modificar `data.js` ni contenido de lecciones en este
change; la verificación SHALL re-correr `tools/audit-validator.js` y
regenerar `docs/validator-audit.md`.

#### Scenario: Invariantes verificados tras el change
- **WHEN** se corre la suite y `tools/audit-validator.js` al cerrar el change
- **THEN** los conteos 52/208 pasan y `data.js` no tiene diff
