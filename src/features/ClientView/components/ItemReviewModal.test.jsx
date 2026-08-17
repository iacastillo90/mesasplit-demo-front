// src/features/ClientView/components/ItemReviewModal.test.jsx — tests unitarios para ItemReviewModal
// Prueba la selección de estrellas, etiquetas rápidas y el envío del formulario de reseña por plato.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente ItemReviewModal a probar.
import ItemReviewModal from './ItemReviewModal.jsx';

// Describe bloque de pruebas para ItemReviewModal.
describe('ItemReviewModal: Reseñas y feedback granular por plato', () => {
  // Mock de la función de callback onSubmitReview y onClose.
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  // Objeto de plato simulado.
  const dummyItem = {
    id: 'item-101',
    name: 'Lomo Lo Ovalle',
    description: 'Corte de lomo vetado a las brasas.',
    image: '/images/lomo.jpg',
  };

  // Test 1: Renderizado del plato a evaluar.
  it('renderiza el nombre del plato y el selector de 5 estrellas al estar abierto', () => {
    // Renderiza el modal abierto con el plato simulado.
    render(
      <ItemReviewModal
        open={true}
        onClose={mockOnClose}
        item={dummyItem}
        onSubmitReview={mockOnSubmit}
      />,
    );

    // Confirma que el título del modal contenga el nombre del plato.
    expect(screen.getByText(/⭐ Evaluar Plato: Lomo Lo Ovalle/i)).toBeInTheDocument();
    // Confirma que existan los botones de estrellas (5 estrellas).
    const starBtns = screen.getAllByRole('button', { name: '★' });
    expect(starBtns).toHaveLength(5);
  });

  // Test 2: Envío exitoso de la reseña.
  it('envía los datos de la reseña con las estrellas y etiquetas seleccionadas', () => {
    // Renderiza el modal abierto.
    render(
      <ItemReviewModal
        open={true}
        onClose={mockOnClose}
        item={dummyItem}
        onSubmitReview={mockOnSubmit}
      />,
    );

    // Selecciona una etiqueta de sabor ("Punto de sal 🧂").
    const tagBtn = screen.getByRole('button', { name: /Punto de sal/i });
    fireEvent.click(tagBtn);

    // Pulsa el botón de enviar calificación.
    const submitBtn = screen.getByRole('button', { name: /Enviar Calificación/i });
    fireEvent.click(submitBtn);

    // Confirma que onSubmit hayan recibido el payload correcto.
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 'item-101',
        itemName: 'Lomo Lo Ovalle',
        rating: 5,
        tags: expect.arrayContaining(['Punto de sal 🧂']),
      }),
    );
  });
});
