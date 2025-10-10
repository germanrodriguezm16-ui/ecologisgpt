// Formateo sencillo usado en listados: convierte número a string con separador de miles y coma decimal
export function fmt(n){ return Number(n||0).toLocaleString('es-CO',{maximumFractionDigits:2}); }

// Formateo en vivo para input de moneda colombiano.
// - acepta que el usuario escriba '.' o ',' como separador decimal
// - usa '.' como separador de miles y ',' como separador decimal en la visualización
// - limita a 2 decimales
// - preserva la posición del caret (cursor) lo mejor posible
// Uso: on input -> const {value, caret} = formatCurrencyLive(el.value, el.selectionStart); el.value = value; el.setSelectionRange(caret, caret);
// prevWasDecimal: optional boolean indicating whether previous value was treated as decimal
export function formatCurrencyLive(rawValue, caretPos, prevWasDecimal = false){
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
					// punto: por defecto tratar como miles;
					// si previamente ya estabamos en modo decimal, respetarlo (prevWasDecimal)
					// solo tratar como decimal si el total de dígitos es pequeño (por ejemplo <=3)
					treatAsDecimal = prevWasDecimal || ((after.length <= 2) && (totalDigits <= 3));
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
			// Mapear caret con correspondencia índice-a-índice para mayor precisión
			function mapCaretExact(raw, formatted, origCaret){
				// índices de dígitos en raw y formatted
				const rawDigitIdxs = [];
				for (let i=0;i<raw.length;i++) if (/\d/.test(raw[i])) rawDigitIdxs.push(i);
				const fmtDigitIdxs = [];
				for (let i=0;i<formatted.length;i++) if (/\d/.test(formatted[i])) fmtDigitIdxs.push(i);

				// detectar separador decimal en raw (coma o punto) y en formatted (coma)
				const rawLastComma = raw.lastIndexOf(',');
				const rawLastDot = raw.lastIndexOf('.');
				const rawDecSep = Math.max(rawLastComma, rawLastDot);
				const formattedDecSep = formatted.indexOf(',');

				// Si el caret estaba en la parte decimal del raw, mapear respecto a la parte decimal
				if (rawDecSep !== -1 && origCaret > rawDecSep){
					const decimalDigitsBefore = rawDigitIdxs.filter(idx => idx > rawDecSep && idx < origCaret).length;
					if (formattedDecSep !== -1){
						const pos = formattedDecSep + 1 + decimalDigitsBefore;
						return Math.min(pos, formatted.length);
					}
				}

				// De lo contrario mapear por número de dígitos antes del caret
				const digitsBefore = rawDigitIdxs.filter(idx => idx < origCaret).length;
				if (digitsBefore === 0){
					// colocar antes del primer dígito (si existe) o al inicio
					return fmtDigitIdxs.length ? fmtDigitIdxs[0] : 0;
				}
				// colocar después del dígito correspondiente
				const targetIdx = fmtDigitIdxs[Math.min(digitsBefore-1, fmtDigitIdxs.length-1)];
				if (typeof targetIdx === 'number') return Math.min(targetIdx+1, formatted.length);
				return formatted.length;
			}

			const newCaret = mapCaretExact(String(rawValue), formatted, caretPos || (String(rawValue).length));
			return { value: formatted, caret: newCaret, isDecimal: Boolean(decimalPart) };
}
