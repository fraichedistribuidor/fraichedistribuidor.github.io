'use strict';
/* =========================================================
   Distribuidor Independiente Fraiche · tienda
   Datos: productos.js (perfumes y rellenos por tamaño, window.PRODUCTOS)
   y catalogo.js (productos del Catálogo 2026 con fotos y variantes, window.CATALOGO),
   existencias.js (lo que ya tienes para entrega inmediata, window.EXISTENCIAS)
   y ajustes.js (horario, agotados, precios, promociones y reseñas; se edita con panel.html).
   Aquí: filtros, favoritos, carrito y el pedido por WhatsApp.
   ========================================================= */

// ---- ajustes de la tienda ----
// Número de WhatsApp con lada de país y sin espacios: 52 (México) + los 10 dígitos.
const WHATSAPP = '525574348740';

const CATS = [
  { id: 'todo', nombre: 'Todo', h: 172, ilus: 'set', titulo: 'Todo el catálogo' },
  { id: 'nuevo', nombre: 'Perfumes', h: 172, ilus: 'frasco', titulo: 'Perfumes', nota: 'Elige el tamaño (de 10 a 120 ml): ahí ves todos sus frascos y escoges tu aroma, en esencia de línea, neeche o árabe.' },
  { id: 'relleno', nombre: 'Rellenos', h: 38, ilus: 'relleno', titulo: 'Rellenos', nota: 'Escribe cuántos ml tiene tu frasco, o elige tu frasco Fraiche, y te digo el precio de tu relleno al momento.' },
  { id: 'existencia', nombre: 'En existencia', h: 150, ilus: 'body', titulo: 'En existencia · entrega inmediata', nota: 'Productos que ya tengo listos para entregarte hoy mismo, con foto real.' },
  { id: 'promos', nombre: 'Promociones', h: 20, ilus: 'kit', titulo: 'Promociones y precios especiales' },
  { id: 'aromas', nombre: 'Aromas', h: 38, ilus: 'frasco-chico', titulo: 'Aromas de la genealogía', nota: 'Busca tu perfume favorito por nombre, género o nota y pídelo en el tamaño que quieras.' },
  { id: 'envases', nombre: 'Envases', h: 172, ilus: 'frasco-grande', titulo: 'Envases de perfume', nota: 'Toca un tamaño para ver todos sus envases juntos; luego eliges el diseño y tu aroma. El precio depende del tamaño y la esencia.' },
  { id: 'regalos', nombre: 'Regalos', h: 38, ilus: 'kit', titulo: 'Kits y regalos' },
  { id: 'bodys', nombre: 'Bodys', h: 172, ilus: 'body', titulo: 'Lociones corporales y bodys' },
  { id: 'cremas', nombre: 'Piel', h: 38, ilus: 'crema', titulo: 'Cremas y cuidado de la piel' },
  { id: 'desodorantes', nombre: 'Desodorantes', h: 172, ilus: 'desodorante', titulo: 'Desodorantes' },
  { id: 'cabello', nombre: 'Cabello', h: 38, ilus: 'spray', titulo: 'Cuidado del cabello' },
  { id: 'maquillaje', nombre: 'Maquillaje', h: 172, ilus: 'body-glitter', titulo: 'Maquillaje y uñas' },
  { id: 'colonias', nombre: 'Colonias', h: 38, ilus: 'botella', titulo: 'Aguas de colonia' },
  { id: 'ninos', nombre: 'Niños', h: 172, ilus: 'ninos', titulo: 'Para niños' },
  { id: 'velas', nombre: 'Velas', h: 38, ilus: 'vela', titulo: 'Velas aromáticas' },
  { id: 'casa', nombre: 'Casa y auto', h: 172, ilus: 'difusor', titulo: 'Casa y auto' },
  { id: 'accesorios', nombre: 'Accesorios', h: 38, ilus: 'kit', titulo: 'Cosmetiqueras, bolsas y más' },
];
const PRINCIPALES = ['todo', 'nuevo', 'relleno', 'existencia', 'promos', 'aromas', 'envases'];
const TAGS = [
  { id: 'todo', nombre: 'Todo' },
  { id: 'existencia', nombre: 'En existencia' },
  { id: 'oferta', nombre: 'Precio especial' },
  { id: 'popular', nombre: 'Más pedidos' },
  { id: 'regalo', nombre: 'Para regalo' },
  { id: 'pura', nombre: 'Pura esencia' },
  { id: 'barato', nombre: 'Menos de $100' },
];
const ESENCIAS = [
  { id: 'linea', nombre: 'Esencia de línea', det: 'Las fragancias del catálogo' },
  { id: 'neeche', nombre: 'Esencia neeche', det: 'De nicho, más intensa' },
  { id: 'arabe', nombre: 'Esencia árabe', det: 'Cálida, dulce y amaderada' },
];
const $ = s => document.querySelector(s);
const money = n => '$' + n.toLocaleString('es-MX', n % 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {});
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ILUS = { envases: 'frasco', regalos: 'kit', bodys: 'body', cremas: 'crema', desodorantes: 'desodorante', cabello: 'spray',
  maquillaje: 'body-glitter', colonias: 'botella', ninos: 'ninos', velas: 'vela', casa: 'difusor', accesorios: 'kit' };

// género de cada frasco: tus botellas por su nombre; los envases del catálogo por su sección (Dúo = para ambos)
const CABALLERO = ['lucha-libre', 'linea-aaa-perfumes'];
function generoFrasco(p, v) {
  const n = (v && v.n) || '';
  if (/^Dama y caballero/i.test(n)) return 'Ambos';
  if (/^Dama/.test(n) || /Woman|Abril|Her Desire|Desire/.test(n)) return 'Dama';
  if (/^Caballero/.test(n) || /Torso Man|Marine|Legend/.test(n)) return 'Caballero';
  if (p.genero === 'Dama' || p.genero === 'Caballero') return p.genero;
  if (p.id === 'nicola-porcella' || CABALLERO.includes(p.id)) return 'Caballero';
  return 'Ambos';
}

/* ---------- envases agrupados por tamaño ---------- */
// Cada "Perfume X ml" junta tus frascos (productos.js) y todos los envases del catálogo de ese tamaño, así al tocar
// un tamaño se ven todos sus envases juntos. Los que ya están entre tus frascos (misma botella y color) no se repiten.
const YA_ESTAN = { 'torso-woman-man': ['Torso Man (caballero) · teal · 120 ml', 'Torso Woman (dama) · rojo · 100 ml'], 'ice-120': ['Rosa'],
  liliana: ['Transcendent pink 60 ml', 'Lila 60 ml', 'Rosa 60 ml', 'Rosa 30 ml', 'Melón 30 ml'], perseo: ['Turquesa', 'Índigo'],
  'for-men': ['Cristalino turquesa', 'Humo azul', 'Esmeralda'], heel: ['Azul'], 'perfumeros-4you-vibes': ['Peace amarillo'] };
const sinMl = s => s.replace(/\s*·?\s*\d+ ml\b/i, '').trim().replace(/^·\s*/, '');
const minus = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// Todos los envases van con su tamaño (también Copa, Pulpy, Capibu, Human, Mystic Vibrations y Lucha libre, que son
// rellenables y se venden como nuevos), menos Nicola Porcella, que va por aparte.
const APARTE = ['nicola-porcella', 'fantasy-colonia'];
const TAMANOS = new Set((window.PRODUCTOS || []).filter(p => p.cat === 'nuevo' && p.ml).map(p => +p.ml));
const tamanoDe = (e, v) => +((v && v.ml) || e.envase);
const ENVASES = (window.CATALOGO || []).filter(p => p.envase && !APARTE.includes(p.id)
  && (p.var && p.var.length ? p.var.some(v => TAMANOS.has(tamanoDe(p, v))) : TAMANOS.has(p.envase)));
for (const nuevo of (window.PRODUCTOS || []).filter(p => p.cat === 'nuevo' && p.ml)) {
  nuevo.var = (nuevo.var || []).map(v => ({ ...v, g: generoFrasco(nuevo, v) }));
  for (const e of ENVASES) {
    const vs = e.var && e.var.length ? e.var.map(v => [v, v.ml || e.envase]) : [[null, e.envase]];
    for (const [v, ml] of vs) {
      if (String(ml) !== nuevo.ml || (v && (YA_ESTAN[e.id] || []).includes(v.n))) continue;
      const base = sinMl(e.nombre), resto = v ? sinMl(v.n) : '', palabra = minus(base).split(' ')[0];
      const n = !resto ? base : minus(resto).includes(palabra) ? resto : `${base} · ${resto}`;
      nuevo.var.push({ n, img: (v && v.img) || e.img, precios: (v && v.precios) || e.precios, g: generoFrasco(e, v), de: e.id });
    }
  }
}
const AGRUPADOS = new Set(ENVASES.map(e => e.id));
// frascos Fraiche por tamaño, de mayor a menor, para la calculadora de rellenos
const FRASCOS_FR = (window.PRODUCTOS || []).filter(p => p.cat === 'nuevo' && p.ml && p.var && p.var.length)
  .sort((a, b) => b.ml - a.ml).map(p => [p.ml, [...new Set(p.var.map(v => v.n.replace(/^(Dama y caballero|Dama|Caballero) · /, '')))]]);

/* ---------- relleno a tu medida: el cliente trae su frasco de cualquier marca, desde 10 ml ---------- */
// El precio sale de los rellenos de la lista: entre dos tamaños se reparte en proporción; arriba de 120 ml, al precio por ml del de 120.
const ML_MIN = 10, ML_MAX = 250;
const RELL = (window.PRODUCTOS || []).filter(p => p.cat === 'relleno' && p.ml && !p.medida && !p.tags.includes('pura'))
  .map(p => ({ ml: +p.ml, pr: p.precios })).sort((a, b) => a.ml - b.ml);
function precioMedida(ml) {
  const out = {};
  for (const e of ['linea', 'neeche', 'arabe']) {
    const r = RELL.filter(x => x.pr[e] != null); if (!r.length) continue;
    const hi = r.find(x => x.ml >= ml), lo = [...r].reverse().find(x => x.ml <= ml);
    out[e] = !hi ? Math.round(ml * lo.pr[e] / lo.ml) : !lo || lo.ml === hi.ml ? hi.pr[e]
      : Math.round(lo.pr[e] + (hi.pr[e] - lo.pr[e]) * (ml - lo.ml) / (hi.ml - lo.ml));
  }
  return out;
}
for (const p of (window.PRODUCTOS || []).filter(p => p.medida)) {
  p.var = Array.from({ length: ML_MAX - ML_MIN + 1 }, (_, i) => ({ n: `${ML_MIN + i} ml`, ml: ML_MIN + i, precios: precioMedida(ML_MIN + i) }));
  p.precios = p.var[0].precios;
}

