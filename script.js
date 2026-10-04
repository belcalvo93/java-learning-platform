// ============================================
// JAVA MASTER - PROGRESS MANAGER
// ============================================

// Aviso visible: el progreso vive solo en este navegador (RN-PRO-01).
// Lenguaje simple, sin jerga interna.
const LOCAL_ONLY_NOTICE = 'tu progreso se guarda solo en este navegador';
const STORAGE_BLOCKED_NOTICE = 'No se pudo guardar tu progreso en este navegador, pero podés seguir practicando.';

// Respaldo en memoria cuando el guardado del navegador falla o está bloqueado.
const __memoryStore = new Map();

function notifyStorageDegraded(message) {
  try {
    if (typeof window !== 'undefined' && window && Array.isArray(window.__storageNotices)) {
      window.__storageNotices.push(message);
    }
  } catch (_) { /* solo test-hook, nunca rompe */ }
  try {
    if (typeof document !== 'undefined' && document && typeof document.getElementById === 'function') {
      ensureLocalOnlyNotice(message);
    }
  } catch (_) { /* sin DOM: la app sigue operativa */ }
}

// Acceso seguro al guardado: nunca lanza; ante fallo avisa y usa memoria.
function safeGet(storage, key, fallback = null, onNotice) {
  try {
    const value = storage.getItem(key);
    return value === null || value === undefined ? fallback : value;
  } catch (_) {
    (onNotice || notifyStorageDegraded)(STORAGE_BLOCKED_NOTICE);
    return __memoryStore.has(key) ? __memoryStore.get(key) : fallback;
  }
}

function safeSet(storage, key, value, onNotice) {
  try {
    storage.setItem(key, value);
    __memoryStore.set(key, value);
    return true;
  } catch (_) {
    __memoryStore.set(key, value);
    (onNotice || notifyStorageDegraded)(STORAGE_BLOCKED_NOTICE);
    return false;
  }
}

function safeRemove(storage, key, onNotice) {
  try {
    storage.removeItem(key);
    __memoryStore.delete(key);
    return true;
  } catch (_) {
    __memoryStore.delete(key);
    (onNotice || notifyStorageDegraded)(STORAGE_BLOCKED_NOTICE);
    return false;
  }
}

// Aviso persistente junto al progreso: visible tras cada recarga.
function ensureLocalOnlyNotice(extraMessage) {
  if (typeof document === 'undefined' || !document.getElementById) return;
  let notice = document.getElementById('local-only-notice');
  if (!notice && typeof document.createElement === 'function') {
    const created = document.createElement('div');
    if (!created || typeof created.setAttribute !== 'function') return;
    notice = created;
    notice.id = 'local-only-notice';
    notice.setAttribute('role', 'status');
    const anchor = document.getElementById('progreso') || document.body;
    if (anchor && typeof anchor.prepend === 'function') {
      anchor.prepend(notice);
    } else if (anchor && typeof anchor.appendChild === 'function') {
      anchor.appendChild(notice);
    } else {
      return;
    }
  }
  const text = extraMessage ? `${LOCAL_ONLY_NOTICE}. ${extraMessage}` : `ℹ️ ${LOCAL_ONLY_NOTICE}.`;
  if ('textContent' in notice) notice.textContent = text;
}

class ProgressManager {
  constructor() {
    let saved = '{}';
    try {
      saved = safeGet(localStorage, 'javaMasterProgress', '{}');
    } catch (_) {
      saved = '{}';
    }
    try {
      this.progress = JSON.parse(saved || '{}');
    } catch (_) {
      this.progress = {};
    }
  }

  isCompleted(lessonId) {
    return this.progress[lessonId] === true;
  }

  markAsCompleted(lessonId) {
    this.progress[lessonId] = true;
    safeSet(localStorage, 'javaMasterProgress', JSON.stringify(this.progress));
    this.updateUI();
  }

  getStats() {
    const totalLessons = lessonsData.length;
    const completedLessons = Object.keys(this.progress).filter(id => !isNaN(id)).length;
    return {
      completedLessons,
      totalLessons,
      completedExercises: completedLessons * 4,
      totalExercises: 208
    };
  }

  resetProgress() {
    this.progress = {};
    safeRemove(localStorage, 'javaMasterProgress');
    this.updateUI();
  }

  updateUI() {
    ensureLocalOnlyNotice();
    const stats = this.getStats();

    const totalPercent = Math.round((stats.completedLessons / stats.totalLessons) * 100) || 0;
    const totalFill = document.getElementById('total-progress-fill');
    const totalText = document.getElementById('total-percentage');
    if (totalFill) totalFill.style.width = `${totalPercent}%`;
    if (totalText) totalText.textContent = `${totalPercent}%`;

    const compLessons = document.getElementById('completed-lessons');
    const totLessons = document.getElementById('total-lessons');
    const compEx = document.getElementById('completed-exercises');
    if (compLessons) compLessons.textContent = stats.completedLessons;
    if (totLessons) totLessons.textContent = stats.totalLessons;
    if (compEx) compEx.textContent = stats.completedExercises;

    this.updateLevelProgress('beginner', 1, 15);
    this.updateLevelProgress('intermediate', 16, 30);
    this.updateLevelProgress('advanced', 31, 42);
    this.updateLevelProgress('expert', 43, 52);

    if (typeof renderLessons === 'function') {
      const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
      renderLessons(activeFilter);
    }
  }

  updateLevelProgress(level, startId, endId) {
    const totalInLevel = (endId - startId) + 1;
    let completedInLevel = 0;
    for (let i = startId; i <= endId; i++) {
      if (this.isCompleted(i)) completedInLevel++;
    }
    const percent = Math.round((completedInLevel / totalInLevel) * 100) || 0;

    const fill = document.getElementById(`${level}-progress`);
    const text = document.getElementById(`${level}-text`);
    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${percent}%`;

    const levelCardFill = document.querySelector(`.level-card.${level} .progress-fill`);
    const levelCardText = document.querySelector(`.level-card.${level} .progress-text`);
    if (levelCardFill) levelCardFill.style.width = `${percent}%`;
    if (levelCardText) levelCardText.textContent = `${percent}% completado`;
  }
}

// ============================================
// JAVA MASTER - DATA CORE
// All 52 Lessons (Harvard CS50 Level)
// ============================================

const lessonsData = [
  // 🌱 NIVEL PRINCIPIANTE (15 lecciones)
  {
    id: 1, level: 'beginner', module: 1, title: 'Indentación y Buenas Prácticas',
    description: 'Aprende a escribir código limpio y legible desde el principio',
    duration: '20 min',
    content: `<h2>Indentación y Buenas Prácticas</h2><h3>🎯 ¿Para qué sirve la indentación?</h3><p>La indentación hace que tu código sea <strong>legible, profesional y fácil de mantener</strong>.</p><div class="info-box"><strong>💼 En el mundo real:</strong> Las empresas rechazan código mal indentado.</div><div class="code-block"><pre><code>public class Ejemplo {
    public static void main(String[] args) {
        System.out.println("Hola");
    }
}</code></pre></div><h3>✅ Reglas de Oro</h3><ul><li>4 espacios por nivel</li><li>Llave de apertura { en la misma línea</li><li>Llave de cierre } alineada</li></ul>`
  },
  {
    id: 2, level: 'beginner', module: 1, title: 'Introducción a Java y JVM',
    description: 'Qué es Java, historia, JVM, JDK, JRE y tu primer programa',
    duration: '30 min',
    content: `<h2>Introducción a Java y JVM</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p><strong>Java</strong> es un lenguaje de programación: una forma de escribir instrucciones que una computadora puede ejecutar. El problema que resuelve es este: cada tipo de computadora (Windows, Mac, Linux) entiende un "idioma" interno distinto.</p>
<p>Java usa un intermediario: la <strong>JVM</strong> (<em>Java Virtual Machine</em>, "máquina virtual de Java"). Es como un intérprete en una conferencia: tú hablas siempre en el mismo idioma y el intérprete lo traduce para cada oyente. Por eso se dice "escribe una vez, ejecuta en cualquier lugar".</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Java se usa mucho en los sistemas del lado del servidor de bancos y grandes empresas, y durante años fue el lenguaje principal para aplicaciones Android.</div>
<h3>📖 Cómo funciona</h3>
<p>Tu programa pasa por tres etapas:</p>
<ol>
<li>Escribes el <strong>código fuente</strong> en un archivo de texto con extensión <code>.java</code>.</li>
<li>El compilador <code>javac</code> lo traduce a <strong>bytecode</strong> (un archivo <code>.class</code>). El bytecode es el "idioma" que entiende la JVM.</li>
<li>El comando <code>java</code> arranca la JVM, que ejecuta el bytecode.</li>
</ol>
<p>Tres siglas clave:</p>
<ul>
<li><strong>JVM</strong>: la máquina virtual que ejecuta el bytecode.</li>
<li><strong>JRE</strong>: lo necesario para <em>ejecutar</em> programas Java.</li>
<li><strong>JDK</strong>: lo necesario para <em>desarrollar</em>: trae <code>javac</code> y además incluye lo del JRE. Si vas a programar, instala el JDK.</li>
</ul>
<p>Este es un programa completo. Guárdalo en un archivo llamado <code>Saludo.java</code>:</p><div class="code-block"><pre><code>public class Saludo {
    public static void main(String[] args) {
        System.out.println("¡Empezamos con Java!");
    }
}
// Salida: ¡Empezamos con Java!</code></pre></div><p>Línea por línea: <code>public class Saludo</code> crea una clase (el "contenedor" de tu programa) y su nombre debe coincidir con el del archivo. <code>main</code> es el punto de entrada: Java empieza a ejecutar desde ahí. <code>System.out.println(...)</code> muestra texto en pantalla. Cada instrucción termina con <code>;</code>.</p>
<p>Para correrlo, en la terminal: <code>javac Saludo.java</code> (compila) y luego <code>java Saludo</code> (ejecuta).</p>
<p>Hay tres formas de mostrar texto:</p>
<ul>
<li><code>println</code>: imprime y salta a la línea siguiente.</li>
<li><code>print</code>: imprime y se queda en la misma línea.</li>
<li><code>printf</code>: imprime con formato. <code>%d</code> es un hueco para un número entero, <code>%s</code> para un texto y <code>%n</code> es un salto de línea.</li>
</ul><div class="code-block"><pre><code>public class Formatos {
    public static void main(String[] args) {
        System.out.print("Me llamo ");
        System.out.println("Lucía");
        System.out.println("Segunda línea");
        System.out.printf("Tengo %d años y me gusta el %s.%n", 30, "café");
    }
}
// Salida:
// Me llamo Lucía
// Segunda línea
// Tengo 30 años y me gusta el café.</code></pre></div><h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Java distingue mayúsculas de minúsculas: <code>system.out.println</code> o <code>Println</code> no compilan. Es <code>System</code> y <code>println</code>.</li>
<li>Olvidar el <code>;</code> al final de la instrucción, o las comillas de cierre del texto.</li>
<li>Guardar el archivo con un nombre distinto al de la clase pública (<code>Saludo</code> debe estar en <code>Saludo.java</code>).</li>
<li>Con <code>printf</code>, olvidar <code>%n</code>: el siguiente texto queda pegado en la misma línea.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Instala el JDK, no solo el JRE.</li><li>El nombre del archivo es igual al de la clase pública.</li><li>Todo programa empieza en <code>main</code>.</li><li>Cada instrucción termina en <code>;</code>.</li><li>Las mayúsculas importan.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Hola Mundo</strong>: escribir un programa completo que imprima un saludo.</li>
<li><strong>Múltiples Líneas</strong>: imprimir dos líneas con dos <code>println</code>.</li>
<li><strong>Print vs Println</strong>: ver la diferencia entre ambos en una misma línea.</li>
<li><strong>Printf</strong>: mostrar una edad con un marcador <code>%d</code>.</li>
</ul>`
  },
  {
    id: 3, level: 'beginner', module: 1, title: 'Variables y Tipos Primitivos',
    description: 'Declaración de variables, 8 tipos primitivos y casting',
    duration: '35 min',
    content: `<h2>Variables y Tipos Primitivos</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un programa necesita recordar datos: un precio, un nombre, si el usuario inició sesión. Una <strong>variable</strong> es una "caja con etiqueta" en la memoria de la computadora: la etiqueta es su nombre y dentro guarda un valor.</p>
<p>Java exige que declares qué <strong>tipo</strong> de dato guardará cada caja. Así sabe cuánta memoria reservar y evita que, por error, guardes un texto donde va un número.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> En una tienda en línea, el precio, la cantidad en el carrito y el nombre del cliente son variables de distintos tipos.</div>
<h3>📖 Cómo funciona</h3>
<p>Declarar una variable tiene tres partes: <code>tipo nombre = valor;</code></p>
<p>Java tiene <strong>8 tipos primitivos</strong> (datos simples y básicos):</p>
<ul>
<li>Enteros: <code>byte</code>, <code>short</code>, <code>int</code> (el más usado, hasta 2147483647), <code>long</code> (para números enormes; el valor termina en <code>L</code>).</li>
<li>Decimales: <code>double</code> (el habitual) y <code>float</code> (menos preciso; el valor termina en <code>f</code>).</li>
<li>Un carácter: <code>char</code>, entre comillas simples: <code>'A'</code>.</li>
<li>Verdadero o falso: <code>boolean</code> (<code>true</code> o <code>false</code>).</li>
</ul>
<p><code>String</code> (texto entre comillas dobles) no es primitivo, pero lo usarás todo el tiempo. Se escribe con S mayúscula.</p>
<p>Para el nombre usa <code>camelCase</code>: empieza en minúscula y cada palabra nueva en mayúscula (<code>precioFinal</code>). Si el valor no debe cambiar nunca, usa <code>final</code> y escribe el nombre en MAYÚSCULAS: es una <strong>constante</strong>.</p><div class="code-block"><pre><code>public class Producto {
    public static void main(String[] args) {
        String nombre = "Cuaderno";
        int cantidad = 3;
        double precio = 4.5;
        boolean disponible = true;
        char categoria = 'P';
        final int MAXIMO = 10;

        System.out.println(nombre + " x" + cantidad);
        System.out.println("Precio: " + precio);
        System.out.println("Disponible: " + disponible);
        System.out.println("Categoría: " + categoria);
        System.out.println("Máximo por compra: " + MAXIMO);
    }
}
// Salida:
// Cuaderno x3
// Precio: 4.5
// Disponible: true
// Categoría: P
// Máximo por compra: 10</code></pre></div><p>El <strong>casting</strong> convierte un valor de un tipo a otro. De entero a decimal Java lo hace solo, porque no se pierde nada. De decimal a entero debes pedirlo con <code>(int)</code>, y los decimales se <em>truncan</em> (se cortan, no se redondean):</p><div class="code-block"><pre><code>public class Conversion {
    public static void main(String[] args) {
        int puntos = 8;
        double comoDecimal = puntos;
        double promedio = 7.8;
        int entero = (int) promedio;

        System.out.println(comoDecimal);
        System.out.println(entero);
    }
}
// Salida:
// 8.0
// 7</code></pre></div><h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Escribir <code>string</code> o <code>Int</code>: son <code>String</code> e <code>int</code>.</li>
<li>Usar comillas simples para un texto (<code>'Ana'</code>): las simples son para un solo <code>char</code>; el texto va con comillas dobles.</li>
<li>Asignar un decimal a un <code>int</code> sin casting: <code>int x = 9.99;</code> no compila.</li>
<li>Intentar cambiar una constante <code>final</code> después de darle valor.</li>
<li>Usar una variable sin haberle dado valor.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Usa <code>int</code> para enteros y <code>double</code> para decimales, salvo que haya un motivo.</li><li>Nombres de variables en <code>camelCase</code>, claros y descriptivos.</li><li>Valores fijos: <code>final</code> y MAYÚSCULAS.</li><li>El casting a <code>int</code> corta los decimales.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Var Int</strong>: declarar la variable entera <code>edad</code>.</li>
<li><strong>Var String</strong>: declarar la variable de texto <code>nombre</code>.</li>
<li><strong>Casting</strong>: convertir un <code>double</code> a <code>int</code>.</li>
<li><strong>PI Constante</strong>: declarar una constante <code>final</code>.</li>
</ul>`
  },
  {
    id: 4, level: 'beginner', module: 1, title: 'Operadores Aritméticos y Lógicos',
    description: 'Operadores matemáticos, lógicos y precedencia',
    duration: '30 min',
    content: `<h2>Operadores Aritméticos y Lógicos</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>operador</strong> es un símbolo que hace una operación con valores: sumar, comparar, combinar condiciones. Sin ellos, las variables solo guardarían datos sin hacer nada con ellos.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Calcular el total de una factura, saber si un número es par o comprobar que un usuario es mayor de edad <em>y</em> tiene cuenta activa son usos diarios de operadores.</div>
<h3>📖 Cómo funciona</h3>
<p><strong>Aritméticos:</strong> <code>+</code> suma, <code>-</code> resta, <code>*</code> multiplica, <code>/</code> divide y <code>%</code> (módulo) da el <em>resto</em> de una división. Ejemplo: <code>17 % 5</code> es 2, porque 17 = 5·3 + 2. Con módulo se detecta si un número es par: <code>n % 2</code> da 0.</p>
<p>Ojo: si divides dos enteros, el resultado también es entero y se pierde la parte decimal. <code>7 / 2</code> da 3, pero <code>7.0 / 2</code> da 3.5.</p>
<p><strong>Abreviaturas:</strong> <code>x += 5</code> equivale a <code>x = x + 5</code>, y <code>x++</code> suma 1.</p>
<p><strong>De comparación</strong> (el resultado es siempre un <code>boolean</code>): <code>==</code> igual, <code>!=</code> distinto, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>.</p>
<p><strong>Lógicos:</strong> combinan valores <code>boolean</code>. <code>&amp;&amp;</code> (Y) es verdadero solo si ambos lo son; <code>||</code> (O) lo es si al menos uno lo es; <code>!</code> (NO) invierte el valor.</p>
<p><strong>Precedencia:</strong> <code>*</code>, <code>/</code> y <code>%</code> se resuelven antes que <code>+</code> y <code>-</code>. Usa paréntesis para dejar claro tu orden.</p>
<p>El <strong>operador ternario</strong> es una mini decisión en una línea: <code>condición ? valorSiVerdadero : valorSiFalso</code>.</p><div class="code-block"><pre><code>public class Operadores {
    public static void main(String[] args) {
        int entradas = 7;
        int personas = 2;
        System.out.println(entradas / personas);
        System.out.println(entradas % personas);
        System.out.println(entradas / 2.0);
        System.out.println(2 + 3 * 4);
        System.out.println((2 + 3) * 4);

        int edad = 20;
        boolean tieneCuenta = true;
        boolean puede = (edad &gt;= 18) &amp;&amp; tieneCuenta;
        System.out.println(puede);
        System.out.println(!puede);

        String tipo = (entradas % 2 == 0) ? "par" : "impar";
        System.out.println(tipo);
    }
}
// Salida:
// 3
// 1
// 3.5
// 14
// 20
// true
// false
// impar</code></pre></div><h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Confundir <code>=</code> (asigna un valor) con <code>==</code> (compara).</li>
<li>Dividir enteros y esperar decimales: <code>1 / 2</code> da 0.</li>
<li>Escribir <code>&amp;</code> o <code>|</code> (una sola) cuando querías <code>&amp;&amp;</code> o <code>||</code>.</li>
<li>Comparar textos con <code>==</code>: para textos se usa <code>.equals(...)</code>, algo que verás más adelante.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li><code>=</code> asigna, <code>==</code> compara.</li><li>Entero entre entero da entero.</li><li><code>%</code> sirve para saber si algo es par o múltiplo de otro número.</li><li>Ante la duda, usa paréntesis.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Suma</strong>: sumar dos variables con <code>+</code>.</li>
<li><strong>Módulo</strong>: calcular el resto de 17 entre 2 con <code>%</code>.</li>
<li><strong>AND Lógico</strong>: combinar dos booleanos con <code>&amp;&amp;</code>.</li>
<li><strong>Ternario</strong>: elegir un texto según la edad con <code>? :</code>.</li>
</ul>`
  },
  {
    id: 5, level: 'beginner', module: 1, title: 'Entrada y Salida con Scanner',
    description: 'Leer datos del usuario desde la consola',
    duration: '25 min',
    content: `<h2>Entrada y Salida con Scanner</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Hasta ahora tus programas siempre hacen lo mismo. Con la <strong>entrada</strong> de datos, el programa le pregunta algo a la persona que lo usa y responde según lo que escriba. Java lo hace con la clase <code>Scanner</code>, que lee lo que se escribe en el teclado (la <em>consola</em>).</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Los programas de consola, como herramientas internas o scripts, piden datos con <code>Scanner</code>. Es también la base para entender cómo una aplicación recibe datos del usuario.</div>
<h3>📖 Cómo funciona</h3>
<p>Primero se importa la clase con <code>import java.util.Scanner;</code> (arriba de todo), y luego se crea un lector: <code>Scanner sc = new Scanner(System.in);</code>. <code>System.in</code> significa "el teclado".</p>
<p>Métodos principales: <code>nextLine()</code> lee una línea completa (con espacios), <code>next()</code> una sola palabra, <code>nextInt()</code> un entero y <code>nextDouble()</code> un decimal.</p><div class="code-block"><pre><code>import java.util.Scanner;

public class Compra {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Producto: ");
        String producto = sc.nextLine();
        System.out.print("Cantidad: ");
        int cantidad = sc.nextInt();
        System.out.print("Precio: ");
        double precio = sc.nextDouble();
        System.out.println(cantidad + " x " + producto + " = " + (cantidad * precio));
        sc.close();
    }
}
// Si escribes: Lápiz, 4 y 2.5
// Salida:
// Producto: Lápiz
// Cantidad: 4
// Precio: 2.5
// 4 x Lápiz = 10.0</code></pre></div><p><strong>Trampa clásica:</strong> <code>nextInt()</code> lee el número pero deja el salto de línea (Enter) sin consumir. Si luego llamas a <code>nextLine()</code>, lee ese salto vacío. La solución es agregar un <code>sc.nextLine()</code> extra que lo descarte.</p><div class="code-block"><pre><code>int numero = sc.nextInt();
sc.nextLine();                 // descarta el Enter que quedó
String frase = sc.nextLine();  // ahora sí lee la frase</code></pre></div><p><code>hasNextInt()</code> responde <code>true</code> si lo siguiente es un entero. Sirve para validar antes de leer, junto con <code>if/else</code> ("si... si no", lección 7):</p><div class="code-block"><pre><code>if (sc.hasNextInt()) {
    int cantidad = sc.nextInt();
} else {
    System.out.println("Eso no es un número");
}</code></pre></div><p>Cuando termines, <code>sc.close()</code> libera el recurso. La forma moderna es <code>try (Scanner sc = new Scanner(System.in)) { ... }</code>: lo cierra solo al terminar el bloque. Y si necesitas repetir una lectura, <code>do { ... } while (condición);</code> ejecuta el bloque una vez y repite mientras la condición sea verdadera (lección 9).</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Olvidar el <code>import java.util.Scanner;</code>.</li>
<li>Usar <code>nextLine()</code> justo después de <code>nextInt()</code> sin descartar el Enter.</li>
<li>Escribir texto cuando el programa espera un número: lanza un error (<code>InputMismatchException</code>).</li>
<li>Según el idioma configurado en tu computadora, <code>nextDouble()</code> puede esperar coma (<code>2,5</code>) en lugar de punto.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Muestra siempre un <code>print</code> que diga qué dato esperas.</li><li><code>nextLine()</code> para frases, <code>nextInt()</code> y <code>nextDouble()</code> para números.</li><li>Valida con <code>hasNextInt()</code> cuando no confíes en la entrada.</li><li>Cierra el <code>Scanner</code>.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Scanner Leer Int</strong>, <strong>Leer String</strong> y <strong>Leer Double</strong>: leer un entero, un texto y un decimal.</li>
<li><strong>Scanner Múltiples Datos</strong>: leer nombre y edad.</li>
<li><strong>Scanner Validar Entrada</strong>: comprobar con <code>hasNextInt</code>.</li>
<li><strong>Scanner en Bucle</strong>: repetir la lectura hasta que escriban 0.</li>
<li><strong>Scanner Cerrar</strong> y <strong>Try-With-Resources</strong>: cerrar el <code>Scanner</code> de dos maneras.</li>
</ul>`
  },
  {
    id: 6, level: 'beginner', module: 2, title: 'Bucles - Parte 1',
    description: 'Bucle for y for-each',
    duration: '35 min',
    content: `<h2>Bucles - Parte 1</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>bucle</strong> repite un bloque de código varias veces sin que lo copies. Si quieres mostrar los números del 1 al 1000, no escribes mil líneas: escribes un bucle. Es como una receta que dice "bate los huevos 20 veces" en lugar de repetir la instrucción 20 veces.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Recorrer los productos de un carrito para sumar el total, o procesar cada línea de un archivo, se hace con bucles.</div>
