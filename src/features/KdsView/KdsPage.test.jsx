// src/features/KdsView/KdsPage.test.jsx — suite del KDS oscuro (task 4.5)
// Cubre el spec feature-views KDS dark: fondo brand-950 (#011623), tarjetas
// brand-800 (#024064), texto claro y NINGUNA superficie clara en el slice
// (escenarios "dark surfaces throughout" y "no light-mode leakage").
// La espera de tickets valida además la conexión kdsService → mockFetch.

// API de Vitest importada explícita: ESLint no declara los globals de Vitest.
import { describe, expect, it } from 'vitest';
// RTL: renderiza la página completa del KDS.
import { render, screen } from '@testing-library/react';
// Página del KDS bajo prueba (ruta "/cocina").
import KdsPage from './pages/KdsPage.jsx';

describe('feature-views: KDS dark (spec)', () => {
  it('usa superficies oscuras brand-950/800 con texto claro', async () => {
    // Renderiza la página completa del KDS (store del slice real).
    const { container } = render(<KdsPage />);
    // Espera un plato del ticket: la carga resolvió (kdsService → fixtures).
    await screen.findByText('Hamburguesa Clásica');
    // Obtiene el contenedor principal de la vista (fondo brand-950).
    const main = container.querySelector('main');
    // El fondo de la página es brand-950 (spec: #011623).
    expect(main).toHaveClass('bg-brand-950');
    // Las tarjetas de ticket son <article> en la grilla.
    const cards = container.querySelectorAll('article');
    // La grilla renderizó al menos una tarjeta de ticket.
    expect(cards.length).toBeGreaterThan(0);
    // Recorre cada tarjeta verificando su superficie oscura.
    cards.forEach((card) => {
      // Cada tarjeta usa brand-800 (spec: #024064).
      expect(card).toHaveClass('bg-brand-800');
    });
  });

  it('no tiene superficies claras en el slice (no light-mode leakage)', async () => {
    // Renderiza la página completa del KDS.
    const { container } = render(<KdsPage />);
    // Espera la carga completa para inspeccionar todas las superficies.
    await screen.findByText('Hamburguesa Clásica');
    // Tokens EXACTOS de fondo claro: la comparación es por clase completa para
    // no confundir bg-brand-500 (acento de marca, correcto en dark) con
    // bg-brand-50/100 (superficies claras prohibidas por el spec).
    const lightTokens = new Set([
      'bg-white',
      'bg-gray-50',
      'bg-gray-100',
      'bg-gray-200',
      'bg-brand-50',
      'bg-brand-100',
    ]);
    // Busca cualquier elemento cuya clase sea una superficie de modo claro.
    const lightSurfaces = [...container.querySelectorAll('*')].filter((el) =>
      // Divide el className en tokens y cruza contra los claros prohibidos.
      String(el.className ?? '')
        .split(' ')
        .some((token) => lightTokens.has(token)),
    );
    // NINGUNA superficie clara dentro del slice (spec: sin fuga).
    expect(lightSurfaces).toHaveLength(0);
  });
});
