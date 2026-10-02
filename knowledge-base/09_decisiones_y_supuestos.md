# Decisiones y Supuestos

## Decisiones documentadas
### DD-01 — Backend Render suspendido, no reactivar tal cual
**Decisión**: mantener backend fuera de línea hasta rediseño seguro.
**Contexto**: `backend/server.js:38` toma `className` del body sin validar; `server.js:56` lo usa en path y `server.js:60,78` lo interpola en `exec()` con shell → inyección de comandos + path traversal.
**Alternativas consideradas**: parche mínimo allowlist y reactivar; mantener suspendido y validar por reglas; migrar a sandbox externo (Piston/Judge0) o WASM.
**Justificación**: el parche mínimo no alcanza (falta aislamiento, rate-limit, auth, auditoría). Se evalúa alternativa antes de reactivar.
**Trade-offs aceptados**: sin compilación real en MVP; ejercicios "runtime" degradan a reglas.

### DD-02 — MVP static-first con validación por reglas
**Decisión**: el sitio publicado debe funcionar 100% sin backend.
**Contexto**: costo cero exigido + backend inseguro + 208 ejercicios ya validables localmente.
**Alternativas consideradas**: exigir backend para todo; híbrido por ejercicio.
**Justificación**: desbloquea publicación inmediata y segura; el backend vuelve solo como mejora.
**Trade-offs aceptados**: fidelidad de compilación reducida en casos runtime puros.

### DD-03 — Secretos fuera del código
**Decisión**: remover `GEMINI_API_KEY` de `config.js:6` (revocada pero presente) y marcar Firebase como ejemplo no operativo.
**Contexto**: key expuesta en repo; README promete Firebase que no existe.
**Alternativas consideradas**: mover a env, usar placeholders. Descartado: git-history rewrite (PA-03).
**Justificación**: revocar y remover del código actual es suficiente; la key ya está revocada y esas funciones hoy no andan. Desactivar llamadas a Gemini desde el navegador hasta diseño servidor-only.
**Trade-offs aceptados**: IA deshabilitada hasta diseño servidor-only.

### DD-04 — Login/DB después del MVP
**Decisión**: progreso local-only en v1.0 con aviso explícito; auth persistida post-MVP.
**Contexto**: lo urgente es seguridad + publicación; auth suma superficie y costo.
**Justificación**: orden pedido por Belén (limpieza → ejecución segura → publicar → login).
**Trade-offs aceptados**: progreso por navegador, sin cross-device ni certificado verificable.

## Supuestos inferidos
### SU-01 — validator.js cubre los 208 ejercicios (SIN VERIFICAR)
**Supuesto**: la validación por reglas podría ser suficiente para el MVP — NO verificado.
**Origen**: código existente + objetivo "funcionando sin backend".
**Riesgo si es falso**: subset requiere ejecución real o es fácilmente engañable → recorte o ejecución segura mínima.
**Cómo validar**: auditar cuántos ejercicios se validan solo por reglas, cuáles necesitan compilación real y qué tan fácil es engañar la validación (primera tarea del roadmap).

### SU-02 — Admin gestiona contenido vía git (confirmado por Belén)
**Supuesto**: Belén edita repo directamente, sin panel en MVP. Panel de administración queda para el futuro.
**Origen**: sin backend ni DB en v1.0 + confirmación explícita.
**Riesgo si es falso**: expectativa de panel temprano → scope creep.
**Cómo validar**: confirmado — CRUD git aceptable hasta post-MVP.

### SU-03 — Free-tier alcanza
**Supuesto**: Pages + validación local sostienen piloto y apertura inicial.
**Origen**: criterio costo mínimo.
**Riesgo si es falso**: ejecución segura exige servicio pago → replantear alcance runtime.
**Cómo validar**: estimar tráfico y cotizar Piston/Judge0/self-host antes de DD-02 final.
