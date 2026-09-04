# Proposal: fase8-diseno-cms-excel-ux — Experiencia CMS, Exportación Excel y UI Ultra-Premium Client

## Intent

Reforzar el diseño visual y las capacidades administrativas de **MesaSplit** agregando:
1. **Exportación a Excel/CSV & Tablas CMS Admin**: Botones de descarga de reportes financieros y operacionales en formato CSV/Excel en el Local Admin y Super Admin Corporativo, junto con vistas de tablas interactivas.
2. **Diseño Ultra-Premium WOW en Mesa Virtual Cliente**: Rediseño visual de la vista `/cliente` con estilo *Glassmorphic Premium*, tarjetas de platos con efectos de elevación hover, banners promocionales dinámicos y experiencia de menú de alto impacto visual.

## Scope

### In Scope
- **Track 1 (Exportación Excel/CSV & Tablas CMS Admin)**: Utility `exportToCsv.js` + integraciones en `RadarPage.jsx` y `SuperAdminPage.jsx` para descargar reportes de ventas, inventario y matriz BCG.
- **Track 2 (UI Ultra-Premium Client)**: Rediseño visual de `ClientPage.jsx` con gradientes tailored, héroe promocional, badges resplandecientes y animaciones fluidas.
- **Tests Unitarios**: Suites de prueba en Vitest para las utilidades de exportación y la UI renovada.

## Approach
Desarrollo en 2 tracks lógicos en TDD (`strict_tdd: true`), comentarios por cada línea de código en español y commits convencionales en español.
