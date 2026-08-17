// src/features/PosView/counterMode.test.js — suite de tests de modo mostrador (pos-counter-mode)
// Cubre el spec pos-counter-mode: coexistencia con el flujo de mesa (openBills intactas),
// venta rápida con publicación de payment.completed (tableNumber: null), vaciado de counterCart
// y bloqueo de pago con carrito vacío.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español).

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePosStore } from './store/usePosStore.js';

describe('pos-counter-mode: Modo mostrador para venta rápida sin mesa en PosView', () => {
  beforeEach(() => {
    usePosStore.getState().resetDemo();
  });

  it('Scenario 1: Coexistencia — activar modo mostrador conserva openBills y activeBill intactos', () => {
    const initialBills = usePosStore.getState().openBills;
    const initialActive = usePosStore.getState().activeBill;

    usePosStore.getState().setCounterMode(true);

    expect(usePosStore.getState().counterMode).toBe(true);
    expect(usePosStore.getState().openBills).toBe(initialBills);
    expect(usePosStore.getState().activeBill).toBe(initialActive);
  });

  it('Scenario 2: Venta de mostrador completa emite payment.completed con tableNumber: null y vacía el carrito', () => {
    const fakeBus = { publish: vi.fn() };
    usePosStore.setState({
      counterMode: true,
      counterCart: [
        { id: 'm1', name: 'Hamburguesa Clásica', price: 12500, qty: 1 },
        { id: 'm5', name: 'Limonada Menta', price: 3800, qty: 1 },
      ],
    });

    const result = usePosStore.getState().payCounterCart('efectivo', fakeBus);

    expect(result.ok).toBe(true);
    expect(fakeBus.publish).toHaveBeenCalledWith(
      'payment.completed',
      expect.objectContaining({
        tableNumber: null,
        amount: 16300,
      }),
    );
    expect(usePosStore.getState().counterCart).toHaveLength(0);
  });

  it('Scenario 3: Carrito de mostrador vacío bloquea la confirmación de pago', () => {
    const fakeBus = { publish: vi.fn() };
    usePosStore.setState({ counterMode: true, counterCart: [] });

    const result = usePosStore.getState().payCounterCart('efectivo', fakeBus);

    expect(result.ok).toBe(false);
    expect(fakeBus.publish).not.toHaveBeenCalledWith('payment.completed', expect.anything());
  });
});
