// src/features/WaiterView/store/waiterTableTransfer.test.js — unir y ceder mesa (waiter-table-transfer)
// Cubre la spec waiter-table-transfer S1–S5: `mergeBills(originId, targetId)` conserva TODAS las
// líneas con qty/price intactos y el total unido es exactamente la suma de los orígenes
// (invariante `checkConservation` reusado de splitService); `transferTable(tableId, waiterId)`
// saca la mesa del origen y la asigna al garzón destino; cancelar la confirmación NO muta ni
// publica; destinos inválidos (origen/inexistente) quedan bloqueados sin mutar estado.
// Todos los tests cumplen con las reglas obligatorias de AGENTS.md (comentarios en español).

// API de Vitest importada explícitamente (ESLint no declara los globals).
import { beforeEach, describe, expect, it, vi } from 'vitest';
// React para construir el elemento de WaiterPage sin JSX (archivo .js, no .jsx).
import React from 'react';
// Testing Library: renderizado de componentes de React, eventos y actualizaciones de estado.
import { fireEvent, render, screen } from '@testing-library/react';
// Store de Zustand del garzón (bajo prueba).
import { useWaiterStore } from './useWaiterStore.js';
// Página principal del garzón (para el escenario de cancelación en la UI).
import WaiterPage from '../pages/WaiterPage.jsx';
// Invariante de conservación de integridad reusado desde splitService (Decisiones 4).
import { checkConservation } from '../../ClientView/services/splitService.js';

// Fixture sintético: cuenta A (H. Clásica 2×8900 = 17800) y cuenta B (Pizza 1×10900 = 10900).
function seedBills() {
  // Tabla A ocupada con dos unidades de H. Clásica (líneas intactas: qty y price).
  const tableA = {
    id: 'A',
    number: 1,
    status: 'occupied',
    zone: 'Salón',
    waiterId: 'pedro-soto',
    order: {
      // Cuenta A: 2 × 8900 = 17800.
      items: [{ id: 'o1', name: 'H. Clásica', qty: 2, price: 8900 }],
    },
  };
  // Tabla B ocupada con una pizza (cuenta B: 1 × 10900 = 10900).
  const tableB = {
    id: 'B',
    number: 2,
    status: 'occupied',
    zone: 'Salón',
    waiterId: 'pedro-soto',
    order: {
      // Cuenta B: 1 × 10900 = 10900.
      items: [{ id: 'o2', name: 'Pizza', qty: 1, price: 10900 }],
    },
  };
  // Mesa libre sin cuenta (candidato NO válido para unir).
  const tableFree = { id: 'C', number: 3, status: 'free', zone: 'Salón', order: null };
  // Aplica el fixture sintético al store del garzón.
  useWaiterStore.setState({ tables: [tableA, tableB, tableFree], loading: false });
}

