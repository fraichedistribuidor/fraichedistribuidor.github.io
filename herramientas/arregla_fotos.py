# Arregla fotos del catálogo que venían mal recortadas (fondo negro, partes borradas) y rehace las fotos de grupo
# juntando las fotos individuales, todo sobre fondo blanco 700x700. Uso: python3 herramientas/arregla_fotos.py
import os, shutil, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = lambda p: os.path.join(RAIZ, p)
_ses = None

def sin_fondo(src):
    """Quita el fondo (de cualquier color) con rembg; se queda con las piezas grandes."""
    global _ses
    from rembg import remove, new_session
    _ses = _ses or new_session('isnet-general-use')
    im = Image.open(R(src)).convert('RGB')
    a = np.array(remove(im, session=_ses, only_mask=True, post_process_mask=True)).astype(np.float32) / 255
    m = a > .5
    lab, n = ndimage.label(m)
    if n > 1:
        tam = ndimage.sum(m, lab, range(1, n + 1))
        m = np.isin(lab, [i + 1 for i, t in enumerate(tam) if t > tam.max() * .15])
    lleno = ndimage.binary_fill_holes(m)
    alpha = np.clip(np.where(lleno & ~m, 1.0, np.where(m, a, 0)), 0, 1)
    al = Image.fromarray((alpha * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.6))
    im.putalpha(al)
    return im.crop(al.point(lambda v: 255 if v > 20 else 0).getbbox())

def sin_blanco(src):
    """Para fotos que ya están sobre blanco: vuelve transparente el blanco de alrededor."""
    im = Image.open(R(src)).convert('RGB')
    a = np.array(im).astype(int)
    m = ndimage.binary_fill_holes((255 - a.min(2)) > 12)
    al = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1))
    im.putalpha(al)
    return im.crop(al.getbbox())

def lienzo(piezas, alturas=None, S=700):
    alturas = alturas or [1] * len(piezas)
    c = Image.new('RGBA', (S, S), (255, 255, 255, 255))
    H, base = int(S * .8), int(S * .91)
    esc = [p.resize((max(1, int(p.width * H * h / p.height)), int(H * h)), Image.LANCZOS) for p, h in zip(piezas, alturas)]
    gap = int(S * .03); tot = sum(e.width for e in esc) + gap * (len(esc) - 1)
    if tot > S * .9:
        k = S * .9 / tot; esc = [e.resize((max(1, int(e.width * k)), max(1, int(e.height * k))), Image.LANCZOS) for e in esc]
        gap = int(gap * k); tot = sum(e.width for e in esc) + gap * (len(esc) - 1)
    sh = Image.new('L', (S, S), 0); d = ImageDraw.Draw(sh); x = (S - tot) // 2
    for e in esc: d.ellipse((x + e.width * .1, base - 9, x + e.width * .9, base + 9), fill=55); x += e.width + gap
    c.alpha_composite(Image.merge('RGBA', [Image.new('L', (S, S), 40)] * 3 + [sh.filter(ImageFilter.GaussianBlur(10))]))
    x = (S - tot) // 2
    for e in esc: c.alpha_composite(e, (x, base - e.height)); x += e.width + gap
    return c.convert('RGB')

def guarda(im, dst):
    im.save(R(dst), 'WEBP', quality=86, method=6); print(dst)

# 1) fotos individuales: las reales que tienes en vez de las mal recortadas
shutil.copy(R('img/existencia/figura-pulpo.webp'), R('img/pulpy-splash-1.webp')); print('img/pulpy-splash-1.webp')
shutil.copy(R('img/existencia/figura-osito.webp'), R('img/cute-girl-little-boy-2.webp')); print('img/cute-girl-little-boy-2.webp')
# 2) fondo negro u oscuro -> blanco
for f in ['img/cute-girl-little-boy-1.webp', 'img/fantasy-colonia-1.webp', 'img/fantasy-colonia-2.webp']:
    guarda(lienzo([sin_fondo(f)]), f)
# 3) fotos de grupo hechas con las individuales
guarda(lienzo([sin_blanco('img/pulpy-splash-1.webp'), sin_blanco('img/pulpy-splash-2.webp')]), 'img/pulpy-splash.webp')
guarda(lienzo([sin_blanco('img/cute-girl-little-boy-1.webp'), sin_blanco('img/cute-girl-little-boy-2.webp')]), 'img/cute-girl-little-boy.webp')
guarda(lienzo([sin_blanco('img/fantasy-colonia-1.webp'), sin_blanco('img/fantasy-colonia-2.webp')]), 'img/fantasy-colonia.webp')
guarda(lienzo([sin_blanco(f'img/desire-legend-{i}.webp') for i in (2, 3, 4, 5)], [1, 1, .8, .8]), 'img/desire-legend.webp')
guarda(lienzo([sin_blanco(f'img/liliana-{i}.webp') for i in (1, 3, 5)]), 'img/liliana.webp')
guarda(lienzo([sin_blanco('img/desire-legend-2.webp'), sin_blanco('img/desire-legend-5.webp'), sin_blanco('img/pulpy-splash-1.webp')], [1, .8, .7]), 'img/botellas/50.webp')
