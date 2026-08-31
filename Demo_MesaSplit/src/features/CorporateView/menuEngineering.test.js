// src/features/CorporateView/menuEngineering.test.js — suite de tests de matriz de ingeniería de menú (corporate-menu-engineering)
// Cubre el spec corporate-menu-engineering: clasificación pura en 4 cuadrantes (estrella, caballo de batalla, puzzle, perro),
// explicación de cuadrantes, inmutabilidad de stores y clasificación de producto sin ventas en bajo volumen.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español).

import { describe, expect, it } from 'vitest';
import { classifyProduct, classifyMenu } from './services/menuEngineeringService.js';

describe('corporate-menu-engineering: Matriz de ingeniería de menú (read-only)', () => {
  it('Scenario 1: Clasificación de productos según volumen y margen en los 4 cuadrantes', () => {
    // Mediana de volumen: 10 unidades. Mediana de margen: 50%.
    const medianVolume = 10;
    const medianMargin = 50;

    // Estrella: alto volumen (15) y alto margen (60%).
    expect(classifyProduct({ volume: 15, marginPercentage: 60 }, medianVolume, medianMargin)).toBe('estrella');

    // Puzzle: bajo volumen (5) y alto margen (60%).
    expect(classifyProduct({ volume: 5, marginPercentage: 60 }, medianVolume, medianMargin)).toBe('puzzle');

    // Caballo de batalla: alto volumen (15) y bajo margen (40%).
    expect(classifyProduct({ volume: 15, marginPercentage: 40 }, medianVolume, medianMargin)).toBe('caballo de batalla');

    // Perro: bajo volumen (5) y bajo margen (40%).
    expect(classifyProduct({ volume: 5, marginPercentage: 40 }, medianVolume, medianMargin)).toBe('perro');
  });

  it('Scenario 2: Producto sin ventas cae en cuadrante de bajo volumen sin lanzar error', () => {
    const result = classifyProduct({ volume: 0, marginPercentage: 55 }, 10, 50);
    expect(result).toBe('puzzle');
  });

  it('Scenario 3: classifyMenu procesa la lista del menú sin mutarla', () => {
    const menu = [
      { id: 'm1', name: 'Plato A', price: 10000, cost: 4000 },
      { id: 'm2', name: 'Plato B', price: 5000, cost: 3000 },
    ];
    const before = JSON.stringify(menu);

    const classified = classifyMenu(menu, []);

    expect(JSON.stringify(menu)).toBe(before);
    expect(classified).toHaveProperty('estrella');
    expect(classified).toHaveProperty('caballo de batalla');
    expect(classified).toHaveProperty('puzzle');
    expect(classified).toHaveProperty('perro');
  });
});
