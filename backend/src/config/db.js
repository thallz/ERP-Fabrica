const { Pool } = require('pg');

// Configuração usando variáveis de ambiente para flexibilidade (local/Docker)
const pool = new Pool({
    user: process.env.DB_USER || 'admin_fabrica',
    password: process.env.DB_PASSWORD || 'senha_super_segura_123',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'erp_salgados'
});

// Teste de conexão ao iniciar
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erro ao conectar no PostgreSQL:', err.stack);
    } else {
        console.log('✅ Conectado com sucesso ao PostgreSQL (banco-dados-erp)');
    }
    if (client) release();
});

module.exports = pool;