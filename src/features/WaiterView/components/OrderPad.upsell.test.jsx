// src/features/WaiterView/components/OrderPad.upsell.test.jsx — chip de sugerencia en OrderPad (waiter-upsell)
// Cubre el comportamiento del chip de upsell en el OrderPad: al agregar un plato
// con regla el chip de sugerencia es visible, NUNCA auto-agrega nada, y solo al
// tocarlo se agrega UNA unidad del producto sugerido por el flujo normal
// (onAddToCart → addToDraft). Sin regla, el chip no se renderiza.

// API de Vitest importada explícitamente (ESLint no declara los globals).
import { describe, expect, it, vi } from 'vitest';
// Testing Library: render, eventos y consultas.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente bajo prueba.
import OrderPad from './OrderPad.jsx';

// Mesa demo de contexto (requerida por OrderPad para mostrar la comanda).
const MESA = { id: 't1', number: 1, status: 'occupied' };

// Props base con dobles de las acciones (el test aísla el chip de la UI).
function baseProps(overrides = {}) {
  return {
    table: MESA,
    orderDraft: [],
    selectedCourse: 'entrada',
    toastMessage: null,
    onAddToCart: vi.fn(),
    onToggleAllergy: vi.fn(),
    onSelectCourse: vi.fn(),
    onMarchFondo: vi.fn(),
    onVoidItem: vi.fn(),
    onReleaseTable: vi.fn(),
    ...overrides,
  };
}

describe('OrderPad upsell (waiter-upsell: chip explícito)', () => {
  it('S1: el chip de sugerencia es visible al agregar un plato con regla (hamburguesa)', () => {
    // Borrador con una hamburguesa recién agregada (m1 tiene regla → papas fritas).
    const draft = [
      { id: 'linea-1', productId: 'm1', name: 'Hamburguesa Clásica', price: 12500, qty: 1, allergens: [], course: 'entrada', sentToKitchen: false },
    ];
    render(<OrderPad {...baseProps({ orderDraft: draft })} />);
    // El chip de sugerencia del mozo debe renderizarse con el producto sugerido.
    const chip = screen.getByRole('button', { name: /Sugerencia del mozo/i });
    expect(chip).toBeInTheDocument();
    // El chip menciona el producto sugerido (papas fritas) de forma explícita.
    expect(chip).toHaveTextContent(/Papas fritas/i);
  });

  it('S2: agregar un plato con regla NUNCA auto-agrega el sugerido', () => {
    // Borrador SIN papas fritas (solo la hamburguesa recién agregada).
    const draft = [
      { id: 'linea-1', productId: 'm1', name: 'Hamburguesa Clásica', price: 12500, qty: 1, allergens: [], course: 'entrada', sentToKitchen: false },
    ];
    const onAddToCart = vi.fn();
    render(<OrderPad {...baseProps({ orderDraft: draft, onAddToCart })} />);
    // El chip se renderiza (sugerencia del mozo visible)…
    expect(screen.getByRole('button', { name: /Sugerencia del mozo/i })).toBeInTheDocument();
    // …pero onAddToCart jamás se invocó por el simple hecho de agregar la hamburguesa.
    expect(onAddToCart).not.toHaveBeenCalled();
    // El borrador (entrada del test) contiene SOLO la hamburguesa: ninguna línea extra.
    expect(draft).toHaveLength(1);
    expect(draft[0].productId).toBe('m1');
  });

  it('S3: tocar el chip agrega EXACTAMENTE una unidad del sugerido vía onAddToCart', () => {
    // Borrador con hamburguesa (regla activa) para que el chip esté visible.
    const draft = [
      { id: 'linea-1', productId: 'm1', name: 'Hamburguesa Clásica', price: 12500, qty: 1, allergens: [], course: 'entrada', sentToKitchen: false },
    ];
    const onAddToCart = vi.fn();
    render(<OrderPad {...baseProps({ orderDraft: draft, onAddToCart })} />);
    // Toca el chip de sugerencia explícito del mozo.
    fireEvent.click(screen.getByRole('button', { name: /Sugerencia del mozo/i }));
    // Se agregó exactamente UNA invocación al flujo normal de agregado.
    expect(onAddToCart).toHaveBeenCalledTimes(1);
    // El ítem agregado es el producto sugerido por la regla (papas fritas, m2).
    expect(onAddToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 'm2', name: 'Papas fritas' }));
  });

  it('S4: sin regla para el ítem, el chip del mozo no se renderiza', () => {
    // Borrador con ensalada (m5, sin regla en el mapa demo).
    const draft = [
      { id: 'linea-9', productId: 'm5', name: 'Ensalada César', price: 7400, qty: 1, allergens: [], course: 'entrada', sentToKitchen: false },
    ];
    render(<OrderPad {...baseProps({ orderDraft: draft })} />);
    // No debe existir el chip de sugerencia del mozo en pantalla.
    expect(screen.queryByRole('button', { name: /Sugerencia del mozo/i })).not.toBeInTheDocument();
  });
});
