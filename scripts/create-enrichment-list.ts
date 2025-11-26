/**
 * Criar lista de termos para enriquecimento baseado em:
 * 1. Termos recentemente submetidos ao GSC (provavelmente não indexados)
 * 2. Termos técnicos sem modelo/RAG
 * 3. Top termos por views
 */

import { db } from '../src/lib/db/client.js';
import { terms } from '../src/lib/db/schema.js';
import { sql, desc, or, eq, isNull } from 'drizzle-orm';
import * as fs from 'fs';

// Termos da sua lista do GSC
const gscTerms = `kubernetes-pvc
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
phpmyadmin
bioinformatics
jquery-ui-datepicker
lets-encrypt
bcrypt
elk
bigdata
floating-point`.split('\n').map(s => s.trim()).filter(Boolean);

async function createEnrichmentList() {
  console.log('🎯 Criando lista de enriquecimento baseada em múltiplos critérios...\n');

  // Estratégia 1: Termos que foram submetidos ao GSC (precisam melhorar)
  console.log('📋 Verificando termos do GSC no banco...');
  const termsInDb: string[] = [];

  for (const slug of gscTerms) {
    const result = await db
      .select({ slug: terms.slug })
      .from(terms)
      .where(eq(terms.slug, slug))
      .limit(1);

    if (result.length > 0) {
      termsInDb.push(slug);
    }
  }

  console.log(`✅ ${termsInDb.length}/${gscTerms.length} termos do GSC encontrados no banco\n`);

  // Estratégia 2: Termos técnicos sem RAG habilitado
  console.log('🔍 Buscando termos técnicos sem RAG...');
  const termsWithoutRAG = await db
    .select({ slug: terms.slug, title: terms.title, views: terms.views })
    .from(terms)
    .where(
      or(
        isNull(terms.ragEnabled),
        eq(terms.ragEnabled, false)
      )
    )
    .where(eq(terms.category, 'technical'))
    .orderBy(desc(terms.views))
    .limit(200);

  console.log(`✅ ${termsWithoutRAG.length} termos técnicos sem RAG encontrados\n`);

  // Estratégia 3: Combinar e priorizar
  const finalList = new Set<string>();

  // Adicionar termos do GSC (prioridade máxima)
  termsInDb.forEach(slug => finalList.add(slug));

  // Adicionar termos sem RAG com mais views
  termsWithoutRAG
    .slice(0, 100 - finalList.size)
    .forEach(term => finalList.add(term.slug));

  const finalArray = Array.from(finalList).slice(0, 100);

  // Salvar lista
  fs.writeFileSync(
    'top-100-enrichment-list.txt',
    finalArray.join('\n'),
    'utf-8'
  );

  console.log('='.repeat(60));
  console.log('✅ LISTA DE ENRIQUECIMENTO CRIADA');
  console.log('='.repeat(60));
  console.log(`📊 Total de termos: ${finalArray.length}`);
  console.log(`📝 Do GSC: ${termsInDb.length}`);
  console.log(`🔧 Técnicos sem RAG: ${finalArray.length - termsInDb.length}`);
  console.log(`\n💰 Custo estimado: R$ ${(finalArray.length * 1.20).toFixed(2)}`);
  console.log(`⏱️  Tempo estimado: ~${Math.round(finalArray.length * 22 / 60)} minutos`);
  console.log('='.repeat(60));

  console.log('\n📋 Primeiros 20 termos da lista:');
  finalArray.slice(0, 20).forEach((slug, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${slug}`);
  });

  console.log(`\n✅ Lista salva em: top-100-enrichment-list.txt\n`);

  process.exit(0);
}

createEnrichmentList().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
