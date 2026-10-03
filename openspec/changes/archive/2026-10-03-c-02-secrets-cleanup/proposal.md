# Proposal — c-02-secrets-cleanup (C-02 secrets-cleanup)

> Nota de nombre: el roadmap la llama `C-02-secrets-cleanup`; el CLI exige
> kebab-case en minúsculas, por eso el change vive como
> `c-02-secrets-cleanup`. Son el mismo change.

## Why

`config.js:6` todavía contiene una `GEMINI_API_KEY` hardcodeada (revocada
pero presente) y un `BACKEND_URL` apuntando al backend de Render suspendido
por inyección de comandos; `gemini-integration.js` hace `fetch` a Gemini
desde el navegador (IN-03, DD-03, RN-SEG-03). Hay que dejar cero secretos
reales en el código actual y desactivar la IA en navegador antes de
cualquier publicación (C-07) o reactivación (C-06).
(Firebase no-operativo se marca y desimporta en C-04, fuera de este change.)

## What Changes

- `config.js`: eliminar la `GEMINI_API_KEY` hardcodeada y el `BACKEND_URL`
  a Render; reemplazar por placeholders vacíos con comentario
  "servidor-only, nunca en frontend". Se conserva la forma de `CONFIG`
  para no romper a sus consumidores.
- `gemini-integration.js` + `ai-validator.js`: desactivar las llamadas a
Gemini desde el navegador (flag `AI_ENABLED=false` + early-return con
mensaje "IA no disponible hasta diseño servidor-only"); ningún `fetch` a
Gemini queda alcanzable desde la UI. La validación local por sintaxis y
estilo sigue funcionando.
- Paso manual Render Environment: revisar las variables de entorno del
  servicio en Render y rotar cualquier clave o token cargado ahí. No
  registrar sus valores en ningún archivo del repo.
- Verificación manual descrita en el change (sin tests de lógica):
  `git grep -in apikey` y `git grep -in gemini` no devuelven secretos
  reales; apertura de `index.html` sin errores de consola por la
  desactivación; checklist de archivos tocados.
- NO reescribe historial git (PA-03 resuelta): solo código actual.

## Capabilities

### New Capabilities

<!-- Sin capacidades nuevas: no cambia comportamiento de producto
     observable como requisito, solo remueve secretos y desactiva rutas
     inseguras. -->

### Modified Capabilities

<!-- Sin capacidades modificadas: no hay specs previas (repo sin
     openspec/specs/ más allá de .gitkeep) y la validación offline por
     reglas (validator.js) no cambia. -->

Este change no crea ni modifica specs de producto: es limpieza de
configuración + texto con verificación manual. Por eso `.openspec.yaml`
lleva `skip_specs: true` (`openspec validate` lo exige cuando hay cero
deltas).

## Impact

- Toca: `config.js`, `gemini-integration.js`, `ai-validator.js`.
- No toca: contenido de lecciones/ejercicios (`data.js`, `script.js`),
  reglas de `validator.js`, backend (`backend/server.js` sigue suspendido,
  fuera de alcance), despliegue.
- Sin costo nuevo ($0). Sin cambios de runtime para el aprendizaje por
  reglas; la vía IA queda explícitamente inactiva hasta diseño
  servidor-only (change futuro).
- **Governance CRITICO**: el apply propone y pausa para revisión de Belén
  ANTES de editar (regla de dominios críticos). No aplicar sin
  confirmación explícita.
