// src/features/ClientView/pages/ClientCartPage.test.jsx — tests unitarios para ClientCartPage
// Prueba la renderización del carrito interactivo, comensales sentados y cálculo de totales con descuentos de lealtad.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
// Store del cliente.
import { useClientStore } from '../store/useClientStore.js';
// Componente a probar.
import ClientCartPage from './ClientCartPage.jsx';

// Describe bloque para ClientCartPage.
describe('ClientCartPage: Vista Dedicada del Carrito', () => {
  // Limpia el store antes de cada test.
  beforeEach(() => {
    useClientStore.setState({
      cart: [
        { id: 'm1', name: 'Lomo Lo Ovalle', price: 18900, qty: 1 },
        { id: 'm19', name: 'Pisco Sour Artesanal', price: 5900, qty: 2 },
      ],
      activeDiscountAmount: 5000,
    });
  });

  // Test 1: Renderizado de la comanda y comensales sentados.
  it('renderiza la comanda compartida con los ítems y los 4 comensales nombrados', () => {
    // Renderiza envolviendo en MemoryRouter.
    render(
      <MemoryRouter>
        <ClientCartPage />
      </MemoryRouter>,
    );

    // Confirma el título de la vista.
    expect(screen.getByText(/Mi Comanda Compartida/i)).toBeInTheDocument();
    // Confirms la presencia de los platos.
    expect(screen.getByText(/Lomo Lo Ovalle/i)).toBeInTheDocument();
    expect(screen.getByText(/Pisco Sour Artesanal/i)).toBeInTheDocument();

    // Confirms la presencia de comensales nombrados.
    expect(screen.getByText(/👤 Ignacio \(Tú\)/i)).toBeInTheDocument();
    expect(screen.getByText(/👤 Valentina/i)).toBeInTheDocument();
    expect(screen.getByText(/👤 Matías/i)).toBeInTheDocument();
    expect(screen.getByText(/👤 Camila/i)).toBeInTheDocument();
  });

  // Test 2: Descuento de lealtad aplicado.
  it('muestra el descuento de $5.000 de MesaSplit Rewards aplicado en el total', () => {
    // Renderiza el componente.
    render(
      <MemoryRouter>
        <ClientCartPage />
      </MemoryRouter>,
    );

    // Confirms el aviso del descuento.
    expect(screen.getByText(/Descuento MesaSplit Rewards:/i)).toBeInTheDocument();
    expect(screen.getByText(/-$5.000/i)).toBeInTheDocument();
  });
});