describe('waiter-table-transfer: Unir cuentas (mergeBills)', () => {
  beforeEach(() => {
    // Restablece el store a su estado inicial antes de cada test.
    useWaiterStore.getState().resetDemo();
  });

  it('S1: mergeBills conserva las líneas (qty/price intactos) y el total es la suma exacta', () => {
    // Prepara cuentas A (17800) y B (10900).
    seedBills();
    // Ejecuta la unión de A sobre B (confirmación explícita del mozo).
    const result = useWaiterStore.getState().mergeBills('A', 'B');
    // La operación debe reportar éxito.
    expect(result.ok).toBe(true);
    // El total unido es exactamente 17800 + 10900 = 28700 (invariante de conservación).
    expect(result.total).toBe(28700);

    // La cuenta unida vive en la mesa destino (B): contiene las líneas de A y B.
    const target = useWaiterStore.getState().tables.find((t) => t.id === 'B');
    // Ninguna línea se pierde: hay exactamente 2 líneas (H. Clásica + Pizza).
    expect(target.order.items).toHaveLength(2);
    // La línea de H. Clásica conserva qty 2 y price 8900 intactos.
    const clasic = target.order.items.find((i) => i.id === 'o1');
    expect(clasic).toMatchObject({ qty: 2, price: 8900 });
    // La línea de Pizza conserva qty 1 y price 10900 intactos.
    const pizza = target.order.items.find((i) => i.id === 'o2');
    expect(pizza).toMatchObject({ qty: 1, price: 10900 });
    // La mesa origen (A) queda liberada sin cuenta.
    const origin = useWaiterStore.getState().tables.find((t) => t.id === 'A');
    expect(origin.status).toBe('free');
    expect(origin.order).toBeNull();
  });

  it('S2: invariante de integridad con ítems repetidos (sin pérdidas ni duplicados)', () => {
    // Tabla A: 2×100 (x) + 1×50 (y) = 250; Tabla B: 1×100 (x) + 1×30 (z) = 130.
    useWaiterStore.setState({
      tables: [
        {
          id: 'A',
          number: 1,
          status: 'occupied',
          order: { items: [
            { id: 'x', name: 'X', qty: 2, price: 100 },
            { id: 'y', name: 'Y', qty: 1, price: 50 },
          ] },
        },
        {
          id: 'B',
          number: 2,
          status: 'occupied',
          order: { items: [
            { id: 'x', name: 'X', qty: 1, price: 100 },
            { id: 'z', name: 'Z', qty: 1, price: 30 },
          ] },
        },
      ],
    });
    // Ejecuta la unión de A sobre B.
    useWaiterStore.getState().mergeBills('A', 'B');
    // La cuenta unida contiene TODAS las líneas: 4 (x, y, x, z) sin perder ni duplicar.
    const target = useWaiterStore.getState().tables.find((t) => t.id === 'B');
    expect(target.order.items).toHaveLength(4);
    // Suma real de la cuenta unida: 2×100 + 50 + 1×100 + 30 = 380.
    const mergedTotal = target.order.items.reduce((s, i) => s + i.price * i.qty, 0);
    // El invariante de conservación se cumple reusando checkConservation (250 + 130 = 380).
    expect(checkConservation({ A: 250, B: 130 }, mergedTotal)).toBe(true);
  });

  it('S5a: destino inválido (origen === destino u origen inexistente) bloquea sin mutar', () => {
    // Prepara cuentas A y B.
    seedBills();
    // Snapshot del estado ANTES de intentar operaciones inválidas.
    const before = JSON.stringify(useWaiterStore.getState().tables);
    // Unir una mesa consigo misma: bloqueado.
    expect(useWaiterStore.getState().mergeBills('A', 'A').ok).toBe(false);
    // Unir desde una mesa inexistente: bloqueado.
    expect(useWaiterStore.getState().mergeBills('zz-inexistente', 'B').ok).toBe(false);
    // Unir hacia una mesa inexistente: bloqueado.
    expect(useWaiterStore.getState().mergeBills('A', 'zz-inexistente').ok).toBe(false);
    // Unir desde una mesa libre sin cuenta: bloqueado.
    expect(useWaiterStore.getState().mergeBills('C', 'A').ok).toBe(false);
    // El estado NO mutó en ningún caso inválido.
    expect(JSON.stringify(useWaiterStore.getState().tables)).toBe(before);
  });
});

