'use strict';
/* =========================================================
   Efectos y animaciones (se carga después de tienda.js)
   Todo se apaga solo si el celular tiene "reducir movimiento".
   ========================================================= */
const fx = (() => {
  const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const capa = () => document.querySelector('dialog[open]') || document.body;   // los diálogos tapan todo lo demás
  const al = (a, b) => a + Math.random() * (b - a);

  // partículas: crea puntitos fijos y los anima; se borran solos
  function particulas(x, y, n, hacer, { colores, tam = [4, 9], dur = [700, 1300] }) {
    if (quieto()) return;
    const c = capa();
    // dentro de una ventana (con vidrio esmerilado) las partículas se ubican respecto a la ventana y su scroll
    let px = x, py = y, pos = 'fixed';
    if (c !== document.body) { const r = c.getBoundingClientRect(); px = x - r.left - c.clientLeft + c.scrollLeft; py = y - r.top - c.clientTop + c.scrollTop; pos = 'absolute'; }
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span'), d = al(...tam);
      s.className = 'fx-p';
      s.style.cssText = `position:${pos};left:${px}px;top:${py}px;width:${d}px;height:${d}px;background:${colores[i % colores.length]}`;
      c.append(s);
      s.animate(hacer(i), { duration: al(...dur), easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }).onfinish = () => s.remove();
    }
  }

  // 6) brisa de aroma: rocío que sube desde la foto del producto
  function rocio(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    particulas(r.left + r.width / 2, r.top + r.height * .55, 18, () => {
      const dx = al(-70, 70), dy = al(-120, -200);
      return [{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 },
        { transform: `translate(calc(-50% + ${dx * .4}px),calc(-50% + ${dy * .4}px)) scale(1)`, opacity: .9, offset: .25 },
        { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1.6)`, opacity: 0 }];
    }, { colores: ['rgba(43,184,169,.75)', 'rgba(201,178,138,.85)', 'rgba(255,255,255,.95)', 'rgba(11,133,124,.55)'], tam: [5, 13], dur: [900, 1500] });
  }

  // 5) chispas doradas al estampar un sello
  function chispas(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    particulas(r.left + r.width / 2, r.top + r.height / 2, 14, i => {
      const a = (i / 14) * Math.PI * 2, d = al(34, 60);
      return [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d}px)) scale(.2)`, opacity: 0 }];
    }, { colores: ['#f4c64e', '#fff3c4', '#e2a516'], tam: [4, 7], dur: [600, 900] });
  }

  // 8) confeti dorado (8ª compra y tarjeta completa)
  function confeti() {
    const w = innerWidth;
    particulas(w / 2, -10, 46, () => {
      const x = al(-w * .5, w * .5), y = al(innerHeight * .55, innerHeight * .95), g = al(-540, 540);
      return [{ transform: `translate(${x * .2}px,0) rotate(0)`, opacity: 1 },
        { transform: `translate(${x}px,${y}px) rotate(${g}deg)`, opacity: 0 }];
    }, { colores: ['#e2a516', '#f4c64e', '#0b857c', '#2bb8a9', '#ffffff', '#c9b28a'], tam: [6, 10], dur: [1400, 2300] });
  }

  // 1) vista previa de fotos: zoom suave y deslizar entre diseños
  let items = [], idx = 0;
  function abrirVer() {
    const p = actual; if (!p || p.medida) return;   // actual y vSel vienen de tienda.js
    items = (p.var || []).map((v, i) => ({ i, n: v.n, img: v.img })).filter(x => x.img);
    if (!items.length && p.img) items = [{ i: -1, n: p.nombre, img: p.img }];
    if (!items.length) return;
    idx = Math.max(0, items.findIndex(x => x.i === vSel));
    const tira = document.getElementById('verTira');
    tira.innerHTML = items.map((x, k) => `<figure data-k="${k}"><img src="${x.img}" alt="${x.n.replace(/"/g, '&quot;')}" decoding="async" ${Math.abs(k - idx) > 2 ? 'loading="lazy"' : ''}></figure>`).join('');
    document.getElementById('verElegir').hidden = items.length < 2 || items[0].i < 0;
    document.getElementById('dlgVer').showModal();
    tira.scrollLeft = idx * tira.clientWidth;
    pie();
  }
  function pie() {
    const x = items[idx]; if (!x) return;
    document.getElementById('verNombre').textContent = x.n;
    document.getElementById('verN').textContent = items.length > 1 ? `${idx + 1} de ${items.length}` : '';
  }
  function conectarVer() {
    const tira = document.getElementById('verTira');
    tira.addEventListener('scroll', () => { const k = Math.round(tira.scrollLeft / tira.clientWidth); if (k !== idx) { idx = k; pie(); tira.querySelectorAll('.zoom').forEach(f => f.classList.remove('zoom')); } }, { passive: true });
    // doble toque o doble clic: acercar donde tocaste
    tira.addEventListener('dblclick', e => {
      const f = e.target.closest('figure'); if (!f) return;
      const r = f.getBoundingClientRect(), im = f.querySelector('img');
      im.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      f.classList.toggle('zoom');
    });
    document.getElementById('verElegir').addEventListener('click', () => {
      const x = items[idx]; if (!x || x.i < 0) return;
      const r = document.querySelector(`#pVar input[value="${x.i}"]`);
      if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
      document.getElementById('dlgVer').close();
    });
    document.getElementById('verCerrar').addEventListener('click', () => document.getElementById('dlgVer').close());
    document.getElementById('pMedia').addEventListener('click', abrirVer);
  }

  // 9) encabezado que se encoge al bajar y regresa al subir
  function encabezado() {
    const top = document.querySelector('.top'); let y0 = scrollY, cola = false;
    addEventListener('scroll', () => {
      if (cola) return; cola = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        if (y > 90 && y > y0 + 4) top.classList.add('chico');
        else if (y < y0 - 4 || y < 40) top.classList.remove('chico');
        y0 = y; cola = false;
      });
    }, { passive: true });
  }

  function iniciar() { conectarVer(); encabezado(); }
  return { rocio, chispas, confeti, abrirVer, iniciar, quieto };
})();
fx.iniciar();
