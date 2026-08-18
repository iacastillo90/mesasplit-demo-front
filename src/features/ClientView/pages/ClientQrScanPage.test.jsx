// src/features/ClientView/pages/ClientQrScanPage.test.jsx — Pruebas unitarias de ClientQrScanPage (fase15-flujo-qr-perfil-cliente)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { fireEvent, render, screen } from '@testing-library/react';
// MemoryRouter para soportar navegaciones en tests.
import { MemoryRouter } from 'react-router-dom';
// Componente a probar.
import ClientQrScanPage from './ClientQrScanPage.jsx';

describe('ClientQrScanPage — Simulador de Escaneo QR de Mesa', () => {
  it('renderiza la interfaz del visor de cámara y los botones de simulación', () => {
    render(
      <MemoryRouter>
        <ClientQrScanPage />
      </MemoryRouter>,
    );

    // Verifica que el encabezado y botones estén presentes.
    expect(screen.getByRole('heading', { name: /Escaneá tu Mesa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simular Escaneo Mesa 12/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Siguiente → Ingresar a Mesa Virtual/i })).toBeInTheDocument();
  });

  it('permite simular el escaneo de la Mesa 12 haciendo clic en el botón', () => {
    render(
      <MemoryRouter>
        <ClientQrScanPage />
      </MemoryRouter>,
    );

    // Hace clic en simular escaneo Mesa 12.
    fireEvent.click(screen.getByRole('button', { name: /Simular Escaneo Mesa 12/i }));

    // Confirma la presencia del mensaje de éxito.
    expect(screen.getByText(/Mesa 12 detectada exitosamente/i)).toBeInTheDocument();
  });
});
