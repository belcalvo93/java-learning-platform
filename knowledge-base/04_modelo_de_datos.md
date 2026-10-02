# Modelo de Datos

## Dominios
- **Contenido educativo**: lecciones (52) y ejercicios (208) versionados en código (`data.js`, `script.js`).
- **Progreso local (v1.0)**: estado en navegador, sin esquema servidor.
- **Progreso persistido (futuro)**: usuarios, avance por lección/ejercicio, certificados — requiere diseño cuando se implemente login/DB.
- **Guías**: 4 HTML descargables (principiante/intermedio/avanzado/experto).

## ERD (v1.0 — solo cliente)

```
[localStorage]
  progreso: { leccionId: estado, ejercicioId: { intentos, completado } }
     │  sin validación servidor, sin identidad
     └── se pierde si cambia de navegador/dispositivo (limitación conocida)
```

## Entidades

### Leccion (en código, no en DB)
- Atributos: id, nivel (principiante/intermedio/avanzado/experto), título, contenido HTML, orden
- Relaciones: 1 lección → N ejercicios; 1 nivel → N lecciones (15/15/12/10)
- Constraints: ids estables para no romper progreso local
- Origen: `script.js`, `guia-*.html`

### Ejercicio (en código)
- Atributos: id, leccionId, enunciado, plantilla código, regla validación, pista
- Relaciones: N ejercicios → 1 lección
- Constraints: la regla en `validator.js` debe ser determinista y offline
- Origen: `data.js` (208 registros)

### ProgresoLocal (v1.0)
- Atributos: leccionId, ejercicioId, completado (bool), intentos (int), timestamp
- Relaciones: ninguna (aislado por navegador)
- Constraints: best-effort; no es fuente de verdad para certificado

### Usuario / Avance / Certificado (FUTURO — no implementar en MVP)
- Reservado para change post-MVP con login/DB. Ver `10_preguntas_abiertas.md`: elección de proveedor auth y DB pendiente.

## Seed data inicial
- Las 52 lecciones y 208 ejercicios YA son el seed (vienen en `data.js`/`script.js`).
- Sin seed de usuarios en v1.0 (no hay DB).
- Guías HTML como material complementario estático.
