// src/features/ClientView/components/OrderTrackingBanner.jsx — banner de tracking de pedido en vivo (client-order-tracking)
// Banner visible en Mesa Virtual cuando existe una orden activa.
// Escucha el evento order.status.change del bus de eventos en tiempo real.
// Mapea los estados según TICKET_STATUS:
// - pending -> "enviado a cocina" (default si no hay eventos)
// - in_preparation -> "en preparación"
// - ready -> "listo"
// - delivered -> "entregado"
// Ignora estados no reconocidos y no introduce transporte nuevo.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea).

import { useEffect, useState } from 'react';
// Hook de bus en tiempo real.
import { createRealtimeBus, TOPICS } from '../../../hooks/useRealtimeBus.js';
// Enum de estados de tickets en cocina.
import { TICKET_STATUS } from '../../../shared/constants/statusEnums.js';

// Mapeo de estado a etiqueta visual y estilos.
const STATUS_MAP = {
  [TICKET_STATUS.PENDING]: { label: 'enviado a cocina', icon: '👨‍🍳', color: 'bg-amber-500/10 text-amber-700 border-amber-300' },
  [TICKET_STATUS.IN_PREPARATION]: { label: 'en preparación', icon: '🔥', color: 'bg-blue-500/10 text-blue-700 border-blue-300' },
  [TICKET_STATUS.READY]: { label: 'listo', icon: '🔔', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-300' },
  [TICKET_STATUS.DELIVERED]: { label: 'entregado', icon: '✅', color: 'bg-brand-500/10 text-brand-700 border-brand-300' },
};

export default function OrderTrackingBanner({ hasActiveOrder, orderId }) {
  // Estado local del estado actual de la orden. Default: PENDING ("enviado a cocina").
  const [currentStatus, setCurrentStatus] = useState(TICKET_STATUS.PENDING);

  useEffect(() => {
    if (!hasActiveOrder) return;

    // Obtiene instancia del bus de eventos realtime.
    const bus = createRealtimeBus('mesasplit');

    // Listener para eventos order.status.change.
    const unsubscribe = bus.subscribe(TOPICS.ORDER_STATUS_CHANGE, (payload) => {
      if (!payload?.status) return;
      // Si se especifica orderId y el payload no coincide, ignora.
      if (orderId && payload.orderId && payload.orderId !== orderId) return;

      // Valida si el status es uno de los TICKET_STATUS conocidos.
      const validStatuses = Object.values(TICKET_STATUS);
      if (validStatuses.includes(payload.status)) {
        setCurrentStatus(payload.status);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [hasActiveOrder, orderId]);

  if (!hasActiveOrder) return null;

  const info = STATUS_MAP[currentStatus] ?? STATUS_MAP[TICKET_STATUS.PENDING];

  return (
    // Contenedor del banner de seguimiento de pedido.
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-soft border border-brand-200">
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{info.icon}</span>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-brand-900">Estado de tu Pedido</span>
          <span className="text-[11px] text-brand-800/70">Seguimiento en tiempo real</span>
        </div>
      </div>

      <span className={`rounded-full px-3 py-1 text-xs font-bold border ${info.color}`}>
        {info.label}
      </span>
    </div>
  );
}
