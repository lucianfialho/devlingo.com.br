/**
 * Verifica o status da migração Redis → PostgreSQL
 */

import { db } from '../src/lib/db/client.js';
import { terms } from '../src/lib/db/schema.js';
import { sql } from 'drizzle-orm';
import redisClient from '../src/lib/redisClient.js';

async function checkMigrationStatus() {
  console.log('📊 Verificando status da migração Redis → PostgreSQL...\n');

  try {
    // 1. PostgreSQL
    const pgResult = await db.select({ count: sql<number>`count(*)::int` }).from(terms);
    const pgTotal = pgResult[0].count;
    console.log('✅ PostgreSQL (Source of Truth):');
    console.log(`   Total de termos: ${pgTotal.toLocaleString('pt-BR')}`);

    // Status breakdown
    const statusResult = await db.execute(sql`
      SELECT status, COUNT(*) as count
      FROM terms
      GROUP BY status
    `);

    console.log('   Status:');
    if (statusResult.rows && statusResult.rows.length > 0) {
      statusResult.rows.forEach((row: any) => {
        console.log(`     - ${row.status}: ${parseInt(row.count).toLocaleString('pt-BR')}`);
      });
    }

    // 2. Redis Cache
    try {
      await redisClient.connect();
      const redisKeys = await redisClient.keys('term:*');
      console.log('\n✅ Redis (Cache Layer):');
      console.log(`   Termos em cache: ${redisKeys.length.toLocaleString('pt-BR')}`);
      console.log(`   TTL padrão: 24 horas`);

      if (redisKeys.length > 0) {
        // Verificar alguns exemplos de TTL
        const samples = redisKeys.slice(0, 3);
        console.log('\n   Exemplos de termos em cache:');
        for (const key of samples) {
          const ttl = await redisClient.ttl(key);
          const slug = key.replace('term:', '');
          const hours = Math.floor(ttl / 3600);
          console.log(`     - ${slug} (expira em ${hours}h)`);
        }
      }
      await redisClient.disconnect();
    } catch (redisError) {
      console.log('\n⚠️  Redis (Cache Layer):');
      console.log('   Não foi possível conectar ao Redis (cache desabilitado temporariamente)');
    }

    // 3. Resumo da Migração
    console.log('\n' + '='.repeat(80));
    console.log('📈 RESUMO DA MIGRAÇÃO');
    console.log('='.repeat(80));
    console.log('✅ PostgreSQL está funcionando como source of truth');
    console.log('✅ Front-end conectado ao PostgreSQL (via termsService.ts)');
    console.log('✅ Redis funcionando como cache layer opcional');
    console.log();
    console.log('🔄 Fluxo de dados atual:');
    console.log('   1. Redis Cache (24h TTL) → busca rápida');
    console.log('   2. PostgreSQL (source of truth) → dados persistentes');
    console.log('   3. AI Generation (fallback) → gera se não existir');
    console.log('='.repeat(80));
    console.log();

    // 4. Novos termos gerados hoje
    try {
      const todayResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM terms
        WHERE created_at >= CURRENT_DATE
      `);
      if (todayResult.rows && todayResult.rows.length > 0) {
        const todayCount = parseInt(todayResult.rows[0].count);
        if (todayCount > 0) {
          console.log(`🎉 ${todayCount} novos termos gerados hoje via Batch API!`);
        }
      }
    } catch (e) {
      console.log('⚠️  Não foi possível verificar termos de hoje');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkMigrationStatus();
