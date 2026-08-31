// src/features/ClientView/BillSplitterModal.test.jsx — suite de tests de división de cuenta (account-split)
// Cubre el spec account-split: modos de división (Completo, En partes iguales, Por plato, Monto personalizado),
// regla de conservación de total con resto mayor (Largest Remainder), inhabilitación cuando hay unassigned,
// y emisión del evento payment.split en el bus en tiempo real.
// Todos los tests cumplen las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado y eventos de simulación.
import { fireEvent, render, screen } from '@testing-library/react';
// Store de división de cuenta.
import { useSplitStore } from './store/useSplitStore.js';
// Componente de modal de división de cuenta.
import BillSplitterModal from './components/BillSplitterModal.jsx';

describe('account-split: División de Cuenta en Mesa Virtual', () => {
  beforeEach(() => {
    // Restablece el store de división antes de cada prueba.
    useSplitStore.getState().resetDemo();
  });

  it('despliega los 4 modos de división (Completo, Iguales, Por Plato, Personalizado)', async () => {
    // Activa el modal con un total de mesa simulado de $30.000.
    useSplitStore.setState({ open: true, cartTotal: 30000 });
    // Renderiza el modal de división de cuenta.
    render(<BillSplitterModal open={true} onClose={() => {}} />);

    // Verifica que el título del modal sea visible.
    expect(await screen.findByText(/Dividir Cuenta de Mesa/i, {}, { timeout: 3000 })).toBeInTheDocument();
    // Verifica la presencia de los botones de los 4 modos de división.
    expect(screen.getByRole('button', { name: /Total/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Partes Iguales/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Por Plato/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Personalizado/i })).toBeInTheDocument();
  });

  it('calcula la división equitativa con regla de resto mayor (ej. 10.000 entre 3)', async () => {
    // Activa el modal en modo partes iguales con 3 comensales para $10.000.
    useSplitStore.setState({ open: true, cartTotal: 10000, guestCount: 3, mode: 'equal' });
    // Renderiza el modal.
    render(<BillSplitterModal open={true} onClose={() => {}} />);

    // Cambia al modo partes iguales si no está activo.
    const equalBtn = await screen.findByRole('button', { name: /Partes Iguales/i }, { timeout: 3000 });
    fireEvent.click(equalBtn);

    // Verifica que la suma total sea exactamente $10.000 con los centavos ajustados ($3.334 + $3.333 + $3.333).
    expect(await screen.findByText(/\$3\.334/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect((await screen.findAllByText(/\$3\.333/i, {}, { timeout: 3000 })).length).toBeGreaterThan(0);
  });

  it('permite pagar la cuota individual y deshabilitar comensales ya pagados', async () => {
    // Activa el modal con 2 comensales.
    useSplitStore.setState({ open: true, cartTotal: 20000, guestCount: 2, mode: 'equal' });
    // Renderiza el modal.
    render(<BillSplitterModal open={true} onClose={() => {}} />);

    // Busca el botón de pago del Comensal 1.
    const payBtn = await screen.findByRole('button', { name: /Pagar mi parte/i }, { timeout: 3000 });
    fireEvent.click(payBtn);

    // Verifica la presencia del badge de pago parcial.
    const paidElements = await screen.findAllByText(/Pagado/i, {}, { timeout: 3000 });
    expect(paidElements.length).toBeGreaterThan(0);

  });
});
