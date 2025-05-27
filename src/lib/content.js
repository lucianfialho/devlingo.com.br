import OpenAI from "openai";
import { 
  gatherStackOverflowData, 
  processStackOverflowData, 
  enhanceContentWithStackOverflow 
} from "./stackOverflowRAG.js";

// Configuração da OpenAI/Maritaca
const openai = new OpenAI({ 
  apiKey: process.env.MARITACA_API_KEY, 
  baseURL: "https://chat.maritaca.ai/api"
});

// Cache de prompts e dados do Stack Overflow
const promptCache = new Map();
const soDataCache = new Map();

// Configurações de geração
const GENERATION_CONFIG = {
  model: "sabiazinho-3",
  temperature: 0.4,
  max_tokens: 4096,
  timeout: 60000,
  maxRetries: 3,
  useStackOverflowRAG: true // Feature flag para RAG
};

// [Manter todas as outras funções existentes: CATEGORY_INFO, detectCategory, etc.]
const CATEGORY_INFO = {
  "internet": {
    keywords: ["web", "protocolo", "rede", "online", "navegador", "http", "https", "url"],
    examples: ["HTTP", "DNS", "cookies", "cache", "websocket"],
    focus: "protocolos de rede, tecnologias web e comunicação online"
  },
  "hardware": {
    keywords: ["físico", "componente", "dispositivo", "equipamento", "circuito", "processador"],
    examples: ["CPU", "RAM", "SSD", "GPU", "motherboard"],
    focus: "componentes físicos, arquitetura de computadores e dispositivos"
  },
  "software": {
    keywords: ["programa", "aplicativo", "sistema", "código", "interface", "funcionalidade"],
    examples: ["sistemas operacionais", "aplicativos", "drivers", "bibliotecas"],
    focus: "programas, aplicações e sistemas de software"
  },
  "technical": {
    keywords: ["conceito", "metodologia", "arquitetura", "padrão", "princípio", "técnica"],
    examples: ["algoritmos", "estruturas de dados", "design patterns", "arquitetura"],
    focus: "conceitos técnicos, metodologias e princípios de engenharia"
  },
  "acronyms": {
    keywords: ["sigla", "abreviação", "acrônimo", "nomenclatura", "terminologia"],
    examples: ["API", "SQL", "HTML", "CSS", "JSON"],
    focus: "siglas, abreviações e nomenclaturas técnicas"
  },
  "bits_and_bytes": {
    keywords: ["dados", "binário", "armazenamento", "codificação", "bits", "bytes"],
    examples: ["encoding", "compression", "data structures", "binary"],
    focus: "manipulação de dados, codificação e representação binária"
  },
  "file_formats": {
    keywords: ["formato", "arquivo", "extensão", "codificação", "especificação"],
    examples: ["JSON", "XML", "CSV", "PDF", "PNG"],
    focus: "formatos de arquivo, especificações e padrões de dados"
  }
};

function detectCategory(term) {
  const termLower = term.toLowerCase();
  
  const directMapping = {
    'api': 'technical', 'http': 'internet', 'https': 'internet',
    'html': 'acronyms', 'css': 'acronyms', 'javascript': 'software',
    'python': 'software', 'java': 'software', 'sql': 'acronyms',
    'json': 'file_formats', 'xml': 'file_formats', 'cpu': 'hardware',
    'gpu': 'hardware', 'ram': 'hardware', 'ssd': 'hardware'
  };
  
  if (directMapping[termLower]) {
    return directMapping[termLower];
  }
  
  let bestMatch = 'technical';
  let maxScore = 0;
  
  for (const [category, info] of Object.entries(CATEGORY_INFO)) {
    const score = info.keywords.filter(keyword => 
      termLower.includes(keyword) || keyword.includes(termLower)
    ).length;
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = category;
    }
  }
  
  return bestMatch;
}

