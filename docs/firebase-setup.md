# Guía de Configuración Manual de Firebase — JavaMaster (C-13)

Esta guía explica paso a paso cómo crear y configurar el proyecto de Firebase en el plan gratuito (**Spark**) para habilitar el inicio de sesión opcional y la sincronización de progreso en la nube de JavaMaster.

---

## 1. Crear el Proyecto en Firebase Console

1. Ingresá a [Firebase Console](https://console.firebase.google.com/) con tu cuenta de Google.
2. Hacé clic en **"Agregar proyecto"** (o "Crear un proyecto").
3. Asignale un nombre, por ejemplo: `javamaster-prod` o `javamaster-platform`.
4. En el paso de Google Analytics, podés desactivarlo (no es necesario para la autenticación ni el progreso).
5. Hacé clic en **"Crear proyecto"** y esperá a que finalice la creación.
6. Asegurate de que el plan seleccionado sea el **Plan Spark** (Gratuito / $0 USD al mes).

---

## 2. Configurar Firebase Authentication

1. En el menú lateral izquierdo, navegá a **Compilación > Authentication**.
2. Hacé clic en **"Comenzar"**.
3. En la pestaña **"Sign-in method"** (Métodos de acceso):
   - **Correo electrónico/Contraseña**:
     - Hacé clic en la fila correspondiente y activá el switch **"Habilitar"**.
     - Dejá desactivado el enlace de correo electrónico sin contraseña (Email link).
     - Hacé clic en **Guardar**.
   - **Google**:
     - Hacé clic en la fila de **Google** y activá el switch **"Habilitar"**.
     - Seleccioná un nombre público para el proyecto (ej. `JavaMaster`) y tu correo de asistencia.
     - Hacé clic en **Guardar**.
   - **Nota sobre otros proveedores**: No habilitar Facebook, Twitter ni GitHub (decisión C-08 / C-13: sin Facebook).

### Dominios Autorizados (OAuth Redirect)
En la misma sección de Authentication, bajá hasta la tarjeta **"Dominios autorizados"**:
1. Verificá que estén `localhost` y `<tu-proyecto>.firebaseapp.com`.
2. Hacé clic en **"Agregar dominio"** y sumá el dominio de producción:
   `java.belencalvo.me`

---

## 3. Crear y Configurar Cloud Firestore

1. En el menú lateral izquierdo, navegá a **Compilación > Firestore Database**.
2. Hacé clic en **"Crear base de datos"**.
3. En el diálogo inicial:
   - **Ubicación de Cloud Firestore**: Elegí una región cercana (por ejemplo `southamerica-east1` en San Pablo, o `us-central1`).
   - **Reglas de seguridad iniciales**: Podés elegir "Modo de producción".
4. Hacé clic en **Habilitar**.

### Desplegar Reglas de Seguridad (`firestore.rules`)
1. En Firestore Database, hacé clic en la pestaña **"Reglas"** (Rules).
2. Borrá el contenido existente y pegá el contenido completo del archivo [`firestore.rules`](../firestore.rules) del repositorio.
3. Hacé clic en **"Publicar"** (Publish).

> **Garantías de estas reglas**:
> - Cada usuario solo puede leer y escribir su propio documento en `users/{userId}`.
> - Se validan tipos y tamaños máximos (hasta 52 lecciones, 208 ejercicios).
> - Se prohíbe que el cliente intente inyectar roles de administrador (`role`, `isAdmin`).
> - La colección `admins/` no tiene escritura desde la web.
> - Todo lo demás está denegado por defecto.

---

## 4. Registrar la Aplicación Web y Obtener las Credenciales

1. En la página principal de la consola de Firebase, hacé clic en el ícono de **Configuración del proyecto** (el engranaje al lado de "Descripción general").
2. En la pestaña **"General"**, bajá hasta **"Tus apps"** y hacé clic en el ícono web `</>`.
3. Ingresá un apodo para la aplicación, por ejemplo: `javamaster-web`.
4. **No** es necesario marcar "Firebase Hosting" si el sitio se sirve mediante GitHub Pages / Cloudflare Pages.
5. Hacé clic en **"Registrar app"**.
6. Firebase te mostrará el fragmento `const firebaseConfig = { ... }`.
7. Copiá únicamente los valores de las propiedades.

---

## 5. Cargar las Credenciales en la Plataforma

Abrí el archivo [`firebase-config.js`](../firebase-config.js) en la raíz del repositorio y reemplazá los valores vacíos:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};
```

> **Buenas prácticas de seguridad**:
> - En [Google Cloud Console](https://console.cloud.google.com/apis/credentials), buscá la clave de API generada para este proyecto y aplicá **Restricciones de sitios web (HTTP referrers)**:
>   - `https://java.belencalvo.me/*`
>   - `http://localhost:*`
> - De esta forma, nadie podrá usar tu API Key fuera de tus dominios autorizados.

---

## 6. Verificación de Funcionamiento

1. Abrí la plataforma en tu navegador.
2. Hacé clic en el botón **"Mi Cuenta"** en la barra superior.
3. El cartel que dice *"La sincronización en la nube no está configurada..."* ya no debe aparecer si la configuración es válida.
4. Probá crear una cuenta de prueba:
   - Ingresá un correo y contraseña (debajo del botón de registro verás la leyenda legal de confirmación de edad y privacidad).
   - Al registrarte, verás tu nombre en la cabecera y el aviso de progreso mostrará:
     `Progreso sincronizado en tu cuenta (<email>)`.
5. Probá resolver un ejercicio y recargar la página en otro navegador o pestaña de incógnito con la misma sesión iniciada: el progreso se sincronizará sin pérdidas.
6. En el panel **"Mi Cuenta"**, verificá los botones:
   - **"Descargar mis datos (JSON)"**: descargará un archivo con todo tu progreso y metadatos.
   - **"Eliminar mi cuenta y mis datos"**: borrará el documento en Firestore y la cuenta en Firebase Auth previa confirmación.
