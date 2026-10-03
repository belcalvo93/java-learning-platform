# ☕ JavaMaster - Plataforma Interactiva de Aprendizaje

> Aprende Java desde cero hasta nivel experto con explicaciones en español, ejercicios interactivos y validación en tiempo real.

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![Estado: Activo](https://img.shields.io/badge/Estado-Activo-success.svg)]()

## 🌟 Características

- ✅ **52 Lecciones Completas** - Desde principiante hasta experto
- ✅ **208 Ejercicios Interactivos** - Practica mientras aprendes
- ✅ **Validación inmediata en el navegador** - Revisión por reglas (`validator.js`); sin compilación ni ejecución real en v1.0
- ✅ **4 Niveles de Aprendizaje** - Principiante, Intermedio, Avanzado y Experto
- ✅ **Progreso local** - Se guarda solo en este navegador (`localStorage`); sin login ni base de datos en v1.0
- ✅ **Guías de Estudio Descargables** - Material complementario para cada nivel
- ✅ **Constancia local de finalización** - Generada en el navegador, no verificable (se pierde si cambias de navegador o dispositivo)

## 🚀 Demo en Vivo

**Frontend:** https://java.belencalvo.me/

## 📋 Contenido del Curso

### 🌱 Nivel Principiante (15 lecciones)
- Variables y tipos de datos
- Operadores y expresiones
- Estructuras de control (if, for, while)
- Arrays y métodos
- Buenas prácticas y convenciones

### 🚀 Nivel Intermedio (15 lecciones)
- Programación Orientada a Objetos
- Clases y objetos
- Herencia y polimorfismo
- Interfaces y clases abstractas
- Colecciones (ArrayList, HashMap)

### ⚡ Nivel Avanzado (12 lecciones)
- Streams y expresiones lambda
- Programación funcional
- Manejo avanzado de excepciones
- Concurrencia y multithreading
- Entrada/Salida de archivos

### 👑 Nivel Experto (10 lecciones)
- Patrones de diseño
- Arquitectura de software
- Optimización y rendimiento
- Testing y debugging avanzado
- Mejores prácticas profesionales

## 🛠️ Tecnologías Utilizadas

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Firebase (ejemplo no operativo en v1.0 — sin login ni base de datos)
- Diseño responsivo

### Ejecutor de código (desactivado en v1.0)
- La ejecución de código está en rediseño por seguridad.
- Node.js + Express y Java JDK 21 solo sirven para el desarrollo del ejecutor futuro; no son necesarios para usar la plataforma.

## 📦 Instalación Local

### Requisitos Previos
- Navegador moderno y Git ([Descargar](https://git-scm.com/)) para obtener el código
- Python 3 (o cualquier servidor HTTP estático) para servir los archivos
- Node.js 16+ y Java JDK 21+ solo si vas a desarrollar el ejecutor futuro (no necesarios para usar la plataforma)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/belcalvo93/java-learning-platform.git
cd javamaster-platform
```

2. **Sin configuración de backend (desactivado en v1.0)**
```
La ejecución de código está en rediseño por seguridad.
No se requiere instalar dependencias del backend ni configurar secretos.
Si la ejecución no está disponible, la plataforma valida por reglas
y muestra: "ejecución no disponible — validando por reglas".
```

3. **Iniciar el frontend**
```bash
# En otra terminal, desde la raíz del proyecto
python -m http.server 8000
# O usa cualquier servidor HTTP estático
```

4. **Abrir en el navegador**
```
http://localhost:8000
```

## 🌐 Despliegue en Producción

### GitHub Pages (Frontend, única vía en v1.0)
1. Haz fork de este repositorio
2. Ve a Settings → Pages
3. Selecciona la rama `main` y carpeta `/ (root)`
4. Tu sitio estará en: `https://java.belencalvo.me/` (dominio propio configurado en Settings > Pages)

### Ejecutor de código (desactivado en v1.0)
La ejecución de código está en rediseño por seguridad. No se requiere backend para usar la plataforma.

## 📚 Estructura del Proyecto

```
javamaster-platform/
├── index.html              # Página principal
├── styles.css              # Estilos principales
├── colors-feminine.css     # Paleta de colores
├── modules-view.css        # Vista de módulos
├── script.js               # Lógica principal (52 lecciones)
├── script-enhanced.js      # Funcionalidades avanzadas
├── data.js                 # Datos de ejercicios (208)
├── validator.js            # Validador de código
├── config.js               # Configuración
├── java-executor.js        # Ejecutor de Java
├── ai-validator.js         # Validador simplificado
├── firebase-config.js      # Configuración de Firebase
├── auth.js                 # Autenticación
├── guia-*.html             # Guías de estudio (4)
├── backend/                # Servidor Node.js
│   ├── server.js           # API de compilación Java
│   ├── package.json        # Dependencias
│   └── .env.example        # Variables de entorno
├── docs/                   # Documentación
└── README.md               # Este archivo
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar la plataforma:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👩‍💻 Autora

**Belén Calvo**

Creado con ❤️ para la comunidad hispanohablante de programadores.

## 🙏 Agradecimientos

- A todos los estudiantes que usan esta plataforma
- A la comunidad de desarrolladores Java
- A los contribuidores del proyecto

## 📞 Soporte

Si tienes preguntas o encuentras algún problema:

- 📧 Email: [tu-email@ejemplo.com]
<!-- Nota interna (pendiente): la autora actualiza sus datos de contacto ella misma -->
- 🐛 Issues: [GitHub Issues](https://github.com/belcalvo93/java-learning-platform/issues)

---

**⭐ Si te gusta este proyecto, dale una estrella en GitHub!**
