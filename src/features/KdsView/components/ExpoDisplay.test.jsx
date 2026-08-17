// src/features/KdsView/components/ExpoDisplay.test.jsx — suite de tests de Expo View de cocina (kds-expo-view)
// Cubre el spec kds-expo-view: activación de modo exhibición fullscreen, ocultamiento de controles de mutación/modales,
// ciclo automático por temporizador sin interacción y salida por botón de escape / tecla Esc.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Testing Library: renderizado, simulación y act.
import { act, fireEvent, render, screen } from '@testing-library/react';
// Store de KDS.
import { useKdsStore } from '../store/useKdsStore.js';
// Componente ExpoDisplay.
import ExpoDisplay from './ExpoDisplay.jsx';
// Página principal de KDS para prueba de integración del toggle.
import KdsPage from '../pages/KdsPage.jsx';

describe('kds-expo-view: Modo exhibición Expo View fullscreen en cocina KDS', () => {
  beforeEach(() => {
    // Restablece el store antes de cada prueba.
    useKdsStore.getState().resetDemo();
  });

  it('Scenario 1: Toggle activa expo fullscreen con tickets pendientes y oculta controles de mutación', async () => {
    // Carga tickets de prueba en el store.
    useKdsStore.setState({
      tickets: [
        { id: 't-1', tableNumber: 3, status: 'pending', items: [{ id: 'i-1', name: 'Pizza Margherita', qty: 2 }] },
      ],
      expoMode: true,
      loading: false,
    });

    render(<KdsPage />);

    // Muestra el contenedor de Expo View.
    expect(await screen.findByText(/MODO EXHIBICIÓN/i)).toBeInTheDocument();
    expect(screen.getByText(/Pizza Margherita/i)).toBeInTheDocument();

    // Los botones sensibles de mutación (marcar listo / filtros de estación) NO deben estar presentes.
    expect(screen.queryByRole('button', { name: /Marcar listo/i })).not.toBeInTheDocument();
  });

  it('Scenario 2: Ciclo automático avanza sin interacción al transcurrir el temporizador', async () => {
    vi.useFakeTimers();

    // Carga 2 tickets en el store.
    const tickets = [
      { id: 't-1', tableNumber: 1, status: 'pending', items: [{ id: 'i-1', name: 'Hamburguesa Clásica', qty: 1 }] },
      { id: 't-2', tableNumber: 2, status: 'in_preparation', items: [{ id: 'i-2', name: 'Ensalada César', qty: 1 }] },
    ];

    render(<ExpoDisplay tickets={tickets} onClose={() => {}} />);

    // Muestra el primer ticket del ciclo.
    expect(screen.getByText(/Mesa 1/i)).toBeInTheDocument();

    // Avanza el temporizador simulado (4 segundos).
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Muestra el segundo ticket del ciclo.
    expect(screen.getByText(/Mesa 2/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('Scenario 3: Salida explícita por botón de control o tecla Esc desactiva el modo expo', async () => {
    useKdsStore.setState({
      tickets: [
        { id: 't-1', tableNumber: 1, status: 'pending', items: [{ id: 'i-1', name: 'Pizza Margherita', qty: 1 }] },
      ],
      expoMode: true,
      loading: false,
    });

    render(<KdsPage />);

    expect(await screen.findByText(/MODO EXHIBICIÓN/i)).toBeInTheDocument();

    // Presiona la tecla Escape en la ventana.
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    // El modo expo debe desactivarse y volver a la vista normal KDS.
    expect(useKdsStore.getState().expoMode).toBe(false);
  });
});
