// src/features/ClientView/pages/ClientLoginPage.test.jsx — Pruebas unitarias de ClientLoginPage (fase14-login-cliente-filtros-responsive)
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
import ClientLoginPage from './ClientLoginPage.jsx';

describe('ClientLoginPage — Inicio de Sesión de Cliente Demo', () => {
  it('renderiza los campos de correo y contraseña correctamente', () => {
    render(
      <MemoryRouter>
        <ClientLoginPage />
      </MemoryRouter>,
    );

    // Verifica que los elementos clave estén presentes.
    expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
  });

  it('permite iniciar sesión con cualquier correo y contraseña', () => {
    useClientStore.getState().resetDemo();

    render(
      <MemoryRouter>
        <ClientLoginPage />
      </MemoryRouter>,
    );

    // Escribe credenciales de prueba.
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'demo.user@mesasplit.cl' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'password123' },
    });

    // Envía el formulario.
    fireEvent.click(screen.getByRole('button', { name: /Ingresar a Mesa Virtual/i }));

    // Confirma que el usuario quedó almacenado en el store.
    const user = useClientStore.getState().user;
    expect(user).not.toBeNull();
    expect(user.email).toBe('demo.user@mesasplit.cl');
  });
});
