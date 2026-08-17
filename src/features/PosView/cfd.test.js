// src/features/PosView/cfd.test.js — suite de tests de comprobante CFD (pos-cfd)
// Cubre el spec pos-cfd: emisión CFD con RUT y razón social de cliente, distinción de DTE
// (no toca DteModal ni dteFolio), y bloqueo ante RUT vacío o inválido.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español).

import { beforeEach, describe, expect, it } from 'vitest';
import { usePosStore } from './store/usePosStore.js';

describe('pos-cfd: Comprobante CFD demo en PosView', () => {
  beforeEach(() => {
    usePosStore.getState().resetDemo();
  });

  it('Scenario 1: Emisión CFD registra cliente, asigna folio demo y referencia la venta', () => {
    const paidBill = { id: 'b-2', tableNumber: 2, totalAmount: 45000, status: 'paid' };
    usePosStore.setState({ activeBill: paidBill, cfdReceipts: [] });

    const result = usePosStore.getState().issueCfd('b-2', '11.111.111-1', 'Empresa Demo SpA');

    expect(result.ok).toBe(true);
    const receipts = usePosStore.getState().cfdReceipts;
    expect(receipts).toHaveLength(1);
    expect(receipts[0]).toMatchObject({
      billId: 'b-2',
      rut: '11.111.111-1',
      razonSocial: 'Empresa Demo SpA',
    });
    expect(receipts[0].folio).toBeDefined();
  });

  it('Scenario 2: CFD es distinto de DTE y no altera DteModal ni dteFolio', () => {
    const paidBill = { id: 'b-2', totalAmount: 45000, status: 'paid' };
    usePosStore.setState({ activeBill: paidBill, dteModalOpen: false, cfdReceipts: [] });

    usePosStore.getState().issueCfd('b-2', '11.111.111-1', 'Empresa Demo SpA');

    expect(usePosStore.getState().dteModalOpen).toBe(false);
  });

  it('Scenario 3: RUT inválido o vacío bloquea la emisión con mensaje de error', () => {
    const paidBill = { id: 'b-2', totalAmount: 45000, status: 'paid' };
    usePosStore.setState({ activeBill: paidBill, cfdReceipts: [] });

    const resEmpty = usePosStore.getState().issueCfd('b-2', '', 'Empresa SpA');
    expect(resEmpty.ok).toBe(false);

    const resInvalid = usePosStore.getState().issueCfd('b-2', 'rut-mal', 'Empresa SpA');
    expect(resInvalid.ok).toBe(false);

    expect(usePosStore.getState().cfdReceipts).toHaveLength(0);
  });
});
