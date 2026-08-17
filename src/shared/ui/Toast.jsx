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

// Toast: aviso flotante al centro de la pantalla. Props: variant, message, onClose.
export default function Toast({ variant = 'success', message = '', onClose }) {
  // Compone el estilo del contenedor con la variante elegida.
  const containerClasses = `pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl p-4 font-bold text-sm shadow-2xl ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.success}`;
  return (
    // Contenedor centrado en pantalla completa con telón translúcido.
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-brand-950/40 backdrop-blur-xs p-4">
      {/* Panel del toast: reintroduce los eventos para poder interactuar. */}
      <div role="status" aria-live="polite" className={containerClasses}>
        {/* Indicador visual de la variante: punto de color (semántica pura). */}
        <span aria-hidden="true" className="text-xl leading-none">
          {variant === 'success' ? '✨' : '⚠️'}
        </span>
        {/* Mensaje del aviso en texto normal legible sobre el fondo coloreado. */}
        <p className="flex-1 text-sm font-bold">{message}</p>
        {/* Cierre manual: solo si el consumidor provee el handler (opcional). */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar aviso"
            className="rounded-xl bg-white/20 p-1 text-current hover:bg-white/30"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
