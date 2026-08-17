// src/features/RadarView/components/DeliveryColumn.jsx — tarjetas del canal Delivery Omnicanal (local-admin-radar + modo-hora-punta)
// Renderiza el tablero de comandas virtuales provenientes de plataformas de Delivery (Uber Eats, Rappi, PedidosYa).
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea).

// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';

// Colores e íconos distintivos por plataforma omnicanal.
const PLATFORMS = {
  ubereats: { name: 'Uber Eats', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', logo: '🟢' },
  rappi: { name: 'Rappi', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', logo: '🟠' },
  pedidosya: { name: 'PedidosYa', badge: 'bg-red-500/20 text-red-400 border-red-500/30', logo: '🔴' },
};

// Componente de la sección Delivery Omnicanal.
export default function DeliveryColumn({ deliveryOrders = [], focusMode = false }) {
  // En Modo Hora Punta, filtra pedidos pendientes de despacho.
  const activeOrders = focusMode
    ? deliveryOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
    : deliveryOrders;

  return (
    // Sección contenedora con accesibilidad.
    <section aria-label="Delivery Omnicanal" className="flex flex-col gap-3">
      {/* Título de la sección de comandas de delivery online. */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-500">
          Delivery Omnicanal ({activeOrders.length} activas)
        </h2>
        {focusMode && (
          <span className="rounded-full bg-semantic-urgent/20 border border-semantic-urgent/40 px-2.5 py-0.5 text-[11px] font-bold text-semantic-urgent">
            Prioridad Despacho
          </span>
        )}
      </div>

      {/* Grilla responsiva de tarjetas de pedidos virtuales. */}
      <div className="grid grid-cols-1 gap-3">
        {activeOrders.map((order) => {
          // Determina el branding visual de la plataforma.
          const platform = PLATFORMS[order.platform] ?? PLATFORMS.ubereats;

          return (
            // Tarjeta individual de comanda de delivery.
            <div
              key={order.id}
              className={`flex flex-col justify-between rounded-2xl bg-brand-900 p-4 border text-brand-50 shadow-soft transition hover:border-brand-500 ${
                focusMode ? 'border-semantic-urgent/50 bg-brand-900/90 shadow-lg' : 'border-brand-800'
              }`}
            >
              {/* Cabecera de la tarjeta: logo de la app y estado. */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${platform.badge}`}>
                  {platform.logo} {platform.name}
                </span>
                <span className="text-xs font-semibold text-brand-50/60">
                  {order.elapsedMinutes} min
                </span>
              </div>

              {/* Detalle del cliente y total del pedido. */}
              <div className="my-3">
                <p className="font-bold text-brand-50">{order.customerName}</p>
                <p className="text-xs text-brand-50/70">{order.itemsSummary}</p>
              </div>

              {/* Pie de tarjeta: precio total y repartidor asignado. */}
              <div className="flex items-center justify-between border-t border-brand-800 pt-2 text-xs">
                <span className="font-bold text-brand-50">{formatCurrency(order.total)}</span>
                <span className="text-brand-50/60">🛵 {order.driverName ?? 'Asignando'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
