# Funcionalidades

Organizadas por épica. Estado: [MVP] = debe funcionar lanzable; [FUTURO] = después de login/DB.

## Épica 1: Aprender por niveles [MVP]
### US-001 — Navegar 52 lecciones por nivel
**Como** estudiante **Quiero** recorrer principiante→experto en orden **Para** aprender progresivamente
**Criterios de aceptación**:
- [ ] 15/15/12/10 lecciones accesibles desde index y guías
- [ ] Sin errores JS en consola en las 4 guías
**Reglas relacionadas**: RN-CON-01, RN-CON-03

### US-002 — Leer guías descargables
**Como** estudiante **Quiero** material complementario por nivel **Para** repasar offline
**Criterios de aceptación**:
- [ ] 4 HTML de guías abren y son legibles en móvil/desktop

## Épica 2: Practicar con validación [MVP]
### US-003 — Resolver 208 ejercicios con validación por reglas
**Como** estudiante **Quiero** saber al instante si mi solución es correcta sin backend **Para** practicar sin instalar nada
**Criterios de aceptación**:
- [ ] Los 208 ejercicios validan vía `validator.js` offline
- [ ] Mensaje de error legible en español ante fallo
**Reglas relacionadas**: RN-CON-02

### US-004 — Ejecución Java real (segura) o degradación explícita
**Como** estudiante **Quiero** ejecutar Java real cuando esté disponible **Para** verificar comportamiento runtime
**Criterios de aceptación**:
- [ ] Si hay backend seguro: ejecuta con timeout 5s y output capado
- [ ] Si no hay backend: el UI lo dice y ofrece validación por reglas (nunca cuelga ni expone endpoint caído)
**Reglas relacionadas**: RN-SEG-01, RN-SEG-02

## Épica 3: Progreso y certificado
### US-005 — Guardar progreso en navegador [MVP]
**Como** estudiante **Quiero** retomar donde quedé en este navegador **Para** no perder avance
**Criterios de aceptación**:
- [ ] Progreso persiste en reload (localStorage) con aviso "solo este navegador"
**Reglas relacionadas**: RN-PRO-01

### US-006 — Login + progreso persistido [FUTURO]
**Como** estudiante **Quiero** crear cuenta y ver mi avance en cualquier dispositivo **Para** certificarme
**Criterios de aceptación**:
- [ ] Auth real, avance por usuario, certificado verificable
**Reglas relacionadas**: RN-PRO-03

### US-007 — Panel admin y métricas [FUTURO]
**Como** administradora **Quiero** gestionar contenido y ver métricas **Para** mejorar el curso
**Criterios de aceptación**:
- [ ] CRUD contenido + agregados (completions, drop-off) — diseño pendiente

## Épica 4: Publicación segura [MVP]
### US-008 — Sitio publicado sin secretos
**Como** administradora **Quiero** publicar frontend sin keys en repo **Para** cumplir RN-SEG-03
**Criterios de aceptación**:
- [ ] `git grep -i apikey` no devuelve secretos reales; `config.js` sin key hardcodeada
- [ ] Firebase ejemplo removido o claramente marcado no-operativo
**Reglas relacionadas**: RN-SEG-03
