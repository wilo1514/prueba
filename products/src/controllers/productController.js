const Product = require('../models/product');

exports.createProduct = async (req, res) => {
    try {
        const products = new Product(req.body);
        await products.save();
        res.status(201).json(products);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProductById = async (req, res) => {
    try {
        const products = await Product.findById(req.params.id);
        if (!products) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const products = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!products) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateProductByBarCode = async (req, res) => {
    try {
        const product = await Client.findOneAndUpdate({ codigoBarras: req.params.codigoBarras }, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateProductStock = async (req, res) => {
    try {
        const { codigoProducto } = req.params;
        const { oldQuantity, newQuantity } = req.body;

        if (typeof oldQuantity !== 'number' || typeof newQuantity !== 'number') {
            return res.status(400).json({ error: 'oldQuantity and newQuantity must be numbers' });
        }

        const product = await Product.findOne({ codigoProducto });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const delta = oldQuantity - newQuantity;
        const updatedStock = product.stock + delta;
        if (updatedStock < 0) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        product.stock = updatedStock;
        await product.save();
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteProduct = async (req, res) => {
    try {
        const products = await Product.findByIdAndDelete(req.params.id);
        if (!products) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Buscar productos por nombre
exports.getProductByDescripcion = async (req, res) => {
    try {
        const products = await Product.findOne({ descripcion: req.params.descripcion });
        if (!products) {
            return res.status(404).json({ error: 'Product not found with the provided description' });
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar produtos por codigo de barras
exports.getProductByCodigoBarras = async (req, res) => {
    try {
        const products = await Product.findOne({ codigoBarras: req.params.codigoBarras });
        if (!products) {
            return res.status(404).json({ error: 'Product not found with the provided bar code' });
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Buscar produtos por codigo de barras
exports.getProductByCodigoProducto = async (req, res) => {
    try {
        const products = await Product.findOne({ codigoProducto: req.params.codigoProducto });
        if (!products) {
            return res.status(404).json({ error: 'Product not found with the provided product code' });
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProductsByCodigos = async (req, res) => {
    try {
        const { codigos } = req.body;
        if (!codigos || !Array.isArray(codigos) || codigos.length === 0) {
            return res.status(400).json({ error: 'Debes proporcionar una lista de códigos de productos' });
        }

        const products = await Product.find({ codigoProducto: { $in: codigos } });

        if (products.length === 0) {
            return res.status(404).json({ error: 'No se encontraron productos con los códigos proporcionados' });
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
