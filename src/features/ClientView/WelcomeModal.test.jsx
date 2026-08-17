// src/features/ClientView/WelcomeModal.test.jsx — suite de tests de onboarding de Mesa Virtual (client-onboarding)
// Cubre el spec client-onboarding: modal de bienvenida de primera visita, descarte persistido en localStorage
// (clave mesasplit-onboarding) y confirmación de que la guía no bloquea el catálogo ni el carrito.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado y simulación de interacciones.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente de modal de bienvenida.
import WelcomeModal from './components/WelcomeModal.jsx';
// Página principal de ClientView para probar la integración real.
import ClientPage from './pages/ClientPage.jsx';

describe('client-onboarding: Guía de bienvenida de primera visita', () => {
  beforeEach(() => {
    // Limpia el localStorage antes de cada prueba para simular primera visita.
    window.localStorage.removeItem('mesasplit-onboarding');
  });

  it('Scenario 1: Primera visita muestra la guía cuando localStorage está vacío', async () => {
    // Renderiza la Mesa Virtual del cliente.
    render(<ClientPage />);
    // La guía de bienvenida debe estar visible en pantalla con el mensaje de introducción.
    expect(await screen.findByRole('heading', { name: /¡Bienvenido a MesaSplit!/i })).toBeInTheDocument();
    expect(screen.getByText(/Escaneá, pedí y dividí la cuenta/i)).toBeInTheDocument();
  });

  it('Scenario 2: Descarte persistido guarda mesasplit-onboarding=true y no vuelve a mostrarse', async () => {
    // Renderiza la Mesa Virtual sin clave en localStorage.
    render(<ClientPage />);
    // Presiona el botón de descarte "Entendido, ¡a comer!".
    const dismissBtn = await screen.findByRole('button', { name: /Entendido/i });
    fireEvent.click(dismissBtn);

    // Verifica que el modal ya no está visible.
    expect(screen.queryByRole('heading', { name: /¡Bienvenido a MesaSplit!/i })).not.toBeInTheDocument();
    // Confirma que el flag quedó guardado en localStorage.
    expect(window.localStorage.getItem('mesasplit-onboarding')).toBe('true');
  });

  it('Scenario 3: La guía no bloquea pedidos — el menú y los botones son operables con la guía montada', async () => {
    // Renderiza la Mesa Virtual.
    render(<ClientPage />);
    // Verifica que el modal está presente.
    expect(await screen.findByRole('heading', { name: /¡Bienvenido a MesaSplit!/i })).toBeInTheDocument();

    // Busca un botón de agregar plato del menú sin requerir descartar la guía primero.
    const addButtons = await screen.findAllByRole('button', { name: /Agregar/i });
    expect(addButtons.length).toBeGreaterThan(0);
    // Simula agregar un plato al carrito.
    fireEvent.click(addButtons[0]);

    // El contador de ítems del carrito se actualiza (la guía no bloqueó la acción).
    expect(screen.getByText('Ver carrito')).toBeInTheDocument();
  });
});
