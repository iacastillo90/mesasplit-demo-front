// src/features/WaiterView/components/TableGrid.jsx — grilla de mesas (task 2.6)
// Componente presentacional: renderiza las mesas del garzón como celdas
// clickeables. NO accede al store: recibe datos y handlers por props
// (container/presentational, patrón del proyecto). El estado de cada mesa usa
// el enum TABLE_STATUS de shared/constants (fuente única de verdades).

// Badge base: píldora del estado de la mesa (variantes semánticas).
import { Badge } from '../../../shared/ui/index.js';

// Mapa estado (TABLE_STATUS) → variante visual y etiqueta en español.
// Acá vive el vocabulario de la mesa; el color lo aporta la paleta semántica.
const STATUS_VIEW = {
  // Mesa libre: verde semántico (éxito en la operación del salón).
  free: { variant: 'success', label: 'Libre' },
  // Mesa ocupada: azul de marca (estado activo, comensales presentes).
  occupied: { variant: 'brand', label: 'Ocupada' },
  // Mesa cobrando: naranja urgente (operación en curso, NUNCA rojo).
  billing: { variant: 'urgent', label: 'Cobrando' },
  // Mesa en limpieza: ámbar de advertencia media.
  cleaning: { variant: 'warning', label: 'Limpieza' },
};

// Grilla de mesas: recibe mesas, la selección actual y el handler de click.
export default function TableGrid({ tables, selectedTableId, onSelect }) {
  return (
    // Contenedor de la grilla con scroll horizontal en pantallas angostas.
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {/* Renderiza una celda por mesa asignada al garzón. */}
      {tables.map((table) => {
        // Resuelve la vista del estado (variante + etiqueta) del enum.
        const statusView = STATUS_VIEW[table.status] ?? { variant: 'neutral', label: table.status };
        // Flag: la mesa es la seleccionada actualmente (anillo de marca).
        const isSelected = table.id === selectedTableId;
        // Clases de la celda: superficie + selección + feedback de presión.
        const cellClasses = `flex flex-col gap-2 rounded-2xl p-4 shadow-soft transition active:scale-[0.98] ${
          // Seleccionada: anillo de marca; si no, superficie blanca base.
          isSelected
            ? 'bg-white ring-2 ring-brand-500'
            : 'bg-white hover:ring-1 hover:ring-brand-500/40'
        }`;
        return (
          // Botón de la celda: toda la tarjeta es el área clickeable.
          <button
            key={table.id}
            type="button"
            onClick={() => onSelect(table.id)}
            aria-pressed={isSelected}
            className={cellClasses}
          >
            {/* Fila superior: número de mesa y estado en píldora. */}
            <div className="flex items-center justify-between gap-1">
              {/* Número de la mesa en tipografía fuerte y grande. */}
              <span className="text-2xl font-bold text-brand-900">{table.number}</span>
              {/* Píldora del estado de la mesa (variante semántica). */}
              <Badge variant={statusView.variant}>{statusView.label}</Badge>
            </div>
            {/* Línea de capacidad y zona de la mesa. */}
            <p className="text-xs text-brand-800/60">
              {/* Capacidad de comensales más la zona del salón. */}
              {table.seats} pers · {table.zone}
            </p>
          </button>
        );
      })}
    </div>
  );
}
