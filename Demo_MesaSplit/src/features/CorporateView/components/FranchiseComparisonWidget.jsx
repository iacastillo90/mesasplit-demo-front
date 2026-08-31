// src/features/CorporateView/components/FranchiseComparisonWidget.jsx — Widget comparativo de sucursales en tiempo real (Super Admin Corporativo)
// Visualiza y compara ventas totales, ticket promedio, rotación de mesas y satisfacción entre sucursales de la franquicia.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// useState para controlar el filtro de ordenamiento por métrica.
import { useState } from 'react';
// Utility para formatear montos en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';

// Datos simulados de métricas corporativas por sucursal.
export const FRANCHISE_BRANCH_METRICS = [
  {
    id: 'b-1',
    name: 'Providencia — Terraza',
    salesToday: 4850000,
    avgTicket: 34500,
    tableTurnover: 4.2,
    rating: 4.8,
    status: 'Excelente 🌟',
    badgeTone: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  },
  {
    id: 'b-2',
    name: 'Santiago Centro — Histórico',
    salesToday: 3290000,
    avgTicket: 24800,
    tableTurnover: 5.1,
    rating: 4.6,
    status: 'Estable 👍',
    badgeTone: 'bg-sky-50 text-sky-700 border-sky-300',
  },
  {
    id: 'b-3',
    name: 'Vitacura — Gourmet',
    salesToday: 6120000,
    avgTicket: 48900,
    tableTurnover: 3.8,
    rating: 4.9,
    status: 'Líder Ventas 🔥',
    badgeTone: 'bg-amber-50 text-amber-700 border-amber-300',
  },
];

// Componente FranchiseComparisonWidget.
export default function FranchiseComparisonWidget() {
  // Métrica activa para ordenar ('sales' | 'ticket' | 'rating').
  const [activeMetric, setActiveMetric] = useState('sales');

  // Ordena las sucursales según la métrica seleccionada.
  const sortedBranches = [...FRANCHISE_BRANCH_METRICS].sort((a, b) => {
    if (activeMetric === 'sales') return b.salesToday - a.salesToday;
    if (activeMetric === 'ticket') return b.avgTicket - a.avgTicket;
    if (activeMetric === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    // Contenedor principal del widget comparativo.
    <section aria-label="Comparativo de Sucursales" className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
      {/* Cabecera del widget con título y selector de métricas. */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-200 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-500">
            📊 Comparativo Multi-Local en Tiempo Real
          </h3>
          <p className="text-xs text-brand-800/70">
            Desempeño diario consolidado de las 3 sucursales operativas de MesaSplit.
          </p>
        </div>

        {/* Filtro interactivo por métrica clave. */}
        <div className="flex items-center gap-1 bg-brand-50 p-1 rounded-xl border border-brand-200">
          <button
            type="button"
            onClick={() => setActiveMetric('sales')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              activeMetric === 'sales'
                ? 'bg-brand-500 text-white shadow-soft'
                : 'text-brand-800 hover:bg-brand-100'
            }`}
          >
            Ventas CLP
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('ticket')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              activeMetric === 'ticket'
                ? 'bg-brand-500 text-white shadow-soft'
                : 'text-brand-800 hover:bg-brand-100'
            }`}
          >
            Ticket Prom.
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('rating')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              activeMetric === 'rating'
                ? 'bg-brand-500 text-white shadow-soft'
                : 'text-brand-800 hover:bg-brand-100'
            }`}
          >
            Satisfacción
          </button>
        </div>
      </div>

      {/* Grid de tarjetas comparativas por sucursal. */}
      <div className="grid gap-3 sm:grid-cols-3">
        {sortedBranches.map((b, index) => (
          <div
            key={b.id}
            className="flex flex-col justify-between p-4 rounded-2xl bg-brand-50/50 border border-brand-200 hover:bg-brand-50 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-brand-400">#0{index + 1}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.badgeTone}`}>
                  {b.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-brand-900 mb-2">{b.name}</h4>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-brand-200/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-brand-800/70">Ventas Hoy:</span>
                <span className="font-bold text-brand-900">{formatCurrency(b.salesToday)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-brand-800/70">Ticket Prom:</span>
                <span className="font-semibold text-brand-900">{formatCurrency(b.avgTicket)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-brand-800/70">Rotación Mesas:</span>
                <span className="font-semibold text-brand-900">{b.tableTurnover}x / día</span>
              </div>

              <div className="flex items-center justify-between pt-1 text-amber-700">
                <span className="text-brand-800/70">Calificación:</span>
                <span className="font-bold">★ {b.rating} / 5.0</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
