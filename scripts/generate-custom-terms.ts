/**
 * Script para gerar conteúdo para lista customizada de termos
 *
 * Uso:
 *   npm run generate:custom api,react,nodejs,python
 */

import { batchGenerateContent } from '../src/lib/agents/contentGeneratorAgent';

// Ler argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(`
❌ Erro: Nenhum termo fornecido

Uso:
  npm run generate:custom <termo1>,<termo2>,<termo3>...

Exemplos:
  npm run generate:custom api,react,nodejs,python
  npm run generate:custom "docker,kubernetes,terraform"
  `);
  process.exit(1);
}

// Parsear termos (pode ser comma-separated ou espaços)
const termsInput = args.join(' ');
const termsList = termsInput
  .split(/[,\s]+/)
  .map(t => t.trim().toLowerCase())
  .filter(t => t.length > 0);

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          🎯 Custom Terms Content Generator 🎯             ║
║                                                            ║
║  Gerando conteúdo para ${termsList.length.toString().padEnd(2)} termos customizados            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📝 Termos selecionados:
${termsList.map((t, i) => `   ${(i + 1).toString().padStart(2)}. ${t}`).join('\n')}
`);

async function main() {
  try {
    const result = await batchGenerateContent({
      termsList,
      concurrency: 3,
      skipExisting: true,
    });

    // Exibir resultados
    if (result.errors > 0) {
      console.log('\n⚠️  TERMOS COM ERRO:\n');
      result.results
        .filter(r => r.status === 'error')
        .forEach(r => {
          console.log(`  ❌ ${r.slug}: ${r.error}`);
        });
    }

    console.log('\n✅ Geração customizada concluída!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  }
}

main();
