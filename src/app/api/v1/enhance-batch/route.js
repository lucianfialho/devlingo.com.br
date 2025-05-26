import redisClient from "@/lib/redisClient";
import { NextResponse } from "next/server";

export const POST = async (request) => {
  try {
    const { terms = [], maxConcurrent = 1 } = await request.json();
    
    if (!terms.length) {
      return NextResponse.json(
        { success: false, error: "Nenhum termo fornecido" },
        { status: 400 }
      );
    }
    
    // Iniciar processo em background
    processBatchEnhancement(terms, maxConcurrent);
    
    return NextResponse.json({ 
      success: true, 
      message: `Processo de aprimoramento iniciado para ${terms.length} termos`,
      termsSubmitted: terms
    });
    
  } catch (error) {
    console.error("❌ Erro ao iniciar aprimoramento em lote:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao iniciar aprimoramento: " + error.message },
      { status: 500 }
    );
  }
};

// Função para processar o aprimoramento em lote
async function processBatchEnhancement(terms, maxConcurrent) {
  // Flag para tracking
  await redisClient.set("enhance:batch:status", JSON.stringify({
    inProgress: true,
    total: terms.length,
    completed: 0,
    failed: 0,
    startedAt: new Date().toISOString(),
    terms
  }));
  
  // Processar em chunks para não sobrecarregar
  for (let i = 0; i < terms.length; i += maxConcurrent) {
    const chunk = terms.slice(i, i + maxConcurrent);
    console.log(`⏳ Processando lote ${i/maxConcurrent + 1}/${Math.ceil(terms.length/maxConcurrent)}`);
    
    // Executar em paralelo com limitação
    await Promise.all(chunk.map(async (term) => {
      try {
        console.log(`🔄 Aprimorando: ${term}`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/v1/enhance/${term}`, {
          method: 'GET',
        });
        
        if (!response.ok) {
          throw new Error(`Falha ao aprimorar ${term}: ${response.statusText}`);
        }
        
        // Atualizar status
        const status = JSON.parse(await redisClient.get("enhance:batch:status"));
        status.completed += 1;
        await redisClient.set("enhance:batch:status", JSON.stringify(status));
        
        console.log(`✅ Aprimorado: ${term}`);
      } catch (error) {
        console.error(`❌ Erro ao aprimorar ${term}:`, error);
        
        // Atualizar status de erro
        const status = JSON.parse(await redisClient.get("enhance:batch:status"));
        status.failed += 1;
        await redisClient.set("enhance:batch:status", JSON.stringify(status));
      }
    }));
    
    // Aguardar um pouco entre lotes para evitar sobrecarga
    if (i + maxConcurrent < terms.length) {
      console.log("😴 Aguardando 30 segundos antes do próximo lote...");
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  
  // Finalizar processo
  const finalStatus = JSON.parse(await redisClient.get("enhance:batch:status"));
  finalStatus.inProgress = false;
  finalStatus.finishedAt = new Date().toISOString();
  await redisClient.set("enhance:batch:status", JSON.stringify(finalStatus));
  
  console.log(`🎉 Processo de aprimoramento em lote concluído!`);
  console.log(`📊 Resultados: ${finalStatus.completed} concluídos, ${finalStatus.failed} falhas`);
}