<h3>📖 Cómo funciona</h3>
<p>El bucle <code>for</code> se usa cuando sabes cuántas veces repetir. Tiene tres partes entre paréntesis, separadas por <code>;</code>:</p>
<ol>
<li><strong>Inicio:</strong> <code>int i = 1</code> crea el contador y le da su valor inicial.</li>
<li><strong>Condición:</strong> <code>i &lt;= 3</code>. Antes de cada vuelta se revisa: si es verdadera, el bloque se ejecuta; si es falsa, el bucle termina.</li>
<li><strong>Actualización:</strong> <code>i++</code> se ejecuta al final de cada vuelta y suma 1 al contador.</li>
</ol><div class="code-block"><pre><code>public class Vueltas {
    public static void main(String[] args) {
        for (int i = 1; i &lt;= 3; i++) {
            System.out.println("Vuelta " + i);
        }

        int suma = 0;
        for (int n = 2; n &lt;= 10; n += 2) {
            suma += n;
        }
        System.out.println("Suma de pares: " + suma);
    }
}
// Salida:
// Vuelta 1
// Vuelta 2
// Vuelta 3
// Suma de pares: 30</code></pre></div><p>En el segundo bucle, <code>n += 2</code> avanza de dos en dos (2, 4, 6, 8, 10), y <code>suma</code> acumula cada valor. Para ir hacia atrás usarías <code>i--</code> con una condición como <code>i &gt;= 1</code>.</p>
<p><strong>Bucles anidados:</strong> un bucle dentro de otro. Por cada vuelta del externo, el interno da todas las suyas. Por eso se usan nombres de contador distintos (<code>fila</code>, <code>col</code>).</p>
<p>Un <strong>array</strong> es una lista de tamaño fijo de valores del mismo tipo: <code>String[] frutas = {"pera", "uva"};</code>. Cada valor tiene una posición que <em>empieza en 0</em>, y <code>frutas.length</code> dice cuántos hay. El <strong>for-each</strong> recorre un array sin manejar posiciones: se lee "para cada fruta en frutas".</p><div class="code-block"><pre><code>public class Recorridos {
    public static void main(String[] args) {
        String[] frutas = {"pera", "uva", "kiwi"};
        for (String fruta : frutas) {
            System.out.println(fruta);
        }

        for (int fila = 1; fila &lt;= 3; fila++) {
            for (int col = 1; col &lt;= fila; col++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}
// Salida:
// pera
// uva
// kiwi
// *
// **
// ***</code></pre></div><h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Error "por uno": con un array de 3 elementos, usar <code>i &lt;= frutas.length</code> intenta leer la posición 3, que no existe, y falla con <code>ArrayIndexOutOfBoundsException</code>. Debe ser <code>&lt;</code>.</li>
<li>Poner <code>;</code> justo después del <code>for (...)</code>: el bucle queda vacío y tu bloque se ejecuta una sola vez.</li>
<li>Una condición que nunca se vuelve falsa (por ejemplo, restar con <code>i--</code> en un bucle <code>i &lt; 10</code>) crea un bucle infinito.</li>
<li>Usar el contador fuera del bucle: solo existe dentro del <code>for</code>.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Usa <code>for</code> cuando conoces el número de vueltas.</li><li>Usa for-each para recorrer un array completo.</li><li>Las posiciones de un array empiezan en 0.</li><li>Comprueba que la condición pueda volverse falsa.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>For Descendente</strong>: imprimir del 10 al 1.</li>
<li><strong>For-Each Array</strong>: recorrer un array de enteros con for-each.</li>
<li><strong>Bucle Anidado Tabla</strong>: imprimir las tablas del 2 y del 3 con dos bucles anidados.</li>
</ul>`
  },
  {
    id: 7, level: 'beginner', module: 2, title: 'Estructuras Condicionales if-else',
    description: 'Toma de decisiones y control de flujo',
    duration: '35 min',
    content: `<h2>Estructuras Condicionales if-else</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Los programas deben tomar decisiones: "si llueve, llevo paraguas; si no, no". Una <strong>condicional</strong> ejecuta un bloque de código solo cuando una condición se cumple. Sin ellas, un programa haría siempre lo mismo.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Validar que una contraseña sea correcta, aplicar un descuento solo a ciertos clientes o decidir qué mensaje de error mostrar son decisiones con <code>if</code>.</div>
<h3>📖 Cómo funciona</h3>
<p>La <strong>condición</strong> va entre paréntesis y debe dar <code>true</code> o <code>false</code> (por eso se usan los operadores de comparación y lógicos de la lección 4). Si es verdadera, se ejecuta el bloque entre llaves.</p>
<p><code>else</code> es el camino alternativo ("si no"). Y <code>else if</code> permite encadenar varias opciones: Java revisa las condiciones <em>de arriba abajo</em> y ejecuta solo el primer bloque cuya condición sea verdadera.</p><div class="code-block"><pre><code>public class Entrada {
    public static void main(String[] args) {
        int edad = 15;
        double precio;

        if (edad &lt; 12) {
            precio = 0;
        } else if (edad &lt; 18) {
            precio = 5.5;
        } else {
            precio = 10;
        }
        System.out.println("Precio: " + precio);

        boolean conInvitacion = true;
        if (edad &gt;= 18 || conInvitacion) {
            System.out.println("Puede pasar");
        } else {
            System.out.println("No puede pasar");
        }
    }
}
// Salida:
// Precio: 5.5
// Puede pasar</code></pre></div><p>Fíjate en el orden: primero se prueba <code>edad &lt; 12</code>. Si fuera falsa, se prueba <code>edad &lt; 18</code>. Como 15 es menor que 18, se elige 5.5 y se ignora el resto.</p>
<p>También puedes poner un <code>if</code> dentro de otro (condicionales anidadas), pero si te pierdes entre llaves, a menudo es más claro combinar condiciones con <code>&amp;&amp;</code>.</p><div class="code-block"><pre><code>int hora = 10;
boolean abierto = false;
if (hora &gt;= 9 &amp;&amp; hora &lt; 18) {
    abierto = true;
}</code></pre></div><h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Escribir <code>if (x = 5)</code> en vez de <code>if (x == 5)</code>: con un <code>int</code> ni siquiera compila, porque <code>=</code> asigna y no compara.</li>
<li>Poner <code>;</code> después del paréntesis: <code>if (x &gt; 0);</code> deja el bloque vacío y el código de abajo se ejecuta siempre.</li>
<li>Ordenar mal un <code>else if</code>: si pruebas <code>nota &gt;= 50</code> antes que <code>nota &gt;= 90</code>, nadie llega al caso del 90.</li>
<li>Omitir las llaves: funciona con una sola instrucción, pero provoca errores cuando agregas más líneas.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Usa siempre llaves, aunque haya una sola línea.</li><li>Ordena las condiciones de la más específica a la más general.</li><li>Compara con <code>==</code>, nunca con <code>=</code>.</li><li>Indenta 4 espacios dentro de cada bloque.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>If simple</strong>: imprimir <code>P</code> si <code>x</code> es mayor que 0.</li>
<li><strong>If-Else Par</strong>: decidir si un número es par o impar.</li>
<li><strong>Else If Nota</strong>: asignar la nota A, B o F con <code>else if</code>.</li>
<li><strong>Condición Compleja</strong>: escribir una condición con <code>&amp;&amp;</code>, <code>||</code> y paréntesis.</li>
</ul>`
  },
  {
    id: 8, level: 'beginner', module: 2, title: 'Switch Moderno',
    description: 'Selección múltiple con switch tradicional y moderno',
    duration: '30 min',
    content: `<h2>Switch Moderno</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Cuando tienes que comparar <em>una misma variable</em> con muchos valores posibles (el número de un mes, un código, un comando), una cadena larga de <code>else if</code> se vuelve pesada. <code>switch</code> lo expresa como un menú: "según el valor de esto, haz aquello".</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Un programa que interpreta códigos de respuesta, opciones de un menú o tipos de documento suele usar <code>switch</code>.</div>
<h3>📖 Cómo funciona</h3>
<p><strong>Forma tradicional.</strong> Cada <code>case</code> es un valor posible, <code>default</code> cubre "cualquier otro" y <code>break</code> termina el caso. Si olvidas el <code>break</code>, Java sigue ejecutando el siguiente <code>case</code> (<em>fall-through</em>, "caída"). A veces se hace a propósito para agrupar valores.</p><div class="code-block"><pre><code>public class Meses {
    public static void main(String[] args) {
        int mes = 4;
        switch (mes) {
            case 4:
            case 6:
            case 9:
            case 11:
                System.out.println("30 días");
                break;
            case 2:
                System.out.println("28 o 29 días");
                break;
            default:
                System.out.println("31 días");
        }
    }
}
// Salida: 30 días</code></pre></div><p>Funciona con enteros, <code>char</code> y también con <code>String</code>, por ejemplo <code>case "rojo":</code>.</p>
<p><strong>Forma moderna</strong> (Java 14 en adelante). Usa una flecha <code>-&gt;</code>: no necesita <code>break</code>, no hay fall-through y puedes agrupar valores con comas (<code>case 4, 6 -&gt;</code>). Además, el <code>switch</code> puede <em>devolver un valor</em> y guardarse en una variable (esto se llama <em>switch expression</em>). Si un caso necesita varias líneas, usa un bloque <code>{ }</code> y devuelve el valor con <code>yield</code>.</p><div class="code-block"><pre><code>public class Estados {
    public static void main(String[] args) {
        int codigo = 404;
        String estado = switch (codigo) {
            case 200 -&gt; "Correcto";
            case 404 -&gt; "No encontrado";
            case 500, 503 -&gt; "Error del servidor";
            default -&gt; "Desconocido";
        };
        System.out.println(estado);

        String tipo = switch (codigo / 100) {
            case 2 -&gt; "Éxito";
            case 4 -&gt; {
                System.out.println("Revisando error del cliente");
                yield "Cliente";
            }
            default -&gt; "Otro";
        };
        System.out.println(tipo);
    }
}
// Salida:
// No encontrado
// Revisando error del cliente
// Cliente</code></pre></div><p>Cuando el <code>switch</code> devuelve un valor, tiene que cubrir todos los casos posibles, por eso se agrega un <code>default</code>.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Olvidar el <code>break</code> en la forma tradicional: se ejecutan también los casos de abajo.</li>
<li>Mezclar <code>:</code> y <code>-&gt;</code> en el mismo <code>switch</code>: no está permitido.</li>
<li>Usar <code>switch</code> para rangos (<code>edad &gt; 18</code>): para eso sirve <code>if</code>.</li>
<li>Repetir el mismo valor en dos <code>case</code>: no compila.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Incluye siempre un <code>default</code>.</li><li>En la forma tradicional, cierra cada caso con <code>break</code> salvo que quieras agrupar.</li><li>Prefiere la flecha <code>-&gt;</code> en código nuevo.</li><li>Usa <code>yield</code> solo dentro de un bloque de un <code>switch</code> que devuelve valor.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Switch Día Semana</strong>: imprimir el día según un número, con <code>break</code>.</li>
<li><strong>Switch sin Break</strong>: agrupar casos con fall-through intencional.</li>
<li><strong>Switch con String</strong>: evaluar un texto.</li>
<li><strong>Switch Expression</strong>: asignar un valor con <code>-&gt;</code>.</li>
<li><strong>Switch Expression Yield</strong>: devolver un valor desde un bloque con <code>yield</code>.</li>
</ul>`
  },
  {
    id: 9, level: 'beginner', module: 2, title: 'Bucles While y Do-While',
    description: 'Iteración basada en condiciones',
    duration: '30 min',
    content: `<h2>Bucles While y Do-While</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>El <code>for</code> es ideal cuando sabes cuántas vueltas dar. Pero a veces no lo sabes: "repite <em>mientras</em> no llegue a la meta". Para eso existen <code>while</code> y <code>do-while</code>: repiten un bloque <strong>mientras una condición sea verdadera</strong>.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Pedir una contraseña hasta que sea correcta, reintentar una conexión o procesar datos hasta que se acaben son casos típicos.</div>
<h3>📖 Cómo funciona</h3>
<p><strong>while:</strong> primero revisa la condición y luego ejecuta. Si la condición es falsa desde el principio, el bloque no se ejecuta ni una vez. Dentro del bloque debes hacer algo que, tarde o temprano, vuelva falsa la condición.</p><div class="code-block"><pre><code>public class Cuenta {
    public static void main(String[] args) {
        int ahorro = 100;
        int meses = 0;
        while (ahorro &lt; 1000) {
            ahorro *= 2;
            meses++;
        }
        System.out.println("Meses: " + meses);
        System.out.println("Ahorro: " + ahorro);

        int fuego = 3;
        while (fuego &gt; 3) {
            System.out.println("Esto no se imprime");
            fuego--;
        }
    }
}
// Salida:
// Meses: 4
// Ahorro: 1600</code></pre></div><p>Paso a paso: el ahorro va 100, 200, 400, 800, 1600. Cuando llega a 1600 la condición <code>ahorro &lt; 1000</code> es falsa y el bucle termina. El segundo <code>while</code> nunca entra, porque <code>3 &gt; 3</code> es falso desde el inicio.</p>
<p><strong>do-while:</strong> primero ejecuta el bloque y <em>después</em> revisa la condición. Garantiza al menos una vuelta. Observa el <code>;</code> final.</p><div class="code-block"><pre><code>public class AlMenosUna {
    public static void main(String[] args) {
        int n = 10;
        do {
            System.out.println("Se ejecuta una vez, n vale " + n);
            n++;
        } while (n &lt; 5);
    }
}
// Salida: Se ejecuta una vez, n vale 10</code></pre></div><p>Aunque <code>n &lt; 5</code> es falso, el bloque corre una vez antes de comprobarlo. Es perfecto para menús o para pedir un dato al usuario (con <code>Scanner</code>) y repetir si es inválido.</p>
<p>Una regla práctica: si repites un número conocido de veces, usa <code>for</code>; si repites hasta que ocurra algo, usa <code>while</code>; si necesitas ejecutar al menos una vez, usa <code>do-while</code>.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li><strong>Bucle infinito:</strong> olvidar el <code>i++</code> (o lo que cambie la condición). Si tu programa no termina, detenlo con Ctrl + C.</li>
<li>Poner la condición al revés: <code>while (i &gt; 5)</code> cuando querías <code>i &lt;= 5</code>.</li>
<li>Olvidar el <code>;</code> después del <code>while (...)</code> en un <code>do-while</code>.</li>
<li>Poner un <code>;</code> justo después del <code>while (...)</code> normal: el bucle queda vacío.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Inicializa antes del bucle la variable que usa la condición.</li><li>Dentro del bucle, cambia esa variable.</li><li><code>while</code> puede no ejecutarse nunca; <code>do-while</code> corre al menos una vez.</li><li>Revisa mentalmente la última vuelta para evitar errores por uno.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>While 1 a 5</strong>: imprimir del 1 al 5 con <code>while</code>.</li>
<li><strong>Do-While</strong>: ejecutar un bloque al menos una vez con <code>do-while</code>.</li>
<li><strong>Suma con While</strong>: sumar del 1 al 100 con <code>while</code> y <code>+=</code>.</li>
</ul>`
  },
  {
    id: 10, level: 'beginner', module: 2, title: 'Break, Continue y Etiquetas',
    description: 'Control fino de bucles',
    duration: '25 min',
    content: `<h2>Break, Continue y Etiquetas</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>A veces un bucle debe salirse antes de tiempo ("ya encontré lo que buscaba") o saltarse una vuelta ("este dato no me sirve"). <code>break</code> y <code>continue</code> te dan ese control fino sobre los bucles que ya conoces.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Al buscar un cliente en una lista, dejas de buscar cuando lo encuentras (<code>break</code>); al procesar registros, omites los que están vacíos (<code>continue</code>).</div>
<h3>📖 Cómo funciona</h3>
<ul>
<li><code>break</code> termina el bucle de inmediato. El programa sigue con la primera línea después del bucle.</li>
<li><code>continue</code> abandona solo la vuelta actual y salta a la siguiente.</li>
</ul><div class="code-block"><pre><code>public class Busqueda {
    public static void main(String[] args) {
        for (int n = 1; n &lt;= 50; n++) {
            if (n % 4 == 0 &amp;&amp; n % 6 == 0) {
                System.out.println("Primer múltiplo común: " + n);
                break;
            }
        }

        for (int i = 1; i &lt;= 7; i++) {
            if (i % 3 == 0) {
                continue;
            }
            System.out.println(i);
        }
    }
}
// Salida:
// Primer múltiplo común: 12
// 1
// 2
// 4
// 5
// 7</code></pre></div><p>En el primer bucle, al llegar a 12 se imprime y <code>break</code> corta todo: no se prueban 13 ni los siguientes. En el segundo, cuando <code>i</code> es 3 o 6, <code>continue</code> se salta el <code>println</code> y pasa a la siguiente vuelta.</p>
<p><strong>Etiquetas.</strong> Dentro de dos bucles anidados, <code>break</code> solo sale del bucle <em>más interno</em>. Si quieres salir de ambos, le pones un nombre (etiqueta) al bucle externo, terminado en <code>:</code>, y usas <code>break nombre;</code>. También existe <code>continue nombre;</code>, que salta a la siguiente vuelta del bucle etiquetado.</p><div class="code-block"><pre><code>public class Parejas {
    public static void main(String[] args) {
        externo:
        for (int a = 1; a &lt;= 5; a++) {
            for (int b = 1; b &lt;= 5; b++) {
                if (a * b == 12) {
                    System.out.println(a + " x " + b + " = 12");
                    break externo;
                }
            }
        }
        System.out.println("Fin");
    }
}
// Salida:
// 3 x 4 = 12
// Fin</code></pre></div><p>Sin la etiqueta, el <code>break</code> solo saldría del bucle de <code>b</code> y el de <code>a</code> seguiría buscando más parejas. Las etiquetas son poco comunes: úsalas solo cuando de verdad simplifiquen.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Usar <code>continue</code> en un <code>while</code> antes de actualizar el contador: la variable no cambia y el bucle se vuelve infinito.</li>
<li>Creer que <code>break</code> sale de todos los bucles anidados: solo sale del más interno.</li>
<li>Llenar el bucle de <code>break</code> y <code>continue</code>: se vuelve difícil de seguir. Si la condición del bucle puede expresarse mejor, hazlo.</li>
<li>Poner código después de <code>break</code> o <code>continue</code> en el mismo bloque: nunca se ejecuta y el compilador lo rechaza.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li><code>break</code> sale del bucle; <code>continue</code> salta a la siguiente vuelta.</li><li>Ambos suelen ir dentro de un <code>if</code>.</li><li>Etiquetas solo para salir de bucles anidados.</li><li>En un <code>while</code>, actualiza el contador antes de <code>continue</code>.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Break en Bucle</strong>: salir de un <code>for</code> cuando <code>i</code> vale 5.</li>
<li><strong>Continue en Bucle</strong>: saltar los números pares con <code>continue</code>.</li>
</ul>`
  },
  {
    id: 11, level: 'beginner', module: 3, title: 'Arrays Unidimensionales',
    description: 'Colecciones fijas de elementos',
    duration: '35 min',
    content: `<h2>Arrays Unidimensionales</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Imagina que necesitas guardar las notas de 30 alumnos. Crear 30 variables (<code>nota1</code>, <code>nota2</code>, <code>nota3</code>…) sería agotador. Un <strong>array</strong> resuelve esto: es una colección de valores <strong>del mismo tipo</strong> guardados bajo un solo nombre y con un <strong>tamaño fijo</strong>.</p>
<p>Piensa en una fila de casilleros numerados: todos tienen el mismo tamaño, cada uno guarda un valor (un <strong>elemento</strong>) y el número del casillero se llama <strong>índice</strong>. Atención: el primer casillero es el número <strong>0</strong>, no el 1.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Un programa que guarda los precios de un carrito de compras, las temperaturas de la semana o los puntajes de un juego usa arrays (o estructuras construidas sobre ellos).</div>
<h3>📖 Cómo funciona</h3>
<p><strong>1. Crear un array.</strong> Hay dos formas. Con <code>new</code> indicas el tamaño y Java rellena con valores por defecto (<code>0</code> en números, <code>false</code> en booleanos, <code>null</code> en objetos). Con llaves <code>{}</code> escribes los valores directamente. Para leer o cambiar un elemento usas <code>nombre[índice]</code>, y <code>length</code> (sin paréntesis) te dice cuántos elementos hay.</p>
<div class="code-block"><pre><code>public class Temperaturas {
    public static void main(String[] args) {
        double[] temps = new double[3];   // 3 casilleros, todos en 0.0
        temps[0] = 21.5;
        temps[1] = 19.0;
        temps[2] = 23.8;
        System.out.println("Primera: " + temps[0]);
        System.out.println("Cantidad: " + temps.length);

        int[] vacio = new int[4];
        System.out.println("Valor por defecto: " + vacio[0]);
    }
}

// Salida:
// Primera: 21.5
// Cantidad: 3
// Valor por defecto: 0</code></pre></div>
<p><strong>2. Recorrer un array.</strong> Con un <code>for</code> usas el índice (útil si lo necesitas). Con <code>for-each</code> (<code>for (tipo x : array)</code>) recibes cada valor directamente, sin índice.</p>
<div class="code-block"><pre><code>public class Semana {
    public static void main(String[] args) {
        String[] dias = {"Lunes", "Martes", "Miercoles"};
        for (int i = 0; i &lt; dias.length; i++) {
            System.out.println(i + " -&gt; " + dias[i]);
        }
        for (String d : dias) {
            System.out.println("Hoy es " + d);
        }
    }
}

// Salida:
// 0 -&gt; Lunes
// 1 -&gt; Martes
// 2 -&gt; Miercoles
// Hoy es Lunes
// Hoy es Martes
// Hoy es Miercoles</code></pre></div>
<p>Fíjate en la condición <code>i &lt; dias.length</code>: el último índice válido es <code>length - 1</code>.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li><strong>Pensar que empieza en 1.</strong> En un array de 3 elementos los índices son 0, 1 y 2.</li>
<li><strong>Salirte del rango.</strong> Con <code>int[] a = {4, 5, 6};</code>, escribir <code>a[3]</code> lanza <code>ArrayIndexOutOfBoundsException</code> al ejecutar.</li>
<li><strong>Escribir <code>length()</code>.</strong> En arrays es <code>length</code> sin paréntesis (en los Strings sí lleva paréntesis; lo verás pronto).</li>
<li><strong>Querer agrandarlo.</strong> El tamaño no cambia nunca; si necesitas más espacio, creas otro array.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3><ul><li>El primer índice es 0 y el último es <code>length - 1</code>.</li><li>Todos los elementos son del mismo tipo.</li><li>Usa <code>for</code> si necesitas el índice y <code>for-each</code> si solo necesitas los valores.</li><li>Un array nuevo con <code>new</code> nunca está "vacío": trae valores por defecto.</li></ul><h3>🧪 Lo que vas a practicar</h3><ul><li><strong>Declarar Array:</strong> crear un array de 5 enteros.</li><li><strong>Inicializar Array:</strong> crear un array con valores dados.</li><li><strong>Acceder Elemento / Modificar Elemento:</strong> leer y cambiar posiciones.</li><li><strong>Longitud Array:</strong> imprimir el tamaño con <code>length</code>.</li><li><strong>Recorrer Array / Suma Array:</strong> recorrer y acumular.</li><li><strong>Máximo en Array:</strong> encontrar el mayor valor.</li></ul>`
  },
  {
    id: 12, level: 'beginner', module: 3, title: 'Arrays Multidimensionales',
    description: 'Matrices y tablas',
    duration: '30 min',
    content: `<h2>Arrays Multidimensionales</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>A veces los datos forman una <strong>tabla</strong>: filas y columnas, como una hoja de cálculo o un tablero de ajedrez. Para eso Java permite un <strong>array de arrays</strong>, llamado <strong>matriz</strong> (o array bidimensional). Cada elemento se ubica con <strong>dos índices</strong>: primero la fila y luego la columna.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Las matrices se usan para tableros de juegos (tres en raya, buscaminas), tablas de notas por alumno y materia, o los píxeles de una imagen.</div>
<h3>📖 Cómo funciona</h3>
<p>Se declara con dos pares de corchetes. <code>new int[2][3]</code> crea 2 filas y 3 columnas, con ceros al inicio. También puedes escribir los valores con llaves anidadas: cada par de llaves interior es una fila. El acceso es <code>matriz[fila][columna]</code>, y ambos índices empiezan en 0.</p>
<div class="code-block"><pre><code>public class Asientos {
    public static void main(String[] args) {
        int[][] sala = new int[2][3];   // 2 filas, 3 columnas
        sala[0][1] = 7;
        sala[1][2] = 9;
        System.out.println("Fila 0, columna 1: " + sala[0][1]);
        System.out.println("Filas: " + sala.length);
        System.out.println("Columnas: " + sala[0].length);
    }
}

// Salida:
// Fila 0, columna 1: 7
// Filas: 2
// Columnas: 3</code></pre></div>
<p><code>sala.length</code> cuenta las filas. <code>sala[0].length</code> cuenta las columnas de la fila 0, porque cada fila es en sí un array.</p>
<p><strong>Recorrer una matriz.</strong> Se usa un <strong>bucle anidado</strong>: un <code>for</code> dentro de otro. El externo avanza fila por fila y, por cada fila, el interno recorre sus columnas.</p>
<div class="code-block"><pre><code>public class NotasAlumnos {
    public static void main(String[] args) {
        int[][] notas = {
            {8, 6, 9},
            {7, 7, 10}
        };
        for (int f = 0; f &lt; notas.length; f++) {
            int suma = 0;
            for (int c = 0; c &lt; notas[f].length; c++) {
                suma += notas[f][c];
            }
            System.out.println("Alumno " + f + ": suma " + suma);
        }
    }
}

// Salida:
// Alumno 0: suma 23
// Alumno 1: suma 24</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li><strong>Invertir fila y columna.</strong> <code>m[1][0]</code> es la fila 1, columna 0; no es lo mismo que <code>m[0][1]</code>.</li>
<li><strong>Usar el mismo límite en ambos bucles.</strong> El externo usa <code>m.length</code>; el interno usa <code>m[f].length</code>.</li>
<li><strong>Olvidar que empieza en 0.</strong> Una matriz 2x2 tiene índices 0 y 1; <code>m[2][2]</code> da <code>ArrayIndexOutOfBoundsException</code>.</li>
<li><strong>Confundir las llaves.</strong> En <code>{{1, 2}, {3, 4}}</code> hay una llave exterior y una por cada fila.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3><ul><li>Primero la fila, después la columna: <code>m[fila][columna]</code>.</li><li>Filas con <code>m.length</code>; columnas con <code>m[fila].length</code>.</li><li>Una matriz se recorre con dos <code>for</code> anidados.</li><li>Haz un dibujo de la tabla en papel antes de programar.</li></ul><h3>🧪 Lo que vas a practicar</h3><ul><li><strong>Matriz 2x2:</strong> declarar una matriz de 2 filas y 2 columnas.</li><li><strong>Inicializar Matriz:</strong> crearla con valores entre llaves.</li><li><strong>Acceder Matriz:</strong> imprimir el elemento de la fila 1, columna 0.</li><li><strong>Recorrer Matriz:</strong> imprimir todos los elementos con bucles anidados.</li></ul>`
  },
  {
    id: 13, level: 'beginner', module: 3, title: 'Strings y Texto',
    description: 'Clase String e inmutabilidad',
    duration: '40 min',
    content: `<h2>Strings y Texto</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>String</strong> es una cadena de caracteres: un texto como un nombre, un correo o una frase. Se escribe entre comillas dobles: <code>"Hola"</code>. Casi todo programa maneja texto, y <code>String</code> trae muchas herramientas para trabajar con él.</p>
<p>Esas herramientas se llaman <strong>métodos</strong>: acciones que se piden al texto con un punto, como <code>texto.length()</code>. Más adelante verás cómo crear los tuyos.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Validar que un correo contenga una arroba, pasar un nombre a mayúsculas o cortar un código de producto son tareas diarias con Strings.</div>
<h3>📖 Cómo funciona</h3>
<p>Los caracteres se numeran desde 0, igual que en un array. Los métodos más usados: <code>length()</code> (cantidad de caracteres), <code>charAt(i)</code> (carácter en la posición i), <code>toUpperCase()</code> / <code>toLowerCase()</code>, <code>substring(inicio, fin)</code> (el <code>fin</code> <strong>no</strong> se incluye) y el operador <code>+</code> para unir textos.</p>
<div class="code-block"><pre><code>public class Texto {
    public static void main(String[] args) {
        String lenguaje = "Java";
        System.out.println(lenguaje.length());
        System.out.println(lenguaje.charAt(0));
        System.out.println(lenguaje.toLowerCase());
        System.out.println(lenguaje.substring(1, 3));
        System.out.println(lenguaje + " 21");
    }
}

// Salida:
// 4
// J
// java
// av
// Java 21</code></pre></div>
<p><strong>Inmutabilidad.</strong> Un String <strong>nunca cambia</strong> una vez creado. Los métodos como <code>toUpperCase()</code> devuelven un texto <em>nuevo</em>; si no lo guardas, el original sigue igual.</p>
<p><strong>Comparar.</strong> Para saber si dos textos tienen el mismo contenido usa <code>equals</code>. El operador <code>==</code> compara si son el mismo objeto en memoria, y puede dar <code>false</code> aunque el texto sea idéntico.</p>
<div class="code-block"><pre><code>public class Comparacion {
    public static void main(String[] args) {
        String nombre = "ana";
        nombre.toUpperCase();                  // el resultado se pierde
        System.out.println(nombre);
        nombre = nombre.toUpperCase();         // ahora si lo guardamos
        System.out.println(nombre);

        String a = "hola";
        String b = new String("hola");         // una copia nueva
        System.out.println(a == b);
        System.out.println(a.equals(b));
    }
}

// Salida:
// ana
// ANA
// false
// true</code></pre></div>
<p><strong>Text blocks.</strong> Desde Java 15, un texto de varias líneas se escribe entre tres comillas dobles <code>"""</code>. Comienza en la línea siguiente a la apertura y conserva los saltos de línea.</p>
<div class="code-block"><pre><code>public class Menu {
    public static void main(String[] args) {
        String carta = """
            Menu del dia
            Sopa
            """;
        System.out.print(carta);
    }
}

// Salida:
// Menu del dia
// Sopa</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li><strong>Comparar con <code>==</code>.</strong> Usa siempre <code>equals</code>.</li>
<li><strong>Olvidar guardar el resultado.</strong> <code>texto.toUpperCase();</code> solo no cambia <code>texto</code>.</li>
<li><strong>Escribir <code>length</code> sin paréntesis.</strong> En Strings es <code>length()</code>.</li>
<li><strong>Pasarte en <code>substring</code>.</strong> Si el índice supera la longitud, falla con <code>StringIndexOutOfBoundsException</code>.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3><ul><li>Compara contenido con <code>equals</code>, nunca con <code>==</code>.</li><li>Los Strings son inmutables: guarda el resultado de cada método.</li><li>En <code>substring(inicio, fin)</code> el final no se incluye.</li><li>Los índices de un String empiezan en 0.</li></ul><h3>🧪 Lo que vas a practicar</h3><ul><li><strong>Longitud String:</strong> imprimir la longitud de un texto.</li><li><strong>Concatenar Strings:</strong> unir dos textos con <code>+</code>.</li><li><strong>Mayúsculas:</strong> convertir a mayúsculas con <code>toUpperCase</code>.</li><li><strong>Substring:</strong> extraer un trozo de un texto.</li><li><strong>Comparar Strings:</strong> verificar igualdad con <code>equals</code>.</li><li><strong>Text Blocks:</strong> escribir un texto multilínea con <code>"""</code>.</li></ul>`
  },
  {
    id: 14, level: 'beginner', module: 3, title: 'StringBuilder',
    description: 'Manipulación eficiente de cadenas mutables',
    duration: '25 min',
    content: `<h2>StringBuilder</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>En la lección anterior viste que un <code>String</code> es <strong>inmutable</strong>: cada vez que "modificas" un texto, Java crea uno nuevo. Si armas un texto largo uniendo piezas dentro de un bucle, se crean cientos de textos intermedios que se tiran a la basura.</p>
<p><code>StringBuilder</code> es un texto <strong>mutable</strong>: se modifica a sí mismo. Es como escribir en una pizarra y borrar o agregar, en lugar de reescribir toda la hoja en cada cambio.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Se usa para construir reportes, mensajes de registro (logs) o consultas de texto que se arman pieza por pieza dentro de bucles.</div>
<h3>📖 Cómo funciona</h3>
<p>Se crea con <code>new StringBuilder()</code>. El método <code>append(...)</code> agrega al final y devuelve el mismo objeto, así que puedes encadenar llamadas. Al terminar, <code>toString()</code> te da el resultado como <code>String</code>.</p>
<div class="code-block"><pre><code>public class Numeros {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i &lt;= 5; i++) {
            sb.append(i);
            if (i &lt; 5) {
                sb.append("-");
            }
        }
        String resultado = sb.toString();
        System.out.println(resultado);
        System.out.println(sb.length());
    }
}

// Salida:
// 1-2-3-4-5
// 9</code></pre></div>
<p>Otros métodos útiles: <code>insert(posición, texto)</code> agrega en el medio, <code>reverse()</code> invierte, <code>deleteCharAt(posición)</code> borra un carácter y <code>length()</code> cuenta los caracteres.</p>
<div class="code-block"><pre><code>public class Editar {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("Mundo");
        sb.insert(0, "Hola ").append("!");
        System.out.println(sb);
        sb.deleteCharAt(sb.length() - 1);
        System.out.println(sb);
        sb.reverse();
        System.out.println(sb);
    }
}

