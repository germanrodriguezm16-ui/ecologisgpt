import { $, $$ } from '../../core/utils.js';
import { store } from '../../core/store.js';
import { renderCategorias } from './view.js';

let mounted = false;
export async function mount(root){
  mounted = true;
  $('#title').textContent = 'Socios';
  const wrapper = document.createElement('div');
  wrapper.id='sociosRoot';
  root.appendChild(wrapper);
  await renderCategorias(wrapper);
}
export function unmount(){
  mounted = false;
  const top = document.getElementById('topActions'); if(top) top.innerHTML='';
}
export function update(){};
