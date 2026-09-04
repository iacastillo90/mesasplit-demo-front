# Proposal: Fase 21 — Cards Interactivas de Reseñas de Platos, Modal de Detalle Completo y Filtros Dinámicos Responsivos

## Contexto y Motivación

El usuario solicita una experiencia visual premium para la pestaña **"Mis Reseñas de Platos"**:
1. **Cards con Fotografía HD y Metadatos Completos**: Tarjetas con foto del plato, estrellas, nombre de la comida, sucursal, fecha y hora de la visita.
2. **Modal de Detalle Completo del Plato y Reseña (`DishReviewDetailModal.jsx`)**: Al hacer clic en cualquier tarjeta de reseña, se despliega una vista emergente con la fotografía en alta resolución, dirección y teléfono del local, desgloses de calificación (Sabor, Presentación, Atención), garzón atendió y comentarios.
3. **Barra de Filtros Dinámicos Responsivos para Móvil**: Filtros táctiles deslizables (*Todos, 5 Estrellas ★, Restô Lo Ovalle, Restô Providencia, Restô Vitacura, Carnes, Postres & Tragos*) que filtran dinámicamente las tarjetas de reseñas en pantalla al hacer clic.

## Alcance del Cambio

- **`src/features/ClientView/components/DishReviewDetailModal.jsx`**: [NUEVO] Modal de detalle de plato y reseña con fotos, dirección del local y puntuaciones.
- **`src/features/ClientView/components/DishReviewDetailModal.test.jsx`**: [NUEVO] Test unitario para el modal de detalle.
- **`src/features/ClientView/pages/ClientProfilePage.jsx`**: [ACTUALIZADO] Tarjetas enriquecidas con fotos HD, filtros deslizables interactivos y apertura del modal de detalle al hacer clic.
