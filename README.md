# JavaMaster

Plataforma web gratuita en español para aprender programación en Java desde cero hasta nivel avanzado, con explicaciones conceptuales, ejercicios prácticos interactivos y seguimiento de progreso.

El proyecto se encuentra publicado y disponible en producción en:  
👉 **[https://java.belencalvo.me](https://java.belencalvo.me)** (alojado en GitHub Pages).

JavaMaster está pensado para personas hispanohablantes que buscan dar sus primeros pasos en Java o consolidar conceptos esenciales de programación orientada a objetos, colecciones, excepciones y concurrencia con práctica guiada, sin necesidad de pagar cursos costosos ni instalar entornos de desarrollo complejos desde el primer día.

---

## Tabla de contenidos

1. [Contenido del curso](#contenido-del-curso)
2. [Cómo funciona hoy](#cómo-funciona-hoy)
3. [Interfaz y experiencia de usuario](#interfaz-y-experiencia-de-usuario)
4. [Seguridad y privacidad](#seguridad-y-privacidad)
5. [Stack tecnológico y arquitectura](#stack-tecnológico-y-arquitectura)
6. [Cómo correrlo en local y ejecutar pruebas](#cómo-correrlo-en-local-y-ejecutar-pruebas)
7. [Metodología y hoja de ruta](#metodología-y-hoja-de-ruta)
8. [Estructura del repositorio](#estructura-del-repositorio)
9. [Reporte de problemas y licencia](#reporte-de-problemas-y-licencia)

---

## Contenido del curso

El plan de estudio está dividido en cuatro niveles de aprendizaje progresivos:

- **Principiante** (15 lecciones): sintaxis básica, tipos de datos primitivos, operadores, estructuras de control (`if`, `switch`, bucles `for`/`while`), arreglos y métodos.
- **Intermedio** (15 lecciones): programación orientada a objetos (clases, objetos, constructores, encapsulamiento, herencia, polimorfismo, interfaces y paquetes).
- **Avanzado** (12 lecciones): manejo de excepciones, colecciones (`List`, `Set`, `Map`), genéricos, expresiones lambda y la API de Streams.
- **Experto** (10 lecciones): concurrencia e hilos, patrones de diseño (Singleton, Factory, Observer), entrada y salida de archivos (NIO) y testing con JUnit.

### Métricas de contenido
- **52 lecciones** en total (distribución 15 / 15 / 12 / 10).
- **208 ejercicios prácticos** con enunciado, código inicial (*starter*), solución canónica y pistas orientativas.
- **4 lecciones teóricas de solo lectura** (conceptos que por su naturaleza de diseño o arquitectura no incluyen ejercicios interactivos de código):
  - Lección 22: *Composición vs Herencia*
  - Lección 25: *Paquetes y Organización*
  - Lección 40: *Parallel Streams*
  - Lección 42: *Serialización*

### Guías de estudio y evaluaciones
- **Guías descargables por nivel**: cada nivel incluye acceso a su material de estudio en formato HTML (`guia-principiante.html`, `guia-intermedio.html`, `guia-avanzado.html`, `guia-experto.html`), optimizado para lectura en pantalla, descarga o impresión en PDF desde el navegador.
- **Evaluaciones por nivel**: cuestionarios de opción múltiple con temporizador integrado en modales interactivos para validar los conocimientos teóricos adquiridos.

---

## Cómo funciona hoy

1. **Validación estructural en el navegador**: los ejercicios interactivos se analizan directamente en el cliente mediante un motor de validación basado en reglas (`validator.js`). No existe compilación Java real en el navegador ni en servidores de producción.
2. **Criterio de validación por reglas**: el validador analiza la presencia y estructura de elementos requeridos (declaraciones, nombres válidos, métodos, bloques de control), otorgando flexibilidad ante variantes sintácticas válidas. Como toda validación por reglas estáticas, puede aceptar o rechazar soluciones atípicas. Existen 9 ejercicios identificados (por ejemplo, aquellos que requieren entrada interactiva con `Scanner` en tiempo de ejecución) catalogados para evaluación con ejecución real en etapas futuras.
3. **Persistencia local sin cuentas**: el avance del estudiante (ejercicios y lecciones completadas) se guarda únicamente en el almacenamiento local del navegador (`localStorage`). La plataforma es utilizable de forma inmediata y anónima, sin necesidad de registro ni contraseña.

---

## Interfaz y experiencia de usuario

- **Modo claro y modo oscuro**: selector accesible con botón sol/luna (`#theme-toggle`) en la cabecera. El modo oscuro cuenta con una paleta verde profunda de alto contraste diseñada para reducir la fatiga visual. La preferencia seleccionada se recuerda entre sesiones.
- **Diseño responsive**: maquetado probado y adaptado para dispositivos móviles estrechos (360 px, 390 px, 424 px), tablets (768 px) y pantallas de escritorio (1280 px), garantizando áreas táctiles cómodas (≥ 44 px) y ausencia de desbordes horizontales.
- **Navegación contextual**: posibilidad de avanzar secuencialmente entre ejercicios de la misma lección, volver al índice o explorar los 208 ejercicios agrupados por lección mediante la vista "Ver Todos los Ejercicios".
- **Editor de código enriquecido**: panel con numeración de líneas sincronizada, soporte de indentación con tecla `Tab` y guías dinámicas de nivel de anidamiento.

---

## Seguridad y privacidad

- **Sin secretos en el código**: el repositorio no almacena credenciales, tokens ni API keys de ningún servicio.
- **Backend de ejecución local offline**: la carpeta `backend/` contiene una implementación de servidor (`backend/server.js`) con medidas de seguridad endurecidas y comprobadas mediante tests (C-06: límites de memoria y buffer, finalización con `SIGKILL`, sanitización de procesos huérfanos y limitador de tasa de peticiones). Sin embargo, este backend se encuentra **apagado y no desplegado en producción**.
- **Aislamiento pendiente**: antes de habilitar cualquier servicio de ejecución remota de Java se requerirá una arquitectura de contenedores efímeros aislados y sin privilegios de red o sistema de archivos. No existen URLs públicas de backend activas.

---

## Stack tecnológico y arquitectura

La plataforma está desarrollada completamente con tecnologías web estándar (**vanilla**), sin frameworks (sin React, Vue ni Angular), sin preprocesadores ni librerías de estilos pesadas:

- `index.html`: estructura semántica de la aplicación, vistas de niveles, visor de lecciones y modales.
- `styles.css`: variables CSS de diseño (tokens de color para modo claro y oscuro), tipografía del sistema, componentes y reglas responsive.
- `script.js`: catálogo maestro de lecciones (`lessonsData`), gestión de progreso en `localStorage` y renderizado base.
- `script-enhanced.js`: interactividad avanzada (manejo del editor, visor de ejercicios, evaluaciones con temporizador, cambio de tema y guías de indentación).
- `data.js`: catálogo maestro de los 208 ejercicios (`exercisesData`) con consignas, soluciones canónicas y pistas.
- `validator.js`: motor de validación estructural (`JavaValidator`, `STRUCT_RULES`).
- `lesson-nav.js`: lógica desacoplada de navegación entre lecciones y cálculo de disponibilidad (`LessonNav`).
- `config.js`: configuración local de la plataforma (ejecución remota e IA desactivadas).
- `guia-*.html`: páginas independientes con el contenido teórico de estudio para cada uno de los 4 niveles.

---

## Cómo correrlo en local y ejecutar pruebas

### Requisitos previos

- **Para usar la plataforma en local**: Python 3 (o cualquier servidor de archivos estáticos).
- **Para ejecutar la suite de pruebas**: Node.js (v18 o superior).
- **Para la verificación visual en navegador**: paquete de desarrollo Playwright (`npm install`).
- **Para los tests del ejecutor de backend**: Java Development Kit (JDK 17 o superior con `javac` y `java` accesibles en el `PATH`).

### 1. Iniciar el servidor local

Al ser un sitio web estático, no requiere proceso de compilación (*build*):

```bash
# 1. Clonar el repositorio
git clone https://github.com/belcalvo93/java-learning-platform.git
cd java-learning-platform

# 2. Servir los archivos con Python 3
python -m http.server 8000
```

Luego, abrir `http://localhost:8000` en cualquier navegador web moderno.

### 2. Ejecutar las pruebas automatizadas

El repositorio cuenta con una extensa batería de pruebas para asegurar la integridad de reglas, contenido y diseño:

```bash
# Instalar dependencias de desarrollo (Playwright y OpenSpec)
npm install

# 1. Ejecutar la suite completa de pruebas unitarias y de validador (2.793 tests)
node --test "tools/*.test.js"

# 2. Ejecutar la verificación de interfaz y responsive en navegador headless (161 chequeos)
node tools/browser-check.js

# 3. Auditar los 208 ejercicios contra el validador estructural
node tools/audit-validator.js

# 4. Validar la coherencia de especificaciones OpenSpec
npx openspec validate --specs
```

---

## Metodología y hoja de ruta

El desarrollo se organiza bajo la metodología de especificaciones **OpenSpec**, donde cada funcionalidad o refactor se planifica y registra como un *change* autocontenido (`proposal`, `design`, `tasks`). El archivo `CHANGES.md` actúa como mapa de ruta operativo y la carpeta `knowledge-base/` concentra la arquitectura canónica.

### Estado de implementación y planes futuros

> **Nota aclaratoria:** los siguientes puntos reflejan el estado real actual y distinguen claramente las funcionalidades vigentes de los planes de desarrollo futuros.

**Funcionalidades disponibles hoy:**
- [x] Sitio estático publicado en GitHub Pages con dominio propio (C-07).
- [x] 52 lecciones y 208 ejercicios revisados y homologados (C-16).
- [x] Motor de validación estructural anti-trampa con 2.700+ aserciones de prueba (C-18).
- [x] Rediseño visual editorial, soporte responsive, temas día/noche y paleta verde (C-12, C-12b, C-12c).
- [x] Guías de estudio descargables y evaluaciones por nivel con límite de tiempo.
- [x] Guardado de progreso en almacenamiento local (`localStorage`).
- [x] Servidor de backend seguro verificado en entorno de pruebas local (C-06).

**Hoja de ruta (planes en diseño o pendientes de implementación):**
- [ ] *Plan (C-20)*: Auditoría de ejercicios con ejecución real asistida por JDK.
- [ ] *Plan (C-08 / C-13)*: Autenticación opcional con Firebase Auth y sincronización de progreso en la nube con Firestore, manteniendo el acceso sin cuenta como opción predeterminada.
- [ ] *Plan (C-09 / C-14)*: Panel de administración para gestión de contenidos y métricas agregadas anónimas.
- [ ] *Plan (C-15 / C-19)*: Sistema de desbloqueo condicional de niveles mediante aprobación de exámenes.

---

## Estructura del repositorio

```text
java-learning-platform/
├── backend/            # Prototipo de servidor de ejecución en Java (offline, solo tests locales)
├── content-pack/       # Respaldos y paquetes estructurados del contenido de lecciones
├── docs/               # Documentación técnica, matrices de auditoría y decisiones de diseño
├── knowledge-base/     # Base de conocimiento canónica del proyecto (10 documentos de arquitectura)
├── openspec/           # Especificaciones del sistema y registro histórico de changes archivados
├── tools/              # Herramientas de auditoría, scripts de comprobación y suites de tests
├── data.js             # Catálogo de 208 ejercicios (enunciados, starters, soluciones)
├── index.html          # Punto de entrada y estructura HTML principal
├── lesson-nav.js       # Lógica pura de navegación y disponibilidad
├── script.js           # Catálogo de 52 lecciones y lógica de progreso
├── script-enhanced.js  # Lógica de interfaz, editor, evaluaciones y temas
├── styles.css          # Estilos visuales y variables de diseño
├── guia-*.html         # Guías de estudio descargables por cada nivel
└── package.json        # Configuración de dependencias de desarrollo y testing
```

---

## Reporte de problemas y licencia

### Reportar un problema
Si encontrás un error en alguna consigna, una inconsistencia en el validador o una falla visual, podés reportarlo abriendo un issue en el repositorio oficial:  
👉 **[Reportar un problema en GitHub Issues](https://github.com/belcalvo93/java-learning-platform/issues)**

### Autora
Proyecto personal desarrollado y mantenido por **Belén Calvo**.
- Perfil de GitHub: [https://github.com/belcalvo93](https://github.com/belcalvo93)
- LinkedIn: [https://www.linkedin.com/in/belucalvo/](https://www.linkedin.com/in/belucalvo/)

### Licencia
Este proyecto se distribuye bajo la licencia **MIT**. Para más detalles sobre términos de copia, modificación y distribución, consultá el archivo [`LICENSE`](LICENSE).
