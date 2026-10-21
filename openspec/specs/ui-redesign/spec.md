# ui-redesign Specification

## Purpose
Definir el sistema de diseño visual unificado de JavaMaster, la legibilidad y contraste en escritorio y móvil, la separación y jerarquía de secciones ("Mi Progreso", "Ver Todos", tarjetas de lección sin wrappers) y el punto único de disponibilidad por nivel.

## Requirements

### Requirement: Sistema de diseño unificado y fuentes por link
El sistema SHALL definir todas las variables CSS de color, tipografía, espaciado, radios, sombras y colores por nivel en `:root` dentro de `styles.css` (con soporte para `prefers-color-scheme: light` y `prefers-reduced-motion`), y SHALL cargar las fuentes tipográficas mediante `<link>` en `index.html` sin usar `@import` en hojas CSS.

#### Scenario: Fuentes cargadas por link y tokens activos
- **WHEN** se carga `index.html`
- **THEN** las fuentes se enlazan con `<link>` en `<head>` y `styles.css` no contiene `@import`

### Requirement: Márgenes laterales cómodos en móvil
El sistema SHALL mantener, a 480 px de ancho o menos, un margen horizontal libre de al menos 20 px entre el texto de lectura de la lección y los bordes de la ventana, y de al menos 15 px entre el contenedor del editor de código y los bordes de la ventana, sin desborde horizontal.

#### Scenario: Márgenes a 360, 390 y 424 px
- **WHEN** se abre una lección o un ejercicio a 360, 390 o 424 px de ancho
- **THEN** el texto de la lección queda a >= 20 px de cada borde y el editor a >= 15 px de cada borde

### Requirement: Separación y barras por nivel en Mi Progreso
El sistema SHALL ubicar la sección `#progreso` fuera de `#lecciones`, con una separación vertical de al menos 48 px respecto al contenedor de niveles/lecciones previo, mostrando el resumen total y una barra de progreso diferenciada para cada uno de los 4 niveles.

#### Scenario: Separación vertical y 4 barras visibles
- **WHEN** se visualiza la página principal en móvil o escritorio
- **THEN** la distancia vertical entre el final de la lista de lecciones y el inicio de `#progreso` es >= 48 px y existen 4 barras de nivel visibles

### Requirement: Tarjetas de lección integradas sin wrappers
El sistema SHALL renderizar el resumen de ejercicios de cada tarjeta de lección directamente en `renderLessons` y `renderModulesView` sin envolver ni redefinir esas funciones desde `script-enhanced.js`, permitiendo abrir cada ejercicio desde su ítem en la tarjeta.

#### Scenario: Render directo y clic en ejercicio de tarjeta
- **WHEN** se renderizan las 52 tarjetas en vista módulos o grilla
- **THEN** cada tarjeta muestra sus ejercicios (o "Lección de lectura" en 22, 25, 40 y 42) y al pulsar un ejercicio de la lista se abre ese ejercicio

### Requirement: Disponibilidad por nivel centralizada
El módulo `LessonNav` SHALL exponer `isLevelAvailable(level)` devolviendo `true` por defecto para los 4 niveles del curso, y `isAvailable` SHALL consultarla como único punto preparado para el bloqueo por nivel futuro (C-19).

#### Scenario: Disponibilidad por nivel hoy activa y reemplazable
- **WHEN** se consulta `LessonNav.isLevelAvailable(level)` para `beginner`, `intermediate`, `advanced` o `expert`
- **THEN** devuelve `true`, y si se reemplaza para devolver `false` en un nivel, las lecciones de ese nivel pasan a reportarse como no disponibles
