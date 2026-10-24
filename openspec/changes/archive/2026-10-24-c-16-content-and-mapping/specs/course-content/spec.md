# Spec Delta: course-content

## MODIFIED Requirements

### Requirement: Invariantes de contenido intacto

Al aplicar el pack y las correcciones de contenido de C-16, el sistema SHALL preservar los conteos (52 lecciones, 208 ejercicios en el mismo orden e ids) y NO SHALL modificar campos protegidos que alteren la identidad de los ejercicios; las soluciones canónicas, starters y consignas de ejercicios reportados con inconsistencias (ids 19, 84, 85, 107, 110, 115, 117, 124, 129, 168, 181, 192, 205, 207) SHALL ajustarse quirúrgicamente para garantizar su consistencia.

#### Scenario: Invariante roto aborta sin escribir

- **WHEN** el aplicador detecta conteo distinto a 52 lecciones o 208 ejercicios, id/orden cambiado, o modificación fuera de los ítems aprobados
- **THEN** imprime `INVARIANTE ROTO: …`, sale con código distinto de cero y no modifica ni `script.js` ni `data.js`.

#### Scenario: Campos protegidos idénticos tras aplicar

- **WHEN** se compara `data.js` antes y después de aplicar las correcciones de C-16
- **THEN** cada ejercicio conserva `id`, `title`, `difficulty`, `hint`, `validation` y los conteos 52/208 se mantienen intactos.
