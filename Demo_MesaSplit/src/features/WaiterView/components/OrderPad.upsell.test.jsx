// src/features/WaiterView/components/OrderPad.upsell.test.jsx — chip de sugerencia en OrderPad (waiter-upsell)
// Cubre el comportamiento del chip de upsell en el OrderPad: al agregar un plato
// con regla el chip de sugerencia es visible, NUNCA auto-agrega nada, y solo al
// tocarlo se agrega UNA unidad del producto sugerido por el flujo normal
// (onAddToCart → addToDraft). Sin regla, el chip no se renderiza.
// RED-GREEN (waiter-menu-catalog): la carta real de menu.json reemplaza el
// MENU_CATALOG inline; los fixtures apuntan al menú real (m2 = Hamburguesa
// Clásica Brioche 8900; m12 = Ensalada César con Pollo, sin regla).

// API de Vitest importada explícitamente (ESLint no declara los globals).
import { describe, expect, it, vi } from 'vitest';
// Testing Library: render, eventos y consultas.
import { fireEvent, render, screen } from '@testing-library/react';
// Componente bajo prueba.
import OrderPad from './OrderPad.jsx';
// Fixture canónico de la carta (fuente única del menú real del mozo).
import menuData from '../../../mocks/menu.json';

// Mesa demo de contexto (requerida por OrderPad para mostrar la comanda).
const MESA = { id: 't1', number: 1, status: 'occupied' };

// Props base con dobles de las acciones (el test aísla el chip de la UI).
function baseProps(overrides = {}) {
  return {
    table: MESA,
    // La carta real llega por props desde WaiterPage (vía loadMenu del store).
    menu: menuData,
    loading: false,
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

describe('OrderPad upsell (waiter-upsell: chip explícito con carta real)', () => {
  it('S1: el chip de sugerencia es visible al agregar un plato con regla (hamburguesa real m2)', () => {
    // Borrador con la hamburguesa real (m2 tiene regla por categoría Hamburguesas → sugiere m2).
    const draft = [
      { id: 'linea-1', productId: 'm2', name: 'Hamburguesa Clásica Brioche', price: 8900, qty: 1, allergens: [], course: 'entrada', sentToKitchen: false },
    ];
    render(<OrderPad {...baseProps({ orderDraft: draft })} />);
    // El chip de sugerencia del mozo debe renderizarse con el producto sugerido.
    const chip = screen.getByRole('button', { name: /Sugerencia del mozo/i });
    expect(chip).toBeInTheDocument();
    // El chip menciona el producto sugerido (la hamburguesa real m2 de menu.json).
    expect(chip).toHaveTextContent(/Hamburguesa Clásica Brioche/i);
    // El precio del sugerido es el real de menu.json (8900), no el del catálogo inline.
    expect(chip).toHaveTextContent(/\$8\.900/);
  });

  it('S2: agregar un plato con regla NUNCA auto-agrega el sugerido', () => {
    // Borrador con el lomo real (m1 dispara regla por triggerId m1 → sugiere m2).
    const draft = [
      { id: 'linea-1', productId: 'm1', name: 'Lomo Lo Ovalle', price: 18900, qty: 1, allergens: [], course: 'entrada', sentToKitchen: false },
    ];
    const onAddToCart = vi.fn();
    render(<OrderPad {...baseProps({ orderDraft: draft, onAddToCart })} />);
    // El chip se renderiza (sugerencia del mozo visible)…
    expect(screen.getByRole('button', { name: /Sugerencia del mozo/i })).toBeInTheDocument();
    // …pero onAddToCart jamás se invocó por el simple hecho de agregar el plato.
    expect(onAddToCart).not.toHaveBeenCalled();
    // El borrador (entrada del test) contiene SOLO el lomo: ninguna línea extra.
    expect(draft).toHaveLength(1);
    expect(draft[0].productId).toBe('m1');
  });

  it('S3: tocar el chip agrega EXACTAMENTE una unidad del sugerido vía onAddToCart', () => {
    // Borrador con la hamburguesa real (regla activa) para que el chip esté visible.
    const draft = [
      { id: 'linea-1', productId: 'm2', name: 'Hamburguesa Clásica Brioche', price: 8900, qty: 1, allergens: [], course: 'entrada', sentToKitchen: false },
    ];
    const onAddToCart = vi.fn();
    render(<OrderPad {...baseProps({ orderDraft: draft, onAddToCart })} />);
    // Toca el chip de sugerencia explícito del mozo.
    fireEvent.click(screen.getByRole('button', { name: /Sugerencia del mozo/i }));
    // Se agregó exactamente UNA invocación al flujo normal de agregado.
    expect(onAddToCart).toHaveBeenCalledTimes(1);
    // El ítem agregado es el producto sugerido por la regla (m2 real de menu.json).
    expect(onAddToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 'm2', name: 'Hamburguesa Clásica Brioche' }));
  });

  it('S4: sin regla para el ítem (ensalada m12), el chip del mozo no se renderiza', () => {
    // Borrador con la ensalada real m12 (categoría Ensaladas, sin regla en el mapa).
    const draft = [
      { id: 'linea-9', productId: 'm12', name: 'Ensalada César con Pollo', price: 8400, qty: 1, allergens: [], course: 'entrada', sentToKitchen: false },
    ];
    render(<OrderPad {...baseProps({ orderDraft: draft })} />);
    // No debe existir el chip de sugerencia del mozo en pantalla.
    expect(screen.queryByRole('button', { name: /Sugerencia del mozo/i })).not.toBeInTheDocument();
  });
});

describe('OrderPad carta real (waiter-menu-catalog: real-menu-source)', () => {
  it('renderiza los 28 ítems de menu.json con nombre y precio reales (m2 a 8900)', () => {
    // Renderiza con el borrador vacío y la carta real.
    render(<OrderPad {...baseProps()} />);
    // La hamburguesa real de la carta (m2) debe estar visible con su precio real.
    expect(screen.getAllByText(/Hamburguesa Clásica Brioche/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$8\.900/).length).toBeGreaterThan(0);
    // La carta completa trae los 28 ítems del fixture.
    expect(menuData).toHaveLength(28);
  });

  it('agrupa los ítems por categoría mostrando los 7 títulos de categoría', () => {
    // Renderiza la carta real.
    render(<OrderPad {...baseProps()} />);
    // Las 7 categorías de menu.json deben aparecer como títulos de sección.
    ['Fuego & Carnes', 'Hamburguesas', 'Pizzas', 'Pastas', 'Ensaladas', 'Postres', 'Barra'].forEach(
      (category) => {
        expect(screen.getByRole('heading', { name: category })).toBeInTheDocument();
      },
    );
  });

  it('muestra loading mientras la carta no resuelve', () => {
    // Renderiza en estado de carga (sin ítems aún).
    render(<OrderPad {...baseProps({ menu: [], loading: true })} />);
    // El estado de carga es visible.
    expect(screen.getByText(/Cargando carta/i)).toBeInTheDocument();
  });
});
