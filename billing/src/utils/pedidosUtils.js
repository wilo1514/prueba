const axios = require('axios');

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

async function construirDetallesPedido(detalles) {
    const listaCodigos = detalles.map(d => d.codigoProducto);
    const productosInfo = await obtenerDetallesProductos(listaCodigos);

    return detalles.map(d => {
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
                    percentage: productoEncontrado.percentage
                }
            ],
            subtotal: d.cantidad * productoEncontrado.precioUnitario * ((productoEncontrado.percentage + 100) / 100)
        };
    });
}
function calculoTotal(detallesPedido) {
    return detallesPedido.reduce((sum, item) => sum + item.subtotal, 0);
}

module.exports = { obtenerDatosCliente, obtenerDetallesProductos, construirDetallesPedido, calculoTotal };
