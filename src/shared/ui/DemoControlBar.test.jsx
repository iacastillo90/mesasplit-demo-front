// src/shared/ui/DemoControlBar.test.jsx — suite de pruebas unitarias para el hub de simulación demo control (demo-control-bar)
// Valida el renderizado colapsado/expandido de DemoControlBar y la ejecución de acciones de simulación.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español por cada línea).

// Importación de APIs de Vitest.
import { beforeEach, describe, expect, it } from 'vitest';
// Importación de utilidades de React Testing Library.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente bajo prueba.
import DemoControlBar from './DemoControlBar.jsx';
// Stores globales involucrados en la simulación.
import { useClientStore } from '../../features/ClientView/store/useClientStore.js';
import { useKdsStore } from '../../features/KdsView/store/useKdsStore.js';

describe('demo-control-bar: Hub de Simulación Realtime Demo', () => {
  beforeEach(() => {
    // Restablece los stores antes de cada test.
    useClientStore.setState({ cart: [], cartOpen: false });
    useKdsStore.setState({ tickets: [], recallStack: [] });
  });

  it('Escenario 1: Inicialmente renderiza el botón flotante colapsado "⚡ Demo Control"', () => {
    render(<DemoControlBar />);
    // Verifica que el botón de apertura exista.
    const triggerBtn = screen.getByRole('button', { name: /Demo Control/i });
    expect(triggerBtn).toBeInTheDocument();
    // La barra expandida no debe ser visible al inicio.
    expect(screen.queryByText(/Hub de Simulación Realtime Demo/i)).not.toBeInTheDocument();
  });

  it('Escenario 2: Al hacer clic en el botón flotante, expande el panel con los botones de simulación', () => {
    render(<DemoControlBar />);
    const triggerBtn = screen.getByRole('button', { name: /Demo Control/i });
    fireEvent.click(triggerBtn);

    // Debe mostrar la cabecera del panel expandido.
    expect(screen.getByText(/Hub de Simulación Realtime Demo/i)).toBeInTheDocument();
    // Debe mostrar los botones de acción rápida.
    expect(screen.getByRole('button', { name: /\+ Pedido M4/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Alerta S\.O\.S\./i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Plato Listo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pago QR/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Demo/i })).toBeInTheDocument();
  });

  it('Escenario 3: Ejecutar "+ Pedido M4" agrega un ticket simulado a la cocina KDS', () => {
    render(<DemoControlBar />);
    // Abre el panel.
    fireEvent.click(screen.getByRole('button', { name: /Demo Control/i }));
    // Ejecuta la simulación de pedido.
    fireEvent.click(screen.getByRole('button', { name: /\+ Pedido M4/i }));

    // Verifica que la cocina KDS haya recibido el ticket simulado de la Mesa 4.
    const kdsTickets = useKdsStore.getState().tickets;
    expect(kdsTickets.length).toBeGreaterThan(0);
    expect(kdsTickets[0].tableNumber).toBe(4);
    // Verifica que aparezca la confirmación en el banner de feedback.
    expect(screen.getByText(/Pedido comanda #SIM-/i)).toBeInTheDocument();
  });

  it('Escenario 4: Minimizar oculta el panel expandido y regresa al botón flotante', () => {
    render(<DemoControlBar />);
    // Abre el panel.
    fireEvent.click(screen.getByRole('button', { name: /Demo Control/i }));
    expect(screen.getByText(/Hub de Simulación Realtime Demo/i)).toBeInTheDocument();

    // Presiona minimizar.
    fireEvent.click(screen.getByRole('button', { name: /✕ Minimizar/i }));
    // Regresa al estado colapsado.
    expect(screen.queryByText(/Hub de Simulación Realtime Demo/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Demo Control/i })).toBeInTheDocument();
  });
});
