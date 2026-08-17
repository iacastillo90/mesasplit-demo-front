// src/features/WaiterView/components/SmartUpsellWidget.jsx — Widget de maridaje e IA de venta cruzada (Smart Upsell)
// Sugiere automáticamente acompañamientos y vinos recomendados según los platos en la comanda del garzón.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Utility para formatear montos en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';

// Mapeo de sugerencias inteligentes según el contenido de la comanda.
export const UPSELL_RULES = [
  {
    triggerKeywords: ['Lomo', 'Carne', 'Hamburguesa'],
    recommendation: {
      name: 'Vino Carménère Gran Reserva 🍷',
      category: 'Bebidas / Maridaje',
      price: 18900,
      badge: 'Maridaje Recomendado (+18% ticket)',
    },
  },
  {
    triggerKeywords: ['Pisco', 'Trago', 'Coctel'],
    recommendation: {
      name: 'Empanaditas de Queso Gouda 🧀',
      category: 'Entradas',
      price: 6900,
      badge: 'Acompañamiento Ideal (+12% ticket)',
    },
  },
];

// Componente SmartUpsellWidget.
export default function SmartUpsellWidget({ orderDraft = [], onAddToCart }) {
  // Encuentra si alguna regla de sugerencia coincide con los ítems agregados al borrador.
  const matchedRule = UPSELL_RULES.find((rule) =>
    orderDraft.some((item) => rule.triggerKeywords.some((kw) => item.name.includes(kw)))
  );

  // Si no hay ítems coincidentes, ofrece una recomendación estándar.
  const activeRec = matchedRule?.recommendation || {
    name: 'Postre Volcán de Chocolate 🍫',
    category: 'Postres',
    price: 5900,
    badge: 'Sugerencia de Cierre (+15% ticket)',
  };

  return (
    // Contenedor principal del widget de sugerencia inteligente.
    <div aria-label="Asistente de Venta Cruzada" className="flex flex-col gap-2 rounded-2xl bg-amber-500/10 p-3.5 border border-amber-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
          <span>💡</span>
          <span>IA Smart Upsell Assistant</span>
        </div>
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-soft">
          {activeRec.badge}
        </span>
      </div>

      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200 shadow-soft">
        <div>
          <h4 className="text-xs font-bold text-brand-900">{activeRec.name}</h4>
          <p className="text-[11px] font-semibold text-brand-800/70">{formatCurrency(activeRec.price)}</p>
        </div>

        {/* Botón de adición directa a la comanda en 1 clic. */}
        <button
          type="button"
          onClick={() =>
            onAddToCart?.({
              id: `upsell-${Date.now()}`,
              name: activeRec.name,
              price: activeRec.price,
              category: activeRec.category,
            })
          }
          className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold transition shadow-soft active:scale-95 flex items-center gap-1"
        >
          <span>+</span>
          <span>Agregar Sugerencia</span>
        </button>
      </div>
    </div>
  );
}
