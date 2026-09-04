# Design: fase9-vista-mesas-3d-isometric — Arquitectura del Plano 3D

## Componentes y Estilos 3D

### 1. Componente 3D Isométrico (`IsometricTableGrid3D.jsx`)
- **Ubicación**: `src/shared/ui/IsometricTableGrid3D.jsx`.
- **Efectos 3D**: `transform: rotateX(45deg) rotateZ(-25deg)`, `transform-style: preserve-3d`, cajas de sombra isométrica `box-shadow` y biselado de bordes.

### 2. Integración de Conmutador de Perspectiva
- **WaiterView**: `src/features/WaiterView/components/TableGrid.jsx`.
- **RadarView**: `src/features/RadarView/components/TopologicalMap.jsx`.
