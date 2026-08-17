// src/shared/ui/index.js — barrel de src/shared/ui
// Exporta los componentes base en un solo punto para imports limpios:
//   import { Button, Badge, Modal, Toast } from '@/shared/ui'
// Convención FSD: los slices importan la UI desde el barrel, nunca sueltos.

// Re-exporta el botón base (variantes primary/secondary/danger/ghost).
export { default as Button } from './Button.jsx';
// Re-exporta la etiqueta de estado semántica.
export { default as Badge } from './Badge.jsx';
// Re-exporta el modal tipo bottom-sheet.
export { default as Modal } from './Modal.jsx';
// Re-exporta la notificación flotante (success/danger).
export { default as Toast } from './Toast.jsx';
// Re-exporta la cabecera universal con menú hamburguesa.
export { default as AppHeader } from './AppHeader.jsx';
// Re-exporta el pie de página universal.
export { default as AppFooter } from './AppFooter.jsx';
