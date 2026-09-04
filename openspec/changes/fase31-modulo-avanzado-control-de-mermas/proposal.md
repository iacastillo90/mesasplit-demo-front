# Proposal: Fase 31 — Módulo Avanzado de Control de Mermas y Desperdicios Gastronómicos

## Contexto y Motivación

El usuario solicita perfeccionar y mejorar la vista de **Control de Mermas** (`MermaBar.jsx`) para culminar el diseño del área de administración `/admin`. Se requiere transformar la barra rápida en un panel de control avanzado con KPIs de pérdidas en CLP ($), desglose de causas de merma (*Vencimiento, Error de Cocina, Deterioro Refrigeración, Rotura*), categorización por áreas (*Cocina, Bar, Bodega*) y exportación en formato Excel (CSV) para la contabilidad del restaurante.

## Alcance del Cambio

- **`src/features/RadarView/components/MermaBar.jsx`**: [ACTUALIZADO] Rediseñar el componente convirtiéndolo en un centro de gestión con:
  - **KPIs Superiores**: Total Pérdida en CLP ($), Causa Principal, % sobre Ventas y Registro Crítico.
  - **Formulario Inteligente de Registro**: Selector de insumo/plato, causa codificada, área del local (Cocina, Bar, Bodega) e importe en CLP ($).
  - **Tabla CMS de Historial de Mermas**: Desglose con badges por causa, responsable, hora y estado contable.
  - **📥 Botón "Exportar Mermas (Excel CSV)"** con la función `exportToCsv`.
  - **Soporte completo de Modo Claro ☀️ y Oscuro 🌙** con `useThemeStore`.
- **`src/features/RadarView/components/MermaBar.test.jsx`**: [NUEVO/ACTUALIZADO] Crear/actualizar pruebas unitarias para validar la inserción de mermas categorizadas, KPIs y exportación a Excel.
