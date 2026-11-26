// Pruebas de la tienda con Playwright:  npm install && npx playwright install chromium && npm test
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await chromium.launch();
const SHOTS = process.argv.includes('--capturas');
let fails = 0;
async function prueba(nombre, fn) {
  try { await fn(); console.log('  ✓', nombre); } catch (e) { fails++; console.log('  ✗', nombre, '\n     ', e.message.split('\n')[0]); }
}
async function abrir({ width = 390, height = 844, scheme = 'light', ajustes = null, ruta = 'index.html', nuevo = false, tarjeta = null, movil = false, calma = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, colorScheme: scheme, reducedMotion: calma ? 'reduce' : 'no-preference', isMobile: movil, hasTouch: movil });
  // por defecto ya vio la bienvenida (para que no tape la página); nuevo: true la deja salir
  await ctx.addInitScript(({ nuevo, tarjeta }) => {
    if (!nuevo && localStorage.getItem('fr_bienvenida') == null) localStorage.setItem('fr_bienvenida', 'true');
    if (tarjeta && localStorage.getItem('fr_tarjeta') == null) localStorage.setItem('fr_tarjeta', JSON.stringify(tarjeta));
  }, { nuevo, tarjeta });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());          // sin internet en las pruebas
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|fonts/.test(m.text())) errors.push(m.text()); });
  // ajustes.js de prueba (agotados, horario, reseñas…) en lugar del real
  if (ajustes) await ctx.route(/ajustes\.js$/, r => r.fulfill({ contentType: 'text/javascript', body: `window.AJUSTES = ${JSON.stringify(ajustes)};` }));
  await page.goto(url.replace('index.html', ruta));
  return { ctx, page, errors };
}
console.log('Tienda · pruebas');

await prueba('carga sin errores y muestra todo el catálogo', async () => {
  const { ctx, page, errors } = await abrir();
  const total = await page.evaluate(() => window.tienda.P.length);
  const n = await page.locator('.card').count();
  const conteo = await page.textContent('#conteo');
  await page.click('#mas');
  const n2 = await page.locator('.card').count();
  await ctx.close();
  assert.ok(total >= 200, `solo ${total} productos`);
  assert.equal(n, 48); assert.equal(n2, 96);
  const enLista = +conteo.split(' ')[0];   // los envases sueltos del catálogo van dentro de "Perfume X ml"
  assert.ok(enLista > 150 && enLista < total, conteo);
  assert.deepEqual(errors, []);
});

await prueba('120 ml a $375 / $475 / $435, sin Torsos, Sport ni Polo Club, y rellenos con foto de sus envases', async () => {
  const { ctx, page, errors } = await abrir();
  const r = await page.evaluate(() => {
    const P = window.tienda.P;
    const de120 = P.filter(p => !p.medida).flatMap(p => [p.envase === 120 || p.ml === '120' && p.cat === 'nuevo' ? p.precios : null,
      ...(p.var || []).filter(v => v.ml === 120).map(v => v.precios)]).filter(Boolean).flatMap(o => Object.values(o));
    return {
      de120: [...new Set(de120)],
      quitados: P.filter(p => /polo|torsos-futbol|^sport$/.test(p.id)).map(p => p.id),
      frascos120: P.find(p => p.id === 'nuevo-120').var.map(v => v.n),
      sinFoto: P.filter(p => p.cat === 'relleno' && !p.img && !p.medida).map(p => p.id),
    };
  });
  await page.click('[data-cat="aromas"]');
  const tarjeta = await page.textContent('.acard');
  await ctx.close();
  assert.deepEqual(r.de120, [375, 475, 435]);
  assert.deepEqual(r.quitados, []);
  assert.ok(r.frascos120.every(n => !/100 ml|rojo/i.test(n)), r.frascos120.join(', '));
  assert.deepEqual(r.sinFoto, []);
  assert.ok(!/Huele/.test(tarjeta), tarjeta);
  assert.deepEqual(errors, []);
});

await prueba('sin scroll horizontal en 360, 390, 768 y 1280 px; siempre clara aunque el celular esté en modo oscuro', async () => {
  for (const scheme of ['light', 'dark']) for (const width of [360, 390, 768, 1280]) {
    const { ctx, page } = await abrir({ width, scheme });
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const fondo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    assert.equal(fondo, 'rgb(251, 250, 247)', `fondo ${fondo} en modo ${scheme}`);
    if (SHOTS && (width === 390 || width === 1280)) await page.screenshot({ path: path.join(ROOT, 'pruebas', `inicio-${width}-${scheme}.png`), fullPage: width === 1280 });
    await ctx.close();
    assert.ok(sobra <= 0, `se desborda ${sobra}px a ${width}px (${scheme})`);
  }
});

await prueba('los precios fijos están bien (60, 30 y 16 ml, nuevo y relleno)', async () => {
  const { ctx, page } = await abrir();
  const p = await page.evaluate(() => Object.fromEntries(window.PRODUCTOS.map(p => [p.id, p.precios && p.precios.linea])));
  await ctx.close();
  assert.deepEqual([p['nuevo-60'], p['relleno-60'], p['nuevo-30'], p['relleno-30'], p['nuevo-16'], p['relleno-16']], [212, 144, 127, 71, 73, 35]);
});

