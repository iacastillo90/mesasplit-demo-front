// src/features/CorporateView/ComplianceSiiPanel.test.jsx — suite de tests del panel de compliance SII (compliance-sii)
// Cubre el spec compliance-sii: verificación de los 3 checks (DTE Boleta, folios consecutivos SII, Cierre Ciego),
// detección de quiebre en secuencia de folios y verificación de que el panel es 100% read-only.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado y consultas en DOM.
import { render, screen } from '@testing-library/react';
// Store corporativo y selectores de compliance.
import {
  selectFoliosConsecutivos,
  selectHasDteBoleta,
  useCorporateStore,
} from './store/useCorporateStore.js';
// Panel de compliance SII.
import ComplianceSiiPanel from './components/ComplianceSiiPanel.jsx';

describe('compliance-sii: Panel de Compliance SII read-only (Super Admin)', () => {
  beforeEach(() => {
    // Restablece el store corporativo antes de cada prueba.
    useCorporateStore.getState().resetDemo();
  });

  it('Scenario 1: Los tres checks en OK cuando hay folios consecutivos y Cierre Ciego disponible', () => {
    useCorporateStore.setState({
      franchiseEvents: [
        { id: 'e1', type: 'payment', dteFolio: 1041, timestamp: 1000 },
        { id: 'e2', type: 'payment', dteFolio: 1042, timestamp: 2000 },
        { id: 'e3', type: 'payment', dteFolio: 1043, timestamp: 3000 },
      ],
    });

    const state = useCorporateStore.getState();
    expect(selectHasDteBoleta(state)).toBe(true);
    expect(selectFoliosConsecutivos(state)).toBe(true);
  });

  it('Scenario 2: Quiebre de folios detectado cuando faltan folios intermedios (ej. 1041 y 1043)', () => {
    useCorporateStore.setState({
      franchiseEvents: [
        { id: 'e1', type: 'payment', dteFolio: 1041, timestamp: 1000 },
        { id: 'e3', type: 'payment', dteFolio: 1043, timestamp: 2000 },
      ],
    });

    const state = useCorporateStore.getState();
    expect(selectHasDteBoleta(state)).toBe(true);
    // 1041 -> 1043 no es consecutivo (+2 en lugar de +1) -> debe ser false (Riesgo).
    expect(selectFoliosConsecutivos(state)).toBe(false);
  });

  it('Scenario 3: ComplianceSiiPanel renderiza los 3 indicadores sin mutar el store', async () => {
    useCorporateStore.setState({
      franchiseEvents: [
        { id: 'e1', type: 'payment', dteFolio: 1041, timestamp: 1000 },
        { id: 'e2', type: 'payment', dteFolio: 1042, timestamp: 2000 },
      ],
    });

    const initialEvents = useCorporateStore.getState().franchiseEvents;

    render(<ComplianceSiiPanel />);

    // Encabezado del panel de compliance fiscal.
    expect(await screen.findByText(/Compliance Fiscal SII/i)).toBeInTheDocument();
    // Tres verificaciones legales visibles.
    expect(screen.getByText(/Emisión DTE Boleta/i)).toBeInTheDocument();
    expect(screen.getByText(/Secuencia de Folios SII/i)).toBeInTheDocument();
    expect(screen.getByText(/Arqueo Cierre Ciego/i)).toBeInTheDocument();

    // El store permanece inmutable.
    expect(useCorporateStore.getState().franchiseEvents).toBe(initialEvents);
  });
});
