# Auditoría de contenido — JavaMaster (solo lectura)

Fecha: 2026-10-03. No se modificó ningún archivo de código ni de contenido: esta auditoría solo reporta.
Alcance: 52 lecciones (`lessonsData` en `script.js`) y 208 ejercicios (`exercisesData` en `data.js`).

## 1. Nota metodológica (cómo repetir esta auditoría)

Todo el análisis se hizo con comandos ad-hoc `node -e` / PowerShell (sin crear scripts). Comandos exactos:

```powershell
# 1) Tabla de lecciones: id, nivel, título, largo de description y content, presencia de código
node -e "const fs=require('fs'); const src=fs.readFileSync('script.js','utf8'); const vm=require('vm'); const ctx=vm.createContext({window:{},document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({})},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},console}); const start=src.indexOf('const lessonsData = ['); const tail=src.slice(start); const end=tail.indexOf('\n];'); vm.runInContext(tail.slice(0,end+4)+'; globalThis.__L=lessonsData;', ctx); const L=ctx.__L; console.log('COUNT: '+L.length); L.forEach(function(l){ console.log(l.id+' | '+l.level+' | mod:'+l.module+' | '+l.title+' | descLen:'+(l.description||'').length+' | contentLen:'+(l.content||'').length); });"
```

```powershell
# 2) Tags HTML por lección (para clasificar completa/parcial/vacía) + detección de "solo <h2>"
node -e "const fs=require('fs'); const src=fs.readFileSync('script.js','utf8'); const vm=require('vm'); const ctx=vm.createContext({window:{},document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>({})},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},console}); const st=src.indexOf('const lessonsData = ['); const tl=src.slice(st); const en=tl.indexOf('\n];'); vm.runInContext(tl.slice(0,en+4)+'; globalThis.__L=lessonsData;', ctx); const L=ctx.__L; L.forEach(function(l){ const c=l.content||''; const bare=/^<h2>[^<]*<\/h2>$/.test(c.trim()); console.log('L'+l.id+' len='+c.length+' bareTitle='+bare+' :: '+JSON.stringify(c.slice(0,120))); });"
```

```powershell
# 3) Ejercicios: conteo, campos, rango de ids/lessonId, sin starter, largos de consigna, lecciones sin ejercicios
node -e "const fs=require('fs'); const src=fs.readFileSync('data.js','utf8'); const vm=require('vm'); const ctx=vm.createContext({console: console}); const start=src.indexOf('const exercisesData = ['); const tail=src.slice(start); const end=tail.lastIndexOf('];'); vm.runInContext(tail.slice(0,end+2)+'; globalThis.__E=exercisesData;', ctx); const E=ctx.__E; console.log('TOTAL: '+E.length); console.log('KEYS: '+Object.keys(E[0]).join(',')); const noS=E.filter(function(e){return !e.starterCode||!e.starterCode.trim()}); console.log('no starter: '+noS.length+' ids: '+noS.map(function(e){return e.id}).join(',')); E.forEach(function(e){ console.log(e.id+' | L'+e.lessonId+' | len='+(e.description||'').length+' | '+JSON.stringify(e.title)+' :: '+JSON.stringify(e.description)); });"
```

```powershell
# 4) Consignas sin verbo de acción (primera palabra fuera de lista de imperativos) + reparto por nivel (rangos propios de data.js)
node -e "const fs=require('fs'); const src=fs.readFileSync('data.js','utf8'); const vm=require('vm'); const ctx=vm.createContext({console: console}); const start=src.indexOf('const exercisesData = ['); const tail=src.slice(start); const end=tail.lastIndexOf('];'); vm.runInContext(tail.slice(0,end+2)+'; globalThis.__E=exercisesData;', ctx); const E=ctx.__E; function lvl(id){ if(id<=60) return 'PRIN'; if(id<=120) return 'INT'; if(id<=168) return 'AVA'; return 'EXP'; } const verbs=['Indenta','Escribe','Imprime','Usa','Declara','Crea','Define','Implementa','Recorre','Verifica','Convierte','Extrae','Compara','Construye','Ejecuta','Llama','Agrega','Obtiene','Elimina','Ordena','Invierte','Encuentra','Captura','Lanza','Filtra','Transforma','Itera','Cuenta','Reduce','Espera','Limita','Notifica','Sobrescribe','Instancia','Sale','Salta','Suma','Asigna','Lee','Cierra','Cambia','Une','Maneja','Inicia','Pausa','Calcula','Muestra','Devuelve','Retorna','Genera','Comprueba','Valida','Programa','Intenta']; const noVerb=E.filter(function(e){ const w=(e.description||'').trim().split(/\s+/)[0].replace(/[^A-Za-z]/g,''); return verbs.indexOf(w)<0; }); const g={PRIN:[],INT:[],AVA:[],EXP:[]}; noVerb.forEach(function(e){g[lvl(e.id)].push(e.id)}); console.log('noVerb: '+noVerb.length+' PRIN='+g.PRIN.length+' INT='+g.INT.length+' AVA='+g.AVA.length+' EXP='+g.EXP.length);"
```

