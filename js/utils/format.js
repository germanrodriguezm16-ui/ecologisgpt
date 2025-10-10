// Formateo sencillo usado en listados: convierte número a string con separador de miles y coma decimal
export function fmt(n){ return Number(n||0).toLocaleString('es-CO',{maximumFractionDigits:2}); }

// Formateo en vivo para input de moneda colombiano.
// - acepta que el usuario escriba '.' o ',' como separador decimal
// - usa '.' como separador de miles y ',' como separador decimal en la visualización
// - limita a 2 decimales
// - preserva la posición del caret (cursor) lo mejor posible
// Uso: on input -> const {value, caret} = formatCurrencyLive(el.value, el.selectionStart); el.value = value; el.setSelectionRange(caret, caret);
export function formatCurrencyLive(rawValue, caretPos){
	if (rawValue == null) rawValue = '';
	// permitir solo dígitos, comas y puntos
	const allowed = String(rawValue).replace(/[^0-9.,]/g, '');

	// Si está vacío, devolver vacío y caret 0
	if (allowed === '') return { value: '', caret: 0 };

	// Detectar si el usuario ya escribió una coma o punto para decimal
	// Normalizar: quitamos puntos (miles) y transformamos la última coma/punto en separador decimal
	// Encontrar la posición relativa del separador decimal (última coma o punto)
	const lastComma = allowed.lastIndexOf(',');
	const lastDot = allowed.lastIndexOf('.');
	let decimalPos = Math.max(lastComma, lastDot);

	let integerPart = allowed;
	let decimalPart = '';

	if (decimalPos !== -1){
		integerPart = allowed.slice(0, decimalPos);
		decimalPart = allowed.slice(decimalPos + 1);
	}

	// Remover cualquier punto/coma del integerPart
	integerPart = integerPart.replace(/[.,]/g, '');

	// Limitar decimalPart a 2 dígitos
	if (decimalPart.length > 2) decimalPart = decimalPart.slice(0,2);

	// Formatear integerPart con separador de miles '.'
	const intClean = integerPart.replace(/^0+(?=\d)/, ''); // eliminar ceros a la izquierda
	const intWithDots = intClean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

	const formatted = decimalPart ? (intWithDots + ',' + decimalPart) : intWithDots;

	// Recalcular posición del caret: contamos cuántos caracteres no numéricos (puntos) se han insertado
	// Antes del caret original, cuántos dígitos había? Estimamos la nueva caret moviéndolo al final relativo.
	// Para simplificar y ofrecer una experiencia consistente, colocamos el caret al final del bloque donde el usuario estaba escribiendo.
	// Si queremos más precisión, podríamos mapear índice por índice, pero esta aproximación funciona bien para la mayoría de ediciones.
	let newCaret = formatted.length;
	if (typeof caretPos === 'number'){
		// calcular cuántos caracteres (dígitos) estaban antes del caret en el valor 'allowed'
		const beforeCaret = String(rawValue).slice(0, caretPos).replace(/[^0-9]/g, '');
		// posicionar caret después de esos dígitos en el formatted string
		// buscar la posición en 'formatted' donde ya se han consumido beforeCaret.length dígitos
		let digitsSeen = 0; let pos = 0;
		for (; pos < formatted.length; pos++){
			if (/[0-9]/.test(formatted[pos])) digitsSeen++;
			if (digitsSeen >= beforeCaret.length) { pos++; break; }
		}
		if (pos <= formatted.length) newCaret = pos;
	}

	return { value: formatted, caret: newCaret };
}
