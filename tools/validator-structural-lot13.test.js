'use strict';
// C-18 validator-structural, lote 13 (ids 169-188: hilos y
// concurrencia). Patrón vm de C-10. NO toca validator.js ni data.js.
//
// Los hilos reales solo se comprueban ejecutando (C-05/C-06); acá se
// valida la estructura por tokens: clases, llamadas (`start` vs
// `run`, `lock`/`unlock` en finally, `acquire`/`release`), números y
// textos. Los comentarios (`// código crítico`) nunca cuentan.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.join(__dirname, '..');

function loadExercises() {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'data.js'), 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${src}\nthis.__exercises = exercisesData;`, sandbox, { filename: 'data.js' });
  return Array.from(sandbox.__exercises, (e) => ({ ...e }));
}

function loadValidatorClass(exercises) {
  const src = fs.readFileSync(path.join(REPO_ROOT, 'validator.js'), 'utf8');
  const sandbox = { exercisesData: exercises, console };
  vm.createContext(sandbox);
  vm.runInContext(`${src}\nthis.__JavaValidator = JavaValidator;`, sandbox, { filename: 'validator.js' });
  return sandbox.__JavaValidator;
}

const exercises = loadExercises();
const JavaValidator = loadValidatorClass(exercises);
const solutionOf = (id) => exercises.find((e) => e.id === id).solution;
const check = (id, code) => new JavaValidator().validate(code, id);
// Los comentarios no son código: la variante de espaciado los quita
// primero (varios id de este lote los traen en la solución).
const oneLine = (s) => s.replace(/\/\/[^\n]*/g, ' ').replace(/\s+/g, ' ').trim();

const IDS = [169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188];

describe('c-18 lote 13: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  169: ['public class MiThread extends Thread{public void run(){System.out.println("Ejecutando");}}',
    'public class MiThread extends Thread {\n    @Override\n    public void run() {\n        System.out.println("Ejecutando");\n    }\n}'],
  170: ['public class MiRunnable implements Runnable{public void run(){System.out.println("Ejecutando");}}',
    'public class MiRunnable implements Runnable {\n    @Override\n    public void run() {\n        System.out.println("Ejecutando");\n    }\n}'],
  171: ['t.start();', 't . start ( );'],
  172: ['try{Thread.sleep(1000);}catch(InterruptedException e){e.printStackTrace();}',
    'try {\n    Thread.sleep(1000);\n} catch (InterruptedException e) {\n    e.printStackTrace();\n}'],
  173: ['t.start();try{t.join();}catch(InterruptedException e){e.printStackTrace();}',
    't.start();\ntry {\n    t.join();\n} catch (InterruptedException e) {\n    e.printStackTrace();\n}'],
  174: ['public synchronized void incrementar(){contador++;}', 'public synchronized void incrementar( )\n{\n    contador++;\n}'],
  // el comentario del bloque es libre: vale con otro texto o con código.
  175: ['synchronized (lock) {\n    // otra cosa\n}', 'synchronized(lock){int a=1;}'],
  176: ['private volatile boolean activo=true;', 'volatile private boolean activo = true;'],
  177: ['AtomicInteger contador=new AtomicInteger(0);contador.incrementAndGet();',
    'final AtomicInteger contador = new AtomicInteger(0);\ncontador.incrementAndGet();'],
  178: ['ExecutorService executor=Executors.newFixedThreadPool(5);executor.submit(()->System.out.println("Tarea"));executor.shutdown();',
    'final ExecutorService executor = Executors.newFixedThreadPool(5);\nexecutor.submit(() -> System.out.println("Tarea"));\nexecutor.shutdown();'],
  179: ['Callable<Integer>tarea=()->42;Future<Integer>futuro=executor.submit(tarea);int resultado=futuro.get();',
    'final Callable<Integer> tarea = () -> 42;\nfinal Future<Integer> futuro = executor.submit(tarea);\nfinal int resultado = futuro.get();'],
  // `s` libre: vale renombrada si se usa siempre igual.
  180: ['CompletableFuture.supplyAsync(() -> "Hola").thenApply(x -> x + " Mundo").thenAccept(System.out::println);',
    'CompletableFuture.supplyAsync(()->"Hola").thenApply(s->s+" Mundo").thenAccept(System.out::println);'],
  181: ['CountDownLatch latch=new CountDownLatch(3);latch.await();', 'final CountDownLatch latch = new CountDownLatch(3);\n// comentario propio\nlatch.await();'],
  182: ['CyclicBarrier barrier=new CyclicBarrier(3);', 'final CyclicBarrier barrier = new CyclicBarrier(3);\n// comentario propio'],
  183: ['Semaphore semaphore=new Semaphore(3);semaphore.acquire();try{}finally{semaphore.release();}',
    'final Semaphore semaphore = new Semaphore(3);\nsemaphore.acquire();\ntry {\n    // propio\n} finally {\n    semaphore.release();\n}'],
  184: ['ConcurrentHashMap<String,Integer>map=new ConcurrentHashMap<>();map.put("clave",1);',
    'final ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();\nmap.put("clave", 1);'],
  185: ['CopyOnWriteArrayList<String>lista=new CopyOnWriteArrayList<>();lista.add("elemento");',
    'final CopyOnWriteArrayList<String> lista = new CopyOnWriteArrayList<>();\nlista.add("elemento");'],
  186: ['BlockingQueue<String>cola=new ArrayBlockingQueue<>(10);cola.put("elemento");String item=cola.take();',
    'final BlockingQueue<String> cola = new ArrayBlockingQueue<>(10);\ncola.put("elemento");\nfinal String item = cola.take();'],
  187: ['ReentrantLock lock=new ReentrantLock();lock.lock();try{}finally{lock.unlock();}',
    'final ReentrantLock lock = new ReentrantLock();\nlock.lock();\ntry {\n    // propio\n} finally {\n    lock.unlock();\n}'],
  188: ['ReadWriteLock rwLock=new ReentrantReadWriteLock();rwLock.readLock().lock();try{}finally{rwLock.readLock().unlock();}',
    'final ReadWriteLock rwLock = new ReentrantReadWriteLock();\nrwLock.readLock().lock();\ntry {\n    // propio\n} finally {\n    rwLock.readLock().unlock();\n}'],
};

describe('c-18 lote 13: variantes válidas aceptadas', () => {
  for (const id of IDS) {
    for (const [n, code] of VALID[id].entries()) {
      it(`id ${id}: variante válida ${n + 1}`, () => {
        const r = check(id, code);
        assert.strictEqual(r.isValid, true, `id ${id} var ${n + 1} rechazado: ${JSON.stringify(r.errors)}`);
      });
    }
    it(`id ${id}: en una línea (espacios libres)`, () => {
      const r = check(id, oneLine(solutionOf(id)));
      assert.strictEqual(r.isValid, true, `id ${id} una-línea rechazado: ${JSON.stringify(r.errors)}`);
    });
    it(`id ${id}: con código extra válido`, () => {
      const r = check(id, `${solutionOf(id)}\nint aparte${id} = ${id};`);
      assert.strictEqual(r.isValid, true, `id ${id} extra-código rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const INVALID = {
  169: ['public class MiThread implements Runnable {\n    public void run() {\n        System.out.println("Ejecutando");\n    }\n}',
    'public class MiThread extends Thread {\n    public void run() {\n    }\n}'],
  170: ['public class MiRunnable extends Thread {\n    public void run() {\n        System.out.println("Ejecutando");\n    }\n}',
    'public class MiRunnable implements Runnable {\n    public void run() {\n        System.out.println("Otro");\n    }\n}'],
  // run() no inicia el hilo: es el concepto del ejercicio.
  171: ['t.run();', 't.stop();'],
  172: ['try {\n    Thread.sleep(100);\n} catch (InterruptedException e) {\n    e.printStackTrace();\n}',
    'try {\n    Thread.sleep(1000);\n} catch (Exception e) {\n    e.printStackTrace();\n}'],
  173: ['try {\n    t.join();\n} catch (InterruptedException e) {\n    e.printStackTrace();\n}\nt.start();',
    't.start();\nt.join();'],
  174: ['public void incrementar() {\n    contador++;\n}', 'public synchronized void incrementar() {\n    contador += 2;\n}'],
  175: ['synchronized (otro) {\n}', 'synchronized { }'],
  176: ['private boolean activo = true;', 'private volatile boolean activo = false;'],
  // ++ no es seguro entre hilos: el método es el concepto.
  177: ['AtomicInteger contador = new AtomicInteger(0);\ncontador++;',
    'AtomicInteger contador = new AtomicInteger(0);\ncontador.getAndIncrement();'],
  178: ['ExecutorService executor = Executors.newFixedThreadPool(5);\nexecutor.submit(() -> System.out.println("Tarea"));',
    'ExecutorService executor = Executors.newFixedThreadPool(3);\nexecutor.submit(() -> System.out.println("Tarea"));\nexecutor.shutdown();'],
  179: ['Future<Integer> futuro = executor.submit(() -> 42);\nint resultado = futuro.get();',
    'Callable<Integer> tarea = () -> 42;\nFuture<Integer> futuro = executor.submit(tarea);\nint resultado = futuro.result();'],
  // el espacio de " Mundo" es parte del texto pedido.
  180: ['CompletableFuture.supplyAsync(() -> "Hola").thenAccept(System.out::println).thenApply(s -> s + " Mundo");',
    'CompletableFuture.supplyAsync(() -> "Hola").thenApply(s -> s + "Mundo").thenAccept(System.out::println);'],
  181: ['CountDownLatch latch = new CountDownLatch(2);\nlatch.await();', 'CountDownLatch latch = new CountDownLatch(3);'],
  182: ['CyclicBarrier barrier = new CyclicBarrier(2);', 'CyclicBarrier barrera = new CyclicBarrier(3);'],
  // liberar fuera del finally no libera siempre.
  183: ['Semaphore semaphore = new Semaphore(3);\nsemaphore.acquire();\ntry {\n    semaphore.release();\n}',
    'Semaphore semaphore = new Semaphore(3);\ntry {\n} finally {\n    semaphore.release();\n}'],
  // HashMap común no es concurrente: es el concepto.
  184: ['HashMap<String, Integer> map = new HashMap<>();\nmap.put("clave", 1);',
    'ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<String, Integer>();\nmap.put("clave", 1);'],
  185: ['ArrayList<String> lista = new ArrayList<>();\nlista.add("elemento");',
    'CopyOnWriteArrayList<String> lista = new CopyOnWriteArrayList<String>();\nlista.add("elemento");'],
  186: ['BlockingQueue<String> cola = new ArrayBlockingQueue<>(5);\ncola.put("elemento");\nString item = cola.take();',
    'BlockingQueue<String> cola = new ArrayBlockingQueue<>(10);\ncola.put("elemento");\nString item = cola.poll();'],
  187: ['ReentrantLock lock = new ReentrantLock();\nlock.lock();\ntry {\n} \nlock.unlock();',
    'ReentrantLock lock = new ReentrantLock();\nlock.tryLock();\ntry {\n} finally {\n    lock.unlock();\n}'],
  188: ['ReadWriteLock rwLock = new ReentrantReadWriteLock();\nrwLock.writeLock().lock();\ntry {\n} finally {\n    rwLock.readLock().unlock();\n}',
    'ReadWriteLock rwLock = new ReentrantReadWriteLock();\nrwLock.readLock().lock();\ntry {\n} finally {\n    rwLock.unlock();\n}'],
};

