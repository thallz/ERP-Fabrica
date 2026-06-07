const pool = require('./db');

async function runMigrations() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS receita (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            categoria VARCHAR(50) DEFAULT 'Geral',
            custo_total DECIMAL(12, 4) DEFAULT 0,
            peso_total DECIMAL(12, 4) DEFAULT 0,
            custo_por_kg DECIMAL(12, 4) DEFAULT 0,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS receita_item (
            id SERIAL PRIMARY KEY,
            receita_id INT NOT NULL REFERENCES receita(id) ON DELETE CASCADE,
            tipo_origem VARCHAR(10) NOT NULL CHECK (tipo_origem IN ('materia', 'receita')),
            origem_id INT NOT NULL,
            nome VARCHAR(100) NOT NULL,
            quantidade_gramas DECIMAL(12, 4) NOT NULL,
            custo_unitario DECIMAL(12, 4) DEFAULT 0,
            custo DECIMAL(12, 4) DEFAULT 0
        );
    `);
    console.log('✅ Migrações verificadas (receitas)');
}

module.exports = { runMigrations };
