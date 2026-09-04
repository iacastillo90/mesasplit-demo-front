# Spec: Cards de Reseñas de Platos, Modal de Detalle y Filtros Móviles (fase21-resenas-interactivas-cards-modal-filtros)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Tarjetas Enriquecidas de Reseñas de Platos
- **MUST** mostrar la imagen HD del plato consumido.
- **MUST** incluir el nombre del plato, calificación en estrellas (★), sucursal visitada, fecha y hora del consumo.
- **MUST** ser totalmente interactivas al clic.

### REQUIREMENT 2: Modal de Detalle de Plato y Reseña (`DishReviewDetailModal.jsx`)
- **MUST** abrirse al hacer clic en cualquier tarjeta de reseña.
- **MUST** presentar la foto a gran escala del plato, dirección exacta y teléfono del local, desglose de calificaciones (Sabor, Presentación, Servicio) y comentarios.

### REQUIREMENT 3: Barra de Filtros Dinámicos Responsivos
- **MUST** permitir desplazamiento táctil horizontal en dispositivos móviles (`overflow-x-auto`).
- **MUST** filtrar dinámicamente el listado de reseñas según la categoría o sucursal seleccionada.
