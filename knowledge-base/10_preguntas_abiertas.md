# Preguntas Abiertas

## Inconsistencias detectadas (resueltas en MVP)
### IN-01 — RESUELTA (en C-03 / C-04) — README prometía Firebase; hoy documenta estado real y C-08 diseña su incorporación opcional
**Resolución**: `README.md` y la UI reflejan que en v1.0 el progreso vive en `localStorage` (`"Tu progreso se guarda solo en este navegador"`), y `C-08` dejó diseñado el login opcional en [`docs/auth-db-decision.md`](../docs/auth-db-decision.md) para implementarse en `C-13`.

### IN-02 — RESUELTA (en C-03 / C-05 / C-06) — Backend Render suspendido
**Resolución**: `C-05` cerró `DD-02` manteniendo producción 100 % por reglas en GitHub Pages (`95,2 % rules-only-ok` tras `C-18`), y `C-06` endureció `backend/server.js` en el repositorio con tests TDD pasando sin desplegarlo ni reactivar Render (`RN-SEG-02`).

### IN-03 — RESUELTA (en C-02) — Key Gemini removida del código actual
**Resolución**: clave removida de `config.js` y llamadas de IA desactivadas en el cliente (`RN-SEG-03`).

---

## Estado de las preguntas abiertas del proyecto

| Prioridad | Código | Estado | Resolución / Referencia |
|-----------|--------|--------|-------------------------|
| Alta | **PA-01** | **RESUELTA (`C-01` + `C-18`)** | Matriz en [`docs/validator-audit.md`](../docs/validator-audit.md): tras el validador estructural por tokens de `C-18`, `198/208` (`95,2 %`) son `rules-only-ok`, `9` (`4,3 %`, ids `33–40` y `148`) son `needs-real-execution` y `1` (`0,5 %`, id `208`) es excepción documentada de comentarios. |
| Alta | **PA-02** | **RESUELTA (`C-05` + `C-06`)** | Firmada por Belén en [`docs/execution-options.md`](../docs/execution-options.md): producción sigue 100 % con reglas offline a costo \$0; `backend/server.js` quedó endurecido en el repo con tests TDD (`C-06`) y permanece **sin desplegar** hasta contar con contenedor que aísle red y sistema de archivos. |
| Alta | **PA-03** | **RESUELTA (`C-02`)** | No reescribir historial git; la key Gemini revocada fue eliminada de `config.js`. |
| Media | **PA-04** | **RESUELTA EN DISEÑO (`C-08`, `DD-05`)** | Proveedor recomendado: **Firebase Auth + Cloud Firestore (Plan Spark, \$0/mes)**, registrado como `DD-05` (*"tomada por defecto, revertible"*) en [`09_decisiones_y_supuestos.md`](09_decisiones_y_supuestos.md) y detallado con modelo `users/{uid}`, `firestore.rules`, aviso Ley 25.326 y algoritmo `mergeProgress` en [`docs/auth-db-decision.md`](../docs/auth-db-decision.md). |
| Baja | **PA-06** | **RESUELTA EN DISEÑO (`C-03` + `C-08`)** | Mientras el estudiante no inicie sesión, la constancia local indica explícitamente que es local/no verificable (`RN-PRO-02`). Con cuenta (`C-13`), los metadatos de emisión se guardan en `users/{uid}.certificate` al aprobar las 4 evaluaciones. |
| Media | **PA-05** | **Abierta para `C-09`** | Alcance de métricas agregadas y si la edición vía Git (`SU-02`) basta sin CRUD de contenido en base de datos. |
| Media | **PA-07** | **Diferida post-MVP** | Reactivación futura de IA servidor-only (actualmente fuera de alcance: la plataforma opera sin IA en el frontend). |

---

## Decisiones que le corresponden exclusivamente a Belén (con recomendación)

Para avanzar hacia `C-09`, `C-13`, `C-15` y `C-19`, estas son las **únicas decisiones de producto y cuenta** que requieren definición o acción de la autora:

1. **Confirmar (o revertir) el proveedor `DD-05` antes de ejecutar `C-13` y crear el proyecto en la consola**:
   - **Qué decidir**: confirmar si en `C-13` usamos **Firebase Auth + Cloud Firestore (Plan Spark)** o si preferís cambiar a Supabase.
   - **Recomendación**: **Mantener Firebase (Plan Spark)**. No pide tarjeta de crédito, nunca pausa la base de datos tras 7 días de inactividad (a diferencia de Supabase Free) y requiere que vos crees el proyecto en `console.firebase.google.com`, actives *Email/Password* + *Google*, agregues `java.belencalvo.me` en *Authorized domains* y nos pases el objeto público `firebaseConfig` cuando iniciemos `C-13`.

2. **Métodos de inicio de sesión habilitados en `C-13` (Email/Contraseña + Google vs solo uno)**:
   - **Qué decidir**: si ofrecés ambos métodos (*Email/Contraseña* y *Continuar con Google*) o solo uno de ellos.
   - **Recomendación**: **Habilitar ambos (Email/Contraseña + Google)**. Google resuelve el login y la verificación de correo en un clic para la mayoría, y Email/Contraseña garantiza acceso a estudiantes que no usan cuenta de Google.

3. **Regla de bloqueo de niveles para `C-15` y `C-19` (`LessonNav.isLevelAvailable`)**:
   - **Qué decidir**:
     - (a) Si el bloqueo de los niveles *Intermedio*, *Avanzado* y *Experto* se exige a **todos** los usuarios (y para desbloquear o saltear un nivel deben aprobar el examen del nivel anterior con sesión iniciada para que no se pierda), o si sin cuenta todo sigue abierto y el bloqueo aplica con cuenta;
     - (b) Si dentro de un nivel ya desbloqueado las lecciones se pueden recorrer en orden libre o secuencial;
     - (c) Nota mínima de aprobación del examen de nivel (actualmente `70 %` en `data.js`) y si los reintentos son inmediatos e ilimitados.
   - **Recomendación**: **(a) Exigir aprobar el examen del nivel anterior (`>= 70 %`, reintentos libres) para desbloquear el nivel siguiente (permitiendo rendir el examen directamente para saltear un nivel si la persona ya sabe el tema), (b) mantener orden libre de lecciones dentro de cada nivel desbloqueado, y (c) mostrar los niveles/ejercicios aún no desbloqueados con ícono de candado visible en lugar de ocultarlos**, para que el estudiante vea todo el temario que ofrece la plataforma.

4. **Alcance de administración en `C-09` / `C-14` (`PA-05`)**:
   - **Qué decidir**: si para el contenido de lecciones y ejercicios seguís editando por Git (`SU-02`) y el panel `admin` se dedica únicamente a **ver métricas agregadas sin datos personales** (`/stats/global`: cantidad de alumnos que completaron cada nivel/lección y dónde abandonan), o si querés además un editor de lecciones en la web.
   - **Recomendación**: **Mantener el contenido en Git (`data.js` / `script.js`) y dedicar el panel admin solo a métricas agregadas (`/stats/global`)**. Editar contenido en Git conserva el costo \$0, las 2.783 pruebas automáticas del validador y evita duplicar las 52 lecciones en Firestore (lo que multiplicaría por 52 las lecturas diarias de la cuota gratuita).