```powershell
# 5) Estructura del ejercicio modelo (id 1) campo por campo + campos faltantes en todo el set
node -e "const fs=require('fs'); const src=fs.readFileSync('data.js','utf8'); const vm=require('vm'); const ctx=vm.createContext({console: console}); const start=src.indexOf('const exercisesData = ['); const tail=src.slice(start); const end=tail.lastIndexOf('];'); vm.runInContext(tail.slice(0,end+2)+'; globalThis.__E=exercisesData;', ctx); const E=ctx.__E; const e=E.find(function(x){return x.id===1}); Object.keys(e).forEach(function(k){ const v=e[k]; const t=typeof v; console.log('--- '+k+' type='+t+(t==='string' ? ' len='+v.length : '')); console.log(t==='string' ? v : JSON.stringify(v)); });"
```

## 2. Mapa de ubicación del contenido de lecciones

El cuerpo de cada lección vive en **un solo lugar**:

| Qué | Dónde | Campo / objeto |
|-----|-------|----------------|
| Cuerpo de la lección (HTML) | `script.js`, array `const lessonsData = [...]` (≈ línea 6364) | `content` (string HTML) por objeto `{id, level, module, title, description, duration, content}` |
| Título / descripción corta / duración (tarjetas) | `script.js`, mismo objeto | `title`, `description`, `duration` |
| Ejercicios (NO contienen cuerpos de lección) | `data.js`, array `const exercisesData = [...]` | `{id, lessonId, title, description, difficulty, starterCode, solution, hint, validation}`; `lessonId` enlaza con la lección |
| Evaluaciones por nivel (cuestionarios, fuera de alcance) | `data.js`, objeto `evaluationsData` | `beginner/intermediate/advanced/expert/final` |
| Guías `guia-principiante/intermedio/avanzado/experto.html` | Guías de estudio genéricas por nivel (encabezados temáticos + checklist); **no contienen el cuerpo de ninguna de las 52 lecciones** | — |
| `script-enhanced.js` | Solo **referencia** `lessonsData` (progreso, felicitaciones); no define contenido | — |
| `index.html` | Renderiza `lesson.content` dinámicamente en el visor; no contiene cuerpos | — |
| `validator.js` | Solo reglas de validación; ningún contenido didáctico | — |

Conclusión: ninguna lección marcada como "vacía" tiene su contenido en otro archivo. Si `content` es solo `<h2>…</h2>`, la lección está efectivamente vacía en toda la app.

Criterio de clasificación aplicado (verificable con el comando 2):
- **completa**: explicación (≥1 `<p>`/`<h3>`/`<ul>` con texto didáctico) + ejemplo de código (`<pre><code>`).
- **parcial**: título + contenido delgado (solo snippet de código sin explicación, o 1 frase sin código).
- **vacía**: `content` es exactamente `<h2>título</h2>` (regex `^<h2>[^<]*</h2>$`).

## 3. Tabla de las 52 lecciones