describe('c-18 lote 13: trampas rechazadas', () => {
  for (const id of IDS) {
    for (const [n, code] of INVALID[id].entries()) {
      it(`id ${id}: trampa ${n + 1} rechazada`, () => {
        const r = check(id, code);
        assert.strictEqual(r.isValid, false, `id ${id} trampa ${n + 1} aceptada como válida`);
      });
    }
    it(`id ${id}: respuesta en comentario nunca aprueba`, () => {
      const r = check(id, `// ${solutionOf(id).replace(/\n/g, '\n// ')}`);
      assert.strictEqual(r.isValid, false, `id ${id}: comentario-con-respuesta aceptado`);
    });
    it(`id ${id}: código vacío rechazado`, () => {
      const r = check(id, '');
      assert.strictEqual(r.isValid, false, `id ${id}: vacío aceptado`);
    });
    it(`id ${id}: comillas sin cerrar rechazadas`, () => {
      const r = check(id, `${solutionOf(id)}\nSystem.out.println("oops);`);
      assert.strictEqual(r.isValid, false, `id ${id}: comillas-sin-cerrar aceptado`);
    });
    const sol = solutionOf(id);
    if (sol.includes(';')) {
      it(`id ${id}: sin punto y coma rechazado`, () => {
        const r = check(id, sol.slice(0, sol.indexOf(';')));
        assert.strictEqual(r.isValid, false, `id ${id}: sin-punto-y-coma aceptado`);
      });
    }
    it(`id ${id}: nombre no declarado rechazado`, () => {
      const r = check(id, `${solutionOf(id)}\nSystem.out.println(zz_noexiste);`);
      assert.strictEqual(r.isValid, false, `id ${id}: nombre-no-declarado aceptado`);
    });
  }
});
