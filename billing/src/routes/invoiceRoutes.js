const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.get('/', invoiceController.getPedido);
router.post('/', invoiceController.createPedido);
router.put('/:id', invoiceController.updatePedido);

module.exports = router;
