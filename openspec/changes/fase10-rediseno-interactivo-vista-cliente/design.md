# Design: fase10-rediseno-interactivo-vista-cliente — Arquitectura de la Vista Cliente Interactiva

## Módulos y Cambios

### 1. Track 1: Dinámica de Carrito y Canje de Recompensas
- **`useClientStore.js`**: Estado de descuento aplicado (`activeDiscount`), método `applyRewardDiscount(pctOrAmount)`.
- **`RewardsBadgeWidget.jsx`**: Acción de canje conectada al store para restar descuento del total en CLP.

### 2. Track 2: Menú Ampliado (5+ Platos por Filtro) & Modal Centrado
- **`clientService.js`**: Ampliación del catálogo a 25+ ítems con dietas etiquetadas.
- **`ItemReviewModal.jsx`**: Centrado absoluto flexbox `fixed inset-0 flex items-center justify-center` con scroll interno.

### 3. Track 3: Vista Dedicada de Carrito & División Multi-Comensal con Nombres
- **`ClientCartPage.jsx`**: Nueva vista/sub-ruta de carrito interactivo con detalle de ítems, estado de cocina y selector de comensales.
- **`BillSplitterModal.jsx`**: Integración de 4 comensales nombrados (*Ignacio*, *Valentina*, *Matías*, *Camila*) con cuotas individuales en vivo.
