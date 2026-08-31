// src/features/ClientView/SosModal.test.jsx — suite de tests S.O.S. de Mesa (sos-waiter-call)
// Cubre el spec: modal de llamada urgente al mozo con selector de motivo y emisión del evento call.waiter.
// El cliente puede pedir asistencia desde la Mesa Virtual sin navegar a otro menú.
// Verifica además el PAYLOAD emitido ({ tableId, reason, customerName, timestamp }) según el contrato
// de openspec/api-contracts/websocket-payloads.md (issue CRITICAL 2 del verify: assertion de payload faltante).
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

  it('emite el evento call.waiter con el payload exacto del motivo seleccionado al confirmar', async () => {
    // Bus falso inyectado por prop: captura el evento REAL emitido por el modal.
    const fakeBus = { publish: vi.fn(), subscribe: vi.fn(() => () => {}) };
    // Renderiza el modal con el bus inyectado y la mesa de prueba.
    render(<SosModal open={true} onClose={mockOnClose} tableId="table-04" bus={fakeBus} />);
    // Selecciona el motivo "Falta cubierto".
    fireEvent.click(screen.getByRole('button', { name: /Falta cubierto/i }));
    // Presiona el botón de confirmación de la llamada.
    fireEvent.click(screen.getByRole('button', { name: /Llamar/i }));
    // Verifica que el modal notificó el envío (feedback visual al usuario).
    expect(await screen.findByText(/Mozo en camino/i)).toBeInTheDocument();
    // Assert del payload emitido según el contrato call.waiter del openspec.
    expect(fakeBus.publish).toHaveBeenCalledWith('call.waiter', {
      tableId: 'table-04',
      reason: 'Falta cubierto',
      customerName: 'Cliente',
      timestamp: expect.any(Number),
    });
  });

  it('emite el motivo por defecto "Limpiar mesa" si el comensal no cambia la selección', async () => {
    // Bus falso inyectado para verificar la emisión con la selección por defecto.
    const fakeBus = { publish: vi.fn(), subscribe: vi.fn(() => () => {}) };
    // Renderiza el modal sin tocar el selector de motivos (default = primer motivo).
    render(<SosModal open={true} onClose={mockOnClose} tableId="table-07" bus={fakeBus} />);
    // Confirma la llamada directamente.
    fireEvent.click(screen.getByRole('button', { name: /Llamar/i }));
    // Verifica que el payload usa el motivo por defecto del contrato.
    expect(fakeBus.publish).toHaveBeenCalledWith('call.waiter', {
      tableId: 'table-07',
      reason: 'Limpiar mesa',
      customerName: 'Cliente',
      timestamp: expect.any(Number),
    });
  });
});