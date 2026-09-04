# Proposal: fase11-pulido-diseno-visual-100 — Pulido Visual Ultra-Premium de Nivel 100% SaaS

## Intent

Llevar el diseño visual de **MesaSplit** al **100% de excelencia estética y pulido SaaS Premium** en todas las vistas de la aplicación:
1. **Tipografía Moderna & Design Tokens Integrados**: Carga de la tipografía Google Font `Plus Jakarta Sans` e `Inter` en `index.css` con scrollbars personalizados y utilidades de *glassmorphism* y neón glow.
2. **Efectos de Brillo & Micro-Animaciones en Portal Hub (`PortalPage.jsx`)**: Tarjetas con bordes resplandecientes (`hover:shadow-[0_0_30px_rgba(56,189,248,0.25)]`), animación de pulso sutil y gradientes de malla.
3. **Estética KDS Neón Oscuro (`KdsPage.jsx`)**: Resaltado neón de tickets urgentes con barras de estado de alta legibilidad a distancia.
4. **Tarjetas KPI Corporativas Glassmorphic en Super Admin (`SuperAdminPage.jsx`)**: Indicadores visuales de salud de franquicia con badges resplandecientes.

## Scope

### In Scope
- **Track 1 (Design System & Global CSS)**: `src/index.css`, carga de tipografía web y scrollbars.
- **Track 2 (Portal Hub Visual Polish)**: `PortalPage.jsx`.
- **Track 3 (KDS & Super Admin Ultra-Polish)**: `KdsPage.jsx`, `SuperAdminPage.jsx`.
- **Tests Unitarios & Build**: Verificación Vitest y compilación Vite.

## Approach
Desarrollo en 3 fases lógicas con TDD (`strict_tdd: true`), comentarios por línea de código en español y commits convencional en español.
