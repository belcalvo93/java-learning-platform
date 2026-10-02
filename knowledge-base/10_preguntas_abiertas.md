# Preguntas Abiertas

## Inconsistencias detectadas
### IN-01 — README promete Firebase; el código no lo usa
**Documento A dice**: README (autenticación, progreso con Firebase, certificado).
**Código dice**: progreso en navegador; `firebase-config.js`/`auth.js` con claves de ejemplo no operativas.
**Impacto**: roadmap basado en README sobrestima el punto de partida.
**Resolución propuesta**: corregir README en MVP (estado real) y mover Firebase a objetivo futuro. Fuente: corrección de Belén.

### IN-02 — Backend documentado como disponible; está suspendido
**README dice**: backend en Render. **Realidad**: suspendido por vuln `server.js:56,78`.
**Impacto**: cualquier plan que asuma `/api/execute` vivo falla.
**Resolución propuesta**: no asumir Render; evaluar alternativas (ver PA-02).

### IN-03 — Key Gemini en código pero "revocada"
**`config.js:6` dice**: hay key. **Belén dice**: revocada.
**Impacto**: secreto muerto en repo confunde y ensucia auditoría.
**Resolución propuesta**: remover del código en MVP (RN-SEG-03).

## Preguntas abiertas (priorizadas)

| Prioridad | Pregunta | Bloquea | Decisor |
|-----------|----------|---------|---------|
| Alta | PA-01: ¿qué ejercicios (de 208) se validan solo por reglas, cuáles exigen compilación real y qué tan fácil es engañar la validación? (matriz offline — PRIMERA tarea del roadmap) | DD-02 final | Belén + matriz validator |
| Alta | PA-02: ¿alternativa de ejecución segura? (parche sandbox propio vs Piston/Judge0 vs WASM vs solo reglas) | Rediseño executor | Belén (costo/mantenimiento) |
| Alta | PA-03: RESUELTA — no reescribir historial git. La clave Gemini ya fue revocada; alcanza con removerla del código actual (`config.js`) y no reactivar nada. | — | Belén (decidido) |
| Media | PA-04: proveedor auth/DB futuro (Firebase real vs Supabase vs otro) y modelo Avance/Certificado | US-006/007 | Belén |
| Media | PA-05: ¿panel admin en repo (git) alcanza hasta post-MVP o se necesita editor contenido? | US-007 alcance | Belén |
| Baja | PA-06: certificado v1.0 local — ¿mostrarlo como "no verificable" o esconderlo hasta login? | US-005 copy | Belén |
| Baja | [DISCOVERY] `scale` futuro: piloto `team` hoy, ¿umbral para pasar a `public_multi_user` (infra/costo)? | Roadmap | Belén |

> Nota discovery: `system_type=web_app` (plataforma educativa), `scale=team` (piloto <50, apertura futura), `domain=education`, `stack=Vanilla JS + Node/Express + JDK21`, `needs_infra=true`. Escala futura queda como pregunta (PA) sin inventar fecha.
