const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    razonSocial: { type: String, required: true }, // Nombre o razón social del cliente
    email: { type: String, required: true }, // Email del cliente
    telefono: { type: String }, // Teléfono del cliente
    identificacion: { type: String, required: true, unique: true }, // RUC o cédula del cliente
    direccion: { type: String, required: true }, // Dirección del cliente
});

module.exports = mongoose.model('Client', clientSchema);
