// Ajustes de la tienda. Lo más fácil es cambiarlos desde panel.html (se abre en el navegador):
// ahí editas, tocas "Descargar ajustes.js" y subes el archivo a GitHub en lugar de este.
// Lo que esté vacío no se muestra en la página.
window.AJUSTES = {
  // Tu negocio: se muestra en "Cómo pedir" y en el pie de página.
  negocio: {
    horario: '',      // ej. 'Lunes a sábado de 10:00 a 19:00'
    zona: '',         // ej. 'Entregas en Cuautitlán, Cuautitlán Izcalli y Tultitlán'
    direccion: '',    // ej. 'Punto de entrega: Plaza Centro, local 12'
    mapa: '',         // enlace de Google Maps (opcional)
    // Horas en que no puedes entregar (dias: 0 = domingo, 1 = lunes … 6 = sábado). Si el cliente elige una,
    // la página le avisa y le pide otra hora.
    ocupado: [],      // ej. [{ dias: [1, 2, 3, 4, 5], desde: '17:00', hasta: '21:00', motivo: 'De 5 a 9 pm estoy en clases' }]
  },
  // Pago por transferencia: solo sale en la confirmación, después de que el cliente hace su pedido.
  pago: { banco: 'Spin by OXXO', clabe: '728969000167231397', titular: 'Ricardo' },
  // Llave pública para revisar los sellos de la tarjeta de fidelidad. Se crea en panel.html → Sellos.
  // (La llave privada nunca se sube: se queda en tu panel.)
  llaveSellos: { x: 'gIsSGx6EgkSO5QA7LuNT3MjhVETt53xdz4PmCTowCos', y: 'Ii1RIFGF2_VAcbfew51ctE1aDNc_GIBapEPHnVZk-bI' },
  // Productos agotados: el id del producto, o 'id:Nombre de la opción' para una sola opción.
  // ej. ['ex-veladoras:Tierna Lavanda', 'kit-papa']
  agotados: [],
  // Cambiar precios sin tocar los demás archivos: { 'id': { linea: 85, neeche: 99, arabe: 95 } }
  precios: {},
  // Promociones: salen primero en el carrusel y en la sección Promociones.
  // { titulo: '2 rellenos de 30 ml', texto: 'Por $130 en esencia de línea', producto: 'relleno-30' (o categoria: 'relleno'), img: 'img/botellas/30.webp' }
  promociones: [],
  // Reseñas de tus clientes (reales): { nombre: 'Ana', texto: 'Me encantó el relleno', estrellas: 5 }
  resenas: [],
};
