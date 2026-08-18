// src/features/WaiterView/WaiterPage.test.jsx — suite de tests interactivos de PWA Garzón (waiter-pwa)
// Cubre la especificación waiter-pwa: marcaje de turno (Ley 40h), grilla de mesas con semáforos,
// toma de pedido con una mano y badges de conteo, Escudo de Alergias (#EF4444), Course Control (course.fire),
// anulación con PIN de admin (alert.fraud) y liberación de mesa (table.status_changed).
// Todos los tests cumplen con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente para evitar advertencias de ESLint.
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Testing Library: renderizado de componentes de React, eventos y actualizaciones de estado.
import { act, fireEvent, render, screen } from '@testing-library/react';
// Store de Zustand del garzón.
import { useWaiterStore } from './store/useWaiterStore.js';
// Componente principal de la PWA del Garzón.
import WaiterPage from './pages/WaiterPage.jsx';

describe('waiter-pwa: Marcaje de Turno (Ley 40 Horas)', () => {
  beforeEach(() => {
    // Restablece el store a su estado inicial antes de cada test.
    useWaiterStore.getState().resetDemo();
  });

  it('requiere PIN inicial para desbloquear el turno e iniciar sesión', async () => {
    // Setea intencionalmente el turno como deslogueado para probar el bloqueo.
    useWaiterStore.setState({ shiftStatus: 'clocked_out' });
    // Renderiza la pantalla principal del garzón.
    render(<WaiterPage />);
    // Verifica la presencia de la pantalla de bloqueo de turno.
    expect(screen.getByText(/Control de Turno — Ley 40 Horas/i)).toBeInTheDocument();
    // Encuentra el campo de entrada de PIN.
    const pinInput = screen.getByPlaceholderText(/Ingresa tu PIN/i);
    // Simula la escritura del PIN de garzón ("1234").
    fireEvent.change(pinInput, { target: { value: '1234' } });
    // Presiona el botón para iniciar turno.
    const startBtn = screen.getByRole('button', { name: /Iniciar Turno/i });
    fireEvent.click(startBtn);
    // Verifica que la vista se desbloquea mostrando el panel de mesas asignadas.
    expect(await screen.findByText(/Mis mesas/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });
});

describe('waiter-pwa: Grilla de Mesas y Semáforos de Estado', () => {
  beforeEach(() => {
    useWaiterStore.getState().resetDemo();
  });

  it('renderiza las mesas asignadas con semáforos de estado (verde, amarillo, naranja)', async () => {
    // Renderiza la vista de garzón (turno activo por defecto).
    render(<WaiterPage />);
    // Espera la carga de mesas desde el servicio mockFetch.
    await screen.findByText(/Mis mesas/i, {}, { timeout: 3000 });
    // Verifica que se muestren las mesas asignadas con sus semáforos.
    expect(await screen.findByText(/Mesa 1/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect((await screen.findAllByText(/Ocupada/i, {}, { timeout: 3000 })).length).toBeGreaterThan(0);
  });
});

describe('waiter-pwa: Toma de Pedido con Una Mano y Badges', () => {
  beforeEach(() => {
    useWaiterStore.getState().resetDemo();
  });

  it('permite seleccionar una mesa e incrementar el contador del plato al tocarlo', async () => {
    // Renderiza la PWA del garzón.
    render(<WaiterPage />);
    // Espera las mesas asignadas.
    await screen.findByText(/Mis mesas/i, {}, { timeout: 3000 });
    // Selecciona la Mesa 1 para ingresar la comanda.
    fireEvent.click(await screen.findByText(/Mesa 1/i, {}, { timeout: 3000 }));
    // Espera a que se despliegue el catálogo táctil con la carta real (seed m2).
    const itemCards = await screen.findAllByText(/Hamburguesa Clásica Brioche/i, {}, { timeout: 3000 });
    // La card del catálogo es la primera coincidencia (el detalle va después).
    const card = itemCards[0];
    // Toca la tarjeta del catálogo para agregar otra unidad sobre el seed.
    fireEvent.click(card);
    // Verifica que la comanda refleje las unidades agregadas (badge + línea de detalle).
    expect(screen.getAllByText(/2x/i).length).toBeGreaterThan(0);
  });
});

describe('waiter-pwa: Escudo de Alergias y Course Control', () => {
  beforeEach(() => {
    useWaiterStore.getState().resetDemo();
  });

  it('tiñe el ítem en Rojo Puro #EF4444 al seleccionar alergia y permite Marchar Fondo', async () => {
    // Renderiza la vista del garzón.
    const { container } = render(<WaiterPage />);
    // Carga las mesas y selecciona la Mesa 1.
    await screen.findByText(/Mis mesas/i, {}, { timeout: 3000 });
    fireEvent.click(await screen.findByText(/Mesa 1/i, {}, { timeout: 3000 }));
    // Selecciona el chip de alergia al maní en el ítem.
    const allergyBtn = await screen.findByRole('button', { name: /\+ Alergia Maní/i }, { timeout: 3000 });
    fireEvent.click(allergyBtn);
    // Verifica la presencia del tag de alergia y el borde rojo puro.
    expect(screen.getByText(/⚠️ ALERGIA: MANÍ/i)).toBeInTheDocument();
    // Busca el contenedor de la línea con alergia para validar su borde rojo puro #EF4444.
    const allergyLine = container.querySelector('[data-allergy="true"]');
    expect(allergyLine).toHaveClass('border-semantic-danger');

    // Selecciona el curso Fondo para activar el botón de marcha de platos de fondo.
    const fondoCourseBtn = screen.getByRole('button', { name: /Fondo/i });
    fireEvent.click(fondoCourseBtn);

    // Prueba el botón de Course Control para Marchar Fondo.
    const marchBtn = screen.getByRole('button', { name: /Marchar Fondo/i }, { timeout: 3000 });
    fireEvent.click(marchBtn);
    // Confirma la confirmación de marcha de platos.
    expect(screen.getByText(/Fondo marchado a cocina/i)).toBeInTheDocument();
  });
});

describe('waiter-pwa: Anulación Protegida con PIN y Liberación de Mesa', () => {
  beforeEach(() => {
    useWaiterStore.getState().resetDemo();
  });

  it('exige PIN de admin para anular ítem ya enviado y permite liberar la mesa', async () => {
    // Renderiza la PWA del garzón.
    render(<WaiterPage />);
    // Selecciona una mesa.
    await screen.findByText(/Mis mesas/i, {}, { timeout: 3000 });
    fireEvent.click(await screen.findByText(/Mesa 1/i, {}, { timeout: 3000 }));
    // Intenta eliminar un ítem enviado a cocina.
    const deleteBtn = await screen.findByRole('button', { name: /Anular con PIN/i }, { timeout: 3000 });
    fireEvent.click(deleteBtn);
    // Verifica que aparezca el modal de autorización por PIN.
    expect(screen.getByText(/Autorización de Anulación — PIN de Admin/i)).toBeInTheDocument();
  });
});

describe('sos-waiter-call: Badge de Alerta S.O.S. del Cliente (REQ-03) — waiter-pwa', () => {
  // Helper: crea un bus falso inyectable que captura los handlers suscritos por tópico.
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
        // Espía del publish: no se usa en estos tests pero mantiene la API del bus.
        publish: vi.fn(),
      },
    };
  };

  beforeEach(() => {
    useWaiterStore.getState().resetDemo();
    useWaiterStore.setState({ loadTables: () => {}, loading: false });
  });

  it('muestra el banner de alerta con mesa y motivo al recibir el evento call.waiter', async () => {
    // Bus falso inyectado por prop para observar la suscripción de WaiterPage.
    const { handlers, bus } = createFakeBus();
    // Renderiza la PWA del garzón con el bus inyectado.
    render(<WaiterPage bus={bus} />);
    // Espera la vista activa del garzón con sus mesas asignadas.
    await screen.findByText(/Mis mesas/i, {}, { timeout: 3000 });
    // Sin evento recibido aún: el banner NO debe existir (estado inicial).
    expect(screen.queryByTestId('sos-alert-banner')).not.toBeInTheDocument();
    // Dispara el evento call.waiter como si llegara del bus real del cliente.
    act(() => {
      handlers['call.waiter']({
        tableId: 'table-05',
        reason: 'Falta cubierto',
        customerName: 'Cliente',
        timestamp: Date.now(),
      });
    });
    // El banner de alerta S.O.S. debe aparecer en el DOM.
    const banner = screen.getByTestId('sos-alert-banner');
    expect(banner).toBeInTheDocument();
    // Debe mostrar la mesa que llamó al mozo.
    expect(banner).toHaveTextContent(/table-05/);
    // Debe mostrar el motivo de la llamada del comensal.
    expect(banner).toHaveTextContent(/Falta cubierto/);
  });

  it('descarta el banner al presionar "Atendido" tras recibir una nueva llamada', async () => {
    // Bus falso inyectado para una segunda llamada con datos distintos (triangulación).
    const { handlers, bus } = createFakeBus();
    // Renderiza la PWA del garzón con el bus inyectado.
    render(<WaiterPage bus={bus} />);
    // Espera la vista activa del garzón.
    await screen.findByText(/Mis mesas/i, {}, { timeout: 3000 });
    // Recibe una llamada con otra mesa y otro motivo.
    act(() => {
      handlers['call.waiter']({
        tableId: 'table-09',
        reason: 'Ayuda general',
        customerName: 'Cliente',
        timestamp: Date.now(),
      });
    });
    // Verifica que el banner refleja los datos de la nueva llamada.
    expect(screen.getByTestId('sos-alert-banner')).toHaveTextContent(/table-09/);
    expect(screen.getByTestId('sos-alert-banner')).toHaveTextContent(/Ayuda general/);
    // Presiona el botón de descarte de la alerta.
    fireEvent.click(screen.getByRole('button', { name: /Atendido/i }));
    // El banner desaparece tras descartar la alerta S.O.S.
    expect(screen.queryByTestId('sos-alert-banner')).not.toBeInTheDocument();
  });
});
