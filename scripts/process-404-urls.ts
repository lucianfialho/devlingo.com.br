/**
 * Processa lista de URLs 404 do Google Search Console
 * Extrai slugs, filtra termos não-tech, e gera os top 9
 */

import { db } from '../src/lib/db/client.js';
import { terms } from '../src/lib/db/schema.js';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

// Lista de URLs 404 do GSC
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
  'physics', // física (não é dev)
  'home', // página inicial
  'angle-to-euclidean-space', // matemática pura
  'pvclust', // estatística/R muito específico
  'bioinformatics', // bioinformática (não é dev puro)
]);

interface Slug404 {
  slug: string;
  url: string;
  path: string; // 'termos', 'o-que-e', 'compare', etc
}

async function process404URLs() {
  console.log('🔍 Processando URLs 404 do Google Search Console...\n');

  // 1. Extrair slugs das URLs
  const slugs404: Slug404[] = [];

  urls404.forEach(url => {
    const match = url.match(/devlingo\.com\.br\/([^\/]+)\/([^\/]+)/);
    if (match) {
      const [, path, slug] = match;
      slugs404.push({ slug, url, path });
    }
  });

  console.log(`📊 Total de URLs 404: ${urls404.length}`);
  console.log(`✅ Slugs extraídos: ${slugs404.length}\n`);

  // 2. Filtrar slugs não-tech
  const techSlugs = slugs404.filter(item => {
    // Descartar non-tech
    if (nonTechTerms.has(item.slug)) {
      console.log(`❌ Descartado (não-tech): ${item.slug}`);
      return false;
    }

    // Descartar URLs de compare e por-que-aprender por agora
    if (item.path === 'compare' || item.path === 'por-que-aprender') {
      console.log(`⏭️  Pulado (${item.path}): ${item.slug}`);
      return false;
    }

    return true;
  });

  console.log(`\n✅ Slugs tech (termos/o-que-e): ${techSlugs.length}\n`);

  // 3. Verificar quais já existem no banco
  const slugsToGenerate: string[] = [];

  for (const item of techSlugs) {
    const result = await db
      .select({ slug: terms.slug })
      .from(terms)
      .where(eq(terms.slug, item.slug))
      .limit(1);

    if (result.length === 0) {
      slugsToGenerate.push(item.slug);
    } else {
      console.log(`✓ Já existe: ${item.slug}`);
    }
  }

  console.log(`\n📝 Termos que precisam ser gerados: ${slugsToGenerate.length}\n`);

  // 4. Priorizar os top 9 (por ordem de rastreamento = mais recentes primeiro)
  const top9 = slugsToGenerate.slice(0, 9);

  console.log('='.repeat(80));
  console.log('🎯 TOP 9 TERMOS 404 PARA GERAR');
  console.log('='.repeat(80));
  top9.forEach((slug, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${slug}`);
  });
  console.log('='.repeat(80));

  // 5. Salvar lista
  fs.writeFileSync(
    'top-9-404-terms.txt',
    top9.join('\n'),
    'utf-8'
  );

  console.log(`\n✅ Lista salva em: top-9-404-terms.txt`);
  console.log(`💰 Custo: R$ ${(top9.length * 1.05).toFixed(2)}`);
  console.log(`⏱️  Tempo estimado: ~${Math.round(top9.length * 21 / 60)} minutos\n`);

  // 6. Estatísticas
  console.log('📊 ESTATÍSTICAS:');
  console.log(`Total URLs 404: ${urls404.length}`);
  console.log(`Slugs tech válidos: ${techSlugs.length}`);
  console.log(`Já existem no banco: ${techSlugs.length - slugsToGenerate.length}`);
  console.log(`Precisam ser gerados: ${slugsToGenerate.length}`);
  console.log(`Top 9 priorizados: ${top9.length}\n`);

  process.exit(0);
}

process404URLs().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
