// src/features/WaiterView/store/useWaiterStore.qty.test.js — acciones de qty del borrador (dynamic-add-remove)
// Verifica el contrato qty-controls/aggregation-semantics sobre orderDraft:
// increaseQty acumula en la línea existente (sin duplicados), decreaseQty remueve
// la línea al llegar a 0, removeItem borra la línea completa SIN emitir alert.fraud
// (D5: borrado de borrador ≠ anulación auditada). Store puro, sin DOM.
// RED-GREEN (waiter-order-draft-cart): las acciones aún no existen → tests fallan.

// API de Vitest importada explícitamente (ESLint no declara los globals).
import { beforeEach, describe, expect, it } from 'vitest';
// Store del garzón bajo prueba y su bus realtime (exportado para spy en D5).
import { useWaiterStore, waiterRealtimeBus } from './useWaiterStore.js';

// Línea de borrador genérica para sembrar estado conocido en cada test.
function makeLine(overrides = {}) {
  return {
    id: 'linea-test',
    productId: 'm2',
    name: 'Hamburguesa Clásica Brioche',
    price: 8900,
    qty: 1,
    allergens: [],
    course: 'entrada',
    sentToKitchen: false,
    ...overrides,
  };
}

describe('useWaiterStore qty: increaseQty (dynamic-add-remove sc.1, aggregation-semantics sc.2)', () => {
  beforeEach(() => {
    // Restablece el store a su estado inicial antes de cada test.
    useWaiterStore.getState().resetDemo();
  });

  it('increaseQty acumula UNA sola línea existente (no crea duplicados)', () => {
    // Siembra una línea de la hamburguesa real en el borrador.
    useWaiterStore.setState({ orderDraft: [makeLine()] });
    // Incrementa la misma línea por productId + course.
    useWaiterStore.getState().increaseQty('m2', 'entrada');
    const draft = useWaiterStore.getState().orderDraft;
    // La línea sigue siendo única y su qty subió exactamente en 1.
    expect(draft).toHaveLength(1);
    expect(draft[0].qty).toBe(2);
  });

  it('aumentar un producto ya agregado N veces mantiene una sola línea por curso', () => {
    // Siembra una línea ya tocada (qty 2).
    useWaiterStore.setState({ orderDraft: [makeLine({ qty: 2 })] });
    // Doble incremento sobre la misma línea.
    useWaiterStore.getState().increaseQty('m2', 'entrada');
    useWaiterStore.getState().increaseQty('m2', 'entrada');
    // Sin duplicados: una sola línea con qty 4.
    expect(useWaiterStore.getState().orderDraft).toHaveLength(1);
    expect(useWaiterStore.getState().orderDraft[0].qty).toBe(4);
  });

  it('mismo producto en courses distintos = 2 líneas independientes (aggregation-semantics sc.1)', () => {
    // Dos líneas del MISMO producto en cursos diferentes (entrada y fondo).
    useWaiterStore.setState({
      orderDraft: [makeLine({ id: 'l1', course: 'entrada' }), makeLine({ id: 'l2', course: 'fondo', qty: 2 })],
    });
    // Incrementa solo la línea del curso 'entrada'.
    useWaiterStore.getState().increaseQty('m2', 'entrada');
    const draft = useWaiterStore.getState().orderDraft;
    // Se conservan 2 líneas (una por curso) y solo la de entrada subió.
    expect(draft).toHaveLength(2);
    expect(draft.find((l) => l.course === 'entrada').qty).toBe(2);
    expect(draft.find((l) => l.course === 'fondo').qty).toBe(2);
  });
});

describe('useWaiterStore qty: decreaseQty (dynamic-add-remove sc.2)', () => {
  beforeEach(() => {
    useWaiterStore.getState().resetDemo();
  });

  it('decreaseQty decrementa la cantidad manteniendo la línea mientras sea > 0', () => {
    // Siembra una línea con qty 2.
    useWaiterStore.setState({ orderDraft: [makeLine({ qty: 2 })] });
    // Baja en 1 la cantidad de la línea.
    useWaiterStore.getState().decreaseQty('m2', 'entrada');
    const draft = useWaiterStore.getState().orderDraft;
    // La línea persiste con qty 1.
    expect(draft).toHaveLength(1);
    expect(draft[0].qty).toBe(1);
  });

  it('decreaseQty remueve la línea completa al llegar a 0', () => {
    // Siembra una línea con qty 1 (mínimo).
    useWaiterStore.setState({ orderDraft: [makeLine()] });
    // Baja 1 → la línea queda en 0 y debe desaparecer del borrador.
    useWaiterStore.getState().decreaseQty('m2', 'entrada');
    expect(useWaiterStore.getState().orderDraft).toHaveLength(0);
  });
});

describe('useWaiterStore qty: removeItem (dynamic-add-remove sc.3, D5)', () => {
  beforeEach(() => {
    useWaiterStore.getState().resetDemo();
  });

  it('removeItem elimina la línea completa sin importar su cantidad', () => {
    // Siembra una línea con cantidad alta (3) para probar borrado total.
    useWaiterStore.setState({ orderDraft: [makeLine({ qty: 3 }), makeLine({ id: 'otra', productId: 'm12', name: 'Ensalada', course: 'entrada' })] });
    // Elimina la línea de la hamburguesa (qty 3).
    useWaiterStore.getState().removeItem('m2', 'entrada');
    const draft = useWaiterStore.getState().orderDraft;
    // Solo queda la ensalada: la línea completa desapareció.
    expect(draft).toHaveLength(1);
    expect(draft[0].productId).toBe('m12');
  });

  it('removeItem NO emite alert.fraud aunque la línea ya fue enviada a cocina (D5)', () => {
    // Suscribe un capturador de eventos de anulación auditada al bus del store.
    const frauds = [];
    const off = waiterRealtimeBus.subscribe('alert.fraud', (payload) => frauds.push(payload));
    // Siembra una línea ENVIADA a cocina (el caso sensible de anulación con PIN).
    useWaiterStore.setState({ orderDraft: [makeLine({ sentToKitchen: true })] });
    // Borra la línea con removeItem (borrado de borrador, no anulación auditada).
    useWaiterStore.getState().removeItem('m2', 'entrada');
    // Cancela la suscripción del capturador.
    off();
    // NO debe haberse emitido ningún evento alert.fraud.
    expect(frauds).toHaveLength(0);
    // El borrador quedó vacío (el borrado sí ocurrió).
    expect(useWaiterStore.getState().orderDraft).toHaveLength(0);
  });
});