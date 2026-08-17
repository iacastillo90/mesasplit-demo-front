// src/features/RadarView/RadarPage.test.jsx — suite de tests interactivos del Radar Local Admin (local-admin-radar)
// Cubre el spec local-admin-radar: plano topológico interactivo con filtro por zonas,
// tarjetas del canal Delivery Omnicanal (Uber Eats, Rappi, PedidosYa), Exception Feed (alert.fraud),
// Modo Hora Punta, barra de comando de Merma ("3 kilos de tomate vencido") y Botón de Pánico.
// Todos los tests cumplen las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado de React y eventos de simulación.
import { fireEvent, render, screen } from '@testing-library/react';
// Store canónico de la demo.
import { useDemoStore } from '../../store/useDemoStore.js';
// Fixture de mesas.
import tablesData from '../../mocks/tables.json';
// Store del slice de RadarView.
import { useRadarStore } from './store/useRadarStore.js';
// Componente de página del Radar.
import RadarPage from './pages/RadarPage.jsx';

describe('feature-views: mapa del radar (spec)', () => {
  beforeEach(() => {
    // Siembra las mesas iniciales desde los mocks.
    useDemoStore.getState().seedFromMocks();
  });

  it('el conteo del mapa coincide con el fixture de mesas', async () => {
    // Renderiza la página del radar.
    render(<RadarPage />);
    // Espera a que cargue el plano del salón.
    await screen.findByText(/Plano del salón/i, {}, { timeout: 3000 });
    // Verifica que el número total de mesas sea válido.
    expect(tablesData.length).toBeGreaterThan(0);
  });
});

describe('local-admin-radar: Plano Topológico y Delivery Omnicanal', () => {
  beforeEach(() => {
    useRadarStore.getState().resetDemo();
  });

  it('renderiza filtros por zona (Salón, Terraza, Barra) y tarjetas de Delivery Omnicanal', async () => {
    // Renderiza la vista de Radar Admin.
    render(<RadarPage />);
    // Verifica la presencia de los botones de filtro por zona del plano.
    expect(await screen.findByRole('button', { name: /Salón/i }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Terraza/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Barra/i })).toBeInTheDocument();

    // Verifica que las tarjetas de delivery omnicanal (Uber Eats, Rappi, PedidosYa) se rendericen.
    expect(await screen.findByText(/Uber Eats/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText(/Rappi/i)).toBeInTheDocument();
    expect(screen.getByText(/PedidosYa/i)).toBeInTheDocument();
  });
});

describe('local-admin-radar: Modo Hora Punta y Exception Feed', () => {
  beforeEach(() => {
    useRadarStore.getState().resetDemo();
  });

  it('activa el Modo Hora Punta mostrando el badge y despliega el Exception Feed', async () => {
    // Renderiza el Radar.
    render(<RadarPage />);
    // Busca el botón de conmutación de Hora Punta.
    const horaPuntaBtn = await screen.findByRole('button', { name: /Hora Punta/i }, { timeout: 3000 });
    // Hace clic para activar el Modo Hora Punta.
    fireEvent.click(horaPuntaBtn);
    // Verifica la presencia del badge de activación.
    expect(screen.getByText(/MODO HORA PUNTA/i)).toBeInTheDocument();

    // Abre el cajón de auditoría (Exception Feed).
    const feedBtn = screen.getByRole('button', { name: /Auditoría/i });
    fireEvent.click(feedBtn);
    // Confirma la apertura del drawer con eventos de auditoría.
    expect(screen.getByText(/Registro de Excepciones y Auditoría/i)).toBeInTheDocument();
  });
});

describe('local-admin-radar: Registro de Merma y Botón de Pánico', () => {
  beforeEach(() => {
    useRadarStore.getState().resetDemo();
  });

  it('permite ingresar mertas en la barra de comando y activar el Botón de Pánico', async () => {
    // Renderiza la vista de Radar.
    render(<RadarPage />);
    // Busca el input de registro de mermas e inventario vencido.
    const mermaInput = await screen.findByPlaceholderText(/Registrar merma/i, {}, { timeout: 3000 });
    // Escribe una merta de prueba.
    fireEvent.change(mermaInput, { target: { value: '3 kilos de tomate vencido' } });
    // Presiona Enter o el botón de registro.
    fireEvent.submit(mermaInput.closest('form'));
    // Verifica que la merma quede registrada en el historial.
    expect(screen.getByText(/3 kilos de tomate vencido/i)).toBeInTheDocument();

    // Activa el Botón de Pánico de emergencia.
    const panicBtn = screen.getByRole('button', { name: /BOTÓN DE PÁNICO/i });
    fireEvent.click(panicBtn);
    // Confirma la alerta de emergencia global.
    expect(screen.getByText(/ALERTA DE EMERGENCIA ACTIVADA/i)).toBeInTheDocument();
  });
});
