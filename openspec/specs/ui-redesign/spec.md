# ui-redesign Specification

## Purpose
Definir el sistema de diseño visual unificado de JavaMaster, la legibilidad y contraste en escritorio y móvil, el selector de modo día/noche con persistencia, la identidad visual con logo e iconografía SVG propios, la integridad UTF-8 sin texto roto, la separación y jerarquía de secciones ("Mi Progreso", "Ver Todos", tarjetas de lección sin wrappers) y el punto único de disponibilidad por nivel.

## Requirements

### Requirement: Sistema de diseño unificado y fuentes por link
El sistema SHALL definir todas las variables CSS de color, tipografía (`Plus Jakarta Sans`, `Inter`, `Fira Code`), espaciado, radios, bordes de `1px`, acento primario sólido sobrio (`--accent-primary`, sin gradientes decorativos) y colores por nivel desaturados en `:root` dentro de `styles.css`, con soporte para `data-theme="dark|light"`, `prefers-color-scheme` y `prefers-reduced-motion`, cargando las fuentes con `<link>` en `index.html` sin `@import` en hojas CSS.

#### Scenario: Fuentes cargadas por link, tokens activos y acento sólido
- **WHEN** se carga `index.html`
- **THEN** las fuentes (`Plus Jakarta Sans`, `Inter`, `Fira Code`) se enlazan con `<link>` en `<head>`, `styles.css` no contiene `@import`, y los botones y barras de progreso usan colores sólidos sin gradientes decorativos

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

### Requirement: Integridad UTF-8 sin texto roto ni mojibake
El sistema SHALL mantener todos los archivos del frontend codificados en UTF-8 sin BOM, con `<meta charset="UTF-8">` en `index.html`, sin caracteres `U+FFFD`, sin secuencias de mojibake (`Ã³`, `Ã±`, `ðŸ`, `â€`) y sin `"??"` ni signos `?` sustitutos de tildes/ñ en textos visibles, mostrando `"Tomar Evaluación"`, `"Descargar Material de Estudio"` y `"Tu progreso se guarda solo en este navegador"` correctamente.

#### Scenario: Textos visibles íntegros en tarjetas de nivel y aviso local
- **WHEN** se inspeccionan los archivos del frontend y se renderizan las tarjetas de nivel en el navegador
- **THEN** ningún archivo contiene BOM, `U+FFFD`, mojibake ni `"??"`, y los botones de nivel muestran `"Descargar Material de Estudio"` y `"Tomar Evaluación"` con acentuación correcta

### Requirement: Selector de modo día y noche con persistencia
El sistema SHALL incluir un botón accesible de cambio de tema (`#theme-toggle`) en el extremo derecho del `.header`, con íconos SVG inline de sol y luna, área táctil mínima de `44x44 px`, `aria-label` en español y `aria-pressed`, que alterna `data-theme="dark"` y `data-theme="light"` en `<html>`, persiste la preferencia en `localStorage` (`javamaster_theme`, protegido con `try/catch`) y toma por defecto `prefers-color-scheme` antes del primer pintado sin parpadeo.

#### Scenario: Alternancia entre modo día y modo noche
- **WHEN** la persona usuaria pulsa `#theme-toggle` en el encabezado
- **THEN** el atributo `data-theme` en `<html>` cambia inmediatamente entre `"dark"` y `"light"`, `aria-pressed` se actualiza y la elección queda guardada en `localStorage`

### Requirement: Logo SVG geométrico propio e iconografía SVG en interfaz
El sistema SHALL mostrar en el encabezado un logo SVG inline geométrico propio (monograma técnico `{;}` en marco geométrico, sin usar ni imitar la taza de café oficial de Java) acompañado de `"JavaMaster"`, un patrón técnico sutil de fondo en `.hero` y el lienzo general compatible con modo claro y oscuro, y SHALL utilizar íconos SVG inline de trazo fino (`1.75px`) en lugar de emojis para los controles y encabezados de la interfaz.

#### Scenario: Logo SVG propio e íconos SVG en UI
- **WHEN** se carga la página principal en modo claro u oscuro
- **THEN** el `.logo` presenta un `<svg>` geométrico original junto a `"JavaMaster"` sin el emoji `☕`, y los botones y encabezados de la interfaz utilizan íconos `<svg>` inline en lugar de emojis
