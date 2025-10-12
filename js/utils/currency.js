// FSM incremental para input de moneda (es-CO)
export function formatThousands(s) {
  s = String(s).replace(/^0+(?=\d)/g, '');
  if (!s) s = '0';
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function createCurrencyFSM() {
  let intPart = '0';
  let decPart = '';
  let hasDec = false;

  function getDisplay() {
    const intFmt = formatThousands(intPart);

    return hasDec ? intFmt + ',' + decPart : intFmt;
  }

  function inputDigit(d) {
    if (!/^[0-9]$/.test(d)) return;
    if (!hasDec) {
      if (intPart === '0') intPart = d;
      else intPart += d;
    } else if (decPart.length < 2) decPart += d;
  }

  function inputSep() {
    if (!hasDec) hasDec = true;
  }

  function backspace() {
    if (hasDec && decPart.length > 0) {
      decPart = decPart.slice(0, -1);
      return;
    }
    if (hasDec && decPart.length === 0) {
      hasDec = false;
      return;
    }
    // borrar entero
    if (intPart.length > 1) intPart = intPart.slice(0, -1);
    else intPart = '0';
  }

  function reset() {
    intPart = '0';
    decPart = '';
    hasDec = false;
  }

  function pad2() {
    if (!hasDec) {
      decPart = '00';
      hasDec = true;
    } else decPart = (decPart + '00').slice(0, 2);
  }

  function parseCents(display) {
    // "1.234,56" -> 123456
    const clean = String(display).replace(/\./g, '').replace(/,/g, '.');
    const [i = '0', d = ''] = clean.split('.', 2);
    const ii = String(i).replace(/\D/g, '') || '0';
    const dd = (String(d).replace(/\D/g, '') + '00').slice(0, 2);

    return parseInt(ii, 10) * 100 + parseInt(dd, 10);
  }

  return { getDisplay, inputDigit, inputSep, backspace, reset, pad2, parseCents };
}
