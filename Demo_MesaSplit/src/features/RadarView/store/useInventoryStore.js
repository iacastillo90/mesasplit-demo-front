// src/features/RadarView/store/useInventoryStore.js — Store Zustand de control de inventario y recetas en tiempo real
// Administra el stock de insumos críticos, deducción automática por comanda consumida y quiebre automático en Lista 86.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Zustand create para instanciar el store global de inventario.
import { create } from 'zustand';
// Instancia del bus en tiempo real para notificar quiebres de stock a la cocina y cliente.
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';

// Instancia única del bus de eventos.
const bus = createRealtimeBus('mesasplit');

// Catálogo inicial de insumos críticos de cocina y barra.
export const INITIAL_INGREDIENTS = [
  { id: 'ing-1', name: 'Lomo Vetado (Kg)', stock: 8.5, unit: 'Kg', minStock: 2.0, status: 'OK' },
  { id: 'ing-2', name: 'Pisco Especial (L)', stock: 5.0, unit: 'L', minStock: 1.5, status: 'OK' },
  { id: 'ing-3', name: 'Queso Gouda (Kg)', stock: 1.2, unit: 'Kg', minStock: 1.0, status: 'Bajo' },
  { id: 'ing-4', name: 'Papas Nativas (Kg)', stock: 0.5, unit: 'Kg', minStock: 3.0, status: 'Crítico' },
];

// Mapeo de recetas simuladas: insumos requeridos por plato.
export const RECIPES_MAP = {
  'Lomo Lo Ovalle': [{ ingredientId: 'ing-1', amount: 0.35 }, { ingredientId: 'ing-4', amount: 0.25 }],
  'Pisco Sour': [{ ingredientId: 'ing-2', amount: 0.12 }],
  'Hamburguesa Gourmet': [{ ingredientId: 'ing-1', amount: 0.20 }, { ingredientId: 'ing-3', amount: 0.08 }],
};

// Store Zustand `useInventoryStore`.
export const useInventoryStore = create((set, get) => ({
  // Insumos en bodega y cocina.
  ingredients: INITIAL_INGREDIENTS,
  // Lista de platos caídos automáticamente en quiebre de stock (Lista 86).
  outOfStockDishes: ['Papas Rústicas'],

  // Deducción de insumos por comanda o plato vendido.
  deductRecipe: (dishName, qty = 1) => {
    // Busca los insumos requeridos por la receta del plato.
    const recipe = RECIPES_MAP[dishName];
    if (!recipe) return;

    // Obtiene los insumos actuales.
    const currentIngredients = get().ingredients;
    let newlyDepleted = [];

    // Actualiza el stock restando las cantidades de la receta.
    const updatedIngredients = currentIngredients.map((ing) => {
      // Busca si el insumo forma parte de la receta consumida.
      const item = recipe.find((r) => r.ingredientId === ing.id);
      if (!item) return ing;

      // Calcula el nuevo nivel de stock descontando según la cantidad.
      const newStock = Math.max(0, Number((ing.stock - item.amount * qty).toFixed(2)));

      // Si el insumo se agotó por completo (0 stock), lo registra para auto-quiebre.
      if (newStock === 0) {
        newlyDepleted.push(ing.name);
      }

      // Determina el nuevo estado del insumo.
      let newStatus = 'OK';
      if (newStock === 0) newStatus = 'Agotado';
      else if (newStock <= ing.minStock) newStatus = 'Crítico';

      return {
        ...ing,
        stock: newStock,
        status: newStatus,
      };
    });

    // Actualiza el estado global de inventario.
    set({ ingredients: updatedIngredients });

    // Si hubo insumos agotados a 0, activa el auto-quiebre en Lista 86.
    if (newlyDepleted.length > 0) {
      const current86 = get().outOfStockDishes;
      if (!current86.includes(dishName)) {
        const next86 = [...current86, dishName];
        set({ outOfStockDishes: next86 });

        // Emite el evento de auto-quiebre por el bus de tiempo real.
        bus.publish('inventory.depleted', {
          dishName,
          depletedIngredients: newlyDepleted,
          timestamp: Date.now(),
        });
      }
    }
  },

  // Repone stock manualmente desde el panel de bodega del Radar.
  restockIngredient: (ingredientId, addAmount) => {
    set((prev) => ({
      ingredients: prev.ingredients.map((ing) => {
        if (ing.id !== ingredientId) return ing;
        const newStock = Number((ing.stock + Number(addAmount)).toFixed(2));
        return {
          ...ing,
          stock: newStock,
          status: newStock > ing.minStock ? 'OK' : 'Crítico',
        };
      }),
    }));
  },
}));
