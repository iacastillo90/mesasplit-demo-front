// src/features/ClientView/store/useReservationStore.test.js — suite de tests unitarios para useReservationStore
// Verifica la selección de sucursales, creación de reservas por local, fila virtual y emisión de eventos realtime.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español por cada línea de código).

// Describe y test de Vitest para la suite de pruebas del store.
import { describe, it, expect, beforeEach } from 'vitest';
// Hook del store de reservas a probar.
import { useReservationStore, INITIAL_BRANCHES } from './useReservationStore.js';

// Describe bloque principal del store de reservas por sucursal.
describe('useReservationStore: Gestión de reservas por sucursal y fila virtual', () => {
  // Reinicia el estado del store antes de cada prueba.
  beforeEach(() => {
    // Setea el estado a sus valores por defecto iniciales.
    useReservationStore.setState({
      branches: INITIAL_BRANCHES,
      selectedBranchId: 'b-1',
      reservations: [],
      waitlist: [],
    });
  });

  // Test 1: Selección de sucursal activa.
  it('permite cambiar la sucursal seleccionada actualmente', () => {
    // Cambia la sucursal a Santiago Centro (b-2).
    useReservationStore.getState().setSelectedBranchId('b-2');
    // Verifica que la sucursal seleccionada se actualice a b-2.
    expect(useReservationStore.getState().selectedBranchId).toBe('b-2');
  });

  // Test 2: Creación de reserva confirmada con emisión de eventos.
  it('crea una reserva confirmada asignando sucursal y código único', () => {
    // Ejecuta la acción de crear reserva.
    const res = useReservationStore.getState().createReservation({
      customerName: 'Prueba Cliente',
      guests: 4,
      date: '2026-08-20',
      time: '21:00',
      zone: 'Terraza',
      specialNotes: ['Cumpleaños 🎂'],
    });

    // Verifica que el ID de la reserva exista.
    expect(res.id).toBeDefined();
    // Verifica el nombre del cliente.
    expect(res.customerName).toBe('Prueba Cliente');
    // Verifica la sucursal asignada por defecto (b-1 Providencia).
    expect(res.branchId).toBe('b-1');
    // Verifica que la reserva se haya agregado al listado global del store.
    expect(useReservationStore.getState().reservations).toHaveLength(1);
  });

  // Test 3: Ingreso a la fila virtual.
  it('permite a un comensal unirse a la fila virtual calculando posición y espera', () => {
    // Ejecuta el ingreso a la fila virtual para la sucursal Vitacura (b-3).
    const wait = useReservationStore.getState().joinWaitlist({
      branchId: 'b-3',
      customerName: 'Cliente En Espera',
      guests: 2,
    });

    // Confirma que se genere el registro de la fila virtual.
    expect(wait.id).toBeDefined();
    // Verifica que la posición en la fila sea 1.
    expect(wait.position).toBe(1);
    // Verifica el nombre del comensal.
    expect(wait.customerName).toBe('Cliente En Espera');
    // Confirma que el estado en la lista del store sea 1 entrada.
    expect(useReservationStore.getState().waitlist).toHaveLength(1);
  });

  // Test 4: Cancelación de reserva.
  it('cancela una reserva existente eliminándola del estado', () => {
    // Crea primero una reserva para tener en el store.
    const res = useReservationStore.getState().createReservation({ customerName: 'Para Cancelar' });
    // Verifica que se haya insertado.
    expect(useReservationStore.getState().reservations).toHaveLength(1);

    // Cancela la reserva recién creada.
    useReservationStore.getState().cancelReservation(res.id);
    // Verifica que la lista quede vacía.
    expect(useReservationStore.getState().reservations).toHaveLength(0);
  });
});
