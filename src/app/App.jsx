// src/app/App.jsx — componente raíz del frontend MesaSplit
// PR 1: placeholder mínimo para que el toolchain compile (build verde).
// PR 2 (task 2.1): será reemplazado por <RouterProvider> con la tabla de rutas.

// Componente raíz: devuelve un contenedor que valida el pipeline de Tailwind.
export default function App() {
  return (
    // Fondo de marca y fuente Inter desde los tokens (verifica @tailwind).
    <main className="flex min-h-screen items-center justify-center bg-brand-50">
      {/* Texto de arranque: confirma que Vite + React + Tailwind renderizan. */}
      <h1 className="text-2xl font-bold text-brand-900">MesaSplit — scaffold listo</h1>
    </main>
  );
}
