# Design: fase11-pulido-diseno-visual-100 — Arquitectura del Pulido Visual

## Estética y Tokens CSS

### 1. Sistema de Estilos y Tipografía (`index.css`)
- **Fuentes**: `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');`
- **Scrollbar**: `::-webkit-scrollbar` con pista oscura y pulgar redondeado.
- **Glassmorphism**: `.glass-card` con `backdrop-filter: blur(12px)` y gradiente suave.

### 2. Vistas Polidas
- **Portal Launcher**: `PortalPage.jsx` con efectos de iluminación `hover:ring-2 hover:ring-sky-400/50`.
- **Cocina KDS**: `KdsPage.jsx` con tickets resplandecientes.
- **Super Admin**: `SuperAdminPage.jsx` con KPIs visuales de alto contraste.
