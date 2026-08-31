// src/features/CorporateView/components/PlanPricingMatrixModal.test.jsx — Pruebas unitarias de PlanPricingMatrixModal (fase13-matriz-planes-saas)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it, vi } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente a probar.
import PlanPricingMatrixModal from './PlanPricingMatrixModal.jsx';

describe('PlanPricingMatrixModal — Matriz de Planes & Tarifas SaaS', () => {
  it('renderiza los 3 planes de suscripción cuando open es true', () => {
    // Renderiza el modal en estado abierto.
    render(<PlanPricingMatrixModal open={true} onClose={vi.fn()} />);

    // Verifica que se muestren los 3 planes principales.
    expect(screen.getByText('Plan Básico')).toBeInTheDocument();
    expect(screen.getByText('Plan Avanzado')).toBeInTheDocument();
    expect(screen.getByText('Plan Corporativo')).toBeInTheDocument();
  });

  it('permite cambiar la selección de plan y notifica al usuario', () => {
    // Renderiza el modal.
    render(<PlanPricingMatrixModal open={true} onClose={vi.fn()} />);

    // Busca el botón de selección del Plan Básico.
    const selectBtn = screen.getByRole('button', { name: /Seleccionar Plan Básico/i });
    expect(selectBtn).toBeInTheDocument();

    // Simula hacer clic en seleccionar.
    fireEvent.click(selectBtn);

    // Confirma la aparición del mensaje de notificación.
    expect(screen.getByText(/Has seleccionado el Plan Básico/i)).toBeInTheDocument();
  });
});
