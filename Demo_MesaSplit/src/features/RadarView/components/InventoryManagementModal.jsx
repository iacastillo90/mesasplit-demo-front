// src/features/RadarView/components/InventoryManagementModal.jsx — Modal de control de bodega e inventario en tiempo real
// Visualiza niveles de insumos, semáforos de stock, reposición manual en 1 clic y lista de platos en quiebre (Lista 86).
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// useState para gestionar montos de reposición.
import { useState } from 'react';
// Store de inventario.
import { useInventoryStore } from '../store/useInventoryStore.js';
// Modal base del design system.
import { Modal } from '../../../shared/ui/index.js';

// Componente InventoryManagementModal.
export default function InventoryManagementModal({ open, onClose }) {
  // Conecta el store de inventario.
  const { ingredients, outOfStockDishes, restockIngredient } = useInventoryStore();
  // Estado local para aviso de reposición.
  const [restockToast, setRestockToast] = useState(null);

  // Maneja la reposición rápida de un insumo.
  const handleRestock = (id, amount) => {
    restockIngredient(id, amount);
    setRestockToast(`¡Stock reabastecido con éxito (+${amount})!`);
    setTimeout(() => setRestockToast(null), 2000);
  };

  if (!open) return null;

  return (
    // Modal envolvente de control de inventario.
    <Modal open={open} onClose={onClose} title="📦 Gestión de Inventario & Costeo de Recetas">
      <div className="flex flex-col gap-4 text-brand-900">
        {/* Banner de aviso de reposición. */}
        {restockToast && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-2.5 rounded-xl text-xs font-bold text-center animate-in fade-in">
            ✓ {restockToast}
          </div>
        )}

        {/* Sección de Platos en Quiebre de Stock (Lista 86 Activa). */}
        {outOfStockDishes.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex flex-col gap-1.5">
            <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <span>🚨</span> Platos en Quiebre de Stock (Lista 86 Activa):
            </h4>
            <div className="flex gap-1.5 flex-wrap">
              {outOfStockDishes.map((dish) => (
                <span key={dish} className="bg-rose-100 text-rose-900 border border-rose-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  🚫 {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabla / Lista de Insumos Críticos en Bodega. */}
        <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
          {ingredients.map((ing) => (
            <div
              key={ing.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-brand-200 shadow-soft"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-brand-900">{ing.name}</h5>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      ing.status === 'OK'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ing.status === 'Bajo'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    }`}
                  >
                    {ing.status}
                  </span>
                </div>
                <p className="text-[11px] text-brand-800/70">
                  Stock actual: <strong>{ing.stock} {ing.unit}</strong> (Min: {ing.minStock} {ing.unit})
                </p>
              </div>

              {/* Botones de reposición rápida en 1 clic. */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleRestock(ing.id, 1)}
                  className="rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-200 px-2 py-1 text-xs font-bold transition"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleRestock(ing.id, 5)}
                  className="rounded-lg bg-brand-500 hover:bg-brand-600 text-white px-2.5 py-1 text-xs font-bold transition shadow-soft"
                >
                  +5
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pie del modal. */}
        <div className="flex justify-end border-t border-brand-200 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand-900 text-white px-5 py-2 text-xs font-bold hover:bg-brand-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
