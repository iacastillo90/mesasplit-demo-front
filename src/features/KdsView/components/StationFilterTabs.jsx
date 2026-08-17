// src/features/KdsView/components/StationFilterTabs.jsx — tabs de estación (task 2.7)
// Filtro por estación de cocina del KDS: chips oscuros (sin superficies claras)
// que el cocinero toca para aislar su zona de trabajo. Presentacional: recibe
// la lista de estaciones, la activa y el handler de cambio por props.

// Tabs de estación: fila de chips con scroll horizontal para muchas estaciones.
export default function StationFilterTabs({ stations, activeStation, onChange }) {
  return (
    // Contenedor de chips con scroll horizontal suave (touch-friendly).
    <div className="flex gap-2 overflow-x-auto px-6 py-3">
      {/* Renderiza un chip por estación disponible (incluye "Todas"). */}
      {stations.map((station) => {
        // Flag: la estación es la activa del filtro actual.
        const isActive = station === activeStation;
        // Clases del chip: activo azul de marca, inactivo superficie oscura.
        const chipClasses = `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${
          // Activo: fondo brand-500 con texto blanco (CTA en oscuro).
          isActive
            ? 'bg-brand-500 text-white shadow-dark-glow'
            : 'bg-brand-800 text-brand-50 hover:bg-brand-800/70'
        }`;
        return (
          // Botón del chip: cambia la estación activa del filtro.
          <button
            key={station}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(station)}
            className={chipClasses}
          >
            {/* Texto del chip: nombre de la estación (o "Todas"). */}
            {station}
          </button>
        );
      })}
    </div>
  );
}
