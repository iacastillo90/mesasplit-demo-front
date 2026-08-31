// src/shared/ui/Toast.jsx — notificación flotante snackbar con soporte para "Deshacer" (task 2.3 + undo-pattern)
// Token-only: aviso breve con variantes semánticas (success, danger) y opción opcional de deshacer acción (onUndo).
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea en español).

// Mapa de variantes semánticas → clases de fondo y texto.
const VARIANT_CLASSES = {
  // Éxito: verde semántico (pago ok, plato listo).
  success: 'bg-[#10B981] text-white',
  // Error/seguridad: rojo semántico (alergias, fallo crítico).
  danger: 'bg-[#EF4444] text-white',
};

// Toast: aviso flotante al centro/inferior de la pantalla. Props: variant, message, onClose, onUndo, undoLabel.
export default function Toast({
  variant = 'success',
  message = '',
  onClose,
  onUndo,
  undoLabel = 'Deshacer',
}) {
  // Compone el estilo del contenedor con la variante elegida.
  const containerClasses = `pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl p-4 font-bold text-sm shadow-2xl ${
    VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.success
  }`;

  return (
    // Contenedor centrado en pantalla completa con telón translúcido.
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-brand-950/20 backdrop-blur-xs">
      {/* Panel del toast: reintroduce los eventos para poder interactuar. */}
      <div role="status" aria-live="polite" className={containerClasses}>
        {/* Indicador visual de la variante: punto de color (semántica pura). */}
        <span aria-hidden="true" className="text-xl leading-none">
          {variant === 'success' ? '✨' : '⚠️'}
        </span>
        {/* Mensaje del aviso en texto normal legible sobre el fondo coloreado. */}
        <p className="flex-1 text-sm font-bold leading-tight">{message}</p>

        {/* Botón de Deshacer (Undo): solo si se especifica la prop onUndo */}
        {onUndo && (
          <button
            type="button"
            onClick={() => {
              onUndo();
              if (onClose) onClose();
            }}
            className="rounded-xl bg-white text-brand-900 px-3 py-1.5 text-xs font-black hover:bg-amber-100 shadow-md transition-all active:scale-95 shrink-0"
          >
            ↩️ {undoLabel}
          </button>
        )}

        {/* Cierre manual: solo si el consumidor provee el handler. */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar aviso"
            className="rounded-xl bg-white/20 p-1 text-current hover:bg-white/30 shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
