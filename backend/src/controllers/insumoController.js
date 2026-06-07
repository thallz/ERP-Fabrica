const pool = require('../config/db');

const insumoController = {
    // 1. Rota para CRIAR um novo insumo
    criar: async (req, res) => {
        try {
            // Pega os dados enviados pelo Bruno (ou pelo seu programa Electron)
            const { nome, unidade_medida, custo_unitario } = req.body;
            
            // Grava no banco de dados
            const novoInsumo = await pool.query(
                'INSERT INTO insumo (nome, unidade_medida, custo_unitario) VALUES ($1, $2, $3) RETURNING *',
                [nome, unidade_medida, custo_unitario]
            );
            
            // Retorna o sucesso (Status 201 = Created)
            res.status(201).json(novoInsumo.rows[0]);
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    },

    // 2. Rota para LER (Listar) todos os insumos
    listar: async (req, res) => {
        try {
            const todosInsumos = await pool.query('SELECT * FROM insumo ORDER BY nome ASC');
            res.json(todosInsumos.rows);
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    }
};

module.exports = insumoController;