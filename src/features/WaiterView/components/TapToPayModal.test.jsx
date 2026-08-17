// src/features/WaiterView/components/TapToPayModal.test.jsx — tests unitarios para TapToPayModal
// Prueba el renderizado del cobro Tap-to-Pay, selección de billeteras y simulación de lectura NFC.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
// Componente a probar.
import TapToPayModal from './TapToPayModal.jsx';

// Describe bloque para TapToPayModal.
describe('TapToPayModal: Cobro contactless NFC y billeteras digitales', () => {
  // Mock de onClose.
  const mockOnClose = vi.fn();

  // Test 1: Renderizado del modal y del monto total a cobrar.
  it('renderiza el monto total a cobrar y los métodos de pago contactless al estar abierto', () => {
    // Renderiza el modal abierto.
    render(<TapToPayModal open={true} onClose={mockOnClose} totalAmount={35000} tableNumber="02" />);

    // Confirms el título del modal.
    expect(screen.getByText(/Cobro Tap-to-Pay \(NFC\) — Mesa 02/i)).toBeInTheDocument();
    // Confirma el monto formateado en CLP.
    expect(screen.getByText(/\$35\.000/i)).toBeInTheDocument();
    // Confirma la presencia de la opción Apple Pay.
    expect(screen.getByText(/Apple Pay/i)).toBeInTheDocument();
  });

  // Test 2: Simulación de lectura NFC exitosa.
  it('simula la lectura NFC y muestra el mensaje de pago aprobado', async () => {
    // Usa timers simulados de Vitest.
    vi.useFakeTimers();

    // Renderiza el modal.
    render(<TapToPayModal open={true} onClose={mockOnClose} />);

    // Presiona el botón de simulación NFC.
    const tapBtn = screen.getByRole('button', { name: /⚡ Simular Lectura NFC Contactless/i });
    fireEvent.click(tapBtn);

    // Avanza el tiempo 1.5 segundos.
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Confirma la aparición del mensaje de pago aprobado.
    expect(screen.getByText(/¡Pago Contactless Aprobado!/i)).toBeInTheDocument();

    // Restaura los timers reales.
    vi.useRealTimers();
  });
});
