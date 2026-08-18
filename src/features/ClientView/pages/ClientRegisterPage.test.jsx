// src/features/ClientView/pages/ClientRegisterPage.test.jsx — Pruebas unitarias de ClientRegisterPage (fase14-login-cliente-filtros-responsive)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { fireEvent, render, screen } from '@testing-library/react';
// MemoryRouter para soportar navegaciones en tests.
import { MemoryRouter } from 'react-router-dom';
// Store de ClientView para verificar la actualización de sesión.
import { useClientStore } from '../store/useClientStore.js';
// Componente a probar.
import ClientRegisterPage from './ClientRegisterPage.jsx';

describe('ClientRegisterPage — Registro de Usuario con Ley N° 21.716', () => {
  it('renderiza los botones de Social Login y la cláusula de Ley N° 21.716', () => {
    render(
      <MemoryRouter>
        <ClientRegisterPage />
      </MemoryRouter>,
    );

    // Verifica que los botones de Social Login estén presentes.
    expect(screen.getByRole('button', { name: /Continuar con Apple/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar con Google/i })).toBeInTheDocument();
    // Confirma la cita de la Ley N° 21.716 sobre Protección de Datos Personales.
    expect(screen.getByText(/Ley N° 21.716 sobre Protección de Datos Personales/i)).toBeInTheDocument();
  });

  it('permite registrarse mediante Social Login con Google', () => {
    useClientStore.getState().resetDemo();

    render(
      <MemoryRouter>
        <ClientRegisterPage />
      </MemoryRouter>,
    );

    // Hace clic en continuar con Google.
    fireEvent.click(screen.getByRole('button', { name: /Continuar con Google/i }));

    // Confirma el registro del usuario en el store.
    const user = useClientStore.getState().user;
    expect(user).not.toBeNull();
    expect(user.name).toBe('Usuario Google');
  });
});
