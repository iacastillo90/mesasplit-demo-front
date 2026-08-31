// src/features/CorporateView/components/MenuEngineeringMatrix.jsx — matriz de ingeniería de menú (corporate-menu-engineering)
// Componente presentacional read-only que muestra la clasificación en 4 cuadrantes con recomendaciones operativas.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

import { useDemoStore } from '../../../store/useDemoStore.js';
import { useCorporateStore } from '../store/useCorporateStore.js';
import { classifyMenu } from '../services/menuEngineeringService.js';
import { formatCurrency } from '../../../shared/utils/index.js';

export default function MenuEngineeringMatrix() {
  const menu = useDemoStore((s) => s.menu);
  const franchiseEvents = useCorporateStore((s) => s.franchiseEvents);

  const matrix = classifyMenu(menu, franchiseEvents);

  const quadrants = [
    {
      key: 'estrella',
      title: '🌟 Estrellas',
      subtitle: 'Alto Volumen · Alto Margen',
      recommendation: 'Mantener estándar y proteger receta. Promocionar en menú.',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      badge: 'bg-emerald-600 text-white',
      items: matrix.estrella,
    },
    {
      key: 'caballo de batalla',
      title: '🐎 Caballos de Batalla',
      subtitle: 'Alto Volumen · Bajo Margen',
      recommendation: 'Revisar costos de insumos y ajustar porción para subir margen.',
      color: 'bg-amber-50 border-amber-200 text-amber-950',
      badge: 'bg-amber-600 text-white',
      items: matrix['caballo de batalla'],
    },
    {
      key: 'puzzle',
      title: '🧩 Puzzles',
      subtitle: 'Bajo Volumen · Alto Margen',
      recommendation: 'Aumentar visibilidad con fotos de alta calidad y sugerencia del garzón.',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-950',
      badge: 'bg-indigo-600 text-white',
      items: matrix.puzzle,
    },
    {
      key: 'perro',
      title: '🐕 Perros',
      subtitle: 'Bajo Volumen · Bajo Margen',
      recommendation: 'Evaluar eliminación de la carta o rediseño total de la receta.',
      color: 'bg-rose-50 border-rose-200 text-rose-950',
      badge: 'bg-rose-600 text-white',
      items: matrix.perro,
    },
  ];

  return (
    <div aria-label="Matriz de Ingeniería de Menú" className="rounded-2xl bg-white p-5 shadow-soft border border-brand-100 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-brand-100 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-500">📊 Matriz de Ingeniería de Menú (BCG Matrix)</h3>
        <span className="text-[10px] font-semibold text-brand-800/60">Análisis Operativo Read-Only</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((q) => (
          <div key={q.key} className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 ${q.color}`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">{q.title}</h4>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${q.badge}`}>
                  {q.items.length} platos
                </span>
              </div>
              <p className="text-[11px] font-semibold opacity-80">{q.subtitle}</p>
            </div>

            <div className="flex flex-col gap-1.5 py-1">
              {q.items.length === 0 ? (
                <p className="text-[11px] opacity-60 italic">Sin productos en este cuadrante.</p>
              ) : (
                q.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs font-medium">
                    <span>{item.name}</span>
                    <span className="font-bold">{formatCurrency(item.price)} ({item.marginPercentage.toFixed(0)}% mgn)</span>
                  </div>
                ))
              )}
            </div>

            <p className="text-[10px] font-medium border-t border-black/10 pt-2 opacity-90">
              💡 <strong>Estrategia:</strong> {q.recommendation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
