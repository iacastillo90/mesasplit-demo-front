# Spec: Rediseño Interactivo Total de la Vista Cliente — MesaSplit

## Requisitos de Capacidad

### `star-dish-dynamic-addition` (Track 1)
- MUST agregar dinámicamente el plato estrella al carrito al presionar el botón en el Hero.
- MUST aplicar el descuento de puntos de lealtad (porcentaje o monto fijo) reduciendo el total neto de la boleta.

### `extended-menu-filtering-5-dishes` (Track 2)
- MUST proveer al menos 5 platos gastronómicos estructurados por cada filtro dietético/categoría (*Popular*, *Sin Gluten*, *Vegetariano*, *Picante*, *Dulce*, *Barra*).
- MUST posicionar el modal `ItemReviewModal` centrado horizontal y verticalmente en el viewport (`fixed inset-0 flex items-center justify-center`).

### `interactive-cart-view-multi-diner-split` (Track 3)
- MUST ofrecer una vista interactiva de carrito `/cliente/carrito` accesible desde el nav superior.
- MUST simular 4 comensales nombrados (*Ignacio*, *Valentina*, *Matías*, *Camila*) asignando platos individuales y recalculando la cuota exacta por comensal al hacer clic.
