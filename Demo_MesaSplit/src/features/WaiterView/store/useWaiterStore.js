// src/features/WaiterView/store/useWaiterStore.js — store del garzón (waiter-pwa)
// Slice de estado del mozo: marcaje de turno (Ley 40h), mesas asignadas, comanda activa,
// Course Control, Escudo de Alergias, anulación autorizada con PIN y liberación de mesa.
// Emite eventos shift.clock_in, course.fire, alert.fraud y table.status_changed por el bus real-time.

// create: fábrica de store de Zustand v5.
import { create } from 'zustand';
// Servicio de datos del garzón (mesas asignadas + carta real).
import { fetchAssignedTables, getMenu } from '../services/waiterService.js';
// Instancia del bus en tiempo real de la aplicación (no hook para uso dentro de Zustand).
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';
// Invariante de conservación de integridad de cuentas (Decisiones 4): reusado por mergeBills.
import { checkConservation } from '../../ClientView/services/splitService.js';

// Instancia única del bus para las acciones del garzón.
const bus = createRealtimeBus('mesasplit');
// Exporta el bus del store para espionaje en tests (D5: ausencia de alert.fraud en removeItem).
export const waiterRealtimeBus = bus;

// Identificador demo del garzón en sesión (asignación origen en tables.json).
export const CURRENT_WAITER_ID = 'pedro-soto';
// Garzones destino válidos para ceder mesa (demo): u3 = Camila Torres (rol waiter en users.json).
export const DEMO_WAITERS = ['u3'];

// Fixture de mesas predeterminadas para hidratación síncrona.
import tablesData from '../../../mocks/tables.json';
// http e isBackendMode: cliente real + flag de modo para conectar al back.
import { http, isBackendMode } from '../../../api/httpClient.js';

// mapCourseToBackend: curso del front ('entrada'/'fondo'/'postre') → enum del back.
function mapCourseToBackend(course) {
  // Tabla de traducción; default 'FONDO' si el curso no está declarado.
  return { entrada: 'ENTRADA', fondo: 'FONDO', postre: 'POSTRE' }[course] || 'FONDO';
}

// Estado inicial del store de garzón (shiftStatus por defecto 'clocked_in' para navegación fluida).
const initialState = {
  // Estado del turno: 'clocked_in' (activo por defecto en la demo) o 'clocked_out'.
  shiftStatus: 'clocked_in',
  // Garzón en sesión.
  waiterName: 'Pedro Soto',
  // Lista de mesas asignadas al garzón.
  tables: tablesData,
  // ID de la mesa seleccionada actualmente.
  selectedTableId: null,
  // Carta real del menú (fuente única: menu.json, D10).
  menu: [],
  // Borrador de la comanda en preparación para la mesa seleccionada.
  orderDraft: [],
  // Curso seleccionado por defecto para los nuevos platos.
  selectedCourse: 'entrada',
  // Estado de carga inicial de mesas.
  loading: false,
  // Toast o notificación de confirmación activa.
  toastMessage: null,
  // Registro demo de cesiones de mesa (destino: garzón que recibió la mesa).
  transferredTables: [],
};