await prueba('categoría Rellenos filtra y el título cambia', async () => {
  const { ctx, page } = await abrir();
  await page.click('.cat[data-cat="relleno"]');
  const titulo = await page.textContent('#titulo'), n = await page.locator('.card').count();
  await ctx.close();
  assert.equal(titulo, 'Rellenos'); assert.equal(n, 1);   // un solo relleno, con calculadora
  for (const c of ['envases', 'velas', 'maquillaje', 'ninos', 'casa']) {
    const { ctx: x, page: pg } = await abrir();
    if (!(await pg.locator(`.cat[data-cat="${c}"]`).count())) await pg.click('[data-mascats]');   // las demás categorías están en "Más"
    await pg.click(`.cat[data-cat="${c}"]`);
    const k = await pg.locator('.card').count();
    await x.close();
    assert.ok(k > 0, `la categoría ${c} está vacía`);
  }
});

await prueba('buscar "Mermaid" encuentra la línea Fantasy (busca también en variantes)', async () => {
  const { ctx, page } = await abrir();
  await page.click('#btnBuscar'); await page.fill('#q', 'mermaid');
  const nombres = await page.locator('.card h3').allTextContents();
  await ctx.close();
  assert.ok(nombres.length >= 5, nombres.join(', '));
  assert.ok(nombres.includes('Shampoo 2 en 1 Fantasy'), nombres.join(', '));
});

await prueba('todas las fotos del catálogo existen', async () => {
  const { ctx, page } = await abrir();
  const rutas = await page.evaluate(() => [...new Set(window.CATALOGO.flatMap(p => [p.img, ...(p.var || []).map(v => v.img)]).filter(Boolean))]);
  await ctx.close();
  const faltan = rutas.filter(r => !fs.existsSync(path.join(ROOT, r)));
  assert.ok(rutas.length > 300, `solo ${rutas.length} fotos`);
  assert.deepEqual(faltan, []);
});

await prueba('envase con variantes: cambia la foto y el precio por tamaño (Liliana 60 → 30 ml)', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('#btnBuscar'); await page.fill('#q', 'liliana');
  await page.click('.card .add[data-open="liliana"]');
  const foto1 = await page.getAttribute('#pMedia img', 'src');
  const b1 = await page.textContent('#pAgregar');
  await page.click('#pVar .var:has-text("Melón 30 ml")');
  const foto2 = await page.getAttribute('#pMedia img', 'src');
  const b2 = await page.textContent('#pAgregar');
  await page.check('#pOpciones input[value="neeche"]');
  await page.fill('#pAroma', 'Aroma de prueba');
  await page.click('#pAgregar');
  const msg = await page.evaluate(() => window.tienda.mensaje());
  await ctx.close();
  assert.notEqual(foto1, foto2);
  assert.equal(b1, 'Agregar · $212'); assert.equal(b2, 'Agregar · $127');
  assert.ok(msg.includes('Liliana · Melón 30 ml · Esencia neeche · Aroma: Aroma de prueba'), msg);
  assert.deepEqual(errors, []);
});

await prueba('producto con aroma fijo: no pide aroma y respeta el precio especial', async () => {
  const { ctx, page } = await abrir();
  await page.click('.pill[data-tag="oferta"]');
  const n = await page.locator('.card').count();
  await page.click('#btnBuscar'); await page.fill('#q', 'nuestra cancion');
  await page.click('.card .add[data-open="vela-nuestra-cancion"]');
  const aroma = await page.isVisible('#pAroma');
  const boton = await page.textContent('#pAgregar');
  await ctx.close();
  assert.ok(n >= 12, `solo ${n} con precio especial`);   // los bodys de $42 ahora van en el de 250 ml a $89
  assert.equal(aroma, false); assert.equal(boton, 'Agregar · $77');
});

await prueba('agregar 2 perfumes de 60 ml en esencia árabe y armar el mensaje de WhatsApp', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('.cat[data-cat="nuevo"]');
  await page.click('.card .add[data-open="nuevo-60"]');
  await page.check('#pOpciones input[value="arabe"]');
  await page.fill('#pAroma', 'Aroma de prueba');
  await page.click('#pMas');
  const boton = await page.textContent('#pAgregar');
  if (SHOTS) await page.screenshot({ path: path.join(ROOT, 'pruebas', 'producto.png') });
  await page.click('#pAgregar');
  const cuenta = await page.textContent('#cuenta');
  await page.click('#btnCarrito');
  await page.fill('#cNombre', 'Ana');
  if (SHOTS) await page.screenshot({ path: path.join(ROOT, 'pruebas', 'carrito.png') });
  const msg = await page.evaluate(() => window.tienda.mensaje());
  await ctx.close();
  assert.equal(boton, 'Agregar · $484');
  assert.equal(cuenta, '2');
  assert.ok(msg.includes('Perfume 60 ml · Caballero · Perseo verde oscuro · Esencia árabe · Aroma: Aroma de prueba'), msg);
  assert.ok(msg.includes('2 × $242 = $484') && msg.includes('*Total: $484*') && msg.includes('Nombre: Ana') && msg.includes('Entrega: Paso a recoger'), msg);
  assert.deepEqual(errors, []);
});

