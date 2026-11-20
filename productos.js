// Catálogo de la tienda. Puedes editar nombres y precios aquí directamente.
// Precios = precio público de la lista F099 Cuautitlán con la rebaja:
//   -$3 desde $100, -$2 de $30 a $99, -$1 abajo de $30, sin centavos.
//   Fijos: 60 ml nuevo $212 / relleno $144, 30 ml nuevo $127 / relleno $71, 16 ml nuevo $73 / relleno $35 (esencia de línea).
// Perfumes nuevos: un producto por tamaño. Sus frascos son los de var (los tuyos, en img/botellas/) más todos los
// envases del catálogo de ese tamaño (catalogo.js), que la tienda agrega sola. Rellenos: cualquier tamaño.
// precios: linea = esencia de línea, neeche = esencia neeche, arabe = esencia árabe (solo las que existan).
// img: foto en img/ (las botellas reales están en img/botellas/); var: diseños de frasco con su foto.
// foto: pon el nombre del archivo que subas a tienda/fotos/ (ej. foto: 'perfume-60.jpg'); sin foto se ve el dibujo.
// medida: el cliente escribe cuántos ml tiene su frasco (desde 10 ml); el precio se calcula entre los rellenos de la lista.
// mostrar: true = también se ve en la tienda (los demás que no son perfume ni relleno ya vienen en catalogo.js).
// tags: popular (más pedidos), regalo (para regalo), pura (pura esencia).
window.PRODUCTOS = [
  {id:'nuevo-120',cat:'nuevo',nombre:'Perfume 120 ml',detalle:'Frasco nuevo',ilus:'frasco-grande',ml:'120',tags:['regalo'],precios:{linea:375,neeche:475,arabe:435},img:'img/botellas/120.webp',var:[{n:'Caballero · Torso Man teal',img:'img/botellas/120-caballero-torso-man-teal.webp'},{n:'Dama · Ice rosa',img:'img/botellas/120-dama-ice-rosa.webp'}]},
  {id:'nuevo-100',cat:'nuevo',nombre:'Perfume 100 ml',detalle:'Frasco nuevo',ilus:'frasco-grande',ml:'100',tags:[],precios:{linea:333,neeche:415,arabe:382},img:'img/botellas/100.webp',var:[{n:'Dama · Torso Woman rojo',img:'img/botellas/100-dama-torso-woman-rojo.webp'},{n:'Dama · Torso Woman arcoíris',img:'img/botellas/100-dama-torso-woman-arcoiris.webp'}]},
  {id:'nuevo-60',cat:'nuevo',nombre:'Perfume 60 ml',detalle:'Frasco nuevo',ilus:'frasco',ml:'60',tags:['popular'],precios:{linea:212,neeche:262,arabe:242},img:'img/botellas/60.webp',var:[{n:'Caballero · Perseo verde oscuro',img:'img/botellas/60-caballero-perseo-verde-oscuro.webp'},{n:'Caballero · Perseo turquesa',img:'img/botellas/60-caballero-perseo-turquesa.webp'},{n:'Caballero · Perseo azul',img:'img/botellas/60-caballero-perseo-indigo.webp'},{n:'Dama · Liliana fucsia',img:'img/botellas/60-dama-liliana-transcendent-pink.webp'},{n:'Dama · Liliana morado',img:'img/botellas/60-dama-liliana-lila.webp'},{n:'Dama · Liliana lila',img:'img/botellas/60-dama-liliana-lavanda.webp'},{n:'Dama · Liliana rosa',img:'img/botellas/60-dama-liliana-rosa.webp'}]},
  {id:'nuevo-50',cat:'nuevo',nombre:'Perfume 50 ml',detalle:'Frasco nuevo',ilus:'frasco',ml:'50',tags:[],precios:{linea:186,neeche:228,arabe:211},img:'img/desire-legend.webp'},
  {id:'nuevo-30',cat:'nuevo',nombre:'Perfume 30 ml',detalle:'Frasco nuevo',ilus:'frasco',ml:'30',tags:['popular'],precios:{linea:127,neeche:152,arabe:142},img:'img/botellas/30.webp',var:[{n:'Caballero · For Men azul',img:'img/botellas/30-caballero-for-men-humo-azul.webp'},{n:'Caballero · For Men turquesa',img:'img/botellas/30-caballero-for-men-turquesa.webp'},{n:'Caballero · For Men verde',img:'img/botellas/30-caballero-for-men-esmeralda.webp'},{n:'Dama · Zapatilla azul',img:'img/botellas/30-dama-zapatilla-azul.webp'},{n:'Dama · Liliana lila',img:'img/botellas/30-dama-liliana-lavanda.webp'},{n:'Dama · Liliana naranja',img:'img/botellas/30-dama-liliana-melon.webp'},{n:'Dama · Liliana rosa',img:'img/botellas/30-dama-liliana-rosa.webp'}]},
  {id:'nuevo-32',cat:'nuevo',nombre:'Perfume 32 ml',detalle:'Frasco nuevo',ilus:'frasco-chico',ml:'32',tags:[],precios:{linea:132,neeche:159,arabe:148},img:'img/existencia/kit-4you-vibes.webp',var:[{n:'Dama y caballero · 4YOU Peace amarillo',img:'img/botellas/32-unisex-4you-peace.webp'}]},
  {id:'nuevo-20',cat:'nuevo',nombre:'Perfume 20 ml',detalle:'Frasco nuevo',ilus:'frasco-chico',ml:'20',tags:[],precios:{linea:87,neeche:103,arabe:97},img:'img/botellas/20.webp'},
  {id:'nuevo-16',cat:'nuevo',nombre:'Perfume 16 ml',detalle:'Frasco nuevo',ilus:'frasco-chico',ml:'16',tags:['popular'],precios:{linea:73,neeche:85,arabe:80},img:'img/botellas/16-unisex.webp',var:[{n:'Dama y caballero · Blanco',img:'img/botellas/16-unisex.webp'}]},
  {id:'nuevo-15',cat:'nuevo',nombre:'Perfume 15 ml',detalle:'Frasco nuevo',ilus:'frasco-chico',ml:'15',tags:[],precios:{linea:68,neeche:80,arabe:75},img:'img/perfumeros-vidrio-1.webp'},
  {id:'nuevo-12',cat:'nuevo',nombre:'Perfume 12 ml',detalle:'Frasco nuevo',ilus:'frasco-chico',ml:'12',tags:[],precios:{linea:55,neeche:65,arabe:61},img:'img/perfumeros-plastico-1.webp'},
  {id:'nuevo-10',cat:'nuevo',nombre:'Perfume 10 ml',detalle:'Frasco nuevo',ilus:'frasco-chico',ml:'10',tags:[],precios:{linea:39,neeche:46,arabe:43},img:'img/perfumeros-vidrio-2.webp'},
  {id:'kit-for-you',cat:'nuevo',nombre:'Kit For You',detalle:'Kit de regalo',ilus:'kit',tags:['regalo'],precios:{linea:402,neeche:512,arabe:468}},
  {id:'set-destilados',cat:'nuevo',nombre:'Set destilados',detalle:'Set de regalo',ilus:'set',tags:['regalo'],precios:{linea:507,neeche:634,arabe:583}},
  {id:'capibara-pulpos',cat:'ninos',mostrar:true,nombre:'Perfume con peluche 50 ml',detalle:'Pulpo, osito o capibara',ilus:'figura',aroma:true,tags:['regalo'],precios:{linea:177,neeche:219},img:'img/existencia/figura-pulpo.webp',var:[{n:'Pulpo',img:'img/existencia/figura-pulpo.webp'},{n:'Osito',img:'img/existencia/figura-osito.webp'},{n:'Capibara'}]},
  {id:'relleno-medida',cat:'relleno',nombre:'Relleno de perfume a tu medida',detalle:'Tu propio frasco, de cualquier marca, desde 10 ml',ilus:'relleno',medida:true,tags:[],precios:{}},
  {id:'relleno-120',cat:'relleno',nombre:'Relleno 120 ml',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'120',tags:[],precios:{linea:290,neeche:390,arabe:350},img:'img/botellas/120.webp'},
  {id:'relleno-100',cat:'relleno',nombre:'Relleno 100 ml',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'100',tags:[],precios:{linea:239,neeche:322,arabe:288},img:'img/botellas/100.webp'},
  {id:'relleno-60',cat:'relleno',nombre:'Relleno 60 ml',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'60',tags:['popular'],precios:{linea:144,neeche:193,arabe:173},img:'img/botellas/60.webp'},
  {id:'relleno-50',cat:'relleno',nombre:'Relleno 50 ml',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'50',tags:[],precios:{linea:121,neeche:164,arabe:146},img:'img/desire-legend.webp'},
  {id:'relleno-32',cat:'relleno',nombre:'Relleno 32 ml',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'32',tags:[],precios:{linea:78,neeche:104,arabe:94},img:'img/existencia/kit-4you-vibes.webp'},
  {id:'relleno-30',cat:'relleno',nombre:'Relleno 30 ml',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'30',tags:['popular'],precios:{linea:71,neeche:96,arabe:86},img:'img/botellas/30.webp'},
  {id:'relleno-20',cat:'relleno',nombre:'Relleno 20 ml',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'20',tags:[],precios:{linea:49,neeche:66,arabe:59},img:'img/botellas/20.webp'},
  {id:'relleno-16',cat:'relleno',nombre:'Relleno 16 ml',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'16',tags:['popular'],precios:{linea:35,neeche:47,arabe:42},img:'img/botellas/16-unisex.webp'},
  {id:'relleno-15',cat:'relleno',nombre:'Relleno 15 ml',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'15',tags:[],precios:{linea:35,neeche:47,arabe:42},img:'img/perfumeros-vidrio-1.webp'},
  {id:'relleno-13pe',cat:'relleno',nombre:'Relleno 13 ml pura esencia',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'13',tags:['pura'],precios:{linea:82,neeche:114,arabe:101},img:'img/rollets.webp'},
  {id:'relleno-12',cat:'relleno',nombre:'Relleno 12 ml',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'12',tags:[],precios:{linea:28,neeche:37,arabe:33},img:'img/perfumeros-plastico-1.webp'},
  {id:'relleno-10',cat:'relleno',nombre:'Relleno 10 ml',detalle:'Rellenamos tu frasco',ilus:'relleno',ml:'10',tags:[],precios:{linea:21,neeche:28,arabe:26},img:'img/perfumeros-vidrio-2.webp'},
  {id:'crema-250',cat:'cremas',nombre:'Crema 250 ml',detalle:'Con el aroma que elijas',ilus:'crema',tags:['regalo'],precios:{linea:150,neeche:175,arabe:165}},
  {id:'crema-200',cat:'cremas',nombre:'Crema 200 ml',detalle:'Con el aroma que elijas',ilus:'crema',tags:[],precios:{linea:70,neeche:75,arabe:73}},
  {id:'crema-70',cat:'cremas',nombre:'Crema 70 ml',detalle:'Con el aroma que elijas',ilus:'crema-chica',tags:[],precios:{linea:40,neeche:42,arabe:41}},
  {id:'gel-ducha',cat:'cremas',nombre:'Gel de ducha',detalle:'Con el aroma que elijas',ilus:'botella',tags:[],precios:{linea:77,neeche:79,arabe:78}},
  {id:'body-lotion',cat:'cremas',nombre:'Body lotion personalizada',detalle:'Con el aroma que elijas',ilus:'botella',tags:[],precios:{linea:87,neeche:89,arabe:88}},
  {id:'deso-plastico',cat:'desodorantes',nombre:'Desodorante 90 g',detalle:'Envase de plástico',ilus:'desodorante',tags:[],precios:{linea:62,neeche:67,arabe:65}},
  {id:'deso-vidrio',cat:'desodorantes',nombre:'Desodorante roll-on 55 g',detalle:'Con el aroma que elijas',mostrar:true,aroma:true,img:'img/existencia/roll-on-azul.webp',var:[{n:'Azul',img:'img/existencia/roll-on-azul.webp'},{n:'Negro',img:'img/existencia/roll-on-negro.webp'}],ilus:'desodorante',tags:[],precios:{linea:58,neeche:60,arabe:59}},
  {id:'perfume-cabello',cat:'cabello',nombre:'Hair Mist perfume para cabello 150 ml',detalle:'Con el aroma que elijas',mostrar:true,aroma:true,ilus:'spray',tags:[],precios:{linea:105,neeche:122,arabe:115},img:'img/existencia/hair-mist-personalizable.webp'},
  {id:'colonia-disney',cat:'ninos',nombre:'Colonia Disney',detalle:'Para niños',ilus:'ninos',tags:['regalo'],precios:{linea:92}},
  {id:'colgante-manzana',cat:'casa',mostrar:true,nombre:'Frasco colgante manzana',detalle:'Para el auto o el clóset',ilus:'auto',aroma:true,tags:[],img:'img/existencia/colgante-manzana.webp',var:[{n:'Perfume · frasco nuevo',precio:63},{n:'Perfume · relleno',precio:26},{n:'Ambiental · frasco nuevo',precio:49},{n:'Ambiental · relleno',precio:13}]},
  {id:'difusor-140',cat:'ambientales',nombre:'Difusor 140 ml',detalle:'Para tu casa',ilus:'difusor',tags:[],precios:{linea:179}},
  {id:'difusor-140-pot',cat:'ambientales',nombre:'Difusor 140 ml pot.',detalle:'Para tu casa',ilus:'difusor',tags:[],precios:{linea:195}},
  {id:'difusor-80',cat:'ambientales',nombre:'Difusor 80 ml',detalle:'Para tu casa',ilus:'difusor',tags:[],precios:{linea:117}},
  {id:'difusor-80-pot',cat:'ambientales',nombre:'Difusor 80 ml pot.',detalle:'Para tu casa',ilus:'difusor',tags:[],precios:{linea:133}},
  {id:'difusor-auto-10',cat:'ambientales',nombre:'Difusor para auto 10 ml',detalle:'Para tu casa',ilus:'auto',tags:[],precios:{linea:68}},
  {id:'difusor-auto-10-pot',cat:'ambientales',nombre:'Difusor para auto 10 ml pot.',detalle:'Pura esencia',ilus:'auto',tags:['pura'],precios:{linea:47}},
  {id:'difusor-auto-8',cat:'ambientales',nombre:'Difusor para auto 8 ml',detalle:'Pura esencia',ilus:'auto',tags:['pura'],precios:{linea:60}},
  {id:'difusor-auto-8-pot',cat:'ambientales',nombre:'Difusor para auto 8 ml pot.',detalle:'Pura esencia',ilus:'auto',tags:['pura'],precios:{linea:46}},
  {id:'body-250',cat:'bodys',nombre:'Body mist 250 ml',detalle:'Bruma corporal',ilus:'body',tags:[],precios:{linea:87}},
  {id:'body-100',cat:'bodys',nombre:'Body mist 100 ml',detalle:'Bruma corporal',ilus:'body',tags:[],precios:{linea:60}},
  {id:'body-glitter',cat:'bodys',nombre:'Body glitter',detalle:'Bruma corporal',ilus:'body-glitter',tags:[],precios:{linea:87}},
  {id:'body-niche',cat:'bodys',nombre:'Body niche',detalle:'Bruma corporal',ilus:'body',tags:[],precios:{linea:116}},
  {id:'body-celebrity',cat:'bodys',nombre:'Body celebrity',detalle:'Bruma corporal',ilus:'body',tags:[],precios:{linea:87}},
  {id:'vela-250',cat:'velas',nombre:'Vela 250 g',detalle:'Aromática',ilus:'vela',tags:['regalo'],precios:{linea:226}},
  {id:'vela-300',cat:'velas',nombre:'Vela 300 g',detalle:'Aromática',ilus:'vela',tags:['regalo'],precios:{linea:256}},
  {id:'vela-230',cat:'velas',nombre:'Vela 230 g',detalle:'Aromática',ilus:'vela',tags:['regalo'],precios:{linea:212}}
];
