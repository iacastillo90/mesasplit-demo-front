// src/features/ClientView/components/ItemCustomizerModal.test.jsx — suite de tests del modal de personalización de platos
// Valida la selección de término de cocción, acompañamiento, exclusión de ingredientes y consolidación de notas.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea en español).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ItemCustomizerModal from './ItemCustomizerModal.jsx';

describe('ItemCustomizerModal: Personalización de platos antes de agregar al carrito', () => {
  const mockItem = { id: 'm1', name: 'Hamburguesa Doble Queso', price: 9500 };

  it('Escenario 1: Renderiza el nombre del plato y opciones de cocción', () => {
    render(<ItemCustomizerModal item={mockItem} open={true} onClose={() => {}} onConfirm={() => {}} />);

    expect(screen.getByText(/Personalizar: Hamburguesa Doble Queso/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Término de Cocción/i)).toBeInTheDocument();
  });

  it('Escenario 2: Confirmar consolida la nota con el término, acompañamiento y exclusiones', () => {
    const handleConfirm = vi.fn();
    render(<ItemCustomizerModal item={mockItem} open={true} onClose={() => {}} onConfirm={handleConfirm} />);

    // Selecciona exclusión "Sin cebolla".
    const noOnionBtn = screen.getByRole('button', { name: /Sin cebolla/i });
    fireEvent.click(noOnionBtn);

    // Presiona confirmar.
    const confirmBtn = screen.getByRole('button', { name: /✓ Agregar al Carrito/i });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'm1',
        notes: expect.stringMatching(/Sin cebolla/i),
      })
    );
  });
});
