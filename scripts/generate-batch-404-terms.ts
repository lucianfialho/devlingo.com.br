/**
 * Gera conteúdo para os termos 404 usando a Batch API da Maritaca
 * Economia de 50% nos custos: R$ 0,04 por termo ao invés de R$ 0,08
 */

import { db } from '../src/lib/db/client.js';
import { terms } from '../src/lib/db/schema.js';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import * as fs from 'fs';

// Cliente OpenAI configurado para Maritaca
const client = new OpenAI({
  apiKey: process.env.MARITACA_API_KEY,
  baseURL: 'https://chat.maritaca.ai/api',
});

// Termos NÃO-TECH que devem ser descartados
const nonTechTerms = new Set([
  'physics',
  'angle-to-euclidean-space',
  'pvclust',
  'bioinformatics',
  'home',
  'probability',
  'methodology',
  'evaluation',
  'anova',
  'correlation',
]);

async function generateBatch404Terms() {
  console.log('🚀 Gerando conteúdo para termos 404 usando Batch API da Maritaca...\n');

  // Ler CSV
  const csv = fs.readFileSync('Tabela.csv', 'utf-8');
  const lines = csv.split('\n').slice(1); // Skip header

  console.log(`📊 Total de linhas no CSV: ${lines.length}\n`);

  // Extrair slugs
  const allUrls = lines
    .map(line => {
      const match = line.match(/https:\/\/www\.devlingo\.com\.br\/([^\/]+)\/([^,]+)/);
      if (!match) return null;

      const [, path, slug] = match;
      return { path, slug: slug.trim() };
    })
    .filter(Boolean) as Array<{ path: string; slug: string }>;

  console.log(`✅ URLs extraídas: ${allUrls.length}\n`);

  // Filtrar apenas /termos que são tech
  const termosOnly = allUrls
    .filter(({ path, slug }) => {
      if (path !== 'termos') return false;
      if (nonTechTerms.has(slug)) return false;
      if (slug.startsWith('-') || slug.length < 2) return false;
      return true;
    })
    .map(({ slug }) => slug);

  console.log(`✅ Termos tech (/termos): ${termosOnly.length}\n`);

  // Verificar quais já existem no banco
  console.log('🔍 Verificando quais termos já existem no banco...\n');
  const slugsToGenerate: string[] = [];

  for (const slug of termosOnly) {
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

  // Com Batch API (50% desconto):
  // Budget: R$ 9,30
  // Custo por termo: R$ 0,04 (ao invés de R$ 0,08)
  // Máximo de termos: 232 (ao invés de 116)
  const budget = 9.30;
  const costPerTermWithBatch = 0.04; // 50% de desconto
  const maxTerms = Math.floor(budget / costPerTermWithBatch);

  const termsToGenerate = slugsToGenerate.slice(0, Math.min(maxTerms, slugsToGenerate.length));

  console.log('='.repeat(80));
  console.log('🎯 GERANDO TERMOS 404 COM BATCH API (50% DESCONTO)');
  console.log('='.repeat(80));
  console.log(`💰 Budget disponível: R$ ${budget.toFixed(2)}`);
  console.log(`📊 Custo por termo (Batch API): R$ ${costPerTermWithBatch.toFixed(2)}`);
  console.log(`📊 Custo por termo (API normal): R$ 0.08`);
  console.log(`💸 Economia: 50% (R$ 0.04 por termo)`);
  console.log(`🎯 Máximo de termos possível: ${maxTerms}`);
  console.log(`✅ Termos selecionados: ${termsToGenerate.length}`);
  console.log(`💵 Custo estimado: R$ ${(termsToGenerate.length * costPerTermWithBatch).toFixed(2)}`);
  console.log(`💰 Economia total: R$ ${(termsToGenerate.length * 0.04).toFixed(2)}`);
  console.log(`⏱️  Processamento: até 24 horas (assíncrono)`);
  console.log('='.repeat(80));
  console.log();

  // Criar arquivo JSONL para o batch
  const batchRequests = termsToGenerate.map((slug, index) => ({
    custom_id: `term-${index}-${slug}`,
    method: 'POST',
    url: '/v1/chat/completions',
    body: {
      model: 'sabiazinho-3',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em tecnologia e programação que escreve definições técnicas claras e precisas em português brasileiro para um dicionário técnico.'
        },
        {
          role: 'user',
          content: `Crie uma definição técnica completa e detalhada em português brasileiro para o termo "${slug}" no formato JSON:

{
  "name": "${slug}",
  "category": "technical",
  "shortDefinition": "Definição curta e precisa (1-2 frases, máx 200 caracteres)",
  "detailedExplanation": "Explicação técnica detalhada (3-5 parágrafos), incluindo: o que é, como funciona, principais características, casos de uso. Use linguagem técnica mas acessível.",
  "codeExamples": [
    {
      "language": "javascript",
      "code": "// Exemplo prático de uso",
      "explanation": "Explicação do exemplo"
    }
  ],
  "relatedTerms": ["termo1", "termo2", "termo3"],
  "useCases": ["Caso de uso 1", "Caso de uso 2", "Caso de uso 3"],
  "commonMistakes": ["Erro comum 1", "Erro comum 2"],
  "bestPractices": ["Boa prática 1", "Boa prática 2"]
}

IMPORTANTE:
- Retorne APENAS o JSON, sem texto adicional
- Use português brasileiro técnico mas claro
- Seja preciso e objetivo
- Inclua exemplos práticos de código quando aplicável`
        }
      ],
      max_tokens: 2000
    }
  }));

  // Salvar arquivo JSONL
  const jsonlContent = batchRequests.map(req => JSON.stringify(req)).join('\n');
  const batchFileName = 'batch-404-terms.jsonl';
  fs.writeFileSync(batchFileName, jsonlContent, 'utf-8');

  console.log(`✅ Arquivo batch criado: ${batchFileName}`);
  console.log(`📋 Total de requisições: ${batchRequests.length}\n`);

  // Upload do arquivo
  console.log('📤 Fazendo upload do arquivo batch...');
  const batchInputFile = await client.files.create({
    file: fs.createReadStream(batchFileName),
    purpose: 'batch'
  });

  console.log(`✅ Arquivo enviado: ${batchInputFile.id}\n`);

  // Criar o batch
  console.log('🚀 Criando batch para processamento...');
  const batch = await client.batches.create({
    input_file_id: batchInputFile.id,
    endpoint: '/v1/chat/completions',
    completion_window: '24h',
    metadata: {
      description: 'Geração de termos 404 do DevLingo',
      total_terms: termsToGenerate.length.toString(),
      budget: budget.toString()
    }
  });

  console.log('✅ Batch criado com sucesso!\n');
  console.log('='.repeat(80));
  console.log('📊 INFORMAÇÕES DO BATCH');
  console.log('='.repeat(80));
  console.log(`🆔 Batch ID: ${batch.id}`);
  console.log(`📄 Input File ID: ${batch.input_file_id}`);
  console.log(`📊 Status: ${batch.status}`);
  console.log(`📅 Criado em: ${new Date(batch.created_at * 1000).toLocaleString('pt-BR')}`);
  console.log(`⏰ Expira em: ${new Date(batch.expires_at * 1000).toLocaleString('pt-BR')}`);
  console.log('='.repeat(80));
  console.log();

  // Salvar informações do batch
  const batchInfo = {
    batch_id: batch.id,
    input_file_id: batch.input_file_id,
    created_at: batch.created_at,
    expires_at: batch.expires_at,
    terms: termsToGenerate,
    total_terms: termsToGenerate.length,
    estimated_cost: termsToGenerate.length * costPerTermWithBatch,
    budget: budget
  };

  fs.writeFileSync(
    'batch-404-info.json',
    JSON.stringify(batchInfo, null, 2),
    'utf-8'
  );

  console.log('✅ Informações salvas em: batch-404-info.json\n');

  console.log('📋 PRÓXIMOS PASSOS:\n');
  console.log('1. Aguardar processamento (até 24h)');
  console.log('2. Verificar status do batch:');
  console.log(`   npm run batch:check -- ${batch.id}`);
  console.log('3. Baixar resultados quando completar:');
  console.log(`   npm run batch:download -- ${batch.id}`);
  console.log('4. Processar resultados e salvar no banco:');
  console.log(`   npm run batch:process -- ${batch.id}`);

  console.log('\n💡 Você pode continuar trabalhando enquanto o batch é processado!');
  console.log('💡 O processamento acontece de forma assíncrona nos servidores da Maritaca.\n');

  process.exit(0);
}

generateBatch404Terms().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
