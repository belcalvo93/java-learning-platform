# Spec Delta — validator-rules (comportamiento pasa a estructural)

## MODIFIED Requirements

### Requirement: Regla del id 3 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 3 («Múltiples Métodos») por equivalencia estructural de tokens
(ignorando comentarios y formato, con renombrado consistente de variables
libres) y SHALL rechazar una solución que no declare los dos métodos
esperados, con mensaje conceptual en español que no muestre la respuesta.

#### Scenario: Solución canónica del id 3 aceptada
- **WHEN** se valida el código solución canónico del id 3 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 3 rechazada
- **WHEN** se valida un código que no declara los dos métodos esperados
- **THEN** el resultado es no válido con mensaje en español

#### Scenario: Variante estructural del id 3 aceptada
- **WHEN** se valida un código con la misma estructura pero distinto formato
  o comentarios propios
- **THEN** el resultado es válido y sin errores

#### Scenario: Respuesta en comentario del id 3 rechazada
- **WHEN** se valida un código que solo pega la respuesta en un comentario
- **THEN** el resultado es no válido con mensaje conceptual en español

### Requirement: Regla del id 4 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 4 («Bucle Anidado») por equivalencia estructural de tokens
(ignorando comentarios y formato, con renombrado consistente de variables
libres) y SHALL rechazar una solución sin la estructura de bucle/condición
esperada, con mensaje conceptual en español que no muestre la respuesta.
Números y operadores se comparan de forma estricta.

#### Scenario: Solución canónica del id 4 aceptada
- **WHEN** se valida el código solución canónico del id 4 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 4 rechazada
- **WHEN** se valida un código sin la estructura de bucle esperada
- **THEN** el resultado es no válido con mensaje en español

#### Scenario: Operador distinto en id 4 rechazado
- **WHEN** se valida un código con distinto operador o número en la condición
- **THEN** el resultado es no válido con mensaje conceptual en español

### Requirement: Regla del id 5 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 5 («Hola Mundo») y SHALL aceptar cualquier texto entre comillas
dentro de `System.out.println(...)` (cualquier mayúscula/minúscula, con o sin
exclamaciones), y SHALL rechazar un código sin impresión, con mensaje
conceptual en español (ej. "falta imprimir algo con System.out.println") que
no muestre la respuesta.

#### Scenario: Solución canónica del id 5 aceptada
- **WHEN** se valida el código solución canónico del id 5 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 5 rechazada
- **WHEN** se valida un código sin la impresión esperada
- **THEN** el resultado es no válido con mensaje en español

#### Scenario: Texto alternativo en id 5 aceptado
- **WHEN** se valida un código que imprime otro texto con
  `System.out.println(...)`
- **THEN** el resultado es válido y sin errores

### Requirement: Regla del id 6 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 6 («Múltiples Líneas») por equivalencia estructural de tokens y
SHALL rechazar un código con menos líneas impresas de las esperadas, con
mensaje conceptual en español que no muestre la respuesta. El carácter libre
o fijo de cada texto lo define el veredicto por ejercicio de
`docs/validator-strictness.md` tras revisión de Belén.

#### Scenario: Solución canónica del id 6 aceptada
- **WHEN** se valida el código solución canónico del id 6 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 6 rechazada
- **WHEN** se valida un código con menos impresiones de las esperadas
- **THEN** el resultado es no válido con mensaje en español

### Requirement: Regla del id 7 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 7 («Print vs Println») por equivalencia estructural de tokens
(exigiendo la combinación `print` + `println`) y SHALL rechazar un código
que no use la combinación esperada de impresión, con mensaje conceptual en
español que no muestre la respuesta.

#### Scenario: Solución canónica del id 7 aceptada
- **WHEN** se valida el código solución canónico del id 7 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 7 rechazada
- **WHEN** se valida un código sin la combinación de impresión esperada
- **THEN** el resultado es no válido con mensaje en español

### Requirement: Regla del id 8 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 8 («Printf») por equivalencia estructural de tokens (exigiendo
`printf` con especificador `%d`; el carácter libre o fijo del texto
circundante lo define `docs/validator-strictness.md` tras revisión de Belén)
y SHALL rechazar un código sin la impresión con formato esperada, con mensaje
conceptual en español que no muestre la respuesta.

#### Scenario: Solución canónica del id 8 aceptada
- **WHEN** se valida el código solución canónico del id 8 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 8 rechazada
- **WHEN** se valida un código sin la impresión con formato esperada
- **THEN** el resultado es no válido con mensaje en español

### Requirement: Regla del id 168 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 168 («Files Lines Stream») por equivalencia estructural de
tokens (incluyendo sus líneas de continuación, ignorando formato) y SHALL
rechazar un código sin el pipeline esperado, con mensaje conceptual en
español que no muestre la respuesta.

#### Scenario: Solución canónica del id 168 aceptada
- **WHEN** se valida el código solución canónico del id 168 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 168 rechazada
- **WHEN** se valida un código sin el pipeline esperado
- **THEN** el resultado es no válido con mensaje en español
