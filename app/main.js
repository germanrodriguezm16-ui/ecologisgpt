import { createRouter } from './core/router.js';
import * as Socios from './modules/socios/index.js';

const routes = {
  '#/socios': Socios,
  '#/pedidos': dummy('Pedidos'),
  '#/seguimiento': dummy('Seguimiento'),
  '#/clientes': dummy('Clientes'),
  '#/inventario': dummy('Inventario'),
  '#/devoluciones': dummy('Devoluciones'),
  '#/transacciones': dummy('Transacciones'),
  '#/404': dummy('Sin contenido'),
};

function dummy(name){
  return {
    mount(root){
      const card = document.createElement('div');
      card.className='card';
      card.innerHTML = `<h3>${name}</h3><p class="muted">Vista demo.</p>`;
      root.appendChild(card);
    },
    unmount(){},
  }
}

const router = createRouter(routes);
router.start();
