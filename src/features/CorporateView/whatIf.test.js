// src/features/CorporateView/whatIf.test.js — suite de tests del simulador What-If (corporate-what-if)
// Cubre el spec corporate-what-if: proyección lineal de ventas y ganancias, sin persistencia en localStorage,
// coincidencia en precio base y advertencia de margen <= 0 sin lanzar error.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español).

import { describe, expect, it } from 'vitest';
import { simulatePriceChange } from './services/whatIfService.js';

describe('corporate-what-if: Simulador What-If de precios de menú (read-only)', () => {
  it('Scenario 1: Proyección lineal proyecta ventas y ganancia según nuevo precio', () => {
    // Producto de $10.000, costo $5.000, ventas base $200.000.
    const product = { price: 10000, cost: 5000 };
    const baseSales = 200000;
    const newPrice = 12000;

    const result = simulatePriceChange(product, newPrice, baseSales);

    expect(result.projectedSales).toBe(240000); // 200000 * 1.2
    expect(result.projectedProfit).toBe(140000); // 240000 * ((12000 - 5000)/12000) = 240000 * (7/12) = 140000
    expect(result.marginPercentage).toBeCloseTo(58.33, 1);
    expect(result.hasWarning).toBe(false);
  });

  it('Scenario 2: Precio igual al actual coincide exactamente con la línea base', () => {
    const product = { price: 10000, cost: 5000 };
    const baseSales = 200000;

    const result = simulatePriceChange(product, 10000, baseSales);

    expect(result.projectedSales).toBe(200000);
    expect(result.projectedProfit).toBe(100000);
    expect(result.marginPercentage).toBe(50);
  });

  it('Scenario 3: Precio menor o igual al costo muestra advertencia de margen <= 0 sin lanzar excepción', () => {
    const product = { price: 10000, cost: 5000 };

    const result = simulatePriceChange(product, 4500, 200000);

    expect(result.hasWarning).toBe(true);
    expect(result.marginPercentage).toBeLessThanOrEqual(0);
    expect(Number.isNaN(result.projectedSales)).toBe(false);
  });
});