| id | nivel | título | chars contenido | estado |
|----|-------|--------|-----------------|--------|
| 1 | beginner | Indentación y Buenas Prácticas | 602 | completa |
| 2 | beginner | Introducción a Java y JVM | 489 | completa |
| 3 | beginner | Variables y Tipos Primitivos | 337 | completa |
| 4 | beginner | Operadores Aritméticos y Lógicos | 273 | completa |
| 5 | beginner | Entrada y Salida con Scanner | 215 | parcial (título + subtítulo + código, sin explicación) |
| 6 | beginner | Bucles - Parte 1 | 185 | parcial (título + código, sin explicación) |
| 7 | beginner | Estructuras Condicionales if-else | 208 | parcial (título + subtítulo + código, sin explicación) |
| 8 | beginner | Switch Moderno | 144 | parcial (título + código, sin explicación) |
| 9 | beginner | Bucles While y Do-While | 111 | parcial (título + código, sin explicación) |
| 10 | beginner | Break, Continue y Etiquetas | 92 | parcial (título + 1 frase, sin código) |
| 11 | beginner | Arrays Unidimensionales | 92 | parcial (título + código de 1 línea, sin explicación) |
| 12 | beginner | Arrays Multidimensionales | 102 | parcial (título + código de 1 línea, sin explicación) |
| 13 | beginner | Strings y Texto | 88 | parcial (título + código de 1 línea, sin explicación) |
| 14 | beginner | StringBuilder | 115 | parcial (título + código de 1 línea, sin explicación) |
| 15 | beginner | Métodos y Funciones | 122 | parcial (título + código de 1 línea, sin explicación) |
| 16 | intermediate | Clases y Objetos | 30 | vacía |
| 17 | intermediate | Constructores y Sobrecarga | 22 | vacía |
| 18 | intermediate | Encapsulamiento | 24 | vacía |
| 19 | intermediate | Herencia y Polimorfismo | 17 | vacía |
| 20 | intermediate | Clases Abstractas | 26 | vacía |
| 21 | intermediate | Interfaces y Contratos | 19 | vacía |
| 22 | intermediate | Composición vs Herencia | 20 | vacía |
| 23 | intermediate | Enumeraciones (Enums) | 14 | vacía |
| 24 | intermediate | Clases Anidadas | 24 | vacía |
| 25 | intermediate | Paquetes y Organización | 17 | vacía |
| 26 | intermediate | Static y Final | 23 | vacía |
| 27 | intermediate | ArrayList y LinkedList | 15 | vacía |
| 28 | intermediate | HashSet y TreeSet | 13 | vacía |
| 29 | intermediate | HashMap y TreeMap | 13 | vacía |
| 30 | intermediate | Iteradores y Ordenación | 30 | vacía |
| 31 | advanced | Manejo de Excepciones | 20 | vacía |
| 32 | advanced | Excepciones Personalizadas | 26 | vacía |
| 33 | advanced | Try-with-Resources | 18 | vacía |
| 34 | advanced | Expresiones Lambda | 16 | vacía |
| 35 | advanced | Interfaces Funcionales | 30 | vacía |
| 36 | advanced | Method References | 19 | vacía |
| 37 | advanced | Optional | 17 | vacía |
| 38 | advanced | Streams: Filter y Map | 16 | vacía |
| 39 | advanced | Collectors y Terminales | 19 | vacía |
| 40 | advanced | Parallel Streams | 17 | vacía |
| 41 | advanced | File I/O y NIO.2 | 14 | vacía |
| 42 | advanced | Serialización | 22 | vacía |
| 43 | expert | Threads y Runnable | 23 | vacía |
| 44 | expert | Sincronización y Locks | 24 | vacía |
| 45 | expert | Executor Service | 18 | vacía |
| 46 | expert | CompletableFuture | 14 | vacía |
| 47 | expert | Patrones Creacionales | 28 | vacía |
| 48 | expert | Patrones Estructurales | 28 | vacía |
| 49 | expert | Patrones Comportamiento | 28 | vacía |
| 50 | expert | SOLID Principles | 14 | vacía |
| 51 | expert | Clean Code y Refactor | 19 | vacía |
| 52 | expert | Testing Unitario (JUnit) | 16 | vacía |

Detalle de las 4 completas: L1 (h2+h3+p+info-box+código+lista de reglas), L2 (qué es Java + ecosistema JVM/JRE/JDK en lista + HolaMundo), L3 (lista de 8 tipos primitivos + 4 líneas de ejemplo), L4 (aritméticos y lógicos con 2 párrafos + ejemplo con comentarios).

## 4. Hallazgos de ejercicios (208)

El campo de consigna es `description`; el campo de código inicial es `starterCode` (string; ausente = `""` vacío). Los 208 ejercicios comparten exactamente las mismas 9 claves (`id, lessonId, title, description, difficulty, starterCode, solution, hint, validation`); `solution`, `hint` y `validation` están presentes en los 208 (cero faltantes). Agrupación por nivel según los propios rangos documentados en `data.js`: Principiante ids 1–60, Intermedio 61–120, Avanzado 121–168, Experto 169–208.

### (a1) Consignas cortas: 208/208 por debajo de ~60 chars (rango real 7–48; máx. 48 en id 4)

Toda la tabla (id | lessonId | título | consigna | largo):

