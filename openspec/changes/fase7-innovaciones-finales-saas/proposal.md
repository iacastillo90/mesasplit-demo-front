# Proposal: fase7-innovaciones-finales-saas — Innovaciones Finales SaaS & Tap-to-Pay

## Intent

Completar la experiencia **MesaSplit** al 100% incorporando las 3 capacidades de última generación:
1. **Tap-to-Pay & Billeteras Digitales**: Simulación de cobro contactless NFC en móvil de mozo (Apple Pay, Google Wallet, MercadoPago).
2. **IA de Venta Cruzada (Smart Upsell Assistant)**: Sugerencias automáticas de maridaje e insumos adicionales en el OrderPad del garzón para aumentar el ticket promedio (+18%).
3. **Reporte Ejecutivo & Arqueo Fiscal SII**: Modal de resumen de cierre de turno con desglose de caja, propinas, merma y firma digital simulada del SII.

## Scope

### In Scope
- **Track 1**: `TapToPayModal.jsx` con animación de chip NFC y lectura contactless.
- **Track 2**: `SmartUpsellWidget.jsx` integrado en `OrderPad.jsx` con reglas de maridaje inteligente.
- **Track 3**: `ExecutiveReportModal.jsx` integrado en `PosPage.jsx` para arqueo y cierre fiscal.
- **Tests Unitarios**: Vitest para cada uno de los 3 componentes.

## Approach
Desarrollo en 3 tracks lógicos en TDD (`strict_tdd: true`), comentarios por cada línea de código en español y commits convencionales en español.
