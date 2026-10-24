# Delta Spec: ui-redesign (C-12b UI Polish)

## MODIFIED Requirements

### Requirement: Sistema de diseño unificado y fuentes por link
El sistema SHALL definir todas las variables CSS de color, tipografía (`Plus Jakarta Sans` para títulos, `Inter` para cuerpo, `Fira Code` para código), espaciado, radios, bordes de `1px`, acento primario sólido sobrio (`--accent-primary`, sin gradientes rosa→púrpura en botones ni barras) y colores por nivel desaturados en `:root` dentro de `styles.css`, soportando `html[data-theme="dark"]`, `html[data-theme="light"]`, `prefers-color-scheme` y `prefers-reduced-motion`, y SHALL cargar las fuentes tipográficas mediante `<link>` en `index.html` sin usar `@import` en hojas CSS.

#### Scenario: Fuentes cargadas por link, tokens activos y acento sólido
- **WHEN** se carga `index.html`
- **THEN** las fuentes (`Plus Jakarta Sans`, `Inter`, `Fira Code`) se enlazan con `<link>` en `<head>`, `styles.css` no contiene `@import`, y los botones y barras de progreso usan colores sólidos sin gradientes decorativos

## ADDED Requirements

### Requirement: Integridad UTF-8 sin texto roto ni mojibake
El sistema SHALL mantener todos los archivos del frontend (`index.html`, `script.js`, `script-enhanced.js`, `lesson-nav.js`, `data.js`, `validator.js` y hojas `.css`) codificados en UTF-8 sin BOM, con `<meta charset="UTF-8">` en `index.html`, sin caracteres `U+FFFD`, sin secuencias de mojibake (`Ã³`, `Ã±`, `ðŸ`, `â€`) y sin `"??"` ni signos `?` sustitutos de tildes/ñ en textos visibles, mostrando `"Tomar Evaluación"`, `"Descargar Material de Estudio"` y `"Tu progreso se guarda solo en este navegador"` correctamente.

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
