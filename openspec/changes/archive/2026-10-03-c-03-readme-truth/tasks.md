# Tasks — c-03-readme-truth

> Verificación MANUAL (cambio de texto, sin lógica nueva — regla
> "TDD o verificación"). Sin tests de lógica. Governance BAJO.
> Alcance atómico: solo `README.md`. Sin commit/push (solo artefactos
> + `README.md` en working tree). No tocar contenido de
> lecciones/ejercicios (52/208 intactos), historial git intacto.
> Tabla de trazabilidad (toda afirmación reescrita cita su fuente):
> validación por reglas → `validator.js` + `config.js:11` (`BACKEND_URL`
> vacío); progreso local → `script.js:7,16`,
> `script-enhanced.js:241,284`, RN-PRO-01; sin login/DB → IN-01,
> `01_vision_y_objetivos.md` §Fuera de alcance; Render suspendido →
> `backend/server.js:56,78`, RN-SEG-02, IN-02; IA desactivada →
> `config.js:15-17` (`AI_ENABLED=false`); invariantes → `index.html:55,63`
> (52/208) y niveles 15/15/12/10.

## 1. Características — quitar hechos falsos, poner estado real

- [x] 1.1 Reescribir `README.md:12` ("Compilador Java en Tiempo Real")
  → "Validación inmediata por reglas en el navegador, sin compilación
  ni ejecución real en v1.0"; verificar por inspección que la línea ya
  no promete ejecutar código y cita `validator.js`.
- [x] 1.2 Reescribir `README.md:14` ("Sistema de Progreso con Firebase")
  → "Progreso local — se guarda solo en este navegador, sin login ni
  base de datos en v1.0"; verificar que menciona `localStorage` y ya no
  nombra Firebase como operativo.
- [x] 1.3 Reescribir `README.md:16` ("Certificado de Finalización") →
  "Constancia local de finalización, no verificable (se pierde si
  cambias de navegador/dispositivo)" o retirarla si Belén lo pide en
  revisión (PA-06); verificar que no promete validez externa (RN-PRO-02).

## 2. Demo y despliegue — Pages como único despliegue, Render desactivado

- [x] 2.1 Reescribir `README.md:18-21` (Demo en Vivo): dejar solo
  frontend GitHub Pages con placeholder `TU-USUARIO` marcado como
  pendiente de la URL real (la fija C-07); eliminar la URL viva de
  backend y poner aviso "backend desactivado en v1.0 — suspendido hasta
  ejecución segura (RN-SEG-02), no requerido"; verificar que no queda
  ninguna URL de Render presentada como viva.
- [x] 2.2 Reescribir `README.md:101-118` (Despliegue): Pages como única
  vía MVP; sección Render sustituida por bloque "desactivado" sin pasos
  de activación (sin Root Directory/Build/Start Command, sin "actualiza
  `config.js` con la URL"); verificar que no queda ningún paso que
  reactive backend.
- [x] 2.3 Reescribir `README.md:53-63` (Tecnologías): Firebase rotulado
  "ejemplo no operativo en v1.0"; JDK/Node rotulados "solo desarrollo
  del executor futuro, no necesarios para usar la plataforma"; verificar
  que ninguna tecnología inoperativa figura como operativa.

## 3. Instalación, placeholders y cierre con revisión de Belén

- [x] 3.1 Reescribir `README.md:65-99` (Instalación Local): uso =
  servidor estático (`python -m http.server 8000`); Node/JDK solo para
  desarrollo del executor futuro; eliminar `cd backend`, `npm install`,
  `cp .env.example .env` y el paso "agrega tu API key de Gemini";
  verificar que ningún paso pide secretos ni arranca el backend.
- [x] 3.2 Placeholders y autoría: conservar `TU-USUARIO`,
  `tu-email@ejemplo.com` con nota visible de pendiente (Belén
  actualiza sus datos ella misma — no inventar ninguno) y autoría de
  Belén intacta; secciones de contenido del curso (15/15/12/10, 208
  ejercicios), estructura, contribución y licencia sin tocar; verificar
  con `git diff --stat` que solo cambió `README.md` y que los conteos
  52/208 siguen exactos.
- [ ] 3.3 Cierre con checklist README-vs-código: recorrer cada línea
  reescrita y confirmar su fuente en la tabla de trazabilidad de este
  archivo; revisión y visto bueno de Belén (incluye decisión PA-06 del
  certificado); `git status` muestra solo `README.md` (+ artefactos del
  change); historial git intacto.

> Explícito NO-alcance (no hacer en este change): cambios de código;
> config de Pages/Render (C-07); trabajo Firebase/auth visible o no
> (C-04/C-08); reescribir historial git.
