// lib/stackOverflowRAG.js
import NodeCache from 'node-cache';

// Cache para evitar requests desnecessários (24 horas)
const cache = new NodeCache({ stdTTL: 86400 });

const SO_API_CONFIG = {
  baseURL: 'https://api.stackexchange.com/2.3',
  site: 'stackoverflow',
  key: process.env.STACKOVERFLOW_API_KEY || 'U4DMV*8nvpm3EOpvf69Rxw((',
  pagesize: 10,
  timeout: 10000
};

// Rate limiting simples
const rateLimiter = {
  requests: [],
  maxRequests: 30, // Por minuto
  
  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < 60000);
    return this.requests.length < this.maxRequests;
  },
  
  recordRequest() {
    this.requests.push(Date.now());
  }
};

// Função utilitária para fazer requests com retry
async function makeSORequest(endpoint, params = {}) {
  if (!rateLimiter.canMakeRequest()) {
    console.log('⏳ Rate limit atingido, aguardando...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  const cacheKey = `so_${endpoint}_${JSON.stringify(params)}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log(`📋 Cache hit para: ${endpoint}`);
    return cached;
  }
  
  const url = new URL(`${SO_API_CONFIG.baseURL}/${endpoint}`);
  Object.entries({
    ...params,
    site: SO_API_CONFIG.site,
    key: SO_API_CONFIG.key
  }).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, value);
  });
  
  rateLimiter.recordRequest();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SO_API_CONFIG.timeout);
    
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DevLingo-Dictionary/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Stack Overflow API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Verificar quota
    if (data.quota_remaining && data.quota_remaining < 100) {
      console.warn(`⚠️ Quota baixa do Stack Overflow: ${data.quota_remaining} restantes`);
    }
    
    cache.set(cacheKey, data);
    return data;
    
  } catch (error) {
    console.error(`❌ Erro na Stack Overflow API (${endpoint}):`, error.message);
    return null;
  }
}

// Função para buscar informações básicas da tag
async function getTagInfo(tag) {
  console.log(`🔍 Buscando info da tag: ${tag}`);
  
  const data = await makeSORequest(`tags/${encodeURIComponent(tag)}/info`, {
    filter: 'default'
  });
  
  if (!data?.items?.length) return null;
  
  const tagInfo = data.items[0];
  return {
    name: tagInfo.name,
    count: tagInfo.count,
    description: tagInfo.excerpt_post_id ? await getTagWiki(tag) : null,
    isRequired: tagInfo.is_required || false,
    isModeratorOnly: tagInfo.is_moderator_only || false,
    synonyms: tagInfo.synonyms || []
  };
}

// Função para buscar wiki da tag
async function getTagWiki(tag) {
  console.log(`📚 Buscando wiki da tag: ${tag}`);
  
  const data = await makeSORequest(`tags/${encodeURIComponent(tag)}/wikis`);
  
  if (!data?.items?.length) return null;
  
  const wiki = data.items[0];
  return {
    excerpt: wiki.excerpt,
    body: wiki.body,
    lastEditDate: wiki.last_edit_date,
    lastEditor: wiki.last_editor
  };
}

// Função para buscar tags relacionadas
async function getRelatedTags(tag) {
  console.log(`🔗 Buscando tags relacionadas: ${tag}`);
  
  const data = await makeSORequest(`tags/${encodeURIComponent(tag)}/related`, {
    pagesize: 20
  });
  
  if (!data?.items?.length) return [];
  
  return data.items.map(item => ({
    name: item.name,
    count: item.count,
    relationship_strength: item.count // Proxy para força da relação
  })).sort((a, b) => b.count - a.count).slice(0, 10);
}

// Função para buscar FAQ da tag
async function getTagFAQ(tag) {
  console.log(`❓ Buscando FAQ da tag: ${tag}`);
  
  const data = await makeSORequest(`tags/${encodeURIComponent(tag)}/faq`, {
    pagesize: 10
  });
  
  if (!data?.items?.length) return [];
  
  return data.items.map(item => ({
    question: item.title,
    questionId: item.question_id,
    score: item.score,
    answerCount: item.answer_count,
    tags: item.tags,
    link: item.link
  }));
}

