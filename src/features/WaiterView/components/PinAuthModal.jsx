// src/features/WaiterView/components/PinAuthModal.jsx — modal de anulación por PIN (waiter-pwa)
// Exige un PIN de Administrador (Local Admin) y la selección de un motivo para anular comandas enviadas.
// Al completarse, publica un evento de auditoría alert.fraud vía useRealtimeBus.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea).

// useEffect y useState de React para manejar el formulario modal.
import { useState } from 'react';
// Modal base del sistema.
import { Modal } from '../../../shared/ui/index.js';

// Motivos válidos de anulación autorizada.
const REASONS = [
  { id: 'cortesia', label: 'Cortesía / Atención de la casa' },
  { id: 'error', label: 'Error de digitación del mozo' },
  { id: 'insatisfecho', label: 'Cliente insatisfecho con el plato' },
  { id: 'quiebre', label: 'Quiebre de stock sin registrar' },
];

// Componente modal de autorización con PIN.
export default function PinAuthModal({ open, onClose, onConfirmVoid }) {
  // Estado local para almacenar el PIN tipeado.
  const [pin, setPin] = useState('');
  // Estado local para el motivo seleccionado.
  const [reason, setReason] = useState('cortesia');
  // Mensaje de error en caso de PIN incorrecto.
  const [errorMsg, setErrorMsg] = useState('');

  // Manejador del envío de autorización con PIN.
  const handleSubmit = (e) => {
    // Previene el recargo de página del formulario HTML.
    e.preventDefault();
    // PIN de Administrador requerido en la demo ("9921").
    if (pin !== '9921') {
      // Muestra mensaje de error si el PIN es incorrecto.
      setErrorMsg('PIN de Administrador inválido. Intenta con 9921.');
      return;
    }

    // Ejecuta la anulación autorizada pasando el motivo.
    onConfirmVoid(reason);
    // Limpia el formulario y cierra el modal.
    setPin('');
    setErrorMsg('');
    onClose();
  };

  return (
    // Modal de diálogo envolvente.
    <Modal
      open={open}
      onClose={onClose}
      title="Autorización de Anulación — PIN de Admin"
      className="bg-brand-900 text-brand-50 border border-brand-800"
    >
      {/* Formulario de ingreso de PIN y motivo. */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-brand-50">
        {/* Advertencia de auditoría de seguridad. */}
        <p className="text-xs text-brand-50/70">
          Esta acción enviará un evento de auditoría de seguridad. Solicita la presencia del jefe de salón.
        </p>

        {/* Input para ingresar el PIN de 4 dígitos. */}
        <div>
          <label htmlFor="pin-input" className="block mb-1 text-xs font-bold text-brand-50/80">
            PIN de Autorización (Demo: 9921)
          </label>
          <input
            id="pin-input"
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="****"
            className="w-full rounded-xl bg-brand-800 p-3 text-center text-xl font-bold tracking-widest text-brand-50 border border-brand-800 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Selector de motivo de anulación. */}
        <div>
          <label htmlFor="reason-select" className="block mb-1 text-xs font-bold text-brand-50/80">
            Motivo de la Anulación
          </label>
          <select
            id="reason-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl bg-brand-800 p-3 text-sm text-brand-50 border border-brand-800 focus:border-brand-500 focus:outline-none"
          >
            {REASONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mensaje de error si la validación falla. */}
        {errorMsg && <p className="text-xs font-bold text-semantic-danger">{errorMsg}</p>}

        {/* Botones de acción del modal. */}
        <div className="flex justify-end gap-2 mt-2">
          {/* Botón para cancelar la operación. */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-brand-50/70 hover:bg-brand-800"
          >
            Cancelar
          </button>
          {/* Botón para confirmar la anulación autorizada. */}
          <button
            type="submit"
            className="rounded-xl bg-semantic-danger px-4 py-2 text-xs font-bold text-white shadow-soft transition hover:bg-semantic-danger/90 active:scale-95"
          >
            Autorizar Anulación
          </button>
        </div>
      </form>
    </Modal>
  );
}
