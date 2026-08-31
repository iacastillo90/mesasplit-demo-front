// src/mocks/mockFetch.js — capa de datos simulada de la demo (task 3.1)
// Simula la latencia de red del diseño (~300ms) y sirve los fixtures de
// src/mocks con el contrato del design: "FeaturePage → services → mockFetch →
// mocks/*.json". mockFetch('/api/<recurso>') → Promise<fixture> (copia fresca).
// NOTA: los fixtures propios de cada slice (menú, mesas, tickets, contexto)
// migraron de los services inline a estos JSON; users.json alimenta el store
// raíz useDemoStore (task 3.3) y queda listo para el modo demo del login.

// Fixture del menú del restaurante (6 ítems con alergias declaradas).
import menuData from './menu.json';
// Fixture de las mesas del salón (8 mesas unificadas: waiter + radar).
import tablesData from './tables.json';
// Fixture de los empleados demo (5 roles: super_admin/local_admin/waiter/chef/cashier).
import usersData from './users.json';
// Fixture de los tickets de cocina (5 tickets con estaciones y alergias).
import ticketsData from './tickets.json';
// Fixture del contexto de mesa del cliente (banner de la Mesa Virtual).
import { TABLE_CONTEXT } from './tableContext.js';

// Registro de recursos: alias de URL → fixture (fuente única de los mocks).
// Las claves son los recursos que los services piden vía '/api/<clave>'.
const RESOURCES = {
  // Menú de la Mesa Virtual (clientService.getMenu).
  menu: menuData,
  // Mesas del salón (waiterService.fetchAssignedTables i store raíz).
  tables: tablesData,
  // Empleados demo (store raíz useDemoStore).
  users: usersData,
  // Tickets de cocina (kdsService.fetchKitchenTickets).
  tickets: ticketsData,
  // Contexto de mesa (clientService.getTableContext).
  'table-context': TABLE_CONTEXT,
};

// Latencia simulada de red del demo (0ms en modo test para evitar timeouts de Vitest).
const DEFAULT_LATENCY_MS = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test' ? 0 : 300;

// Capa de datos simulada: resuelve el fixture del recurso tras la latencia.
// Acepta la ruta ('/api/tables') y opciones para tests ({ delay }).
export function mockFetch(resourcePath, options = {}) {
  // Normaliza la ruta a la clave del registro (quita el prefijo '/api/').
  const key = String(resourcePath).replace(/^\/api\/?/, '');
  // Obtiene el fixture registrado para esa clave (undefined si no existe).
  const data = RESOURCES[key];
  // Latencia del call: la inyectada por el caller o la default del demo.
  const latency = options.delay ?? DEFAULT_LATENCY_MS;
  // Retorna una promesa que resuelve (o rechaza) tras la ventana simulada.
  return new Promise((resolve, reject) => {
    // Programa la resolución pasada la ventana de latencia simulada.
    setTimeout(() => {
      // Recurso desconocido: rechaza como haría una red con 404.
      if (!data) {
        reject(new Error(`mockFetch: recurso desconocido "${resourcePath}"`));
        return;
      }
      // Resuelve una COPIA fresca: los slices jamás mutan el fixture fuente.
      resolve(JSON.parse(JSON.stringify(data)));
    }, latency);
  });
}