// Un solo formato para todo: los productos del catálogo se adaptan al de productos.js.
// Los de productos.js que ya vienen del catálogo con nombre y foto (kits, figuras) se quitan.
const REPETIDOS = ['kit-for-you', 'set-destilados'];
// primero los perfumes (nuevos y rellenos), después el resto del catálogo
const PERF = (window.PRODUCTOS || []).filter(p => (p.cat === 'nuevo' || p.cat === 'relleno' || p.mostrar) && !REPETIDOS.includes(p.id));
const AJ = Object.assign({ negocio: {}, agotados: [], precios: {}, promociones: [], resenas: [] }, window.AJUSTES || {});
/* ---------- bodys: un solo "Body mist 250 ml" ($89) y un solo "Body mist 100 ml" ($60) ---------- */
// Juntan los diseños que tienes en existencia (primero, marcados) y todos los del catálogo de esa medida,
// sin repetir nombres. Los bodys sueltos del catálogo ya no salen en la lista (el buscador sí los encuentra).
// Los sprays Neeche Passion del catálogo son los mismos que tienes en existencia ($116).
const BODY_ALIAS = { heavenwishper: 'heavenwhisper' };
const claveBody = n => { const k = minus(n).replace(/[^a-z]/g, ''); return BODY_ALIAS[k] || k; };
const nombreBody = p => p.nombre.replace(/\s*·.*$/, '').replace(/\s*loci[oó]n\b.*$/i, '').trim();
(function juntaBodys() {
  const ex = Object.fromEntries((window.EXISTENCIAS || []).map(p => [p.id, p]));
  const grupos = { 250: ex['ex-body-250'], 100: ex['ex-body-100'] };
  for (const g of Object.values(grupos)) if (g) g.var = (g.var || []).map(v => ({ ...v, ex: true }));
  const ya = { 250: new Set(), 100: new Set() };
  for (const [ml, g] of Object.entries(grupos)) if (g) g.var.forEach(v => ya[ml].add(claveBody(v.n)));
  for (const p of (window.CATALOGO || []).filter(p => p.cat === 'bodys' && !p.prox)) {
    const mlDe = s => (String(s || '').match(/(\d+)\s*ml/) || [])[1];
    const items = p.var && p.var.length ? p.var.map(v => [v, mlDe(v.n) || mlDe(p.cont)]) : [[null, mlDe(p.cont)]];
    if (!items.every(([, ml]) => grupos[ml])) continue;          // otra medida (p. ej. 200 ml): se queda como está
    for (const [v, ml] of items) {
      const limpio = v ? v.n.replace(/\s*\d+\s*ml\b/i, '').trim() : '';
      const n = limpio || nombreBody(p), k = claveBody(n);
      if (ya[ml].has(k)) continue;
      ya[ml].add(k);
      grupos[ml].var.push({ n, img: (v && v.img) || p.img, notas: (v && v.notas) || p.notas });
    }
    AGRUPADOS.add(p.id);
  }
  AGRUPADOS.add('neeche-sprays');
  // la línea Clean del catálogo decía "Próximamente", pero ya la tienes en existencia (Línea Clean y Relax Time)
  ['skincare-agua-micelar', 'skincare-serum', 'skincare-contorno', 'skincare-crema'].forEach(id => AGRUPADOS.add(id));
})();

// lo que ya tienes: mismo formato que el resto (precio único o por opción)
const EXIST = (window.EXISTENCIAS || []).map(p => ({
  ...p, existencia: true, ilus: ILUS[p.cat] || 'frasco', detalle: [p.tipo, p.cont].filter(Boolean).join(' · '),
  precios: p.precio != null ? { linea: p.precio } : p.var && p.var.some(v => v.precio != null) ? undefined : null,
  img: p.img || (p.var && p.var[0] && p.var[0].img), tags: ['existencia'],
}));
const P = [
  ...PERF.filter(p => p.cat === 'nuevo'), ...PERF.filter(p => p.cat === 'relleno'), ...EXIST, ...PERF.filter(p => p.mostrar),
  ...(window.CATALOGO || []).map(p => ({
    ...p,
    detalle: [p.tipo, p.cont].filter(Boolean).join(' · '),
    ilus: ILUS[p.cat] || 'frasco',
    tags: [...(p.esp ? ['oferta'] : []), ...(p.cat === 'regalos' ? ['regalo'] : [])],
  })),
];
const byId = Object.fromEntries(P.map(p => [p.id, p]));
// ajustes.js: precios cambiados y agotados (todo el producto, o 'id:Nombre de la opción')
for (const [id, pr] of Object.entries(AJ.precios || {})) if (byId[id]) byId[id].precios = { ...(byId[id].precios || {}), ...pr };
for (const a of AJ.agotados || []) {
  const [id, ...resto] = String(a).split(':'), p = byId[id.trim()], vn = resto.join(':').trim();
  if (!p) continue;
  if (!vn) p.agotado = true;
  else (p.var || []).filter(v => v.n.toLowerCase() === vn.toLowerCase()).forEach(v => { v.agotado = true; });
}
for (const p of P) if (p.var && p.var.some(v => v.agotado) && p.var.every(v => v.agotado)) p.agotado = true;
const PROMO_IDS = new Set((AJ.promociones || []).map(x => x.producto).filter(Boolean));
const PROMO_CATS = new Set((AJ.promociones || []).map(x => x.categoria).filter(Boolean));
const catOf = id => CATS.find(c => c.id === id) || CATS[0];
// precios de una variante (o del producto si no tiene variante o la variante no cambia el precio)
const preciosDe = (p, v) => {
  const x = p.var && p.var[v];
  if (x && x.precios) return x.precios;
  if (x && x.precio != null) return { linea: x.precio };
  return p.precios || null;
};
const minPrice = p => {
  const all = [p.precios, ...(p.var || []).map((_, i) => preciosDe(p, i))].filter(Boolean).flatMap(o => Object.values(o));
  return all.length ? Math.min(...all) : null;
};
const varias = p => !!p.var && p.var.some((_, i) => JSON.stringify(preciosDe(p, i)) !== JSON.stringify(preciosDe(p, 0)));
const pideAroma = p => p.cat === 'nuevo' || p.cat === 'relleno' || !!p.aroma;

