# Spec: Imágenes Reales de la Carta en Inventario Admin (fase27-imagenes-reales-carta-en-inventario-admin)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Imágenes HD de la Carta del Cliente en `menu.json` e `InventoryMenuManager.jsx`
- **MUST** asociar imágenes reales (`/images/dish_*.png` o URL de alta calidad) a los ítems del menú.
- **MUST** renderizar la imagen HD del plato en la tarjeta de inventario del Admin con bordes redondeados y sombra.

### REQUIREMENT 2: Datos Hiperrealistas de la Carta (Nombres, Precios, Costos y Margen)
- **MUST** mostrar nombre exacto, categoría, descripción corta, precio de venta en CLP ($), costo de ingredientes y margen de utilidad calculado en %.
- **MUST** permitir la conmutación de estado Lista 86 (Disponible / Agotado) y la edición rápida de precio de venta.
