const pool = require('../config/db');

const producaoController = {
    alocar: async (req, res) => {
        try {
            const { produto_id, quantidade_planejada } = req.body;

            const ficha = await pool.query(
                'SELECT COUNT(*)::int AS total FROM ficha_tecnica_insumo WHERE produto_id = $1',
                [produto_id]
            );
            if (ficha.rows[0].total === 0) {
                return res.status(400).json({
                    status: 'erro',
                    erro: 'Produto sem ficha técnica. Cadastre a engenharia antes de alocar produção.'
                });
            }

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

    listarFila: async (req, res) => {
        try {
            const fila = await pool.query(`
                SELECT op.id AS numero_op, op.produto_id, p.nome AS produto,
                       op.quantidade_planejada, op.status, op.criado_em,
                       p.estoque_atual AS estoque_camara_fria
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

    excluirOP: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'DELETE FROM ordem_producao WHERE id = $1 RETURNING id',
                [id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ status: 'erro', erro: 'OP não encontrada' });
            }
            res.json({ status: 'sucesso', mensagem: 'OP excluída com sucesso.', id: result.rows[0].id });
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    },

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
    },

    necessidadeCompras: async (req, res) => {
        try {
            const margem = parseFloat(req.query.margem) || 0;
            const multiplicador = 1 + Math.max(0, margem);

            const ops = await pool.query(`
                SELECT op.id, op.produto_id, op.quantidade_planejada, p.nome AS produto_nome
                FROM ordem_producao op
                JOIN produto p ON p.id = op.produto_id
                WHERE op.status = 'FILA'
                ORDER BY op.criado_em ASC
            `);

            const demandaInsumos = {};
            const demandaEmbalagens = {};
            const avisos = [];
            const detalheOps = [];

            for (const op of ops.rows) {
                const fichasInsumo = await pool.query(`
                    SELECT fti.insumo_id, fti.quantidade, i.nome, i.unidade_medida,
                           i.estoque_atual, i.custo_unitario
                    FROM ficha_tecnica_insumo fti
                    JOIN insumo i ON i.id = fti.insumo_id
                    WHERE fti.produto_id = $1
                `, [op.produto_id]);

                const fichasEmb = await pool.query(`
                    SELECT fte.embalagem_id, fte.quantidade, e.nome, e.estoque_atual, e.custo_unitario
                    FROM ficha_tecnica_embalagem fte
                    JOIN embalagem e ON e.id = fte.embalagem_id
                    WHERE fte.produto_id = $1
                `, [op.produto_id]);

                if (fichasInsumo.rows.length === 0 && fichasEmb.rows.length === 0) {
                    avisos.push(`"${op.produto_nome}" (OP #${op.id}): sem ficha técnica — explosão ignorada.`);
                }

                detalheOps.push({
                    op_id: op.id,
                    produto: op.produto_nome,
                    quantidade_planejada: op.quantidade_planejada
                });

                for (const f of fichasInsumo.rows) {
                    const qtdNecessaria = parseFloat(f.quantidade) * op.quantidade_planejada * multiplicador;
                    if (!demandaInsumos[f.insumo_id]) {
                        demandaInsumos[f.insumo_id] = {
                            insumo_id: f.insumo_id,
                            nome: f.nome,
                            unidade_medida: f.unidade_medida,
                            estoque_atual: parseFloat(f.estoque_atual),
                            custo_unitario: parseFloat(f.custo_unitario),
                            demanda_total: 0
                        };
                    }
                    demandaInsumos[f.insumo_id].demanda_total += qtdNecessaria;
                }

                for (const e of fichasEmb.rows) {
                    const qtdNecessaria = parseInt(e.quantidade, 10) * op.quantidade_planejada * multiplicador;
                    if (!demandaEmbalagens[e.embalagem_id]) {
                        demandaEmbalagens[e.embalagem_id] = {
                            embalagem_id: e.embalagem_id,
                            nome: e.nome,
                            unidade_medida: 'un',
                            estoque_atual: parseInt(e.estoque_atual, 10),
                            custo_unitario: parseFloat(e.custo_unitario),
                            demanda_total: 0
                        };
                    }
                    demandaEmbalagens[e.embalagem_id].demanda_total += qtdNecessaria;
                }
            }

            const montarLista = (mapa, tipo) => Object.values(mapa)
                .map((item) => {
                    const quantidade_comprar = Math.max(0, item.demanda_total - item.estoque_atual);
                    return {
                        tipo,
                        id: item.insumo_id || item.embalagem_id,
                        nome: item.nome,
                        unidade_medida: item.unidade_medida,
                        demanda_total: parseFloat(item.demanda_total.toFixed(4)),
                        estoque_atual: item.estoque_atual,
                        quantidade_comprar: parseFloat(quantidade_comprar.toFixed(4)),
                        custo_estimado: parseFloat((quantidade_comprar * item.custo_unitario).toFixed(2))
                    };
                })
                .filter((i) => i.quantidade_comprar > 0);

            const itens_comprar = [
                ...montarLista(demandaInsumos, 'insumo'),
                ...montarLista(demandaEmbalagens, 'embalagem')
            ].sort((a, b) => a.nome.localeCompare(b.nome));

            const custo_total_estimado = itens_comprar.reduce((s, i) => s + i.custo_estimado, 0);

            res.json({
                margem_aplicada: margem,
                ops_na_fila: detalheOps.length,
                detalhe_ops: detalheOps,
                avisos,
                itens_comprar,
                custo_total_estimado
            });
        } catch (error) {
            res.status(500).json({ status: 'erro', erro: error.message });
        }
    }
};

module.exports = producaoController;
