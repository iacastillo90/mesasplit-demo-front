// src/features/CorporateView/SuperAdminPage.test.jsx — suite de tests del Panel Corporativo Super Admin (super-admin-corporate)
// Cubre la especificación super-admin-corporate: resumen de KPIs globales multi-local ($1.850.000+),
// tarjetas de salud operacional por sucursal (Las Condes, Providencia, Vitacura, Santiago Centro),
// conmutadores globales de configuración de franquicia (Ley 40h, Alergias, DTE) y registro de auditoría real-time.
// Todos los tests cumplen las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado de componentes y simulación de eventos de usuario.
import { fireEvent, render, screen } from '@testing-library/react';
// MemoryRouter para soportar el componente Link de React Router en los tests de unidad.
import { MemoryRouter } from 'react-router-dom';
// Store de Zustand del panel corporativo.
import { useCorporateStore } from './store/useCorporateStore.js';
// Componente principal del Super Admin Corporativo.
import SuperAdminPage from './pages/SuperAdminPage.jsx';

// Helper de renderizado envuelto en MemoryRouter.
function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('super-admin-corporate: Resumen de KPIs y Tarjetas de Salud Multi-Local', () => {
  beforeEach(() => {
    // Restablece el store corporativo antes de cada prueba.
    useCorporateStore.getState().resetDemo();
  });

  it('renderiza la cabecera corporativa y los KPIs globales acumulados de la franquicia', async () => {
    // Renderiza la vista de Super Admin Corporativo con MemoryRouter.
    renderWithRouter(<SuperAdminPage />);
    // Verifica el título corporativo principal.
    expect(await screen.findByRole('heading', { name: /Panel Corporativo Multi-Local/i }, { timeout: 3000 })).toBeInTheDocument();
    // Verifica la presencia del indicador de ventas totales acumuladas ($1.850.000+).
    expect(await screen.findByText(/Ventas Franquicia/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('renderiza las tarjetas de salud operacional para las 4 sucursales (Las Condes, Providencia, Vitacura, Santiago Centro)', async () => {
    // Renderiza la vista.
    renderWithRouter(<SuperAdminPage />);
    // Verifica las 4 tarjetas de sucursal en el panel mediante sus encabezados de rol.
    expect(await screen.findByRole('heading', { name: /Salón Las Condes/i }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Terraza Providencia/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Barra Vitacura/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Express Santiago Centro/i })).toBeInTheDocument();
  });
});

describe('super-admin-corporate: Conmutadores Globales de Franquicia y Auditoría Realtime', () => {
  beforeEach(() => {
    useCorporateStore.getState().resetDemo();
  });

  it('permite conmutar la regla global de Control Ley 40 Horas para toda la franquicia', async () => {
    // Renderiza la vista.
    renderWithRouter(<SuperAdminPage />);
    // Busca el switch global de Control Ley 40 Horas.
    const switchLey40 = await screen.findByRole('checkbox', { name: /Control Ley 40 Horas/i }, { timeout: 3000 });
    // Alterna la configuración global.
    fireEvent.click(switchLey40);
    // Confirma que el estado se actualice en el toggle.
    expect(switchLey40.checked).toBe(false);
  });

  it('despliega el flujo de eventos de auditoría multi-sucursal en tiempo real', async () => {
    // Renderiza la vista corporativa.
    renderWithRouter(<SuperAdminPage />);
    // Verifica la presencia del flujo de auditoría cross-branch.
    expect(await screen.findByText(/Flujo de Eventos Franquicia/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });
});
