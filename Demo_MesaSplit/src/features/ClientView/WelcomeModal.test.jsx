// src/features/ClientView/WelcomeModal.test.jsx — suite de tests de onboarding de Mesa Virtual (client-onboarding)
// Cubre el spec client-onboarding: modal/banner de bienvenida de primera visita, descarte persistido en localStorage
// (clave mesasplit-onboarding) y confirmación estricta de que la guía no bloquea el catálogo ni la adición al carrito.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado y simulación de interacciones.
import { fireEvent, render, screen } from '@testing-library/react';
// Store de ClientView para asertar el carrito.
import { useClientStore } from './store/useClientStore.js';
// MemoryRouter para soportar navegaciones en tests.
import { MemoryRouter } from 'react-router-dom';
// Página principal de ClientView para probar la integración real.
import ClientPage from './pages/ClientPage.jsx';

describe('client-onboarding: Guía de bienvenida de primera visita', () => {
  beforeEach(() => {
    // Limpia el localStorage y el store antes de cada prueba.
    window.localStorage.removeItem('mesasplit-onboarding');
    useClientStore.getState().resetDemo();
  });

  it('Scenario 1: Primera visita muestra la guía cuando localStorage está vacío', async () => {
    // Renderiza la Mesa Virtual del cliente con Router.
    render(
      <MemoryRouter>
        <ClientPage />
      </MemoryRouter>,
    );
    // La guía de bienvenida debe estar visible en pantalla con el mensaje de introducción.
    expect(await screen.findByRole('heading', { name: /¡Bienvenido a MesaSplit!/i })).toBeInTheDocument();
    expect(screen.getByText(/Escaneá, pedí y dividí la cuenta/i)).toBeInTheDocument();
  });

  it('Scenario 2: Descarte persistido guarda mesasplit-onboarding=true y no vuelve a mostrarse', async () => {
    // Renderiza la Mesa Virtual sin clave en localStorage.
    render(
      <MemoryRouter>
        <ClientPage />
      </MemoryRouter>,
    );
    // Presiona el botón de descarte "Entendido, ¡a comer!".
    const dismissBtn = await screen.findByRole('button', { name: /Entendido/i });
    fireEvent.click(dismissBtn);

    // Verifica que el banner ya no está en pantalla.
    expect(screen.queryByRole('heading', { name: /¡Bienvenido a MesaSplit!/i })).not.toBeInTheDocument();
    // Confirma que el flag quedó guardado en localStorage.
    expect(window.localStorage.getItem('mesasplit-onboarding')).toBe('true');
  });

  it('Scenario 3: La guía no bloquea pedidos — agregar un ítem incrementa el carrito real mientras la guía sigue visible', async () => {
    // Renderiza la Mesa Virtual.
    render(
      <MemoryRouter>
        <ClientPage />
      </MemoryRouter>,
    );
    // Verifica que el banner de bienvenida está presente.
    expect(await screen.findByRole('heading', { name: /¡Bienvenido a MesaSplit!/i })).toBeInTheDocument();

    // El carrito está inicialmente vacío (0 ítems).
    expect(useClientStore.getState().cart.length).toBe(0);

    // Busca un botón de agregar plato del catálogo con la guía visible.
    const addButtons = await screen.findAllByRole('button', { name: /Agregar/i });
    expect(addButtons.length).toBeGreaterThan(0);
    // Simula agregar un plato al carrito.
    fireEvent.click(addButtons[0]);

    // Verifica que el ítem efectivamente se agregó al carrito del store.
    expect(useClientStore.getState().cart.length).toBeGreaterThan(0);
    // Y la guía de bienvenida permanece montada sin interferir.
    expect(screen.getByRole('heading', { name: /¡Bienvenido a MesaSplit!/i })).toBeInTheDocument();
  });
});
