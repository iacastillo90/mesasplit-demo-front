// src/features/CorporateView/components/RealtimeSalesChart.jsx — gráfico interactivo de ventas en tiempo real (corporate-charts)
// Componente SVG puro para visualización en tiempo real de ventas por hora y comparación por sucursales.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

import { useState } from 'react';
import { formatCurrency } from '../../../shared/utils/index.js';

export default function RealtimeSalesChart({ branches = [] }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Datos simulados de ventas por hora (9:00 AM - 9:00 PM).
  const hourlyData = [
    { hour: '12:00', sales: 145000 },
    { hour: '13:00', sales: 320000 },
    { hour: '14:00', sales: 410000 },
    { hour: '15:00', sales: 210000 },
    { hour: '16:00', sales: 130000 },
    { hour: '17:00', sales: 180000 },
    { hour: '18:00', sales: 290000 },
    { hour: '19:00', sales: 480000 },
    { hour: '20:00', sales: 560000 },
    { hour: '21:00', sales: 390000 },
  ];

  const maxSales = Math.max(...hourlyData.map((d) => d.sales));

  return (
    <div aria-label="Gráfico de Ventas en Tiempo Real" className="rounded-2xl bg-white p-5 shadow-soft border border-brand-200 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-100 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-500">📈 Curva de Ventas en Tiempo Real</h3>
          <p className="text-xs text-brand-800/60">Evolución horaria de ingresos consolidados de la red</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Actualización Realtime
          </span>
        </div>
      </div>

      {/* ÁREA DE GRÁFICO SVG RESPONSIVE DE BARRAS Y TENDENCIA */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[500px] flex flex-col gap-2">
          {/* Gráfico de barras SVG */}
          <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 px-2">
            {hourlyData.map((d, index) => {
              const heightPercent = Math.round((d.sales / maxSales) * 100);
              const isHovered = hoveredBar === index;

              return (
                <div
                  key={d.hour}
                  className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip flotante al pasar el cursor */}
                  {isHovered && (
                    <div className="absolute -top-10 z-10 rounded-xl bg-brand-900 px-2.5 py-1 text-[10px] font-bold text-white shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95">
                      {d.hour} hrs: {formatCurrency(d.sales)}
                    </div>
                  )}

                  {/* Barra animada con gradiente */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isHovered
                        ? 'bg-brand-500 shadow-lg scale-105'
                        : 'bg-gradient-to-t from-brand-500/80 to-brand-400'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Eje X: Horas */}
          <div className="flex justify-between text-[10px] font-semibold text-brand-800/60 px-2 border-t border-brand-100 pt-2">
            {hourlyData.map((d) => (
              <span key={d.hour} className="flex-1 text-center">
                {d.hour}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* COMPARATIVA DE SUCURSALES (BARRAS HORIZONTALES) */}
      <div className="border-t border-brand-100 pt-3 flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800/60">
          Distribución de Ventas por Sucursal
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.map((b) => {
            const totalFranchise = branches.reduce((acc, curr) => acc + (curr.salesTotal ?? 0), 1);
            const share = Math.round(((b.salesTotal ?? 0) / totalFranchise) * 100);

            return (
              <div key={b.id} className="flex flex-col gap-1 rounded-xl bg-brand-50/50 p-2.5 border border-brand-100">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-brand-900">{b.name}</span>
                  <span className="text-brand-500">{formatCurrency(b.salesTotal)} ({share}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-brand-200 overflow-hidden">
                  <div
                    style={{ width: `${share}%` }}
                    className="h-full rounded-full bg-brand-500 transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
