// src/features/ClientView/services/splitService.test.js — tests unit RED del servicio de split (account-split PR1)
// Cubre los escenarios del spec account-split para la lógica pura de división:
// invitante de conservación Σ parciales === total, redondeo largest-remainder con
// tie-break por guest id, fracciones válidas/bloqueadas/rechazadas y casos borde.
// Sigue strict_tdd: estos tests se escriben ANTES de la implementación (Phase 1 RED).

// API de Vitest importada explícitamente (mismo patrón que las otras suites).
import { describe, expect, it } from 'vitest';
// Servicio puro de división de cuentas (aún no implementado en Phase 1).
import {
  applyLargestRemainder,
  applyPayment,
  buildGuests,
  calculateByItem,
  calculateEqualShares,
  calculateFractions,
  checkConservation,
  splitByMode,
} from './splitService.js';

describe('splitService: buildGuests — comensales numerados sin registro', () => {
  it('deriva Comensal 1..N con ids estables y estado pending', () => {
    // Pide 4 comensales (spec: mesa con 4 guests).
    const guests = buildGuests(4);
    // Genera exactamente 4 comensales.
    expect(guests).toHaveLength(4);
    // Cada comensal queda numerado como "Comensal N" (spec: numerados sin registro).
    expect(guests.map((g) => g.label)).toEqual([
      'Comensal 1',
      'Comensal 2',
      'Comensal 3',
      'Comensal 4',
    ]);
    // Los ids son estables guest-1..N (base del tie-break de redondeo).
    expect(guests.map((g) => g.id)).toEqual(['guest-1', 'guest-2', 'guest-3', 'guest-4']);
    // Ningún comensal arranca pagado (spec: status pending inicial).
    expect(guests.every((g) => g.status === 'pending')).toBe(true);
  });

  it('triangula: count 1 genera un único comensal (escenario single guest)', () => {
    // Un solo comensal en la mesa.
    const guests = buildGuests(1);
    // Existe exactamente un comensal numerado.
    expect(guests).toHaveLength(1);
    // Ese comensal es el número 1.
    expect(guests[0].label).toBe('Comensal 1');
  });
});

describe('splitService: invariante de conservación Σ parciales === total', () => {
  // Carrito demo de $10.000: 2 líneas (4000x2 + 2000x1).
  const cart = [
    { id: 'a', name: 'Plato A', price: 4000, qty: 2 },
    { id: 'b', name: 'Bebida B', price: 2000, qty: 1 },
  ];

  it('mantiene Σ totals === cartTotal en los 4 modos (full, equal, by_item, item_fraction)', () => {
    // Modo full: el total completo cae en el primer comensal (default).
    const full = splitByMode('full', cart, {}, 4);
    // sum(checkConservation) debe confirmar la conservación exacta en CLP.
    expect(checkConservation(full.totals, full.total)).toBe(true);
    // El total reportado coincide con la suma del carrito (10.000).
    expect(full.total).toBe(10000);

    // Modo equal: reparte equitativo con largest-remainder.
    const equal = splitByMode('equal', cart, {}, 4);
    // La suma de parciales debe ser exactamente el total del carrito.
    expect(checkConservation(equal.totals, equal.total)).toBe(true);

    // Modo by_item: cada línea asignada a un comensal.
    const byItem = splitByMode('by_item', cart, { a: 'guest-1', b: 'guest-2' }, 4);
    // La suma de parciales por ítem debe conservar el total.
    expect(checkConservation(byItem.totals, byItem.total)).toBe(true);

    // Modo item_fraction: fracciones por línea que suman la cantidad de la línea.
    const fractions = splitByMode(
      'item_fraction',
      cart,
      { a: { 'guest-1': 1, 'guest-2': 1 }, b: { 'guest-3': 1 } },
      4,
    );
    // La suma de parciales fraccionados debe conservar el total.
    expect(checkConservation(fractions.totals, fractions.total)).toBe(true);
  });

  it('default full (sin mode) conserva el total y no deja nada sin repartir', () => {
    // Sin modo explícito: cae en el default 'full' (spec: exactly one mode, default full).
    const result = splitByMode(undefined, cart, {}, 4);
    // El invitante de conservación se cumple en el modo por defecto.
    expect(checkConservation(result.totals, result.total)).toBe(true);
    // El modo default no deja ninguna línea sin asignar.
    expect(result.unassigned).toEqual([]);
  });
});

