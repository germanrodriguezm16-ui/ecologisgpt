// Formateo sencillo usado en listados: convierte número a string con separador de miles y coma decimal
export function fmt(n) {
  return Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 2 });
}

// Formateo en vivo para input de moneda colombiano.
// - acepta que el usuario escriba '.' o ',' como separador decimal
// - usa '.' como separador de miles y ',' como separador decimal en la visualización
// - limita a 2 decimales
// - preserva la posición del caret (cursor) lo mejor posible
// Uso: on input -> const {value, caret} = formatCurrencyLive(el.value, el.selectionStart); el.value = value; el.setSelectionRange(caret, caret);
// prevWasDecimal: optional boolean indicating whether previous value was treated as decimal
export function formatCurrencyLive(rawValue, caretPos) {
  // Implementación explícita solicitada por el equipo:
  // - No insertar decimales por longitud
  // - Sólo decimales si el usuario escribió '.' o ','
  // - Formatear miles sólo en la parte entera
  // - No completar centavos durante input (opcional en blur)

  if (rawValue == null) rawValue = '';
  // 1) Normaliza: permite sólo dígitos, punto y coma
  const raw = String(rawValue).replace(/[^0-9.,]/g, '');

  // 2) Detecta si el usuario ESCRIBIÓ decimal
  const hasUserDecimal = raw.indexOf('.') !== -1 || raw.indexOf(',') !== -1;

  // 3) Normaliza decimal a punto interno
  const norm = raw.replace(/,/g, '.');

  let intPart = '';
  let decPart = '';

  if (hasUserDecimal) {
    const parts = norm.split('.', 2);

    intPart = parts[0] || '';
    decPart = parts[1] || '';
  } else {
    intPart = norm;
    decPart = '';
  }

  // 4) Limpia dígitos
  intPart = intPart.replace(/\D/g, '');
  decPart = decPart.replace(/\D/g, '');

  // 5) Formatea miles SOLO en intPart (con '.')
  // No forzamos ceros ni decimales aquí
  const intFmt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // 6) Construye display
  let display = '';

  if (hasUserDecimal) {
    if (decPart.length) {
      // mostrar hasta 2 decimales mientras escribe
      display = intFmt + ',' + decPart.slice(0, 2);
    } else {
      // usuario escribió separador pero aún no puso decimales
      display = intFmt + ',';
    }
  } else {
    display = intFmt;
  }

  // caret simple: colocarlo al final del texto formateado
  const caret = display.length;

  return { value: display, caret, isDecimal: hasUserDecimal && decPart.length > 0 };
}
