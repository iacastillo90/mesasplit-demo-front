// src/features/ClientView/store/useRewardsStore.test.js — tests unitarios para useRewardsStore
// Prueba la acumulación de puntos, cálculo de nivel y canje de recompensas del catálogo.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Describe, it y expect de Vitest para la suite de pruebas.
import { describe, it, expect, beforeEach } from 'vitest';
// Store y helpers de rewards a probar.
import { useRewardsStore, calculateTier } from './useRewardsStore.js';

// Describe bloque principal del programa de lealtad MesaSplit Rewards.
describe('useRewardsStore: Fidelización y Gamificación MesaSplit Rewards', () => {
  // Resetea el store antes de cada test.
  beforeEach(() => {
    // Setea puntos iniciales en 1,250 y lista limpia de canjes.
    useRewardsStore.setState({
      points: 1250,
      redeemedRewards: [],
    });
  });

  // Test 1: Cálculo correcto del nivel según puntos.
  it('calcula adecuadamente el nivel de lealtad según el puntaje acumulado', () => {
    // Verifica nivel Plata para 500 puntos.
    expect(calculateTier(500).name).toContain('Plata');
    // Verifica nivel Oro para 1250 puntos.
    expect(calculateTier(1250).name).toContain('Oro');
    // Verifica nivel VIP para 2500 puntos.
    expect(calculateTier(2500).name).toContain('VIP');
  });

  // Test 2: Acumulación de puntos por consumo y propina.
  it('acredita puntos por compra y otorga bono extra si hay propina digital', () => {
    // Acredita $20.000 gastados con $2.000 de propina.
    const earned = useRewardsStore.getState().addPoints(20000, 2000);

    // 20000 / 100 = 200 pts base + 50 pts propina = 250 pts.
    expect(earned).toBe(250);
    // Verifica que el saldo total en el store pase de 1,250 a 1,500.
    expect(useRewardsStore.getState().points).toBe(1500);
  });

  // Test 3: Canje exitoso de recompensa.
  it('permite canjear una recompensa descontando puntos y generando código', () => {
    // Intenta canjear el Postre de la Casa (costo: 500 pts, saldo inicial: 1250 pts).
    const success = useRewardsStore.getState().redeemReward('rew-1');

    // Verifica que el canje haya sido exitoso.
    expect(success).toBe(true);
    // Confirma que los puntos bajaron a 750 (1250 - 500).
    expect(useRewardsStore.getState().points).toBe(750);
    // Confirma que la recompensa canjeada exista en el estado.
    expect(useRewardsStore.getState().redeemedRewards).toHaveLength(1);
    // Confirma el código del voucher.
    expect(useRewardsStore.getState().redeemedRewards[0].code).toBeDefined();
  });

  // Test 4: Canje fallido por falta de puntos.
  it('rechaza el canje si el saldo de puntos es insuficiente', () => {
    // Deja los puntos en 100.
    useRewardsStore.setState({ points: 100 });

    // Intenta canjear una recompensa de 500 pts.
    const success = useRewardsStore.getState().redeemReward('rew-1');

    // Confirma que el canje fue rechazado.
    expect(success).toBe(false);
    // Confirma que el saldo sigue en 100.
    expect(useRewardsStore.getState().points).toBe(100);
  });
});
