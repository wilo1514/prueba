const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.get('/descripcion/:descripcion', productController.getProductByDescripcion);
router.get('/codigoBarras/:codigoBarras', productController.getProductByCodigoBarras);
router.get('/codigoProducto/:codigoProducto', productController.getProductByCodigoProducto);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.put('/codigoBarras:codigoBarras', productController.updateProductByBarCode);
router.put('/stock/:codigoProducto', productController.updateProductStock);
router.delete('/:id', productController.deleteProduct);
router.post('/buscarPorCodigos', productController.getProductsByCodigos);

module.exports = router;
