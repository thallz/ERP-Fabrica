const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiroController');

router.get('/resumo', financeiroController.resumo);
router.get('/contas-receber', financeiroController.contasReceber);

module.exports = router;
