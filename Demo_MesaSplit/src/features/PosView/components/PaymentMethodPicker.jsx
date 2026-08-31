// src/features/PosView/components/PaymentMethodPicker.jsx — selector multimedio de pago y calculadora de vuelto (pos-cashier)
// Permite al cajero seleccionar entre Efectivo, Tarjeta, Transferencia y Mixto, calculando el vuelto automáticamente en efectivo.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';

import KeyboardShortcutsBadge from '../../../shared/ui/KeyboardShortcutsBadge.jsx';

// Componente del selector multimedio de pagos.
export default function PaymentMethodPicker({
  selectedMethod,
  onSelectMethod,
  totalAmount,
  tenderedAmount,
  onChangeTendered,
  changeAmount,
}) {
  return (
    // Sección contenedora del panel de métodos de pago.
    <section aria-label="Métodos de Pago" className="flex flex-col gap-4">
      {/* Título de la sección con badge de atajo [F2] */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-800/70">
          1. Selección de Método de Pago
        </h3>
        <KeyboardShortcutsBadge shortcutKey="F2" label="Atajo Cobro:" />
      </div>


      {/* Botones de radio/pestañas para seleccionar el medio de pago. */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { id: 'efectivo', label: 'Efectivo', icon: '💵' },
          { id: 'tarjeta', label: 'Tarjeta', icon: '💳' },
          { id: 'transferencia', label: 'Transferencia', icon: '🏦' },
          { id: 'mixto', label: 'Mixto', icon: '🔀' },
        ].map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelectMethod(method.id)}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl p-3 text-xs font-bold transition active:scale-95 border ${
              selectedMethod === method.id
                ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50'
            }`}
          >
            <span className="text-lg">{method.icon}</span>
            <span>{method.label}</span>
          </button>
        ))}
      </div>

      {/* Sección especial de calculadora de vuelto cuando se selecciona Efectivo o Mixto. */}
      {(selectedMethod === 'efectivo' || selectedMethod === 'mixto') && (
        <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 border border-brand-200">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-900">
            <span>Total a Cobrar:</span>
            <span className="text-sm font-bold text-brand-900">{formatCurrency(totalAmount)}</span>
          </div>

          {/* Campo de entrada para el monto en efectivo entregado por el cliente. */}
          <div className="flex flex-col gap-1">
            <label htmlFor="tendered-amount" className="text-xs font-medium text-brand-800/80">
              Monto recibido del cliente
            </label>
            <input
              id="tendered-amount"
              type="number"
              value={tenderedAmount || ''}
              onChange={(e) => onChangeTendered(Number(e.target.value))}
              placeholder="Monto recibido (ej. 25000)"
              className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-900 border border-brand-300 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Visualización destacada del Vuelto a entregar al cliente. */}
          <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-4 py-3 border border-emerald-500/30 text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wide">Vuelto:</span>
            <span className="text-lg font-extrabold">{formatCurrency(changeAmount > 0 ? changeAmount : 0)}</span>
          </div>
        </div>
      )}
    </section>
  );
}
