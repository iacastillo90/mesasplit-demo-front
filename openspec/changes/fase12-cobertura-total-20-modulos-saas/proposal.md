# Proposal: fase12-cobertura-total-20-modulos-saas — Cobertura 100% de los 20 Módulos SaaS

## Intent

Garantizar el **100% de cumplimiento explícito e interactivo** de los 20 requerimientos de la plataforma SaaS de MesaSplit:
1. **Punto de Venta POS & Happy Hour**: Venta rápida, mesas, propina y Happy Hour en `PosPage.jsx`.
2. **Gestión de Mesas & Transferencia**: Sectores, asignación y `TransferModal.jsx`.
3. **KDS Cocina & Estaciones**: Modos KDS, Expo View, Lista 86 y Recall en `KdsPage.jsx`.
4. **Comandas & Impresión Cloud ESC/POS (Puntos 4 y 18)**: Modal de configuración de hasta 5 impresoras térmicas `ThermalPrinterConfigModal.jsx`.
5. **Pedidos Online & Delivery 🆕**: UberEats, PedidosYa, Rappi y retiro en `DeliveryColumn.jsx`.
6. **QR Mesa & Chat Mozo**: Menú QR, encuestas y S.O.S. en `ClientPage.jsx`.
7. **Inventario, Recetas & Costeo**: Costo Primario e Ingeniería de Menú en `CostoPrimarioCard.jsx`.
8. **Control de Merma**: Registro FIFO y Kardex de movimientos en `MermaBar.jsx`.
9. **Caja, Arqueo & CFD**: Cuadre de caja, fajos y notas de crédito en `PosPage.jsx`.
10. **Encargos & Abonos**: Modal de pedidos anticipados y señas en `PosPage.jsx`.
11. **Facturación SII 🆕 (DTE 39/33)**: Boleta y factura electrónica con folios CAF en `InvoiceRequestModal.jsx`.
12. **Fidelización MesaSplit Rewards**: Puntos, cashback y tarjetas de regalo en `RewardsBadgeWidget.jsx`.
13. **RRHH Completo 🆕 & Previred**: Modal de gestión de personal, marcaje Ley 40 Horas y Previred en `RrhhManagementModal.jsx`.
14. **Compras & Bodega**: Cotizaciones y proveedores en `SuperAdminPage.jsx`.
15. **Reportes Avanzados & Excel (CSV)**: Exportación tabular en 1 clic en `exportToCsv.js`.
16. **Sistema de Reservas**: Asistente de reservas por sucursal en `ClientReservationAssistant.jsx`.
17. **Multi-Sucursal**: Subdominios y franquicias (Las Condes, Providencia, Vitacura) en `SuperAdminPage.jsx`.
18. **Impresión Cloud Thermal**: Driver simulado ESC/POS.
19. **Seguridad Avanzada (2FA & Permisos)**: Doble autenticación y matriz de roles.
20. **Soporte 24/7 Chileno**: Widget flotante de ayuda directa por WhatsApp/Teléfono en `AppFooter.jsx`.

## Scope

### In Scope
- **Track 1 (Impresión Thermal ESC/POS & Soporte 24/7 Chileno)**: `ThermalPrinterConfigModal.jsx`, `AppFooter.jsx`.
- **Track 2 (RRHH Completo, Previred & Ley 40h)**: `RrhhManagementModal.jsx`.
- **Track 3 (Encargos, Abonos & 2FA)**: Modales de apoyo en POS y SuperAdmin.
- **Tests Unitarios & Build**: Cobertura Vitest y compilación Vite.

## Approach
Desarrollo en 3 fases lógicas con TDD (`strict_tdd: true`), comentarios por línea de código en español y commits convencional en español.
