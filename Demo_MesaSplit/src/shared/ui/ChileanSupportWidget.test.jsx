// src/shared/ui/ChileanSupportWidget.test.jsx — Pruebas unitarias de ChileanSupportWidget (fase12-cobertura-total-20-modulos-saas)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente a probar.
import ChileanSupportWidget from './ChileanSupportWidget.jsx';

describe('ChileanSupportWidget — Soporte 24/7 Chileno', () => {
  it('renderiza el botón flotante de Soporte 24/7', () => {
    // Renderiza el widget.
    render(<ChileanSupportWidget />);

    // Verifica que el botón gatillador de Soporte 24/7 esté en pantalla.
    expect(screen.getByRole('button', { name: /Soporte 24\/7/i })).toBeInTheDocument();
  });

  it('despliega el panel con los canales de atención por WhatsApp y Teléfono al hacer clic', () => {
    // Renderiza el widget.
    render(<ChileanSupportWidget />);

    // Haz clic en el botón flotante.
    const button = screen.getByRole('button', { name: /Soporte 24\/7/i });
    fireEvent.click(button);

    // Confirma la aparición de los enlaces de WhatsApp y Teléfono.
    expect(screen.getByText(/WhatsApp Soporte Directo/i)).toBeInTheDocument();
    expect(screen.getByText(/Línea Telefónica Gastronómica/i)).toBeInTheDocument();
  });
});
