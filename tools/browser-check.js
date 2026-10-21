'use strict';
// C-18: verificación en navegador real (herramienta de test, dependencia
// de desarrollo solamente). NO la carga la plataforma.
// Uso: node tools/browser-check.js
// Abre index.html headless (file://), usa el flujo real
// (openExercise → #exercise-code → botón "Verificar Solución" →
// #exercise-result) y reporta pass/fail por caso. El ruido de consola
// de CDN/fuentes se ignora; los errores JS propios se listan aparte.

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const CASES = [
  // Lote 1, id 5 (Hola Mundo): decisiones Belén.
  { id: 5, label: 'id5 otro texto', expect: true, code: 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println("hola mama");\n    }\n}' },
  { id: 5, label: 'id5 print', expect: true, code: 'public class Hola {\n    public static void main(String[] args) {\n        System.out.print("Hola, Java!");\n    }\n}' },
  { id: 5, label: 'id5 printf', expect: true, code: 'public class Hola {\n    public static void main(String[] args) {\n        System.out.printf("%s", "Hola");\n    }\n}' },
  { id: 5, label: 'id5 clase HolaMundo', expect: true, code: 'public class HolaMundo {\n    public static void main(String[] args) {\n        System.out.println("Hola, Java!");\n    }\n}' },
  { id: 5, label: 'id5 sin comillas', expect: false, code: 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println(Hola);\n    }\n}' },
  { id: 5, label: 'id5 respuesta en comentario', expect: false, code: '// public class Hola {\n// public static void main(String[] args) {\n// System.out.println("Hola, Java!");\n// }\n// }' },
  { id: 5, label: 'id5 llave de más', expect: false, code: 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println("Hola");\n    }\n}\n}' },
  { id: 5, label: 'id5 llave de menos', expect: false, code: 'public class Hola {\n    public static void main(String[] args) {\n        System.out.println("Hola");\n    }\n' },
  // Lote 1, otros ids representativos (canónicas).
  { id: 1, label: 'id1 canónica', expect: true, code: 'public class Ejemplo {\n    public static void main(String[] args) {\n        System.out.println("Hola");\n    }\n}' },
  { id: 2, label: 'id2 variante válida', expect: true, code: 'if (edad >= 18) {\n    System.out.println("Grande");\n} else {\n    System.out.println("Chico");\n}' },
  { id: 4, label: 'id4 contador renombrado', expect: true, code: 'for (int k = 0; k < 5; k++) {\n    if (k % 2 == 0) {\n        System.out.println(k);\n    }\n}' },
  { id: 6, label: 'id6 dos println', expect: true, code: 'System.out.println("Primera");\nSystem.out.println("Segunda");' },
  { id: 6, label: 'id6 dos print (trampa)', expect: false, code: 'System.out.print("Línea 1");\nSystem.out.print("Línea 2");' },
  { id: 7, label: 'id7 print+println', expect: true, code: 'System.out.print("Ey ");\nSystem.out.println("vos");' },
  { id: 7, label: 'id7 orden invertido (trampa)', expect: false, code: 'System.out.println("Mundo");\nSystem.out.print("Hola ");' },
  // Lotes 2-15: un válido + una trampa por lote.
  { id: 9, label: 'id9 extra válido', expect: true, code: 'int edad = 25;\nint aparte = 1;' },
  { id: 9, label: 'id9 número mal (trampa)', expect: false, code: 'int edad = 26;' },
  { id: 27, label: 'id27 += válido', expect: true, code: 'int suma = 0;\nint i = 1;\nwhile (i <= 100) {\n    suma += i;\n    i++;\n}\nSystem.out.println(suma);' },
  { id: 27, label: 'id27 sin += (trampa)', expect: false, code: 'int suma = 0;\nint i = 1;\nwhile (i <= 100) {\n    suma = suma + i;\n    i++;\n}\nSystem.out.println(suma);' },
  { id: 33, label: 'id33 scanner válido', expect: true, code: 'Scanner sc = new Scanner(System.in);\nSystem.out.print("Edad: ");\nint edad = sc.nextInt();' },
  { id: 33, label: 'id33 nextLine (trampa)', expect: false, code: 'Scanner sc = new Scanner(System.in);\nSystem.out.print("Edad: ");\nint edad = sc.nextLine();' },
  { id: 45, label: 'id45 length válido', expect: true, code: 'System.out.println(nums.length);' },
  { id: 45, label: 'id45 length() (trampa)', expect: false, code: 'System.out.println(nums.length());' },
  { id: 62, label: 'id62 this válido', expect: true, code: 'public Persona(String nombre, int edad) {\n    this.nombre = nombre;\n    this.edad = edad;\n}' },
  { id: 62, label: 'id62 sin this (trampa)', expect: false, code: 'public Persona(String nombre, int edad) {\n    nombre = nombre;\n    edad = edad;\n}' },
  { id: 72, label: 'id72 super primero válido', expect: true, code: 'public Estudiante(String nombre, String carrera) {\n    super(nombre);\n    this.carrera = carrera;\n}' },
  { id: 72, label: 'id72 super último (trampa)', expect: false, code: 'public Estudiante(String nombre, String carrera) {\n    this.carrera = carrera;\n    super(nombre);\n}' },
  { id: 89, label: 'id89 equals válido', expect: true, code: '@Override\npublic boolean equals(Object obj) {\n    if (obj instanceof Persona) {\n        return nombre.equals(((Persona) obj).nombre);\n    }\n    return false;\n}' },
  { id: 89, label: 'id89 con == (trampa)', expect: false, code: '@Override\npublic boolean equals(Object obj) {\n    if (obj instanceof Persona) {\n        return nombre == ((Persona) obj).nombre;\n    }\n    return false;\n}' },
  { id: 101, label: 'id101 diamante válido', expect: true, code: 'ArrayList<String> lista = new ArrayList<>();' },
  { id: 101, label: 'id101 tipo explícito (trampa)', expect: false, code: 'ArrayList<String> lista = new ArrayList<String>();' },
  { id: 121, label: 'id121 try-catch válido', expect: true, code: 'try {\n    int x = Integer.parseInt("abc");\n} catch (NumberFormatException e) {\n    System.out.println("Error de formato");\n}' },
  { id: 121, label: 'id121 catch Exception (trampa)', expect: false, code: 'try {\n    int x = Integer.parseInt("abc");\n} catch (Exception e) {\n    System.out.println("Error de formato");\n}' },
  { id: 137, label: 'id137 ofNullable válido', expect: true, code: 'Optional<String> opt = Optional.ofNullable(texto);' },
  { id: 137, label: 'id137 of (trampa)', expect: false, code: 'Optional<String> opt = Optional.of(texto);' },
  { id: 160, label: 'id160 anyMatch válido', expect: true, code: 'boolean hayPar = nums.stream().anyMatch(n -> n % 2 == 0);' },
  { id: 160, label: 'id160 allMatch (trampa)', expect: false, code: 'boolean hayPar = nums.stream().allMatch(n -> n % 2 == 0);' },
  { id: 165, label: 'id165 deleteIfExists válido', expect: true, code: 'Files.deleteIfExists(Path.of("archivo.txt"));' },
  { id: 165, label: 'id165 delete (trampa)', expect: false, code: 'Files.delete(Path.of("archivo.txt"));' },
  { id: 171, label: 'id171 start válido', expect: true, code: 't.start();' },
  { id: 171, label: 'id171 run (trampa)', expect: false, code: 't.run();' },
  { id: 189, label: 'id189 singleton válido', expect: true, code: 'public class Singleton {\n    private static Singleton instancia;\n    private Singleton() {}\n    public static Singleton getInstancia() {\n        if (instancia == null) {\n            instancia = new Singleton();\n        }\n        return instancia;\n    }\n}' },
  { id: 189, label: 'id189 ctor público (trampa)', expect: false, code: 'public class Singleton {\n    private static Singleton instancia;\n    public Singleton() {}\n    public static Singleton getInstancia() {\n        if (instancia == null) {\n            instancia = new Singleton();\n        }\n        return instancia;\n    }\n}' },
  { id: 200, label: 'id200 test válido', expect: true, code: '@Test\nvoid testSuma() {\n    int resultado = 2 + 2;\n    assertEquals(4, resultado);\n}' },
  { id: 200, label: 'id200 assert invertido (trampa)', expect: false, code: '@Test\nvoid testSuma() {\n    int resultado = 2 + 2;\n    assertEquals(resultado, 4);\n}' },
];

