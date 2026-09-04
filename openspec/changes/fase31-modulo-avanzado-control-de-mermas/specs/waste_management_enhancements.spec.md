# Spec: Módulo Avanzado de Control de Mermas (fase31-modulo-avanzado-control-de-mermas)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: KPIs y Categorización de Mermas Gastronómicas
- **MUST** desplegar tarjetas de resumen KPI con la pérdida total en CLP ($), causa con mayor frecuencia y ratio sobre ventas.
- **MUST** permitir la clasificación del desperdicio por Causa (*Vencimiento, Error de Cocina, Deterioro, Rotura*) y Área (*Cocina, Bar, Bodega*).

### REQUIREMENT 2: Exportación a Excel y Adaptabilidad de Tema
- **MUST** proveer un botón de exportación a archivo Excel CSV utilizando `exportToCsv`.
- **MUST** responder dinámicamente a los cambios de tema Claro ☀️ y Oscuro 🌙 con `useThemeStore`.
