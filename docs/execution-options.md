# Evaluación de Alternativas de Ejecución Java y Decisión DD-02 Final (C-05)

> **Change**: `c-05-execution-alternatives`  
> **Cierra**: `PA-02` (`knowledge-base/10_preguntas_abiertas.md`) y `DD-02` final (`knowledge-base/09_decisiones_y_supuestos.md`)  
> **Reglas rectoras**: `RN-SEG-01`, `RN-SEG-02`, `RN-SEG-03`, `RN-SEG-04`, `RN-COS-01`, `RN-COS-02` (`Seguridad > costo > mantenibilidad > velocidad`)  
> **Entrada cuantitativa**: [`docs/validator-audit.md`](validator-audit.md) (`C-01` inicial y cierre estructural `C-18`)

---

## 1. Punto de partida y entrada cuantitativa (`C-01` → `C-18`)

### 1.1Por qué está suspendido el backend actual (`DD-01`)
El servidor original en [`backend/server.js`](../backend/server.js) fue suspendido en Render porque contiene vulnerabilidades críticas de ejecución remota de comandos (RCE) y *path traversal*:
1. **Sin validación de entrada (`server.js:38`)**: toma `className` directamente de `req.body`.
2. **Path traversal (`server.js:56`)**: construye `path.join(workDir, `${className}.java`)` sin validar que `className` sea un identificador Java simple.
3. **Inyección de comandos en shell (`server.js:60,78`)**: ejecuta `exec(\`javac "${javaFile}"\`)` y `exec(\`java -cp "${workDir}" ${className}\`)` invocando un shell del sistema operativo (`RN-SEG-01`).
4. **CORS abierto y sin límite de tasa (`server.js:12`)**: `app.use(cors())` permite orígenes arbitrarios (`*`) y carece de *rate-limiting* (`RN-SEG-04`).
5. **Limpieza asíncrona diferida (`server.js:100`)**: usa `setTimeout(..., 1000)` dentro de `finally` en lugar de limpieza garantizada inmediata.

### 1.2 Evolución de la cobertura por reglas: de `C-01` a `C-18`
En `CHANGES.md` se estableció que la matriz de `C-01` dimensiona cuántos de los 208 ejercicios requieren compilación/ejecución real y cuántos quedan cubiertos por el validador offline (`validator.js`):

| Métrica sobre los 208 ejercicios | Línea base `C-01` (subcadenas / regex) | Estado actual post-`C-18` (validador estructural por tokens) | Variación |
| --- | --- | --- | --- |
| **`rules-only-ok`** (acepta canónica + variantes y rechaza trampas) | **0** (`0,0 %`) | **198** (`95,2 %`) | **+198** |
| **`needs-real-execution`** (entrada interactiva / azar runtime) | **16** (`7,7 %`) | **9** (`4,3 %`) | **−7** |
| **`rules-cheatable`** (sonda tramposa aceptada falsamente) | **192** (`92,3 %`) | **1** (`0,5 %` — id `208`*) | **−191** |
| **Invariante 52 lecciones / 208 ejercicios** | PASA | PASA | Intacto |

*\*Nota sobre id `208` (`Test Coverage`, lección 52)*: es una excepción documentada en `docs/validator-audit.md` porque la consigna pide escribir únicamente comentarios, de modo que un comentario válido aprueba por diseño.

### 1.3 Qué son los 9 ejercicios `needs-real-execution` actuales (`4,3 %`)
Tras el validador estructural por tokens de `C-18`:
- **Ids `33, 34, 35, 36, 37, 38, 39, 40` (Lección 5 — `Entrada y Salida con Scanner`)**: leen datos desde `System.in` con `Scanner` (`nextInt()`, `nextLine()`, `nextDouble()`, validación `hasNextInt()`, bucles de lectura, `close()` y `try-with-resources`). Hoy `validator.js` valida estructuralmente que el alumno construya el `Scanner(System.in)`, invoque los métodos de lectura correspondientes y procese/imprima los datos, pero no abre un flujo `stdin` interactivo real.
- **Id `148` (Lección 35 — `Supplier Get`)**: usa `Supplier<Integer>` con generación aleatoria (`ThreadLocalRandom.current().nextInt(...)` / `Math.random()`). Hoy `validator.js` valida la estructura funcional del `Supplier` y su invocación `.get()`, aunque la salida numérica varía en cada corrida si se ejecuta realmente.
- **Detección de código muerto semántico (`if (false) { ... }`)**: el analizador de tokens de `C-18` ignora comentarios y literales engañosos, pero el análisis de alcanzabilidad de flujo de control o verificación de salida exacta por `stdout` requiere ejecución real.

