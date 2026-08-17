// src/features/WaiterView/components/TableGrid.jsx — grilla de mesas del mozo (waiter-pwa)
// Renderiza el mapa de mesas asignadas con semáforos visuales de estado:
// Verde (#10B981) = recién sentados / libre, Amarillo (#F59E0B) = esperando comida,
// Naranja (#FB923C) = cuenta pedida. El Rojo Puro (#EF4444) no se usa para estado de mesa.
// Cumple con las reglas de AGENTS.md (comentarios en español por línea).

// Mapeo semántico de estados de mesa a colores de badges (docs/04).
const STATUS_VARIANTS = {
  // Recién ocupada / disponible: verde esmeralda.
  occupied: 'bg-semantic-success/20 text-semantic-success border-semantic-success/30',
  // Esperando comida: amarillo ámbar.
  waiting_food: 'bg-semantic-warning/20 text-semantic-warning border-semantic-warning/30',
  // Cuenta solicitada: naranja de urgencia operacional (NO rojo puro).
  bill_requested: 'bg-semantic-urgent/20 text-semantic-urgent border-semantic-urgent/30',
  // Libre: gris sutil.
  free: 'bg-brand-800 text-brand-50/60 border-brand-800',
};

// Etiquetas legibles de los estados de la mesa.
const STATUS_LABELS = {
  occupied: 'Ocupada',
  waiting_food: 'En cocina',
  bill_requested: 'Pidiendo cuenta',
  free: 'Libre',
};

// Componente de la grilla de mesas asignadas.
export default function TableGrid({ tables, selectedTableId, onSelectTable }) {
  return (
    // Sección contenedora con etiqueta de accesibilidad.
    <section aria-label="Mesas asignadas">
      {/* Encabezado con conteo de mesas asignadas. */}
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-500">
        Mis mesas ({tables.length})
      </h2>

      {/* Grilla responsiva de tarjetas de mesa. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tables.map((table) => {
          // Determina si esta mesa está seleccionada activamente.
          const isSelected = table.id === selectedTableId;
          // Obtiene las clases CSS del semáforo visual según el estado.
          const statusStyle = STATUS_VARIANTS[table.status] ?? STATUS_VARIANTS.free;
          // Obtiene la etiqueta del estado.
          const statusLabel = STATUS_LABELS[table.status] ?? 'Ocupada';

          return (
            // Botón interactivo por mesa.
            <button
              key={table.id}
              type="button"
              onClick={() => onSelectTable(table.id)}
              className={`flex flex-col justify-between rounded-2xl p-4 text-left transition active:scale-95 border ${
                isSelected
                  ? 'bg-brand-800 border-brand-500 shadow-lg ring-2 ring-brand-500'
                  : 'bg-white border-brand-100 shadow-soft hover:border-brand-300'
              }`}
            >
              {/* Encabezado de la tarjeta: número de mesa y badge de comensales. */}
              <div className="flex items-center justify-between">
                {/* Número destacado de la mesa. */}
                <span className="text-lg font-bold text-brand-900">Mesa {table.number}</span>
                {/* Cantidad de comensales sentados. */}
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800/70">
                  👥 {table.guests}
                </span>
              </div>

              {/* Pie de tarjeta: badge del semáforo visual de estado. */}
              <div className="mt-3">
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}>
                  {statusLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
