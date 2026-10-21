# Spec Delta

## Purpose
La pantalla de ejercicio se usa completa y sin desborde en celular: los botones
de acción y de navegación caben en el ancho, tienen tamaño táctil y el texto de
errores y pistas aprovecha casi todo el ancho de la tarjeta.

## ADDED Requirements

### Requirement: Botones de acción en pantallas angostas
El sistema SHALL mostrar, a 480 px de ancho o menos, "Verificar Solución" en una
fila completa y "Ver Pista" y "Reiniciar" lado a lado debajo, a mitad de ancho
cada uno, con el texto de cada botón en una sola línea y alto táctil mínimo de
44 px.

#### Scenario: Disposición a 424 px
- **WHEN** la pantalla de ejercicio se abre a 424 px de ancho
- **THEN** "Verificar Solución" ocupa una fila y "Ver Pista" y "Reiniciar" van
  lado a lado debajo, completos dentro de la tarjeta y en una sola línea

#### Scenario: Ninguno se corta
- **WHEN** la pantalla se ve a 360, 390 o 424 px
- **THEN** ningún botón de acción sobrepasa el borde de la tarjeta

### Requirement: Botones de navegación en pantallas angostas
El sistema SHALL acomodar, a 480 px o menos, los botones de navegación (anterior,
ver todos, volver a lecciones y siguiente) dentro del ancho de la pantalla, en
grilla de 2 por 2 o en una columna si no entran, con el texto de cada uno en una
sola línea, alto táctil mínimo de 44 px y con el botón de avance ("Siguiente
Ejercicio") completo y visualmente el más destacado.

#### Scenario: Siguiente completo
- **WHEN** la pantalla de ejercicio se abre a 360, 390 o 424 px
- **THEN** "Siguiente Ejercicio" se ve completo dentro de la tarjeta y de la
  pantalla, y es el botón más destacado de la navegación

#### Scenario: Zona táctil
- **WHEN** se mide cualquiera de los siete botones a 480 px o menos
- **THEN** su alto es de al menos 44 px

### Requirement: Márgenes reducidos y paneles anchos
El sistema SHALL mantener a 480 px o menos al menos 16 px entre texto de lectura
o consigna y cada borde, 12 px en botones del pie y 8 px en el editor; las cajas
de error y pista SHALL usar al menos el 85 % del ancho de la tarjeta, y el
editor SHALL hacer scroll horizontal solo cuando una línea no entra.

#### Scenario: Cajas de errores y pista anchas
- **WHEN** hay una caja de errores o de pista visible a 360, 390 o 424 px
- **THEN** su ancho es al menos el 85 % del ancho de la tarjeta

#### Scenario: Márgenes horizontales cómodos en móvil
- **WHEN** se abren la ventana de lección y la de ejercicio a 360, 390 o 424 px
- **THEN** el texto de lectura y la consigna quedan a al menos 16 px de cada
  borde de la ventana, los botones del pie a al menos 12 px y el editor a al
  menos 8 px

#### Scenario: Línea larga en el editor
- **WHEN** una línea del código no entra en el ancho del editor
- **THEN** el editor hace scroll horizontal y la página no lo hace

### Requirement: Pie de ventana de lección y botón de cierre en pantallas angostas
El sistema SHALL mostrar a 480 px o menos en la lección "Practicar" arriba en
fila completa (omitido en lectura 22, 25, 40 y 42), "Marcar como completada"
debajo y "Anterior"/"Siguiente" a mitad, con alto >= 44 px en 1 línea; y SHALL
ubicar la "X" en renglón sticky arriba a la derecha sin tapar título ni párrafo.

#### Scenario: Pie de lección y botón X sin superposición
- **WHEN** se abren las ventanas de lección, ejercicio o "Ver Todos los
  Ejercicios" a 360, 390, 424 o 768 px
- **THEN** los botones del pie caben en una línea sin desborde y el botón "X" no
  intersecta al título ni al primer párrafo y permanece visible y tocable al
  hacer scroll

### Requirement: Sin desborde horizontal
El sistema SHALL mantener, a 360, 390, 424 y 768 px, el ancho de scroll del
cuerpo, de la tarjeta y de los contenedores de botones menor o igual a su ancho
visible.

#### Scenario: Sin desborde
- **WHEN** se abre la pantalla de ejercicio a 360, 390, 424 o 768 px
- **THEN** el cuerpo, la tarjeta y los contenedores de botones no tienen scroll
  horizontal

### Requirement: Escritorio sin cambios visibles
El sistema NO SHALL cambiar la apariencia de la pantalla de ejercicio a más de
768 px de ancho.

#### Scenario: Escritorio idéntico
- **WHEN** se compara la pantalla de ejercicio a 1280, 1024 y 800 px antes y
  después del change
- **THEN** las capturas son idénticas
