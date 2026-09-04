# Tasks: fase3-ux-experiencia-demo — Tareas de Desarrollo por Fases

## Fase 1: Hub de Control de Demo y Modo Simulación (Demo Control Floating Bar)
- [x] 1.1 Crear hook o helper de simulación de eventos `useDemoSimulator.js`.
- [x] 1.2 Crear componente `DemoControlBar.jsx` con botones de disparo en 1 clic (Pedido Mesa 4, S.O.S., Plato Listo, Pago QR, Reset).
- [x] 1.3 Integrar `DemoControlBar` en la UI principal con botón colapsable `⚡ Demo Control`.
- [x] 1.4 Escribir tests unitarios en `DemoControlBar.test.jsx`.

## Fase 2: Sincronización Inter-Vistas & Feedback Visual/Sonoro (Cross-View Realtime UX)
- [x] 2.1 Refactorizar `OrderTrackingBanner.jsx` para incluir stepper visual animado (Recibido ➔ Preparando ➔ Listo ➔ Entregado).
- [x] 2.2 Integrar alerta emergente pulsante de S.O.S. en la vista `/garzon` y `/admin`.
- [x] 2.3 Añadir función y UI de "Deshacer" (`Undo`) en `Toast.jsx` para acciones en KDS y Waiter.
- [x] 2.4 Escribir tests unitarios para las notificaciones y stepper.

## Fase 3: División de Cuenta & Experiencia de Pago (Split Bill UX)
- [x] 3.1 Crear componente `GroupSplitProgressBar.jsx` con barra de progreso de pago y desglose por comensal.
- [x] 3.2 Añadir selector interactivo de propinas (0%, 10%, 15%, 20%) en `BillSplitterModal.jsx`.
- [x] 3.3 Agregar botón "Compartir Link de Pago por WhatsApp" con copia al portapapeles.
- [x] 3.4 Escribir tests unitarios para los componentes de split bill.

## Fase 4: Carta Digital, Filtros Rápidos & Modificadores de Platos (Client Menu UX)
- [x] 4.1 Crear `MenuFilterPills.jsx` con filtros por dieta (`Vegano`, `Gluten Free`, `Picante`, `Popular`).
- [x] 4.2 Crear `ItemCustomizerModal.jsx` para seleccionar término de carne, acompañamiento y exclusiones al agregar al carrito.
- [x] 4.3 Integrar los nuevos componentes en `ClientPage.jsx`.
- [x] 4.4 Escribir tests unitarios para los filtros y modal de personalización.

## Fase 5: Atajos de Teclado & Ergonomía Operativa (POS & KDS Ergonomics)
- [x] 5.1 Crear hook `useKeyboardShortcuts.js` para registrar atajos (`F2`, `Espacio`, `Esc`).
- [x] 5.2 Agregar badges de teclado visuales en `PaymentMethodPicker.jsx` (POS) y `TicketCard.jsx` (KDS).
- [x] 5.3 Implementar toggle de "Modo Táctil Extragrande" en la vista de KDS y POS.
- [x] 5.4 Escribir tests unitarios para la ergonomía y atajos.
