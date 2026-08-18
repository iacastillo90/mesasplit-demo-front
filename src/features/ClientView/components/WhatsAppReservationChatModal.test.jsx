// src/features/ClientView/components/WhatsAppReservationChatModal.test.jsx — Pruebas unitarias de WhatsAppReservationChatModal (fase18-asistente-chat-reservas-locales)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import WhatsAppReservationChatModal from './WhatsAppReservationChatModal.jsx';

describe('WhatsAppReservationChatModal — Chat de Reservas Estilo WhatsApp', () => {
  it('renderiza la cabecera en línea y la lista de sucursales con tiempo de espera y mesas', () => {
    render(<WhatsAppReservationChatModal isOpen={true} onClose={() => {}} />);

    // Verifica la cabecera de chat de WhatsApp y sucursales.
    expect(screen.getByText(/Asistente MesaSplit 💬/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Restô Lo Ovalle/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Restô Providencia/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Restô Vitacura/i).length).toBeGreaterThan(0);
  });

  it('permite seleccionar una sucursal y confirma la reserva', () => {
    render(<WhatsAppReservationChatModal isOpen={true} onClose={() => {}} />);

    const reserveButtons = screen.getAllByRole('button', { name: /Reservar en/i });
    fireEvent.click(reserveButtons[0]);

    // Verifica que aparezca el mensaje de confirmación con ticket.
    expect(screen.getByText(/Reserva Confirmada con Éxito/i)).toBeInTheDocument();
  });
});
