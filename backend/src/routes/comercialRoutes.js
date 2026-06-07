const express = require('express');
const router = express.Router();
const comercialController = require('../controllers/comercialController');

// Clientes
router.post('/clientes', comercialController.criarCliente);
router.get('/clientes', comercialController.listarClientes);

// Pedidos
router.post('/pedidos', comercialController.lancarPedido);

module.exports = router;