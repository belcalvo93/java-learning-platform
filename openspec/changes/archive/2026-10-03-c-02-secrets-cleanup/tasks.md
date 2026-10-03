# Tasks — c-02-secrets-cleanup

> Verificación MANUAL (cambio de config/texto, sin lógica nueva — regla
> "TDD o verificación"). Sin tests de lógica. Governance CRITICO: proponer
> y pausar para revisión de Belén ANTES de editar. Sin commit/push
> (solo artefactos + código en working tree cuando se autorice).
> No reescribir historial git (PA-03). No tocar contenido de
> lecciones/ejercicios ni reglas de `validator.js`.

## 1. `config.js` — cero secretos con forma conservada

- [x] 1.1 Eliminar `GEMINI_API_KEY` hardcodeada (`config.js:6`) y `BACKEND_URL`
  a Render (`config.js:9`); dejar `geminiApiKey: ''` (+ comentario
  "servidor-only, nunca en frontend"), `backendUrl: ''` sin default, y flag
  `AI_ENABLED = false`; verificar que `CONFIG` conserva sus claves
  (`geminiApiKey`, `backendUrl`, `executeEndpoint`, `healthEndpoint`) por
  inspección del archivo.
- [ ] 1.2 Verificar que `git grep -in "AIzaSy" -- config.js` no devuelve
  nada y que `git grep -in "onrender" -- config.js index.html` no devuelve
  URLs reales.

## 2. IA en navegador — desactivada e inalcanzable

- [x] 2.1 Agregar early-return en `GeminiValidator.analyzeCode`
  (`gemini-integration.js:18`) con mensaje "IA no disponible hasta diseño
  servidor-only" antes de cualquier `fetch`; verificar por inspección que
  no hay `fetch` alcanzable (ningún camino desde UI llega a la llamada HTTP).
- [x] 2.2 Hacer que `AIValidator` ignore la key (`ai-validator.js:6-7`,
`geminiValidator = null`) manteniendo intacta la validación local
(sintaxis/estilo/reglas); verificar abriendo `index.html` y validando un
ejercicio por reglas sin errores de consola atribuibles al cambio.
[grep ✓ 2026-10-03; falta check en navegador de Belén]
- [ ] 2.3 Verificar que `git grep -in "generativelanguage.*key\|?key=" --
  gemini-integration.js ai-validator.js` no muestra llamadas con key, y que
  la consola del navegador no registra llamadas de red a
  `generativelanguage.googleapis.com` al validar un ejercicio.

## 3. Render Environment — paso manual de Belén + cierre

- [ ] 3.1 Documentar el paso manual (Belén revisa Environment del servicio
en el dashboard de Render y rota claves/tokens cargados ahí); el agente
no registra valores; verificar con checklist que ningún valor de secreto
quedó escrito en el repo (`git grep -in "apikey\|api_key\|secret\|token" --
. ':!openspec' ':!knowledge-base'` revisado a mano, sin secretos reales).
- [ ] 3.2 Cierre: `git status` muestra solo `config.js`,
`gemini-integration.js`, `ai-validator.js` (+ artefactos del change);
ningún contenido de lecciones/ejercicios modificado, historial git
intacto, invariante 52/208 sin tocar.

> Firebase (banner no-operativo + desimportar de `index.html`) es FUERA DE
> ALCANCE en C-02: se hace en C-04 (ver CHANGES.md).
