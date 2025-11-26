/**
 * Baixa os resultados de um batch completado
 */

import OpenAI from 'openai';
import * as fs from 'fs';

const client = new OpenAI({
  apiKey: process.env.MARITACA_API_KEY,
  baseURL: 'https://chat.maritaca.ai/api',
});

async function downloadBatchResults() {
  const batchId = process.argv[2];

  if (!batchId) {
    console.error('❌ Erro: Batch ID não fornecido');
    console.log('Uso: npm run batch:download -- <batch_id>');
    process.exit(1);
  }

  console.log(`📥 Baixando resultados do batch: ${batchId}\n`);

  try {
    // Verificar status do batch
    const batch = await client.batches.retrieve(batchId);

    console.log(`📊 Status do batch: ${batch.status}`);

    if (batch.status !== 'completed') {
      console.log(`\n⚠️  Batch ainda não foi completado (status: ${batch.status})`);
      console.log('💡 Aguarde o processamento ser concluído antes de baixar os resultados.');
      console.log('💡 Use "npm run batch:check -- ' + batchId + '" para verificar o status.');
      process.exit(1);
    }

    if (!batch.output_file_id) {
      console.error('❌ Erro: Nenhum arquivo de saída disponível');
      process.exit(1);
    }

    console.log(`📤 Arquivo de saída: ${batch.output_file_id}\n`);

    // Baixar arquivo de resultados
    console.log('📥 Baixando arquivo de resultados...');
    const fileResponse = await client.files.content(batch.output_file_id);
    const resultsContent = await fileResponse.text();

    const resultsFileName = `batch-${batchId}-results.jsonl`;
    fs.writeFileSync(resultsFileName, resultsContent, 'utf-8');

    console.log(`✅ Resultados salvos em: ${resultsFileName}`);

    // Contar linhas
    const lines = resultsContent.trim().split('\n');
    console.log(`📊 Total de resultados: ${lines.length}`);

    // Baixar arquivo de erros (se existir)
    if (batch.error_file_id) {
      console.log('\n⚠️  Arquivo de erros detectado');
      console.log(`📤 Arquivo de erros: ${batch.error_file_id}`);
      console.log('📥 Baixando arquivo de erros...');

      const errorResponse = await client.files.content(batch.error_file_id);
      const errorsContent = await errorResponse.text();

      const errorsFileName = `batch-${batchId}-errors.jsonl`;
      fs.writeFileSync(errorsFileName, errorsContent, 'utf-8');

      console.log(`✅ Erros salvos em: ${errorsFileName}`);

      const errorLines = errorsContent.trim().split('\n');
      console.log(`⚠️  Total de erros: ${errorLines.length}`);
    }

    console.log('\n='.repeat(80));
    console.log('✅ DOWNLOAD CONCLUÍDO');
    console.log('='.repeat(80));

    // Analisar resultados
    console.log('\n📊 ANÁLISE DOS RESULTADOS:\n');

    let successCount = 0;
    let errorCount = 0;

    for (const line of lines) {
      try {
        const result = JSON.parse(line);
        if (result.response && result.response.status_code === 200) {
          successCount++;
        } else if (result.error) {
          errorCount++;
        }
      } catch (e) {
        errorCount++;
      }
    }

    console.log(`✅ Sucesso: ${successCount}/${lines.length}`);
    console.log(`❌ Erros: ${errorCount}/${lines.length}`);

    if (successCount > 0) {
      console.log(`\n💡 Para processar e salvar no banco:`);
      console.log(`   npm run batch:process -- ${batchId}`);
    }

    console.log();

  } catch (error: any) {
    console.error('❌ Erro ao baixar resultados:', error.message);
    process.exit(1);
  }
}

downloadBatchResults().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
