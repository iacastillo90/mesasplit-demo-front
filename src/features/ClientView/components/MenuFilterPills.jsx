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
];

export default function MenuFilterPills({ activeFilter = 'all', onSelectFilter }) {
  return (
    // Contenedor scrollable horizontal con chips seleccionables.
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {DIET_FILTERS.map((f) => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFilter(f.id)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 border ${
              isActive
                ? 'bg-brand-500 text-white border-brand-500 shadow-soft scale-105'
                : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50 hover:border-brand-300'
            }`}
          >
            <span className="text-sm">{f.icon}</span>
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}
