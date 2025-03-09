const mongoose = require('mongoose');

const ImpuestoSchema = new mongoose.Schema({
    IVA: Boolean,
    percentage: String,
});

const DetalleSchema = new mongoose.Schema({
    codigoProducto: String,
    codigoBarras: String,
    descripcion: String,
    cantidad: Number,
    precioUnitario: Number,
    impuestos: [ImpuestoSchema],
    subtotal: Number
});
const PedidoSchema = new mongoose.Schema({
    Order: Number,
    Cliente: {
        identificacion: String,
        razonSocial: String,
        direccion: String,
        telefono: String,
        email: String
    },
    detalles: [DetalleSchema],
    total: Number,
});

module.exports = mongoose.model('Pedido', PedidoSchema);
