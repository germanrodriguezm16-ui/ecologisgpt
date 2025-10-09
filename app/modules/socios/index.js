// app/modules/socios/index.js
import * as view from './view.js';
import { router } from '../../core/router.js';

let mounted = false, container = null;

export function mount(el){
  container = el;
  if (!mounted){
    view.mount(container);
    mounted = true;
  }
}

export function unmount(){
  if (mounted){
    view.unmount?.();
    container.innerHTML = '';
    mounted = false;
  }
}

export function update(ctx){
  if (!mounted) return;
  view.update?.(ctx);
}

// por si hubiera limpieza extra al cambio de rutas
router.on((ctx)=>{
  if (ctx.parts[0] !== 'socios' && mounted){
    unmount();
  }
});
