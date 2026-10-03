# Spec Delta — frontend-no-backend

## Purpose

El frontend funciona 100% sin backend: detecta ejecución no disponible, degrada
a validación por reglas con mensaje honesto y mantiene progreso local con
avisos visibles, sin exponer URLs internas ni prometer IA o sesiones reales.

## ADDED Requirements

### Requirement: Detección de backend ausente con fallback a reglas

El sistema SHALL detectar backend no configurado antes de cualquier intento de
red y, en ese caso, mostrar el mensaje exacto
"ejecución no disponible — validando por reglas" y validar con `validator.js`,
sin reintentos y sin exponer ninguna URL interna en la UI.

#### Scenario: Backend ausente valida por reglas

- **WHEN** el estudiante pulsa "Verificar Solución" sin `BACKEND_URL`
  configurada
- **THEN** el sistema muestra "ejecución no disponible — validando por reglas"
  y devuelve el veredicto de `validator.js` sin ningún `fetch`

#### Scenario: Sin reintento ni URL expuesta

- **WHEN** el backend está ausente o el intento único falla
- **THEN** el sistema no reintenta y ningún mensaje visible contiene una URL
  interna (solo el mensaje exacto más el veredicto por reglas)

### Requirement: Backend configurado con timeout y error legible por stage

Cuando haya una URL configurada, el sistema SHALL intentarlo una sola vez con
timeout explícito y, ante timeout o fallo de red, degradar a `validator.js`
con un error legible que indique el stage (`compilation`/`execution`) sin
URLs internas ni stacktrace crudo.

#### Scenario: Timeout degrada con stage

- **WHEN** el backend configurado no responde dentro del timeout
- **THEN** el sistema aborta el intento, muestra el mensaje exacto de
  degradación más un error legible con su stage y el veredicto por reglas

#### Scenario: Fallo de red sin reintento

- **WHEN** el `fetch` al backend rechaza o devuelve HTTP no-OK
- **THEN** el sistema hace un único intento, no reintenta y degrada a reglas
  con mensaje en español

### Requirement: Aviso persistente de progreso local y `localStorage` degradado

El sistema SHALL mostrar de forma persistente que el progreso
"se guarda en este navegador" y, si `localStorage` está lleno o bloqueado,
SHALL avisar y seguir funcionando sin guardar (Flujo 1, RN-PRO-01).

#### Scenario: Aviso local-only visible

- **WHEN** el estudiante abre la plataforma
- **THEN** ve el aviso "se guarda en este navegador" junto al progreso

#### Scenario: `localStorage` indisponible sin bloqueo

- **WHEN** `localStorage` lanza (lleno, bloqueado o modo privado)
- **THEN** el sistema muestra un aviso, la validación y navegación siguen
  operativas y no se pierde la sesión actual en memoria

### Requirement: Firebase marcado no-operativo con desimport condicional

`firebase-config.js` y `auth.js` SHALL llevar el banner
"EJEMPLO NO OPERATIVO — sin login real en v1.0" con keys de ejemplo →
`REEMPLAZAR`, y el apply SHALL listar las referencias vivas
(`authManager`/`showAuthModal`/ids) para decidir: sin uso vivo se retiran de
`index.html` los scripts del SDK + ambos archivos; con uso vivo se mantiene
el import con banner y se reporta. Los archivos quedan en disco para C-08.

#### Scenario: Banner no-operativo presente

- **WHEN** se abre `firebase-config.js` o `auth.js`
- **THEN** la cabecera muestra "EJEMPLO NO OPERATIVO — sin login real en v1.0"
  y ninguna key parece real (todas dicen `REEMPLAZAR`)

#### Scenario: Desimport condicional según referencias vivas

- **WHEN** el apply lista referencias vivas a auth en `index.html` y JS
- **THEN** sin uso vivo retira los imports del SDK + ambos archivos, y con uso
  vivo los mantiene con banner y lo reporta en el resumen

### Requirement: UI honesta con IA apagada

Con la IA desactivada (C-02), el sistema SHALL mostrar los botones de sesión
deshabilitados con la etiqueta exacta
"Próximamente: guardá tu progreso en tu cuenta", SHALL eliminar el mensaje
"Firebase inicializado correctamente", SHALL mantener el aviso
"tu progreso se guarda solo en este navegador" como estado temporal y SHALL
ocultar la etiqueta "Feedback de IA" y los porcentajes "Funcionalidad/Estilo"
de la validación local.

#### Scenario: Botones de sesión honestos

- **WHEN** el estudiante ve el hero sin login real
- **THEN** los botones de sesión aparecen deshabilitados con la etiqueta
  "Próximamente: guardá tu progreso en tu cuenta" y no abren ningún modal
  de autenticación

#### Scenario: Sin falsa precisión de IA

- **WHEN** el estudiante valida un ejercicio con IA apagada
- **THEN** el resultado no contiene "Feedback de IA" ni porcentajes
  "Funcionalidad/Estilo", solo el veredicto por reglas en español

#### Scenario: Sin mensaje Firebase operativo

- **WHEN** carga la página
- **THEN** la consola y la UI no muestran "Firebase inicializado correctamente"

### Requirement: Errores de validación en español sin stacktrace crudo

Todo error visible de validación o ejecución SHALL estar en español, sin
stacktrace crudo ni instrucciones de backend (`cd backend && npm start`).

#### Scenario: Error legible en español

- **WHEN** la validación falla o el sistema captura una excepción
- **THEN** el mensaje visible está en español y no contiene stacktrace,
  rutas internas ni comandos de backend
