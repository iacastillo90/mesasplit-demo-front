// src/shared/utils/menuFilters.test.js — paridad de filtros de carta con el cliente (client-identical-filters)
// Verifica que filterMenuByDiet produzca EXACTAMENTE los mismos conjuntos que la
// lógica del cliente (ClientPage L122-130) sobre la fuente única menu.json.
// Los ids esperados se derivan de menu.json (paridad sc.1-3): al cambiar el
// fixture, este contrato detecta divergencias entre carta del cliente y del mozo.
// RED-GREEN (waiter-menu-filters): el helper aún no existe → los tests fallan.

// API de Vitest importada explícitamente (ESLint no declara los globals).
import { describe, expect, it } from 'vitest';
// Fixture canónico de la carta (única fuente de ítems).
import menuData from '../../mocks/menu.json';
// Helper puro de filtrado por dieta (mismo contrato que el cliente).
import { filterMenuByDiet } from './menuFilters.js';

// Helper local: extrae los ids de los ítems filtrados (orden de menu.json).
const idsOf = (items) => items.map((item) => item.id);

describe('filterMenuByDiet: paridad con el cliente (client-identical-filters)', () => {
  it('sc.1: vegano devuelve exactamente los ítems vegetarianos/veganos del menú real', () => {
    // Conjunto esperado derivado de menu.json (9 ítems sin carne).
    const expected = ['m5', 'm6', 'm8', 'm9', 'm11', 'm13', 'm24', 'm25', 'm28'];
    // El helper filtra idéntico al chip Vegano del cliente.
    expect(idsOf(filterMenuByDiet(menuData, 'vegano'))).toEqual(expected);
  });

  it('sc.1: gluten_free devuelve exactamente los ítems libres de gluten (10 ítems)', () => {
    // Conjunto esperado derivado de menu.json (campo glutenFree).
    const expected = ['m1', 'm9', 'm13', 'm14', 'm18', 'm23', 'm24', 'm25', 'm26', 'm28'];
    expect(idsOf(filterMenuByDiet(menuData, 'gluten_free'))).toEqual(expected);
  });

  it('sc.1: spicy devuelve exactamente los ítems picantes (5 ítems)', () => {
    // Conjunto esperado derivado de menu.json (campo spicy).
    const expected = ['m4', 'm7', 'm11', 'm26', 'm27'];
    expect(idsOf(filterMenuByDiet(menuData, 'spicy'))).toEqual(expected);
  });

  it('sc.1: popular devuelve exactamente los ítems populares (13 ítems)', () => {
    // Conjunto esperado derivado de menu.json (campo popular).
    const expected = ['m1', 'm2', 'm3', 'm4', 'm6', 'm7', 'm10', 'm14', 'm15', 'm19', 'm21', 'm26', 'm27'];
    expect(idsOf(filterMenuByDiet(menuData, 'popular'))).toEqual(expected);
  });

  it('sc.1: postres agrupa dulces y categoría Postres (5 ítems)', () => {
    // Conjunto esperado: sweet=true o categoría 'Postres' (mismo criterio del cliente).
    const expected = ['m15', 'm16', 'm17', 'm18', 'm28'];
    expect(idsOf(filterMenuByDiet(menuData, 'postres'))).toEqual(expected);
  });

  it('sc.1: bebidas agrupa alcohólicas y categoría Barra (5 ítems)', () => {
    // Conjunto esperado: alcoholic=true o categoría 'Barra' (mismo criterio del cliente).
    const expected = ['m19', 'm20', 'm21', 'm22', 'm23'];
    expect(idsOf(filterMenuByDiet(menuData, 'bebidas'))).toEqual(expected);
  });

  it('sc.2: "all" devuelve los 28 ítems sin filtrar', () => {
    // El filtro por defecto del cliente deja pasar todo el menú.
    expect(idsOf(filterMenuByDiet(menuData, 'all'))).toHaveLength(28);
    expect(idsOf(filterMenuByDiet(menuData, 'all'))).toEqual(menuData.map((i) => i.id));
  });

  it('sc.3: un ítem fuera de todos los filtros no aparece en ningún subconjunto', () => {
    // m12 (Ensalada César con Pollo) no es vegano ni libre de gluten ni picante.
    const vegano = idsOf(filterMenuByDiet(menuData, 'vegano'));
    const gluten = idsOf(filterMenuByDiet(menuData, 'gluten_free'));
    const spicy = idsOf(filterMenuByDiet(menuData, 'spicy'));
    // El ítem no debe pertenecer a ningún conjunto filtrado.
    expect([vegano, gluten, spicy].some((list) => list.includes('m12'))).toBe(false);
  });

  it('sc.3: un filtro desconocido se comporta como "all" (sin romper)', () => {
    // Paridad con el cliente: cualquier otro valor devuelve true (default).
    expect(filterMenuByDiet(menuData, 'desconocido')).toHaveLength(28);
  });
});
