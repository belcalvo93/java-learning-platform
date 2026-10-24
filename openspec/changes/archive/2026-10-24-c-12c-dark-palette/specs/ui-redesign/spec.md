# Spec Delta: ui-redesign

## MODIFIED Requirements

### Requirement: Sistema de diseño unificado y fuentes por link
El sistema SHALL definir todas las variables CSS de color, tipografía (`Plus Jakarta Sans`, `Inter`, `Fira Code`), espaciado, radios, bordes de `1px`, acento primario sólido sobrio (`--accent-primary`, sin gradientes decorativos) y colores por nivel desaturados en `:root` dentro de `styles.css`, con soporte para `data-theme="dark|light"`, `prefers-color-scheme` y `prefers-reduced-motion`, cargando las fuentes con `<link>` en `index.html` sin `@import` en hojas CSS. En modo oscuro (`data-theme="dark"`), el fondo base del lienzo SHALL ser `#021F1D`, las tarjetas en reposo SHALL usar un tono verde intermedio (`#132E2B`), las superficies elevadas SHALL ser `#27413E`, el panel del editor `#011413`, el texto principal `#E5E7EB` y el acento secundario de progreso y éxito el verde menta `#10B981`. En modo claro (`data-theme="light"`), las barras de progreso, marcas de completado y estados de éxito SHALL utilizar el verde menta `#0B7A57` garantizando contraste WCAG AA.

#### Scenario: Fuentes cargadas por link, tokens activos y acento sólido
- **WHEN** se carga `index.html`
- **THEN** las fuentes (`Plus Jakarta Sans`, `Inter`, `Fira Code`) se enlazan con `<link>` en `<head>`, `styles.css` no contiene `@import`, y los botones y barras de progreso usan colores sólidos sin gradientes decorativos

#### Scenario: Paleta verde en modo oscuro y contraste WCAG AA
- **WHEN** se activa el modo oscuro (`data-theme="dark"`)
- **THEN** el fondo del cuerpo es `#021F1D`, las tarjetas usan fondo verde intermedio `#132E2B` y superficies elevadas `#27413E`, y todo el texto principal y componentes cumplen contraste WCAG AA (≥ 4.5:1 para texto normal)
