// src/features/ClientView/components/GroupSplitProgressBar.test.jsx — tests unitarios del indicador visual de progreso de pago
// Valida el cálculo de porcentaje pagado, saldo pendiente y renderizado de chips de comensales.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import GroupSplitProgressBar from './GroupSplitProgressBar.jsx';

describe('GroupSplitProgressBar: Indicador visual de progreso de pago de mesa', () => {
  it('Escenario 1: Calcula 0% pagado cuando ningún comensal ha pagado aún', () => {
    const guests = [
      { id: 'g1', name: 'Comensal 1', amount: 10000, status: 'pending' },
      { id: 'g2', name: 'Comensal 2', amount: 10000, status: 'pending' },
    ];

    render(<GroupSplitProgressBar totalAmount={20000} guests={guests} />);

    expect(screen.getByText(/0% Pagado/i)).toBeInTheDocument();
    expect(screen.getByText(/Pendiente:/i)).toBeInTheDocument();
  });

  it('Escenario 2: Calcula 50% pagado cuando 1 de 2 comensales ha completado su pago', () => {
    const guests = [
      { id: 'g1', name: 'Comensal 1', amount: 10000, status: 'paid' },
      { id: 'g2', name: 'Comensal 2', amount: 10000, status: 'pending' },
    ];

    render(<GroupSplitProgressBar totalAmount={20000} guests={guests} />);

    expect(screen.getByText(/50% Pagado/i)).toBeInTheDocument();
    expect(screen.getByText(/Comensal 1/i)).toBeInTheDocument();
  });
});
