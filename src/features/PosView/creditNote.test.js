// src/features/PosView/creditNote.test.js — suite de tests de nota de crédito con PIN admin (pos-credit-note)
// Cubre el spec pos-credit-note: aprobación con PIN admin 9921, rechazo con PIN incorrecto,
// aislamiento de DTE/BlindClose/cashShift y deshabilitación sin venta pagada seleccionada.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español).

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePosStore } from './store/usePosStore.js';

describe('pos-credit-note: Nota de crédito con PIN admin en PosView', () => {
  beforeEach(() => {
    usePosStore.getState().resetDemo();
  });

  it('Scenario 1: Aprobación con PIN 9921 registra la nota de crédito referenciando la venta', () => {
    // Venta pagada b-1 ($20.000) seleccionada.
    const paidBill = { id: 'b-1', tableNumber: 5, total: 20000, status: 'paid' };
    usePosStore.setState({ activeBill: paidBill, creditNotes: [] });

    // Registra nota de crédito con PIN 9921.
    const result = usePosStore.getState().issueCreditNote('b-1', 20000, 'Devolución por atención', '9921');

    expect(result.ok).toBe(true);
    const notes = usePosStore.getState().creditNotes;
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ billId: 'b-1', amount: 20000, reason: 'Devolución por atención' });
  });

  it('Scenario 2: PIN incorrecto bloquea la emisión sin registrar la nota', () => {
    const paidBill = { id: 'b-1', total: 20000, status: 'paid' };
    usePosStore.setState({ activeBill: paidBill, creditNotes: [] });

    const result = usePosStore.getState().issueCreditNote('b-1', 20000, 'Devolución', '0000');

    expect(result.ok).toBe(false);
    expect(result.error).toBe('PIN de administrador incorrecto');
    expect(usePosStore.getState().creditNotes).toHaveLength(0);
  });

  it('Scenario 3: Aislamiento total — no toca DTE, BlindClose, cashShift ni publica shift.closed', () => {
    const fakeBus = { publish: vi.fn() };
    const paidBill = { id: 'b-1', total: 20000, status: 'paid' };
    usePosStore.setState({
      activeBill: paidBill,
      dteModalOpen: false,
      blindCloseOpen: false,
      cashShift: { isOpen: true },
    });

    usePosStore.getState().issueCreditNote('b-1', 20000, 'Error tipeo', '9921', fakeBus);

    expect(usePosStore.getState().dteModalOpen).toBe(false);
    expect(usePosStore.getState().blindCloseOpen).toBe(false);
    expect(usePosStore.getState().cashShift.isOpen).toBe(true);
    expect(fakeBus.publish).not.toHaveBeenCalledWith('shift.closed', expect.anything());
    expect(fakeBus.publish).not.toHaveBeenCalledWith('payment.completed', expect.anything());
  });

  it('Scenario 4: Sin venta pagada seleccionada bloquea la emisión', () => {
    usePosStore.setState({ activeBill: null, creditNotes: [] });

    const result = usePosStore.getState().issueCreditNote(null, 10000, 'Devolución', '9921');

    expect(result.ok).toBe(false);
    expect(usePosStore.getState().creditNotes).toHaveLength(0);
  });
});