/* ---------- dibujos (sin fotos todavía) ---------- */
const soft = 'fill="currentColor" fill-opacity=".14"';
const label = (x, y, t, s = 13) => t ? `<text x="${x}" y="${y}" text-anchor="middle" font-size="${s}" font-weight="800" fill="currentColor" stroke="none">${t}</text>` : '';
function bottle(cx, top, w, h, ml, opt = {}) {
  const neckW = w * .34, neckH = h * .16, capW = w * .58, capH = h * .3, bodyY = top + capH + neckH;
  return `<rect x="${cx - capW / 2}" y="${top}" width="${capW}" height="${capH}" rx="${capW * .16}" fill="currentColor" stroke="none"/>
    <rect x="${cx - neckW / 2}" y="${top + capH}" width="${neckW}" height="${neckH}" ${soft}/>
    <rect x="${cx - w / 2}" y="${bodyY}" width="${w}" height="${h}" rx="${w * .2}" ${soft}/>
    <path d="M${cx - w / 2 + 8} ${bodyY + 10}v${h * .45}" stroke-width="3" opacity=".5"/>
    ${opt.star ? `<path d="M${cx} ${bodyY + h * .3}l3.4 7 7.6 1.1-5.5 5.4 1.3 7.6L${cx} ${bodyY + h * .3 + 17.5}l-6.8 3.6 1.3-7.6-5.5-5.4 7.6-1.1z" fill="currentColor" stroke="none"/>`
      : label(cx, bodyY + h * .62, ml ? ml + ' ml' : '', Math.max(10, w * .2))}`;
}
const svg = body => `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const DROP = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0C0 0-12 15-12 23a12 12 0 0024 0C12 15 0 0 0 0z" fill="currentColor" stroke="none"/>`;
const ART = {
  'frasco-grande': ml => svg(bottle(60, 10, 70, 74, ml)),
  'frasco': ml => svg(bottle(60, 16, 62, 64, ml)),
  'frasco-chico': ml => svg(bottle(60, 26, 50, 56, ml)),
  'roll-on': ml => svg(`<rect x="47" y="12" width="26" height="30" rx="9" fill="currentColor" stroke="none"/><rect x="44" y="40" width="32" height="68" rx="14" ${soft}/>${label(60, 80, ml ? ml + ' ml' : '', 11)}`),
  'relleno': ml => svg(`${bottle(70, 30, 50, 54, ml)}${DROP(28, 18, 1.1)}<path d="M40 70c-10 0-14-8-12-16" stroke-width="3"/><path d="M24 58l4-5 5 4" stroke-width="3"/>`),
  'kit': () => svg(`<rect x="22" y="54" width="76" height="52" rx="8" ${soft}/><rect x="16" y="40" width="88" height="16" rx="5" fill="currentColor" stroke="none"/><path d="M60 40v66"/><path d="M60 40c-10-16-30-14-24-4 4 6 24 4 24 4zM60 40c10-16 30-14 24-4-4 6-24 4-24 4z" ${soft}/>`),
  'set': () => svg(`${bottle(32, 40, 30, 40, '')}${bottle(60, 22, 38, 56, '')}${bottle(88, 40, 30, 40, '')}`),
  'figura': () => svg(`<circle cx="60" cy="34" r="20" fill="currentColor" stroke="none"/><circle cx="53" cy="32" r="2.6" fill="#fff" stroke="none"/><circle cx="67" cy="32" r="2.6" fill="#fff" stroke="none"/><path d="M55 41c3 2.5 7 2.5 10 0" stroke="#fff" stroke-width="2.5"/><circle cx="44" cy="18" r="6" fill="currentColor" stroke="none"/><circle cx="76" cy="18" r="6" fill="currentColor" stroke="none"/><rect x="34" y="56" width="52" height="52" rx="14" ${soft}/>`),
  'crema': () => svg(`<rect x="22" y="40" width="76" height="20" rx="6" fill="currentColor" stroke="none"/><rect x="26" y="58" width="68" height="44" rx="12" ${soft}/><path d="M38 76h44" opacity=".5"/>`),
  'crema-chica': () => svg(`<rect x="32" y="48" width="56" height="16" rx="5" fill="currentColor" stroke="none"/><rect x="35" y="62" width="50" height="36" rx="10" ${soft}/>`),
  'botella': () => svg(`<path d="M50 14h22M60 14v14M66 22h10" stroke-width="4"/><rect x="52" y="26" width="16" height="10" fill="currentColor" stroke="none"/><rect x="38" y="36" width="44" height="72" rx="14" ${soft}/><path d="M48 60h24M48 70h16" opacity=".55"/>`),
  'desodorante': () => svg(`<rect x="42" y="12" width="36" height="28" rx="12" fill="currentColor" stroke="none"/><rect x="40" y="38" width="40" height="70" rx="14" ${soft}/><path d="M50 56v32" opacity=".5"/>`),
  'spray': () => svg(`<path d="M50 20h18l8 8h10M78 28l-6 8" stroke-width="4"/><rect x="48" y="18" width="20" height="18" rx="4" fill="currentColor" stroke="none"/><rect x="40" y="36" width="36" height="72" rx="14" ${soft}/><path d="M90 24h4M92 32h6M90 40h4" stroke-width="2.5"/>`),
  'ninos': () => svg(bottle(60, 22, 56, 60, '', { star: true })),
  'difusor': () => svg(`<path d="M60 64L60 10M60 64L42 14M60 64L78 14M60 64L32 26M60 64L88 26" stroke-width="2.5"/><rect x="50" y="58" width="20" height="10" fill="currentColor" stroke="none"/><rect x="34" y="66" width="52" height="42" rx="14" ${soft}/>`),
  'auto': () => svg(`<path d="M60 12v20" stroke-width="2.5"/><circle cx="60" cy="12" r="4"/><rect x="52" y="30" width="16" height="12" rx="3" fill="currentColor" stroke="none"/><rect x="36" y="42" width="48" height="58" rx="22" ${soft}/><path d="M50 62c6 6 14 6 20 0" opacity=".5"/>`),
  'body': () => svg(`<rect x="50" y="12" width="20" height="22" rx="5" fill="currentColor" stroke="none"/><rect x="40" y="34" width="40" height="74" rx="16" ${soft}/><path d="M80 18h3M86 12h3M86 24h3M92 18h3" stroke-width="3"/>`),
  'body-glitter': () => svg(`<rect x="50" y="12" width="20" height="22" rx="5" fill="currentColor" stroke="none"/><rect x="40" y="34" width="40" height="74" rx="16" ${soft}/><path d="M90 20l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM28 54l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="currentColor" stroke="none"/>`),
  'vela': () => svg(`<path d="M60 18c-7 9-7 17 0 22 7-5 7-13 0-22z" fill="currentColor" stroke="none"/><path d="M60 40v10" stroke-width="2.5"/><rect x="30" y="50" width="60" height="56" rx="12" ${soft}/><path d="M30 64h60" opacity=".5"/>`),
};
const imgTag = (src, alt) => `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
const art = (p, v) => {
  const x = p.var && p.var[v];
  if (x && x.img) return imgTag(x.img, `${p.nombre} ${x.n}`);
  if (p.img) return imgTag(p.img, p.nombre);
  if (p.foto) return imgTag('fotos/' + p.foto, p.nombre);
  return (ART[p.ilus] || ART.frasco)(p.ml || '');
};

/* ---------- pantallas vacías ---------- */
const ICONO_VACIO = {
  buscar: '<circle cx="27" cy="27" r="15"/><path d="M38 38l12 12"/><path d="M21 27h12" opacity=".5"/>',
  corazon: '<path d="M32 50S12 38 12 24a10 10 0 0120-4 10 10 0 0120 4c0 14-20 26-20 26z"/>',
  bolsa: '<path d="M14 22h36l-3 28a4 4 0 01-4 4H21a4 4 0 01-4-4z"/><path d="M24 26v-6a8 8 0 0116 0v6"/>',
  frasco: '<rect x="26" y="8" width="12" height="8" rx="2"/><rect x="18" y="16" width="28" height="38" rx="8"/><path d="M26 34h12" opacity=".5"/>',
};
const SUGERENCIAS = ['vainilla', '60 ml', 'vela', 'coco', 'rosa'];
function vacio({ icono, titulo, texto, sugerir, cta, ctaCat }) {
  return `<div class="vacio-ic" aria-hidden="true"><svg viewBox="0 0 64 64">${ICONO_VACIO[icono]}</svg></div>
    <h3>${titulo}</h3><p>${texto}</p>
    ${sugerir ? `<div class="vacio-sug">${SUGERENCIAS.map(w => `<button type="button" class="pill" data-sugiere="${w}">${w}</button>`).join('')}</div>` : ''}
    ${cta ? `<button type="button" class="vacio-cta" data-cat="${ctaCat}">${cta} <span aria-hidden="true">→</span></button>` : ''}`;
}

/* ---------- estado ---------- */
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
let cat = 'todo', tag = 'todo', q = '', soloFavs = false;
const favs = new Set(store.get('fr_favs', []).filter(id => byId[id]));
// [{id, v, esencia, aroma, cant}]  v = índice de variante (-1 sin variante)
let cart = store.get('fr_cart', []).map(it => ({ v: -1, ...it }))
  .filter(it => byId[it.id] && (it.v < 0 || (byId[it.id].var && byId[it.id].var[it.v])) && (!preciosDe(byId[it.id], it.v) || preciosDe(byId[it.id], it.v)[it.esencia] != null));

/* ---------- carrusel ---------- */
// Cambia cada vez que se abre la página: novedades, productos del catálogo, aroma del día y promociones.
const AQUA = { glow: '#1aa59a', glowInk: '#0b857c' }, BEIGE = { glow: '#c9b28a', glowInk: '#8a6a3c' };
const QUIZ_SLIDE = { ...BEIGE, kick: 'Nuevo', t: '¿Qué aroma<br><em>es para ti?</em>', p: 'Contesta 4 preguntas y te recomiendo aromas a tu gusto.', cta: 'Hacer el test', quiz: true, img: 'img/botellas/30.webp' };
const PROMOS = [
  { ...BEIGE, t: 'Listo<br><em>para hoy</em>', p: 'Bodys, cremas, colonias y velas en existencia, con foto real.', cta: 'Ver en existencia', cat: 'existencia', img: 'img/existencia/body250-sol-de-los-cabos.webp' },
  { ...AQUA, t: 'Tu frasco,<br><em>tu medida</em>', p: 'Rellenamos tu frasco de cualquier marca desde 10 ml.', cta: 'Ver relleno a tu medida', open: 'relleno-medida', img: 'img/botellas/100.webp' },
  { ...AQUA, t: 'Tu aroma,<br><em>tu tamaño</em>', p: 'Frascos de 10 a 120 ml en esencia de línea, neeche o árabe.', cta: 'Ver perfumes', cat: 'nuevo', img: 'img/botellas/120.webp' },
  { ...BEIGE, t: 'Rellena<br><em>y ahorra</em>', p: () => `Trae tu frasco: 60 ml desde ${money(minPrice(byId['relleno-60']))}.`, cta: 'Ver rellenos', cat: 'relleno', img: 'img/botellas/60.webp' },
  { ...AQUA, t: 'Envases<br><em>de colección</em>', p: 'Más de 30 diseños para dama y caballero.', cta: 'Ver envases', cat: 'envases', img: 'img/linea-miss-3.webp' },
  { ...BEIGE, t: 'Tu casa<br><em>huele a ti</em>', p: 'Velas, difusores y aromas para el auto.', cta: 'Ver velas', cat: 'velas', img: 'img/velas-aromaticas-2.webp' },
  { ...AQUA, t: 'Regalos<br><em>que enamoran</em>', p: 'Kits, sets y bolsas de regalo listos para entregar.', cta: 'Ver regalos', cat: 'regalos', img: 'img/kit-mama.webp' },
];
const azar = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const corto = (t, n = 90) => t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
function slideProducto(p, kick, tono) {
  const m = minPrice(p);
  const sub = p.desc || p.notas || (p.var ? p.var.slice(0, 3).map(v => v.n).join(' · ') : p.detalle || '');
  return { ...tono, kick, prod: true, t: esc(p.nombre), p: esc(corto(sub)) + (m && !p.prox ? ` <b>Desde ${money(m)}</b>` : ''),
    cta: p.prox ? 'Ver novedad' : 'Ver producto', open: p.id, img: p.img };
}
let SLIDES = [];
function armaSlides() {
  const cat = P.filter(p => p.pag && p.img && !AGRUPADOS.has(p.id));
  const novedades = cat.filter(p => p.prox || p.pag <= 40);          // las primeras páginas del catálogo son las novedades
  const nov = azar(novedades).slice(0, 3).map(p => slideProducto(p, p.prox ? 'Próximamente' : 'Novedad', AQUA));
  const otros = azar(cat.filter(p => !novedades.includes(p) && minPrice(p))).slice(0, 3).map(p => slideProducto(p, 'Te va a gustar', BEIGE));
  const fav = AROMAS.filter(a => a.g === 'Dama' || a.g === 'Caballero');
  const a = fav[Math.floor(Math.random() * fav.length)];
  const aroma = a && { ...AQUA, kick: 'Aroma del día', prod: true, t: esc(a.n), p: `Inspirado olfativamente en ${esc(a.n)} · ${a.g}`, cta: 'Pedir este aroma', pedir: a.i,
    img: `img/botellas/${a.g === 'Dama' ? '30-dama-liliana-melon' : '60-caballero-perseo-turquesa'}.webp` };
  const promos = azar(PROMOS).slice(0, 3);
  // tus promociones (ajustes.js) van primero, luego lo que tienes en existencia; las novedades que aún no llegan, después
  const mias = (AJ.promociones || []).map(x => ({ ...AQUA, kick: 'Promoción', prod: true, t: esc(x.titulo || ''), p: esc(x.texto || ''),
    cta: 'Lo quiero', open: x.producto && byId[x.producto] ? x.producto : null, cat: x.categoria || 'promos',
    img: x.img || (x.producto && byId[x.producto] && byId[x.producto].img) || 'img/botellas/60.webp' }));
  const ex = azar(EXIST.filter(p => p.img && !p.agotado)).slice(0, 2).map(p => slideProducto(p, 'En existencia', BEIGE));
  const yaHay = nov.filter(s => s.kick !== 'Próximamente'), pronto = nov.filter(s => s.kick === 'Próximamente').slice(0, 1);
  const primero = mias[0] || ex[0] || yaHay[0] || promos[0];
  SLIDES = [primero, ...azar([...mias.slice(1), ...ex, ...yaHay, ...otros, aroma, ...promos, QUIZ_SLIDE].filter(s => s && s !== primero)), ...pronto].filter(Boolean);
}
function renderHero() {
  armaSlides();
  $('#slides').innerHTML = SLIDES.map((s, i) => `
    <article class="slide${s.prod ? ' prod' : ''}" id="slide${i}" style="--glow:${s.glow};--glow-ink:${s.glowInk}" aria-roledescription="destacado" aria-label="${i + 1} de ${SLIDES.length}">
      <div class="slide-txt">${s.kick ? `<span class="kick">${s.kick}</span>` : ''}<h2>${s.t}</h2><p>${typeof s.p === 'function' ? s.p() : s.p}</p>
        <button class="cta" ${s.quiz ? 'data-quiz="1"' : s.open ? `data-open="${s.open}"` : s.pedir != null ? `data-pedir="${s.pedir}"` : `data-cat="${s.cat}"`}>${s.cta} <span aria-hidden="true">→</span></button></div>
      <div class="slide-art foto"><img src="${s.img}" alt="" decoding="async"${i ? ' loading="lazy"' : ''}></div>
    </article>`).join('');
  $('#dots').innerHTML = SLIDES.map((_, i) => `<button role="tab" aria-label="Destacado ${i + 1}" aria-selected="${i === 0}" data-i="${i}"></button>`).join('');
}
const slidesEl = () => $('#slides');
function slideIndex() { const s = slidesEl(); return Math.round(s.scrollLeft / s.clientWidth); }
function goSlide(i) { const s = slidesEl(); s.scrollTo({ left: i * (s.clientWidth + 12), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
let autoplay;
function startAutoplay() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  clearInterval(autoplay);
  autoplay = setInterval(() => { if (!document.hidden) goSlide((slideIndex() + 1) % SLIDES.length); }, 5500);
}

/* ---------- categorías y filtros ---------- */
let masCats = false;
function renderCats() {
  const ver = CATS.filter(c => masCats || PRINCIPALES.includes(c.id) || c.id === cat);
  $('#cats').innerHTML = ver.map(c => `<button class="cat" style="--h:${c.h}" data-cat="${c.id}" aria-pressed="${c.id === cat && !soloFavs}">
    <span class="ring foto"><img src="img/categorias/${c.id}.webp" alt="" decoding="async"></span>${c.nombre}</button>`).join('')
    + `<button class="cat mas-cats" data-mascats="1" aria-expanded="${masCats}"><span class="ring">${masCats ? '<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>' : '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>'}</span>${masCats ? 'Menos' : 'Más'}</button>`;
  $('#pills').innerHTML = TAGS.map(t => `<button class="pill" data-tag="${t.id}" aria-pressed="${t.id === tag}">${t.nombre}</button>`).join('');
}
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const texto = p => norm([p.nombre, p.detalle, p.linea, p.genero, p.notas, p.desc, catOf(p.cat).nombre, p.ml ? p.ml + 'ml' : '',
  ...(p.var || []).flatMap(v => [v.n, v.notas])].filter(Boolean).join(' '));
function visibles() {
  const words = norm(q).split(/\s+/).filter(Boolean);
  return P.filter(p => {
    if (soloFavs && !favs.has(p.id)) return false;
    if (!soloFavs && !words.length && AGRUPADOS.has(p.id)) return false;   // ya están dentro de "Perfume X ml"
    if (!soloFavs && !words.length && p.cat === 'relleno' && !p.medida) return false;   // los rellenos se calculan en "Relleno de perfume"
    const tamano = cat === 'envases' && p.cat === 'nuevo' && p.ml;           // en Envases, un botón por tamaño
    const especial = cat === 'existencia' ? !!p.existencia : cat === 'promos' ? p.tags.includes('oferta') || PROMO_IDS.has(p.id) || PROMO_CATS.has(p.cat) : null;
    if (!soloFavs && especial === false) return false;
    if (!soloFavs && especial === null && cat !== 'todo' && p.cat !== cat && !tamano) return false;
    const m = minPrice(p);
    if (tag === 'barato' ? !(m != null && m < 100) : tag !== 'todo' && !p.tags.includes(tag)) return false;
    if (words.length) { const t = texto(p); return words.every(w => t.includes(w) || t.replace(/\s/g, '').includes(w)); }
    return true;
  });
}
function badgeOf(p) {
  if (p.agotado) return '<span class="badge dark">Agotado</span>';
  if (p.quedan) return `<span class="badge oferta">¡Últimas ${p.quedan}!</span>`;
  if (p.existencia) return '<span class="badge exist">En existencia</span>';
  if (PROMO_IDS.has(p.id)) return '<span class="badge oferta">Promoción</span>';
  if (p.prox) return '<span class="badge dark">Próximamente</span>';
  if (p.tags.includes('pura')) return '<span class="badge dark">Pura esencia</span>';
  if (p.tags.includes('oferta')) return '<span class="badge oferta">Precio especial</span>';
  if (p.tags.includes('popular')) return '<span class="badge">Más pedido</span>';
  if (p.tags.includes('regalo')) return '<span class="badge">Para regalo</span>';
  return '';
}
function card(p, i = 0) {
  const c = catOf(p.cat), m = minPrice(p);
  const desde = (p.precios && Object.keys(p.precios).length > 1) || varias(p);
  const sub = p.medida ? p.detalle : p.var && p.var.length > 1 ? `${p.detalle ? p.detalle + ' · ' : ''}${p.var.length} opciones` : p.detalle;
  return `<article class="card${p.img || p.foto ? ' con-foto' : ''}" style="--h:${c.h};--i:${i % PAGINA}">
    <button class="media" data-open="${p.id}" aria-label="Ver ${esc(p.nombre)}">${art(p, -1)}</button>
    ${badgeOf(p)}
    <button class="fav" data-fav="${p.id}" aria-pressed="${favs.has(p.id)}" aria-label="Guardar ${esc(p.nombre)} en favoritos"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg></button>
    <div class="txt">
      <h3>${esc(p.nombre)}</h3>
      <span class="det">${esc(sub || '')}</span>
      <div class="row">
        <span class="price">${m == null ? '<small>&nbsp;</small><b class="consulta">Pregunta</b>' : `${desde ? '<small>desde</small>' : '<small>&nbsp;</small>'}<b>${money(m)}</b>`}</span>
        <button class="add" data-open="${p.id}" aria-label="Agregar ${esc(p.nombre)}"><svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.5L21 8H6.2"/><path d="M13 3v6M10 6h6"/></svg></button>
      </div>
    </div>
  </article>`;
}
const PAGINA = 48;
let mostrados = PAGINA;
function renderGrid(reset = true) {
  if (reset) mostrados = PAGINA;
  if (cat === 'aromas' && !soloFavs) { renderCats(); return renderAromaGrid(); }
  renderAromaRes();
  const list = visibles(), c = catOf(cat);
  $('#titulo').textContent = soloFavs ? 'Tus favoritos' : q ? `Resultados para “${q}”` : c.titulo;
  $('#conteo').textContent = `${list.length} ${list.length === 1 ? 'producto' : 'productos'}`;
  const nota = !soloFavs && !q && c.nota;
  $('#nota').hidden = !nota; $('#nota').textContent = nota || '';
  $('#grid').innerHTML = list.slice(0, mostrados).map((p, i) => card(p, i)).join('');
  $('#mas').hidden = list.length <= mostrados;
  $('#mas').textContent = `Ver más (${list.length - mostrados})`;
  // si la búsqueda solo encontró aromas, no se muestra el aviso de "sin productos"
  const soloAromas = !list.length && !$('#aromasRes').hidden;
  document.querySelector('#productos > .list-head').hidden = soloAromas;
  $('#vacio').hidden = list.length > 0 || soloAromas;
  $('#vacio').innerHTML = soloFavs
    ? vacio({ icono: 'corazon', titulo: 'Aún no tienes favoritos', texto: 'Toca el corazón de un producto y aquí lo encuentras rápido.', cta: 'Ver perfumes', ctaCat: 'nuevo' })
    : vacio({ icono: 'buscar', titulo: q ? `No encontramos “${esc(q)}”` : 'No hay productos aquí', texto: 'Prueba con otra palabra o elige una de estas:', sugerir: true, cta: 'Ver todo el catálogo', ctaCat: 'todo' });
}
function setCat(id, scroll) {
  cat = id; soloFavs = false; renderCats(); renderGrid(); setNav('categorias');
  if (scroll) $('#productos').scrollIntoView({ behavior: 'smooth' });
}

/* ---------- producto ---------- */
let actual = null, cant = 1, vSel = -1;
function openProduct(id, op = {}) {
  const p = byId[id], c = catOf(p.cat); actual = p; cant = 1; vGen = 'todos';
  vSel = p.medida ? 30 - ML_MIN : p.var ? Math.max(0, p.var.findIndex(v => !v.agotado)) : -1;
  aromaSel = null; if (op.aroma) aromaGen = 'todos';
  const dlg = $('#dlgProducto');
  dlg.style.setProperty('--h', c.h);
  $('#pNombre').textContent = p.nombre;
  $('#pDetalle').textContent = p.cat === 'relleno' && p.ml ? `${p.detalle}. Trae tu frasco de ${p.ml} ml.` : p.medida ? `${p.detalle}. Lo rellenamos con el aroma que elijas.` : (p.detalle || '') + (p.quedan ? ` · Solo quedan ${p.quedan} piezas.` : '');
  const info = [p.notas && `<p><b>Notas:</b> ${esc(p.notas)}</p>`, p.desc && `<p>${esc(p.desc)}</p>`,
    p.incluye && `<p><b>Incluye:</b></p><ul>${p.incluye.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`].filter(Boolean).join('');
  $('#pInfo').innerHTML = info; $('#pInfo').hidden = !info;
  $('#pVar').hidden = !p.var;
  const muchos = p.var && p.var.length > 8 && !p.medida, conGen = muchos && p.var.some(v => v.g);
  const nEx = p.var ? p.var.filter(v => v.ex).length : 0;
  const leyenda = conGen ? `Elige tu frasco <small>${p.var.length} envases de ${p.ml} ml</small>`
    : muchos ? `Elige una opción <small>${p.var.length} diseños${nEx ? ` · ${nEx} en existencia` : ''}</small>` : p.var && p.var.length > 1 ? 'Elige una opción' : 'Opción';
  $('#pVar').innerHTML = p.medida ? `<legend>¿Cuántos ml tiene tu frasco?</legend>
    <div class="medida"><input id="pMl" type="number" inputmode="numeric" min="${ML_MIN}" max="${ML_MAX}" step="1" value="${ML_MIN + vSel}" aria-label="Mililitros de tu frasco"><span>ml</span></div>
    <p class="small">Desde ${ML_MIN} ml. Viene en la etiqueta o en la base del frasco; si no sabes, pon uno aproximado y lo medimos al rellenarlo.</p>
    <label class="fld" for="pFrasco">¿Es un frasco Fraiche? Elígelo y te digo su tamaño</label>
    <select id="pFrasco" class="vbusca"><option value="">No es Fraiche / no sé</option>${FRASCOS_FR.map(([ml, l]) =>
      `<optgroup label="${ml} ml">${l.map(n => `<option value="${ml}">${esc(n)} · ${ml} ml</option>`).join('')}</optgroup>`).join('')}</select>
    <div class="calc" id="pCalc" aria-live="polite"></div>`
  : p.var ? `<legend>${leyenda}</legend>`
    + (muchos ? `<input class="vbusca" id="pVarBusca" type="search" placeholder="${conGen ? 'Buscar frasco: Liliana, Perseo, Axel…' : 'Buscar por nombre'}" autocomplete="off" aria-label="Buscar">` : '')
    + (conGen ? `<div class="vgen" id="pVarGen">${['todos', 'Dama', 'Caballero'].map(g => `<button type="button" class="pill" data-vgen="${g}" aria-pressed="${g === 'todos'}">${g === 'todos' ? 'Todos' : g}</button>`).join('')}</div>` : '')
    + `<div class="vars${muchos ? ' muchos' : ''}">` + p.var.map((v, i) => `
    <label class="var${v.img ? ' con-foto' : ''}${v.agotado ? ' agotado' : ''}" data-g="${v.g || ''}" data-n="${esc(minus(v.n))}"><input type="radio" name="variante" value="${i}" ${i === vSel ? 'checked' : ''}>
      ${v.img ? `<span class="vimg">${imgTag(v.img, v.n)}</span>` : ''}<span class="vn">${esc(v.n)}${v.agotado ? ' <small>(agotado)</small>' : ''}${v.ex && !v.agotado ? '<small class="vex">En existencia</small>' : ''}</span></label>`).join('') + '</div>' : '';
  $('#pAroma').value = '';
  $('#aromaBox').hidden = !pideAroma(p);
  $('#pOpciones').innerHTML = '';
  renderVariante();
  if (op.esencia) { const r = $(`#pOpciones input[value="${op.esencia}"]`); if (r) { r.checked = true; updateBuy(); } }
  if (op.aroma) { aromaSel = op.aroma; renderAromas(); }
  dlg.showModal();
  $('#formProducto').scrollTop = 0;
}
// resultado de la calculadora de rellenos: el precio de ese tamaño en cada esencia
function renderCalc() {
  const box = $('#pCalc'); if (!box || !actual || !actual.medida) return;
  const ml = ML_MIN + vSel, pr = preciosDe(actual, vSel);
  box.innerHTML = `<span>Tu relleno de <b>${ml} ml</b></span><div>${ESENCIAS.filter(e => pr[e.id] != null)
    .map(e => `<span><small>${e.nombre.replace('Esencia ', '')}</small><b>${money(pr[e.id])}</b></span>`).join('')}</div>`;
}
function renderVariante() {
  const p = actual, x = p.var && p.var[vSel];
  $('#pMedia').innerHTML = art(p, vSel);
  $('#pMedia').classList.toggle('con-foto', !!((x && x.img) || p.img || p.foto));
  $('#pVarNotas').textContent = x && x.notas ? `Notas: ${x.notas}` : '';
  $('#pVarNotas').hidden = !(x && x.notas);
  const pr = preciosDe(p, vSel), keys = pr ? ESENCIAS.filter(e => pr[e.id] != null) : [];
  const prev = $('#pOpciones input:checked'), sel = prev && keys.some(k => k.id === prev.value) ? prev.value : keys[0] && keys[0].id;   // conserva la esencia al cambiar de opción
  $('#pOpciones').hidden = keys.length < 2;
  $('#pOpciones').innerHTML = '<legend>Esencia</legend>' + keys.map(e => `
    <label class="opt"><input type="radio" name="esencia" value="${e.id}" ${e.id === sel ? 'checked' : ''}>
      <span><b>${e.nombre}</b><small>${e.det}</small></span><b>${money(pr[e.id])}</b></label>`).join('');
  updateBuy(); renderCalc();
}
function esencia() { const r = $('#pOpciones input:checked'); return r ? r.value : (actual && preciosDe(actual, vSel) ? Object.keys(preciosDe(actual, vSel))[0] : 'linea'); }
function updateBuy() {
  $('#pCant').textContent = cant;
  const pr = preciosDe(actual, vSel), u = pr ? pr[esencia()] : null;
  const x = actual.var && actual.var[vSel], ago = actual.agotado || (x && x.agotado);
  $('#pAgregar').disabled = !!ago;
  $('#pAgregar').textContent = ago ? 'Agotado por ahora' : u == null ? 'Agregar · precio por confirmar' : `Agregar · ${money(u * cant)}`;
  renderAromas();
}

