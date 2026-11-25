// Ajustes de la tienda. Lo más fácil es cambiarlos desde panel.html (se abre en el navegador):
// ahí editas, tocas "Descargar ajustes.js" y subes el archivo a GitHub en lugar de este.
// Lo que esté vacío no se muestra en la página.
window.AJUSTES = {
  // Tu negocio: se muestra en "Cómo pedir" y en el pie de página.
  negocio: {
    horario: 'Lunes a viernes, excepto de 5:00 a 9:00 pm · Sábado y domingo, todo el día',
    zona: '',         // ej. 'Entregas en Cuautitlán, Cuautitlán Izcalli y Tultitlán'
    direccion: '',    // ej. 'Punto de entrega: Plaza Centro, local 12'
    mapa: '',         // enlace de Google Maps (opcional)
    // Horas en que no puedes entregar (dias: 0 = domingo, 1 = lunes … 6 = sábado). Si el cliente elige una,
    // la página le avisa y le pide otra hora.
    ocupado: [{ dias: [1, 2, 3, 4, 5], desde: '17:00', hasta: '21:00', motivo: 'De lunes a viernes de 5:00 a 9:00 pm estoy en clases' }],
  },
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
