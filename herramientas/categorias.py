# Iconos de categorías con foto real: recorta el producto (quita el blanco de sobra) y lo deja
# cuadrado de 200x200 sobre blanco, para que llene el círculo. Uso: python3 herramientas/categorias.py
# Para cambiar la foto de una categoría, cambia su archivo aquí y vuelve a correrlo.
import os
import numpy as np
from PIL import Image

FOTOS = {
    'todo': 'img/botellas/60.webp',
    'existencia': 'img/existencia/body250-sol-de-los-cabos.webp',
    'promos': 'img/existencia/kit-4you-vibes.webp',
    'aromas': 'img/existencia/mystic-vibrations-tauro.webp',
    'nuevo': 'img/botellas/120-caballero-torso-man-teal.webp',
    'relleno': 'img/botellas/30.webp',
    'envases': 'img/botellas/60-dama-liliana-transcendent-pink.webp',
    'regalos': 'img/existencia/paquete-country-and-city-kids.webp',
    'bodys': 'img/existencia/body250-parisian-legacy.webp',
    'cremas': 'img/existencia/soft-skin-extra.webp',
    'desodorantes': 'img/existencia/roll-on-azul.webp',
    'cabello': 'img/existencia/hair-mist-personalizable.webp',
    'maquillaje': 'img/esmaltes-8free-1.webp',
    'colonias': 'img/aguas-colonia-180-1.webp',
    'ninos': 'img/existencia/disney-stitch.webp',
    'velas': 'img/existencia/vela-tierna-lavanda.webp',
    'casa': 'img/existencia/fraicheur-mandarina.webp',
    'accesorios': 'img/existencia/atomizador-amarillo.webp',
}
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'img', 'categorias')
os.makedirs(SALIDA, exist_ok=True)


def icono(src, S=200, aire=.08):
    im = Image.open(os.path.join(RAIZ, src)).convert('RGB')
    a = np.array(im).astype(int)
    contenido = (255 - a.min(2)) > 18            # lo que no es blanco
    ys, xs = np.where(contenido)
    if len(xs):
        alto = ys.max() - ys.min()
        ys2 = ys[ys < ys.min() + alto * .97]         # sin la sombra de abajo
        im = im.crop((xs.min(), ys.min(), xs.max() + 1, (ys2.max() if len(ys2) else ys.max()) + 1))
    lado = int(max(im.size) * (1 + aire * 2))
    c = Image.new('RGB', (lado, lado), 'white')
    c.paste(im, ((lado - im.width) // 2, (lado - im.height) // 2))
    return c.resize((S, S), Image.LANCZOS)


for cat, src in FOTOS.items():
    icono(src).save(os.path.join(SALIDA, cat + '.webp'), 'WEBP', quality=86, method=6)
    print(cat)