// Função para gerar prompt base otimizado
function generateBasePrompt(term, category) {
  const categoryInfo = CATEGORY_INFO[category] || CATEGORY_INFO.technical;
  
  return `Você é um especialista técnico sênior com mais de 15 anos de experiência em tecnologia. Crie um artigo técnico EXCEPCIONAL e DETALHADO sobre "${term}" para um dicionário de referência profissional.

## CONTEXTO E CATEGORIA
Categoria: ${category}
Foco: ${categoryInfo.focus}
Exemplos relacionados: ${categoryInfo.examples.join(", ")}

## REQUISITOS DE QUALIDADE PREMIUM

### 1. PROFUNDIDADE TÉCNICA
- Artigo com MÍNIMO 2000 palavras de conteúdo substantivo
- Explicações técnicas precisas e aprofundadas
- Cobertura completa do tema sem superficialidade
- Demonstração clara de expertise e autoridade no assunto

### 2. ESTRUTURA EDUCACIONAL AVANÇADA
- Progressão lógica do básico ao avançado
- Múltiplas perspectivas e abordagens
- Casos de uso reais e práticos do mercado
- Comparações com tecnologias relacionadas

### 3. VALOR COMERCIAL E PRÁTICO
- Relevância para profissionais da área
- Aplicações no mundo real
- Tendências e perspectivas futuras
- Impacto no mercado e na indústria

### 4. ORIGINALIDADE E EXPERTISE
- Conteúdo 100% original e único
- Insights baseados em experiência prática
- Análise crítica e considerações técnicas
- Linguagem clara mas tecnicamente precisa

## ESTRUTURA OBRIGATÓRIA DO JSON

Retorne EXCLUSIVAMENTE um JSON válido com esta estrutura:

{
  "title": "Título otimizado para SEO incluindo '${term}' naturalmente (máximo 60 caracteres)",
  "metaDescription": "Meta descrição persuasiva e informativa (150-160 caracteres)",
  "category": "${category}",
  "content": {
    "introduction": {
      "heading": "O que é ${term}?",
      "content": "Introdução abrangente e definição clara (mínimo 300 palavras)"
    },
    "fundamentals": {
      "heading": "Fundamentos e Conceitos Essenciais",
      "content": "Explicação técnica detalhada dos conceitos base (mínimo 400 palavras)"
    },
    "implementation": {
      "heading": "Como Funciona na Prática",
      "content": "Detalhes de implementação e funcionamento técnico (mínimo 350 palavras)"
    },
    "useCases": {
      "heading": "Casos de Uso e Aplicações",
      "content": "Exemplos reais e aplicações práticas no mercado (mínimo 300 palavras)"
    },
    "comparison": {
      "heading": "Comparação com Alternativas",
      "content": "Análise comparativa com tecnologias similares (mínimo 250 palavras)"
    },
    "bestPractices": {
      "heading": "Melhores Práticas e Considerações",
      "content": "Recomendações técnicas e considerações importantes (mínimo 200 palavras)"
    },
    "future": {
      "heading": "Tendências e Perspectivas Futuras",
      "content": "Evolução esperada e direções futuras (mínimo 200 palavras)"
    }
  },
  "codeExamples": [
    {
      "language": "Linguagem mais relevante para ${term}",
      "code": "Código funcional e bem comentado (não pseudocódigo)",
      "description": "Explicação detalhada do exemplo e sua relevância prática"
    },
    {
      "language": "Segunda linguagem/tecnologia relevante",
      "code": "Segundo exemplo prático e funcional",
      "description": "Contexto e explicação do segundo exemplo"
    }
  ],
  "faq": [
    {
      "question": "Pergunta fundamental sobre ${term}",
      "answer": "Resposta técnica detalhada e precisa"
    },
    {
      "question": "Qual a diferença entre ${term} e [tecnologia similar]?",
      "answer": "Explicação comparativa clara e técnica"
    },
    {
      "question": "Quando devo usar ${term}?",
      "answer": "Cenários e critérios para uso recomendado"
    },
    {
      "question": "Quais são as limitações de ${term}?",
      "answer": "Análise honesta de limitações e considerações"
    },
    {
      "question": "Como começar a trabalhar com ${term}?",
      "answer": "Guia prático para iniciantes com recursos e próximos passos"
    }
  ],

  "references": [
    {
      "title": "Documentação oficial ou especificação técnica",
      "url": "URL da fonte oficial",
      "description": "Descrição da relevância da referência"
    },
    {
      "title": "Artigo técnico ou paper acadêmico", 
      "url": "URL da fonte acadêmica",
      "description": "Contexto da pesquisa ou estudo"
    },
    {
      "title": "Recurso prático ou tutorial avançado",
      "url": "URL do recurso",
      "description": "Aplicação prática do recurso"
    }
  ],
  "whyLearn": "Explicação convincente sobre a importância de dominar ${term} no mercado atual (100-150 palavras)"
}

## DIRETRIZES CRÍTICAS

1. **CONTEÚDO SUBSTANTIVO**: Cada seção deve ter profundidade real, não texto de preenchimento
2. **EXPERTISE DEMONSTRADA**: Mostre conhecimento técnico profundo através de detalhes precisos
3. **VALOR EDUCACIONAL**: Cada parágrafo deve ensinar algo específico e útil
4. **ORIGINALIDADE**: Zero conteúdo genérico ou clichês - seja específico e técnico
5. **ATUALIDADE**: Informações atualizadas e relevantes para 2025

Crie conteúdo que um especialista sênior escreveria para outros profissionais da área.`;
}