// ---------------------------------------------------------------------
// C-11b lesson-exercise-nav: casos de navegación y de responsive.
// Cada `check(label, ok, detalle)` cuenta como un caso.
// ---------------------------------------------------------------------
const NAV_LESSON = 3; // lección con varios ejercicios (se leen de exercisesData)
const WIDTHS = [360, 390, 424];

function makeChecker(results) {
  return (label, ok, detail) => {
    results.push({ label, ok: !!ok });
    console.log(`${ok ? 'ok' : 'FALLO'} - ${label}${ok || !detail ? '' : ` [${detail}]`}`);
  };
}

async function openAndRead(page, id) {
  await page.evaluate((i) => openExercise(i), id);
  await page.waitForFunction(
    (i) => document.getElementById('exercise-content').dataset.exerciseId === String(i),
    id, { timeout: 10000 },
  );
}

const currentExerciseId = (page) => page.evaluate(
  () => Number(document.getElementById('exercise-content').dataset.exerciseId),
);

async function runNavigationChecks(browser, url, check, ownErrors) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', (err) => ownErrors.push(String(err && err.message || err)));
  await page.goto(url);
  await page.waitForFunction(
    () => typeof openExercise === 'function' && typeof LessonNav !== 'undefined',
    null, { timeout: 30000 },
  );
  const { ids, lessonIds, reading } = await page.evaluate((lid) => ({
    ids: exercisesData.filter((e) => e.lessonId === lid).map((e) => e.id),
    lessonIds: lessonsData.map((l) => l.id),
    reading: LessonNav.readingLessonIds(exercisesData, lessonsData),
  }), NAV_LESSON);
  const click = (nav) => page.click(`#exercise-content .lesson-navigation [data-nav="${nav}"]`);

  // Siguiente / Anterior dentro de la lección.
  await openAndRead(page, ids[0]);
  await click('next');
  check('nav: Siguiente avanza al 2.º ejercicio de la misma lección', (await currentExerciseId(page)) === ids[1]);
  await click('next');
  check('nav: Siguiente avanza al 3.er ejercicio de la lección', (await currentExerciseId(page)) === ids[2]);
  await click('prev');
  check('nav: Anterior vuelve al 2.º ejercicio de la lección', (await currentExerciseId(page)) === ids[1]);
  await openAndRead(page, ids[0]);
  check('nav: Anterior deshabilitado en el 1.er ejercicio de la lección',
    await page.isDisabled('#exercise-content [data-nav="prev"]'));

  // Fin de lección: avance a la lección siguiente + volver a lecciones.
  await openAndRead(page, ids[ids.length - 1]);
  const advanceText = (await page.textContent('#exercise-content [data-nav="next"]')).trim();
  check('nav: en el último ejercicio el avance dice "Siguiente Lección"', /Siguiente Lecci/.test(advanceText), advanceText);
  check('nav: "Volver a Lecciones" sigue visible en el último ejercicio',
    await page.isVisible('#exercise-content [data-nav="back"]'));
  await click('next');
  await page.waitForFunction(() => document.getElementById('lesson-viewer').classList.contains('active'), null, { timeout: 5000 });
  const nextLessonTitle = await page.evaluate((lid) => {
    const l = lessonsData[lessonsData.findIndex((x) => x.id === lid) + 1];
    return l.title;
  }, NAV_LESSON);
  const viewerText = await page.textContent('#lesson-content');
  check('nav: "Siguiente Lección" abre la lección siguiente', viewerText.includes(nextLessonTitle.replace(/^[^\p{L}\d]+/u, '')) || viewerText.includes(nextLessonTitle));
  check('nav: al pasar de lección se cierra el visor de ejercicio',
    !(await page.evaluate(() => document.getElementById('exercise-viewer').classList.contains('active'))));
  await page.evaluate(() => closeLesson());

  // Última lección: sin avance.
  const lastIds = await page.evaluate(() => {
    const lastLesson = lessonsData[lessonsData.length - 1].id;
    return exercisesData.filter((e) => e.lessonId === lastLesson).map((e) => e.id);
  });
  await openAndRead(page, lastIds[lastIds.length - 1]);
  check('nav: en la última lección el avance está deshabilitado',
    await page.isDisabled('#exercise-content [data-nav="next"]'));
  check('nav: en la última lección "Volver a Lecciones" funciona',
    await page.isEnabled('#exercise-content [data-nav="back"]'));
  await page.evaluate(() => closeExercise());

  // Tarjetas con sus ejercicios (grilla y módulos).
  for (const view of ['grid', 'modules']) {
    const scope = view === 'grid' ? '#lessons-grid' : '#modules-view';
    const cards = await page.evaluate((sel) => Array.from(document.querySelectorAll(`${sel} .lesson-card`)).map((c) => ({
      id: Number(c.dataset.lessonId),
      reading: !!c.querySelector('.lesson-reading-badge'),
      count: Number((c.querySelector('.lesson-exercises-count') || { dataset: {} }).dataset.count || 0),
      names: Array.from(c.querySelectorAll('.lesson-exercise-list li')).map((li) => li.textContent.trim()),
      countText: (c.querySelector('.lesson-exercises-count') || { textContent: '' }).textContent.trim(),
    })), scope);
    check(`tarjetas (${view}): 52 tarjetas con id de lección`, cards.length === 52 && cards.every((c) => c.id > 0), String(cards.length));
    const expectedNames = await page.evaluate(() => Object.fromEntries(lessonsData.map((l) => [l.id, exercisesData.filter((e) => e.lessonId === l.id).map((e) => e.title)])));
    const totalCount = cards.reduce((n, c) => n + c.count, 0);
    check(`tarjetas (${view}): la suma de cantidades es 208`, totalCount === 208, String(totalCount));
    check(`tarjetas (${view}): cada tarjeta lista los nombres de sus ejercicios en orden`,
      cards.filter((c) => !c.reading).every((c) => JSON.stringify(c.names) === JSON.stringify(expectedNames[c.id])));
    check(`tarjetas (${view}): la cantidad se muestra con texto ("N ejercicios")`,
      cards.filter((c) => !c.reading).every((c) => new RegExp(`^${c.count}\\s+ejercicio`).test(c.countText.replace(/^\S+\s/, '')) || c.countText.includes(String(c.count))));
    const readingCards = cards.filter((c) => c.reading).map((c) => c.id).sort((a, b) => a - b);
    check(`tarjetas (${view}): lecciones de lectura 22, 25, 40, 42`,
      JSON.stringify(readingCards) === JSON.stringify([22, 25, 40, 42]) && JSON.stringify(reading) === JSON.stringify([22, 25, 40, 42]));
    check(`tarjetas (${view}): las de lectura no muestran lista ni cantidad`,
      cards.filter((c) => c.reading).every((c) => c.names.length === 0 && c.count === 0));
  }
  check('tarjetas: abrir una tarjeta sigue abriendo la lección', await (async () => {
    await page.evaluate(() => switchView('grid'));
    await page.click('#lessons-grid .lesson-card[data-lesson-id="3"]');
    const ok = await page.evaluate(() => document.getElementById('lesson-viewer').classList.contains('active'));
    await page.evaluate(() => closeLesson());
    return ok;
  })());
  check('c12: clic directo en un ejercicio dentro de una tarjeta abre ese ejercicio', await (async () => {
    await page.evaluate(() => switchView('grid'));
    const exId = ids[1];
    await page.click(`#lessons-grid .lesson-card[data-lesson-id="${NAV_LESSON}"] .lesson-exercise-list li[data-exercise-id="${exId}"]`);
    await page.waitForFunction((i) => document.getElementById('exercise-content').dataset.exerciseId === String(i), exId, { timeout: 5000 });
    const ok = await page.evaluate((i) => document.getElementById('exercise-viewer').classList.contains('active')
      && Number(document.getElementById('exercise-content').dataset.exerciseId) === i, exId);
    await page.evaluate(() => closeExercise());
    return ok;
  })());

  // C-12: sin @import en CSS y Google Fonts con <link>.
  const stylesSrc = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  const femSrc = fs.readFileSync(path.join(__dirname, '..', 'colors-feminine.css'), 'utf8');
  const hasFontLink = await page.evaluate(() => !!document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"]'));
  check('c12: sin @import en CSS y Google Fonts cargado con <link>',
    !/^\s*@import\b/m.test(stylesSrc) && !/^\s*@import\b/m.test(femSrc) && hasFontLink);

  // C-12: sección "Mi Progreso" separada de #lecciones y con 4 barras por nivel.
  const progInfo = await page.evaluate(() => {
    const lec = document.getElementById('lecciones');
    const prog = document.getElementById('progreso');
    if (!lec || !prog) return null;
    const lr = lec.getBoundingClientRect();
    const pr = prog.getBoundingClientRect();
    const bars = ['beginner', 'intermediate', 'advanced', 'expert'].every(
      (lv) => !!prog.querySelector(`#${lv}-progress`) && !!prog.querySelector(`#${lv}-text`),
    );
    return {
      notNested: !lec.contains(prog),
      gap: pr.top - lr.bottom,
      bars,
    };
  });
  check('c12: "Mi Progreso" fuera de #lecciones, separada (>= 40 px) y con 4 barras de nivel',
    Boolean(progInfo && progInfo.notNested && progInfo.gap >= 40 && progInfo.bars),
    JSON.stringify(progInfo));

  // "Ver Todos los Ejercicios" agrupado por nivel y lección.
  await openAndRead(page, ids[0]);
  await page.click('#exercise-content [data-nav="all"]');
  const levelSections = await page.evaluate(() => Array.from(document.querySelectorAll('#exercise-content .exercises-level-section')).map((s) => s.dataset.level));
  const nestedLessonCards = await page.evaluate(() => document.querySelectorAll('#exercise-content .exercises-menu-groups .lesson-card').length);
  check('c12: "Ver Todos" tiene 4 secciones por nivel y no anida .lesson-card',
    JSON.stringify(levelSections) === JSON.stringify(['beginner', 'intermediate', 'advanced', 'expert']) && nestedLessonCards === 0,
    JSON.stringify({ levelSections, nestedLessonCards }));
  const groups = await page.evaluate(() => Array.from(document.querySelectorAll('#exercise-content .exercise-group')).map((g) => ({
    id: Number(g.dataset.lessonId),
    title: (g.querySelector('.exercise-group-title') || { textContent: '' }).textContent,
    items: Array.from(g.querySelectorAll('.exercise-item')).map((i) => Number(i.dataset.exerciseId)),
  })));
  const flat = groups.flatMap((g) => g.items);
  check('ver todos: agrupado en 48 lecciones con ejercicios', groups.length === 48, String(groups.length));
  check('ver todos: lista los 208 ejercicios sin duplicar', flat.length === 208 && new Set(flat).size === 208, String(flat.length));
  check('ver todos: cada grupo trae solo ejercicios de su lección y en orden', await page.evaluate((gs) => gs.every((g) => JSON.stringify(g.items) === JSON.stringify(exercisesData.filter((e) => e.lessonId === g.id).map((e) => e.id))), groups));
  check('ver todos: los grupos siguen el orden de las lecciones', groups.every((g, i) => i === 0 || groups[i - 1].id < g.id));
  check('ver todos: cada grupo tiene el título de su lección', await page.evaluate((gs) => gs.every((g) => g.title.includes(lessonsData.find((l) => l.id === g.id).title)), groups));
  await page.click(`#exercise-content .exercise-item[data-exercise-id="${ids[2]}"]`);
  await page.waitForFunction((i) => document.getElementById('exercise-content').dataset.exerciseId === String(i), ids[2], { timeout: 5000 });
  check('ver todos: elegir un ejercicio lo abre', (await currentExerciseId(page)) === ids[2]);

  // C-12: aviso de validación discreto al pie (.validation-mode-note).
  await page.fill('#exercise-code', 'int x = ;');
  await page.click('button:has-text("Verificar Solución")');
  await page.waitForFunction(() => !!document.querySelector('#exercise-result .validation-mode-note'), null, { timeout: 5000 });
  const noteCheck = await page.evaluate(() => {
    const note = document.querySelector('#exercise-result .validation-mode-note');
    return note ? {
      text: note.textContent.trim(),
      dataNotice: note.getAttribute('data-notice') || '',
    } : null;
  });
  check('c12: aviso de validación discreto al pie (.validation-mode-note)',
    Boolean(noteCheck && /Validado en tu navegador/.test(noteCheck.text) && /validando por reglas/.test(noteCheck.dataNotice)),
    JSON.stringify(noteCheck));

  // Función única de disponibilidad: la consultan Siguiente y las tarjetas, incluyendo isLevelAvailable.
  await page.evaluate((blocked) => {
    window.__origAvail = LessonNav.isAvailable;
    LessonNav.isAvailable = (kind, id) => !(kind === 'exercise' && id === blocked);
  }, ids[1]);
  await openAndRead(page, ids[0]);
  check('disponibilidad: si el siguiente no está disponible, "Siguiente" se deshabilita',
    await page.isDisabled('#exercise-content [data-nav="next"]'));
  await page.evaluate((blockedLesson) => {
    LessonNav.isAvailable = (kind, id) => !(kind === 'lesson' && id === blockedLesson);
    renderLessons('all');
  }, 5);
  check('disponibilidad: la tarjeta de una lección no disponible se marca como bloqueada',
    await page.evaluate(() => document.querySelector('#lessons-grid .lesson-card[data-lesson-id="5"]').classList.contains('lesson-locked')
      && !document.querySelector('#lessons-grid .lesson-card[data-lesson-id="6"]').classList.contains('lesson-locked')));
  await page.evaluate(() => {
    LessonNav.isAvailable = window.__origAvail;
    window.__origLevelAvail = LessonNav.isLevelAvailable;
    LessonNav.isLevelAvailable = (level) => level !== 'expert';
    renderLessons('all');
  });
  check('c12 (disponibilidad por nivel): LessonNav.isLevelAvailable bloquea un nivel entero cuando devuelve false',
    await page.evaluate(() => {
      const expCards = Array.from(document.querySelectorAll('#lessons-grid .lesson-card.level-expert'));
      const begCards = Array.from(document.querySelectorAll('#lessons-grid .lesson-card.level-beginner'));
      return expCards.length > 0 && expCards.every((c) => c.classList.contains('lesson-locked'))
        && begCards.every((c) => !c.classList.contains('lesson-locked'));
    }));
  await page.evaluate(() => {
    LessonNav.isLevelAvailable = window.__origLevelAvail;
    renderLessons('all');
  });
  check('disponibilidad: sin regla activa, ninguna tarjeta está bloqueada',
    await page.evaluate(() => document.querySelectorAll('#lessons-grid .lesson-locked').length === 0));
  await page.close();
}

