// src/app/main.jsx — punto de entrada de la app MeshSplit (montaje de React)
// Carga los estilos globales y monta el árbol de la app en el nodo #root.
// NOTA: este es el arranque mínimo del PR 1 (toolchain). El RouterProvider
// completo llega en el PR 2 (task 2.1/2.2), que reemplazará App.jsx.

// createRoot: API moderna de React 18 para montar el árbol de la app.
import { createRoot } from 'react-dom/client';
// Estilos globales: directivas @tailwind (base/components/utilities).
import '../index.css';
// Componente raíz placeholder que el PR 2 reemplaza por el RouterProvider.
import App from './App.jsx';

// Busca el nodo <div id="root"> definido en index.html.
const container = document.getElementById('root');

// createRoot habilita las features concurrentes de React 18.3.
const root = createRoot(container);

// Renderiza la app dentro del nodo raíz.
root.render(<App />);
