# Auditoría del validador offline (C-01, criterio C-18)

Matriz generada por `tools/audit-validator.js` (solo lectura sobre `data.js`,
`validator.js` y `script.js`). No modifica contenido de lecciones/ejercicios.

Criterio vigente (cierre C-18): las variantes de forma (renombrado consistente,
otros textos/espacios, formas equivalentes) son VÁLIDAS y se aceptan. Trampa es
SOLO: respuesta pegada en un comentario (el código no hace nada), código vacío,
o código que no hace lo pedido. El código muerto en una rama (`if (false)`)
necesita análisis de flujo, o sea ejecución real (C-05/C-06). Excepción
documentada: el id 208 pide "solo comentarios", así que su comentario SÍ aprueba.

## Resumen

- Ejercicios auditados: 208
- rules-only-ok: 198
- needs-real-execution: 9
- rules-cheatable: 1
- % engañable (rules-cheatable / 208): 0.5 %
- Invariante 52/208: PASA
- Lecciones: 52 (beginner 15, intermediate 15, advanced 12, expert 10)
- Lecciones sin ejercicios: 22, 25, 40, 42

## Ejercicios que exigen ejecución real (needs-real-execution)

33, 34, 35, 36, 37, 38, 39, 40, 148

## Hallazgos de contenido (sin correcciones)

- Lecciones sin ejercicios en data.js (lessonId ausentes): 22, 25, 40, 42. El conteo de 52 lecciones proviene de lessonsData en script.js, no del lessonId.

## Matriz por ejercicio

