const express = require('express');
const router = express.Router();
const insumoController = require('../controllers/insumoController');

// Quando houver um POST na rota, vá para a função 'criar'
router.post('/', insumoController.criar);

// Quando houver um GET na rota, vá para a função 'listar'
router.get('/', insumoController.listar);

module.exports = router;