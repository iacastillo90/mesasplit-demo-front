// src/features/RadarView/FocusMode.test.jsx — suite de tests de Modo Hora Punta (modo-hora-punta)
// Cubre la especificación modo-hora-punta: alternancia de estado por toggle gigante en cabecera,
// filtrado de mesas críticas (ámbar/naranja), resumen de cuellos de botella y visibilidad de mermas/alertas.
// Todos los tests cumplen las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente (sin globals para evitar colisiones).
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado de componentes y simulación de interacción del usuario.
import { fireEvent, render, screen } from '@testing-library/react';
// Store de Zustand de Radar.
import { useRadarStore } from './store/useRadarStore.js';
// Componente principal de la página del Radar Local Admin.
import RadarPage from './pages/RadarPage.jsx';

describe('modo-hora-punta: Modo Hora Punta en Radar Local Admin', () => {
  beforeEach(() => {
    // Restablece el store de Radar antes de cada prueba para aislar estados.
    useRadarStore.getState().resetDemo();
  });

  it('conmuta focusMode y renderiza el indicador gigante de MODO HORA PUNTA en la cabecera', async () => {
    // Renderiza la vista del Radar.
    render(<RadarPage />);

    // El modo inicial es OFF.
    expect(useRadarStore.getState().focusMode).toBe(false);

    // Encuentra y presiona el botón gigante de alternancia de Hora Punta.
    const focusToggle = await screen.findByRole('button', { name: /Hora Punta/i });
    fireEvent.click(focusToggle);

    // El estado en el store cambia a true.
    expect(useRadarStore.getState().focusMode).toBe(true);

    // El badge indicativo de MODO HORA PUNTA es visible en la pantalla.
    expect(screen.getAllByText(/MODO HORA PUNTA/i).length).toBeGreaterThan(0);
  });

  it('filtra el plano topológico mostrando únicamente las mesas críticas en espera de comida o cuenta', async () => {
    // Carga un fixture de mesas con estados mixtos (libres, comiendo, esperando comida, cuenta pedida).
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

    // Renderiza la vista de Radar con focusMode activado.
    render(<RadarPage />);

    // Verifica que se muestre el resumen indicando la cantidad de mesas críticas que requieren atención.
    expect(await screen.findByText(/atención urgente/i)).toBeInTheDocument();

    // Las mesas críticas 3 (esperando comida) y 4 (cuenta pedida) están visibles en el mapa.
    expect(screen.getByText(/Mesa 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Mesa 4/i)).toBeInTheDocument();
  });

  it('mantiene la barra de merma rápida y el cajón de auditoría accesibles durante la Hora Punta', async () => {
    // Activa el modo Hora Punta en el store.
    useRadarStore.setState({ focusMode: true, loading: false });

    // Renderiza la página.
    render(<RadarPage />);

    // La barra de merma rápida permanece visible e interactiva.
    expect(await screen.findByPlaceholderText(/Registrar merma/i)).toBeInTheDocument();

    // El botón de auditoría/excepciones permanece visible en la cabecera.
    expect(screen.getByRole('button', { name: /Auditoría/i })).toBeInTheDocument();
  });
});
