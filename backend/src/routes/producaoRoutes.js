const express = require('express');
const router = express.Router();
const producaoController = require('../controllers/producaoController');

router.post('/alocar', producaoController.alocar);
router.get('/fila', producaoController.listarFila);
router.post('/intercorrencia', producaoController.registrarIntercorrencia);

module.exports = router;