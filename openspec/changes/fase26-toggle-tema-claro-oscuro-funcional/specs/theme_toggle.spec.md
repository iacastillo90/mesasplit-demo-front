# Spec: Selector de Tema Claro/Oscuro Funcional (fase26-toggle-tema-claro-oscuro-funcional)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Store Global de Tema (`useThemeStore.js`)
- **MUST** mantener estado reactivo `theme` ('light' | 'dark').
- **MUST** persistir la preferencia en `localStorage.getItem('mesasplit_theme')`.
- **MUST** actualizar la clase `dark` en `document.documentElement`.

### REQUIREMENT 2: Interactivación de `AppHeader.jsx` y `AdminLayout.jsx`
- **MUST** hacer que el botón ☀️/🌙 en la cabecera llame a `toggleTheme()` y cambie reactivamente el fondo y los colores de `AppHeader`, `AdminLayout` y las páginas asociadas.
