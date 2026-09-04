# Spec: Soporte de Tema Claro y Oscuro en Tarjetas del Admin (fase28-soporte-tema-claro-oscuro-en-tarjetas-radar-admin)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Adaptación de `InventoryMenuManager.jsx` al Tema Global
- **MUST** leer `useThemeStore` y aplicar estilos visuales claros (fondos blancos/slate-50, textos oscuros y bordes suaves) cuando el tema es `'light'`.
- **MUST** mantener la paleta oscura profunda (`bg-brand-900`/`bg-brand-950`) cuando el tema es `'dark'`.

### REQUIREMENT 2: Adaptación de `TopologicalMap.jsx`, `StaffLeaderboard.jsx` y `MermaBar.jsx`
- **MUST** alternar la grilla del salón, los nodos de mesas, el ranking de garzones y la barra de mermas entre tema claro y oscuro sin romper contraste ni accesibilidad.