// Mide la pantalla de ejercicio a un ancho dado (responsive).
async function measureExerciseScreen(page, width, longLine) {
  return page.evaluate(({ longLine }) => {
    const card = document.getElementById('exercise-content');
    const cardRect = card.getBoundingClientRect();
    const viewer = document.getElementById('exercise-viewer');
    const vw = document.documentElement.clientWidth;
    const lines = (el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      const rects = Array.from(r.getClientRects()).filter((x) => x.width > 0 && x.height > 0).sort((a, b) => a.top - b.top);
      let n = 0; let bottom = -Infinity;
      for (const x of rects) { if (x.top >= bottom - 1) { n++; bottom = x.bottom; } else bottom = Math.max(bottom, x.bottom); }
      return n;
    };
    const info = (el) => {
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        text: el.textContent.trim(), left: b.left, right: b.right, top: b.top, width: b.width, height: b.height,
        visible: cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 0 && b.height > 0,
        insideCard: b.left >= cardRect.left - 0.5 && b.right <= cardRect.right + 0.5,
        insideScreen: b.left >= -0.5 && b.right <= vw + 0.5,
        lines: lines(el), clipped: el.scrollWidth > el.clientWidth + 1,
        bg: cs.backgroundImage, fontSize: parseFloat(cs.fontSize),
      };
    };
    const actions = Array.from(document.querySelectorAll('#exercise-content .exercise-actions button')).map(info);
    const navs = Array.from(document.querySelectorAll('#exercise-content .lesson-navigation [data-nav]')).map((b) => ({ key: b.dataset.nav, ...info(b) }));
    const boxOf = (needle) => {
      const strong = Array.from(document.querySelectorAll('#exercise-result strong')).find((s) => s.textContent.includes(needle));
      const box = strong ? strong.parentElement : null;
      return box ? box.getBoundingClientRect().width : 0;
    };
    const hint = document.getElementById('exercise-hint');
    const ta = document.getElementById('exercise-code');
    if (longLine) { ta.value = 'int x = 1;' + ' // ' + 'x'.repeat(200); ta.dispatchEvent(new Event('input')); }
    const box = (sel) => { const e = document.querySelector(sel); return e ? e.scrollWidth <= e.clientWidth + 1 : false; };
    const consignaEl = card.querySelector('p');
    const editorEl = card.querySelector('.exercise-editor');
    const cr = consignaEl ? consignaEl.getBoundingClientRect() : null;
    const er = editorEl ? editorEl.getBoundingClientRect() : null;
    return {
      vw, cardWidth: cardRect.width,
      overflow: {
        body: document.body.scrollWidth <= document.body.clientWidth + 1,
        html: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
        viewer: viewer.scrollWidth <= viewer.clientWidth + 1,
        card: card.scrollWidth <= card.clientWidth + 1,
        actions: box('#exercise-content .exercise-actions'),
        nav: box('#exercise-content .lesson-navigation'),
      },
      actions, navs,
      errorBox: boxOf('Errores Encontrados'),
      hintWidth: hint && getComputedStyle(hint).display !== 'none' ? hint.getBoundingClientRect().width : 0,
      editor: { scrolls: ta.scrollWidth > ta.clientWidth + 1, pageScrolls: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 },
      margins: {
        consignaLeft: cr ? cr.left : 0,
        consignaRight: cr ? vw - cr.right : 0,
        editorLeft: er ? er.left : 0,
        editorRight: er ? vw - er.right : 0,
      },
    };
  }, { longLine });
}

