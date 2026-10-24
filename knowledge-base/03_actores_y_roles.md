# Actores y Roles

## Actores del sistema

| Actor | Descripción | Cómo interactúa |
|-------|-------------|-----------------|
| **Visitante (Estudiante sin cuenta — modo por defecto)** | Persona hispanohablante que aprende Java sin registrarse | Navega las 52 lecciones y 4 guías, resuelve los 208 ejercicios y rinde evaluaciones guardando todo su avance en `localStorage` con el aviso `"Tu progreso se guarda solo en este navegador"` (`RN-PRO-01`) |
| **Estudiante con cuenta (`student`)** | Estudiante que opta por iniciar sesión para sincronizar su progreso entre dispositivos | Mantiene todas las capacidades del visitante + sincronización automática en su documento `users/{uid}` (fusión sin pérdida con `localStorage`, `RN-PRO-03`), progreso persistido para desbloqueo de niveles (`C-15`/`C-19`), constancia de finalización asociada a su cuenta y derecho de supresión de cuenta/datos (Ley 25.326) |
| **Administradora (`admin` — Belén)** | Dueña del contenido, repositorio y proyecto Firebase | Gestiona el contenido del curso vía Git (confirmado por `SU-02`), administra reglas en consola Firebase y, con sesión `admin` (`admins/{uid}`), accede a todas las lecciones sin bloqueo de nivel y lee métricas agregadas sin PII (`/stats/global` en `C-09`/`C-14`) |

> **Principio rector**: el login es **100 % opcional**. Ninguna lección del nivel inicial ni el uso general de la plataforma exige crear cuenta para empezar a aprender.

## RBAC — Matriz de permisos (actualizada en C-08 para implementar en C-13/C-14)

| Rol | Recurso | Permisos en modo sin cuenta (por defecto) | Permisos con cuenta (`C-13` / `C-14` / `C-19`) |
|-----|---------|-------------------------------------------|-----------------------------------------------|
| **Visitante (`anonymous`)** | Lecciones, ejercicios, guías, `localStorage` | Lectura total del curso y guías + validación local (`validator.js`) + escritura en su propio `localStorage` | Sin acceso a Firestore (`request.auth == null`) |
| **Estudiante (`student`)** | Documento propio `/users/{uid}` | N/A | **Lectura, escritura validada y borrado únicamente de su propio `/users/{uid}`** (`request.auth.uid == uid`). **Denegado** leer o listar `/users/{otroUid}`, **denegado** escribir `role`/`isAdmin`, **denegado** leer `/stats/*` |
| **Administradora (`admin`)** | `/admins/{uid}`, `/stats/global`, curso completo | Escritura de contenido vía Git (`SU-02`) | Verificación de su propio `/admins/{uid}` (`allow get: if isOwner(uid); allow write: if false`), **lectura de métricas agregadas `/stats/global`** (sin PII; no lee `/users/{otroUid}` desde el cliente) y `LessonNav.isLevelAvailable(level) === true` para todos los niveles |

## Seguridad de asignación de roles
1. **Imposibilidad de auto-otorgarse rol `admin`**: las reglas de Firestore (`firestore.rules` en [`docs/auth-db-decision.md`](../docs/auth-db-decision.md#42-reglas-de-seguridad-de-firestore-firestorerules-de-referencia-para-c-13)) rechazan cualquier escritura en `/users/{uid}` que incluya las claves `role` o `isAdmin`, y bloquean toda escritura desde el cliente en `/admins/{uid}` (`allow write: if false`).
2. **Privacidad por diseño (Ley 25.326)**: ni otros estudiantes ni el panel web de administración pueden listar o leer documentos individuales `/users/{userId}`; el rol `admin` solo consulta contadores agregados en `/stats/global`.

## Rutas y acceso público
- `index.html`, `guia-principiante.html`, `guia-intermedio.html`, `guia-avanzado.html`, `guia-experto.html` y todos los assets JS/CSS siguen siendo **100 % públicos y estáticos en GitHub Pages (`https://java.belencalvo.me`)**.
- Cuando se active el bloqueo por nivel (`C-15`/`C-19`), la disponibilidad de niveles superiores se resolverá mediante la función única [`LessonNav.isLevelAvailable(level)`](../lesson-nav.js) leyendo el estado de evaluaciones aprobadas (sincronizado en cuenta cuando hay sesión iniciada).
