# Proposal: Fase 37 — Mejora Integral de la Vista de Caja POS: Cuentas Dinámicas, Venta Rápida desde Carta HD y Arqueo / Reportes Diarios

## Contexto y Motivación

El usuario solicita potenciar la vista de **Caja / Punto de Venta (POS)** (`/admin/caja` -> `PosPage.jsx`) para hacerla 100% dinámica en cada clic, permitiendo:
1. Gestionar cuentas dinámicas en tiempo real (Salón, Terraza, Pedidos para Retirar / Takeaway), filtradas por estado (*Pendientes*, *Pagadas*, *En Cobro*, *Para Retirar*).
2. Realizar venta rápida directa al mostrador desde la carta con **fotografías HD** de platos (igual que en las vistas de Cliente y Admin).
3. Realizar el Arqueo de Caja y Cuadre diario con desglose en tiempo real de Efectivo, Tarjetas (Débito/Crédito), Boletas Electrónicas (DTE), Facturas Electrónicas y exportación a Excel / CSV.

## Alcance del Cambio

- **`src/features/PosView/store/usePosStore.js`**: [ACTUALIZADO] Ampliar las cuentas canónicas del POS con detalle de ítems, tipos de pedido (Mesa vs Retiro) y acciones de agregar ítem al ticket activo.
- **`src/features/PosView/components/PosQuickSaleCatalog.jsx`**: [NUEVO] Componente de catálogo interactivo para venta rápida con fotos HD de la carta, filtros por categoría y búsqueda instantánea.
- **`src/features/PosView/components/PosDailyReportsModal.jsx`**: [NUEVO] Modal/Tab interactivo de Arqueo y Cuadre de Caja con desglose DTE (Boletas vs Facturas), resumen de medios de pago y exportación a Excel CSV.
- **`src/features/PosView/pages/PosPage.jsx`**: [ACTUALIZADO] Integrar las pestañas dinámicas (Cuentas, Venta Rápida HD, Arqueo & Reportes) y la maquetación responsiva interactiva.
- **`src/features/PosView/PosPage.test.jsx`**: [ACTUALIZADO] Pruebas unitarias completas de la nueva funcionalidad del POS.
