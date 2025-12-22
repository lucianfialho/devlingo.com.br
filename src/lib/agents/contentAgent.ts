/**
 * Content Generator Agent usando OpenAI Agents SDK
 *
 * Agente especializado com ferramentas para:
 * - Buscar dados do Stack Overflow
 * - Acessar documentação oficial (Context7-like)
 * - Gerar conteúdo estruturado e de alta qualidade
 */

import { Agent, run } from '@openai/agents';
import { z } from 'zod';
import OpenAI from 'openai';

// Schema para validação do conteúdo gerado
const TermContentSchema = z.object({
  title: z.string().min(10).max(60),
  metaDescription: z.string().min(100).max(160),
  category: z.enum([
    'internet',
    'hardware',
    'software',
    'technical',
    'acronyms',
    'bits_and_bytes',
    'file_formats',
  ]),
  content: z.object({
    introduction: z.object({
      heading: z.string(),
      content: z.string().min(300),
    }),
    fundamentals: z.object({
      heading: z.string(),
      content: z.string().min(400),
    }),
    implementation: z.object({
      heading: z.string(),
      content: z.string().min(350),
    }),
    useCases: z.object({
      heading: z.string(),
      content: z.string().min(300),
    }),
    comparison: z.object({
      heading: z.string(),
      content: z.string().min(250),
    }),
    bestPractices: z.object({
      heading: z.string(),
      content: z.string().min(200),
    }),
    future: z.object({
      heading: z.string(),
      content: z.string().min(200),
    }),
  }),
  codeExamples: z.array(
    z.object({
      language: z.string(),
      code: z.string().min(50),
      description: z.string(),
    })
  ).min(2),
  faq: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ).min(5),
  references: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      description: z.string(),
    })
  ).min(3),
  whyLearn: z.string().min(100).max(200),
});

type TermContent = z.infer<typeof TermContentSchema>;

// Ferramenta: Buscar dados do Stack Overflow
const stackOverflowTool = {
  name: 'fetch_stackoverflow_data',
  description: 'Fetches tag information, related tags, and top questions from Stack Overflow for a given technical term',
  parameters: z.object({
    tag: z.string().describe('The technical term/tag to search for (e.g., "javascript", "python")'),
  }),
  execute: async ({ tag }: { tag: string }) => {
    try {
      // Buscar informações da tag
      const tagInfoResponse = await fetch(
        `https://api.stackexchange.com/2.3/tags/${tag}/info?site=stackoverflow`
      );
      const tagInfoData = await tagInfoResponse.json();

      // Buscar tags relacionadas
      const relatedResponse = await fetch(
        `https://api.stackexchange.com/2.3/tags/${tag}/related?site=stackoverflow`
      );
      const relatedData = await relatedResponse.json();

      // Buscar top questions
      const questionsResponse = await fetch(
        `https://api.stackexchange.com/2.3/search?order=desc&sort=votes&tagged=${tag}&site=stackoverflow&pagesize=5`
      );
      const questionsData = await questionsResponse.json();

      return {
        tagInfo: tagInfoData.items?.[0] || null,
        relatedTags: relatedData.items?.slice(0, 10).map((t: any) => t.name) || [],
        topQuestions: questionsData.items?.map((q: any) => ({
          title: q.title,
          score: q.score,
          link: q.link,
        })) || [],
      };
    } catch (error: any) {
      console.error('Error fetching Stack Overflow data:', error);
      return { error: error.message };
    }
  },
};

// Ferramenta: Buscar documentação oficial
const documentationTool = {
  name: 'fetch_official_docs',
  description: 'Searches for official documentation and authoritative resources for a technical term',
  parameters: z.object({
    term: z.string().describe('The technical term to search documentation for'),
    source: z.enum(['mdn', 'github', 'npm', 'pypi', 'general']).describe('The documentation source to search'),
  }),
  execute: async ({ term, source }: { term: string; source: string }) => {
    try {
      let searchUrl = '';

      switch (source) {
        case 'mdn':
          searchUrl = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(term)}`;
          break;
        case 'github':
          searchUrl = `https://github.com/search?q=${encodeURIComponent(term)}&type=repositories`;
          break;
        case 'npm':
          searchUrl = `https://registry.npmjs.org/${encodeURIComponent(term)}`;
          break;
        case 'pypi':
          searchUrl = `https://pypi.org/pypi/${encodeURIComponent(term)}/json`;
          break;
        default:
          searchUrl = `https://www.google.com/search?q=${encodeURIComponent(term + ' official documentation')}`;
      }

      return {
        searchUrl,
        source,
        recommendation: `Check ${searchUrl} for official documentation`,
      };
    } catch (error: any) {
      console.error('Error fetching documentation:', error);
      return { error: error.message };
    }
  },
};

