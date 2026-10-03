# Tasks — c-07-publish-frontend

> Verificación MANUAL (CONFIG/PUBLISH: configuración + publicación, sin
> lógica nueva — regla "TDD o verificación"). Sin tests de lógica. Smoke
> script opcional permitido pero no exigido. Governance BAJO. Alcance
> atómico: Settings > Pages (externo) + `README.md` (URL real). Sin
> commit/push (solo artefactos + `README.md` en working tree). No tocar
> contenido de lecciones/ejercicios (52/208 intactos), `validator.js`,
> backend ni historial git.

## 0. Dominio propio java.belencalvo.me (Belén + agente)

- [x] 0.1 Registro CNAME `java` en Namecheap apuntando a GitHub Pages — hecho por Belén (según su confirmación; el agente no lo verifica).
- [x] 0.2 Archivo `CNAME` en la raíz del repo con una sola línea `java.belencalvo.me` — creado por el agente y verificado (contenido exacto, una línea).
- [ ] 0.3 Tras el push (lo hace Belén a mano): en ESTE repo, Settings > Pages > Custom domain = `java.belencalvo.me`, esperar el chequeo de DNS y activar Enforce HTTPS. NO tocar el repo `belcalvo93.github.io`: el apex `belencalvo.me` sirve otro proyecto en otro servidor.

## 1. Diagnóstico y fuente Pages (lo hace Belén, el agente registra)

- [ ] 1.1 Abrir Settings > Pages del repo y registrar qué fuente está activa
  y por qué dejó de verse el sitio (rama distinta de `main`, carpeta no
  raíz, Pages desactivado, otro); verificar que queda en rama `main`,
  carpeta `/ (root)` y guardar captura o nota del estado final.
- [ ] 1.2 Confirmar rama activa `main` y remoto `origin
  https://github.com/belcalvo93/java-learning-platform.git` con `git
  branch --show-current` + `git remote -v`; verificar que la fuente Pages
  coincide con `main` y que no hay otra rama publicada.

## 2. URL pública REAL en README (Belén confirma, el agente edita)

- [ ] 2.1 URL fijada por Belén: `https://java.belencalvo.me/` (subdominio propio; el apex queda intacto en otro servidor, NO deducir otra URL). Abrir en incógnito tras el paso 0.3 antes de darla por válida.
- [x] 2.2 Reemplazar en `README.md` con la URL de 2.1: línea "Demo en preparación" (`README.md:20`) → enlace vivo; `TU-USUARIO` → `belcalvo93` en clone (`README.md:76`), Pages (`README.md:106`) e Issues (`README.md:170`); quitar las notas internas pendientes ya resueltas; verificar con `git grep -n "TU-USUARIO\|Demo en preparaci" -- README.md index.html` que no queda ningún marcador ni nota pendiente salvo datos de contacto (los actualiza Belén ella misma).
Hecho 2026-10-03: demo → `https://java.belencalvo.me/`; clone/issues → `belcalvo93/java-learning-platform` (nombre real del repo, no `javamaster-platform`); paso 4 de Pages → dominio propio; notas internas resueltas eliminadas; grep sin marcadores (solo email pendiente de Belén).
- [x] 2.3 Confirmar `BACKEND_URL` ausente o vacío en `config.js`
(`BACKEND_URL = ''`, `executeEndpoint = ''`) y `AI_ENABLED=false`;
verificar por inspección que ningún fetch a Gemini/Render queda
alcanzable desde la UI (heredado de C-02, solo re-confirmar).
Verificado 2026-10-03 por inspección + grep (sin secretos reales; solo `geminiApiKey: ''` y la palabra "secretos" en un comentario).

## 3. Barrido, gates y checklist firmada

- [ ] 3.1 Barrido de contenido: abrir las 52 lecciones (15/15/12/10) y las
  4 guías (`guia-*.html`) en móvil + desktop desde la URL publicada;
  verificar 52/52 accesibles y 208/208 ejercicios validables con cero
  errores JS en consola en `index.html` + cada guía.
- [ ] 3.2 Gates de secretos y honestidad: `git grep -in
  "apikey\|secret\|gemini"` sin secretos reales; Firebase ejemplo ausente o
  con banner no-operativo; copy visible "se guarda solo en este navegador"
  y "ejecución no disponible — validando por reglas" donde aplique;
  verificar cada gate con su comando/captura y anotar el resultado.
- [x] 3.3 Decisión PA-06: MANTENER la "Constancia local de finalización — no verificable" (`README.md:16`) — decidido por Belén 2026-10-03; verificado que no promete validez externa (RN-PRO-02).

## 4. Rollback si algo sale mal

- [ ] 4.1 Despublicar: en este repo, Settings > Pages > quitar el custom domain (o desactivar la fuente) para bajar el sitio. El apex `belencalvo.me` no se toca en ningún caso.
- [ ] 4.2 Revertir el commit del push con `git revert` (nuevo commit, sin reescribir historial): salen el `CNAME` y la URL del repo.
- [ ] 3.4 Cierre con checklist de publicación firmada: URLs (2.1),
  conteos 52/52 + 208/208 (3.1), consolas limpias móvil + desktop (3.1),
  grep limpio (3.2), copy + PA-06 (3.2, 3.3), recarga dura (Ctrl+F5) contra
  el deploy vigente (fecha/hora de Pages); revisión y visto bueno de
  Belén; `git status` muestra solo `README.md` (+ artefactos del change);
  historial git intacto.

> Explícito NO-alcance (no hacer en este change): reactivar backend o
> trabajo de executor (C-05/C-06); cambios en `validator.js` (cerrado
> C-10); rediseño (C-12); login/DB (C-08+); reescribir historial git;
> añadir CI/Actions de deploy.
