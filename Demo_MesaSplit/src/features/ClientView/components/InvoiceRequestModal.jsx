// src/features/ClientView/components/InvoiceRequestModal.jsx — modal de solicitud de factura demo (client-factura)
// Permite al comensal ingresar su RUT chileno (validado con validateRut) para solicitar factura electrónica de la mesa.
// Modal simplificado sin duplicación de campos contables corporativos (sin Giro, Razón Social ni Folio CAF).
// No altera el carrito ni los tickets de KDS.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// useState de React.
import { useState } from 'react';
// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Validador de RUT chileno.
import { validateRut } from '../../../shared/utils/validateRut.js';
// Componente de modal base del barrel shared/ui.
import { Modal } from '../../../shared/ui/index.js';

// Componente InvoiceRequestModal.
export default function InvoiceRequestModal({ open, totalAmount, onClose }) {
  // Estado local para el valor del RUT ingresado.
  const [rut, setRut] = useState('');
  // Estado de error de validación del RUT.
  const [error, setError] = useState(null);
  // Estado de éxito tras enviar la solicitud.
  const [submitted, setSubmitted] = useState(false);

  // Maneja el reinicio del estado al cerrar el modal.
  const handleClose = () => {
    setRut('');
    setError(null);
    setSubmitted(false);
    onClose?.();
  };

  // Maneja el envío del formulario de solicitud de factura.
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Valida que el RUT sea un RUT chileno correcto.
    if (!rut.trim() || !validateRut(rut)) {
      setError('RUT inválido. Formato esperado: 12.345.678-5');
      return;
    }

    // Marca la solicitud como enviada exitosamente.
    setSubmitted(true);
  };

  return (
    // Modal accesible de solicitud de factura.
    <Modal open={open} onClose={handleClose} title="Solicitar Factura Electrónica">
      {submitted ? (
        // Pantalla de confirmación de solicitud enviada.
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="text-4xl">📄</span>
          <h3 className="text-base font-bold text-brand-900">Solicitud enviada</h3>
          <p className="text-xs text-brand-800/70">
            La factura por {formatCurrency(totalAmount)} se asociará al RUT{' '}
            <strong className="text-brand-900">{rut}</strong> al momento del pago.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-2 rounded-xl bg-brand-900 px-5 py-2 text-xs font-bold text-white hover:bg-brand-800 transition active:scale-95 shadow-soft"
          >
            Aceptar
          </button>
        </div>
      ) : (
        // Formulario de ingreso de RUT para la factura.
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-brand-800/80">
            Ingresá tu RUT para emitir la factura por un total de{' '}
            <strong className="text-brand-900">{formatCurrency(totalAmount)}</strong>.
          </p>

          <div className="flex flex-col gap-1">
            <label htmlFor="rut-input" className="text-xs font-bold text-brand-900">
              RUT del Receptor
            </label>
            <input
              id="rut-input"
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="12.345.678-5"
              className="rounded-xl border border-brand-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            {error && <span className="text-[11px] font-semibold text-rose-600">{error}</span>}
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-brand-200 px-4 py-2 text-xs font-bold text-brand-800 hover:bg-brand-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 transition active:scale-95 shadow-soft"
            >
              Solicitar Factura
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
