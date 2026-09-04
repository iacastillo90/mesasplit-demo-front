# Spec: Tema Claro/Oscuro y Reportes CMS Administrativos Excel (fase25-modo-claro-oscuro-y-reportes-cms-admin-excel)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Toggle de Modo Claro ☀️ / Oscuro 🌙 Global (`AppHeader.jsx`)
- **MUST** proveer un botón interactivo ☀️/🌙 en la cabecera universal para alternar entre tema claro y oscuro de manera inmediata.

### REQUIREMENT 2: Nombres Intuitivos de Secciones Administrativas (`AdminLayout.jsx` & `AdminCMSReportsModal.jsx`)
- **MUST** incluir las 8 secciones de reporte administrativo requeridas:
  1. 📊 Reportes de Ventas
  2. 💳 Reporte de Tarjetas (Transbank/Redelcom)
  3. 🛵 Reporte de Deliverys (Rappi/PedidosYa/UberEats)
  4. 🍽️ Pedidos en Local
  5. 🛍️ Pedidos para Retiro
  6. 📋 Planilla de Asistencia & RRHH
  7. 📦 Reporte de Inventario
  8. 🗑️ Reporte de Mermas

### REQUIREMENT 3: Exportación a Excel (CSV) e Impresión de Informes
- **MUST** permitir la descarga en archivo Excel (CSV) mediante la función `exportToCsv` de cualquiera de los 8 reportes, así como opción de impresión.
