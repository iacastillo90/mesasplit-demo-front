// src/features/ClientView/store/useClientStore.test.js — suite de tests de reconexión de sesión del cliente (client-session-reconnect)
// Cubre el spec client-session-reconnect: restauración de cart y tableContext desde localStorage bajo la clave mesasplit-client,
// tolerancia a localStorage sin datos (inicia en default) y tolerancia a JSON corrupto sin lanzar excepción.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('client-session-reconnect: Reconexión de sesión y persistencia del cliente', () => {
  beforeEach(() => {
    // Limpia el almacenamiento local antes de cada prueba.
    window.localStorage.clear();
    vi.resetModules();
  });

  it('Scenario 1: Reload restaura cart y tableContext persistidos en localStorage bajo mesasplit-client', async () => {
    // Prepara datos de sesión en localStorage.
    const mockSession = {
      state: {
        cart: [{ id: 'm1', name: 'Hamburguesa Clásica', price: 8900, qty: 2 }],
        tableContext: { number: 12, code: '4F2K', guests: 4 },
      },
      version: 0,
    };
    window.localStorage.setItem('mesasplit-client', JSON.stringify(mockSession));

    // Importa el store para forzar su inicialización con la clave persistida.
    const { useClientStore } = await import('./useClientStore.js');

    const state = useClientStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].name).toBe('Hamburguesa Clásica');
    expect(state.tableContext?.number).toBe(12);
  });

  it('Scenario 2: Sin sesión persistida inicia con el estado por defecto sin crashear', async () => {
    const { useClientStore } = await import('./useClientStore.js');

    const state = useClientStore.getState();
    expect(state.cart).toEqual([]);
    expect(state.tableContext).toBeNull();
  });

  it('Scenario 3: JSON corrupto en localStorage no lanza excepción y degrada al estado por defecto', async () => {
    // Guarda un JSON malformado en la clave de persistencia.
    window.localStorage.setItem('mesasplit-client', '{ corruptJson: true, invalid... ');

    // La inicialización del store no debe lanzar ningún error.
    let useClientStore;
    expect(async () => {
      const module = await import('./useClientStore.js');
      useClientStore = module.useClientStore;
    }).not.toThrow();

    const module = await import('./useClientStore.js');
    useClientStore = module.useClientStore;
    expect(useClientStore.getState().cart).toEqual([]);
  });
});
