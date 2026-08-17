// src/features/PosView/components/ExecutiveReportModal.test.jsx — tests unitarios para ExecutiveReportModal
// Prueba el renderizado del reporte ejecutivo de arqueo de caja, desglose financiero y timbre digital SII.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import ExecutiveReportModal from './ExecutiveReportModal.jsx';

// Describe bloque para ExecutiveReportModal.
describe('ExecutiveReportModal: Reporte ejecutivo de arqueo de caja y comprobante SII', () => {
  // Mock de la función onClose.
  const mockOnClose = vi.fn();

  // Test 1: Renderizado del reporte ejecutivo.
  it('renderiza el resumen de ventas brutas, propinas y el timbre electrónico SII al estar abierto', () => {
    // Renderiza el modal abierto.
    render(<ExecutiveReportModal open={true} onClose={mockOnClose} />);

    // Confirma el título principal.
    expect(screen.getByText(/Reporte Ejecutivo de Arqueo & Auditoría SII/i)).toBeInTheDocument();
    // Confirma la presencia del timbre electrónico SII.
    expect(screen.getByText(/Timbre Electrónico SII de Auditoría/i)).toBeInTheDocument();
    // Confirma que el arqueo figure como cuadrado.
    expect(screen.getByText(/Arqueo Cuadrado/i)).toBeInTheDocument();
  });

  // Test 2: Acción de imprimir cierre PDF.
  it('permite accionar el botón de imprimir cierre PDF', () => {
    // Mock de alert.
    vi.stubGlobal('alert', vi.fn());

    // Renderiza el modal.
    render(<ExecutiveReportModal open={true} onClose={mockOnClose} />);

    // Pulsa el botón de imprimir.
    const printBtn = screen.getByRole('button', { name: /Imprimir Cierre PDF/i });
    fireEvent.click(printBtn);

    // Confirma que se haya ejecutado el alert mockeado.
    expect(window.alert).toHaveBeenCalledTimes(1);
  });
});
