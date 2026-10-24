# Spec Delta: validator-structural

## MODIFIED Requirements

### Requirement: Nombres de variable libres con renombrado consistente
El sistema SHALL aceptar nombres de variable distintos de los de la solución
canónica siempre que el renombrado sea consistente en todo el código, y SHALL
seguir exigiendo los nombres que la consigna fija (clases, métodos nombrados
en el enunciado, API del JDK), admitiendo variantes estructurales para métodos de prueba (como `testSuma` / `testFalla` en el ejercicio 205).

#### Scenario: Variable renombrada consistentemente aceptada
- **WHEN** se valida un código idéntico en estructura pero con otro nombre de
  variable usado de forma consistente
- **THEN** el resultado es válido y sin errores

#### Scenario: Nombre fijado por la consigna exigido
- **WHEN** se valida un código que cambia un nombre fijado por la consigna
  (clase, método nombrado, API del JDK)
- **THEN** el resultado es no válido con mensaje conceptual en español