/* ---------- aromas (Guía de Tendencias / Genealogía 2026) ---------- */
const AROMAS = (window.AROMAS || []).map((a, i) => ({ ...a, i }));
const TIPO_AROMA = { linea: 'Esencia de línea', neeche: 'Esencia neeche', arabe: 'Esencia árabe', ambiental: 'Esencia ambiental' };
const slug = s => norm(s).replace(/[^a-z]+/g, '-');
AROMAS.forEach(a => { a.t = norm(`${a.n} ${a.g} ${a.nota} ${a.fam} ${TIPO_AROMA[a.e]}`); });
let aromaSel = null, aromaGen = 'todos', aGen = 'todos', aTipo = 'todos';
// difusores y productos de casa usan esencias ambientales; lo demás, la esencia elegida
const tipoAroma = () => actual.cat === 'casa' && !(actual.var && /^Perfume/.test((actual.var[vSel] || {}).n || '')) ? 'ambiental' : (TIPO_AROMA[esencia()] && esencia() !== 'ambiental' ? esencia() : 'linea');
function buscaAromas(txt, tipo, gen) {
  const w = norm(txt).split(/\s+/).filter(Boolean);
  return AROMAS.filter(a => (tipo === 'todos' || a.e === tipo) && (gen === 'todos' || a.g === gen)
    && w.every(x => a.t.includes(x) || a.t.replace(/\s/g, '').includes(x)));
}
const fichaAroma = a => `<div class="ficha"><small class="insp">Inspirado olfativamente en</small>
  <b>${esc(a.n)}</b><small>${esc(a.g)} · ${TIPO_AROMA[a.e]}</small></div>`;
