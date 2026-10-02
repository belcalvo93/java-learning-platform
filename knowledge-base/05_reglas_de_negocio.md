# Reglas de Negocio

Cada regla tiene código único para trazabilidad.

## Dominio: Seguridad (RN-SEG) — no negociables
- **RN-SEG-01**: Ningún input del usuario se interpola en shell. `className`/`code` deben validarse contra allowlist (`^[A-Z][A-Za-z0-9_]{0,31}$`) o rechazarse — Origen: vuln `backend/server.js:56,78` (`exec` con template string).
- **RN-SEG-02**: El backend executor NO se reactiva ni se publica hasta que RN-SEG-01 + sandbox (timeout, límite output, aislamiento, limpieza) estén verificados con tests.
- **RN-SEG-03**: Cero secretos en código actual. Ninguna API key (Gemini, Firebase) en `config.js` ni ningún archivo trackeado. Basta con revocar y remover del código actual — NO se reescribe el historial git (decisión PA-03). Las llamadas a Gemini desde el navegador quedan desactivadas hasta diseño servidor-only.
- **RN-SEG-04**: CORS y límites de body deben ser restrictivos (origen explícito, `1mb` actual es techo, no piso).

## Dominio: Contenido (RN-CON)
- **RN-CON-01**: 52 lecciones / 208 ejercicios como invariante MVP (15+15+12+10 por nivel).
- **RN-CON-02**: Cada ejercicio funciona offline por reglas (`validator.js`) salvo que esté marcado "requiere ejecución".
- **RN-CON-03**: IDs de lección/ejercicio estables — cambiar un id rompe progreso local existente.

## Dominio: Progreso (RN-PRO)
- **RN-PRO-01**: En v1.0 el progreso es local-only y se comunica como tal ("se guarda en este navegador").
- **RN-PRO-02**: El certificado v1.0 (si se muestra) debe decir que es local/de finalización sin verificación servidor.
- **RN-PRO-03**: Con login futuro, el servidor es fuente de verdad; el localStorage pasa a ser caché.

## Dominio: Costo (RN-COS)
- **RN-COS-01**: MVP debe sostenerse en free-tier (Pages + validación local = $0).
- **RN-COS-02**: Toda alternativa de ejecución Java (Piston, Judge0, sandbox propio, WASM) se evalúa primero por costo y mantenimiento, después por fidelidad de compilación.

## Dominio: Excepciones globales
- Seguridad > costo > mantenibilidad > velocidad. Ninguna optimización de entrega justifica violar RN-SEG.
- Lo que el README diga y el código contradiga, manda el código (README se corrige, no al revés). Inconsistencias en `10_preguntas_abiertas.md`.
