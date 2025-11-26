/**
 * Script para regenerar termos existentes (melhoria de qualidade)
 *
 * Uso:
 *   npm run regenerate api,react,vue
 */

import { regenerateTerms } from '../src/lib/agents/contentGeneratorAgent';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(`
❌ Erro: Nenhum termo fornecido

Uso:
  npm run regenerate <termo1>,<termo2>,<termo3>...

Exemplos:
  npm run regenerate api,react,vue
  npm run regenerate "docker,kubernetes"
  `);
  process.exit(1);
}

const termsInput = args.join(' ');
const termsList = termsInput
  .split(/[,\s]+/)
  .map(t => t.trim().toLowerCase())
  .filter(t => t.length > 0);

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          🔄 Terms Regeneration Tool 🔄                    ║
║                                                            ║
║  Regenerando ${termsList.length.toString().padEnd(2)} termos com conteúdo melhorado      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📝 Termos para regenerar:
${termsList.map((t, i) => `   ${(i + 1).toString().padStart(2)}. ${t}`).join('\n')}

⚠️  ATENÇÃO: Isso irá deletar e recriar esses termos!
`);

async function main() {
  try {
    const results = await regenerateTerms(termsList, 2);

    const success = results.filter(r => r.status === 'success').length;
    const errors = results.filter(r => r.status === 'error');

    if (errors.length > 0) {
      console.log('\n❌ Erros durante regeneração:\n');
      errors.forEach(r => {
        console.log(`  ❌ ${r.slug}: ${r.error}`);
      });
    }

    console.log(`\n✅ Regenerados com sucesso: ${success}/${termsList.length}\n`);
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  }
}

main();
