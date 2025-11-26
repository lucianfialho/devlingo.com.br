/**
 * Gera conteúdo para os termos 404 identificados do GSC
 */

import { getTerm } from '../src/lib/services/termsService';
import * as fs from 'fs';

async function generate404Terms() {
  console.log('🚀 Gerando conteúdo para termos 404...\n');

  // Ler lista de termos
  const slugs = fs.readFileSync('top-9-404-terms.txt', 'utf-8')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  console.log(`📋 Termos a gerar: ${slugs.length}\n`);

  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const progress = `[${i + 1}/${slugs.length}]`;

    try {
      console.log(`\n${progress} 🔄 Gerando: ${slug}`);
      const termStartTime = Date.now();

      // getTerm já faz: Redis → PostgreSQL → Generate
      const result = await getTerm(slug);

      if (result.success && result.term) {
        const duration = ((Date.now() - termStartTime) / 1000).toFixed(1);
        const charCount = JSON.stringify(result.term.content).length;

        console.log(`${progress} ✅ ${slug}`);
        console.log(`   📝 ${charCount} caracteres`);
        console.log(`   ⏱️  ${duration}s`);
        console.log(`   🗂️  Fonte: ${result.source}`);
        console.log(`   💾 Salvo no PostgreSQL + Redis`);

        successCount++;
      } else {
        console.log(`${progress} ❌ Falha ao gerar termo`);
        errorCount++;
      }

    } catch (error: any) {
      console.log(`${progress} ❌ Erro: ${error.message}`);
      errorCount++;
    }

    // Pequeno delay entre gerações
    if (i < slugs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log('\n' + '='.repeat(80));
  console.log('✅ GERAÇÃO CONCLUÍDA');
  console.log('='.repeat(80));
  console.log(`✅ Sucesso: ${successCount}/${slugs.length}`);
  console.log(`❌ Erros: ${errorCount}/${slugs.length}`);
  console.log(`⏱️  Tempo total: ${totalTime} minutos`);
  console.log(`💰 Custo estimado: R$ ${(successCount * 1.05).toFixed(2)}`);
  console.log('='.repeat(80));

  process.exit(errorCount > 0 ? 1 : 0);
}

generate404Terms().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
