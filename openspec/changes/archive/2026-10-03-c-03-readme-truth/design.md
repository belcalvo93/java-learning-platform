# Design — c-03-readme-truth

## Context

Ver propuesta (`proposal.md` — Why). Estado real relevado en inspección
solo-lectura (no se modificó nada):

- `README.md:12` promete "Compilador Java en Tiempo Real — Ejecuta
  código directamente en el navegador". Realidad: `config.js:11`
  `BACKEND_URL = ''` (sin default a Render, post-C-02); la validación
  viva es por reglas offline (`validator.js`); backend suspendido por
  vuln `backend/server.js:56,78` (IN-02, RN-SEG-02).
- `README.md:14` promete "Sistema de Progreso — Guarda tu avance con
  Firebase". Realidad: progreso en `localStorage`
  (`script.js:7,16`, `script-enhanced.js:241,284`); `firebase-config.js`
  / `auth.js` con claves de ejemplo no operativas; v1.0 sin login ni DB
  (IN-01, RN-PRO-01, `04_modelo_de_datos.md` §ProgresoLocal).
- `README.md:16` promete "Certificado de Finalización" como hecho.
  Realidad: RN-PRO-02 exige rotularlo local/sin verificación; PA-06
  (Baja) deja a Belén decidir mostrarlo como "no verificable" o
  esconderlo — el README no puede prometerlo sin calificativo.
- `README.md:20-21` demo con placeholders `TU-USUARIO` + backend vivo
  `javamaster-backend.onrender.com`. Realidad: URL de backend muerta
  (suspendido); único despliegue MVP = GitHub Pages (DD-02, C-07).
- `README.md:57` lista "Firebase (Autenticación y Base de Datos)" como
  tecnología operativa; `README.md:62` "Java JDK 21 (para compilación)"
  como requisito de uso. Realidad: Firebase ejemplo no operativo;
  JDK solo para desarrollo del executor futuro.
- `README.md:80-87` instalación exige backend (`npm install`, `.env`,
  "agrega tu API key de Gemini"). Realidad post-C-02: cero secretos en
  código, IA desactivada navegador; usar la plataforma = servidor
  estático.
- Invariantes verificados contra el sitio: `index.html:55,63`
  (52 lecciones, 208 ejercicios), niveles 15/15/12/10
  (`index.html:81,101,121,143`) — coinciden con `README.md:10-11,25-51`
  y se conservan tal cual.

## Goals / Non-Goals

**Goals:**

- Cada afirmación del README trazable a código o KB (tabla de
  trazabilidad en tasks).
- Ninguna URL muerta presentada como viva; ningún placeholder
  inventado (se marcan, los completa Belén/C-07).
- Copy honesto v1.0 alineado a `01_vision_y_objetivos.md` §Alcance /
  §Fuera de alcance y RN-PRO-01 ("se guarda solo en este navegador").

**Non-Goals:**

- Cambios de código (aunque `index.html:44-51,303-349` aún muestra
  botones login y SDK Firebase: eso lo retira C-04, no este change).
- Fijar la URL real de Pages (la sustitución `TU-USUARIO` → URL real es
  de C-07; aquí solo se marca el placeholder como pendiente).
- Resolver PA-06 (certificado mostrar vs esconder): el README adopta el
  mínimo honesto (local/no-verificable) y Belén decide en revisión.
- Diseño auth/DB futuro (C-08), panel admin (C-09), ejecución segura
  (C-05/C-06).

## Decisions

1. **Reescritura por afirmación, no README nuevo.**
   Se corrigen las líneas falsas una por una (tabla en tasks) y se deja
   el resto (contenido del curso, estructura, contribución, licencia).
   Alternativa descartada: reescribir el README completo — mezcla
   objetivos y arriesga tocar los invariantes 52/208.
   - L12 compilador → "Validación inmediata por reglas en el navegador
     (`validator.js`); sin compilación ni ejecución real en v1.0".
   - L14 progreso Firebase → "Progreso local — se guarda solo en este
     navegador (`localStorage`); sin login ni base de datos en v1.0".
   - L16 certificado → "Constancia local de finalización, no
     verificable" (mínimo RN-PRO-02; Belén confirma o pide esconder).
   - L20-21 demo → solo frontend Pages (placeholder marcado pendiente);
     backend reemplazado por aviso "desactivado en v1.0 — suspendido
     hasta ejecución segura (RN-SEG-02), no requerido".
   - L53-63 tecnologías → Firebase como "ejemplo no operativo";
     JDK/Node como "solo desarrollo del executor futuro".
   - L65-99 instalación → uso con servidor estático; sin `.env`, sin
     Gemini, sin `npm start` del backend.

2. **Sección Render pasa a "desactivado", sin pasos de activación.**
   Se elimina la guía paso a paso (`README.md:109-116`) y queda un
   bloque corto: suspendido por seguridad, reactivación prohibida hasta
   tests de ejecución segura (RN-SEG-02), rediseño en C-05/C-06.
   Alternativa descartada: borrar toda mención al backend — el lector
   merece saber por qué no hay ejecución real y que es decisión de
   seguridad, no un olvido.

3. **Placeholders marcados, nunca inventados.**
   `TU-USUARIO`, `tu-email@ejemplo.com` se conservan con nota visible
   "pendiente: Belén actualiza / C-07 fija la URL real". Alternativa
   descartada: adivinar URLs o emails — violaría la regla de no inventar
   datos de contacto.

4. **Español en todo el README reescrito.**
   El repo y la audiencia son hispanohablantes; el change mantiene
   español (los términos de código — `localStorage`, `validator.js` —
   quedan en inglés como nombres propios).

5. **Verificación manual con checklist trazable, sin tests.**
   Es cambio de texto (regla "TDD o verificación"): cada línea
   reescrita cita su fuente (archivo:línea o sección KB) y Belén firma
   la revisión. No se agregan tests porque no hay lógica nueva que
   fijar; el invariante 52/208 se verifica por inspección (no se toca
   esa sección).

## Risks / Trade-offs

- [Riesgo] El README corregido menciona botones login/Firebase que aún
  existen en `index.html` → el lector ve discrepancia temporal.
  Mitigación: el README lo anticipa ("UI en transición, login sin
  efecto real hasta C-04/C-08"); C-04 retira lo visible.
- [Riesgo] PA-06 sin resolver: si Belén prefiere esconder el
  certificado en vez de rotularlo, hay que ajustar una línea en
  revisión. Mitigación: cambio de una línea, dentro del mismo commit
  del change.
- [Trade-off] Placeholders visibles (`TU-USUARIO`) hasta C-07.
  Aceptado: un placeholder marcado como pendiente es honesto; una URL
  inventada sería peor.
- [Riesgo] Tocar de más (contenido del curso, estructura).
  Mitigación: tasks limita el diff a las secciones listadas; el cierre
  verifica con `git diff --stat` que solo cambió `README.md`.

## Migration Plan

Sin despliegue ni migración: cambia solo `README.md` (estático).
Rollback = revertir el commit único del change. Tras aplicar: el README
describe la v1.0 real y C-04/C-07 pueden apoyarse en él.

## Open Questions

Ninguna que bloquee: la única decisión abierta (PA-06: certificado
"no verificable" vs escondido) se resuelve en la revisión de Belén sin
cambiar el alcance ni las tasks.
