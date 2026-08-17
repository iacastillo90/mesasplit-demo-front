// src/features/CorporateView/components/FranchiseComparisonWidget.test.jsx — tests unitarios para FranchiseComparisonWidget
// Prueba el renderizado del widget comparativo multi-local y el filtrado por métricas.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import FranchiseComparisonWidget from './FranchiseComparisonWidget.jsx';

// Describe bloque para FranchiseComparisonWidget.
describe('FranchiseComparisonWidget: Comparativo multi-local en tiempo real', () => {
  // Test 1: Renderizado del widget y las 3 sucursales.
  it('renderiza el widget comparativo con las 3 sucursales de la franquicia', () => {
    // Renderiza el widget.
    render(<FranchiseComparisonWidget />);

    // Confirma el título principal.
    expect(screen.getByText(/Comparativo Multi-Local en Tiempo Real/i)).toBeInTheDocument();
    // Confirma que aparezcan Providencia, Santiago Centro y Vitacura.
    expect(screen.getByText(/Providencia — Terraza/i)).toBeInTheDocument();
    expect(screen.getByText(/Santiago Centro — Histórico/i)).toBeInTheDocument();
    expect(screen.getByText(/Vitacura — Gourmet/i)).toBeInTheDocument();
  });

  // Test 2: Cambio de orden por métrica Ticket Promedio.
  it('permite cambiar el filtro activo a Ticket Promedio', () => {
    // Renderiza el widget.
    render(<FranchiseComparisonWidget />);

    // Hace clic en el filtro Ticket Prom.
    const ticketFilterBtn = screen.getByRole('button', { name: /Ticket Prom\./i });
    fireEvent.click(ticketFilterBtn);

    // Confirma que el botón esté activo.
    expect(ticketFilterBtn).toHaveClass('bg-brand-500');
  });
});
