# Proposal: Fase 28 — Soporte de Tema Claro y Oscuro Dinámico en Tarjetas de Admin Radar

## Contexto y Motivación

El usuario señala que al cambiar al **Modo Claro** en la barra de navegación universal, algunas tarjetas e ítems de la vista `/admin` (como la grilla de inventario `InventoryMenuManager.jsx` y el plano topológico de salón y mesas `TopologicalMap.jsx`) mantenían colores oscuros hardcodeados. Se solicita adaptar todos los componentes de la vista de administración para responder fluidamente al tema activo seleccionable en el header.

## Alcance del Cambio

- **`src/features/RadarView/components/InventoryMenuManager.jsx`**: [ACTUALIZADO] Adaptar paleta visual dinámica (fondos claros u oscuros, bordes, textos, tarjetas de platos e inputs) según `useThemeStore`.
- **`src/features/RadarView/components/TopologicalMap.jsx`**: [ACTUALIZADO] Adaptar plano de mesas, suelo 2D/3D, controles de zona y leyenda explicativa a `useThemeStore`.
- **`src/features/RadarView/components/StaffLeaderboard.jsx`**: [ACTUALIZADO] Adaptar ranking de gamificación al tema claro u oscuro.
- **`src/features/RadarView/components/MermaBar.jsx`**: [ACTUALIZADO] Adaptar barra de registro rápido de mermas e insumos.
