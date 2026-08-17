// src/features/CorporateView/services/whatIfService.js — función pura de simulación What-If (corporate-what-if)
// Calcula proyecciones lineales de ventas y ganancias al modificar hipotéticamente el precio de un producto.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

export function simulatePriceChange(product, newPrice, baseSales = 200000) {
  const currentPrice = Number(product?.price ?? 10000);
  const cost = Number(product?.cost ?? 5000);
  const targetPrice = Number(newPrice);

  if (currentPrice <= 0 || targetPrice <= 0) {
    return { projectedSales: 0, projectedProfit: 0, marginPercentage: 0, hasWarning: true };
  }

  // Ratio de variación de precio.
  const priceRatio = targetPrice / currentPrice;

  // Proyección lineal de ventas.
  const projectedSales = baseSales * priceRatio;

  // Margen unitario y porcentaje de margen del nuevo precio.
  const unitProfit = targetPrice - cost;
  const marginPercentage = (unitProfit / targetPrice) * 100;

  // Ganancia proyectada total.
  const projectedProfit = projectedSales * (unitProfit / targetPrice);

  // Alerta si el precio es menor o igual al costo (margen nulo o negativo).
  const hasWarning = unitProfit <= 0;

  return {
    projectedSales,
    projectedProfit,
    marginPercentage,
    hasWarning,
  };
}
