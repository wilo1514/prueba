const axios = require('axios');
const Pedido = require('../models/pedido');
const { obtenerDatosCliente, construirDetallesPedido, calculoTotal } = require('../utils/pedidosUtils');


exports.createPedido = async (req, res) => {
    try {
        const { clienteId, detalles } = req.body;
        if (!clienteId) {
            return res.status(400).json({ error: 'El clienteId es obligatorio' });
        }
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ error: 'Debe proporcionar una lista de detalles del pedido' });
        }

        console.log(`Datos del cliente con ID: ${clienteId}\n`);

        const receptor = await obtenerDatosCliente(clienteId);
        const detallesPedido = await construirDetallesPedido(detalles);
        const totalPedido = await calculoTotal(detallesPedido);

        const pedido = new Pedido({
            Cliente: receptor,
            detalles: detallesPedido,
            total: totalPedido
        });

        await pedido.save();
        res.status(201).json(pedido);
    } catch (error) {
        console.error(' \n Error al guardar pedido:', error);
        res.status(500).send({
            message: '\n Error al crear pedido',
            error: error.message,
            stack: error.stack
        });
    }
};
exports.getPedido = async (req, res) => {
    try {
        const pedidos = await Pedido.find();
        res.status(200).json(pedidos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePedido = async (req, res) => {
    try {
        const { clienteId, detalles, ...restoDatos } = req.body;

        let receptor;
        if (clienteId) {
            receptor = await obtenerDatosCliente(clienteId); // Obtener datos actualizados del cliente si el cliente ha cambiado
        }

        let detallesPedido;
        let totalPedido;
        if (detalles && Array.isArray(detalles) && detalles.length > 0) {
            detallesPedido = await construirDetallesPedido(detalles);
            totalPedido = calculoTotal(detallesPedido);
        }

        const pedidoActualizado = await Pedido.findByIdAndUpdate(
            req.params.id,
            {
                ...restoDatos,
                ...(receptor && { Cliente: receptor }),
                ...(detallesPedido && { detalles: detallesPedido, total: totalPedido })
            },
            { new: true }
        );

        if (!pedidoActualizado) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.status(200).json(pedidoActualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deletePedido = async (req, res) => {
    try {
        const pedido = await Pedido.findByIdAndDelete(req.params.id);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido not found' });
        }
        res.status(200).json({ message: 'Pedido deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};