async function measureCloseAndModal(page, viewerId, contentId) {
  return page.evaluate(({ viewerId, contentId }) => {
    const viewer = document.getElementById(viewerId);
    const card = document.getElementById(contentId);
    viewer.scrollTop = 0;
    const close = card.querySelector('.lesson-close');
    const h2 = card.querySelector('h2');
    const p = card.querySelector('p');
    const overlaps = (a, b) => {
      if (!a || !b) return false;
      return !(a.right <= b.left + 0.5 || a.left >= b.right - 0.5 || a.bottom <= b.top + 0.5 || a.top >= b.bottom - 0.5);
    };
    const c0 = close.getBoundingClientRect();
    const h2r = h2 ? h2.getBoundingClientRect() : null;
    const pr = p ? p.getBoundingClientRect() : null;
    const noOverlapTitle = !overlaps(c0, h2r);
    const noOverlapPara = !overlaps(c0, pr);

    viewer.scrollTop = 250;
    const cs = close.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    const hit = document.elementFromPoint(cs.left + cs.width / 2, cs.top + cs.height / 2);
    const stickyOk = cs.top >= -0.5 && cs.bottom <= vh + 0.5 && cs.left >= -0.5 && cs.right <= vw + 0.5
      && cs.width >= 43.5 && cs.height >= 43.5 && (hit === close || close.contains(hit));
    viewer.scrollTop = 0;

    return {
      noOverflow: viewer.scrollWidth <= viewer.clientWidth + 1 && card.scrollWidth <= card.clientWidth + 1,
      noOverlapTitle,
      noOverlapPara,
      stickyOk,
    };
  }, { viewerId, contentId });
}

