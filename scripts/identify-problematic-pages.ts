/**
 * Script para identificar páginas problemáticas (não indexadas) e priorizar
 * por potencial de tráfego baseado em dados do Stack Overflow
 */

import { db } from '../src/lib/db/client.js';
import { terms } from '../src/lib/db/schema.js';
import { inArray, sql, desc } from 'drizzle-orm';
import * as fs from 'fs';

// Termos recentemente submetidos ao GSC (provavelmente não indexados)
const gscSubmittedSlugs = `kubernetes-pvc
euclidean-algorithm
informix
smooth-scrolling
direct3d
aws-iot
google-kubernetes-engine
checkbox
meanjs
facebook-api
amd
restful
amd-gpu
cabal
physics
httpservletresponse
lists
phpmyadmin
bioinformatics
jquery-ui-datepicker
lets-encrypt
influxql
mp4
vorbis
css-border-image
bcrypt
elk
cifs
permutation
google-sheets-formula
telegraf
firefox-addon
css-text-overflow
restful-architecture
biopython
uncaught-typeerror
break
cdialog
bigdata
javax-persistence
floating-point
maple`.split('\n').map(s => s.trim()).filter(Boolean);

interface PrioritizedTerm {
  slug: string;
  title: string;
  stackoverflow_count: number;
  model_used: string | null;
  rag_enabled: boolean;
  priority_score: number;
  reason: string;
}

async function identifyProblematicPages() {
  console.log('🔍 Identificando páginas problemáticas...\n');

  // 1. Buscar dados do PostgreSQL para os termos submetidos ao GSC
  const gscTermsData = await db
    .select({
      slug: terms.slug,
      title: terms.title,
      stackoverflow_count: terms.stackOverflowCount,
      model_used: terms.modelUsed,
      rag_enabled: terms.ragEnabled,
      views: terms.views,
    })
    .from(terms)
    .where(inArray(terms.slug, gscSubmittedSlugs));

  console.log(`✅ Encontrados ${gscTermsData.length} termos no banco de dados`);
  console.log(`📝 Total submetido ao GSC: ${gscSubmittedSlugs.length}\n`);

  // 2. Calcular score de prioridade
  const prioritized: PrioritizedTerm[] = gscTermsData.map(term => {
    let score = 0;
    let reasons: string[] = [];

    // Volume Stack Overflow (peso maior)
    const soCount = term.stackoverflow_count || 0;
    if (soCount > 10000) {
      score += 100;
      reasons.push(`${soCount.toLocaleString()} Q's SO`);
    } else if (soCount > 1000) {
      score += 50;
      reasons.push(`${soCount.toLocaleString()} Q's SO`);
    } else if (soCount > 100) {
      score += 20;
      reasons.push(`${soCount} Q's SO`);
    } else {
      score += 5;
    }

    // Já tem RAG habilitado? (menor prioridade, já está melhor)
    if (term.rag_enabled) {
      score -= 30;
      reasons.push('já tem RAG');
    }

    // Modelo usado (versão antiga precisa upgrade)
    if (!term.model_used || term.model_used === 'gpt-3.5-turbo') {
      score += 30;
      reasons.push('modelo antigo');
    }

    // Teve views? (já tem algum interesse)
    if ((term.views || 0) > 10) {
      score += 10;
      reasons.push(`${term.views} views`);
    }

    return {
      slug: term.slug,
      title: term.title,
      stackoverflow_count: soCount,
      model_used: term.model_used,
      rag_enabled: term.rag_enabled || false,
      priority_score: score,
      reason: reasons.join(', '),
    };
  });

  // 3. Ordenar por prioridade
  const sorted = prioritized.sort((a, b) => b.priority_score - a.priority_score);

  // 4. Exibir resultados
  console.log('='.repeat(80));
  console.log('📊 TOP 100 PÁGINAS PARA ENRIQUECER (Por Prioridade)');
  console.log('='.repeat(80));
  console.log('Rank | Slug                    | SO Count  | Score | Razão');
  console.log('-'.repeat(80));

  sorted.slice(0, 100).forEach((term, index) => {
    console.log(
      `${(index + 1).toString().padStart(4)} | ` +
      `${term.slug.padEnd(23)} | ` +
      `${term.stackoverflow_count.toString().padStart(8)} | ` +
      `${term.priority_score.toString().padStart(5)} | ` +
      `${term.reason}`
    );
  });

  console.log('='.repeat(80));
  console.log(`\n💰 Custo estimado para top 100: R$ ${(100 * 1.20).toFixed(2)}\n`);

  // 5. Salvar lista priorizada
  const top100Slugs = sorted.slice(0, 100).map(t => t.slug);
  fs.writeFileSync(
    'top-100-not-indexed-prioritized.txt',
    top100Slugs.join('\n'),
    'utf-8'
  );

  console.log('✅ Lista salva em: top-100-not-indexed-prioritized.txt');

  // 6. Estatísticas
  console.log('\n📈 ESTATÍSTICAS:');
  console.log(`Total de termos analisados: ${sorted.length}`);
  console.log(`Com RAG habilitado: ${sorted.filter(t => t.rag_enabled).length}`);
  console.log(`Sem RAG: ${sorted.filter(t => !t.rag_enabled).length}`);
  console.log(`Com SO > 1000: ${sorted.filter(t => t.stackoverflow_count > 1000).length}`);
  console.log(`Com SO > 10000: ${sorted.filter(t => t.stackoverflow_count > 10000).length}`);

  // 7. Buscar top termos por volume Stack Overflow (adicional)
  console.log('\n🔥 Buscando termos adicionais com alto volume SO...');

  const additionalHighVolume = await db
    .select({
      slug: terms.slug,
      stackoverflow_count: terms.stackOverflowCount,
      rag_enabled: terms.ragEnabled,
    })
    .from(terms)
    .where(sql`${terms.stackOverflowCount} > 5000 AND ${terms.ragEnabled} = false`)
    .orderBy(desc(terms.stackOverflowCount))
    .limit(50);

  console.log(`\n✨ Encontrados ${additionalHighVolume.length} termos com alto volume sem RAG:`);
  additionalHighVolume.slice(0, 10).forEach((term, i) => {
    console.log(`  ${i + 1}. ${term.slug} (${term.stackoverflow_count?.toLocaleString()} perguntas)`);
  });

  // Combinar listas
  const combined = [
    ...top100Slugs,
    ...additionalHighVolume.map(t => t.slug).filter(s => !top100Slugs.includes(s))
  ].slice(0, 100);

  fs.writeFileSync(
    'top-100-final-enrichment-list.txt',
    combined.join('\n'),
    'utf-8'
  );

  console.log('\n✅ Lista final (combinada) salva em: top-100-final-enrichment-list.txt');
  console.log(`📊 Total: ${combined.length} termos priorizados\n`);

  process.exit(0);
}

identifyProblematicPages().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
