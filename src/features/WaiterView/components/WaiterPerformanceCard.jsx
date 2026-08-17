// src/features/WaiterView/components/WaiterPerformanceCard.jsx — panel de rendimiento del garzón (waiter-performance)
// Tarjeta presentacional read-only que muestra métricas clave del garzón (pedidos, mesas, ticket promedio, rating).
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

import { formatCurrency } from '../../../shared/utils/index.js';

export default function WaiterPerformanceCard({ performance }) {
  if (!performance) return null;

  return (
    // Panel de rendimiento del garzón en formato card accesible.
    <div aria-label="Mi Rendimiento" className="rounded-2xl bg-white p-5 shadow-soft border border-brand-100 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-brand-100 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-500">📈 Mi Rendimiento (Hoy)</h3>
        {performance.avgRating > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            ★ {performance.avgRating}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="flex flex-col rounded-xl bg-brand-50/50 p-2.5 border border-brand-100">
          <span className="text-lg font-black text-brand-900">{performance.ordersTaken}</span>
          <span className="text-[10px] font-semibold text-brand-800/60 uppercase">Pedidos</span>
        </div>

        <div className="flex flex-col rounded-xl bg-brand-50/50 p-2.5 border border-brand-100">
          <span className="text-lg font-black text-brand-900">{performance.tablesServed}</span>
          <span className="text-[10px] font-semibold text-brand-800/60 uppercase">Mesas</span>
        </div>

        <div className="flex flex-col rounded-xl bg-brand-50/50 p-2.5 border border-brand-100">
          <span className="text-sm font-black text-brand-900">{formatCurrency(performance.avgTicket)}</span>
          <span className="text-[10px] font-semibold text-brand-800/60 uppercase">Ticket Prom.</span>
        </div>
      </div>
    </div>
  );
}
