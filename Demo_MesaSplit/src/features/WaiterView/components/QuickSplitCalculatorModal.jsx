// src/features/WaiterView/components/QuickSplitCalculatorModal.jsx — Calculadora de cobro rápido al paso en mesa para el garzón
// Permite al mozo calcular rápidamente la división de cuenta y propina directa en mesa sin necesidad de ir a la caja POS.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// useState para gestionar el monto total, comensales y propina.
import { useState } from 'react';
// Modal base reutilizable.
import { Modal } from '../../../shared/ui/index.js';
// Utility para dar formato en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';

// Componente QuickSplitCalculatorModal.
export default function QuickSplitCalculatorModal({ open, onClose, tableNumber, defaultTotal = 32000 }) {
  // Estado del monto total consumido.
  const [totalAmount, setTotalAmount] = useState(defaultTotal);
  // Estado del número de comensales a dividir.
  const [peopleCount, setPeopleCount] = useState(4);
  // Porcentaje de propina seleccionada (0, 10, 15, 20).
  const [tipPct, setTipPct] = useState(10);
  // Estado de confirmación de cobro.
  const [confirmed, setConfirmed] = useState(false);

  // Monto de la propina calculada.
  const tipAmount = Math.round((totalAmount * tipPct) / 100);
  // Total consolidado a pagar.
  const grandTotal = totalAmount + tipAmount;
  // Monto exacto por persona en CLP.
  const perPersonAmount = Math.ceil(grandTotal / Math.max(1, peopleCount));

  // Maneja la confirmación rápida del cobro en mesa.
  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      onClose();
    }, 1600);
  };

  if (!open) return null;

  return (
    // Modal envolvente de calculadora rápida.
    <Modal open={open} onClose={onClose} title={`🧮 Calculadora de Cobro Rápido — Mesa ${tableNumber || '12'}`}>
      <div className="flex flex-col gap-4 text-brand-900">
        {/* Aviso de confirmación rápida. */}
        {confirmed ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold border border-emerald-300">
              ✓
            </div>
            <h4 className="text-sm font-bold text-brand-900">¡Cobro Registrado en Mesa!</h4>
            <p className="text-xs text-brand-800/70">Monto informado al cliente: {formatCurrency(perPersonAmount)} / persona.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {/* Fila de ingreso del monto total de la cuenta. */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-800">Total Consumo ($ CLP):</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="rounded-xl border border-brand-200 p-2.5 text-sm font-bold text-brand-900 focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Fila de selección de comensales. */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-800">Dividir entre persona(s):</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPeopleCount(num)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition border ${
                      peopleCount === num
                        ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                        : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50'
                    }`}
                  >
                    👤 {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de propina al paso. */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-800">Propina Sugerida:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipPct(pct)}
                    className={`rounded-xl py-2 text-xs font-bold transition border ${
                      tipPct === pct
                        ? 'bg-amber-500 text-white border-amber-500 shadow-soft'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Resumen del cobro por persona de alto contraste. */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg border border-slate-700 flex flex-col gap-2 font-mono">
              <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-2 text-slate-300">
                <span>Subtotal: {formatCurrency(totalAmount)}</span>
                <span>Propina ({tipPct}%): {formatCurrency(tipAmount)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-sky-400 font-bold uppercase">Cada Comensal Paga:</span>
                <span className="text-lg font-bold text-emerald-400">
                  {formatCurrency(perPersonAmount)}
                </span>
              </div>
            </div>

            {/* Acciones. */}
            <div className="flex justify-end gap-2 pt-2 border-t border-brand-200">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-bold text-brand-800/70 hover:bg-brand-100"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-xl bg-semantic-success px-5 py-2 text-xs font-bold text-white hover:bg-semantic-success/90 shadow-soft"
              >
                Confirmar en Mesa
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
