// src/features/WaiterView/components/QuickSplitCalculatorModal.test.jsx — tests unitarios para QuickSplitCalculatorModal
// Prueba la división de cuenta rápida por persona y cálculo dinámico de propina.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import QuickSplitCalculatorModal from './QuickSplitCalculatorModal.jsx';

// Describe bloque para QuickSplitCalculatorModal.
describe('QuickSplitCalculatorModal: Calculadora de cobro rápido al paso en mesa', () => {
  // Mock de la función onClose.
  const mockOnClose = vi.fn();

  // Test 1: Renderizado inicial y cálculo de cuota por persona.
  it('renderiza la calculadora y calcula el monto exacto por persona con propina', () => {
    // Renderiza la calculadora para Mesa 04 con total $40,000.
    render(
      <QuickSplitCalculatorModal
        open={true}
        onClose={mockOnClose}
        tableNumber="04"
        defaultTotal={40000}
      />,
    );

    // Confirma la presencia del título con la Mesa 04.
    expect(screen.getByRole('heading', { name: /Mesa 04/i })).toBeInTheDocument();
    // Subtotal $40.000 + 10% propina ($4.000) = $44.000 total / 4 personas = $11.000 por persona.
    expect(screen.getByText(/\$11\.000/i)).toBeInTheDocument();
  });

  // Test 2: Cambio de comensales y recálculo.
  it('recalcula la cuota al cambiar el número de comensales a 2 personas', () => {
    // Renderiza la calculadora para Mesa 04 con total $40,000.
    render(
      <QuickSplitCalculatorModal
        open={true}
        onClose={mockOnClose}
        tableNumber="04"
        defaultTotal={40000}
      />,
    );

    // Cambia la selección de comensales a 2 personas.
    const twoPeopleBtn = screen.getByRole('button', { name: /👤 2/i });
    fireEvent.click(twoPeopleBtn);

    // $44.000 total / 2 personas = $22.000 por persona.
    expect(screen.getByText(/\$22\.000/i)).toBeInTheDocument();
  });
});
