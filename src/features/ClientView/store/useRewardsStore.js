// src/features/ClientView/store/useRewardsStore.js — Store Zustand de gamificación y programa de fidelización MesaSplit Rewards
// Administra la acumulación de puntos por pago/propina, cálculo de nivel de comensal y canje de beneficios.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Zustand create para instanciar el store global de rewards.
import { create } from 'zustand';

// Catálogo de recompensas disponibles para canje por puntos.
export const REWARDS_CATALOG = [
  {
    id: 'rew-1',
    title: 'Postre de la Casa 🍨',
    description: 'Volcán de chocolate o Brownie con helado gratis en tu mesa.',
    pointsCost: 500,
    icon: '🍨',
  },
  {
    id: 'rew-2',
    title: 'Cóctel de Autor 🍸',
    description: 'Un Pisco Sour o Mojito clásico de bienvenida de la casa.',
    pointsCost: 800,
    icon: '🍸',
  },
  {
    id: 'rew-3',
    title: '15% Desc. en Próxima Visita 🏷️',
    description: 'Descuento directo en el total de tu consumo presencial.',
    pointsCost: 1200,
    icon: '🏷️',
  },
];

// Helper para determinar el nivel de lealtad según los puntos acumulados.
export const calculateTier = (points) => {
  // Nivel VIP Gastronómico a partir de 2,000 puntos.
  if (points >= 2000) return { name: 'VIP Gastronómico 👑', badgeColor: 'bg-amber-500 text-white', nextGoal: 3000 };
  // Nivel Oro a partir de 800 puntos.
  if (points >= 800) return { name: 'Comensal Oro 🌟', badgeColor: 'bg-amber-400 text-slate-900', nextGoal: 2000 };
  // Nivel Plata inicial por defecto.
  return { name: 'Comensal Plata 🥈', badgeColor: 'bg-slate-300 text-slate-800', nextGoal: 800 };
};

// Store Zustand `useRewardsStore`.
export const useRewardsStore = create((set, get) => ({
  // Puntos iniciales acumulados del comensal.
  points: 1250,
  // Lista de recompensas canjeadas en la sesión.
  redeemedRewards: [],

  // Suma puntos al realizar un pago o dejar propina (ej. 10 pts por cada $1.000 + 50 pts por propina).
  addPoints: (amountSpent, tipAmount = 0) => {
    // Calcula los puntos base ganados por el total gastado en CLP.
    const basePoints = Math.floor(amountSpent / 100);
    // Asigna 50 puntos de bono si el cliente dejó propina digital.
    const tipBonus = tipAmount > 0 ? 50 : 0;
    // Puntos totales a acreditar.
    const earned = basePoints + tipBonus;

    // Actualiza el acumulado en el estado del store.
    set((prev) => ({
      points: prev.points + earned,
    }));

    // Retorna el valor acreditado en la transacción.
    return earned;
  },

  // Canjea una recompensa del catálogo si los puntos son suficientes.
  redeemReward: (rewardId) => {
    // Obtiene el estado actual.
    const { points, redeemedRewards } = get();
    // Busca la recompensa seleccionada en el catálogo.
    const reward = REWARDS_CATALOG.find((r) => r.id === rewardId);

    // Valida si existe la recompensa y si los puntos alcanzan.
    if (!reward || points < reward.pointsCost) {
      return false;
    }

    // Descuenta los puntos e inserta la recompensa canjeada con un código único.
    const newRedeemed = {
      ...reward,
      redeemedAt: Date.now(),
      code: `REW-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    // Actualiza el estado global.
    set({
      points: points - reward.pointsCost,
      redeemedRewards: [newRedeemed, ...redeemedRewards],
    });

    // Retorna éxito en la operación.
    return true;
  },
}));