describe('waiter-table-transfer: Ceder mesa (transferTable)', () => {
  beforeEach(() => {
    // Restablece el store a su estado inicial antes de cada test.
    useWaiterStore.getState().resetDemo();
    // Carga mesas con la asignación demo (waiterId del fixture).
    useWaiterStore.getState().loadTables();
  });

  it('S4: transferTable saca la mesa del origen y la asigna al garzón destino', async () => {
    // Espera la carga de mesas con la asignación demo.
    await vi.waitFor(() => expect(useWaiterStore.getState().loading).toBe(false));
    // La mesa t5 está en la grilla del origen antes de ceder.
    expect(useWaiterStore.getState().tables.some((t) => t.id === 't5')).toBe(true);
    // Ejecuta la cesión de t5 al garzón u3 (Camila Torres).
    const result = useWaiterStore.getState().transferTable('t5', 'u3');
    // La cesión confirmada reporta éxito.
    expect(result.ok).toBe(true);
    // La grilla del origen ya NO muestra t5 (desaparece del garzón origen).
    expect(useWaiterStore.getState().tables.some((t) => t.id === 't5')).toBe(false);
    // El estado destino la asigna a u3: el registro de transferencia lo refleja.
    const transfer = useWaiterStore.getState().transferredTables.find((t) => t.id === 't5');
    expect(transfer).toMatchObject({ id: 't5', waiterId: 'u3' });
  });

  it('S5b: destino inválido (origen mismo garzón / garzón inexistente / mesa inexistente) bloquea', async () => {
    // Espera la carga de mesas.
    await vi.waitFor(() => expect(useWaiterStore.getState().loading).toBe(false));
    // Snapshot del estado ANTES de intentar cesiones inválidas.
    const before = JSON.stringify(useWaiterStore.getState().tables);
    // Ceder al mismo garzón (auto-asignación): bloqueado.
    expect(useWaiterStore.getState().transferTable('t5', 'pedro-soto').ok).toBe(false);
    // Ceder a un garzón inexistente: bloqueado.
    expect(useWaiterStore.getState().transferTable('t5', 'zz-inexistente').ok).toBe(false);
    // Ceder una mesa inexistente: bloqueado.
    expect(useWaiterStore.getState().transferTable('zz-inexistente', 'u3').ok).toBe(false);
    // Ningún intento inválido mutó el estado de la grilla.
    expect(JSON.stringify(useWaiterStore.getState().tables)).toBe(before);
  });
});

describe('waiter-table-transfer: Cancelar la confirmación (UI)', () => {
  // Helper: crea un bus falso inyectable que captura los handlers por tópico.
  const createFakeBus = () => {
    // Registro de handlers: tópico → handler (para disparar eventos desde el test).
    const handlers = {};
    // Devuelve el bus falso con subscribe/publish espía y el registro capturado.
    return {
      handlers,
      bus: {
        // Suscribe el handler en el registro y devuelve un noop de limpieza.
        subscribe: vi.fn((topic, handler) => {
          handlers[topic] = handler;
          return () => {};
        }),
        // Espía del publish: verifica que NADA se publique al cancelar.
        publish: vi.fn(),
      },
    };
  };

  beforeEach(() => {
    // Restablece el store a su estado inicial antes de cada test.
    useWaiterStore.getState().resetDemo();
  });

  it('S3: cancelar el modal de confirmación de unir NO muta cuentas NI publica eventos', async () => {
    // Garantiza que las mesas estén cargadas de forma síncrona en el store.
    await useWaiterStore.getState().loadTables();
    // Bus falso inyectado por prop para observar (y negar) publicaciones al cancelar.
    const { bus } = createFakeBus();
    // Renderiza la PWA del garzón con el bus falso (createElement por ser archivo .js).
    render(React.createElement(WaiterPage, { bus }));
    // Espera la grilla de mesas asignadas.
    await screen.findByText(/Mis mesas/i, {}, { timeout: 3000 });
    // Selecciona la Mesa 1 (cuenta origen con H. Clásica).
    fireEvent.click(await screen.findByText(/Mesa 1/i, {}, { timeout: 3000 }));
    // Snapshot del estado de las mesas antes de abrir la confirmación.
    const before = JSON.stringify(useWaiterStore.getState().tables);
    // Abre el selector de unión de cuentas desde la mesa seleccionada.
    fireEvent.click(screen.getByRole('button', { name: /Unir cuenta/i }));
    // Elige como destino la Mesa 2 (Pizza Margherita, cuenta válida).
    fireEvent.click(await screen.findByRole('button', { name: /Unir con Mesa 2/i }, { timeout: 3000 }));
    // El modal de confirmación explícita aparece.
    expect(screen.getByText(/¿Unir cuentas/i)).toBeInTheDocument();
    // El mozo CANCELA la confirmación.
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    // Ninguna cuenta cambió tras cancelar (invariante de no mutación).
    expect(JSON.stringify(useWaiterStore.getState().tables)).toBe(before);
    // No se publicó ningún evento de unión al cancelar.
    expect(bus.publish).not.toHaveBeenCalledWith('table.bills_merged', expect.anything());
  }, 15000);
});
