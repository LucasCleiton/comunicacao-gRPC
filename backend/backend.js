// backend/backend.js
const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Carrega o proto
const packageDef = protoLoader.loadSync(path.join(__dirname, '../proto/frota.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const proto = grpc.loadPackageDefinition(packageDef).frota;

// Clientes gRPC para se conectar ao Serviço Central de Rastreamento
const centralClient = new proto.Rastreamento('localhost:50051', grpc.credentials.createInsecure());
const estimativaClient = new proto.Estimativa('localhost:50051', grpc.credentials.createInsecure());

// Configura Express
const app = express();
app.use(cors());
app.use(express.json());

// Endpoint que retorna veículos para o frontend
app.get('/veiculos', (req, res) => {
    // Chama o novo método `ListarLocalizacoes` do serviço gRPC central
    centralClient.ListarLocalizacoes({}, (err, response) => {
        if (err) {
            console.error('Erro ao listar veículos do gRPC Central:', err.message);
            return res.status(500).json({ erro: 'Erro ao obter veículos.' });
        }
        // Retorna a lista de veículos recebida do servidor gRPC
        res.json(response.veiculos || []);
    });
});

// Endpoint de estimativa
app.post('/estimativa', (req, res) => {
    const { id_veiculo, destino } = req.body;

    // Chama o método `Calcular` do serviço gRPC de Estimativa
    estimativaClient.Calcular({ id_veiculo, destino }, (err, response) => {
        if (err) {
            console.error('Erro ao calcular estimativa via gRPC:', err.message);
            return res.status(500).json({ erro: err.message });
        }
        res.json({ tempo_estimado: response.tempo_estimado });
    });
});

// Inicia servidor HTTP REST
app.listen(3001, () => {
    console.log('✅ Backend HTTP rodando em http://localhost:3001');
});