// src/features/ClientView/store/useSplitStore.test.js — tests unit RED del store de split (account-split PR1)
// Cubre los escenarios del spec account-split sobre el slice Zustand: modo por
// defecto, comensales derivados sin registro, pago parcial pending→paid, totals
// derivados nunca cacheados y reset de allocaciones ante cambios del carrito.
// Sigue strict_tdd: se escribe ANTES de la implementación (Phase 1 RED).

// API de Vitest importada explícitamente (patrón de las suites existentes).
import { beforeEach, describe, expect, it } from 'vitest';
// Store de división y selectores puros derivados del servicio.
import {
  selectCanConfirm,
  selectGuestTotals,
  selectUnassigned,
  useSplitStore,
} from './useSplitStore.js';
// Enums del dominio de división de cuenta.
import { GUEST_PAYMENT_STATUS, SPLIT_TYPE } from '../../../shared/constants/index.js';

// Carrito compartido demo de $10.000 (2 líneas) para los escenarios del spec.
const CART = [
  { id: 'a', name: 'Plato A', price: 4000, qty: 2 },
  { id: 'b', name: 'Bebida B', price: 2000, qty: 1 },
];

describe('useSplitStore: estado inicial y modo por defecto', () => {
  beforeEach(() => {
    // Limpia el estado del store entre tests (restablece a los valores iniciales).
    useSplitStore.getState().closeSplit();
    useSplitStore.getState().resetDemo();
  });

  it('el modo por defecto es full al abrir el split (spec: Default mode)', () => {
    // Abre el split con el carrito demo.
    useSplitStore.getState().openSplit(CART);
    // El modo activo es full cuando se abre el divisor.
    expect(useSplitStore.getState().mode).toBe(SPLIT_TYPE.FULL);
    // Full es el valor estable del enum compartido.
    expect(SPLIT_TYPE.FULL).toBe('full');
  });

  it('openSplit deriva los comensales Comensal 1..4 sin registro (spec: Guests derived)', () => {
    // Abre el split con el carrito demo (la mesa tiene 4 guests según tableContext).
    useSplitStore.getState().openSplit(CART);
    // Existe un comensal por cada guest de la mesa.
    expect(useSplitStore.getState().guests).toHaveLength(4);
    // Los comensales se numeran del 1 al 4.
    expect(useSplitStore.getState().guests.map((g) => g.label)).toEqual([
      'Comensal 1',
      'Comensal 2',
      'Comensal 3',
      'Comensal 4',
    ]);
    // El carrito queda fotografiado en el snapshot del split.
    expect(useSplitStore.getState().cartSnapshot).toBe(CART);
    // El split queda abierto.
    expect(useSplitStore.getState().open).toBe(true);
  });
});

describe('useSplitStore: pago parcial pending→paid', () => {
  beforeEach(() => {
    // Abre un split limpio con el carrito demo antes de cada test.
    useSplitStore.getState().resetDemo();
    useSplitStore.getState().openSplit(CART);
  });

  it('markPaid transiciona solo al comensal indicado (spec: Partial payment)', () => {
    // Marca como pagado únicamente al comensal 1.
    useSplitStore.getState().markPaid('guest-1');
    // El comensal 1 pasa a estado paid.
    expect(useSplitStore.getState().guests.find((g) => g.id === 'guest-1').status).toBe(
      GUEST_PAYMENT_STATUS.PAID,
    );
    // Los comensales 2 a 4 permanecen en pending.
    expect(
      useSplitStore
        .getState()
        .guests.filter((g) => g.id !== 'guest-1')
        .every((g) => g.status === GUEST_PAYMENT_STATUS.PENDING),
    ).toBe(true);
  });

  it('registra el monto pagado en payments (shape guestId → monto CLP)', () => {
    // Marca como pagado al comensal 1 en modo full (carga el total de $10.000).
    useSplitStore.getState().markPaid('guest-1');
    // El registro de pagos guarda el monto de la cuota del comensal 1.
    expect(useSplitStore.getState().payments['guest-1']).toBe(10000);
  });
});

describe('useSplitStore: totals derivados nunca cacheados', () => {
  beforeEach(() => {
    // Abre un split limpio con el carrito demo antes de cada test.
    useSplitStore.getState().resetDemo();
    useSplitStore.getState().openSplit(CART);
  });

  it('selectGuestTotals re-deriva al cambiar el modo (spec: Totals refresh)', () => {
    // Deriva los totals en modo full ($10.000 al comensal 1).
    const fullTotals = selectGuestTotals(useSplitStore.getState());
    // En full el comensal 1 carga el total del carrito.
    expect(fullTotals['guest-1']).toBe(10000);
    // Cambia a modo equal (4 comensales → 2.500 cada uno).
    useSplitStore.getState().setMode('equal');
    // Re-deriva los totals tras el cambio de modo: 2.500 por comensal.
    const equalTotals = selectGuestTotals(useSplitStore.getState());
    // Ningún comensal conserva el valor viejo del modo full.
    expect(equalTotals['guest-1']).toBe(2500);
    expect(equalTotals['guest-4']).toBe(2500);
  });

  it('el state del store no cachea totals (spec: store MUST NOT cache)', () => {
    // El estado crudo no expone ningún campo de totals cacheados.
    expect(useSplitStore.getState()).not.toHaveProperty('totals');
    // selectGuestTotals deriva en vivo desde el snapshot y las allocaciones.
    expect(selectGuestTotals(useSplitStore.getState())['guest-1']).toBe(10000);
  });

  it('selectGuestTotals re-deriva al cambiar las allocaciones (spec: Totals refresh)', () => {
    // Cambia a división por ítem.
    useSplitStore.getState().setMode('by_item');
    // Asigna la línea A al comensal 1 y la línea B al comensal 2.
    useSplitStore.getState().assignItem('guest-1', 'a');
    useSplitStore.getState().assignItem('guest-2', 'b');
    // Re-deriva: comensal 1 carga la línea A ($8.000) y comensal 2 la B ($2.000).
    const totals = selectGuestTotals(useSplitStore.getState());
    // El comensal 1 carga la línea A completa.
    expect(totals['guest-1']).toBe(8000);
    // El comensal 2 carga la línea B completa.
    expect(totals['guest-2']).toBe(2000);
  });
});

