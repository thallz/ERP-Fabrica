const express = require('express');
const router = express.Router();
const receitaController = require('../controllers/receitaController');

router.get('/', receitaController.listar);
router.post('/', receitaController.criar);
router.post('/importar', receitaController.importar);
router.put('/:id', receitaController.atualizar);
router.delete('/:id', receitaController.excluir);

module.exports = router;
