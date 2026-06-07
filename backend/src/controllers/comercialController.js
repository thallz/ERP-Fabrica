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

    // 2b. ATUALIZAR CLIENTE
    atualizarCliente: async (req, res) => {
        try {
            const { id } = req.params;
            const { razao_social, cnpj, telefone } = req.body;
            const result = await pool.query(
                'UPDATE cliente SET razao_social = $1, cnpj = $2, telefone = $3 WHERE id = $4 RETURNING *',
                [razao_social, cnpj, telefone, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ status: 'erro', erro: 'Cliente não encontrado' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    },

    // 3. LISTAR PEDIDOS
    listarPedidos: async (req, res) => {
        try {
            const pedidos = await pool.query(`
                SELECT p.id, p.data_pedido, p.data_entrega, p.status, p.valor_total,
                       c.razao_social, c.cnpj,
                       (SELECT COUNT(*)::int FROM item_pedido ip WHERE ip.pedido_id = p.id) AS total_itens
                FROM pedido p
                JOIN cliente c ON c.id = p.cliente_id
                ORDER BY p.data_pedido DESC
            `);
            res.json(pedidos.rows);
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    },

    // 3b. DETALHE DO PEDIDO
    obterPedido: async (req, res) => {
        try {
            const { id } = req.params;
            const pedido = await pool.query(`
                SELECT p.*, c.razao_social, c.cnpj, c.telefone
                FROM pedido p
                JOIN cliente c ON c.id = p.cliente_id
                WHERE p.id = $1
            `, [id]);
            if (pedido.rows.length === 0) {
                return res.status(404).json({ status: 'erro', erro: 'Pedido não encontrado' });
            }
            const itens = await pool.query(`
                SELECT ip.quantidade, ip.preco_unitario, pr.nome AS produto_nome, pr.id AS produto_id
                FROM item_pedido ip
                JOIN produto pr ON pr.id = ip.produto_id
                WHERE ip.pedido_id = $1
            `, [id]);
            res.json({ ...pedido.rows[0], itens: itens.rows });
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    },

    // 3c. ATUALIZAR STATUS / ENTREGA DO PEDIDO
    atualizarPedido: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, data_entrega } = req.body;
            const result = await pool.query(
                `UPDATE pedido
                 SET status = COALESCE($1, status),
                     data_entrega = COALESCE($2, data_entrega)
                 WHERE id = $3
                 RETURNING *`,
                [status || null, data_entrega || null, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ status: 'erro', erro: 'Pedido não encontrado' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    },

    // 4. LANÇAR PEDIDO (Transação Segura)
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