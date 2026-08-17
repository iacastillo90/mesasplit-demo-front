// src/mocks/menu.test.js — suite del fixture de menú con costo (fase2-mozo-caja-radar)
// Garantiza el contrato del fixture extendido por la spec: cada ítem de menu.json
// MUST exponer un campo `cost` entero en CLP con 0 < cost < price, del que se
// deriva el margen (price − cost) / price para el simulador What-If y la matriz
// de ingeniería de menú del Super Admin.

// API de Vitest importada explícitamente (ESLint no declara los globals).
import { describe, expect, it } from 'vitest';
// Fixture canónico del menú (fuente única de la demo).
import menuData from './menu.json';

describe('menu.json (fase2-mozo-caja-radar: costo del fixture)', () => {
  it('cada ítem del menú tiene un costo entero en CLP entre 0 y su precio', () => {
    // El fixture debe tener al menos un ítem para que la aserción sea real.
    expect(menuData.length).toBeGreaterThan(0);
    // Recorre cada ítem verificando el contrato del campo cost (aserciones reales).
    menuData.forEach((item) => {
      // El costo debe existir y ser un número (no undefined ni string).
      expect(typeof item.cost).toBe('number');
      // El costo debe ser un entero (sin decimales: CLP no tiene centavos).
      expect(Number.isInteger(item.cost)).toBe(true);
      // El costo debe ser estrictamente positivo (0 < cost).
      expect(item.cost).toBeGreaterThan(0);
      // El costo debe ser menor al precio de venta (cost < price).
      expect(item.cost).toBeLessThan(item.price);
    });
  });

  it('el margen derivado (price − cost) / price es un número entre 0 y 1', () => {
    // Verifica que el margen resultante es calculable y acotado (contrato de la spec).
    menuData.forEach((item) => {
      // Margen bruto unitario derivado del fixture.
      const margin = (item.price - item.cost) / item.price;
      // Debe ser un número finito (sin NaN ni infinito).
      expect(Number.isFinite(margin)).toBe(true);
      // El margen con 0 < cost < price siempre vive en (0, 1).
      expect(margin).toBeGreaterThan(0);
      expect(margin).toBeLessThan(1);
    });
  });
});
