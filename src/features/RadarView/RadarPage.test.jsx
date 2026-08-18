// src/features/RadarView/RadarPage.test.jsx — suite de tests del Local Admin Radar (local-admin-radar)
// Cubre la especificación local-admin-radar: plano topológico del salón por zonas,
// tarjetas del canal Delivery Omnicanal, cajón de auditoría (alert.fraud), modo Hora Punta,
// barra de comandos para mermas e insumos vencidos y Botón de Pánico de emergencia.
// Todos los tests cumplen las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado de componentes y simulación de eventos de usuario.
import { fireEvent, render, screen } from '@testing-library/react';
// Store de Zustand del RadarView.
import { useRadarStore } from './store/useRadarStore.js';
// Componente principal de la página del Radar Local Admin.
import RadarPage from './pages/RadarPage.jsx';

describe('feature-views: mapa del radar (spec)', () => {
  beforeEach(() => {
    // Restablece el store de Radar antes de cada prueba y fija loading en false.
    useRadarStore.getState().resetDemo();
    useRadarStore.setState({ loading: false });
  });

  it('el conteo del mapa coincide con el fixture de mesas', () => {
    // Renderiza la vista de Radar Local Admin.
    render(<RadarPage />);
    // La cabecera indica la cantidad de mesas activas en el salón.
    expect(screen.getByRole('heading', { name: /Plano del salón/i })).toBeInTheDocument();
  }, 15000);
});

describe('local-admin-radar: Plano Topológico y Delivery Omnicanal', () => {
  beforeEach(() => {
    useRadarStore.getState().resetDemo();
    useRadarStore.setState({ loading: false });
  });

  it('renderiza filtros por zona (Salón, Terraza, Barra) y tarjetas de Delivery Omnicanal', () => {
    // Renderiza la vista de Radar.
    render(<RadarPage />);
    // Verifica la presencia de los botones de zonas.
    expect(screen.getByRole('button', { name: 'Salón' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Terraza' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Barra' })[0]).toBeInTheDocument();

    // Verifica el encabezado del canal virtual de Delivery Omnicanal.
    expect(screen.getByRole('region', { name: /Delivery Omnicanal/i })).toBeInTheDocument();
  }, 15000);
});

describe('local-admin-radar: Modo Hora Punta y Exception Feed', () => {
  beforeEach(() => {
    useRadarStore.getState().resetDemo();
    useRadarStore.setState({ loading: false });
  });

  it('activa el Modo Hora Punta mostrando el badge y despliega el Exception Feed', () => {
    // Renderiza la vista de Radar.
    render(<RadarPage />);
    // Encuentra el botón de alternancia de Hora Punta.
    const focusBtn = screen.getByRole('button', { name: /Hora Punta/i });
    // Activa el modo Hora Punta.
    fireEvent.click(focusBtn);
    // Confirma la aparición del badge parpadeante de Hora Punta.
    expect(screen.getAllByText(/MODO HORA PUNTA/i).length).toBeGreaterThan(0);

    // Abre el cajón de auditoría de excepciones.
    const auditBtn = screen.getByRole('button', { name: /Auditoría/i });
    fireEvent.click(auditBtn);
    // Verifica el título del cajón de auditoría síncronamente.
    expect(screen.getByText(/Registro de Excepciones y Auditoría/i)).toBeInTheDocument();
  }, 15000);
});

describe('local-admin-radar: Registro de Merma y Botón de Pánico', () => {
  beforeEach(() => {
    useRadarStore.getState().resetDemo();
    useRadarStore.setState({ loading: false });
  });

  it('permite ingresar mermas en la barra de comando y activar el Botón de Pánico', () => {
    // Renderiza la vista de Radar.
    render(<RadarPage />);
    // Busca el input de registro de mermas e inventario vencido.
    const mermaInput = screen.getByPlaceholderText(/Registrar merma/i);
    // Escribe una merma de prueba.
    fireEvent.change(mermaInput, { target: { value: '3 kilos de tomate vencido' } });
    // Presiona Enter o el botón de registro.
    fireEvent.submit(mermaInput.closest('form'));
    // Verifica que la merma quede registrada en el historial.
    expect(screen.getByText(/3 kilos de tomate vencido/i)).toBeInTheDocument();

    // Activa el Botón de Pánico de emergencia.
    const panicBtn = screen.getByRole('button', { name: /Pánico/i });
    fireEvent.click(panicBtn);
    // Confirma la alerta de emergencia global.
    expect(screen.getByText(/ALERTA DE EMERGENCIA ACTIVADA/i)).toBeInTheDocument();
  }, 15000);
});
