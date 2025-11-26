/**
 * Script para testar o OpenAI Agents SDK
 *
 * Uso:
 *   npm run test:agent
 */

import { generateContentWithAgent } from '../src/lib/agents/contentAgent';
import { db } from '../src/lib/db/client';
import { terms } from '../src/lib/db/schema';

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          🧪 OpenAI Agents SDK Test 🧪                     ║
║                                                            ║
║  Testando geração de conteúdo com ferramentas             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

async function main() {
  const testTerm = 'api';

  try {
    console.log(`🎯 Gerando conteúdo para termo de teste: ${testTerm}\n`);

    const startTime = Date.now();
    const content = await generateContentWithAgent(testTerm);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('✅ CONTEÚDO GERADO COM SUCESSO');
    console.log('='.repeat(60));
    console.log(`Título: ${content.title}`);
    console.log(`Categoria: ${content.category}`);
    console.log(`Seções: ${Object.keys(content.content).length}`);
    console.log(`Exemplos de código: ${content.codeExamples.length}`);
    console.log(`FAQ: ${content.faq.length}`);
    console.log(`Referências: ${content.references.length}`);
    console.log(`Duração: ${duration}s`);
    console.log('='.repeat(60) + '\n');

    // Mostrar preview do conteúdo
    console.log('📝 Preview da Introdução:');
    console.log(content.content.introduction.content.substring(0, 200) + '...\n');

    console.log('💻 Primeiro exemplo de código:');
    console.log(`Linguagem: ${content.codeExamples[0].language}`);
    console.log(content.codeExamples[0].code.substring(0, 150) + '...\n');

    console.log('❓ Primeira pergunta do FAQ:');
    console.log(`P: ${content.faq[0].question}`);
    console.log(`R: ${content.faq[0].answer.substring(0, 100)}...\n`);

    // Perguntar se quer salvar no banco
    console.log('💾 Salvando no PostgreSQL...');

    await db.insert(terms).values({
      slug: testTerm,
      title: content.title,
      content: content.content,
      category: content.category,
      metaDescription: content.metaDescription,
      codeExamples: content.codeExamples,
      faq: content.faq,
      termReferences: content.references,
      whyLearn: content.whyLearn,
      modelUsed: 'sabiazinho-3-agent',
      ragEnabled: true,
      version: '2.0',
      generatedAt: new Date(),
      publishedAt: new Date(),
      status: 'published',
    });

    console.log('✅ Termo salvo no PostgreSQL!');
    console.log(`\n🌐 Teste no site: http://localhost:3000/termos/${testTerm}\n`);

    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Erro durante teste:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
