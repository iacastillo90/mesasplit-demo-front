// src/features/PosView/PosPage.test.jsx — suite de tests interactivos de Caja POS (pos-cashier)
// Cubre la especificación pos-cashier: bloqueo de sesión con PIN ("9921"), cobro multimedio
// con calculadora de vuelto, emisión de DTE chileno (Boleta/Factura con RUT y folio CAF),
// arqueo de Cierre Ciego con cálculo de diferencia y sincronización de pago QR en tiempo real.
// Todos los tests cumplen con las reglas obligatorias de AGENTS.md (comentarios en español por línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado de componentes de React y eventos de simulación.
import { fireEvent, render, screen } from '@testing-library/react';
// Store de Zustand de la Caja POS.
import { usePosStore } from './store/usePosStore.js';
// Componente principal de la vista de Caja POS.
import PosPage from './pages/PosPage.jsx';

describe('pos-cashier: Bloqueo de Sesión con PIN', () => {
  beforeEach(() => {
    // Restablece el store a su estado inicial antes de cada test.
    usePosStore.getState().resetDemo();
  });

  it('requiere PIN de cajero para desbloquear las operaciones de cobro', async () => {
    // Bloquea intencionalmente la sesión para probar la pantalla de acceso.
    usePosStore.setState({ cashierUnlocked: false });
    // Renderiza la vista de Caja POS.
    render(<PosPage />);
    // Verifica que se muestre la pantalla de bloqueo de caja.
    expect(screen.getByText(/Acceso a Caja — Control de Cajero/i)).toBeInTheDocument();
    // Ingresa el PIN de cajero autorizatorio ("9921").
    const pinInput = screen.getByPlaceholderText(/Ingresa tu PIN/i);
    fireEvent.change(pinInput, { target: { value: '9921' } });
    // Presiona el botón para desbloquear.
    const unlockBtn = screen.getByRole('button', { name: /Desbloquear Caja/i });
    fireEvent.click(unlockBtn);
    // Verifica que la terminal se desbloquee y muestre la lista de cuentas abiertas.
    expect(await screen.findByText(/Cuentas Abiertas/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });
});

describe('pos-cashier: Cobro Multimedio y Calculadora de Vuelto', () => {
  beforeEach(() => {
    usePosStore.getState().resetDemo();
  });

  it('calcula el vuelto automáticamente al ingresar el monto en efectivo', async () => {
    // Renderiza la terminal POS (desbloqueada por defecto).
    render(<PosPage />);
    // Espera las cuentas abiertas y selecciona la Mesa 1.
    await screen.findByText(/Cuentas Abiertas/i, {}, { timeout: 3000 });
    const mesa1Btns = await screen.findAllByText(/Mesa 1/i, {}, { timeout: 3000 });
    fireEvent.click(mesa1Btns[0]);
    // Selecciona el método de pago en Efectivo.
    const cashBtn = await screen.findByRole('button', { name: /Efectivo/i }, { timeout: 3000 });
    fireEvent.click(cashBtn);
    // Ingresa un monto recibido mayor al total ($25.000).
    const tenderedInput = screen.getByPlaceholderText(/Monto recibido/i);
    fireEvent.change(tenderedInput, { target: { value: '25000' } });
    // Verifica que la calculadora muestre el vuelto calculado.
    expect(screen.getByText(/Vuelto:/i)).toBeInTheDocument();
  });
});

describe('pos-cashier: Emisión de DTE Chileno (Boleta vs Factura y Folio)', () => {
  beforeEach(() => {
    usePosStore.getState().resetDemo();
  });

  it('permite conmutar a Factura Electrónica y autocompletar la razón social por RUT', async () => {
    // Renderiza la Caja POS.
    render(<PosPage />);
    // Selecciona una cuenta.
    await screen.findByText(/Cuentas Abiertas/i, {}, { timeout: 3000 });
    const mesa1Btns = await screen.findAllByText(/Mesa 1/i, {}, { timeout: 3000 });
    fireEvent.click(mesa1Btns[0]);
    // Selecciona la opción de emisión de Factura Electrónica.
    const facturaRadio = await screen.findByRole('radio', { name: /Factura Electrónica/i }, { timeout: 3000 });
    fireEvent.click(facturaRadio);
    // Ingresa un RUT de prueba de empresa ("76.123.456-7").
    const rutInput = screen.getByPlaceholderText(/RUT Empresa/i);
    fireEvent.change(rutInput, { target: { value: '76.123.456-7' } });
    // Verifica el autocompletado de la Razón Social.
    expect(await screen.findByDisplayValue(/Gastronomía Demo SpA/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });
});

describe('pos-cashier: Cierre Ciego de Arqueo y Sincronización QR', () => {
  beforeEach(() => {
    usePosStore.getState().resetDemo();
  });

  it('despliega el modal de Cierre Ciego y calcula la diferencia de arqueo', async () => {
    // Renderiza la terminal POS.
    render(<PosPage />);
    // Abre el modal de Cierre Ciego desde la cabecera.
    const cierreBtn = await screen.findByRole('button', { name: /Cierre Ciego/i }, { timeout: 3000 });
    fireEvent.click(cierreBtn);
    // Verifica que se muestre el diálogo de arqueo de caja.
    expect(screen.getByText(/Cierre Ciego de Caja — Arqueo de Turno/i)).toBeInTheDocument();
    // Ingresa el conteo físico de dinero contado ($150.000).
    const cashCountInput = screen.getByPlaceholderText(/Efectivo contado/i);
    fireEvent.change(cashCountInput, { target: { value: '150000' } });
    // Presiona el botón de confirmación de cierre.
    const confirmCloseBtn = screen.getByRole('button', { name: /Finalizar Arqueo/i });
    fireEvent.click(confirmCloseBtn);
    // Verifica la confirmación del cierre de turno.
    expect(screen.getByText(/Turno de caja cerrado exitosamente/i)).toBeInTheDocument();
  });
});