Principiante (ids 1–60):
1 L1 "Indentar un Método" :: "Indenta correctamente el código." (32) · 2 L1 "Código con If-Else" :: "Indenta if-else." (16) · 3 L1 "Múltiples Métodos" :: "Indenta clase con 2 métodos." (28) · 4 L1 "Bucle Anidado" :: "Indenta for anidado y agrega espacios correctos." (48) · 5 L2 "Hola Mundo" :: "Escribe programa \"Hola, Java!\"." (31) · 6 L2 "Múltiples Líneas" :: "Imprime 2 líneas." (17) · 7 L2 "Print vs Println" :: "Usa print y println." (20) · 8 L2 "Printf" :: "Usa printf para edad." (21) · 9 L3 "Var Int" :: "Declara edad = 25." (18) · 10 L3 "Var String" :: "Declara nombre." (15) · 11 L3 "Casting" :: "Double a int." (13) · 12 L3 "PI Constante" :: "final double PI." (16) · 13 L4 "Suma" :: "10 + 5." (7) · 14 L4 "Módulo" :: "Resto de 17 % 2." (16) · 15 L4 "AND Lógico" :: "A && B." (7) · 16 L4 "Ternario" :: "Edad >= 18 ? \"A\" : \"M\"." (23) · 17 L5 "If simple" :: "Si x > 0 imprimir P." (20) · 18 L5 "If-Else Par" :: "Par o Impar." (12) · 19 L5 "Else If Nota" :: "A, B o F." (9) · 20 L5 "Condición Compleja" :: "A && (B || C)." (14) · 21 L6 "While 1 a 5" :: "Imprime 1 a 5 con while." (24) · 22 L6 "For Descendente" :: "Imprime 10 a 1." (15) · 23 L6 "Do-While" :: "Ejecuta al menos una vez." (25) · 24 L6 "Break en Bucle" :: "Sale cuando i == 5." (19) · 25 L6 "Continue en Bucle" :: "Salta pares." (12) · 26 L6 "Bucle Anidado Tabla" :: "Tabla del 2 y 3." (16) · 27 L6 "Suma con While" :: "Suma 1 a 100." (13) · 28 L6 "For-Each Array" :: "Recorre array con for-each." (27) · 29 L7 "Switch Día Semana" :: "Imprime día según número." (25) · 30 L7 "Switch sin Break" :: "Fall-through intencional." (25) · 31 L7 "Switch con String" :: "Evalúa texto." (13) · 32 L7 "Switch Expression" :: "Asigna valor con switch." (24) · 33 L8 "Scanner Leer Int" :: "Lee número del usuario." (23) · 34 L8 "Scanner Leer String" :: "Lee nombre completo." (20) · 35 L8 "Scanner Múltiples Datos" :: "Lee nombre y edad." (18) · 36 L8 "Scanner Validar Entrada" :: "Verifica que sea número." (24) · 37 L8 "Scanner en Bucle" :: "Lee hasta que sea 0." (20) · 38 L8 "Scanner Cerrar" :: "Cierra Scanner correctamente." (29) · 39 L8 "Scanner Try-With-Resources" :: "Scanner auto-cerrado." (20) · 40 L8 "Scanner Leer Double" :: "Lee decimal del usuario." (24) · 41 L9 "Declarar Array" :: "Array de 5 enteros." (19) · 42 L9 "Inicializar Array" :: "Array con valores {1,2,3}." (26) · 43 L9 "Acceder Elemento" :: "Imprime primer elemento." (24) · 44 L9 "Modificar Elemento" :: "Cambia segundo elemento a 50." (29) · 45 L9 "Longitud Array" :: "Imprime tamaño del array." (25) · 46 L9 "Recorrer Array" :: "Imprime todos los elementos." (28) · 47 L9 "Suma Array" :: "Suma todos los elementos." (25) · 48 L9 "Máximo en Array" :: "Encuentra el mayor." (19) · 49 L10 "Matriz 2x2" :: "Declara matriz 2x2." (19) · 50 L10 "Inicializar Matriz" :: "Matriz con valores." (19) · 51 L10 "Acceder Matriz" :: "Imprime elemento [1][0]." (24) · 52 L10 "Recorrer Matriz" :: "Imprime todos los elementos." (28) · 53 L11 "Longitud String" :: "Imprime tamaño de texto." (24) · 54 L11 "Concatenar Strings" :: "Une dos textos." (15) · 55 L11 "Mayúsculas" :: "Convierte a mayúsculas." (23) · 56 L11 "Substring" :: "Extrae caracteres 0 a 3." (24) · 57 L11 "Comparar Strings" :: "Verifica si son iguales." (24) · 58 L11 "StringBuilder Append" :: "Construye texto eficientemente." (31) · 59 L12 "Método Sin Retorno" :: "Crea método saludar()." (22) · 60 L12 "Método Con Retorno" :: "Método que suma dos números." (28)