describe('useSplitStore: fracciones y bloqueo por sin repartir', () => {
  beforeEach(() => {
    // Abre un split limpio con el carrito demo antes de cada test.
    useSplitStore.getState().resetDemo();
    useSplitStore.getState().openSplit(CART);
  });

  it('assignFraction acepta 0.5+0.5 y desbloquea la confirmación (spec: Fractions valid)', () => {
    // Cambia a modo fracciones.
    useSplitStore.getState().setMode('item_fraction');
    // El comensal 1 asigna media unidad de la línea B (qty 1).
    useSplitStore.getState().assignFraction('guest-1', 'b', 0.5);
    // Con solo 0.5 repartido de B, A (qty 2) y B quedan sin repartir (spec: Unassigned).
    expect(selectUnassigned(useSplitStore.getState()).map((line) => line.id)).toEqual(['a', 'b']);
    // selectCanConfirm debe ser false mientras haya monto sin repartir (spec: Unassigned).
    expect(selectCanConfirm(useSplitStore.getState())).toBe(false);
    // El comensal 2 asigna la otra media unidad de B: B queda resuelta, A sigue sin repartir.
    useSplitStore.getState().assignFraction('guest-2', 'b', 0.5);
    expect(selectUnassigned(useSplitStore.getState()).map((line) => line.id)).toEqual(['a']);
    // Aún queda A sin fraccionar por completo: la confirmación sigue bloqueada.
    expect(selectCanConfirm(useSplitStore.getState())).toBe(false);
    // Reparte la línea A (qty 2) entre los dos comensales en fracciones unitarias.
    useSplitStore.getState().assignFraction('guest-1', 'a', 1);
    useSplitStore.getState().assignFraction('guest-2', 'a', 1);
    // Con todas las líneas fraccionadas al completo, ya no hay sin repartir.
    expect(selectUnassigned(useSplitStore.getState())).toEqual([]);
    // La confirmación queda habilitada al estar todo repartido.
    expect(selectCanConfirm(useSplitStore.getState())).toBe(true);
  });

  it('assignFraction rechaza una fracción mayor a la cantidad de la línea (spec: Over quantity)', () => {
    // Cambia a modo fracciones.
    useSplitStore.getState().setMode('item_fraction');
    // Intenta asignar 1.5 sobre una línea de cantidad 1.
    useSplitStore.getState().assignFraction('guest-1', 'b', 1.5);
    // La asignación inválida no se persiste en las allocaciones.
    expect(useSplitStore.getState().allocations['b']).toBeUndefined();
    // selectCanConfirm permanece en false (la línea sigue sin repartir).
    expect(selectCanConfirm(useSplitStore.getState())).toBe(false);
  });
});

describe('useSplitStore: syncWithCart ante cambios del carrito', () => {
  it('resetea allocations y payments cuando el carrito cambia (spec: Cart changes)', () => {
    // Abre el split con el carrito demo.
    useSplitStore.getState().resetDemo();
    useSplitStore.getState().openSplit(CART);
    // Asigna la línea B al comensal 2 para dejar allocaciones persistentes.
    useSplitStore.getState().setMode('by_item');
    useSplitStore.getState().assignItem('guest-2', 'b');
    // Marca como pagado al comensal 2 antes del cambio de carrito.
    useSplitStore.getState().markPaid('guest-2');
    // El carrito cambió (se agrega una línea C).
    const updatedCart = [...CART, { id: 'c', name: 'Postre C', price: 1000, qty: 1 }];
    useSplitStore.getState().syncWithCart(updatedCart);
    // Las allocaciones se resetearon tras el cambio de carrito.
    expect(useSplitStore.getState().allocations).toEqual({});
    // El snapshot quedó actualizado al nuevo carrito.
    expect(useSplitStore.getState().cartSnapshot).toBe(updatedCart);
  });

  it('addGuest incorpora un comensal numerado extra a la mesa', () => {
    // Abre el split con el carrito demo (4 comensales de tableContext).
    useSplitStore.getState().resetDemo();
    useSplitStore.getState().openSplit(CART);
    // Agrega un quinto comensal manualmente.
    useSplitStore.getState().addGuest();
    // Ahora hay 5 comensales en la mesa.
    expect(useSplitStore.getState().guests).toHaveLength(5);
    // El nuevo comensal se numera como Comensal 5.
    expect(useSplitStore.getState().guests[4].label).toBe('Comensal 5');
  });
});