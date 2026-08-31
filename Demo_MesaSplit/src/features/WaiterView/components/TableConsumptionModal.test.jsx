// src/features/WaiterView/components/TableConsumptionModal.test.jsx
// Tests RED/GREEN del modal read-only de consumo (spec waiter-interactive-tables:
// consumption-modal sc.1-2). Verifica que muestra cada línea de table.order
// (qty × nombre + subtotal + total) y que cierra por botón u overlay.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TableConsumptionModal from './TableConsumptionModal.jsx';
import { formatCurrency } from '../../../shared/utils/index.js';
import tablesFixture from '../../../mocks/tables.json';

describe('TableConsumptionModal (waiter-interactive-tables: consumption-modal sc.1-2)', () => {
  // Toma la mesa occupied con 2+ líneas del fixture (t1: Hamburguesa 2x8900 + Limonada 2x2900).
  const t1 = tablesFixture.find((t) => t.id === 't1');

  it('sc.1: muestra cada línea de order (cantidad, producto y precio) y el total read-only', () => {
    // Renderiza el modal con la mesa ocupada t1.
    render(<TableConsumptionModal table={t1} onClose={() => {}} />);
    // Cada producto de la comanda aparece en el modal.
    expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
    expect(screen.getByText('Limonada Menta')).toBeInTheDocument();
    // Cada línea muestra su cantidad (qty) junto al producto.
    expect(screen.getAllByText('2x').length).toBeGreaterThan(0);
    // Cada línea muestra el subtotal calculado (qty × price) con el formato del proyecto.
    expect(screen.getByText(formatCurrency(2 * 8900))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(2 * 2900))).toBeInTheDocument();
    // El modal muestra el total de la comanda (suma de subtotales).
    expect(screen.getByText(formatCurrency(2 * 8900 + 2 * 2900))).toBeInTheDocument();
    // Es un modal con rol dialog (aria-modal) para accesibilidad.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('sc.2: cierra el modal con el botón "Cerrar" y con el click en el overlay', () => {
    // Espía del cierre: debe invocarse por ambas vías.
    const onClose = vi.fn();
    // Renderiza el modal con el espía de cierre.
    render(<TableConsumptionModal table={t1} onClose={onClose} />);
    // 1) Botón "Cerrar" (X de la cabecera del Modal compartido).
    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    // 2) Click en el overlay (presentación) también cierra.
    fireEvent.click(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});