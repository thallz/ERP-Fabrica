const http = require('http');

// Teste 1: Verificar fila de produção
const testFila = () => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/producao/fila',
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

// Teste 2: Verificar impedimentos de uma OP específica
const testImpedimentos = (opId) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: `/api/producao/op/${opId}/impedimentos`,
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

// Teste 3: Planejar produção
const testPlanejar = () => {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            colaborador_id: 1,
            data_programada: '2026-06-10',
            ops_ids: [3]
        });

        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/producao/planejar',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
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

        req.write(postData);
        req.end();
    });
};

// Executar testes
async function runTests() {
    console.log('🧪 Iniciando testes da API...\n');

    try {
        console.log('1️⃣ Testando fila de produção...');
        const fila = await testFila();
        console.log('✅ Fila de produção:', JSON.stringify(fila, null, 2));
        console.log('');

        if (fila.length > 0) {
            const opId = fila[0].numero_op || fila[0].id;
            console.log(`2️⃣ Testando impedimentos da OP #${opId}...`);
            const impedimentos = await testImpedimentos(opId);
            console.log('✅ Impedimentos:', JSON.stringify(impedimentos, null, 2));
            console.log('');

            console.log('3️⃣ Testando planejamento de produção...');
            const planejamento = await testPlanejar();
            console.log('✅ Planejamento:', JSON.stringify(planejamento, null, 2));
            console.log('');
        } else {
            console.log('⚠️ Nenhuma OP na fila para testar impedimentos e planejamento');
        }

        console.log('🎉 Todos os testes concluídos com sucesso!');
    } catch (error) {
        console.error('❌ Erro nos testes:', error.message);
    }
}

runTests();