import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { terms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const maxDuration = 300; // 5 minutos

/**
 * Vercel Cron Job - Processa resultados de batches completados
 * Roda a cada 2 horas para verificar se batches terminaram
 *
 * GET /api/cron/process-batch-results
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

    console.log('🔄 Verificando status de batches...');

    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({
      apiKey: process.env.MARITACA_API_KEY,
      baseURL: 'https://chat.maritaca.ai/api'
    });

    // Listar batches ativos
    const batches = await client.batches.list({ limit: 20 });
    const completedBatches = batches.data.filter(b => b.status === 'completed');

    if (completedBatches.length === 0) {
      console.log('✅ Nenhum batch completado para processar');
      return NextResponse.json({
        success: true,
        message: 'Nenhum batch completado',
        activeBatches: batches.data.filter(b => ['validating', 'in_progress'].includes(b.status)).length
      });
    }

    console.log(`📦 Encontrados ${completedBatches.length} batches completados`);

    let processedTerms = 0;
    let failedTerms = 0;

    for (const batch of completedBatches) {
      try {
        // Download resultados
        const fs = await import('fs');
        const path = await import('path');

        const outputFile = await client.files.content(batch.output_file_id);
        const tempFileName = `/tmp/batch-results-${batch.id}.jsonl`;

        fs.writeFileSync(tempFileName, outputFile);

        // Processar cada linha do JSONL
        const lines = fs.readFileSync(tempFileName, 'utf-8').split('\n').filter(Boolean);

        for (const line of lines) {
          const result = JSON.parse(line);

          if (result.error) {
            console.error(`❌ Erro no termo ${result.custom_id}:`, result.error);
            failedTerms++;

            // Extrair slug do custom_id (formato: "term-{index}-{slug}")
            const slug = result.custom_id.split('-').slice(2).join('-');

            // Marcar termo como failed
            await db
              .update(terms)
              .set({
                status: 'failed',
                updatedAt: new Date()
              })
              .where(eq(terms.slug, slug));

            continue;
          }

          try {
            // Extrair conteúdo gerado
            const content = result.response.body.choices[0].message.content;

            // Tentar parsear JSON da resposta
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              console.error(`❌ Resposta não contém JSON válido para ${result.custom_id}`);
              failedTerms++;
              continue;
            }

            const termData = JSON.parse(jsonMatch[0]);

            // Extrair slug do custom_id
            const slug = result.custom_id.split('-').slice(2).join('-');

            // Preparar dados para salvar
            const termToUpdate = {
              title: termData.name || slug.replace(/-/g, ' '),
              content: {
                shortDefinition: termData.shortDefinition,
                detailedExplanation: termData.detailedExplanation,
                codeExamples: termData.codeExamples || [],
                useCases: termData.useCases || [],
                commonMistakes: termData.commonMistakes || [],
                bestPractices: termData.bestPractices || []
              },
              category: termData.category || 'technical',
              relatedTerms: (termData.relatedTerms || []).map(rt => rt.slug || rt.name),
              status: 'published',
              modelUsed: 'sabiazinho-3',
              generationTimeMs: null,
              updatedAt: new Date(),
              publishedAt: new Date(),
              generatedAt: new Date()
            };

            // Atualizar termo no banco
            await db
              .update(terms)
              .set(termToUpdate)
              .where(eq(terms.slug, slug));

            console.log(`✅ Termo publicado: ${slug}`);
            processedTerms++;

          } catch (parseError) {
            console.error(`❌ Erro ao processar resultado ${result.custom_id}:`, parseError);
            failedTerms++;
          }
        }

        // Limpar arquivo temporário
        fs.unlinkSync(tempFileName);

      } catch (batchError) {
        console.error(`❌ Erro ao processar batch ${batch.id}:`, batchError);
      }
    }

    console.log(`✅ Processamento concluído: ${processedTerms} sucessos, ${failedTerms} falhas`);

    return NextResponse.json({
      success: true,
      message: 'Batches processados com sucesso',
      batchesProcessed: completedBatches.length,
      termsPublished: processedTerms,
      termsFailed: failedTerms
    });

  } catch (error) {
    console.error('❌ Erro no cron job:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
