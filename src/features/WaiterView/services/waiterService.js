// src/features/WaiterView/services/waiterService.js — servicio del garzón (task 2.6)
// Capa de datos del garzón: entrega las mesas asignadas a su cargo.
// El spec feature-views exige que la grilla consuma las mesas desde la capa de
// servicios ("table grid sourced from the service layer").
// NOTA PR3 → PR4: fixtures inline + latencia simulada; PR 4 (task 3.1) crea
// src/mocks/tables.json + mockFetch.js y este servicio pasa a usarlos.

// Helper local: simula la latencia de red del diseño (~300ms) resolviendo data.
// Mismo contrato que mockFetch (llega en PR 4) para no cambiar la firma luego.
function fakeLatency(data) {
  // Retorna una promesa que resuelve pasada la ventana de 300ms.
  return new Promise((resolve) => {
    // setTimeout aplaza la resolución simulando el viaje de red.
    setTimeout(() => resolve(data), 300);
  });
}

// Mesas demo asignadas al garzón (shapes del dominio, sin backend).
// Cada mesa: id, número, capacidad, estado (TABLE_STATUS) y comanda abierta.
const DEMO_TABLES = [
  {
    // Identificador estable de la mesa.
    id: 't1',
    // Número visible de la mesa en el salón.
    number: 1,
    // Capacidad de comensales sentados.
    seats: 4,
    // Estado de la mesa (enum compartido de shared/constants).
    status: 'occupied',
    // Zona del salón a la que pertenece la mesa.
    zone: 'Salón',
    // Comanda abierta de la mesa (líneas {name, qty, price}).
    order: {
      // Líneas pedidas por los comensales de esta mesa.
      items: [
        // Plato pedido con cantidad y precio unitario.
        { id: 'o1', name: 'Hamburguesa Clásica', qty: 2, price: 8900 },
        // Bebida pedida con cantidad y precio unitario.
        { id: 'o2', name: 'Limonada Menta', qty: 2, price: 2900 },
      ],
    },
  },
  {
    // Identificador estable de la mesa.
    id: 't2',
    // Número visible de la mesa.
    number: 2,
    // Capacidad de comensales.
    seats: 6,
    // Estado: mesa en proceso de cobro (semántica de cuenta).
    status: 'billing',
    // Zona del salón.
    zone: 'Terraza',
    // Comanda abierta de la mesa (una sola línea demo).
    order: {
      // Líneas pedidas por esta mesa.
      items: [
        // Pizza pedida con cantidad y precio unitario.
        { id: 'o3', name: 'Pizza Margherita', qty: 1, price: 10900 },
      ],
    },
  },
  {
    // Identificador estable de la mesa.
    id: 't3',
    // Número visible de la mesa.
    number: 3,
    // Capacidad de comensales.
    seats: 2,
    // Estado: mesa libre, lista para recibir comensales.
    status: 'free',
    // Zona del salón.
    zone: 'Barra',
    // Mesa libre: sin comanda abierta.
    order: null,
  },
  {
    // Identificador estable de la mesa.
    id: 't4',
    // Número visible de la mesa.
    number: 4,
    // Capacidad de comensales.
    seats: 4,
    // Estado: mesa en limpieza tras desocuparse.
    status: 'cleaning',
    // Zona del salón.
    zone: 'Salón',
    // Mesa en limpieza: sin comanda (ya cerrada).
    order: null,
  },
  {
    // Identificador estable de la mesa.
    id: 't5',
    // Número visible de la mesa.
    number: 5,
    // Capacidad de comensales.
    seats: 8,
    // Estado: mesa ocupada con comensales activos.
    status: 'occupied',
    // Zona del salón.
    zone: 'Salón',
    // Comanda abierta de la mesa (líneas demo).
    order: {
      // Líneas pedidas por esta mesa.
      items: [
        // Ensalada pedida con cantidad y precio unitario.
        { id: 'o4', name: 'Ensalada César', qty: 1, price: 7400 },
        // Pasta pedida con cantidad y precio unitario.
        { id: 'o5', name: 'Carbonara', qty: 3, price: 9800 },
      ],
    },
  },
];

// Servicio del garzón: devuelve las mesas asignadas con latencia simulada.
export function fetchAssignedTables() {
  // Delega en fakeLatency: el arreglo de mesas como una promesa resuelta.
  return fakeLatency(DEMO_TABLES);
}
