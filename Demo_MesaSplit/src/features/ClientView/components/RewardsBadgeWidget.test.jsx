// src/features/ClientView/components/RewardsBadgeWidget.test.jsx — tests unitarios para RewardsBadgeWidget
// Prueba el renderizado del widget de lealtad, apertura del modal y proceso de canje de premios.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import RewardsBadgeWidget from './RewardsBadgeWidget.jsx';
// Store de rewards para manipular estado en test.
import { useRewardsStore } from '../store/useRewardsStore.js';

// Describe bloque de tests para RewardsBadgeWidget.
describe('RewardsBadgeWidget: Widget de lealtad y modal de canje', () => {
  // Test 1: Renderizado del widget con los puntos actuales.
  it('renderiza el widget compacto con el saldo de puntos acumulados', () => {
    // Setea puntos en 1,250.
    useRewardsStore.setState({ points: 1250 });
    // Renderiza el widget.
    render(<RewardsBadgeWidget />);

    // Confirma la presencia del texto de puntos.
    expect(screen.getByText(/1,250 pts/i)).toBeInTheDocument();
    // Confirma la presencia del botón de canjear.
    expect(screen.getByRole('button', { name: /🎁 Canjear/i })).toBeInTheDocument();
  });

  // Test 2: Apertura del modal y canje de beneficio.
  it('abre el modal del catálogo al pulsar Canjear y permite reclamar premio', () => {
    // Setea puntos suficientes en 1,500.
    useRewardsStore.setState({ points: 1500, redeemedRewards: [] });
    // Renderiza el widget.
    render(<RewardsBadgeWidget />);

    // Abre el modal.
    fireEvent.click(screen.getByRole('button', { name: /🎁 Canjear/i }));

    // Confirma el título del modal.
    expect(screen.getByText(/Catálogo/i)).toBeInTheDocument();
    // Confirma que aparezca el Postre de la Casa.
    expect(screen.getByText(/Postre de la Casa/i)).toBeInTheDocument();

    // Pulsa el botón Canjear del primer ítem del catálogo.
    const redeemBtns = screen.getAllByRole('button', { name: /^Canjear$/i });
    fireEvent.click(redeemBtns[0]);

    // Confirma la reaparición del mensaje de éxito.
    expect(screen.getByText(/Beneficio canjeado con éxito/i)).toBeInTheDocument();
  });
});