async function measureLessonScreen(page, lessonId) {
  await page.evaluate((id) => openLesson(id), lessonId);
  return page.evaluate(() => {
    const viewer = document.getElementById('lesson-viewer');
    const card = document.getElementById('lesson-content');
    const nav = card.querySelector('.lesson-navigation');
    const cardRect = card.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const lines = (el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      const rects = Array.from(r.getClientRects()).filter((x) => x.width > 0 && x.height > 0).sort((a, b) => a.top - b.top);
      let n = 0; let bottom = -Infinity;
      for (const x of rects) { if (x.top >= bottom - 1) { n++; bottom = x.bottom; } else bottom = Math.max(bottom, x.bottom); }
      return n;
    };
    const btns = Array.from(nav.querySelectorAll('button')).map((el) => {
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        key: el.dataset.lessonNav || '',
        text: el.textContent.trim(),
        left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height,
        visible: cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 0 && b.height > 0,
        insideCard: b.left >= cardRect.left - 0.5 && b.right <= cardRect.right + 0.5,
        insideScreen: b.left >= -0.5 && b.right <= vw + 0.5,
        lines: lines(el),
        clipped: el.scrollWidth > el.clientWidth + 1,
      };
    });
    const gapOf = (sel) => {
      const el = card.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left, right: vw - r.right };
    };
    return {
      vw,
      overflow: {
        viewer: viewer.scrollWidth <= viewer.clientWidth + 1,
        card: card.scrollWidth <= card.clientWidth + 1,
        nav: nav.scrollWidth <= nav.clientWidth + 1,
      },
      btns,
      textGaps: {
        h2: gapOf('h2'),
        p: gapOf('p'),
        infoBox: gapOf('.info-box'),
      },
    };
  });
}

