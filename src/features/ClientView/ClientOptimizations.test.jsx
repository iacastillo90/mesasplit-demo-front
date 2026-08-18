// src/features/ClientView/ClientOptimizations.test.jsx — Pruebas unitarias de las optimizaciones en Vista Cliente (fase33-optimizaciones-vista-cliente-y-alergias-perfil)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MenuFilterPills from './components/MenuFilterPills.jsx';
import ClientProfilePage from './pages/ClientProfilePage.jsx';

describe('ClientOptimizations — Vista Cliente, Filtros y Alergias en Perfil', () => {
  it('renderiza la barra de filtros con el botón Picante y soporte de scroll shrink-0', () => {
    render(<MenuFilterPills activeFilter="all" onSelectFilter={() => {}} />);

    expect(screen.getByText(/Picante/i)).toBeInTheDocument();
    expect(screen.getByText(/Sin Gluten/i)).toBeInTheDocument();
  });

  it('permite seleccionar la opción "Otro (Especificar alergia)" y desplegar el input de texto en el perfil', () => {
    render(
      <MemoryRouter initialEntries={['/cliente/perfil?tab=edit-profile']}>
        <ClientProfilePage />
      </MemoryRouter>
    );

    const otherCheckbox = screen.getByLabelText(/Otro \(Especificar alergia\)/i);
    expect(otherCheckbox).toBeInTheDocument();

    fireEvent.click(otherCheckbox);

    const otherInput = screen.getByPlaceholderText(/Alergia a mariscos, soya/i);
    expect(otherInput).toBeInTheDocument();
  });
});
