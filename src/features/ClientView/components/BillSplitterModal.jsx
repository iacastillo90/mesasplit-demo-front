// src/features/ClientView/components/BillSplitterModal.jsx — modal de división de cuentas (account-split)
// Bottom-sheet interactivo en la Mesa Virtual con progreso de pago de grupo, selector dinámico de propinas y compartir WhatsApp.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

import { useState } from 'react';
// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Modal UI.
import { Modal } from '../../../shared/ui/index.js';
// Store de división de cuenta.
import { useSplitStore } from '../store/useSplitStore.js';
// Barra de progreso de pago colectivo.
import GroupSplitProgressBar from './GroupSplitProgressBar.jsx';

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

  // Estado local de porcentaje de propina sugerida (0%, 10%, 15%, 20%). Default: 10%.
  const [tipPercent, setTipPercent] = useState(10);
  // Estado local para aviso de enlace copiado al portapapeles.
  const [copiedLink, setCopiedLink] = useState(false);

  // Calcula el monto de propina e importe total acumulado con propina.
  const tipAmount = Math.round((cartTotal * tipPercent) / 100);
  const totalWithTip = cartTotal + tipAmount;

  // Función para compartir el link/QR de pago de la mesa por WhatsApp o copiar al portapapeles.
  const handleShareWhatsApp = () => {
    const message = `📱 ¡Hola! Aquí está el enlace para dividir la cuenta de la Mesa 4 en MesaSplit por un total de ${formatCurrency(
      totalWithTip
    )}: https://mesasplit.app/cliente?table=4`;

    // Si el navegador permite compartir de forma nativa o WhatsApp.
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Copia también al portapapeles como respaldo.
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    // Modal de diálogo envolvente para la división de cuenta.
    <Modal open={open} onClose={onClose} title="Dividir Cuenta de Mesa">
      <div className="flex flex-col gap-5 text-brand-900">
        {/* Barra de progreso colectivo del pago de la mesa */}
        <GroupSplitProgressBar totalAmount={totalWithTip} guests={guests} />

        {/* Resumen del total de la mesa y desglose con propina */}
        <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-4 border border-brand-200">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-800/80">
            <span>Subtotal Consumo:</span>
            <span className="font-bold text-brand-900">{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-brand-800/80">
            <span>Propina ({tipPercent}%):</span>
            <span className="font-bold text-emerald-600">+{formatCurrency(tipAmount)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-brand-200/60">
            <span className="text-xs font-extrabold text-brand-900">Total con Propina:</span>
            <span className="text-lg font-black text-brand-900">{formatCurrency(totalWithTip)}</span>
          </div>
        </div>

        {/* Selector interactivo de propina sugerida */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-brand-800">Propina Sugerida para Garzón</label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setTipPercent(pct)}
                className={`rounded-xl py-1.5 text-xs font-black transition border ${
                  tipPercent === pct
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft'
                    : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50'
                }`}
              >
                {pct === 0 ? 'Sin Propina' : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Pestañas de modos de división de cuenta */}
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

        {/* Selector de número de comensales si el modo es equitativo o personalizado */}
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

        {/* Lista de cuotas divididas por comensal */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-800/70">Desglose por Comensal</h4>

          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className={`flex items-center justify-between rounded-2xl p-3 border transition ${
                  guest.status === 'paid'
                    ? 'bg-emerald-50 border-emerald-200 opacity-70'
                    : 'bg-white border-brand-200 shadow-soft'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-brand-900">{guest.name}</p>
                  <p className="text-xs font-extrabold text-brand-500">{formatCurrency(guest.amount)}</p>
                </div>

                {/* Botón de pago parcial por comensal */}
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

        {/* Botón para compartir división por WhatsApp */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <span>💬 Compartir Enlace de Pago por WhatsApp</span>
          </button>
          {copiedLink && (
            <span className="text-[11px] text-center text-emerald-600 font-bold">
              ✓ ¡Enlace copiado al portapapeles!
            </span>
          )}
        </div>

        {/* Pie del modal con botón de cierre */}
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
