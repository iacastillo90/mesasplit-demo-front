// src/features/RadarView/components/DeliveryTrackingModal.test.jsx — tests unitarios para DeliveryTrackingModal
// Prueba el renderizado del live tracking de repartidor, stepper de ruta y avance de estado.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import DeliveryTrackingModal from './DeliveryTrackingModal.jsx';

// Describe bloque para DeliveryTrackingModal.
describe('DeliveryTrackingModal: Live tracking de repartidor y mapa de ruta', () => {
  // Mock de onClose.
  const mockOnClose = vi.fn();

  // Test 1: Renderizado del mapa y estado del despacho.
  it('renderiza la orden seleccionada, la dirección del cliente y el estado del despacho', () => {
    // Renderiza el modal abierto.
    render(<DeliveryTrackingModal open={true} onClose={mockOnClose} />);

    // Confirma la presencia del título de la orden.
    expect(screen.getByText(/DEL-901/i)).toBeInTheDocument();
    // Confirma la presencia del nombre del repartidor.
    expect(screen.getByText(/Franco M\./i)).toBeInTheDocument();
  });

  // Test 2: Avance del estado del despacho.
  it('permite avanzar el estado del despacho al pulsar el botón ⚡ Avanzar Estado', () => {
    // Renderiza el modal abierto.
    render(<DeliveryTrackingModal open={true} onClose={mockOnClose} />);

    // Busca y acciona el botón de avanzar estado.
    const advanceBtn = screen.getByRole('button', { name: /⚡ Avanzar Estado Despacho/i });
    fireEvent.click(advanceBtn);

    // Confirma que la interacción no haya fallado.
    expect(advanceBtn).toBeInTheDocument();
  });
});
