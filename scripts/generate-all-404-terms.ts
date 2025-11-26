/**
 * Gera conteúdo para TODOS os termos 404 identificados do GSC
 */

import { getTerm } from '../src/lib/services/termsService';
import { db } from '../src/lib/db/client';
import { terms } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

// Lista completa de URLs 404 do GSC
const urls404 = `https://www.devlingo.com.br/termos/pvclust
https://www.devlingo.com.br/termos/kubernetes-pvc
https://www.devlingo.com.br/termos/angle-to-euclidean-space
https://www.devlingo.com.br/termos/euclidean-algorithm
https://www.devlingo.com.br/termos/informix
https://www.devlingo.com.br/termos/smooth-scrolling
https://www.devlingo.com.br/termos/direct3d
https://www.devlingo.com.br/termos/aws-iot
https://www.devlingo.com.br/termos/google-kubernetes-engine
https://www.devlingo.com.br/termos/checkbox
https://www.devlingo.com.br/termos/meanjs
https://www.devlingo.com.br/termos/facebook-api
https://www.devlingo.com.br/termos/amd
https://www.devlingo.com.br/termos/restful
https://www.devlingo.com.br/termos/amd-gpu
https://www.devlingo.com.br/termos/cabal
https://www.devlingo.com.br/termos/physics
https://www.devlingo.com.br/termos/httpservletresponse
https://www.devlingo.com.br/termos/lists
https://www.devlingo.com.br/termos/phpmyadmin
https://www.devlingo.com.br/termos/bioinformatics
https://www.devlingo.com.br/termos/jquery-ui-datepicker
https://www.devlingo.com.br/termos/lets-encrypt
https://www.devlingo.com.br/termos/influxql
https://www.devlingo.com.br/termos/mp4
https://www.devlingo.com.br/termos/vorbis
https://www.devlingo.com.br/termos/css-border-image
https://www.devlingo.com.br/termos/bcrypt
https://www.devlingo.com.br/termos/elk
https://www.devlingo.com.br/termos/cifs
https://www.devlingo.com.br/termos/permutation
https://www.devlingo.com.br/termos/google-sheets-formula
https://www.devlingo.com.br/termos/telegraf
https://www.devlingo.com.br/termos/firefox-addon
https://www.devlingo.com.br/termos/css-text-overflow
https://www.devlingo.com.br/termos/aspose-pdf
https://www.devlingo.com.br/termos/spire-pdf
https://www.devlingo.com.br/termos/restful-architecture
https://www.devlingo.com.br/termos/biopython
https://www.devlingo.com.br/termos/uncaught-typeerror
https://www.devlingo.com.br/termos/break
https://www.devlingo.com.br/termos/cdialog
https://www.devlingo.com.br/termos/bigdata
https://www.devlingo.com.br/termos/javax-persistence
https://www.devlingo.com.br/termos/floating-point
https://www.devlingo.com.br/termos/maple
https://www.devlingo.com.br/termos/supabase`.split('\n').map(s => s.trim()).filter(Boolean);

// Termos NÃO-TECH que devem ser descartados
const nonTechTerms = new Set([
  'physics',
  'angle-to-euclidean-space',
  'pvclust',
  'bioinformatics',
]);

async function generateAll404Terms() {
  console.log('🚀 Gerando conteúdo para TODOS os termos 404 do GSC...\n');

  // Extrair slugs
  const allSlugs = urls404
    .map(url => {
      const match = url.match(/\/termos\/([^\/]+)$/);
      return match ? match[1] : null;
    })
    .filter(Boolean)
    .filter(slug => !nonTechTerms.has(slug!)) as string[];

  console.log(`📊 Total de URLs 404: ${urls404.length}`);
  console.log(`✅ Slugs tech válidos: ${allSlugs.length}\n`);

  // Verificar quais já existem
  const slugsToGenerate: string[] = [];

  for (const slug of allSlugs) {
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

  console.log('='.repeat(80));
  console.log('🎯 GERANDO TODOS OS TERMOS 404');
  console.log('='.repeat(80));
  console.log(`💰 Custo estimado: R$ ${(slugsToGenerate.length * 0.08).toFixed(2)}`);
  console.log(`⏱️  Tempo estimado: ~${Math.round(slugsToGenerate.length * 25 / 60)} minutos`);
  console.log('='.repeat(80));
  console.log();

  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < slugsToGenerate.length; i++) {
    const slug = slugsToGenerate[i];
    const progress = `[${i + 1}/${slugsToGenerate.length}]`;

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
    if (i < slugsToGenerate.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log('\n' + '='.repeat(80));
  console.log('✅ GERAÇÃO CONCLUÍDA');
  console.log('='.repeat(80));
  console.log(`✅ Sucesso: ${successCount}/${slugsToGenerate.length}`);
  console.log(`❌ Erros: ${errorCount}/${slugsToGenerate.length}`);
  console.log(`⏱️  Tempo total: ${totalTime} minutos`);
  console.log(`💰 Custo real: ~R$ ${(successCount * 0.08).toFixed(2)}`);
  console.log('='.repeat(80));

  console.log('\n📋 URLs geradas (prontas para submeter ao GSC):');
  const generated = allSlugs.slice(0, successCount);
  generated.forEach(slug => {
    console.log(`  https://www.devlingo.com.br/termos/${slug}`);
  });

  process.exit(errorCount > 0 ? 1 : 0);
}

generateAll404Terms().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
