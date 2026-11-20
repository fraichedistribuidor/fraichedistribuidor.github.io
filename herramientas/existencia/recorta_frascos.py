# Recorta las fotos de tus frascos (Recurso 1) y las deja en img/botellas/ sobre fondo blanco, 700x700.
# Uso: python3 recorta_frascos.py <carpeta con p01_0.png … p11_0.png> <carpeta img/botellas> [modelo]
# El texto que trae la foto ("Torso 100ml") se descarta: solo se queda la pieza más grande, que es el frasco.
import sys, os, numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage
from rembg import remove, new_session

SRC, OUT = sys.argv[1], sys.argv[2]
ses = new_session(sys.argv[3] if len(sys.argv) > 3 else 'isnet-general-use')
FRASCOS = {   # página del PDF -> archivo
    'p01_0': '120-dama-ice-rosa', 'p02_0': '100-dama-torso-woman-rojo', 'p03_0': '100-dama-torso-woman-arcoiris',
    'p04_0': '60-dama-liliana-lila', 'p05_0': '30-dama-liliana-lavanda', 'p06_0': '30-dama-zapatilla-azul',
    'p07_0': '16-unisex', 'p08_0': '60-caballero-perseo-turquesa', 'p09_0': '30-caballero-for-men-turquesa',
    'p10_0': '120-caballero-torso-man-teal',
}
solo = sys.argv[4:]

def recorte(src):
    im = Image.open(src).convert('RGB')
    a = np.array(remove(im, session=ses, only_mask=True, post_process_mask=True)).astype(np.float32) / 255
    m = a > .5
    lab, n = ndimage.label(m)
    if n > 1:                                   # solo el frasco (la pieza más grande); fuera el texto
        tam = ndimage.sum(m, lab, range(1, n + 1))
        m = lab == 1 + int(np.argmax(tam))
    lleno = ndimage.binary_fill_holes(m)        # vidrio transparente: se conserva lo de adentro
    alpha = np.clip(np.where(lleno & ~m, 1.0, np.where(m, a, 0)), 0, 1) * ndimage.binary_dilation(lleno, iterations=3)
    al = Image.fromarray((alpha * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.6))
    rgba = im.copy(); rgba.putalpha(al)
    return rgba.crop(al.point(lambda v: 255 if v > 20 else 0).getbbox())

def lienzo(p, S=700):
    c = Image.new('RGBA', (S, S), (255, 255, 255, 255))
    k = min(S * .82 / p.height, S * .82 / p.width)
    p = p.resize((max(1, int(p.width * k)), max(1, int(p.height * k))), Image.LANCZOS)
    base, x = int(S * .91), (S - p.width) // 2
    sh = Image.new('L', (S, S), 0)
    ImageDraw.Draw(sh).ellipse((x + p.width * .1, base - 9, x + p.width * .9, base + 9), fill=55)
    c.alpha_composite(Image.merge('RGBA', [Image.new('L', (S, S), 40)] * 3 + [sh.filter(ImageFilter.GaussianBlur(10))]))
    c.alpha_composite(p, (x, base - p.height))
    return c.convert('RGB')

for pg, nombre in FRASCOS.items():
    if solo and nombre not in solo: continue
    lienzo(recorte(os.path.join(SRC, pg + '.png'))).save(os.path.join(OUT, nombre + '.webp'), 'WEBP', quality=86, method=6)
    print(nombre, flush=True)
