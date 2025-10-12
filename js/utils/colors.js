const hexToRgb = hex => {
  let hexStr = String(hex || '').replace('#', '');

  if (hexStr.length === 3)
    hexStr = hexStr
      .split('')
      .map(x => x + x)
      .join('');
  const num = parseInt(hexStr, 16);

  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};
const relLum = c => {
  const ch = v => {
    const normalized = v / 255;

    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
};

export const contrastColor = bg => {
  const L = relLum(hexToRgb(bg));

  return L > 0.5 ? '#000' : '#fff';
};
export const mutedFor = bg =>
  contrastColor(bg) === '#000' ? 'rgba(0,0,0,.72)' : 'rgba(255,255,255,.72)';
export const borderOn = bg => {
  const L = relLum(hexToRgb(bg));

  return L > 0.5 ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.25)';
};
export const initials = txt => {
  const txtStr = String(txt || '');
  const p = txtStr.trim().split(/\s+/);
  const ini = p
    .slice(0, 2)
    .map(x => x[0] || '')
    .join('')
    .toUpperCase();

  return ini || 'SO';
};
