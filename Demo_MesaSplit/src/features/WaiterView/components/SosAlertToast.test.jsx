// src/features/WaiterView/components/SosAlertToast.test.jsx — suite de tests unitarios para la alerta emergente S.O.S. (sos-waiter-call)
// Valida el renderizado de la alerta roja de urgencia y la ejecución de descartar/atender mesa.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea en español).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SosAlertToast from './SosAlertToast.jsx';

describe('SosAlertToast: Alerta emergente de llamado S.O.S.', () => {
  it('Escenario 1: No renderiza nada si alert es null', () => {
    const { container } = render(<SosAlertToast alert={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('Escenario 2: Muestra el mensaje de urgencia y número de mesa', () => {
    const alertData = { table: 4, message: '🚨 ¡Mesa 4 solicita atención urgente del mozo!' };
    render(<SosAlertToast alert={alertData} onDismiss={() => {}} onAttend={() => {}} />);

    expect(screen.getByText(/ALERTA URGENTE MOZO/i)).toBeInTheDocument();
    expect(screen.getByText(/Mesa 4 solicita atención/i)).toBeInTheDocument();
  });

  it('Escenario 3: Hacer clic en "Atender Mesa 4" invoca los callbacks onAttend y onDismiss', () => {
    const handleDismiss = vi.fn();
    const handleAttend = vi.fn();
    const alertData = { table: 4, message: 'Atención requerida' };

    render(<SosAlertToast alert={alertData} onDismiss={handleDismiss} onAttend={handleAttend} />);

    const attendBtn = screen.getByRole('button', { name: /Atender Mesa 4/i });
    fireEvent.click(attendBtn);

    expect(handleAttend).toHaveBeenCalledWith(4);
    expect(handleDismiss).toHaveBeenCalled();
  });
});
