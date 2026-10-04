# Spec Delta

## Purpose

El editor donde el estudiante escribe Java acompaña la escritura con números
de línea y guías de indentación, muestra la pista solo cuando hace falta y
explica los fallos de indentación distinguiendo llaves de más o de menos,
sin cambiar el veredicto de la validación.

## ADDED Requirements

### Requirement: Editor con numeración de líneas y guías sin librerías

El sistema SHALL mostrar el editor de ejercicios con una columna de números
de línea sincronizada con el contenido y el scroll del área de escritura, y
con guías visuales sutiles de indentación, sin cargar librerías de terceros
ni fuentes externas nuevas. Si el enfoque sin librería resulta inviable, el
trabajo SHALL detenerse y consultarse a Belén antes de agregar cualquier
dependencia.

#### Scenario: Números sincronizados con scroll y edición

- **WHEN** el estudiante abre un ejercicio y escribe o desplaza el código
- **THEN** la columna muestra un número por cada línea del contenido y se
  desplaza en sincronía con el área de escritura, sin errores en consola

#### Scenario: Guías de indentación alineadas en móvil y desktop

- **WHEN** el estudiante abre un ejercicio en viewport móvil y en desktop
- **THEN** las guías verticales coinciden con los niveles de indentación de
  4 espacios del código y no se rompe el layout existente del modal

### Requirement: Pista visible solo cuando hace falta

El sistema SHALL ocultar el bloque de pista (`#exercise-hint`) cuando la
validación del ejercicio sale correcta, SHALL mostrarlo con el texto de la
pista cuando la validación falla, y SHALL mostrarlo a pedido con el botón
"Ver Pista" en cualquier momento. Abrir o reiniciar un ejercicio SHALL dejar
la pista oculta hasta que ocurra una de esas condiciones.

#### Scenario: Acierto oculta la pista

- **WHEN** el estudiante verifica una solución correcta teniendo la pista visible
- **THEN** el bloque de pista queda oculto y el resultado muestra el mensaje
  de éxito

#### Scenario: Fallo muestra la pista y "Ver Pista" la muestra a pedido

- **WHEN** el estudiante verifica una solución incorrecta, o pulsa "Ver Pista"
  antes de verificar
- **THEN** el bloque de pista se hace visible con el texto "💡 Pista: …"
  del ejercicio

#### Scenario: Reabrir o reiniciar oculta la pista

- **WHEN** el estudiante abre otro ejercicio o pulsa "Reiniciar"
- **THEN** la pista queda oculta y el resultado queda vacío

### Requirement: Mensaje de indentación que distingue llaves de más o de menos

Ante un fallo de indentación, el sistema SHALL agregar al mensaje un aviso
que indique si el código parece tener una llave de apertura o de cierre de
más o de menos, calculado por conteo de `{` vs `}`. El veredicto de la
validación (`success` true/false) SHALL ser idéntico al que se obtenía con
el mensaje genérico anterior para las mismas entradas: solo cambia el texto,
ninguna regla cambia.

#### Scenario: Falta una llave de cierre

- **WHEN** el estudiante verifica un código con más `{` que `}` y la
  indentación no coincide
- **THEN** el mensaje indica que parece faltar una llave de cierre y el
  veredicto es fallo, igual que antes del change

#### Scenario: Sobra una llave de cierre

- **WHEN** el estudiante verifica un código con más `}` que `{` y la
  indentación no coincide
- **THEN** el mensaje indica que parece sobrar una llave de cierre y el
  veredicto es fallo, igual que antes del change

#### Scenario: Llaves balanceadas mantienen el mensaje genérico

- **WHEN** el estudiante verifica un código con `{` y `}` balanceados pero
  mal indentado
- **THEN** el mensaje conserva el texto genérico de indentación (con sus
  sugerencias de 4 espacios) y el veredicto es fallo, igual que antes

#### Scenario: Acierto con llaves balanceadas no muestra aviso

- **WHEN** el estudiante verifica la solución canónica de un ejercicio de
  indentación
- **THEN** la validación es éxito sin ningún aviso de llaves

### Requirement: Hoja de estilos con @import al inicio

La hoja `styles.css` SHALL declarar su `@import` de fuentes antes que
cualquier otra regla, de modo que el navegador lo aplique sin el aviso de
"@import debe preceder a otras reglas". No SHALL agregarse ninguna fuente
externa nueva ni cambiar familias tipográficas en este change (eso es
alcance de C-12).

#### Scenario: Sin aviso de @import y fuentes aplicadas

- **WHEN** se abre cualquier página en desktop o móvil con la consola abierta
- **THEN** no hay aviso sobre el orden de `@import` y el texto usa las
  familias tipográficas existentes