await prueba('favoritos se guardan y se ven en su sección', async () => {
  const { ctx, page } = await abrir({ width: 390 });
  await page.click('.cat[data-cat="nuevo"]');
  await page.click('.fav[data-fav="nuevo-60"]');
  await page.reload();
  await page.click('.bottom [data-go="favoritos"]');
  const nombres = await page.locator('.card h3').allTextContents();
  await ctx.close();
  assert.deepEqual(nombres, ['Perfume 60 ml']);
});

await prueba('buscar "212 VIP Black" abre la ventana de tamaños con frascos de caballero', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('#btnBuscar'); await page.fill('#q', '212 VIP Black');
  const nombres = await page.locator('#aromasRes .acard h3').allTextContents();
  await page.click('#aromasRes .acard:has(h3:text-is("212 VIP Black")) .pedir');
  await page.waitForSelector('#dlgTam[open]');
  const tamanos = await page.locator('#tSizes .tsize b').allTextContents();
  const colores = await page.locator('#tColores .vn').allTextContents();
  await page.click('#tSizes [data-tml="120"]');
  const boton = await page.textContent('#tAgregar');
  await page.click('#tAgregar');
  const it = await page.evaluate(() => window.tienda.cart[0]);
  await page.click('#aromasRes .acard:has(h3:text-is("212 VIP Black")) .pedir');
  await page.click('#tModo [data-tmodo="relleno"]');
  const rellenos = await page.locator('#tSizes .tsize').count();
  await ctx.close();
  assert.ok(nombres.includes('212 VIP Black'), nombres.join(', '));
  assert.deepEqual(tamanos, ['10 ml', '12 ml', '15 ml', '16 ml', '20 ml', '30 ml', '32 ml', '50 ml', '60 ml', '100 ml', '120 ml']);
  assert.deepEqual(colores.slice(0, 3), ['Caballero · Perseo verde oscuro', 'Caballero · Perseo turquesa', 'Caballero · Perseo azul']);
  assert.ok(colores.length > 10 && colores.every(n => !/^Dama ·|Liliana|Línea Miss/.test(n)), colores.join(', '));
  assert.ok(boton.startsWith('Agregar · $'), boton);
  assert.deepEqual([it.id, it.v, it.esencia, it.aroma], ['nuevo-120', 0, 'linea', '212 VIP Black (Caballero)']);
  assert.ok(rellenos > 4, `solo ${rellenos} tamaños de relleno`);
  assert.deepEqual(errors, []);
});

await prueba('perfumes nuevos: un producto por tamaño (de 120 a 10 ml); elegir un aroma de dama cambia al frasco de dama', async () => {
  const { ctx, page } = await abrir();
  await page.click('.cat[data-cat="nuevo"]');
  const nombres = await page.locator('.card h3').allTextContents();
  await page.click('.card .add[data-open="nuevo-60"]');
  await page.click('#pGen button[data-gen="Dama"]');
  await page.fill('#pAroma', 'vainilla');
  await page.click('#pAromas .aroma >> nth=0');
  const v = await page.inputValue('#pVar input:checked');
  const nombreV = await page.evaluate(i => window.tienda.P.find(p => p.id === 'nuevo-60').var[i].n, +v);
  const ph = await page.getAttribute('#q', 'placeholder');
  await ctx.close();
  assert.deepEqual(nombres, ['Perfume 120 ml', 'Perfume 100 ml', 'Perfume 60 ml', 'Perfume 50 ml', 'Perfume 30 ml', 'Perfume 32 ml', 'Perfume 20 ml', 'Perfume 16 ml', 'Perfume 15 ml', 'Perfume 12 ml', 'Perfume 10 ml']);
  assert.ok(nombreV.startsWith('Dama'), nombreV);
  assert.equal(ph, 'Buscar aroma o producto');
});

await prueba('Envases: un botón por tamaño; el de 60 ml junta todos sus envases y filtra dama / caballero', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('.cat[data-cat="envases"]');
  const nombres = await page.locator('.card h3').allTextContents();
  await page.click('.card .add[data-open="nuevo-60"]');
  const total = await page.locator('#pVar .var').count();
  await page.click('#pVarGen [data-vgen="Caballero"]');
  const cab = await page.locator('#pVar .var:visible .vn').allTextContents();
  await page.click('#pVar .var:visible:has-text("Bikendi · Vino")');
  const foto = await page.getAttribute('#pMedia img', 'src');
  const fantasy = await page.evaluate(() => window.tienda.P.find(p => p.id === 'nuevo-60').var.filter(v => /Fantasy|Mermaid/.test(v.n)).length);
  await ctx.close();
  assert.ok(nombres.includes('Perfume 60 ml') && !nombres.some(n => /^(Liliana|Bikendi|Human|Lucha libre|Envase Copa|Pulpy|Capibu|Mystic)/.test(n)), nombres.join(', '));
  assert.ok(nombres.some(n => n.startsWith('Nicola Porcella')), 'Nicola Porcella va por aparte');
  assert.ok(total > 30, `solo ${total} envases de 60 ml`);
  assert.ok(cab.length < total && cab.includes('Bikendi · Vino') && !cab.some(n => /Liliana|Kelly/.test(n)), cab.join(', '));
  assert.ok(foto.includes('bikendi'), foto);
  assert.equal(fantasy, 0, 'las colonias Fantasy no van en los frascos de 60 ml');
  assert.deepEqual(errors, []);
});

