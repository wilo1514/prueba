const axios = require('axios');
const Pedido = require('../models/pedido');

async function obtenerDatosCliente(clienteId) {
    try {
        const url = `http://172.19.0.1:3005/api/clients/${clienteId}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error al obtener los datos del cliente:', error.response?.status, error.response?.data || error.message);
        throw new Error('No se pudo obtener datos del cliente');
    }
}

async function obtenerDetallesProductos(listaCodigos) {
    try {
        const url = `http://172.19.0.1:3006/api/products/buscarPorCodigos`;
        const response = await axios.post(url, { codigos: listaCodigos });
        return response.data;
    } catch (error) {
        console.error('Error al obtener detalles de productos:', error.response?.status, error.response?.data || error.message);
        throw new Error('No se pudo obtener detalles de productos');
    }
}
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

        console.log(`Datos del cliente con ID: ${clienteId}\n`);
        const receptor = await obtenerDatosCliente(clienteId);

        // Obtener detalles de productos
        const listaCodigos = detalles.map(d => d.codigoProducto);
        const productosInfo = await obtenerDetallesProductos(listaCodigos);

        // Construir la lista de detalles con la información completa
        const detallesPedido = detalles.map(d => {
            const productoEncontrado = productosInfo.find(p => p.codigoProducto === d.codigoProducto);
            if (!productoEncontrado) {
                throw new Error(`Producto con código ${d.codigoProducto} no encontrado`);
            }
            return {
                codigoProducto: productoEncontrado.codigoProducto,
                codigoBarras: productoEncontrado.codigoBarras,
                descripcion: productoEncontrado.descripcion,
                cantidad: d.cantidad,
                precioUnitario: productoEncontrado.precioUnitario,
                impuestos: [
                    {
                        IVA: productoEncontrado.IVA,
                        Percentage: productoEncontrado.percentage
                    }
                ],
                subtotal: d.cantidad * productoEncontrado.precioUnitario
            };
        });

        // Calcular el total del pedido
        const totalPedido = detallesPedido.reduce((sum, item) => sum + item.subtotal, 0);

        // Crear pedido
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
        const { clienteId, ...restoDatos } = req.body;

        let receptor;
        if (clienteId) {
            receptor = await obtenerDatosCliente(clienteId); // Obtener datos actualizados del cliente si cliente ha cambiado
        }

        const pedidoActualizado = await Pedido.findByIdAndUpdate(
            req.params.id,
            { ...restoDatos, ...(receptor && { receptor }) }, // Solo actualiza receptor si se obtuvo nuevo
            { new: true }
        );

        if (!pedidoActualizado) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(pedidoActualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};