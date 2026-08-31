// src/features/CorporateView/components/CostoPrimarioCard.jsx — tarjeta de indicador de Costo Primario (costo-primario)
// Tarjeta read-only para el Super Admin Corporativo que muestra el porcentaje de Costo Primario (Materia Prima / Ventas Totales).
// Usa useShallow de Zustand para evitar re-renders por objetos derivados devueltos por el selector.
// Explica la fórmula en el pie de tarjeta y no realiza mutaciones del store.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// useShallow para comparar superficialmente el objeto devuelto por el selector.
import { useShallow } from 'zustand/react/shallow';
// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Store corporativo y selector de costo primario.
import { selectCostoPrimario, useCorporateStore } from '../store/useCorporateStore.js';

// Componente CostoPrimarioCard.
export default function CostoPrimarioCard() {
  // Obtiene las métricas de costo primario derivadas en vivo por el selector puro usando useShallow.
  const { percentage, sumFoodCost, sumSalesTotal } = useCorporateStore(
    useShallow(selectCostoPrimario),
  );

  return (
    // Contenedor principal de la tarjeta de métrica.
    <div className="flex flex-col justify-between rounded-2xl bg-brand-900 p-5 border border-brand-800 text-brand-50 shadow-soft">
      {/* Cabecera con título de la métrica y chip indicador. */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-50/70">
          Costo Primario (Materia Prima)
        </span>
        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
          Meta ≤ 32%
        </span>
      </div>

      {/* Valor principal del porcentaje de costo primario. */}
      <div className="my-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-brand-50">{percentage.toFixed(1)}%</span>
        <span className="text-xs text-brand-50/60">del total de ventas</span>
      </div>

      {/* Desglose de montos en CLP (Costo de Materia Prima y Ventas Acumuladas). */}
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-brand-950/60 p-3 border border-brand-800 text-xs">
        <div>
          <span className="block text-[11px] text-brand-50/50">Costo Materia Prima</span>
          <span className="font-bold text-brand-50">{formatCurrency(sumFoodCost)}</span>
        </div>
        <div>
          <span className="block text-[11px] text-brand-50/50">Ventas Totales Red</span>
          <span className="font-bold text-brand-50">{formatCurrency(sumSalesTotal)}</span>
        </div>
      </div>

      {/* Pie explicativo de la fórmula read-only. */}
      <p className="mt-3 text-[10px] text-brand-50/50 italic border-t border-brand-800/60 pt-2">
        Fórmula: (Materia prima / Ventas totales) × 100
      </p>
    </div>
  );
}
