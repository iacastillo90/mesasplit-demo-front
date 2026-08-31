// src/features/WaiterView/components/TableGrid.test.jsx — grilla de mesas del garzón (waiter-interactive-tables)
// Cubre los escenarios del spec waiter-interactive-tables: badge de comensales
// correcto (campo `seats`, no el inexistente `guests`), status mapping completo
// (billing → "En cobro", cleaning → "En limpieza", sin regresión en los estados
// existentes) y la interacción de selección onSelectTable(table.id).
// RED-GREEN: estos tests se escribieron ANTES del fix en TableGrid.jsx.

// API de Vitest importada explícitamente (ESLint no declara los globals).
import { describe, expect, it, vi } from 'vitest';
// Testing Library: renderizado y eventos.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente bajo prueba.
import TableGrid from './TableGrid.jsx';

// Mesa con seats:4 y SIN campo guests (el caso roto del badge actual).
const mesaConSeats = { id: 't1', number: 1, seats: 4, status: 'occupied', zone: 'Salón' };

describe('waiter-interactive-tables: badge de comensales (guest-badge-seats)', () => {
  it('muestra el badge con el valor de seats (4) aunque la mesa no defina guests', () => {
    // Renderiza la grilla con la mesa que solo define seats.
    render(<TableGrid tables={[mesaConSeats]} selectedTableId={null} onSelectTable={vi.fn()} />);
    // El badge de comensales debe reflejar 4 (nunca undefined ni fallback).
    expect(screen.getByText(/👥\s*4/)).toBeInTheDocument();
    // No debe aparecer la palabra undefined en el DOM (regresión del badge roto).
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
  });

  it('mesa sin campo guests no crashea y sigue mostrando seats', () => {
    // Renderiza con la misma mesa sin guests (triangulación: distintos seats).
    render(<TableGrid tables={[{ ...mesaConSeats, id: 't9', number: 9, seats: 2 }]} selectedTableId={null} onSelectTable={vi.fn()} />);
    // El badge muestra el valor de seats (2) sin lanzar error.
    expect(screen.getByText(/👥\s*2/)).toBeInTheDocument();
  });
});

describe('waiter-interactive-tables: status mapping completo (table-status-mapping)', () => {
  it('mapea billing a "En cobro" y cleaning a "En limpieza" (sin fallback genérico)', () => {
    // Mesa t2 (billing) y t4 (cleaning) del fixture real.
    const mesas = [
      { id: 't2', number: 2, seats: 6, status: 'billing', zone: 'Terraza' },
      { id: 't4', number: 4, seats: 4, status: 'cleaning', zone: 'Salón' },
    ];
    render(<TableGrid tables={mesas} selectedTableId={null} onSelectTable={vi.fn()} />);
    // Cada estado debe renderizar su etiqueta correcta (no el fallback "Ocupada").
    expect(screen.getByText('En cobro')).toBeInTheDocument();
    expect(screen.getByText('En limpieza')).toBeInTheDocument();
    // El fallback genérico "Ocupada" NO debe aparecer para estas mesas.
    expect(screen.queryByText('Ocupada')).not.toBeInTheDocument();
  });

  it('conserva las etiquetas de los estados existentes sin regresión', () => {
    // Mesa ocupada, esperando comida, pidiendo cuenta y libre.
    const mesas = [
      { id: 't1', number: 1, seats: 4, status: 'occupied', zone: 'Salón' },
      { id: 't3', number: 3, seats: 2, status: 'waiting_food', zone: 'Barra' },
      { id: 't5', number: 5, seats: 8, status: 'bill_requested', zone: 'Salón' },
      { id: 't6', number: 6, seats: 2, status: 'free', zone: 'Barra' },
    ];
    render(<TableGrid tables={mesas} selectedTableId={null} onSelectTable={vi.fn()} />);
    // Etiquetas de los estados históricos intactas.
    expect(screen.getByText('Ocupada')).toBeInTheDocument();
    expect(screen.getByText('En cocina')).toBeInTheDocument();
    expect(screen.getByText('Pidiendo cuenta')).toBeInTheDocument();
    expect(screen.getByText('Libre')).toBeInTheDocument();
  });
});

describe('waiter-interactive-tables: selección de mesa (tables-grid-12)', () => {
  it('al hacer click en la card llama a onSelectTable con el id de la mesa', () => {
    // Espía de la selección.
    const onSelectTable = vi.fn();
    // Renderiza con la mesa de prueba.
    render(<TableGrid tables={[mesaConSeats]} selectedTableId={null} onSelectTable={onSelectTable} />);
    // Toca la card de la Mesa 1.
    fireEvent.click(screen.getByRole('button', { name: /Mesa 1/i }));
    // La selección recibió el id 't1' (firma intacta para el toggle 3D y la página).
    expect(onSelectTable).toHaveBeenCalledWith('t1');
  });
});
