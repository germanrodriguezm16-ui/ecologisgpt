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

	// Contar dígitos antes del caret en la entrada original (sin separadores)
	const digitsBeforeCaret = (String(rawValue).slice(0, Math.max(0, caretPos || 0)).match(/\d/g) || []).length;

		const hasComma = allowed.indexOf(',') !== -1;
		const hasDot = allowed.indexOf('.') !== -1;
	const lastComma = allowed.lastIndexOf(',');
	const lastDot = allowed.lastIndexOf('.');
	const lastSepIndex = Math.max(lastComma, lastDot);

	let integerPart = '';
	let decimalPart = '';

	if (lastSepIndex === -1){
		// no hay separador, todo son dígitos
		integerPart = allowed.replace(/[.,]/g, '');
	} else {
		const sepChar = allowed[lastSepIndex];
		const after = allowed.slice(lastSepIndex + 1).replace(/[^0-9]/g, '');
		// Heurística: si existen ambos tipos de separador, asumimos que el último es decimal
			let treatAsDecimal = false;
			// contar todos los dígitos
			const totalDigits = (allowed.match(/\d/g) || []).length;
			if (hasComma && hasDot){
				// si hay ambos, es muy probable que el último sea decimal
				treatAsDecimal = true;
			} else if (sepChar === ','){
				// coma => decimal
				treatAsDecimal = true;
			} else if (sepChar === '.'){
				// punto: por defecto tratar como miles; solo tratar como decimal si el total de dígitos es pequeño (por ejemplo <=3)
				// esto evita que 85.000 -> (borrar) 85.00 sea interpretado como 85,00
				treatAsDecimal = (after.length <= 2) && (totalDigits <= 3);
			}

		if (treatAsDecimal){
			integerPart = allowed.slice(0, lastSepIndex).replace(/[.,]/g, '');
			decimalPart = after.slice(0,2);
		} else {
			// tratar todos los separadores como miles => juntar todo en integer
			integerPart = allowed.replace(/[.,]/g, '');
			decimalPart = '';
		}
	}

	// eliminar ceros a la izquierda (mantener '0' si es cero)
	integerPart = integerPart.replace(/^0+(?=\d)/, '');
	if (integerPart === '') integerPart = '0';

	// Formatear integerPart con separador de miles '.'
	const intWithDots = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

	const formatted = decimalPart ? (intWithDots + ',' + decimalPart) : intWithDots;

	// Mapear caret: colocar el caret después de digitsBeforeCaret en el string formateado
	let newCaret = formatted.length;
	if (typeof digitsBeforeCaret === 'number'){
		let digitsSeen = 0;
		let pos = 0;
		for (; pos < formatted.length; pos++){
			if (/[0-9]/.test(formatted[pos])) digitsSeen++;
			if (digitsSeen >= digitsBeforeCaret) { pos++; break; }
		}
		if (pos <= formatted.length) newCaret = pos;
	}

	return { value: formatted, caret: newCaret };
}