// Salida:
// Hola Mundo!
// Hola Mundo
// odnuM aloH</code></pre></div>
<p>Observa que <code>sb.insert(0, "Hola ").append("!")</code> encadena dos llamadas sobre el mismo objeto. A diferencia de lo que pasa con un <code>String</code>, aquí no hace falta guardar el resultado: el propio <code>sb</code> cambia.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li><strong>Usar <code>+</code> dentro de bucles largos.</strong> Para pocas uniones está bien; para muchas, usa <code>StringBuilder</code>.</li>
<li><strong>Asignarlo a un String directamente.</strong> <code>String s = sb;</code> no compila; hay que escribir <code>sb.toString()</code>.</li>
<li><strong>Compararlo con <code>equals</code>.</strong> Dos <code>StringBuilder</code> con el mismo texto no son "iguales" para <code>equals</code>. Compara sus <code>toString()</code>.</li>
<li><strong>Olvidar los paréntesis.</strong> <code>new StringBuilder</code> sin <code>()</code> es un error de sintaxis.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3><ul><li>Usa <code>StringBuilder</code> cuando construyas un texto en varias partes o dentro de un bucle.</li><li><code>append</code> modifica el mismo objeto; no necesitas reasignar.</li><li>Convierte a <code>String</code> con <code>toString()</code> cuando termines.</li><li>Para unir dos o tres textos sueltos, el <code>+</code> sigue siendo lo más claro.</li></ul><h3>🧪 Lo que vas a practicar</h3><ul><li><strong>StringBuilder Append:</strong> crear un <code>StringBuilder</code>, agregar tres textos con <code>append</code> e imprimir el resultado.</li></ul>`
  },
  {
    id: 15, level: 'beginner', module: 3, title: 'Métodos y Funciones',
    description: 'Modularización y reutilización de código',
    duration: '40 min',
    content: `<h2>Métodos y Funciones</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>método</strong> es un bloque de código con nombre que realiza una tarea concreta. Lo escribes una vez y lo usas (<strong>lo llamas</strong>) todas las veces que quieras. Así evitas copiar y pegar el mismo código, y tu programa queda dividido en piezas pequeñas y fáciles de entender.</p>
<p>Es como una receta: la escribes una sola vez, y cada vez que la necesitas dices su nombre y las cantidades. Esas cantidades son los <strong>parámetros</strong>.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Un programa de facturación tiene métodos como <code>calcularIva</code>, <code>imprimirFactura</code> o <code>validarCliente</code>, en vez de un único bloque gigante.</div>
<h3>📖 Cómo funciona</h3>
<p>Un método se escribe así: <code>public static tipoRetorno nombre(parámetros) { ... }</code>. Por ahora escribe <code>public static</code> tal cual; su significado completo llegará con la programación orientada a objetos. Lo importante:</p>
<ul>
<li><strong>Tipo de retorno:</strong> qué tipo de valor devuelve. Si no devuelve nada, se escribe <code>void</code>.</li>
<li><strong>Parámetros:</strong> los datos que recibe, cada uno con su tipo y nombre. Pueden ser cero o varios.</li>
<li><strong>return:</strong> entrega el valor y termina el método.</li>
</ul>
<p>Los métodos van <strong>dentro de la clase</strong>, pero <strong>fuera</strong> de otros métodos como <code>main</code>. Cuando llamas a uno, le pasas <strong>argumentos</strong> (los valores concretos) en el mismo orden que los parámetros.</p>
<div class="code-block"><pre><code>public class Saludos {

    // void: no devuelve nada, solo hace algo
    public static void saludarA(String nombre) {
        System.out.println("Hola, " + nombre + "!");
    }

    // double: devuelve un numero con decimales
    public static double areaRectangulo(double base, double altura) {
        return base * altura;
    }

    public static void main(String[] args) {
        saludarA("Lucia");
        saludarA("Marcos");

        double area = areaRectangulo(4.5, 2);
        System.out.println("Area: " + area);
    }
}

// Salida:
// Hola, Lucia!
// Hola, Marcos!
// Area: 9.0</code></pre></div>
<p>El valor devuelto se puede guardar en una variable o usar dentro de otra expresión. Los parámetros y las variables creadas dentro de un método son <strong>locales</strong>: solo existen mientras el método se ejecuta.</p>
<div class="code-block"><pre><code>public class Doble {
    public static int doble(int n) {
        return n * 2;
    }

    public static void main(String[] args) {
        int total = doble(5) + doble(10);
        System.out.println(total);
    }
}

// Salida: 30</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li><strong>Olvidar el <code>return</code>.</strong> Si el método declara <code>int</code> pero no devuelve nada, no compila.</li>
<li><strong>Escribir un método dentro de <code>main</code>.</strong> En Java van uno al lado del otro, dentro de la clase.</li>
<li><strong>Ignorar el valor devuelto.</strong> Escribir solo <code>doble(5);</code> calcula pero no guarda ni muestra nada.</li>
<li><strong>Pasar mal los argumentos.</strong> Deben coincidir en cantidad, orden y tipo con los parámetros.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3><ul><li>Un método, una tarea: ponle un nombre que diga qué hace.</li><li>Usa <code>void</code> si no devuelve nada y un tipo concreto si devuelve algo.</li><li>Después de <code>return</code> el método termina.</li><li>Los parámetros y variables internas son locales a ese método.</li></ul><h3>🧪 Lo que vas a practicar</h3><ul><li><strong>Método Sin Retorno:</strong> crear un método <code>saludar</code> que imprime un mensaje.</li><li><strong>Método Con Retorno:</strong> crear un método <code>sumar</code> que devuelve la suma de dos enteros.</li></ul>`
  },

  // 🚀 NIVEL INTERMEDIO (15 lecciones)
  {
    id: 16, level: 'intermediate', module: 4, title: 'Clases y Objetos',
    description: 'Fundamentos de POO',
    duration: '40 min',
    content: `<h2>Clases y Objetos</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un libro no es solo un título: también tiene páginas, autor, etc. La <strong>Programación Orientada a Objetos (POO)</strong> te permite agrupar esos datos y las acciones que se hacen con ellos en una sola pieza.</p>
<p>Piensa en el plano de una casa. El plano <strong>no es</strong> una casa: no puedes vivir en él. Pero con un mismo plano puedes construir muchas casas, cada una con su propia pintura y sus propios muebles. En Java, el plano es la <strong>clase</strong> y cada casa construida es un <strong>objeto</strong>.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Un sistema de biblioteca tiene una clase <code>Libro</code> y miles de objetos, uno por cada libro físico. Casi todo el código Java profesional está organizado en clases.</div>
<h3>📖 Cómo funciona</h3>
<p>Una clase define dos cosas: los <strong>atributos</strong> (los datos, como variables dentro de la clase) y los <strong>métodos</strong> (las acciones, que ya conoces). Un objeto se construye con la palabra <code>new</code> y se usa con un punto: <code>objeto.atributo</code> y <code>objeto.metodo()</code>.</p>
<div class="code-block"><pre><code>class Libro {
    String titulo;
    int paginas;

    void describir() {
        System.out.println(titulo + " tiene " + paginas + " páginas");
    }
}

public class Biblioteca {
    public static void main(String[] args) {
        Libro l1 = new Libro();
        l1.titulo = "Rayuela";
        l1.paginas = 600;

        Libro l2 = new Libro();
        l2.titulo = "El Aleph";
        l2.paginas = 180;

        l1.describir();
        l2.describir();
    }
}

// Salida:
// Rayuela tiene 600 páginas
// El Aleph tiene 180 páginas</code></pre></div>
<p>Veamos qué pasó. <code>Libro l1 = new Libro();</code> construye un objeto y guarda en <code>l1</code> una <strong>referencia</strong> (la "dirección" donde vive ese objeto). <code>l1</code> y <code>l2</code> son objetos distintos: cada uno tiene sus propios valores. Dentro de <code>describir()</code>, <code>titulo</code> y <code>paginas</code> son los del objeto que llamó al método.</p>
<p>Los atributos sin valor inicial reciben uno por defecto: <code>0</code> para números, <code>false</code> para booleanos y <code>null</code> (nada) para objetos como <code>String</code>. Y como la variable guarda una referencia, copiarla no copia el objeto:</p>
<div class="code-block"><pre><code>class Libro {
    String titulo;
    int paginas;
}

public class Referencias {
    public static void main(String[] args) {
        Libro a = new Libro();
        System.out.println(a.titulo);
        System.out.println(a.paginas);

        a.titulo = "Ficciones";
        Libro b = a;
        b.titulo = "El jardín";
        System.out.println(a.titulo);
    }
}

// Salida:
// null
// 0
// El jardín</code></pre></div>
<p>Aquí <code>a</code> y <code>b</code> apuntan al <strong>mismo</strong> objeto, así que cambiar uno cambia el otro. Para tener dos objetos distintos necesitas dos <code>new</code>.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Olvidar <code>new</code>: <code>Libro l = Libro;</code> no crea ningún objeto.</li><li>Usar un atributo <code>String</code> sin asignarlo: vale <code>null</code> y, si llamas a un método sobre él (por ejemplo <code>titulo.length()</code>), el programa falla con <code>NullPointerException</code>.</li><li>Confundir clase con objeto: no puedes escribir <code>Libro.titulo = "X"</code>; el título pertenece a cada objeto, no al plano.</li><li>Creer que <code>b = a</code> copia el objeto: solo copia la referencia.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Clase = plano; objeto = lo construido con <code>new</code>.</li><li>Los nombres de clase empiezan con mayúscula (<code>Libro</code>); los de variables y métodos, con minúscula.</li><li>Accede a los miembros de un objeto con el punto.</li><li>Un método de instancia usa directamente los atributos de su objeto.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Clase Simple:</strong> crear la clase <code>Persona</code> con atributos.</li><li><strong>Crear Objeto:</strong> construir un objeto <code>Persona</code> con <code>new</code>.</li><li><strong>Acceder Atributo:</strong> imprimir <code>p.nombre</code>.</li><li><strong>Método de Instancia:</strong> escribir el método <code>saludar()</code>.</li><li><strong>Llamar Método:</strong> ejecutar <code>p.saludar()</code>.</li></ul>`
  },
  {
    id: 17, level: 'intermediate', module: 4, title: 'Constructores y Sobrecarga',
    description: 'Inicialización de objetos',
    duration: '35 min',
    content: `<h2>Constructores y Sobrecarga</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>En la lección anterior creabas un objeto vacío y luego asignabas atributo por atributo. Eso es incómodo y peligroso: es fácil olvidar uno y dejar el objeto a medias. Un <strong>constructor</strong> es un bloque especial que se ejecuta justo al hacer <code>new</code> y deja el objeto listo desde el primer momento.</p>
<p>Es como pedir una pizza: al encargarla ya indicas el tamaño y los ingredientes, en lugar de recibirla vacía y armarla después.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Casi toda clase de datos (un usuario, un pedido, un producto) se crea con un constructor que exige sus datos esenciales, para que nunca exista un objeto inválido.</div>
<h3>📖 Cómo funciona</h3>
<p>Un constructor se escribe como un método, pero con <strong>el mismo nombre que la clase</strong> y <strong>sin tipo de retorno</strong> (ni siquiera <code>void</code>). Dentro, <code>this</code> significa "este objeto" y sirve para distinguir el atributo del parámetro cuando se llaman igual: <code>this.nombre = nombre;</code>.</p>
<p><strong>Sobrecarga</strong> significa tener varios constructores (o métodos) con el mismo nombre pero con distintos parámetros. Java elige cuál ejecutar según los argumentos que pasas. Con <code>this(...)</code> un constructor puede llamar a otro de la misma clase, y debe ser su primera línea.</p>
<div class="code-block"><pre><code>class Producto {
    String nombre;
    double precio;
    int stock;

    Producto(String nombre, double precio, int stock) {
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
    }

    Producto(String nombre, double precio) {
        this(nombre, precio, 0);
    }

    void mostrar() {
        System.out.println(nombre + " - " + precio + " - stock: " + stock);
    }
}

public class Tienda {
    public static void main(String[] args) {
        Producto cuaderno = new Producto("Cuaderno", 4.5, 20);
        Producto lapiz = new Producto("Lápiz", 0.75);
        cuaderno.mostrar();
        lapiz.mostrar();
    }
}

// Salida:
// Cuaderno - 4.5 - stock: 20
// Lápiz - 0.75 - stock: 0</code></pre></div>
<p>El segundo constructor no repite el trabajo: delega en el primero con <code>stock</code> en 0.</p>
<p>Un detalle importante: si no escribes ningún constructor, Java te regala uno vacío. Pero en cuanto escribes uno, ese regalo desaparece:</p>
<div class="code-block"><pre><code>class Punto {
    int x;
    int y;

    Punto(int x, int y) {
        this.x = x;
        this.y = y;
    }
}

