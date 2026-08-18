// src/features/ClientView/components/DteTicketModal.test.jsx — Pruebas unitarias de DteTicketModal (fase20-navegacion-retroceso-perfil-reseñas-referidos)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { render, screen } from '@testing-library/react';
// Componente a probar.
import DteTicketModal from './DteTicketModal.jsx';

describe('DteTicketModal — Ticket de Boleta Electrónica SII', () => {
  it('renderiza la boleta electrónica con timbre SII y desglose de consumo', () => {
    render(<DteTicketModal isOpen={true} onClose={() => {}} />);

    // Verifica que aparezca el título y timbre SII.
    expect(screen.getByText(/Boleta Electrónica N° 39102/i)).toBeInTheDocument();
    expect(screen.getByText(/Timbre Electrónico SII/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar PDF/i })).toBeInTheDocument();
  });
});
