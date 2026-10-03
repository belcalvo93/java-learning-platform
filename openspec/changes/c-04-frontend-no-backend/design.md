# Design — c-04-frontend-no-backend

## Context

Ver propuesta (`proposal.md` — Why). Estado real relevado en lectura
solo-lectura (nada modificado):

- `java-executor.js:5` defaultea a `http://localhost:3000/api/execute`;
  `execute()` hace `fetch` sin `AbortController`/timeout y ante fallo devuelve
  `stage: 'connection'` con `Error de conexión con el servidor: …`
  (expone detalle crudo). `checkHealth()` deriva `/health` sin timeout.
- `script-enhanced.js:117-119` construye `new JavaExecutor(CONFIG.executeEndpoint)`
  — hoy `''` (C-02 dejó `BACKEND_URL=''`, `executeEndpoint=''` en
  `config.js:11,21-22`) — e intenta red siempre (salvo indentación); el
  `catch` (`:129-141`) sugiere `cd backend && npm start`, lo que miente en
  Pages. Loading dice "Validando tu código con IA…" (`:94`).
- `script-enhanced.js:122-124` valida con `AIValidator.validateWithAI`;
  esa ruta ya cae a keywords locales sin backend pero devuelve
  `functionalityScore: 95` / `styleScore` (`ai-validator.js:217-227`) que
  `displayValidationResult` pinta como "🤖 Feedback de IA" +
  "📊 Funcionalidad: % | Estilo: %" (`script-enhanced.js:182,224`).
  `validator.js` (`javaValidator.validate`) es el fallback real pedido.
- `script.js:7,16,33` toca `localStorage` sin `try/catch` (cuota/bloqueo
  rompen); `script-enhanced.js:241,284,499,501,555` igual. Sin aviso
  persistente local-only en UI.
- Firebase: `firebase-config.js:5-12` trae keys `DEMO…` + `initializeApp` al
  importar + `console.log('✅ Firebase inicializado correctamente')` (`:19`);
  `auth.js` define `AuthManager`, instancia `authManager` (`:146`), parchea
  `ProgressManager.prototype.markAsCompleted` (`:150`) y expone
  `showAuthModal/closeAuthModal/handleSignUp/handleSignIn/handleGoogleSignIn`.
  Referencias vivas confirmadas: `index.html:44,47`
  (`onclick="showAuthModal()"`), `index.html:304` (`id="auth-modal"`),
  `index.html:346-349` SDK ×3 + `:360-361` ambos archivos. Rama de
  desimport total NO aplicable hoy (hay uso vivo) — el plan la codifica igual
  por si el apply encuentra lo contrario.
- `config.js` post-C-02 ya cumple "sin default Render": `BACKEND_URL=''`,
  endpoints `''`, `executionTimeout: 5000`, `AI_ENABLED=false`.

## Goals / Non-Goals

**Goals:**

- Degradación explícita y testeable en la lógica (TDD, `node --test` sin
  framework nuevo, patrón C-01 `tools/*.test.js`).
- UI honesta verificable a mano (checklist móvil + desktop, cero errores de
  consola).
- Firebase neutralizado sin romper carga (rama con uso vivo = banner +
  botones deshabilitados; sin uso vivo = desimport).

**Non-Goals (diseño, no implementación):**

- Reactivar backend o elegir executor (C-05/C-06, RN-SEG-02 sigue cerrado).
- Corregir reglas del validator (C-10: ids 3–8, 168).
- Publicar en Pages (C-07) o rediseñar (C-12).

## Decisions

1. **Detección: `isBackendConfigured()` antes de cualquier red.**
   `Boolean(CONFIG.backendUrl && CONFIG.executeEndpoint)` — ambos `''` hoy
   → ausente sin `fetch`. Solo si configurado: un único `fetch` con
   `AbortController` + `checkHealth()` con el mismo timeout; sin reintento,
   sin backoff. El mensaje exacto "ejecución no disponible — validando por reglas"
   sale en ambos caminos (ausente y caído/timeout).
   Alternativa descartada: `checkHealth()` siempre — haría red inútil en
   Pages y latencia fantasma.

2. **Timeout: reutilizar `CONFIG.executionTimeout` (5000 ms).**
   Ya existe (`config.js:25`), coincide con el stage futuro (Flujo 2:
   `javac`/`java` con timeout 5s) y evita un segundo valor a sincronizar. El
   `AbortController` aborta a los 5000 ms y el error se rotula con su stage
   (`compilation`/`execution`/`connection` → mensaje legible, nunca la URL).
   Alternativa descartada: timeout nuevo de 8–10 s — más espera sin backend
   real que lo justifique.

