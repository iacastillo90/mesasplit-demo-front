# Proposal: Fase 27 — Imágenes Reales de la Carta del Cliente en el Inventario del Admin

## Contexto y Motivación

El usuario solicita enriquecer la vista del inventario del Admin (`InventoryMenuManager.jsx` en `/admin`) incorporando las mismas fotos en alta resolución, precios, nombres, descripciones y categorías que se muestran en la carta del cliente, haciendo que la gestión del inventario sea mucho más visual, hiperrealista e interactiva.

## Alcance del Cambio

- **`src/mocks/menu.json`**: [ACTUALIZADO] Asignar imágenes reales HD a cada uno de los ítems de la carta gastronómica.
- **`src/features/RadarView/components/InventoryMenuManager.jsx`**: [ACTUALIZADO] Rediseñar la grilla de platos e insumos para mostrar la fotografía HD representativa de la carta, badges de categorías, alergias, costo primario, margen de ganancia en % y edición en vivo de precios y stock (Lista 86).
- **`src/features/RadarView/components/InventoryMenuManager.test.jsx`**: [ACTUALIZADO] Actualizar pruebas unitarias para validar el renderizado de imágenes HD y precios reales.
