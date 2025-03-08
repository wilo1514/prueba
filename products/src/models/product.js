const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const productSchema = new Schema({
    codigoProducto: String,
    codigoBarras: String,
    descripcion: String,
    precioUnitario: Number,
    stock: Number,
    IVA: Boolean,
    percentage: Number,
});

module.exports = mongoose.model('Product', productSchema);