await prueba('rellenos: uno solo, con calculadora por ml o por frasco Fraiche, y el precio sale entre los de la lista', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('.cat[data-cat="relleno"]');
  const nombres = await page.locator('.card h3').allTextContents();
  await page.click('.card .add[data-open="relleno-medida"]');
  const det = await page.textContent('#pDetalle');
  await page.selectOption('#pFrasco', { label: 'Liliana · Melón · 60 ml' });
  const mlFraiche = await page.inputValue('#pMl'), calc = await page.textContent('#pCalc');
  await page.fill('#pMl', '45');
  const linea = await page.textContent('#pOpciones label:has(input[value="linea"]) > b');
  await page.fill('#pMl', '10');
  const diez = await page.textContent('#pOpciones label:has(input[value="linea"]) > b');
  await page.fill('#pMl', '45');
  await page.fill('#pAroma', 'Aroma de prueba');
  await page.click('#pAgregar');
  const msg = await page.evaluate(() => window.tienda.mensaje());
  await ctx.close();
  assert.deepEqual(nombres, ['Relleno de perfume']);
  assert.ok(!nombres.includes('Relleno 4 ml') && !nombres.includes('Relleno 13 ml'), nombres.join(', '));
  assert.ok(!det.includes('undefined'), det);
  assert.equal(mlFraiche, '60'); assert.ok(calc.includes('60 ml') && calc.includes('$144') && calc.includes('$193'), calc);
  assert.equal(linea, '$109');   // entre 30 ml ($71) y 50 ml ($121)
  assert.equal(diez, '$21');     // igual que el relleno de 10 ml
  assert.ok(msg.includes('Relleno de perfume · 45 ml') && msg.includes('$109'), msg);
  assert.deepEqual(errors, []);
});

await prueba('En existencia: fotos reales, precio de venta (sin costos) y sale en su categoría', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('.cat[data-cat="existencia"]');
  const n = await page.locator('.card').count();
  const badges = await page.locator('.card .badge.exist').count();
  await page.click('.card .add[data-open="ex-body-250"]');
  const opciones = await page.locator('#pVar .var').count();
  const boton = await page.textContent('#pAgregar');
  const aroma = await page.isVisible('#aromaBox');
  const datos = await page.evaluate(() => JSON.stringify(window.EXISTENCIAS));
  const fotos = await page.evaluate(() => window.EXISTENCIAS.flatMap(p => [p.img, ...(p.var || []).map(v => v.img)]).filter(Boolean));
  await ctx.close();
  assert.ok(n >= 20 && badges === n - 1, `${n} productos, ${badges} con etiqueta`);   // el kit dice "¡Últimas 2!"
  assert.ok(opciones > 50, `${opciones} diseños`);
  assert.equal(boton, 'Agregar · $89');
  assert.ok(!aroma, 'un producto terminado no pide aroma');
  assert.ok(!/costo/i.test(datos), 'no deben ir costos en la página');
  for (const f of fotos) assert.ok(fs.existsSync(path.join(ROOT, f)), `falta ${f}`);
  assert.deepEqual(errors, []);
});

await prueba('agotados desde ajustes.js: la opción sale "agotado" y el botón no deja agregar', async () => {
  const { ctx, page, errors } = await abrir({ ajustes: { agotados: ['ex-veladoras:Tierna Lavanda', 'ex-pillow-mist'] } });
  await page.click('.cat[data-cat="existencia"]');
  const badge = await page.textContent('.card:has([data-open="ex-pillow-mist"]) .badge');
  await page.click('.card .add[data-open="ex-veladoras"]');
  const elegida = await page.textContent('#pVar .var:has(input:checked) .vn');
  await page.click('#pVar .var:has-text("Tierna Lavanda")');
  const ago = await page.isDisabled('#pAgregar'), texto = await page.textContent('#pAgregar');
  await ctx.close();
  assert.equal(badge, 'Agotado');
  assert.equal(elegida, 'Encanto de Azahar');
  assert.ok(ago && texto === 'Agotado por ahora', texto);
  assert.deepEqual(errors, []);
});

await prueba('test de aroma: 4 preguntas y recomienda aromas del género y la esencia elegidos', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('.quiz-cta');
  for (const v of ['Caballero', 'fresco', 'dia', 'arabe']) await page.click(`#quizIn [data-qv="${v}"]`);
  const res = await page.locator('#quizIn .qa small').allTextContents();
  await page.click('#quizIn [data-qpedir] >> nth=0');
  const tam = await page.isVisible('#dlgTam[open]');
  await ctx.close();
  assert.ok(res.length >= 3, `${res.length} aromas`);
  assert.ok(res.every(s => /^(Caballero|Unisex) · Esencia árabe$/.test(s)), res.join(' | '));
  assert.ok(tam, 'abre la ventana de tamaños');
  assert.deepEqual(errors, []);
});

await prueba('aromas parecidos en la ventana de tamaños, y al tocar uno cambia el aroma', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('#btnBuscar'); await page.fill('#q', '212 VIP Black');
  await page.click('#aromasRes .acard:has(h3:text-is("212 VIP Black")) .pedir');
  const chips = await page.locator('#tFicha .chip-aroma').allTextContents();
  await page.click('#tFicha .chip-aroma >> nth=0');
  const nuevo = await page.textContent('#tFicha .ficha b');
  await ctx.close();
  assert.ok(chips.length >= 2 && !chips.includes('212 VIP Black'), chips.join(', '));
  assert.equal(nuevo, chips[0]);
  assert.deepEqual(errors, []);
});