Intermedio (ids 61–120):
61 L13 "Clase Simple" :: "Crea clase Persona." (19) · 62 L13 "Constructor" :: "Constructor con parámetros." (27) · 63 L13 "Crear Objeto" :: "Instancia de Persona." (21) · 64 L13 "Acceder Atributo" :: "Imprime nombre del objeto." (26) · 65 L13 "Método de Instancia" :: "Método saludar() en Persona." (28) · 66 L13 "Llamar Método" :: "Ejecuta método del objeto." (26) · 67 L14 "Encapsulamiento Private" :: "Atributo privado." (17) · 68 L14 "Getter" :: "Método getSaldo()." (18) · 69 L14 "Setter" :: "Método setSaldo()." (18) · 70 L14 "Validación en Setter" :: "Setter con validación." (22) · 71 L15 "Herencia Extends" :: "Estudiante hereda de Persona." (29) · 72 L15 "Super Constructor" :: "Llama constructor padre." (24) · 73 L15 "Override Método" :: "Sobrescribe toString()." (23) · 74 L15 "Polimorfismo" :: "Referencia padre, objeto hijo." (30) · 75 L16 "Clase Abstracta" :: "Define clase abstracta." (23) · 76 L16 "Implementar Abstracto" :: "Perro extiende Animal." (22) · 77 L17 "Interfaz" :: "Define interfaz Volador." (24) · 78 L17 "Implementar Interfaz" :: "Ave implementa Volador." (23) · 79 L17 "Múltiples Interfaces" :: "Clase implementa 2 interfaces." (30) · 80 L17 "Interfaz con Default" :: "Método default en interfaz." (27) · 81 L18 "Atributo Static" :: "Variable compartida por todos." (30) · 82 L18 "Método Static" :: "Método de clase." (16) · 83 L18 "Constante Static Final" :: "Constante de clase." (19) · 84 L18 "Bloque Static" :: "Inicialización estática." (24) · 85 L19 "Clase Interna" :: "Inner class." (12) · 86 L19 "Clase Anónima" :: "Implementa interfaz inline." (27) · 87 L19 "Enum Simple" :: "Define enum Dia." (16) · 88 L19 "Enum con Constructor" :: "Enum con atributos." (19) · 89 L20 "Equals Override" :: "Sobrescribe equals()." (21) · 90 L20 "HashCode Override" :: "Sobrescribe hashCode()." (23) · 91 L20 "CompareTo" :: "Implementa Comparable." (22) · 92 L21 "Genérico Simple" :: "Clase genérica Caja<T>." (22) · 93 L21 "Método Genérico" :: "Método con tipo genérico." (25) · 94 L21 "Bounded Type" :: "Genérico con límite." (20) · 95 L21 "Wildcard ?" :: "Comodín en genéricos." (21) · 96 L22 "Record Simple" :: "Define record Punto." (20) · 97 L22 "Sealed Class" :: "Clase sellada." (14) · 98 L22 "Pattern Matching" :: "instanceof con pattern." (23) · 99 L22 "Text Blocks" :: "String multilínea." (18) · 100 L22 "Switch Expression Yield" :: "Switch con yield." (17) · 101 L23 "ArrayList Crear" :: "Crea ArrayList de Strings." (28) · 102 L23 "ArrayList Add" :: "Agrega elementos." (17) · 103 L23 "ArrayList Get" :: "Obtiene elemento por índice." (28) · 104 L23 "ArrayList Remove" :: "Elimina elemento." (17) · 105 L23 "ArrayList Size" :: "Tamaño de la lista." (19) · 106 L23 "ArrayList Iterar" :: "Recorre con for-each." (21) · 107 L24 "HashSet Crear" :: "Set sin duplicados." (19) · 108 L24 "HashSet Add Duplicado" :: "Intenta agregar duplicado." (26) · 109 L24 "HashSet Contains" :: "Verifica si existe." (18) · 110 L25 "HashMap Crear" :: "Mapa clave-valor." (17) · 111 L25 "HashMap Put" :: "Agrega par clave-valor." (23) · 112 L25 "HashMap Get" :: "Obtiene valor por clave." (24) · 113 L25 "HashMap ContainsKey" :: "Verifica si existe clave." (25) · 114 L25 "HashMap Iterar" :: "Recorre con entrySet." (21) · 115 L26 "LinkedList Crear" :: "Lista enlazada." (15) · 116 L26 "LinkedList AddFirst" :: "Agrega al inicio." (17) · 117 L26 "TreeSet Ordenado" :: "Set ordenado." (13) · 118 L27 "Collections Sort" :: "Ordena ArrayList." (17) · 119 L27 "Collections Reverse" :: "Invierte lista." (15) · 120 L27 "Collections Max" :: "Encuentra máximo." (17)

