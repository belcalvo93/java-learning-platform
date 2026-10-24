# Design

## Context

El change C-12c reemplaza la base cromática del modo oscuro de JavaMaster por una atmósfera verde profunda basada en la muestra provista por la usuaria, con `#021F1D` como fondo del canvas y `#27413E` para superficies elevadas, integrando el verde menta `#10B981` como acento secundario y preservando el rosa del modo claro adaptado. Asimismo, el modo claro incorpora el verde menta en tono oscuro (`#0B7A57`) en progreso y éxito.

Ver `proposal.md` y spec delta en `specs/ui-redesign/spec.md`.

## Goals / Non-Goals

**Goals:**
- Mapear exactamente los anclajes de color:
  - Base: `#021F1D`.
  - Tarjetas en reposo: `#132E2B` (escalón intermedio entre `#021F1D` y `#27413E`).
  - Tarjetas hover: `#1A3B37`.
  - Superficies elevadas (modales, headers de tarjeta/editor, toggle): `#27413E`.
  - Panel editor: `#011413`.
  - Texto principal: `#E5E7EB` (derivado de `#D1D5DB` con contraste 8.87:1 sobre `#27413E` y 13.9:1 sobre `#021F1D`).
  - Texto secundario: `#A3B8B5` (contraste 5.27:1 sobre `#27413E`).
  - Acento secundario progreso: verde menta `#10B981`.
  - Acento primario rosa: `#E57389` (hover `#D95B72`), con excelente legibilidad y armonía.
  - Modo claro: verde menta en `#0B7A57` para progreso y éxito.
- Contraste WCAG AA en todas las combinaciones de texto y superficie.
- Erradicación 100% de valores residuales de gris pizarra (`#171b24`, `#1c212c`, etc.).

**Non-Goals:**
- NO modificar la disposición estructural, grid, navegación ni márgenes logrados en C-11b / C-12 / C-12b.
- NO alterar la lógica de las lecciones, validadores ni datos.
- NO cambiar el resto de los componentes del modo claro.

## Decisions

### Decisión 1: Escalonamiento de superficies en verde profundo
- Fondo de página: `#021F1D` (luminancia muy baja, inmersivo).
- Tarjetas en reposo: `#132E2B` (distingue claramente las tarjetas del canvas).
- Superficie elevada (modales, ventanas de lección/ejercicio, sticky headers): `#27413E` (anclaje exacto de la referencia).
- Editor de código: `#011413` (máxima concentración, efecto pantalla terminal oscura).

### Decisión 2: Tono de verde menta para Modo Claro
- `#10B981` tiene ratio 2.3:1 sobre blanco (insuficiente para texto/íconos).
- Se elige `#0B7A57` para el modo claro: ratio de 5.34:1 sobre `#ffffff` y 4.64:1 sobre `#edeff4`, cumpliendo holgadamente WCAG AA.

## Risks / Trade-offs

- [Riesgo de que el nivel Principiante se confunda con el verde menta de progreso] → Se ajusta el verde de Principiante a `#4EB78F` (un verde agua / jade suave) mientras que el progreso menta es `#10B981` (un verde esmeralda brillante saturado).
