# Actores y Roles

## Actores del sistema

| Actor | Descripción | Cómo interactúa |
|-------|-------------|-----------------|
| Estudiante | Persona hispanohablante que aprende Java | Navega lecciones (guia-principiante/intermedio/avanzado/experto.html), resuelve ejercicios, guarda progreso en navegador |
| Administradora (Belén) | Dueña del contenido y repo | Edita HTML/JS/data.js en repo directamente (sin panel — el panel queda para el futuro), publica en Pages; a futuro ve métricas |

Hoy NO existe login: "estudiante con login" y "admin con métricas" son objetivo post-MVP. La KB distingue estado actual vs objetivo.

## RBAC — Matriz de permisos

| Rol | Recurso | Permisos (v1.0 actual) | Permisos (futuro con login) |
|-----|---------|------------------------|-----------------------------|
| Visitante/estudiante | Lecciones, ejercicios, guías | Lectura + ejecutar validación local | + progreso persistido, certificado |
| Administradora | Repo/contenido | Escritura vía git (fuera del sistema) | + panel: CRUD contenido, ver métricas agregadas |

En v1.0 no hay enforcement en-app (todo es público y local). El RBAC futuro aplica solo cuando exista backend con auth real.

## Rutas públicas

En v1.0 TODO es público (sitio estático sin auth):
- `index.html`, `guia-principiante.html`, `guia-intermedio.html`, `guia-avanzado.html`, `guia-experto.html`
- Assets JS/CSS (`script.js`, `data.js`, `validator.js`, etc.)

Cuando exista login, las rutas de progreso/certificado pasarán a requerir sesión; las lecciones seguirán públicas (decisión de producto: aprender gratis sin barrera).
