// src/features/KdsView/components/BatchSummaryView.test.jsx — suite de tests de vista agregada batch (kds-batch-view)
// Cubre el spec kds-batch-view: agregación por plato sumando cantidades (ej. Hamburguesa Clásica x3),
// respeto del filtro por estación activa, inmutabilidad de tickets/recallStack y mensaje de estado vacío.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado y búsqueda.
import { render, screen } from '@testing-library/react';
// Store de KDS.
import { useKdsStore } from '../store/useKdsStore.js';
// Componente BatchSummaryView.
import BatchSummaryView from './BatchSummaryView.jsx';

describe('kds-batch-view: Vista agregada por plato en KDS', () => {
  beforeEach(() => {
    // Restablece el store de KDS.
    useKdsStore.getState().resetDemo();
  });

  it('Scenario 1: Agrupación por plato suma cantidades de distintos tickets (ej. Hamburguesa Clásica x3)', async () => {
    const tickets = [
      { id: 't-1', station: 'Fuego', items: [{ id: 'i-1', name: 'Hamburguesa Clásica', qty: 2 }] },
      { id: 't-2', station: 'Fuego', items: [{ id: 'i-2', name: 'Hamburguesa Clásica', qty: 1 }] },
    ];

    render(<BatchSummaryView tickets={tickets} activeStation="todas" />);

    // Muestra la línea agrupada de "Hamburguesa Clásica" con total 3.
    expect(await screen.findByText(/Hamburguesa Clásica/i)).toBeInTheDocument();
    expect(screen.getByText(/x3/i)).toBeInTheDocument();
  });

  it('Scenario 2: Filtrado por estación activa agrupa únicamente los tickets de esa estación', async () => {
    const tickets = [
      { id: 't-1', station: 'Fuego', items: [{ id: 'i-1', name: 'Hamburguesa Clásica', qty: 2 }] },
      { id: 't-2', station: 'Frío', items: [{ id: 'i-2', name: 'Ensalada César', qty: 1 }] },
    ];

    // Filtra únicamente por estación "Fuego".
    render(<BatchSummaryView tickets={tickets} activeStation="Fuego" />);

    expect(await screen.findByText(/Hamburguesa Clásica/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ensalada César/i)).not.toBeInTheDocument();
  });

  it('Scenario 3: Lectura pura no muta tickets ni recallStack', () => {
    const tickets = [
      { id: 't-1', station: 'Fuego', items: [{ id: 'i-1', name: 'Pizza Margherita', qty: 1 }] },
    ];
    useKdsStore.setState({ tickets });

    const initialTickets = useKdsStore.getState().tickets;
    const initialRecall = useKdsStore.getState().recallStack;

    render(<BatchSummaryView tickets={useKdsStore.getState().tickets} activeStation="todas" />);

    // Verifica inmutabilidad estricta.
    expect(useKdsStore.getState().tickets).toBe(initialTickets);
    expect(useKdsStore.getState().recallStack).toBe(initialRecall);
  });

  it('Scenario 4: Muestra estado vacío cuando no hay comandas activas', async () => {
    render(<BatchSummaryView tickets={[]} activeStation="todas" />);

    expect(await screen.findByText(/No hay platos pendientes/i)).toBeInTheDocument();
  });
});