await prueba('categorías: se ven las principales y "Más" muestra las demás; botón de WhatsApp y vista previa', async () => {
  const { ctx, page, errors } = await abrir();
  const antes = await page.locator('#cats .cat:not(.mas-cats)').count();
  await page.click('[data-mascats]');
  const despues = await page.locator('#cats .cat:not(.mas-cats)').count();
  const wa = await page.getAttribute('#waFlota', 'href');
  const og = await page.getAttribute('meta[property="og:image"]', 'content');
  await ctx.close();
  assert.ok(antes <= 7 && despues > antes + 8, `${antes} → ${despues}`);
  assert.ok(wa.startsWith('https://wa.me/52'), wa);
  assert.ok(og.endsWith('img/compartir.jpg') && fs.existsSync(path.join(ROOT, 'img/compartir.jpg')), og);
  assert.deepEqual(errors, []);
});

await prueba('repetir el último pedido desde el carrito vacío', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('.cat[data-cat="existencia"]');
  await page.click('.card .add[data-open="ex-baby"]');
  await page.click('#pAgregar');
  await page.click('#btnCarrito');
  await page.click('#enviar');
  await page.click('#okCerrar');
  await page.click('#btnCarrito');
  const visible = await page.isVisible('#repetir');
  await page.click('#repetir');
  const items = await page.locator('#items .item').count();
  await ctx.close();
  assert.ok(visible, 'sale el botón');
  assert.equal(items, 1);
  assert.deepEqual(errors.filter(e => !/wa\.me/.test(e)), []);
});

await prueba('negocio y reseñas desde ajustes.js (y no salen si están vacíos)', async () => {
  const a = await abrir({ ajustes: {} });
  const vacio = await a.page.isHidden('#negocio') && await a.page.isHidden('#resenas');
  await a.ctx.close();
  const { ctx, page, errors } = await abrir({ ajustes: { negocio: { horario: 'Lunes a sábado de 10 a 7' }, resenas: [{ nombre: 'Ana', texto: 'Me encantó', estrellas: 5 }] } });
  const neg = await page.textContent('#negocio'), res = await page.textContent('#resenas');
  await ctx.close();
  assert.ok(vacio, 'vacíos no se ven');
  assert.ok(neg.includes('Lunes a sábado de 10 a 7') && res.includes('Me encantó'), neg + res);
  assert.deepEqual(errors, []);
});

await prueba('panel.html genera un ajustes.js válido', async () => {
  const { ctx, page, errors } = await abrir({ ruta: 'panel.html' });
  await page.fill('#horario', 'Lunes a viernes');
  await page.fill('#buscaAgo', 'veladoras');
  await page.check('[data-ago="ex-veladoras:Tierna Lavanda"]');
  await page.fill('#reTexto', 'Muy buen servicio'); await page.click('#reAgregar');
  const txt = await page.evaluate(() => window.panel.archivo());
  await ctx.close();
  const w = {}; new Function('window', txt)(w);
  assert.equal(w.AJUSTES.negocio.horario, 'Lunes a viernes');
  assert.deepEqual(w.AJUSTES.agotados, ['ex-veladoras:Tierna Lavanda']);
  assert.equal(w.AJUSTES.resenas[0].texto, 'Muy buen servicio');
  assert.deepEqual(errors, []);
});

await prueba('bodys: uno solo de 250 ml a $89 y uno de 100 ml a $60, sin repetidos; sprays Neeche a $116', async () => {
  const { ctx, page, errors } = await abrir();
  const r = await page.evaluate(() => {
    const by = Object.fromEntries(window.tienda.P.map(p => [p.id, p]));
    const clave = n => n.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
    const rep = id => by[id].var.map(v => clave(v.n)).filter((k, i, a) => a.indexOf(k) !== i);
    return { p250: by['ex-body-250'].precios.linea, p100: by['ex-body-100'].precios.linea, spray: by['ex-spray'].precios.linea,
      n250: by['ex-body-250'].var.length, rep250: rep('ex-body-250'), rep100: rep('ex-body-100'),
      tropical: by['ex-body-250'].var.filter(v => clave(v.n) === 'tropicalsummerdays').length };
  });
  await page.click('[data-mascats]'); await page.click('.cat[data-cat="bodys"]');
  const lista = await page.locator('.card h3').allTextContents();
  const precios = await page.locator('.card .price b').allTextContents();
  await ctx.close();
  assert.deepEqual([r.p250, r.p100, r.spray], [89, 60, 116], JSON.stringify(r));
  assert.ok(r.n250 >= 50, `${r.n250} diseños de 250 ml`);
  assert.deepEqual([r.rep250, r.rep100, r.tropical], [[], [], 1], JSON.stringify(r));
  assert.ok(lista.filter(n => /Tropical|Celebrities$|Gelato|Momentos|SHE/.test(n)).length === 0, lista.join(' | '));
  assert.ok(!precios.includes('$42') && !precios.includes('$39'), precios.join(' '));   // $87 solo el Everyday de 200 ml
  assert.deepEqual(errors, []);
});

