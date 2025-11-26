/**
 * Processa os resultados do batch e salva no banco de dados
 */

import { db } from '../src/lib/db/client.js';
import { terms } from '../src/lib/db/schema.js';
import { redis } from '../src/lib/redisClient.js';
import * as fs from 'fs';

async function processBatchResults() {
  const batchId = process.argv[2];

  if (!batchId) {
    console.error('❌ Erro: Batch ID não fornecido');
    console.log('Uso: npm run batch:process -- <batch_id>');
    process.exit(1);
  }

  const resultsFileName = `batch-${batchId}-results.jsonl`;

  if (!fs.existsSync(resultsFileName)) {
    console.error(`❌ Erro: Arquivo de resultados não encontrado: ${resultsFileName}`);
    console.log('💡 Primeiro baixe os resultados com: npm run batch:download -- ' + batchId);
    process.exit(1);
  }

  console.log('🔄 Processando resultados do batch e salvando no banco...\n');

  const resultsContent = fs.readFileSync(resultsFileName, 'utf-8');
  const lines = resultsContent.trim().split('\n');

  console.log(`📊 Total de resultados: ${lines.length}\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const line of lines) {
    try {
      const result = JSON.parse(line);

      // Extrair slug do custom_id (formato: "term-{index}-{slug}")
      const customId = result.custom_id;
      const slug = customId.split('-').slice(2).join('-');

      console.log(`[${successCount + errorCount + skippedCount + 1}/${lines.length}] 🔄 ${slug}`);

      // Verificar se teve erro
      if (result.error) {
        console.log(`   ❌ Erro: ${result.error.message}`);
        errorCount++;
        continue;
      }

      // Verificar resposta
      if (!result.response || result.response.status_code !== 200) {
        console.log(`   ❌ Resposta inválida (status: ${result.response?.status_code})`);
        errorCount++;
        continue;
      }

      // Extrair conteúdo da resposta
      const choice = result.response.body.choices?.[0];
      if (!choice || !choice.message?.content) {
        console.log(`   ❌ Conteúdo vazio`);
        errorCount++;
        continue;
      }

      // Parse do JSON retornado pela IA
      let termData;
      try {
        const content = choice.message.content;
        // Tentar extrair JSON do conteúdo (pode vir com markdown code blocks)
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                         content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          termData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          termData = JSON.parse(content);
        }
      } catch (e) {
        console.log(`   ❌ Erro ao parsear JSON: ${e}`);
        errorCount++;
        continue;
      }

      // Validar dados essenciais
      if (!termData.shortDefinition || !termData.detailedExplanation) {
        console.log(`   ❌ Dados incompletos`);
        errorCount++;
        continue;
      }

      // Preparar dados para inserção
      const termToInsert = {
        slug: slug,
        title: termData.name || slug,
        content: {
          shortDefinition: termData.shortDefinition,
          detailedExplanation: termData.detailedExplanation,
          codeExamples: termData.codeExamples || [],
          useCases: termData.useCases || [],
          commonMistakes: termData.commonMistakes || [],
          bestPractices: termData.bestPractices || []
        },
        category: termData.category || 'technical',
        relatedTerms: termData.relatedTerms || [],
        status: 'published' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Inserir no banco
      try {
        await db.insert(terms).values(termToInsert);
        console.log(`   ✅ Salvo no PostgreSQL`);

        // Cachear no Redis
        try {
          const cacheKey = `term:${slug}`;
          await redis.setex(cacheKey, 86400, JSON.stringify(termToInsert)); // 24h TTL
          console.log(`   💾 Cacheado no Redis (24h)`);
        } catch (redisError) {
          console.log(`   ⚠️  Erro ao cachear no Redis (não crítico)`);
        }

        successCount++;
      } catch (dbError: any) {
        if (dbError.message?.includes('duplicate key')) {
          console.log(`   ⏭️  Já existe no banco`);
          skippedCount++;
        } else {
          console.log(`   ❌ Erro ao salvar no banco: ${dbError.message}`);
          errorCount++;
        }
      }

    } catch (error: any) {
      console.log(`   ❌ Erro ao processar linha: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ PROCESSAMENTO CONCLUÍDO');
  console.log('='.repeat(80));
  console.log(`✅ Salvos com sucesso: ${successCount}/${lines.length}`);
  console.log(`⏭️  Já existiam: ${skippedCount}/${lines.length}`);
  console.log(`❌ Erros: ${errorCount}/${lines.length}`);
  console.log('='.repeat(80));

  if (successCount > 0) {
    console.log('\n📋 URLs geradas (prontas para submeter ao GSC):');
    console.log(`Total: ${successCount} URLs\n`);
    console.log('💡 Execute este script para gerar a lista de URLs:');
    console.log(`   npm run sitemap:generate`);
  }

  console.log();
  process.exit(errorCount > 0 ? 1 : 0);
}

processBatchResults().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
