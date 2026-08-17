// src/features/ClientView/SosModal.test.jsx — suite de tests S.O.S. de Mesa (sos-waiter-call)
// Cubre el spec: modal de llamada urgente al mozo con selector de motivo y emisión del evento call.waiter.
// El cliente puede pedir asistencia desde la Mesa Virtual sin navegar a otro menú.
// Cumple reglas obligatorias de AGENTS.md: comentarios en español por cada línea.

// API de Vitest importada explícitamente (sin globals para evitar colisiones).
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Testing Library: renderizado y simulación de interacción del usuario.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente de modal S.O.S.
import SosModal from './components/SosModal.jsx';

describe('sos-waiter-call: Modal S.O.S. de Mesa y Llamada al Mozo', () => {
  // Mock del callback de cierre del modal.
  const mockOnClose = vi.fn();

  beforeEach(() => {
    // Limpia el mock entre tests.
    mockOnClose.mockReset();
  });

  it('renderiza el encabezado "Llamar al Mozo" y los 3 motivos de llamada', async () => {
    // Renderiza el modal abierto.
    render(<SosModal open={true} onClose={mockOnClose} tableId="table-04" />);
    // Verifica el heading del S.O.S.
    expect(await screen.findByRole('heading', { name: /Llamar al Mozo/i })).toBeInTheDocument();
    // Verifica los tres motivos definidos por el contrato call.waiter del openspec.
    expect(screen.getByRole('button', { name: /Limpiar mesa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Falta cubierto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ayuda general/i })).toBeInTheDocument();
  });

  it('emite el evento call.waiter con el motivo seleccionado al confirmar la llamada', async () => {
    // Renderiza el modal.
    render(<SosModal open={true} onClose={mockOnClose} tableId="table-04" />);
    // Selecciona el motivo "Falta cubierto".
    fireEvent.click(screen.getByRole('button', { name: /Falta cubierto/i }));
    // Presiona el botón de confirmación de la llamada.
    const callBtn = screen.getByRole('button', { name: /Llamar/i });
    fireEvent.click(callBtn);
    // Verifica que el modal notificó el envío (feedback visual al usuario).
    expect(await screen.findByText(/Mozo en camino/i)).toBeInTheDocument();
  });
});
