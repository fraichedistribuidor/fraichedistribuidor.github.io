// Productos que ya tienes en existencia (Recurso 2 · Producto terminado), para entrega inmediata.
// Fotos reales recortadas en img/existencia/. Precio = tu precio de venta (sin costos).
// precio: null = "Pregunta" (precio por confirmar). quedan: 2 = pocas piezas (sale "¡Últimas 2!"). Para quitar uno que se acabó, ponle agotado:true
// (o agotado:true a una variante); para quitarlo de la página, borra su línea.
(function () {
  const F = n => `img/existencia/${n}.webp`;
  const V = (pre, nombres) => nombres.map(([n, f]) => ({ n, img: F(pre + f) }));
  window.EXISTENCIAS = [
    { id: 'ex-disney', cat: 'ninos', nombre: 'Agua de colonia Disney', tipo: 'Agua de colonia', cont: '70 ml', precio: 91,
      var: V('disney-', [['Toy Story Marcianitos', 'toy-story-marcianitos'], ['Stitch', 'stitch'], ['Toy Story Woody', 'toy-story-woody'], ['Minecraft', 'minecraft'],
        ['Cars', 'cars'], ['Princess', 'princess'], ['Frozen', 'frozen'], ['Spider-Man', 'spider-man']]) },
    { id: 'ex-clean', cat: 'cremas', nombre: 'Línea Clean y Relax Time', tipo: 'Cuidado facial',
      var: [{ n: 'Clean Contorno de ojos 20 g', img: F('clean-contorno-ojos'), precio: 96 }, { n: 'Clean Sérum facial 55 ml', img: F('clean-serum-facial'), precio: 126 },
        { n: 'Clean Agua micelar 255 ml', img: F('clean-agua-micelar'), precio: 79 }, { n: 'Clean Crema facial 100 g', img: F('clean-crema-facial'), precio: 116 },
        { n: 'Relax Time Sérum facial 55 ml', img: F('relax-time-serum'), precio: 146 }] },
    { id: 'ex-veladoras', cat: 'velas', nombre: 'Veladoras', tipo: 'Vela aromática', cont: '250 g', precio: 179,
      var: V('vela-', [['Encanto de Azahar', 'encanto-de-azahar'], ['Tierna Lavanda', 'tierna-lavanda']]).concat([
        { n: 'Full Cycle', img: F('vela-full-cycle') }, { n: 'Pastel de Cumpleaños', img: F('vela-pastel-de-cumpleanos') },
        { n: 'Bella', img: F('vela-bella') }, { n: 'Flor Eterna' }]) },
    { id: 'ex-pillow-mist', cat: 'casa', nombre: 'Pillow Mist Brisa de Verano', tipo: 'Fragancia textil', cont: '250 ml', precio: 99, img: F('pillow-mist-brisa-de-verano') },
    { id: 'ex-hair-mist', cat: 'cabello', nombre: 'Hair Mist Flor de Cactus', tipo: 'Perfume para cabello', cont: '150 ml', precio: 108, img: F('hair-mist-flor-de-cactus') },
    { id: 'ex-afeitar', cat: 'cremas', nombre: 'Para afeitar', tipo: 'Cuidado masculino',
      var: [{ n: 'Crema para afeitar Alpha 100 g', img: F('crema-afeitar-alpha'), precio: 78 }, { n: 'After shave Fresh Man 100 ml', img: F('after-shave-fresh-man'), precio: 66 }] },
    { id: 'ex-atomizador', cat: 'accesorios', nombre: 'Atomizador multiusos', tipo: 'Atomizador', cont: '300 ml', precio: 149,
      var: V('atomizador-', [['Negro', 'negro'], ['Amarillo', 'amarillo']]) },
    { id: 'ex-love', cat: 'desodorantes', nombre: 'LOVE Antitranspirante', tipo: 'Antitranspirante en aerosol', cont: '150 ml', precio: 69, img: F('love-antitranspirante') },
    { id: 'ex-hair-oil', cat: 'cabello', nombre: 'Hair Oil óleo capilar', tipo: 'Óleo capilar', cont: '60 ml', precio: 68.5, img: F('hair-oil') },
    { id: 'ex-gelato-crema', cat: 'cremas', nombre: 'Crema corporal Gelató', tipo: 'Crema corporal', cont: '180 g', precio: 67,
      var: V('gelato-crema-', [['Postre de Avellana', 'postre-de-avellana'], ['Crema de Pistache', 'pistache']]) },
    { id: 'ex-soft-skin', cat: 'cremas', nombre: 'Soft Skin crema corporal', tipo: 'Crema corporal', cont: '360 ml', precio: 47,
      var: V('soft-skin-', [['Ultra Hidratación', 'ultra'], ['Hidratación Intensa', 'intensa'], ['Extra Hidratación', 'extra']]) },
    { id: 'ex-paquetes', cat: 'regalos', nombre: 'Aguas de colonia en paquete', tipo: 'Paquete de regalo', cont: '3 × 20 ml', precio: 279,
      var: V('paquete-', [['Gelató Collection', 'gelato-collection'], ['Samurai Pet', 'samurai-pet'], ['Country and City Kids', 'country-and-city-kids']]) },
    { id: 'ex-protector', cat: 'cremas', nombre: 'Protector solar Fun in the Sun', tipo: 'Protector solar FPS 50+',
      var: [{ n: 'Facial 50 ml', img: F('fun-in-the-sun-facial'), precio: 179 }, { n: 'Corporal 150 ml', img: F('fun-in-the-sun-corporal'), precio: 205.5 }] },
    { id: 'ex-keep-hands', cat: 'cremas', nombre: 'Kit Keep Hands Clean', tipo: 'Kit de higiene', precio: 49, quedan: 2, img: F('keep-hands-clean') },
    { id: 'ex-fraicheur', cat: 'casa', nombre: 'Fraicheur Mandarina', tipo: 'Aromatizante en spray', cont: '125 ml', precio: 57, img: F('fraicheur-mandarina') },
    { id: 'ex-max-repel', cat: 'cremas', nombre: 'Max Repel', tipo: 'Repelente de insectos', cont: '70 ml', precio: 40, img: F('max-repel') },
    { id: 'ex-bold', cat: 'desodorantes', nombre: 'Bold desodorante', tipo: 'Desodorante en aerosol', cont: '150 ml', precio: 69, img: F('bold-desodorante') },
    { id: 'ex-carlota-aroma', cat: 'casa', nombre: 'Carlota de Limón aromatizante', tipo: 'Aromatizante de ambiente', cont: '250 ml', precio: 53, img: F('carlota-de-limon-aromatizante') },
    { id: 'ex-body-100', cat: 'bodys', nombre: 'Body mist 100 ml', tipo: 'Loción corporal', cont: '100 ml', precio: 60,
      var: V('body100-', [['Starry Soul', 'starry-soul'], ['SHE Only Good Vibes', 'she-only-good-vibes'], ['Dulce Gomita', 'dulce-gomita']]) },
    // Bodys: todos los de 250 ml a $89 y los de 100 ml a $60. La tienda agrega sola los diseños del catálogo;
    // aquí van los que tienes en existencia (salen primero, marcados).
    { id: 'ex-body-250', cat: 'bodys', nombre: 'Body mist 250 ml', tipo: 'Loción corporal', cont: '250 ml', precio: 89,
      var: V('body250-', [['Parisian Legacy', 'parisian-legacy'], ['Sol de los Cabos', 'sol-de-los-cabos'], ['Sun and Plum', 'sun-and-plum'], ['Brisa de Acapulco', 'brisa-de-acapulco'],
        ['Intense Night', 'intense-night'], ['Elektrik Aqua', 'elektrik-aqua'], ['Pitahaya and Playa', 'pitahaya-and-playa'], ['Feline Charm', 'feline-charm'],
        ['Beso de Cereza', 'beso-de-cereza'], ['Perla de Mazatlán', 'perla-de-mazatlan'], ['Postre de Avellana', 'postre-de-avellana'], ['Olas de Puerto Vallarta', 'olas-de-puerto-vallarta'],
        ['Carlota de Limón', 'carlota-de-limon'], ['Dulce Gomita', 'dulce-gomita'], ['Gold Lilies', 'gold-lilies'], ["Selena's Secret", 'selenas-secret'], ['Queen', 'queen'],
        ['Glimmers of Fantasy', 'glimmers-of-fantasy'], ['Entre Besos', 'entre-besos'], ['Sugar Bliss', 'sugar-bliss'], ['Berry Chic', 'berry-chic'], ['Velvet Night', 'velvet-night'],
        ['Heaven Whisper', 'heaven-whisper'], ['Air Essence', 'air-essence'], ['Tropical Summer Days', 'tropical-summer-days'], ['Océano Brillante', 'oceano-brillante'],
        ['Sexy Musk', 'sexy-musk'], ['Vision Fresh', 'vision-fresh']]).concat([{ n: 'SHE', img: F('she-locion-250') }]) },
    { id: 'ex-spray', cat: 'bodys', nombre: 'Spray corporal Neeche Passion', tipo: 'Spray corporal', cont: '120 ml', precio: 116,
      var: V('spray-', [['Nomadic Man', 'nomadic-man'], ['Coastal Breeze', 'coastal-breeze'], ['Red Rouge', 'red-rouge'], ['Santalum', 'santalum'],
        ['Energetic Cherry', 'energetic-cherry'], ['Vanilla Smoke', 'vanilla-smoke']]) },
    { id: 'ex-baby', cat: 'ninos', nombre: 'Baby Cologne', tipo: 'Agua de colonia para bebé', cont: '60 ml', precio: 54,
      var: V('baby-cologne-', [['Azul', 'azul'], ['Rosa', 'rosa']]) },
  ];
})();
