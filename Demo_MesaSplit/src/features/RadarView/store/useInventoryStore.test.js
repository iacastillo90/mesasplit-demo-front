// src/features/RadarView/store/useInventoryStore.test.js — tests unitarios para useInventoryStore
// Prueba la deducción de insumos por receta, reposición manual de stock y activación automática de Lista 86.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Describe, it y expect de Vitest para la suite de pruebas.
import { describe, it, expect, beforeEach } from 'vitest';
// Store e insumos iniciales a probar.
import { useInventoryStore, INITIAL_INGREDIENTS } from './useInventoryStore.js';

// Describe bloque principal para useInventoryStore.
describe('useInventoryStore: Control de stock de recetas y auto-quiebre en Lista 86', () => {
  // Reinicia el estado del store antes de cada test.
  beforeEach(() => {
    useInventoryStore.setState({
      ingredients: INITIAL_INGREDIENTS,
      outOfStockDishes: ['Papas Rústicas'],
    });
  });

  // Test 1: Deducción correcta de stock por receta.
  it('descuenta automáticamente la cantidad de insumos consumidos por receta', () => {
    // Deduce 1 Pisco Sour (requiere 0.12 L de Pisco, stock inicial: 5.0 L).
    useInventoryStore.getState().deductRecipe('Pisco Sour', 1);

    // Obtiene el insumo Pisco.
    const pisco = useInventoryStore.getState().ingredients.find((i) => i.id === 'ing-2');
    // Verifica que el stock haya bajado a 4.88 L.
    expect(pisco.stock).toBe(4.88);
  });

  // Test 2: Auto-quiebre en Lista 86 al agotar stock a 0.
  it('activa automáticamente el plato en Lista 86 al agotar un insumo a 0', () => {
    // Setea el stock de Papas Nativas en 0.25 Kg.
    useInventoryStore.setState({
      ingredients: INITIAL_INGREDIENTS.map((i) => (i.id === 'ing-4' ? { ...i, stock: 0.25 } : i)),
    });

    // Deduce 1 Lomo Lo Ovalle (requiere 0.25 Kg de Papas Nativas).
    useInventoryStore.getState().deductRecipe('Lomo Lo Ovalle', 1);

    // Verifica que Lomo Lo Ovalle haya ingresado a la lista de platos agotados (Lista 86).
    expect(useInventoryStore.getState().outOfStockDishes).toContain('Lomo Lo Ovalle');
  });

  // Test 3: Reposición manual de stock.
  it('permite reponer unidades de un insumo manualmente', () => {
    // Repone 5 Kg a Papas Nativas.
    useInventoryStore.getState().restockIngredient('ing-4', 5);

    // Verifica que el stock de Papas Nativas pase a 5.5 Kg (0.5 + 5.0).
    const papas = useInventoryStore.getState().ingredients.find((i) => i.id === 'ing-4');
    expect(papas.stock).toBe(5.5);
  });
});