function renderAromas() {
  if (!actual || !pideAroma(actual)) return;
  const tipo = tipoAroma(), txt = $('#pAroma').value.trim();
  if (aromaSel && aromaSel.e !== tipo) aromaSel = null;   // cambió la esencia: el aroma ya no aplica
  const list = buscaAromas(txt, tipo, aromaGen);
  $('#pAromaTipo').textContent = `${AROMAS.filter(a => a.e === tipo).length} aromas en ${TIPO_AROMA[tipo].toLowerCase()}`;
  $('#pAromas').innerHTML = list.slice(0, 40).map(a => `<button type="button" class="aroma" data-aroma="${a.i}"><span class="dot f-${slug(a.fam)}"></span>
    <span><b>${esc(a.n)}</b><small>${esc(a.g)}</small></span></button>`).join('')
    + (list.length > 40 ? `<p class="small">y ${list.length - 40} más: escribe para afinar la búsqueda.</p>` : '')
    + (!list.length && txt ? `<p class="small">No está en la lista: se enviará “${esc(txt)}” como aroma.</p>` : '');
  $('#pBuscaAroma').hidden = $('#pAromas').hidden = !!aromaSel;
  $('#pAromaSel').hidden = !aromaSel;
  $('#pAromaSel').innerHTML = aromaSel ? fichaAroma(aromaSel) + '<button type="button" class="link" id="cambiarAroma">Cambiar aroma</button>' + parecidosHTML(aromaSel) : '';
  document.querySelectorAll('#pGen button').forEach(b => b.setAttribute('aria-pressed', b.dataset.gen === aromaGen));
}
const aromaTexto = () => aromaSel ? `${aromaSel.n} (${aromaSel.g})` : $('#pAroma').value.trim();
const pedirAroma = a => a.e === 'ambiental' ? openProduct('difusor-80', { aroma: a }) : abrirTamanos(a);

/* ---------- ventana de tamaños: el aroma elegido en frasco nuevo (de 10 a 120 ml) o relleno ---------- */
const TAM = PERF.filter(p => p.cat === 'nuevo' && p.ml && p.var && p.var.length).map(p => p.ml).sort((a, b) => a - b);
let tA = null, tModo = 'nuevo', tMl = '60', tSel = '', tCant = 1;
// los frascos de un tamaño: los tuyos y los envases del catálogo de esa medida
function frascosDe(ml) {
  const nuevo = byId['nuevo-' + ml];
  return (nuevo && nuevo.var || []).map((v, i) => ({ id: nuevo.id, v: i, n: v.n, img: v.img, g: v.g || generoFrasco(nuevo, v), propio: !v.de }));
}
// los que van con el género del aroma (los "Ambos" siempre aparecen; un aroma unisex ve todos)
const frascos = (ml, g) => {
  const todos = frascosDe(ml);
  const mios = todos.filter(f => g === 'Unisex' || f.g === g || f.g === 'Ambos');
  return mios.length ? mios : todos;
};
const clave = f => `${f.id}|${f.v}`;
const prodTam = () => byId[(tModo === 'nuevo' ? 'nuevo-' : 'relleno-') + tMl];
const precioTam = (modo, ml) => { const p = byId[(modo === 'nuevo' ? 'nuevo-' : 'relleno-') + ml]; return p && p.precios[tA.e]; };
function abrirTamanos(a) {
  tA = a; tModo = 'nuevo'; tMl = '60'; tCant = 1; tSel = '';
  $('#tFicha').innerHTML = fichaAroma(a) + parecidosHTML(a);
  renderTamanos();
  $('#dlgTam').showModal();
  $('#dlgTam').scrollTop = 0;
}
function renderTamanos() {
  const a = tA;
  document.querySelectorAll('#tModo button').forEach(b => b.setAttribute('aria-pressed', b.dataset.tmodo === tModo));
  const lista = tModo === 'nuevo' ? TAM : PERF.filter(p => p.cat === 'relleno' && !p.medida && p.precios[a.e] != null).map(p => p.id.replace('relleno-', ''));
  if (!lista.includes(tMl)) tMl = lista.includes('60') ? '60' : lista[0];
  $('#tSizes').className = 'tsizes' + (tModo === 'relleno' ? ' rell' : '');
  $('#tSizes').innerHTML = lista.map(ml => {
    const f = tModo === 'nuevo' ? frascos(ml, a.g)[0] : null, pr = precioTam(tModo, ml), pp = byId[(tModo === 'nuevo' ? 'nuevo-' : 'relleno-') + ml];
    const foto = f ? imgTag(f.img, `Frasco ${ml} ml`) : (pp.img ? imgTag(pp.img, `Envases de ${ml} ml`) : '');
    return `<button type="button" class="tsize${ml === tMl ? ' on' : ''}" data-tml="${ml}">
      ${foto ? `<span class="timg">${foto}</span>` : ''}<b>${esc(pp.nombre.replace(/^(Perfume|Relleno) /, ''))}</b><small>${pr != null ? money(pr) : '—'}</small></button>`;
  }).join('');
  const fs = tModo === 'nuevo' ? frascos(tMl, a.g) : [];
  if (!fs.some(f => clave(f) === tSel)) tSel = fs[0] ? clave(fs[0]) : '';
  $('#tColores').hidden = fs.length < 2;
  $('#tColores').innerHTML = `<legend>Elige tu frasco <small>${fs.length} de ${tMl} ml</small></legend><div class="vars">` + fs.map(f => `
    <button type="button" class="var con-foto${clave(f) === tSel ? ' on' : ''}" data-tcolor="${clave(f)}"><span class="vimg">${imgTag(f.img, f.n)}</span><span class="vn">${esc(f.n)}</span></button>`).join('') + '</div>';
  $('#tNota').textContent = tModo === 'relleno' ? 'Trae tu frasco: lo rellenamos del tamaño que elijas.'
    : (a.g === 'Unisex' ? 'Aroma unisex: elige el frasco que más te guste.' : `Frascos para ${a.g.toLowerCase()} y unisex, como tu aroma.`);
  $('#tCant').textContent = tCant;
  let u = precioTam(tModo, tMl);
  if (tModo === 'nuevo' && tSel) { const [id, vi] = tSel.split('|'); const pr = preciosDe(byId[id], +vi); if (pr && pr[a.e] != null) u = pr[a.e]; }
  $('#tAgregar').textContent = `Agregar · ${money(u * tCant)}`;
}
$('#tModo').addEventListener('click', e => { const b = e.target.closest('[data-tmodo]'); if (b) { tModo = b.dataset.tmodo; renderTamanos(); } });
$('#tSizes').addEventListener('click', e => { const b = e.target.closest('[data-tml]'); if (b) { tMl = b.dataset.tml; vibra(8); renderTamanos(); } });
$('#tColores').addEventListener('click', e => { const b = e.target.closest('[data-tcolor]'); if (b) { tSel = b.dataset.tcolor; vibra(8); renderTamanos(); } });
$('#tMenos').addEventListener('click', () => { tCant = Math.max(1, tCant - 1); renderTamanos(); });
$('#tMas').addEventListener('click', () => { tCant = Math.min(99, tCant + 1); renderTamanos(); });
$('#tAgregar').addEventListener('click', () => {
  let p = prodTam(), v = -1;
  if (tModo === 'nuevo' && tSel) { const [id, vi] = tSel.split('|'); p = byId[id]; v = +vi; }
  addToCart(p.id, v, tA.e, `${tA.n} (${tA.g})`, tCant);
  vuelaAlCarrito(document.querySelector('#tColores .var.on .vimg') || document.querySelector('#tSizes .tsize.on .timg') || $('#tFicha'));
  toast(`${p.nombre} · ${tA.n} agregado al carrito`);
  $('#dlgTam').close();
});
const aromaCard = (a, i) => `<article class="acard" style="--i:${i % PAGINA}">
  <small class="insp">Inspirado olfativamente en</small>
  <h3>${esc(a.n)}</h3><span class="det">${esc(a.g)} · ${TIPO_AROMA[a.e]}</span>
  <button class="pedir" data-pedir="${a.i}">Pedir este aroma</button></article>`;
