// src/features/WaiterView/components/SmartUpsellWidget.test.jsx — tests unitarios para SmartUpsellWidget
// Prueba la generación de sugerencias inteligentes de maridaje y la adición en 1 clic a la comanda.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import SmartUpsellWidget from './SmartUpsellWidget.jsx';

// Describe bloque para SmartUpsellWidget.
describe('SmartUpsellWidget: IA de venta cruzada y maridaje inteligente', () => {
  // Mock de la función onAddToCart.
  const mockOnAddToCart = vi.fn();

  // Test 1: Sugerencia de maridaje de Vino Carménère cuando hay Lomo en la comanda.
  it('despliega la sugerencia de Vino Carménère cuando la comanda contiene Lomo', () => {
    const draft = [{ id: '1', name: 'Lomo Lo Ovalle', price: 18900 }];

    // Renderiza el widget con el borrador.
    render(<SmartUpsellWidget orderDraft={draft} onAddToCart={mockOnAddToCart} />);

    // Confirma que aparezca la recomendación de Vino Carménère.
    expect(screen.getByText(/Vino Carménère Gran Reserva/i)).toBeInTheDocument();
  });

  // Test 2: Adición rápida en 1 clic.
  it('invoca onAddToCart al pulsar el botón + Agregar Sugerencia', () => {
    // Renderiza el widget.
    render(<SmartUpsellWidget orderDraft={[]} onAddToCart={mockOnAddToCart} />);

    // Pulsa el botón de agregar sugerencia.
    const addBtn = screen.getByRole('button', { name: /\+ Agregar Sugerencia/i });
    fireEvent.click(addBtn);

    // Confirma que el callback haya sido llamado.
    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
  });
});
