// vehicle_simulators/veiculo_client.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const packageDef = protoLoader.loadSync(path.join(__dirname, '../proto/frota.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const proto = grpc.loadPackageDefinition(packageDef).frota;

const veiculoId = process.argv[2] || 'veiculo_' + Math.floor(Math.random() * 1000); // ID dinâmico ou passado via argumento

const client = new proto.Rastreamento('localhost:50051', grpc.credentials.createInsecure());

// Metadata para enviar o ID do veículo ao servidor gRPC
const metadata = new grpc.Metadata();
metadata.add('id_veiculo', veiculoId);

const call = client.Monitorar(metadata);

call.on('data', comando => {
    console.log(`[${veiculoId}] Comando recebido da Central: "${comando.mensagem}"`);
    // Lógica para o veículo "responder" ao comando
    if (comando.mensagem.includes("reduzir velocidade")) {
        console.log(`[${veiculoId}] Status: Reduzindo velocidade.`);
    } else if (comando.mensagem.includes("Parada de emergência")) {
        console.log(`[${veiculoId}] Status: Parada de emergência ativada.`);
    }
});

call.on('end', () => {
    console.log(`[${veiculoId}] Conexão com a Central encerrada.`);
});

call.on('error', err => {
    console.error(`[${veiculoId}] Erro na conexão com a Central:`, err.message);
});

// Simula enviar localização a cada 3 segundos
let lat = -8.113684 + Math.random() * 0.01;
let lng = -35.030864 + Math.random() * 0.01;
let velocidade = 50 + Math.random() * 20;

//-23.55 , 46.63
//-8.113684, -35.030864
setInterval(() => {
    // Simula movimento
    lat += (Math.random() - 0.5) * 0.0005; // Pequenas variações de lat
    lng += (Math.random() - 0.5) * 0.0005; // Pequenas variações de lng
    //velocidade = 40 + Math.random() * 40; // Varia entre 40 e 80 km/h
    velocidade = 85 + Math.random() * 10; // varia entre 85 a 90 km/h

    const localizacao = {
        id: veiculoId,
        lat: lat,
        lng: lng,
        velocidade: velocidade,
        status: 'Em Trânsito',
    };
    call.write(localizacao);
    console.log(`[${veiculoId}] Enviou localização: Lat=${localizacao.lat.toFixed(3)}, Lng=${localizacao.lng.toFixed(3)}, Vel=${localizacao.velocidade.toFixed(1)} km/h`);
}, 3000);

// Lidar com o fechamento do processo para encerrar o stream corretamente
process.on('SIGINT', () => {
    console.log(`[${veiculoId}] Encerrando simulador...`);
    call.end(); // Encerra o stream gRPC
    process.exit();
});