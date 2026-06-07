const pool = require('../config/db');

const comercialController = {
    // 1. CRIAR CLIENTE B2B
    criarCliente: async (req, res) => {
        try {
            const { razao_social, cnpj, telefone } = req.body;
            const novoCliente = await pool.query(
                'INSERT INTO cliente (razao_social, cnpj, telefone) VALUES ($1, $2, $3) RETURNING *',
                [razao_social, cnpj, telefone]
            );
            res.status(201).json(novoCliente.rows[0]);
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    },

    // 2. LISTAR CLIENTES
    listarClientes: async (req, res) => {
        try {
            const clientes = await pool.query('SELECT * FROM cliente ORDER BY razao_social ASC');
            res.json(clientes.rows);
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    },

    // 3. LANÇAR PEDIDO (Transação Segura)
    lancarPedido: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const { cliente_id, data_entrega, itens } = req.body;
            
            // Calcula o valor total do pedido automaticamente
            let valorTotal = 0;
            itens.forEach(item => {
                valorTotal += (item.quantidade * item.preco_unitario);
            });

            // Grava a "Capa" do Pedido
            const resultPedido = await client.query(
                'INSERT INTO pedido (cliente_id, data_entrega, valor_total) VALUES ($1, $2, $3) RETURNING id',
                [cliente_id, data_entrega, valorTotal]
            );
            const pedidoId = resultPedido.rows[0].id;

            // Grava os Itens do Pedido
            for (const item of itens) {
                await client.query(
                    'INSERT INTO item_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
                    [pedidoId, item.produto_id, item.quantidade, item.preco_unitario]
                );
            }

            await client.query('COMMIT');
            res.status(201).json({ 
                status: 'sucesso', 
                pedido_id: pedidoId, 
                mensagem: 'Pedido B2B lançado com sucesso!' 
            });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ status: 'erro', erro: error.message });
        } finally {
            client.release();
        }
    }
};

module.exports = comercialController;