---

## 2. Matriz comparativa de alternativas de ejecución Java

Se evalúan las 5 opciones requeridas en `CHANGES.md` bajo las 6 columnas exigidas, ordenando el análisis por **Seguridad > Costo > Mantenibilidad > Fidelidad de compilación** (`RN-COS-02`):

| Alternativa | 1. Costo mensual free-tier (y escalado) | 2. Mantenimiento | 3. Fidelidad compilación JDK 21 | 4. Superficie de ataque | 5. Latencia | 6. Qué subset de C-01 / C-18 cubre (sobre 208) |
| --- | --- | --- | --- | --- | --- | --- |
| **A. Solo reglas (`validator.js` estructural post-C-18)** *(Estado actual en GitHub Pages)* | **\$0 / mes** fijo e ilimitado en GitHub Pages ([GitHub Pages Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)). Sin servidores ni cuotas por ejecución. | **Nulo / Muy bajo**. Cero infraestructura, cero llaves o secretos, cero parches de SO o contenedores. | **Estructural por tokens (sin `javac`)**. Reconoce sintaxis de Java 21 usada en el curso (`record` id 96, `sealed` id 97, `pattern matching` id 98, `text blocks` id 99, `switch yield` id 100), pero no compila bytecode ni ejecuta `stdout`/`stdin`. | **Cero en servidor**. No existe backend expuesto; toda la validación corre en el motor JS del navegador de cada estudiante. | **Instantánea (`< 5 ms`)** y 100 % funcional offline. | **198/208 (`95,2 %`) en `rules-only-ok`** con **0,5 % engañable**. Los 9 `needs-real-execution` (`4,3 %`) son validados por estructura de tokens (aceptan la canónica y variantes válidas), sin `stdin` real ni consola `stdout`. |
| **B. Parche sandbox propio (`backend/server.js` con allowlist + `execFile` + timeout 5s + cap 10KB + cleanup)** | **\$0 / mes en local** o en **Render Free Web Service** (750 h/mes, **512 MB RAM**, **0,1 CPU**, *spin-down* tras 15 min inactivo; plan Starter sin *spin-down*: **\$7 / mes** — [Render Free Docs](https://render.com/docs/free), [Render Pricing](https://render.com/pricing)). | **Medio**. Requiere mantener Node/Express + imagen con JDK 21, vigilar consumo de RAM (512 MB se satura con ~2–4 procesos `javac`/`java` simultáneos) y actualizar dependencias. | **100 % JDK 21 real** (`javac` + `java` oficial). Compila y ejecuta los 208 ejercicios; para `Scanner` (ids 33–40) requiere pasar un fixture `stdin` al proceso hijo. | **Media-Alta si se expone públicamente en PaaS simple** (`execFile` + allowlist cierra la inyección en shell de `RN-SEG-01`, pero dentro del proceso Java el código del usuario comparte contenedor/entorno si no se aísla con `nsjail`/cgroups/red bloqueada). **Cero en producción si se mantiene sin desplegar (`C-06`)**. | **~400 ms – 1,5 s** en caliente; **~50 – 60 s de *cold start*** en Render Free tras 15 min sin tráfico. | **200/208 con ejecución real inmediata** (incluye id 148 y detección de errores reales de `javac`), y **208/208 (100 %)** agregando fixtures de `stdin` para los 8 ejercicios de `Scanner` (ids 33–40). |
| **C. Piston (`emkc.org` público vs Self-Hosted Docker)** | **API pública (`emkc.org`)**: **No disponible en free-tier abierto** (cerrada al público sin llave el **15/02/2026**; requiere token aprobado caso por caso — [Piston Repo Notice](https://github.com/engineer-man/piston)).<br>**Self-hosted**: **\$4,50 – \$6 / mes** mínimo en VPS Linux con Docker privilegiado (p. ej. [Hetzner Cloud](https://www.hetzner.com/cloud/) / [DigitalOcean Droplets](https://www.digitalocean.com/pricing/droplets)). | **Alto (self-hosted)**. Administrar VPS Linux, Docker, sandbox `isolate`, paquetes de runtime Java y proxy de seguridad/rate-limit. | **Alta (OpenJDK 15–21)** según paquete instalado en Piston. Soporta compilación real, `stdout`, `stderr` y `stdin`. | **Baja en ejecución** (usa `isolate` con namespaces/cgroups de Linux), pero exige un backend intermedio propio si se usa token para no violar `RN-SEG-03`. | **~300 – 900 ms** por request HTTP (sin *cold start* en VPS dedicado). | **208/208 (100 %)** configurando el paquete OpenJDK 21 y enviando fixtures `stdin` para los ids 33–40. |
| **D. Judge0 CE (RapidAPI Cloud vs Self-Hosted Docker)** | **RapidAPI Basic (Free)**: **\$0 / mes hasta 50 requests/día** (~$0,0017/extra; Plan Pro: **\$44,99 / mes** por 2.000 req/día — [Judge0 RapidAPI Pricing](https://rapidapi.com/judge0-official/api/judge0-ce/pricing)).<br>**Self-hosted**: **\$6 – \$12 / mes** en VPS (requiere ≥ 2 GB RAM para API + Worker `privileged` + Redis + Postgres — [Judge0 GitHub](https://github.com/judge0/judge0)). | **Alto**. En RapidAPI exige un proxy servidor para ocultar `X-RapidAPI-Key` (`RN-SEG-03`) y gestionar la cuota de 50 req/día; en self-hosted requiere mantener 4 contenedores y cgroups compatibles. | **Media-Alta**. Judge0 CE estándar provee OpenJDK 13/17 por defecto; soportar sintaxis de JDK 21 (ids 96–100) exige configurar una imagen Judge0 custom con JDK 21. | **Baja** (aislamiento por `isolate`), siempre que la API key nunca viaje al navegador (`RN-SEG-03`). | **~500 ms – 2 s** (envío + cola de ejecución). | **~203/208 con imagen estándar (JDK 17)**; **208/208** solo si se despliega imagen custom con JDK 21 + fixtures `stdin`. |
| **E. WASM / JVM en navegador (CheerpJ 3.0 / TeaVM / DoppioJVM)** | **\$0 / mes en Community** (uso personal/evaluación o educativo no comercial aprobado; uso general o self-hosting requiere licencia comercial anual — [CheerpJ Licensing](https://cheerpj.com/licensing/), [CheerpJ Docs](https://cheerpj.com/docs/overview)). | **Bajo en servidor, Medio en frontend**. Exige cargar runtime externo desde CDN de terceros (`cjrtnc.leaningtech.com`), chocando con la regla de frontend vanilla sin dependencias pesadas de terceros. | **Baja para JDK 21**. CheerpJ soporta **Java 8, 11 y 17** (no soporta constructos de Java 21 presentes en las lecciones 8, 19 y 23). TeaVM/Doppio no ofrecen `javac` JDK 21 completo en cliente. | **Cero en servidor** (se ejecuta en WebAssembly dentro del navegador del usuario); agrega dependencia de script/CDN externo. | **Alta en primera carga** (descarga de **~15 a 40 MB** de runtime OpenJDK/WASM, crítica en datos móviles); **~1 – 3 s** en corridas posteriores. | **~195–202 / 208** (no compila sintaxis exclusiva de JDK 21 y requiere virtualizar `System.in` en el navegador para `Scanner`). |

---

## 3. Supuestos de costo y análisis de viabilidad en Free-Tier (`SU-03`, `RN-COS-01`, `RN-COS-02`)

1. **Volumen estimado de uso**:
   - En escala piloto (`team`, 20–50 estudiantes activos) o apertura inicial, una sesión de práctica típica de un estudiante comprende entre 10 y 25 pulsaciones de `"Ejecutar y Validar"` (incluyendo intentos fallidos de sintaxis).
   - Con apenas **3 estudiantes practicando el mismo día** (~60 ejecuciones), la cuota gratuita de **Judge0 en RapidAPI (50 requests/día)** se agota por completo.
   - Con **Piston público (`emkc.org`)**, el acceso público sin token fue dado de baja el **15 de febrero de 2026**, por lo que no existe free-tier abierto consumible desde el frontend.
   - Además, tanto Piston (con token) como Judge0 (con `X-RapidAPI-Key`) **prohíben** ser llamados directamente desde el navegador en un sitio estático público porque expondrían la clave en el código cliente, violando `RN-SEG-03`. Ambos exigirían igualmente mantener un backend proxy propio.
2. **Límites físicos de Render Free para `javac` + `java`**:
   - Aunque Render ofrece 750 horas/mes gratuitas ([Render Free Limits](https://render.com/docs/free)), la instancia gratuita tiene **512 MB de RAM**, **0,1 CPU** y entra en *spin-down* tras **15 minutos de inactividad** (con ~50–60 segundos de demora al despertar).
   - Levantar la JVM (`javac` seguido de `java`) consume ~120–200 MB de RAM por proceso. Con 3 o 4 ejecuciones concurrentes en un aula o taller, una instancia de 512 MB sufre *Out-Of-Memory (OOM)* o timeouts de 5 segundos por estrangulamiento de CPU (`0.1 CPU`).
3. **Impacto decisivo de `C-18` (`validator-structural`)**:
   - Cuando se redactó originalmente `C-01`, el validador por subcadenas era engañable en el **92,3 %** de los ejercicios (`192/208`), lo que hacía pensar que sin compilador real la validación era casi simbólica.
   - Tras implementar `C-18` (tokenización Java que ignora comentarios, valida estructura, operadores, números, llamadas obligatorias y llaves/indentación), **`validator.js` cubre de forma robusta 198 de los 208 ejercicios (`95,2 %`) con solo `0,5 %` engañable**, a **costo \$0**, **latencia `< 5 ms`** y **100 % offline**.
   - Los únicos **9 ejercicios (`4,3 %`)** clasificados como `needs-real-execution` (ids `33–40` de `Scanner` e id `148` de `Supplier`) **también cuentan con validación estructural activa en `validator.js`**, por lo que ningún estudiante queda bloqueado cuando el sitio opera sin backend.

---

## 4. Decisión `DD-02` Final y Alcance de `C-06`

Aplicando estrictamente el orden de prioridad de `05_reglas_de_negocio.md` (**Seguridad > Costo > Mantenibilidad > Velocidad**, `RN-COS-01`, `RN-COS-02`, `RN-SEG-01`, `RN-SEG-02`):

### 4.1 Opción ganadora para producción (`DD-02` final)
- **Ganadora en producción (sitio publicado en GitHub Pages)**: **Opción A — Solo reglas (`validator.js` estructural post-`C-18`)**, manteniendo `BACKEND_URL = ''` y la arquitectura *static-first / offline-first*.
  - **Por qué gana**:
    1. **Costo \$0/mes garantizado (`RN-COS-01`)** sin límites diarios de ejecuciones ni sorpresas de facturación.
    2. **Mantenimiento cero (`RN-COS-02`)** y disponibilidad 100 % sin *cold starts* de 60 segundos ni caídas por límite de 512 MB de RAM.
    3. **Superficie de ataque cero en servidor (`RN-SEG-01`, `RN-SEG-02`)**.
    4. **Cobertura pedagógica alta demostrada (`95,2 % rules-only-ok`, `0,5 % engañable`)** gracias al validador estructural por tokens de `C-18`, con degradación transparente en los 9 ejercicios de `Scanner`/azar.

### 4.2 Alcance exacto para `C-06` (`secure-executor`) y `C-17` (`console-output`)
Aunque en producción el sitio continúe 100 % estático con solo reglas, **`backend/server.js` vive en el repositorio y hoy contiene código vulnerable (`server.js:56,78`)**. Por lo tanto:
1. **En `C-06` (`secure-executor`) se implementa la Opción B en el código del repositorio, SIN desplegar ni reactivar Render**:
   - Reemplazar `exec` por `execFile` sin shell (`shell: false`, `RN-SEG-01`).
   - Validar `className` contra la allowlist estricta `^[A-Z][A-Za-z0-9_]{0,31}$` con rechazo por defecto (HTTP 400, `RN-SEG-01`).
   - Ejecutar los subprocesos (`javac` y `java`) con **entorno vacío (`env: {}`)**, sin heredar `process.env`, para que el código del usuario no pueda leer claves, tokens ni variables de entorno del servidor (`System.getenv(...)`).
   - Limitar la memoria heap de la JVM con **`-Xmx64m`** (configurable) y limitar la **cantidad máxima de ejecuciones simultáneas** (`MAX_CONCURRENT`, devolviendo HTTP `429`/`503` si se supera) para evitar agotamiento de RAM (`OOM`).
   - Aislamiento en directorio temporal por sesión con timeout de 5 s (`killSignal: 'SIGKILL'`), manejo explícito de `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` (devolviendo salida truncada a 10 KB con `exitCode: 1` y mensaje claro de salida excesiva sin clasificarlo como timeout), tope de salida de 10 KB (`10000` caracteres) y limpieza determinística inmediata (`await fs.rm`) en `finally`.
   - Sanitizar `stderr` y errores para no filtrar rutas internas del sistema de archivos (`workDir`, `TEMP_DIR`).
   - Configurar CORS con origen explícito (no `*` permanente, HTTP 403 ante origen no listado), límite de body restrictivo (`64kb`, HTTP 413 si se supera) y *rate-limit* por IP con purga periódica de entradas vencidas en `rateBuckets` (HTTP 429, `RN-SEG-04`).
   - Suite de tests TDD de seguridad en verde como evidencia obligatoria del gate `RN-SEG-02`.
2. **Qué NO resuelve este código y requisitos pendientes para despliegue futuro (limitaciones explícitas)**:
   - El endurecimiento de `backend/server.js` resuelve la inyección de comandos en shell, el *path traversal*, la fuga de variables de entorno (`env: {}`), el desborde de memoria heap (`-Xmx`), los *shutdown hooks* bloqueantes (`SIGKILL`), la confusión entre `maxBuffer` y timeout, y la saturación por concurrencia/rate-limit a nivel de proceso Node.
   - **NO resuelve el aislamiento real de red ni de sistema de archivos a nivel de sistema operativo**: un programa Java ejecutado directamente sobre el SO del host aún podría intentar abrir conexiones de red salientes (`java.net.Socket`) o leer archivos del sistema con permisos de lectura del usuario del proceso. El **aislamiento real de red y de sistema de archivos requiere un contenedor o sandbox de nivel SO** (Docker con `--network none`, sistema de archivos de solo lectura `--read-only`, `pids-limit`, `cgroups` / `nsjail` / `isolate`).
   - **(a) IP real detrás de proxy para rate-limit**: para desplegar detrás de un proxy reverso hay que configurar la lectura de la IP real (`X-Forwarded-For` proveniente únicamente de un proxy confiable) para el `rate-limit`, **SIN activarlo ahora** (confiar en `X-Forwarded-For` sin proxy confiable permitiría falsificar ese encabezado y saltear el límite de tasa).
   - **(b) Cero archivos con secretos en disco dentro del contenedor**: el contenedor debe correr **sin ningún archivo con secretos en disco (ni `.env`)**, porque `env: {}` impide leer variables de entorno en memoria pero no impide que el proceso lea archivos legibles en disco.
   - **(c) Sin soporte de `stdin` actual**: hoy el programa ejecutado no recibe `stdin`; los ejercicios con `Scanner` (ids `33–40`) necesitarán un campo de entrada en una versión futura.
   - Por lo tanto, **el backend queda SIN desplegar y Render permanece suspendido** hasta que eso esté resuelto y probado (`RN-SEG-02`). `config.js` mantiene `BACKEND_URL = ''`.

### 4.3 Criterio explícito de reversión
Esta decisión (`DD-02`: producción con solo reglas + executor seguro en repo sin desplegar) se revisará para pasar a un despliegue activo en la nube (Opción B en contenedor dedicado con cgroups/`nsjail` u Opción C Piston self-hosted en VPS de \$5–\$6/mes) **únicamente si se cumplen simultáneamente estas condiciones**:
1. **Necesidad pedagógica verificada**: las métricas post-MVP (`C-09`/`C-14`) o los exámenes de bloqueo de nivel (`C-15`) demuestran que los 9 ejercicios runtime (`4,3 %`) o la falta de consola `stdout` en vivo en producción generan abandono o bloquean la evaluación.
2. **Soporte de `stdin` por ejercicio**: se incorporan fixtures de entrada estándar (`stdin`) para los ids `33–40` (`Scanner`), ya que sin `stdin` predefinido ni siquiera un compilador real puede ejecutar esos 8 ejercicios de forma no interactiva.
3. **Infraestructura con aislamiento de proceso y sin *cold start* bloqueante**: se dispone de presupuesto para un VPS/contenedor con ≥ 1–2 GB de RAM y aislamiento de red/recursos (evitando exponer `javac`/`java` sin contenedor en un free-tier de 512 MB).

---

## 5. Firma de conformidad

- **Estado de la decisión `DD-02` final**: **Aprobada y firmada por Belén Calvo** (`2026-10-24`).
- **Resumen firmado**:
  - **Producción (GitHub Pages)**: Opción A — Solo reglas (`validator.js` estructural post-`C-18`, `95,2 % rules-only-ok`, costo \$0, mantenimiento cero).
  - **Repositorio (`C-06 secure-executor`)**: Opción B — Endurecer `backend/server.js` (allowlist + `execFile` + timeout 5s + output cap 10KB + cleanup + CORS + rate-limit + tests TDD `RN-SEG-02`) **sin desplegar ni reactivar Render**.
