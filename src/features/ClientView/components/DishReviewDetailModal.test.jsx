// src/features/ClientView/components/DishReviewDetailModal.test.jsx — Pruebas unitarias de DishReviewDetailModal (fase21-resenas-interactivas-cards-modal-filtros)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

// API de Vitest para estructurar la suite y aserciones.
import { describe, expect, it } from 'vitest';
// Testing Library para renderizado y simulación de eventos.
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import DishReviewDetailModal from './DishReviewDetailModal.jsx';

describe('DishReviewDetailModal — Detalle Completo de Plato y Reseña', () => {
  const dummyReview = {
    id: 'r1',
    dish: 'Lomo Lo Ovalle',
    category: 'Cortes Premium',
    price: 14900,
    rating: 5,
    comment: 'Corte jugoso y papas crujientes. Excelente atención.',
    date: '17/08/2026 21:45 hrs',
    branchName: 'Restô Lo Ovalle',
    branchAddress: 'Av. Lo Ovalle 1420, San Miguel, Santiago',
    branchPhone: '+56 2 2891 4000',
    likes: 12,
    image: '/images/dish_lomo_lo_ovalle.png',
  };

  it('renderiza la foto HD, información del restaurante y desgloses de estrellas', () => {
    render(<DishReviewDetailModal isOpen={true} onClose={() => {}} reviewData={dummyReview} />);

    // Verifica que el nombre del plato y restaurante estén presentes.
    expect(screen.getByText('Lomo Lo Ovalle')).toBeInTheDocument();
    expect(screen.getByText('Restô Lo Ovalle')).toBeInTheDocument();
    expect(screen.getByText('📍 Av. Lo Ovalle 1420, San Miguel, Santiago')).toBeInTheDocument();
  });

  it('permite votar Útil a la reseña incrementando el contador', () => {
    render(<DishReviewDetailModal isOpen={true} onClose={() => {}} reviewData={dummyReview} />);

    const likeButton = screen.getByRole('button', { name: /Útil \(12\)/i });
    fireEvent.click(likeButton);

    expect(screen.getByText(/¡Gracias por tu Voto!/i)).toBeInTheDocument();
  });
});
