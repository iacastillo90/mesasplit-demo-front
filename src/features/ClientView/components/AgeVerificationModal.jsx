// src/features/ClientView/components/AgeVerificationModal.jsx — modal de verificación de mayoría de edad (client-alcohol-verification)
// Modal exigido antes de agregar un ítem alcohólico (alcoholic: true) al carrito.
// Confirmación demo (botón Soy Mayor de 18 años).
// No consulta fuentes externas de edad.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// Componente Modal del barrel shared/ui.
import { Modal } from '../../../shared/ui/index.js';

export default function AgeVerificationModal({ open, item, onConfirm, onClose }) {
  if (!open || !item) return null;

  return (
    // Modal accesible de verificación de edad.
    <Modal open={open} onClose={onClose} title="Verificación de Edad">
      <div className="flex flex-col gap-4 py-2">
        {/* Banner de advertencia de contenido alcohólico. */}
        <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 p-3 border border-amber-300 text-amber-900">
          <span className="text-2xl">🍺</span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-brand-900">{item.name}</span>
            <span className="text-[11px] text-brand-800/80">Este producto contiene alcohol (+18 años)</span>
          </div>
        </div>

        {/* Texto informativo de declaración legal. */}
        <p className="text-xs text-brand-800/80">
          Para continuar agregando esta bebida alcohólica al carrito, debés declarar que sos mayor de 18 años.
        </p>

        {/* Botones de acción. */}
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-200 px-4 py-2 text-xs font-bold text-brand-800 hover:bg-brand-100 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800 transition active:scale-95 shadow-soft"
          >
            Soy Mayor de 18 años
          </button>
        </div>
      </div>
    </Modal>
  );
}
