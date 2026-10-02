# Flujos Principales

## Flujo 1: Estudiar y practicar sin backend (happy path MVP)
**Disparador**: estudiante abre el sitio publicado. **Actor**: estudiante.
**Pasos**:
1. [Navegador] carga `index.html` + `data.js` + `script.js` desde GitHub Pages
2. [Navegador] lista niveles y lecciones (52)
3. [Estudiante] abre lección y lee contenido + ejemplo
4. [Estudiante] escribe solución en editor embebido
5. [validator.js] evalúa por reglas localmente → feedback inmediato en español
6. [Navegador] guarda progreso en localStorage
**Casos de error**:
- Regla no cubre caso borde → mensaje genérico + pista (nunca stacktrace crudo)
- localStorage lleno/bloqueado → aviso + la app sigue funcionando sin guardar

## Flujo 2: Intentar ejecución Java remota (DESHABILITADO hasta rediseño)
**Disparador**: ejercicio marcado "requiere ejecución". **Actor**: estudiante.
**Pasos (objetivo, no implementar hasta DD-02)**:
1. [Frontend] detecta que no hay backend seguro configurado
2. [Frontend] muestra "ejecución no disponible — validando por reglas" y corre validator
3. [Futuro backend seguro] valida `className` allowlist, escribe archivo en sandbox, `javac`/`java` con timeout 5s, capa output 10KB, limpia temp
**Casos de error**:
- Backend caído/suspendido → degradación a reglas, nunca reintento infinito ni exposición de URL interna
- Timeout/compilación fallida → error legible con stage (compilation/execution)

```
Estudiante → Frontend → ¿backend seguro? ─No──▶ validator.js → feedback
                                └Sí─▶ /api/execute (validado+ sandbox) → output capado
```

## Flujo 3: Publicar contenido (admin, vía git)
**Disparador**: Belén actualiza lección/ejercicio. **Actor**: administradora.
**Pasos**:
1. [Admin] edita `data.js`/`script.js`/HTML en rama
2. [Admin] verifica 52/208 invariante y cero secretos (`git grep`)
3. [Admin] merge + Pages publica
**Casos de error**:
- ID cambiado accidentalmente → rompe progreso local (RN-CON-03) → revertir ID

## Flujo 4 (futuro): Login y progreso persistido
Reservado post-MVP. Requiere decisiones de `10_preguntas_abiertas.md` (proveedor auth, DB, modelo Avance/Certificado). No diseñar en MVP.
