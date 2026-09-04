# Spec: Innovaciones Finales SaaS & Tap-to-Pay — MesaSplit

## Requisitos de Capacidad

### `tap-to-pay-contactless-simulation` (Track 1)
- MUST simular la lectura NFC por aproximación de tarjeta o teléfono inteligente.
- MUST soportar métodos de pago digitales (*Apple Pay*, *Google Wallet*, *MercadoPago QR*, *NFC Contactless*).
- MUST emitir confirmación de pago aprobado con animación visual.

### `smart-upsell-cross-selling` (Track 2)
- MUST analizar los platos agregados al borrador de comanda y desplegar sugerencias de maridaje o acompañamiento (*Smart Upsell*).
- MUST permitir agregar la sugerencia al borrador con un solo clic (+1 clic add).

### `executive-report-sii-audit` (Track 3)
- MUST calcular el balance consolidado del turno (ventas totales, efectivo, tarjetas, propinas, merma).
- MUST desplegar la representación visual de arqueo de caja con firma/timbre electrónico simulado del SII.
