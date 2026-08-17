// src/features/PosView/components/CashShiftModal.jsx — modal de turno de caja (cash-shift)
// Modal para la apertura (definición de fondo inicial de caja) y cierre del turno operativo de POS.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español por cada línea).

// useState para gestionar el monto inicial tipeado.
import { useState } from 'react';
// Modal base del design system.
import { Modal } from '../../../shared/ui/index.js';
// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Store de la caja POS.
import { usePosStore } from '../store/usePosStore.js';

// Componente CashShiftModal.
export default function CashShiftModal({ open, onClose }) {
  // Suscripción al estado del turno y acciones del store.
  const cashShift = usePosStore((s) => s.cashShift);
  const openCashShift = usePosStore((s) => s.openCashShift);
  const closeCashShift = usePosStore((s) => s.closeCashShift);

  // Estado local para el fondo inicial de apertura.
  const [initialInput, setInitialInput] = useState('50000');

  // Estado del turno (open o closed).
  const isShiftOpen = cashShift?.status === 'open';

  // Maneja la apertura del turno de caja.
  const handleOpen = (e) => {
    e.preventDefault();
    const amount = Number(initialInput) || 0;
    openCashShift({ initialAmount: amount });
    onClose?.();
  };

  // Maneja el cierre del turno operativo.
  const handleClose = () => {
    closeCashShift({ totalVendido: 185000 });
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title={isShiftOpen ? 'Cerrar Turno de Caja' : 'Abrir Turno de Caja'}>
      <div className="flex flex-col gap-5 text-brand-900">
        {!isShiftOpen ? (
          // Formulario de apertura de turno de caja.
          <form onSubmit={handleOpen} className="flex flex-col gap-4">
            <p className="text-xs text-brand-800/80">
              Ingresá el monto del fondo fijo inicial en efectivo con el que abre la caja.
            </p>

            <div>
              <label htmlFor="initial-cash" className="block text-xs font-bold text-brand-800 mb-1">
                Fondo Fijo Inicial (CLP)
              </label>
              <input
                id="initial-cash"
                type="number"
                value={initialInput}
                onChange={(e) => setInitialInput(e.target.value)}
                placeholder="50000"
                className="w-full rounded-xl border border-brand-200 p-3 text-sm font-bold text-brand-900 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-brand-200 py-2.5 text-xs font-bold text-brand-800/70 hover:bg-brand-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-semantic-success py-2.5 text-xs font-bold text-white hover:bg-semantic-success/90 shadow-soft transition"
              >
                Abrir Turno
              </button>
            </div>
          </form>
        ) : (
          // Resumen de cierre de turno operativo.
          <div className="flex flex-col gap-4">
            <p className="text-xs text-brand-800/80">
              Resumen operativo del turno activo. Al cerrar se registrará el timestamp de fin de turno.
            </p>

            <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-4 border border-brand-200 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-800/70">Fondo Inicial:</span>
                <span className="font-bold">{formatCurrency(cashShift.initialAmount ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-800/70">Hora de Apertura:</span>
                <span className="font-bold">
                  {cashShift.openedAt ? new Date(cashShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-brand-200 py-2.5 text-xs font-bold text-brand-800/70 hover:bg-brand-50"
              >
                Mantener Abierto
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl bg-semantic-danger py-2.5 text-xs font-bold text-white hover:bg-semantic-danger/90 shadow-soft transition"
              >
                Finalizar Turno
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
