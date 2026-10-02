# Descripción General

## Stack tecnológico

| Capa | Tecnologías | Versión mínima |
|------|--------------|----------------|
| Frontend | HTML5, CSS3, JavaScript Vanilla (sin framework) | Navegador moderno ES2020 |
| Estilos | styles.css + colors-feminine.css + modules-view.css | — |
| Lógica curso | script.js, script-enhanced.js, data.js (208 ejercicios), validator.js, java-executor.js | — |
| Auth/DB declarada | firebase-config.js, auth.js (código ejemplo, NO operativo) | No aplica en v1.0 |
| Backend executor | Node.js + Express + cors + dotenv | Node 16+ |
| Compilación Java | JDK instalado en host del backend | JDK 21+ |
| IA opcional | gemini-integration.js + ai-validator.js + config.js (key REVOCADA, pendiente remover) | — |
| Hosting MVP | GitHub Pages (frontend estático) | — |
| Hosting backend | Render (SUSPENDIDO a propósito, ver §09) | — |

## Arquitectura general

```
[Navegador] ──lecciones/ejercicios──▶ [data.js + script.js]
     │  validación por reglas (validator.js) — funciona SIN backend
     │  progreso localStorage — SIN login ni DB en v1.0
     │
     └──(opcional, DESHABILITADO en MVP)──▶ [Node/Express /api/execute]
                                             javac + java en host
                                             Render SUSPENDIDO por vuln
```

Decisión de alto nivel: el frontend DEBE funcionar standalone. El backend es un acelerador opcional, nunca un requisito para el MVP. Esto permite costo cero y elimina la superficie de ataque mientras se rediseña la ejecución segura.

**Suposición SIN VERIFICAR (ver PA-01):** se asume que `validator.js` podría cubrir los 208 ejercicios por reglas, pero NO está verificado. La auditoría pendiente debe determinar cuántos validan solo por reglas, cuáles necesitan compilación real y qué tan fácil es engañar la validación.

## Integraciones externas

| Servicio | Propósito | Tipo | Estado real |
|----------|-----------|------|-------------|
| Firebase Auth/Firestore | Login + progreso (según README) | SDK | NO operativo — keys de ejemplo, no se usan |
| Gemini API | Validación IA de código | REST | Key REVOCADA, pendiente remover de `config.js:6` |
| Render | Host backend executor | PaaS | SUSPENDIDO — no reactivar sin fix |
| GitHub Pages | Host frontend | Estático | Objetivo MVP |

## API REST (backend suspendido — referencia)

| Método | Ruta | Body | Notas |
|--------|------|------|-------|
| GET | /health | — | `backend/server.js:32` |
| POST | /api/execute | `{ code, className='Main' }` | VULNERABLE — `className` sin validar (`server.js:56,78`) |

> NO exponer este backend hasta rediseño. Ver `05_reglas_de_negocio.md` (RN-SEG) y `09_decisiones_y_supuestos.md` (DD-01).