Punto a = new Punto(2, 3);  // correcto
Punto b = new Punto();      // error: no existe constructor sin parámetros</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Escribir un tipo de retorno: <code>void Producto(...)</code> ya no es un constructor, es un método común.</li><li>Olvidar <code>this</code> cuando parámetro y atributo se llaman igual: <code>nombre = nombre;</code> no cambia el atributo.</li><li>Llamar <code>new Clase()</code> sin argumentos después de definir un constructor con parámetros.</li><li>Poner <code>this(...)</code> después de otra instrucción: debe ser la primera línea.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>El constructor se llama igual que la clase y no tiene tipo de retorno.</li><li>Usa <code>this.atributo = parametro</code> para inicializar.</li><li>Sobrecarga para ofrecer varias formas de crear el objeto.</li><li>Reutiliza con <code>this(...)</code> en lugar de copiar código.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Constructor:</strong> añadir a <code>Persona</code> un constructor que reciba <code>nombre</code> y <code>edad</code>.</li></ul>`
  },
  {
    id: 18, level: 'intermediate', module: 4, title: 'Encapsulamiento',
    description: 'Modificadores de acceso y setters/getters',
    duration: '35 min',
    content: `<h2>Encapsulamiento</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Si todos los atributos son accesibles desde cualquier lugar, cualquiera puede dejar tu objeto en un estado absurdo: un saldo negativo, una edad de -5. El <strong>encapsulamiento</strong> consiste en ocultar los datos dentro de la clase y permitir su acceso solo a través de métodos que tú controlas.</p>
<p>Es como un cajero automático: no metes la mano a la caja fuerte; usas botones que validan lo que pides.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> En un banco, el saldo de una cuenta jamás se modifica directamente: se hace con operaciones que verifican reglas. Así los errores se detectan en un único lugar.</div>
<h3>📖 Cómo funciona</h3>
<p>Los <strong>modificadores de acceso</strong> indican quién puede ver un miembro:</p>
<ul><li><code>private</code>: solo la propia clase.</li><li><code>public</code>: cualquiera.</li><li>sin modificador: las clases del mismo <em>paquete</em> (la carpeta que agrupa clases relacionadas).</li><li><code>protected</code>: el mismo paquete y las clases hijas (lo verás en herencia).</li></ul>
<p>La receta habitual: atributos <code>private</code> y métodos <code>public</code>. Un <strong>getter</strong> (<code>getX</code>) devuelve el valor y un <strong>setter</strong> (<code>setX</code>) lo modifica, pudiendo validar antes.</p>
<div class="code-block"><pre><code>class Termostato {
    private double temperatura = 20;

    public double getTemperatura() {
        return temperatura;
    }

    public void setTemperatura(double temperatura) {
        if (temperatura &gt;= 10 &amp;&amp; temperatura &lt;= 30) {
            this.temperatura = temperatura;
        } else {
            System.out.println("Temperatura fuera de rango: " + temperatura);
        }
    }
}

public class Casa {
    public static void main(String[] args) {
        Termostato t = new Termostato();
        t.setTemperatura(24);
        System.out.println(t.getTemperatura());
        t.setTemperatura(80);
        System.out.println(t.getTemperatura());
    }
}

// Salida:
// 24.0
// Temperatura fuera de rango: 80.0
// 24.0</code></pre></div>
<p>El setter rechazó el valor 80 y la temperatura quedó en 24. Fuera de la clase, intentar saltarse el setter ni siquiera compila:</p>
<div class="code-block"><pre><code>Termostato t = new Termostato();
t.temperatura = 80;  // error: temperatura tiene acceso privado</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Dejar los atributos sin <code>private</code> "por comodidad" y perder el control.</li><li>Escribir setters que asignan sin validar: solo cambian la sintaxis, no protegen nada.</li><li>Olvidar <code>this</code> en el setter (<code>temperatura = temperatura;</code> asigna el parámetro a sí mismo).</li><li>Crear getters y setters para todo sin pensar: expón solo lo que haga falta.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Atributos <code>private</code> por defecto.</li><li>Getter: <code>public tipo getNombre()</code> con <code>return</code>.</li><li>Setter: <code>public void setNombre(tipo nombre)</code>, validando antes de asignar.</li><li>La validación vive en la clase, no repartida por el programa.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Encapsulamiento Private:</strong> declarar <code>saldo</code> como privado.</li><li><strong>Getter:</strong> escribir <code>getSaldo()</code>.</li><li><strong>Setter:</strong> escribir <code>setSaldo(double saldo)</code>.</li><li><strong>Validación en Setter:</strong> rechazar edades negativas en <code>setEdad</code>.</li></ul>`
  },
  {
    id: 19, level: 'intermediate', module: 4, title: 'Herencia y Polimorfismo',
    description: 'Extensión de clases y métodos sobrescritos',
    duration: '45 min',
    content: `<h2>Herencia y Polimorfismo</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Una moto y un camión son vehículos: ambos tienen marca y pueden arrancar. Copiar ese código en cada clase sería repetitivo. La <strong>herencia</strong> permite que una clase (la <em>hija</em>) reciba los atributos y métodos de otra (la <em>padre</em>) y añada o cambie lo suyo. Se lee como "es un": una moto <strong>es un</strong> vehículo.</p>
<p>El <strong>polimorfismo</strong> (muchas formas) es la consecuencia: puedes tratar objetos distintos como "un vehículo" y cada uno responde a su manera.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Un sistema de pagos recorre una lista de "medios de pago" y llama a <code>cobrar()</code>; cada tarjeta, transferencia o billetera lo hace a su modo, sin que el recorrido cambie.</div>
<h3>📖 Cómo funciona</h3>
<ul><li><code>extends</code> declara la herencia: <code>class Moto extends Vehiculo</code>.</li><li><code>super(...)</code> llama al constructor del padre y debe ser la primera línea del constructor hijo.</li><li><code>@Override</code> marca que reescribes un método del padre; si te equivocas en el nombre, el compilador avisa.</li></ul>
<div class="code-block"><pre><code>class Vehiculo {
    String marca;

    Vehiculo(String marca) {
        this.marca = marca;
    }

    void arrancar() {
        System.out.println(marca + " arranca");
    }

    String describir() {
        return "Vehículo " + marca;
    }
}

class Moto extends Vehiculo {
    int cilindrada;

    Moto(String marca, int cilindrada) {
        super(marca);
        this.cilindrada = cilindrada;
    }

    @Override
    String describir() {
        return "Moto " + marca + " de " + cilindrada + " cc";
    }
}

class Camion extends Vehiculo {
    double carga;

    Camion(String marca, double carga) {
        super(marca);
        this.carga = carga;
    }

    @Override
    String describir() {
        return "Camión " + marca + " con " + carga + " t de carga";
    }
}

public class Garage {
    public static void main(String[] args) {
        Vehiculo[] flota = {
            new Vehiculo("Genérico"),
            new Moto("Honda", 150),
            new Camion("Scania", 12.5)
        };
        for (Vehiculo v : flota) {
            System.out.println(v.describir());
        }
        flota[1].arrancar();
    }
}

// Salida:
// Vehículo Genérico
// Moto Honda de 150 cc
// Camión Scania con 12.5 t de carga
// Honda arranca</code></pre></div>
<p>El arreglo es de tipo <code>Vehiculo</code> pero guarda motos y camiones. En <code>v.describir()</code>, Java decide <strong>en ejecución</strong> qué versión llamar según el objeto real. Eso es polimorfismo. Observa que <code>arrancar()</code> no se reescribió: las hijas lo heredan tal cual.</p>
<p>Con una referencia de tipo padre solo ves lo que el padre declara. Para usar algo propio de la hija, comprueba el tipo con <code>instanceof</code>; desde Java 16 puedes declarar la variable en el mismo paso:</p>
<div class="code-block"><pre><code>Vehiculo v = new Moto("Yamaha", 250);
if (v instanceof Moto m) {
    System.out.println(m.cilindrada);  // 250
}</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Heredar solo para reutilizar código aunque no haya relación "es un".</li><li>No llamar a <code>super(...)</code> cuando el padre no tiene constructor vacío: no compila.</li><li>Escribir mal el método reescrito y creer que lo sobrescribes; <code>@Override</code> lo detecta.</li><li>Llamar a un método propio de la hija desde una variable de tipo padre.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Hereda solo si se cumple "es un".</li><li>Java permite una sola clase padre.</li><li>Pon siempre <code>@Override</code> al reescribir.</li><li>Programa contra el tipo padre para ganar flexibilidad.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Herencia Extends:</strong> hacer que <code>Estudiante</code> extienda <code>Persona</code>.</li><li><strong>Super Constructor:</strong> llamar a <code>super(nombre)</code>.</li><li><strong>Override Método:</strong> sobrescribir <code>toString()</code>.</li><li><strong>Polimorfismo:</strong> guardar un <code>Estudiante</code> en una variable <code>Persona</code>.</li><li><strong>Pattern Matching:</strong> usar <code>instanceof</code> con variable.</li></ul>`
  },
  {
    id: 20, level: 'intermediate', module: 4, title: 'Clases Abstractas',
    description: 'Plantillas de clases no instanciables',
    duration: '35 min',
    content: `<h2>Clases Abstractas</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>A veces una clase padre es una idea general que no tiene sentido como objeto concreto. ¿Cuál es el área de una "figura" cualquiera? No se puede saber: depende de si es un rectángulo o un triángulo. Una <strong>clase abstracta</strong> es una plantilla incompleta: define lo común y obliga a las hijas a completar lo que falta.</p>
<p>Es como un formulario con campos en blanco: no sirve tal cual, hay que rellenarlo.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Un framework de reportes puede ofrecer una clase base que arma el encabezado y el pie, y dejar abstracto el método que genera el contenido de cada reporte.</div>
<h3>📖 Cómo funciona</h3>
<p>Se declara con <code>abstract class</code>. Puede tener atributos, constructores y métodos normales, y además <strong>métodos abstractos</strong>: solo la firma, sin cuerpo, terminada en <code>;</code>. Una clase abstracta <strong>no se puede instanciar</strong> con <code>new</code>. La hija concreta debe implementar todos los métodos abstractos.</p>
<div class="code-block"><pre><code>abstract class Figura {
    String nombre;

    Figura(String nombre) {
        this.nombre = nombre;
    }

    abstract double area();

    void mostrar() {
        System.out.println(nombre + ": área " + area());
    }
}

class Rectangulo extends Figura {
    double base;
    double altura;

    Rectangulo(double base, double altura) {
        super("Rectángulo");
        this.base = base;
        this.altura = altura;
    }

    @Override
    double area() {
        return base * altura;
    }
}

class Triangulo extends Figura {
    double base;
    double altura;

    Triangulo(double base, double altura) {
        super("Triángulo");
        this.base = base;
        this.altura = altura;
    }

    @Override
    double area() {
        return base * altura / 2;
    }
}

public class Taller {
    public static void main(String[] args) {
        Figura[] figuras = { new Rectangulo(3, 4), new Triangulo(6, 5) };
        for (Figura f : figuras) {
            f.mostrar();
        }
    }
}

// Salida:
// Rectángulo: área 12.0
// Triángulo: área 15.0</code></pre></div>
<p><code>mostrar()</code> está escrito una sola vez en <code>Figura</code> y llama a <code>area()</code>; cada hija aporta su cálculo. El constructor de la padre sí existe, y las hijas lo invocan con <code>super</code>.</p>
<div class="code-block"><pre><code>Figura f = new Figura("genérica");  // error: Figura es abstracta</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Intentar hacer <code>new</code> de una clase abstracta.</li><li>No implementar todos los métodos abstractos en la hija: el compilador lo rechaza (salvo que la hija también sea abstracta).</li><li>Escribir un cuerpo <code>{ }</code> en un método abstracto: no lleva.</li><li>Declarar un método abstracto en una clase que no es <code>abstract</code>.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Usa <code>abstract</code> cuando la clase padre no debe existir sola.</li><li>Un método abstracto no tiene cuerpo.</li><li>Pon en la padre lo común y deja abstracto lo que varía.</li><li>Implementa con <code>@Override</code>.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Clase Abstracta:</strong> definir <code>Animal</code> con el método abstracto <code>hacerSonido()</code>.</li><li><strong>Implementar Abstracto:</strong> crear <code>Perro</code> que implemente ese método.</li></ul>`
  },
  {
    id: 21, level: 'intermediate', module: 4, title: 'Interfaces y Contratos',
    description: 'Definición de comportamientos',
    duration: '40 min',
    content: `<h2>Interfaces y Contratos</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Una <strong>interfaz</strong> es un contrato: lista qué debe saber hacer una clase, sin decir cómo. Quien la implementa se compromete a cumplirlo. A diferencia de la herencia (solo puedes tener un padre), una clase puede implementar <strong>varias</strong> interfaces.</p>
<p>Piensa en un enchufe: no importa si del otro lado hay una lámpara o un cargador; mientras cumpla la forma del enchufe, funciona.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Las bibliotecas de Java usan interfaces como <code>Comparable</code> y <code>List</code>: tu código depende del contrato y no de una clase concreta, así puedes cambiar la implementación sin reescribirlo.</div>
<h3>📖 Cómo funciona</h3>
<p>Se declara con <code>interface</code>. Sus métodos son <code>public</code> y abstractos por defecto. Una clase la cumple con <code>implements</code>, y como el método de la interfaz es público, al implementarlo también debes marcarlo <code>public</code>. Desde Java 8 una interfaz puede ofrecer métodos <code>default</code>, que ya traen cuerpo y las clases pueden reutilizar o reescribir.</p>
<div class="code-block"><pre><code>interface Reproducible {
    void reproducir();

    default void pausar() {
        System.out.println("Pausado");
    }
}

interface Descargable {
    void descargar();
}

class Cancion implements Reproducible, Descargable {
    String titulo;

    Cancion(String titulo) {
        this.titulo = titulo;
    }

    @Override
    public void reproducir() {
        System.out.println("Reproduciendo " + titulo);
    }

    @Override
    public void descargar() {
        System.out.println("Descargando " + titulo);
    }
}

class Podcast implements Reproducible {
    @Override
    public void reproducir() {
        System.out.println("Reproduciendo podcast");
    }

    @Override
    public void pausar() {
        System.out.println("Podcast en pausa");
    }
}

public class Reproductor {
    static void usar(Reproducible r) {
        r.reproducir();
        r.pausar();
    }

    public static void main(String[] args) {
        Cancion c = new Cancion("Vals");
        usar(c);
        usar(new Podcast());
        c.descargar();
    }
}

// Salida:
// Reproduciendo Vals
// Pausado
// Reproduciendo podcast
// Podcast en pausa
// Descargando Vals</code></pre></div>
<p><code>usar</code> recibe cualquier cosa que sea <code>Reproducible</code>. <code>Cancion</code> usó el <code>pausar()</code> por defecto; <code>Podcast</code> lo reescribió. Además <code>Cancion</code> implementa dos interfaces separadas por coma.</p>
<p>¿Cuándo interfaz y cuándo clase abstracta? La abstracta es para compartir estado y código entre clases emparentadas ("es un"); la interfaz, para declarar una capacidad que clases muy distintas pueden tener ("sabe hacer").</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Olvidar <code>public</code> al implementar un método de la interfaz: no compila (reduce la visibilidad).</li><li>No implementar todos los métodos abstractos de la interfaz.</li><li>Usar <code>extends</code> en vez de <code>implements</code> para una interfaz.</li><li>Intentar hacer <code>new Reproducible()</code>: una interfaz no se instancia.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Nombra las interfaces por capacidad (<code>Volador</code>, <code>Reproducible</code>).</li><li>Una clase puede implementar muchas: <code>implements A, B</code>.</li><li>Los métodos implementados llevan <code>public</code> y <code>@Override</code>.</li><li>Usa <code>default</code> con moderación, para evolucionar una interfaz sin romper nada.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Interfaz:</strong> definir <code>Volador</code> con <code>volar()</code>.</li><li><strong>Implementar Interfaz:</strong> crear <code>Ave</code> que implemente <code>Volador</code>.</li><li><strong>Múltiples Interfaces:</strong> hacer que <code>Pato</code> implemente <code>Volador</code> y <code>Nadador</code>.</li><li><strong>Interfaz con Default:</strong> añadir un método <code>default despedir()</code>.</li></ul>`
  },
  {
    id: 22, level: 'intermediate', module: 5, title: 'Composición vs Herencia',
    description: 'Relaciones Has-a vs Is-a',
    duration: '35 min',
    content: `<h2>Composición vs Herencia</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Hay dos formas de relacionar clases. La <strong>herencia</strong> expresa "es un" (<em>is-a</em>): una moto es un vehículo. La <strong>composición</strong> expresa "tiene un" (<em>has-a</em>): un auto tiene un motor. Elegir bien evita jerarquías rígidas y difíciles de cambiar.</p>
<p>Una prueba rápida: lee la frase en voz alta. "Un auto es un motor" suena mal; "un auto tiene un motor" suena bien. Entonces el motor va como atributo del auto, no como padre.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Un pedido tiene una dirección de envío y un medio de pago. Cada uno es su propio objeto con su propia lógica, y el pedido solo los combina.</div>
<h3>📖 Cómo funciona</h3>
<p>En composición, una clase guarda <strong>objetos de otras clases como atributos</strong> y les delega el trabajo. Si además el atributo es del tipo de una interfaz, puedes cambiar la pieza sin tocar el resto:</p>
<div class="code-block"><pre><code>interface Motor {
    void encender();
}

class MotorNafta implements Motor {
    @Override
    public void encender() {
        System.out.println("Motor a nafta encendido");
    }
}

class MotorElectrico implements Motor {
    @Override
    public void encender() {
        System.out.println("Motor eléctrico encendido");
    }
}

class Auto {
    private Motor motor;

    Auto(Motor motor) {
        this.motor = motor;
    }

    void arrancar() {
        motor.encender();
        System.out.println("Auto en marcha");
    }
}

public class Concesionaria {
    public static void main(String[] args) {
        Auto a1 = new Auto(new MotorNafta());
        Auto a2 = new Auto(new MotorElectrico());
        a1.arrancar();
        a2.arrancar();
    }
}

// Salida:
// Motor a nafta encendido
// Auto en marcha
// Motor eléctrico encendido
// Auto en marcha</code></pre></div>
<p><code>Auto</code> no sabe qué motor usa: solo sabe que cumple el contrato <code>Motor</code>. Para sumar un motor híbrido basta una clase nueva; <code>Auto</code> no cambia.</p>
<p>Con herencia, en cambio, la relación queda fija al escribir el código y la hija queda atada a los detalles de su padre. Por eso hay una regla clásica: <strong>prefiere composición sobre herencia</strong>, y reserva la herencia para relaciones "es un" claras y estables.</p>
<div class="code-block"><pre><code>class Auto extends Motor { }   // mal: un auto no es un motor
class Auto { Motor motor; }      // bien: un auto tiene un motor</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Heredar solo para reutilizar métodos, sin que exista "es un".</li><li>Crear cadenas de herencia profundas (A extiende B extiende C...) que nadie logra seguir.</li><li>Fijar la pieza dentro de la clase con <code>new MotorNafta()</code> en vez de recibirla; así no puedes cambiarla.</li><li>Pensar que son excluyentes: se combinan, por ejemplo con herencia entre figuras y composición para sus partes.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>"Es un" → herencia; "tiene un" → composición.</li><li>Ante la duda, elige composición.</li><li>Depende de interfaces, no de clases concretas.</li><li>Recibe las piezas por el constructor para poder cambiarlas.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<p>Esta lección es de lectura: no tiene ejercicios propios. Marca la lección como completada cuando la hayas entendido.</p>`
  },
  {
    id: 23, level: 'intermediate', module: 5, title: 'Enumeraciones (Enums)',
    description: 'Tipos constantes con nombre',
    duration: '30 min',
    content: `<h2>Enumeraciones (Enums)</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>enum</strong> (enumeración) es un tipo cuyos valores posibles son una lista <strong>fija y con nombre</strong>. Piensa en un semáforo: solo puede estar en ROJO, AMARILLO o VERDE, nunca en "azul". Si guardaras el color en un <code>String</code>, alguien podría escribir "verd" por error y Java no te avisaría. Con un enum, el compilador rechaza cualquier valor que no esté en la lista.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Los enums se usan para estados de un pedido (PENDIENTE, ENVIADO, ENTREGADO), roles de usuario o días de la semana.</div>
<h3>📖 Cómo funciona</h3>
<p>Se declara con la palabra <code>enum</code> y los valores van separados por comas, por convención en MAYÚSCULAS. Cada valor es un objeto único: se accede con <code>Tipo.VALOR</code>. Todo enum trae <code>values()</code> (todos los valores), <code>name()</code> (el nombre como texto), <code>ordinal()</code> (su posición, desde 0) y <code>valueOf("TEXTO")</code> (busca un valor por nombre). Funcionan muy bien con <code>switch</code>.</p>
<div class="code-block"><pre><code>public class Semaforo {
    enum Color { ROJO, AMARILLO, VERDE }

    public static void main(String[] args) {
        Color actual = Color.AMARILLO;
        switch (actual) {
            case ROJO -&gt; System.out.println("Detente");
            case AMARILLO -&gt; System.out.println("Precaución");
            case VERDE -&gt; System.out.println("Avanza");
        }
        for (Color c : Color.values()) {
            System.out.println(c.ordinal() + " -&gt; " + c.name());
        }
        System.out.println(Color.valueOf("VERDE"));
    }
}

// Salida:
// Precaución
// 0 -&gt; ROJO
// 1 -&gt; AMARILLO
// 2 -&gt; VERDE
// VERDE</code></pre></div>
<p>Un enum también puede tener <strong>atributos y constructor</strong>. Después de los valores se escribe un punto y coma <code>;</code> y luego el resto, como en una clase. Cada valor pasa sus datos entre paréntesis. El constructor de un enum es siempre privado: tú no creas valores nuevos con <code>new</code>.</p>
<div class="code-block"><pre><code>public class Pedidos {
    enum Prioridad {
        BAJA(1), MEDIA(5), ALTA(10);

        private final int puntos;

        Prioridad(int puntos) {
            this.puntos = puntos;
        }

        public int getPuntos() {
            return puntos;
        }
    }

    public static void main(String[] args) {
        for (Prioridad p : Prioridad.values()) {
            System.out.println(p + " vale " + p.getPuntos() + " puntos");
        }
    }
}

// Salida:
// BAJA vale 1 puntos
// MEDIA vale 5 puntos
// ALTA vale 10 puntos</code></pre></div>
<h3>📦 Otros tipos especiales: record y sealed</h3>
<p>Java moderno ofrece dos tipos más para casos concretos.</p>
<ul><li><strong>record</strong> (Java 16 en adelante): una clase de datos <strong>inmutable</strong> (sus valores no cambian después de crearla). Con <code>record Libro(String titulo, int paginas) { }</code> Java genera solo el constructor, los métodos de lectura (<code>titulo()</code>, <code>paginas()</code>), <code>equals</code>, <code>hashCode</code> y <code>toString</code>.</li>
<li><strong>sealed</strong> (Java 17 en adelante): una clase "sellada" que, con <code>permits</code>, indica <strong>qué clases exactas pueden heredar</strong> de ella. Las hijas deben declararse <code>final</code>, <code>sealed</code> o <code>non-sealed</code>.</li></ul>
<div class="code-block"><pre><code>public class Tipos {
    record Libro(String titulo, int paginas) { }

    sealed static abstract class Vehiculo permits Auto, Moto { }
    static final class Auto extends Vehiculo { }
    static final class Moto extends Vehiculo { }

    public static void main(String[] args) {
        Libro a = new Libro("Rayuela", 600);
        Libro b = new Libro("Rayuela", 600);
        System.out.println(a);
        System.out.println(a.titulo());
        System.out.println(a.equals(b));
        Vehiculo v = new Moto();
        System.out.println(v instanceof Moto);
    }
}

// Salida:
// Libro[titulo=Rayuela, paginas=600]
// Rayuela
// true
// true</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Intentar crear un valor con <code>new Color()</code>: los enums no se instancian.</li><li>Olvidar el <code>;</code> después del último valor cuando el enum tiene atributos o métodos.</li><li>Escribir mal el nombre en <code>valueOf</code>: lanza <code>IllegalArgumentException</code>.</li><li>Intentar modificar un campo de un <code>record</code>: son inmutables y no hay "setters".</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Usa enum cuando los valores posibles son un conjunto cerrado y conocido.</li><li>Escribe las constantes en MAYÚSCULAS.</li><li>Compara enums con <code>==</code>.</li><li>Usa <code>record</code> para clases que solo guardan datos.</li><li>Usa <code>sealed</code> cuando quieras controlar quién hereda.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Enum Simple:</strong> declarar un enum <code>Dia</code> con tres valores.</li><li><strong>Enum con Constructor:</strong> un enum <code>Talla</code> con atributo privado y constructor.</li><li><strong>Record Simple:</strong> declarar el record <code>Punto</code>.</li><li><strong>Sealed Class:</strong> declarar una clase sellada con <code>permits</code>.</li></ul>`
  },
  {
    id: 24, level: 'intermediate', module: 5, title: 'Clases Anidadas',
    description: 'Inner y Nested static classes',
    duration: '30 min',
    content: `<h2>Clases Anidadas</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Una <strong>clase anidada</strong> es una clase declarada <strong>dentro de otra</strong>. Sirve cuando una clase solo tiene sentido como ayudante de otra. Es como el cajón de un escritorio: no se usa solo, forma parte del mueble. Así mantienes el código agrupado y evitas llenar el proyecto de clases sueltas.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Las clases anónimas se usan mucho para pasar una acción pequeña a otro código, por ejemplo qué hacer cuando se pulsa un botón o cuando termina un hilo.</div>
<h3>📖 Cómo funciona</h3>
<p>Hay tres variantes principales:</p>
<ul><li><strong>Clase anidada estática</strong> (<code>static class</code>): no necesita un objeto de la clase externa y no accede a sus atributos de instancia.</li>
<li><strong>Clase interna</strong> (sin <code>static</code>): pertenece a un objeto concreto de la externa y puede leer y usar sus atributos, incluso los privados.</li>
<li><strong>Clase anónima</strong>: una clase sin nombre que implementa una interfaz (o extiende una clase) en el mismo lugar donde se usa, con <code>new Interfaz() { ... }</code>.</li></ul>
<div class="code-block"><pre><code>public class Tienda {
    private String nombre = "Libros del Sur";

    // Clase interna: necesita un objeto Tienda
    class Cartel {
        String texto() {
            return "Bienvenido a " + nombre;
        }
    }

    // Clase anidada estática: no necesita un objeto Tienda
    static class Etiqueta {
        String precio(double valor) {
            return "$" + valor;
        }
    }

    interface Saludo {
        String saludar(String persona);
    }

    public static void main(String[] args) {
        Tienda tienda = new Tienda();
        Tienda.Cartel cartel = tienda.new Cartel();
        System.out.println(cartel.texto());

        Tienda.Etiqueta etiqueta = new Tienda.Etiqueta();
        System.out.println(etiqueta.precio(19.5));

        Saludo formal = new Saludo() {
            @Override
            public String saludar(String persona) {
                return "Buenos días, " + persona;
            }
        };
        System.out.println(formal.saludar("Laura"));
    }
}

// Salida:
// Bienvenido a Libros del Sur
// $19.5
// Buenos días, Laura</code></pre></div>
<p>Fíjate en la sintaxis: la clase interna se crea desde un objeto (<code>tienda.new Cartel()</code>), mientras que la estática se crea como cualquier otra (<code>new Tienda.Etiqueta()</code>). La anónima termina con <code>;</code> porque es una expresión asignada a una variable.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Crear una clase interna desde <code>static main</code> sin tener antes un objeto de la externa: da error de compilación.</li><li>Intentar usar un atributo de instancia de la externa desde una clase anidada <code>static</code>.</li><li>Olvidar el <code>;</code> al final de una clase anónima.</li><li>Usar clases anidadas para todo: si la clase se usa en muchos sitios, mejor un archivo propio.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Si la clase anidada no necesita la externa, hazla <code>static</code>.</li><li>Usa clases anónimas solo para implementaciones pequeñas y de un único uso.</li><li>Pon <code>@Override</code> en los métodos de la clase anónima.</li><li>Mantén las clases anidadas cortas.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Clase Interna:</strong> declarar una clase <code>Interna</code> dentro de <code>Externa</code>.</li><li><strong>Clase Anónima:</strong> crear un <code>Runnable</code> con una clase anónima que imprime "Hola".</li></ul>`
  },
  {
    id: 25, level: 'intermediate', module: 5, title: 'Paquetes y Organización',
    description: 'Estructura de directorios y modularidad',
    duration: '25 min',
    content: `<h2>Paquetes y Organización</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>paquete</strong> (<em>package</em>) es una carpeta lógica que agrupa clases relacionadas. Igual que ordenas documentos en carpetas ("Facturas", "Fotos"), en Java agrupas clases en paquetes. Así evitas confusiones cuando dos clases se llaman igual y encuentras todo más rápido en proyectos grandes.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Los proyectos de empresa se organizan en paquetes como <code>com.empresa.modelo</code>, <code>com.empresa.servicio</code> y <code>com.empresa.util</code>.</div>
<h3>📖 Cómo funciona</h3>
<p>La primera línea de un archivo declara su paquete con <code>package</code>. El nombre del paquete debe coincidir con la estructura de carpetas. Por convención se escribe en minúsculas y, en proyectos reales, empieza con el dominio de la empresa al revés (<code>com.tienda</code>).</p>
<div class="code-block"><pre><code>// Archivo: com/tienda/modelo/Producto.java
package com.tienda.modelo;

public class Producto {
    public String nombre = "Cuaderno";
}</code></pre></div>
<p>Para usar una clase de otro paquete la importas con <code>import</code>, después de la línea <code>package</code> y antes de la clase. Las clases de <code>java.lang</code> (como <code>String</code> o <code>Math</code>) se importan solas.</p>
<div class="code-block"><pre><code>// Archivo: com/tienda/app/Principal.java
package com.tienda.app;

import com.tienda.modelo.Producto;
import java.util.ArrayList;

public class Principal {
    public static void main(String[] args) {
        Producto p = new Producto();
        System.out.println(p.nombre);
    }
}</code></pre></div>
<p>Puedes importar todas las clases de un paquete con <code>import java.util.*;</code>. Además, los modificadores de acceso interactúan con los paquetes: un miembro sin modificador (<em>package-private</em>) solo es visible dentro del mismo paquete, y <code>public</code> es visible desde cualquier otro.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Que el <code>package</code> no coincida con la carpeta real del archivo.</li><li>Olvidar que la clase debe ser <code>public</code> para usarla desde otro paquete.</li><li>Poner <code>import</code> antes de <code>package</code>: el orden correcto es primero <code>package</code>.</li><li>Importar dos clases con el mismo nombre (por ejemplo dos <code>Date</code>): usa el nombre completo de una de ellas.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Nombres de paquete en minúsculas.</li><li>Agrupa por responsabilidad: modelo, servicio, utilidades.</li><li>Una clase pública por archivo, con el mismo nombre que el archivo.</li><li>Evita <code>import</code> innecesarios.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<p>Esta lección es de lectura: no tiene ejercicios propios. Marca la lección como completada cuando la hayas entendido.</p>`
  },
  {
    id: 26, level: 'intermediate', module: 5, title: 'Static y Final',
    description: 'Miembros de clase y constantes',
    duration: '35 min',
    content: `<h2>Static y Final</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p><code>static</code> hace que un miembro (atributo o método) pertenezca a la <strong>clase</strong> y no a cada objeto. Es como el cartel de la entrada de un edificio: es uno solo para todos, no uno por departamento. <code>final</code> significa "no se puede cambiar": una vez asignado, el valor queda fijo. Juntos, <code>static final</code> crean constantes.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Los contadores globales, los valores fijos (como un porcentaje de impuesto) y las funciones de utilidad como <code>Math.max</code> usan <code>static</code>.</div>
<h3>📖 Cómo funciona</h3>
<ul><li><strong>Atributo static:</strong> hay una sola copia, compartida por todos los objetos. Se accede con <code>NombreClase.atributo</code>.</li>
<li><strong>Método static:</strong> se llama sin crear un objeto, con <code>NombreClase.metodo()</code>. No puede usar atributos de instancia, porque no hay "un objeto actual".</li>
<li><strong>Bloque static</strong> (<code>static { ... }</code>): código que se ejecuta una sola vez, cuando la clase se carga. Sirve para inicializaciones más complejas.</li>
<li><strong>final:</strong> en una variable impide reasignarla; en un método impide sobrescribirlo; en una clase impide heredar de ella.</li></ul>
<div class="code-block"><pre><code>public class Cuenta {
    static int totalCuentas = 0;
    static final double COMISION;
    final String titular;

    static {
        COMISION = 0.02;
    }

    Cuenta(String titular) {
        this.titular = titular;
        totalCuentas++;
    }

    static double aplicarComision(double monto) {
        return monto * COMISION;
    }

    public static void main(String[] args) {
        Cuenta a = new Cuenta("Ana");
        Cuenta b = new Cuenta("Luis");
        System.out.println(Cuenta.totalCuentas);
        System.out.println(Cuenta.aplicarComision(1000));
        System.out.println(a.titular + " y " + b.titular);
    }
}

// Salida:
// 2
// 20.0
// Ana y Luis</code></pre></div>
<p>La convención para constantes es MAYÚSCULAS con guiones bajos (<code>MAX_INTENTOS</code>). Un atributo <code>final</code> de instancia, como <code>titular</code>, se asigna una vez en el constructor.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Usar un atributo de instancia dentro de un método <code>static</code>: error de compilación.</li><li>Intentar reasignar una variable <code>final</code>.</li><li>Creer que cada objeto tiene su propia copia de un atributo <code>static</code>: es una sola para todos.</li><li>Abusar de <code>static</code> para evitar crear objetos: pierdes los beneficios de la orientación a objetos.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Constantes: <code>static final</code> y en MAYÚSCULAS.</li><li>Accede a lo static por el nombre de la clase, no por un objeto.</li><li>Usa <code>static</code> solo para lo que realmente es común a toda la clase.</li><li>Marca como <code>final</code> lo que no deba cambiar.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Atributo Static:</strong> agregar <code>static int total = 0</code> a la clase <code>Contador</code>.</li><li><strong>Método Static:</strong> escribir <code>sumar</code> como método de clase.</li><li><strong>Constante Static Final:</strong> declarar la constante <code>PI</code>.</li><li><strong>Bloque Static:</strong> inicializar <code>url</code> en un bloque estático.</li></ul>`
  },
  {
    id: 27, level: 'intermediate', module: 6, title: 'ArrayList y LinkedList',
    description: 'Colecciones de tipo lista',
    duration: '40 min',
    content: `<h2>ArrayList y LinkedList</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un arreglo (<code>int[]</code>) tiene tamaño fijo. Una <strong>lista</strong> es una colección que <strong>crece y se encoge</strong> a medida que agregas o quitas elementos, y mantiene el orden en que los pusiste. Es como una lista de compras en papel que puedes seguir ampliando. Java tiene dos implementaciones principales: <code>ArrayList</code> y <code>LinkedList</code>.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Casi todo programa Java usa listas: productos de un carrito, resultados de una consulta, mensajes de un chat.</div>
<h3>📖 Cómo funciona</h3>
<p>Primero, qué significa <code>&lt;String&gt;</code>. Los <strong>genéricos</strong> le dicen a una colección <strong>de qué tipo son sus elementos</strong>. <code>List&lt;String&gt;</code> se lee "lista de String". Así el compilador te impide meter un número en una lista de textos, y al leer un elemento ya sabes su tipo, sin conversiones. Los operadores <code>&lt; &gt;</code> vacíos en <code>new ArrayList&lt;&gt;()</code> (el "diamante") hacen que Java deduzca el tipo.</p>
<p><strong>ArrayList</strong> guarda los elementos en un arreglo interno: leer por posición es muy rápido. <strong>LinkedList</strong> los guarda enlazados uno con otro: agregar o quitar en los extremos es muy rápido. Los índices empiezan en 0. Métodos clave: <code>add</code>, <code>get</code>, <code>remove</code>, <code>size</code>; en LinkedList además <code>addFirst</code>, <code>addLast</code>, <code>removeFirst</code>.</p>
<div class="code-block"><pre><code>import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class Listas {
    public static void main(String[] args) {
        List&lt;String&gt; frutas = new ArrayList&lt;&gt;();
        frutas.add("Manzana");
        frutas.add("Pera");
        frutas.add("Uva");
        System.out.println(frutas.get(1));
        frutas.remove("Pera");
        System.out.println(frutas + " tamaño " + frutas.size());

        LinkedList&lt;String&gt; fila = new LinkedList&lt;&gt;();
        fila.add("Marta");
        fila.addFirst("Pedro");
        fila.addLast("Sofía");
        System.out.println(fila);
        System.out.println(fila.removeFirst());
        for (String persona : fila) {
            System.out.println("Atiendo a " + persona);
        }
    }
}

// Salida:
// Pera
// [Manzana, Uva] tamaño 2
// [Pedro, Marta, Sofía]
// Pedro
// Atiendo a Marta
// Atiendo a Sofía</code></pre></div>
<p>Con <code>remove(0)</code> se borra por <strong>posición</strong>; con <code>remove("Pera")</code> se borra por <strong>valor</strong>. Una lista de enteros usa <code>List&lt;Integer&gt;</code>: los genéricos no aceptan <code>int</code>, pero Java convierte solo entre <code>int</code> e <code>Integer</code>. Recorre con <code>for (String x : lista)</code>.</p>
<h3>🧬 Genéricos básicos: crear los tuyos</h3>
<p>Tú también puedes escribir clases y métodos genéricos. La letra <strong><code>T</code></strong> (de "tipo") es un <strong>parámetro de tipo</strong>: un marcador que se reemplaza por un tipo real al usarlo.</p>
<ul><li><code>class Bolsa&lt;T&gt;</code>: clase genérica. <code>Bolsa&lt;String&gt;</code> hace que T sea String.</li><li><code>static &lt;T&gt; T primero(List&lt;T&gt; l)</code>: método genérico; el <code>&lt;T&gt;</code> va antes del tipo de retorno.</li><li><code>&lt;T extends Comparable&lt;T&gt;&gt;</code>: tipo <strong>con límite</strong>; T solo puede ser un tipo que se sepa comparar.</li><li><code>List&lt;?&gt;</code>: <strong>comodín</strong> (<em>wildcard</em>); una lista de cualquier tipo. <code>List&lt;? extends Number&gt;</code>: lista de números de cualquier clase.</li></ul>
<div class="code-block"><pre><code>import java.util.List;

public class Genericos {
    static class Bolsa&lt;T&gt; {
        private T objeto;
        void meter(T nuevo) { objeto = nuevo; }
        T sacar() { return objeto; }
    }

    static &lt;T&gt; T primero(List&lt;T&gt; lista) {
        return lista.get(0);
    }

    static double sumar(List&lt;? extends Number&gt; numeros) {
        double total = 0;
        for (Number n : numeros) {
            total += n.doubleValue();
        }
        return total;
    }

    static int cuantos(List&lt;?&gt; cualquiera) {
        return cualquiera.size();
    }

    static &lt;T extends Comparable&lt;T&gt;&gt; T menor(T a, T b) {
        return a.compareTo(b) &lt; 0 ? a : b;
    }

    public static void main(String[] args) {
        Bolsa&lt;String&gt; bolsa = new Bolsa&lt;&gt;();
        bolsa.meter("Llaves");
        String contenido = bolsa.sacar();
        System.out.println(contenido);
        System.out.println(primero(List.of(7, 8, 9)));
        System.out.println(sumar(List.of(1, 2, 3)));
        System.out.println(cuantos(List.of("a", "b")));
        System.out.println(menor("pera", "manzana"));
    }
}

// Salida:
// Llaves
// 7
// 6.0
// 2
// manzana</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Pedir <code>get(3)</code> en una lista de 3 elementos: lanza <code>IndexOutOfBoundsException</code> (el último es el 2).</li><li>Usar tipos primitivos: <code>ArrayList&lt;int&gt;</code> no compila; usa <code>ArrayList&lt;Integer&gt;</code>.</li><li>Quitar elementos dentro de un <code>for-each</code>: provoca <code>ConcurrentModificationException</code>.</li><li>En <code>List&lt;Integer&gt;</code>, confundir <code>remove(int posición)</code> con <code>remove(Object valor)</code>.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Usa <code>ArrayList</code> por defecto; <code>LinkedList</code> si añades y quitas mucho al principio o al final.</li><li>Declara con la interfaz: <code>List&lt;String&gt; x = new ArrayList&lt;&gt;();</code>.</li><li>Indica siempre el tipo con genéricos.</li><li>Recuerda que los índices empiezan en 0.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>ArrayList Crear / Add / Get / Remove / Size / Iterar:</strong> las operaciones básicas de una lista.</li><li><strong>LinkedList Crear y AddFirst:</strong> crear una lista enlazada y agregar en los extremos.</li><li><strong>Genérico Simple, Método Genérico, Bounded Type y Wildcard:</strong> escribir clases y métodos con <code>&lt;T&gt;</code>, <code>&lt;T extends ...&gt;</code> y <code>?</code>.</li></ul>`
  },
  {
    id: 28, level: 'intermediate', module: 6, title: 'HashSet y TreeSet',
    description: 'Colecciones de tipo conjunto (sin duplicados)',
    duration: '35 min',
    content: `<h2>HashSet y TreeSet</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>Set</strong> (conjunto) es una colección que <strong>no permite elementos repetidos</strong>. Si intentas agregar algo que ya está, simplemente no se agrega. Es como la lista de invitados a una fiesta: cada persona figura una sola vez. Los sets no tienen posiciones: no existe <code>get(0)</code>.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Se usan para quitar duplicados de una lista (correos únicos, etiquetas) y para comprobar rápido si algo ya existe.</div>
<h3>📖 Cómo funciona</h3>
<ul><li><strong>HashSet:</strong> el más rápido, pero <strong>no garantiza ningún orden</strong>.</li><li><strong>TreeSet:</strong> mantiene los elementos <strong>ordenados</strong> (de menor a mayor) automáticamente.</li></ul>
<p>Los métodos principales son <code>add</code> (devuelve <code>false</code> si el elemento ya estaba), <code>contains</code>, <code>remove</code> y <code>size</code>.</p>
<p>¿Cómo sabe un set que dos objetos son "el mismo"? Usa los métodos <code>equals</code> y <code>hashCode</code>. En <code>String</code> y en los números ya vienen bien definidos. En tus propias clases debes <strong>sobrescribirlos</strong> (escribir tu propia versión con <code>@Override</code>); si no, dos objetos con los mismos datos se consideran distintos. <code>equals</code> define cuándo son iguales y <code>hashCode</code> da un número que debe ser igual para objetos iguales. Si sobrescribes uno, sobrescribe el otro.</p>
<div class="code-block"><pre><code>import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;

public class Conjuntos {
    static class Curso {
        String codigo;
        Curso(String codigo) { this.codigo = codigo; }

        @Override
        public boolean equals(Object obj) {
            if (obj instanceof Curso otro) {
                return codigo.equals(otro.codigo);
            }
            return false;
        }

        @Override
        public int hashCode() {
            return Objects.hash(codigo);
        }
    }

    public static void main(String[] args) {
        Set&lt;String&gt; colores = new HashSet&lt;&gt;();
        System.out.println(colores.add("rojo"));
        System.out.println(colores.add("rojo"));
        System.out.println(colores.size() + " " + colores.contains("rojo"));

        Set&lt;Integer&gt; notas = new TreeSet&lt;&gt;();
        notas.add(9);
        notas.add(4);
        notas.add(7);
        System.out.println(notas);

        Set&lt;Curso&gt; cursos = new HashSet&lt;&gt;();
        cursos.add(new Curso("JAVA1"));
        cursos.add(new Curso("JAVA1"));
        System.out.println(cursos.size());
    }
}

// Salida:
// true
// false
// 1 true
// [4, 7, 9]
// 1</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Esperar un orden concreto al recorrer un <code>HashSet</code>.</li><li>Sobrescribir <code>equals</code> pero no <code>hashCode</code>: el set puede aceptar duplicados.</li><li>Intentar <code>set.get(0)</code>: no existe.</li><li>Meter objetos sin orden natural en un <code>TreeSet</code>: da <code>ClassCastException</code> (lo resuelve la lección de ordenación).</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Si necesitas unicidad, usa un Set.</li><li>Orden irrelevante y velocidad: <code>HashSet</code>; orden automático: <code>TreeSet</code>.</li><li>Sobrescribe <code>equals</code> y <code>hashCode</code> juntos.</li><li>Basa ambos en los mismos atributos.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>HashSet Crear, Add Duplicado y Contains:</strong> crear un set, comprobar que ignora duplicados y consultar con <code>contains</code>.</li><li><strong>TreeSet Ordenado:</strong> agregar números y ver que quedan ordenados.</li><li><strong>Equals Override y HashCode Override:</strong> sobrescribir ambos métodos en <code>Persona</code>.</li></ul>`
  },
  {
    id: 29, level: 'intermediate', module: 6, title: 'HashMap y TreeMap',
    description: 'Mapas tipo clave/valor',
    duration: '40 min',
    content: `<h2>HashMap y TreeMap</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>Map</strong> (mapa) guarda pares <strong>clave → valor</strong>. Funciona como una agenda de contactos: buscas por nombre (la clave) y obtienes el teléfono (el valor). Las claves no se repiten; los valores sí pueden repetirse. Es la forma ideal de encontrar un dato rápido a partir de otro.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Se usan para contar ocurrencias, guardar configuración (nombre → valor) o buscar un usuario por su id.</div>
<h3>📖 Cómo funciona</h3>
<p>Declaras dos tipos: <code>Map&lt;String, Integer&gt;</code> es un mapa de claves <code>String</code> a valores <code>Integer</code>. Dos implementaciones habituales:</p>
<ul><li><strong>HashMap:</strong> muy rápido, sin orden garantizado.</li><li><strong>TreeMap:</strong> mantiene las claves ordenadas.</li></ul>
<p>Métodos clave: <code>put(clave, valor)</code> agrega o <strong>reemplaza</strong> el valor si la clave existe; <code>get(clave)</code> devuelve el valor o <code>null</code> si no está; <code>getOrDefault(clave, x)</code> devuelve <code>x</code> si no está; <code>containsKey(clave)</code> comprueba si existe; <code>remove(clave)</code> borra el par. Para recorrer, <code>entrySet()</code> da los pares, y cada uno (<code>Map.Entry</code>) ofrece <code>getKey()</code> y <code>getValue()</code>.</p>
<div class="code-block"><pre><code>import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class Mapas {
    public static void main(String[] args) {
        Map&lt;String, Integer&gt; stock = new HashMap&lt;&gt;();
        stock.put("tornillos", 120);
        stock.put("clavos", 80);
        stock.put("clavos", 95);
        System.out.println(stock.get("clavos"));
        System.out.println(stock.get("tuercas"));
        System.out.println(stock.getOrDefault("tuercas", 0));
        System.out.println(stock.containsKey("tornillos"));

        Map&lt;String, Integer&gt; ordenado = new TreeMap&lt;&gt;(stock);
        for (Map.Entry&lt;String, Integer&gt; par : ordenado.entrySet()) {
            System.out.println(par.getKey() + " = " + par.getValue());
        }
    }
}

// Salida:
// 95
// null
// 0
// true
// clavos = 95
// tornillos = 120</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Hacer <code>int x = mapa.get("clave")</code> cuando la clave no existe: <code>get</code> devuelve <code>null</code> y falla con <code>NullPointerException</code>. Comprueba antes con <code>containsKey</code> o usa <code>getOrDefault</code>.</li><li>Pensar que <code>put</code> con una clave repetida agrega otro par: reemplaza el valor anterior.</li><li>Esperar orden al recorrer un <code>HashMap</code>.</li><li>Usar como clave un objeto sin <code>equals</code>/<code>hashCode</code> bien definidos.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Declara con la interfaz: <code>Map&lt;K, V&gt; m = new HashMap&lt;&gt;();</code>.</li><li>Usa <code>getOrDefault</code> o <code>containsKey</code> antes de leer una clave dudosa.</li><li>Recorre con <code>entrySet()</code>.</li><li>Si necesitas claves ordenadas, usa <code>TreeMap</code>.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>HashMap Crear y Put:</strong> crear un mapa y agregar pares.</li><li><strong>HashMap Get y ContainsKey:</strong> leer un valor y comprobar si existe una clave.</li><li><strong>HashMap Iterar:</strong> recorrer con <code>entrySet()</code> mostrando clave y valor.</li></ul>`
  },
  {
    id: 30, level: 'intermediate', module: 6, title: 'Iteradores y Ordenación',
    description: 'Recorrido y clasificación de colecciones',
    duration: '35 min',
    content: `<h2>Iteradores y Ordenación</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Dos tareas muy comunes con colecciones: <strong>recorrerlas</strong> controlando el proceso (por ejemplo, borrando elementos mientras avanzas) y <strong>ordenarlas</strong>. Un <strong>Iterator</strong> es como un dedo que señala un elemento y avanza al siguiente. Para ordenar objetos tuyos, Java necesita saber qué significa que uno sea "menor" que otro: eso lo defines con <strong>Comparable</strong>.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Ordenar productos por precio, alumnos por nota o eliminar de una lista los registros vencidos.</div>
<h3>📖 Cómo funciona</h3>
<p><strong>Iterator:</strong> obtienes uno con <code>iterator()</code>. <code>hasNext()</code> pregunta si quedan elementos, <code>next()</code> entrega el siguiente y <code>remove()</code> borra el último entregado. Es la forma <strong>segura</strong> de borrar mientras recorres.</p>
<p><strong>Comparable:</strong> una clase la implementa con <code>implements Comparable&lt;Clase&gt;</code> y escribe <code>compareTo</code>. Ese método devuelve un número <strong>negativo</strong> si este objeto va antes, <strong>0</strong> si son equivalentes y <strong>positivo</strong> si va después. Con eso funcionan <code>Collections.sort</code>, <code>TreeSet</code> y <code>Collections.max</code>.</p>
<p>Utilidades de <code>Collections</code>: <code>sort(lista)</code> ordena, <code>reverse(lista)</code> invierte el orden actual y <code>max(coleccion)</code> / <code>min(coleccion)</code> devuelven el mayor / menor. Si quieres otro criterio sin tocar la clase, pasa una regla propia: <code>lista.sort((a, b) -&gt; ...)</code> (una expresión lambda, una función corta que compara dos elementos).</p>
<div class="code-block"><pre><code>import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

public class Orden {
    static class Alumno implements Comparable&lt;Alumno&gt; {
        String nombre;
        int nota;
        Alumno(String nombre, int nota) { this.nombre = nombre; this.nota = nota; }

        @Override
        public int compareTo(Alumno otro) {
            return Integer.compare(this.nota, otro.nota);
        }

        @Override
        public String toString() { return nombre + "(" + nota + ")"; }
    }

    public static void main(String[] args) {
        List&lt;Integer&gt; numeros = new ArrayList&lt;&gt;(List.of(5, 2, 8, 1, 6));
        Iterator&lt;Integer&gt; it = numeros.iterator();
        while (it.hasNext()) {
            if (it.next() % 2 == 0) {
                it.remove();
            }
        }
        System.out.println(numeros);

        List&lt;Alumno&gt; curso = new ArrayList&lt;&gt;();
        curso.add(new Alumno("Eva", 8));
        curso.add(new Alumno("Tomás", 5));
        curso.add(new Alumno("Inés", 10));
        Collections.sort(curso);
        System.out.println(curso);
        Collections.reverse(curso);
        System.out.println(curso);
        System.out.println(Collections.max(curso));
        curso.sort((a, b) -&gt; a.nombre.compareTo(b.nombre));
        System.out.println(curso);
    }
}

// Salida:
// [5, 1]
// [Tomás(5), Eva(8), Inés(10)]
// [Inés(10), Eva(8), Tomás(5)]
// Inés(10)
// [Eva(8), Inés(10), Tomás(5)]</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Borrar con <code>lista.remove(...)</code> dentro de un <code>for-each</code>: lanza <code>ConcurrentModificationException</code>. Usa <code>Iterator.remove()</code>.</li><li>Llamar a <code>it.next()</code> sin comprobar <code>hasNext()</code>.</li><li>Confundir <code>reverse</code> con ordenar de mayor a menor: solo invierte el orden actual (ordena antes).</li><li>Escribir mal <code>compareTo</code> (restar enteros puede desbordar): usa <code>Integer.compare</code>.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Para borrar mientras recorres, usa <code>Iterator</code>.</li><li>Implementa <code>Comparable</code> para definir el orden natural de tu clase.</li><li>Usa <code>Integer.compare</code> o <code>String.compareTo</code> dentro de <code>compareTo</code>.</li><li>Para un orden alternativo, usa <code>lista.sort(...)</code> con una regla propia.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>CompareTo:</strong> implementar <code>compareTo</code> en <code>Persona</code> comparando por edad.</li><li><strong>Collections Sort:</strong> ordenar una lista de enteros.</li><li><strong>Collections Reverse:</strong> invertir una lista de textos.</li><li><strong>Collections Max:</strong> obtener el mayor de una lista.</li></ul>`
  },

  // ⚡ NIVEL AVANZADO (12 lecciones)
  {
    id: 31, level: 'advanced', module: 7, title: 'Manejo de Excepciones',
    description: 'Try, catch y flujo de errores',
    duration: '40 min',
    content: `<h2>Manejo de Excepciones</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Una <strong>excepción</strong> es un aviso que Java lanza cuando algo sale mal mientras el programa corre: dividir por cero, leer un archivo que no existe, usar un objeto <code>null</code>. Si nadie la atiende, el programa se detiene con un mensaje de error.</p>
<p>El manejo de excepciones te permite atender el problema y seguir. Es como un cartel de "calle cortada": el programa toma un desvío que tú definiste.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Un servicio web que recibe un dato mal escrito no debe caerse: captura el error, responde "dato inválido" y sigue atendiendo a los demás usuarios.</div>
<h3>📖 Cómo funciona</h3>
<p>Pones el código riesgoso dentro de <code>try</code>. Si lanza una excepción, Java salta al <code>catch</code> que coincida con su tipo. El bloque <code>finally</code> es opcional y se ejecuta siempre, haya error o no.</p>
<div class="code-block"><pre><code>public class Main {
    static int dividir(int a, int b) {
        return a / b;
    }

    public static void main(String[] args) {
        try {
            System.out.println(dividir(10, 2));
            System.out.println(dividir(5, 0));
            System.out.println("Esta línea no se ejecuta");
        } catch (ArithmeticException e) {
            System.out.println("Error: " + e.getMessage());
        } finally {
            System.out.println("Fin del cálculo");
        }
    }
}

// Salida:
// 5
// Error: / by zero
// Fin del cálculo</code></pre></div>
<p>Otras piezas que debes conocer:</p>
<ul>
<li><code>throw new Tipo("mensaje")</code> lanza una excepción tú mismo.</li>
<li><code>throws</code> en la firma de un método avisa que puede lanzar esa excepción y obliga a quien lo llame a atenderla.</li>
<li><code>catch (A | B e)</code> (multi-catch) atiende varios tipos con el mismo código. Los tipos no pueden ser padre e hijo entre sí.</li>
<li><code>e.getMessage()</code> devuelve el texto del error y <code>e.printStackTrace()</code> muestra la traza completa: la lista de métodos por los que pasó el error.</li>
</ul>
<div class="code-block"><pre><code>import java.io.IOException;

public class Main {
    static void validarEdad(int edad) {
        if (edad &lt; 0) {
            throw new IllegalArgumentException("Edad negativa: " + edad);
        }
    }

    static void guardar(String nombre) throws IOException {
        if (nombre.isEmpty()) {
            throw new IOException("Nombre vacío");
        }
        System.out.println("Guardado: " + nombre);
    }

    public static void main(String[] args) {
        try {
            guardar("Ana");
            validarEdad(25);
            guardar("");
        } catch (IOException | IllegalArgumentException e) {
            System.out.println("Falló: " + e.getMessage());
        }
    }
}

// Salida:
// Guardado: Ana
// Falló: Nombre vacío</code></pre></div>
<p>Hay dos familias: las <strong>verificadas</strong> (como <code>IOException</code>), que el compilador te obliga a atender o declarar con <code>throws</code>, y las <strong>no verificadas</strong> (como <code>NullPointerException</code> o <code>IllegalArgumentException</code>), que no lo exigen.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Un <code>catch</code> vacío: esconde el error y es muy difícil de depurar. Al menos muestra el mensaje.</li>
<li>Capturar <code>Exception</code> para todo: atrapas errores que no esperabas. Prefiere el tipo específico.</li>
<li>Poner un <code>catch</code> general antes de uno específico: el compilador lo rechaza, porque el específico nunca se alcanzaría.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>Captura el tipo más específico posible.</li>
<li>Nunca dejes un <code>catch</code> vacío.</li>
<li>Pon en <code>finally</code> la limpieza que siempre debe ocurrir.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Try-Catch Básico:</strong> captura un <code>NumberFormatException</code>.</li>
<li><strong>Múltiples Catch:</strong> dos bloques <code>catch</code> para tipos distintos.</li>
<li><strong>Finally:</strong> un bloque que se ejecuta siempre.</li>
<li><strong>Throw Exception:</strong> lanzar una excepción desde un método.</li>
<li><strong>Throws en Firma:</strong> declarar una excepción verificada.</li>
<li><strong>Multi-Catch:</strong> un solo <code>catch</code> para dos tipos.</li>
<li><strong>PrintStackTrace:</strong> mostrar la traza del error.</li>
<li><strong>NullPointerException:</strong> atender el uso de un <code>null</code>.</li>
</ul>`
  },
  {
    id: 32, level: 'advanced', module: 7, title: 'Excepciones Personalizadas',
    description: 'Creación de errores propios',
    duration: '35 min',
    content: `<h2>Excepciones Personalizadas</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Java trae muchas excepciones, pero ninguna sabe de tu negocio. Con una <strong>excepción personalizada</strong> creas un error con nombre propio, como <code>SaldoInsuficienteException</code>. Quien lee el código entiende al instante qué falló, y quien lo usa puede atender ese caso sin confundirlo con otros.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Las aplicaciones bancarias y las tiendas online definen errores como "producto sin stock" o "cuenta bloqueada" para responder al usuario con el mensaje correcto.</div>
<h3>📖 Cómo funciona</h3>
<p>Creas una clase que <strong>extiende</strong> otra excepción y pasas el mensaje al constructor padre con <code>super(mensaje)</code>. Tienes dos opciones:</p>
<ul>
<li><code>extends Exception</code>: es <strong>verificada</strong>. El compilador obliga a quien la use a atenderla o declararla con <code>throws</code>. Para errores que el llamador puede resolver.</li>
<li><code>extends RuntimeException</code>: es <strong>no verificada</strong>. No exige <code>throws</code>. Para errores de lógica o de reglas de negocio.</li>
</ul>
<p>Además, una excepción puede guardar su <strong>causa</strong>: la excepción original que la provocó. Se pasa como segundo argumento y se recupera con <code>getCause()</code>.</p>
<div class="code-block"><pre><code>public class Main {
    static class SaldoInsuficienteException extends Exception {
        public SaldoInsuficienteException(String mensaje) {
            super(mensaje);
        }
    }

    static class CuentaInvalidaException extends RuntimeException {
        public CuentaInvalidaException(String mensaje, Throwable causa) {
            super(mensaje, causa);
        }
    }

    static void retirar(double saldo, double monto) throws SaldoInsuficienteException {
        if (monto &gt; saldo) {
            throw new SaldoInsuficienteException("Faltan " + (monto - saldo) + " para retirar");
        }
        System.out.println("Retiro OK");
    }

    static void leerNumeroDeCuenta(String texto) {
        try {
            Integer.parseInt(texto);
        } catch (NumberFormatException e) {
            throw new CuentaInvalidaException("Cuenta inválida: " + texto, e);
        }
    }

    public static void main(String[] args) {
        try {
            retirar(100, 150);
        } catch (SaldoInsuficienteException e) {
            System.out.println(e.getMessage());
        }

        try {
            leerNumeroDeCuenta("12x");
        } catch (CuentaInvalidaException e) {
            System.out.println(e.getMessage());
            System.out.println("Causa: " + e.getCause().getClass().getSimpleName());
        }
    }
}

// Salida:
// Faltan 50.0 para retirar
// Cuenta inválida: 12x
// Causa: NumberFormatException</code></pre></div>
<p>Otra herramienta relacionada es <code>assert</code>, que comprueba una condición que tú das por segura:</p>
<div class="code-block"><pre><code>int edad = -5;
assert edad &gt;= 0 : "Edad no puede ser negativa";</code></pre></div>
<p>Si la condición es falsa lanza un <code>AssertionError</code>, pero solo cuando ejecutas el programa con la opción <code>-ea</code> (<em>enable assertions</em>). Por defecto están desactivadas: no las uses para validar datos del usuario.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Olvidar el constructor con <code>super(mensaje)</code>: el mensaje se pierde y <code>getMessage()</code> devuelve <code>null</code>.</li>
<li>Perder la causa original al relanzar: pasa siempre la excepción original como segundo argumento.</li>
<li>Confiar en <code>assert</code> para validar entradas: puede estar desactivado.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>El nombre de la clase debe terminar en <code>Exception</code>.</li>
<li>Ofrece un constructor que reciba el mensaje y, si aplica, otro con la causa.</li>
<li>Verificada si el llamador puede recuperarse; no verificada si es un fallo de lógica.</li>
<li>Conserva siempre la causa original al envolver una excepción.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Excepción Personalizada:</strong> una clase <code>MiExcepcion</code> que extiende <code>Exception</code>.</li>
<li><strong>RuntimeException:</strong> una clase <code>ErrorNegocio</code> no verificada.</li>
<li><strong>GetMessage:</strong> leer el mensaje de una excepción.</li>
<li><strong>Causa de Excepción:</strong> relanzar conservando la causa.</li>
<li><strong>Assert:</strong> escribir una aserción.</li>
</ul>`
  },
  {
    id: 33, level: 'advanced', module: 7, title: 'Try-with-Resources',
    description: 'Gestión automática de recursos',
    duration: '30 min',
    content: `<h2>Try-with-Resources</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>recurso</strong> es algo que se abre y hay que cerrar: un archivo, una conexión a una base de datos, una red. Si olvidas cerrarlo, queda ocupado y, con el tiempo, el programa se queda sin recursos disponibles. Es como dejar abiertas las canillas de la casa.</p>
<p><code>try-with-resources</code> cierra el recurso por ti, automáticamente, incluso si ocurre una excepción.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Cualquier código que lee archivos o consulta una base de datos usa esta forma para no dejar conexiones abiertas en un servidor que atiende miles de peticiones.</div>
<h3>📖 Cómo funciona</h3>
<p>Declaras el recurso entre paréntesis justo después de <code>try</code>. Al terminar el bloque, Java llama a su método <code>close()</code>. Funciona con cualquier clase que implemente la interfaz <code>AutoCloseable</code> (una interfaz es un contrato: obliga a tener ciertos métodos).</p>
<div class="code-block"><pre><code>public class Main {
    static class Conexion implements AutoCloseable {
        private final String nombre;

        Conexion(String nombre) {
            this.nombre = nombre;
            System.out.println("Abre " + nombre);
        }

        void usar() {
            System.out.println("Usa " + nombre);
        }

        @Override
        public void close() {
            System.out.println("Cierra " + nombre);
        }
    }

    public static void main(String[] args) {
        try (Conexion a = new Conexion("A"); Conexion b = new Conexion("B")) {
            a.usar();
            b.usar();
            throw new IllegalStateException("fallo en el medio");
        } catch (IllegalStateException e) {
            System.out.println("Capturado: " + e.getMessage());
        }
    }
}

// Salida:
// Abre A
// Abre B
// Usa A
// Usa B
// Cierra B
// Cierra A
// Capturado: fallo en el medio</code></pre></div>
<p>Fíjate en el orden: con varios recursos se cierran al revés de como se abrieron, y el cierre ocurre antes de ejecutar el <code>catch</code>.</p>
<p>El caso más común es leer un archivo. Aquí usamos un texto en memoria (<code>StringReader</code>) para que el ejemplo funcione en cualquier computadora, pero con un archivo real solo cambia el origen:</p>
<div class="code-block"><pre><code>import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;

public class Main {
    public static void main(String[] args) {
        String datos = "uno\\ndos\\ntres";
        try (BufferedReader lector = new BufferedReader(new StringReader(datos))) {
            String linea;
            while ((linea = lector.readLine()) != null) {
                System.out.println("Leí: " + linea);
            }
        } catch (IOException e) {
            System.out.println("Error de lectura: " + e.getMessage());
        }
    }
}

// Salida:
// Leí: uno
// Leí: dos
// Leí: tres</code></pre></div>
<p>Con un archivo sería <code>new BufferedReader(new FileReader("datos.txt"))</code>. Los recursos son variables de solo lectura dentro del <code>try</code>: no puedes reasignarlos.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Seguir usando el <code>try/finally</code> con <code>close()</code> manual: es más largo y fácil de hacer mal.</li>
<li>Intentar usar el recurso fuera del bloque: ya está cerrado.</li>
<li>Poner en el paréntesis algo que no es <code>AutoCloseable</code>: no compila.</li>
<li>Olvidar que <code>close()</code> también puede lanzar excepciones, por ejemplo <code>IOException</code>: deben atenderse.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>Todo recurso que se abre se declara en el paréntesis del <code>try</code>.</li>
<li>Separa varios recursos con punto y coma.</li>
<li>Se cierran en orden inverso al de apertura.</li>
<li>Tus propias clases con <code>close()</code> pueden implementar <code>AutoCloseable</code>.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Try-With-Resources:</strong> leer la primera línea de <code>file.txt</code> con un <code>BufferedReader</code> que se cierra solo.</li>
</ul>`
  },
  {
    id: 34, level: 'advanced', module: 8, title: 'Expresiones Lambda',
    description: 'Programación funcional básica',
    duration: '40 min',
    content: `<h2>Expresiones Lambda</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Una <strong>expresión lambda</strong> es una función pequeña y sin nombre que escribes en el mismo lugar donde la necesitas. Antes de Java 8 había que crear una clase completa para decir "ordena así" o "haz esto con cada elemento". La lambda lo resume en una línea.</p>
<p>Piensa en dejarle una nota a alguien: "al llegar, riega las plantas". No creas una persona nueva, solo entregas la instrucción.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Las lambdas se usan todos los días para ordenar listas, filtrar datos y reaccionar a eventos, y son la base de los streams que verás pronto.</div>
<h3>📖 Cómo funciona</h3>
<p>La forma general es <code>(parámetros) -&gt; cuerpo</code>. El símbolo <code>-&gt;</code> separa lo que entra de lo que se hace. Una lambda solo puede usarse donde Java espera una <strong>interfaz funcional</strong>: una interfaz con un único método abstracto, como <code>Runnable</code> (su método es <code>run()</code>, sin parámetros ni resultado).</p>
<ul>
<li>Sin parámetros: <code>() -&gt; ...</code></li>
<li>Un parámetro: <code>s -&gt; ...</code> (los paréntesis son opcionales)</li>
<li>Varios parámetros: <code>(a, b) -&gt; ...</code></li>
<li>Varias instrucciones: se usan llaves <code>{ }</code> y, si devuelve un valor, <code>return</code>.</li>
</ul>
<div class="code-block"><pre><code>import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Runnable saludo = () -&gt; System.out.println("Hola desde una lambda");
        saludo.run();

        List&lt;String&gt; frutas = new ArrayList&lt;&gt;(List.of("pera", "kiwi", "manzana"));
        frutas.sort((a, b) -&gt; a.length() - b.length());
        frutas.forEach(f -&gt; System.out.println(f));

        int iva = 21;
        frutas.forEach(f -&gt; {
            String mayus = f.toUpperCase();
            System.out.println(mayus + " (" + iva + "%)");
        });
    }
}

// Salida:
// Hola desde una lambda
// pera
// kiwi
// manzana
// PERA (21%)
// KIWI (21%)
// MANZANA (21%)</code></pre></div>
<p>La lambda puede leer variables de afuera, como <code>iva</code>, pero solo si son <strong>efectivamente finales</strong>: no cambian de valor después de asignarse. Si intentas modificarlas, no compila.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Modificar dentro de la lambda una variable local de afuera: da error de compilación.</li>
<li>Olvidar el punto y coma al final cuando la lambda se asigna a una variable: <code>Runnable r = () -&gt; ...;</code></li>
<li>Usar <code>return</code> sin llaves, o llaves sin <code>return</code> cuando se necesita un valor.</li>
<li>Escribir lambdas enormes: si ocupa muchas líneas, mejor un método con nombre.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>Una lambda solo existe donde se espera una interfaz funcional.</li>
<li>Pocas líneas: si crece, extráela a un método.</li>
<li>Con una sola expresión no hacen falta llaves ni <code>return</code>.</li>
<li>Las variables externas que lee deben ser efectivamente finales.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Lambda Simple:</strong> un <code>Runnable</code> sin parámetros.</li>
<li><strong>Lambda Con Parámetro:</strong> un <code>Consumer&lt;String&gt;</code>.</li>
<li><strong>Lambda Múltiples Parámetros:</strong> una suma con <code>BiFunction</code>.</li>
<li><strong>Lambda Bloque:</strong> una lambda de varias líneas con llaves.</li>
</ul>`
  },
  {
    id: 35, level: 'advanced', module: 8, title: 'Interfaces Funcionales',
    description: 'Predicate, Function, Consumer, Supplier',
    duration: '40 min',
    content: `<h2>Interfaces Funcionales</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Ya sabes que una lambda necesita una <strong>interfaz funcional</strong>: una interfaz con un solo método abstracto. No tienes que inventar la tuya cada vez: el paquete <code>java.util.function</code> trae las más usadas, listas para recibir tus lambdas. Son como moldes estándar: cada uno define "qué entra" y "qué sale".</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Los métodos de las listas y los streams reciben estas interfaces: <code>filter</code> espera un <code>Predicate</code>, <code>map</code> una <code>Function</code> y <code>forEach</code> un <code>Consumer</code>.</div>
<h3>📖 Cómo funciona</h3>
<p>Las cuatro básicas, donde <code>T</code> y <code>R</code> son tipos que tú eliges:</p>
<ul>
<li><code>Predicate&lt;T&gt;</code>: recibe un <code>T</code> y devuelve <code>boolean</code>. Método <code>test(T)</code>.</li>
<li><code>Function&lt;T, R&gt;</code>: recibe un <code>T</code> y devuelve un <code>R</code>. Método <code>apply(T)</code>.</li>
<li><code>Consumer&lt;T&gt;</code>: recibe un <code>T</code> y no devuelve nada. Método <code>accept(T)</code>.</li>
<li><code>Supplier&lt;T&gt;</code>: no recibe nada y devuelve un <code>T</code>. Método <code>get()</code>.</li>
</ul>
<p>Existen variantes de dos parámetros, como <code>BiFunction&lt;A, B, R&gt;</code>. Además se pueden combinar: <code>negate()</code> invierte un <code>Predicate</code> y <code>andThen()</code> encadena funciones.</p>
<div class="code-block"><pre><code>import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        Predicate&lt;String&gt; esLarga = s -&gt; s.length() &gt; 4;
        Function&lt;String, Integer&gt; longitud = s -&gt; s.length();
        Consumer&lt;String&gt; mostrar = s -&gt; System.out.println("&gt;&gt; " + s);
        Supplier&lt;String&gt; saludo = () -&gt; "Hola";
        BiFunction&lt;Integer, Integer, Integer&gt; multiplicar = (a, b) -&gt; a * b;

        System.out.println(esLarga.test("casa"));
        System.out.println(esLarga.negate().test("casa"));
        System.out.println(longitud.apply("lambda"));
        mostrar.accept(saludo.get());
        System.out.println(multiplicar.apply(6, 7));
        Function&lt;Integer, Integer&gt; doble = n -&gt; n * 2;
        System.out.println(longitud.andThen(doble).apply("java"));
    }
}

// Salida:
// false
// true
// 6
// &gt;&gt; Hola
// 42
// 8</code></pre></div>
<p>Cuando necesites una interfaz propia, puedes marcarla con <code>@FunctionalInterface</code>; el compilador verificará que solo tenga un método abstracto.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Confundir los métodos: <code>Predicate</code> usa <code>test</code>, <code>Function</code> usa <code>apply</code>, <code>Consumer</code> usa <code>accept</code> y <code>Supplier</code> usa <code>get</code>.</li>
<li>Usar tipos primitivos en los genéricos: se escribe <code>Predicate&lt;Integer&gt;</code>, no <code>Predicate&lt;int&gt;</code>.</li>
<li>Esperar un resultado de un <code>Consumer</code>: no devuelve nada.</li>
<li>Pensar que <code>Supplier</code> recibe parámetros: nunca los recibe.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>Pregúntate: ¿qué entra y qué sale? Eso te dice la interfaz.</li>
<li>Entra algo y sale un booleano: <code>Predicate</code>.</li>
<li>Entra algo y sale otra cosa: <code>Function</code>.</li>
<li>Entra algo y no sale nada: <code>Consumer</code>. No entra nada y sale algo: <code>Supplier</code>.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Predicate Test:</strong> un <code>Predicate&lt;Integer&gt;</code> que detecta números pares.</li>
<li><strong>Function Apply:</strong> una <code>Function</code> que calcula la longitud de un texto.</li>
<li><strong>Consumer Accept:</strong> un <code>Consumer</code> que imprime un texto.</li>
<li><strong>Supplier Get:</strong> un <code>Supplier</code> que entrega un número aleatorio.</li>
</ul>`
  },
  {
    id: 36, level: 'advanced', module: 8, title: 'Method References',
    description: 'Uso del operador ::',
    duration: '30 min',
    content: `<h2>Method References</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>A veces una lambda solo llama a un método que ya existe: <code>s -&gt; System.out.println(s)</code>. En ese caso puedes ser aún más breve con una <strong>referencia a método</strong>, que se escribe con el operador <code>::</code> (dos puntos dobles): <code>System.out::println</code>. Dices "usa este método" sin repetir los parámetros.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> En el código con streams es muy común ver <code>.map(String::trim)</code> o <code>.forEach(System.out::println)</code>: se lee casi como una frase.</div>
<h3>📖 Cómo funciona</h3>
<p>Hay cuatro formas. En cada una se muestra su lambda equivalente:</p>
<ul>
<li>Método estático: <code>Integer::parseInt</code> equivale a <code>s -&gt; Integer.parseInt(s)</code>.</li>
<li>Método de un objeto concreto: <code>System.out::println</code> equivale a <code>x -&gt; System.out.println(x)</code>.</li>
<li>Método de instancia sobre el primer parámetro: <code>String::toUpperCase</code> equivale a <code>s -&gt; s.toUpperCase()</code>.</li>
<li>Constructor: <code>ArrayList::new</code> equivale a <code>() -&gt; new ArrayList()</code>.</li>
</ul>
<div class="code-block"><pre><code>import java.util.List;
import java.util.function.*;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        Function&lt;String, Integer&gt; convertir = Integer::parseInt;
        Consumer&lt;String&gt; imprimir = System.out::println;
        Function&lt;String, String&gt; mayus = String::toUpperCase;
        Supplier&lt;List&lt;String&gt;&gt; fabrica = ArrayList::new;

        imprimir.accept("Número: " + (convertir.apply("41") + 1));
        imprimir.accept(mayus.apply("hola"));
        List&lt;String&gt; lista = fabrica.get();
        lista.add("uno");
        List.of("a", "b").forEach(imprimir);
        System.out.println(lista);
    }
}

// Salida:
// Número: 42
// HOLA
// a
// b
// [uno]</code></pre></div>
<p>No llevan paréntesis después del nombre: <code>Integer::parseInt</code> no ejecuta nada, solo apunta al método. Se ejecuta cuando la interfaz funcional que lo recibe lo necesita.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Escribir paréntesis: <code>System.out::println()</code> no compila.</li>
<li>Usar <code>.</code> en lugar de <code>::</code>.</li>
<li>Usar una referencia cuya firma no coincide con la interfaz: por ejemplo, un <code>Consumer</code> necesita un método que reciba un valor.</li>
<li>Forzarla cuando la lambda es más clara: si hay que calcular algo extra, usa la lambda.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>Si tu lambda solo llama a un método, pásala a referencia.</li>
<li><code>Clase::metodo</code>, <code>objeto::metodo</code> y <code>Clase::new</code> son las tres formas más usadas.</li>
<li>Nunca llevan paréntesis.</li>
<li>La firma del método debe encajar con la interfaz funcional.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Method Reference Static:</strong> una <code>Function</code> que convierte texto en número con <code>Integer::parseInt</code>.</li>
<li><strong>Method Reference Instance:</strong> un <code>Consumer</code> con <code>System.out::println</code>.</li>
<li><strong>Method Reference Constructor:</strong> un <code>Supplier</code> de listas con <code>ArrayList::new</code>.</li>
</ul>`
  },
  {
    id: 37, level: 'advanced', module: 8, title: 'Optional',
    description: 'Manejo seguro de valores nulos',
    duration: '35 min',
    content: `<h2>Optional</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>El <code>null</code> significa "no hay nada aquí", y si lo usas sin revisar, Java lanza <code>NullPointerException</code>. <code>Optional&lt;T&gt;</code> es una caja que puede contener un valor o estar vacía. Al devolverla, un método dice con claridad: "puede que no haya resultado" y te obliga a pensar en ese caso.</p>
<p>Es como un paquete de delivery: puede traer el producto o venir vacío, pero siempre puedes abrirlo con seguridad.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Los métodos de búsqueda (usuario por email, producto por código) suelen devolver un <code>Optional</code>, porque el elemento puede no existir.</div>
<h3>📖 Cómo funciona</h3>
<p>Para crear uno:</p>
<ul>
<li><code>Optional.empty()</code>: caja vacía.</li>
<li><code>Optional.of(valor)</code>: caja con valor. Lanza <code>NullPointerException</code> si le pasas <code>null</code>.</li>
<li><code>Optional.ofNullable(valor)</code>: caja con el valor, o vacía si es <code>null</code>.</li>
</ul>
<p>Para usarlo sin riesgos:</p>
<ul>
<li><code>isPresent()</code> / <code>isEmpty()</code>: ¿hay valor?</li>
<li><code>orElse(x)</code>: el valor, o <code>x</code> si está vacío.</li>
<li><code>ifPresent(lambda)</code>: ejecuta la lambda solo si hay valor.</li>
<li><code>map(función)</code>: transforma el valor si existe y deja la caja vacía si no.</li>
</ul>
<div class="code-block"><pre><code>import java.util.Optional;

public class Main {
    static Optional&lt;String&gt; buscarEmail(String usuario) {
        if (usuario.equals("ana")) {
            return Optional.of("ana@ejemplo.com");
        }
        return Optional.empty();
    }

    public static void main(String[] args) {
        Optional&lt;String&gt; a = buscarEmail("ana");
        Optional&lt;String&gt; b = buscarEmail("luis");

        System.out.println(a.isPresent());
        System.out.println(b.orElse("sin email"));
        a.ifPresent(e -&gt; System.out.println("Email: " + e));
        System.out.println(a.map(String::toUpperCase).orElse("-"));

        String nulo = null;
        Optional&lt;String&gt; seguro = Optional.ofNullable(nulo);
        System.out.println(seguro.isEmpty());
        try {
            Optional.of(nulo);
        } catch (NullPointerException e) {
            System.out.println("Optional.of no acepta null");
        }
    }
}

// Salida:
// true
// sin email
// Email: ana@ejemplo.com
// ANA@EJEMPLO.COM
// true
// Optional.of no acepta null</code></pre></div>
<p><code>get()</code> también existe, pero lanza <code>NoSuchElementException</code> si la caja está vacía. Úsalo solo después de comprobar <code>isPresent()</code>; casi siempre hay una opción mejor, como <code>orElse</code> o <code>ifPresent</code>.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Llamar a <code>get()</code> sin comprobar: trasladas el error de <code>null</code> a otra excepción.</li>
<li>Usar <code>Optional.of</code> con un valor que puede ser <code>null</code>: usa <code>ofNullable</code>.</li>
<li>Devolver <code>null</code> en un método cuyo tipo es <code>Optional</code>: debes devolver <code>Optional.empty()</code>.</li>
<li>Usar <code>Optional</code> en campos o parámetros: está pensado para valores de retorno.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>Un método que puede no encontrar nada devuelve <code>Optional</code>.</li>
<li><code>ofNullable</code> para valores dudosos, <code>of</code> solo si estás seguro de que no son <code>null</code>.</li>
<li>Prefiere <code>orElse</code>, <code>ifPresent</code> y <code>map</code> antes que <code>get()</code>.</li>
<li>Nunca devuelvas <code>null</code> donde se espera un <code>Optional</code>.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Optional Empty:</strong> crear un <code>Optional</code> vacío.</li>
<li><strong>Optional Of:</strong> crear uno con el valor <code>"Hola"</code>.</li>
<li><strong>Optional OfNullable:</strong> crear uno a partir de un texto que es <code>null</code>.</li>
<li><strong>Optional IsPresent:</strong> comprobar si tiene valor y mostrarlo.</li>
<li><strong>Optional OrElse:</strong> obtener un valor por defecto.</li>
<li><strong>Optional IfPresent:</strong> ejecutar una acción solo si hay valor.</li>
</ul>`
  },
  {
    id: 38, level: 'advanced', module: 9, title: 'Streams: Filter y Map',
    description: 'Procesamiento de datos funcional',
    duration: '45 min',
    content: `<h2>Streams: Filter y Map</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>stream</strong> es una secuencia de elementos (por ejemplo, los de una lista) por la que pasas una cadena de pasos: "quédate con estos", "transforma así", "ordena". Describes <em>qué</em> quieres obtener y no escribes el bucle <code>for</code> con sus variables auxiliares. Es como una línea de producción: las piezas entran, cada estación hace su trabajo y sale el resultado.</p>
<p>Un stream no guarda datos ni modifica la lista original: produce un resultado nuevo.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Se usan para preparar datos antes de mostrarlos: "pedidos de este mes, solo los pagados, convertidos a su total".</div>
<h3>📖 Cómo funciona</h3>
<p>Un stream tiene tres partes: se crea con <code>lista.stream()</code>, se le aplican <strong>operaciones intermedias</strong> que devuelven otro stream, y se cierra con una <strong>operación terminal</strong> que produce el resultado. Las intermedias más usadas:</p>
<ul>
<li><code>filter(predicado)</code>: conserva los elementos que cumplen la condición.</li>
<li><code>map(función)</code>: transforma cada elemento en otro.</li>
<li><code>sorted()</code>: ordena. <code>distinct()</code>: quita repetidos. <code>limit(n)</code>: toma los primeros n.</li>
</ul>
<p>Terminales básicas: <code>forEach(acción)</code> ejecuta algo con cada elemento y <code>toList()</code> (o <code>collect(Collectors.toList())</code>) arma una lista.</p>
<div class="code-block"><pre><code>import java.util.List;

public class Main {
    public static void main(String[] args) {
        List&lt;Integer&gt; nums = List.of(5, 2, 8, 2, 9, 4);

        List&lt;Integer&gt; resultado = nums.stream()
            .filter(n -&gt; n &gt; 3)
            .map(n -&gt; n * 10)
            .distinct()
            .sorted()
            .limit(3)
            .toList();
        System.out.println(resultado);

        nums.stream()
            .filter(n -&gt; {
                System.out.println("filtra " + n);
                return n % 2 == 0;
            })
            .findFirst();
    }
}

// Salida:
// [40, 50, 80]
// filtra 5
// filtra 2</code></pre></div>
<p>La segunda parte del ejemplo muestra un detalle importante: los streams son <strong>perezosos</strong>. Nada se ejecuta hasta que hay una terminal, y se detienen apenas tienen su respuesta. Por eso solo aparecen "filtra 5" y "filtra 2": al encontrar el primer par, no se revisa el resto.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Olvidar la operación terminal: sin ella no pasa nada.</li>
<li>Reutilizar un stream ya consumido: lanza <code>IllegalStateException</code>. Crea uno nuevo con <code>.stream()</code>.</li>
<li>Esperar que el stream cambie la lista original: devuelve una colección nueva.</li>
<li>Poner <code>limit</code> o <code>sorted</code> en un orden que cambia el resultado: el orden de los pasos importa.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>Fuente, intermedias, terminal: siempre en ese orden.</li>
<li><code>filter</code> decide quién pasa; <code>map</code> cambia lo que pasa.</li>
<li>Un stream se usa una sola vez.</li>
<li>Escribe cada paso en su propia línea para leerlo mejor.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Stream Filter:</strong> quedarte con los números pares.</li>
<li><strong>Stream Map:</strong> convertir nombres en sus longitudes.</li>
<li><strong>Stream ForEach:</strong> imprimir cada elemento.</li>
<li><strong>Stream Sorted:</strong> ordenar números.</li>
<li><strong>Stream Distinct:</strong> eliminar repetidos.</li>
<li><strong>Stream Limit:</strong> tomar los primeros tres.</li>
</ul>`
  },
  {
    id: 39, level: 'advanced', module: 9, title: 'Collectors y Terminales',
    description: 'Finalización de flujo de streams',
    duration: '40 min',
    content: `<h2>Collectors y Terminales</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un stream no sirve de nada hasta que lo cierras con una <strong>operación terminal</strong>: el paso que ejecuta todo y entrega un resultado, que puede ser un número, un booleano, una lista o un mapa. Un <strong>Collector</strong> es una receta para recoger los elementos en una colección o en un texto.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Con una terminal calculas el total de una factura, verificas si hay stock para todos los productos o agrupas ventas por categoría.</div>
<h3>📖 Cómo funciona</h3>
<p>Terminales frecuentes:</p>
<ul>
<li><code>count()</code>: cuántos elementos hay (devuelve <code>long</code>).</li>
<li><code>reduce(inicial, acumulador)</code>: combina todos los elementos en un solo valor. Parte de <code>inicial</code> y aplica la función a cada elemento. Con <code>0</code> y <code>(a, b) -&gt; a + b</code> es una suma.</li>
<li><code>anyMatch(p)</code>: ¿alguno cumple? <code>allMatch(p)</code>: ¿todos cumplen? <code>noneMatch(p)</code>: ¿ninguno?</li>
<li><code>collect(collector)</code>: recoge los elementos con una receta de <code>Collectors</code>.</li>
</ul>
<p>Collectors habituales: <code>toList()</code>, <code>joining(", ")</code> para unir textos y <code>groupingBy(función)</code> para agrupar en un mapa (una estructura clave-valor).</p>
<div class="code-block"><pre><code>import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List&lt;String&gt; palabras = List.of("sol", "luna", "mar", "cielo", "tierra");

        System.out.println(palabras.stream().count());
        System.out.println(palabras.stream().anyMatch(p -&gt; p.length() &gt; 5));
        System.out.println(palabras.stream().allMatch(p -&gt; p.length() &gt;= 3));
        int totalLetras = palabras.stream().map(String::length).reduce(0, (a, b) -&gt; a + b);
        System.out.println(totalLetras);

        System.out.println(palabras.stream().collect(Collectors.joining(", ")));
        Map&lt;Integer, List&lt;String&gt;&gt; porLargo = palabras.stream()
            .collect(Collectors.groupingBy(String::length));
        System.out.println(porLargo);
    }
}

// Salida:
// 5
// true
// true
// 21
// sol, luna, mar, cielo, tierra
// {3=[sol, mar], 4=[luna], 5=[cielo], 6=[tierra]}</code></pre></div>
<p>En <code>groupingBy</code>, la función decide la clave de cada grupo: aquí, la cantidad de letras de cada palabra.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Asignar <code>count()</code> a un <code>int</code>: devuelve <code>long</code>. Usa <code>long</code> o un casteo.</li>
<li>Olvidar el valor inicial de <code>reduce</code> o poner uno equivocado (para sumar es <code>0</code>; para multiplicar, <code>1</code>).</li>
<li>Confundir <code>anyMatch</code> y <code>allMatch</code>: en un stream vacío, <code>allMatch</code> da <code>true</code> y <code>anyMatch</code> da <code>false</code>.</li>
<li>Intentar usar el stream otra vez después de la terminal.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>Sin terminal, el stream no hace nada.</li>
<li>Para un número o booleano usa terminales; para una colección usa <code>collect</code>.</li>
<li>El valor inicial de <code>reduce</code> debe ser el neutro de la operación.</li>
<li>Para mapas por categoría, <code>groupingBy</code>.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>Stream Count:</strong> contar los elementos de una lista.</li>
<li><strong>Stream Reduce:</strong> sumar los números con <code>reduce</code>.</li>
<li><strong>Stream AnyMatch:</strong> comprobar si algún número es par.</li>
<li><strong>Stream AllMatch:</strong> comprobar si todos son pares.</li>
</ul>`
  },
  {
    id: 40, level: 'advanced', module: 9, title: 'Parallel Streams',
    description: 'Rendimiento en multinúcleo',
    duration: '35 min',
    content: `<h2>Parallel Streams</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Las computadoras actuales tienen varios <strong>núcleos</strong>: unidades que pueden trabajar al mismo tiempo. Un <strong>stream paralelo</strong> reparte los elementos entre varios núcleos para procesarlos a la vez, en lugar de uno por uno. Es como cuatro cajeros atendiendo una fila grande, en vez de uno solo.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Se usa en cálculos pesados sobre grandes volúmenes de datos, como procesar millones de registros. Para colecciones pequeñas no conviene.</div>
<h3>📖 Cómo funciona</h3>
<p>Basta con pedir <code>parallelStream()</code> en lugar de <code>stream()</code>, o llamar a <code>.parallel()</code> en un stream existente. El resto del código es igual. Java usa un grupo de hilos (<em>threads</em>: líneas de ejecución independientes) para repartir el trabajo.</p>
<div class="code-block"><pre><code>import java.util.stream.IntStream;

public class Main {
    public static void main(String[] args) {
        long secuencial = IntStream.rangeClosed(1, 1_000_000).asLongStream().sum();
        long paralelo = IntStream.rangeClosed(1, 1_000_000).parallel().asLongStream().sum();
        System.out.println(secuencial);
        System.out.println(paralelo);

        IntStream.rangeClosed(1, 5).parallel().forEachOrdered(n -&gt; System.out.print(n + " "));
        System.out.println();
    }
}

// Salida:
// 500000500000
// 500000500000
// 1 2 3 4 5</code></pre></div>
<p>El resultado de una suma es el mismo. Lo que cambia es el <strong>orden</strong> en que se procesan los elementos: en un stream paralelo no está garantizado. Si necesitas respetar el orden original al recorrer, usa <code>forEachOrdered</code>, como en el ejemplo.</p>
<p>Paralelo no significa siempre más rápido. Repartir el trabajo tiene un costo, y solo compensa si hay muchos elementos y cada operación es costosa. Si el volumen es pequeño, el secuencial suele ganar.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Modificar una variable o lista compartida desde la lambda: varios hilos escribiendo a la vez producen resultados erróneos o impredecibles.</li>
<li>Usar paralelo con pocos datos: es más lento por el trabajo de coordinación.</li>
<li>Depender del orden con <code>forEach</code>: en paralelo puede salir desordenado.</li>
<li>Usarlo con operaciones lentas de entrada/salida (red, disco): los núcleos quedan esperando.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>Primero haz que funcione en secuencial y mide antes de pasar a paralelo.</li>
<li>Las operaciones deben ser independientes y no modificar estado compartido.</li>
<li>Usa paralelo solo con muchos datos y trabajo pesado por elemento.</li>
<li>Si importa el orden, usa <code>forEachOrdered</code> o un stream secuencial.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<p>Esta lección es de lectura: no tiene ejercicios propios. Marca la lección como completada cuando la hayas entendido.</p>`
  },
  {
    id: 41, level: 'advanced', module: 10, title: 'File I/O y NIO.2',
    description: 'Lectura y escritura de archivos',
    duration: '40 min',
    content: `<h2>File I/O y NIO.2</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Las variables desaparecen cuando el programa termina. Para conservar información la escribes en un <strong>archivo</strong> y luego la lees. <strong>I/O</strong> significa <em>Input/Output</em>: entrada y salida de datos.</p>
<p>Java moderno ofrece <strong>NIO.2</strong>, un conjunto de clases del paquete <code>java.nio.file</code>, más simple que el estilo antiguo (<code>java.io</code>). Dos piezas clave: <code>Path</code>, que representa una ruta, y <code>Files</code>, con métodos para operar sobre ella.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Los programas leen archivos de configuración al iniciar, generan reportes en CSV y escriben registros (logs) de lo que ocurre.</div>
<h3>📖 Cómo funciona</h3>
<p>Los métodos más usados de <code>Files</code>, siempre con un <code>Path</code> creado con <code>Path.of("ruta")</code>:</p>
<ul>
<li><code>Files.writeString(ruta, texto)</code>: escribe un texto (crea o reemplaza el archivo).</li>
<li><code>Files.readString(ruta)</code> y <code>Files.readAllLines(ruta)</code>: leen todo el contenido, o una lista de líneas.</li>
<li><code>Files.exists(ruta)</code>: ¿existe? <code>Files.deleteIfExists(ruta)</code>: lo borra si está.</li>
</ul>
<div class="code-block"><pre><code>import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class Main {
    public static void main(String[] args) throws IOException {
        Path ruta = Path.of("notas.txt");
        Files.writeString(ruta, "Java\\nPython\\n");
        System.out.println(Files.exists(ruta));
        System.out.println(Files.readString(ruta).length());

        try (BufferedWriter bw = Files.newBufferedWriter(ruta)) {
            bw.write("Línea 1");
            bw.newLine();
            bw.write("Línea 2");
        }
        List&lt;String&gt; lineas = Files.readAllLines(ruta);
        System.out.println(lineas);

        Files.deleteIfExists(ruta);
        System.out.println(Files.exists(ruta));
    }
}

// Salida:
// true
// 12
// [Línea 1, Línea 2]
// false</code></pre></div>
<p>Casi todos estos métodos pueden lanzar <code>IOException</code> (verificada), por eso el ejemplo declara <code>throws IOException</code> en <code>main</code>.</p>
<p>Para archivos grandes no conviene cargar todo en memoria. <code>Files.lines(ruta)</code> devuelve un <code>Stream&lt;String&gt;</code> que lee línea por línea. Es un recurso abierto, así que se usa con <code>try-with-resources</code>. También existen <code>BufferedReader</code> (su <code>readLine()</code> devuelve <code>null</code> al terminar) y <code>BufferedWriter</code>, que usan un buffer (memoria intermedia) para trabajar más rápido.</p>
<div class="code-block"><pre><code>import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) throws IOException {
        Path ruta = Path.of("lenguajes.txt");
        Files.writeString(ruta, "Java es genial\\nPython es popular\\nJava 21\\n");
        try (Stream&lt;String&gt; lineas = Files.lines(ruta)) {
            lineas.filter(l -&gt; l.startsWith("Java")).forEach(System.out::println);
        }
        Files.delete(ruta);
    }
}

// Salida:
// Java es genial
// Java 21</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Leer un archivo que no existe: lanza <code>NoSuchFileException</code>. Comprueba con <code>Files.exists</code> o atiende la excepción.</li>
<li>Olvidar cerrar los lectores y escritores: usa <code>try-with-resources</code>.</li>
<li>Pensar que <code>writeString</code> añade al final: reemplaza el contenido. Para añadir usa la opción <code>StandardOpenOption.APPEND</code>.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>Prefiere <code>Path</code> y <code>Files</code> a las clases antiguas.</li>
<li>Todo lo que abres se cierra con <code>try-with-resources</code>.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul>
<li><strong>File Write:</strong> escribir un texto en <code>archivo.txt</code> con <code>Files.writeString</code>.</li>
<li><strong>File Read:</strong> leer ese archivo con <code>Files.readString</code>.</li>
<li><strong>File Exists:</strong> comprobar si existe.</li>
<li><strong>File Delete:</strong> borrarlo con <code>deleteIfExists</code>.</li>
<li><strong>BufferedReader:</strong> leer <code>file.txt</code> línea por línea.</li>
<li><strong>BufferedWriter:</strong> escribir dos líneas con buffer.</li>
<li><strong>Files Lines Stream:</strong> filtrar las líneas de un archivo con <code>Files.lines</code>.</li>
</ul>`
  },
  {
    id: 42, level: 'advanced', module: 10, title: 'Serialización',
    description: 'Persistencia de objetos',
    duration: '35 min',
    content: `<h2>Serialización</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p><strong>Serializar</strong> es convertir un objeto en una secuencia de bytes para guardarlo en un archivo o enviarlo por la red. <strong>Deserializar</strong> es el camino inverso: reconstruir el objeto a partir de esos bytes. Es como desarmar un mueble para llevarlo en la caja y volver a armarlo en destino.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Se usa para guardar el estado de una aplicación o intercambiar objetos entre programas. Hoy muchas aplicaciones prefieren formatos como JSON, pero la serialización nativa aparece en sistemas Java existentes.</div>
<h3>📖 Cómo funciona</h3>
<p>Para que una clase pueda serializarse, debe implementar la interfaz <code>Serializable</code>. Es una interfaz "marcador": no tiene métodos, solo indica a Java que es seguro convertir esos objetos en bytes. Se escribe con <code>ObjectOutputStream.writeObject</code> y se lee con <code>ObjectInputStream.readObject</code>, que requiere un casteo al tipo original.</p>
<ul>
<li><code>transient</code> marca un campo que no debe guardarse (por ejemplo, una contraseña). Al deserializar vale <code>null</code>, <code>0</code> o <code>false</code>.</li>
<li><code>serialVersionUID</code> es un número que identifica la versión de la clase. Si cambias la clase y el número no coincide, la lectura falla con <code>InvalidClassException</code>.</li>
<li>Todos los campos que se guardan deben ser también serializables.</li>
</ul>
<div class="code-block"><pre><code>import java.io.*;

public class Main {
    static class Persona implements Serializable {
        private static final long serialVersionUID = 1L;
        String nombre;
        transient String clave;

        Persona(String nombre, String clave) {
            this.nombre = nombre;
            this.clave = clave;
        }
    }

    public static void main(String[] args) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(new Persona("Ana", "secreta"));
        }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            Persona p = (Persona) in.readObject();
            System.out.println(p.nombre + " / " + p.clave);
        }
    }
}

// Salida: Ana / null</code></pre></div>
<p>El ejemplo escribe en memoria (<code>ByteArrayOutputStream</code>) para ser autocontenido; con un archivo usarías <code>FileOutputStream</code> y <code>FileInputStream</code>. Observa que <code>clave</code>, al ser <code>transient</code>, no sobrevivió.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul>
<li>Olvidar <code>implements Serializable</code>: lanza <code>NotSerializableException</code>.</li>
<li>Guardar un campo cuyo tipo no es serializable.</li>
<li>Cambiar la clase sin cuidar <code>serialVersionUID</code>: los archivos antiguos dejan de poder leerse.</li>
<li>Deserializar datos que no son de confianza: es un riesgo de seguridad serio, porque se puede ejecutar código no deseado.</li>
</ul></div>
<h3>✅ Reglas de Oro</h3>
<ul>
<li>Declara siempre un <code>serialVersionUID</code> explícito.</li>
<li>Marca como <code>transient</code> los datos sensibles o innecesarios.</li>
<li>Nunca deserialices datos de origen desconocido.</li>
<li>Para intercambiar datos con otros sistemas, valora formatos abiertos como JSON.</li>
</ul>
<h3>🧪 Lo que vas a practicar</h3>
<p>Esta lección es de lectura: no tiene ejercicios propios. Marca la lección como completada cuando la hayas entendido.</p>`
  },

  // 👑 NIVEL EXPERTO (10 lecciones)
  {
    id: 43, level: 'expert', module: 11, title: 'Threads y Runnable',
    description: 'Hilos y ejecución concurrente',
    duration: '45 min',
    content: `<h2>Threads y Runnable</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>hilo</strong> (<em>thread</em>) es un camino de ejecución dentro de tu programa. Hasta ahora todo tu código corría en un solo hilo, el principal (<code>main</code>): una instrucción tras otra. Con varios hilos, el programa puede hacer varias cosas <strong>a la vez</strong> (concurrencia). Es como una cocina con varios cocineros: mientras uno corta, otro hierve el agua.</p>
<p>Lo necesitas cuando una tarea lenta (leer un archivo, esperar una red) no debe congelar al resto del programa.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Un servidor web atiende a muchos usuarios a la vez, y una aplicación con pantalla sigue respondiendo mientras descarga datos en segundo plano.</div>
<h3>📖 Cómo funciona</h3>
<p>Hay dos formas de definir qué hace un hilo. En ambas escribes el método <code>run()</code>, que contiene el trabajo:</p>
<ul><li><strong>Extender <code>Thread</code></strong>: tu clase es un hilo y sobrescribe <code>run()</code>.</li><li><strong>Implementar <code>Runnable</code></strong>: una interfaz con un solo método, <code>run()</code>. Es la opción recomendada, porque separa "la tarea" de "el hilo que la ejecuta" y permite escribirla como lambda.</li></ul>
<div class="code-block"><pre><code>class Reloj extends Thread {
    @Override
    public void run() {
        System.out.println("tic");
    }
}
// Uso: new Reloj().start();</code></pre></div>
<p>Para arrancar el hilo se llama a <code>start()</code>. Con <code>join()</code> el hilo actual espera a que otro termine, y <code>Thread.sleep(ms)</code> lo pausa unos milisegundos (lanza <code>InterruptedException</code>, una excepción comprobada: hay que capturarla o declararla con <code>throws</code>).</p>
<div class="code-block"><pre><code>public class DosHilos {
    public static void main(String[] args) throws InterruptedException {
        Runnable cocinar = () -&gt;
            System.out.println("Cocinando en el hilo " + Thread.currentThread().getName());
        Thread t = new Thread(cocinar, "cocina");
        t.start();
        t.join();
        System.out.println("Sirviendo en el hilo " + Thread.currentThread().getName());
    }
}

// Salida:
// Cocinando en el hilo cocina
// Sirviendo en el hilo main</code></pre></div>
<p>Sin el <code>join()</code>, el orden de los mensajes no estaría garantizado: ambos hilos corren al mismo tiempo y el sistema decide quién avanza primero.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Llamar a <code>run()</code> en lugar de <code>start()</code>: no crea ningún hilo, solo ejecuta el método en el hilo actual.</li><li>Llamar a <code>start()</code> dos veces sobre el mismo objeto: lanza <code>IllegalThreadStateException</code>.</li><li>Olvidar <code>join()</code> y usar un resultado antes de que el hilo termine.</li><li>Dejar vacío el <code>catch</code> de <code>InterruptedException</code>: al menos muestra el error.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Usa <code>start()</code> para arrancar; nunca <code>run()</code>.</li><li>Prefiere <code>Runnable</code> a extender <code>Thread</code>.</li><li>Nunca supongas el orden de ejecución entre hilos.</li><li>Usa <code>join()</code> cuando necesites esperar el final de un hilo.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Thread Extends</strong>: crear una clase que extiende <code>Thread</code> y sobrescribe <code>run()</code>.</li><li><strong>Runnable Interface</strong>: crear una clase que implementa <code>Runnable</code>.</li><li><strong>Thread Start</strong>: iniciar un hilo ya creado con <code>start()</code>.</li><li><strong>Thread Sleep</strong>: pausar el hilo actual con <code>Thread.sleep</code>.</li><li><strong>Thread Join</strong>: esperar a que un hilo termine con <code>join()</code>.</li></ul>`
  },
  {
    id: 44, level: 'expert', module: 11, title: 'Sincronización y Locks',
    description: 'Seguridad entre hilos',
    duration: '45 min',
    content: `<h2>Sincronización y Locks</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Cuando dos hilos modifican el mismo dato al mismo tiempo, el resultado puede salir mal. Una operación como <code>contador++</code> parece una sola, pero son tres pasos (leer, sumar, guardar), y dos hilos pueden pisarse entre sí. Eso se llama <strong>condición de carrera</strong>. Es como dos personas anotando a la vez en la misma pizarra: una borra lo que escribió la otra.</p>
<p>La <strong>sincronización</strong> hace que solo un hilo a la vez use la parte crítica del código. Además, Java ofrece herramientas ya listas para esto.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Un contador de visitas, el saldo de una cuenta o una caché compartida entre peticiones web necesitan protección cuando varios hilos los usan.</div>
<h3>📖 Cómo funciona</h3>
<ul><li><code>synchronized</code> en un método, o en un bloque <code>synchronized (objeto) { ... }</code>: solo entra un hilo a la vez por cada objeto usado como candado.</li><li><code>volatile</code>: garantiza que todos los hilos vean el valor más reciente de una variable. Sirve para banderas (<code>boolean</code>), pero <strong>no</strong> vuelve atómico un <code>contador++</code>.</li><li><code>AtomicInteger</code>: contador seguro sin <code>synchronized</code>, con métodos como <code>incrementAndGet()</code>.</li><li><code>ReentrantLock</code>: candado explícito, más flexible. Siempre se libera en un <code>finally</code>. <code>ReentrantReadWriteLock</code> (interfaz <code>ReadWriteLock</code>) permite muchos lectores a la vez, o un solo escritor.</li></ul>
<div class="code-block"><pre><code>import java.util.concurrent.atomic.AtomicInteger;

public class ContadorSeguro {
    private int visitas = 0;
    private final AtomicInteger pedidos = new AtomicInteger();

    synchronized void registrarVisita() {
        visitas++;
    }

    public static void main(String[] args) throws InterruptedException {
        ContadorSeguro c = new ContadorSeguro();
        Runnable tarea = () -&gt; {
            for (int i = 0; i &lt; 10000; i++) {
                c.registrarVisita();
                c.pedidos.incrementAndGet();
            }
        };
        Thread t1 = new Thread(tarea);
        Thread t2 = new Thread(tarea);
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println("Visitas: " + c.visitas);
        System.out.println("Pedidos: " + c.pedidos.get());
    }
}

// Salida:
// Visitas: 20000
// Pedidos: 20000</code></pre></div>
<div class="code-block"><pre><code>private final ReentrantLock lock = new ReentrantLock();
private int saldo = 100;

void retirar(int monto) {
    lock.lock();
    try {
        saldo -= monto;
    } finally {
        lock.unlock();   // se libera aunque haya una excepción
    }
}</code></pre></div>
<p>También existen colecciones preparadas para varios hilos: <code>ConcurrentHashMap</code> (mapa), <code>CopyOnWriteArrayList</code> (lista, ideal si se lee mucho y se escribe poco) y <code>BlockingQueue</code> (cola: <code>put</code> espera si está llena y <code>take</code> espera si está vacía).</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Creer que <code>volatile</code> basta para <code>contador++</code>: no es atómico.</li><li>Olvidar <code>unlock()</code> en un <code>finally</code>: si hay una excepción, el candado queda tomado para siempre.</li><li>Sincronizar sobre objetos distintos en cada hilo: no protege nada.</li><li>Usar <code>ArrayList</code> o <code>HashMap</code> normales desde varios hilos.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Protege todo acceso de escritura (y lectura relacionada) al dato compartido.</li><li>Prefiere <code>AtomicInteger</code> y las colecciones concurrentes antes que escribir candados propios.</li><li>Mantén las zonas sincronizadas lo más cortas posible.</li><li><code>lock()</code> y <code>try/finally</code> con <code>unlock()</code>, siempre juntos.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Synchronized Method</strong>: método <code>incrementar()</code> sincronizado.</li><li><strong>Synchronized Block</strong>: bloque <code>synchronized</code> sobre un objeto candado.</li><li><strong>Volatile Variable</strong>: declarar una bandera <code>volatile</code>.</li><li><strong>AtomicInteger</strong>: contador atómico.</li><li><strong>ConcurrentHashMap</strong> y <strong>CopyOnWriteArrayList</strong>: colecciones seguras para hilos.</li><li><strong>BlockingQueue</strong>: <code>put</code> y <code>take</code> en una cola bloqueante.</li><li><strong>ReentrantLock</strong> y <strong>ReadWriteLock</strong>: candados explícitos con <code>finally</code>.</li></ul>`
  },
  {
    id: 45, level: 'expert', module: 11, title: 'Executor Service',
    description: 'Administración de pools de hilos',
    duration: '40 min',
    content: `<h2>Executor Service</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Crear un hilo nuevo con <code>new Thread(...)</code> para cada tarea es caro y difícil de controlar. Un <strong>pool de hilos</strong> es un grupo fijo de hilos reutilizables: tú entregas tareas y el pool las reparte. Es como un equipo de cajeros en un supermercado: los clientes (tareas) hacen fila y cada cajero atiende al siguiente que llega.</p>
<p>En Java se usa la interfaz <code>ExecutorService</code>, que se crea con <code>Executors</code>.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Los servidores de aplicaciones usan pools para atender peticiones sin crear miles de hilos, y los procesos por lotes reparten el trabajo entre unos pocos hilos.</div>
<h3>📖 Cómo funciona</h3>
<ol><li>Crea el pool: <code>Executors.newFixedThreadPool(2)</code> (2 hilos).</li><li>Envía tareas con <code>submit(...)</code>. Un <code>Runnable</code> no devuelve nada; un <code>Callable&lt;T&gt;</code> sí devuelve un valor de tipo <code>T</code>.</li><li><code>submit</code> devuelve un <code>Future&lt;T&gt;</code>: una "promesa" del resultado. <code>get()</code> espera hasta que esté listo.</li><li>Al terminar, llama a <code>shutdown()</code>; si no, el programa puede quedarse abierto.</li></ol>
<div class="code-block"><pre><code>import java.util.concurrent.*;

public class SumasEnPool {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);

        Callable&lt;Integer&gt; sumar = () -&gt; {
            int total = 0;
            for (int i = 1; i &lt;= 100; i++) {
                total += i;
            }
            return total;
        };
        Future&lt;Integer&gt; futuro = pool.submit(sumar);
        System.out.println("Suma: " + futuro.get());

        CountDownLatch listos = new CountDownLatch(3);
        for (int i = 1; i &lt;= 3; i++) {
            pool.submit(listos::countDown);
        }
        listos.await();
        System.out.println("Los 3 trabajadores terminaron");

        pool.shutdown();
    }
}

// Salida:
// Suma: 5050
// Los 3 trabajadores terminaron</code></pre></div>
<p>El ejemplo usa también <code>CountDownLatch</code>: un contador que empieza en N; los hilos llaman a <code>countDown()</code> y quien llama a <code>await()</code> espera a que llegue a 0. Otras herramientas de coordinación:</p>
<div class="code-block"><pre><code>// Todos los hilos esperan aquí hasta que lleguen 3
CyclicBarrier punto = new CyclicBarrier(3);
// en cada hilo: punto.await();

// Como máximo 2 hilos a la vez en la zona protegida
Semaphore cajas = new Semaphore(2);
cajas.acquire();
try {
    // usar el recurso limitado
} finally {
    cajas.release();
}</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Olvidar <code>shutdown()</code>: los hilos del pool siguen vivos y el programa no termina.</li><li>Llamar a <code>get()</code> justo después de cada <code>submit</code>: esperas una tarea antes de lanzar la siguiente y pierdes el paralelismo.</li><li>Poner un <code>CountDownLatch</code> con más cuentas de las que se harán: <code>await()</code> espera para siempre.</li><li>No liberar el <code>Semaphore</code> en un <code>finally</code>.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Usa un pool en vez de crear hilos a mano.</li><li>Cierra siempre el pool con <code>shutdown()</code>.</li><li><code>Callable</code> cuando necesitas un resultado; <code>Runnable</code> cuando no.</li><li><code>acquire()</code> y <code>release()</code> van en <code>try/finally</code>.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>ExecutorService</strong>: crear un pool, enviar una tarea y cerrarlo.</li><li><strong>Callable Future</strong>: tarea que devuelve 42 y lectura con <code>get()</code>.</li><li><strong>CountDownLatch</strong>: contador de 3 y espera con <code>await()</code>.</li><li><strong>CyclicBarrier</strong>: barrera para 3 hilos.</li><li><strong>Semaphore</strong>: limitar el acceso concurrente con <code>acquire</code> y <code>release</code>.</li></ul>`
  },
  {
    id: 46, level: 'expert', module: 11, title: 'CompletableFuture',
    description: 'Programación asíncrona avanzada',
    duration: '40 min',
    content: `<h2>CompletableFuture</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Con <code>Future</code>, para obtener el resultado tenías que bloquearte en <code>get()</code>. <code>CompletableFuture</code> permite programar <strong>qué hacer cuando el resultado esté listo</strong>, sin esperar: encadenas pasos como una receta ("cuando llegue la masa, hornéala; cuando salga del horno, sírvela"). Eso es programación <strong>asíncrona</strong>: la tarea se lanza y el programa sigue.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Un servicio que consulta varias APIs a la vez (precios, stock, envío) y junta las respuestas, sin bloquear un hilo por cada una.</div>
<h3>📖 Cómo funciona</h3>
<ul><li><code>supplyAsync(() -&gt; valor)</code>: lanza una tarea en otro hilo que devuelve un valor.</li><li><code>thenApply(f)</code>: transforma el resultado cuando esté listo.</li><li><code>thenAccept(f)</code>: consume el resultado (no devuelve nada).</li><li><code>thenCombine(otro, f)</code>: junta los resultados de dos futuros independientes.</li><li><code>thenCompose(f)</code>: como <code>thenApply</code>, pero cuando <code>f</code> a su vez devuelve un <code>CompletableFuture</code>.</li><li><code>exceptionally(f)</code>: da un valor alternativo si algo falló.</li><li><code>join()</code>: espera el resultado y lo devuelve (como <code>get()</code>, pero sin excepciones comprobadas).</li></ul>
<div class="code-block"><pre><code>import java.util.concurrent.CompletableFuture;

public class PedidoAsync {
    public static void main(String[] args) {
        CompletableFuture&lt;String&gt; plato =
            CompletableFuture.supplyAsync(() -&gt; "pizza").thenApply(String::toUpperCase);
        CompletableFuture&lt;Integer&gt; cantidad =
            CompletableFuture.supplyAsync(() -&gt; 3);

        String pedido = plato
            .thenCombine(cantidad, (nombre, n) -&gt; n + " x " + nombre)
            .join();
        System.out.println(pedido);

        String resultado = CompletableFuture
            .supplyAsync(() -&gt; 10 / 0)
            .thenApply(n -&gt; "Resultado: " + n)
            .exceptionally(e -&gt; "Falló: " + e.getCause().getMessage())
            .join();
        System.out.println(resultado);
    }
}

// Salida:
// 3 x PIZZA
// Falló: / by zero</code></pre></div>
<p>Si una etapa falla, la excepción viaja por las etapas siguientes envuelta en una <code>CompletionException</code>; por eso se usa <code>e.getCause()</code> para ver el error original. Por defecto, <code>supplyAsync</code> corre en hilos "demonio" del pool común: si <code>main</code> termina antes, esas tareas se cortan. Cuando necesites el resultado, termina con <code>join()</code>.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>No esperar el resultado (<code>join()</code>/<code>get()</code>) y que <code>main</code> termine antes de ver nada.</li><li>Usar <code>thenApply</code> cuando la función devuelve otro <code>CompletableFuture</code> (queda anidado): usa <code>thenCompose</code>.</li><li>Olvidar manejar errores: una excepción en una etapa se pierde si nadie la consulta.</li><li>Hacer tareas muy lentas o bloqueantes en el pool común.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Encadena con <code>then...</code> en vez de bloquear en cada paso.</li><li>Agrega <code>exceptionally</code> (o <code>handle</code>) para los errores.</li><li>Bloquea con <code>join()</code> solo al final.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>CompletableFuture</strong>: encadenar <code>supplyAsync</code>, <code>thenApply</code> y <code>thenAccept</code> para armar y mostrar un mensaje.</li></ul>`
  },
  {
    id: 47, level: 'expert', module: 12, title: 'Patrones Creacionales',
    description: 'Singleton, Factory, Builder',
    duration: '35 min',
    content: `<h2>Patrones Creacionales</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Un <strong>patrón de diseño</strong> es una solución probada a un problema que se repite al programar. Los <strong>creacionales</strong> resuelven un problema concreto: <em>cómo crear objetos</em> sin llenar el código de <code>new</code> repartidos por todos lados. Veremos tres: <strong>Singleton</strong> (una sola instancia), <strong>Factory</strong> (una "fábrica" decide qué clase crear) y <strong>Builder</strong> (se arma un objeto paso a paso).</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Una configuración global suele ser un Singleton; una fábrica elige el cliente de correo o SMS según un dato; y los Builders están en todas partes (por ejemplo, <code>StringBuilder</code>).</div>
<h3>📖 Cómo funciona</h3>
<ul><li><strong>Singleton</strong>: constructor privado y un único punto de acceso. La forma más segura en Java es un <code>enum</code> con un solo valor (si la creas con un <code>if (instancia == null)</code>, no es segura entre hilos sin sincronizar).</li><li><strong>Factory</strong>: un método <code>static</code> recibe un dato y devuelve el objeto adecuado, siempre como la interfaz común. Quien lo usa no conoce las clases concretas.</li><li><strong>Builder</strong>: útil cuando hay muchos datos opcionales. Cada método devuelve <code>this</code> para encadenar llamadas, y <code>build()</code> crea el objeto final.</li></ul>
<div class="code-block"><pre><code>enum Configuracion {
    INSTANCIA;
    private String idioma = "es";
    String getIdioma() { return idioma; }
    void setIdioma(String idioma) { this.idioma = idioma; }
}

interface Notificador {
    void enviar(String mensaje);
}

class Email implements Notificador {
    public void enviar(String mensaje) { System.out.println("Email: " + mensaje); }
}

class Sms implements Notificador {
    public void enviar(String mensaje) { System.out.println("SMS: " + mensaje); }
}

class NotificadorFactory {
    static Notificador crear(String canal) {
        return switch (canal) {
            case "email" -&gt; new Email();
            case "sms" -&gt; new Sms();
            default -&gt; throw new IllegalArgumentException("Canal desconocido: " + canal);
        };
    }
}

class Pizza {
    private final String masa;
    private final boolean conQueso;

    private Pizza(Builder b) {
        this.masa = b.masa;
        this.conQueso = b.conQueso;
    }

    static class Builder {
        private String masa = "fina";
        private boolean conQueso = false;

        Builder masa(String masa) { this.masa = masa; return this; }
        Builder conQueso() { this.conQueso = true; return this; }
        Pizza build() { return new Pizza(this); }
    }

    @Override
    public String toString() { return "Pizza masa " + masa + (conQueso ? " con queso" : ""); }
}

public class Creacionales {
    public static void main(String[] args) {
        Configuracion.INSTANCIA.setIdioma("en");
        System.out.println(Configuracion.INSTANCIA.getIdioma());

        NotificadorFactory.crear("sms").enviar("Tu pedido salió");

        Pizza p = new Pizza.Builder().masa("gruesa").conQueso().build();
        System.out.println(p);
    }
}

// Salida:
// en
// SMS: Tu pedido salió
// Pizza masa gruesa con queso</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Abusar del Singleton: es estado global y complica las pruebas.</li><li>Singleton clásico con <code>if (instancia == null)</code> usado desde varios hilos: pueden crearse dos instancias.</li><li>Factory que devuelve <code>null</code> para un tipo desconocido: mejor lanzar una excepción.</li><li>Olvidar <code>return this</code> en un método del Builder: se rompe el encadenamiento.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Usa un patrón solo si resuelve un problema real que tienes.</li><li>Singleton: constructor privado y acceso controlado.</li><li>Factory: devuelve la interfaz, no la clase concreta.</li><li>Builder: un método por dato opcional, cada uno con <code>return this</code>.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Singleton Pattern</strong>: clase con constructor privado y método estático que devuelve la única instancia.</li><li><strong>Factory Pattern</strong>: método estático que crea un objeto según un texto.</li><li><strong>Builder Pattern</strong>: clase <code>Builder</code> anidada con métodos encadenables.</li></ul>`
  },
  {
    id: 48, level: 'expert', module: 12, title: 'Patrones Estructurales',
    description: 'Adapter, Decorator, Proxy',
    duration: '40 min',
    content: `<h2>Patrones Estructurales</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Los patrones <strong>estructurales</strong> explican cómo combinar clases y objetos para formar estructuras más grandes sin acoplarlos. Tres muy usados:</p>
<ul><li><strong>Adapter</strong>: traduce una interfaz a otra, como un adaptador de enchufe.</li><li><strong>Decorator</strong>: añade funciones a un objeto envolviéndolo, como agregar ingredientes a un café.</li><li><strong>Proxy</strong>: un representante que controla el acceso al objeto real (caché, permisos, carga diferida).</li></ul>
<div class="info-box"><strong>💼 En el mundo real:</strong> Los <code>BufferedReader</code> que envuelven a otro lector son Decorators; los adaptadores conectan librerías antiguas con código nuevo; y los frameworks usan Proxies para añadir seguridad o transacciones.</div>
<h3>📖 Cómo funciona</h3>
<p>Los tres comparten una idea: tu código habla con una <strong>interfaz</strong>, y detrás hay otro objeto que lo envuelve. La diferencia está en la intención:</p>
<div class="code-block"><pre><code>// Adapter: un sistema viejo con otra interfaz
class RelojViejo {
    int minutosDesdeMedianoche() { return 14 * 60 + 30; }
}

interface Reloj {
    String hora();
}

class RelojAdapter implements Reloj {
    private final RelojViejo viejo;
    RelojAdapter(RelojViejo viejo) { this.viejo = viejo; }
    public String hora() {
        int m = viejo.minutosDesdeMedianoche();
        return String.format("%02d:%02d", m / 60, m % 60);
    }
}

// Decorator: agrega comportamiento envolviendo
interface Cafe {
    double precio();
}

class CafeSimple implements Cafe {
    public double precio() { return 2.0; }
}

class ConLeche implements Cafe {
    private final Cafe base;
    ConLeche(Cafe base) { this.base = base; }
    public double precio() { return base.precio() + 0.5; }
}

// Proxy: controla el acceso al objeto real
interface Informe {
    String leer();
}

class InformeReal implements Informe {
    public String leer() {
        System.out.println("(leyendo del disco...)");
        return "datos del informe";
    }
}

class InformeProxy implements Informe {
    private InformeReal real;
    private String cache;
    public String leer() {
        if (cache == null) {
            real = new InformeReal();
            cache = real.leer();
        }
        return cache;
    }
}

public class Estructurales {
    public static void main(String[] args) {
        Reloj r = new RelojAdapter(new RelojViejo());
        System.out.println(r.hora());

        Cafe c = new ConLeche(new ConLeche(new CafeSimple()));
        System.out.println(c.precio());

        Informe i = new InformeProxy();
        System.out.println(i.leer());
        System.out.println(i.leer());
    }
}

// Salida:
// 14:30
// 3.0
// (leyendo del disco...)
// datos del informe
// datos del informe</code></pre></div>
<p>Observa que <code>ConLeche</code> y <code>CafeSimple</code> implementan la misma interfaz <code>Cafe</code>; por eso puedes apilar decoradores (<code>2.0 + 0.5 + 0.5</code>). El Proxy lee del disco solo la primera vez; la segunda sale de la caché.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Confundirlos: Adapter <em>cambia</em> la interfaz; Decorator y Proxy <em>mantienen</em> la misma.</li><li>Un decorador que no delega en el objeto envuelto: pierde el comportamiento original.</li><li>Crear una cadena tan larga de decoradores que nadie entiende qué hace.</li><li>Un Proxy que repite la lógica del objeto real en lugar de delegar.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Decorator: implementa la misma interfaz y guarda el objeto envuelto en un campo <code>private</code>.</li><li>Delega siempre al objeto envuelto y luego añade lo tuyo.</li><li>Usa Adapter cuando no puedes modificar la clase original.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Decorator Pattern</strong>: crear la interfaz <code>Componente</code> y un <code>Decorador</code> que la implementa y envuelve a otro componente.</li></ul>`
  },
  {
    id: 49, level: 'expert', module: 12, title: 'Patrones Comportamiento',
    description: 'Observer, Strategy, State',
    duration: '40 min',
    content: `<h2>Patrones Comportamiento</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Los patrones de <strong>comportamiento</strong> ordenan cómo se reparten responsabilidades y cómo se comunican los objetos. Tres clásicos:</p>
<ul><li><strong>Observer</strong>: un objeto avisa a varios interesados cuando algo cambia, como los suscriptores de un canal.</li><li><strong>Strategy</strong>: se intercambian algoritmos (por ejemplo, formas de descuento) sin cambiar el código que los usa.</li><li><strong>State</strong>: el objeto cambia su comportamiento según su estado actual (un semáforo, un pedido).</li></ul>
<div class="info-box"><strong>💼 En el mundo real:</strong> Las notificaciones y los eventos de una interfaz gráfica usan Observer; los motores de precios eligen una estrategia según el cliente; y los flujos como "pendiente → pagado → enviado" modelan State.</div>
<h3>📖 Cómo funciona</h3>
<p>Observer: el emisor guarda una lista de oyentes (todos implementan una interfaz) y, al publicar, recorre la lista con <code>forEach</code>. Strategy: el contexto guarda una referencia a una interfaz y se la puedes cambiar con un <em>setter</em> (método que asigna un valor). State: cada estado sabe cuál es el siguiente.</p>
<div class="code-block"><pre><code>import java.util.ArrayList;
import java.util.List;

interface Oyente {
    void alRecibir(String noticia);
}

class Canal {
    private final List&lt;Oyente&gt; oyentes = new ArrayList&lt;&gt;();
    void suscribir(Oyente o) { oyentes.add(o); }
    void publicar(String noticia) { oyentes.forEach(o -&gt; o.alRecibir(noticia)); }
}

interface Descuento {
    double aplicar(double precio);
}

class Carrito {
    private Descuento descuento = precio -&gt; precio;
    void setDescuento(Descuento d) { this.descuento = d; }
    double total(double precio) { return descuento.aplicar(precio); }
}

interface Estado {
    Estado siguiente();
    String nombre();
}

enum Semaforo implements Estado {
    ROJO, VERDE, AMARILLO;
    public Estado siguiente() {
        return switch (this) {
            case ROJO -&gt; VERDE;
            case VERDE -&gt; AMARILLO;
            case AMARILLO -&gt; ROJO;
        };
    }
    public String nombre() { return name(); }
}

public class Comportamiento {
    public static void main(String[] args) {
        Canal canal = new Canal();
        canal.suscribir(n -&gt; System.out.println("Lector A: " + n));
        canal.suscribir(n -&gt; System.out.println("Lector B: " + n));
        canal.publicar("Nueva versión de Java");

        Carrito carrito = new Carrito();
        System.out.println(carrito.total(100));
        carrito.setDescuento(precio -&gt; precio * 0.9);
        System.out.println(carrito.total(100));

        Estado e = Semaforo.ROJO;
        for (int i = 0; i &lt; 3; i++) {
            System.out.println(e.nombre());
            e = e.siguiente();
        }
    }
}

// Salida:
// Lector A: Nueva versión de Java
// Lector B: Nueva versión de Java
// 100.0
// 90.0
// ROJO
// VERDE
// AMARILLO</code></pre></div>
<p>Como <code>Oyente</code> y <code>Descuento</code> tienen un solo método, puedes pasarlos como lambdas (<code>n -&gt; ...</code>). El <code>switch</code> con <code>-&gt;</code> y devolviendo valor es una <em>switch expression</em> de Java moderno.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Modificar la lista de oyentes mientras se recorre: lanza <code>ConcurrentModificationException</code>.</li><li>No poder darse de baja: añade un método para quitar oyentes.</li><li>Un <code>if/else</code> gigante para elegir algoritmo cuando una interfaz Strategy sería más limpia.</li><li>Olvidar los imports de <code>java.util.List</code> y <code>java.util.ArrayList</code>.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Observer: depende de una interfaz, no de clases concretas de oyentes.</li><li>Strategy: una interfaz pequeña, una clase por algoritmo.</li><li>State: concentra las reglas de transición en un solo lugar.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>Observer Pattern</strong>: interfaz <code>Observer</code> y clase <code>Sujeto</code> que notifica con <code>forEach</code>.</li><li><strong>Strategy Pattern</strong>: interfaz <code>Estrategia</code>, una implementación (<code>Suma</code>) y un <code>Contexto</code> que la puede cambiar.</li></ul>`
  },
  {
    id: 50, level: 'expert', module: 13, title: 'SOLID Principles',
    description: 'Arquitectura de software profesional',
    duration: '50 min',
    content: `<h2>SOLID Principles</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>SOLID son cinco principios de diseño orientado a objetos que hacen el código <strong>fácil de cambiar sin romperlo</strong>. Cada letra es un principio. Piensa en una casa con enchufes estándar: cambias una lámpara sin tocar la instalación eléctrica.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> En los equipos profesionales, las revisiones de código suelen señalar clases que hacen demasiado o que dependen de detalles concretos; SOLID da el vocabulario para explicarlo.</div>
<h3>📖 Cómo funciona</h3>
<ul><li><strong>S – Responsabilidad única</strong>: una clase, una razón para cambiar. Separa <code>Usuario</code> (datos), <code>UsuarioRepositorio</code> (guardar) y <code>UsuarioValidator</code> (validar).</li><li><strong>O – Abierto/Cerrado</strong>: abierto para extender, cerrado para modificar. Para un nuevo impuesto, creas una clase nueva en vez de editar un <code>if</code>.</li><li><strong>L – Sustitución de Liskov</strong>: donde se usa la clase base, debe poder usarse una subclase sin sorpresas. Si <code>Pinguino extends Ave</code> y <code>volar()</code> lanza un error, el diseño está mal: separa <code>AveVoladora</code> de <code>AveNoVoladora</code>.</li><li><strong>I – Segregación de interfaces</strong>: varias interfaces pequeñas (<code>Imprimible</code>, <code>Escaneable</code>) mejor que una enorme que obliga a implementar métodos inútiles.</li><li><strong>D – Inversión de dependencias</strong>: las clases de alto nivel dependen de abstracciones (interfaces), no de clases concretas. Se suele pasar la dependencia por el constructor (<em>inyección de dependencias</em>).</li></ul>
<div class="code-block"><pre><code>interface MedioDePago {
    void pagar(double monto);
}

class Tarjeta implements MedioDePago {
    public void pagar(double monto) { System.out.println("Tarjeta: " + monto); }
}

class Efectivo implements MedioDePago {
    public void pagar(double monto) { System.out.println("Efectivo: " + monto); }
}

class Tienda {
    private final MedioDePago medio;
    Tienda(MedioDePago medio) { this.medio = medio; }
    void cobrar(double monto) { medio.pagar(monto); }
}

abstract class Impuesto {
    abstract double calcular(double base);
}

class Iva extends Impuesto {
    double calcular(double base) { return base * 0.21; }
}

class ImpuestoInterno extends Impuesto {
    double calcular(double base) { return base * 0.05; }
}

public class TiendaSolid {
    public static void main(String[] args) {
        new Tienda(new Tarjeta()).cobrar(50.0);
        new Tienda(new Efectivo()).cobrar(20.0);

        Impuesto[] impuestos = { new Iva(), new ImpuestoInterno() };
        double total = 0;
        for (Impuesto i : impuestos) {
            total += i.calcular(100.0);
        }
        System.out.println("Impuestos: " + total);
    }
}

// Salida:
// Tarjeta: 50.0
// Efectivo: 20.0
// Impuestos: 26.0</code></pre></div>
<p><code>Tienda</code> no sabe si se paga con tarjeta o efectivo (D). Y para agregar otro impuesto basta una subclase nueva de <code>Impuesto</code>, sin tocar el bucle (O).</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Aplicar SOLID "por si acaso" y llenar el proyecto de interfaces que solo tienen una implementación.</li><li>Una clase <code>Utilidades</code> con de todo: rompe la responsabilidad única.</li><li>Una subclase que lanza <code>UnsupportedOperationException</code> en un método heredado: señal de que rompe Liskov.</li><li>Crear con <code>new</code> la dependencia dentro de la clase en lugar de recibirla.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Pregúntate: ¿cuántas razones tiene esta clase para cambiar?</li><li>Extiende con clases nuevas; evita editar las que ya funcionan.</li><li>Una subclase debe cumplir el contrato de su clase base.</li><li>Programa contra interfaces y recibe las dependencias por el constructor.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>SRP</strong>: separar responsabilidades en <code>Usuario</code>, <code>UsuarioRepositorio</code> y <code>UsuarioValidator</code>.</li><li><strong>OCP</strong>: clase abstracta <code>Forma</code> y subclase <code>Circulo</code>.</li><li><strong>LSP</strong>: el problema de <code>Ave</code> y <code>Pinguino</code>.</li><li><strong>ISP</strong>: interfaces <code>Imprimible</code> y <code>Escaneable</code>.</li><li><strong>DIP</strong>: <code>Servicio</code> que depende de la interfaz <code>Repositorio</code>.</li></ul>`
  },
  {
    id: 51, level: 'expert', module: 13, title: 'Clean Code y Refactor',
    description: 'Escritura de código mantenible',
    duration: '45 min',
    content: `<h2>Clean Code y Refactor</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>El código se escribe una vez pero se lee muchas. <strong>Código limpio</strong> es el que otra persona (o tú dentro de seis meses) entiende rápido. <strong>Refactorizar</strong> es mejorar la estructura del código <em>sin cambiar lo que hace</em>, como ordenar un cajón sin cambiar lo que guardas en él.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> La mayor parte del trabajo de un equipo es leer y modificar código existente. Nombres claros y métodos pequeños ahorran horas de depuración.</div>
<h3>📖 Cómo funciona</h3>
<ul><li><strong>Nombres que dicen la intención</strong>: <code>totalAPagar</code> en vez de <code>x</code>.</li><li><strong>Métodos pequeños</strong> que hacen una sola cosa.</li><li><strong>Constantes con nombre</strong> en vez de números "mágicos" (<code>100</code>, <code>8</code>).</li><li><strong>Salidas tempranas</strong> (<code>if ... return</code>) en vez de <code>else</code> anidados.</li><li><strong>Sin duplicación</strong> (DRY: <em>Don't Repeat Yourself</em>, no te repitas).</li><li><strong>Comentarios que explican el porqué</strong>, no lo que ya dice el código.</li></ul>
<div class="code-block"><pre><code>// Antes: ¿qué es f, t, 100 y 8?
double f(double t) {
    if (t &gt;= 100) { return t; } else { return t + 8; }
}</code></pre></div>
<p>Después de refactorizar (mismos resultados, mucho más claro):</p>
<div class="code-block"><pre><code>public class CleanCode {
    private static final double TASA_ENVIO_GRATIS = 100.0;
    private static final double COSTO_ENVIO = 8.0;

    static double costoEnvio(double totalCompra) {
        if (totalCompra &gt;= TASA_ENVIO_GRATIS) {
            return 0;
        }
        return COSTO_ENVIO;
    }

    static double totalAPagar(double totalCompra) {
        return totalCompra + costoEnvio(totalCompra);
    }

    public static void main(String[] args) {
        System.out.println(totalAPagar(40.0));
        System.out.println(totalAPagar(150.0));
    }
}

// Salida:
// 48.0
// 150.0</code></pre></div>
<p><strong>Refactoriza con red de seguridad</strong>: antes de tocar nada, ten pruebas que confirmen que el comportamiento sigue igual. De ahí nace <strong>TDD</strong> (<em>Test-Driven Development</em>), un ciclo de tres pasos: <strong>Red</strong> (escribes una prueba que falla), <strong>Green</strong> (escribes el código mínimo para que pase) y <strong>Refactor</strong> (mejoras el código con la prueba pasando). Una prueba es un método con la anotación <code>@Test</code> que compara con <code>assertEquals(esperado, real)</code>; la próxima lección los explica a fondo.</p>
<div class="code-block"><pre><code>// Red: esta prueba falla porque esPar aún no existe
@Test
void tresNoEsPar() {
    assertEquals(false, esPar(3));
}
// Green: boolean esPar(int n) { return n % 2 == 0; }
// Refactor: renombra, simplifica, vuelve a correr la prueba</code></pre></div>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Refactorizar sin pruebas y cambiar el comportamiento sin darte cuenta.</li><li>Comentar cada línea en vez de renombrar para que el código se explique solo.</li><li>Nombres abreviados o genéricos (<code>dato</code>, <code>temp</code>, <code>x</code>).</li><li>Refactorizar y agregar funciones nuevas en el mismo paso.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Un método, una tarea.</li><li>Un buen nombre vale más que un comentario.</li><li>Cambios pequeños, y prueba después de cada uno.</li><li>En TDD: Red, luego Green, luego Refactor.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>TDD Red-Green-Refactor</strong>: escribir una prueba con <code>@Test</code>, el método mínimo que la hace pasar y comentarios que marcan las tres fases.</li></ul>`
  },
  {
    id: 52, level: 'expert', module: 13, title: 'Testing Unitario (JUnit)',
    description: 'Calidad y verificación de código',
    duration: '50 min',
    content: `<h2>Testing Unitario (JUnit)</h2>
<h3>🎯 ¿Para qué sirve?</h3>
<p>Una <strong>prueba unitaria</strong> es un pequeño programa que ejecuta una pieza de tu código (por ejemplo, un método) y comprueba que devuelve lo esperado. Si más adelante cambias algo y se rompe, la prueba falla y te avisa al instante. Es como el control de calidad de una fábrica, pero automático.</p>
<div class="info-box"><strong>💼 En el mundo real:</strong> Casi todo proyecto Java profesional corre sus pruebas automáticamente en cada cambio antes de aceptarlo. JUnit 5 es la librería estándar; Mockito y AssertJ la complementan. Son librerías externas: se añaden como dependencias con Maven o Gradle.</div>
<h3>📖 Cómo funciona</h3>
<p>Probaremos esta clase (compila sola):</p>
<div class="code-block"><pre><code>public class Calculadora {
    public int dividir(int a, int b) {
        if (b == 0) {
            throw new IllegalArgumentException("El divisor no puede ser 0");
        }
        return a / b;
    }

    public static void main(String[] args) {
        Calculadora calc = new Calculadora();
        System.out.println(calc.dividir(10, 2));
        try {
            calc.dividir(1, 0);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}

// Salida:
// 5
// El divisor no puede ser 0</code></pre></div>
<p>Prueba con JUnit 5. Cada prueba tiene tres partes: preparar, ejecutar y verificar.</p>
<div class="code-block"><pre><code>import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculadoraTest {
    private Calculadora calc;

    @BeforeEach          // se ejecuta antes de CADA prueba
    void preparar() {
        calc = new Calculadora();
    }

    @Test
    void divideEnteros() {
        assertEquals(5, calc.dividir(10, 2));
    }

    @Test
    void dividirPorCeroLanzaExcepcion() {
        assertThrows(IllegalArgumentException.class, () -&gt; calc.dividir(1, 0));
    }
}</code></pre></div>
<p><strong>Parametrizadas</strong>: una misma prueba con varios valores (requiere <code>junit-jupiter-params</code>):</p>
<div class="code-block"><pre><code>@ParameterizedTest
@ValueSource(ints = {2, 4, 6})
void sonPares(int n) {
    assertEquals(0, n % 2);
}</code></pre></div>
<p><strong>Mockito</strong> crea objetos simulados (<em>mocks</em>) para aislar lo que pruebas de sus dependencias. <strong>AssertJ</strong> ofrece verificaciones encadenadas y legibles:</p>
<div class="code-block"><pre><code>import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;

Correo correo = mock(Correo.class);          // Correo: interfaz con String leer() y void enviar()
when(correo.leer()).thenReturn("hola");      // define qué responde
correo.enviar();
verify(correo).enviar();                     // comprueba que se llamó

assertThat("Java").startsWith("J").hasSize(4);</code></pre></div>
<p>La <strong>cobertura</strong> mide qué porcentaje de tu código ejecutan las pruebas (líneas, ramas, métodos); se mide con herramientas como JaCoCo (<code>mvn test jacoco:report</code>). Un número alto no garantiza buenas pruebas: sirve para descubrir zonas sin probar.</p>
<h3>⚠️ Errores comunes</h3>
<div class="info-box warning"><ul><li>Poner el valor esperado y el real al revés en <code>assertEquals(esperado, real)</code>: el mensaje de error confunde.</li><li>Pruebas que dependen unas de otras o del orden de ejecución.</li><li>Probar demasiado en un solo <code>@Test</code>: cuando falla, no sabes qué falló.</li><li>Usar <code>org.junit.Test</code> (JUnit 4) con anotaciones de JUnit 5: usa <code>org.junit.jupiter.api.Test</code>.</li></ul></div>
<h3>✅ Reglas de Oro</h3>
<ul><li>Una prueba verifica una cosa y tiene un nombre que dice cuál.</li><li>Cada prueba es independiente y repetible.</li><li>Mockea las dependencias externas, no la clase que pruebas.</li><li>Prueba también los casos de error y los bordes.</li></ul>
<h3>🧪 Lo que vas a practicar</h3>
<ul><li><strong>JUnit Test</strong>: prueba con <code>@Test</code> y <code>assertEquals</code>.</li><li><strong>JUnit BeforeEach</strong>: método <code>@BeforeEach</code>.</li><li><strong>JUnit AssertThrows</strong>: verificar una excepción con <code>assertThrows</code>.</li><li><strong>Mockito Mock</strong>: <code>mock</code>, <code>when</code> y <code>thenReturn</code>.</li><li><strong>Mockito Verify</strong>: comprobar una llamada con <code>verify</code>.</li><li><strong>AssertJ Fluent</strong>: aserciones encadenadas con <code>assertThat</code>.</li><li><strong>Parametrized Test</strong>: <code>@ParameterizedTest</code> con <code>@ValueSource</code>.</li><li><strong>Test Coverage</strong>: comentarios que explican la cobertura y JaCoCo.</li></ul>`
  }
];

