/**
 * Script para migrar dados do Redis para PostgreSQL
 *
 * Este script:
 * 1. Conecta ao Redis e lista todos os termos
 * 2. Para cada termo, extrai os dados do Redis
 * 3. Transforma os dados para o formato do PostgreSQL
 * 4. Insere no Supabase via Drizzle ORM
 * 5. Mantém o Redis como cache após migração
 */

import { createClient } from 'redis';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/db/schema.ts';
import * as dotenv from 'dotenv';

dotenv.config();

// Configurar clientes
const redisClient = createClient({ url: process.env.REDIS_URL });
const pgClient = postgres(process.env.DATABASE_URL);
const db = drizzle(pgClient, { schema });

// Estatísticas da migração
const stats = {
  total: 0,
  migrated: 0,
  skipped: 0,
  errors: 0,
  startTime: Date.now(),
};

/**
 * Transforma dados do Redis para formato PostgreSQL
 */
function transformRedisToPostgres(slug, redisData) {
  try {
    // Parse do JSON se necessário
    const data = typeof redisData === 'string' ? JSON.parse(redisData) : redisData;

    return {
      slug,
      title: data.title || slug,
      content: data.content || {},
      category: data.category || 'technical',
      metaDescription: data.metaDescription,
      sources: data.sources || [],
      metadata: data.metadata || {},
      stackOverflowTag: slug, // Usar slug como tag padrão
      stackOverflowCount: data.stackoverflow_data?.question_count || 0,
      stackOverflowData: data.stackoverflow_data || null,
      relatedTerms: data.related_terms || [],
      codeExamples: data.codeExamples || [],
      faq: data.faq || [],
      termReferences: data.references || [],
      whyLearn: data.whyLearn,
      status: 'published', // Todos os termos migrados são publicados
      views: data.views || 0,
      clicks: data.clicks || 0,
      impressions: data.impressions || 0,
      modelUsed: data.model_used,
      generationTimeMs: data.generation_time_ms,
      ragEnabled: data.rag_enabled || false,
      version: data.version || '1.0',
      generatedAt: data.generated_at ? new Date(data.generated_at) : null,
      publishedAt: new Date(), // Publicado agora
    };
  } catch (error) {
    console.error(`❌ Erro ao transformar dados do termo '${slug}':`, error);
    return null;
  }
}

/**
 * Migra um único termo do Redis para PostgreSQL
 */
async function migrateTerm(key, redisData) {
  const slug = key.replace('terms:', '');

  try {
    // Verificar se já existe no PostgreSQL
    const existing = await db.query.terms.findFirst({
      where: (terms, { eq }) => eq(terms.slug, slug)
    });

    if (existing) {
      console.log(`⏭️  Termo já existe: ${slug}`);
      stats.skipped++;
      return;
    }

    // Transformar dados
    const termData = transformRedisToPostgres(slug, redisData);
    if (!termData) {
      stats.errors++;
      return;
    }

    // Inserir no PostgreSQL
    await db.insert(schema.terms).values(termData);

    console.log(`✅ Migrado: ${slug}`);
    stats.migrated++;

  } catch (error) {
    console.error(`❌ Erro ao migrar termo '${slug}':`, error.message);
    stats.errors++;
  }
}

/**
 * Função principal de migração
 */
async function migrateAllTerms() {
  console.log('🚀 Iniciando migração Redis → PostgreSQL\n');

  try {
    // Conectar ao Redis
    await redisClient.connect();
    console.log('✅ Conectado ao Redis\n');

    // Buscar todas as chaves de termos
    let cursor = 0;
    let allKeys = [];

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: 'terms:*',
        COUNT: 100
      });
      cursor = result.cursor;
      allKeys.push(...result.keys);
    } while (cursor !== 0);

    stats.total = allKeys.length;
    console.log(`📊 Total de termos encontrados no Redis: ${stats.total}\n`);

    if (stats.total === 0) {
      console.log('⚠️  Nenhum termo encontrado no Redis. Finalizando.\n');
      return;
    }

    // Migrar termos em lotes
    const BATCH_SIZE = 10;
    for (let i = 0; i < allKeys.length; i += BATCH_SIZE) {
      const batch = allKeys.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (key) => {
          const data = await redisClient.get(key);
          if (data) {
            await migrateTerm(key, data);
          }
        })
      );

      // Log de progresso
      const progress = Math.min(i + BATCH_SIZE, allKeys.length);
      const percentage = ((progress / stats.total) * 100).toFixed(1);
      console.log(`\n📈 Progresso: ${progress}/${stats.total} (${percentage}%)`);
    }

  } catch (error) {
    console.error('❌ Erro fatal durante migração:', error);
    throw error;
  } finally {
    // Fechar conexões
    await redisClient.quit();
    await pgClient.end();
  }
}

/**
 * Exibir estatísticas finais
 */
function showStats() {
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(50));
  console.log('📊 ESTATÍSTICAS DA MIGRAÇÃO');
  console.log('='.repeat(50));
  console.log(`Total de termos:     ${stats.total}`);
  console.log(`✅ Migrados:         ${stats.migrated}`);
  console.log(`⏭️  Pulados:          ${stats.skipped}`);
  console.log(`❌ Erros:            ${stats.errors}`);
  console.log(`⏱️  Duração:          ${duration}s`);
  console.log(`⚡ Taxa:             ${(stats.total / duration).toFixed(2)} termos/s`);
  console.log('='.repeat(50) + '\n');
}

// Executar migração
migrateAllTerms()
  .then(() => {
    showStats();
    console.log('🎉 Migração concluída com sucesso!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migração falhou:', error);
    showStats();
    process.exit(1);
  });