describe('splitService: redondeo largest-remainder determinista', () => {
  it('10.000 entre 3 → 3.334 / 3.333 / 3.333 (suma exacta 10.000)', () => {
    // Aplica el redondeo por resto mayor a 3 cuotas exactas de 3333.33.
    const shares = applyLargestRemainder([10000 / 3, 10000 / 3, 10000 / 3], 10000);
    // El primer comensal (tie-break por guest id) recibe el peso extra.
    expect(shares).toEqual([3334, 3333, 3333]);
    // La suma de las cuotas redondeadas conserva el total exacto.
    expect(shares.reduce((sum, s) => sum + s, 0)).toBe(10000);
  });

  it('es determinista: misma entrada → misma salida en llamadas repetidas', () => {
    // Primera ejecución del redondeo.
    const first = applyLargestRemainder([10000 / 3, 10000 / 3, 10000 / 3], 10000);
    // Segunda ejecución (tie-break estable por guest id, no por orden aleatorio).
    const second = applyLargestRemainder([10000 / 3, 10000 / 3, 10000 / 3], 10000);
    // Ambas ejecuciones producen exactamente la misma distribución.
    expect(second).toEqual(first);
  });

  it('triangula: montos con restos distintos distribuyen el peso al mayor resto', () => {
    // Shares exactos 5.000 / 2.500 / 1.666.66 — floors 5000, 2500, 1666 (suma 9166).
    const shares = applyLargestRemainder([5000, 2500, 5000 / 3], 9167);
    // El resto (1) va al mayor resto fraccional (el 1666.66 → 1667).
    expect(shares).toEqual([5000, 2500, 1667]);
    // La suma redondeada conserva el total indicado.
    expect(shares.reduce((sum, s) => sum + s, 0)).toBe(9167);
  });

  it('calculateEqualShares divide de forma exacta y conservadora', () => {
    // 10.000 en partes iguales para 3 comensales.
    const shares = calculateEqualShares(10000, 3);
    // Reparte con la regla de resto mayor (guest-1 lleva el extra).
    expect(shares).toEqual([3334, 3333, 3333]);
    // La suma de las partes iguales es el total exacto.
    expect(shares.reduce((sum, s) => sum + s, 0)).toBe(10000);
  });
});

describe('splitService: división por ítem (by_item)', () => {
  it('suma price×qty por comensal según las asignaciones de línea', () => {
    // Carrito de 2 líneas: A 8000 (4000x2) y B 2000.
    const cart = [
      { id: 'a', name: 'Plato A', price: 4000, qty: 2 },
      { id: 'b', name: 'Bebida B', price: 2000, qty: 1 },
    ];
    // Asigna la línea A al comensal 1 y la línea B al comensal 2.
    const totals = calculateByItem(cart, { a: 'guest-1', b: 'guest-2' });
    // El comensal 1 carga la línea A completa (4000 x 2).
    expect(totals['guest-1']).toBe(8000);
    // El comensal 2 carga la línea B completa.
    expect(totals['guest-2']).toBe(2000);
  });

  it('splitByMode by_item expone en unassigned las líneas sin asignación', () => {
    // Carrito de 2 líneas con solo una asignada.
    const cart = [
      { id: 'a', name: 'Plato A', price: 4000, qty: 2 },
      { id: 'b', name: 'Bebida B', price: 2000, qty: 1 },
    ];
    // Divide por ítem asignando únicamente la línea A.
    const result = splitByMode('by_item', cart, { a: 'guest-1' }, 2);
    // La línea B sin asignar queda señalada como sin repartir.
    expect(result.unassigned.map((line) => line.id)).toEqual(['b']);
  });
});