// Configurar cliente OpenAI (usando Maritaca)
const openai = new OpenAI({
  apiKey: process.env.MARITACA_API_KEY,
  baseURL: 'https://chat.maritaca.ai/api',
});

/**
 * Cria o agente de geração de conteúdo
 */
export function createContentAgent() {
  return new Agent({
    name: 'DevLingoContentGenerator',
    model: 'sabiazinho-3',
    instructions: `Você é um especialista técnico sênior com mais de 15 anos de experiência em tecnologia.

Sua missão é criar artigos técnicos EXCEPCIONAIS para um dicionário de referência profissional.

## DIRETRIZES DE QUALIDADE:

1. **PROFUNDIDADE TÉCNICA**
   - Artigos com MÍNIMO 2000 palavras
   - Explicações técnicas precisas e aprofundadas
   - Demonstração clara de expertise

2. **ESTRUTURA EDUCACIONAL**
   - Progressão do básico ao avançado
   - Múltiplas perspectivas
   - Casos de uso reais

3. **VALOR PRÁTICO**
   - Relevância para profissionais
   - Aplicações no mundo real
   - Tendências e perspectivas

4. **ORIGINALIDADE**
   - Conteúdo 100% original
   - Insights baseados em experiência
   - Linguagem clara mas tecnicamente precisa

## FERRAMENTAS DISPONÍVEIS:

Use as ferramentas para enriquecer o conteúdo:
- fetch_stackoverflow_data: Para obter dados reais da comunidade
- fetch_official_docs: Para referenciar documentação oficial

## FORMATO DE SAÍDA:

SEMPRE retorne um JSON válido seguindo esta estrutura EXATA:

{
  "title": "Título SEO-friendly (max 60 chars)",
  "metaDescription": "Meta descrição persuasiva (150-160 chars)",
  "category": "technical",
  "content": {
    "introduction": { "heading": "...", "content": "..." },
    "fundamentals": { "heading": "...", "content": "..." },
    "implementation": { "heading": "...", "content": "..." },
    "useCases": { "heading": "...", "content": "..." },
    "comparison": { "heading": "...", "content": "..." },
    "bestPractices": { "heading": "...", "content": "..." },
    "future": { "heading": "...", "content": "..." }
  },
  "codeExamples": [
    {
      "language": "JavaScript",
      "code": "// Código funcional aqui",
      "description": "Explicação do exemplo"
    }
  ],
  "faq": [
    {
      "question": "Pergunta relevante?",
      "answer": "Resposta detalhada"
    }
  ],
  "references": [
    {
      "title": "Nome do recurso",
      "url": "https://exemplo.com",
      "description": "Por que é relevante"
    }
  ],
  "whyLearn": "Por que aprender isso é importante (100-200 chars)"
}

IMPORTANTE: Retorne APENAS o JSON, sem markdown ou texto adicional.`,
    tools: [stackOverflowTool, documentationTool],
  });
}

/**
 * Gera conteúdo para um termo usando o agente
 */
export async function generateContentWithAgent(term: string): Promise<TermContent> {
  console.log(`🤖 Gerando conteúdo com Agent para: ${term}`);

  const agent = createContentAgent();

  const prompt = `Crie um artigo técnico completo e detalhado sobre "${term}".

IMPORTANTE:
1. Use a ferramenta fetch_stackoverflow_data para obter dados reais da comunidade
2. Use fetch_official_docs para encontrar documentação oficial
3. Retorne APENAS o JSON válido, sem markdown ou explicações

Comece agora!`;

  try {
    const result = await run(agent, prompt, {
      maxTurns: 5, // Permite até 5 interações com ferramentas
    });

    console.log(`✅ Conteúdo gerado para: ${term}`);

    // Parse e validação do JSON
    const content = JSON.parse(result.finalOutput);

    // Validar com Zod
    const validated = TermContentSchema.parse(content);

    return validated;

  } catch (error: any) {
    console.error(`❌ Erro ao gerar conteúdo para '${term}':`, error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

/**
 * Exemplo de uso com múltiplos termos em paralelo
 */
export async function generateMultipleTerms(terms: string[], concurrency = 3) {
  const results = [];
  const queue = [...terms];

  const workers = Array(concurrency).fill(null).map(async () => {
    while (queue.length > 0) {
      const term = queue.shift();
      if (!term) break;

      try {
        const content = await generateContentWithAgent(term);
        results.push({ term, status: 'success', content });
      } catch (error: any) {
        results.push({ term, status: 'error', error: error.message });
      }

      // Delay entre requisições
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  });

  await Promise.all(workers);
  return results;
}
