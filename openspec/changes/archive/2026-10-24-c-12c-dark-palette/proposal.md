# Proposal

## Why

El modo oscuro actual utiliza una paleta pizarra azulada (`#171b24`, `#212734`, `#282f3e`) que, si bien es sobria, se aleja de la dirección de identidad visual buscada. Se requiere reemplazar la paleta del modo oscuro por una atmósfera envolvente basada en verdes profundos tomada de la imagen de referencia provista por la usuaria (`#021F1D` de base, superficies intermedias y elevadas `#27413E`, acento secundario menta `#10B981` y acento primario rosa), y vincular sutilmente el modo claro incorporando el verde menta (en un tono con contraste adecuado) exclusivamente en barras de progreso, marcas de completado y estados de éxito.

## What Changes

- **Modo Oscuro**:
  - Reemplazo completo de los valores del gris pizarra por la familia verde profunda:
    - Fondo base del lienzo: `#021F1D`.
    - Superficie intermedia para tarjetas en reposo: `#132E2B`.
    - Superficie hover de tarjetas: `#1A3B37`.
    - Superficies elevadas (modales, cabecera de editor, controles elevados): `#27413E`.
    - Panel de código del editor: `#011413` (verde casi negro, más oscuro que las tarjetas).
    - Texto principal: `#E5E7EB` (derivado legible de `#D1D5DB` garantizando contraste WCAG AA ≥ 7:1 sobre `#27413E` y 13:1 sobre base).
    - Texto secundario y muted: derivados del mismo matiz verde-grisáceo (`#A3B8B5` y `#728C88`).
    - Acento secundario verde menta: `#10B981` (y `#34D399` para textos sobre superficies elevadas) para progreso, completado y éxito.
    - Acento primario rosa: `#E57389` (hover `#D95B72`), armónico con el fondo verde y con contraste verificado.
    - Bordes, líneas de indentación, patrón de fondo y foco: derivados verdes con opacidades sutiles (`rgba(16, 185, 129, ...)` y `rgba(255, 255, 255, ...)`).
    - Colores de niveles desaturados y armónicos: Principiante (`#4EB78F`), Intermedio (`#6C96B3`), Avanzado (`#A88ED1`), Experto (`#D99B62`), garantizando distinción con el menta de progreso.
  - Erradicación total de residuos del gris pizarra (`#171b24`, `#1c212c`, `#212734`, `#282f3e` y rgba asociados).
- **Modo Claro**:
  - Incorporación del verde menta como segundo color exclusivamente en:
    - Barra total de progreso (`.total-progress-fill`).
    - Marcas de completado (tarjetas completadas, `.status-badge`).
    - Estados de éxito (`--color-success`, alertas de éxito).
  - Tono menta oscuro elegido para modo claro: `#0B7A57` (contraste 5.34:1 sobre blanco `#ffffff` y 4.64:1 sobre `#edeff4`, cumpliendo WCAG AA).
  - El resto del modo claro se mantiene intacto.

## Capabilities

### Modified Capabilities
- `ui-redesign`: Actualización de los tokens de color del modo oscuro y los acentos de éxito/progreso del modo claro en `styles.css`.

## Impact

- `styles.css`: Actualización de variables en `:root, html[data-theme="dark"]`, `html[data-theme="light"]` y selector media `prefers-color-scheme`.
- `tools/encoding-integrity.test.js`: Actualización del test para validar la nueva paleta `#021F1D` en lugar del pizarra `#171b24`.
- `tools/browser-check.js`: Nuevas aserciones para verificar el color de fondo del body en modo oscuro (`#021F1D`) y contrastes de color.
