# Recorta cada producto (quita el fondo gris) y lo pone centrado sobre fondo blanco, 700x700, con sombra suave.
# Uso: python3 recorta.py <carpeta_scratchpad> <carpeta_salida>
import sys, os, numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage
from rembg import remove, new_session
sys.path.insert(0, sys.argv[1]); from nombres import PDF2, PDF3
S, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
ses = new_session('isnet-general-use')

def recorte(src):
    im = Image.open(src).convert('RGB')
    a = np.array(remove(im, session=ses, only_mask=True, post_process_mask=True)).astype(np.float32) / 255
    m = a > .5
    lab, n = ndimage.label(m)                       # solo la pieza más grande (el producto)
    if n > 1:
        tam = ndimage.sum(m, lab, range(1, n + 1)); keep = 1 + int(np.argmax(tam))
        grandes = [i + 1 for i, t in enumerate(tam) if t > tam.max() * .15]   # piezas grandes (p. ej. dos frascos)
        m = np.isin(lab, grandes)
    lleno = ndimage.binary_fill_holes(m)            # vidrio transparente: se conserva lo de adentro
    alpha = np.where(lleno & ~m, 1.0, np.where(m, np.maximum(a, .0), 0))
    alpha = np.clip(alpha, 0, 1)
    al = Image.fromarray((alpha * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.6))
    rgba = im.copy(); rgba.putalpha(al)
    bb = al.point(lambda v: 255 if v > 20 else 0).getbbox()
    return rgba.crop(bb)

def lienzo(p, S=700):
    c = Image.new('RGBA', (S, S), (255, 255, 255, 255))
    H, W = int(S * .82), int(S * .82)
    k = min(H / p.height, W / p.width); p = p.resize((max(1, int(p.width * k)), max(1, int(p.height * k))), Image.LANCZOS)
    base = int(S * .91); x = (S - p.width) // 2
    sh = Image.new('L', (S, S), 0); d = ImageDraw.Draw(sh)
    d.ellipse((x + p.width * .1, base - 9, x + p.width * .9, base + 9), fill=55)
    c.alpha_composite(Image.merge('RGBA', [Image.new('L', (S, S), 40)] * 3 + [sh.filter(ImageFilter.GaussianBlur(10))]))
    c.alpha_composite(p, (x, base - p.height))
    return c.convert('RGB')

trabajos = [(f'{S}/pdf2/{pg}_{i}.png', n) for pg, ns in PDF2.items() for i, n in enumerate(ns)]
trabajos += [(f'{S}/pdf3/p{i + 1:02d}_0.png', n) for i, n in enumerate(PDF3)]
solo = sys.argv[3:]   # opcional: rehacer solo algunos
for src, n in trabajos:
    if solo and n not in solo: continue
    lienzo(recorte(src)).save(f'{OUT}/{n}.webp', 'WEBP', quality=84, method=6)
    print(n, flush=True)
