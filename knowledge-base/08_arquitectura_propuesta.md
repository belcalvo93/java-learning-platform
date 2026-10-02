# Arquitectura Propuesta

## Patrones aplicados

| Patrón | Dónde se usa | Por qué |
|--------|--------------|---------|
| Static-first / Offline-first | Frontend valida sin servidor | Costo $0, funciona sin backend, menor ataque |
| Graceful degradation | Ejecución remota → reglas locales | Nunca bloquear aprendizaje por infra |
| Allowlist validation | `className` y futuros inputs backend | Cierra inyección (RN-SEG-01) |
| Sandbox + timeout + cleanup | Executor Java (futuro) | Contiene compilación arbitraria |
| Secrets fuera del repo | `config.js` sin keys | Evita filtración (RN-SEG-03) |

## Estructura de directorios (actual, no cambiar en MVP salvo KB)

```
java-learning-platform/
├── index.html / guia-*.html
├── script.js / script-enhanced.js / data.js
├── validator.js / java-executor.js
├── ai-validator.js / gemini-integration.js
├── config.js  (PENDIENTE: remover key)
├── auth.js / firebase-config.js (ejemplo NO operativo)
├── backend/
│   ├── server.js (SUSPENDIDO — vuln server.js:56,78)
│   ├── package.json / .env.example
├── knowledge-base/ (esta KB)
└── openspec/ (framework)
```

## Seguridad
- Autenticación: ninguna en v1.0 (todo público). Futuro: proveedor a decidir (ver preguntas abiertas).
- Autorización: N/A en v1.0.
- Validación de input: frontend best-effort; backend futuro con allowlist estricta + `execFile` (sin shell) o sandbox externo. Prohibido `exec` con interpolación.
- Secrets management: `.env` no commiteado + `.env.example` como plantilla; ninguna key en JS trackeado. Rotar lo ya expuesto (Gemini ya revocada; verificar Firebase ejemplo).
- CORS: origen explícito del frontend publicado (no `*` permanente).

## Variables de entorno

| Variable | Descripción | Ejemplo | Sensible |
|----------|-------------|---------|----------|
| PORT | Puerto backend | 3000 | N |
| GEMINI_API_KEY | IA opcional (futuro, servidor-only) | — | Y (nunca en frontend) |
| FIREBASE_* | Auth/DB futuro | — | Y (solo las públicas client si se usa) |
| BACKEND_URL | URL executor configurada en frontend | https://… | N |

> `config.js` actual hardcodea `GEMINI_API_KEY` y `BACKEND_URL` apuntando a Render suspendido — ambas deben salir del código en el MVP.
