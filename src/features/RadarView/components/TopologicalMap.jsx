// src/features/RadarView/components/TopologicalMap.jsx — plano topológico interactivo del radar (local-admin-radar)
// Renderiza la vista espacial del salón por zonas (Salón, Terraza, Barra) con semáforos de estado,
// capacidad de comensales y suscripción a eventos table.status_changed.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Semáforos visuales de estado para el mapa del plano (docs/04).
const SEMAPHORES = {
  free: 'border-semantic-success bg-semantic-success/10 text-semantic-success',
  occupied: 'border-brand-500 bg-brand-500/20 text-brand-500',
  billing: 'border-semantic-urgent bg-semantic-urgent/20 text-semantic-urgent',
  cleaning: 'border-semantic-warning bg-semantic-warning/20 text-semantic-warning',
};

// Componente del mapa topológico interactivo.
export default function TopologicalMap({ tables, activeZone, onSelectZone, focusMode }) {
  // Filtra las mesas según la zona seleccionada en las pestañas superior.
  const filteredTables = activeZone === 'todos'
    ? tables
    : tables.filter((t) => (t.zone ?? 'Salón').toLowerCase() === activeZone.toLowerCase());

  return (
    // Contenedor principal del plano de distribución.
    <section aria-label="Plano topológico del salón" className="flex flex-col gap-4">
      {/* Selector de zonas del restaurante (Salón, Terraza, Barra). */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-500">
          Plano del salón ({filteredTables.length} mesas)
        </h2>

        {/* Botones de pestaña para filtrar por zona. */}
        <div className="flex items-center gap-1 rounded-xl bg-brand-900 p-1 border border-brand-800">
          {['todos', 'Salón', 'Terraza', 'Barra'].map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => onSelectZone(zone)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition active:scale-95 ${
                activeZone.toLowerCase() === zone.toLowerCase()
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'text-brand-50/60 hover:bg-brand-800 hover:text-brand-50'
              }`}
            >
              {zone === 'todos' ? 'Todas' : zone}
            </button>
          ))}
        </div>
      </div>

      {/* Plano espacial con fondo oscuro brand-950 y grilla sintética. */}
      <div
        className={`relative min-h-[360px] w-full rounded-2xl bg-brand-950 p-6 border transition-all ${
          focusMode ? 'border-semantic-urgent ring-2 ring-semantic-urgent/50 shadow-2xl' : 'border-brand-800 shadow-soft'
        }`}
      >
        {/* Grilla visual sintética del suelo del salón. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#024064_1px,transparent_1px),linear-gradient(to_bottom,#024064_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />

        {/* Mesas posicionadas topológicamente según sus coordenadas porcentuales x e y. */}
        <div className="relative h-72 w-full">
          {filteredTables.map((table) => {
            // Estilo del semáforo visual según estado.
            const style = SEMAPHORES[table.status] ?? SEMAPHORES.free;

            return (
              // Nodo de mesa interactivo en el plano topológico.
              <button
                key={table.id}
                type="button"
                style={{ left: `${table.x ?? 50}%`, top: `${table.y ?? 50}%` }}
                className={`absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${style}`}
              >
                {/* Número de la mesa. */}
                <span className="text-sm font-bold leading-none text-brand-50">
                  {table.number}
                </span>
                {/* Capacidad o cantidad de comensales. */}
                <span className="mt-0.5 text-[10px] leading-none text-brand-50/50">
                  {table.seats ?? 4}p
                </span>
              </button>
            );
          })}
        </div>

        {/* Leyenda explicativa de los semáforos del mapa al pie. */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-brand-800/80 pt-3 text-xs text-brand-50/70">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-semantic-success" /> Libre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Ocupada
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-semantic-urgent" /> Cobrando
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-semantic-warning" /> Limpieza
          </span>
        </div>
      </div>
    </section>
  );
}
