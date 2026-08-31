// src/features/ClientView/components/GroupSplitProgressBar.jsx — indicador visual de progreso colectivo del pago de la cuenta de mesa
// Muestra el porcentaje acumulado pagado, el saldo pendiente y los avatares/chips de comensales.
// Cumple con las reglas de AGENTS.md (comentarios en español por cada línea).

import { formatCurrency } from '../../../shared/utils/index.js';

export default function GroupSplitProgressBar({ totalAmount = 0, guests = [] }) {
  // Suma los montos acumulados pagados por los comensales.
  const paidAmount = guests.reduce((sum, g) => (g.status === 'paid' ? sum + g.amount : sum), 0);
  // Monto restante pendiente por pagar.
  const remainingAmount = Math.max(0, totalAmount - paidAmount);
  // Porcentaje acumulado de pago de la mesa.
  const percentage = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-slate-900 text-white p-4 shadow-md border border-slate-700/60">
      {/* Cabecera: Porcentaje y estado del pago colectivo */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span className="font-extrabold uppercase tracking-wider text-slate-300">Progreso del Pago de Mesa</span>
        </div>
        <span className="font-black text-sky-400 text-sm">{percentage}% Pagado</span>
      </div>

      {/* Barra de progreso visual con efecto gradiente */}
      <div className="relative h-3.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Resumen numérico: Monto Pagado vs Pendiente */}
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 pt-1">
        <span>Pagado: <span className="text-emerald-400">{formatCurrency(paidAmount)}</span></span>
        <span>Pendiente: <span className="text-amber-400">{formatCurrency(remainingAmount)}</span></span>
      </div>

      {/* Avatares/Chips de comensales */}
      {guests.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800">
          {guests.map((g) => (
            <span
              key={g.id}
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                g.status === 'paid'
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <span>{g.status === 'paid' ? '✅' : '⏳'}</span>
              <span>{g.name}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
