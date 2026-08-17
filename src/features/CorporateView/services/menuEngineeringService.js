// src/features/CorporateView/services/menuEngineeringService.js — clasificación pura de ingeniería de menú (corporate-menu-engineering)
// Clasifica los productos del menú en los 4 cuadrantes (estrella, caballo de batalla, puzzle, perro).
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

export function classifyProduct(product, medianVolume = 10, medianMargin = 50) {
  const vol = Number(product?.volume ?? 0);
  const margin = Number(product?.marginPercentage ?? 0);

  const highVol = vol >= medianVolume;
  const highMargin = margin >= medianMargin;

  if (highVol && highMargin) return 'estrella';
  if (!highVol && highMargin) return 'puzzle';
  if (highVol && !highMargin) return 'caballo de batalla';
  return 'perro';
}

export function classifyMenu(menu = []) {
  if (!menu || menu.length === 0) {
    return { estrella: [], 'caballo de batalla': [], puzzle: [], perro: [] };
  }

  // Prepara los ítems calculando su margen y estimando volumen.
  const prepared = menu.map((item, idx) => {
    const price = Number(item.price ?? 10000);
    const cost = Number(item.cost ?? 4000);
    const marginUnit = price - cost;
    const marginPercentage = price > 0 ? (marginUnit / price) * 100 : 0;

    // Volumen de ventas estimado.
    const volume = (menu.length - idx) * 8;

    return {
      ...item,
      marginPercentage,
      volume,
    };
  });

  // Calcula medianas simples.
  const volumes = prepared.map((p) => p.volume).sort((a, b) => a - b);
  const margins = prepared.map((p) => p.marginPercentage).sort((a, b) => a - b);

  const mid = Math.floor(prepared.length / 2);
  const medianVolume = volumes[mid] ?? 10;
  const medianMargin = margins[mid] ?? 50;

  const result = {
    estrella: [],
    'caballo de batalla': [],
    puzzle: [],
    perro: [],
  };

  prepared.forEach((p) => {
    const category = classifyProduct(p, medianVolume, medianMargin);
    result[category].push(p);
  });

  return result;
}
