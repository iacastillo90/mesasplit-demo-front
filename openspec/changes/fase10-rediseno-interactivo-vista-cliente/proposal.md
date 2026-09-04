# Proposal: fase10-rediseno-interactivo-vista-cliente — Rediseño Interactivo Total de la Vista Cliente para Demo Video

## Intent

Transformar la vista del cliente (`/cliente`) en una experiencia 100% interactiva, fluida y sin fricción, optimizada para la grabación de un video demostrativo de nivel comercial:
1. **Plato Estrella Dinámico**: El botón "Pedir Plato Estrella" suma inmediatamente el combo al carrito con toast y actualización de contador.
2. **Canje de Descuentos Real**: Al canjear recompensas en `RewardsBadgeWidget`, se aplica un descuento real (%) sobre el total de la cuenta en CLP.
3. **Catálogo Ampliado por Filtros (Mínimo 5 Platos por Categoría/Filtro)**: Expansión del menú a más de 25 platos estructurados con tags (*Popular 🔥*, *Sin Gluten 🌾*, *Vegetariano 🥗*, *Picante 🌶️*, *Dulce 🍰*, *Barra 🍹*).
4. **Centrado Perfecto de Modal de Reseñas (`ItemReviewModal`)**: Modal centrado verticalmente en la pantalla con backdrop blur para evitar recortes en pantallas móviles y desktop.
5. **Página/Vista Interactiva de Carrito y Comanda (`/cliente/carrito`)**: Vista dedicada de resumen de orden accesible desde el header manteniendo el drawer simple existente.
6. **Simulación Multi-Comensal con Nombres y División de Cuenta Táctil**: Integración de 4 comensales nombrados (*Ignacio (Tú)*, *Valentina*, *Matías*, *Camila*) con asignación de ítems por persona y cálculo interactivo en 1 clic.

## Scope

### In Scope
- **Track 1 (Agregado Dinámico & Canje Real de Descuento)**: `ClientPageHero.jsx`, `RewardsBadgeWidget.jsx`, `useClientStore.js` y `useSplitStore.js`.
- **Track 2 (Menú Ampliado con 5+ Platos por Filtro & Centrado de Modales)**: `clientService.js`, `ItemReviewModal.jsx`.
- **Track 3 (Vista Interactiva de Carrito & Simulación 4 Comensales Nombrados)**: `ClientCartPage.jsx`, `BillSplitterModal.jsx`.
- **Tests Unitarios**: Vitest para cada nuevo módulo e interacción.

## Approach
Desarrollo en 3 fases lógicas con TDD (`strict_tdd: true`), comentarios por línea de código en español y commits convencional en español.