// Função principal para gerar conteúdo com RAG
export async function generateContent(term) {
  const startTime = Date.now();
  
  try {
    // Validar entrada
    if (!term || typeof term !== 'string' || term.trim().length === 0) {
      throw new Error("Termo inválido fornecido");
    }
    
    const cleanTerm = term.trim().toLowerCase();
    console.log(`🎯 Iniciando geração de conteúdo para: ${cleanTerm}`);
    
    // Detectar categoria automaticamente
    const detectedCategory = detectCategory(cleanTerm);
    console.log(`📂 Categoria detectada: ${detectedCategory}`);
    
    // Gerar prompt base
    const basePrompt = generateBasePrompt(cleanTerm, detectedCategory);
    
    // Enriquecer com dados do Stack Overflow (se habilitado)
    let finalPrompt = basePrompt;
    let soData = null;
    
    if (GENERATION_CONFIG.useStackOverflowRAG) {
      try {
        console.log(`🔍 Coletando dados do Stack Overflow...`);
        soData = await gatherStackOverflowData(cleanTerm);
        
        if (soData && soData.qualityScore > 0) {
          const insights = processStackOverflowData(soData);
          finalPrompt = await enhanceContentWithStackOverflow(cleanTerm, basePrompt);
          console.log(`✅ Prompt enriquecido com dados do SO (qualidade: ${soData.qualityScore}/5)`);
        } else {
          console.log(`⚠️ Dados do SO indisponíveis, usando prompt base`);
        }
      } catch (soError) {
        console.error(`❌ Erro ao coletar dados do SO:`, soError);
        console.log(`⚠️ Continuando com prompt base devido a erro no SO`);
      }
    }
    
    // Configurar opções de requisição
    const requestOptions = {
      model: GENERATION_CONFIG.model,
      messages: [{ 
        role: "system", 
        content: "Você é um especialista técnico sênior criando conteúdo de alta qualidade para um dicionário técnico profissional. Use dados reais da comunidade quando fornecidos. Sempre retorne JSON válido."
      }, {
        role: "user", 
        content: finalPrompt 
      }],
      temperature: GENERATION_CONFIG.temperature,
      max_tokens: GENERATION_CONFIG.max_tokens,
      response_format: { type: "json_object" }
    };
    
    console.log(`🤖 Enviando requisição para IA...`);
    
    // Fazer requisição com retry
    let response;
    let lastError;
    
    for (let attempt = 1; attempt <= GENERATION_CONFIG.maxRetries; attempt++) {
      try {
        response = await Promise.race([
          openai.chat.completions.create(requestOptions),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout da requisição")), GENERATION_CONFIG.timeout)
          )
        ]);
        break; // Sucesso, sair do loop
      } catch (error) {
        lastError = error;
        console.error(`❌ Tentativa ${attempt} falhou:`, error.message);
        
        if (attempt < GENERATION_CONFIG.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    if (!response) {
      throw lastError || new Error("Falha em todas as tentativas de geração");
    }
    
    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("Resposta vazia da IA");
    }
    
    console.log(`✅ Resposta recebida da IA (${responseText.length} caracteres)`);
    
    // Processar e validar resposta
    let generatedContent = processAIResponse(responseText, cleanTerm);
    
    // Enriquecer conteúdo com dados do Stack Overflow se disponíveis
    if (soData && soData.qualityScore > 0) {
      const insights = processStackOverflowData(soData);
      generatedContent = enrichContentWithSOInsights(generatedContent, insights);
    }
    
    // Adicionar metadados
    generatedContent.generated_at = new Date().toISOString();
    generatedContent.version = "2.1";
    generatedContent.generation_time_ms = Date.now() - startTime;
    generatedContent.model_used = GENERATION_CONFIG.model;
    generatedContent.slug = cleanTerm;
    generatedContent.rag_enabled = GENERATION_CONFIG.useStackOverflowRAG;
    generatedContent.stackoverflow_data = soData ? {
      quality_score: soData.qualityScore,
      has_wiki: !!soData.data?.wiki,
      has_faq: !!soData.data?.faq?.length,
      question_count: soData.data?.tagInfo?.count || 0
    } : null;
    
    const generationTime = Date.now() - startTime;
    console.log(`🎉 Conteúdo gerado com sucesso para '${cleanTerm}' em ${generationTime}ms`);
    
    return generatedContent;
    
  } catch (error) {
    const generationTime = Date.now() - startTime;
    console.error(`❌ Erro ao gerar conteúdo para '${term}' (${generationTime}ms):`, error);
    
    // Enriquecer erro com informações úteis
    error.term = term;
    error.generationTime = generationTime;
    error.timestamp = new Date().toISOString();
    error.ragEnabled = GENERATION_CONFIG.useStackOverflowRAG;
    
    throw error;
  }
}

// Função para enriquecer conteúdo com insights do Stack Overflow
function enrichContentWithSOInsights(content, insights) {
  if (!insights) return content;
  
  try {
    // Enriquecer FAQ com perguntas reais da comunidade
    if (insights.communityFAQ?.length > 0) {
      const soFAQ = insights.communityFAQ.slice(0, 2).map(item => ({
        question: item.question,
        answer: `Esta é uma pergunta frequente na comunidade (${item.popularity} respostas). ${item.question} é um tópico ${item.difficulty} que merece atenção especial. Para uma resposta detalhada, consulte a documentação oficial ou a discussão completa no Stack Overflow.`
      }));
      
      // Adicionar FAQ da comunidade ao FAQ gerado
      content.faq = [
        ...content.faq.slice(0, 3),
        ...soFAQ,
        ...content.faq.slice(3)
      ].slice(0, 6);
    }
    
    // Adicionar contexto de popularidade ao whyLearn
    if (insights.popularity) {
      const popularityContext = insights.popularity.isMainstream 
        ? `Com mais de ${insights.popularity.questionCount.toLocaleString()} discussões no Stack Overflow, esta tecnologia é amplamente adotada pela comunidade.`
        : `Sendo uma tecnologia especializada com ${insights.popularity.questionCount.toLocaleString()} discussões específicas, oferece oportunidades únicas de especialização.`;
      
      content.whyLearn = `${popularityContext} ${content.whyLearn}`;
    }
    
    // Adicionar metadados de enriquecimento
    content.enrichment = {
      stackoverflow_insights: true,
      community_data_used: true,
      real_world_questions: insights.communityFAQ?.length || 0,
      technology_popularity: insights.popularity?.popularityRank || 'unknown'
    };
    
    console.log(`🔄 Conteúdo enriquecido com insights do Stack Overflow`);
    
  } catch (enrichError) {
    console.error(`❌ Erro ao enriquecer conteúdo com insights do SO:`, enrichError);
    // Retornar conteúdo original se enriquecimento falhar
  }
  
  return content;
}

// Função para processar e limpar resposta da IA
function processAIResponse(responseText, term) {
  // Tentar extrair JSON da resposta
  let jsonContent = responseText.trim();
  
  // Remover marcadores de código se existirem
  jsonContent = jsonContent.replace(/```json\s*|\s*```/g, '');
  
  // Tentar encontrar JSON válido
  const jsonStart = jsonContent.indexOf('{');
  const jsonEnd = jsonContent.lastIndexOf('}');
  
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Resposta não contém JSON válido");
  }
  
  jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
  
  let parsedContent;
  try {
    parsedContent = JSON.parse(jsonContent);
  } catch (parseError) {
    console.error("❌ Erro ao parsear JSON da IA:", parseError);
    console.error("❌ Conteúdo recebido:", jsonContent.substring(0, 500));
    throw new Error("Resposta da IA não é um JSON válido");
  }
  
  // Validar conteúdo
  const validationErrors = validateGeneratedContent(parsedContent, term);
  if (validationErrors.length > 0) {
    console.error("❌ Erros de validação:", validationErrors);
    throw new Error(`Conteúdo gerado inválido: ${validationErrors.join(", ")}`);
  }
  
  return parsedContent;
}

