/**
 * Processa TODAS as URLs 404 do CSV do GSC
 * Filtra termos tech e gera os top ~116 (budget de R$ 9,30)
 */

import { db } from '../src/lib/db/client.js';
import { terms } from '../src/lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { getTerm } from '../src/lib/services/termsService';
import * as fs from 'fs';

// Termos NÃO-TECH que devem ser descartados
const nonTechTerms = new Set([
  'physics',
  'angle-to-euclidean-space',
  'pvclust',
  'bioinformatics',
  'home',
  'probability',
  'methodology',
  'evaluation',
  'anova',
  'correlation',
]);

// Paths que não são /termos (vamos ignorar por enquanto)
const ignorePaths = new Set([
  'compare',
  'por-que-aprender',
  'o-que-e',
  'categoria',
  'api',
]);

async function processAll404() {
  console.log('🔍 Processando TODAS as URLs 404 do GSC...\n');

  // Ler CSV
  const csv = fs.readFileSync('Tabela.csv', 'utf-8');
  const lines = csv.split('\n').slice(1); // Skip header

  console.log(`📊 Total de linhas no CSV: ${lines.length}\n`);

  // Extrair slugs
  const allUrls = lines
    .map(line => {
      const match = line.match(/https:\/\/www\.devlingo\.com\.br\/([^\/]+)\/([^,]+)/);
      if (!match) return null;

      const [, path, slug] = match;
      return { path, slug: slug.trim() };
    })
    .filter(Boolean) as Array<{ path: string; slug: string }>;

  console.log(`✅ URLs extraídas: ${allUrls.length}\n`);

  // Filtrar apenas /termos que são tech
  const termosOnly = allUrls
    .filter(({ path, slug }) => {
      // Ignorar paths não /termos
      if (path !== 'termos') {
        return false;
      }

      // Ignorar non-tech
      if (nonTechTerms.has(slug)) {
        return false;
      }

      // Ignorar slugs inválidos
      if (slug.startsWith('-') || slug.length < 2) {
        return false;
      }

      return true;
    })
    .map(({ slug }) => slug);

  console.log(`✅ Termos tech (/termos): ${termosOnly.length}\n`);

  // Verificar quais já existem no banco
  console.log('🔍 Verificando quais termos já existem no banco...\n');
  const slugsToGenerate: string[] = [];

  for (const slug of termosOnly) {
    const result = await db
      .select({ slug: terms.slug })
      .from(terms)
      .where(eq(terms.slug, slug))
      .limit(1);

    if (result.length === 0) {
      slugsToGenerate.push(slug);
    }
  }

  console.log(`📝 Termos que precisam ser gerados: ${slugsToGenerate.length}\n`);

  if (slugsToGenerate.length === 0) {
    console.log('✅ Todos os termos já foram gerados!');
    process.exit(0);
  }

  // Limitar ao budget (R$ 9,30 = ~116 termos @ R$ 0,08 cada)
  const budget = 9.30;
  const costPerTerm = 0.08;
  const maxTerms = Math.floor(budget / costPerTerm);

  const termsToGenerate = slugsToGenerate.slice(0, maxTerms);

  console.log('='.repeat(80));
  console.log('🎯 GERANDO TERMOS 404 COM BUDGET');
  console.log('='.repeat(80));
  console.log(`💰 Budget disponível: R$ ${budget.toFixed(2)}`);
  console.log(`📊 Custo por termo: R$ ${costPerTerm.toFixed(2)}`);
  console.log(`🎯 Máximo de termos: ${maxTerms}`);
  console.log(`✅ Termos selecionados: ${termsToGenerate.length}`);
  console.log(`💵 Custo estimado: R$ ${(termsToGenerate.length * costPerTerm).toFixed(2)}`);
  console.log(`⏱️  Tempo estimado: ~${Math.round(termsToGenerate.length * 25 / 60)} minutos`);
  console.log('='.repeat(80));
  console.log();

  // Salvar lista
  fs.writeFileSync(
    'top-116-404-terms.txt',
    termsToGenerate.join('\n'),
    'utf-8'
  );
  console.log('✅ Lista salva em: top-116-404-terms.txt\n');

  // Gerar todos
  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < termsToGenerate.length; i++) {
    const slug = termsToGenerate[i];
    const progress = `[${i + 1}/${termsToGenerate.length}]`;

    try {
      console.log(`${progress} 🔄 ${slug}`);
      const termStartTime = Date.now();

      const result = await getTerm(slug);

      if (result.success && result.term) {
        const duration = ((Date.now() - termStartTime) / 1000).toFixed(1);
        console.log(`${progress} ✅ ${slug} (${duration}s)`);
        successCount++;
      } else {
        console.log(`${progress} ❌ ${slug} (falha)`);
        errorCount++;
      }

    } catch (error: any) {
      console.log(`${progress} ❌ ${slug} (erro: ${error.message})`);
      errorCount++;
    }

    // Pequeno delay entre gerações
    if (i < termsToGenerate.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  const actualCost = (successCount * costPerTerm).toFixed(2);

  console.log('\n' + '='.repeat(80));
  console.log('✅ GERAÇÃO CONCLUÍDA');
  console.log('='.repeat(80));
  console.log(`✅ Sucesso: ${successCount}/${termsToGenerate.length}`);
  console.log(`❌ Erros: ${errorCount}/${termsToGenerate.length}`);
  console.log(`⏱️  Tempo total: ${totalTime} minutos`);
  console.log(`💰 Custo real: R$ ${actualCost}`);
  console.log(`💵 Budget restante: R$ ${(budget - parseFloat(actualCost)).toFixed(2)}`);
  console.log('='.repeat(80));

  console.log('\n📋 URLs geradas (prontas para submeter ao GSC):');
  console.log(`Total: ${successCount} URLs\n`);

  const generated = termsToGenerate.slice(0, successCount);
  generated.slice(0, 20).forEach(slug => {
    console.log(`  https://www.devlingo.com.br/termos/${slug}`);
  });

  if (generated.length > 20) {
    console.log(`  ... e mais ${generated.length - 20} URLs`);
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

processAll404().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
