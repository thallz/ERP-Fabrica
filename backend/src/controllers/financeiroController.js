const pool = require('../config/db');

const financeiroController = {
  resumo: async (req, res) => {
    try {
      const vendas = await pool.query(`
        SELECT
          COALESCE(SUM(valor_total), 0) AS faturamento_total,
          COUNT(*) AS total_pedidos,
          COALESCE(SUM(CASE WHEN status = 'CRIADO' THEN valor_total ELSE 0 END), 0) AS pendente_producao,
          COALESCE(SUM(CASE WHEN status IN ('FATURADO', 'PRODUZINDO') THEN valor_total ELSE 0 END), 0) AS a_receber,
          COALESCE(SUM(CASE WHEN status = 'ENTREGUE' THEN valor_total ELSE 0 END), 0) AS recebido
        FROM pedido
      `);

      const porStatus = await pool.query(`
        SELECT status, COUNT(*)::int AS quantidade, COALESCE(SUM(valor_total), 0) AS valor
        FROM pedido
        GROUP BY status
        ORDER BY status
      `);

      const cmvMedio = await pool.query(`
        SELECT COALESCE(AVG(p.cmv_estimado), 0) AS cmv_medio_produtos
        FROM produto p
      `);

      res.json({
        ...vendas.rows[0],
        cmv_medio_produtos: parseFloat(cmvMedio.rows[0].cmv_medio_produtos),
        pedidos_por_status: porStatus.rows
      });
    } catch (error) {
      res.status(500).json({ status: 'erro', erro: error.message });
    }
  },

  contasReceber: async (req, res) => {
    try {
      const contas = await pool.query(`
        SELECT p.id, p.data_pedido, p.data_entrega, p.status, p.valor_total,
               c.razao_social, c.cnpj, c.telefone
        FROM pedido p
        JOIN cliente c ON c.id = p.cliente_id
        WHERE p.status IN ('CRIADO', 'PRODUZINDO', 'FATURADO')
        ORDER BY p.data_entrega ASC NULLS LAST, p.data_pedido DESC
      `);
      res.json(contas.rows);
    } catch (error) {
      res.status(500).json({ status: 'erro', erro: error.message });
    }
  }
};

module.exports = financeiroController;