async function runResponsiveChecks(browser, url, check, ownErrors) {
  for (const width of [...WIDTHS, 768]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    page.on('pageerror', (err) => ownErrors.push(String(err && err.message || err)));
    await page.goto(url);
    await page.waitForFunction(() => typeof openExercise === 'function' && typeof exercisesData !== 'undefined', null, { timeout: 30000 });
    const ids = await page.evaluate((lid) => exercisesData.filter((e) => e.lessonId === lid).map((e) => e.id), NAV_LESSON);
    await openAndRead(page, ids[1]);
    await page.fill('#exercise-code', 'int x = ;');
    await page.click('button:has-text("Verificar Solución")');
    await page.waitForFunction(() => /Errores Encontrados/.test(document.getElementById('exercise-result').textContent || ''), null, { timeout: 10000 });
    await page.click('button:has-text("Ver Pista")');
    const m = await measureExerciseScreen(page, width, false);
    const tag = `${width}px`;
    const o = m.overflow;
    check(`responsive ${tag}: sin desborde horizontal (cuerpo, tarjeta, contenedores de botones)`,
      o.body && o.html && o.viewer && o.card && o.actions && o.nav, JSON.stringify(o));
    const all = [...m.actions, ...m.navs];
    check(`responsive ${tag}: los 7 botones (3 acción + 4 navegación) existen y son visibles`,
      m.actions.length === 3 && m.navs.length === 4 && all.every((b) => b.visible), `${m.actions.length}+${m.navs.length}`);
    check(`responsive ${tag}: los 7 botones están completos dentro de la tarjeta y de la pantalla`,
      all.every((b) => b.insideCard && b.insideScreen && !b.clipped), all.filter((b) => !(b.insideCard && b.insideScreen && !b.clipped)).map((b) => b.text).join('|'));
    check(`responsive ${tag}: ningún botón tiene el texto partido en más de una línea`,
      all.every((b) => b.lines === 1), all.filter((b) => b.lines !== 1).map((b) => `${b.text}:${b.lines}`).join('|'));
    check(`responsive ${tag}: las cajas de errores y de pista usan al menos el 85 % del ancho de la tarjeta`,
      m.errorBox >= 0.85 * m.cardWidth && m.hintWidth >= 0.85 * m.cardWidth,
      `error ${(m.errorBox / m.cardWidth * 100).toFixed(0)}% pista ${(m.hintWidth / m.cardWidth * 100).toFixed(0)}%`);
    if (width <= 480) {
      const [verify, hintBtn, reset] = m.actions;
      check(`responsive ${tag}: "Verificar Solución" en fila completa y "Ver Pista"/"Reiniciar" lado a lado a mitad`,
        verify.width >= 0.9 * (reset.right - hintBtn.left) && Math.abs(hintBtn.top - reset.top) < 2 && hintBtn.top > verify.top + verify.height - 1
        && Math.abs(hintBtn.width - reset.width) < 4,
        `${verify.width.toFixed(0)}/${hintBtn.width.toFixed(0)}/${reset.width.toFixed(0)}`);
      check(`responsive ${tag}: alto táctil de 44 px o más en los 7 botones`,
        all.every((b) => b.height >= 43.5), all.filter((b) => b.height < 43.5).map((b) => `${b.text}:${b.height.toFixed(0)}`).join('|'));
      const next = m.navs.find((b) => b.key === 'next');
      const others = m.navs.filter((b) => b.key !== 'next');
      check(`responsive ${tag}: "Siguiente" se ve completo y es el más destacado de la navegación`,
        /Siguiente Ejercicio/.test(next.text) && next.insideCard && next.top <= Math.min(...others.map((b) => b.top))
        && next.bg !== 'none' && others.every((b) => b.bg !== next.bg && next.width >= b.width), next.text);
      const m2 = await measureExerciseScreen(page, width, true);
      check(`responsive ${tag}: una línea larga hace scroll en el editor y no en la página`,
        m2.editor.scrolls && !m2.editor.pageScrolls);
      const m3 = await (async () => {
        await page.evaluate(() => { document.getElementById('exercise-code').value = 'int x = 1;'; document.getElementById('exercise-code').dispatchEvent(new Event('input')); });
        return measureExerciseScreen(page, width, false);
      })();
      check(`responsive ${tag}: sin línea larga el editor no hace scroll horizontal`, !m3.editor.scrolls);
      // Último ejercicio de la lección: "Siguiente Lección" también cabe.
      await openAndRead(page, ids[ids.length - 1]);
      const ml = await measureExerciseScreen(page, width, false);
      const nl = ml.navs.find((b) => b.key === 'next');
      check(`responsive ${tag}: "Siguiente Lección" (último ejercicio) cabe en una línea dentro de la tarjeta`,
        /Siguiente Lecci/.test(nl.text) && nl.insideCard && nl.lines === 1 && !nl.clipped, nl.text);
      check(`responsive ${tag} (ejercicio): consigna a >= 20 px del borde y editor a >= 16 px`,
        m.margins.consignaLeft >= 19.5 && m.margins.consignaRight >= 19.5
        && m.margins.editorLeft >= 15.5 && m.margins.editorRight >= 15.5,
        JSON.stringify(m.margins));
    }

    // Botón "X" en ventana de ejercicio (sin superposición con título ni primer párrafo + sticky al hacer scroll).
    const exClose = await measureCloseAndModal(page, 'exercise-viewer', 'exercise-content');
    check(`responsive ${tag} (ejercicio): botón "X" no se superpone con título ni primer párrafo y sigue visible/tocable al hacer scroll`,
      exClose.noOverlapTitle && exClose.noOverlapPara && exClose.stickyOk, JSON.stringify(exClose));

    // Ventana "Ver Todos los Ejercicios": sin desborde + botón "X" sin superposición y sticky al hacer scroll.
    await page.evaluate(() => showExercisesMenu());
    const menuClose = await measureCloseAndModal(page, 'exercise-viewer', 'exercise-content');
    check(`responsive ${tag} (Ver Todos): sin desborde horizontal y botón "X" sin superposición y visible/tocable al hacer scroll`,
      menuClose.noOverflow && menuClose.noOverlapTitle && menuClose.noOverlapPara && menuClose.stickyOk, JSON.stringify(menuClose));
    await page.evaluate(() => closeExercise());

    // Ventana de lección (con ejercicios: lección 8 "Entrada y Salida con Scanner").
    const lm = await measureLessonScreen(page, 8);
    const lClose = await measureCloseAndModal(page, 'lesson-viewer', 'lesson-content');
    check(`responsive ${tag} (lección): sin desborde horizontal y botón "X" no se superpone con título ni primer párrafo y es sticky`,
      lm.overflow.viewer && lm.overflow.card && lm.overflow.nav && lClose.noOverlapTitle && lClose.noOverlapPara && lClose.stickyOk,
      JSON.stringify({ overflow: lm.overflow, lClose }));
    check(`responsive ${tag} (lección): los 4 botones del pie visibles, completos, en 1 línea y >= 44 px`,
      lm.btns.length === 4 && lm.btns.every((b) => b.visible && b.insideCard && b.insideScreen && !b.clipped && b.lines === 1 && b.height >= 43.5),
      lm.btns.map((b) => `${b.text}:lines=${b.lines},h=${b.height.toFixed(0)},in=${b.insideCard}`).join('|'));
    if (width <= 480) {
      const prac = lm.btns.find((b) => b.key === 'practice');
      const comp = lm.btns.find((b) => b.key === 'complete');
      const prev = lm.btns.find((b) => b.key === 'prev');
      const next = lm.btns.find((b) => b.key === 'next');
      check(`responsive ${tag} (lección): "Practicar" arriba en fila completa, "Marcar como completada" debajo, y "Anterior"/"Siguiente" mitad y mitad`,
        Boolean(prac && comp && prev && next
        && prac.top < comp.top - 1 && comp.top < prev.top - 1
        && Math.abs(prev.top - next.top) < 2 && Math.abs(prev.width - next.width) < 4
        && prac.width >= 0.9 * (next.right - prev.left) && comp.width >= 0.9 * (next.right - prev.left)));
      const tg = lm.textGaps;
      check(`responsive ${tag} (lección): distancia entre texto (título, párrafo y caja "En el mundo real") y bordes >= 20 px`,
        Boolean(tg.h2 && tg.p && tg.infoBox
        && tg.h2.left >= 19.5 && tg.h2.right >= 19.5
        && tg.p.left >= 19.5 && tg.p.right >= 19.5
        && tg.infoBox.left >= 19.5 && tg.infoBox.right >= 19.5),
        JSON.stringify(tg));
      check(`responsive ${tag} (lección): botones del pie a >= 12 px de cada borde y sin desborde`,
        lm.overflow.viewer && lm.overflow.card && lm.overflow.nav
        && lm.btns.every((b) => b.left >= 11.5 && (lm.vw - b.right) >= 11.5 && !b.clipped),
        lm.btns.map((b) => `${b.key}:L=${b.left.toFixed(1)},R=${(lm.vw - b.right).toFixed(1)}`).join('|'));
    }

    // Lecciones de lectura (22, 25, 40, 42): no aparece "Practicar" y los 3 botones caben en 1 línea.
    const readingChecks = [];
    for (const rId of [22, 25, 40, 42]) {
      const rm = await measureLessonScreen(page, rId);
      const hasPractice = rm.btns.some((b) => b.key === 'practice' || /Practicar/.test(b.text));
      const allOk = rm.btns.length === 3 && !hasPractice && rm.overflow.viewer && rm.overflow.card && rm.overflow.nav
        && rm.btns.every((b) => b.visible && b.insideCard && b.insideScreen && !b.clipped && b.lines === 1 && b.height >= 43.5);
      readingChecks.push(allOk);
    }
    check(`responsive ${tag} (lecciones de lectura 22, 25, 40, 42): sin "Practicar" y 3 botones completos en 1 línea`,
      readingChecks.every(Boolean), JSON.stringify(readingChecks));
    await page.evaluate(() => closeLesson());
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const ownErrors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/firebase|gstatic|googleapis|fonts|net::|cdn|favicon/i.test(text)) return;
    ownErrors.push(text);
  });
  page.on('pageerror', (err) => ownErrors.push(String(err && err.message || err)));
  const url = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
  await page.goto(url);
  await page.waitForFunction(
    () => typeof openExercise === 'function' && typeof exercisesData !== 'undefined',
    null, { timeout: 30000 },
  );
  let pass = 0;
  const failed = [];
  for (const c of CASES) {
    await page.evaluate((id) => openExercise(id), c.id);
    await page.fill('#exercise-code', c.code);
    await page.click('button:has-text("Verificar Solución")');
    await page.waitForFunction(
      () => /Excelente|Errores Encontrados|No se pudo validar/.test(document.getElementById('exercise-result').textContent || ''),
      null, { timeout: 10000 },
    );
    const text = await page.textContent('#exercise-result');
    const ok = /Excelente/.test(text || '');
    if (ok === c.expect) {
      pass++;
      console.log(`ok - ${c.label} (id ${c.id}, esperaba ${c.expect ? 'válido' : 'rechazo'})`);
    } else {
      failed.push(c);
      console.log(`FALLO - ${c.label} (id ${c.id}, esperaba ${c.expect ? 'válido' : 'rechazo'}, salió ${ok ? 'válido' : 'rechazo'})`);
    }
  }
  console.log(`\ncasos de validación: ${CASES.length}, pasaron: ${pass}, fallaron: ${failed.length}`);
  await page.close();

  // C-11b: navegación por lección + responsive.
  const extra = [];
  const check = makeChecker(extra);
  await runNavigationChecks(browser, url, check, ownErrors);
  await runResponsiveChecks(browser, url, check, ownErrors);
  const extraFailed = extra.filter((r) => !r.ok);
  console.log(`casos de navegación y responsive: ${extra.length}, pasaron: ${extra.length - extraFailed.length}, fallaron: ${extraFailed.length}`);
  console.log(`\ncasos: ${CASES.length + extra.length}, pasaron: ${pass + extra.length - extraFailed.length}, fallaron: ${failed.length + extraFailed.length}`);
  if (ownErrors.length > 0) {
    console.log(`errores JS propios en consola (${ownErrors.length}):`);
    for (const e of ownErrors.slice(0, 10)) console.log(`  [consola] ${e.slice(0, 220)}`);
  } else {
    console.log('sin errores JS propios en consola.');
  }
  await browser.close();
  process.exit(failed.length === 0 && extraFailed.length === 0 && ownErrors.length === 0 ? 0 : 1);
})().catch((err) => {
  console.error(`browser-check no pudo correr: ${err && err.message || err}`);
  process.exit(2);
});
