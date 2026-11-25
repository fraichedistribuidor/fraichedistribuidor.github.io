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
  },
  // Envío a domicilio: costo fijo; si pones zonas, el cliente elige la suya y se cobra su costo.
  // gratisDesde: envío gratis cuando la compra llega a esa cantidad (0 = nunca).
  // ej. zonas: [{ nombre: 'Cuautitlán', costo: 40 }, { nombre: 'Izcalli', costo: 60 }]
  envio: { costo: 50, zonas: [], gratisDesde: 0 },
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
