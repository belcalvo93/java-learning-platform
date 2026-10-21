# lesson-exercise-nav Specification

## Purpose
La navegación de ejercicios sigue la estructura de cada lección: el estudiante
recorre los ejercicios de la lección en orden, ve de antemano qué ejercicios tiene
cada lección y puede encontrar uno concreto, y toda decisión de "disponible o
bloqueado" pasa por un único punto de consulta.

## Requirements

### Requirement: Siguiente y Anterior siguen el orden dentro de la lección
El sistema SHALL navegar con "Siguiente Ejercicio" y "Ejercicio Anterior" por los
ejercicios de la lección del ejercicio actual, en el orden en que la lección los
lista, y NO SHALL saltar a ejercicios de otra lección por orden de id global.

#### Scenario: Siguiente avanza dentro de la lección
- **WHEN** el estudiante está en un ejercicio que no es el último de su lección
  y pulsa "Siguiente Ejercicio"
- **THEN** se abre el ejercicio que sigue en esa misma lección

#### Scenario: Anterior retrocede dentro de la lección
- **WHEN** el estudiante está en un ejercicio que no es el primero de su lección
  y pulsa "Ejercicio Anterior"
- **THEN** se abre el ejercicio que le precede en esa misma lección

#### Scenario: Primer ejercicio de la lección
- **WHEN** el estudiante está en el primer ejercicio de su lección
- **THEN** "Ejercicio Anterior" está deshabilitado y no lleva a otra lección

### Requirement: Fin de lección ofrece volver o pasar a la siguiente
El sistema SHALL, en el último ejercicio de la lección, ofrecer volver a las
lecciones y pasar a la lección siguiente (si existe y está disponible), en lugar
de abrir un ejercicio de otra lección.

#### Scenario: Último ejercicio con lección siguiente
- **WHEN** el estudiante está en el último ejercicio de su lección y existe una
  lección siguiente disponible
- **THEN** el botón de avance dice "Siguiente Lección" y abre esa lección, y
  "Volver a Lecciones" sigue visible

#### Scenario: Última lección del curso
- **WHEN** el estudiante está en el último ejercicio de la última lección
- **THEN** no hay avance posible (botón deshabilitado) y "Volver a Lecciones"
  sigue disponible

### Requirement: Tarjetas de lección muestran sus ejercicios
El sistema SHALL mostrar en cada tarjeta de lección, antes de abrirla, la
cantidad de ejercicios y el nombre de cada uno, y SHALL indicar como "lección de
lectura" a las lecciones sin ejercicios (22, 25, 40 y 42).

#### Scenario: Tarjeta con ejercicios
- **WHEN** se muestra la tarjeta de una lección que tiene ejercicios
- **THEN** la tarjeta indica la cantidad y lista los nombres de sus ejercicios en
  el orden de la lección

#### Scenario: Lección de lectura
- **WHEN** se muestra la tarjeta de la lección 22, 25, 40 o 42
- **THEN** la tarjeta se indica como lección de lectura y no muestra lista ni
  cantidad de ejercicios

#### Scenario: Vistas de tarjetas
- **WHEN** las lecciones se ven en la grilla o en la vista por módulos
- **THEN** ambas vistas muestran la misma información de ejercicios por tarjeta

### Requirement: Listado completo agrupado por lección
El sistema SHALL agrupar "Ver Todos los Ejercicios" por lección, en el orden de
las lecciones, con el título de la lección como encabezado de cada grupo, sin
omitir ni duplicar ejercicios.

#### Scenario: Agrupado por lección
- **WHEN** el estudiante abre "Ver Todos los Ejercicios"
- **THEN** los ejercicios aparecen bajo el encabezado de su lección y el total
  listado coincide con el total de ejercicios (208)

#### Scenario: Abrir desde el listado
- **WHEN** el estudiante elige un ejercicio del listado
- **THEN** se abre ese ejercicio

### Requirement: Una única función de disponibilidad
El sistema SHALL decidir si una lección o un ejercicio está disponible con una
única función que hoy responde siempre que sí, y "Siguiente" y las tarjetas de
lección SHALL consultarla para decidir su estado, de modo que el bloqueo por
nivel (C-19) se active cambiando solo esa función.

#### Scenario: Hoy todo disponible
- **WHEN** no hay ninguna regla de bloqueo activa
- **THEN** la función responde disponible para toda lección y todo ejercicio y
  ningún botón ni tarjeta se muestra bloqueado

#### Scenario: Lección o ejercicio no disponible
- **WHEN** la función responde no disponible para una lección o ejercicio
- **THEN** el botón de avance que llevaría a ello queda deshabilitado y la
  tarjeta de esa lección se marca como bloqueada

### Requirement: Invariantes de contenido
El sistema SHALL mantener 52 lecciones y 208 ejercicios con ids, consignas y
orden de los datos sin cambios; este change NO SHALL modificar `data.js` ni
`script.js` ni la validación.

#### Scenario: Contenido intacto
- **WHEN** se corre la suite y la auditoría al cerrar el change
- **THEN** los conteos 52/208 pasan y `data.js` y `script.js` no tienen diff
