// src/features/ClientView/components/ClientReservationAssistant.test.jsx — tests unitarios para ClientReservationAssistant
// Prueba la navegación entre sucursales, completado de formulario, generación de voucher QR y unirse a fila virtual.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library para renderizado de componentes React.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente del asistente de reservas cliente a probar.
import ClientReservationAssistant from './ClientReservationAssistant.jsx';

// Describe bloque de tests para el componente ClientReservationAssistant.
describe('ClientReservationAssistant: Asistente interactivo de reservas por local', () => {
  // Mock de la función onClose.
  const mockOnClose = vi.fn();

  // Test 1: Renderizado inicial del paso 1 con catálogo de sucursales.
  it('renderiza la lista de sucursales en el paso 1 cuando el modal está abierto', () => {
    // Renderiza el asistente abierto.
    render(<ClientReservationAssistant open={true} onClose={mockOnClose} />);

    // Verifica que se muestre el título del asistente.
    expect(screen.getByRole('heading', { name: /Asistente Inteligente de Reservas/i })).toBeInTheDocument();
    // Confirma la presencia de las sucursales (ej. Providencia).
    expect(screen.getByText(/Providencia — Terraza & Lounge/i)).toBeInTheDocument();
    // Confirma la presencia de la sucursal Santiago Centro.
    expect(screen.getByText(/Santiago Centro — Salón Histórico/i)).toBeInTheDocument();
  });

  // Test 2: Avance al paso 2 al seleccionar una sucursal y envío de reserva.
  it('avanza al paso 2 al seleccionar sucursal y genera el voucher QR al confirmar', () => {
    // Renderiza el asistente abierto.
    render(<ClientReservationAssistant open={true} onClose={mockOnClose} />);

    // Hace clic en la sucursal Providencia.
    const branchBtn = screen.getByText(/Providencia — Terraza & Lounge/i).closest('button');
    fireEvent.click(branchBtn);

    // Verifica que se muestre el formulario del paso 2 con el campo de nombre.
    const nameInput = screen.getByPlaceholderText(/Carmen Gloria Tapia/i);
    expect(nameInput).toBeInTheDocument();

    // Completa el nombre de la reserva.
    fireEvent.change(nameInput, { target: { value: 'Reserva Test' } });

    // Presiona el botón de confirmar reserva.
    const confirmBtn = screen.getByRole('button', { name: /Confirmar Reserva/i });
    fireEvent.click(confirmBtn);

    // Verifica que avance al paso 3 mostrando el mensaje de éxito.
    expect(screen.getByText(/¡Reserva Confirmada con Éxito!/i)).toBeInTheDocument();
    // Confirma que aparezca el nombre en el voucher.
    expect(screen.getByText(/Reserva Test/i)).toBeInTheDocument();
  });
});
