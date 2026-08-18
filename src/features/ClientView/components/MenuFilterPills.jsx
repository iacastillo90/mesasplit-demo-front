// src/features/ClientView/components/MenuFilterPills.jsx — componente de filtros rápidos por dieta en la carta digital del cliente
// Permite filtrar instantáneamente los platos según preferencias nutricionales (Vegano, Sin Gluten, Picante, Populares).
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea en español).

// Opciones de filtros dietéticos y de popularidad.
export const DIET_FILTERS = [
  { id: 'all', label: 'Todos', icon: '🍽️' },
  { id: 'vegano', label: 'Vegano', icon: '🌱' },
  { id: 'gluten_free', label: 'Sin Gluten', icon: '🌾' },
  { id: 'spicy', label: 'Picante', icon: '🌶️' },
  { id: 'popular', label: 'Popular', icon: '⭐' },
  { id: 'postres', label: 'Postres', icon: '🍰' },
  { id: 'bebidas', label: 'Bebidas', icon: '🍹' },
];

export default function MenuFilterPills({ activeFilter = 'all', onSelectFilter }) {
  return (
    // Contenedor scrollable horizontal responsivo sin recortes de texto ni desbordes en dispositivos móviles.
    <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none whitespace-nowrap px-1 pr-10 w-full min-w-0 touch-pan-x shrink-0">
      {DIET_FILTERS.map((f) => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFilter(f.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold whitespace-nowrap shrink-0 transition-all duration-200 active:scale-95 border cursor-pointer select-none min-w-fit ${
              isActive
                ? 'bg-brand-500 text-white border-brand-500 shadow-soft scale-105'
                : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50 hover:border-brand-300'
            }`}
          >
            <span className="text-sm shrink-0">{f.icon}</span>
            <span className="shrink-0">{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}
