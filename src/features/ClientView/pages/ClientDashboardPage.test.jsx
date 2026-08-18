// src/features/ClientView/pages/ClientDashboardPage.test.jsx — Pruebas unitarias de ClientDashboardPage (fase16-dashboard-cliente-menu-hamburguesa)
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
import ClientDashboardPage from './ClientDashboardPage.jsx';

describe('ClientDashboardPage — Dashboard Central del Comensal', () => {
  it('renderiza la cabecera de bienvenida personalizada y los accesos principales', () => {
    // Asegura usuario logueado en el store.
    useClientStore.setState({
      user: { name: 'Antonia Morales', email: 'antonia@ejemplo.cl', avatar: '👩‍💻' },
    });

    render(
      <MemoryRouter>
        <ClientDashboardPage />
      </MemoryRouter>,
    );

    // Verifica que aparezca el saludo personalizado.
    expect(screen.getByRole('heading', { name: /¡Hola Antonia Morales! 👋/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Escanear Mesa/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir a Mesa Virtual/i })).toBeInTheDocument();
  });
});