const GENEROS = ['todos', 'Dama', 'Caballero', 'Unisex'];
function renderAromaGrid() {
  const list = buscaAromas(q, aTipo, aGen);
  $('#aromasRes').hidden = true;
  document.querySelector('#productos > .list-head').hidden = false;
  $('#titulo').textContent = q ? `Aromas para “${q}”` : 'Aromas de la genealogía';
  $('#conteo').textContent = `${list.length} ${list.length === 1 ? 'aroma' : 'aromas'}`;
  $('#nota').hidden = false; $('#nota').textContent = catOf('aromas').nota;
  $('#pills').innerHTML = GENEROS.map(g => `<button class="pill" data-agen="${g}" aria-pressed="${g === aGen}">${g === 'todos' ? 'Todos' : g}</button>`).join('')
    + '<span class="pill-sep" aria-hidden="true"></span>'
    + ['todos', 'linea', 'neeche', 'arabe', 'ambiental'].map(t => `<button class="pill" data-atipo="${t}" aria-pressed="${t === aTipo}">${t === 'todos' ? 'Todas las esencias' : TIPO_AROMA[t].replace('Esencia ', '')}</button>`).join('');
  $('#grid').innerHTML = list.slice(0, mostrados).map(aromaCard).join('');
  $('#mas').hidden = list.length <= mostrados;
  $('#mas').textContent = `Ver más (${list.length - mostrados})`;
  $('#vacio').hidden = list.length > 0;
  $('#vacio').innerHTML = vacio({ icono: 'frasco', titulo: 'No encontramos ese aroma', texto: 'Prueba con una nota (vainilla, rosa, coco) o quita algún filtro.', cta: 'Ver todos los aromas', ctaCat: 'aromas' });
}
// en la búsqueda general, los aromas que coinciden salen arriba de los productos
function renderAromaRes() {
  const box = $('#aromasRes');
  const list = q && !soloFavs ? buscaAromas(q, 'todos', 'todos') : [];
  box.hidden = !list.length;
  if (!list.length) return;
  box.innerHTML = `<div class="list-head"><h2>Aromas</h2><span>${list.length} ${list.length === 1 ? 'aroma' : 'aromas'}</span></div>
    <div class="arow">${list.slice(0, 8).map(aromaCard).join('')}</div>
    ${list.length > 8 ? `<button class="mas" data-cat="aromas">Ver los ${list.length} aromas</button>` : ''}`;
}

/* ---------- carrito ---------- */
const unitario = it => { const pr = preciosDe(byId[it.id], it.v); return pr ? pr[it.esencia] ?? null : null; };
const lineTotal = it => { const u = unitario(it); return u == null ? null : u * it.cant; };
const esName = id => ESENCIAS.find(e => e.id === id).nombre;
// filtro de frascos: género (Dama / Caballero) y texto (Liliana, Perseo…)
let vGen = 'todos';
function filtraFrascos() {
  const txt = minus(($('#pVarBusca') || {}).value || '').trim();
  document.querySelectorAll('#pVar .var').forEach(l => {
    l.hidden = !((vGen === 'todos' || l.dataset.g === vGen || l.dataset.g === 'Ambos') && (!txt || l.dataset.n.includes(txt)));
  });
}
$('#pVar').addEventListener('click', e => {
  const b = e.target.closest('[data-vgen]'); if (!b) return;
  vGen = b.dataset.vgen;
  document.querySelectorAll('#pVarGen button').forEach(x => x.setAttribute('aria-pressed', x === b));
  filtraFrascos();
});
$('#pVar').addEventListener('input', e => { if (e.target.id === 'pVarBusca') filtraFrascos(); });
const varName = it => it.v >= 0 ? byId[it.id].var[it.v].n : '';
const muchasEsencias = it => { const pr = preciosDe(byId[it.id], it.v); return !!pr && Object.keys(pr).length > 1; };
const total = () => cart.reduce((a, it) => a + (lineTotal(it) || 0), 0);
const porConfirmar = () => cart.some(it => unitario(it) == null);
function saveCart() { store.set('fr_cart', cart); renderCount(); }
function renderCount() {
  const n = cart.reduce((a, it) => a + it.cant, 0);
  for (const el of [$('#cuenta'), $('#cuenta2')]) { el.hidden = !n; el.textContent = n; }
}
function addToCart(id, v, es, aroma, n) {
  const same = cart.find(it => it.id === id && it.v === v && it.esencia === es && it.aroma === aroma);
  if (same) same.cant += n; else cart.push({ id, v, esencia: es, aroma, cant: n });
  const max = byId[id] && byId[id].quedan, it = same || cart[cart.length - 1];
  if (max && it.cant > max) { it.cant = max; toast(`Solo quedan ${max} piezas`); }
  saveCart();
}
function renderCart() {
  $('#items').innerHTML = cart.map((it, i) => {
    const p = byId[it.id], c = catOf(p.cat), u = unitario(it), lt = lineTotal(it);
    const sub = [varName(it), muchasEsencias(it) ? esName(it.esencia) : '', it.aroma].filter(Boolean).join(' · ') || p.detalle;
    return `<li class="item" style="--h:${c.h}"><span class="mini">${art(p, it.v)}</span>
      <div><b>${esc(p.nombre)}</b><small>${esc(sub || '')}</small>
        <small>${u == null ? 'Precio por confirmar' : money(u) + ' c/u'}</small></div>
      <div class="r"><b>${lt == null ? '—' : money(lt)}</b>
        <div class="step"><button type="button" data-dec="${i}" aria-label="${it.cant === 1 ? 'Quitar' : 'Uno menos'}">${it.cant === 1 ? '×' : '−'}</button><output>${it.cant}</output><button type="button" data-inc="${i}" aria-label="Uno más">+</button></div></div></li>`;
  }).join('');
  $('#carritoVacio').hidden = cart.length > 0;
  const ult = ultimoPedido();
  $('#repetir').hidden = cart.length > 0 || !ult.length;
  $('#repetir').textContent = `Repetir mi último pedido (${ult.reduce((a, it) => a + it.cant, 0)} productos)`;
  $('#checkout').hidden = cart.length === 0;
  $('#total').textContent = money(total()) + (porConfirmar() ? ' + por confirmar' : '');
  $('#enviar').disabled = !WHATSAPP;
  $('#waNota').textContent = WHATSAPP ? 'Se abre WhatsApp con tu pedido escrito. Te confirmo existencias, pago y entrega.'
    : 'Pronto podrás mandar tu pedido por WhatsApp desde aquí.';
}
const fechaBonita = f => f ? new Date(f + 'T12:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
function entregaDatos() {
  const envio = document.querySelector('input[name=entrega]:checked').value === 'Envío';
  return { envio, lugar: $('#cDir').value.trim(), fecha: $('#cFecha').value, hora: $('#cHora').value };
}
let folio = '';
const nuevoFolio = () => { const d = new Date(), z = n => String(n).padStart(2, '0');
  return `F-${z(d.getDate())}${z(d.getMonth() + 1)}${String(d.getFullYear()).slice(2)}-${z(d.getHours())}${z(d.getMinutes())}`; };
function mensaje() {
  const ent = entregaDatos();
  const nombre = $('#cNombre').value.trim(), notas = $('#cNotas').value.trim();
  const lineas = cart.map((it, i) => {
    const p = byId[it.id], u = unitario(it);
    const det = [varName(it), muchasEsencias(it) ? esName(it.esencia) : '', it.aroma ? 'Aroma: ' + it.aroma : ''].filter(Boolean).join(' · ');
    return `${i + 1}. ${p.nombre}${det ? ' · ' + det : ''}\n   ${it.cant} × ${u == null ? 'precio por confirmar' : `${money(u)} = ${money(u * it.cant)}`}`;
  });
  const cuando = [fechaBonita(ent.fecha), ent.hora ? ent.hora + ' h' : ''].filter(Boolean).join(', ');
  return [`¡Hola! Quiero hacer este pedido${folio ? ' (' + folio + ')' : ''}:`, '', ...lineas, '', `*Total: ${money(total())}${porConfirmar() ? ' + productos por confirmar' : ''}*`, '',
    nombre ? `Nombre: ${nombre}` : null, `Entrega: ${ent.envio ? 'Envío a domicilio' : 'Paso a recoger'}`,
    ent.envio && ent.lugar ? `Lugar de entrega: ${ent.lugar}` : null,
    ent.envio && cuando ? `Fecha y hora que prefiero: ${cuando}` : null,
    notas ? `Notas: ${notas}` : null].filter(x => x !== null).join('\n');
}

/* ---------- navegación de abajo ---------- */
function setNav(id) {
  if (navActual === id) return;
  navActual = id;
  document.querySelectorAll('.bottom [data-go]').forEach(b => b.classList.toggle('on', b.dataset.go === id));
  mueveGota(true);
}
/* gota de vidrio líquido de la barra de abajo: se estira hacia el botón nuevo y se asienta con un pequeño rebote */
let navActual = 'inicio', gotaPos = null;
const gota = document.createElement('span'); gota.className = 'gota'; gota.setAttribute('aria-hidden', 'true');
$('.bottom').prepend(gota);
function mueveGota(animar) {
  const on = $('.bottom .on'), nav = $('.bottom');
  if (!on) { gota.style.opacity = 0; gotaPos = null; return; }
  const r = on.getBoundingClientRect(), n = nav.getBoundingClientRect();
  const w = Math.min(r.width - 6, 76), x = r.left - n.left + (r.width - w) / 2;
  const antes = gotaPos; gotaPos = { x, w };
  gota.style.width = w + 'px'; gota.style.transform = `translateX(${x}px)`; gota.style.opacity = 1;
  if (!animar || !antes || antes.x === x || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const izq = Math.min(antes.x, x), ancho = Math.max(antes.x + antes.w, x + w) - izq;
  gota.animate([
    { transform: `translateX(${antes.x}px)`, width: antes.w + 'px' },
    { transform: `translateX(${izq}px) scaleY(.78)`, width: ancho + 'px', offset: .42 },
    { transform: `translateX(${x}px) scale(1.08, .94)`, width: w + 'px', offset: .72 },
    { transform: `translateX(${x}px) scale(.97, 1.03)`, width: w + 'px', offset: .88 },
    { transform: `translateX(${x}px)`, width: w + 'px' },
  ], { duration: 560, easing: 'cubic-bezier(.3,.7,.2,1)' });
}
addEventListener('resize', () => mueveGota(false));
// al desplazarte, la gota sigue en qué parte estás (inicio o el catálogo)
let espiaPendiente = false;
addEventListener('scroll', () => {
  if (espiaPendiente) return; espiaPendiente = true;
  requestAnimationFrame(() => {
    espiaPendiente = false;
    if (soloFavs || !['inicio', 'categorias'].includes(navActual)) return;
    setNav($('#productos').getBoundingClientRect().top < innerHeight * .45 ? 'categorias' : 'inicio');
  });
}, { passive: true });
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2200); }

