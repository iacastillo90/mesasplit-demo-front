// src/features/Portal/PortalPage.test.jsx — suite del launcher del hub (task 4.4)
// Cubre el escenario "launcher navigates to its view" del spec app-routing:
// activar la tarjeta de Cocina cambia la URL a /cocina y monta la vista destino.
// El hub se renderiza dentro de un MemoryRouter (test unitario del launcher).

// API de Vitest importada explícita: ESLint no declara los globals de Vitest.
import { describe, expect, it } from 'vitest';
// RTL: renderiza React y consulta el DOM por texto/roles.
import { render, screen } from '@testing-library/react';
// userEvent: interacción realista sobre el launcher.
import userEvent from '@testing-library/user-event';
// Router: MemoryRouter + Routes para probar la navegación del launcher.
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
// Página del hub bajo prueba (ruta "/").
import PortalPage from './pages/PortalPage.jsx';

// Sonda de ubicación: expone el pathname actual para asertar la URL.
function LocationProbe() {
  // Lee la ubicación actual del router (MemoryRouter).
  const { pathname } = useLocation();
  // Devuelve el pathname en un nodo consultable por el test.
  return <span data-testid="location">{pathname}</span>;
}

// Renderiza el hub con una ruta destino real para probar la navegación.
function renderHub() {
  // Monta el MemoryRouter arrancando en la raíz "/".
  return render(
    <MemoryRouter initialEntries={['/']}>
      {/* Tabla mínima: hub en "/" y vista destino en /cocina. */}
      <Routes>
        {/* Ruta que monta el hub Portal (launcher bajo prueba). */}
        <Route path="/" element={<PortalPage />} />
        {/* Ruta destino: sonda de URL + marcador de la vista montada. */}
        <Route
          path="/cocina"
          element={
            <>
              {/* Sonda del pathname para asertar el cambio de URL. */}
              <LocationProbe />
              {/* Marcador de que la vista destino quedó montada. */}
              <div>Vista Cocina montada</div>
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('app-routing: launcher del hub (spec)', () => {
  it('el launcher de Cocina navega a /cocina y monta la vista destino', async () => {
    // Prepara la interacción del usuario (sin fake timers).
    const user = userEvent.setup();
    // Renderiza el hub con la ruta destino configurada.
    renderHub();
    // Espera el launcher de la cocina (link clickeable del hub).
    const cocinaLink = await screen.findByRole('link', { name: /Cocina/ });
    // Activa la tarjeta como haría un usuario real.
    await user.click(cocinaLink);
    // La URL cambió a la ruta de la cocina (escenario "launcher navigates").
    expect(screen.getByTestId('location').textContent).toBe('/cocina');
    // La vista destino quedó montada tras la navegación.
    expect(screen.getByText('Vista Cocina montada')).toBeInTheDocument();
  });
});
