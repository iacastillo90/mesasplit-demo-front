// src/features/ClientView/components/ClientPageHero.test.jsx — tests unitarios para ClientPageHero
// Prueba el renderizado del banner promocional y la acción del botón del plato estrella.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import ClientPageHero from './ClientPageHero.jsx';

// Describe bloque para ClientPageHero.
describe('ClientPageHero: Banner promocional de la Mesa Virtual', () => {
  // Mock de la función onSelectStarDish.
  const mockSelectStar = vi.fn();

  // Test 1: Renderizado del banner y plato estrella.
  it('renderiza el título del plato estrella y la recomendación del chef', () => {
    // Renderiza el componente.
    render(<ClientPageHero onSelectStarDish={mockSelectStar} />);

    // Confirma la presencia del título del plato estrella.
    expect(screen.getByText(/Lomo Lo Ovalle & Pisco Sour Artesanal/i)).toBeInTheDocument();
    // Confirma el badge de recomendación del chef.
    expect(screen.getByText(/Recomendación Chef Providencia/i)).toBeInTheDocument();
  });

  // Test 2: Acción del botón Pedir Plato Estrella.
  it('ejecuta onSelectStarDish al presionar el botón Pedir Plato Estrella', () => {
    // Renderiza el componente.
    render(<ClientPageHero onSelectStarDish={mockSelectStar} />);

    // Hace clic en el botón.
    const starBtn = screen.getByRole('button', { name: /Pedir Plato Estrella/i });
    fireEvent.click(starBtn);

    // Confirms que el callback haya sido llamado.
    expect(mockSelectStar).toHaveBeenCalledTimes(1);
  });
});
