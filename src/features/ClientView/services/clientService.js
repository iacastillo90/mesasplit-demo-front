// src/features/ClientView/services/clientService.js — servicio del cliente (task 2.5)
// Capa de datos de la Mesa Virtual: expone el menú y el contexto de la mesa.
// La capa de servicios (design) aísla a la página del origen de los datos.
// NOTA PR3 → PR4: hoy devuelve fixtures inline con latencia simulada; en PR 4
// el task 3.1 crea src/mocks/mockFetch.js (~300ms) + mocks/menu.json, y este
// servicio pasa a llamar esa capa (design "service → mockFetch → mocks").

// Helper local: simula la latencia de red del diseño (~300ms) resolviendo data.
// Replica el contrato de mockFetch que llega en PR 4, para no cambiar la firma.
function fakeLatency(data) {
  // Retorna una promesa que resuelve pasada la ventana de 300ms.
  return new Promise((resolve) => {
    // setTimeout aplaza la resolución simulando el viaje de red.
    setTimeout(() => resolve(data), 300);
  });
}

// Menú demo del restaurante (shapes de dominio, sin backend).
// Cada ítem: id, nombre, descripción, precio CLP, categoría y alergias.
const DEMO_MENU = [
  {
    // Identificador estable del ítem (clave en carrito y listas).
    id: 'm1',
    // Nombre del plato tal como se muestra en el menú.
    name: 'Hamburguesa Clásica',
    // Descripción breve que vende el plato en el listado.
    description: 'Pan brioche, carne 180g, cheddar y salsa de la casa.',
    // Precio en pesos chilenos (entero, sin decimales en la demo).
    price: 8900,
    // Categoría de menú para agrupar los ítems en la página.
    category: 'Hamburguesas',
    // Alergias declaradas del plato (vacío = sin advertencias).
    allergens: [],
  },
  {
    // Identificador estable del ítem.
    id: 'm2',
    // Nombre del plato.
    name: 'Hamburguesa BBQ Bacon',
    // Descripción del plato con bacon y BBQ.
    description: 'Bacon crocante, cebolla crispy y salsa BBQ ahumada.',
    // Precio en pesos chilenos.
    price: 10400,
    // Categoría de menú.
    category: 'Hamburguesas',
    // Alergias: contiene gluten (pan) y maní no; se declara solo lo relevante.
    allergens: ['gluten'],
  },
  {
    // Identificador estable del ítem.
    id: 'm3',
    // Nombre del plato.
    name: 'Pizza Margherita',
    // Descripción del plato italiano clásico.
    description: 'Mozzarella fresca, tomate y albahaca sobre masa artesanal.',
    // Precio en pesos chilenos.
    price: 10900,
    // Categoría de menú.
    category: 'Pizzas',
    // Alergias: lácteos y gluten declarados.
    allergens: ['lácteos', 'gluten'],
  },
  {
    // Identificador estable del ítem.
    id: 'm4',
    // Nombre del plato.
    name: 'Carbonara',
    // Descripción del plato de pasta.
    description: 'Pasta fresca, panceta, yema y queso pecorino.',
    // Precio en pesos chilenos.
    price: 9800,
    // Categoría de menú.
    category: 'Pasta',
    // Alergias: huevo, lácteos y gluten.
    allergens: ['huevo', 'lácteos', 'gluten'],
  },
  {
    // Identificador estable del ítem.
    id: 'm5',
    // Nombre del plato.
    name: 'Ensalada César',
    // Descripción del plato fresco.
    description: 'Lechuga romana, pollo grillado, parmesano y croutons.',
    // Precio en pesos chilenos.
    price: 7400,
    // Categoría de menú.
    category: 'Ensaladas',
    // Alergias: lácteos y gluten (parmesano y croutons).
    allergens: ['lácteos', 'gluten'],
  },
  {
    // Identificador estable del ítem.
    id: 'm6',
    // Nombre del plato.
    name: 'Limonada Menta',
    // Descripción de la bebida.
    description: 'Limonada natural con menta fresca y hielo.',
    // Precio en pesos chilenos.
    price: 2900,
    // Categoría de menú.
    category: 'Bebidas',
    // Alergias: ninguna declarada.
    allergens: [],
  },
];

// Contexto demo de la mesa virtual (de dónde llega el código QR del cliente).
const DEMO_TABLE_CONTEXT = {
  // Número de mesa asignada al comensal.
  number: 12,
  // Cantidad de comensales sentados en la mesa.
  guests: 4,
  // Código corto del QR que identifica la sesión de la mesa.
  code: '4F2K',
};

// Servicio del cliente: expone el menú con la latencia simulada de red.
export function getMenu() {
  // Delega en fakeLatency: devuelve el menú demo como una promesa resuelta.
  return fakeLatency(DEMO_MENU);
}

// Servicio de contexto de mesa: banner superior de la Mesa Virtual.
export function getTableContext() {
  // Devuelve el contexto de mesa (número, comensales y código QR).
  return fakeLatency(DEMO_TABLE_CONTEXT);
}
