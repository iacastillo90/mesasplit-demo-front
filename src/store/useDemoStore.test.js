// src/store/useDemoStore.test.js — suite del store raíz persistente (task 4.3)
// Cubre el spec realtime-bus persist: sesión fresca siembra desde los mocks y
// el estado mutado sobrevive al reload vía localStorage (persist de Zustand).
// El "reload" se simula expulsando el módulo (vi.resetModules) y re-importándolo.

// API de Vitest importada explícita: ESLint no declara los globals de Vitest.
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Fixtures canónicos: las longitudes esperadas del seed (fuente de verdad).
import tablesData from '../mocks/tables.json';
import menuData from '../mocks/menu.json';
import usersData from '../mocks/users.json';

// Clave de localStorage elegida por el persist del store raíz (design D6).
const STORAGE_KEY = 'mesasplit-demo';

// Carga un módulo FRESCO del store raíz (simula la recarga de una página).
async function freshStore() {
  // Expulsa el módulo cacheado para que el import lo re-cree desde cero.
  vi.resetModules();
  // Importa (dinámico) la instancia nueva del store.
  const { useDemoStore } = await import('./useDemoStore.js');
  // Devuelve el hook/store recién creado.
  return useDemoStore;
}

describe('useDemoStore (realtime-bus: persist)', () => {
  // Aislamiento: sin persistencia previa entre tests del archivo.
  beforeEach(() => {
    // Vacía el localStorage de jsdom (sesión limpia por test).
    localStorage.clear();
  });

  it('siembra mesas, menú y usuarios desde los mocks en sesión fresca', async () => {
    // Crea el store con localStorage vacío (primera visita del usuario).
    const store = await freshStore();
    // Lee el estado inicial del store.
    const state = store.getState();
    // La cantidad de mesas coincide con el fixture tables.json.
    expect(state.tables).toHaveLength(tablesData.length);
    // La cantidad de ítems del menú coincide con menu.json.
    expect(state.menu).toHaveLength(menuData.length);
    // La cantidad de usuarios coincide con users.json.
    expect(state.users).toHaveLength(usersData.length);
    // Las órdenes demo arrancan vacías (sin fixture dedicado).
    expect(state.orders).toEqual([]);
  });

  it('persiste las mutaciones en localStorage y las restaura tras un reload', async () => {
    // Primera "visita": store fresco con seed de los mocks.
    const first = await freshStore();
    // Muta el estado cambiando la mesa t1 a billing (semántica de cuenta).
    first.getState().setTableStatus('t1', 'billing');
    // El persist escribió el estado mutado en localStorage.
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    // Recarga de la página: módulo fresco que rehidrata desde localStorage.
    const second = await freshStore();
    // Busca la mesa t1 en el estado restaurado.
    const t1 = second.getState().tables.find((t) => t.id === 't1');
    // El estado mutado sobrevivió al reload (spec "state survives reload").
    expect(t1.status).toBe('billing');
  });

  it('resetDemo re-siembra desde los mocks (vuelve al seed)', async () => {
    // Crea el store con el seed canónico de los mocks.
    const store = await freshStore();
    // Muta el estado para alejarse del seed.
    store.getState().setTableStatus('t1', 'billing');
    // Reinicia la demo al estado inicial (también sobreescribe el persist).
    store.getState().resetDemo();
    // Busca la mesa t1 tras el reset.
    const t1 = store.getState().tables.find((t) => t.id === 't1');
    // La mutación fue revertida por resetDemo.
    expect(t1.status).not.toBe('billing');
    // Y la cantidad de mesas vuelve a la del fixture.
    expect(store.getState().tables).toHaveLength(tablesData.length);
  });
});
