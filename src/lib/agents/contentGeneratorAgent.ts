/**
 * Content Generator Agent
 *
 * Agente especializado em gerar conteúdo em lote usando:
 * 1. OpenAI API para geração de conteúdo
 * 2. Stack Overflow API para dados de popularidade
 * 3. Context7 (via web fetch) para documentação oficial
 * 4. PostgreSQL para persistência
 */

import { db } from '../db/client';
import { terms } from '../db/schema';
import { generateContentWithAgent } from './contentAgent';
import { generateContent as generateContentLegacy } from '../content';

interface BatchGenerationOptions {
  termsList: string[];
  priority?: 'high' | 'medium' | 'low';
  concurrency?: number;
  skipExisting?: boolean;
  useAgent?: boolean; // Usar OpenAI Agents SDK ou legacy
}

interface GenerationResult {
  slug: string;
  status: 'success' | 'error' | 'skipped';
  error?: string;
  timeMs?: number;
}

/**
 * Busca top tags do Stack Overflow
 */
export async function getTopStackOverflowTags(limit = 1000): Promise<string[]> {
  try {
    console.log(`🔍 Buscando top ${limit} tags do Stack Overflow...`);

    const response = await fetch(
      `https://api.stackexchange.com/2.3/tags?` +
      `page=1&pagesize=${limit}&order=desc&sort=popular&site=stackoverflow`,
      {
        headers: {
          'Accept-Encoding': 'gzip',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Stack Overflow API error: ${response.status}`);
    }

    const data = await response.json();

    const tags = data.items.map((item: any) => ({
      name: item.name,
      count: item.count,
    }));

    console.log(`✅ ${tags.length} tags encontradas`);
    console.log(`📊 Top 5: ${tags.slice(0, 5).map((t: any) => `${t.name} (${t.count})`).join(', ')}`);

    return tags.map((t: any) => t.name);
  } catch (error) {
    console.error('❌ Erro ao buscar tags do Stack Overflow:', error);
    return [];
  }
}

/**
 * Verifica quais termos já existem no PostgreSQL
 */
export async function filterExistingTerms(slugs: string[]): Promise<{
  existing: string[];
  missing: string[];
}> {
  try {
    const existingSlugs = await db
      .select({ slug: terms.slug })
      .from(terms)
      .where((t, { inArray }) => inArray(t.slug, slugs));

    const existingSet = new Set(existingSlugs.map(t => t.slug));
    const missing = slugs.filter(slug => !existingSet.has(slug));

    console.log(`📊 Termos existentes: ${existingSlugs.length}`);
    console.log(`📝 Termos faltantes: ${missing.length}`);

    return {
      existing: Array.from(existingSet),
      missing,
    };
  } catch (error) {
    console.error('❌ Erro ao verificar termos existentes:', error);
    return { existing: [], missing: slugs };
  }
}

/**
 * Gera conteúdo para um único termo e salva no PostgreSQL
 */
async function generateAndSaveTerm(slug: string, useAgent = true): Promise<GenerationResult> {
  const startTime = Date.now();

  try {
    console.log(`🤖 Gerando conteúdo para: ${slug} ${useAgent ? '(com Agent)' : '(legacy)'}`);

    // Gerar conteúdo usando Agent ou função legacy
    let generated: any;

    if (useAgent) {
      try {
        generated = await generateContentWithAgent(slug);
        // Adicionar metadados do Agent
        generated.model_used = 'sabiazinho-3-agent';
        generated.rag_enabled = true;
        generated.generated_at = new Date().toISOString();
        generated.generation_time_ms = Date.now() - startTime;
        generated.version = '2.0';
      } catch (agentError) {
        console.error(`⚠️  Agent falhou, usando legacy para '${slug}':`, agentError);
        generated = await generateContentLegacy(slug);
      }
    } else {
      generated = await generateContentLegacy(slug);
    }

    // Salvar no PostgreSQL
    await db.insert(terms).values({
      slug,
      title: generated.title,
      content: generated.content,
      category: generated.category,
      metaDescription: generated.metaDescription,
      codeExamples: generated.codeExamples,
      faq: generated.faq,
      termReferences: generated.references,
      whyLearn: generated.whyLearn,
      stackOverflowData: generated.stackoverflow_data,
      stackOverflowTag: slug,
      modelUsed: generated.model_used,
      generationTimeMs: generated.generation_time_ms,
      ragEnabled: generated.rag_enabled,
      version: generated.version,
      generatedAt: new Date(generated.generated_at),
      publishedAt: new Date(),
      status: 'published',
    });

    const timeMs = Date.now() - startTime;
    console.log(`✅ Termo salvo: ${slug} (${timeMs}ms)`);

    return {
      slug,
      status: 'success',
      timeMs,
    };
  } catch (error: any) {
    const timeMs = Date.now() - startTime;
    console.error(`❌ Erro ao gerar termo '${slug}':`, error.message);

    return {
      slug,
      status: 'error',
      error: error.message,
      timeMs,
    };
  }
}

/**
 * Processa lote de termos com controle de concorrência
 */
async function processBatch(
  batch: string[],
  concurrency: number,
  useAgent = true
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];
  const queue = [...batch];

  // Processar com concorrência limitada
  const workers = Array(concurrency).fill(null).map(async () => {
    while (queue.length > 0) {
      const slug = queue.shift();
      if (!slug) break;

      const result = await generateAndSaveTerm(slug, useAgent);
      results.push(result);

      // Delay entre requisições para não sobrecarregar APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  await Promise.all(workers);
  return results;
}

/**
 * Gera conteúdo em lote para múltiplos termos
 */
export async function batchGenerateContent(
  options: BatchGenerationOptions
): Promise<{
  total: number;
  success: number;
  errors: number;
  skipped: number;
  results: GenerationResult[];
  durationMs: number;
}> {
  const {
    termsList,
    concurrency = 3,
    skipExisting = true,
    useAgent = true,
  } = options;

  const startTime = Date.now();

  console.log('\n' + '='.repeat(60));
  console.log('🚀 BATCH CONTENT GENERATION');
  console.log('='.repeat(60));
  console.log(`📝 Total de termos: ${termsList.length}`);
  console.log(`⚙️  Concorrência: ${concurrency}`);
  console.log(`🔄 Skip existentes: ${skipExisting}`);
  console.log(`🤖 Modo: ${useAgent ? 'OpenAI Agents SDK' : 'Legacy'}`);
  console.log('='.repeat(60) + '\n');

  let termsToGenerate = termsList;

  // Filtrar termos existentes se necessário
  if (skipExisting) {
    const { missing } = await filterExistingTerms(termsList);
    termsToGenerate = missing;
    console.log(`✂️  Após filtro: ${termsToGenerate.length} termos para gerar\n`);
  }

  if (termsToGenerate.length === 0) {
    console.log('✅ Todos os termos já existem no banco!\n');
    return {
      total: termsList.length,
      success: 0,
      errors: 0,
      skipped: termsList.length,
      results: [],
      durationMs: Date.now() - startTime,
    };
  }

  // Processar em lotes
  const BATCH_SIZE = 10;
  const allResults: GenerationResult[] = [];

  for (let i = 0; i < termsToGenerate.length; i += BATCH_SIZE) {
    const batch = termsToGenerate.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(termsToGenerate.length / BATCH_SIZE);

    console.log(`\n📦 Processando lote ${batchNum}/${totalBatches} (${batch.length} termos)`);
    console.log(`   Termos: ${batch.join(', ')}`);

    const batchResults = await processBatch(batch, concurrency, useAgent);
    allResults.push(...batchResults);

    // Estatísticas do lote
    const batchSuccess = batchResults.filter(r => r.status === 'success').length;
    const batchErrors = batchResults.filter(r => r.status === 'error').length;
    console.log(`   ✅ Sucesso: ${batchSuccess} | ❌ Erros: ${batchErrors}`);

    // Progresso geral
    const progress = ((i + batch.length) / termsToGenerate.length * 100).toFixed(1);
    console.log(`   📈 Progresso geral: ${progress}%`);
  }

  // Estatísticas finais
  const success = allResults.filter(r => r.status === 'success').length;
  const errors = allResults.filter(r => r.status === 'error').length;
  const skipped = skipExisting ? termsList.length - termsToGenerate.length : 0;
  const durationMs = Date.now() - startTime;

  console.log('\n' + '='.repeat(60));
  console.log('📊 ESTATÍSTICAS FINAIS');
  console.log('='.repeat(60));
  console.log(`Total de termos:     ${termsList.length}`);
  console.log(`✅ Gerados:          ${success}`);
  console.log(`❌ Erros:            ${errors}`);
  console.log(`⏭️  Pulados:          ${skipped}`);
  console.log(`⏱️  Duração:          ${(durationMs / 1000).toFixed(2)}s`);
  console.log(`⚡ Taxa:             ${(termsToGenerate.length / (durationMs / 1000)).toFixed(2)} termos/s`);
  console.log(`💰 Custo estimado:   $${(success * 0.002).toFixed(2)} USD`);
  console.log('='.repeat(60) + '\n');

  return {
    total: termsList.length,
    success,
    errors,
    skipped,
    results: allResults,
    durationMs,
  };
}

/**
 * Gera top N termos do Stack Overflow
 */
export async function generateTopTerms(limit = 100, concurrency = 3, useAgent = true) {
  console.log(`🎯 Gerando top ${limit} termos do Stack Overflow...\n`);

  // Buscar top tags
  const tags = await getTopStackOverflowTags(limit);

  if (tags.length === 0) {
    console.error('❌ Nenhuma tag encontrada no Stack Overflow');
    return;
  }

  // Gerar conteúdo em lote
  const result = await batchGenerateContent({
    termsList: tags,
    concurrency,
    skipExisting: true,
    useAgent,
  });

  return result;
}

/**
 * Regenera termos existentes (útil para melhorar qualidade)
 */
export async function regenerateTerms(slugs: string[], concurrency = 2) {
  console.log(`🔄 Regenerando ${slugs.length} termos...\n`);

  const results: GenerationResult[] = [];

  for (const slug of slugs) {
    try {
      console.log(`🔄 Regenerando: ${slug}`);

      // Deletar termo existente
      await db.delete(terms).where((t, { eq }) => eq(t.slug, slug));

      // Gerar novamente
      const result = await generateAndSaveTerm(slug);
      results.push(result);

      // Delay entre requisições
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`❌ Erro ao regenerar '${slug}':`, error.message);
      results.push({
        slug,
        status: 'error',
        error: error.message,
      });
    }
  }

  const success = results.filter(r => r.status === 'success').length;
  console.log(`\n✅ Regenerados: ${success}/${slugs.length}`);

  return results;
}