Avanzado (ids 121–168):
121 L28 "Try-Catch Básico" :: "Captura excepción." (18) · 122 L28 "Múltiples Catch" :: "Varios tipos de excepciones." (28) · 123 L28 "Finally" :: "Bloque finally." (15) · 124 L28 "Throw Exception" :: "Lanza excepción." (16) · 125 L28 "Throws en Firma" :: "Declara excepción." (18) · 126 L29 "Excepción Personalizada" :: "Crea excepción propia." (22) · 127 L29 "RuntimeException" :: "Excepción no verificada." (24) · 128 L29 "Try-With-Resources" :: "Cierre automático." (18) · 129 L29 "Multi-Catch" :: "Captura múltiples en uno." (25) · 130 L29 "GetMessage" :: "Obtiene mensaje de error." (25) · 131 L30 "PrintStackTrace" :: "Imprime traza completa." (23) · 132 L30 "Causa de Excepción" :: "Excepción con causa." (20) · 133 L30 "Assert" :: "Usa aserciones." (15) · 134 L30 "NullPointerException" :: "Maneja null." (12) · 135 L31 "Optional Empty" :: "Crea Optional vacío." (20) · 136 L31 "Optional Of" :: "Optional con valor." (19) · 137 L31 "Optional OfNullable" :: "Optional que acepta null." (25) · 138 L31 "Optional IsPresent" :: "Verifica si tiene valor." (24) · 139 L31 "Optional OrElse" :: "Valor por defecto." (19) · 140 L31 "Optional IfPresent" :: "Ejecuta si hay valor." (21) · 141 L32 "Lambda Simple" :: "Expresión lambda básica." (24) · 142 L32 "Lambda Con Parámetro" :: "Lambda con un parámetro." (25) · 143 L32 "Lambda Múltiples Parámetros" :: "Lambda con dos parámetros." (26) · 144 L32 "Lambda Bloque" :: "Lambda con varias líneas." (24) · 145 L33 "Predicate Test" :: "Predicate para filtrar." (23) · 146 L33 "Function Apply" :: "Function para transformar." (26) · 147 L33 "Consumer Accept" :: "Consumer para consumir." (23) · 148 L33 "Supplier Get" :: "Supplier para proveer." (22) · 149 L34 "Method Reference Static" :: "Referencia a método estático." (29) · 150 L34 "Method Reference Instance" :: "Referencia a método de instancia." (33) · 151 L34 "Method Reference Constructor" :: "Referencia a constructor." (25) · 152 L35 "Stream Filter" :: "Filtra elementos." (17) · 153 L35 "Stream Map" :: "Transforma elementos." (21) · 154 L35 "Stream ForEach" :: "Itera sobre elementos." (22) · 155 L35 "Stream Count" :: "Cuenta elementos." (17) · 156 L35 "Stream Reduce" :: "Reduce a un valor." (18) · 157 L36 "Stream Sorted" :: "Ordena elementos." (17) · 158 L36 "Stream Distinct" :: "Elimina duplicados." (19) · 159 L36 "Stream Limit" :: "Limita cantidad." (16) · 160 L36 "Stream AnyMatch" :: "Verifica si alguno cumple." (26) · 161 L36 "Stream AllMatch" :: "Verifica si todos cumplen." (26) · 162 L37 "File Write" :: "Escribe archivo." (16) · 163 L37 "File Read" :: "Lee archivo." (12) · 164 L37 "File Exists" :: "Verifica si existe." (18) · 165 L37 "File Delete" :: "Elimina archivo." (16) · 166 L38 "BufferedReader" :: "Lee línea por línea." (20) · 167 L38 "BufferedWriter" :: "Escribe con buffer." (19) · 168 L38 "Files Lines Stream" :: "Lee archivo como Stream." (24)

