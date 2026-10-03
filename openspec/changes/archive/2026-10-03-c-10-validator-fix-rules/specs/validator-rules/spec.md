# Spec Delta

## Purpose

La validación offline por reglas acepta la solución canónica de cada ejercicio
con regla específica y rechaza soluciones incorrectas con un mensaje en español,
para que practicar sin backend (US-003, RN-CON-02) dé un veredicto fiable.

## ADDED Requirements

### Requirement: Regla del id 3 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 3 («Múltiples Métodos») y SHALL rechazar una solución que no
declare los dos métodos esperados, con mensaje en español.

#### Scenario: Solución canónica del id 3 aceptada
- **WHEN** se valida el código solución canónico del id 3 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 3 rechazada
- **WHEN** se valida un código que no declara los dos métodos esperados
- **THEN** el resultado es no válido con mensaje en español

### Requirement: Regla del id 4 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 4 («Bucle Anidado») y SHALL rechazar una solución sin la
estructura de bucle/condición esperada, con mensaje en español.

#### Scenario: Solución canónica del id 4 aceptada
- **WHEN** se valida el código solución canónico del id 4 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 4 rechazada
- **WHEN** se valida un código sin la estructura de bucle esperada
- **THEN** el resultado es no válido con mensaje en español

### Requirement: Regla del id 5 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 5 («Hola Mundo») y SHALL rechazar un código sin la impresión
esperada, con mensaje en español.

#### Scenario: Solución canónica del id 5 aceptada
- **WHEN** se valida el código solución canónico del id 5 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 5 rechazada
- **WHEN** se valida un código sin la impresión esperada
- **THEN** el resultado es no válido con mensaje en español

### Requirement: Regla del id 6 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 6 («Múltiples Líneas») y SHALL rechazar un código con menos
líneas impresas de las esperadas, con mensaje en español.

#### Scenario: Solución canónica del id 6 aceptada
- **WHEN** se valida el código solución canónico del id 6 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 6 rechazada
- **WHEN** se valida un código con menos impresiones de las esperadas
- **THEN** el resultado es no válido con mensaje en español

### Requirement: Regla del id 7 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 7 («Print vs Println») y SHALL rechazar un código que no use la
combinación esperada de impresión, con mensaje en español.

#### Scenario: Solución canónica del id 7 aceptada
- **WHEN** se valida el código solución canónico del id 7 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 7 rechazada
- **WHEN** se valida un código sin la combinación de impresión esperada
- **THEN** el resultado es no válido con mensaje en español

### Requirement: Regla del id 8 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 8 («Printf») y SHALL rechazar un código sin la impresión con
formato esperada, con mensaje en español.

#### Scenario: Solución canónica del id 8 aceptada
- **WHEN** se valida el código solución canónico del id 8 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 8 rechazada
- **WHEN** se valida un código sin la impresión con formato esperada
- **THEN** el resultado es no válido con mensaje en español

### Requirement: Regla del id 168 acepta su solución canónica
El sistema SHALL aceptar como válida la solución canónica de `data.js` del
ejercicio id 168 («Files Lines Stream») incluyendo sus líneas de
continuación, y SHALL rechazar un código sin el pipeline esperado, con
mensaje en español.

#### Scenario: Solución canónica del id 168 aceptada
- **WHEN** se valida el código solución canónico del id 168 de `data.js`
- **THEN** el resultado es válido y sin errores

#### Scenario: Solución incorrecta del id 168 rechazada
- **WHEN** se valida un código sin el pipeline esperado
- **THEN** el resultado es no válido con mensaje en español

### Requirement: Rama de triage regla-vs-dato
Si al alinear una regla se descubre que la solución canónica de `data.js` es
la incorrecta (no responde al enunciado del ejercicio), el sistema NO SHALL
modificar `data.js` en este change: el hallazgo se reporta y se consulta a
Belén antes de seguir.

#### Scenario: Error en el dato, no en la regla
- **WHEN** la solución canónica no responde al enunciado del ejercicio
- **THEN** `data.js` queda intacto, el hallazgo queda registrado y el id se
  excluye del fix hasta la decisión de Belén

### Requirement: Matriz de auditoría regenerada
Tras corregir las reglas, la matriz `docs/validator-audit.md` SHALL
regenerarse con `tools/audit-validator.js` y SHALL mostrar los 7 ids con
solución canónica aceptada, manteniendo el invariante 52/208.

#### Scenario: Matriz actualizada tras el fix
- **WHEN** se re-corre `tools/audit-validator.js` sobre el `validator.js`
  corregido
- **THEN** `docs/validator-audit.md` lista los ids 3–8 y 168 con canónica
  aceptada y el invariante 52/208 sigue pasando
