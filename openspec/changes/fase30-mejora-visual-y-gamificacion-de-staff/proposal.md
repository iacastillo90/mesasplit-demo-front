# Proposal: Fase 30 — Rediseño y Mejora Visual Completa del Módulo de Gamificación de Staff

## Contexto y Motivación

El usuario solicita mejorar visual y funcionalmente el módulo de **Gamificación y Ranking de Desempeño** (`StaffLeaderboard.jsx`) en la vista `/admin`. Se requiere transformar la tabla en un panel gamificado completo con podio para el Top 3 (Oro 🥇, Plata 🥈, Bronce 🥉), tarjetas de métricas por colaborador (ventas, calificación 4.9⭐, propina acumulada, tiempo de atención), barras de progreso hacia metas del turno y asignación de bonos/insignias.

## Alcance del Cambio

- **`src/features/RadarView/services/leaderboardService.js`**: [ACTUALIZADO] Enriquecer el selector de leaderboard para incluir métricas hiperrealistas: promedio de estrellas, propinas en CLP ($), tiempo promedio de atención (minutos), porcentaje de cumplimiento de metas y badges ganados (*Vendedor Estrella, Flash KDS, 5 Estrellas*).
- **`src/features/RadarView/components/StaffLeaderboard.jsx`**: [ACTUALIZADO] Rediseñar el componente con:
  - **Podio destacado de los 3 Mejores Colaboradores (🥇 Oro, 🥈 Plata, 🥉 Bronce)** con destellos y colores metálicos.
  - **Filtros por periodo (Turno | Semana | Mes) y rol**.
  - **Tabla detallada de ranking** con barras de progreso de metas individuales, insignias obtenidas y botón **"🎁 Enviar Bono / Reconocimiento"**.
  - **Soporte completo de Modo Claro ☀️ y Modo Oscuro 🌙** con `useThemeStore`.
- **`src/features/RadarView/components/StaffLeaderboard.test.jsx`**: [NUEVO/ACTUALIZADO] Agregar pruebas unitarias para validar la renderización del podio, métricas e interacción de reconocimiento.
