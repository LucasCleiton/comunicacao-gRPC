// backend/grpc_central_server.js
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

// Mapa para armazenar o stream de cada veículo conectado
const veiculoStreams = new Map();

// Mapa para armazenar a última localização conhecida de cada veículo
const ultimasLocalizacoes = new Map();

// Implementação do serviço de Rastreamento
function Monitorar(call) {
    const veiculoId = call.metadata.get('id_veiculo')[0];
    console.log(`[Central gRPC] Veículo ${veiculoId || 'desconhecido'} conectado para monitoramento.`);

    if (veiculoId) {
        veiculoStreams.set(veiculoId, call);
    }

    call.on('data', localizacao => {
        // Se o ID não veio no metadata, pega do primeiro dado
        if (!veiculoId && localizacao.id) {
            veiculoStreams.set(localizacao.id, call);
        }
        console.log(`[Central gRPC] Recebeu de ${localizacao.id}: Lat=${localizacao.lat.toFixed(3)}, Lng=${localizacao.lng.toFixed(3)}, Vel=${localizacao.velocidade.toFixed(1)}`);
        ultimasLocalizacoes.set(localizacao.id, localizacao);

        // Lógica simples para enviar comando de volta
        if (localizacao.velocidade > 80 && Math.random() < 0.2) { // 20% de chance de enviar alerta
            const comando = {
                id_veiculo: localizacao.id,
                mensagem: "ALERTA: Reduzir velocidade!"
            };
            call.write(comando);
            console.log(`[Central gRPC] Enviou comando para ${localizacao.id}: ${comando.mensagem}`);
        }
    });

    call.on('end', () => {
        console.log(`[Central gRPC] Veículo ${veiculoId || 'desconhecido'} desconectado.`);
        if (veiculoId) {
            veiculoStreams.delete(veiculoId);
        }
        call.end();
    });

    call.on('error', err => {
        console.error(`[Central gRPC] Erro no stream do veículo ${veiculoId || 'desconhecido'}:`, err.message);
        if (veiculoId) {
            veiculoStreams.delete(veiculoId);
        }
    });
}

// Implementação do novo método ListarLocalizacoes para o backend HTTP
function ListarLocalizacoes(call, callback) {
    const veiculosArray = Array.from(ultimasLocalizacoes.values());
    console.log(`[Central gRPC] Backend solicitou lista de veículos (${veiculosArray.length} encontrados).`);
    callback(null, { veiculos: veiculosArray });
}

// Implementação do serviço de Estimativa
function CalcularEstimativa(call, callback) {
    const { id_veiculo, destino } = call.request;
    console.log(`[Central gRPC] Solicitou estimativa para ${id_veiculo} com destino ${destino}`);

    let tempoEstimado = "Não disponível";
    const localizacaoAtual = ultimasLocalizacoes.get(id_veiculo);

    if (localizacaoAtual) {
        // Simulação simples: 100km de distância para o Centro
        const distanciaSimulada = 100; // km
        const velocidadeMedia = localizacaoAtual.velocidade > 0 ? localizacaoAtual.velocidade : 60; // km/h (evita divisão por zero)
        const tempoHoras = distanciaSimulada / velocidadeMedia;
        const tempoMinutos = Math.round(tempoHoras * 60);
        tempoEstimado = `${tempoMinutos} minutos`;
    }

    callback(null, { tempo_estimado: tempoEstimado });
}

// Inicialização do servidor gRPC
function main() {
    const server = new grpc.Server();
    server.addService(proto.Rastreamento.service, { Monitorar: Monitorar, ListarLocalizacoes: ListarLocalizacoes });
    server.addService(proto.Estimativa.service, { Calcular: CalcularEstimativa });

    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error('Erro ao iniciar servidor gRPC:', err);
            return;
        }
        console.log(`✅ Central gRPC rodando em http://localhost:${port}`);
        server.start();
    });
}

main();

// Exemplo de como você poderia acionar um comando manualmente (fora do escopo da demo para simplificar)
/*
setTimeout(() => {
    // Isso simularia a central enviando um comando para um veículo específico
    // Por exemplo, via um painel de controle admin ou outra lógica
    const veiculoParaComandar = 'veiculo_01'; // Altere para o ID do veículo desejado
    const stream = veiculoStreams.get(veiculoParaComandar);
    if (stream) {
        const comando = {
            id_veiculo: veiculoParaComandar,
            mensagem: 'Redirecionar para Rua Principal, 123'
        };
        stream.write(comando);
        console.log(`[Central gRPC] Comando manual enviado para ${veiculoParaComandar}: ${comando.mensagem}`);
    } else {
        console.warn(`[Central gRPC] Veículo ${veiculoParaComandar} não está conectado.`);
    }
}, 20000); // Tenta enviar um comando após 20 segundos
*/