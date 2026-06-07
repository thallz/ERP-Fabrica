const pool = require('../config/db');

const producaoController = {
    // 1. Criar Nova Ordem de Produção (Alocar Produção)
    alocar: async (req, res) => {
        try {
            const { produto_id, quantidade_planejada } = req.body;
            
            const novaOp = await pool.query(
                `INSERT INTO ordem_producao (produto_id, quantidade_planejada, status) 
                 VALUES ($1, $2, 'FILA') RETURNING *`,
                [produto_id, quantidade_planejada]
            );
            
            res.status(201).json(novaOp.rows[0]);
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    },

    // 2. Ver Fila de Produção do Chão de Fábrica
    listarFila: async (req, res) => {
        try {
            // Traz a fila unindo a tabela de OP com a tabela de Produto para mostrar o nome
            const fila = await pool.query(`
                SELECT op.id AS numero_op, p.nome AS produto, op.quantidade_planejada, op.status, op.criado_em 
                FROM ordem_producao op
                JOIN produto p ON op.produto_id = p.id
                WHERE op.status IN ('FILA', 'PRODUZINDO')
                ORDER BY op.criado_em ASC
            `);
            
            res.json(fila.rows);
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    },

    // 3. Apontamento de Intercorrência (Regra: M1, E1, P1, O1)
    registrarIntercorrencia: async (req, res) => {
        try {
            const { ordem_producao_id, codigo_intercorrencia, tempo_parada_minutos, observacao } = req.body;
            
            const ocorrencia = await pool.query(
                `INSERT INTO apontamento_intercorrencia 
                (ordem_producao_id, codigo_intercorrencia, tempo_parada_minutos, observacao) 
                VALUES ($1, $2, $3, $4) RETURNING *`,
                [ordem_producao_id, codigo_intercorrencia, tempo_parada_minutos, observacao]
            );
            
            res.status(201).json({
                status: 'sucesso',
                mensagem: 'Intercorrência registrada com sucesso.',
                dados: ocorrencia.rows[0]
            });
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    }
};

module.exports = producaoController;