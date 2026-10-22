# Delta Spec: editor-ux (C-12b UI Polish)

## MODIFIED Requirements

### Requirement: Guías verticales de indentación cada 4 espacios
El editor SHALL mostrar líneas verticales sutiles (`.indent-guide`) cada 4 espacios únicamente en los niveles de indentación utilizados en cada línea, incluyendo de forma inmediata las líneas donde la persona usuaria acaba de presionar `Tab` (aunque la línea contenga solo espacios y aún no tenga caracteres visibles), sin dibujar guías en líneas sin indentación (`level === 0`) ni en niveles no utilizados, y manteniendo contraste distinguible tanto en modo oscuro como en modo claro.

#### Scenario: Guías aparecen al indentar con Tab y no en líneas sin indentar
- **WHEN** la persona usuaria escribe código en `#code-editor` e indenta una línea con `Tab` (4 espacios) o `2 Tabs` (8 espacios)
- **THEN** la capa `#indent-guides-layer` dibuja inmediatamente 1 guía vertical para la línea con 1 `Tab` y 2 guías verticales para la línea con 2 `Tab`, mientras que las líneas en columna 0 tienen 0 guías, tanto en `data-theme="dark"` como en `data-theme="light"`
