// src/shared/ui/ThermalPrinterConfigModal.test.jsx — Pruebas unitarias de ThermalPrinterConfigModal (fase12-cobertura-total-20-modulos-saas)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it, vi } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente a probar.
import ThermalPrinterConfigModal from './ThermalPrinterConfigModal.jsx';

describe('ThermalPrinterConfigModal — Gestión de Impresoras ESC/POS Cloud', () => {
  it('renderiza la lista de impresoras térmicas configuradas cuando open es true', () => {
    // Renderiza el modal en estado abierto.
    render(<ThermalPrinterConfigModal open={true} onClose={vi.fn()} />);

    // Verifica que se muestre el título principal.
    expect(screen.getByText('Impresoras Térmicas Cloud ESC/POS')).toBeInTheDocument();
    // Verifica la presencia de impresoras clave.
    expect(screen.getByText('Impresora Cocina Principal')).toBeInTheDocument();
    expect(screen.getByText('Impresora Barra & Bebidas')).toBeInTheDocument();
  });

  it('permite gatillar la simulación de prueba ESC/POS', async () => {
    // Renderiza el modal.
    render(<ThermalPrinterConfigModal open={true} onClose={vi.fn()} />);

    // Busca los botones de prueba ESC/POS.
    const printButtons = screen.getAllByText('Probar ESC/POS');
    expect(printButtons.length).toBeGreaterThan(0);

    // Haz clic en el primer botón de prueba.
    fireEvent.click(printButtons[0]);

    // Verifica que aparezca la vista previa de la comanda térmica.
    expect(await screen.findByText(/VISTA PREVIA COMANDA TÉRMICA/i)).toBeInTheDocument();
  });
});
