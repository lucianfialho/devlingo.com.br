/**
 * Script para gerar conteúdo para top N termos do Stack Overflow
 *
 * Uso:
 *   npm run generate:top100    - Gera top 100 termos
 *   npm run generate:top500    - Gera top 500 termos
 *   npm run generate:top1000   - Gera top 1000 termos
 */

import { generateTopTerms } from '../src/lib/agents/contentGeneratorAgent';

// Ler argumentos da linha de comando
const args = process.argv.slice(2);
const limit = parseInt(args[0]) || 100;
const concurrency = parseInt(args[1]) || 3;

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          🚀 DevLingo Batch Content Generator 🚀           ║
║                                                            ║
║  Gerando conteúdo para os top ${limit.toString().padEnd(4)} termos do Stack Overflow  ║
║  Concorrência: ${concurrency} requisições simultâneas                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

async function main() {
  try {
    const result = await generateTopTerms(limit, concurrency);

    if (!result) {
      console.error('❌ Falha ao gerar termos');
      process.exit(1);
    }

    // Exibir termos com erro
    if (result.errors > 0) {
      console.log('\n⚠️  TERMOS COM ERRO:\n');
      result.results
        .filter(r => r.status === 'error')
        .forEach(r => {
          console.log(`  ❌ ${r.slug}: ${r.error}`);
        });
    }

    console.log('\n✅ Geração em lote concluída!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  }
}

main();