Experto (ids 169–208):
169 L39 "Thread Extends" :: "Crea thread extendiendo Thread." (31) · 170 L39 "Runnable Interface" :: "Implementa Runnable." (20) · 171 L39 "Thread Start" :: "Inicia un thread." (17) · 172 L39 "Thread Sleep" :: "Pausa thread." (13) · 173 L39 "Thread Join" :: "Espera a que termine." (21) · 174 L40 "Synchronized Method" :: "Método sincronizado." (20) · 175 L40 "Synchronized Block" :: "Bloque sincronizado." (20) · 176 L40 "Volatile Variable" :: "Variable volátil." (17) · 177 L40 "AtomicInteger" :: "Contador atómico." (17) · 178 L41 "ExecutorService" :: "Pool de threads." (16) · 179 L41 "Callable Future" :: "Tarea con retorno." (18) · 180 L41 "CompletableFuture" :: "Programación asíncrona." (23) · 181 L42 "CountDownLatch" :: "Espera a múltiples threads." (27) · 182 L42 "CyclicBarrier" :: "Punto de sincronización." (24) · 183 L42 "Semaphore" :: "Limita acceso concurrente." (26) · 184 L43 "ConcurrentHashMap" :: "Map thread-safe." (16) · 185 L43 "CopyOnWriteArrayList" :: "Lista thread-safe." (18) · 186 L43 "BlockingQueue" :: "Cola bloqueante." (16) · 187 L43 "ReentrantLock" :: "Lock explícito." (15) · 188 L43 "ReadWriteLock" :: "Lock lectura/escritura." (23) · 189 L44 "Singleton Pattern" :: "Instancia única." (16) · 190 L44 "Factory Pattern" :: "Fábrica de objetos." (19) · 191 L44 "Builder Pattern" :: "Constructor fluido." (19) · 192 L45 "Observer Pattern" :: "Notifica cambios." (17) · 193 L45 "Strategy Pattern" :: "Algoritmo intercambiable." (25) · 194 L45 "Decorator Pattern" :: "Añade funcionalidad." (20) · 195 L46 "SRP - Single Responsibility" :: "Una responsabilidad." (20) · 196 L46 "OCP - Open/Closed" :: "Abierto/cerrado." (16) · 197 L46 "LSP - Liskov Substitution" :: "Sustitución de Liskov." (22) · 198 L47 "ISP - Interface Segregation" :: "Segregación de interfaces." (26) · 199 L47 "DIP - Dependency Inversion" :: "Inversión de dependencias." (26) · 200 L48 "JUnit Test" :: "Test unitario básico." (21) · 201 L48 "JUnit BeforeEach" :: "Setup antes de cada test." (25) · 202 L48 "JUnit AssertThrows" :: "Verifica excepción." (19) · 203 L49 "Mockito Mock" :: "Crea mock." (10) · 204 L49 "Mockito Verify" :: "Verifica llamadas." (18) · 205 L49 "TDD Red-Green-Refactor" :: "Ciclo TDD." (10) · 206 L50 "AssertJ Fluent" :: "Aserciones fluidas." (19) · 207 L50 "Parametrized Test" :: "Test con parámetros." (20) · 208 L50 "Test Coverage" :: "Cobertura de código." (20)

### (a2) Consignas sin verbo de acción claro: 96/208 (heurística: primera palabra fuera de la lista de imperativos del comando 4)

- Principiante (18): 11 "Double a int." · 12 "final double PI." · 13 "10 + 5." · 14 "Resto de 17 % 2." · 15 "A && B." · 16 "Edad >= 18 ? \"A\" : \"M\"." · 17 "Si x > 0 imprimir P." · 18 "Par o Impar." · 19 "A, B o F." · 20 "A && (B || C)." · 26 "Tabla del 2 y 3." · 30 "Fall-through intencional." · 31 "Evalúa texto." · 39 "Scanner auto-cerrado." · 41 "Array de 5 enteros." · 42 "Array con valores {1,2,3}." · 50 "Matriz con valores." · 60 "Método que suma dos números."
- Intermedio (31): 62, 65, 67, 68, 69, 70, 71, 74, 76, 78, 79, 80, 81, 82, 83, 84, 85, 88, 92, 93, 94, 95, 97, 98, 99, 100, 105, 107, 110, 115, 117 (textos en la tabla (a1); predominan frases nominales como "Método getSaldo().", "Clase sellada.", "Mapa clave-valor.").
- Avanzado (19): 122, 123, 127, 128, 132, 136, 137, 139, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151 (textos en la tabla (a1); p. ej. "Bloque finally.", "Lambda con un parámetro.", "Referencia a constructor.").
- Experto (28): 174, 175, 176, 177, 178, 179, 180, 182, 184, 185, 186, 187, 188, 190, 191, 193, 194, 195, 196, 197, 198, 199, 200, 201, 205, 206, 207, 208 (textos en la tabla (a1); p. ej. "Ciclo TDD.", "Cobertura de código.", "Pool de threads.").

Nota cualitativa: incluso las consignas CON verbo siguen casi siempre el patrón "verbo + sustantivo" sin complemento ni criterio de aceptación, estilo "Define clase abstracta." (id 75), "Define interfaz Volador." (77), "Define enum Dia." (87), "Crea mock." (203), "Maneja null." (134), "Pausa thread." (172). El patrón es generalizado, no casos aislados.