describe('splitService: fracciones (item_fraction)', () => {
  it('0.5 + 0.5 sobre qty 1 es válido y reparte 500/500 (spec: Fractions valid)', () => {
    // Línea única de $1.000 con cantidad 1.
    const cart = [{ id: 'x', name: 'Compartido', price: 1000, qty: 1 }];
    // Dos comensales asignan media unidad cada uno.
    const totals = calculateFractions(cart, { x: { 'guest-1': 0.5, 'guest-2': 0.5 } });
    // Cada comensal carga la mitad del precio de la línea.
    expect(totals['guest-1']).toBe(500);
    // El segundo comensal carga la otra mitad.
    expect(totals['guest-2']).toBe(500);
    // La línea queda completamente asignada (sin unassigned).
    const result = splitByMode('item_fraction', cart, { x: { 'guest-1': 0.5, 'guest-2': 0.5 } }, 2);
    expect(result.unassigned).toEqual([]);
  });

  it('0.5 sola sobre qty 1 deja 0.5 sin repartir (spec: Unassigned bloquea)', () => {
    // Línea única de $1.000 con cantidad 1.
    const cart = [{ id: 'x', name: 'Compartido', price: 1000, qty: 1 }];
    // Solo un comensal asigna su media unidad.
    const result = splitByMode('item_fraction', cart, { x: { 'guest-1': 0.5 } }, 2);
    // La línea queda señalada como sin repartir (falta 0.5 de qty).
    expect(result.unassigned.map((line) => line.id)).toEqual(['x']);
  });

  it('fracción 1.5 sobre qty 1 es rechazada (spec: Over quantity)', () => {
    // Línea única de $1.000 con cantidad 1.
    const cart = [{ id: 'x', name: 'Compartido', price: 1000, qty: 1 }];
    // Un comensal intenta asignar más cantidad que la línea.
    const result = splitByMode('item_fraction', cart, { x: { 'guest-1': 1.5 } }, 2);
    // La asignación inválida deja la línea sin repartir (rechazada).
    expect(result.unassigned.map((line) => line.id)).toEqual(['x']);
  });
});

describe('splitService: casos borde (empty cart y single guest)', () => {
  it('carrito vacío → todos los parciales en 0 y el invariante se mantiene', () => {
    // Carrito vacío en modo full con 4 comensales.
    const result = splitByMode('full', [], {}, 4);
    // Ningún comensal tiene monto asignado.
    expect(Object.values(result.totals).every((amount) => amount === 0)).toBe(true);
    // La suma de parciales (0) conserva el total del carrito (0).
    expect(checkConservation(result.totals, result.total)).toBe(true);
  });

  it('1 solo comensal → su parcial es el total del carrito (spec: Single guest)', () => {
    // Carrito de $10.000 con un único comensal.
    const cart = [{ id: 'a', name: 'Plato A', price: 10000, qty: 1 }];
    // Divide en modo equal con un solo guest.
    const equal = splitByMode('equal', cart, {}, 1);
    // El único comensal carga el total completo.
    expect(equal.totals['guest-1']).toBe(equal.total);
    // El invariante se mantiene con un único comensal.
    expect(checkConservation(equal.totals, equal.total)).toBe(true);
  });

  it('checkConservation detecta un descuadre de 1 CLP', () => {
    // Parciales que suman 10.000 contra un total de 10.000.
    expect(checkConservation({ 'guest-1': 3334, 'guest-2': 3333, 'guest-3': 3333 }, 10000)).toBe(true);
    // Los mismos parciales contra un total de 9.999 deben fallar la conservación.
    expect(checkConservation({ 'guest-1': 3334, 'guest-2': 3333, 'guest-3': 3333 }, 9999)).toBe(false);
  });
});

describe('splitService: applyPayment — transición de estado del comensal', () => {
  it('marca solo el comensal indicado como paid y registra su monto (spec: Partial payment)', () => {
    // Comensal inicial en estado pending.
    const guest = { id: 'guest-2', label: 'Comensal 2', status: 'pending' };
    // Aplica el pago de su cuota (2.500 CLP).
    const paid = applyPayment(guest, 2500);
    // El comensal pasa a estado paid.
    expect(paid.status).toBe('paid');
    // El monto pagado queda registrado en la cuota.
    expect(paid.amountPaid).toBe(2500);
    // El objeto original no se muta (inmutabilidad del servicio puro).
    expect(guest.status).toBe('pending');
  });

  it('triangula: otro monto y comensal conservan label e id intactos', () => {
    // Comensal inicial con label e id propios.
    const guest = { id: 'guest-1', label: 'Comensal 1', status: 'pending' };
    // Aplica el pago de 3.334 CLP.
    const paid = applyPayment(guest, 3334);
    // El estado cambia a paid.
    expect(paid.status).toBe('paid');
    // El monto pagado es el indicado.
    expect(paid.amountPaid).toBe(3334);
    // El id y el label persisten sin alteración.
    expect(paid.id).toBe('guest-1');
    expect(paid.label).toBe('Comensal 1');
  });
});