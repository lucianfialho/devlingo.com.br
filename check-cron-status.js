/**
 * Script para verificar status dos crons
 */

const postgres = require('postgres');
require('dotenv').config();

async function checkCronStatus() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 VERIFICAÇÃO DO STATUS DOS CRONS');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Conectar ao banco
    const sql = postgres(process.env.DATABASE_URL, {
      ssl: 'require'
    });

    console.log('✅ Conectado ao PostgreSQL\n');

    // 1. Verificar termos pending
    console.log('📊 Verificando termos com status "pending"...');
    const pendingTerms = await sql`
      SELECT slug, status, created_at, updated_at
      FROM terms
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    if (pendingTerms.length > 0) {
      console.log(`\n✅ Encontrados ${pendingTerms.length} termos pending:\n`);
      pendingTerms.forEach((term, i) => {
        console.log(`${i + 1}. ${term.slug}`);
        console.log(`   Status: ${term.status}`);
        console.log(`   Criado: ${term.created_at}`);
        console.log(`   Atualizado: ${term.updated_at}\n`);
      });
    } else {
      console.log('\n⚠️ Nenhum termo com status "pending" encontrado');
      console.log('   Para testar, acesse uma URL 404 como:');
      console.log('   https://devlingo.com.br/termos/teste-cron-404\n');
    }

    // 2. Verificar termos em geração
    console.log('─────────────────────────────────────────────────────\n');
    console.log('🔄 Verificando termos com status "generating"...');
    const generatingTerms = await sql`
      SELECT slug, status, created_at
      FROM terms
      WHERE status = 'generating'
      ORDER BY created_at DESC
      LIMIT 5
    `;

    if (generatingTerms.length > 0) {
      console.log(`\n✅ Encontrados ${generatingTerms.length} termos em geração:\n`);
      generatingTerms.forEach((term, i) => {
        console.log(`${i + 1}. ${term.slug} (desde ${term.created_at})`);
      });
    } else {
      console.log('\n✅ Nenhum termo em geração no momento');
    }

    // 3. Estatísticas gerais
    console.log('\n─────────────────────────────────────────────────────\n');
    console.log('📈 Estatísticas Gerais:\n');

    const stats = await sql`
      SELECT
        status,
        COUNT(*) as total
      FROM terms
      GROUP BY status
      ORDER BY total DESC
    `;

    stats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat.total} termos`);
    });

    // 4. Últimos termos criados
    console.log('\n─────────────────────────────────────────────────────\n');
    console.log('🆕 Últimos 5 termos criados:\n');

    const recentTerms = await sql`
      SELECT slug, status, created_at
      FROM terms
      ORDER BY created_at DESC
      LIMIT 5
    `;

    recentTerms.forEach((term, i) => {
      const timeAgo = Math.floor((Date.now() - new Date(term.created_at).getTime()) / 1000 / 60);
      console.log(`${i + 1}. ${term.slug}`);
      console.log(`   Status: ${term.status}`);
      console.log(`   Criado há ${timeAgo} minutos\n`);
    });

    await sql.end();

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Verificação concluída!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📋 PRÓXIMOS PASSOS:\n');
    console.log('1. ✅ Crons configurados no vercel.json');
    console.log('2. ⚠️  Adicionar CRON_SECRET no Vercel Dashboard');
    console.log('3. ⏰ Próxima execução: 22h (horário Brasil)\n');

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
  }
}

checkCronStatus().catch(console.error);
