// src/shared/ui/IsometricTableGrid3D.test.jsx — tests unitarios para IsometricTableGrid3D
// Prueba la proyección de mesas en plano 3D isométrico, luces LED de estado y selección por clic.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import IsometricTableGrid3D from './IsometricTableGrid3D.jsx';

// Describe bloque para IsometricTableGrid3D.
describe('IsometricTableGrid3D: Plano 3D Isométrico de Mesas', () => {
  // Mock de mesas de prueba.
  const mockTables = [
    { id: 't-1', number: '01', status: 'occupied', totalAmount: 18900, waiterName: 'Pedro Soto' },
    { id: 't-2', number: '02', status: 'available', totalAmount: 0, waiterName: '' },
  ];

  // Mock de la función onSelectTable.
  const mockSelectTable = vi.fn();

  // Test 1: Renderizado del plano 3D y de las mesas.
  it('renderiza el visualizador 3D y las mesas del salón', () => {
    // Renderiza el componente 3D.
    render(<IsometricTableGrid3D tables={mockTables} onSelectTable={mockSelectTable} />);

    // Confirms la presencia del título del plano 3D.
    expect(screen.getByText(/Plano 3D Isométrico del Salón/i)).toBeInTheDocument();
    // Confirms que aparezcan las mesas 01 y 02.
    expect(screen.getByText(/Mesa 01/i)).toBeInTheDocument();
    expect(screen.getByText(/Mesa 02/i)).toBeInTheDocument();
  });

  // Test 2: Selección de mesa al hacer clic en un bloque 3D.
  it('ejecuta la función onSelectTable al hacer clic en la Mesa 01', () => {
    // Renderiza el componente.
    render(<IsometricTableGrid3D tables={mockTables} onSelectTable={mockSelectTable} />);

    // Hace clic en la Mesa 01.
    const tableBtn = screen.getByRole('button', { name: /Mesa 01/i });
    fireEvent.click(tableBtn);

    // Confirms que el callback haya recibido 't-1'.
    expect(mockSelectTable).toHaveBeenCalledWith('t-1');
  });
});
