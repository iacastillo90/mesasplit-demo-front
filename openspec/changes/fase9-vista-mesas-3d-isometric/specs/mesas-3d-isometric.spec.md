# Spec: Plano de Mesas 3D Isométrico Interactivo — MesaSplit

## Requisitos de Capacidad

### `isometric-3d-table-grid` (Track 1)
- MUST proyectar las mesas del salón en perspectiva isométrica 3D usando CSS 3D transforms (`rotateX`, `rotateZ`, `preserve-3d`).
- MUST representar la profundidad visual del objeto (caras superiores y laterales con gradientes 3D) y luz LED indicadora del estado de la mesa.
- MUST responder al toque o clic seleccionando la mesa en tiempo real.

### `perspective-view-toggle-2d-3d` (Track 2)
- MUST proveer un conmutador de perspectiva (`📐 Vista 2D / 🧊 Vista 3D`) en `TableGrid.jsx` (PWA Garzón) y `TopologicalMap.jsx` (Radar Admin).
- MUST recordar la preferencia de vista seleccionada durante la sesión.