/* ---------- eventos ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('button, a'); if (!t) return;
  if (t.dataset.mascats) { masCats = !masCats; renderCats(); return; }
  if (t.dataset.quiz) { abrirQuiz(); return; }
  if (t.dataset.parecido) {
    const a = AROMAS[+t.dataset.parecido];
    if ($('#dlgTam').open) abrirTamanos(a); else { aromaSel = a; renderAromas(); }
    vibra(8); return;
  }
  if (t.dataset.repetir) { repetirPedido(); return; }
  if (t.dataset.aroma) {
    aromaSel = AROMAS[+t.dataset.aroma];
    // frasco nuevo: se elige solo el frasco de dama o de caballero según el aroma
    if (actual.cat === 'nuevo' && actual.var && aromaSel.g !== 'Unisex') {
      const i = actual.var.findIndex(v => v.n.startsWith(aromaSel.g));
      if (i >= 0 && i !== vSel) { vSel = i; const r = $(`#pVar input[value="${i}"]`); if (r) r.checked = true; renderVariante(); }
    }
    renderAromas(); vibra(8); return;
  }
  if (t.id === 'cambiarAroma') { aromaSel = null; $('#pAroma').value = ''; renderAromas(); $('#pAroma').focus(); return; }
  if (t.dataset.gen) { aromaGen = t.dataset.gen; renderAromas(); return; }
  if (t.dataset.pedir) { pedirAroma(AROMAS[+t.dataset.pedir]); return; }
  if (t.dataset.agen) { aGen = t.dataset.agen; renderGrid(); return; }
  if (t.dataset.atipo) { aTipo = t.dataset.atipo; renderGrid(); return; }
  if (t.dataset.sugiere) { $('#q').value = t.dataset.sugiere; $('#q').dispatchEvent(new Event('input')); return; }
  if (t.dataset.cat) { e.preventDefault(); const dlg = t.closest('dialog[open]'); if (dlg) dlg.close();
    if (t.classList.contains('vacio-cta') && q) { q = ''; $('#q').value = ''; }
    setCat(t.dataset.cat, !t.classList.contains('cat')); return; }
  if (t.dataset.tag) { tag = t.dataset.tag; renderCats(); renderGrid(); return; }
  if (t.dataset.open) { openProduct(t.dataset.open); return; }
  if (t.dataset.fav) {
    const id = t.dataset.fav, on = !favs.has(id); on ? favs.add(id) : favs.delete(id); store.set('fr_favs', [...favs]);
    t.setAttribute('aria-pressed', on); toast(on ? 'Guardado en favoritos' : 'Quitado de favoritos');
    if (soloFavs) renderGrid(); return;
  }
  if (t.dataset.i) { goSlide(+t.dataset.i); startAutoplay(); return; }
  if (t.dataset.inc || t.dataset.dec) {
    const i = +(t.dataset.inc || t.dataset.dec);
    const max = byId[cart[i].id].quedan;
    if (t.dataset.inc && max && cart[i].cant >= max) { toast(`Solo quedan ${max} piezas`); return; }
    cart[i].cant += t.dataset.inc ? 1 : -1; if (cart[i].cant < 1) cart.splice(i, 1);
    saveCart(); renderCart(); return;
  }
  if (t.id === 'mas') { mostrados += PAGINA; renderGrid(false); return; }
  const go = t.dataset.go;
  if (go === 'carrito') { renderCart(); $('#dlgCarrito').showModal(); return; }
  if (go === 'favoritos') { soloFavs = true; setNav('favoritos'); renderCats(); renderGrid(); $('#productos').scrollIntoView({ behavior: 'smooth' }); return; }
  if (go === 'contacto') {
    if (WHATSAPP) window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('¡Hola! Tengo una pregunta sobre los productos Fraiche.')}`, '_blank', 'noopener');
    else toast('Pronto podrás escribirnos por WhatsApp desde aquí');
    return;
  }
  if (go === 'inicio' || go === 'categorias') { if (soloFavs) { soloFavs = false; renderCats(); renderGrid(); } setNav(go); }
});
$('#btnCarrito').addEventListener('click', () => { renderCart(); $('#dlgCarrito').showModal(); });
$('#btnBuscar').addEventListener('click', () => {
  const box = $('#buscador'), open = box.hidden; box.hidden = !open; $('#btnBuscar').setAttribute('aria-expanded', open);
  if (open) $('#q').focus(); else if (q) { q = ''; $('#q').value = ''; renderGrid(); }
});
// fotos: aparecen suave al cargar; mientras tanto su caja muestra un brillo
['load', 'error'].forEach(ev => document.addEventListener(ev, e => { if (e.target.tagName === 'IMG') e.target.classList.add('lista'); }, true));
new MutationObserver(() => document.querySelectorAll('img:not(.lista)').forEach(i => { if (i.complete && i.naturalWidth) i.classList.add('lista'); }))
  .observe(document.body, { childList: true, subtree: true });
$('#q').addEventListener('input', e => {
  q = e.target.value.trim(); if (q) { cat = 'todo'; soloFavs = false; renderCats(); } renderGrid();
});
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter') $('#productos').scrollIntoView({ behavior: 'smooth' }); });
$('#pVar').addEventListener('change', e => { if (e.target.name === 'variante') { vSel = +e.target.value; renderVariante(); } });
$('#pVar').addEventListener('input', e => {
  if (e.target.id !== 'pMl') return;
  const ml = Math.round(+e.target.value);
  if (ml >= ML_MIN && ml <= ML_MAX) { vSel = ml - ML_MIN; renderVariante(); }
});
$('#pVar').addEventListener('change', e => {   // eligió su frasco Fraiche: se pone su tamaño
  if (e.target.id !== 'pFrasco' || !e.target.value) return;
  vSel = +e.target.value - ML_MIN; $('#pMl').value = e.target.value; renderVariante();
});
$('#pVar').addEventListener('focusout', e => {   // al salir del campo, se ajusta a la medida válida más cercana
  if (e.target.id === 'pMl') e.target.value = ML_MIN + vSel;
});
$('#pOpciones').addEventListener('change', updateBuy);
$('#pAroma').addEventListener('input', renderAromas);
$('#pMenos').addEventListener('click', () => { cant = Math.max(1, cant - 1); updateBuy(); });
$('#pMas').addEventListener('click', () => {   // si quedan pocas piezas, no deja pedir más de las que hay
  const max = actual.quedan || 99;
  if (cant >= max) toast(`Solo quedan ${max} piezas`);
  cant = Math.min(max, cant + 1); updateBuy();
});
$('#formProducto').addEventListener('submit', e => {
  if (e.submitter && e.submitter.value === 'add') {
    addToCart(actual.id, vSel, esencia(), pideAroma(actual) ? aromaTexto() : '', cant);
    vuelaAlCarrito($('#pMedia'));
    toast(`${actual.nombre} agregado al carrito`);
  }
});
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));   // tocar fuera cierra
document.querySelectorAll('input[name=entrega]').forEach(r => r.addEventListener('change', () => { $('#dirBox').hidden = r.value !== 'Envío' || !r.checked; }));
let ultimoMensaje = '';
const abrirWhats = m => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(m)}`, '_blank', 'noopener');
$('#enviar').addEventListener('click', () => {
  if (!WHATSAPP || !cart.length) return;
  const ent = entregaDatos();
  if (ent.envio && !ent.lugar) { toast('Escribe el lugar de entrega'); $('#cDir').focus(); return; }
  if (ent.envio && horaOcupada()) { toast('A esa hora no hay entregas; elige otra'); $('#cHora').focus(); return; }
  folio = nuevoFolio();
  ultimoMensaje = mensaje();
  store.set('fr_ultimo', cart.map(it => ({ ...it })));
  abrirWhats(ultimoMensaje);
  pedidoRealizado(ent);
});
// ventana de confirmación: folio, resumen y cómo se acuerda la entrega
function pedidoRealizado(ent) {
  const n = cart.reduce((a, it) => a + it.cant, 0);
  $('#okFolio').textContent = `Folio ${folio}`;
  $('#okResumen').innerHTML = `<span>${n} ${n === 1 ? 'producto' : 'productos'}</span><b>${money(total())}${porConfirmar() ? ' + por confirmar' : ''}</b>`;
  const cuando = [fechaBonita(ent.fecha), ent.hora ? ent.hora + ' h' : ''].filter(Boolean).join(' a las ');
  $('#okEntrega').innerHTML = ent.envio
    ? `<b>Envío a domicilio</b><p>${esc(ent.lugar)}${cuando ? `<br>${esc(cuando)}` : ''}</p><p class="small">Por WhatsApp acordamos contigo el lugar, la fecha y la hora exactos de la entrega.</p>`
    : `<b>Pasas a recoger</b><p class="small">Por WhatsApp te avisamos cuándo está listo tu pedido y dónde recogerlo.</p>`;
  $('#dlgCarrito').close();
  cart = []; saveCart();
  $('#dlgOk').showModal();
  vibra([12, 40, 18]);
}
$('#okWa').addEventListener('click', () => { if (ultimoMensaje) abrirWhats(ultimoMensaje); });
$('#okCerrar').addEventListener('click', () => $('#dlgOk').close());
const hoyISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
$('#cFecha').min = hoyISO();
// horas en que no entregas (ajustes.js → negocio.ocupado): avisa al elegir fecha y hora
const OCUPADO = ((AJ.negocio || {}).ocupado || []).filter(o => o && o.desde && o.hasta);
function horaOcupada() {
  const f = $('#cFecha').value, h = $('#cHora').value;
  if (!f || !h) return null;
  const dia = new Date(f + 'T12:00').getDay();
  return OCUPADO.find(o => (o.dias || [0, 1, 2, 3, 4, 5, 6]).includes(dia) && h >= o.desde && h < o.hasta) || null;
}
function avisaHora() {
  const o = horaOcupada();
  $('#horaNota').hidden = !o;
  $('#horaNota').textContent = o ? `${o.motivo || 'A esa hora no hay entregas'}; elige otra hora, por favor.` : '';
}
['#cFecha', '#cHora'].forEach(s => $(s).addEventListener('change', avisaHora));
$('#slides').addEventListener('scroll', () => {
  const i = slideIndex(); document.querySelectorAll('#dots button').forEach((b, j) => b.setAttribute('aria-selected', i === j));
}, { passive: true });
$('#slides').addEventListener('pointerdown', startAutoplay);

/* ---------- interacciones táctiles ---------- */
const calma = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const vibra = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
// onda de luz desde el punto donde se toca
document.addEventListener('pointerdown', e => {
  const t = e.target.closest('button, .cta, .top-links a, .bottom a, label.opt, label.var, .seg span');
  if (!t || calma()) return;
  const r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
  if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
  t.classList.add('rip-host');
  const w = document.createElement('span');
  w.className = 'rip';
  w.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  t.append(w);
  w.addEventListener('animationend', () => w.remove());
}, { passive: true });
// la foto del producto vuela hasta el carrito y el contador rebota
function vuelaAlCarrito(desde) {
  vibra(14);
  const metas = [$('#btnCarrito'), document.querySelector('.bottom [data-go="carrito"]')].filter(el => el && el.offsetParent);
  const meta = metas.find(el => el.getBoundingClientRect().top > 0 && getComputedStyle(el).display !== 'none') || metas[0];
  const bump = () => document.querySelectorAll('.count').forEach(c => { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
  if (!desde || !meta || calma()) return bump();
  const a = desde.getBoundingClientRect(), b = meta.getBoundingClientRect();
  const f = desde.cloneNode(true);
  f.className = 'vuela'; f.removeAttribute('id');
  const s = Math.min(a.width, a.height, 160);
  f.style.cssText = `left:${a.left + a.width / 2 - s / 2}px;top:${a.top + a.height / 2 - s / 2}px;width:${s}px;height:${s}px`;
  document.body.append(f);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  f.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 },
             { transform: `translate(${dx * .55}px,${dy * .35 - 80}px) scale(.55)`, opacity: .95, offset: .55 },
             { transform: `translate(${dx}px,${dy}px) scale(.12)`, opacity: .4 }],
    { duration: 720, easing: 'cubic-bezier(.5,0,.25,1)' }).onfinish = () => { f.remove(); bump(); };
}

