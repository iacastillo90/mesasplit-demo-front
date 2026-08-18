// src/features/ClientView/pages/ClientProfilePage.test.jsx — Pruebas unitarias de ClientProfilePage (fase15-flujo-qr-perfil-cliente)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { render, screen } from '@testing-library/react';
// MemoryRouter para soportar navegaciones en tests.
import { MemoryRouter } from 'react-router-dom';
// Store de cliente.
import { useClientStore } from '../store/useClientStore.js';
// Componente a probar.
import ClientProfilePage from './ClientProfilePage.jsx';

describe('ClientProfilePage — Perfil Completo del Comensal', () => {
  it('renderiza la tarjeta del usuario logueado y sus puntos de lealtad', () => {
    // Asegura usuario logueado en el store.
    useClientStore.setState({
      user: { name: 'Constanza Silva', email: 'constanza@mesasplit.cl', avatar: '👩‍💻' },
    });

    render(
      <MemoryRouter>
        <ClientProfilePage />
      </MemoryRouter>,
    );

    // Verifica que aparezca el nombre y nivel del usuario.
    expect(screen.getByRole('heading', { name: /Constanza Silva/i })).toBeInTheDocument();
    expect(screen.getByText(/VIP Gold 🏆/i)).toBeInTheDocument();
    expect(screen.getByText(/Catálogo de Premios Canjeables/i)).toBeInTheDocument();
  });
});
