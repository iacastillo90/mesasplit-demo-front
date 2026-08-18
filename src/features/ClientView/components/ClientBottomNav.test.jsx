// src/features/ClientView/components/ClientBottomNav.test.jsx — Pruebas unitarias de ClientBottomNav (fase17-bottom-nav-mobile-layout-cliente)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { render, screen } from '@testing-library/react';
// MemoryRouter para soportar navegaciones en tests.
import { MemoryRouter } from 'react-router-dom';
// Componente a probar.
import ClientBottomNav from './ClientBottomNav.jsx';

describe('ClientBottomNav — Barra de Navegación Inferior Móvil', () => {
  it('renderiza las 5 pestañas de navegación principales del cliente', () => {
    render(
      <MemoryRouter initialEntries={['/cliente/dashboard']}>
        <ClientBottomNav />
      </MemoryRouter>,
    );

    // Verifica que estén las pestañas principales.
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Escanear QR/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mesa 12/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Comanda/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Perfil/i })).toBeInTheDocument();
  });
});
