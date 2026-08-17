// src/features/CorporateView/components/BranchHealthCard.jsx — tarjeta de salud operacional por sucursal (super-admin-corporate)
// Muestra las métricas en tiempo real de cada local de la franquicia (ventas en CLP, mesas activas y semáforo operacional).
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';

// Semáforos de salud operacional por sucursal.
const HEALTH_SEMAPHORES = {
  optimal: { label: 'Óptimo', badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-300', dot: 'bg-semantic-success' },
  peak: { label: 'Hora Punta', badge: 'bg-amber-500/10 text-amber-700 border-amber-300', dot: 'bg-semantic-urgent' },
  alert: { label: 'Incidencia', badge: 'bg-red-500/10 text-red-700 border-red-300', dot: 'bg-semantic-danger' },
};

// Componente de tarjeta de sucursal.
export default function BranchHealthCard({ branch }) {
  const status = HEALTH_SEMAPHORES[branch.healthStatus] ?? HEALTH_SEMAPHORES.optimal;

  return (
    // Tarjeta contenedora de la sucursal de la franquicia.
    <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-soft border border-brand-200 text-brand-900 transition hover:shadow-lg">
      {/* Encabezado con nombre del local y semáforo de salud. */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-brand-900">{branch.name}</h3>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${status.badge}`}>
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Métricas de ventas y comensales en turno. */}
      <div className="my-4 flex items-baseline justify-between border-y border-brand-100 py-3">
        <div>
          <p className="text-xs text-brand-800/60 font-semibold">Ventas Turno</p>
          <p className="text-lg font-extrabold text-brand-900">{formatCurrency(branch.salesTotal)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-brand-800/60 font-semibold">Mesas Ocupadas</p>
          <p className="text-sm font-bold text-brand-500">{branch.activeTables} / {branch.totalTables} mesas</p>
        </div>
      </div>

      {/* Pie de tarjeta: mozos activos y ticket promedio. */}
      <div className="flex items-center justify-between text-xs text-brand-800/70">
        <span>👨‍🍳 {branch.activeStaff} personal en turno</span>
        <span>Ticket prom: <strong>{formatCurrency(branch.avgTicket)}</strong></span>
      </div>
    </div>
  );
}
