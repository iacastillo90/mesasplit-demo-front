// src/routes/__tests__/routing.test.jsx — suite de la tabla de rutas (task 4.1)
// Cubre el spec app-routing sobre la MISMA tabla que usa la app en producción:
// las 7 vistas renderizan en su URL, el hub lista y navega, el 404 ofrece vuelta
// y /admin/super NO monta el Radar (regresión del slot de admin).
// Enfoque del design: "memory router for non-/ paths" — los tests construyen un
// createMemoryRouter con la tabla exportada de index.jsx (cero divergencias con
// el router real) y una sonda de pathname montada como layout.
// RED→GREEN: se escribió antes de Phase 3; los anclas post-carga dependen de que
// los servicios sigan resolviendo fixtures tras la conexión a mockFetch.

// API de Vitest importada explícita: ESLint no declara los globals de Vitest.
import { describe, expect, it } from 'vitest';
// RTL: renderiza React y consulta el DOM por texto/roles.
import { render, screen } from '@testing-library/react';
// userEvent: interacción realista (click) sobre los launchers del hub.
import userEvent from '@testing-library/user-event';
// Router: memory router (tests) + provider + sonda de ubicación.
import { createMemoryRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom';
// Tabla real de rutas de la app (misma fuente que produce createBrowserRouter).
import { routes } from '../index.jsx';

// Sonda de ubicación: expone el pathname actual para asertar la URL navegada.
function LocationProbe() {
  // Lee la ubicación actual del memory router.
  const { pathname } = useLocation();
  // Devuelve el pathname en un nodo consultable por el test.
  return <span data-testid="pathname">{pathname}</span>;
}

// Layout de la sonda: se monta sobre TODAS las rutas (padre con Outlet).
function ProbeLayout() {
  // Renderiza la sonda + el contenido de la ruta hija.
  return (
    <>
      {/* Sonda del pathname activo en cualquier ruta. */}
      <LocationProbe />
      {/* Outlet renderiza la vista de la ruta hija matcheada. */}
      <Outlet />
    </>
  );
}

// Crea un memory router con la tabla real, arrancando en la ruta indicada.
function createTestRouter(initialPath) {
  // Envuelve la tabla bajo el layout de la sonda (sin tocar los paths).
  return createMemoryRouter([{ element: <ProbeLayout />, children: routes }], {
    // Ruta inicial del memory router (jsdom no participa en la navegación).
    initialEntries: [initialPath],
  });
}

// Renderiza la app de prueba en la ruta inicial dada.
function renderApp(initialPath = '/') {
  // Construye el memory router para esa ruta inicial.
  const testRouter = createTestRouter(initialPath);
  // Devuelve el render del RouterProvider con ese router.
  return render(<RouterProvider router={testRouter} />);
}

describe('app-routing: tabla de rutas (spec)', () => {
  it('la raíz renderiza el hub Portal (landing por defecto)', async () => {
    // Renderiza la app en la URL raíz.
    renderApp('/');
    // Espera el título del hub (contenido sincrónico del Portal).
    expect(
      await screen.findByRole('heading', { name: /División de Cuentas/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('renderiza la Mesa Virtual en /cliente con datos del menú', async () => {
    // Renderiza la app arrancando en la ruta del cliente.
    renderApp('/cliente');
    // El banner muestra el contexto de mesa tras la carga del servicio.
    expect(await screen.findByText('Mesa 12', {}, { timeout: 5000 })).toBeInTheDocument();
    // El menú llega vía clientService (en GREEN a través de mockFetch).
    expect(await screen.findByText('Hamburguesa Clásica', {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it('renderiza la grilla del garzón en /garzon con mesas del servicio', async () => {
    // Renderiza la app arrancando en la ruta del garzón.
    renderApp('/garzon');
    // Tras la carga hay al menos una mesa en estado Ocupada (semántica brand).
    expect((await screen.findAllByText(/Ocupada/, {}, { timeout: 5000 })).length).toBeGreaterThan(0);
  });

  it('renderiza la cocina KDS en /cocina (modo oscuro) con tickets', async () => {
    // Renderiza la app arrancando en la ruta de la cocina.
    renderApp('/cocina');
    // Cabecera del KDS: título visible de la vista (inmediato).
    expect(await screen.findByRole('heading', { name: 'Cocina' }, { timeout: 5000 })).toBeInTheDocument();
    // Los tickets resuelven vía kdsService (en GREEN a través de mockFetch).
    expect(await screen.findByText('Hamburguesa Clásica', {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it('renderiza el Radar Local Admin en /admin (index)', async () => {
    // Renderiza la app arrancando en la ruta del radar.
    renderApp('/admin');
    // Cabecera del Local Admin: título de la vista.
    expect(await screen.findByRole('heading', { name: 'Local Admin' }, { timeout: 5000 })).toBeInTheDocument();
    // El mapa topológico se dibuja tras la siembra desde el store demo.
    expect(await screen.findByText(/Plano del salón/i, {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it('renderiza el panel de Super Admin en /admin/super SIN montar el Radar', async () => {
    // Renderiza la app arrancando en la ruta anidada del Super Admin.
    renderApp('/admin/super');
    // Verifica la presencia del panel corporativo de Super Admin.
    expect(await screen.findByRole('heading', { name: /Panel Corporativo Multi-Local/i }, { timeout: 5000 })).toBeInTheDocument();
    // ESPEC app-routing: el Radar NO debe montarse para el hijo anidado.
    expect(screen.queryByText(/Plano del salón/i)).not.toBeInTheDocument();
  });

  it('el hub lista todos los launchers de las vistas', async () => {
    // Renderiza la app arrancando en la raíz (hub).
    renderApp('/');
    // Espera a que el hub esté montado (título de landing).
    await screen.findByRole('heading', { name: /División de Cuentas/i }, { timeout: 5000 });
    // Verifica un launcher por vista del spec app-routing.
    const labels = ['Mesa Virtual', 'Garzón', 'Cocina', 'Local Admin', 'Super Admin'];
    // Recorre cada etiqueta esperada del hub.
    labels.forEach((label) => {
      // Cada launcher es un link con el nombre visible de la vista.
      expect(screen.getByRole('link', { name: new RegExp(label) })).toBeInTheDocument();
    });
  });

  it('el launcher de Cocina navega a /cocina y monta el KDS', async () => {
    // Prepara la interacción del usuario (userEvent sin fake timers).
    const user = userEvent.setup();
    // Renderiza la app arrancando en el hub.
    renderApp('/');
    // Espera el launcher de la cocina (card clickeable del hub).
    const cocinaLink = await screen.findByRole('link', { name: /Cocina/ }, { timeout: 5000 });
    // Activa el launcher como haría un usuario real.
    await user.click(cocinaLink);
    // La URL cambió a la ruta de la cocina (escenario "launcher navigates").
    expect(screen.getByTestId('pathname').textContent).toBe('/cocina');
    // Y el KDS quedó montado (cabecera de la vista de cocina).
    expect(await screen.findByRole('heading', { name: 'Cocina' }, { timeout: 5000 })).toBeInTheDocument();
  });

  it('una ruta desconocida muestra el 404 con link de vuelta al hub', async () => {
    // Prepara la interacción del usuario.
    const user = userEvent.setup();
    // Renderiza la app arrancando en una URL fuera de la tabla (/no-existe).
    renderApp('/no-existe');
    // La vista 404 se renderiza sin crashear la app.
    expect(await screen.findByText('La página que buscas no existe', {}, { timeout: 5000 })).toBeInTheDocument();
    // Activa el link de retorno al hub ("fallback ofrece una vía de vuelta").
    await user.click(screen.getByRole('link', { name: /Volver al inicio/ }));
    // El hub vuelve a montarse en la raíz (pathname y vista).
    expect(screen.getByTestId('pathname').textContent).toBe('/');
    expect(
      await screen.findByRole('heading', { name: /División de Cuentas/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });
});