// Store de Zustand para el slice de WaiterView.
export const useWaiterStore = create((set, get) => ({
  // Carga el estado inicial.
  ...initialState,

  // Inicia el turno del mozo mediante validación de PIN (Ley 40 Horas).
  clockIn: (pin) => {
    // Valida el PIN de marcaje del mozo (demo: "1234").
    if (pin !== '1234') return false;

    // Cambia el estado del turno a activo.
    set({ shiftStatus: 'clocked_in' });

    // Emite el evento de marcaje de turno por el bus en tiempo real.
    bus.publish('shift.clock_in', {
      waiterName: String(get().waiterName),
      timestamp: Date.now(),
    });

    // Dispara la carga inicial de mesas asignadas.
    get().loadTables();
    return true;
  },

  // Cierra el turno del mozo (pantalla de bloqueo de asistencia).
  clockOut: () => set({ shiftStatus: 'clocked_out' }),

  // Carga la lista de mesas asignadas desde el servicio del garzón.
  loadTables: async () => {
    // Solicita las mesas al servicio mock.
    const tables = await fetchAssignedTables();
    // Guarda las mesas en el estado y finaliza la carga.
    set({ tables, loading: false });
  },

  // Carga la carta real del menú (D10, mirror de useClientStore.loadMenu).
  loadMenu: async () => {
    // Solicita el menú al servicio mock (única fuente: menu.json).
    const menu = await getMenu();
    // Guarda la carta en el estado y finaliza la carga.
    set({ menu, loading: false });
  },

  // Selecciona una mesa de la grilla para trabajar sobre su comanda.
  selectTable: (tableId) => {
    // Garantiza que tableId sea una cadena limpia.
    const cleanId = typeof tableId === 'string' ? tableId : String(tableId ?? 't1');
    // Si no había borrador previo, siembra ítems de prueba para la mesa seleccionada.
    // Seed alineado con menu.json (D12): m2 = Hamburguesa Clásica Brioche a 8900.
    const existingDraft = get().orderDraft;
    const initialDraft =
      existingDraft.length > 0
        ? existingDraft
        : [
            {
              id: 'd1',
              productId: 'm2',
              name: 'Hamburguesa Clásica Brioche',
              price: 8900,
              qty: 1,
              allergens: [],
              course: 'entrada',
              sentToKitchen: true,
            },
          ];

    set({ selectedTableId: cleanId, orderDraft: initialDraft });
  },

  // Agrega un ítem del menú al borrador de la comanda de la mesa actual.
  addToDraft: (menuItem) => {
    // Obtiene la lista actual de ítems en el borrador.
    const { orderDraft, selectedCourse } = get();
    // Busca si el plato ya fue agregado en el mismo curso.
    const existingIndex = orderDraft.findIndex(
      (item) => item.productId === menuItem.id && item.course === selectedCourse,
    );

    let updatedDraft;
    if (existingIndex >= 0) {
      // Si el ítem ya está, incrementa su cantidad manteniendo el contador.
      updatedDraft = orderDraft.map((item, idx) =>
        idx === existingIndex ? { ...item, qty: item.qty + 1 } : item,
      );
    } else {
      // Si es nuevo, crea la línea con cantidad 1.
      const newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: String(menuItem.id),
        name: String(menuItem.name),
        price: Number(menuItem.price),
        qty: 1,
        allergens: menuItem.allergens ? [...menuItem.allergens] : [],
        course: String(selectedCourse),
        sentToKitchen: false,
      };
      updatedDraft = [...orderDraft, newItem];
    }

    // Actualiza el borrador en el store.
    set({ orderDraft: updatedDraft });
  },

  // Sube en 1 la cantidad de la línea del productId en el curso dado.
  // Solo toca líneas existentes: NUNCA crea duplicados (aggregation-semantics).
  increaseQty: (productId, course) =>
    set((state) => ({
      orderDraft: state.orderDraft.map((line) =>
        line.productId === productId && line.course === course
          ? { ...line, qty: line.qty + 1 }
          : line,
      ),
    })),

  // Baja en 1 la cantidad; si la línea llega a 0, se remueve del borrador (sc.2).
  decreaseQty: (productId, course) =>
    set((state) => ({
      orderDraft: state.orderDraft
        .map((line) =>
          line.productId === productId && line.course === course
            ? { ...line, qty: line.qty - 1 }
            : line,
        )
        // Remueve las líneas que quedaron en cero (semántica de borrado en 0).
        .filter((line) => line.qty > 0),
    })),

  // Elimina la línea completa del borrador sin importar su cantidad.
  // D5: es borrado de borrador, NO emite alert.fraud (la anulación auditada
  // con PIN sigue siendo responsabilidad exclusiva de voidItemWithPin).
  removeItem: (productId, course) =>
    set((state) => ({
      orderDraft: state.orderDraft.filter(
        (line) => !(line.productId === productId && line.course === course),
      ),
    })),

  // Alterna o agrega un flag de alergia médica sobre una línea del pedido (Escudo de Alergias).
  toggleAllergyFlag: (itemId, allergen) => {
    // Obtiene el borrador actual.
    const { orderDraft } = get();
    // Recorre y muta el arreglo de alérgenos de la línea correspondiente.
    const updatedDraft = orderDraft.map((line) => {
      if (line.id !== itemId) return line;
      const hasAllergen = line.allergens.includes(allergen);
      const newAllergens = hasAllergen
        ? line.allergens.filter((a) => a !== allergen)
        : [...line.allergens, allergen];
      return { ...line, allergens: newAllergens };
    });
    // Guarda el borrador actualizado.
    set({ orderDraft: updatedDraft });
  },

  // Cambia el tiempo/curso activo seleccionado en el picker.
  setCourse: (selectedCourse) => set({ selectedCourse }),

  // Dispara el evento course.fire para notificar a la cocina que marche los platos de Fondo.
  fireCourse: (courseType = 'fondo') => {
    // Obtiene la mesa activa.
    const { selectedTableId } = get();
    // Define el mensaje de confirmación.
    set({ toastMessage: 'Fondo marchado a cocina' });

    // Emite el evento en tiempo real course.fire por el bus (payload estrictamente primitivo).
    bus.publish('course.fire', {
      tableId: selectedTableId ? String(selectedTableId) : 't1',
      courseType: mapCourseToBackend(courseType),
      timestamp: Date.now(),
    });

    // Oculta el mensaje a los 2 segundos.
    setTimeout(() => set({ toastMessage: null }), 2000);
  },

  // Anula un ítem enviado a cocina mediante validación de PIN de Administrador (9921).
  voidItemWithPin: (itemId, adminPin, reason) => {
    // Valida el PIN de Administrador.
    if (String(adminPin) !== '9921') return false;

    // Quita la línea del borrador.
    const updatedDraft = get().orderDraft.filter((line) => line.id !== itemId);
    set({ orderDraft: updatedDraft });

    // Emite evento de seguridad y auditoría de fraudes/anulaciones.
    bus.publish('alert.fraud', {
      type: 'item_void_sent_to_kitchen',
      itemId: String(itemId),
      reason: String(reason),
      adminPin: String(adminPin),
      timestamp: Date.now(),
    });

    return true;
  },

  // Cierra y libera la mesa seleccionada restableciendo su estado a libre (free).
  releaseTable: (tableId) => {
    // Lee la lista de mesas.
    const { tables, selectedTableId } = get();
    // Determina la mesa objetivo a liberar.
    const targetId = tableId ?? selectedTableId ?? 't1';
    const cleanId = String(targetId);

    // Actualiza el estado de la mesa a libre ('free').
    const updatedTables = tables.map((t) =>
      t.id === cleanId ? { ...t, status: 'free', guests: 0 } : t,
    );

    // Limpia el borrador y deselecciona la mesa.
    set({ tables: updatedTables, selectedTableId: null, orderDraft: [] });

    // Emite el evento table.status_changed por el bus.
    bus.publish('table.status_changed', {
      tableId: cleanId,
      status: 'free',
      timestamp: Date.now(),
    });
  },

  // Une la cuenta de la mesa origen sobre la mesa destino (waiter-table-transfer).
  // Preserva TODAS las líneas con qty/price intactos y valida el invariante de
  // conservación (checkConservation) antes de mutar; destino inválido → bloqueado.
  mergeBills: (originId, targetId) => {
    // Lee el estado actual de las mesas.
    const tables = get().tables;
    // Normaliza los ids de las cuentas a cadenas.
    const originIdClean = String(originId ?? '');
    const targetIdClean = String(targetId ?? '');

    // Busca la mesa origen (debe existir y tener cuenta con líneas).
    const origin = tables.find((t) => t.id === originIdClean);
    // Busca la mesa destino (debe existir).
    const target = tables.find((t) => t.id === targetIdClean);
    // Valida la operación: origen y destino distintos, ambos existen y el origen tiene cuenta.
    const invalid =
      !origin || !target || originIdClean === targetIdClean || !origin.order || origin.order.items.length === 0;
    // Destino inválido: bloquea sin mutar (spec S5).
    if (invalid) return { ok: false, error: 'Destino inválido' };

    // Total de la cuenta origen (Σ price×qty).
    const originTotal = origin.order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    // Total de la cuenta destino (Σ price×qty).
    const targetTotal = target.order.items.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Fusiona TODAS las líneas preservando qty/price intactos (spec: sin pérdidas ni duplicados).
    const mergedItems = [...origin.order.items, ...target.order.items];
    // Total de la cuenta unida (Σ price×qty).
    const mergedTotal = mergedItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Invariante de conservación reusado: partials {origen, destino} === total unido.
    const conserved = checkConservation({ origin: originTotal, target: targetTotal }, mergedTotal);
    // Si el invariante falla, no muta (integridad de la cuenta primero).
    if (!conserved) return { ok: false, error: 'Invariante de conservación violado' };

    // Aplica la unión: destino con las líneas fusionadas; origen liberado sin cuenta.
    const updatedTables = tables.map((t) => {
      if (t.id === targetIdClean) return { ...t, order: { items: mergedItems } };
      if (t.id === originIdClean) return { ...t, status: 'free', order: null };
      return t;
    });

    // Sincroniza el borrador si la mesa destino es la seleccionada (demo coherente);
    // si se liberó la mesa seleccionada, limpia el borrador.
    const draft =
      targetIdClean === get().selectedTableId
        ? mergedItems.map((item, idx) => ({
            // Línea reconstruida con la forma del borrador (id estable por índice).
            id: `merged-${idx}`,
            productId: String(item.id),
            name: String(item.name),
            price: Number(item.price),
            qty: Number(item.qty),
            allergens: [],
            // Los ítems fusionados entran por defecto en el primer tiempo.
            course: 'entrada',
            sentToKitchen: false,
          }))
        : originIdClean === get().selectedTableId
          ? []
          : get().orderDraft;

    // Persiste la unión y el borrador sincronizado.
    set({ tables: updatedTables, orderDraft: draft });

    // Emite el evento de unión de cuentas por el bus.
    bus.publish('table.bills_merged', {
      originId: originIdClean,
      targetId: targetIdClean,
      total: mergedTotal,
      timestamp: Date.now(),
    });

    // Confirma con el total unido (invariante verificado).
    return { ok: true, total: mergedTotal };
  },

  // Cede la mesa a otro garzón (waiter-table-transfer): la mesa deja la grilla del
  // origen y el destino la recibe; la cesión requiere confirmación explícita previa.
  transferTable: (tableId, waiterId) => {
    // Lee el estado actual de las mesas.
    const tables = get().tables;
    // Normaliza los ids.
    const tableIdClean = String(tableId ?? '');
    const waiterIdClean = String(waiterId ?? '');

    // Busca la mesa a ceder (debe existir en la grilla del origen).
    const table = tables.find((t) => t.id === tableIdClean);
    // Valida el destino: mesa existente, garzón destino válido y distinto del origen.
    const invalid =
      !table || waiterIdClean === CURRENT_WAITER_ID || !DEMO_WAITERS.includes(waiterIdClean);
    // Destino inválido (mismo garzón o inexistente): bloquea sin mutar (spec S5).
    if (invalid) return { ok: false, error: 'Destino inválido' };

    // Quita la mesa de la grilla del garzón origen.
    const updatedTables = tables.filter((t) => t.id !== tableIdClean);
    // Registra la cesión en el estado destino (asignación demo, no muta el fixture).
    const transferredTables = [
      ...get().transferredTables,
      {
        // Datos de la mesa cedida.
        id: table.id,
        number: table.number,
        // Garzón destino de la cesión.
        waiterId: waiterIdClean,
        // Marca temporal de la cesión confirmada.
        transferredAt: Date.now(),
      },
    ];

    // Aplica la salida de la grilla del origen y el registro del destino.
    set({ tables: updatedTables, transferredTables });

    // Emite el evento de cesión de mesa por el bus en tiempo real.
    bus.publish('table.waiter_changed', {
      tableId: tableIdClean,
      waiterId: waiterIdClean,
      timestamp: Date.now(),
    });

    // Confirma la cesión.
    return { ok: true };
  },

  // Restablece el slice a su estado inicial.
  // Envía la comanda en borrador: en modo backend abre sesión (si falta) y crea
  // la orden vía POST /sessions + POST /orders; en modo demo emite el evento local.
  submitOrder: async () => {
    // Estado actual: mesa seleccionada, borrador y mesas.
    const { selectedTableId, orderDraft, tables } = get();
    // Sin mesa seleccionada o sin ítems: no hay nada que enviar.
    if (!selectedTableId || orderDraft.length === 0) return false;

    // Modo demo: emite el evento local y limpia el borrador (comportamiento actual).
    if (!isBackendMode()) {
      bus.publish('order.submitted', { tableId: selectedTableId, items: orderDraft, timestamp: Date.now() });
      set({ orderDraft: [], toastMessage: 'Comanda enviada a cocina' });
      setTimeout(() => set({ toastMessage: null }), 2000);
      return true;
    }

    try {
      // Busca la mesa seleccionada para leer seats y la sesión activa.
      const table = tables.find((t) => String(t.id) === String(selectedTableId));
      // 1. Sesión: reusa la activa de la mesa o abre una nueva (POST /sessions).
      let sessionId = table?.activeSessionId || null;
      if (!sessionId) {
        const session = await http.post('/api/v1/sessions', {
          tableId: selectedTableId,
          guestCount: table?.seats || 4,
        });
        sessionId = session.id;
      }
      // 2. Mapea el borrador a las líneas de CreateOrderRequest.
      const lines = orderDraft.map((line) => ({
        dishId: line.productId,
        quantity: line.qty,
        unitPrice: line.price,
        courseType: mapCourseToBackend(line.course),
        dineGuestId: null,
      }));
      // 3. Crea la comanda (POST /orders).
      const order = await http.post('/api/v1/orders', {
        dineSessionId: sessionId,
        channel: 'staff',
        lines,
      });
      // Limpia el borrador y confirma con un toast.
      set({ orderDraft: [], toastMessage: `Comanda #${String(order.id).slice(0, 8)} enviada` });
      setTimeout(() => set({ toastMessage: null }), 2500);
      return true;
    } catch (err) {
      // Error de red o de regla de negocio: lo muestra en el toast.
      set({ toastMessage: `Error al enviar: ${err.message}` });
      setTimeout(() => set({ toastMessage: null }), 3000);
      return false;
    }
  },

  resetDemo: () => set(initialState),
}));
