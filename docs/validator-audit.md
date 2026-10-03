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
- Lecciones sin ejercicios: 51, 52

## Ejercicios que exigen ejecución real (needs-real-execution)

33, 34, 35, 36, 37, 38, 39, 40, 148

## Hallazgos de contenido (sin correcciones)

- Lecciones sin ejercicios en data.js (lessonId ausentes): 51, 52. El conteo de 52 lecciones proviene de lessonsData en script.js, no del lessonId.

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
| 17 | 5 | If simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 18 | 5 | If-Else Par | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 19 | 5 | Else If Nota | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 20 | 5 | Condición Compleja | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 21 | 6 | While 1 a 5 | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 22 | 6 | For Descendente | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 23 | 6 | Do-While | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 24 | 6 | Break en Bucle | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 25 | 6 | Continue en Bucle | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 26 | 6 | Bucle Anidado Tabla | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 27 | 6 | Suma con While | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 28 | 6 | For-Each Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 29 | 7 | Switch Día Semana | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 30 | 7 | Switch sin Break | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 31 | 7 | Switch con String | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 32 | 7 | Switch Expression | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 33 | 8 | Scanner Leer Int | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 34 | 8 | Scanner Leer String | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 35 | 8 | Scanner Múltiples Datos | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 36 | 8 | Scanner Validar Entrada | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 37 | 8 | Scanner en Bucle | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 38 | 8 | Scanner Cerrar | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 39 | 8 | Scanner Try-With-Resources | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 40 | 8 | Scanner Leer Double | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 41 | 9 | Declarar Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 42 | 9 | Inicializar Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 43 | 9 | Acceder Elemento | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 44 | 9 | Modificar Elemento | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 45 | 9 | Longitud Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 46 | 9 | Recorrer Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 47 | 9 | Suma Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 48 | 9 | Máximo en Array | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 49 | 10 | Matriz 2x2 | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 50 | 10 | Inicializar Matriz | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 51 | 10 | Acceder Matriz | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 52 | 10 | Recorrer Matriz | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 53 | 11 | Longitud String | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 54 | 11 | Concatenar Strings | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 55 | 11 | Mayúsculas | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 56 | 11 | Substring | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 57 | 11 | Comparar Strings | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 58 | 11 | StringBuilder Append | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 59 | 12 | Método Sin Retorno | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 60 | 12 | Método Con Retorno | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 61 | 13 | Clase Simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 62 | 13 | Constructor | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 63 | 13 | Crear Objeto | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 64 | 13 | Acceder Atributo | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 65 | 13 | Método de Instancia | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 66 | 13 | Llamar Método | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 67 | 14 | Encapsulamiento Private | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 68 | 14 | Getter | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 69 | 14 | Setter | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 70 | 14 | Validación en Setter | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 71 | 15 | Herencia Extends | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 72 | 15 | Super Constructor | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 73 | 15 | Override Método | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 74 | 15 | Polimorfismo | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 75 | 16 | Clase Abstracta | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 76 | 16 | Implementar Abstracto | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 77 | 17 | Interfaz | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 78 | 17 | Implementar Interfaz | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 79 | 17 | Múltiples Interfaces | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 80 | 17 | Interfaz con Default | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 81 | 18 | Atributo Static | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 82 | 18 | Método Static | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 83 | 18 | Constante Static Final | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 84 | 18 | Bloque Static | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 85 | 19 | Clase Interna | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 86 | 19 | Clase Anónima | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 87 | 19 | Enum Simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 88 | 19 | Enum con Constructor | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 89 | 20 | Equals Override | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 90 | 20 | HashCode Override | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 91 | 20 | CompareTo | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 92 | 21 | Genérico Simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 93 | 21 | Método Genérico | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 94 | 21 | Bounded Type | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 95 | 21 | Wildcard ? | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 96 | 22 | Record Simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 97 | 22 | Sealed Class | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 98 | 22 | Pattern Matching | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 99 | 22 | Text Blocks | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 100 | 22 | Switch Expression Yield | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 101 | 23 | ArrayList Crear | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 102 | 23 | ArrayList Add | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 103 | 23 | ArrayList Get | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 104 | 23 | ArrayList Remove | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 105 | 23 | ArrayList Size | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 106 | 23 | ArrayList Iterar | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 107 | 24 | HashSet Crear | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 108 | 24 | HashSet Add Duplicado | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 109 | 24 | HashSet Contains | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 110 | 25 | HashMap Crear | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 111 | 25 | HashMap Put | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 112 | 25 | HashMap Get | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 113 | 25 | HashMap ContainsKey | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 114 | 25 | HashMap Iterar | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 115 | 26 | LinkedList Crear | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 116 | 26 | LinkedList AddFirst | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 117 | 26 | TreeSet Ordenado | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 118 | 27 | Collections Sort | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 119 | 27 | Collections Reverse | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 120 | 27 | Collections Max | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 121 | 28 | Try-Catch Básico | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 122 | 28 | Múltiples Catch | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 123 | 28 | Finally | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 124 | 28 | Throw Exception | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 125 | 28 | Throws en Firma | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 126 | 29 | Excepción Personalizada | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 127 | 29 | RuntimeException | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 128 | 29 | Try-With-Resources | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 129 | 29 | Multi-Catch | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 130 | 29 | GetMessage | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 131 | 30 | PrintStackTrace | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 132 | 30 | Causa de Excepción | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 133 | 30 | Assert | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 134 | 30 | NullPointerException | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 135 | 31 | Optional Empty | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 136 | 31 | Optional Of | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 137 | 31 | Optional OfNullable | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 138 | 31 | Optional IsPresent | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 139 | 31 | Optional OrElse | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 140 | 31 | Optional IfPresent | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 141 | 32 | Lambda Simple | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 142 | 32 | Lambda Con Parámetro | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 143 | 32 | Lambda Múltiples Parámetros | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 144 | 32 | Lambda Bloque | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 145 | 33 | Predicate Test | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 146 | 33 | Function Apply | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 147 | 33 | Consumer Accept | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 148 | 33 | Supplier Get | needs-real-execution | sí | requiere entrada/ejecución runtime (Scanner/azar/args) |
| 149 | 34 | Method Reference Static | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 150 | 34 | Method Reference Instance | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 151 | 34 | Method Reference Constructor | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 152 | 35 | Stream Filter | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 153 | 35 | Stream Map | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 154 | 35 | Stream ForEach | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 155 | 35 | Stream Count | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 156 | 35 | Stream Reduce | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 157 | 36 | Stream Sorted | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 158 | 36 | Stream Distinct | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 159 | 36 | Stream Limit | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 160 | 36 | Stream AnyMatch | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 161 | 36 | Stream AllMatch | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 162 | 37 | File Write | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 163 | 37 | File Read | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 164 | 37 | File Exists | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 165 | 37 | File Delete | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 166 | 38 | BufferedReader | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 167 | 38 | BufferedWriter | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 168 | 38 | Files Lines Stream | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 169 | 39 | Thread Extends | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 170 | 39 | Runnable Interface | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 171 | 39 | Thread Start | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 172 | 39 | Thread Sleep | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 173 | 39 | Thread Join | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 174 | 40 | Synchronized Method | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 175 | 40 | Synchronized Block | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 176 | 40 | Volatile Variable | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 177 | 40 | AtomicInteger | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 178 | 41 | ExecutorService | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 179 | 41 | Callable Future | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 180 | 41 | CompletableFuture | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 181 | 42 | CountDownLatch | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 182 | 42 | CyclicBarrier | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 183 | 42 | Semaphore | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 184 | 43 | ConcurrentHashMap | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 185 | 43 | CopyOnWriteArrayList | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 186 | 43 | BlockingQueue | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 187 | 43 | ReentrantLock | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 188 | 43 | ReadWriteLock | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 189 | 44 | Singleton Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 190 | 44 | Factory Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 191 | 44 | Builder Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 192 | 45 | Observer Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 193 | 45 | Strategy Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 194 | 45 | Decorator Pattern | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 195 | 46 | SRP - Single Responsibility | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 196 | 46 | OCP - Open/Closed | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 197 | 46 | LSP - Liskov Substitution | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 198 | 47 | ISP - Interface Segregation | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 199 | 47 | DIP - Dependency Inversion | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 200 | 48 | JUnit Test | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 201 | 48 | JUnit BeforeEach | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 202 | 48 | JUnit AssertThrows | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 203 | 49 | Mockito Mock | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 204 | 49 | Mockito Verify | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 205 | 49 | TDD Red-Green-Refactor | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 206 | 50 | AssertJ Fluent | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 207 | 50 | Parametrized Test | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
| 208 | 50 | Test Coverage | rules-cheatable | sí | sondas aceptadas falsamente: comentario-con-respuesta, codigo-muerto-con-patron |