// Instanciar ProgressManager después de que lessonsData esté definido
const progressManager = new ProgressManager();

// ============================================
// LOGIC MANAGER
// ============================================

let currentLessonIndex = -1;

function renderLessons(filterLevel) {
  const container = document.getElementById('lessons-grid');
  if (!container) return;

  container.innerHTML = '';

  const filtered = filterLevel === 'all'
    ? lessonsData
    : lessonsData.filter(l => l.level === filterLevel);

  filtered.forEach(lesson => {
    const isCompleted = progressManager.isCompleted(lesson.id);
    const card = document.createElement('div');
    card.className = `lesson-card ${isCompleted ? 'completed' : ''}`;
    card.onclick = () => openLesson(lesson.id);

    card.innerHTML = `
      <div class="lesson-meta">
        <span class="lesson-id">#${lesson.id}</span>
        <span class="lesson-duration">⏱ ${lesson.duration}</span>
      </div>
      <h3 class="lesson-title">${lesson.title}</h3>
      <p class="lesson-desc">${lesson.description}</p>
      <div class="lesson-footer">
        ${isCompleted ? '<span class="status-badge">✅ Completada</span>' : '<span class="status-btn">Empezar</span>'}
      </div>
    `;
    container.appendChild(card);
  });
}

function openLesson(lessonId) {
  const lesson = lessonsData.find(l => l.id === lessonId);
  currentLessonIndex = lessonsData.indexOf(lesson);

  const viewer = document.getElementById('lesson-viewer');
  const content = document.getElementById('lesson-content');

  const prevLesson = lessonsData[currentLessonIndex - 1];
  const nextLesson = lessonsData[currentLessonIndex + 1];

  content.innerHTML = `
    <button class="lesson-close" onclick="closeLesson()">×</button>
    ${lesson.content}
    <div class="lesson-navigation">
      <button class="nav-btn" onclick="navigateLesson(-1)" ${!prevLesson ? 'disabled' : ''}>
        ← Anterior
      </button>
      <button class="nav-btn" onclick="markCompleted(${lesson.id})">
        ✓ Marcar como completada
      </button>
      <button class="nav-btn" onclick="navigateLesson(1)" ${!nextLesson ? 'disabled' : ''}>
        Siguiente →
      </button>
    </div>
  `;

  viewer.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLesson() {
  document.getElementById('lesson-viewer').classList.remove('active');
  document.body.style.overflow = 'auto';
}

function navigateLesson(direction) {
  const newIndex = currentLessonIndex + direction;
  if (newIndex >= 0 && newIndex < lessonsData.length) {
    openLesson(lessonsData[newIndex].id);
  }
}

function markCompleted(lessonId) {
  progressManager.markAsCompleted(lessonId);
  openLesson(lessonId); // Refresh
}

function copyCode(button) {
  const codeBlock = button.closest('.code-block');
  const code = codeBlock.querySelector('code').textContent;
  navigator.clipboard.writeText(code);

  button.textContent = '✓ Copiado';
  setTimeout(() => {
    button.textContent = 'Copiar';
  }, 2000);
}

// EVENT LISTENERS
// ============================================

// ============================================
// MODULES VIEW FUNCTIONS
// ============================================

function renderModulesView() {
  const container = document.getElementById('modules-view');
  if (!container) return;

  const levels = [
    { name: 'beginner', title: 'Principiante', icon: '🌱', start: 1, end: 15, modules: 3 },
    { name: 'intermediate', title: 'Intermedio', icon: '🚀', start: 16, end: 30, modules: 3 },
    { name: 'advanced', title: 'Avanzado', icon: '⚡', start: 31, end: 42, modules: 4 },
    { name: 'expert', title: 'Experto', icon: '👑', start: 43, end: 52, modules: 3 }
  ];

  container.innerHTML = '';

  levels.forEach(level => {
    const levelLessons = lessonsData.filter(l => l.level === level.name);
    const completedCount = levelLessons.filter(l => progressManager.isCompleted(l.id)).length;
    const totalCount = levelLessons.length;
    const percentage = Math.round((completedCount / totalCount) * 100) || 0;

    // Agrupar por módulos
    const moduleGroups = {};
    levelLessons.forEach(lesson => {
      if (!moduleGroups[lesson.module]) {
        moduleGroups[lesson.module] = [];
      }
      moduleGroups[lesson.module].push(lesson);
    });

    const levelSection = document.createElement('div');
    levelSection.className = `level-section ${level.name}`;

    levelSection.innerHTML = `
      <div class="level-section-header" onclick="toggleLevelSection(this)">
        <div class="level-section-title">
          <span class="level-section-icon">${level.icon}</span>
          <div>
            <h3>${level.title}</h3>
            <div class="level-section-meta">
              <span>${totalCount} lecciones</span>
              <span>•</span>
              <span>${completedCount} completadas (${percentage}%)</span>
            </div>
          </div>
        </div>
        <span class="expand-icon">▼</span>
      </div>
      <div class="level-section-content">
        ${Object.keys(moduleGroups).sort((a, b) => a - b).map(moduleNum => {
      const moduleLessons = moduleGroups[moduleNum];
      const moduleTitle = getModuleTitle(level.name, parseInt(moduleNum));

      return `
            <div class="module-group">
              <div class="module-header">
                <h4>Módulo ${moduleNum}: ${moduleTitle}</h4>
              </div>
              <div class="module-lessons">
                ${moduleLessons.map(lesson => {
        const isCompleted = progressManager.isCompleted(lesson.id);
        return `
                    <div class="lesson-card ${isCompleted ? 'completed' : ''}" onclick="openLesson(${lesson.id})">
                      <div class="lesson-meta">
                        <span class="lesson-id">#${lesson.id}</span>
                        <span class="lesson-duration">⏱ ${lesson.duration}</span>
                      </div>
                      <h3 class="lesson-title">${lesson.title}</h3>
                      <p class="lesson-desc">${lesson.description}</p>
                      <div class="lesson-footer">
                        ${isCompleted ? '<span class="status-badge">✅ Completada</span>' : '<span class="status-btn">Empezar</span>'}
                      </div>
                    </div>
                  `;
      }).join('')}
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `;

    container.appendChild(levelSection);
  });
}

function getModuleTitle(level, moduleNum) {
  const moduleTitles = {
    beginner: {
      1: 'Fundamentos de Java',
      2: 'Estructuras de Control',
      3: 'Arrays y Métodos'
    },
    intermediate: {
      4: 'Programación Orientada a Objetos',
      5: 'Conceptos Avanzados de POO',
      6: 'Colecciones y Estructuras de Datos'
    },
    advanced: {
      7: 'Manejo de Excepciones',
      8: 'Programación Funcional',
      9: 'Streams y Procesamiento',
      10: 'Entrada/Salida de Archivos'
    },
    expert: {
      11: 'Concurrencia y Multithreading',
      12: 'Patrones de Diseño',
      13: 'Arquitectura y Mejores Prácticas'
    }
  };

  return moduleTitles[level]?.[moduleNum] || `Módulo ${moduleNum}`;
}

function toggleLevelSection(header) {
  const section = header.parentElement;
  section.classList.toggle('expanded');
}

function switchView(viewType) {
  const modulesView = document.getElementById('modules-view');
  const gridView = document.getElementById('grid-view');
  const toggleBtns = document.querySelectorAll('.toggle-btn');

  toggleBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewType);
  });

  if (viewType === 'modules') {
    modulesView.style.display = 'flex';
    gridView.style.display = 'none';
  } else {
    modulesView.style.display = 'none';
    gridView.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderModulesView(); // Renderizar vista de módulos
  renderLessons('all'); // Renderizar vista grid
  progressManager.updateUI();

  // Expandir el primer nivel por defecto
  setTimeout(() => {
    const firstLevel = document.querySelector('.level-section');
    if (firstLevel) firstLevel.classList.add('expanded');
  }, 100);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLessons(btn.dataset.filter);
    });
  });

  document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
      const level = card.dataset.level;

      // Cambiar a vista de módulos
      switchView('modules');

      // Expandir la sección del nivel correspondiente
      setTimeout(() => {
        const levelSection = document.querySelector(`.level-section.${level}`);
        if (levelSection) {
          // Cerrar todas las secciones
          document.querySelectorAll('.level-section').forEach(s => s.classList.remove('expanded'));
          // Abrir la sección seleccionada
          levelSection.classList.add('expanded');
          // Scroll suave
          levelSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLesson();
  });
});
