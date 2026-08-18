// src/mocks/tables.test.js — contrato del fixture de mesas (waiter-interactive-tables + Radar)
// Garantiza el contrato aditivo del fixture tables.json: 12 mesas, campos
// `seats` y `status` presentes en TODAS (el badge de la grilla y el plano
// topológico de Radar dependen de ellos), mix de estados (occupied, billing,
// free, cleaning, waiting_food, bill_requested) y al menos 1 mesa `occupied`
// con `order` para el demo de consumo (spec waiter-interactive-tables).
// RED-GREEN: escrito ANTES de agregar t9..t12 (falla con las 8 actuales).

// API de Vitest importada explícitamente (ESLint no declara los globals).
import { describe, expect, it } from 'vitest';
// Fixture canónico de mesas (fuente única de la demo, compartida con Radar/Pos).
import tablesData from './tables.json';

describe('tables.json (waiter-interactive-tables: fixture aditivo 8 → 12)', () => {
  it('tiene 12 mesas con id y number únicos', () => {
    // La grilla del garzón debe renderizar las 12 mesas del fixture.
    expect(tablesData).toHaveLength(12);
    // Los ids deben ser únicos (clave de render de las cards).
    const ids = tablesData.map((t) => t.id);
    expect(new Set(ids).size).toBe(12);
    // Los números de mesa también únicos (identidad operacional).
    const numbers = tablesData.map((t) => t.number);
    expect(new Set(numbers).size).toBe(12);
  });

  it('todas las mesas definen seats y status (invariantes de Radar y del badge)', () => {
    // Cada mesa debe exponer ambos campos para que `seats ?? 4` y el mapping
    // de estados sigan funcionando sin cambios en los consumidores compartidos.
    tablesData.forEach((table) => {
      // seats presente (número positivo).
      expect(typeof table.seats).toBe('number');
      expect(table.seats).toBeGreaterThan(0);
      // status presente y dentro del set de estados soportados por TableGrid.
      expect(['occupied', 'waiting_food', 'bill_requested', 'billing', 'cleaning', 'free']).toContain(
        table.status,
      );
    });
  });

  it('tiene un mix de estados con al menos 1 mesa occupied con order (demo de consumo)', () => {
    // Estados distintos presentes en el fixture (mix realista del salón).
    const statuses = new Set(tablesData.map((t) => t.status));
    // Al menos 3 estados distintos (no un fixture plano).
    expect(statuses.size).toBeGreaterThanOrEqual(3);
    // Al menos 1 mesa ocupada CON comanda para abrir el modal de consumo.
    const occupiedWithOrder = tablesData.filter(
      (t) => t.status === 'occupied' && t.order && t.order.items.length > 0,
    );
    expect(occupiedWithOrder.length).toBeGreaterThanOrEqual(1);
  });
});
