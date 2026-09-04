# Proposal: fase9-vista-mesas-3d-isometric — Plano de Mesas 3D Isométrico Interactivo

## Intent

Elevar la representación física del salón de restaurantes en **MesaSplit** incorporando una vista isométrica 3D interactiva para las mesas en las vistas de **Garzón (PWA)** y **Local Admin (Radar)**:
1. **Plano 3D Isométrico Táctil**: Cada mesa se renderiza como un volumen tridimensional elevado (`preserve-3d`, perspectiva isométrica, profundidad visual de objeto y anillo LED de estado resplandeciente).
2. **Conmutador de Perspectiva 2D/3D**: Selector en 1 clic para alternar libremente entre la grilla 2D clásica y la vista isométrica 3D futurista.

## Scope

### In Scope
- **Track 1 (IsometricTableGrid3D.jsx)**: Componente visual 3D isométrico con soporte para animaciones de elevación hover, LEDs de estado (Libre 🟢, Ocupada 🟠, Alergia/SOS 🔴) e interactividad táctil.
- **Track 2 (Integración en Garzón y Admin Radar)**: Conmutador 2D/3D en `TableGrid.jsx` (PWA Garzón) y `TopologicalMap.jsx` (Radar Admin).
- **Tests Unitarios**: Suites de prueba en Vitest para la vista 3D y conmutador.

## Approach
Desarrollo en 2 tracks lógicos en TDD (`strict_tdd: true`), comentarios por cada línea de código en español y commits convencionales en español.