await prueba('iconos de categorías con foto real de un producto', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('[data-mascats]');
  const srcs = await page.locator('#cats .cat:not(.mas-cats) .ring img').evaluateAll(l => l.map(i => i.getAttribute('src')));
  const cats = await page.locator('#cats .cat:not(.mas-cats)').count();
  await ctx.close();
  assert.equal(srcs.length, cats);
  for (const s of srcs) assert.ok(fs.existsSync(path.join(ROOT, s)), `falta ${s}`);
  assert.deepEqual(errors, []);
});

await prueba('Kit Keep Hands Clean a $49, "¡Últimas 2!" y no deja pedir más de 2; difusor de 95 ml a $82', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('.cat[data-cat="existencia"]');
  const badge = await page.textContent('.card:has([data-open="ex-keep-hands"]) .badge');
  await page.click('.card .add[data-open="ex-keep-hands"]');
  for (let i = 0; i < 3; i++) await page.click('#pMas');
  const cant = await page.textContent('#pCant'), boton = await page.textContent('#pAgregar');
  const dif = await page.evaluate(() => { const p = window.tienda.P.find(x => x.id === 'difusores-95'); return [p.precios && p.precios.linea, !!p.prox]; });
  await ctx.close();
  assert.equal(badge, '¡Últimas 2!');
  assert.equal(cant, '2'); assert.equal(boton, 'Agregar · $98');
  assert.deepEqual(dif, [82, false]);
  assert.deepEqual(errors, []);
});

await prueba('en celular real (con animaciones) la página no queda más ancha que la pantalla', async () => {
  for (const nuevo of [false, true]) {
    const { ctx, page, errors } = await abrir({ movil: true, calma: false, nuevo });
    await page.waitForTimeout(2500);
    const w = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
    await ctx.close();
    assert.deepEqual(w, [390, 390], `ancho ${w} (bienvenida: ${nuevo})`);
    assert.deepEqual(errors, []);
  }
});

await prueba('bienvenida: sale solo la primera vez y no vuelve a salir al recargar', async () => {
  const { ctx, page, errors } = await abrir({ nuevo: true });
  await page.waitForSelector('#dlgBienvenida[open]');
  const titulo = await page.textContent('#bvTitulo'), pasos = await page.locator('.bv-pasos li').count();
  await page.click('#bvEmpezar');
  const cerrada = await page.isHidden('#dlgBienvenida');
  await page.reload(); await page.waitForTimeout(1200);
  const otraVez = await page.isVisible('#dlgBienvenida');
  await ctx.close();
  assert.equal(titulo, '¡Bienvenido!'); assert.equal(pasos, 4);
  assert.ok(cerrada && !otraVez, `cerrada ${cerrada}, otra vez ${otraVez}`);
  assert.deepEqual(errors, []);
});

// manda un pedido de un Baby Cologne ($54) y cierra la confirmación; devuelve el mensaje de WhatsApp
async function comprar(page, { transferencia = false } = {}) {
  await page.evaluate(() => { window.__abiertos = []; window.open = u => { window.__abiertos.push(u); return null; }; });
  await page.click('.cat[data-cat="existencia"]');
  await page.click('.card .add[data-open="ex-baby"]');
  await page.click('#pAgregar');
  await page.click('#btnCarrito');
  const nota = await page.textContent('#tarjetaNota'), total = await page.textContent('#total');
  if (transferencia) await page.check('input[name=pago][value="Transferencia"]', { force: true });
  const pagoCarrito = await page.textContent('#pagoBox');
  await page.click('#enviar');
  await page.waitForSelector('#dlgOk[open]');
  const sello = await page.textContent('#okSello'), pago = await page.isVisible('#okPago') ? await page.textContent('#okPago') : '';
  const folio = (await page.textContent('#okFolio')).replace('Folio ', '');
  await page.click('#okCerrar');
  const url = await page.evaluate(() => window.__abiertos.pop());
  return { nota, total, sello, pago, pagoCarrito, folio, msg: decodeURIComponent(url.split('text=')[1]) };
}

await prueba('tarjeta: mandar el pedido NO sella; queda "esperando pago" y salen los datos para transferir', async () => {
  const { ctx, page, errors } = await abrir();
  await page.click('.bottom [data-go="tarjeta"]');
  const vacia = await page.textContent('#tjEstado');
  await page.click('#dlgTarjeta .close');
  const ef = await comprar(page);   // efectivo: sin datos de transferencia
  const c = await comprar(page, { transferencia: true });
  const badgeOculto = await page.isHidden('#sellosNav');
  await page.click('.bottom [data-go="tarjeta"]');
  const sellos = await page.locator('.tj-s.lleno').count(), hist = await page.textContent('#tjHist');
  await ctx.close();
  assert.ok(vacia.includes('Aún no tienes sellos'), vacia);
  assert.ok(c.nota.includes('Cuando confirme tu pago') && c.nota.includes('1 de 8') && c.total === '$54', c.nota + ' ' + c.total);
  assert.ok(c.msg.includes('Tarjeta de fidelidad: compra 1 de 8'), c.msg);
  assert.ok(c.sello.includes('Cuando confirme tu pago'), c.sello);
  assert.ok(ef.pagoCarrito.includes('efectivo') && ef.pago === '' && ef.msg.includes('Pago: Efectivo'), ef.pagoCarrito + ef.msg);
  assert.ok(c.pagoCarrito.includes('7289 6900 0167 2313 97') && c.pagoCarrito.includes('Ricardo'), c.pagoCarrito);
  assert.ok(c.pago.includes('Spin by OXXO') && c.pago.includes('7289 6900 0167 2313 97') && c.pago.includes(c.folio), c.pago);
  assert.ok(c.msg.includes('Pago: Transferencia'), c.msg);
  assert.ok(badgeOculto && sellos === 0, `sin sellos: ${sellos}`);
  assert.ok(hist.includes('Esperando confirmación de pago') && hist.includes(c.folio), hist);
  assert.deepEqual(errors, []);
});

