# Proposal — c-03-readme-truth (C-03 readme-truth)

> Nota de nombre: el roadmap la llama `C-03-readme-truth`; el CLI exige
> kebab-case en minúsculas, por eso el change vive como
> `c-03-readme-truth`. Son el mismo change (precedente: C-01, C-02).

## Why

El `README.md` (181 líneas) describe una plataforma que el código no
sostiene: promete compilador Java en el navegador, progreso con Firebase
y certificado como hechos, documenta un backend en Render que está
suspendido y pide API keys para instalar (IN-01, IN-02). Rige la
excepción global de `05_reglas_de_negocio.md`: donde README y código se
contradicen, manda el código y el README se corrige. Sin este change
obligatorio, cada change posterior (C-04, C-07) parte de expectativas
falsas y la publicación confundiría a estudiantes.

## What Changes

- Reescribir la lista de características (`README.md:10-16`): quitar
  "Compilador Java en Tiempo Real en el navegador", "Sistema de
  Progreso con Firebase" y "Certificado" como hechos; reemplazar por el
  estado real: validación por reglas offline (`validator.js`), progreso
  solo en este navegador (`localStorage`), sin login ni base de datos,
  IA desactivada (post-C-02: `config.js` con `AI_ENABLED=false`,
  `geminiApiKey=''`).
- Reescribir Demo/Despliegue (`README.md:18-21,101-118`): frontend
  GitHub Pages como único despliegue MVP; línea de backend Render
  eliminada como URL viva y sección Render movida a "desactivado hasta
  ejecución segura (RN-SEG-02)" sin pasos de activación. Placeholders
  `TU-USUARIO` conservados y marcados como pendientes de la URL real
  (la fija C-07); Belén actualiza sus datos de contacto ella misma.
- Reescribir Tecnologías y Requisitos (`README.md:53-99`): Firebase
  pasa a ejemplo no operativo; JDK/Node solo para desarrollo del
  executor futuro, no para usar la plataforma; uso = servidor estático
  (`python -m http.server`); se elimina el paso "agrega tu API key de
  Gemini".
- Mantener intactos los invariantes reales: 52 lecciones (15/15/12/10),
  208 ejercicios, autoría de Belén. Verificación manual: checklist línea
  por línea README-vs-código (cada afirmación trazable a código/KB) +
  revisión de Belén; sin tests de lógica (cambio de texto).
- **Alcance atómico**: solo `README.md`. Sin cambios de código, sin
  config de Pages/Render (C-07), sin trabajo Firebase/auth (C-04/C-08),
  sin reescribir historial git.

## Capabilities

### New Capabilities

<!-- Sin capacidades nuevas: no cambia comportamiento de producto
     observable como requisito, solo corrige documentación para que
     describa el comportamiento real. -->

### Modified Capabilities

<!-- Sin capacidades modificadas: no hay specs previas (repo sin
     openspec/specs/ más allá de .gitkeep) y ningún requisito de
     runtime cambia. -->

Este change no crea ni modifica specs de producto: es corrección de
texto con verificación manual. Por eso `.openspec.yaml` lleva
`skip_specs: true` (`openspec validate` lo exige cuando hay cero
deltas).

## Impact

- Toca: `README.md` (único archivo).
- No toca: contenido de lecciones/ejercicios (`data.js`, `script.js`),
  reglas de `validator.js`, `config.js` (ya limpio post-C-02), backend
  (`backend/server.js` sigue suspendido, fuera de alcance), despliegue,
  historial git.
- Sin costo nuevo ($0). Sin cambios de runtime para el usuario.
- **Governance BAJO**: cambio de documentación; el apply edita y pide
  revisión de Belén antes de cerrar, sin commit/push (solo artefactos +
  `README.md` en working tree).
