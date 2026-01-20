# ☕ JavaMaster - Plataforma Interactiva de Aprendizaje

> Aprende Java desde cero hasta nivel experto con explicaciones en español, ejercicios interactivos y validación en tiempo real.

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![Estado: Activo](https://img.shields.io/badge/Estado-Activo-success.svg)]()

## 🌟 Características

- ✅ **52 Lecciones Completas** - Desde principiante hasta experto
- ✅ **208 Ejercicios Interactivos** - Practica mientras aprendes
- ✅ **Compilador Java en Tiempo Real** - Ejecuta código directamente en el navegador
- ✅ **4 Niveles de Aprendizaje** - Principiante, Intermedio, Avanzado y Experto
- ✅ **Sistema de Progreso** - Guarda tu avance con Firebase
- ✅ **Guías de Estudio Descargables** - Material complementario para cada nivel
- ✅ **Certificado de Finalización** - Al completar todos los niveles

## 🚀 Demo en Vivo

**Frontend:** [https://TU-USUARIO.github.io/javamaster-platform/](https://TU-USUARIO.github.io/javamaster-platform/)  
**Backend:** [https://javamaster-backend.onrender.com](https://javamaster-backend.onrender.com)

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
- Firebase (Autenticación y Base de Datos)
- Diseño responsivo

### Backend
- Node.js + Express
- Java JDK 21 (para compilación)
- CORS habilitado

## 📦 Instalación Local

### Requisitos Previos
- Node.js 16+ ([Descargar](https://nodejs.org/))
- Java JDK 21+ ([Descargar](https://www.oracle.com/java/technologies/downloads/))
- Git ([Descargar](https://git-scm.com/))

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU-USUARIO/javamaster-platform.git
cd javamaster-platform
```

2. **Configurar el backend**
```bash
cd backend
npm install
cp .env.example .env
# Edita .env y agrega tu API key de Gemini (opcional)
npm start
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

### GitHub Pages (Frontend)
1. Haz fork de este repositorio
2. Ve a Settings → Pages
3. Selecciona la rama `main` y carpeta `/ (root)`
4. Tu sitio estará en: `https://TU-USUARIO.github.io/javamaster-platform/`

### Render (Backend)
1. Crea una cuenta en [Render](https://render.com)
2. Conecta tu repositorio de GitHub
3. Crea un nuevo Web Service:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Actualiza `config.js` con la URL de tu backend de Render

**Ver guía completa:** [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

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
- 🐛 Issues: [GitHub Issues](https://github.com/TU-USUARIO/javamaster-platform/issues)

---

**⭐ Si te gusta este proyecto, dale una estrella en GitHub!**
