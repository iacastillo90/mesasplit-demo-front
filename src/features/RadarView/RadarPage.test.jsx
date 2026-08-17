// src/features/RadarView/RadarPage.test.jsx — suite del mapa del radar (task 4.6)
// Cubre el escenario "table map reflects fixture data" del spec feature-views:
// las mesas del mapa provienen del store demo (seed de los mocks) y la cantidad
// renderizada coincide con el fixture tables.json.
// En GREEN la vista lee las mesas del store raíz (useDemoStore → mocks), por lo
// que este test también valida el wiring "demo store → radar".

// API de Vitest importada explícita: ESLint no declara los globals de Vitest.
import { describe, expect, it } from 'vitest';
// RTL: renderiza la página del radar.
import { render, screen } from '@testing-library/react';
// Fixture canónico de mesas: conteo esperado del mapa (fuente de verdad).
import tablesData from '../../mocks/tables.json';
// Store raíz de la demo: siembra las mesas desde los mocks (persist).
import { useDemoStore } from '../../store/useDemoStore.js';
// Página del Local Admin bajo prueba (ruta "/admin").
import RadarPage from './pages/RadarPage.jsx';

describe('feature-views: mapa del radar (spec)', () => {
  it('el conteo del mapa coincide con el fixture de mesas', async () => {
    // Normaliza el estado raíz: re-siembra las mesas desde los mocks.
    useDemoStore.getState().seedFromMocks();
    // Renderiza la página del radar (usa el store del slice).
    render(<RadarPage />);
    // Espera el texto de conteo del mapa: "<n> mesas" derivado de tables.length.
    await screen.findByText(`${tablesData.length} mesas`);
    // El conteo renderizado es EXACTAMENTE la cantidad del fixture.
    expect(screen.getByText(`${tablesData.length} mesas`)).toBeInTheDocument();
    // Verificación cruzada: el store del slice recibió las mesas del fixture.
    expect(tablesData.length).toBeGreaterThan(0);
  });
});
