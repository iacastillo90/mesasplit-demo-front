# Proposal: Fase 34 — Filtros de Dieta en 3 Hileras Visibles para Móvil (Sin Scroll Horizontal)

## Contexto y Motivación

El usuario solicita que en la vista móvil de la Mesa Virtual (`/cliente`), las opciones de filtrado rápido por dieta (`MenuFilterPills.jsx`) no requieran scroll lateral para ser vistas. Se propone disponer los 7 botones de filtro en hileras/filas multitasa (`flex-wrap`) para que los 7 botones (*Todos, Vegano, Sin Gluten, Picante, Popular, Postres, Bebidas*) estén 100% visibles de forma inmediata en 3 hileras limpias.

## Alcance del Cambio

- **`src/features/ClientView/components/MenuFilterPills.jsx`**: [ACTUALIZADO] Reemplazar el contenedor de scroll horizontal por una maquetación multitasa responsiva (`flex flex-wrap gap-2`) que organiza los botones en hileras visibles de un vistazo sin scroll lateral.
- **`src/features/ClientView/ClientOptimizations.test.jsx`**: [ACTUALIZADO] Verificar la disposición multi-hilera de los botones de filtro.
