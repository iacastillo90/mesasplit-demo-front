// src/features/RadarView/components/DeliveryColumn.jsx — tarjetas del canal Delivery Omnicanal (local-admin-radar + modo-hora-punta)
// Renderiza el tablero de comandas virtuales provenientes de plataformas de Delivery (Uber Eats, PedidosYa, Rappi, Justo App).
// Muestra el estado del pedido: En Preparación 🍳, En Camino 🛵 y Entregado Recientemente ✅.
// Soporta tema dinámico Claro ☀️ y Oscuro 🌙 con useThemeStore.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea en español).

import { useState } from 'react';
import { formatCurrency } from '../../../shared/utils/index.js';
import { useThemeStore } from '../../../shared/store/useThemeStore.js';

// Colores e íconos distintivos por plataforma omnicanal.
const PLATFORMS = {
  ubereats: { name: 'Uber Eats', badge: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40', logo: '🟢' },
  pedidosya: { name: 'PedidosYa', badge: 'bg-rose-500/20 text-rose-500 border-rose-500/40', logo: '🔴' },
  rappi: { name: 'Rappi', badge: 'bg-orange-500/20 text-orange-500 border-orange-500/40', logo: '🟠' },
  justo: { name: 'Justo App', badge: 'bg-purple-500/20 text-purple-500 border-purple-500/40', logo: '🟣' },
};

// Badges visuales por estado operacional de la comanda.
const STATUSES = {
  in_prep: { label: '🍳 En Preparación', badge: 'bg-amber-500/20 text-amber-500 border-amber-500/40' },
  pending: { label: '🍳 En Preparación', badge: 'bg-amber-500/20 text-amber-500 border-amber-500/40' },
  on_way: { label: '🛵 En Camino', badge: 'bg-sky-500/20 text-sky-500 border-sky-500/40' },
  delivered: { label: '✅ Entregado Recientemente', badge: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40' },
};

// Componente de la sección Delivery Omnicanal.
export default function DeliveryColumn({ orders = [], deliveryOrders = [], focusMode = false }) {
  // Store de tema global para alternar entre claro y oscuro.
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  // Permite aceptar prop `orders` u `deliveryOrders`.
  const allOrders = orders.length > 0 ? orders : deliveryOrders;

  // Estado local para filtrar las tarjetas por estado.
  const [activeFilter, setActiveFilter] = useState('todos');

  // En Modo Hora Punta, prioriza comandas activas sin entregar.
  const baseOrders = focusMode
    ? allOrders.filter((o) => o.status !== 'delivered' && o.status !== 'completed' && o.status !== 'cancelled')
    : allOrders;

  // Aplica el filtro por estado.
  const filteredOrders = baseOrders.filter((o) => {
    if (activeFilter === 'todos') return true;
    if (activeFilter === 'in_prep') return o.status === 'in_prep' || o.status === 'pending';
    return o.status === activeFilter;
  });

  return (
    // Sección contenedora con accesibilidad y tema dinámico.
    <section
      aria-label="Delivery Omnicanal"
      className={`rounded-2xl p-5 border transition-colors flex flex-col gap-4 ${
        isDark ? 'bg-brand-900 border-brand-800 text-brand-50 shadow-xl' : 'bg-white border-brand-200 text-brand-900 shadow-soft'
      }`}
    >
      {/* Título de la sección de comandas de delivery online. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between border-b pb-3 border-brand-800/30">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-500">
              🛵 Canal Delivery Omnicanal ({baseOrders.length} activas)
            </h2>
            {focusMode && (
              <span className="rounded-full bg-semantic-urgent/20 border border-semantic-urgent/40 px-2.5 py-0.5 text-[10px] font-bold text-semantic-urgent">
                Prioridad Despacho
              </span>
            )}
          </div>
          <p className={`text-xs ${isDark ? 'text-brand-50/60' : 'text-brand-800/60'}`}>
            Monitoreo unificado de Uber Eats, PedidosYa, Rappi y Justo App
          </p>
        </div>
      </div>

      {/* Pestañas de filtrado por estado operacional */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'todos', label: 'Todas' },
          { id: 'in_prep', label: '🍳 Preparación' },
          { id: 'on_way', label: '🛵 En Camino' },
          { id: 'delivered', label: '✅ Entregados' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
              activeFilter === f.id
                ? 'bg-amber-500 text-white border-amber-500 shadow-soft'
                : isDark
                ? 'bg-brand-950/60 text-brand-50/70 border-brand-800 hover:bg-brand-800'
                : 'bg-brand-50 text-brand-800 border-brand-200 hover:bg-brand-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grilla responsiva de tarjetas de pedidos virtuales. */}
      <div className="grid grid-cols-1 gap-3">
        {filteredOrders.length === 0 ? (
          <div className={`p-4 text-center text-xs rounded-xl border italic ${isDark ? 'text-brand-50/50 border-brand-800' : 'text-brand-800/50 border-brand-200'}`}>
            No hay comandas en este estado.
          </div>
        ) : (
          filteredOrders.map((order) => {
            // Determina el branding visual de la plataforma.
            const platformKey = (order.platform || 'ubereats').toLowerCase();
            const platform = PLATFORMS[platformKey] ?? PLATFORMS.ubereats;
            const statusObj = STATUSES[order.status] ?? STATUSES.in_prep;

            return (
              // Tarjeta individual de comanda de delivery con tema dinámico.
              <article
                key={order.id}
                className={`flex flex-col justify-between rounded-2xl p-4 border transition-all duration-200 shadow-soft ${
                  isDark
                    ? 'bg-brand-950/90 border-brand-800 hover:border-amber-500/50'
                    : 'bg-brand-50/50 border-brand-200 hover:border-amber-500/50'
                } ${focusMode ? 'border-semantic-urgent/50 ring-1 ring-semantic-urgent/30' : ''}`}
              >
                {/* Cabecera de la tarjeta: logo de la app y badge de estado. */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-extrabold ${platform.badge}`}>
                    {platform.logo} {platform.name}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusObj.badge}`}>
                      {statusObj.label}
                    </span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-brand-50/60' : 'text-brand-800/60'}`}>
                      {order.elapsedMinutes} min
                    </span>
                  </div>
                </div>

                {/* Detalle del cliente y total del pedido. */}
                <div className="my-3">
                  <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-brand-900'}`}>
                    👤 {order.customerName}
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-brand-50/70' : 'text-brand-800/70'}`}>
                    🛍️ {order.itemsSummary}
                  </p>
                </div>

                {/* Pie de tarjeta: precio total y repartidor asignado. */}
                <div className={`flex items-center justify-between border-t pt-2 text-xs ${isDark ? 'border-brand-800' : 'border-brand-200'}`}>
                  <span className="font-extrabold text-amber-500 text-sm">
                    {formatCurrency(order.total)}
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-brand-50/70' : 'text-brand-800/70'}`}>
                    🛵 {order.driverName ?? 'Asignando repartidor'}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
