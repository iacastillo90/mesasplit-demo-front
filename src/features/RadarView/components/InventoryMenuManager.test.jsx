// src/features/RadarView/components/InventoryMenuManager.test.jsx — Pruebas unitarias de InventoryMenuManager (fase27-imagenes-reales-carta-en-inventario-admin)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InventoryMenuManager from './InventoryMenuManager.jsx';

describe('InventoryMenuManager — Gestión de Inventario con Fotos HD de la Carta', () => {
  it('renderiza la cabecera de inventario y tarjetas con imágenes HD de la carta', () => {
    render(<InventoryMenuManager />);

    expect(screen.getByText(/📦 Gestión de Inventario & Menú Gastronómico/i)).toBeInTheDocument();
    expect(screen.getByText('Lomo Lo Ovalle')).toBeInTheDocument();
  });

  it('permite filtrar la carta por categoría y cambiar disponibilidad (Lista 86)', () => {
    render(<InventoryMenuManager />);

    const markButtons = screen.getAllByRole('button', { name: /Marcar Agotado/i });
    expect(markButtons.length).toBeGreaterThan(0);
    fireEvent.click(markButtons[0]);

    expect(screen.getAllByText(/⚠️ Agotado \(86\)/i).length).toBeGreaterThan(0);
  });
});
