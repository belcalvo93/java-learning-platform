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
    content: `<h2>Introducción a Java y la JVM</h2><h3>📚 ¿Qué es Java?</h3><p>Lenguaje orientado a objetos, multiplataforma ("Write Once, Run Anywhere").</p><h3>🔧 Ecosistema</h3><ul><li>JVM: Máquina Virtual que ejecuta Bytecode</li><li>JRE: Entorno para ejecutar programas</li><li>JDK: Herramientas para desarrollar</li></ul><div class="code-block"><pre><code>public class HolaMundo {
    public static void main(String[] args) {
        System.out.println("¡Hola, Mundo!");
    }
}</code></pre></div>`
  },
  {
    id: 3, level: 'beginner', module: 1, title: 'Variables y Tipos Primitivos',
    description: 'Declaración de variables, 8 tipos primitivos y casting',
    duration: '35 min',
    content: `<h2>Variables y Tipos de Datos</h2><h3>📦 8 Tipos Primitivos</h3><ul><li>Enteros: byte, short, int, long</li><li>Decimales: float, double</li><li>Caracteres: char</li><li>Booleanos: boolean</li></ul><div class="code-block"><pre><code>int edad = 25;
double precio = 19.99;
char letra = 'A';
boolean esJavaGenial = true;</code></pre></div>`
  },
  {
    id: 4, level: 'beginner', module: 1, title: 'Operadores Aritméticos y Lógicos',
    description: 'Operadores matemáticos, lógicos y precedencia',
    duration: '30 min',
    content: `<h2>Operadores</h2><h3>🔢 Aritméticos</h3><p>+, -, *, /, % (módulo)</p><h3>🔗 Lógicos</h3><p>&& (AND), || (OR), ! (NOT)</p><div class="code-block"><pre><code>int x = 10, y = 3;
int suma = x + y;       // 13
boolean esFuerte = (x > 5) && (y < 10); // true</code></pre></div>`
  },
  {
    id: 5, level: 'beginner', module: 1, title: 'Entrada y Salida con Scanner',
    description: 'Leer datos del usuario desde la consola',
    duration: '25 min',
    content: `<h2>Scanner</h2><h3>📥 Leer Datos</h3><div class="code-block"><pre><code>import java.util.Scanner;
Scanner sc = new Scanner(System.in);
System.out.print("Nombre: ");
String nombre = sc.nextLine();</code></pre></div>`
  },
  {
    id: 6, level: 'beginner', module: 2, title: 'Bucles - Parte 1',
    description: 'Bucle for y for-each',
    duration: '35 min',
    content: `<h2>Bucle For</h2><div class="code-block"><pre><code>for (int i = 0; i < 10; i++) {
    System.out.println(i);
}
for (String s : array) {
    System.out.println(s);
}</code></pre></div>`
  },
  {
    id: 7, level: 'beginner', module: 2, title: 'Estructuras Condicionales if-else',
    description: 'Toma de decisiones y control de flujo',
    duration: '35 min',
    content: `<h2>Condicionales if-else</h2><h3>🤔 Toma de Decisiones</h3><div class="code-block"><pre><code>if (edad >= 18) {
    System.out.println("Mayor");
} else {
    System.out.println("Menor");
}</code></pre></div>`
  },
  {
    id: 8, level: 'beginner', module: 2, title: 'Switch Moderno',
    description: 'Selección múltiple con switch tradicional y moderno',
    duration: '30 min',
    content: `<h2>Switch</h2><div class="code-block"><pre><code>String dia = switch(num) {
    case 1 -> "Lunes";
    default -> "Otro";
};</code></pre></div>`
  },
  {
    id: 9, level: 'beginner', module: 2, title: 'Bucles While y Do-While',
    description: 'Iteración basada en condiciones',
    duration: '30 min',
    content: `<h2>While y Do-While</h2><div class="code-block"><pre><code>while (activo) {
    // Código
}</code></pre></div>`
  },
  {
    id: 10, level: 'beginner', module: 2, title: 'Break, Continue y Etiquetas',
    description: 'Control fino de bucles',
    duration: '25 min',
    content: `<h2>Control de Bucles</h2><p>break sale del bucle. continue salta a la siguiente vuelta.</p>`
  },
  {
    id: 11, level: 'beginner', module: 3, title: 'Arrays Unidimensionales',
    description: 'Colecciones fijas de elementos',
    duration: '35 min',
    content: `<h2>Arrays</h2><div class="code-block"><pre><code>int[] nums = {1, 2, 3};</code></pre></div>`
  },
  {
    id: 12, level: 'beginner', module: 3, title: 'Arrays Multidimensionales',
    description: 'Matrices y tablas',
    duration: '30 min',
    content: `<h2>Matrices</h2><div class="code-block"><pre><code>int[][] matriz = new int[3][3];</code></pre></div>`
  },
  {
    id: 13, level: 'beginner', module: 3, title: 'Strings y Texto',
    description: 'Clase String e inmutabilidad',
    duration: '40 min',
    content: `<h2>Strings</h2><div class="code-block"><pre><code>String s = "Hola";</code></pre></div>`
  },
  {
    id: 14, level: 'beginner', module: 3, title: 'StringBuilder',
    description: 'Manipulación eficiente de cadenas mutables',
    duration: '25 min',
    content: `<h2>StringBuilder</h2><div class="code-block"><pre><code>StringBuilder sb = new StringBuilder();</code></pre></div>`
  },
  {
    id: 15, level: 'beginner', module: 3, title: 'Métodos y Funciones',
    description: 'Modularización y reutilización de código',
    duration: '40 min',
    content: `<h2>Métodos</h2><div class="code-block"><pre><code>public static int suma(int a, int b) { return a+b; }</code></pre></div>`
  },

  // 🚀 NIVEL INTERMEDIO (15 lecciones)
  {
    id: 16, level: 'intermediate', module: 4, title: 'Clases y Objetos',
    description: 'Fundamentos de POO',
    duration: '40 min',
    content: `<h2>POO: Clases y Objetos</h2>`
  },
  {
    id: 17, level: 'intermediate', module: 4, title: 'Constructores y Sobrecarga',
    description: 'Inicialización de objetos',
    duration: '35 min',
    content: `<h2>Constructores</h2>`
  },
  {
    id: 18, level: 'intermediate', module: 4, title: 'Encapsulamiento',
    description: 'Modificadores de acceso y setters/getters',
    duration: '35 min',
    content: `<h2>Encapsulamiento</h2>`
  },
  {
    id: 19, level: 'intermediate', module: 4, title: 'Herencia y Polimorfismo',
    description: 'Extensión de clases y métodos sobrescritos',
    duration: '45 min',
    content: `<h2>Herencia</h2>`
  },
  {
    id: 20, level: 'intermediate', module: 4, title: 'Clases Abstractas',
    description: 'Plantillas de clases no instanciables',
    duration: '35 min',
    content: `<h2>Clases Abstractas</h2>`
  },
  {
    id: 21, level: 'intermediate', module: 4, title: 'Interfaces y Contratos',
    description: 'Definición de comportamientos',
    duration: '40 min',
    content: `<h2>Interfaces</h2>`
  },
  {
    id: 22, level: 'intermediate', module: 5, title: 'Composición vs Herencia',
    description: 'Relaciones Has-a vs Is-a',
    duration: '35 min',
    content: `<h2>Composición</h2>`
  },
  {
    id: 23, level: 'intermediate', module: 5, title: 'Enumeraciones (Enums)',
    description: 'Tipos constantes con nombre',
    duration: '30 min',
    content: `<h2>Enums</h2>`
  },
  {
    id: 24, level: 'intermediate', module: 5, title: 'Clases Anidadas',
    description: 'Inner y Nested static classes',
    duration: '30 min',
    content: `<h2>Clases Anidadas</h2>`
  },
  {
    id: 25, level: 'intermediate', module: 5, title: 'Paquetes y Organización',
    description: 'Estructura de directorios y modularidad',
    duration: '25 min',
    content: `<h2>Paquetes</h2>`
  },
  {
    id: 26, level: 'intermediate', module: 5, title: 'Static y Final',
    description: 'Miembros de clase y constantes',
    duration: '35 min',
    content: `<h2>Static y Final</h2>`
  },
  {
    id: 27, level: 'intermediate', module: 6, title: 'ArrayList y LinkedList',
    description: 'Colecciones de tipo lista',
    duration: '40 min',
    content: `<h2>Listas</h2>`
  },
  {
    id: 28, level: 'intermediate', module: 6, title: 'HashSet y TreeSet',
    description: 'Colecciones de tipo conjunto (sin duplicados)',
    duration: '35 min',
    content: `<h2>Sets</h2>`
  },
  {
    id: 29, level: 'intermediate', module: 6, title: 'HashMap y TreeMap',
    description: 'Mapas tipo clave/valor',
    duration: '40 min',
    content: `<h2>Maps</h2>`
  },
  {
    id: 30, level: 'intermediate', module: 6, title: 'Iteradores y Ordenación',
    description: 'Recorrido y clasificación de colecciones',
    duration: '35 min',
    content: `<h2>Iterator y Comparable</h2>`
  },

  // ⚡ NIVEL AVANZADO (12 lecciones)
  {
    id: 31, level: 'advanced', module: 7, title: 'Manejo de Excepciones',
    description: 'Try, catch y flujo de errores',
    duration: '40 min',
    content: `<h2>Excepciones</h2>`
  },
  {
    id: 32, level: 'advanced', module: 7, title: 'Excepciones Personalizadas',
    description: 'Creación de errores propios',
    duration: '35 min',
    content: `<h2>Custom Exceptions</h2>`
  },
  {
    id: 33, level: 'advanced', module: 7, title: 'Try-with-Resources',
    description: 'Gestión automática de recursos',
    duration: '30 min',
    content: `<h2>Resources</h2>`
  },
  {
    id: 34, level: 'advanced', module: 8, title: 'Expresiones Lambda',
    description: 'Programación funcional básica',
    duration: '40 min',
    content: `<h2>Lambdas</h2>`
  },
  {
    id: 35, level: 'advanced', module: 8, title: 'Interfaces Funcionales',
    description: 'Predicate, Function, Consumer, Supplier',
    duration: '40 min',
    content: `<h2>Functional Interfaces</h2>`
  },
  {
    id: 36, level: 'advanced', module: 8, title: 'Method References',
    description: 'Uso del operador ::',
    duration: '30 min',
    content: `<h2>References</h2>`
  },
  {
    id: 37, level: 'advanced', module: 8, title: 'Optional',
    description: 'Manejo seguro de valores nulos',
    duration: '35 min',
    content: `<h2>Optional</h2>`
  },
  {
    id: 38, level: 'advanced', module: 9, title: 'Streams: Filter y Map',
    description: 'Procesamiento de datos funcional',
    duration: '45 min',
    content: `<h2>Streams</h2>`
  },
  {
    id: 39, level: 'advanced', module: 9, title: 'Collectors y Terminales',
    description: 'Finalización de flujo de streams',
    duration: '40 min',
    content: `<h2>Collectors</h2>`
  },
  {
    id: 40, level: 'advanced', module: 9, title: 'Parallel Streams',
    description: 'Rendimiento en multinúcleo',
    duration: '35 min',
    content: `<h2>Parallel</h2>`
  },
  {
    id: 41, level: 'advanced', module: 10, title: 'File I/O y NIO.2',
    description: 'Lectura y escritura de archivos',
    duration: '40 min',
    content: `<h2>Files</h2>`
  },
  {
    id: 42, level: 'advanced', module: 10, title: 'Serialización',
    description: 'Persistencia de objetos',
    duration: '35 min',
    content: `<h2>Serialization</h2>`
  },

  // 👑 NIVEL EXPERTO (10 lecciones)
  {
    id: 43, level: 'expert', module: 11, title: 'Threads y Runnable',
    description: 'Hilos y ejecución concurrente',
    duration: '45 min',
    content: `<h2>Multithreading</h2>`
  },
  {
    id: 44, level: 'expert', module: 11, title: 'Sincronización y Locks',
    description: 'Seguridad entre hilos',
    duration: '45 min',
    content: `<h2>Synchronization</h2>`
  },
  {
    id: 45, level: 'expert', module: 11, title: 'Executor Service',
    description: 'Administración de pools de hilos',
    duration: '40 min',
    content: `<h2>Executors</h2>`
  },
  {
    id: 46, level: 'expert', module: 11, title: 'CompletableFuture',
    description: 'Programación asíncrona avanzada',
    duration: '40 min',
    content: `<h2>Async</h2>`
  },
  {
    id: 47, level: 'expert', module: 12, title: 'Patrones Creacionales',
    description: 'Singleton, Factory, Builder',
    duration: '35 min',
    content: `<h2>Creational Patterns</h2>`
  },
  {
    id: 48, level: 'expert', module: 12, title: 'Patrones Estructurales',
    description: 'Adapter, Decorator, Proxy',
    duration: '40 min',
    content: `<h2>Structural Patterns</h2>`
  },
  {
    id: 49, level: 'expert', module: 12, title: 'Patrones Comportamiento',
    description: 'Observer, Strategy, State',
    duration: '40 min',
    content: `<h2>Behavioral Patterns</h2>`
  },
  {
    id: 50, level: 'expert', module: 13, title: 'SOLID Principles',
    description: 'Arquitectura de software profesional',
    duration: '50 min',
    content: `<h2>SOLID</h2>`
  },
  {
    id: 51, level: 'expert', module: 13, title: 'Clean Code y Refactor',
    description: 'Escritura de código mantenible',
    duration: '45 min',
    content: `<h2>Clean Code</h2>`
  },
  {
    id: 52, level: 'expert', module: 13, title: 'Testing Unitario (JUnit)',
    description: 'Calidad y verificación de código',
    duration: '50 min',
    content: `<h2>Testing</h2>`
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