// Função para validar conteúdo gerado
function validateGeneratedContent(content, term) {
  const errors = [];
  
  // Validações básicas de estrutura
  if (!content.title) errors.push("Título ausente");
  if (!content.metaDescription) errors.push("Meta descrição ausente");
  if (!content.category) errors.push("Categoria ausente");
  if (!content.content) errors.push("Conteúdo principal ausente");
  
  // Validações de qualidade do conteúdo
  if (content.content) {
    const sections = Object.keys(content.content);
    if (sections.length < 5) {
      errors.push("Muito poucas seções de conteúdo");
    }
    
    // Verificar se cada seção tem conteúdo substancial
    for (const [key, section] of Object.entries(content.content)) {
      if (!section.content || section.content.length < 200) {
        errors.push(`Seção '${key}' muito curta ou vazia`);
      }
    }
  }
  
  // Validações de exemplos de código
  if (!content.codeExamples || content.codeExamples.length < 1) {
    errors.push("Exemplos de código ausentes");
  } else {
    content.codeExamples.forEach((example, idx) => {
      if (!example.code || example.code.length < 50) {
        errors.push(`Exemplo de código ${idx + 1} muito curto`);
      }
      if (!example.language) {
        errors.push(`Linguagem não especificada no exemplo ${idx + 1}`);
      }
    });
  }
  
  // Validações de FAQ
  if (!content.faq || content.faq.length < 3) {
    errors.push("FAQ insuficiente (mínimo 3 perguntas)");
  }
  
  return errors;
}

