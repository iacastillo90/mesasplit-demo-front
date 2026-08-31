// src/features/RadarView/components/InventoryManagementModal.test.jsx — tests unitarios para InventoryManagementModal
// Prueba el renderizado de la lista de insumos, estado de Lista 86 y reposición rápida en 1 clic.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import InventoryManagementModal from './InventoryManagementModal.jsx';

// Describe bloque para InventoryManagementModal.
describe('InventoryManagementModal: Control de insumos y reposición de bodega', () => {
  // Mock de la función onClose.
  const mockOnClose = vi.fn();

  // Test 1: Renderizado de la lista de insumos y alerta de Lista 86.
  it('renderiza la lista de insumos críticos y los platos en quiebre de stock al estar abierto', () => {
    // Renderiza el modal abierto.
    render(<InventoryManagementModal open={true} onClose={mockOnClose} />);

    // Confirma el título principal.
    expect(screen.getByText(/Gestión de Inventario & Costeo de Recetas/i)).toBeInTheDocument();
    // Confirma la presencia del insumo Lomo Vetado.
    expect(screen.getByText(/Lomo Vetado/i)).toBeInTheDocument();
    // Confirma la presencia de la alerta de Lista 86 Activa.
    expect(screen.getByText(/Lista 86 Activa/i)).toBeInTheDocument();
  });

  // Test 2: Reposición rápida de stock en 1 clic.
  it('incrementa el stock al hacer clic en los botones de reposición rápida +5', () => {
    // Renderiza el modal abierto.
    render(<InventoryManagementModal open={true} onClose={mockOnClose} />);

    // Obtiene los botones +5.
    const plusFiveBtns = screen.getAllByRole('button', { name: /\+5/i });
    fireEvent.click(plusFiveBtns[0]);

    // Confirma la reaparición del aviso de reposición.
    expect(screen.getByText(/¡Stock reabastecido con éxito/i)).toBeInTheDocument();
  });
});
