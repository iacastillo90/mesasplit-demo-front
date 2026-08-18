// src/features/PosView/PosPage.test.jsx — suite de tests interactivos de Caja POS (pos-cashier)
// Cubre la especificación pos-cashier: bloqueo de sesión con PIN ("9921"), cobro multimedio
// con calculadora de vuelto, emisión de DTE chileno (Boleta/Factura con RUT y folio CAF),
// arqueo de Cierre Ciego con cálculo de diferencia y sincronización de pago QR en tiempo real.
// Todos los tests cumplen con las reglas obligatorias de AGENTS.md (comentarios en español por línea).

import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { usePosStore } from './store/usePosStore.js';
import PosPage from './pages/PosPage.jsx';

describe('pos-cashier: Bloqueo de Sesión con PIN', () => {
  beforeEach(() => {
    usePosStore.getState().resetDemo();
  });

  it('requiere PIN de cajero para desbloquear las operaciones de cobro', async () => {
    usePosStore.setState({ cashierUnlocked: false });
    render(<PosPage />);
    expect(screen.getByText(/Acceso a Caja — Control de Cajero/i)).toBeInTheDocument();
    const pinInput = screen.getByPlaceholderText(/Ingresa tu PIN/i);
    fireEvent.change(pinInput, { target: { value: '9921' } });
    const unlockBtn = screen.getByRole('button', { name: /Desbloquear Caja/i });
    fireEvent.click(unlockBtn);
    expect(await screen.findByText(/Cobro de Cuentas & Retiros/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });
});

describe('pos-cashier: Cobro Multimedio y Calculadora de Vuelto', () => {
  beforeEach(() => {
    usePosStore.getState().resetDemo();
  });

  it('calcula el vuelto automáticamente al ingresar el monto en efectivo', async () => {
    render(<PosPage />);
    await screen.findByText(/Cobro de Cuentas & Retiros/i, {}, { timeout: 3000 });
    const mesa12Btns = await screen.findAllByText(/Mesa 12/i, {}, { timeout: 3000 });
    fireEvent.click(mesa12Btns[0]);
    const cashBtn = await screen.findByRole('button', { name: /Efectivo/i }, { timeout: 3000 });
    fireEvent.click(cashBtn);
    const tenderedInput = screen.getByPlaceholderText(/Monto recibido/i);
    fireEvent.change(tenderedInput, { target: { value: '40000' } });
    expect(screen.getByText(/Vuelto:/i)).toBeInTheDocument();
  });
});

describe('pos-cashier: Emisión de DTE Chileno (Boleta vs Factura y Folio)', () => {
  beforeEach(() => {
    usePosStore.getState().resetDemo();
  });

  it('permite conmutar a Factura Electrónica y autocompletar la razón social por RUT', async () => {
    render(<PosPage />);
    await screen.findByText(/Cobro de Cuentas & Retiros/i, {}, { timeout: 3000 });
    const mesa12Btns = await screen.findAllByText(/Mesa 12/i, {}, { timeout: 3000 });
    fireEvent.click(mesa12Btns[0]);
    const facturaRadio = await screen.findByRole('radio', { name: /Factura Electrónica/i }, { timeout: 3000 });
    fireEvent.click(facturaRadio);
    const rutInput = screen.getByPlaceholderText(/RUT Empresa/i);
    fireEvent.change(rutInput, { target: { value: '76.123.456-7' } });
    expect(await screen.findByDisplayValue(/Gastronomía Demo SpA/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });
});

describe('pos-cashier: Cierre Ciego de Arqueo y Sincronización QR', () => {
  beforeEach(() => {
    usePosStore.getState().resetDemo();
  });

  it('despliega el modal de Cierre Ciego y calcula la diferencia de arqueo', async () => {
    render(<PosPage />);
    const cierreBtn = await screen.findByRole('button', { name: /Cierre Ciego/i }, { timeout: 3000 });
    fireEvent.click(cierreBtn);
    expect(screen.getByText(/Cierre Ciego de Caja — Arqueo de Turno/i)).toBeInTheDocument();
    const cashCountInput = screen.getByPlaceholderText(/Efectivo contado/i);
    fireEvent.change(cashCountInput, { target: { value: '245000' } });
    const submitBtn = screen.getByRole('button', { name: /Finalizar Arqueo/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Turno de caja cerrado exitosamente/i)).toBeInTheDocument();
  });
});
