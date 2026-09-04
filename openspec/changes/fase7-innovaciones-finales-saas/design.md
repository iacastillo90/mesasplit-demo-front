# Design: fase7-innovaciones-finales-saas — Arquitectura de Innovaciones Finales

## Componentes y Flujos

### 1. Track 1: Tap-to-Pay Móvil (`TapToPayModal.jsx`)
- **Ubicación**: `src/features/WaiterView/components/TapToPayModal.jsx`.
- **Integración**: Invocado desde la vista de mozo o mesa cliente para cobros móviles con animación NFC.

### 2. Track 2: Smart Upsell Assistant (`SmartUpsellWidget.jsx`)
- **Ubicación**: `src/features/WaiterView/components/SmartUpsellWidget.jsx`.
- **Integración**: Montado en `OrderPad.jsx` de la PWA del garzón.

### 3. Track 3: Reporte Ejecutivo & Cierre SII (`ExecutiveReportModal.jsx`)
- **Ubicación**: `src/features/PosView/components/ExecutiveReportModal.jsx`.
- **Integración**: Montado en `PosPage.jsx` para arqueo de caja.
