# Proposal: fase5-experiencia-integral-saas — Experiencia Integral SaaS Premium

## Intent

Completar la transformación UX de **MesaSplit** abarcando el 100% de las 4 áreas clave solicitadas:
1. **MesaSplit Rewards**: Programa de fidelización y gamificación con niveles, puntos por propina/pago y canje instantáneo de recompensas.
2. **Reviews por Plato**: Feedback gastronómico granular con estrellas, etiquetas de textura/sabor y comentarios al chef.
3. **PWA Garzón & Cocina KDS**: Calculadora de cobro en mesa para mozos, semáforo de atención crítica y modo alto contraste para lectura a distancia en cocina.
4. **Super Admin Corporativo**: Comparador multi-local en tiempo real, simulador What-If de margen y matriz de ingeniería de menú.

## Scope

### In Scope
- **Track 1**: `useRewardsStore.js` + `RewardsBadgeWidget.jsx` e integración en la Mesa Virtual.
- **Track 2**: `ItemReviewModal.jsx` con calificación de 1 a 5 estrellas por plato y resumen en tarjeta.
- **Track 3**: `QuickSplitCalculatorModal.jsx` en Garzón + visualizador KDS de alta legibilidad a distancia.
- **Track 4**: `FranchiseComparisonWidget.jsx` e integración interactiva en Super Admin Corporativo (`/admin/super`).
- **Tests Unitarios**: Pruebas en Vitest para cada uno de los nuevos stores y componentes de UI.

### Out of Scope
- Integraciones con pasarelas bancarias reales o APIs de lealtad de terceros en producción.

## Approach
Desarrollo en 4 fases lógicas con TDD (`strict_tdd: true`), comentarios por línea en español y commits convencional en español justificando decisiones técnicas.
