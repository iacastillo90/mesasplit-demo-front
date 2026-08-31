// src/features/WaiterView/services/upsellService.test.js — suite del upsell asistido (waiter-upsell)
// Cubre el selector puro `suggestUpsell(itemId, menu)` de la spec waiter-upsell:
// devuelve a lo sumo un candidato (o null) según el mapa de reglas demo fijo
// (hamburguesa → papas fritas; pizza → bebida), keyed por id/categoría de producto.
// El selector JAMÁS auto-agrega: solo sugiere; el agregado lo hace el flujo normal.

// API de Vitest importada explícitamente (ESLint no declara los globals).
import { describe, expect, it } from 'vitest';
// Selector puro de sugerencia de upsell (aún no implementado: RED).
import { suggestUpsell } from './upsellService.js';

// Menú canónico de prueba: incluye hamburguesa, papas fritas, pizza y bebida.
const MENU = [
  { id: 'm1', name: 'Hamburguesa Clásica', price: 12500, category: 'Hamburguesas' },
  { id: 'm2', name: 'Papas fritas', price: 4500, category: 'Guarniciones' },
  { id: 'm3', name: 'Pizza Margherita', price: 10900, category: 'Pizzas' },
  { id: 'm6', name: 'Limonada Menta', price: 2900, category: 'Bebidas' },
  { id: 'm5', name: 'Ensalada César', price: 7400, category: 'Ensaladas' },
];

describe('suggestUpsell (waiter-upsell: selector puro)', () => {
  it('S1: devuelve el candidato con regla al agregar un plato (hamburguesa → papas fritas)', () => {
    // Hamburguesa recién agregada: la regla demo sugiere papas fritas.
    const suggestion = suggestUpsell('m1', MENU);
    // Debe existir un candidato (nunca null para un plato con regla).
    expect(suggestion).not.toBeNull();
    // El candidato es exactamente el producto sugerido por la regla (m2).
    expect(suggestion.id).toBe('m2');
    // El candidato debe ser un ítem del menú provisto (con nombre y precio).
    expect(suggestion.name).toBe('Papas fritas');
    expect(suggestion.price).toBe(4500);
  });

  it('S1b: la regla de pizza → bebida también se resuelve por categoría', () => {
    // Pizza con categoría Pizzas: la regla demo sugiere una bebida (m6).
    const suggestion = suggestUpsell('m3', MENU);
    // Debe existir un candidato para la pizza.
    expect(suggestion).not.toBeNull();
    // El candidato es la bebida sugerida por la regla (m6).
    expect(suggestion.id).toBe('m6');
  });

  it('S4: devuelve null para un ítem sin regla (ej. ensalada)', () => {
    // La ensalada no tiene regla en el mapa demo.
    const suggestion = suggestUpsell('m5', MENU);
    // Sin regla: el selector devuelve null (nunca un candidato).
    expect(suggestion).toBeNull();
  });

  it('devuelve null para un ítem inexistente en el menú', () => {
    // Ítem fuera del catálogo: no hay producto ni regla que resolver.
    expect(suggestUpsell('zz-inexistente', MENU)).toBeNull();
    // Menú vacío: el selector degrada a null sin lanzar error.
    expect(suggestUpsell('m1', [])).toBeNull();
  });

  it('devuelve null si la regla existe pero el sugerido no está en el menú', () => {
    // Menú sin papas fritas (m2): la regla m1→m2 no puede materializarse.
    const menuSinSugerido = MENU.filter((p) => p.id !== 'm2');
    expect(suggestUpsell('m1', menuSinSugerido)).toBeNull();
  });
});
