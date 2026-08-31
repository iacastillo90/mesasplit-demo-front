// src/features/ClientView/components/ClientSupportChatModal.test.jsx — Pruebas unitarias de ClientSupportChatModal (fase19-perfil-interactivo-y-chat-soporte-whatsapp)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import ClientSupportChatModal from './ClientSupportChatModal.jsx';

describe('ClientSupportChatModal — Chat de Soporte Técnico Estilo WhatsApp', () => {
  it('renderiza las 4 opciones predefinidas de consulta al cliente', () => {
    render(<ClientSupportChatModal isOpen={true} onClose={() => {}} />);

    // Verifica que estén las 4 opciones predefinidas.
    expect(screen.getByRole('button', { name: /¿Cómo divido la cuenta en la mesa\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /¿Dónde descargo mi Boleta Electrónica SII\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /¿Cómo canjeo mis Puntos MesaSplit Rewards\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hablar directamente con un ejecutivo humano/i })).toBeInTheDocument();
  });

  it('permite hacer clic en una opción predefinida y responde en el chat', () => {
    render(<ClientSupportChatModal isOpen={true} onClose={() => {}} />);

    const optButton = screen.getByRole('button', { name: /¿Cómo divido la cuenta en la mesa\?/i });
    fireEvent.click(optButton);

    // Verifica que la respuesta aparezca en la conversación.
    expect(screen.getByText(/¡Es súper fácil! 🍽️ Abrí el botón "Comanda & Carrito"/i)).toBeInTheDocument();
  });
});
