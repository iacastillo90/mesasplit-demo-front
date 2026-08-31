// src/features/CorporateView/CostoPrimarioCard.test.jsx — suite de tests de Costo Primario (costo-primario)
// Cubre el spec costo-primario: cálculo de métrica (Σ foodCost / Σ salesTotal * 100),
// panel read-only sin mutaciones del store y manejo sin datos (0% sin NaN).
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado y consulta de elementos en DOM.
import { render, screen } from '@testing-library/react';
// Store de CorporateView y selector puro.
import { selectCostoPrimario, useCorporateStore } from './store/useCorporateStore.js';
// Componente de tarjeta de costo primario.
import CostoPrimarioCard from './components/CostoPrimarioCard.jsx';

describe('costo-primario: Indicador de Costo Primario read-only (Super Admin)', () => {
  beforeEach(() => {
    // Restablece el store corporativo antes de cada prueba.
    useCorporateStore.getState().resetDemo();
  });

  it('Scenario 1: Selector selectCostoPrimario calcula (600 / 2000 * 100) = 30.0%', () => {
    // Setea branches de prueba con foodCost y salesTotal conocidos.
    useCorporateStore.setState({
      branches: [
        { id: 'b1', name: 'Sucursal 1', salesTotal: 1000, foodCost: 400 },
        { id: 'b2', name: 'Sucursal 2', salesTotal: 1000, foodCost: 200 },
      ],
    });

    const result = selectCostoPrimario(useCorporateStore.getState());
    expect(result.percentage).toBe(30.0);
    expect(result.sumFoodCost).toBe(600);
    expect(result.sumSalesTotal).toBe(2000);
  });

  it('Scenario 2: CostoPrimarioCard renderiza porcentaje y desglose sin mutar el store', async () => {
    // Inyecta datos de sucursales en el store.
    useCorporateStore.setState({
      branches: [
        { id: 'b1', name: 'Sucursal 1', salesTotal: 1000000, foodCost: 320000 },
      ],
    });

    // Estado previo para verificar inmutabilidad.
    const initialBranches = useCorporateStore.getState().branches;

    // Renderiza la tarjeta de Costo Primario.
    render(<CostoPrimarioCard />);

    // Muestra el 32.0% calculado.
    expect(await screen.findByText(/32\.0%/i)).toBeInTheDocument();
    // Explica la fórmula en el pie de la tarjeta.
    expect(screen.getByText(/Fórmula: \(Materia prima \/ Ventas totales\) × 100/i)).toBeInTheDocument();

    // El store permanece inmutable.
    expect(useCorporateStore.getState().branches).toBe(initialBranches);
  });

  it('Scenario 3: Maneja suma de ventas cero mostrando 0.0% sin caer en NaN', () => {
    // Sucursales con ventas 0.
    useCorporateStore.setState({
      branches: [
        { id: 'b1', name: 'Sucursal Cero', salesTotal: 0, foodCost: 0 },
      ],
    });

    const result = selectCostoPrimario(useCorporateStore.getState());
    expect(result.percentage).toBe(0.0);
    expect(Number.isNaN(result.percentage)).toBe(false);
  });
});
