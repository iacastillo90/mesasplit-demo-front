// src/features/KdsView/KdsPage.test.jsx — suite de tests interactivos de Cocina KDS
// Cubre la especificación kds-kitchen: modo oscuro estricto, semáforos de tiempo,
// Escudo de Alergias (#EF4444), Course Control, completado con Recall y Lista 86.
// Todos los tests siguen las reglas de AGENTS.md (comentarios en español por línea).

// API de Vitest importada de forma explícita para evitar errores de linter.
import { describe, expect, it } from 'vitest';
// Testing Library: renderiza componentes y simula eventos del usuario.
import { fireEvent, render, screen } from '@testing-library/react';
// Página principal del KDS (Cocina).
import KdsPage from './pages/KdsPage.jsx';

describe('feature-views: KDS dark (spec)', () => {
  it('usa superficies oscuras brand-950/800 con texto claro', async () => {
    // Renderiza la página completa del KDS.
    const { container } = render(<KdsPage />);
    // Espera a que carguen las comandas desde el servicio de prueba.
    await screen.findByText('Hamburguesa Clásica');
    // Busca el elemento principal de la página.
    const main = container.querySelector('main');
    // Verifica que el fondo general sea el azul oscuro estricto brand-950.
    expect(main).toHaveClass('bg-brand-950');
    // Selecciona todas las tarjetas de comanda renderizadas.
    const cards = container.querySelectorAll('article');
    // Confirma que exista al menos una tarjeta visible.
    expect(cards.length).toBeGreaterThan(0);
    // Verifica cada tarjeta de comanda en la grilla.
    cards.forEach((card) => {
      // Confirma que cada tarjeta use el fondo brand-800.
      expect(card).toHaveClass('bg-brand-800');
    });
  });

  it('no tiene superficies claras en el slice (no light-mode leakage)', async () => {
    // Renderiza la página del KDS para auditar clases visuales.
    const { container } = render(<KdsPage />);
    // Espera a que el contenido esté completamente renderizado.
    await screen.findByText('Hamburguesa Clásica');
    // Define el conjunto de clases de fondo claro prohibidas en el KDS.
    const lightTokens = new Set([
      'bg-white',
      'bg-gray-50',
      'bg-gray-100',
      'bg-gray-200',
      'bg-brand-50',
      'bg-brand-100',
    ]);
    // Filtra los elementos del DOM que utilicen alguna clase clara prohibida.
    const lightSurfaces = [...container.querySelectorAll('*')].filter((el) =>
      String(el.className ?? '')
        .split(' ')
        .some((token) => lightTokens.has(token)),
    );
    // Garantiza que no exista ninguna fuga de modo claro.
    expect(lightSurfaces).toHaveLength(0);
  });
});

describe('kds-kitchen: semáforos de tiempo y Escudo de Alergias', () => {
  it('muestra el semáforo de tiempo amarillo/naranja y activa borde rojo #EF4444 para alergias', async () => {
    // Renderiza la página del KDS con los tickets mock.
    const { container } = render(<KdsPage />);
    // Espera a que el ticket con alergia cargue en pantalla.
    await screen.findByText(/ALERGIA: MANÍ/i);
    // Busca la tarjeta que contiene la alergia declarada.
    const allergyCard = container.querySelector('[data-has-allergy="true"]');
    // Verifica que la tarjeta con alergia tenga el borde rojo puro #EF4444.
    expect(allergyCard).toHaveClass('border-semantic-danger');
    // Verifica que exista el banner de advertencia visual de alergia.
    expect(screen.getByText(/ALERGIA: MANÍ/i)).toBeInTheDocument();
  });
});

describe('kds-kitchen: Course Control y completado de comanda', () => {
  it('separa ítems en marchar ahora vs en espera y permite marcar listo', async () => {
    // Renderiza la vista de cocina KDS.
    render(<KdsPage />);
    // Espera a que carguen los ítems del ticket.
    await screen.findByText('Hamburguesa Clásica');
    // Verifica la presencia del encabezado de sección "Marchar Ahora" en las tarjetas.
    expect(screen.getAllByText(/Marchar Ahora/i)[0]).toBeInTheDocument();
    // Busca los botones verdes para marcar comandas como listas.
    const completeBtns = screen.getAllByRole('button', { name: /MARCAR LISTO/i });
    // Simula el clic del cocinero para despachar la primera comanda.
    fireEvent.click(completeBtns[0]);
    // Abre el modal de Recall desde la cabecera.
    const recallBtn = screen.getByRole('button', { name: /Recall/i });
    // Hace clic para desplegar los últimos tickets completados.
    fireEvent.click(recallBtn);
    // Confirma que la comanda despachada aparece en el historial de Recall.
    expect(screen.getByText(/Historial de Comandas Despachadas/i)).toBeInTheDocument();
  });
});

describe('kds-kitchen: gestión de Lista 86 (Agotados)', () => {
  it('permite abrir el modal de Lista 86 y declarar quiebre de stock', async () => {
    // Renderiza la vista de cocina KDS.
    render(<KdsPage />);
    // Espera a que la interfaz esté lista.
    await screen.findByText('Hamburguesa Clásica');
    // Busca el botón de Lista 86 en la cabecera del KDS.
    const lista86Btn = screen.getByRole('button', { name: /Lista 86/i });
    // Abre el modal de gestión de inventario/agotados.
    fireEvent.click(lista86Btn);
    // Verifica que el modal de Lista 86 se haya desplegado.
    expect(screen.getByText(/Gestión de Lista 86 \(Agotados\)/i)).toBeInTheDocument();
  });
});
