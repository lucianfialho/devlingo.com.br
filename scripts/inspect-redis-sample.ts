/**
 * Script para inspecionar amostra de termos do Redis
 * e avaliar qualidade do conteúdo existente
 */

import { createClient } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({ url: process.env.REDIS_URL });

async function inspectRedisContent() {
  console.log('🔍 Inspecionando conteúdo do Redis...\n');

  try {
    await redisClient.connect();

    // Buscar amostra de 10 termos
    const { keys } = await redisClient.scan(0, {
      MATCH: 'terms:*',
      COUNT: 10,
    });

    console.log(`📊 Analisando ${keys.length} termos de amostra:\n`);

    const analysis: any[] = [];

    for (const key of keys.slice(0, 10)) {
      const slug = key.replace('terms:', '');
      const data = await redisClient.get(key);

      if (!data) continue;

      const term = JSON.parse(data);

      // Analisar estrutura
      const hasContent = term.content && typeof term.content === 'object';
      const contentSections = hasContent ? Object.keys(term.content).length : 0;
      const hasCodeExamples = Array.isArray(term.codeExamples) && term.codeExamples.length > 0;
      const hasFaq = Array.isArray(term.faq) && term.faq.length > 0;

      // Calcular tamanho do conteúdo
      let contentLength = 0;
      if (hasContent) {
        contentLength = Object.values(term.content)
          .map((section: any) => section?.content?.length || 0)
          .reduce((a: number, b: number) => a + b, 0);
      }

      analysis.push({
        slug,
        hasTitle: !!term.title,
        hasMetaDescription: !!term.metaDescription,
        contentSections,
        contentLength,
        hasCodeExamples,
        codeExamplesCount: term.codeExamples?.length || 0,
        hasFaq,
        faqCount: term.faq?.length || 0,
        hasReferences: Array.isArray(term.references) && term.references.length > 0,
        version: term.version || '1.0',
        modelUsed: term.model_used || 'unknown',
        ragEnabled: term.rag_enabled || false,
      });

      console.log(`\n${slug}:`);
      console.log(`  ✓ Título: ${term.title?.substring(0, 50)}...`);
      console.log(`  ✓ Seções: ${contentSections}`);
      console.log(`  ✓ Tamanho: ${contentLength} caracteres`);
      console.log(`  ✓ Código: ${term.codeExamples?.length || 0} exemplos`);
      console.log(`  ✓ FAQ: ${term.faq?.length || 0} perguntas`);
      console.log(`  ✓ Model: ${term.model_used || 'unknown'}`);
      console.log(`  ✓ RAG: ${term.rag_enabled ? 'Sim' : 'Não'}`);
    }

    // Estatísticas gerais
    console.log('\n' + '='.repeat(60));
    console.log('📈 ESTATÍSTICAS DA AMOSTRA');
    console.log('='.repeat(60));

    const avgContentLength = analysis.reduce((sum, a) => sum + a.contentLength, 0) / analysis.length;
    const avgSections = analysis.reduce((sum, a) => sum + a.contentSections, 0) / analysis.length;
    const withCodeExamples = analysis.filter(a => a.hasCodeExamples).length;
    const withFaq = analysis.filter(a => a.hasFaq).length;
    const withRAG = analysis.filter(a => a.ragEnabled).length;

    console.log(`Total analisado: ${analysis.length} termos`);
    console.log(`Tamanho médio: ${Math.round(avgContentLength)} caracteres`);
    console.log(`Seções médias: ${avgSections.toFixed(1)}`);
    console.log(`Com exemplos de código: ${withCodeExamples}/${analysis.length} (${(withCodeExamples/analysis.length*100).toFixed(0)}%)`);
    console.log(`Com FAQ: ${withFaq}/${analysis.length} (${(withFaq/analysis.length*100).toFixed(0)}%)`);
    console.log(`Com RAG (Stack Overflow): ${withRAG}/${analysis.length} (${(withRAG/analysis.length*100).toFixed(0)}%)`);

    const models = [...new Set(analysis.map(a => a.modelUsed))];
    console.log(`\nModelos usados: ${models.join(', ')}`);

    console.log('\n' + '='.repeat(60));
    console.log('💡 RECOMENDAÇÃO');
    console.log('='.repeat(60));

    if (avgContentLength > 2000 && withCodeExamples > 7 && withFaq > 7) {
      console.log('✅ CONTEÚDO DE BOA QUALIDADE');
      console.log('Recomendação: MIGRAR todos os 15k termos do Redis');
      console.log('Depois: Melhorar top 100-500 com Agent SDK');
    } else if (avgContentLength > 1000) {
      console.log('⚠️  CONTEÚDO DE QUALIDADE MÉDIA');
      console.log('Recomendação: MIGRAR top 5000 termos (mais populares)');
      console.log('Gerar: Top 500 novos com Agent SDK');
    } else {
      console.log('❌ CONTEÚDO DE BAIXA QUALIDADE');
      console.log('Recomendação: NÃO MIGRAR');
      console.log('Gerar: Top 1000 do zero com Agent SDK');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    await redisClient.quit();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro:', error);
    await redisClient.quit();
    process.exit(1);
  }
}

inspectRedisContent();
