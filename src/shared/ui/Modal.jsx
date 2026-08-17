// src/shared/ui/Modal.jsx — modal tipo bottom-sheet (task 2.3)
// Token-only: shell visual de modal que se desliza desde abajo (mobile-first).
// Sin lógica de dominio; props: open, title, onClose y children.

// Modal: si está cerrado no renderiza nada (evita trabajo DOM innecesario).
export default function Modal({ open = false, title = '', onClose, children, className = '' }) {
  // Si open es false, retorna null: el componente no existe en el DOM.
  if (!open) return null;
  return (
    // Overlay fijo que tapa toda la pantalla; click en él cierra el modal.
    // z-50 asegura que quede por encima de cualquier otro contenido.
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/60 backdrop-blur-sm"
    >
      {/* Panel del bottom-sheet: detiene la propagación del click al overlay. */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-soft ${className}`}
      >
        {/* Cabecera del modal: título a la izquierda, botón de cierre a la derecha. */}
        <div className="mb-4 flex items-center justify-between">
          {/* Título con la tipografía fuerte de marca (texto principal). */}
          <h2 className="text-lg font-bold text-brand-900">{title}</h2>
          {/* Botón de cierre "X": dispara la misma acción que el overlay. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-900/60 hover:bg-brand-100 hover:text-brand-900"
          >
            ✕
          </button>
        </div>
        {/* Cuerpo del modal: cualquier contenido que defina el consumidor. */}
        {children}
      </div>
    </div>
  );
}
