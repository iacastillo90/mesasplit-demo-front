// src/features/RadarView/components/DeliveryTrackingModal.jsx — Modal de live tracking de repartidor y delivery omnicanal
// Visualiza el stepper de etapas del despacho, mapa de ruta simulado y permite avanzar estados en tiempo real.
// Cumple strictly con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Modal base reutilizable.
import { Modal } from '../../../shared/ui/index.js';
// Store de delivery.
import { useDeliveryStore } from '../store/useDeliveryStore.js';
// Utility para dar formato en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';

// Componente DeliveryTrackingModal.
export default function DeliveryTrackingModal({ open, onClose }) {
  // Suscripción al store de delivery.
  const { deliveries, selectedDeliveryId, advanceDeliveryStage } = useDeliveryStore();

  // Encuentra la orden seleccionada actualmente.
  const order = deliveries.find((d) => d.id === selectedDeliveryId) || deliveries[0];

  if (!open || !order) return null;

  return (
    // Modal envolvente de tracking de despacho.
    <Modal open={open} onClose={onClose} title={`🛵 Live Tracking Delivery — ${order.id} (${order.platform})`}>
      <div className="flex flex-col gap-4 text-brand-900">
        {/* Banner con el estado activo y tiempo estimado de llegada. */}
        <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl border border-slate-700 shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">Estado Actual:</span>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>{order.stageLabel}</span>
            </h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tiempo de Llegada:</span>
            <p className="text-base font-extrabold text-emerald-400">
              {order.etaMinutes > 0 ? `~${order.etaMinutes} min` : 'Entregado ✓'}
            </p>
          </div>
        </div>

        {/* Stepper de 4 etapas visuales. */}
        <div className="flex items-center justify-between bg-brand-50 p-3 rounded-xl border border-brand-200 text-[11px] font-bold text-center">
          <span className={order.routeProgressPct >= 10 ? 'text-brand-900 font-extrabold' : 'text-brand-300'}>
            1. Recibido
          </span>
          <span className="text-brand-300">➔</span>
          <span className={order.routeProgressPct >= 30 ? 'text-brand-900 font-extrabold' : 'text-brand-300'}>
            2. Cocina
          </span>
          <span className="text-brand-300">➔</span>
          <span className={order.routeProgressPct >= 50 ? 'text-brand-900 font-extrabold' : 'text-brand-300'}>
            3. Repartidor
          </span>
          <span className="text-brand-300">➔</span>
          <span className={order.routeProgressPct >= 80 ? 'text-emerald-700 font-extrabold' : 'text-brand-300'}>
            4. En Camino
          </span>
        </div>

        {/* Mapa visual simulado de tracking del repartidor. */}
        <div className="relative w-full h-44 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between shadow-inner">
          {/* Fondo simulado de mapa vectorial. */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Origen: Restaurante. */}
          <div className="relative z-10 flex items-center gap-2 bg-slate-900/90 text-white p-2 rounded-xl border border-slate-700 w-fit text-xs">
            <span>🍳 Rest. Providencia</span>
          </div>

          {/* Línea de ruta con indicador de avance. */}
          <div className="relative z-10 w-full bg-slate-800 h-2 rounded-full overflow-hidden my-auto">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-700"
              style={{ width: `${order.routeProgressPct}%` }}
            />
          </div>

          {/* Destino: Cliente. */}
          <div className="relative z-10 flex items-center justify-between bg-slate-900/90 text-white p-2 rounded-xl border border-slate-700 text-xs">
            <span className="truncate">🏠 {order.address}</span>
            <span className="font-bold text-sky-400">{order.customerName}</span>
          </div>
        </div>

        {/* Resumen del pedido y repartidor. */}
        <div className="flex flex-col gap-1.5 bg-white p-3.5 rounded-2xl border border-brand-200 shadow-soft text-xs">
          <div className="flex items-center justify-between border-b border-brand-200 pb-1.5">
            <span className="font-bold text-brand-900">Repartidor: {order.courierName}</span>
            <span className="font-bold text-brand-900">Total: {formatCurrency(order.total)}</span>
          </div>
          <p className="text-[11px] text-brand-800/70">
            <strong>Ítems:</strong> {order.items.join(', ')}
          </p>
        </div>

        {/* Acciones del modal. */}
        <div className="flex items-center justify-between pt-2 border-t border-brand-200">
          <button
            type="button"
            onClick={() => advanceDeliveryStage(order.id)}
            className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-bold transition shadow-soft active:scale-95"
          >
            ⚡ Avanzar Estado Despacho
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand-900 text-white px-5 py-2 text-xs font-bold hover:bg-brand-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
