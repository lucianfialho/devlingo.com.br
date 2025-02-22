import redisClient from '@/lib/redisClient';
import { NextResponse } from 'next/server';

const redis = redisClient;
const STACK_API_URL = 'https://api.stackexchange.com/2.3/tags?key=U4DMV*8nvpm3EOpvf69Rxw((&site=stackoverflow&order=desc&sort=popular';
const PAGE_SIZE = 100; // Define quantos termos buscar por página

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
    return Math.floor(Math.random() * 1000) + 500;
}

async function fetchTags(page = 1) {
    console.log(`📥 Buscando página ${page} da API...`);

    try {
        const response = await fetch(`${STACK_API_URL}&page=${page}&pagesize=${PAGE_SIZE}`);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const data = await response.json();
        const tags = data.items;

        if (!tags || tags.length === 0) {
            console.log("✅ Nenhum novo termo encontrado, finalizando.");
            return; // Para a recursão quando não há mais páginas
        }

        for (const tag of tags) {
            const key = `term:${tag.name}`;

            // Verifica se a chave já existe no Redis
            const exists = await redis.exists(key);
            if (exists) {
                console.log(`🔄 Termo já existe, pulando: ${tag.name}`);
                continue; // Pula para o próximo termo
            }

            const value = {
                name: tag.name,
                count: tag.count,
                description: `Termo popular com ${tag.count.toLocaleString()} menções no Stack Overflow.`,
                source: 'Stack Overflow API',
                last_updated: new Date().toISOString()
            };

            await redis.set(key, JSON.stringify(value));
            console.log(`✔️ Armazenado: ${tag.name}`);

            await sleep(randomDelay()); // Evita sobrecarga na API
        }

        // Verifica se há mais páginas e chama recursivamente
        if (data.has_more) {
            await fetchTags(page + 1);
        } else {
            console.log("🚀 Todas as páginas foram processadas.");
        }
    } catch (error) {
        console.error("❌ Erro ao buscar dados:", error);
    }
}

export const GET = async () => {
    console.log("🚀 Iniciando atualização dos dados...");

    try {
        await fetchTags(); // Chama a função inicial para buscar a 1ª página
        return NextResponse.json({ success: true, message: "Dados atualizados com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao processar atualização:", error);
        return NextResponse.json({ success: false, error: "Erro ao buscar dados." }, { status: 500 });
    }
};
