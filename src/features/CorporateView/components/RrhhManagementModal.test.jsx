// src/features/CorporateView/components/RrhhManagementModal.test.jsx — Pruebas unitarias de RrhhManagementModal (fase12-cobertura-total-20-modulos-saas)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it, vi } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente a probar.
import RrhhManagementModal from './RrhhManagementModal.jsx';

describe('RrhhManagementModal — Gestión de Personal & Previred', () => {
  it('renderiza la lista de colaboradores cuando open es true', () => {
    // Renderiza el modal en estado abierto.
    render(<RrhhManagementModal open={true} onClose={vi.fn()} />);

    // Verifica que se muestre el título principal.
    expect(screen.getByText(/Módulo RRHH Completo, Asistencia & Previred/i)).toBeInTheDocument();
    // Verifica colaboradores de la dotación.
    expect(screen.getByText('Ignacio M.')).toBeInTheDocument();
    expect(screen.getByText('Valentina R.')).toBeInTheDocument();
  });

  it('permite gatillar la exportación de planilla Previred', () => {
    // Renderiza el modal.
    render(<RrhhManagementModal open={true} onClose={vi.fn()} />);

    // Encuentra el botón de exportación.
    const exportBtn = screen.getByText(/Exportar Planilla Previred/i);
    expect(exportBtn).toBeInTheDocument();

    // Haz clic en el botón de exportación.
    fireEvent.click(exportBtn);

    // Confirma la aparición de la notificación de éxito.
    expect(screen.getByText(/Planilla Previred exportada exitosamente/i)).toBeInTheDocument();
  });
});
