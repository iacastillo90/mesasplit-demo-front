// src/features/PosView/CashShift.test.jsx — suite de tests de turno de caja (cash-shift)
// Cubre el spec cash-shift: apertura de turno, cierre con resumen, persistencia en localStorage
// (clave mesasplit-cash-shift sin bills transitorios) y verificación de que closeCashShift no emite shift.closed ni altera blindCloseOpen.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Store de POS y bus exportado posBus.
import { posBus, usePosStore } from './store/usePosStore.js';

describe('cash-shift: Turno de caja operativo en PosView', () => {
  beforeEach(() => {
    // Restablece el store de POS antes de cada prueba.
    usePosStore.getState().resetDemo();
  });

  it('Scenario 1: Apertura de turno registra openedAt e initialAmount y cambia status a open', () => {
    // Estado inicial de cashShift es closed.
    expect(usePosStore.getState().cashShift.status).toBe('closed');

    // Abre el turno con un fondo inicial de $50.000 CLP.
    usePosStore.getState().openCashShift({ initialAmount: 50000 });

    const state = usePosStore.getState().cashShift;
    expect(state.status).toBe('open');
    expect(typeof state.openedAt).toBe('number');
    expect(state.initialAmount).toBe(50000);
  });

  it('Scenario 2: Cierre de turno registra closedAt y summary y cambia status a closed', () => {
    // Abre el turno de caja.
    usePosStore.getState().openCashShift({ initialAmount: 30000 });

    // Cierra el turno de caja pasando el resumen acumulado.
    usePosStore.getState().closeCashShift({ totalVendido: 185000 });

    const state = usePosStore.getState().cashShift;
    expect(state.status).toBe('closed');
    expect(typeof state.closedAt).toBe('number');
    expect(state.summary?.totalVendido).toBe(185000);
  });

  it('Scenario 3: Persistencia del turno en localStorage bajo mesasplit-cash-shift sin bills transitorios', () => {
    // Abre el turno de caja con fondo inicial.
    usePosStore.getState().openCashShift({ initialAmount: 75000 });

    // Lee el contenido de localStorage guardado por la clave de persistencia del store.
    const rawStorage = window.localStorage.getItem('mesasplit-cash-shift');
    expect(rawStorage).not.toBeNull();

    const parsed = JSON.parse(rawStorage ?? '{}');
    // Verifica que el estado persistido contiene la estructura de cashShift.
    expect(parsed.state?.cashShift?.status).toBe('open');
    expect(parsed.state?.cashShift?.initialAmount).toBe(75000);

    // Verifica que los atributos transitorios (openBills, activeBill, etc.) NO están persistidos.
    expect(parsed.state?.openBills).toBeUndefined();
    expect(parsed.state?.activeBill).toBeUndefined();
  });

  it('Scenario 4: closeCashShift no publica shift.closed ni altera blindCloseOpen', () => {
    // Espía la instancia real del bus de POS.
    const publishSpy = vi.spyOn(posBus, 'publish');

    // Abre el turno.
    usePosStore.getState().openCashShift({ initialAmount: 20000 });

    // Estado inicial de blindCloseOpen es false.
    const initialBlindClose = usePosStore.getState().blindCloseOpen;

    // Cierra el turno operativo.
    usePosStore.getState().closeCashShift({ totalVendido: 100 });

    // shift.closed no debe emitirse por closeCashShift.
    expect(publishSpy).not.toHaveBeenCalledWith('shift.closed', expect.anything());
    // blindCloseOpen debe permanecer inalterado.
    expect(usePosStore.getState().blindCloseOpen).toBe(initialBlindClose);

    publishSpy.mockRestore();
  });
});