// Função auxiliar para regenerar conteúdo existente com RAG
export async function regenerateContent(term, existingData = {}) {
  console.log(`🔄 Regenerando conteúdo para: ${term}`);
  
  try {
    const newContent = await generateContent(term);
    
    // Preservar alguns dados do conteúdo anterior se existirem
    const mergedContent = {
      ...newContent,
      previous_version: existingData.version || "1.0",
      regenerated_at: new Date().toISOString(),
      regeneration_reason: "Content quality improvement with RAG",
      access_count: existingData.access_count || 0,
      previous_stackoverflow_data: existingData.stackoverflow_data || null
    };
    
    return mergedContent;
  } catch (error) {
    console.error(`❌ Erro ao regenerar conteúdo para '${term}':`, error);
    throw error;
  }
}

// Função para avaliar qualidade do conteúdo com considerações de RAG
export function assessContentQuality(content) {
  const scores = {
    completeness: 0,
    depth: 0,
    structure: 0,
    examples: 0,
    communityData: 0, // Nova métrica para dados da comunidade
    overall: 0
  };
  
  // Avaliar completude (0-20 pontos)
  const requiredFields = ['title', 'content', 'codeExamples', 'faq'];
  scores.completeness = (requiredFields.filter(field => content[field]).length / requiredFields.length) * 20;
  
  // Avaliar profundidade (0-20 pontos)
  if (content.content) {
    const totalContentLength = Object.values(content.content)
      .reduce((sum, section) => sum + (section.content?.length || 0), 0);
    scores.depth = Math.min((totalContentLength / 2000) * 20, 20);
  }
  
  // Avaliar estrutura (0-20 pontos)
  if (content.content) {
    const sectionsCount = Object.keys(content.content).length;
    scores.structure = Math.min((sectionsCount / 7) * 20, 20);
  }
  
  // Avaliar exemplos (0-20 pontos)
  if (content.codeExamples?.length) {
    const avgExampleLength = content.codeExamples.reduce((sum, ex) => sum + ex.code.length, 0) / content.codeExamples.length;
    scores.examples = Math.min((avgExampleLength / 200) * 20, 20);
  }
  
  // Avaliar dados da comunidade (0-20 pontos) - Nova métrica
  if (content.stackoverflow_data) {
    let communityScore = 0;
    if (content.stackoverflow_data.has_wiki) communityScore += 5;
    if (content.stackoverflow_data.has_faq) communityScore += 5;
    if (content.stackoverflow_data.related_tags_count > 5) communityScore += 5;
    if (content.stackoverflow_data.question_count > 1000) communityScore += 5;
    scores.communityData = communityScore;
  }
  
  // Calcular pontuação geral
  scores.overall = Math.round((scores.completeness + scores.depth + scores.structure + scores.examples + scores.communityData) / 5);
  
  return scores;
}

// Função para obter estatísticas de uso do RAG
export function getRAGStatistics() {
  const stats = {
    cacheSize: soDataCache.size,
    ragEnabled: GENERATION_CONFIG.useStackOverflowRAG,
    cacheClearTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
    configuration: {
      model: GENERATION_CONFIG.model,
      temperature: GENERATION_CONFIG.temperature,
      maxTokens: GENERATION_CONFIG.max_tokens,
      timeout: GENERATION_CONFIG.timeout
    }
  };
  
  return stats;
}

// Função para limpar cache (utilitário)
export function clearRAGCache() {
  promptCache.clear();
  soDataCache.clear();
  console.log("🧹 Cache do RAG limpo");
}