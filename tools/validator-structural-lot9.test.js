'use strict';
// C-18 validator-structural, lote 9 (ids 121-134: excepciones).
// Patrón vm de C-10. NO toca validator.js ni data.js.
//
// Todo fijo por consigna o contexto: tipos de catch, mensajes, `e`,
// `super`, orden de los catch. El cuerpo del try con solo comentario
// equivale al bloque vacío (los comentarios nunca cuentan).

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
// primero (si no, `// código` en una sola línea se tragaría el resto).
const oneLine = (s) => s.replace(/\/\/[^\n]*/g, ' ').replace(/\s+/g, ' ').trim();

const IDS = [121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134];

describe('c-18 lote 9: canónicas de data.js aceptadas', () => {
  for (const id of IDS) {
    it(`id ${id}: canónica válida`, () => {
      const r = check(id, solutionOf(id));
      assert.strictEqual(r.isValid, true, `id ${id} rechazado: ${JSON.stringify(r.errors)}`);
    });
  }
});

const VALID = {
  121: ['try{int x=Integer.parseInt("abc");}catch(NumberFormatException e){System.out.println("Error de formato");}',
    'try {\n    int x = Integer.parseInt("abc");\n} catch (NumberFormatException e) {\n    System.out.println("Error de formato");\n}'],
  122: ['try{}catch(NullPointerException e){System.out.println("Null");}catch(ArrayIndexOutOfBoundsException e){System.out.println("Índice");}',
    'try {\n    // cualquier código real\n    int a = 1;\n} catch (NullPointerException e) {\n    System.out.println("Null");\n} catch (ArrayIndexOutOfBoundsException e) {\n    System.out.println("Índice");\n}'],
  123: ['try{}catch(Exception e){}finally{System.out.println("Siempre se ejecuta");}',
    'try {\n    int a = 1;\n} catch (Exception e) {\n    System.out.println("uy");\n} finally {\n    System.out.println("Siempre se ejecuta");\n}'],
  124: ['if(edad<0){throw new IllegalArgumentException("Edad negativa");}',
    'if (edad < 0)\n{\n    throw new IllegalArgumentException("Edad negativa");\n}'],
  125: ['public void leerArchivo() throws IOException {}', 'public void leerArchivo() throws IOException {\n}'],
  126: ['public class MiExcepcion extends Exception{public MiExcepcion(String mensaje){super(mensaje);}}',
    'public class MiExcepcion extends Exception {\n    public MiExcepcion( String mensaje )\n    {\n        super( mensaje );\n    }\n}'],
  127: ['public class ErrorNegocio extends RuntimeException{public ErrorNegocio(String msg){super(msg);}}',
    'public class ErrorNegocio extends RuntimeException\n{\n    public ErrorNegocio( String msg )\n    {\n        super( msg );\n    }\n}'],
  128: ['try(BufferedReader br=new BufferedReader(new FileReader("file.txt"))){String linea=br.readLine();}catch(IOException e){e.printStackTrace();}',
    'import java.io.*;\ntry (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {\n    String linea = br.readLine();\n} catch (IOException e) {\n    e.printStackTrace();\n}'],
  129: ['try{}catch(IOException|SQLException e){System.out.println("Error de I/O o BD");}',
    'try {\n    // código\n} catch (IOException | SQLException e) {\n    System.out.println("Error de I/O o BD");\n}'],
  130: ['String msg=e.getMessage();System.out.println(msg);', 'final String msg = e.getMessage();\nSystem.out.println(msg);'],
  131: ['e.printStackTrace();', 'e.printStackTrace( );'],
  132: ['try{}catch(IOException e){throw new RuntimeException("Error procesando",e);}',
    'try {\n    // código\n} catch (IOException e) {\n    throw new RuntimeException("Error procesando", e);\n}'],
  133: ['assert edad>=0:"Edad no puede ser negativa";', 'assert (edad >= 0) : "Edad no puede ser negativa";'],
  134: ['try{int len=texto.length();}catch(NullPointerException e){System.out.println("Texto es null");}',
    'try {\n    int len = texto.length();\n} catch (NullPointerException e) {\n    System.out.println("Texto es null");\n}'],
};

describe('c-18 lote 9: variantes válidas aceptadas', () => {
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
  // atrapar Exception es otra cosa: se pide el tipo exacto.
  121: ['try {\n    int x = Integer.parseInt("abc");\n} catch (Exception e) {\n    System.out.println("Error de formato");\n}',
    'try {\n    int x = Integer.parseInt("abc");\n} catch (NumberFormatException e) {\n    System.out.println("Error");\n}'],
  // el orden de los catch es concepto (la consigna lo fija).
  122: ['try {\n} catch (ArrayIndexOutOfBoundsException e) {\n    System.out.println("Índice");\n} catch (NullPointerException e) {\n    System.out.println("Null");\n}',
    'try {\n} catch (Exception e) {\n    System.out.println("Null");\n}'],
  123: ['try {\n} catch (Exception e) {\n}', 'try {\n} catch (Exception e) {\n} finalize {\n    System.out.println("Siempre se ejecuta");\n}'],
  124: ['if (edad <= 0) {\n    throw new IllegalArgumentException("Edad negativa");\n}',
    'if (edad < 0) {\n    throw new Exception("Edad negativa");\n}'],
  125: ['public void leerArchivo() {\n    throw new IOException();\n}', 'public void leerArchivo() {\n}'],
  126: ['public class MiExcepcion extends Exception {\n    public MiExcepcion(String mensaje) {\n        super();\n    }\n}',
    'public class MiExcepcion extends RuntimeException {\n    public MiExcepcion(String mensaje) {\n        super(mensaje);\n    }\n}'],
  127: ['public class ErrorNegocio extends Exception {\n    public ErrorNegocio(String msg) {\n        super(msg);\n    }\n}',
    'public class ErrorNegocio extends RuntimeException {\n    public ErrorNegocio(String msg) {\n    }\n}'],
  128: ['try (BufferedReader br = new BufferedReader(new FileReader("otro.txt"))) {\n    String linea = br.readLine();\n} catch (IOException e) {\n    e.printStackTrace();\n}',
    'try {\n    BufferedReader br = new BufferedReader(new FileReader("file.txt"));\n    String linea = br.readLine();\n} catch (IOException e) {\n    e.printStackTrace();\n}'],
  129: ['try {\n} catch (IOException e) {\n    System.out.println("Error de I/O o BD");\n} catch (SQLException e) {\n    System.out.println("Error de I/O o BD");\n}',
    'try {\n} catch (IOException | SQLException e) {\n    System.out.println("Otro");\n}'],
  // el paso por msg es lo pedido: directo no vale.
  130: ['System.out.println(e.getMessage());', 'String msg = e.getMessage;\nSystem.out.println(msg);'],
  131: ['e.printStackTrace;', 'System.out.println(e);'],
  132: ['try {\n} catch (IOException e) {\n    throw new RuntimeException("Error procesando");\n}',
    'try {\n} catch (IOException e) {\n    throw new Exception("Error procesando", e);\n}'],
  133: ['assert edad > 0 : "Edad no puede ser negativa";', 'assert edad >= 0;'],
  134: ['try {\n    int len = texto.length();\n} catch (Exception e) {\n    System.out.println("Texto es null");\n}',
    'try {\n    int len = texto.length;\n} catch (NullPointerException e) {\n    System.out.println("Texto es null");\n}'],
};

describe('c-18 lote 9: trampas rechazadas', () => {
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
