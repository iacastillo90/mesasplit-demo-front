# Spec: Caja POS — Cuentas Dinámicas, Carta HD y Arqueo/Reportes (fase37-mejora-vista-caja-pos-cuentas-dinamicas-carta-hd-y-arqueo-reportes)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Cuentas Dinámicas y Filtros de Estado en POS
- **MUST** desplegar cuentas con diversos estados (*Pendiente*, *Pagada*, *Para Retirar*) y tipos (*Mesa*, *Retiro Takeaway*).
- **MUST** permitir la selección inmediata de cualquier cuenta con actualización interactiva en tiempo real del panel de cobro.

### REQUIREMENT 2: Venta Rápida Directa con Fotos HD de la Carta
- **MUST** incluir un catálogo visual con imágenes HD de platos de la carta (*Lomo Lo Ovalle, Ceviche Mixto, Pisco Sour, Volcán de Chocolate*).
- **MUST** permitir al cajero agregar ítems de la carta directamente a un ticket de venta rápida para retirar o venta directa al mostrador.

### REQUIREMENT 3: Arqueo, Cuadre de Caja y Reportes Diarios (DTEs + Medios de Pago)
- **MUST** ofrecer un desglose claro de ventas en Efectivo, Tarjetas (Débito/Crédito) y Transferencias.
- **MUST** diferenciar el volumen y montos de DTEs emitidos: Boletas Electrónicas vs Facturas Electrónicas.
- **MUST** permitir realizar el cuadre físico de caja con cálculo instantáneo de diferencias y exportación a Excel / CSV.
