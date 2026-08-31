// src/app/main.jsx — punto de entrada de la app MesaSplit (montaje de React)
// Carga los estilos globales y monta el árbol de la app en el nodo #root.
// NOTA: queda como entry point; App.jsx (task 2.1) ya monta el RouterProvider
// con la tabla de rutas de src/routes/index.jsx (task 2.2).

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
