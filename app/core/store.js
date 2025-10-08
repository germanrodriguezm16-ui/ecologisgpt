export const store = {
  currentRoute: '#/socios',
  currentCat: null,
  currentCatName: '',
  prefView: localStorage.getItem('sociosViewMode') || 'cards', // 'cards'|'list'
};
export function setPrefView(v){ store.prefView=v; localStorage.setItem('sociosViewMode', v); }
