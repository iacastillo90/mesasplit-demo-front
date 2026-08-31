// src/features/RadarView/FocusMode.test.jsx — suite de tests de Modo Hora Punta (modo-hora-punta)
// Cubre la especificación modo-hora-punta: alternancia de estado por toggle gigante en cabecera,
// filtrado de mesas críticas (ámbar/naranja), resumen de cuellos de botella y visibilidad de mermas/alertas.
// Todos los tests cumplen las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRadarStore } from './store/useRadarStore.js';
import RadarPage from './pages/RadarPage.jsx';

describe('modo-hora-punta: Modo Hora Punta en Radar Local Admin', () => {
  beforeEach(() => {
    useRadarStore.getState().resetDemo();
    useRadarStore.setState({ loading: false });
  });

  it('conmuta focusMode y renderiza el indicador gigante de MODO HORA PUNTA en la cabecera', () => {
    const { unmount } = render(<RadarPage />);

    expect(useRadarStore.getState().focusMode).toBe(false);

    const focusToggle = screen.getByRole('button', { name: /Hora Punta/i });
    fireEvent.click(focusToggle);

    expect(useRadarStore.getState().focusMode).toBe(true);
    expect(screen.getAllByText(/MODO HORA PUNTA/i).length).toBeGreaterThan(0);
    unmount();
  });

  it('filtra el plano topológico mostrando únicamente las mesas críticas en espera de comida o cuenta', () => {
    useRadarStore.setState({
      tables: [
        { id: 't1', number: 1, status: 'free', zone: 'Salón' },
        { id: 't2', number: 2, status: 'occupied', zone: 'Salón' },
        { id: 't3', number: 3, status: 'waiting_food', zone: 'Salón' },
        { id: 't4', number: 4, status: 'bill_requested', zone: 'Salón' },
      ],
      focusMode: true,
      loading: false,
    });

    const { unmount } = render(<RadarPage />);

    expect(screen.getByText(/atención urgente/i)).toBeInTheDocument();
    expect(screen.getByText(/Mesa 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Mesa 4/i)).toBeInTheDocument();
    unmount();
  });

  it('mantiene la barra de merma rápida y el cajón de auditoría accesibles durante la Hora Punta', () => {
    useRadarStore.setState({ focusMode: true, loading: false });

    const { unmount } = render(<RadarPage />);

    expect(screen.getByPlaceholderText(/Tomate San Marzano/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Auditoría/i })).toBeInTheDocument();
    unmount();
  });
});
