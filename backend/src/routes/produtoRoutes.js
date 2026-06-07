const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

// Rotas da API para Produtos
router.post('/', produtoController.criar);
router.get('/', produtoController.listar);

module.exports = router;