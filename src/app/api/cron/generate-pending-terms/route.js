import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { terms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const maxDuration = 300; // 5 minutos

/**
 * Vercel Cron Job - Gera termos pending via Batch API
 * Roda às 22h (horário Brasil) = 01:00 UTC
 *
 * GET /api/cron/generate-pending-terms
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request) {
  try {
    // Verificar autenticação do cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Iniciando job de geração de termos pending...');

    // Buscar termos com status "pending"
    const pendingTerms = await db
      .select()
      .from(terms)
      .where(eq(terms.status, 'pending'))
      .limit(250); // Máximo por batch

    if (pendingTerms.length === 0) {
      console.log('✅ Nenhum termo pending para gerar');
      return NextResponse.json({
        success: true,
        message: 'Nenhum termo pending para gerar',
        count: 0
      });
    }

    console.log(`📝 Encontrados ${pendingTerms.length} termos pending`);

    // Preparar para Batch API
    const slugsToGenerate = pendingTerms.map(t => t.slug);

    // Marcar termos como "generating"
    for (const slug of slugsToGenerate) {
      await db
        .update(terms)
        .set({
          status: 'generating',
          updatedAt: new Date()
        })
        .where(eq(terms.slug, slug));
    }

    // Criar batch job na Maritaca com PROMPT PREMIUM
    const batchJobId = await createMaritacaBatchJobPremium(slugsToGenerate);

    console.log(`✅ Batch job criado: ${batchJobId}`);
    console.log(`📊 ${slugsToGenerate.length} termos marcados como "generating"`);

    return NextResponse.json({
      success: true,
      message: 'Batch job criado com sucesso',
      batchJobId,
      count: slugsToGenerate.length,
      slugs: slugsToGenerate.slice(0, 10), // Primeiros 10 para log
      totalPending: pendingTerms.length
    });

  } catch (error) {
    console.error('❌ Erro no cron job:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Busca dados do Stack Overflow para enriquecer o conteúdo (RAG)
 */
async function fetchStackOverflowData(term) {
  try {
    const tag = term.toLowerCase().replace(/\s+/g, '-');
    const API_BASE = 'https://api.stackexchange.com/2.3';
    const SITE = 'stackoverflow';

    // Buscar informações do tag, tags relacionadas e top perguntas
    const [tagInfoRes, relatedRes, questionsRes] = await Promise.all([
      fetch(`${API_BASE}/tags/${tag}/info?site=${SITE}`),
      fetch(`${API_BASE}/tags/${tag}/related?site=${SITE}`),
      fetch(`${API_BASE}/search?tagged=${tag}&sort=votes&site=${SITE}&pagesize=5`)
    ]);

    const tagInfo = await tagInfoRes.json();
    const related = await relatedRes.json();
    const questions = await questionsRes.json();

    return {
      popularity: tagInfo.items?.[0]?.count || 0,
      relatedTags: related.items?.slice(0, 5).map(t => t.name) || [],
      topQuestions: questions.items?.map(q => ({
        title: q.title,
        score: q.score,
        link: q.link
      })) || []
    };
  } catch (error) {
    console.warn(`⚠️ Erro ao buscar Stack Overflow para "${term}":`, error.message);
    return {
      popularity: 0,
      relatedTags: [],
      topQuestions: []
    };
  }
}

/**
 * Cria batch job na Maritaca AI com PROMPT PREMIUM + RAG
 */
async function createMaritacaBatchJobPremium(slugs) {
  const { default: OpenAI } = await import('openai');

  const client = new OpenAI({
    apiKey: process.env.MARITACA_API_KEY,
    baseURL: 'https://chat.maritaca.ai/api'
  });

  console.log('🔍 Buscando dados do Stack Overflow para enriquecer conteúdo...');

  // PRÉ-PROCESSAMENTO RAG: Buscar dados reais antes de criar o batch
  const enrichedTerms = await Promise.all(
    slugs.map(async (slug) => {
      const term = slug.replace(/-/g, ' ');
      const stackData = await fetchStackOverflowData(term);

      return {
        slug,
        term,
        stackOverflow: stackData
      };
    })
  );

  console.log(`✅ Dados do Stack Overflow coletados para ${enrichedTerms.length} termos`);

  // Preparar requests JSONL com PROMPT PREMIUM + DADOS REAIS
  const batchRequests = enrichedTerms.map((data, index) => ({
    custom_id: `term-${index}-${data.slug}`,
    method: 'POST',
    url: '/v1/chat/completions',
    body: {
      model: 'sabiazinho-3',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista técnico sênior com mais de 15 anos de experiência em tecnologia.

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

5. **USO DE DADOS REAIS**
   - Priorize as dúvidas mais comuns da comunidade
   - Base FAQs nas perguntas reais fornecidas
   - Mencione popularidade quando relevante

IMPORTANTE: Retorne APENAS o JSON válido, sem markdown ou texto adicional.`
        },
        {
          role: 'user',
          content: `Crie um artigo técnico completo e detalhado sobre "${data.term}".

${data.stackOverflow.popularity > 0 ? `
📊 DADOS REAIS DA COMUNIDADE STACK OVERFLOW:
- Popularidade: ${data.stackOverflow.popularity.toLocaleString('pt-BR')} perguntas
- Tags relacionadas: ${data.stackOverflow.relatedTags.join(', ') || 'N/A'}

🔥 TOP 5 DÚVIDAS MAIS VOTADAS (use como base para FAQs):
${data.stackOverflow.topQuestions.map((q, i) => `${i + 1}. "${q.title}" (${q.score} votos)`).join('\n')}

INSTRUÇÕES ESPECIAIS:
- Use essas perguntas reais para criar FAQs relevantes
- Priorize problemas que a comunidade realmente enfrenta
- Mencione a popularidade do termo quando apropriado
` : ''}

Retorne um JSON válido seguindo esta estrutura EXATA:

{
  "title": "Título SEO-friendly (max 60 chars)",
  "metaDescription": "Meta descrição persuasiva (150-160 chars)",
  "category": "technical",
  "content": {
    "introduction": {
      "heading": "Introdução",
      "content": "Parágrafo introdutório completo (mín 300 palavras)"
    },
    "fundamentals": {
      "heading": "Fundamentos",
      "content": "Explicação dos conceitos básicos (mín 400 palavras)"
    },
    "implementation": {
      "heading": "Implementação",
      "content": "Como usar na prática (mín 350 palavras)"
    },
    "useCases": {
      "heading": "Casos de Uso",
      "content": "Aplicações reais (mín 300 palavras)"
    },
    "comparison": {
      "heading": "Comparações",
      "content": "Comparação com alternativas (mín 250 palavras)"
    },
    "bestPractices": {
      "heading": "Boas Práticas",
      "content": "Recomendações de uso (mín 200 palavras)"
    },
    "future": {
      "heading": "Futuro e Tendências",
      "content": "Perspectivas futuras (mín 200 palavras)"
    }
  },
  "codeExamples": [
    {
      "language": "JavaScript",
      "code": "// Exemplo funcional completo (mín 50 chars)",
      "description": "Explicação detalhada do exemplo"
    },
    {
      "language": "Python",
      "code": "# Segundo exemplo em outra linguagem",
      "description": "Contexto de uso"
    }
  ],
  "faq": [
    {
      "question": "Pergunta técnica relevante 1?",
      "answer": "Resposta detalhada e precisa"
    },
    {
      "question": "Pergunta técnica relevante 2?",
      "answer": "Resposta detalhada e precisa"
    },
    {
      "question": "Pergunta técnica relevante 3?",
      "answer": "Resposta detalhada e precisa"
    },
    {
      "question": "Pergunta técnica relevante 4?",
      "answer": "Resposta detalhada e precisa"
    },
    {
      "question": "Pergunta técnica relevante 5?",
      "answer": "Resposta detalhada e precisa"
    }
  ],
  "references": [
    {
      "title": "Documentação Oficial",
      "url": "https://example.com/docs",
      "description": "Por que é importante"
    },
    {
      "title": "GitHub Repository",
      "url": "https://github.com/example",
      "description": "Código-fonte oficial"
    },
    {
      "title": "Tutorial Avançado",
      "url": "https://example.com/tutorial",
      "description": "Guia prático"
    }
  ],
  "whyLearn": "Explicação convincente de por que aprender isso é importante (100-200 chars)"
}

IMPORTANTE:
- Retorne APENAS o JSON, sem texto adicional
- Use português brasileiro técnico mas claro
- Seja preciso e objetivo
- Inclua exemplos práticos de código quando aplicável
- MÍNIMO 2000 palavras no total`
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    }
  }));

  // Criar arquivo JSONL
  const fs = await import('fs');
  const path = await import('path');
  const batchFileName = `/tmp/batch-cron-${Date.now()}.jsonl`;

  const jsonlContent = batchRequests
    .map(req => JSON.stringify(req))
    .join('\n');

  fs.writeFileSync(batchFileName, jsonlContent);

  // Upload file
  const batchInputFile = await client.files.create({
    file: fs.createReadStream(batchFileName),
    purpose: 'batch'
  });

  // Create batch
  const batch = await client.batches.create({
    input_file_id: batchInputFile.id,
    endpoint: '/v1/chat/completions',
    completion_window: '24h',
    metadata: {
      description: 'Geração automática de termos 404 - DevLingo',
      source: 'cron-job',
      total_terms: slugs.length.toString()
    }
  });

  // Limpar arquivo temporário
  fs.unlinkSync(batchFileName);

  return batch.id;
}
