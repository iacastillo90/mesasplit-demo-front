// src/features/ClientView/components/MenuFilterPills.jsx — componente de filtros rápidos por dieta en la carta digital del cliente
// Permite filtrar instantáneamente los platos según preferencias nutricionales (Vegano, Sin Gluten, Picante, Populares).
// Organizado en hileras visibles multitasa en móviles para eliminar el scroll lateral.
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
    // Contenedor responsivo en hileras multitasa (flex flex-wrap): 100% visible en móvil sin necesidad de scroll lateral.
    <div className="flex flex-wrap items-center gap-2 py-2 px-1 w-full max-w-full justify-start border-y border-brand-100/60 my-2">
      {DIET_FILTERS.map((f) => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFilter(f.id)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold whitespace-nowrap transition-all duration-200 active:scale-95 border cursor-pointer select-none ${
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
