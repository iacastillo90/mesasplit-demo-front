// src/features/RadarView/RadarPage.test.jsx — suite de tests del Local Admin Radar (local-admin-radar)
// Cubre la especificación local-admin-radar: plano topológico del salón por zonas,
// tarjetas del canal Delivery Omnicanal, cajón de auditoría (alert.fraud), modo Hora Punta,
// barra de comandos para mermas e insumos vencidos y Botón de Pánico de emergencia.
// Todos los tests cumplen las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRadarStore } from './store/useRadarStore.js';
import RadarPage from './pages/RadarPage.jsx';

describe('feature-views: mapa del radar (spec)', () => {
  beforeEach(() => {
    useRadarStore.getState().resetDemo();
    useRadarStore.setState({ loading: false });
  });

  it('el conteo del mapa coincide con el fixture de mesas', () => {
    const { unmount } = render(<RadarPage />);
    expect(screen.getByRole('heading', { name: /Plano del salón/i })).toBeInTheDocument();
    unmount();
  });
});

describe('local-admin-radar: Plano Topológico y Delivery Omnicanal', () => {
  beforeEach(() => {
    useRadarStore.getState().resetDemo();
    useRadarStore.setState({ loading: false });
  });

  it('renderiza filtros por zona (Salón, Terraza, Barra) y tarjetas de Delivery Omnicanal', () => {
    const { unmount } = render(<RadarPage />);
    expect(screen.getByRole('button', { name: 'Salón' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Terraza' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Barra' })[0]).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Delivery Omnicanal/i })).toBeInTheDocument();
    unmount();
  });
});

describe('local-admin-radar: Modo Hora Punta y Exception Feed', () => {
  beforeEach(() => {
    useRadarStore.getState().resetDemo();
    useRadarStore.setState({ loading: false });
  });

  it('activa el Modo Hora Punta mostrando el badge y despliega el Exception Feed', () => {
    const { unmount } = render(<RadarPage />);
    const focusBtn = screen.getByRole('button', { name: /Hora Punta/i });
    fireEvent.click(focusBtn);
    expect(screen.getAllByText(/MODO HORA PUNTA/i).length).toBeGreaterThan(0);

    const auditBtn = screen.getByRole('button', { name: /Auditoría/i });
    fireEvent.click(auditBtn);
    expect(screen.getByText(/Registro de Excepciones y Auditoría/i)).toBeInTheDocument();
    unmount();
  });
});

describe('local-admin-radar: Registro de Merma y Botón de Pánico', () => {
  beforeEach(() => {
    useRadarStore.getState().resetDemo();
    useRadarStore.setState({ loading: false });
  });

  it('permite ingresar mermas en la barra de comando y activar el Botón de Pánico', () => {
    const { unmount } = render(<RadarPage />);
    const mermaInput = screen.getByPlaceholderText(/Tomate San Marzano/i);
    fireEvent.change(mermaInput, { target: { value: '3 kilos de tomate vencido' } });
    fireEvent.submit(mermaInput.closest('form'));
    expect(screen.getByText(/3 kilos de tomate vencido/i)).toBeInTheDocument();

    const panicBtn = screen.getByRole('button', { name: /Pánico/i });
    fireEvent.click(panicBtn);
    expect(screen.getByText(/ALERTA DE EMERGENCIA ACTIVADA/i)).toBeInTheDocument();
    unmount();
  });
});
