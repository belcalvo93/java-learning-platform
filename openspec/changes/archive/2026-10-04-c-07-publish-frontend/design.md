# Design — c-07-publish-frontend

## Context

Ver `proposal.md` (Why) para la motivación. Estado actual verificado
solo-lectura en este change:

- Rama activa `main`, remoto `origin
  https://github.com/belcalvo93/java-learning-platform.git` (dueña: Belén;
  solo ella opera Settings > Pages).
- `README.md:20` dice "Demo en preparación"; marcadores `TU-USUARIO` solo
  en `README.md:70-76,104-107,170` (+ notas internas `README.md:70,107,169`);
  `index.html` no contiene `TU-USUARIO` (grep verificado).
- `config.js`: `BACKEND_URL = ''`, `AI_ENABLED=false`, `geminiApiKey=''`
  (limpio post-C-02; nada que cambiar).
- Comportamiento publicable ya construido: degradación con mensaje exacto
  "ejecución no disponible — validando por reglas" + aviso "se guarda en
  este navegador" (spec `frontend-no-backend`, 6 reqs); reglas ids 3–8 y 168
  corregidas (spec `validator-rules`, 9 reqs). Este change no toca código.
- Incidente reportado: el sitio dejó de verse → el paso de diagnóstico en
  Settings > Pages es parte del alcance (puede ser fuente cambiada de rama,
  repo renombrado, o Pages desactivado).

## Goals / Non-Goals

**Goals:**

- Dejar Pages verificado en fuente `main` + `/ (root)` con el diagnóstico
  del incidente registrado (qué estaba mal, qué quedó).
- Fijar la URL pública REAL en `README.md` (demo + despliegue + issues) y
  eliminar "Demo en preparación".
- Firmar una checklist de publicación que certifique: 52/52 + 208/208,
  cero errores JS (index + 4 guías, móvil + desktop), secret-grep limpio,
  copy obligatorio visible, decisión PA-06 registrada.

**Non-Goals (diseño):**

- Ningún cambio de runtime, estilos o contenido (eso es C-10/C-11/C-12).
- Ningún automatismo de deploy (Actions, hooks): publicación = push a
  `main` + Pages; añadir CI queda para un change futuro si Belén lo pide.
- Ningún script de smoke obligatorio: se permite uno opcional, pero la
  verificación manual firmada es el gate (decisión abajo).

## Decisions

1. **URL real la confirma Belén, no se inventa en el proposal.**
   Por qué: el owner del repo y de Pages es ella; solo su Settings > Pages
   muestra la dirección efectiva (`https://<usuario>.github.io/<repo>/`).
   Alternativa descartada: deducir `belcalvo93.github.io/java-learning-platform`
   del remoto — plausible pero no verificada (repo renombrado o Pages con
   path distinto la romperían). Las tasks exigen pegar la URL vista en
   Pages, no derivada del remoto.

2. **Fuente Pages = rama `main`, carpeta `/ (root)`.**
   Por qué: es lo que documenta `README.md:103-106` (post-C-03) y la rama
   activa del repo es `main`. Alternativa descartada: `gh-pages` o
   `/docs` — exigirían mover archivos y romperían los links relativos
   actuales. El diagnóstico primero confirma qué fuente está activa y por
   qué dejó de verse; si ya está en `main`+root, se registra "sin cambios".

3. **Matriz de barrido manual 52/52 + 208/208 por navegación, no por
   script.** Por qué: el invariante ya lo cubre `tools/audit-validator.js`
   (C-01/C-10); lo que falta es evidencia humana de que cada lección abre y
   cada guía es legible en móvil + desktop sin errores de consola.
   Alternativa considerada: script de smoke (fetch de las 52 lecciones) —
   permitido como opcional en una task, pero no exigido: un fetch 200 no
   prueba render ni consola JS, y añadir tooling contradice el alcance
   atómico.

4. **Gates de secretos por `git grep`, sin herramientas nuevas.**
   Comandos exactos en tasks: `git grep -in "apikey\|secret\|gemini"` y
   revisión de `config.js` (`BACKEND_URL` vacío, `AI_ENABLED=false`).
   Por qué: es el mismo gate de C-02/C-03 (trazable, costo $0, sin
   dependencias). No se instala scanner de secretos (alcance atómico).

5. **PA-06 se cierra AQUÍ como keep-or-hide con firma de Belén.**
   Por qué: C-03 dejó la "Constancia local de finalización — no
   verificable" redactada pero la decisión final (mantener texto vs.
   esconder hasta login) pertenece al momento de publicar, cuando el texto
   se vuelve público. C-07 es ese momento. En ningún caso se promete
   validez externa (RN-PRO-02). La checklist exige la firma explícita.

6. **Sin tests de lógica; verificación = checklist firmada.**
   Por qué: cambio de configuración/publicación + 4 reemplazos de texto en
   `README.md` (regla "TDD o verificación": config/textos llevan
   verificación manual descrita). Precedente C-03 (mismo governance BAJO,
   mismas reglas).

## Risks / Trade-offs

- [Riesgo] Pages tarda minutos en publicar tras el push y la checklist
  puede firmarse contra una versión cacheada → Mitigación: la task de
  verificación final exige recarga dura (Ctrl+F5) + comprobar el commit
  visible (fecha/hora del deploy en Pages) antes de firmar.
- [Riesgo] Belén cambia el nombre del repo o el usuario y la URL fijada
  queda obsoleta → Mitigación: la task registra la URL junto a la fecha;
  si cambia, es un edit de 3 líneas de `README.md`, revertible.
- [Riesgo] El diagnóstico revela que Pages nunca estuvo activo (repo
  privado, plan, o settings) → Mitigación: la task 1 lo detecta primero y
  el change se pausa hasta que Belén lo habilite; nada se publica a medias.
- [Trade-off] Verificación manual (lenta, ~1–2 h de barrido) vs. script
  (rápido pero no ve consola/render) → se elige manual porque el criterio
  de éxito ("sin errores JS", legible en móvil) es visual por definición.

## Migration Plan

- Publicación: push a `main` (Belén) → Pages despliega. Rollback: revert
  del commit o republish del commit anterior desde Pages; `README.md`
  vuelve con `git checkout <commit> -- README.md`.
- Sin migración de datos: el progreso local de cada navegador no se ve
  afectado (IDs 52/208 intactos, RN-CON-03).

## Open Questions

Ninguna que cambie specs, enfoque o tasks. Único input diferido (no es
pregunta de diseño): la URL real, que Belén pega desde Settings > Pages
durante el apply (task 2.1).
