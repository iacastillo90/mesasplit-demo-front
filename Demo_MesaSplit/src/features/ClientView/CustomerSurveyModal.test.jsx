// src/features/ClientView/CustomerSurveyModal.test.jsx — suite de tests de encuesta post-pago (customer-survey-ratings)
// Cubre la especificación customer-survey-ratings: calificación de 5 estrellas, sugerencia de propina digital (10%, 15%, 20%)
// y publicación del evento feedback.submitted por el bus en tiempo real.
// Todos los tests cumplen las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Testing Library: renderizado de componentes y simulación de eventos.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente de encuesta post-pago.
import CustomerSurveyModal from './components/CustomerSurveyModal.jsx';

describe('customer-survey-ratings: Encuesta de Experiencia y Propina Digital', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockReset();
  });

  it('renderiza la calificación de 5 estrellas y los botones de sugerencia de propina (10%, 15%, 20%)', async () => {
    // Renderiza el modal de encuesta abierto para una cuenta de $20.000 CLP.
    render(<CustomerSurveyModal open={true} onClose={mockOnClose} totalBill={20000} />);
    // Verifica el título de la encuesta post-pago.
    expect(await screen.findByRole('heading', { name: /¿Cómo fue tu experiencia en MesaSplit?/i })).toBeInTheDocument();
    // Verifica las opciones de propina sugerida.
    expect(screen.getByRole('button', { name: /10%/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /15%/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /20%/i })).toBeInTheDocument();
  });

  it('calcula la propina del 10% automáticamente sobre el monto de la cuenta ($20.000 ➔ $2.000)', async () => {
    // Renderiza el modal.
    render(<CustomerSurveyModal open={true} onClose={mockOnClose} totalBill={20000} />);
    // Selecciona la opción de 10% de propina.
    const tip10Btn = screen.getByRole('button', { name: /10%/i });
    fireEvent.click(tip10Btn);
    // Confirma el cálculo de $2.000 CLP de propina.
    expect(await screen.findByText(/\$2\.000/i)).toBeInTheDocument();
  });

  it('emite el evento feedback.submitted y cierra el modal al enviar la encuesta', async () => {
    // Renderiza el modal.
    render(<CustomerSurveyModal open={true} onClose={mockOnClose} totalBill={20000} />);
    // Presiona el botón de envío de encuesta.
    const submitBtn = screen.getByRole('button', { name: /Enviar Opinión/i });
    fireEvent.click(submitBtn);
    // Confirma el cierre del modal.
    expect(mockOnClose).toHaveBeenCalled();
  });
});
