# Proposal: Fase 25 — Toggle Modo Claro/Oscuro Global y Módulo CMS de Reportes Administrativos Excel

## Contexto y Motivación

1. El usuario solicita la posibilidad de alternar entre Modo Claro ☀️ y Modo Oscuro 🌙 desde la cabecera universal `AppHeader.jsx` para todas las vistas (especialmente la de administración).
2. Se requiere reorganizar las secciones de administración con nombres intuitivos ajustados a la operación gastronómica real:
   - 📊 **Reporte de Ventas**
   - 💳 **Reporte de Tarjetas & Pasarelas (Transbank/Redelcom)**
   - 🛵 **Reporte de Deliverys (Rappi/PedidosYa/UberEats)**
   - 🍽️ **Pedidos en Local (Comandas de Salón)**
   - 🛍️ **Pedidos para Retiro (Takeout/Pick-up)**
   - 📋 **Planilla de Asistencia & RRHH (Control de Turnos)**
   - 📦 **Reporte de Inventario (Stock de Insumos)**
   - 🗑️ **Reporte de Mermas (Pérdidas de Insumos)**
3. Todas estas vistas deben contar con funcionalidad tipo CMS con descarga directa a Excel (CSV) e impresión de informes para RRHH y Contabilidad.

## Alcance del Cambio

- **`src/shared/ui/AppHeader.jsx`**: [ACTUALIZADO] Añadir botón selector de Tema Claro ☀️ / Oscuro 🌙 con persistencia.
- **`src/shared/ui/AdminLayout.jsx`**: [ACTUALIZADO] Actualizar menú lateral con el switch de tema y secciones administrativas intuitivas.
- **`src/features/CorporateView/components/AdminCMSReportsModal.jsx`**: [NUEVO] Módulo CMS interactivo de los 8 reportes con descarga a Excel (CSV) e impresión de planilla RRHH.
- **`src/features/CorporateView/pages/SuperAdminPage.jsx`**: [ACTUALIZADO] Integrar el nuevo centro de reportes CMS administrativos.
