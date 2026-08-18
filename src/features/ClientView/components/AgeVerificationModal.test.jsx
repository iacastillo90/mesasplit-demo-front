// src/features/ClientView/components/AgeVerificationModal.test.jsx — suite de tests de verificación de edad (client-alcohol-verification)
// Cubre el spec client-alcohol-verification: ítem alcohólico (alcoholic: true) exige confirmación de mayoría de edad (cancelar no agrega, confirmar sí agrega);
// ítem no alcohólico se agrega directamente sin mostrar el modal de verificación.
// Cumple strictly con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado y simulación.
import { fireEvent, render, screen } from '@testing-library/react';
// MemoryRouter para soportar navegaciones en tests.
import { MemoryRouter } from 'react-router-dom';
// Store de ClientView.
import { useClientStore } from '../store/useClientStore.js';
// Página principal de ClientView para prueba de flujo completo.
import ClientPage from '../pages/ClientPage.jsx';

describe('client-alcohol-verification: Verificación de edad para ítems alcohólicos', () => {
  beforeEach(() => {
    // Restablece el store antes de cada prueba y reemplaza loadClientData por un noop.
    useClientStore.getState().resetDemo();
    useClientStore.setState({ loadClientData: () => {} });
  });

  it('Scenario 1: Ítem alcohólico abre modal y al cancelar el modal se cierra sin agregar al carrito', async () => {
    // Inyecta fixture de menú con cerveza alcohólica.
    useClientStore.setState({
      menu: [{ id: 'm7', name: 'Cerveza Artesanal IPA', price: 4500, category: 'Bebidas', allergens: [], alcoholic: true }],
      loading: false,
    });

    render(<MemoryRouter><ClientPage /></MemoryRouter>);
    const beerCard = await screen.findByText(/Cerveza Artesanal IPA/i);
    const beerAddBtn = beerCard.closest('article').querySelector('button');
    fireEvent.click(beerAddBtn);

    // Debe abrirse el modal de verificación de edad.
    expect(await screen.findByRole('heading', { name: /Verificación de Edad/i })).toBeInTheDocument();

    // Cancela la verificación.
    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelBtn);

    // El modal se cierra.
    expect(screen.queryByRole('heading', { name: /Verificación de Edad/i })).not.toBeInTheDocument();
    // El carrito permanece vacío.
    expect(useClientStore.getState().cart.length).toBe(0);
  });

  it('Scenario 2: Confirmar mayoría de edad agrega el ítem alcohólico al carrito', async () => {
    useClientStore.setState({
      menu: [{ id: 'm7', name: 'Cerveza Artesanal IPA', price: 4500, category: 'Bebidas', allergens: [], alcoholic: true }],
      loading: false,
    });

    render(<MemoryRouter><ClientPage /></MemoryRouter>);
    const beerCard = await screen.findByText(/Cerveza Artesanal IPA/i);
    const beerAddBtn = beerCard.closest('article').querySelector('button');
    fireEvent.click(beerAddBtn);

    // Modal abierto.
    expect(await screen.findByRole('heading', { name: /Verificación de Edad/i })).toBeInTheDocument();

    // Presiona confirmar mayoría de edad.
    const confirmBtn = screen.getByRole('button', { name: /Soy Mayor de 18 años/i });
    fireEvent.click(confirmBtn);

    // El ítem se agrega al carrito del store.
    expect(useClientStore.getState().cart.length).toBe(1);
    expect(useClientStore.getState().cart[0].name).toMatch(/Cerveza Artesanal IPA/i);
  });

  it('Scenario 3: Ítem no alcohólico se agrega directamente al carrito sin gate', async () => {
    useClientStore.setState({
      menu: [{ id: 'm1', name: 'Hamburguesa Clásica', price: 8900, category: 'Hamburguesas', allergens: [], alcoholic: false }],
      loading: false,
    });

    render(<MemoryRouter><ClientPage /></MemoryRouter>);
    const burgerCard = await screen.findByText(/Hamburguesa Clásica/i);
    const burgerAddBtn = burgerCard.closest('article').querySelector('button');
    fireEvent.click(burgerAddBtn);

    // No debe mostrar el modal de verificación de edad.
    expect(screen.queryByRole('heading', { name: /Verificación de Edad/i })).not.toBeInTheDocument();
    // El ítem se agregó directamente.
    expect(useClientStore.getState().cart.length).toBe(1);
  });
});
