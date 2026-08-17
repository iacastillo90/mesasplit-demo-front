// src/features/CorporateView/components/GlobalConfigToggles.jsx — conmutadores globales de configuración de franquicia (super-admin-corporate)
// Permite a la gerencia corporativa activar o desactivar reglas operacionales en todas las sucursales (Ley 40h, Alergias, DTE).
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Componente de switches de configuración corporativa.
export default function GlobalConfigToggles({ featureToggles, onToggleFeature }) {
  return (
    // Sección contenedora del panel de configuración global.
    <section aria-label="Configuración Global de Franquicia" className="flex flex-col gap-4 rounded-3xl bg-white p-6 border border-brand-200 shadow-soft">
      {/* Encabezado del panel de configuración. */}
      <div>
        <h2 className="text-base font-bold text-brand-900">Configuración Global de Franquicia</h2>
        <p className="text-xs text-brand-800/70">Master switches para la aplicación de reglas de negocio en todas las sucursales</p>
      </div>

      {/* Lista de conmutadores de características operacionales. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { key: 'ley40h', label: 'Control Ley 40 Horas', desc: 'Exigir PIN inicial para marcaje de mozos' },
          { key: 'allergyShield', label: 'Escudo de Alergias', desc: 'Destacar en rojo estricto #EF4444 ítems con alergia' },
          { key: 'autoDte', label: 'Auto-Emisión DTE SII', desc: 'Generar Boleta Electrónica automática tras pago' },
        ].map((item) => (
          // Tarjeta de switch individual.
          <label
            key={item.key}
            className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl bg-brand-50 p-4 border border-brand-200 hover:border-brand-400 transition"
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold text-brand-900">{item.label}</span>
              <span className="text-[11px] text-brand-800/70">{item.desc}</span>
            </div>

            {/* Switch / Checkbox interactivo. */}
            <input
              type="checkbox"
              aria-label={item.label}
              checked={!!featureToggles[item.key]}
              onChange={() => onToggleFeature(item.key)}
              className="h-5 w-5 rounded text-brand-500 focus:ring-brand-500 shrink-0"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
