# Auditoría del validador offline (C-01)

Matriz generada por `tools/audit-validator.js` (solo lectura sobre `data.js`,
`validator.js` y `script.js`). No modifica contenido de lecciones/ejercicios.

## Resumen

- Ejercicios auditados: 208
- rules-only-ok: 0
- needs-real-execution: 9
- rules-cheatable: 199
- % engañable (rules-cheatable / 208): 95.7 %
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
| 1 | 1 | Indentar un Método | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron, literal-con-patron |
| 2 | 1 | Código con If-Else | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron, literal-con-patron |
| 3 | 1 | Múltiples Métodos | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron, literal-con-patron |
| 4 | 1 | Bucle Anidado | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron, literal-con-patron |
| 5 | 2 | Hola Mundo | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 6 | 2 | Múltiples Líneas | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron, literal-con-patron |
| 7 | 2 | Print vs Println | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron, literal-con-patron |
| 8 | 2 | Printf | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron, literal-con-patron |
| 9 | 3 | Var Int | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 10 | 3 | Var String | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 11 | 3 | Casting | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 12 | 3 | PI Constante | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 13 | 4 | Suma | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 14 | 4 | Módulo | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 15 | 4 | AND Lógico | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 16 | 4 | Ternario | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 17 | 7 | If simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 18 | 7 | If-Else Par | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 19 | 7 | Else If Nota | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 20 | 7 | Condición Compleja | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 21 | 9 | While 1 a 5 | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 22 | 6 | For Descendente | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 23 | 9 | Do-While | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 24 | 10 | Break en Bucle | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 25 | 10 | Continue en Bucle | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 26 | 6 | Bucle Anidado Tabla | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 27 | 9 | Suma con While | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 28 | 6 | For-Each Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 29 | 8 | Switch Día Semana | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 30 | 8 | Switch sin Break | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 31 | 8 | Switch con String | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 32 | 8 | Switch Expression | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 33 | 5 | Scanner Leer Int | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 34 | 5 | Scanner Leer String | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 35 | 5 | Scanner Múltiples Datos | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 36 | 5 | Scanner Validar Entrada | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 37 | 5 | Scanner en Bucle | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 38 | 5 | Scanner Cerrar | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 39 | 5 | Scanner Try-With-Resources | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 40 | 5 | Scanner Leer Double | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 41 | 11 | Declarar Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 42 | 11 | Inicializar Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 43 | 11 | Acceder Elemento | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 44 | 11 | Modificar Elemento | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 45 | 11 | Longitud Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 46 | 11 | Recorrer Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 47 | 11 | Suma Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 48 | 11 | Máximo en Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 49 | 12 | Matriz 2x2 | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 50 | 12 | Inicializar Matriz | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 51 | 12 | Acceder Matriz | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 52 | 12 | Recorrer Matriz | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 53 | 13 | Longitud String | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 54 | 13 | Concatenar Strings | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 55 | 13 | Mayúsculas | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 56 | 13 | Substring | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 57 | 13 | Comparar Strings | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 58 | 14 | StringBuilder Append | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 59 | 15 | Método Sin Retorno | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 60 | 15 | Método Con Retorno | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 61 | 16 | Clase Simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 62 | 17 | Constructor | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 63 | 16 | Crear Objeto | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 64 | 16 | Acceder Atributo | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 65 | 16 | Método de Instancia | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 66 | 16 | Llamar Método | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 67 | 18 | Encapsulamiento Private | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 68 | 18 | Getter | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 69 | 18 | Setter | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 70 | 18 | Validación en Setter | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 71 | 19 | Herencia Extends | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 72 | 19 | Super Constructor | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 73 | 19 | Override Método | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 74 | 19 | Polimorfismo | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 75 | 20 | Clase Abstracta | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 76 | 20 | Implementar Abstracto | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 77 | 21 | Interfaz | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 78 | 21 | Implementar Interfaz | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 79 | 21 | Múltiples Interfaces | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 80 | 21 | Interfaz con Default | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 81 | 26 | Atributo Static | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 82 | 26 | Método Static | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 83 | 26 | Constante Static Final | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 84 | 26 | Bloque Static | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 85 | 24 | Clase Interna | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 86 | 24 | Clase Anónima | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 87 | 23 | Enum Simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 88 | 23 | Enum con Constructor | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 89 | 28 | Equals Override | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 90 | 28 | HashCode Override | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 91 | 30 | CompareTo | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 92 | 27 | Genérico Simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 93 | 27 | Método Genérico | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 94 | 27 | Bounded Type | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 95 | 27 | Wildcard ? | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 96 | 23 | Record Simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 97 | 23 | Sealed Class | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 98 | 19 | Pattern Matching | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 99 | 13 | Text Blocks | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 100 | 8 | Switch Expression Yield | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 101 | 27 | ArrayList Crear | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 102 | 27 | ArrayList Add | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 103 | 27 | ArrayList Get | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 104 | 27 | ArrayList Remove | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 105 | 27 | ArrayList Size | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 106 | 27 | ArrayList Iterar | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 107 | 28 | HashSet Crear | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 108 | 28 | HashSet Add Duplicado | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 109 | 28 | HashSet Contains | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 110 | 29 | HashMap Crear | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 111 | 29 | HashMap Put | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 112 | 29 | HashMap Get | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 113 | 29 | HashMap ContainsKey | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 114 | 29 | HashMap Iterar | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 115 | 27 | LinkedList Crear | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 116 | 27 | LinkedList AddFirst | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 117 | 28 | TreeSet Ordenado | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 118 | 30 | Collections Sort | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 119 | 30 | Collections Reverse | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 120 | 30 | Collections Max | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 121 | 31 | Try-Catch Básico | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 122 | 31 | Múltiples Catch | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 123 | 31 | Finally | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 124 | 31 | Throw Exception | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 125 | 31 | Throws en Firma | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 126 | 32 | Excepción Personalizada | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 127 | 32 | RuntimeException | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 128 | 33 | Try-With-Resources | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 129 | 31 | Multi-Catch | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 130 | 32 | GetMessage | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 131 | 31 | PrintStackTrace | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 132 | 32 | Causa de Excepción | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 133 | 32 | Assert | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 134 | 31 | NullPointerException | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 135 | 37 | Optional Empty | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 136 | 37 | Optional Of | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 137 | 37 | Optional OfNullable | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 138 | 37 | Optional IsPresent | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 139 | 37 | Optional OrElse | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 140 | 37 | Optional IfPresent | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 141 | 34 | Lambda Simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 142 | 34 | Lambda Con Parámetro | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 143 | 34 | Lambda Múltiples Parámetros | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 144 | 34 | Lambda Bloque | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 145 | 35 | Predicate Test | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 146 | 35 | Function Apply | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 147 | 35 | Consumer Accept | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 148 | 35 | Supplier Get | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 149 | 36 | Method Reference Static | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 150 | 36 | Method Reference Instance | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 151 | 36 | Method Reference Constructor | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 152 | 38 | Stream Filter | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 153 | 38 | Stream Map | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 154 | 38 | Stream ForEach | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 155 | 39 | Stream Count | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 156 | 39 | Stream Reduce | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 157 | 38 | Stream Sorted | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 158 | 38 | Stream Distinct | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 159 | 38 | Stream Limit | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 160 | 39 | Stream AnyMatch | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 161 | 39 | Stream AllMatch | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 162 | 41 | File Write | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 163 | 41 | File Read | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 164 | 41 | File Exists | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 165 | 41 | File Delete | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 166 | 41 | BufferedReader | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 167 | 41 | BufferedWriter | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 168 | 41 | Files Lines Stream | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 169 | 43 | Thread Extends | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 170 | 43 | Runnable Interface | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 171 | 43 | Thread Start | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 172 | 43 | Thread Sleep | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 173 | 43 | Thread Join | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 174 | 44 | Synchronized Method | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 175 | 44 | Synchronized Block | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 176 | 44 | Volatile Variable | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 177 | 44 | AtomicInteger | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 178 | 45 | ExecutorService | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 179 | 45 | Callable Future | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 180 | 46 | CompletableFuture | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 181 | 45 | CountDownLatch | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 182 | 45 | CyclicBarrier | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 183 | 45 | Semaphore | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 184 | 44 | ConcurrentHashMap | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 185 | 44 | CopyOnWriteArrayList | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 186 | 44 | BlockingQueue | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 187 | 44 | ReentrantLock | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 188 | 44 | ReadWriteLock | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 189 | 47 | Singleton Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 190 | 47 | Factory Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 191 | 47 | Builder Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 192 | 49 | Observer Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 193 | 49 | Strategy Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 194 | 48 | Decorator Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 195 | 50 | SRP - Single Responsibility | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 196 | 50 | OCP - Open/Closed | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 197 | 50 | LSP - Liskov Substitution | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 198 | 50 | ISP - Interface Segregation | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 199 | 50 | DIP - Dependency Inversion | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 200 | 52 | JUnit Test | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 201 | 52 | JUnit BeforeEach | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 202 | 52 | JUnit AssertThrows | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 203 | 52 | Mockito Mock | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 204 | 52 | Mockito Verify | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 205 | 51 | TDD Red-Green-Refactor | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 206 | 52 | AssertJ Fluent | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 207 | 52 | Parametrized Test | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 208 | 52 | Test Coverage | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
