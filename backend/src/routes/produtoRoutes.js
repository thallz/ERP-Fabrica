const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

// Rotas da API para Produtos
router.post('/', produtoController.criar);
router.get('/', produtoController.listar);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.excluir);

module.exports = router;