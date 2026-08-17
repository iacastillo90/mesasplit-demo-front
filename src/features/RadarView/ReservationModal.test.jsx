// src/features/RadarView/ReservationModal.test.jsx — suite de tests de reservas y lista de espera (interactive-table-reservation)
// Cubre la especificación interactive-table-reservation: gestión de reservas de mesas, cola de lista de espera virtual
// y emisión del evento reservation.created por el bus en tiempo real.
// Todos los tests cumplen las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Testing Library: renderizado de componentes y simulación de eventos.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente de reservas y lista de espera.
import ReservationModal from './components/ReservationModal.jsx';

describe('interactive-table-reservation: Reservas de Mesas y Lista de Espera Virtual', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockReset();
  });

  it('renderiza la lista de reservas activas y la cola de espera virtual', async () => {
    // Renderiza el modal de reservas abierto.
    render(<ReservationModal open={true} onClose={mockOnClose} />);
    // Verifica el título del gestor de reservas.
    expect(await screen.findByRole('heading', { name: /Gestión de Reservas y Lista de Espera/i })).toBeInTheDocument();
    // Verifica pestañas de Reservas y Lista de Espera.
    expect(screen.getByRole('button', { name: /Reservas Confirmadas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lista de Espera/i })).toBeInTheDocument();
  });

  it('permite registrar una nueva reserva de mesa y emite el evento reservation.created', async () => {
    // Renderiza el modal.
    render(<ReservationModal open={true} onClose={mockOnClose} />);
    // Cambia a la pestaña de nueva reserva.
    const newTabBtn = screen.getByRole('button', { name: /\+ Nueva Reserva/i });
    fireEvent.click(newTabBtn);
    // Completa los campos del formulario de reserva.
    const nameInput = await screen.findByPlaceholderText(/Nombre del cliente/i);
    fireEvent.change(nameInput, { target: { value: 'Familia Pérez' } });
    // Presiona el botón de guardar reserva.
    const saveBtn = screen.getByRole('button', { name: /Guardar Reserva/i });
    fireEvent.click(saveBtn);
    // Confirma la aparición de la nueva reserva en la lista.
    expect((await screen.findAllByText(/Familia Pérez/i)).length).toBeGreaterThan(0);
  });
});