/* ---------- aromas parecidos: misma nota principal, o misma familia, del mismo género y esencia ---------- */
function parecidos(a, n = 4) {
  const mismos = AROMAS.filter(b => b !== a && b.e === a.e && (b.g === a.g || a.g === 'Unisex' || b.g === 'Unisex'));
  const porNota = mismos.filter(b => b.nota === a.nota), porFam = mismos.filter(b => b.fam === a.fam && b.nota !== a.nota);
  const cerca = arr => arr.sort((x, y) => Math.abs(x.i - a.i) - Math.abs(y.i - a.i));   // siempre los mismos para cada aroma
  return [...cerca(porNota), ...cerca(porFam)].slice(0, n);
}
const parecidosHTML = a => {
  const l = parecidos(a);
  return l.length ? `<div class="parecidos"><small>Si te gusta este, prueba también:</small><div>${l.map(b =>
    `<button type="button" class="chip-aroma" data-parecido="${b.i}">${esc(b.n)}</button>`).join('')}</div></div>` : '';
};

/* ---------- test: ¿qué aroma es para ti? ---------- */
const QUIZ = [
  { k: 'g', p: '¿Para quién es?', o: [['Dama', 'Para dama'], ['Caballero', 'Para caballero'], ['Unisex', 'Unisex'], ['todos', 'Me da igual']] },
  { k: 'gusto', p: '¿Qué te gusta más?', o: [['dulce', 'Dulce: vainilla, caramelo, frutas'], ['fresco', 'Fresco: cítricos, agua, verde'],
    ['floral', 'Floral: rosas, jazmín, flores'], ['intenso', 'Intenso: maderas, especias, cuero']] },
  { k: 'cuando', p: '¿Cuándo lo vas a usar?', o: [['dia', 'De día, para diario'], ['noche', 'De noche o para salir'], ['siempre', 'Para todo']] },
  { k: 'e', p: '¿Qué esencia prefieres?', o: [['linea', 'De línea (mejor precio)'], ['neeche', 'Neeche (más intensa)'], ['arabe', 'Árabe (cálida y dulce)'], ['todas', 'No sé, recomiéndame']] },
];
const FAMS = { dulce: ['gourmand', 'frutal', 'oriental'], fresco: ['citrica', 'acuatica', 'aromatica'], floral: ['floral'], intenso: ['amaderada', 'especiada', 'licor-y-cuero', 'oriental'] };
const DE_DIA = ['citrica', 'acuatica', 'aromatica', 'floral', 'frutal'];
let qPaso = 0, qResp = {};
function abrirQuiz() { qPaso = 0; qResp = {}; renderQuiz(); $('#dlgQuiz').showModal(); }
function renderQuiz() {
  const box = $('#quizIn');
  if (qPaso < QUIZ.length) {
    const s = QUIZ[qPaso];
    box.innerHTML = `<p class="small izq">Pregunta ${qPaso + 1} de ${QUIZ.length}</p><div class="qbar"><i style="width:${(qPaso / QUIZ.length) * 100}%"></i></div>
      <h3>${s.p}</h3><div class="qops">${s.o.map(([v, n]) => `<button type="button" class="qop" data-qv="${v}">${n}</button>`).join('')}</div>
      ${qPaso ? '<button type="button" class="link" data-qatras="1">← Atrás</button>' : ''}`;
    return;
  }
  const res = recomienda();
  box.innerHTML = `<h3>Tus aromas recomendados</h3><p class="small izq">Toca uno para elegir el tamaño, o vuelve a hacer el test.</p>
    <div class="qres">${res.map(a => `<div class="qa"><b>${esc(a.n)}</b><small>${a.g} · ${TIPO_AROMA[a.e]}</small>
      <button type="button" class="pedir" data-qpedir="${a.i}">Pedir este aroma</button></div>`).join('') || '<p>No encontré aromas con esas respuestas; prueba con otras.</p>'}</div>
    <div class="qfin"><button type="button" class="mas" data-qotra="1">Ver otras opciones</button><button type="button" class="link" data-qreinicia="1">Volver a empezar</button></div>`;
}
function recomienda() {
  const fams = FAMS[qResp.gusto] || [], esencia = qResp.e === 'todas' ? null : qResp.e;
  let l = AROMAS.filter(a => a.e !== 'ambiental' && (!esencia || a.e === esencia)
    && (qResp.g === 'todos' || a.g === qResp.g || a.g === 'Unisex') && fams.includes(slug(a.fam)));
  if (qResp.cuando === 'dia') l = [...l.filter(a => DE_DIA.includes(slug(a.fam))), ...l.filter(a => !DE_DIA.includes(slug(a.fam)))];
  if (qResp.cuando === 'noche') l = [...l.filter(a => !DE_DIA.includes(slug(a.fam))), ...l.filter(a => DE_DIA.includes(slug(a.fam)))];
  const mitad = l.slice(0, Math.max(12, Math.ceil(l.length / 2)));   // primero los que mejor van con el momento
  return azar(mitad).slice(0, 6);
}
$('#quizIn').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.qv) { qResp[QUIZ[qPaso].k] = b.dataset.qv; qPaso++; vibra(8); renderQuiz(); }
  else if (b.dataset.qatras) { qPaso = Math.max(0, qPaso - 1); renderQuiz(); }
  else if (b.dataset.qotra) renderQuiz();
  else if (b.dataset.qreinicia) { qPaso = 0; qResp = {}; renderQuiz(); }
  else if (b.dataset.qpedir) { $('#dlgQuiz').close(); pedirAroma(AROMAS[+b.dataset.qpedir]); }
});

/* ---------- repetir el último pedido ---------- */
const ultimoPedido = () => (store.get('fr_ultimo', []) || []).filter(it => byId[it.id] && !byId[it.id].agotado
  && (it.v < 0 || (byId[it.id].var && byId[it.id].var[it.v] && !byId[it.id].var[it.v].agotado)) && unitario(it) !== undefined);
function repetirPedido() {
  const ult = ultimoPedido(); if (!ult.length) return;
  ult.forEach(it => addToCart(it.id, it.v, it.esencia, it.aroma, it.cant));
  renderCart(); toast('Listo: tu último pedido está en el carrito');
}

/* ---------- tu negocio y reseñas (ajustes.js) ---------- */
function renderNegocio() {
  const n = AJ.negocio || {}, filas = [['Horario', n.horario], ['Zona de entrega', n.zona], ['Dónde', n.direccion]].filter(([, v]) => v);
  const mapa = n.mapa && /^https:\/\//.test(n.mapa) ? `<a class="mas" href="${esc(n.mapa)}" target="_blank" rel="noopener">Ver en el mapa</a>` : '';
  $('#negocio').hidden = !filas.length && !mapa;
  $('#negocio').innerHTML = filas.map(([k, v]) => `<div><b>${k}</b><span>${esc(v)}</span></div>`).join('') + mapa;
  const r = (AJ.resenas || []).filter(x => x && x.texto);
  $('#resenas').hidden = !r.length;
  $('#resenas').innerHTML = r.length ? `<h2>Lo que dicen mis clientes</h2><div class="res-lista">${r.map(x => {
    const s = Math.max(1, Math.min(5, Math.round(+x.estrellas || 5)));
    return `<figure class="resena"><div class="estrellas" aria-label="${s} de 5 estrellas">${'★'.repeat(s)}<span>${'★'.repeat(5 - s)}</span></div>
      <blockquote>${esc(x.texto)}</blockquote>${x.nombre ? `<figcaption>${esc(x.nombre)}</figcaption>` : ''}</figure>`; }).join('')}</div>` : '';
}

/* ---------- arranque ---------- */
renderHero(); renderCats(); renderGrid(); renderCount(); renderNegocio(); startAutoplay();
if (WHATSAPP) $('#waFlota').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('¡Hola! Tengo una pregunta sobre los productos Fraiche.')}`; else $('#waFlota').hidden = true;
mueveGota(false); if (document.fonts) document.fonts.ready.then(() => mueveGota(false));
window.tienda = { mensaje, P, AROMAS, parecidos, get cart() { return cart; } };   // usado por las pruebas
