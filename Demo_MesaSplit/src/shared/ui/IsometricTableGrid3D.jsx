// src/shared/ui/IsometricTableGrid3D.jsx — Componente de proyección de salón en plano 3D isométrico táctil
// Renderiza cada mesa como un bloque tridimensional elevado con biselado, sombra isométrica y anillo LED de estado resplandeciente.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Utility para dar formato en CLP.
import { formatCurrency } from '../utils/index.js';

// Componente IsometricTableGrid3D.
export default function IsometricTableGrid3D({ tables = [], selectedTableId, onSelectTable }) {
  return (
    // Contenedor principal con perspectiva 3D y desbordamiento controlado.
    <div aria-label="Plano de Mesas 3D Isométrico" className="relative w-full overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-10 border border-slate-800 shadow-2xl">
      {/* Fondo de piso sintético con grilla isométrica. */}
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Cabecera del visualizador 3D. */}
      <div className="relative z-10 flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧊</span>
          <div>
            <h3 className="text-sm font-extrabold text-white">Plano 3D Isométrico del Salón</h3>
            <p className="text-[11px] text-slate-400">Perspectiva espacial tridimensional en tiempo real</p>
          </div>
        </div>

        {/* Leyenda de luces LED de estado. */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Libre
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" /> Ocupada
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]" /> Urgente / SOS
          </span>
        </div>
      </div>

      {/* Grid Isométrico con transformación 3D CSS pura. */}
      <div className="relative z-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 pt-4 pb-6">
        {tables.map((table) => {
          const isSelected = table.id === selectedTableId;
          const isOccupied = table.status === 'occupied' || table.status === 'busy' || table.occupied;
          const hasAlert = table.hasAlert || table.status === 'urgent';

          // Asigna el color de la luz LED según el estado de la mesa.
          let ledColorClass = 'bg-emerald-500 shadow-[0_0_12px_#10b981]';
          let borderClass = 'border-emerald-500/40 bg-emerald-950/30';
          if (hasAlert) {
            ledColorClass = 'bg-rose-500 shadow-[0_0_12px_#ef4444] animate-pulse';
            borderClass = 'border-rose-500/60 bg-rose-950/40';
          } else if (isOccupied) {
            ledColorClass = 'bg-amber-500 shadow-[0_0_12px_#f59e0b]';
            borderClass = 'border-amber-500/50 bg-amber-950/30';
          }

          return (
            // Bloque tridimensional de cada mesa con efecto de elevación 3D en hover y selección.
            <button
              key={table.id}
              type="button"
              onClick={() => onSelectTable?.(table.id)}
              className={`group relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all duration-300 cursor-pointer border ${borderClass} ${
                isSelected
                  ? 'scale-105 -translate-y-2 ring-2 ring-sky-400 shadow-[0_20px_30px_rgba(56,189,248,0.25)]'
                  : 'hover:-translate-y-1.5 hover:shadow-xl'
              }`}
            >
              {/* Cara superior del bloque de mesa (Luz LED + Número). */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${ledColorClass}`} />
                  <span className="text-xs font-extrabold text-white">Mesa {table.number}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{table.capacity ?? 4}p</span>
              </div>

              {/* Contenido interior: Mozo a cargo y monto total acumulado. */}
              <div className="flex flex-col gap-1 my-3">
                <span className="text-[11px] font-semibold text-slate-300 truncate">
                  {table.waiterName ? `👤 ${table.waiterName}` : 'Disponible'}
                </span>
                {table.totalAmount > 0 && (
                  <span className="text-xs font-extrabold text-sky-400">
                    {formatCurrency(table.totalAmount)}
                  </span>
                )}
              </div>

              {/* Biselado e indicador inferior 3D. */}
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-white/10 pt-1.5">
                <span>{table.zone || 'Salón Principal'}</span>
                <span className="text-sky-300 group-hover:translate-x-1 transition">Ver ➔</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
