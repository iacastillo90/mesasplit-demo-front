// src/shared/ui/Toast.jsx — notificación flotante snackbar (task 2.3)
// Token-only: aviso breve con variantes semánticas (spec design-tokens,
// escenario "Toast shows success and danger variants"). Sin lógica de dominio:
// el estado de visibilidad/auto-cierre lo maneja el consumidor (slice/store).

// Mapa de variantes semánticas → clases de fondo y texto (tokens).
const VARIANT_CLASSES = {
  // Éxito: verde semántico (pago ok, plato listo).
  success: 'bg-semantic-success text-white',
  // Error/seguridad: rojo semántico (alergias, fallo crítico).
  danger: 'bg-semantic-danger text-white',
};

// Toast: aviso flotante fijo abajo al centro. Props: variant, message, onClose.
// onClose es opcional: si no se pasa, el toast es solo informativo (sin botón).
export default function Toast({ variant = 'success', message = '', onClose }) {
  // Compone el estilo del contenedor con la variante elegida.
  const containerClasses = `pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 shadow-soft ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.success}`;
  return (
    // Contenedor fijo que no roba clicks al resto de la UI (pointer-events-none).
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      {/* Panel del toast: reintroduce los eventos para poder interactuar. */}
      <div role="status" aria-live="polite" className={containerClasses}>
        {/* Indicador visual de la variante: punto de color (semántica pura). */}
        <span aria-hidden="true" className="text-base leading-none">
          {variant === 'success' ? '✓' : '✕'}
        </span>
        {/* Mensaje del aviso en texto normal legible sobre el fondo coloreado. */}
        <p className="flex-1 text-sm font-medium">{message}</p>
        {/* Cierre manual: solo si el consumidor provee el handler (opcional). */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar aviso"
            className="rounded-full p-1 text-current/80 hover:bg-white/20"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