// Função para buscar sinônimos
async function getTagSynonyms(tag) {
  console.log(`🔄 Buscando sinônimos da tag: ${tag}`);
  
  const data = await makeSORequest(`tags/${encodeURIComponent(tag)}/synonyms`);
  
  if (!data?.items?.length) return [];
  
  return data.items.map(item => ({
    from: item.from_tag,
    to: item.to_tag,
    appliedCount: item.applied_count,
    creationDate: item.creation_date
  }));
}

// Função principal para coletar todos os dados relevantes
export async function gatherStackOverflowData(term) {
  console.log(`📡 Iniciando coleta de dados do Stack Overflow para: ${term}`);
  
  const normalizedTerm = term.toLowerCase().replace(/[^\w-]/g, '');
  
  try {
    // Executar requests em paralelo para melhor performance
    const [tagInfo, wiki, faq, synonyms] = await Promise.allSettled([
      getTagInfo(normalizedTerm),
      getTagWiki(normalizedTerm),
      getTagFAQ(normalizedTerm),
      getTagSynonyms(normalizedTerm)
    ]);
    
    const result = {
      term: normalizedTerm,
      timestamp: new Date().toISOString(),
      data: {
        tagInfo: tagInfo.status === 'fulfilled' ? tagInfo.value : null,
        wiki: wiki.status === 'fulfilled' ? wiki.value : null,
        faq: faq.status === 'fulfilled' ? faq.value : [],
        synonyms: synonyms.status === 'fulfilled' ? synonyms.value : []
      },
      dataQuality: {
        hasBasicInfo: !!tagInfo.value,
        hasWiki: !!wiki.value,
        hasFAQ: faq.value?.length > 0,
        hasSynonyms: synonyms.value?.length > 0
      }
    };
    
    // Calcular score de qualidade dos dados
    const qualityScore = Object.values(result.dataQuality).filter(Boolean).length;
    result.qualityScore = qualityScore;
    
    console.log(`✅ Dados coletados do Stack Overflow para '${term}' (qualidade: ${qualityScore}/4)`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ Erro ao coletar dados do Stack Overflow para '${term}':`, error);
    return {
      term: normalizedTerm,
      timestamp: new Date().toISOString(),
      error: error.message,
      data: null,
      qualityScore: 0
    };
  }
}

// Função para processar dados do SO e extrair insights
export function processStackOverflowData(soData) {
  if (!soData?.data) return null;
  
  const { tagInfo, wiki, faq, synonyms } = soData.data;
  
  const insights = {
    // Contexto de popularidade
    popularity: tagInfo ? {
      questionCount: tagInfo.count,
      popularityRank: getPopularityRank(tagInfo.count),
      isMainstream: tagInfo.count > 1000
    } : null,
    
    // Definição refinada
    definition: wiki ? {
      officialExcerpt: wiki.excerpt,
      detailedDescription: wiki.body,
      isWellDocumented: wiki.body && wiki.body.length > 200
    } : null,
    
    // FAQ real da comunidade
    communityFAQ: faq.slice(0, 5).map(item => ({
      question: item.question,
      difficulty: item.score > 50 ? 'advanced' : item.score > 10 ? 'intermediate' : 'beginner',
      popularity: item.answerCount,
      sourceLink: item.link
    })),
    
    // Variações e sinônimos
    variations: synonyms.map(syn => ({
      term: syn.from !== soData.term ? syn.from : syn.to,
      usage: syn.appliedCount
    })),
    
    // Metadados para enriquecer o prompt
    metadata: {
      isNicheTechnology: tagInfo && tagInfo.count < 100,
      isPopularTechnology: tagInfo && tagInfo.count > 10000,
      hasActiveDiscussion: faq.length > 0,
      communitySize: tagInfo ? tagInfo.count : 0
    }
  };
  
  return insights;
}

// Função auxiliar para determinar ranking de popularidade
function getPopularityRank(count) {
  if (count > 100000) return 'extremely-popular';
  if (count > 50000) return 'very-popular';
  if (count > 10000) return 'popular';
  if (count > 1000) return 'moderate';
  if (count > 100) return 'niche';
  return 'emerging';
}

// Função para gerar prompt enriquecido com dados do SO
export function generateEnrichedPrompt(term, category, soInsights) {
  if (!soInsights) {
    return null; // Fallback para prompt normal
  }
  
  const { popularity, definition, communityFAQ, variations, metadata } = soInsights;
  
  let enrichmentContext = `\n## CONTEXTO DO STACK OVERFLOW (DADOS REAIS DA COMUNIDADE)\n`;
  
  // Adicionar contexto de popularidade
  if (popularity) {
    enrichmentContext += `
**Popularidade na Comunidade:**
- ${popularity.questionCount.toLocaleString()} perguntas relacionadas no Stack Overflow
- Classificação: ${popularity.popularityRank.replace('-', ' ')}
- Status: ${popularity.isMainstream ? 'Tecnologia mainstream' : 'Tecnologia especializada'}
`;
  }
  
  // Adicionar definição da comunidade
  if (definition && definition.officialExcerpt) {
    enrichmentContext += `
**Definição da Comunidade:**
${definition.officialExcerpt}
`;
  }
  
  // Adicionar FAQ real da comunidade
  if (communityFAQ.length > 0) {
    enrichmentContext += `
**Perguntas Reais da Comunidade para se Inspirar:**
${communityFAQ.slice(0, 3).map(q => `- ${q.question} (${q.difficulty})`).join('\n')}
`;
  }
  
  // Adicionar variações conhecidas
  if (variations.length > 0) {
    enrichmentContext += `
**Variações e Sinônimos Conhecidos:**
${variations.slice(0, 3).map(v => `- ${v.term}`).join('\n')}
`;
  }
  
  // Adicionar instruções específicas baseadas nos metadados
  if (metadata.isPopularTechnology) {
    enrichmentContext += `
**INSTRUÇÕES ESPECIAIS:** Esta é uma tecnologia muito popular. Foque em casos de uso avançados, melhores práticas e comparações com alternativas.`;
  } else if (metadata.isNicheTechnology) {
    enrichmentContext += `
**INSTRUÇÕES ESPECIAIS:** Esta é uma tecnologia de nicho. Explique bem o contexto de uso, quando usar, e forneça exemplos práticos detalhados.`;
  }
  
  return enrichmentContext;
}

// Função integrada para uso no content.js
export async function enhanceContentWithStackOverflow(term, basePrompt) {
  try {
    console.log(`🚀 Enriquecendo conteúdo com dados do Stack Overflow...`);
    
    // Coletar dados do Stack Overflow
    const soData = await gatherStackOverflowData(term);
    
    if (soData.qualityScore === 0) {
      console.log(`⚠️ Nenhum dado útil encontrado no SO para '${term}', usando prompt base`);
      return basePrompt;
    }
    
    // Processar dados coletados
    const insights = processStackOverflowData(soData);
    
    // Gerar contexto enriquecido
    const enrichmentContext = generateEnrichedPrompt(term, null, insights);
    
    if (!enrichmentContext) {
      return basePrompt;
    }
    
    // Integrar ao prompt base
    const enhancedPrompt = basePrompt.replace(
      '## REQUISITOS DE QUALIDADE PREMIUM',
      `${enrichmentContext}\n\n## REQUISITOS DE QUALIDADE PREMIUM`
    );
    
    console.log(`✅ Prompt enriquecido com dados do Stack Overflow (qualidade: ${soData.qualityScore}/5)`);
    
    return enhancedPrompt;
    
  } catch (error) {
    console.error(`❌ Erro ao enriquecer com Stack Overflow:`, error);
    return basePrompt; // Fallback para prompt original
  }
}