3. **Precedencia de fallback: `validator.js` decide; `AIValidator`-local solo
   aporta warnings de estilo, sin scores.**
   `javaValidator.validate(code, id)` es el veredicto (correcto/incorrecto +
   mensajes en español). `AIValidator.validateSyntax/validateStyle` pueden
   reusarse como chequeo suplementario no bloqueante, pero sus
   `functionalityScore/styleScore` NO se renderizan mientras `AI_ENABLED=false`
   (se suprime el bloque `:222-226` y el panel "🤖 Feedback de IA" `:180-188`;
   el `explanation` local se muestra como texto neutro "Validación por reglas"
   o se omite). Ante conflicto, manda `validator.js`.
   Alternativa descartada: mantener scores al 95 % "porque no ejecutamos" —
   es la falsa precisión que el roadmap ordena sacar.

4. **Firebase: rama B (uso vivo) como camino esperado, rama A codificada.**
   - Rama A (sin referencias vivas): retirar `index.html:346-349` (SDK ×3) +
     `:360-361` y dejar archivos en disco con banner (diseño C-08 los reusa).
   - Rama B (con referencias vivas — lo observado: hero `:44,47`, modal
     `:304-344`, `authManager`/`showAuthModal` en `auth.js`): mantener imports
     con banner, deshabilitar botones hero con la etiqueta exacta,
     neutralizar el modal (oculto o con aviso, sin formularios operativos) y
     quitar `console.log` `:19`. El apply corre el grep de referencias y
     reporta qué rama tomó.
   Keys `DEMO…` → `REEMPLAZAR` en ambas ramas.

5. **Lista de ocultamientos UI (verificación manual, sin tests):**
   hero `:43-51` → deshabilitados + etiqueta exacta; modal `#auth-modal`
   `:304-344` → no operativo; `firebase-config.js:19` → eliminado;
   loading `:94` → "Validando por reglas…"; `catch :131-141` → mensaje exacto
   + veredicto por reglas (fuera `cd backend…`); `:182` "🤖 Feedback de IA" →
   fuera; `:222-226` porcentajes → fuera; aviso "tu progreso se guarda solo en este navegador"
   persistente (hero o barra progreso); `ProgressManager` + guardados de
   `script-enhanced.js` envueltos en `try/catch` con aviso + memoria.

6. **Tests primero solo para lógica (TDD estricto); UI-hiding manual.**
   Tests `node --test`: backend ausente → fallback; caído/timeout → mensaje +
   intento único; `localStorage` indisponible → aviso + operativa; validación
   → español sin stacktrace. Para no acoplar tests al DOM, la detección,
   el formateo de error con stage y el wrapper de storage viven en funciones
   puras testeables (`isBackendConfigured`, `formatStageError`,
   `safeStorage`). Lo visual (botones, labels, Firebase, IA) va con checklist
   móvil + desktop en tasks, sin asserts DOM.

## Risks / Trade-offs

- [Riesgo] `auth.js` parchea `markAsCompleted` al importarse; si se desimporta
  (rama A) el parche desaparece — sin efecto porque el parche solo sincroniza
  a Firestore inexistente. Mitigación: `ProgressManager` local intacto.
- [Riesgo] Suprimir scores cambia snapshots visuales de tests futuros.
  Mitigación: tests fijan ausencia de "Feedback de IA"/"Funcionalidad" en el
  HTML renderizado.
- [Riesgo] `CONFIG.executeEndpoint` vacío hoy hace que `new JavaExecutor('')`
  falle en `fetch('')` si alguien lo llama directo. Mitigación: la detección
  previa impide llegar al `fetch`; además el constructor valida vacío.
- [Trade-off] Un solo intento sin reintento puede marcar "caído" un backend
  lento. Aceptado: el roadmap lo exige (nunca reintento infinito) y el
  fallback a reglas mantiene el aprendizaje.

## Migration Plan

Solo estáticos del frontend; rollback = revertir el commit único del change.
Orden apply: tests RED → lógica degradación → storage seguro → banners
Firebase + rama A/B → UI honesta → checklist manual móvil + desktop.
Tras aplicar: Pages sigue $0, 52/208 intactos, cero secretos nuevos.

## Open Questions

Ninguna que bloquee: si el apply encuentra consumidores de
`CONFIG.executeEndpoint` fuera de `script-enhanced.js:118`, lo reporta sin
ampliar alcance.
