import { createClient } from 'redis';

if (!process.env.REDIS_URL) {
  throw new Error('A variável de ambiente REDIS_URL não está definida.');
}

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => (retries > 5 ? false : Math.min(retries * 100, 3000)), // Máximo de 5 tentativas, evitando loop infinito
    connectTimeout: 10000, // Tempo limite de conexão de 10s
  },
});

// Emite erro se ocorrer
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

// Tenta reconectar automaticamente, mas sem loop infinito
redisClient.on('end', async () => {
  console.warn('⚠️ Redis desconectado. Tentando reconectar...');
  try {
    if (!redisClient.isOpen) await redisClient.connect();
    console.log('✅ Redis reconectado.');
  } catch (err) {
    console.error('❌ Falha ao reconectar ao Redis:', err);
  }
});

// Conecta apenas se ainda não estiver conectado
(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('✅ Conectado ao Redis.');
    }
  } catch (err) {
    console.error('❌ Erro ao conectar ao Redis:', err);
  }
})();


export default redisClient;
