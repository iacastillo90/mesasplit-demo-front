// src/features/WaiterView/services/performanceService.test.js — panel de rendimiento del garzón (waiter-performance)
// Cubre el spec waiter-performance: cálculo mediante selector puro selectWaiterPerformance(userId, users, tables),
// métricas derivadas de salesCountToday y mesas servidas, tolerancia a usuario no encontrado (0 sin NaN)
// e inmutabilidad de los stores (read-only).
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español).

import { describe, expect, it } from 'vitest';
import { selectWaiterPerformance } from './performanceService.js';

describe('waiter-performance: Métricas derivadas del rendimiento del garzón (read-only)', () => {
  it('Scenario 1: Deriva pedidos tomados, mesas servidas y ticket promedio para garzón registrado', () => {
    const mockUsers = [
      { id: 'pedro-soto', name: 'Pedro Soto', role: 'waiter', salesCountToday: 21, avgRating: 4.8 },
    ];
    const mockTables = [
      { id: 't1', waiterId: 'pedro-soto' },
      { id: 't2', waiterId: 'pedro-soto' },
      { id: 't3', waiterId: 'pedro-soto' },
      { id: 't4', waiterId: 'pedro-soto' },
    ];

    const result = selectWaiterPerformance('pedro-soto', mockUsers, mockTables);

    expect(result.ordersTaken).toBe(21);
    expect(result.tablesServed).toBe(4);
    expect(result.avgTicket).toBeGreaterThanOrEqual(0);
    expect(result.avgRating).toBe(4.8);
  });

  it('Scenario 2: Usuario sin registro devuelve métricas 0 sin lanzar NaN', () => {
    const result = selectWaiterPerformance('inexistente', [], []);

    expect(result.ordersTaken).toBe(0);
    expect(result.tablesServed).toBe(0);
    expect(result.avgTicket).toBe(0);
    expect(result.avgRating).toBe(0);
    expect(Number.isNaN(result.ordersTaken)).toBe(false);
    expect(Number.isNaN(result.tablesServed)).toBe(false);
    expect(Number.isNaN(result.avgTicket)).toBe(false);
    expect(Number.isNaN(result.avgRating)).toBe(false);
  });

  it('Scenario 3: Evaluación del selector no muta los datos de entrada', () => {
    const mockUsers = [{ id: 'pedro-soto', salesCountToday: 10 }];
    const mockTables = [{ id: 't1', waiterId: 'pedro-soto' }];
    const beforeUsers = JSON.stringify(mockUsers);
    const beforeTables = JSON.stringify(mockTables);

    selectWaiterPerformance('pedro-soto', mockUsers, mockTables);

    expect(JSON.stringify(mockUsers)).toBe(beforeUsers);
    expect(JSON.stringify(mockTables)).toBe(beforeTables);
  });
});
