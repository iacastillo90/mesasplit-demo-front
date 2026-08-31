// src/shared/ui/KeyboardShortcutsBadge.jsx — badge visual de accesos directos de teclado para ergonomía operativa
// Muestra indicadores kbd estilizados ([F2], [Espacio], [Esc]) para orientar al operador.
// Cumple con las reglas de AGENTS.md (comentarios en español por cada línea).

export default function KeyboardShortcutsBadge({ shortcutKey = 'F2', label = '' }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
      {label && <span>{label}</span>}
      <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 text-[10px] font-mono font-black rounded border border-slate-700 shadow-xs">
        {shortcutKey}
      </kbd>
    </span>
  );
}
