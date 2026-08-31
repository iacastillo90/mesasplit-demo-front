// src/features/KdsView/components/BatchSummaryView.jsx — vista agregada por plato en KDS (kds-batch-view)
// Componente de agregación read-only de comandas activas agrupando por nombre de plato y sumando cantidades.
// Respeta la estación seleccionada (activeStation) y muestra un estado vacío si no hay comandas.
// No realiza mutaciones en tickets ni recallStack.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

import { useMemo } from 'react';
// Estación por defecto "todas".
import { STATION_ALL } from '../store/useKdsStore.js';

export default function BatchSummaryView({ tickets = [], activeStation = STATION_ALL }) {
  // Filtra y agrupa las comandas por plato calculando la suma total de cantidades.
  const aggregatedItems = useMemo(() => {
    // Filtra las comandas por la estación activa si es distinta de STATION_ALL.
    const filteredTickets =
      activeStation === STATION_ALL
        ? tickets
        : tickets.filter((t) => t.station === activeStation);

    // Mapa para acumular { name -> { name, qty, station } }.
    const map = new Map();

    filteredTickets.forEach((ticket) => {
      (ticket.items ?? []).forEach((item) => {
        const existing = map.get(item.name);
        const addQty = item.qty ?? 1;
        if (existing) {
          existing.qty += addQty;
        } else {
          map.set(item.name, {
            name: item.name,
            qty: addQty,
            station: ticket.station ?? 'Gastro',
          });
        }
      });
    });

    return Array.from(map.values());
  }, [tickets, activeStation]);

  if (aggregatedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-brand-50/60">
        <span className="text-4xl">🍳</span>
        <p className="mt-3 text-sm font-semibold">No hay platos pendientes en esta estación.</p>
      </div>
    );
  }

  return (
    // Grilla de resumen batch agregada por plato.
    <div aria-label="Resumen Batch de Cocina" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {aggregatedItems.map((item, idx) => (
        <div
          key={item.name ?? idx}
          className="flex items-center justify-between rounded-2xl bg-brand-900 p-5 border border-brand-800 shadow-soft"
        >
          <div className="flex flex-col">
            <span className="text-base font-bold text-brand-50">{item.name}</span>
            <span className="text-xs text-brand-50/60 uppercase">Estación: {item.station}</span>
          </div>

          <span className="rounded-xl bg-brand-500/20 px-3.5 py-1.5 text-xl font-extrabold text-brand-50 border border-brand-500/40">
            x{item.qty}
          </span>
        </div>
      ))}
    </div>
  );
}
