// src/features/WaiterView/components/OrderPad.qty.test.jsx — controles de cantidad en la comanda (qty-controls)
// Verifica los controles −/qty/+/✕ por línea del borrador, con el MISMO patrón
// visual y de accesibilidad que SharedCartDrawer del cliente (client-cart-consistency):
// "+" incrementa la qty visible, "−" decrementa (y en 0 remueve vía store), "✕"
// elimina la línea completa. OrderPad delega en los handlers del store por
// (productId, course) — agregación idéntica a la línea sembrada.
// RED-GREEN (waiter-order-draft-cart): los controles aún no existen → tests fallan.

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

// Props base con dobles de las acciones (el test aísla los controles de qty).
function baseProps(overrides = {}) {
  return {
    table: MESA,
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
    onIncreaseQty: vi.fn(),
    onDecreaseQty: vi.fn(),
    onRemoveItem: vi.fn(),
    ...overrides,
  };
}

// Línea sembrada de la comanda (la hamburguesa real m2 en curso entrada).
function seededLine(overrides = {}) {
  return {
    id: 'd1',
    productId: 'm2',
    name: 'Hamburguesa Clásica Brioche',
    price: 8900,
    qty: 1,
    allergens: [],
    course: 'entrada',
    sentToKitchen: true,
    ...overrides,
  };
}

describe('OrderPad qty-controls (waiter-order-draft-cart: qty-controls sc.1-3)', () => {
  it('sc.1: el "+" de la línea invoca onIncreaseQty con (productId, course)', () => {
    // Espía del handler de incremento del store.
    const onIncreaseQty = vi.fn();
    render(<OrderPad {...baseProps({ orderDraft: [seededLine()], onIncreaseQty })} />);
    // Toca el "+" de la línea de la hamburguesa.
    fireEvent.click(screen.getByRole('button', { name: 'Agregar uno a Hamburguesa Clásica Brioche' }));
    // Se delega el incremento con la agregación productId+course de la línea.
    expect(onIncreaseQty).toHaveBeenCalledWith('m2', 'entrada');
  });

  it('sc.2: el botón "−" de la línea invoca onDecreaseQty con (productId, course)', () => {
    // Espía del handler de decremento del store.
    const onDecreaseQty = vi.fn();
    render(<OrderPad {...baseProps({ orderDraft: [seededLine({ qty: 2 })], onDecreaseQty })} />);
    // Toca el "−" de la línea de la hamburguesa.
    fireEvent.click(screen.getByRole('button', { name: 'Quitar uno de Hamburguesa Clásica Brioche' }));
    // Se delega el decremento con la agregación productId+course de la línea.
    expect(onDecreaseQty).toHaveBeenCalledWith('m2', 'entrada');
  });

  it('sc.3: el botón "✕" de la línea invoca onRemoveItem con (productId, course)', () => {
    // Espía del handler de borrado total del store.
    const onRemoveItem = vi.fn();
    render(<OrderPad {...baseProps({ orderDraft: [seededLine({ qty: 3 })], onRemoveItem })} />);
    // Toca el "✕" de la línea de la hamburguesa.
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Hamburguesa Clásica Brioche del carrito' }));
    // Se delega el borrado completo con la agregación productId+course de la línea.
    expect(onRemoveItem).toHaveBeenCalledWith('m2', 'entrada');
  });

  it('sc.3: el "✕" no depende de la cantidad (borra aunque qty > 1)', () => {
    // Espía del handler de borrado total del store.
    const onRemoveItem = vi.fn();
    // Línea con qty alto (5) para probar que el borrado es total.
    render(<OrderPad {...baseProps({ orderDraft: [seededLine({ qty: 5 })], onRemoveItem })} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Hamburguesa Clásica Brioche del carrito' }));
    // El borrado se delega con la agregación productId+course, sin importar qty.
    expect(onRemoveItem).toHaveBeenCalledWith('m2', 'entrada');
    expect(onRemoveItem).toHaveBeenCalledTimes(1);
  });

  it('sc.2: la cantidad visible de la línea es el qty del borrador (patrón del cliente)', () => {
    // Renderiza con qty 2 para validar el valor visible del contador.
    render(<OrderPad {...baseProps({ orderDraft: [seededLine({ qty: 2 })] })} />);
    // La línea muestra el qty numérico en el centro de los controles (— 2 +).
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

describe('OrderPad qty-controls: paridad visual con SharedCartDrawer (client-cart-consistency sc.1)', () => {
  it('los controles −/qty/+/✕ conviven con la fila del detalle (eliminar con PIN intacto)', () => {
    // Renderiza con la línea sembrada enviada a cocina (flujo de anulación con PIN).
    render(<OrderPad {...baseProps({ orderDraft: [seededLine()] })} />);
    // Los tres controles de cantidad están presentes por sus aria-labels del cliente.
    expect(screen.getByRole('button', { name: 'Quitar uno de Hamburguesa Clásica Brioche' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar uno a Hamburguesa Clásica Brioche' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar Hamburguesa Clásica Brioche del carrito' })).toBeInTheDocument();
    // El botón de anulación auditada (PIN) sigue operativo en la misma fila.
    expect(screen.getByRole('button', { name: /Anular con PIN/i })).toBeInTheDocument();
  });
});