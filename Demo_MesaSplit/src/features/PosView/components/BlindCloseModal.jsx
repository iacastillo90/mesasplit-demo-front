// src/features/PosView/components/BlindCloseModal.jsx — modal de Cierre Ciego de arqueo de caja (pos-cashier)
// Auditoría de cierre de turno de caja: oculta el total esperado hasta ingresar el dinero físico contado, calculando descuadre de arqueo.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// useState de React.
import { useState } from 'react';
// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Modal UI.
import { Modal } from '../../../shared/ui/index.js';

// Componente del Cierre Ciego de Caja.
export default function BlindCloseModal({ open, onClose, expectedCash, onSubmitClose }) {
  // Estado local para el conteo de dinero físico ingresado por el cajero.
  const [cashCount, setCashCount] = useState('');
  // Flag que revela los totales esperados tras ingresar el físico.
  const [revealed, setRevealed] = useState(false);
  // Mensaje de estado al finalizar el arqueo.
  const [successMsg, setSuccessMsg] = useState('');

  // Manejador del cálculo del arqueo ciego.
  const handleCalculate = (e) => {
    e.preventDefault();
    const countVal = Number(cashCount);
    // Revela los resultados del arqueo.
    setRevealed(true);

    // Ejecuta la acción de cierre.
    const variance = countVal - expectedCash;
    onSubmitClose({ physicalCount: countVal, expectedCash, variance });
    setSuccessMsg('Turno de caja cerrado exitosamente');
  };

  return (
    // Modal de diálogo envolvente para el arqueo ciego de la caja.
    <Modal open={open} onClose={onClose} title="Cierre Ciego de Caja — Arqueo de Turno">
      <form onSubmit={handleCalculate} className="flex flex-col gap-4 text-brand-900">
        <p className="text-xs text-brand-800/80">
          Cierre Ciego: ingresa la cantidad exacta de efectivo físico contado en la caja antes de revelar el total esperado por el sistema.
        </p>

        {/* Input del dinero físico contado en la caja. */}
        <div className="flex flex-col gap-1">
          <label htmlFor="cash-count-input" className="text-xs font-bold text-brand-900">
            Efectivo contado en caja
          </label>
          <input
            id="cash-count-input"
            type="number"
            value={cashCount}
            onChange={(e) => setCashCount(e.target.value)}
            placeholder="Efectivo contado (ej. 150000)"
            required
            className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold border border-brand-300 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Totales revelados tras el cálculo del arqueo ciego. */}
        {revealed && (
          <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-4 border border-brand-200">
            <div className="flex justify-between text-xs font-medium">
              <span>Efectivo Esperado (Sistema):</span>
              <span className="font-bold">{formatCurrency(expectedCash)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span>Efectivo Físico Contado:</span>
              <span className="font-bold">{formatCurrency(Number(cashCount))}</span>
            </div>
            {/* Diferencia o descuadre de arqueo. */}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-brand-200 text-semantic-urgent">
              <span>Diferencia Arqueo:</span>
              <span>{formatCurrency(Number(cashCount) - expectedCash)}</span>
            </div>
          </div>
        )}

        {/* Mensaje de confirmación exitosa de cierre. */}
        {successMsg && (
          <p className="rounded-xl bg-semantic-success/10 p-3 text-center text-xs font-bold text-semantic-success border border-semantic-success/30">
            ✅ {successMsg}
          </p>
        )}

        {/* Botones de acción del cierre. */}
        <div className="flex justify-end gap-2 pt-2 border-t border-brand-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-brand-800 hover:bg-brand-100"
          >
            Cerrar Ventana
          </button>
          {!successMsg && (
            <button
              type="submit"
              className="rounded-xl bg-semantic-danger px-5 py-2 text-xs font-bold text-white transition hover:bg-semantic-danger/90 active:scale-95 shadow-soft"
            >
              Finalizar Arqueo
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
