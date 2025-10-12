// Tests para utilidades DOM
// Verifica que las funciones básicas de DOM funcionen correctamente

describe('DOM Utils', () => {
  test('document should be available', () => {
    expect(document).toBeDefined();
    expect(typeof document.querySelector).toBe('function');
    expect(typeof document.querySelectorAll).toBe('function');
    expect(typeof document.createElement).toBe('function');
  });

  test('window should be available', () => {
    expect(window).toBeDefined();
    expect(typeof window.addEventListener).toBe('function');
  });

  test('createMockElement helper should work', () => {
    const element = createMockElement('div', { id: 'test' });
    expect(element).toBeDefined();
    expect(element.tagName).toBe('DIV');
    expect(element.id).toBe('test');
  });
});