await prueba('panel → link de sello firmado: sella una sola vez; links falsos o alterados no sirven', async () => {
  // 1) el vendedor crea su llave y sella el folio de un pedido en su panel
  const p = await abrir({ ruta: 'panel.html' });
  await p.page.evaluate(() => { window.open = () => null; });
  await p.page.click('#crearLlave');
  await p.page.waitForSelector('#sFolio');
  const pub = await p.page.evaluate(() => window.panel.llave.publica);
  const ajustesJs = await p.page.evaluate(() => window.panel.archivo());
  // 2) el cliente hace su pedido con la tienda que ya tiene la llave pública
  const ajustes = { pago: { banco: 'Spin by OXXO', clabe: '728969000167231397', titular: 'Ricardo' }, llaveSellos: pub };
  const cli = await abrir({ ajustes });
  const c = await comprar(cli.page);
  await p.page.fill('#sFolio', c.folio.toLowerCase());
  await p.page.fill('#sCliente', 'Ana García');
  await p.page.click('#sSellar');
  await p.page.waitForSelector('#sLink');
  const link = await p.page.inputValue('#sLink');
  const lista = await p.page.textContent('#sLista');
  const malFolio = async f => { await p.page.fill('#sFolio', f); await p.page.fill('#sCliente', 'X'); await p.page.click('#sSellar'); return p.page.textContent('#sResultado'); };
  const err = await malFolio('F-12');
  await p.ctx.close();
  // 3) el cliente abre su link: se sella; abrirlo otra vez no suma
  const hash = link.slice(link.indexOf('#'));
  await cli.page.evaluate(h => { location.hash = h; }, hash);
  await cli.page.waitForSelector('#dlgTarjeta[open]');
  const aviso1 = await cli.page.textContent('#tjAviso'), sellos1 = await cli.page.locator('.tj-s.lleno').count();
  const pend = await cli.page.textContent('#tjHist');
  await cli.page.click('#dlgTarjeta .close');
  await cli.page.evaluate(h => { location.hash = ''; location.hash = h; }, hash);
  await cli.page.waitForSelector('#dlgTarjeta[open]');
  const aviso2 = await cli.page.textContent('#tjAviso');
  await cli.page.click('#dlgTarjeta .close');
  // un link con otro folio pero la misma firma (trampa) no sirve
  const trampa = hash.replace(c.folio, 'F-010101-0101-AAAA');
  await cli.page.evaluate(h => { location.hash = ''; location.hash = h; }, trampa);
  await cli.page.waitForSelector('#dlgTarjeta[open]');
  const aviso3 = await cli.page.textContent('#tjAviso'), sellos3 = await cli.page.locator('.tj-s.lleno').count();
  const badge = await cli.page.textContent('#sellosNav');
  await cli.ctx.close();
  assert.ok(ajustesJs.includes(pub.x), 'ajustes.js descargado lleva la llave pública');
  assert.ok(link.startsWith('https://fraichedistribuidor.github.io/#sello=' + c.folio + '.'), link);
  assert.ok(lista.includes('Ana García') && lista.includes('1 de 8'), lista);
  assert.ok(err.includes('Revisa el folio'), err);
  assert.ok(aviso1.includes('Sello agregado') && sellos1 === 1 && !pend.includes('Esperando'), `${aviso1} · ${sellos1} · ${pend}`);
  assert.ok(aviso2.includes('ya estaba sellado'), aviso2);
  assert.ok(aviso3.includes('no es válido') && sellos3 === 1 && badge === '1', `${aviso3} · ${sellos3}`);
  assert.deepEqual([...p.errors, ...cli.errors], []);
});

await prueba('tarjeta: en la 8ª compra hay 10% de descuento con folios anteriores; un 2º pedido pendiente ya no repite el descuento', async () => {
  const sellos = Array.from({ length: 7 }, (_, i) => ({ folio: `F-0${i + 1}0126-1200-ABCD`, fecha: '2026-01-0' + (i + 1), total: 100 }));
  const { ctx, page, errors } = await abrir({ tarjeta: { sellos, canjes: 0 } });
  await page.click('.bottom [data-go="tarjeta"]');
  const estado = await page.textContent('#tjEstado');
  await page.click('#dlgTarjeta .close');
  const c = await comprar(page);
  const c2 = await comprar(page);
  await ctx.close();
  assert.ok(estado.includes('próxima compra tiene 10%'), estado);
  assert.ok(c.nota.includes('8ª compra') && c.total === '$49', c.nota + ' ' + c.total);   // $54 − $5
  assert.ok(c.msg.includes('Descuento tarjeta de fidelidad (8ª compra, 10%): −$5') && c.msg.includes('*Total: $49*')
    && c.msg.includes('compra 8 de 8') && c.msg.includes('F-010126-1200-ABCD'), c.msg);
  assert.ok(c.sello.includes('10% de descuento'), c.sello);
  assert.equal(c2.total, '$54');
  assert.deepEqual(errors, []);
});

