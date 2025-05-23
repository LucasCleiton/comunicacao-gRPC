# 🚚 Sistema de Gestão de Frota com gRPC em Tempo Real

## ✨ Visão Geral do Projeto

Este projeto simula um sistema distribuído de **Gestão de Frota** para uma empresa de logística, com foco no **monitoramento de veículos em tempo real** e na comunicação eficiente entre a central e os veículos.  
A tecnologia central utilizada para a comunicação entre os microsserviços é o **gRPC**, aproveitando seus recursos de **streaming bidirecional** e **serialização Protobuf** para alta performance e confiabilidade.



## 🚀 Arquitetura Distribuída

![image](https://github.com/user-attachments/assets/d0c9674d-f332-4e86-b8e1-b83151453a89)

### Componentes:

- **Central de Rastreamento (gRPC Server)**: Recebe dados via streaming dos veículos e envia comandos. Também oferece métodos unários gRPC.
- **Veículos (gRPC Clients)**: Simulam movimento e status, enviando dados via streaming para a central.
- **Backend (Express)**: Conecta o frontend à central via API REST.
- **Frontend (React)**: Interface web com mapa e botões para interações.

## 🛠️ Tecnologias Utilizadas

| Tecnologia            | Versão         | Descrição                                   |
|-----------------------|----------------|---------------------------------------------|
| Node.js               | v18.18.0+      | Ambiente de execução JavaScript             |
| @grpc/grpc-js         | ^1.9.14        | Cliente e servidor gRPC                     |
| @grpc/proto-loader    | ^0.1.0         | Carregamento de arquivos .proto             |
| Express               | ^4.18.2        | Servidor HTTP REST                          |
| CORS                  | ^2.8.5         | Middleware para requisições cross-origin    |
| Concurrently          | ^8.2.2         | Executa múltiplos scripts simultaneamente   |
| React                 | ^18.2.0        | Interface de usuário                        |
| React-Leaflet         | ^4.2.1         | Mapa interativo                             |
| Leaflet               | ^1.9.4         | Biblioteca base de mapas                    |
| Protocol Buffers (v3) |                | Serialização eficiente para mensagens gRPC  |


## ⚙️ Como Executar o Projeto

### ✅ Pré-requisitos

- Node.js v18.18.0+
- npm (gerenciador de pacotes)

### 1. Clonar o Repositório

```bash
git clone https://github.com/LucasCleiton/comunicacao-gRPC.git

# Na raiz
npm install concurrently

# Backend
cd backend
npm install

# Simuladores de veículos
cd ../vehicle_simulators
npm install

# Frontend
cd ../frontend
npm install
cd ..

```
### Executar os Serviços

```bash
npm run start:all
```

# 👨‍💻 Desenvolvedor
Lucas Ferreira

