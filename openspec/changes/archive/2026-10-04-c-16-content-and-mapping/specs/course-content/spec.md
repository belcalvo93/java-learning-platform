# Spec Delta — course-content

## Purpose

El contenido del curso es la materia que el estudiante lee y practica: lecciones con explicación completa y ejercicios colgados de la lección correcta con consignas claras, de modo que navegar por guías (US-001/US-002) enseñe lo que promete sin romper los invariantes 52/208 (RN-CON-01, RN-CON-03).

## ADDED Requirements

### Requirement: Contenido real en cada lección

Cada una de las 52 lecciones SHALL tener contenido completo: empezar con su
título, tener al menos 500 caracteres, incluir el cuadro "En el mundo real"
(`info-box`) y un ejemplo de código (`code-block`), y NO SHALL contener HTML
no permitido (`script`, `style`, `img`, `a`).

#### Scenario: Lección completa pasa la guarda

- **WHEN** se carga cualquier lección de `script.js`
- **THEN** su `content` empieza con `<h2>{title}</h2>`, mide ≥500 caracteres,
  contiene `info-box` y `code-block`, y no contiene
  `<script`, `<style`, `<img` ni `<a ` (insensible a mayúsculas).

#### Scenario: Contenido del pack queda idéntico

- **WHEN** se aplica el pack a las 51 lecciones incluidas (la 1 intacta)
- **THEN** el `content` resultante de cada una es idéntico al HTML del pack
  para ese id, y los campos `id`/`level`/`module`/`title`/`description`/
  `duration` no cambian.

### Requirement: Consignas claras con salida esperada

Cada uno de los 208 ejercicios SHALL tener una consigna de al menos 80
caracteres que diga qué resultado se espera ("Salida esperada" o "Resultado
esperado") y NO SHALL contener HTML de bloque (`p`, `ul`, `ol`, `li`, `pre`,
`div`, `h1`-`h6`).

#### Scenario: Consigna clara pasa la guarda

- **WHEN** se lee la `description` de cualquier ejercicio de `data.js`
- **THEN** mide ≥80 caracteres, contiene "Salida esperada" o "Resultado
  esperado", y no contiene etiquetas de bloque.

### Requirement: Cada ejercicio cuelga de su lección

Cada ejercicio SHALL referenciar con `lessonId` una lección que existe (1–52),
siguiendo el mapa nuevo de `docs/content-review-notes.md`; las lecciones 22,
25, 40 y 42 SHALL quedar sin ejercicios (solo lectura, sin botón Practicar) y
ninguna otra lección SHALL quedar huérfana.

#### Scenario: Mapeo válido tras aplicar el pack

- **WHEN** se cargan los 208 ejercicios y las 52 lecciones
- **THEN** todo `lessonId` existe en lecciones, el total sigue siendo 208, y
  exactamente las lecciones [22, 25, 40, 42] no tienen ejercicios.

#### Scenario: Conteo por nivel actualizado

- **WHEN** se agrupan los ejercicios por nivel de su lección
- **THEN** los conteos son principiante 62, intermedio 58, avanzado 48,
  experto 40 (total 208), y las tarjetas de nivel de `index.html` muestran
  esos números.

### Requirement: Starter de solo-comentario nunca aprueba

Un `starterCode` que es solo un comentario (una o dos líneas `//…`) NO SHALL
aprobar la validación del ejercicio: `validator.validate(starterCode, id)`
SHALL devolver `isValid: false`.

#### Scenario: Starter vacío no valida

- **WHEN** un ejercicio tiene starter de solo-comentario y se valida ese
  starter contra su regla
- **THEN** el resultado es `isValid: false`.

### Requirement: Invariantes de contenido intacto

Al aplicar el pack, el sistema SHALL preservar los conteos (52 lecciones,
208 ejercicios en el mismo orden e ids) y NO SHALL modificar `title`,
`difficulty`, `solution`, `hint` ni `validation` de ningún ejercicio; solo los
`starterCode` vacíos (`''`) pueden recibir el comentario neutro del pack. Ante
cualquier violación el aplicador SHALL abortar sin escribir ningún archivo.

#### Scenario: Invariante roto aborta sin escribir

- **WHEN** el aplicador detecta conteo distinto, id/orden cambiado, campo
  protegido modificado o un starter no-vacío a sobrescribir
- **THEN** imprime `INVARIANTE ROTO: …`, sale con código distinto de cero y no
  modifica ni `script.js` ni `data.js` (verificable con `--check` dry-run que
  nunca escribe).

#### Scenario: Campos protegidos idénticos tras aplicar

- **WHEN** se compara `data.js` antes y después de aplicar el pack
- **THEN** cada ejercicio conserva `id`, `title`, `difficulty`, `solution`,
  `hint`, `validation` y el mismo conjunto de campos; cada lección conserva
  `id`, `level`, `module`, `title`, `description`, `duration`.
