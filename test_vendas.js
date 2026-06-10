const http = require('http');

// Teste: Verificar produtos para visão da vendedora
const testProdutos = () => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/produtos',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
};

async function testVisaoVendedora() {
    console.log('🧪 Testando visão da vendedora...\n');

    try {
        const produtos = await testProdutos();
        
        console.log('✅ Produtos encontrados:', produtos.length);
        
        if (produtos.length > 0) {
            console.log('\n📊 Análise de estoque para vendedora:');
            
            const criticos = produtos.filter(p => (p.estoque_atual || 0) < 100);
            const zerados = produtos.filter(p => (p.estoque_atual || 0) === 0);
            const disponiveis = produtos.filter(p => (p.estoque_atual || 0) >= 100);

            console.log(`- Total de produtos: ${produtos.length}`);
            console.log(`- Estoque crítico (< 100): ${criticos.length}`);
            console.log(`- Estoque zerado: ${zerados.length}`);
            console.log(`- Disponíveis para venda: ${disponiveis.length}`);

            if (criticos.length > 0) {
                console.log('\n⚠️ Produtos com produção necessária:');
                criticos.slice(0, 5).forEach(p => {
                    const estoque = p.estoque_atual || 0;
                    const status = estoque === 0 ? 'ZERADO' : 'BAIXO';
                    console.log(`  • ${p.nome}: ${estoque} un [${status}]`);
                });
                
                if (criticos.length > 5) {
                    console.log(`  ... e mais ${criticos.length - 5} produtos`);
                }
            }

            if (disponiveis.length > 0) {
                console.log('\n✅ Produtos disponíveis para entrega imediata:');
                disponiveis.slice(0, 3).forEach(p => {
                    console.log(`  • ${p.nome}: ${p.estoque_atual} un`);
                });
                
                if (disponiveis.length > 3) {
                    console.log(`  ... e mais ${disponiveis.length - 3} produtos`);
                }
            }
        } else {
            console.log('⚠️ Nenhum produto encontrado no banco de dados');
        }

        console.log('\n🎉 Teste da visão da vendedora concluído!');
        console.log('📱 Acesse: http://localhost:3001/frontend/estoque_vendas.html');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

testVisaoVendedora();