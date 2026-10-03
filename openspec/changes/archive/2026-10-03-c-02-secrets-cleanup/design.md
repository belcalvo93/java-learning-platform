# Design — c-02-secrets-cleanup

## Context

Ver propuesta (`proposal.md` — Why). Estado real relevado en exploración
solo-lectura (no se modificó nada):

- `config.js`: `GEMINI_API_KEY = 'AIza…apHA'` (redactada; key real aunque
revocada, `config.js:6`) y `BACKEND_URL =
  'https://java-learning-platform.onrender.com'` (`config.js:9`, Render
  suspendido). `CONFIG` expone `geminiApiKey`, `backendUrl`,
  `executeEndpoint`, `healthEndpoint`; lo consumen `script-enhanced.js:118`
  (`new JavaExecutor(CONFIG.executeEndpoint)`) y `script-enhanced.js:123`
  (`new AIValidator(CONFIG.geminiApiKey)`).
- `gemini-integration.js`: `GeminiValidator.analyzeCode` hace `fetch`
  directo a `generativelanguage.googleapis.com` con `?key=${this.apiKey}`
  (`gemini-integration.js:22`) — llamada navegador→Gemini con key en
  cliente.
- `ai-validator.js`: `AIValidator` recibe `geminiApiKey` en el constructor
  pero su ruta real hoy (`validateWithAI`) ya no llama a Gemini: valida
  sintaxis/estilo local y cae a reglas sin backend. El `geminiValidator`
  construido se guarda pero nunca se invoca desde `validateWithAI`.
- `firebase-config.js`: `apiKey: "AIza…apHA"` (redactada; key de ejemplo,
no operativa) + `firebase.initializeApp(...)` al cargar el
  script. `auth.js` define `AuthManager` y monkey-patchea
  `ProgressManager.prototype.markAsCompleted` al importarse.
- `index.html:346-362`: importa SDK Firebase (3 scripts), `config.js`,
  `java-executor.js`, `gemini-integration.js`, `ai-validator.js`,
  `firebase-config.js`, `auth.js`, `script-enhanced.js`.
- `backend/.env.example`: plantilla ya sana (`GEMINI_API_KEY=tu_api_key_aqui`);
  no requiere cambios.

## Goals / Non-Goals

**Goals:**

- Cero secretos reales en el código actual, verificable con `git grep`.
- Ningún `fetch` a Gemini alcanzable desde la UI tras el change.
- Página abre sin errores de consola tras la desactivación.

**Non-Goals:**

- Reescribir historial git (PA-03 resuelta: prohibido).
- Firebase no-operativo (banner + desimportar): se hace en C-04.
- Diseñar el Gemini servidor-only (change futuro post-MVP).
- Reactivar o tocar el backend (`server.js` sigue suspendido).
- Cambiar contenido de lecciones/ejercicios o reglas de `validator.js`.
- Migración de progreso local (post-MVP, C-08).

## Decisions

1. **Placeholder vacío en `config.js`, no borrado del archivo.**
   `geminiApiKey: ''` + comentario "servidor-only, nunca en frontend";
   `backendUrl: ''` sin default a Render (endpoints derivados quedan
   inertes). Se conserva la forma de `CONFIG` porque
   `script-enhanced.js:118,123` lo referencia y borrar el archivo rompería
   la carga con `ReferenceError`.
   Alternativa descartada: borrar `config.js` — obligaría a reescribir a
   sus consumidores en este mismo change, mezclando objetivos (regla "un
   change un commit").

2. **Desactivación por flag + early-return, no borrado de archivos IA.**
   `AI_ENABLED = false` en `config.js`; `GeminiValidator.analyzeCode`
   retorna de entrada `{ success: false, …, explanation: 'IA no disponible
   hasta diseño servidor-only' }` sin `fetch`; `AIValidator` ignora la key
   (`geminiValidator = null`) y su ruta local (sintaxis/estilo/reglas) sigue
   intacta. Los `<script>` de `gemini-integration.js`/`ai-validator.js`
   pueden quedarse importados (clases inertes) o retirarse si nada los
   referencia tras el cambio — lo decide el apply según referencias.
   Alternativa descartada: borrar ambos archivos — C-04 trabaja sobre el
   fallback a `validator.js` y el borrado entrelazaría scopes.

3. **Firebase: FUERA DE ALCANCE en C-02 — se hace en C-04.**
   Banner "EJEMPLO NO OPERATIVO" + keys → `REEMPLAZAR` + desimportar de
   `index.html` (tras listar referencias vivas) pasan a C-04. Los archivos
   quedan en disco como ejemplo marcado para el diseño futuro (C-08).

4. **Render Environment es paso manual de Belén, no del agente.**
   El change documenta el paso (revisar Environment del servicio y rotar
   claves/tokens) y el apply verifica que ningún valor quedó registrado en
   el repo; el agente nunca ve ni escribe valores reales.
   Alternativa descartada: que el agente "verifique" Render — no tiene
   acceso ni debe manejar secretos.

5. **Verificación manual, sin tests de lógica.**
   Es cambio de config/texto (regla "TDD o verificación"): `git grep -in
   apikey|secret|gemini` sin secretos reales, apertura de `index.html` sin
   errores de consola, checklist de archivos. No se agregan tests porque no
   hay lógica nueva que fijar.

## Risks / Trade-offs

- [Riesgo] `script-enhanced.js:118` construye `JavaExecutor('' + …)` con
  endpoint vacío → error en runtime al intentar ejecutar. Mitigación: ese
  camino ya falla hoy (backend suspendido); C-04 lo convierte en
  degradación explícita con el mensaje exacto. Este change solo verifica
  que la página carga sin errores de consola en flujos que no ejecutan.
- [Riesgo] La key revocada sigue en historial git (visible en clones
viejos). Mitigación: aceptado por PA-03 (revocada = inofensiva); no se
reescribe historial.
- [Trade-off] Clases IA inertes quedan como código muerto hasta el diseño
  servidor-only. Aceptado: muerto pero inalcanzable es mejor que borrado
  que entrelaza C-04.

## Migration Plan

Sin despliegue ni migración: cambia solo archivos estáticos del frontend.
Rollback = revertir el commit único del change. Tras aplicar: la vía IA
responde "no disponible" y el aprendizaje por reglas queda intacto.

## Open Questions

Ninguna que bloquee: si el apply encuentra referencias a
`CONFIG.geminiApiKey` fuera de `script-enhanced.js:123`, lo reporta sin
cambiar el alcance.