| id | lessonId | título | categoría | canónica | nota |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | Indentar un Método | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 2 | 1 | Código con If-Else | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 3 | 1 | Múltiples Métodos | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 4 | 1 | Bucle Anidado | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 5 | 2 | Hola Mundo | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 6 | 2 | Múltiples Líneas | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 7 | 2 | Print vs Println | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 8 | 2 | Printf | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 9 | 3 | Var Int | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 10 | 3 | Var String | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 11 | 3 | Casting | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 12 | 3 | PI Constante | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 13 | 4 | Suma | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 14 | 4 | Módulo | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 15 | 4 | AND Lógico | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 16 | 4 | Ternario | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 17 | 7 | If simple | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 18 | 7 | If-Else Par | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 19 | 7 | Else If Nota | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 20 | 7 | Condición Compleja | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 21 | 9 | While 1 a 5 | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 22 | 6 | For Descendente | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 23 | 9 | Do-While | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 24 | 10 | Break en Bucle | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 25 | 10 | Continue en Bucle | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 26 | 6 | Bucle Anidado Tabla | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 27 | 9 | Suma con While | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 28 | 6 | For-Each Array | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 29 | 8 | Switch Día Semana | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 30 | 8 | Switch sin Break | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 31 | 8 | Switch con String | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 32 | 8 | Switch Expression | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 33 | 5 | Scanner Leer Int | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 34 | 5 | Scanner Leer String | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 35 | 5 | Scanner Múltiples Datos | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 36 | 5 | Scanner Validar Entrada | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 37 | 5 | Scanner en Bucle | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 38 | 5 | Scanner Cerrar | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 39 | 5 | Scanner Try-With-Resources | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 40 | 5 | Scanner Leer Double | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 41 | 11 | Declarar Array | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 42 | 11 | Inicializar Array | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 43 | 11 | Acceder Elemento | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 44 | 11 | Modificar Elemento | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 45 | 11 | Longitud Array | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 46 | 11 | Recorrer Array | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 47 | 11 | Suma Array | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 48 | 11 | Máximo en Array | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 49 | 12 | Matriz 2x2 | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 50 | 12 | Inicializar Matriz | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 51 | 12 | Acceder Matriz | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 52 | 12 | Recorrer Matriz | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 53 | 13 | Longitud String | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 54 | 13 | Concatenar Strings | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 55 | 13 | Mayúsculas | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 56 | 13 | Substring | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 57 | 13 | Comparar Strings | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 58 | 14 | StringBuilder Append | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 59 | 15 | Método Sin Retorno | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 60 | 15 | Método Con Retorno | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 61 | 16 | Clase Simple | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 62 | 17 | Constructor | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 63 | 16 | Crear Objeto | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 64 | 16 | Acceder Atributo | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 65 | 16 | Método de Instancia | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 66 | 16 | Llamar Método | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 67 | 18 | Encapsulamiento Private | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 68 | 18 | Getter | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 69 | 18 | Setter | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 70 | 18 | Validación en Setter | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 71 | 19 | Herencia Extends | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 72 | 19 | Super Constructor | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 73 | 19 | Override Método | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 74 | 19 | Polimorfismo | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 75 | 20 | Clase Abstracta | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 76 | 20 | Implementar Abstracto | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 77 | 21 | Interfaz | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 78 | 21 | Implementar Interfaz | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 79 | 21 | Múltiples Interfaces | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 80 | 21 | Interfaz con Default | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 81 | 26 | Atributo Static | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 82 | 26 | Método Static | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 83 | 26 | Constante Static Final | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 84 | 26 | Bloque Static | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 85 | 24 | Clase Interna | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 86 | 24 | Clase Anónima | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 87 | 23 | Enum Simple | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 88 | 23 | Enum con Constructor | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 89 | 28 | Equals Override | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 90 | 28 | HashCode Override | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 91 | 30 | CompareTo | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 92 | 27 | Genérico Simple | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 93 | 27 | Método Genérico | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 94 | 27 | Bounded Type | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 95 | 27 | Wildcard ? | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 96 | 23 | Record Simple | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 97 | 23 | Sealed Class | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 98 | 19 | Pattern Matching | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 99 | 13 | Text Blocks | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 100 | 8 | Switch Expression Yield | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 101 | 27 | ArrayList Crear | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 102 | 27 | ArrayList Add | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 103 | 27 | ArrayList Get | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 104 | 27 | ArrayList Remove | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 105 | 27 | ArrayList Size | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 106 | 27 | ArrayList Iterar | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 107 | 28 | HashSet Crear | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 108 | 28 | HashSet Add Duplicado | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 109 | 28 | HashSet Contains | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 110 | 29 | HashMap Crear | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 111 | 29 | HashMap Put | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 112 | 29 | HashMap Get | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 113 | 29 | HashMap ContainsKey | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 114 | 29 | HashMap Iterar | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 115 | 27 | LinkedList Crear | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 116 | 27 | LinkedList AddFirst | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 117 | 28 | TreeSet Ordenado | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 118 | 30 | Collections Sort | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 119 | 30 | Collections Reverse | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 120 | 30 | Collections Max | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 121 | 31 | Try-Catch Básico | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 122 | 31 | Múltiples Catch | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 123 | 31 | Finally | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 124 | 31 | Throw Exception | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 125 | 31 | Throws en Firma | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 126 | 32 | Excepción Personalizada | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 127 | 32 | RuntimeException | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 128 | 33 | Try-With-Resources | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 129 | 31 | Multi-Catch | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 130 | 32 | GetMessage | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 131 | 31 | PrintStackTrace | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 132 | 32 | Causa de Excepción | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 133 | 32 | Assert | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 134 | 31 | NullPointerException | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 135 | 37 | Optional Empty | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 136 | 37 | Optional Of | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 137 | 37 | Optional OfNullable | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 138 | 37 | Optional IsPresent | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 139 | 37 | Optional OrElse | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 140 | 37 | Optional IfPresent | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 141 | 34 | Lambda Simple | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 142 | 34 | Lambda Con Parámetro | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 143 | 34 | Lambda Múltiples Parámetros | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 144 | 34 | Lambda Bloque | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 145 | 35 | Predicate Test | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 146 | 35 | Function Apply | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 147 | 35 | Consumer Accept | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 148 | 35 | Supplier Get | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 149 | 36 | Method Reference Static | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 150 | 36 | Method Reference Instance | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 151 | 36 | Method Reference Constructor | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 152 | 38 | Stream Filter | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 153 | 38 | Stream Map | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 154 | 38 | Stream ForEach | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 155 | 39 | Stream Count | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 156 | 39 | Stream Reduce | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 157 | 38 | Stream Sorted | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 158 | 38 | Stream Distinct | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 159 | 38 | Stream Limit | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 160 | 39 | Stream AnyMatch | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 161 | 39 | Stream AllMatch | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 162 | 41 | File Write | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 163 | 41 | File Read | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 164 | 41 | File Exists | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 165 | 41 | File Delete | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 166 | 41 | BufferedReader | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 167 | 41 | BufferedWriter | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 168 | 41 | Files Lines Stream | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 169 | 43 | Thread Extends | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 170 | 43 | Runnable Interface | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 171 | 43 | Thread Start | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 172 | 43 | Thread Sleep | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 173 | 43 | Thread Join | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 174 | 44 | Synchronized Method | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 175 | 44 | Synchronized Block | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 176 | 44 | Volatile Variable | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 177 | 44 | AtomicInteger | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 178 | 45 | ExecutorService | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 179 | 45 | Callable Future | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 180 | 46 | CompletableFuture | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 181 | 45 | CountDownLatch | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 182 | 45 | CyclicBarrier | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 183 | 45 | Semaphore | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 184 | 44 | ConcurrentHashMap | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 185 | 44 | CopyOnWriteArrayList | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 186 | 44 | BlockingQueue | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 187 | 44 | ReentrantLock | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 188 | 44 | ReadWriteLock | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 189 | 47 | Singleton Pattern | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 190 | 47 | Factory Pattern | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 191 | 47 | Builder Pattern | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 192 | 49 | Observer Pattern | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 193 | 49 | Strategy Pattern | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 194 | 48 | Decorator Pattern | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 195 | 50 | SRP - Single Responsibility | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 196 | 50 | OCP - Open/Closed | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 197 | 50 | LSP - Liskov Substitution | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 198 | 50 | ISP - Interface Segregation | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 199 | 50 | DIP - Dependency Inversion | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 200 | 52 | JUnit Test | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 201 | 52 | JUnit BeforeEach | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 202 | 52 | JUnit AssertThrows | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 203 | 52 | Mockito Mock | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 204 | 52 | Mockito Verify | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 205 | 51 | TDD Red-Green-Refactor | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 206 | 52 | AssertJ Fluent | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 207 | 52 | Parametrized Test | rules-only-ok | sí | regla rechaza sondas y acepta la canónica |
| 208 | 52 | Test Coverage | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta |
