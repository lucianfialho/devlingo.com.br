/**
 * Service Layer para gerenciar termos
 *
 * Arquitetura:
 * 1. PostgreSQL = Source of truth (dados persistentes)
 * 2. Redis = Cache layer (TTL 24h para top terms)
 * 3. Runtime generation = Fallback se termo não existe
 */

import { db } from '../db/client';
import { terms } from '../db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import redisClient from '../redisClient';
import { generateContent } from '../content';

const REDIS_TTL = 86400; // 24 horas

interface TermData {
  slug: string;
  title: string;
  content: any;
  category?: string;
  metaDescription?: string;
  codeExamples?: any[];
  faq?: any[];
  termReferences?: any[];
  whyLearn?: string;
  [key: string]: any;
}

/**
 * Busca termo com cache: Redis → PostgreSQL → Generate
 */
export async function getTerm(slug: string): Promise<{ success: boolean; term?: TermData; source?: string }> {
  try {
    const cleanSlug = slug.toLowerCase().trim();

    // 1. Tentar cache Redis primeiro (fastest)
    const cached = await getFromRedis(cleanSlug);
    if (cached) {
      return { success: true, term: cached, source: 'redis' };
    }

    // 2. Buscar no PostgreSQL (source of truth)
    const dbTerm = await getFromDatabase(cleanSlug);
    if (dbTerm && dbTerm.status === 'published') {
      // Cachear no Redis para próximas requisições
      await cacheInRedis(cleanSlug, dbTerm);
      return { success: true, term: formatTermForAPI(dbTerm), source: 'postgres' };
    }

    // 3. Gerar conteúdo dinamicamente (fallback)
    console.log(`🤖 Termo '${cleanSlug}' não encontrado. Gerando conteúdo...`);
    const generated = await generateAndSaveTerm(cleanSlug);

    if (generated) {
      return { success: true, term: generated, source: 'generated' };
    }

    return { success: false };

  } catch (error) {
    console.error(`❌ Erro ao buscar termo '${slug}':`, error);
    return { success: false };
  }
}

/**
 * Lista termos com paginação (PostgreSQL only)
 */
export async function listTerms(options: {
  limit?: number;
  offset?: number;
  category?: string;
  status?: string;
}) {
  const { limit = 20, offset = 0, category, status = 'published' } = options;

  try {
    const conditions = [];

    if (status) conditions.push(eq(terms.status, status));
    if (category) conditions.push(eq(terms.category, category));

    const results = await db
      .select()
      .from(terms)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(terms.views))
      .limit(limit)
      .offset(offset);

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(terms)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      success: true,
      terms: results.map(formatTermForAPI),
      total: Number(total[0].count),
      limit,
      offset,
    };
  } catch (error) {
    console.error('❌ Erro ao listar termos:', error);
    return { success: false, error: 'Erro ao listar termos' };
  }
}

/**
 * Busca termos por categoria
 */
export async function getTermsByCategory(categorySlug: string, limit = 50) {
  return listTerms({ category: categorySlug, limit });
}

/**
 * Incrementa visualizações de um termo
 */
export async function incrementViews(slug: string) {
  try {
    await db
      .update(terms)
      .set({ views: sql`${terms.views} + 1` })
      .where(eq(terms.slug, slug));

    console.log(`📊 View incrementado para '${slug}'`);
  } catch (error) {
    console.error(`❌ Erro ao incrementar views de '${slug}':`, error);
  }
}

/**
 * Busca full-text em português
 */
export async function searchTerms(query: string, limit = 20) {
  try {
    const results = await db.execute(sql`
      SELECT
        slug, title, meta_description, category,
        ts_rank(search_vector, plainto_tsquery('portuguese', ${query})) as rank
      FROM terms
      WHERE
        status = 'published'
        AND search_vector @@ plainto_tsquery('portuguese', ${query})
      ORDER BY rank DESC
      LIMIT ${limit}
    `);

    return {
      success: true,
      terms: results,
      query,
    };
  } catch (error) {
    console.error('❌ Erro na busca:', error);
    return { success: false, error: 'Erro na busca' };
  }
}

// ============================================================================
// Helper Functions (Private)
// ============================================================================

/**
 * Busca termo no Redis
 */
async function getFromRedis(slug: string): Promise<TermData | null> {
  try {
    const key = `terms:${slug}`;
    const cached = await redisClient.get(key);

    if (cached) {
      console.log(`✅ Cache hit no Redis: ${slug}`);
      return JSON.parse(cached);
    }

    return null;
  } catch (error) {
    console.error(`❌ Erro ao buscar do Redis '${slug}':`, error);
    return null;
  }
}

/**
 * Busca termo no PostgreSQL
 */
async function getFromDatabase(slug: string) {
  try {
    const result = await db.query.terms.findFirst({
      where: eq(terms.slug, slug),
    });

    if (result) {
      console.log(`✅ Termo encontrado no PostgreSQL: ${slug}`);
    }

    return result;
  } catch (error) {
    console.error(`❌ Erro ao buscar do PostgreSQL '${slug}':`, error);
    return null;
  }
}

/**
 * Cacheia termo no Redis
 */
async function cacheInRedis(slug: string, data: any) {
  try {
    const key = `terms:${slug}`;
    const formatted = formatTermForAPI(data);
    await redisClient.setEx(key, REDIS_TTL, JSON.stringify(formatted));
    console.log(`💾 Termo cacheado no Redis: ${slug} (TTL: 24h)`);
  } catch (error) {
    console.error(`❌ Erro ao cachear no Redis '${slug}':`, error);
  }
}

/**
 * Gera conteúdo e salva no PostgreSQL + Redis
 */
async function generateAndSaveTerm(slug: string): Promise<TermData | null> {
  try {
    // Gerar conteúdo com IA
    const generated = await generateContent(slug);

    // Salvar no PostgreSQL
    const [saved] = await db.insert(terms).values({
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
      modelUsed: generated.model_used,
      generationTimeMs: generated.generation_time_ms,
      ragEnabled: generated.rag_enabled,
      version: generated.version,
      generatedAt: new Date(generated.generated_at),
      publishedAt: new Date(),
      status: 'published',
    }).returning();

    console.log(`✅ Termo gerado e salvo no PostgreSQL: ${slug}`);

    // Cachear no Redis
    const formatted = formatTermForAPI(saved);
    await cacheInRedis(slug, formatted);

    return formatted;
  } catch (error) {
    console.error(`❌ Erro ao gerar e salvar termo '${slug}':`, error);
    return null;
  }
}

/**
 * Formata termo do DB para resposta da API
 */
function formatTermForAPI(dbTerm: any): TermData {
  return {
    slug: dbTerm.slug,
    title: dbTerm.title,
    content: dbTerm.content,
    category: dbTerm.category,
    metaDescription: dbTerm.metaDescription,
    codeExamples: dbTerm.codeExamples,
    faq: dbTerm.faq,
    references: dbTerm.termReferences,
    whyLearn: dbTerm.whyLearn,
    sources: dbTerm.sources,
    metadata: dbTerm.metadata,
    related_terms: dbTerm.relatedTerms,
    views: dbTerm.views,
    status: dbTerm.status,
    created_at: dbTerm.createdAt,
    updated_at: dbTerm.updatedAt,
    published_at: dbTerm.publishedAt,

    // Generation metadata
    model_used: dbTerm.modelUsed,
    generation_time_ms: dbTerm.generationTimeMs,
    rag_enabled: dbTerm.ragEnabled,
    version: dbTerm.version,
    generated_at: dbTerm.generatedAt,
    stackoverflow_data: dbTerm.stackOverflowData,
  };
}
