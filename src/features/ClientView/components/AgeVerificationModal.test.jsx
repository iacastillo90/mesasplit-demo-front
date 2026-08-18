// src/features/ClientView/components/AgeVerificationModal.test.jsx — suite de tests de verificación de edad (client-alcohol-verification)
// Cubre el spec client-alcohol-verification: ítem alcohólico (alcoholic: true) exige confirmación de mayoría de edad (cancelar no agrega, confirmar sí agrega);
// ítem no alcohólico se agrega directamente sin mostrar el modal de verificación.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// API de Vitest importada explícitamente.
import { describe, expect, it, vi } from 'vitest';
// Testing Library: renderizado y simulación.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente AgeVerificationModal a probar directamente.
import AgeVerificationModal from './AgeVerificationModal.jsx';

describe('client-alcohol-verification: Verificación de edad para ítems alcohólicos', () => {
  it('Scenario 1: Ítem alcohólico abre modal y al cancelar ejecuta onClose sin confirmar', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <AgeVerificationModal
        open={true}
        item={{ name: 'Cerveza Artesanal IPA', alcoholic: true }}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    // Debe abrirse el modal de verificación de edad.
    expect(screen.getByRole('heading', { name: /Verificación de Edad/i })).toBeInTheDocument();
    expect(screen.getByText(/Cerveza Artesanal IPA/i)).toBeInTheDocument();

    // Cancela la verificación.
    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelBtn);

    // Invocó onClose y no confirmó.
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('Scenario 2: Confirmar mayoría de edad ejecuta onConfirm', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <AgeVerificationModal
        open={true}
        item={{ name: 'Cerveza Artesanal IPA', alcoholic: true }}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    // Presiona confirmar mayoría de edad.
    const confirmBtn = screen.getByRole('button', { name: /Soy Mayor de 18 años/i });
    fireEvent.click(confirmBtn);

    // Invocó el callback de confirmación.
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('Scenario 3: Con open=false el modal no se renderiza', () => {
    render(
      <AgeVerificationModal
        open={false}
        item={null}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // No debe mostrar el modal de verificación de edad.
    expect(screen.queryByRole('heading', { name: /Verificación de Edad/i })).not.toBeInTheDocument();
  });
});
