// src/features/ClientView/components/BillSplitterModal.jsx — modal de división de cuentas (account-split)
// Bottom-sheet interactivo en la Mesa Virtual que permite dividir la cuenta en 4 modos (Completo, Iguales, Por plato, Personalizado),
// muestra las cuotas individuales calculadas por comensal y emite el evento payment.split.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Modal UI.
import { Modal } from '../../../shared/ui/index.js';
// Store de división de cuenta.
import { useSplitStore } from '../store/useSplitStore.js';

// Componente BillSplitterModal.
export default function BillSplitterModal({ open, onClose }) {
  // Suscripción al store de Zustand de división.
  const cartTotal = useSplitStore((s) => s.cartTotal);
  const guestCount = useSplitStore((s) => s.guestCount);
  const mode = useSplitStore((s) => s.mode);
  const guests = useSplitStore((s) => s.guests);

  // Acciones del store.
  const setMode = useSplitStore((s) => s.setMode);
  const setGuestCount = useSplitStore((s) => s.setGuestCount);
  const payGuest = useSplitStore((s) => s.payGuest);

  return (
    // Modal de diálogo envolvente para la división de cuenta.
    <Modal open={open} onClose={onClose} title="Dividir Cuenta de Mesa">
      <div className="flex flex-col gap-5 text-brand-900">
        {/* Resumen del total de la mesa. */}
        <div className="flex items-center justify-between rounded-2xl bg-brand-50 p-4 border border-brand-200">
          <span className="text-xs font-semibold text-brand-800/80">Total de la Mesa:</span>
          <span className="text-lg font-extrabold text-brand-900">{formatCurrency(cartTotal)}</span>
        </div>

        {/* Pestañas de modos de división de cuenta. */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-brand-800">Modo de División</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { id: 'full', label: 'Total' },
              { id: 'equal', label: 'Partes Iguales' },
              { id: 'by_item', label: 'Por Plato' },
              { id: 'custom_amount', label: 'Personalizado' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95 border ${
                  mode === m.id
                    ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                    : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de número de comensales si el modo es equitativo o personalizado. */}
        {mode !== 'full' && (
          <div className="flex items-center justify-between rounded-2xl bg-white p-3 border border-brand-200">
            <span className="text-xs font-bold text-brand-800">Número de Comensales:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuestCount(Math.max(2, guestCount - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-900 hover:bg-brand-200"
              >
                -
              </button>
              <span className="text-sm font-extrabold text-brand-900">{guestCount}</span>
              <button
                type="button"
                onClick={() => setGuestCount(guestCount + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-900 hover:bg-brand-200"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Lista de cuotas divididas por comensal. */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-800/70">
            Desglose por Comensal
          </h4>

          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className={`flex items-center justify-between rounded-2xl p-3.5 border transition ${
                  guest.status === 'paid'
                    ? 'bg-emerald-50 border-emerald-200 opacity-70'
                    : 'bg-white border-brand-200 shadow-soft'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-brand-900">{guest.name}</p>
                  <p className="text-xs font-extrabold text-brand-500">{formatCurrency(guest.amount)}</p>
                </div>

                {/* Botón de pago parcial por comensal. */}
                {guest.status === 'paid' ? (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-700">
                    ✅ Pagado
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => payGuest(guest.id)}
                    className="rounded-xl bg-semantic-success px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-semantic-success/90 active:scale-95 shadow-soft"
                  >
                    Pagar mi parte
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pie del modal con botón de cierre. */}
        <div className="flex justify-end pt-2 border-t border-brand-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand-900 px-5 py-2 text-xs font-bold text-white hover:bg-brand-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