await prueba('al elegir esencia neeche, el buscador de aromas muestra solo aromas neeche', async () => {
  const { ctx, page } = await abrir();
  await page.click('.cat[data-cat="nuevo"]');
  await page.click('.card .add[data-open="nuevo-30"]');
  await page.check('#pOpciones input[value="neeche"]');
  const tipo = await page.textContent('#pAromaTipo');
  await page.click('#pGen button[data-gen="Dama"]');
  await page.fill('#pAroma', 'vainilla');
  const n = await page.locator('#pAromas .aroma').count();
  await page.click('#pAromas .aroma >> nth=0');
  const elegido = await page.isVisible('#pAromaSel .ficha');
  const todos = await page.evaluate(() => [...document.querySelectorAll('#pAromas .aroma')].map(b => window.tienda.AROMAS[+b.dataset.aroma]));
  await ctx.close();
  assert.ok(/aromas en esencia neeche/.test(tipo), tipo);
  assert.ok(n > 0, 'sin resultados');
  assert.ok(elegido, 'tocar un aroma de la lista debe elegirlo');
  assert.ok(todos.every(a => a.e === 'neeche' && a.g === 'Dama' && /vainilla/i.test(a.n + a.nota)), JSON.stringify(todos.slice(0, 3)));
});

await prueba('sección Aromas: filtra por género (Caballero) y esencia (árabe)', async () => {
  const { ctx, page } = await abrir();
  await page.click('.cat[data-cat="aromas"]');
  const total = await page.textContent('#conteo');
  await page.click('.pill[data-agen="Caballero"]');
  await page.click('.pill[data-atipo="arabe"]');
  const det = await page.locator('.acard .det').allTextContents();
  await ctx.close();
  assert.ok(parseInt(total) > 900, total);
  assert.ok(det.length > 10 && det.every(d => d === 'Caballero · Esencia árabe'), det.slice(0, 3).join(' | '));
});

await prueba('pedido con envío: pide lugar, manda fecha y hora, y muestra "Pedido realizado"', async () => {
  const { ctx, page, errors } = await abrir({ ajustes: { negocio: { ocupado: [{ dias: [1, 2, 3, 4, 5], desde: '17:00', hasta: '21:00', motivo: 'De lunes a viernes de 5:00 a 9:00 pm estoy en clases' }] } } });
  await page.evaluate(() => { window.__abiertos = []; window.open = (u) => { window.__abiertos.push(u); return null; }; });
  await page.click('.cat[data-cat="nuevo"]');
  await page.click('.card .add[data-open="nuevo-16"]');
  await page.click('#pAgregar');
  await page.click('#btnCarrito');
  await page.check('input[name=entrega][value="Envío"]', { force: true });
  await page.click('#enviar');
  const sinLugar = await page.evaluate(() => window.__abiertos.length);
  await page.fill('#cDir', 'Av. Juárez 10, Centro');
  await page.fill('#cFecha', '2030-05-17');   // viernes
  await page.fill('#cHora', '17:30');          // en clases: avisa y no envía
  await page.dispatchEvent('#cHora', 'change');
  const aviso = await page.textContent('#horaNota');
  await page.click('#enviar');
  const enClase = await page.evaluate(() => window.__abiertos.length);
  await page.fill('#cHora', '12:30');
  await page.dispatchEvent('#cHora', 'change');
  const sinAviso = await page.isHidden('#horaNota');
  await page.click('#enviar');
  await page.waitForSelector('#dlgOk[open]');
  const url = await page.evaluate(() => window.__abiertos[0]);
  const ok = await page.textContent('#dlgOk');
  const carrito = await page.evaluate(() => window.tienda.cart.length);
  await ctx.close();
  const msg = decodeURIComponent(url.split('text=')[1]);
  assert.equal(sinLugar, 0, 'no debe enviar sin lugar de entrega');
  assert.ok(url.startsWith('https://wa.me/525574348740?text='), url);
  assert.ok(aviso.includes('estoy en clases') && enClase === 0 && sinAviso, `${aviso} · ${enClase} · ${sinAviso}`);
  assert.ok(msg.includes('Entrega: Punto de encuentro') && msg.includes('Punto de encuentro: Av. Juárez 10, Centro') && /viernes, 17 de mayo, 12:30 h/.test(msg) && /\(F-\d{6}-\d{4}-[2-9A-HJKMNP-Z]{4}\)/.test(msg), msg);
  assert.ok(ok.includes('¡Pedido realizado!') && ok.includes('Av. Juárez 10') && ok.includes('Punto de encuentro') && ok.includes('te confirmo el punto de encuentro'), ok);
  assert.equal(carrito, 0);
  assert.deepEqual(errors, []);
});

await browser.close(); server.close();
console.log(fails ? `\n${fails} prueba(s) fallaron` : '\nTodo en orden ✔');
process.exit(fails ? 1 : 0);
