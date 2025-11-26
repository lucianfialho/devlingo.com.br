/**
 * Verifica o status de um batch em processamento
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.MARITACA_API_KEY,
  baseURL: 'https://chat.maritaca.ai/api',
});

async function checkBatchStatus() {
  const batchId = process.argv[2];

  if (!batchId) {
    console.error('❌ Erro: Batch ID não fornecido');
    console.log('Uso: npm run batch:check -- <batch_id>');
    process.exit(1);
  }

  console.log(`🔍 Verificando status do batch: ${batchId}\n`);

  try {
    const batch = await client.batches.retrieve(batchId);

    console.log('='.repeat(80));
    console.log('📊 STATUS DO BATCH');
    console.log('='.repeat(80));
    console.log(`🆔 Batch ID: ${batch.id}`);
    console.log(`📄 Input File ID: ${batch.input_file_id}`);
    console.log(`📊 Status: ${batch.status}`);
    console.log();

    // Status details
    const statusEmoji: Record<string, string> = {
      validating: '⏳',
      failed: '❌',
      in_progress: '🔄',
      finalizing: '⏳',
      completed: '✅',
      expired: '⏰',
      cancelling: '🛑',
      cancelled: '🚫'
    };

    const statusMessage: Record<string, string> = {
      validating: 'Validando arquivo de entrada...',
      failed: 'Falha na validação do arquivo',
      in_progress: 'Processando requisições...',
      finalizing: 'Finalizando e preparando resultados...',
      completed: 'Concluído! Resultados prontos para download',
      expired: 'Expirado - não foi concluído em 24h',
      cancelling: 'Cancelando... (pode levar até 10 min)',
      cancelled: 'Cancelado'
    };

    console.log(`${statusEmoji[batch.status]} ${statusMessage[batch.status]}`);
    console.log();

    // Request counts
    if (batch.request_counts) {
      console.log('📈 PROGRESSO:');
      console.log(`   Total: ${batch.request_counts.total}`);
      console.log(`   Completas: ${batch.request_counts.completed}`);
      console.log(`   Falhadas: ${batch.request_counts.failed}`);

      if (batch.request_counts.total > 0) {
        const progress = (batch.request_counts.completed / batch.request_counts.total * 100).toFixed(1);
        console.log(`   Progresso: ${progress}%`);
      }
      console.log();
    }

    // Timestamps
    console.log('📅 TIMELINE:');
    console.log(`   Criado: ${new Date(batch.created_at * 1000).toLocaleString('pt-BR')}`);
    if (batch.in_progress_at) {
      console.log(`   Iniciado: ${new Date(batch.in_progress_at * 1000).toLocaleString('pt-BR')}`);
    }
    if (batch.completed_at) {
      console.log(`   Concluído: ${new Date(batch.completed_at * 1000).toLocaleString('pt-BR')}`);
    }
    if (batch.failed_at) {
      console.log(`   Falhou: ${new Date(batch.failed_at * 1000).toLocaleString('pt-BR')}`);
    }
    if (batch.expired_at) {
      console.log(`   Expirou: ${new Date(batch.expired_at * 1000).toLocaleString('pt-BR')}`);
    }
    console.log(`   Expira em: ${new Date(batch.expires_at * 1000).toLocaleString('pt-BR')}`);
    console.log();

    // Output files
    if (batch.output_file_id) {
      console.log('📤 ARQUIVOS DE SAÍDA:');
      console.log(`   ✅ Resultados: ${batch.output_file_id}`);
      if (batch.error_file_id) {
        console.log(`   ⚠️  Erros: ${batch.error_file_id}`);
      }
      console.log();
      console.log('💡 Para baixar os resultados:');
      console.log(`   npm run batch:download -- ${batch.id}`);
    }

    // Metadata
    if (batch.metadata) {
      console.log('📋 METADADOS:');
      Object.entries(batch.metadata).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      console.log();
    }

    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('❌ Erro ao verificar status:', error.message);
    process.exit(1);
  }
}

checkBatchStatus().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
