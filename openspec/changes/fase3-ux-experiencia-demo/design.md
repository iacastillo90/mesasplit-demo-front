# Design: fase3-ux-experiencia-demo — Diseño Técnico y Arquitectura de UX

## Arquitectura de Componentes

### 1. Hub de Simulación Demo (`DemoControlBar.jsx`)
- **Ubicación**: `src/shared/ui/DemoControlBar.jsx`.
- **Integración**: Montado en `src/shared/ui/AdminLayout.jsx` y `src/shared/ui/AppHeader.jsx` o en la raíz de `App.jsx`.
- **Estado**: Lee y ejecuta dispatchers de `useClientStore`, `useKdsStore`, `useSplitStore` y emite eventos en `useRealtimeBus`.

### 2. Sincronización Inter-Vistas & Stepper Tracker
- **Ubicación**:
  - `src/features/WaiterView/components/SosAlertToast.jsx`: Toast especial con animación CSS pulsante y sonido web audio synth opcional.
  - `src/features/ClientView/components/OrderTrackingBanner.jsx`: Refactorizado con componente `StepperProgress` de 4 nodos.
  - `src/shared/ui/Toast.jsx`: Soporte para prop `onUndo` que renderiza un botón "Deshacer" dentro del snackbar.

### 3. Mejores Prácticas Split Bill & Propina
- **Ubicación**:
  - `src/features/ClientView/components/GroupSplitProgressBar.jsx`: Componente visual de barra de progreso con gradiente y porcentaje.
  - `src/features/ClientView/components/BillSplitterModal.jsx`: Integración de slider de propinas y botón de compartir WhatsApp.

### 4. Personalización del Menú & Filtros Dieta
- **Ubicación**:
  - `src/features/ClientView/components/MenuFilterPills.jsx`: Barra de chips horizontales responsivos.
  - `src/features/ClientView/components/ItemCustomizerModal.jsx`: Modal bottom-sheet con radio-buttons y checkboxes de opciones de cocina.

### 5. Atajos de Teclado & Ergonomía Operativa
- **Ubicación**:
  - `src/hooks/useKeyboardShortcuts.js`: Hook personalizado para vincular eventos `keydown` globales.
  - `src/shared/ui/KeyboardShortcutsBadge.jsx`: Badge indicador estilizado estilo KBD (`<kbd class="px-1.5 py-0.5 bg-slate-200 text-xs rounded">F2</kbd>`).
