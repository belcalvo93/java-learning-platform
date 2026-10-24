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

### DD-05 — Proveedor Auth y DB post-MVP: Firebase Auth + Cloud Firestore en Plan Spark (tomada por defecto, revertible)
**Decisión**: adoptar **Firebase Authentication + Cloud Firestore (Plan Spark — \$0/mes)** para el login opcional y la persistencia del progreso por usuario en `C-13`, marcada como **"tomada por defecto, revertible"** (ver [`docs/auth-db-decision.md`](../docs/auth-db-decision.md)).
**Contexto**: el sitio opera en GitHub Pages (`https://java.belencalvo.me`) sin backend propio (`RN-SEG-02`) y con requisito de costo cero (`RN-COS-01`). Se evaluaron Firebase (Spark), Supabase (Free) y Appwrite Cloud (Free).
**Alternativas consideradas**:
- **Supabase (Auth + PostgreSQL Free)**: descartada por defecto porque **pausa automáticamente el proyecto tras 7 días sin consultas a la base de datos**, dejando caído el login y el guardado de progreso entre cursadas hasta que alguien lo reactive manualmente en el dashboard (o mantenga un cron externo).
- **Appwrite Cloud (Free)**: descartada por menor madurez de ecosistema y límites de suspensión en inactividad prolongada.
**Justificación**:
1. **Cero pausas por inactividad**: Firebase Spark permanece activo 24/7 sin apagarse tras semanas sin tráfico.
2. **Costo \$0 garantizado sin tarjeta de crédito**: incluye 50.000 MAU, 1 GiB de almacenamiento, 50.000 lecturas/día y 20.000 escrituras/día; al guardar todo el progreso de un usuario en un único documento `users/{uid}`, cada inicio de sesión consume 1 lectura y cada avance completado consume 1 escritura.
3. **Cero servidor intermedio y alineación con el repo**: se protege directamente con Firestore Security Rules (`request.auth.uid == userId`), restricción de dominios autorizados (`java.belencalvo.me`) y aprovecha el diseño base previsto en `firebase-config.js` / `auth.js`.
**Reversibilidad (mitigación de lock-in)**: toda la lógica de negocio y el algoritmo de fusión (`mergeProgress`) se implementan en un módulo puro (`progress-sync.js`) desacoplado detrás de un adaptador de 4 métodos; si en el futuro se quisiera migrar a Supabase, solo se reemplaza el adaptador sin tocar la lógica de progreso ni la UI.
**Trade-offs aceptados**: base documental NoSQL con reglas declarativas propias de Firestore en lugar de SQL estándar.

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