### (b) Ejercicios SIN código inicial (`starterCode === ""`): 67/208

- Principiante (27): 5, 7, 9, 10, 12, 14, 15, 16, 18, 19, 20, 22, 23, 25, 26, 27, 30, 35, 37, 39, 41, 42, 49, 50, 58, 59, 60.
- Intermedio (16): 61, 63, 74, 75, 77, 79, 83, 87, 88, 92, 93, 94, 95, 96, 97, 99.
- Avanzado (7): 122, 123, 125, 126, 127, 129, 132.
- Experto (17): 169, 170, 172, 176, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 205, 208.
- Los 141 restantes tienen `starterCode` no vacío. `solution`, `hint` y `validation` están presentes en los 208.

## 5. Ejercicio modelo (plantilla a replicar)

Lección "Indentación y Buenas Prácticas" (id 1, beginner) → su PRIMER ejercicio por id es **id 1, "Indentar un Método"** (lessonId 1). Estructura campo por campo:

| campo | tipo | largo / valor | qué contiene |
|-------|------|---------------|--------------|
| `id` | number | `1` | identificador único 1–208 |
| `lessonId` | number | `1` | enlace a la lección (1–50; 51–52 sin ejercicios) |
| `title` | string | 18 chars: "Indentar un Método" | nombre corto del ejercicio |
| `description` | string | 32 chars: "Indenta correctamente el código." | consigna (verbo imperativo + objeto) |
| `difficulty` | string | 4 chars: "easy" | `easy` / `medium` / `hard` |
| `starterCode` | string | 95 chars | código SIN indentar que el alumno debe arreglar (4 líneas Java) |
| `solution` | string | 111 chars | mismo código correctamente indentado (4 espacios/nivel) |
| `hint` | string | 172 chars | explicación didáctica de la regla (4 espacios por nivel, 4 en clase / 8 en método) |
| `validation` | object | 5 claves (`checkIndentation, checkSyntax, requiredKeywords[5], indentationSpaces: 4`) | reglas machine-checkables que `validator.js` usa para corregir |

## 6. Resumen numérico

| nivel | lecciones completas | parciales | vacías | ej. consigna <60 | ej. sin verbo | ej. sin starter |
|-------|---------------------|-----------|--------|------------------|---------------|-----------------|
| Principiante (L 1–15 / ids 1–60) | 4 (L1–L4) | 11 (L5–L15) | 0 | 60/60 | 18/60 | 27/60 |
| Intermedio (L 16–30 / ids 61–120) | 0 | 0 | 15 | 60/60 | 31/60 | 16/60 |
| Avanzado (L 31–42 / ids 121–168) | 0 | 0 | 12 | 48/48 | 19/48 | 7/48 |
| Experto (L 43–52 / ids 169–208) | 0 | 0 | 10 | 40/40 | 28/40 | 17/40 |
| **Total** | **4** | **11** | **37** | **208/208** | **96/208** | **67/208** |

## 7. Hallazgos adicionales (solo reporte, sin corrección)

1. **Lecciones 51–52 sin ejercicios**: `lessonId` máximo en `data.js` es 50; las lecciones 51 ("Clean Code y Refactor") y 52 ("Testing Unitario (JUnit)") tienen 0 ejercicios. Distribución real por `lessonId`: 2–8 ejercicios (p. ej. L6 y L8 tienen 8; L12, L47 tienen 2), mientras `script.js` (`getStats`) asume 4 por lección (`completedLessons * 4`).
2. **`lessonId` de `data.js` no coincide con los ids de `lessonsData`**: p. ej. en `data.js` el `lessonId` 8 = Scanner (ejercicios 33–40) pero en `script.js` la lección 8 = "Switch Moderno" (Scanner es la 5); `lessonId` 13–15 = Clases/Encapsulamiento/Herencia en `data.js` pero = Strings/StringBuilder/Métodos en `script.js`. Los comentarios de `data.js` confirman su propia numeración ("IDs 1-20: Módulo 1…", "IDs 61-80: POO Básico", etc.).
3. **Vacío concentrado**: las 37 lecciones vacías son el 100 % de Intermedio/Avanzado/Experto; solo Principiante tiene contenido (4 completas + 11 parciales).
4. **Evaluaciones**: `data.js` incluye además `evaluationsData` (5 cuestionarios multiple-choice, 22 preguntas en total), fuera del alcance de esta auditoría pero inventariado.
