const pool = require('../config/db');

const produtoController = {
    // 1. CRIAR PRODUTO + FICHA TÉCNICA
    criar: async (req, res) => {
        // Inicia uma conexão exclusiva para a Transação
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN'); // Trava o banco: "Comece a gravar, mas só salve se eu mandar"
            
            const { nome, preco_venda, cmv_estimado, margem_contribuicao, ficha_tecnica } = req.body;
            
            // Passo A: Gravar o Produto Final
            const resultProd = await client.query(
                'INSERT INTO produto (nome, preco_venda, cmv_estimado, margem_contribuicao) VALUES ($1, $2, $3, $4) RETURNING id',
                [nome, preco_venda, cmv_estimado, margem_contribuicao]
            );
            const produtoId = resultProd.rows[0].id;

            // Passo B: Gravar a Ficha Técnica (Explosão da Receita)
            // O frontend vai nos mandar um array (lista) de insumos usados neste produto
            if (ficha_tecnica && ficha_tecnica.length > 0) {
                for (const item of ficha_tecnica) {
                    await client.query(
                        'INSERT INTO ficha_tecnica_insumo (produto_id, insumo_id, quantidade) VALUES ($1, $2, $3)',
                        [produtoId, item.insumo_id, item.quantidade]
                    );
                }
            }

            await client.query('COMMIT'); // Tudo certo! Salva definitivamente.
            res.status(201).json({ 
                status: 'sucesso', 
                produto_id: produtoId, 
                mensagem: 'Produto e Ficha Técnica criados com sucesso!' 
            });

        } catch (error) {
            await client.query('ROLLBACK'); // Deu erro? Cancela tudo para não sujar o banco.
            res.status(500).json({ status: 'erro', erro: error.message });
        } finally {
            client.release(); // Libera a conexão
        }
    },

    // 2. LISTAR PRODUTOS
    listar: async (req, res) => {
        try {
            const todosProdutos = await pool.query('SELECT * FROM produto ORDER BY nome ASC');
            res.json(todosProdutos.rows);
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    }
};

module.exports = produtoController;