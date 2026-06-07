const { Pool } = require('pg');

// Configuração usando as credenciais do nosso Docker
const pool = new Pool({
    user: 'admin_fabrica',
    password: 'senha_super_segura_123',
    host: 'localhost', // Usamos localhost porque estamos rodando o Node fora do docker por enquanto
    port: 5432,
    database: 'erp_salgados'
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